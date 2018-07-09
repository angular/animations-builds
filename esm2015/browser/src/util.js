/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { sequence } from '@angular/animations';
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
 * @param {?} styles
 * @return {?}
 */
export function setStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = styles[prop];
        });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUE2RSxRQUFRLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUlySSxNQUFNLENBQUMsdUJBQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUUvQixNQUFNLENBQUMsdUJBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQzVDLE1BQU0sQ0FBQyx1QkFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDMUMsTUFBTSxDQUFDLHVCQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQztBQUNqRCxNQUFNLENBQUMsdUJBQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDO0FBQ2pELE1BQU0sQ0FBQyx1QkFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUM7QUFDckQsTUFBTSxDQUFDLHVCQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7QUFFckQsTUFBTSw2QkFBNkIsS0FBc0I7SUFDdkQsSUFBSSxPQUFPLEtBQUssSUFBSSxRQUFRO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFM0MsdUJBQU0sT0FBTyxHQUFHLG1CQUFDLEtBQWUsRUFBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFFN0MsT0FBTyxxQkFB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QUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QztZQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzlFO0NBQ0Y7Ozs7OztBQUVELE1BQU0sdUJBQXVCLE9BQVksRUFBRSxJQUFZO0lBQ3JELE9BQU8sbUJBQU0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGVUaW1pbmdzLCBBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBzZXF1ZW5jZSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBc3QgYXMgQW5pbWF0aW9uQXN0LCBBc3RWaXNpdG9yIGFzIEFuaW1hdGlvbkFzdFZpc2l0b3J9IGZyb20gJy4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25Ec2xWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fZHNsX3Zpc2l0b3InO1xuXG5leHBvcnQgY29uc3QgT05FX1NFQ09ORCA9IDEwMDA7XG5cbmV4cG9ydCBjb25zdCBTVUJTVElUVVRJT05fRVhQUl9TVEFSVCA9ICd7eyc7XG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfRU5EID0gJ319JztcbmV4cG9ydCBjb25zdCBFTlRFUl9DTEFTU05BTUUgPSAnbmctZW50ZXInO1xuZXhwb3J0IGNvbnN0IExFQVZFX0NMQVNTTkFNRSA9ICduZy1sZWF2ZSc7XG5leHBvcnQgY29uc3QgRU5URVJfU0VMRUNUT1IgPSAnLm5nLWVudGVyJztcbmV4cG9ydCBjb25zdCBMRUFWRV9TRUxFQ1RPUiA9ICcubmctbGVhdmUnO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfQ0xBU1NOQU1FID0gJ25nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfU0VMRUNUT1IgPSAnLm5nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX0FOSU1BVElOR19DTEFTU05BTUUgPSAnbmctYW5pbWF0aW5nJztcbmV4cG9ydCBjb25zdCBOR19BTklNQVRJTkdfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGluZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGltaW5nVmFsdWUodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSByZXR1cm4gdmFsdWU7XG5cbiAgY29uc3QgbWF0Y2hlcyA9ICh2YWx1ZSBhcyBzdHJpbmcpLm1hdGNoKC9eKC0/W1xcLlxcZF0rKShtP3MpLyk7XG4gIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8IDIpIHJldHVybiAwO1xuXG4gIHJldHVybiBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0VGltZVZhbHVlVG9NUyh2YWx1ZTogbnVtYmVyLCB1bml0OiBzdHJpbmcpOiBudW1iZXIge1xuICBzd2l0Y2ggKHVuaXQpIHtcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiB2YWx1ZSAqIE9ORV9TRUNPTkQ7XG4gICAgZGVmYXVsdDogIC8vIG1zIG9yIHNvbWV0aGluZyBlbHNlXG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUaW1pbmcoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyIHwgQW5pbWF0ZVRpbWluZ3MsIGVycm9yczogYW55W10sIGFsbG93TmVnYXRpdmVWYWx1ZXM/OiBib29sZWFuKSB7XG4gIHJldHVybiB0aW1pbmdzLmhhc093blByb3BlcnR5KCdkdXJhdGlvbicpID9cbiAgICAgIDxBbmltYXRlVGltaW5ncz50aW1pbmdzIDpcbiAgICAgIHBhcnNlVGltZUV4cHJlc3Npb24oPHN0cmluZ3xudW1iZXI+dGltaW5ncywgZXJyb3JzLCBhbGxvd05lZ2F0aXZlVmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUaW1lRXhwcmVzc2lvbihcbiAgICBleHA6IHN0cmluZyB8IG51bWJlciwgZXJyb3JzOiBzdHJpbmdbXSwgYWxsb3dOZWdhdGl2ZVZhbHVlcz86IGJvb2xlYW4pOiBBbmltYXRlVGltaW5ncyB7XG4gIGNvbnN0IHJlZ2V4ID0gL14oLT9bXFwuXFxkXSspKG0/cykoPzpcXHMrKC0/W1xcLlxcZF0rKShtP3MpKT8oPzpcXHMrKFstYS16XSsoPzpcXCguKz9cXCkpPykpPyQvaTtcbiAgbGV0IGR1cmF0aW9uOiBudW1iZXI7XG4gIGxldCBkZWxheTogbnVtYmVyID0gMDtcbiAgbGV0IGVhc2luZzogc3RyaW5nID0gJyc7XG4gIGlmICh0eXBlb2YgZXhwID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBleHAubWF0Y2gocmVnZXgpO1xuICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIHByb3ZpZGVkIHRpbWluZyB2YWx1ZSBcIiR7ZXhwfVwiIGlzIGludmFsaWQuYCk7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiAwLCBkZWxheTogMCwgZWFzaW5nOiAnJ307XG4gICAgfVxuXG4gICAgZHVyYXRpb24gPSBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG5cbiAgICBjb25zdCBkZWxheU1hdGNoID0gbWF0Y2hlc1szXTtcbiAgICBpZiAoZGVsYXlNYXRjaCAhPSBudWxsKSB7XG4gICAgICBkZWxheSA9IF9jb252ZXJ0VGltZVZhbHVlVG9NUyhNYXRoLmZsb29yKHBhcnNlRmxvYXQoZGVsYXlNYXRjaCkpLCBtYXRjaGVzWzRdKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmdWYWwgPSBtYXRjaGVzWzVdO1xuICAgIGlmIChlYXNpbmdWYWwpIHtcbiAgICAgIGVhc2luZyA9IGVhc2luZ1ZhbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZHVyYXRpb24gPSA8bnVtYmVyPmV4cDtcbiAgfVxuXG4gIGlmICghYWxsb3dOZWdhdGl2ZVZhbHVlcykge1xuICAgIGxldCBjb250YWluc0Vycm9ycyA9IGZhbHNlO1xuICAgIGxldCBzdGFydEluZGV4ID0gZXJyb3JzLmxlbmd0aDtcbiAgICBpZiAoZHVyYXRpb24gPCAwKSB7XG4gICAgICBlcnJvcnMucHVzaChgRHVyYXRpb24gdmFsdWVzIGJlbG93IDAgYXJlIG5vdCBhbGxvd2VkIGZvciB0aGlzIGFuaW1hdGlvbiBzdGVwLmApO1xuICAgICAgY29udGFpbnNFcnJvcnMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZGVsYXkgPCAwKSB7XG4gICAgICBlcnJvcnMucHVzaChgRGVsYXkgdmFsdWVzIGJlbG93IDAgYXJlIG5vdCBhbGxvd2VkIGZvciB0aGlzIGFuaW1hdGlvbiBzdGVwLmApO1xuICAgICAgY29udGFpbnNFcnJvcnMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNFcnJvcnMpIHtcbiAgICAgIGVycm9ycy5zcGxpY2Uoc3RhcnRJbmRleCwgMCwgYFRoZSBwcm92aWRlZCB0aW1pbmcgdmFsdWUgXCIke2V4cH1cIiBpcyBpbnZhbGlkLmApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7ZHVyYXRpb24sIGRlbGF5LCBlYXNpbmd9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weU9iaihcbiAgICBvYmo6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBkZXN0aW5hdGlvbjoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKHByb3AgPT4geyBkZXN0aW5hdGlvbltwcm9wXSA9IG9ialtwcm9wXTsgfSk7XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlcyhzdHlsZXM6IMm1U3R5bGVEYXRhIHwgybVTdHlsZURhdGFbXSk6IMm1U3R5bGVEYXRhIHtcbiAgY29uc3Qgbm9ybWFsaXplZFN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R5bGVzKSkge1xuICAgIHN0eWxlcy5mb3JFYWNoKGRhdGEgPT4gY29weVN0eWxlcyhkYXRhLCBmYWxzZSwgbm9ybWFsaXplZFN0eWxlcykpO1xuICB9IGVsc2Uge1xuICAgIGNvcHlTdHlsZXMoc3R5bGVzLCBmYWxzZSwgbm9ybWFsaXplZFN0eWxlcyk7XG4gIH1cbiAgcmV0dXJuIG5vcm1hbGl6ZWRTdHlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5U3R5bGVzKFxuICAgIHN0eWxlczogybVTdHlsZURhdGEsIHJlYWRQcm90b3R5cGU6IGJvb2xlYW4sIGRlc3RpbmF0aW9uOiDJtVN0eWxlRGF0YSA9IHt9KTogybVTdHlsZURhdGEge1xuICBpZiAocmVhZFByb3RvdHlwZSkge1xuICAgIC8vIHdlIG1ha2UgdXNlIG9mIGEgZm9yLWluIGxvb3Agc28gdGhhdCB0aGVcbiAgICAvLyBwcm90b3R5cGljYWxseSBpbmhlcml0ZWQgcHJvcGVydGllcyBhcmVcbiAgICAvLyByZXZlYWxlZCBmcm9tIHRoZSBiYWNrRmlsbCBtYXBcbiAgICBmb3IgKGxldCBwcm9wIGluIHN0eWxlcykge1xuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvcHlPYmooc3R5bGVzLCBkZXN0aW5hdGlvbik7XG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U3R5bGVzKGVsZW1lbnQ6IGFueSwgc3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBpZiAoZWxlbWVudFsnc3R5bGUnXSkge1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVyYXNlU3R5bGVzKGVsZW1lbnQ6IGFueSwgc3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBpZiAoZWxlbWVudFsnc3R5bGUnXSkge1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSAnJztcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uRW50cnkoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6XG4gICAgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdGVwcykpIHtcbiAgICBpZiAoc3RlcHMubGVuZ3RoID09IDEpIHJldHVybiBzdGVwc1swXTtcbiAgICByZXR1cm4gc2VxdWVuY2Uoc3RlcHMpO1xuICB9XG4gIHJldHVybiBzdGVwcyBhcyBBbmltYXRpb25NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQYXJhbXMoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgZXJyb3JzOiBhbnlbXSkge1xuICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLnBhcmFtcyB8fCB7fTtcbiAgY29uc3QgbWF0Y2hlcyA9IGV4dHJhY3RTdHlsZVBhcmFtcyh2YWx1ZSk7XG4gIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuICAgIG1hdGNoZXMuZm9yRWFjaCh2YXJOYW1lID0+IHtcbiAgICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHZhck5hbWUpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgYFVuYWJsZSB0byByZXNvbHZlIHRoZSBsb2NhbCBhbmltYXRpb24gcGFyYW0gJHt2YXJOYW1lfSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiB2YWx1ZXNgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQQVJBTV9SRUdFWCA9XG4gICAgbmV3IFJlZ0V4cChgJHtTVUJTVElUVVRJT05fRVhQUl9TVEFSVH1cXFxccyooLis/KVxcXFxzKiR7U1VCU1RJVFVUSU9OX0VYUFJfRU5EfWAsICdnJyk7XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmdbXSB7XG4gIGxldCBwYXJhbXM6IHN0cmluZ1tdID0gW107XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgdmFsID0gdmFsdWUudG9TdHJpbmcoKTtcblxuICAgIGxldCBtYXRjaDogYW55O1xuICAgIHdoaWxlIChtYXRjaCA9IFBBUkFNX1JFR0VYLmV4ZWModmFsKSkge1xuICAgICAgcGFyYW1zLnB1c2gobWF0Y2hbMV0gYXMgc3RyaW5nKTtcbiAgICB9XG4gICAgUEFSQU1fUkVHRVgubGFzdEluZGV4ID0gMDtcbiAgfVxuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJwb2xhdGVQYXJhbXMoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciwgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0sIGVycm9yczogYW55W10pOiBzdHJpbmd8bnVtYmVyIHtcbiAgY29uc3Qgb3JpZ2luYWwgPSB2YWx1ZS50b1N0cmluZygpO1xuICBjb25zdCBzdHIgPSBvcmlnaW5hbC5yZXBsYWNlKFBBUkFNX1JFR0VYLCAoXywgdmFyTmFtZSkgPT4ge1xuICAgIGxldCBsb2NhbFZhbCA9IHBhcmFtc1t2YXJOYW1lXTtcbiAgICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhlIHZhbHVlIHdhcyBuZXZlciBvdmVycmlkZGVuIGJ5IHRoZSBkYXRhIHBhc3NlZCBpbiBieSB0aGUgdXNlclxuICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHZhck5hbWUpKSB7XG4gICAgICBlcnJvcnMucHVzaChgUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIGFuaW1hdGlvbiBwYXJhbSAke3Zhck5hbWV9YCk7XG4gICAgICBsb2NhbFZhbCA9ICcnO1xuICAgIH1cbiAgICByZXR1cm4gbG9jYWxWYWwudG9TdHJpbmcoKTtcbiAgfSk7XG5cbiAgLy8gd2UgZG8gdGhpcyB0byBhc3NlcnQgdGhhdCBudW1lcmljIHZhbHVlcyBzdGF5IGFzIHRoZXkgYXJlXG4gIHJldHVybiBzdHIgPT0gb3JpZ2luYWwgPyB2YWx1ZSA6IHN0cjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhdG9yVG9BcnJheShpdGVyYXRvcjogYW55KTogYW55W10ge1xuICBjb25zdCBhcnI6IGFueVtdID0gW107XG4gIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICB3aGlsZSAoIWl0ZW0uZG9uZSkge1xuICAgIGFyci5wdXNoKGl0ZW0udmFsdWUpO1xuICAgIGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQW5pbWF0aW9uT3B0aW9ucyhcbiAgICBzb3VyY2U6IEFuaW1hdGlvbk9wdGlvbnMsIGRlc3RpbmF0aW9uOiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uT3B0aW9ucyB7XG4gIGlmIChzb3VyY2UucGFyYW1zKSB7XG4gICAgY29uc3QgcDAgPSBzb3VyY2UucGFyYW1zO1xuICAgIGlmICghZGVzdGluYXRpb24ucGFyYW1zKSB7XG4gICAgICBkZXN0aW5hdGlvbi5wYXJhbXMgPSB7fTtcbiAgICB9XG4gICAgY29uc3QgcDEgPSBkZXN0aW5hdGlvbi5wYXJhbXM7XG4gICAgT2JqZWN0LmtleXMocDApLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgaWYgKCFwMS5oYXNPd25Qcm9wZXJ0eShwYXJhbSkpIHtcbiAgICAgICAgcDFbcGFyYW1dID0gcDBbcGFyYW1dO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuY29uc3QgREFTSF9DQVNFX1JFR0VYUCA9IC8tKyhbYS16MC05XSkvZztcbmV4cG9ydCBmdW5jdGlvbiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZShEQVNIX0NBU0VfUkVHRVhQLCAoLi4ubTogYW55W10pID0+IG1bMV0udG9VcHBlckNhc2UoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcikge1xuICByZXR1cm4gZHVyYXRpb24gPT09IDAgfHwgZGVsYXkgPT09IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKFxuICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogYW55fVtdLCBwcmV2aW91c1N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgY29uc3QgcHJldmlvdXNTdHlsZVByb3BzID0gT2JqZWN0LmtleXMocHJldmlvdXNTdHlsZXMpO1xuICBpZiAocHJldmlvdXNTdHlsZVByb3BzLmxlbmd0aCAmJiBrZXlmcmFtZXMubGVuZ3RoKSB7XG4gICAgbGV0IHN0YXJ0aW5nS2V5ZnJhbWUgPSBrZXlmcmFtZXNbMF07XG4gICAgbGV0IG1pc3NpbmdTdHlsZVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByZXZpb3VzU3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgaWYgKCFzdGFydGluZ0tleWZyYW1lLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIG1pc3NpbmdTdHlsZVByb3BzLnB1c2gocHJvcCk7XG4gICAgICB9XG4gICAgICBzdGFydGluZ0tleWZyYW1lW3Byb3BdID0gcHJldmlvdXNTdHlsZXNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBpZiAobWlzc2luZ1N0eWxlUHJvcHMubGVuZ3RoKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwga2V5ZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGtleWZyYW1lc1tpXTtcbiAgICAgICAgbWlzc2luZ1N0eWxlUHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7IGtmW3Byb3BdID0gY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3ApOyB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Ec2xWaXNpdG9yLCBub2RlOiBBbmltYXRpb25NZXRhZGF0YSwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Bc3RWaXNpdG9yLCBub2RlOiBBbmltYXRpb25Bc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZSh2aXNpdG9yOiBhbnksIG5vZGU6IGFueSwgY29udGV4dDogYW55KTogYW55IHtcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmlnZ2VyKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdGF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmFuc2l0aW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTZXF1ZW5jZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cDpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0R3JvdXAobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXM6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWZyYW1lcyhub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3R5bGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuUmVmZXJlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlQ2hpbGQobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZVJlZjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZVJlZihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UXVlcnkobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlcjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3RhZ2dlcihub2RlLCBjb250ZXh0KTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcmVzb2x2ZSBhbmltYXRpb24gbWV0YWRhdGEgbm9kZSAjJHtub2RlLnR5cGV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAoPGFueT53aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSlbcHJvcF07XG59XG4iXX0=