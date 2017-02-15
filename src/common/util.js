export const /** @type {?} */ ONE_SECOND = 1000;
/**
 * @param {?} exp
 * @param {?} errors
 * @return {?}
 */
export function parseTimeExpression(exp, errors) {
    const /** @type {?} */ regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let /** @type {?} */ duration;
    let /** @type {?} */ delay = 0;
    let /** @type {?} */ easing = null;
    if (typeof exp === 'string') {
        const /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: null };
        }
        let /** @type {?} */ durationMatch = parseFloat(matches[1]);
        const /** @type {?} */ durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        const /** @type {?} */ delayMatch = matches[3];
        const /** @type {?} */ delayUnit = matches[4];
        if (delayMatch != null) {
            let /** @type {?} */ delayVal = parseFloat(delayMatch);
            if (delayUnit != null && delayUnit == 's') {
                delayVal *= ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        const /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = (exp);
    }
    return { duration, delay, easing };
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    const /** @type {?} */ normalizedStyles = {};
    styles.styles.forEach((styleMap) => copyStyles(styleMap, false, normalizedStyles));
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
        Object.keys(styles).forEach(prop => destination[prop] = styles[prop]);
    }
    return destination;
}
//# sourceMappingURL=util.js.map