/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { sequence } from '@angular/animations';
import { invalidNodeType, invalidParamValue, invalidStyleParams, invalidTimingValue, negativeDelayValue, negativeStepValue } from './error_helpers';
import { isNode } from './render/shared';
export const ONE_SECOND = 1000;
export const SUBSTITUTION_EXPR_START = '{{';
export const SUBSTITUTION_EXPR_END = '}}';
export const ENTER_CLASSNAME = 'ng-enter';
export const LEAVE_CLASSNAME = 'ng-leave';
export const NG_TRIGGER_CLASSNAME = 'ng-trigger';
export const NG_TRIGGER_SELECTOR = '.ng-trigger';
export const NG_ANIMATING_CLASSNAME = 'ng-animating';
export const NG_ANIMATING_SELECTOR = '.ng-animating';
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    const matches = value.match(/^(-?[\.\d]+)(m?s)/);
    if (!matches || matches.length < 2)
        return 0;
    return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
function _convertTimeValueToMS(value, unit) {
    switch (unit) {
        case 's':
            return value * ONE_SECOND;
        default: // ms or something else
            return value;
    }
}
export function resolveTiming(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration') ?
        timings :
        parseTimeExpression(timings, errors, allowNegativeValues);
}
function parseTimeExpression(exp, errors, allowNegativeValues) {
    const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let duration;
    let delay = 0;
    let easing = '';
    if (typeof exp === 'string') {
        const matches = exp.match(regex);
        if (matches === null) {
            errors.push(invalidTimingValue(exp));
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        const delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
        }
        const easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = exp;
    }
    if (!allowNegativeValues) {
        let containsErrors = false;
        let startIndex = errors.length;
        if (duration < 0) {
            errors.push(negativeStepValue());
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(negativeDelayValue());
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, invalidTimingValue(exp));
        }
    }
    return { duration, delay, easing };
}
export function copyObj(obj, destination = {}) {
    Object.keys(obj).forEach(prop => {
        destination[prop] = obj[prop];
    });
    return destination;
}
export function convertToMap(obj) {
    const styleMap = new Map();
    Object.keys(obj).forEach(prop => {
        const val = obj[prop];
        styleMap.set(prop, val);
    });
    return styleMap;
}
export function normalizeKeyframes(keyframes) {
    if (!keyframes.length) {
        return [];
    }
    if (keyframes[0] instanceof Map) {
        return keyframes;
    }
    return keyframes.map(kf => convertToMap(kf));
}
export function normalizeStyles(styles) {
    const normalizedStyles = new Map();
    if (Array.isArray(styles)) {
        styles.forEach(data => copyStyles(data, normalizedStyles));
    }
    else {
        copyStyles(styles, normalizedStyles);
    }
    return normalizedStyles;
}
export function copyStyles(styles, destination = new Map(), backfill) {
    if (backfill) {
        for (let [prop, val] of backfill) {
            destination.set(prop, val);
        }
    }
    for (let [prop, val] of styles) {
        destination.set(prop, val);
    }
    return destination;
}
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
function writeStyleAttribute(element) {
    // Read the style property of the element and manually reflect it to the
    // style attribute. This is needed because Domino on platform-server doesn't
    // understand the full set of allowed CSS properties and doesn't reflect some
    // of them automatically.
    let styleAttrValue = '';
    for (let i = 0; i < element.style.length; i++) {
        const key = element.style.item(i);
        styleAttrValue += getStyleAttributeString(element, key, element.style.getPropertyValue(key));
    }
    for (const key in element.style) {
        // Skip internal Domino properties that don't need to be reflected.
        if (!element.style.hasOwnProperty(key) || key.startsWith('_')) {
            continue;
        }
        const dashKey = camelCaseToDashCase(key);
        styleAttrValue += getStyleAttributeString(element, dashKey, element.style[key]);
    }
    element.setAttribute('style', styleAttrValue);
}
export function setStyles(element, styles, formerStyles) {
    if (element['style']) {
        styles.forEach((val, prop) => {
            const camelProp = dashCaseToCamelCase(prop);
            if (formerStyles && !formerStyles.has(prop)) {
                formerStyles.set(prop, element.style[camelProp]);
            }
            element.style[camelProp] = val;
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
export function eraseStyles(element, styles) {
    if (element['style']) {
        styles.forEach((_, prop) => {
            const camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = '';
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
export function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return steps;
}
export function validateStyleParams(value, options, errors) {
    const params = options.params || {};
    const matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach(varName => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(invalidStyleParams(varName));
            }
        });
    }
}
const PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
export function extractStyleParams(value) {
    let params = [];
    if (typeof value === 'string') {
        let match;
        while (match = PARAM_REGEX.exec(value)) {
            params.push(match[1]);
        }
        PARAM_REGEX.lastIndex = 0;
    }
    return params;
}
export function interpolateParams(value, params, errors) {
    const original = value.toString();
    const str = original.replace(PARAM_REGEX, (_, varName) => {
        let localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push(invalidParamValue(varName));
            localVal = '';
        }
        return localVal.toString();
    });
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
export function iteratorToArray(iterator) {
    const arr = [];
    let item = iterator.next();
    while (!item.done) {
        arr.push(item.value);
        item = iterator.next();
    }
    return arr;
}
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
function camelCaseToDashCase(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
export function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}
export function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
    if (previousStyles.size && keyframes.length) {
        let startingKeyframe = keyframes[0];
        let missingStyleProps = [];
        previousStyles.forEach((val, prop) => {
            if (!startingKeyframe.has(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe.set(prop, val);
        });
        if (missingStyleProps.length) {
            for (let i = 1; i < keyframes.length; i++) {
                let kf = keyframes[i];
                missingStyleProps.forEach(prop => kf.set(prop, computeStyle(element, prop)));
            }
        }
    }
    return keyframes;
}
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
            throw invalidNodeType(node.type);
    }
}
export function computeStyle(element, prop) {
    return window.getComputedStyle(element)[prop];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQTZFLFFBQVEsRUFBNEIsTUFBTSxxQkFBcUIsQ0FBQztBQUlwSixPQUFPLEVBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDbEosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXZDLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFL0IsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQztBQUMxQyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDO0FBQzFDLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQztBQUNqRCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUM7QUFDckQsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsZUFBZSxDQUFDO0FBRXJELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxLQUFvQjtJQUNyRCxJQUFJLE9BQU8sS0FBSyxJQUFJLFFBQVE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUUzQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLE9BQU8sSUFBSSxP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QUFPLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGVUaW1pbmdzLCBBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBzZXF1ZW5jZSwgybVTdHlsZURhdGEsIMm1U3R5bGVEYXRhTWFwfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBc3QgYXMgQW5pbWF0aW9uQXN0LCBBc3RWaXNpdG9yIGFzIEFuaW1hdGlvbkFzdFZpc2l0b3J9IGZyb20gJy4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25Ec2xWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fZHNsX3Zpc2l0b3InO1xuaW1wb3J0IHtpbnZhbGlkTm9kZVR5cGUsIGludmFsaWRQYXJhbVZhbHVlLCBpbnZhbGlkU3R5bGVQYXJhbXMsIGludmFsaWRUaW1pbmdWYWx1ZSwgbmVnYXRpdmVEZWxheVZhbHVlLCBuZWdhdGl2ZVN0ZXBWYWx1ZX0gZnJvbSAnLi9lcnJvcl9oZWxwZXJzJztcbmltcG9ydCB7aXNOb2RlfSBmcm9tICcuL3JlbmRlci9zaGFyZWQnO1xuXG5leHBvcnQgY29uc3QgT05FX1NFQ09ORCA9IDEwMDA7XG5cbmV4cG9ydCBjb25zdCBTVUJTVElUVVRJT05fRVhQUl9TVEFSVCA9ICd7eyc7XG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfRU5EID0gJ319JztcbmV4cG9ydCBjb25zdCBFTlRFUl9DTEFTU05BTUUgPSAnbmctZW50ZXInO1xuZXhwb3J0IGNvbnN0IExFQVZFX0NMQVNTTkFNRSA9ICduZy1sZWF2ZSc7XG5leHBvcnQgY29uc3QgTkdfVFJJR0dFUl9DTEFTU05BTUUgPSAnbmctdHJpZ2dlcic7XG5leHBvcnQgY29uc3QgTkdfVFJJR0dFUl9TRUxFQ1RPUiA9ICcubmctdHJpZ2dlcic7XG5leHBvcnQgY29uc3QgTkdfQU5JTUFUSU5HX0NMQVNTTkFNRSA9ICduZy1hbmltYXRpbmcnO1xuZXhwb3J0IGNvbnN0IE5HX0FOSU1BVElOR19TRUxFQ1RPUiA9ICcubmctYW5pbWF0aW5nJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUaW1pbmdWYWx1ZSh2YWx1ZTogc3RyaW5nfG51bWJlcikge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSByZXR1cm4gdmFsdWU7XG5cbiAgY29uc3QgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoKC9eKC0/W1xcLlxcZF0rKShtP3MpLyk7XG4gIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8IDIpIHJldHVybiAwO1xuXG4gIHJldHVybiBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0VGltZVZhbHVlVG9NUyh2YWx1ZTogbnVtYmVyLCB1bml0OiBzdHJpbmcpOiBudW1iZXIge1xuICBzd2l0Y2ggKHVuaXQpIHtcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiB2YWx1ZSAqIE9ORV9TRUNPTkQ7XG4gICAgZGVmYXVsdDogIC8vIG1zIG9yIHNvbWV0aGluZyBlbHNlXG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUaW1pbmcoXG4gICAgdGltaW5nczogc3RyaW5nfG51bWJlcnxBbmltYXRlVGltaW5ncywgZXJyb3JzOiBFcnJvcltdLCBhbGxvd05lZ2F0aXZlVmFsdWVzPzogYm9vbGVhbikge1xuICByZXR1cm4gdGltaW5ncy5oYXNPd25Qcm9wZXJ0eSgnZHVyYXRpb24nKSA/XG4gICAgICA8QW5pbWF0ZVRpbWluZ3M+dGltaW5ncyA6XG4gICAgICBwYXJzZVRpbWVFeHByZXNzaW9uKDxzdHJpbmd8bnVtYmVyPnRpbWluZ3MsIGVycm9ycywgYWxsb3dOZWdhdGl2ZVZhbHVlcyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGltZUV4cHJlc3Npb24oXG4gICAgZXhwOiBzdHJpbmd8bnVtYmVyLCBlcnJvcnM6IEVycm9yW10sIGFsbG93TmVnYXRpdmVWYWx1ZXM/OiBib29sZWFuKTogQW5pbWF0ZVRpbWluZ3Mge1xuICBjb25zdCByZWdleCA9IC9eKC0/W1xcLlxcZF0rKShtP3MpKD86XFxzKygtP1tcXC5cXGRdKykobT9zKSk/KD86XFxzKyhbLWEtel0rKD86XFwoLis/XFwpKT8pKT8kL2k7XG4gIGxldCBkdXJhdGlvbjogbnVtYmVyO1xuICBsZXQgZGVsYXk6IG51bWJlciA9IDA7XG4gIGxldCBlYXNpbmc6IHN0cmluZyA9ICcnO1xuICBpZiAodHlwZW9mIGV4cCA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gZXhwLm1hdGNoKHJlZ2V4KTtcbiAgICBpZiAobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goaW52YWxpZFRpbWluZ1ZhbHVlKGV4cCkpO1xuICAgICAgcmV0dXJuIHtkdXJhdGlvbjogMCwgZGVsYXk6IDAsIGVhc2luZzogJyd9O1xuICAgIH1cblxuICAgIGR1cmF0aW9uID0gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHBhcnNlRmxvYXQobWF0Y2hlc1sxXSksIG1hdGNoZXNbMl0pO1xuXG4gICAgY29uc3QgZGVsYXlNYXRjaCA9IG1hdGNoZXNbM107XG4gICAgaWYgKGRlbGF5TWF0Y2ggIT0gbnVsbCkge1xuICAgICAgZGVsYXkgPSBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChkZWxheU1hdGNoKSwgbWF0Y2hlc1s0XSk7XG4gICAgfVxuXG4gICAgY29uc3QgZWFzaW5nVmFsID0gbWF0Y2hlc1s1XTtcbiAgICBpZiAoZWFzaW5nVmFsKSB7XG4gICAgICBlYXNpbmcgPSBlYXNpbmdWYWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGR1cmF0aW9uID0gZXhwO1xuICB9XG5cbiAgaWYgKCFhbGxvd05lZ2F0aXZlVmFsdWVzKSB7XG4gICAgbGV0IGNvbnRhaW5zRXJyb3JzID0gZmFsc2U7XG4gICAgbGV0IHN0YXJ0SW5kZXggPSBlcnJvcnMubGVuZ3RoO1xuICAgIGlmIChkdXJhdGlvbiA8IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKG5lZ2F0aXZlU3RlcFZhbHVlKCkpO1xuICAgICAgY29udGFpbnNFcnJvcnMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZGVsYXkgPCAwKSB7XG4gICAgICBlcnJvcnMucHVzaChuZWdhdGl2ZURlbGF5VmFsdWUoKSk7XG4gICAgICBjb250YWluc0Vycm9ycyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjb250YWluc0Vycm9ycykge1xuICAgICAgZXJyb3JzLnNwbGljZShzdGFydEluZGV4LCAwLCBpbnZhbGlkVGltaW5nVmFsdWUoZXhwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtkdXJhdGlvbiwgZGVsYXksIGVhc2luZ307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5T2JqKFxuICAgIG9iajoge1trZXk6IHN0cmluZ106IGFueX0sIGRlc3RpbmF0aW9uOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2gocHJvcCA9PiB7XG4gICAgZGVzdGluYXRpb25bcHJvcF0gPSBvYmpbcHJvcF07XG4gIH0pO1xuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VG9NYXAob2JqOiDJtVN0eWxlRGF0YSk6IMm1U3R5bGVEYXRhTWFwIHtcbiAgY29uc3Qgc3R5bGVNYXA6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2gocHJvcCA9PiB7XG4gICAgY29uc3QgdmFsID0gb2JqW3Byb3BdO1xuICAgIHN0eWxlTWFwLnNldChwcm9wLCB2YWwpO1xuICB9KTtcbiAgcmV0dXJuIHN0eWxlTWFwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplS2V5ZnJhbWVzKGtleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGE+fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheTzJtVN0eWxlRGF0YU1hcD4pOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4ge1xuICBpZiAoIWtleWZyYW1lcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKGtleWZyYW1lc1swXSBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHJldHVybiBrZXlmcmFtZXMgYXMgQXJyYXk8ybVTdHlsZURhdGFNYXA+O1xuICB9XG4gIHJldHVybiBrZXlmcmFtZXMubWFwKGtmID0+IGNvbnZlcnRUb01hcChrZiBhcyDJtVN0eWxlRGF0YSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3R5bGVzKHN0eWxlczogybVTdHlsZURhdGFNYXB8QXJyYXk8ybVTdHlsZURhdGFNYXA+KTogybVTdHlsZURhdGFNYXAge1xuICBjb25zdCBub3JtYWxpemVkU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R5bGVzKSkge1xuICAgIHN0eWxlcy5mb3JFYWNoKGRhdGEgPT4gY29weVN0eWxlcyhkYXRhLCBub3JtYWxpemVkU3R5bGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgY29weVN0eWxlcyhzdHlsZXMsIG5vcm1hbGl6ZWRTdHlsZXMpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkU3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVN0eWxlcyhcbiAgICBzdHlsZXM6IMm1U3R5bGVEYXRhTWFwLCBkZXN0aW5hdGlvbjogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCksXG4gICAgYmFja2ZpbGw/OiDJtVN0eWxlRGF0YU1hcCk6IMm1U3R5bGVEYXRhTWFwIHtcbiAgaWYgKGJhY2tmaWxsKSB7XG4gICAgZm9yIChsZXQgW3Byb3AsIHZhbF0gb2YgYmFja2ZpbGwpIHtcbiAgICAgIGRlc3RpbmF0aW9uLnNldChwcm9wLCB2YWwpO1xuICAgIH1cbiAgfVxuICBmb3IgKGxldCBbcHJvcCwgdmFsXSBvZiBzdHlsZXMpIHtcbiAgICBkZXN0aW5hdGlvbi5zZXQocHJvcCwgdmFsKTtcbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlQXR0cmlidXRlU3RyaW5nKGVsZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgLy8gUmV0dXJuIHRoZSBrZXktdmFsdWUgcGFpciBzdHJpbmcgdG8gYmUgYWRkZWQgdG8gdGhlIHN0eWxlIGF0dHJpYnV0ZSBmb3IgdGhlXG4gIC8vIGdpdmVuIENTUyBzdHlsZSBrZXkuXG4gIGlmICh2YWx1ZSkge1xuICAgIHJldHVybiBrZXkgKyAnOicgKyB2YWx1ZSArICc7JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50OiBhbnkpIHtcbiAgLy8gUmVhZCB0aGUgc3R5bGUgcHJvcGVydHkgb2YgdGhlIGVsZW1lbnQgYW5kIG1hbnVhbGx5IHJlZmxlY3QgaXQgdG8gdGhlXG4gIC8vIHN0eWxlIGF0dHJpYnV0ZS4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBEb21pbm8gb24gcGxhdGZvcm0tc2VydmVyIGRvZXNuJ3RcbiAgLy8gdW5kZXJzdGFuZCB0aGUgZnVsbCBzZXQgb2YgYWxsb3dlZCBDU1MgcHJvcGVydGllcyBhbmQgZG9lc24ndCByZWZsZWN0IHNvbWVcbiAgLy8gb2YgdGhlbSBhdXRvbWF0aWNhbGx5LlxuICBsZXQgc3R5bGVBdHRyVmFsdWUgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50LnN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gZWxlbWVudC5zdHlsZS5pdGVtKGkpO1xuICAgIHN0eWxlQXR0clZhbHVlICs9IGdldFN0eWxlQXR0cmlidXRlU3RyaW5nKGVsZW1lbnQsIGtleSwgZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGtleSkpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVsZW1lbnQuc3R5bGUpIHtcbiAgICAvLyBTa2lwIGludGVybmFsIERvbWlubyBwcm9wZXJ0aWVzIHRoYXQgZG9uJ3QgbmVlZCB0byBiZSByZWZsZWN0ZWQuXG4gICAgaWYgKCFlbGVtZW50LnN0eWxlLmhhc093blByb3BlcnR5KGtleSkgfHwga2V5LnN0YXJ0c1dpdGgoJ18nKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGRhc2hLZXkgPSBjYW1lbENhc2VUb0Rhc2hDYXNlKGtleSk7XG4gICAgc3R5bGVBdHRyVmFsdWUgKz0gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudCwgZGFzaEtleSwgZWxlbWVudC5zdHlsZVtrZXldKTtcbiAgfVxuICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBzdHlsZUF0dHJWYWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdHlsZXMoZWxlbWVudDogYW55LCBzdHlsZXM6IMm1U3R5bGVEYXRhTWFwLCBmb3JtZXJTdHlsZXM/OiDJtVN0eWxlRGF0YU1hcCkge1xuICBpZiAoZWxlbWVudFsnc3R5bGUnXSkge1xuICAgIHN0eWxlcy5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBpZiAoZm9ybWVyU3R5bGVzICYmICFmb3JtZXJTdHlsZXMuaGFzKHByb3ApKSB7XG4gICAgICAgIGZvcm1lclN0eWxlcy5zZXQocHJvcCwgZWxlbWVudC5zdHlsZVtjYW1lbFByb3BdKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuc3R5bGVbY2FtZWxQcm9wXSA9IHZhbDtcbiAgICB9KTtcbiAgICAvLyBPbiB0aGUgc2VydmVyIHNldCB0aGUgJ3N0eWxlJyBhdHRyaWJ1dGUgc2luY2UgaXQncyBub3QgYXV0b21hdGljYWxseSByZWZsZWN0ZWQuXG4gICAgaWYgKGlzTm9kZSgpKSB7XG4gICAgICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJhc2VTdHlsZXMoZWxlbWVudDogYW55LCBzdHlsZXM6IMm1U3R5bGVEYXRhTWFwKSB7XG4gIGlmIChlbGVtZW50WydzdHlsZSddKSB7XG4gICAgc3R5bGVzLmZvckVhY2goKF8sIHByb3ApID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSAnJztcbiAgICB9KTtcbiAgICAvLyBPbiB0aGUgc2VydmVyIHNldCB0aGUgJ3N0eWxlJyBhdHRyaWJ1dGUgc2luY2UgaXQncyBub3QgYXV0b21hdGljYWxseSByZWZsZWN0ZWQuXG4gICAgaWYgKGlzTm9kZSgpKSB7XG4gICAgICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uRW50cnkoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHN0ZXBzKSkge1xuICAgIGlmIChzdGVwcy5sZW5ndGggPT0gMSkgcmV0dXJuIHN0ZXBzWzBdO1xuICAgIHJldHVybiBzZXF1ZW5jZShzdGVwcyk7XG4gIH1cbiAgcmV0dXJuIHN0ZXBzIGFzIEFuaW1hdGlvbk1ldGFkYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVBhcmFtcyhcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlcnxudWxsfHVuZGVmaW5lZCwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgZXJyb3JzOiBFcnJvcltdKSB7XG4gIGNvbnN0IHBhcmFtcyA9IG9wdGlvbnMucGFyYW1zIHx8IHt9O1xuICBjb25zdCBtYXRjaGVzID0gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlKTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgbWF0Y2hlcy5mb3JFYWNoKHZhck5hbWUgPT4ge1xuICAgICAgaWYgKCFwYXJhbXMuaGFzT3duUHJvcGVydHkodmFyTmFtZSkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goaW52YWxpZFN0eWxlUGFyYW1zKHZhck5hbWUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQQVJBTV9SRUdFWCA9XG4gICAgbmV3IFJlZ0V4cChgJHtTVUJTVElUVVRJT05fRVhQUl9TVEFSVH1cXFxccyooLis/KVxcXFxzKiR7U1VCU1RJVFVUSU9OX0VYUFJfRU5EfWAsICdnJyk7XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlOiBzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkKTogc3RyaW5nW10ge1xuICBsZXQgcGFyYW1zOiBzdHJpbmdbXSA9IFtdO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIGxldCBtYXRjaDogYW55O1xuICAgIHdoaWxlIChtYXRjaCA9IFBBUkFNX1JFR0VYLmV4ZWModmFsdWUpKSB7XG4gICAgICBwYXJhbXMucHVzaChtYXRjaFsxXSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICBQQVJBTV9SRUdFWC5sYXN0SW5kZXggPSAwO1xuICB9XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnBvbGF0ZVBhcmFtcyhcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlciwgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0sIGVycm9yczogRXJyb3JbXSk6IHN0cmluZ3xudW1iZXIge1xuICBjb25zdCBvcmlnaW5hbCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHN0ciA9IG9yaWdpbmFsLnJlcGxhY2UoUEFSQU1fUkVHRVgsIChfLCB2YXJOYW1lKSA9PiB7XG4gICAgbGV0IGxvY2FsVmFsID0gcGFyYW1zW3Zhck5hbWVdO1xuICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGUgdmFsdWUgd2FzIG5ldmVyIG92ZXJyaWRkZW4gYnkgdGhlIGRhdGEgcGFzc2VkIGluIGJ5IHRoZSB1c2VyXG4gICAgaWYgKCFwYXJhbXMuaGFzT3duUHJvcGVydHkodmFyTmFtZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKGludmFsaWRQYXJhbVZhbHVlKHZhck5hbWUpKTtcbiAgICAgIGxvY2FsVmFsID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBsb2NhbFZhbC50b1N0cmluZygpO1xuICB9KTtcblxuICAvLyB3ZSBkbyB0aGlzIHRvIGFzc2VydCB0aGF0IG51bWVyaWMgdmFsdWVzIHN0YXkgYXMgdGhleSBhcmVcbiAgcmV0dXJuIHN0ciA9PSBvcmlnaW5hbCA/IHZhbHVlIDogc3RyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXRlcmF0b3JUb0FycmF5KGl0ZXJhdG9yOiBhbnkpOiBhbnlbXSB7XG4gIGNvbnN0IGFycjogYW55W10gPSBbXTtcbiAgbGV0IGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIHdoaWxlICghaXRlbS5kb25lKSB7XG4gICAgYXJyLnB1c2goaXRlbS52YWx1ZSk7XG4gICAgaXRlbSA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5jb25zdCBEQVNIX0NBU0VfUkVHRVhQID0gLy0rKFthLXowLTldKS9nO1xuZXhwb3J0IGZ1bmN0aW9uIGRhc2hDYXNlVG9DYW1lbENhc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKERBU0hfQ0FTRV9SRUdFWFAsICguLi5tOiBhbnlbXSkgPT4gbVsxXS50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9EYXNoQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcikge1xuICByZXR1cm4gZHVyYXRpb24gPT09IDAgfHwgZGVsYXkgPT09IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKFxuICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4sIHByZXZpb3VzU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCkge1xuICBpZiAocHJldmlvdXNTdHlsZXMuc2l6ZSAmJiBrZXlmcmFtZXMubGVuZ3RoKSB7XG4gICAgbGV0IHN0YXJ0aW5nS2V5ZnJhbWUgPSBrZXlmcmFtZXNbMF07XG4gICAgbGV0IG1pc3NpbmdTdHlsZVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByZXZpb3VzU3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4ge1xuICAgICAgaWYgKCFzdGFydGluZ0tleWZyYW1lLmhhcyhwcm9wKSkge1xuICAgICAgICBtaXNzaW5nU3R5bGVQcm9wcy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgICAgc3RhcnRpbmdLZXlmcmFtZS5zZXQocHJvcCwgdmFsKTtcbiAgICB9KTtcblxuICAgIGlmIChtaXNzaW5nU3R5bGVQcm9wcy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwga2V5ZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGtleWZyYW1lc1tpXTtcbiAgICAgICAgbWlzc2luZ1N0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IGtmLnNldChwcm9wLCBjb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Ec2xWaXNpdG9yLCBub2RlOiBBbmltYXRpb25NZXRhZGF0YSwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgICB2aXNpdG9yOiBBbmltYXRpb25Bc3RWaXNpdG9yLCBub2RlOiBBbmltYXRpb25Bc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiwgY29udGV4dDogYW55KTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZSh2aXNpdG9yOiBhbnksIG5vZGU6IGFueSwgY29udGV4dDogYW55KTogYW55IHtcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmlnZ2VyKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdGF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcmFuc2l0aW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTZXF1ZW5jZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cDpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0R3JvdXAobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXM6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWZyYW1lcyhub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3R5bGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuUmVmZXJlbmNlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlQ2hpbGQobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZVJlZjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZVJlZihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UXVlcnkobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlcjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3RhZ2dlcihub2RlLCBjb250ZXh0KTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgaW52YWxpZE5vZGVUeXBlKG5vZGUudHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAoPGFueT53aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSlbcHJvcF07XG59XG4iXX0=