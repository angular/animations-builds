/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
     * @private
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
     * @private
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
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionNamespace.prototype._triggers;
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionNamespace.prototype._queue;
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionNamespace.prototype._elementListeners;
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionNamespace.prototype._hostClassName;
    /** @type {?} */
    AnimationTransitionNamespace.prototype.id;
    /** @type {?} */
    AnimationTransitionNamespace.prototype.hostElement;
    /**
     * @type {?}
     * @private
     */
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
     * @private
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
     * @private
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
     * @param {?} isHostElement
     * @param {?} context
     * @return {?}
     */
    removeNode(namespaceId, element, isHostElement, context) {
        if (isElementNode(element)) {
            /** @type {?} */
            const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
            if (ns) {
                ns.removeNode(element, context);
            }
            else {
                this.markElementAsRemoved(namespaceId, element, false, context);
            }
            if (isHostElement) {
                /** @type {?} */
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
    /**
     * @type {?}
     * @private
     */
    TransitionAnimationEngine.prototype._namespaceLookup;
    /**
     * @type {?}
     * @private
     */
    TransitionAnimationEngine.prototype._namespaceList;
    /**
     * @type {?}
     * @private
     */
    TransitionAnimationEngine.prototype._flushFns;
    /**
     * @type {?}
     * @private
     */
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
    /**
     * @type {?}
     * @private
     */
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
     * @private
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
    /**
     * @type {?}
     * @private
     */
    TransitionAnimationPlayer.prototype._player;
    /**
     * @type {?}
     * @private
     */
    TransitionAnimationPlayer.prototype._containsRealPlayer;
    /**
     * @type {?}
     * @private
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBcUMsbUJBQW1CLEVBQUUscUJBQXFCLElBQUksb0JBQW9CLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBTTNMLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBRXJFLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQW1CLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUdyTSxPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7TUFFaEgsZ0JBQWdCLEdBQUcsbUJBQW1COztNQUN0QyxlQUFlLEdBQUcsb0JBQW9COztNQUN0QyxrQkFBa0IsR0FBRyxxQkFBcUI7O01BQzFDLGlCQUFpQixHQUFHLHNCQUFzQjs7TUFDMUMsY0FBYyxHQUFHLGtCQUFrQjs7TUFDbkMsYUFBYSxHQUFHLG1CQUFtQjs7TUFFbkMsa0JBQWtCLEdBQWdDLEVBQUU7O01BQ3BELGtCQUFrQixHQUEwQjtJQUNoRCxXQUFXLEVBQUUsRUFBRTtJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFlBQVksRUFBRSxLQUFLO0lBQ25CLG9CQUFvQixFQUFFLEtBQUs7Q0FDNUI7O01BQ0ssMEJBQTBCLEdBQTBCO0lB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LENBQUM7SUFDbkQsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFPLEtBQUssQ0FBQzs7UUFFekIsUUFBUSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDL0MsSUFBSSxRQUFRLEVBQUU7UUFDWixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQUEsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDakQ7U0FBTTtRQUNMLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0M7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIgYXMgQW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeX0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi4vZHNsL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0VOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FLCBOR19UUklHR0VSX1NFTEVDVE9SLCBjb3B5T2JqLCBlcmFzZVN0eWxlcywgaXRlcmF0b3JUb0FycmF5LCBzZXRTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Z2V0T3JTZXRBc0luTWFwLCBsaXN0ZW5PblBsYXllciwgbWFrZUFuaW1hdGlvbkV2ZW50LCBub3JtYWxpemVLZXlmcmFtZXMsIG9wdGltaXplR3JvdXBQbGF5ZXJ9IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgUVVFVUVEX0NMQVNTTkFNRSA9ICduZy1hbmltYXRlLXF1ZXVlZCc7XG5jb25zdCBRVUVVRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IERJU0FCTEVEX0NMQVNTTkFNRSA9ICduZy1hbmltYXRlLWRpc2FibGVkJztcbmNvbnN0IERJU0FCTEVEX1NFTEVDVE9SID0gJy5uZy1hbmltYXRlLWRpc2FibGVkJztcbmNvbnN0IFNUQVJfQ0xBU1NOQU1FID0gJ25nLXN0YXItaW5zZXJ0ZWQnO1xuY29uc3QgU1RBUl9TRUxFQ1RPUiA9ICcubmctc3Rhci1pbnNlcnRlZCc7XG5cbmNvbnN0IEVNUFRZX1BMQVlFUl9BUlJBWTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5jb25zdCBOVUxMX1JFTU9WQUxfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JSZW1vdmFsOiBmYWxzZSxcbiAgc2V0Rm9yTW92ZTogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBmYWxzZVxufTtcbmNvbnN0IE5VTExfUkVNT1ZFRF9RVUVSSUVEX1NUQVRFOiBFbGVtZW50QW5pbWF0aW9uU3RhdGUgPSB7XG4gIG5hbWVzcGFjZUlkOiAnJyxcbiAgc2V0Rm9yTW92ZTogZmFsc2UsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBoYXNBbmltYXRpb246IGZhbHNlLFxuICByZW1vdmVkQmVmb3JlUXVlcmllZDogdHJ1ZVxufTtcblxuaW50ZXJmYWNlIFRyaWdnZXJMaXN0ZW5lciB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGhhc2U6IHN0cmluZztcbiAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJbnN0cnVjdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgdHJpZ2dlck5hbWU6IHN0cmluZztcbiAgZnJvbVN0YXRlOiBTdGF0ZVZhbHVlO1xuICB0b1N0YXRlOiBTdGF0ZVZhbHVlO1xuICB0cmFuc2l0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeTtcbiAgcGxheWVyOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyO1xuICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IFJFTU9WQUxfRkxBRyA9ICdfX25nX3JlbW92ZWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRBbmltYXRpb25TdGF0ZSB7XG4gIHNldEZvclJlbW92YWw6IGJvb2xlYW47XG4gIHNldEZvck1vdmU6IGJvb2xlYW47XG4gIGhhc0FuaW1hdGlvbjogYm9vbGVhbjtcbiAgbmFtZXNwYWNlSWQ6IHN0cmluZztcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbHVlIHtcbiAgcHVibGljIHZhbHVlOiBzdHJpbmc7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zO1xuXG4gIGdldCBwYXJhbXMoKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5vcHRpb25zLnBhcmFtcyBhc3tba2V5OiBzdHJpbmddOiBhbnl9OyB9XG5cbiAgY29uc3RydWN0b3IoaW5wdXQ6IGFueSwgcHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcgPSAnJykge1xuICAgIGNvbnN0IGlzT2JqID0gaW5wdXQgJiYgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJyk7XG4gICAgY29uc3QgdmFsdWUgPSBpc09iaiA/IGlucHV0Wyd2YWx1ZSddIDogaW5wdXQ7XG4gICAgdGhpcy52YWx1ZSA9IG5vcm1hbGl6ZVRyaWdnZXJWYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKGlzT2JqKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gY29weU9iaihpbnB1dCBhcyBhbnkpO1xuICAgICAgZGVsZXRlIG9wdGlvbnNbJ3ZhbHVlJ107XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIGFzIEFuaW1hdGlvbk9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5wYXJhbXMpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5wYXJhbXMgPSB7fTtcbiAgICB9XG4gIH1cblxuICBhYnNvcmJPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBjb25zdCBuZXdQYXJhbXMgPSBvcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBjb25zdCBvbGRQYXJhbXMgPSB0aGlzLm9wdGlvbnMucGFyYW1zICE7XG4gICAgICBPYmplY3Qua2V5cyhuZXdQYXJhbXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChvbGRQYXJhbXNbcHJvcF0gPT0gbnVsbCkge1xuICAgICAgICAgIG9sZFBhcmFtc1twcm9wXSA9IG5ld1BhcmFtc1twcm9wXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBWT0lEX1ZBTFVFID0gJ3ZvaWQnO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU1RBVEVfVkFMVUUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2Uge1xuICBwdWJsaWMgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgcHJpdmF0ZSBfdHJpZ2dlcnM6IHtbdHJpZ2dlck5hbWU6IHN0cmluZ106IEFuaW1hdGlvblRyaWdnZXJ9ID0ge307XG4gIHByaXZhdGUgX3F1ZXVlOiBRdWV1ZUluc3RydWN0aW9uW10gPSBbXTtcblxuICBwcml2YXRlIF9lbGVtZW50TGlzdGVuZXJzID0gbmV3IE1hcDxhbnksIFRyaWdnZXJMaXN0ZW5lcltdPigpO1xuXG4gIHByaXZhdGUgX2hvc3RDbGFzc05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgaG9zdEVsZW1lbnQ6IGFueSwgcHJpdmF0ZSBfZW5naW5lOiBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lKSB7XG4gICAgdGhpcy5faG9zdENsYXNzTmFtZSA9ICduZy10bnMtJyArIGlkO1xuICAgIGFkZENsYXNzKGhvc3RFbGVtZW50LCB0aGlzLl9ob3N0Q2xhc3NOYW1lKTtcbiAgfVxuXG4gIGxpc3RlbihlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuKTogKCkgPT4gYW55IHtcbiAgICBpZiAoIXRoaXMuX3RyaWdnZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBsaXN0ZW4gb24gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGV2ZW50IFwiJHtcbiAgICAgICAgICBwaGFzZX1cIiBiZWNhdXNlIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBkb2VzblxcJ3QgZXhpc3QhYCk7XG4gICAgfVxuXG4gICAgaWYgKHBoYXNlID09IG51bGwgfHwgcGhhc2UubGVuZ3RoID09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxpc3RlbiBvbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke1xuICAgICAgICAgIG5hbWV9XCIgYmVjYXVzZSB0aGUgcHJvdmlkZWQgZXZlbnQgaXMgdW5kZWZpbmVkIWApO1xuICAgIH1cblxuICAgIGlmICghaXNUcmlnZ2VyRXZlbnRWYWxpZChwaGFzZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB0cmlnZ2VyIGV2ZW50IFwiJHtwaGFzZX1cIiBmb3IgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtcbiAgICAgICAgICBuYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQhYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuZXJzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMsIGVsZW1lbnQsIFtdKTtcbiAgICBjb25zdCBkYXRhID0ge25hbWUsIHBoYXNlLCBjYWxsYmFja307XG4gICAgbGlzdGVuZXJzLnB1c2goZGF0YSk7XG5cbiAgICBjb25zdCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSBnZXRPclNldEFzSW5NYXAodGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudCwgZWxlbWVudCwge30pO1xuICAgIGlmICghdHJpZ2dlcnNXaXRoU3RhdGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSArICctJyArIG5hbWUpO1xuICAgICAgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdID0gREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGlzIHJlbW92ZWQgQUZURVIgdGhlIGZsdXNoIGhhcyBvY2N1cnJlZCBzdWNoXG4gICAgICAvLyB0aGF0IGxlYXZlIGFuaW1hdGlvbnMgY2FsbGJhY2tzIGNhbiBmaXJlIChvdGhlcndpc2UgaWYgdGhlIG5vZGVcbiAgICAgIC8vIGlzIHJlbW92ZWQgaW4gYmV0d2VlbiB0aGVuIHRoZSBsaXN0ZW5lcnMgd291bGQgYmUgZGVyZWdpc3RlcmVkKVxuICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGRhdGEpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl90cmlnZ2Vyc1tuYW1lXSkge1xuICAgICAgICAgIGRlbGV0ZSB0cmlnZ2Vyc1dpdGhTdGF0ZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZWdpc3RlcihuYW1lOiBzdHJpbmcsIGFzdDogQW5pbWF0aW9uVHJpZ2dlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl90cmlnZ2Vyc1tuYW1lXSkge1xuICAgICAgLy8gdGhyb3dcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJpZ2dlcnNbbmFtZV0gPSBhc3Q7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRUcmlnZ2VyKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2Vyc1tuYW1lXTtcbiAgICBpZiAoIXRyaWdnZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGhhcyBub3QgYmVlbiByZWdpc3RlcmVkIWApO1xuICAgIH1cbiAgICByZXR1cm4gdHJpZ2dlcjtcbiAgfVxuXG4gIHRyaWdnZXIoZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBkZWZhdWx0VG9GYWxsYmFjazogYm9vbGVhbiA9IHRydWUpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9nZXRUcmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcih0aGlzLmlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG5cbiAgICBsZXQgdHJpZ2dlcnNXaXRoU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgdHJpZ2dlck5hbWUpO1xuICAgICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5zZXQoZWxlbWVudCwgdHJpZ2dlcnNXaXRoU3RhdGVzID0ge30pO1xuICAgIH1cblxuICAgIGxldCBmcm9tU3RhdGUgPSB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdO1xuICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZSh2YWx1ZSwgdGhpcy5pZCk7XG5cbiAgICBjb25zdCBpc09iaiA9IHZhbHVlICYmIHZhbHVlLmhhc093blByb3BlcnR5KCd2YWx1ZScpO1xuICAgIGlmICghaXNPYmogJiYgZnJvbVN0YXRlKSB7XG4gICAgICB0b1N0YXRlLmFic29yYk9wdGlvbnMoZnJvbVN0YXRlLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV0gPSB0b1N0YXRlO1xuXG4gICAgaWYgKCFmcm9tU3RhdGUpIHtcbiAgICAgIGZyb21TdGF0ZSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgY29uc3QgaXNSZW1vdmFsID0gdG9TdGF0ZS52YWx1ZSA9PT0gVk9JRF9WQUxVRTtcblxuICAgIC8vIG5vcm1hbGx5IHRoaXMgaXNuJ3QgcmVhY2hlZCBieSBoZXJlLCBob3dldmVyLCBpZiBhbiBvYmplY3QgZXhwcmVzc2lvblxuICAgIC8vIGlzIHBhc3NlZCBpbiB0aGVuIGl0IG1heSBiZSBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLiBDb21wYXJpbmcgdGhlIHZhbHVlXG4gICAgLy8gaXMgaW1wb3J0YW50IHNpbmNlIHRoYXQgd2lsbCBzdGF5IHRoZSBzYW1lIGRlc3BpdGUgdGhlcmUgYmVpbmcgYSBuZXcgb2JqZWN0LlxuICAgIC8vIFRoZSByZW1vdmFsIGFyYyBoZXJlIGlzIHNwZWNpYWwgY2FzZWQgYmVjYXVzZSB0aGUgc2FtZSBlbGVtZW50IGlzIHRyaWdnZXJlZFxuICAgIC8vIHR3aWNlIGluIHRoZSBldmVudCB0aGF0IGl0IGNvbnRhaW5zIGFuaW1hdGlvbnMgb24gdGhlIG91dGVyL2lubmVyIHBvcnRpb25zXG4gICAgLy8gb2YgdGhlIGhvc3QgY29udGFpbmVyXG4gICAgaWYgKCFpc1JlbW92YWwgJiYgZnJvbVN0YXRlLnZhbHVlID09PSB0b1N0YXRlLnZhbHVlKSB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgZGVzcGl0ZSB0aGUgdmFsdWUgbm90IGNoYW5naW5nLCBzb21lIGlubmVyIHBhcmFtc1xuICAgICAgLy8gaGF2ZSBjaGFuZ2VkIHdoaWNoIG1lYW5zIHRoYXQgdGhlIGFuaW1hdGlvbiBmaW5hbCBzdHlsZXMgbmVlZCB0byBiZSBhcHBsaWVkXG4gICAgICBpZiAoIW9iakVxdWFscyhmcm9tU3RhdGUucGFyYW1zLCB0b1N0YXRlLnBhcmFtcykpIHtcbiAgICAgICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBmcm9tU3R5bGVzID0gdHJpZ2dlci5tYXRjaFN0eWxlcyhmcm9tU3RhdGUudmFsdWUsIGZyb21TdGF0ZS5wYXJhbXMsIGVycm9ycyk7XG4gICAgICAgIGNvbnN0IHRvU3R5bGVzID0gdHJpZ2dlci5tYXRjaFN0eWxlcyh0b1N0YXRlLnZhbHVlLCB0b1N0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLl9lbmdpbmUucmVwb3J0RXJyb3IoZXJyb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBlcmFzZVN0eWxlcyhlbGVtZW50LCBmcm9tU3R5bGVzKTtcbiAgICAgICAgICAgIHNldFN0eWxlcyhlbGVtZW50LCB0b1N0eWxlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXJzT25FbGVtZW50OiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPVxuICAgICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQsIGVsZW1lbnQsIFtdKTtcbiAgICBwbGF5ZXJzT25FbGVtZW50LmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIC8vIG9ubHkgcmVtb3ZlIHRoZSBwbGF5ZXIgaWYgaXQgaXMgcXVldWVkIG9uIHRoZSBFWEFDVCBzYW1lIHRyaWdnZXIvbmFtZXNwYWNlXG4gICAgICAvLyB3ZSBvbmx5IGFsc28gZGVhbCB3aXRoIHF1ZXVlZCBwbGF5ZXJzIGhlcmUgYmVjYXVzZSBpZiB0aGUgYW5pbWF0aW9uIGhhc1xuICAgICAgLy8gc3RhcnRlZCB0aGVuIHdlIHdhbnQgdG8ga2VlcCB0aGUgcGxheWVyIGFsaXZlIHVudGlsIHRoZSBmbHVzaCBoYXBwZW5zXG4gICAgICAvLyAod2hpY2ggaXMgd2hlcmUgdGhlIHByZXZpb3VzUGxheWVycyBhcmUgcGFzc2VkIGludG8gdGhlIG5ldyBwYWx5ZXIpXG4gICAgICBpZiAocGxheWVyLm5hbWVzcGFjZUlkID09IHRoaXMuaWQgJiYgcGxheWVyLnRyaWdnZXJOYW1lID09IHRyaWdnZXJOYW1lICYmIHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCB0cmFuc2l0aW9uID1cbiAgICAgICAgdHJpZ2dlci5tYXRjaFRyYW5zaXRpb24oZnJvbVN0YXRlLnZhbHVlLCB0b1N0YXRlLnZhbHVlLCBlbGVtZW50LCB0b1N0YXRlLnBhcmFtcyk7XG4gICAgbGV0IGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgaWYgKCF0cmFuc2l0aW9uKSB7XG4gICAgICBpZiAoIWRlZmF1bHRUb0ZhbGxiYWNrKSByZXR1cm47XG4gICAgICB0cmFuc2l0aW9uID0gdHJpZ2dlci5mYWxsYmFja1RyYW5zaXRpb247XG4gICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fZW5naW5lLnRvdGFsUXVldWVkUGxheWVycysrO1xuICAgIHRoaXMuX3F1ZXVlLnB1c2goXG4gICAgICAgIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgdHJhbnNpdGlvbiwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwbGF5ZXIsIGlzRmFsbGJhY2tUcmFuc2l0aW9ufSk7XG5cbiAgICBpZiAoIWlzRmFsbGJhY2tUcmFuc2l0aW9uKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTtcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHsgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgUVVFVUVEX0NMQVNTTkFNRSk7IH0pO1xuICAgIH1cblxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnMpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgcGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgIHBsYXllcnNPbkVsZW1lbnQucHVzaChwbGF5ZXIpO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIGRlcmVnaXN0ZXIobmFtZTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuXG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5mb3JFYWNoKChzdGF0ZU1hcCwgZWxlbWVudCkgPT4geyBkZWxldGUgc3RhdGVNYXBbbmFtZV07IH0pO1xuXG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcnMsIGVsZW1lbnQpID0+IHtcbiAgICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuc2V0KFxuICAgICAgICAgIGVsZW1lbnQsIGxpc3RlbmVycy5maWx0ZXIoZW50cnkgPT4geyByZXR1cm4gZW50cnkubmFtZSAhPSBuYW1lOyB9KSk7XG4gICAgfSk7XG4gIH1cblxuICBjbGVhckVsZW1lbnRDYWNoZShlbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmRlbGV0ZShlbGVtZW50KTtcbiAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgIGVsZW1lbnRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKHJvb3RFbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgLy8gZW11bGF0ZSBhIGxlYXZlIGFuaW1hdGlvbiBmb3IgYWxsIGlubmVyIG5vZGVzIHdpdGhpbiB0aGlzIG5vZGUuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGFuaW1hdGlvbnMgZm91bmQgZm9yIGFueSBvZiB0aGUgbm9kZXMgdGhlbiBjbGVhciB0aGUgY2FjaGVcbiAgICAvLyBmb3IgdGhlIGVsZW1lbnQuXG4gICAgdGhpcy5fZW5naW5lLmRyaXZlci5xdWVyeShyb290RWxlbWVudCwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChlbG0gPT4ge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGFuIGlubmVyIHJlbW92ZSgpIG9wZXJhdGlvbiBoYXMgYWxyZWFkeSBraWNrZWQgb2ZmXG4gICAgICAvLyB0aGUgYW5pbWF0aW9uIG9uIHRoaXMgZWxlbWVudC4uLlxuICAgICAgaWYgKGVsbVtSRU1PVkFMX0ZMQUddKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IG5hbWVzcGFjZXMgPSB0aGlzLl9lbmdpbmUuZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsbSk7XG4gICAgICBpZiAobmFtZXNwYWNlcy5zaXplKSB7XG4gICAgICAgIG5hbWVzcGFjZXMuZm9yRWFjaChucyA9PiBucy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxtLCBjb250ZXh0LCBmYWxzZSwgdHJ1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdHJpZ2dlckxlYXZlQW5pbWF0aW9uKFxuICAgICAgZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGRlc3Ryb3lBZnRlckNvbXBsZXRlPzogYm9vbGVhbixcbiAgICAgIGRlZmF1bHRUb0ZhbGxiYWNrPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRyaWdnZXJTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAodHJpZ2dlclN0YXRlcykge1xuICAgICAgY29uc3QgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgICBPYmplY3Qua2V5cyh0cmlnZ2VyU3RhdGVzKS5mb3JFYWNoKHRyaWdnZXJOYW1lID0+IHtcbiAgICAgICAgLy8gdGhpcyBjaGVjayBpcyBoZXJlIGluIHRoZSBldmVudCB0aGF0IGFuIGVsZW1lbnQgaXMgcmVtb3ZlZFxuICAgICAgICAvLyB0d2ljZSAoYm90aCBvbiB0aGUgaG9zdCBsZXZlbCBhbmQgdGhlIGNvbXBvbmVudCBsZXZlbClcbiAgICAgICAgaWYgKHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXSkge1xuICAgICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMudHJpZ2dlcihlbGVtZW50LCB0cmlnZ2VyTmFtZSwgVk9JRF9WQUxVRSwgZGVmYXVsdFRvRmFsbGJhY2spO1xuICAgICAgICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9lbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgdHJ1ZSwgY29udGV4dCk7XG4gICAgICAgIGlmIChkZXN0cm95QWZ0ZXJDb21wbGV0ZSkge1xuICAgICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHRoaXMuX2VuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGNvbnN0IHZpc2l0ZWRUcmlnZ2VycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGxpc3RlbmVyLm5hbWU7XG4gICAgICAgIGlmICh2aXNpdGVkVHJpZ2dlcnMuaGFzKHRyaWdnZXJOYW1lKSkgcmV0dXJuO1xuICAgICAgICB2aXNpdGVkVHJpZ2dlcnMuYWRkKHRyaWdnZXJOYW1lKTtcblxuICAgICAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdO1xuICAgICAgICBjb25zdCB0cmFuc2l0aW9uID0gdHJpZ2dlci5mYWxsYmFja1RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBmcm9tU3RhdGUgPSBlbGVtZW50U3RhdGVzW3RyaWdnZXJOYW1lXSB8fCBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgICAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgICAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgdHJpZ2dlck5hbWUsXG4gICAgICAgICAgdHJhbnNpdGlvbixcbiAgICAgICAgICBmcm9tU3RhdGUsXG4gICAgICAgICAgdG9TdGF0ZSxcbiAgICAgICAgICBwbGF5ZXIsXG4gICAgICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5fZW5naW5lO1xuXG4gICAgaWYgKGVsZW1lbnQuY2hpbGRFbGVtZW50Q291bnQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKGVsZW1lbnQsIGNvbnRleHQsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhICogPT4gVk9JRCBhbmltYXRpb24gd2FzIGRldGVjdGVkIGFuZCBraWNrZWQgb2ZmXG4gICAgaWYgKHRoaXMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsZW1lbnQsIGNvbnRleHQsIHRydWUpKSByZXR1cm47XG5cbiAgICAvLyBmaW5kIHRoZSBwbGF5ZXIgdGhhdCBpcyBhbmltYXRpbmcgYW5kIG1ha2Ugc3VyZSB0aGF0IHRoZVxuICAgIC8vIHJlbW92YWwgaXMgZGVsYXllZCB1bnRpbCB0aGF0IHBsYXllciBoYXMgY29tcGxldGVkXG4gICAgbGV0IGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmIChlbmdpbmUudG90YWxBbmltYXRpb25zKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGxheWVycyA9XG4gICAgICAgICAgZW5naW5lLnBsYXllcnMubGVuZ3RoID8gZW5naW5lLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KSA6IFtdO1xuXG4gICAgICAvLyB3aGVuIHRoaXMgYGlmIHN0YXRlbWVudGAgZG9lcyBub3QgY29udGludWUgZm9yd2FyZCBpdCBtZWFucyB0aGF0XG4gICAgICAvLyBhIHByZXZpb3VzIGFuaW1hdGlvbiBxdWVyeSBoYXMgc2VsZWN0ZWQgdGhlIGN1cnJlbnQgZWxlbWVudCBhbmRcbiAgICAgIC8vIGlzIGFuaW1hdGluZyBpdC4gSW4gdGhpcyBzaXR1YXRpb24gd2FudCB0byBjb250aW51ZSBmb3J3YXJkcyBhbmRcbiAgICAgIC8vIGFsbG93IHRoZSBlbGVtZW50IHRvIGJlIHF1ZXVlZCB1cCBmb3IgYW5pbWF0aW9uIGxhdGVyLlxuICAgICAgaWYgKGN1cnJlbnRQbGF5ZXJzICYmIGN1cnJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHdoaWxlIChwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQocGFyZW50KTtcbiAgICAgICAgICBpZiAodHJpZ2dlcnMpIHtcbiAgICAgICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHN0YWdlIHdlIGtub3cgdGhhdCB0aGUgZWxlbWVudCB3aWxsIGVpdGhlciBnZXQgcmVtb3ZlZFxuICAgIC8vIGR1cmluZyBmbHVzaCBvciB3aWxsIGJlIHBpY2tlZCB1cCBieSBhIHBhcmVudCBxdWVyeS4gRWl0aGVyIHdheVxuICAgIC8vIHdlIG5lZWQgdG8gZmlyZSB0aGUgbGlzdGVuZXJzIGZvciB0aGlzIGVsZW1lbnQgd2hlbiBpdCBET0VTIGdldFxuICAgIC8vIHJlbW92ZWQgKG9uY2UgdGhlIHF1ZXJ5IHBhcmVudCBhbmltYXRpb24gaXMgZG9uZSBvciBhZnRlciBmbHVzaClcbiAgICB0aGlzLnByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50KTtcblxuICAgIC8vIHdoZXRoZXIgb3Igbm90IGEgcGFyZW50IGhhcyBhbiBhbmltYXRpb24gd2UgbmVlZCB0byBkZWxheSB0aGUgZGVmZXJyYWwgb2YgdGhlIGxlYXZlXG4gICAgLy8gb3BlcmF0aW9uIHVudGlsIHdlIGhhdmUgbW9yZSBpbmZvcm1hdGlvbiAod2hpY2ggd2UgZG8gYWZ0ZXIgZmx1c2goKSBoYXMgYmVlbiBjYWxsZWQpXG4gICAgaWYgKGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbikge1xuICAgICAgZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gd2UgZG8gdGhpcyBhZnRlciB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgIC8vIHRoYXQgdGhlIGNhbGxiYWNrcyBjYW4gYmUgZmlyZWRcbiAgICAgIGVuZ2luZS5hZnRlckZsdXNoKCgpID0+IHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudCkpO1xuICAgICAgZW5naW5lLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICBlbmdpbmUuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGluc2VydE5vZGUoZWxlbWVudDogYW55LCBwYXJlbnQ6IGFueSk6IHZvaWQgeyBhZGRDbGFzcyhlbGVtZW50LCB0aGlzLl9ob3N0Q2xhc3NOYW1lKTsgfVxuXG4gIGRyYWluUXVldWVkVHJhbnNpdGlvbnMobWljcm90YXNrSWQ6IG51bWJlcik6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSB7XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb25zOiBRdWV1ZUluc3RydWN0aW9uW10gPSBbXTtcbiAgICB0aGlzLl9xdWV1ZS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHBsYXllciA9IGVudHJ5LnBsYXllcjtcbiAgICAgIGlmIChwbGF5ZXIuZGVzdHJveWVkKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZWxlbWVudExpc3RlbmVycy5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcjogVHJpZ2dlckxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgaWYgKGxpc3RlbmVyLm5hbWUgPT0gZW50cnkudHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VFdmVudCA9IG1ha2VBbmltYXRpb25FdmVudChcbiAgICAgICAgICAgICAgICBlbGVtZW50LCBlbnRyeS50cmlnZ2VyTmFtZSwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlKTtcbiAgICAgICAgICAgIChiYXNlRXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IG1pY3JvdGFza0lkO1xuICAgICAgICAgICAgbGlzdGVuT25QbGF5ZXIoZW50cnkucGxheWVyLCBsaXN0ZW5lci5waGFzZSwgYmFzZUV2ZW50LCBsaXN0ZW5lci5jYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBsYXllci5tYXJrZWRGb3JEZXN0cm95KSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAvLyBub3cgd2UgY2FuIGRlc3Ryb3kgdGhlIGVsZW1lbnQgcHJvcGVybHkgc2luY2UgdGhlIGV2ZW50IGxpc3RlbmVycyBoYXZlXG4gICAgICAgICAgLy8gYmVlbiBib3VuZCB0byB0aGUgcGxheWVyXG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChlbnRyeSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuXG4gICAgcmV0dXJuIGluc3RydWN0aW9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAvLyBpZiBkZXBDb3VudCA9PSAwIHRoZW0gbW92ZSB0byBmcm9udFxuICAgICAgLy8gb3RoZXJ3aXNlIGlmIGEgY29udGFpbnMgYiB0aGVuIG1vdmUgYmFja1xuICAgICAgY29uc3QgZDAgPSBhLnRyYW5zaXRpb24uYXN0LmRlcENvdW50O1xuICAgICAgY29uc3QgZDEgPSBiLnRyYW5zaXRpb24uYXN0LmRlcENvdW50O1xuICAgICAgaWYgKGQwID09IDAgfHwgZDEgPT0gMCkge1xuICAgICAgICByZXR1cm4gZDAgLSBkMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChhLmVsZW1lbnQsIGIuZWxlbWVudCkgPyAxIDogLTE7XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHAgPT4gcC5kZXN0cm95KCkpO1xuICAgIHRoaXMuX3NpZ25hbFJlbW92YWxGb3JJbm5lclRyaWdnZXJzKHRoaXMuaG9zdEVsZW1lbnQsIGNvbnRleHQpO1xuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zRGF0YShlbGVtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICBsZXQgY29udGFpbnNEYXRhID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGNvbnRhaW5zRGF0YSA9XG4gICAgICAgICh0aGlzLl9xdWV1ZS5maW5kKGVudHJ5ID0+IGVudHJ5LmVsZW1lbnQgPT09IGVsZW1lbnQpID8gdHJ1ZSA6IGZhbHNlKSB8fCBjb250YWluc0RhdGE7XG4gICAgcmV0dXJuIGNvbnRhaW5zRGF0YTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlZFRyYW5zaXRpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb247XG4gIHBsYXllcjogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcjtcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUge1xuICBwdWJsaWMgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gIHB1YmxpYyBuZXdIb3N0RWxlbWVudHMgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgcHVibGljIHBsYXllcnNCeUVsZW1lbnQgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICBwdWJsaWMgcGxheWVyc0J5UXVlcmllZEVsZW1lbnQgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICBwdWJsaWMgc3RhdGVzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIHtbdHJpZ2dlck5hbWU6IHN0cmluZ106IFN0YXRlVmFsdWV9PigpO1xuICBwdWJsaWMgZGlzYWJsZWROb2RlcyA9IG5ldyBTZXQ8YW55PigpO1xuXG4gIHB1YmxpYyB0b3RhbEFuaW1hdGlvbnMgPSAwO1xuICBwdWJsaWMgdG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcblxuICBwcml2YXRlIF9uYW1lc3BhY2VMb29rdXA6IHtbaWQ6IHN0cmluZ106IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2V9ID0ge307XG4gIHByaXZhdGUgX25hbWVzcGFjZUxpc3Q6IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2VbXSA9IFtdO1xuICBwcml2YXRlIF9mbHVzaEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwcml2YXRlIF93aGVuUXVpZXRGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcblxuICBwdWJsaWMgbmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4oKTtcbiAgcHVibGljIGNvbGxlY3RlZEVudGVyRWxlbWVudHM6IGFueVtdID0gW107XG4gIHB1YmxpYyBjb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuXG4gIC8vIHRoaXMgbWV0aG9kIGlzIGRlc2lnbmVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGNvZGUgdGhhdCB1c2VzIHRoaXMgZW5naW5lXG4gIHB1YmxpYyBvblJlbW92YWxDb21wbGV0ZSA9IChlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgPT4ge307XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpIHsgdGhpcy5vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTsgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGJvZHlOb2RlOiBhbnksIHB1YmxpYyBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlcixcbiAgICAgIHByaXZhdGUgX25vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcikge31cblxuICBnZXQgcXVldWVkUGxheWVycygpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIHRoaXMuX25hbWVzcGFjZUxpc3QuZm9yRWFjaChucyA9PiB7XG4gICAgICBucy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IG5zID0gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50LCB0aGlzKTtcbiAgICBpZiAoaG9zdEVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGhvc3RFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVmZXIgdGhpcyBsYXRlciB1bnRpbCBmbHVzaCBkdXJpbmcgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGhhc1xuICAgICAgLy8gYmVlbiBpbnNlcnRlZCBzbyB0aGF0IHdlIGtub3cgZXhhY3RseSB3aGVyZSB0byBwbGFjZSBpdCBpblxuICAgICAgLy8gdGhlIG5hbWVzcGFjZSBsaXN0XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcblxuICAgICAgLy8gZ2l2ZW4gdGhhdCB0aGlzIGhvc3QgZWxlbWVudCBpcyBhcGFydCBvZiB0aGUgYW5pbWF0aW9uIGNvZGUsIGl0XG4gICAgICAvLyBtYXkgb3IgbWF5IG5vdCBiZSBpbnNlcnRlZCBieSBhIHBhcmVudCBub2RlIHRoYXQgaXMgYW4gb2YgYW5cbiAgICAgIC8vIGFuaW1hdGlvbiByZW5kZXJlciB0eXBlLiBJZiB0aGlzIGhhcHBlbnMgdGhlbiB3ZSBjYW4gc3RpbGwgaGF2ZVxuICAgICAgLy8gYWNjZXNzIHRvIHRoaXMgaXRlbSB3aGVuIHdlIHF1ZXJ5IGZvciA6ZW50ZXIgbm9kZXMuIElmIHRoZSBwYXJlbnRcbiAgICAgIC8vIGlzIGEgcmVuZGVyZXIgdGhlbiB0aGUgc2V0IGRhdGEtc3RydWN0dXJlIHdpbGwgbm9ybWFsaXplIHRoZSBlbnRyeVxuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF0gPSBucztcbiAgfVxuXG4gIHByaXZhdGUgX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7XG4gICAgaWYgKGxpbWl0ID49IDApIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaSA9IGxpbWl0OyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBuZXh0TmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChuZXh0TmFtZXNwYWNlLmhvc3RFbGVtZW50LCBob3N0RWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpICsgMSwgMCwgbnMpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZSgwLCAwLCBucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3QucHVzaChucyk7XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAoIW5zKSB7XG4gICAgICBucyA9IHRoaXMuY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyVHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHRyaWdnZXI6IEFuaW1hdGlvblRyaWdnZXIpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmIChucyAmJiBucy5yZWdpc3RlcihuYW1lLCB0cmlnZ2VyKSkge1xuICAgICAgdGhpcy50b3RhbEFuaW1hdGlvbnMrKztcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIGlmICghbmFtZXNwYWNlSWQpIHJldHVybjtcblxuICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZGVsZXRlKG5zLmhvc3RFbGVtZW50KTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9uYW1lc3BhY2VMaXN0LmluZGV4T2YobnMpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoKCkgPT4gbnMuZGVzdHJveShjb250ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIF9mZXRjaE5hbWVzcGFjZShpZDogc3RyaW5nKSB7IHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbaWRdOyB9XG5cbiAgZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsZW1lbnQ6IGFueSk6IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPiB7XG4gICAgLy8gbm9ybWFsbHkgdGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIG5hbWVzcGFjZSBwZXIgZWxlbWVudCwgaG93ZXZlclxuICAgIC8vIGlmIEB0cmlnZ2VycyBhcmUgcGxhY2VkIG9uIGJvdGggdGhlIGNvbXBvbmVudCBlbGVtZW50IGFuZCB0aGVuXG4gICAgLy8gaXRzIGhvc3QgZWxlbWVudCAod2l0aGluIHRoZSBjb21wb25lbnQgY29kZSkgdGhlbiB0aGVyZSB3aWxsIGJlXG4gICAgLy8gdHdvIG5hbWVzcGFjZXMgcmV0dXJuZWQuIFdlIHVzZSBhIHNldCBoZXJlIHRvIHNpbXBseSB0aGUgZGVkdXBlXG4gICAgLy8gb2YgbmFtZXNwYWNlcyBpbmNhc2UgdGhlcmUgYXJlIG11bHRpcGxlIHRyaWdnZXJzIGJvdGggdGhlIGVsbSBhbmQgaG9zdFxuICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFN0YXRlcykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGVsZW1lbnRTdGF0ZXMpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5zSWQgPSBlbGVtZW50U3RhdGVzW2tleXNbaV1dLm5hbWVzcGFjZUlkO1xuICAgICAgICBpZiAobnNJZCkge1xuICAgICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobnNJZCk7XG4gICAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgICBuYW1lc3BhY2VzLmFkZChucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuYW1lc3BhY2VzO1xuICB9XG5cbiAgdHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcbiAgICAgIGlmIChucykge1xuICAgICAgICBucy50cmlnZ2VyKGVsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGluc2VydE5vZGUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBwYXJlbnQ6IGFueSwgaW5zZXJ0QmVmb3JlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCFpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSByZXR1cm47XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGFuZCByZWluc2VydGVkIChtb3ZlIG9wZXJhdGlvbilcbiAgICAvLyB3aGVuIHRoaXMgb2NjdXJzIHdlIGRvIG5vdCB3YW50IHRvIHVzZSB0aGUgZWxlbWVudCBmb3IgZGVsZXRpb24gbGF0ZXJcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCA9IGZhbHNlO1xuICAgICAgZGV0YWlscy5zZXRGb3JNb3ZlID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmluZGV4T2YoZWxlbWVudCk7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB0aGUgbmFtZXNwYWNlSWQgaXMgYmxhbmsgdGhlbiB0aGUgY2FsbGVyXG4gICAgLy8gY29kZSBkb2VzIG5vdCBjb250YWluIGFueSBhbmltYXRpb24gY29kZSBpbiBpdCwgYnV0IGl0IGlzXG4gICAgLy8ganVzdCBiZWluZyBjYWxsZWQgc28gdGhhdCB0aGUgbm9kZSBpcyBtYXJrZWQgYXMgYmVpbmcgaW5zZXJ0ZWRcbiAgICBpZiAobmFtZXNwYWNlSWQpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuICAgICAgLy8gVGhpcyBpZi1zdGF0ZW1lbnQgaXMgYSB3b3JrYXJvdW5kIGZvciByb3V0ZXIgaXNzdWUgIzIxOTQ3LlxuICAgICAgLy8gVGhlIHJvdXRlciBzb21ldGltZXMgaGl0cyBhIHJhY2UgY29uZGl0aW9uIHdoZXJlIHdoaWxlIGEgcm91dGVcbiAgICAgIC8vIGlzIGJlaW5nIGluc3RhbnRpYXRlZCBhIG5ldyBuYXZpZ2F0aW9uIGFycml2ZXMsIHRyaWdnZXJpbmcgbGVhdmVcbiAgICAgIC8vIGFuaW1hdGlvbiBvZiBET00gdGhhdCBoYXMgbm90IGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIHVudGlsIHRoaXNcbiAgICAgIC8vIGlzIHJlc29sdmVkLCB3ZSBuZWVkIHRvIGhhbmRsZSB0aGUgc2NlbmFyaW8gd2hlbiBET00gaXMgbm90IGluIGFcbiAgICAgIC8vIGNvbnNpc3RlbnQgc3RhdGUgZHVyaW5nIHRoZSBhbmltYXRpb24uXG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMuaW5zZXJ0Tm9kZShlbGVtZW50LCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG9ubHkgKmRpcmVjdGl2ZXMgYW5kIGhvc3QgZWxlbWVudHMgYXJlIGluc2VydGVkIGJlZm9yZVxuICAgIGlmIChpbnNlcnRCZWZvcmUpIHtcbiAgICAgIHRoaXMuY29sbGVjdEVudGVyRWxlbWVudChlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBjb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQ6IGFueSkgeyB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMucHVzaChlbGVtZW50KTsgfVxuXG4gIG1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50OiBhbnksIHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5kZWxldGUoZWxlbWVudCk7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBpc0hvc3RFbGVtZW50OiBib29sZWFuLCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgY29uc3QgbnMgPSBuYW1lc3BhY2VJZCA/IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKSA6IG51bGw7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMucmVtb3ZlTm9kZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSG9zdEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaG9zdE5TID0gdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmIChob3N0TlMgJiYgaG9zdE5TLmlkICE9PSBuYW1lc3BhY2VJZCkge1xuICAgICAgICAgIGhvc3ROUy5yZW1vdmVOb2RlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaGFzQW5pbWF0aW9uPzogYm9vbGVhbiwgY29udGV4dD86IGFueSkge1xuICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IHtcbiAgICAgIG5hbWVzcGFjZUlkLFxuICAgICAgc2V0Rm9yUmVtb3ZhbDogY29udGV4dCwgaGFzQW5pbWF0aW9uLFxuICAgICAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuKTogKCkgPT4gYW55IHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKS5saXN0ZW4oZWxlbWVudCwgbmFtZSwgcGhhc2UsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9O1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRJbnN0cnVjdGlvbihcbiAgICAgIGVudHJ5OiBRdWV1ZUluc3RydWN0aW9uLCBzdWJUaW1lbGluZXM6IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgICAgIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHNraXBCdWlsZEFzdD86IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gZW50cnkudHJhbnNpdGlvbi5idWlsZChcbiAgICAgICAgdGhpcy5kcml2ZXIsIGVudHJ5LmVsZW1lbnQsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSwgZW50ZXJDbGFzc05hbWUsXG4gICAgICAgIGxlYXZlQ2xhc3NOYW1lLCBlbnRyeS5mcm9tU3RhdGUub3B0aW9ucywgZW50cnkudG9TdGF0ZS5vcHRpb25zLCBzdWJUaW1lbGluZXMsIHNraXBCdWlsZEFzdCk7XG4gIH1cblxuICBkZXN0cm95SW5uZXJBbmltYXRpb25zKGNvbnRhaW5lckVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB0aGlzLmRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50KSk7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5zaXplID09IDApIHJldHVybjtcblxuICAgIGVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoY29udGFpbmVyRWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5maW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQpKTtcbiAgfVxuXG4gIGRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHNldCBmb3IgZGVzdHJ1Y3Rpb24sIGJ1dCBoYXNuJ3Qgc3RhcnRlZC5cbiAgICAgICAgLy8gaW4gdGhpcyBzaXR1YXRpb24gd2Ugd2FudCB0byBkZWxheSB0aGUgZGVzdHJ1Y3Rpb24gdW50aWwgdGhlIGZsdXNoIG9jY3Vyc1xuICAgICAgICAvLyBzbyB0aGF0IGFueSBldmVudCBsaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhlIHBsYXllciBhcmUgdHJpZ2dlcmVkLlxuICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkge1xuICAgICAgICAgIHBsYXllci5tYXJrZWRGb3JEZXN0cm95ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZmluaXNoKCkpO1xuICAgIH1cbiAgfVxuXG4gIHdoZW5SZW5kZXJpbmdEb25lKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9wdGltaXplR3JvdXBQbGF5ZXIodGhpcy5wbGF5ZXJzKS5vbkRvbmUoKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICAvLyB0aGlzIHdpbGwgcHJldmVudCBpdCBmcm9tIHJlbW92aW5nIGl0IHR3aWNlXG4gICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WQUxfU1RBVEU7XG4gICAgICBpZiAoZGV0YWlscy5uYW1lc3BhY2VJZCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UoZGV0YWlscy5uYW1lc3BhY2VJZCk7XG4gICAgICAgIGlmIChucykge1xuICAgICAgICAgIG5zLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBkZXRhaWxzLnNldEZvclJlbW92YWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRyaXZlci5tYXRjaGVzRWxlbWVudChlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUikpIHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKG5vZGUsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZsdXNoKG1pY3JvdGFza0lkOiBudW1iZXIgPSAtMSkge1xuICAgIGxldCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmICh0aGlzLm5ld0hvc3RFbGVtZW50cy5zaXplKSB7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5mb3JFYWNoKChucywgZWxlbWVudCkgPT4gdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGVsZW1lbnQpKTtcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudG90YWxBbmltYXRpb25zICYmIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsbSA9IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50c1tpXTtcbiAgICAgICAgYWRkQ2xhc3MoZWxtLCBTVEFSX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoICYmXG4gICAgICAgICh0aGlzLnRvdGFsUXVldWVkUGxheWVycyB8fCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoKSkge1xuICAgICAgY29uc3QgY2xlYW51cEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGxheWVycyA9IHRoaXMuX2ZsdXNoQW5pbWF0aW9ucyhjbGVhbnVwRm5zLCBtaWNyb3Rhc2tJZCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsZWFudXBGbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjbGVhbnVwRm5zW2ldKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50c1tpXTtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9mbHVzaEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX2ZsdXNoRm5zID0gW107XG5cbiAgICBpZiAodGhpcy5fd2hlblF1aWV0Rm5zLmxlbmd0aCkge1xuICAgICAgLy8gd2UgbW92ZSB0aGVzZSBvdmVyIHRvIGEgdmFyaWFibGUgc28gdGhhdFxuICAgICAgLy8gaWYgYW55IG5ldyBjYWxsYmFja3MgYXJlIHJlZ2lzdGVyZWQgaW4gYW5vdGhlclxuICAgICAgLy8gZmx1c2ggdGhleSBkbyBub3QgcG9wdWxhdGUgdGhlIGV4aXN0aW5nIHNldFxuICAgICAgY29uc3QgcXVpZXRGbnMgPSB0aGlzLl93aGVuUXVpZXRGbnM7XG4gICAgICB0aGlzLl93aGVuUXVpZXRGbnMgPSBbXTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHsgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTsgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcG9ydEVycm9yKGVycm9yczogc3RyaW5nW10pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gcHJvY2VzcyBhbmltYXRpb25zIGR1ZSB0byB0aGUgZm9sbG93aW5nIGZhaWxlZCB0cmlnZ2VyIHRyYW5zaXRpb25zXFxuICR7XG4gICAgICAgICAgICBlcnJvcnMuam9pbignXFxuJyl9YCk7XG4gIH1cblxuICBwcml2YXRlIF9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZuczogRnVuY3Rpb25bXSwgbWljcm90YXNrSWQ6IG51bWJlcik6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHN1YlRpbWVsaW5lcyA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgcXVldWVkSW5zdHJ1Y3Rpb25zOiBRdWV1ZWRUcmFuc2l0aW9uW10gPSBbXTtcbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IGFsbFByZVN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG4gICAgY29uc3QgYWxsUG9zdFN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG5cbiAgICBjb25zdCBkaXNhYmxlZEVsZW1lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gICAgdGhpcy5kaXNhYmxlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2RlKTtcbiAgICAgIGNvbnN0IG5vZGVzVGhhdEFyZURpc2FibGVkID0gdGhpcy5kcml2ZXIucXVlcnkobm9kZSwgUVVFVUVEX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUaGF0QXJlRGlzYWJsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZXNUaGF0QXJlRGlzYWJsZWRbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgYm9keU5vZGUgPSB0aGlzLmJvZHlOb2RlO1xuICAgIGNvbnN0IGFsbFRyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5zdGF0ZXNCeUVsZW1lbnQua2V5cygpKTtcbiAgICBjb25zdCBlbnRlck5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMpO1xuXG4gICAgLy8gdGhpcyBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBidWlsdCBiZWxvdyBzdWNoIHRoYXRcbiAgICAvLyB0aGUgOmVudGVyIHF1ZXJpZXMgbWF0Y2ggdGhlIGVsZW1lbnRzIChzaW5jZSB0aGUgdGltZWxpbmUgcXVlcmllc1xuICAgIC8vIGFyZSBmaXJlZCBkdXJpbmcgaW5zdHJ1Y3Rpb24gYnVpbGRpbmcpLlxuICAgIGNvbnN0IGVudGVyTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gRU5URVJfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgZW50ZXJOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsTGVhdmVOb2RlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBtZXJnZWRMZWF2ZU5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zID0gbmV3IFNldDxhbnk+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgICBhbGxMZWF2ZU5vZGVzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZGV0YWlscy5oYXNBbmltYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBTVEFSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbG0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVhdmVOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCBBcnJheS5mcm9tKG1lcmdlZExlYXZlTm9kZXMpKTtcbiAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IExFQVZFX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGxlYXZlTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNsZWFudXBGbnMucHVzaCgoKSA9PiB7XG4gICAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChyb290KSAhO1xuICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgICB9KTtcblxuICAgICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbExlYXZlTm9kZXMuZm9yRWFjaChlbGVtZW50ID0+IHsgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpOyB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGVycm9uZW91c1RyYW5zaXRpb25zOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICBucy5kcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkKS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgICAgYWxsUGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgICAgICAgaWYgKHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgICAgICAvLyBtb3ZlIGFuaW1hdGlvbnMgYXJlIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLi4uXG4gICAgICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JNb3ZlKSB7XG4gICAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGVJc09ycGhhbmVkID0gIWJvZHlOb2RlIHx8ICF0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQoYm9keU5vZGUsIGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBsZWF2ZUNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgZW50ZXJDbGFzc05hbWUgPSBlbnRlck5vZGVNYXBJZHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gdGhpcy5fYnVpbGRJbnN0cnVjdGlvbihcbiAgICAgICAgICAgIGVudHJ5LCBzdWJUaW1lbGluZXMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgbm9kZUlzT3JwaGFuZWQpICE7XG4gICAgICAgIGlmIChpbnN0cnVjdGlvbi5lcnJvcnMgJiYgaW5zdHJ1Y3Rpb24uZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLnB1c2goaW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGV2ZW4gdGhvdWdoIHRoZSBlbGVtZW50IG1heSBub3QgYmUgYXBhcnQgb2YgdGhlIERPTSwgaXQgbWF5XG4gICAgICAgIC8vIHN0aWxsIGJlIGFkZGVkIGF0IGEgbGF0ZXIgcG9pbnQgKGR1ZSB0byB0aGUgbWVjaGFuaWNzIG9mIGNvbnRlbnRcbiAgICAgICAgLy8gcHJvamVjdGlvbiBhbmQvb3IgZHluYW1pYyBjb21wb25lbnQgaW5zZXJ0aW9uKSB0aGVyZWZvcmUgaXQnc1xuICAgICAgICAvLyBpbXBvcnRhbnQgd2Ugc3RpbGwgc3R5bGUgdGhlIGVsZW1lbnQuXG4gICAgICAgIGlmIChub2RlSXNPcnBoYW5lZCkge1xuICAgICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhIHVubWF0Y2hlZCB0cmFuc2l0aW9uIGlzIHF1ZXVlZCB0byBnbyB0aGVuIGl0IFNIT1VMRCBOT1QgcmVuZGVyXG4gICAgICAgIC8vIGFuIGFuaW1hdGlvbiBhbmQgY2FuY2VsIHRoZSBwcmV2aW91c2x5IHJ1bm5pbmcgYW5pbWF0aW9ucy5cbiAgICAgICAgaWYgKGVudHJ5LmlzRmFsbGJhY2tUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBpZiBhIHBhcmVudCBhbmltYXRpb24gdXNlcyB0aGlzIGFuaW1hdGlvbiBhcyBhIHN1YiB0cmlnZ2VyXG4gICAgICAgIC8vIHRoZW4gaXQgd2lsbCBpbnN0cnVjdCB0aGUgdGltZWxpbmUgYnVpbGRlciB0byBub3QgYWRkIGEgcGxheWVyIGRlbGF5LCBidXRcbiAgICAgICAgLy8gaW5zdGVhZCBzdHJldGNoIHRoZSBmaXJzdCBrZXlmcmFtZSBnYXAgdXAgdW50aWwgdGhlIGFuaW1hdGlvbiBzdGFydHMuIFRoZVxuICAgICAgICAvLyByZWFzb24gdGhpcyBpcyBpbXBvcnRhbnQgaXMgdG8gcHJldmVudCBleHRyYSBpbml0aWFsaXphdGlvbiBzdHlsZXMgZnJvbSBiZWluZ1xuICAgICAgICAvLyByZXF1aXJlZCBieSB0aGUgdXNlciBpbiB0aGUgYW5pbWF0aW9uLlxuICAgICAgICBpbnN0cnVjdGlvbi50aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB0bC5zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSA9IHRydWUpO1xuXG4gICAgICAgIHN1YlRpbWVsaW5lcy5hcHBlbmQoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKTtcblxuICAgICAgICBjb25zdCB0dXBsZSA9IHtpbnN0cnVjdGlvbiwgcGxheWVyLCBlbGVtZW50fTtcblxuICAgICAgICBxdWV1ZWRJbnN0cnVjdGlvbnMucHVzaCh0dXBsZSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucXVlcmllZEVsZW1lbnRzLmZvckVhY2goXG4gICAgICAgICAgICBlbGVtZW50ID0+IGdldE9yU2V0QXNJbk1hcChxdWVyaWVkRWxlbWVudHMsIGVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcikpO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnByZVN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgICAgIGlmICghc2V0VmFsKSB7XG4gICAgICAgICAgICAgIGFsbFByZVN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHNldFZhbCA9IG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBzZXRWYWwuYWRkKHByb3ApKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnBvc3RTdHlsZVByb3BzLmZvckVhY2goKHN0cmluZ01hcCwgZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoc3RyaW5nTWFwKTtcbiAgICAgICAgICBsZXQgc2V0VmFsOiBTZXQ8c3RyaW5nPiA9IGFsbFBvc3RTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICAgIGlmICghc2V0VmFsKSB7XG4gICAgICAgICAgICBhbGxQb3N0U3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9uZW91c1RyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgZXJyb25lb3VzVHJhbnNpdGlvbnMuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICAgIGVycm9ycy5wdXNoKGBAJHtpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZX0gaGFzIGZhaWxlZCBkdWUgdG86XFxuYCk7XG4gICAgICAgIGluc3RydWN0aW9uLmVycm9ycyAhLmZvckVhY2goZXJyb3IgPT4gZXJyb3JzLnB1c2goYC0gJHtlcnJvcn1cXG5gKSk7XG4gICAgICB9KTtcblxuICAgICAgYWxsUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoZXJyb3JzKTtcbiAgICB9XG5cbiAgICBjb25zdCBhbGxQcmV2aW91c1BsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIC8vIHRoaXMgbWFwIHdvcmtzIHRvIHRlbGwgd2hpY2ggZWxlbWVudCBpbiB0aGUgRE9NIHRyZWUgaXMgY29udGFpbmVkIGJ5XG4gICAgLy8gd2hpY2ggYW5pbWF0aW9uLiBGdXJ0aGVyIGRvd24gYmVsb3cgdGhpcyBtYXAgd2lsbCBnZXQgcG9wdWxhdGVkIG9uY2VcbiAgICAvLyB0aGUgcGxheWVycyBhcmUgYnVpbHQgYW5kIGluIGRvaW5nIHNvIGl0IGNhbiBlZmZpY2llbnRseSBmaWd1cmUgb3V0XG4gICAgLy8gaWYgYSBzdWIgcGxheWVyIGlzIHNraXBwZWQgZHVlIHRvIGEgcGFyZW50IHBsYXllciBoYXZpbmcgcHJpb3JpdHkuXG4gICAgY29uc3QgYW5pbWF0aW9uRWxlbWVudE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBpZiAoc3ViVGltZWxpbmVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBhbmltYXRpb25FbGVtZW50TWFwLnNldChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgdGhpcy5fYmVmb3JlQW5pbWF0aW9uQnVpbGQoXG4gICAgICAgICAgICBlbnRyeS5wbGF5ZXIubmFtZXNwYWNlSWQsIGVudHJ5Lmluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHBsYXllci5lbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoZWxlbWVudCwgZmFsc2UsIHBsYXllci5uYW1lc3BhY2VJZCwgcGxheWVyLnRyaWdnZXJOYW1lLCBudWxsKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHByZXZQbGF5ZXIgPT4ge1xuICAgICAgICBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwcmV2UGxheWVyKTtcbiAgICAgICAgcHJldlBsYXllci5kZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkIChlaXRoZXIgYnkpXG4gICAgLy8gaGF2aW5nIHRoZWlyIG93biBsZWF2ZSBhbmltYXRpb25zIG9yIGJ5IGJlaW5nIHF1ZXJpZWQgaW4gYSBjb250YWluZXJcbiAgICAvLyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBvbmNlIGEgcGFyZW50IGFuaW1hdGlvbiBpcyBjb21wbGV0ZS4gVGhlIGlkZWFcbiAgICAvLyBoZXJlIGlzIHRoYXQgKiBzdHlsZXMgbXVzdCBiZSBpZGVudGljYWwgdG8gISBzdHlsZXMgYmVjYXVzZSBvZlxuICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5ICgqIGlzIGFsc28gZmlsbGVkIGluIGJ5IGRlZmF1bHQgaW4gbWFueSBwbGFjZXMpLlxuICAgIC8vIE90aGVyd2lzZSAqIHN0eWxlcyB3aWxsIHJldHVybiBhbiBlbXB0eSB2YWx1ZSBvciBhdXRvIHNpbmNlIHRoZSBlbGVtZW50XG4gICAgLy8gdGhhdCBpcyBiZWluZyBnZXRDb21wdXRlZFN0eWxlJ2Qgd2lsbCBub3QgYmUgdmlzaWJsZSAoc2luY2UgKiA9IGRlc3RpbmF0aW9uKVxuICAgIGNvbnN0IHJlcGxhY2VOb2RlcyA9IGFsbExlYXZlTm9kZXMuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gUE9TVCBTVEFHRTogZmlsbCB0aGUgKiBzdHlsZXNcbiAgICBjb25zdCBwb3N0U3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGNvbnN0IGFsbExlYXZlUXVlcmllZE5vZGVzID0gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICBwb3N0U3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLCBhbGxQb3N0U3R5bGVFbGVtZW50cywgQVVUT19TVFlMRSk7XG5cbiAgICBhbGxMZWF2ZVF1ZXJpZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgaWYgKHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpKSB7XG4gICAgICAgIHJlcGxhY2VOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUFJFIFNUQUdFOiBmaWxsIHRoZSAhIHN0eWxlc1xuICAgIGNvbnN0IHByZVN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgICBwcmVTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBuZXcgU2V0KG5vZGVzKSwgYWxsUHJlU3R5bGVFbGVtZW50cywgUFJFX1NUWUxFKTtcbiAgICB9KTtcblxuICAgIHJlcGxhY2VOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgY29uc3QgcG9zdCA9IHBvc3RTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgY29uc3QgcHJlID0gcHJlU3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIHBvc3RTdHlsZXNNYXAuc2V0KG5vZGUsIHsgLi4ucG9zdCwgLi4ucHJlIH0gYXMgYW55KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJvb3RQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBzdWJQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQgPSB7fTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCB7ZWxlbWVudCwgcGxheWVyLCBpbnN0cnVjdGlvbn0gPSBlbnRyeTtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBpdCB3YXMgbmV2ZXIgY29uc3VtZWQgYnkgYSBwYXJlbnQgYW5pbWF0aW9uIHdoaWNoXG4gICAgICAvLyBtZWFucyB0aGF0IGl0IGlzIGluZGVwZW5kZW50IGFuZCB0aGVyZWZvcmUgc2hvdWxkIGJlIHNldCBmb3IgYW5pbWF0aW9uXG4gICAgICBpZiAoc3ViVGltZWxpbmVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBpZiAoZGlzYWJsZWRFbGVtZW50c1NldC5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgcGxheWVyLm92ZXJyaWRlVG90YWxUaW1lKGluc3RydWN0aW9uLnRvdGFsVGltZSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgd2lsbCBmbG93IHVwIHRoZSBET00gYW5kIHF1ZXJ5IHRoZSBtYXAgdG8gZmlndXJlIG91dFxuICAgICAgICAvLyBpZiBhIHBhcmVudCBhbmltYXRpb24gaGFzIHByaW9yaXR5IG92ZXIgaXQuIEluIHRoZSBzaXR1YXRpb25cbiAgICAgICAgLy8gdGhhdCBhIHBhcmVudCBpcyBkZXRlY3RlZCB0aGVuIGl0IHdpbGwgY2FuY2VsIHRoZSBsb29wLiBJZlxuICAgICAgICAvLyBub3RoaW5nIGlzIGRldGVjdGVkLCBvciBpdCB0YWtlcyBhIGZldyBob3BzIHRvIGZpbmQgYSBwYXJlbnQsXG4gICAgICAgIC8vIHRoZW4gaXQgd2lsbCBmaWxsIGluIHRoZSBtaXNzaW5nIG5vZGVzIGFuZCBzaWduYWwgdGhlbSBhcyBoYXZpbmdcbiAgICAgICAgLy8gYSBkZXRlY3RlZCBwYXJlbnQgKG9yIGEgTk9fUEFSRU5UIHZhbHVlIHZpYSBhIHNwZWNpYWwgY29uc3RhbnQpLlxuICAgICAgICBsZXQgcGFyZW50V2l0aEFuaW1hdGlvbjogYW55ID0gTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEO1xuICAgICAgICBpZiAoYW5pbWF0aW9uRWxlbWVudE1hcC5zaXplID4gMSkge1xuICAgICAgICAgIGxldCBlbG0gPSBlbGVtZW50O1xuICAgICAgICAgIGNvbnN0IHBhcmVudHNUb0FkZDogYW55W10gPSBbXTtcbiAgICAgICAgICB3aGlsZSAoZWxtID0gZWxtLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGVkUGFyZW50ID0gYW5pbWF0aW9uRWxlbWVudE1hcC5nZXQoZWxtKTtcbiAgICAgICAgICAgIGlmIChkZXRlY3RlZFBhcmVudCkge1xuICAgICAgICAgICAgICBwYXJlbnRXaXRoQW5pbWF0aW9uID0gZGV0ZWN0ZWRQYXJlbnQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50c1RvQWRkLnB1c2goZWxtKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50c1RvQWRkLmZvckVhY2gocGFyZW50ID0+IGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KHBhcmVudCwgcGFyZW50V2l0aEFuaW1hdGlvbikpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSB0aGlzLl9idWlsZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHBsYXllci5uYW1lc3BhY2VJZCwgaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCwgc2tpcHBlZFBsYXllcnNNYXAsIHByZVN0eWxlc01hcCxcbiAgICAgICAgICAgIHBvc3RTdHlsZXNNYXApO1xuXG4gICAgICAgIHBsYXllci5zZXRSZWFsUGxheWVyKGlubmVyUGxheWVyKTtcblxuICAgICAgICBpZiAocGFyZW50V2l0aEFuaW1hdGlvbiA9PT0gTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEKSB7XG4gICAgICAgICAgcm9vdFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHBhcmVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KHBhcmVudFdpdGhBbmltYXRpb24pO1xuICAgICAgICAgIGlmIChwYXJlbnRQbGF5ZXJzICYmIHBhcmVudFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXIucGFyZW50UGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihwYXJlbnRQbGF5ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKTtcbiAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgLy8gdGhlcmUgc3RpbGwgbWlnaHQgYmUgYSBhbmNlc3RvciBwbGF5ZXIgYW5pbWF0aW5nIHRoaXNcbiAgICAgICAgLy8gZWxlbWVudCB0aGVyZWZvcmUgd2Ugd2lsbCBzdGlsbCBhZGQgaXQgYXMgYSBzdWIgcGxheWVyXG4gICAgICAgIC8vIGV2ZW4gaWYgaXRzIGFuaW1hdGlvbiBtYXkgYmUgZGlzYWJsZWRcbiAgICAgICAgc3ViUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZmluZCBhbGwgb2YgdGhlIHN1YiBwbGF5ZXJzJyBjb3JyZXNwb25kaW5nIGlubmVyIGFuaW1hdGlvbiBwbGF5ZXJcbiAgICBzdWJQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIC8vIGV2ZW4gaWYgYW55IHBsYXllcnMgYXJlIG5vdCBmb3VuZCBmb3IgYSBzdWIgYW5pbWF0aW9uIHRoZW4gaXRcbiAgICAgIC8vIHdpbGwgc3RpbGwgY29tcGxldGUgaXRzZWxmIGFmdGVyIHRoZSBuZXh0IHRpY2sgc2luY2UgaXQncyBOb29wXG4gICAgICBjb25zdCBwbGF5ZXJzRm9yRWxlbWVudCA9IHNraXBwZWRQbGF5ZXJzTWFwLmdldChwbGF5ZXIuZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVyc0ZvckVsZW1lbnQgJiYgcGxheWVyc0ZvckVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGlubmVyUGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzRm9yRWxlbWVudCk7XG4gICAgICAgIHBsYXllci5zZXRSZWFsUGxheWVyKGlubmVyUGxheWVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHRoZSByZWFzb24gd2h5IHdlIGRvbid0IGFjdHVhbGx5IHBsYXkgdGhlIGFuaW1hdGlvbiBpc1xuICAgIC8vIGJlY2F1c2UgYWxsIHRoYXQgYSBza2lwcGVkIHBsYXllciBpcyBkZXNpZ25lZCB0byBkbyBpcyB0b1xuICAgIC8vIGZpcmUgdGhlIHN0YXJ0L2RvbmUgdHJhbnNpdGlvbiBjYWxsYmFjayBldmVudHNcbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBpZiAocGxheWVyLnBhcmVudFBsYXllcikge1xuICAgICAgICBwbGF5ZXIuc3luY1BsYXllckV2ZW50cyhwbGF5ZXIucGFyZW50UGxheWVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBydW4gdGhyb3VnaCBhbGwgb2YgdGhlIHF1ZXVlZCByZW1vdmFscyBhbmQgc2VlIGlmIHRoZXlcbiAgICAvLyB3ZXJlIHBpY2tlZCB1cCBieSBhIHF1ZXJ5LiBJZiBub3QgdGhlbiBwZXJmb3JtIHRoZSByZW1vdmFsXG4gICAgLy8gb3BlcmF0aW9uIHJpZ2h0IGF3YXkgdW5sZXNzIGEgcGFyZW50IGFuaW1hdGlvbiBpcyBvbmdvaW5nLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsTGVhdmVOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGFsbExlYXZlTm9kZXNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIExFQVZFX0NMQVNTTkFNRSk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhlIGVsZW1lbnQgaGFzIGEgcmVtb3ZhbCBhbmltYXRpb24gdGhhdCBpcyBiZWluZ1xuICAgICAgLy8gdGFrZW4gY2FyZSBvZiBhbmQgdGhlcmVmb3JlIHRoZSBpbm5lciBlbGVtZW50cyB3aWxsIGhhbmcgYXJvdW5kXG4gICAgICAvLyB1bnRpbCB0aGF0IGFuaW1hdGlvbiBpcyBvdmVyIChvciB0aGUgcGFyZW50IHF1ZXJpZWQgYW5pbWF0aW9uKVxuICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5oYXNBbmltYXRpb24pIGNvbnRpbnVlO1xuXG4gICAgICBsZXQgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgICAgIC8vIGlmIHRoaXMgZWxlbWVudCBpcyBxdWVyaWVkIG9yIGlmIGl0IGNvbnRhaW5zIHF1ZXJpZWQgY2hpbGRyZW5cbiAgICAgIC8vIHRoZW4gd2Ugd2FudCBmb3IgdGhlIGVsZW1lbnQgbm90IHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgcGFnZVxuICAgICAgLy8gdW50aWwgdGhlIHF1ZXJpZWQgYW5pbWF0aW9ucyBoYXZlIGZpbmlzaGVkXG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRzLnNpemUpIHtcbiAgICAgICAgbGV0IHF1ZXJpZWRQbGF5ZXJSZXN1bHRzID0gcXVlcmllZEVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgICAgICAgaWYgKHF1ZXJpZWRQbGF5ZXJSZXN1bHRzICYmIHF1ZXJpZWRQbGF5ZXJSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIHBsYXllcnMucHVzaCguLi5xdWVyaWVkUGxheWVyUmVzdWx0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcXVlcmllZElubmVyRWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIHRydWUpO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHF1ZXJpZWRJbm5lckVsZW1lbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgbGV0IHF1ZXJpZWRQbGF5ZXJzID0gcXVlcmllZEVsZW1lbnRzLmdldChxdWVyaWVkSW5uZXJFbGVtZW50c1tqXSk7XG4gICAgICAgICAgaWYgKHF1ZXJpZWRQbGF5ZXJzICYmIHF1ZXJpZWRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWN0aXZlUGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHAgPT4gIXAuZGVzdHJveWVkKTtcbiAgICAgIGlmIChhY3RpdmVQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICByZW1vdmVOb2Rlc0FmdGVyQW5pbWF0aW9uRG9uZSh0aGlzLCBlbGVtZW50LCBhY3RpdmVQbGF5ZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIHJlcXVpcmVkIHNvIHRoZSBjbGVhbnVwIG1ldGhvZCBkb2Vzbid0IHJlbW92ZSB0aGVtXG4gICAgYWxsTGVhdmVOb2Rlcy5sZW5ndGggPSAwO1xuXG4gICAgcm9vdFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9KTtcbiAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcm9vdFBsYXllcnM7XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNEYXRhKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBjb250YWluc0RhdGEgPSBmYWxzZTtcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMucGxheWVyc0J5RWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnN0YXRlc0J5RWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKS5lbGVtZW50Q29udGFpbnNEYXRhKGVsZW1lbnQpIHx8IGNvbnRhaW5zRGF0YTtcbiAgfVxuXG4gIGFmdGVyRmx1c2goY2FsbGJhY2s6ICgpID0+IGFueSkgeyB0aGlzLl9mbHVzaEZucy5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIGFmdGVyRmx1c2hBbmltYXRpb25zRG9uZShjYWxsYmFjazogKCkgPT4gYW55KSB7IHRoaXMuX3doZW5RdWlldEZucy5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIHByaXZhdGUgX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgIGVsZW1lbnQ6IHN0cmluZywgaXNRdWVyaWVkRWxlbWVudDogYm9vbGVhbiwgbmFtZXNwYWNlSWQ/OiBzdHJpbmcsIHRyaWdnZXJOYW1lPzogc3RyaW5nLFxuICAgICAgdG9TdGF0ZVZhbHVlPzogYW55KTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBsZXQgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50UGxheWVycykge1xuICAgICAgICBwbGF5ZXJzID0gcXVlcmllZEVsZW1lbnRQbGF5ZXJzO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgICAgY29uc3QgaXNSZW1vdmFsQW5pbWF0aW9uID0gIXRvU3RhdGVWYWx1ZSB8fCB0b1N0YXRlVmFsdWUgPT0gVk9JRF9WQUxVRTtcbiAgICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSByZXR1cm47XG4gICAgICAgICAgaWYgKCFpc1JlbW92YWxBbmltYXRpb24gJiYgcGxheWVyLnRyaWdnZXJOYW1lICE9IHRyaWdnZXJOYW1lKSByZXR1cm47XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZXNwYWNlSWQgfHwgdHJpZ2dlck5hbWUpIHtcbiAgICAgIHBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAobmFtZXNwYWNlSWQgJiYgbmFtZXNwYWNlSWQgIT0gcGxheWVyLm5hbWVzcGFjZUlkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0cmlnZ2VyTmFtZSAmJiB0cmlnZ2VyTmFtZSAhPSBwbGF5ZXIudHJpZ2dlck5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBwcml2YXRlIF9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sXG4gICAgICBhbGxQcmV2aW91c1BsYXllcnNNYXA6IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4pIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdoZW4gYSByZW1vdmFsIGFuaW1hdGlvbiBvY2N1cnMsIEFMTCBwcmV2aW91cyBwbGF5ZXJzIGFyZSBjb2xsZWN0ZWRcbiAgICAvLyBhbmQgZGVzdHJveWVkIChldmVuIGlmIHRoZXkgYXJlIG91dHNpZGUgb2YgdGhlIGN1cnJlbnQgbmFtZXNwYWNlKVxuICAgIGNvbnN0IHRhcmdldE5hbWVTcGFjZUlkOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZUlkO1xuICAgIGNvbnN0IHRhcmdldFRyaWdnZXJOYW1lOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IHRyaWdnZXJOYW1lO1xuXG4gICAgZm9yIChjb25zdCB0aW1lbGluZUluc3RydWN0aW9uIG9mIGluc3RydWN0aW9uLnRpbWVsaW5lcykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHBsYXllcnMgPSBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSk7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPSB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoXG4gICAgICAgICAgZWxlbWVudCwgaXNRdWVyaWVkRWxlbWVudCwgdGFyZ2V0TmFtZVNwYWNlSWQsIHRhcmdldFRyaWdnZXJOYW1lLCBpbnN0cnVjdGlvbi50b1N0YXRlKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWxQbGF5ZXIgPSBwbGF5ZXIuZ2V0UmVhbFBsYXllcigpIGFzIGFueTtcbiAgICAgICAgaWYgKHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSkge1xuICAgICAgICAgIHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBuZWVkcyB0byBiZSBkb25lIHNvIHRoYXQgdGhlIFBSRS9QT1NUIHN0eWxlcyBjYW4gYmVcbiAgICAvLyBjb21wdXRlZCBwcm9wZXJseSB3aXRob3V0IGludGVyZmVyaW5nIHdpdGggdGhlIHByZXZpb3VzIGFuaW1hdGlvblxuICAgIGVyYXNlU3R5bGVzKHJvb3RFbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPixcbiAgICAgIHNraXBwZWRQbGF5ZXJzTWFwOiBNYXA8YW55LCBBbmltYXRpb25QbGF5ZXJbXT4sIHByZVN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LFxuICAgICAgcG9zdFN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+KTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdlIGZpcnN0IHJ1biB0aGlzIHNvIHRoYXQgdGhlIHByZXZpb3VzIGFuaW1hdGlvbiBwbGF5ZXJcbiAgICAvLyBkYXRhIGNhbiBiZSBwYXNzZWQgaW50byB0aGUgc3VjY2Vzc2l2ZSBhbmltYXRpb24gcGxheWVyc1xuICAgIGNvbnN0IGFsbFF1ZXJpZWRQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBhbGxDb25zdW1lZEVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgYWxsU3ViRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxOZXdQbGF5ZXJzID0gaW5zdHJ1Y3Rpb24udGltZWxpbmVzLm1hcCh0aW1lbGluZUluc3RydWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aW1lbGluZUluc3RydWN0aW9uLmVsZW1lbnQ7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgLy8gRklYTUUgKG1hdHNrbyk6IG1ha2Ugc3VyZSB0by1iZS1yZW1vdmVkIGFuaW1hdGlvbnMgYXJlIHJlbW92ZWQgcHJvcGVybHlcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR107XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnJlbW92ZWRCZWZvcmVRdWVyaWVkKVxuICAgICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbi5kdXJhdGlvbiwgdGltZWxpbmVJbnN0cnVjdGlvbi5kZWxheSk7XG5cbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9XG4gICAgICAgICAgZmxhdHRlbkdyb3VwUGxheWVycygoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLmdldChlbGVtZW50KSB8fCBFTVBUWV9QTEFZRVJfQVJSQVkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwID0+IHAuZ2V0UmVhbFBsYXllcigpKSlcbiAgICAgICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgYGVsZW1lbnRgIGlzIG5vdCBhcGFydCBvZiB0aGUgQW5pbWF0aW9uUGxheWVyIGRlZmluaXRpb24sIGJ1dFxuICAgICAgICAgICAgICAgIC8vIE1vY2svV2ViQW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgZWxlbWVudCB3aXRoaW4gdGhlaXIgaW1wbGVtZW50YXRpb24uIFRoaXMgd2lsbCBiZSBhZGRlZCBpbiBBbmd1bGFyNSB0b1xuICAgICAgICAgICAgICAgIC8vIEFuaW1hdGlvblBsYXllclxuICAgICAgICAgICAgICAgIGNvbnN0IHBwID0gcCBhcyBhbnk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBwLmVsZW1lbnQgPyBwcC5lbGVtZW50ID09PSBlbGVtZW50IDogZmFsc2U7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwcmVTdHlsZXMgPSBwcmVTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3QgcG9zdFN0eWxlcyA9IHBvc3RTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3Qga2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgICAgICAgIHRoaXMuZHJpdmVyLCB0aGlzLl9ub3JtYWxpemVyLCBlbGVtZW50LCB0aW1lbGluZUluc3RydWN0aW9uLmtleWZyYW1lcywgcHJlU3R5bGVzLFxuICAgICAgICAgIHBvc3RTdHlsZXMpO1xuICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5fYnVpbGRQbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzLCBwcmV2aW91c1BsYXllcnMpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhpcyBwYXJ0aWN1bGFyIHBsYXllciBiZWxvbmdzIHRvIGEgc3ViIHRyaWdnZXIuIEl0IGlzXG4gICAgICAvLyBpbXBvcnRhbnQgdGhhdCB3ZSBtYXRjaCB0aGlzIHBsYXllciB1cCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIChAdHJpZ2dlci5saXN0ZW5lcilcbiAgICAgIGlmICh0aW1lbGluZUluc3RydWN0aW9uLnN1YlRpbWVsaW5lICYmIHNraXBwZWRQbGF5ZXJzTWFwKSB7XG4gICAgICAgIGFsbFN1YkVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZFBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKG5hbWVzcGFjZUlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG4gICAgICAgIHdyYXBwZWRQbGF5ZXIuc2V0UmVhbFBsYXllcihwbGF5ZXIpO1xuICAgICAgICBhbGxRdWVyaWVkUGxheWVycy5wdXNoKHdyYXBwZWRQbGF5ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH0pO1xuXG4gICAgYWxsUXVlcmllZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQsIHBsYXllci5lbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiBkZWxldGVPclVuc2V0SW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIHBsYXllcikpO1xuICAgIH0pO1xuXG4gICAgYWxsQ29uc3VtZWRFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gYWRkQ2xhc3MoZWxlbWVudCwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSkpO1xuICAgIGNvbnN0IHBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIoYWxsTmV3UGxheWVycyk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiByZW1vdmVDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgICBzZXRTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgYmFzaWNhbGx5IG1ha2VzIGFsbCBvZiB0aGUgY2FsbGJhY2tzIGZvciBzdWIgZWxlbWVudCBhbmltYXRpb25zXG4gICAgLy8gYmUgZGVwZW5kZW50IG9uIHRoZSB1cHBlciBwbGF5ZXJzIGZvciB3aGVuIHRoZXkgZmluaXNoXG4gICAgYWxsU3ViRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgZWxlbWVudCA9PiB7IGdldE9yU2V0QXNJbk1hcChza2lwcGVkUGxheWVyc01hcCwgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKTsgfSk7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRQbGF5ZXIoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgaWYgKGtleWZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5kcml2ZXIuYW5pbWF0ZShcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lbGVtZW50LCBrZXlmcmFtZXMsIGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSxcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVtcHR5IHRyYW5zaXRpb258ZGVmaW5pdGlvbiBpcyBwcm92aWRlZFxuICAgIC8vIC4uLiB0aGVyZSBpcyBubyBwb2ludCBpbiByZW5kZXJpbmcgYW4gZW1wdHkgYW5pbWF0aW9uXG4gICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9wbGF5ZXI6IEFuaW1hdGlvblBsYXllciA9IG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gIHByaXZhdGUgX2NvbnRhaW5zUmVhbFBsYXllciA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3F1ZXVlZENhbGxiYWNrczoge1tuYW1lOiBzdHJpbmddOiAoKCkgPT4gYW55KVtdfSA9IHt9O1xuICBwdWJsaWMgcmVhZG9ubHkgZGVzdHJveWVkID0gZmFsc2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwdWJsaWMgcGFyZW50UGxheWVyICE6IEFuaW1hdGlvblBsYXllcjtcblxuICBwdWJsaWMgbWFya2VkRm9yRGVzdHJveTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgZGlzYWJsZWQgPSBmYWxzZTtcblxuICByZWFkb25seSBxdWV1ZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICBwdWJsaWMgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lc3BhY2VJZDogc3RyaW5nLCBwdWJsaWMgdHJpZ2dlck5hbWU6IHN0cmluZywgcHVibGljIGVsZW1lbnQ6IGFueSkge31cblxuICBzZXRSZWFsUGxheWVyKHBsYXllcjogQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5zUmVhbFBsYXllcikgcmV0dXJuO1xuXG4gICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3F1ZXVlZENhbGxiYWNrcykuZm9yRWFjaChwaGFzZSA9PiB7XG4gICAgICB0aGlzLl9xdWV1ZWRDYWxsYmFja3NbcGhhc2VdLmZvckVhY2goXG4gICAgICAgICAgY2FsbGJhY2sgPT4gbGlzdGVuT25QbGF5ZXIocGxheWVyLCBwaGFzZSwgdW5kZWZpbmVkLCBjYWxsYmFjaykpO1xuICAgIH0pO1xuICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuX2NvbnRhaW5zUmVhbFBsYXllciA9IHRydWU7XG4gICAgdGhpcy5vdmVycmlkZVRvdGFsVGltZShwbGF5ZXIudG90YWxUaW1lKTtcbiAgICAodGhpcyBhc3txdWV1ZWQ6IGJvb2xlYW59KS5xdWV1ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldFJlYWxQbGF5ZXIoKSB7IHJldHVybiB0aGlzLl9wbGF5ZXI7IH1cblxuICBvdmVycmlkZVRvdGFsVGltZSh0b3RhbFRpbWU6IG51bWJlcikgeyAodGhpcyBhcyBhbnkpLnRvdGFsVGltZSA9IHRvdGFsVGltZTsgfVxuXG4gIHN5bmNQbGF5ZXJFdmVudHMocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGxheWVyIGFzIGFueTtcbiAgICBpZiAocC50cmlnZ2VyQ2FsbGJhY2spIHtcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHAudHJpZ2dlckNhbGxiYWNrICEoJ3N0YXJ0JykpO1xuICAgIH1cbiAgICBwbGF5ZXIub25Eb25lKCgpID0+IHRoaXMuZmluaXNoKCkpO1xuICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gdGhpcy5kZXN0cm95KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVldWVFdmVudChuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogdm9pZCB7XG4gICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX3F1ZXVlZENhbGxiYWNrcywgbmFtZSwgW10pLnB1c2goY2FsbGJhY2spO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9xdWV1ZUV2ZW50KCdkb25lJywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25Eb25lKGZuKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ3N0YXJ0JywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25TdGFydChmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2Rlc3Ryb3knLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRlc3Ryb3koZm4pO1xuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHsgdGhpcy5fcGxheWVyLmluaXQoKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnF1ZXVlZCA/IGZhbHNlIDogdGhpcy5fcGxheWVyLmhhc1N0YXJ0ZWQoKTsgfVxuXG4gIHBsYXkoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucGxheSgpOyB9XG5cbiAgcGF1c2UoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucGF1c2UoKTsgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzdGFydCgpOyB9XG5cbiAgZmluaXNoKCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuZmluaXNoKCk7IH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICh0aGlzIGFze2Rlc3Ryb3llZDogYm9vbGVhbn0pLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fcGxheWVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQgeyAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnJlc2V0KCk7IH1cblxuICBzZXRQb3NpdGlvbihwOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9wbGF5ZXIuc2V0UG9zaXRpb24ocCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucXVldWVkID8gMCA6IHRoaXMuX3BsYXllci5nZXRQb3NpdGlvbigpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGxheWVyIGFzIGFueTtcbiAgICBpZiAocC50cmlnZ2VyQ2FsbGJhY2spIHtcbiAgICAgIHAudHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZU9yVW5zZXRJbk1hcChtYXA6IE1hcDxhbnksIGFueVtdPnwge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCB2YWx1ZTogYW55KSB7XG4gIGxldCBjdXJyZW50VmFsdWVzOiBhbnlbXXxudWxsfHVuZGVmaW5lZDtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIG1hcC5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcFtrZXldO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBkZWxldGUgbWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXJyZW50VmFsdWVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUcmlnZ2VyVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG4gIC8vIHdlIHVzZSBgIT0gbnVsbGAgaGVyZSBiZWNhdXNlIGl0J3MgdGhlIG1vc3Qgc2ltcGxlXG4gIC8vIHdheSB0byB0ZXN0IGFnYWluc3QgYSBcImZhbHN5XCIgdmFsdWUgd2l0aG91dCBtaXhpbmdcbiAgLy8gaW4gZW1wdHkgc3RyaW5ncyBvciBhIHplcm8gdmFsdWUuIERPIE5PVCBPUFRJTUlaRS5cbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudE5vZGUobm9kZTogYW55KSB7XG4gIHJldHVybiBub2RlICYmIG5vZGVbJ25vZGVUeXBlJ10gPT09IDE7XG59XG5cbmZ1bmN0aW9uIGlzVHJpZ2dlckV2ZW50VmFsaWQoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGV2ZW50TmFtZSA9PSAnc3RhcnQnIHx8IGV2ZW50TmFtZSA9PSAnZG9uZSc7XG59XG5cbmZ1bmN0aW9uIGNsb2FrRWxlbWVudChlbGVtZW50OiBhbnksIHZhbHVlPzogc3RyaW5nKSB7XG4gIGNvbnN0IG9sZFZhbHVlID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5O1xuICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiAnbm9uZSc7XG4gIHJldHVybiBvbGRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgIHZhbHVlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LCBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgZWxlbWVudHM6IFNldDxhbnk+LFxuICAgIGVsZW1lbnRQcm9wc01hcDogTWFwPGFueSwgU2V0PHN0cmluZz4+LCBkZWZhdWx0U3R5bGU6IHN0cmluZyk6IGFueVtdIHtcbiAgY29uc3QgY2xvYWtWYWxzOiBzdHJpbmdbXSA9IFtdO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtWYWxzLnB1c2goY2xvYWtFbGVtZW50KGVsZW1lbnQpKSk7XG5cbiAgY29uc3QgZmFpbGVkRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgZWxlbWVudFByb3BzTWFwLmZvckVhY2goKHByb3BzOiBTZXQ8c3RyaW5nPiwgZWxlbWVudDogYW55KSA9PiB7XG4gICAgY29uc3Qgc3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHN0eWxlc1twcm9wXSA9IGRyaXZlci5jb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCwgZGVmYXVsdFN0eWxlKTtcblxuICAgICAgLy8gdGhlcmUgaXMgbm8gZWFzeSB3YXkgdG8gZGV0ZWN0IHRoaXMgYmVjYXVzZSBhIHN1YiBlbGVtZW50IGNvdWxkIGJlIHJlbW92ZWRcbiAgICAgIC8vIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiBlbGVtZW50IGJlaW5nIGRldGFjaGVkLlxuICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTtcbiAgICAgICAgZmFpbGVkRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YWx1ZXNNYXAuc2V0KGVsZW1lbnQsIHN0eWxlcyk7XG4gIH0pO1xuXG4gIC8vIHdlIHVzZSBhIGluZGV4IHZhcmlhYmxlIGhlcmUgc2luY2UgU2V0LmZvckVhY2goYSwgaSkgZG9lcyBub3QgcmV0dXJuXG4gIC8vIGFuIGluZGV4IHZhbHVlIGZvciB0aGUgY2xvc3VyZSAoYnV0IGluc3RlYWQganVzdCB0aGUgdmFsdWUpXG4gIGxldCBpID0gMDtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrRWxlbWVudChlbGVtZW50LCBjbG9ha1ZhbHNbaSsrXSkpO1xuXG4gIHJldHVybiBmYWlsZWRFbGVtZW50cztcbn1cblxuLypcblNpbmNlIHRoZSBBbmd1bGFyIHJlbmRlcmVyIGNvZGUgd2lsbCByZXR1cm4gYSBjb2xsZWN0aW9uIG9mIGluc2VydGVkXG5ub2RlcyBpbiBhbGwgYXJlYXMgb2YgYSBET00gdHJlZSwgaXQncyB1cCB0byB0aGlzIGFsZ29yaXRobSB0byBmaWd1cmVcbm91dCB3aGljaCBub2RlcyBhcmUgcm9vdHMgZm9yIGVhY2ggYW5pbWF0aW9uIEB0cmlnZ2VyLlxuXG5CeSBwbGFjaW5nIGVhY2ggaW5zZXJ0ZWQgbm9kZSBpbnRvIGEgU2V0IGFuZCB0cmF2ZXJzaW5nIHVwd2FyZHMsIGl0XG5pcyBwb3NzaWJsZSB0byBmaW5kIHRoZSBAdHJpZ2dlciBlbGVtZW50cyBhbmQgd2VsbCBhbnkgZGlyZWN0ICpzdGFyXG5pbnNlcnRpb24gbm9kZXMsIGlmIGEgQHRyaWdnZXIgcm9vdCBpcyBmb3VuZCB0aGVuIHRoZSBlbnRlciBlbGVtZW50XG5pcyBwbGFjZWQgaW50byB0aGUgTWFwW0B0cmlnZ2VyXSBzcG90LlxuICovXG5mdW5jdGlvbiBidWlsZFJvb3RNYXAocm9vdHM6IGFueVtdLCBub2RlczogYW55W10pOiBNYXA8YW55LCBhbnlbXT4ge1xuICBjb25zdCByb290TWFwID0gbmV3IE1hcDxhbnksIGFueVtdPigpO1xuICByb290cy5mb3JFYWNoKHJvb3QgPT4gcm9vdE1hcC5zZXQocm9vdCwgW10pKTtcblxuICBpZiAobm9kZXMubGVuZ3RoID09IDApIHJldHVybiByb290TWFwO1xuXG4gIGNvbnN0IE5VTExfTk9ERSA9IDE7XG4gIGNvbnN0IG5vZGVTZXQgPSBuZXcgU2V0KG5vZGVzKTtcbiAgY29uc3QgbG9jYWxSb290TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcblxuICBmdW5jdGlvbiBnZXRSb290KG5vZGU6IGFueSk6IGFueSB7XG4gICAgaWYgKCFub2RlKSByZXR1cm4gTlVMTF9OT0RFO1xuXG4gICAgbGV0IHJvb3QgPSBsb2NhbFJvb3RNYXAuZ2V0KG5vZGUpO1xuICAgIGlmIChyb290KSByZXR1cm4gcm9vdDtcblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICBpZiAocm9vdE1hcC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgQHRyaWdnZXJcbiAgICAgIHJvb3QgPSBwYXJlbnQ7XG4gICAgfSBlbHNlIGlmIChub2RlU2V0LmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBuZ0lmXG4gICAgICByb290ID0gTlVMTF9OT0RFO1xuICAgIH0gZWxzZSB7ICAvLyByZWN1cnNlIHVwd2FyZHNcbiAgICAgIHJvb3QgPSBnZXRSb290KHBhcmVudCk7XG4gICAgfVxuXG4gICAgbG9jYWxSb290TWFwLnNldChub2RlLCByb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGdldFJvb3Qobm9kZSk7XG4gICAgaWYgKHJvb3QgIT09IE5VTExfTk9ERSkge1xuICAgICAgcm9vdE1hcC5nZXQocm9vdCkgIS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJvb3RNYXA7XG59XG5cbmNvbnN0IENMQVNTRVNfQ0FDSEVfS0VZID0gJyQkY2xhc3Nlcyc7XG5mdW5jdGlvbiBjb250YWluc0NsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2xhc3NlcyA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIHJldHVybiBjbGFzc2VzICYmIGNsYXNzZXNbY2xhc3NOYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjbGFzc2VzOiB7W2NsYXNzTmFtZTogc3RyaW5nXTogYm9vbGVhbn0gPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICBpZiAoIWNsYXNzZXMpIHtcbiAgICAgIGNsYXNzZXMgPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXSA9IHt9O1xuICAgIH1cbiAgICBjbGFzc2VzW2NsYXNzTmFtZV0gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFufSA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICBkZWxldGUgY2xhc3Nlc1tjbGFzc05hbWVdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVOb2Rlc0FmdGVyQW5pbWF0aW9uRG9uZShcbiAgICBlbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUsIGVsZW1lbnQ6IGFueSwgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuR3JvdXBQbGF5ZXJzKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyW10ge1xuICBjb25zdCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW107XG4gIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgcmV0dXJuIGZpbmFsUGxheWVycztcbn1cblxuZnVuY3Rpb24gX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSwgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBBbmltYXRpb25Hcm91cFBsYXllcikge1xuICAgICAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXIucGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmluYWxQbGF5ZXJzLnB1c2gocGxheWVyIGFzIEFuaW1hdGlvblBsYXllcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9iakVxdWFscyhhOiB7W2tleTogc3RyaW5nXTogYW55fSwgYjoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgY29uc3QgazEgPSBPYmplY3Qua2V5cyhhKTtcbiAgY29uc3QgazIgPSBPYmplY3Qua2V5cyhiKTtcbiAgaWYgKGsxLmxlbmd0aCAhPSBrMi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrMS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByb3AgPSBrMVtpXTtcbiAgICBpZiAoIWIuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgYVtwcm9wXSAhPT0gYltwcm9wXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKFxuICAgIGVsZW1lbnQ6IGFueSwgYWxsUHJlU3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+LFxuICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4pOiBib29sZWFuIHtcbiAgY29uc3QgcG9zdEVudHJ5ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAoIXBvc3RFbnRyeSkgcmV0dXJuIGZhbHNlO1xuXG4gIGxldCBwcmVFbnRyeSA9IGFsbFByZVN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAocHJlRW50cnkpIHtcbiAgICBwb3N0RW50cnkuZm9yRWFjaChkYXRhID0+IHByZUVudHJ5ICEuYWRkKGRhdGEpKTtcbiAgfSBlbHNlIHtcbiAgICBhbGxQcmVTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBwb3N0RW50cnkpO1xuICB9XG5cbiAgYWxsUG9zdFN0eWxlRWxlbWVudHMuZGVsZXRlKGVsZW1lbnQpO1xuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==