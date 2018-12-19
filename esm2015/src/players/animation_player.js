/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { scheduleMicroTask } from '../util';
/**
 * Provides programmatic control of a reusable animation sequence,
 * built using the `build()` method of `AnimationBuilder`. The `build()` method
 * returns a factory, whose `create()` method instantiates and initializes this interface.
 *
 * @see `AnimationBuilder`
 * @see `AnimationFactory`
 * @see `animate()`
 *
 * \@publicApi
 * @record
 */
export function AnimationPlayer() { }
if (false) {
    /**
     * The parent of this player, if any.
     * @type {?}
     */
    AnimationPlayer.prototype.parentPlayer;
    /**
     * The total run time of the animation, in milliseconds.
     * @type {?}
     */
    AnimationPlayer.prototype.totalTime;
    /**
     * Provides a callback to invoke before the animation is destroyed.
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.beforeDestroy;
    /**
     * \@internal
     * Internal
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.triggerCallback;
    /**
     * \@internal
     * Internal
     * @type {?|undefined}
     */
    AnimationPlayer.prototype.disabled;
    /**
     * Provides a callback to invoke when the animation finishes.
     * @see `finish()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onDone = function (fn) { };
    /**
     * Provides a callback to invoke when the animation starts.
     * @see `run()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onStart = function (fn) { };
    /**
     * Provides a callback to invoke after the animation is destroyed.
     * @see `destroy()` / `beforeDestroy()`
     * @param {?} fn The callback function.
     * @return {?}
     */
    AnimationPlayer.prototype.onDestroy = function (fn) { };
    /**
     * Initializes the animation.
     * @return {?}
     */
    AnimationPlayer.prototype.init = function () { };
    /**
     * Reports whether the animation has started.
     * @return {?} True if the animation has started, false otherwise.
     */
    AnimationPlayer.prototype.hasStarted = function () { };
    /**
     * Runs the animation, invoking the `onStart()` callback.
     * @return {?}
     */
    AnimationPlayer.prototype.play = function () { };
    /**
     * Pauses the animation.
     * @return {?}
     */
    AnimationPlayer.prototype.pause = function () { };
    /**
     * Restarts the paused animation.
     * @return {?}
     */
    AnimationPlayer.prototype.restart = function () { };
    /**
     * Ends the animation, invoking the `onDone()` callback.
     * @return {?}
     */
    AnimationPlayer.prototype.finish = function () { };
    /**
     * Destroys the animation, after invoking the `beforeDestroy()` callback.
     * Calls the `onDestroy()` callback when destruction is completed.
     * @return {?}
     */
    AnimationPlayer.prototype.destroy = function () { };
    /**
     * Resets the animation to its initial state.
     * @return {?}
     */
    AnimationPlayer.prototype.reset = function () { };
    /**
     * Sets the position of the animation.
     * @param {?} position A 0-based offset into the duration, in milliseconds.
     * @return {?}
     */
    AnimationPlayer.prototype.setPosition = function (position) { };
    /**
     * Reports the current position of the animation.
     * @return {?} A 0-based offset into the duration, in milliseconds.
     */
    AnimationPlayer.prototype.getPosition = function () { };
}
/**
 * An empty programmatic controller for reusable animations.
 * Used internally when animations are disabled, to avoid
 * checking for the null case when an animation player is expected.
 *
 * @see `animate()`
 * @see `AnimationPlayer`
 * @see `GroupPlayer`
 *
 * \@publicApi
 */
