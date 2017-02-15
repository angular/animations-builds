var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { AnimationStyleNormalizer } from '../dsl/style_normalization/animation_style_normalizer';
import { AnimationGroupPlayer, NoOpAnimationPlayer, TransitionEngine } from '../private_import_core';
import { AnimationDriver } from './animation_driver';
var DomAnimationTransitionEngine = (function (_super) {
    __extends(DomAnimationTransitionEngine, _super);
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    function DomAnimationTransitionEngine(_driver, _normalizer) {
        var _this = _super.call(this) || this;
        _this._driver = _driver;
        _this._normalizer = _normalizer;
        _this._flaggedInserts = new Set();
        _this._queuedRemovals = [];
        _this._queuedAnimations = [];
        _this._activeElementAnimations = new Map();
        _this._activeTransitionAnimations = new Map();
        return _this;
    }
    /**
     * @param {?} container
     * @param {?} element
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype.insertNode = function (container, element) {
        container.appendChild(element);
        this._flaggedInserts.add(element);
    };
    /**
     * @param {?} element
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype.removeNode = function (element) { this._queuedRemovals.push(element); };
    /**
     * @param {?} element
     * @param {?} instructions
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype.process = function (element, instructions) {
        var _this = this;
        var /** @type {?} */ players = instructions.map(function (instruction) {
            if (instruction.type == 0 /* TransitionAnimation */) {
                return _this._handleTransitionAnimation(element, /** @type {?} */ (instruction));
            }
            if (instruction.type == 1 /* TimelineAnimation */) {
                return _this._handleTimelineAnimation(element, /** @type {?} */ (instruction), []);
            }
            return new NoOpAnimationPlayer();
        });
        return optimizeGroupPlayer(players);
    };
    /**
     * @param {?} element
     * @param {?} instruction
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype._handleTransitionAnimation = function (element, instruction) {
        var _this = this;
        var /** @type {?} */ triggerName = instruction.triggerName;
        var /** @type {?} */ elmTransitionMap = getOrSetAsInMap(this._activeTransitionAnimations, element, {});
        var /** @type {?} */ previousPlayers;
        if (instruction.isRemovalTransition) {
            // we make a copy of the array because the actual source array is modified
            // each time a player is finished/destroyed (the forEach loop would fail otherwise)
            previousPlayers = copyArray(this._activeElementAnimations.get(element));
        }
        else {
            previousPlayers = [];
            var /** @type {?} */ existingPlayer = elmTransitionMap[triggerName];
            if (existingPlayer) {
                previousPlayers.push(existingPlayer);
            }
        }
        // it's important to do this step before destroying the players
        // so that the onDone callback below won't fire before this
        eraseStyles(element, instruction.fromStyles);
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        var /** @type {?} */ players = instruction.timelines.map(function (timelineInstruction) { return _this._buildPlayer(element, timelineInstruction, previousPlayers); });
        previousPlayers.forEach(function (previousPlayer) { return previousPlayer.destroy(); });
        var /** @type {?} */ player = optimizeGroupPlayer(players);
        player.onDone(function () {
            player.destroy();
            var /** @type {?} */ elmTransitionMap = _this._activeTransitionAnimations.get(element);
            if (elmTransitionMap) {
                delete elmTransitionMap[triggerName];
                if (Object.keys(elmTransitionMap).length == 0) {
                    _this._activeTransitionAnimations.delete(element);
                }
            }
            deleteFromArrayMap(_this._activeElementAnimations, element, player);
            setStyles(element, instruction.toStyles);
        });
        this._queuePlayer(element, player);
        elmTransitionMap[triggerName] = player;
        return player;
    };
    /**
     * @param {?} element
     * @param {?} instruction
     * @param {?} previousPlayers
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype._handleTimelineAnimation = function (element, instruction, previousPlayers) {
        var _this = this;
        var /** @type {?} */ player = this._buildPlayer(element, instruction, previousPlayers);
        player.onDestroy(function () { deleteFromArrayMap(_this._activeElementAnimations, element, player); });
        this._queuePlayer(element, player);
        return player;
    };
    /**
     * @param {?} element
     * @param {?} instruction
     * @param {?} previousPlayers
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype._buildPlayer = function (element, instruction, previousPlayers) {
        return this._driver.animate(element, this._normalizeKeyframes(instruction.keyframes), instruction.duration, instruction.delay, instruction.easing, previousPlayers);
    };
    /**
     * @param {?} keyframes
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype._normalizeKeyframes = function (keyframes) {
        var _this = this;
        var /** @type {?} */ errors = [];
        var /** @type {?} */ normalizedKeyframes = [];
        keyframes.forEach(function (kf) {
            var /** @type {?} */ normalizedKeyframe = {};
            Object.keys(kf).forEach(function (prop) {
                var /** @type {?} */ normalizedProp = prop;
                var /** @type {?} */ normalizedValue = kf[prop];
                if (prop != 'offset') {
                    normalizedProp = _this._normalizer.normalizePropertyName(prop, errors);
                    normalizedValue =
                        _this._normalizer.normalizeStyleValue(prop, normalizedProp, kf[prop], errors);
                }
                normalizedKeyframe[normalizedProp] = normalizedValue;
            });
            normalizedKeyframes.push(normalizedKeyframe);
        });
        if (errors.length) {
            var /** @type {?} */ LINE_START = '\n - ';
            throw new Error("Unable to animate due to the following errors:" + LINE_START + errors.join(LINE_START));
        }
        return normalizedKeyframes;
    };
    /**
     * @param {?} element
     * @param {?} player
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype._queuePlayer = function (element, player) {
        var /** @type {?} */ tuple = ({ element: element, player: player });
        this._queuedAnimations.push(tuple);
        player.init();
        var /** @type {?} */ elementAnimations = getOrSetAsInMap(this._activeElementAnimations, element, []);
        elementAnimations.push(player);
    };
    /**
     * @return {?}
     */
    DomAnimationTransitionEngine.prototype.triggerAnimations = function () {
        var _this = this;
        while (this._queuedAnimations.length) {
            var _a = this._queuedAnimations.shift(), player = _a.player, element = _a.element;
            // in the event that an animation throws an error then we do
            // not want to re-run animations on any previous animations
            // if they have already been kicked off beforehand
            if (!player.hasStarted()) {
                player.play();
            }
        }
        this._queuedRemovals.forEach(function (element) {
            if (_this._flaggedInserts.has(element))
                return;
            var /** @type {?} */ parent = element;
            var /** @type {?} */ players;
            while (parent = parent.parentNode) {
                var /** @type {?} */ match = _this._activeElementAnimations.get(parent);
                if (match) {
                    players = match;
                    break;
                }
            }
            if (players) {
                optimizeGroupPlayer(players).onDone(function () { return remove(element); });
            }
            else {
                if (element.parentNode) {
                    remove(element);
                }
            }
        });
        this._queuedRemovals = [];
        this._flaggedInserts.clear();
    };
    return DomAnimationTransitionEngine;
}(TransitionEngine));
export { DomAnimationTransitionEngine };
DomAnimationTransitionEngine.decorators = [
    { type: Injectable },
];
/** @nocollapse */
DomAnimationTransitionEngine.ctorParameters = function () { return [
    { type: AnimationDriver, },
    { type: AnimationStyleNormalizer, },
]; };
function DomAnimationTransitionEngine_tsickle_Closure_declarations() {
    /** @type {?} */
    DomAnimationTransitionEngine.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    DomAnimationTransitionEngine.ctorParameters;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._flaggedInserts;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._queuedRemovals;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._queuedAnimations;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._activeElementAnimations;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._activeTransitionAnimations;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._driver;
    /** @type {?} */
    DomAnimationTransitionEngine.prototype._normalizer;
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
function getOrSetAsInMap(map, key, defaultValue) {
    var /** @type {?} */ value = map.get(key);
    if (!value) {
        map.set(key, value = defaultValue);
    }
    return value;
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function deleteFromArrayMap(map, key, value) {
    var /** @type {?} */ arr = map.get(key);
    if (arr) {
        var /** @type {?} */ index = arr.indexOf(value);
        if (index >= 0) {
            arr.splice(index, 1);
            if (arr.length == 0) {
                map.delete(key);
            }
        }
    }
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
function setStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) { element.style[prop] = styles[prop]; });
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
function eraseStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) {
        // IE requires '' instead of null
        // see https://github.com/angular/angular/issues/7916
        element.style[prop] = '';
    });
}
/**
 * @param {?} players
 * @return {?}
 */
function optimizeGroupPlayer(players) {
    return players.length == 1 ? players[0] : new AnimationGroupPlayer(players);
}
/**
 * @param {?} source
 * @return {?}
 */
function copyArray(source) {
    return source ? source.splice(0) : [];
}
/**
 * @param {?} element
 * @return {?}
 */
function remove(element) {
    element.parentNode.removeChild(element);
}
//# sourceMappingURL=dom_animation_transition_engine.js.map