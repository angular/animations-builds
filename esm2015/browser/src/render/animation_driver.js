/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/animation_driver.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { Injectable } from '@angular/core';
import { containsElement, invokeQuery, matchesElement, validateStyleProperty } from './shared';
/**
 * \@publicApi
 */
let NoopAnimationDriver = /** @class */ (() => {
    /**
     * \@publicApi
     */
    class NoopAnimationDriver {
        /**
         * @param {?} prop
         * @return {?}
         */
        validateStyleProperty(prop) {
            return validateStyleProperty(prop);
        }
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
        containsElement(elm1, elm2) {
            return containsElement(elm1, elm2);
        }
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
         * @param {?=} scrubberAccessRequested
         * @return {?}
         */
        animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
            return new NoopAnimationPlayer(duration, delay);
        }
    }
    NoopAnimationDriver.decorators = [
        { type: Injectable }
    ];
    return NoopAnimationDriver;
})();
export { NoopAnimationDriver };
/**
 * \@publicApi
 * @abstract
 */
let AnimationDriver = /** @class */ (() => {
    /**
     * \@publicApi
     * @abstract
     */
    class AnimationDriver {
    }
    AnimationDriver.NOOP = new NoopAnimationDriver();
    return AnimationDriver;
})();
export { AnimationDriver };
if (false) {
    /** @type {?} */
    AnimationDriver.NOOP;
    /**
     * @abstract
     * @param {?} prop
     * @return {?}
     */
    AnimationDriver.prototype.validateStyleProperty = function (prop) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    AnimationDriver.prototype.matchesElement = function (element, selector) { };
    /**
     * @abstract
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    AnimationDriver.prototype.containsElement = function (elm1, elm2) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    AnimationDriver.prototype.query = function (element, selector, multi) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    AnimationDriver.prototype.computeStyle = function (element, prop, defaultValue) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?=} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    AnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers, scrubberAccessRequested) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sVUFBVSxDQUFDOzs7O0FBSzdGOzs7O0lBQUEsTUFDYSxtQkFBbUI7Ozs7O1FBQzlCLHFCQUFxQixDQUFDLElBQVk7WUFDaEMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDOzs7Ozs7UUFFRCxjQUFjLENBQUMsT0FBWSxFQUFFLFFBQWdCO1lBQzNDLE9BQU8sY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzQyxDQUFDOzs7Ozs7UUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7WUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7Ozs7Ozs7UUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztZQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7Ozs7Ozs7UUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtZQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQzs7Ozs7Ozs7Ozs7UUFFRCxPQUFPLENBQ0gsT0FBWSxFQUFFLFNBQTJDLEVBQUUsUUFBZ0IsRUFBRSxLQUFhLEVBQzFGLE1BQWMsRUFBRSxrQkFBeUIsRUFBRSxFQUMzQyx1QkFBaUM7WUFDbkMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRCxDQUFDOzs7Z0JBM0JGLFVBQVU7O0lBNEJYLDBCQUFDO0tBQUE7U0EzQlksbUJBQW1COzs7OztBQWdDaEM7Ozs7O0lBQUEsTUFBc0IsZUFBZTs7SUFDNUIsb0JBQUksR0FBb0IsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0lBZTNELHNCQUFDO0tBQUE7U0FoQnFCLGVBQWU7OztJQUNuQyxxQkFBeUQ7Ozs7OztJQUV6RCxzRUFBc0Q7Ozs7Ozs7SUFFdEQsNEVBQWlFOzs7Ozs7O0lBRWpFLHNFQUF3RDs7Ozs7Ozs7SUFFeEQsMEVBQXNFOzs7Ozs7OztJQUV0RSxvRkFBaUY7Ozs7Ozs7Ozs7OztJQUVqRix5SUFFMkYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2NvbnRhaW5zRWxlbWVudCwgaW52b2tlUXVlcnksIG1hdGNoZXNFbGVtZW50LCB2YWxpZGF0ZVN0eWxlUHJvcGVydHl9IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOb29wQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7XG4gIH1cblxuICBtYXRjaGVzRWxlbWVudChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9XG5cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbnRhaW5zRWxlbWVudChlbG0xLCBlbG0yKTtcbiAgfVxuXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfVxuXG4gIGFuaW1hdGUoXG4gICAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXJ9W10sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsXG4gICAgICBlYXNpbmc6IHN0cmluZywgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSA9IFtdLFxuICAgICAgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoZHVyYXRpb24sIGRlbGF5KTtcbiAgfVxufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFuaW1hdGlvbkRyaXZlciB7XG4gIHN0YXRpYyBOT09QOiBBbmltYXRpb25Ecml2ZXIgPSBuZXcgTm9vcEFuaW1hdGlvbkRyaXZlcigpO1xuXG4gIGFic3RyYWN0IHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGFic3RyYWN0IG1hdGNoZXNFbGVtZW50KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W107XG5cbiAgYWJzdHJhY3QgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfG51bWJlcn1bXSwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcixcbiAgICAgIGVhc2luZz86IHN0cmluZ3xudWxsLCBwcmV2aW91c1BsYXllcnM/OiBhbnlbXSwgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuKTogYW55O1xufVxuIl19