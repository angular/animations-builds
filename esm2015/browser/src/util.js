/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { sequence } from '@angular/animations';
import { isNode } from './render/shared';
export const /** @type {?} */ ONE_SECOND = 1000;
export const /** @type {?} */ SUBSTITUTION_EXPR_START = '{{';
export const /** @type {?} */ SUBSTITUTION_EXPR_END = '}}';
export const /** @type {?} */ ENTER_CLASSNAME = 'ng-enter';
export const /** @type {?} */ LEAVE_CLASSNAME = 'ng-leave';
export const /** @type {?} */ ENTER_SELECTOR = '.ng-enter';
export const /** @type {?} */ LEAVE_SELECTOR = '.ng-leave';
export const /** @type {?} */ NG_TRIGGER_CLASSNAME = 'ng-trigger';
export const /** @type {?} */ NG_TRIGGER_SELECTOR = '.ng-trigger';
export const /** @type {?} */ NG_ANIMATING_CLASSNAME = 'ng-animating';
export const /** @type {?} */ NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} value
 * @return {?}
 */
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    const /** @type {?} */ matches = (/** @type {?} */ (value)).match(/^(-?[\.\d]+)(m?s)/);
    if (!matches || matches.length < 2)
        return 0;
    return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
/**
 * @param {?} value
 * @param {?} unit
 * @return {?}
 */
function _convertTimeValueToMS(value, unit) {
    switch (unit) {
        case 's':
            return value * ONE_SECOND;
        default: // ms or something else
            // ms or something else
            return value;
    }
}
/**
 * @param {?} timings
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
export function resolveTiming(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration') ? /** @type {?} */ (timings) :
        parseTimeExpression(/** @type {?} */ (timings), errors, allowNegativeValues);
}
/**
 * @param {?} exp
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function parseTimeExpression(exp, errors, allowNegativeValues) {
    const /** @type {?} */ regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let /** @type {?} */ duration;
    let /** @type {?} */ delay = 0;
    let /** @type {?} */ easing = '';
    if (typeof exp === 'string') {
        const /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        const /** @type {?} */ delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(Math.floor(parseFloat(delayMatch)), matches[4]);
        }
        const /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = /** @type {?} */ (exp);
    }
    if (!allowNegativeValues) {
        let /** @type {?} */ containsErrors = false;
        let /** @type {?} */ startIndex = errors.length;
        if (duration < 0) {
            errors.push(`Duration values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(`Delay values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, `The provided timing value "${exp}" is invalid.`);
        }
    }
    return { duration, delay, easing };
}
/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */
export function copyObj(obj, destination = {}) {
    Object.keys(obj).forEach(prop => { destination[prop] = obj[prop]; });
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    const /** @type {?} */ normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach(data => copyStyles(data, false, normalizedStyles));
    }
    else {
        copyStyles(styles, false, normalizedStyles);
    }
    return normalizedStyles;
}
/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */
export function copyStyles(styles, readPrototype, destination = {}) {
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (let /** @type {?} */ prop in styles) {
            destination[prop] = styles[prop];
        }
    }
    else {
        copyObj(styles, destination);
    }
    return destination;
}
/**
 * @param {?} element
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function getStyleAttributeString(element, key, value) {
    // Return the key-value pair string to be added to the style attribute for the
    // given CSS style key.
    if (value) {
        return key + ':' + value + ';';
    }
    else {
        return '';
    }
}
/**
 * @param {?} element
 * @return {?}
 */
