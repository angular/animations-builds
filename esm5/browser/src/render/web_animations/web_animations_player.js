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
        this._duration = options['duration'];
        this._delay = options['delay'] || 0;
        this.time = this._duration + this._delay;
    }
    WebAnimationsPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    WebAnimationsPlayer.prototype.init = function () {
        this._buildPlayer();
        this._preparePlayerBeforeStart();
    };
    WebAnimationsPlayer.prototype._buildPlayer = function () {
        var _this = this;
        if (this._initialized)
            return;
        this._initialized = true;
        var keyframes = this.keyframes;
        this.domPlayer =
            this._triggerWebAnimation(this.element, keyframes, this.options);
        this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
        this.domPlayer.addEventListener('finish', function () { return _this._onFinish(); });
    };
    WebAnimationsPlayer.prototype._preparePlayerBeforeStart = function () {
        // this is required so that the player doesn't start to animate right away
        if (this._delay) {
            this._resetDomPlayerState();
        }
        else {
            this.domPlayer.pause();
        }
    };
    /** @internal */
    /** @internal */
    WebAnimationsPlayer.prototype._triggerWebAnimation = /** @internal */
    function (element, keyframes, options) {
        // jscompiler doesn't seem to know animate is a native property because it's not fully
        // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
        return element['animate'](keyframes, options);
    };
    WebAnimationsPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    WebAnimationsPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    WebAnimationsPlayer.prototype.onDestroy = function (fn) { this._onDestroyFns.push(fn); };
    WebAnimationsPlayer.prototype.play = function () {
        this._buildPlayer();
        if (!this.hasStarted()) {
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
            this._started = true;
        }
        this.domPlayer.play();
    };
    WebAnimationsPlayer.prototype.pause = function () {
        this.init();
        this.domPlayer.pause();
    };
    WebAnimationsPlayer.prototype.finish = function () {
        this.init();
        this._onFinish();
        this.domPlayer.finish();
    };
    WebAnimationsPlayer.prototype.reset = function () {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    };
    WebAnimationsPlayer.prototype._resetDomPlayerState = function () {
        if (this.domPlayer) {
            this.domPlayer.cancel();
        }
    };
    WebAnimationsPlayer.prototype.restart = function () {
        this.reset();
        this.play();
    };
    WebAnimationsPlayer.prototype.hasStarted = function () { return this._started; };
    WebAnimationsPlayer.prototype.destroy = function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this._resetDomPlayerState();
            this._onFinish();
            this._onDestroyFns.forEach(function (fn) { return fn(); });
            this._onDestroyFns = [];
        }
    };
    WebAnimationsPlayer.prototype.setPosition = function (p) { this.domPlayer.currentTime = p * this.time; };
    WebAnimationsPlayer.prototype.getPosition = function () { return this.domPlayer.currentTime / this.time; };
    Object.defineProperty(WebAnimationsPlayer.prototype, "totalTime", {
        get: function () { return this._delay + this._duration; },
        enumerable: true,
        configurable: true
    });
    WebAnimationsPlayer.prototype.beforeDestroy = function () {
        var _this = this;
        var styles = {};
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
    /* @internal */
    WebAnimationsPlayer.prototype.triggerCallback = /* @internal */
    function (phaseName) {
        var methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return WebAnimationsPlayer;
}());
export { WebAnimationsPlayer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfcGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBcUUsWUFBWSxFQUFhLE1BQU0sWUFBWSxDQUFDO0FBSXhILElBQUE7SUFrQkUsNkJBQ1csT0FBWSxFQUFTLFNBQTZDLEVBQ2xFLE9BQXlDO1FBRHpDLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFvQztRQUNsRSxZQUFPLEdBQVAsT0FBTyxDQUFrQzswQkFuQm5CLEVBQUU7MkJBQ0QsRUFBRTs2QkFDQSxFQUFFOzRCQUdmLEtBQUs7eUJBQ1IsS0FBSzt3QkFDTixLQUFLOzBCQUNILEtBQUs7b0JBSVosQ0FBQzs0QkFFNkIsSUFBSTsrQkFDaUIsRUFBRTtRQUtqRSxJQUFJLENBQUMsU0FBUyxHQUFXLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsTUFBTSxHQUFXLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDMUM7SUFFTyx1Q0FBUyxHQUFqQjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FD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LFVBQUEsSUFBSTtnQkFDM0MsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO29CQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUNSLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNuRjthQUNGLENBQUMsQ0FBQztTQUNKO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7S0FDL0I7SUFFRCxlQUFlOztJQUNmLDZDQUFlO0lBQWYsVUFBZ0IsU0FBaUI7UUFDL0IsSUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDcEI7OEJBaEtIO0lBaUtDLENBQUE7QUFwSkQsK0JBb0pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge2FsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgYmFsYW5jZVByZXZpb3VzU3R5bGVzSW50b0tleWZyYW1lcywgY29tcHV0ZVN0eWxlLCBjb3B5U3R5bGVzfSBmcm9tICcuLi8uLi91dGlsJztcblxuaW1wb3J0IHtET01BbmltYXRpb259IGZyb20gJy4vZG9tX2FuaW1hdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX2R1cmF0aW9uOiBudW1iZXI7XG4gIHByaXZhdGUgX2RlbGF5OiBudW1iZXI7XG4gIHByaXZhdGUgX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2ZpbmFsS2V5ZnJhbWU6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9O1xuXG4gIHB1YmxpYyByZWFkb25seSBkb21QbGF5ZXI6IERPTUFuaW1hdGlvbjtcbiAgcHVibGljIHRpbWUgPSAwO1xuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRTbmFwc2hvdDoge1tzdHlsZU5hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9W10sXG4gICAgICBwdWJsaWMgb3B0aW9uczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0pIHtcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDxudW1iZXI+b3B0aW9uc1snZHVyYXRpb24nXTtcbiAgICB0aGlzLl9kZWxheSA9IDxudW1iZXI+b3B0aW9uc1snZGVsYXknXSB8fCAwO1xuICAgIHRoaXMudGltZSA9IHRoaXMuX2R1cmF0aW9uICsgdGhpcy5fZGVsYXk7XG4gIH1cblxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIGluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fYnVpbGRQbGF5ZXIoKTtcbiAgICB0aGlzLl9wcmVwYXJlUGxheWVyQmVmb3JlU3RhcnQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUGxheWVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIGNvbnN0IGtleWZyYW1lcyA9IHRoaXMua2V5ZnJhbWVzO1xuICAgICh0aGlzIGFze2RvbVBsYXllcjogRE9NQW5pbWF0aW9ufSkuZG9tUGxheWVyID1cbiAgICAgICAgdGhpcy5fdHJpZ2dlcldlYkFuaW1hdGlvbih0aGlzLmVsZW1lbnQsIGtleWZyYW1lcywgdGhpcy5vcHRpb25zKTtcbiAgICB0aGlzLl9maW5hbEtleWZyYW1lID0ga2V5ZnJhbWVzLmxlbmd0aCA/IGtleWZyYW1lc1trZXlmcmFtZXMubGVuZ3RoIC0gMV0gOiB7fTtcbiAgICB0aGlzLmRvbVBsYXllci5hZGRFdmVudExpc3RlbmVyKCdmaW5pc2gnLCAoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3ByZXBhcmVQbGF5ZXJCZWZvcmVTdGFydCgpIHtcbiAgICAvLyB0aGlzIGlzIHJlcXVpcmVkIHNvIHRoYXQgdGhlIHBsYXllciBkb2Vzbid0IHN0YXJ0IHRvIGFuaW1hdGUgcmlnaHQgYXdheVxuICAgIGlmICh0aGlzLl9kZWxheSkge1xuICAgICAgdGhpcy5fcmVzZXREb21QbGF5ZXJTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvbVBsYXllci5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RyaWdnZXJXZWJBbmltYXRpb24oZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IGFueVtdLCBvcHRpb25zOiBhbnkpOiBET01BbmltYXRpb24ge1xuICAgIC8vIGpzY29tcGlsZXIgZG9lc24ndCBzZWVtIHRvIGtub3cgYW5pbWF0ZSBpcyBhIG5hdGl2ZSBwcm9wZXJ0eSBiZWNhdXNlIGl0J3Mgbm90IGZ1bGx5XG4gICAgLy8gc3VwcG9ydGVkIHlldCBhY3Jvc3MgY29tbW9uIGJyb3dzZXJzICh3ZSBwb2x5ZmlsbCBpdCBmb3IgRWRnZS9TYWZhcmkpIFtDTCAjMTQzNjMwOTI5XVxuICAgIHJldHVybiBlbGVtZW50WydhbmltYXRlJ10oa2V5ZnJhbWVzLCBvcHRpb25zKSBhcyBET01BbmltYXRpb247XG4gIH1cblxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pOyB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTsgfVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fYnVpbGRQbGF5ZXIoKTtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9vblN0YXJ0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vblN0YXJ0Rm5zID0gW107XG4gICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5kb21QbGF5ZXIucGxheSgpO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgdGhpcy5kb21QbGF5ZXIucGF1c2UoKTtcbiAgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgIHRoaXMuZG9tUGxheWVyLmZpbmlzaCgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREb21QbGF5ZXJTdGF0ZSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREb21QbGF5ZXJTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5kb21QbGF5ZXIpIHtcbiAgICAgIHRoaXMuZG9tUGxheWVyLmNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMucGxheSgpO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7IH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fcmVzZXREb21QbGF5ZXJTdGF0ZSgpO1xuICAgICAgdGhpcy5fb25GaW5pc2goKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7IHRoaXMuZG9tUGxheWVyLmN1cnJlbnRUaW1lID0gcCAqIHRoaXMudGltZTsgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmRvbVBsYXllci5jdXJyZW50VGltZSAvIHRoaXMudGltZTsgfVxuXG4gIGdldCB0b3RhbFRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2RlbGF5ICsgdGhpcy5fZHVyYXRpb247IH1cblxuICBiZWZvcmVEZXN0cm95KCkge1xuICAgIGNvbnN0IHN0eWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7fTtcbiAgICBpZiAodGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2ZpbmFsS2V5ZnJhbWUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wICE9ICdvZmZzZXQnKSB7XG4gICAgICAgICAgc3R5bGVzW3Byb3BdID1cbiAgICAgICAgICAgICAgdGhpcy5fZmluaXNoZWQgPyB0aGlzLl9maW5hbEtleWZyYW1lW3Byb3BdIDogY29tcHV0ZVN0eWxlKHRoaXMuZWxlbWVudCwgcHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCA9IHN0eWxlcztcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXRob2RzID0gcGhhc2VOYW1lID09ICdzdGFydCcgPyB0aGlzLl9vblN0YXJ0Rm5zIDogdGhpcy5fb25Eb25lRm5zO1xuICAgIG1ldGhvZHMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICBtZXRob2RzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==