/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * \@experimental Animation support is experimental.
 */
var MockAnimationDriver = /** @class */ (function () {
    function MockAnimationDriver() {
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    MockAnimationDriver.prototype.validateStyleProperty = /**
     * @param {?} prop
     * @return {?}
     */
    function (prop) { return validateStyleProperty(prop); };
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    MockAnimationDriver.prototype.matchesElement = /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    function (element, selector) {
        return matchesElement(element, selector);
    };
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    MockAnimationDriver.prototype.containsElement = /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    function (elm1, elm2) { return containsElement(elm1, elm2); };
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    MockAnimationDriver.prototype.query = /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    function (element, selector, multi) {
        return invokeQuery(element, selector, multi);
    };
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    MockAnimationDriver.prototype.computeStyle = /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    function (element, prop, defaultValue) {
        return defaultValue || '';
    };
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    MockAnimationDriver.prototype.animate = /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    function (element, keyframes, duration, delay, easing, previousPlayers) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        var /** @type {?} */ player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(/** @type {?} */ (player));
        return player;
    };
    MockAnimationDriver.log = [];
    return MockAnimationDriver;
}());
export { MockAnimationDriver };
function MockAnimationDriver_tsickle_Closure_declarations() {
    /** @type {?} */
    MockAnimationDriver.log;
}
/**
 * \@experimental Animation support is experimental.
 */
var /**
 * \@experimental Animation support is experimental.
 */
MockAnimationPlayer = /** @class */ (function (_super) {
    tslib_1.__extends(MockAnimationPlayer, _super);
    function MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers) {
        var _this = _super.call(this, duration, delay) || this;
        _this.element = element;
        _this.keyframes = keyframes;
        _this.duration = duration;
        _this.delay = delay;
        _this.easing = easing;
        _this.previousPlayers = previousPlayers;
        _this.__finished = false;
        _this.__started = false;
        _this.previousStyles = {};
        _this._onInitFns = [];
        _this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(function (player) {
                if (player instanceof MockAnimationPlayer) {
                    var /** @type {?} */ styles_1 = player.currentSnapshot;
                    Object.keys(styles_1).forEach(function (prop) { return _this.previousStyles[prop] = styles_1[prop]; });
                }
            });
        }
        return _this;
    }
    /* @internal */
    /**
     * @param {?} fn
     * @return {?}
     */
    MockAnimationPlayer.prototype.onInit = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) { this._onInitFns.push(fn); };
    /* @internal */
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.init = /**
     * @return {?}
     */
    function () {
        _super.prototype.init.call(this);
        this._onInitFns.forEach(function (fn) { return fn(); });
        this._onInitFns = [];
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.finish = /**
     * @return {?}
     */
    function () {
        _super.prototype.finish.call(this);
        this.__finished = true;
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.destroy = /**
     * @return {?}
     */
    function () {
        _super.prototype.destroy.call(this);
        this.__finished = true;
    };
    /* @internal */
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.triggerMicrotask = /**
     * @return {?}
     */
    function () { };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.play = /**
     * @return {?}
     */
    function () {
        _super.prototype.play.call(this);
        this.__started = true;
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.hasStarted = /**
     * @return {?}
     */
    function () { return this.__started; };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.beforeDestroy = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ captures = {};
        Object.keys(this.previousStyles).forEach(function (prop) {
            captures[prop] = _this.previousStyles[prop];
        });
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach(function (kf) {
                Object.keys(kf).forEach(function (prop) {
                    if (prop != 'offset') {
                        captures[prop] = _this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                });
            });
        }
        this.currentSnapshot = captures;
    };
    return MockAnimationPlayer;
}(NoopAnimationPlayer));
/**
 * \@experimental Animation support is experimental.
 */
export { MockAnimationPlayer };
function MockAnimationPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    MockAnimationPlayer.prototype.__finished;
    /** @type {?} */
    MockAnimationPlayer.prototype.__started;
    /** @type {?} */
    MockAnimationPlayer.prototype.previousStyles;
    /** @type {?} */
    MockAnimationPlayer.prototype._onInitFns;
    /** @type {?} */
    MockAnimationPlayer.prototype.currentSnapshot;
    /** @type {?} */
    MockAnimationPlayer.prototype.element;
    /** @type {?} */
    MockAnimationPlayer.prototype.keyframes;
    /** @type {?} */
    MockAnimationPlayer.prototype.duration;
    /** @type {?} */
    MockAnimationPlayer.prototype.delay;
    /** @type {?} */
    MockAnimationPlayer.prototype.easing;
    /** @type {?} */
    MockAnimationPlayer.prototype.previousPlayers;
}
//# sourceMappingURL=mock_animation_driver.js.map