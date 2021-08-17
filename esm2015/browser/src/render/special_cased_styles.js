/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
 * @returns an instance of `SpecialCasedStyles` if any special styles are detected otherwise `null`
 */
export function packageNonAnimatableStyles(element, styles) {
    let startStyles = null;
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
export class SpecialCasedStyles {
    constructor(_element, _startStyles, _endStyles) {
        this._element = _element;
        this._startStyles = _startStyles;
        this._endStyles = _endStyles;
        this._state = 0 /* Pending */;
        let initialStyles = SpecialCasedStyles.initialStylesByElement.get(_element);
        if (!initialStyles) {
            SpecialCasedStyles.initialStylesByElement.set(_element, initialStyles = {});
        }
        this._initialStyles = initialStyles;
    }
    start() {
        if (this._state < 1 /* Started */) {
            if (this._startStyles) {
                setStyles(this._element, this._startStyles, this._initialStyles);
            }
            this._state = 1 /* Started */;
        }
    }
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
function filterNonAnimatableStyles(styles) {
    let result = null;
    const props = Object.keys(styles);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (isNonAnimatableStyle(prop)) {
            result = result || {};
            result[prop] = styles[prop];
        }
    }
    return result;
}
function isNonAnimatableStyle(prop) {
    return prop === 'display' || prop === 'position';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lhbF9jYXNlZF9zdHlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9zcGVjaWFsX2Nhc2VkX3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUUvQzs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLDBCQUEwQixDQUN0QyxPQUFZLEVBQUUsTUFBbUQ7SUFDbkUsSUFBSSxXQUFXLEdBQThCLElBQUksQ0FBQztJQUNsRCxJQUFJLFNBQVMsR0FBOEIsSUFBSSxDQUFDO0lBQ2hELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQzFDLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO0tBQ0Y7U0FBTSxJQUFJLE1BQU0sRUFBRTtRQUNqQixXQUFXLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakQ7SUFFRCxPQUFPLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQ1ksUUFBYSxFQUFVLFlBQXVD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QUMsQ0FBQztTQUM3QjtLQUNGO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsSUFBWTtJQUN4QyxPQUFPLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUNuRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2VyYXNlU3R5bGVzLCBzZXRTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG4vKipcbiAqIFJldHVybnMgYW4gaW5zdGFuY2Ugb2YgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaWYgYW5kIHdoZW4gYW55IHNwZWNpYWwgKG5vbiBhbmltYXRlYWJsZSkgc3R5bGVzIGFyZVxuICogZGV0ZWN0ZWQuXG4gKlxuICogSW4gQ1NTIHRoZXJlIGV4aXN0IHByb3BlcnRpZXMgdGhhdCBjYW5ub3QgYmUgYW5pbWF0ZWQgd2l0aGluIGEga2V5ZnJhbWUgYW5pbWF0aW9uXG4gKiAod2hldGhlciBpdCBiZSB2aWEgQ1NTIGtleWZyYW1lcyBvciB3ZWItYW5pbWF0aW9ucykgYW5kIHRoZSBhbmltYXRpb24gaW1wbGVtZW50YXRpb25cbiAqIHdpbGwgaWdub3JlIHRoZW0uIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gZGV0ZWN0IHRob3NlIHNwZWNpYWwgY2FzZWQgc3R5bGVzIGFuZFxuICogcmV0dXJuIGEgY29udGFpbmVyIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgYW5pbWF0aW9uLlxuICpcbiAqIEByZXR1cm5zIGFuIGluc3RhbmNlIG9mIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlmIGFueSBzcGVjaWFsIHN0eWxlcyBhcmUgZGV0ZWN0ZWQgb3RoZXJ3aXNlIGBudWxsYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFja2FnZU5vbkFuaW1hdGFibGVTdHlsZXMoXG4gICAgZWxlbWVudDogYW55LCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9fHtba2V5OiBzdHJpbmddOiBhbnl9W10pOiBTcGVjaWFsQ2FzZWRTdHlsZXN8bnVsbCB7XG4gIGxldCBzdGFydFN0eWxlczoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IG51bGw7XG4gIGxldCBlbmRTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSBudWxsO1xuICBpZiAoQXJyYXkuaXNBcnJheShzdHlsZXMpICYmIHN0eWxlcy5sZW5ndGgpIHtcbiAgICBzdGFydFN0eWxlcyA9IGZpbHRlck5vbkFuaW1hdGFibGVTdHlsZXMoc3R5bGVzWzBdKTtcbiAgICBpZiAoc3R5bGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGVuZFN0eWxlcyA9IGZpbHRlck5vbkFuaW1hdGFibGVTdHlsZXMoc3R5bGVzW3N0eWxlcy5sZW5ndGggLSAxXSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHN0eWxlcykge1xuICAgIHN0YXJ0U3R5bGVzID0gZmlsdGVyTm9uQW5pbWF0YWJsZVN0eWxlcyhzdHlsZXMpO1xuICB9XG5cbiAgcmV0dXJuIChzdGFydFN0eWxlcyB8fCBlbmRTdHlsZXMpID8gbmV3IFNwZWNpYWxDYXNlZFN0eWxlcyhlbGVtZW50LCBzdGFydFN0eWxlcywgZW5kU3R5bGVzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG59XG5cbi8qKlxuICogRGVzaWduZWQgdG8gYmUgZXhlY3V0ZWQgZHVyaW5nIGEga2V5ZnJhbWUtYmFzZWQgYW5pbWF0aW9uIHRvIGFwcGx5IGFueSBzcGVjaWFsLWNhc2VkIHN0eWxlcy5cbiAqXG4gKiBXaGVuIHN0YXJ0ZWQgKHdoZW4gdGhlIGBzdGFydCgpYCBtZXRob2QgaXMgcnVuKSB0aGVuIHRoZSBwcm92aWRlZCBgc3RhcnRTdHlsZXNgXG4gKiB3aWxsIGJlIGFwcGxpZWQuIFdoZW4gZmluaXNoZWQgKHdoZW4gdGhlIGBmaW5pc2goKWAgbWV0aG9kIGlzIGNhbGxlZCkgdGhlXG4gKiBgZW5kU3R5bGVzYCB3aWxsIGJlIGFwcGxpZWQgYXMgd2VsbCBhbnkgYW55IHN0YXJ0aW5nIHN0eWxlcy4gRmluYWxseSB3aGVuXG4gKiBgZGVzdHJveSgpYCBpcyBjYWxsZWQgdGhlbiBhbGwgc3R5bGVzIHdpbGwgYmUgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNwZWNpYWxDYXNlZFN0eWxlcyB7XG4gIHN0YXRpYyBpbml0aWFsU3R5bGVzQnlFbGVtZW50ID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwPGFueSwge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG5cbiAgcHJpdmF0ZSBfc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5QZW5kaW5nO1xuICBwcml2YXRlIF9pbml0aWFsU3R5bGVzIToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9lbGVtZW50OiBhbnksIHByaXZhdGUgX3N0YXJ0U3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsLFxuICAgICAgcHJpdmF0ZSBfZW5kU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsKSB7XG4gICAgbGV0IGluaXRpYWxTdHlsZXMgPSBTcGVjaWFsQ2FzZWRTdHlsZXMuaW5pdGlhbFN0eWxlc0J5RWxlbWVudC5nZXQoX2VsZW1lbnQpO1xuICAgIGlmICghaW5pdGlhbFN0eWxlcykge1xuICAgICAgU3BlY2lhbENhc2VkU3R5bGVzLmluaXRpYWxTdHlsZXNCeUVsZW1lbnQuc2V0KF9lbGVtZW50LCBpbml0aWFsU3R5bGVzID0ge30pO1xuICAgIH1cbiAgICB0aGlzLl9pbml0aWFsU3R5bGVzID0gaW5pdGlhbFN0eWxlcztcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmICh0aGlzLl9zdGF0ZSA8IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLlN0YXJ0ZWQpIHtcbiAgICAgIGlmICh0aGlzLl9zdGFydFN0eWxlcykge1xuICAgICAgICBzZXRTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5fc3RhcnRTdHlsZXMsIHRoaXMuX2luaXRpYWxTdHlsZXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5TdGFydGVkO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaCgpIHtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gICAgaWYgKHRoaXMuX3N0YXRlIDwgU3BlY2lhbENhc2VkU3R5bGVzU3RhdGUuRmluaXNoZWQpIHtcbiAgICAgIHNldFN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9pbml0aWFsU3R5bGVzKTtcbiAgICAgIGlmICh0aGlzLl9lbmRTdHlsZXMpIHtcbiAgICAgICAgc2V0U3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX2VuZFN0eWxlcyk7XG4gICAgICAgIHRoaXMuX2VuZFN0eWxlcyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9zdGF0ZSA9IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLlN0YXJ0ZWQ7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmZpbmlzaCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA8IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLkRlc3Ryb3llZCkge1xuICAgICAgU3BlY2lhbENhc2VkU3R5bGVzLmluaXRpYWxTdHlsZXNCeUVsZW1lbnQuZGVsZXRlKHRoaXMuX2VsZW1lbnQpO1xuICAgICAgaWYgKHRoaXMuX3N0YXJ0U3R5bGVzKSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX3N0YXJ0U3R5bGVzKTtcbiAgICAgICAgdGhpcy5fZW5kU3R5bGVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9lbmRTdHlsZXMpIHtcbiAgICAgICAgZXJhc2VTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5fZW5kU3R5bGVzKTtcbiAgICAgICAgdGhpcy5fZW5kU3R5bGVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldFN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9pbml0aWFsU3R5bGVzKTtcbiAgICAgIHRoaXMuX3N0YXRlID0gU3BlY2lhbENhc2VkU3R5bGVzU3RhdGUuRGVzdHJveWVkO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIGVudW0gb2Ygc3RhdGVzIHJlZmxlY3RpdmUgb2Ygd2hhdCB0aGUgc3RhdHVzIG9mIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlzLlxuICpcbiAqIERlcGVuZGluZyBvbiBob3cgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaXMgaW50ZXJhY3RlZCB3aXRoLCB0aGUgc3RhcnQgYW5kIGVuZFxuICogc3R5bGVzIG1heSBub3QgYmUgYXBwbGllZCBpbiB0aGUgc2FtZSB3YXkuIFRoaXMgZW51bSBlbnN1cmVzIHRoYXQgaWYgYW5kIHdoZW5cbiAqIHRoZSBlbmRpbmcgc3R5bGVzIGFyZSBhcHBsaWVkIHRoZW4gdGhlIHN0YXJ0aW5nIHN0eWxlcyBhcmUgYXBwbGllZC4gSXQgaXNcbiAqIGFsc28gdXNlZCB0byByZWZsZWN0IHdoYXQgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBzcGVjaWFsIGNhc2VkIHN0eWxlcyBhcmVcbiAqIHdoaWNoIGhlbHBzIHByZXZlbnQgdGhlIHN0YXJ0aW5nL2VuZGluZyBzdHlsZXMgbm90IGJlIGFwcGxpZWQgdHdpY2UuIEl0IGlzXG4gKiBhbHNvIHVzZWQgdG8gY2xlYW51cCB0aGUgc3R5bGVzIG9uY2UgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaXMgZGVzdHJveWVkLlxuICovXG5jb25zdCBlbnVtIFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlIHtcbiAgUGVuZGluZyA9IDAsXG4gIFN0YXJ0ZWQgPSAxLFxuICBGaW5pc2hlZCA9IDIsXG4gIERlc3Ryb3llZCA9IDMsXG59XG5cbmZ1bmN0aW9uIGZpbHRlck5vbkFuaW1hdGFibGVTdHlsZXMoc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICBsZXQgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHlsZXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJvcCA9IHByb3BzW2ldO1xuICAgIGlmIChpc05vbkFuaW1hdGFibGVTdHlsZShwcm9wKSkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHt9O1xuICAgICAgcmVzdWx0W3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc05vbkFuaW1hdGFibGVTdHlsZShwcm9wOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHByb3AgPT09ICdkaXNwbGF5JyB8fCBwcm9wID09PSAncG9zaXRpb24nO1xufVxuIl19