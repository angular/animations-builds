/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
/**
 * @return {?}
 */
export function isBrowser() {
    return (typeof window !== 'undefined' && typeof window.document !== 'undefined');
}
/**
 * @param {?} players
 * @return {?}
 */
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?=} preStyles
 * @param {?=} postStyles
 * @return {?}
 */
export function normalizeKeyframes(driver, normalizer, element, keyframes, preStyles = {}, postStyles = {}) {
    const /** @type {?} */ errors = [];
    const /** @type {?} */ normalizedKeyframes = [];
    let /** @type {?} */ previousOffset = -1;
    let /** @type {?} */ previousKeyframe = null;
    keyframes.forEach(kf => {
        const /** @type {?} */ offset = /** @type {?} */ (kf['offset']);
        const /** @type {?} */ isSameOffset = offset == previousOffset;
        const /** @type {?} */ normalizedKeyframe = (isSameOffset && previousKeyframe) || {};
        Object.keys(kf).forEach(prop => {
            let /** @type {?} */ normalizedProp = prop;
            let /** @type {?} */ normalizedValue = kf[prop];
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles[prop];
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles[prop];
                        break;
                    default:
                        normalizedValue =
                            normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe[normalizedProp] = normalizedValue;
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        const /** @type {?} */ LINE_START = '\n - ';
        throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
}
/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
            break;
        case 'done':
            player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
            break;
        case 'destroy':
            player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
            break;
    }
}
/**
 * @param {?} e
 * @param {?} phaseName
 * @param {?} player
 * @return {?}
 */
export function copyAnimationEvent(e, phaseName, player) {
    const /** @type {?} */ totalTime = player.totalTime;
    const /** @type {?} */ disabled = (/** @type {?} */ (player)).disabled ? true : false;
    const /** @type {?} */ event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    const /** @type {?} */ data = (/** @type {?} */ (e))['_data'];
    if (data != null) {
        (/** @type {?} */ (event))['_data'] = data;
    }
    return event;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @param {?=} disabled
 * @return {?}
 */
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
export function getOrSetAsInMap(map, key, defaultValue) {
    let /** @type {?} */ value;
    if (map instanceof Map) {
        value = map.get(key);
        if (!value) {
            map.set(key, value = defaultValue);
        }
    }
    else {
        value = map[key];
        if (!value) {
            value = map[key] = defaultValue;
        }
    }
    return value;
}
/**
 * @param {?} command
 * @return {?}
 */
export function parseTimelineCommand(command) {
    const /** @type {?} */ separatorPos = command.indexOf(':');
    const /** @type {?} */ id = command.substring(1, separatorPos);
    const /** @type {?} */ action = command.substr(separatorPos + 1);
    return [id, action];
}
let /** @type {?} */ _contains = (elm1, elm2) => false;
const ɵ0 = _contains;
let /** @type {?} */ _matches = (element, selector) => false;
const ɵ1 = _matches;
let /** @type {?} */ _query = (element, selector, multi) => {
    return [];
};
const ɵ2 = _query;
if (isBrowser()) {
    // this is well supported in all browsers
    _contains = (elm1, elm2) => { return /** @type {?} */ (elm1.contains(elm2)); };
    if (Element.prototype.matches) {
        _matches = (element, selector) => element.matches(selector);
    }
    else {
        const /** @type {?} */ proto = /** @type {?} */ (Element.prototype);
        const /** @type {?} */ fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
            proto.oMatchesSelector || proto.webkitMatchesSelector;
        if (fn) {
            _matches = (element, selector) => fn.apply(element, [selector]);
        }
    }
    _query = (element, selector, multi) => {
        let /** @type {?} */ results = [];
        if (multi) {
            results.push(...element.querySelectorAll(selector));
        }
        else {
            const /** @type {?} */ elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    };
}
/**
 * @param {?} prop
 * @return {?}
 */
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
let /** @type {?} */ _CACHED_BODY = null;
let /** @type {?} */ _IS_WEBKIT = false;
/**
 * @param {?} prop
 * @return {?}
 */
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = /** @type {?} */ ((_CACHED_BODY)).style ? ('WebkitAppearance' in /** @type {?} */ ((_CACHED_BODY)).style) : false;
    }
    let /** @type {?} */ result = true;
    if (/** @type {?} */ ((_CACHED_BODY)).style && !containsVendorPrefix(prop)) {
        result = prop in /** @type {?} */ ((_CACHED_BODY)).style;
        if (!result && _IS_WEBKIT) {
            const /** @type {?} */ camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            result = camelProp in /** @type {?} */ ((_CACHED_BODY)).style;
        }
    }
    return result;
}
/**
 * @return {?}
 */
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
export const /** @type {?} */ matchesElement = _matches;
export const /** @type {?} */ containsElement = _contains;
export const /** @type {?} */ invokeQuery = _query;
/**
 * @param {?} object
 * @return {?}
 */
export function hypenatePropsObject(object) {
    const /** @type {?} */ newObj = {};
    Object.keys(object).forEach(prop => {
        const /** @type {?} */ newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    });
    return newObj;
}
export { ɵ0, ɵ1, ɵ2 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFtQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFLakssTUFBTTtJQUNKLE9BQU8sQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ2xGOzs7OztBQUVELE1BQU0sOEJBQThCLE9BQTBCO0lBQzVELFFBQVEsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUN0QixLQUFLLENBQUM7WUFDSixPQUFPLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUNuQyxLQUFLLENBQUM7WUFDSixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQjtZQUNFLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3QztDQUNGOzs7Ozs7Ozs7O0FBRUQsTUFBTSw2QkFDRixNQUF1QixFQUFFLFVBQW9DLEVBQUUsT0FBWSxFQUMzRSxTQUF1QixFQUFFLFlBQXdCLEVBQUUsRUFDbkQsYUFBeUIsRUFBRTtJQUM3Qix1QkFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLHVCQUFNLG1CQUFtQixHQUFpQixFQUFFLENBQUM7SUFDN0MscUJBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLHFCQUFJLGdCQUFnQixHQUFvQixJQUFJLENBQUM7SUFDN0MsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNyQix1QkFBTSxNQUFNLHFCQUFHLEVBQUUsQ0FBQyxRQUFRLENBQVcsQ0FBQSxDQUFDO1FBQ3RD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QUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0NBQ2YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbkV2ZW50LCBBbmltYXRpb25QbGF5ZXIsIE5vb3BBbmltYXRpb25QbGF5ZXIsIMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vLi4vc3JjL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi8uLi9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICByZXR1cm4gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXIge1xuICBzd2l0Y2ggKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHBsYXllcnNbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBuZXcgybVBbmltYXRpb25Hcm91cFBsYXllcihwbGF5ZXJzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIsIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIHByZVN0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBwb3N0U3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9KTogybVTdHlsZURhdGFbXSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICBsZXQgcHJldmlvdXNPZmZzZXQgPSAtMTtcbiAgbGV0IHByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhfG51bGwgPSBudWxsO1xuICBrZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgY29uc3Qgb2Zmc2V0ID0ga2ZbJ29mZnNldCddIGFzIG51bWJlcjtcbiAgICBjb25zdCBpc1NhbWVPZmZzZXQgPSBvZmZzZXQgPT0gcHJldmlvdXNPZmZzZXQ7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lOiDJtVN0eWxlRGF0YSA9IChpc1NhbWVPZmZzZXQgJiYgcHJldmlvdXNLZXlmcmFtZSkgfHwge307XG4gICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBsZXQgbm9ybWFsaXplZFByb3AgPSBwcm9wO1xuICAgICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IGtmW3Byb3BdO1xuICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplci5ub3JtYWxpemVQcm9wZXJ0eU5hbWUobm9ybWFsaXplZFByb3AsIGVycm9ycyk7XG4gICAgICAgIHN3aXRjaCAobm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBQUkVfU1RZTEU6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSBwcmVTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgQVVUT19TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHBvc3RTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPVxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZXIubm9ybWFsaXplU3R5bGVWYWx1ZShwcm9wLCBub3JtYWxpemVkUHJvcCwgbm9ybWFsaXplZFZhbHVlLCBlcnJvcnMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZVtub3JtYWxpemVkUHJvcF0gPSBub3JtYWxpemVkVmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKCFpc1NhbWVPZmZzZXQpIHtcbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZXMucHVzaChub3JtYWxpemVkS2V5ZnJhbWUpO1xuICAgIH1cbiAgICBwcmV2aW91c0tleWZyYW1lID0gbm9ybWFsaXplZEtleWZyYW1lO1xuICAgIHByZXZpb3VzT2Zmc2V0ID0gb2Zmc2V0O1xuICB9KTtcbiAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICBjb25zdCBMSU5FX1NUQVJUID0gJ1xcbiAtICc7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGFuaW1hdGUgZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOiR7TElORV9TVEFSVH0ke2Vycm9ycy5qb2luKExJTkVfU1RBUlQpfWApO1xuICB9XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWRLZXlmcmFtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5PblBsYXllcihcbiAgICBwbGF5ZXI6IEFuaW1hdGlvblBsYXllciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBBbmltYXRpb25FdmVudCB8IHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSkge1xuICBzd2l0Y2ggKGV2ZW50TmFtZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ3N0YXJ0JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG9uZSc6XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2RvbmUnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXN0cm95JzpcbiAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZGVzdHJveScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5QW5pbWF0aW9uRXZlbnQoXG4gICAgZTogQW5pbWF0aW9uRXZlbnQsIHBoYXNlTmFtZTogc3RyaW5nLCBwbGF5ZXI6IEFuaW1hdGlvblBsYXllcik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgY29uc3QgdG90YWxUaW1lID0gcGxheWVyLnRvdGFsVGltZTtcbiAgY29uc3QgZGlzYWJsZWQgPSAocGxheWVyIGFzIGFueSkuZGlzYWJsZWQgPyB0cnVlIDogZmFsc2U7XG4gIGNvbnN0IGV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgZS5lbGVtZW50LCBlLnRyaWdnZXJOYW1lLCBlLmZyb21TdGF0ZSwgZS50b1N0YXRlLCBwaGFzZU5hbWUgfHwgZS5waGFzZU5hbWUsXG4gICAgICB0b3RhbFRpbWUgPT0gdW5kZWZpbmVkID8gZS50b3RhbFRpbWUgOiB0b3RhbFRpbWUsIGRpc2FibGVkKTtcbiAgY29uc3QgZGF0YSA9IChlIGFzIGFueSlbJ19kYXRhJ107XG4gIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAoZXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IGRhdGE7XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgIGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgcGhhc2VOYW1lOiBzdHJpbmcgPSAnJyxcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDAsIGRpc2FibGVkPzogYm9vbGVhbik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgcmV0dXJuIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwaGFzZU5hbWUsIHRvdGFsVGltZSwgZGlzYWJsZWQ6ICEhZGlzYWJsZWR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JTZXRBc0luTWFwKFxuICAgIG1hcDogTWFwPGFueSwgYW55Pnwge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCBkZWZhdWx0VmFsdWU6IGFueSkge1xuICBsZXQgdmFsdWU6IGFueTtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSA9IGRlZmF1bHRWYWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gbWFwW2tleV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBtYXBba2V5XSA9IGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lbGluZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IHNlcGFyYXRvclBvcyA9IGNvbW1hbmQuaW5kZXhPZignOicpO1xuICBjb25zdCBpZCA9IGNvbW1hbmQuc3Vic3RyaW5nKDEsIHNlcGFyYXRvclBvcyk7XG4gIGNvbnN0IGFjdGlvbiA9IGNvbW1hbmQuc3Vic3RyKHNlcGFyYXRvclBvcyArIDEpO1xuICByZXR1cm4gW2lkLCBhY3Rpb25dO1xufVxuXG5sZXQgX2NvbnRhaW5zOiAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGJvb2xlYW4gPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGZhbHNlO1xubGV0IF9tYXRjaGVzOiAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBib29sZWFuID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT5cbiAgICBmYWxzZTtcbmxldCBfcXVlcnk6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKSA9PiBhbnlbXSA9XG4gICAgKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9O1xuXG5pZiAoaXNCcm93c2VyKCkpIHtcbiAgLy8gdGhpcyBpcyB3ZWxsIHN1cHBvcnRlZCBpbiBhbGwgYnJvd3NlcnNcbiAgX2NvbnRhaW5zID0gKGVsbTE6IGFueSwgZWxtMjogYW55KSA9PiB7IHJldHVybiBlbG0xLmNvbnRhaW5zKGVsbTIpIGFzIGJvb2xlYW47IH07XG5cbiAgaWYgKEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICBfbWF0Y2hlcyA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGVsZW1lbnQubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgY29uc3QgZm4gPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICAgIGlmIChmbikge1xuICAgICAgX21hdGNoZXMgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBmbi5hcHBseShlbGVtZW50LCBbc2VsZWN0b3JdKTtcbiAgICB9XG4gIH1cblxuICBfcXVlcnkgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdID0+IHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAobXVsdGkpIHtcbiAgICAgIHJlc3VsdHMucHVzaCguLi5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWxtID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIGlmIChlbG0pIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGVsbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb250YWluc1ZlbmRvclByZWZpeChwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gV2Via2l0IGlzIHRoZSBvbmx5IHJlYWwgcG9wdWxhciB2ZW5kb3IgcHJlZml4IG5vd2FkYXlzXG4gIC8vIGNjOiBodHRwOi8vc2hvdWxkaXByZWZpeC5jb20vXG4gIHJldHVybiBwcm9wLnN1YnN0cmluZygxLCA2KSA9PSAnZWJraXQnOyAgLy8gd2Via2l0IG9yIFdlYmtpdFxufVxuXG5sZXQgX0NBQ0hFRF9CT0RZOiB7c3R5bGU6IGFueX18bnVsbCA9IG51bGw7XG5sZXQgX0lTX1dFQktJVCA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfQ0FDSEVEX0JPRFkpIHtcbiAgICBfQ0FDSEVEX0JPRFkgPSBnZXRCb2R5Tm9kZSgpIHx8IHt9O1xuICAgIF9JU19XRUJLSVQgPSBfQ0FDSEVEX0JPRFkgIS5zdHlsZSA/ICgnV2Via2l0QXBwZWFyYW5jZScgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGUpIDogZmFsc2U7XG4gIH1cblxuICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgaWYgKF9DQUNIRURfQk9EWSAhLnN0eWxlICYmICFjb250YWluc1ZlbmRvclByZWZpeChwcm9wKSkge1xuICAgIHJlc3VsdCA9IHByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgaWYgKCFyZXN1bHQgJiYgX0lTX1dFQktJVCkge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gJ1dlYmtpdCcgKyBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSk7XG4gICAgICByZXN1bHQgPSBjYW1lbFByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvZHlOb2RlKCk6IGFueXxudWxsIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgY29uc3QgbWF0Y2hlc0VsZW1lbnQgPSBfbWF0Y2hlcztcbmV4cG9ydCBjb25zdCBjb250YWluc0VsZW1lbnQgPSBfY29udGFpbnM7XG5leHBvcnQgY29uc3QgaW52b2tlUXVlcnkgPSBfcXVlcnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBoeXBlbmF0ZVByb3BzT2JqZWN0KG9iamVjdDoge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGNvbnN0IG5ld09iajoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKHByb3AgPT4ge1xuICAgIGNvbnN0IG5ld1Byb3AgPSBwcm9wLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpO1xuICAgIG5ld09ialtuZXdQcm9wXSA9IG9iamVjdFtwcm9wXTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmo7XG59XG4iXX0=