export class NoopAnimationPlayer {
    /**
     * @param {?=} duration
     * @param {?=} delay
     */
    constructor(duration = 0, delay = 0) {
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
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(fn => fn());
            this._onDoneFns = [];
        }
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
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    init() { }
    /**
     * @return {?}
     */
    play() {
        if (!this.hasStarted()) {
            this._onStart();
            this.triggerMicrotask();
        }
        this._started = true;
    }
    /**
     * \@internal
     * @return {?}
     */
    triggerMicrotask() { scheduleMicroTask(() => this._onFinish()); }
    /**
     * @return {?}
     */
    _onStart() {
        this._onStartFns.forEach(fn => fn());
        this._onStartFns = [];
    }
    /**
     * @return {?}
     */
    pause() { }
    /**
     * @return {?}
     */
    restart() { }
    /**
     * @return {?}
     */
    finish() { this._onFinish(); }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            if (!this.hasStarted()) {
                this._onStart();
            }
            this.finish();
            this._onDestroyFns.forEach(fn => fn());
            this._onDestroyFns = [];
        }
    }
    /**
     * @return {?}
     */
    reset() { }
    /**
     * @param {?} position
     * @return {?}
     */
    setPosition(position) { }
    /**
     * @return {?}
     */
    getPosition() { return 0; }
    /**
     * \@internal
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        /** @type {?} */
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(fn => fn());
        methods.length = 0;
    }
}
if (false) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFNBQVMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWExQyxxQ0FvRkM7Ozs7OztJQWpCQyx1Q0FBbUM7Ozs7O0lBSW5DLG9DQUEyQjs7Ozs7SUFJM0Isd0NBQTBCOzs7Ozs7SUFJMUIsMENBQThDOzs7Ozs7SUFJOUMsbUNBQW1COzs7Ozs7O0lBN0VuQixxREFBNkI7Ozs7Ozs7SUFNN0Isc0RBQThCOzs7Ozs7O0lBTzlCLHdEQUFnQzs7Ozs7SUFJaEMsaURBQWE7Ozs7O0lBS2IsdURBQXNCOzs7OztJQUl0QixpREFBYTs7Ozs7SUFJYixrREFBYzs7Ozs7SUFJZCxvREFBZ0I7Ozs7O0lBSWhCLG1EQUFlOzs7Ozs7SUFLZixvREFBZ0I7Ozs7O0lBSWhCLGtEQUFjOzs7Ozs7SUFLZCxnRUFBbUQ7Ozs7O0lBS25ELHdEQUFzQjs7Ozs7Ozs7Ozs7OztBQWtDeEIsTUFBTSxPQUFPLG1CQUFtQjs7Ozs7SUFTOUIsWUFBWSxXQUFtQixDQUFDLEVBQUUsUUFBZ0IsQ0FBQztRQVIzQyxlQUFVLEdBQWUsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQWUsRUFBRSxDQUFDO1FBQzdCLGtCQUFhLEdBQWUsRUFBRSxDQUFDO1FBQy9CLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGlCQUFZLEdBQXlCLElBQUksQ0FBQztRQUVNLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUFDLENBQUM7Ozs7SUFDbkYsU0FBUztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FB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bGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogUHJvdmlkZXMgcHJvZ3JhbW1hdGljIGNvbnRyb2wgb2YgYSByZXVzYWJsZSBhbmltYXRpb24gc2VxdWVuY2UsXG4gKiBidWlsdCB1c2luZyB0aGUgYGJ1aWxkKClgIG1ldGhvZCBvZiBgQW5pbWF0aW9uQnVpbGRlcmAuIFRoZSBgYnVpbGQoKWAgbWV0aG9kXG4gKiByZXR1cm5zIGEgZmFjdG9yeSwgd2hvc2UgYGNyZWF0ZSgpYCBtZXRob2QgaW5zdGFudGlhdGVzIGFuZCBpbml0aWFsaXplcyB0aGlzIGludGVyZmFjZS5cbiAqXG4gKiBAc2VlIGBBbmltYXRpb25CdWlsZGVyYFxuICogQHNlZSBgQW5pbWF0aW9uRmFjdG9yeWBcbiAqIEBzZWUgYGFuaW1hdGUoKWBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUGxheWVyIHtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdoZW4gdGhlIGFuaW1hdGlvbiBmaW5pc2hlcy5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHNlZSBgZmluaXNoKClgXG4gICAqL1xuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdmlkZXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2hlbiB0aGUgYW5pbWF0aW9uIHN0YXJ0cy5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHNlZSBgcnVuKClgXG4gICAqL1xuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgY2FsbGJhY2sgdG8gaW52b2tlIGFmdGVyIHRoZSBhbmltYXRpb24gaXMgZGVzdHJveWVkLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAc2VlIGBkZXN0cm95KClgXG4gICAqIEBzZWUgYGJlZm9yZURlc3Ryb3koKWBcbiAgICovXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYW5pbWF0aW9uLlxuICAgKi9cbiAgaW5pdCgpOiB2b2lkO1xuICAvKipcbiAgICogUmVwb3J0cyB3aGV0aGVyIHRoZSBhbmltYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGFuaW1hdGlvbiBoYXMgc3RhcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuO1xuICAvKipcbiAgICogUnVucyB0aGUgYW5pbWF0aW9uLCBpbnZva2luZyB0aGUgYG9uU3RhcnQoKWAgY2FsbGJhY2suXG4gICAqL1xuICBwbGF5KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBQYXVzZXMgdGhlIGFuaW1hdGlvbi5cbiAgICovXG4gIHBhdXNlKCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBSZXN0YXJ0cyB0aGUgcGF1c2VkIGFuaW1hdGlvbi5cbiAgICovXG4gIHJlc3RhcnQoKTogdm9pZDtcbiAgLyoqXG4gICAqIEVuZHMgdGhlIGFuaW1hdGlvbiwgaW52b2tpbmcgdGhlIGBvbkRvbmUoKWAgY2FsbGJhY2suXG4gICAqL1xuICBmaW5pc2goKTogdm9pZDtcbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBhbmltYXRpb24sIGFmdGVyIGludm9raW5nIHRoZSBgYmVmb3JlRGVzdHJveSgpYCBjYWxsYmFjay5cbiAgICogQ2FsbHMgdGhlIGBvbkRlc3Ryb3koKWAgY2FsbGJhY2sgd2hlbiBkZXN0cnVjdGlvbiBpcyBjb21wbGV0ZWQuXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGFuaW1hdGlvbiB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAgICovXG4gIHJlc2V0KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gQSAwLWJhc2VkIG9mZnNldCBpbnRvIHRoZSBkdXJhdGlvbiwgaW4gbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgc2V0UG9zaXRpb24ocG9zaXRpb246IGFueSAvKiogVE9ETyAjOTEwMCAqLyk6IHZvaWQ7XG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBhbmltYXRpb24uXG4gICAqIEByZXR1cm5zIEEgMC1iYXNlZCBvZmZzZXQgaW50byB0aGUgZHVyYXRpb24sIGluIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgb2YgdGhpcyBwbGF5ZXIsIGlmIGFueS5cbiAgICovXG4gIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGw7XG4gIC8qKlxuICAgKiBUaGUgdG90YWwgcnVuIHRpbWUgb2YgdGhlIGFuaW1hdGlvbiwgaW4gbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXI7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSBiZWZvcmUgdGhlIGFuaW1hdGlvbiBpcyBkZXN0cm95ZWQuXG4gICAqL1xuICBiZWZvcmVEZXN0cm95PzogKCkgPT4gYW55O1xuICAvKiogQGludGVybmFsXG4gICAqIEludGVybmFsXG4gICAqL1xuICB0cmlnZ2VyQ2FsbGJhY2s/OiAocGhhc2VOYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWxcbiAgICogSW50ZXJuYWxcbiAgICovXG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBbiBlbXB0eSBwcm9ncmFtbWF0aWMgY29udHJvbGxlciBmb3IgcmV1c2FibGUgYW5pbWF0aW9ucy5cbiAqIFVzZWQgaW50ZXJuYWxseSB3aGVuIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLCB0byBhdm9pZFxuICogY2hlY2tpbmcgZm9yIHRoZSBudWxsIGNhc2Ugd2hlbiBhbiBhbmltYXRpb24gcGxheWVyIGlzIGV4cGVjdGVkLlxuICpcbiAqIEBzZWUgYGFuaW1hdGUoKWBcbiAqIEBzZWUgYEFuaW1hdGlvblBsYXllcmBcbiAqIEBzZWUgYEdyb3VwUGxheWVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5vb3BBbmltYXRpb25QbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9vbkRvbmVGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25TdGFydEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vbkRlc3Ryb3lGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwdWJsaWMgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGR1cmF0aW9uOiBudW1iZXIgPSAwLCBkZWxheTogbnVtYmVyID0gMCkgeyB0aGlzLnRvdGFsVGltZSA9IGR1cmF0aW9uICsgZGVsYXk7IH1cbiAgcHJpdmF0ZSBfb25GaW5pc2goKSB7XG4gICAgaWYgKCF0aGlzLl9maW5pc2hlZCkge1xuICAgICAgdGhpcy5fZmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fb25Eb25lRm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMgPSBbXTtcbiAgICB9XG4gIH1cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vblN0YXJ0Rm5zLnB1c2goZm4pOyB9XG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRvbmVGbnMucHVzaChmbik7IH1cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTsgfVxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RhcnRlZDsgfVxuICBpbml0KCk6IHZvaWQge31cbiAgcGxheSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgICB0aGlzLnRyaWdnZXJNaWNyb3Rhc2soKTtcbiAgICB9XG4gICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7IHNjaGVkdWxlTWljcm9UYXNrKCgpID0+IHRoaXMuX29uRmluaXNoKCkpOyB9XG5cbiAgcHJpdmF0ZSBfb25TdGFydCgpIHtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7fVxuICByZXN0YXJ0KCk6IHZvaWQge31cbiAgZmluaXNoKCk6IHZvaWQgeyB0aGlzLl9vbkZpbmlzaCgpOyB9XG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZmluaXNoKCk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICByZXNldCgpOiB2b2lkIHt9XG4gIHNldFBvc2l0aW9uKHBvc2l0aW9uOiBudW1iZXIpOiB2b2lkIHt9XG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7IHJldHVybiAwOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXRob2RzID0gcGhhc2VOYW1lID09ICdzdGFydCcgPyB0aGlzLl9vblN0YXJ0Rm5zIDogdGhpcy5fb25Eb25lRm5zO1xuICAgIG1ldGhvZHMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICBtZXRob2RzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==