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
    // Checking only for `process` isn't enough to identify whether or not we're in a Node
    // environment, because Webpack by default will polyfill the `process`. While we can discern
    // that Webpack polyfilled it by looking at `process.browser`, it's very Webpack-specific and
    // might not be future-proof. Instead we look at the stringified version of `process` which
    // is `[object process]` in Node and `[object Object]` when polyfilled.
    return typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
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
/** @type {?} */
let _matches = (/**
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
(element, selector) => false);
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
/**
 * Returns the computed style for the provided property on the provided element.
 *
 * This function uses `window.getComputedStyle` internally to determine the
 * style value for the element. Firefox doesn't support reading the shorthand
 * forms of margin/padding and for this reason this function needs to account
 * for that.
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
export function computeStyle(element, prop) {
    /** @type {?} */
    const styles = window.getComputedStyle(element);
    // this is casted to any because the `CSSStyleDeclaration` type is a fixed
    // set of properties and `prop` is a dynamic reference to a property within
    // the `CSSStyleDeclaration` list.
    /** @type {?} */
    let value = getComputedValue(styles, (/** @type {?} */ (prop)));
    // Firefox returns empty string values for `margin` and `padding` properties
    // when extracted using getComputedStyle (see similar issue here:
    // https://github.com/jquery/jquery/issues/3383). In this situation
    // we want to emulate the value that is returned by creating the top,
    // right, bottom and left properties as individual style lookups.
    if (value.length === 0 && (prop === 'margin' || prop === 'padding')) {
        /** @type {?} */
        const t = getComputedValue(styles, (/** @type {?} */ ((prop + 'Top'))));
        /** @type {?} */
        const r = getComputedValue(styles, (/** @type {?} */ ((prop + 'Right'))));
        /** @type {?} */
        const b = getComputedValue(styles, (/** @type {?} */ ((prop + 'Bottom'))));
        /** @type {?} */
        const l = getComputedValue(styles, (/** @type {?} */ ((prop + 'Left'))));
        // reconstruct the padding/margin value as `top right bottom left`
        // we `trim()` the value because if all of the values above are
        // empty string values then we would like the return value to
        // also be an empty string.
        value = `${t} ${r} ${b} ${l}`.trim();
    }
    return value;
}
/**
 * Reads and returns the provided property style from the provided styles collection.
 *
 * This function is useful because it will return an empty string in the
 * event that the value obtained from the styles collection is a non-string
 * value (which is usually the case if the `styles` object is mocked out).
 * @template K
 * @param {?} styles
 * @param {?} prop
 * @return {?}
 */
