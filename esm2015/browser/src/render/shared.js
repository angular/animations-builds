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
 * @return {?}
 */
export function isNode() {
    return (typeof process !== 'undefined');
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
// Define utility methods for browsers and platform-server(domino) where Element
// and utility methods exist.
const /** @type {?} */ _isNode = isNode();
if (_isNode || typeof Element !== 'undefined') {
    // this is well supported in all browsers
    _contains = (elm1, elm2) => { return /** @type {?} */ (elm1.contains(elm2)); };
    if (_isNode || Element.prototype.matches) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFtQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFLakssTUFBTTtJQUNKLE1BQU0sQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbEY7Ozs7QUFFRCxNQUFNO0lBQ0osTUFBTSxDQUFDLENBQUMsT0FBTyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDekM7Ozs7O0FBRUQsTUFBTSw4QkFBOEIsT0FBMEI7SUFDNUQsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkIsS0FBSyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUNuQyxLQUFLLENBQUM7WUFDSixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCO1lBQ0UsTUFBTSxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0M7Q0FDRjs7Ozs7Ozs7OztBQUVELE1BQU0sNkJBQ0YsTUFBdUIsRUFBRSxVQUFvQyxFQUFFLE9BQVksRUFDM0UsU0FBdUIsRUFBRSxZQUF3QixFQUFFLEVBQ25ELGFBQXlCLEVBQUU7SUFDN0IsdUJBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1Qix1QkFBTSxtQkFBbUIsR0FBaUIsRUFBRSxDQUFDO0lBQzdDLHFCQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN4QixxQkFBSSxnQkFBZ0IsR0FBb0Is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QUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sR0FBRyxTQUFTLHVCQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7U0FDNUM7S0FDRjtJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7Q0FDZjs7OztBQUVELE1BQU07SUFDSixFQUFFLENBQUMsQ0FBQyxPQUFPLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0tBQ3RCO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztDQUNiO0FBRUQsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDdkMsTUFBTSxDQUFDLHVCQUFNLGVBQWUsR0FBRyxTQUFTLENBQUM7QUFDekMsTUFBTSxDQUFDLHVCQUFNLFdBQVcsR0FBRyxNQUFNLENBQUM7Ozs7O0FBRWxDLE1BQU0sOEJBQThCLE1BQTRCO0lBQzlELHVCQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pDLHVCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztDQUNmIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25FdmVudCwgQW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtUFuaW1hdGlvbkdyb3VwUGxheWVyLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uLy4uL3NyYy9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vLi4vc3JjL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3NlcigpIHtcbiAgcmV0dXJuICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vZGUoKSB7XG4gIHJldHVybiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXIge1xuICBzd2l0Y2ggKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHBsYXllcnNbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBuZXcgybVBbmltYXRpb25Hcm91cFBsYXllcihwbGF5ZXJzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIsIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIHByZVN0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBwb3N0U3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9KTogybVTdHlsZURhdGFbXSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICBsZXQgcHJldmlvdXNPZmZzZXQgPSAtMTtcbiAgbGV0IHByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhfG51bGwgPSBudWxsO1xuICBrZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgY29uc3Qgb2Zmc2V0ID0ga2ZbJ29mZnNldCddIGFzIG51bWJlcjtcbiAgICBjb25zdCBpc1NhbWVPZmZzZXQgPSBvZmZzZXQgPT0gcHJldmlvdXNPZmZzZXQ7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lOiDJtVN0eWxlRGF0YSA9IChpc1NhbWVPZmZzZXQgJiYgcHJldmlvdXNLZXlmcmFtZSkgfHwge307XG4gICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBsZXQgbm9ybWFsaXplZFByb3AgPSBwcm9wO1xuICAgICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IGtmW3Byb3BdO1xuICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplci5ub3JtYWxpemVQcm9wZXJ0eU5hbWUobm9ybWFsaXplZFByb3AsIGVycm9ycyk7XG4gICAgICAgIHN3aXRjaCAobm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBQUkVfU1RZTEU6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSBwcmVTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgQVVUT19TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHBvc3RTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPVxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZXIubm9ybWFsaXplU3R5bGVWYWx1ZShwcm9wLCBub3JtYWxpemVkUHJvcCwgbm9ybWFsaXplZFZhbHVlLCBlcnJvcnMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZVtub3JtYWxpemVkUHJvcF0gPSBub3JtYWxpemVkVmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKCFpc1NhbWVPZmZzZXQpIHtcbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZXMucHVzaChub3JtYWxpemVkS2V5ZnJhbWUpO1xuICAgIH1cbiAgICBwcmV2aW91c0tleWZyYW1lID0gbm9ybWFsaXplZEtleWZyYW1lO1xuICAgIHByZXZpb3VzT2Zmc2V0ID0gb2Zmc2V0O1xuICB9KTtcbiAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICBjb25zdCBMSU5FX1NUQVJUID0gJ1xcbiAtICc7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGFuaW1hdGUgZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOiR7TElORV9TVEFSVH0ke2Vycm9ycy5qb2luKExJTkVfU1RBUlQpfWApO1xuICB9XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWRLZXlmcmFtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5PblBsYXllcihcbiAgICBwbGF5ZXI6IEFuaW1hdGlvblBsYXllciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBBbmltYXRpb25FdmVudCB8IHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSkge1xuICBzd2l0Y2ggKGV2ZW50TmFtZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ3N0YXJ0JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG9uZSc6XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2RvbmUnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXN0cm95JzpcbiAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZGVzdHJveScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5QW5pbWF0aW9uRXZlbnQoXG4gICAgZTogQW5pbWF0aW9uRXZlbnQsIHBoYXNlTmFtZTogc3RyaW5nLCBwbGF5ZXI6IEFuaW1hdGlvblBsYXllcik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgY29uc3QgdG90YWxUaW1lID0gcGxheWVyLnRvdGFsVGltZTtcbiAgY29uc3QgZGlzYWJsZWQgPSAocGxheWVyIGFzIGFueSkuZGlzYWJsZWQgPyB0cnVlIDogZmFsc2U7XG4gIGNvbnN0IGV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgZS5lbGVtZW50LCBlLnRyaWdnZXJOYW1lLCBlLmZyb21TdGF0ZSwgZS50b1N0YXRlLCBwaGFzZU5hbWUgfHwgZS5waGFzZU5hbWUsXG4gICAgICB0b3RhbFRpbWUgPT0gdW5kZWZpbmVkID8gZS50b3RhbFRpbWUgOiB0b3RhbFRpbWUsIGRpc2FibGVkKTtcbiAgY29uc3QgZGF0YSA9IChlIGFzIGFueSlbJ19kYXRhJ107XG4gIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAoZXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IGRhdGE7XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgIGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgcGhhc2VOYW1lOiBzdHJpbmcgPSAnJyxcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDAsIGRpc2FibGVkPzogYm9vbGVhbik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgcmV0dXJuIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwaGFzZU5hbWUsIHRvdGFsVGltZSwgZGlzYWJsZWQ6ICEhZGlzYWJsZWR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JTZXRBc0luTWFwKFxuICAgIG1hcDogTWFwPGFueSwgYW55Pnwge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCBkZWZhdWx0VmFsdWU6IGFueSkge1xuICBsZXQgdmFsdWU6IGFueTtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSA9IGRlZmF1bHRWYWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gbWFwW2tleV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBtYXBba2V5XSA9IGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lbGluZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IHNlcGFyYXRvclBvcyA9IGNvbW1hbmQuaW5kZXhPZignOicpO1xuICBjb25zdCBpZCA9IGNvbW1hbmQuc3Vic3RyaW5nKDEsIHNlcGFyYXRvclBvcyk7XG4gIGNvbnN0IGFjdGlvbiA9IGNvbW1hbmQuc3Vic3RyKHNlcGFyYXRvclBvcyArIDEpO1xuICByZXR1cm4gW2lkLCBhY3Rpb25dO1xufVxuXG5sZXQgX2NvbnRhaW5zOiAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGJvb2xlYW4gPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGZhbHNlO1xubGV0IF9tYXRjaGVzOiAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBib29sZWFuID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT5cbiAgICBmYWxzZTtcbmxldCBfcXVlcnk6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKSA9PiBhbnlbXSA9XG4gICAgKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9O1xuXG4vLyBEZWZpbmUgdXRpbGl0eSBtZXRob2RzIGZvciBicm93c2VycyBhbmQgcGxhdGZvcm0tc2VydmVyKGRvbWlubykgd2hlcmUgRWxlbWVudFxuLy8gYW5kIHV0aWxpdHkgbWV0aG9kcyBleGlzdC5cbmNvbnN0IF9pc05vZGUgPSBpc05vZGUoKTtcbmlmIChfaXNOb2RlIHx8IHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAvLyB0aGlzIGlzIHdlbGwgc3VwcG9ydGVkIGluIGFsbCBicm93c2Vyc1xuICBfY29udGFpbnMgPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IHsgcmV0dXJuIGVsbTEuY29udGFpbnMoZWxtMikgYXMgYm9vbGVhbjsgfTtcblxuICBpZiAoX2lzTm9kZSB8fCBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgX21hdGNoZXMgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHByb3RvID0gRWxlbWVudC5wcm90b3R5cGUgYXMgYW55O1xuICAgIGNvbnN0IGZuID0gcHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgICBpZiAoZm4pIHtcbiAgICAgIF9tYXRjaGVzID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZm4uYXBwbHkoZWxlbWVudCwgW3NlbGVjdG9yXSk7XG4gICAgfVxuICB9XG5cbiAgX3F1ZXJ5ID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSA9PiB7XG4gICAgbGV0IHJlc3VsdHM6IGFueVtdID0gW107XG4gICAgaWYgKG11bHRpKSB7XG4gICAgICByZXN1bHRzLnB1c2goLi4uZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGVsbSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICBpZiAoZWxtKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChlbG0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29udGFpbnNWZW5kb3JQcmVmaXgocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFdlYmtpdCBpcyB0aGUgb25seSByZWFsIHBvcHVsYXIgdmVuZG9yIHByZWZpeCBub3dhZGF5c1xuICAvLyBjYzogaHR0cDovL3Nob3VsZGlwcmVmaXguY29tL1xuICByZXR1cm4gcHJvcC5zdWJzdHJpbmcoMSwgNikgPT0gJ2Via2l0JzsgIC8vIHdlYmtpdCBvciBXZWJraXRcbn1cblxubGV0IF9DQUNIRURfQk9EWToge3N0eWxlOiBhbnl9fG51bGwgPSBudWxsO1xubGV0IF9JU19XRUJLSVQgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX0NBQ0hFRF9CT0RZKSB7XG4gICAgX0NBQ0hFRF9CT0RZID0gZ2V0Qm9keU5vZGUoKSB8fCB7fTtcbiAgICBfSVNfV0VCS0lUID0gX0NBQ0hFRF9CT0RZICEuc3R5bGUgPyAoJ1dlYmtpdEFwcGVhcmFuY2UnIGluIF9DQUNIRURfQk9EWSAhLnN0eWxlKSA6IGZhbHNlO1xuICB9XG5cbiAgbGV0IHJlc3VsdCA9IHRydWU7XG4gIGlmIChfQ0FDSEVEX0JPRFkgIS5zdHlsZSAmJiAhY29udGFpbnNWZW5kb3JQcmVmaXgocHJvcCkpIHtcbiAgICByZXN1bHQgPSBwcm9wIGluIF9DQUNIRURfQk9EWSAhLnN0eWxlO1xuICAgIGlmICghcmVzdWx0ICYmIF9JU19XRUJLSVQpIHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9ICdXZWJraXQnICsgcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc3Vic3RyKDEpO1xuICAgICAgcmVzdWx0ID0gY2FtZWxQcm9wIGluIF9DQUNIRURfQk9EWSAhLnN0eWxlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2R5Tm9kZSgpOiBhbnl8bnVsbCB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuYm9keTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGNvbnN0IG1hdGNoZXNFbGVtZW50ID0gX21hdGNoZXM7XG5leHBvcnQgY29uc3QgY29udGFpbnNFbGVtZW50ID0gX2NvbnRhaW5zO1xuZXhwb3J0IGNvbnN0IGludm9rZVF1ZXJ5ID0gX3F1ZXJ5O1xuXG5leHBvcnQgZnVuY3Rpb24gaHlwZW5hdGVQcm9wc09iamVjdChvYmplY3Q6IHtba2V5OiBzdHJpbmddOiBhbnl9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBjb25zdCBuZXdPYmo6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChwcm9wID0+IHtcbiAgICBjb25zdCBuZXdQcm9wID0gcHJvcC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKTtcbiAgICBuZXdPYmpbbmV3UHJvcF0gPSBvYmplY3RbcHJvcF07XG4gIH0pO1xuICByZXR1cm4gbmV3T2JqO1xufVxuIl19