function writeStyleAttribute(element) {
    // Read the style property of the element and manually reflect it to the
    // style attribute. This is needed because Domino on platform-server doesn't
    // understand the full set of allowed CSS properties and doesn't reflect some
    // of them automatically.
    let /** @type {?} */ styleAttrValue = '';
    for (let /** @type {?} */ i = 0; i < element.style.length; i++) {
        const /** @type {?} */ key = element.style.item(i);
        styleAttrValue += getStyleAttributeString(element, key, element.style.getPropertyValue(key));
    }
    for (const /** @type {?} */ key in element.style) {
        // Skip internal Domino properties that don't need to be reflected.
        if (!element.style.hasOwnProperty(key) || key.startsWith('_')) {
            continue;
        }
        const /** @type {?} */ dashKey = camelCaseToDashCase(key);
        styleAttrValue += getStyleAttributeString(element, dashKey, element.style[key]);
    }
    element.setAttribute('style', styleAttrValue);
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
export function setStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = styles[prop];
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
export function eraseStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = '';
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
/**
 * @param {?} steps
 * @return {?}
 */
export function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return /** @type {?} */ (steps);
}
/**
 * @param {?} value
 * @param {?} options
 * @param {?} errors
 * @return {?}
 */
export function validateStyleParams(value, options, errors) {
    const /** @type {?} */ params = options.params || {};
    const /** @type {?} */ matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach(varName => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(`Unable to resolve the local animation param ${varName} in the given list of values`);
            }
        });
    }
}
const /** @type {?} */ PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
/**
 * @param {?} value
 * @return {?}
 */
export function extractStyleParams(value) {
    let /** @type {?} */ params = [];
    if (typeof value === 'string') {
        const /** @type {?} */ val = value.toString();
        let /** @type {?} */ match;
        while (match = PARAM_REGEX.exec(val)) {
            params.push(/** @type {?} */ (match[1]));
        }
        PARAM_REGEX.lastIndex = 0;
    }
    return params;
}
/**
 * @param {?} value
 * @param {?} params
 * @param {?} errors
 * @return {?}
 */
export function interpolateParams(value, params, errors) {
    const /** @type {?} */ original = value.toString();
    const /** @type {?} */ str = original.replace(PARAM_REGEX, (_, varName) => {
        let /** @type {?} */ localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push(`Please provide a value for the animation param ${varName}`);
            localVal = '';
        }
        return localVal.toString();
    });
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
/**
 * @param {?} iterator
 * @return {?}
 */
export function iteratorToArray(iterator) {
    const /** @type {?} */ arr = [];
    let /** @type {?} */ item = iterator.next();
    while (!item.done) {
        arr.push(item.value);
        item = iterator.next();
    }
    return arr;
}
/**
 * @param {?} source
 * @param {?} destination
 * @return {?}
 */
export function mergeAnimationOptions(source, destination) {
    if (source.params) {
        const /** @type {?} */ p0 = source.params;
        if (!destination.params) {
            destination.params = {};
        }
        const /** @type {?} */ p1 = destination.params;
        Object.keys(p0).forEach(param => {
            if (!p1.hasOwnProperty(param)) {
                p1[param] = p0[param];
            }
        });
    }
    return destination;
}
const /** @type {?} */ DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
/**
 * @param {?} input
 * @return {?}
 */
function camelCaseToDashCase(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * @param {?} duration
 * @param {?} delay
 * @return {?}
 */
export function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}
/**
 * @param {?} element
 * @param {?} keyframes
 * @param {?} previousStyles
 * @return {?}
 */
