/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core/index';
import { AnimationStyleNormalizer } from '../dsl/style_normalization/animation_style_normalizer';
import { AnimationGroupPlayer, NoOpAnimationPlayer, TransitionEngine } from '../private_import_core';
import { AnimationDriver } from './animation_driver';
export class DomAnimationTransitionEngine extends TransitionEngine {
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(_driver, _normalizer) {
        super();
        this._driver = _driver;
        this._normalizer = _normalizer;
        this._flaggedInserts = new Set();
        this._queuedRemovals = [];
        this._queuedAnimations = [];
        this._activeElementAnimations = new Map();
        this._activeTransitionAnimations = new Map();
    }
    /**
     * @param {?} container
     * @param {?} element
     * @return {?}
     */
    insertNode(container, element) {
        container.appendChild(element);
        this._flaggedInserts.add(element);
    }
    /**
     * @param {?} element
     * @return {?}
     */
    removeNode(element) { this._queuedRemovals.push(element); }
    /**
     * @param {?} element
     * @param {?} instructions
     * @return {?}
     */
    process(element, instructions) {
        const /** @type {?} */ players = instructions.map(instruction => {
            if (instruction.type == 0 /* TransitionAnimation */) {
                return this._handleTransitionAnimation(element, /** @type {?} */ (instruction));
            }
            if (instruction.type == 1 /* TimelineAnimation */) {
                return this._handleTimelineAnimation(element, /** @type {?} */ (instruction), []);
            }
            return new NoOpAnimationPlayer();
        });
        return optimizeGroupPlayer(players);
    }
    /**
     * @param {?} element
     * @param {?} instruction
     * @return {?}
     */
    _handleTransitionAnimation(element, instruction) {
        const /** @type {?} */ triggerName = instruction.triggerName;
        const /** @type {?} */ elmTransitionMap = getOrSetAsInMap(this._activeTransitionAnimations, element, {});
        let /** @type {?} */ previousPlayers;
        if (instruction.isRemovalTransition) {
            // we make a copy of the array because the actual source array is modified
            // each time a player is finished/destroyed (the forEach loop would fail otherwise)
            previousPlayers = copyArray(this._activeElementAnimations.get(element));
        }
        else {
            previousPlayers = [];
            const /** @type {?} */ existingPlayer = elmTransitionMap[triggerName];
            if (existingPlayer) {
                previousPlayers.push(existingPlayer);
            }
        }
        // it's important to do this step before destroying the players
        // so that the onDone callback below won't fire before this
        eraseStyles(element, instruction.fromStyles);
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        const /** @type {?} */ players = instruction.timelines.map(timelineInstruction => this._buildPlayer(element, timelineInstruction, previousPlayers));
        previousPlayers.forEach(previousPlayer => previousPlayer.destroy());
        const /** @type {?} */ player = optimizeGroupPlayer(players);
        player.onDone(() => {
            player.destroy();
            const /** @type {?} */ elmTransitionMap = this._activeTransitionAnimations.get(element);
            if (elmTransitionMap) {
                delete elmTransitionMap[triggerName];
                if (Object.keys(elmTransitionMap).length == 0) {
                    this._activeTransitionAnimations.delete(element);
                }
            }
            deleteFromArrayMap(this._activeElementAnimations, element, player);
            setStyles(element, instruction.toStyles);
        });
        this._queuePlayer(element, player);
        elmTransitionMap[triggerName] = player;
        return player;
    }
    /**
     * @param {?} element
     * @param {?} instruction
     * @param {?} previousPlayers
     * @return {?}
     */
    _handleTimelineAnimation(element, instruction, previousPlayers) {
        const /** @type {?} */ player = this._buildPlayer(element, instruction, previousPlayers);
        player.onDestroy(() => { deleteFromArrayMap(this._activeElementAnimations, element, player); });
        this._queuePlayer(element, player);
        return player;
    }
    /**
     * @param {?} element
     * @param {?} instruction
     * @param {?} previousPlayers
     * @return {?}
     */
    _buildPlayer(element, instruction, previousPlayers) {
        return this._driver.animate(element, this._normalizeKeyframes(instruction.keyframes), instruction.duration, instruction.delay, instruction.easing, previousPlayers);
    }
    /**
     * @param {?} keyframes
     * @return {?}
     */
    _normalizeKeyframes(keyframes) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ normalizedKeyframes = [];
        keyframes.forEach(kf => {
            const /** @type {?} */ normalizedKeyframe = {};
            Object.keys(kf).forEach(prop => {
                let /** @type {?} */ normalizedProp = prop;
                let /** @type {?} */ normalizedValue = kf[prop];
                if (prop != 'offset') {
                    normalizedProp = this._normalizer.normalizePropertyName(prop, errors);
                    normalizedValue =
                        this._normalizer.normalizeStyleValue(prop, normalizedProp, kf[prop], errors);
                }
                normalizedKeyframe[normalizedProp] = normalizedValue;
            });
            normalizedKeyframes.push(normalizedKeyframe);
        });
        if (errors.length) {
            const /** @type {?} */ LINE_START = '\n - ';
            throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
        }
        return normalizedKeyframes;
    }
    /**
     * @param {?} element
     * @param {?} player
     * @return {?}
     */
    _queuePlayer(element, player) {
        const /** @type {?} */ tuple = ({ element, player });
        this._queuedAnimations.push(tuple);
        player.init();
        const /** @type {?} */ elementAnimations = getOrSetAsInMap(this._activeElementAnimations, element, []);
        elementAnimations.push(player);
    }
    /**
     * @return {?}
     */
    triggerAnimations() {
        while (this._queuedAnimations.length) {
            const { player, element } = this._queuedAnimations.shift();
            // in the event that an animation throws an error then we do
            // not want to re-run animations on any previous animations
            // if they have already been kicked off beforehand
            if (!player.hasStarted()) {
                player.play();
            }
        }
        this._queuedRemovals.forEach(element => {
            if (this._flaggedInserts.has(element))
                return;
            let /** @type {?} */ parent = element;
            let /** @type {?} */ players;
            while (parent = parent.parentNode) {
                const /** @type {?} */ match = this._activeElementAnimations.get(parent);
                if (match) {
                    players = match;
                    break;
                }
            }
            if (players) {
                optimizeGroupPlayer(players).onDone(() => remove(element));
            }
            else {
                if (element.parentNode) {
                    remove(element);
                }
            }
        });
        this._queuedRemovals = [];
        this._flaggedInserts.clear();
    }
}
DomAnimationTransitionEngine.decorators = [
    { type: Injectable },
];
/** @nocollapse */
DomAnimationTransitionEngine.ctorParameters = () => [
    { type: AnimationDriver, },
    { type: AnimationStyleNormalizer, },
];
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
    let /** @type {?} */ value = map.get(key);
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
    let /** @type {?} */ arr = map.get(key);
    if (arr) {
        const /** @type {?} */ index = arr.indexOf(value);
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
    Object.keys(styles).forEach(prop => { element.style[prop] = styles[prop]; });
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
function eraseStyles(element, styles) {
    Object.keys(styles).forEach(prop => {
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