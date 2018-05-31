/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, copyStyles } from '../../util';
import { CssKeyframesDriver } from '../css_keyframes/css_keyframes_driver';
import { containsElement, invokeQuery, isBrowser, matchesElement, validateStyleProperty } from '../shared';
import { WebAnimationsPlayer } from './web_animations_player';
export class WebAnimationsDriver {
    constructor() {
        this._isNativeImpl = /\{\s*\[native\s+code\]\s*\}/.test(getElementAnimateFn().toString());
        this._cssKeyframesDriver = new CssKeyframesDriver();
    }
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
        return /** @type {?} */ ((/** @type {?} */ (window.getComputedStyle(element)))[prop]);
    }
    /**
     * @param {?} supported
     * @return {?}
     */
    overrideWebAnimationsSupport(supported) { this._isNativeImpl = supported; }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        const /** @type {?} */ useKeyframes = !scrubberAccessRequested && !this._isNativeImpl;
        if (useKeyframes) {
            return this._cssKeyframesDriver.animate(element, keyframes, duration, delay, easing, previousPlayers);
        }
        const /** @type {?} */ fill = delay == 0 ? 'both' : 'forwards';
        const /** @type {?} */ playerOptions = { duration, delay, fill };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        const /** @type {?} */ previousStyles = {};
        const /** @type {?} */ previousWebAnimationPlayers = /** @type {?} */ (previousPlayers.filter(player => player instanceof WebAnimationsPlayer));
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousWebAnimationPlayers.forEach(player => {
                let /** @type {?} */ styles = player.currentSnapshot;
                Object.keys(styles).forEach(prop => previousStyles[prop] = styles[prop]);
            });
        }
        keyframes = keyframes.map(styles => copyStyles(styles, false));
        keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
        return new WebAnimationsPlayer(element, keyframes, playerOptions);
    }
}
function WebAnimationsDriver_tsickle_Closure_declarations() {
    /** @type {?} */
    WebAnimationsDriver.prototype._isNativeImpl;
    /** @type {?} */
    WebAnimationsDriver.prototype._cssKeyframesDriver;
}
/**
 * @return {?}
 */
export function supportsWebAnimations() {
    return typeof getElementAnimateFn() === 'function';
}
/**
 * @return {?}
 */
