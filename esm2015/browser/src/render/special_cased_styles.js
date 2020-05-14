/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/special_cased_styles.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { eraseStyles, setStyles } from '../util';
/**
 * Returns an instance of `SpecialCasedStyles` if and when any special (non animateable) styles are
 * detected.
 *
 * In CSS there exist properties that cannot be animated within a keyframe animation
 * (whether it be via CSS keyframes or web-animations) and the animation implementation
 * will ignore them. This function is designed to detect those special cased styles and
 * return a container that will be executed at the start and end of the animation.
 *
 * @param {?} element
 * @param {?} styles
 * @return {?} an instance of `SpecialCasedStyles` if any special styles are detected otherwise `null`
 */
export function packageNonAnimatableStyles(element, styles) {
    /** @type {?} */
    let startStyles = null;
    /** @type {?} */
    let endStyles = null;
    if (Array.isArray(styles) && styles.length) {
        startStyles = filterNonAnimatableStyles(styles[0]);
        if (styles.length > 1) {
            endStyles = filterNonAnimatableStyles(styles[styles.length - 1]);
        }
    }
    else if (styles) {
        startStyles = filterNonAnimatableStyles(styles);
    }
    return (startStyles || endStyles) ? new SpecialCasedStyles(element, startStyles, endStyles) :
        null;
}
/**
 * Designed to be executed during a keyframe-based animation to apply any special-cased styles.
 *
 * When started (when the `start()` method is run) then the provided `startStyles`
 * will be applied. When finished (when the `finish()` method is called) the
 * `endStyles` will be applied as well any any starting styles. Finally when
 * `destroy()` is called then all styles will be removed.
 */
let SpecialCasedStyles = /** @class */ (() => {
    /**
     * Designed to be executed during a keyframe-based animation to apply any special-cased styles.
     *
     * When started (when the `start()` method is run) then the provided `startStyles`
     * will be applied. When finished (when the `finish()` method is called) the
     * `endStyles` will be applied as well any any starting styles. Finally when
     * `destroy()` is called then all styles will be removed.
     */
    class SpecialCasedStyles {
        /**
         * @param {?} _element
         * @param {?} _startStyles
         * @param {?} _endStyles
         */
        constructor(_element, _startStyles, _endStyles) {
            this._element = _element;
            this._startStyles = _startStyles;
            this._endStyles = _endStyles;
            this._state = 0 /* Pending */;
            /** @type {?} */
            let initialStyles = SpecialCasedStyles.initialStylesByElement.get(_element);
            if (!initialStyles) {
                SpecialCasedStyles.initialStylesByElement.set(_element, initialStyles = {});
            }
            this._initialStyles = initialStyles;
        }
        /**
         * @return {?}
         */
        start() {
            if (this._state < 1 /* Started */) {
                if (this._startStyles) {
                    setStyles(this._element, this._startStyles, this._initialStyles);
                }
                this._state = 1 /* Started */;
            }
        }
        /**
         * @return {?}
         */
        finish() {
            this.start();
            if (this._state < 2 /* Finished */) {
                setStyles(this._element, this._initialStyles);
                if (this._endStyles) {
                    setStyles(this._element, this._endStyles);
                    this._endStyles = null;
                }
                this._state = 1 /* Started */;
            }
        }
        /**
         * @return {?}
         */
        destroy() {
            this.finish();
            if (this._state < 3 /* Destroyed */) {
                SpecialCasedStyles.initialStylesByElement.delete(this._element);
                if (this._startStyles) {
                    eraseStyles(this._element, this._startStyles);
                    this._endStyles = null;
                }
                if (this._endStyles) {
                    eraseStyles(this._element, this._endStyles);
                    this._endStyles = null;
                }
                setStyles(this._element, this._initialStyles);
                this._state = 3 /* Destroyed */;
            }
        }
    }
    SpecialCasedStyles.initialStylesByElement = new WeakMap();
    return SpecialCasedStyles;
})();
export { SpecialCasedStyles };
if (false) {
    /** @type {?} */
    SpecialCasedStyles.initialStylesByElement;
    /**
     * @type {?}
     * @private
     */
    SpecialCasedStyles.prototype._state;
    /**
     * @type {?}
     * @private
     */
    SpecialCasedStyles.prototype._initialStyles;
    /**
     * @type {?}
     * @private
     */
    SpecialCasedStyles.prototype._element;
    /**
     * @type {?}
     * @private
     */
    SpecialCasedStyles.prototype._startStyles;
    /**
     * @type {?}
     * @private
     */
    SpecialCasedStyles.prototype._endStyles;
}
/** @enum {number} */
const SpecialCasedStylesState = {
    Pending: 0,
    Started: 1,
    Finished: 2,
    Destroyed: 3,
};
/**
 * @param {?} styles
 * @return {?}
 */
