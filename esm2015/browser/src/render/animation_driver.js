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
import * as i0 from "@angular/core";
/**
 * \@publicApi
 */
export class NoopAnimationDriver {
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
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        return new NoopAnimationPlayer(duration, delay);
    }
}
NoopAnimationDriver.decorators = [
    { type: Injectable },
];
/** @nocollapse */ NoopAnimationDriver.ɵfac = function NoopAnimationDriver_Factory(t) { return new (t || NoopAnimationDriver)(); };
/** @nocollapse */ NoopAnimationDriver.ɵprov = i0.ɵɵdefineInjectable({ token: NoopAnimationDriver, factory: function (t) { return NoopAnimationDriver.ɵfac(t); }, providedIn: null });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NoopAnimationDriver, [{
        type: Injectable
    }], null, null); })();
/**
 * \@publicApi
 * @abstract
 */
export class AnimationDriver {
}
AnimationDriver.NOOP = new NoopAnimationDriver();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sVUFBVSxDQUFDOzs7OztBQU03RixNQUFNLE9BQU8sbUJBQW1COzs7OztJQUM5QixxQkFBcUIsQ0FBQyxJQUFZLElBQWEsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUVwRixjQUFjLENBQUMsT0FBWSxFQUFFLFFBQWdCO1FBQzNDLE9BQU8sY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDOzs7Ozs7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVMsSUFBYSxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0lBRXRGLEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE9BQU8sV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQzs7Ozs7OztJQUVELFlBQVksQ0FBQyxPQUFZLEVBQUUsSUFBWSxFQUFFLFlBQXFCO1FBQzVELE9BQU8sWUFBWSxJQUFJLEVBQUUsQ0FBQztJQUM1QixDQUFDOzs7Ozs7Ozs7OztJQUVELE9BQU8sQ0FDSCxPQUFZLEVBQUUsU0FBNkMsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFDNUYsTUFBYyxFQUFFLGtCQUF5QixFQUFFLEVBQzNDLHVCQUFpQztRQUNuQyxPQUFPLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xELENBQUM7OztZQXZCRixVQUFVOztzRkFDRSxtQkFBbUI7MkRBQW5CLG1CQUFtQixpQ0FBbkIsbUJBQW1CO2tEQUFuQixtQkFBbUI7Y0FEL0IsVUFBVTs7Ozs7O0FBNkJYLE1BQU0sT0FBZ0IsZUFBZTs7QUFDNUIsb0JBQUksR0FBb0IsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOzs7SUFBekQscUJBQXlEOzs7Ozs7SUFFekQsc0VBQXNEOzs7Ozs7O0lBRXRELDRFQUFpRTs7Ozs7OztJQUVqRSxzRUFBd0Q7Ozs7Ozs7O0lBRXhELDBFQUFzRTs7Ozs7Ozs7SUFFdEUsb0ZBQWlGOzs7Ozs7Ozs7Ozs7SUFFakYseUlBRTJGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtjb250YWluc0VsZW1lbnQsIGludm9rZVF1ZXJ5LCBtYXRjaGVzRWxlbWVudCwgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICcuL3NoYXJlZCc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvbkRyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wKTsgfVxuXG4gIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtYXRjaGVzRWxlbWVudChlbGVtZW50LCBzZWxlY3Rvcik7XG4gIH1cblxuICBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIGNvbnRhaW5zRWxlbWVudChlbG0xLCBlbG0yKTsgfVxuXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfVxuXG4gIGFuaW1hdGUoXG4gICAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn1bXSwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcixcbiAgICAgIGVhc2luZzogc3RyaW5nLCBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10sXG4gICAgICBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcihkdXJhdGlvbiwgZGVsYXkpO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRHJpdmVyIHtcbiAgc3RhdGljIE5PT1A6IEFuaW1hdGlvbkRyaXZlciA9IG5ldyBOb29wQW5pbWF0aW9uRHJpdmVyKCk7XG5cbiAgYWJzdHJhY3QgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuO1xuXG4gIGFic3RyYWN0IHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXTtcblxuICBhYnN0cmFjdCBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IHN0cmluZztcblxuICBhYnN0cmFjdCBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9W10sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsXG4gICAgICBlYXNpbmc/OiBzdHJpbmd8bnVsbCwgcHJldmlvdXNQbGF5ZXJzPzogYW55W10sIHNjcnViYmVyQWNjZXNzUmVxdWVzdGVkPzogYm9vbGVhbik6IGFueTtcbn1cbiJdfQ==