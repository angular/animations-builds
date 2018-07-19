/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
/**
 * \@internal
 * @type {?|undefined}
 */
AnimationPlayer.prototype.triggerCallback;
/**
 * \@internal
 * @type {?|undefined}
 */
AnimationPlayer.prototype.disabled;
/**
 * \@experimental Animation support is experimental.
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
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUMxQyxNQUFNOzs7OztJQVNKLFlBQVksV0FBbUIsQ0FBQyxFQUFFLFFBQWdCLENBQUM7MEJBUmxCLEVBQUU7MkJBQ0QsRUFBRTs2QkFDQSxFQUFFO3dCQUNuQixLQUFLOzBCQUNILEtBQUs7eUJBQ04sS0FBSzs0QkFDbUIsSUFBSTtRQUVPLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztLQUFFOzs7O0lBQ25GLFNBQVM7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDdEI7Ozs7OztJQUVILE9BQU8sQ0FBQyxFQUFjLElBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTs7Ozs7SUFDNUQsTUFBTSxDQUFDLEVBQWMsSUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFOzs7OztJQUMxRCxTQUFTLENBQUMsRUFBYyxJQUFVLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFDaEUsVUFBVSxLQUFjLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzs7O0lBQy9DLElBQUksTUFBVzs7OztJQUNmLElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ3RCOzs7OztJQUdELGdCQUFnQixLQUFLLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFFekQsUUFBUTtRQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7Ozs7SUFHeEIsS0FBSyxNQUFXOzs7O0lBQ2hCLE9BQU8sTUFBVzs7OztJQUNsQixNQUFNLEtBQVcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUU7Ozs7SUFDcEMsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN6QjtLQUNGOzs7O0lBQ0QsS0FBSyxNQUFXOzs7OztJQUNoQixXQUFXLENBQUMsQ0FBUyxLQUFVOzs7O0lBQy9CLFdBQVcsS0FBYSxPQUFPLENBQUMsQ0FBQyxFQUFFOzs7Ozs7SUFHbkMsZUFBZSxDQUFDLFNBQWlCOztRQUMvQixNQUFNLE9BQU8sR0FBRyxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3NjaGVkdWxlTWljcm9UYXNrfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBBbmltYXRpb25QbGF5ZXIgY29udHJvbHMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlIHRoYXQgd2FzIHByb2R1Y2VkIGZyb20gYSBwcm9ncmFtbWF0aWMgYW5pbWF0aW9uLlxuICogKHNlZSB7QGxpbmsgQW5pbWF0aW9uQnVpbGRlciBBbmltYXRpb25CdWlsZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdG8gY3JlYXRlIHByb2dyYW1tYXRpY1xuICogYW5pbWF0aW9ucy4pXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUGxheWVyIHtcbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIGluaXQoKTogdm9pZDtcbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuO1xuICBwbGF5KCk6IHZvaWQ7XG4gIHBhdXNlKCk6IHZvaWQ7XG4gIHJlc3RhcnQoKTogdm9pZDtcbiAgZmluaXNoKCk6IHZvaWQ7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgcmVzZXQoKTogdm9pZDtcbiAgc2V0UG9zaXRpb24ocDogYW55IC8qKiBUT0RPICM5MTAwICovKTogdm9pZDtcbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyO1xuICBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsO1xuICByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgYmVmb3JlRGVzdHJveT86ICgpID0+IGFueTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2s/OiAocGhhc2VOYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICBwcml2YXRlIF9maW5pc2hlZCA9IGZhbHNlO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoZHVyYXRpb246IG51bWJlciA9IDAsIGRlbGF5OiBudW1iZXIgPSAwKSB7IHRoaXMudG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTsgfVxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG4gIGluaXQoKTogdm9pZCB7fVxuICBwbGF5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck1pY3JvdGFzaygpO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHsgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4gdGhpcy5fb25GaW5pc2goKSk7IH1cblxuICBwcml2YXRlIF9vblN0YXJ0KCkge1xuICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zID0gW107XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHt9XG4gIHJlc3RhcnQoKTogdm9pZCB7fVxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX29uRmluaXNoKCk7IH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5maW5pc2goKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zID0gW107XG4gICAgfVxuICB9XG4gIHJlc2V0KCk6IHZvaWQge31cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7fVxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMDsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=