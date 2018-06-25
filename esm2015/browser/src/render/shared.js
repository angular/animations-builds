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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUFtQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFLakssTUFBTTtJQUNKLE9BQU8sQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ2xGOzs7O0FBRUQsTUFBTTtJQUNKLE9BQU8sQ0FBQyxPQUFPLE9BQU8sS0FBSyxXQUFXLENBQUMsQ0FBQztDQUN6Qzs7Ozs7QUFFRCxNQUFNLDhCQUE4QixPQUEwQjtJQUM1RCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEI7WUFDRSxPQUFPLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0M7Q0FDRjs7Ozs7Ozs7OztBQUVELE1BQU0sNkJBQ0YsTUFBdUIsRUFBRSxVQUFvQyxFQUFFLE9BQVksRUFDM0UsU0FBdUIsRUFBRSxZQUF3QixFQUFFLEVBQ25ELGFBQXlCLEVBQUU7SUFDN0IsdUJBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1Qix1QkFBTSxtQkFBbUIsR0FBaUIsRUFBRSxDQUFDO0lBQzdDLHFCQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN4QixxQkFBSSxnQkFBZ0IsR0FBb0IsSUFBSSxDQUFDO0lBQzdDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFD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QUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pDLHVCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7Q0FDZiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uRXZlbnQsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi8uLi9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uLy4uL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jyb3dzZXIoKSB7XG4gIHJldHVybiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5kb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlKCkge1xuICByZXR1cm4gKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgc3dpdGNoIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcigpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBwbGF5ZXJzWzBdO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbmV3IMm1QW5pbWF0aW9uR3JvdXBQbGF5ZXIocGxheWVycyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUtleWZyYW1lcyhcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyLCBlbGVtZW50OiBhbnksXG4gICAga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLCBwcmVTdHlsZXM6IMm1U3R5bGVEYXRhID0ge30sXG4gICAgcG9zdFN0eWxlczogybVTdHlsZURhdGEgPSB7fSk6IMm1U3R5bGVEYXRhW10ge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IG5vcm1hbGl6ZWRLZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10gPSBbXTtcbiAgbGV0IHByZXZpb3VzT2Zmc2V0ID0gLTE7XG4gIGxldCBwcmV2aW91c0tleWZyYW1lOiDJtVN0eWxlRGF0YXxudWxsID0gbnVsbDtcbiAga2V5ZnJhbWVzLmZvckVhY2goa2YgPT4ge1xuICAgIGNvbnN0IG9mZnNldCA9IGtmWydvZmZzZXQnXSBhcyBudW1iZXI7XG4gICAgY29uc3QgaXNTYW1lT2Zmc2V0ID0gb2Zmc2V0ID09IHByZXZpb3VzT2Zmc2V0O1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRLZXlmcmFtZTogybVTdHlsZURhdGEgPSAoaXNTYW1lT2Zmc2V0ICYmIHByZXZpb3VzS2V5ZnJhbWUpIHx8IHt9O1xuICAgIE9iamVjdC5rZXlzKGtmKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgbGV0IG5vcm1hbGl6ZWRQcm9wID0gcHJvcDtcbiAgICAgIGxldCBub3JtYWxpemVkVmFsdWUgPSBrZltwcm9wXTtcbiAgICAgIGlmIChwcm9wICE9PSAnb2Zmc2V0Jykge1xuICAgICAgICBub3JtYWxpemVkUHJvcCA9IG5vcm1hbGl6ZXIubm9ybWFsaXplUHJvcGVydHlOYW1lKG5vcm1hbGl6ZWRQcm9wLCBlcnJvcnMpO1xuICAgICAgICBzd2l0Y2ggKG5vcm1hbGl6ZWRWYWx1ZSkge1xuICAgICAgICAgIGNhc2UgUFJFX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcHJlU3R5bGVzW3Byb3BdO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIEFVVE9fU1RZTEU6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSBwb3N0U3R5bGVzW3Byb3BdO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID1cbiAgICAgICAgICAgICAgICBub3JtYWxpemVyLm5vcm1hbGl6ZVN0eWxlVmFsdWUocHJvcCwgbm9ybWFsaXplZFByb3AsIG5vcm1hbGl6ZWRWYWx1ZSwgZXJyb3JzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWVbbm9ybWFsaXplZFByb3BdID0gbm9ybWFsaXplZFZhbHVlO1xuICAgIH0pO1xuICAgIGlmICghaXNTYW1lT2Zmc2V0KSB7XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWVzLnB1c2gobm9ybWFsaXplZEtleWZyYW1lKTtcbiAgICB9XG4gICAgcHJldmlvdXNLZXlmcmFtZSA9IG5vcm1hbGl6ZWRLZXlmcmFtZTtcbiAgICBwcmV2aW91c09mZnNldCA9IG9mZnNldDtcbiAgfSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgY29uc3QgTElORV9TVEFSVCA9ICdcXG4gLSAnO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBhbmltYXRlIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczoke0xJTkVfU1RBUlR9JHtlcnJvcnMuam9pbihMSU5FX1NUQVJUKX1gKTtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxpemVkS2V5ZnJhbWVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuT25QbGF5ZXIoXG4gICAgcGxheWVyOiBBbmltYXRpb25QbGF5ZXIsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudDogQW5pbWF0aW9uRXZlbnQgfCB1bmRlZmluZWQsXG4gICAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpIHtcbiAgc3dpdGNoIChldmVudE5hbWUpIHtcbiAgICBjYXNlICdzdGFydCc6XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdzdGFydCcsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RvbmUnOlxuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkb25lJywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGVzdHJveSc6XG4gICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2Rlc3Ryb3knLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weUFuaW1hdGlvbkV2ZW50KFxuICAgIGU6IEFuaW1hdGlvbkV2ZW50LCBwaGFzZU5hbWU6IHN0cmluZywgcGxheWVyOiBBbmltYXRpb25QbGF5ZXIpOiBBbmltYXRpb25FdmVudCB7XG4gIGNvbnN0IHRvdGFsVGltZSA9IHBsYXllci50b3RhbFRpbWU7XG4gIGNvbnN0IGRpc2FibGVkID0gKHBsYXllciBhcyBhbnkpLmRpc2FibGVkID8gdHJ1ZSA6IGZhbHNlO1xuICBjb25zdCBldmVudCA9IG1ha2VBbmltYXRpb25FdmVudChcbiAgICAgIGUuZWxlbWVudCwgZS50cmlnZ2VyTmFtZSwgZS5mcm9tU3RhdGUsIGUudG9TdGF0ZSwgcGhhc2VOYW1lIHx8IGUucGhhc2VOYW1lLFxuICAgICAgdG90YWxUaW1lID09IHVuZGVmaW5lZCA/IGUudG90YWxUaW1lIDogdG90YWxUaW1lLCBkaXNhYmxlZCk7XG4gIGNvbnN0IGRhdGEgPSAoZSBhcyBhbnkpWydfZGF0YSddO1xuICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgKGV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBkYXRhO1xuICB9XG4gIHJldHVybiBldmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VBbmltYXRpb25FdmVudChcbiAgICBlbGVtZW50OiBhbnksIHRyaWdnZXJOYW1lOiBzdHJpbmcsIGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIHBoYXNlTmFtZTogc3RyaW5nID0gJycsXG4gICAgdG90YWxUaW1lOiBudW1iZXIgPSAwLCBkaXNhYmxlZD86IGJvb2xlYW4pOiBBbmltYXRpb25FdmVudCB7XG4gIHJldHVybiB7ZWxlbWVudCwgdHJpZ2dlck5hbWUsIGZyb21TdGF0ZSwgdG9TdGF0ZSwgcGhhc2VOYW1lLCB0b3RhbFRpbWUsIGRpc2FibGVkOiAhIWRpc2FibGVkfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yU2V0QXNJbk1hcChcbiAgICBtYXA6IE1hcDxhbnksIGFueT58IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IGFueSwgZGVmYXVsdFZhbHVlOiBhbnkpIHtcbiAgbGV0IHZhbHVlOiBhbnk7XG4gIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBtYXAuc2V0KGtleSwgdmFsdWUgPSBkZWZhdWx0VmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IG1hcFtrZXldO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHZhbHVlID0gbWFwW2tleV0gPSBkZWZhdWx0VmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZWxpbmVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICBjb25zdCBzZXBhcmF0b3JQb3MgPSBjb21tYW5kLmluZGV4T2YoJzonKTtcbiAgY29uc3QgaWQgPSBjb21tYW5kLnN1YnN0cmluZygxLCBzZXBhcmF0b3JQb3MpO1xuICBjb25zdCBhY3Rpb24gPSBjb21tYW5kLnN1YnN0cihzZXBhcmF0b3JQb3MgKyAxKTtcbiAgcmV0dXJuIFtpZCwgYWN0aW9uXTtcbn1cblxubGV0IF9jb250YWluczogKGVsbTE6IGFueSwgZWxtMjogYW55KSA9PiBib29sZWFuID0gKGVsbTE6IGFueSwgZWxtMjogYW55KSA9PiBmYWxzZTtcbmxldCBfbWF0Y2hlczogKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gYm9vbGVhbiA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+XG4gICAgZmFsc2U7XG5sZXQgX3F1ZXJ5OiAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbikgPT4gYW55W10gPVxuICAgIChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKSA9PiB7XG4gICAgICByZXR1cm4gW107XG4gICAgfTtcblxuLy8gRGVmaW5lIHV0aWxpdHkgbWV0aG9kcyBmb3IgYnJvd3NlcnMgYW5kIHBsYXRmb3JtLXNlcnZlcihkb21pbm8pIHdoZXJlIEVsZW1lbnRcbi8vIGFuZCB1dGlsaXR5IG1ldGhvZHMgZXhpc3QuXG5jb25zdCBfaXNOb2RlID0gaXNOb2RlKCk7XG5pZiAoX2lzTm9kZSB8fCB0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gdGhpcyBpcyB3ZWxsIHN1cHBvcnRlZCBpbiBhbGwgYnJvd3NlcnNcbiAgX2NvbnRhaW5zID0gKGVsbTE6IGFueSwgZWxtMjogYW55KSA9PiB7IHJldHVybiBlbG0xLmNvbnRhaW5zKGVsbTIpIGFzIGJvb2xlYW47IH07XG5cbiAgaWYgKF9pc05vZGUgfHwgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIF9tYXRjaGVzID0gKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlIGFzIGFueTtcbiAgICBjb25zdCBmbiA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgcHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gICAgaWYgKGZuKSB7XG4gICAgICBfbWF0Y2hlcyA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGZuLmFwcGx5KGVsZW1lbnQsIFtzZWxlY3Rvcl0pO1xuICAgIH1cbiAgfVxuXG4gIF9xdWVyeSA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10gPT4ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChtdWx0aSkge1xuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbG0gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGVsbSkge1xuICAgICAgICByZXN1bHRzLnB1c2goZWxtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBXZWJraXQgaXMgdGhlIG9ubHkgcmVhbCBwb3B1bGFyIHZlbmRvciBwcmVmaXggbm93YWRheXNcbiAgLy8gY2M6IGh0dHA6Ly9zaG91bGRpcHJlZml4LmNvbS9cbiAgcmV0dXJuIHByb3Auc3Vic3RyaW5nKDEsIDYpID09ICdlYmtpdCc7ICAvLyB3ZWJraXQgb3IgV2Via2l0XG59XG5cbmxldCBfQ0FDSEVEX0JPRFk6IHtzdHlsZTogYW55fXxudWxsID0gbnVsbDtcbmxldCBfSVNfV0VCS0lUID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9DQUNIRURfQk9EWSkge1xuICAgIF9DQUNIRURfQk9EWSA9IGdldEJvZHlOb2RlKCkgfHwge307XG4gICAgX0lTX1dFQktJVCA9IF9DQUNIRURfQk9EWSAhLnN0eWxlID8gKCdXZWJraXRBcHBlYXJhbmNlJyBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBpZiAoX0NBQ0hFRF9CT0RZICEuc3R5bGUgJiYgIWNvbnRhaW5zVmVuZG9yUHJlZml4KHByb3ApKSB7XG4gICAgcmVzdWx0ID0gcHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICBpZiAoIXJlc3VsdCAmJiBfSVNfV0VCS0lUKSB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSAnV2Via2l0JyArIHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnN1YnN0cigxKTtcbiAgICAgIHJlc3VsdCA9IGNhbWVsUHJvcCBpbiBfQ0FDSEVEX0JPRFkgIS5zdHlsZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9keU5vZGUoKTogYW55fG51bGwge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBtYXRjaGVzRWxlbWVudCA9IF9tYXRjaGVzO1xuZXhwb3J0IGNvbnN0IGNvbnRhaW5zRWxlbWVudCA9IF9jb250YWlucztcbmV4cG9ydCBjb25zdCBpbnZva2VRdWVyeSA9IF9xdWVyeTtcblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGVuYXRlUHJvcHNPYmplY3Qob2JqZWN0OiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3QgbmV3T2JqOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgbmV3UHJvcCA9IHByb3AucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJyk7XG4gICAgbmV3T2JqW25ld1Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iajtcbn1cbiJdfQ==