function getComputedValue(styles, prop) {
    /** @type {?} */
    const value = styles[prop];
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQW1DLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQVVqSyxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQztBQUNuRixDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLE1BQU07SUFDcEIsc0ZBQXNGO0lBQ3RGLDRGQUE0RjtJQUM1Riw2RkFBNkY7SUFDN0YsMkZBQTJGO0lBQzNGLHVFQUF1RTtJQUN2RSxPQUFPLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxrQkFBa0IsQ0FBQztBQUM1RixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxPQUEwQjtJQUM1RCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEI7WUFDRSxPQUFPLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0M7QUFDSCxDQUFDOzs7Ozs7Ozs7O0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUM5QixNQUF1QixFQUFFLFVBQW9DLEVBQUUsT0FBWSxFQUMzRSxTQUF1QixFQUFFLFlBQXdCLEVBQUUsRUFDbkQsYUFBeUIs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QUM7O2NBQzFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsbUJBQUEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEVBQWtDLENBQUM7O2NBQ2hGLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsbUJBQUEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLEVBQW9DLENBQUM7O2NBQ25GLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsbUJBQUEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEVBQWdDLENBQUM7UUFFbkYsa0VBQWtFO1FBQ2xFLCtEQUErRDtRQUMvRCw2REFBNkQ7UUFDN0QsMkJBQTJCO1FBQzNCLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3RDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDOzs7Ozs7Ozs7Ozs7QUFTRCxTQUFTLGdCQUFnQixDQUNyQixNQUEyQixFQUFFLElBQU87O1VBQ2hDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFCLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25FdmVudCwgQW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtUFuaW1hdGlvbkdyb3VwUGxheWVyLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uLy4uL3NyYy9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vLi4vc3JjL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcblxuLy8gV2UgZG9uJ3QgaW5jbHVkZSBhbWJpZW50IG5vZGUgdHlwZXMgaGVyZSBzaW5jZSBAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXJcbi8vIGlzIG1lYW50IHRvIHRhcmdldCB0aGUgYnJvd3NlciBzbyB0ZWNobmljYWxseSBpdCBzaG91bGQgbm90IGRlcGVuZCBvbiBub2RlXG4vLyB0eXBlcy4gYHByb2Nlc3NgIGlzIGp1c3QgZGVjbGFyZWQgbG9jYWxseSBoZXJlIGFzIGEgcmVzdWx0LlxuZGVjbGFyZSBjb25zdCBwcm9jZXNzOiBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jyb3dzZXIoKTogYm9vbGVhbiB7XG4gIHJldHVybiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5kb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlKCk6IGJvb2xlYW4ge1xuICAvLyBDaGVja2luZyBvbmx5IGZvciBgcHJvY2Vzc2AgaXNuJ3QgZW5vdWdoIHRvIGlkZW50aWZ5IHdoZXRoZXIgb3Igbm90IHdlJ3JlIGluIGEgTm9kZVxuICAvLyBlbnZpcm9ubWVudCwgYmVjYXVzZSBXZWJwYWNrIGJ5IGRlZmF1bHQgd2lsbCBwb2x5ZmlsbCB0aGUgYHByb2Nlc3NgLiBXaGlsZSB3ZSBjYW4gZGlzY2VyblxuICAvLyB0aGF0IFdlYnBhY2sgcG9seWZpbGxlZCBpdCBieSBsb29raW5nIGF0IGBwcm9jZXNzLmJyb3dzZXJgLCBpdCdzIHZlcnkgV2VicGFjay1zcGVjaWZpYyBhbmRcbiAgLy8gbWlnaHQgbm90IGJlIGZ1dHVyZS1wcm9vZi4gSW5zdGVhZCB3ZSBsb29rIGF0IHRoZSBzdHJpbmdpZmllZCB2ZXJzaW9uIG9mIGBwcm9jZXNzYCB3aGljaFxuICAvLyBpcyBgW29iamVjdCBwcm9jZXNzXWAgaW4gTm9kZSBhbmQgYFtvYmplY3QgT2JqZWN0XWAgd2hlbiBwb2x5ZmlsbGVkLlxuICByZXR1cm4gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXIge1xuICBzd2l0Y2ggKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIG5ldyBOb29wQW5pbWF0aW9uUGxheWVyKCk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHBsYXllcnNbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBuZXcgybVBbmltYXRpb25Hcm91cFBsYXllcihwbGF5ZXJzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIsIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIHByZVN0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBwb3N0U3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9KTogybVTdHlsZURhdGFbXSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICBsZXQgcHJldmlvdXNPZmZzZXQgPSAtMTtcbiAgbGV0IHByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhfG51bGwgPSBudWxsO1xuICBrZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgY29uc3Qgb2Zmc2V0ID0ga2ZbJ29mZnNldCddIGFzIG51bWJlcjtcbiAgICBjb25zdCBpc1NhbWVPZmZzZXQgPSBvZmZzZXQgPT0gcHJldmlvdXNPZmZzZXQ7XG4gICAgY29uc3Qgbm9ybWFsaXplZEtleWZyYW1lOiDJtVN0eWxlRGF0YSA9IChpc1NhbWVPZmZzZXQgJiYgcHJldmlvdXNLZXlmcmFtZSkgfHwge307XG4gICAgT2JqZWN0LmtleXMoa2YpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBsZXQgbm9ybWFsaXplZFByb3AgPSBwcm9wO1xuICAgICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IGtmW3Byb3BdO1xuICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplci5ub3JtYWxpemVQcm9wZXJ0eU5hbWUobm9ybWFsaXplZFByb3AsIGVycm9ycyk7XG4gICAgICAgIHN3aXRjaCAobm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBQUkVfU1RZTEU6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSBwcmVTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgQVVUT19TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHBvc3RTdHlsZXNbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPVxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZXIubm9ybWFsaXplU3R5bGVWYWx1ZShwcm9wLCBub3JtYWxpemVkUHJvcCwgbm9ybWFsaXplZFZhbHVlLCBlcnJvcnMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZVtub3JtYWxpemVkUHJvcF0gPSBub3JtYWxpemVkVmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKCFpc1NhbWVPZmZzZXQpIHtcbiAgICAgIG5vcm1hbGl6ZWRLZXlmcmFtZXMucHVzaChub3JtYWxpemVkS2V5ZnJhbWUpO1xuICAgIH1cbiAgICBwcmV2aW91c0tleWZyYW1lID0gbm9ybWFsaXplZEtleWZyYW1lO1xuICAgIHByZXZpb3VzT2Zmc2V0ID0gb2Zmc2V0O1xuICB9KTtcbiAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICBjb25zdCBMSU5FX1NUQVJUID0gJ1xcbiAtICc7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGFuaW1hdGUgZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOiR7TElORV9TVEFSVH0ke2Vycm9ycy5qb2luKExJTkVfU1RBUlQpfWApO1xuICB9XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWRLZXlmcmFtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5PblBsYXllcihcbiAgICBwbGF5ZXI6IEFuaW1hdGlvblBsYXllciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBBbmltYXRpb25FdmVudCB8IHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSkge1xuICBzd2l0Y2ggKGV2ZW50TmFtZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ3N0YXJ0JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG9uZSc6XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2RvbmUnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXN0cm95JzpcbiAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZGVzdHJveScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5QW5pbWF0aW9uRXZlbnQoXG4gICAgZTogQW5pbWF0aW9uRXZlbnQsIHBoYXNlTmFtZTogc3RyaW5nLCBwbGF5ZXI6IEFuaW1hdGlvblBsYXllcik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgY29uc3QgdG90YWxUaW1lID0gcGxheWVyLnRvdGFsVGltZTtcbiAgY29uc3QgZGlzYWJsZWQgPSAocGxheWVyIGFzIGFueSkuZGlzYWJsZWQgPyB0cnVlIDogZmFsc2U7XG4gIGNvbnN0IGV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgZS5lbGVtZW50LCBlLnRyaWdnZXJOYW1lLCBlLmZyb21TdGF0ZSwgZS50b1N0YXRlLCBwaGFzZU5hbWUgfHwgZS5waGFzZU5hbWUsXG4gICAgICB0b3RhbFRpbWUgPT0gdW5kZWZpbmVkID8gZS50b3RhbFRpbWUgOiB0b3RhbFRpbWUsIGRpc2FibGVkKTtcbiAgY29uc3QgZGF0YSA9IChlIGFzIGFueSlbJ19kYXRhJ107XG4gIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAoZXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IGRhdGE7XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgIGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgcGhhc2VOYW1lOiBzdHJpbmcgPSAnJyxcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDAsIGRpc2FibGVkPzogYm9vbGVhbik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgcmV0dXJuIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwaGFzZU5hbWUsIHRvdGFsVGltZSwgZGlzYWJsZWQ6ICEhZGlzYWJsZWR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JTZXRBc0luTWFwKFxuICAgIG1hcDogTWFwPGFueSwgYW55Pnwge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogYW55LCBkZWZhdWx0VmFsdWU6IGFueSkge1xuICBsZXQgdmFsdWU6IGFueTtcbiAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSA9IGRlZmF1bHRWYWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gbWFwW2tleV07XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBtYXBba2V5XSA9IGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lbGluZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IHNlcGFyYXRvclBvcyA9IGNvbW1hbmQuaW5kZXhPZignOicpO1xuICBjb25zdCBpZCA9IGNvbW1hbmQuc3Vic3RyaW5nKDEsIHNlcGFyYXRvclBvcyk7XG4gIGNvbnN0IGFjdGlvbiA9IGNvbW1hbmQuc3Vic3RyKHNlcGFyYXRvclBvcyArIDEpO1xuICByZXR1cm4gW2lkLCBhY3Rpb25dO1xufVxuXG5sZXQgX2NvbnRhaW5zOiAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGJvb2xlYW4gPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IGZhbHNlO1xubGV0IF9tYXRjaGVzOiAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBib29sZWFuID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT5cbiAgICBmYWxzZTtcbmxldCBfcXVlcnk6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKSA9PiBhbnlbXSA9XG4gICAgKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9O1xuXG4vLyBEZWZpbmUgdXRpbGl0eSBtZXRob2RzIGZvciBicm93c2VycyBhbmQgcGxhdGZvcm0tc2VydmVyKGRvbWlubykgd2hlcmUgRWxlbWVudFxuLy8gYW5kIHV0aWxpdHkgbWV0aG9kcyBleGlzdC5cbmNvbnN0IF9pc05vZGUgPSBpc05vZGUoKTtcbmlmIChfaXNOb2RlIHx8IHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAvLyB0aGlzIGlzIHdlbGwgc3VwcG9ydGVkIGluIGFsbCBicm93c2Vyc1xuICBfY29udGFpbnMgPSAoZWxtMTogYW55LCBlbG0yOiBhbnkpID0+IHsgcmV0dXJuIGVsbTEuY29udGFpbnMoZWxtMikgYXMgYm9vbGVhbjsgfTtcblxuICBfbWF0Y2hlcyA9ICgoKSA9PiB7XG4gICAgaWYgKF9pc05vZGUgfHwgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgICAgcmV0dXJuIChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGVsZW1lbnQubWF0Y2hlcyhzZWxlY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb3RvID0gRWxlbWVudC5wcm90b3R5cGUgYXMgYW55O1xuICAgICAgY29uc3QgZm4gPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgcHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGZuLmFwcGx5KGVsZW1lbnQsIFtzZWxlY3Rvcl0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF9tYXRjaGVzO1xuICAgICAgfVxuICAgIH1cbiAgfSkoKTtcblxuICBfcXVlcnkgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdID0+IHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAobXVsdGkpIHtcbiAgICAgIHJlc3VsdHMucHVzaCguLi5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWxtID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIGlmIChlbG0pIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGVsbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb250YWluc1ZlbmRvclByZWZpeChwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gV2Via2l0IGlzIHRoZSBvbmx5IHJlYWwgcG9wdWxhciB2ZW5kb3IgcHJlZml4IG5vd2FkYXlzXG4gIC8vIGNjOiBodHRwOi8vc2hvdWxkaXByZWZpeC5jb20vXG4gIHJldHVybiBwcm9wLnN1YnN0cmluZygxLCA2KSA9PSAnZWJraXQnOyAgLy8gd2Via2l0IG9yIFdlYmtpdFxufVxuXG5sZXQgX0NBQ0hFRF9CT0RZOiB7c3R5bGU6IGFueX18bnVsbCA9IG51bGw7XG5sZXQgX0lTX1dFQktJVCA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfQ0FDSEVEX0JPRFkpIHtcbiAgICBfQ0FDSEVEX0JPRFkgPSBnZXRCb2R5Tm9kZSgpIHx8IHt9O1xuICAgIF9JU19XRUJLSVQgPSBfQ0FDSEVEX0JPRFkgIS5zdHlsZSA/ICgnV2Via2l0QXBwZWFyYW5jZScgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGUpIDogZmFsc2U7XG4gIH1cblxuICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgaWYgKF9DQUNIRURfQk9EWSAhLnN0eWxlICYmICFjb250YWluc1ZlbmRvclByZWZpeChwcm9wKSkge1xuICAgIHJlc3VsdCA9IHByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgaWYgKCFyZXN1bHQgJiYgX0lTX1dFQktJVCkge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gJ1dlYmtpdCcgKyBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSk7XG4gICAgICByZXN1bHQgPSBjYW1lbFByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvZHlOb2RlKCk6IGFueXxudWxsIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgY29uc3QgbWF0Y2hlc0VsZW1lbnQgPSBfbWF0Y2hlcztcbmV4cG9ydCBjb25zdCBjb250YWluc0VsZW1lbnQgPSBfY29udGFpbnM7XG5leHBvcnQgY29uc3QgaW52b2tlUXVlcnkgPSBfcXVlcnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBoeXBlbmF0ZVByb3BzT2JqZWN0KG9iamVjdDoge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGNvbnN0IG5ld09iajoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKHByb3AgPT4ge1xuICAgIGNvbnN0IG5ld1Byb3AgPSBwcm9wLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpO1xuICAgIG5ld09ialtuZXdQcm9wXSA9IG9iamVjdFtwcm9wXTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmo7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb21wdXRlZCBzdHlsZSBmb3IgdGhlIHByb3ZpZGVkIHByb3BlcnR5IG9uIHRoZSBwcm92aWRlZCBlbGVtZW50LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdXNlcyBgd2luZG93LmdldENvbXB1dGVkU3R5bGVgIGludGVybmFsbHkgdG8gZGV0ZXJtaW5lIHRoZVxuICogc3R5bGUgdmFsdWUgZm9yIHRoZSBlbGVtZW50LiBGaXJlZm94IGRvZXNuJ3Qgc3VwcG9ydCByZWFkaW5nIHRoZSBzaG9ydGhhbmRcbiAqIGZvcm1zIG9mIG1hcmdpbi9wYWRkaW5nIGFuZCBmb3IgdGhpcyByZWFzb24gdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBhY2NvdW50XG4gKiBmb3IgdGhhdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTdHlsZShlbGVtZW50OiBIVE1MRWxlbWVudCwgcHJvcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG5cbiAgLy8gdGhpcyBpcyBjYXN0ZWQgdG8gYW55IGJlY2F1c2UgdGhlIGBDU1NTdHlsZURlY2xhcmF0aW9uYCB0eXBlIGlzIGEgZml4ZWRcbiAgLy8gc2V0IG9mIHByb3BlcnRpZXMgYW5kIGBwcm9wYCBpcyBhIGR5bmFtaWMgcmVmZXJlbmNlIHRvIGEgcHJvcGVydHkgd2l0aGluXG4gIC8vIHRoZSBgQ1NTU3R5bGVEZWNsYXJhdGlvbmAgbGlzdC5cbiAgbGV0IHZhbHVlID0gZ2V0Q29tcHV0ZWRWYWx1ZShzdHlsZXMsIHByb3AgYXMga2V5b2YgQ1NTU3R5bGVEZWNsYXJhdGlvbik7XG5cbiAgLy8gRmlyZWZveCByZXR1cm5zIGVtcHR5IHN0cmluZyB2YWx1ZXMgZm9yIGBtYXJnaW5gIGFuZCBgcGFkZGluZ2AgcHJvcGVydGllc1xuICAvLyB3aGVuIGV4dHJhY3RlZCB1c2luZyBnZXRDb21wdXRlZFN0eWxlIChzZWUgc2ltaWxhciBpc3N1ZSBoZXJlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9pc3N1ZXMvMzM4MykuIEluIHRoaXMgc2l0dWF0aW9uXG4gIC8vIHdlIHdhbnQgdG8gZW11bGF0ZSB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCBieSBjcmVhdGluZyB0aGUgdG9wLFxuICAvLyByaWdodCwgYm90dG9tIGFuZCBsZWZ0IHByb3BlcnRpZXMgYXMgaW5kaXZpZHVhbCBzdHlsZSBsb29rdXBzLlxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwICYmIChwcm9wID09PSAnbWFyZ2luJyB8fCBwcm9wID09PSAncGFkZGluZycpKSB7XG4gICAgY29uc3QgdCA9IGdldENvbXB1dGVkVmFsdWUoc3R5bGVzLCAocHJvcCArICdUb3AnKSBhcyAnbWFyZ2luVG9wJyB8ICdwYWRkaW5nVG9wJyk7XG4gICAgY29uc3QgciA9IGdldENvbXB1dGVkVmFsdWUoc3R5bGVzLCAocHJvcCArICdSaWdodCcpIGFzICdtYXJnaW5SaWdodCcgfCAncGFkZGluZ1JpZ2h0Jyk7XG4gICAgY29uc3QgYiA9IGdldENvbXB1dGVkVmFsdWUoc3R5bGVzLCAocHJvcCArICdCb3R0b20nKSBhcyAnbWFyZ2luQm90dG9tJyB8ICdwYWRkaW5nQm90dG9tJyk7XG4gICAgY29uc3QgbCA9IGdldENvbXB1dGVkVmFsdWUoc3R5bGVzLCAocHJvcCArICdMZWZ0JykgYXMgJ21hcmdpbkxlZnQnIHwgJ3BhZGRpbmdMZWZ0Jyk7XG5cbiAgICAvLyByZWNvbnN0cnVjdCB0aGUgcGFkZGluZy9tYXJnaW4gdmFsdWUgYXMgYHRvcCByaWdodCBib3R0b20gbGVmdGBcbiAgICAvLyB3ZSBgdHJpbSgpYCB0aGUgdmFsdWUgYmVjYXVzZSBpZiBhbGwgb2YgdGhlIHZhbHVlcyBhYm92ZSBhcmVcbiAgICAvLyBlbXB0eSBzdHJpbmcgdmFsdWVzIHRoZW4gd2Ugd291bGQgbGlrZSB0aGUgcmV0dXJuIHZhbHVlIHRvXG4gICAgLy8gYWxzbyBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAgdmFsdWUgPSBgJHt0fSAke3J9ICR7Yn0gJHtsfWAudHJpbSgpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIFJlYWRzIGFuZCByZXR1cm5zIHRoZSBwcm92aWRlZCBwcm9wZXJ0eSBzdHlsZSBmcm9tIHRoZSBwcm92aWRlZCBzdHlsZXMgY29sbGVjdGlvbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWZ1bCBiZWNhdXNlIGl0IHdpbGwgcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBpbiB0aGVcbiAqIGV2ZW50IHRoYXQgdGhlIHZhbHVlIG9idGFpbmVkIGZyb20gdGhlIHN0eWxlcyBjb2xsZWN0aW9uIGlzIGEgbm9uLXN0cmluZ1xuICogdmFsdWUgKHdoaWNoIGlzIHVzdWFsbHkgdGhlIGNhc2UgaWYgdGhlIGBzdHlsZXNgIG9iamVjdCBpcyBtb2NrZWQgb3V0KS5cbiAqL1xuZnVuY3Rpb24gZ2V0Q29tcHV0ZWRWYWx1ZTxLIGV4dGVuZHMga2V5b2YgQ1NTU3R5bGVEZWNsYXJhdGlvbj4oXG4gICAgc3R5bGVzOiBDU1NTdHlsZURlY2xhcmF0aW9uLCBwcm9wOiBLKTogc3RyaW5nIHtcbiAgY29uc3QgdmFsdWUgPSBzdHlsZXNbcHJvcF07XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiAnJztcbn1cbiJdfQ==