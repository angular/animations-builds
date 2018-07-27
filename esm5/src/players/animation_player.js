/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { scheduleMicroTask } from '../util';
/**
 * @experimental Animation support is experimental.
 */
var NoopAnimationPlayer = /** @class */ (function () {
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
    NoopAnimationPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    NoopAnimationPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    NoopAnimationPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    NoopAnimationPlayer.prototype.onDestroy = function (fn) { this._onDestroyFns.push(fn); };
    NoopAnimationPlayer.prototype.hasStarted = function () { return this._started; };
    NoopAnimationPlayer.prototype.init = function () { };
    NoopAnimationPlayer.prototype.play = function () {
        if (!this.hasStarted()) {
            this._onStart();
            this.triggerMicrotask();
        }
        this._started = true;
    };
    /** @internal */
    NoopAnimationPlayer.prototype.triggerMicrotask = function () {
        var _this = this;
        scheduleMicroTask(function () { return _this._onFinish(); });
    };
    NoopAnimationPlayer.prototype._onStart = function () {
        this._onStartFns.forEach(function (fn) { return fn(); });
        this._onStartFns = [];
    };
    NoopAnimationPlayer.prototype.pause = function () { };
    NoopAnimationPlayer.prototype.restart = function () { };
    NoopAnimationPlayer.prototype.finish = function () { this._onFinish(); };
    NoopAnimationPlayer.prototype.destroy = function () {
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
    NoopAnimationPlayer.prototype.reset = function () { };
    NoopAnimationPlayer.prototype.setPosition = function (p) { };
    NoopAnimationPlayer.prototype.getPosition = function () { return 0; };
    /** @internal */
    NoopAnimationPlayer.prototype.triggerCallback = function (phaseName) {
        var methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return NoopAnimationPlayer;
}());
export { NoopAnimationPlayer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFnQzFDOztHQUVHO0FBQ0g7SUFTRSw2QkFBWSxRQUFvQixFQUFFLEtBQWlCO1FBQXZDLHlCQUFBLEVBQUEsWUFBb0I7UUFBRSxzQkFBQSxFQUFBLFNBQWlCO1FBUjNDLGVBQVUsR0FBZSxFQUFFLENBQUM7UUFDNUIsZ0JBQVcsR0FBZSxFQUFFLENBQUM7UUFDN0Isa0JBQWEsR0FBZSxFQUFFLENBQUM7UUFDL0IsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbkIsaUJBQVksR0FBeUIsSUFBSSxDQUFDO1FBRU0sSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQUMsQ0FBQztJQUNuRix1Q0FBUyxHQUFqQjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBQ0QscUNBQU8sR0FBUCxVQUFRLEVBQWMsSUFBVSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsb0NBQU0sR0FBTixVQUFPLEVBQWMsSUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsdUNBQVMsR0FBVCxVQUFVLEVBQWMsSUFBVSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsd0NBQVUsR0FBVixjQUF3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQy9DLGtDQUFJLEdBQUosY0FBYyxDQUFDO0lBQ2Ysa0NBQUksR0FBSjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVELGdCQUFnQjtJQUNoQiw4Q0FBZ0IsR0FBaEI7UUFBQSxpQkFBaUU7UUFBNUMsaUJBQWlCLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxTQUFTLEVBQUUsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUV6RCxzQ0FBUSxHQUFoQjtRQUNFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELG1DQUFLLEdBQUwsY0FBZSxDQUFDO0lBQ2hCLHFDQUFPLEdBQVAsY0FBaUIsQ0FBQztJQUNsQixvQ0FBTSxHQUFOLGNBQWlCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMscUNBQU8sR0FBUDtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBQ0QsbUNBQUssR0FBTCxjQUFlLENBQUM7SUFDaEIseUNBQVcsR0FBWCxVQUFZLENBQVMsSUFBUyxDQUFDO0lBQy9CLHlDQUFXLEdBQVgsY0FBd0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5DLGdCQUFnQjtJQUNoQiw2Q0FBZSxHQUFmLFVBQWdCLFNBQWlCO1FBQy9CLElBQU0sT0FBTyxHQUFHLFNBQVMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDMUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFDSCwwQkFBQztBQUFELENBQUMsQUE5REQsSUE4REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3NjaGVkdWxlTWljcm9UYXNrfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBBbmltYXRpb25QbGF5ZXIgY29udHJvbHMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlIHRoYXQgd2FzIHByb2R1Y2VkIGZyb20gYSBwcm9ncmFtbWF0aWMgYW5pbWF0aW9uLlxuICogKHNlZSB7QGxpbmsgQW5pbWF0aW9uQnVpbGRlciBBbmltYXRpb25CdWlsZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdG8gY3JlYXRlIHByb2dyYW1tYXRpY1xuICogYW5pbWF0aW9ucy4pXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUGxheWVyIHtcbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIGluaXQoKTogdm9pZDtcbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuO1xuICBwbGF5KCk6IHZvaWQ7XG4gIHBhdXNlKCk6IHZvaWQ7XG4gIHJlc3RhcnQoKTogdm9pZDtcbiAgZmluaXNoKCk6IHZvaWQ7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgcmVzZXQoKTogdm9pZDtcbiAgc2V0UG9zaXRpb24ocDogYW55IC8qKiBUT0RPICM5MTAwICovKTogdm9pZDtcbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyO1xuICBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsO1xuICByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgYmVmb3JlRGVzdHJveT86ICgpID0+IGFueTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2s/OiAocGhhc2VOYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICBwcml2YXRlIF9maW5pc2hlZCA9IGZhbHNlO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoZHVyYXRpb246IG51bWJlciA9IDAsIGRlbGF5OiBudW1iZXIgPSAwKSB7IHRoaXMudG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTsgfVxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG4gIGluaXQoKTogdm9pZCB7fVxuICBwbGF5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck1pY3JvdGFzaygpO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHsgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4gdGhpcy5fb25GaW5pc2goKSk7IH1cblxuICBwcml2YXRlIF9vblN0YXJ0KCkge1xuICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zID0gW107XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHt9XG4gIHJlc3RhcnQoKTogdm9pZCB7fVxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX29uRmluaXNoKCk7IH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5maW5pc2goKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zID0gW107XG4gICAgfVxuICB9XG4gIHJlc2V0KCk6IHZvaWQge31cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7fVxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMDsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=