/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * \@experimental Animation support is experimental.
 */
export class MockAnimationDriver {
    /**
     * @param {?} prop
     * @return {?}
     */
    validateStyleProperty(prop) { return validateStyleProperty(prop); }
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    matchesElement(element, selector) {
        return matchesElement(element, selector);
    }
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    containsElement(elm1, elm2) { return containsElement(elm1, elm2); }
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        /** @type {?} */
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(/** @type {?} */ (player));
        return player;
    }
}
MockAnimationDriver.log = [];
if (false) {
    /** @type {?} */
    MockAnimationDriver.log;
}
/**
 * \@experimental Animation support is experimental.
 */
export class MockAnimationPlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?} previousPlayers
     */
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super(duration, delay);
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
        this.__finished = false;
        this.__started = false;
        this.previousStyles = {};
        this._onInitFns = [];
        this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(player => {
                if (player instanceof MockAnimationPlayer) {
                    /** @type {?} */
                    const styles = player.currentSnapshot;
                    Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
                }
            });
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onInit(fn) { this._onInitFns.push(fn); }
    /**
     * @return {?}
     */
    init() {
        super.init();
        this._onInitFns.forEach(fn => fn());
        this._onInitFns = [];
    }
    /**
     * @return {?}
     */
    finish() {
        super.finish();
        this.__finished = true;
    }
    /**
     * @return {?}
     */
    destroy() {
        super.destroy();
        this.__finished = true;
    }
    /**
     * @return {?}
     */
    triggerMicrotask() { }
    /**
     * @return {?}
     */
    play() {
        super.play();
        this.__started = true;
    }
    /**
     * @return {?}
     */
    hasStarted() { return this.__started; }
    /**
     * @return {?}
     */
    beforeDestroy() {
        /** @type {?} */
        const captures = {};
        Object.keys(this.previousStyles).forEach(prop => {
            captures[prop] = this.previousStyles[prop];
        });
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach(kf => {
                Object.keys(kf).forEach(prop => {
                    if (prop != 'offset') {
                        captures[prop] = this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                });
            });
        }
        this.currentSnapshot = captures;
    }
}
if (false) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBbUIsbUJBQW1CLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRyxPQUFPLEVBQXNDLCtCQUErQixJQUFJLDhCQUE4QixFQUFFLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxZQUFZLElBQUksV0FBVyxFQUFFLGVBQWUsSUFBSSxjQUFjLEVBQUUsc0JBQXNCLElBQUkscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQzs7OztBQU16UyxNQUFNLE9BQU8sbUJBQW1COzs7OztJQUc5QixxQkFBcUIsQ0FBQyxJQUFZLElBQWEsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFOzs7Ozs7SUFFcEYsY0FBYyxDQUFDLE9BQVksRUFBRSxRQUFnQjtRQUMzQyxPQUFPLGNBQWMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDMUM7Ozs7OztJQUVELGVBQWUsQ0FBQyxJQUFTLEVBQUUsSUFBUyxJQUFhLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFOzs7Ozs7O0lBRXRGLEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE9BQU8sV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDOUM7Ozs7Ozs7SUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7S0FDM0I7Ozs7Ozs7Ozs7SUFFRCxPQUFPLENBQ0gsT0FBWSxFQUFFLFNBQTZDLEVBQUUsUUFBZ0IsRUFBRSxLQUFhLEVBQzVGLE1BQWMsRUFBRSxrQkFBeUIsRUFBRTs7UUFDN0MsTUFBTSxNQUFNLEdBQ1IsSUFBSSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzFGLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLG1CQUFrQixNQUFNLEVBQUMsQ0FBQztRQUN0RCxPQUFPLE1BQU0sQ0FBQztLQUNmOztBQXpCRCwwQkFBZ0MsRUFBRSxDQUFDOzs7Ozs7OztBQStCckMsTUFBTSxPQUFPLG1CQUFvQixTQUFRLG1CQUFtQjs7Ozs7Ozs7O0lBTzFELFlBQ1csU0FBcUIsU0FBNkMsRUFDbEUsVUFBeUIsS0FBYSxFQUFTLE1BQWMsRUFDN0Q7UUFDVCxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBSGQsWUFBTyxHQUFQLE9BQU87UUFBYyxjQUFTLEdBQVQsU0FBUyxDQUFvQztRQUNsRSxhQUFRLEdBQVIsUUFBUTtRQUFpQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUM3RCxvQkFBZSxHQUFmLGVBQWU7MEJBVEwsS0FBSzt5QkFDTixLQUFLOzhCQUNpQyxFQUFFOzBCQUN4QixFQUFFOytCQUNELEVBQUU7UUFRckMsSUFBSSw4QkFBOEIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDbkQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxNQUFNLFlBQVksbUJBQW1CLEVBQUU7O29CQUN6QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO29CQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQy9FO2FBQ0YsQ0FBQyxDQUFDO1NBQ0o7S0FDRjs7Ozs7SUFHRCxNQUFNLENBQUMsRUFBYSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7SUFHbkQsSUFBSTtRQUNGLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztLQUN0Qjs7OztJQUVELE1BQU07UUFDSixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztLQUN4Qjs7OztJQUVELE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7S0FDeEI7Ozs7SUFHRCxnQkFBZ0IsTUFBSzs7OztJQUVyQixJQUFJO1FBQ0YsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7S0FDdkI7Ozs7SUFFRCxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7Ozs7SUFFdkMsYUFBYTs7UUFDWCxNQUFNLFFBQVEsR0FBZSxFQUFFLENBQUM7UUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVDLENBQUMsQ0FBQztRQUVILElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFOzs7O1lBSXJCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO3dCQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7cUJBQzFEO2lCQUNGLENBQUMsQ0FBQzthQUNKLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7S0FDakM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge8m1QW5pbWF0aW9uRHJpdmVyIGFzIEFuaW1hdGlvbkRyaXZlciwgybVhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UgYXMgYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlLCDJtWNvbnRhaW5zRWxlbWVudCBhcyBjb250YWluc0VsZW1lbnQsIMm1aW52b2tlUXVlcnkgYXMgaW52b2tlUXVlcnksIMm1bWF0Y2hlc0VsZW1lbnQgYXMgbWF0Y2hlc0VsZW1lbnQsIMm1dmFsaWRhdGVTdHlsZVByb3BlcnR5IGFzIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucy9icm93c2VyJztcblxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvbkRyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIHN0YXRpYyBsb2c6IEFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApOyB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpOyB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9XG5cbiAgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfVtdLCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLFxuICAgICAgZWFzaW5nOiBzdHJpbmcsIHByZXZpb3VzUGxheWVyczogYW55W10gPSBbXSk6IE1vY2tBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHBsYXllciA9XG4gICAgICAgIG5ldyBNb2NrQW5pbWF0aW9uUGxheWVyKGVsZW1lbnQsIGtleWZyYW1lcywgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgTW9ja0FuaW1hdGlvbkRyaXZlci5sb2cucHVzaCg8QW5pbWF0aW9uUGxheWVyPnBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvblBsYXllciBleHRlbmRzIE5vb3BBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9fZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgcHVibGljIHByZXZpb3VzU3R5bGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSA9IHt9O1xuICBwcml2YXRlIF9vbkluaXRGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHVibGljIGN1cnJlbnRTbmFwc2hvdDogybVTdHlsZURhdGEgPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9W10sXG4gICAgICBwdWJsaWMgZHVyYXRpb246IG51bWJlciwgcHVibGljIGRlbGF5OiBudW1iZXIsIHB1YmxpYyBlYXNpbmc6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBwcmV2aW91c1BsYXllcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoZHVyYXRpb24sIGRlbGF5KTtcblxuICAgIGlmIChhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb24sIGRlbGF5KSkge1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllciBpbnN0YW5jZW9mIE1vY2tBbmltYXRpb25QbGF5ZXIpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSBwbGF5ZXIuY3VycmVudFNuYXBzaG90O1xuICAgICAgICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHRoaXMucHJldmlvdXNTdHlsZXNbcHJvcF0gPSBzdHlsZXNbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgb25Jbml0KGZuOiAoKSA9PiBhbnkpIHsgdGhpcy5fb25Jbml0Rm5zLnB1c2goZm4pOyB9XG5cbiAgLyogQGludGVybmFsICovXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX29uSW5pdEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uSW5pdEZucyA9IFtdO1xuICB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHN1cGVyLmZpbmlzaCgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7fVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgc3VwZXIucGxheSgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGhhc1N0YXJ0ZWQoKSB7IHJldHVybiB0aGlzLl9fc3RhcnRlZDsgfVxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgY29uc3QgY2FwdHVyZXM6IMm1U3R5bGVEYXRhID0ge307XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY2FwdHVyZXNbcHJvcF0gPSB0aGlzLnByZXZpb3VzU3R5bGVzW3Byb3BdO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICAvLyB3aGVuIGFzc2VtYmxpbmcgdGhlIGNhcHR1cmVkIHN0eWxlcywgaXQncyBpbXBvcnRhbnQgdGhhdFxuICAgICAgLy8gd2UgYnVpbGQgdGhlIGtleWZyYW1lIHN0eWxlcyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOlxuICAgICAgLy8ge290aGVyIHN0eWxlcyB3aXRoaW4ga2V5ZnJhbWVzLCAuLi4gcHJldmlvdXNTdHlsZXMgfVxuICAgICAgdGhpcy5rZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgICAgIE9iamVjdC5rZXlzKGtmKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgIGlmIChwcm9wICE9ICdvZmZzZXQnKSB7XG4gICAgICAgICAgICBjYXB0dXJlc1twcm9wXSA9IHRoaXMuX19maW5pc2hlZCA/IGtmW3Byb3BdIDogQVVUT19TVFlMRTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBjYXB0dXJlcztcbiAgfVxufVxuIl19