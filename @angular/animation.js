/**
 * @license Angular v4.0.0-beta.8-88755b0
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
import { ɵTransitionEngine, NgModule, ɵNoOpAnimationPlayer, Injectable, ɵAnimationGroupPlayer, AUTO_STYLE, AnimationStyles } from '@angular/core';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 * @abstract
 */
class AnimationStyleNormalizer {
    /**
     * @abstract
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) { }
    /**
     * @abstract
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) { }
}

class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    /**
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) {
        return dashCaseToCamelCase(propertyName);
    }
    /**
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        let /** @type {?} */ unit = '';
        const /** @type {?} */ strVal = value.toString().trim();
        if (DIMENSIONAL_PROP_MAP[normalizedProperty] && value !== 0 && value !== '0') {
            if (typeof value === 'number') {
                unit = 'px';
            }
            else {
                const /** @type {?} */ valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errors.push(`Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
                }
            }
        }
        return strVal + unit;
    }
}
const /** @type {?} */ DIMENSIONAL_PROP_MAP = makeBooleanMap('width,height,minWidth,minHeight,maxWidth,maxHeight,left,top,bottom,right,fontSize,outlineWidth,outlineOffset,paddingTop,paddingLeft,paddingBottom,paddingRight,marginTop,marginLeft,marginBottom,marginRight,borderRadius,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,textIndent'
    .split(','));
/**
 * @param {?} keys
 * @return {?}
 */
function makeBooleanMap(keys) {
    const /** @type {?} */ map = {};
    keys.forEach(key => map[key] = true);
    return map;
}
const /** @type {?} */ DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}

/**
 * \@experimental
 */
class NoOpAnimationDriver {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        return new ɵNoOpAnimationPlayer();
    }
}
/**
 * \@experimental
 * @abstract
 */
class AnimationDriver {
    /**
     * @abstract
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers) { }
}
AnimationDriver.NOOP = new NoOpAnimationDriver();

class DomAnimationTransitionEngine extends ɵTransitionEngine {
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
            return new ɵNoOpAnimationPlayer();
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
    return players.length == 1 ? players[0] : new ɵAnimationGroupPlayer(players);
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

class WebAnimationsPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @param {?=} previousPlayers
     */
    constructor(element, keyframes, options, previousPlayers = []) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._initialized = false;
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this.time = 0;
        this.parentPlayer = null;
        this._duration = options['duration'];
        this._delay = options['delay'] || 0;
        this.time = this._duration + this._delay;
        this.previousStyles = {};
        previousPlayers.forEach(player => {
            let styles = player._captureStyles();
            Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
        });
    }
    /**
     * @return {?}
     */
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(fn => fn());
            this._onDoneFns = [];
        }
    }
    /**
     * @return {?}
     */
    init() {
        if (this._initialized)
            return;
        this._initialized = true;
        const /** @type {?} */ keyframes = this.keyframes.map(styles => {
            const /** @type {?} */ formattedKeyframe = {};
            Object.keys(styles).forEach((prop, index) => {
                let /** @type {?} */ value = styles[prop];
                if (value == AUTO_STYLE) {
                    value = _computeStyle(this.element, prop);
                }
                if (value != undefined) {
                    formattedKeyframe[prop] = value;
                }
            });
            return formattedKeyframe;
        });
        const /** @type {?} */ previousStyleProps = Object.keys(this.previousStyles);
        if (previousStyleProps.length) {
            let /** @type {?} */ startingKeyframe = keyframes[0];
            let /** @type {?} */ missingStyleProps = [];
            previousStyleProps.forEach(prop => {
                if (startingKeyframe[prop] != null) {
                    missingStyleProps.push(prop);
                }
                startingKeyframe[prop] = this.previousStyles[prop];
            });
            if (missingStyleProps.length) {
                const /** @type {?} */ self = this;
                // tslint:disable-next-line
                for (var /** @type {?} */ i = 1; i < keyframes.length; i++) {
                    let /** @type {?} */ kf = keyframes[i];
                    missingStyleProps.forEach(function (prop) {
                        kf[prop] = _computeStyle(self.element, prop);
                    });
                }
            }
        }
        this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
        this._finalKeyframe = _copyKeyframeStyles(keyframes[keyframes.length - 1]);
        // this is required so that the player doesn't start to animate right away
        this._resetDomPlayerState();
        this._player.addEventListener('finish', () => this._onFinish());
    }
    /**
     * \@internal
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @return {?}
     */
    _triggerWebAnimation(element, keyframes, options) {
        // jscompiler doesn't seem to know animate is a native property because it's not fully
        // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
        return (element['animate'](keyframes, options));
    }
    /**
     * @return {?}
     */
    get domPlayer() { return this._player; }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._onDoneFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._onDestroyFns.push(fn); }
    /**
     * @return {?}
     */
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._onStartFns.forEach(fn => fn());
            this._onStartFns = [];
            this._started = true;
        }
        this._player.play();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this._player.pause();
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        this._onFinish();
        this._player.finish();
    }
    /**
     * @return {?}
     */
    reset() {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    /**
     * @return {?}
     */
    _resetDomPlayerState() {
        if (this._player) {
            this._player.cancel();
        }
    }
    /**
     * @return {?}
     */
    restart() {
        this.reset();
        this.play();
    }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._destroyed) {
            this._resetDomPlayerState();
            this._onFinish();
            this._destroyed = true;
            this._onDestroyFns.forEach(fn => fn());
            this._onDestroyFns = [];
        }
    }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { this._player.currentTime = p * this.time; }
    /**
     * @return {?}
     */
    getPosition() { return this._player.currentTime / this.time; }
    /**
     * @return {?}
     */
    _captureStyles() {
        const /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            Object.keys(this._finalKeyframe).forEach(prop => {
                if (prop != 'offset') {
                    styles[prop] =
                        this._finished ? this._finalKeyframe[prop] : _computeStyle(this.element, prop);
                }
            });
        }
        return styles;
    }
}
/**
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
function _computeStyle(element, prop) {
    return ((window.getComputedStyle(element)))[prop];
}
/**
 * @param {?} styles
 * @return {?}
 */
function _copyKeyframeStyles(styles) {
    const /** @type {?} */ newStyles = {};
    Object.keys(styles).forEach(prop => {
        if (prop != 'offset') {
            newStyles[prop] = styles[prop];
        }
    });
    return newStyles;
}

class WebAnimationsDriver {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const /** @type {?} */ playerOptions = { 'duration': duration, 'delay': delay, 'fill': 'forwards' };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        const /** @type {?} */ previousWebAnimationPlayers = (previousPlayers.filter(player => { return player instanceof WebAnimationsPlayer; }));
        return new WebAnimationsPlayer(element, keyframes, playerOptions, previousWebAnimationPlayers);
    }
}
/**
 * @return {?}
 */
function supportsWebAnimations() {
    return typeof Element !== 'undefined' && typeof ((Element)).prototype['animate'] === 'function';
}

/**
 * @return {?}
 */
function resolveDefaultAnimationDriver() {
    if (supportsWebAnimations()) {
        return new WebAnimationsDriver();
    }
    return new NoOpAnimationDriver();
}
/**
 * The module that includes all animation code such as `style()`, `animate()`, `trigger()`, etc...
 *
 * \@experimental
 */
class AnimationModule {
}
AnimationModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    { provide: AnimationDriver, useFactory: resolveDefaultAnimationDriver },
                    { provide: AnimationStyleNormalizer, useClass: WebAnimationsStyleNormalizer },
                    { provide: ɵTransitionEngine, useClass: DomAnimationTransitionEngine }
                ]
            },] },
];
/** @nocollapse */
AnimationModule.ctorParameters = () => [];

const /** @type {?} */ ONE_SECOND = 1000;
/**
 * @param {?} exp
 * @param {?} errors
 * @return {?}
 */
function parseTimeExpression(exp, errors) {
    const /** @type {?} */ regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let /** @type {?} */ duration;
    let /** @type {?} */ delay = 0;
    let /** @type {?} */ easing = null;
    if (typeof exp === 'string') {
        const /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: null };
        }
        let /** @type {?} */ durationMatch = parseFloat(matches[1]);
        const /** @type {?} */ durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        const /** @type {?} */ delayMatch = matches[3];
        const /** @type {?} */ delayUnit = matches[4];
        if (delayMatch != null) {
            let /** @type {?} */ delayVal = parseFloat(delayMatch);
            if (delayUnit != null && delayUnit == 's') {
                delayVal *= ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        const /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = (exp);
    }
    return { duration, delay, easing };
}
/**
 * @param {?} styles
 * @return {?}
 */
function normalizeStyles(styles) {
    const /** @type {?} */ normalizedStyles = {};
    styles.styles.forEach((styleMap) => copyStyles(styleMap, false, normalizedStyles));
    return normalizedStyles;
}
/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */
function copyStyles(styles, readPrototype, destination = {}) {
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (let /** @type {?} */ prop in styles) {
            destination[prop] = styles[prop];
        }
    }
    else {
        Object.keys(styles).forEach(prop => destination[prop] = styles[prop]);
    }
    return destination;
}

/**
 * @experimental Animation support is experimental.
 */
const /** @type {?} */ AUTO_STYLE$1 = '*';
/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {\@link sequence an animation sequence}, {\@link group group}, or {\@link
 * transition transition}.
 *
 * ### Usage
 *
 * The `animate` function accepts two input parameters: `timing` and `styles`:
 *
 * - `timing` is a string based value that can be a combination of a duration with optional delay
 * and easing values. The format for the expression breaks down to `duration delay easing`
 * (therefore a value such as `1s 100ms ease-out` will be parse itself into `duration=1000,
 * delay=100, easing=ease-out`. If a numeric value is provided then that will be used as the
 * `duration` value in millisecond form.
 * - `styles` is the style input data which can either be a call to {\@link style style} or {\@link
 * keyframes keyframes}. If left empty then the styles from the destination state will be collected
 * and used (this is useful when describing an animation step that will complete an animation by
 * {\@link transition#the-final-animate-call animating to the final state}).
 *
 * ```typescript
 * // various functions for specifying timing data
 * animate(500, style(...))
 * animate("1s", style(...))
 * animate("100ms 0.5s", style(...))
 * animate("5s ease", style(...))
 * animate("5s 10ms cubic-bezier(.17,.67,.88,.1)", style(...))
 *
 * // either style() of keyframes() can be used
 * animate(500, style({ background: "red" }))
 * animate(500, keyframes([
 *   style({ background: "blue" })),
 *   style({ background: "red" }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} timings
 * @param {?=} styles
 * @return {?}
 */
function animate(timings, styles = null) {
    return { type: 4 /* Animate */, styles: styles, timings: timings };
}
/**
 * `group` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different statrting/ending times.
 *
 * The `group` function can either be used within a {\@link sequence sequence} or a {\@link transition
 * transition} and it will only continue to the next instruction once all of the inner animation
 * steps have completed.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `group` animation function can either consist of {\@link
 * style style} or {\@link animate animate} function calls. Each call to `style()` or `animate()`
 * within a group will be executed instantly (use {\@link keyframes keyframes} or a {\@link
 * animate#usage animate() with a delay value} to offset styles to be applied at a later time).
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @return {?}
 */
function group(steps) {
    return { type: 3 /* Group */, steps: steps };
}
/**
 * `sequence` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used by
 * default when an array is passed as animation data into {\@link transition transition}.)
 *
 * The `sequence` function can either be used within a {\@link group group} or a {\@link transition
 * transition} and it will only continue to the next instruction once each of the inner animation
 * steps have completed.
 *
 * To perform animation styling in parallel with other animation steps then have a look at the
 * {\@link group group} animation function.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `sequence` animation function can either consist of
 * {\@link style style} or {\@link animate animate} function calls. A call to `style()` will apply the
 * provided styling data immediately while a call to `animate()` will apply its styling data over a
 * given time depending on its timing data.
 *
 * ```typescript
 * sequence([
 *   style({ opacity: 0 })),
 *   animate("1s", { opacity: 1 }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @return {?}
 */
function sequence(steps) {
    return { type: 2 /* Sequence */, steps: steps };
}
/**
 * `style` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {\@link state animation states}, within an {\@link sequence animation sequence}, or as styling data
 * for both {\@link animate animate} and {\@link keyframes keyframes}.
 *
 * ### Usage
 *
 * `style` takes in a key/value string map as data and expects one or more CSS property/value pairs
 * to be defined.
 *
 * ```typescript
 * // string values are used for css properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical (pixel) values are also supported
 * style({ width: 100, height: 0 })
 * ```
 *
 * #### Auto-styles (using `*`)
 *
 * When an asterix (`*`) character is used as a value then it will be detected from the element
 * being animated and applied as animation data when the animation starts.
 *
 * This feature proves useful for a state depending on layout and/or environment factors; in such
 * cases the styles are calculated just before the animation starts.
 *
 * ```typescript
 * // the steps below will animate from 0 to the
 * // actual height of the element
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} tokens
 * @return {?}
 */
function style(tokens) {
    let /** @type {?} */ input;
    let /** @type {?} */ offset = null;
    if (Array.isArray(tokens)) {
        input = (tokens);
    }
    else {
        input = [/** @type {?} */ (tokens)];
    }
    input.forEach(entry => {
        const /** @type {?} */ entryOffset = ((entry))['offset'];
        if (entryOffset != null) {
            offset = offset == null ? parseFloat(/** @type {?} */ (entryOffset)) : offset;
        }
    });
    return _style(offset, input);
}
/**
 * @param {?} offset
 * @param {?} styles
 * @return {?}
 */
function _style(offset, styles) {
    return { type: 6 /* Style */, styles: styles, offset: offset };
}
/**
 * `state` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `state` declares an animation state within the given trigger. When a state is active within a
 * component then its associated styles will persist on the element that the trigger is attached to
 * (even when the animation ends).
 *
 * To animate between states, have a look at the animation {\@link transition transition} DSL
 * function. To register states to an animation trigger please have a look at the {\@link trigger
 * trigger} function.
 *
 * #### The `void` state
 *
 * The `void` state value is a reserved word that angular uses to determine when the element is not
 * apart of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
 * associated element is void).
 *
 * #### The `*` (default) state
 *
 * The `*` state (when styled) is a fallback state that will be used if the state that is being
 * animated is not declared within the trigger.
 *
 * ### Usage
 *
 * `state` will declare an animation state with its associated styles
 * within the given trigger.
 *
 * - `stateNameExpr` can be one or more state names separated by commas.
 * - `styles` refers to the {\@link style styling data} that will be persisted on the element once
 * the state has been reached.
 *
 * ```typescript
 * // "void" is a reserved name for a state and is used to represent
 * // the state in which an element is detached from from the application.
 * state("void", style({ height: 0 }))
 *
 * // user-defined states
 * state("closed", style({ height: 0 }))
 * state("open, visible", style({ height: "*" }))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} styles
 * @return {?}
 */
function state(name, styles) {
    return { type: 0 /* State */, name: name, styles: styles };
}
/**
 * `keyframes` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `keyframes` specifies a collection of {\@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * ### Usage
 *
 * The `keyframes` animation function is designed to be used alongside the {\@link animate animate}
 * animation function. Instead of applying animations from where they are currently to their
 * destination, keyframes can describe how each style entry is applied and at what point within the
 * animation arc (much like CSS Keyframe Animations do).
 *
 * For each `style()` entry an `offset` value can be set. Doing so allows to specifiy at what
 * percentage of the animate time the styles will be applied.
 *
 * ```typescript
 * // the provided offset values describe when each backgroundColor value is applied.
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * Alternatively, if there are no `offset` values used within the style entries then the offsets
 * will be calculated automatically.
 *
 * ```typescript
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @return {?}
 */
function keyframes(steps) {
    return { type: 5 /* KeyframeSequence */, steps: steps };
}
/**
 * `transition` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `transition` declares the {\@link sequence sequence of animation steps} that will be run when the
 * provided `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 =>
 * state2` which consists of two known states (use an asterix (`*`) to refer to a dynamic starting
 * and/or ending state).
 *
 * A function can also be provided as the `stateChangeExpr` argument for a transition and this
 * function will be executed each time a state change occurs. If the value returned within the
 * function is true then the associated animation will be run.
 *
 * Animation transitions are placed within an {\@link trigger animation trigger}. For an transition
 * to animate to a state value and persist its styles then one or more {\@link state animation
 * states} is expected to be defined.
 *
 * ### Usage
 *
 * An animation transition is kicked off the `stateChangeExpr` predicate evaluates to true based on
 * what the previous state is and what the current state has become. In other words, if a transition
 * is defined that matches the old/current state criteria then the associated animation will be
 * triggered.
 *
 * ```typescript
 * // all transition/state changes are defined within an animation trigger
 * trigger("myAnimationTrigger", [
 *   // if a state is defined then its styles will be persisted when the
 *   // animation has fully completed itself
 *   state("on", style({ background: "green" })),
 *   state("off", style({ background: "grey" })),
 *
 *   // a transition animation that will be kicked off when the state value
 *   // bound to "myAnimationTrigger" changes from "on" to "off"
 *   transition("on => off", animate(500)),
 *
 *   // it is also possible to do run the same animation for both directions
 *   transition("on <=> off", animate(500)),
 *
 *   // or to define multiple states pairs separated by commas
 *   transition("on => off, off => void", animate(500)),
 *
 *   // this is a catch-all state change for when an element is inserted into
 *   // the page and the destination state is unknown
 *   transition("void => *", [
 *     style({ opacity: 0 }),
 *     animate(500)
 *   ]),
 *
 *   // this will capture a state change between any states
 *   transition("* => *", animate("1s 0s")),
 *
 *   // you can also go full out and include a function
 *   transition((fromState, toState) => {
 *     // when `true` then it will allow the animation below to be invoked
 *     return fromState == "off" && toState == "on";
 *   }, animate("1s 0s"))
 * ])
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * #### The final `animate` call
 *
 * If the final step within the transition steps is a call to `animate()` that **only** uses a
 * timing value with **no style data** then it will be automatically used as the final animation arc
 * for the element to animate itself to the final state. This involves an automatic mix of
 * adding/removing CSS styles so that the element will be in the exact state it should be for the
 * applied state to be presented correctly.
 *
 * ```
 * // start off by hiding the element, but make sure that it animates properly to whatever state
 * // is currently active for "myAnimationTrigger"
 * transition("void => *", [
 *   style({ opacity: 0 }),
 *   animate(500)
 * ])
 * ```
 *
 * ### Transition Aliases (`:enter` and `:leave`)
 *
 * Given that enter (insertion) and leave (removal) animations are so common, the `transition`
 * function accepts both `:enter` and `:leave` values which are aliases for the `void => *` and `*
 * => void` state changes.
 *
 * ```
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 * ])
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} stateChangeExpr
 * @param {?} steps
 * @return {?}
 */
function transition(stateChangeExpr, steps) {
    return {
        type: 1 /* Transition */,
        expr: stateChangeExpr,
        animation: Array.isArray(steps) ? sequence(steps) : (steps)
    };
}

/**
 * @param {?} visitor
 * @param {?} node
 * @param {?} context
 * @return {?}
 */
function visitAnimationNode(visitor, node, context) {
    switch (node.type) {
        case 0 /* State */:
            return visitor.visitState(/** @type {?} */ (node), context);
        case 1 /* Transition */:
            return visitor.visitTransition(/** @type {?} */ (node), context);
        case 2 /* Sequence */:
            return visitor.visitSequence(/** @type {?} */ (node), context);
        case 3 /* Group */:
            return visitor.visitGroup(/** @type {?} */ (node), context);
        case 4 /* Animate */:
            return visitor.visitAnimate(/** @type {?} */ (node), context);
        case 5 /* KeyframeSequence */:
            return visitor.visitKeyframeSequence(/** @type {?} */ (node), context);
        case 6 /* Style */:
            return visitor.visitStyle(/** @type {?} */ (node), context);
        default:
            throw new Error(`Unable to resolve animation metadata node #${node.type}`);
    }
}

/**
 * @param {?} keyframes
 * @param {?} duration
 * @param {?} delay
 * @param {?} easing
 * @return {?}
 */
function createTimelineInstruction(keyframes, duration, delay, easing) {
    return {
        type: 1 /* TimelineAnimation */,
        keyframes,
        duration,
        delay,
        easing
    };
}

/**
 * @param {?} ast
 * @param {?=} startingStyles
 * @param {?=} finalStyles
 * @return {?}
 */
function buildAnimationKeyframes(ast, startingStyles = {}, finalStyles = {}) {
    const /** @type {?} */ normalizedAst = Array.isArray(ast) ? sequence(/** @type {?} */ (ast)) : (ast);
    return new AnimationTimelineVisitor().buildKeyframes(normalizedAst, startingStyles, finalStyles);
}
class AnimationTimelineContext {
    /**
     * @param {?} errors
     * @param {?} timelines
     * @param {?=} initialTimeline
     */
    constructor(errors, timelines, initialTimeline = null) {
        this.errors = errors;
        this.timelines = timelines;
        this.previousNode = ({});
        this.subContextCount = 0;
        this.currentTimeline = initialTimeline || new TimelineBuilder(0);
        timelines.push(this.currentTimeline);
    }
    /**
     * @return {?}
     */
    createSubContext() {
        const /** @type {?} */ context = new AnimationTimelineContext(this.errors, this.timelines, this.currentTimeline.fork());
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        this.subContextCount++;
        return context;
    }
    /**
     * @param {?=} newTime
     * @return {?}
     */
    transformIntoNewTimeline(newTime = 0) {
        this.currentTimeline = this.currentTimeline.fork(newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    }
    /**
     * @param {?} time
     * @return {?}
     */
    incrementTime(time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    }
}
class AnimationTimelineVisitor {
    /**
     * @param {?} ast
     * @param {?} startingStyles
     * @param {?} finalStyles
     * @return {?}
     */
    buildKeyframes(ast, startingStyles, finalStyles) {
        const /** @type {?} */ context = new AnimationTimelineContext([], []);
        context.currentTimeline.setStyles(startingStyles);
        visitAnimationNode(this, ast, context);
        const /** @type {?} */ normalizedFinalStyles = copyStyles(finalStyles, true);
        // this is a special case for when animate(TIME) is used (without any styles)
        // thus indicating to create an animation arc between the final keyframe and
        // the destination styles. When this occurs we need to ensure that the styles
        // that are missing on the finalStyles map are set to AUTO
        if (Object.keys(context.currentTimeline.getFinalKeyframe()).length == 0) {
            context.currentTimeline.properties.forEach(prop => {
                const /** @type {?} */ val = normalizedFinalStyles[prop];
                if (val == null) {
                    normalizedFinalStyles[prop] = AUTO_STYLE$1;
                }
            });
        }
        context.currentTimeline.setStyles(normalizedFinalStyles);
        const /** @type {?} */ timelineInstructions = [];
        context.timelines.forEach(timeline => {
            // this checks to see if an actual animation happened
            if (timeline.hasStyling()) {
                timelineInstructions.push(timeline.buildKeyframes());
            }
        });
        if (timelineInstructions.length == 0) {
            timelineInstructions.push(createTimelineInstruction([], 0, 0, ''));
        }
        return timelineInstructions;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) {
        const /** @type {?} */ subContextCount = context.subContextCount;
        if (context.previousNode.type == 6 /* Style */) {
            context.currentTimeline.forwardFrame();
            context.currentTimeline.snapshotCurrentStyles();
        }
        ast.steps.forEach(s => visitAnimationNode(this, s, context));
        // this means that some animation function within the sequence
        // ended up creating a sub timeline (which means the current
        // timeline cannot overlap with the contents of the sequence)
        if (context.subContextCount > subContextCount) {
            context.transformIntoNewTimeline();
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) {
        const /** @type {?} */ innerTimelines = [];
        let /** @type {?} */ furthestTime = context.currentTimeline.currentTime;
        ast.steps.forEach(s => {
            const /** @type {?} */ innerContext = context.createSubContext();
            visitAnimationNode(this, s, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach(timeline => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
        context.transformIntoNewTimeline(furthestTime);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) {
        const /** @type {?} */ timings = ast.timings.hasOwnProperty('duration') ? (ast.timings) :
            parseTimeExpression(/** @type {?} */ (ast.timings), context.errors);
        context.currentAnimateTimings = timings;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            context.currentTimeline.snapshotCurrentStyles();
        }
        const /** @type {?} */ astType = ast.styles ? ast.styles.type : -1;
        if (astType == 5 /* KeyframeSequence */) {
            this.visitKeyframeSequence(/** @type {?} */ (ast.styles), context);
        }
        else {
            context.incrementTime(timings.duration);
            if (astType == 6 /* Style */) {
                this.visitStyle(/** @type {?} */ (ast.styles), context);
            }
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) {
        // this is a special case when a style() call is issued directly after
        // a call to animate(). If the clock is not forwarded by one frame then
        // the style() calls will be merged into the previous animate() call
        // which is incorrect.
        if (!context.currentAnimateTimings &&
            context.previousNode.type == 4 /* Animate */) {
            context.currentTimeline.forwardFrame();
        }
        const /** @type {?} */ normalizedStyles = normalizeStyles(new AnimationStyles(ast.styles));
        const /** @type {?} */ easing = context.currentAnimateTimings && context.currentAnimateTimings.easing;
        if (easing) {
            normalizedStyles['easing'] = easing;
        }
        context.currentTimeline.setStyles(normalizedStyles);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(ast, context) {
        const /** @type {?} */ MAX_KEYFRAME_OFFSET = 1;
        const /** @type {?} */ limit = ast.steps.length - 1;
        const /** @type {?} */ firstKeyframe = ast.steps[0];
        let /** @type {?} */ offsetGap = 0;
        const /** @type {?} */ containsOffsets = firstKeyframe.styles.find(styles => styles['offset'] >= 0);
        if (!containsOffsets) {
            offsetGap = MAX_KEYFRAME_OFFSET / limit;
        }
        const /** @type {?} */ startTime = context.currentTimeline.duration;
        const /** @type {?} */ duration = context.currentAnimateTimings.duration;
        const /** @type {?} */ innerContext = context.createSubContext();
        const /** @type {?} */ innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = context.currentAnimateTimings.easing;
        ast.steps.forEach((step, i) => {
            const /** @type {?} */ normalizedStyles = normalizeStyles(new AnimationStyles(step.styles));
            const /** @type {?} */ offset = containsOffsets ? (normalizedStyles['offset']) :
                (i == limit ? MAX_KEYFRAME_OFFSET : i * offsetGap);
            innerTimeline.forwardTime(offset * duration);
            innerTimeline.setStyles(normalizedStyles);
        });
        // this will ensure that the parent timeline gets all the styles from
        // the child even if the new timeline below is not used
        context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.transformIntoNewTimeline(startTime + duration);
        context.previousNode = ast;
    }
}
class TimelineBuilder {
    /**
     * @param {?} startTime
     * @param {?=} _globalTimelineStyles
     */
    constructor(startTime, _globalTimelineStyles = null) {
        this.startTime = startTime;
        this._globalTimelineStyles = _globalTimelineStyles;
        this.duration = 0;
        this.easing = '';
        this._keyframes = new Map();
        this._styleSummary = {};
        this._backFill = {};
        this._localTimelineStyles = Object.create(this._backFill, {});
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
        }
        this._loadKeyframe();
    }
    /**
     * @return {?}
     */
    hasStyling() { return this._keyframes.size > 1; }
    /**
     * @return {?}
     */
    get currentTime() { return this.startTime + this.duration; }
    /**
     * @param {?=} currentTime
     * @return {?}
     */
    fork(currentTime = 0) {
        return new TimelineBuilder(currentTime || this.currentTime, this._globalTimelineStyles);
    }
    /**
     * @return {?}
     */
    _loadKeyframe() {
        this._currentKeyframe = this._keyframes.get(this.duration);
        if (!this._currentKeyframe) {
            this._currentKeyframe = Object.create(this._backFill, {});
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    }
    /**
     * @return {?}
     */
    forwardFrame() {
        this.duration++;
        this._loadKeyframe();
    }
    /**
     * @param {?} time
     * @return {?}
     */
    forwardTime(time) {
        this.duration = time;
        this._loadKeyframe();
    }
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    _updateStyle(prop, value) {
        if (prop != 'easing') {
            this._localTimelineStyles[prop] = value;
            this._globalTimelineStyles[prop] = value;
            this._styleSummary[prop] = { time: this.currentTime, value };
        }
    }
    /**
     * @param {?} styles
     * @return {?}
     */
    setStyles(styles) {
        Object.keys(styles).forEach(prop => {
            if (prop !== 'offset') {
                const /** @type {?} */ val = styles[prop];
                this._currentKeyframe[prop] = val;
                if (prop !== 'easing' && !this._localTimelineStyles[prop]) {
                    this._backFill[prop] = this._globalTimelineStyles[prop] || AUTO_STYLE$1;
                }
                this._updateStyle(prop, val);
            }
        });
        Object.keys(this._localTimelineStyles).forEach(prop => {
            if (!this._currentKeyframe.hasOwnProperty(prop)) {
                this._currentKeyframe[prop] = this._localTimelineStyles[prop];
            }
        });
    }
    /**
     * @return {?}
     */
    snapshotCurrentStyles() { copyStyles(this._localTimelineStyles, false, this._currentKeyframe); }
    /**
     * @return {?}
     */
    getFinalKeyframe() { return this._keyframes.get(this.duration); }
    /**
     * @return {?}
     */
    get properties() {
        const /** @type {?} */ properties = [];
        for (let /** @type {?} */ prop in this._currentKeyframe) {
            properties.push(prop);
        }
        return properties;
    }
    /**
     * @param {?} timeline
     * @return {?}
     */
    mergeTimelineCollectedStyles(timeline) {
        Object.keys(timeline._styleSummary).forEach(prop => {
            const /** @type {?} */ details0 = this._styleSummary[prop];
            const /** @type {?} */ details1 = timeline._styleSummary[prop];
            if (!details0 || details1.time > details0.time) {
                this._updateStyle(prop, details1.value);
            }
        });
    }
    /**
     * @return {?}
     */
    buildKeyframes() {
        const /** @type {?} */ finalKeyframes = [];
        // special case for when there are only start/destination
        // styles but no actual animation animate steps...
        if (this.duration == 0) {
            const /** @type {?} */ targetKeyframe = this.getFinalKeyframe();
            const /** @type {?} */ firstKeyframe = copyStyles(targetKeyframe, true);
            firstKeyframe['offset'] = 0;
            finalKeyframes.push(firstKeyframe);
            const /** @type {?} */ lastKeyframe = copyStyles(targetKeyframe, true);
            lastKeyframe['offset'] = 1;
            finalKeyframes.push(lastKeyframe);
        }
        else {
            this._keyframes.forEach((keyframe, time) => {
                const /** @type {?} */ finalKeyframe = copyStyles(keyframe, true);
                finalKeyframe['offset'] = time / this.duration;
                finalKeyframes.push(finalKeyframe);
            });
        }
        return createTimelineInstruction(finalKeyframes, this.duration, this.startTime, this.easing);
    }
}

/**
 * @param {?} ast
 * @return {?}
 */
function validateAnimationSequence(ast) {
    return new AnimationValidatorVisitor().validate(ast);
}
class AnimationValidatorVisitor {
    /**
     * @param {?} ast
     * @return {?}
     */
    validate(ast) {
        const /** @type {?} */ context = new AnimationValidatorContext();
        visitAnimationNode(this, ast, context);
        return context.errors;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) {
        ast.steps.forEach(step => visitAnimationNode(this, step, context));
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) {
        const /** @type {?} */ currentTime = context.currentTime;
        let /** @type {?} */ furthestTime = 0;
        ast.steps.forEach(step => {
            context.currentTime = currentTime;
            visitAnimationNode(this, step, context);
            furthestTime = Math.max(furthestTime, context.currentTime);
        });
        context.currentTime = furthestTime;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) {
        // we reassign the timings here so that they are not reparsed each
        // time an animation occurs
        context.currentAnimateTimings = ast.timings =
            parseTimeExpression(/** @type {?} */ (ast.timings), context.errors);
        const /** @type {?} */ astType = ast.styles && ast.styles.type;
        if (astType == 5 /* KeyframeSequence */) {
            this.visitKeyframeSequence(/** @type {?} */ (ast.styles), context);
        }
        else {
            context.currentTime +=
                context.currentAnimateTimings.duration + context.currentAnimateTimings.delay;
            if (astType == 6 /* Style */) {
                this.visitStyle(/** @type {?} */ (ast.styles), context);
            }
        }
        context.currentAnimateTimings = null;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) {
        const /** @type {?} */ styleData = normalizeStyles(new AnimationStyles(ast.styles));
        const /** @type {?} */ timings = context.currentAnimateTimings;
        let /** @type {?} */ endTime = context.currentTime;
        let /** @type {?} */ startTime = context.currentTime;
        if (timings && startTime > 0) {
            startTime -= timings.duration + timings.delay;
        }
        Object.keys(styleData).forEach(prop => {
            const /** @type {?} */ collectedEntry = context.collectedStyles[prop];
            let /** @type {?} */ updateCollectedStyle = true;
            if (collectedEntry) {
                if (startTime != endTime && startTime >= collectedEntry.startTime &&
                    endTime <= collectedEntry.endTime) {
                    context.errors.push(`The CSS property "${prop}" that exists between the times of "${collectedEntry.startTime}ms" and "${collectedEntry.endTime}ms" is also being animated in a parallel animation between the times of "${startTime}ms" and "${endTime}ms"`);
                    updateCollectedStyle = false;
                }
                // we always choose the smaller start time value since we
                // want to have a record of the entire animation window where
                // the style property is being animated in between
                startTime = collectedEntry.startTime;
            }
            if (updateCollectedStyle) {
                context.collectedStyles[prop] = { startTime, endTime };
            }
        });
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(ast, context) {
        let /** @type {?} */ totalKeyframesWithOffsets = 0;
        const /** @type {?} */ offsets = [];
        let /** @type {?} */ offsetsOutOfOrder = false;
        let /** @type {?} */ keyframesOutOfRange = false;
        let /** @type {?} */ previousOffset = 0;
        ast.steps.forEach(step => {
            const /** @type {?} */ styleData = normalizeStyles(new AnimationStyles(step.styles));
            let /** @type {?} */ offset = 0;
            if (styleData.hasOwnProperty('offset')) {
                totalKeyframesWithOffsets++;
                offset = (styleData['offset']);
            }
            keyframesOutOfRange = keyframesOutOfRange || offset < 0 || offset > 1;
            offsetsOutOfOrder = offsetsOutOfOrder || offset < previousOffset;
            previousOffset = offset;
            offsets.push(offset);
        });
        if (keyframesOutOfRange) {
            context.errors.push(`Please ensure that all keyframe offsets are between 0 and 1`);
        }
        if (offsetsOutOfOrder) {
            context.errors.push(`Please ensure that all keyframe offsets are in order`);
        }
        const /** @type {?} */ length = ast.steps.length;
        let /** @type {?} */ generatedOffset = 0;
        if (totalKeyframesWithOffsets > 0 && totalKeyframesWithOffsets < length) {
            context.errors.push(`Not all style() steps within the declared keyframes() contain offsets`);
        }
        else if (totalKeyframesWithOffsets == 0) {
            generatedOffset = 1 / length;
        }
        const /** @type {?} */ limit = length - 1;
        const /** @type {?} */ currentTime = context.currentTime;
        const /** @type {?} */ animateDuration = context.currentAnimateTimings.duration;
        ast.steps.forEach((step, i) => {
            const /** @type {?} */ offset = generatedOffset > 0 ? (i == limit ? 1 : (generatedOffset * i)) : offsets[i];
            const /** @type {?} */ durationUpToThisFrame = offset * animateDuration;
            context.currentTime =
                currentTime + context.currentAnimateTimings.delay + durationUpToThisFrame;
            context.currentAnimateTimings.duration = durationUpToThisFrame;
            this.visitStyle(step, context);
        });
    }
}
class AnimationValidatorContext {
    constructor() {
        this.errors = [];
        this.currentTime = 0;
        this.collectedStyles = {};
    }
}

/**
 * \@experimental Animation support is experimental.
 */
class Animation {
    /**
     * @param {?} input
     */
    constructor(input) {
        const ast = Array.isArray(input) ? sequence(input) : input;
        const errors = validateAnimationSequence(ast);
        if (errors.length) {
            const errorMessage = `animation validation failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @return {?}
     */
    buildTimelines(startingStyles, destinationStyles) {
        const /** @type {?} */ start = Array.isArray(startingStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (startingStyles))) : (startingStyles);
        const /** @type {?} */ dest = Array.isArray(destinationStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (destinationStyles))) : (destinationStyles);
        return buildAnimationKeyframes(this._animationAst, start, dest);
    }
    /**
     * @param {?} injector
     * @param {?} element
     * @param {?=} startingStyles
     * @param {?=} destinationStyles
     * @return {?}
     */
    create(injector, element, startingStyles = {}, destinationStyles = {}) {
        const /** @type {?} */ instructions = this.buildTimelines(startingStyles, destinationStyles);
        // note the code below is only here to make the tests happy (once the new renderer is
        // within core then the code below will interact with Renderer.transition(...))
        const /** @type {?} */ driver = injector.get(AnimationDriver);
        const /** @type {?} */ normalizer = injector.get(AnimationStyleNormalizer);
        const /** @type {?} */ engine = new DomAnimationTransitionEngine(driver, normalizer);
        return engine.process(element, instructions);
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */ const /** @type {?} */ ANY_STATE = '*';
/**
 * @param {?} transitionValue
 * @param {?} errors
 * @return {?}
 */
function parseTransitionExpr(transitionValue, errors) {
    const /** @type {?} */ expressions = [];
    if (typeof transitionValue == 'string') {
        ((transitionValue))
            .split(/\s*,\s*/)
            .forEach(str => parseInnerTransitionStr(str, expressions, errors));
    }
    else {
        expressions.push(/** @type {?} */ (transitionValue));
    }
    return expressions;
}
/**
 * @param {?} eventStr
 * @param {?} expressions
 * @param {?} errors
 * @return {?}
 */
function parseInnerTransitionStr(eventStr, expressions, errors) {
    if (eventStr[0] == ':') {
        eventStr = parseAnimationAlias(eventStr, errors);
    }
    const /** @type {?} */ match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
    if (match == null || match.length < 4) {
        errors.push(`The provided transition expression "${eventStr}" is not supported`);
        return expressions;
    }
    const /** @type {?} */ fromState = match[1];
    const /** @type {?} */ separator = match[2];
    const /** @type {?} */ toState = match[3];
    expressions.push(makeLambdaFromStates(fromState, toState));
    const /** @type {?} */ isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
    if (separator[0] == '<' && !isFullAnyStateExpr) {
        expressions.push(makeLambdaFromStates(toState, fromState));
    }
}
/**
 * @param {?} alias
 * @param {?} errors
 * @return {?}
 */
function parseAnimationAlias(alias, errors) {
    switch (alias) {
        case ':enter':
            return 'void => *';
        case ':leave':
            return '* => void';
        default:
            errors.push(`The transition alias value "${alias}" is not supported`);
            return '* => *';
    }
}
/**
 * @param {?} lhs
 * @param {?} rhs
 * @return {?}
 */
function makeLambdaFromStates(lhs, rhs) {
    return (fromState, toState) => {
        const /** @type {?} */ lhsMatch = lhs == ANY_STATE || lhs == fromState;
        const /** @type {?} */ rhsMatch = rhs == ANY_STATE || rhs == toState;
        return lhsMatch && rhsMatch;
    };
}

/**
 * @param {?} triggerName
 * @param {?} isRemovalTransition
 * @param {?} fromStyles
 * @param {?} toStyles
 * @param {?} timelines
 * @return {?}
 */
function createTransitionInstruction(triggerName, isRemovalTransition, fromStyles, toStyles, timelines) {
    return {
        type: 0 /* TransitionAnimation */,
        triggerName,
        isRemovalTransition,
        fromStyles,
        toStyles,
        timelines
    };
}

class AnimationTransitionFactory {
    /**
     * @param {?} _triggerName
     * @param {?} ast
     * @param {?} matchFns
     * @param {?} _stateStyles
     */
    constructor(_triggerName, ast, matchFns, _stateStyles) {
        this._triggerName = _triggerName;
        this.matchFns = matchFns;
        this._stateStyles = _stateStyles;
        this._animationAst = ast.animation;
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @return {?}
     */
    match(currentState, nextState) {
        if (!oneOrMoreTransitionsMatch(this.matchFns, currentState, nextState))
            return;
        const /** @type {?} */ backupStateStyles = this._stateStyles['*'] || {};
        const /** @type {?} */ currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
        const /** @type {?} */ nextStateStyles = this._stateStyles[nextState] || backupStateStyles;
        const /** @type {?} */ timelines = buildAnimationKeyframes(this._animationAst, currentStateStyles, nextStateStyles);
        return createTransitionInstruction(this._triggerName, nextState === 'void', currentStateStyles, nextStateStyles, timelines);
    }
}
/**
 * @param {?} matchFns
 * @param {?} currentState
 * @param {?} nextState
 * @return {?}
 */
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState) {
    return matchFns.some(fn => fn(currentState, nextState));
}

/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `trigger` Creates an animation trigger which will a list of {\@link state state} and {\@link
 * transition transition} entries that will be evaluated when the expression bound to the trigger
 * changes.
 *
 * Triggers are registered within the component annotation data under the {\@link
 * Component#animations-anchor animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that the
 * trigger is bound to (in the form of `[\@triggerName]="expression"`.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {\@link state state} and {\@link
 * transition transition} declarations.
 *
 * ```typescript
 * \@Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *       state(...),
 *       state(...),
 *       transition(...),
 *       transition(...)
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "something";
 * }
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} definitions
 * @return {?}
 */
function trigger(name, definitions) {
    return new AnimationTriggerVisitor().buildTrigger(name, definitions);
}
/**
 * \@experimental Animation support is experimental.
 */
class AnimationTrigger {
    /**
     * @param {?} name
     * @param {?} states
     * @param {?} _transitionAsts
     */
    constructor(name, states, _transitionAsts) {
        this.name = name;
        this._transitionAsts = _transitionAsts;
        this.transitionFactories = [];
        this.states = {};
        Object.keys(states).forEach(stateName => { this.states[stateName] = copyStyles(states[stateName], false); });
        const errors = [];
        _transitionAsts.forEach(ast => {
            const exprs = parseTransitionExpr(ast.expr, errors);
            const sequenceErrors = validateAnimationSequence(ast);
            if (sequenceErrors.length) {
                errors.push(...sequenceErrors);
            }
            else {
                this.transitionFactories.push(new AnimationTransitionFactory(this.name, ast, exprs, states));
            }
        });
        if (errors.length) {
            const LINE_START = '\n - ';
            throw new Error(`Animation parsing for the ${name} trigger have failed:${LINE_START}${errors.join(LINE_START)}`);
        }
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @return {?}
     */
    matchTransition(currentState, nextState) {
        for (let /** @type {?} */ i = 0; i < this.transitionFactories.length; i++) {
            let /** @type {?} */ result = this.transitionFactories[i].match(currentState, nextState);
            if (result)
                return result;
        }
        return null;
    }
}
class AnimationTriggerContext {
    constructor() {
        this.errors = [];
        this.states = {};
        this.transitions = [];
    }
}
class AnimationTriggerVisitor {
    /**
     * @param {?} name
     * @param {?} definitions
     * @return {?}
     */
    buildTrigger(name, definitions) {
        const /** @type {?} */ context = new AnimationTriggerContext();
        definitions.forEach(def => visitAnimationNode(this, def, context));
        return new AnimationTrigger(name, context.states, context.transitions);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) {
        context.states[ast.name] = normalizeStyles(new AnimationStyles(ast.styles.styles));
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) {
        context.transitions.push(ast);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(ast, context) { }
}

export { AnimationModule, Animation, AUTO_STYLE$1 as AUTO_STYLE, animate, group, keyframes, sequence, state, style, transition, AnimationTrigger, trigger, resolveDefaultAnimationDriver as ɵa, AnimationStyleNormalizer as ɵd, WebAnimationsStyleNormalizer as ɵe, AnimationDriver as ɵc, DomAnimationTransitionEngine as ɵf };