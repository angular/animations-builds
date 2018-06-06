import * as tslib_1 from "tslib";
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
var QUEUED_CLASSNAME = 'ng-animate-queued';
var QUEUED_SELECTOR = '.ng-animate-queued';
var DISABLED_CLASSNAME = 'ng-animate-disabled';
var DISABLED_SELECTOR = '.ng-animate-disabled';
var STAR_CLASSNAME = 'ng-star-inserted';
var STAR_SELECTOR = '.ng-star-inserted';
var EMPTY_PLAYER_ARRAY = [];
var NULL_REMOVAL_STATE = {
    namespaceId: '',
    setForRemoval: false,
    setForMove: false,
    hasAnimation: false,
    removedBeforeQueried: false
};
var NULL_REMOVED_QUERIED_STATE = {
    namespaceId: '',
    setForMove: false,
    setForRemoval: false,
    hasAnimation: false,
    removedBeforeQueried: true
};
export var REMOVAL_FLAG = '__ng_removed';
var StateValue = /** @class */ (function () {
    function StateValue(input, namespaceId) {
        if (namespaceId === void 0) { namespaceId = ''; }
        this.namespaceId = namespaceId;
        var isObj = input && input.hasOwnProperty('value');
        var value = isObj ? input['value'] : input;
        this.value = normalizeTriggerValue(value);
        if (isObj) {
            var options = copyObj(input);
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
    Object.defineProperty(StateValue.prototype, "params", {
        get: function () { return this.options.params; },
        enumerable: true,
        configurable: true
    });
    StateValue.prototype.absorbOptions = function (options) {
        var newParams = options.params;
        if (newParams) {
            var oldParams_1 = this.options.params;
            Object.keys(newParams).forEach(function (prop) {
                if (oldParams_1[prop] == null) {
                    oldParams_1[prop] = newParams[prop];
                }
            });
        }
    };
    return StateValue;
}());
export { StateValue };
export var VOID_VALUE = 'void';
export var DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
var AnimationTransitionNamespace = /** @class */ (function () {
    function AnimationTransitionNamespace(id, hostElement, _engine) {
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
    AnimationTransitionNamespace.prototype.listen = function (element, name, phase, callback) {
        var _this = this;
        if (!this._triggers.hasOwnProperty(name)) {
            throw new Error("Unable to listen on the animation trigger event \"" + phase + "\" because the animation trigger \"" + name + "\" doesn't exist!");
        }
        if (phase == null || phase.length == 0) {
            throw new Error("Unable to listen on the animation trigger \"" + name + "\" because the provided event is undefined!");
        }
        if (!isTriggerEventValid(phase)) {
            throw new Error("The provided animation trigger event \"" + phase + "\" for the animation trigger \"" + name + "\" is not supported!");
        }
        var listeners = getOrSetAsInMap(this._elementListeners, element, []);
        var data = { name: name, phase: phase, callback: callback };
        listeners.push(data);
        var triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
        if (!triggersWithStates.hasOwnProperty(name)) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + name);
            triggersWithStates[name] = DEFAULT_STATE_VALUE;
        }
        return function () {
            // the event listener is removed AFTER the flush has occurred such
            // that leave animations callbacks can fire (otherwise if the node
            // is removed in between then the listeners would be deregistered)
            _this._engine.afterFlush(function () {
                var index = listeners.indexOf(data);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
                if (!_this._triggers[name]) {
                    delete triggersWithStates[name];
                }
            });
        };
    };
    AnimationTransitionNamespace.prototype.register = function (name, ast) {
        if (this._triggers[name]) {
            // throw
            return false;
        }
        else {
            this._triggers[name] = ast;
            return true;
        }
    };
    AnimationTransitionNamespace.prototype._getTrigger = function (name) {
        var trigger = this._triggers[name];
        if (!trigger) {
            throw new Error("The provided animation trigger \"" + name + "\" has not been registered!");
        }
        return trigger;
    };
    AnimationTransitionNamespace.prototype.trigger = function (element, triggerName, value, defaultToFallback) {
        var _this = this;
        if (defaultToFallback === void 0) { defaultToFallback = true; }
        var trigger = this._getTrigger(triggerName);
        var player = new TransitionAnimationPlayer(this.id, triggerName, element);
        var triggersWithStates = this._engine.statesByElement.get(element);
        if (!triggersWithStates) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + triggerName);
            this._engine.statesByElement.set(element, triggersWithStates = {});
        }
        var fromState = triggersWithStates[triggerName];
        var toState = new StateValue(value, this.id);
        var isObj = value && value.hasOwnProperty('value');
        if (!isObj && fromState) {
            toState.absorbOptions(fromState.options);
        }
        triggersWithStates[triggerName] = toState;
        if (!fromState) {
            fromState = DEFAULT_STATE_VALUE;
        }
        var isRemoval = toState.value === VOID_VALUE;
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
                var errors = [];
                var fromStyles_1 = trigger.matchStyles(fromState.value, fromState.params, errors);
                var toStyles_1 = trigger.matchStyles(toState.value, toState.params, errors);
                if (errors.length) {
                    this._engine.reportError(errors);
                }
                else {
                    this._engine.afterFlush(function () {
                        eraseStyles(element, fromStyles_1);
                        setStyles(element, toStyles_1);
                    });
                }
            }
            return;
        }
        var playersOnElement = getOrSetAsInMap(this._engine.playersByElement, element, []);
        playersOnElement.forEach(function (player) {
            // only remove the player if it is queued on the EXACT same trigger/namespace
            // we only also deal with queued players here because if the animation has
            // started then we want to keep the player alive until the flush happens
            // (which is where the previousPlayers are passed into the new palyer)
            if (player.namespaceId == _this.id && player.triggerName == triggerName && player.queued) {
                player.destroy();
            }
        });
        var transition = trigger.matchTransition(fromState.value, toState.value, element, toState.params);
        var isFallbackTransition = false;
        if (!transition) {
            if (!defaultToFallback)
                return;
            transition = trigger.fallbackTransition;
            isFallbackTransition = true;
        }
        this._engine.totalQueuedPlayers++;
        this._queue.push({ element: element, triggerName: triggerName, transition: transition, fromState: fromState, toState: toState, player: player, isFallbackTransition: isFallbackTransition });
        if (!isFallbackTransition) {
            addClass(element, QUEUED_CLASSNAME);
            player.onStart(function () { removeClass(element, QUEUED_CLASSNAME); });
        }
        player.onDone(function () {
            var index = _this.players.indexOf(player);
            if (index >= 0) {
                _this.players.splice(index, 1);
            }
            var players = _this._engine.playersByElement.get(element);
            if (players) {
                var index_1 = players.indexOf(player);
                if (index_1 >= 0) {
                    players.splice(index_1, 1);
                }
            }
        });
        this.players.push(player);
        playersOnElement.push(player);
        return player;
    };
    AnimationTransitionNamespace.prototype.deregister = function (name) {
        var _this = this;
        delete this._triggers[name];
        this._engine.statesByElement.forEach(function (stateMap, element) { delete stateMap[name]; });
        this._elementListeners.forEach(function (listeners, element) {
            _this._elementListeners.set(element, listeners.filter(function (entry) { return entry.name != name; }));
        });
    };
    AnimationTransitionNamespace.prototype.clearElementCache = function (element) {
        this._engine.statesByElement.delete(element);
        this._elementListeners.delete(element);
        var elementPlayers = this._engine.playersByElement.get(element);
        if (elementPlayers) {
            elementPlayers.forEach(function (player) { return player.destroy(); });
            this._engine.playersByElement.delete(element);
        }
    };
    AnimationTransitionNamespace.prototype._signalRemovalForInnerTriggers = function (rootElement, context, animate) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        // emulate a leave animation for all inner nodes within this node.
        // If there are no animations found for any of the nodes then clear the cache
        // for the element.
        this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true).forEach(function (elm) {
            // this means that an inner remove() operation has already kicked off
            // the animation on this element...
            if (elm[REMOVAL_FLAG])
                return;
            var namespaces = _this._engine.fetchNamespacesByElement(elm);
            if (namespaces.size) {
                namespaces.forEach(function (ns) { return ns.triggerLeaveAnimation(elm, context, false, true); });
            }
            else {
                _this.clearElementCache(elm);
            }
        });
    };
    AnimationTransitionNamespace.prototype.triggerLeaveAnimation = function (element, context, destroyAfterComplete, defaultToFallback) {
        var _this = this;
        var triggerStates = this._engine.statesByElement.get(element);
        if (triggerStates) {
            var players_1 = [];
            Object.keys(triggerStates).forEach(function (triggerName) {
                // this check is here in the event that an element is removed
                // twice (both on the host level and the component level)
                if (_this._triggers[triggerName]) {
                    var player = _this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
                    if (player) {
                        players_1.push(player);
                    }
                }
            });
            if (players_1.length) {
                this._engine.markElementAsRemoved(this.id, element, true, context);
                if (destroyAfterComplete) {
                    optimizeGroupPlayer(players_1).onDone(function () { return _this._engine.processLeaveNode(element); });
                }
                return true;
            }
        }
        return false;
    };
    AnimationTransitionNamespace.prototype.prepareLeaveAnimationListeners = function (element) {
        var _this = this;
        var listeners = this._elementListeners.get(element);
        if (listeners) {
            var visitedTriggers_1 = new Set();
            listeners.forEach(function (listener) {
                var triggerName = listener.name;
                if (visitedTriggers_1.has(triggerName))
                    return;
                visitedTriggers_1.add(triggerName);
                var trigger = _this._triggers[triggerName];
                var transition = trigger.fallbackTransition;
                var elementStates = _this._engine.statesByElement.get(element);
                var fromState = elementStates[triggerName] || DEFAULT_STATE_VALUE;
                var toState = new StateValue(VOID_VALUE);
                var player = new TransitionAnimationPlayer(_this.id, triggerName, element);
                _this._engine.totalQueuedPlayers++;
                _this._queue.push({
                    element: element,
                    triggerName: triggerName,
                    transition: transition,
                    fromState: fromState,
                    toState: toState,
                    player: player,
                    isFallbackTransition: true
                });
            });
        }
    };
    AnimationTransitionNamespace.prototype.removeNode = function (element, context) {
        var _this = this;
        var engine = this._engine;
        if (element.childElementCount) {
            this._signalRemovalForInnerTriggers(element, context, true);
        }
        // this means that a * => VOID animation was detected and kicked off
        if (this.triggerLeaveAnimation(element, context, true))
            return;
        // find the player that is animating and make sure that the
        // removal is delayed until that player has completed
        var containsPotentialParentTransition = false;
        if (engine.totalAnimations) {
            var currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
            // when this `if statement` does not continue forward it means that
            // a previous animation query has selected the current element and
            // is animating it. In this situation want to continue forwards and
            // allow the element to be queued up for animation later.
            if (currentPlayers && currentPlayers.length) {
                containsPotentialParentTransition = true;
            }
            else {
                var parent_1 = element;
                while (parent_1 = parent_1.parentNode) {
                    var triggers = engine.statesByElement.get(parent_1);
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
            engine.afterFlush(function () { return _this.clearElementCache(element); });
            engine.destroyInnerAnimations(element);
            engine._onRemovalComplete(element, context);
        }
    };
    AnimationTransitionNamespace.prototype.insertNode = function (element, parent) { addClass(element, this._hostClassName); };
    AnimationTransitionNamespace.prototype.drainQueuedTransitions = function (microtaskId) {
        var _this = this;
        var instructions = [];
        this._queue.forEach(function (entry) {
            var player = entry.player;
            if (player.destroyed)
                return;
            var element = entry.element;
            var listeners = _this._elementListeners.get(element);
            if (listeners) {
                listeners.forEach(function (listener) {
                    if (listener.name == entry.triggerName) {
                        var baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
                        baseEvent['_data'] = microtaskId;
                        listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
                    }
                });
            }
            if (player.markedForDestroy) {
                _this._engine.afterFlush(function () {
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
        return instructions.sort(function (a, b) {
            // if depCount == 0 them move to front
            // otherwise if a contains b then move back
            var d0 = a.transition.ast.depCount;
            var d1 = b.transition.ast.depCount;
            if (d0 == 0 || d1 == 0) {
                return d0 - d1;
            }
            return _this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
        });
    };
    AnimationTransitionNamespace.prototype.destroy = function (context) {
        this.players.forEach(function (p) { return p.destroy(); });
        this._signalRemovalForInnerTriggers(this.hostElement, context);
    };
    AnimationTransitionNamespace.prototype.elementContainsData = function (element) {
        var containsData = false;
        if (this._elementListeners.has(element))
            containsData = true;
        containsData =
            (this._queue.find(function (entry) { return entry.element === element; }) ? true : false) || containsData;
        return containsData;
    };
    return AnimationTransitionNamespace;
}());
export { AnimationTransitionNamespace };
var TransitionAnimationEngine = /** @class */ (function () {
    function TransitionAnimationEngine(driver, _normalizer) {
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
        this.onRemovalComplete = function (element, context) { };
    }
    /** @internal */
    TransitionAnimationEngine.prototype._onRemovalComplete = function (element, context) { this.onRemovalComplete(element, context); };
    Object.defineProperty(TransitionAnimationEngine.prototype, "queuedPlayers", {
        get: function () {
            var players = [];
            this._namespaceList.forEach(function (ns) {
                ns.players.forEach(function (player) {
                    if (player.queued) {
                        players.push(player);
                    }
                });
            });
            return players;
        },
        enumerable: true,
        configurable: true
    });
    TransitionAnimationEngine.prototype.createNamespace = function (namespaceId, hostElement) {
        var ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
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
    };
    TransitionAnimationEngine.prototype._balanceNamespaceList = function (ns, hostElement) {
        var limit = this._namespaceList.length - 1;
        if (limit >= 0) {
            var found = false;
            for (var i = limit; i >= 0; i--) {
                var nextNamespace = this._namespaceList[i];
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
    };
    TransitionAnimationEngine.prototype.register = function (namespaceId, hostElement) {
        var ns = this._namespaceLookup[namespaceId];
        if (!ns) {
            ns = this.createNamespace(namespaceId, hostElement);
        }
        return ns;
    };
    TransitionAnimationEngine.prototype.registerTrigger = function (namespaceId, name, trigger) {
        var ns = this._namespaceLookup[namespaceId];
        if (ns && ns.register(name, trigger)) {
            this.totalAnimations++;
        }
    };
    TransitionAnimationEngine.prototype.destroy = function (namespaceId, context) {
        var _this = this;
        if (!namespaceId)
            return;
        var ns = this._fetchNamespace(namespaceId);
        this.afterFlush(function () {
            _this.namespacesByHostElement.delete(ns.hostElement);
            delete _this._namespaceLookup[namespaceId];
            var index = _this._namespaceList.indexOf(ns);
            if (index >= 0) {
                _this._namespaceList.splice(index, 1);
            }
        });
        this.afterFlushAnimationsDone(function () { return ns.destroy(context); });
    };
    TransitionAnimationEngine.prototype._fetchNamespace = function (id) { return this._namespaceLookup[id]; };
    TransitionAnimationEngine.prototype.fetchNamespacesByElement = function (element) {
        // normally there should only be one namespace per element, however
        // if @triggers are placed on both the component element and then
        // its host element (within the component code) then there will be
        // two namespaces returned. We use a set here to simply the dedupe
        // of namespaces incase there are multiple triggers both the elm and host
        var namespaces = new Set();
        var elementStates = this.statesByElement.get(element);
        if (elementStates) {
            var keys = Object.keys(elementStates);
            for (var i = 0; i < keys.length; i++) {
                var nsId = elementStates[keys[i]].namespaceId;
                if (nsId) {
                    var ns = this._fetchNamespace(nsId);
                    if (ns) {
                        namespaces.add(ns);
                    }
                }
            }
        }
        return namespaces;
    };
    TransitionAnimationEngine.prototype.trigger = function (namespaceId, element, name, value) {
        if (isElementNode(element)) {
            var ns = this._fetchNamespace(namespaceId);
            if (ns) {
                ns.trigger(element, name, value);
                return true;
            }
        }
        return false;
    };
    TransitionAnimationEngine.prototype.insertNode = function (namespaceId, element, parent, insertBefore) {
        if (!isElementNode(element))
            return;
        // special case for when an element is removed and reinserted (move operation)
        // when this occurs we do not want to use the element for deletion later
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            details.setForRemoval = false;
            details.setForMove = true;
            var index = this.collectedLeaveElements.indexOf(element);
            if (index >= 0) {
                this.collectedLeaveElements.splice(index, 1);
            }
        }
        // in the event that the namespaceId is blank then the caller
        // code does not contain any animation code in it, but it is
        // just being called so that the node is marked as being inserted
        if (namespaceId) {
            var ns = this._fetchNamespace(namespaceId);
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
    };
    TransitionAnimationEngine.prototype.collectEnterElement = function (element) { this.collectedEnterElements.push(element); };
    TransitionAnimationEngine.prototype.markElementAsDisabled = function (element, value) {
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
    };
    TransitionAnimationEngine.prototype.removeNode = function (namespaceId, element, context) {
        if (!isElementNode(element)) {
            this._onRemovalComplete(element, context);
            return;
        }
        var ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
        if (ns) {
            ns.removeNode(element, context);
        }
        else {
            this.markElementAsRemoved(namespaceId, element, false, context);
        }
    };
    TransitionAnimationEngine.prototype.markElementAsRemoved = function (namespaceId, element, hasAnimation, context) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] = {
            namespaceId: namespaceId,
            setForRemoval: context, hasAnimation: hasAnimation,
            removedBeforeQueried: false
        };
    };
    TransitionAnimationEngine.prototype.listen = function (namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return function () { };
    };
    TransitionAnimationEngine.prototype._buildInstruction = function (entry, subTimelines, enterClassName, leaveClassName) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines);
    };
    TransitionAnimationEngine.prototype.destroyInnerAnimations = function (containerElement) {
        var _this = this;
        var elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
        elements.forEach(function (element) { return _this.destroyActiveAnimationsForElement(element); });
        if (this.playersByQueriedElement.size == 0)
            return;
        elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
        elements.forEach(function (element) { return _this.finishActiveQueriedAnimationOnElement(element); });
    };
    TransitionAnimationEngine.prototype.destroyActiveAnimationsForElement = function (element) {
        var players = this.playersByElement.get(element);
        if (players) {
            players.forEach(function (player) {
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
    };
    TransitionAnimationEngine.prototype.finishActiveQueriedAnimationOnElement = function (element) {
        var players = this.playersByQueriedElement.get(element);
        if (players) {
            players.forEach(function (player) { return player.finish(); });
        }
    };
    TransitionAnimationEngine.prototype.whenRenderingDone = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.players.length) {
                return optimizeGroupPlayer(_this.players).onDone(function () { return resolve(); });
            }
            else {
                resolve();
            }
        });
    };
    TransitionAnimationEngine.prototype.processLeaveNode = function (element) {
        var _this = this;
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            // this will prevent it from removing it twice
            element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
            if (details.namespaceId) {
                this.destroyInnerAnimations(element);
                var ns = this._fetchNamespace(details.namespaceId);
                if (ns) {
                    ns.clearElementCache(element);
                }
            }
            this._onRemovalComplete(element, details.setForRemoval);
        }
        if (this.driver.matchesElement(element, DISABLED_SELECTOR)) {
            this.markElementAsDisabled(element, false);
        }
        this.driver.query(element, DISABLED_SELECTOR, true).forEach(function (node) {
            _this.markElementAsDisabled(element, false);
        });
    };
    TransitionAnimationEngine.prototype.flush = function (microtaskId) {
        var _this = this;
        if (microtaskId === void 0) { microtaskId = -1; }
        var players = [];
        if (this.newHostElements.size) {
            this.newHostElements.forEach(function (ns, element) { return _this._balanceNamespaceList(ns, element); });
            this.newHostElements.clear();
        }
        if (this.totalAnimations && this.collectedEnterElements.length) {
            for (var i = 0; i < this.collectedEnterElements.length; i++) {
                var elm = this.collectedEnterElements[i];
                addClass(elm, STAR_CLASSNAME);
            }
        }
        if (this._namespaceList.length &&
            (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
            var cleanupFns = [];
            try {
                players = this._flushAnimations(cleanupFns, microtaskId);
            }
            finally {
                for (var i = 0; i < cleanupFns.length; i++) {
                    cleanupFns[i]();
                }
            }
        }
        else {
            for (var i = 0; i < this.collectedLeaveElements.length; i++) {
                var element = this.collectedLeaveElements[i];
                this.processLeaveNode(element);
            }
        }
        this.totalQueuedPlayers = 0;
        this.collectedEnterElements.length = 0;
        this.collectedLeaveElements.length = 0;
        this._flushFns.forEach(function (fn) { return fn(); });
        this._flushFns = [];
        if (this._whenQuietFns.length) {
            // we move these over to a variable so that
            // if any new callbacks are registered in another
            // flush they do not populate the existing set
            var quietFns_1 = this._whenQuietFns;
            this._whenQuietFns = [];
            if (players.length) {
                optimizeGroupPlayer(players).onDone(function () { quietFns_1.forEach(function (fn) { return fn(); }); });
            }
            else {
                quietFns_1.forEach(function (fn) { return fn(); });
            }
        }
    };
    TransitionAnimationEngine.prototype.reportError = function (errors) {
        throw new Error("Unable to process animations due to the following failed trigger transitions\n " + errors.join('\n'));
    };
    TransitionAnimationEngine.prototype._flushAnimations = function (cleanupFns, microtaskId) {
        var _this = this;
        var subTimelines = new ElementInstructionMap();
        var skippedPlayers = [];
        var skippedPlayersMap = new Map();
        var queuedInstructions = [];
        var queriedElements = new Map();
        var allPreStyleElements = new Map();
        var allPostStyleElements = new Map();
        var disabledElementsSet = new Set();
        this.disabledNodes.forEach(function (node) {
            disabledElementsSet.add(node);
            var nodesThatAreDisabled = _this.driver.query(node, QUEUED_SELECTOR, true);
            for (var i_1 = 0; i_1 < nodesThatAreDisabled.length; i_1++) {
                disabledElementsSet.add(nodesThatAreDisabled[i_1]);
            }
        });
        var bodyNode = getBodyNode();
        var allTriggerElements = Array.from(this.statesByElement.keys());
        var enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
        // this must occur before the instructions are built below such that
        // the :enter queries match the elements (since the timeline queries
        // are fired during instruction building).
        var enterNodeMapIds = new Map();
        var i = 0;
        enterNodeMap.forEach(function (nodes, root) {
            var className = ENTER_CLASSNAME + i++;
            enterNodeMapIds.set(root, className);
            nodes.forEach(function (node) { return addClass(node, className); });
        });
        var allLeaveNodes = [];
        var mergedLeaveNodes = new Set();
        var leaveNodesWithoutAnimations = new Set();
        for (var i_2 = 0; i_2 < this.collectedLeaveElements.length; i_2++) {
            var element = this.collectedLeaveElements[i_2];
            var details = element[REMOVAL_FLAG];
            if (details && details.setForRemoval) {
                allLeaveNodes.push(element);
                mergedLeaveNodes.add(element);
                if (details.hasAnimation) {
                    this.driver.query(element, STAR_SELECTOR, true).forEach(function (elm) { return mergedLeaveNodes.add(elm); });
                }
                else {
                    leaveNodesWithoutAnimations.add(element);
                }
            }
        }
        var leaveNodeMapIds = new Map();
        var leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
        leaveNodeMap.forEach(function (nodes, root) {
            var className = LEAVE_CLASSNAME + i++;
            leaveNodeMapIds.set(root, className);
            nodes.forEach(function (node) { return addClass(node, className); });
        });
        cleanupFns.push(function () {
            enterNodeMap.forEach(function (nodes, root) {
                var className = enterNodeMapIds.get(root);
                nodes.forEach(function (node) { return removeClass(node, className); });
            });
            leaveNodeMap.forEach(function (nodes, root) {
                var className = leaveNodeMapIds.get(root);
                nodes.forEach(function (node) { return removeClass(node, className); });
            });
            allLeaveNodes.forEach(function (element) { _this.processLeaveNode(element); });
        });
        var allPlayers = [];
        var erroneousTransitions = [];
        for (var i_3 = this._namespaceList.length - 1; i_3 >= 0; i_3--) {
            var ns = this._namespaceList[i_3];
            ns.drainQueuedTransitions(microtaskId).forEach(function (entry) {
                var player = entry.player;
                var element = entry.element;
                allPlayers.push(player);
                if (_this.collectedEnterElements.length) {
                    var details = element[REMOVAL_FLAG];
                    // move animations are currently not supported...
                    if (details && details.setForMove) {
                        player.destroy();
                        return;
                    }
                }
                if (!bodyNode || !_this.driver.containsElement(bodyNode, element)) {
                    player.destroy();
                    return;
                }
                var leaveClassName = leaveNodeMapIds.get(element);
                var enterClassName = enterNodeMapIds.get(element);
                var instruction = _this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName);
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // if a unmatched transition is queued to go then it SHOULD NOT render
                // an animation and cancel the previously running animations.
                if (entry.isFallbackTransition) {
                    player.onStart(function () { return eraseStyles(element, instruction.fromStyles); });
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                    skippedPlayers.push(player);
                    return;
                }
                // this means that if a parent animation uses this animation as a sub trigger
                // then it will instruct the timeline builder to not add a player delay, but
                // instead stretch the first keyframe gap up until the animation starts. The
                // reason this is important is to prevent extra initialization styles from being
                // required by the user in the animation.
                instruction.timelines.forEach(function (tl) { return tl.stretchStartingKeyframe = true; });
                subTimelines.append(element, instruction.timelines);
                var tuple = { instruction: instruction, player: player, element: element };
                queuedInstructions.push(tuple);
                instruction.queriedElements.forEach(function (element) { return getOrSetAsInMap(queriedElements, element, []).push(player); });
                instruction.preStyleProps.forEach(function (stringMap, element) {
                    var props = Object.keys(stringMap);
                    if (props.length) {
                        var setVal_1 = allPreStyleElements.get(element);
                        if (!setVal_1) {
                            allPreStyleElements.set(element, setVal_1 = new Set());
                        }
                        props.forEach(function (prop) { return setVal_1.add(prop); });
                    }
                });
                instruction.postStyleProps.forEach(function (stringMap, element) {
                    var props = Object.keys(stringMap);
                    var setVal = allPostStyleElements.get(element);
                    if (!setVal) {
                        allPostStyleElements.set(element, setVal = new Set());
                    }
                    props.forEach(function (prop) { return setVal.add(prop); });
                });
            });
        }
        if (erroneousTransitions.length) {
            var errors_1 = [];
            erroneousTransitions.forEach(function (instruction) {
                errors_1.push("@" + instruction.triggerName + " has failed due to:\n");
                instruction.errors.forEach(function (error) { return errors_1.push("- " + error + "\n"); });
            });
            allPlayers.forEach(function (player) { return player.destroy(); });
            this.reportError(errors_1);
        }
        var allPreviousPlayersMap = new Map();
        // this map works to tell which element in the DOM tree is contained by
        // which animation. Further down below this map will get populated once
        // the players are built and in doing so it can efficiently figure out
        // if a sub player is skipped due to a parent player having priority.
        var animationElementMap = new Map();
        queuedInstructions.forEach(function (entry) {
            var element = entry.element;
            if (subTimelines.has(element)) {
                animationElementMap.set(element, element);
                _this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
            }
        });
        skippedPlayers.forEach(function (player) {
            var element = player.element;
            var previousPlayers = _this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
            previousPlayers.forEach(function (prevPlayer) {
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
        var replaceNodes = allLeaveNodes.filter(function (node) {
            return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
        });
        // POST STAGE: fill the * styles
        var postStylesMap = new Map();
        var allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
        allLeaveQueriedNodes.forEach(function (node) {
            if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
                replaceNodes.push(node);
            }
        });
        // PRE STAGE: fill the ! styles
        var preStylesMap = new Map();
        enterNodeMap.forEach(function (nodes, root) {
            cloakAndComputeStyles(preStylesMap, _this.driver, new Set(nodes), allPreStyleElements, PRE_STYLE);
        });
        replaceNodes.forEach(function (node) {
            var post = postStylesMap.get(node);
            var pre = preStylesMap.get(node);
            postStylesMap.set(node, tslib_1.__assign({}, post, pre));
        });
        var rootPlayers = [];
        var subPlayers = [];
        var NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
        queuedInstructions.forEach(function (entry) {
            var element = entry.element, player = entry.player, instruction = entry.instruction;
            // this means that it was never consumed by a parent animation which
            // means that it is independent and therefore should be set for animation
            if (subTimelines.has(element)) {
                if (disabledElementsSet.has(element)) {
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
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
                var parentWithAnimation_1 = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
                if (animationElementMap.size > 1) {
                    var elm = element;
                    var parentsToAdd = [];
                    while (elm = elm.parentNode) {
                        var detectedParent = animationElementMap.get(elm);
                        if (detectedParent) {
                            parentWithAnimation_1 = detectedParent;
                            break;
                        }
                        parentsToAdd.push(elm);
                    }
                    parentsToAdd.forEach(function (parent) { return animationElementMap.set(parent, parentWithAnimation_1); });
                }
                var innerPlayer = _this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
                player.setRealPlayer(innerPlayer);
                if (parentWithAnimation_1 === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
                    rootPlayers.push(player);
                }
                else {
                    var parentPlayers = _this.playersByElement.get(parentWithAnimation_1);
                    if (parentPlayers && parentPlayers.length) {
                        player.parentPlayer = optimizeGroupPlayer(parentPlayers);
                    }
                    skippedPlayers.push(player);
                }
            }
            else {
                eraseStyles(element, instruction.fromStyles);
                player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
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
        subPlayers.forEach(function (player) {
            // even if any players are not found for a sub animation then it
            // will still complete itself after the next tick since it's Noop
            var playersForElement = skippedPlayersMap.get(player.element);
            if (playersForElement && playersForElement.length) {
                var innerPlayer = optimizeGroupPlayer(playersForElement);
                player.setRealPlayer(innerPlayer);
            }
        });
        // the reason why we don't actually play the animation is
        // because all that a skipped player is designed to do is to
        // fire the start/done transition callback events
        skippedPlayers.forEach(function (player) {
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
        for (var i_4 = 0; i_4 < allLeaveNodes.length; i_4++) {
            var element = allLeaveNodes[i_4];
            var details = element[REMOVAL_FLAG];
            removeClass(element, LEAVE_CLASSNAME);
            // this means the element has a removal animation that is being
            // taken care of and therefore the inner elements will hang around
            // until that animation is over (or the parent queried animation)
            if (details && details.hasAnimation)
                continue;
            var players = [];
            // if this element is queried or if it contains queried children
            // then we want for the element not to be removed from the page
            // until the queried animations have finished
            if (queriedElements.size) {
                var queriedPlayerResults = queriedElements.get(element);
                if (queriedPlayerResults && queriedPlayerResults.length) {
                    players.push.apply(players, tslib_1.__spread(queriedPlayerResults));
                }
                var queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
                for (var j = 0; j < queriedInnerElements.length; j++) {
                    var queriedPlayers = queriedElements.get(queriedInnerElements[j]);
                    if (queriedPlayers && queriedPlayers.length) {
                        players.push.apply(players, tslib_1.__spread(queriedPlayers));
                    }
                }
            }
            var activePlayers = players.filter(function (p) { return !p.destroyed; });
            if (activePlayers.length) {
                removeNodesAfterAnimationDone(this, element, activePlayers);
            }
            else {
                this.processLeaveNode(element);
            }
        }
        // this is required so the cleanup method doesn't remove them
        allLeaveNodes.length = 0;
        rootPlayers.forEach(function (player) {
            _this.players.push(player);
            player.onDone(function () {
                player.destroy();
                var index = _this.players.indexOf(player);
                _this.players.splice(index, 1);
            });
            player.play();
        });
        return rootPlayers;
    };
    TransitionAnimationEngine.prototype.elementContainsData = function (namespaceId, element) {
        var containsData = false;
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval)
            containsData = true;
        if (this.playersByElement.has(element))
            containsData = true;
        if (this.playersByQueriedElement.has(element))
            containsData = true;
        if (this.statesByElement.has(element))
            containsData = true;
        return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
    };
    TransitionAnimationEngine.prototype.afterFlush = function (callback) { this._flushFns.push(callback); };
    TransitionAnimationEngine.prototype.afterFlushAnimationsDone = function (callback) { this._whenQuietFns.push(callback); };
    TransitionAnimationEngine.prototype._getPreviousPlayers = function (element, isQueriedElement, namespaceId, triggerName, toStateValue) {
        var players = [];
        if (isQueriedElement) {
            var queriedElementPlayers = this.playersByQueriedElement.get(element);
            if (queriedElementPlayers) {
                players = queriedElementPlayers;
            }
        }
        else {
            var elementPlayers = this.playersByElement.get(element);
            if (elementPlayers) {
                var isRemovalAnimation_1 = !toStateValue || toStateValue == VOID_VALUE;
                elementPlayers.forEach(function (player) {
                    if (player.queued)
                        return;
                    if (!isRemovalAnimation_1 && player.triggerName != triggerName)
                        return;
                    players.push(player);
                });
            }
        }
        if (namespaceId || triggerName) {
            players = players.filter(function (player) {
                if (namespaceId && namespaceId != player.namespaceId)
                    return false;
                if (triggerName && triggerName != player.triggerName)
                    return false;
                return true;
            });
        }
        return players;
    };
    TransitionAnimationEngine.prototype._beforeAnimationBuild = function (namespaceId, instruction, allPreviousPlayersMap) {
        var triggerName = instruction.triggerName;
        var rootElement = instruction.element;
        // when a removal animation occurs, ALL previous players are collected
        // and destroyed (even if they are outside of the current namespace)
        var targetNameSpaceId = instruction.isRemovalTransition ? undefined : namespaceId;
        var targetTriggerName = instruction.isRemovalTransition ? undefined : triggerName;
        var _loop_1 = function (timelineInstruction) {
            var element = timelineInstruction.element;
            var isQueriedElement = element !== rootElement;
            var players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
            var previousPlayers = this_1._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
            previousPlayers.forEach(function (player) {
                var realPlayer = player.getRealPlayer();
                if (realPlayer.beforeDestroy) {
                    realPlayer.beforeDestroy();
                }
                player.destroy();
                players.push(player);
            });
        };
        var this_1 = this;
        try {
            for (var _a = tslib_1.__values(instruction.timelines), _b = _a.next(); !_b.done; _b = _a.next()) {
                var timelineInstruction = _b.value;
                _loop_1(timelineInstruction);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // this needs to be done so that the PRE/POST styles can be
        // computed properly without interfering with the previous animation
        eraseStyles(rootElement, instruction.fromStyles);
        var e_1, _c;
    };
    TransitionAnimationEngine.prototype._buildAnimation = function (namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
        var _this = this;
        var triggerName = instruction.triggerName;
        var rootElement = instruction.element;
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        var allQueriedPlayers = [];
        var allConsumedElements = new Set();
        var allSubElements = new Set();
        var allNewPlayers = instruction.timelines.map(function (timelineInstruction) {
            var element = timelineInstruction.element;
            allConsumedElements.add(element);
            // FIXME (matsko): make sure to-be-removed animations are removed properly
            var details = element[REMOVAL_FLAG];
            if (details && details.removedBeforeQueried)
                return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
            var isQueriedElement = element !== rootElement;
            var previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY)
                .map(function (p) { return p.getRealPlayer(); }))
                .filter(function (p) {
                // the `element` is not apart of the AnimationPlayer definition, but
                // Mock/WebAnimations
                // use the element within their implementation. This will be added in Angular5 to
                // AnimationPlayer
                var pp = p;
                return pp.element ? pp.element === element : false;
            });
            var preStyles = preStylesMap.get(element);
            var postStyles = postStylesMap.get(element);
            var keyframes = normalizeKeyframes(_this.driver, _this._normalizer, element, timelineInstruction.keyframes, preStyles, postStyles);
            var player = _this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
            // this means that this particular player belongs to a sub trigger. It is
            // important that we match this player up with the corresponding (@trigger.listener)
            if (timelineInstruction.subTimeline && skippedPlayersMap) {
                allSubElements.add(element);
            }
            if (isQueriedElement) {
                var wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
                wrappedPlayer.setRealPlayer(player);
                allQueriedPlayers.push(wrappedPlayer);
            }
            return player;
        });
        allQueriedPlayers.forEach(function (player) {
            getOrSetAsInMap(_this.playersByQueriedElement, player.element, []).push(player);
            player.onDone(function () { return deleteOrUnsetInMap(_this.playersByQueriedElement, player.element, player); });
        });
        allConsumedElements.forEach(function (element) { return addClass(element, NG_ANIMATING_CLASSNAME); });
        var player = optimizeGroupPlayer(allNewPlayers);
        player.onDestroy(function () {
            allConsumedElements.forEach(function (element) { return removeClass(element, NG_ANIMATING_CLASSNAME); });
            setStyles(rootElement, instruction.toStyles);
        });
        // this basically makes all of the callbacks for sub element animations
        // be dependent on the upper players for when they finish
        allSubElements.forEach(function (element) { getOrSetAsInMap(skippedPlayersMap, element, []).push(player); });
        return player;
    };
    TransitionAnimationEngine.prototype._buildPlayer = function (instruction, keyframes, previousPlayers) {
        if (keyframes.length > 0) {
            return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
        }
        // special case for when an empty transition|definition is provided
        // ... there is no point in rendering an empty animation
        return new NoopAnimationPlayer(instruction.duration, instruction.delay);
    };
    return TransitionAnimationEngine;
}());
export { TransitionAnimationEngine };
var TransitionAnimationPlayer = /** @class */ (function () {
    function TransitionAnimationPlayer(namespaceId, triggerName, element) {
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
    TransitionAnimationPlayer.prototype.setRealPlayer = function (player) {
        var _this = this;
        if (this._containsRealPlayer)
            return;
        this._player = player;
        Object.keys(this._queuedCallbacks).forEach(function (phase) {
            _this._queuedCallbacks[phase].forEach(function (callback) { return listenOnPlayer(player, phase, undefined, callback); });
        });
        this._queuedCallbacks = {};
        this._containsRealPlayer = true;
        this.overrideTotalTime(player.totalTime);
        this.queued = false;
    };
    TransitionAnimationPlayer.prototype.getRealPlayer = function () { return this._player; };
    TransitionAnimationPlayer.prototype.overrideTotalTime = function (totalTime) { this.totalTime = totalTime; };
    TransitionAnimationPlayer.prototype.syncPlayerEvents = function (player) {
        var _this = this;
        var p = this._player;
        if (p.triggerCallback) {
            player.onStart(function () { return p.triggerCallback('start'); });
        }
        player.onDone(function () { return _this.finish(); });
        player.onDestroy(function () { return _this.destroy(); });
    };
    TransitionAnimationPlayer.prototype._queueEvent = function (name, callback) {
        getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
    };
    TransitionAnimationPlayer.prototype.onDone = function (fn) {
        if (this.queued) {
            this._queueEvent('done', fn);
        }
        this._player.onDone(fn);
    };
    TransitionAnimationPlayer.prototype.onStart = function (fn) {
        if (this.queued) {
            this._queueEvent('start', fn);
        }
        this._player.onStart(fn);
    };
    TransitionAnimationPlayer.prototype.onDestroy = function (fn) {
        if (this.queued) {
            this._queueEvent('destroy', fn);
        }
        this._player.onDestroy(fn);
    };
    TransitionAnimationPlayer.prototype.init = function () { this._player.init(); };
    TransitionAnimationPlayer.prototype.hasStarted = function () { return this.queued ? false : this._player.hasStarted(); };
    TransitionAnimationPlayer.prototype.play = function () { !this.queued && this._player.play(); };
    TransitionAnimationPlayer.prototype.pause = function () { !this.queued && this._player.pause(); };
    TransitionAnimationPlayer.prototype.restart = function () { !this.queued && this._player.restart(); };
    TransitionAnimationPlayer.prototype.finish = function () { this._player.finish(); };
    TransitionAnimationPlayer.prototype.destroy = function () {
        this.destroyed = true;
        this._player.destroy();
    };
    TransitionAnimationPlayer.prototype.reset = function () { !this.queued && this._player.reset(); };
    TransitionAnimationPlayer.prototype.setPosition = function (p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    };
    TransitionAnimationPlayer.prototype.getPosition = function () { return this.queued ? 0 : this._player.getPosition(); };
    /* @internal */
    TransitionAnimationPlayer.prototype.triggerCallback = function (phaseName) {
        var p = this._player;
        if (p.triggerCallback) {
            p.triggerCallback(phaseName);
        }
    };
    return TransitionAnimationPlayer;
}());
export { TransitionAnimationPlayer };
function deleteOrUnsetInMap(map, key, value) {
    var currentValues;
    if (map instanceof Map) {
        currentValues = map.get(key);
        if (currentValues) {
            if (currentValues.length) {
                var index = currentValues.indexOf(value);
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
                var index = currentValues.indexOf(value);
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
    var oldValue = element.style.display;
    element.style.display = value != null ? value : 'none';
    return oldValue;
}
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
    var cloakVals = [];
    elements.forEach(function (element) { return cloakVals.push(cloakElement(element)); });
    var failedElements = [];
    elementPropsMap.forEach(function (props, element) {
        var styles = {};
        props.forEach(function (prop) {
            var value = styles[prop] = driver.computeStyle(element, prop, defaultStyle);
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
    var i = 0;
    elements.forEach(function (element) { return cloakElement(element, cloakVals[i++]); });
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
    var rootMap = new Map();
    roots.forEach(function (root) { return rootMap.set(root, []); });
    if (nodes.length == 0)
        return rootMap;
    var NULL_NODE = 1;
    var nodeSet = new Set(nodes);
    var localRootMap = new Map();
    function getRoot(node) {
        if (!node)
            return NULL_NODE;
        var root = localRootMap.get(node);
        if (root)
            return root;
        var parent = node.parentNode;
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
    nodes.forEach(function (node) {
        var root = getRoot(node);
        if (root !== NULL_NODE) {
            rootMap.get(root).push(node);
        }
    });
    return rootMap;
}
var CLASSES_CACHE_KEY = '$$classes';
function containsClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    }
    else {
        var classes = element[CLASSES_CACHE_KEY];
        return classes && classes[className];
    }
}
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    }
    else {
        var classes = element[CLASSES_CACHE_KEY];
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
        var classes = element[CLASSES_CACHE_KEY];
        if (classes) {
            delete classes[className];
        }
    }
}
function removeNodesAfterAnimationDone(engine, element, players) {
    optimizeGroupPlayer(players).onDone(function () { return engine.processLeaveNode(element); });
}
function flattenGroupPlayers(players) {
    var finalPlayers = [];
    _flattenGroupPlayersRecur(players, finalPlayers);
    return finalPlayers;
}
function _flattenGroupPlayersRecur(players, finalPlayers) {
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player instanceof AnimationGroupPlayer) {
            _flattenGroupPlayersRecur(player.players, finalPlayers);
        }
        else {
            finalPlayers.push(player);
        }
    }
}
function objEquals(a, b) {
    var k1 = Object.keys(a);
    var k2 = Object.keys(b);
    if (k1.length != k2.length)
        return false;
    for (var i = 0; i < k1.length; i++) {
        var prop = k1[i];
        if (!b.hasOwnProperty(prop) || a[prop] !== b[prop])
            return false;
    }
    return true;
}
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
    var postEntry = allPostStyleElements.get(element);
    if (!postEntry)
        return false;
    var preEntry = allPreStyleElements.get(element);
    if (preEntry) {
        postEntry.forEach(function (data) { return preEntry.add(data); });
    }
    else {
        allPreStyleElements.set(element, postEntry);
    }
    allPostStyleElements.delete(element);
    return true;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUFxQyxtQkFBbUIsRUFBRSxxQkFBcUIsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFNM0wsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBbUIsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR3JNLE9BQU8sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuSSxJQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0FBQzdDLElBQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDO0FBQzdDLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7QUFDakQsSUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNqRCxJQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUMxQyxJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQztBQUUxQyxJQUFNLGtCQUFrQixHQUFnQyxFQUFFLENBQUM7QUFDM0QsSUFBTSxrQkFBa0IsR0FBMEI7SUFDaEQsV0FBVyxFQUFFLEVBQUU7SUFDZixhQUFhLEVBQUUsS0FB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RyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztLQUNsRTtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELGdDQUNJLE9BQVksRUFBRSxtQkFBMEMsRUFDeEQsb0JBQTJDO0lBQzdDLElBQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRTdCLElBQUksUUFBUSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxJQUFJLFFBQVEsRUFBRTtRQUNaLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxRQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUM7S0FDakQ7U0FBTTtRQUNMLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0M7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIgYXMgQW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeX0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi4vZHNsL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0VOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FLCBOR19UUklHR0VSX1NFTEVDVE9SLCBjb3B5T2JqLCBlcmFzZVN0eWxlcywgaXRlcmF0b3JUb0FycmF5LCBzZXRTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Z2V0Qm9keU5vZGUsIGdldE9yU2V0QXNJbk1hcCwgbGlzdGVuT25QbGF5ZXIsIG1ha2VBbmltYXRpb25FdmVudCwgbm9ybWFsaXplS2V5ZnJhbWVzLCBvcHRpbWl6ZUdyb3VwUGxheWVyfSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IFFVRVVFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgUVVFVUVEX1NFTEVDVE9SID0gJy5uZy1hbmltYXRlLXF1ZXVlZCc7XG5jb25zdCBESVNBQkxFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBESVNBQkxFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBTVEFSX0NMQVNTTkFNRSA9ICduZy1zdGFyLWluc2VydGVkJztcbmNvbnN0IFNUQVJfU0VMRUNUT1IgPSAnLm5nLXN0YXItaW5zZXJ0ZWQnO1xuXG5jb25zdCBFTVBUWV9QTEFZRVJfQVJSQVk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuY29uc3QgTlVMTF9SRU1PVkFMX1NUQVRFOiBFbGVtZW50QW5pbWF0aW9uU3RhdGUgPSB7XG4gIG5hbWVzcGFjZUlkOiAnJyxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBoYXNBbmltYXRpb246IGZhbHNlLFxuICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2Vcbn07XG5jb25zdCBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBzZXRGb3JSZW1vdmFsOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IHRydWVcbn07XG5cbmludGVyZmFjZSBUcmlnZ2VyTGlzdGVuZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBoYXNlOiBzdHJpbmc7XG4gIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSW5zdHJ1Y3Rpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIHRyaWdnZXJOYW1lOiBzdHJpbmc7XG4gIGZyb21TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdG9TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdHJhbnNpdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnk7XG4gIHBsYXllcjogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcjtcbiAgaXNGYWxsYmFja1RyYW5zaXRpb246IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBSRU1PVkFMX0ZMQUcgPSAnX19uZ19yZW1vdmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50QW5pbWF0aW9uU3RhdGUge1xuICBzZXRGb3JSZW1vdmFsOiBib29sZWFuO1xuICBzZXRGb3JNb3ZlOiBib29sZWFuO1xuICBoYXNBbmltYXRpb246IGJvb2xlYW47XG4gIG5hbWVzcGFjZUlkOiBzdHJpbmc7XG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVWYWx1ZSB7XG4gIHB1YmxpYyB2YWx1ZTogc3RyaW5nO1xuICBwdWJsaWMgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucztcblxuICBnZXQgcGFyYW1zKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXMgYXN7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBhbnksIHB1YmxpYyBuYW1lc3BhY2VJZDogc3RyaW5nID0gJycpIHtcbiAgICBjb25zdCBpc09iaiA9IGlucHV0ICYmIGlucHV0Lmhhc093blByb3BlcnR5KCd2YWx1ZScpO1xuICAgIGNvbnN0IHZhbHVlID0gaXNPYmogPyBpbnB1dFsndmFsdWUnXSA6IGlucHV0O1xuICAgIHRoaXMudmFsdWUgPSBub3JtYWxpemVUcmlnZ2VyVmFsdWUodmFsdWUpO1xuICAgIGlmIChpc09iaikge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvcHlPYmooaW5wdXQgYXMgYW55KTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zWyd2YWx1ZSddO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyBhcyBBbmltYXRpb25PcHRpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyYW1zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucGFyYW1zID0ge307XG4gICAgfVxuICB9XG5cbiAgYWJzb3JiT3B0aW9ucyhvcHRpb25zOiBBbmltYXRpb25PcHRpb25zKSB7XG4gICAgY29uc3QgbmV3UGFyYW1zID0gb3B0aW9ucy5wYXJhbXM7XG4gICAgaWYgKG5ld1BhcmFtcykge1xuICAgICAgY29uc3Qgb2xkUGFyYW1zID0gdGhpcy5vcHRpb25zLnBhcmFtcyAhO1xuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAob2xkUGFyYW1zW3Byb3BdID09IG51bGwpIHtcbiAgICAgICAgICBvbGRQYXJhbXNbcHJvcF0gPSBuZXdQYXJhbXNbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9JRF9WQUxVRSA9ICd2b2lkJztcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUQVRFX1ZBTFVFID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHByaXZhdGUgX3RyaWdnZXJzOiB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuICBwcml2YXRlIF9xdWV1ZTogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfZWxlbWVudExpc3RlbmVycyA9IG5ldyBNYXA8YW55LCBUcmlnZ2VyTGlzdGVuZXJbXT4oKTtcblxuICBwcml2YXRlIF9ob3N0Q2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGhvc3RFbGVtZW50OiBhbnksIHByaXZhdGUgX2VuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSkge1xuICAgIHRoaXMuX2hvc3RDbGFzc05hbWUgPSAnbmctdG5zLScgKyBpZDtcbiAgICBhZGRDbGFzcyhob3N0RWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7XG4gIH1cblxuICBsaXN0ZW4oZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKCF0aGlzLl90cmlnZ2Vycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7XG4gICAgICAgICAgcGhhc2V9XCIgYmVjYXVzZSB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgZG9lc25cXCd0IGV4aXN0IWApO1xuICAgIH1cblxuICAgIGlmIChwaGFzZSA9PSBudWxsIHx8IHBoYXNlLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBsaXN0ZW4gb24gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtcbiAgICAgICAgICBuYW1lfVwiIGJlY2F1c2UgdGhlIHByb3ZpZGVkIGV2ZW50IGlzIHVuZGVmaW5lZCFgKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzVHJpZ2dlckV2ZW50VmFsaWQocGhhc2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7cGhhc2V9XCIgZm9yIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBpcyBub3Qgc3VwcG9ydGVkIWApO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLCBlbGVtZW50LCBbXSk7XG4gICAgY29uc3QgZGF0YSA9IHtuYW1lLCBwaGFzZSwgY2FsbGJhY2t9O1xuICAgIGxpc3RlbmVycy5wdXNoKGRhdGEpO1xuXG4gICAgY29uc3QgdHJpZ2dlcnNXaXRoU3RhdGVzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQsIGVsZW1lbnQsIHt9KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyBuYW1lKTtcbiAgICAgIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBpcyByZW1vdmVkIEFGVEVSIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCBsZWF2ZSBhbmltYXRpb25zIGNhbGxiYWNrcyBjYW4gZmlyZSAob3RoZXJ3aXNlIGlmIHRoZSBub2RlXG4gICAgICAvLyBpcyByZW1vdmVkIGluIGJldHdlZW4gdGhlbiB0aGUgbGlzdGVuZXJzIHdvdWxkIGJlIGRlcmVnaXN0ZXJlZClcbiAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihkYXRhKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgICAgICBkZWxldGUgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBhc3Q6IEFuaW1hdGlvblRyaWdnZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgIC8vIHRocm93XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RyaWdnZXJzW25hbWVdID0gYXN0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHJpZ2dlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG4gICAgaWYgKCF0cmlnZ2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBoYXMgbm90IGJlZW4gcmVnaXN0ZXJlZCFgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyaWdnZXI7XG4gIH1cblxuICB0cmlnZ2VyKGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgZGVmYXVsdFRvRmFsbGJhY2s6IGJvb2xlYW4gPSB0cnVlKTpcbiAgICAgIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJ8dW5kZWZpbmVkIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fZ2V0VHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgbGV0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICghdHJpZ2dlcnNXaXRoU3RhdGVzKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSArICctJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuc2V0KGVsZW1lbnQsIHRyaWdnZXJzV2l0aFN0YXRlcyA9IHt9KTtcbiAgICB9XG5cbiAgICBsZXQgZnJvbVN0YXRlID0gdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXTtcbiAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUodmFsdWUsIHRoaXMuaWQpO1xuXG4gICAgY29uc3QgaXNPYmogPSB2YWx1ZSAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBpZiAoIWlzT2JqICYmIGZyb21TdGF0ZSkge1xuICAgICAgdG9TdGF0ZS5hYnNvcmJPcHRpb25zKGZyb21TdGF0ZS5vcHRpb25zKTtcbiAgICB9XG5cbiAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdID0gdG9TdGF0ZTtcblxuICAgIGlmICghZnJvbVN0YXRlKSB7XG4gICAgICBmcm9tU3RhdGUgPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH1cblxuICAgIGNvbnN0IGlzUmVtb3ZhbCA9IHRvU3RhdGUudmFsdWUgPT09IFZPSURfVkFMVUU7XG5cbiAgICAvLyBub3JtYWxseSB0aGlzIGlzbid0IHJlYWNoZWQgYnkgaGVyZSwgaG93ZXZlciwgaWYgYW4gb2JqZWN0IGV4cHJlc3Npb25cbiAgICAvLyBpcyBwYXNzZWQgaW4gdGhlbiBpdCBtYXkgYmUgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS4gQ29tcGFyaW5nIHRoZSB2YWx1ZVxuICAgIC8vIGlzIGltcG9ydGFudCBzaW5jZSB0aGF0IHdpbGwgc3RheSB0aGUgc2FtZSBkZXNwaXRlIHRoZXJlIGJlaW5nIGEgbmV3IG9iamVjdC5cbiAgICAvLyBUaGUgcmVtb3ZhbCBhcmMgaGVyZSBpcyBzcGVjaWFsIGNhc2VkIGJlY2F1c2UgdGhlIHNhbWUgZWxlbWVudCBpcyB0cmlnZ2VyZWRcbiAgICAvLyB0d2ljZSBpbiB0aGUgZXZlbnQgdGhhdCBpdCBjb250YWlucyBhbmltYXRpb25zIG9uIHRoZSBvdXRlci9pbm5lciBwb3J0aW9uc1xuICAgIC8vIG9mIHRoZSBob3N0IGNvbnRhaW5lclxuICAgIGlmICghaXNSZW1vdmFsICYmIGZyb21TdGF0ZS52YWx1ZSA9PT0gdG9TdGF0ZS52YWx1ZSkge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGRlc3BpdGUgdGhlIHZhbHVlIG5vdCBjaGFuZ2luZywgc29tZSBpbm5lciBwYXJhbXNcbiAgICAgIC8vIGhhdmUgY2hhbmdlZCB3aGljaCBtZWFucyB0aGF0IHRoZSBhbmltYXRpb24gZmluYWwgc3R5bGVzIG5lZWQgdG8gYmUgYXBwbGllZFxuICAgICAgaWYgKCFvYmpFcXVhbHMoZnJvbVN0YXRlLnBhcmFtcywgdG9TdGF0ZS5wYXJhbXMpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICAgICAgY29uc3QgZnJvbVN0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXMoZnJvbVN0YXRlLnZhbHVlLCBmcm9tU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBjb25zdCB0b1N0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXModG9TdGF0ZS52YWx1ZSwgdG9TdGF0ZS5wYXJhbXMsIGVycm9ycyk7XG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgZnJvbVN0eWxlcyk7XG4gICAgICAgICAgICBzZXRTdHlsZXMoZWxlbWVudCwgdG9TdHlsZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyc09uRWxlbWVudDogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID1cbiAgICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LCBlbGVtZW50LCBbXSk7XG4gICAgcGxheWVyc09uRWxlbWVudC5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAvLyBvbmx5IHJlbW92ZSB0aGUgcGxheWVyIGlmIGl0IGlzIHF1ZXVlZCBvbiB0aGUgRVhBQ1Qgc2FtZSB0cmlnZ2VyL25hbWVzcGFjZVxuICAgICAgLy8gd2Ugb25seSBhbHNvIGRlYWwgd2l0aCBxdWV1ZWQgcGxheWVycyBoZXJlIGJlY2F1c2UgaWYgdGhlIGFuaW1hdGlvbiBoYXNcbiAgICAgIC8vIHN0YXJ0ZWQgdGhlbiB3ZSB3YW50IHRvIGtlZXAgdGhlIHBsYXllciBhbGl2ZSB1bnRpbCB0aGUgZmx1c2ggaGFwcGVuc1xuICAgICAgLy8gKHdoaWNoIGlzIHdoZXJlIHRoZSBwcmV2aW91c1BsYXllcnMgYXJlIHBhc3NlZCBpbnRvIHRoZSBuZXcgcGFseWVyKVxuICAgICAgaWYgKHBsYXllci5uYW1lc3BhY2VJZCA9PSB0aGlzLmlkICYmIHBsYXllci50cmlnZ2VyTmFtZSA9PSB0cmlnZ2VyTmFtZSAmJiBwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgdHJhbnNpdGlvbiA9XG4gICAgICAgIHRyaWdnZXIubWF0Y2hUcmFuc2l0aW9uKGZyb21TdGF0ZS52YWx1ZSwgdG9TdGF0ZS52YWx1ZSwgZWxlbWVudCwgdG9TdGF0ZS5wYXJhbXMpO1xuICAgIGxldCBpc0ZhbGxiYWNrVHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgaWYgKCFkZWZhdWx0VG9GYWxsYmFjaykgcmV0dXJuO1xuICAgICAgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKFxuICAgICAgICB7ZWxlbWVudCwgdHJpZ2dlck5hbWUsIHRyYW5zaXRpb24sIGZyb21TdGF0ZSwgdG9TdGF0ZSwgcGxheWVyLCBpc0ZhbGxiYWNrVHJhbnNpdGlvbn0pO1xuXG4gICAgaWYgKCFpc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgUVVFVUVEX0NMQVNTTkFNRSk7XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiB7IHJlbW92ZUNsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpOyB9KTtcbiAgICB9XG5cbiAgICBwbGF5ZXIub25Eb25lKCgpID0+IHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGxheWVycyA9IHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIHBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICBwbGF5ZXJzT25FbGVtZW50LnB1c2gocGxheWVyKTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBkZXJlZ2lzdGVyKG5hbWU6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLl90cmlnZ2Vyc1tuYW1lXTtcblxuICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZm9yRWFjaCgoc3RhdGVNYXAsIGVsZW1lbnQpID0+IHsgZGVsZXRlIHN0YXRlTWFwW25hbWVdOyB9KTtcblxuICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXJzLCBlbGVtZW50KSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLnNldChcbiAgICAgICAgICBlbGVtZW50LCBsaXN0ZW5lcnMuZmlsdGVyKGVudHJ5ID0+IHsgcmV0dXJuIGVudHJ5Lm5hbWUgIT0gbmFtZTsgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudDogYW55KSB7XG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5kZWxldGUoZWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudFBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyhyb290RWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIC8vIGVtdWxhdGUgYSBsZWF2ZSBhbmltYXRpb24gZm9yIGFsbCBpbm5lciBub2RlcyB3aXRoaW4gdGhpcyBub2RlLlxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBhbmltYXRpb25zIGZvdW5kIGZvciBhbnkgb2YgdGhlIG5vZGVzIHRoZW4gY2xlYXIgdGhlIGNhY2hlXG4gICAgLy8gZm9yIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuX2VuZ2luZS5kcml2ZXIucXVlcnkocm9vdEVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpLmZvckVhY2goZWxtID0+IHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhbiBpbm5lciByZW1vdmUoKSBvcGVyYXRpb24gaGFzIGFscmVhZHkga2lja2VkIG9mZlxuICAgICAgLy8gdGhlIGFuaW1hdGlvbiBvbiB0aGlzIGVsZW1lbnQuLi5cbiAgICAgIGlmIChlbG1bUkVNT1ZBTF9GTEFHXSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBuYW1lc3BhY2VzID0gdGhpcy5fZW5naW5lLmZldGNoTmFtZXNwYWNlc0J5RWxlbWVudChlbG0pO1xuICAgICAgaWYgKG5hbWVzcGFjZXMuc2l6ZSkge1xuICAgICAgICBuYW1lc3BhY2VzLmZvckVhY2gobnMgPT4gbnMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsbSwgY29udGV4dCwgZmFsc2UsIHRydWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRyaWdnZXJMZWF2ZUFuaW1hdGlvbihcbiAgICAgIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBkZXN0cm95QWZ0ZXJDb21wbGV0ZT86IGJvb2xlYW4sXG4gICAgICBkZWZhdWx0VG9GYWxsYmFjaz86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBjb25zdCB0cmlnZ2VyU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHRyaWdnZXJTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXModHJpZ2dlclN0YXRlcykuZm9yRWFjaCh0cmlnZ2VyTmFtZSA9PiB7XG4gICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgaGVyZSBpbiB0aGUgZXZlbnQgdGhhdCBhbiBlbGVtZW50IGlzIHJlbW92ZWRcbiAgICAgICAgLy8gdHdpY2UgKGJvdGggb24gdGhlIGhvc3QgbGV2ZWwgYW5kIHRoZSBjb21wb25lbnQgbGV2ZWwpXG4gICAgICAgIGlmICh0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV0pIHtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLnRyaWdnZXIoZWxlbWVudCwgdHJpZ2dlck5hbWUsIFZPSURfVkFMVUUsIGRlZmF1bHRUb0ZhbGxiYWNrKTtcbiAgICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIHRydWUsIGNvbnRleHQpO1xuICAgICAgICBpZiAoZGVzdHJveUFmdGVyQ29tcGxldGUpIHtcbiAgICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB0aGlzLl9lbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBjb25zdCB2aXNpdGVkVHJpZ2dlcnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlck5hbWUgPSBsaXN0ZW5lci5uYW1lO1xuICAgICAgICBpZiAodmlzaXRlZFRyaWdnZXJzLmhhcyh0cmlnZ2VyTmFtZSkpIHJldHVybjtcbiAgICAgICAgdmlzaXRlZFRyaWdnZXJzLmFkZCh0cmlnZ2VyTmFtZSk7XG5cbiAgICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXTtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgZnJvbVN0YXRlID0gZWxlbWVudFN0YXRlc1t0cmlnZ2VyTmFtZV0gfHwgREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICAgICAgY29uc3QgdG9TdGF0ZSA9IG5ldyBTdGF0ZVZhbHVlKFZPSURfVkFMVUUpO1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcih0aGlzLmlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5fZW5naW5lLnRvdGFsUXVldWVkUGxheWVycysrO1xuICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIHRyaWdnZXJOYW1lLFxuICAgICAgICAgIHRyYW5zaXRpb24sXG4gICAgICAgICAgZnJvbVN0YXRlLFxuICAgICAgICAgIHRvU3RhdGUsXG4gICAgICAgICAgcGxheWVyLFxuICAgICAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlTm9kZShlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX2VuZ2luZTtcblxuICAgIGlmIChlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSB7XG4gICAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2VycyhlbGVtZW50LCBjb250ZXh0LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYSAqID0+IFZPSUQgYW5pbWF0aW9uIHdhcyBkZXRlY3RlZCBhbmQga2lja2VkIG9mZlxuICAgIGlmICh0aGlzLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbGVtZW50LCBjb250ZXh0LCB0cnVlKSkgcmV0dXJuO1xuXG4gICAgLy8gZmluZCB0aGUgcGxheWVyIHRoYXQgaXMgYW5pbWF0aW5nIGFuZCBtYWtlIHN1cmUgdGhhdCB0aGVcbiAgICAvLyByZW1vdmFsIGlzIGRlbGF5ZWQgdW50aWwgdGhhdCBwbGF5ZXIgaGFzIGNvbXBsZXRlZFxuICAgIGxldCBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoZW5naW5lLnRvdGFsQW5pbWF0aW9ucykge1xuICAgICAgY29uc3QgY3VycmVudFBsYXllcnMgPVxuICAgICAgICAgIGVuZ2luZS5wbGF5ZXJzLmxlbmd0aCA/IGVuZ2luZS5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCkgOiBbXTtcblxuICAgICAgLy8gd2hlbiB0aGlzIGBpZiBzdGF0ZW1lbnRgIGRvZXMgbm90IGNvbnRpbnVlIGZvcndhcmQgaXQgbWVhbnMgdGhhdFxuICAgICAgLy8gYSBwcmV2aW91cyBhbmltYXRpb24gcXVlcnkgaGFzIHNlbGVjdGVkIHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kXG4gICAgICAvLyBpcyBhbmltYXRpbmcgaXQuIEluIHRoaXMgc2l0dWF0aW9uIHdhbnQgdG8gY29udGludWUgZm9yd2FyZHMgYW5kXG4gICAgICAvLyBhbGxvdyB0aGUgZWxlbWVudCB0byBiZSBxdWV1ZWQgdXAgZm9yIGFuaW1hdGlvbiBsYXRlci5cbiAgICAgIGlmIChjdXJyZW50UGxheWVycyAmJiBjdXJyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50O1xuICAgICAgICB3aGlsZSAocGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IGVuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KHBhcmVudCk7XG4gICAgICAgICAgaWYgKHRyaWdnZXJzKSB7XG4gICAgICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBzdGFnZSB3ZSBrbm93IHRoYXQgdGhlIGVsZW1lbnQgd2lsbCBlaXRoZXIgZ2V0IHJlbW92ZWRcbiAgICAvLyBkdXJpbmcgZmx1c2ggb3Igd2lsbCBiZSBwaWNrZWQgdXAgYnkgYSBwYXJlbnQgcXVlcnkuIEVpdGhlciB3YXlcbiAgICAvLyB3ZSBuZWVkIHRvIGZpcmUgdGhlIGxpc3RlbmVycyBmb3IgdGhpcyBlbGVtZW50IHdoZW4gaXQgRE9FUyBnZXRcbiAgICAvLyByZW1vdmVkIChvbmNlIHRoZSBxdWVyeSBwYXJlbnQgYW5pbWF0aW9uIGlzIGRvbmUgb3IgYWZ0ZXIgZmx1c2gpXG4gICAgdGhpcy5wcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudCk7XG5cbiAgICAvLyB3aGV0aGVyIG9yIG5vdCBhIHBhcmVudCBoYXMgYW4gYW5pbWF0aW9uIHdlIG5lZWQgdG8gZGVsYXkgdGhlIGRlZmVycmFsIG9mIHRoZSBsZWF2ZVxuICAgIC8vIG9wZXJhdGlvbiB1bnRpbCB3ZSBoYXZlIG1vcmUgaW5mb3JtYXRpb24gKHdoaWNoIHdlIGRvIGFmdGVyIGZsdXNoKCkgaGFzIGJlZW4gY2FsbGVkKVxuICAgIGlmIChjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24pIHtcbiAgICAgIGVuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlIGRvIHRoaXMgYWZ0ZXIgdGhlIGZsdXNoIGhhcyBvY2N1cnJlZCBzdWNoXG4gICAgICAvLyB0aGF0IHRoZSBjYWxsYmFja3MgY2FuIGJlIGZpcmVkXG4gICAgICBlbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpKTtcbiAgICAgIGVuZ2luZS5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgZW5naW5lLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnROb2RlKGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnkpOiB2b2lkIHsgYWRkQ2xhc3MoZWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7IH1cblxuICBkcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkOiBudW1iZXIpOiBRdWV1ZUluc3RydWN0aW9uW10ge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG4gICAgdGhpcy5fcXVldWUuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICBpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXI6IFRyaWdnZXJMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgIGlmIChsaXN0ZW5lci5uYW1lID09IGVudHJ5LnRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlRXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICAgICAgICAgICAgZWxlbWVudCwgZW50cnkudHJpZ2dlck5hbWUsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAoYmFzZUV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBtaWNyb3Rhc2tJZDtcbiAgICAgICAgICAgIGxpc3Rlbk9uUGxheWVyKGVudHJ5LnBsYXllciwgbGlzdGVuZXIucGhhc2UsIGJhc2VFdmVudCwgbGlzdGVuZXIuY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXIubWFya2VkRm9yRGVzdHJveSkge1xuICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgLy8gbm93IHdlIGNhbiBkZXN0cm95IHRoZSBlbGVtZW50IHByb3Blcmx5IHNpbmNlIHRoZSBldmVudCBsaXN0ZW5lcnMgaGF2ZVxuICAgICAgICAgIC8vIGJlZW4gYm91bmQgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVldWUgPSBbXTtcblxuICAgIHJldHVybiBpbnN0cnVjdGlvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8gaWYgZGVwQ291bnQgPT0gMCB0aGVtIG1vdmUgdG8gZnJvbnRcbiAgICAgIC8vIG90aGVyd2lzZSBpZiBhIGNvbnRhaW5zIGIgdGhlbiBtb3ZlIGJhY2tcbiAgICAgIGNvbnN0IGQwID0gYS50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGNvbnN0IGQxID0gYi50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGlmIChkMCA9PSAwIHx8IGQxID09IDApIHtcbiAgICAgICAgcmV0dXJuIGQwIC0gZDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZW5naW5lLmRyaXZlci5jb250YWluc0VsZW1lbnQoYS5lbGVtZW50LCBiLmVsZW1lbnQpID8gMSA6IC0xO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveShjb250ZXh0OiBhbnkpIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHAuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyh0aGlzLmhvc3RFbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBjb250YWluc0RhdGEgPVxuICAgICAgICAodGhpcy5fcXVldWUuZmluZChlbnRyeSA9PiBlbnRyeS5lbGVtZW50ID09PSBlbGVtZW50KSA/IHRydWUgOiBmYWxzZSkgfHwgY29udGFpbnNEYXRhO1xuICAgIHJldHVybiBjb250YWluc0RhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZWRUcmFuc2l0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uO1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBwdWJsaWMgbmV3SG9zdEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHBsYXllcnNCeVF1ZXJpZWRFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHN0YXRlc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBTdGF0ZVZhbHVlfT4oKTtcbiAgcHVibGljIGRpc2FibGVkTm9kZXMgPSBuZXcgU2V0PGFueT4oKTtcblxuICBwdWJsaWMgdG90YWxBbmltYXRpb25zID0gMDtcbiAgcHVibGljIHRvdGFsUXVldWVkUGxheWVycyA9IDA7XG5cbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTG9va3VwOiB7W2lkOiBzdHJpbmddOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlfSA9IHt9O1xuICBwcml2YXRlIF9uYW1lc3BhY2VMaXN0OiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmx1c2hGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHJpdmF0ZSBfd2hlblF1aWV0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG5cbiAgcHVibGljIG5hbWVzcGFjZXNCeUhvc3RFbGVtZW50ID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBjb2xsZWN0ZWRFbnRlckVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuICBwdWJsaWMgY29sbGVjdGVkTGVhdmVFbGVtZW50czogYW55W10gPSBbXTtcblxuICAvLyB0aGlzIG1ldGhvZCBpcyBkZXNpZ25lZCB0byBiZSBvdmVycmlkZGVuIGJ5IHRoZSBjb2RlIHRoYXQgdXNlcyB0aGlzIGVuZ2luZVxuICBwdWJsaWMgb25SZW1vdmFsQ29tcGxldGUgPSAoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpID0+IHt9O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSB7IHRoaXMub25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7IH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHByaXZhdGUgX25vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcikge31cblxuICBnZXQgcXVldWVkUGxheWVycygpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIHRoaXMuX25hbWVzcGFjZUxpc3QuZm9yRWFjaChucyA9PiB7XG4gICAgICBucy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IG5zID0gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50LCB0aGlzKTtcbiAgICBpZiAoaG9zdEVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGhvc3RFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVmZXIgdGhpcyBsYXRlciB1bnRpbCBmbHVzaCBkdXJpbmcgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGhhc1xuICAgICAgLy8gYmVlbiBpbnNlcnRlZCBzbyB0aGF0IHdlIGtub3cgZXhhY3RseSB3aGVyZSB0byBwbGFjZSBpdCBpblxuICAgICAgLy8gdGhlIG5hbWVzcGFjZSBsaXN0XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcblxuICAgICAgLy8gZ2l2ZW4gdGhhdCB0aGlzIGhvc3QgZWxlbWVudCBpcyBhcGFydCBvZiB0aGUgYW5pbWF0aW9uIGNvZGUsIGl0XG4gICAgICAvLyBtYXkgb3IgbWF5IG5vdCBiZSBpbnNlcnRlZCBieSBhIHBhcmVudCBub2RlIHRoYXQgaXMgYW4gb2YgYW5cbiAgICAgIC8vIGFuaW1hdGlvbiByZW5kZXJlciB0eXBlLiBJZiB0aGlzIGhhcHBlbnMgdGhlbiB3ZSBjYW4gc3RpbGwgaGF2ZVxuICAgICAgLy8gYWNjZXNzIHRvIHRoaXMgaXRlbSB3aGVuIHdlIHF1ZXJ5IGZvciA6ZW50ZXIgbm9kZXMuIElmIHRoZSBwYXJlbnRcbiAgICAgIC8vIGlzIGEgcmVuZGVyZXIgdGhlbiB0aGUgc2V0IGRhdGEtc3RydWN0dXJlIHdpbGwgbm9ybWFsaXplIHRoZSBlbnRyeVxuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF0gPSBucztcbiAgfVxuXG4gIHByaXZhdGUgX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7XG4gICAgaWYgKGxpbWl0ID49IDApIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaSA9IGxpbWl0OyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBuZXh0TmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChuZXh0TmFtZXNwYWNlLmhvc3RFbGVtZW50LCBob3N0RWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpICsgMSwgMCwgbnMpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZSgwLCAwLCBucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3QucHVzaChucyk7XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAoIW5zKSB7XG4gICAgICBucyA9IHRoaXMuY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyVHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHRyaWdnZXI6IEFuaW1hdGlvblRyaWdnZXIpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmIChucyAmJiBucy5yZWdpc3RlcihuYW1lLCB0cmlnZ2VyKSkge1xuICAgICAgdGhpcy50b3RhbEFuaW1hdGlvbnMrKztcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIGlmICghbmFtZXNwYWNlSWQpIHJldHVybjtcblxuICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZGVsZXRlKG5zLmhvc3RFbGVtZW50KTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9uYW1lc3BhY2VMaXN0LmluZGV4T2YobnMpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoKCkgPT4gbnMuZGVzdHJveShjb250ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIF9mZXRjaE5hbWVzcGFjZShpZDogc3RyaW5nKSB7IHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbaWRdOyB9XG5cbiAgZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsZW1lbnQ6IGFueSk6IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPiB7XG4gICAgLy8gbm9ybWFsbHkgdGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIG5hbWVzcGFjZSBwZXIgZWxlbWVudCwgaG93ZXZlclxuICAgIC8vIGlmIEB0cmlnZ2VycyBhcmUgcGxhY2VkIG9uIGJvdGggdGhlIGNvbXBvbmVudCBlbGVtZW50IGFuZCB0aGVuXG4gICAgLy8gaXRzIGhvc3QgZWxlbWVudCAod2l0aGluIHRoZSBjb21wb25lbnQgY29kZSkgdGhlbiB0aGVyZSB3aWxsIGJlXG4gICAgLy8gdHdvIG5hbWVzcGFjZXMgcmV0dXJuZWQuIFdlIHVzZSBhIHNldCBoZXJlIHRvIHNpbXBseSB0aGUgZGVkdXBlXG4gICAgLy8gb2YgbmFtZXNwYWNlcyBpbmNhc2UgdGhlcmUgYXJlIG11bHRpcGxlIHRyaWdnZXJzIGJvdGggdGhlIGVsbSBhbmQgaG9zdFxuICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFN0YXRlcykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGVsZW1lbnRTdGF0ZXMpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5zSWQgPSBlbGVtZW50U3RhdGVzW2tleXNbaV1dLm5hbWVzcGFjZUlkO1xuICAgICAgICBpZiAobnNJZCkge1xuICAgICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobnNJZCk7XG4gICAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgICBuYW1lc3BhY2VzLmFkZChucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuYW1lc3BhY2VzO1xuICB9XG5cbiAgdHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcbiAgICAgIGlmIChucykge1xuICAgICAgICBucy50cmlnZ2VyKGVsZW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGluc2VydE5vZGUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBwYXJlbnQ6IGFueSwgaW5zZXJ0QmVmb3JlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCFpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSByZXR1cm47XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGFuZCByZWluc2VydGVkIChtb3ZlIG9wZXJhdGlvbilcbiAgICAvLyB3aGVuIHRoaXMgb2NjdXJzIHdlIGRvIG5vdCB3YW50IHRvIHVzZSB0aGUgZWxlbWVudCBmb3IgZGVsZXRpb24gbGF0ZXJcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCA9IGZhbHNlO1xuICAgICAgZGV0YWlscy5zZXRGb3JNb3ZlID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmluZGV4T2YoZWxlbWVudCk7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB0aGUgbmFtZXNwYWNlSWQgaXMgYmxhbmsgdGhlbiB0aGUgY2FsbGVyXG4gICAgLy8gY29kZSBkb2VzIG5vdCBjb250YWluIGFueSBhbmltYXRpb24gY29kZSBpbiBpdCwgYnV0IGl0IGlzXG4gICAgLy8ganVzdCBiZWluZyBjYWxsZWQgc28gdGhhdCB0aGUgbm9kZSBpcyBtYXJrZWQgYXMgYmVpbmcgaW5zZXJ0ZWRcbiAgICBpZiAobmFtZXNwYWNlSWQpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuICAgICAgLy8gVGhpcyBpZi1zdGF0ZW1lbnQgaXMgYSB3b3JrYXJvdW5kIGZvciByb3V0ZXIgaXNzdWUgIzIxOTQ3LlxuICAgICAgLy8gVGhlIHJvdXRlciBzb21ldGltZXMgaGl0cyBhIHJhY2UgY29uZGl0aW9uIHdoZXJlIHdoaWxlIGEgcm91dGVcbiAgICAgIC8vIGlzIGJlaW5nIGluc3RhbnRpYXRlZCBhIG5ldyBuYXZpZ2F0aW9uIGFycml2ZXMsIHRyaWdnZXJpbmcgbGVhdmVcbiAgICAgIC8vIGFuaW1hdGlvbiBvZiBET00gdGhhdCBoYXMgbm90IGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIHVudGlsIHRoaXNcbiAgICAgIC8vIGlzIHJlc29sdmVkLCB3ZSBuZWVkIHRvIGhhbmRsZSB0aGUgc2NlbmFyaW8gd2hlbiBET00gaXMgbm90IGluIGFcbiAgICAgIC8vIGNvbnNpc3RlbnQgc3RhdGUgZHVyaW5nIHRoZSBhbmltYXRpb24uXG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMuaW5zZXJ0Tm9kZShlbGVtZW50LCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG9ubHkgKmRpcmVjdGl2ZXMgYW5kIGhvc3QgZWxlbWVudHMgYXJlIGluc2VydGVkIGJlZm9yZVxuICAgIGlmIChpbnNlcnRCZWZvcmUpIHtcbiAgICAgIHRoaXMuY29sbGVjdEVudGVyRWxlbWVudChlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBjb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQ6IGFueSkgeyB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMucHVzaChlbGVtZW50KTsgfVxuXG4gIG1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50OiBhbnksIHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZWROb2Rlcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5kZWxldGUoZWxlbWVudCk7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIWlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHRoaXMuX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5zID0gbmFtZXNwYWNlSWQgPyB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkgOiBudWxsO1xuICAgIGlmIChucykge1xuICAgICAgbnMucmVtb3ZlTm9kZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tYXJrRWxlbWVudEFzUmVtb3ZlZChuYW1lc3BhY2VJZCwgZWxlbWVudCwgZmFsc2UsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIG1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaGFzQW5pbWF0aW9uPzogYm9vbGVhbiwgY29udGV4dD86IGFueSkge1xuICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IHtcbiAgICAgIG5hbWVzcGFjZUlkLFxuICAgICAgc2V0Rm9yUmVtb3ZhbDogY29udGV4dCwgaGFzQW5pbWF0aW9uLFxuICAgICAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuKTogKCkgPT4gYW55IHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKS5saXN0ZW4oZWxlbWVudCwgbmFtZSwgcGhhc2UsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9O1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRJbnN0cnVjdGlvbihcbiAgICAgIGVudHJ5OiBRdWV1ZUluc3RydWN0aW9uLCBzdWJUaW1lbGluZXM6IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgICAgIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZW50cnkudHJhbnNpdGlvbi5idWlsZChcbiAgICAgICAgdGhpcy5kcml2ZXIsIGVudHJ5LmVsZW1lbnQsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSwgZW50ZXJDbGFzc05hbWUsXG4gICAgICAgIGxlYXZlQ2xhc3NOYW1lLCBlbnRyeS5mcm9tU3RhdGUub3B0aW9ucywgZW50cnkudG9TdGF0ZS5vcHRpb25zLCBzdWJUaW1lbGluZXMpO1xuICB9XG5cbiAgZGVzdHJveUlubmVyQW5pbWF0aW9ucyhjb250YWluZXJFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5kZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudCkpO1xuXG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuc2l6ZSA9PSAwKSByZXR1cm47XG5cbiAgICBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50KSk7XG4gIH1cblxuICBkZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBzZXQgZm9yIGRlc3RydWN0aW9uLCBidXQgaGFzbid0IHN0YXJ0ZWQuXG4gICAgICAgIC8vIGluIHRoaXMgc2l0dWF0aW9uIHdlIHdhbnQgdG8gZGVsYXkgdGhlIGRlc3RydWN0aW9uIHVudGlsIHRoZSBmbHVzaCBvY2N1cnNcbiAgICAgICAgLy8gc28gdGhhdCBhbnkgZXZlbnQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBwbGF5ZXIgYXJlIHRyaWdnZXJlZC5cbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXIubWFya2VkRm9yRGVzdHJveSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmZpbmlzaCgpKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpbWl6ZUdyb3VwUGxheWVyKHRoaXMucGxheWVycykub25Eb25lKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgLy8gdGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSByZW1vdmluZyBpdCB0d2ljZVxuICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkFMX1NUQVRFO1xuICAgICAgaWYgKGRldGFpbHMubmFtZXNwYWNlSWQpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKGRldGFpbHMubmFtZXNwYWNlSWQpO1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBucy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgZGV0YWlscy5zZXRGb3JSZW1vdmFsKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kcml2ZXIubWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IpKSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IsIHRydWUpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICBmbHVzaChtaWNyb3Rhc2tJZDogbnVtYmVyID0gLTEpIHtcbiAgICBsZXQgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAodGhpcy5uZXdIb3N0RWxlbWVudHMuc2l6ZSkge1xuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuZm9yRWFjaCgobnMsIGVsZW1lbnQpID0+IHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBlbGVtZW50KSk7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvdGFsQW5pbWF0aW9ucyAmJiB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbG0gPSB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHNbaV07XG4gICAgICAgIGFkZENsYXNzKGVsbSwgU1RBUl9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAmJlxuICAgICAgICAodGhpcy50b3RhbFF1ZXVlZFBsYXllcnMgfHwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgIGNvbnN0IGNsZWFudXBGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBsYXllcnMgPSB0aGlzLl9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZucywgbWljcm90YXNrSWQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGVhbnVwRm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2xlYW51cEZuc1tpXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRvdGFsUXVldWVkUGxheWVycyA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fZmx1c2hGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9mbHVzaEZucyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX3doZW5RdWlldEZucy5sZW5ndGgpIHtcbiAgICAgIC8vIHdlIG1vdmUgdGhlc2Ugb3ZlciB0byBhIHZhcmlhYmxlIHNvIHRoYXRcbiAgICAgIC8vIGlmIGFueSBuZXcgY2FsbGJhY2tzIGFyZSByZWdpc3RlcmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGZsdXNoIHRoZXkgZG8gbm90IHBvcHVsYXRlIHRoZSBleGlzdGluZyBzZXRcbiAgICAgIGNvbnN0IHF1aWV0Rm5zID0gdGhpcy5fd2hlblF1aWV0Rm5zO1xuICAgICAgdGhpcy5fd2hlblF1aWV0Rm5zID0gW107XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB7IHF1aWV0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBvcnRFcnJvcihlcnJvcnM6IHN0cmluZ1tdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIHByb2Nlc3MgYW5pbWF0aW9ucyBkdWUgdG8gdGhlIGZvbGxvd2luZyBmYWlsZWQgdHJpZ2dlciB0cmFuc2l0aW9uc1xcbiAke1xuICAgICAgICAgICAgZXJyb3JzLmpvaW4oJ1xcbicpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hBbmltYXRpb25zKGNsZWFudXBGbnM6IEZ1bmN0aW9uW10sIG1pY3JvdGFza0lkOiBudW1iZXIpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBzdWJUaW1lbGluZXMgPSBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHNraXBwZWRQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IHF1ZXVlZEluc3RydWN0aW9uczogUXVldWVkVHJhbnNpdGlvbltdID0gW107XG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICBjb25zdCBhbGxQcmVTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuICAgIGNvbnN0IGFsbFBvc3RTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuXG4gICAgY29uc3QgZGlzYWJsZWRFbGVtZW50c1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZSk7XG4gICAgICBjb25zdCBub2Rlc1RoYXRBcmVEaXNhYmxlZCA9IHRoaXMuZHJpdmVyLnF1ZXJ5KG5vZGUsIFFVRVVFRF9TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzVGhhdEFyZURpc2FibGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc2FibGVkRWxlbWVudHNTZXQuYWRkKG5vZGVzVGhhdEFyZURpc2FibGVkW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJvZHlOb2RlID0gZ2V0Qm9keU5vZGUoKTtcbiAgICBjb25zdCBhbGxUcmlnZ2VyRWxlbWVudHMgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGVzQnlFbGVtZW50LmtleXMoKSk7XG4gICAgY29uc3QgZW50ZXJOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzKTtcblxuICAgIC8vIHRoaXMgbXVzdCBvY2N1ciBiZWZvcmUgdGhlIGluc3RydWN0aW9ucyBhcmUgYnVpbHQgYmVsb3cgc3VjaCB0aGF0XG4gICAgLy8gdGhlIDplbnRlciBxdWVyaWVzIG1hdGNoIHRoZSBlbGVtZW50cyAoc2luY2UgdGhlIHRpbWVsaW5lIHF1ZXJpZXNcbiAgICAvLyBhcmUgZmlyZWQgZHVyaW5nIGluc3RydWN0aW9uIGJ1aWxkaW5nKS5cbiAgICBjb25zdCBlbnRlck5vZGVNYXBJZHMgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgIGxldCBpID0gMDtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IEVOVEVSX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGVudGVyTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbExlYXZlTm9kZXM6IGFueVtdID0gW107XG4gICAgY29uc3QgbWVyZ2VkTGVhdmVOb2RlcyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgICAgYWxsTGVhdmVOb2Rlcy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgaWYgKGRldGFpbHMuaGFzQW5pbWF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgU1RBUl9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChlbG0gPT4gbWVyZ2VkTGVhdmVOb2Rlcy5hZGQoZWxtKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxlYXZlTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgY29uc3QgbGVhdmVOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgQXJyYXkuZnJvbShtZXJnZWRMZWF2ZU5vZGVzKSk7XG4gICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBMRUFWRV9DTEFTU05BTUUgKyBpKys7XG4gICAgICBsZWF2ZU5vZGVNYXBJZHMuc2V0KHJvb3QsIGNsYXNzTmFtZSk7XG4gICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgfSk7XG5cbiAgICBjbGVhbnVwRm5zLnB1c2goKCkgPT4ge1xuICAgICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGxlYXZlTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBsZWF2ZU5vZGVNYXBJZHMuZ2V0KHJvb3QpICE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxMZWF2ZU5vZGVzLmZvckVhY2goZWxlbWVudCA9PiB7IHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTsgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGxQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBlcnJvbmVvdXNUcmFuc2l0aW9uczogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9uYW1lc3BhY2VMaXN0W2ldO1xuICAgICAgbnMuZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZCkuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IGVudHJ5LnBsYXllcjtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICAgIGFsbFBsYXllcnMucHVzaChwbGF5ZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICAgICAgLy8gbW92ZSBhbmltYXRpb25zIGFyZSBjdXJyZW50bHkgbm90IHN1cHBvcnRlZC4uLlxuICAgICAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yTW92ZSkge1xuICAgICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWJvZHlOb2RlIHx8ICF0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQoYm9keU5vZGUsIGVsZW1lbnQpKSB7XG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsZWF2ZUNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgZW50ZXJDbGFzc05hbWUgPSBlbnRlck5vZGVNYXBJZHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uID1cbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSW5zdHJ1Y3Rpb24oZW50cnksIHN1YlRpbWVsaW5lcywgZW50ZXJDbGFzc05hbWUsIGxlYXZlQ2xhc3NOYW1lKSAhO1xuICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24uZXJyb3JzICYmIGluc3RydWN0aW9uLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5wdXNoKGluc3RydWN0aW9uKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhIHVubWF0Y2hlZCB0cmFuc2l0aW9uIGlzIHF1ZXVlZCB0byBnbyB0aGVuIGl0IFNIT1VMRCBOT1QgcmVuZGVyXG4gICAgICAgIC8vIGFuIGFuaW1hdGlvbiBhbmQgY2FuY2VsIHRoZSBwcmV2aW91c2x5IHJ1bm5pbmcgYW5pbWF0aW9ucy5cbiAgICAgICAgaWYgKGVudHJ5LmlzRmFsbGJhY2tUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBpZiBhIHBhcmVudCBhbmltYXRpb24gdXNlcyB0aGlzIGFuaW1hdGlvbiBhcyBhIHN1YiB0cmlnZ2VyXG4gICAgICAgIC8vIHRoZW4gaXQgd2lsbCBpbnN0cnVjdCB0aGUgdGltZWxpbmUgYnVpbGRlciB0byBub3QgYWRkIGEgcGxheWVyIGRlbGF5LCBidXRcbiAgICAgICAgLy8gaW5zdGVhZCBzdHJldGNoIHRoZSBmaXJzdCBrZXlmcmFtZSBnYXAgdXAgdW50aWwgdGhlIGFuaW1hdGlvbiBzdGFydHMuIFRoZVxuICAgICAgICAvLyByZWFzb24gdGhpcyBpcyBpbXBvcnRhbnQgaXMgdG8gcHJldmVudCBleHRyYSBpbml0aWFsaXphdGlvbiBzdHlsZXMgZnJvbSBiZWluZ1xuICAgICAgICAvLyByZXF1aXJlZCBieSB0aGUgdXNlciBpbiB0aGUgYW5pbWF0aW9uLlxuICAgICAgICBpbnN0cnVjdGlvbi50aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB0bC5zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSA9IHRydWUpO1xuXG4gICAgICAgIHN1YlRpbWVsaW5lcy5hcHBlbmQoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKTtcblxuICAgICAgICBjb25zdCB0dXBsZSA9IHtpbnN0cnVjdGlvbiwgcGxheWVyLCBlbGVtZW50fTtcblxuICAgICAgICBxdWV1ZWRJbnN0cnVjdGlvbnMucHVzaCh0dXBsZSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucXVlcmllZEVsZW1lbnRzLmZvckVhY2goXG4gICAgICAgICAgICBlbGVtZW50ID0+IGdldE9yU2V0QXNJbk1hcChxdWVyaWVkRWxlbWVudHMsIGVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcikpO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnByZVN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgICAgIGlmICghc2V0VmFsKSB7XG4gICAgICAgICAgICAgIGFsbFByZVN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHNldFZhbCA9IG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBzZXRWYWwuYWRkKHByb3ApKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnBvc3RTdHlsZVByb3BzLmZvckVhY2goKHN0cmluZ01hcCwgZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoc3RyaW5nTWFwKTtcbiAgICAgICAgICBsZXQgc2V0VmFsOiBTZXQ8c3RyaW5nPiA9IGFsbFBvc3RTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICAgIGlmICghc2V0VmFsKSB7XG4gICAgICAgICAgICBhbGxQb3N0U3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9uZW91c1RyYW5zaXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgZXJyb25lb3VzVHJhbnNpdGlvbnMuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICAgIGVycm9ycy5wdXNoKGBAJHtpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZX0gaGFzIGZhaWxlZCBkdWUgdG86XFxuYCk7XG4gICAgICAgIGluc3RydWN0aW9uLmVycm9ycyAhLmZvckVhY2goZXJyb3IgPT4gZXJyb3JzLnB1c2goYC0gJHtlcnJvcn1cXG5gKSk7XG4gICAgICB9KTtcblxuICAgICAgYWxsUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoZXJyb3JzKTtcbiAgICB9XG5cbiAgICBjb25zdCBhbGxQcmV2aW91c1BsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIC8vIHRoaXMgbWFwIHdvcmtzIHRvIHRlbGwgd2hpY2ggZWxlbWVudCBpbiB0aGUgRE9NIHRyZWUgaXMgY29udGFpbmVkIGJ5XG4gICAgLy8gd2hpY2ggYW5pbWF0aW9uLiBGdXJ0aGVyIGRvd24gYmVsb3cgdGhpcyBtYXAgd2lsbCBnZXQgcG9wdWxhdGVkIG9uY2VcbiAgICAvLyB0aGUgcGxheWVycyBhcmUgYnVpbHQgYW5kIGluIGRvaW5nIHNvIGl0IGNhbiBlZmZpY2llbnRseSBmaWd1cmUgb3V0XG4gICAgLy8gaWYgYSBzdWIgcGxheWVyIGlzIHNraXBwZWQgZHVlIHRvIGEgcGFyZW50IHBsYXllciBoYXZpbmcgcHJpb3JpdHkuXG4gICAgY29uc3QgYW5pbWF0aW9uRWxlbWVudE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBpZiAoc3ViVGltZWxpbmVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBhbmltYXRpb25FbGVtZW50TWFwLnNldChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgdGhpcy5fYmVmb3JlQW5pbWF0aW9uQnVpbGQoXG4gICAgICAgICAgICBlbnRyeS5wbGF5ZXIubmFtZXNwYWNlSWQsIGVudHJ5Lmluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHBsYXllci5lbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoZWxlbWVudCwgZmFsc2UsIHBsYXllci5uYW1lc3BhY2VJZCwgcGxheWVyLnRyaWdnZXJOYW1lLCBudWxsKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHByZXZQbGF5ZXIgPT4ge1xuICAgICAgICBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwcmV2UGxheWVyKTtcbiAgICAgICAgcHJldlBsYXllci5kZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkIChlaXRoZXIgYnkpXG4gICAgLy8gaGF2aW5nIHRoZWlyIG93biBsZWF2ZSBhbmltYXRpb25zIG9yIGJ5IGJlaW5nIHF1ZXJpZWQgaW4gYSBjb250YWluZXJcbiAgICAvLyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBvbmNlIGEgcGFyZW50IGFuaW1hdGlvbiBpcyBjb21wbGV0ZS4gVGhlIGlkZWFcbiAgICAvLyBoZXJlIGlzIHRoYXQgKiBzdHlsZXMgbXVzdCBiZSBpZGVudGljYWwgdG8gISBzdHlsZXMgYmVjYXVzZSBvZlxuICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5ICgqIGlzIGFsc28gZmlsbGVkIGluIGJ5IGRlZmF1bHQgaW4gbWFueSBwbGFjZXMpLlxuICAgIC8vIE90aGVyd2lzZSAqIHN0eWxlcyB3aWxsIHJldHVybiBhbiBlbXB0eSB2YWx1ZSBvciBhdXRvIHNpbmNlIHRoZSBlbGVtZW50XG4gICAgLy8gdGhhdCBpcyBiZWluZyBnZXRDb21wdXRlZFN0eWxlJ2Qgd2lsbCBub3QgYmUgdmlzaWJsZSAoc2luY2UgKiA9IGRlc3RpbmF0aW9uKVxuICAgIGNvbnN0IHJlcGxhY2VOb2RlcyA9IGFsbExlYXZlTm9kZXMuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpO1xuICAgIH0pO1xuXG4gICAgLy8gUE9TVCBTVEFHRTogZmlsbCB0aGUgKiBzdHlsZXNcbiAgICBjb25zdCBwb3N0U3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGNvbnN0IGFsbExlYXZlUXVlcmllZE5vZGVzID0gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICBwb3N0U3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLCBhbGxQb3N0U3R5bGVFbGVtZW50cywgQVVUT19TVFlMRSk7XG5cbiAgICBhbGxMZWF2ZVF1ZXJpZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgaWYgKHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUobm9kZSwgYWxsUHJlU3R5bGVFbGVtZW50cywgYWxsUG9zdFN0eWxlRWxlbWVudHMpKSB7XG4gICAgICAgIHJlcGxhY2VOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUFJFIFNUQUdFOiBmaWxsIHRoZSAhIHN0eWxlc1xuICAgIGNvbnN0IHByZVN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgICBwcmVTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBuZXcgU2V0KG5vZGVzKSwgYWxsUHJlU3R5bGVFbGVtZW50cywgUFJFX1NUWUxFKTtcbiAgICB9KTtcblxuICAgIHJlcGxhY2VOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgY29uc3QgcG9zdCA9IHBvc3RTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgY29uc3QgcHJlID0gcHJlU3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIHBvc3RTdHlsZXNNYXAuc2V0KG5vZGUsIHsgLi4ucG9zdCwgLi4ucHJlIH0gYXMgYW55KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJvb3RQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBzdWJQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQgPSB7fTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCB7ZWxlbWVudCwgcGxheWVyLCBpbnN0cnVjdGlvbn0gPSBlbnRyeTtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBpdCB3YXMgbmV2ZXIgY29uc3VtZWQgYnkgYSBwYXJlbnQgYW5pbWF0aW9uIHdoaWNoXG4gICAgICAvLyBtZWFucyB0aGF0IGl0IGlzIGluZGVwZW5kZW50IGFuZCB0aGVyZWZvcmUgc2hvdWxkIGJlIHNldCBmb3IgYW5pbWF0aW9uXG4gICAgICBpZiAoc3ViVGltZWxpbmVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICBpZiAoZGlzYWJsZWRFbGVtZW50c1NldC5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHBsYXllci5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgcGxheWVyLm92ZXJyaWRlVG90YWxUaW1lKGluc3RydWN0aW9uLnRvdGFsVGltZSk7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgd2lsbCBmbG93IHVwIHRoZSBET00gYW5kIHF1ZXJ5IHRoZSBtYXAgdG8gZmlndXJlIG91dFxuICAgICAgICAvLyBpZiBhIHBhcmVudCBhbmltYXRpb24gaGFzIHByaW9yaXR5IG92ZXIgaXQuIEluIHRoZSBzaXR1YXRpb25cbiAgICAgICAgLy8gdGhhdCBhIHBhcmVudCBpcyBkZXRlY3RlZCB0aGVuIGl0IHdpbGwgY2FuY2VsIHRoZSBsb29wLiBJZlxuICAgICAgICAvLyBub3RoaW5nIGlzIGRldGVjdGVkLCBvciBpdCB0YWtlcyBhIGZldyBob3BzIHRvIGZpbmQgYSBwYXJlbnQsXG4gICAgICAgIC8vIHRoZW4gaXQgd2lsbCBmaWxsIGluIHRoZSBtaXNzaW5nIG5vZGVzIGFuZCBzaWduYWwgdGhlbSBhcyBoYXZpbmdcbiAgICAgICAgLy8gYSBkZXRlY3RlZCBwYXJlbnQgKG9yIGEgTk9fUEFSRU5UIHZhbHVlIHZpYSBhIHNwZWNpYWwgY29uc3RhbnQpLlxuICAgICAgICBsZXQgcGFyZW50V2l0aEFuaW1hdGlvbjogYW55ID0gTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEO1xuICAgICAgICBpZiAoYW5pbWF0aW9uRWxlbWVudE1hcC5zaXplID4gMSkge1xuICAgICAgICAgIGxldCBlbG0gPSBlbGVtZW50O1xuICAgICAgICAgIGNvbnN0IHBhcmVudHNUb0FkZDogYW55W10gPSBbXTtcbiAgICAgICAgICB3aGlsZSAoZWxtID0gZWxtLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGVkUGFyZW50ID0gYW5pbWF0aW9uRWxlbWVudE1hcC5nZXQoZWxtKTtcbiAgICAgICAgICAgIGlmIChkZXRlY3RlZFBhcmVudCkge1xuICAgICAgICAgICAgICBwYXJlbnRXaXRoQW5pbWF0aW9uID0gZGV0ZWN0ZWRQYXJlbnQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50c1RvQWRkLnB1c2goZWxtKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50c1RvQWRkLmZvckVhY2gocGFyZW50ID0+IGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KHBhcmVudCwgcGFyZW50V2l0aEFuaW1hdGlvbikpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSB0aGlzLl9idWlsZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHBsYXllci5uYW1lc3BhY2VJZCwgaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCwgc2tpcHBlZFBsYXllcnNNYXAsIHByZVN0eWxlc01hcCxcbiAgICAgICAgICAgIHBvc3RTdHlsZXNNYXApO1xuXG4gICAgICAgIHBsYXllci5zZXRSZWFsUGxheWVyKGlubmVyUGxheWVyKTtcblxuICAgICAgICBpZiAocGFyZW50V2l0aEFuaW1hdGlvbiA9PT0gTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEKSB7XG4gICAgICAgICAgcm9vdFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHBhcmVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KHBhcmVudFdpdGhBbmltYXRpb24pO1xuICAgICAgICAgIGlmIChwYXJlbnRQbGF5ZXJzICYmIHBhcmVudFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXIucGFyZW50UGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihwYXJlbnRQbGF5ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKTtcbiAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgLy8gdGhlcmUgc3RpbGwgbWlnaHQgYmUgYSBhbmNlc3RvciBwbGF5ZXIgYW5pbWF0aW5nIHRoaXNcbiAgICAgICAgLy8gZWxlbWVudCB0aGVyZWZvcmUgd2Ugd2lsbCBzdGlsbCBhZGQgaXQgYXMgYSBzdWIgcGxheWVyXG4gICAgICAgIC8vIGV2ZW4gaWYgaXRzIGFuaW1hdGlvbiBtYXkgYmUgZGlzYWJsZWRcbiAgICAgICAgc3ViUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZmluZCBhbGwgb2YgdGhlIHN1YiBwbGF5ZXJzJyBjb3JyZXNwb25kaW5nIGlubmVyIGFuaW1hdGlvbiBwbGF5ZXJcbiAgICBzdWJQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIC8vIGV2ZW4gaWYgYW55IHBsYXllcnMgYXJlIG5vdCBmb3VuZCBmb3IgYSBzdWIgYW5pbWF0aW9uIHRoZW4gaXRcbiAgICAgIC8vIHdpbGwgc3RpbGwgY29tcGxldGUgaXRzZWxmIGFmdGVyIHRoZSBuZXh0IHRpY2sgc2luY2UgaXQncyBOb29wXG4gICAgICBjb25zdCBwbGF5ZXJzRm9yRWxlbWVudCA9IHNraXBwZWRQbGF5ZXJzTWFwLmdldChwbGF5ZXIuZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVyc0ZvckVsZW1lbnQgJiYgcGxheWVyc0ZvckVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGlubmVyUGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzRm9yRWxlbWVudCk7XG4gICAgICAgIHBsYXllci5zZXRSZWFsUGxheWVyKGlubmVyUGxheWVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHRoZSByZWFzb24gd2h5IHdlIGRvbid0IGFjdHVhbGx5IHBsYXkgdGhlIGFuaW1hdGlvbiBpc1xuICAgIC8vIGJlY2F1c2UgYWxsIHRoYXQgYSBza2lwcGVkIHBsYXllciBpcyBkZXNpZ25lZCB0byBkbyBpcyB0b1xuICAgIC8vIGZpcmUgdGhlIHN0YXJ0L2RvbmUgdHJhbnNpdGlvbiBjYWxsYmFjayBldmVudHNcbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBpZiAocGxheWVyLnBhcmVudFBsYXllcikge1xuICAgICAgICBwbGF5ZXIuc3luY1BsYXllckV2ZW50cyhwbGF5ZXIucGFyZW50UGxheWVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBydW4gdGhyb3VnaCBhbGwgb2YgdGhlIHF1ZXVlZCByZW1vdmFscyBhbmQgc2VlIGlmIHRoZXlcbiAgICAvLyB3ZXJlIHBpY2tlZCB1cCBieSBhIHF1ZXJ5LiBJZiBub3QgdGhlbiBwZXJmb3JtIHRoZSByZW1vdmFsXG4gICAgLy8gb3BlcmF0aW9uIHJpZ2h0IGF3YXkgdW5sZXNzIGEgcGFyZW50IGFuaW1hdGlvbiBpcyBvbmdvaW5nLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsTGVhdmVOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGFsbExlYXZlTm9kZXNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIExFQVZFX0NMQVNTTkFNRSk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhlIGVsZW1lbnQgaGFzIGEgcmVtb3ZhbCBhbmltYXRpb24gdGhhdCBpcyBiZWluZ1xuICAgICAgLy8gdGFrZW4gY2FyZSBvZiBhbmQgdGhlcmVmb3JlIHRoZSBpbm5lciBlbGVtZW50cyB3aWxsIGhhbmcgYXJvdW5kXG4gICAgICAvLyB1bnRpbCB0aGF0IGFuaW1hdGlvbiBpcyBvdmVyIChvciB0aGUgcGFyZW50IHF1ZXJpZWQgYW5pbWF0aW9uKVxuICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5oYXNBbmltYXRpb24pIGNvbnRpbnVlO1xuXG4gICAgICBsZXQgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgICAgIC8vIGlmIHRoaXMgZWxlbWVudCBpcyBxdWVyaWVkIG9yIGlmIGl0IGNvbnRhaW5zIHF1ZXJpZWQgY2hpbGRyZW5cbiAgICAgIC8vIHRoZW4gd2Ugd2FudCBmb3IgdGhlIGVsZW1lbnQgbm90IHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgcGFnZVxuICAgICAgLy8gdW50aWwgdGhlIHF1ZXJpZWQgYW5pbWF0aW9ucyBoYXZlIGZpbmlzaGVkXG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRzLnNpemUpIHtcbiAgICAgICAgbGV0IHF1ZXJpZWRQbGF5ZXJSZXN1bHRzID0gcXVlcmllZEVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgICAgICAgaWYgKHF1ZXJpZWRQbGF5ZXJSZXN1bHRzICYmIHF1ZXJpZWRQbGF5ZXJSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIHBsYXllcnMucHVzaCguLi5xdWVyaWVkUGxheWVyUmVzdWx0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcXVlcmllZElubmVyRWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIHRydWUpO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHF1ZXJpZWRJbm5lckVsZW1lbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgbGV0IHF1ZXJpZWRQbGF5ZXJzID0gcXVlcmllZEVsZW1lbnRzLmdldChxdWVyaWVkSW5uZXJFbGVtZW50c1tqXSk7XG4gICAgICAgICAgaWYgKHF1ZXJpZWRQbGF5ZXJzICYmIHF1ZXJpZWRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWN0aXZlUGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHAgPT4gIXAuZGVzdHJveWVkKTtcbiAgICAgIGlmIChhY3RpdmVQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICByZW1vdmVOb2Rlc0FmdGVyQW5pbWF0aW9uRG9uZSh0aGlzLCBlbGVtZW50LCBhY3RpdmVQbGF5ZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIHJlcXVpcmVkIHNvIHRoZSBjbGVhbnVwIG1ldGhvZCBkb2Vzbid0IHJlbW92ZSB0aGVtXG4gICAgYWxsTGVhdmVOb2Rlcy5sZW5ndGggPSAwO1xuXG4gICAgcm9vdFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9KTtcbiAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcm9vdFBsYXllcnM7XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNEYXRhKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBjb250YWluc0RhdGEgPSBmYWxzZTtcbiAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMucGxheWVyc0J5RWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnN0YXRlc0J5RWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKS5lbGVtZW50Q29udGFpbnNEYXRhKGVsZW1lbnQpIHx8IGNvbnRhaW5zRGF0YTtcbiAgfVxuXG4gIGFmdGVyRmx1c2goY2FsbGJhY2s6ICgpID0+IGFueSkgeyB0aGlzLl9mbHVzaEZucy5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIGFmdGVyRmx1c2hBbmltYXRpb25zRG9uZShjYWxsYmFjazogKCkgPT4gYW55KSB7IHRoaXMuX3doZW5RdWlldEZucy5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIHByaXZhdGUgX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgIGVsZW1lbnQ6IHN0cmluZywgaXNRdWVyaWVkRWxlbWVudDogYm9vbGVhbiwgbmFtZXNwYWNlSWQ/OiBzdHJpbmcsIHRyaWdnZXJOYW1lPzogc3RyaW5nLFxuICAgICAgdG9TdGF0ZVZhbHVlPzogYW55KTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBsZXQgcGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50UGxheWVycykge1xuICAgICAgICBwbGF5ZXJzID0gcXVlcmllZEVsZW1lbnRQbGF5ZXJzO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbGVtZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAoZWxlbWVudFBsYXllcnMpIHtcbiAgICAgICAgY29uc3QgaXNSZW1vdmFsQW5pbWF0aW9uID0gIXRvU3RhdGVWYWx1ZSB8fCB0b1N0YXRlVmFsdWUgPT0gVk9JRF9WQUxVRTtcbiAgICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSByZXR1cm47XG4gICAgICAgICAgaWYgKCFpc1JlbW92YWxBbmltYXRpb24gJiYgcGxheWVyLnRyaWdnZXJOYW1lICE9IHRyaWdnZXJOYW1lKSByZXR1cm47XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZXNwYWNlSWQgfHwgdHJpZ2dlck5hbWUpIHtcbiAgICAgIHBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAobmFtZXNwYWNlSWQgJiYgbmFtZXNwYWNlSWQgIT0gcGxheWVyLm5hbWVzcGFjZUlkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0cmlnZ2VyTmFtZSAmJiB0cmlnZ2VyTmFtZSAhPSBwbGF5ZXIudHJpZ2dlck5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBwcml2YXRlIF9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sXG4gICAgICBhbGxQcmV2aW91c1BsYXllcnNNYXA6IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4pIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdoZW4gYSByZW1vdmFsIGFuaW1hdGlvbiBvY2N1cnMsIEFMTCBwcmV2aW91cyBwbGF5ZXJzIGFyZSBjb2xsZWN0ZWRcbiAgICAvLyBhbmQgZGVzdHJveWVkIChldmVuIGlmIHRoZXkgYXJlIG91dHNpZGUgb2YgdGhlIGN1cnJlbnQgbmFtZXNwYWNlKVxuICAgIGNvbnN0IHRhcmdldE5hbWVTcGFjZUlkOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZUlkO1xuICAgIGNvbnN0IHRhcmdldFRyaWdnZXJOYW1lOiBzdHJpbmd8dW5kZWZpbmVkID1cbiAgICAgICAgaW5zdHJ1Y3Rpb24uaXNSZW1vdmFsVHJhbnNpdGlvbiA/IHVuZGVmaW5lZCA6IHRyaWdnZXJOYW1lO1xuXG4gICAgZm9yIChjb25zdCB0aW1lbGluZUluc3RydWN0aW9uIG9mIGluc3RydWN0aW9uLnRpbWVsaW5lcykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHBsYXllcnMgPSBnZXRPclNldEFzSW5NYXAoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSk7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPSB0aGlzLl9nZXRQcmV2aW91c1BsYXllcnMoXG4gICAgICAgICAgZWxlbWVudCwgaXNRdWVyaWVkRWxlbWVudCwgdGFyZ2V0TmFtZVNwYWNlSWQsIHRhcmdldFRyaWdnZXJOYW1lLCBpbnN0cnVjdGlvbi50b1N0YXRlKTtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWxQbGF5ZXIgPSBwbGF5ZXIuZ2V0UmVhbFBsYXllcigpIGFzIGFueTtcbiAgICAgICAgaWYgKHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSkge1xuICAgICAgICAgIHJlYWxQbGF5ZXIuYmVmb3JlRGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBuZWVkcyB0byBiZSBkb25lIHNvIHRoYXQgdGhlIFBSRS9QT1NUIHN0eWxlcyBjYW4gYmVcbiAgICAvLyBjb21wdXRlZCBwcm9wZXJseSB3aXRob3V0IGludGVyZmVyaW5nIHdpdGggdGhlIHByZXZpb3VzIGFuaW1hdGlvblxuICAgIGVyYXNlU3R5bGVzKHJvb3RFbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPixcbiAgICAgIHNraXBwZWRQbGF5ZXJzTWFwOiBNYXA8YW55LCBBbmltYXRpb25QbGF5ZXJbXT4sIHByZVN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LFxuICAgICAgcG9zdFN0eWxlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+KTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGluc3RydWN0aW9uLnRyaWdnZXJOYW1lO1xuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gaW5zdHJ1Y3Rpb24uZWxlbWVudDtcblxuICAgIC8vIHdlIGZpcnN0IHJ1biB0aGlzIHNvIHRoYXQgdGhlIHByZXZpb3VzIGFuaW1hdGlvbiBwbGF5ZXJcbiAgICAvLyBkYXRhIGNhbiBiZSBwYXNzZWQgaW50byB0aGUgc3VjY2Vzc2l2ZSBhbmltYXRpb24gcGxheWVyc1xuICAgIGNvbnN0IGFsbFF1ZXJpZWRQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBhbGxDb25zdW1lZEVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgYWxsU3ViRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxOZXdQbGF5ZXJzID0gaW5zdHJ1Y3Rpb24udGltZWxpbmVzLm1hcCh0aW1lbGluZUluc3RydWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aW1lbGluZUluc3RydWN0aW9uLmVsZW1lbnQ7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgLy8gRklYTUUgKG1hdHNrbyk6IG1ha2Ugc3VyZSB0by1iZS1yZW1vdmVkIGFuaW1hdGlvbnMgYXJlIHJlbW92ZWQgcHJvcGVybHlcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR107XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnJlbW92ZWRCZWZvcmVRdWVyaWVkKVxuICAgICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbi5kdXJhdGlvbiwgdGltZWxpbmVJbnN0cnVjdGlvbi5kZWxheSk7XG5cbiAgICAgIGNvbnN0IGlzUXVlcmllZEVsZW1lbnQgPSBlbGVtZW50ICE9PSByb290RWxlbWVudDtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9XG4gICAgICAgICAgZmxhdHRlbkdyb3VwUGxheWVycygoYWxsUHJldmlvdXNQbGF5ZXJzTWFwLmdldChlbGVtZW50KSB8fCBFTVBUWV9QTEFZRVJfQVJSQVkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwID0+IHAuZ2V0UmVhbFBsYXllcigpKSlcbiAgICAgICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgYGVsZW1lbnRgIGlzIG5vdCBhcGFydCBvZiB0aGUgQW5pbWF0aW9uUGxheWVyIGRlZmluaXRpb24sIGJ1dFxuICAgICAgICAgICAgICAgIC8vIE1vY2svV2ViQW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgZWxlbWVudCB3aXRoaW4gdGhlaXIgaW1wbGVtZW50YXRpb24uIFRoaXMgd2lsbCBiZSBhZGRlZCBpbiBBbmd1bGFyNSB0b1xuICAgICAgICAgICAgICAgIC8vIEFuaW1hdGlvblBsYXllclxuICAgICAgICAgICAgICAgIGNvbnN0IHBwID0gcCBhcyBhbnk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBwLmVsZW1lbnQgPyBwcC5lbGVtZW50ID09PSBlbGVtZW50IDogZmFsc2U7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwcmVTdHlsZXMgPSBwcmVTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3QgcG9zdFN0eWxlcyA9IHBvc3RTdHlsZXNNYXAuZ2V0KGVsZW1lbnQpO1xuICAgICAgY29uc3Qga2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgICAgICAgIHRoaXMuZHJpdmVyLCB0aGlzLl9ub3JtYWxpemVyLCBlbGVtZW50LCB0aW1lbGluZUluc3RydWN0aW9uLmtleWZyYW1lcywgcHJlU3R5bGVzLFxuICAgICAgICAgIHBvc3RTdHlsZXMpO1xuICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5fYnVpbGRQbGF5ZXIodGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzLCBwcmV2aW91c1BsYXllcnMpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhpcyBwYXJ0aWN1bGFyIHBsYXllciBiZWxvbmdzIHRvIGEgc3ViIHRyaWdnZXIuIEl0IGlzXG4gICAgICAvLyBpbXBvcnRhbnQgdGhhdCB3ZSBtYXRjaCB0aGlzIHBsYXllciB1cCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIChAdHJpZ2dlci5saXN0ZW5lcilcbiAgICAgIGlmICh0aW1lbGluZUluc3RydWN0aW9uLnN1YlRpbWVsaW5lICYmIHNraXBwZWRQbGF5ZXJzTWFwKSB7XG4gICAgICAgIGFsbFN1YkVsZW1lbnRzLmFkZChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUXVlcmllZEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZFBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKG5hbWVzcGFjZUlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG4gICAgICAgIHdyYXBwZWRQbGF5ZXIuc2V0UmVhbFBsYXllcihwbGF5ZXIpO1xuICAgICAgICBhbGxRdWVyaWVkUGxheWVycy5wdXNoKHdyYXBwZWRQbGF5ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH0pO1xuXG4gICAgYWxsUXVlcmllZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQsIHBsYXllci5lbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiBkZWxldGVPclVuc2V0SW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIHBsYXllcikpO1xuICAgIH0pO1xuXG4gICAgYWxsQ29uc3VtZWRFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gYWRkQ2xhc3MoZWxlbWVudCwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSkpO1xuICAgIGNvbnN0IHBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIoYWxsTmV3UGxheWVycyk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiByZW1vdmVDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgICBzZXRTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgYmFzaWNhbGx5IG1ha2VzIGFsbCBvZiB0aGUgY2FsbGJhY2tzIGZvciBzdWIgZWxlbWVudCBhbmltYXRpb25zXG4gICAgLy8gYmUgZGVwZW5kZW50IG9uIHRoZSB1cHBlciBwbGF5ZXJzIGZvciB3aGVuIHRoZXkgZmluaXNoXG4gICAgYWxsU3ViRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgZWxlbWVudCA9PiB7IGdldE9yU2V0QXNJbk1hcChza2lwcGVkUGxheWVyc01hcCwgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKTsgfSk7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRQbGF5ZXIoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgaWYgKGtleWZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5kcml2ZXIuYW5pbWF0ZShcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lbGVtZW50LCBrZXlmcmFtZXMsIGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSxcbiAgICAgICAgICBpbnN0cnVjdGlvbi5lYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVtcHR5IHRyYW5zaXRpb258ZGVmaW5pdGlvbiBpcyBwcm92aWRlZFxuICAgIC8vIC4uLiB0aGVyZSBpcyBubyBwb2ludCBpbiByZW5kZXJpbmcgYW4gZW1wdHkgYW5pbWF0aW9uXG4gICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKGluc3RydWN0aW9uLmR1cmF0aW9uLCBpbnN0cnVjdGlvbi5kZWxheSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9wbGF5ZXI6IEFuaW1hdGlvblBsYXllciA9IG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gIHByaXZhdGUgX2NvbnRhaW5zUmVhbFBsYXllciA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3F1ZXVlZENhbGxiYWNrczoge1tuYW1lOiBzdHJpbmddOiAoKCkgPT4gYW55KVtdfSA9IHt9O1xuICBwdWJsaWMgcmVhZG9ubHkgZGVzdHJveWVkID0gZmFsc2U7XG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcjtcblxuICBwdWJsaWMgbWFya2VkRm9yRGVzdHJveTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgZGlzYWJsZWQgPSBmYWxzZTtcblxuICByZWFkb25seSBxdWV1ZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICBwdWJsaWMgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lc3BhY2VJZDogc3RyaW5nLCBwdWJsaWMgdHJpZ2dlck5hbWU6IHN0cmluZywgcHVibGljIGVsZW1lbnQ6IGFueSkge31cblxuICBzZXRSZWFsUGxheWVyKHBsYXllcjogQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5zUmVhbFBsYXllcikgcmV0dXJuO1xuXG4gICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3F1ZXVlZENhbGxiYWNrcykuZm9yRWFjaChwaGFzZSA9PiB7XG4gICAgICB0aGlzLl9xdWV1ZWRDYWxsYmFja3NbcGhhc2VdLmZvckVhY2goXG4gICAgICAgICAgY2FsbGJhY2sgPT4gbGlzdGVuT25QbGF5ZXIocGxheWVyLCBwaGFzZSwgdW5kZWZpbmVkLCBjYWxsYmFjaykpO1xuICAgIH0pO1xuICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuX2NvbnRhaW5zUmVhbFBsYXllciA9IHRydWU7XG4gICAgdGhpcy5vdmVycmlkZVRvdGFsVGltZShwbGF5ZXIudG90YWxUaW1lKTtcbiAgICAodGhpcyBhc3txdWV1ZWQ6IGJvb2xlYW59KS5xdWV1ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldFJlYWxQbGF5ZXIoKSB7IHJldHVybiB0aGlzLl9wbGF5ZXI7IH1cblxuICBvdmVycmlkZVRvdGFsVGltZSh0b3RhbFRpbWU6IG51bWJlcikgeyAodGhpcyBhcyBhbnkpLnRvdGFsVGltZSA9IHRvdGFsVGltZTsgfVxuXG4gIHN5bmNQbGF5ZXJFdmVudHMocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGxheWVyIGFzIGFueTtcbiAgICBpZiAocC50cmlnZ2VyQ2FsbGJhY2spIHtcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHAudHJpZ2dlckNhbGxiYWNrICEoJ3N0YXJ0JykpO1xuICAgIH1cbiAgICBwbGF5ZXIub25Eb25lKCgpID0+IHRoaXMuZmluaXNoKCkpO1xuICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gdGhpcy5kZXN0cm95KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVldWVFdmVudChuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogdm9pZCB7XG4gICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX3F1ZXVlZENhbGxiYWNrcywgbmFtZSwgW10pLnB1c2goY2FsbGJhY2spO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9xdWV1ZUV2ZW50KCdkb25lJywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25Eb25lKGZuKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ3N0YXJ0JywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25TdGFydChmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2Rlc3Ryb3knLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRlc3Ryb3koZm4pO1xuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHsgdGhpcy5fcGxheWVyLmluaXQoKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnF1ZXVlZCA/IGZhbHNlIDogdGhpcy5fcGxheWVyLmhhc1N0YXJ0ZWQoKTsgfVxuXG4gIHBsYXkoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucGxheSgpOyB9XG5cbiAgcGF1c2UoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucGF1c2UoKTsgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzdGFydCgpOyB9XG5cbiAgZmluaXNoKCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuZmluaXNoKCk7IH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICh0aGlzIGFze2Rlc3Ryb3llZDogYm9vbGVhbn0pLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fcGxheWVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQgeyAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnJlc2V0KCk7IH1cblxuICBzZXRQb3NpdGlvbihwOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9wbGF5ZXIuc2V0UG9zaXRpb24ocCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucXVldWVkID8gMCA6IHRoaXMuX3BsYXllci5nZXRQb3NpdGlvbigpOyB9XG5cbiAgLyogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcC50cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlT3JVbnNldEluTWFwKG1hcDogTWFwPGFueSwgYW55W10+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgbGV0IGN1cnJlbnRWYWx1ZXM6IGFueVtdfG51bGx8dW5kZWZpbmVkO1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgbWFwLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwW2tleV07XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRlbGV0ZSBtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRWYWx1ZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRyaWdnZXJWYWx1ZSh2YWx1ZTogYW55KTogYW55IHtcbiAgLy8gd2UgdXNlIGAhPSBudWxsYCBoZXJlIGJlY2F1c2UgaXQncyB0aGUgbW9zdCBzaW1wbGVcbiAgLy8gd2F5IHRvIHRlc3QgYWdhaW5zdCBhIFwiZmFsc3lcIiB2YWx1ZSB3aXRob3V0IG1peGluZ1xuICAvLyBpbiBlbXB0eSBzdHJpbmdzIG9yIGEgemVybyB2YWx1ZS4gRE8gTk9UIE9QVElNSVpFLlxuICByZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50Tm9kZShub2RlOiBhbnkpIHtcbiAgcmV0dXJuIG5vZGUgJiYgbm9kZVsnbm9kZVR5cGUnXSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNUcmlnZ2VyRXZlbnRWYWxpZChldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZXZlbnROYW1lID09ICdzdGFydCcgfHwgZXZlbnROYW1lID09ICdkb25lJztcbn1cblxuZnVuY3Rpb24gY2xvYWtFbGVtZW50KGVsZW1lbnQ6IGFueSwgdmFsdWU/OiBzdHJpbmcpIHtcbiAgY29uc3Qgb2xkVmFsdWUgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXk7XG4gIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6ICdub25lJztcbiAgcmV0dXJuIG9sZFZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgdmFsdWVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBlbGVtZW50czogU2V0PGFueT4sXG4gICAgZWxlbWVudFByb3BzTWFwOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sIGRlZmF1bHRTdHlsZTogc3RyaW5nKTogYW55W10ge1xuICBjb25zdCBjbG9ha1ZhbHM6IHN0cmluZ1tdID0gW107XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha1ZhbHMucHVzaChjbG9ha0VsZW1lbnQoZWxlbWVudCkpKTtcblxuICBjb25zdCBmYWlsZWRFbGVtZW50czogYW55W10gPSBbXTtcblxuICBlbGVtZW50UHJvcHNNYXAuZm9yRWFjaCgocHJvcHM6IFNldDxzdHJpbmc+LCBlbGVtZW50OiBhbnkpID0+IHtcbiAgICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW3Byb3BdID0gZHJpdmVyLmNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wLCBkZWZhdWx0U3R5bGUpO1xuXG4gICAgICAvLyB0aGVyZSBpcyBubyBlYXN5IHdheSB0byBkZXRlY3QgdGhpcyBiZWNhdXNlIGEgc3ViIGVsZW1lbnQgY291bGQgYmUgcmVtb3ZlZFxuICAgICAgLy8gYnkgYSBwYXJlbnQgYW5pbWF0aW9uIGVsZW1lbnQgYmVpbmcgZGV0YWNoZWQuXG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IE5VTExfUkVNT1ZFRF9RVUVSSUVEX1NUQVRFO1xuICAgICAgICBmYWlsZWRFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhbHVlc01hcC5zZXQoZWxlbWVudCwgc3R5bGVzKTtcbiAgfSk7XG5cbiAgLy8gd2UgdXNlIGEgaW5kZXggdmFyaWFibGUgaGVyZSBzaW5jZSBTZXQuZm9yRWFjaChhLCBpKSBkb2VzIG5vdCByZXR1cm5cbiAgLy8gYW4gaW5kZXggdmFsdWUgZm9yIHRoZSBjbG9zdXJlIChidXQgaW5zdGVhZCBqdXN0IHRoZSB2YWx1ZSlcbiAgbGV0IGkgPSAwO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtFbGVtZW50KGVsZW1lbnQsIGNsb2FrVmFsc1tpKytdKSk7XG5cbiAgcmV0dXJuIGZhaWxlZEVsZW1lbnRzO1xufVxuXG4vKlxuU2luY2UgdGhlIEFuZ3VsYXIgcmVuZGVyZXIgY29kZSB3aWxsIHJldHVybiBhIGNvbGxlY3Rpb24gb2YgaW5zZXJ0ZWRcbm5vZGVzIGluIGFsbCBhcmVhcyBvZiBhIERPTSB0cmVlLCBpdCdzIHVwIHRvIHRoaXMgYWxnb3JpdGhtIHRvIGZpZ3VyZVxub3V0IHdoaWNoIG5vZGVzIGFyZSByb290cyBmb3IgZWFjaCBhbmltYXRpb24gQHRyaWdnZXIuXG5cbkJ5IHBsYWNpbmcgZWFjaCBpbnNlcnRlZCBub2RlIGludG8gYSBTZXQgYW5kIHRyYXZlcnNpbmcgdXB3YXJkcywgaXRcbmlzIHBvc3NpYmxlIHRvIGZpbmQgdGhlIEB0cmlnZ2VyIGVsZW1lbnRzIGFuZCB3ZWxsIGFueSBkaXJlY3QgKnN0YXJcbmluc2VydGlvbiBub2RlcywgaWYgYSBAdHJpZ2dlciByb290IGlzIGZvdW5kIHRoZW4gdGhlIGVudGVyIGVsZW1lbnRcbmlzIHBsYWNlZCBpbnRvIHRoZSBNYXBbQHRyaWdnZXJdIHNwb3QuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUm9vdE1hcChyb290czogYW55W10sIG5vZGVzOiBhbnlbXSk6IE1hcDxhbnksIGFueVtdPiB7XG4gIGNvbnN0IHJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55W10+KCk7XG4gIHJvb3RzLmZvckVhY2gocm9vdCA9PiByb290TWFwLnNldChyb290LCBbXSkpO1xuXG4gIGlmIChub2Rlcy5sZW5ndGggPT0gMCkgcmV0dXJuIHJvb3RNYXA7XG5cbiAgY29uc3QgTlVMTF9OT0RFID0gMTtcbiAgY29uc3Qgbm9kZVNldCA9IG5ldyBTZXQobm9kZXMpO1xuICBjb25zdCBsb2NhbFJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuXG4gIGZ1bmN0aW9uIGdldFJvb3Qobm9kZTogYW55KTogYW55IHtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBOVUxMX05PREU7XG5cbiAgICBsZXQgcm9vdCA9IGxvY2FsUm9vdE1hcC5nZXQobm9kZSk7XG4gICAgaWYgKHJvb3QpIHJldHVybiByb290O1xuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIGlmIChyb290TWFwLmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBAdHJpZ2dlclxuICAgICAgcm9vdCA9IHBhcmVudDtcbiAgICB9IGVsc2UgaWYgKG5vZGVTZXQuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIG5nSWZcbiAgICAgIHJvb3QgPSBOVUxMX05PREU7XG4gICAgfSBlbHNlIHsgIC8vIHJlY3Vyc2UgdXB3YXJkc1xuICAgICAgcm9vdCA9IGdldFJvb3QocGFyZW50KTtcbiAgICB9XG5cbiAgICBsb2NhbFJvb3RNYXAuc2V0KG5vZGUsIHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICBjb25zdCByb290ID0gZ2V0Um9vdChub2RlKTtcbiAgICBpZiAocm9vdCAhPT0gTlVMTF9OT0RFKSB7XG4gICAgICByb290TWFwLmdldChyb290KSAhLnB1c2gobm9kZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcm9vdE1hcDtcbn1cblxuY29uc3QgQ0xBU1NFU19DQUNIRV9LRVkgPSAnJCRjbGFzc2VzJztcbmZ1bmN0aW9uIGNvbnRhaW5zQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjbGFzc2VzID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgcmV0dXJuIGNsYXNzZXMgJiYgY2xhc3Nlc1tjbGFzc05hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFufSA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIGlmICghY2xhc3Nlcykge1xuICAgICAgY2xhc3NlcyA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldID0ge307XG4gICAgfVxuICAgIGNsYXNzZXNbY2xhc3NOYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW59ID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgIGRlbGV0ZSBjbGFzc2VzW2NsYXNzTmFtZV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKFxuICAgIGVuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSwgZWxlbWVudDogYW55LCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiBlbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5Hcm91cFBsYXllcnMocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXJbXSB7XG4gIGNvbnN0IGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICByZXR1cm4gZmluYWxQbGF5ZXJzO1xufVxuXG5mdW5jdGlvbiBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdLCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgaWYgKHBsYXllciBpbnN0YW5jZW9mIEFuaW1hdGlvbkdyb3VwUGxheWVyKSB7XG4gICAgICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllci5wbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaW5hbFBsYXllcnMucHVzaChwbGF5ZXIgYXMgQW5pbWF0aW9uUGxheWVyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gb2JqRXF1YWxzKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBiOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICBjb25zdCBrMSA9IE9iamVjdC5rZXlzKGEpO1xuICBjb25zdCBrMiA9IE9iamVjdC5rZXlzKGIpO1xuICBpZiAoazEubGVuZ3RoICE9IGsyLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGsxLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJvcCA9IGsxW2ldO1xuICAgIGlmICghYi5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBhW3Byb3BdICE9PSBiW3Byb3BdKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VQb3N0U3R5bGVzQXNQcmUoXG4gICAgZWxlbWVudDogYW55LCBhbGxQcmVTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sXG4gICAgYWxsUG9zdFN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+Pik6IGJvb2xlYW4ge1xuICBjb25zdCBwb3N0RW50cnkgPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmICghcG9zdEVudHJ5KSByZXR1cm4gZmFsc2U7XG5cbiAgbGV0IHByZUVudHJ5ID0gYWxsUHJlU3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gIGlmIChwcmVFbnRyeSkge1xuICAgIHBvc3RFbnRyeS5mb3JFYWNoKGRhdGEgPT4gcHJlRW50cnkgIS5hZGQoZGF0YSkpO1xuICB9IGVsc2Uge1xuICAgIGFsbFByZVN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHBvc3RFbnRyeSk7XG4gIH1cblxuICBhbGxQb3N0U3R5bGVFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XG4gIHJldHVybiB0cnVlO1xufVxuIl19