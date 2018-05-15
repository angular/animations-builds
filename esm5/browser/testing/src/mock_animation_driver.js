import * as tslib_1 from "tslib";
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * @experimental Animation support is experimental.
 */
var MockAnimationDriver = /** @class */ (function () {
    function MockAnimationDriver() {
    }
    MockAnimationDriver.prototype.validateStyleProperty = function (prop) { return validateStyleProperty(prop); };
    MockAnimationDriver.prototype.matchesElement = function (element, selector) {
        return matchesElement(element, selector);
    };
    MockAnimationDriver.prototype.containsElement = function (elm1, elm2) { return containsElement(elm1, elm2); };
    MockAnimationDriver.prototype.query = function (element, selector, multi) {
        return invokeQuery(element, selector, multi);
    };
    MockAnimationDriver.prototype.computeStyle = function (element, prop, defaultValue) {
        return defaultValue || '';
    };
    MockAnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        var player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(player);
        return player;
    };
    MockAnimationDriver.log = [];
    return MockAnimationDriver;
}());
export { MockAnimationDriver };
/**
 * @experimental Animation support is experimental.
 */
var /**
 * @experimental Animation support is experimental.
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
                    var styles_1 = player.currentSnapshot;
                    Object.keys(styles_1).forEach(function (prop) { return _this.previousStyles[prop] = styles_1[prop]; });
                }
            });
        }
        return _this;
    }
    /* @internal */
    /* @internal */
    MockAnimationPlayer.prototype.onInit = /* @internal */
    function (fn) { this._onInitFns.push(fn); };
    /* @internal */
    /* @internal */
    MockAnimationPlayer.prototype.init = /* @internal */
    function () {
        _super.prototype.init.call(this);
        this._onInitFns.forEach(function (fn) { return fn(); });
        this._onInitFns = [];
    };
    MockAnimationPlayer.prototype.finish = function () {
        _super.prototype.finish.call(this);
        this.__finished = true;
    };
    MockAnimationPlayer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.__finished = true;
    };
    /* @internal */
    /* @internal */
    MockAnimationPlayer.prototype.triggerMicrotask = /* @internal */
    function () { };
    MockAnimationPlayer.prototype.play = function () {
        _super.prototype.play.call(this);
        this.__started = true;
    };
    MockAnimationPlayer.prototype.hasStarted = function () { return this.__started; };
    MockAnimationPlayer.prototype.beforeDestroy = function () {
        var _this = this;
        var captures = {};
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
 * @experimental Animation support is experimental.
 */
export { MockAnimationPlayer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBbUIsbUJBQW1CLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRyxPQUFPLEVBQXNDLCtCQUErQixJQUFJLDhCQUE4QixFQUFFLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxZQUFZLElBQUksV0FBVyxFQUFFLGVBQWUsSUFBSSxjQUFjLEVBQUUsc0JBQXNCLElBQUkscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQzs7Ozs7OztJQVN2UyxtREFBcUIsR0FBckIsVUFBc0IsSUFBWSxJQUFhLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtJQUVwRiw0Q0FBYyxHQUFkLFVBQWUsT0FBWSxFQUFFLFFBQWdCO1FBQzNDLE9BQU8sY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMxQztJQUVELDZDQUFlLEdBQWYsVUFBZ0IsSUFBUyxFQUFFLElBQVMsSUFBYSxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtJQUV0RixtQ0FBSyxHQUFMLFVBQU0sT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzlDO0lBRUQsMENBQVksR0FBWixVQUFhLE9BQVksRUFBRSxJQUFZLEVBQUUsWUFBcUI7UUFDNUQsT0FBTyxZQUFZLElBQUksRUFBRSxDQUFDO0tBQzNCO0lBRUQscUNBQU8sR0FBUCxVQUNJLE9BQVksRUFBRSxTQUE2QyxFQUFFLFFBQWdC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QUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTs7OztZQUlyQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7Z0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtvQkFDMUIsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO3dCQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQzFEO2lCQUNGLENBQUMsQ0FBQzthQUNKLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7S0FDakM7OEJBeEhIO0VBOEN5QyxtQkFBbUIsRUEyRTNELENBQUE7Ozs7QUEzRUQsK0JBMkVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7ybVBbmltYXRpb25Ecml2ZXIgYXMgQW5pbWF0aW9uRHJpdmVyLCDJtWFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSBhcyBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UsIMm1Y29udGFpbnNFbGVtZW50IGFzIGNvbnRhaW5zRWxlbWVudCwgybVpbnZva2VRdWVyeSBhcyBpbnZva2VRdWVyeSwgybVtYXRjaGVzRWxlbWVudCBhcyBtYXRjaGVzRWxlbWVudCwgybV2YWxpZGF0ZVN0eWxlUHJvcGVydHkgYXMgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXInO1xuXG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgc3RhdGljIGxvZzogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7IH1cblxuICBtYXRjaGVzRWxlbWVudChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7IHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7IH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9W10sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsXG4gICAgICBlYXNpbmc6IHN0cmluZywgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSA9IFtdKTogTW9ja0FuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgcGxheWVyID1cbiAgICAgICAgbmV3IE1vY2tBbmltYXRpb25QbGF5ZXIoZWxlbWVudCwga2V5ZnJhbWVzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICBNb2NrQW5pbWF0aW9uRHJpdmVyLmxvZy5wdXNoKDxBbmltYXRpb25QbGF5ZXI+cGxheWVyKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uUGxheWVyIGV4dGVuZHMgTm9vcEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX19maW5pc2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9fc3RhcnRlZCA9IGZhbHNlO1xuICBwdWJsaWMgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9ID0ge307XG4gIHByaXZhdGUgX29uSW5pdEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiDJtVN0eWxlRGF0YSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn1bXSxcbiAgICAgIHB1YmxpYyBkdXJhdGlvbjogbnVtYmVyLCBwdWJsaWMgZGVsYXk6IG51bWJlciwgcHVibGljIGVhc2luZzogc3RyaW5nLFxuICAgICAgcHVibGljIHByZXZpb3VzUGxheWVyczogYW55W10pIHtcbiAgICBzdXBlcihkdXJhdGlvbiwgZGVsYXkpO1xuXG4gICAgaWYgKGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZShkdXJhdGlvbiwgZGVsYXkpKSB7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgTW9ja0FuaW1hdGlvblBsYXllcikge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4gdGhpcy5wcmV2aW91c1N0eWxlc1twcm9wXSA9IHN0eWxlc1twcm9wXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBvbkluaXQoZm46ICgpID0+IGFueSkgeyB0aGlzLl9vbkluaXRGbnMucHVzaChmbik7IH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgaW5pdCgpIHtcbiAgICBzdXBlci5pbml0KCk7XG4gICAgdGhpcy5fb25Jbml0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fb25Jbml0Rm5zID0gW107XG4gIH1cblxuICBmaW5pc2goKTogdm9pZCB7XG4gICAgc3VwZXIuZmluaXNoKCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHt9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICBzdXBlci5wbGF5KCk7XG4gICAgdGhpcy5fX3N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpIHsgcmV0dXJuIHRoaXMuX19zdGFydGVkOyB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBjYXB0dXJlczogybVTdHlsZURhdGEgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMucHJldmlvdXNTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjYXB0dXJlc1twcm9wXSA9IHRoaXMucHJldmlvdXNTdHlsZXNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIC8vIHdoZW4gYXNzZW1ibGluZyB0aGUgY2FwdHVyZWQgc3R5bGVzLCBpdCdzIGltcG9ydGFudCB0aGF0XG4gICAgICAvLyB3ZSBidWlsZCB0aGUga2V5ZnJhbWUgc3R5bGVzIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICAvLyB7b3RoZXIgc3R5bGVzIHdpdGhpbiBrZXlmcmFtZXMsIC4uLiBwcmV2aW91c1N0eWxlcyB9XG4gICAgICB0aGlzLmtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICAgICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgaWYgKHByb3AgIT0gJ29mZnNldCcpIHtcbiAgICAgICAgICAgIGNhcHR1cmVzW3Byb3BdID0gdGhpcy5fX2ZpbmlzaGVkID8ga2ZbcHJvcF0gOiBBVVRPX1NUWUxFO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCA9IGNhcHR1cmVzO1xuICB9XG59XG4iXX0=