/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { sequence } from '@angular/animations';
export var /** @type {?} */ ONE_SECOND = 1000;
export var /** @type {?} */ SUBSTITUTION_EXPR_START = '{{';
export var /** @type {?} */ SUBSTITUTION_EXPR_END = '}}';
export var /** @type {?} */ ENTER_CLASSNAME = 'ng-enter';
export var /** @type {?} */ LEAVE_CLASSNAME = 'ng-leave';
export var /** @type {?} */ ENTER_SELECTOR = '.ng-enter';
export var /** @type {?} */ LEAVE_SELECTOR = '.ng-leave';
export var /** @type {?} */ NG_TRIGGER_CLASSNAME = 'ng-trigger';
export var /** @type {?} */ NG_TRIGGER_SELECTOR = '.ng-trigger';
export var /** @type {?} */ NG_ANIMATING_CLASSNAME = 'ng-animating';
export var /** @type {?} */ NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} value
 * @return {?}
 */
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    var /** @type {?} */ matches = (/** @type {?} */ (value)).match(/^(-?[\.\d]+)(m?s)/);
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
        default:
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
    var /** @type {?} */ regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    var /** @type {?} */ duration;
    var /** @type {?} */ delay = 0;
    var /** @type {?} */ easing = '';
    if (typeof exp === 'string') {
        var /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push("The provided timing value \"" + exp + "\" is invalid.");
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        var /** @type {?} */ delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(Math.floor(parseFloat(delayMatch)), matches[4]);
        }
        var /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = /** @type {?} */ (exp);
    }
    if (!allowNegativeValues) {
        var /** @type {?} */ containsErrors = false;
        var /** @type {?} */ startIndex = errors.length;
        if (duration < 0) {
            errors.push("Duration values below 0 are not allowed for this animation step.");
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push("Delay values below 0 are not allowed for this animation step.");
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, "The provided timing value \"" + exp + "\" is invalid.");
        }
    }
    return { duration: duration, delay: delay, easing: easing };
}
/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */
export function copyObj(obj, destination) {
    if (destination === void 0) { destination = {}; }
    Object.keys(obj).forEach(function (prop) { destination[prop] = obj[prop]; });
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    var /** @type {?} */ normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach(function (data) { return copyStyles(data, false, normalizedStyles); });
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
export function copyStyles(styles, readPrototype, destination) {
    if (destination === void 0) { destination = {}; }
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (var /** @type {?} */ prop in styles) {
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
        Object.keys(styles).forEach(function (prop) {
            var /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
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
        Object.keys(styles).forEach(function (prop) {
            var /** @type {?} */ camelProp = dashCaseToCamelCase(prop);
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
    var /** @type {?} */ params = options.params || {};
    var /** @type {?} */ matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach(function (varName) {
            if (!params.hasOwnProperty(varName)) {
                errors.push("Unable to resolve the local animation param " + varName + " in the given list of values");
            }
        });
    }
}
var /** @type {?} */ PARAM_REGEX = new RegExp(SUBSTITUTION_EXPR_START + "\\s*(.+?)\\s*" + SUBSTITUTION_EXPR_END, 'g');
/**
 * @param {?} value
 * @return {?}
 */
export function extractStyleParams(value) {
    var /** @type {?} */ params = [];
    if (typeof value === 'string') {
        var /** @type {?} */ val = value.toString();
        var /** @type {?} */ match = void 0;
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
    var /** @type {?} */ original = value.toString();
    var /** @type {?} */ str = original.replace(PARAM_REGEX, function (_, varName) {
        var /** @type {?} */ localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push("Please provide a value for the animation param " + varName);
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
    var /** @type {?} */ arr = [];
    var /** @type {?} */ item = iterator.next();
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
        var /** @type {?} */ p0_1 = source.params;
        if (!destination.params) {
            destination.params = {};
        }
        var /** @type {?} */ p1_1 = destination.params;
        Object.keys(p0_1).forEach(function (param) {
            if (!p1_1.hasOwnProperty(param)) {
                p1_1[param] = p0_1[param];
            }
        });
    }
    return destination;
}
var /** @type {?} */ DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        return m[1].toUpperCase();
    });
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
    var /** @type {?} */ previousStyleProps = Object.keys(previousStyles);
    if (previousStyleProps.length && keyframes.length) {
        var /** @type {?} */ startingKeyframe_1 = keyframes[0];
        var /** @type {?} */ missingStyleProps_1 = [];
        previousStyleProps.forEach(function (prop) {
            if (!startingKeyframe_1.hasOwnProperty(prop)) {
                missingStyleProps_1.push(prop);
            }
            startingKeyframe_1[prop] = previousStyles[prop];
        });
        if (missingStyleProps_1.length) {
            var _loop_1 = function () {
                var /** @type {?} */ kf = keyframes[i];
                missingStyleProps_1.forEach(function (prop) { kf[prop] = computeStyle(element, prop); });
            };
            // tslint:disable-next-line
            for (var /** @type {?} */ i = 1; i < keyframes.length; i++) {
                _loop_1();
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
            throw new Error("Unable to resolve animation metadata node #" + node.type);
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
//# sourceMappingURL=util.js.map