function getElementAnimateFn() {
    return (isBrowser() && (/** @type {?} */ (Element)).prototype['animate']) || {};
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsOEJBQThCLEVBQUUsa0NBQWtDLEVBQUUsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTFHLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxlQUFlLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFekcsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFNUQsTUFBTTs7NkJBQ29CLDZCQUE2QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO21DQUM5RCxJQUFJLGtCQUFrQixFQUFFOzs7Ozs7SUFFdEQscUJBQXFCLENBQUMsSUFBWSxJQUFhLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTs7Ozs7O0lBRXBGLGNBQWMsQ0FBQyxPQUFZLEVBQUUsUUFBZ0I7UUFDM0MsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzFDOzs7Ozs7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVMsSUFBYSxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTs7Ozs7OztJQUV0RixLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzlDOzs7Ozs7O0lBRUQsWUFBWSxDQUFDLE9BQVksRUFBRSxJQUFZLEVBQUUsWUFBcUI7UUFDNUQseUJBQU8sbUJBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBUSxFQUFDLENBQUMsSUFBSSxDQUFXLEVBQUM7S0FDbEU7Ozs7O0lBRUQsNEJBQTRCLENBQUMsU0FBa0IsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxFQUFFOzs7Ozs7Ozs7OztJQUVwRixPQUFPLENBQ0gsT0FBWSxFQUFFLFNBQXVCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUN0RixrQkFBcUMsRUFBRSxFQUFFLHVCQUFpQztRQUM1RSx1QkFBTSxZQUFZLEdBQUcsQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDckUsSUFBSSxZQUFZLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUNuQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsdUJBQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBQzlDLHVCQUFNLGFBQWEsR0FBcUMsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDOzs7UUFHaEYsSUFBSSxNQUFNLEVBQUU7WUFDVixhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQ2xDO1FBRUQsdUJBQU0sY0FBYyxHQUF5QixFQUFFLENBQUM7UUFDaEQsdUJBQU0sMkJBQTJCLHFCQUEwQixlQUFlLENBQUMsTUFBTSxDQUM3RSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sWUFBWSxtQkFBbUIsQ0FBQyxDQUFBLENBQUM7UUFFckQsSUFBSSw4QkFBOEIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDbkQsMkJBQTJCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMzQyxxQkFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDMUUsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvRCxTQUFTLEdBQUcsa0NBQWtDLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNuRixPQUFPLElBQUksbUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUNuRTtDQUNGOzs7Ozs7Ozs7O0FBRUQsTUFBTTtJQUNKLE9BQU8sT0FBTyxtQkFBbUIsRUFBRSxLQUFLLFVBQVUsQ0FBQztDQUNwRDs7OztBQUVEO0lBQ0UsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLG1CQUFNLE9BQU8sRUFBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNuRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlLCBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzLCBjb3B5U3R5bGVzfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Q3NzS2V5ZnJhbWVzRHJpdmVyfSBmcm9tICcuLi9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfZHJpdmVyJztcbmltcG9ydCB7Y29udGFpbnNFbGVtZW50LCBpbnZva2VRdWVyeSwgaXNCcm93c2VyLCBtYXRjaGVzRWxlbWVudCwgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICcuLi9zaGFyZWQnO1xuXG5pbXBvcnQge1dlYkFuaW1hdGlvbnNQbGF5ZXJ9IGZyb20gJy4vd2ViX2FuaW1hdGlvbnNfcGxheWVyJztcblxuZXhwb3J0IGNsYXNzIFdlYkFuaW1hdGlvbnNEcml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICBwcml2YXRlIF9pc05hdGl2ZUltcGwgPSAvXFx7XFxzKlxcW25hdGl2ZVxccytjb2RlXFxdXFxzKlxcfS8udGVzdChnZXRFbGVtZW50QW5pbWF0ZUZuKCkudG9TdHJpbmcoKSk7XG4gIHByaXZhdGUgX2Nzc0tleWZyYW1lc0RyaXZlciA9IG5ldyBDc3NLZXlmcmFtZXNEcml2ZXIoKTtcblxuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7IH1cblxuICBtYXRjaGVzRWxlbWVudChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7IHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7IH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkgYXMgYW55KVtwcm9wXSBhcyBzdHJpbmc7XG4gIH1cblxuICBvdmVycmlkZVdlYkFuaW1hdGlvbnNTdXBwb3J0KHN1cHBvcnRlZDogYm9vbGVhbikgeyB0aGlzLl9pc05hdGl2ZUltcGwgPSBzdXBwb3J0ZWQ7IH1cblxuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsIGVhc2luZzogc3RyaW5nLFxuICAgICAgcHJldmlvdXNQbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdLCBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHVzZUtleWZyYW1lcyA9ICFzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZCAmJiAhdGhpcy5faXNOYXRpdmVJbXBsO1xuICAgIGlmICh1c2VLZXlmcmFtZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jc3NLZXlmcmFtZXNEcml2ZXIuYW5pbWF0ZShcbiAgICAgICAgICBlbGVtZW50LCBrZXlmcmFtZXMsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBwcmV2aW91c1BsYXllcnMpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGwgPSBkZWxheSA9PSAwID8gJ2JvdGgnIDogJ2ZvcndhcmRzJztcbiAgICBjb25zdCBwbGF5ZXJPcHRpb25zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSA9IHtkdXJhdGlvbiwgZGVsYXksIGZpbGx9O1xuICAgIC8vIHdlIGNoZWNrIGZvciB0aGlzIHRvIGF2b2lkIGhhdmluZyBhIG51bGx8dW5kZWZpbmVkIHZhbHVlIGJlIHByZXNlbnRcbiAgICAvLyBmb3IgdGhlIGVhc2luZyAod2hpY2ggcmVzdWx0cyBpbiBhbiBlcnJvciBmb3IgY2VydGFpbiBicm93c2VycyAjOTc1MilcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICBwbGF5ZXJPcHRpb25zWydlYXNpbmcnXSA9IGVhc2luZztcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c1N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICBjb25zdCBwcmV2aW91c1dlYkFuaW1hdGlvblBsYXllcnMgPSA8V2ViQW5pbWF0aW9uc1BsYXllcltdPnByZXZpb3VzUGxheWVycy5maWx0ZXIoXG4gICAgICAgIHBsYXllciA9PiBwbGF5ZXIgaW5zdGFuY2VvZiBXZWJBbmltYXRpb25zUGxheWVyKTtcblxuICAgIGlmIChhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb24sIGRlbGF5KSkge1xuICAgICAgcHJldmlvdXNXZWJBbmltYXRpb25QbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgbGV0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHByZXZpb3VzU3R5bGVzW3Byb3BdID0gc3R5bGVzW3Byb3BdKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGtleWZyYW1lcyA9IGtleWZyYW1lcy5tYXAoc3R5bGVzID0+IGNvcHlTdHlsZXMoc3R5bGVzLCBmYWxzZSkpO1xuICAgIGtleWZyYW1lcyA9IGJhbGFuY2VQcmV2aW91c1N0eWxlc0ludG9LZXlmcmFtZXMoZWxlbWVudCwga2V5ZnJhbWVzLCBwcmV2aW91c1N0eWxlcyk7XG4gICAgcmV0dXJuIG5ldyBXZWJBbmltYXRpb25zUGxheWVyKGVsZW1lbnQsIGtleWZyYW1lcywgcGxheWVyT3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRzV2ViQW5pbWF0aW9ucygpIHtcbiAgcmV0dXJuIHR5cGVvZiBnZXRFbGVtZW50QW5pbWF0ZUZuKCkgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRBbmltYXRlRm4oKTogYW55IHtcbiAgcmV0dXJuIChpc0Jyb3dzZXIoKSAmJiAoPGFueT5FbGVtZW50KS5wcm90b3R5cGVbJ2FuaW1hdGUnXSkgfHwge307XG59XG4iXX0=