/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
import { missingEvent, missingTrigger, transitionFailed, triggerTransitionsFailed, unregisteredTrigger, unsupportedTriggerEvent } from '../error_helpers';
import { copyObj, ENTER_CLASSNAME, eraseStyles, LEAVE_CLASSNAME, NG_ANIMATING_CLASSNAME, NG_ANIMATING_SELECTOR, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, setStyles } from '../util';
import { getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
const QUEUED_CLASSNAME = 'ng-animate-queued';
const QUEUED_SELECTOR = '.ng-animate-queued';
const DISABLED_CLASSNAME = 'ng-animate-disabled';
const DISABLED_SELECTOR = '.ng-animate-disabled';
const STAR_CLASSNAME = 'ng-star-inserted';
const STAR_SELECTOR = '.ng-star-inserted';
const EMPTY_PLAYER_ARRAY = [];
const NULL_REMOVAL_STATE = {
    namespaceId: '',
    setForRemoval: false,
    setForMove: false,
    hasAnimation: false,
    removedBeforeQueried: false
};
const NULL_REMOVED_QUERIED_STATE = {
    namespaceId: '',
    setForMove: false,
    setForRemoval: false,
    hasAnimation: false,
    removedBeforeQueried: true
};
export const REMOVAL_FLAG = '__ng_removed';
export class StateValue {
    constructor(input, namespaceId = '') {
        this.namespaceId = namespaceId;
        const isObj = input && input.hasOwnProperty('value');
        const value = isObj ? input['value'] : input;
        this.value = normalizeTriggerValue(value);
        if (isObj) {
            const options = copyObj(input);
            delete options['value'];
            this.options = options;
        }
        else {
            this.options = {};
        }
        if (!this.options.params) {
            this.options.params = {};
        }
    }
    get params() {
        return this.options.params;
    }
    absorbOptions(options) {
        const newParams = options.params;
        if (newParams) {
            const oldParams = this.options.params;
            Object.keys(newParams).forEach(prop => {
                if (oldParams[prop] == null) {
                    oldParams[prop] = newParams[prop];
                }
            });
        }
    }
}
export const VOID_VALUE = 'void';
export const DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
export class AnimationTransitionNamespace {
    constructor(id, hostElement, _engine) {
        this.id = id;
        this.hostElement = hostElement;
        this._engine = _engine;
        this.players = [];
        this._triggers = {};
        this._queue = [];
        this._elementListeners = new Map();
        this._hostClassName = 'ng-tns-' + id;
        addClass(hostElement, this._hostClassName);
    }
    listen(element, name, phase, callback) {
        if (!this._triggers.hasOwnProperty(name)) {
            throw missingTrigger(phase, name);
        }
        if (phase == null || phase.length == 0) {
            throw missingEvent(name);
        }
        if (!isTriggerEventValid(phase)) {
            throw unsupportedTriggerEvent(phase, name);
        }
        const listeners = getOrSetAsInMap(this._elementListeners, element, []);
        const data = { name, phase, callback };
        listeners.push(data);
        const triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
        if (!triggersWithStates.hasOwnProperty(name)) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + name);
            triggersWithStates[name] = DEFAULT_STATE_VALUE;
        }
        return () => {
            // the event listener is removed AFTER the flush has occurred such
            // that leave animations callbacks can fire (otherwise if the node
            // is removed in between then the listeners would be deregistered)
            this._engine.afterFlush(() => {
                const index = listeners.indexOf(data);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
                if (!this._triggers[name]) {
                    delete triggersWithStates[name];
                }
            });
        };
    }
    register(name, ast) {
        if (this._triggers[name]) {
            // throw
            return false;
        }
        else {
            this._triggers[name] = ast;
            return true;
        }
    }
    _getTrigger(name) {
        const trigger = this._triggers[name];
        if (!trigger) {
            throw unregisteredTrigger(name);
        }
        return trigger;
    }
    trigger(element, triggerName, value, defaultToFallback = true) {
        const trigger = this._getTrigger(triggerName);
        const player = new TransitionAnimationPlayer(this.id, triggerName, element);
        let triggersWithStates = this._engine.statesByElement.get(element);
        if (!triggersWithStates) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + triggerName);
            this._engine.statesByElement.set(element, triggersWithStates = {});
        }
        let fromState = triggersWithStates[triggerName];
        const toState = new StateValue(value, this.id);
        const isObj = value && value.hasOwnProperty('value');
        if (!isObj && fromState) {
            toState.absorbOptions(fromState.options);
        }
        triggersWithStates[triggerName] = toState;
        if (!fromState) {
            fromState = DEFAULT_STATE_VALUE;
        }
        const isRemoval = toState.value === VOID_VALUE;
        // normally this isn't reached by here, however, if an object expression
        // is passed in then it may be a new object each time. Comparing the value
        // is important since that will stay the same despite there being a new object.
        // The removal arc here is special cased because the same element is triggered
        // twice in the event that it contains animations on the outer/inner portions
        // of the host container
        if (!isRemoval && fromState.value === toState.value) {
            // this means that despite the value not changing, some inner params
            // have changed which means that the animation final styles need to be applied
            if (!objEquals(fromState.params, toState.params)) {
                const errors = [];
                const fromStyles = trigger.matchStyles(fromState.value, fromState.params, errors);
                const toStyles = trigger.matchStyles(toState.value, toState.params, errors);
                if (errors.length) {
                    this._engine.reportError(errors);
                }
                else {
                    this._engine.afterFlush(() => {
                        eraseStyles(element, fromStyles);
                        setStyles(element, toStyles);
                    });
                }
            }
            return;
        }
        const playersOnElement = getOrSetAsInMap(this._engine.playersByElement, element, []);
        playersOnElement.forEach(player => {
            // only remove the player if it is queued on the EXACT same trigger/namespace
            // we only also deal with queued players here because if the animation has
            // started then we want to keep the player alive until the flush happens
            // (which is where the previousPlayers are passed into the new player)
            if (player.namespaceId == this.id && player.triggerName == triggerName && player.queued) {
                player.destroy();
            }
        });
        let transition = trigger.matchTransition(fromState.value, toState.value, element, toState.params);
        let isFallbackTransition = false;
        if (!transition) {
            if (!defaultToFallback)
                return;
            transition = trigger.fallbackTransition;
            isFallbackTransition = true;
        }
        this._engine.totalQueuedPlayers++;
        this._queue.push({ element, triggerName, transition, fromState, toState, player, isFallbackTransition });
        if (!isFallbackTransition) {
            addClass(element, QUEUED_CLASSNAME);
            player.onStart(() => {
                removeClass(element, QUEUED_CLASSNAME);
            });
        }
        player.onDone(() => {
            let index = this.players.indexOf(player);
            if (index >= 0) {
                this.players.splice(index, 1);
            }
            const players = this._engine.playersByElement.get(element);
            if (players) {
                let index = players.indexOf(player);
                if (index >= 0) {
                    players.splice(index, 1);
                }
            }
        });
        this.players.push(player);
        playersOnElement.push(player);
        return player;
    }
    deregister(name) {
        delete this._triggers[name];
        this._engine.statesByElement.forEach((stateMap, element) => {
            delete stateMap[name];
        });
        this._elementListeners.forEach((listeners, element) => {
            this._elementListeners.set(element, listeners.filter(entry => {
                return entry.name != name;
            }));
        });
    }
    clearElementCache(element) {
        this._engine.statesByElement.delete(element);
        this._elementListeners.delete(element);
        const elementPlayers = this._engine.playersByElement.get(element);
        if (elementPlayers) {
            elementPlayers.forEach(player => player.destroy());
            this._engine.playersByElement.delete(element);
        }
    }
    _signalRemovalForInnerTriggers(rootElement, context) {
        const elements = this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true);
        // emulate a leave animation for all inner nodes within this node.
        // If there are no animations found for any of the nodes then clear the cache
        // for the element.
        elements.forEach(elm => {
            // this means that an inner remove() operation has already kicked off
            // the animation on this element...
            if (elm[REMOVAL_FLAG])
                return;
            const namespaces = this._engine.fetchNamespacesByElement(elm);
            if (namespaces.size) {
                namespaces.forEach(ns => ns.triggerLeaveAnimation(elm, context, false, true));
            }
            else {
                this.clearElementCache(elm);
            }
        });
        // If the child elements were removed along with the parent, their animations might not
        // have completed. Clear all the elements from the cache so we don't end up with a memory leak.
        this._engine.afterFlushAnimationsDone(() => elements.forEach(elm => this.clearElementCache(elm)));
    }
    triggerLeaveAnimation(element, context, destroyAfterComplete, defaultToFallback) {
        const triggerStates = this._engine.statesByElement.get(element);
        const previousTriggersValues = new Map();
        if (triggerStates) {
            const players = [];
            Object.keys(triggerStates).forEach(triggerName => {
                previousTriggersValues.set(triggerName, triggerStates[triggerName].value);
                // this check is here in the event that an element is removed
                // twice (both on the host level and the component level)
                if (this._triggers[triggerName]) {
                    const player = this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
                    if (player) {
                        players.push(player);
                    }
                }
            });
            if (players.length) {
                this._engine.markElementAsRemoved(this.id, element, true, context, previousTriggersValues);
                if (destroyAfterComplete) {
                    optimizeGroupPlayer(players).onDone(() => this._engine.processLeaveNode(element));
                }
                return true;
            }
        }
        return false;
    }
    prepareLeaveAnimationListeners(element) {
        const listeners = this._elementListeners.get(element);
        const elementStates = this._engine.statesByElement.get(element);
        // if this statement fails then it means that the element was picked up
        // by an earlier flush (or there are no listeners at all to track the leave).
        if (listeners && elementStates) {
            const visitedTriggers = new Set();
            listeners.forEach(listener => {
                const triggerName = listener.name;
                if (visitedTriggers.has(triggerName))
                    return;
                visitedTriggers.add(triggerName);
                const trigger = this._triggers[triggerName];
                const transition = trigger.fallbackTransition;
                const fromState = elementStates[triggerName] || DEFAULT_STATE_VALUE;
                const toState = new StateValue(VOID_VALUE);
                const player = new TransitionAnimationPlayer(this.id, triggerName, element);
                this._engine.totalQueuedPlayers++;
                this._queue.push({
                    element,
                    triggerName,
                    transition,
                    fromState,
                    toState,
                    player,
                    isFallbackTransition: true
                });
            });
        }
    }
    removeNode(element, context) {
        const engine = this._engine;
        if (element.childElementCount) {
            this._signalRemovalForInnerTriggers(element, context);
        }
        // this means that a * => VOID animation was detected and kicked off
        if (this.triggerLeaveAnimation(element, context, true))
            return;
        // find the player that is animating and make sure that the
        // removal is delayed until that player has completed
        let containsPotentialParentTransition = false;
        if (engine.totalAnimations) {
            const currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
            // when this `if statement` does not continue forward it means that
            // a previous animation query has selected the current element and
            // is animating it. In this situation want to continue forwards and
            // allow the element to be queued up for animation later.
            if (currentPlayers && currentPlayers.length) {
                containsPotentialParentTransition = true;
            }
            else {
                let parent = element;
                while (parent = parent.parentNode) {
                    const triggers = engine.statesByElement.get(parent);
                    if (triggers) {
                        containsPotentialParentTransition = true;
                        break;
                    }
                }
            }
        }
        // at this stage we know that the element will either get removed
        // during flush or will be picked up by a parent query. Either way
        // we need to fire the listeners for this element when it DOES get
        // removed (once the query parent animation is done or after flush)
        this.prepareLeaveAnimationListeners(element);
        // whether or not a parent has an animation we need to delay the deferral of the leave
        // operation until we have more information (which we do after flush() has been called)
        if (containsPotentialParentTransition) {
            engine.markElementAsRemoved(this.id, element, false, context);
        }
        else {
            const removalFlag = element[REMOVAL_FLAG];
            if (!removalFlag || removalFlag === NULL_REMOVAL_STATE) {
                // we do this after the flush has occurred such
                // that the callbacks can be fired
                engine.afterFlush(() => this.clearElementCache(element));
                engine.destroyInnerAnimations(element);
                engine._onRemovalComplete(element, context);
            }
        }
    }
    insertNode(element, parent) {
        addClass(element, this._hostClassName);
    }
    drainQueuedTransitions(microtaskId) {
        const instructions = [];
        this._queue.forEach(entry => {
            const player = entry.player;
            if (player.destroyed)
                return;
            const element = entry.element;
            const listeners = this._elementListeners.get(element);
            if (listeners) {
                listeners.forEach((listener) => {
                    if (listener.name == entry.triggerName) {
                        const baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
                        baseEvent['_data'] = microtaskId;
                        listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
                    }
                });
            }
            if (player.markedForDestroy) {
                this._engine.afterFlush(() => {
                    // now we can destroy the element properly since the event listeners have
                    // been bound to the player
                    player.destroy();
                });
            }
            else {
                instructions.push(entry);
            }
        });
        this._queue = [];
        return instructions.sort((a, b) => {
            // if depCount == 0 them move to front
            // otherwise if a contains b then move back
            const d0 = a.transition.ast.depCount;
            const d1 = b.transition.ast.depCount;
            if (d0 == 0 || d1 == 0) {
                return d0 - d1;
            }
            return this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
        });
    }
    destroy(context) {
        this.players.forEach(p => p.destroy());
        this._signalRemovalForInnerTriggers(this.hostElement, context);
    }
    elementContainsData(element) {
        let containsData = false;
        if (this._elementListeners.has(element))
            containsData = true;
        containsData =
            (this._queue.find(entry => entry.element === element) ? true : false) || containsData;
        return containsData;
    }
}
export class TransitionAnimationEngine {
    constructor(bodyNode, driver, _normalizer) {
        this.bodyNode = bodyNode;
        this.driver = driver;
        this._normalizer = _normalizer;
        this.players = [];
        this.newHostElements = new Map();
        this.playersByElement = new Map();
        this.playersByQueriedElement = new Map();
        this.statesByElement = new Map();
        this.disabledNodes = new Set();
        this.totalAnimations = 0;
        this.totalQueuedPlayers = 0;
        this._namespaceLookup = {};
        this._namespaceList = [];
        this._flushFns = [];
        this._whenQuietFns = [];
        this.namespacesByHostElement = new Map();
        this.collectedEnterElements = [];
        this.collectedLeaveElements = [];
        // this method is designed to be overridden by the code that uses this engine
        this.onRemovalComplete = (element, context) => { };
    }
    /** @internal */
    _onRemovalComplete(element, context) {
        this.onRemovalComplete(element, context);
    }
    get queuedPlayers() {
        const players = [];
        this._namespaceList.forEach(ns => {
            ns.players.forEach(player => {
                if (player.queued) {
                    players.push(player);
                }
            });
        });
        return players;
    }
    createNamespace(namespaceId, hostElement) {
        const ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
        if (this.bodyNode && this.driver.containsElement(this.bodyNode, hostElement)) {
            this._balanceNamespaceList(ns, hostElement);
        }
        else {
            // defer this later until flush during when the host element has
            // been inserted so that we know exactly where to place it in
            // the namespace list
            this.newHostElements.set(hostElement, ns);
            // given that this host element is a part of the animation code, it
            // may or may not be inserted by a parent node that is of an
            // animation renderer type. If this happens then we can still have
            // access to this item when we query for :enter nodes. If the parent
            // is a renderer then the set data-structure will normalize the entry
            this.collectEnterElement(hostElement);
        }
        return this._namespaceLookup[namespaceId] = ns;
    }
    _balanceNamespaceList(ns, hostElement) {
        const limit = this._namespaceList.length - 1;
        if (limit >= 0) {
            let found = false;
            for (let i = limit; i >= 0; i--) {
                const nextNamespace = this._namespaceList[i];
                if (this.driver.containsElement(nextNamespace.hostElement, hostElement)) {
                    this._namespaceList.splice(i + 1, 0, ns);
                    found = true;
                    break;
                }
            }
            if (!found) {
                this._namespaceList.splice(0, 0, ns);
            }
        }
        else {
            this._namespaceList.push(ns);
        }
        this.namespacesByHostElement.set(hostElement, ns);
        return ns;
    }
    register(namespaceId, hostElement) {
        let ns = this._namespaceLookup[namespaceId];
        if (!ns) {
            ns = this.createNamespace(namespaceId, hostElement);
        }
        return ns;
    }
    registerTrigger(namespaceId, name, trigger) {
        let ns = this._namespaceLookup[namespaceId];
        if (ns && ns.register(name, trigger)) {
            this.totalAnimations++;
        }
    }
    destroy(namespaceId, context) {
        if (!namespaceId)
            return;
        const ns = this._fetchNamespace(namespaceId);
        this.afterFlush(() => {
            this.namespacesByHostElement.delete(ns.hostElement);
            delete this._namespaceLookup[namespaceId];
            const index = this._namespaceList.indexOf(ns);
            if (index >= 0) {
                this._namespaceList.splice(index, 1);
            }
        });
        this.afterFlushAnimationsDone(() => ns.destroy(context));
    }
    _fetchNamespace(id) {
        return this._namespaceLookup[id];
    }
    fetchNamespacesByElement(element) {
        // normally there should only be one namespace per element, however
        // if @triggers are placed on both the component element and then
        // its host element (within the component code) then there will be
        // two namespaces returned. We use a set here to simply deduplicate
        // the namespaces in case (for the reason described above) there are multiple triggers
        const namespaces = new Set();
        const elementStates = this.statesByElement.get(element);
        if (elementStates) {
            const keys = Object.keys(elementStates);
            for (let i = 0; i < keys.length; i++) {
                const nsId = elementStates[keys[i]].namespaceId;
                if (nsId) {
                    const ns = this._fetchNamespace(nsId);
                    if (ns) {
                        namespaces.add(ns);
                    }
                }
            }
        }
        return namespaces;
    }
    trigger(namespaceId, element, name, value) {
        if (isElementNode(element)) {
            const ns = this._fetchNamespace(namespaceId);
            if (ns) {
                ns.trigger(element, name, value);
                return true;
            }
        }
        return false;
    }
    insertNode(namespaceId, element, parent, insertBefore) {
        if (!isElementNode(element))
            return;
        // special case for when an element is removed and reinserted (move operation)
        // when this occurs we do not want to use the element for deletion later
        const details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            details.setForRemoval = false;
            details.setForMove = true;
            const index = this.collectedLeaveElements.indexOf(element);
            if (index >= 0) {
                this.collectedLeaveElements.splice(index, 1);
            }
        }
        // in the event that the namespaceId is blank then the caller
        // code does not contain any animation code in it, but it is
        // just being called so that the node is marked as being inserted
        if (namespaceId) {
            const ns = this._fetchNamespace(namespaceId);
            // This if-statement is a workaround for router issue #21947.
            // The router sometimes hits a race condition where while a route
            // is being instantiated a new navigation arrives, triggering leave
            // animation of DOM that has not been fully initialized, until this
            // is resolved, we need to handle the scenario when DOM is not in a
            // consistent state during the animation.
            if (ns) {
                ns.insertNode(element, parent);
            }
        }
        // only *directives and host elements are inserted before
        if (insertBefore) {
            this.collectEnterElement(element);
        }
    }
    collectEnterElement(element) {
        this.collectedEnterElements.push(element);
    }
    markElementAsDisabled(element, value) {
        if (value) {
            if (!this.disabledNodes.has(element)) {
                this.disabledNodes.add(element);
                addClass(element, DISABLED_CLASSNAME);
            }
        }
        else if (this.disabledNodes.has(element)) {
            this.disabledNodes.delete(element);
            removeClass(element, DISABLED_CLASSNAME);
        }
    }
    removeNode(namespaceId, element, isHostElement, context) {
        if (isElementNode(element)) {
            const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
            if (ns) {
                ns.removeNode(element, context);
            }
            else {
                this.markElementAsRemoved(namespaceId, element, false, context);
            }
            if (isHostElement) {
                const hostNS = this.namespacesByHostElement.get(element);
                if (hostNS && hostNS.id !== namespaceId) {
                    hostNS.removeNode(element, context);
                }
            }
        }
        else {
            this._onRemovalComplete(element, context);
        }
    }
    markElementAsRemoved(namespaceId, element, hasAnimation, context, previousTriggersValues) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] = {
            namespaceId,
            setForRemoval: context,
            hasAnimation,
            removedBeforeQueried: false,
            previousTriggersValues
        };
    }
    listen(namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return () => { };
    }
    _buildInstruction(entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
    }
    destroyInnerAnimations(containerElement) {
        let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
        elements.forEach(element => this.destroyActiveAnimationsForElement(element));
        if (this.playersByQueriedElement.size == 0)
            return;
        elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
        elements.forEach(element => this.finishActiveQueriedAnimationOnElement(element));
    }
    destroyActiveAnimationsForElement(element) {
        const players = this.playersByElement.get(element);
        if (players) {
            players.forEach(player => {
                // special case for when an element is set for destruction, but hasn't started.
                // in this situation we want to delay the destruction until the flush occurs
                // so that any event listeners attached to the player are triggered.
                if (player.queued) {
                    player.markedForDestroy = true;
                }
                else {
                    player.destroy();
                }
            });
        }
    }
    finishActiveQueriedAnimationOnElement(element) {
        const players = this.playersByQueriedElement.get(element);
        if (players) {
            players.forEach(player => player.finish());
        }
    }
    whenRenderingDone() {
        return new Promise(resolve => {
            if (this.players.length) {
                return optimizeGroupPlayer(this.players).onDone(() => resolve());
            }
            else {
                resolve();
            }
        });
    }
    processLeaveNode(element) {
        const details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            // this will prevent it from removing it twice
            element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
            if (details.namespaceId) {
                this.destroyInnerAnimations(element);
                const ns = this._fetchNamespace(details.namespaceId);
                if (ns) {
                    ns.clearElementCache(element);
                }
            }
            this._onRemovalComplete(element, details.setForRemoval);
        }
        if (element.classList?.contains(DISABLED_CLASSNAME)) {
            this.markElementAsDisabled(element, false);
        }
        this.driver.query(element, DISABLED_SELECTOR, true).forEach(node => {
            this.markElementAsDisabled(node, false);
        });
    }
    flush(microtaskId = -1) {
        let players = [];
        if (this.newHostElements.size) {
            this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
            this.newHostElements.clear();
        }
        if (this.totalAnimations && this.collectedEnterElements.length) {
            for (let i = 0; i < this.collectedEnterElements.length; i++) {
                const elm = this.collectedEnterElements[i];
                addClass(elm, STAR_CLASSNAME);
            }
        }
        if (this._namespaceList.length &&
            (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
            const cleanupFns = [];
            try {
                players = this._flushAnimations(cleanupFns, microtaskId);
            }
            finally {
                for (let i = 0; i < cleanupFns.length; i++) {
                    cleanupFns[i]();
                }
            }
        }
        else {
            for (let i = 0; i < this.collectedLeaveElements.length; i++) {
                const element = this.collectedLeaveElements[i];
                this.processLeaveNode(element);
            }
        }
        this.totalQueuedPlayers = 0;
        this.collectedEnterElements.length = 0;
        this.collectedLeaveElements.length = 0;
        this._flushFns.forEach(fn => fn());
        this._flushFns = [];
        if (this._whenQuietFns.length) {
            // we move these over to a variable so that
            // if any new callbacks are registered in another
            // flush they do not populate the existing set
            const quietFns = this._whenQuietFns;
            this._whenQuietFns = [];
            if (players.length) {
                optimizeGroupPlayer(players).onDone(() => {
                    quietFns.forEach(fn => fn());
                });
            }
            else {
                quietFns.forEach(fn => fn());
            }
        }
    }
    reportError(errors) {
        throw triggerTransitionsFailed(errors);
    }
    _flushAnimations(cleanupFns, microtaskId) {
        const subTimelines = new ElementInstructionMap();
        const skippedPlayers = [];
        const skippedPlayersMap = new Map();
        const queuedInstructions = [];
        const queriedElements = new Map();
        const allPreStyleElements = new Map();
        const allPostStyleElements = new Map();
        const disabledElementsSet = new Set();
        this.disabledNodes.forEach(node => {
            disabledElementsSet.add(node);
            const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
            for (let i = 0; i < nodesThatAreDisabled.length; i++) {
                disabledElementsSet.add(nodesThatAreDisabled[i]);
            }
        });
        const bodyNode = this.bodyNode;
        const allTriggerElements = Array.from(this.statesByElement.keys());
        const enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
        // this must occur before the instructions are built below such that
        // the :enter queries match the elements (since the timeline queries
        // are fired during instruction building).
        const enterNodeMapIds = new Map();
        let i = 0;
        enterNodeMap.forEach((nodes, root) => {
            const className = ENTER_CLASSNAME + i++;
            enterNodeMapIds.set(root, className);
            nodes.forEach(node => addClass(node, className));
        });
        const allLeaveNodes = [];
        const mergedLeaveNodes = new Set();
        const leaveNodesWithoutAnimations = new Set();
        for (let i = 0; i < this.collectedLeaveElements.length; i++) {
            const element = this.collectedLeaveElements[i];
            const details = element[REMOVAL_FLAG];
            if (details && details.setForRemoval) {
                allLeaveNodes.push(element);
                mergedLeaveNodes.add(element);
                if (details.hasAnimation) {
                    this.driver.query(element, STAR_SELECTOR, true).forEach(elm => mergedLeaveNodes.add(elm));
                }
                else {
                    leaveNodesWithoutAnimations.add(element);
                }
            }
        }
        const leaveNodeMapIds = new Map();
        const leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
        leaveNodeMap.forEach((nodes, root) => {
            const className = LEAVE_CLASSNAME + i++;
            leaveNodeMapIds.set(root, className);
            nodes.forEach(node => addClass(node, className));
        });
        cleanupFns.push(() => {
            enterNodeMap.forEach((nodes, root) => {
                const className = enterNodeMapIds.get(root);
                nodes.forEach(node => removeClass(node, className));
            });
            leaveNodeMap.forEach((nodes, root) => {
                const className = leaveNodeMapIds.get(root);
                nodes.forEach(node => removeClass(node, className));
            });
            allLeaveNodes.forEach(element => {
                this.processLeaveNode(element);
            });
        });
        const allPlayers = [];
        const erroneousTransitions = [];
        for (let i = this._namespaceList.length - 1; i >= 0; i--) {
            const ns = this._namespaceList[i];
            ns.drainQueuedTransitions(microtaskId).forEach(entry => {
                const player = entry.player;
                const element = entry.element;
                allPlayers.push(player);
                if (this.collectedEnterElements.length) {
                    const details = element[REMOVAL_FLAG];
                    // animations for move operations (elements being removed and reinserted,
                    // e.g. when the order of an *ngFor list changes) are currently not supported
                    if (details && details.setForMove) {
                        if (details.previousTriggersValues &&
                            details.previousTriggersValues.has(entry.triggerName)) {
                            const previousValue = details.previousTriggersValues.get(entry.triggerName);
                            // we need to restore the previous trigger value since the element has
                            // only been moved and hasn't actually left the DOM
                            const triggersWithStates = this.statesByElement.get(entry.element);
                            if (triggersWithStates && triggersWithStates[entry.triggerName]) {
                                triggersWithStates[entry.triggerName].value = previousValue;
                            }
                        }
                        player.destroy();
                        return;
                    }
                }
                const nodeIsOrphaned = !bodyNode || !this.driver.containsElement(bodyNode, element);
                const leaveClassName = leaveNodeMapIds.get(element);
                const enterClassName = enterNodeMapIds.get(element);
                const instruction = this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned);
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // even though the element may not be in the DOM, it may still
                // be added at a later point (due to the mechanics of content
                // projection and/or dynamic component insertion) therefore it's
                // important to still style the element.
                if (nodeIsOrphaned) {
                    player.onStart(() => eraseStyles(element, instruction.fromStyles));
                    player.onDestroy(() => setStyles(element, instruction.toStyles));
                    skippedPlayers.push(player);
                    return;
                }
                // if an unmatched transition is queued and ready to go
                // then it SHOULD NOT render an animation and cancel the
                // previously running animations.
                if (entry.isFallbackTransition) {
                    player.onStart(() => eraseStyles(element, instruction.fromStyles));
                    player.onDestroy(() => setStyles(element, instruction.toStyles));
                    skippedPlayers.push(player);
                    return;
                }
                // this means that if a parent animation uses this animation as a sub-trigger
                // then it will instruct the timeline builder not to add a player delay, but
                // instead stretch the first keyframe gap until the animation starts. This is
                // important in order to prevent extra initialization styles from being
                // required by the user for the animation.
                const timelines = [];
                instruction.timelines.forEach(tl => {
                    tl.stretchStartingKeyframe = true;
                    if (!this.disabledNodes.has(tl.element)) {
                        timelines.push(tl);
                    }
                });
                instruction.timelines = timelines;
                subTimelines.append(element, instruction.timelines);
                const tuple = { instruction, player, element };
                queuedInstructions.push(tuple);
                instruction.queriedElements.forEach(element => getOrSetAsInMap(queriedElements, element, []).push(player));
                instruction.preStyleProps.forEach((stringMap, element) => {
                    const props = Object.keys(stringMap);
                    if (props.length) {
                        let setVal = allPreStyleElements.get(element);
                        if (!setVal) {
                            allPreStyleElements.set(element, setVal = new Set());
                        }
                        props.forEach(prop => setVal.add(prop));
                    }
                });
                instruction.postStyleProps.forEach((stringMap, element) => {
                    const props = Object.keys(stringMap);
                    let setVal = allPostStyleElements.get(element);
                    if (!setVal) {
                        allPostStyleElements.set(element, setVal = new Set());
                    }
                    props.forEach(prop => setVal.add(prop));
                });
            });
        }
        if (erroneousTransitions.length) {
            const errors = [];
            erroneousTransitions.forEach(instruction => {
                errors.push(transitionFailed(instruction.triggerName, instruction.errors));
            });
            allPlayers.forEach(player => player.destroy());
            this.reportError(errors);
        }
        const allPreviousPlayersMap = new Map();
        // this map tells us which element in the DOM tree is contained by
        // which animation. Further down this map will get populated once
        // the players are built and in doing so we can use it to efficiently
        // figure out if a sub player is skipped due to a parent player having priority.
        const animationElementMap = new Map();
        queuedInstructions.forEach(entry => {
            const element = entry.element;
            if (subTimelines.has(element)) {
                animationElementMap.set(element, element);
                this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
            }
        });
        skippedPlayers.forEach(player => {
            const element = player.element;
            const previousPlayers = this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
            previousPlayers.forEach(prevPlayer => {
                getOrSetAsInMap(allPreviousPlayersMap, element, []).push(prevPlayer);
                prevPlayer.destroy();
            });
        });
        // this is a special case for nodes that will be removed either by
        // having their own leave animations or by being queried in a container
        // that will be removed once a parent animation is complete. The idea
        // here is that * styles must be identical to ! styles because of
        // backwards compatibility (* is also filled in by default in many places).
        // Otherwise * styles will return an empty value or "auto" since the element
        // passed to getComputedStyle will not be visible (since * === destination)
        const replaceNodes = allLeaveNodes.filter(node => {
            return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
        });
        // POST STAGE: fill the * styles
        const postStylesMap = new Map();
        const allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
        allLeaveQueriedNodes.forEach(node => {
            if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
                replaceNodes.push(node);
            }
        });
        // PRE STAGE: fill the ! styles
        const preStylesMap = new Map();
        enterNodeMap.forEach((nodes, root) => {
            cloakAndComputeStyles(preStylesMap, this.driver, new Set(nodes), allPreStyleElements, PRE_STYLE);
        });
        replaceNodes.forEach(node => {
            const post = postStylesMap.get(node);
            const pre = preStylesMap.get(node);
            postStylesMap.set(node, { ...post, ...pre });
        });
        const rootPlayers = [];
        const subPlayers = [];
        const NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
        queuedInstructions.forEach(entry => {
            const { element, player, instruction } = entry;
            // this means that it was never consumed by a parent animation which
            // means that it is independent and therefore should be set for animation
            if (subTimelines.has(element)) {
                if (disabledElementsSet.has(element)) {
                    player.onDestroy(() => setStyles(element, instruction.toStyles));
                    player.disabled = true;
                    player.overrideTotalTime(instruction.totalTime);
                    skippedPlayers.push(player);
                    return;
                }
                // this will flow up the DOM and query the map to figure out
                // if a parent animation has priority over it. In the situation
                // that a parent is detected then it will cancel the loop. If
                // nothing is detected, or it takes a few hops to find a parent,
                // then it will fill in the missing nodes and signal them as having
                // a detected parent (or a NO_PARENT value via a special constant).
                let parentWithAnimation = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
                if (animationElementMap.size > 1) {
                    let elm = element;
                    const parentsToAdd = [];
                    while (elm = elm.parentNode) {
                        const detectedParent = animationElementMap.get(elm);
                        if (detectedParent) {
                            parentWithAnimation = detectedParent;
                            break;
                        }
                        parentsToAdd.push(elm);
                    }
                    parentsToAdd.forEach(parent => animationElementMap.set(parent, parentWithAnimation));
                }
                const innerPlayer = this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
                player.setRealPlayer(innerPlayer);
                if (parentWithAnimation === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
                    rootPlayers.push(player);
                }
                else {
                    const parentPlayers = this.playersByElement.get(parentWithAnimation);
                    if (parentPlayers && parentPlayers.length) {
                        player.parentPlayer = optimizeGroupPlayer(parentPlayers);
                    }
                    skippedPlayers.push(player);
                }
            }
            else {
                eraseStyles(element, instruction.fromStyles);
                player.onDestroy(() => setStyles(element, instruction.toStyles));
                // there still might be a ancestor player animating this
                // element therefore we will still add it as a sub player
                // even if its animation may be disabled
                subPlayers.push(player);
                if (disabledElementsSet.has(element)) {
                    skippedPlayers.push(player);
                }
            }
        });
        // find all of the sub players' corresponding inner animation players
        subPlayers.forEach(player => {
            // even if no players are found for a sub animation it
            // will still complete itself after the next tick since it's Noop
            const playersForElement = skippedPlayersMap.get(player.element);
            if (playersForElement && playersForElement.length) {
                const innerPlayer = optimizeGroupPlayer(playersForElement);
                player.setRealPlayer(innerPlayer);
            }
        });
        // the reason why we don't actually play the animation is
        // because all that a skipped player is designed to do is to
        // fire the start/done transition callback events
        skippedPlayers.forEach(player => {
            if (player.parentPlayer) {
                player.syncPlayerEvents(player.parentPlayer);
            }
            else {
                player.destroy();
            }
        });
        // run through all of the queued removals and see if they
        // were picked up by a query. If not then perform the removal
        // operation right away unless a parent animation is ongoing.
        for (let i = 0; i < allLeaveNodes.length; i++) {
            const element = allLeaveNodes[i];
            const details = element[REMOVAL_FLAG];
            removeClass(element, LEAVE_CLASSNAME);
            // this means the element has a removal animation that is being
            // taken care of and therefore the inner elements will hang around
            // until that animation is over (or the parent queried animation)
            if (details && details.hasAnimation)
                continue;
            let players = [];
            // if this element is queried or if it contains queried children
            // then we want for the element not to be removed from the page
            // until the queried animations have finished
            if (queriedElements.size) {
                let queriedPlayerResults = queriedElements.get(element);
                if (queriedPlayerResults && queriedPlayerResults.length) {
                    players.push(...queriedPlayerResults);
                }
                let queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
                for (let j = 0; j < queriedInnerElements.length; j++) {
                    let queriedPlayers = queriedElements.get(queriedInnerElements[j]);
                    if (queriedPlayers && queriedPlayers.length) {
                        players.push(...queriedPlayers);
                    }
                }
            }
            const activePlayers = players.filter(p => !p.destroyed);
            if (activePlayers.length) {
                removeNodesAfterAnimationDone(this, element, activePlayers);
            }
            else {
                this.processLeaveNode(element);
            }
        }
        // this is required so the cleanup method doesn't remove them
        allLeaveNodes.length = 0;
        rootPlayers.forEach(player => {
            this.players.push(player);
            player.onDone(() => {
                player.destroy();
                const index = this.players.indexOf(player);
                this.players.splice(index, 1);
            });
            player.play();
        });
        return rootPlayers;
    }
    elementContainsData(namespaceId, element) {
        let containsData = false;
        const details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval)
            containsData = true;
        if (this.playersByElement.has(element))
            containsData = true;
        if (this.playersByQueriedElement.has(element))
            containsData = true;
        if (this.statesByElement.has(element))
            containsData = true;
        return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
    }
    afterFlush(callback) {
        this._flushFns.push(callback);
    }
    afterFlushAnimationsDone(callback) {
        this._whenQuietFns.push(callback);
    }
    _getPreviousPlayers(element, isQueriedElement, namespaceId, triggerName, toStateValue) {
        let players = [];
        if (isQueriedElement) {
            const queriedElementPlayers = this.playersByQueriedElement.get(element);
            if (queriedElementPlayers) {
                players = queriedElementPlayers;
            }
        }
        else {
            const elementPlayers = this.playersByElement.get(element);
            if (elementPlayers) {
                const isRemovalAnimation = !toStateValue || toStateValue == VOID_VALUE;
                elementPlayers.forEach(player => {
                    if (player.queued)
                        return;
                    if (!isRemovalAnimation && player.triggerName != triggerName)
                        return;
                    players.push(player);
                });
            }
        }
        if (namespaceId || triggerName) {
            players = players.filter(player => {
                if (namespaceId && namespaceId != player.namespaceId)
                    return false;
                if (triggerName && triggerName != player.triggerName)
                    return false;
                return true;
            });
        }
        return players;
    }
    _beforeAnimationBuild(namespaceId, instruction, allPreviousPlayersMap) {
        const triggerName = instruction.triggerName;
        const rootElement = instruction.element;
        // when a removal animation occurs, ALL previous players are collected
        // and destroyed (even if they are outside of the current namespace)
        const targetNameSpaceId = instruction.isRemovalTransition ? undefined : namespaceId;
        const targetTriggerName = instruction.isRemovalTransition ? undefined : triggerName;
        for (const timelineInstruction of instruction.timelines) {
            const element = timelineInstruction.element;
            const isQueriedElement = element !== rootElement;
            const players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
            const previousPlayers = this._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
            previousPlayers.forEach(player => {
                const realPlayer = player.getRealPlayer();
                if (realPlayer.beforeDestroy) {
                    realPlayer.beforeDestroy();
                }
                player.destroy();
                players.push(player);
            });
        }
        // this needs to be done so that the PRE/POST styles can be
        // computed properly without interfering with the previous animation
        eraseStyles(rootElement, instruction.fromStyles);
    }
    _buildAnimation(namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
        const triggerName = instruction.triggerName;
        const rootElement = instruction.element;
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        const allQueriedPlayers = [];
        const allConsumedElements = new Set();
        const allSubElements = new Set();
        const allNewPlayers = instruction.timelines.map(timelineInstruction => {
            const element = timelineInstruction.element;
            allConsumedElements.add(element);
            // FIXME (matsko): make sure to-be-removed animations are removed properly
            const details = element[REMOVAL_FLAG];
            if (details && details.removedBeforeQueried)
                return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
            const isQueriedElement = element !== rootElement;
            const previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY)
                .map(p => p.getRealPlayer()))
                .filter(p => {
                // the `element` is not apart of the AnimationPlayer definition, but
                // Mock/WebAnimations
                // use the element within their implementation. This will be added in Angular5 to
                // AnimationPlayer
                const pp = p;
                return pp.element ? pp.element === element : false;
            });
            const preStyles = preStylesMap.get(element);
            const postStyles = postStylesMap.get(element);
            const keyframes = normalizeKeyframes(this.driver, this._normalizer, element, timelineInstruction.keyframes, preStyles, postStyles);
            const player = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
            // this means that this particular player belongs to a sub trigger. It is
            // important that we match this player up with the corresponding (@trigger.listener)
            if (timelineInstruction.subTimeline && skippedPlayersMap) {
                allSubElements.add(element);
            }
            if (isQueriedElement) {
                const wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
                wrappedPlayer.setRealPlayer(player);
                allQueriedPlayers.push(wrappedPlayer);
            }
            return player;
        });
        allQueriedPlayers.forEach(player => {
            getOrSetAsInMap(this.playersByQueriedElement, player.element, []).push(player);
            player.onDone(() => deleteOrUnsetInMap(this.playersByQueriedElement, player.element, player));
        });
        allConsumedElements.forEach(element => addClass(element, NG_ANIMATING_CLASSNAME));
        const player = optimizeGroupPlayer(allNewPlayers);
        player.onDestroy(() => {
            allConsumedElements.forEach(element => removeClass(element, NG_ANIMATING_CLASSNAME));
            setStyles(rootElement, instruction.toStyles);
        });
        // this basically makes all of the callbacks for sub element animations
        // be dependent on the upper players for when they finish
        allSubElements.forEach(element => {
            getOrSetAsInMap(skippedPlayersMap, element, []).push(player);
        });
        return player;
    }
    _buildPlayer(instruction, keyframes, previousPlayers) {
        if (keyframes.length > 0) {
            return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
        }
        // special case for when an empty transition|definition is provided
        // ... there is no point in rendering an empty animation
        return new NoopAnimationPlayer(instruction.duration, instruction.delay);
    }
}
export class TransitionAnimationPlayer {
    constructor(namespaceId, triggerName, element) {
        this.namespaceId = namespaceId;
        this.triggerName = triggerName;
        this.element = element;
        this._player = new NoopAnimationPlayer();
        this._containsRealPlayer = false;
        this._queuedCallbacks = {};
        this.destroyed = false;
        this.markedForDestroy = false;
        this.disabled = false;
        this.queued = true;
        this.totalTime = 0;
    }
    setRealPlayer(player) {
        if (this._containsRealPlayer)
            return;
        this._player = player;
        Object.keys(this._queuedCallbacks).forEach(phase => {
            this._queuedCallbacks[phase].forEach(callback => listenOnPlayer(player, phase, undefined, callback));
        });
        this._queuedCallbacks = {};
        this._containsRealPlayer = true;
        this.overrideTotalTime(player.totalTime);
        this.queued = false;
    }
    getRealPlayer() {
        return this._player;
    }
    overrideTotalTime(totalTime) {
        this.totalTime = totalTime;
    }
    syncPlayerEvents(player) {
        const p = this._player;
        if (p.triggerCallback) {
            player.onStart(() => p.triggerCallback('start'));
        }
        player.onDone(() => this.finish());
        player.onDestroy(() => this.destroy());
    }
    _queueEvent(name, callback) {
        getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
    }
    onDone(fn) {
        if (this.queued) {
            this._queueEvent('done', fn);
        }
        this._player.onDone(fn);
    }
    onStart(fn) {
        if (this.queued) {
            this._queueEvent('start', fn);
        }
        this._player.onStart(fn);
    }
    onDestroy(fn) {
        if (this.queued) {
            this._queueEvent('destroy', fn);
        }
        this._player.onDestroy(fn);
    }
    init() {
        this._player.init();
    }
    hasStarted() {
        return this.queued ? false : this._player.hasStarted();
    }
    play() {
        !this.queued && this._player.play();
    }
    pause() {
        !this.queued && this._player.pause();
    }
    restart() {
        !this.queued && this._player.restart();
    }
    finish() {
        this._player.finish();
    }
    destroy() {
        this.destroyed = true;
        this._player.destroy();
    }
    reset() {
        !this.queued && this._player.reset();
    }
    setPosition(p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    }
    getPosition() {
        return this.queued ? 0 : this._player.getPosition();
    }
    /** @internal */
    triggerCallback(phaseName) {
        const p = this._player;
        if (p.triggerCallback) {
            p.triggerCallback(phaseName);
        }
    }
}
function deleteOrUnsetInMap(map, key, value) {
    let currentValues;
    if (map instanceof Map) {
        currentValues = map.get(key);
        if (currentValues) {
            if (currentValues.length) {
                const index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                map.delete(key);
            }
        }
    }
    else {
        currentValues = map[key];
        if (currentValues) {
            if (currentValues.length) {
                const index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                delete map[key];
            }
        }
    }
    return currentValues;
}
function normalizeTriggerValue(value) {
    // we use `!= null` here because it's the most simple
    // way to test against a "falsy" value without mixing
    // in empty strings or a zero value. DO NOT OPTIMIZE.
    return value != null ? value : null;
}
function isElementNode(node) {
    return node && node['nodeType'] === 1;
}
function isTriggerEventValid(eventName) {
    return eventName == 'start' || eventName == 'done';
}
function cloakElement(element, value) {
    const oldValue = element.style.display;
    element.style.display = value != null ? value : 'none';
    return oldValue;
}
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
    const cloakVals = [];
    elements.forEach(element => cloakVals.push(cloakElement(element)));
    const failedElements = [];
    elementPropsMap.forEach((props, element) => {
        const styles = {};
        props.forEach(prop => {
            const value = styles[prop] = driver.computeStyle(element, prop, defaultStyle);
            // there is no easy way to detect this because a sub element could be removed
            // by a parent animation element being detached.
            if (!value || value.length == 0) {
                element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
                failedElements.push(element);
            }
        });
        valuesMap.set(element, styles);
    });
    // we use a index variable here since Set.forEach(a, i) does not return
    // an index value for the closure (but instead just the value)
    let i = 0;
    elements.forEach(element => cloakElement(element, cloakVals[i++]));
    return failedElements;
}
/*
Since the Angular renderer code will return a collection of inserted
nodes in all areas of a DOM tree, it's up to this algorithm to figure
out which nodes are roots for each animation @trigger.

By placing each inserted node into a Set and traversing upwards, it
is possible to find the @trigger elements and well any direct *star
insertion nodes, if a @trigger root is found then the enter element
is placed into the Map[@trigger] spot.
 */
