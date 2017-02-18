export var /** @type {?} */ ONE_SECOND = 1000;
/**
 * @param {?} exp
 * @param {?} errors
 * @return {?}
 */
export function parseTimeExpression(exp, errors) {
    var /** @type {?} */ regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    var /** @type {?} */ duration;
    var /** @type {?} */ delay = 0;
    var /** @type {?} */ easing = null;
    if (typeof exp === 'string') {
        var /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push("The provided timing value \"" + exp + "\" is invalid.");
            return { duration: 0, delay: 0, easing: null };
        }
        var /** @type {?} */ durationMatch = parseFloat(matches[1]);
        var /** @type {?} */ durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        var /** @type {?} */ delayMatch = matches[3];
        var /** @type {?} */ delayUnit = matches[4];
        if (delayMatch != null) {
            var /** @type {?} */ delayVal = parseFloat(delayMatch);
            if (delayUnit != null && delayUnit == 's') {
                delayVal *= ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        var /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = (exp);
    }
    return { duration: duration, delay: delay, easing: easing };
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    var /** @type {?} */ normalizedStyles = {};
    styles.styles.forEach(function (styleMap) { return copyStyles(styleMap, false, normalizedStyles); });
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
        Object.keys(styles).forEach(function (prop) { return destination[prop] = styles[prop]; });
    }
    return destination;
}
//# sourceMappingURL=util.js.map