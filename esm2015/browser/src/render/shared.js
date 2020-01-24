/**
 * @fileoverview added by tsickle
 * Generated from: packages/animations/browser/src/render/shared.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
    /** @type {?} */
    const errors = [];
    /** @type {?} */
    const normalizedKeyframes = [];
    /** @type {?} */
    let previousOffset = -1;
    /** @type {?} */
    let previousKeyframe = null;
    keyframes.forEach((/**
     * @param {?} kf
     * @return {?}
     */
    kf => {
        /** @type {?} */
        const offset = (/** @type {?} */ (kf['offset']));
        /** @type {?} */
        const isSameOffset = offset == previousOffset;
        /** @type {?} */
        const normalizedKeyframe = (isSameOffset && previousKeyframe) || {};
        Object.keys(kf).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            /** @type {?} */
            let normalizedProp = prop;
            /** @type {?} */
            let normalizedValue = kf[prop];
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
        }));
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    }));
    if (errors.length) {
        /** @type {?} */
        const LINE_START = '\n - ';
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
            player.onStart((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'start', player))));
            break;
        case 'done':
            player.onDone((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'done', player))));
            break;
        case 'destroy':
            player.onDestroy((/**
             * @return {?}
             */
            () => callback(event && copyAnimationEvent(event, 'destroy', player))));
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
    /** @type {?} */
    const totalTime = player.totalTime;
    /** @type {?} */
    const disabled = ((/** @type {?} */ (player))).disabled ? true : false;
    /** @type {?} */
    const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    /** @type {?} */
    const data = ((/** @type {?} */ (e)))['_data'];
    if (data != null) {
        ((/** @type {?} */ (event)))['_data'] = data;
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
    /** @type {?} */
    let value;
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
    /** @type {?} */
    const separatorPos = command.indexOf(':');
    /** @type {?} */
    const id = command.substring(1, separatorPos);
    /** @type {?} */
    const action = command.substr(separatorPos + 1);
    return [id, action];
}
/** @type {?} */
let _contains = (/**
 * @param {?} elm1
 * @param {?} elm2
 * @return {?}
 */
(elm1, elm2) => false);
const ɵ0 = _contains;
/** @type {?} */
let _matches = (/**
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
(element, selector) => false);
const ɵ1 = _matches;
/** @type {?} */
let _query = (/**
 * @param {?} element
 * @param {?} selector
 * @param {?} multi
 * @return {?}
 */
(element, selector, multi) => {
    return [];
});
const ɵ2 = _query;
// Define utility methods for browsers and platform-server(domino) where Element
// and utility methods exist.
/** @type {?} */
const _isNode = isNode();
if (_isNode || typeof Element !== 'undefined') {
    // this is well supported in all browsers
    _contains = (/**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    (elm1, elm2) => { return (/** @type {?} */ (elm1.contains(elm2))); });
    _matches = ((/**
     * @return {?}
     */
    () => {
        if (_isNode || Element.prototype.matches) {
            return (/**
             * @param {?} element
             * @param {?} selector
             * @return {?}
             */
            (element, selector) => element.matches(selector));
        }
        else {
            /** @type {?} */
            const proto = (/** @type {?} */ (Element.prototype));
            /** @type {?} */
            const fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
                proto.oMatchesSelector || proto.webkitMatchesSelector;
            if (fn) {
                return (/**
                 * @param {?} element
                 * @param {?} selector
                 * @return {?}
                 */
                (element, selector) => fn.apply(element, [selector]));
            }
            else {
                return _matches;
            }
        }
    }))();
    _query = (/**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    (element, selector, multi) => {
        /** @type {?} */
        let results = [];
        if (multi) {
            results.push(...element.querySelectorAll(selector));
        }
        else {
            /** @type {?} */
            const elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    });
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
/** @type {?} */
let _CACHED_BODY = null;
/** @type {?} */
let _IS_WEBKIT = false;
/**
 * @param {?} prop
 * @return {?}
 */
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = (/** @type {?} */ (_CACHED_BODY)).style ? ('WebkitAppearance' in (/** @type {?} */ (_CACHED_BODY)).style) : false;
    }
    /** @type {?} */
    let result = true;
    if ((/** @type {?} */ (_CACHED_BODY)).style && !containsVendorPrefix(prop)) {
        result = prop in (/** @type {?} */ (_CACHED_BODY)).style;
        if (!result && _IS_WEBKIT) {
            /** @type {?} */
            const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            result = camelProp in (/** @type {?} */ (_CACHED_BODY)).style;
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
/** @type {?} */
export const matchesElement = _matches;
/** @type {?} */
export const containsElement = _contains;
/** @type {?} */
export const invokeQuery = _query;
/**
 * @param {?} object
 * @return {?}
 */
export function hypenatePropsObject(object) {
    /** @type {?} */
    const newObj = {};
    Object.keys(object).forEach((/**
     * @param {?} prop
     * @return {?}
     */
    prop => {
        /** @type {?} */
        const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    }));
    return newObj;
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQW1DLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQVVqSyxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQztBQUNuRixDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLE1BQU07SUFDcEIsT0FBTyxDQUFDLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQzFDLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE9BQTBCO0lBQzVELFFBQVEsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUN0QixLQUFLLENBQUM7WUFDSixPQUFPLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUNuQyxLQUFLLENBQUM7WUFDSixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQjtZQUNFLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3QztBQUNILENBQUM7Ozs7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQzlCLE1BQXVCLEVBQUUsVUFBb0MsRUFBRSxPQUFZLEVBQzNFLFNBQXVCLEVBQUUsWUFBd0IsRUFBRSxFQUNuRCxhQUF5QixFQUFFOztVQUN2QixNQUFNLEdBQWEsRUFBRTs7VUFDckIsbUJBQW1CLEdBQWlCLEVBQUU7O1FBQ3hDLGNBQWMsR0FBRyxDQUFDLENBQUM7O1FBQ25CLGdCQUFnQixHQUFvQixJQUFJO0lBQzVDLFNB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O0FBRUQsTUFBTSxPQUFPLGNBQWMsR0FBRyxRQUFROztBQUN0QyxNQUFNLE9BQU8sZUFBZSxHQUFHLFNBQVM7O0FBQ3hDLE1BQU0sT0FBTyxXQUFXLEdBQUcsTUFBTTs7Ozs7QUFFakMsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE1BQTRCOztVQUN4RCxNQUFNLEdBQXlCLEVBQUU7SUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPOzs7O0lBQUMsSUFBSSxDQUFDLEVBQUU7O2NBQzNCLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQztRQUN4RCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUMsRUFBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uRXZlbnQsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi8uLi9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uLy4uL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5cbi8vIFdlIGRvbid0IGluY2x1ZGUgYW1iaWVudCBub2RlIHR5cGVzIGhlcmUgc2luY2UgQGFuZ3VsYXIvYW5pbWF0aW9ucy9icm93c2VyXG4vLyBpcyBtZWFudCB0byB0YXJnZXQgdGhlIGJyb3dzZXIgc28gdGVjaG5pY2FsbHkgaXQgc2hvdWxkIG5vdCBkZXBlbmQgb24gbm9kZVxuLy8gdHlwZXMuIGBwcm9jZXNzYCBpcyBqdXN0IGRlY2xhcmVkIGxvY2FsbHkgaGVyZSBhcyBhIHJlc3VsdC5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICByZXR1cm4gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZSgpIHtcbiAgcmV0dXJuICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciwgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogybVTdHlsZURhdGFbXSwgcHJlU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhID0ge30pOiDJtVN0eWxlRGF0YVtdIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gIGxldCBwcmV2aW91c09mZnNldCA9IC0xO1xuICBsZXQgcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGF8bnVsbCA9IG51bGw7XG4gIGtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPSBrZlsnb2Zmc2V0J10gYXMgbnVtYmVyO1xuICAgIGNvbnN0IGlzU2FtZU9mZnNldCA9IG9mZnNldCA9PSBwcmV2aW91c09mZnNldDtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0gKGlzU2FtZU9mZnNldCAmJiBwcmV2aW91c0tleWZyYW1lKSB8fCB7fTtcbiAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGxldCBub3JtYWxpemVkUHJvcCA9IHByb3A7XG4gICAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0ga2ZbcHJvcF07XG4gICAgICBpZiAocHJvcCAhPT0gJ29mZnNldCcpIHtcbiAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVyLm5vcm1hbGl6ZVByb3BlcnR5TmFtZShub3JtYWxpemVkUHJvcCwgZXJyb3JzKTtcbiAgICAgICAgc3dpdGNoIChub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgICAgICBjYXNlIFBSRV9TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHByZVN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBBVVRPX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcG9zdFN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplci5ub3JtYWxpemVTdHlsZVZhbHVlKHByb3AsIG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUsIGVycm9ycyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9ybWFsaXplZEtleWZyYW1lW25vcm1hbGl6ZWRQcm9wXSA9IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoIWlzU2FtZU9mZnNldCkge1xuICAgICAgbm9ybWFsaXplZEtleWZyYW1lcy5wdXNoKG5vcm1hbGl6ZWRLZXlmcmFtZSk7XG4gICAgfVxuICAgIHByZXZpb3VzS2V5ZnJhbWUgPSBub3JtYWxpemVkS2V5ZnJhbWU7XG4gICAgcHJldmlvdXNPZmZzZXQgPSBvZmZzZXQ7XG4gIH0pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIGNvbnN0IExJTkVfU1RBUlQgPSAnXFxuIC0gJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gYW5pbWF0ZSBkdWUgdG8gdGhlIGZvbGxvd2luZyBlcnJvcnM6JHtMSU5FX1NUQVJUfSR7ZXJyb3JzLmpvaW4oTElORV9TVEFSVCl9YCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICAgIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEFuaW1hdGlvbkV2ZW50IHwgdW5kZWZpbmVkLFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KSB7XG4gIHN3aXRjaCAoZXZlbnROYW1lKSB7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnc3RhcnQnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkb25lJzpcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZG9uZScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkZXN0cm95JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlBbmltYXRpb25FdmVudChcbiAgICBlOiBBbmltYXRpb25FdmVudCwgcGhhc2VOYW1lOiBzdHJpbmcsIHBsYXllcjogQW5pbWF0aW9uUGxheWVyKTogQW5pbWF0aW9uRXZlbnQge1xuICBjb25zdCB0b3RhbFRpbWUgPSBwbGF5ZXIudG90YWxUaW1lO1xuICBjb25zdCBkaXNhYmxlZCA9IChwbGF5ZXIgYXMgYW55KS5kaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgY29uc3QgZXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICBlLmVsZW1lbnQsIGUudHJpZ2dlck5hbWUsIGUuZnJvbVN0YXRlLCBlLnRvU3RhdGUsIHBoYXNlTmFtZSB8fCBlLnBoYXNlTmFtZSxcbiAgICAgIHRvdGFsVGltZSA9PSB1bmRlZmluZWQgPyBlLnRvdGFsVGltZSA6IHRvdGFsVGltZSwgZGlzYWJsZWQpO1xuICBjb25zdCBkYXRhID0gKGUgYXMgYW55KVsnX2RhdGEnXTtcbiAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgIChldmVudCBhcyBhbnkpWydfZGF0YSddID0gZGF0YTtcbiAgfVxuICByZXR1cm4gZXZlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBwaGFzZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMCwgZGlzYWJsZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uRXZlbnQge1xuICByZXR1cm4ge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBoYXNlTmFtZSwgdG90YWxUaW1lLCBkaXNhYmxlZDogISFkaXNhYmxlZH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPclNldEFzSW5NYXAoXG4gICAgbWFwOiBNYXA8YW55LCBhbnk+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gIGxldCB2YWx1ZTogYW55O1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgbWFwLnNldChrZXksIHZhbHVlID0gZGVmYXVsdFZhbHVlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IG1hcFtrZXldID0gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVsaW5lQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc2VwYXJhdG9yUG9zID0gY29tbWFuZC5pbmRleE9mKCc6Jyk7XG4gIGNvbnN0IGlkID0gY29tbWFuZC5zdWJzdHJpbmcoMSwgc2VwYXJhdG9yUG9zKTtcbiAgY29uc3QgYWN0aW9uID0gY29tbWFuZC5zdWJzdHIoc2VwYXJhdG9yUG9zICsgMSk7XG4gIHJldHVybiBbaWQsIGFjdGlvbl07XG59XG5cbmxldCBfY29udGFpbnM6IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gYm9vbGVhbiA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gZmFsc2U7XG5sZXQgX21hdGNoZXM6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW4gPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgIGZhbHNlO1xubGV0IF9xdWVyeTogKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IGFueVtdID1cbiAgICAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbikgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cbi8vIERlZmluZSB1dGlsaXR5IG1ldGhvZHMgZm9yIGJyb3dzZXJzIGFuZCBwbGF0Zm9ybS1zZXJ2ZXIoZG9taW5vKSB3aGVyZSBFbGVtZW50XG4vLyBhbmQgdXRpbGl0eSBtZXRob2RzIGV4aXN0LlxuY29uc3QgX2lzTm9kZSA9IGlzTm9kZSgpO1xuaWYgKF9pc05vZGUgfHwgdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIHRoaXMgaXMgd2VsbCBzdXBwb3J0ZWQgaW4gYWxsIGJyb3dzZXJzXG4gIF9jb250YWlucyA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4geyByZXR1cm4gZWxtMS5jb250YWlucyhlbG0yKSBhcyBib29sZWFuOyB9O1xuXG4gIF9tYXRjaGVzID0gKCgpID0+IHtcbiAgICBpZiAoX2lzTm9kZSB8fCBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgICByZXR1cm4gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgICBjb25zdCBmbiA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgICAgIGlmIChmbikge1xuICAgICAgICByZXR1cm4gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZm4uYXBwbHkoZWxlbWVudCwgW3NlbGVjdG9yXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX21hdGNoZXM7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuXG4gIF9xdWVyeSA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10gPT4ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChtdWx0aSkge1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbG0gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGVsbSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZWxtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBXZWJraXQgaXMgdGhlIG9ubHkgcmVhbCBwb3B1bGFyIHZlbmRvciBwcmVmaXggbm93YWRheXNcbiAgLy8gY2M6IGh0dHA6Ly9zaG91bGRpcHJlZml4LmNvbS9cbiAgcmV0dXJuIHByb3Auc3Vic3RyaW5nKDEsIDYpID09ICdlYmtpdCc7ICAvLyB3ZWJraXQgb3IgV2Via2l0XG59XG5cbmxldCBfQ0FDSEVEX0JPRFk6IHtzdHlsZTogYW55fXxudWxsID0gbnVsbDtcbmxldCBfSVNfV0VCS0lUID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9DQUNIRURfQk9EWSkge1xuICAgIF9DQUNIRURfQk9EWSA9IGdldEJvZHlOb2RlKCkgfHwge307XG4gICAgX0lTX1dFQktJVCA9IF9DQUNIRURfQk9EWSAhLnN0eWxlID8gKCdXZWJraXRBcHBlYXJhbmNlJyBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBpZiAoX0NBQ0hFRF9CT0RZICEuc3R5bGUgJiYgIWNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3ApKSB7XG4gICAgcmVzdWx0ID0gcHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICBpZiAoIXJlc3VsdCAmJiBfSVNfV0VCS0lUKSB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSAnV2Via2l0JyArIHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnN1YnN0cigxKTtcbiAgICAgIHJlc3VsdCA9IGNhbWVsUHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9keU5vZGUoKTogYW55fG51bGwge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBtYXRjaGVzRWxlbWVudCA9IF9tYXRjaGVzO1xuZXhwb3J0IGNvbnN0IGNvbnRhaW5zRWxlbWVudCA9IF9jb250YWlucztcbmV4cG9ydCBjb25zdCBpbnZva2VRdWVyeSA9IF9xdWVyeTtcblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGVuYXRlUHJvcHNPYmplY3Qob2JqZWN0OiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgbmV3T2JqOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgbmV3UHJvcCA9IHByb3AucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJyk7XG4gICAgbmV3T2JqW25ld1Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iajtcbn1cbiJdfQ==