function filterNonAnimatableStyles(styles) {
    /** @type {?} */
    let result = null;
    /** @type {?} */
    const props = Object.keys(styles);
    for (let i = 0; i < props.length; i++) {
        /** @type {?} */
        const prop = props[i];
        if (isNonAnimatableStyle(prop)) {
            result = result || {};
            result[prop] = styles[prop];
        }
    }
    return result;
}
/**
 * @param {?} prop
 * @return {?}
 */
function isNonAnimatableStyle(prop) {
    return prop === 'display' || prop === 'position';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lhbF9jYXNlZF9zdHlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9zcGVjaWFsX2Nhc2VkX3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFhL0MsTUFBTSxVQUFVLDBCQUEwQixDQUN0QyxPQUFZLEVBQUUsTUFBbUQ7O1FBQy9ELFdBQVcsR0FBOEIsSUFBSTs7UUFDN0MsU0FBUyxHQUE4QixJQUFJO0lBQy9DLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQzFDLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO0tBQ0Y7U0FBTSxJQUFJLE1BQU0sRUFBRTtRQUNqQixXQUFXLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakQ7SUFFRCxPQUFPLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUM7QUFDM0MsQ0FBQzs7Ozs7Ozs7O0FBVUQ7Ozs7Ozs7OztJQUFBLE1BQWEsa0JBQWtCOzs7Ozs7UUFNN0IsWUFDWSxRQUFhLEVBQVUsWUFBdUMsRUFDOUQsVUFBcUM7WUFEckMsYUFB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LE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Y0FDL0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDOzs7OztBQUVELFNBQVMsb0JBQW9CLENBQUMsSUFBWTtJQUN4QyxPQUFPLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUNuRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtlcmFzZVN0eWxlcywgc2V0U3R5bGVzfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlmIGFuZCB3aGVuIGFueSBzcGVjaWFsIChub24gYW5pbWF0ZWFibGUpIHN0eWxlcyBhcmVcbiAqIGRldGVjdGVkLlxuICpcbiAqIEluIENTUyB0aGVyZSBleGlzdCBwcm9wZXJ0aWVzIHRoYXQgY2Fubm90IGJlIGFuaW1hdGVkIHdpdGhpbiBhIGtleWZyYW1lIGFuaW1hdGlvblxuICogKHdoZXRoZXIgaXQgYmUgdmlhIENTUyBrZXlmcmFtZXMgb3Igd2ViLWFuaW1hdGlvbnMpIGFuZCB0aGUgYW5pbWF0aW9uIGltcGxlbWVudGF0aW9uXG4gKiB3aWxsIGlnbm9yZSB0aGVtLiBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGRldGVjdCB0aG9zZSBzcGVjaWFsIGNhc2VkIHN0eWxlcyBhbmRcbiAqIHJldHVybiBhIGNvbnRhaW5lciB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgdGhlIHN0YXJ0IGFuZCBlbmQgb2YgdGhlIGFuaW1hdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBhbiBpbnN0YW5jZSBvZiBgU3BlY2lhbENhc2VkU3R5bGVzYCBpZiBhbnkgc3BlY2lhbCBzdHlsZXMgYXJlIGRldGVjdGVkIG90aGVyd2lzZSBgbnVsbGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhY2thZ2VOb25BbmltYXRhYmxlU3R5bGVzKFxuICAgIGVsZW1lbnQ6IGFueSwgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXx7W2tleTogc3RyaW5nXTogYW55fVtdKTogU3BlY2lhbENhc2VkU3R5bGVzfG51bGwge1xuICBsZXQgc3RhcnRTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSBudWxsO1xuICBsZXQgZW5kU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R5bGVzKSAmJiBzdHlsZXMubGVuZ3RoKSB7XG4gICAgc3RhcnRTdHlsZXMgPSBmaWx0ZXJOb25BbmltYXRhYmxlU3R5bGVzKHN0eWxlc1swXSk7XG4gICAgaWYgKHN0eWxlcy5sZW5ndGggPiAxKSB7XG4gICAgICBlbmRTdHlsZXMgPSBmaWx0ZXJOb25BbmltYXRhYmxlU3R5bGVzKHN0eWxlc1tzdHlsZXMubGVuZ3RoIC0gMV0pO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzdHlsZXMpIHtcbiAgICBzdGFydFN0eWxlcyA9IGZpbHRlck5vbkFuaW1hdGFibGVTdHlsZXMoc3R5bGVzKTtcbiAgfVxuXG4gIHJldHVybiAoc3RhcnRTdHlsZXMgfHwgZW5kU3R5bGVzKSA/IG5ldyBTcGVjaWFsQ2FzZWRTdHlsZXMoZWxlbWVudCwgc3RhcnRTdHlsZXMsIGVuZFN0eWxlcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xufVxuXG4vKipcbiAqIERlc2lnbmVkIHRvIGJlIGV4ZWN1dGVkIGR1cmluZyBhIGtleWZyYW1lLWJhc2VkIGFuaW1hdGlvbiB0byBhcHBseSBhbnkgc3BlY2lhbC1jYXNlZCBzdHlsZXMuXG4gKlxuICogV2hlbiBzdGFydGVkICh3aGVuIHRoZSBgc3RhcnQoKWAgbWV0aG9kIGlzIHJ1bikgdGhlbiB0aGUgcHJvdmlkZWQgYHN0YXJ0U3R5bGVzYFxuICogd2lsbCBiZSBhcHBsaWVkLiBXaGVuIGZpbmlzaGVkICh3aGVuIHRoZSBgZmluaXNoKClgIG1ldGhvZCBpcyBjYWxsZWQpIHRoZVxuICogYGVuZFN0eWxlc2Agd2lsbCBiZSBhcHBsaWVkIGFzIHdlbGwgYW55IGFueSBzdGFydGluZyBzdHlsZXMuIEZpbmFsbHkgd2hlblxuICogYGRlc3Ryb3koKWAgaXMgY2FsbGVkIHRoZW4gYWxsIHN0eWxlcyB3aWxsIGJlIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGVjaWFsQ2FzZWRTdHlsZXMge1xuICBzdGF0aWMgaW5pdGlhbFN0eWxlc0J5RWxlbWVudCA9IG5ldyBXZWFrTWFwPGFueSwge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG5cbiAgcHJpdmF0ZSBfc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5QZW5kaW5nO1xuICBwcml2YXRlIF9pbml0aWFsU3R5bGVzIToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9lbGVtZW50OiBhbnksIHByaXZhdGUgX3N0YXJ0U3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsLFxuICAgICAgcHJpdmF0ZSBfZW5kU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsKSB7XG4gICAgbGV0IGluaXRpYWxTdHlsZXMgPSBTcGVjaWFsQ2FzZWRTdHlsZXMuaW5pdGlhbFN0eWxlc0J5RWxlbWVudC5nZXQoX2VsZW1lbnQpO1xuICAgIGlmICghaW5pdGlhbFN0eWxlcykge1xuICAgICAgU3BlY2lhbENhc2VkU3R5bGVzLmluaXRpYWxTdHlsZXNCeUVsZW1lbnQuc2V0KF9lbGVtZW50LCBpbml0aWFsU3R5bGVzID0ge30pO1xuICAgIH1cbiAgICB0aGlzLl9pbml0aWFsU3R5bGVzID0gaW5pdGlhbFN0eWxlcztcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmICh0aGlzLl9zdGF0ZSA8IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLlN0YXJ0ZWQpIHtcbiAgICAgIGlmICh0aGlzLl9zdGFydFN0eWxlcykge1xuICAgICAgICBzZXRTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5fc3RhcnRTdHlsZXMsIHRoaXMuX2luaXRpYWxTdHlsZXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5TdGFydGVkO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaCgpIHtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gICAgaWYgKHRoaXMuX3N0YXRlIDwgU3BlY2lhbENhc2VkU3R5bGVzU3RhdGUuRmluaXNoZWQpIHtcbiAgICAgIHNldFN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9pbml0aWFsU3R5bGVzKTtcbiAgICAgIGlmICh0aGlzLl9lbmRTdHlsZXMpIHtcbiAgICAgICAgc2V0U3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX2VuZFN0eWxlcyk7XG4gICAgICAgIHRoaXMuX2VuZFN0eWxlcyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9zdGF0ZSA9IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLlN0YXJ0ZWQ7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmZpbmlzaCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA8IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLkRlc3Ryb3llZCkge1xuICAgICAgU3BlY2lhbENhc2VkU3R5bGVzLmluaXRpYWxTdHlsZXNCeUVsZW1lbnQuZGVsZXRlKHRoaXMuX2VsZW1lbnQpO1xuICAgICAgaWYgKHRoaXMuX3N0YXJ0U3R5bGVzKSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX3N0YXJ0U3R5bGVzKTtcbiAgICAgICAgdGhpcy5fZW5kU3R5bGVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9lbmRTdHlsZXMpIHtcbiAgICAgICAgZXJhc2VTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5fZW5kU3R5bGVzKTtcbiAgICAgICAgdGhpcy5fZW5kU3R5bGVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldFN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9pbml0aWFsU3R5bGVzKTtcbiAgICAgIHRoaXMuX3N0YXRlID0gU3BlY2lhbENhc2VkU3R5bGVzU3RhdGUuRGVzdHJveWVkO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIGVudW0gb2Ygc3RhdGVzIHJlZmxlY3RpdmUgb2Ygd2hhdCB0aGUgc3RhdHVzIG9mIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlzLlxuICpcbiAqIERlcGVuZGluZyBvbiBob3cgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaXMgaW50ZXJhY3RlZCB3aXRoLCB0aGUgc3RhcnQgYW5kIGVuZFxuICogc3R5bGVzIG1heSBub3QgYmUgYXBwbGllZCBpbiB0aGUgc2FtZSB3YXkuIFRoaXMgZW51bSBlbnN1cmVzIHRoYXQgaWYgYW5kIHdoZW5cbiAqIHRoZSBlbmRpbmcgc3R5bGVzIGFyZSBhcHBsaWVkIHRoZW4gdGhlIHN0YXJ0aW5nIHN0eWxlcyBhcmUgYXBwbGllZC4gSXQgaXNcbiAqIGFsc28gdXNlZCB0byByZWZsZWN0IHdoYXQgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBzcGVjaWFsIGNhc2VkIHN0eWxlcyBhcmVcbiAqIHdoaWNoIGhlbHBzIHByZXZlbnQgdGhlIHN0YXJ0aW5nL2VuZGluZyBzdHlsZXMgbm90IGJlIGFwcGxpZWQgdHdpY2UuIEl0IGlzXG4gKiBhbHNvIHVzZWQgdG8gY2xlYW51cCB0aGUgc3R5bGVzIG9uY2UgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaXMgZGVzdHJveWVkLlxuICovXG5jb25zdCBlbnVtIFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlIHtcbiAgUGVuZGluZyA9IDAsXG4gIFN0YXJ0ZWQgPSAxLFxuICBGaW5pc2hlZCA9IDIsXG4gIERlc3Ryb3llZCA9IDMsXG59XG5cbmZ1bmN0aW9uIGZpbHRlck5vbkFuaW1hdGFibGVTdHlsZXMoc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICBsZXQgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHlsZXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJvcCA9IHByb3BzW2ldO1xuICAgIGlmIChpc05vbkFuaW1hdGFibGVTdHlsZShwcm9wKSkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHt9O1xuICAgICAgcmVzdWx0W3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc05vbkFuaW1hdGFibGVTdHlsZShwcm9wOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHByb3AgPT09ICdkaXNwbGF5JyB8fCBwcm9wID09PSAncG9zaXRpb24nO1xufVxuIl19