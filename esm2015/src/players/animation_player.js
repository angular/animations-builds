/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
 * @record
 */
export function AnimationPlayer() { }
/**
 * Provides a callback to invoke when the animation finishes.
 * \@param fn The callback function.
 * @see `finish()`
 * @type {?}
 */
AnimationPlayer.prototype.onDone;
/**
 * Provides a callback to invoke when the animation starts.
 * \@param fn The callback function.
 * @see `run()`
 * @type {?}
 */
AnimationPlayer.prototype.onStart;
/**
 * Provides a callback to invoke after the animation is destroyed.
 * \@param fn The callback function.
 * @see `destroy()`
 * @see `beforeDestroy()`
 * @type {?}
 */
AnimationPlayer.prototype.onDestroy;
/**
 * Initializes the animation.
 * @type {?}
 */
AnimationPlayer.prototype.init;
/**
 * Reports whether the animation has started.
 * \@return True if the animation has started, false otherwise.
 * @type {?}
 */
AnimationPlayer.prototype.hasStarted;
/**
 * Runs the animation, invoking the `onStart()` callback.
 * @type {?}
 */
AnimationPlayer.prototype.play;
/**
 * Pauses the animation.
 * @type {?}
 */
AnimationPlayer.prototype.pause;
/**
 * Restarts the paused animation.
 * @type {?}
 */
AnimationPlayer.prototype.restart;
/**
 * Ends the animation, invoking the `onDone()` callback.
 * @type {?}
 */
AnimationPlayer.prototype.finish;
/**
 * Destroys the animation, after invoking the `beforeDestroy()` callback.
 * Calls the `onDestroy()` callback when destruction is completed.
 * @type {?}
 */
AnimationPlayer.prototype.destroy;
/**
 * Resets the animation to its initial state.
 * @type {?}
 */
AnimationPlayer.prototype.reset;
/**
 * Sets the position of the animation.
 * \@param position A 0-based offset into the duration, in milliseconds.
 * @type {?}
 */
AnimationPlayer.prototype.setPosition;
/**
 * Reports the current position of the animation.
 * \@return A 0-based offset into the duration, in milliseconds.
 * @type {?}
 */
