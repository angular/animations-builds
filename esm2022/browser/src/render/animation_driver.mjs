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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NoopAnimationDriver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NoopAnimationDriver }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0-next.0+sha-f271021", ngImport: i0, type: NoopAnimationDriver, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRS9GOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCOztPQUVHO0lBQ0gscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixDQUFDLE9BQWdCO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE9BQU8sV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLE9BQVksRUFBRSxJQUFZLEVBQUUsWUFBcUI7UUFDNUQsT0FBTyxZQUFZLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sQ0FDTCxPQUFZLEVBQ1osU0FBOEMsRUFDOUMsUUFBZ0IsRUFDaEIsS0FBYSxFQUNiLE1BQWMsRUFDZCxrQkFBeUIsRUFBRSxFQUMzQix1QkFBaUM7UUFFakMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO3lIQW5EVSxtQkFBbUI7NkhBQW5CLG1CQUFtQjs7c0dBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVTs7QUF1RFg7O0dBRUc7QUFDSCxNQUFNLE9BQWdCLGVBQWU7SUFDbkM7O09BRUc7YUFDSSxTQUFJLEdBQW9DLElBQUksbUJBQW1CLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtjb250YWluc0VsZW1lbnQsIGdldFBhcmVudEVsZW1lbnQsIGludm9rZVF1ZXJ5LCB2YWxpZGF0ZVN0eWxlUHJvcGVydHl9IGZyb20gJy4vc2hhcmVkJztcblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKlxuICogYEFuaW1hdGlvbkRyaXZlcmAgaW1wbGVudGF0aW9uIGZvciBOb29wIGFuaW1hdGlvbnNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5vb3BBbmltYXRpb25Ecml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICAvKipcbiAgICogQHJldHVybnMgV2hldGhlciBgcHJvcGAgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICovXG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgZWxtMSBjb250YWlucyBlbG0yLlxuICAgKi9cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbnRhaW5zRWxlbWVudChlbG0xLCBlbG0yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBSaGUgcGFyZW50IG9mIHRoZSBnaXZlbiBlbGVtZW50IG9yIGBudWxsYCBpZiB0aGUgZWxlbWVudCBpcyB0aGUgYGRvY3VtZW50YFxuICAgKi9cbiAgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93biB7XG4gICAgcmV0dXJuIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhlIGVsZW1lbnQuIFRoZSBhcnJheSB3aWxsIGNvbnRhaW4gdXAgdG8gMSBpdGVtXG4gICAqICAgICBpZiBgbXVsdGlgIGlzICBgZmFsc2VgLlxuICAgKi9cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBUaGUgYGRlZmF1bHRWYWx1ZWAgb3IgZW1wdHkgc3RyaW5nXG4gICAqL1xuICBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBBbiBgTm9vcEFuaW1hdGlvblBsYXllcmBcbiAgICovXG4gIGFuaW1hdGUoXG4gICAgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogQXJyYXk8TWFwPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPj4sXG4gICAgZHVyYXRpb246IG51bWJlcixcbiAgICBkZWxheTogbnVtYmVyLFxuICAgIGVhc2luZzogc3RyaW5nLFxuICAgIHByZXZpb3VzUGxheWVyczogYW55W10gPSBbXSxcbiAgICBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4sXG4gICk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKGR1cmF0aW9uLCBkZWxheSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbmltYXRpb25Ecml2ZXIge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHRoZSBOb29wQW5pbWF0aW9uRHJpdmVyIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIE5PT1A6IEFuaW1hdGlvbkRyaXZlciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTm9vcEFuaW1hdGlvbkRyaXZlcigpO1xuXG4gIGFic3RyYWN0IHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIGFic3RyYWN0IHZhbGlkYXRlQW5pbWF0YWJsZVN0eWxlUHJvcGVydHk/OiAocHJvcDogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gIGFic3RyYWN0IGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE9idGFpbnMgdGhlIHBhcmVudCBlbGVtZW50LCBpZiBhbnkuIGBudWxsYCBpcyByZXR1cm5lZCBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93bjtcblxuICBhYnN0cmFjdCBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W107XG5cbiAgYWJzdHJhY3QgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgYW5pbWF0ZShcbiAgICBlbGVtZW50OiBhbnksXG4gICAga2V5ZnJhbWVzOiBBcnJheTxNYXA8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXI+PixcbiAgICBkdXJhdGlvbjogbnVtYmVyLFxuICAgIGRlbGF5OiBudW1iZXIsXG4gICAgZWFzaW5nPzogc3RyaW5nIHwgbnVsbCxcbiAgICBwcmV2aW91c1BsYXllcnM/OiBhbnlbXSxcbiAgICBzY3J1YmJlckFjY2Vzc1JlcXVlc3RlZD86IGJvb2xlYW4sXG4gICk6IGFueTtcbn1cbiJdfQ==