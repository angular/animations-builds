/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { computeStyle } from '../../util';
import { ElementAnimationStyleHandler } from './element_animation_style_handler';
var /** @type {?} */ DEFAULT_FILL_MODE = 'forwards';
var /** @type {?} */ DEFAULT_EASING = 'linear';
var /** @type {?} */ ANIMATION_END_EVENT = 'animationend';
/** @enum {number} */
var AnimatorControlState = { INITIALIZED: 1, STARTED: 2, FINISHED: 3, DESTROYED: 4, };
export { AnimatorControlState };
var CssKeyframesPlayer = /** @class */ (function () {
    function CssKeyframesPlayer(element, keyframes, animationName, _duration, _delay, easing, _finalStyles) {
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
        this._state = 0;
        this.easing = easing || DEFAULT_EASING;
        this.totalTime = _duration + _delay;
        this._buildStyler();
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    CssKeyframesPlayer.prototype.onStart = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onStartFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    CssKeyframesPlayer.prototype.onDone = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDoneFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    CssKeyframesPlayer.prototype.onDestroy = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDestroyFns.push(fn); };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.destroy = /**
     * @return {?}
     */
    function () {
        this.init();
        if (this._state >= 4 /* DESTROYED */)
            return;
        this._state = 4 /* DESTROYED */;
        this._styler.destroy();
        this._flushStartFns();
        this._flushDoneFns();
        this._onDestroyFns.forEach(function (fn) { return fn(); });
        this._onDestroyFns = [];
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype._flushDoneFns = /**
     * @return {?}
     */
    function () {
        this._onDoneFns.forEach(function (fn) { return fn(); });
        this._onDoneFns = [];
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype._flushStartFns = /**
     * @return {?}
     */
    function () {
        this._onStartFns.forEach(function (fn) { return fn(); });
        this._onStartFns = [];
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.finish = /**
     * @return {?}
     */
    function () {
        this.init();
        if (this._state >= 3 /* FINISHED */)
            return;
        this._state = 3 /* FINISHED */;
        this._styler.finish();
        this._flushStartFns();
        this._flushDoneFns();
    };
    /**
     * @param {?} value
     * @return {?}
     */
    CssKeyframesPlayer.prototype.setPosition = /**
     * @param {?} value
     * @return {?}
     */
    function (value) { this._styler.setPosition(value); };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.getPosition = /**
     * @return {?}
     */
    function () { return this._styler.getPosition(); };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.hasStarted = /**
     * @return {?}
     */
    function () { return this._state >= 2 /* STARTED */; };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.init = /**
     * @return {?}
     */
    function () {
        if (this._state >= 1 /* INITIALIZED */)
            return;
        this._state = 1 /* INITIALIZED */;
        var /** @type {?} */ elm = this.element;
        this._styler.apply();
        if (this._delay) {
            this._styler.pause();
        }
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.play = /**
     * @return {?}
     */
    function () {
        this.init();
        if (!this.hasStarted()) {
            this._flushStartFns();
            this._state = 2 /* STARTED */;
        }
        this._styler.resume();
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.pause = /**
     * @return {?}
     */
    function () {
        this.init();
        this._styler.pause();
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.restart = /**
     * @return {?}
     */
    function () {
        this.reset();
        this.play();
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.reset = /**
     * @return {?}
     */
    function () {
        this._styler.destroy();
        this._buildStyler();
        this._styler.apply();
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype._buildStyler = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._styler = new ElementAnimationStyleHandler(this.element, this.animationName, this._duration, this._delay, this.easing, DEFAULT_FILL_MODE, function () { return _this.finish(); });
    };
    /* @internal */
    /**
     * @param {?} phaseName
     * @return {?}
     */
    CssKeyframesPlayer.prototype.triggerCallback = /**
     * @param {?} phaseName
     * @return {?}
     */
    function (phaseName) {
        var /** @type {?} */ methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    /**
     * @return {?}
     */
    CssKeyframesPlayer.prototype.beforeDestroy = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.init();
        var /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            var /** @type {?} */ finished_1 = this._state >= 3 /* FINISHED */;
            Object.keys(this._finalStyles).forEach(function (prop) {
                if (prop != 'offset') {
                    styles[prop] = finished_1 ? _this._finalStyles[prop] : computeStyle(_this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    };
    return CssKeyframesPlayer;
}());
export { CssKeyframesPlayer };
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
    CssKeyframesPlayer.prototype._state;
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