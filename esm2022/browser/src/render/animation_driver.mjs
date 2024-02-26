/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { Injectable } from '@angular/core';
import { containsElement, getParentElement, invokeQuery, validateStyleProperty } from './shared';
import * as i0 from "@angular/core";
/**
 * @publicApi
 *
 * `AnimationDriver` implentation for Noop animations
 */
export class NoopAnimationDriver {
    /**
     * @returns Whether `prop` is a valid CSS property
     */
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    /**
     * @deprecated unused
     */
    matchesElement(_element, _selector) {
        // This method is deprecated and no longer in use so we return false.
        return false;
    }
    /**
     *
     * @returns Whether elm1 contains elm2.
     */
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
    }
    /**
     * @returns Rhe parent of the given element or `null` if the element is the `document`
     */
    getParentElement(element) {
        return getParentElement(element);
    }
    /**
     * @returns The result of the query selector on the element. The array will contain up to 1 item
     *     if `multi` is  `false`.
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @returns The `defaultValue` or empty string
     */
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    /**
     * @returns An `NoopAnimationPlayer`
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        return new NoopAnimationPlayer(duration, delay);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0-next.0+sha-d4343b5", ngImport: i0, type: NoopAnimationDriver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.0-next.0+sha-d4343b5", ngImport: i0, type: NoopAnimationDriver }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0-next.0+sha-d4343b5", ngImport: i0, type: NoopAnimationDriver, decorators: [{
            type: Injectable
        }] });
/**
 * @publicApi
 */
export class AnimationDriver {
    /**
     * @deprecated Use the NoopAnimationDriver class.
     */
    static { this.NOOP = new NoopAnimationDriver(); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRS9GOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCOztPQUVHO0lBQ0gscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUFhLEVBQUUsU0FBaUI7UUFDN0MscUVBQXFFO1FBQ3JFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWUsQ0FBQyxJQUFTLEVBQUUsSUFBUztRQUNsQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCLENBQUMsT0FBZ0I7UUFDL0IsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLE9BQVksRUFBRSxRQUFnQixFQUFFLEtBQWM7UUFDbEQsT0FBTyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTyxDQUNMLE9BQVksRUFDWixTQUE4QyxFQUM5QyxRQUFnQixFQUNoQixLQUFhLEVBQ2IsTUFBYyxFQUNkLGtCQUF5QixFQUFFLEVBQzNCLHVCQUFpQztRQUVqQyxPQUFPLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xELENBQUM7eUhBM0RVLG1CQUFtQjs2SEFBbkIsbUJBQW1COztzR0FBbkIsbUJBQW1CO2tCQUQvQixVQUFVOztBQStEWDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsZUFBZTtJQUNuQzs7T0FFRzthQUNJLFNBQUksR0FBb0MsSUFBSSxtQkFBbUIsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2NvbnRhaW5zRWxlbWVudCwgZ2V0UGFyZW50RWxlbWVudCwgaW52b2tlUXVlcnksIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnLi9zaGFyZWQnO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBgQW5pbWF0aW9uRHJpdmVyYCBpbXBsZW50YXRpb24gZm9yIE5vb3AgYW5pbWF0aW9uc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvbkRyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIC8qKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGBwcm9wYCBpcyBhIHZhbGlkIENTUyBwcm9wZXJ0eVxuICAgKi9cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdW51c2VkXG4gICAqL1xuICBtYXRjaGVzRWxlbWVudChfZWxlbWVudDogYW55LCBfc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQgYW5kIG5vIGxvbmdlciBpbiB1c2Ugc28gd2UgcmV0dXJuIGZhbHNlLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGVsbTEgY29udGFpbnMgZWxtMi5cbiAgICovXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgUmhlIHBhcmVudCBvZiB0aGUgZ2l2ZW4gZWxlbWVudCBvciBgbnVsbGAgaWYgdGhlIGVsZW1lbnQgaXMgdGhlIGBkb2N1bWVudGBcbiAgICovXG4gIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd24ge1xuICAgIHJldHVybiBnZXRQYXJlbnRFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoZSBlbGVtZW50LiBUaGUgYXJyYXkgd2lsbCBjb250YWluIHVwIHRvIDEgaXRlbVxuICAgKiAgICAgaWYgYG11bHRpYCBpcyAgYGZhbHNlYC5cbiAgICovXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIGBkZWZhdWx0VmFsdWVgIG9yIGVtcHR5IHN0cmluZ1xuICAgKi9cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgQW4gYE5vb3BBbmltYXRpb25QbGF5ZXJgXG4gICAqL1xuICBhbmltYXRlKFxuICAgIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IEFycmF5PE1hcDxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4+LFxuICAgIGR1cmF0aW9uOiBudW1iZXIsXG4gICAgZGVsYXk6IG51bWJlcixcbiAgICBlYXNpbmc6IHN0cmluZyxcbiAgICBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10sXG4gICAgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuLFxuICApOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcihkdXJhdGlvbiwgZGVsYXkpO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRHJpdmVyIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB0aGUgTm9vcEFuaW1hdGlvbkRyaXZlciBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBOT09QOiBBbmltYXRpb25Ecml2ZXIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE5vb3BBbmltYXRpb25Ecml2ZXIoKTtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZUFuaW1hdGFibGVTdHlsZVByb3BlcnR5PzogKHByb3A6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIGluIHVzZS4gV2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBPYnRhaW5zIHRoZSBwYXJlbnQgZWxlbWVudCwgaWYgYW55LiBgbnVsbGAgaXMgcmV0dXJuZWQgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudC5cbiAgICovXG4gIGFic3RyYWN0IGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd247XG5cbiAgYWJzdHJhY3QgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdO1xuXG4gIGFic3RyYWN0IGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IGFuaW1hdGUoXG4gICAgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogQXJyYXk8TWFwPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPj4sXG4gICAgZHVyYXRpb246IG51bWJlcixcbiAgICBkZWxheTogbnVtYmVyLFxuICAgIGVhc2luZz86IHN0cmluZyB8IG51bGwsXG4gICAgcHJldmlvdXNQbGF5ZXJzPzogYW55W10sXG4gICAgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuLFxuICApOiBhbnk7XG59XG4iXX0=