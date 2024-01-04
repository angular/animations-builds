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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.5+sha-f4bd5a3", ngImport: i0, type: NoopAnimationDriver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.5+sha-f4bd5a3", ngImport: i0, type: NoopAnimationDriver }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.5+sha-f4bd5a3", ngImport: i0, type: NoopAnimationDriver, decorators: [{
            type: Injectable
        }] });
/**
 * @publicApi
 */
export class AnimationDriver {
    /**
     * @deprecated Use the NoopAnimationDriver class.
     */
    static { this.NOOP = ( /* @__PURE__ */new NoopAnimationDriver()); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRS9GOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCOztPQUVHO0lBQ0gscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUFhLEVBQUUsU0FBaUI7UUFDN0MscUVBQXFFO1FBQ3JFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWUsQ0FBQyxJQUFTLEVBQUUsSUFBUztRQUNsQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCLENBQUMsT0FBZ0I7UUFDL0IsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLE9BQVksRUFBRSxRQUFnQixFQUFFLEtBQWM7UUFDbEQsT0FBTyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTyxDQUNILE9BQVksRUFBRSxTQUE0QyxFQUFFLFFBQWdCLEVBQUUsS0FBYSxFQUMzRixNQUFjLEVBQUUsa0JBQXlCLEVBQUUsRUFDM0MsdUJBQWlDO1FBQ25DLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQzt5SEF0RFUsbUJBQW1COzZIQUFuQixtQkFBbUI7O3NHQUFuQixtQkFBbUI7a0JBRC9CLFVBQVU7O0FBMERYOztHQUVHO0FBQ0gsTUFBTSxPQUFnQixlQUFlO0lBQ25DOztPQUVHO2FBQ0ksU0FBSSxHQUFvQixFQUFDLGVBQWdCLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2NvbnRhaW5zRWxlbWVudCwgZ2V0UGFyZW50RWxlbWVudCwgaW52b2tlUXVlcnksIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnLi9zaGFyZWQnO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBgQW5pbWF0aW9uRHJpdmVyYCBpbXBsZW50YXRpb24gZm9yIE5vb3AgYW5pbWF0aW9uc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvbkRyaXZlciBpbXBsZW1lbnRzIEFuaW1hdGlvbkRyaXZlciB7XG4gIC8qKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGBwcm9wYCBpcyBhIHZhbGlkIENTUyBwcm9wZXJ0eVxuICAgKi9cbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdW51c2VkXG4gICAqL1xuICBtYXRjaGVzRWxlbWVudChfZWxlbWVudDogYW55LCBfc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQgYW5kIG5vIGxvbmdlciBpbiB1c2Ugc28gd2UgcmV0dXJuIGZhbHNlLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGVsbTEgY29udGFpbnMgZWxtMi5cbiAgICovXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgUmhlIHBhcmVudCBvZiB0aGUgZ2l2ZW4gZWxlbWVudCBvciBgbnVsbGAgaWYgdGhlIGVsZW1lbnQgaXMgdGhlIGBkb2N1bWVudGBcbiAgICovXG4gIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd24ge1xuICAgIHJldHVybiBnZXRQYXJlbnRFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoZSBlbGVtZW50LiBUaGUgYXJyYXkgd2lsbCBjb250YWluIHVwIHRvIDEgaXRlbVxuICAgKiAgICAgaWYgYG11bHRpYCBpcyAgYGZhbHNlYC5cbiAgICovXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIGBkZWZhdWx0VmFsdWVgIG9yIGVtcHR5IHN0cmluZ1xuICAgKi9cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgQW4gYE5vb3BBbmltYXRpb25QbGF5ZXJgXG4gICAqL1xuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IEFycmF5PE1hcDxzdHJpbmcsIHN0cmluZ3xudW1iZXI+PiwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcixcbiAgICAgIGVhc2luZzogc3RyaW5nLCBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10sXG4gICAgICBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcihkdXJhdGlvbiwgZGVsYXkpO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRHJpdmVyIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB0aGUgTm9vcEFuaW1hdGlvbkRyaXZlciBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBOT09QOiBBbmltYXRpb25Ecml2ZXIgPSAoLyogQF9fUFVSRV9fICovIG5ldyBOb29wQW5pbWF0aW9uRHJpdmVyKCkpO1xuXG4gIGFic3RyYWN0IHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGFic3RyYWN0IHZhbGlkYXRlQW5pbWF0YWJsZVN0eWxlUHJvcGVydHk/OiAocHJvcDogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgaW4gdXNlLiBXaWxsIGJlIHJlbW92ZWQuXG4gICAqL1xuICBhYnN0cmFjdCBtYXRjaGVzRWxlbWVudChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGFic3RyYWN0IGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE9idGFpbnMgdGhlIHBhcmVudCBlbGVtZW50LCBpZiBhbnkuIGBudWxsYCBpcyByZXR1cm5lZCBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93bjtcblxuICBhYnN0cmFjdCBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W107XG5cbiAgYWJzdHJhY3QgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiBBcnJheTxNYXA8c3RyaW5nLCBzdHJpbmd8bnVtYmVyPj4sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsXG4gICAgICBlYXNpbmc/OiBzdHJpbmd8bnVsbCwgcHJldmlvdXNQbGF5ZXJzPzogYW55W10sIHNjcnViYmVyQWNjZXNzUmVxdWVzdGVkPzogYm9vbGVhbik6IGFueTtcbn1cbiJdfQ==