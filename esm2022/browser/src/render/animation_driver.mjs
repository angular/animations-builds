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
 */
class NoopAnimationDriver {
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    matchesElement(_element, _selector) {
        // This method is deprecated and no longer in use so we return false.
        return false;
    }
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
    }
    getParentElement(element) {
        return getParentElement(element);
    }
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        return new NoopAnimationPlayer(duration, delay);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.2+sha-c92220a", ngImport: i0, type: NoopAnimationDriver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.2+sha-c92220a", ngImport: i0, type: NoopAnimationDriver }); }
}
export { NoopAnimationDriver };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.2+sha-c92220a", ngImport: i0, type: NoopAnimationDriver, decorators: [{
            type: Injectable
        }] });
/**
 * @publicApi
 */
class AnimationDriver {
    static { this.NOOP = ( /* @__PURE__ */new NoopAnimationDriver()); }
}
export { AnimationDriver };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRS9GOztHQUVHO0FBQ0gsTUFDYSxtQkFBbUI7SUFDOUIscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxjQUFjLENBQUMsUUFBYSxFQUFFLFNBQWlCO1FBQzdDLHFFQUFxRTtRQUNyRSxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFnQjtRQUMvQixPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtRQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELE9BQU8sQ0FDSCxPQUFZLEVBQUUsU0FBNEMsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFDM0YsTUFBYyxFQUFFLGtCQUF5QixFQUFFLEVBQzNDLHVCQUFpQztRQUNuQyxPQUFPLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xELENBQUM7eUhBL0JVLG1CQUFtQjs2SEFBbkIsbUJBQW1COztTQUFuQixtQkFBbUI7c0dBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVTs7QUFtQ1g7O0dBRUc7QUFDSCxNQUFzQixlQUFlO2FBQzVCLFNBQUksR0FBb0IsRUFBQyxlQUFnQixJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQzs7U0FEdkQsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtjb250YWluc0VsZW1lbnQsIGdldFBhcmVudEVsZW1lbnQsIGludm9rZVF1ZXJ5LCB2YWxpZGF0ZVN0eWxlUHJvcGVydHl9IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOb29wQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCk7XG4gIH1cblxuICBtYXRjaGVzRWxlbWVudChfZWxlbWVudDogYW55LCBfc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQgYW5kIG5vIGxvbmdlciBpbiB1c2Ugc28gd2UgcmV0dXJuIGZhbHNlLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7XG4gIH1cblxuICBnZXRQYXJlbnRFbGVtZW50KGVsZW1lbnQ6IHVua25vd24pOiB1bmtub3duIHtcbiAgICByZXR1cm4gZ2V0UGFyZW50RWxlbWVudChlbGVtZW50KTtcbiAgfVxuXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfVxuXG4gIGFuaW1hdGUoXG4gICAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczogQXJyYXk8TWFwPHN0cmluZywgc3RyaW5nfG51bWJlcj4+LCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLFxuICAgICAgZWFzaW5nOiBzdHJpbmcsIHByZXZpb3VzUGxheWVyczogYW55W10gPSBbXSxcbiAgICAgIHNjcnViYmVyQWNjZXNzUmVxdWVzdGVkPzogYm9vbGVhbik6IEFuaW1hdGlvblBsYXllciB7XG4gICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKGR1cmF0aW9uLCBkZWxheSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbmltYXRpb25Ecml2ZXIge1xuICBzdGF0aWMgTk9PUDogQW5pbWF0aW9uRHJpdmVyID0gKC8qIEBfX1BVUkVfXyAqLyBuZXcgTm9vcEFuaW1hdGlvbkRyaXZlcigpKTtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZUFuaW1hdGFibGVTdHlsZVByb3BlcnR5PzogKHByb3A6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIGluIHVzZS4gV2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBPYnRhaW5zIHRoZSBwYXJlbnQgZWxlbWVudCwgaWYgYW55LiBgbnVsbGAgaXMgcmV0dXJuZWQgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudC5cbiAgICovXG4gIGFic3RyYWN0IGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd247XG5cbiAgYWJzdHJhY3QgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdO1xuXG4gIGFic3RyYWN0IGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IGFuaW1hdGUoXG4gICAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczogQXJyYXk8TWFwPHN0cmluZywgc3RyaW5nfG51bWJlcj4+LCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLFxuICAgICAgZWFzaW5nPzogc3RyaW5nfG51bGwsIHByZXZpb3VzUGxheWVycz86IGFueVtdLCBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4pOiBhbnk7XG59XG4iXX0=