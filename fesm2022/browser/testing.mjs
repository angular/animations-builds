/**
 * @license Angular v19.2.3+sha-877456e
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { NoopAnimationPlayer, AUTO_STYLE } from '@angular/animations';
import { ɵvalidateStyleProperty as _validateStyleProperty, ɵcamelCaseToDashCase as _camelCaseToDashCase, ɵvalidateWebAnimatableStyleProperty as _validateWebAnimatableStyleProperty, ɵcontainsElement as _containsElement, ɵgetParentElement as _getParentElement, ɵinvokeQuery as _invokeQuery, ɵnormalizeKeyframes as _normalizeKeyframes, ɵallowPreviousPlayerStylesMerge as _allowPreviousPlayerStylesMerge } from '@angular/animations/browser';

/**
 * @publicApi
 */
class MockAnimationDriver {
    static log = [];
    validateStyleProperty(prop) {
        return _validateStyleProperty(prop);
    }
    validateAnimatableStyleProperty(prop) {
        const cssProp = _camelCaseToDashCase(prop);
        return _validateWebAnimatableStyleProperty(cssProp);
    }
    containsElement(elm1, elm2) {
        return _containsElement(elm1, elm2);
    }
    getParentElement(element) {
        return _getParentElement(element);
    }
    query(element, selector, multi) {
        return _invokeQuery(element, selector, multi);
    }
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(player);
        return player;
    }
}
/**
 * @publicApi
 */
class MockAnimationPlayer extends NoopAnimationPlayer {
    element;
    keyframes;
    duration;
    delay;
    easing;
    previousPlayers;
    __finished = false;
    __started = false;
    previousStyles = new Map();
    _onInitFns = [];
    currentSnapshot = new Map();
    _keyframes = [];
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super(duration, delay);
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
        this._keyframes = _normalizeKeyframes(keyframes);
        if (_allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach((player) => {
                if (player instanceof MockAnimationPlayer) {
                    const styles = player.currentSnapshot;
                    styles.forEach((val, prop) => this.previousStyles.set(prop, val));
                }
            });
        }
    }
    /** @internal */
    onInit(fn) {
        this._onInitFns.push(fn);
    }
    /** @internal */
    init() {
        super.init();
        this._onInitFns.forEach((fn) => fn());
        this._onInitFns = [];
    }
    reset() {
        super.reset();
        this.__started = false;
    }
    finish() {
        super.finish();
        this.__finished = true;
    }
    destroy() {
        super.destroy();
        this.__finished = true;
    }
    /** @internal */
    triggerMicrotask() { }
    play() {
        super.play();
        this.__started = true;
    }
    hasStarted() {
        return this.__started;
    }
    beforeDestroy() {
        const captures = new Map();
        this.previousStyles.forEach((val, prop) => captures.set(prop, val));
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this._keyframes.forEach((kf) => {
                for (let [prop, val] of kf) {
                    if (prop !== 'offset') {
                        captures.set(prop, this.__finished ? val : AUTO_STYLE);
                    }
                }
            });
        }
        this.currentSnapshot = captures;
    }
}

export { MockAnimationDriver, MockAnimationPlayer };
//# sourceMappingURL=testing.mjs.map
