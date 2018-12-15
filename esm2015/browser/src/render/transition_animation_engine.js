/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
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
import { getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
/** @type {?} */
const QUEUED_CLASSNAME = 'ng-animate-queued';
/** @type {?} */
const QUEUED_SELECTOR = '.ng-animate-queued';
/** @type {?} */
const DISABLED_CLASSNAME = 'ng-animate-disabled';
/** @type {?} */
const DISABLED_SELECTOR = '.ng-animate-disabled';
/** @type {?} */
const STAR_CLASSNAME = 'ng-star-inserted';
/** @type {?} */
const STAR_SELECTOR = '.ng-star-inserted';
/** @type {?} */
const EMPTY_PLAYER_ARRAY = [];
/** @type {?} */
const NULL_REMOVAL_STATE = {
    namespaceId: '',
    setForRemoval: false,
    setForMove: false,
    hasAnimation: false,
    removedBeforeQueried: false
};
/** @type {?} */
const NULL_REMOVED_QUERIED_STATE = {
    namespaceId: '',
    setForMove: false,
    setForRemoval: false,
    hasAnimation: false,
    removedBeforeQueried: true
};
/**
 * @record
 */
function TriggerListener() { }
if (false) {
    /** @type {?} */
    TriggerListener.prototype.name;
    /** @type {?} */
    TriggerListener.prototype.phase;
    /** @type {?} */
    TriggerListener.prototype.callback;
}
/**
 * @record
 */
export function QueueInstruction() { }
if (false) {
    /** @type {?} */
    QueueInstruction.prototype.element;
    /** @type {?} */
    QueueInstruction.prototype.triggerName;
    /** @type {?} */
    QueueInstruction.prototype.fromState;
    /** @type {?} */
    QueueInstruction.prototype.toState;
    /** @type {?} */
    QueueInstruction.prototype.transition;
    /** @type {?} */
    QueueInstruction.prototype.player;
    /** @type {?} */
    QueueInstruction.prototype.isFallbackTransition;
}
/** @type {?} */
export const REMOVAL_FLAG = '__ng_removed';
/**
 * @record
 */
export function ElementAnimationState() { }
if (false) {
    /** @type {?} */
    ElementAnimationState.prototype.setForRemoval;
    /** @type {?} */
    ElementAnimationState.prototype.setForMove;
    /** @type {?} */
    ElementAnimationState.prototype.hasAnimation;
    /** @type {?} */
    ElementAnimationState.prototype.namespaceId;
    /** @type {?} */
    ElementAnimationState.prototype.removedBeforeQueried;
}
export class StateValue {
    /**
     * @param {?} input
     * @param {?=} namespaceId
     */
    constructor(input, namespaceId = '') {
        this.namespaceId = namespaceId;
        /** @type {?} */
        const isObj = input && input.hasOwnProperty('value');
        /** @type {?} */
        const value = isObj ? input['value'] : input;
        this.value = normalizeTriggerValue(value);
        if (isObj) {
            /** @type {?} */
            const options = copyObj((/** @type {?} */ (input)));
            delete options['value'];
            this.options = (/** @type {?} */ (options));
        }
        else {
            this.options = {};
        }
        if (!this.options.params) {
            this.options.params = {};
        }
    }
    /**
     * @return {?}
     */
    get params() { return (/** @type {?} */ (this.options.params)); }
    /**
     * @param {?} options
     * @return {?}
     */
    absorbOptions(options) {
        /** @type {?} */
        const newParams = options.params;
        if (newParams) {
            /** @type {?} */
            const oldParams = (/** @type {?} */ (this.options.params));
            Object.keys(newParams).forEach(prop => {
                if (oldParams[prop] == null) {
                    oldParams[prop] = newParams[prop];
                }
            });
        }
    }
}
if (false) {
    /** @type {?} */
    StateValue.prototype.value;
    /** @type {?} */
    StateValue.prototype.options;
    /** @type {?} */
    StateValue.prototype.namespaceId;
}
/** @type {?} */
export const VOID_VALUE = 'void';
/** @type {?} */
export const DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
export class AnimationTransitionNamespace {
    /**
     * @param {?} id
     * @param {?} hostElement
     * @param {?} _engine
     */
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
    /**
     * @param {?} element
     * @param {?} name
     * @param {?} phase
     * @param {?} callback
     * @return {?}
     */
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
        /** @type {?} */
        const listeners = getOrSetAsInMap(this._elementListeners, element, []);
        /** @type {?} */
        const data = { name, phase, callback };
        listeners.push(data);
        /** @type {?} */
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
                /** @type {?} */
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
    /**
     * @param {?} name
     * @param {?} ast
     * @return {?}
     */
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
    /**
     * @param {?} name
     * @return {?}
     */
    _getTrigger(name) {
        /** @type {?} */
        const trigger = this._triggers[name];
        if (!trigger) {
            throw new Error(`The provided animation trigger "${name}" has not been registered!`);
        }
        return trigger;
    }
    /**
     * @param {?} element
     * @param {?} triggerName
     * @param {?} value
     * @param {?=} defaultToFallback
     * @return {?}
     */
    trigger(element, triggerName, value, defaultToFallback = true) {
        /** @type {?} */
        const trigger = this._getTrigger(triggerName);
        /** @type {?} */
        const player = new TransitionAnimationPlayer(this.id, triggerName, element);
        /** @type {?} */
        let triggersWithStates = this._engine.statesByElement.get(element);
        if (!triggersWithStates) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + triggerName);
            this._engine.statesByElement.set(element, triggersWithStates = {});
        }
        /** @type {?} */
        let fromState = triggersWithStates[triggerName];
        /** @type {?} */
        const toState = new StateValue(value, this.id);
        /** @type {?} */
        const isObj = value && value.hasOwnProperty('value');
        if (!isObj && fromState) {
            toState.absorbOptions(fromState.options);
        }
        triggersWithStates[triggerName] = toState;
        if (!fromState) {
            fromState = DEFAULT_STATE_VALUE;
        }
        /** @type {?} */
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
                /** @type {?} */
                const errors = [];
                /** @type {?} */
                const fromStyles = trigger.matchStyles(fromState.value, fromState.params, errors);
                /** @type {?} */
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
        /** @type {?} */
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
        /** @type {?} */
        let transition = trigger.matchTransition(fromState.value, toState.value, element, toState.params);
        /** @type {?} */
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
            /** @type {?} */
            let index = this.players.indexOf(player);
            if (index >= 0) {
                this.players.splice(index, 1);
            }
            /** @type {?} */
            const players = this._engine.playersByElement.get(element);
            if (players) {
                /** @type {?} */
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
    /**
     * @param {?} name
     * @return {?}
     */
    deregister(name) {
        delete this._triggers[name];
        this._engine.statesByElement.forEach((stateMap, element) => { delete stateMap[name]; });
        this._elementListeners.forEach((listeners, element) => {
            this._elementListeners.set(element, listeners.filter(entry => { return entry.name != name; }));
        });
    }
    /**
     * @param {?} element
     * @return {?}
     */
    clearElementCache(element) {
        this._engine.statesByElement.delete(element);
        this._elementListeners.delete(element);
        /** @type {?} */
        const elementPlayers = this._engine.playersByElement.get(element);
        if (elementPlayers) {
            elementPlayers.forEach(player => player.destroy());
            this._engine.playersByElement.delete(element);
        }
    }
    /**
     * @param {?} rootElement
     * @param {?} context
     * @param {?=} animate
     * @return {?}
     */
    _signalRemovalForInnerTriggers(rootElement, context, animate = false) {
        // emulate a leave animation for all inner nodes within this node.
        // If there are no animations found for any of the nodes then clear the cache
        // for the element.
        this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true).forEach(elm => {
            // this means that an inner remove() operation has already kicked off
            // the animation on this element...
            if (elm[REMOVAL_FLAG])
                return;
            /** @type {?} */
            const namespaces = this._engine.fetchNamespacesByElement(elm);
            if (namespaces.size) {
                namespaces.forEach(ns => ns.triggerLeaveAnimation(elm, context, false, true));
            }
            else {
                this.clearElementCache(elm);
            }
        });
    }
    /**
     * @param {?} element
     * @param {?} context
     * @param {?=} destroyAfterComplete
     * @param {?=} defaultToFallback
     * @return {?}
     */
    triggerLeaveAnimation(element, context, destroyAfterComplete, defaultToFallback) {
        /** @type {?} */
        const triggerStates = this._engine.statesByElement.get(element);
        if (triggerStates) {
            /** @type {?} */
            const players = [];
            Object.keys(triggerStates).forEach(triggerName => {
                // this check is here in the event that an element is removed
                // twice (both on the host level and the component level)
                if (this._triggers[triggerName]) {
                    /** @type {?} */
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
    /**
     * @param {?} element
     * @return {?}
     */
    prepareLeaveAnimationListeners(element) {
        /** @type {?} */
        const listeners = this._elementListeners.get(element);
        if (listeners) {
            /** @type {?} */
            const visitedTriggers = new Set();
            listeners.forEach(listener => {
                /** @type {?} */
                const triggerName = listener.name;
                if (visitedTriggers.has(triggerName))
                    return;
                visitedTriggers.add(triggerName);
                /** @type {?} */
                const trigger = this._triggers[triggerName];
                /** @type {?} */
                const transition = trigger.fallbackTransition;
                /** @type {?} */
                const elementStates = (/** @type {?} */ (this._engine.statesByElement.get(element)));
                /** @type {?} */
                const fromState = elementStates[triggerName] || DEFAULT_STATE_VALUE;
                /** @type {?} */
                const toState = new StateValue(VOID_VALUE);
                /** @type {?} */
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
    /**
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    removeNode(element, context) {
        /** @type {?} */
        const engine = this._engine;
        if (element.childElementCount) {
            this._signalRemovalForInnerTriggers(element, context, true);
        }
        // this means that a * => VOID animation was detected and kicked off
        if (this.triggerLeaveAnimation(element, context, true))
            return;
        // find the player that is animating and make sure that the
        // removal is delayed until that player has completed
        /** @type {?} */
        let containsPotentialParentTransition = false;
        if (engine.totalAnimations) {
            /** @type {?} */
            const currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
            // when this `if statement` does not continue forward it means that
            // a previous animation query has selected the current element and
            // is animating it. In this situation want to continue forwards and
            // allow the element to be queued up for animation later.
            if (currentPlayers && currentPlayers.length) {
                containsPotentialParentTransition = true;
            }
            else {
                /** @type {?} */
                let parent = element;
                while (parent = parent.parentNode) {
                    /** @type {?} */
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
    /**
     * @param {?} element
     * @param {?} parent
     * @return {?}
     */
    insertNode(element, parent) { addClass(element, this._hostClassName); }
    /**
     * @param {?} microtaskId
     * @return {?}
     */
    drainQueuedTransitions(microtaskId) {
        /** @type {?} */
        const instructions = [];
        this._queue.forEach(entry => {
            /** @type {?} */
            const player = entry.player;
            if (player.destroyed)
                return;
            /** @type {?} */
            const element = entry.element;
            /** @type {?} */
            const listeners = this._elementListeners.get(element);
            if (listeners) {
                listeners.forEach((listener) => {
                    if (listener.name == entry.triggerName) {
                        /** @type {?} */
                        const baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
                        ((/** @type {?} */ (baseEvent)))['_data'] = microtaskId;
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
            /** @type {?} */
            const d0 = a.transition.ast.depCount;
            /** @type {?} */
            const d1 = b.transition.ast.depCount;
            if (d0 == 0 || d1 == 0) {
                return d0 - d1;
            }
            return this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
        });
    }
    /**
     * @param {?} context
     * @return {?}
     */
    destroy(context) {
        this.players.forEach(p => p.destroy());
        this._signalRemovalForInnerTriggers(this.hostElement, context);
    }
    /**
     * @param {?} element
     * @return {?}
     */
    elementContainsData(element) {
        /** @type {?} */
        let containsData = false;
        if (this._elementListeners.has(element))
            containsData = true;
        containsData =
            (this._queue.find(entry => entry.element === element) ? true : false) || containsData;
        return containsData;
    }
}
if (false) {
    /** @type {?} */
    AnimationTransitionNamespace.prototype.players;
    /** @type {?} */
    AnimationTransitionNamespace.prototype._triggers;
    /** @type {?} */
    AnimationTransitionNamespace.prototype._queue;
    /** @type {?} */
    AnimationTransitionNamespace.prototype._elementListeners;
    /** @type {?} */
    AnimationTransitionNamespace.prototype._hostClassName;
    /** @type {?} */
    AnimationTransitionNamespace.prototype.id;
    /** @type {?} */
    AnimationTransitionNamespace.prototype.hostElement;
    /** @type {?} */
    AnimationTransitionNamespace.prototype._engine;
}
/**
 * @record
 */
export function QueuedTransition() { }
if (false) {
    /** @type {?} */
    QueuedTransition.prototype.element;
    /** @type {?} */
    QueuedTransition.prototype.instruction;
    /** @type {?} */
    QueuedTransition.prototype.player;
}
export class TransitionAnimationEngine {
    /**
     * @param {?} bodyNode
     * @param {?} driver
     * @param {?} _normalizer
     */
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
    /**
     * \@internal
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    _onRemovalComplete(element, context) { this.onRemovalComplete(element, context); }
    /**
     * @return {?}
     */
    get queuedPlayers() {
        /** @type {?} */
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
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @return {?}
     */
    createNamespace(namespaceId, hostElement) {
        /** @type {?} */
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
    /**
     * @param {?} ns
     * @param {?} hostElement
     * @return {?}
     */
    _balanceNamespaceList(ns, hostElement) {
        /** @type {?} */
        const limit = this._namespaceList.length - 1;
        if (limit >= 0) {
            /** @type {?} */
            let found = false;
            for (let i = limit; i >= 0; i--) {
                /** @type {?} */
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
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @return {?}
     */
    register(namespaceId, hostElement) {
        /** @type {?} */
        let ns = this._namespaceLookup[namespaceId];
        if (!ns) {
            ns = this.createNamespace(namespaceId, hostElement);
        }
        return ns;
    }
    /**
     * @param {?} namespaceId
     * @param {?} name
     * @param {?} trigger
     * @return {?}
     */
    registerTrigger(namespaceId, name, trigger) {
        /** @type {?} */
        let ns = this._namespaceLookup[namespaceId];
        if (ns && ns.register(name, trigger)) {
            this.totalAnimations++;
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} context
     * @return {?}
     */
    destroy(namespaceId, context) {
        if (!namespaceId)
            return;
        /** @type {?} */
        const ns = this._fetchNamespace(namespaceId);
        this.afterFlush(() => {
            this.namespacesByHostElement.delete(ns.hostElement);
            delete this._namespaceLookup[namespaceId];
            /** @type {?} */
            const index = this._namespaceList.indexOf(ns);
            if (index >= 0) {
                this._namespaceList.splice(index, 1);
            }
        });
        this.afterFlushAnimationsDone(() => ns.destroy(context));
    }
    /**
     * @param {?} id
     * @return {?}
     */
    _fetchNamespace(id) { return this._namespaceLookup[id]; }
    /**
     * @param {?} element
     * @return {?}
     */
    fetchNamespacesByElement(element) {
        // normally there should only be one namespace per element, however
        // if @triggers are placed on both the component element and then
        // its host element (within the component code) then there will be
        // two namespaces returned. We use a set here to simply the dedupe
        // of namespaces incase there are multiple triggers both the elm and host
        /** @type {?} */
        const namespaces = new Set();
        /** @type {?} */
        const elementStates = this.statesByElement.get(element);
        if (elementStates) {
            /** @type {?} */
            const keys = Object.keys(elementStates);
            for (let i = 0; i < keys.length; i++) {
                /** @type {?} */
                const nsId = elementStates[keys[i]].namespaceId;
                if (nsId) {
                    /** @type {?} */
                    const ns = this._fetchNamespace(nsId);
                    if (ns) {
                        namespaces.add(ns);
                    }
                }
            }
        }
        return namespaces;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    trigger(namespaceId, element, name, value) {
        if (isElementNode(element)) {
            /** @type {?} */
            const ns = this._fetchNamespace(namespaceId);
            if (ns) {
                ns.trigger(element, name, value);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    insertNode(namespaceId, element, parent, insertBefore) {
        if (!isElementNode(element))
            return;
        // special case for when an element is removed and reinserted (move operation)
        // when this occurs we do not want to use the element for deletion later
        /** @type {?} */
        const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
        if (details && details.setForRemoval) {
            details.setForRemoval = false;
            details.setForMove = true;
            /** @type {?} */
            const index = this.collectedLeaveElements.indexOf(element);
            if (index >= 0) {
                this.collectedLeaveElements.splice(index, 1);
            }
        }
        // in the event that the namespaceId is blank then the caller
        // code does not contain any animation code in it, but it is
        // just being called so that the node is marked as being inserted
        if (namespaceId) {
            /** @type {?} */
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
    /**
     * @param {?} element
     * @return {?}
     */
    collectEnterElement(element) { this.collectedEnterElements.push(element); }
    /**
     * @param {?} element
     * @param {?} value
     * @return {?}
     */
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
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    removeNode(namespaceId, element, context) {
        if (!isElementNode(element)) {
            this._onRemovalComplete(element, context);
            return;
        }
        /** @type {?} */
        const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
        if (ns) {
            ns.removeNode(element, context);
        }
        else {
            this.markElementAsRemoved(namespaceId, element, false, context);
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?=} hasAnimation
     * @param {?=} context
     * @return {?}
     */
    markElementAsRemoved(namespaceId, element, hasAnimation, context) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] = {
            namespaceId,
            setForRemoval: context, hasAnimation,
            removedBeforeQueried: false
        };
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} name
     * @param {?} phase
     * @param {?} callback
     * @return {?}
     */
    listen(namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return () => { };
    }
    /**
     * @param {?} entry
     * @param {?} subTimelines
     * @param {?} enterClassName
     * @param {?} leaveClassName
     * @param {?=} skipBuildAst
     * @return {?}
     */
    _buildInstruction(entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
    }
    /**
     * @param {?} containerElement
     * @return {?}
     */
    destroyInnerAnimations(containerElement) {
        /** @type {?} */
        let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
        elements.forEach(element => this.destroyActiveAnimationsForElement(element));
        if (this.playersByQueriedElement.size == 0)
            return;
        elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
        elements.forEach(element => this.finishActiveQueriedAnimationOnElement(element));
    }
    /**
     * @param {?} element
     * @return {?}
     */
    destroyActiveAnimationsForElement(element) {
        /** @type {?} */
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
    /**
     * @param {?} element
     * @return {?}
     */
    finishActiveQueriedAnimationOnElement(element) {
        /** @type {?} */
        const players = this.playersByQueriedElement.get(element);
        if (players) {
            players.forEach(player => player.finish());
        }
    }
    /**
     * @return {?}
     */
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
    /**
     * @param {?} element
     * @return {?}
     */
    processLeaveNode(element) {
        /** @type {?} */
        const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
        if (details && details.setForRemoval) {
            // this will prevent it from removing it twice
            element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
            if (details.namespaceId) {
                this.destroyInnerAnimations(element);
                /** @type {?} */
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
            this.markElementAsDisabled(node, false);
        });
    }
    /**
     * @param {?=} microtaskId
     * @return {?}
     */
    flush(microtaskId = -1) {
        /** @type {?} */
        let players = [];
        if (this.newHostElements.size) {
            this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
            this.newHostElements.clear();
        }
        if (this.totalAnimations && this.collectedEnterElements.length) {
            for (let i = 0; i < this.collectedEnterElements.length; i++) {
                /** @type {?} */
                const elm = this.collectedEnterElements[i];
                addClass(elm, STAR_CLASSNAME);
            }
        }
        if (this._namespaceList.length &&
            (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
            /** @type {?} */
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
                /** @type {?} */
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
            /** @type {?} */
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
    /**
     * @param {?} errors
     * @return {?}
     */
    reportError(errors) {
        throw new Error(`Unable to process animations due to the following failed trigger transitions\n ${errors.join('\n')}`);
    }
    /**
     * @param {?} cleanupFns
     * @param {?} microtaskId
     * @return {?}
     */
    _flushAnimations(cleanupFns, microtaskId) {
        /** @type {?} */
        const subTimelines = new ElementInstructionMap();
        /** @type {?} */
        const skippedPlayers = [];
        /** @type {?} */
        const skippedPlayersMap = new Map();
        /** @type {?} */
        const queuedInstructions = [];
        /** @type {?} */
        const queriedElements = new Map();
        /** @type {?} */
        const allPreStyleElements = new Map();
        /** @type {?} */
        const allPostStyleElements = new Map();
        /** @type {?} */
        const disabledElementsSet = new Set();
        this.disabledNodes.forEach(node => {
            disabledElementsSet.add(node);
            /** @type {?} */
            const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
            for (let i = 0; i < nodesThatAreDisabled.length; i++) {
                disabledElementsSet.add(nodesThatAreDisabled[i]);
            }
        });
        /** @type {?} */
        const bodyNode = this.bodyNode;
        /** @type {?} */
        const allTriggerElements = Array.from(this.statesByElement.keys());
        /** @type {?} */
        const enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
        // this must occur before the instructions are built below such that
        // the :enter queries match the elements (since the timeline queries
        // are fired during instruction building).
        /** @type {?} */
        const enterNodeMapIds = new Map();
        /** @type {?} */
        let i = 0;
        enterNodeMap.forEach((nodes, root) => {
            /** @type {?} */
            const className = ENTER_CLASSNAME + i++;
            enterNodeMapIds.set(root, className);
            nodes.forEach(node => addClass(node, className));
        });
        /** @type {?} */
        const allLeaveNodes = [];
        /** @type {?} */
        const mergedLeaveNodes = new Set();
        /** @type {?} */
        const leaveNodesWithoutAnimations = new Set();
        for (let i = 0; i < this.collectedLeaveElements.length; i++) {
            /** @type {?} */
            const element = this.collectedLeaveElements[i];
            /** @type {?} */
            const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
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
        /** @type {?} */
        const leaveNodeMapIds = new Map();
        /** @type {?} */
        const leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
        leaveNodeMap.forEach((nodes, root) => {
            /** @type {?} */
            const className = LEAVE_CLASSNAME + i++;
            leaveNodeMapIds.set(root, className);
            nodes.forEach(node => addClass(node, className));
        });
        cleanupFns.push(() => {
            enterNodeMap.forEach((nodes, root) => {
                /** @type {?} */
                const className = (/** @type {?} */ (enterNodeMapIds.get(root)));
                nodes.forEach(node => removeClass(node, className));
            });
            leaveNodeMap.forEach((nodes, root) => {
                /** @type {?} */
                const className = (/** @type {?} */ (leaveNodeMapIds.get(root)));
                nodes.forEach(node => removeClass(node, className));
            });
            allLeaveNodes.forEach(element => { this.processLeaveNode(element); });
        });
        /** @type {?} */
        const allPlayers = [];
        /** @type {?} */
        const erroneousTransitions = [];
        for (let i = this._namespaceList.length - 1; i >= 0; i--) {
            /** @type {?} */
            const ns = this._namespaceList[i];
            ns.drainQueuedTransitions(microtaskId).forEach(entry => {
                /** @type {?} */
                const player = entry.player;
                /** @type {?} */
                const element = entry.element;
                allPlayers.push(player);
                if (this.collectedEnterElements.length) {
                    /** @type {?} */
                    const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
                    // move animations are currently not supported...
                    if (details && details.setForMove) {
                        player.destroy();
                        return;
                    }
                }
                /** @type {?} */
                const nodeIsOrphaned = !bodyNode || !this.driver.containsElement(bodyNode, element);
                /** @type {?} */
                const leaveClassName = (/** @type {?} */ (leaveNodeMapIds.get(element)));
                /** @type {?} */
                const enterClassName = (/** @type {?} */ (enterNodeMapIds.get(element)));
                /** @type {?} */
                const instruction = (/** @type {?} */ (this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned)));
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // even though the element may not be apart of the DOM, it may
                // still be added at a later point (due to the mechanics of content
                // projection and/or dynamic component insertion) therefore it's
                // important we still style the element.
                if (nodeIsOrphaned) {
                    player.onStart(() => eraseStyles(element, instruction.fromStyles));
                    player.onDestroy(() => setStyles(element, instruction.toStyles));
                    skippedPlayers.push(player);
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
                /** @type {?} */
                const tuple = { instruction, player, element };
                queuedInstructions.push(tuple);
                instruction.queriedElements.forEach(element => getOrSetAsInMap(queriedElements, element, []).push(player));
                instruction.preStyleProps.forEach((stringMap, element) => {
                    /** @type {?} */
                    const props = Object.keys(stringMap);
                    if (props.length) {
                        /** @type {?} */
                        let setVal = (/** @type {?} */ (allPreStyleElements.get(element)));
                        if (!setVal) {
                            allPreStyleElements.set(element, setVal = new Set());
                        }
                        props.forEach(prop => setVal.add(prop));
                    }
                });
                instruction.postStyleProps.forEach((stringMap, element) => {
                    /** @type {?} */
                    const props = Object.keys(stringMap);
                    /** @type {?} */
                    let setVal = (/** @type {?} */ (allPostStyleElements.get(element)));
                    if (!setVal) {
                        allPostStyleElements.set(element, setVal = new Set());
                    }
                    props.forEach(prop => setVal.add(prop));
                });
            });
        }
        if (erroneousTransitions.length) {
            /** @type {?} */
            const errors = [];
            erroneousTransitions.forEach(instruction => {
                errors.push(`@${instruction.triggerName} has failed due to:\n`);
                (/** @type {?} */ (instruction.errors)).forEach(error => errors.push(`- ${error}\n`));
            });
            allPlayers.forEach(player => player.destroy());
            this.reportError(errors);
        }
        /** @type {?} */
        const allPreviousPlayersMap = new Map();
        // this map works to tell which element in the DOM tree is contained by
        // which animation. Further down below this map will get populated once
        // the players are built and in doing so it can efficiently figure out
        // if a sub player is skipped due to a parent player having priority.
        /** @type {?} */
        const animationElementMap = new Map();
        queuedInstructions.forEach(entry => {
            /** @type {?} */
            const element = entry.element;
            if (subTimelines.has(element)) {
                animationElementMap.set(element, element);
                this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
            }
        });
        skippedPlayers.forEach(player => {
            /** @type {?} */
            const element = player.element;
            /** @type {?} */
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
        /** @type {?} */
        const replaceNodes = allLeaveNodes.filter(node => {
            return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
        });
        // POST STAGE: fill the * styles
        /** @type {?} */
        const postStylesMap = new Map();
        /** @type {?} */
        const allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
        allLeaveQueriedNodes.forEach(node => {
            if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
                replaceNodes.push(node);
            }
        });
        // PRE STAGE: fill the ! styles
        /** @type {?} */
        const preStylesMap = new Map();
        enterNodeMap.forEach((nodes, root) => {
            cloakAndComputeStyles(preStylesMap, this.driver, new Set(nodes), allPreStyleElements, PRE_STYLE);
        });
        replaceNodes.forEach(node => {
            /** @type {?} */
            const post = postStylesMap.get(node);
            /** @type {?} */
            const pre = preStylesMap.get(node);
            postStylesMap.set(node, (/** @type {?} */ (Object.assign({}, post, pre))));
        });
        /** @type {?} */
        const rootPlayers = [];
        /** @type {?} */
        const subPlayers = [];
        /** @type {?} */
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
                /** @type {?} */
                let parentWithAnimation = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
                if (animationElementMap.size > 1) {
                    /** @type {?} */
                    let elm = element;
                    /** @type {?} */
                    const parentsToAdd = [];
                    while (elm = elm.parentNode) {
                        /** @type {?} */
                        const detectedParent = animationElementMap.get(elm);
                        if (detectedParent) {
                            parentWithAnimation = detectedParent;
                            break;
                        }
                        parentsToAdd.push(elm);
                    }
                    parentsToAdd.forEach(parent => animationElementMap.set(parent, parentWithAnimation));
                }
                /** @type {?} */
                const innerPlayer = this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
                player.setRealPlayer(innerPlayer);
                if (parentWithAnimation === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
                    rootPlayers.push(player);
                }
                else {
                    /** @type {?} */
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
            /** @type {?} */
            const playersForElement = skippedPlayersMap.get(player.element);
            if (playersForElement && playersForElement.length) {
                /** @type {?} */
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
            /** @type {?} */
            const element = allLeaveNodes[i];
            /** @type {?} */
            const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
            removeClass(element, LEAVE_CLASSNAME);
            // this means the element has a removal animation that is being
            // taken care of and therefore the inner elements will hang around
            // until that animation is over (or the parent queried animation)
            if (details && details.hasAnimation)
                continue;
            /** @type {?} */
            let players = [];
            // if this element is queried or if it contains queried children
            // then we want for the element not to be removed from the page
            // until the queried animations have finished
            if (queriedElements.size) {
                /** @type {?} */
                let queriedPlayerResults = queriedElements.get(element);
                if (queriedPlayerResults && queriedPlayerResults.length) {
                    players.push(...queriedPlayerResults);
                }
                /** @type {?} */
                let queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
                for (let j = 0; j < queriedInnerElements.length; j++) {
                    /** @type {?} */
                    let queriedPlayers = queriedElements.get(queriedInnerElements[j]);
                    if (queriedPlayers && queriedPlayers.length) {
                        players.push(...queriedPlayers);
                    }
                }
            }
            /** @type {?} */
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
                /** @type {?} */
                const index = this.players.indexOf(player);
                this.players.splice(index, 1);
            });
            player.play();
        });
        return rootPlayers;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @return {?}
     */
    elementContainsData(namespaceId, element) {
        /** @type {?} */
        let containsData = false;
        /** @type {?} */
        const details = (/** @type {?} */ (element[REMOVAL_FLAG]));
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
    /**
     * @param {?} callback
     * @return {?}
     */
    afterFlush(callback) { this._flushFns.push(callback); }
    /**
     * @param {?} callback
     * @return {?}
     */
    afterFlushAnimationsDone(callback) { this._whenQuietFns.push(callback); }
    /**
     * @param {?} element
     * @param {?} isQueriedElement
     * @param {?=} namespaceId
     * @param {?=} triggerName
     * @param {?=} toStateValue
     * @return {?}
     */
    _getPreviousPlayers(element, isQueriedElement, namespaceId, triggerName, toStateValue) {
        /** @type {?} */
        let players = [];
        if (isQueriedElement) {
            /** @type {?} */
            const queriedElementPlayers = this.playersByQueriedElement.get(element);
            if (queriedElementPlayers) {
                players = queriedElementPlayers;
            }
        }
        else {
            /** @type {?} */
            const elementPlayers = this.playersByElement.get(element);
            if (elementPlayers) {
                /** @type {?} */
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
    /**
     * @param {?} namespaceId
     * @param {?} instruction
     * @param {?} allPreviousPlayersMap
     * @return {?}
     */
    _beforeAnimationBuild(namespaceId, instruction, allPreviousPlayersMap) {
        /** @type {?} */
        const triggerName = instruction.triggerName;
        /** @type {?} */
        const rootElement = instruction.element;
        // when a removal animation occurs, ALL previous players are collected
        // and destroyed (even if they are outside of the current namespace)
        /** @type {?} */
        const targetNameSpaceId = instruction.isRemovalTransition ? undefined : namespaceId;
        /** @type {?} */
        const targetTriggerName = instruction.isRemovalTransition ? undefined : triggerName;
        for (const timelineInstruction of instruction.timelines) {
            /** @type {?} */
            const element = timelineInstruction.element;
            /** @type {?} */
            const isQueriedElement = element !== rootElement;
            /** @type {?} */
            const players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
            /** @type {?} */
            const previousPlayers = this._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
            previousPlayers.forEach(player => {
                /** @type {?} */
                const realPlayer = (/** @type {?} */ (player.getRealPlayer()));
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
    /**
     * @param {?} namespaceId
     * @param {?} instruction
     * @param {?} allPreviousPlayersMap
     * @param {?} skippedPlayersMap
     * @param {?} preStylesMap
     * @param {?} postStylesMap
     * @return {?}
     */
    _buildAnimation(namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
        /** @type {?} */
        const triggerName = instruction.triggerName;
        /** @type {?} */
        const rootElement = instruction.element;
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        /** @type {?} */
        const allQueriedPlayers = [];
        /** @type {?} */
        const allConsumedElements = new Set();
        /** @type {?} */
        const allSubElements = new Set();
        /** @type {?} */
        const allNewPlayers = instruction.timelines.map(timelineInstruction => {
            /** @type {?} */
            const element = timelineInstruction.element;
            allConsumedElements.add(element);
            // FIXME (matsko): make sure to-be-removed animations are removed properly
            /** @type {?} */
            const details = element[REMOVAL_FLAG];
            if (details && details.removedBeforeQueried)
                return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
            /** @type {?} */
            const isQueriedElement = element !== rootElement;
            /** @type {?} */
            const previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY)
                .map(p => p.getRealPlayer()))
                .filter(p => {
                // the `element` is not apart of the AnimationPlayer definition, but
                // Mock/WebAnimations
                // use the element within their implementation. This will be added in Angular5 to
                // AnimationPlayer
                /** @type {?} */
                const pp = (/** @type {?} */ (p));
                return pp.element ? pp.element === element : false;
            });
            /** @type {?} */
            const preStyles = preStylesMap.get(element);
            /** @type {?} */
            const postStyles = postStylesMap.get(element);
            /** @type {?} */
            const keyframes = normalizeKeyframes(this.driver, this._normalizer, element, timelineInstruction.keyframes, preStyles, postStyles);
            /** @type {?} */
            const player = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
            // this means that this particular player belongs to a sub trigger. It is
            // important that we match this player up with the corresponding (@trigger.listener)
            if (timelineInstruction.subTimeline && skippedPlayersMap) {
                allSubElements.add(element);
            }
            if (isQueriedElement) {
                /** @type {?} */
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
        /** @type {?} */
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
    /**
     * @param {?} instruction
     * @param {?} keyframes
     * @param {?} previousPlayers
     * @return {?}
     */
    _buildPlayer(instruction, keyframes, previousPlayers) {
        if (keyframes.length > 0) {
            return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
        }
        // special case for when an empty transition|definition is provided
        // ... there is no point in rendering an empty animation
        return new NoopAnimationPlayer(instruction.duration, instruction.delay);
    }
}
if (false) {
    /** @type {?} */
    TransitionAnimationEngine.prototype.players;
    /** @type {?} */
    TransitionAnimationEngine.prototype.newHostElements;
    /** @type {?} */
    TransitionAnimationEngine.prototype.playersByElement;
    /** @type {?} */
    TransitionAnimationEngine.prototype.playersByQueriedElement;
    /** @type {?} */
    TransitionAnimationEngine.prototype.statesByElement;
    /** @type {?} */
    TransitionAnimationEngine.prototype.disabledNodes;
    /** @type {?} */
    TransitionAnimationEngine.prototype.totalAnimations;
    /** @type {?} */
    TransitionAnimationEngine.prototype.totalQueuedPlayers;
    /** @type {?} */
    TransitionAnimationEngine.prototype._namespaceLookup;
    /** @type {?} */
    TransitionAnimationEngine.prototype._namespaceList;
    /** @type {?} */
    TransitionAnimationEngine.prototype._flushFns;
    /** @type {?} */
    TransitionAnimationEngine.prototype._whenQuietFns;
    /** @type {?} */
    TransitionAnimationEngine.prototype.namespacesByHostElement;
    /** @type {?} */
    TransitionAnimationEngine.prototype.collectedEnterElements;
    /** @type {?} */
    TransitionAnimationEngine.prototype.collectedLeaveElements;
    /** @type {?} */
    TransitionAnimationEngine.prototype.onRemovalComplete;
    /** @type {?} */
    TransitionAnimationEngine.prototype.bodyNode;
    /** @type {?} */
    TransitionAnimationEngine.prototype.driver;
    /** @type {?} */
    TransitionAnimationEngine.prototype._normalizer;
}
export class TransitionAnimationPlayer {
    /**
     * @param {?} namespaceId
     * @param {?} triggerName
     * @param {?} element
     */
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
    /**
     * @param {?} player
     * @return {?}
     */
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
        ((/** @type {?} */ (this))).queued = false;
    }
    /**
     * @return {?}
     */
    getRealPlayer() { return this._player; }
    /**
     * @param {?} totalTime
     * @return {?}
     */
    overrideTotalTime(totalTime) { ((/** @type {?} */ (this))).totalTime = totalTime; }
    /**
     * @param {?} player
     * @return {?}
     */
    syncPlayerEvents(player) {
        /** @type {?} */
        const p = (/** @type {?} */ (this._player));
        if (p.triggerCallback) {
            player.onStart(() => (/** @type {?} */ (p.triggerCallback))('start'));
        }
        player.onDone(() => this.finish());
        player.onDestroy(() => this.destroy());
    }
    /**
     * @param {?} name
     * @param {?} callback
     * @return {?}
     */
    _queueEvent(name, callback) {
        getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) {
        if (this.queued) {
            this._queueEvent('done', fn);
        }
        this._player.onDone(fn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) {
        if (this.queued) {
            this._queueEvent('start', fn);
        }
        this._player.onStart(fn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) {
        if (this.queued) {
            this._queueEvent('destroy', fn);
        }
        this._player.onDestroy(fn);
    }
    /**
     * @return {?}
     */
    init() { this._player.init(); }
    /**
     * @return {?}
     */
    hasStarted() { return this.queued ? false : this._player.hasStarted(); }
    /**
     * @return {?}
     */
    play() { !this.queued && this._player.play(); }
    /**
     * @return {?}
     */
    pause() { !this.queued && this._player.pause(); }
    /**
     * @return {?}
     */
    restart() { !this.queued && this._player.restart(); }
    /**
     * @return {?}
     */
    finish() { this._player.finish(); }
    /**
     * @return {?}
     */
    destroy() {
        ((/** @type {?} */ (this))).destroyed = true;
        this._player.destroy();
    }
    /**
     * @return {?}
     */
    reset() { !this.queued && this._player.reset(); }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    }
    /**
     * @return {?}
     */
    getPosition() { return this.queued ? 0 : this._player.getPosition(); }
    /**
     * \@internal
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        /** @type {?} */
        const p = (/** @type {?} */ (this._player));
        if (p.triggerCallback) {
            p.triggerCallback(phaseName);
        }
    }
}
if (false) {
    /** @type {?} */
    TransitionAnimationPlayer.prototype._player;
    /** @type {?} */
    TransitionAnimationPlayer.prototype._containsRealPlayer;
    /** @type {?} */
    TransitionAnimationPlayer.prototype._queuedCallbacks;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.destroyed;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.markedForDestroy;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.disabled;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.queued;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.totalTime;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.namespaceId;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.triggerName;
    /** @type {?} */
    TransitionAnimationPlayer.prototype.element;
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function deleteOrUnsetInMap(map, key, value) {
    /** @type {?} */
    let currentValues;
    if (map instanceof Map) {
        currentValues = map.get(key);
        if (currentValues) {
            if (currentValues.length) {
                /** @type {?} */
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
                /** @type {?} */
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
/**
 * @param {?} value
 * @return {?}
 */
function normalizeTriggerValue(value) {
    // we use `!= null` here because it's the most simple
    // way to test against a "falsy" value without mixing
    // in empty strings or a zero value. DO NOT OPTIMIZE.
    return value != null ? value : null;
}
/**
 * @param {?} node
 * @return {?}
 */
function isElementNode(node) {
    return node && node['nodeType'] === 1;
}
/**
 * @param {?} eventName
 * @return {?}
 */
function isTriggerEventValid(eventName) {
    return eventName == 'start' || eventName == 'done';
}
/**
 * @param {?} element
 * @param {?=} value
 * @return {?}
 */
function cloakElement(element, value) {
    /** @type {?} */
    const oldValue = element.style.display;
    element.style.display = value != null ? value : 'none';
    return oldValue;
}
/**
 * @param {?} valuesMap
 * @param {?} driver
 * @param {?} elements
 * @param {?} elementPropsMap
 * @param {?} defaultStyle
 * @return {?}
 */
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
    /** @type {?} */
    const cloakVals = [];
    elements.forEach(element => cloakVals.push(cloakElement(element)));
    /** @type {?} */
    const failedElements = [];
    elementPropsMap.forEach((props, element) => {
        /** @type {?} */
        const styles = {};
        props.forEach(prop => {
            /** @type {?} */
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
    /** @type {?} */
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
/**
 * @param {?} roots
 * @param {?} nodes
 * @return {?}
 */
function buildRootMap(roots, nodes) {
    /** @type {?} */
    const rootMap = new Map();
    roots.forEach(root => rootMap.set(root, []));
    if (nodes.length == 0)
        return rootMap;
    /** @type {?} */
    const NULL_NODE = 1;
    /** @type {?} */
    const nodeSet = new Set(nodes);
    /** @type {?} */
    const localRootMap = new Map();
    /**
     * @param {?} node
     * @return {?}
     */
    function getRoot(node) {
        if (!node)
            return NULL_NODE;
        /** @type {?} */
        let root = localRootMap.get(node);
        if (root)
            return root;
        /** @type {?} */
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
        /** @type {?} */
        const root = getRoot(node);
        if (root !== NULL_NODE) {
            (/** @type {?} */ (rootMap.get(root))).push(node);
        }
    });
    return rootMap;
}
/** @type {?} */
const CLASSES_CACHE_KEY = '$$classes';
/**
 * @param {?} element
 * @param {?} className
 * @return {?}
 */
function containsClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    }
    else {
        /** @type {?} */
        const classes = element[CLASSES_CACHE_KEY];
        return classes && classes[className];
    }
}
/**
 * @param {?} element
 * @param {?} className
 * @return {?}
 */
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    }
    else {
        /** @type {?} */
        let classes = element[CLASSES_CACHE_KEY];
        if (!classes) {
            classes = element[CLASSES_CACHE_KEY] = {};
        }
        classes[className] = true;
    }
}
/**
 * @param {?} element
 * @param {?} className
 * @return {?}
 */
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    }
    else {
        /** @type {?} */
        let classes = element[CLASSES_CACHE_KEY];
        if (classes) {
            delete classes[className];
        }
    }
}
/**
 * @param {?} engine
 * @param {?} element
 * @param {?} players
 * @return {?}
 */
function removeNodesAfterAnimationDone(engine, element, players) {
    optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
}
/**
 * @param {?} players
 * @return {?}
 */
function flattenGroupPlayers(players) {
    /** @type {?} */
    const finalPlayers = [];
    _flattenGroupPlayersRecur(players, finalPlayers);
    return finalPlayers;
}
/**
 * @param {?} players
 * @param {?} finalPlayers
 * @return {?}
 */
function _flattenGroupPlayersRecur(players, finalPlayers) {
    for (let i = 0; i < players.length; i++) {
        /** @type {?} */
        const player = players[i];
        if (player instanceof AnimationGroupPlayer) {
            _flattenGroupPlayersRecur(player.players, finalPlayers);
        }
        else {
            finalPlayers.push((/** @type {?} */ (player)));
        }
    }
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function objEquals(a, b) {
    /** @type {?} */
    const k1 = Object.keys(a);
    /** @type {?} */
    const k2 = Object.keys(b);
    if (k1.length != k2.length)
        return false;
    for (let i = 0; i < k1.length; i++) {
        /** @type {?} */
        const prop = k1[i];
        if (!b.hasOwnProperty(prop) || a[prop] !== b[prop])
            return false;
    }
    return true;
}
/**
 * @param {?} element
 * @param {?} allPreStyleElements
 * @param {?} allPostStyleElements
 * @return {?}
 */
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
    /** @type {?} */
    const postEntry = allPostStyleElements.get(element);
    if (!postEntry)
        return false;
    /** @type {?} */
    let preEntry = allPreStyleElements.get(element);
    if (preEntry) {
        postEntry.forEach(data => (/** @type {?} */ (preEntry)).add(data));
    }
    else {
        allPreStyleElements.set(element, postEntry);
    }
    allPostStyleElements.delete(element);
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBcUMsbUJBQW1CLEVBQUUscUJBQXFCLElBQUksb0JBQW9CLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBTTNMLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBRXJFLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQW1CLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUdyTSxPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7TUFFaEgsZ0JBQWdCLEdBQUcsbUJBQW1COztNQUN0QyxlQUFlLEdBQUcsb0JBQW9COztNQUN0QyxrQkFBa0IsR0FBRyxxQkFBcUI7O01BQzFDLGlCQUFpQixHQUFHLHNCQUFzQjs7TUFDMUMsY0FBYyxHQUFHLGtCQUFrQjs7TUFDbkMsYUFBYSxHQUFHLG1CQUFtQjs7TUFFbkMsa0JBQWtCLEdBQWdDLEVBQUU7O01BQ3BELGtCQUFrQixHQUEwQjtJQUNoRCxXQUFXLEVBQUUsRUFBRTtJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFlBQVksRUFBRSxLQUFLO0lBQ25CLG9CQUFvQixFQUFFLEtBQUs7Q0FDNUI7O01BQ0ssMEJBQTBCLEdBQTBCO0lBQ3hELFdBQVcsRUFBRSxFQUFFO0lBQ2YsVUFBVSxFQUFFLEtBQUs7SUFDakIsYUFBYSxFQUFFLEtBQUs7SUFDcEIsWUFBWSxFQUFFLEtBQUs7SUFDbkIsb0JBQW9CLEVBQUUsSUFBSTtDQUMzQjs7OztBQUVELDhCQUlDOzs7SUFIQywrQkFBYTs7SUFDYixnQ0FBYzs7SUFDZCxtQ0FBOEI7Ozs7O0FBR2hDLHNDQVFDOzs7SUFQQyxtQ0FBYTs7SUFDYix1Q0FBb0I7O0lBQ3BCLHFDQUFzQjs7SUFDdEIsbUNBQW9COztJQUNwQixzQ0FBdUM7O0lBQ3ZDLGtDQUFrQzs7SUFDbEMsZ0RBQThCOzs7QUFHaEMsTUFBTSxPQUFPLFlBQVksR0FBRyxjQUFjOzs7O0FBRTFDLDJDQU1DOzs7SUFMQyw4Q0FBdUI7O0lBQ3ZCLDJDQUFvQjs7SUFDcEIsNkNBQXNCOztJQUN0Qiw0Q0FBb0I7O0lBQ3BCLHFEQUE4Qjs7QUFHaEMsTUFBTSxPQUFPLFVBQVU7Ozs7O0lBTXJCLFlBQVksS0FBVSxFQUFTLGNBQXNCLEVBQUU7UUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7O2NBQy9DLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7O2NBQzlDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztRQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksS0FBSyxFQUFFOztrQkFDSCxPQUFPLEdBQUcsT0FBTyxDQUFDLG1CQUFBLEtBQUssRUFBTyxDQUFDO1lBQ3JDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQUEsT0FBTyxFQUFvQixDQUFDO1NBQzVDO2FBQU07WUFDTCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztTQUNuQjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7U0FDMUI7SUFDSCxDQUFDOzs7O0lBaEJELElBQUksTUFBTSxLQUEyQixPQUFPLG1CQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUF1QixDQUFDLENBQUMsQ0FBQzs7Ozs7SUFrQnpGLGFBQWEsQ0FBQyxPQUF5Qjs7Y0FDL0IsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNO1FBQ2hDLElBQUksU0FBUyxFQUFFOztrQkFDUCxTQUFTLEdBQUcsbUJBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtvQkFDM0IsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkM7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztDQUNGOzs7SUFoQ0MsMkJBQXFCOztJQUNyQiw2QkFBaUM7O0lBSVQsaUNBQStCOzs7QUE2QnpELE1BQU0sT0FBTyxVQUFVLEdBQUcsTUFBTTs7QUFDaEMsTUFBTSxPQUFPLG1CQUFtQixHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQztBQUU3RCxNQUFNLE9BQU8sNEJBQTRCOzs7Ozs7SUFVdkMsWUFDVyxFQUFVLEVBQVMsV0FBZ0IsRUFBVSxPQUFrQztRQUEvRSxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUEyQjtRQVZuRixZQUFPLEdBQWdDLEVBQUUsQ0FBQztRQUV6QyxjQUFTLEdBQThDLEVBQUUsQ0FBQztRQUMxRCxXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQUVoQyxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztRQU01RCxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDckMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0MsQ0FBQzs7Ozs7Ozs7SUFFRCxNQUFNLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsUUFBaUM7UUFDakYsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQ1osS0FBSyxvQ0FBb0MsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQ1osSUFBSSw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLEtBQUssZ0NBQzFELElBQUkscUJBQXFCLENBQUMsQ0FBQztTQUNoQzs7Y0FFSyxTQUFTLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDOztjQUNoRSxJQUFJLEdBQUcsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQztRQUNwQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztjQUVmLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3JGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3JELGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLG1CQUFtQixDQUFDO1NBQ2hEO1FBRUQsT0FBTyxHQUFHLEVBQUU7WUFDVixrRUFBa0U7WUFDbEUsa0VBQWtFO1lBQ2xFLGtFQUFrRTtZQUNsRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7O3NCQUNyQixLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ3JDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFDZCxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDNUI7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pCLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDOzs7Ozs7SUFFRCxRQUFRLENBQUMsSUFBWSxFQUFFLEdBQXFCO1FBQzFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QixRQUFRO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7Ozs7O0lBRU8sV0FBVyxDQUFDLElBQVk7O2NBQ3hCLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztRQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsSUFBSSw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQzs7Ozs7Ozs7SUFFRCxPQUFPLENBQUMsT0FBWSxFQUFFLFdBQW1CLEVBQUUsS0FBVSxFQUFFLG9CQUE2QixJQUFJOztjQUVoRixPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7O2NBQ3ZDLE1BQU0sR0FBRyxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQzs7WUFFdkUsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUNsRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDdkIsUUFBUSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDcEU7O1lBRUcsU0FBUyxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQzs7Y0FDekMsT0FBTyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDOztjQUV4QyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO1FBRUQsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBRTFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxTQUFTLEdBQUcsbUJBQW1CLENBQUM7U0FDakM7O2NBRUssU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEtBQUssVUFBVTtRQUU5Qyx3RUFBd0U7UUFDeEUsMEVBQTBFO1FBQzFFLCtFQUErRTtRQUMvRSw4RUFBOEU7UUFDOUUsNkVBQTZFO1FBQzdFLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNuRCxvRUFBb0U7WUFDcEUsOEVBQThFO1lBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7O3NCQUMxQyxNQUFNLEdBQVUsRUFBRTs7c0JBQ2xCLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7O3NCQUMzRSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO2dCQUMzRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNsQztxQkFBTTtvQkFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQzNCLFdBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ2pDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQy9CLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7WUFDRCxPQUFPO1NBQ1I7O2NBRUssZ0JBQWdCLEdBQ2xCLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDL0QsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLDZFQUE2RTtZQUM3RSwwRUFBMEU7WUFDMUUsd0VBQXdFO1lBQ3hFLHNFQUFzRTtZQUN0RSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUN2RixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDbEI7UUFDSCxDQUFDLENBQUMsQ0FBQzs7WUFFQyxVQUFVLEdBQ1YsT0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUM7O1lBQ2hGLG9CQUFvQixHQUFHLEtBQUs7UUFDaEMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLElBQUksQ0FBQyxpQkFBaUI7Z0JBQUUsT0FBTztZQUMvQixVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO1lBQ3hDLG9CQUFvQixHQUFHLElBQUksQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDWixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixFQUFDLENBQUMsQ0FBQztRQUUxRixJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDekIsUUFBUSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTs7Z0JBQ2IsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9COztrQkFFSyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQzFELElBQUksT0FBTyxFQUFFOztvQkFDUCxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDMUI7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTlCLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Ozs7O0lBRUQsVUFBVSxDQUFDLElBQVk7UUFDckIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxHQUFHLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNwRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUN0QixPQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7SUFFRCxpQkFBaUIsQ0FBQyxPQUFZO1FBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztjQUNqQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ2pFLElBQUksY0FBYyxFQUFFO1lBQ2xCLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7Ozs7Ozs7SUFFTyw4QkFBOEIsQ0FBQyxXQUFnQixFQUFFLE9BQVksRUFBRSxVQUFtQixLQUFLO1FBQzdGLGtFQUFrRTtRQUNsRSw2RUFBNkU7UUFDN0UsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzlFLHFFQUFxRTtZQUNyRSxtQ0FBbUM7WUFDbkMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDO2dCQUFFLE9BQU87O2tCQUV4QixVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUM7WUFDN0QsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO2dCQUNuQixVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDL0U7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7Ozs7OztJQUVELHFCQUFxQixDQUNqQixPQUFZLEVBQUUsT0FBWSxFQUFFLG9CQUE4QixFQUMxRCxpQkFBMkI7O2NBQ3ZCLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQy9ELElBQUksYUFBYSxFQUFFOztrQkFDWCxPQUFPLEdBQWdDLEVBQUU7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQy9DLDZEQUE2RDtnQkFDN0QseURBQXlEO2dCQUN6RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7OzBCQUN6QixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQztvQkFDaEYsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdEI7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ25FLElBQUksb0JBQW9CLEVBQUU7b0JBQ3hCLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ25GO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7Ozs7SUFFRCw4QkFBOEIsQ0FBQyxPQUFZOztjQUNuQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDckQsSUFBSSxTQUFTLEVBQUU7O2tCQUNQLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVTtZQUN6QyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFOztzQkFDckIsV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJO2dCQUNqQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO29CQUFFLE9BQU87Z0JBQzdDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7O3NCQUUzQixPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7O3NCQUNyQyxVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQjs7c0JBQ3ZDLGFBQWEsR0FBRyxtQkFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7O3NCQUMzRCxTQUFTLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLG1CQUFtQjs7c0JBQzdELE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUM7O3NCQUNwQyxNQUFNLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7Z0JBRTNFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ2YsT0FBTztvQkFDUCxXQUFXO29CQUNYLFVBQVU7b0JBQ1YsU0FBUztvQkFDVCxPQUFPO29CQUNQLE1BQU07b0JBQ04sb0JBQW9CLEVBQUUsSUFBSTtpQkFDM0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Ozs7OztJQUVELFVBQVUsQ0FBQyxPQUFZLEVBQUUsT0FBWTs7Y0FDN0IsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPO1FBRTNCLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1lBQzdCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdEO1FBRUQsb0VBQW9FO1FBQ3BFLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDO1lBQUUsT0FBTzs7OztZQUkzRCxpQ0FBaUMsR0FBRyxLQUFLO1FBQzdDLElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRTs7a0JBQ3BCLGNBQWMsR0FDaEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFFNUUsbUVBQW1FO1lBQ25FLGtFQUFrRTtZQUNsRSxtRUFBbUU7WUFDbkUseURBQXlEO1lBQ3pELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzNDLGlDQUFpQyxHQUFHLElBQUksQ0FBQzthQUMxQztpQkFBTTs7b0JBQ0QsTUFBTSxHQUFHLE9BQU87Z0JBQ3BCLE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUU7OzBCQUMzQixRQUFRLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO29CQUNuRCxJQUFJLFFBQVEsRUFBRTt3QkFDWixpQ0FBaUMsR0FBRyxJQUFJLENBQUM7d0JBQ3pDLE1BQU07cUJBQ1A7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsaUVBQWlFO1FBQ2pFLGtFQUFrRTtRQUNsRSxrRUFBa0U7UUFDbEUsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU3QyxzRkFBc0Y7UUFDdEYsdUZBQXVGO1FBQ3ZGLElBQUksaUNBQWlDLEVBQUU7WUFDckMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMvRDthQUFNO1lBQ0wsK0NBQStDO1lBQy9DLGtDQUFrQztZQUNsQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzdDO0lBQ0gsQ0FBQzs7Ozs7O0lBRUQsVUFBVSxDQUFDLE9BQVksRUFBRSxNQUFXLElBQVUsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RixzQkFBc0IsQ0FBQyxXQUFtQjs7Y0FDbEMsWUFBWSxHQUF1QixFQUFFO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFOztrQkFDcEIsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNO1lBQzNCLElBQUksTUFBTSxDQUFDLFNBQVM7Z0JBQUUsT0FBTzs7a0JBRXZCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTzs7a0JBQ3ZCLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNyRCxJQUFJLFNBQVMsRUFBRTtnQkFDYixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBeUIsRUFBRSxFQUFFO29CQUM5QyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTs7OEJBQ2hDLFNBQVMsR0FBRyxrQkFBa0IsQ0FDaEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7d0JBQzNFLENBQUMsbUJBQUEsU0FBUyxFQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxXQUFXLENBQUM7d0JBQzFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDNUU7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLHlFQUF5RTtvQkFDekUsMkJBQTJCO29CQUMzQixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFakIsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOzs7O2tCQUcxQixFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUTs7a0JBQzlCLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRO1lBQ3BDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN0QixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7YUFDaEI7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7O0lBRUQsT0FBTyxDQUFDLE9BQVk7UUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRSxDQUFDOzs7OztJQUVELG1CQUFtQixDQUFDLE9BQVk7O1lBQzFCLFlBQVksR0FBRyxLQUFLO1FBQ3hCLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQzdELFlBQVk7WUFDUixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUM7UUFDMUYsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztDQUNGOzs7SUF0WUMsK0NBQWlEOztJQUVqRCxpREFBa0U7O0lBQ2xFLDhDQUF3Qzs7SUFFeEMseURBQThEOztJQUU5RCxzREFBK0I7O0lBRzNCLDBDQUFpQjs7SUFBRSxtREFBdUI7O0lBQUUsK0NBQTBDOzs7OztBQThYNUYsc0NBSUM7OztJQUhDLG1DQUFhOztJQUNiLHVDQUE0Qzs7SUFDNUMsa0NBQWtDOztBQUdwQyxNQUFNLE9BQU8seUJBQXlCOzs7Ozs7SUEwQnBDLFlBQ1csUUFBYSxFQUFTLE1BQXVCLEVBQzVDLFdBQXFDO1FBRHRDLGFBQVEsR0FBUixRQUFRLENBQUs7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFpQjtRQUM1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBMEI7UUEzQjFDLFlBQU8sR0FBZ0MsRUFBRSxDQUFDO1FBQzFDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7UUFDL0QscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFDL0QsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFDdEUsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBNEMsQ0FBQztRQUN0RSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFPLENBQUM7UUFFL0Isb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFDcEIsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLHFCQUFnQixHQUFpRCxFQUFFLENBQUM7UUFDcEUsbUJBQWMsR0FBbUMsRUFBRSxDQUFDO1FBQ3BELGNBQVMsR0FBa0IsRUFBRSxDQUFDO1FBQzlCLGtCQUFhLEdBQWtCLEVBQUUsQ0FBQztRQUVuQyw0QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztRQUN2RSwyQkFBc0IsR0FBVSxFQUFFLENBQUM7UUFDbkMsMkJBQXNCLEdBQVUsRUFBRSxDQUFDOztRQUduQyxzQkFBaUIsR0FBRyxDQUFDLE9BQVksRUFBRSxPQUFZLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQztJQU9WLENBQUM7Ozs7Ozs7SUFKckQsa0JBQWtCLENBQUMsT0FBWSxFQUFFLE9BQVksSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQU01RixJQUFJLGFBQWE7O2NBQ1QsT0FBTyxHQUFnQyxFQUFFO1FBQy9DLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMxQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7b0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3RCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Ozs7OztJQUVELGVBQWUsQ0FBQyxXQUFtQixFQUFFLFdBQWdCOztjQUM3QyxFQUFFLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQztRQUMzRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUU7WUFDMUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM3QzthQUFNO1lBQ0wsZ0VBQWdFO1lBQ2hFLDZEQUE2RDtZQUM3RCxxQkFBcUI7WUFDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTFDLGtFQUFrRTtZQUNsRSwrREFBK0Q7WUFDL0Qsa0VBQWtFO1lBQ2xFLG9FQUFvRTtZQUNwRSxxRUFBcUU7WUFDckUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2pELENBQUM7Ozs7OztJQUVPLHFCQUFxQixDQUFDLEVBQWdDLEVBQUUsV0FBZ0I7O2NBQ3hFLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQzVDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTs7Z0JBQ1YsS0FBSyxHQUFHLEtBQUs7WUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTs7c0JBQ3pCLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFO29CQUN2RSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDYixNQUFNO2lCQUNQO2FBQ0Y7WUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDdEM7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Ozs7OztJQUVELFFBQVEsQ0FBQyxXQUFtQixFQUFFLFdBQWdCOztZQUN4QyxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1AsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDOzs7Ozs7O0lBRUQsZUFBZSxDQUFDLFdBQW1CLEVBQUUsSUFBWSxFQUFFLE9BQXlCOztZQUN0RSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDeEI7SUFDSCxDQUFDOzs7Ozs7SUFFRCxPQUFPLENBQUMsV0FBbUIsRUFBRSxPQUFZO1FBQ3ZDLElBQUksQ0FBQyxXQUFXO1lBQUUsT0FBTzs7Y0FFbkIsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDO1FBRTVDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ25CLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDOztrQkFDcEMsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7Ozs7O0lBRU8sZUFBZSxDQUFDLEVBQVUsSUFBSSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXpFLHdCQUF3QixDQUFDLE9BQVk7Ozs7Ozs7Y0FNN0IsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFnQzs7Y0FDcEQsYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUN2RCxJQUFJLGFBQWEsRUFBRTs7a0JBQ1gsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztzQkFDOUIsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXO2dCQUMvQyxJQUFJLElBQUksRUFBRTs7MEJBQ0YsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO29CQUNyQyxJQUFJLEVBQUUsRUFBRTt3QkFDTixVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRjthQUNGO1NBQ0Y7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDOzs7Ozs7OztJQUVELE9BQU8sQ0FBQyxXQUFtQixFQUFFLE9BQVksRUFBRSxJQUFZLEVBQUUsS0FBVTtRQUNqRSxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTs7a0JBQ3BCLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUM1QyxJQUFJLEVBQUUsRUFBRTtnQkFDTixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7Ozs7Ozs7SUFFRCxVQUFVLENBQUMsV0FBbUIsRUFBRSxPQUFZLEVBQUUsTUFBVyxFQUFFLFlBQXFCO1FBQzlFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQUUsT0FBTzs7OztjQUk5QixPQUFPLEdBQUcsbUJBQUEsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUF5QjtRQUM5RCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOztrQkFDcEIsS0FBSyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQzFELElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtnQkFDZCxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM5QztTQUNGO1FBRUQsNkRBQTZEO1FBQzdELDREQUE0RDtRQUM1RCxpRUFBaUU7UUFDakUsSUFBSSxXQUFXLEVBQUU7O2tCQUNULEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUM1Qyw2REFBNkQ7WUFDN0QsaUVBQWlFO1lBQ2pFLG1FQUFtRTtZQUNuRSxtRUFBbUU7WUFDbkUsbUVBQW1FO1lBQ25FLHlDQUF5QztZQUN6QyxJQUFJLEVBQUUsRUFBRTtnQkFDTixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNoQztTQUNGO1FBRUQseURBQXlEO1FBQ3pELElBQUksWUFBWSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7Ozs7O0lBRUQsbUJBQW1CLENBQUMsT0FBWSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7SUFFaEYscUJBQXFCLENBQUMsT0FBWSxFQUFFLEtBQWM7UUFDaEQsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoQyxRQUFRLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7YUFDdkM7U0FDRjthQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQzs7Ozs7OztJQUVELFVBQVUsQ0FBQyxXQUFtQixFQUFFLE9BQVksRUFBRSxPQUFZO1FBQ3hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxQyxPQUFPO1NBQ1I7O2NBRUssRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNqRSxJQUFJLEVBQUUsRUFBRTtZQUNOLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDTCxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDakU7SUFDSCxDQUFDOzs7Ozs7OztJQUVELG9CQUFvQixDQUFDLFdBQW1CLEVBQUUsT0FBWSxFQUFFLFlBQXNCLEVBQUUsT0FBYTtRQUMzRixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRztZQUN0QixXQUFXO1lBQ1gsYUFBYSxFQUFFLE9BQU8sRUFBRSxZQUFZO1lBQ3BDLG9CQUFvQixFQUFFLEtBQUs7U0FDNUIsQ0FBQztJQUNKLENBQUM7Ozs7Ozs7OztJQUVELE1BQU0sQ0FDRixXQUFtQixFQUFFLE9BQVksRUFBRSxJQUFZLEVBQUUsS0FBYSxFQUM5RCxRQUFpQztRQUNuQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsT0FBTyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUFDbEIsQ0FBQzs7Ozs7Ozs7O0lBRU8saUJBQWlCLENBQ3JCLEtBQXVCLEVBQUUsWUFBbUMsRUFBRSxjQUFzQixFQUNwRixjQUFzQixFQUFFLFlBQXNCO1FBQ2hELE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQ3RGLGNBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbEcsQ0FBQzs7Ozs7SUFFRCxzQkFBc0IsQ0FBQyxnQkFBcUI7O1lBQ3RDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUM7UUFDN0UsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRTdFLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksSUFBSSxDQUFDO1lBQUUsT0FBTztRQUVuRCxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Ozs7O0lBRUQsaUNBQWlDLENBQUMsT0FBWTs7Y0FDdEMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ2xELElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkIsK0VBQStFO2dCQUMvRSw0RUFBNEU7Z0JBQzVFLG9FQUFvRTtnQkFDcEUsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO29CQUNqQixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2lCQUNoQztxQkFBTTtvQkFDTCxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ2xCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Ozs7O0lBRUQscUNBQXFDLENBQUMsT0FBWTs7Y0FDMUMsT0FBTyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ3pELElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQzs7OztJQUVELGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsT0FBTyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDbEU7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFZOztjQUNyQixPQUFPLEdBQUcsbUJBQUEsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUF5QjtRQUM5RCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3BDLDhDQUE4QztZQUM5QyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsa0JBQWtCLENBQUM7WUFDM0MsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUN2QixJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7O3NCQUMvQixFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO2dCQUNwRCxJQUFJLEVBQUUsRUFBRTtvQkFDTixFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQy9CO2FBQ0Y7WUFDRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUN6RDtRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLEVBQUU7WUFDMUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7O0lBRUQsS0FBSyxDQUFDLGNBQXNCLENBQUMsQ0FBQzs7WUFDeEIsT0FBTyxHQUFzQixFQUFFO1FBQ25DLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM5QjtRQUVELElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFO1lBQzlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztzQkFDckQsR0FBRyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDL0I7U0FDRjtRQUVELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNO1lBQzFCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsRUFBRTs7a0JBQzdELFVBQVUsR0FBZSxFQUFFO1lBQ2pDLElBQUk7Z0JBQ0YsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDMUQ7b0JBQVM7Z0JBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2lCQUNqQjthQUNGO1NBQ0Y7YUFBTTtZQUNMLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztzQkFDckQsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNoQztTQUNGO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFcEIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTs7Ozs7a0JBSXZCLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYTtZQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUV4QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xCLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlFO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzlCO1NBQ0Y7SUFDSCxDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxNQUFnQjtRQUMxQixNQUFNLElBQUksS0FBSyxDQUNYLGtGQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Ozs7OztJQUVPLGdCQUFnQixDQUFDLFVBQXNCLEVBQUUsV0FBbUI7O2NBRTVELFlBQVksR0FBRyxJQUFJLHFCQUFxQixFQUFFOztjQUMxQyxjQUFjLEdBQWdDLEVBQUU7O2NBQ2hELGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUEwQjs7Y0FDckQsa0JBQWtCLEdBQXVCLEVBQUU7O2NBQzNDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBb0M7O2NBQzdELG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFvQjs7Y0FDakQsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQW9COztjQUVsRCxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBTztRQUMxQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7O2tCQUN4QixvQkFBb0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQztZQUMzRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsRDtRQUNILENBQUMsQ0FBQyxDQUFDOztjQUVHLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUTs7Y0FDeEIsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDOztjQUM1RCxZQUFZLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQzs7Ozs7Y0FLNUUsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFlOztZQUMxQyxDQUFDLEdBQUcsQ0FBQztRQUNULFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7O2tCQUM3QixTQUFTLEdBQUcsZUFBZSxHQUFHLENBQUMsRUFBRTtZQUN2QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDOztjQUVHLGFBQWEsR0FBVSxFQUFFOztjQUN6QixnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBTzs7Y0FDakMsMkJBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQU87UUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2tCQUNyRCxPQUFPLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQzs7a0JBQ3hDLE9BQU8sR0FBRyxtQkFBQSxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQXlCO1lBQzlELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUU7Z0JBQ3BDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVCLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxPQUFPLENBQUMsWUFBWSxFQUFFO29CQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUMzRjtxQkFBTTtvQkFDTCwyQkFBMkIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzFDO2FBQ0Y7U0FDRjs7Y0FFSyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWU7O2NBQ3hDLFlBQVksR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25GLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7O2tCQUM3QixTQUFTLEdBQUcsZUFBZSxHQUFHLENBQUMsRUFBRTtZQUN2QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDbkIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTs7c0JBQzdCLFNBQVMsR0FBRyxtQkFBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTs7c0JBQzdCLFNBQVMsR0FBRyxtQkFBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1lBRUgsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUMsQ0FBQyxDQUFDOztjQUVHLFVBQVUsR0FBZ0MsRUFBRTs7Y0FDNUMsb0JBQW9CLEdBQXFDLEVBQUU7UUFDakUsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTs7a0JBQ2xELEVBQUUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNqQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFOztzQkFDL0MsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNOztzQkFDckIsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPO2dCQUM3QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUV4QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7OzBCQUNoQyxPQUFPLEdBQUcsbUJBQUEsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUF5QjtvQkFDOUQsaURBQWlEO29CQUNqRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO3dCQUNqQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ2pCLE9BQU87cUJBQ1I7aUJBQ0Y7O3NCQUVLLGNBQWMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7O3NCQUM3RSxjQUFjLEdBQUcsbUJBQUEsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTs7c0JBQy9DLGNBQWMsR0FBRyxtQkFBQSxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztzQkFDL0MsV0FBVyxHQUFHLG1CQUFBLElBQUksQ0FBQyxpQkFBaUIsQ0FDdEMsS0FBSyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxFQUFFO2dCQUMxRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7b0JBQ25ELG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDdkMsT0FBTztpQkFDUjtnQkFFRCw4REFBOEQ7Z0JBQzlELG1FQUFtRTtnQkFDbkUsZ0VBQWdFO2dCQUNoRSx3Q0FBd0M7Z0JBQ3hDLElBQUksY0FBYyxFQUFFO29CQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDakUsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUIsT0FBTztpQkFDUjtnQkFFRCxzRUFBc0U7Z0JBQ3RFLDZEQUE2RDtnQkFDN0QsSUFBSSxLQUFLLENBQUMsb0JBQW9CLEVBQUU7b0JBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDbkUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixPQUFPO2lCQUNSO2dCQUVELDZFQUE2RTtnQkFDN0UsNEVBQTRFO2dCQUM1RSw0RUFBNEU7Z0JBQzVFLGdGQUFnRjtnQkFDaEYseUNBQXlDO2dCQUN6QyxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFFdkUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztzQkFFOUMsS0FBSyxHQUFHLEVBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUM7Z0JBRTVDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFL0IsV0FBVyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQy9CLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBRTNFLFdBQVcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFOzswQkFDakQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNwQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7OzRCQUNaLE1BQU0sR0FBZ0IsbUJBQUEsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM1RCxJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUNYLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQzt5QkFDOUQ7d0JBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDekM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7OzBCQUNsRCxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7O3dCQUNoQyxNQUFNLEdBQWdCLG1CQUFBLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDN0QsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDWCxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDLENBQUM7cUJBQy9EO29CQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFOztrQkFDekIsTUFBTSxHQUFhLEVBQUU7WUFDM0Isb0JBQW9CLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLFdBQVcsdUJBQXVCLENBQUMsQ0FBQztnQkFDaEUsbUJBQUEsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQyxDQUFDLENBQUM7WUFFSCxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQjs7Y0FFSyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBb0M7Ozs7OztjQUtuRSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBWTtRQUMvQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7O2tCQUMzQixPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU87WUFDN0IsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM3QixtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMscUJBQXFCLENBQ3RCLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUMsQ0FBQzthQUN6RTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTs7a0JBQ3hCLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTzs7a0JBQ3hCLGVBQWUsR0FDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztZQUMxRixlQUFlLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNuQyxlQUFlLENBQUMscUJBQXFCLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckUsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7OztjQVNHLFlBQVksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9DLE9BQU8sc0JBQXNCLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDakYsQ0FBQyxDQUFDOzs7Y0FHSSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW1COztjQUMxQyxvQkFBb0IsR0FBRyxxQkFBcUIsQ0FDOUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsMkJBQTJCLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxDQUFDO1FBRTlGLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNsQyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFO2dCQUMzRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7OztjQUdHLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBbUI7UUFDL0MsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNuQyxxQkFBcUIsQ0FDakIsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakYsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOztrQkFDcEIsSUFBSSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOztrQkFDOUIsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ2xDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLHFDQUFLLElBQUksRUFBSyxHQUFHLEdBQVMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDOztjQUVHLFdBQVcsR0FBZ0MsRUFBRTs7Y0FDN0MsVUFBVSxHQUFnQyxFQUFFOztjQUM1QyxvQ0FBb0MsR0FBRyxFQUFFO1FBQy9DLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtrQkFDM0IsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxHQUFHLEtBQUs7WUFDNUMsb0VBQW9FO1lBQ3BFLHlFQUF5RTtZQUN6RSxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUN2QixNQUFNLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNoRCxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixPQUFPO2lCQUNSOzs7Ozs7OztvQkFRRyxtQkFBbUIsR0FBUSxvQ0FBb0M7Z0JBQ25FLElBQUksbUJBQW1CLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTs7d0JBQzVCLEdBQUcsR0FBRyxPQUFPOzswQkFDWCxZQUFZLEdBQVUsRUFBRTtvQkFDOUIsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRTs7OEJBQ3JCLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO3dCQUNuRCxJQUFJLGNBQWMsRUFBRTs0QkFDbEIsbUJBQW1CLEdBQUcsY0FBYyxDQUFDOzRCQUNyQyxNQUFNO3lCQUNQO3dCQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3hCO29CQUNELFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztpQkFDdEY7O3NCQUVLLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUNwQyxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQ3ZGLGFBQWEsQ0FBQztnQkFFbEIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxtQkFBbUIsS0FBSyxvQ0FBb0MsRUFBRTtvQkFDaEUsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDMUI7cUJBQU07OzBCQUNDLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO29CQUNwRSxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO3dCQUN6QyxNQUFNLENBQUMsWUFBWSxHQUFHLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUMxRDtvQkFDRCxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM3QjthQUNGO2lCQUFNO2dCQUNMLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLHdEQUF3RDtnQkFDeEQseURBQXlEO2dCQUN6RCx3Q0FBd0M7Z0JBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM3QjthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxvRUFBb0U7UUFDcEUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTs7OztrQkFHcEIsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDL0QsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7O3NCQUMzQyxXQUFXLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLENBQUM7Z0JBQzFELE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDbkM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILHlEQUF5RDtRQUN6RCw0REFBNEQ7UUFDNUQsaURBQWlEO1FBQ2pELGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO2dCQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNsQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgseURBQXlEO1FBQ3pELDZEQUE2RDtRQUM3RCw2REFBNkQ7UUFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2tCQUN2QyxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQzs7a0JBQzFCLE9BQU8sR0FBRyxtQkFBQSxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQXlCO1lBQzlELFdBQVcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFdEMsK0RBQStEO1lBQy9ELGtFQUFrRTtZQUNsRSxpRUFBaUU7WUFDakUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVk7Z0JBQUUsU0FBUzs7Z0JBRTFDLE9BQU8sR0FBZ0MsRUFBRTtZQUU3QyxnRUFBZ0U7WUFDaEUsK0RBQStEO1lBQy9ELDZDQUE2QztZQUM3QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7O29CQUNwQixvQkFBb0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQkFDdkQsSUFBSSxvQkFBb0IsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUU7b0JBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUN2Qzs7b0JBRUcsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQztnQkFDbEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7d0JBQ2hELGNBQWMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7cUJBQ2pDO2lCQUNGO2FBQ0Y7O2tCQUVLLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3ZELElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsNkJBQTZCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUM3RDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDaEM7U0FDRjtRQUVELDZEQUE2RDtRQUM3RCxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUV6QixXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO2dCQUNqQixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O3NCQUVYLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7Ozs7OztJQUVELG1CQUFtQixDQUFDLFdBQW1CLEVBQUUsT0FBWTs7WUFDL0MsWUFBWSxHQUFHLEtBQUs7O2NBQ2xCLE9BQU8sR0FBRyxtQkFBQSxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQXlCO1FBQzlELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxhQUFhO1lBQUUsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQUUsWUFBWSxHQUFHLElBQUksQ0FBQztRQUM1RCxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQUUsWUFBWSxHQUFHLElBQUksQ0FBQztRQUNuRSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUFFLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLFlBQVksQ0FBQztJQUN4RixDQUFDOzs7OztJQUVELFVBQVUsQ0FBQyxRQUFtQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFbEUsd0JBQXdCLENBQUMsUUFBbUIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7OztJQUU1RSxtQkFBbUIsQ0FDdkIsT0FBZSxFQUFFLGdCQUF5QixFQUFFLFdBQW9CLEVBQUUsV0FBb0IsRUFDdEYsWUFBa0I7O1lBQ2hCLE9BQU8sR0FBZ0MsRUFBRTtRQUM3QyxJQUFJLGdCQUFnQixFQUFFOztrQkFDZCxxQkFBcUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN2RSxJQUFJLHFCQUFxQixFQUFFO2dCQUN6QixPQUFPLEdBQUcscUJBQXFCLENBQUM7YUFDakM7U0FDRjthQUFNOztrQkFDQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDekQsSUFBSSxjQUFjLEVBQUU7O3NCQUNaLGtCQUFrQixHQUFHLENBQUMsWUFBWSxJQUFJLFlBQVksSUFBSSxVQUFVO2dCQUN0RSxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5QixJQUFJLE1BQU0sQ0FBQyxNQUFNO3dCQUFFLE9BQU87b0JBQzFCLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLFdBQVc7d0JBQUUsT0FBTztvQkFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLENBQUM7YUFDSjtTQUNGO1FBQ0QsSUFBSSxXQUFXLElBQUksV0FBVyxFQUFFO1lBQzlCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLFdBQVcsSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLFdBQVc7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQ25FLElBQUksV0FBVyxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsV0FBVztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDbkUsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQzs7Ozs7OztJQUVPLHFCQUFxQixDQUN6QixXQUFtQixFQUFFLFdBQTJDLEVBQ2hFLHFCQUE0RDs7Y0FDeEQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXOztjQUNyQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU87Ozs7Y0FJakMsaUJBQWlCLEdBQ25CLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXOztjQUN2RCxpQkFBaUIsR0FDbkIsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVc7UUFFN0QsS0FBSyxNQUFNLG1CQUFtQixJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUU7O2tCQUNqRCxPQUFPLEdBQUcsbUJBQW1CLENBQUMsT0FBTzs7a0JBQ3JDLGdCQUFnQixHQUFHLE9BQU8sS0FBSyxXQUFXOztrQkFDMUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDOztrQkFDN0QsZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FDNUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUM7WUFDekYsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTs7c0JBQ3pCLFVBQVUsR0FBRyxtQkFBQSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQU87Z0JBQ2hELElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRTtvQkFDNUIsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO2lCQUM1QjtnQkFDRCxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELDJEQUEyRDtRQUMzRCxvRUFBb0U7UUFDcEUsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkQsQ0FBQzs7Ozs7Ozs7OztJQUVPLGVBQWUsQ0FDbkIsV0FBbUIsRUFBRSxXQUEyQyxFQUNoRSxxQkFBNEQsRUFDNUQsaUJBQThDLEVBQUUsWUFBa0MsRUFDbEYsYUFBbUM7O2NBQy9CLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVzs7Y0FDckMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPOzs7O2NBSWpDLGlCQUFpQixHQUFnQyxFQUFFOztjQUNuRCxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBTzs7Y0FDcEMsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFPOztjQUMvQixhQUFhLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRTs7a0JBQzlELE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPO1lBQzNDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O2tCQUczQixPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUNyQyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsb0JBQW9CO2dCQUN6QyxPQUFPLElBQUksbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDOztrQkFFcEYsZ0JBQWdCLEdBQUcsT0FBTyxLQUFLLFdBQVc7O2tCQUMxQyxlQUFlLEdBQ2pCLG1CQUFtQixDQUFDLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGtCQUFrQixDQUFDO2lCQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztpQkFDaEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7c0JBS0osRUFBRSxHQUFHLG1CQUFBLENBQUMsRUFBTztnQkFDbkIsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3JELENBQUMsQ0FBQzs7a0JBRUosU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDOztrQkFDckMsVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDOztrQkFDdkMsU0FBUyxHQUFHLGtCQUFrQixDQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQ2hGLFVBQVUsQ0FBQzs7a0JBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLGVBQWUsQ0FBQztZQUVqRix5RUFBeUU7WUFDekUsb0ZBQW9GO1lBQ3BGLElBQUksbUJBQW1CLENBQUMsV0FBVyxJQUFJLGlCQUFpQixFQUFFO2dCQUN4RCxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdCO1lBRUQsSUFBSSxnQkFBZ0IsRUFBRTs7c0JBQ2QsYUFBYSxHQUFHLElBQUkseUJBQXlCLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7Z0JBQ3RGLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN2QztZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqQyxlQUFlLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRyxDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDOztjQUM1RSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsYUFBYSxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ3BCLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLFNBQVMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLHlEQUF5RDtRQUN6RCxjQUFjLENBQUMsT0FBTyxDQUNsQixPQUFPLENBQUMsRUFBRSxHQUFHLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEYsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7Ozs7OztJQUVPLFlBQVksQ0FDaEIsV0FBeUMsRUFBRSxTQUF1QixFQUNsRSxlQUFrQztRQUNwQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ3RCLFdBQVcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFDdkUsV0FBVyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELG1FQUFtRTtRQUNuRSx3REFBd0Q7UUFDeEQsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUM7Q0FDRjs7O0lBLzRCQyw0Q0FBaUQ7O0lBQ2pELG9EQUFzRTs7SUFDdEUscURBQXNFOztJQUN0RSw0REFBNkU7O0lBQzdFLG9EQUE2RTs7SUFDN0Usa0RBQXNDOztJQUV0QyxvREFBMkI7O0lBQzNCLHVEQUE4Qjs7SUFFOUIscURBQTRFOztJQUM1RSxtREFBNEQ7O0lBQzVELDhDQUFzQzs7SUFDdEMsa0RBQTBDOztJQUUxQyw0REFBOEU7O0lBQzlFLDJEQUEwQzs7SUFDMUMsMkRBQTBDOztJQUcxQyxzREFBOEQ7O0lBTTFELDZDQUFvQjs7SUFBRSwyQ0FBOEI7O0lBQ3BELGdEQUE2Qzs7QUFzM0JuRCxNQUFNLE9BQU8seUJBQXlCOzs7Ozs7SUFlcEMsWUFBbUIsV0FBbUIsRUFBUyxXQUFtQixFQUFTLE9BQVk7UUFBcEUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFkL0UsWUFBTyxHQUFvQixJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDckQsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1FBRTVCLHFCQUFnQixHQUFvQyxFQUFFLENBQUM7UUFDL0MsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUkzQixxQkFBZ0IsR0FBWSxLQUFLLENBQUM7UUFDbEMsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUVmLFdBQU0sR0FBWSxJQUFJLENBQUM7UUFDaEIsY0FBUyxHQUFXLENBQUMsQ0FBQztJQUVvRCxDQUFDOzs7OztJQUUzRixhQUFhLENBQUMsTUFBdUI7UUFDbkMsSUFBSSxJQUFJLENBQUMsbUJBQW1CO1lBQUUsT0FBTztRQUVyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUNoQyxRQUFRLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsQ0FBQyxtQkFBQSxJQUFJLEVBQW9CLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzVDLENBQUM7Ozs7SUFFRCxhQUFhLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFeEMsaUJBQWlCLENBQUMsU0FBaUIsSUFBSSxDQUFDLG1CQUFBLElBQUksRUFBTyxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTdFLGdCQUFnQixDQUFDLE1BQXVCOztjQUNoQyxDQUFDLEdBQUcsbUJBQUEsSUFBSSxDQUFDLE9BQU8sRUFBTztRQUM3QixJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7WUFDckIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxtQkFBQSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNwRDtRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDOzs7Ozs7SUFFTyxXQUFXLENBQUMsSUFBWSxFQUFFLFFBQTZCO1FBQzdELGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRSxDQUFDOzs7OztJQUVELE1BQU0sQ0FBQyxFQUFjO1FBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQzs7Ozs7SUFFRCxPQUFPLENBQUMsRUFBYztRQUNwQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7Ozs7O0lBRUQsU0FBUyxDQUFDLEVBQWM7UUFDdEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDOzs7O0lBRUQsSUFBSSxLQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXJDLFVBQVUsS0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFakYsSUFBSSxLQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQzs7OztJQUVyRCxLQUFLLEtBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXZELE9BQU8sS0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFM0QsTUFBTSxLQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXpDLE9BQU87UUFDTCxDQUFDLG1CQUFBLElBQUksRUFBdUIsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QixDQUFDOzs7O0lBRUQsS0FBSyxLQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFdkQsV0FBVyxDQUFDLENBQU07UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7SUFDSCxDQUFDOzs7O0lBRUQsV0FBVyxLQUFhLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBRzlFLGVBQWUsQ0FBQyxTQUFpQjs7Y0FDekIsQ0FBQyxHQUFHLG1CQUFBLElBQUksQ0FBQyxPQUFPLEVBQU87UUFDN0IsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO1lBQ3JCLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDOUI7SUFDSCxDQUFDO0NBQ0Y7OztJQXRHQyw0Q0FBNkQ7O0lBQzdELHdEQUFvQzs7SUFFcEMscURBQStEOztJQUMvRCw4Q0FBa0M7O0lBRWxDLGlEQUF1Qzs7SUFFdkMscURBQXlDOztJQUN6Qyw2Q0FBd0I7O0lBRXhCLDJDQUFnQzs7SUFDaEMsOENBQXNDOztJQUUxQixnREFBMEI7O0lBQUUsZ0RBQTBCOztJQUFFLDRDQUFtQjs7Ozs7Ozs7QUEwRnpGLFNBQVMsa0JBQWtCLENBQUMsR0FBMEMsRUFBRSxHQUFRLEVBQUUsS0FBVTs7UUFDdEYsYUFBbUM7SUFDdkMsSUFBSSxHQUFHLFlBQVksR0FBRyxFQUFFO1FBQ3RCLGFBQWEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksYUFBYSxFQUFFO1lBQ2pCLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTs7c0JBQ2xCLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDMUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDaEM7WUFDRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO2dCQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Y7S0FDRjtTQUFNO1FBQ0wsYUFBYSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLGFBQWEsRUFBRTtZQUNqQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUU7O3NCQUNsQixLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQzFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsSUFBSSxhQUFhLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakI7U0FDRjtLQUNGO0lBQ0QsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQzs7Ozs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLEtBQVU7SUFDdkMscURBQXFEO0lBQ3JELHFEQUFxRDtJQUNyRCxxREFBcUQ7SUFDckQsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN0QyxDQUFDOzs7OztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVM7SUFDOUIsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QyxDQUFDOzs7OztBQUVELFNBQVMsbUJBQW1CLENBQUMsU0FBaUI7SUFDNUMsT0FBTyxTQUFTLElBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxNQUFNLENBQUM7QUFDckQsQ0FBQzs7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQUMsT0FBWSxFQUFFLEtBQWM7O1VBQzFDLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU87SUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdkQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQzs7Ozs7Ozs7O0FBRUQsU0FBUyxxQkFBcUIsQ0FDMUIsU0FBK0IsRUFBRSxNQUF1QixFQUFFLFFBQWtCLEVBQzVFLGVBQXNDLEVBQUUsWUFBb0I7O1VBQ3hELFNBQVMsR0FBYSxFQUFFO0lBQzlCLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7O1VBRTdELGNBQWMsR0FBVSxFQUFFO0lBRWhDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFrQixFQUFFLE9BQVksRUFBRSxFQUFFOztjQUNyRCxNQUFNLEdBQWUsRUFBRTtRQUM3QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOztrQkFDYixLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLENBQUM7WUFFN0UsNkVBQTZFO1lBQzdFLGdEQUFnRDtZQUNoRCxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO2dCQUMvQixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsMEJBQTBCLENBQUM7Z0JBQ25ELGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDOUI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDOzs7O1FBSUMsQ0FBQyxHQUFHLENBQUM7SUFDVCxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbkUsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQVlELFNBQVMsWUFBWSxDQUFDLEtBQVksRUFBRSxLQUFZOztVQUN4QyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQWM7SUFDckMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFN0MsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7UUFBRSxPQUFPLE9BQU8sQ0FBQzs7VUFFaEMsU0FBUyxHQUFHLENBQUM7O1VBQ2IsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQzs7VUFDeEIsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFZOzs7OztJQUV4QyxTQUFTLE9BQU8sQ0FBQyxJQUFTO1FBQ3hCLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxTQUFTLENBQUM7O1lBRXhCLElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQzs7Y0FFaEIsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVO1FBQzlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFHLHVCQUF1QjtZQUNqRCxJQUFJLEdBQUcsTUFBTSxDQUFDO1NBQ2Y7YUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRyxtQkFBbUI7WUFDcEQsSUFBSSxHQUFHLFNBQVMsQ0FBQztTQUNsQjthQUFNLEVBQUcsa0JBQWtCO1lBQzFCLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEI7UUFFRCxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOztjQUNiLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzFCLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN0QixtQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDOztNQUVLLGlCQUFpQixHQUFHLFdBQVc7Ozs7OztBQUNyQyxTQUFTLGFBQWEsQ0FBQyxPQUFZLEVBQUUsU0FBaUI7SUFDcEQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1FBQ3JCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDOUM7U0FBTTs7Y0FDQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQzFDLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN0QztBQUNILENBQUM7Ozs7OztBQUVELFNBQVMsUUFBUSxDQUFDLE9BQVksRUFBRSxTQUFpQjtJQUMvQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDckIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDbEM7U0FBTTs7WUFDRCxPQUFPLEdBQW1DLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUN4RSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUMzQztRQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDM0I7QUFDSCxDQUFDOzs7Ozs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxPQUFZLEVBQUUsU0FBaUI7SUFDbEQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDO1NBQU07O1lBQ0QsT0FBTyxHQUFtQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDeEUsSUFBSSxPQUFPLEVBQUU7WUFDWCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtLQUNGO0FBQ0gsQ0FBQzs7Ozs7OztBQUVELFNBQVMsNkJBQTZCLENBQ2xDLE1BQWlDLEVBQUUsT0FBWSxFQUFFLE9BQTBCO0lBQzdFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUM5RSxDQUFDOzs7OztBQUVELFNBQVMsbUJBQW1CLENBQUMsT0FBMEI7O1VBQy9DLFlBQVksR0FBc0IsRUFBRTtJQUMxQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakQsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQzs7Ozs7O0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxPQUEwQixFQUFFLFlBQStCO0lBQzVGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztjQUNqQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6QixJQUFJLE1BQU0sWUFBWSxvQkFBb0IsRUFBRTtZQUMxQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3pEO2FBQU07WUFDTCxZQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFBLE1BQU0sRUFBbUIsQ0FBQyxDQUFDO1NBQzlDO0tBQ0Y7QUFDSCxDQUFDOzs7Ozs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxDQUF1QixFQUFFLENBQXVCOztVQUMzRCxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O1VBQ25CLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6QixJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLE1BQU07UUFBRSxPQUFPLEtBQUssQ0FBQztJQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Y0FDNUIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztLQUNsRTtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQzs7Ozs7OztBQUVELFNBQVMsc0JBQXNCLENBQzNCLE9BQVksRUFBRSxtQkFBMEMsRUFDeEQsb0JBQTJDOztVQUN2QyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUNuRCxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU8sS0FBSyxDQUFDOztRQUV6QixRQUFRLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUMvQyxJQUFJLFFBQVEsRUFBRTtRQUNaLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBQSxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNqRDtTQUFNO1FBQ0wsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3QztJQUVELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciBhcyBBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2luc3RydWN0aW9uJztcbmltcG9ydCB7QW5pbWF0aW9uVHJpZ2dlcn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmlnZ2VyJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuLi9kc2wvZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RU5URVJfQ0xBU1NOQU1FLCBMRUFWRV9DTEFTU05BTUUsIE5HX0FOSU1BVElOR19DTEFTU05BTUUsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgTkdfVFJJR0dFUl9DTEFTU05BTUUsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIGNvcHlPYmosIGVyYXNlU3R5bGVzLCBpdGVyYXRvclRvQXJyYXksIHNldFN0eWxlc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRPclNldEFzSW5NYXAsIGxpc3Rlbk9uUGxheWVyLCBtYWtlQW5pbWF0aW9uRXZlbnQsIG5vcm1hbGl6ZUtleWZyYW1lcywgb3B0aW1pemVHcm91cFBsYXllcn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBRVUVVRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IFFVRVVFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgRElTQUJMRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgRElTQUJMRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgU1RBUl9DTEFTU05BTUUgPSAnbmctc3Rhci1pbnNlcnRlZCc7XG5jb25zdCBTVEFSX1NFTEVDVE9SID0gJy5uZy1zdGFyLWluc2VydGVkJztcblxuY29uc3QgRU1QVFlfUExBWUVSX0FSUkFZOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbmNvbnN0IE5VTExfUkVNT1ZBTF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG59O1xuY29uc3QgTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiB0cnVlXG59O1xuXG5pbnRlcmZhY2UgVHJpZ2dlckxpc3RlbmVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwaGFzZTogc3RyaW5nO1xuICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUluc3RydWN0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICB0cmlnZ2VyTmFtZTogc3RyaW5nO1xuICBmcm9tU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRvU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRyYW5zaXRpb246IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5O1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG4gIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgUkVNT1ZBTF9GTEFHID0gJ19fbmdfcmVtb3ZlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudEFuaW1hdGlvblN0YXRlIHtcbiAgc2V0Rm9yUmVtb3ZhbDogYm9vbGVhbjtcbiAgc2V0Rm9yTW92ZTogYm9vbGVhbjtcbiAgaGFzQW5pbWF0aW9uOiBib29sZWFuO1xuICBuYW1lc3BhY2VJZDogc3RyaW5nO1xuICByZW1vdmVkQmVmb3JlUXVlcmllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsdWUge1xuICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnM7XG5cbiAgZ2V0IHBhcmFtcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLm9wdGlvbnMucGFyYW1zIGFze1trZXk6IHN0cmluZ106IGFueX07IH1cblxuICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZyA9ICcnKSB7XG4gICAgY29uc3QgaXNPYmogPSBpbnB1dCAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBjb25zdCB2YWx1ZSA9IGlzT2JqID8gaW5wdXRbJ3ZhbHVlJ10gOiBpbnB1dDtcbiAgICB0aGlzLnZhbHVlID0gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNPYmopIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb3B5T2JqKGlucHV0IGFzIGFueSk7XG4gICAgICBkZWxldGUgb3B0aW9uc1sndmFsdWUnXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGFic29yYk9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGNvbnN0IG5ld1BhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgIGlmIChuZXdQYXJhbXMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXMgITtcbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKG9sZFBhcmFtc1twcm9wXSA9PSBudWxsKSB7XG4gICAgICAgICAgb2xkUGFyYW1zW3Byb3BdID0gbmV3UGFyYW1zW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFZPSURfVkFMVUUgPSAndm9pZCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TVEFURV9WQUxVRSA9IG5ldyBTdGF0ZVZhbHVlKFZPSURfVkFMVUUpO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICBwcml2YXRlIF90cmlnZ2Vyczoge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogQW5pbWF0aW9uVHJpZ2dlcn0gPSB7fTtcbiAgcHJpdmF0ZSBfcXVldWU6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gIHByaXZhdGUgX2VsZW1lbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPGFueSwgVHJpZ2dlckxpc3RlbmVyW10+KCk7XG5cbiAgcHJpdmF0ZSBfaG9zdENsYXNzTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBob3N0RWxlbWVudDogYW55LCBwcml2YXRlIF9lbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUpIHtcbiAgICB0aGlzLl9ob3N0Q2xhc3NOYW1lID0gJ25nLXRucy0nICsgaWQ7XG4gICAgYWRkQ2xhc3MoaG9zdEVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpO1xuICB9XG5cbiAgbGlzdGVuKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmICghdGhpcy5fdHJpZ2dlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxpc3RlbiBvbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke1xuICAgICAgICAgIHBoYXNlfVwiIGJlY2F1c2UgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGRvZXNuXFwndCBleGlzdCFgKTtcbiAgICB9XG5cbiAgICBpZiAocGhhc2UgPT0gbnVsbCB8fCBwaGFzZS5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBiZWNhdXNlIHRoZSBwcm92aWRlZCBldmVudCBpcyB1bmRlZmluZWQhYCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RyaWdnZXJFdmVudFZhbGlkKHBoYXNlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke3BoYXNlfVwiIGZvciB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke1xuICAgICAgICAgIG5hbWV9XCIgaXMgbm90IHN1cHBvcnRlZCFgKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBnZXRPclNldEFzSW5NYXAodGhpcy5fZWxlbWVudExpc3RlbmVycywgZWxlbWVudCwgW10pO1xuICAgIGNvbnN0IGRhdGEgPSB7bmFtZSwgcGhhc2UsIGNhbGxiYWNrfTtcbiAgICBsaXN0ZW5lcnMucHVzaChkYXRhKTtcblxuICAgIGNvbnN0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LCBlbGVtZW50LCB7fSk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgbmFtZSk7XG4gICAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbbmFtZV0gPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyB0aGUgZXZlbnQgbGlzdGVuZXIgaXMgcmVtb3ZlZCBBRlRFUiB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgIC8vIHRoYXQgbGVhdmUgYW5pbWF0aW9ucyBjYWxsYmFja3MgY2FuIGZpcmUgKG90aGVyd2lzZSBpZiB0aGUgbm9kZVxuICAgICAgLy8gaXMgcmVtb3ZlZCBpbiBiZXR3ZWVuIHRoZW4gdGhlIGxpc3RlbmVycyB3b3VsZCBiZSBkZXJlZ2lzdGVyZWQpXG4gICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoZGF0YSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAgICAgZGVsZXRlIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgYXN0OiBBbmltYXRpb25UcmlnZ2VyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAvLyB0aHJvd1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90cmlnZ2Vyc1tuYW1lXSA9IGFzdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyaWdnZXIobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuICAgIGlmICghdHJpZ2dlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQhYCk7XG4gICAgfVxuICAgIHJldHVybiB0cmlnZ2VyO1xuICB9XG5cbiAgdHJpZ2dlcihlbGVtZW50OiBhbnksIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnksIGRlZmF1bHRUb0ZhbGxiYWNrOiBib29sZWFuID0gdHJ1ZSk6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX2dldFRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgIGxldCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcykge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LnNldChlbGVtZW50LCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB7fSk7XG4gICAgfVxuXG4gICAgbGV0IGZyb21TdGF0ZSA9IHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV07XG4gICAgY29uc3QgdG9TdGF0ZSA9IG5ldyBTdGF0ZVZhbHVlKHZhbHVlLCB0aGlzLmlkKTtcblxuICAgIGNvbnN0IGlzT2JqID0gdmFsdWUgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJyk7XG4gICAgaWYgKCFpc09iaiAmJiBmcm9tU3RhdGUpIHtcbiAgICAgIHRvU3RhdGUuYWJzb3JiT3B0aW9ucyhmcm9tU3RhdGUub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXSA9IHRvU3RhdGU7XG5cbiAgICBpZiAoIWZyb21TdGF0ZSkge1xuICAgICAgZnJvbVN0YXRlID0gREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICB9XG5cbiAgICBjb25zdCBpc1JlbW92YWwgPSB0b1N0YXRlLnZhbHVlID09PSBWT0lEX1ZBTFVFO1xuXG4gICAgLy8gbm9ybWFsbHkgdGhpcyBpc24ndCByZWFjaGVkIGJ5IGhlcmUsIGhvd2V2ZXIsIGlmIGFuIG9iamVjdCBleHByZXNzaW9uXG4gICAgLy8gaXMgcGFzc2VkIGluIHRoZW4gaXQgbWF5IGJlIGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuIENvbXBhcmluZyB0aGUgdmFsdWVcbiAgICAvLyBpcyBpbXBvcnRhbnQgc2luY2UgdGhhdCB3aWxsIHN0YXkgdGhlIHNhbWUgZGVzcGl0ZSB0aGVyZSBiZWluZyBhIG5ldyBvYmplY3QuXG4gICAgLy8gVGhlIHJlbW92YWwgYXJjIGhlcmUgaXMgc3BlY2lhbCBjYXNlZCBiZWNhdXNlIHRoZSBzYW1lIGVsZW1lbnQgaXMgdHJpZ2dlcmVkXG4gICAgLy8gdHdpY2UgaW4gdGhlIGV2ZW50IHRoYXQgaXQgY29udGFpbnMgYW5pbWF0aW9ucyBvbiB0aGUgb3V0ZXIvaW5uZXIgcG9ydGlvbnNcbiAgICAvLyBvZiB0aGUgaG9zdCBjb250YWluZXJcbiAgICBpZiAoIWlzUmVtb3ZhbCAmJiBmcm9tU3RhdGUudmFsdWUgPT09IHRvU3RhdGUudmFsdWUpIHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBkZXNwaXRlIHRoZSB2YWx1ZSBub3QgY2hhbmdpbmcsIHNvbWUgaW5uZXIgcGFyYW1zXG4gICAgICAvLyBoYXZlIGNoYW5nZWQgd2hpY2ggbWVhbnMgdGhhdCB0aGUgYW5pbWF0aW9uIGZpbmFsIHN0eWxlcyBuZWVkIHRvIGJlIGFwcGxpZWRcbiAgICAgIGlmICghb2JqRXF1YWxzKGZyb21TdGF0ZS5wYXJhbXMsIHRvU3RhdGUucGFyYW1zKSkge1xuICAgICAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG4gICAgICAgIGNvbnN0IGZyb21TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKGZyb21TdGF0ZS52YWx1ZSwgZnJvbVN0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgY29uc3QgdG9TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKHRvU3RhdGUudmFsdWUsIHRvU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGZyb21TdHlsZXMpO1xuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIHRvU3R5bGVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllcnNPbkVsZW1lbnQ6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudCwgZWxlbWVudCwgW10pO1xuICAgIHBsYXllcnNPbkVsZW1lbnQuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gb25seSByZW1vdmUgdGhlIHBsYXllciBpZiBpdCBpcyBxdWV1ZWQgb24gdGhlIEVYQUNUIHNhbWUgdHJpZ2dlci9uYW1lc3BhY2VcbiAgICAgIC8vIHdlIG9ubHkgYWxzbyBkZWFsIHdpdGggcXVldWVkIHBsYXllcnMgaGVyZSBiZWNhdXNlIGlmIHRoZSBhbmltYXRpb24gaGFzXG4gICAgICAvLyBzdGFydGVkIHRoZW4gd2Ugd2FudCB0byBrZWVwIHRoZSBwbGF5ZXIgYWxpdmUgdW50aWwgdGhlIGZsdXNoIGhhcHBlbnNcbiAgICAgIC8vICh3aGljaCBpcyB3aGVyZSB0aGUgcHJldmlvdXNQbGF5ZXJzIGFyZSBwYXNzZWQgaW50byB0aGUgbmV3IHBhbHllcilcbiAgICAgIGlmIChwbGF5ZXIubmFtZXNwYWNlSWQgPT0gdGhpcy5pZCAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgPT0gdHJpZ2dlck5hbWUgJiYgcGxheWVyLnF1ZXVlZCkge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHRyYW5zaXRpb24gPVxuICAgICAgICB0cmlnZ2VyLm1hdGNoVHJhbnNpdGlvbihmcm9tU3RhdGUudmFsdWUsIHRvU3RhdGUudmFsdWUsIGVsZW1lbnQsIHRvU3RhdGUucGFyYW1zKTtcbiAgICBsZXQgaXNGYWxsYmFja1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIGlmICghZGVmYXVsdFRvRmFsbGJhY2spIHJldHVybjtcbiAgICAgIHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgdGhpcy5fcXVldWUucHVzaChcbiAgICAgICAge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBsYXllciwgaXNGYWxsYmFja1RyYW5zaXRpb259KTtcblxuICAgIGlmICghaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpO1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4geyByZW1vdmVDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTsgfSk7XG4gICAgfVxuXG4gICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVycykge1xuICAgICAgICBsZXQgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgcGxheWVyc09uRWxlbWVudC5wdXNoKHBsYXllcik7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVyZWdpc3RlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG5cbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmZvckVhY2goKHN0YXRlTWFwLCBlbGVtZW50KSA9PiB7IGRlbGV0ZSBzdGF0ZU1hcFtuYW1lXTsgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVycywgZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5zZXQoXG4gICAgICAgICAgZWxlbWVudCwgbGlzdGVuZXJzLmZpbHRlcihlbnRyeSA9PiB7IHJldHVybiBlbnRyeS5uYW1lICE9IG5hbWU7IH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZGVsZXRlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMocm9vdEVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAvLyBlbXVsYXRlIGEgbGVhdmUgYW5pbWF0aW9uIGZvciBhbGwgaW5uZXIgbm9kZXMgd2l0aGluIHRoaXMgbm9kZS5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gYW5pbWF0aW9ucyBmb3VuZCBmb3IgYW55IG9mIHRoZSBub2RlcyB0aGVuIGNsZWFyIHRoZSBjYWNoZVxuICAgIC8vIGZvciB0aGUgZWxlbWVudC5cbiAgICB0aGlzLl9lbmdpbmUuZHJpdmVyLnF1ZXJ5KHJvb3RFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYW4gaW5uZXIgcmVtb3ZlKCkgb3BlcmF0aW9uIGhhcyBhbHJlYWR5IGtpY2tlZCBvZmZcbiAgICAgIC8vIHRoZSBhbmltYXRpb24gb24gdGhpcyBlbGVtZW50Li4uXG4gICAgICBpZiAoZWxtW1JFTU9WQUxfRkxBR10pIHJldHVybjtcblxuICAgICAgY29uc3QgbmFtZXNwYWNlcyA9IHRoaXMuX2VuZ2luZS5mZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxtKTtcbiAgICAgIGlmIChuYW1lc3BhY2VzLnNpemUpIHtcbiAgICAgICAgbmFtZXNwYWNlcy5mb3JFYWNoKG5zID0+IG5zLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbG0sIGNvbnRleHQsIGZhbHNlLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB0cmlnZ2VyTGVhdmVBbmltYXRpb24oXG4gICAgICBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSwgZGVzdHJveUFmdGVyQ29tcGxldGU/OiBib29sZWFuLFxuICAgICAgZGVmYXVsdFRvRmFsbGJhY2s/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJpZ2dlclN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICh0cmlnZ2VyU3RhdGVzKSB7XG4gICAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHRyaWdnZXJTdGF0ZXMpLmZvckVhY2godHJpZ2dlck5hbWUgPT4ge1xuICAgICAgICAvLyB0aGlzIGNoZWNrIGlzIGhlcmUgaW4gdGhlIGV2ZW50IHRoYXQgYW4gZWxlbWVudCBpcyByZW1vdmVkXG4gICAgICAgIC8vIHR3aWNlIChib3RoIG9uIHRoZSBob3N0IGxldmVsIGFuZCB0aGUgY29tcG9uZW50IGxldmVsKVxuICAgICAgICBpZiAodGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdKSB7XG4gICAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy50cmlnZ2VyKGVsZW1lbnQsIHRyaWdnZXJOYW1lLCBWT0lEX1ZBTFVFLCBkZWZhdWx0VG9GYWxsYmFjayk7XG4gICAgICAgICAgaWYgKHBsYXllcikge1xuICAgICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCB0cnVlLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKGRlc3Ryb3lBZnRlckNvbXBsZXRlKSB7XG4gICAgICAgICAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gdGhpcy5fZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZWxlbWVudExpc3RlbmVycy5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgY29uc3QgdmlzaXRlZFRyaWdnZXJzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gbGlzdGVuZXIubmFtZTtcbiAgICAgICAgaWYgKHZpc2l0ZWRUcmlnZ2Vycy5oYXModHJpZ2dlck5hbWUpKSByZXR1cm47XG4gICAgICAgIHZpc2l0ZWRUcmlnZ2Vycy5hZGQodHJpZ2dlck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV07XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGZyb21TdGF0ZSA9IGVsZW1lbnRTdGF0ZXNbdHJpZ2dlck5hbWVdIHx8IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICB0cmlnZ2VyTmFtZSxcbiAgICAgICAgICB0cmFuc2l0aW9uLFxuICAgICAgICAgIGZyb21TdGF0ZSxcbiAgICAgICAgICB0b1N0YXRlLFxuICAgICAgICAgIHBsYXllcixcbiAgICAgICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9lbmdpbmU7XG5cbiAgICBpZiAoZWxlbWVudC5jaGlsZEVsZW1lbnRDb3VudCkge1xuICAgICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMoZWxlbWVudCwgY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IGEgKiA9PiBWT0lEIGFuaW1hdGlvbiB3YXMgZGV0ZWN0ZWQgYW5kIGtpY2tlZCBvZmZcbiAgICBpZiAodGhpcy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxlbWVudCwgY29udGV4dCwgdHJ1ZSkpIHJldHVybjtcblxuICAgIC8vIGZpbmQgdGhlIHBsYXllciB0aGF0IGlzIGFuaW1hdGluZyBhbmQgbWFrZSBzdXJlIHRoYXQgdGhlXG4gICAgLy8gcmVtb3ZhbCBpcyBkZWxheWVkIHVudGlsIHRoYXQgcGxheWVyIGhhcyBjb21wbGV0ZWRcbiAgICBsZXQgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgaWYgKGVuZ2luZS50b3RhbEFuaW1hdGlvbnMpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXJzID1cbiAgICAgICAgICBlbmdpbmUucGxheWVycy5sZW5ndGggPyBlbmdpbmUucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpIDogW107XG5cbiAgICAgIC8vIHdoZW4gdGhpcyBgaWYgc3RhdGVtZW50YCBkb2VzIG5vdCBjb250aW51ZSBmb3J3YXJkIGl0IG1lYW5zIHRoYXRcbiAgICAgIC8vIGEgcHJldmlvdXMgYW5pbWF0aW9uIHF1ZXJ5IGhhcyBzZWxlY3RlZCB0aGUgY3VycmVudCBlbGVtZW50IGFuZFxuICAgICAgLy8gaXMgYW5pbWF0aW5nIGl0LiBJbiB0aGlzIHNpdHVhdGlvbiB3YW50IHRvIGNvbnRpbnVlIGZvcndhcmRzIGFuZFxuICAgICAgLy8gYWxsb3cgdGhlIGVsZW1lbnQgdG8gYmUgcXVldWVkIHVwIGZvciBhbmltYXRpb24gbGF0ZXIuXG4gICAgICBpZiAoY3VycmVudFBsYXllcnMgJiYgY3VycmVudFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcGFyZW50ID0gZWxlbWVudDtcbiAgICAgICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSBlbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChwYXJlbnQpO1xuICAgICAgICAgIGlmICh0cmlnZ2Vycykge1xuICAgICAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgc3RhZ2Ugd2Uga25vdyB0aGF0IHRoZSBlbGVtZW50IHdpbGwgZWl0aGVyIGdldCByZW1vdmVkXG4gICAgLy8gZHVyaW5nIGZsdXNoIG9yIHdpbGwgYmUgcGlja2VkIHVwIGJ5IGEgcGFyZW50IHF1ZXJ5LiBFaXRoZXIgd2F5XG4gICAgLy8gd2UgbmVlZCB0byBmaXJlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoaXMgZWxlbWVudCB3aGVuIGl0IERPRVMgZ2V0XG4gICAgLy8gcmVtb3ZlZCAob25jZSB0aGUgcXVlcnkgcGFyZW50IGFuaW1hdGlvbiBpcyBkb25lIG9yIGFmdGVyIGZsdXNoKVxuICAgIHRoaXMucHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQpO1xuXG4gICAgLy8gd2hldGhlciBvciBub3QgYSBwYXJlbnQgaGFzIGFuIGFuaW1hdGlvbiB3ZSBuZWVkIHRvIGRlbGF5IHRoZSBkZWZlcnJhbCBvZiB0aGUgbGVhdmVcbiAgICAvLyBvcGVyYXRpb24gdW50aWwgd2UgaGF2ZSBtb3JlIGluZm9ybWF0aW9uICh3aGljaCB3ZSBkbyBhZnRlciBmbHVzaCgpIGhhcyBiZWVuIGNhbGxlZClcbiAgICBpZiAoY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uKSB7XG4gICAgICBlbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgZmFsc2UsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB3ZSBkbyB0aGlzIGFmdGVyIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCB0aGUgY2FsbGJhY2tzIGNhbiBiZSBmaXJlZFxuICAgICAgZW5naW5lLmFmdGVyRmx1c2goKCkgPT4gdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KSk7XG4gICAgICBlbmdpbmUuZGVzdHJveUlubmVyQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgIGVuZ2luZS5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0Tm9kZShlbGVtZW50OiBhbnksIHBhcmVudDogYW55KTogdm9pZCB7IGFkZENsYXNzKGVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpOyB9XG5cbiAgZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZDogbnVtYmVyKTogUXVldWVJbnN0cnVjdGlvbltdIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIHRoaXMuX3F1ZXVlLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgaWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcblxuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyOiBUcmlnZ2VyTGlzdGVuZXIpID0+IHtcbiAgICAgICAgICBpZiAobGlzdGVuZXIubmFtZSA9PSBlbnRyeS50cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgY29uc3QgYmFzZUV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgICAgICAgICAgIGVsZW1lbnQsIGVudHJ5LnRyaWdnZXJOYW1lLCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUpO1xuICAgICAgICAgICAgKGJhc2VFdmVudCBhcyBhbnkpWydfZGF0YSddID0gbWljcm90YXNrSWQ7XG4gICAgICAgICAgICBsaXN0ZW5PblBsYXllcihlbnRyeS5wbGF5ZXIsIGxpc3RlbmVyLnBoYXNlLCBiYXNlRXZlbnQsIGxpc3RlbmVyLmNhbGxiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGxheWVyLm1hcmtlZEZvckRlc3Ryb3kpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgIC8vIG5vdyB3ZSBjYW4gZGVzdHJveSB0aGUgZWxlbWVudCBwcm9wZXJseSBzaW5jZSB0aGUgZXZlbnQgbGlzdGVuZXJzIGhhdmVcbiAgICAgICAgICAvLyBiZWVuIGJvdW5kIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluc3RydWN0aW9ucy5wdXNoKGVudHJ5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX3F1ZXVlID0gW107XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIC8vIGlmIGRlcENvdW50ID09IDAgdGhlbSBtb3ZlIHRvIGZyb250XG4gICAgICAvLyBvdGhlcndpc2UgaWYgYSBjb250YWlucyBiIHRoZW4gbW92ZSBiYWNrXG4gICAgICBjb25zdCBkMCA9IGEudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBjb25zdCBkMSA9IGIudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBpZiAoZDAgPT0gMCB8fCBkMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiBkMCAtIGQxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZS5kcml2ZXIuY29udGFpbnNFbGVtZW50KGEuZWxlbWVudCwgYi5lbGVtZW50KSA/IDEgOiAtMTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocCA9PiBwLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnModGhpcy5ob3N0RWxlbWVudCwgY29udGV4dCk7XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNEYXRhKGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIGxldCBjb250YWluc0RhdGEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudExpc3RlbmVycy5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgY29udGFpbnNEYXRhID1cbiAgICAgICAgKHRoaXMuX3F1ZXVlLmZpbmQoZW50cnkgPT4gZW50cnkuZWxlbWVudCA9PT0gZWxlbWVudCkgPyB0cnVlIDogZmFsc2UpIHx8IGNvbnRhaW5zRGF0YTtcbiAgICByZXR1cm4gY29udGFpbnNEYXRhO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVkVHJhbnNpdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbjtcbiAgcGxheWVyOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyO1xufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgcHVibGljIG5ld0hvc3RFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgcGxheWVyc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBzdGF0ZXNCeUVsZW1lbnQgPSBuZXcgTWFwPGFueSwge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogU3RhdGVWYWx1ZX0+KCk7XG4gIHB1YmxpYyBkaXNhYmxlZE5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG5cbiAgcHVibGljIHRvdGFsQW5pbWF0aW9ucyA9IDA7XG4gIHB1YmxpYyB0b3RhbFF1ZXVlZFBsYXllcnMgPSAwO1xuXG4gIHByaXZhdGUgX25hbWVzcGFjZUxvb2t1cDoge1tpZDogc3RyaW5nXTogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZX0gPSB7fTtcbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTGlzdDogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZVtdID0gW107XG4gIHByaXZhdGUgX2ZsdXNoRm5zOiAoKCkgPT4gYW55KVtdID0gW107XG4gIHByaXZhdGUgX3doZW5RdWlldEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuXG4gIHB1YmxpYyBuYW1lc3BhY2VzQnlIb3N0RWxlbWVudCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgY29sbGVjdGVkRW50ZXJFbGVtZW50czogYW55W10gPSBbXTtcbiAgcHVibGljIGNvbGxlY3RlZExlYXZlRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgLy8gdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gYmUgb3ZlcnJpZGRlbiBieSB0aGUgY29kZSB0aGF0IHVzZXMgdGhpcyBlbmdpbmVcbiAgcHVibGljIG9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PiB7fTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgeyB0aGlzLm9uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpOyB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgYm9keU5vZGU6IGFueSwgcHVibGljIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLFxuICAgICAgcHJpdmF0ZSBfbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7fVxuXG4gIGdldCBxdWV1ZWRQbGF5ZXJzKCk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSB7XG4gICAgY29uc3QgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5mb3JFYWNoKG5zID0+IHtcbiAgICAgIG5zLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkge1xuICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIGNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbnMgPSBuZXcgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZShuYW1lc3BhY2VJZCwgaG9zdEVsZW1lbnQsIHRoaXMpO1xuICAgIGlmIChob3N0RWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLl9iYWxhbmNlTmFtZXNwYWNlTGlzdChucywgaG9zdEVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWZlciB0aGlzIGxhdGVyIHVudGlsIGZsdXNoIGR1cmluZyB3aGVuIHRoZSBob3N0IGVsZW1lbnQgaGFzXG4gICAgICAvLyBiZWVuIGluc2VydGVkIHNvIHRoYXQgd2Uga25vdyBleGFjdGx5IHdoZXJlIHRvIHBsYWNlIGl0IGluXG4gICAgICAvLyB0aGUgbmFtZXNwYWNlIGxpc3RcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLnNldChob3N0RWxlbWVudCwgbnMpO1xuXG4gICAgICAvLyBnaXZlbiB0aGF0IHRoaXMgaG9zdCBlbGVtZW50IGlzIGFwYXJ0IG9mIHRoZSBhbmltYXRpb24gY29kZSwgaXRcbiAgICAgIC8vIG1heSBvciBtYXkgbm90IGJlIGluc2VydGVkIGJ5IGEgcGFyZW50IG5vZGUgdGhhdCBpcyBhbiBvZiBhblxuICAgICAgLy8gYW5pbWF0aW9uIHJlbmRlcmVyIHR5cGUuIElmIHRoaXMgaGFwcGVucyB0aGVuIHdlIGNhbiBzdGlsbCBoYXZlXG4gICAgICAvLyBhY2Nlc3MgdG8gdGhpcyBpdGVtIHdoZW4gd2UgcXVlcnkgZm9yIDplbnRlciBub2Rlcy4gSWYgdGhlIHBhcmVudFxuICAgICAgLy8gaXMgYSByZW5kZXJlciB0aGVuIHRoZSBzZXQgZGF0YS1zdHJ1Y3R1cmUgd2lsbCBub3JtYWxpemUgdGhlIGVudHJ5XG4gICAgICB0aGlzLmNvbGxlY3RFbnRlckVsZW1lbnQoaG9zdEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXSA9IG5zO1xuICB9XG5cbiAgcHJpdmF0ZSBfYmFsYW5jZU5hbWVzcGFjZUxpc3QobnM6IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBsaW1pdCA9IHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoIC0gMTtcbiAgICBpZiAobGltaXQgPj0gMCkge1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBpID0gbGltaXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5leHROYW1lc3BhY2UgPSB0aGlzLl9uYW1lc3BhY2VMaXN0W2ldO1xuICAgICAgICBpZiAodGhpcy5kcml2ZXIuY29udGFpbnNFbGVtZW50KG5leHROYW1lc3BhY2UuaG9zdEVsZW1lbnQsIGhvc3RFbGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKGkgKyAxLCAwLCBucyk7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKDAsIDAsIG5zKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5wdXNoKG5zKTtcbiAgICB9XG5cbiAgICB0aGlzLm5hbWVzcGFjZXNCeUhvc3RFbGVtZW50LnNldChob3N0RWxlbWVudCwgbnMpO1xuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmICghbnMpIHtcbiAgICAgIG5zID0gdGhpcy5jcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG5zO1xuICB9XG5cbiAgcmVnaXN0ZXJUcmlnZ2VyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgdHJpZ2dlcjogQW5pbWF0aW9uVHJpZ2dlcikge1xuICAgIGxldCBucyA9IHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgaWYgKG5zICYmIG5zLnJlZ2lzdGVyKG5hbWUsIHRyaWdnZXIpKSB7XG4gICAgICB0aGlzLnRvdGFsQW5pbWF0aW9ucysrO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3kobmFtZXNwYWNlSWQ6IHN0cmluZywgY29udGV4dDogYW55KSB7XG4gICAgaWYgKCFuYW1lc3BhY2VJZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG5cbiAgICB0aGlzLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5kZWxldGUobnMuaG9zdEVsZW1lbnQpO1xuICAgICAgZGVsZXRlIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX25hbWVzcGFjZUxpc3QuaW5kZXhPZihucyk7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFmdGVyRmx1c2hBbmltYXRpb25zRG9uZSgoKSA9PiBucy5kZXN0cm95KGNvbnRleHQpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZldGNoTmFtZXNwYWNlKGlkOiBzdHJpbmcpIHsgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtpZF07IH1cblxuICBmZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxlbWVudDogYW55KTogU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+IHtcbiAgICAvLyBub3JtYWxseSB0aGVyZSBzaG91bGQgb25seSBiZSBvbmUgbmFtZXNwYWNlIHBlciBlbGVtZW50LCBob3dldmVyXG4gICAgLy8gaWYgQHRyaWdnZXJzIGFyZSBwbGFjZWQgb24gYm90aCB0aGUgY29tcG9uZW50IGVsZW1lbnQgYW5kIHRoZW5cbiAgICAvLyBpdHMgaG9zdCBlbGVtZW50ICh3aXRoaW4gdGhlIGNvbXBvbmVudCBjb2RlKSB0aGVuIHRoZXJlIHdpbGwgYmVcbiAgICAvLyB0d28gbmFtZXNwYWNlcyByZXR1cm5lZC4gV2UgdXNlIGEgc2V0IGhlcmUgdG8gc2ltcGx5IHRoZSBkZWR1cGVcbiAgICAvLyBvZiBuYW1lc3BhY2VzIGluY2FzZSB0aGVyZSBhcmUgbXVsdGlwbGUgdHJpZ2dlcnMgYm90aCB0aGUgZWxtIGFuZCBob3N0XG4gICAgY29uc3QgbmFtZXNwYWNlcyA9IG5ldyBTZXQ8QW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50U3RhdGVzKSB7XG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZWxlbWVudFN0YXRlcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbnNJZCA9IGVsZW1lbnRTdGF0ZXNba2V5c1tpXV0ubmFtZXNwYWNlSWQ7XG4gICAgICAgIGlmIChuc0lkKSB7XG4gICAgICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuc0lkKTtcbiAgICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICAgIG5hbWVzcGFjZXMuYWRkKG5zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzcGFjZXM7XG4gIH1cblxuICB0cmlnZ2VyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLnRyaWdnZXIoZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaW5zZXJ0Tm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIWlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHJldHVybjtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYW5kIHJlaW5zZXJ0ZWQgKG1vdmUgb3BlcmF0aW9uKVxuICAgIC8vIHdoZW4gdGhpcyBvY2N1cnMgd2UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBlbGVtZW50IGZvciBkZWxldGlvbiBsYXRlclxuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgZGV0YWlscy5zZXRGb3JSZW1vdmFsID0gZmFsc2U7XG4gICAgICBkZXRhaWxzLnNldEZvck1vdmUgPSB0cnVlO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuaW5kZXhPZihlbGVtZW50KTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBuYW1lc3BhY2VJZCBpcyBibGFuayB0aGVuIHRoZSBjYWxsZXJcbiAgICAvLyBjb2RlIGRvZXMgbm90IGNvbnRhaW4gYW55IGFuaW1hdGlvbiBjb2RlIGluIGl0LCBidXQgaXQgaXNcbiAgICAvLyBqdXN0IGJlaW5nIGNhbGxlZCBzbyB0aGF0IHRoZSBub2RlIGlzIG1hcmtlZCBhcyBiZWluZyBpbnNlcnRlZFxuICAgIGlmIChuYW1lc3BhY2VJZCkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICAvLyBUaGlzIGlmLXN0YXRlbWVudCBpcyBhIHdvcmthcm91bmQgZm9yIHJvdXRlciBpc3N1ZSAjMjE5NDcuXG4gICAgICAvLyBUaGUgcm91dGVyIHNvbWV0aW1lcyBoaXRzIGEgcmFjZSBjb25kaXRpb24gd2hlcmUgd2hpbGUgYSByb3V0ZVxuICAgICAgLy8gaXMgYmVpbmcgaW5zdGFudGlhdGVkIGEgbmV3IG5hdmlnYXRpb24gYXJyaXZlcywgdHJpZ2dlcmluZyBsZWF2ZVxuICAgICAgLy8gYW5pbWF0aW9uIG9mIERPTSB0aGF0IGhhcyBub3QgYmVlbiBmdWxseSBpbml0aWFsaXplZCwgdW50aWwgdGhpc1xuICAgICAgLy8gaXMgcmVzb2x2ZWQsIHdlIG5lZWQgdG8gaGFuZGxlIHRoZSBzY2VuYXJpbyB3aGVuIERPTSBpcyBub3QgaW4gYVxuICAgICAgLy8gY29uc2lzdGVudCBzdGF0ZSBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cbiAgICAgIGlmIChucykge1xuICAgICAgICBucy5pbnNlcnROb2RlKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gb25seSAqZGlyZWN0aXZlcyBhbmQgaG9zdCBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgYmVmb3JlXG4gICAgaWYgKGluc2VydEJlZm9yZSkge1xuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudDogYW55KSB7IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5wdXNoKGVsZW1lbnQpOyB9XG5cbiAgbWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQ6IGFueSwgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlTm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbnMgPSBuYW1lc3BhY2VJZCA/IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKSA6IG51bGw7XG4gICAgaWYgKG5zKSB7XG4gICAgICBucy5yZW1vdmVOb2RlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgbWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBoYXNBbmltYXRpb24/OiBib29sZWFuLCBjb250ZXh0PzogYW55KSB7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0ge1xuICAgICAgbmFtZXNwYWNlSWQsXG4gICAgICBzZXRGb3JSZW1vdmFsOiBjb250ZXh0LCBoYXNBbmltYXRpb24sXG4gICAgICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgbGlzdGVuKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmxpc3RlbihlbGVtZW50LCBuYW1lLCBwaGFzZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge307XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEluc3RydWN0aW9uKFxuICAgICAgZW50cnk6IFF1ZXVlSW5zdHJ1Y3Rpb24sIHN1YlRpbWVsaW5lczogRWxlbWVudEluc3RydWN0aW9uTWFwLCBlbnRlckNsYXNzTmFtZTogc3RyaW5nLFxuICAgICAgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgc2tpcEJ1aWxkQXN0PzogYm9vbGVhbikge1xuICAgIHJldHVybiBlbnRyeS50cmFuc2l0aW9uLmJ1aWxkKFxuICAgICAgICB0aGlzLmRyaXZlciwgZW50cnkuZWxlbWVudCwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlLCBlbnRlckNsYXNzTmFtZSxcbiAgICAgICAgbGVhdmVDbGFzc05hbWUsIGVudHJ5LmZyb21TdGF0ZS5vcHRpb25zLCBlbnRyeS50b1N0YXRlLm9wdGlvbnMsIHN1YlRpbWVsaW5lcywgc2tpcEJ1aWxkQXN0KTtcbiAgfVxuXG4gIGRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoY29udGFpbmVyRWxlbWVudDogYW55KSB7XG4gICAgbGV0IGVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoY29udGFpbmVyRWxlbWVudCwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZGVzdHJveUFjdGl2ZUFuaW1hdGlvbnNGb3JFbGVtZW50KGVsZW1lbnQpKTtcblxuICAgIGlmICh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LnNpemUgPT0gMCkgcmV0dXJuO1xuXG4gICAgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIHRydWUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB0aGlzLmZpbmlzaEFjdGl2ZVF1ZXJpZWRBbmltYXRpb25PbkVsZW1lbnQoZWxlbWVudCkpO1xuICB9XG5cbiAgZGVzdHJveUFjdGl2ZUFuaW1hdGlvbnNGb3JFbGVtZW50KGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgc2V0IGZvciBkZXN0cnVjdGlvbiwgYnV0IGhhc24ndCBzdGFydGVkLlxuICAgICAgICAvLyBpbiB0aGlzIHNpdHVhdGlvbiB3ZSB3YW50IHRvIGRlbGF5IHRoZSBkZXN0cnVjdGlvbiB1bnRpbCB0aGUgZmx1c2ggb2NjdXJzXG4gICAgICAgIC8vIHNvIHRoYXQgYW55IGV2ZW50IGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGUgcGxheWVyIGFyZSB0cmlnZ2VyZWQuXG4gICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgICAgcGxheWVyLm1hcmtlZEZvckRlc3Ryb3kgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaEFjdGl2ZVF1ZXJpZWRBbmltYXRpb25PbkVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5maW5pc2goKSk7XG4gICAgfVxuICB9XG5cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAodGhpcy5wbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb3B0aW1pemVHcm91cFBsYXllcih0aGlzLnBsYXllcnMpLm9uRG9uZSgoKSA9PiByZXNvbHZlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgIC8vIHRoaXMgd2lsbCBwcmV2ZW50IGl0IGZyb20gcmVtb3ZpbmcgaXQgdHdpY2VcbiAgICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IE5VTExfUkVNT1ZBTF9TVEFURTtcbiAgICAgIGlmIChkZXRhaWxzLm5hbWVzcGFjZUlkKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveUlubmVyQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShkZXRhaWxzLm5hbWVzcGFjZUlkKTtcbiAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgbnMuY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZHJpdmVyLm1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIERJU0FCTEVEX1NFTEVDVE9SKSkge1xuICAgICAgdGhpcy5tYXJrRWxlbWVudEFzRGlzYWJsZWQoZWxlbWVudCwgZmFsc2UpO1xuICAgIH1cblxuICAgIHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIERJU0FCTEVEX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgdGhpcy5tYXJrRWxlbWVudEFzRGlzYWJsZWQobm9kZSwgZmFsc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgZmx1c2gobWljcm90YXNrSWQ6IG51bWJlciA9IC0xKSB7XG4gICAgbGV0IHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgaWYgKHRoaXMubmV3SG9zdEVsZW1lbnRzLnNpemUpIHtcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLmZvckVhY2goKG5zLCBlbGVtZW50KSA9PiB0aGlzLl9iYWxhbmNlTmFtZXNwYWNlTGlzdChucywgZWxlbWVudCkpO1xuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50b3RhbEFuaW1hdGlvbnMgJiYgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxtID0gdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzW2ldO1xuICAgICAgICBhZGRDbGFzcyhlbG0sIFNUQVJfQ0xBU1NOQU1FKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggJiZcbiAgICAgICAgKHRoaXMudG90YWxRdWV1ZWRQbGF5ZXJzIHx8IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5sZW5ndGgpKSB7XG4gICAgICBjb25zdCBjbGVhbnVwRm5zOiBGdW5jdGlvbltdID0gW107XG4gICAgICB0cnkge1xuICAgICAgICBwbGF5ZXJzID0gdGhpcy5fZmx1c2hBbmltYXRpb25zKGNsZWFudXBGbnMsIG1pY3JvdGFza0lkKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xlYW51cEZucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNsZWFudXBGbnNbaV0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzW2ldO1xuICAgICAgICB0aGlzLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50b3RhbFF1ZXVlZFBsYXllcnMgPSAwO1xuICAgIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGggPSAwO1xuICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX2ZsdXNoRm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fZmx1c2hGbnMgPSBbXTtcblxuICAgIGlmICh0aGlzLl93aGVuUXVpZXRGbnMubGVuZ3RoKSB7XG4gICAgICAvLyB3ZSBtb3ZlIHRoZXNlIG92ZXIgdG8gYSB2YXJpYWJsZSBzbyB0aGF0XG4gICAgICAvLyBpZiBhbnkgbmV3IGNhbGxiYWNrcyBhcmUgcmVnaXN0ZXJlZCBpbiBhbm90aGVyXG4gICAgICAvLyBmbHVzaCB0aGV5IGRvIG5vdCBwb3B1bGF0ZSB0aGUgZXhpc3Rpbmcgc2V0XG4gICAgICBjb25zdCBxdWlldEZucyA9IHRoaXMuX3doZW5RdWlldEZucztcbiAgICAgIHRoaXMuX3doZW5RdWlldEZucyA9IFtdO1xuXG4gICAgICBpZiAocGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4geyBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpOyB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1aWV0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVwb3J0RXJyb3IoZXJyb3JzOiBzdHJpbmdbXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBwcm9jZXNzIGFuaW1hdGlvbnMgZHVlIHRvIHRoZSBmb2xsb3dpbmcgZmFpbGVkIHRyaWdnZXIgdHJhbnNpdGlvbnNcXG4gJHtcbiAgICAgICAgICAgIGVycm9ycy5qb2luKCdcXG4nKX1gKTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZsdXNoQW5pbWF0aW9ucyhjbGVhbnVwRm5zOiBGdW5jdGlvbltdLCBtaWNyb3Rhc2tJZDogbnVtYmVyKTpcbiAgICAgIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSB7XG4gICAgY29uc3Qgc3ViVGltZWxpbmVzID0gbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IHNraXBwZWRQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyc01hcCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICBjb25zdCBxdWV1ZWRJbnN0cnVjdGlvbnM6IFF1ZXVlZFRyYW5zaXRpb25bXSA9IFtdO1xuICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgYWxsUHJlU3R5bGVFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBTZXQ8c3RyaW5nPj4oKTtcbiAgICBjb25zdCBhbGxQb3N0U3R5bGVFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBTZXQ8c3RyaW5nPj4oKTtcblxuICAgIGNvbnN0IGRpc2FibGVkRWxlbWVudHNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgICB0aGlzLmRpc2FibGVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGRpc2FibGVkRWxlbWVudHNTZXQuYWRkKG5vZGUpO1xuICAgICAgY29uc3Qgbm9kZXNUaGF0QXJlRGlzYWJsZWQgPSB0aGlzLmRyaXZlci5xdWVyeShub2RlLCBRVUVVRURfU0VMRUNUT1IsIHRydWUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlc1RoYXRBcmVEaXNhYmxlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2Rlc1RoYXRBcmVEaXNhYmxlZFtpXSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBib2R5Tm9kZSA9IHRoaXMuYm9keU5vZGU7XG4gICAgY29uc3QgYWxsVHJpZ2dlckVsZW1lbnRzID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlc0J5RWxlbWVudC5rZXlzKCkpO1xuICAgIGNvbnN0IGVudGVyTm9kZU1hcCA9IGJ1aWxkUm9vdE1hcChhbGxUcmlnZ2VyRWxlbWVudHMsIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cyk7XG5cbiAgICAvLyB0aGlzIG11c3Qgb2NjdXIgYmVmb3JlIHRoZSBpbnN0cnVjdGlvbnMgYXJlIGJ1aWx0IGJlbG93IHN1Y2ggdGhhdFxuICAgIC8vIHRoZSA6ZW50ZXIgcXVlcmllcyBtYXRjaCB0aGUgZWxlbWVudHMgKHNpbmNlIHRoZSB0aW1lbGluZSBxdWVyaWVzXG4gICAgLy8gYXJlIGZpcmVkIGR1cmluZyBpbnN0cnVjdGlvbiBidWlsZGluZykuXG4gICAgY29uc3QgZW50ZXJOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBFTlRFUl9DTEFTU05BTUUgKyBpKys7XG4gICAgICBlbnRlck5vZGVNYXBJZHMuc2V0KHJvb3QsIGNsYXNzTmFtZSk7XG4gICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGxMZWF2ZU5vZGVzOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0IG1lcmdlZExlYXZlTm9kZXMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50c1tpXTtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICAgIGFsbExlYXZlTm9kZXMucHVzaChlbGVtZW50KTtcbiAgICAgICAgbWVyZ2VkTGVhdmVOb2Rlcy5hZGQoZWxlbWVudCk7XG4gICAgICAgIGlmIChkZXRhaWxzLmhhc0FuaW1hdGlvbikge1xuICAgICAgICAgIHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIFNUQVJfU0VMRUNUT1IsIHRydWUpLmZvckVhY2goZWxtID0+IG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsbSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucy5hZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBsZWF2ZU5vZGVNYXBJZHMgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgIGNvbnN0IGxlYXZlTm9kZU1hcCA9IGJ1aWxkUm9vdE1hcChhbGxUcmlnZ2VyRWxlbWVudHMsIEFycmF5LmZyb20obWVyZ2VkTGVhdmVOb2RlcykpO1xuICAgIGxlYXZlTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gTEVBVkVfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgbGVhdmVOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY2xlYW51cEZucy5wdXNoKCgpID0+IHtcbiAgICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBlbnRlck5vZGVNYXBJZHMuZ2V0KHJvb3QpICE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChyb290KSAhO1xuICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgICB9KTtcblxuICAgICAgYWxsTGVhdmVOb2Rlcy5mb3JFYWNoKGVsZW1lbnQgPT4geyB0aGlzLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCk7IH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgZXJyb25lb3VzVHJhbnNpdGlvbnM6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbltdID0gW107XG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgIG5zLmRyYWluUXVldWVkVHJhbnNpdGlvbnMobWljcm90YXNrSWQpLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgICBhbGxQbGF5ZXJzLnB1c2gocGxheWVyKTtcblxuICAgICAgICBpZiAodGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgICAgIC8vIG1vdmUgYW5pbWF0aW9ucyBhcmUgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQuLi5cbiAgICAgICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvck1vdmUpIHtcbiAgICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZUlzT3JwaGFuZWQgPSAhYm9keU5vZGUgfHwgIXRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChib2R5Tm9kZSwgZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IGxlYXZlQ2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBlbnRlckNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSB0aGlzLl9idWlsZEluc3RydWN0aW9uKFxuICAgICAgICAgICAgZW50cnksIHN1YlRpbWVsaW5lcywgZW50ZXJDbGFzc05hbWUsIGxlYXZlQ2xhc3NOYW1lLCBub2RlSXNPcnBoYW5lZCkgITtcbiAgICAgICAgaWYgKGluc3RydWN0aW9uLmVycm9ycyAmJiBpbnN0cnVjdGlvbi5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgZXJyb25lb3VzVHJhbnNpdGlvbnMucHVzaChpbnN0cnVjdGlvbik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZXZlbiB0aG91Z2ggdGhlIGVsZW1lbnQgbWF5IG5vdCBiZSBhcGFydCBvZiB0aGUgRE9NLCBpdCBtYXlcbiAgICAgICAgLy8gc3RpbGwgYmUgYWRkZWQgYXQgYSBsYXRlciBwb2ludCAoZHVlIHRvIHRoZSBtZWNoYW5pY3Mgb2YgY29udGVudFxuICAgICAgICAvLyBwcm9qZWN0aW9uIGFuZC9vciBkeW5hbWljIGNvbXBvbmVudCBpbnNlcnRpb24pIHRoZXJlZm9yZSBpdCdzXG4gICAgICAgIC8vIGltcG9ydGFudCB3ZSBzdGlsbCBzdHlsZSB0aGUgZWxlbWVudC5cbiAgICAgICAgaWYgKG5vZGVJc09ycGhhbmVkKSB7XG4gICAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgdW5tYXRjaGVkIHRyYW5zaXRpb24gaXMgcXVldWVkIHRvIGdvIHRoZW4gaXQgU0hPVUxEIE5PVCByZW5kZXJcbiAgICAgICAgLy8gYW4gYW5pbWF0aW9uIGFuZCBjYW5jZWwgdGhlIHByZXZpb3VzbHkgcnVubmluZyBhbmltYXRpb25zLlxuICAgICAgICBpZiAoZW50cnkuaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGlmIGEgcGFyZW50IGFuaW1hdGlvbiB1c2VzIHRoaXMgYW5pbWF0aW9uIGFzIGEgc3ViIHRyaWdnZXJcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGluc3RydWN0IHRoZSB0aW1lbGluZSBidWlsZGVyIHRvIG5vdCBhZGQgYSBwbGF5ZXIgZGVsYXksIGJ1dFxuICAgICAgICAvLyBpbnN0ZWFkIHN0cmV0Y2ggdGhlIGZpcnN0IGtleWZyYW1lIGdhcCB1cCB1bnRpbCB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gVGhlXG4gICAgICAgIC8vIHJlYXNvbiB0aGlzIGlzIGltcG9ydGFudCBpcyB0byBwcmV2ZW50IGV4dHJhIGluaXRpYWxpemF0aW9uIHN0eWxlcyBmcm9tIGJlaW5nXG4gICAgICAgIC8vIHJlcXVpcmVkIGJ5IHRoZSB1c2VyIGluIHRoZSBhbmltYXRpb24uXG4gICAgICAgIGluc3RydWN0aW9uLnRpbWVsaW5lcy5mb3JFYWNoKHRsID0+IHRsLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lID0gdHJ1ZSk7XG5cbiAgICAgICAgc3ViVGltZWxpbmVzLmFwcGVuZChlbGVtZW50LCBpbnN0cnVjdGlvbi50aW1lbGluZXMpO1xuXG4gICAgICAgIGNvbnN0IHR1cGxlID0ge2luc3RydWN0aW9uLCBwbGF5ZXIsIGVsZW1lbnR9O1xuXG4gICAgICAgIHF1ZXVlZEluc3RydWN0aW9ucy5wdXNoKHR1cGxlKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5xdWVyaWVkRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgICAgIGVsZW1lbnQgPT4gZ2V0T3JTZXRBc0luTWFwKHF1ZXJpZWRFbGVtZW50cywgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgaWYgKHByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucG9zdFN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBzZXRWYWwuYWRkKHByb3ApKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb25lb3VzVHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgZXJyb3JzLnB1c2goYEAke2luc3RydWN0aW9uLnRyaWdnZXJOYW1lfSBoYXMgZmFpbGVkIGR1ZSB0bzpcXG5gKTtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uZXJyb3JzICEuZm9yRWFjaChlcnJvciA9PiBlcnJvcnMucHVzaChgLSAke2Vycm9yfVxcbmApKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbFByZXZpb3VzUGxheWVyc01hcCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgLy8gdGhpcyBtYXAgd29ya3MgdG8gdGVsbCB3aGljaCBlbGVtZW50IGluIHRoZSBET00gdHJlZSBpcyBjb250YWluZWQgYnlcbiAgICAvLyB3aGljaCBhbmltYXRpb24uIEZ1cnRoZXIgZG93biBiZWxvdyB0aGlzIG1hcCB3aWxsIGdldCBwb3B1bGF0ZWQgb25jZVxuICAgIC8vIHRoZSBwbGF5ZXJzIGFyZSBidWlsdCBhbmQgaW4gZG9pbmcgc28gaXQgY2FuIGVmZmljaWVudGx5IGZpZ3VyZSBvdXRcbiAgICAvLyBpZiBhIHN1YiBwbGF5ZXIgaXMgc2tpcHBlZCBkdWUgdG8gYSBwYXJlbnQgcGxheWVyIGhhdmluZyBwcmlvcml0eS5cbiAgICBjb25zdCBhbmltYXRpb25FbGVtZW50TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgICAgICAgIGVudHJ5LnBsYXllci5uYW1lc3BhY2VJZCwgZW50cnkuaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gcGxheWVyLmVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhlbGVtZW50LCBmYWxzZSwgcGxheWVyLm5hbWVzcGFjZUlkLCBwbGF5ZXIudHJpZ2dlck5hbWUsIG51bGwpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocHJldlBsYXllciA9PiB7XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHByZXZQbGF5ZXIpO1xuICAgICAgICBwcmV2UGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igbm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQgKGVpdGhlciBieSlcbiAgICAvLyBoYXZpbmcgdGhlaXIgb3duIGxlYXZlIGFuaW1hdGlvbnMgb3IgYnkgYmVpbmcgcXVlcmllZCBpbiBhIGNvbnRhaW5lclxuICAgIC8vIHRoYXQgd2lsbCBiZSByZW1vdmVkIG9uY2UgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLiBUaGUgaWRlYVxuICAgIC8vIGhlcmUgaXMgdGhhdCAqIHN0eWxlcyBtdXN0IGJlIGlkZW50aWNhbCB0byAhIHN0eWxlcyBiZWNhdXNlIG9mXG4gICAgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKCogaXMgYWxzbyBmaWxsZWQgaW4gYnkgZGVmYXVsdCBpbiBtYW55IHBsYWNlcykuXG4gICAgLy8gT3RoZXJ3aXNlICogc3R5bGVzIHdpbGwgcmV0dXJuIGFuIGVtcHR5IHZhbHVlIG9yIGF1dG8gc2luY2UgdGhlIGVsZW1lbnRcbiAgICAvLyB0aGF0IGlzIGJlaW5nIGdldENvbXB1dGVkU3R5bGUnZCB3aWxsIG5vdCBiZSB2aXNpYmxlIChzaW5jZSAqID0gZGVzdGluYXRpb24pXG4gICAgY29uc3QgcmVwbGFjZU5vZGVzID0gYWxsTGVhdmVOb2Rlcy5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cyk7XG4gICAgfSk7XG5cbiAgICAvLyBQT1NUIFNUQUdFOiBmaWxsIHRoZSAqIHN0eWxlc1xuICAgIGNvbnN0IHBvc3RTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgY29uc3QgYWxsTGVhdmVRdWVyaWVkTm9kZXMgPSBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgIHBvc3RTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzLCBBVVRPX1NUWUxFKTtcblxuICAgIGFsbExlYXZlUXVlcmllZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBpZiAocmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cykpIHtcbiAgICAgICAgcmVwbGFjZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQUkUgU1RBR0U6IGZpbGwgdGhlICEgc3R5bGVzXG4gICAgY29uc3QgcHJlU3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICAgIHByZVN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIG5ldyBTZXQobm9kZXMpLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBQUkVfU1RZTEUpO1xuICAgIH0pO1xuXG4gICAgcmVwbGFjZU5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBjb25zdCBwb3N0ID0gcG9zdFN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBjb25zdCBwcmUgPSBwcmVTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgcG9zdFN0eWxlc01hcC5zZXQobm9kZSwgeyAuLi5wb3N0LCAuLi5wcmUgfSBhcyBhbnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9vdFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHN1YlBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCA9IHt9O1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHtlbGVtZW50LCBwbGF5ZXIsIGluc3RydWN0aW9ufSA9IGVudHJ5O1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGl0IHdhcyBuZXZlciBjb25zdW1lZCBieSBhIHBhcmVudCBhbmltYXRpb24gd2hpY2hcbiAgICAgIC8vIG1lYW5zIHRoYXQgaXQgaXMgaW5kZXBlbmRlbnQgYW5kIHRoZXJlZm9yZSBzaG91bGQgYmUgc2V0IGZvciBhbmltYXRpb25cbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICBwbGF5ZXIub3ZlcnJpZGVUb3RhbFRpbWUoaW5zdHJ1Y3Rpb24udG90YWxUaW1lKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGZsb3cgdXAgdGhlIERPTSBhbmQgcXVlcnkgdGhlIG1hcCB0byBmaWd1cmUgb3V0XG4gICAgICAgIC8vIGlmIGEgcGFyZW50IGFuaW1hdGlvbiBoYXMgcHJpb3JpdHkgb3ZlciBpdC4gSW4gdGhlIHNpdHVhdGlvblxuICAgICAgICAvLyB0aGF0IGEgcGFyZW50IGlzIGRldGVjdGVkIHRoZW4gaXQgd2lsbCBjYW5jZWwgdGhlIGxvb3AuIElmXG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZGV0ZWN0ZWQsIG9yIGl0IHRha2VzIGEgZmV3IGhvcHMgdG8gZmluZCBhIHBhcmVudCxcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGZpbGwgaW4gdGhlIG1pc3Npbmcgbm9kZXMgYW5kIHNpZ25hbCB0aGVtIGFzIGhhdmluZ1xuICAgICAgICAvLyBhIGRldGVjdGVkIHBhcmVudCAob3IgYSBOT19QQVJFTlQgdmFsdWUgdmlhIGEgc3BlY2lhbCBjb25zdGFudCkuXG4gICAgICAgIGxldCBwYXJlbnRXaXRoQW5pbWF0aW9uOiBhbnkgPSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQ7XG4gICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50TWFwLnNpemUgPiAxKSB7XG4gICAgICAgICAgbGV0IGVsbSA9IGVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgcGFyZW50c1RvQWRkOiBhbnlbXSA9IFtdO1xuICAgICAgICAgIHdoaWxlIChlbG0gPSBlbG0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0ZWRQYXJlbnQgPSBhbmltYXRpb25FbGVtZW50TWFwLmdldChlbG0pO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkUGFyZW50KSB7XG4gICAgICAgICAgICAgIHBhcmVudFdpdGhBbmltYXRpb24gPSBkZXRlY3RlZFBhcmVudDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRzVG9BZGQucHVzaChlbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnRzVG9BZGQuZm9yRWFjaChwYXJlbnQgPT4gYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQocGFyZW50LCBwYXJlbnRXaXRoQW5pbWF0aW9uKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IHRoaXMuX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLm5hbWVzcGFjZUlkLCBpbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBza2lwcGVkUGxheWVyc01hcCwgcHJlU3R5bGVzTWFwLFxuICAgICAgICAgICAgcG9zdFN0eWxlc01hcCk7XG5cbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuXG4gICAgICAgIGlmIChwYXJlbnRXaXRoQW5pbWF0aW9uID09PSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQpIHtcbiAgICAgICAgICByb290UGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQocGFyZW50V2l0aEFuaW1hdGlvbik7XG4gICAgICAgICAgaWYgKHBhcmVudFBsYXllcnMgJiYgcGFyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllci5wYXJlbnRQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBhcmVudFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAvLyB0aGVyZSBzdGlsbCBtaWdodCBiZSBhIGFuY2VzdG9yIHBsYXllciBhbmltYXRpbmcgdGhpc1xuICAgICAgICAvLyBlbGVtZW50IHRoZXJlZm9yZSB3ZSB3aWxsIHN0aWxsIGFkZCBpdCBhcyBhIHN1YiBwbGF5ZXJcbiAgICAgICAgLy8gZXZlbiBpZiBpdHMgYW5pbWF0aW9uIG1heSBiZSBkaXNhYmxlZFxuICAgICAgICBzdWJQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBmaW5kIGFsbCBvZiB0aGUgc3ViIHBsYXllcnMnIGNvcnJlc3BvbmRpbmcgaW5uZXIgYW5pbWF0aW9uIHBsYXllclxuICAgIHN1YlBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gZXZlbiBpZiBhbnkgcGxheWVycyBhcmUgbm90IGZvdW5kIGZvciBhIHN1YiBhbmltYXRpb24gdGhlbiBpdFxuICAgICAgLy8gd2lsbCBzdGlsbCBjb21wbGV0ZSBpdHNlbGYgYWZ0ZXIgdGhlIG5leHQgdGljayBzaW5jZSBpdCdzIE5vb3BcbiAgICAgIGNvbnN0IHBsYXllcnNGb3JFbGVtZW50ID0gc2tpcHBlZFBsYXllcnNNYXAuZ2V0KHBsYXllci5lbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzRm9yRWxlbWVudCAmJiBwbGF5ZXJzRm9yRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnNGb3JFbGVtZW50KTtcbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgYWN0dWFsbHkgcGxheSB0aGUgYW5pbWF0aW9uIGlzXG4gICAgLy8gYmVjYXVzZSBhbGwgdGhhdCBhIHNraXBwZWQgcGxheWVyIGlzIGRlc2lnbmVkIHRvIGRvIGlzIHRvXG4gICAgLy8gZmlyZSB0aGUgc3RhcnQvZG9uZSB0cmFuc2l0aW9uIGNhbGxiYWNrIGV2ZW50c1xuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGlmIChwbGF5ZXIucGFyZW50UGxheWVyKSB7XG4gICAgICAgIHBsYXllci5zeW5jUGxheWVyRXZlbnRzKHBsYXllci5wYXJlbnRQbGF5ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHJ1biB0aHJvdWdoIGFsbCBvZiB0aGUgcXVldWVkIHJlbW92YWxzIGFuZCBzZWUgaWYgdGhleVxuICAgIC8vIHdlcmUgcGlja2VkIHVwIGJ5IGEgcXVlcnkuIElmIG5vdCB0aGVuIHBlcmZvcm0gdGhlIHJlbW92YWxcbiAgICAvLyBvcGVyYXRpb24gcmlnaHQgYXdheSB1bmxlc3MgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIG9uZ29pbmcuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxMZWF2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gYWxsTGVhdmVOb2Rlc1tpXTtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTEVBVkVfQ0xBU1NOQU1FKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGUgZWxlbWVudCBoYXMgYSByZW1vdmFsIGFuaW1hdGlvbiB0aGF0IGlzIGJlaW5nXG4gICAgICAvLyB0YWtlbiBjYXJlIG9mIGFuZCB0aGVyZWZvcmUgdGhlIGlubmVyIGVsZW1lbnRzIHdpbGwgaGFuZyBhcm91bmRcbiAgICAgIC8vIHVudGlsIHRoYXQgYW5pbWF0aW9uIGlzIG92ZXIgKG9yIHRoZSBwYXJlbnQgcXVlcmllZCBhbmltYXRpb24pXG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLmhhc0FuaW1hdGlvbikgY29udGludWU7XG5cbiAgICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGlzIHF1ZXJpZWQgb3IgaWYgaXQgY29udGFpbnMgcXVlcmllZCBjaGlsZHJlblxuICAgICAgLy8gdGhlbiB3ZSB3YW50IGZvciB0aGUgZWxlbWVudCBub3QgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwYWdlXG4gICAgICAvLyB1bnRpbCB0aGUgcXVlcmllZCBhbmltYXRpb25zIGhhdmUgZmluaXNoZWRcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudHMuc2l6ZSkge1xuICAgICAgICBsZXQgcXVlcmllZFBsYXllclJlc3VsdHMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAocXVlcmllZFBsYXllclJlc3VsdHMgJiYgcXVlcmllZFBsYXllclJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJSZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWVyaWVkSW5uZXJFbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcXVlcmllZElubmVyRWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBsZXQgcXVlcmllZFBsYXllcnMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KHF1ZXJpZWRJbm5lckVsZW1lbnRzW2pdKTtcbiAgICAgICAgICBpZiAocXVlcmllZFBsYXllcnMgJiYgcXVlcmllZFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVQbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocCA9PiAhcC5kZXN0cm95ZWQpO1xuICAgICAgaWYgKGFjdGl2ZVBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKHRoaXMsIGVsZW1lbnQsIGFjdGl2ZVBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgc28gdGhlIGNsZWFudXAgbWV0aG9kIGRvZXNuJ3QgcmVtb3ZlIHRoZW1cbiAgICBhbGxMZWF2ZU5vZGVzLmxlbmd0aCA9IDA7XG5cbiAgICByb290UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH0pO1xuICAgICAgcGxheWVyLnBsYXkoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByb290UGxheWVycztcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55KSB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMuc3RhdGVzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudCkgfHwgY29udGFpbnNEYXRhO1xuICB9XG5cbiAgYWZ0ZXJGbHVzaChjYWxsYmFjazogKCkgPT4gYW55KSB7IHRoaXMuX2ZsdXNoRm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHsgdGhpcy5fd2hlblF1aWV0Rm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgZWxlbWVudDogc3RyaW5nLCBpc1F1ZXJpZWRFbGVtZW50OiBib29sZWFuLCBuYW1lc3BhY2VJZD86IHN0cmluZywgdHJpZ2dlck5hbWU/OiBzdHJpbmcsXG4gICAgICB0b1N0YXRlVmFsdWU/OiBhbnkpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgY29uc3QgcXVlcmllZEVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIHBsYXllcnMgPSBxdWVyaWVkRWxlbWVudFBsYXllcnM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgICBjb25zdCBpc1JlbW92YWxBbmltYXRpb24gPSAhdG9TdGF0ZVZhbHVlIHx8IHRvU3RhdGVWYWx1ZSA9PSBWT0lEX1ZBTFVFO1xuICAgICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWlzUmVtb3ZhbEFuaW1hdGlvbiAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgIT0gdHJpZ2dlck5hbWUpIHJldHVybjtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYW1lc3BhY2VJZCB8fCB0cmlnZ2VyTmFtZSkge1xuICAgICAgcGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChuYW1lc3BhY2VJZCAmJiBuYW1lc3BhY2VJZCAhPSBwbGF5ZXIubmFtZXNwYWNlSWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRyaWdnZXJOYW1lICYmIHRyaWdnZXJOYW1lICE9IHBsYXllci50cmlnZ2VyTmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIHByaXZhdGUgX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPikge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2hlbiBhIHJlbW92YWwgYW5pbWF0aW9uIG9jY3VycywgQUxMIHByZXZpb3VzIHBsYXllcnMgYXJlIGNvbGxlY3RlZFxuICAgIC8vIGFuZCBkZXN0cm95ZWQgKGV2ZW4gaWYgdGhleSBhcmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBuYW1lc3BhY2UpXG4gICAgY29uc3QgdGFyZ2V0TmFtZVNwYWNlSWQ6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogbmFtZXNwYWNlSWQ7XG4gICAgY29uc3QgdGFyZ2V0VHJpZ2dlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogdHJpZ2dlck5hbWU7XG5cbiAgICBmb3IgKGNvbnN0IHRpbWVsaW5lSW5zdHJ1Y3Rpb24gb2YgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcGxheWVycyA9IGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKTtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9IHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgICAgICBlbGVtZW50LCBpc1F1ZXJpZWRFbGVtZW50LCB0YXJnZXROYW1lU3BhY2VJZCwgdGFyZ2V0VHJpZ2dlck5hbWUsIGluc3RydWN0aW9uLnRvU3RhdGUpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgY29uc3QgcmVhbFBsYXllciA9IHBsYXllci5nZXRSZWFsUGxheWVyKCkgYXMgYW55O1xuICAgICAgICBpZiAocmVhbFBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgICAgcmVhbFBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgc28gdGhhdCB0aGUgUFJFL1BPU1Qgc3R5bGVzIGNhbiBiZVxuICAgIC8vIGNvbXB1dGVkIHByb3Blcmx5IHdpdGhvdXQgaW50ZXJmZXJpbmcgd2l0aCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uXG4gICAgZXJhc2VTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBbmltYXRpb24oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+LFxuICAgICAgc2tpcHBlZFBsYXllcnNNYXA6IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPiwgcHJlU3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sXG4gICAgICBwb3N0U3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2UgZmlyc3QgcnVuIHRoaXMgc28gdGhhdCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHBsYXllclxuICAgIC8vIGRhdGEgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBzdWNjZXNzaXZlIGFuaW1hdGlvbiBwbGF5ZXJzXG4gICAgY29uc3QgYWxsUXVlcmllZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGFsbENvbnN1bWVkRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxTdWJFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbE5ld1BsYXllcnMgPSBpbnN0cnVjdGlvbi50aW1lbGluZXMubWFwKHRpbWVsaW5lSW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAvLyBGSVhNRSAobWF0c2tvKTogbWFrZSBzdXJlIHRvLWJlLXJlbW92ZWQgYW5pbWF0aW9ucyBhcmUgcmVtb3ZlZCBwcm9wZXJseVxuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMucmVtb3ZlZEJlZm9yZVF1ZXJpZWQpXG4gICAgICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLmR1cmF0aW9uLCB0aW1lbGluZUluc3RydWN0aW9uLmRlbGF5KTtcblxuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICBmbGF0dGVuR3JvdXBQbGF5ZXJzKChhbGxQcmV2aW91c1BsYXllcnNNYXAuZ2V0KGVsZW1lbnQpIHx8IEVNUFRZX1BMQVlFUl9BUlJBWSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHAgPT4gcC5nZXRSZWFsUGxheWVyKCkpKVxuICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBgZWxlbWVudGAgaXMgbm90IGFwYXJ0IG9mIHRoZSBBbmltYXRpb25QbGF5ZXIgZGVmaW5pdGlvbiwgYnV0XG4gICAgICAgICAgICAgICAgLy8gTW9jay9XZWJBbmltYXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBlbGVtZW50IHdpdGhpbiB0aGVpciBpbXBsZW1lbnRhdGlvbi4gVGhpcyB3aWxsIGJlIGFkZGVkIGluIEFuZ3VsYXI1IHRvXG4gICAgICAgICAgICAgICAgLy8gQW5pbWF0aW9uUGxheWVyXG4gICAgICAgICAgICAgICAgY29uc3QgcHAgPSBwIGFzIGFueTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHAuZWxlbWVudCA/IHBwLmVsZW1lbnQgPT09IGVsZW1lbnQgOiBmYWxzZTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHByZVN0eWxlcyA9IHByZVN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBwb3N0U3R5bGVzID0gcG9zdFN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBrZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgICAgICAgdGhpcy5kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIHRpbWVsaW5lSW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBwcmVTdHlsZXMsXG4gICAgICAgICAgcG9zdFN0eWxlcyk7XG4gICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9idWlsZFBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXMsIHByZXZpb3VzUGxheWVycyk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGlzIHBhcnRpY3VsYXIgcGxheWVyIGJlbG9uZ3MgdG8gYSBzdWIgdHJpZ2dlci4gSXQgaXNcbiAgICAgIC8vIGltcG9ydGFudCB0aGF0IHdlIG1hdGNoIHRoaXMgcGxheWVyIHVwIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgKEB0cmlnZ2VyLmxpc3RlbmVyKVxuICAgICAgaWYgKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uc3ViVGltZWxpbmUgJiYgc2tpcHBlZFBsYXllcnNNYXApIHtcbiAgICAgICAgYWxsU3ViRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgICBjb25zdCB3cmFwcGVkUGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIobmFtZXNwYWNlSWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcbiAgICAgICAgd3JhcHBlZFBsYXllci5zZXRSZWFsUGxheWVyKHBsYXllcik7XG4gICAgICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLnB1c2god3JhcHBlZFBsYXllcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfSk7XG5cbiAgICBhbGxRdWVyaWVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGRlbGV0ZU9yVW5zZXRJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgcGxheWVyKSk7XG4gICAgfSk7XG5cbiAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBhZGRDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgY29uc3QgcGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihhbGxOZXdQbGF5ZXJzKTtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHJlbW92ZUNsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICAgIHNldFN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBiYXNpY2FsbHkgbWFrZXMgYWxsIG9mIHRoZSBjYWxsYmFja3MgZm9yIHN1YiBlbGVtZW50IGFuaW1hdGlvbnNcbiAgICAvLyBiZSBkZXBlbmRlbnQgb24gdGhlIHVwcGVyIHBsYXllcnMgZm9yIHdoZW4gdGhleSBmaW5pc2hcbiAgICBhbGxTdWJFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICBlbGVtZW50ID0+IHsgZ2V0T3JTZXRBc0luTWFwKHNraXBwZWRQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpOyB9KTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBpZiAoa2V5ZnJhbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRyaXZlci5hbmltYXRlKFxuICAgICAgICAgIGluc3RydWN0aW9uLmVsZW1lbnQsIGtleWZyYW1lcywgaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgICAgIGluc3RydWN0aW9uLmVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZW1wdHkgdHJhbnNpdGlvbnxkZWZpbml0aW9uIGlzIHByb3ZpZGVkXG4gICAgLy8gLi4uIHRoZXJlIGlzIG5vIHBvaW50IGluIHJlbmRlcmluZyBhbiBlbXB0eSBhbmltYXRpb25cbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3BsYXllcjogQW5pbWF0aW9uUGxheWVyID0gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgcHJpdmF0ZSBfY29udGFpbnNSZWFsUGxheWVyID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcXVldWVkQ2FsbGJhY2tzOiB7W25hbWU6IHN0cmluZ106ICgoKSA9PiBhbnkpW119ID0ge307XG4gIHB1YmxpYyByZWFkb25seSBkZXN0cm95ZWQgPSBmYWxzZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXIgITogQW5pbWF0aW9uUGxheWVyO1xuXG4gIHB1YmxpYyBtYXJrZWRGb3JEZXN0cm95OiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHJlYWRvbmx5IHF1ZXVlZDogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcsIHB1YmxpYyB0cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55KSB7fVxuXG4gIHNldFJlYWxQbGF5ZXIocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbnNSZWFsUGxheWVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgT2JqZWN0LmtleXModGhpcy5fcXVldWVkQ2FsbGJhY2tzKS5mb3JFYWNoKHBoYXNlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrc1twaGFzZV0uZm9yRWFjaChcbiAgICAgICAgICBjYWxsYmFjayA9PiBsaXN0ZW5PblBsYXllcihwbGF5ZXIsIHBoYXNlLCB1bmRlZmluZWQsIGNhbGxiYWNrKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fY29udGFpbnNSZWFsUGxheWVyID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJyaWRlVG90YWxUaW1lKHBsYXllci50b3RhbFRpbWUpO1xuICAgICh0aGlzIGFze3F1ZXVlZDogYm9vbGVhbn0pLnF1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0UmVhbFBsYXllcigpIHsgcmV0dXJuIHRoaXMuX3BsYXllcjsgfVxuXG4gIG92ZXJyaWRlVG90YWxUaW1lKHRvdGFsVGltZTogbnVtYmVyKSB7ICh0aGlzIGFzIGFueSkudG90YWxUaW1lID0gdG90YWxUaW1lOyB9XG5cbiAgc3luY1BsYXllckV2ZW50cyhwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gcC50cmlnZ2VyQ2FsbGJhY2sgISgnc3RhcnQnKSk7XG4gICAgfVxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBwcml2YXRlIF9xdWV1ZUV2ZW50KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fcXVldWVkQ2FsbGJhY2tzLCBuYW1lLCBbXSkucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2RvbmUnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRvbmUoZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnc3RhcnQnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vblN0YXJ0KGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZGVzdHJveScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRGVzdHJveShmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuaW5pdCgpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucXVldWVkID8gZmFsc2UgOiB0aGlzLl9wbGF5ZXIuaGFzU3RhcnRlZCgpOyB9XG5cbiAgcGxheSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wbGF5KCk7IH1cblxuICBwYXVzZSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wYXVzZSgpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5yZXN0YXJ0KCk7IH1cblxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX3BsYXllci5maW5pc2goKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgKHRoaXMgYXN7ZGVzdHJveWVkOiBib29sZWFufSkuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9wbGF5ZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzZXQoKTsgfVxuXG4gIHNldFBvc2l0aW9uKHA6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3BsYXllci5zZXRQb3NpdGlvbihwKTtcbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5xdWV1ZWQgPyAwIDogdGhpcy5fcGxheWVyLmdldFBvc2l0aW9uKCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcC50cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlT3JVbnNldEluTWFwKG1hcDogTWFwPGFueSwgYW55W10+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgbGV0IGN1cnJlbnRWYWx1ZXM6IGFueVtdfG51bGx8dW5kZWZpbmVkO1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgbWFwLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwW2tleV07XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRlbGV0ZSBtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRWYWx1ZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRyaWdnZXJWYWx1ZSh2YWx1ZTogYW55KTogYW55IHtcbiAgLy8gd2UgdXNlIGAhPSBudWxsYCBoZXJlIGJlY2F1c2UgaXQncyB0aGUgbW9zdCBzaW1wbGVcbiAgLy8gd2F5IHRvIHRlc3QgYWdhaW5zdCBhIFwiZmFsc3lcIiB2YWx1ZSB3aXRob3V0IG1peGluZ1xuICAvLyBpbiBlbXB0eSBzdHJpbmdzIG9yIGEgemVybyB2YWx1ZS4gRE8gTk9UIE9QVElNSVpFLlxuICByZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50Tm9kZShub2RlOiBhbnkpIHtcbiAgcmV0dXJuIG5vZGUgJiYgbm9kZVsnbm9kZVR5cGUnXSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNUcmlnZ2VyRXZlbnRWYWxpZChldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZXZlbnROYW1lID09ICdzdGFydCcgfHwgZXZlbnROYW1lID09ICdkb25lJztcbn1cblxuZnVuY3Rpb24gY2xvYWtFbGVtZW50KGVsZW1lbnQ6IGFueSwgdmFsdWU/OiBzdHJpbmcpIHtcbiAgY29uc3Qgb2xkVmFsdWUgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXk7XG4gIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6ICdub25lJztcbiAgcmV0dXJuIG9sZFZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgdmFsdWVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBlbGVtZW50czogU2V0PGFueT4sXG4gICAgZWxlbWVudFByb3BzTWFwOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sIGRlZmF1bHRTdHlsZTogc3RyaW5nKTogYW55W10ge1xuICBjb25zdCBjbG9ha1ZhbHM6IHN0cmluZ1tdID0gW107XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha1ZhbHMucHVzaChjbG9ha0VsZW1lbnQoZWxlbWVudCkpKTtcblxuICBjb25zdCBmYWlsZWRFbGVtZW50czogYW55W10gPSBbXTtcblxuICBlbGVtZW50UHJvcHNNYXAuZm9yRWFjaCgocHJvcHM6IFNldDxzdHJpbmc+LCBlbGVtZW50OiBhbnkpID0+IHtcbiAgICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW3Byb3BdID0gZHJpdmVyLmNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wLCBkZWZhdWx0U3R5bGUpO1xuXG4gICAgICAvLyB0aGVyZSBpcyBubyBlYXN5IHdheSB0byBkZXRlY3QgdGhpcyBiZWNhdXNlIGEgc3ViIGVsZW1lbnQgY291bGQgYmUgcmVtb3ZlZFxuICAgICAgLy8gYnkgYSBwYXJlbnQgYW5pbWF0aW9uIGVsZW1lbnQgYmVpbmcgZGV0YWNoZWQuXG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IE5VTExfUkVNT1ZFRF9RVUVSSUVEX1NUQVRFO1xuICAgICAgICBmYWlsZWRFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhbHVlc01hcC5zZXQoZWxlbWVudCwgc3R5bGVzKTtcbiAgfSk7XG5cbiAgLy8gd2UgdXNlIGEgaW5kZXggdmFyaWFibGUgaGVyZSBzaW5jZSBTZXQuZm9yRWFjaChhLCBpKSBkb2VzIG5vdCByZXR1cm5cbiAgLy8gYW4gaW5kZXggdmFsdWUgZm9yIHRoZSBjbG9zdXJlIChidXQgaW5zdGVhZCBqdXN0IHRoZSB2YWx1ZSlcbiAgbGV0IGkgPSAwO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtFbGVtZW50KGVsZW1lbnQsIGNsb2FrVmFsc1tpKytdKSk7XG5cbiAgcmV0dXJuIGZhaWxlZEVsZW1lbnRzO1xufVxuXG4vKlxuU2luY2UgdGhlIEFuZ3VsYXIgcmVuZGVyZXIgY29kZSB3aWxsIHJldHVybiBhIGNvbGxlY3Rpb24gb2YgaW5zZXJ0ZWRcbm5vZGVzIGluIGFsbCBhcmVhcyBvZiBhIERPTSB0cmVlLCBpdCdzIHVwIHRvIHRoaXMgYWxnb3JpdGhtIHRvIGZpZ3VyZVxub3V0IHdoaWNoIG5vZGVzIGFyZSByb290cyBmb3IgZWFjaCBhbmltYXRpb24gQHRyaWdnZXIuXG5cbkJ5IHBsYWNpbmcgZWFjaCBpbnNlcnRlZCBub2RlIGludG8gYSBTZXQgYW5kIHRyYXZlcnNpbmcgdXB3YXJkcywgaXRcbmlzIHBvc3NpYmxlIHRvIGZpbmQgdGhlIEB0cmlnZ2VyIGVsZW1lbnRzIGFuZCB3ZWxsIGFueSBkaXJlY3QgKnN0YXJcbmluc2VydGlvbiBub2RlcywgaWYgYSBAdHJpZ2dlciByb290IGlzIGZvdW5kIHRoZW4gdGhlIGVudGVyIGVsZW1lbnRcbmlzIHBsYWNlZCBpbnRvIHRoZSBNYXBbQHRyaWdnZXJdIHNwb3QuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUm9vdE1hcChyb290czogYW55W10sIG5vZGVzOiBhbnlbXSk6IE1hcDxhbnksIGFueVtdPiB7XG4gIGNvbnN0IHJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55W10+KCk7XG4gIHJvb3RzLmZvckVhY2gocm9vdCA9PiByb290TWFwLnNldChyb290LCBbXSkpO1xuXG4gIGlmIChub2Rlcy5sZW5ndGggPT0gMCkgcmV0dXJuIHJvb3RNYXA7XG5cbiAgY29uc3QgTlVMTF9OT0RFID0gMTtcbiAgY29uc3Qgbm9kZVNldCA9IG5ldyBTZXQobm9kZXMpO1xuICBjb25zdCBsb2NhbFJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuXG4gIGZ1bmN0aW9uIGdldFJvb3Qobm9kZTogYW55KTogYW55IHtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBOVUxMX05PREU7XG5cbiAgICBsZXQgcm9vdCA9IGxvY2FsUm9vdE1hcC5nZXQobm9kZSk7XG4gICAgaWYgKHJvb3QpIHJldHVybiByb290O1xuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIGlmIChyb290TWFwLmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBAdHJpZ2dlclxuICAgICAgcm9vdCA9IHBhcmVudDtcbiAgICB9IGVsc2UgaWYgKG5vZGVTZXQuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIG5nSWZcbiAgICAgIHJvb3QgPSBOVUxMX05PREU7XG4gICAgfSBlbHNlIHsgIC8vIHJlY3Vyc2UgdXB3YXJkc1xuICAgICAgcm9vdCA9IGdldFJvb3QocGFyZW50KTtcbiAgICB9XG5cbiAgICBsb2NhbFJvb3RNYXAuc2V0KG5vZGUsIHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICBjb25zdCByb290ID0gZ2V0Um9vdChub2RlKTtcbiAgICBpZiAocm9vdCAhPT0gTlVMTF9OT0RFKSB7XG4gICAgICByb290TWFwLmdldChyb290KSAhLnB1c2gobm9kZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcm9vdE1hcDtcbn1cblxuY29uc3QgQ0xBU1NFU19DQUNIRV9LRVkgPSAnJCRjbGFzc2VzJztcbmZ1bmN0aW9uIGNvbnRhaW5zQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjbGFzc2VzID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgcmV0dXJuIGNsYXNzZXMgJiYgY2xhc3Nlc1tjbGFzc05hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFufSA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIGlmICghY2xhc3Nlcykge1xuICAgICAgY2xhc3NlcyA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldID0ge307XG4gICAgfVxuICAgIGNsYXNzZXNbY2xhc3NOYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW59ID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgIGRlbGV0ZSBjbGFzc2VzW2NsYXNzTmFtZV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKFxuICAgIGVuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSwgZWxlbWVudDogYW55LCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiBlbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5Hcm91cFBsYXllcnMocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXJbXSB7XG4gIGNvbnN0IGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICByZXR1cm4gZmluYWxQbGF5ZXJzO1xufVxuXG5mdW5jdGlvbiBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdLCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgaWYgKHBsYXllciBpbnN0YW5jZW9mIEFuaW1hdGlvbkdyb3VwUGxheWVyKSB7XG4gICAgICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllci5wbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaW5hbFBsYXllcnMucHVzaChwbGF5ZXIgYXMgQW5pbWF0aW9uUGxheWVyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gb2JqRXF1YWxzKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBiOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICBjb25zdCBrMSA9IE9iamVjdC5rZXlzKGEpO1xuICBjb25zdCBrMiA9IE9iamVjdC5rZXlzKGIpO1xuICBpZiAoazEubGVuZ3RoICE9IGsyLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGsxLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJvcCA9IGsxW2ldO1xuICAgIGlmICghYi5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBhW3Byb3BdICE9PSBiW3Byb3BdKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUoXG4gICAgZWxlbWVudDogYW55LCBhbGxQcmVTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sXG4gICAgYWxsUG9zdFN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+Pik6IGJvb2xlYW4ge1xuICBjb25zdCBwb3N0RW50cnkgPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmICghcG9zdEVudHJ5KSByZXR1cm4gZmFsc2U7XG5cbiAgbGV0IHByZUVudHJ5ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmIChwcmVFbnRyeSkge1xuICAgIHBvc3RFbnRyeS5mb3JFYWNoKGRhdGEgPT4gcHJlRW50cnkgIS5hZGQoZGF0YSkpO1xuICB9IGVsc2Uge1xuICAgIGFsbFByZVN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHBvc3RFbnRyeSk7XG4gIH1cblxuICBhbGxQb3N0U3R5bGVFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XG4gIHJldHVybiB0cnVlO1xufVxuIl19