function buildRootMap(roots, nodes) {
    const rootMap = new Map();
    roots.forEach(root => rootMap.set(root, []));
    if (nodes.length == 0)
        return rootMap;
    const NULL_NODE = 1;
    const nodeSet = new Set(nodes);
    const localRootMap = new Map();
    function getRoot(node) {
        if (!node)
            return NULL_NODE;
        let root = localRootMap.get(node);
        if (root)
            return root;
        const parent = node.parentNode;
        if (rootMap.has(parent)) { // ngIf inside @trigger
            root = parent;
        }
        else if (nodeSet.has(parent)) { // ngIf inside ngIf
            root = NULL_NODE;
        }
        else { // recurse upwards
            root = getRoot(parent);
        }
        localRootMap.set(node, root);
        return root;
    }
    nodes.forEach(node => {
        const root = getRoot(node);
        if (root !== NULL_NODE) {
            rootMap.get(root).push(node);
        }
    });
    return rootMap;
}
function addClass(element, className) {
    element.classList?.add(className);
}
function removeClass(element, className) {
    element.classList?.remove(className);
}
function removeNodesAfterAnimationDone(engine, element, players) {
    optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
}
function flattenGroupPlayers(players) {
    const finalPlayers = [];
    _flattenGroupPlayersRecur(players, finalPlayers);
    return finalPlayers;
}
function _flattenGroupPlayersRecur(players, finalPlayers) {
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player instanceof AnimationGroupPlayer) {
            _flattenGroupPlayersRecur(player.players, finalPlayers);
        }
        else {
            finalPlayers.push(player);
        }
    }
}
function objEquals(a, b) {
    const k1 = Object.keys(a);
    const k2 = Object.keys(b);
    if (k1.length != k2.length)
        return false;
    for (let i = 0; i < k1.length; i++) {
        const prop = k1[i];
        if (!b.hasOwnProperty(prop) || a[prop] !== b[prop])
            return false;
    }
    return true;
}
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
    const postEntry = allPostStyleElements.get(element);
    if (!postEntry)
        return false;
    let preEntry = allPreStyleElements.get(element);
    if (preEntry) {
        postEntry.forEach(data => preEntry.add(data));
    }
    else {
        allPreStyleElements.set(element, postEntry);
    }
    allPostStyleElements.delete(element);
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBb0MsVUFBVSxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixJQUFJLG9CQUFvQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQU0zTCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxPQUFPLEVBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3hKLE9BQU8sRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBbUIsZUFBZSxFQUFFLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUdyTSxPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUV0SCxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0FBQzdDLE1BQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDO0FBQzdDLE1BQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7QUFDakQsTUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNqRCxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUMxQyxNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQztBQUUxQyxNQUFNLGtCQUFrQixH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LENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxNQUFNO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7S0FDbEU7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUMzQixPQUFZLEVBQUUsbUJBQTBDLEVBQ3hELG9CQUEyQztJQUM3QyxNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUU3QixJQUFJLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsSUFBSSxRQUFRLEVBQUU7UUFDWixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hEO1NBQU07UUFDTCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIEFVVE9fU1RZTEUsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIgYXMgQW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeX0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi4vZHNsL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge21pc3NpbmdFdmVudCwgbWlzc2luZ1RyaWdnZXIsIHRyYW5zaXRpb25GYWlsZWQsIHRyaWdnZXJUcmFuc2l0aW9uc0ZhaWxlZCwgdW5yZWdpc3RlcmVkVHJpZ2dlciwgdW5zdXBwb3J0ZWRUcmlnZ2VyRXZlbnR9IGZyb20gJy4uL2Vycm9yX2hlbHBlcnMnO1xuaW1wb3J0IHtjb3B5T2JqLCBFTlRFUl9DTEFTU05BTUUsIGVyYXNlU3R5bGVzLCBpdGVyYXRvclRvQXJyYXksIExFQVZFX0NMQVNTTkFNRSwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCBOR19UUklHR0VSX0NMQVNTTkFNRSwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgc2V0U3R5bGVzfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0QXNJbk1hcCwgbGlzdGVuT25QbGF5ZXIsIG1ha2VBbmltYXRpb25FdmVudCwgbm9ybWFsaXplS2V5ZnJhbWVzLCBvcHRpbWl6ZUdyb3VwUGxheWVyfSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IFFVRVVFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgUVVFVUVEX1NFTEVDVE9SID0gJy5uZy1hbmltYXRlLXF1ZXVlZCc7XG5jb25zdCBESVNBQkxFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBESVNBQkxFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBTVEFSX0NMQVNTTkFNRSA9ICduZy1zdGFyLWluc2VydGVkJztcbmNvbnN0IFNUQVJfU0VMRUNUT1IgPSAnLm5nLXN0YXItaW5zZXJ0ZWQnO1xuXG5jb25zdCBFTVBUWV9QTEFZRVJfQVJSQVk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuY29uc3QgTlVMTF9SRU1PVkFMX1NUQVRFOiBFbGVtZW50QW5pbWF0aW9uU3RhdGUgPSB7XG4gIG5hbWVzcGFjZUlkOiAnJyxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBoYXNBbmltYXRpb246IGZhbHNlLFxuICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2Vcbn07XG5jb25zdCBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBzZXRGb3JSZW1vdmFsOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IHRydWVcbn07XG5cbmludGVyZmFjZSBUcmlnZ2VyTGlzdGVuZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBoYXNlOiBzdHJpbmc7XG4gIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSW5zdHJ1Y3Rpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIHRyaWdnZXJOYW1lOiBzdHJpbmc7XG4gIGZyb21TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdG9TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdHJhbnNpdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnk7XG4gIHBsYXllcjogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcjtcbiAgaXNGYWxsYmFja1RyYW5zaXRpb246IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBSRU1PVkFMX0ZMQUcgPSAnX19uZ19yZW1vdmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50QW5pbWF0aW9uU3RhdGUge1xuICBzZXRGb3JSZW1vdmFsOiBib29sZWFuO1xuICBzZXRGb3JNb3ZlOiBib29sZWFuO1xuICBoYXNBbmltYXRpb246IGJvb2xlYW47XG4gIG5hbWVzcGFjZUlkOiBzdHJpbmc7XG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBib29sZWFuO1xuICBwcmV2aW91c1RyaWdnZXJzVmFsdWVzPzogTWFwPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsdWUge1xuICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnM7XG5cbiAgZ2V0IHBhcmFtcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXMgYXMge1trZXk6IHN0cmluZ106IGFueX07XG4gIH1cblxuICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZyA9ICcnKSB7XG4gICAgY29uc3QgaXNPYmogPSBpbnB1dCAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBjb25zdCB2YWx1ZSA9IGlzT2JqID8gaW5wdXRbJ3ZhbHVlJ10gOiBpbnB1dDtcbiAgICB0aGlzLnZhbHVlID0gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNPYmopIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb3B5T2JqKGlucHV0IGFzIGFueSk7XG4gICAgICBkZWxldGUgb3B0aW9uc1sndmFsdWUnXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGFic29yYk9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGNvbnN0IG5ld1BhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgIGlmIChuZXdQYXJhbXMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXMhO1xuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAob2xkUGFyYW1zW3Byb3BdID09IG51bGwpIHtcbiAgICAgICAgICBvbGRQYXJhbXNbcHJvcF0gPSBuZXdQYXJhbXNbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9JRF9WQUxVRSA9ICd2b2lkJztcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUQVRFX1ZBTFVFID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHByaXZhdGUgX3RyaWdnZXJzOiB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuICBwcml2YXRlIF9xdWV1ZTogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfZWxlbWVudExpc3RlbmVycyA9IG5ldyBNYXA8YW55LCBUcmlnZ2VyTGlzdGVuZXJbXT4oKTtcblxuICBwcml2YXRlIF9ob3N0Q2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGhvc3RFbGVtZW50OiBhbnksIHByaXZhdGUgX2VuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSkge1xuICAgIHRoaXMuX2hvc3RDbGFzc05hbWUgPSAnbmctdG5zLScgKyBpZDtcbiAgICBhZGRDbGFzcyhob3N0RWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7XG4gIH1cblxuICBsaXN0ZW4oZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKCF0aGlzLl90cmlnZ2Vycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGhyb3cgbWlzc2luZ1RyaWdnZXIocGhhc2UsIG5hbWUpO1xuICAgIH1cblxuICAgIGlmIChwaGFzZSA9PSBudWxsIHx8IHBoYXNlLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBtaXNzaW5nRXZlbnQobmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RyaWdnZXJFdmVudFZhbGlkKHBoYXNlKSkge1xuICAgICAgdGhyb3cgdW5zdXBwb3J0ZWRUcmlnZ2VyRXZlbnQocGhhc2UsIG5hbWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLCBlbGVtZW50LCBbXSk7XG4gICAgY29uc3QgZGF0YSA9IHtuYW1lLCBwaGFzZSwgY2FsbGJhY2t9O1xuICAgIGxpc3RlbmVycy5wdXNoKGRhdGEpO1xuXG4gICAgY29uc3QgdHJpZ2dlcnNXaXRoU3RhdGVzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQsIGVsZW1lbnQsIHt9KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyBuYW1lKTtcbiAgICAgIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBpcyByZW1vdmVkIEFGVEVSIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCBsZWF2ZSBhbmltYXRpb25zIGNhbGxiYWNrcyBjYW4gZmlyZSAob3RoZXJ3aXNlIGlmIHRoZSBub2RlXG4gICAgICAvLyBpcyByZW1vdmVkIGluIGJldHdlZW4gdGhlbiB0aGUgbGlzdGVuZXJzIHdvdWxkIGJlIGRlcmVnaXN0ZXJlZClcbiAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihkYXRhKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgICAgICBkZWxldGUgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBhc3Q6IEFuaW1hdGlvblRyaWdnZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgIC8vIHRocm93XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RyaWdnZXJzW25hbWVdID0gYXN0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHJpZ2dlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG4gICAgaWYgKCF0cmlnZ2VyKSB7XG4gICAgICB0aHJvdyB1bnJlZ2lzdGVyZWRUcmlnZ2VyKG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdHJpZ2dlcjtcbiAgfVxuXG4gIHRyaWdnZXIoZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBkZWZhdWx0VG9GYWxsYmFjazogYm9vbGVhbiA9IHRydWUpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9nZXRUcmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcih0aGlzLmlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG5cbiAgICBsZXQgdHJpZ2dlcnNXaXRoU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgdHJpZ2dlck5hbWUpO1xuICAgICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5zZXQoZWxlbWVudCwgdHJpZ2dlcnNXaXRoU3RhdGVzID0ge30pO1xuICAgIH1cblxuICAgIGxldCBmcm9tU3RhdGUgPSB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdO1xuICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZSh2YWx1ZSwgdGhpcy5pZCk7XG5cbiAgICBjb25zdCBpc09iaiA9IHZhbHVlICYmIHZhbHVlLmhhc093blByb3BlcnR5KCd2YWx1ZScpO1xuICAgIGlmICghaXNPYmogJiYgZnJvbVN0YXRlKSB7XG4gICAgICB0b1N0YXRlLmFic29yYk9wdGlvbnMoZnJvbVN0YXRlLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV0gPSB0b1N0YXRlO1xuXG4gICAgaWYgKCFmcm9tU3RhdGUpIHtcbiAgICAgIGZyb21TdGF0ZSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgY29uc3QgaXNSZW1vdmFsID0gdG9TdGF0ZS52YWx1ZSA9PT0gVk9JRF9WQUxVRTtcblxuICAgIC8vIG5vcm1hbGx5IHRoaXMgaXNuJ3QgcmVhY2hlZCBieSBoZXJlLCBob3dldmVyLCBpZiBhbiBvYmplY3QgZXhwcmVzc2lvblxuICAgIC8vIGlzIHBhc3NlZCBpbiB0aGVuIGl0IG1heSBiZSBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLiBDb21wYXJpbmcgdGhlIHZhbHVlXG4gICAgLy8gaXMgaW1wb3J0YW50IHNpbmNlIHRoYXQgd2lsbCBzdGF5IHRoZSBzYW1lIGRlc3BpdGUgdGhlcmUgYmVpbmcgYSBuZXcgb2JqZWN0LlxuICAgIC8vIFRoZSByZW1vdmFsIGFyYyBoZXJlIGlzIHNwZWNpYWwgY2FzZWQgYmVjYXVzZSB0aGUgc2FtZSBlbGVtZW50IGlzIHRyaWdnZXJlZFxuICAgIC8vIHR3aWNlIGluIHRoZSBldmVudCB0aGF0IGl0IGNvbnRhaW5zIGFuaW1hdGlvbnMgb24gdGhlIG91dGVyL2lubmVyIHBvcnRpb25zXG4gICAgLy8gb2YgdGhlIGhvc3QgY29udGFpbmVyXG4gICAgaWYgKCFpc1JlbW92YWwgJiYgZnJvbVN0YXRlLnZhbHVlID09PSB0b1N0YXRlLnZhbHVlKSB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgZGVzcGl0ZSB0aGUgdmFsdWUgbm90IGNoYW5naW5nLCBzb21lIGlubmVyIHBhcmFtc1xuICAgICAgLy8gaGF2ZSBjaGFuZ2VkIHdoaWNoIG1lYW5zIHRoYXQgdGhlIGFuaW1hdGlvbiBmaW5hbCBzdHlsZXMgbmVlZCB0byBiZSBhcHBsaWVkXG4gICAgICBpZiAoIW9iakVxdWFscyhmcm9tU3RhdGUucGFyYW1zLCB0b1N0YXRlLnBhcmFtcykpIHtcbiAgICAgICAgY29uc3QgZXJyb3JzOiBFcnJvcltdID0gW107XG4gICAgICAgIGNvbnN0IGZyb21TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKGZyb21TdGF0ZS52YWx1ZSwgZnJvbVN0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgY29uc3QgdG9TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKHRvU3RhdGUudmFsdWUsIHRvU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGZyb21TdHlsZXMpO1xuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIHRvU3R5bGVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllcnNPbkVsZW1lbnQ6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudCwgZWxlbWVudCwgW10pO1xuICAgIHBsYXllcnNPbkVsZW1lbnQuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gb25seSByZW1vdmUgdGhlIHBsYXllciBpZiBpdCBpcyBxdWV1ZWQgb24gdGhlIEVYQUNUIHNhbWUgdHJpZ2dlci9uYW1lc3BhY2VcbiAgICAgIC8vIHdlIG9ubHkgYWxzbyBkZWFsIHdpdGggcXVldWVkIHBsYXllcnMgaGVyZSBiZWNhdXNlIGlmIHRoZSBhbmltYXRpb24gaGFzXG4gICAgICAvLyBzdGFydGVkIHRoZW4gd2Ugd2FudCB0byBrZWVwIHRoZSBwbGF5ZXIgYWxpdmUgdW50aWwgdGhlIGZsdXNoIGhhcHBlbnNcbiAgICAgIC8vICh3aGljaCBpcyB3aGVyZSB0aGUgcHJldmlvdXNQbGF5ZXJzIGFyZSBwYXNzZWQgaW50byB0aGUgbmV3IHBsYXllcilcbiAgICAgIGlmIChwbGF5ZXIubmFtZXNwYWNlSWQgPT0gdGhpcy5pZCAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgPT0gdHJpZ2dlck5hbWUgJiYgcGxheWVyLnF1ZXVlZCkge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHRyYW5zaXRpb24gPVxuICAgICAgICB0cmlnZ2VyLm1hdGNoVHJhbnNpdGlvbihmcm9tU3RhdGUudmFsdWUsIHRvU3RhdGUudmFsdWUsIGVsZW1lbnQsIHRvU3RhdGUucGFyYW1zKTtcbiAgICBsZXQgaXNGYWxsYmFja1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIGlmICghZGVmYXVsdFRvRmFsbGJhY2spIHJldHVybjtcbiAgICAgIHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgdGhpcy5fcXVldWUucHVzaChcbiAgICAgICAge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBsYXllciwgaXNGYWxsYmFja1RyYW5zaXRpb259KTtcblxuICAgIGlmICghaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpO1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4ge1xuICAgICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnMpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgcGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgIHBsYXllcnNPbkVsZW1lbnQucHVzaChwbGF5ZXIpO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIGRlcmVnaXN0ZXIobmFtZTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuXG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5mb3JFYWNoKChzdGF0ZU1hcCwgZWxlbWVudCkgPT4ge1xuICAgICAgZGVsZXRlIHN0YXRlTWFwW25hbWVdO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcnMsIGVsZW1lbnQpID0+IHtcbiAgICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuc2V0KGVsZW1lbnQsIGxpc3RlbmVycy5maWx0ZXIoZW50cnkgPT4ge1xuICAgICAgICByZXR1cm4gZW50cnkubmFtZSAhPSBuYW1lO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudDogYW55KSB7XG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5kZWxldGUoZWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudFBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyhyb290RWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2VuZ2luZS5kcml2ZXIucXVlcnkocm9vdEVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpO1xuXG4gICAgLy8gZW11bGF0ZSBhIGxlYXZlIGFuaW1hdGlvbiBmb3IgYWxsIGlubmVyIG5vZGVzIHdpdGhpbiB0aGlzIG5vZGUuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGFuaW1hdGlvbnMgZm91bmQgZm9yIGFueSBvZiB0aGUgbm9kZXMgdGhlbiBjbGVhciB0aGUgY2FjaGVcbiAgICAvLyBmb3IgdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudHMuZm9yRWFjaChlbG0gPT4ge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGFuIGlubmVyIHJlbW92ZSgpIG9wZXJhdGlvbiBoYXMgYWxyZWFkeSBraWNrZWQgb2ZmXG4gICAgICAvLyB0aGUgYW5pbWF0aW9uIG9uIHRoaXMgZWxlbWVudC4uLlxuICAgICAgaWYgKGVsbVtSRU1PVkFMX0ZMQUddKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IG5hbWVzcGFjZXMgPSB0aGlzLl9lbmdpbmUuZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsbSk7XG4gICAgICBpZiAobmFtZXNwYWNlcy5zaXplKSB7XG4gICAgICAgIG5hbWVzcGFjZXMuZm9yRWFjaChucyA9PiBucy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxtLCBjb250ZXh0LCBmYWxzZSwgdHJ1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIGNoaWxkIGVsZW1lbnRzIHdlcmUgcmVtb3ZlZCBhbG9uZyB3aXRoIHRoZSBwYXJlbnQsIHRoZWlyIGFuaW1hdGlvbnMgbWlnaHQgbm90XG4gICAgLy8gaGF2ZSBjb21wbGV0ZWQuIENsZWFyIGFsbCB0aGUgZWxlbWVudHMgZnJvbSB0aGUgY2FjaGUgc28gd2UgZG9uJ3QgZW5kIHVwIHdpdGggYSBtZW1vcnkgbGVhay5cbiAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKFxuICAgICAgICAoKSA9PiBlbGVtZW50cy5mb3JFYWNoKGVsbSA9PiB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsbSkpKTtcbiAgfVxuXG4gIHRyaWdnZXJMZWF2ZUFuaW1hdGlvbihcbiAgICAgIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBkZXN0cm95QWZ0ZXJDb21wbGV0ZT86IGJvb2xlYW4sXG4gICAgICBkZWZhdWx0VG9GYWxsYmFjaz86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBjb25zdCB0cmlnZ2VyU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgY29uc3QgcHJldmlvdXNUcmlnZ2Vyc1ZhbHVlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgaWYgKHRyaWdnZXJTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXModHJpZ2dlclN0YXRlcykuZm9yRWFjaCh0cmlnZ2VyTmFtZSA9PiB7XG4gICAgICAgIHByZXZpb3VzVHJpZ2dlcnNWYWx1ZXMuc2V0KHRyaWdnZXJOYW1lLCB0cmlnZ2VyU3RhdGVzW3RyaWdnZXJOYW1lXS52YWx1ZSk7XG4gICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgaGVyZSBpbiB0aGUgZXZlbnQgdGhhdCBhbiBlbGVtZW50IGlzIHJlbW92ZWRcbiAgICAgICAgLy8gdHdpY2UgKGJvdGggb24gdGhlIGhvc3QgbGV2ZWwgYW5kIHRoZSBjb21wb25lbnQgbGV2ZWwpXG4gICAgICAgIGlmICh0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV0pIHtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLnRyaWdnZXIoZWxlbWVudCwgdHJpZ2dlck5hbWUsIFZPSURfVkFMVUUsIGRlZmF1bHRUb0ZhbGxiYWNrKTtcbiAgICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIHRydWUsIGNvbnRleHQsIHByZXZpb3VzVHJpZ2dlcnNWYWx1ZXMpO1xuICAgICAgICBpZiAoZGVzdHJveUFmdGVyQ29tcGxldGUpIHtcbiAgICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB0aGlzLl9lbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG5cbiAgICAvLyBpZiB0aGlzIHN0YXRlbWVudCBmYWlscyB0aGVuIGl0IG1lYW5zIHRoYXQgdGhlIGVsZW1lbnQgd2FzIHBpY2tlZCB1cFxuICAgIC8vIGJ5IGFuIGVhcmxpZXIgZmx1c2ggKG9yIHRoZXJlIGFyZSBubyBsaXN0ZW5lcnMgYXQgYWxsIHRvIHRyYWNrIHRoZSBsZWF2ZSkuXG4gICAgaWYgKGxpc3RlbmVycyAmJiBlbGVtZW50U3RhdGVzKSB7XG4gICAgICBjb25zdCB2aXNpdGVkVHJpZ2dlcnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlck5hbWUgPSBsaXN0ZW5lci5uYW1lO1xuICAgICAgICBpZiAodmlzaXRlZFRyaWdnZXJzLmhhcyh0cmlnZ2VyTmFtZSkpIHJldHVybjtcbiAgICAgICAgdmlzaXRlZFRyaWdnZXJzLmFkZCh0cmlnZ2VyTmFtZSk7XG5cbiAgICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXTtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBmcm9tU3RhdGUgPSBlbGVtZW50U3RhdGVzW3RyaWdnZXJOYW1lXSB8fCBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgICAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgICAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgdHJpZ2dlck5hbWUsXG4gICAgICAgICAgdHJhbnNpdGlvbixcbiAgICAgICAgICBmcm9tU3RhdGUsXG4gICAgICAgICAgdG9TdGF0ZSxcbiAgICAgICAgICBwbGF5ZXIsXG4gICAgICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5fZW5naW5lO1xuICAgIGlmIChlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSB7XG4gICAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2VycyhlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYSAqID0+IFZPSUQgYW5pbWF0aW9uIHdhcyBkZXRlY3RlZCBhbmQga2lja2VkIG9mZlxuICAgIGlmICh0aGlzLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbGVtZW50LCBjb250ZXh0LCB0cnVlKSkgcmV0dXJuO1xuXG4gICAgLy8gZmluZCB0aGUgcGxheWVyIHRoYXQgaXMgYW5pbWF0aW5nIGFuZCBtYWtlIHN1cmUgdGhhdCB0aGVcbiAgICAvLyByZW1vdmFsIGlzIGRlbGF5ZWQgdW50aWwgdGhhdCBwbGF5ZXIgaGFzIGNvbXBsZXRlZFxuICAgIGxldCBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoZW5naW5lLnRvdGFsQW5pbWF0aW9ucykge1xuICAgICAgY29uc3QgY3VycmVudFBsYXllcnMgPVxuICAgICAgICAgIGVuZ2luZS5wbGF5ZXJzLmxlbmd0aCA/IGVuZ2luZS5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCkgOiBbXTtcblxuICAgICAgLy8gd2hlbiB0aGlzIGBpZiBzdGF0ZW1lbnRgIGRvZXMgbm90IGNvbnRpbnVlIGZvcndhcmQgaXQgbWVhbnMgdGhhdFxuICAgICAgLy8gYSBwcmV2aW91cyBhbmltYXRpb24gcXVlcnkgaGFzIHNlbGVjdGVkIHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kXG4gICAgICAvLyBpcyBhbmltYXRpbmcgaXQuIEluIHRoaXMgc2l0dWF0aW9uIHdhbnQgdG8gY29udGludWUgZm9yd2FyZHMgYW5kXG4gICAgICAvLyBhbGxvdyB0aGUgZWxlbWVudCB0byBiZSBxdWV1ZWQgdXAgZm9yIGFuaW1hdGlvbiBsYXRlci5cbiAgICAgIGlmIChjdXJyZW50UGxheWVycyAmJiBjdXJyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50O1xuICAgICAgICB3aGlsZSAocGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IGVuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KHBhcmVudCk7XG4gICAgICAgICAgaWYgKHRyaWdnZXJzKSB7XG4gICAgICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBzdGFnZSB3ZSBrbm93IHRoYXQgdGhlIGVsZW1lbnQgd2lsbCBlaXRoZXIgZ2V0IHJlbW92ZWRcbiAgICAvLyBkdXJpbmcgZmx1c2ggb3Igd2lsbCBiZSBwaWNrZWQgdXAgYnkgYSBwYXJlbnQgcXVlcnkuIEVpdGhlciB3YXlcbiAgICAvLyB3ZSBuZWVkIHRvIGZpcmUgdGhlIGxpc3RlbmVycyBmb3IgdGhpcyBlbGVtZW50IHdoZW4gaXQgRE9FUyBnZXRcbiAgICAvLyByZW1vdmVkIChvbmNlIHRoZSBxdWVyeSBwYXJlbnQgYW5pbWF0aW9uIGlzIGRvbmUgb3IgYWZ0ZXIgZmx1c2gpXG4gICAgdGhpcy5wcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudCk7XG5cbiAgICAvLyB3aGV0aGVyIG9yIG5vdCBhIHBhcmVudCBoYXMgYW4gYW5pbWF0aW9uIHdlIG5lZWQgdG8gZGVsYXkgdGhlIGRlZmVycmFsIG9mIHRoZSBsZWF2ZVxuICAgIC8vIG9wZXJhdGlvbiB1bnRpbCB3ZSBoYXZlIG1vcmUgaW5mb3JtYXRpb24gKHdoaWNoIHdlIGRvIGFmdGVyIGZsdXNoKCkgaGFzIGJlZW4gY2FsbGVkKVxuICAgIGlmIChjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24pIHtcbiAgICAgIGVuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlbW92YWxGbGFnID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddO1xuICAgICAgaWYgKCFyZW1vdmFsRmxhZyB8fCByZW1vdmFsRmxhZyA9PT0gTlVMTF9SRU1PVkFMX1NUQVRFKSB7XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgYWZ0ZXIgdGhlIGZsdXNoIGhhcyBvY2N1cnJlZCBzdWNoXG4gICAgICAgIC8vIHRoYXQgdGhlIGNhbGxiYWNrcyBjYW4gYmUgZmlyZWRcbiAgICAgICAgZW5naW5lLmFmdGVyRmx1c2goKCkgPT4gdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KSk7XG4gICAgICAgIGVuZ2luZS5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgICBlbmdpbmUuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGluc2VydE5vZGUoZWxlbWVudDogYW55LCBwYXJlbnQ6IGFueSk6IHZvaWQge1xuICAgIGFkZENsYXNzKGVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpO1xuICB9XG5cbiAgZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZDogbnVtYmVyKTogUXVldWVJbnN0cnVjdGlvbltdIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIHRoaXMuX3F1ZXVlLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgaWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcblxuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyOiBUcmlnZ2VyTGlzdGVuZXIpID0+IHtcbiAgICAgICAgICBpZiAobGlzdGVuZXIubmFtZSA9PSBlbnRyeS50cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgY29uc3QgYmFzZUV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgICAgICAgICAgIGVsZW1lbnQsIGVudHJ5LnRyaWdnZXJOYW1lLCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUpO1xuICAgICAgICAgICAgKGJhc2VFdmVudCBhcyBhbnkpWydfZGF0YSddID0gbWljcm90YXNrSWQ7XG4gICAgICAgICAgICBsaXN0ZW5PblBsYXllcihlbnRyeS5wbGF5ZXIsIGxpc3RlbmVyLnBoYXNlLCBiYXNlRXZlbnQsIGxpc3RlbmVyLmNhbGxiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGxheWVyLm1hcmtlZEZvckRlc3Ryb3kpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgIC8vIG5vdyB3ZSBjYW4gZGVzdHJveSB0aGUgZWxlbWVudCBwcm9wZXJseSBzaW5jZSB0aGUgZXZlbnQgbGlzdGVuZXJzIGhhdmVcbiAgICAgICAgICAvLyBiZWVuIGJvdW5kIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluc3RydWN0aW9ucy5wdXNoKGVudHJ5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX3F1ZXVlID0gW107XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIC8vIGlmIGRlcENvdW50ID09IDAgdGhlbSBtb3ZlIHRvIGZyb250XG4gICAgICAvLyBvdGhlcndpc2UgaWYgYSBjb250YWlucyBiIHRoZW4gbW92ZSBiYWNrXG4gICAgICBjb25zdCBkMCA9IGEudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBjb25zdCBkMSA9IGIudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBpZiAoZDAgPT0gMCB8fCBkMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiBkMCAtIGQxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZS5kcml2ZXIuY29udGFpbnNFbGVtZW50KGEuZWxlbWVudCwgYi5lbGVtZW50KSA/IDEgOiAtMTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocCA9PiBwLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnModGhpcy5ob3N0RWxlbWVudCwgY29udGV4dCk7XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNEYXRhKGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIGxldCBjb250YWluc0RhdGEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudExpc3RlbmVycy5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgY29udGFpbnNEYXRhID1cbiAgICAgICAgKHRoaXMuX3F1ZXVlLmZpbmQoZW50cnkgPT4gZW50cnkuZWxlbWVudCA9PT0gZWxlbWVudCkgPyB0cnVlIDogZmFsc2UpIHx8IGNvbnRhaW5zRGF0YTtcbiAgICByZXR1cm4gY29udGFpbnNEYXRhO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVkVHJhbnNpdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbjtcbiAgcGxheWVyOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyO1xufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgcHVibGljIG5ld0hvc3RFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgcGxheWVyc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBzdGF0ZXNCeUVsZW1lbnQgPSBuZXcgTWFwPGFueSwge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogU3RhdGVWYWx1ZX0+KCk7XG4gIHB1YmxpYyBkaXNhYmxlZE5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG5cbiAgcHVibGljIHRvdGFsQW5pbWF0aW9ucyA9IDA7XG4gIHB1YmxpYyB0b3RhbFF1ZXVlZFBsYXllcnMgPSAwO1xuXG4gIHByaXZhdGUgX25hbWVzcGFjZUxvb2t1cDoge1tpZDogc3RyaW5nXTogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZX0gPSB7fTtcbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTGlzdDogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZVtdID0gW107XG4gIHByaXZhdGUgX2ZsdXNoRm5zOiAoKCkgPT4gYW55KVtdID0gW107XG4gIHByaXZhdGUgX3doZW5RdWlldEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuXG4gIHB1YmxpYyBuYW1lc3BhY2VzQnlIb3N0RWxlbWVudCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgY29sbGVjdGVkRW50ZXJFbGVtZW50czogYW55W10gPSBbXTtcbiAgcHVibGljIGNvbGxlY3RlZExlYXZlRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgLy8gdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gYmUgb3ZlcnJpZGRlbiBieSB0aGUgY29kZSB0aGF0IHVzZXMgdGhpcyBlbmdpbmVcbiAgcHVibGljIG9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PiB7fTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMub25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBib2R5Tm9kZTogYW55LCBwdWJsaWMgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsXG4gICAgICBwcml2YXRlIF9ub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIpIHt9XG5cbiAgZ2V0IHF1ZXVlZFBsYXllcnMoKTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LmZvckVhY2gobnMgPT4ge1xuICAgICAgbnMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwbGF5ZXJzO1xuICB9XG5cbiAgY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBucyA9IG5ldyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCwgdGhpcyk7XG4gICAgaWYgKHRoaXMuYm9keU5vZGUgJiYgdGhpcy5kcml2ZXIuY29udGFpbnNFbGVtZW50KHRoaXMuYm9keU5vZGUsIGhvc3RFbGVtZW50KSkge1xuICAgICAgdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGhvc3RFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVmZXIgdGhpcyBsYXRlciB1bnRpbCBmbHVzaCBkdXJpbmcgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGhhc1xuICAgICAgLy8gYmVlbiBpbnNlcnRlZCBzbyB0aGF0IHdlIGtub3cgZXhhY3RseSB3aGVyZSB0byBwbGFjZSBpdCBpblxuICAgICAgLy8gdGhlIG5hbWVzcGFjZSBsaXN0XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcblxuICAgICAgLy8gZ2l2ZW4gdGhhdCB0aGlzIGhvc3QgZWxlbWVudCBpcyBhIHBhcnQgb2YgdGhlIGFuaW1hdGlvbiBjb2RlLCBpdFxuICAgICAgLy8gbWF5IG9yIG1heSBub3QgYmUgaW5zZXJ0ZWQgYnkgYSBwYXJlbnQgbm9kZSB0aGF0IGlzIG9mIGFuXG4gICAgICAvLyBhbmltYXRpb24gcmVuZGVyZXIgdHlwZS4gSWYgdGhpcyBoYXBwZW5zIHRoZW4gd2UgY2FuIHN0aWxsIGhhdmVcbiAgICAgIC8vIGFjY2VzcyB0byB0aGlzIGl0ZW0gd2hlbiB3ZSBxdWVyeSBmb3IgOmVudGVyIG5vZGVzLiBJZiB0aGUgcGFyZW50XG4gICAgICAvLyBpcyBhIHJlbmRlcmVyIHRoZW4gdGhlIHNldCBkYXRhLXN0cnVjdHVyZSB3aWxsIG5vcm1hbGl6ZSB0aGUgZW50cnlcbiAgICAgIHRoaXMuY29sbGVjdEVudGVyRWxlbWVudChob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdID0gbnM7XG4gIH1cblxuICBwcml2YXRlIF9iYWxhbmNlTmFtZXNwYWNlTGlzdChuczogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSwgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpbWl0ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxO1xuICAgIGlmIChsaW1pdCA+PSAwKSB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGkgPSBsaW1pdDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgbmV4dE5hbWVzcGFjZSA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICAgIGlmICh0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQobmV4dE5hbWVzcGFjZS5ob3N0RWxlbWVudCwgaG9zdEVsZW1lbnQpKSB7XG4gICAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaSArIDEsIDAsIG5zKTtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoMCwgMCwgbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnB1c2gobnMpO1xuICAgIH1cblxuICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuc2V0KGhvc3RFbGVtZW50LCBucyk7XG4gICAgcmV0dXJuIG5zO1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBucyA9IHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgaWYgKCFucykge1xuICAgICAgbnMgPSB0aGlzLmNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VJZCwgaG9zdEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlclRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCB0cmlnZ2VyOiBBbmltYXRpb25UcmlnZ2VyKSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAobnMgJiYgbnMucmVnaXN0ZXIobmFtZSwgdHJpZ2dlcikpIHtcbiAgICAgIHRoaXMudG90YWxBbmltYXRpb25zKys7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveShuYW1lc3BhY2VJZDogc3RyaW5nLCBjb250ZXh0OiBhbnkpIHtcbiAgICBpZiAoIW5hbWVzcGFjZUlkKSByZXR1cm47XG5cbiAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICB0aGlzLm5hbWVzcGFjZXNCeUhvc3RFbGVtZW50LmRlbGV0ZShucy5ob3N0RWxlbWVudCk7XG4gICAgICBkZWxldGUgdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5pbmRleE9mKG5zKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKCgpID0+IG5zLmRlc3Ryb3koY29udGV4dCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmV0Y2hOYW1lc3BhY2UoaWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbaWRdO1xuICB9XG5cbiAgZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsZW1lbnQ6IGFueSk6IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPiB7XG4gICAgLy8gbm9ybWFsbHkgdGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIG5hbWVzcGFjZSBwZXIgZWxlbWVudCwgaG93ZXZlclxuICAgIC8vIGlmIEB0cmlnZ2VycyBhcmUgcGxhY2VkIG9uIGJvdGggdGhlIGNvbXBvbmVudCBlbGVtZW50IGFuZCB0aGVuXG4gICAgLy8gaXRzIGhvc3QgZWxlbWVudCAod2l0aGluIHRoZSBjb21wb25lbnQgY29kZSkgdGhlbiB0aGVyZSB3aWxsIGJlXG4gICAgLy8gdHdvIG5hbWVzcGFjZXMgcmV0dXJuZWQuIFdlIHVzZSBhIHNldCBoZXJlIHRvIHNpbXBseSBkZWR1cGxpY2F0ZVxuICAgIC8vIHRoZSBuYW1lc3BhY2VzIGluIGNhc2UgKGZvciB0aGUgcmVhc29uIGRlc2NyaWJlZCBhYm92ZSkgdGhlcmUgYXJlIG11bHRpcGxlIHRyaWdnZXJzXG4gICAgY29uc3QgbmFtZXNwYWNlcyA9IG5ldyBTZXQ8QW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50U3RhdGVzKSB7XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZWxlbWVudFN0YXRlcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbnNJZCA9IGVsZW1lbnRTdGF0ZXNba2V5c1tpXV0ubmFtZXNwYWNlSWQ7XG4gICAgICAgIGlmIChuc0lkKSB7XG4gICAgICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuc0lkKTtcbiAgICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICAgIG5hbWVzcGFjZXMuYWRkKG5zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzcGFjZXM7XG4gIH1cblxuICB0cmlnZ2VyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLnRyaWdnZXIoZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaW5zZXJ0Tm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIWlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHJldHVybjtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYW5kIHJlaW5zZXJ0ZWQgKG1vdmUgb3BlcmF0aW9uKVxuICAgIC8vIHdoZW4gdGhpcyBvY2N1cnMgd2UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBlbGVtZW50IGZvciBkZWxldGlvbiBsYXRlclxuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgZGV0YWlscy5zZXRGb3JSZW1vdmFsID0gZmFsc2U7XG4gICAgICBkZXRhaWxzLnNldEZvck1vdmUgPSB0cnVlO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuaW5kZXhPZihlbGVtZW50KTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBuYW1lc3BhY2VJZCBpcyBibGFuayB0aGVuIHRoZSBjYWxsZXJcbiAgICAvLyBjb2RlIGRvZXMgbm90IGNvbnRhaW4gYW55IGFuaW1hdGlvbiBjb2RlIGluIGl0LCBidXQgaXQgaXNcbiAgICAvLyBqdXN0IGJlaW5nIGNhbGxlZCBzbyB0aGF0IHRoZSBub2RlIGlzIG1hcmtlZCBhcyBiZWluZyBpbnNlcnRlZFxuICAgIGlmIChuYW1lc3BhY2VJZCkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICAvLyBUaGlzIGlmLXN0YXRlbWVudCBpcyBhIHdvcmthcm91bmQgZm9yIHJvdXRlciBpc3N1ZSAjMjE5NDcuXG4gICAgICAvLyBUaGUgcm91dGVyIHNvbWV0aW1lcyBoaXRzIGEgcmFjZSBjb25kaXRpb24gd2hlcmUgd2hpbGUgYSByb3V0ZVxuICAgICAgLy8gaXMgYmVpbmcgaW5zdGFudGlhdGVkIGEgbmV3IG5hdmlnYXRpb24gYXJyaXZlcywgdHJpZ2dlcmluZyBsZWF2ZVxuICAgICAgLy8gYW5pbWF0aW9uIG9mIERPTSB0aGF0IGhhcyBub3QgYmVlbiBmdWxseSBpbml0aWFsaXplZCwgdW50aWwgdGhpc1xuICAgICAgLy8gaXMgcmVzb2x2ZWQsIHdlIG5lZWQgdG8gaGFuZGxlIHRoZSBzY2VuYXJpbyB3aGVuIERPTSBpcyBub3QgaW4gYVxuICAgICAgLy8gY29uc2lzdGVudCBzdGF0ZSBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cbiAgICAgIGlmIChucykge1xuICAgICAgICBucy5pbnNlcnROb2RlKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gb25seSAqZGlyZWN0aXZlcyBhbmQgaG9zdCBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgYmVmb3JlXG4gICAgaWYgKGluc2VydEJlZm9yZSkge1xuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gIH1cblxuICBtYXJrRWxlbWVudEFzRGlzYWJsZWQoZWxlbWVudDogYW55LCB2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5hZGQoZWxlbWVudCk7XG4gICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLmRpc2FibGVkTm9kZXMuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaXNIb3N0RWxlbWVudDogYm9vbGVhbiwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG5zID0gbmFtZXNwYWNlSWQgPyB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkgOiBudWxsO1xuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLnJlbW92ZU5vZGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0hvc3RFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGhvc3ROUyA9IHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAoaG9zdE5TICYmIGhvc3ROUy5pZCAhPT0gbmFtZXNwYWNlSWQpIHtcbiAgICAgICAgICBob3N0TlMucmVtb3ZlTm9kZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBtYXJrRWxlbWVudEFzUmVtb3ZlZChcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaGFzQW5pbWF0aW9uPzogYm9vbGVhbiwgY29udGV4dD86IGFueSxcbiAgICAgIHByZXZpb3VzVHJpZ2dlcnNWYWx1ZXM/OiBNYXA8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0ge1xuICAgICAgbmFtZXNwYWNlSWQsXG4gICAgICBzZXRGb3JSZW1vdmFsOiBjb250ZXh0LFxuICAgICAgaGFzQW5pbWF0aW9uLFxuICAgICAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlLFxuICAgICAgcHJldmlvdXNUcmlnZ2Vyc1ZhbHVlc1xuICAgIH07XG4gIH1cblxuICBsaXN0ZW4oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkubGlzdGVuKGVsZW1lbnQsIG5hbWUsIHBoYXNlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICBlbnRyeTogUXVldWVJbnN0cnVjdGlvbiwgc3ViVGltZWxpbmVzOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBza2lwQnVpbGRBc3Q/OiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGVudHJ5LnRyYW5zaXRpb24uYnVpbGQoXG4gICAgICAgIHRoaXMuZHJpdmVyLCBlbnRyeS5lbGVtZW50LCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUsIGVudGVyQ2xhc3NOYW1lLFxuICAgICAgICBsZWF2ZUNsYXNzTmFtZSwgZW50cnkuZnJvbVN0YXRlLm9wdGlvbnMsIGVudHJ5LnRvU3RhdGUub3B0aW9ucywgc3ViVGltZWxpbmVzLCBza2lwQnVpbGRBc3QpO1xuICB9XG5cbiAgZGVzdHJveUlubmVyQW5pbWF0aW9ucyhjb250YWluZXJFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5kZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudCkpO1xuXG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuc2l6ZSA9PSAwKSByZXR1cm47XG5cbiAgICBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50KSk7XG4gIH1cblxuICBkZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBzZXQgZm9yIGRlc3RydWN0aW9uLCBidXQgaGFzbid0IHN0YXJ0ZWQuXG4gICAgICAgIC8vIGluIHRoaXMgc2l0dWF0aW9uIHdlIHdhbnQgdG8gZGVsYXkgdGhlIGRlc3RydWN0aW9uIHVudGlsIHRoZSBmbHVzaCBvY2N1cnNcbiAgICAgICAgLy8gc28gdGhhdCBhbnkgZXZlbnQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBwbGF5ZXIgYXJlIHRyaWdnZXJlZC5cbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXIubWFya2VkRm9yRGVzdHJveSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmZpbmlzaCgpKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpbWl6ZUdyb3VwUGxheWVyKHRoaXMucGxheWVycykub25Eb25lKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgLy8gdGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSByZW1vdmluZyBpdCB0d2ljZVxuICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkFMX1NUQVRFO1xuICAgICAgaWYgKGRldGFpbHMubmFtZXNwYWNlSWQpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKGRldGFpbHMubmFtZXNwYWNlSWQpO1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBucy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgZGV0YWlscy5zZXRGb3JSZW1vdmFsKTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3Q/LmNvbnRhaW5zKERJU0FCTEVEX0NMQVNTTkFNRSkpIHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKG5vZGUsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZsdXNoKG1pY3JvdGFza0lkOiBudW1iZXIgPSAtMSkge1xuICAgIGxldCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmICh0aGlzLm5ld0hvc3RFbGVtZW50cy5zaXplKSB7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5mb3JFYWNoKChucywgZWxlbWVudCkgPT4gdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGVsZW1lbnQpKTtcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudG90YWxBbmltYXRpb25zICYmIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsbSA9IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50c1tpXTtcbiAgICAgICAgYWRkQ2xhc3MoZWxtLCBTVEFSX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoICYmXG4gICAgICAgICh0aGlzLnRvdGFsUXVldWVkUGxheWVycyB8fCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoKSkge1xuICAgICAgY29uc3QgY2xlYW51cEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGxheWVycyA9IHRoaXMuX2ZsdXNoQW5pbWF0aW9ucyhjbGVhbnVwRm5zLCBtaWNyb3Rhc2tJZCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsZWFudXBGbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjbGVhbnVwRm5zW2ldKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50c1tpXTtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9mbHVzaEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX2ZsdXNoRm5zID0gW107XG5cbiAgICBpZiAodGhpcy5fd2hlblF1aWV0Rm5zLmxlbmd0aCkge1xuICAgICAgLy8gd2UgbW92ZSB0aGVzZSBvdmVyIHRvIGEgdmFyaWFibGUgc28gdGhhdFxuICAgICAgLy8gaWYgYW55IG5ldyBjYWxsYmFja3MgYXJlIHJlZ2lzdGVyZWQgaW4gYW5vdGhlclxuICAgICAgLy8gZmx1c2ggdGhleSBkbyBub3QgcG9wdWxhdGUgdGhlIGV4aXN0aW5nIHNldFxuICAgICAgY29uc3QgcXVpZXRGbnMgPSB0aGlzLl93aGVuUXVpZXRGbnM7XG4gICAgICB0aGlzLl93aGVuUXVpZXRGbnMgPSBbXTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHtcbiAgICAgICAgICBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1aWV0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVwb3J0RXJyb3IoZXJyb3JzOiBFcnJvcltdKSB7XG4gICAgdGhyb3cgdHJpZ2dlclRyYW5zaXRpb25zRmFpbGVkKGVycm9ycyk7XG4gIH1cblxuICBwcml2YXRlIF9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZuczogRnVuY3Rpb25bXSwgbWljcm90YXNrSWQ6IG51bWJlcik6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHN1YlRpbWVsaW5lcyA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgcXVldWVkSW5zdHJ1Y3Rpb25zOiBRdWV1ZWRUcmFuc2l0aW9uW10gPSBbXTtcbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IGFsbFByZVN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG4gICAgY29uc3QgYWxsUG9zdFN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG5cbiAgICBjb25zdCBkaXNhYmxlZEVsZW1lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gICAgdGhpcy5kaXNhYmxlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2RlKTtcbiAgICAgIGNvbnN0IG5vZGVzVGhhdEFyZURpc2FibGVkID0gdGhpcy5kcml2ZXIucXVlcnkobm9kZSwgUVVFVUVEX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUaGF0QXJlRGlzYWJsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZXNUaGF0QXJlRGlzYWJsZWRbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgYm9keU5vZGUgPSB0aGlzLmJvZHlOb2RlO1xuICAgIGNvbnN0IGFsbFRyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5zdGF0ZXNCeUVsZW1lbnQua2V5cygpKTtcbiAgICBjb25zdCBlbnRlck5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMpO1xuXG4gICAgLy8gdGhpcyBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBidWlsdCBiZWxvdyBzdWNoIHRoYXRcbiAgICAvLyB0aGUgOmVudGVyIHF1ZXJpZXMgbWF0Y2ggdGhlIGVsZW1lbnRzIChzaW5jZSB0aGUgdGltZWxpbmUgcXVlcmllc1xuICAgIC8vIGFyZSBmaXJlZCBkdXJpbmcgaW5zdHJ1Y3Rpb24gYnVpbGRpbmcpLlxuICAgIGNvbnN0IGVudGVyTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gRU5URVJfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgZW50ZXJOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsTGVhdmVOb2RlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBtZXJnZWRMZWF2ZU5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zID0gbmV3IFNldDxhbnk+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgICBhbGxMZWF2ZU5vZGVzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZGV0YWlscy5oYXNBbmltYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBTVEFSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbG0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVhdmVOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCBBcnJheS5mcm9tKG1lcmdlZExlYXZlTm9kZXMpKTtcbiAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IExFQVZFX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGxlYXZlTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNsZWFudXBGbnMucHVzaCgoKSA9PiB7XG4gICAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChyb290KSE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChyb290KSE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxMZWF2ZU5vZGVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgZXJyb25lb3VzVHJhbnNpdGlvbnM6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbltdID0gW107XG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgIG5zLmRyYWluUXVldWVkVHJhbnNpdGlvbnMobWljcm90YXNrSWQpLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgICBhbGxQbGF5ZXJzLnB1c2gocGxheWVyKTtcblxuICAgICAgICBpZiAodGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgICAgIC8vIGFuaW1hdGlvbnMgZm9yIG1vdmUgb3BlcmF0aW9ucyAoZWxlbWVudHMgYmVpbmcgcmVtb3ZlZCBhbmQgcmVpbnNlcnRlZCxcbiAgICAgICAgICAvLyBlLmcuIHdoZW4gdGhlIG9yZGVyIG9mIGFuICpuZ0ZvciBsaXN0IGNoYW5nZXMpIGFyZSBjdXJyZW50bHkgbm90IHN1cHBvcnRlZFxuICAgICAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yTW92ZSkge1xuICAgICAgICAgICAgaWYgKGRldGFpbHMucHJldmlvdXNUcmlnZ2Vyc1ZhbHVlcyAmJlxuICAgICAgICAgICAgICAgIGRldGFpbHMucHJldmlvdXNUcmlnZ2Vyc1ZhbHVlcy5oYXMoZW50cnkudHJpZ2dlck5hbWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWUgPSBkZXRhaWxzLnByZXZpb3VzVHJpZ2dlcnNWYWx1ZXMuZ2V0KGVudHJ5LnRyaWdnZXJOYW1lKSBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byByZXN0b3JlIHRoZSBwcmV2aW91cyB0cmlnZ2VyIHZhbHVlIHNpbmNlIHRoZSBlbGVtZW50IGhhc1xuICAgICAgICAgICAgICAvLyBvbmx5IGJlZW4gbW92ZWQgYW5kIGhhc24ndCBhY3R1YWxseSBsZWZ0IHRoZSBET01cbiAgICAgICAgICAgICAgY29uc3QgdHJpZ2dlcnNXaXRoU3RhdGVzID0gdGhpcy5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVudHJ5LmVsZW1lbnQpO1xuICAgICAgICAgICAgICBpZiAodHJpZ2dlcnNXaXRoU3RhdGVzICYmIHRyaWdnZXJzV2l0aFN0YXRlc1tlbnRyeS50cmlnZ2VyTmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbZW50cnkudHJpZ2dlck5hbWVdLnZhbHVlID0gcHJldmlvdXNWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGVJc09ycGhhbmVkID0gIWJvZHlOb2RlIHx8ICF0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQoYm9keU5vZGUsIGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBsZWF2ZUNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQoZWxlbWVudCkhO1xuICAgICAgICBjb25zdCBlbnRlckNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQoZWxlbWVudCkhO1xuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbiA9IHRoaXMuX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICBlbnRyeSwgc3ViVGltZWxpbmVzLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIG5vZGVJc09ycGhhbmVkKSE7XG4gICAgICAgIGlmIChpbnN0cnVjdGlvbi5lcnJvcnMgJiYgaW5zdHJ1Y3Rpb24uZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLnB1c2goaW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGV2ZW4gdGhvdWdoIHRoZSBlbGVtZW50IG1heSBub3QgYmUgaW4gdGhlIERPTSwgaXQgbWF5IHN0aWxsXG4gICAgICAgIC8vIGJlIGFkZGVkIGF0IGEgbGF0ZXIgcG9pbnQgKGR1ZSB0byB0aGUgbWVjaGFuaWNzIG9mIGNvbnRlbnRcbiAgICAgICAgLy8gcHJvamVjdGlvbiBhbmQvb3IgZHluYW1pYyBjb21wb25lbnQgaW5zZXJ0aW9uKSB0aGVyZWZvcmUgaXQnc1xuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gc3RpbGwgc3R5bGUgdGhlIGVsZW1lbnQuXG4gICAgICAgIGlmIChub2RlSXNPcnBoYW5lZCkge1xuICAgICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhbiB1bm1hdGNoZWQgdHJhbnNpdGlvbiBpcyBxdWV1ZWQgYW5kIHJlYWR5IHRvIGdvXG4gICAgICAgIC8vIHRoZW4gaXQgU0hPVUxEIE5PVCByZW5kZXIgYW4gYW5pbWF0aW9uIGFuZCBjYW5jZWwgdGhlXG4gICAgICAgIC8vIHByZXZpb3VzbHkgcnVubmluZyBhbmltYXRpb25zLlxuICAgICAgICBpZiAoZW50cnkuaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGlmIGEgcGFyZW50IGFuaW1hdGlvbiB1c2VzIHRoaXMgYW5pbWF0aW9uIGFzIGEgc3ViLXRyaWdnZXJcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGluc3RydWN0IHRoZSB0aW1lbGluZSBidWlsZGVyIG5vdCB0byBhZGQgYSBwbGF5ZXIgZGVsYXksIGJ1dFxuICAgICAgICAvLyBpbnN0ZWFkIHN0cmV0Y2ggdGhlIGZpcnN0IGtleWZyYW1lIGdhcCB1bnRpbCB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gVGhpcyBpc1xuICAgICAgICAvLyBpbXBvcnRhbnQgaW4gb3JkZXIgdG8gcHJldmVudCBleHRyYSBpbml0aWFsaXphdGlvbiBzdHlsZXMgZnJvbSBiZWluZ1xuICAgICAgICAvLyByZXF1aXJlZCBieSB0aGUgdXNlciBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgY29uc3QgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10gPSBbXTtcbiAgICAgICAgaW5zdHJ1Y3Rpb24udGltZWxpbmVzLmZvckVhY2godGwgPT4ge1xuICAgICAgICAgIHRsLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWROb2Rlcy5oYXModGwuZWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lcy5wdXNoKHRsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpbnN0cnVjdGlvbi50aW1lbGluZXMgPSB0aW1lbGluZXM7XG5cbiAgICAgICAgc3ViVGltZWxpbmVzLmFwcGVuZChlbGVtZW50LCBpbnN0cnVjdGlvbi50aW1lbGluZXMpO1xuXG4gICAgICAgIGNvbnN0IHR1cGxlID0ge2luc3RydWN0aW9uLCBwbGF5ZXIsIGVsZW1lbnR9O1xuXG4gICAgICAgIHF1ZXVlZEluc3RydWN0aW9ucy5wdXNoKHR1cGxlKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5xdWVyaWVkRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgICAgIGVsZW1lbnQgPT4gZ2V0T3JTZXRBc0luTWFwKHF1ZXJpZWRFbGVtZW50cywgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgaWYgKHByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSE7XG4gICAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgICBhbGxQcmVTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkhO1xuICAgICAgICAgIGlmICghc2V0VmFsKSB7XG4gICAgICAgICAgICBhbGxQb3N0U3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9uZW91c1RyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgZXJyb3JzOiBFcnJvcltdID0gW107XG4gICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgZXJyb3JzLnB1c2godHJhbnNpdGlvbkZhaWxlZChpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZSwgaW5zdHJ1Y3Rpb24uZXJyb3JzISkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsUHJldmlvdXNQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICAvLyB0aGlzIG1hcCB0ZWxscyB1cyB3aGljaCBlbGVtZW50IGluIHRoZSBET00gdHJlZSBpcyBjb250YWluZWQgYnlcbiAgICAvLyB3aGljaCBhbmltYXRpb24uIEZ1cnRoZXIgZG93biB0aGlzIG1hcCB3aWxsIGdldCBwb3B1bGF0ZWQgb25jZVxuICAgIC8vIHRoZSBwbGF5ZXJzIGFyZSBidWlsdCBhbmQgaW4gZG9pbmcgc28gd2UgY2FuIHVzZSBpdCB0byBlZmZpY2llbnRseVxuICAgIC8vIGZpZ3VyZSBvdXQgaWYgYSBzdWIgcGxheWVyIGlzIHNraXBwZWQgZHVlIHRvIGEgcGFyZW50IHBsYXllciBoYXZpbmcgcHJpb3JpdHkuXG4gICAgY29uc3QgYW5pbWF0aW9uRWxlbWVudE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBpZiAoc3ViVGltZWxpbmVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBhbmltYXRpb25FbGVtZW50TWFwLnNldChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgdGhpcy5fYmVmb3JlQW5pbWF0aW9uQnVpbGQoXG4gICAgICAgICAgICBlbnRyeS5wbGF5ZXIubmFtZXNwYWNlSWQsIGVudHJ5Lmluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHBsYXllci5lbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoZWxlbWVudCwgZmFsc2UsIHBsYXllci5uYW1lc3BhY2VJZCwgcGxheWVyLnRyaWdnZXJOYW1lLCBudWxsKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHByZXZQbGF5ZXIgPT4ge1xuICAgICAgICBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwcmV2UGxheWVyKTtcbiAgICAgICAgcHJldlBsYXllci5kZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkIGVpdGhlciBieVxuICAgIC8vIGhhdmluZyB0aGVpciBvd24gbGVhdmUgYW5pbWF0aW9ucyBvciBieSBiZWluZyBxdWVyaWVkIGluIGEgY29udGFpbmVyXG4gICAgLy8gdGhhdCB3aWxsIGJlIHJlbW92ZWQgb25jZSBhIHBhcmVudCBhbmltYXRpb24gaXMgY29tcGxldGUuIFRoZSBpZGVhXG4gICAgLy8gaGVyZSBpcyB0aGF0ICogc3R5bGVzIG11c3QgYmUgaWRlbnRpY2FsIHRvICEgc3R5bGVzIGJlY2F1c2Ugb2ZcbiAgICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSAoKiBpcyBhbHNvIGZpbGxlZCBpbiBieSBkZWZhdWx0IGluIG1hbnkgcGxhY2VzKS5cbiAgICAvLyBPdGhlcndpc2UgKiBzdHlsZXMgd2lsbCByZXR1cm4gYW4gZW1wdHkgdmFsdWUgb3IgXCJhdXRvXCIgc2luY2UgdGhlIGVsZW1lbnRcbiAgICAvLyBwYXNzZWQgdG8gZ2V0Q29tcHV0ZWRTdHlsZSB3aWxsIG5vdCBiZSB2aXNpYmxlIChzaW5jZSAqID09PSBkZXN0aW5hdGlvbilcbiAgICBjb25zdCByZXBsYWNlTm9kZXMgPSBhbGxMZWF2ZU5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIFBPU1QgU1RBR0U6IGZpbGwgdGhlICogc3R5bGVzXG4gICAgY29uc3QgcG9zdFN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBjb25zdCBhbGxMZWF2ZVF1ZXJpZWROb2RlcyA9IGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgcG9zdFN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucywgYWxsUG9zdFN0eWxlRWxlbWVudHMsIEFVVE9fU1RZTEUpO1xuXG4gICAgYWxsTGVhdmVRdWVyaWVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGlmIChyZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKSkge1xuICAgICAgICByZXBsYWNlTm9kZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBSRSBTVEFHRTogZmlsbCB0aGUgISBzdHlsZXNcbiAgICBjb25zdCBwcmVTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgICAgcHJlU3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbmV3IFNldChub2RlcyksIGFsbFByZVN0eWxlRWxlbWVudHMsIFBSRV9TVFlMRSk7XG4gICAgfSk7XG5cbiAgICByZXBsYWNlTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGNvbnN0IHBvc3QgPSBwb3N0U3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIGNvbnN0IHByZSA9IHByZVN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBwb3N0U3R5bGVzTWFwLnNldChub2RlLCB7Li4ucG9zdCwgLi4ucHJlfSBhcyBhbnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9vdFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHN1YlBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCA9IHt9O1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHtlbGVtZW50LCBwbGF5ZXIsIGluc3RydWN0aW9ufSA9IGVudHJ5O1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGl0IHdhcyBuZXZlciBjb25zdW1lZCBieSBhIHBhcmVudCBhbmltYXRpb24gd2hpY2hcbiAgICAgIC8vIG1lYW5zIHRoYXQgaXQgaXMgaW5kZXBlbmRlbnQgYW5kIHRoZXJlZm9yZSBzaG91bGQgYmUgc2V0IGZvciBhbmltYXRpb25cbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICBwbGF5ZXIub3ZlcnJpZGVUb3RhbFRpbWUoaW5zdHJ1Y3Rpb24udG90YWxUaW1lKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGZsb3cgdXAgdGhlIERPTSBhbmQgcXVlcnkgdGhlIG1hcCB0byBmaWd1cmUgb3V0XG4gICAgICAgIC8vIGlmIGEgcGFyZW50IGFuaW1hdGlvbiBoYXMgcHJpb3JpdHkgb3ZlciBpdC4gSW4gdGhlIHNpdHVhdGlvblxuICAgICAgICAvLyB0aGF0IGEgcGFyZW50IGlzIGRldGVjdGVkIHRoZW4gaXQgd2lsbCBjYW5jZWwgdGhlIGxvb3AuIElmXG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZGV0ZWN0ZWQsIG9yIGl0IHRha2VzIGEgZmV3IGhvcHMgdG8gZmluZCBhIHBhcmVudCxcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGZpbGwgaW4gdGhlIG1pc3Npbmcgbm9kZXMgYW5kIHNpZ25hbCB0aGVtIGFzIGhhdmluZ1xuICAgICAgICAvLyBhIGRldGVjdGVkIHBhcmVudCAob3IgYSBOT19QQVJFTlQgdmFsdWUgdmlhIGEgc3BlY2lhbCBjb25zdGFudCkuXG4gICAgICAgIGxldCBwYXJlbnRXaXRoQW5pbWF0aW9uOiBhbnkgPSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQ7XG4gICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50TWFwLnNpemUgPiAxKSB7XG4gICAgICAgICAgbGV0IGVsbSA9IGVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgcGFyZW50c1RvQWRkOiBhbnlbXSA9IFtdO1xuICAgICAgICAgIHdoaWxlIChlbG0gPSBlbG0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0ZWRQYXJlbnQgPSBhbmltYXRpb25FbGVtZW50TWFwLmdldChlbG0pO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkUGFyZW50KSB7XG4gICAgICAgICAgICAgIHBhcmVudFdpdGhBbmltYXRpb24gPSBkZXRlY3RlZFBhcmVudDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRzVG9BZGQucHVzaChlbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnRzVG9BZGQuZm9yRWFjaChwYXJlbnQgPT4gYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQocGFyZW50LCBwYXJlbnRXaXRoQW5pbWF0aW9uKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IHRoaXMuX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLm5hbWVzcGFjZUlkLCBpbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBza2lwcGVkUGxheWVyc01hcCwgcHJlU3R5bGVzTWFwLFxuICAgICAgICAgICAgcG9zdFN0eWxlc01hcCk7XG5cbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuXG4gICAgICAgIGlmIChwYXJlbnRXaXRoQW5pbWF0aW9uID09PSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQpIHtcbiAgICAgICAgICByb290UGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQocGFyZW50V2l0aEFuaW1hdGlvbik7XG4gICAgICAgICAgaWYgKHBhcmVudFBsYXllcnMgJiYgcGFyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllci5wYXJlbnRQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBhcmVudFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAvLyB0aGVyZSBzdGlsbCBtaWdodCBiZSBhIGFuY2VzdG9yIHBsYXllciBhbmltYXRpbmcgdGhpc1xuICAgICAgICAvLyBlbGVtZW50IHRoZXJlZm9yZSB3ZSB3aWxsIHN0aWxsIGFkZCBpdCBhcyBhIHN1YiBwbGF5ZXJcbiAgICAgICAgLy8gZXZlbiBpZiBpdHMgYW5pbWF0aW9uIG1heSBiZSBkaXNhYmxlZFxuICAgICAgICBzdWJQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBmaW5kIGFsbCBvZiB0aGUgc3ViIHBsYXllcnMnIGNvcnJlc3BvbmRpbmcgaW5uZXIgYW5pbWF0aW9uIHBsYXllcnNcbiAgICBzdWJQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIC8vIGV2ZW4gaWYgbm8gcGxheWVycyBhcmUgZm91bmQgZm9yIGEgc3ViIGFuaW1hdGlvbiBpdFxuICAgICAgLy8gd2lsbCBzdGlsbCBjb21wbGV0ZSBpdHNlbGYgYWZ0ZXIgdGhlIG5leHQgdGljayBzaW5jZSBpdCdzIE5vb3BcbiAgICAgIGNvbnN0IHBsYXllcnNGb3JFbGVtZW50ID0gc2tpcHBlZFBsYXllcnNNYXAuZ2V0KHBsYXllci5lbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzRm9yRWxlbWVudCAmJiBwbGF5ZXJzRm9yRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnNGb3JFbGVtZW50KTtcbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgYWN0dWFsbHkgcGxheSB0aGUgYW5pbWF0aW9uIGlzXG4gICAgLy8gYmVjYXVzZSBhbGwgdGhhdCBhIHNraXBwZWQgcGxheWVyIGlzIGRlc2lnbmVkIHRvIGRvIGlzIHRvXG4gICAgLy8gZmlyZSB0aGUgc3RhcnQvZG9uZSB0cmFuc2l0aW9uIGNhbGxiYWNrIGV2ZW50c1xuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGlmIChwbGF5ZXIucGFyZW50UGxheWVyKSB7XG4gICAgICAgIHBsYXllci5zeW5jUGxheWVyRXZlbnRzKHBsYXllci5wYXJlbnRQbGF5ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHJ1biB0aHJvdWdoIGFsbCBvZiB0aGUgcXVldWVkIHJlbW92YWxzIGFuZCBzZWUgaWYgdGhleVxuICAgIC8vIHdlcmUgcGlja2VkIHVwIGJ5IGEgcXVlcnkuIElmIG5vdCB0aGVuIHBlcmZvcm0gdGhlIHJlbW92YWxcbiAgICAvLyBvcGVyYXRpb24gcmlnaHQgYXdheSB1bmxlc3MgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIG9uZ29pbmcuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxMZWF2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gYWxsTGVhdmVOb2Rlc1tpXTtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTEVBVkVfQ0xBU1NOQU1FKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGUgZWxlbWVudCBoYXMgYSByZW1vdmFsIGFuaW1hdGlvbiB0aGF0IGlzIGJlaW5nXG4gICAgICAvLyB0YWtlbiBjYXJlIG9mIGFuZCB0aGVyZWZvcmUgdGhlIGlubmVyIGVsZW1lbnRzIHdpbGwgaGFuZyBhcm91bmRcbiAgICAgIC8vIHVudGlsIHRoYXQgYW5pbWF0aW9uIGlzIG92ZXIgKG9yIHRoZSBwYXJlbnQgcXVlcmllZCBhbmltYXRpb24pXG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLmhhc0FuaW1hdGlvbikgY29udGludWU7XG5cbiAgICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGlzIHF1ZXJpZWQgb3IgaWYgaXQgY29udGFpbnMgcXVlcmllZCBjaGlsZHJlblxuICAgICAgLy8gdGhlbiB3ZSB3YW50IGZvciB0aGUgZWxlbWVudCBub3QgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwYWdlXG4gICAgICAvLyB1bnRpbCB0aGUgcXVlcmllZCBhbmltYXRpb25zIGhhdmUgZmluaXNoZWRcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudHMuc2l6ZSkge1xuICAgICAgICBsZXQgcXVlcmllZFBsYXllclJlc3VsdHMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAocXVlcmllZFBsYXllclJlc3VsdHMgJiYgcXVlcmllZFBsYXllclJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJSZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWVyaWVkSW5uZXJFbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcXVlcmllZElubmVyRWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBsZXQgcXVlcmllZFBsYXllcnMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KHF1ZXJpZWRJbm5lckVsZW1lbnRzW2pdKTtcbiAgICAgICAgICBpZiAocXVlcmllZFBsYXllcnMgJiYgcXVlcmllZFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVQbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocCA9PiAhcC5kZXN0cm95ZWQpO1xuICAgICAgaWYgKGFjdGl2ZVBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKHRoaXMsIGVsZW1lbnQsIGFjdGl2ZVBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgc28gdGhlIGNsZWFudXAgbWV0aG9kIGRvZXNuJ3QgcmVtb3ZlIHRoZW1cbiAgICBhbGxMZWF2ZU5vZGVzLmxlbmd0aCA9IDA7XG5cbiAgICByb290UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH0pO1xuICAgICAgcGxheWVyLnBsYXkoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByb290UGxheWVycztcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55KSB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMuc3RhdGVzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudCkgfHwgY29udGFpbnNEYXRhO1xuICB9XG5cbiAgYWZ0ZXJGbHVzaChjYWxsYmFjazogKCkgPT4gYW55KSB7XG4gICAgdGhpcy5fZmx1c2hGbnMucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBhZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoY2FsbGJhY2s6ICgpID0+IGFueSkge1xuICAgIHRoaXMuX3doZW5RdWlldEZucy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgIGVsZW1lbnQ6IHN0cmluZywgaXNRdWVyaWVkRWxlbWVudDogYm9vbGVhbiwgbmFtZXNwYWNlSWQ/OiBzdHJpbmcsIHRyaWdnZXJOYW1lPzogc3RyaW5nLFxuICAgICAgdG9TdGF0ZVZhbHVlPzogYW55KTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBsZXQgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50UGxheWVycykge1xuICAgICAgICBwbGF5ZXJzID0gcXVlcmllZEVsZW1lbnRQbGF5ZXJzO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgICAgY29uc3QgaXNSZW1vdmFsQW5pbWF0aW9uID0gIXRvU3RhdGVWYWx1ZSB8fCB0b1N0YXRlVmFsdWUgPT0gVk9JRF9WQUxVRTtcbiAgICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSByZXR1cm47XG4gICAgICAgICAgaWYgKCFpc1JlbW92YWxBbmltYXRpb24gJiYgcGxheWVyLnRyaWdnZXJOYW1lICE9IHRyaWdnZXJOYW1lKSByZXR1cm47XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZXNwYWNlSWQgfHwgdHJpZ2dlck5hbWUpIHtcbiAgICAgIHBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAobmFtZXNwYWNlSWQgJiYgbmFtZXNwYWNlSWQgIT0gcGxheWVyLm5hbWVzcGFjZUlkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0cmlnZ2VyTmFtZSAmJiB0cmlnZ2VyTmFtZSAhPSBwbGF5ZXIudHJpZ2dlck5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBwcml2YXRlIF9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sXG4gICAgICBhbGxQcmV2aW91c1BsYXllcnNNYXA6IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4pIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdoZW4gYSByZW1vdmFsIGFuaW1hdGlvbiBvY2N1cnMsIEFMTCBwcmV2aW91cyBwbGF5ZXJzIGFyZSBjb2xsZWN0ZWRcbiAgICAvLyBhbmQgZGVzdHJveWVkIChldmVuIGlmIHRoZXkgYXJlIG91dHNpZGUgb2YgdGhlIGN1cnJlbnQgbmFtZXNwYWNlKVxuICAgIGNvbnN0IHRhcmdldE5hbWVTcGFjZUlkOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZUlkO1xuICAgIGNvbnN0IHRhcmdldFRyaWdnZXJOYW1lOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IHRyaWdnZXJOYW1lO1xuXG4gICAgZm9yIChjb25zdCB0aW1lbGluZUluc3RydWN0aW9uIG9mIGluc3RydWN0aW9uLnRpbWVsaW5lcykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHBsYXllcnMgPSBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSk7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPSB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoXG4gICAgICAgICAgZWxlbWVudCwgaXNRdWVyaWVkRWxlbWVudCwgdGFyZ2V0TmFtZVNwYWNlSWQsIHRhcmdldFRyaWdnZXJOYW1lLCBpbnN0cnVjdGlvbi50b1N0YXRlKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWxQbGF5ZXIgPSAocGxheWVyIGFzIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIpLmdldFJlYWxQbGF5ZXIoKSBhcyBhbnk7XG4gICAgICAgIGlmIChyZWFsUGxheWVyLmJlZm9yZURlc3Ryb3kpIHtcbiAgICAgICAgICByZWFsUGxheWVyLmJlZm9yZURlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbmVlZHMgdG8gYmUgZG9uZSBzbyB0aGF0IHRoZSBQUkUvUE9TVCBzdHlsZXMgY2FuIGJlXG4gICAgLy8gY29tcHV0ZWQgcHJvcGVybHkgd2l0aG91dCBpbnRlcmZlcmluZyB3aXRoIHRoZSBwcmV2aW91cyBhbmltYXRpb25cbiAgICBlcmFzZVN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcyk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEFuaW1hdGlvbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sXG4gICAgICBhbGxQcmV2aW91c1BsYXllcnNNYXA6IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4sXG4gICAgICBza2lwcGVkUGxheWVyc01hcDogTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+LCBwcmVTdHlsZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPixcbiAgICAgIHBvc3RTdHlsZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPik6IEFuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgdHJpZ2dlck5hbWUgPSBpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGluc3RydWN0aW9uLmVsZW1lbnQ7XG5cbiAgICAvLyB3ZSBmaXJzdCBydW4gdGhpcyBzbyB0aGF0IHRoZSBwcmV2aW91cyBhbmltYXRpb24gcGxheWVyXG4gICAgLy8gZGF0YSBjYW4gYmUgcGFzc2VkIGludG8gdGhlIHN1Y2Nlc3NpdmUgYW5pbWF0aW9uIHBsYXllcnNcbiAgICBjb25zdCBhbGxRdWVyaWVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgYWxsQ29uc3VtZWRFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbFN1YkVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgYWxsTmV3UGxheWVycyA9IGluc3RydWN0aW9uLnRpbWVsaW5lcy5tYXAodGltZWxpbmVJbnN0cnVjdGlvbiA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgYWxsQ29uc3VtZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG5cbiAgICAgIC8vIEZJWE1FIChtYXRza28pOiBtYWtlIHN1cmUgdG8tYmUtcmVtb3ZlZCBhbmltYXRpb25zIGFyZSByZW1vdmVkIHByb3Blcmx5XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddO1xuICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5yZW1vdmVkQmVmb3JlUXVlcmllZClcbiAgICAgICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZHVyYXRpb24sIHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZGVsYXkpO1xuXG4gICAgICBjb25zdCBpc1F1ZXJpZWRFbGVtZW50ID0gZWxlbWVudCAhPT0gcm9vdEVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIGZsYXR0ZW5Hcm91cFBsYXllcnMoKGFsbFByZXZpb3VzUGxheWVyc01hcC5nZXQoZWxlbWVudCkgfHwgRU1QVFlfUExBWUVSX0FSUkFZKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocCA9PiBwLmdldFJlYWxQbGF5ZXIoKSkpXG4gICAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGBlbGVtZW50YCBpcyBub3QgYXBhcnQgb2YgdGhlIEFuaW1hdGlvblBsYXllciBkZWZpbml0aW9uLCBidXRcbiAgICAgICAgICAgICAgICAvLyBNb2NrL1dlYkFuaW1hdGlvbnNcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGVsZW1lbnQgd2l0aGluIHRoZWlyIGltcGxlbWVudGF0aW9uLiBUaGlzIHdpbGwgYmUgYWRkZWQgaW4gQW5ndWxhcjUgdG9cbiAgICAgICAgICAgICAgICAvLyBBbmltYXRpb25QbGF5ZXJcbiAgICAgICAgICAgICAgICBjb25zdCBwcCA9IHAgYXMgYW55O1xuICAgICAgICAgICAgICAgIHJldHVybiBwcC5lbGVtZW50ID8gcHAuZWxlbWVudCA9PT0gZWxlbWVudCA6IGZhbHNlO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgY29uc3QgcHJlU3R5bGVzID0gcHJlU3R5bGVzTWFwLmdldChlbGVtZW50KTtcbiAgICAgIGNvbnN0IHBvc3RTdHlsZXMgPSBwb3N0U3R5bGVzTWFwLmdldChlbGVtZW50KTtcbiAgICAgIGNvbnN0IGtleWZyYW1lcyA9IG5vcm1hbGl6ZUtleWZyYW1lcyhcbiAgICAgICAgICB0aGlzLmRyaXZlciwgdGhpcy5fbm9ybWFsaXplciwgZWxlbWVudCwgdGltZWxpbmVJbnN0cnVjdGlvbi5rZXlmcmFtZXMsIHByZVN0eWxlcyxcbiAgICAgICAgICBwb3N0U3R5bGVzKTtcbiAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX2J1aWxkUGxheWVyKHRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGtleWZyYW1lcywgcHJldmlvdXNQbGF5ZXJzKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoaXMgcGFydGljdWxhciBwbGF5ZXIgYmVsb25ncyB0byBhIHN1YiB0cmlnZ2VyLiBJdCBpc1xuICAgICAgLy8gaW1wb3J0YW50IHRoYXQgd2UgbWF0Y2ggdGhpcyBwbGF5ZXIgdXAgd2l0aCB0aGUgY29ycmVzcG9uZGluZyAoQHRyaWdnZXIubGlzdGVuZXIpXG4gICAgICBpZiAodGltZWxpbmVJbnN0cnVjdGlvbi5zdWJUaW1lbGluZSAmJiBza2lwcGVkUGxheWVyc01hcCkge1xuICAgICAgICBhbGxTdWJFbGVtZW50cy5hZGQoZWxlbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1F1ZXJpZWRFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRQbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcihuYW1lc3BhY2VJZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuICAgICAgICB3cmFwcGVkUGxheWVyLnNldFJlYWxQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgYWxsUXVlcmllZFBsYXllcnMucHVzaCh3cmFwcGVkUGxheWVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBsYXllcjtcbiAgICB9KTtcblxuICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgW10pLnB1c2gocGxheWVyKTtcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gZGVsZXRlT3JVbnNldEluTWFwKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQsIHBsYXllci5lbGVtZW50LCBwbGF5ZXIpKTtcbiAgICB9KTtcblxuICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGFkZENsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICBjb25zdCBwbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKGFsbE5ld1BsYXllcnMpO1xuICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgYWxsQ29uc3VtZWRFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSkpO1xuICAgICAgc2V0U3R5bGVzKHJvb3RFbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIGJhc2ljYWxseSBtYWtlcyBhbGwgb2YgdGhlIGNhbGxiYWNrcyBmb3Igc3ViIGVsZW1lbnQgYW5pbWF0aW9uc1xuICAgIC8vIGJlIGRlcGVuZGVudCBvbiB0aGUgdXBwZXIgcGxheWVycyBmb3Igd2hlbiB0aGV5IGZpbmlzaFxuICAgIGFsbFN1YkVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBnZXRPclNldEFzSW5NYXAoc2tpcHBlZFBsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRQbGF5ZXIoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgaWYgKGtleWZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5kcml2ZXIuYW5pbWF0ZShcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lbGVtZW50LCBrZXlmcmFtZXMsIGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSxcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVtcHR5IHRyYW5zaXRpb258ZGVmaW5pdGlvbiBpcyBwcm92aWRlZFxuICAgIC8vIC4uLiB0aGVyZSBpcyBubyBwb2ludCBpbiByZW5kZXJpbmcgYW4gZW1wdHkgYW5pbWF0aW9uXG4gICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9wbGF5ZXI6IEFuaW1hdGlvblBsYXllciA9IG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gIHByaXZhdGUgX2NvbnRhaW5zUmVhbFBsYXllciA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3F1ZXVlZENhbGxiYWNrczoge1tuYW1lOiBzdHJpbmddOiAoKCkgPT4gYW55KVtdfSA9IHt9O1xuICBwdWJsaWMgcmVhZG9ubHkgZGVzdHJveWVkID0gZmFsc2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwdWJsaWMgcGFyZW50UGxheWVyITogQW5pbWF0aW9uUGxheWVyO1xuXG4gIHB1YmxpYyBtYXJrZWRGb3JEZXN0cm95OiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHJlYWRvbmx5IHF1ZXVlZDogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcsIHB1YmxpYyB0cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55KSB7fVxuXG4gIHNldFJlYWxQbGF5ZXIocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbnNSZWFsUGxheWVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgT2JqZWN0LmtleXModGhpcy5fcXVldWVkQ2FsbGJhY2tzKS5mb3JFYWNoKHBoYXNlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrc1twaGFzZV0uZm9yRWFjaChcbiAgICAgICAgICBjYWxsYmFjayA9PiBsaXN0ZW5PblBsYXllcihwbGF5ZXIsIHBoYXNlLCB1bmRlZmluZWQsIGNhbGxiYWNrKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fY29udGFpbnNSZWFsUGxheWVyID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJyaWRlVG90YWxUaW1lKHBsYXllci50b3RhbFRpbWUpO1xuICAgICh0aGlzIGFzIHtxdWV1ZWQ6IGJvb2xlYW59KS5xdWV1ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldFJlYWxQbGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXllcjtcbiAgfVxuXG4gIG92ZXJyaWRlVG90YWxUaW1lKHRvdGFsVGltZTogbnVtYmVyKSB7XG4gICAgKHRoaXMgYXMgYW55KS50b3RhbFRpbWUgPSB0b3RhbFRpbWU7XG4gIH1cblxuICBzeW5jUGxheWVyRXZlbnRzKHBsYXllcjogQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BsYXllciBhcyBhbnk7XG4gICAgaWYgKHAudHJpZ2dlckNhbGxiYWNrKSB7XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBwLnRyaWdnZXJDYWxsYmFjayEoJ3N0YXJ0JykpO1xuICAgIH1cbiAgICBwbGF5ZXIub25Eb25lKCgpID0+IHRoaXMuZmluaXNoKCkpO1xuICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gdGhpcy5kZXN0cm95KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVldWVFdmVudChuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogdm9pZCB7XG4gICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX3F1ZXVlZENhbGxiYWNrcywgbmFtZSwgW10pLnB1c2goY2FsbGJhY2spO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9xdWV1ZUV2ZW50KCdkb25lJywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25Eb25lKGZuKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ3N0YXJ0JywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25TdGFydChmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2Rlc3Ryb3knLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRlc3Ryb3koZm4pO1xuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF5ZXIuaW5pdCgpO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZWQgPyBmYWxzZSA6IHRoaXMuX3BsYXllci5oYXNTdGFydGVkKCk7XG4gIH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucGxheSgpO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wYXVzZSgpO1xuICB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHtcbiAgICAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnJlc3RhcnQoKTtcbiAgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wbGF5ZXIuZmluaXNoKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICh0aGlzIGFzIHtkZXN0cm95ZWQ6IGJvb2xlYW59KS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3BsYXllci5kZXN0cm95KCk7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnJlc2V0KCk7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9wbGF5ZXIuc2V0UG9zaXRpb24ocCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZWQgPyAwIDogdGhpcy5fcGxheWVyLmdldFBvc2l0aW9uKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcC50cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlT3JVbnNldEluTWFwKG1hcDogTWFwPGFueSwgYW55W10+fHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IGFueSwgdmFsdWU6IGFueSkge1xuICBsZXQgY3VycmVudFZhbHVlczogYW55W118bnVsbHx1bmRlZmluZWQ7XG4gIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwLmdldChrZXkpO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtYXAuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXBba2V5XTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY3VycmVudFZhbHVlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlOiBhbnkpOiBhbnkge1xuICAvLyB3ZSB1c2UgYCE9IG51bGxgIGhlcmUgYmVjYXVzZSBpdCdzIHRoZSBtb3N0IHNpbXBsZVxuICAvLyB3YXkgdG8gdGVzdCBhZ2FpbnN0IGEgXCJmYWxzeVwiIHZhbHVlIHdpdGhvdXQgbWl4aW5nXG4gIC8vIGluIGVtcHR5IHN0cmluZ3Mgb3IgYSB6ZXJvIHZhbHVlLiBETyBOT1QgT1BUSU1JWkUuXG4gIHJldHVybiB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnROb2RlKG5vZGU6IGFueSkge1xuICByZXR1cm4gbm9kZSAmJiBub2RlWydub2RlVHlwZSddID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc1RyaWdnZXJFdmVudFZhbGlkKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBldmVudE5hbWUgPT0gJ3N0YXJ0JyB8fCBldmVudE5hbWUgPT0gJ2RvbmUnO1xufVxuXG5mdW5jdGlvbiBjbG9ha0VsZW1lbnQoZWxlbWVudDogYW55LCB2YWx1ZT86IHN0cmluZykge1xuICBjb25zdCBvbGRWYWx1ZSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheTtcbiAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogJ25vbmUnO1xuICByZXR1cm4gb2xkVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICB2YWx1ZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPiwgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnRzOiBTZXQ8YW55PixcbiAgICBlbGVtZW50UHJvcHNNYXA6IE1hcDxhbnksIFNldDxzdHJpbmc+PiwgZGVmYXVsdFN0eWxlOiBzdHJpbmcpOiBhbnlbXSB7XG4gIGNvbnN0IGNsb2FrVmFsczogc3RyaW5nW10gPSBbXTtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrVmFscy5wdXNoKGNsb2FrRWxlbWVudChlbGVtZW50KSkpO1xuXG4gIGNvbnN0IGZhaWxlZEVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuXG4gIGVsZW1lbnRQcm9wc01hcC5mb3JFYWNoKChwcm9wczogU2V0PHN0cmluZz4sIGVsZW1lbnQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBzdHlsZXNbcHJvcF0gPSBkcml2ZXIuY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3AsIGRlZmF1bHRTdHlsZSk7XG5cbiAgICAgIC8vIHRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGRldGVjdCB0aGlzIGJlY2F1c2UgYSBzdWIgZWxlbWVudCBjb3VsZCBiZSByZW1vdmVkXG4gICAgICAvLyBieSBhIHBhcmVudCBhbmltYXRpb24gZWxlbWVudCBiZWluZyBkZXRhY2hlZC5cbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUubGVuZ3RoID09IDApIHtcbiAgICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU7XG4gICAgICAgIGZhaWxlZEVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFsdWVzTWFwLnNldChlbGVtZW50LCBzdHlsZXMpO1xuICB9KTtcblxuICAvLyB3ZSB1c2UgYSBpbmRleCB2YXJpYWJsZSBoZXJlIHNpbmNlIFNldC5mb3JFYWNoKGEsIGkpIGRvZXMgbm90IHJldHVyblxuICAvLyBhbiBpbmRleCB2YWx1ZSBmb3IgdGhlIGNsb3N1cmUgKGJ1dCBpbnN0ZWFkIGp1c3QgdGhlIHZhbHVlKVxuICBsZXQgaSA9IDA7XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha0VsZW1lbnQoZWxlbWVudCwgY2xvYWtWYWxzW2krK10pKTtcblxuICByZXR1cm4gZmFpbGVkRWxlbWVudHM7XG59XG5cbi8qXG5TaW5jZSB0aGUgQW5ndWxhciByZW5kZXJlciBjb2RlIHdpbGwgcmV0dXJuIGEgY29sbGVjdGlvbiBvZiBpbnNlcnRlZFxubm9kZXMgaW4gYWxsIGFyZWFzIG9mIGEgRE9NIHRyZWUsIGl0J3MgdXAgdG8gdGhpcyBhbGdvcml0aG0gdG8gZmlndXJlXG5vdXQgd2hpY2ggbm9kZXMgYXJlIHJvb3RzIGZvciBlYWNoIGFuaW1hdGlvbiBAdHJpZ2dlci5cblxuQnkgcGxhY2luZyBlYWNoIGluc2VydGVkIG5vZGUgaW50byBhIFNldCBhbmQgdHJhdmVyc2luZyB1cHdhcmRzLCBpdFxuaXMgcG9zc2libGUgdG8gZmluZCB0aGUgQHRyaWdnZXIgZWxlbWVudHMgYW5kIHdlbGwgYW55IGRpcmVjdCAqc3RhclxuaW5zZXJ0aW9uIG5vZGVzLCBpZiBhIEB0cmlnZ2VyIHJvb3QgaXMgZm91bmQgdGhlbiB0aGUgZW50ZXIgZWxlbWVudFxuaXMgcGxhY2VkIGludG8gdGhlIE1hcFtAdHJpZ2dlcl0gc3BvdC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRSb290TWFwKHJvb3RzOiBhbnlbXSwgbm9kZXM6IGFueVtdKTogTWFwPGFueSwgYW55W10+IHtcbiAgY29uc3Qgcm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnlbXT4oKTtcbiAgcm9vdHMuZm9yRWFjaChyb290ID0+IHJvb3RNYXAuc2V0KHJvb3QsIFtdKSk7XG5cbiAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSByZXR1cm4gcm9vdE1hcDtcblxuICBjb25zdCBOVUxMX05PREUgPSAxO1xuICBjb25zdCBub2RlU2V0ID0gbmV3IFNldChub2Rlcyk7XG4gIGNvbnN0IGxvY2FsUm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG5cbiAgZnVuY3Rpb24gZ2V0Um9vdChub2RlOiBhbnkpOiBhbnkge1xuICAgIGlmICghbm9kZSkgcmV0dXJuIE5VTExfTk9ERTtcblxuICAgIGxldCByb290ID0gbG9jYWxSb290TWFwLmdldChub2RlKTtcbiAgICBpZiAocm9vdCkgcmV0dXJuIHJvb3Q7XG5cbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgaWYgKHJvb3RNYXAuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIEB0cmlnZ2VyXG4gICAgICByb290ID0gcGFyZW50O1xuICAgIH0gZWxzZSBpZiAobm9kZVNldC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgbmdJZlxuICAgICAgcm9vdCA9IE5VTExfTk9ERTtcbiAgICB9IGVsc2UgeyAgLy8gcmVjdXJzZSB1cHdhcmRzXG4gICAgICByb290ID0gZ2V0Um9vdChwYXJlbnQpO1xuICAgIH1cblxuICAgIGxvY2FsUm9vdE1hcC5zZXQobm9kZSwgcm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBnZXRSb290KG5vZGUpO1xuICAgIGlmIChyb290ICE9PSBOVUxMX05PREUpIHtcbiAgICAgIHJvb3RNYXAuZ2V0KHJvb3QpIS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJvb3RNYXA7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgZWxlbWVudC5jbGFzc0xpc3Q/LmFkZChjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gIGVsZW1lbnQuY2xhc3NMaXN0Py5yZW1vdmUoY2xhc3NOYW1lKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUoXG4gICAgZW5naW5lOiBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lLCBlbGVtZW50OiBhbnksIHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IGVuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkdyb3VwUGxheWVycyhwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllcltdIHtcbiAgY29uc3QgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gIHJldHVybiBmaW5hbFBsYXllcnM7XG59XG5cbmZ1bmN0aW9uIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10sIGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgQW5pbWF0aW9uR3JvdXBQbGF5ZXIpIHtcbiAgICAgIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyLnBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbmFsUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9iakVxdWFscyhhOiB7W2tleTogc3RyaW5nXTogYW55fSwgYjoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgY29uc3QgazEgPSBPYmplY3Qua2V5cyhhKTtcbiAgY29uc3QgazIgPSBPYmplY3Qua2V5cyhiKTtcbiAgaWYgKGsxLmxlbmd0aCAhPSBrMi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrMS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByb3AgPSBrMVtpXTtcbiAgICBpZiAoIWIuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgYVtwcm9wXSAhPT0gYltwcm9wXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKFxuICAgIGVsZW1lbnQ6IGFueSwgYWxsUHJlU3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+LFxuICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4pOiBib29sZWFuIHtcbiAgY29uc3QgcG9zdEVudHJ5ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAoIXBvc3RFbnRyeSkgcmV0dXJuIGZhbHNlO1xuXG4gIGxldCBwcmVFbnRyeSA9IGFsbFByZVN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAocHJlRW50cnkpIHtcbiAgICBwb3N0RW50cnkuZm9yRWFjaChkYXRhID0+IHByZUVudHJ5IS5hZGQoZGF0YSkpO1xuICB9IGVsc2Uge1xuICAgIGFsbFByZVN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHBvc3RFbnRyeSk7XG4gIH1cblxuICBhbGxQb3N0U3R5bGVFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XG4gIHJldHVybiB0cnVlO1xufVxuIl19