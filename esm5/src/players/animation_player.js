/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { scheduleMicroTask } from '../util';
/**
 * AnimationPlayer controls an animation sequence that was produced from a programmatic animation.
 * (see {\@link AnimationBuilder AnimationBuilder} for more information on how to create programmatic
 * animations.)
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationPlayer() { }
function AnimationPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationPlayer.prototype.onDone;
    /** @type {?} */
    AnimationPlayer.prototype.onStart;
    /** @type {?} */
    AnimationPlayer.prototype.onDestroy;
    /** @type {?} */
    AnimationPlayer.prototype.init;
    /** @type {?} */
    AnimationPlayer.prototype.hasStarted;
    /** @type {?} */
    AnimationPlayer.prototype.play;
    /** @type {?} */
    AnimationPlayer.prototype.pause;
    /** @type {?} */
    AnimationPlayer.prototype.restart;
    /** @type {?} */
    AnimationPlayer.prototype.finish;
    /** @type {?} */
    AnimationPlayer.prototype.destroy;
    /** @type {?} */
    AnimationPlayer.prototype.reset;
    /** @type {?} */
    AnimationPlayer.prototype.setPosition;
    /** @type {?} */
    AnimationPlayer.prototype.getPosition;
    /** @type {?} */
    AnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    AnimationPlayer.prototype.totalTime;
    /** @type {?|undefined} */
    AnimationPlayer.prototype.beforeDestroy;
    /** @type {?|undefined} */
    AnimationPlayer.prototype.triggerCallback;
    /** @type {?|undefined} */
    AnimationPlayer.prototype.disabled;
}
/**
 * \@experimental Animation support is experimental.
 */
var /**
 * \@experimental Animation support is experimental.
 */
NoopAnimationPlayer = /** @class */ (function () {
    function NoopAnimationPlayer(duration, delay) {
        if (duration === void 0) { duration = 0; }
        if (delay === void 0) { delay = 0; }
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._started = false;
        this._destroyed = false;
        this._finished = false;
        this.parentPlayer = null;
        this.totalTime = duration + delay;
    }
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype._onFinish = /**
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
     * @param {?} fn
     * @return {?}
     */
    NoopAnimationPlayer.prototype.onStart = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onStartFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    NoopAnimationPlayer.prototype.onDone = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDoneFns.push(fn); };
    /**
     * @param {?} fn
     * @return {?}
     */
    NoopAnimationPlayer.prototype.onDestroy = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onDestroyFns.push(fn); };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.hasStarted = /**
     * @return {?}
     */
    function () { return this._started; };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.init = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.play = /**
     * @return {?}
     */
    function () {
        if (!this.hasStarted()) {
            this._onStart();
            this.triggerMicrotask();
        }
        this._started = true;
    };
    /* @internal */
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.triggerMicrotask = /**
     * @return {?}
     */
    function () {
        var _this = this;
        scheduleMicroTask(function () { return _this._onFinish(); });
    };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype._onStart = /**
     * @return {?}
     */
    function () {
        this._onStartFns.forEach(function (fn) { return fn(); });
        this._onStartFns = [];
    };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.pause = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.restart = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.finish = /**
     * @return {?}
     */
    function () { this._onFinish(); };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.destroy = /**
     * @return {?}
     */
    function () {
        if (!this._destroyed) {
            this._destroyed = true;
            if (!this.hasStarted()) {
                this._onStart();
            }
            this.finish();
            this._onDestroyFns.forEach(function (fn) { return fn(); });
            this._onDestroyFns = [];
        }
    };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.reset = /**
     * @return {?}
     */
    function () { };
    /**
     * @param {?} p
     * @return {?}
     */
    NoopAnimationPlayer.prototype.setPosition = /**
     * @param {?} p
     * @return {?}
     */
    function (p) { };
    /**
     * @return {?}
     */
    NoopAnimationPlayer.prototype.getPosition = /**
     * @return {?}
     */
    function () { return 0; };
    /* @internal */
    /**
     * @param {?} phaseName
     * @return {?}
     */
    NoopAnimationPlayer.prototype.triggerCallback = /**
     * @param {?} phaseName
     * @return {?}
     */
    function (phaseName) {
        var /** @type {?} */ methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return NoopAnimationPlayer;
}());
/**
 * \@experimental Animation support is experimental.
 */
export { NoopAnimationPlayer };
function NoopAnimationPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    NoopAnimationPlayer.prototype._onDoneFns;
    /** @type {?} */
    NoopAnimationPlayer.prototype._onStartFns;
    /** @type {?} */
    NoopAnimationPlayer.prototype._onDestroyFns;
    /** @type {?} */
    NoopAnimationPlayer.prototype._started;
    /** @type {?} */
    NoopAnimationPlayer.prototype._destroyed;
    /** @type {?} */
    NoopAnimationPlayer.prototype._finished;
    /** @type {?} */
    NoopAnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    NoopAnimationPlayer.prototype.totalTime;
}
//# sourceMappingURL=animation_player.js.map