export function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
    const /** @type {?} */ previousStyleProps = Object.keys(previousStyles);
    if (previousStyleProps.length && keyframes.length) {
        let /** @type {?} */ startingKeyframe = keyframes[0];
        let /** @type {?} */ missingStyleProps = [];
        previousStyleProps.forEach(prop => {
            if (!startingKeyframe.hasOwnProperty(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe[prop] = previousStyles[prop];
        });
        if (missingStyleProps.length) {
            // tslint:disable-next-line
            for (var /** @type {?} */ i = 1; i < keyframes.length; i++) {
                let /** @type {?} */ kf = keyframes[i];
                missingStyleProps.forEach(function (prop) { kf[prop] = computeStyle(element, prop); });
            }
        }
    }
    return keyframes;
}
/**
 * @param {?} visitor
 * @param {?} node
 * @param {?} context
 * @return {?}
 */
export function visitDslNode(visitor, node, context) {
    switch (node.type) {
        case 7 /* Trigger */:
            return visitor.visitTrigger(node, context);
        case 0 /* State */:
            return visitor.visitState(node, context);
        case 1 /* Transition */:
            return visitor.visitTransition(node, context);
        case 2 /* Sequence */:
            return visitor.visitSequence(node, context);
        case 3 /* Group */:
            return visitor.visitGroup(node, context);
        case 4 /* Animate */:
            return visitor.visitAnimate(node, context);
        case 5 /* Keyframes */:
            return visitor.visitKeyframes(node, context);
        case 6 /* Style */:
            return visitor.visitStyle(node, context);
        case 8 /* Reference */:
            return visitor.visitReference(node, context);
        case 9 /* AnimateChild */:
            return visitor.visitAnimateChild(node, context);
        case 10 /* AnimateRef */:
            return visitor.visitAnimateRef(node, context);
        case 11 /* Query */:
            return visitor.visitQuery(node, context);
        case 12 /* Stagger */:
            return visitor.visitStagger(node, context);
        default:
            throw new Error(`Unable to resolve animation metadata node #${node.type}`);
    }
}
/**
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
export function computeStyle(element, prop) {
    return (/** @type {?} */ (window.getComputedStyle(element)))[prop];
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUE2RSxRQUFRLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUdySSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFdkMsTUFBTSxDQUFDLHVCQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFL0IsTUFBTSxDQUFDLHVCQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQztBQUM1QyxNQUFNLENBQUMsdUJBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBQzFDLE1BQU0sQ0FBQyx1QkFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDO0FBQzFDLE1BQU0sQ0FBQyx1QkFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDO0FBQzFDLE1BQU0sQ0FBQyx1QkFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDO0FBQzFDLE1BQU0sQ0FBQyx1QkFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDO0FBQzFDLE1BQU0sQ0FBQyx1QkFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUM7QUFDakQsTUFBTSxDQUFDLHVCQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQztBQUNqRCxNQUFNLENBQUMsdUJBQU0sc0JBQXNCLEdBQUcsY0FBYyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyx1QkFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUM7Ozs7O0FBRXJELE1BQU0sNkJBQTZCLEtBQXNCO0lBQ3ZELElBQUksT0FBTyxLQUFLLElBQUksUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRTNDLHVCQUFNLE9BQU8sR0FBRyxtQkFBQyxLQUFlLEVBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM3RCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdB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LE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRDtZQUNFLE9BQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQ7WUFDRSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDO1lBQ0UsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QztZQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzlFO0NBQ0Y7Ozs7OztBQUVELE1BQU0sdUJBQXVCLE9BQVksRUFBRSxJQUFZO0lBQ3JELE9BQU8sbUJBQU0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGVUaW1pbmdzLCBBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBzZXF1ZW5jZSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBc3QgYXMgQW5pbWF0aW9uQXN0LCBBc3RWaXNpdG9yIGFzIEFuaW1hdGlvbkFzdFZpc2l0b3J9IGZyb20gJy4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25Ec2xWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fZHNsX3Zpc2l0b3InO1xuaW1wb3J0IHtpc05vZGV9IGZyb20gJy4vcmVuZGVyL3NoYXJlZCc7XG5cbmV4cG9ydCBjb25zdCBPTkVfU0VDT05EID0gMTAwMDtcblxuZXhwb3J0IGNvbnN0IFNVQlNUSVRVVElPTl9FWFBSX1NUQVJUID0gJ3t7JztcbmV4cG9ydCBjb25zdCBTVUJTVElUVVRJT05fRVhQUl9FTkQgPSAnfX0nO1xuZXhwb3J0IGNvbnN0IEVOVEVSX0NMQVNTTkFNRSA9ICduZy1lbnRlcic7XG5leHBvcnQgY29uc3QgTEVBVkVfQ0xBU1NOQU1FID0gJ25nLWxlYXZlJztcbmV4cG9ydCBjb25zdCBFTlRFUl9TRUxFQ1RPUiA9ICcubmctZW50ZXInO1xuZXhwb3J0IGNvbnN0IExFQVZFX1NFTEVDVE9SID0gJy5uZy1sZWF2ZSc7XG5leHBvcnQgY29uc3QgTkdfVFJJR0dFUl9DTEFTU05BTUUgPSAnbmctdHJpZ2dlcic7XG5leHBvcnQgY29uc3QgTkdfVFJJR0dFUl9TRUxFQ1RPUiA9ICcubmctdHJpZ2dlcic7XG5leHBvcnQgY29uc3QgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSA9ICduZy1hbmltYXRpbmcnO1xuZXhwb3J0IGNvbnN0IE5HX0FOSU1BVElOR19TRUxFQ1RPUiA9ICcubmctYW5pbWF0aW5nJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUaW1pbmdWYWx1ZSh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHJldHVybiB2YWx1ZTtcblxuICBjb25zdCBtYXRjaGVzID0gKHZhbHVlIGFzIHN0cmluZykubWF0Y2goL14oLT9bXFwuXFxkXSspKG0/cykvKTtcbiAgaWYgKCFtYXRjaGVzIHx8IG1hdGNoZXMubGVuZ3RoIDwgMikgcmV0dXJuIDA7XG5cbiAgcmV0dXJuIF9jb252ZXJ0VGltZVZhbHVlVG9NUyhwYXJzZUZsb2F0KG1hdGNoZXNbMV0pLCBtYXRjaGVzWzJdKTtcbn1cblxuZnVuY3Rpb24gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHZhbHVlOiBudW1iZXIsIHVuaXQ6IHN0cmluZyk6IG51bWJlciB7XG4gIHN3aXRjaCAodW5pdCkge1xuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIHZhbHVlICogT05FX1NFQ09ORDtcbiAgICBkZWZhdWx0OiAgLy8gbXMgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVRpbWluZyhcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIgfCBBbmltYXRlVGltaW5ncywgZXJyb3JzOiBhbnlbXSwgYWxsb3dOZWdhdGl2ZVZhbHVlcz86IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHRpbWluZ3MuaGFzT3duUHJvcGVydHkoJ2R1cmF0aW9uJykgP1xuICAgICAgPEFuaW1hdGVUaW1pbmdzPnRpbWluZ3MgOlxuICAgICAgcGFyc2VUaW1lRXhwcmVzc2lvbig8c3RyaW5nfG51bWJlcj50aW1pbmdzLCBlcnJvcnMsIGFsbG93TmVnYXRpdmVWYWx1ZXMpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVRpbWVFeHByZXNzaW9uKFxuICAgIGV4cDogc3RyaW5nIHwgbnVtYmVyLCBlcnJvcnM6IHN0cmluZ1tdLCBhbGxvd05lZ2F0aXZlVmFsdWVzPzogYm9vbGVhbik6IEFuaW1hdGVUaW1pbmdzIHtcbiAgY29uc3QgcmVnZXggPSAvXigtP1tcXC5cXGRdKykobT9zKSg/OlxccysoLT9bXFwuXFxkXSspKG0/cykpPyg/OlxccysoWy1hLXpdKyg/OlxcKC4rP1xcKSk/KSk/JC9pO1xuICBsZXQgZHVyYXRpb246IG51bWJlcjtcbiAgbGV0IGRlbGF5OiBudW1iZXIgPSAwO1xuICBsZXQgZWFzaW5nOiBzdHJpbmcgPSAnJztcbiAgaWYgKHR5cGVvZiBleHAgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IGV4cC5tYXRjaChyZWdleCk7XG4gICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgcHJvdmlkZWQgdGltaW5nIHZhbHVlIFwiJHtleHB9XCIgaXMgaW52YWxpZC5gKTtcbiAgICAgIHJldHVybiB7ZHVyYXRpb246IDAsIGRlbGF5OiAwLCBlYXNpbmc6ICcnfTtcbiAgICB9XG5cbiAgICBkdXJhdGlvbiA9IF9jb252ZXJ0VGltZVZhbHVlVG9NUyhwYXJzZUZsb2F0KG1hdGNoZXNbMV0pLCBtYXRjaGVzWzJdKTtcblxuICAgIGNvbnN0IGRlbGF5TWF0Y2ggPSBtYXRjaGVzWzNdO1xuICAgIGlmIChkZWxheU1hdGNoICE9IG51bGwpIHtcbiAgICAgIGRlbGF5ID0gX2NvbnZlcnRUaW1lVmFsdWVUb01TKE1hdGguZmxvb3IocGFyc2VGbG9hdChkZWxheU1hdGNoKSksIG1hdGNoZXNbNF0pO1xuICAgIH1cblxuICAgIGNvbnN0IGVhc2luZ1ZhbCA9IG1hdGNoZXNbNV07XG4gICAgaWYgKGVhc2luZ1ZhbCkge1xuICAgICAgZWFzaW5nID0gZWFzaW5nVmFsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBkdXJhdGlvbiA9IDxudW1iZXI+ZXhwO1xuICB9XG5cbiAgaWYgKCFhbGxvd05lZ2F0aXZlVmFsdWVzKSB7XG4gICAgbGV0IGNvbnRhaW5zRXJyb3JzID0gZmFsc2U7XG4gICAgbGV0IHN0YXJ0SW5kZXggPSBlcnJvcnMubGVuZ3RoO1xuICAgIGlmIChkdXJhdGlvbiA8IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGBEdXJhdGlvbiB2YWx1ZXMgYmVsb3cgMCBhcmUgbm90IGFsbG93ZWQgZm9yIHRoaXMgYW5pbWF0aW9uIHN0ZXAuYCk7XG4gICAgICBjb250YWluc0Vycm9ycyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChkZWxheSA8IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGBEZWxheSB2YWx1ZXMgYmVsb3cgMCBhcmUgbm90IGFsbG93ZWQgZm9yIHRoaXMgYW5pbWF0aW9uIHN0ZXAuYCk7XG4gICAgICBjb250YWluc0Vycm9ycyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjb250YWluc0Vycm9ycykge1xuICAgICAgZXJyb3JzLnNwbGljZShzdGFydEluZGV4LCAwLCBgVGhlIHByb3ZpZGVkIHRpbWluZyB2YWx1ZSBcIiR7ZXhwfVwiIGlzIGludmFsaWQuYCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtkdXJhdGlvbiwgZGVsYXksIGVhc2luZ307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5T2JqKFxuICAgIG9iajoge1trZXk6IHN0cmluZ106IGFueX0sIGRlc3RpbmF0aW9uOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2gocHJvcCA9PiB7IGRlc3RpbmF0aW9uW3Byb3BdID0gb2JqW3Byb3BdOyB9KTtcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3R5bGVzKHN0eWxlczogybVTdHlsZURhdGEgfCDJtVN0eWxlRGF0YVtdKTogybVTdHlsZURhdGEge1xuICBjb25zdCBub3JtYWxpemVkU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBpZiAoQXJyYXkuaXNBcnJheShzdHlsZXMpKSB7XG4gICAgc3R5bGVzLmZvckVhY2goZGF0YSA9PiBjb3B5U3R5bGVzKGRhdGEsIGZhbHNlLCBub3JtYWxpemVkU3R5bGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgY29weVN0eWxlcyhzdHlsZXMsIGZhbHNlLCBub3JtYWxpemVkU3R5bGVzKTtcbiAgfVxuICByZXR1cm4gbm9ybWFsaXplZFN0eWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlTdHlsZXMoXG4gICAgc3R5bGVzOiDJtVN0eWxlRGF0YSwgcmVhZFByb3RvdHlwZTogYm9vbGVhbiwgZGVzdGluYXRpb246IMm1U3R5bGVEYXRhID0ge30pOiDJtVN0eWxlRGF0YSB7XG4gIGlmIChyZWFkUHJvdG90eXBlKSB7XG4gICAgLy8gd2UgbWFrZSB1c2Ugb2YgYSBmb3ItaW4gbG9vcCBzbyB0aGF0IHRoZVxuICAgIC8vIHByb3RvdHlwaWNhbGx5IGluaGVyaXRlZCBwcm9wZXJ0aWVzIGFyZVxuICAgIC8vIHJldmVhbGVkIGZyb20gdGhlIGJhY2tGaWxsIG1hcFxuICAgIGZvciAobGV0IHByb3AgaW4gc3R5bGVzKSB7XG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29weU9iaihzdHlsZXMsIGRlc3RpbmF0aW9uKTtcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlQXR0cmlidXRlU3RyaW5nKGVsZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgLy8gUmV0dXJuIHRoZSBrZXktdmFsdWUgcGFpciBzdHJpbmcgdG8gYmUgYWRkZWQgdG8gdGhlIHN0eWxlIGF0dHJpYnV0ZSBmb3IgdGhlXG4gIC8vIGdpdmVuIENTUyBzdHlsZSBrZXkuXG4gIGlmICh2YWx1ZSkge1xuICAgIHJldHVybiBrZXkgKyAnOicgKyB2YWx1ZSArICc7JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50OiBhbnkpIHtcbiAgLy8gUmVhZCB0aGUgc3R5bGUgcHJvcGVydHkgb2YgdGhlIGVsZW1lbnQgYW5kIG1hbnVhbGx5IHJlZmxlY3QgaXQgdG8gdGhlXG4gIC8vIHN0eWxlIGF0dHJpYnV0ZS4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBEb21pbm8gb24gcGxhdGZvcm0tc2VydmVyIGRvZXNuJ3RcbiAgLy8gdW5kZXJzdGFuZCB0aGUgZnVsbCBzZXQgb2YgYWxsb3dlZCBDU1MgcHJvcGVydGllcyBhbmQgZG9lc24ndCByZWZsZWN0IHNvbWVcbiAgLy8gb2YgdGhlbSBhdXRvbWF0aWNhbGx5LlxuICBsZXQgc3R5bGVBdHRyVmFsdWUgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50LnN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gZWxlbWVudC5zdHlsZS5pdGVtKGkpO1xuICAgIHN0eWxlQXR0clZhbHVlICs9IGdldFN0eWxlQXR0cmlidXRlU3RyaW5nKGVsZW1lbnQsIGtleSwgZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGtleSkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVsZW1lbnQuc3R5bGUpIHtcbiAgICAvLyBTa2lwIGludGVybmFsIERvbWlubyBwcm9wZXJ0aWVzIHRoYXQgZG9uJ3QgbmVlZCB0byBiZSByZWZsZWN0ZWQuXG4gICAgaWYgKCFlbGVtZW50LnN0eWxlLmhhc093blByb3BlcnR5KGtleSkgfHwga2V5LnN0YXJ0c1dpdGgoJ18nKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGRhc2hLZXkgPSBjYW1lbENhc2VUb0Rhc2hDYXNlKGtleSk7XG4gICAgc3R5bGVBdHRyVmFsdWUgKz0gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudCwgZGFzaEtleSwgZWxlbWVudC5zdHlsZVtrZXldKTtcbiAgfVxuICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBzdHlsZUF0dHJWYWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdHlsZXMoZWxlbWVudDogYW55LCBzdHlsZXM6IMm1U3R5bGVEYXRhKSB7XG4gIGlmIChlbGVtZW50WydzdHlsZSddKSB7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wKTtcbiAgICAgIGVsZW1lbnQuc3R5bGVbY2FtZWxQcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICB9KTtcbiAgICAvLyBPbiB0aGUgc2VydmVyIHNldCB0aGUgJ3N0eWxlJyBhdHRyaWJ1dGUgc2luY2UgaXQncyBub3QgYXV0b21hdGljYWxseSByZWZsZWN0ZWQuXG4gICAgaWYgKGlzTm9kZSgpKSB7XG4gICAgICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJhc2VTdHlsZXMoZWxlbWVudDogYW55LCBzdHlsZXM6IMm1U3R5bGVEYXRhKSB7XG4gIGlmIChlbGVtZW50WydzdHlsZSddKSB7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wKTtcbiAgICAgIGVsZW1lbnQuc3R5bGVbY2FtZWxQcm9wXSA9ICcnO1xuICAgIH0pO1xuICAgIC8vIE9uIHRoZSBzZXJ2ZXIgc2V0IHRoZSAnc3R5bGUnIGF0dHJpYnV0ZSBzaW5jZSBpdCdzIG5vdCBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZC5cbiAgICBpZiAoaXNOb2RlKCkpIHtcbiAgICAgIHdyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBbmltYXRpb25FbnRyeShzdGVwczogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdKTpcbiAgICBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHN0ZXBzKSkge1xuICAgIGlmIChzdGVwcy5sZW5ndGggPT0gMSkgcmV0dXJuIHN0ZXBzWzBdO1xuICAgIHJldHVybiBzZXF1ZW5jZShzdGVwcyk7XG4gIH1cbiAgcmV0dXJuIHN0ZXBzIGFzIEFuaW1hdGlvbk1ldGFkYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVBhcmFtcyhcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLCBlcnJvcnM6IGFueVtdKSB7XG4gIGNvbnN0IHBhcmFtcyA9IG9wdGlvbnMucGFyYW1zIHx8IHt9O1xuICBjb25zdCBtYXRjaGVzID0gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlKTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgbWF0Y2hlcy5mb3JFYWNoKHZhck5hbWUgPT4ge1xuICAgICAgaWYgKCFwYXJhbXMuaGFzT3duUHJvcGVydHkodmFyTmFtZSkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBgVW5hYmxlIHRvIHJlc29sdmUgdGhlIGxvY2FsIGFuaW1hdGlvbiBwYXJhbSAke3Zhck5hbWV9IGluIHRoZSBnaXZlbiBsaXN0IG9mIHZhbHVlc2ApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IFBBUkFNX1JFR0VYID1cbiAgICBuZXcgUmVnRXhwKGAke1NVQlNUSVRVVElPTl9FWFBSX1NUQVJUfVxcXFxzKiguKz8pXFxcXHMqJHtTVUJTVElUVVRJT05fRVhQUl9FTkR9YCwgJ2cnKTtcbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U3R5bGVQYXJhbXModmFsdWU6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZ1tdIHtcbiAgbGV0IHBhcmFtczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCB2YWwgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgbGV0IG1hdGNoOiBhbnk7XG4gICAgd2hpbGUgKG1hdGNoID0gUEFSQU1fUkVHRVguZXhlYyh2YWwpKSB7XG4gICAgICBwYXJhbXMucHVzaChtYXRjaFsxXSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICBQQVJBTV9SRUdFWC5sYXN0SW5kZXggPSAwO1xuICB9XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnBvbGF0ZVBhcmFtcyhcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyLCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBhbnlbXSk6IHN0cmluZ3xudW1iZXIge1xuICBjb25zdCBvcmlnaW5hbCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHN0ciA9IG9yaWdpbmFsLnJlcGxhY2UoUEFSQU1fUkVHRVgsIChfLCB2YXJOYW1lKSA9PiB7XG4gICAgbGV0IGxvY2FsVmFsID0gcGFyYW1zW3Zhck5hbWVdO1xuICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGUgdmFsdWUgd2FzIG5ldmVyIG92ZXJyaWRkZW4gYnkgdGhlIGRhdGEgcGFzc2VkIGluIGJ5IHRoZSB1c2VyXG4gICAgaWYgKCFwYXJhbXMuaGFzT3duUHJvcGVydHkodmFyTmFtZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBQbGVhc2UgcHJvdmlkZSBhIHZhbHVlIGZvciB0aGUgYW5pbWF0aW9uIHBhcmFtICR7dmFyTmFtZX1gKTtcbiAgICAgIGxvY2FsVmFsID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBsb2NhbFZhbC50b1N0cmluZygpO1xuICB9KTtcblxuICAvLyB3ZSBkbyB0aGlzIHRvIGFzc2VydCB0aGF0IG51bWVyaWMgdmFsdWVzIHN0YXkgYXMgdGhleSBhcmVcbiAgcmV0dXJuIHN0ciA9PSBvcmlnaW5hbCA/IHZhbHVlIDogc3RyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXRlcmF0b3JUb0FycmF5KGl0ZXJhdG9yOiBhbnkpOiBhbnlbXSB7XG4gIGNvbnN0IGFycjogYW55W10gPSBbXTtcbiAgbGV0IGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIHdoaWxlICghaXRlbS5kb25lKSB7XG4gICAgYXJyLnB1c2goaXRlbS52YWx1ZSk7XG4gICAgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VBbmltYXRpb25PcHRpb25zKFxuICAgIHNvdXJjZTogQW5pbWF0aW9uT3B0aW9ucywgZGVzdGluYXRpb246IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb25PcHRpb25zIHtcbiAgaWYgKHNvdXJjZS5wYXJhbXMpIHtcbiAgICBjb25zdCBwMCA9IHNvdXJjZS5wYXJhbXM7XG4gICAgaWYgKCFkZXN0aW5hdGlvbi5wYXJhbXMpIHtcbiAgICAgIGRlc3RpbmF0aW9uLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgICBjb25zdCBwMSA9IGRlc3RpbmF0aW9uLnBhcmFtcztcbiAgICBPYmplY3Qua2V5cyhwMCkuZm9yRWFjaChwYXJhbSA9PiB7XG4gICAgICBpZiAoIXAxLmhhc093blByb3BlcnR5KHBhcmFtKSkge1xuICAgICAgICBwMVtwYXJhbV0gPSBwMFtwYXJhbV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG5jb25zdCBEQVNIX0NBU0VfUkVHRVhQID0gLy0rKFthLXowLTldKS9nO1xuZXhwb3J0IGZ1bmN0aW9uIGRhc2hDYXNlVG9DYW1lbENhc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKERBU0hfQ0FTRV9SRUdFWFAsICguLi5tOiBhbnlbXSkgPT4gbVsxXS50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9EYXNoQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcikge1xuICByZXR1cm4gZHVyYXRpb24gPT09IDAgfHwgZGVsYXkgPT09IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKFxuICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogYW55fVtdLCBwcmV2aW91c1N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgY29uc3QgcHJldmlvdXNTdHlsZVByb3BzID0gT2JqZWN0LmtleXMocHJldmlvdXNTdHlsZXMpO1xuICBpZiAocHJldmlvdXNTdHlsZVByb3BzLmxlbmd0aCAmJiBrZXlmcmFtZXMubGVuZ3RoKSB7XG4gICAgbGV0IHN0YXJ0aW5nS2V5ZnJhbWUgPSBrZXlmcmFtZXNbMF07XG4gICAgbGV0IG1pc3NpbmdTdHlsZVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByZXZpb3VzU3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgaWYgKCFzdGFydGluZ0tleWZyYW1lLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIG1pc3NpbmdTdHlsZVByb3BzLnB1c2gocHJvcCk7XG4gICAgICB9XG4gICAgICBzdGFydGluZ0tleWZyYW1lW3Byb3BdID0gcHJldmlvdXNTdHlsZXNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBpZiAobWlzc2luZ1N0eWxlUHJvcHMubGVuZ3RoKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwga2V5ZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGtleWZyYW1lc1tpXTtcbiAgICAgICAgbWlzc2luZ1N0eWxlUHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7IGtmW3Byb3BdID0gY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3ApOyB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Ec2xWaXNpdG9yLCBub2RlOiBBbmltYXRpb25NZXRhZGF0YSwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Bc3RWaXNpdG9yLCBub2RlOiBBbmltYXRpb25Bc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZSh2aXNpdG9yOiBhbnksIG5vZGU6IGFueSwgY29udGV4dDogYW55KTogYW55IHtcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmlnZ2VyKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdGF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmFuc2l0aW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTZXF1ZW5jZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cDpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0R3JvdXAobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXM6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWZyYW1lcyhub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3R5bGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuUmVmZXJlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlQ2hpbGQobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZVJlZjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZVJlZihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UXVlcnkobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlcjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3RhZ2dlcihub2RlLCBjb250ZXh0KTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcmVzb2x2ZSBhbmltYXRpb24gbWV0YWRhdGEgbm9kZSAjJHtub2RlLnR5cGV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAoPGFueT53aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSlbcHJvcF07XG59XG4iXX0=