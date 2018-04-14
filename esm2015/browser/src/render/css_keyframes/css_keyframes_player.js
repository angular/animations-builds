/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { computeStyle } from '../../util';
import { ElementAnimationStyleHandler } from './element_animation_style_handler';
const /** @type {?} */ DEFAULT_FILL_MODE = 'forwards';
const /** @type {?} */ DEFAULT_EASING = 'linear';
const /** @type {?} */ ANIMATION_END_EVENT = 'animationend';
/** @enum {number} */
const AnimatorControlState = {
    INITIALIZED: 1,
    STARTED: 2,
    FINISHED: 3,
    DESTROYED: 4,
};
export { AnimatorControlState };
AnimatorControlState[AnimatorControlState.INITIALIZED] = "INITIALIZED";
AnimatorControlState[AnimatorControlState.STARTED] = "STARTED";
AnimatorControlState[AnimatorControlState.FINISHED] = "FINISHED";
AnimatorControlState[AnimatorControlState.DESTROYED] = "DESTROYED";
export class CssKeyframesPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} animationName
     * @param {?} _duration
     * @param {?} _delay
     * @param {?} easing
     * @param {?} _finalStyles
     */
    constructor(element, keyframes, animationName, _duration, _delay, easing, _finalStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.animationName = animationName;
        this._duration = _duration;
        this._delay = _delay;
        this._finalStyles = _finalStyles;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._started = false;
        this.currentSnapshot = {};
        this.state = 0;
        this.easing = easing || DEFAULT_EASING;
        this.totalTime = _duration + _delay;
        this._buildStyler();
    }
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
    destroy() {
        this.init();
        if (this.state >= AnimatorControlState.DESTROYED)
            return;
        this.state = AnimatorControlState.DESTROYED;
        this._styler.destroy();
        this._flushStartFns();
        this._flushDoneFns();
        this._onDestroyFns.forEach(fn => fn());
        this._onDestroyFns = [];
    }
    /**
     * @return {?}
     */
    _flushDoneFns() {
        this._onDoneFns.forEach(fn => fn());
        this._onDoneFns = [];
    }
    /**
     * @return {?}
     */
    _flushStartFns() {
        this._onStartFns.forEach(fn => fn());
        this._onStartFns = [];
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        if (this.state >= AnimatorControlState.FINISHED)
            return;
        this.state = AnimatorControlState.FINISHED;
        this._styler.finish();
        this._flushStartFns();
        this._flushDoneFns();
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setPosition(value) { this._styler.setPosition(value); }
    /**
     * @return {?}
     */
    getPosition() { return this._styler.getPosition(); }
    /**
     * @return {?}
     */
    hasStarted() { return this.state >= AnimatorControlState.STARTED; }
    /**
     * @return {?}
     */
    init() {
        if (this.state >= AnimatorControlState.INITIALIZED)
            return;
        this.state = AnimatorControlState.INITIALIZED;
        const /** @type {?} */ elm = this.element;
        this._styler.apply();
        if (this._delay) {
            this._styler.pause();
        }
    }
    /**
     * @return {?}
     */
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._flushStartFns();
            this.state = AnimatorControlState.STARTED;
        }
        this._styler.resume();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this._styler.pause();
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
    reset() {
        this._styler.destroy();
        this._buildStyler();
        this._styler.apply();
    }
    /**
     * @return {?}
     */
    _buildStyler() {
        this._styler = new ElementAnimationStyleHandler(this.element, this.animationName, this._duration, this._delay, this.easing, DEFAULT_FILL_MODE, () => this.finish());
    }
    /**
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        const /** @type {?} */ methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(fn => fn());
        methods.length = 0;
    }
    /**
     * @return {?}
     */
    beforeDestroy() {
        this.init();
        const /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            const /** @type {?} */ finished = this.state >= AnimatorControlState.FINISHED;
            Object.keys(this._finalStyles).forEach(prop => {
                if (prop != 'offset') {
                    styles[prop] = finished ? this._finalStyles[prop] : computeStyle(this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    }
}
function CssKeyframesPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    CssKeyframesPlayer.prototype._onDoneFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._onStartFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._onDestroyFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._started;
    /** @type {?} */
    CssKeyframesPlayer.prototype._styler;
    /** @type {?} */
    CssKeyframesPlayer.prototype.parentPlayer;
    /** @type {?} */
    CssKeyframesPlayer.prototype.totalTime;
    /** @type {?} */
    CssKeyframesPlayer.prototype.easing;
    /** @type {?} */
    CssKeyframesPlayer.prototype.currentSnapshot;
    /** @type {?} */
    CssKeyframesPlayer.prototype.state;
    /** @type {?} */
    CssKeyframesPlayer.prototype.element;
    /** @type {?} */
    CssKeyframesPlayer.prototype.keyframes;
    /** @type {?} */
    CssKeyframesPlayer.prototype.animationName;
    /** @type {?} */
    CssKeyframesPlayer.prototype._duration;
    /** @type {?} */
    CssKeyframesPlayer.prototype._delay;
    /** @type {?} */
    CssKeyframesPlayer.prototype._finalStyles;
}
//# sourceMappingURL=css_keyframes_player.js.map