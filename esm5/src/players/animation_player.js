import { scheduleMicroTask } from '../util';
/**
 * @experimental Animation support is experimental.
 */
var /**
 * @experimental Animation support is experimental.
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
    /* @internal */
    /* @internal */
    NoopAnimationPlayer.prototype.triggerMicrotask = /* @internal */
    function () {
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
    NoopAnimationPlayer.prototype.setPosition = function (position) { };
    NoopAnimationPlayer.prototype.getPosition = function () { return 0; };
    /* @internal */
    /* @internal */
    NoopAnimationPlayer.prototype.triggerCallback = /* @internal */
    function (phaseName) {
        var methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return NoopAnimationPlayer;
}());
/**
 * @experimental Animation support is experimental.
 */
export { NoopAnimationPlayer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7QUFtQzFDOzs7QUFBQTtJQVNFLDZCQUFZLFFBQW9CLEVBQUUsS0FBaUI7UUFBdkMseUJBQUEsRUFBQSxZQUFvQjtRQUFFLHNCQUFBLEVBQUEsU0FBaUI7MEJBUmxCLEVBQUU7MkJBQ0QsRUFBRTs2QkFDQSxFQUFFO3dCQUNuQixLQUFLOzBCQUNILEtBQUs7eUJBQ04sS0FBSzs0QkFDbUIsSUFBSTtRQUVPLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztLQUFFO0lBQ25GLHVDQUFTLEdBQWpCO1FBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO0tBQ0Y7SUFDRCxxQ0FBTyxHQUFQLFVBQVEsRUFBYyxJQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDNUQsb0NBQU0sR0FBTixVQUFPLEVBQWMsSUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQzFELHVDQUFTLEdBQVQsVUFBVSxFQUFjLElBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtJQUNoRSx3Q0FBVSxHQUFWLGNBQXdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDL0Msa0NBQUksR0FBSixlQUFlO0lBQ2Ysa0NBQUksR0FBSjtRQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztLQUN0QjtJQUVELGVBQWU7O0lBQ2YsOENBQWdCO0lBQWhCO1FBQUEsaUJBQWlFO1FBQTVDLGlCQUFpQixDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQztLQUFFO0lBRXpELHNDQUFRLEdBQWhCO1FBQ0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLEVBQUUsRUFBSixDQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztLQUN2QjtJQUVELG1DQUFLLEdBQUwsZUFBZ0I7SUFDaEIscUNBQU8sR0FBUCxlQUFrQjtJQUNsQixvQ0FBTSxHQUFOLGNBQWlCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3BDLHFDQUFPLEdBQVA7UUFDRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLEVBQUUsRUFBSixDQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN6QjtLQUNGO0lBQ0QsbUNBQUssR0FBTCxlQUFnQjtJQUNoQix5Q0FBVyxHQUFYLFVBQVksUUFBZ0IsS0FBVTtJQUN0Qyx5Q0FBVyxHQUFYLGNBQXdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUVuQyxlQUFlOztJQUNmLDZDQUFlO0lBQWYsVUFBZ0IsU0FBaUI7UUFDL0IsSUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDcEI7OEJBdkdIO0lBd0dDLENBQUE7Ozs7QUE5REQsK0JBOERDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogQW5pbWF0aW9uUGxheWVyIGNvbnRyb2xzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZSB0aGF0IHdhcyBwcm9kdWNlZCBmcm9tIGEgcHJvZ3JhbW1hdGljIGFuaW1hdGlvbi5cbiAqIChzZWUge0BsaW5rIEFuaW1hdGlvbkJ1aWxkZXIgQW5pbWF0aW9uQnVpbGRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIGNyZWF0ZSBwcm9ncmFtbWF0aWNcbiAqIGFuaW1hdGlvbnMuKVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblBsYXllciB7XG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQ7XG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICBpbml0KCk6IHZvaWQ7XG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbjtcbiAgcGxheSgpOiB2b2lkO1xuICBwYXVzZSgpOiB2b2lkO1xuICByZXN0YXJ0KCk6IHZvaWQ7XG4gIGZpbmlzaCgpOiB2b2lkO1xuICBkZXN0cm95KCk6IHZvaWQ7XG4gIHJlc2V0KCk6IHZvaWQ7XG4gIHNldFBvc2l0aW9uKHBvc2l0aW9uOiBudW1iZXIpOiB2b2lkO1xuICBnZXRQb3NpdGlvbigpOiBudW1iZXI7XG4gIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGw7XG4gIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyO1xuICBiZWZvcmVEZXN0cm95PzogKCkgPT4gYW55O1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrPzogKHBoYXNlTmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICBwcml2YXRlIF9maW5pc2hlZCA9IGZhbHNlO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXJ8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoZHVyYXRpb246IG51bWJlciA9IDAsIGRlbGF5OiBudW1iZXIgPSAwKSB7IHRoaXMudG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTsgfVxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG4gIGluaXQoKTogdm9pZCB7fVxuICBwbGF5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck1pY3JvdGFzaygpO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyTWljcm90YXNrKCkgeyBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTsgfVxuXG4gIHByaXZhdGUgX29uU3RhcnQoKSB7XG4gICAgdGhpcy5fb25TdGFydEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge31cbiAgcmVzdGFydCgpOiB2b2lkIHt9XG4gIGZpbmlzaCgpOiB2b2lkIHsgdGhpcy5fb25GaW5pc2goKTsgfVxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpbmlzaCgpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgICB9XG4gIH1cbiAgcmVzZXQoKTogdm9pZCB7fVxuICBzZXRQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7fVxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gMDsgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXRob2RzID0gcGhhc2VOYW1lID09ICdzdGFydCcgPyB0aGlzLl9vblN0YXJ0Rm5zIDogdGhpcy5fb25Eb25lRm5zO1xuICAgIG1ldGhvZHMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICBtZXRob2RzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==