import { computeStyle } from '../shared';
var WebAnimationsPlayer = /** @class */ (function () {
    function WebAnimationsPlayer(element, keyframes, options, _specialStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this._specialStyles = _specialStyles;
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
    WebAnimationsPlayer.prototype._triggerWebAnimation = function (element, keyframes, options) {
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
            if (this._specialStyles) {
                this._specialStyles.start();
            }
        }
        this.domPlayer.play();
    };
    WebAnimationsPlayer.prototype.pause = function () {
        this.init();
        this.domPlayer.pause();
    };
    WebAnimationsPlayer.prototype.finish = function () {
        this.init();
        if (this._specialStyles) {
            this._specialStyles.finish();
        }
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
            if (this._specialStyles) {
                this._specialStyles.destroy();
            }
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
    /** @internal */
    WebAnimationsPlayer.prototype.triggerCallback = function (phaseName) {
        var methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return WebAnimationsPlayer;
}());
export { WebAnimationsPlayer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfcGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFLdkM7SUFvQkUsNkJBQ1csT0FBWSxFQUFTLFNBQTZDLEVBQ2xFLE9BQXlDLEVBQ3hDLGNBQXdDO1FBRnpDLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFvQztRQUNsRSxZQUFPLEdBQVAsT0FBTyxDQUFrQztRQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7UUF0QjVDLGVBQVUsR0FBZSxFQUFFLENBQUM7UUFDNUIsZ0JBQVcsR0FBZSxFQUFFLENBQUM7UUFDN0Isa0JBQWEsR0FBZSxFQUFFLENBQUM7UUFHL0IsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFNcEIsU0FBSSxHQUFHLENBQUMsQ0FBQztRQUVULGlCQUFZLEdBQXlCLElBQUksQ0FBQztRQUMxQyxvQkFBZSxHQUEyQyxFQUFFLENBQUM7UUFNbEUsSUFBSSxDQUFDLFNBQVMsR0FBVyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sR0FBVyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzNDLENBQUM7SUFFTyx1Q0FBUyxHQUFqQjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRUQsa0NBQUksR0FBSjtRQUNFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRU8sMENBQVksR0FBcEI7UUFBQSxpQkFTQztRQVJDLElBQUksSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXpCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBaUMsQ0FBQyxTQUFTO1lBQ3hDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sdURBQXlCLEdBQWpDO1FBQ0UsMEVBQTBFO1FBQzFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQzdCO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixrREFBb0IsR0FBcEIsVUFBcUIsT0FBWSxFQUFFLFNBQWdCLEVBQUUsT0FBWTtRQUMvRCxzRkFBc0Y7UUFDdEYsd0ZBQXdGO1FBQ3hGLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQWlCLENBQUM7SUFDaEUsQ0FBQztJQUVELHFDQUFPLEdBQVAsVUFBUSxFQUFjLElBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVELG9DQUFNLEdBQU4sVUFBTyxFQUFjLElBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFELHVDQUFTLEdBQVQsVUFBVSxFQUFjLElBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhFLGtDQUFJLEdBQUo7UUFDRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUM3QjtTQUNGO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsbUNBQUssR0FBTDtRQUNFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELG9DQUFNLEdBQU47UUFDRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM5QjtRQUNELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxtQ0FBSyxHQUFMO1FBQ0UsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztJQUVPLGtEQUFvQixHQUE1QjtRQUNFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVELHFDQUFPLEdBQVA7UUFDRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsd0NBQVUsR0FBVixjQUF3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRS9DLHFDQUFPLEdBQVA7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQy9CO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLEVBQUUsRUFBSixDQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFFRCx5Q0FBVyxHQUFYLFVBQVksQ0FBUyxJQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUU1RSx5Q0FBVyxHQUFYLGNBQXdCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFeEUsc0JBQUksMENBQVM7YUFBYixjQUEwQixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRWhFLDJDQUFhLEdBQWI7UUFBQSxpQkFXQztRQVZDLElBQU0sTUFBTSxHQUFxQyxFQUFFLENBQUM7UUFDcEQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtnQkFDM0MsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO29CQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUNSLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNuRjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLDZDQUFlLEdBQWYsVUFBZ0IsU0FBaUI7UUFDL0IsSUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNILDBCQUFDO0FBQUQsQ0FBQyxBQWhLRCxJQWdLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtjb21wdXRlU3R5bGV9IGZyb20gJy4uL3NoYXJlZCc7XG5pbXBvcnQge1NwZWNpYWxDYXNlZFN0eWxlc30gZnJvbSAnLi4vc3BlY2lhbF9jYXNlZF9zdHlsZXMnO1xuXG5pbXBvcnQge0RPTUFuaW1hdGlvbn0gZnJvbSAnLi9kb21fYW5pbWF0aW9uJztcblxuZXhwb3J0IGNsYXNzIFdlYkFuaW1hdGlvbnNQbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9vbkRvbmVGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25TdGFydEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vbkRlc3Ryb3lGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZHVyYXRpb246IG51bWJlcjtcbiAgcHJpdmF0ZSBfZGVsYXk6IG51bWJlcjtcbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2ZpbmFsS2V5ZnJhbWUgIToge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn07XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyByZWFkb25seSBkb21QbGF5ZXIgITogRE9NQW5pbWF0aW9uO1xuICBwdWJsaWMgdGltZSA9IDA7XG5cbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiB7W3N0eWxlTmFtZTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn1bXSxcbiAgICAgIHB1YmxpYyBvcHRpb25zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSxcbiAgICAgIHByaXZhdGUgX3NwZWNpYWxTdHlsZXM/OiBTcGVjaWFsQ2FzZWRTdHlsZXN8bnVsbCkge1xuICAgIHRoaXMuX2R1cmF0aW9uID0gPG51bWJlcj5vcHRpb25zWydkdXJhdGlvbiddO1xuICAgIHRoaXMuX2RlbGF5ID0gPG51bWJlcj5vcHRpb25zWydkZWxheSddIHx8IDA7XG4gICAgdGhpcy50aW1lID0gdGhpcy5fZHVyYXRpb24gKyB0aGlzLl9kZWxheTtcbiAgfVxuXG4gIHByaXZhdGUgX29uRmluaXNoKCkge1xuICAgIGlmICghdGhpcy5fZmluaXNoZWQpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25Eb25lRm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9idWlsZFBsYXllcigpO1xuICAgIHRoaXMuX3ByZXBhcmVQbGF5ZXJCZWZvcmVTdGFydCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRQbGF5ZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSByZXR1cm47XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgY29uc3Qga2V5ZnJhbWVzID0gdGhpcy5rZXlmcmFtZXM7XG4gICAgKHRoaXMgYXN7ZG9tUGxheWVyOiBET01BbmltYXRpb259KS5kb21QbGF5ZXIgPVxuICAgICAgICB0aGlzLl90cmlnZ2VyV2ViQW5pbWF0aW9uKHRoaXMuZWxlbWVudCwga2V5ZnJhbWVzLCB0aGlzLm9wdGlvbnMpO1xuICAgIHRoaXMuX2ZpbmFsS2V5ZnJhbWUgPSBrZXlmcmFtZXMubGVuZ3RoID8ga2V5ZnJhbWVzW2tleWZyYW1lcy5sZW5ndGggLSAxXSA6IHt9O1xuICAgIHRoaXMuZG9tUGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2ZpbmlzaCcsICgpID0+IHRoaXMuX29uRmluaXNoKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJlcGFyZVBsYXllckJlZm9yZVN0YXJ0KCkge1xuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgc28gdGhhdCB0aGUgcGxheWVyIGRvZXNuJ3Qgc3RhcnQgdG8gYW5pbWF0ZSByaWdodCBhd2F5XG4gICAgaWYgKHRoaXMuX2RlbGF5KSB7XG4gICAgICB0aGlzLl9yZXNldERvbVBsYXllclN0YXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9tUGxheWVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdHJpZ2dlcldlYkFuaW1hdGlvbihlbGVtZW50OiBhbnksIGtleWZyYW1lczogYW55W10sIG9wdGlvbnM6IGFueSk6IERPTUFuaW1hdGlvbiB7XG4gICAgLy8ganNjb21waWxlciBkb2Vzbid0IHNlZW0gdG8ga25vdyBhbmltYXRlIGlzIGEgbmF0aXZlIHByb3BlcnR5IGJlY2F1c2UgaXQncyBub3QgZnVsbHlcbiAgICAvLyBzdXBwb3J0ZWQgeWV0IGFjcm9zcyBjb21tb24gYnJvd3NlcnMgKHdlIHBvbHlmaWxsIGl0IGZvciBFZGdlL1NhZmFyaSkgW0NMICMxNDM2MzA5MjldXG4gICAgcmV0dXJuIGVsZW1lbnRbJ2FuaW1hdGUnXShrZXlmcmFtZXMsIG9wdGlvbnMpIGFzIERPTUFuaW1hdGlvbjtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25TdGFydEZucy5wdXNoKGZuKTsgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRvbmVGbnMucHVzaChmbik7IH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9idWlsZFBsYXllcigpO1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgICAgdGhpcy5fc3BlY2lhbFN0eWxlcy5zdGFydCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRvbVBsYXllci5wbGF5KCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLmRvbVBsYXllci5wYXVzZSgpO1xuICB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLl9zcGVjaWFsU3R5bGVzKSB7XG4gICAgICB0aGlzLl9zcGVjaWFsU3R5bGVzLmZpbmlzaCgpO1xuICAgIH1cbiAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgIHRoaXMuZG9tUGxheWVyLmZpbmlzaCgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXREb21QbGF5ZXJTdGF0ZSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREb21QbGF5ZXJTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5kb21QbGF5ZXIpIHtcbiAgICAgIHRoaXMuZG9tUGxheWVyLmNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMucGxheSgpO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7IH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fcmVzZXREb21QbGF5ZXJTdGF0ZSgpO1xuICAgICAgdGhpcy5fb25GaW5pc2goKTtcbiAgICAgIGlmICh0aGlzLl9zcGVjaWFsU3R5bGVzKSB7XG4gICAgICAgIHRoaXMuX3NwZWNpYWxTdHlsZXMuZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHsgdGhpcy5kb21QbGF5ZXIuY3VycmVudFRpbWUgPSBwICogdGhpcy50aW1lOyB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZG9tUGxheWVyLmN1cnJlbnRUaW1lIC8gdGhpcy50aW1lOyB9XG5cbiAgZ2V0IHRvdGFsVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZGVsYXkgKyB0aGlzLl9kdXJhdGlvbjsgfVxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgY29uc3Qgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSA9IHt9O1xuICAgIGlmICh0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5fZmluYWxLZXlmcmFtZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHByb3AgIT0gJ29mZnNldCcpIHtcbiAgICAgICAgICBzdHlsZXNbcHJvcF0gPVxuICAgICAgICAgICAgICB0aGlzLl9maW5pc2hlZCA/IHRoaXMuX2ZpbmFsS2V5ZnJhbWVbcHJvcF0gOiBjb21wdXRlU3R5bGUodGhpcy5lbGVtZW50LCBwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gc3R5bGVzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtZXRob2RzID0gcGhhc2VOYW1lID09ICdzdGFydCcgPyB0aGlzLl9vblN0YXJ0Rm5zIDogdGhpcy5fb25Eb25lRm5zO1xuICAgIG1ldGhvZHMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICBtZXRob2RzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==