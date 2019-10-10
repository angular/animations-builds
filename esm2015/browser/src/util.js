/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { sequence } from '@angular/animations';
import { isNode } from './render/shared';
/** @type {?} */
export const ONE_SECOND = 1000;
/** @type {?} */
export const SUBSTITUTION_EXPR_START = '{{';
/** @type {?} */
export const SUBSTITUTION_EXPR_END = '}}';
/** @type {?} */
export const ENTER_CLASSNAME = 'ng-enter';
/** @type {?} */
export const LEAVE_CLASSNAME = 'ng-leave';
/** @type {?} */
export const ENTER_SELECTOR = '.ng-enter';
/** @type {?} */
export const LEAVE_SELECTOR = '.ng-leave';
/** @type {?} */
export const NG_TRIGGER_CLASSNAME = 'ng-trigger';
/** @type {?} */
export const NG_TRIGGER_SELECTOR = '.ng-trigger';
/** @type {?} */
export const NG_ANIMATING_CLASSNAME = 'ng-animating';
/** @type {?} */
export const NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} value
 * @return {?}
 */
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    /** @type {?} */
    const matches = value.match(/^(-?[\.\d]+)(m?s)/);
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
    return timings.hasOwnProperty('duration') ?
        (/** @type {?} */ (timings)) :
        parseTimeExpression((/** @type {?} */ (timings)), errors, allowNegativeValues);
}
/**
 * @param {?} exp
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function parseTimeExpression(exp, errors, allowNegativeValues) {
    /** @type {?} */
    const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    /** @type {?} */
    let duration;
    /** @type {?} */
    let delay = 0;
    /** @type {?} */
    let easing = '';
    if (typeof exp === 'string') {
        /** @type {?} */
        const matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        /** @type {?} */
        const delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
        }
        /** @type {?} */
        const easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = exp;
    }
    if (!allowNegativeValues) {
        /** @type {?} */
        let containsErrors = false;
        /** @type {?} */
        let startIndex = errors.length;
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
    Object.keys(obj).forEach((/**
     * @param {?} prop
     * @return {?}
     */
    prop => { destination[prop] = obj[prop]; }));
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    /** @type {?} */
    const normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach((/**
         * @param {?} data
         * @return {?}
         */
        data => copyStyles(data, false, normalizedStyles)));
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
        for (let prop in styles) {
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
    /** @type {?} */
    let styleAttrValue = '';
    for (let i = 0; i < element.style.length; i++) {
        /** @type {?} */
        const key = element.style.item(i);
        styleAttrValue += getStyleAttributeString(element, key, element.style.getPropertyValue(key));
    }
    for (const key in element.style) {
        // Skip internal Domino properties that don't need to be reflected.
        if (!element.style.hasOwnProperty(key) || key.startsWith('_')) {
            continue;
        }
        /** @type {?} */
        const dashKey = camelCaseToDashCase(key);
        styleAttrValue += getStyleAttributeString(element, dashKey, element.style[key]);
    }
    element.setAttribute('style', styleAttrValue);
}
/**
 * @param {?} element
 * @param {?} styles
 * @param {?=} formerStyles
 * @return {?}
 */
export function setStyles(element, styles, formerStyles) {
    if (element['style']) {
        Object.keys(styles).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            /** @type {?} */
            const camelProp = dashCaseToCamelCase(prop);
            if (formerStyles && !formerStyles.hasOwnProperty(prop)) {
                formerStyles[prop] = element.style[camelProp];
            }
            element.style[camelProp] = styles[prop];
        }));
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
        Object.keys(styles).forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            /** @type {?} */
            const camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = '';
        }));
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
    return (/** @type {?} */ (steps));
}
/**
 * @param {?} value
 * @param {?} options
 * @param {?} errors
 * @return {?}
 */
export function validateStyleParams(value, options, errors) {
    /** @type {?} */
    const params = options.params || {};
    /** @type {?} */
    const matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach((/**
         * @param {?} varName
         * @return {?}
         */
        varName => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(`Unable to resolve the local animation param ${varName} in the given list of values`);
            }
        }));
    }
}
/** @type {?} */
const PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
/**
 * @param {?} value
 * @return {?}
 */
