import * as tslib_1 from "tslib";
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
            var oldParams_1 = (this.options.params);
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
export var DELETED_STATE_VALUE = new StateValue('DELETED');
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
        else if (fromState === DELETED_STATE_VALUE) {
            return player;
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
                var elementStates = (_this._engine.statesByElement.get(element));
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
    /** @internal */
    TransitionAnimationEngine.prototype._onRemovalComplete = /** @internal */
    function (element, context) { this.onRemovalComplete(element, context); };
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
            this._fetchNamespace(namespaceId).trigger(element, name, value);
            return true;
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
        var stateMap = this.statesByElement.get(element);
        if (stateMap) {
            Object.keys(stateMap).forEach(function (triggerName) { return stateMap[triggerName] = DELETED_STATE_VALUE; });
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
                var className = (enterNodeMapIds.get(root));
                nodes.forEach(function (node) { return removeClass(node, className); });
            });
            leaveNodeMap.forEach(function (nodes, root) {
                var className = (leaveNodeMapIds.get(root));
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
                var leaveClassName = (leaveNodeMapIds.get(element));
                var enterClassName = (enterNodeMapIds.get(element));
                var instruction = (_this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName));
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
                        var setVal_1 = (allPreStyleElements.get(element));
                        if (!setVal_1) {
                            allPreStyleElements.set(element, setVal_1 = new Set());
                        }
                        props.forEach(function (prop) { return setVal_1.add(prop); });
                    }
                });
                instruction.postStyleProps.forEach(function (stringMap, element) {
                    var props = Object.keys(stringMap);
                    var setVal = (allPostStyleElements.get(element));
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
    /* @internal */
    TransitionAnimationPlayer.prototype.triggerCallback = /* @internal */
    function (phaseName) {
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
            // ngIf inside @trigger
            root = parent;
        }
        else if (nodeSet.has(parent)) {
            // ngIf inside ngIf
            root = NULL_NODE;
        }
        else {
            // recurse upwards
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFxQyxtQkFBbUIsRUFBRSxxQkFBcUIsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFNM0wsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBbUIsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR3JNLE9BQU8sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuSSxJQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0FBQzdDLElBQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDO0FBQzdDLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7QUFDakQsSUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNqRCxJQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUMxQyxJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQztBQUUxQyxJQUFNLGtCQUFrQixHQUFnQyxFQUFFLENBQUM7QUFDM0QsSUFBTSxrQkFBa0IsR0FBMEI7SUFDaEQsV0FBVyxFQUFFLEVBQUU7SUFDZixhQUFhLEVBQUUsS0FBSztJQUNwQixVQUFVLEVB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QUssQ0FBQztJQUU3QixJQUFJLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNiLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxRQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUM7S0FDakQ7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0M7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIgYXMgQW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeX0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi4vZHNsL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0VOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FLCBOR19BTklNQVRJTkdfU0VMRUNUT1IsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FLCBOR19UUklHR0VSX1NFTEVDVE9SLCBjb3B5T2JqLCBlcmFzZVN0eWxlcywgaXRlcmF0b3JUb0FycmF5LCBzZXRTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Z2V0Qm9keU5vZGUsIGdldE9yU2V0QXNJbk1hcCwgbGlzdGVuT25QbGF5ZXIsIG1ha2VBbmltYXRpb25FdmVudCwgbm9ybWFsaXplS2V5ZnJhbWVzLCBvcHRpbWl6ZUdyb3VwUGxheWVyfSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IFFVRVVFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgUVVFVUVEX1NFTEVDVE9SID0gJy5uZy1hbmltYXRlLXF1ZXVlZCc7XG5jb25zdCBESVNBQkxFRF9DTEFTU05BTUUgPSAnbmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBESVNBQkxFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1kaXNhYmxlZCc7XG5jb25zdCBTVEFSX0NMQVNTTkFNRSA9ICduZy1zdGFyLWluc2VydGVkJztcbmNvbnN0IFNUQVJfU0VMRUNUT1IgPSAnLm5nLXN0YXItaW5zZXJ0ZWQnO1xuXG5jb25zdCBFTVBUWV9QTEFZRVJfQVJSQVk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuY29uc3QgTlVMTF9SRU1PVkFMX1NUQVRFOiBFbGVtZW50QW5pbWF0aW9uU3RhdGUgPSB7XG4gIG5hbWVzcGFjZUlkOiAnJyxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBoYXNBbmltYXRpb246IGZhbHNlLFxuICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2Vcbn07XG5jb25zdCBOVUxMX1JFTU9WRURfUVVFUklFRF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvck1vdmU6IGZhbHNlLFxuICBzZXRGb3JSZW1vdmFsOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IHRydWVcbn07XG5cbmludGVyZmFjZSBUcmlnZ2VyTGlzdGVuZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBoYXNlOiBzdHJpbmc7XG4gIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSW5zdHJ1Y3Rpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIHRyaWdnZXJOYW1lOiBzdHJpbmc7XG4gIGZyb21TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdG9TdGF0ZTogU3RhdGVWYWx1ZTtcbiAgdHJhbnNpdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnk7XG4gIHBsYXllcjogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcjtcbiAgaXNGYWxsYmFja1RyYW5zaXRpb246IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBSRU1PVkFMX0ZMQUcgPSAnX19uZ19yZW1vdmVkJztcblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50QW5pbWF0aW9uU3RhdGUge1xuICBzZXRGb3JSZW1vdmFsOiBib29sZWFuO1xuICBzZXRGb3JNb3ZlOiBib29sZWFuO1xuICBoYXNBbmltYXRpb246IGJvb2xlYW47XG4gIG5hbWVzcGFjZUlkOiBzdHJpbmc7XG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdGVWYWx1ZSB7XG4gIHB1YmxpYyB2YWx1ZTogc3RyaW5nO1xuICBwdWJsaWMgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucztcblxuICBnZXQgcGFyYW1zKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXMgYXN7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG4gIGNvbnN0cnVjdG9yKGlucHV0OiBhbnksIHB1YmxpYyBuYW1lc3BhY2VJZDogc3RyaW5nID0gJycpIHtcbiAgICBjb25zdCBpc09iaiA9IGlucHV0ICYmIGlucHV0Lmhhc093blByb3BlcnR5KCd2YWx1ZScpO1xuICAgIGNvbnN0IHZhbHVlID0gaXNPYmogPyBpbnB1dFsndmFsdWUnXSA6IGlucHV0O1xuICAgIHRoaXMudmFsdWUgPSBub3JtYWxpemVUcmlnZ2VyVmFsdWUodmFsdWUpO1xuICAgIGlmIChpc09iaikge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvcHlPYmooaW5wdXQgYXMgYW55KTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zWyd2YWx1ZSddO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyBhcyBBbmltYXRpb25PcHRpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyYW1zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucGFyYW1zID0ge307XG4gICAgfVxuICB9XG5cbiAgYWJzb3JiT3B0aW9ucyhvcHRpb25zOiBBbmltYXRpb25PcHRpb25zKSB7XG4gICAgY29uc3QgbmV3UGFyYW1zID0gb3B0aW9ucy5wYXJhbXM7XG4gICAgaWYgKG5ld1BhcmFtcykge1xuICAgICAgY29uc3Qgb2xkUGFyYW1zID0gdGhpcy5vcHRpb25zLnBhcmFtcyAhO1xuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAob2xkUGFyYW1zW3Byb3BdID09IG51bGwpIHtcbiAgICAgICAgICBvbGRQYXJhbXNbcHJvcF0gPSBuZXdQYXJhbXNbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9JRF9WQUxVRSA9ICd2b2lkJztcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NUQVRFX1ZBTFVFID0gbmV3IFN0YXRlVmFsdWUoVk9JRF9WQUxVRSk7XG5leHBvcnQgY29uc3QgREVMRVRFRF9TVEFURV9WQUxVRSA9IG5ldyBTdGF0ZVZhbHVlKCdERUxFVEVEJyk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHByaXZhdGUgX3RyaWdnZXJzOiB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuICBwcml2YXRlIF9xdWV1ZTogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfZWxlbWVudExpc3RlbmVycyA9IG5ldyBNYXA8YW55LCBUcmlnZ2VyTGlzdGVuZXJbXT4oKTtcblxuICBwcml2YXRlIF9ob3N0Q2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGhvc3RFbGVtZW50OiBhbnksIHByaXZhdGUgX2VuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSkge1xuICAgIHRoaXMuX2hvc3RDbGFzc05hbWUgPSAnbmctdG5zLScgKyBpZDtcbiAgICBhZGRDbGFzcyhob3N0RWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7XG4gIH1cblxuICBsaXN0ZW4oZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKCF0aGlzLl90cmlnZ2Vycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7XG4gICAgICAgICAgcGhhc2V9XCIgYmVjYXVzZSB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgZG9lc25cXCd0IGV4aXN0IWApO1xuICAgIH1cblxuICAgIGlmIChwaGFzZSA9PSBudWxsIHx8IHBoYXNlLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBsaXN0ZW4gb24gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtcbiAgICAgICAgICBuYW1lfVwiIGJlY2F1c2UgdGhlIHByb3ZpZGVkIGV2ZW50IGlzIHVuZGVmaW5lZCFgKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzVHJpZ2dlckV2ZW50VmFsaWQocGhhc2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBldmVudCBcIiR7cGhhc2V9XCIgZm9yIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBpcyBub3Qgc3VwcG9ydGVkIWApO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLCBlbGVtZW50LCBbXSk7XG4gICAgY29uc3QgZGF0YSA9IHtuYW1lLCBwaGFzZSwgY2FsbGJhY2t9O1xuICAgIGxpc3RlbmVycy5wdXNoKGRhdGEpO1xuXG4gICAgY29uc3QgdHJpZ2dlcnNXaXRoU3RhdGVzID0gZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQsIGVsZW1lbnQsIHt9KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyBuYW1lKTtcbiAgICAgIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXSA9IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBpcyByZW1vdmVkIEFGVEVSIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgLy8gdGhhdCBsZWF2ZSBhbmltYXRpb25zIGNhbGxiYWNrcyBjYW4gZmlyZSAob3RoZXJ3aXNlIGlmIHRoZSBub2RlXG4gICAgICAvLyBpcyByZW1vdmVkIGluIGJldHdlZW4gdGhlbiB0aGUgbGlzdGVuZXJzIHdvdWxkIGJlIGRlcmVnaXN0ZXJlZClcbiAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihkYXRhKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgICAgICBkZWxldGUgdHJpZ2dlcnNXaXRoU3RhdGVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBhc3Q6IEFuaW1hdGlvblRyaWdnZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdHJpZ2dlcnNbbmFtZV0pIHtcbiAgICAgIC8vIHRocm93XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RyaWdnZXJzW25hbWVdID0gYXN0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHJpZ2dlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG4gICAgaWYgKCF0cmlnZ2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm92aWRlZCBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBoYXMgbm90IGJlZW4gcmVnaXN0ZXJlZCFgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyaWdnZXI7XG4gIH1cblxuICB0cmlnZ2VyKGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgZGVmYXVsdFRvRmFsbGJhY2s6IGJvb2xlYW4gPSB0cnVlKTpcbiAgICAgIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJ8dW5kZWZpbmVkIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fZ2V0VHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgbGV0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICghdHJpZ2dlcnNXaXRoU3RhdGVzKSB7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LCBOR19UUklHR0VSX0NMQVNTTkFNRSArICctJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuc2V0KGVsZW1lbnQsIHRyaWdnZXJzV2l0aFN0YXRlcyA9IHt9KTtcbiAgICB9XG5cbiAgICBsZXQgZnJvbVN0YXRlID0gdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXTtcbiAgICBjb25zdCB0b1N0YXRlID0gbmV3IFN0YXRlVmFsdWUodmFsdWUsIHRoaXMuaWQpO1xuXG4gICAgY29uc3QgaXNPYmogPSB2YWx1ZSAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBpZiAoIWlzT2JqICYmIGZyb21TdGF0ZSkge1xuICAgICAgdG9TdGF0ZS5hYnNvcmJPcHRpb25zKGZyb21TdGF0ZS5vcHRpb25zKTtcbiAgICB9XG5cbiAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbdHJpZ2dlck5hbWVdID0gdG9TdGF0ZTtcblxuICAgIGlmICghZnJvbVN0YXRlKSB7XG4gICAgICBmcm9tU3RhdGUgPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH0gZWxzZSBpZiAoZnJvbVN0YXRlID09PSBERUxFVEVEX1NUQVRFX1ZBTFVFKSB7XG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH1cblxuICAgIGNvbnN0IGlzUmVtb3ZhbCA9IHRvU3RhdGUudmFsdWUgPT09IFZPSURfVkFMVUU7XG5cbiAgICAvLyBub3JtYWxseSB0aGlzIGlzbid0IHJlYWNoZWQgYnkgaGVyZSwgaG93ZXZlciwgaWYgYW4gb2JqZWN0IGV4cHJlc3Npb25cbiAgICAvLyBpcyBwYXNzZWQgaW4gdGhlbiBpdCBtYXkgYmUgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS4gQ29tcGFyaW5nIHRoZSB2YWx1ZVxuICAgIC8vIGlzIGltcG9ydGFudCBzaW5jZSB0aGF0IHdpbGwgc3RheSB0aGUgc2FtZSBkZXNwaXRlIHRoZXJlIGJlaW5nIGEgbmV3IG9iamVjdC5cbiAgICAvLyBUaGUgcmVtb3ZhbCBhcmMgaGVyZSBpcyBzcGVjaWFsIGNhc2VkIGJlY2F1c2UgdGhlIHNhbWUgZWxlbWVudCBpcyB0cmlnZ2VyZWRcbiAgICAvLyB0d2ljZSBpbiB0aGUgZXZlbnQgdGhhdCBpdCBjb250YWlucyBhbmltYXRpb25zIG9uIHRoZSBvdXRlci9pbm5lciBwb3J0aW9uc1xuICAgIC8vIG9mIHRoZSBob3N0IGNvbnRhaW5lclxuICAgIGlmICghaXNSZW1vdmFsICYmIGZyb21TdGF0ZS52YWx1ZSA9PT0gdG9TdGF0ZS52YWx1ZSkge1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGRlc3BpdGUgdGhlIHZhbHVlIG5vdCBjaGFuZ2luZywgc29tZSBpbm5lciBwYXJhbXNcbiAgICAgIC8vIGhhdmUgY2hhbmdlZCB3aGljaCBtZWFucyB0aGF0IHRoZSBhbmltYXRpb24gZmluYWwgc3R5bGVzIG5lZWQgdG8gYmUgYXBwbGllZFxuICAgICAgaWYgKCFvYmpFcXVhbHMoZnJvbVN0YXRlLnBhcmFtcywgdG9TdGF0ZS5wYXJhbXMpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICAgICAgY29uc3QgZnJvbVN0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXMoZnJvbVN0YXRlLnZhbHVlLCBmcm9tU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBjb25zdCB0b1N0eWxlcyA9IHRyaWdnZXIubWF0Y2hTdHlsZXModG9TdGF0ZS52YWx1ZSwgdG9TdGF0ZS5wYXJhbXMsIGVycm9ycyk7XG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgZnJvbVN0eWxlcyk7XG4gICAgICAgICAgICBzZXRTdHlsZXMoZWxlbWVudCwgdG9TdHlsZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyc09uRWxlbWVudDogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID1cbiAgICAgICAgZ2V0T3JTZXRBc0luTWFwKHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LCBlbGVtZW50LCBbXSk7XG4gICAgcGxheWVyc09uRWxlbWVudC5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAvLyBvbmx5IHJlbW92ZSB0aGUgcGxheWVyIGlmIGl0IGlzIHF1ZXVlZCBvbiB0aGUgRVhBQ1Qgc2FtZSB0cmlnZ2VyL25hbWVzcGFjZVxuICAgICAgLy8gd2Ugb25seSBhbHNvIGRlYWwgd2l0aCBxdWV1ZWQgcGxheWVycyBoZXJlIGJlY2F1c2UgaWYgdGhlIGFuaW1hdGlvbiBoYXNcbiAgICAgIC8vIHN0YXJ0ZWQgdGhlbiB3ZSB3YW50IHRvIGtlZXAgdGhlIHBsYXllciBhbGl2ZSB1bnRpbCB0aGUgZmx1c2ggaGFwcGVuc1xuICAgICAgLy8gKHdoaWNoIGlzIHdoZXJlIHRoZSBwcmV2aW91c1BsYXllcnMgYXJlIHBhc3NlZCBpbnRvIHRoZSBuZXcgcGFseWVyKVxuICAgICAgaWYgKHBsYXllci5uYW1lc3BhY2VJZCA9PSB0aGlzLmlkICYmIHBsYXllci50cmlnZ2VyTmFtZSA9PSB0cmlnZ2VyTmFtZSAmJiBwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgdHJhbnNpdGlvbiA9XG4gICAgICAgIHRyaWdnZXIubWF0Y2hUcmFuc2l0aW9uKGZyb21TdGF0ZS52YWx1ZSwgdG9TdGF0ZS52YWx1ZSwgZWxlbWVudCwgdG9TdGF0ZS5wYXJhbXMpO1xuICAgIGxldCBpc0ZhbGxiYWNrVHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgIGlmICghdHJhbnNpdGlvbikge1xuICAgICAgaWYgKCFkZWZhdWx0VG9GYWxsYmFjaykgcmV0dXJuO1xuICAgICAgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgaXNGYWxsYmFja1RyYW5zaXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKFxuICAgICAgICB7ZWxlbWVudCwgdHJpZ2dlck5hbWUsIHRyYW5zaXRpb24sIGZyb21TdGF0ZSwgdG9TdGF0ZSwgcGxheWVyLCBpc0ZhbGxiYWNrVHJhbnNpdGlvbn0pO1xuXG4gICAgaWYgKCFpc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgUVVFVUVEX0NMQVNTTkFNRSk7XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiB7IHJlbW92ZUNsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpOyB9KTtcbiAgICB9XG5cbiAgICBwbGF5ZXIub25Eb25lKCgpID0+IHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGxheWVycyA9IHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIHBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICBwbGF5ZXJzT25FbGVtZW50LnB1c2gocGxheWVyKTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBkZXJlZ2lzdGVyKG5hbWU6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLl90cmlnZ2Vyc1tuYW1lXTtcblxuICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZm9yRWFjaCgoc3RhdGVNYXAsIGVsZW1lbnQpID0+IHsgZGVsZXRlIHN0YXRlTWFwW25hbWVdOyB9KTtcblxuICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXJzLCBlbGVtZW50KSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLnNldChcbiAgICAgICAgICBlbGVtZW50LCBsaXN0ZW5lcnMuZmlsdGVyKGVudHJ5ID0+IHsgcmV0dXJuIGVudHJ5Lm5hbWUgIT0gbmFtZTsgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudDogYW55KSB7XG4gICAgdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5kZWxldGUoZWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudFBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMuX2VuZ2luZS5wbGF5ZXJzQnlFbGVtZW50LmRlbGV0ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyhyb290RWxlbWVudDogYW55LCBjb250ZXh0OiBhbnksIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIC8vIGVtdWxhdGUgYSBsZWF2ZSBhbmltYXRpb24gZm9yIGFsbCBpbm5lciBub2RlcyB3aXRoaW4gdGhpcyBub2RlLlxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBhbmltYXRpb25zIGZvdW5kIGZvciBhbnkgb2YgdGhlIG5vZGVzIHRoZW4gY2xlYXIgdGhlIGNhY2hlXG4gICAgLy8gZm9yIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuX2VuZ2luZS5kcml2ZXIucXVlcnkocm9vdEVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpLmZvckVhY2goZWxtID0+IHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhbiBpbm5lciByZW1vdmUoKSBvcGVyYXRpb24gaGFzIGFscmVhZHkga2lja2VkIG9mZlxuICAgICAgLy8gdGhlIGFuaW1hdGlvbiBvbiB0aGlzIGVsZW1lbnQuLi5cbiAgICAgIGlmIChlbG1bUkVNT1ZBTF9GTEFHXSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBuYW1lc3BhY2VzID0gdGhpcy5fZW5naW5lLmZldGNoTmFtZXNwYWNlc0J5RWxlbWVudChlbG0pO1xuICAgICAgaWYgKG5hbWVzcGFjZXMuc2l6ZSkge1xuICAgICAgICBuYW1lc3BhY2VzLmZvckVhY2gobnMgPT4gbnMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsbSwgY29udGV4dCwgZmFsc2UsIHRydWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRyaWdnZXJMZWF2ZUFuaW1hdGlvbihcbiAgICAgIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBkZXN0cm95QWZ0ZXJDb21wbGV0ZT86IGJvb2xlYW4sXG4gICAgICBkZWZhdWx0VG9GYWxsYmFjaz86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBjb25zdCB0cmlnZ2VyU3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHRyaWdnZXJTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXModHJpZ2dlclN0YXRlcykuZm9yRWFjaCh0cmlnZ2VyTmFtZSA9PiB7XG4gICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgaGVyZSBpbiB0aGUgZXZlbnQgdGhhdCBhbiBlbGVtZW50IGlzIHJlbW92ZWRcbiAgICAgICAgLy8gdHdpY2UgKGJvdGggb24gdGhlIGhvc3QgbGV2ZWwgYW5kIHRoZSBjb21wb25lbnQgbGV2ZWwpXG4gICAgICAgIGlmICh0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV0pIHtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLnRyaWdnZXIoZWxlbWVudCwgdHJpZ2dlck5hbWUsIFZPSURfVkFMVUUsIGRlZmF1bHRUb0ZhbGxiYWNrKTtcbiAgICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLm1hcmtFbGVtZW50QXNSZW1vdmVkKHRoaXMuaWQsIGVsZW1lbnQsIHRydWUsIGNvbnRleHQpO1xuICAgICAgICBpZiAoZGVzdHJveUFmdGVyQ29tcGxldGUpIHtcbiAgICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB0aGlzLl9lbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByZXBhcmVMZWF2ZUFuaW1hdGlvbkxpc3RlbmVycyhlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmdldChlbGVtZW50KTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBjb25zdCB2aXNpdGVkVHJpZ2dlcnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlck5hbWUgPSBsaXN0ZW5lci5uYW1lO1xuICAgICAgICBpZiAodmlzaXRlZFRyaWdnZXJzLmhhcyh0cmlnZ2VyTmFtZSkpIHJldHVybjtcbiAgICAgICAgdmlzaXRlZFRyaWdnZXJzLmFkZCh0cmlnZ2VyTmFtZSk7XG5cbiAgICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW3RyaWdnZXJOYW1lXTtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbiA9IHRyaWdnZXIuZmFsbGJhY2tUcmFuc2l0aW9uO1xuICAgICAgICBjb25zdCBlbGVtZW50U3RhdGVzID0gdGhpcy5fZW5naW5lLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgZnJvbVN0YXRlID0gZWxlbWVudFN0YXRlc1t0cmlnZ2VyTmFtZV0gfHwgREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICAgICAgY29uc3QgdG9TdGF0ZSA9IG5ldyBTdGF0ZVZhbHVlKFZPSURfVkFMVUUpO1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcih0aGlzLmlkLCB0cmlnZ2VyTmFtZSwgZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5fZW5naW5lLnRvdGFsUXVldWVkUGxheWVycysrO1xuICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIHRyaWdnZXJOYW1lLFxuICAgICAgICAgIHRyYW5zaXRpb24sXG4gICAgICAgICAgZnJvbVN0YXRlLFxuICAgICAgICAgIHRvU3RhdGUsXG4gICAgICAgICAgcGxheWVyLFxuICAgICAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlTm9kZShlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX2VuZ2luZTtcblxuICAgIGlmIChlbGVtZW50LmNoaWxkRWxlbWVudENvdW50KSB7XG4gICAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2VycyhlbGVtZW50LCBjb250ZXh0LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG1lYW5zIHRoYXQgYSAqID0+IFZPSUQgYW5pbWF0aW9uIHdhcyBkZXRlY3RlZCBhbmQga2lja2VkIG9mZlxuICAgIGlmICh0aGlzLnRyaWdnZXJMZWF2ZUFuaW1hdGlvbihlbGVtZW50LCBjb250ZXh0LCB0cnVlKSkgcmV0dXJuO1xuXG4gICAgLy8gZmluZCB0aGUgcGxheWVyIHRoYXQgaXMgYW5pbWF0aW5nIGFuZCBtYWtlIHN1cmUgdGhhdCB0aGVcbiAgICAvLyByZW1vdmFsIGlzIGRlbGF5ZWQgdW50aWwgdGhhdCBwbGF5ZXIgaGFzIGNvbXBsZXRlZFxuICAgIGxldCBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoZW5naW5lLnRvdGFsQW5pbWF0aW9ucykge1xuICAgICAgY29uc3QgY3VycmVudFBsYXllcnMgPVxuICAgICAgICAgIGVuZ2luZS5wbGF5ZXJzLmxlbmd0aCA/IGVuZ2luZS5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCkgOiBbXTtcblxuICAgICAgLy8gd2hlbiB0aGlzIGBpZiBzdGF0ZW1lbnRgIGRvZXMgbm90IGNvbnRpbnVlIGZvcndhcmQgaXQgbWVhbnMgdGhhdFxuICAgICAgLy8gYSBwcmV2aW91cyBhbmltYXRpb24gcXVlcnkgaGFzIHNlbGVjdGVkIHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kXG4gICAgICAvLyBpcyBhbmltYXRpbmcgaXQuIEluIHRoaXMgc2l0dWF0aW9uIHdhbnQgdG8gY29udGludWUgZm9yd2FyZHMgYW5kXG4gICAgICAvLyBhbGxvdyB0aGUgZWxlbWVudCB0byBiZSBxdWV1ZWQgdXAgZm9yIGFuaW1hdGlvbiBsYXRlci5cbiAgICAgIGlmIChjdXJyZW50UGxheWVycyAmJiBjdXJyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50O1xuICAgICAgICB3aGlsZSAocGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IGVuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KHBhcmVudCk7XG4gICAgICAgICAgaWYgKHRyaWdnZXJzKSB7XG4gICAgICAgICAgICBjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBzdGFnZSB3ZSBrbm93IHRoYXQgdGhlIGVsZW1lbnQgd2lsbCBlaXRoZXIgZ2V0IHJlbW92ZWRcbiAgICAvLyBkdXJpbmcgZmx1c2ggb3Igd2lsbCBiZSBwaWNrZWQgdXAgYnkgYSBwYXJlbnQgcXVlcnkuIEVpdGhlciB3YXlcbiAgICAvLyB3ZSBuZWVkIHRvIGZpcmUgdGhlIGxpc3RlbmVycyBmb3IgdGhpcyBlbGVtZW50IHdoZW4gaXQgRE9FUyBnZXRcbiAgICAvLyByZW1vdmVkIChvbmNlIHRoZSBxdWVyeSBwYXJlbnQgYW5pbWF0aW9uIGlzIGRvbmUgb3IgYWZ0ZXIgZmx1c2gpXG4gICAgdGhpcy5wcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudCk7XG5cbiAgICAvLyB3aGV0aGVyIG9yIG5vdCBhIHBhcmVudCBoYXMgYW4gYW5pbWF0aW9uIHdlIG5lZWQgdG8gZGVsYXkgdGhlIGRlZmVycmFsIG9mIHRoZSBsZWF2ZVxuICAgIC8vIG9wZXJhdGlvbiB1bnRpbCB3ZSBoYXZlIG1vcmUgaW5mb3JtYXRpb24gKHdoaWNoIHdlIGRvIGFmdGVyIGZsdXNoKCkgaGFzIGJlZW4gY2FsbGVkKVxuICAgIGlmIChjb250YWluc1BvdGVudGlhbFBhcmVudFRyYW5zaXRpb24pIHtcbiAgICAgIGVuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlIGRvIHRoaXMgYWZ0ZXIgdGhlIGZsdXNoIGhhcyBvY2N1cnJlZCBzdWNoXG4gICAgICAvLyB0aGF0IHRoZSBjYWxsYmFja3MgY2FuIGJlIGZpcmVkXG4gICAgICBlbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB0aGlzLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpKTtcbiAgICAgIGVuZ2luZS5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgZW5naW5lLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBpbnNlcnROb2RlKGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnkpOiB2b2lkIHsgYWRkQ2xhc3MoZWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7IH1cblxuICBkcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkOiBudW1iZXIpOiBRdWV1ZUluc3RydWN0aW9uW10ge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG4gICAgdGhpcy5fcXVldWUuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICBpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXI6IFRyaWdnZXJMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgIGlmIChsaXN0ZW5lci5uYW1lID09IGVudHJ5LnRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlRXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICAgICAgICAgICAgZWxlbWVudCwgZW50cnkudHJpZ2dlck5hbWUsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAoYmFzZUV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBtaWNyb3Rhc2tJZDtcbiAgICAgICAgICAgIGxpc3Rlbk9uUGxheWVyKGVudHJ5LnBsYXllciwgbGlzdGVuZXIucGhhc2UsIGJhc2VFdmVudCwgbGlzdGVuZXIuY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXIubWFya2VkRm9yRGVzdHJveSkge1xuICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgLy8gbm93IHdlIGNhbiBkZXN0cm95IHRoZSBlbGVtZW50IHByb3Blcmx5IHNpbmNlIHRoZSBldmVudCBsaXN0ZW5lcnMgaGF2ZVxuICAgICAgICAgIC8vIGJlZW4gYm91bmQgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVldWUgPSBbXTtcblxuICAgIHJldHVybiBpbnN0cnVjdGlvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8gaWYgZGVwQ291bnQgPT0gMCB0aGVtIG1vdmUgdG8gZnJvbnRcbiAgICAgIC8vIG90aGVyd2lzZSBpZiBhIGNvbnRhaW5zIGIgdGhlbiBtb3ZlIGJhY2tcbiAgICAgIGNvbnN0IGQwID0gYS50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGNvbnN0IGQxID0gYi50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGlmIChkMCA9PSAwIHx8IGQxID09IDApIHtcbiAgICAgICAgcmV0dXJuIGQwIC0gZDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZW5naW5lLmRyaXZlci5jb250YWluc0VsZW1lbnQoYS5lbGVtZW50LCBiLmVsZW1lbnQpID8gMSA6IC0xO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveShjb250ZXh0OiBhbnkpIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHAuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyh0aGlzLmhvc3RFbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBjb250YWluc0RhdGEgPVxuICAgICAgICAodGhpcy5fcXVldWUuZmluZChlbnRyeSA9PiBlbnRyeS5lbGVtZW50ID09PSBlbGVtZW50KSA/IHRydWUgOiBmYWxzZSkgfHwgY29udGFpbnNEYXRhO1xuICAgIHJldHVybiBjb250YWluc0RhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZWRUcmFuc2l0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uO1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBwdWJsaWMgbmV3SG9zdEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHBsYXllcnNCeVF1ZXJpZWRFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHN0YXRlc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBTdGF0ZVZhbHVlfT4oKTtcbiAgcHVibGljIGRpc2FibGVkTm9kZXMgPSBuZXcgU2V0PGFueT4oKTtcblxuICBwdWJsaWMgdG90YWxBbmltYXRpb25zID0gMDtcbiAgcHVibGljIHRvdGFsUXVldWVkUGxheWVycyA9IDA7XG5cbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTG9va3VwOiB7W2lkOiBzdHJpbmddOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlfSA9IHt9O1xuICBwcml2YXRlIF9uYW1lc3BhY2VMaXN0OiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmx1c2hGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHJpdmF0ZSBfd2hlblF1aWV0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG5cbiAgcHVibGljIG5hbWVzcGFjZXNCeUhvc3RFbGVtZW50ID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBjb2xsZWN0ZWRFbnRlckVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuICBwdWJsaWMgY29sbGVjdGVkTGVhdmVFbGVtZW50czogYW55W10gPSBbXTtcblxuICAvLyB0aGlzIG1ldGhvZCBpcyBkZXNpZ25lZCB0byBiZSBvdmVycmlkZGVuIGJ5IHRoZSBjb2RlIHRoYXQgdXNlcyB0aGlzIGVuZ2luZVxuICBwdWJsaWMgb25SZW1vdmFsQ29tcGxldGUgPSAoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpID0+IHt9O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSB7IHRoaXMub25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7IH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHByaXZhdGUgX25vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcikge31cblxuICBnZXQgcXVldWVkUGxheWVycygpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIHRoaXMuX25hbWVzcGFjZUxpc3QuZm9yRWFjaChucyA9PiB7XG4gICAgICBucy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYXllcnM7XG4gIH1cblxuICBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IG5zID0gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2UobmFtZXNwYWNlSWQsIGhvc3RFbGVtZW50LCB0aGlzKTtcbiAgICBpZiAoaG9zdEVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGhvc3RFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVmZXIgdGhpcyBsYXRlciB1bnRpbCBmbHVzaCBkdXJpbmcgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGhhc1xuICAgICAgLy8gYmVlbiBpbnNlcnRlZCBzbyB0aGF0IHdlIGtub3cgZXhhY3RseSB3aGVyZSB0byBwbGFjZSBpdCBpblxuICAgICAgLy8gdGhlIG5hbWVzcGFjZSBsaXN0XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcblxuICAgICAgLy8gZ2l2ZW4gdGhhdCB0aGlzIGhvc3QgZWxlbWVudCBpcyBhcGFydCBvZiB0aGUgYW5pbWF0aW9uIGNvZGUsIGl0XG4gICAgICAvLyBtYXkgb3IgbWF5IG5vdCBiZSBpbnNlcnRlZCBieSBhIHBhcmVudCBub2RlIHRoYXQgaXMgYW4gb2YgYW5cbiAgICAgIC8vIGFuaW1hdGlvbiByZW5kZXJlciB0eXBlLiBJZiB0aGlzIGhhcHBlbnMgdGhlbiB3ZSBjYW4gc3RpbGwgaGF2ZVxuICAgICAgLy8gYWNjZXNzIHRvIHRoaXMgaXRlbSB3aGVuIHdlIHF1ZXJ5IGZvciA6ZW50ZXIgbm9kZXMuIElmIHRoZSBwYXJlbnRcbiAgICAgIC8vIGlzIGEgcmVuZGVyZXIgdGhlbiB0aGUgc2V0IGRhdGEtc3RydWN0dXJlIHdpbGwgbm9ybWFsaXplIHRoZSBlbnRyeVxuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGhvc3RFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF0gPSBucztcbiAgfVxuXG4gIHByaXZhdGUgX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7XG4gICAgaWYgKGxpbWl0ID49IDApIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaSA9IGxpbWl0OyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBuZXh0TmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlTGlzdFtpXTtcbiAgICAgICAgaWYgKHRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChuZXh0TmFtZXNwYWNlLmhvc3RFbGVtZW50LCBob3N0RWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZShpICsgMSwgMCwgbnMpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnNwbGljZSgwLCAwLCBucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3QucHVzaChucyk7XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lc3BhY2VzQnlIb3N0RWxlbWVudC5zZXQoaG9zdEVsZW1lbnQsIG5zKTtcbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBob3N0RWxlbWVudDogYW55KSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAoIW5zKSB7XG4gICAgICBucyA9IHRoaXMuY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBucztcbiAgfVxuXG4gIHJlZ2lzdGVyVHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHRyaWdnZXI6IEFuaW1hdGlvblRyaWdnZXIpIHtcbiAgICBsZXQgbnMgPSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgIGlmIChucyAmJiBucy5yZWdpc3RlcihuYW1lLCB0cmlnZ2VyKSkge1xuICAgICAgdGhpcy50b3RhbEFuaW1hdGlvbnMrKztcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIGlmICghbmFtZXNwYWNlSWQpIHJldHVybjtcblxuICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZGVsZXRlKG5zLmhvc3RFbGVtZW50KTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9uYW1lc3BhY2VMaXN0LmluZGV4T2YobnMpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoKCkgPT4gbnMuZGVzdHJveShjb250ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIF9mZXRjaE5hbWVzcGFjZShpZDogc3RyaW5nKSB7IHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbaWRdOyB9XG5cbiAgZmV0Y2hOYW1lc3BhY2VzQnlFbGVtZW50KGVsZW1lbnQ6IGFueSk6IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPiB7XG4gICAgLy8gbm9ybWFsbHkgdGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIG5hbWVzcGFjZSBwZXIgZWxlbWVudCwgaG93ZXZlclxuICAgIC8vIGlmIEB0cmlnZ2VycyBhcmUgcGxhY2VkIG9uIGJvdGggdGhlIGNvbXBvbmVudCBlbGVtZW50IGFuZCB0aGVuXG4gICAgLy8gaXRzIGhvc3QgZWxlbWVudCAod2l0aGluIHRoZSBjb21wb25lbnQgY29kZSkgdGhlbiB0aGVyZSB3aWxsIGJlXG4gICAgLy8gdHdvIG5hbWVzcGFjZXMgcmV0dXJuZWQuIFdlIHVzZSBhIHNldCBoZXJlIHRvIHNpbXBseSB0aGUgZGVkdXBlXG4gICAgLy8gb2YgbmFtZXNwYWNlcyBpbmNhc2UgdGhlcmUgYXJlIG11bHRpcGxlIHRyaWdnZXJzIGJvdGggdGhlIGVsbSBhbmQgaG9zdFxuICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgU2V0PEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudFN0YXRlcykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGVsZW1lbnRTdGF0ZXMpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5zSWQgPSBlbGVtZW50U3RhdGVzW2tleXNbaV1dLm5hbWVzcGFjZUlkO1xuICAgICAgICBpZiAobnNJZCkge1xuICAgICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobnNJZCk7XG4gICAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgICBuYW1lc3BhY2VzLmFkZChucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuYW1lc3BhY2VzO1xuICB9XG5cbiAgdHJpZ2dlcihuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkudHJpZ2dlcihlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaW5zZXJ0Tm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIWlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHJldHVybjtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYW5kIHJlaW5zZXJ0ZWQgKG1vdmUgb3BlcmF0aW9uKVxuICAgIC8vIHdoZW4gdGhpcyBvY2N1cnMgd2UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBlbGVtZW50IGZvciBkZWxldGlvbiBsYXRlclxuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgZGV0YWlscy5zZXRGb3JSZW1vdmFsID0gZmFsc2U7XG4gICAgICBkZXRhaWxzLnNldEZvck1vdmUgPSB0cnVlO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMuaW5kZXhPZihlbGVtZW50KTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBuYW1lc3BhY2VJZCBpcyBibGFuayB0aGVuIHRoZSBjYWxsZXJcbiAgICAvLyBjb2RlIGRvZXMgbm90IGNvbnRhaW4gYW55IGFuaW1hdGlvbiBjb2RlIGluIGl0LCBidXQgaXQgaXNcbiAgICAvLyBqdXN0IGJlaW5nIGNhbGxlZCBzbyB0aGF0IHRoZSBub2RlIGlzIG1hcmtlZCBhcyBiZWluZyBpbnNlcnRlZFxuICAgIGlmIChuYW1lc3BhY2VJZCkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICAvLyBUaGlzIGlmLXN0YXRlbWVudCBpcyBhIHdvcmthcm91bmQgZm9yIHJvdXRlciBpc3N1ZSAjMjE5NDcuXG4gICAgICAvLyBUaGUgcm91dGVyIHNvbWV0aW1lcyBoaXRzIGEgcmFjZSBjb25kaXRpb24gd2hlcmUgd2hpbGUgYSByb3V0ZVxuICAgICAgLy8gaXMgYmVpbmcgaW5zdGFudGlhdGVkIGEgbmV3IG5hdmlnYXRpb24gYXJyaXZlcywgdHJpZ2dlcmluZyBsZWF2ZVxuICAgICAgLy8gYW5pbWF0aW9uIG9mIERPTSB0aGF0IGhhcyBub3QgYmVlbiBmdWxseSBpbml0aWFsaXplZCwgdW50aWwgdGhpc1xuICAgICAgLy8gaXMgcmVzb2x2ZWQsIHdlIG5lZWQgdG8gaGFuZGxlIHRoZSBzY2VuYXJpbyB3aGVuIERPTSBpcyBub3QgaW4gYVxuICAgICAgLy8gY29uc2lzdGVudCBzdGF0ZSBkdXJpbmcgdGhlIGFuaW1hdGlvbi5cbiAgICAgIGlmIChucykge1xuICAgICAgICBucy5pbnNlcnROb2RlKGVsZW1lbnQsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gb25seSAqZGlyZWN0aXZlcyBhbmQgaG9zdCBlbGVtZW50cyBhcmUgaW5zZXJ0ZWQgYmVmb3JlXG4gICAgaWYgKGluc2VydEJlZm9yZSkge1xuICAgICAgdGhpcy5jb2xsZWN0RW50ZXJFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudDogYW55KSB7IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5wdXNoKGVsZW1lbnQpOyB9XG5cbiAgbWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQ6IGFueSwgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICB0aGlzLmRpc2FibGVkTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBESVNBQkxFRF9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5kaXNhYmxlZE5vZGVzLmhhcyhlbGVtZW50KSkge1xuICAgICAgdGhpcy5kaXNhYmxlZE5vZGVzLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlTm9kZShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbnMgPSBuYW1lc3BhY2VJZCA/IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKSA6IG51bGw7XG4gICAgaWYgKG5zKSB7XG4gICAgICBucy5yZW1vdmVOb2RlKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgbWFya0VsZW1lbnRBc1JlbW92ZWQobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBoYXNBbmltYXRpb24/OiBib29sZWFuLCBjb250ZXh0PzogYW55KSB7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0ge1xuICAgICAgbmFtZXNwYWNlSWQsXG4gICAgICBzZXRGb3JSZW1vdmFsOiBjb250ZXh0LCBoYXNBbmltYXRpb24sXG4gICAgICByZW1vdmVkQmVmb3JlUXVlcmllZDogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgbGlzdGVuKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHBoYXNlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmIChpc0VsZW1lbnROb2RlKGVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmxpc3RlbihlbGVtZW50LCBuYW1lLCBwaGFzZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge307XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEluc3RydWN0aW9uKFxuICAgICAgZW50cnk6IFF1ZXVlSW5zdHJ1Y3Rpb24sIHN1YlRpbWVsaW5lczogRWxlbWVudEluc3RydWN0aW9uTWFwLCBlbnRlckNsYXNzTmFtZTogc3RyaW5nLFxuICAgICAgbGVhdmVDbGFzc05hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBlbnRyeS50cmFuc2l0aW9uLmJ1aWxkKFxuICAgICAgICB0aGlzLmRyaXZlciwgZW50cnkuZWxlbWVudCwgZW50cnkuZnJvbVN0YXRlLnZhbHVlLCBlbnRyeS50b1N0YXRlLnZhbHVlLCBlbnRlckNsYXNzTmFtZSxcbiAgICAgICAgbGVhdmVDbGFzc05hbWUsIGVudHJ5LmZyb21TdGF0ZS5vcHRpb25zLCBlbnRyeS50b1N0YXRlLm9wdGlvbnMsIHN1YlRpbWVsaW5lcyk7XG4gIH1cblxuICBkZXN0cm95SW5uZXJBbmltYXRpb25zKGNvbnRhaW5lckVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIHRydWUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB0aGlzLmRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50KSk7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5zaXplID09IDApIHJldHVybjtcblxuICAgIGVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoY29udGFpbmVyRWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5maW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQpKTtcbiAgfVxuXG4gIGRlc3Ryb3lBY3RpdmVBbmltYXRpb25zRm9yRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIHNldCBmb3IgZGVzdHJ1Y3Rpb24sIGJ1dCBoYXNuJ3Qgc3RhcnRlZC5cbiAgICAgICAgLy8gaW4gdGhpcyBzaXR1YXRpb24gd2Ugd2FudCB0byBkZWxheSB0aGUgZGVzdHJ1Y3Rpb24gdW50aWwgdGhlIGZsdXNoIG9jY3Vyc1xuICAgICAgICAvLyBzbyB0aGF0IGFueSBldmVudCBsaXN0ZW5lcnMgYXR0YWNoZWQgdG8gdGhlIHBsYXllciBhcmUgdHJpZ2dlcmVkLlxuICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkge1xuICAgICAgICAgIHBsYXllci5tYXJrZWRGb3JEZXN0cm95ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3Qgc3RhdGVNYXAgPSB0aGlzLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHN0YXRlTWFwKSB7XG4gICAgICBPYmplY3Qua2V5cyhzdGF0ZU1hcCkuZm9yRWFjaCh0cmlnZ2VyTmFtZSA9PiBzdGF0ZU1hcFt0cmlnZ2VyTmFtZV0gPSBERUxFVEVEX1NUQVRFX1ZBTFVFKTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBY3RpdmVRdWVyaWVkQW5pbWF0aW9uT25FbGVtZW50KGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAocGxheWVycykge1xuICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZmluaXNoKCkpO1xuICAgIH1cbiAgfVxuXG4gIHdoZW5SZW5kZXJpbmdEb25lKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9wdGltaXplR3JvdXBQbGF5ZXIodGhpcy5wbGF5ZXJzKS5vbkRvbmUoKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICAvLyB0aGlzIHdpbGwgcHJldmVudCBpdCBmcm9tIHJlbW92aW5nIGl0IHR3aWNlXG4gICAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSBOVUxMX1JFTU9WQUxfU1RBVEU7XG4gICAgICBpZiAoZGV0YWlscy5uYW1lc3BhY2VJZCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3lJbm5lckFuaW1hdGlvbnMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IG5zID0gdGhpcy5fZmV0Y2hOYW1lc3BhY2UoZGV0YWlscy5uYW1lc3BhY2VJZCk7XG4gICAgICAgIGlmIChucykge1xuICAgICAgICAgIG5zLmNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBkZXRhaWxzLnNldEZvclJlbW92YWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRyaXZlci5tYXRjaGVzRWxlbWVudChlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUikpIHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBESVNBQkxFRF9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIHRoaXMubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZsdXNoKG1pY3JvdGFza0lkOiBudW1iZXIgPSAtMSkge1xuICAgIGxldCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmICh0aGlzLm5ld0hvc3RFbGVtZW50cy5zaXplKSB7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5mb3JFYWNoKChucywgZWxlbWVudCkgPT4gdGhpcy5fYmFsYW5jZU5hbWVzcGFjZUxpc3QobnMsIGVsZW1lbnQpKTtcbiAgICAgIHRoaXMubmV3SG9zdEVsZW1lbnRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudG90YWxBbmltYXRpb25zICYmIHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsbSA9IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50c1tpXTtcbiAgICAgICAgYWRkQ2xhc3MoZWxtLCBTVEFSX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25hbWVzcGFjZUxpc3QubGVuZ3RoICYmXG4gICAgICAgICh0aGlzLnRvdGFsUXVldWVkUGxheWVycyB8fCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoKSkge1xuICAgICAgY29uc3QgY2xlYW51cEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGxheWVycyA9IHRoaXMuX2ZsdXNoQW5pbWF0aW9ucyhjbGVhbnVwRm5zLCBtaWNyb3Rhc2tJZCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsZWFudXBGbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjbGVhbnVwRm5zW2ldKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50c1tpXTtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudG90YWxRdWV1ZWRQbGF5ZXJzID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9mbHVzaEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX2ZsdXNoRm5zID0gW107XG5cbiAgICBpZiAodGhpcy5fd2hlblF1aWV0Rm5zLmxlbmd0aCkge1xuICAgICAgLy8gd2UgbW92ZSB0aGVzZSBvdmVyIHRvIGEgdmFyaWFibGUgc28gdGhhdFxuICAgICAgLy8gaWYgYW55IG5ldyBjYWxsYmFja3MgYXJlIHJlZ2lzdGVyZWQgaW4gYW5vdGhlclxuICAgICAgLy8gZmx1c2ggdGhleSBkbyBub3QgcG9wdWxhdGUgdGhlIGV4aXN0aW5nIHNldFxuICAgICAgY29uc3QgcXVpZXRGbnMgPSB0aGlzLl93aGVuUXVpZXRGbnM7XG4gICAgICB0aGlzLl93aGVuUXVpZXRGbnMgPSBbXTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IHsgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTsgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWlldEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcG9ydEVycm9yKGVycm9yczogc3RyaW5nW10pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gcHJvY2VzcyBhbmltYXRpb25zIGR1ZSB0byB0aGUgZm9sbG93aW5nIGZhaWxlZCB0cmlnZ2VyIHRyYW5zaXRpb25zXFxuICR7XG4gICAgICAgICAgICBlcnJvcnMuam9pbignXFxuJyl9YCk7XG4gIH1cblxuICBwcml2YXRlIF9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZuczogRnVuY3Rpb25bXSwgbWljcm90YXNrSWQ6IG51bWJlcik6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGNvbnN0IHN1YlRpbWVsaW5lcyA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcbiAgICBjb25zdCBza2lwcGVkUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnNNYXAgPSBuZXcgTWFwPGFueSwgQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgY29uc3QgcXVldWVkSW5zdHJ1Y3Rpb25zOiBRdWV1ZWRUcmFuc2l0aW9uW10gPSBbXTtcbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IGFsbFByZVN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG4gICAgY29uc3QgYWxsUG9zdFN0eWxlRWxlbWVudHMgPSBuZXcgTWFwPGFueSwgU2V0PHN0cmluZz4+KCk7XG5cbiAgICBjb25zdCBkaXNhYmxlZEVsZW1lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gICAgdGhpcy5kaXNhYmxlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBkaXNhYmxlZEVsZW1lbnRzU2V0LmFkZChub2RlKTtcbiAgICAgIGNvbnN0IG5vZGVzVGhhdEFyZURpc2FibGVkID0gdGhpcy5kcml2ZXIucXVlcnkobm9kZSwgUVVFVUVEX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUaGF0QXJlRGlzYWJsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZXNUaGF0QXJlRGlzYWJsZWRbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgYm9keU5vZGUgPSBnZXRCb2R5Tm9kZSgpO1xuICAgIGNvbnN0IGFsbFRyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5zdGF0ZXNCeUVsZW1lbnQua2V5cygpKTtcbiAgICBjb25zdCBlbnRlck5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMpO1xuXG4gICAgLy8gdGhpcyBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBidWlsdCBiZWxvdyBzdWNoIHRoYXRcbiAgICAvLyB0aGUgOmVudGVyIHF1ZXJpZXMgbWF0Y2ggdGhlIGVsZW1lbnRzIChzaW5jZSB0aGUgdGltZWxpbmUgcXVlcmllc1xuICAgIC8vIGFyZSBmaXJlZCBkdXJpbmcgaW5zdHJ1Y3Rpb24gYnVpbGRpbmcpLlxuICAgIGNvbnN0IGVudGVyTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gRU5URVJfQ0xBU1NOQU1FICsgaSsrO1xuICAgICAgZW50ZXJOb2RlTWFwSWRzLnNldChyb290LCBjbGFzc05hbWUpO1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IGFkZENsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgYWxsTGVhdmVOb2RlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBtZXJnZWRMZWF2ZU5vZGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zID0gbmV3IFNldDxhbnk+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgICBhbGxMZWF2ZU5vZGVzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIG1lcmdlZExlYXZlTm9kZXMuYWRkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoZGV0YWlscy5oYXNBbmltYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmRyaXZlci5xdWVyeShlbGVtZW50LCBTVEFSX1NFTEVDVE9SLCB0cnVlKS5mb3JFYWNoKGVsbSA9PiBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbG0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMuYWRkKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGVhdmVOb2RlTWFwSWRzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICBjb25zdCBsZWF2ZU5vZGVNYXAgPSBidWlsZFJvb3RNYXAoYWxsVHJpZ2dlckVsZW1lbnRzLCBBcnJheS5mcm9tKG1lcmdlZExlYXZlTm9kZXMpKTtcbiAgICBsZWF2ZU5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IExFQVZFX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGxlYXZlTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNsZWFudXBGbnMucHVzaCgoKSA9PiB7XG4gICAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChyb290KSAhO1xuICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gcmVtb3ZlQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgICB9KTtcblxuICAgICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGxlYXZlTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbExlYXZlTm9kZXMuZm9yRWFjaChlbGVtZW50ID0+IHsgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpOyB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGVycm9uZW91c1RyYW5zaXRpb25zOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICBucy5kcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkKS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gZW50cnkucGxheWVyO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgICAgYWxsUGxheWVycy5wdXNoKHBsYXllcik7XG5cbiAgICAgICAgaWYgKHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBkZXRhaWxzID0gZWxlbWVudFtSRU1PVkFMX0ZMQUddIGFzIEVsZW1lbnRBbmltYXRpb25TdGF0ZTtcbiAgICAgICAgICAvLyBtb3ZlIGFuaW1hdGlvbnMgYXJlIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLi4uXG4gICAgICAgICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JNb3ZlKSB7XG4gICAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYm9keU5vZGUgfHwgIXRoaXMuZHJpdmVyLmNvbnRhaW5zRWxlbWVudChib2R5Tm9kZSwgZWxlbWVudCkpIHtcbiAgICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlYXZlQ2xhc3NOYW1lID0gbGVhdmVOb2RlTWFwSWRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBlbnRlckNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPVxuICAgICAgICAgICAgdGhpcy5fYnVpbGRJbnN0cnVjdGlvbihlbnRyeSwgc3ViVGltZWxpbmVzLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUpICE7XG4gICAgICAgIGlmIChpbnN0cnVjdGlvbi5lcnJvcnMgJiYgaW5zdHJ1Y3Rpb24uZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLnB1c2goaW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgdW5tYXRjaGVkIHRyYW5zaXRpb24gaXMgcXVldWVkIHRvIGdvIHRoZW4gaXQgU0hPVUxEIE5PVCByZW5kZXJcbiAgICAgICAgLy8gYW4gYW5pbWF0aW9uIGFuZCBjYW5jZWwgdGhlIHByZXZpb3VzbHkgcnVubmluZyBhbmltYXRpb25zLlxuICAgICAgICBpZiAoZW50cnkuaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGlmIGEgcGFyZW50IGFuaW1hdGlvbiB1c2VzIHRoaXMgYW5pbWF0aW9uIGFzIGEgc3ViIHRyaWdnZXJcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGluc3RydWN0IHRoZSB0aW1lbGluZSBidWlsZGVyIHRvIG5vdCBhZGQgYSBwbGF5ZXIgZGVsYXksIGJ1dFxuICAgICAgICAvLyBpbnN0ZWFkIHN0cmV0Y2ggdGhlIGZpcnN0IGtleWZyYW1lIGdhcCB1cCB1bnRpbCB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gVGhlXG4gICAgICAgIC8vIHJlYXNvbiB0aGlzIGlzIGltcG9ydGFudCBpcyB0byBwcmV2ZW50IGV4dHJhIGluaXRpYWxpemF0aW9uIHN0eWxlcyBmcm9tIGJlaW5nXG4gICAgICAgIC8vIHJlcXVpcmVkIGJ5IHRoZSB1c2VyIGluIHRoZSBhbmltYXRpb24uXG4gICAgICAgIGluc3RydWN0aW9uLnRpbWVsaW5lcy5mb3JFYWNoKHRsID0+IHRsLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lID0gdHJ1ZSk7XG5cbiAgICAgICAgc3ViVGltZWxpbmVzLmFwcGVuZChlbGVtZW50LCBpbnN0cnVjdGlvbi50aW1lbGluZXMpO1xuXG4gICAgICAgIGNvbnN0IHR1cGxlID0ge2luc3RydWN0aW9uLCBwbGF5ZXIsIGVsZW1lbnR9O1xuXG4gICAgICAgIHF1ZXVlZEluc3RydWN0aW9ucy5wdXNoKHR1cGxlKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5xdWVyaWVkRWxlbWVudHMuZm9yRWFjaChcbiAgICAgICAgICAgIGVsZW1lbnQgPT4gZ2V0T3JTZXRBc0luTWFwKHF1ZXJpZWRFbGVtZW50cywgZWxlbWVudCwgW10pLnB1c2gocGxheWVyKSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgaWYgKHByb3BzLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgc2V0VmFsID0gbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5zdHJ1Y3Rpb24ucG9zdFN0eWxlUHJvcHMuZm9yRWFjaCgoc3RyaW5nTWFwLCBlbGVtZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHJpbmdNYXApO1xuICAgICAgICAgIGxldCBzZXRWYWw6IFNldDxzdHJpbmc+ID0gYWxsUG9zdFN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgICAgaWYgKCFzZXRWYWwpIHtcbiAgICAgICAgICAgIGFsbFBvc3RTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBzZXRWYWwuYWRkKHByb3ApKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb25lb3VzVHJhbnNpdGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgZXJyb3JzLnB1c2goYEAke2luc3RydWN0aW9uLnRyaWdnZXJOYW1lfSBoYXMgZmFpbGVkIGR1ZSB0bzpcXG5gKTtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uZXJyb3JzICEuZm9yRWFjaChlcnJvciA9PiBlcnJvcnMucHVzaChgLSAke2Vycm9yfVxcbmApKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbFByZXZpb3VzUGxheWVyc01hcCA9IG5ldyBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KCk7XG4gICAgLy8gdGhpcyBtYXAgd29ya3MgdG8gdGVsbCB3aGljaCBlbGVtZW50IGluIHRoZSBET00gdHJlZSBpcyBjb250YWluZWQgYnlcbiAgICAvLyB3aGljaCBhbmltYXRpb24uIEZ1cnRoZXIgZG93biBiZWxvdyB0aGlzIG1hcCB3aWxsIGdldCBwb3B1bGF0ZWQgb25jZVxuICAgIC8vIHRoZSBwbGF5ZXJzIGFyZSBidWlsdCBhbmQgaW4gZG9pbmcgc28gaXQgY2FuIGVmZmljaWVudGx5IGZpZ3VyZSBvdXRcbiAgICAvLyBpZiBhIHN1YiBwbGF5ZXIgaXMgc2tpcHBlZCBkdWUgdG8gYSBwYXJlbnQgcGxheWVyIGhhdmluZyBwcmlvcml0eS5cbiAgICBjb25zdCBhbmltYXRpb25FbGVtZW50TWFwID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICBxdWV1ZWRJbnN0cnVjdGlvbnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGFuaW1hdGlvbkVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9iZWZvcmVBbmltYXRpb25CdWlsZChcbiAgICAgICAgICAgIGVudHJ5LnBsYXllci5uYW1lc3BhY2VJZCwgZW50cnkuaW5zdHJ1Y3Rpb24sIGFsbFByZXZpb3VzUGxheWVyc01hcCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBza2lwcGVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gcGxheWVyLmVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmV2aW91c1BsYXllcnMgPVxuICAgICAgICAgIHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhlbGVtZW50LCBmYWxzZSwgcGxheWVyLm5hbWVzcGFjZUlkLCBwbGF5ZXIudHJpZ2dlck5hbWUsIG51bGwpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocHJldlBsYXllciA9PiB7XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKS5wdXNoKHByZXZQbGF5ZXIpO1xuICAgICAgICBwcmV2UGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igbm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQgKGVpdGhlciBieSlcbiAgICAvLyBoYXZpbmcgdGhlaXIgb3duIGxlYXZlIGFuaW1hdGlvbnMgb3IgYnkgYmVpbmcgcXVlcmllZCBpbiBhIGNvbnRhaW5lclxuICAgIC8vIHRoYXQgd2lsbCBiZSByZW1vdmVkIG9uY2UgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLiBUaGUgaWRlYVxuICAgIC8vIGhlcmUgaXMgdGhhdCAqIHN0eWxlcyBtdXN0IGJlIGlkZW50aWNhbCB0byAhIHN0eWxlcyBiZWNhdXNlIG9mXG4gICAgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKCogaXMgYWxzbyBmaWxsZWQgaW4gYnkgZGVmYXVsdCBpbiBtYW55IHBsYWNlcykuXG4gICAgLy8gT3RoZXJ3aXNlICogc3R5bGVzIHdpbGwgcmV0dXJuIGFuIGVtcHR5IHZhbHVlIG9yIGF1dG8gc2luY2UgdGhlIGVsZW1lbnRcbiAgICAvLyB0aGF0IGlzIGJlaW5nIGdldENvbXB1dGVkU3R5bGUnZCB3aWxsIG5vdCBiZSB2aXNpYmxlIChzaW5jZSAqID0gZGVzdGluYXRpb24pXG4gICAgY29uc3QgcmVwbGFjZU5vZGVzID0gYWxsTGVhdmVOb2Rlcy5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cyk7XG4gICAgfSk7XG5cbiAgICAvLyBQT1NUIFNUQUdFOiBmaWxsIHRoZSAqIHN0eWxlc1xuICAgIGNvbnN0IHBvc3RTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgY29uc3QgYWxsTGVhdmVRdWVyaWVkTm9kZXMgPSBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgIHBvc3RTdHlsZXNNYXAsIHRoaXMuZHJpdmVyLCBsZWF2ZU5vZGVzV2l0aG91dEFuaW1hdGlvbnMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzLCBBVVRPX1NUWUxFKTtcblxuICAgIGFsbExlYXZlUXVlcmllZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBpZiAocmVwbGFjZVBvc3RTdHlsZXNBc1ByZShub2RlLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBhbGxQb3N0U3R5bGVFbGVtZW50cykpIHtcbiAgICAgICAgcmVwbGFjZU5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQUkUgU1RBR0U6IGZpbGwgdGhlICEgc3R5bGVzXG4gICAgY29uc3QgcHJlU3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIGVudGVyTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgY2xvYWtBbmRDb21wdXRlU3R5bGVzKFxuICAgICAgICAgIHByZVN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIG5ldyBTZXQobm9kZXMpLCBhbGxQcmVTdHlsZUVsZW1lbnRzLCBQUkVfU1RZTEUpO1xuICAgIH0pO1xuXG4gICAgcmVwbGFjZU5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBjb25zdCBwb3N0ID0gcG9zdFN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBjb25zdCBwcmUgPSBwcmVTdHlsZXNNYXAuZ2V0KG5vZGUpO1xuICAgICAgcG9zdFN0eWxlc01hcC5zZXQobm9kZSwgeyAuLi5wb3N0LCAuLi5wcmUgfSBhcyBhbnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9vdFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHN1YlBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCA9IHt9O1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IHtlbGVtZW50LCBwbGF5ZXIsIGluc3RydWN0aW9ufSA9IGVudHJ5O1xuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGl0IHdhcyBuZXZlciBjb25zdW1lZCBieSBhIHBhcmVudCBhbmltYXRpb24gd2hpY2hcbiAgICAgIC8vIG1lYW5zIHRoYXQgaXQgaXMgaW5kZXBlbmRlbnQgYW5kIHRoZXJlZm9yZSBzaG91bGQgYmUgc2V0IGZvciBhbmltYXRpb25cbiAgICAgIGlmIChzdWJUaW1lbGluZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIGlmIChkaXNhYmxlZEVsZW1lbnRzU2V0LmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICBwbGF5ZXIub3ZlcnJpZGVUb3RhbFRpbWUoaW5zdHJ1Y3Rpb24udG90YWxUaW1lKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGZsb3cgdXAgdGhlIERPTSBhbmQgcXVlcnkgdGhlIG1hcCB0byBmaWd1cmUgb3V0XG4gICAgICAgIC8vIGlmIGEgcGFyZW50IGFuaW1hdGlvbiBoYXMgcHJpb3JpdHkgb3ZlciBpdC4gSW4gdGhlIHNpdHVhdGlvblxuICAgICAgICAvLyB0aGF0IGEgcGFyZW50IGlzIGRldGVjdGVkIHRoZW4gaXQgd2lsbCBjYW5jZWwgdGhlIGxvb3AuIElmXG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZGV0ZWN0ZWQsIG9yIGl0IHRha2VzIGEgZmV3IGhvcHMgdG8gZmluZCBhIHBhcmVudCxcbiAgICAgICAgLy8gdGhlbiBpdCB3aWxsIGZpbGwgaW4gdGhlIG1pc3Npbmcgbm9kZXMgYW5kIHNpZ25hbCB0aGVtIGFzIGhhdmluZ1xuICAgICAgICAvLyBhIGRldGVjdGVkIHBhcmVudCAob3IgYSBOT19QQVJFTlQgdmFsdWUgdmlhIGEgc3BlY2lhbCBjb25zdGFudCkuXG4gICAgICAgIGxldCBwYXJlbnRXaXRoQW5pbWF0aW9uOiBhbnkgPSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQ7XG4gICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50TWFwLnNpemUgPiAxKSB7XG4gICAgICAgICAgbGV0IGVsbSA9IGVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgcGFyZW50c1RvQWRkOiBhbnlbXSA9IFtdO1xuICAgICAgICAgIHdoaWxlIChlbG0gPSBlbG0ucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0ZWRQYXJlbnQgPSBhbmltYXRpb25FbGVtZW50TWFwLmdldChlbG0pO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkUGFyZW50KSB7XG4gICAgICAgICAgICAgIHBhcmVudFdpdGhBbmltYXRpb24gPSBkZXRlY3RlZFBhcmVudDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRzVG9BZGQucHVzaChlbG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnRzVG9BZGQuZm9yRWFjaChwYXJlbnQgPT4gYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQocGFyZW50LCBwYXJlbnRXaXRoQW5pbWF0aW9uKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IHRoaXMuX2J1aWxkQW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLm5hbWVzcGFjZUlkLCBpbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwLCBza2lwcGVkUGxheWVyc01hcCwgcHJlU3R5bGVzTWFwLFxuICAgICAgICAgICAgcG9zdFN0eWxlc01hcCk7XG5cbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuXG4gICAgICAgIGlmIChwYXJlbnRXaXRoQW5pbWF0aW9uID09PSBOT19QQVJFTlRfQU5JTUFUSU9OX0VMRU1FTlRfREVURUNURUQpIHtcbiAgICAgICAgICByb290UGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50UGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQocGFyZW50V2l0aEFuaW1hdGlvbik7XG4gICAgICAgICAgaWYgKHBhcmVudFBsYXllcnMgJiYgcGFyZW50UGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllci5wYXJlbnRQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBhcmVudFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAvLyB0aGVyZSBzdGlsbCBtaWdodCBiZSBhIGFuY2VzdG9yIHBsYXllciBhbmltYXRpbmcgdGhpc1xuICAgICAgICAvLyBlbGVtZW50IHRoZXJlZm9yZSB3ZSB3aWxsIHN0aWxsIGFkZCBpdCBhcyBhIHN1YiBwbGF5ZXJcbiAgICAgICAgLy8gZXZlbiBpZiBpdHMgYW5pbWF0aW9uIG1heSBiZSBkaXNhYmxlZFxuICAgICAgICBzdWJQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgc2tpcHBlZFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBmaW5kIGFsbCBvZiB0aGUgc3ViIHBsYXllcnMnIGNvcnJlc3BvbmRpbmcgaW5uZXIgYW5pbWF0aW9uIHBsYXllclxuICAgIHN1YlBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gZXZlbiBpZiBhbnkgcGxheWVycyBhcmUgbm90IGZvdW5kIGZvciBhIHN1YiBhbmltYXRpb24gdGhlbiBpdFxuICAgICAgLy8gd2lsbCBzdGlsbCBjb21wbGV0ZSBpdHNlbGYgYWZ0ZXIgdGhlIG5leHQgdGljayBzaW5jZSBpdCdzIE5vb3BcbiAgICAgIGNvbnN0IHBsYXllcnNGb3JFbGVtZW50ID0gc2tpcHBlZFBsYXllcnNNYXAuZ2V0KHBsYXllci5lbGVtZW50KTtcbiAgICAgIGlmIChwbGF5ZXJzRm9yRWxlbWVudCAmJiBwbGF5ZXJzRm9yRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5uZXJQbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnNGb3JFbGVtZW50KTtcbiAgICAgICAgcGxheWVyLnNldFJlYWxQbGF5ZXIoaW5uZXJQbGF5ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgYWN0dWFsbHkgcGxheSB0aGUgYW5pbWF0aW9uIGlzXG4gICAgLy8gYmVjYXVzZSBhbGwgdGhhdCBhIHNraXBwZWQgcGxheWVyIGlzIGRlc2lnbmVkIHRvIGRvIGlzIHRvXG4gICAgLy8gZmlyZSB0aGUgc3RhcnQvZG9uZSB0cmFuc2l0aW9uIGNhbGxiYWNrIGV2ZW50c1xuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGlmIChwbGF5ZXIucGFyZW50UGxheWVyKSB7XG4gICAgICAgIHBsYXllci5zeW5jUGxheWVyRXZlbnRzKHBsYXllci5wYXJlbnRQbGF5ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHJ1biB0aHJvdWdoIGFsbCBvZiB0aGUgcXVldWVkIHJlbW92YWxzIGFuZCBzZWUgaWYgdGhleVxuICAgIC8vIHdlcmUgcGlja2VkIHVwIGJ5IGEgcXVlcnkuIElmIG5vdCB0aGVuIHBlcmZvcm0gdGhlIHJlbW92YWxcbiAgICAvLyBvcGVyYXRpb24gcmlnaHQgYXdheSB1bmxlc3MgYSBwYXJlbnQgYW5pbWF0aW9uIGlzIG9uZ29pbmcuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxMZWF2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gYWxsTGVhdmVOb2Rlc1tpXTtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgTEVBVkVfQ0xBU1NOQU1FKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGUgZWxlbWVudCBoYXMgYSByZW1vdmFsIGFuaW1hdGlvbiB0aGF0IGlzIGJlaW5nXG4gICAgICAvLyB0YWtlbiBjYXJlIG9mIGFuZCB0aGVyZWZvcmUgdGhlIGlubmVyIGVsZW1lbnRzIHdpbGwgaGFuZyBhcm91bmRcbiAgICAgIC8vIHVudGlsIHRoYXQgYW5pbWF0aW9uIGlzIG92ZXIgKG9yIHRoZSBwYXJlbnQgcXVlcmllZCBhbmltYXRpb24pXG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLmhhc0FuaW1hdGlvbikgY29udGludWU7XG5cbiAgICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGlzIHF1ZXJpZWQgb3IgaWYgaXQgY29udGFpbnMgcXVlcmllZCBjaGlsZHJlblxuICAgICAgLy8gdGhlbiB3ZSB3YW50IGZvciB0aGUgZWxlbWVudCBub3QgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwYWdlXG4gICAgICAvLyB1bnRpbCB0aGUgcXVlcmllZCBhbmltYXRpb25zIGhhdmUgZmluaXNoZWRcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudHMuc2l6ZSkge1xuICAgICAgICBsZXQgcXVlcmllZFBsYXllclJlc3VsdHMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAocXVlcmllZFBsYXllclJlc3VsdHMgJiYgcXVlcmllZFBsYXllclJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKC4uLnF1ZXJpZWRQbGF5ZXJSZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWVyaWVkSW5uZXJFbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcXVlcmllZElubmVyRWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBsZXQgcXVlcmllZFBsYXllcnMgPSBxdWVyaWVkRWxlbWVudHMuZ2V0KHF1ZXJpZWRJbm5lckVsZW1lbnRzW2pdKTtcbiAgICAgICAgICBpZiAocXVlcmllZFBsYXllcnMgJiYgcXVlcmllZFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhY3RpdmVQbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocCA9PiAhcC5kZXN0cm95ZWQpO1xuICAgICAgaWYgKGFjdGl2ZVBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKHRoaXMsIGVsZW1lbnQsIGFjdGl2ZVBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgc28gdGhlIGNsZWFudXAgbWV0aG9kIGRvZXNuJ3QgcmVtb3ZlIHRoZW1cbiAgICBhbGxMZWF2ZU5vZGVzLmxlbmd0aCA9IDA7XG5cbiAgICByb290UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgIHBsYXllci5kZXN0cm95KCk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH0pO1xuICAgICAgcGxheWVyLnBsYXkoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByb290UGxheWVycztcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55KSB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5oYXMoZWxlbWVudCkpIGNvbnRhaW5zRGF0YSA9IHRydWU7XG4gICAgaWYgKHRoaXMuc3RhdGVzQnlFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2hOYW1lc3BhY2UobmFtZXNwYWNlSWQpLmVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudCkgfHwgY29udGFpbnNEYXRhO1xuICB9XG5cbiAgYWZ0ZXJGbHVzaChjYWxsYmFjazogKCkgPT4gYW55KSB7IHRoaXMuX2ZsdXNoRm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHsgdGhpcy5fd2hlblF1aWV0Rm5zLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgZWxlbWVudDogc3RyaW5nLCBpc1F1ZXJpZWRFbGVtZW50OiBib29sZWFuLCBuYW1lc3BhY2VJZD86IHN0cmluZywgdHJpZ2dlck5hbWU/OiBzdHJpbmcsXG4gICAgICB0b1N0YXRlVmFsdWU/OiBhbnkpOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIGxldCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgY29uc3QgcXVlcmllZEVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocXVlcmllZEVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIHBsYXllcnMgPSBxdWVyaWVkRWxlbWVudFBsYXllcnM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgICBjb25zdCBpc1JlbW92YWxBbmltYXRpb24gPSAhdG9TdGF0ZVZhbHVlIHx8IHRvU3RhdGVWYWx1ZSA9PSBWT0lEX1ZBTFVFO1xuICAgICAgICBlbGVtZW50UGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWlzUmVtb3ZhbEFuaW1hdGlvbiAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgIT0gdHJpZ2dlck5hbWUpIHJldHVybjtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYW1lc3BhY2VJZCB8fCB0cmlnZ2VyTmFtZSkge1xuICAgICAgcGxheWVycyA9IHBsYXllcnMuZmlsdGVyKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChuYW1lc3BhY2VJZCAmJiBuYW1lc3BhY2VJZCAhPSBwbGF5ZXIubmFtZXNwYWNlSWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRyaWdnZXJOYW1lICYmIHRyaWdnZXJOYW1lICE9IHBsYXllci50cmlnZ2VyTmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVycztcbiAgfVxuXG4gIHByaXZhdGUgX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgbmFtZXNwYWNlSWQ6IHN0cmluZywgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbixcbiAgICAgIGFsbFByZXZpb3VzUGxheWVyc01hcDogTWFwPGFueSwgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdPikge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2hlbiBhIHJlbW92YWwgYW5pbWF0aW9uIG9jY3VycywgQUxMIHByZXZpb3VzIHBsYXllcnMgYXJlIGNvbGxlY3RlZFxuICAgIC8vIGFuZCBkZXN0cm95ZWQgKGV2ZW4gaWYgdGhleSBhcmUgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBuYW1lc3BhY2UpXG4gICAgY29uc3QgdGFyZ2V0TmFtZVNwYWNlSWQ6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogbmFtZXNwYWNlSWQ7XG4gICAgY29uc3QgdGFyZ2V0VHJpZ2dlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQgPVxuICAgICAgICBpbnN0cnVjdGlvbi5pc1JlbW92YWxUcmFuc2l0aW9uID8gdW5kZWZpbmVkIDogdHJpZ2dlck5hbWU7XG5cbiAgICBmb3IgKGNvbnN0IHRpbWVsaW5lSW5zdHJ1Y3Rpb24gb2YgaW5zdHJ1Y3Rpb24udGltZWxpbmVzKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGltZWxpbmVJbnN0cnVjdGlvbi5lbGVtZW50O1xuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcGxheWVycyA9IGdldE9yU2V0QXNJbk1hcChhbGxQcmV2aW91c1BsYXllcnNNYXAsIGVsZW1lbnQsIFtdKTtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9IHRoaXMuX2dldFByZXZpb3VzUGxheWVycyhcbiAgICAgICAgICBlbGVtZW50LCBpc1F1ZXJpZWRFbGVtZW50LCB0YXJnZXROYW1lU3BhY2VJZCwgdGFyZ2V0VHJpZ2dlck5hbWUsIGluc3RydWN0aW9uLnRvU3RhdGUpO1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgY29uc3QgcmVhbFBsYXllciA9IHBsYXllci5nZXRSZWFsUGxheWVyKCkgYXMgYW55O1xuICAgICAgICBpZiAocmVhbFBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgICAgcmVhbFBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgc28gdGhhdCB0aGUgUFJFL1BPU1Qgc3R5bGVzIGNhbiBiZVxuICAgIC8vIGNvbXB1dGVkIHByb3Blcmx5IHdpdGhvdXQgaW50ZXJmZXJpbmcgd2l0aCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uXG4gICAgZXJhc2VTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBbmltYXRpb24oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+LFxuICAgICAgc2tpcHBlZFBsYXllcnNNYXA6IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPiwgcHJlU3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sXG4gICAgICBwb3N0U3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2UgZmlyc3QgcnVuIHRoaXMgc28gdGhhdCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHBsYXllclxuICAgIC8vIGRhdGEgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBzdWNjZXNzaXZlIGFuaW1hdGlvbiBwbGF5ZXJzXG4gICAgY29uc3QgYWxsUXVlcmllZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGFsbENvbnN1bWVkRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxTdWJFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbE5ld1BsYXllcnMgPSBpbnN0cnVjdGlvbi50aW1lbGluZXMubWFwKHRpbWVsaW5lSW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAvLyBGSVhNRSAobWF0c2tvKTogbWFrZSBzdXJlIHRvLWJlLXJlbW92ZWQgYW5pbWF0aW9ucyBhcmUgcmVtb3ZlZCBwcm9wZXJseVxuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMucmVtb3ZlZEJlZm9yZVF1ZXJpZWQpXG4gICAgICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLmR1cmF0aW9uLCB0aW1lbGluZUluc3RydWN0aW9uLmRlbGF5KTtcblxuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICBmbGF0dGVuR3JvdXBQbGF5ZXJzKChhbGxQcmV2aW91c1BsYXllcnNNYXAuZ2V0KGVsZW1lbnQpIHx8IEVNUFRZX1BMQVlFUl9BUlJBWSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHAgPT4gcC5nZXRSZWFsUGxheWVyKCkpKVxuICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBgZWxlbWVudGAgaXMgbm90IGFwYXJ0IG9mIHRoZSBBbmltYXRpb25QbGF5ZXIgZGVmaW5pdGlvbiwgYnV0XG4gICAgICAgICAgICAgICAgLy8gTW9jay9XZWJBbmltYXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBlbGVtZW50IHdpdGhpbiB0aGVpciBpbXBsZW1lbnRhdGlvbi4gVGhpcyB3aWxsIGJlIGFkZGVkIGluIEFuZ3VsYXI1IHRvXG4gICAgICAgICAgICAgICAgLy8gQW5pbWF0aW9uUGxheWVyXG4gICAgICAgICAgICAgICAgY29uc3QgcHAgPSBwIGFzIGFueTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHAuZWxlbWVudCA/IHBwLmVsZW1lbnQgPT09IGVsZW1lbnQgOiBmYWxzZTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHByZVN0eWxlcyA9IHByZVN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBwb3N0U3R5bGVzID0gcG9zdFN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBrZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgICAgICAgdGhpcy5kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIHRpbWVsaW5lSW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBwcmVTdHlsZXMsXG4gICAgICAgICAgcG9zdFN0eWxlcyk7XG4gICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9idWlsZFBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXMsIHByZXZpb3VzUGxheWVycyk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGlzIHBhcnRpY3VsYXIgcGxheWVyIGJlbG9uZ3MgdG8gYSBzdWIgdHJpZ2dlci4gSXQgaXNcbiAgICAgIC8vIGltcG9ydGFudCB0aGF0IHdlIG1hdGNoIHRoaXMgcGxheWVyIHVwIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgKEB0cmlnZ2VyLmxpc3RlbmVyKVxuICAgICAgaWYgKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uc3ViVGltZWxpbmUgJiYgc2tpcHBlZFBsYXllcnNNYXApIHtcbiAgICAgICAgYWxsU3ViRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgICBjb25zdCB3cmFwcGVkUGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIobmFtZXNwYWNlSWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcbiAgICAgICAgd3JhcHBlZFBsYXllci5zZXRSZWFsUGxheWVyKHBsYXllcik7XG4gICAgICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLnB1c2god3JhcHBlZFBsYXllcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfSk7XG5cbiAgICBhbGxRdWVyaWVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGRlbGV0ZU9yVW5zZXRJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgcGxheWVyKSk7XG4gICAgfSk7XG5cbiAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBhZGRDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgY29uc3QgcGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihhbGxOZXdQbGF5ZXJzKTtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHJlbW92ZUNsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICAgIHNldFN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBiYXNpY2FsbHkgbWFrZXMgYWxsIG9mIHRoZSBjYWxsYmFja3MgZm9yIHN1YiBlbGVtZW50IGFuaW1hdGlvbnNcbiAgICAvLyBiZSBkZXBlbmRlbnQgb24gdGhlIHVwcGVyIHBsYXllcnMgZm9yIHdoZW4gdGhleSBmaW5pc2hcbiAgICBhbGxTdWJFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICBlbGVtZW50ID0+IHsgZ2V0T3JTZXRBc0luTWFwKHNraXBwZWRQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpOyB9KTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBpZiAoa2V5ZnJhbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRyaXZlci5hbmltYXRlKFxuICAgICAgICAgIGluc3RydWN0aW9uLmVsZW1lbnQsIGtleWZyYW1lcywgaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgICAgIGluc3RydWN0aW9uLmVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZW1wdHkgdHJhbnNpdGlvbnxkZWZpbml0aW9uIGlzIHByb3ZpZGVkXG4gICAgLy8gLi4uIHRoZXJlIGlzIG5vIHBvaW50IGluIHJlbmRlcmluZyBhbiBlbXB0eSBhbmltYXRpb25cbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3BsYXllcjogQW5pbWF0aW9uUGxheWVyID0gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgcHJpdmF0ZSBfY29udGFpbnNSZWFsUGxheWVyID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcXVldWVkQ2FsbGJhY2tzOiB7W25hbWU6IHN0cmluZ106ICgoKSA9PiBhbnkpW119ID0ge307XG4gIHB1YmxpYyByZWFkb25seSBkZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyO1xuXG4gIHB1YmxpYyBtYXJrZWRGb3JEZXN0cm95OiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHJlYWRvbmx5IHF1ZXVlZDogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcsIHB1YmxpYyB0cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55KSB7fVxuXG4gIHNldFJlYWxQbGF5ZXIocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbnNSZWFsUGxheWVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgT2JqZWN0LmtleXModGhpcy5fcXVldWVkQ2FsbGJhY2tzKS5mb3JFYWNoKHBoYXNlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrc1twaGFzZV0uZm9yRWFjaChcbiAgICAgICAgICBjYWxsYmFjayA9PiBsaXN0ZW5PblBsYXllcihwbGF5ZXIsIHBoYXNlLCB1bmRlZmluZWQsIGNhbGxiYWNrKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fY29udGFpbnNSZWFsUGxheWVyID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJyaWRlVG90YWxUaW1lKHBsYXllci50b3RhbFRpbWUpO1xuICAgICh0aGlzIGFze3F1ZXVlZDogYm9vbGVhbn0pLnF1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0UmVhbFBsYXllcigpIHsgcmV0dXJuIHRoaXMuX3BsYXllcjsgfVxuXG4gIG92ZXJyaWRlVG90YWxUaW1lKHRvdGFsVGltZTogbnVtYmVyKSB7ICh0aGlzIGFzIGFueSkudG90YWxUaW1lID0gdG90YWxUaW1lOyB9XG5cbiAgc3luY1BsYXllckV2ZW50cyhwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gcC50cmlnZ2VyQ2FsbGJhY2sgISgnc3RhcnQnKSk7XG4gICAgfVxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBwcml2YXRlIF9xdWV1ZUV2ZW50KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fcXVldWVkQ2FsbGJhY2tzLCBuYW1lLCBbXSkucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2RvbmUnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRvbmUoZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnc3RhcnQnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vblN0YXJ0KGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZGVzdHJveScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRGVzdHJveShmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuaW5pdCgpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucXVldWVkID8gZmFsc2UgOiB0aGlzLl9wbGF5ZXIuaGFzU3RhcnRlZCgpOyB9XG5cbiAgcGxheSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wbGF5KCk7IH1cblxuICBwYXVzZSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wYXVzZSgpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5yZXN0YXJ0KCk7IH1cblxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX3BsYXllci5maW5pc2goKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgKHRoaXMgYXN7ZGVzdHJveWVkOiBib29sZWFufSkuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9wbGF5ZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzZXQoKTsgfVxuXG4gIHNldFBvc2l0aW9uKHA6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3BsYXllci5zZXRQb3NpdGlvbihwKTtcbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5xdWV1ZWQgPyAwIDogdGhpcy5fcGxheWVyLmdldFBvc2l0aW9uKCk7IH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BsYXllciBhcyBhbnk7XG4gICAgaWYgKHAudHJpZ2dlckNhbGxiYWNrKSB7XG4gICAgICBwLnRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxldGVPclVuc2V0SW5NYXAobWFwOiBNYXA8YW55LCBhbnlbXT58IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IGFueSwgdmFsdWU6IGFueSkge1xuICBsZXQgY3VycmVudFZhbHVlczogYW55W118bnVsbHx1bmRlZmluZWQ7XG4gIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwLmdldChrZXkpO1xuICAgIGlmIChjdXJyZW50VmFsdWVzKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtYXAuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRWYWx1ZXMgPSBtYXBba2V5XTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY3VycmVudFZhbHVlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlOiBhbnkpOiBhbnkge1xuICAvLyB3ZSB1c2UgYCE9IG51bGxgIGhlcmUgYmVjYXVzZSBpdCdzIHRoZSBtb3N0IHNpbXBsZVxuICAvLyB3YXkgdG8gdGVzdCBhZ2FpbnN0IGEgXCJmYWxzeVwiIHZhbHVlIHdpdGhvdXQgbWl4aW5nXG4gIC8vIGluIGVtcHR5IHN0cmluZ3Mgb3IgYSB6ZXJvIHZhbHVlLiBETyBOT1QgT1BUSU1JWkUuXG4gIHJldHVybiB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnROb2RlKG5vZGU6IGFueSkge1xuICByZXR1cm4gbm9kZSAmJiBub2RlWydub2RlVHlwZSddID09PSAxO1xufVxuXG5mdW5jdGlvbiBpc1RyaWdnZXJFdmVudFZhbGlkKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBldmVudE5hbWUgPT0gJ3N0YXJ0JyB8fCBldmVudE5hbWUgPT0gJ2RvbmUnO1xufVxuXG5mdW5jdGlvbiBjbG9ha0VsZW1lbnQoZWxlbWVudDogYW55LCB2YWx1ZT86IHN0cmluZykge1xuICBjb25zdCBvbGRWYWx1ZSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheTtcbiAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogJ25vbmUnO1xuICByZXR1cm4gb2xkVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICB2YWx1ZXNNYXA6IE1hcDxhbnksIMm1U3R5bGVEYXRhPiwgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnRzOiBTZXQ8YW55PixcbiAgICBlbGVtZW50UHJvcHNNYXA6IE1hcDxhbnksIFNldDxzdHJpbmc+PiwgZGVmYXVsdFN0eWxlOiBzdHJpbmcpOiBhbnlbXSB7XG4gIGNvbnN0IGNsb2FrVmFsczogc3RyaW5nW10gPSBbXTtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNsb2FrVmFscy5wdXNoKGNsb2FrRWxlbWVudChlbGVtZW50KSkpO1xuXG4gIGNvbnN0IGZhaWxlZEVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuXG4gIGVsZW1lbnRQcm9wc01hcC5mb3JFYWNoKChwcm9wczogU2V0PHN0cmluZz4sIGVsZW1lbnQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBzdHlsZXNbcHJvcF0gPSBkcml2ZXIuY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3AsIGRlZmF1bHRTdHlsZSk7XG5cbiAgICAgIC8vIHRoZXJlIGlzIG5vIGVhc3kgd2F5IHRvIGRldGVjdCB0aGlzIGJlY2F1c2UgYSBzdWIgZWxlbWVudCBjb3VsZCBiZSByZW1vdmVkXG4gICAgICAvLyBieSBhIHBhcmVudCBhbmltYXRpb24gZWxlbWVudCBiZWluZyBkZXRhY2hlZC5cbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUubGVuZ3RoID09IDApIHtcbiAgICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU7XG4gICAgICAgIGZhaWxlZEVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFsdWVzTWFwLnNldChlbGVtZW50LCBzdHlsZXMpO1xuICB9KTtcblxuICAvLyB3ZSB1c2UgYSBpbmRleCB2YXJpYWJsZSBoZXJlIHNpbmNlIFNldC5mb3JFYWNoKGEsIGkpIGRvZXMgbm90IHJldHVyblxuICAvLyBhbiBpbmRleCB2YWx1ZSBmb3IgdGhlIGNsb3N1cmUgKGJ1dCBpbnN0ZWFkIGp1c3QgdGhlIHZhbHVlKVxuICBsZXQgaSA9IDA7XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha0VsZW1lbnQoZWxlbWVudCwgY2xvYWtWYWxzW2krK10pKTtcblxuICByZXR1cm4gZmFpbGVkRWxlbWVudHM7XG59XG5cbi8qXG5TaW5jZSB0aGUgQW5ndWxhciByZW5kZXJlciBjb2RlIHdpbGwgcmV0dXJuIGEgY29sbGVjdGlvbiBvZiBpbnNlcnRlZFxubm9kZXMgaW4gYWxsIGFyZWFzIG9mIGEgRE9NIHRyZWUsIGl0J3MgdXAgdG8gdGhpcyBhbGdvcml0aG0gdG8gZmlndXJlXG5vdXQgd2hpY2ggbm9kZXMgYXJlIHJvb3RzIGZvciBlYWNoIGFuaW1hdGlvbiBAdHJpZ2dlci5cblxuQnkgcGxhY2luZyBlYWNoIGluc2VydGVkIG5vZGUgaW50byBhIFNldCBhbmQgdHJhdmVyc2luZyB1cHdhcmRzLCBpdFxuaXMgcG9zc2libGUgdG8gZmluZCB0aGUgQHRyaWdnZXIgZWxlbWVudHMgYW5kIHdlbGwgYW55IGRpcmVjdCAqc3RhclxuaW5zZXJ0aW9uIG5vZGVzLCBpZiBhIEB0cmlnZ2VyIHJvb3QgaXMgZm91bmQgdGhlbiB0aGUgZW50ZXIgZWxlbWVudFxuaXMgcGxhY2VkIGludG8gdGhlIE1hcFtAdHJpZ2dlcl0gc3BvdC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRSb290TWFwKHJvb3RzOiBhbnlbXSwgbm9kZXM6IGFueVtdKTogTWFwPGFueSwgYW55W10+IHtcbiAgY29uc3Qgcm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnlbXT4oKTtcbiAgcm9vdHMuZm9yRWFjaChyb290ID0+IHJvb3RNYXAuc2V0KHJvb3QsIFtdKSk7XG5cbiAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSByZXR1cm4gcm9vdE1hcDtcblxuICBjb25zdCBOVUxMX05PREUgPSAxO1xuICBjb25zdCBub2RlU2V0ID0gbmV3IFNldChub2Rlcyk7XG4gIGNvbnN0IGxvY2FsUm9vdE1hcCA9IG5ldyBNYXA8YW55LCBhbnk+KCk7XG5cbiAgZnVuY3Rpb24gZ2V0Um9vdChub2RlOiBhbnkpOiBhbnkge1xuICAgIGlmICghbm9kZSkgcmV0dXJuIE5VTExfTk9ERTtcblxuICAgIGxldCByb290ID0gbG9jYWxSb290TWFwLmdldChub2RlKTtcbiAgICBpZiAocm9vdCkgcmV0dXJuIHJvb3Q7XG5cbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgaWYgKHJvb3RNYXAuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIEB0cmlnZ2VyXG4gICAgICByb290ID0gcGFyZW50O1xuICAgIH0gZWxzZSBpZiAobm9kZVNldC5oYXMocGFyZW50KSkgeyAgLy8gbmdJZiBpbnNpZGUgbmdJZlxuICAgICAgcm9vdCA9IE5VTExfTk9ERTtcbiAgICB9IGVsc2UgeyAgLy8gcmVjdXJzZSB1cHdhcmRzXG4gICAgICByb290ID0gZ2V0Um9vdChwYXJlbnQpO1xuICAgIH1cblxuICAgIGxvY2FsUm9vdE1hcC5zZXQobm9kZSwgcm9vdCk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBnZXRSb290KG5vZGUpO1xuICAgIGlmIChyb290ICE9PSBOVUxMX05PREUpIHtcbiAgICAgIHJvb3RNYXAuZ2V0KHJvb3QpICEucHVzaChub2RlKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByb290TWFwO1xufVxuXG5jb25zdCBDTEFTU0VTX0NBQ0hFX0tFWSA9ICckJGNsYXNzZXMnO1xuZnVuY3Rpb24gY29udGFpbnNDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICByZXR1cm4gY2xhc3NlcyAmJiBjbGFzc2VzW2NsYXNzTmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW59ID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgaWYgKCFjbGFzc2VzKSB7XG4gICAgICBjbGFzc2VzID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV0gPSB7fTtcbiAgICB9XG4gICAgY2xhc3Nlc1tjbGFzc05hbWVdID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIGxldCBjbGFzc2VzOiB7W2NsYXNzTmFtZTogc3RyaW5nXTogYm9vbGVhbn0gPSBlbGVtZW50W0NMQVNTRVNfQ0FDSEVfS0VZXTtcbiAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgZGVsZXRlIGNsYXNzZXNbY2xhc3NOYW1lXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUoXG4gICAgZW5naW5lOiBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lLCBlbGVtZW50OiBhbnksIHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVycykub25Eb25lKCgpID0+IGVuZ2luZS5wcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQpKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkdyb3VwUGxheWVycyhwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllcltdIHtcbiAgY29uc3QgZmluYWxQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gIHJldHVybiBmaW5hbFBsYXllcnM7XG59XG5cbmZ1bmN0aW9uIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10sIGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgQW5pbWF0aW9uR3JvdXBQbGF5ZXIpIHtcbiAgICAgIF9mbGF0dGVuR3JvdXBQbGF5ZXJzUmVjdXIocGxheWVyLnBsYXllcnMsIGZpbmFsUGxheWVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbmFsUGxheWVycy5wdXNoKHBsYXllciBhcyBBbmltYXRpb25QbGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBvYmpFcXVhbHMoYToge1trZXk6IHN0cmluZ106IGFueX0sIGI6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYik7XG4gIGlmIChrMS5sZW5ndGggIT0gazIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgazEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcm9wID0gazFbaV07XG4gICAgaWYgKCFiLmhhc093blByb3BlcnR5KHByb3ApIHx8IGFbcHJvcF0gIT09IGJbcHJvcF0pIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShcbiAgICBlbGVtZW50OiBhbnksIGFsbFByZVN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PixcbiAgICBhbGxQb3N0U3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBvc3RFbnRyeSA9IGFsbFBvc3RTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKCFwb3N0RW50cnkpIHJldHVybiBmYWxzZTtcblxuICBsZXQgcHJlRW50cnkgPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKHByZUVudHJ5KSB7XG4gICAgcG9zdEVudHJ5LmZvckVhY2goZGF0YSA9PiBwcmVFbnRyeSAhLmFkZChkYXRhKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgcG9zdEVudHJ5KTtcbiAgfVxuXG4gIGFsbFBvc3RTdHlsZUVsZW1lbnRzLmRlbGV0ZShlbGVtZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=