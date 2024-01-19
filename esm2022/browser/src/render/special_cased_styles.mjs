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
    else if (styles instanceof Map) {
        startStyles = filterNonAnimatableStyles(styles);
    }
    return startStyles || endStyles ? new SpecialCasedStyles(element, startStyles, endStyles) : null;
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
    static { this.initialStylesByElement = new WeakMap(); }
    constructor(_element, _startStyles, _endStyles) {
        this._element = _element;
        this._startStyles = _startStyles;
        this._endStyles = _endStyles;
        this._state = 0 /* SpecialCasedStylesState.Pending */;
        let initialStyles = SpecialCasedStyles.initialStylesByElement.get(_element);
        if (!initialStyles) {
            SpecialCasedStyles.initialStylesByElement.set(_element, (initialStyles = new Map()));
        }
        this._initialStyles = initialStyles;
    }
    start() {
        if (this._state < 1 /* SpecialCasedStylesState.Started */) {
            if (this._startStyles) {
                setStyles(this._element, this._startStyles, this._initialStyles);
            }
            this._state = 1 /* SpecialCasedStylesState.Started */;
        }
    }
    finish() {
        this.start();
        if (this._state < 2 /* SpecialCasedStylesState.Finished */) {
            setStyles(this._element, this._initialStyles);
            if (this._endStyles) {
                setStyles(this._element, this._endStyles);
                this._endStyles = null;
            }
            this._state = 1 /* SpecialCasedStylesState.Started */;
        }
    }
    destroy() {
        this.finish();
        if (this._state < 3 /* SpecialCasedStylesState.Destroyed */) {
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
            this._state = 3 /* SpecialCasedStylesState.Destroyed */;
        }
    }
}
function filterNonAnimatableStyles(styles) {
    let result = null;
    styles.forEach((val, prop) => {
        if (isNonAnimatableStyle(prop)) {
            result = result || new Map();
            result.set(prop, val);
        }
    });
    return result;
}
function isNonAnimatableStyle(prop) {
    return prop === 'display' || prop === 'position';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lhbF9jYXNlZF9zdHlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9zcGVjaWFsX2Nhc2VkX3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUUvQzs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLDBCQUEwQixDQUN4QyxPQUFZLEVBQ1osTUFBNEM7SUFFNUMsSUFBSSxXQUFXLEdBQXlCLElBQUksQ0FBQztJQUM3QyxJQUFJLFNBQVMsR0FBeUIsSUFBSSxDQUFDO0lBQzNDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0MsV0FBVyxHQUFHLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN0QixTQUFTLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO0lBQ0gsQ0FBQztTQUFNLElBQUksTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ2pDLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsT0FBTyxXQUFXLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNuRyxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7YUFDdEIsMkJBQXNC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LENBQUMsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUFZO0lBQ3hDLE9BQU8sSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssVUFBVSxDQUFDO0FBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge2VyYXNlU3R5bGVzLCBzZXRTdHlsZXN9IGZyb20gJy4uL3V0aWwnO1xuXG4vKipcbiAqIFJldHVybnMgYW4gaW5zdGFuY2Ugb2YgYFNwZWNpYWxDYXNlZFN0eWxlc2AgaWYgYW5kIHdoZW4gYW55IHNwZWNpYWwgKG5vbiBhbmltYXRlYWJsZSkgc3R5bGVzIGFyZVxuICogZGV0ZWN0ZWQuXG4gKlxuICogSW4gQ1NTIHRoZXJlIGV4aXN0IHByb3BlcnRpZXMgdGhhdCBjYW5ub3QgYmUgYW5pbWF0ZWQgd2l0aGluIGEga2V5ZnJhbWUgYW5pbWF0aW9uXG4gKiAod2hldGhlciBpdCBiZSB2aWEgQ1NTIGtleWZyYW1lcyBvciB3ZWItYW5pbWF0aW9ucykgYW5kIHRoZSBhbmltYXRpb24gaW1wbGVtZW50YXRpb25cbiAqIHdpbGwgaWdub3JlIHRoZW0uIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gZGV0ZWN0IHRob3NlIHNwZWNpYWwgY2FzZWQgc3R5bGVzIGFuZFxuICogcmV0dXJuIGEgY29udGFpbmVyIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgYW5pbWF0aW9uLlxuICpcbiAqIEByZXR1cm5zIGFuIGluc3RhbmNlIG9mIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlmIGFueSBzcGVjaWFsIHN0eWxlcyBhcmUgZGV0ZWN0ZWQgb3RoZXJ3aXNlIGBudWxsYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFja2FnZU5vbkFuaW1hdGFibGVTdHlsZXMoXG4gIGVsZW1lbnQ6IGFueSxcbiAgc3R5bGVzOiDJtVN0eWxlRGF0YU1hcCB8IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbik6IFNwZWNpYWxDYXNlZFN0eWxlcyB8IG51bGwge1xuICBsZXQgc3RhcnRTdHlsZXM6IMm1U3R5bGVEYXRhTWFwIHwgbnVsbCA9IG51bGw7XG4gIGxldCBlbmRTdHlsZXM6IMm1U3R5bGVEYXRhTWFwIHwgbnVsbCA9IG51bGw7XG4gIGlmIChBcnJheS5pc0FycmF5KHN0eWxlcykgJiYgc3R5bGVzLmxlbmd0aCkge1xuICAgIHN0YXJ0U3R5bGVzID0gZmlsdGVyTm9uQW5pbWF0YWJsZVN0eWxlcyhzdHlsZXNbMF0pO1xuICAgIGlmIChzdHlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgZW5kU3R5bGVzID0gZmlsdGVyTm9uQW5pbWF0YWJsZVN0eWxlcyhzdHlsZXNbc3R5bGVzLmxlbmd0aCAtIDFdKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoc3R5bGVzIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgc3RhcnRTdHlsZXMgPSBmaWx0ZXJOb25BbmltYXRhYmxlU3R5bGVzKHN0eWxlcyk7XG4gIH1cblxuICByZXR1cm4gc3RhcnRTdHlsZXMgfHwgZW5kU3R5bGVzID8gbmV3IFNwZWNpYWxDYXNlZFN0eWxlcyhlbGVtZW50LCBzdGFydFN0eWxlcywgZW5kU3R5bGVzKSA6IG51bGw7XG59XG5cbi8qKlxuICogRGVzaWduZWQgdG8gYmUgZXhlY3V0ZWQgZHVyaW5nIGEga2V5ZnJhbWUtYmFzZWQgYW5pbWF0aW9uIHRvIGFwcGx5IGFueSBzcGVjaWFsLWNhc2VkIHN0eWxlcy5cbiAqXG4gKiBXaGVuIHN0YXJ0ZWQgKHdoZW4gdGhlIGBzdGFydCgpYCBtZXRob2QgaXMgcnVuKSB0aGVuIHRoZSBwcm92aWRlZCBgc3RhcnRTdHlsZXNgXG4gKiB3aWxsIGJlIGFwcGxpZWQuIFdoZW4gZmluaXNoZWQgKHdoZW4gdGhlIGBmaW5pc2goKWAgbWV0aG9kIGlzIGNhbGxlZCkgdGhlXG4gKiBgZW5kU3R5bGVzYCB3aWxsIGJlIGFwcGxpZWQgYXMgd2VsbCBhbnkgYW55IHN0YXJ0aW5nIHN0eWxlcy4gRmluYWxseSB3aGVuXG4gKiBgZGVzdHJveSgpYCBpcyBjYWxsZWQgdGhlbiBhbGwgc3R5bGVzIHdpbGwgYmUgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNwZWNpYWxDYXNlZFN0eWxlcyB7XG4gIHN0YXRpYyBpbml0aWFsU3R5bGVzQnlFbGVtZW50ID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwPGFueSwgybVTdHlsZURhdGFNYXA+KCk7XG5cbiAgcHJpdmF0ZSBfc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5QZW5kaW5nO1xuICBwcml2YXRlIF9pbml0aWFsU3R5bGVzITogybVTdHlsZURhdGFNYXA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogYW55LFxuICAgIHByaXZhdGUgX3N0YXJ0U3R5bGVzOiDJtVN0eWxlRGF0YU1hcCB8IG51bGwsXG4gICAgcHJpdmF0ZSBfZW5kU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCB8IG51bGwsXG4gICkge1xuICAgIGxldCBpbml0aWFsU3R5bGVzID0gU3BlY2lhbENhc2VkU3R5bGVzLmluaXRpYWxTdHlsZXNCeUVsZW1lbnQuZ2V0KF9lbGVtZW50KTtcbiAgICBpZiAoIWluaXRpYWxTdHlsZXMpIHtcbiAgICAgIFNwZWNpYWxDYXNlZFN0eWxlcy5pbml0aWFsU3R5bGVzQnlFbGVtZW50LnNldChfZWxlbWVudCwgKGluaXRpYWxTdHlsZXMgPSBuZXcgTWFwKCkpKTtcbiAgICB9XG4gICAgdGhpcy5faW5pdGlhbFN0eWxlcyA9IGluaXRpYWxTdHlsZXM7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBpZiAodGhpcy5fc3RhdGUgPCBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5TdGFydGVkKSB7XG4gICAgICBpZiAodGhpcy5fc3RhcnRTdHlsZXMpIHtcbiAgICAgICAgc2V0U3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX3N0YXJ0U3R5bGVzLCB0aGlzLl9pbml0aWFsU3R5bGVzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3N0YXRlID0gU3BlY2lhbENhc2VkU3R5bGVzU3RhdGUuU3RhcnRlZDtcbiAgICB9XG4gIH1cblxuICBmaW5pc2goKSB7XG4gICAgdGhpcy5zdGFydCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA8IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLkZpbmlzaGVkKSB7XG4gICAgICBzZXRTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5faW5pdGlhbFN0eWxlcyk7XG4gICAgICBpZiAodGhpcy5fZW5kU3R5bGVzKSB7XG4gICAgICAgIHNldFN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9lbmRTdHlsZXMpO1xuICAgICAgICB0aGlzLl9lbmRTdHlsZXMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3RhdGUgPSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5TdGFydGVkO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5maW5pc2goKTtcbiAgICBpZiAodGhpcy5fc3RhdGUgPCBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZS5EZXN0cm95ZWQpIHtcbiAgICAgIFNwZWNpYWxDYXNlZFN0eWxlcy5pbml0aWFsU3R5bGVzQnlFbGVtZW50LmRlbGV0ZSh0aGlzLl9lbGVtZW50KTtcbiAgICAgIGlmICh0aGlzLl9zdGFydFN0eWxlcykge1xuICAgICAgICBlcmFzZVN0eWxlcyh0aGlzLl9lbGVtZW50LCB0aGlzLl9zdGFydFN0eWxlcyk7XG4gICAgICAgIHRoaXMuX2VuZFN0eWxlcyA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fZW5kU3R5bGVzKSB7XG4gICAgICAgIGVyYXNlU3R5bGVzKHRoaXMuX2VsZW1lbnQsIHRoaXMuX2VuZFN0eWxlcyk7XG4gICAgICAgIHRoaXMuX2VuZFN0eWxlcyA9IG51bGw7XG4gICAgICB9XG4gICAgICBzZXRTdHlsZXModGhpcy5fZWxlbWVudCwgdGhpcy5faW5pdGlhbFN0eWxlcyk7XG4gICAgICB0aGlzLl9zdGF0ZSA9IFNwZWNpYWxDYXNlZFN0eWxlc1N0YXRlLkRlc3Ryb3llZDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBlbnVtIG9mIHN0YXRlcyByZWZsZWN0aXZlIG9mIHdoYXQgdGhlIHN0YXR1cyBvZiBgU3BlY2lhbENhc2VkU3R5bGVzYCBpcy5cbiAqXG4gKiBEZXBlbmRpbmcgb24gaG93IGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlzIGludGVyYWN0ZWQgd2l0aCwgdGhlIHN0YXJ0IGFuZCBlbmRcbiAqIHN0eWxlcyBtYXkgbm90IGJlIGFwcGxpZWQgaW4gdGhlIHNhbWUgd2F5LiBUaGlzIGVudW0gZW5zdXJlcyB0aGF0IGlmIGFuZCB3aGVuXG4gKiB0aGUgZW5kaW5nIHN0eWxlcyBhcmUgYXBwbGllZCB0aGVuIHRoZSBzdGFydGluZyBzdHlsZXMgYXJlIGFwcGxpZWQuIEl0IGlzXG4gKiBhbHNvIHVzZWQgdG8gcmVmbGVjdCB3aGF0IHRoZSBjdXJyZW50IHN0YXR1cyBvZiB0aGUgc3BlY2lhbCBjYXNlZCBzdHlsZXMgYXJlXG4gKiB3aGljaCBoZWxwcyBwcmV2ZW50IHRoZSBzdGFydGluZy9lbmRpbmcgc3R5bGVzIG5vdCBiZSBhcHBsaWVkIHR3aWNlLiBJdCBpc1xuICogYWxzbyB1c2VkIHRvIGNsZWFudXAgdGhlIHN0eWxlcyBvbmNlIGBTcGVjaWFsQ2FzZWRTdHlsZXNgIGlzIGRlc3Ryb3llZC5cbiAqL1xuY29uc3QgZW51bSBTcGVjaWFsQ2FzZWRTdHlsZXNTdGF0ZSB7XG4gIFBlbmRpbmcgPSAwLFxuICBTdGFydGVkID0gMSxcbiAgRmluaXNoZWQgPSAyLFxuICBEZXN0cm95ZWQgPSAzLFxufVxuXG5mdW5jdGlvbiBmaWx0ZXJOb25BbmltYXRhYmxlU3R5bGVzKHN0eWxlczogybVTdHlsZURhdGFNYXApOiDJtVN0eWxlRGF0YU1hcCB8IG51bGwge1xuICBsZXQgcmVzdWx0OiDJtVN0eWxlRGF0YU1hcCB8IG51bGwgPSBudWxsO1xuICBzdHlsZXMuZm9yRWFjaCgodmFsLCBwcm9wKSA9PiB7XG4gICAgaWYgKGlzTm9uQW5pbWF0YWJsZVN0eWxlKHByb3ApKSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQgfHwgbmV3IE1hcCgpO1xuICAgICAgcmVzdWx0LnNldChwcm9wLCB2YWwpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzTm9uQW5pbWF0YWJsZVN0eWxlKHByb3A6IHN0cmluZykge1xuICByZXR1cm4gcHJvcCA9PT0gJ2Rpc3BsYXknIHx8IHByb3AgPT09ICdwb3NpdGlvbic7XG59XG4iXX0=