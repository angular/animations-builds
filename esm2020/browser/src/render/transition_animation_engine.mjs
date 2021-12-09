/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
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
            throw new Error(`Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn\'t exist!`);
        }
        if (phase == null || phase.length == 0) {
            throw new Error(`Unable to listen on the animation trigger "${name}" because the provided event is undefined!`);
        }
        if (!isTriggerEventValid(phase)) {
            throw new Error(`The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`);
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
            throw new Error(`The provided animation trigger "${name}" has not been registered!`);
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
        if (triggerStates) {
            const players = [];
            Object.keys(triggerStates).forEach(triggerName => {
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
                this._engine.markElementAsRemoved(this.id, element, true, context);
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
    markElementAsRemoved(namespaceId, element, hasAnimation, context) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] =
            { namespaceId, setForRemoval: context, hasAnimation, removedBeforeQueried: false };
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
        throw new Error(`Unable to process animations due to the following failed trigger transitions\n ${errors.join('\n')}`);
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
                    // move animations are currently not supported...
                    if (details && details.setForMove) {
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
                instruction.timelines.forEach(tl => tl.stretchStartingKeyframe = true);
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
                errors.push(`@${instruction.triggerName} has failed due to:\n`);
                instruction.errors.forEach(error => errors.push(`- ${error}\n`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBb0MsVUFBVSxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixJQUFJLG9CQUFvQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQU0zTCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxPQUFPLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQW1CLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHck0sT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFdEgsTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQztBQUM3QyxNQUFNLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQztBQUM3QyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDO0FBQ2pELE1BQU0saUJBQWlCLEdBQUcsc0JBQXNCLENBQUM7QUFDakQsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUM7QUFDMUMsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUM7QUFFMUMsTUFBTSxrQkFBa0IsR0FBZ0MsRUFBRSxDQUFDO0FBQzNELE1BQU0sa0JBQWtCLEdBQTBCO0lBQ2hELFdBQVcsRUFBRSxFQUFFO0lBQ2YsYUFBYSxFQUFFLEtBQUs7SUFDcEIsVUFBVSxFQUFFLEtBQUs7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QUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0M7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciBhcyBBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2luc3RydWN0aW9uJztcbmltcG9ydCB7QW5pbWF0aW9uVHJpZ2dlcn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmlnZ2VyJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuLi9kc2wvZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7Y29weU9iaiwgRU5URVJfQ0xBU1NOQU1FLCBlcmFzZVN0eWxlcywgaXRlcmF0b3JUb0FycmF5LCBMRUFWRV9DTEFTU05BTUUsIE5HX0FOSU1BVElOR19DTEFTU05BTUUsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgTkdfVFJJR0dFUl9DTEFTU05BTUUsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHNldFN0eWxlc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRPclNldEFzSW5NYXAsIGxpc3Rlbk9uUGxheWVyLCBtYWtlQW5pbWF0aW9uRXZlbnQsIG5vcm1hbGl6ZUtleWZyYW1lcywgb3B0aW1pemVHcm91cFBsYXllcn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBRVUVVRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IFFVRVVFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgRElTQUJMRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgRElTQUJMRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgU1RBUl9DTEFTU05BTUUgPSAnbmctc3Rhci1pbnNlcnRlZCc7XG5jb25zdCBTVEFSX1NFTEVDVE9SID0gJy5uZy1zdGFyLWluc2VydGVkJztcblxuY29uc3QgRU1QVFlfUExBWUVSX0FSUkFZOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbmNvbnN0IE5VTExfUkVNT1ZBTF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG59O1xuY29uc3QgTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiB0cnVlXG59O1xuXG5pbnRlcmZhY2UgVHJpZ2dlckxpc3RlbmVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwaGFzZTogc3RyaW5nO1xuICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUluc3RydWN0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICB0cmlnZ2VyTmFtZTogc3RyaW5nO1xuICBmcm9tU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRvU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRyYW5zaXRpb246IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5O1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG4gIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgUkVNT1ZBTF9GTEFHID0gJ19fbmdfcmVtb3ZlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudEFuaW1hdGlvblN0YXRlIHtcbiAgc2V0Rm9yUmVtb3ZhbDogYm9vbGVhbjtcbiAgc2V0Rm9yTW92ZTogYm9vbGVhbjtcbiAgaGFzQW5pbWF0aW9uOiBib29sZWFuO1xuICBuYW1lc3BhY2VJZDogc3RyaW5nO1xuICByZW1vdmVkQmVmb3JlUXVlcmllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsdWUge1xuICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnM7XG5cbiAgZ2V0IHBhcmFtcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXMgYXMge1trZXk6IHN0cmluZ106IGFueX07XG4gIH1cblxuICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZyA9ICcnKSB7XG4gICAgY29uc3QgaXNPYmogPSBpbnB1dCAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBjb25zdCB2YWx1ZSA9IGlzT2JqID8gaW5wdXRbJ3ZhbHVlJ10gOiBpbnB1dDtcbiAgICB0aGlzLnZhbHVlID0gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNPYmopIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb3B5T2JqKGlucHV0IGFzIGFueSk7XG4gICAgICBkZWxldGUgb3B0aW9uc1sndmFsdWUnXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGFic29yYk9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGNvbnN0IG5ld1BhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgIGlmIChuZXdQYXJhbXMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXMhO1xuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAob2xkUGFyYW1zW3Byb3BdID09IG51bGwpIHtcbiAgICAgICAgICBvbGRQYXJhbXNbcHJvcF0gPSBuZXdQYXJhbXNbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9JRF9WQUxVRSA9ICd2b2lkJztcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUQVRFX1ZBTFVFID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHByaXZhdGUgX3RyaWdnZXJzOiB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuICBwcml2YXRlIF9xdWV1ZTogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfZWxlbWVudExpc3RlbmVycyA9IG5ldyBNYXA8YW55LCBUcmlnZ2VyTGlzdGVuZXJbXT4oKTtcblxuICBwcml2YXRlIF9ob3N0Q2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGhvc3RFbGVtZW50OiBhbnksIHByaXZhdGUgX2VuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSkge1xuICAgIHRoaXMuX2hvc3RDbGFzc05hbWUgPSAnbmctdG5zLScgKyBpZDtcbiAgICBhZGRDbGFzcyhob3N0RWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7XG4gIH1cblxuICBsaXN0ZW4oZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKCF0aGlzLl90cmlnZ2Vycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7XG4gICAgICAgICAgcGhhc2V9XCIgYmVjYXVzZSB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgZG9lc25cXCd0IGV4aXN0IWApO1xuICAgIH1cblxuICAgIGlmIChwaGFzZSA9PSBudWxsIHx8IHBoYXNlLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBsaXN0ZW4gb24gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtcbiAgICAgICAgICBuYW1lfVwiIGJlY2F1c2UgdGhlIHByb3ZpZGVkIGV2ZW50IGlzIHVuZGVmaW5lZCFgKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzVHJpZ2dlckV2ZW50VmFsaWQocGhhc2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7cGhhc2V9XCIgZm9yIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBpcyBub3Qgc3VwcG9ydGVkIWApO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLCBlbGVtZW50LCBbXSk7XG4gICAgY29uc3QgZGF0YSA9IHtuYW1lLCBwaGFzZSwgY2FsbGJhY2t9O1xuICAgIGxpc3RlbmVycy5wdXNoKGRhdGEpO1xuXG4gICAgY29uc3QgdHJpZ2dlcnNXaXRoU3RhdGVzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQsIGVsZW1lbnQsIHt9KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyBuYW1lKTtcbiAgICAgIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBpcyByZW1vdmVkIEFGVEVSIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCBsZWF2ZSBhbmltYXRpb25zIGNhbGxiYWNrcyBjYW4gZmlyZSAob3RoZXJ3aXNlIGlmIHRoZSBub2RlXG4gICAgICAvLyBpcyByZW1vdmVkIGluIGJldHdlZW4gdGhlbiB0aGUgbGlzdGVuZXJzIHdvdWxkIGJlIGRlcmVnaXN0ZXJlZClcbiAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihkYXRhKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgICAgICBkZWxldGUgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBhc3Q6IEFuaW1hdGlvblRyaWdnZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgIC8vIHRocm93XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RyaWdnZXJzW25hbWVdID0gYXN0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHJpZ2dlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG4gICAgaWYgKCF0cmlnZ2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBoYXMgbm90IGJlZW4gcmVnaXN0ZXJlZCFgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyaWdnZXI7XG4gIH1cblxuICB0cmlnZ2VyKGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgZGVmYXVsdFRvRmFsbGJhY2s6IGJvb2xlYW4gPSB0cnVlKTpcbiAgICAgIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJ8dW5kZWZpbmVkIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fZ2V0VHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgbGV0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICghdHJpZ2dlcnNXaXRoU3RhdGVzKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSArICctJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuc2V0KGVsZW1lbnQsIHRyaWdnZXJzV2l0aFN0YXRlcyA9IHt9KTtcbiAgICB9XG5cbiAgICBsZXQgZnJvbVN0YXRlID0gdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXTtcbiAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUodmFsdWUsIHRoaXMuaWQpO1xuXG4gICAgY29uc3QgaXNPYmogPSB2YWx1ZSAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBpZiAoIWlzT2JqICYmIGZyb21TdGF0ZSkge1xuICAgICAgdG9TdGF0ZS5hYnNvcmJPcHRpb25zKGZyb21TdGF0ZS5vcHRpb25zKTtcbiAgICB9XG5cbiAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdID0gdG9TdGF0ZTtcblxuICAgIGlmICghZnJvbVN0YXRlKSB7XG4gICAgICBmcm9tU3RhdGUgPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH1cblxuICAgIGNvbnN0IGlzUmVtb3ZhbCA9IHRvU3RhdGUudmFsdWUgPT09IFZPSURfVkFMVUU7XG5cbiAgICAvLyBub3JtYWxseSB0aGlzIGlzbid0IHJlYWNoZWQgYnkgaGVyZSwgaG93ZXZlciwgaWYgYW4gb2JqZWN0IGV4cHJlc3Npb25cbiAgICAvLyBpcyBwYXNzZWQgaW4gdGhlbiBpdCBtYXkgYmUgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS4gQ29tcGFyaW5nIHRoZSB2YWx1ZVxuICAgIC8vIGlzIGltcG9ydGFudCBzaW5jZSB0aGF0IHdpbGwgc3RheSB0aGUgc2FtZSBkZXNwaXRlIHRoZXJlIGJlaW5nIGEgbmV3IG9iamVjdC5cbiAgICAvLyBUaGUgcmVtb3ZhbCBhcmMgaGVyZSBpcyBzcGVjaWFsIGNhc2VkIGJlY2F1c2UgdGhlIHNhbWUgZWxlbWVudCBpcyB0cmlnZ2VyZWRcbiAgICAvLyB0d2ljZSBpbiB0aGUgZXZlbnQgdGhhdCBpdCBjb250YWlucyBhbmltYXRpb25zIG9uIHRoZSBvdXRlci9pbm5lciBwb3J0aW9uc1xuICAgIC8vIG9mIHRoZSBob3N0IGNvbnRhaW5lclxuICAgIGlmICghaXNSZW1vdmFsICYmIGZyb21TdGF0ZS52YWx1ZSA9PT0gdG9TdGF0ZS52YWx1ZSkge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGRlc3BpdGUgdGhlIHZhbHVlIG5vdCBjaGFuZ2luZywgc29tZSBpbm5lciBwYXJhbXNcbiAgICAgIC8vIGhhdmUgY2hhbmdlZCB3aGljaCBtZWFucyB0aGF0IHRoZSBhbmltYXRpb24gZmluYWwgc3R5bGVzIG5lZWQgdG8gYmUgYXBwbGllZFxuICAgICAgaWYgKCFvYmpFcXVhbHMoZnJvbVN0YXRlLnBhcmFtcywgdG9TdGF0ZS5wYXJhbXMpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICAgICAgY29uc3QgZnJvbVN0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXMoZnJvbVN0YXRlLnZhbHVlLCBmcm9tU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBjb25zdCB0b1N0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXModG9TdGF0ZS52YWx1ZSwgdG9TdGF0ZS5wYXJhbXMsIGVycm9ycyk7XG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgZnJvbVN0eWxlcyk7XG4gICAgICAgICAgICBzZXRTdHlsZXMoZWxlbWVudCwgdG9TdHlsZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyc09uRWxlbWVudDogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID1cbiAgICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LCBlbGVtZW50LCBbXSk7XG4gICAgcGxheWVyc09uRWxlbWVudC5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAvLyBvbmx5IHJlbW92ZSB0aGUgcGxheWVyIGlmIGl0IGlzIHF1ZXVlZCBvbiB0aGUgRVhBQ1Qgc2FtZSB0cmlnZ2VyL25hbWVzcGFjZVxuICAgICAgLy8gd2Ugb25seSBhbHNvIGRlYWwgd2l0aCBxdWV1ZWQgcGxheWVycyBoZXJlIGJlY2F1c2UgaWYgdGhlIGFuaW1hdGlvbiBoYXNcbiAgICAgIC8vIHN0YXJ0ZWQgdGhlbiB3ZSB3YW50IHRvIGtlZXAgdGhlIHBsYXllciBhbGl2ZSB1bnRpbCB0aGUgZmx1c2ggaGFwcGVuc1xuICAgICAgLy8gKHdoaWNoIGlzIHdoZXJlIHRoZSBwcmV2aW91c1BsYXllcnMgYXJlIHBhc3NlZCBpbnRvIHRoZSBuZXcgcGxheWVyKVxuICAgICAgaWYgKHBsYXllci5uYW1lc3BhY2VJZCA9PSB0aGlzLmlkICYmIHBsYXllci50cmlnZ2VyTmFtZSA9PSB0cmlnZ2VyTmFtZSAmJiBwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgdHJhbnNpdGlvbiA9XG4gICAgICAgIHRyaWdnZXIubWF0Y2hUcmFuc2l0aW9uKGZyb21TdGF0ZS52YWx1ZSwgdG9TdGF0ZS52YWx1ZSwgZWxlbWVudCwgdG9TdGF0ZS5wYXJhbXMpO1xuICAgIGxldCBpc0ZhbGxiYWNrVHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgaWYgKCFkZWZhdWx0VG9GYWxsYmFjaykgcmV0dXJuO1xuICAgICAgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKFxuICAgICAgICB7ZWxlbWVudCwgdHJpZ2dlck5hbWUsIHRyYW5zaXRpb24sIGZyb21TdGF0ZSwgdG9TdGF0ZSwgcGxheWVyLCBpc0ZhbGxiYWNrVHJhbnNpdGlvbn0pO1xuXG4gICAgaWYgKCFpc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgUVVFVUVEX0NMQVNTTkFNRSk7XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiB7XG4gICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVycykge1xuICAgICAgICBsZXQgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgcGxheWVyc09uRWxlbWVudC5wdXNoKHBsYXllcik7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVyZWdpc3RlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG5cbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmZvckVhY2goKHN0YXRlTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICBkZWxldGUgc3RhdGVNYXBbbmFtZV07XG4gICAgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVycywgZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5zZXQoZWxlbWVudCwgbGlzdGVuZXJzLmZpbHRlcihlbnRyeSA9PiB7XG4gICAgICAgIHJldHVybiBlbnRyeS5uYW1lICE9IG5hbWU7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuICBjbGVhckVsZW1lbnRDYWNoZShlbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmRlbGV0ZShlbGVtZW50KTtcbiAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgIGVsZW1lbnRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKHJvb3RFbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZW5naW5lLmRyaXZlci5xdWVyeShyb290RWxlbWVudCwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgdHJ1ZSk7XG5cbiAgICAvLyBlbXVsYXRlIGEgbGVhdmUgYW5pbWF0aW9uIGZvciBhbGwgaW5uZXIgbm9kZXMgd2l0aGluIHRoaXMgbm9kZS5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gYW5pbWF0aW9ucyBmb3VuZCBmb3IgYW55IG9mIHRoZSBub2RlcyB0aGVuIGNsZWFyIHRoZSBjYWNoZVxuICAgIC8vIGZvciB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsbSA9PiB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYW4gaW5uZXIgcmVtb3ZlKCkgb3BlcmF0aW9uIGhhcyBhbHJlYWR5IGtpY2tlZCBvZmZcbiAgICAgIC8vIHRoZSBhbmltYXRpb24gb24gdGhpcyBlbGVtZW50Li4uXG4gICAgICBpZiAoZWxtW1JFTU9WQUxfRkxBR10pIHJldHVybjtcblxuICAgICAgY29uc3QgbmFtZXNwYWNlcyA9IHRoaXMuX2VuZ2luZS5mZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxtKTtcbiAgICAgIGlmIChuYW1lc3BhY2VzLnNpemUpIHtcbiAgICAgICAgbmFtZXNwYWNlcy5mb3JFYWNoKG5zID0+IG5zLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbG0sIGNvbnRleHQsIGZhbHNlLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgY2hpbGQgZWxlbWVudHMgd2VyZSByZW1vdmVkIGFsb25nIHdpdGggdGhlIHBhcmVudCwgdGhlaXIgYW5pbWF0aW9ucyBtaWdodCBub3RcbiAgICAvLyBoYXZlIGNvbXBsZXRlZC4gQ2xlYXIgYWxsIHRoZSBlbGVtZW50cyBmcm9tIHRoZSBjYWNoZSBzbyB3ZSBkb24ndCBlbmQgdXAgd2l0aCBhIG1lbW9yeSBsZWFrLlxuICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoXG4gICAgICAgICgpID0+IGVsZW1lbnRzLmZvckVhY2goZWxtID0+IHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxtKSkpO1xuICB9XG5cbiAgdHJpZ2dlckxlYXZlQW5pbWF0aW9uKFxuICAgICAgZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGRlc3Ryb3lBZnRlckNvbXBsZXRlPzogYm9vbGVhbixcbiAgICAgIGRlZmF1bHRUb0ZhbGxiYWNrPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRyaWdnZXJTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAodHJpZ2dlclN0YXRlcykge1xuICAgICAgY29uc3QgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgICBPYmplY3Qua2V5cyh0cmlnZ2VyU3RhdGVzKS5mb3JFYWNoKHRyaWdnZXJOYW1lID0+IHtcbiAgICAgICAgLy8gdGhpcyBjaGVjayBpcyBoZXJlIGluIHRoZSBldmVudCB0aGF0IGFuIGVsZW1lbnQgaXMgcmVtb3ZlZFxuICAgICAgICAvLyB0d2ljZSAoYm90aCBvbiB0aGUgaG9zdCBsZXZlbCBhbmQgdGhlIGNvbXBvbmVudCBsZXZlbClcbiAgICAgICAgaWYgKHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXSkge1xuICAgICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMudHJpZ2dlcihlbGVtZW50LCB0cmlnZ2VyTmFtZSwgVk9JRF9WQUxVRSwgZGVmYXVsdFRvRmFsbGJhY2spO1xuICAgICAgICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9lbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgdHJ1ZSwgY29udGV4dCk7XG4gICAgICAgIGlmIChkZXN0cm95QWZ0ZXJDb21wbGV0ZSkge1xuICAgICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHRoaXMuX2VuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcblxuICAgIC8vIGlmIHRoaXMgc3RhdGVtZW50IGZhaWxzIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgZWxlbWVudCB3YXMgcGlja2VkIHVwXG4gICAgLy8gYnkgYW4gZWFybGllciBmbHVzaCAob3IgdGhlcmUgYXJlIG5vIGxpc3RlbmVycyBhdCBhbGwgdG8gdHJhY2sgdGhlIGxlYXZlKS5cbiAgICBpZiAobGlzdGVuZXJzICYmIGVsZW1lbnRTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IHZpc2l0ZWRUcmlnZ2VycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGxpc3RlbmVyLm5hbWU7XG4gICAgICAgIGlmICh2aXNpdGVkVHJpZ2dlcnMuaGFzKHRyaWdnZXJOYW1lKSkgcmV0dXJuO1xuICAgICAgICB2aXNpdGVkVHJpZ2dlcnMuYWRkKHRyaWdnZXJOYW1lKTtcblxuICAgICAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdO1xuICAgICAgICBjb25zdCB0cmFuc2l0aW9uID0gdHJpZ2dlci5mYWxsYmFja1RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IGZyb21TdGF0ZSA9IGVsZW1lbnRTdGF0ZXNbdHJpZ2dlck5hbWVdIHx8IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICB0cmlnZ2VyTmFtZSxcbiAgICAgICAgICB0cmFuc2l0aW9uLFxuICAgICAgICAgIGZyb21TdGF0ZSxcbiAgICAgICAgICB0b1N0YXRlLFxuICAgICAgICAgIHBsYXllcixcbiAgICAgICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9lbmdpbmU7XG4gICAgaWYgKGVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhICogPT4gVk9JRCBhbmltYXRpb24gd2FzIGRldGVjdGVkIGFuZCBraWNrZWQgb2ZmXG4gICAgaWYgKHRoaXMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsZW1lbnQsIGNvbnRleHQsIHRydWUpKSByZXR1cm47XG5cbiAgICAvLyBmaW5kIHRoZSBwbGF5ZXIgdGhhdCBpcyBhbmltYXRpbmcgYW5kIG1ha2Ugc3VyZSB0aGF0IHRoZVxuICAgIC8vIHJlbW92YWwgaXMgZGVsYXllZCB1bnRpbCB0aGF0IHBsYXllciBoYXMgY29tcGxldGVkXG4gICAgbGV0IGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmIChlbmdpbmUudG90YWxBbmltYXRpb25zKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGxheWVycyA9XG4gICAgICAgICAgZW5naW5lLnBsYXllcnMubGVuZ3RoID8gZW5naW5lLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KSA6IFtdO1xuXG4gICAgICAvLyB3aGVuIHRoaXMgYGlmIHN0YXRlbWVudGAgZG9lcyBub3QgY29udGludWUgZm9yd2FyZCBpdCBtZWFucyB0aGF0XG4gICAgICAvLyBhIHByZXZpb3VzIGFuaW1hdGlvbiBxdWVyeSBoYXMgc2VsZWN0ZWQgdGhlIGN1cnJlbnQgZWxlbWVudCBhbmRcbiAgICAgIC8vIGlzIGFuaW1hdGluZyBpdC4gSW4gdGhpcyBzaXR1YXRpb24gd2FudCB0byBjb250aW51ZSBmb3J3YXJkcyBhbmRcbiAgICAgIC8vIGFsbG93IHRoZSBlbGVtZW50IHRvIGJlIHF1ZXVlZCB1cCBmb3IgYW5pbWF0aW9uIGxhdGVyLlxuICAgICAgaWYgKGN1cnJlbnRQbGF5ZXJzICYmIGN1cnJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHdoaWxlIChwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQocGFyZW50KTtcbiAgICAgICAgICBpZiAodHJpZ2dlcnMpIHtcbiAgICAgICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHN0YWdlIHdlIGtub3cgdGhhdCB0aGUgZWxlbWVudCB3aWxsIGVpdGhlciBnZXQgcmVtb3ZlZFxuICAgIC8vIGR1cmluZyBmbHVzaCBvciB3aWxsIGJlIHBpY2tlZCB1cCBieSBhIHBhcmVudCBxdWVyeS4gRWl0aGVyIHdheVxuICAgIC8vIHdlIG5lZWQgdG8gZmlyZSB0aGUgbGlzdGVuZXJzIGZvciB0aGlzIGVsZW1lbnQgd2hlbiBpdCBET0VTIGdldFxuICAgIC8vIHJlbW92ZWQgKG9uY2UgdGhlIHF1ZXJ5IHBhcmVudCBhbmltYXRpb24gaXMgZG9uZSBvciBhZnRlciBmbHVzaClcbiAgICB0aGlzLnByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50KTtcblxuICAgIC8vIHdoZXRoZXIgb3Igbm90IGEgcGFyZW50IGhhcyBhbiBhbmltYXRpb24gd2UgbmVlZCB0byBkZWxheSB0aGUgZGVmZXJyYWwgb2YgdGhlIGxlYXZlXG4gICAgLy8gb3BlcmF0aW9uIHVudGlsIHdlIGhhdmUgbW9yZSBpbmZvcm1hdGlvbiAod2hpY2ggd2UgZG8gYWZ0ZXIgZmx1c2goKSBoYXMgYmVlbiBjYWxsZWQpXG4gICAgaWYgKGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbikge1xuICAgICAgZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVtb3ZhbEZsYWcgPSBlbGVtZW50W1JFTU9WQUxfRkxBR107XG4gICAgICBpZiAoIXJlbW92YWxGbGFnIHx8IHJlbW92YWxGbGFnID09PSBOVUxMX1JFTU9WQUxfU1RBVEUpIHtcbiAgICAgICAgLy8gd2UgZG8gdGhpcyBhZnRlciB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgICAgLy8gdGhhdCB0aGUgY2FsbGJhY2tzIGNhbiBiZSBmaXJlZFxuICAgICAgICBlbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpKTtcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICAgIGVuZ2luZS5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0Tm9kZShlbGVtZW50OiBhbnksIHBhcmVudDogYW55KTogdm9pZCB7XG4gICAgYWRkQ2xhc3MoZWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7XG4gIH1cblxuICBkcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkOiBudW1iZXIpOiBRdWV1ZUluc3RydWN0aW9uW10ge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG4gICAgdGhpcy5fcXVldWUuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICBpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXI6IFRyaWdnZXJMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgIGlmIChsaXN0ZW5lci5uYW1lID09IGVudHJ5LnRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlRXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICAgICAgICAgICAgZWxlbWVudCwgZW50cnkudHJpZ2dlck5hbWUsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAoYmFzZUV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBtaWNyb3Rhc2tJZDtcbiAgICAgICAgICAgIGxpc3Rlbk9uUGxheWVyKGVudHJ5LnBsYXllciwgbGlzdGVuZXIucGhhc2UsIGJhc2VFdmVudCwgbGlzdGVuZXIuY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXIubWFya2VkRm9yRGVzdHJveSkge1xuICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgLy8gbm93IHdlIGNhbiBkZXN0cm95IHRoZSBlbGVtZW50IHByb3Blcmx5IHNpbmNlIHRoZSBldmVudCBsaXN0ZW5lcnMgaGF2ZVxuICAgICAgICAgIC8vIGJlZW4gYm91bmQgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVldWUgPSBbXTtcblxuICAgIHJldHVybiBpbnN0cnVjdGlvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8gaWYgZGVwQ291bnQgPT0gMCB0aGVtIG1vdmUgdG8gZnJvbnRcbiAgICAgIC8vIG90aGVyd2lzZSBpZiBhIGNvbnRhaW5zIGIgdGhlbiBtb3ZlIGJhY2tcbiAgICAgIGNvbnN0IGQwID0gYS50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGNvbnN0IGQxID0gYi50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGlmIChkMCA9PSAwIHx8IGQxID09IDApIHtcbiAgICAgICAgcmV0dXJuIGQwIC0gZDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZW5naW5lLmRyaXZlci5jb250YWluc0VsZW1lbnQoYS5lbGVtZW50LCBiLmVsZW1lbnQpID8gMSA6IC0xO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveShjb250ZXh0OiBhbnkpIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHAuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyh0aGlzLmhvc3RFbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBjb250YWluc0RhdGEgPVxuICAgICAgICAodGhpcy5fcXVldWUuZmluZChlbnRyeSA9PiBlbnRyeS5lbGVtZW50ID09PSBlbGVtZW50KSA/IHRydWUgOiBmYWxzZSkgfHwgY29udGFpbnNEYXRhO1xuICAgIHJldHVybiBjb250YWluc0RhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZWRUcmFuc2l0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uO1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBwdWJsaWMgbmV3SG9zdEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHBsYXllcnNCeVF1ZXJpZWRFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHN0YXRlc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBTdGF0ZVZhbHVlfT4oKTtcbiAgcHVibGljIGRpc2FibGVkTm9kZXMgPSBuZXcgU2V0PGFueT4oKTtcblxuICBwdWJsaWMgdG90YWxBbmltYXRpb25zID0gMDtcbiAgcHVibGljIHRvdGFsUXVldWVkUGxheWVycyA9IDA7XG5cbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTG9va3VwOiB7W2lkOiBzdHJpbmddOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlfSA9IHt9O1xuICBwcml2YXRlIF9uYW1lc3BhY2VMaXN0OiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmx1c2hGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHJpdmF0ZSBfd2hlblF1aWV0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG5cbiAgcHVibGljIG5hbWVzcGFjZXNCeUhvc3RFbGVtZW50ID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBjb2xsZWN0ZWRFbnRlckVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuICBwdWJsaWMgY29sbGVjdGVkTGVhdmVFbGVtZW50czogYW55W10gPSBbXTtcblxuICAvLyB0aGlzIG1ldGhvZCBpcyBkZXNpZ25lZCB0byBiZSBvdmVycmlkZGVuIGJ5IHRoZSBjb2RlIHRoYXQgdXNlcyB0aGlzIGVuZ2luZVxuICBwdWJsaWMgb25SZW1vdmFsQ29tcGxldGUgPSAoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpID0+IHt9O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGJvZHlOb2RlOiBhbnksIHB1YmxpYyBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlcixcbiAgICAgIHByaXZhdGUgX25vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcikge31cblxuICBnZXQgcXVldWVkUGxheWVycygpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIHRoaXMuX25hbWVzcGFjZUxpc3QuZm9yRWFjaChucyA9PiB7XG4gICAgICBucy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IG5zID0gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50LCB0aGlzKTtcbiAgICBpZiAodGhpcy5ib2R5Tm9kZSAmJiB0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQodGhpcy5ib2R5Tm9kZSwgaG9zdEVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9iYWxhbmNlTmFtZXNwYWNlTGlzdChucywgaG9zdEVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWZlciB0aGlzIGxhdGVyIHVudGlsIGZsdXNoIGR1cmluZyB3aGVuIHRoZSBob3N0IGVsZW1lbnQgaGFzXG4gICAgICAvLyBiZWVuIGluc2VydGVkIHNvIHRoYXQgd2Uga25vdyBleGFjdGx5IHdoZXJlIHRvIHBsYWNlIGl0IGluXG4gICAgICAvLyB0aGUgbmFtZXNwYWNlIGxpc3RcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLnNldChob3N0RWxlbWVudCwgbnMpO1xuXG4gICAgICAvLyBnaXZlbiB0aGF0IHRoaXMgaG9zdCBlbGVtZW50IGlzIGEgcGFydCBvZiB0aGUgYW5pbWF0aW9uIGNvZGUsIGl0XG4gICAgICAvLyBtYXkgb3IgbWF5IG5vdCBiZSBpbnNlcnRlZCBieSBhIHBhcmVudCBub2RlIHRoYXQgaXMgb2YgYW5cbiAgICAgIC8vIGFuaW1hdGlvbiByZW5kZXJlciB0eXBlLiBJZiB0aGlzIGhhcHBlbnMgdGhlbiB3ZSBjYW4gc3RpbGwgaGF2ZVxuICAgICAgLy8gYWNjZXNzIHRvIHRoaXMgaXRlbSB3aGVuIHdlIHF1ZXJ5IGZvciA6ZW50ZXIgbm9kZXMuIElmIHRoZSBwYXJlbnRcbiAgICAgIC8vIGlzIGEgcmVuZGVyZXIgdGhlbiB0aGUgc2V0IGRhdGEtc3RydWN0dXJlIHdpbGwgbm9ybWFsaXplIHRoZSBlbnRyeVxuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF0gPSBucztcbiAgfVxuXG4gIHByaXZhdGUgX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7XG4gICAgaWYgKGxpbWl0ID49IDApIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaSA9IGxpbWl0OyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBuZXh0TmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChuZXh0TmFtZXNwYWNlLmhvc3RFbGVtZW50LCBob3N0RWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpICsgMSwgMCwgbnMpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZSgwLCAwLCBucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3QucHVzaChucyk7XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAoIW5zKSB7XG4gICAgICBucyA9IHRoaXMuY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyVHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHRyaWdnZXI6IEFuaW1hdGlvblRyaWdnZXIpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmIChucyAmJiBucy5yZWdpc3RlcihuYW1lLCB0cmlnZ2VyKSkge1xuICAgICAgdGhpcy50b3RhbEFuaW1hdGlvbnMrKztcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIGlmICghbmFtZXNwYWNlSWQpIHJldHVybjtcblxuICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZGVsZXRlKG5zLmhvc3RFbGVtZW50KTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9uYW1lc3BhY2VMaXN0LmluZGV4T2YobnMpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoKCkgPT4gbnMuZGVzdHJveShjb250ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIF9mZXRjaE5hbWVzcGFjZShpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtpZF07XG4gIH1cblxuICBmZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxlbWVudDogYW55KTogU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+IHtcbiAgICAvLyBub3JtYWxseSB0aGVyZSBzaG91bGQgb25seSBiZSBvbmUgbmFtZXNwYWNlIHBlciBlbGVtZW50LCBob3dldmVyXG4gICAgLy8gaWYgQHRyaWdnZXJzIGFyZSBwbGFjZWQgb24gYm90aCB0aGUgY29tcG9uZW50IGVsZW1lbnQgYW5kIHRoZW5cbiAgICAvLyBpdHMgaG9zdCBlbGVtZW50ICh3aXRoaW4gdGhlIGNvbXBvbmVudCBjb2RlKSB0aGVuIHRoZXJlIHdpbGwgYmVcbiAgICAvLyB0d28gbmFtZXNwYWNlcyByZXR1cm5lZC4gV2UgdXNlIGEgc2V0IGhlcmUgdG8gc2ltcGx5IGRlZHVwbGljYXRlXG4gICAgLy8gdGhlIG5hbWVzcGFjZXMgaW4gY2FzZSAoZm9yIHRoZSByZWFzb24gZGVzY3JpYmVkIGFib3ZlKSB0aGVyZSBhcmUgbXVsdGlwbGUgdHJpZ2dlcnNcbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhlbGVtZW50U3RhdGVzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuc0lkID0gZWxlbWVudFN0YXRlc1trZXlzW2ldXS5uYW1lc3BhY2VJZDtcbiAgICAgICAgaWYgKG5zSWQpIHtcbiAgICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5zSWQpO1xuICAgICAgICAgIGlmIChucykge1xuICAgICAgICAgICAgbmFtZXNwYWNlcy5hZGQobnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmFtZXNwYWNlcztcbiAgfVxuXG4gIHRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMudHJpZ2dlcihlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpbnNlcnROb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnksIGluc2VydEJlZm9yZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBhbmQgcmVpbnNlcnRlZCAobW92ZSBvcGVyYXRpb24pXG4gICAgLy8gd2hlbiB0aGlzIG9jY3VycyB3ZSBkbyBub3Qgd2FudCB0byB1c2UgdGhlIGVsZW1lbnQgZm9yIGRlbGV0aW9uIGxhdGVyXG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICBkZXRhaWxzLnNldEZvclJlbW92YWwgPSBmYWxzZTtcbiAgICAgIGRldGFpbHMuc2V0Rm9yTW92ZSA9IHRydWU7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIG5hbWVzcGFjZUlkIGlzIGJsYW5rIHRoZW4gdGhlIGNhbGxlclxuICAgIC8vIGNvZGUgZG9lcyBub3QgY29udGFpbiBhbnkgYW5pbWF0aW9uIGNvZGUgaW4gaXQsIGJ1dCBpdCBpc1xuICAgIC8vIGp1c3QgYmVpbmcgY2FsbGVkIHNvIHRoYXQgdGhlIG5vZGUgaXMgbWFya2VkIGFzIGJlaW5nIGluc2VydGVkXG4gICAgaWYgKG5hbWVzcGFjZUlkKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcbiAgICAgIC8vIFRoaXMgaWYtc3RhdGVtZW50IGlzIGEgd29ya2Fyb3VuZCBmb3Igcm91dGVyIGlzc3VlICMyMTk0Ny5cbiAgICAgIC8vIFRoZSByb3V0ZXIgc29tZXRpbWVzIGhpdHMgYSByYWNlIGNvbmRpdGlvbiB3aGVyZSB3aGlsZSBhIHJvdXRlXG4gICAgICAvLyBpcyBiZWluZyBpbnN0YW50aWF0ZWQgYSBuZXcgbmF2aWdhdGlvbiBhcnJpdmVzLCB0cmlnZ2VyaW5nIGxlYXZlXG4gICAgICAvLyBhbmltYXRpb24gb2YgRE9NIHRoYXQgaGFzIG5vdCBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCB1bnRpbCB0aGlzXG4gICAgICAvLyBpcyByZXNvbHZlZCwgd2UgbmVlZCB0byBoYW5kbGUgdGhlIHNjZW5hcmlvIHdoZW4gRE9NIGlzIG5vdCBpbiBhXG4gICAgICAvLyBjb25zaXN0ZW50IHN0YXRlIGR1cmluZyB0aGUgYW5pbWF0aW9uLlxuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLmluc2VydE5vZGUoZWxlbWVudCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmx5ICpkaXJlY3RpdmVzIGFuZCBob3N0IGVsZW1lbnRzIGFyZSBpbnNlcnRlZCBiZWZvcmVcbiAgICBpZiAoaW5zZXJ0QmVmb3JlKSB7XG4gICAgICB0aGlzLmNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgY29sbGVjdEVudGVyRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgfVxuXG4gIG1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50OiBhbnksIHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5kZWxldGUoZWxlbWVudCk7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBpc0hvc3RFbGVtZW50OiBib29sZWFuLCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgY29uc3QgbnMgPSBuYW1lc3BhY2VJZCA/IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKSA6IG51bGw7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMucmVtb3ZlTm9kZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSG9zdEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaG9zdE5TID0gdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmIChob3N0TlMgJiYgaG9zdE5TLmlkICE9PSBuYW1lc3BhY2VJZCkge1xuICAgICAgICAgIGhvc3ROUy5yZW1vdmVOb2RlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaGFzQW5pbWF0aW9uPzogYm9vbGVhbiwgY29udGV4dD86IGFueSkge1xuICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9XG4gICAgICAgIHtuYW1lc3BhY2VJZCwgc2V0Rm9yUmVtb3ZhbDogY29udGV4dCwgaGFzQW5pbWF0aW9uLCByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2V9O1xuICB9XG5cbiAgbGlzdGVuKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmxpc3RlbihlbGVtZW50LCBuYW1lLCBwaGFzZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge307XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEluc3RydWN0aW9uKFxuICAgICAgZW50cnk6IFF1ZXVlSW5zdHJ1Y3Rpb24sIHN1YlRpbWVsaW5lczogRWxlbWVudEluc3RydWN0aW9uTWFwLCBlbnRlckNsYXNzTmFtZTogc3RyaW5nLFxuICAgICAgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgc2tpcEJ1aWxkQXN0PzogYm9vbGVhbikge1xuICAgIHJldHVybiBlbnRyeS50cmFuc2l0aW9uLmJ1aWxkKFxuICAgICAgICB0aGlzLmRyaXZlciwgZW50cnkuZWxlbWVudCwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlLCBlbnRlckNsYXNzTmFtZSxcbiAgICAgICAgbGVhdmVDbGFzc05hbWUsIGVudHJ5LmZyb21TdGF0ZS5vcHRpb25zLCBlbnRyeS50b1N0YXRlLm9wdGlvbnMsIHN1YlRpbWVsaW5lcywgc2tpcEJ1aWxkQXN0KTtcbiAgfVxuXG4gIGRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoY29udGFpbmVyRWxlbWVudDogYW55KSB7XG4gICAgbGV0IGVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoY29udGFpbmVyRWxlbWVudCwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZGVzdHJveUFjdGl2ZUFuaW1hdGlvbnNGb3JFbGVtZW50KGVsZW1lbnQpKTtcblxuICAgIGlmICh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LnNpemUgPT0gMCkgcmV0dXJuO1xuXG4gICAgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIHRydWUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB0aGlzLmZpbmlzaEFjdGl2ZVF1ZXJpZWRBbmltYXRpb25PbkVsZW1lbnQoZWxlbWVudCkpO1xuICB9XG5cbiAgZGVzdHJveUFjdGl2ZUFuaW1hdGlvbnNGb3JFbGVtZW50KGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgc2V0IGZvciBkZXN0cnVjdGlvbiwgYnV0IGhhc24ndCBzdGFydGVkLlxuICAgICAgICAvLyBpbiB0aGlzIHNpdHVhdGlvbiB3ZSB3YW50IHRvIGRlbGF5IHRoZSBkZXN0cnVjdGlvbiB1bnRpbCB0aGUgZmx1c2ggb2NjdXJzXG4gICAgICAgIC8vIHNvIHRoYXQgYW55IGV2ZW50IGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGUgcGxheWVyIGFyZSB0cmlnZ2VyZWQuXG4gICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgICAgcGxheWVyLm1hcmtlZEZvckRlc3Ryb3kgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaEFjdGl2ZVF1ZXJpZWRBbmltYXRpb25PbkVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5maW5pc2goKSk7XG4gICAgfVxuICB9XG5cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAodGhpcy5wbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb3B0aW1pemVHcm91cFBsYXllcih0aGlzLnBsYXllcnMpLm9uRG9uZSgoKSA9PiByZXNvbHZlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgIC8vIHRoaXMgd2lsbCBwcmV2ZW50IGl0IGZyb20gcmVtb3ZpbmcgaXQgdHdpY2VcbiAgICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IE5VTExfUkVNT1ZBTF9TVEFURTtcbiAgICAgIGlmIChkZXRhaWxzLm5hbWVzcGFjZUlkKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveUlubmVyQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShkZXRhaWxzLm5hbWVzcGFjZUlkKTtcbiAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgbnMuY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0Py5jb250YWlucyhESVNBQkxFRF9DTEFTU05BTUUpKSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IsIHRydWUpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChub2RlLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICBmbHVzaChtaWNyb3Rhc2tJZDogbnVtYmVyID0gLTEpIHtcbiAgICBsZXQgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAodGhpcy5uZXdIb3N0RWxlbWVudHMuc2l6ZSkge1xuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuZm9yRWFjaCgobnMsIGVsZW1lbnQpID0+IHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBlbGVtZW50KSk7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvdGFsQW5pbWF0aW9ucyAmJiB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbG0gPSB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHNbaV07XG4gICAgICAgIGFkZENsYXNzKGVsbSwgU1RBUl9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAmJlxuICAgICAgICAodGhpcy50b3RhbFF1ZXVlZFBsYXllcnMgfHwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgIGNvbnN0IGNsZWFudXBGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBsYXllcnMgPSB0aGlzLl9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZucywgbWljcm90YXNrSWQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGVhbnVwRm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2xlYW51cEZuc1tpXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRvdGFsUXVldWVkUGxheWVycyA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fZmx1c2hGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9mbHVzaEZucyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX3doZW5RdWlldEZucy5sZW5ndGgpIHtcbiAgICAgIC8vIHdlIG1vdmUgdGhlc2Ugb3ZlciB0byBhIHZhcmlhYmxlIHNvIHRoYXRcbiAgICAgIC8vIGlmIGFueSBuZXcgY2FsbGJhY2tzIGFyZSByZWdpc3RlcmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGZsdXNoIHRoZXkgZG8gbm90IHBvcHVsYXRlIHRoZSBleGlzdGluZyBzZXRcbiAgICAgIGNvbnN0IHF1aWV0Rm5zID0gdGhpcy5fd2hlblF1aWV0Rm5zO1xuICAgICAgdGhpcy5fd2hlblF1aWV0Rm5zID0gW107XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgICAgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcG9ydEVycm9yKGVycm9yczogc3RyaW5nW10pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gcHJvY2VzcyBhbmltYXRpb25zIGR1ZSB0byB0aGUgZm9sbG93aW5nIGZhaWxlZCB0cmlnZ2VyIHRyYW5zaXRpb25zXFxuICR7XG4gICAgICAgICAgICBlcnJvcnMuam9pbignXFxuJyl9YCk7XG4gIH1cblxuICBwcml2YXRlIF9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZuczogRnVuY3Rpb25bXSwgbWljcm90YXNrSWQ6IG51bWJlcik6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHN1YlRpbWVsaW5lcyA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgcXVldWVkSW5zdHJ1Y3Rpb25zOiBRdWV1ZWRUcmFuc2l0aW9uW10gPSBbXTtcbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IGFsbFByZVN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG4gICAgY29uc3QgYWxsUG9zdFN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG5cbiAgICBjb25zdCBkaXNhYmxlZEVsZW1lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gICAgdGhpcy5kaXNhYmxlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2RlKTtcbiAgICAgIGNvbnN0IG5vZGVzVGhhdEFyZURpc2FibGVkID0gdGhpcy5kcml2ZXIucXVlcnkobm9kZSwgUVVFVUVEX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUaGF0QXJlRGlzYWJsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZXNUaGF0QXJlRGlzYWJsZWRbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgYm9keU5vZGUgPSB0aGlzLmJvZHlOb2RlO1xuICAgIGNvbnN0IGFsbFRyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5zdGF0ZXNCeUVsZW1lbnQua2V5cygpKTtcbiAgICBjb25zdCBlbnRlck5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMpO1xuXG4gICAgLy8gdGhpcyBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBidWlsdCBiZWxvdyBzdWNoIHRoYXRcbiAgICAvLyB0aGUgOmVudGVyIHF1ZXJpZXMgbWF0Y2ggdGhlIGVsZW1lbnRzIChzaW5jZSB0aGUgdGltZWxpbmUgcXVlcmllc1xuICAgIC8vIGFyZSBmaXJlZCBkdXJpbmcgaW5zdHJ1Y3Rpb24gYnVpbGRpbmcpLlxuICAgIGNvbnN0IGVudGVyTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gRU5URVJfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgZW50ZXJOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsTGVhdmVOb2RlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBtZXJnZWRMZWF2ZU5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zID0gbmV3IFNldDxhbnk+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgICBhbGxMZWF2ZU5vZGVzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZGV0YWlscy5oYXNBbmltYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBTVEFSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbG0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVhdmVOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCBBcnJheS5mcm9tKG1lcmdlZExlYXZlTm9kZXMpKTtcbiAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IExFQVZFX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGxlYXZlTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNsZWFudXBGbnMucHVzaCgoKSA9PiB7XG4gICAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChyb290KSE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChyb290KSE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxMZWF2ZU5vZGVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgZXJyb25lb3VzVHJhbnNpdGlvbnM6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbltdID0gW107XG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgIG5zLmRyYWluUXVldWVkVHJhbnNpdGlvbnMobWljcm90YXNrSWQpLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgICBhbGxQbGF5ZXJzLnB1c2gocGxheWVyKTtcblxuICAgICAgICBpZiAodGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgICAgIC8vIG1vdmUgYW5pbWF0aW9ucyBhcmUgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQuLi5cbiAgICAgICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvck1vdmUpIHtcbiAgICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZUlzT3JwaGFuZWQgPSAhYm9keU5vZGUgfHwgIXRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChib2R5Tm9kZSwgZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IGxlYXZlQ2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChlbGVtZW50KSE7XG4gICAgICAgIGNvbnN0IGVudGVyQ2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChlbGVtZW50KSE7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gdGhpcy5fYnVpbGRJbnN0cnVjdGlvbihcbiAgICAgICAgICAgIGVudHJ5LCBzdWJUaW1lbGluZXMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgbm9kZUlzT3JwaGFuZWQpITtcbiAgICAgICAgaWYgKGluc3RydWN0aW9uLmVycm9ycyAmJiBpbnN0cnVjdGlvbi5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgZXJyb25lb3VzVHJhbnNpdGlvbnMucHVzaChpbnN0cnVjdGlvbik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZXZlbiB0aG91Z2ggdGhlIGVsZW1lbnQgbWF5IG5vdCBiZSBpbiB0aGUgRE9NLCBpdCBtYXkgc3RpbGxcbiAgICAgICAgLy8gYmUgYWRkZWQgYXQgYSBsYXRlciBwb2ludCAoZHVlIHRvIHRoZSBtZWNoYW5pY3Mgb2YgY29udGVudFxuICAgICAgICAvLyBwcm9qZWN0aW9uIGFuZC9vciBkeW5hbWljIGNvbXBvbmVudCBpbnNlcnRpb24pIHRoZXJlZm9yZSBpdCdzXG4gICAgICAgIC8vIGltcG9ydGFudCB0byBzdGlsbCBzdHlsZSB0aGUgZWxlbWVudC5cbiAgICAgICAgaWYgKG5vZGVJc09ycGhhbmVkKSB7XG4gICAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGFuIHVubWF0Y2hlZCB0cmFuc2l0aW9uIGlzIHF1ZXVlZCBhbmQgcmVhZHkgdG8gZ29cbiAgICAgICAgLy8gdGhlbiBpdCBTSE9VTEQgTk9UIHJlbmRlciBhbiBhbmltYXRpb24gYW5kIGNhbmNlbCB0aGVcbiAgICAgICAgLy8gcHJldmlvdXNseSBydW5uaW5nIGFuaW1hdGlvbnMuXG4gICAgICAgIGlmIChlbnRyeS5pc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaWYgYSBwYXJlbnQgYW5pbWF0aW9uIHVzZXMgdGhpcyBhbmltYXRpb24gYXMgYSBzdWItdHJpZ2dlclxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgaW5zdHJ1Y3QgdGhlIHRpbWVsaW5lIGJ1aWxkZXIgbm90IHRvIGFkZCBhIHBsYXllciBkZWxheSwgYnV0XG4gICAgICAgIC8vIGluc3RlYWQgc3RyZXRjaCB0aGUgZmlyc3Qga2V5ZnJhbWUgZ2FwIHVudGlsIHRoZSBhbmltYXRpb24gc3RhcnRzLiBUaGlzIGlzXG4gICAgICAgIC8vIGltcG9ydGFudCBpbiBvcmRlciB0byBwcmV2ZW50IGV4dHJhIGluaXRpYWxpemF0aW9uIHN0eWxlcyBmcm9tIGJlaW5nXG4gICAgICAgIC8vIHJlcXVpcmVkIGJ5IHRoZSB1c2VyIGZvciB0aGUgYW5pbWF0aW9uLlxuICAgICAgICBpbnN0cnVjdGlvbi50aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB0bC5zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSA9IHRydWUpO1xuXG4gICAgICAgIHN1YlRpbWVsaW5lcy5hcHBlbmQoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKTtcblxuICAgICAgICBjb25zdCB0dXBsZSA9IHtpbnN0cnVjdGlvbiwgcGxheWVyLCBlbGVtZW50fTtcblxuICAgICAgICBxdWV1ZWRJbnN0cnVjdGlvbnMucHVzaCh0dXBsZSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucXVlcmllZEVsZW1lbnRzLmZvckVhY2goXG4gICAgICAgICAgICBlbGVtZW50ID0+IGdldE9yU2V0QXNJbk1hcChxdWVyaWVkRWxlbWVudHMsIGVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcikpO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnByZVN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkhO1xuICAgICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucG9zdFN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpITtcbiAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgYWxsUG9zdFN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHNldFZhbCA9IG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChlcnJvbmVvdXNUcmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLmZvckVhY2goaW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgICBlcnJvcnMucHVzaChgQCR7aW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWV9IGhhcyBmYWlsZWQgZHVlIHRvOlxcbmApO1xuICAgICAgICBpbnN0cnVjdGlvbi5lcnJvcnMhLmZvckVhY2goZXJyb3IgPT4gZXJyb3JzLnB1c2goYC0gJHtlcnJvcn1cXG5gKSk7XG4gICAgICB9KTtcblxuICAgICAgYWxsUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoZXJyb3JzKTtcbiAgICB9XG5cbiAgICBjb25zdCBhbGxQcmV2aW91c1BsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIC8vIHRoaXMgbWFwIHRlbGxzIHVzIHdoaWNoIGVsZW1lbnQgaW4gdGhlIERPTSB0cmVlIGlzIGNvbnRhaW5lZCBieVxuICAgIC8vIHdoaWNoIGFuaW1hdGlvbi4gRnVydGhlciBkb3duIHRoaXMgbWFwIHdpbGwgZ2V0IHBvcHVsYXRlZCBvbmNlXG4gICAgLy8gdGhlIHBsYXllcnMgYXJlIGJ1aWx0IGFuZCBpbiBkb2luZyBzbyB3ZSBjYW4gdXNlIGl0IHRvIGVmZmljaWVudGx5XG4gICAgLy8gZmlndXJlIG91dCBpZiBhIHN1YiBwbGF5ZXIgaXMgc2tpcHBlZCBkdWUgdG8gYSBwYXJlbnQgcGxheWVyIGhhdmluZyBwcmlvcml0eS5cbiAgICBjb25zdCBhbmltYXRpb25FbGVtZW50TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgICAgICAgIGVudHJ5LnBsYXllci5uYW1lc3BhY2VJZCwgZW50cnkuaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gcGxheWVyLmVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhlbGVtZW50LCBmYWxzZSwgcGxheWVyLm5hbWVzcGFjZUlkLCBwbGF5ZXIudHJpZ2dlck5hbWUsIG51bGwpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocHJldlBsYXllciA9PiB7XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHByZXZQbGF5ZXIpO1xuICAgICAgICBwcmV2UGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igbm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQgZWl0aGVyIGJ5XG4gICAgLy8gaGF2aW5nIHRoZWlyIG93biBsZWF2ZSBhbmltYXRpb25zIG9yIGJ5IGJlaW5nIHF1ZXJpZWQgaW4gYSBjb250YWluZXJcbiAgICAvLyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBvbmNlIGEgcGFyZW50IGFuaW1hdGlvbiBpcyBjb21wbGV0ZS4gVGhlIGlkZWFcbiAgICAvLyBoZXJlIGlzIHRoYXQgKiBzdHlsZXMgbXVzdCBiZSBpZGVudGljYWwgdG8gISBzdHlsZXMgYmVjYXVzZSBvZlxuICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5ICgqIGlzIGFsc28gZmlsbGVkIGluIGJ5IGRlZmF1bHQgaW4gbWFueSBwbGFjZXMpLlxuICAgIC8vIE90aGVyd2lzZSAqIHN0eWxlcyB3aWxsIHJldHVybiBhbiBlbXB0eSB2YWx1ZSBvciBcImF1dG9cIiBzaW5jZSB0aGUgZWxlbWVudFxuICAgIC8vIHBhc3NlZCB0byBnZXRDb21wdXRlZFN0eWxlIHdpbGwgbm90IGJlIHZpc2libGUgKHNpbmNlICogPT09IGRlc3RpbmF0aW9uKVxuICAgIGNvbnN0IHJlcGxhY2VOb2RlcyA9IGFsbExlYXZlTm9kZXMuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gUE9TVCBTVEFHRTogZmlsbCB0aGUgKiBzdHlsZXNcbiAgICBjb25zdCBwb3N0U3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGNvbnN0IGFsbExlYXZlUXVlcmllZE5vZGVzID0gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICBwb3N0U3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLCBhbGxQb3N0U3R5bGVFbGVtZW50cywgQVVUT19TVFlMRSk7XG5cbiAgICBhbGxMZWF2ZVF1ZXJpZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgaWYgKHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpKSB7XG4gICAgICAgIHJlcGxhY2VOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUFJFIFNUQUdFOiBmaWxsIHRoZSAhIHN0eWxlc1xuICAgIGNvbnN0IHByZVN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgICBwcmVTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBuZXcgU2V0KG5vZGVzKSwgYWxsUHJlU3R5bGVFbGVtZW50cywgUFJFX1NUWUxFKTtcbiAgICB9KTtcblxuICAgIHJlcGxhY2VOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgY29uc3QgcG9zdCA9IHBvc3RTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgY29uc3QgcHJlID0gcHJlU3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIHBvc3RTdHlsZXNNYXAuc2V0KG5vZGUsIHsuLi5wb3N0LCAuLi5wcmV9IGFzIGFueSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByb290UGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc3ViUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEID0ge307XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3Qge2VsZW1lbnQsIHBsYXllciwgaW5zdHJ1Y3Rpb259ID0gZW50cnk7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaXQgd2FzIG5ldmVyIGNvbnN1bWVkIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiB3aGljaFxuICAgICAgLy8gbWVhbnMgdGhhdCBpdCBpcyBpbmRlcGVuZGVudCBhbmQgdGhlcmVmb3JlIHNob3VsZCBiZSBzZXQgZm9yIGFuaW1hdGlvblxuICAgICAgaWYgKHN1YlRpbWVsaW5lcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgIHBsYXllci5vdmVycmlkZVRvdGFsVGltZShpbnN0cnVjdGlvbi50b3RhbFRpbWUpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIHdpbGwgZmxvdyB1cCB0aGUgRE9NIGFuZCBxdWVyeSB0aGUgbWFwIHRvIGZpZ3VyZSBvdXRcbiAgICAgICAgLy8gaWYgYSBwYXJlbnQgYW5pbWF0aW9uIGhhcyBwcmlvcml0eSBvdmVyIGl0LiBJbiB0aGUgc2l0dWF0aW9uXG4gICAgICAgIC8vIHRoYXQgYSBwYXJlbnQgaXMgZGV0ZWN0ZWQgdGhlbiBpdCB3aWxsIGNhbmNlbCB0aGUgbG9vcC4gSWZcbiAgICAgICAgLy8gbm90aGluZyBpcyBkZXRlY3RlZCwgb3IgaXQgdGFrZXMgYSBmZXcgaG9wcyB0byBmaW5kIGEgcGFyZW50LFxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgZmlsbCBpbiB0aGUgbWlzc2luZyBub2RlcyBhbmQgc2lnbmFsIHRoZW0gYXMgaGF2aW5nXG4gICAgICAgIC8vIGEgZGV0ZWN0ZWQgcGFyZW50IChvciBhIE5PX1BBUkVOVCB2YWx1ZSB2aWEgYSBzcGVjaWFsIGNvbnN0YW50KS5cbiAgICAgICAgbGV0IHBhcmVudFdpdGhBbmltYXRpb246IGFueSA9IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRDtcbiAgICAgICAgaWYgKGFuaW1hdGlvbkVsZW1lbnRNYXAuc2l6ZSA+IDEpIHtcbiAgICAgICAgICBsZXQgZWxtID0gZWxlbWVudDtcbiAgICAgICAgICBjb25zdCBwYXJlbnRzVG9BZGQ6IGFueVtdID0gW107XG4gICAgICAgICAgd2hpbGUgKGVsbSA9IGVsbS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZFBhcmVudCA9IGFuaW1hdGlvbkVsZW1lbnRNYXAuZ2V0KGVsbSk7XG4gICAgICAgICAgICBpZiAoZGV0ZWN0ZWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgcGFyZW50V2l0aEFuaW1hdGlvbiA9IGRldGVjdGVkUGFyZW50O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudHNUb0FkZC5wdXNoKGVsbSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmVudHNUb0FkZC5mb3JFYWNoKHBhcmVudCA9PiBhbmltYXRpb25FbGVtZW50TWFwLnNldChwYXJlbnQsIHBhcmVudFdpdGhBbmltYXRpb24pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyUGxheWVyID0gdGhpcy5fYnVpbGRBbmltYXRpb24oXG4gICAgICAgICAgICBwbGF5ZXIubmFtZXNwYWNlSWQsIGluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXAsIHNraXBwZWRQbGF5ZXJzTWFwLCBwcmVTdHlsZXNNYXAsXG4gICAgICAgICAgICBwb3N0U3R5bGVzTWFwKTtcblxuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG5cbiAgICAgICAgaWYgKHBhcmVudFdpdGhBbmltYXRpb24gPT09IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCkge1xuICAgICAgICAgIHJvb3RQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChwYXJlbnRXaXRoQW5pbWF0aW9uKTtcbiAgICAgICAgICBpZiAocGFyZW50UGxheWVycyAmJiBwYXJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheWVyLnBhcmVudFBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGFyZW50UGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcyk7XG4gICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgIC8vIHRoZXJlIHN0aWxsIG1pZ2h0IGJlIGEgYW5jZXN0b3IgcGxheWVyIGFuaW1hdGluZyB0aGlzXG4gICAgICAgIC8vIGVsZW1lbnQgdGhlcmVmb3JlIHdlIHdpbGwgc3RpbGwgYWRkIGl0IGFzIGEgc3ViIHBsYXllclxuICAgICAgICAvLyBldmVuIGlmIGl0cyBhbmltYXRpb24gbWF5IGJlIGRpc2FibGVkXG4gICAgICAgIHN1YlBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICBpZiAoZGlzYWJsZWRFbGVtZW50c1NldC5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGZpbmQgYWxsIG9mIHRoZSBzdWIgcGxheWVycycgY29ycmVzcG9uZGluZyBpbm5lciBhbmltYXRpb24gcGxheWVyc1xuICAgIHN1YlBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gZXZlbiBpZiBubyBwbGF5ZXJzIGFyZSBmb3VuZCBmb3IgYSBzdWIgYW5pbWF0aW9uIGl0XG4gICAgICAvLyB3aWxsIHN0aWxsIGNvbXBsZXRlIGl0c2VsZiBhZnRlciB0aGUgbmV4dCB0aWNrIHNpbmNlIGl0J3MgTm9vcFxuICAgICAgY29uc3QgcGxheWVyc0ZvckVsZW1lbnQgPSBza2lwcGVkUGxheWVyc01hcC5nZXQocGxheWVyLmVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnNGb3JFbGVtZW50ICYmIHBsYXllcnNGb3JFbGVtZW50Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyc0ZvckVsZW1lbnQpO1xuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB0aGUgcmVhc29uIHdoeSB3ZSBkb24ndCBhY3R1YWxseSBwbGF5IHRoZSBhbmltYXRpb24gaXNcbiAgICAvLyBiZWNhdXNlIGFsbCB0aGF0IGEgc2tpcHBlZCBwbGF5ZXIgaXMgZGVzaWduZWQgdG8gZG8gaXMgdG9cbiAgICAvLyBmaXJlIHRoZSBzdGFydC9kb25lIHRyYW5zaXRpb24gY2FsbGJhY2sgZXZlbnRzXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgaWYgKHBsYXllci5wYXJlbnRQbGF5ZXIpIHtcbiAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJFdmVudHMocGxheWVyLnBhcmVudFBsYXllcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcnVuIHRocm91Z2ggYWxsIG9mIHRoZSBxdWV1ZWQgcmVtb3ZhbHMgYW5kIHNlZSBpZiB0aGV5XG4gICAgLy8gd2VyZSBwaWNrZWQgdXAgYnkgYSBxdWVyeS4gSWYgbm90IHRoZW4gcGVyZm9ybSB0aGUgcmVtb3ZhbFxuICAgIC8vIG9wZXJhdGlvbiByaWdodCBhd2F5IHVubGVzcyBhIHBhcmVudCBhbmltYXRpb24gaXMgb25nb2luZy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbExlYXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBhbGxMZWF2ZU5vZGVzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBMRUFWRV9DTEFTU05BTUUpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoZSBlbGVtZW50IGhhcyBhIHJlbW92YWwgYW5pbWF0aW9uIHRoYXQgaXMgYmVpbmdcbiAgICAgIC8vIHRha2VuIGNhcmUgb2YgYW5kIHRoZXJlZm9yZSB0aGUgaW5uZXIgZWxlbWVudHMgd2lsbCBoYW5nIGFyb3VuZFxuICAgICAgLy8gdW50aWwgdGhhdCBhbmltYXRpb24gaXMgb3ZlciAob3IgdGhlIHBhcmVudCBxdWVyaWVkIGFuaW1hdGlvbilcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuaGFzQW5pbWF0aW9uKSBjb250aW51ZTtcblxuICAgICAgbGV0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gICAgICAvLyBpZiB0aGlzIGVsZW1lbnQgaXMgcXVlcmllZCBvciBpZiBpdCBjb250YWlucyBxdWVyaWVkIGNoaWxkcmVuXG4gICAgICAvLyB0aGVuIHdlIHdhbnQgZm9yIHRoZSBlbGVtZW50IG5vdCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHBhZ2VcbiAgICAgIC8vIHVudGlsIHRoZSBxdWVyaWVkIGFuaW1hdGlvbnMgaGF2ZSBmaW5pc2hlZFxuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50cy5zaXplKSB7XG4gICAgICAgIGxldCBxdWVyaWVkUGxheWVyUmVzdWx0cyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmIChxdWVyaWVkUGxheWVyUmVzdWx0cyAmJiBxdWVyaWVkUGxheWVyUmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllclJlc3VsdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHF1ZXJpZWRJbm5lckVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBxdWVyaWVkSW5uZXJFbGVtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGxldCBxdWVyaWVkUGxheWVycyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQocXVlcmllZElubmVyRWxlbWVudHNbal0pO1xuICAgICAgICAgIGlmIChxdWVyaWVkUGxheWVycyAmJiBxdWVyaWVkUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaCguLi5xdWVyaWVkUGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwID0+ICFwLmRlc3Ryb3llZCk7XG4gICAgICBpZiAoYWN0aXZlUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUodGhpcywgZWxlbWVudCwgYWN0aXZlUGxheWVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyByZXF1aXJlZCBzbyB0aGUgY2xlYW51cCBtZXRob2QgZG9lc24ndCByZW1vdmUgdGhlbVxuICAgIGFsbExlYXZlTm9kZXMubGVuZ3RoID0gMDtcblxuICAgIHJvb3RQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfSk7XG4gICAgICBwbGF5ZXIucGxheSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJvb3RQbGF5ZXJzO1xuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zRGF0YShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgY29udGFpbnNEYXRhID0gZmFsc2U7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5zdGF0ZXNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkuZWxlbWVudENvbnRhaW5zRGF0YShlbGVtZW50KSB8fCBjb250YWluc0RhdGE7XG4gIH1cblxuICBhZnRlckZsdXNoKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcbiAgICB0aGlzLl9mbHVzaEZucy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFmdGVyRmx1c2hBbmltYXRpb25zRG9uZShjYWxsYmFjazogKCkgPT4gYW55KSB7XG4gICAgdGhpcy5fd2hlblF1aWV0Rm5zLnB1c2goY2FsbGJhY2spO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgZWxlbWVudDogc3RyaW5nLCBpc1F1ZXJpZWRFbGVtZW50OiBib29sZWFuLCBuYW1lc3BhY2VJZD86IHN0cmluZywgdHJpZ2dlck5hbWU/OiBzdHJpbmcsXG4gICAgICB0b1N0YXRlVmFsdWU/OiBhbnkpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgY29uc3QgcXVlcmllZEVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIHBsYXllcnMgPSBxdWVyaWVkRWxlbWVudFBsYXllcnM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgICBjb25zdCBpc1JlbW92YWxBbmltYXRpb24gPSAhdG9TdGF0ZVZhbHVlIHx8IHRvU3RhdGVWYWx1ZSA9PSBWT0lEX1ZBTFVFO1xuICAgICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWlzUmVtb3ZhbEFuaW1hdGlvbiAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgIT0gdHJpZ2dlck5hbWUpIHJldHVybjtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYW1lc3BhY2VJZCB8fCB0cmlnZ2VyTmFtZSkge1xuICAgICAgcGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChuYW1lc3BhY2VJZCAmJiBuYW1lc3BhY2VJZCAhPSBwbGF5ZXIubmFtZXNwYWNlSWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRyaWdnZXJOYW1lICYmIHRyaWdnZXJOYW1lICE9IHBsYXllci50cmlnZ2VyTmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIHByaXZhdGUgX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPikge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2hlbiBhIHJlbW92YWwgYW5pbWF0aW9uIG9jY3VycywgQUxMIHByZXZpb3VzIHBsYXllcnMgYXJlIGNvbGxlY3RlZFxuICAgIC8vIGFuZCBkZXN0cm95ZWQgKGV2ZW4gaWYgdGhleSBhcmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBuYW1lc3BhY2UpXG4gICAgY29uc3QgdGFyZ2V0TmFtZVNwYWNlSWQ6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogbmFtZXNwYWNlSWQ7XG4gICAgY29uc3QgdGFyZ2V0VHJpZ2dlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogdHJpZ2dlck5hbWU7XG5cbiAgICBmb3IgKGNvbnN0IHRpbWVsaW5lSW5zdHJ1Y3Rpb24gb2YgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcGxheWVycyA9IGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKTtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9IHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgICAgICBlbGVtZW50LCBpc1F1ZXJpZWRFbGVtZW50LCB0YXJnZXROYW1lU3BhY2VJZCwgdGFyZ2V0VHJpZ2dlck5hbWUsIGluc3RydWN0aW9uLnRvU3RhdGUpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgY29uc3QgcmVhbFBsYXllciA9IChwbGF5ZXIgYXMgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcikuZ2V0UmVhbFBsYXllcigpIGFzIGFueTtcbiAgICAgICAgaWYgKHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSkge1xuICAgICAgICAgIHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBuZWVkcyB0byBiZSBkb25lIHNvIHRoYXQgdGhlIFBSRS9QT1NUIHN0eWxlcyBjYW4gYmVcbiAgICAvLyBjb21wdXRlZCBwcm9wZXJseSB3aXRob3V0IGludGVyZmVyaW5nIHdpdGggdGhlIHByZXZpb3VzIGFuaW1hdGlvblxuICAgIGVyYXNlU3R5bGVzKHJvb3RFbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPixcbiAgICAgIHNraXBwZWRQbGF5ZXJzTWFwOiBNYXA8YW55LCBBbmltYXRpb25QbGF5ZXJbXT4sIHByZVN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LFxuICAgICAgcG9zdFN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+KTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdlIGZpcnN0IHJ1biB0aGlzIHNvIHRoYXQgdGhlIHByZXZpb3VzIGFuaW1hdGlvbiBwbGF5ZXJcbiAgICAvLyBkYXRhIGNhbiBiZSBwYXNzZWQgaW50byB0aGUgc3VjY2Vzc2l2ZSBhbmltYXRpb24gcGxheWVyc1xuICAgIGNvbnN0IGFsbFF1ZXJpZWRQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBhbGxDb25zdW1lZEVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgYWxsU3ViRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxOZXdQbGF5ZXJzID0gaW5zdHJ1Y3Rpb24udGltZWxpbmVzLm1hcCh0aW1lbGluZUluc3RydWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aW1lbGluZUluc3RydWN0aW9uLmVsZW1lbnQ7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgLy8gRklYTUUgKG1hdHNrbyk6IG1ha2Ugc3VyZSB0by1iZS1yZW1vdmVkIGFuaW1hdGlvbnMgYXJlIHJlbW92ZWQgcHJvcGVybHlcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR107XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnJlbW92ZWRCZWZvcmVRdWVyaWVkKVxuICAgICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbi5kdXJhdGlvbiwgdGltZWxpbmVJbnN0cnVjdGlvbi5kZWxheSk7XG5cbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9XG4gICAgICAgICAgZmxhdHRlbkdyb3VwUGxheWVycygoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLmdldChlbGVtZW50KSB8fCBFTVBUWV9QTEFZRVJfQVJSQVkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwID0+IHAuZ2V0UmVhbFBsYXllcigpKSlcbiAgICAgICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgYGVsZW1lbnRgIGlzIG5vdCBhcGFydCBvZiB0aGUgQW5pbWF0aW9uUGxheWVyIGRlZmluaXRpb24sIGJ1dFxuICAgICAgICAgICAgICAgIC8vIE1vY2svV2ViQW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgZWxlbWVudCB3aXRoaW4gdGhlaXIgaW1wbGVtZW50YXRpb24uIFRoaXMgd2lsbCBiZSBhZGRlZCBpbiBBbmd1bGFyNSB0b1xuICAgICAgICAgICAgICAgIC8vIEFuaW1hdGlvblBsYXllclxuICAgICAgICAgICAgICAgIGNvbnN0IHBwID0gcCBhcyBhbnk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBwLmVsZW1lbnQgPyBwcC5lbGVtZW50ID09PSBlbGVtZW50IDogZmFsc2U7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwcmVTdHlsZXMgPSBwcmVTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3QgcG9zdFN0eWxlcyA9IHBvc3RTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3Qga2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgICAgICAgIHRoaXMuZHJpdmVyLCB0aGlzLl9ub3JtYWxpemVyLCBlbGVtZW50LCB0aW1lbGluZUluc3RydWN0aW9uLmtleWZyYW1lcywgcHJlU3R5bGVzLFxuICAgICAgICAgIHBvc3RTdHlsZXMpO1xuICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5fYnVpbGRQbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzLCBwcmV2aW91c1BsYXllcnMpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhpcyBwYXJ0aWN1bGFyIHBsYXllciBiZWxvbmdzIHRvIGEgc3ViIHRyaWdnZXIuIEl0IGlzXG4gICAgICAvLyBpbXBvcnRhbnQgdGhhdCB3ZSBtYXRjaCB0aGlzIHBsYXllciB1cCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIChAdHJpZ2dlci5saXN0ZW5lcilcbiAgICAgIGlmICh0aW1lbGluZUluc3RydWN0aW9uLnN1YlRpbWVsaW5lICYmIHNraXBwZWRQbGF5ZXJzTWFwKSB7XG4gICAgICAgIGFsbFN1YkVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZFBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKG5hbWVzcGFjZUlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG4gICAgICAgIHdyYXBwZWRQbGF5ZXIuc2V0UmVhbFBsYXllcihwbGF5ZXIpO1xuICAgICAgICBhbGxRdWVyaWVkUGxheWVycy5wdXNoKHdyYXBwZWRQbGF5ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH0pO1xuXG4gICAgYWxsUXVlcmllZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQsIHBsYXllci5lbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiBkZWxldGVPclVuc2V0SW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIHBsYXllcikpO1xuICAgIH0pO1xuXG4gICAgYWxsQ29uc3VtZWRFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gYWRkQ2xhc3MoZWxlbWVudCwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSkpO1xuICAgIGNvbnN0IHBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIoYWxsTmV3UGxheWVycyk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiByZW1vdmVDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgICBzZXRTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgYmFzaWNhbGx5IG1ha2VzIGFsbCBvZiB0aGUgY2FsbGJhY2tzIGZvciBzdWIgZWxlbWVudCBhbmltYXRpb25zXG4gICAgLy8gYmUgZGVwZW5kZW50IG9uIHRoZSB1cHBlciBwbGF5ZXJzIGZvciB3aGVuIHRoZXkgZmluaXNoXG4gICAgYWxsU3ViRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGdldE9yU2V0QXNJbk1hcChza2lwcGVkUGxheWVyc01hcCwgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBpZiAoa2V5ZnJhbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRyaXZlci5hbmltYXRlKFxuICAgICAgICAgIGluc3RydWN0aW9uLmVsZW1lbnQsIGtleWZyYW1lcywgaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgICAgIGluc3RydWN0aW9uLmVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZW1wdHkgdHJhbnNpdGlvbnxkZWZpbml0aW9uIGlzIHByb3ZpZGVkXG4gICAgLy8gLi4uIHRoZXJlIGlzIG5vIHBvaW50IGluIHJlbmRlcmluZyBhbiBlbXB0eSBhbmltYXRpb25cbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3BsYXllcjogQW5pbWF0aW9uUGxheWVyID0gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgcHJpdmF0ZSBfY29udGFpbnNSZWFsUGxheWVyID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcXVldWVkQ2FsbGJhY2tzOiB7W25hbWU6IHN0cmluZ106ICgoKSA9PiBhbnkpW119ID0ge307XG4gIHB1YmxpYyByZWFkb25seSBkZXN0cm95ZWQgPSBmYWxzZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXIhOiBBbmltYXRpb25QbGF5ZXI7XG5cbiAgcHVibGljIG1hcmtlZEZvckRlc3Ryb3k6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgcmVhZG9ubHkgcXVldWVkOiBib29sZWFuID0gdHJ1ZTtcbiAgcHVibGljIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZywgcHVibGljIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHB1YmxpYyBlbGVtZW50OiBhbnkpIHt9XG5cbiAgc2V0UmVhbFBsYXllcihwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGlmICh0aGlzLl9jb250YWluc1JlYWxQbGF5ZXIpIHJldHVybjtcblxuICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9xdWV1ZWRDYWxsYmFja3MpLmZvckVhY2gocGhhc2UgPT4ge1xuICAgICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzW3BoYXNlXS5mb3JFYWNoKFxuICAgICAgICAgIGNhbGxiYWNrID0+IGxpc3Rlbk9uUGxheWVyKHBsYXllciwgcGhhc2UsIHVuZGVmaW5lZCwgY2FsbGJhY2spKTtcbiAgICB9KTtcbiAgICB0aGlzLl9xdWV1ZWRDYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLl9jb250YWluc1JlYWxQbGF5ZXIgPSB0cnVlO1xuICAgIHRoaXMub3ZlcnJpZGVUb3RhbFRpbWUocGxheWVyLnRvdGFsVGltZSk7XG4gICAgKHRoaXMgYXMge3F1ZXVlZDogYm9vbGVhbn0pLnF1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0UmVhbFBsYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xuICB9XG5cbiAgb3ZlcnJpZGVUb3RhbFRpbWUodG90YWxUaW1lOiBudW1iZXIpIHtcbiAgICAodGhpcyBhcyBhbnkpLnRvdGFsVGltZSA9IHRvdGFsVGltZTtcbiAgfVxuXG4gIHN5bmNQbGF5ZXJFdmVudHMocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGxheWVyIGFzIGFueTtcbiAgICBpZiAocC50cmlnZ2VyQ2FsbGJhY2spIHtcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHAudHJpZ2dlckNhbGxiYWNrISgnc3RhcnQnKSk7XG4gICAgfVxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBwcml2YXRlIF9xdWV1ZUV2ZW50KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fcXVldWVkQ2FsbGJhY2tzLCBuYW1lLCBbXSkucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2RvbmUnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRvbmUoZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnc3RhcnQnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vblN0YXJ0KGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZGVzdHJveScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRGVzdHJveShmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXllci5pbml0KCk7XG4gIH1cblxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnF1ZXVlZCA/IGZhbHNlIDogdGhpcy5fcGxheWVyLmhhc1N0YXJ0ZWQoKTtcbiAgfVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wbGF5KCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnBhdXNlKCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzdGFydCgpO1xuICB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXllci5maW5pc2goKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgKHRoaXMgYXMge2Rlc3Ryb3llZDogYm9vbGVhbn0pLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fcGxheWVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzZXQoKTtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHA6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3BsYXllci5zZXRQb3NpdGlvbihwKTtcbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnF1ZXVlZCA/IDAgOiB0aGlzLl9wbGF5ZXIuZ2V0UG9zaXRpb24oKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BsYXllciBhcyBhbnk7XG4gICAgaWYgKHAudHJpZ2dlckNhbGxiYWNrKSB7XG4gICAgICBwLnRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxldGVPclVuc2V0SW5NYXAobWFwOiBNYXA8YW55LCBhbnlbXT58e1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCB2YWx1ZTogYW55KSB7XG4gIGxldCBjdXJyZW50VmFsdWVzOiBhbnlbXXxudWxsfHVuZGVmaW5lZDtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIG1hcC5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcFtrZXldO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBkZWxldGUgbWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXJyZW50VmFsdWVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUcmlnZ2VyVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG4gIC8vIHdlIHVzZSBgIT0gbnVsbGAgaGVyZSBiZWNhdXNlIGl0J3MgdGhlIG1vc3Qgc2ltcGxlXG4gIC8vIHdheSB0byB0ZXN0IGFnYWluc3QgYSBcImZhbHN5XCIgdmFsdWUgd2l0aG91dCBtaXhpbmdcbiAgLy8gaW4gZW1wdHkgc3RyaW5ncyBvciBhIHplcm8gdmFsdWUuIERPIE5PVCBPUFRJTUlaRS5cbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudE5vZGUobm9kZTogYW55KSB7XG4gIHJldHVybiBub2RlICYmIG5vZGVbJ25vZGVUeXBlJ10gPT09IDE7XG59XG5cbmZ1bmN0aW9uIGlzVHJpZ2dlckV2ZW50VmFsaWQoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGV2ZW50TmFtZSA9PSAnc3RhcnQnIHx8IGV2ZW50TmFtZSA9PSAnZG9uZSc7XG59XG5cbmZ1bmN0aW9uIGNsb2FrRWxlbWVudChlbGVtZW50OiBhbnksIHZhbHVlPzogc3RyaW5nKSB7XG4gIGNvbnN0IG9sZFZhbHVlID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5O1xuICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiAnbm9uZSc7XG4gIHJldHVybiBvbGRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgIHZhbHVlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LCBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgZWxlbWVudHM6IFNldDxhbnk+LFxuICAgIGVsZW1lbnRQcm9wc01hcDogTWFwPGFueSwgU2V0PHN0cmluZz4+LCBkZWZhdWx0U3R5bGU6IHN0cmluZyk6IGFueVtdIHtcbiAgY29uc3QgY2xvYWtWYWxzOiBzdHJpbmdbXSA9IFtdO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtWYWxzLnB1c2goY2xvYWtFbGVtZW50KGVsZW1lbnQpKSk7XG5cbiAgY29uc3QgZmFpbGVkRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgZWxlbWVudFByb3BzTWFwLmZvckVhY2goKHByb3BzOiBTZXQ8c3RyaW5nPiwgZWxlbWVudDogYW55KSA9PiB7XG4gICAgY29uc3Qgc3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHN0eWxlc1twcm9wXSA9IGRyaXZlci5jb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCwgZGVmYXVsdFN0eWxlKTtcblxuICAgICAgLy8gdGhlcmUgaXMgbm8gZWFzeSB3YXkgdG8gZGV0ZWN0IHRoaXMgYmVjYXVzZSBhIHN1YiBlbGVtZW50IGNvdWxkIGJlIHJlbW92ZWRcbiAgICAgIC8vIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiBlbGVtZW50IGJlaW5nIGRldGFjaGVkLlxuICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTtcbiAgICAgICAgZmFpbGVkRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YWx1ZXNNYXAuc2V0KGVsZW1lbnQsIHN0eWxlcyk7XG4gIH0pO1xuXG4gIC8vIHdlIHVzZSBhIGluZGV4IHZhcmlhYmxlIGhlcmUgc2luY2UgU2V0LmZvckVhY2goYSwgaSkgZG9lcyBub3QgcmV0dXJuXG4gIC8vIGFuIGluZGV4IHZhbHVlIGZvciB0aGUgY2xvc3VyZSAoYnV0IGluc3RlYWQganVzdCB0aGUgdmFsdWUpXG4gIGxldCBpID0gMDtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrRWxlbWVudChlbGVtZW50LCBjbG9ha1ZhbHNbaSsrXSkpO1xuXG4gIHJldHVybiBmYWlsZWRFbGVtZW50cztcbn1cblxuLypcblNpbmNlIHRoZSBBbmd1bGFyIHJlbmRlcmVyIGNvZGUgd2lsbCByZXR1cm4gYSBjb2xsZWN0aW9uIG9mIGluc2VydGVkXG5ub2RlcyBpbiBhbGwgYXJlYXMgb2YgYSBET00gdHJlZSwgaXQncyB1cCB0byB0aGlzIGFsZ29yaXRobSB0byBmaWd1cmVcbm91dCB3aGljaCBub2RlcyBhcmUgcm9vdHMgZm9yIGVhY2ggYW5pbWF0aW9uIEB0cmlnZ2VyLlxuXG5CeSBwbGFjaW5nIGVhY2ggaW5zZXJ0ZWQgbm9kZSBpbnRvIGEgU2V0IGFuZCB0cmF2ZXJzaW5nIHVwd2FyZHMsIGl0XG5pcyBwb3NzaWJsZSB0byBmaW5kIHRoZSBAdHJpZ2dlciBlbGVtZW50cyBhbmQgd2VsbCBhbnkgZGlyZWN0ICpzdGFyXG5pbnNlcnRpb24gbm9kZXMsIGlmIGEgQHRyaWdnZXIgcm9vdCBpcyBmb3VuZCB0aGVuIHRoZSBlbnRlciBlbGVtZW50XG5pcyBwbGFjZWQgaW50byB0aGUgTWFwW0B0cmlnZ2VyXSBzcG90LlxuICovXG5mdW5jdGlvbiBidWlsZFJvb3RNYXAocm9vdHM6IGFueVtdLCBub2RlczogYW55W10pOiBNYXA8YW55LCBhbnlbXT4ge1xuICBjb25zdCByb290TWFwID0gbmV3IE1hcDxhbnksIGFueVtdPigpO1xuICByb290cy5mb3JFYWNoKHJvb3QgPT4gcm9vdE1hcC5zZXQocm9vdCwgW10pKTtcblxuICBpZiAobm9kZXMubGVuZ3RoID09IDApIHJldHVybiByb290TWFwO1xuXG4gIGNvbnN0IE5VTExfTk9ERSA9IDE7XG4gIGNvbnN0IG5vZGVTZXQgPSBuZXcgU2V0KG5vZGVzKTtcbiAgY29uc3QgbG9jYWxSb290TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcblxuICBmdW5jdGlvbiBnZXRSb290KG5vZGU6IGFueSk6IGFueSB7XG4gICAgaWYgKCFub2RlKSByZXR1cm4gTlVMTF9OT0RFO1xuXG4gICAgbGV0IHJvb3QgPSBsb2NhbFJvb3RNYXAuZ2V0KG5vZGUpO1xuICAgIGlmIChyb290KSByZXR1cm4gcm9vdDtcblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICBpZiAocm9vdE1hcC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgQHRyaWdnZXJcbiAgICAgIHJvb3QgPSBwYXJlbnQ7XG4gICAgfSBlbHNlIGlmIChub2RlU2V0LmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBuZ0lmXG4gICAgICByb290ID0gTlVMTF9OT0RFO1xuICAgIH0gZWxzZSB7ICAvLyByZWN1cnNlIHVwd2FyZHNcbiAgICAgIHJvb3QgPSBnZXRSb290KHBhcmVudCk7XG4gICAgfVxuXG4gICAgbG9jYWxSb290TWFwLnNldChub2RlLCByb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGdldFJvb3Qobm9kZSk7XG4gICAgaWYgKHJvb3QgIT09IE5VTExfTk9ERSkge1xuICAgICAgcm9vdE1hcC5nZXQocm9vdCkhLnB1c2gobm9kZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcm9vdE1hcDtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBlbGVtZW50LmNsYXNzTGlzdD8uYWRkKGNsYXNzTmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgZWxlbWVudC5jbGFzc0xpc3Q/LnJlbW92ZShjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVOb2Rlc0FmdGVyQW5pbWF0aW9uRG9uZShcbiAgICBlbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUsIGVsZW1lbnQ6IGFueSwgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuR3JvdXBQbGF5ZXJzKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyW10ge1xuICBjb25zdCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW107XG4gIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgcmV0dXJuIGZpbmFsUGxheWVycztcbn1cblxuZnVuY3Rpb24gX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSwgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBBbmltYXRpb25Hcm91cFBsYXllcikge1xuICAgICAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXIucGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmluYWxQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gb2JqRXF1YWxzKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBiOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICBjb25zdCBrMSA9IE9iamVjdC5rZXlzKGEpO1xuICBjb25zdCBrMiA9IE9iamVjdC5rZXlzKGIpO1xuICBpZiAoazEubGVuZ3RoICE9IGsyLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGsxLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJvcCA9IGsxW2ldO1xuICAgIGlmICghYi5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBhW3Byb3BdICE9PSBiW3Byb3BdKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUoXG4gICAgZWxlbWVudDogYW55LCBhbGxQcmVTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sXG4gICAgYWxsUG9zdFN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+Pik6IGJvb2xlYW4ge1xuICBjb25zdCBwb3N0RW50cnkgPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmICghcG9zdEVudHJ5KSByZXR1cm4gZmFsc2U7XG5cbiAgbGV0IHByZUVudHJ5ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmIChwcmVFbnRyeSkge1xuICAgIHBvc3RFbnRyeS5mb3JFYWNoKGRhdGEgPT4gcHJlRW50cnkhLmFkZChkYXRhKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgcG9zdEVudHJ5KTtcbiAgfVxuXG4gIGFsbFBvc3RTdHlsZUVsZW1lbnRzLmRlbGV0ZShlbGVtZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=