/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { computeStyle } from '../../util';
var WebAnimationsPlayer = /** @class */ (function () {
    function WebAnimationsPlayer(element, keyframes, options) {
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
        this.currentSnapshot = {};
        this._duration = /** @type {?} */ (options['duration']);
        this._delay = /** @type {?} */ (options['delay']) || 0;
        this.time = this._duration + this._delay;
    }
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype._onFinish = /**
     * @return {?}
     */
    function () {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.init = /**
     * @return {?}
     */
    function () {
        this._buildPlayer();
        this._preparePlayerBeforeStart();
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype._buildPlayer = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._initialized)
            return;
        this._initialized = true;
        var /** @type {?} */ keyframes = this.keyframes;
        (/** @type {?} */ (this)).domPlayer =
            this._triggerWebAnimation(this.element, keyframes, this.options);
        this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
        this.domPlayer.addEventListener('finish', function () { return _this._onFinish(); });
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype._preparePlayerBeforeStart = /**
     * @return {?}
     */
    function () {
        // this is required so that the player doesn't start to animate right away
        if (this._delay) {
            this._resetDomPlayerState();
        }
        else {
            this.domPlayer.pause();
        }
    };
    /** @internal */
    /**
     * \@internal
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @return {?}
     */
    WebAnimationsPlayer.prototype._triggerWebAnimation = /**
     * \@internal
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @return {?}
     */
    function (element, keyframes, options) {
        // jscompiler doesn't seem to know animate is a native property because it's not fully
        // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
        return /** @type {?} */ (element['animate'](keyframes, options));
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    WebAnimationsPlayer.prototype.onStart = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onStartFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    WebAnimationsPlayer.prototype.onDone = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDoneFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    WebAnimationsPlayer.prototype.onDestroy = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDestroyFns.push(fn); };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.play = /**
     * @return {?}
     */
    function () {
        this._buildPlayer();
        if (!this.hasStarted()) {
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
            this._started = true;
        }
        this.domPlayer.play();
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.pause = /**
     * @return {?}
     */
    function () {
        this.init();
        this.domPlayer.pause();
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.finish = /**
     * @return {?}
     */
    function () {
        this.init();
        this._onFinish();
        this.domPlayer.finish();
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.reset = /**
     * @return {?}
     */
    function () {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype._resetDomPlayerState = /**
     * @return {?}
     */
    function () {
        if (this.domPlayer) {
            this.domPlayer.cancel();
        }
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.restart = /**
     * @return {?}
     */
    function () {
        this.reset();
        this.play();
    };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.hasStarted = /**
     * @return {?}
     */
    function () { return this._started; };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.destroy = /**
     * @return {?}
     */
    function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this._resetDomPlayerState();
            this._onFinish();
            this._onDestroyFns.forEach(function (fn) { return fn(); });
            this._onDestroyFns = [];
        }
    };
    /**
     * @param {?} p
     * @return {?}
     */
    WebAnimationsPlayer.prototype.setPosition = /**
     * @param {?} p
     * @return {?}
     */
    function (p) { this.domPlayer.currentTime = p * this.time; };
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.getPosition = /**
     * @return {?}
     */
    function () { return this.domPlayer.currentTime / this.time; };
    Object.defineProperty(WebAnimationsPlayer.prototype, "totalTime", {
        get: /**
         * @return {?}
         */
        function () { return this._delay + this._duration; },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    WebAnimationsPlayer.prototype.beforeDestroy = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            Object.keys(this._finalKeyframe).forEach(function (prop) {
                if (prop != 'offset') {
                    styles[prop] =
                        _this._finished ? _this._finalKeyframe[prop] : computeStyle(_this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    };
    /* @internal */
    /**
     * @param {?} phaseName
     * @return {?}
     */
    WebAnimationsPlayer.prototype.triggerCallback = /**
     * @param {?} phaseName
     * @return {?}
     */
    function (phaseName) {
        var /** @type {?} */ methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return WebAnimationsPlayer;
}());
export { WebAnimationsPlayer };
function WebAnimationsPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    WebAnimationsPlayer.prototype._onDoneFns;
    /** @type {?} */
    WebAnimationsPlayer.prototype._onStartFns;
    /** @type {?} */
    WebAnimationsPlayer.prototype._onDestroyFns;
    /** @type {?} */
    WebAnimationsPlayer.prototype._duration;
    /** @type {?} */
    WebAnimationsPlayer.prototype._delay;
    /** @type {?} */
    WebAnimationsPlayer.prototype._initialized;
    /** @type {?} */
    WebAnimationsPlayer.prototype._finished;
    /** @type {?} */
    WebAnimationsPlayer.prototype._started;
    /** @type {?} */
    WebAnimationsPlayer.prototype._destroyed;
    /** @type {?} */
    WebAnimationsPlayer.prototype._finalKeyframe;
    /** @type {?} */
    WebAnimationsPlayer.prototype.domPlayer;
    /** @type {?} */
    WebAnimationsPlayer.prototype.time;
    /** @type {?} */
    WebAnimationsPlayer.prototype.parentPlayer;
    /** @type {?} */
    WebAnimationsPlayer.prototype.currentSnapshot;
    /** @type {?} */
    WebAnimationsPlayer.prototype.element;
    /** @type {?} */
    WebAnimationsPlayer.prototype.keyframes;
    /** @type {?} */
    WebAnimationsPlayer.prototype.options;
}
//# sourceMappingURL=web_animations_player.js.map