export function extractStyleParams(value) {
    /** @type {?} */
    let params = [];
    if (typeof value === 'string') {
        /** @type {?} */
        let match;
        while (match = PARAM_REGEX.exec(value)) {
            params.push((/** @type {?} */ (match[1])));
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
    /** @type {?} */
    const original = value.toString();
    /** @type {?} */
    const str = original.replace(PARAM_REGEX, (/**
     * @param {?} _
     * @param {?} varName
     * @return {?}
     */
    (_, varName) => {
        /** @type {?} */
        let localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push(`Please provide a value for the animation param ${varName}`);
            localVal = '';
        }
        return localVal.toString();
    }));
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
/**
 * @param {?} iterator
 * @return {?}
 */
export function iteratorToArray(iterator) {
    /** @type {?} */
    const arr = [];
    /** @type {?} */
    let item = iterator.next();
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
        /** @type {?} */
        const p0 = source.params;
        if (!destination.params) {
            destination.params = {};
        }
        /** @type {?} */
        const p1 = destination.params;
        Object.keys(p0).forEach((/**
         * @param {?} param
         * @return {?}
         */
        param => {
            if (!p1.hasOwnProperty(param)) {
                p1[param] = p0[param];
            }
        }));
    }
    return destination;
}
/** @type {?} */
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (/**
     * @param {...?} m
     * @return {?}
     */
    (...m) => m[1].toUpperCase()));
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
    /** @type {?} */
    const previousStyleProps = Object.keys(previousStyles);
    if (previousStyleProps.length && keyframes.length) {
        /** @type {?} */
        let startingKeyframe = keyframes[0];
        /** @type {?} */
        let missingStyleProps = [];
        previousStyleProps.forEach((/**
         * @param {?} prop
         * @return {?}
         */
        prop => {
            if (!startingKeyframe.hasOwnProperty(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe[prop] = previousStyles[prop];
        }));
        if (missingStyleProps.length) {
            // tslint:disable-next-line
            for (var i = 1; i < keyframes.length; i++) {
                /** @type {?} */
                let kf = keyframes[i];
                missingStyleProps.forEach((/**
                 * @param {?} prop
                 * @return {?}
                 */
                function (prop) { kf[prop] = computeStyle(element, prop); }));
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
    return ((/** @type {?} */ (window.getComputedStyle(element))))[prop];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBNkUsUUFBUSxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFHckksT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUV2QyxNQUFNLE9BQU8sVUFBVSxHQUFHLElBQUk7O0FBRTlCLE1BQU0sT0FBTyx1QkFBdUIsR0FBRyxJQUFJOztBQUMzQyxNQUFNLE9BQU8scUJBQXFCLEdBQUcsSUFBSTs7QUFDekMsTUFBTSxPQUFPLGVBQWUsR0FBRyxVQUFVOztBQUN6QyxNQUFNLE9BQU8sZUFBZSxHQUFHLFVBQVU7O0FBQ3pDLE1BQU0sT0FBTyxjQUFjLEdBQUcsV0FBVzs7QUFDekMsTUFBTSxPQUFPLGNBQWMsR0FBRyxXQUFXOztBQUN6QyxNQUFNLE9BQU8sb0JBQW9CLEdBQUcsWUFBWTs7QUFDaEQsTUFBTSxPQUFPLG1CQUFtQixHQUFHLGFBQWE7O0FBQ2hELE1BQU0sT0FBTyxzQkFBc0IsR0FBRyxjQUFjOztBQUNwRCxNQUFNLE9BQU8scUJBQXFCLEdBQUcsZUFBZTs7Ozs7QUFFcEQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEtBQXNCO0lBQ3ZELElBQUksT0FBTyxLQUFLLElBQUksUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDOztVQUVyQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztJQUNoRCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTdDLE9BQU8scUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25FLENBQUM7Ozs7OztBQUVELFNBQVMscUJBQXFCLENBQUMsS0FBYSxFQUFFLElBQVk7SUFDeEQsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLEdBQUc7WUFDTixPQUFPLEtBQUssR0FBRyxVQUFVLENBQUM7UUFDNUIsU0FBVSx1QkFBdUI7WUFDL0IsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDSCxDQUFDOzs7Ozs7O0FBRUQsTUFBTSxVQUFVLGFBQWEsQ0FDekIsT0FBeUMsRUFBRSxNQUFhLEVBQUUsbUJBQTZCO0lBQ3pGLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLG1CQUFnQixPQUFPLEVBQUEsQ0FBQyxDQUFDO1FBQ3pCLG1CQUFtQixDQUFDLG1CQUFlLE9BQU8sRUFBQSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9FLENBQUM7Ozs7Ozs7QUFFRCxTQUFTLG1CQUFtQixDQUN4QixHQUFvQixFQUFFLE1BQWdCLEVBQUUsbUJBQTZCOztVQUNqRSxLQUFLLEdBQUcsMEVBQTBFOztRQUNwRixRQUFnQjs7UUFDaEIsS0FBSyxHQUFXLENBQUM7O1FBQ2pCLE1BQU0sR0FBVyxFQUFFO0lBQ3ZCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFOztjQUNyQixPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEdBQUcsZUFBZSxDQUFDLENBQUM7WUFDOUQsT0FBTyxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDLENBQUM7U0FDNUM7UUFFRCxRQUFRLEdBQUcscUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztjQUUvRCxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7WUFDdEIsS0FBSyxHQUFHLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRTs7Y0FFSyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLFNBQVMsRUFBRTtZQUNiLE1BQU0sR0FBRyxTQUFTLENBQUM7U0FDcEI7S0FDRjtTQUFNO1FBQ0wsUUFBUSxHQUFHLEdBQUcsQ0FBQztLQUNoQjtJQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7WUFDcEIsY0FBYyxHQUFHLEtBQUs7O1lBQ3RCLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTTtRQUM5QixJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1lBQ2hGLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDdkI7UUFDRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLCtEQUErRCxDQUFDLENBQUM7WUFDN0UsY0FBYyxHQUFHLElBQUksQ0FBQztTQUN2QjtRQUNELElBQUksY0FBYyxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSw4QkFBOEIsR0FBRyxlQUFlLENBQUMsQ0FBQztTQUNoRjtLQUNGO0lBRUQsT0FBTyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7QUFDbkMsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLE9BQU8sQ0FDbkIsR0FBeUIsRUFBRSxjQUFvQyxFQUFFO0lBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTzs7OztJQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO0lBQ3JFLE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxNQUFpQzs7VUFDekQsZ0JBQWdCLEdBQWUsRUFBRTtJQUN2QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDekIsTUFBTSxDQUFDLE9BQU87Ozs7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEVBQUMsQ0FBQztLQUNuRTtTQUFNO1FBQ0wsVUFBVSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QztJQUNELE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSxVQUFVLENBQ3RCLE1BQWtCLEVBQUUsYUFBc0IsRUFBRSxjQUEwQixFQUFFO0lBQzFFLElBQUksYUFBYSxFQUFFO1FBQ2pCLDJDQUEyQztRQUMzQywwQ0FBMEM7UUFDMUMsaUNBQWlDO1FBQ2pDLEtBQUssSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFO1lBQ3ZCLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEM7S0FDRjtTQUFNO1FBQ0wsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztLQUM5QjtJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7Ozs7Ozs7QUFFRCxTQUFTLHVCQUF1QixDQUFDLE9BQVksRUFBRSxHQUFXLEVBQUUsS0FBYTtJQUN2RSw4RUFBOEU7SUFDOUUsdUJBQXVCO0lBQ3ZCLElBQUksS0FBSyxFQUFFO1FBQ1QsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7S0FDaEM7U0FBTTtRQUNMLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDOzs7OztBQUVELFNBQVMsbUJBQW1CLENBQUMsT0FBWTs7Ozs7O1FBS25DLGNBQWMsR0FBRyxFQUFFO0lBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Y0FDdkMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqQyxjQUFjLElBQUksdUJBQXVCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDOUY7SUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDL0IsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzdELFNBQVM7U0FDVjs7Y0FDSyxPQUFPLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDO1FBQ3hDLGNBQWMsSUFBSSx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNqRjtJQUNELE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLE9BQVksRUFBRSxNQUFrQixFQUFFLFlBQW1DO0lBQzdGLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTzs7OztRQUFDLElBQUksQ0FBQyxFQUFFOztrQkFDM0IsU0FBUyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQztZQUMzQyxJQUFJLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxFQUFDLENBQUM7UUFDSCxrRkFBa0Y7UUFDbEYsSUFBSSxNQUFNLEVBQUUsRUFBRTtZQUNaLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlCO0tBQ0Y7QUFDSCxDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLE9BQVksRUFBRSxNQUFrQjtJQUMxRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU87Ozs7UUFBQyxJQUFJLENBQUMsRUFBRTs7a0JBQzNCLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEMsQ0FBQyxFQUFDLENBQUM7UUFDSCxrRkFBa0Y7UUFDbEYsSUFBSSxNQUFNLEVBQUUsRUFBRTtZQUNaLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlCO0tBQ0Y7QUFDSCxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxLQUE4QztJQUVwRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDeEIsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4QjtJQUNELE9BQU8sbUJBQUEsS0FBSyxFQUFxQixDQUFDO0FBQ3BDLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsbUJBQW1CLENBQy9CLEtBQXNCLEVBQUUsT0FBeUIsRUFBRSxNQUFhOztVQUM1RCxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFOztVQUM3QixPQUFPLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO0lBQ3pDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNsQixPQUFPLENBQUMsT0FBTzs7OztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUNQLCtDQUErQyxPQUFPLDhCQUE4QixDQUFDLENBQUM7YUFDM0Y7UUFDSCxDQUFDLEVBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQzs7TUFFSyxXQUFXLEdBQ2IsSUFBSSxNQUFNLENBQUMsR0FBRyx1QkFBdUIsZ0JBQWdCLHFCQUFxQixFQUFFLEVBQUUsR0FBRyxDQUFDOzs7OztBQUN0RixNQUFNLFVBQVUsa0JBQWtCLENBQUMsS0FBc0I7O1FBQ25ELE1BQU0sR0FBYSxFQUFFO0lBQ3pCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFOztZQUN6QixLQUFVO1FBQ2QsT0FBTyxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBVSxDQUFDLENBQUM7U0FDakM7UUFDRCxXQUFXLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztLQUMzQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQzdCLEtBQXNCLEVBQUUsTUFBNkIsRUFBRSxNQUFhOztVQUNoRSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTs7VUFDM0IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVzs7Ozs7SUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTs7WUFDbkQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsbUZBQW1GO1FBQ25GLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0RBQWtELE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDekUsUUFBUSxHQUFHLEVBQUUsQ0FBQztTQUNmO1FBQ0QsT0FBTyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQyxFQUFDO0lBRUYsNERBQTREO0lBQzVELE9BQU8sR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDdkMsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLFFBQWE7O1VBQ3JDLEdBQUcsR0FBVSxFQUFFOztRQUNqQixJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRTtJQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUscUJBQXFCLENBQ2pDLE1BQXdCLEVBQUUsV0FBNkI7SUFDekQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFOztjQUNYLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTTtRQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUN2QixXQUFXLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztTQUN6Qjs7Y0FDSyxFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU07UUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPOzs7O1FBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7UUFDSCxDQUFDLEVBQUMsQ0FBQztLQUNKO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQzs7TUFFSyxnQkFBZ0IsR0FBRyxlQUFlOzs7OztBQUN4QyxNQUFNLFVBQVUsbUJBQW1CLENBQUMsS0FBYTtJQUMvQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCOzs7O0lBQUUsQ0FBQyxHQUFHLENBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFDLENBQUM7QUFDOUUsQ0FBQzs7Ozs7QUFFRCxTQUFTLG1CQUFtQixDQUFDLEtBQWE7SUFDeEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pFLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSw4QkFBOEIsQ0FBQyxRQUFnQixFQUFFLEtBQWE7SUFDNUUsT0FBTyxRQUFRLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDdkMsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSxrQ0FBa0MsQ0FDOUMsT0FBWSxFQUFFLFNBQWlDLEVBQUUsY0FBb0M7O1VBQ2pGLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQ3RELElBQUksa0JBQWtCLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7O1lBQzdDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7O1lBQy9CLGlCQUFpQixHQUFhLEVBQUU7UUFDcEMsa0JBQWtCLENBQUMsT0FBTzs7OztRQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5QjtZQUNELGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLEVBQUMsQ0FBQztRQUVILElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFO1lBQzVCLDJCQUEyQjtZQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7b0JBQ3JDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixpQkFBaUIsQ0FBQyxPQUFPOzs7O2dCQUFDLFVBQVMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7YUFDdkY7U0FDRjtLQUNGO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQzs7Ozs7OztBQU1ELE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVMsRUFBRSxPQUFZO0lBQ2hFLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQjtZQUNFLE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0M7WUFDRSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDO1lBQ0UsT0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRDtZQUNFLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUM7WUFDRSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDO1lBQ0UsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QztZQUNFLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0M7WUFDRSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDO1lBQ0UsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvQztZQUNFLE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRDtZQUNFLE9BQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQ7WUFDRSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDO1lBQ0UsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QztZQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzlFO0FBQ0gsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxPQUFZLEVBQUUsSUFBWTtJQUNyRCxPQUFPLENBQUMsbUJBQUssTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRlVGltaW5ncywgQW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgc2VxdWVuY2UsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7QXN0IGFzIEFuaW1hdGlvbkFzdCwgQXN0VmlzaXRvciBhcyBBbmltYXRpb25Bc3RWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uRHNsVmlzaXRvcn0gZnJvbSAnLi9kc2wvYW5pbWF0aW9uX2RzbF92aXNpdG9yJztcbmltcG9ydCB7aXNOb2RlfSBmcm9tICcuL3JlbmRlci9zaGFyZWQnO1xuXG5leHBvcnQgY29uc3QgT05FX1NFQ09ORCA9IDEwMDA7XG5cbmV4cG9ydCBjb25zdCBTVUJTVElUVVRJT05fRVhQUl9TVEFSVCA9ICd7eyc7XG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfRU5EID0gJ319JztcbmV4cG9ydCBjb25zdCBFTlRFUl9DTEFTU05BTUUgPSAnbmctZW50ZXInO1xuZXhwb3J0IGNvbnN0IExFQVZFX0NMQVNTTkFNRSA9ICduZy1sZWF2ZSc7XG5leHBvcnQgY29uc3QgRU5URVJfU0VMRUNUT1IgPSAnLm5nLWVudGVyJztcbmV4cG9ydCBjb25zdCBMRUFWRV9TRUxFQ1RPUiA9ICcubmctbGVhdmUnO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfQ0xBU1NOQU1FID0gJ25nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfU0VMRUNUT1IgPSAnLm5nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX0FOSU1BVElOR19DTEFTU05BTUUgPSAnbmctYW5pbWF0aW5nJztcbmV4cG9ydCBjb25zdCBOR19BTklNQVRJTkdfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGluZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGltaW5nVmFsdWUodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSByZXR1cm4gdmFsdWU7XG5cbiAgY29uc3QgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoKC9eKC0/W1xcLlxcZF0rKShtP3MpLyk7XG4gIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8IDIpIHJldHVybiAwO1xuXG4gIHJldHVybiBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0VGltZVZhbHVlVG9NUyh2YWx1ZTogbnVtYmVyLCB1bml0OiBzdHJpbmcpOiBudW1iZXIge1xuICBzd2l0Y2ggKHVuaXQpIHtcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiB2YWx1ZSAqIE9ORV9TRUNPTkQ7XG4gICAgZGVmYXVsdDogIC8vIG1zIG9yIHNvbWV0aGluZyBlbHNlXG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUaW1pbmcoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyIHwgQW5pbWF0ZVRpbWluZ3MsIGVycm9yczogYW55W10sIGFsbG93TmVnYXRpdmVWYWx1ZXM/OiBib29sZWFuKSB7XG4gIHJldHVybiB0aW1pbmdzLmhhc093blByb3BlcnR5KCdkdXJhdGlvbicpID9cbiAgICAgIDxBbmltYXRlVGltaW5ncz50aW1pbmdzIDpcbiAgICAgIHBhcnNlVGltZUV4cHJlc3Npb24oPHN0cmluZ3xudW1iZXI+dGltaW5ncywgZXJyb3JzLCBhbGxvd05lZ2F0aXZlVmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUaW1lRXhwcmVzc2lvbihcbiAgICBleHA6IHN0cmluZyB8IG51bWJlciwgZXJyb3JzOiBzdHJpbmdbXSwgYWxsb3dOZWdhdGl2ZVZhbHVlcz86IGJvb2xlYW4pOiBBbmltYXRlVGltaW5ncyB7XG4gIGNvbnN0IHJlZ2V4ID0gL14oLT9bXFwuXFxkXSspKG0/cykoPzpcXHMrKC0/W1xcLlxcZF0rKShtP3MpKT8oPzpcXHMrKFstYS16XSsoPzpcXCguKz9cXCkpPykpPyQvaTtcbiAgbGV0IGR1cmF0aW9uOiBudW1iZXI7XG4gIGxldCBkZWxheTogbnVtYmVyID0gMDtcbiAgbGV0IGVhc2luZzogc3RyaW5nID0gJyc7XG4gIGlmICh0eXBlb2YgZXhwID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBleHAubWF0Y2gocmVnZXgpO1xuICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIHByb3ZpZGVkIHRpbWluZyB2YWx1ZSBcIiR7ZXhwfVwiIGlzIGludmFsaWQuYCk7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiAwLCBkZWxheTogMCwgZWFzaW5nOiAnJ307XG4gICAgfVxuXG4gICAgZHVyYXRpb24gPSBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG5cbiAgICBjb25zdCBkZWxheU1hdGNoID0gbWF0Y2hlc1szXTtcbiAgICBpZiAoZGVsYXlNYXRjaCAhPSBudWxsKSB7XG4gICAgICBkZWxheSA9IF9jb252ZXJ0VGltZVZhbHVlVG9NUyhwYXJzZUZsb2F0KGRlbGF5TWF0Y2gpLCBtYXRjaGVzWzRdKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmdWYWwgPSBtYXRjaGVzWzVdO1xuICAgIGlmIChlYXNpbmdWYWwpIHtcbiAgICAgIGVhc2luZyA9IGVhc2luZ1ZhbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZHVyYXRpb24gPSBleHA7XG4gIH1cblxuICBpZiAoIWFsbG93TmVnYXRpdmVWYWx1ZXMpIHtcbiAgICBsZXQgY29udGFpbnNFcnJvcnMgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRJbmRleCA9IGVycm9ycy5sZW5ndGg7XG4gICAgaWYgKGR1cmF0aW9uIDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYER1cmF0aW9uIHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGRlbGF5IDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYERlbGF5IHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRXJyb3JzKSB7XG4gICAgICBlcnJvcnMuc3BsaWNlKHN0YXJ0SW5kZXgsIDAsIGBUaGUgcHJvdmlkZWQgdGltaW5nIHZhbHVlIFwiJHtleHB9XCIgaXMgaW52YWxpZC5gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2R1cmF0aW9uLCBkZWxheSwgZWFzaW5nfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlPYmooXG4gICAgb2JqOiB7W2tleTogc3RyaW5nXTogYW55fSwgZGVzdGluYXRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge30pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChwcm9wID0+IHsgZGVzdGluYXRpb25bcHJvcF0gPSBvYmpbcHJvcF07IH0pO1xuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTdHlsZXMoc3R5bGVzOiDJtVN0eWxlRGF0YSB8IMm1U3R5bGVEYXRhW10pOiDJtVN0eWxlRGF0YSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIGlmIChBcnJheS5pc0FycmF5KHN0eWxlcykpIHtcbiAgICBzdHlsZXMuZm9yRWFjaChkYXRhID0+IGNvcHlTdHlsZXMoZGF0YSwgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICBjb3B5U3R5bGVzKHN0eWxlcywgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkU3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVN0eWxlcyhcbiAgICBzdHlsZXM6IMm1U3R5bGVEYXRhLCByZWFkUHJvdG90eXBlOiBib29sZWFuLCBkZXN0aW5hdGlvbjogybVTdHlsZURhdGEgPSB7fSk6IMm1U3R5bGVEYXRhIHtcbiAgaWYgKHJlYWRQcm90b3R5cGUpIHtcbiAgICAvLyB3ZSBtYWtlIHVzZSBvZiBhIGZvci1pbiBsb29wIHNvIHRoYXQgdGhlXG4gICAgLy8gcHJvdG90eXBpY2FsbHkgaW5oZXJpdGVkIHByb3BlcnRpZXMgYXJlXG4gICAgLy8gcmV2ZWFsZWQgZnJvbSB0aGUgYmFja0ZpbGwgbWFwXG4gICAgZm9yIChsZXQgcHJvcCBpbiBzdHlsZXMpIHtcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb3B5T2JqKHN0eWxlcywgZGVzdGluYXRpb24pO1xuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudDogYW55LCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAvLyBSZXR1cm4gdGhlIGtleS12YWx1ZSBwYWlyIHN0cmluZyB0byBiZSBhZGRlZCB0byB0aGUgc3R5bGUgYXR0cmlidXRlIGZvciB0aGVcbiAgLy8gZ2l2ZW4gQ1NTIHN0eWxlIGtleS5cbiAgaWYgKHZhbHVlKSB7XG4gICAgcmV0dXJuIGtleSArICc6JyArIHZhbHVlICsgJzsnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQ6IGFueSkge1xuICAvLyBSZWFkIHRoZSBzdHlsZSBwcm9wZXJ0eSBvZiB0aGUgZWxlbWVudCBhbmQgbWFudWFsbHkgcmVmbGVjdCBpdCB0byB0aGVcbiAgLy8gc3R5bGUgYXR0cmlidXRlLiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIERvbWlubyBvbiBwbGF0Zm9ybS1zZXJ2ZXIgZG9lc24ndFxuICAvLyB1bmRlcnN0YW5kIHRoZSBmdWxsIHNldCBvZiBhbGxvd2VkIENTUyBwcm9wZXJ0aWVzIGFuZCBkb2Vzbid0IHJlZmxlY3Qgc29tZVxuICAvLyBvZiB0aGVtIGF1dG9tYXRpY2FsbHkuXG4gIGxldCBzdHlsZUF0dHJWYWx1ZSA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnQuc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSBlbGVtZW50LnN0eWxlLml0ZW0oaSk7XG4gICAgc3R5bGVBdHRyVmFsdWUgKz0gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudCwga2V5LCBlbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoa2V5KSk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gZWxlbWVudC5zdHlsZSkge1xuICAgIC8vIFNraXAgaW50ZXJuYWwgRG9taW5vIHByb3BlcnRpZXMgdGhhdCBkb24ndCBuZWVkIHRvIGJlIHJlZmxlY3RlZC5cbiAgICBpZiAoIWVsZW1lbnQuc3R5bGUuaGFzT3duUHJvcGVydHkoa2V5KSB8fCBrZXkuc3RhcnRzV2l0aCgnXycpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgZGFzaEtleSA9IGNhbWVsQ2FzZVRvRGFzaENhc2Uoa2V5KTtcbiAgICBzdHlsZUF0dHJWYWx1ZSArPSBnZXRTdHlsZUF0dHJpYnV0ZVN0cmluZyhlbGVtZW50LCBkYXNoS2V5LCBlbGVtZW50LnN0eWxlW2tleV0pO1xuICB9XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlQXR0clZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0eWxlcyhlbGVtZW50OiBhbnksIHN0eWxlczogybVTdHlsZURhdGEsIGZvcm1lclN0eWxlcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGlmIChlbGVtZW50WydzdHlsZSddKSB7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wKTtcbiAgICAgIGlmIChmb3JtZXJTdHlsZXMgJiYgIWZvcm1lclN0eWxlcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBmb3JtZXJTdHlsZXNbcHJvcF0gPSBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF07XG4gICAgICB9XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgfSk7XG4gICAgLy8gT24gdGhlIHNlcnZlciBzZXQgdGhlICdzdHlsZScgYXR0cmlidXRlIHNpbmNlIGl0J3Mgbm90IGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkLlxuICAgIGlmIChpc05vZGUoKSkge1xuICAgICAgd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVyYXNlU3R5bGVzKGVsZW1lbnQ6IGFueSwgc3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBpZiAoZWxlbWVudFsnc3R5bGUnXSkge1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSAnJztcbiAgICB9KTtcbiAgICAvLyBPbiB0aGUgc2VydmVyIHNldCB0aGUgJ3N0eWxlJyBhdHRyaWJ1dGUgc2luY2UgaXQncyBub3QgYXV0b21hdGljYWxseSByZWZsZWN0ZWQuXG4gICAgaWYgKGlzTm9kZSgpKSB7XG4gICAgICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uRW50cnkoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6XG4gICAgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdGVwcykpIHtcbiAgICBpZiAoc3RlcHMubGVuZ3RoID09IDEpIHJldHVybiBzdGVwc1swXTtcbiAgICByZXR1cm4gc2VxdWVuY2Uoc3RlcHMpO1xuICB9XG4gIHJldHVybiBzdGVwcyBhcyBBbmltYXRpb25NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQYXJhbXMoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgZXJyb3JzOiBhbnlbXSkge1xuICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLnBhcmFtcyB8fCB7fTtcbiAgY29uc3QgbWF0Y2hlcyA9IGV4dHJhY3RTdHlsZVBhcmFtcyh2YWx1ZSk7XG4gIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuICAgIG1hdGNoZXMuZm9yRWFjaCh2YXJOYW1lID0+IHtcbiAgICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHZhck5hbWUpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgYFVuYWJsZSB0byByZXNvbHZlIHRoZSBsb2NhbCBhbmltYXRpb24gcGFyYW0gJHt2YXJOYW1lfSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiB2YWx1ZXNgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQQVJBTV9SRUdFWCA9XG4gICAgbmV3IFJlZ0V4cChgJHtTVUJTVElUVVRJT05fRVhQUl9TVEFSVH1cXFxccyooLis/KVxcXFxzKiR7U1VCU1RJVFVUSU9OX0VYUFJfRU5EfWAsICdnJyk7XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmdbXSB7XG4gIGxldCBwYXJhbXM6IHN0cmluZ1tdID0gW107XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IG1hdGNoOiBhbnk7XG4gICAgd2hpbGUgKG1hdGNoID0gUEFSQU1fUkVHRVguZXhlYyh2YWx1ZSkpIHtcbiAgICAgIHBhcmFtcy5wdXNoKG1hdGNoWzFdIGFzIHN0cmluZyk7XG4gICAgfVxuICAgIFBBUkFNX1JFR0VYLmxhc3RJbmRleCA9IDA7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVycG9sYXRlUGFyYW1zKFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IGFueVtdKTogc3RyaW5nfG51bWJlciB7XG4gIGNvbnN0IG9yaWdpbmFsID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgY29uc3Qgc3RyID0gb3JpZ2luYWwucmVwbGFjZShQQVJBTV9SRUdFWCwgKF8sIHZhck5hbWUpID0+IHtcbiAgICBsZXQgbG9jYWxWYWwgPSBwYXJhbXNbdmFyTmFtZV07XG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZSB2YWx1ZSB3YXMgbmV2ZXIgb3ZlcnJpZGRlbiBieSB0aGUgZGF0YSBwYXNzZWQgaW4gYnkgdGhlIHVzZXJcbiAgICBpZiAoIXBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh2YXJOYW1lKSkge1xuICAgICAgZXJyb3JzLnB1c2goYFBsZWFzZSBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBhbmltYXRpb24gcGFyYW0gJHt2YXJOYW1lfWApO1xuICAgICAgbG9jYWxWYWwgPSAnJztcbiAgICB9XG4gICAgcmV0dXJuIGxvY2FsVmFsLnRvU3RyaW5nKCk7XG4gIH0pO1xuXG4gIC8vIHdlIGRvIHRoaXMgdG8gYXNzZXJ0IHRoYXQgbnVtZXJpYyB2YWx1ZXMgc3RheSBhcyB0aGV5IGFyZVxuICByZXR1cm4gc3RyID09IG9yaWdpbmFsID8gdmFsdWUgOiBzdHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdGVyYXRvclRvQXJyYXkoaXRlcmF0b3I6IGFueSk6IGFueVtdIHtcbiAgY29uc3QgYXJyOiBhbnlbXSA9IFtdO1xuICBsZXQgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgd2hpbGUgKCFpdGVtLmRvbmUpIHtcbiAgICBhcnIucHVzaChpdGVtLnZhbHVlKTtcbiAgICBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUFuaW1hdGlvbk9wdGlvbnMoXG4gICAgc291cmNlOiBBbmltYXRpb25PcHRpb25zLCBkZXN0aW5hdGlvbjogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvbk9wdGlvbnMge1xuICBpZiAoc291cmNlLnBhcmFtcykge1xuICAgIGNvbnN0IHAwID0gc291cmNlLnBhcmFtcztcbiAgICBpZiAoIWRlc3RpbmF0aW9uLnBhcmFtcykge1xuICAgICAgZGVzdGluYXRpb24ucGFyYW1zID0ge307XG4gICAgfVxuICAgIGNvbnN0IHAxID0gZGVzdGluYXRpb24ucGFyYW1zO1xuICAgIE9iamVjdC5rZXlzKHAwKS5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgIGlmICghcDEuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICAgIHAxW3BhcmFtXSA9IHAwW3BhcmFtXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmNvbnN0IERBU0hfQ0FTRV9SRUdFWFAgPSAvLSsoW2EtejAtOV0pL2c7XG5leHBvcnQgZnVuY3Rpb24gZGFzaENhc2VUb0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoREFTSF9DQVNFX1JFR0VYUCwgKC4uLm06IGFueVtdKSA9PiBtWzFdLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5mdW5jdGlvbiBjYW1lbENhc2VUb0Rhc2hDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZShkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyKSB7XG4gIHJldHVybiBkdXJhdGlvbiA9PT0gMCB8fCBkZWxheSA9PT0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhbGFuY2VQcmV2aW91c1N0eWxlc0ludG9LZXlmcmFtZXMoXG4gICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9W10sIHByZXZpb3VzU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICBjb25zdCBwcmV2aW91c1N0eWxlUHJvcHMgPSBPYmplY3Qua2V5cyhwcmV2aW91c1N0eWxlcyk7XG4gIGlmIChwcmV2aW91c1N0eWxlUHJvcHMubGVuZ3RoICYmIGtleWZyYW1lcy5sZW5ndGgpIHtcbiAgICBsZXQgc3RhcnRpbmdLZXlmcmFtZSA9IGtleWZyYW1lc1swXTtcbiAgICBsZXQgbWlzc2luZ1N0eWxlUHJvcHM6IHN0cmluZ1tdID0gW107XG4gICAgcHJldmlvdXNTdHlsZVByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBpZiAoIXN0YXJ0aW5nS2V5ZnJhbWUuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgbWlzc2luZ1N0eWxlUHJvcHMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0aW5nS2V5ZnJhbWVbcHJvcF0gPSBwcmV2aW91c1N0eWxlc1twcm9wXTtcbiAgICB9KTtcblxuICAgIGlmIChtaXNzaW5nU3R5bGVQcm9wcy5sZW5ndGgpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBrZXlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGtmID0ga2V5ZnJhbWVzW2ldO1xuICAgICAgICBtaXNzaW5nU3R5bGVQcm9wcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHsga2ZbcHJvcF0gPSBjb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCk7IH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga2V5ZnJhbWVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXREc2xOb2RlKFxuICAgIHZpc2l0b3I6IEFuaW1hdGlvbkRzbFZpc2l0b3IsIG5vZGU6IEFuaW1hdGlvbk1ldGFkYXRhLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5leHBvcnQgZnVuY3Rpb24gdmlzaXREc2xOb2RlKFxuICAgIHZpc2l0b3I6IEFuaW1hdGlvbkFzdFZpc2l0b3IsIG5vZGU6IEFuaW1hdGlvbkFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LCBjb250ZXh0OiBhbnkpOiBhbnk7XG5leHBvcnQgZnVuY3Rpb24gdmlzaXREc2xOb2RlKHZpc2l0b3I6IGFueSwgbm9kZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyaWdnZXI6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFRyaWdnZXIobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0YXRlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb246XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFRyYW5zaXRpb24obm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2U6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFNlcXVlbmNlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkdyb3VwOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRHcm91cChub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lczpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0S2V5ZnJhbWVzKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdHlsZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2U6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlZmVyZW5jZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlQ2hpbGQ6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGVDaGlsZChub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlUmVmKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlF1ZXJ5OlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRRdWVyeShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGFnZ2VyOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdGFnZ2VyKG5vZGUsIGNvbnRleHQpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIGFuaW1hdGlvbiBtZXRhZGF0YSBub2RlICMke25vZGUudHlwZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICg8YW55PndpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpKVtwcm9wXTtcbn1cbiJdfQ==