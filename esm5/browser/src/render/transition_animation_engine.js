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
    TransitionAnimationEngine.prototype._buildInstruction = function (entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
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
                var nodeIsOrphaned = !bodyNode || !_this.driver.containsElement(bodyNode, element);
                var leaveClassName = leaveNodeMapIds.get(element);
                var enterClassName = enterNodeMapIds.get(element);
                var instruction = _this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned);
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // even though the element may not be apart of the DOM, it may
                // still be added at a later point (due to the mechanics of content
                // projection and/or dynamic component insertion) therefore it's
                // important we still style the element.
                if (nodeIsOrphaned) {
                    player.onStart(function () { return eraseStyles(element, instruction.fromStyles); });
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                    skippedPlayers.push(player);
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
        if (rootMap.has(parent)) {
            root = parent;
        }
        else if (nodeSet.has(parent)) {
            root = NULL_NODE;
        }
        else {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUFxQyxtQkFBbUIsRUFBRSxxQkFBcUIsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFNM0wsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBbUIsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR3JNLE9BQU8sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuSSxJQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0FBQzdDLElBQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDO0FBQzdDLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7QUFDakQsSUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNqRCxJQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUMxQyxJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQztBQUUxQyxJQUFNLGtCQUFrQixHQUFnQyxFQUFFLENBQUM7QUFDM0QsSUFBTSxrQkFBa0IsR0FBMEI7SUFDaEQsV0FBVyxFQUFFLEVBQUU7SUFDZixhQUFhLEVBQUUsS0FB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SyxDQUFDO0lBQ25FLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELGdDQUNJLE9BQVksRUFBRSxtQkFBMEMsRUFDeEQsb0JBQTJDO0lBQzdDLElBQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFFN0IsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDYixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsUUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtUFuaW1hdGlvbkdyb3VwUGxheWVyIGFzIEFuaW1hdGlvbkdyb3VwUGxheWVyLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7QW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnl9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9mYWN0b3J5JztcbmltcG9ydCB7QW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9ufSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UcmlnZ2VyfSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyaWdnZXInO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4uL2RzbC9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtFTlRFUl9DTEFTU05BTUUsIExFQVZFX0NMQVNTTkFNRSwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCBOR19UUklHR0VSX0NMQVNTTkFNRSwgTkdfVFJJR0dFUl9TRUxFQ1RPUiwgY29weU9iaiwgZXJhc2VTdHlsZXMsIGl0ZXJhdG9yVG9BcnJheSwgc2V0U3R5bGVzfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldEJvZHlOb2RlLCBnZXRPclNldEFzSW5NYXAsIGxpc3Rlbk9uUGxheWVyLCBtYWtlQW5pbWF0aW9uRXZlbnQsIG5vcm1hbGl6ZUtleWZyYW1lcywgb3B0aW1pemVHcm91cFBsYXllcn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBRVUVVRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IFFVRVVFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgRElTQUJMRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgRElTQUJMRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgU1RBUl9DTEFTU05BTUUgPSAnbmctc3Rhci1pbnNlcnRlZCc7XG5jb25zdCBTVEFSX1NFTEVDVE9SID0gJy5uZy1zdGFyLWluc2VydGVkJztcblxuY29uc3QgRU1QVFlfUExBWUVSX0FSUkFZOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbmNvbnN0IE5VTExfUkVNT1ZBTF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG59O1xuY29uc3QgTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiB0cnVlXG59O1xuXG5pbnRlcmZhY2UgVHJpZ2dlckxpc3RlbmVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwaGFzZTogc3RyaW5nO1xuICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUluc3RydWN0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICB0cmlnZ2VyTmFtZTogc3RyaW5nO1xuICBmcm9tU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRvU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRyYW5zaXRpb246IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5O1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG4gIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgUkVNT1ZBTF9GTEFHID0gJ19fbmdfcmVtb3ZlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudEFuaW1hdGlvblN0YXRlIHtcbiAgc2V0Rm9yUmVtb3ZhbDogYm9vbGVhbjtcbiAgc2V0Rm9yTW92ZTogYm9vbGVhbjtcbiAgaGFzQW5pbWF0aW9uOiBib29sZWFuO1xuICBuYW1lc3BhY2VJZDogc3RyaW5nO1xuICByZW1vdmVkQmVmb3JlUXVlcmllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsdWUge1xuICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnM7XG5cbiAgZ2V0IHBhcmFtcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLm9wdGlvbnMucGFyYW1zIGFze1trZXk6IHN0cmluZ106IGFueX07IH1cblxuICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZyA9ICcnKSB7XG4gICAgY29uc3QgaXNPYmogPSBpbnB1dCAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBjb25zdCB2YWx1ZSA9IGlzT2JqID8gaW5wdXRbJ3ZhbHVlJ10gOiBpbnB1dDtcbiAgICB0aGlzLnZhbHVlID0gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNPYmopIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb3B5T2JqKGlucHV0IGFzIGFueSk7XG4gICAgICBkZWxldGUgb3B0aW9uc1sndmFsdWUnXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGFic29yYk9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGNvbnN0IG5ld1BhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgIGlmIChuZXdQYXJhbXMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXMgITtcbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKG9sZFBhcmFtc1twcm9wXSA9PSBudWxsKSB7XG4gICAgICAgICAgb2xkUGFyYW1zW3Byb3BdID0gbmV3UGFyYW1zW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFZPSURfVkFMVUUgPSAndm9pZCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TVEFURV9WQUxVRSA9IG5ldyBTdGF0ZVZhbHVlKFZPSURfVkFMVUUpO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICBwcml2YXRlIF90cmlnZ2Vyczoge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogQW5pbWF0aW9uVHJpZ2dlcn0gPSB7fTtcbiAgcHJpdmF0ZSBfcXVldWU6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gIHByaXZhdGUgX2VsZW1lbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPGFueSwgVHJpZ2dlckxpc3RlbmVyW10+KCk7XG5cbiAgcHJpdmF0ZSBfaG9zdENsYXNzTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBob3N0RWxlbWVudDogYW55LCBwcml2YXRlIF9lbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUpIHtcbiAgICB0aGlzLl9ob3N0Q2xhc3NOYW1lID0gJ25nLXRucy0nICsgaWQ7XG4gICAgYWRkQ2xhc3MoaG9zdEVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpO1xuICB9XG5cbiAgbGlzdGVuKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmICghdGhpcy5fdHJpZ2dlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxpc3RlbiBvbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke1xuICAgICAgICAgIHBoYXNlfVwiIGJlY2F1c2UgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGRvZXNuXFwndCBleGlzdCFgKTtcbiAgICB9XG5cbiAgICBpZiAocGhhc2UgPT0gbnVsbCB8fCBwaGFzZS5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBiZWNhdXNlIHRoZSBwcm92aWRlZCBldmVudCBpcyB1bmRlZmluZWQhYCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RyaWdnZXJFdmVudFZhbGlkKHBoYXNlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke3BoYXNlfVwiIGZvciB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke1xuICAgICAgICAgIG5hbWV9XCIgaXMgbm90IHN1cHBvcnRlZCFgKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBnZXRPclNldEFzSW5NYXAodGhpcy5fZWxlbWVudExpc3RlbmVycywgZWxlbWVudCwgW10pO1xuICAgIGNvbnN0IGRhdGEgPSB7bmFtZSwgcGhhc2UsIGNhbGxiYWNrfTtcbiAgICBsaXN0ZW5lcnMucHVzaChkYXRhKTtcblxuICAgIGNvbnN0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LCBlbGVtZW50LCB7fSk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgbmFtZSk7XG4gICAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbbmFtZV0gPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyB0aGUgZXZlbnQgbGlzdGVuZXIgaXMgcmVtb3ZlZCBBRlRFUiB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgIC8vIHRoYXQgbGVhdmUgYW5pbWF0aW9ucyBjYWxsYmFja3MgY2FuIGZpcmUgKG90aGVyd2lzZSBpZiB0aGUgbm9kZVxuICAgICAgLy8gaXMgcmVtb3ZlZCBpbiBiZXR3ZWVuIHRoZW4gdGhlIGxpc3RlbmVycyB3b3VsZCBiZSBkZXJlZ2lzdGVyZWQpXG4gICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoZGF0YSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAgICAgZGVsZXRlIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgYXN0OiBBbmltYXRpb25UcmlnZ2VyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAvLyB0aHJvd1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90cmlnZ2Vyc1tuYW1lXSA9IGFzdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyaWdnZXIobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuICAgIGlmICghdHJpZ2dlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQhYCk7XG4gICAgfVxuICAgIHJldHVybiB0cmlnZ2VyO1xuICB9XG5cbiAgdHJpZ2dlcihlbGVtZW50OiBhbnksIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnksIGRlZmF1bHRUb0ZhbGxiYWNrOiBib29sZWFuID0gdHJ1ZSk6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX2dldFRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgIGxldCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcykge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LnNldChlbGVtZW50LCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB7fSk7XG4gICAgfVxuXG4gICAgbGV0IGZyb21TdGF0ZSA9IHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV07XG4gICAgY29uc3QgdG9TdGF0ZSA9IG5ldyBTdGF0ZVZhbHVlKHZhbHVlLCB0aGlzLmlkKTtcblxuICAgIGNvbnN0IGlzT2JqID0gdmFsdWUgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJyk7XG4gICAgaWYgKCFpc09iaiAmJiBmcm9tU3RhdGUpIHtcbiAgICAgIHRvU3RhdGUuYWJzb3JiT3B0aW9ucyhmcm9tU3RhdGUub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXSA9IHRvU3RhdGU7XG5cbiAgICBpZiAoIWZyb21TdGF0ZSkge1xuICAgICAgZnJvbVN0YXRlID0gREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICB9XG5cbiAgICBjb25zdCBpc1JlbW92YWwgPSB0b1N0YXRlLnZhbHVlID09PSBWT0lEX1ZBTFVFO1xuXG4gICAgLy8gbm9ybWFsbHkgdGhpcyBpc24ndCByZWFjaGVkIGJ5IGhlcmUsIGhvd2V2ZXIsIGlmIGFuIG9iamVjdCBleHByZXNzaW9uXG4gICAgLy8gaXMgcGFzc2VkIGluIHRoZW4gaXQgbWF5IGJlIGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuIENvbXBhcmluZyB0aGUgdmFsdWVcbiAgICAvLyBpcyBpbXBvcnRhbnQgc2luY2UgdGhhdCB3aWxsIHN0YXkgdGhlIHNhbWUgZGVzcGl0ZSB0aGVyZSBiZWluZyBhIG5ldyBvYmplY3QuXG4gICAgLy8gVGhlIHJlbW92YWwgYXJjIGhlcmUgaXMgc3BlY2lhbCBjYXNlZCBiZWNhdXNlIHRoZSBzYW1lIGVsZW1lbnQgaXMgdHJpZ2dlcmVkXG4gICAgLy8gdHdpY2UgaW4gdGhlIGV2ZW50IHRoYXQgaXQgY29udGFpbnMgYW5pbWF0aW9ucyBvbiB0aGUgb3V0ZXIvaW5uZXIgcG9ydGlvbnNcbiAgICAvLyBvZiB0aGUgaG9zdCBjb250YWluZXJcbiAgICBpZiAoIWlzUmVtb3ZhbCAmJiBmcm9tU3RhdGUudmFsdWUgPT09IHRvU3RhdGUudmFsdWUpIHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBkZXNwaXRlIHRoZSB2YWx1ZSBub3QgY2hhbmdpbmcsIHNvbWUgaW5uZXIgcGFyYW1zXG4gICAgICAvLyBoYXZlIGNoYW5nZWQgd2hpY2ggbWVhbnMgdGhhdCB0aGUgYW5pbWF0aW9uIGZpbmFsIHN0eWxlcyBuZWVkIHRvIGJlIGFwcGxpZWRcbiAgICAgIGlmICghb2JqRXF1YWxzKGZyb21TdGF0ZS5wYXJhbXMsIHRvU3RhdGUucGFyYW1zKSkge1xuICAgICAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG4gICAgICAgIGNvbnN0IGZyb21TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKGZyb21TdGF0ZS52YWx1ZSwgZnJvbVN0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgY29uc3QgdG9TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKHRvU3RhdGUudmFsdWUsIHRvU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGZyb21TdHlsZXMpO1xuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIHRvU3R5bGVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllcnNPbkVsZW1lbnQ6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudCwgZWxlbWVudCwgW10pO1xuICAgIHBsYXllcnNPbkVsZW1lbnQuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gb25seSByZW1vdmUgdGhlIHBsYXllciBpZiBpdCBpcyBxdWV1ZWQgb24gdGhlIEVYQUNUIHNhbWUgdHJpZ2dlci9uYW1lc3BhY2VcbiAgICAgIC8vIHdlIG9ubHkgYWxzbyBkZWFsIHdpdGggcXVldWVkIHBsYXllcnMgaGVyZSBiZWNhdXNlIGlmIHRoZSBhbmltYXRpb24gaGFzXG4gICAgICAvLyBzdGFydGVkIHRoZW4gd2Ugd2FudCB0byBrZWVwIHRoZSBwbGF5ZXIgYWxpdmUgdW50aWwgdGhlIGZsdXNoIGhhcHBlbnNcbiAgICAgIC8vICh3aGljaCBpcyB3aGVyZSB0aGUgcHJldmlvdXNQbGF5ZXJzIGFyZSBwYXNzZWQgaW50byB0aGUgbmV3IHBhbHllcilcbiAgICAgIGlmIChwbGF5ZXIubmFtZXNwYWNlSWQgPT0gdGhpcy5pZCAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgPT0gdHJpZ2dlck5hbWUgJiYgcGxheWVyLnF1ZXVlZCkge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHRyYW5zaXRpb24gPVxuICAgICAgICB0cmlnZ2VyLm1hdGNoVHJhbnNpdGlvbihmcm9tU3RhdGUudmFsdWUsIHRvU3RhdGUudmFsdWUsIGVsZW1lbnQsIHRvU3RhdGUucGFyYW1zKTtcbiAgICBsZXQgaXNGYWxsYmFja1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIGlmICghZGVmYXVsdFRvRmFsbGJhY2spIHJldHVybjtcbiAgICAgIHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgdGhpcy5fcXVldWUucHVzaChcbiAgICAgICAge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBsYXllciwgaXNGYWxsYmFja1RyYW5zaXRpb259KTtcblxuICAgIGlmICghaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpO1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4geyByZW1vdmVDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTsgfSk7XG4gICAgfVxuXG4gICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVycykge1xuICAgICAgICBsZXQgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgcGxheWVyc09uRWxlbWVudC5wdXNoKHBsYXllcik7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVyZWdpc3RlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG5cbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmZvckVhY2goKHN0YXRlTWFwLCBlbGVtZW50KSA9PiB7IGRlbGV0ZSBzdGF0ZU1hcFtuYW1lXTsgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVycywgZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5zZXQoXG4gICAgICAgICAgZWxlbWVudCwgbGlzdGVuZXJzLmZpbHRlcihlbnRyeSA9PiB7IHJldHVybiBlbnRyeS5uYW1lICE9IG5hbWU7IH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZGVsZXRlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMocm9vdEVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAvLyBlbXVsYXRlIGEgbGVhdmUgYW5pbWF0aW9uIGZvciBhbGwgaW5uZXIgbm9kZXMgd2l0aGluIHRoaXMgbm9kZS5cbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gYW5pbWF0aW9ucyBmb3VuZCBmb3IgYW55IG9mIHRoZSBub2RlcyB0aGVuIGNsZWFyIHRoZSBjYWNoZVxuICAgIC8vIGZvciB0aGUgZWxlbWVudC5cbiAgICB0aGlzLl9lbmdpbmUuZHJpdmVyLnF1ZXJ5KHJvb3RFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiB7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYW4gaW5uZXIgcmVtb3ZlKCkgb3BlcmF0aW9uIGhhcyBhbHJlYWR5IGtpY2tlZCBvZmZcbiAgICAgIC8vIHRoZSBhbmltYXRpb24gb24gdGhpcyBlbGVtZW50Li4uXG4gICAgICBpZiAoZWxtW1JFTU9WQUxfRkxBR10pIHJldHVybjtcblxuICAgICAgY29uc3QgbmFtZXNwYWNlcyA9IHRoaXMuX2VuZ2luZS5mZXRjaE5hbWVzcGFjZXNCeUVsZW1lbnQoZWxtKTtcbiAgICAgIGlmIChuYW1lc3BhY2VzLnNpemUpIHtcbiAgICAgICAgbmFtZXNwYWNlcy5mb3JFYWNoKG5zID0+IG5zLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbG0sIGNvbnRleHQsIGZhbHNlLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB0cmlnZ2VyTGVhdmVBbmltYXRpb24oXG4gICAgICBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSwgZGVzdHJveUFmdGVyQ29tcGxldGU/OiBib29sZWFuLFxuICAgICAgZGVmYXVsdFRvRmFsbGJhY2s/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJpZ2dlclN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICh0cmlnZ2VyU3RhdGVzKSB7XG4gICAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHRyaWdnZXJTdGF0ZXMpLmZvckVhY2godHJpZ2dlck5hbWUgPT4ge1xuICAgICAgICAvLyB0aGlzIGNoZWNrIGlzIGhlcmUgaW4gdGhlIGV2ZW50IHRoYXQgYW4gZWxlbWVudCBpcyByZW1vdmVkXG4gICAgICAgIC8vIHR3aWNlIChib3RoIG9uIHRoZSBob3N0IGxldmVsIGFuZCB0aGUgY29tcG9uZW50IGxldmVsKVxuICAgICAgICBpZiAodGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdKSB7XG4gICAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy50cmlnZ2VyKGVsZW1lbnQsIHRyaWdnZXJOYW1lLCBWT0lEX1ZBTFVFLCBkZWZhdWx0VG9GYWxsYmFjayk7XG4gICAgICAgICAgaWYgKHBsYXllcikge1xuICAgICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCB0cnVlLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKGRlc3Ryb3lBZnRlckNvbXBsZXRlKSB7XG4gICAgICAgICAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gdGhpcy5fZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZWxlbWVudExpc3RlbmVycy5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgY29uc3QgdmlzaXRlZFRyaWdnZXJzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gbGlzdGVuZXIubmFtZTtcbiAgICAgICAgaWYgKHZpc2l0ZWRUcmlnZ2Vycy5oYXModHJpZ2dlck5hbWUpKSByZXR1cm47XG4gICAgICAgIHZpc2l0ZWRUcmlnZ2Vycy5hZGQodHJpZ2dlck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV07XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGZyb21TdGF0ZSA9IGVsZW1lbnRTdGF0ZXNbdHJpZ2dlck5hbWVdIHx8IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICB0cmlnZ2VyTmFtZSxcbiAgICAgICAgICB0cmFuc2l0aW9uLFxuICAgICAgICAgIGZyb21TdGF0ZSxcbiAgICAgICAgICB0b1N0YXRlLFxuICAgICAgICAgIHBsYXllcixcbiAgICAgICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9lbmdpbmU7XG5cbiAgICBpZiAoZWxlbWVudC5jaGlsZEVsZW1lbnRDb3VudCkge1xuICAgICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMoZWxlbWVudCwgY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IGEgKiA9PiBWT0lEIGFuaW1hdGlvbiB3YXMgZGV0ZWN0ZWQgYW5kIGtpY2tlZCBvZmZcbiAgICBpZiAodGhpcy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxlbWVudCwgY29udGV4dCwgdHJ1ZSkpIHJldHVybjtcblxuICAgIC8vIGZpbmQgdGhlIHBsYXllciB0aGF0IGlzIGFuaW1hdGluZyBhbmQgbWFrZSBzdXJlIHRoYXQgdGhlXG4gICAgLy8gcmVtb3ZhbCBpcyBkZWxheWVkIHVudGlsIHRoYXQgcGxheWVyIGhhcyBjb21wbGV0ZWRcbiAgICBsZXQgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgaWYgKGVuZ2luZS50b3RhbEFuaW1hdGlvbnMpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXJzID1cbiAgICAgICAgICBlbmdpbmUucGxheWVycy5sZW5ndGggPyBlbmdpbmUucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpIDogW107XG5cbiAgICAgIC8vIHdoZW4gdGhpcyBgaWYgc3RhdGVtZW50YCBkb2VzIG5vdCBjb250aW51ZSBmb3J3YXJkIGl0IG1lYW5zIHRoYXRcbiAgICAgIC8vIGEgcHJldmlvdXMgYW5pbWF0aW9uIHF1ZXJ5IGhhcyBzZWxlY3RlZCB0aGUgY3VycmVudCBlbGVtZW50IGFuZFxuICAgICAgLy8gaXMgYW5pbWF0aW5nIGl0LiBJbiB0aGlzIHNpdHVhdGlvbiB3YW50IHRvIGNvbnRpbnVlIGZvcndhcmRzIGFuZFxuICAgICAgLy8gYWxsb3cgdGhlIGVsZW1lbnQgdG8gYmUgcXVldWVkIHVwIGZvciBhbmltYXRpb24gbGF0ZXIuXG4gICAgICBpZiAoY3VycmVudFBsYXllcnMgJiYgY3VycmVudFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcGFyZW50ID0gZWxlbWVudDtcbiAgICAgICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSBlbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChwYXJlbnQpO1xuICAgICAgICAgIGlmICh0cmlnZ2Vycykge1xuICAgICAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgc3RhZ2Ugd2Uga25vdyB0aGF0IHRoZSBlbGVtZW50IHdpbGwgZWl0aGVyIGdldCByZW1vdmVkXG4gICAgLy8gZHVyaW5nIGZsdXNoIG9yIHdpbGwgYmUgcGlja2VkIHVwIGJ5IGEgcGFyZW50IHF1ZXJ5LiBFaXRoZXIgd2F5XG4gICAgLy8gd2UgbmVlZCB0byBmaXJlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoaXMgZWxlbWVudCB3aGVuIGl0IERPRVMgZ2V0XG4gICAgLy8gcmVtb3ZlZCAob25jZSB0aGUgcXVlcnkgcGFyZW50IGFuaW1hdGlvbiBpcyBkb25lIG9yIGFmdGVyIGZsdXNoKVxuICAgIHRoaXMucHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQpO1xuXG4gICAgLy8gd2hldGhlciBvciBub3QgYSBwYXJlbnQgaGFzIGFuIGFuaW1hdGlvbiB3ZSBuZWVkIHRvIGRlbGF5IHRoZSBkZWZlcnJhbCBvZiB0aGUgbGVhdmVcbiAgICAvLyBvcGVyYXRpb24gdW50aWwgd2UgaGF2ZSBtb3JlIGluZm9ybWF0aW9uICh3aGljaCB3ZSBkbyBhZnRlciBmbHVzaCgpIGhhcyBiZWVuIGNhbGxlZClcbiAgICBpZiAoY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uKSB7XG4gICAgICBlbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgZmFsc2UsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB3ZSBkbyB0aGlzIGFmdGVyIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCB0aGUgY2FsbGJhY2tzIGNhbiBiZSBmaXJlZFxuICAgICAgZW5naW5lLmFmdGVyRmx1c2goKCkgPT4gdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KSk7XG4gICAgICBlbmdpbmUuZGVzdHJveUlubmVyQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgIGVuZ2luZS5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgaW5zZXJ0Tm9kZShlbGVtZW50OiBhbnksIHBhcmVudDogYW55KTogdm9pZCB7IGFkZENsYXNzKGVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpOyB9XG5cbiAgZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZDogbnVtYmVyKTogUXVldWVJbnN0cnVjdGlvbltdIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIHRoaXMuX3F1ZXVlLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgaWYgKHBsYXllci5kZXN0cm95ZWQpIHJldHVybjtcblxuICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyOiBUcmlnZ2VyTGlzdGVuZXIpID0+IHtcbiAgICAgICAgICBpZiAobGlzdGVuZXIubmFtZSA9PSBlbnRyeS50cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgY29uc3QgYmFzZUV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgICAgICAgICAgIGVsZW1lbnQsIGVudHJ5LnRyaWdnZXJOYW1lLCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUpO1xuICAgICAgICAgICAgKGJhc2VFdmVudCBhcyBhbnkpWydfZGF0YSddID0gbWljcm90YXNrSWQ7XG4gICAgICAgICAgICBsaXN0ZW5PblBsYXllcihlbnRyeS5wbGF5ZXIsIGxpc3RlbmVyLnBoYXNlLCBiYXNlRXZlbnQsIGxpc3RlbmVyLmNhbGxiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGxheWVyLm1hcmtlZEZvckRlc3Ryb3kpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgIC8vIG5vdyB3ZSBjYW4gZGVzdHJveSB0aGUgZWxlbWVudCBwcm9wZXJseSBzaW5jZSB0aGUgZXZlbnQgbGlzdGVuZXJzIGhhdmVcbiAgICAgICAgICAvLyBiZWVuIGJvdW5kIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluc3RydWN0aW9ucy5wdXNoKGVudHJ5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX3F1ZXVlID0gW107XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIC8vIGlmIGRlcENvdW50ID09IDAgdGhlbSBtb3ZlIHRvIGZyb250XG4gICAgICAvLyBvdGhlcndpc2UgaWYgYSBjb250YWlucyBiIHRoZW4gbW92ZSBiYWNrXG4gICAgICBjb25zdCBkMCA9IGEudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBjb25zdCBkMSA9IGIudHJhbnNpdGlvbi5hc3QuZGVwQ291bnQ7XG4gICAgICBpZiAoZDAgPT0gMCB8fCBkMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiBkMCAtIGQxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZS5kcml2ZXIuY29udGFpbnNFbGVtZW50KGEuZWxlbWVudCwgYi5lbGVtZW50KSA/IDEgOiAtMTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koY29udGV4dDogYW55KSB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocCA9PiBwLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnModGhpcy5ob3N0RWxlbWVudCwgY29udGV4dCk7XG4gIH1cblxuICBlbGVtZW50Q29udGFpbnNEYXRhKGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIGxldCBjb250YWluc0RhdGEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudExpc3RlbmVycy5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgY29udGFpbnNEYXRhID1cbiAgICAgICAgKHRoaXMuX3F1ZXVlLmZpbmQoZW50cnkgPT4gZW50cnkuZWxlbWVudCA9PT0gZWxlbWVudCkgPyB0cnVlIDogZmFsc2UpIHx8IGNvbnRhaW5zRGF0YTtcbiAgICByZXR1cm4gY29udGFpbnNEYXRhO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVkVHJhbnNpdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbjtcbiAgcGxheWVyOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyO1xufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgcHVibGljIG5ld0hvc3RFbGVtZW50cyA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgcGxheWVyc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gIHB1YmxpYyBzdGF0ZXNCeUVsZW1lbnQgPSBuZXcgTWFwPGFueSwge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogU3RhdGVWYWx1ZX0+KCk7XG4gIHB1YmxpYyBkaXNhYmxlZE5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG5cbiAgcHVibGljIHRvdGFsQW5pbWF0aW9ucyA9IDA7XG4gIHB1YmxpYyB0b3RhbFF1ZXVlZFBsYXllcnMgPSAwO1xuXG4gIHByaXZhdGUgX25hbWVzcGFjZUxvb2t1cDoge1tpZDogc3RyaW5nXTogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZX0gPSB7fTtcbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTGlzdDogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZVtdID0gW107XG4gIHByaXZhdGUgX2ZsdXNoRm5zOiAoKCkgPT4gYW55KVtdID0gW107XG4gIHByaXZhdGUgX3doZW5RdWlldEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuXG4gIHB1YmxpYyBuYW1lc3BhY2VzQnlIb3N0RWxlbWVudCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICBwdWJsaWMgY29sbGVjdGVkRW50ZXJFbGVtZW50czogYW55W10gPSBbXTtcbiAgcHVibGljIGNvbGxlY3RlZExlYXZlRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgLy8gdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gYmUgb3ZlcnJpZGRlbiBieSB0aGUgY29kZSB0aGF0IHVzZXMgdGhpcyBlbmdpbmVcbiAgcHVibGljIG9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PiB7fTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgeyB0aGlzLm9uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpOyB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBwcml2YXRlIF9ub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIpIHt9XG5cbiAgZ2V0IHF1ZXVlZFBsYXllcnMoKTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LmZvckVhY2gobnMgPT4ge1xuICAgICAgbnMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwbGF5ZXJzO1xuICB9XG5cbiAgY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBucyA9IG5ldyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCwgdGhpcyk7XG4gICAgaWYgKGhvc3RFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBob3N0RWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRlZmVyIHRoaXMgbGF0ZXIgdW50aWwgZmx1c2ggZHVyaW5nIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBoYXNcbiAgICAgIC8vIGJlZW4gaW5zZXJ0ZWQgc28gdGhhdCB3ZSBrbm93IGV4YWN0bHkgd2hlcmUgdG8gcGxhY2UgaXQgaW5cbiAgICAgIC8vIHRoZSBuYW1lc3BhY2UgbGlzdFxuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuc2V0KGhvc3RFbGVtZW50LCBucyk7XG5cbiAgICAgIC8vIGdpdmVuIHRoYXQgdGhpcyBob3N0IGVsZW1lbnQgaXMgYXBhcnQgb2YgdGhlIGFuaW1hdGlvbiBjb2RlLCBpdFxuICAgICAgLy8gbWF5IG9yIG1heSBub3QgYmUgaW5zZXJ0ZWQgYnkgYSBwYXJlbnQgbm9kZSB0aGF0IGlzIGFuIG9mIGFuXG4gICAgICAvLyBhbmltYXRpb24gcmVuZGVyZXIgdHlwZS4gSWYgdGhpcyBoYXBwZW5zIHRoZW4gd2UgY2FuIHN0aWxsIGhhdmVcbiAgICAgIC8vIGFjY2VzcyB0byB0aGlzIGl0ZW0gd2hlbiB3ZSBxdWVyeSBmb3IgOmVudGVyIG5vZGVzLiBJZiB0aGUgcGFyZW50XG4gICAgICAvLyBpcyBhIHJlbmRlcmVyIHRoZW4gdGhlIHNldCBkYXRhLXN0cnVjdHVyZSB3aWxsIG5vcm1hbGl6ZSB0aGUgZW50cnlcbiAgICAgIHRoaXMuY29sbGVjdEVudGVyRWxlbWVudChob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdID0gbnM7XG4gIH1cblxuICBwcml2YXRlIF9iYWxhbmNlTmFtZXNwYWNlTGlzdChuczogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSwgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpbWl0ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxO1xuICAgIGlmIChsaW1pdCA+PSAwKSB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGkgPSBsaW1pdDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgbmV4dE5hbWVzcGFjZSA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICAgIGlmICh0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQobmV4dE5hbWVzcGFjZS5ob3N0RWxlbWVudCwgaG9zdEVsZW1lbnQpKSB7XG4gICAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaSArIDEsIDAsIG5zKTtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoMCwgMCwgbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnB1c2gobnMpO1xuICAgIH1cblxuICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuc2V0KGhvc3RFbGVtZW50LCBucyk7XG4gICAgcmV0dXJuIG5zO1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBucyA9IHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgaWYgKCFucykge1xuICAgICAgbnMgPSB0aGlzLmNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VJZCwgaG9zdEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlclRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCB0cmlnZ2VyOiBBbmltYXRpb25UcmlnZ2VyKSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAobnMgJiYgbnMucmVnaXN0ZXIobmFtZSwgdHJpZ2dlcikpIHtcbiAgICAgIHRoaXMudG90YWxBbmltYXRpb25zKys7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveShuYW1lc3BhY2VJZDogc3RyaW5nLCBjb250ZXh0OiBhbnkpIHtcbiAgICBpZiAoIW5hbWVzcGFjZUlkKSByZXR1cm47XG5cbiAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICB0aGlzLm5hbWVzcGFjZXNCeUhvc3RFbGVtZW50LmRlbGV0ZShucy5ob3N0RWxlbWVudCk7XG4gICAgICBkZWxldGUgdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5pbmRleE9mKG5zKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKCgpID0+IG5zLmRlc3Ryb3koY29udGV4dCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmV0Y2hOYW1lc3BhY2UoaWQ6IHN0cmluZykgeyByZXR1cm4gdGhpcy5fbmFtZXNwYWNlTG9va3VwW2lkXTsgfVxuXG4gIGZldGNoTmFtZXNwYWNlc0J5RWxlbWVudChlbGVtZW50OiBhbnkpOiBTZXQ8QW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4ge1xuICAgIC8vIG5vcm1hbGx5IHRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSBuYW1lc3BhY2UgcGVyIGVsZW1lbnQsIGhvd2V2ZXJcbiAgICAvLyBpZiBAdHJpZ2dlcnMgYXJlIHBsYWNlZCBvbiBib3RoIHRoZSBjb21wb25lbnQgZWxlbWVudCBhbmQgdGhlblxuICAgIC8vIGl0cyBob3N0IGVsZW1lbnQgKHdpdGhpbiB0aGUgY29tcG9uZW50IGNvZGUpIHRoZW4gdGhlcmUgd2lsbCBiZVxuICAgIC8vIHR3byBuYW1lc3BhY2VzIHJldHVybmVkLiBXZSB1c2UgYSBzZXQgaGVyZSB0byBzaW1wbHkgdGhlIGRlZHVwZVxuICAgIC8vIG9mIG5hbWVzcGFjZXMgaW5jYXNlIHRoZXJlIGFyZSBtdWx0aXBsZSB0cmlnZ2VycyBib3RoIHRoZSBlbG0gYW5kIGhvc3RcbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhlbGVtZW50U3RhdGVzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuc0lkID0gZWxlbWVudFN0YXRlc1trZXlzW2ldXS5uYW1lc3BhY2VJZDtcbiAgICAgICAgaWYgKG5zSWQpIHtcbiAgICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5zSWQpO1xuICAgICAgICAgIGlmIChucykge1xuICAgICAgICAgICAgbmFtZXNwYWNlcy5hZGQobnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmFtZXNwYWNlcztcbiAgfVxuXG4gIHRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMudHJpZ2dlcihlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpbnNlcnROb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnksIGluc2VydEJlZm9yZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBhbmQgcmVpbnNlcnRlZCAobW92ZSBvcGVyYXRpb24pXG4gICAgLy8gd2hlbiB0aGlzIG9jY3VycyB3ZSBkbyBub3Qgd2FudCB0byB1c2UgdGhlIGVsZW1lbnQgZm9yIGRlbGV0aW9uIGxhdGVyXG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICBkZXRhaWxzLnNldEZvclJlbW92YWwgPSBmYWxzZTtcbiAgICAgIGRldGFpbHMuc2V0Rm9yTW92ZSA9IHRydWU7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIG5hbWVzcGFjZUlkIGlzIGJsYW5rIHRoZW4gdGhlIGNhbGxlclxuICAgIC8vIGNvZGUgZG9lcyBub3QgY29udGFpbiBhbnkgYW5pbWF0aW9uIGNvZGUgaW4gaXQsIGJ1dCBpdCBpc1xuICAgIC8vIGp1c3QgYmVpbmcgY2FsbGVkIHNvIHRoYXQgdGhlIG5vZGUgaXMgbWFya2VkIGFzIGJlaW5nIGluc2VydGVkXG4gICAgaWYgKG5hbWVzcGFjZUlkKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcbiAgICAgIC8vIFRoaXMgaWYtc3RhdGVtZW50IGlzIGEgd29ya2Fyb3VuZCBmb3Igcm91dGVyIGlzc3VlICMyMTk0Ny5cbiAgICAgIC8vIFRoZSByb3V0ZXIgc29tZXRpbWVzIGhpdHMgYSByYWNlIGNvbmRpdGlvbiB3aGVyZSB3aGlsZSBhIHJvdXRlXG4gICAgICAvLyBpcyBiZWluZyBpbnN0YW50aWF0ZWQgYSBuZXcgbmF2aWdhdGlvbiBhcnJpdmVzLCB0cmlnZ2VyaW5nIGxlYXZlXG4gICAgICAvLyBhbmltYXRpb24gb2YgRE9NIHRoYXQgaGFzIG5vdCBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCB1bnRpbCB0aGlzXG4gICAgICAvLyBpcyByZXNvbHZlZCwgd2UgbmVlZCB0byBoYW5kbGUgdGhlIHNjZW5hcmlvIHdoZW4gRE9NIGlzIG5vdCBpbiBhXG4gICAgICAvLyBjb25zaXN0ZW50IHN0YXRlIGR1cmluZyB0aGUgYW5pbWF0aW9uLlxuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLmluc2VydE5vZGUoZWxlbWVudCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmx5ICpkaXJlY3RpdmVzIGFuZCBob3N0IGVsZW1lbnRzIGFyZSBpbnNlcnRlZCBiZWZvcmVcbiAgICBpZiAoaW5zZXJ0QmVmb3JlKSB7XG4gICAgICB0aGlzLmNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgY29sbGVjdEVudGVyRWxlbWVudChlbGVtZW50OiBhbnkpIHsgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLnB1c2goZWxlbWVudCk7IH1cblxuICBtYXJrRWxlbWVudEFzRGlzYWJsZWQoZWxlbWVudDogYW55LCB2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5hZGQoZWxlbWVudCk7XG4gICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLmRpc2FibGVkTm9kZXMuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgaWYgKCFpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBucyA9IG5hbWVzcGFjZUlkID8gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpIDogbnVsbDtcbiAgICBpZiAobnMpIHtcbiAgICAgIG5zLnJlbW92ZU5vZGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQsIGVsZW1lbnQsIGZhbHNlLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBtYXJrRWxlbWVudEFzUmVtb3ZlZChuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGhhc0FuaW1hdGlvbj86IGJvb2xlYW4sIGNvbnRleHQ/OiBhbnkpIHtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSB7XG4gICAgICBuYW1lc3BhY2VJZCxcbiAgICAgIHNldEZvclJlbW92YWw6IGNvbnRleHQsIGhhc0FuaW1hdGlvbixcbiAgICAgIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICBsaXN0ZW4oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkubGlzdGVuKGVsZW1lbnQsIG5hbWUsIHBoYXNlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICBlbnRyeTogUXVldWVJbnN0cnVjdGlvbiwgc3ViVGltZWxpbmVzOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBza2lwQnVpbGRBc3Q/OiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGVudHJ5LnRyYW5zaXRpb24uYnVpbGQoXG4gICAgICAgIHRoaXMuZHJpdmVyLCBlbnRyeS5lbGVtZW50LCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUsIGVudGVyQ2xhc3NOYW1lLFxuICAgICAgICBsZWF2ZUNsYXNzTmFtZSwgZW50cnkuZnJvbVN0YXRlLm9wdGlvbnMsIGVudHJ5LnRvU3RhdGUub3B0aW9ucywgc3ViVGltZWxpbmVzLCBza2lwQnVpbGRBc3QpO1xuICB9XG5cbiAgZGVzdHJveUlubmVyQW5pbWF0aW9ucyhjb250YWluZXJFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5kZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudCkpO1xuXG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuc2l6ZSA9PSAwKSByZXR1cm47XG5cbiAgICBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50KSk7XG4gIH1cblxuICBkZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBzZXQgZm9yIGRlc3RydWN0aW9uLCBidXQgaGFzbid0IHN0YXJ0ZWQuXG4gICAgICAgIC8vIGluIHRoaXMgc2l0dWF0aW9uIHdlIHdhbnQgdG8gZGVsYXkgdGhlIGRlc3RydWN0aW9uIHVudGlsIHRoZSBmbHVzaCBvY2N1cnNcbiAgICAgICAgLy8gc28gdGhhdCBhbnkgZXZlbnQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBwbGF5ZXIgYXJlIHRyaWdnZXJlZC5cbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXIubWFya2VkRm9yRGVzdHJveSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmZpbmlzaCgpKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpbWl6ZUdyb3VwUGxheWVyKHRoaXMucGxheWVycykub25Eb25lKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgLy8gdGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSByZW1vdmluZyBpdCB0d2ljZVxuICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkFMX1NUQVRFO1xuICAgICAgaWYgKGRldGFpbHMubmFtZXNwYWNlSWQpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKGRldGFpbHMubmFtZXNwYWNlSWQpO1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBucy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgZGV0YWlscy5zZXRGb3JSZW1vdmFsKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kcml2ZXIubWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IpKSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IsIHRydWUpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICBmbHVzaChtaWNyb3Rhc2tJZDogbnVtYmVyID0gLTEpIHtcbiAgICBsZXQgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAodGhpcy5uZXdIb3N0RWxlbWVudHMuc2l6ZSkge1xuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuZm9yRWFjaCgobnMsIGVsZW1lbnQpID0+IHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBlbGVtZW50KSk7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvdGFsQW5pbWF0aW9ucyAmJiB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbG0gPSB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHNbaV07XG4gICAgICAgIGFkZENsYXNzKGVsbSwgU1RBUl9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAmJlxuICAgICAgICAodGhpcy50b3RhbFF1ZXVlZFBsYXllcnMgfHwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgIGNvbnN0IGNsZWFudXBGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBsYXllcnMgPSB0aGlzLl9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZucywgbWljcm90YXNrSWQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGVhbnVwRm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2xlYW51cEZuc1tpXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRvdGFsUXVldWVkUGxheWVycyA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fZmx1c2hGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9mbHVzaEZucyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX3doZW5RdWlldEZucy5sZW5ndGgpIHtcbiAgICAgIC8vIHdlIG1vdmUgdGhlc2Ugb3ZlciB0byBhIHZhcmlhYmxlIHNvIHRoYXRcbiAgICAgIC8vIGlmIGFueSBuZXcgY2FsbGJhY2tzIGFyZSByZWdpc3RlcmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGZsdXNoIHRoZXkgZG8gbm90IHBvcHVsYXRlIHRoZSBleGlzdGluZyBzZXRcbiAgICAgIGNvbnN0IHF1aWV0Rm5zID0gdGhpcy5fd2hlblF1aWV0Rm5zO1xuICAgICAgdGhpcy5fd2hlblF1aWV0Rm5zID0gW107XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB7IHF1aWV0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBvcnRFcnJvcihlcnJvcnM6IHN0cmluZ1tdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIHByb2Nlc3MgYW5pbWF0aW9ucyBkdWUgdG8gdGhlIGZvbGxvd2luZyBmYWlsZWQgdHJpZ2dlciB0cmFuc2l0aW9uc1xcbiAke1xuICAgICAgICAgICAgZXJyb3JzLmpvaW4oJ1xcbicpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hBbmltYXRpb25zKGNsZWFudXBGbnM6IEZ1bmN0aW9uW10sIG1pY3JvdGFza0lkOiBudW1iZXIpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBzdWJUaW1lbGluZXMgPSBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHNraXBwZWRQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IHF1ZXVlZEluc3RydWN0aW9uczogUXVldWVkVHJhbnNpdGlvbltdID0gW107XG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICBjb25zdCBhbGxQcmVTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuICAgIGNvbnN0IGFsbFBvc3RTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuXG4gICAgY29uc3QgZGlzYWJsZWRFbGVtZW50c1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZSk7XG4gICAgICBjb25zdCBub2Rlc1RoYXRBcmVEaXNhYmxlZCA9IHRoaXMuZHJpdmVyLnF1ZXJ5KG5vZGUsIFFVRVVFRF9TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzVGhhdEFyZURpc2FibGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc2FibGVkRWxlbWVudHNTZXQuYWRkKG5vZGVzVGhhdEFyZURpc2FibGVkW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJvZHlOb2RlID0gZ2V0Qm9keU5vZGUoKTtcbiAgICBjb25zdCBhbGxUcmlnZ2VyRWxlbWVudHMgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGVzQnlFbGVtZW50LmtleXMoKSk7XG4gICAgY29uc3QgZW50ZXJOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzKTtcblxuICAgIC8vIHRoaXMgbXVzdCBvY2N1ciBiZWZvcmUgdGhlIGluc3RydWN0aW9ucyBhcmUgYnVpbHQgYmVsb3cgc3VjaCB0aGF0XG4gICAgLy8gdGhlIDplbnRlciBxdWVyaWVzIG1hdGNoIHRoZSBlbGVtZW50cyAoc2luY2UgdGhlIHRpbWVsaW5lIHF1ZXJpZXNcbiAgICAvLyBhcmUgZmlyZWQgZHVyaW5nIGluc3RydWN0aW9uIGJ1aWxkaW5nKS5cbiAgICBjb25zdCBlbnRlck5vZGVNYXBJZHMgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgIGxldCBpID0gMDtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IEVOVEVSX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGVudGVyTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbExlYXZlTm9kZXM6IGFueVtdID0gW107XG4gICAgY29uc3QgbWVyZ2VkTGVhdmVOb2RlcyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgICAgYWxsTGVhdmVOb2Rlcy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgaWYgKGRldGFpbHMuaGFzQW5pbWF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgU1RBUl9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChlbG0gPT4gbWVyZ2VkTGVhdmVOb2Rlcy5hZGQoZWxtKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxlYXZlTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgY29uc3QgbGVhdmVOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgQXJyYXkuZnJvbShtZXJnZWRMZWF2ZU5vZGVzKSk7XG4gICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBMRUFWRV9DTEFTU05BTUUgKyBpKys7XG4gICAgICBsZWF2ZU5vZGVNYXBJZHMuc2V0KHJvb3QsIGNsYXNzTmFtZSk7XG4gICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgfSk7XG5cbiAgICBjbGVhbnVwRm5zLnB1c2goKCkgPT4ge1xuICAgICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGxlYXZlTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBsZWF2ZU5vZGVNYXBJZHMuZ2V0KHJvb3QpICE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxMZWF2ZU5vZGVzLmZvckVhY2goZWxlbWVudCA9PiB7IHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTsgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGxQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBlcnJvbmVvdXNUcmFuc2l0aW9uczogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9uYW1lc3BhY2VMaXN0W2ldO1xuICAgICAgbnMuZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZCkuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IGVudHJ5LnBsYXllcjtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICAgIGFsbFBsYXllcnMucHVzaChwbGF5ZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICAgICAgLy8gbW92ZSBhbmltYXRpb25zIGFyZSBjdXJyZW50bHkgbm90IHN1cHBvcnRlZC4uLlxuICAgICAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yTW92ZSkge1xuICAgICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlSXNPcnBoYW5lZCA9ICFib2R5Tm9kZSB8fCAhdGhpcy5kcml2ZXIuY29udGFpbnNFbGVtZW50KGJvZHlOb2RlLCBlbGVtZW50KTtcbiAgICAgICAgY29uc3QgbGVhdmVDbGFzc05hbWUgPSBsZWF2ZU5vZGVNYXBJZHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGVudGVyQ2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbiA9IHRoaXMuX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICBlbnRyeSwgc3ViVGltZWxpbmVzLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIG5vZGVJc09ycGhhbmVkKSAhO1xuICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24uZXJyb3JzICYmIGluc3RydWN0aW9uLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5wdXNoKGluc3RydWN0aW9uKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBldmVuIHRob3VnaCB0aGUgZWxlbWVudCBtYXkgbm90IGJlIGFwYXJ0IG9mIHRoZSBET00sIGl0IG1heVxuICAgICAgICAvLyBzdGlsbCBiZSBhZGRlZCBhdCBhIGxhdGVyIHBvaW50IChkdWUgdG8gdGhlIG1lY2hhbmljcyBvZiBjb250ZW50XG4gICAgICAgIC8vIHByb2plY3Rpb24gYW5kL29yIGR5bmFtaWMgY29tcG9uZW50IGluc2VydGlvbikgdGhlcmVmb3JlIGl0J3NcbiAgICAgICAgLy8gaW1wb3J0YW50IHdlIHN0aWxsIHN0eWxlIHRoZSBlbGVtZW50LlxuICAgICAgICBpZiAobm9kZUlzT3JwaGFuZWQpIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgYSB1bm1hdGNoZWQgdHJhbnNpdGlvbiBpcyBxdWV1ZWQgdG8gZ28gdGhlbiBpdCBTSE9VTEQgTk9UIHJlbmRlclxuICAgICAgICAvLyBhbiBhbmltYXRpb24gYW5kIGNhbmNlbCB0aGUgcHJldmlvdXNseSBydW5uaW5nIGFuaW1hdGlvbnMuXG4gICAgICAgIGlmIChlbnRyeS5pc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaWYgYSBwYXJlbnQgYW5pbWF0aW9uIHVzZXMgdGhpcyBhbmltYXRpb24gYXMgYSBzdWIgdHJpZ2dlclxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgaW5zdHJ1Y3QgdGhlIHRpbWVsaW5lIGJ1aWxkZXIgdG8gbm90IGFkZCBhIHBsYXllciBkZWxheSwgYnV0XG4gICAgICAgIC8vIGluc3RlYWQgc3RyZXRjaCB0aGUgZmlyc3Qga2V5ZnJhbWUgZ2FwIHVwIHVudGlsIHRoZSBhbmltYXRpb24gc3RhcnRzLiBUaGVcbiAgICAgICAgLy8gcmVhc29uIHRoaXMgaXMgaW1wb3J0YW50IGlzIHRvIHByZXZlbnQgZXh0cmEgaW5pdGlhbGl6YXRpb24gc3R5bGVzIGZyb20gYmVpbmdcbiAgICAgICAgLy8gcmVxdWlyZWQgYnkgdGhlIHVzZXIgaW4gdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgaW5zdHJ1Y3Rpb24udGltZWxpbmVzLmZvckVhY2godGwgPT4gdGwuc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgPSB0cnVlKTtcblxuICAgICAgICBzdWJUaW1lbGluZXMuYXBwZW5kKGVsZW1lbnQsIGluc3RydWN0aW9uLnRpbWVsaW5lcyk7XG5cbiAgICAgICAgY29uc3QgdHVwbGUgPSB7aW5zdHJ1Y3Rpb24sIHBsYXllciwgZWxlbWVudH07XG5cbiAgICAgICAgcXVldWVkSW5zdHJ1Y3Rpb25zLnB1c2godHVwbGUpO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnF1ZXJpZWRFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICAgICAgZWxlbWVudCA9PiBnZXRPclNldEFzSW5NYXAocXVlcmllZEVsZW1lbnRzLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5wcmVTdHlsZVByb3BzLmZvckVhY2goKHN0cmluZ01hcCwgZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoc3RyaW5nTWFwKTtcbiAgICAgICAgICBpZiAocHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgc2V0VmFsOiBTZXQ8c3RyaW5nPiA9IGFsbFByZVN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgICBhbGxQcmVTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgYWxsUG9zdFN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHNldFZhbCA9IG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChlcnJvbmVvdXNUcmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLmZvckVhY2goaW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgICBlcnJvcnMucHVzaChgQCR7aW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWV9IGhhcyBmYWlsZWQgZHVlIHRvOlxcbmApO1xuICAgICAgICBpbnN0cnVjdGlvbi5lcnJvcnMgIS5mb3JFYWNoKGVycm9yID0+IGVycm9ycy5wdXNoKGAtICR7ZXJyb3J9XFxuYCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsUHJldmlvdXNQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICAvLyB0aGlzIG1hcCB3b3JrcyB0byB0ZWxsIHdoaWNoIGVsZW1lbnQgaW4gdGhlIERPTSB0cmVlIGlzIGNvbnRhaW5lZCBieVxuICAgIC8vIHdoaWNoIGFuaW1hdGlvbi4gRnVydGhlciBkb3duIGJlbG93IHRoaXMgbWFwIHdpbGwgZ2V0IHBvcHVsYXRlZCBvbmNlXG4gICAgLy8gdGhlIHBsYXllcnMgYXJlIGJ1aWx0IGFuZCBpbiBkb2luZyBzbyBpdCBjYW4gZWZmaWNpZW50bHkgZmlndXJlIG91dFxuICAgIC8vIGlmIGEgc3ViIHBsYXllciBpcyBza2lwcGVkIGR1ZSB0byBhIHBhcmVudCBwbGF5ZXIgaGF2aW5nIHByaW9yaXR5LlxuICAgIGNvbnN0IGFuaW1hdGlvbkVsZW1lbnRNYXAgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgaWYgKHN1YlRpbWVsaW5lcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQoZWxlbWVudCwgZWxlbWVudCk7XG4gICAgICAgIHRoaXMuX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgICAgICAgZW50cnkucGxheWVyLm5hbWVzcGFjZUlkLCBlbnRyeS5pbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBwbGF5ZXIuZWxlbWVudDtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9XG4gICAgICAgICAgdGhpcy5fZ2V0UHJldmlvdXNQbGF5ZXJzKGVsZW1lbnQsIGZhbHNlLCBwbGF5ZXIubmFtZXNwYWNlSWQsIHBsYXllci50cmlnZ2VyTmFtZSwgbnVsbCk7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwcmV2UGxheWVyID0+IHtcbiAgICAgICAgZ2V0T3JTZXRBc0luTWFwKGFsbFByZXZpb3VzUGxheWVyc01hcCwgZWxlbWVudCwgW10pLnB1c2gocHJldlBsYXllcik7XG4gICAgICAgIHByZXZQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciBub2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCAoZWl0aGVyIGJ5KVxuICAgIC8vIGhhdmluZyB0aGVpciBvd24gbGVhdmUgYW5pbWF0aW9ucyBvciBieSBiZWluZyBxdWVyaWVkIGluIGEgY29udGFpbmVyXG4gICAgLy8gdGhhdCB3aWxsIGJlIHJlbW92ZWQgb25jZSBhIHBhcmVudCBhbmltYXRpb24gaXMgY29tcGxldGUuIFRoZSBpZGVhXG4gICAgLy8gaGVyZSBpcyB0aGF0ICogc3R5bGVzIG11c3QgYmUgaWRlbnRpY2FsIHRvICEgc3R5bGVzIGJlY2F1c2Ugb2ZcbiAgICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSAoKiBpcyBhbHNvIGZpbGxlZCBpbiBieSBkZWZhdWx0IGluIG1hbnkgcGxhY2VzKS5cbiAgICAvLyBPdGhlcndpc2UgKiBzdHlsZXMgd2lsbCByZXR1cm4gYW4gZW1wdHkgdmFsdWUgb3IgYXV0byBzaW5jZSB0aGUgZWxlbWVudFxuICAgIC8vIHRoYXQgaXMgYmVpbmcgZ2V0Q29tcHV0ZWRTdHlsZSdkIHdpbGwgbm90IGJlIHZpc2libGUgKHNpbmNlICogPSBkZXN0aW5hdGlvbilcbiAgICBjb25zdCByZXBsYWNlTm9kZXMgPSBhbGxMZWF2ZU5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIFBPU1QgU1RBR0U6IGZpbGwgdGhlICogc3R5bGVzXG4gICAgY29uc3QgcG9zdFN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBjb25zdCBhbGxMZWF2ZVF1ZXJpZWROb2RlcyA9IGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgcG9zdFN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucywgYWxsUG9zdFN0eWxlRWxlbWVudHMsIEFVVE9fU1RZTEUpO1xuXG4gICAgYWxsTGVhdmVRdWVyaWVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGlmIChyZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKSkge1xuICAgICAgICByZXBsYWNlTm9kZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBSRSBTVEFHRTogZmlsbCB0aGUgISBzdHlsZXNcbiAgICBjb25zdCBwcmVTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgICAgcHJlU3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbmV3IFNldChub2RlcyksIGFsbFByZVN0eWxlRWxlbWVudHMsIFBSRV9TVFlMRSk7XG4gICAgfSk7XG5cbiAgICByZXBsYWNlTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGNvbnN0IHBvc3QgPSBwb3N0U3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIGNvbnN0IHByZSA9IHByZVN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBwb3N0U3R5bGVzTWFwLnNldChub2RlLCB7IC4uLnBvc3QsIC4uLnByZSB9IGFzIGFueSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByb290UGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc3ViUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEID0ge307XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3Qge2VsZW1lbnQsIHBsYXllciwgaW5zdHJ1Y3Rpb259ID0gZW50cnk7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaXQgd2FzIG5ldmVyIGNvbnN1bWVkIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiB3aGljaFxuICAgICAgLy8gbWVhbnMgdGhhdCBpdCBpcyBpbmRlcGVuZGVudCBhbmQgdGhlcmVmb3JlIHNob3VsZCBiZSBzZXQgZm9yIGFuaW1hdGlvblxuICAgICAgaWYgKHN1YlRpbWVsaW5lcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgIHBsYXllci5vdmVycmlkZVRvdGFsVGltZShpbnN0cnVjdGlvbi50b3RhbFRpbWUpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIHdpbGwgZmxvdyB1cCB0aGUgRE9NIGFuZCBxdWVyeSB0aGUgbWFwIHRvIGZpZ3VyZSBvdXRcbiAgICAgICAgLy8gaWYgYSBwYXJlbnQgYW5pbWF0aW9uIGhhcyBwcmlvcml0eSBvdmVyIGl0LiBJbiB0aGUgc2l0dWF0aW9uXG4gICAgICAgIC8vIHRoYXQgYSBwYXJlbnQgaXMgZGV0ZWN0ZWQgdGhlbiBpdCB3aWxsIGNhbmNlbCB0aGUgbG9vcC4gSWZcbiAgICAgICAgLy8gbm90aGluZyBpcyBkZXRlY3RlZCwgb3IgaXQgdGFrZXMgYSBmZXcgaG9wcyB0byBmaW5kIGEgcGFyZW50LFxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgZmlsbCBpbiB0aGUgbWlzc2luZyBub2RlcyBhbmQgc2lnbmFsIHRoZW0gYXMgaGF2aW5nXG4gICAgICAgIC8vIGEgZGV0ZWN0ZWQgcGFyZW50IChvciBhIE5PX1BBUkVOVCB2YWx1ZSB2aWEgYSBzcGVjaWFsIGNvbnN0YW50KS5cbiAgICAgICAgbGV0IHBhcmVudFdpdGhBbmltYXRpb246IGFueSA9IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRDtcbiAgICAgICAgaWYgKGFuaW1hdGlvbkVsZW1lbnRNYXAuc2l6ZSA+IDEpIHtcbiAgICAgICAgICBsZXQgZWxtID0gZWxlbWVudDtcbiAgICAgICAgICBjb25zdCBwYXJlbnRzVG9BZGQ6IGFueVtdID0gW107XG4gICAgICAgICAgd2hpbGUgKGVsbSA9IGVsbS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZFBhcmVudCA9IGFuaW1hdGlvbkVsZW1lbnRNYXAuZ2V0KGVsbSk7XG4gICAgICAgICAgICBpZiAoZGV0ZWN0ZWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgcGFyZW50V2l0aEFuaW1hdGlvbiA9IGRldGVjdGVkUGFyZW50O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudHNUb0FkZC5wdXNoKGVsbSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmVudHNUb0FkZC5mb3JFYWNoKHBhcmVudCA9PiBhbmltYXRpb25FbGVtZW50TWFwLnNldChwYXJlbnQsIHBhcmVudFdpdGhBbmltYXRpb24pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyUGxheWVyID0gdGhpcy5fYnVpbGRBbmltYXRpb24oXG4gICAgICAgICAgICBwbGF5ZXIubmFtZXNwYWNlSWQsIGluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXAsIHNraXBwZWRQbGF5ZXJzTWFwLCBwcmVTdHlsZXNNYXAsXG4gICAgICAgICAgICBwb3N0U3R5bGVzTWFwKTtcblxuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG5cbiAgICAgICAgaWYgKHBhcmVudFdpdGhBbmltYXRpb24gPT09IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCkge1xuICAgICAgICAgIHJvb3RQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChwYXJlbnRXaXRoQW5pbWF0aW9uKTtcbiAgICAgICAgICBpZiAocGFyZW50UGxheWVycyAmJiBwYXJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheWVyLnBhcmVudFBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGFyZW50UGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcyk7XG4gICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgIC8vIHRoZXJlIHN0aWxsIG1pZ2h0IGJlIGEgYW5jZXN0b3IgcGxheWVyIGFuaW1hdGluZyB0aGlzXG4gICAgICAgIC8vIGVsZW1lbnQgdGhlcmVmb3JlIHdlIHdpbGwgc3RpbGwgYWRkIGl0IGFzIGEgc3ViIHBsYXllclxuICAgICAgICAvLyBldmVuIGlmIGl0cyBhbmltYXRpb24gbWF5IGJlIGRpc2FibGVkXG4gICAgICAgIHN1YlBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICBpZiAoZGlzYWJsZWRFbGVtZW50c1NldC5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGZpbmQgYWxsIG9mIHRoZSBzdWIgcGxheWVycycgY29ycmVzcG9uZGluZyBpbm5lciBhbmltYXRpb24gcGxheWVyXG4gICAgc3ViUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAvLyBldmVuIGlmIGFueSBwbGF5ZXJzIGFyZSBub3QgZm91bmQgZm9yIGEgc3ViIGFuaW1hdGlvbiB0aGVuIGl0XG4gICAgICAvLyB3aWxsIHN0aWxsIGNvbXBsZXRlIGl0c2VsZiBhZnRlciB0aGUgbmV4dCB0aWNrIHNpbmNlIGl0J3MgTm9vcFxuICAgICAgY29uc3QgcGxheWVyc0ZvckVsZW1lbnQgPSBza2lwcGVkUGxheWVyc01hcC5nZXQocGxheWVyLmVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnNGb3JFbGVtZW50ICYmIHBsYXllcnNGb3JFbGVtZW50Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyc0ZvckVsZW1lbnQpO1xuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB0aGUgcmVhc29uIHdoeSB3ZSBkb24ndCBhY3R1YWxseSBwbGF5IHRoZSBhbmltYXRpb24gaXNcbiAgICAvLyBiZWNhdXNlIGFsbCB0aGF0IGEgc2tpcHBlZCBwbGF5ZXIgaXMgZGVzaWduZWQgdG8gZG8gaXMgdG9cbiAgICAvLyBmaXJlIHRoZSBzdGFydC9kb25lIHRyYW5zaXRpb24gY2FsbGJhY2sgZXZlbnRzXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgaWYgKHBsYXllci5wYXJlbnRQbGF5ZXIpIHtcbiAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJFdmVudHMocGxheWVyLnBhcmVudFBsYXllcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcnVuIHRocm91Z2ggYWxsIG9mIHRoZSBxdWV1ZWQgcmVtb3ZhbHMgYW5kIHNlZSBpZiB0aGV5XG4gICAgLy8gd2VyZSBwaWNrZWQgdXAgYnkgYSBxdWVyeS4gSWYgbm90IHRoZW4gcGVyZm9ybSB0aGUgcmVtb3ZhbFxuICAgIC8vIG9wZXJhdGlvbiByaWdodCBhd2F5IHVubGVzcyBhIHBhcmVudCBhbmltYXRpb24gaXMgb25nb2luZy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbExlYXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBhbGxMZWF2ZU5vZGVzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBMRUFWRV9DTEFTU05BTUUpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoZSBlbGVtZW50IGhhcyBhIHJlbW92YWwgYW5pbWF0aW9uIHRoYXQgaXMgYmVpbmdcbiAgICAgIC8vIHRha2VuIGNhcmUgb2YgYW5kIHRoZXJlZm9yZSB0aGUgaW5uZXIgZWxlbWVudHMgd2lsbCBoYW5nIGFyb3VuZFxuICAgICAgLy8gdW50aWwgdGhhdCBhbmltYXRpb24gaXMgb3ZlciAob3IgdGhlIHBhcmVudCBxdWVyaWVkIGFuaW1hdGlvbilcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuaGFzQW5pbWF0aW9uKSBjb250aW51ZTtcblxuICAgICAgbGV0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gICAgICAvLyBpZiB0aGlzIGVsZW1lbnQgaXMgcXVlcmllZCBvciBpZiBpdCBjb250YWlucyBxdWVyaWVkIGNoaWxkcmVuXG4gICAgICAvLyB0aGVuIHdlIHdhbnQgZm9yIHRoZSBlbGVtZW50IG5vdCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHBhZ2VcbiAgICAgIC8vIHVudGlsIHRoZSBxdWVyaWVkIGFuaW1hdGlvbnMgaGF2ZSBmaW5pc2hlZFxuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50cy5zaXplKSB7XG4gICAgICAgIGxldCBxdWVyaWVkUGxheWVyUmVzdWx0cyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmIChxdWVyaWVkUGxheWVyUmVzdWx0cyAmJiBxdWVyaWVkUGxheWVyUmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllclJlc3VsdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHF1ZXJpZWRJbm5lckVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBxdWVyaWVkSW5uZXJFbGVtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGxldCBxdWVyaWVkUGxheWVycyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQocXVlcmllZElubmVyRWxlbWVudHNbal0pO1xuICAgICAgICAgIGlmIChxdWVyaWVkUGxheWVycyAmJiBxdWVyaWVkUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaCguLi5xdWVyaWVkUGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwID0+ICFwLmRlc3Ryb3llZCk7XG4gICAgICBpZiAoYWN0aXZlUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUodGhpcywgZWxlbWVudCwgYWN0aXZlUGxheWVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyByZXF1aXJlZCBzbyB0aGUgY2xlYW51cCBtZXRob2QgZG9lc24ndCByZW1vdmUgdGhlbVxuICAgIGFsbExlYXZlTm9kZXMubGVuZ3RoID0gMDtcblxuICAgIHJvb3RQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfSk7XG4gICAgICBwbGF5ZXIucGxheSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJvb3RQbGF5ZXJzO1xuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zRGF0YShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgY29udGFpbnNEYXRhID0gZmFsc2U7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5zdGF0ZXNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkuZWxlbWVudENvbnRhaW5zRGF0YShlbGVtZW50KSB8fCBjb250YWluc0RhdGE7XG4gIH1cblxuICBhZnRlckZsdXNoKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHsgdGhpcy5fZmx1c2hGbnMucHVzaChjYWxsYmFjayk7IH1cblxuICBhZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoY2FsbGJhY2s6ICgpID0+IGFueSkgeyB0aGlzLl93aGVuUXVpZXRGbnMucHVzaChjYWxsYmFjayk7IH1cblxuICBwcml2YXRlIF9nZXRQcmV2aW91c1BsYXllcnMoXG4gICAgICBlbGVtZW50OiBzdHJpbmcsIGlzUXVlcmllZEVsZW1lbnQ6IGJvb2xlYW4sIG5hbWVzcGFjZUlkPzogc3RyaW5nLCB0cmlnZ2VyTmFtZT86IHN0cmluZyxcbiAgICAgIHRvU3RhdGVWYWx1ZT86IGFueSk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSB7XG4gICAgbGV0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmIChpc1F1ZXJpZWRFbGVtZW50KSB7XG4gICAgICBjb25zdCBxdWVyaWVkRWxlbWVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudFBsYXllcnMpIHtcbiAgICAgICAgcGxheWVycyA9IHF1ZXJpZWRFbGVtZW50UGxheWVycztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWxlbWVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIGNvbnN0IGlzUmVtb3ZhbEFuaW1hdGlvbiA9ICF0b1N0YXRlVmFsdWUgfHwgdG9TdGF0ZVZhbHVlID09IFZPSURfVkFMVUU7XG4gICAgICAgIGVsZW1lbnRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkgcmV0dXJuO1xuICAgICAgICAgIGlmICghaXNSZW1vdmFsQW5pbWF0aW9uICYmIHBsYXllci50cmlnZ2VyTmFtZSAhPSB0cmlnZ2VyTmFtZSkgcmV0dXJuO1xuICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hbWVzcGFjZUlkIHx8IHRyaWdnZXJOYW1lKSB7XG4gICAgICBwbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocGxheWVyID0+IHtcbiAgICAgICAgaWYgKG5hbWVzcGFjZUlkICYmIG5hbWVzcGFjZUlkICE9IHBsYXllci5uYW1lc3BhY2VJZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodHJpZ2dlck5hbWUgJiYgdHJpZ2dlck5hbWUgIT0gcGxheWVyLnRyaWdnZXJOYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwbGF5ZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYmVmb3JlQW5pbWF0aW9uQnVpbGQoXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KSB7XG4gICAgY29uc3QgdHJpZ2dlck5hbWUgPSBpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGluc3RydWN0aW9uLmVsZW1lbnQ7XG5cbiAgICAvLyB3aGVuIGEgcmVtb3ZhbCBhbmltYXRpb24gb2NjdXJzLCBBTEwgcHJldmlvdXMgcGxheWVycyBhcmUgY29sbGVjdGVkXG4gICAgLy8gYW5kIGRlc3Ryb3llZCAoZXZlbiBpZiB0aGV5IGFyZSBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IG5hbWVzcGFjZSlcbiAgICBjb25zdCB0YXJnZXROYW1lU3BhY2VJZDogc3RyaW5nfHVuZGVmaW5lZCA9XG4gICAgICAgIGluc3RydWN0aW9uLmlzUmVtb3ZhbFRyYW5zaXRpb24gPyB1bmRlZmluZWQgOiBuYW1lc3BhY2VJZDtcbiAgICBjb25zdCB0YXJnZXRUcmlnZ2VyTmFtZTogc3RyaW5nfHVuZGVmaW5lZCA9XG4gICAgICAgIGluc3RydWN0aW9uLmlzUmVtb3ZhbFRyYW5zaXRpb24gPyB1bmRlZmluZWQgOiB0cmlnZ2VyTmFtZTtcblxuICAgIGZvciAoY29uc3QgdGltZWxpbmVJbnN0cnVjdGlvbiBvZiBpbnN0cnVjdGlvbi50aW1lbGluZXMpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aW1lbGluZUluc3RydWN0aW9uLmVsZW1lbnQ7XG4gICAgICBjb25zdCBpc1F1ZXJpZWRFbGVtZW50ID0gZWxlbWVudCAhPT0gcm9vdEVsZW1lbnQ7XG4gICAgICBjb25zdCBwbGF5ZXJzID0gZ2V0T3JTZXRBc0luTWFwKGFsbFByZXZpb3VzUGxheWVyc01hcCwgZWxlbWVudCwgW10pO1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID0gdGhpcy5fZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgICAgIGVsZW1lbnQsIGlzUXVlcmllZEVsZW1lbnQsIHRhcmdldE5hbWVTcGFjZUlkLCB0YXJnZXRUcmlnZ2VyTmFtZSwgaW5zdHJ1Y3Rpb24udG9TdGF0ZSk7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBjb25zdCByZWFsUGxheWVyID0gcGxheWVyLmdldFJlYWxQbGF5ZXIoKSBhcyBhbnk7XG4gICAgICAgIGlmIChyZWFsUGxheWVyLmJlZm9yZURlc3Ryb3kpIHtcbiAgICAgICAgICByZWFsUGxheWVyLmJlZm9yZURlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbmVlZHMgdG8gYmUgZG9uZSBzbyB0aGF0IHRoZSBQUkUvUE9TVCBzdHlsZXMgY2FuIGJlXG4gICAgLy8gY29tcHV0ZWQgcHJvcGVybHkgd2l0aG91dCBpbnRlcmZlcmluZyB3aXRoIHRoZSBwcmV2aW91cyBhbmltYXRpb25cbiAgICBlcmFzZVN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcyk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEFuaW1hdGlvbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGluc3RydWN0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sXG4gICAgICBhbGxQcmV2aW91c1BsYXllcnNNYXA6IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4sXG4gICAgICBza2lwcGVkUGxheWVyc01hcDogTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+LCBwcmVTdHlsZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPixcbiAgICAgIHBvc3RTdHlsZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPik6IEFuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgdHJpZ2dlck5hbWUgPSBpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGluc3RydWN0aW9uLmVsZW1lbnQ7XG5cbiAgICAvLyB3ZSBmaXJzdCBydW4gdGhpcyBzbyB0aGF0IHRoZSBwcmV2aW91cyBhbmltYXRpb24gcGxheWVyXG4gICAgLy8gZGF0YSBjYW4gYmUgcGFzc2VkIGludG8gdGhlIHN1Y2Nlc3NpdmUgYW5pbWF0aW9uIHBsYXllcnNcbiAgICBjb25zdCBhbGxRdWVyaWVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgYWxsQ29uc3VtZWRFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbFN1YkVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgYWxsTmV3UGxheWVycyA9IGluc3RydWN0aW9uLnRpbWVsaW5lcy5tYXAodGltZWxpbmVJbnN0cnVjdGlvbiA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgYWxsQ29uc3VtZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG5cbiAgICAgIC8vIEZJWE1FIChtYXRza28pOiBtYWtlIHN1cmUgdG8tYmUtcmVtb3ZlZCBhbmltYXRpb25zIGFyZSByZW1vdmVkIHByb3Blcmx5XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddO1xuICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5yZW1vdmVkQmVmb3JlUXVlcmllZClcbiAgICAgICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZHVyYXRpb24sIHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZGVsYXkpO1xuXG4gICAgICBjb25zdCBpc1F1ZXJpZWRFbGVtZW50ID0gZWxlbWVudCAhPT0gcm9vdEVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIGZsYXR0ZW5Hcm91cFBsYXllcnMoKGFsbFByZXZpb3VzUGxheWVyc01hcC5nZXQoZWxlbWVudCkgfHwgRU1QVFlfUExBWUVSX0FSUkFZKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocCA9PiBwLmdldFJlYWxQbGF5ZXIoKSkpXG4gICAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGBlbGVtZW50YCBpcyBub3QgYXBhcnQgb2YgdGhlIEFuaW1hdGlvblBsYXllciBkZWZpbml0aW9uLCBidXRcbiAgICAgICAgICAgICAgICAvLyBNb2NrL1dlYkFuaW1hdGlvbnNcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGVsZW1lbnQgd2l0aGluIHRoZWlyIGltcGxlbWVudGF0aW9uLiBUaGlzIHdpbGwgYmUgYWRkZWQgaW4gQW5ndWxhcjUgdG9cbiAgICAgICAgICAgICAgICAvLyBBbmltYXRpb25QbGF5ZXJcbiAgICAgICAgICAgICAgICBjb25zdCBwcCA9IHAgYXMgYW55O1xuICAgICAgICAgICAgICAgIHJldHVybiBwcC5lbGVtZW50ID8gcHAuZWxlbWVudCA9PT0gZWxlbWVudCA6IGZhbHNlO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgY29uc3QgcHJlU3R5bGVzID0gcHJlU3R5bGVzTWFwLmdldChlbGVtZW50KTtcbiAgICAgIGNvbnN0IHBvc3RTdHlsZXMgPSBwb3N0U3R5bGVzTWFwLmdldChlbGVtZW50KTtcbiAgICAgIGNvbnN0IGtleWZyYW1lcyA9IG5vcm1hbGl6ZUtleWZyYW1lcyhcbiAgICAgICAgICB0aGlzLmRyaXZlciwgdGhpcy5fbm9ybWFsaXplciwgZWxlbWVudCwgdGltZWxpbmVJbnN0cnVjdGlvbi5rZXlmcmFtZXMsIHByZVN0eWxlcyxcbiAgICAgICAgICBwb3N0U3R5bGVzKTtcbiAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX2J1aWxkUGxheWVyKHRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGtleWZyYW1lcywgcHJldmlvdXNQbGF5ZXJzKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoaXMgcGFydGljdWxhciBwbGF5ZXIgYmVsb25ncyB0byBhIHN1YiB0cmlnZ2VyLiBJdCBpc1xuICAgICAgLy8gaW1wb3J0YW50IHRoYXQgd2UgbWF0Y2ggdGhpcyBwbGF5ZXIgdXAgd2l0aCB0aGUgY29ycmVzcG9uZGluZyAoQHRyaWdnZXIubGlzdGVuZXIpXG4gICAgICBpZiAodGltZWxpbmVJbnN0cnVjdGlvbi5zdWJUaW1lbGluZSAmJiBza2lwcGVkUGxheWVyc01hcCkge1xuICAgICAgICBhbGxTdWJFbGVtZW50cy5hZGQoZWxlbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1F1ZXJpZWRFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRQbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcihuYW1lc3BhY2VJZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuICAgICAgICB3cmFwcGVkUGxheWVyLnNldFJlYWxQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgYWxsUXVlcmllZFBsYXllcnMucHVzaCh3cmFwcGVkUGxheWVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBsYXllcjtcbiAgICB9KTtcblxuICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgW10pLnB1c2gocGxheWVyKTtcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gZGVsZXRlT3JVbnNldEluTWFwKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQsIHBsYXllci5lbGVtZW50LCBwbGF5ZXIpKTtcbiAgICB9KTtcblxuICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGFkZENsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICBjb25zdCBwbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKGFsbE5ld1BsYXllcnMpO1xuICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgYWxsQ29uc3VtZWRFbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSkpO1xuICAgICAgc2V0U3R5bGVzKHJvb3RFbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIGJhc2ljYWxseSBtYWtlcyBhbGwgb2YgdGhlIGNhbGxiYWNrcyBmb3Igc3ViIGVsZW1lbnQgYW5pbWF0aW9uc1xuICAgIC8vIGJlIGRlcGVuZGVudCBvbiB0aGUgdXBwZXIgcGxheWVycyBmb3Igd2hlbiB0aGV5IGZpbmlzaFxuICAgIGFsbFN1YkVsZW1lbnRzLmZvckVhY2goXG4gICAgICAgIGVsZW1lbnQgPT4geyBnZXRPclNldEFzSW5NYXAoc2tpcHBlZFBsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7IH0pO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUGxheWVyKFxuICAgICAgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGtleWZyYW1lczogybVTdHlsZURhdGFbXSxcbiAgICAgIHByZXZpb3VzUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGlmIChrZXlmcmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZHJpdmVyLmFuaW1hdGUoXG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uZWxlbWVudCwga2V5ZnJhbWVzLCBpbnN0cnVjdGlvbi5kdXJhdGlvbiwgaW5zdHJ1Y3Rpb24uZGVsYXksXG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uZWFzaW5nLCBwcmV2aW91c1BsYXllcnMpO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbXB0eSB0cmFuc2l0aW9ufGRlZmluaXRpb24gaXMgcHJvdmlkZWRcbiAgICAvLyAuLi4gdGhlcmUgaXMgbm8gcG9pbnQgaW4gcmVuZGVyaW5nIGFuIGVtcHR5IGFuaW1hdGlvblxuICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcihpbnN0cnVjdGlvbi5kdXJhdGlvbiwgaW5zdHJ1Y3Rpb24uZGVsYXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfcGxheWVyOiBBbmltYXRpb25QbGF5ZXIgPSBuZXcgTm9vcEFuaW1hdGlvblBsYXllcigpO1xuICBwcml2YXRlIF9jb250YWluc1JlYWxQbGF5ZXIgPSBmYWxzZTtcblxuICBwcml2YXRlIF9xdWV1ZWRDYWxsYmFja3M6IHtbbmFtZTogc3RyaW5nXTogKCgpID0+IGFueSlbXX0gPSB7fTtcbiAgcHVibGljIHJlYWRvbmx5IGRlc3Ryb3llZCA9IGZhbHNlO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXI7XG5cbiAgcHVibGljIG1hcmtlZEZvckRlc3Ryb3k6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgcmVhZG9ubHkgcXVldWVkOiBib29sZWFuID0gdHJ1ZTtcbiAgcHVibGljIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZywgcHVibGljIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHB1YmxpYyBlbGVtZW50OiBhbnkpIHt9XG5cbiAgc2V0UmVhbFBsYXllcihwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGlmICh0aGlzLl9jb250YWluc1JlYWxQbGF5ZXIpIHJldHVybjtcblxuICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9xdWV1ZWRDYWxsYmFja3MpLmZvckVhY2gocGhhc2UgPT4ge1xuICAgICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzW3BoYXNlXS5mb3JFYWNoKFxuICAgICAgICAgIGNhbGxiYWNrID0+IGxpc3Rlbk9uUGxheWVyKHBsYXllciwgcGhhc2UsIHVuZGVmaW5lZCwgY2FsbGJhY2spKTtcbiAgICB9KTtcbiAgICB0aGlzLl9xdWV1ZWRDYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLl9jb250YWluc1JlYWxQbGF5ZXIgPSB0cnVlO1xuICAgIHRoaXMub3ZlcnJpZGVUb3RhbFRpbWUocGxheWVyLnRvdGFsVGltZSk7XG4gICAgKHRoaXMgYXN7cXVldWVkOiBib29sZWFufSkucXVldWVkID0gZmFsc2U7XG4gIH1cblxuICBnZXRSZWFsUGxheWVyKCkgeyByZXR1cm4gdGhpcy5fcGxheWVyOyB9XG5cbiAgb3ZlcnJpZGVUb3RhbFRpbWUodG90YWxUaW1lOiBudW1iZXIpIHsgKHRoaXMgYXMgYW55KS50b3RhbFRpbWUgPSB0b3RhbFRpbWU7IH1cblxuICBzeW5jUGxheWVyRXZlbnRzKHBsYXllcjogQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BsYXllciBhcyBhbnk7XG4gICAgaWYgKHAudHJpZ2dlckNhbGxiYWNrKSB7XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBwLnRyaWdnZXJDYWxsYmFjayAhKCdzdGFydCcpKTtcbiAgICB9XG4gICAgcGxheWVyLm9uRG9uZSgoKSA9PiB0aGlzLmZpbmlzaCgpKTtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHRoaXMuZGVzdHJveSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3F1ZXVlRXZlbnQobmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSk6IHZvaWQge1xuICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLl9xdWV1ZWRDYWxsYmFja3MsIG5hbWUsIFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZG9uZScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRG9uZShmbik7XG4gIH1cblxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9xdWV1ZUV2ZW50KCdzdGFydCcsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uU3RhcnQoZm4pO1xuICB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWVkKSB7XG4gICAgICB0aGlzLl9xdWV1ZUV2ZW50KCdkZXN0cm95JywgZm4pO1xuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXIub25EZXN0cm95KGZuKTtcbiAgfVxuXG4gIGluaXQoKTogdm9pZCB7IHRoaXMuX3BsYXllci5pbml0KCk7IH1cblxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5xdWV1ZWQgPyBmYWxzZSA6IHRoaXMuX3BsYXllci5oYXNTdGFydGVkKCk7IH1cblxuICBwbGF5KCk6IHZvaWQgeyAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnBsYXkoKTsgfVxuXG4gIHBhdXNlKCk6IHZvaWQgeyAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnBhdXNlKCk7IH1cblxuICByZXN0YXJ0KCk6IHZvaWQgeyAhdGhpcy5xdWV1ZWQgJiYgdGhpcy5fcGxheWVyLnJlc3RhcnQoKTsgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHsgdGhpcy5fcGxheWVyLmZpbmlzaCgpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAodGhpcyBhc3tkZXN0cm95ZWQ6IGJvb2xlYW59KS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3BsYXllci5kZXN0cm95KCk7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5yZXNldCgpOyB9XG5cbiAgc2V0UG9zaXRpb24ocDogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcGxheWVyLnNldFBvc2l0aW9uKHApO1xuICAgIH1cbiAgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnF1ZXVlZCA/IDAgOiB0aGlzLl9wbGF5ZXIuZ2V0UG9zaXRpb24oKTsgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGxheWVyIGFzIGFueTtcbiAgICBpZiAocC50cmlnZ2VyQ2FsbGJhY2spIHtcbiAgICAgIHAudHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZU9yVW5zZXRJbk1hcChtYXA6IE1hcDxhbnksIGFueVtdPnwge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCB2YWx1ZTogYW55KSB7XG4gIGxldCBjdXJyZW50VmFsdWVzOiBhbnlbXXxudWxsfHVuZGVmaW5lZDtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIG1hcC5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcFtrZXldO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBkZWxldGUgbWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXJyZW50VmFsdWVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUcmlnZ2VyVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG4gIC8vIHdlIHVzZSBgIT0gbnVsbGAgaGVyZSBiZWNhdXNlIGl0J3MgdGhlIG1vc3Qgc2ltcGxlXG4gIC8vIHdheSB0byB0ZXN0IGFnYWluc3QgYSBcImZhbHN5XCIgdmFsdWUgd2l0aG91dCBtaXhpbmdcbiAgLy8gaW4gZW1wdHkgc3RyaW5ncyBvciBhIHplcm8gdmFsdWUuIERPIE5PVCBPUFRJTUlaRS5cbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudE5vZGUobm9kZTogYW55KSB7XG4gIHJldHVybiBub2RlICYmIG5vZGVbJ25vZGVUeXBlJ10gPT09IDE7XG59XG5cbmZ1bmN0aW9uIGlzVHJpZ2dlckV2ZW50VmFsaWQoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGV2ZW50TmFtZSA9PSAnc3RhcnQnIHx8IGV2ZW50TmFtZSA9PSAnZG9uZSc7XG59XG5cbmZ1bmN0aW9uIGNsb2FrRWxlbWVudChlbGVtZW50OiBhbnksIHZhbHVlPzogc3RyaW5nKSB7XG4gIGNvbnN0IG9sZFZhbHVlID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5O1xuICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiAnbm9uZSc7XG4gIHJldHVybiBvbGRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgIHZhbHVlc01hcDogTWFwPGFueSwgybVTdHlsZURhdGE+LCBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgZWxlbWVudHM6IFNldDxhbnk+LFxuICAgIGVsZW1lbnRQcm9wc01hcDogTWFwPGFueSwgU2V0PHN0cmluZz4+LCBkZWZhdWx0U3R5bGU6IHN0cmluZyk6IGFueVtdIHtcbiAgY29uc3QgY2xvYWtWYWxzOiBzdHJpbmdbXSA9IFtdO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtWYWxzLnB1c2goY2xvYWtFbGVtZW50KGVsZW1lbnQpKSk7XG5cbiAgY29uc3QgZmFpbGVkRWxlbWVudHM6IGFueVtdID0gW107XG5cbiAgZWxlbWVudFByb3BzTWFwLmZvckVhY2goKHByb3BzOiBTZXQ8c3RyaW5nPiwgZWxlbWVudDogYW55KSA9PiB7XG4gICAgY29uc3Qgc3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHN0eWxlc1twcm9wXSA9IGRyaXZlci5jb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCwgZGVmYXVsdFN0eWxlKTtcblxuICAgICAgLy8gdGhlcmUgaXMgbm8gZWFzeSB3YXkgdG8gZGV0ZWN0IHRoaXMgYmVjYXVzZSBhIHN1YiBlbGVtZW50IGNvdWxkIGJlIHJlbW92ZWRcbiAgICAgIC8vIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiBlbGVtZW50IGJlaW5nIGRldGFjaGVkLlxuICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTtcbiAgICAgICAgZmFpbGVkRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YWx1ZXNNYXAuc2V0KGVsZW1lbnQsIHN0eWxlcyk7XG4gIH0pO1xuXG4gIC8vIHdlIHVzZSBhIGluZGV4IHZhcmlhYmxlIGhlcmUgc2luY2UgU2V0LmZvckVhY2goYSwgaSkgZG9lcyBub3QgcmV0dXJuXG4gIC8vIGFuIGluZGV4IHZhbHVlIGZvciB0aGUgY2xvc3VyZSAoYnV0IGluc3RlYWQganVzdCB0aGUgdmFsdWUpXG4gIGxldCBpID0gMDtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrRWxlbWVudChlbGVtZW50LCBjbG9ha1ZhbHNbaSsrXSkpO1xuXG4gIHJldHVybiBmYWlsZWRFbGVtZW50cztcbn1cblxuLypcblNpbmNlIHRoZSBBbmd1bGFyIHJlbmRlcmVyIGNvZGUgd2lsbCByZXR1cm4gYSBjb2xsZWN0aW9uIG9mIGluc2VydGVkXG5ub2RlcyBpbiBhbGwgYXJlYXMgb2YgYSBET00gdHJlZSwgaXQncyB1cCB0byB0aGlzIGFsZ29yaXRobSB0byBmaWd1cmVcbm91dCB3aGljaCBub2RlcyBhcmUgcm9vdHMgZm9yIGVhY2ggYW5pbWF0aW9uIEB0cmlnZ2VyLlxuXG5CeSBwbGFjaW5nIGVhY2ggaW5zZXJ0ZWQgbm9kZSBpbnRvIGEgU2V0IGFuZCB0cmF2ZXJzaW5nIHVwd2FyZHMsIGl0XG5pcyBwb3NzaWJsZSB0byBmaW5kIHRoZSBAdHJpZ2dlciBlbGVtZW50cyBhbmQgd2VsbCBhbnkgZGlyZWN0ICpzdGFyXG5pbnNlcnRpb24gbm9kZXMsIGlmIGEgQHRyaWdnZXIgcm9vdCBpcyBmb3VuZCB0aGVuIHRoZSBlbnRlciBlbGVtZW50XG5pcyBwbGFjZWQgaW50byB0aGUgTWFwW0B0cmlnZ2VyXSBzcG90LlxuICovXG5mdW5jdGlvbiBidWlsZFJvb3RNYXAocm9vdHM6IGFueVtdLCBub2RlczogYW55W10pOiBNYXA8YW55LCBhbnlbXT4ge1xuICBjb25zdCByb290TWFwID0gbmV3IE1hcDxhbnksIGFueVtdPigpO1xuICByb290cy5mb3JFYWNoKHJvb3QgPT4gcm9vdE1hcC5zZXQocm9vdCwgW10pKTtcblxuICBpZiAobm9kZXMubGVuZ3RoID09IDApIHJldHVybiByb290TWFwO1xuXG4gIGNvbnN0IE5VTExfTk9ERSA9IDE7XG4gIGNvbnN0IG5vZGVTZXQgPSBuZXcgU2V0KG5vZGVzKTtcbiAgY29uc3QgbG9jYWxSb290TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcblxuICBmdW5jdGlvbiBnZXRSb290KG5vZGU6IGFueSk6IGFueSB7XG4gICAgaWYgKCFub2RlKSByZXR1cm4gTlVMTF9OT0RFO1xuXG4gICAgbGV0IHJvb3QgPSBsb2NhbFJvb3RNYXAuZ2V0KG5vZGUpO1xuICAgIGlmIChyb290KSByZXR1cm4gcm9vdDtcblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICBpZiAocm9vdE1hcC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgQHRyaWdnZXJcbiAgICAgIHJvb3QgPSBwYXJlbnQ7XG4gICAgfSBlbHNlIGlmIChub2RlU2V0LmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBuZ0lmXG4gICAgICByb290ID0gTlVMTF9OT0RFO1xuICAgIH0gZWxzZSB7ICAvLyByZWN1cnNlIHVwd2FyZHNcbiAgICAgIHJvb3QgPSBnZXRSb290KHBhcmVudCk7XG4gICAgfVxuXG4gICAgbG9jYWxSb290TWFwLnNldChub2RlLCByb290KTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGdldFJvb3Qobm9kZSk7XG4gICAgaWYgKHJvb3QgIT09IE5VTExfTk9ERSkge1xuICAgICAgcm9vdE1hcC5nZXQocm9vdCkgIS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJvb3RNYXA7XG59XG5cbmNvbnN0IENMQVNTRVNfQ0FDSEVfS0VZID0gJyQkY2xhc3Nlcyc7XG5mdW5jdGlvbiBjb250YWluc0NsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2xhc3NlcyA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIHJldHVybiBjbGFzc2VzICYmIGNsYXNzZXNbY2xhc3NOYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjbGFzc2VzOiB7W2NsYXNzTmFtZTogc3RyaW5nXTogYm9vbGVhbn0gPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICBpZiAoIWNsYXNzZXMpIHtcbiAgICAgIGNsYXNzZXMgPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXSA9IHt9O1xuICAgIH1cbiAgICBjbGFzc2VzW2NsYXNzTmFtZV0gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFufSA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICBkZWxldGUgY2xhc3Nlc1tjbGFzc05hbWVdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVOb2Rlc0FmdGVyQW5pbWF0aW9uRG9uZShcbiAgICBlbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUsIGVsZW1lbnQ6IGFueSwgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuR3JvdXBQbGF5ZXJzKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyW10ge1xuICBjb25zdCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW107XG4gIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgcmV0dXJuIGZpbmFsUGxheWVycztcbn1cblxuZnVuY3Rpb24gX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSwgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBBbmltYXRpb25Hcm91cFBsYXllcikge1xuICAgICAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXIucGxheWVycywgZmluYWxQbGF5ZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmluYWxQbGF5ZXJzLnB1c2gocGxheWVyIGFzIEFuaW1hdGlvblBsYXllcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9iakVxdWFscyhhOiB7W2tleTogc3RyaW5nXTogYW55fSwgYjoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgY29uc3QgazEgPSBPYmplY3Qua2V5cyhhKTtcbiAgY29uc3QgazIgPSBPYmplY3Qua2V5cyhiKTtcbiAgaWYgKGsxLmxlbmd0aCAhPSBrMi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrMS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByb3AgPSBrMVtpXTtcbiAgICBpZiAoIWIuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgYVtwcm9wXSAhPT0gYltwcm9wXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKFxuICAgIGVsZW1lbnQ6IGFueSwgYWxsUHJlU3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+LFxuICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4pOiBib29sZWFuIHtcbiAgY29uc3QgcG9zdEVudHJ5ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAoIXBvc3RFbnRyeSkgcmV0dXJuIGZhbHNlO1xuXG4gIGxldCBwcmVFbnRyeSA9IGFsbFByZVN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICBpZiAocHJlRW50cnkpIHtcbiAgICBwb3N0RW50cnkuZm9yRWFjaChkYXRhID0+IHByZUVudHJ5ICEuYWRkKGRhdGEpKTtcbiAgfSBlbHNlIHtcbiAgICBhbGxQcmVTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBwb3N0RW50cnkpO1xuICB9XG5cbiAgYWxsUG9zdFN0eWxlRWxlbWVudHMuZGVsZXRlKGVsZW1lbnQpO1xuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==