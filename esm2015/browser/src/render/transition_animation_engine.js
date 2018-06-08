/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
import { ENTER_CLASSNAME, LEAVE_CLASSNAME, NG_ANIMATING_CLASSNAME, NG_ANIMATING_SELECTOR, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, copyObj, eraseStyles, setStyles } from '../util';
import { getBodyNode, getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
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
    get params() { return this.options.params; }
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
            // (which is where the previousPlayers are passed into the new palyer)
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
            player.onStart(() => { removeClass(element, QUEUED_CLASSNAME); });
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
        this._engine.statesByElement.forEach((stateMap, element) => { delete stateMap[name]; });
        this._elementListeners.forEach((listeners, element) => {
            this._elementListeners.set(element, listeners.filter(entry => { return entry.name != name; }));
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
    _signalRemovalForInnerTriggers(rootElement, context, animate = false) {
        // emulate a leave animation for all inner nodes within this node.
        // If there are no animations found for any of the nodes then clear the cache
        // for the element.
        this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true).forEach(elm => {
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
        if (listeners) {
            const visitedTriggers = new Set();
            listeners.forEach(listener => {
                const triggerName = listener.name;
                if (visitedTriggers.has(triggerName))
                    return;
                visitedTriggers.add(triggerName);
                const trigger = this._triggers[triggerName];
                const transition = trigger.fallbackTransition;
                const elementStates = this._engine.statesByElement.get(element);
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
            this._signalRemovalForInnerTriggers(element, context, true);
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
            // we do this after the flush has occurred such
            // that the callbacks can be fired
            engine.afterFlush(() => this.clearElementCache(element));
            engine.destroyInnerAnimations(element);
            engine._onRemovalComplete(element, context);
        }
    }
    insertNode(element, parent) { addClass(element, this._hostClassName); }
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
    constructor(driver, _normalizer) {
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
    _onRemovalComplete(element, context) { this.onRemovalComplete(element, context); }
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
        if (hostElement.parentNode) {
            this._balanceNamespaceList(ns, hostElement);
        }
        else {
            // defer this later until flush during when the host element has
            // been inserted so that we know exactly where to place it in
            // the namespace list
            this.newHostElements.set(hostElement, ns);
            // given that this host element is apart of the animation code, it
            // may or may not be inserted by a parent node that is an of an
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
    _fetchNamespace(id) { return this._namespaceLookup[id]; }
    fetchNamespacesByElement(element) {
        // normally there should only be one namespace per element, however
        // if @triggers are placed on both the component element and then
        // its host element (within the component code) then there will be
        // two namespaces returned. We use a set here to simply the dedupe
        // of namespaces incase there are multiple triggers both the elm and host
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
    collectEnterElement(element) { this.collectedEnterElements.push(element); }
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
    removeNode(namespaceId, element, context) {
        if (!isElementNode(element)) {
            this._onRemovalComplete(element, context);
            return;
        }
        const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
        if (ns) {
            ns.removeNode(element, context);
        }
        else {
            this.markElementAsRemoved(namespaceId, element, false, context);
        }
    }
    markElementAsRemoved(namespaceId, element, hasAnimation, context) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] = {
            namespaceId,
            setForRemoval: context, hasAnimation,
            removedBeforeQueried: false
        };
    }
    listen(namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return () => { };
    }
    _buildInstruction(entry, subTimelines, enterClassName, leaveClassName) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines);
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
        if (this.driver.matchesElement(element, DISABLED_SELECTOR)) {
            this.markElementAsDisabled(element, false);
        }
        this.driver.query(element, DISABLED_SELECTOR, true).forEach(node => {
            this.markElementAsDisabled(element, false);
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
                optimizeGroupPlayer(players).onDone(() => { quietFns.forEach(fn => fn()); });
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
        const bodyNode = getBodyNode();
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
            allLeaveNodes.forEach(element => { this.processLeaveNode(element); });
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
                if (!bodyNode || !this.driver.containsElement(bodyNode, element)) {
                    player.destroy();
                    return;
                }
                const leaveClassName = leaveNodeMapIds.get(element);
                const enterClassName = enterNodeMapIds.get(element);
                const instruction = this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName);
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // if a unmatched transition is queued to go then it SHOULD NOT render
                // an animation and cancel the previously running animations.
                if (entry.isFallbackTransition) {
                    player.onStart(() => eraseStyles(element, instruction.fromStyles));
                    player.onDestroy(() => setStyles(element, instruction.toStyles));
                    skippedPlayers.push(player);
                    return;
                }
                // this means that if a parent animation uses this animation as a sub trigger
                // then it will instruct the timeline builder to not add a player delay, but
                // instead stretch the first keyframe gap up until the animation starts. The
                // reason this is important is to prevent extra initialization styles from being
                // required by the user in the animation.
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
        // this map works to tell which element in the DOM tree is contained by
        // which animation. Further down below this map will get populated once
        // the players are built and in doing so it can efficiently figure out
        // if a sub player is skipped due to a parent player having priority.
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
        // this is a special case for nodes that will be removed (either by)
        // having their own leave animations or by being queried in a container
        // that will be removed once a parent animation is complete. The idea
        // here is that * styles must be identical to ! styles because of
        // backwards compatibility (* is also filled in by default in many places).
        // Otherwise * styles will return an empty value or auto since the element
        // that is being getComputedStyle'd will not be visible (since * = destination)
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
            postStylesMap.set(node, Object.assign({}, post, pre));
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
        // find all of the sub players' corresponding inner animation player
        subPlayers.forEach(player => {
            // even if any players are not found for a sub animation then it
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
    afterFlush(callback) { this._flushFns.push(callback); }
    afterFlushAnimationsDone(callback) { this._whenQuietFns.push(callback); }
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
        allSubElements.forEach(element => { getOrSetAsInMap(skippedPlayersMap, element, []).push(player); });
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
    getRealPlayer() { return this._player; }
    overrideTotalTime(totalTime) { this.totalTime = totalTime; }
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
    init() { this._player.init(); }
    hasStarted() { return this.queued ? false : this._player.hasStarted(); }
    play() { !this.queued && this._player.play(); }
    pause() { !this.queued && this._player.pause(); }
    restart() { !this.queued && this._player.restart(); }
    finish() { this._player.finish(); }
    destroy() {
        this.destroyed = true;
        this._player.destroy();
    }
    reset() { !this.queued && this._player.reset(); }
    setPosition(p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    }
    getPosition() { return this.queued ? 0 : this._player.getPosition(); }
    /* @internal */
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
const CLASSES_CACHE_KEY = '$$classes';
function containsClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    }
    else {
        const classes = element[CLASSES_CACHE_KEY];
        return classes && classes[className];
    }
}
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    }
    else {
        let classes = element[CLASSES_CACHE_KEY];
        if (!classes) {
            classes = element[CLASSES_CACHE_KEY] = {};
        }
        classes[className] = true;
    }
}
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    }
    else {
        let classes = element[CLASSES_CACHE_KEY];
        if (classes) {
            delete classes[className];
        }
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxVQUFVLEVBQXFDLG1CQUFtQixFQUFFLHFCQUFxQixJQUFJLG9CQUFvQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQU0zTCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFtQixTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHck0sT0FBTyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRW5JLE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7QUFDN0MsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUM7QUFDN0MsTUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQztBQUNqRCxNQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDO0FBQ2pELE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBQzFDLE1BQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDO0FBRTFDLE1BQU0sa0JBQWtCLEdBQWdDLEVBQUUsQ0FBQztBQUMzRCxNQUFNLGtCQUFrQixHQUEwQjtJQUNoRCxXQUFXLEVBQUUsRUFBRTtJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLFVBQVUs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QztZQUFFLE9BQU8sS0FBSyxDQUFDO0tBQ2xFO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsZ0NBQ0ksT0FBWSxFQUFFLG1CQUEwQyxFQUN4RCxvQkFBMkM7SUFDN0MsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFN0IsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELElBQUksUUFBUSxFQUFFO1FBQ1osU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNqRDtTQUFNO1FBQ0wsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3QztJQUVELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciBhcyBBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2luc3RydWN0aW9uJztcbmltcG9ydCB7QW5pbWF0aW9uVHJpZ2dlcn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmlnZ2VyJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuLi9kc2wvZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RU5URVJfQ0xBU1NOQU1FLCBMRUFWRV9DTEFTU05BTUUsIE5HX0FOSU1BVElOR19DTEFTU05BTUUsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgTkdfVFJJR0dFUl9DTEFTU05BTUUsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIGNvcHlPYmosIGVyYXNlU3R5bGVzLCBpdGVyYXRvclRvQXJyYXksIHNldFN0eWxlc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRCb2R5Tm9kZSwgZ2V0T3JTZXRBc0luTWFwLCBsaXN0ZW5PblBsYXllciwgbWFrZUFuaW1hdGlvbkV2ZW50LCBub3JtYWxpemVLZXlmcmFtZXMsIG9wdGltaXplR3JvdXBQbGF5ZXJ9IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgUVVFVUVEX0NMQVNTTkFNRSA9ICduZy1hbmltYXRlLXF1ZXVlZCc7XG5jb25zdCBRVUVVRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IERJU0FCTEVEX0NMQVNTTkFNRSA9ICduZy1hbmltYXRlLWRpc2FibGVkJztcbmNvbnN0IERJU0FCTEVEX1NFTEVDVE9SID0gJy5uZy1hbmltYXRlLWRpc2FibGVkJztcbmNvbnN0IFNUQVJfQ0xBU1NOQU1FID0gJ25nLXN0YXItaW5zZXJ0ZWQnO1xuY29uc3QgU1RBUl9TRUxFQ1RPUiA9ICcubmctc3Rhci1pbnNlcnRlZCc7XG5cbmNvbnN0IEVNUFRZX1BMQVlFUl9BUlJBWTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5jb25zdCBOVUxMX1JFTU9WQUxfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JSZW1vdmFsOiBmYWxzZSxcbiAgc2V0Rm9yTW92ZTogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBmYWxzZVxufTtcbmNvbnN0IE5VTExfUkVNT1ZFRF9RVUVSSUVEX1NUQVRFOiBFbGVtZW50QW5pbWF0aW9uU3RhdGUgPSB7XG4gIG5hbWVzcGFjZUlkOiAnJyxcbiAgc2V0Rm9yTW92ZTogZmFsc2UsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBoYXNBbmltYXRpb246IGZhbHNlLFxuICByZW1vdmVkQmVmb3JlUXVlcmllZDogdHJ1ZVxufTtcblxuaW50ZXJmYWNlIFRyaWdnZXJMaXN0ZW5lciB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGhhc2U6IHN0cmluZztcbiAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJbnN0cnVjdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgdHJpZ2dlck5hbWU6IHN0cmluZztcbiAgZnJvbVN0YXRlOiBTdGF0ZVZhbHVlO1xuICB0b1N0YXRlOiBTdGF0ZVZhbHVlO1xuICB0cmFuc2l0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeTtcbiAgcGxheWVyOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyO1xuICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IFJFTU9WQUxfRkxBRyA9ICdfX25nX3JlbW92ZWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRBbmltYXRpb25TdGF0ZSB7XG4gIHNldEZvclJlbW92YWw6IGJvb2xlYW47XG4gIHNldEZvck1vdmU6IGJvb2xlYW47XG4gIGhhc0FuaW1hdGlvbjogYm9vbGVhbjtcbiAgbmFtZXNwYWNlSWQ6IHN0cmluZztcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbHVlIHtcbiAgcHVibGljIHZhbHVlOiBzdHJpbmc7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zO1xuXG4gIGdldCBwYXJhbXMoKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5vcHRpb25zLnBhcmFtcyBhc3tba2V5OiBzdHJpbmddOiBhbnl9OyB9XG5cbiAgY29uc3RydWN0b3IoaW5wdXQ6IGFueSwgcHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcgPSAnJykge1xuICAgIGNvbnN0IGlzT2JqID0gaW5wdXQgJiYgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJyk7XG4gICAgY29uc3QgdmFsdWUgPSBpc09iaiA/IGlucHV0Wyd2YWx1ZSddIDogaW5wdXQ7XG4gICAgdGhpcy52YWx1ZSA9IG5vcm1hbGl6ZVRyaWdnZXJWYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKGlzT2JqKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gY29weU9iaihpbnB1dCBhcyBhbnkpO1xuICAgICAgZGVsZXRlIG9wdGlvbnNbJ3ZhbHVlJ107XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIGFzIEFuaW1hdGlvbk9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5wYXJhbXMpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5wYXJhbXMgPSB7fTtcbiAgICB9XG4gIH1cblxuICBhYnNvcmJPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBjb25zdCBuZXdQYXJhbXMgPSBvcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBjb25zdCBvbGRQYXJhbXMgPSB0aGlzLm9wdGlvbnMucGFyYW1zICE7XG4gICAgICBPYmplY3Qua2V5cyhuZXdQYXJhbXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChvbGRQYXJhbXNbcHJvcF0gPT0gbnVsbCkge1xuICAgICAgICAgIG9sZFBhcmFtc1twcm9wXSA9IG5ld1BhcmFtc1twcm9wXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBWT0lEX1ZBTFVFID0gJ3ZvaWQnO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU1RBVEVfVkFMVUUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2Uge1xuICBwdWJsaWMgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgcHJpdmF0ZSBfdHJpZ2dlcnM6IHtbdHJpZ2dlck5hbWU6IHN0cmluZ106IEFuaW1hdGlvblRyaWdnZXJ9ID0ge307XG4gIHByaXZhdGUgX3F1ZXVlOiBRdWV1ZUluc3RydWN0aW9uW10gPSBbXTtcblxuICBwcml2YXRlIF9lbGVtZW50TGlzdGVuZXJzID0gbmV3IE1hcDxhbnksIFRyaWdnZXJMaXN0ZW5lcltdPigpO1xuXG4gIHByaXZhdGUgX2hvc3RDbGFzc05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgaG9zdEVsZW1lbnQ6IGFueSwgcHJpdmF0ZSBfZW5naW5lOiBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lKSB7XG4gICAgdGhpcy5faG9zdENsYXNzTmFtZSA9ICduZy10bnMtJyArIGlkO1xuICAgIGFkZENsYXNzKGhvc3RFbGVtZW50LCB0aGlzLl9ob3N0Q2xhc3NOYW1lKTtcbiAgfVxuXG4gIGxpc3RlbihlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuKTogKCkgPT4gYW55IHtcbiAgICBpZiAoIXRoaXMuX3RyaWdnZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBsaXN0ZW4gb24gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGV2ZW50IFwiJHtcbiAgICAgICAgICBwaGFzZX1cIiBiZWNhdXNlIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBkb2VzblxcJ3QgZXhpc3QhYCk7XG4gICAgfVxuXG4gICAgaWYgKHBoYXNlID09IG51bGwgfHwgcGhhc2UubGVuZ3RoID09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxpc3RlbiBvbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke1xuICAgICAgICAgIG5hbWV9XCIgYmVjYXVzZSB0aGUgcHJvdmlkZWQgZXZlbnQgaXMgdW5kZWZpbmVkIWApO1xuICAgIH1cblxuICAgIGlmICghaXNUcmlnZ2VyRXZlbnRWYWxpZChwaGFzZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB0cmlnZ2VyIGV2ZW50IFwiJHtwaGFzZX1cIiBmb3IgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtcbiAgICAgICAgICBuYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQhYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuZXJzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMsIGVsZW1lbnQsIFtdKTtcbiAgICBjb25zdCBkYXRhID0ge25hbWUsIHBoYXNlLCBjYWxsYmFja307XG4gICAgbGlzdGVuZXJzLnB1c2goZGF0YSk7XG5cbiAgICBjb25zdCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSBnZXRPclNldEFzSW5NYXAodGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudCwgZWxlbWVudCwge30pO1xuICAgIGlmICghdHJpZ2dlcnNXaXRoU3RhdGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSArICctJyArIG5hbWUpO1xuICAgICAgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdID0gREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGlzIHJlbW92ZWQgQUZURVIgdGhlIGZsdXNoIGhhcyBvY2N1cnJlZCBzdWNoXG4gICAgICAvLyB0aGF0IGxlYXZlIGFuaW1hdGlvbnMgY2FsbGJhY2tzIGNhbiBmaXJlIChvdGhlcndpc2UgaWYgdGhlIG5vZGVcbiAgICAgIC8vIGlzIHJlbW92ZWQgaW4gYmV0d2VlbiB0aGVuIHRoZSBsaXN0ZW5lcnMgd291bGQgYmUgZGVyZWdpc3RlcmVkKVxuICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGRhdGEpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl90cmlnZ2Vyc1tuYW1lXSkge1xuICAgICAgICAgIGRlbGV0ZSB0cmlnZ2Vyc1dpdGhTdGF0ZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZWdpc3RlcihuYW1lOiBzdHJpbmcsIGFzdDogQW5pbWF0aW9uVHJpZ2dlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl90cmlnZ2Vyc1tuYW1lXSkge1xuICAgICAgLy8gdGhyb3dcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJpZ2dlcnNbbmFtZV0gPSBhc3Q7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRUcmlnZ2VyKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2Vyc1tuYW1lXTtcbiAgICBpZiAoIXRyaWdnZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGhhcyBub3QgYmVlbiByZWdpc3RlcmVkIWApO1xuICAgIH1cbiAgICByZXR1cm4gdHJpZ2dlcjtcbiAgfVxuXG4gIHRyaWdnZXIoZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBkZWZhdWx0VG9GYWxsYmFjazogYm9vbGVhbiA9IHRydWUpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9nZXRUcmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcih0aGlzLmlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG5cbiAgICBsZXQgdHJpZ2dlcnNXaXRoU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgdHJpZ2dlck5hbWUpO1xuICAgICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5zZXQoZWxlbWVudCwgdHJpZ2dlcnNXaXRoU3RhdGVzID0ge30pO1xuICAgIH1cblxuICAgIGxldCBmcm9tU3RhdGUgPSB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdO1xuICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZSh2YWx1ZSwgdGhpcy5pZCk7XG5cbiAgICBjb25zdCBpc09iaiA9IHZhbHVlICYmIHZhbHVlLmhhc093blByb3BlcnR5KCd2YWx1ZScpO1xuICAgIGlmICghaXNPYmogJiYgZnJvbVN0YXRlKSB7XG4gICAgICB0b1N0YXRlLmFic29yYk9wdGlvbnMoZnJvbVN0YXRlLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV0gPSB0b1N0YXRlO1xuXG4gICAgaWYgKCFmcm9tU3RhdGUpIHtcbiAgICAgIGZyb21TdGF0ZSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgY29uc3QgaXNSZW1vdmFsID0gdG9TdGF0ZS52YWx1ZSA9PT0gVk9JRF9WQUxVRTtcblxuICAgIC8vIG5vcm1hbGx5IHRoaXMgaXNuJ3QgcmVhY2hlZCBieSBoZXJlLCBob3dldmVyLCBpZiBhbiBvYmplY3QgZXhwcmVzc2lvblxuICAgIC8vIGlzIHBhc3NlZCBpbiB0aGVuIGl0IG1heSBiZSBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLiBDb21wYXJpbmcgdGhlIHZhbHVlXG4gICAgLy8gaXMgaW1wb3J0YW50IHNpbmNlIHRoYXQgd2lsbCBzdGF5IHRoZSBzYW1lIGRlc3BpdGUgdGhlcmUgYmVpbmcgYSBuZXcgb2JqZWN0LlxuICAgIC8vIFRoZSByZW1vdmFsIGFyYyBoZXJlIGlzIHNwZWNpYWwgY2FzZWQgYmVjYXVzZSB0aGUgc2FtZSBlbGVtZW50IGlzIHRyaWdnZXJlZFxuICAgIC8vIHR3aWNlIGluIHRoZSBldmVudCB0aGF0IGl0IGNvbnRhaW5zIGFuaW1hdGlvbnMgb24gdGhlIG91dGVyL2lubmVyIHBvcnRpb25zXG4gICAgLy8gb2YgdGhlIGhvc3QgY29udGFpbmVyXG4gICAgaWYgKCFpc1JlbW92YWwgJiYgZnJvbVN0YXRlLnZhbHVlID09PSB0b1N0YXRlLnZhbHVlKSB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgZGVzcGl0ZSB0aGUgdmFsdWUgbm90IGNoYW5naW5nLCBzb21lIGlubmVyIHBhcmFtc1xuICAgICAgLy8gaGF2ZSBjaGFuZ2VkIHdoaWNoIG1lYW5zIHRoYXQgdGhlIGFuaW1hdGlvbiBmaW5hbCBzdHlsZXMgbmVlZCB0byBiZSBhcHBsaWVkXG4gICAgICBpZiAoIW9iakVxdWFscyhmcm9tU3RhdGUucGFyYW1zLCB0b1N0YXRlLnBhcmFtcykpIHtcbiAgICAgICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBmcm9tU3R5bGVzID0gdHJpZ2dlci5tYXRjaFN0eWxlcyhmcm9tU3RhdGUudmFsdWUsIGZyb21TdGF0ZS5wYXJhbXMsIGVycm9ycyk7XG4gICAgICAgIGNvbnN0IHRvU3R5bGVzID0gdHJpZ2dlci5tYXRjaFN0eWxlcyh0b1N0YXRlLnZhbHVlLCB0b1N0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLl9lbmdpbmUucmVwb3J0RXJyb3IoZXJyb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBlcmFzZVN0eWxlcyhlbGVtZW50LCBmcm9tU3R5bGVzKTtcbiAgICAgICAgICAgIHNldFN0eWxlcyhlbGVtZW50LCB0b1N0eWxlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXJzT25FbGVtZW50OiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPVxuICAgICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQsIGVsZW1lbnQsIFtdKTtcbiAgICBwbGF5ZXJzT25FbGVtZW50LmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIC8vIG9ubHkgcmVtb3ZlIHRoZSBwbGF5ZXIgaWYgaXQgaXMgcXVldWVkIG9uIHRoZSBFWEFDVCBzYW1lIHRyaWdnZXIvbmFtZXNwYWNlXG4gICAgICAvLyB3ZSBvbmx5IGFsc28gZGVhbCB3aXRoIHF1ZXVlZCBwbGF5ZXJzIGhlcmUgYmVjYXVzZSBpZiB0aGUgYW5pbWF0aW9uIGhhc1xuICAgICAgLy8gc3RhcnRlZCB0aGVuIHdlIHdhbnQgdG8ga2VlcCB0aGUgcGxheWVyIGFsaXZlIHVudGlsIHRoZSBmbHVzaCBoYXBwZW5zXG4gICAgICAvLyAod2hpY2ggaXMgd2hlcmUgdGhlIHByZXZpb3VzUGxheWVycyBhcmUgcGFzc2VkIGludG8gdGhlIG5ldyBwYWx5ZXIpXG4gICAgICBpZiAocGxheWVyLm5hbWVzcGFjZUlkID09IHRoaXMuaWQgJiYgcGxheWVyLnRyaWdnZXJOYW1lID09IHRyaWdnZXJOYW1lICYmIHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCB0cmFuc2l0aW9uID1cbiAgICAgICAgdHJpZ2dlci5tYXRjaFRyYW5zaXRpb24oZnJvbVN0YXRlLnZhbHVlLCB0b1N0YXRlLnZhbHVlLCBlbGVtZW50LCB0b1N0YXRlLnBhcmFtcyk7XG4gICAgbGV0IGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgaWYgKCF0cmFuc2l0aW9uKSB7XG4gICAgICBpZiAoIWRlZmF1bHRUb0ZhbGxiYWNrKSByZXR1cm47XG4gICAgICB0cmFuc2l0aW9uID0gdHJpZ2dlci5mYWxsYmFja1RyYW5zaXRpb247XG4gICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fZW5naW5lLnRvdGFsUXVldWVkUGxheWVycysrO1xuICAgIHRoaXMuX3F1ZXVlLnB1c2goXG4gICAgICAgIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgdHJhbnNpdGlvbiwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwbGF5ZXIsIGlzRmFsbGJhY2tUcmFuc2l0aW9ufSk7XG5cbiAgICBpZiAoIWlzRmFsbGJhY2tUcmFuc2l0aW9uKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTtcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHsgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgUVVFVUVEX0NMQVNTTkFNRSk7IH0pO1xuICAgIH1cblxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnMpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgcGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgIHBsYXllcnNPbkVsZW1lbnQucHVzaChwbGF5ZXIpO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIGRlcmVnaXN0ZXIobmFtZTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuXG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5mb3JFYWNoKChzdGF0ZU1hcCwgZWxlbWVudCkgPT4geyBkZWxldGUgc3RhdGVNYXBbbmFtZV07IH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcnMsIGVsZW1lbnQpID0+IHtcbiAgICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuc2V0KFxuICAgICAgICAgIGVsZW1lbnQsIGxpc3RlbmVycy5maWx0ZXIoZW50cnkgPT4geyByZXR1cm4gZW50cnkubmFtZSAhPSBuYW1lOyB9KSk7XG4gICAgfSk7XG4gIH1cblxuICBjbGVhckVsZW1lbnRDYWNoZShlbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmRlbGV0ZShlbGVtZW50KTtcbiAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgIGVsZW1lbnRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKHJvb3RFbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgLy8gZW11bGF0ZSBhIGxlYXZlIGFuaW1hdGlvbiBmb3IgYWxsIGlubmVyIG5vZGVzIHdpdGhpbiB0aGlzIG5vZGUuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGFuaW1hdGlvbnMgZm91bmQgZm9yIGFueSBvZiB0aGUgbm9kZXMgdGhlbiBjbGVhciB0aGUgY2FjaGVcbiAgICAvLyBmb3IgdGhlIGVsZW1lbnQuXG4gICAgdGhpcy5fZW5naW5lLmRyaXZlci5xdWVyeShyb290RWxlbWVudCwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChlbG0gPT4ge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGFuIGlubmVyIHJlbW92ZSgpIG9wZXJhdGlvbiBoYXMgYWxyZWFkeSBraWNrZWQgb2ZmXG4gICAgICAvLyB0aGUgYW5pbWF0aW9uIG9uIHRoaXMgZWxlbWVudC4uLlxuICAgICAgaWYgKGVsbVtSRU1PVkFMX0ZMQUddKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IG5hbWVzcGFjZXMgPSB0aGlzLl9lbmdpbmUuZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsbSk7XG4gICAgICBpZiAobmFtZXNwYWNlcy5zaXplKSB7XG4gICAgICAgIG5hbWVzcGFjZXMuZm9yRWFjaChucyA9PiBucy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxtLCBjb250ZXh0LCBmYWxzZSwgdHJ1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdHJpZ2dlckxlYXZlQW5pbWF0aW9uKFxuICAgICAgZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGRlc3Ryb3lBZnRlckNvbXBsZXRlPzogYm9vbGVhbixcbiAgICAgIGRlZmF1bHRUb0ZhbGxiYWNrPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRyaWdnZXJTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAodHJpZ2dlclN0YXRlcykge1xuICAgICAgY29uc3QgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgICBPYmplY3Qua2V5cyh0cmlnZ2VyU3RhdGVzKS5mb3JFYWNoKHRyaWdnZXJOYW1lID0+IHtcbiAgICAgICAgLy8gdGhpcyBjaGVjayBpcyBoZXJlIGluIHRoZSBldmVudCB0aGF0IGFuIGVsZW1lbnQgaXMgcmVtb3ZlZFxuICAgICAgICAvLyB0d2ljZSAoYm90aCBvbiB0aGUgaG9zdCBsZXZlbCBhbmQgdGhlIGNvbXBvbmVudCBsZXZlbClcbiAgICAgICAgaWYgKHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXSkge1xuICAgICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMudHJpZ2dlcihlbGVtZW50LCB0cmlnZ2VyTmFtZSwgVk9JRF9WQUxVRSwgZGVmYXVsdFRvRmFsbGJhY2spO1xuICAgICAgICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9lbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgdHJ1ZSwgY29udGV4dCk7XG4gICAgICAgIGlmIChkZXN0cm95QWZ0ZXJDb21wbGV0ZSkge1xuICAgICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHRoaXMuX2VuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGNvbnN0IHZpc2l0ZWRUcmlnZ2VycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGxpc3RlbmVyLm5hbWU7XG4gICAgICAgIGlmICh2aXNpdGVkVHJpZ2dlcnMuaGFzKHRyaWdnZXJOYW1lKSkgcmV0dXJuO1xuICAgICAgICB2aXNpdGVkVHJpZ2dlcnMuYWRkKHRyaWdnZXJOYW1lKTtcblxuICAgICAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdO1xuICAgICAgICBjb25zdCB0cmFuc2l0aW9uID0gdHJpZ2dlci5mYWxsYmFja1RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBmcm9tU3RhdGUgPSBlbGVtZW50U3RhdGVzW3RyaWdnZXJOYW1lXSB8fCBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgICAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgICAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgdHJpZ2dlck5hbWUsXG4gICAgICAgICAgdHJhbnNpdGlvbixcbiAgICAgICAgICBmcm9tU3RhdGUsXG4gICAgICAgICAgdG9TdGF0ZSxcbiAgICAgICAgICBwbGF5ZXIsXG4gICAgICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5fZW5naW5lO1xuXG4gICAgaWYgKGVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKGVsZW1lbnQsIGNvbnRleHQsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhICogPT4gVk9JRCBhbmltYXRpb24gd2FzIGRldGVjdGVkIGFuZCBraWNrZWQgb2ZmXG4gICAgaWYgKHRoaXMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsZW1lbnQsIGNvbnRleHQsIHRydWUpKSByZXR1cm47XG5cbiAgICAvLyBmaW5kIHRoZSBwbGF5ZXIgdGhhdCBpcyBhbmltYXRpbmcgYW5kIG1ha2Ugc3VyZSB0aGF0IHRoZVxuICAgIC8vIHJlbW92YWwgaXMgZGVsYXllZCB1bnRpbCB0aGF0IHBsYXllciBoYXMgY29tcGxldGVkXG4gICAgbGV0IGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmIChlbmdpbmUudG90YWxBbmltYXRpb25zKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGxheWVycyA9XG4gICAgICAgICAgZW5naW5lLnBsYXllcnMubGVuZ3RoID8gZW5naW5lLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KSA6IFtdO1xuXG4gICAgICAvLyB3aGVuIHRoaXMgYGlmIHN0YXRlbWVudGAgZG9lcyBub3QgY29udGludWUgZm9yd2FyZCBpdCBtZWFucyB0aGF0XG4gICAgICAvLyBhIHByZXZpb3VzIGFuaW1hdGlvbiBxdWVyeSBoYXMgc2VsZWN0ZWQgdGhlIGN1cnJlbnQgZWxlbWVudCBhbmRcbiAgICAgIC8vIGlzIGFuaW1hdGluZyBpdC4gSW4gdGhpcyBzaXR1YXRpb24gd2FudCB0byBjb250aW51ZSBmb3J3YXJkcyBhbmRcbiAgICAgIC8vIGFsbG93IHRoZSBlbGVtZW50IHRvIGJlIHF1ZXVlZCB1cCBmb3IgYW5pbWF0aW9uIGxhdGVyLlxuICAgICAgaWYgKGN1cnJlbnRQbGF5ZXJzICYmIGN1cnJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHdoaWxlIChwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQocGFyZW50KTtcbiAgICAgICAgICBpZiAodHJpZ2dlcnMpIHtcbiAgICAgICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHN0YWdlIHdlIGtub3cgdGhhdCB0aGUgZWxlbWVudCB3aWxsIGVpdGhlciBnZXQgcmVtb3ZlZFxuICAgIC8vIGR1cmluZyBmbHVzaCBvciB3aWxsIGJlIHBpY2tlZCB1cCBieSBhIHBhcmVudCBxdWVyeS4gRWl0aGVyIHdheVxuICAgIC8vIHdlIG5lZWQgdG8gZmlyZSB0aGUgbGlzdGVuZXJzIGZvciB0aGlzIGVsZW1lbnQgd2hlbiBpdCBET0VTIGdldFxuICAgIC8vIHJlbW92ZWQgKG9uY2UgdGhlIHF1ZXJ5IHBhcmVudCBhbmltYXRpb24gaXMgZG9uZSBvciBhZnRlciBmbHVzaClcbiAgICB0aGlzLnByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50KTtcblxuICAgIC8vIHdoZXRoZXIgb3Igbm90IGEgcGFyZW50IGhhcyBhbiBhbmltYXRpb24gd2UgbmVlZCB0byBkZWxheSB0aGUgZGVmZXJyYWwgb2YgdGhlIGxlYXZlXG4gICAgLy8gb3BlcmF0aW9uIHVudGlsIHdlIGhhdmUgbW9yZSBpbmZvcm1hdGlvbiAod2hpY2ggd2UgZG8gYWZ0ZXIgZmx1c2goKSBoYXMgYmVlbiBjYWxsZWQpXG4gICAgaWYgKGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbikge1xuICAgICAgZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gd2UgZG8gdGhpcyBhZnRlciB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgIC8vIHRoYXQgdGhlIGNhbGxiYWNrcyBjYW4gYmUgZmlyZWRcbiAgICAgIGVuZ2luZS5hZnRlckZsdXNoKCgpID0+IHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudCkpO1xuICAgICAgZW5naW5lLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICBlbmdpbmUuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydE5vZGUoZWxlbWVudDogYW55LCBwYXJlbnQ6IGFueSk6IHZvaWQgeyBhZGRDbGFzcyhlbGVtZW50LCB0aGlzLl9ob3N0Q2xhc3NOYW1lKTsgfVxuXG4gIGRyYWluUXVldWVkVHJhbnNpdGlvbnMobWljcm90YXNrSWQ6IG51bWJlcik6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSB7XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb25zOiBRdWV1ZUluc3RydWN0aW9uW10gPSBbXTtcbiAgICB0aGlzLl9xdWV1ZS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHBsYXllciA9IGVudHJ5LnBsYXllcjtcbiAgICAgIGlmIChwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZWxlbWVudExpc3RlbmVycy5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcjogVHJpZ2dlckxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgaWYgKGxpc3RlbmVyLm5hbWUgPT0gZW50cnkudHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VFdmVudCA9IG1ha2VBbmltYXRpb25FdmVudChcbiAgICAgICAgICAgICAgICBlbGVtZW50LCBlbnRyeS50cmlnZ2VyTmFtZSwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlKTtcbiAgICAgICAgICAgIChiYXNlRXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IG1pY3JvdGFza0lkO1xuICAgICAgICAgICAgbGlzdGVuT25QbGF5ZXIoZW50cnkucGxheWVyLCBsaXN0ZW5lci5waGFzZSwgYmFzZUV2ZW50LCBsaXN0ZW5lci5jYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBsYXllci5tYXJrZWRGb3JEZXN0cm95KSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAvLyBub3cgd2UgY2FuIGRlc3Ryb3kgdGhlIGVsZW1lbnQgcHJvcGVybHkgc2luY2UgdGhlIGV2ZW50IGxpc3RlbmVycyBoYXZlXG4gICAgICAgICAgLy8gYmVlbiBib3VuZCB0byB0aGUgcGxheWVyXG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChlbnRyeSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuXG4gICAgcmV0dXJuIGluc3RydWN0aW9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAvLyBpZiBkZXBDb3VudCA9PSAwIHRoZW0gbW92ZSB0byBmcm9udFxuICAgICAgLy8gb3RoZXJ3aXNlIGlmIGEgY29udGFpbnMgYiB0aGVuIG1vdmUgYmFja1xuICAgICAgY29uc3QgZDAgPSBhLnRyYW5zaXRpb24uYXN0LmRlcENvdW50O1xuICAgICAgY29uc3QgZDEgPSBiLnRyYW5zaXRpb24uYXN0LmRlcENvdW50O1xuICAgICAgaWYgKGQwID09IDAgfHwgZDEgPT0gMCkge1xuICAgICAgICByZXR1cm4gZDAgLSBkMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChhLmVsZW1lbnQsIGIuZWxlbWVudCkgPyAxIDogLTE7XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHAgPT4gcC5kZXN0cm95KCkpO1xuICAgIHRoaXMuX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKHRoaXMuaG9zdEVsZW1lbnQsIGNvbnRleHQpO1xuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zRGF0YShlbGVtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICBsZXQgY29udGFpbnNEYXRhID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGNvbnRhaW5zRGF0YSA9XG4gICAgICAgICh0aGlzLl9xdWV1ZS5maW5kKGVudHJ5ID0+IGVudHJ5LmVsZW1lbnQgPT09IGVsZW1lbnQpID8gdHJ1ZSA6IGZhbHNlKSB8fCBjb250YWluc0RhdGE7XG4gICAgcmV0dXJuIGNvbnRhaW5zRGF0YTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlZFRyYW5zaXRpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb247XG4gIHBsYXllcjogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcjtcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUge1xuICBwdWJsaWMgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gIHB1YmxpYyBuZXdIb3N0RWxlbWVudHMgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgcHVibGljIHBsYXllcnNCeUVsZW1lbnQgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICBwdWJsaWMgcGxheWVyc0J5UXVlcmllZEVsZW1lbnQgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICBwdWJsaWMgc3RhdGVzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIHtbdHJpZ2dlck5hbWU6IHN0cmluZ106IFN0YXRlVmFsdWV9PigpO1xuICBwdWJsaWMgZGlzYWJsZWROb2RlcyA9IG5ldyBTZXQ8YW55PigpO1xuXG4gIHB1YmxpYyB0b3RhbEFuaW1hdGlvbnMgPSAwO1xuICBwdWJsaWMgdG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcblxuICBwcml2YXRlIF9uYW1lc3BhY2VMb29rdXA6IHtbaWQ6IHN0cmluZ106IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2V9ID0ge307XG4gIHByaXZhdGUgX25hbWVzcGFjZUxpc3Q6IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2VbXSA9IFtdO1xuICBwcml2YXRlIF9mbHVzaEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwcml2YXRlIF93aGVuUXVpZXRGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcblxuICBwdWJsaWMgbmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgcHVibGljIGNvbGxlY3RlZEVudGVyRWxlbWVudHM6IGFueVtdID0gW107XG4gIHB1YmxpYyBjb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuXG4gIC8vIHRoaXMgbWV0aG9kIGlzIGRlc2lnbmVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGNvZGUgdGhhdCB1c2VzIHRoaXMgZW5naW5lXG4gIHB1YmxpYyBvblJlbW92YWxDb21wbGV0ZSA9IChlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgPT4ge307XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpIHsgdGhpcy5vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTsgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHJpdmF0ZSBfbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7fVxuXG4gIGdldCBxdWV1ZWRQbGF5ZXJzKCk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSB7XG4gICAgY29uc3QgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5mb3JFYWNoKG5zID0+IHtcbiAgICAgIG5zLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkge1xuICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIGNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbnMgPSBuZXcgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZShuYW1lc3BhY2VJZCwgaG9zdEVsZW1lbnQsIHRoaXMpO1xuICAgIGlmIChob3N0RWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLl9iYWxhbmNlTmFtZXNwYWNlTGlzdChucywgaG9zdEVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWZlciB0aGlzIGxhdGVyIHVudGlsIGZsdXNoIGR1cmluZyB3aGVuIHRoZSBob3N0IGVsZW1lbnQgaGFzXG4gICAgICAvLyBiZWVuIGluc2VydGVkIHNvIHRoYXQgd2Uga25vdyBleGFjdGx5IHdoZXJlIHRvIHBsYWNlIGl0IGluXG4gICAgICAvLyB0aGUgbmFtZXNwYWNlIGxpc3RcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLnNldChob3N0RWxlbWVudCwgbnMpO1xuXG4gICAgICAvLyBnaXZlbiB0aGF0IHRoaXMgaG9zdCBlbGVtZW50IGlzIGFwYXJ0IG9mIHRoZSBhbmltYXRpb24gY29kZSwgaXRcbiAgICAgIC8vIG1heSBvciBtYXkgbm90IGJlIGluc2VydGVkIGJ5IGEgcGFyZW50IG5vZGUgdGhhdCBpcyBhbiBvZiBhblxuICAgICAgLy8gYW5pbWF0aW9uIHJlbmRlcmVyIHR5cGUuIElmIHRoaXMgaGFwcGVucyB0aGVuIHdlIGNhbiBzdGlsbCBoYXZlXG4gICAgICAvLyBhY2Nlc3MgdG8gdGhpcyBpdGVtIHdoZW4gd2UgcXVlcnkgZm9yIDplbnRlciBub2Rlcy4gSWYgdGhlIHBhcmVudFxuICAgICAgLy8gaXMgYSByZW5kZXJlciB0aGVuIHRoZSBzZXQgZGF0YS1zdHJ1Y3R1cmUgd2lsbCBub3JtYWxpemUgdGhlIGVudHJ5XG4gICAgICB0aGlzLmNvbGxlY3RFbnRlckVsZW1lbnQoaG9zdEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXSA9IG5zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYmFsYW5jZU5hbWVzcGFjZUxpc3QobnM6IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBsaW1pdCA9IHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoIC0gMTtcbiAgICBpZiAobGltaXQgPj0gMCkge1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBpID0gbGltaXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5leHROYW1lc3BhY2UgPSB0aGlzLl9uYW1lc3BhY2VMaXN0W2ldO1xuICAgICAgICBpZiAodGhpcy5kcml2ZXIuY29udGFpbnNFbGVtZW50KG5leHROYW1lc3BhY2UuaG9zdEVsZW1lbnQsIGhvc3RFbGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKGkgKyAxLCAwLCBucyk7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKDAsIDAsIG5zKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5wdXNoKG5zKTtcbiAgICB9XG5cbiAgICB0aGlzLm5hbWVzcGFjZXNCeUhvc3RFbGVtZW50LnNldChob3N0RWxlbWVudCwgbnMpO1xuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmICghbnMpIHtcbiAgICAgIG5zID0gdGhpcy5jcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG5zO1xuICB9XG5cbiAgcmVnaXN0ZXJUcmlnZ2VyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgdHJpZ2dlcjogQW5pbWF0aW9uVHJpZ2dlcikge1xuICAgIGxldCBucyA9IHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgaWYgKG5zICYmIG5zLnJlZ2lzdGVyKG5hbWUsIHRyaWdnZXIpKSB7XG4gICAgICB0aGlzLnRvdGFsQW5pbWF0aW9ucysrO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3kobmFtZXNwYWNlSWQ6IHN0cmluZywgY29udGV4dDogYW55KSB7XG4gICAgaWYgKCFuYW1lc3BhY2VJZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG5cbiAgICB0aGlzLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5kZWxldGUobnMuaG9zdEVsZW1lbnQpO1xuICAgICAgZGVsZXRlIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX25hbWVzcGFjZUxpc3QuaW5kZXhPZihucyk7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFmdGVyRmx1c2hBbmltYXRpb25zRG9uZSgoKSA9PiBucy5kZXN0cm95KGNvbnRleHQpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZldGNoTmFtZXNwYWNlKGlkOiBzdHJpbmcpIHsgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtpZF07IH1cblxuICBmZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxlbWVudDogYW55KTogU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+IHtcbiAgICAvLyBub3JtYWxseSB0aGVyZSBzaG91bGQgb25seSBiZSBvbmUgbmFtZXNwYWNlIHBlciBlbGVtZW50LCBob3dldmVyXG4gICAgLy8gaWYgQHRyaWdnZXJzIGFyZSBwbGFjZWQgb24gYm90aCB0aGUgY29tcG9uZW50IGVsZW1lbnQgYW5kIHRoZW5cbiAgICAvLyBpdHMgaG9zdCBlbGVtZW50ICh3aXRoaW4gdGhlIGNvbXBvbmVudCBjb2RlKSB0aGVuIHRoZXJlIHdpbGwgYmVcbiAgICAvLyB0d28gbmFtZXNwYWNlcyByZXR1cm5lZC4gV2UgdXNlIGEgc2V0IGhlcmUgdG8gc2ltcGx5IHRoZSBkZWR1cGVcbiAgICAvLyBvZiBuYW1lc3BhY2VzIGluY2FzZSB0aGVyZSBhcmUgbXVsdGlwbGUgdHJpZ2dlcnMgYm90aCB0aGUgZWxtIGFuZCBob3N0XG4gICAgY29uc3QgbmFtZXNwYWNlcyA9IG5ldyBTZXQ8QW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50U3RhdGVzKSB7XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZWxlbWVudFN0YXRlcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbnNJZCA9IGVsZW1lbnRTdGF0ZXNba2V5c1tpXV0ubmFtZXNwYWNlSWQ7XG4gICAgICAgIGlmIChuc0lkKSB7XG4gICAgICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuc0lkKTtcbiAgICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICAgIG5hbWVzcGFjZXMuYWRkKG5zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzcGFjZXM7XG4gIH1cblxuICB0cmlnZ2VyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLnRyaWdnZXIoZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaW5zZXJ0Tm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIWlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHJldHVybjtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYW5kIHJlaW5zZXJ0ZWQgKG1vdmUgb3BlcmF0aW9uKVxuICAgIC8vIHdoZW4gdGhpcyBvY2N1cnMgd2UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBlbGVtZW50IGZvciBkZWxldGlvbiBsYXRlclxuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgZGV0YWlscy5zZXRGb3JSZW1vdmFsID0gZmFsc2U7XG4gICAgICBkZXRhaWxzLnNldEZvck1vdmUgPSB0cnVlO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuaW5kZXhPZihlbGVtZW50KTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBuYW1lc3BhY2VJZCBpcyBibGFuayB0aGVuIHRoZSBjYWxsZXJcbiAgICAvLyBjb2RlIGRvZXMgbm90IGNvbnRhaW4gYW55IGFuaW1hdGlvbiBjb2RlIGluIGl0LCBidXQgaXQgaXNcbiAgICAvLyBqdXN0IGJlaW5nIGNhbGxlZCBzbyB0aGF0IHRoZSBub2RlIGlzIG1hcmtlZCBhcyBiZWluZyBpbnNlcnRlZFxuICAgIGlmIChuYW1lc3BhY2VJZCkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICAvLyBUaGlzIGlmLXN0YXRlbWVudCBpcyBhIHdvcmthcm91bmQgZm9yIHJvdXRlciBpc3N1ZSAjMjE5NDcuXG4gICAgICAvLyBUaGUgcm91dGVyIHNvbWV0aW1lcyBoaXRzIGEgcmFjZSBjb25kaXRpb24gd2hlcmUgd2hpbGUgYSByb3V0ZVxuICAgICAgLy8gaXMgYmVpbmcgaW5zdGFudGlhdGVkIGEgbmV3IG5hdmlnYXRpb24gYXJyaXZlcywgdHJpZ2dlcmluZyBsZWF2ZVxuICAgICAgLy8gYW5pbWF0aW9uIG9mIERPTSB0aGF0IGhhcyBub3QgYmVlbiBmdWxseSBpbml0aWFsaXplZCwgdW50aWwgdGhpc1xuICAgICAgLy8gaXMgcmVzb2x2ZWQsIHdlIG5lZWQgdG8gaGFuZGxlIHRoZSBzY2VuYXJpbyB3aGVuIERPTSBpcyBub3QgaW4gYVxuICAgICAgLy8gY29uc2lzdGVudCBzdGF0ZSBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cbiAgICAgIGlmIChucykge1xuICAgICAgICBucy5pbnNlcnROb2RlKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gb25seSAqZGlyZWN0aXZlcyBhbmQgaG9zdCBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgYmVmb3JlXG4gICAgaWYgKGluc2VydEJlZm9yZSkge1xuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudDogYW55KSB7IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5wdXNoKGVsZW1lbnQpOyB9XG5cbiAgbWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQ6IGFueSwgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlTm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbnMgPSBuYW1lc3BhY2VJZCA/IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKSA6IG51bGw7XG4gICAgaWYgKG5zKSB7XG4gICAgICBucy5yZW1vdmVOb2RlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgbWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBoYXNBbmltYXRpb24/OiBib29sZWFuLCBjb250ZXh0PzogYW55KSB7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0ge1xuICAgICAgbmFtZXNwYWNlSWQsXG4gICAgICBzZXRGb3JSZW1vdmFsOiBjb250ZXh0LCBoYXNBbmltYXRpb24sXG4gICAgICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgbGlzdGVuKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmxpc3RlbihlbGVtZW50LCBuYW1lLCBwaGFzZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge307XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEluc3RydWN0aW9uKFxuICAgICAgZW50cnk6IFF1ZXVlSW5zdHJ1Y3Rpb24sIHN1YlRpbWVsaW5lczogRWxlbWVudEluc3RydWN0aW9uTWFwLCBlbnRlckNsYXNzTmFtZTogc3RyaW5nLFxuICAgICAgbGVhdmVDbGFzc05hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBlbnRyeS50cmFuc2l0aW9uLmJ1aWxkKFxuICAgICAgICB0aGlzLmRyaXZlciwgZW50cnkuZWxlbWVudCwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlLCBlbnRlckNsYXNzTmFtZSxcbiAgICAgICAgbGVhdmVDbGFzc05hbWUsIGVudHJ5LmZyb21TdGF0ZS5vcHRpb25zLCBlbnRyeS50b1N0YXRlLm9wdGlvbnMsIHN1YlRpbWVsaW5lcyk7XG4gIH1cblxuICBkZXN0cm95SW5uZXJBbmltYXRpb25zKGNvbnRhaW5lckVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB0aGlzLmRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50KSk7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5zaXplID09IDApIHJldHVybjtcblxuICAgIGVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoY29udGFpbmVyRWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5maW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQpKTtcbiAgfVxuXG4gIGRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHNldCBmb3IgZGVzdHJ1Y3Rpb24sIGJ1dCBoYXNuJ3Qgc3RhcnRlZC5cbiAgICAgICAgLy8gaW4gdGhpcyBzaXR1YXRpb24gd2Ugd2FudCB0byBkZWxheSB0aGUgZGVzdHJ1Y3Rpb24gdW50aWwgdGhlIGZsdXNoIG9jY3Vyc1xuICAgICAgICAvLyBzbyB0aGF0IGFueSBldmVudCBsaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhlIHBsYXllciBhcmUgdHJpZ2dlcmVkLlxuICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkge1xuICAgICAgICAgIHBsYXllci5tYXJrZWRGb3JEZXN0cm95ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZmluaXNoKCkpO1xuICAgIH1cbiAgfVxuXG4gIHdoZW5SZW5kZXJpbmdEb25lKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9wdGltaXplR3JvdXBQbGF5ZXIodGhpcy5wbGF5ZXJzKS5vbkRvbmUoKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICAvLyB0aGlzIHdpbGwgcHJldmVudCBpdCBmcm9tIHJlbW92aW5nIGl0IHR3aWNlXG4gICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WQUxfU1RBVEU7XG4gICAgICBpZiAoZGV0YWlscy5uYW1lc3BhY2VJZCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UoZGV0YWlscy5uYW1lc3BhY2VJZCk7XG4gICAgICAgIGlmIChucykge1xuICAgICAgICAgIG5zLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBkZXRhaWxzLnNldEZvclJlbW92YWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRyaXZlci5tYXRjaGVzRWxlbWVudChlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUikpIHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZsdXNoKG1pY3JvdGFza0lkOiBudW1iZXIgPSAtMSkge1xuICAgIGxldCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmICh0aGlzLm5ld0hvc3RFbGVtZW50cy5zaXplKSB7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5mb3JFYWNoKChucywgZWxlbWVudCkgPT4gdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGVsZW1lbnQpKTtcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudG90YWxBbmltYXRpb25zICYmIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsbSA9IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50c1tpXTtcbiAgICAgICAgYWRkQ2xhc3MoZWxtLCBTVEFSX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoICYmXG4gICAgICAgICh0aGlzLnRvdGFsUXVldWVkUGxheWVycyB8fCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoKSkge1xuICAgICAgY29uc3QgY2xlYW51cEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGxheWVycyA9IHRoaXMuX2ZsdXNoQW5pbWF0aW9ucyhjbGVhbnVwRm5zLCBtaWNyb3Rhc2tJZCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsZWFudXBGbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjbGVhbnVwRm5zW2ldKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50c1tpXTtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9mbHVzaEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX2ZsdXNoRm5zID0gW107XG5cbiAgICBpZiAodGhpcy5fd2hlblF1aWV0Rm5zLmxlbmd0aCkge1xuICAgICAgLy8gd2UgbW92ZSB0aGVzZSBvdmVyIHRvIGEgdmFyaWFibGUgc28gdGhhdFxuICAgICAgLy8gaWYgYW55IG5ldyBjYWxsYmFja3MgYXJlIHJlZ2lzdGVyZWQgaW4gYW5vdGhlclxuICAgICAgLy8gZmx1c2ggdGhleSBkbyBub3QgcG9wdWxhdGUgdGhlIGV4aXN0aW5nIHNldFxuICAgICAgY29uc3QgcXVpZXRGbnMgPSB0aGlzLl93aGVuUXVpZXRGbnM7XG4gICAgICB0aGlzLl93aGVuUXVpZXRGbnMgPSBbXTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHsgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTsgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcG9ydEVycm9yKGVycm9yczogc3RyaW5nW10pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gcHJvY2VzcyBhbmltYXRpb25zIGR1ZSB0byB0aGUgZm9sbG93aW5nIGZhaWxlZCB0cmlnZ2VyIHRyYW5zaXRpb25zXFxuICR7XG4gICAgICAgICAgICBlcnJvcnMuam9pbignXFxuJyl9YCk7XG4gIH1cblxuICBwcml2YXRlIF9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZuczogRnVuY3Rpb25bXSwgbWljcm90YXNrSWQ6IG51bWJlcik6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHN1YlRpbWVsaW5lcyA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgcXVldWVkSW5zdHJ1Y3Rpb25zOiBRdWV1ZWRUcmFuc2l0aW9uW10gPSBbXTtcbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IGFsbFByZVN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG4gICAgY29uc3QgYWxsUG9zdFN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG5cbiAgICBjb25zdCBkaXNhYmxlZEVsZW1lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gICAgdGhpcy5kaXNhYmxlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2RlKTtcbiAgICAgIGNvbnN0IG5vZGVzVGhhdEFyZURpc2FibGVkID0gdGhpcy5kcml2ZXIucXVlcnkobm9kZSwgUVVFVUVEX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUaGF0QXJlRGlzYWJsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZXNUaGF0QXJlRGlzYWJsZWRbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgYm9keU5vZGUgPSBnZXRCb2R5Tm9kZSgpO1xuICAgIGNvbnN0IGFsbFRyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5zdGF0ZXNCeUVsZW1lbnQua2V5cygpKTtcbiAgICBjb25zdCBlbnRlck5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMpO1xuXG4gICAgLy8gdGhpcyBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBidWlsdCBiZWxvdyBzdWNoIHRoYXRcbiAgICAvLyB0aGUgOmVudGVyIHF1ZXJpZXMgbWF0Y2ggdGhlIGVsZW1lbnRzIChzaW5jZSB0aGUgdGltZWxpbmUgcXVlcmllc1xuICAgIC8vIGFyZSBmaXJlZCBkdXJpbmcgaW5zdHJ1Y3Rpb24gYnVpbGRpbmcpLlxuICAgIGNvbnN0IGVudGVyTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gRU5URVJfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgZW50ZXJOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsTGVhdmVOb2RlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBtZXJnZWRMZWF2ZU5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zID0gbmV3IFNldDxhbnk+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgICBhbGxMZWF2ZU5vZGVzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZGV0YWlscy5oYXNBbmltYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBTVEFSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbG0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVhdmVOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCBBcnJheS5mcm9tKG1lcmdlZExlYXZlTm9kZXMpKTtcbiAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IExFQVZFX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGxlYXZlTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNsZWFudXBGbnMucHVzaCgoKSA9PiB7XG4gICAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChyb290KSAhO1xuICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgICB9KTtcblxuICAgICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbExlYXZlTm9kZXMuZm9yRWFjaChlbGVtZW50ID0+IHsgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpOyB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGVycm9uZW91c1RyYW5zaXRpb25zOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICBucy5kcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkKS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgICAgYWxsUGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgICAgICAgaWYgKHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgICAgICAvLyBtb3ZlIGFuaW1hdGlvbnMgYXJlIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLi4uXG4gICAgICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JNb3ZlKSB7XG4gICAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYm9keU5vZGUgfHwgIXRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChib2R5Tm9kZSwgZWxlbWVudCkpIHtcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlYXZlQ2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBlbnRlckNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPVxuICAgICAgICAgICAgdGhpcy5fYnVpbGRJbnN0cnVjdGlvbihlbnRyeSwgc3ViVGltZWxpbmVzLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUpICE7XG4gICAgICAgIGlmIChpbnN0cnVjdGlvbi5lcnJvcnMgJiYgaW5zdHJ1Y3Rpb24uZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLnB1c2goaW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgdW5tYXRjaGVkIHRyYW5zaXRpb24gaXMgcXVldWVkIHRvIGdvIHRoZW4gaXQgU0hPVUxEIE5PVCByZW5kZXJcbiAgICAgICAgLy8gYW4gYW5pbWF0aW9uIGFuZCBjYW5jZWwgdGhlIHByZXZpb3VzbHkgcnVubmluZyBhbmltYXRpb25zLlxuICAgICAgICBpZiAoZW50cnkuaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGlmIGEgcGFyZW50IGFuaW1hdGlvbiB1c2VzIHRoaXMgYW5pbWF0aW9uIGFzIGEgc3ViIHRyaWdnZXJcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGluc3RydWN0IHRoZSB0aW1lbGluZSBidWlsZGVyIHRvIG5vdCBhZGQgYSBwbGF5ZXIgZGVsYXksIGJ1dFxuICAgICAgICAvLyBpbnN0ZWFkIHN0cmV0Y2ggdGhlIGZpcnN0IGtleWZyYW1lIGdhcCB1cCB1bnRpbCB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gVGhlXG4gICAgICAgIC8vIHJlYXNvbiB0aGlzIGlzIGltcG9ydGFudCBpcyB0byBwcmV2ZW50IGV4dHJhIGluaXRpYWxpemF0aW9uIHN0eWxlcyBmcm9tIGJlaW5nXG4gICAgICAgIC8vIHJlcXVpcmVkIGJ5IHRoZSB1c2VyIGluIHRoZSBhbmltYXRpb24uXG4gICAgICAgIGluc3RydWN0aW9uLnRpbWVsaW5lcy5mb3JFYWNoKHRsID0+IHRsLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lID0gdHJ1ZSk7XG5cbiAgICAgICAgc3ViVGltZWxpbmVzLmFwcGVuZChlbGVtZW50LCBpbnN0cnVjdGlvbi50aW1lbGluZXMpO1xuXG4gICAgICAgIGNvbnN0IHR1cGxlID0ge2luc3RydWN0aW9uLCBwbGF5ZXIsIGVsZW1lbnR9O1xuXG4gICAgICAgIHF1ZXVlZEluc3RydWN0aW9ucy5wdXNoKHR1cGxlKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5xdWVyaWVkRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgICAgIGVsZW1lbnQgPT4gZ2V0T3JTZXRBc0luTWFwKHF1ZXJpZWRFbGVtZW50cywgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgaWYgKHByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucG9zdFN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBzZXRWYWwuYWRkKHByb3ApKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb25lb3VzVHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgZXJyb3JzLnB1c2goYEAke2luc3RydWN0aW9uLnRyaWdnZXJOYW1lfSBoYXMgZmFpbGVkIGR1ZSB0bzpcXG5gKTtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uZXJyb3JzICEuZm9yRWFjaChlcnJvciA9PiBlcnJvcnMucHVzaChgLSAke2Vycm9yfVxcbmApKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbFByZXZpb3VzUGxheWVyc01hcCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgLy8gdGhpcyBtYXAgd29ya3MgdG8gdGVsbCB3aGljaCBlbGVtZW50IGluIHRoZSBET00gdHJlZSBpcyBjb250YWluZWQgYnlcbiAgICAvLyB3aGljaCBhbmltYXRpb24uIEZ1cnRoZXIgZG93biBiZWxvdyB0aGlzIG1hcCB3aWxsIGdldCBwb3B1bGF0ZWQgb25jZVxuICAgIC8vIHRoZSBwbGF5ZXJzIGFyZSBidWlsdCBhbmQgaW4gZG9pbmcgc28gaXQgY2FuIGVmZmljaWVudGx5IGZpZ3VyZSBvdXRcbiAgICAvLyBpZiBhIHN1YiBwbGF5ZXIgaXMgc2tpcHBlZCBkdWUgdG8gYSBwYXJlbnQgcGxheWVyIGhhdmluZyBwcmlvcml0eS5cbiAgICBjb25zdCBhbmltYXRpb25FbGVtZW50TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgICAgICAgIGVudHJ5LnBsYXllci5uYW1lc3BhY2VJZCwgZW50cnkuaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gcGxheWVyLmVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhlbGVtZW50LCBmYWxzZSwgcGxheWVyLm5hbWVzcGFjZUlkLCBwbGF5ZXIudHJpZ2dlck5hbWUsIG51bGwpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocHJldlBsYXllciA9PiB7XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHByZXZQbGF5ZXIpO1xuICAgICAgICBwcmV2UGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igbm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQgKGVpdGhlciBieSlcbiAgICAvLyBoYXZpbmcgdGhlaXIgb3duIGxlYXZlIGFuaW1hdGlvbnMgb3IgYnkgYmVpbmcgcXVlcmllZCBpbiBhIGNvbnRhaW5lclxuICAgIC8vIHRoYXQgd2lsbCBiZSByZW1vdmVkIG9uY2UgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLiBUaGUgaWRlYVxuICAgIC8vIGhlcmUgaXMgdGhhdCAqIHN0eWxlcyBtdXN0IGJlIGlkZW50aWNhbCB0byAhIHN0eWxlcyBiZWNhdXNlIG9mXG4gICAgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKCogaXMgYWxzbyBmaWxsZWQgaW4gYnkgZGVmYXVsdCBpbiBtYW55IHBsYWNlcykuXG4gICAgLy8gT3RoZXJ3aXNlICogc3R5bGVzIHdpbGwgcmV0dXJuIGFuIGVtcHR5IHZhbHVlIG9yIGF1dG8gc2luY2UgdGhlIGVsZW1lbnRcbiAgICAvLyB0aGF0IGlzIGJlaW5nIGdldENvbXB1dGVkU3R5bGUnZCB3aWxsIG5vdCBiZSB2aXNpYmxlIChzaW5jZSAqID0gZGVzdGluYXRpb24pXG4gICAgY29uc3QgcmVwbGFjZU5vZGVzID0gYWxsTGVhdmVOb2Rlcy5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cyk7XG4gICAgfSk7XG5cbiAgICAvLyBQT1NUIFNUQUdFOiBmaWxsIHRoZSAqIHN0eWxlc1xuICAgIGNvbnN0IHBvc3RTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgY29uc3QgYWxsTGVhdmVRdWVyaWVkTm9kZXMgPSBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgIHBvc3RTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzLCBBVVRPX1NUWUxFKTtcblxuICAgIGFsbExlYXZlUXVlcmllZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBpZiAocmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cykpIHtcbiAgICAgICAgcmVwbGFjZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQUkUgU1RBR0U6IGZpbGwgdGhlICEgc3R5bGVzXG4gICAgY29uc3QgcHJlU3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICAgIHByZVN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIG5ldyBTZXQobm9kZXMpLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBQUkVfU1RZTEUpO1xuICAgIH0pO1xuXG4gICAgcmVwbGFjZU5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBjb25zdCBwb3N0ID0gcG9zdFN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBjb25zdCBwcmUgPSBwcmVTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgcG9zdFN0eWxlc01hcC5zZXQobm9kZSwgeyAuLi5wb3N0LCAuLi5wcmUgfSBhcyBhbnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9vdFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHN1YlBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCA9IHt9O1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHtlbGVtZW50LCBwbGF5ZXIsIGluc3RydWN0aW9ufSA9IGVudHJ5O1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGl0IHdhcyBuZXZlciBjb25zdW1lZCBieSBhIHBhcmVudCBhbmltYXRpb24gd2hpY2hcbiAgICAgIC8vIG1lYW5zIHRoYXQgaXQgaXMgaW5kZXBlbmRlbnQgYW5kIHRoZXJlZm9yZSBzaG91bGQgYmUgc2V0IGZvciBhbmltYXRpb25cbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICBwbGF5ZXIub3ZlcnJpZGVUb3RhbFRpbWUoaW5zdHJ1Y3Rpb24udG90YWxUaW1lKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGZsb3cgdXAgdGhlIERPTSBhbmQgcXVlcnkgdGhlIG1hcCB0byBmaWd1cmUgb3V0XG4gICAgICAgIC8vIGlmIGEgcGFyZW50IGFuaW1hdGlvbiBoYXMgcHJpb3JpdHkgb3ZlciBpdC4gSW4gdGhlIHNpdHVhdGlvblxuICAgICAgICAvLyB0aGF0IGEgcGFyZW50IGlzIGRldGVjdGVkIHRoZW4gaXQgd2lsbCBjYW5jZWwgdGhlIGxvb3AuIElmXG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZGV0ZWN0ZWQsIG9yIGl0IHRha2VzIGEgZmV3IGhvcHMgdG8gZmluZCBhIHBhcmVudCxcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGZpbGwgaW4gdGhlIG1pc3Npbmcgbm9kZXMgYW5kIHNpZ25hbCB0aGVtIGFzIGhhdmluZ1xuICAgICAgICAvLyBhIGRldGVjdGVkIHBhcmVudCAob3IgYSBOT19QQVJFTlQgdmFsdWUgdmlhIGEgc3BlY2lhbCBjb25zdGFudCkuXG4gICAgICAgIGxldCBwYXJlbnRXaXRoQW5pbWF0aW9uOiBhbnkgPSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQ7XG4gICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50TWFwLnNpemUgPiAxKSB7XG4gICAgICAgICAgbGV0IGVsbSA9IGVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgcGFyZW50c1RvQWRkOiBhbnlbXSA9IFtdO1xuICAgICAgICAgIHdoaWxlIChlbG0gPSBlbG0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0ZWRQYXJlbnQgPSBhbmltYXRpb25FbGVtZW50TWFwLmdldChlbG0pO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkUGFyZW50KSB7XG4gICAgICAgICAgICAgIHBhcmVudFdpdGhBbmltYXRpb24gPSBkZXRlY3RlZFBhcmVudDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRzVG9BZGQucHVzaChlbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnRzVG9BZGQuZm9yRWFjaChwYXJlbnQgPT4gYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQocGFyZW50LCBwYXJlbnRXaXRoQW5pbWF0aW9uKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IHRoaXMuX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLm5hbWVzcGFjZUlkLCBpbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBza2lwcGVkUGxheWVyc01hcCwgcHJlU3R5bGVzTWFwLFxuICAgICAgICAgICAgcG9zdFN0eWxlc01hcCk7XG5cbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuXG4gICAgICAgIGlmIChwYXJlbnRXaXRoQW5pbWF0aW9uID09PSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQpIHtcbiAgICAgICAgICByb290UGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQocGFyZW50V2l0aEFuaW1hdGlvbik7XG4gICAgICAgICAgaWYgKHBhcmVudFBsYXllcnMgJiYgcGFyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllci5wYXJlbnRQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBhcmVudFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAvLyB0aGVyZSBzdGlsbCBtaWdodCBiZSBhIGFuY2VzdG9yIHBsYXllciBhbmltYXRpbmcgdGhpc1xuICAgICAgICAvLyBlbGVtZW50IHRoZXJlZm9yZSB3ZSB3aWxsIHN0aWxsIGFkZCBpdCBhcyBhIHN1YiBwbGF5ZXJcbiAgICAgICAgLy8gZXZlbiBpZiBpdHMgYW5pbWF0aW9uIG1heSBiZSBkaXNhYmxlZFxuICAgICAgICBzdWJQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBmaW5kIGFsbCBvZiB0aGUgc3ViIHBsYXllcnMnIGNvcnJlc3BvbmRpbmcgaW5uZXIgYW5pbWF0aW9uIHBsYXllclxuICAgIHN1YlBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gZXZlbiBpZiBhbnkgcGxheWVycyBhcmUgbm90IGZvdW5kIGZvciBhIHN1YiBhbmltYXRpb24gdGhlbiBpdFxuICAgICAgLy8gd2lsbCBzdGlsbCBjb21wbGV0ZSBpdHNlbGYgYWZ0ZXIgdGhlIG5leHQgdGljayBzaW5jZSBpdCdzIE5vb3BcbiAgICAgIGNvbnN0IHBsYXllcnNGb3JFbGVtZW50ID0gc2tpcHBlZFBsYXllcnNNYXAuZ2V0KHBsYXllci5lbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzRm9yRWxlbWVudCAmJiBwbGF5ZXJzRm9yRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnNGb3JFbGVtZW50KTtcbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgYWN0dWFsbHkgcGxheSB0aGUgYW5pbWF0aW9uIGlzXG4gICAgLy8gYmVjYXVzZSBhbGwgdGhhdCBhIHNraXBwZWQgcGxheWVyIGlzIGRlc2lnbmVkIHRvIGRvIGlzIHRvXG4gICAgLy8gZmlyZSB0aGUgc3RhcnQvZG9uZSB0cmFuc2l0aW9uIGNhbGxiYWNrIGV2ZW50c1xuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGlmIChwbGF5ZXIucGFyZW50UGxheWVyKSB7XG4gICAgICAgIHBsYXllci5zeW5jUGxheWVyRXZlbnRzKHBsYXllci5wYXJlbnRQbGF5ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHJ1biB0aHJvdWdoIGFsbCBvZiB0aGUgcXVldWVkIHJlbW92YWxzIGFuZCBzZWUgaWYgdGhleVxuICAgIC8vIHdlcmUgcGlja2VkIHVwIGJ5IGEgcXVlcnkuIElmIG5vdCB0aGVuIHBlcmZvcm0gdGhlIHJlbW92YWxcbiAgICAvLyBvcGVyYXRpb24gcmlnaHQgYXdheSB1bmxlc3MgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIG9uZ29pbmcuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxMZWF2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gYWxsTGVhdmVOb2Rlc1tpXTtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTEVBVkVfQ0xBU1NOQU1FKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGUgZWxlbWVudCBoYXMgYSByZW1vdmFsIGFuaW1hdGlvbiB0aGF0IGlzIGJlaW5nXG4gICAgICAvLyB0YWtlbiBjYXJlIG9mIGFuZCB0aGVyZWZvcmUgdGhlIGlubmVyIGVsZW1lbnRzIHdpbGwgaGFuZyBhcm91bmRcbiAgICAgIC8vIHVudGlsIHRoYXQgYW5pbWF0aW9uIGlzIG92ZXIgKG9yIHRoZSBwYXJlbnQgcXVlcmllZCBhbmltYXRpb24pXG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLmhhc0FuaW1hdGlvbikgY29udGludWU7XG5cbiAgICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGlzIHF1ZXJpZWQgb3IgaWYgaXQgY29udGFpbnMgcXVlcmllZCBjaGlsZHJlblxuICAgICAgLy8gdGhlbiB3ZSB3YW50IGZvciB0aGUgZWxlbWVudCBub3QgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwYWdlXG4gICAgICAvLyB1bnRpbCB0aGUgcXVlcmllZCBhbmltYXRpb25zIGhhdmUgZmluaXNoZWRcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudHMuc2l6ZSkge1xuICAgICAgICBsZXQgcXVlcmllZFBsYXllclJlc3VsdHMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAocXVlcmllZFBsYXllclJlc3VsdHMgJiYgcXVlcmllZFBsYXllclJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJSZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWVyaWVkSW5uZXJFbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcXVlcmllZElubmVyRWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBsZXQgcXVlcmllZFBsYXllcnMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KHF1ZXJpZWRJbm5lckVsZW1lbnRzW2pdKTtcbiAgICAgICAgICBpZiAocXVlcmllZFBsYXllcnMgJiYgcXVlcmllZFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVQbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocCA9PiAhcC5kZXN0cm95ZWQpO1xuICAgICAgaWYgKGFjdGl2ZVBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKHRoaXMsIGVsZW1lbnQsIGFjdGl2ZVBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgc28gdGhlIGNsZWFudXAgbWV0aG9kIGRvZXNuJ3QgcmVtb3ZlIHRoZW1cbiAgICBhbGxMZWF2ZU5vZGVzLmxlbmd0aCA9IDA7XG5cbiAgICByb290UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH0pO1xuICAgICAgcGxheWVyLnBsYXkoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByb290UGxheWVycztcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55KSB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMuc3RhdGVzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudCkgfHwgY29udGFpbnNEYXRhO1xuICB9XG5cbiAgYWZ0ZXJGbHVzaChjYWxsYmFjazogKCkgPT4gYW55KSB7IHRoaXMuX2ZsdXNoRm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHsgdGhpcy5fd2hlblF1aWV0Rm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgZWxlbWVudDogc3RyaW5nLCBpc1F1ZXJpZWRFbGVtZW50OiBib29sZWFuLCBuYW1lc3BhY2VJZD86IHN0cmluZywgdHJpZ2dlck5hbWU/OiBzdHJpbmcsXG4gICAgICB0b1N0YXRlVmFsdWU/OiBhbnkpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgY29uc3QgcXVlcmllZEVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIHBsYXllcnMgPSBxdWVyaWVkRWxlbWVudFBsYXllcnM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgICBjb25zdCBpc1JlbW92YWxBbmltYXRpb24gPSAhdG9TdGF0ZVZhbHVlIHx8IHRvU3RhdGVWYWx1ZSA9PSBWT0lEX1ZBTFVFO1xuICAgICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWlzUmVtb3ZhbEFuaW1hdGlvbiAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgIT0gdHJpZ2dlck5hbWUpIHJldHVybjtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYW1lc3BhY2VJZCB8fCB0cmlnZ2VyTmFtZSkge1xuICAgICAgcGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChuYW1lc3BhY2VJZCAmJiBuYW1lc3BhY2VJZCAhPSBwbGF5ZXIubmFtZXNwYWNlSWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRyaWdnZXJOYW1lICYmIHRyaWdnZXJOYW1lICE9IHBsYXllci50cmlnZ2VyTmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIHByaXZhdGUgX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPikge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2hlbiBhIHJlbW92YWwgYW5pbWF0aW9uIG9jY3VycywgQUxMIHByZXZpb3VzIHBsYXllcnMgYXJlIGNvbGxlY3RlZFxuICAgIC8vIGFuZCBkZXN0cm95ZWQgKGV2ZW4gaWYgdGhleSBhcmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBuYW1lc3BhY2UpXG4gICAgY29uc3QgdGFyZ2V0TmFtZVNwYWNlSWQ6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogbmFtZXNwYWNlSWQ7XG4gICAgY29uc3QgdGFyZ2V0VHJpZ2dlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogdHJpZ2dlck5hbWU7XG5cbiAgICBmb3IgKGNvbnN0IHRpbWVsaW5lSW5zdHJ1Y3Rpb24gb2YgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcGxheWVycyA9IGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKTtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9IHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgICAgICBlbGVtZW50LCBpc1F1ZXJpZWRFbGVtZW50LCB0YXJnZXROYW1lU3BhY2VJZCwgdGFyZ2V0VHJpZ2dlck5hbWUsIGluc3RydWN0aW9uLnRvU3RhdGUpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgY29uc3QgcmVhbFBsYXllciA9IHBsYXllci5nZXRSZWFsUGxheWVyKCkgYXMgYW55O1xuICAgICAgICBpZiAocmVhbFBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgICAgcmVhbFBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgc28gdGhhdCB0aGUgUFJFL1BPU1Qgc3R5bGVzIGNhbiBiZVxuICAgIC8vIGNvbXB1dGVkIHByb3Blcmx5IHdpdGhvdXQgaW50ZXJmZXJpbmcgd2l0aCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uXG4gICAgZXJhc2VTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBbmltYXRpb24oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+LFxuICAgICAgc2tpcHBlZFBsYXllcnNNYXA6IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPiwgcHJlU3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sXG4gICAgICBwb3N0U3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2UgZmlyc3QgcnVuIHRoaXMgc28gdGhhdCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHBsYXllclxuICAgIC8vIGRhdGEgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBzdWNjZXNzaXZlIGFuaW1hdGlvbiBwbGF5ZXJzXG4gICAgY29uc3QgYWxsUXVlcmllZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGFsbENvbnN1bWVkRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxTdWJFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbE5ld1BsYXllcnMgPSBpbnN0cnVjdGlvbi50aW1lbGluZXMubWFwKHRpbWVsaW5lSW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAvLyBGSVhNRSAobWF0c2tvKTogbWFrZSBzdXJlIHRvLWJlLXJlbW92ZWQgYW5pbWF0aW9ucyBhcmUgcmVtb3ZlZCBwcm9wZXJseVxuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMucmVtb3ZlZEJlZm9yZVF1ZXJpZWQpXG4gICAgICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLmR1cmF0aW9uLCB0aW1lbGluZUluc3RydWN0aW9uLmRlbGF5KTtcblxuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICBmbGF0dGVuR3JvdXBQbGF5ZXJzKChhbGxQcmV2aW91c1BsYXllcnNNYXAuZ2V0KGVsZW1lbnQpIHx8IEVNUFRZX1BMQVlFUl9BUlJBWSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHAgPT4gcC5nZXRSZWFsUGxheWVyKCkpKVxuICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBgZWxlbWVudGAgaXMgbm90IGFwYXJ0IG9mIHRoZSBBbmltYXRpb25QbGF5ZXIgZGVmaW5pdGlvbiwgYnV0XG4gICAgICAgICAgICAgICAgLy8gTW9jay9XZWJBbmltYXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBlbGVtZW50IHdpdGhpbiB0aGVpciBpbXBsZW1lbnRhdGlvbi4gVGhpcyB3aWxsIGJlIGFkZGVkIGluIEFuZ3VsYXI1IHRvXG4gICAgICAgICAgICAgICAgLy8gQW5pbWF0aW9uUGxheWVyXG4gICAgICAgICAgICAgICAgY29uc3QgcHAgPSBwIGFzIGFueTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHAuZWxlbWVudCA/IHBwLmVsZW1lbnQgPT09IGVsZW1lbnQgOiBmYWxzZTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHByZVN0eWxlcyA9IHByZVN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBwb3N0U3R5bGVzID0gcG9zdFN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBrZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgICAgICAgdGhpcy5kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIHRpbWVsaW5lSW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBwcmVTdHlsZXMsXG4gICAgICAgICAgcG9zdFN0eWxlcyk7XG4gICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9idWlsZFBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXMsIHByZXZpb3VzUGxheWVycyk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGlzIHBhcnRpY3VsYXIgcGxheWVyIGJlbG9uZ3MgdG8gYSBzdWIgdHJpZ2dlci4gSXQgaXNcbiAgICAgIC8vIGltcG9ydGFudCB0aGF0IHdlIG1hdGNoIHRoaXMgcGxheWVyIHVwIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgKEB0cmlnZ2VyLmxpc3RlbmVyKVxuICAgICAgaWYgKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uc3ViVGltZWxpbmUgJiYgc2tpcHBlZFBsYXllcnNNYXApIHtcbiAgICAgICAgYWxsU3ViRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgICBjb25zdCB3cmFwcGVkUGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIobmFtZXNwYWNlSWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcbiAgICAgICAgd3JhcHBlZFBsYXllci5zZXRSZWFsUGxheWVyKHBsYXllcik7XG4gICAgICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLnB1c2god3JhcHBlZFBsYXllcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfSk7XG5cbiAgICBhbGxRdWVyaWVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGRlbGV0ZU9yVW5zZXRJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgcGxheWVyKSk7XG4gICAgfSk7XG5cbiAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBhZGRDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgY29uc3QgcGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihhbGxOZXdQbGF5ZXJzKTtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHJlbW92ZUNsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICAgIHNldFN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBiYXNpY2FsbHkgbWFrZXMgYWxsIG9mIHRoZSBjYWxsYmFja3MgZm9yIHN1YiBlbGVtZW50IGFuaW1hdGlvbnNcbiAgICAvLyBiZSBkZXBlbmRlbnQgb24gdGhlIHVwcGVyIHBsYXllcnMgZm9yIHdoZW4gdGhleSBmaW5pc2hcbiAgICBhbGxTdWJFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICBlbGVtZW50ID0+IHsgZ2V0T3JTZXRBc0luTWFwKHNraXBwZWRQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpOyB9KTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBpZiAoa2V5ZnJhbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRyaXZlci5hbmltYXRlKFxuICAgICAgICAgIGluc3RydWN0aW9uLmVsZW1lbnQsIGtleWZyYW1lcywgaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgICAgIGluc3RydWN0aW9uLmVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZW1wdHkgdHJhbnNpdGlvbnxkZWZpbml0aW9uIGlzIHByb3ZpZGVkXG4gICAgLy8gLi4uIHRoZXJlIGlzIG5vIHBvaW50IGluIHJlbmRlcmluZyBhbiBlbXB0eSBhbmltYXRpb25cbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3BsYXllcjogQW5pbWF0aW9uUGxheWVyID0gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgcHJpdmF0ZSBfY29udGFpbnNSZWFsUGxheWVyID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcXVldWVkQ2FsbGJhY2tzOiB7W25hbWU6IHN0cmluZ106ICgoKSA9PiBhbnkpW119ID0ge307XG4gIHB1YmxpYyByZWFkb25seSBkZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyO1xuXG4gIHB1YmxpYyBtYXJrZWRGb3JEZXN0cm95OiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHJlYWRvbmx5IHF1ZXVlZDogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcsIHB1YmxpYyB0cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55KSB7fVxuXG4gIHNldFJlYWxQbGF5ZXIocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbnNSZWFsUGxheWVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgT2JqZWN0LmtleXModGhpcy5fcXVldWVkQ2FsbGJhY2tzKS5mb3JFYWNoKHBoYXNlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrc1twaGFzZV0uZm9yRWFjaChcbiAgICAgICAgICBjYWxsYmFjayA9PiBsaXN0ZW5PblBsYXllcihwbGF5ZXIsIHBoYXNlLCB1bmRlZmluZWQsIGNhbGxiYWNrKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fY29udGFpbnNSZWFsUGxheWVyID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJyaWRlVG90YWxUaW1lKHBsYXllci50b3RhbFRpbWUpO1xuICAgICh0aGlzIGFze3F1ZXVlZDogYm9vbGVhbn0pLnF1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0UmVhbFBsYXllcigpIHsgcmV0dXJuIHRoaXMuX3BsYXllcjsgfVxuXG4gIG92ZXJyaWRlVG90YWxUaW1lKHRvdGFsVGltZTogbnVtYmVyKSB7ICh0aGlzIGFzIGFueSkudG90YWxUaW1lID0gdG90YWxUaW1lOyB9XG5cbiAgc3luY1BsYXllckV2ZW50cyhwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gcC50cmlnZ2VyQ2FsbGJhY2sgISgnc3RhcnQnKSk7XG4gICAgfVxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBwcml2YXRlIF9xdWV1ZUV2ZW50KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fcXVldWVkQ2FsbGJhY2tzLCBuYW1lLCBbXSkucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2RvbmUnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRvbmUoZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnc3RhcnQnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vblN0YXJ0KGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZGVzdHJveScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRGVzdHJveShmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuaW5pdCgpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucXVldWVkID8gZmFsc2UgOiB0aGlzLl9wbGF5ZXIuaGFzU3RhcnRlZCgpOyB9XG5cbiAgcGxheSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wbGF5KCk7IH1cblxuICBwYXVzZSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wYXVzZSgpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5yZXN0YXJ0KCk7IH1cblxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX3BsYXllci5maW5pc2goKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgKHRoaXMgYXN7ZGVzdHJveWVkOiBib29sZWFufSkuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9wbGF5ZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzZXQoKTsgfVxuXG4gIHNldFBvc2l0aW9uKHA6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3BsYXllci5zZXRQb3NpdGlvbihwKTtcbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5xdWV1ZWQgPyAwIDogdGhpcy5fcGxheWVyLmdldFBvc2l0aW9uKCk7IH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BsYXllciBhcyBhbnk7XG4gICAgaWYgKHAudHJpZ2dlckNhbGxiYWNrKSB7XG4gICAgICBwLnRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxldGVPclVuc2V0SW5NYXAobWFwOiBNYXA8YW55LCBhbnlbXT58IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IGFueSwgdmFsdWU6IGFueSkge1xuICBsZXQgY3VycmVudFZhbHVlczogYW55W118bnVsbHx1bmRlZmluZWQ7XG4gIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwLmdldChrZXkpO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtYXAuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXBba2V5XTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY3VycmVudFZhbHVlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlOiBhbnkpOiBhbnkge1xuICAvLyB3ZSB1c2UgYCE9IG51bGxgIGhlcmUgYmVjYXVzZSBpdCdzIHRoZSBtb3N0IHNpbXBsZVxuICAvLyB3YXkgdG8gdGVzdCBhZ2FpbnN0IGEgXCJmYWxzeVwiIHZhbHVlIHdpdGhvdXQgbWl4aW5nXG4gIC8vIGluIGVtcHR5IHN0cmluZ3Mgb3IgYSB6ZXJvIHZhbHVlLiBETyBOT1QgT1BUSU1JWkUuXG4gIHJldHVybiB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnROb2RlKG5vZGU6IGFueSkge1xuICByZXR1cm4gbm9kZSAmJiBub2RlWydub2RlVHlwZSddID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc1RyaWdnZXJFdmVudFZhbGlkKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBldmVudE5hbWUgPT0gJ3N0YXJ0JyB8fCBldmVudE5hbWUgPT0gJ2RvbmUnO1xufVxuXG5mdW5jdGlvbiBjbG9ha0VsZW1lbnQoZWxlbWVudDogYW55LCB2YWx1ZT86IHN0cmluZykge1xuICBjb25zdCBvbGRWYWx1ZSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheTtcbiAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogJ25vbmUnO1xuICByZXR1cm4gb2xkVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICB2YWx1ZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPiwgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnRzOiBTZXQ8YW55PixcbiAgICBlbGVtZW50UHJvcHNNYXA6IE1hcDxhbnksIFNldDxzdHJpbmc+PiwgZGVmYXVsdFN0eWxlOiBzdHJpbmcpOiBhbnlbXSB7XG4gIGNvbnN0IGNsb2FrVmFsczogc3RyaW5nW10gPSBbXTtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrVmFscy5wdXNoKGNsb2FrRWxlbWVudChlbGVtZW50KSkpO1xuXG4gIGNvbnN0IGZhaWxlZEVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuXG4gIGVsZW1lbnRQcm9wc01hcC5mb3JFYWNoKChwcm9wczogU2V0PHN0cmluZz4sIGVsZW1lbnQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBzdHlsZXNbcHJvcF0gPSBkcml2ZXIuY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3AsIGRlZmF1bHRTdHlsZSk7XG5cbiAgICAgIC8vIHRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGRldGVjdCB0aGlzIGJlY2F1c2UgYSBzdWIgZWxlbWVudCBjb3VsZCBiZSByZW1vdmVkXG4gICAgICAvLyBieSBhIHBhcmVudCBhbmltYXRpb24gZWxlbWVudCBiZWluZyBkZXRhY2hlZC5cbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUubGVuZ3RoID09IDApIHtcbiAgICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU7XG4gICAgICAgIGZhaWxlZEVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFsdWVzTWFwLnNldChlbGVtZW50LCBzdHlsZXMpO1xuICB9KTtcblxuICAvLyB3ZSB1c2UgYSBpbmRleCB2YXJpYWJsZSBoZXJlIHNpbmNlIFNldC5mb3JFYWNoKGEsIGkpIGRvZXMgbm90IHJldHVyblxuICAvLyBhbiBpbmRleCB2YWx1ZSBmb3IgdGhlIGNsb3N1cmUgKGJ1dCBpbnN0ZWFkIGp1c3QgdGhlIHZhbHVlKVxuICBsZXQgaSA9IDA7XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha0VsZW1lbnQoZWxlbWVudCwgY2xvYWtWYWxzW2krK10pKTtcblxuICByZXR1cm4gZmFpbGVkRWxlbWVudHM7XG59XG5cbi8qXG5TaW5jZSB0aGUgQW5ndWxhciByZW5kZXJlciBjb2RlIHdpbGwgcmV0dXJuIGEgY29sbGVjdGlvbiBvZiBpbnNlcnRlZFxubm9kZXMgaW4gYWxsIGFyZWFzIG9mIGEgRE9NIHRyZWUsIGl0J3MgdXAgdG8gdGhpcyBhbGdvcml0aG0gdG8gZmlndXJlXG5vdXQgd2hpY2ggbm9kZXMgYXJlIHJvb3RzIGZvciBlYWNoIGFuaW1hdGlvbiBAdHJpZ2dlci5cblxuQnkgcGxhY2luZyBlYWNoIGluc2VydGVkIG5vZGUgaW50byBhIFNldCBhbmQgdHJhdmVyc2luZyB1cHdhcmRzLCBpdFxuaXMgcG9zc2libGUgdG8gZmluZCB0aGUgQHRyaWdnZXIgZWxlbWVudHMgYW5kIHdlbGwgYW55IGRpcmVjdCAqc3RhclxuaW5zZXJ0aW9uIG5vZGVzLCBpZiBhIEB0cmlnZ2VyIHJvb3QgaXMgZm91bmQgdGhlbiB0aGUgZW50ZXIgZWxlbWVudFxuaXMgcGxhY2VkIGludG8gdGhlIE1hcFtAdHJpZ2dlcl0gc3BvdC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRSb290TWFwKHJvb3RzOiBhbnlbXSwgbm9kZXM6IGFueVtdKTogTWFwPGFueSwgYW55W10+IHtcbiAgY29uc3Qgcm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnlbXT4oKTtcbiAgcm9vdHMuZm9yRWFjaChyb290ID0+IHJvb3RNYXAuc2V0KHJvb3QsIFtdKSk7XG5cbiAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSByZXR1cm4gcm9vdE1hcDtcblxuICBjb25zdCBOVUxMX05PREUgPSAxO1xuICBjb25zdCBub2RlU2V0ID0gbmV3IFNldChub2Rlcyk7XG4gIGNvbnN0IGxvY2FsUm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG5cbiAgZnVuY3Rpb24gZ2V0Um9vdChub2RlOiBhbnkpOiBhbnkge1xuICAgIGlmICghbm9kZSkgcmV0dXJuIE5VTExfTk9ERTtcblxuICAgIGxldCByb290ID0gbG9jYWxSb290TWFwLmdldChub2RlKTtcbiAgICBpZiAocm9vdCkgcmV0dXJuIHJvb3Q7XG5cbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgaWYgKHJvb3RNYXAuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIEB0cmlnZ2VyXG4gICAgICByb290ID0gcGFyZW50O1xuICAgIH0gZWxzZSBpZiAobm9kZVNldC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgbmdJZlxuICAgICAgcm9vdCA9IE5VTExfTk9ERTtcbiAgICB9IGVsc2UgeyAgLy8gcmVjdXJzZSB1cHdhcmRzXG4gICAgICByb290ID0gZ2V0Um9vdChwYXJlbnQpO1xuICAgIH1cblxuICAgIGxvY2FsUm9vdE1hcC5zZXQobm9kZSwgcm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBnZXRSb290KG5vZGUpO1xuICAgIGlmIChyb290ICE9PSBOVUxMX05PREUpIHtcbiAgICAgIHJvb3RNYXAuZ2V0KHJvb3QpICEucHVzaChub2RlKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByb290TWFwO1xufVxuXG5jb25zdCBDTEFTU0VTX0NBQ0hFX0tFWSA9ICckJGNsYXNzZXMnO1xuZnVuY3Rpb24gY29udGFpbnNDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICByZXR1cm4gY2xhc3NlcyAmJiBjbGFzc2VzW2NsYXNzTmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW59ID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgaWYgKCFjbGFzc2VzKSB7XG4gICAgICBjbGFzc2VzID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV0gPSB7fTtcbiAgICB9XG4gICAgY2xhc3Nlc1tjbGFzc05hbWVdID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjbGFzc2VzOiB7W2NsYXNzTmFtZTogc3RyaW5nXTogYm9vbGVhbn0gPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgZGVsZXRlIGNsYXNzZXNbY2xhc3NOYW1lXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUoXG4gICAgZW5naW5lOiBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lLCBlbGVtZW50OiBhbnksIHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IGVuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkdyb3VwUGxheWVycyhwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllcltdIHtcbiAgY29uc3QgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gIHJldHVybiBmaW5hbFBsYXllcnM7XG59XG5cbmZ1bmN0aW9uIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10sIGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgQW5pbWF0aW9uR3JvdXBQbGF5ZXIpIHtcbiAgICAgIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyLnBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbmFsUGxheWVycy5wdXNoKHBsYXllciBhcyBBbmltYXRpb25QbGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBvYmpFcXVhbHMoYToge1trZXk6IHN0cmluZ106IGFueX0sIGI6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYik7XG4gIGlmIChrMS5sZW5ndGggIT0gazIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgazEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcm9wID0gazFbaV07XG4gICAgaWYgKCFiLmhhc093blByb3BlcnR5KHByb3ApIHx8IGFbcHJvcF0gIT09IGJbcHJvcF0pIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShcbiAgICBlbGVtZW50OiBhbnksIGFsbFByZVN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PixcbiAgICBhbGxQb3N0U3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBvc3RFbnRyeSA9IGFsbFBvc3RTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKCFwb3N0RW50cnkpIHJldHVybiBmYWxzZTtcblxuICBsZXQgcHJlRW50cnkgPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKHByZUVudHJ5KSB7XG4gICAgcG9zdEVudHJ5LmZvckVhY2goZGF0YSA9PiBwcmVFbnRyeSAhLmFkZChkYXRhKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgcG9zdEVudHJ5KTtcbiAgfVxuXG4gIGFsbFBvc3RTdHlsZUVsZW1lbnRzLmRlbGV0ZShlbGVtZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=