AnimationPlayer.prototype.getPosition;
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
 * An empty programmatic controller for reusable animations.
 * Used internally when animations are disabled, to avoid
 * checking for the null case when an animation player is expected.
 *
 * @see `animate()`
 * @see `AnimationPlayer`
 * @see `GroupPlayer`
 *
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0RzFDLE1BQU0sT0FBTyxtQkFBbUI7Ozs7O0lBUzlCLFlBQVksV0FBbUIsQ0FBQyxFQUFFLFFBQWdCLENBQUM7MEJBUmxCLEVBQUU7MkJBQ0QsRUFBRTs2QkFDQSxFQUFFO3dCQUNuQixLQUFLOzBCQUNILEtBQUs7eUJBQ04sS0FBSzs0QkFDbUIsSUFBSTtRQUVPLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztLQUFFOzs7O0lBQ25GLFNBQVM7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDdEI7Ozs7OztJQUVILE9BQU8sQ0FBQyxFQUFjLElBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTs7Ozs7SUFDNUQsTUFBTSxDQUFDLEVBQWMsSUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFOzs7OztJQUMxRCxTQUFTLENBQUMsRUFBYyxJQUFVLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFDaEUsVUFBVSxLQUFjLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzs7O0lBQy9DLElBQUksTUFBVzs7OztJQUNmLElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ3RCOzs7OztJQUdELGdCQUFnQixLQUFLLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFFekQsUUFBUTtRQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7Ozs7SUFHeEIsS0FBSyxNQUFXOzs7O0lBQ2hCLE9BQU8sTUFBVzs7OztJQUNsQixNQUFNLEtBQVcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUU7Ozs7SUFDcEMsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN6QjtLQUNGOzs7O0lBQ0QsS0FBSyxNQUFXOzs7OztJQUNoQixXQUFXLENBQUMsUUFBZ0IsS0FBVTs7OztJQUN0QyxXQUFXLEtBQWEsT0FBTyxDQUFDLENBQUMsRUFBRTs7Ozs7O0lBR25DLGVBQWUsQ0FBQyxTQUFpQjs7UUFDL0IsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztLQUNwQjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogUHJvdmlkZXMgcHJvZ3JhbW1hdGljIGNvbnRyb2wgb2YgYSByZXVzYWJsZSBhbmltYXRpb24gc2VxdWVuY2UsXG4gKiBidWlsdCB1c2luZyB0aGUgYGJ1aWxkKClgIG1ldGhvZCBvZiBgQW5pbWF0aW9uQnVpbGRlcmAuIFRoZSBgYnVpbGQoKWAgbWV0aG9kXG4gKiByZXR1cm5zIGEgZmFjdG9yeSwgd2hvc2UgYGNyZWF0ZSgpYCBtZXRob2QgaW5zdGFudGlhdGVzIGFuZCBpbml0aWFsaXplcyB0aGlzIGludGVyZmFjZS5cbiAqXG4gKiBAc2VlIGBBbmltYXRpb25CdWlsZGVyYFxuICogQHNlZSBgQW5pbWF0aW9uRmFjdG9yeWBcbiAqIEBzZWUgYGFuaW1hdGUoKWAgXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblBsYXllciB7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIHRoZSBhbmltYXRpb24gZmluaXNoZXMuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqIEBzZWUgYGZpbmlzaCgpYFxuICAgKi9cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdoZW4gdGhlIGFuaW1hdGlvbiBzdGFydHMuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqIEBzZWUgYHJ1bigpYFxuICAgKi9cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSBhZnRlciB0aGUgYW5pbWF0aW9uIGlzIGRlc3Ryb3llZC5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHNlZSBgZGVzdHJveSgpYFxuICAgKiBAc2VlIGBiZWZvcmVEZXN0cm95KClgXG4gICAqL1xuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFuaW1hdGlvbi5cbiAgICovXG4gIGluaXQoKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGUgYW5pbWF0aW9uIGhhcyBzdGFydGVkLlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBhbmltYXRpb24gaGFzIHN0YXJ0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGFuaW1hdGlvbiwgaW52b2tpbmcgdGhlIGBvblN0YXJ0KClgIGNhbGxiYWNrLlxuICAgKi9cbiAgcGxheSgpOiB2b2lkO1xuICAvKipcbiAgICogUGF1c2VzIHRoZSBhbmltYXRpb24uXG4gICAqL1xuICBwYXVzZSgpOiB2b2lkO1xuICAvKipcbiAgICogUmVzdGFydHMgdGhlIHBhdXNlZCBhbmltYXRpb24uXG4gICAqL1xuICByZXN0YXJ0KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBFbmRzIHRoZSBhbmltYXRpb24sIGludm9raW5nIHRoZSBgb25Eb25lKClgIGNhbGxiYWNrLlxuICAgKi9cbiAgZmluaXNoKCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgYW5pbWF0aW9uLCBhZnRlciBpbnZva2luZyB0aGUgYGJlZm9yZURlc3Ryb3koKWAgY2FsbGJhY2suXG4gICAqIENhbGxzIHRoZSBgb25EZXN0cm95KClgIGNhbGxiYWNrIHdoZW4gZGVzdHJ1Y3Rpb24gaXMgY29tcGxldGVkLlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkO1xuICAvKipcbiAgICogUmVzZXRzIHRoZSBhbmltYXRpb24gdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gICAqL1xuICByZXNldCgpOiB2b2lkO1xuICAvKipcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgMC1iYXNlZCBvZmZzZXQgaW50byB0aGUgZHVyYXRpb24sIGluIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIHNldFBvc2l0aW9uKHBvc2l0aW9uOiBhbnkgLyoqIFRPRE8gIzkxMDAgKi8pOiB2b2lkO1xuICAvKipcbiAgICogUmVwb3J0cyB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uLlxuICAgKiBAcmV0dXJucyBBIDAtYmFzZWQgb2Zmc2V0IGludG8gdGhlIGR1cmF0aW9uLCBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBnZXRQb3NpdGlvbigpOiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgcGFyZW50IG9mIHRoaXMgcGxheWVyLCBpZiBhbnkuXG4gICAqL1xuICBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsO1xuICAvKipcbiAgICogVGhlIHRvdGFsIHJ1biB0aW1lIG9mIHRoZSBhbmltYXRpb24sIGluIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyO1xuICAvKipcbiAgICogUHJvdmlkZXMgYSBjYWxsYmFjayB0byBpbnZva2UgYmVmb3JlIHRoZSBhbmltYXRpb24gaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgYmVmb3JlRGVzdHJveT86ICgpID0+IGFueTtcbiAgLyoqIEBpbnRlcm5hbFxuICAgKiBJbnRlcm5hbFxuICAgKi9cbiAgdHJpZ2dlckNhbGxiYWNrPzogKHBoYXNlTmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiogQGludGVybmFsXG4gICAqIEludGVybmFsXG4gICAqL1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQW4gZW1wdHkgcHJvZ3JhbW1hdGljIGNvbnRyb2xsZXIgZm9yIHJldXNhYmxlIGFuaW1hdGlvbnMuXG4gKiBVc2VkIGludGVybmFsbHkgd2hlbiBhbmltYXRpb25zIGFyZSBkaXNhYmxlZCwgdG8gYXZvaWRcbiAqIGNoZWNraW5nIGZvciB0aGUgbnVsbCBjYXNlIHdoZW4gYW4gYW5pbWF0aW9uIHBsYXllciBpcyBleHBlY3RlZC5cbiAqXG4gKiBAc2VlIGBhbmltYXRlKClgXG4gKiBAc2VlIGBBbmltYXRpb25QbGF5ZXJgXG4gKiBAc2VlIGBHcm91cFBsYXllcmBcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBOb29wQW5pbWF0aW9uUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsID0gbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihkdXJhdGlvbjogbnVtYmVyID0gMCwgZGVsYXk6IG51bWJlciA9IDApIHsgdGhpcy50b3RhbFRpbWUgPSBkdXJhdGlvbiArIGRlbGF5OyB9XG4gIHByaXZhdGUgX29uRmluaXNoKCkge1xuICAgIGlmICghdGhpcy5fZmluaXNoZWQpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25Eb25lRm5zID0gW107XG4gICAgfVxuICB9XG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25TdGFydEZucy5wdXNoKGZuKTsgfVxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pOyB9XG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRlc3Ryb3lGbnMucHVzaChmbik7IH1cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7IH1cbiAgaW5pdCgpOiB2b2lkIHt9XG4gIHBsYXkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgdGhpcy50cmlnZ2VyTWljcm90YXNrKCk7XG4gICAgfVxuICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyTWljcm90YXNrKCkgeyBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTsgfVxuXG4gIHByaXZhdGUgX29uU3RhcnQoKSB7XG4gICAgdGhpcy5fb25TdGFydEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge31cbiAgcmVzdGFydCgpOiB2b2lkIHt9XG4gIGZpbmlzaCgpOiB2b2lkIHsgdGhpcy5fb25GaW5pc2goKTsgfVxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpbmlzaCgpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgICB9XG4gIH1cbiAgcmVzZXQoKTogdm9pZCB7fVxuICBzZXRQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7fVxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMDsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=