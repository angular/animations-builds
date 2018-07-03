/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE, style } from '@angular/animations';
import { getOrSetAsInMap } from '../render/shared';
import { NG_ANIMATING_SELECTOR, NG_TRIGGER_SELECTOR, SUBSTITUTION_EXPR_START, copyObj, extractStyleParams, iteratorToArray, normalizeAnimationEntry, resolveTiming, validateStyleParams, visitDslNode } from '../util';
import { parseTransitionExpr } from './animation_transition_expr';
const /** @type {?} */ SELF_TOKEN = ':self';
const /** @type {?} */ SELF_TOKEN_REGEX = new RegExp(`\s*${SELF_TOKEN}\s*,?`, 'g');
/**
 * @param {?} driver
 * @param {?} metadata
 * @param {?} errors
 * @return {?}
 */
export function buildAnimationAst(driver, metadata, errors) {
    return new AnimationAstBuilderVisitor(driver).build(metadata, errors);
}
const /** @type {?} */ ROOT_SELECTOR = '';
export class AnimationAstBuilderVisitor {
    /**
     * @param {?} _driver
     */
    constructor(_driver) {
        this._driver = _driver;
    }
    /**
     * @param {?} metadata
     * @param {?} errors
     * @return {?}
     */
    build(metadata, errors) {
        const /** @type {?} */ context = new AnimationAstBuilderContext(errors);
        this._resetContextStyleTimingState(context);
        return /** @type {?} */ (visitDslNode(this, normalizeAnimationEntry(metadata), context));
    }
    /**
     * @param {?} context
     * @return {?}
     */
    _resetContextStyleTimingState(context) {
        context.currentQuerySelector = ROOT_SELECTOR;
        context.collectedStyles = {};
        context.collectedStyles[ROOT_SELECTOR] = {};
        context.currentTime = 0;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitTrigger(metadata, context) {
        let /** @type {?} */ queryCount = context.queryCount = 0;
        let /** @type {?} */ depCount = context.depCount = 0;
        const /** @type {?} */ states = [];
        const /** @type {?} */ transitions = [];
        if (metadata.name.charAt(0) == '@') {
            context.errors.push('animation triggers cannot be prefixed with an `@` sign (e.g. trigger(\'@foo\', [...]))');
        }
        metadata.definitions.forEach(def => {
            this._resetContextStyleTimingState(context);
            if (def.type == 0 /* State */) {
                const /** @type {?} */ stateDef = /** @type {?} */ (def);
                const /** @type {?} */ name = stateDef.name;
                name.toString().split(/\s*,\s*/).forEach(n => {
                    stateDef.name = n;
                    states.push(this.visitState(stateDef, context));
                });
                stateDef.name = name;
            }
            else if (def.type == 1 /* Transition */) {
                const /** @type {?} */ transition = this.visitTransition(/** @type {?} */ (def), context);
                queryCount += transition.queryCount;
                depCount += transition.depCount;
                transitions.push(transition);
            }
            else {
                context.errors.push('only state() and transition() definitions can sit inside of a trigger()');
            }
        });
        return {
            type: 7 /* Trigger */,
            name: metadata.name, states, transitions, queryCount, depCount,
            options: null
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitState(metadata, context) {
        const /** @type {?} */ styleAst = this.visitStyle(metadata.styles, context);
        const /** @type {?} */ astParams = (metadata.options && metadata.options.params) || null;
        if (styleAst.containsDynamicStyles) {
            const /** @type {?} */ missingSubs = new Set();
            const /** @type {?} */ params = astParams || {};
            styleAst.styles.forEach(value => {
                if (isObject(value)) {
                    const /** @type {?} */ stylesObj = /** @type {?} */ (value);
                    Object.keys(stylesObj).forEach(prop => {
                        extractStyleParams(stylesObj[prop]).forEach(sub => {
                            if (!params.hasOwnProperty(sub)) {
                                missingSubs.add(sub);
                            }
                        });
                    });
                }
            });
            if (missingSubs.size) {
                const /** @type {?} */ missingSubsArr = iteratorToArray(missingSubs.values());
                context.errors.push(`state("${metadata.name}", ...) must define default values for all the following style substitutions: ${missingSubsArr.join(', ')}`);
            }
        }
        return {
            type: 0 /* State */,
            name: metadata.name,
            style: styleAst,
            options: astParams ? { params: astParams } : null
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitTransition(metadata, context) {
        context.queryCount = 0;
        context.depCount = 0;
        const /** @type {?} */ animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
        const /** @type {?} */ matchers = parseTransitionExpr(metadata.expr, context.errors);
        return {
            type: 1 /* Transition */,
            matchers,
            animation,
            queryCount: context.queryCount,
            depCount: context.depCount,
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitSequence(metadata, context) {
        return {
            type: 2 /* Sequence */,
            steps: metadata.steps.map(s => visitDslNode(this, s, context)),
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitGroup(metadata, context) {
        const /** @type {?} */ currentTime = context.currentTime;
        let /** @type {?} */ furthestTime = 0;
        const /** @type {?} */ steps = metadata.steps.map(step => {
            context.currentTime = currentTime;
            const /** @type {?} */ innerAst = visitDslNode(this, step, context);
            furthestTime = Math.max(furthestTime, context.currentTime);
            return innerAst;
        });
        context.currentTime = furthestTime;
        return {
            type: 3 /* Group */,
            steps,
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitAnimate(metadata, context) {
        const /** @type {?} */ timingAst = constructTimingAst(metadata.timings, context.errors);
        context.currentAnimateTimings = timingAst;
        let /** @type {?} */ styleAst;
        let /** @type {?} */ styleMetadata = metadata.styles ? metadata.styles : style({});
        if (styleMetadata.type == 5 /* Keyframes */) {
            styleAst = this.visitKeyframes(/** @type {?} */ (styleMetadata), context);
        }
        else {
            let /** @type {?} */ styleMetadata = /** @type {?} */ (metadata.styles);
            let /** @type {?} */ isEmpty = false;
            if (!styleMetadata) {
                isEmpty = true;
                const /** @type {?} */ newStyleData = {};
                if (timingAst.easing) {
                    newStyleData['easing'] = timingAst.easing;
                }
                styleMetadata = style(newStyleData);
            }
            context.currentTime += timingAst.duration + timingAst.delay;
            const /** @type {?} */ _styleAst = this.visitStyle(styleMetadata, context);
            _styleAst.isEmptyStep = isEmpty;
            styleAst = _styleAst;
        }
        context.currentAnimateTimings = null;
        return {
            type: 4 /* Animate */,
            timings: timingAst,
            style: styleAst,
            options: null
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitStyle(metadata, context) {
        const /** @type {?} */ ast = this._makeStyleAst(metadata, context);
        this._validateStyleAst(ast, context);
        return ast;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    _makeStyleAst(metadata, context) {
        const /** @type {?} */ styles = [];
        if (Array.isArray(metadata.styles)) {
            (/** @type {?} */ (metadata.styles)).forEach(styleTuple => {
                if (typeof styleTuple == 'string') {
                    if (styleTuple == AUTO_STYLE) {
                        styles.push(/** @type {?} */ (styleTuple));
                    }
                    else {
                        context.errors.push(`The provided style string value ${styleTuple} is not allowed.`);
                    }
                }
                else {
                    styles.push(/** @type {?} */ (styleTuple));
                }
            });
        }
        else {
            styles.push(metadata.styles);
        }
        let /** @type {?} */ containsDynamicStyles = false;
        let /** @type {?} */ collectedEasing = null;
        styles.forEach(styleData => {
            if (isObject(styleData)) {
                const /** @type {?} */ styleMap = /** @type {?} */ (styleData);
                const /** @type {?} */ easing = styleMap['easing'];
                if (easing) {
                    collectedEasing = /** @type {?} */ (easing);
                    delete styleMap['easing'];
                }
                if (!containsDynamicStyles) {
                    for (let /** @type {?} */ prop in styleMap) {
                        const /** @type {?} */ value = styleMap[prop];
                        if (value.toString().indexOf(SUBSTITUTION_EXPR_START) >= 0) {
                            containsDynamicStyles = true;
                            break;
                        }
                    }
                }
            }
        });
        return {
            type: 6 /* Style */,
            styles,
            easing: collectedEasing,
            offset: metadata.offset, containsDynamicStyles,
            options: null
        };
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    _validateStyleAst(ast, context) {
        const /** @type {?} */ timings = context.currentAnimateTimings;
        let /** @type {?} */ endTime = context.currentTime;
        let /** @type {?} */ startTime = context.currentTime;
        if (timings && startTime > 0) {
            startTime -= timings.duration + timings.delay;
        }
        ast.styles.forEach(tuple => {
            if (typeof tuple == 'string')
                return;
            Object.keys(tuple).forEach(prop => {
                if (!this._driver.validateStyleProperty(prop)) {
                    context.errors.push(`The provided animation property "${prop}" is not a supported CSS property for animations`);
                    return;
                }
                const /** @type {?} */ collectedStyles = context.collectedStyles[/** @type {?} */ ((context.currentQuerySelector))];
                const /** @type {?} */ collectedEntry = collectedStyles[prop];
                let /** @type {?} */ updateCollectedStyle = true;
                if (collectedEntry) {
                    if (startTime != endTime && startTime >= collectedEntry.startTime &&
                        endTime <= collectedEntry.endTime) {
                        context.errors.push(`The CSS property "${prop}" that exists between the times of "${collectedEntry.startTime}ms" and "${collectedEntry.endTime}ms" is also being animated in a parallel animation between the times of "${startTime}ms" and "${endTime}ms"`);
                        updateCollectedStyle = false;
                    }
                    // we always choose the smaller start time value since we
                    // want to have a record of the entire animation window where
                    // the style property is being animated in between
                    startTime = collectedEntry.startTime;
                }
                if (updateCollectedStyle) {
                    collectedStyles[prop] = { startTime, endTime };
                }
                if (context.options) {
                    validateStyleParams(tuple[prop], context.options, context.errors);
                }
            });
        });
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitKeyframes(metadata, context) {
        const /** @type {?} */ ast = { type: 5 /* Keyframes */, styles: [], options: null };
        if (!context.currentAnimateTimings) {
            context.errors.push(`keyframes() must be placed inside of a call to animate()`);
            return ast;
        }
        const /** @type {?} */ MAX_KEYFRAME_OFFSET = 1;
        let /** @type {?} */ totalKeyframesWithOffsets = 0;
        const /** @type {?} */ offsets = [];
        let /** @type {?} */ offsetsOutOfOrder = false;
        let /** @type {?} */ keyframesOutOfRange = false;
        let /** @type {?} */ previousOffset = 0;
        const /** @type {?} */ keyframes = metadata.steps.map(styles => {
            const /** @type {?} */ style = this._makeStyleAst(styles, context);
            let /** @type {?} */ offsetVal = style.offset != null ? style.offset : consumeOffset(style.styles);
            let /** @type {?} */ offset = 0;
            if (offsetVal != null) {
                totalKeyframesWithOffsets++;
                offset = style.offset = offsetVal;
            }
            keyframesOutOfRange = keyframesOutOfRange || offset < 0 || offset > 1;
            offsetsOutOfOrder = offsetsOutOfOrder || offset < previousOffset;
            previousOffset = offset;
            offsets.push(offset);
            return style;
        });
        if (keyframesOutOfRange) {
            context.errors.push(`Please ensure that all keyframe offsets are between 0 and 1`);
        }
        if (offsetsOutOfOrder) {
            context.errors.push(`Please ensure that all keyframe offsets are in order`);
        }
        const /** @type {?} */ length = metadata.steps.length;
        let /** @type {?} */ generatedOffset = 0;
        if (totalKeyframesWithOffsets > 0 && totalKeyframesWithOffsets < length) {
            context.errors.push(`Not all style() steps within the declared keyframes() contain offsets`);
        }
        else if (totalKeyframesWithOffsets == 0) {
            generatedOffset = MAX_KEYFRAME_OFFSET / (length - 1);
        }
        const /** @type {?} */ limit = length - 1;
        const /** @type {?} */ currentTime = context.currentTime;
        const /** @type {?} */ currentAnimateTimings = /** @type {?} */ ((context.currentAnimateTimings));
        const /** @type {?} */ animateDuration = currentAnimateTimings.duration;
        keyframes.forEach((kf, i) => {
            const /** @type {?} */ offset = generatedOffset > 0 ? (i == limit ? 1 : (generatedOffset * i)) : offsets[i];
            const /** @type {?} */ durationUpToThisFrame = offset * animateDuration;
            context.currentTime = currentTime + currentAnimateTimings.delay + durationUpToThisFrame;
            currentAnimateTimings.duration = durationUpToThisFrame;
            this._validateStyleAst(kf, context);
            kf.offset = offset;
            ast.styles.push(kf);
        });
        return ast;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitReference(metadata, context) {
        return {
            type: 8 /* Reference */,
            animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context),
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitAnimateChild(metadata, context) {
        context.depCount++;
        return {
            type: 9 /* AnimateChild */,
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitAnimateRef(metadata, context) {
        return {
            type: 10 /* AnimateRef */,
            animation: this.visitReference(metadata.animation, context),
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitQuery(metadata, context) {
        const /** @type {?} */ parentSelector = /** @type {?} */ ((context.currentQuerySelector));
        const /** @type {?} */ options = /** @type {?} */ ((metadata.options || {}));
        context.queryCount++;
        context.currentQuery = metadata;
        const [selector, includeSelf] = normalizeSelector(metadata.selector);
        context.currentQuerySelector =
            parentSelector.length ? (parentSelector + ' ' + selector) : selector;
        getOrSetAsInMap(context.collectedStyles, context.currentQuerySelector, {});
        const /** @type {?} */ animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
        context.currentQuery = null;
        context.currentQuerySelector = parentSelector;
        return {
            type: 11 /* Query */,
            selector,
            limit: options.limit || 0,
            optional: !!options.optional, includeSelf, animation,
            originalSelector: metadata.selector,
            options: normalizeAnimationOptions(metadata.options)
        };
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitStagger(metadata, context) {
        if (!context.currentQuery) {
            context.errors.push(`stagger() can only be used inside of query()`);
        }
        const /** @type {?} */ timings = metadata.timings === 'full' ?
            { duration: 0, delay: 0, easing: 'full' } :
            resolveTiming(metadata.timings, context.errors, true);
        return {
            type: 12 /* Stagger */,
            animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context), timings,
            options: null
        };
    }
}
function AnimationAstBuilderVisitor_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationAstBuilderVisitor.prototype._driver;
}
/**
 * @param {?} selector
 * @return {?}
 */
function normalizeSelector(selector) {
    const /** @type {?} */ hasAmpersand = selector.split(/\s*,\s*/).find(token => token == SELF_TOKEN) ? true : false;
    if (hasAmpersand) {
        selector = selector.replace(SELF_TOKEN_REGEX, '');
    }
    // the :enter and :leave selectors are filled in at runtime during timeline building
    selector = selector.replace(/@\*/g, NG_TRIGGER_SELECTOR)
        .replace(/@\w+/g, match => NG_TRIGGER_SELECTOR + '-' + match.substr(1))
        .replace(/:animating/g, NG_ANIMATING_SELECTOR);
    return [selector, hasAmpersand];
}
/**
 * @param {?} obj
 * @return {?}
 */
function normalizeParams(obj) {
    return obj ? copyObj(obj) : null;
}
export class AnimationAstBuilderContext {
    /**
     * @param {?} errors
     */
    constructor(errors) {
        this.errors = errors;
        this.queryCount = 0;
        this.depCount = 0;
        this.currentTransition = null;
        this.currentQuery = null;
        this.currentQuerySelector = null;
        this.currentAnimateTimings = null;
        this.currentTime = 0;
        this.collectedStyles = {};
        this.options = null;
    }
}
function AnimationAstBuilderContext_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationAstBuilderContext.prototype.queryCount;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.depCount;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.currentTransition;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.currentQuery;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.currentQuerySelector;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.currentAnimateTimings;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.currentTime;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.collectedStyles;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.options;
    /** @type {?} */
    AnimationAstBuilderContext.prototype.errors;
}
/**
 * @param {?} styles
 * @return {?}
 */
function consumeOffset(styles) {
    if (typeof styles == 'string')
        return null;
    let /** @type {?} */ offset = null;
    if (Array.isArray(styles)) {
        styles.forEach(styleTuple => {
            if (isObject(styleTuple) && styleTuple.hasOwnProperty('offset')) {
                const /** @type {?} */ obj = /** @type {?} */ (styleTuple);
                offset = parseFloat(/** @type {?} */ (obj['offset']));
                delete obj['offset'];
            }
        });
    }
    else if (isObject(styles) && styles.hasOwnProperty('offset')) {
        const /** @type {?} */ obj = /** @type {?} */ (styles);
        offset = parseFloat(/** @type {?} */ (obj['offset']));
        delete obj['offset'];
    }
    return offset;
}
/**
 * @param {?} value
 * @return {?}
 */
function isObject(value) {
    return !Array.isArray(value) && typeof value == 'object';
}
/**
 * @param {?} value
 * @param {?} errors
 * @return {?}
 */
function constructTimingAst(value, errors) {
    let /** @type {?} */ timings = null;
    if (value.hasOwnProperty('duration')) {
        timings = /** @type {?} */ (value);
    }
    else if (typeof value == 'number') {
        const /** @type {?} */ duration = resolveTiming(/** @type {?} */ (value), errors).duration;
        return makeTimingAst(/** @type {?} */ (duration), 0, '');
    }
    const /** @type {?} */ strValue = /** @type {?} */ (value);
    const /** @type {?} */ isDynamic = strValue.split(/\s+/).some(v => v.charAt(0) == '{' && v.charAt(1) == '{');
    if (isDynamic) {
        const /** @type {?} */ ast = /** @type {?} */ (makeTimingAst(0, 0, ''));
        ast.dynamic = true;
        ast.strValue = strValue;
        return /** @type {?} */ (ast);
    }
    timings = timings || resolveTiming(strValue, errors);
    return makeTimingAst(timings.duration, timings.delay, timings.easing);
}
/**
 * @param {?} options
 * @return {?}
 */
function normalizeAnimationOptions(options) {
    if (options) {
        options = copyObj(options);
        if (options['params']) {
            options['params'] = /** @type {?} */ ((normalizeParams(options['params'])));
        }
    }
    else {
        options = {};
    }
    return options;
}
/**
 * @param {?} duration
 * @param {?} delay
 * @param {?} easing
 * @return {?}
 */
function makeTimingAst(duration, delay, easing) {
    return { duration, delay, easing };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2FzdF9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9kc2wvYW5pbWF0aW9uX2FzdF9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxPQUFPLEVBQUMsVUFBVSxFQUF1YyxLQUFLLEVBQWEsTUFBTSxxQkFBcUIsQ0FBQztBQUd2Z0IsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBaUMscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsdUJBQXVCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBSXJQLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBRWhFLHVCQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDM0IsdUJBQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxVQUFVLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7OztBQXNDbEUsTUFBTSw0QkFDRixNQUF1QixFQUFFLFFBQWlELEVBQzFFLE1BQWE7SUFDZixPQUFPLElBQUksMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUN2RTtBQUVELHVCQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFFekIsTUFBTTs7OztJQUNKLFlBQW9CLE9BQXdCO1FBQXhCLFlBQU8sR0FBUCxPQUFPLENBQWlCO0tBQUk7Ozs7OztJQUVoRCxLQUFLLENBQUMsUUFBK0MsRUFBRSxNQUFhO1FBRWxFLHVCQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFD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QUFFRCxtQ0FBbUMsT0FBZ0M7SUFDakUsSUFBSSxPQUFPLEVBQUU7UUFDWCxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxRQUFRLENBQUMsc0JBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDMUQ7S0FDRjtTQUFNO1FBQ0wsT0FBTyxHQUFHLEVBQUUsQ0FBQztLQUNkO0lBQ0QsT0FBTyxPQUFPLENBQUM7Q0FDaEI7Ozs7Ozs7QUFFRCx1QkFBdUIsUUFBZ0IsRUFBRSxLQUFhLEVBQUUsTUFBcUI7SUFDM0UsT0FBTyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUM7Q0FDbEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGVUaW1pbmdzLCBBbmltYXRpb25BbmltYXRlQ2hpbGRNZXRhZGF0YSwgQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhLCBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEsIEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEsIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEsIEFuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25NZXRhZGF0YVR5cGUsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEsIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucywgQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEsIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEsIEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSwgQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSwgQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSwgQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhLCBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEsIHN0eWxlLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0QXNJbk1hcH0gZnJvbSAnLi4vcmVuZGVyL3NoYXJlZCc7XG5pbXBvcnQge0VOVEVSX1NFTEVDVE9SLCBMRUFWRV9TRUxFQ1RPUiwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCBOR19UUklHR0VSX1NFTEVDVE9SLCBTVUJTVElUVVRJT05fRVhQUl9TVEFSVCwgY29weU9iaiwgZXh0cmFjdFN0eWxlUGFyYW1zLCBpdGVyYXRvclRvQXJyYXksIG5vcm1hbGl6ZUFuaW1hdGlvbkVudHJ5LCByZXNvbHZlVGltaW5nLCB2YWxpZGF0ZVN0eWxlUGFyYW1zLCB2aXNpdERzbE5vZGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGVBc3QsIEFuaW1hdGVDaGlsZEFzdCwgQW5pbWF0ZVJlZkFzdCwgQXN0LCBEeW5hbWljVGltaW5nQXN0LCBHcm91cEFzdCwgS2V5ZnJhbWVzQXN0LCBRdWVyeUFzdCwgUmVmZXJlbmNlQXN0LCBTZXF1ZW5jZUFzdCwgU3RhZ2dlckFzdCwgU3RhdGVBc3QsIFN0eWxlQXN0LCBUaW1pbmdBc3QsIFRyYW5zaXRpb25Bc3QsIFRyaWdnZXJBc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge0FuaW1hdGlvbkRzbFZpc2l0b3J9IGZyb20gJy4vYW5pbWF0aW9uX2RzbF92aXNpdG9yJztcbmltcG9ydCB7cGFyc2VUcmFuc2l0aW9uRXhwcn0gZnJvbSAnLi9hbmltYXRpb25fdHJhbnNpdGlvbl9leHByJztcblxuY29uc3QgU0VMRl9UT0tFTiA9ICc6c2VsZic7XG5jb25zdCBTRUxGX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChgXFxzKiR7U0VMRl9UT0tFTn1cXHMqLD9gLCAnZycpO1xuXG4vKlxuICogW1ZhbGlkYXRpb25dXG4gKiBUaGUgdmlzaXRvciBjb2RlIGJlbG93IHdpbGwgdHJhdmVyc2UgdGhlIGFuaW1hdGlvbiBBU1QgZ2VuZXJhdGVkIGJ5IHRoZSBhbmltYXRpb24gdmVyYiBmdW5jdGlvbnNcbiAqICh0aGUgb3V0cHV0IGlzIGEgdHJlZSBvZiBvYmplY3RzKSBhbmQgYXR0ZW1wdCB0byBwZXJmb3JtIGEgc2VyaWVzIG9mIHZhbGlkYXRpb25zIG9uIHRoZSBkYXRhLiBUaGVcbiAqIGZvbGxvd2luZyBjb3JuZXItY2FzZXMgd2lsbCBiZSB2YWxpZGF0ZWQ6XG4gKlxuICogMS4gT3ZlcmxhcCBvZiBhbmltYXRpb25zXG4gKiBHaXZlbiB0aGF0IGEgQ1NTIHByb3BlcnR5IGNhbm5vdCBiZSBhbmltYXRlZCBpbiBtb3JlIHRoYW4gb25lIHBsYWNlIGF0IHRoZSBzYW1lIHRpbWUsIGl0J3NcbiAqIGltcG9ydGFudCB0aGF0IHRoaXMgYmVoYXZpb3VyIGlzIGRldGVjdGVkIGFuZCB2YWxpZGF0ZWQuIFRoZSB3YXkgaW4gd2hpY2ggdGhpcyBvY2N1cnMgaXMgdGhhdFxuICogZWFjaCB0aW1lIGEgc3R5bGUgcHJvcGVydHkgaXMgZXhhbWluZWQsIGEgc3RyaW5nLW1hcCBjb250YWluaW5nIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIHVwZGF0ZWQgd2l0aFxuICogdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXMgZm9yIHdoZW4gdGhlIHByb3BlcnR5IGlzIHVzZWQgd2l0aGluIGFuIGFuaW1hdGlvbiBzdGVwLlxuICpcbiAqIElmIHRoZXJlIGFyZSB0d28gb3IgbW9yZSBwYXJhbGxlbCBhbmltYXRpb25zIHRoYXQgYXJlIGN1cnJlbnRseSBydW5uaW5nICh0aGVzZSBhcmUgaW52b2tlZCBieSB0aGVcbiAqIGdyb3VwKCkpIG9uIHRoZSBzYW1lIGVsZW1lbnQgdGhlbiB0aGUgdmFsaWRhdG9yIHdpbGwgdGhyb3cgYW4gZXJyb3IuIFNpbmNlIHRoZSBzdGFydC9lbmQgdGltaW5nXG4gKiB2YWx1ZXMgYXJlIGNvbGxlY3RlZCBmb3IgZWFjaCBwcm9wZXJ0eSB0aGVuIGlmIHRoZSBjdXJyZW50IGFuaW1hdGlvbiBzdGVwIGlzIGFuaW1hdGluZyB0aGUgc2FtZVxuICogcHJvcGVydHkgYW5kIGl0cyB0aW1pbmcgdmFsdWVzIGZhbGwgYW55d2hlcmUgaW50byB0aGUgd2luZG93IG9mIHRpbWUgdGhhdCB0aGUgcHJvcGVydHkgaXNcbiAqIGN1cnJlbnRseSBiZWluZyBhbmltYXRlZCB3aXRoaW4gdGhlbiB0aGlzIGlzIHdoYXQgY2F1c2VzIGFuIGVycm9yLlxuICpcbiAqIDIuIFRpbWluZyB2YWx1ZXNcbiAqIFRoZSB2YWxpZGF0b3Igd2lsbCB2YWxpZGF0ZSB0byBzZWUgaWYgYSB0aW1pbmcgdmFsdWUgb2YgYGR1cmF0aW9uIGRlbGF5IGVhc2luZ2Agb3JcbiAqIGBkdXJhdGlvbk51bWJlcmAgaXMgdmFsaWQgb3Igbm90LlxuICpcbiAqIChub3RlIHRoYXQgdXBvbiB2YWxpZGF0aW9uIHRoZSBjb2RlIGJlbG93IHdpbGwgcmVwbGFjZSB0aGUgdGltaW5nIGRhdGEgd2l0aCBhbiBvYmplY3QgY29udGFpbmluZ1xuICoge2R1cmF0aW9uLGRlbGF5LGVhc2luZ30uXG4gKlxuICogMy4gT2Zmc2V0IFZhbGlkYXRpb25cbiAqIEVhY2ggb2YgdGhlIHN0eWxlKCkgY2FsbHMgYXJlIGFsbG93ZWQgdG8gaGF2ZSBhbiBvZmZzZXQgdmFsdWUgd2hlbiBwbGFjZWQgaW5zaWRlIG9mIGtleWZyYW1lcygpLlxuICogT2Zmc2V0cyB3aXRoaW4ga2V5ZnJhbWVzKCkgYXJlIGNvbnNpZGVyZWQgdmFsaWQgd2hlbjpcbiAqXG4gKiAgIC0gTm8gb2Zmc2V0cyBhcmUgdXNlZCBhdCBhbGxcbiAqICAgLSBFYWNoIHN0eWxlKCkgZW50cnkgY29udGFpbnMgYW4gb2Zmc2V0IHZhbHVlXG4gKiAgIC0gRWFjaCBvZmZzZXQgaXMgYmV0d2VlbiAwIGFuZCAxXG4gKiAgIC0gRWFjaCBvZmZzZXQgaXMgZ3JlYXRlciB0byBvciBlcXVhbCB0aGFuIHRoZSBwcmV2aW91cyBvbmVcbiAqXG4gKiBPdGhlcndpc2UgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFuaW1hdGlvbkFzdChcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgbWV0YWRhdGE6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBlcnJvcnM6IGFueVtdKTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4ge1xuICByZXR1cm4gbmV3IEFuaW1hdGlvbkFzdEJ1aWxkZXJWaXNpdG9yKGRyaXZlcikuYnVpbGQobWV0YWRhdGEsIGVycm9ycyk7XG59XG5cbmNvbnN0IFJPT1RfU0VMRUNUT1IgPSAnJztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkFzdEJ1aWxkZXJWaXNpdG9yIGltcGxlbWVudHMgQW5pbWF0aW9uRHNsVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyKSB7fVxuXG4gIGJ1aWxkKG1ldGFkYXRhOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdLCBlcnJvcnM6IGFueVtdKTpcbiAgICAgIEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gbmV3IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KGVycm9ycyk7XG4gICAgdGhpcy5fcmVzZXRDb250ZXh0U3R5bGVUaW1pbmdTdGF0ZShjb250ZXh0KTtcbiAgICByZXR1cm4gPEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+PnZpc2l0RHNsTm9kZShcbiAgICAgICAgdGhpcywgbm9ybWFsaXplQW5pbWF0aW9uRW50cnkobWV0YWRhdGEpLCBjb250ZXh0KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc2V0Q29udGV4dFN0eWxlVGltaW5nU3RhdGUoY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpIHtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVNlbGVjdG9yID0gUk9PVF9TRUxFQ1RPUjtcbiAgICBjb250ZXh0LmNvbGxlY3RlZFN0eWxlcyA9IHt9O1xuICAgIGNvbnRleHQuY29sbGVjdGVkU3R5bGVzW1JPT1RfU0VMRUNUT1JdID0ge307XG4gICAgY29udGV4dC5jdXJyZW50VGltZSA9IDA7XG4gIH1cblxuICB2aXNpdFRyaWdnZXIobWV0YWRhdGE6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSwgY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpOlxuICAgICAgVHJpZ2dlckFzdCB7XG4gICAgbGV0IHF1ZXJ5Q291bnQgPSBjb250ZXh0LnF1ZXJ5Q291bnQgPSAwO1xuICAgIGxldCBkZXBDb3VudCA9IGNvbnRleHQuZGVwQ291bnQgPSAwO1xuICAgIGNvbnN0IHN0YXRlczogU3RhdGVBc3RbXSA9IFtdO1xuICAgIGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uQXN0W10gPSBbXTtcbiAgICBpZiAobWV0YWRhdGEubmFtZS5jaGFyQXQoMCkgPT0gJ0AnKSB7XG4gICAgICBjb250ZXh0LmVycm9ycy5wdXNoKFxuICAgICAgICAgICdhbmltYXRpb24gdHJpZ2dlcnMgY2Fubm90IGJlIHByZWZpeGVkIHdpdGggYW4gYEBgIHNpZ24gKGUuZy4gdHJpZ2dlcihcXCdAZm9vXFwnLCBbLi4uXSkpJyk7XG4gICAgfVxuXG4gICAgbWV0YWRhdGEuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWYgPT4ge1xuICAgICAgdGhpcy5fcmVzZXRDb250ZXh0U3R5bGVUaW1pbmdTdGF0ZShjb250ZXh0KTtcbiAgICAgIGlmIChkZWYudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGUpIHtcbiAgICAgICAgY29uc3Qgc3RhdGVEZWYgPSBkZWYgYXMgQW5pbWF0aW9uU3RhdGVNZXRhZGF0YTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHN0YXRlRGVmLm5hbWU7XG4gICAgICAgIG5hbWUudG9TdHJpbmcoKS5zcGxpdCgvXFxzKixcXHMqLykuZm9yRWFjaChuID0+IHtcbiAgICAgICAgICBzdGF0ZURlZi5uYW1lID0gbjtcbiAgICAgICAgICBzdGF0ZXMucHVzaCh0aGlzLnZpc2l0U3RhdGUoc3RhdGVEZWYsIGNvbnRleHQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHN0YXRlRGVmLm5hbWUgPSBuYW1lO1xuICAgICAgfSBlbHNlIGlmIChkZWYudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbikge1xuICAgICAgICBjb25zdCB0cmFuc2l0aW9uID0gdGhpcy52aXNpdFRyYW5zaXRpb24oZGVmIGFzIEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSwgY29udGV4dCk7XG4gICAgICAgIHF1ZXJ5Q291bnQgKz0gdHJhbnNpdGlvbi5xdWVyeUNvdW50O1xuICAgICAgICBkZXBDb3VudCArPSB0cmFuc2l0aW9uLmRlcENvdW50O1xuICAgICAgICB0cmFuc2l0aW9ucy5wdXNoKHRyYW5zaXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5lcnJvcnMucHVzaChcbiAgICAgICAgICAgICdvbmx5IHN0YXRlKCkgYW5kIHRyYW5zaXRpb24oKSBkZWZpbml0aW9ucyBjYW4gc2l0IGluc2lkZSBvZiBhIHRyaWdnZXIoKScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyLFxuICAgICAgbmFtZTogbWV0YWRhdGEubmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgcXVlcnlDb3VudCwgZGVwQ291bnQsXG4gICAgICBvcHRpb25zOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0U3RhdGUobWV0YWRhdGE6IEFuaW1hdGlvblN0YXRlTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTogU3RhdGVBc3Qge1xuICAgIGNvbnN0IHN0eWxlQXN0ID0gdGhpcy52aXNpdFN0eWxlKG1ldGFkYXRhLnN0eWxlcywgY29udGV4dCk7XG4gICAgY29uc3QgYXN0UGFyYW1zID0gKG1ldGFkYXRhLm9wdGlvbnMgJiYgbWV0YWRhdGEub3B0aW9ucy5wYXJhbXMpIHx8IG51bGw7XG4gICAgaWYgKHN0eWxlQXN0LmNvbnRhaW5zRHluYW1pY1N0eWxlcykge1xuICAgICAgY29uc3QgbWlzc2luZ1N1YnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IGFzdFBhcmFtcyB8fCB7fTtcbiAgICAgIHN0eWxlQXN0LnN0eWxlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgIGNvbnN0IHN0eWxlc09iaiA9IHZhbHVlIGFzIGFueTtcbiAgICAgICAgICBPYmplY3Qua2V5cyhzdHlsZXNPYmopLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgICBleHRyYWN0U3R5bGVQYXJhbXMoc3R5bGVzT2JqW3Byb3BdKS5mb3JFYWNoKHN1YiA9PiB7XG4gICAgICAgICAgICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHN1YikpIHtcbiAgICAgICAgICAgICAgICBtaXNzaW5nU3Vicy5hZGQoc3ViKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKG1pc3NpbmdTdWJzLnNpemUpIHtcbiAgICAgICAgY29uc3QgbWlzc2luZ1N1YnNBcnIgPSBpdGVyYXRvclRvQXJyYXkobWlzc2luZ1N1YnMudmFsdWVzKCkpO1xuICAgICAgICBjb250ZXh0LmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgYHN0YXRlKFwiJHttZXRhZGF0YS5uYW1lfVwiLCAuLi4pIG11c3QgZGVmaW5lIGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgdGhlIGZvbGxvd2luZyBzdHlsZSBzdWJzdGl0dXRpb25zOiAke21pc3NpbmdTdWJzQXJyLmpvaW4oJywgJyl9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZSxcbiAgICAgIG5hbWU6IG1ldGFkYXRhLm5hbWUsXG4gICAgICBzdHlsZTogc3R5bGVBc3QsXG4gICAgICBvcHRpb25zOiBhc3RQYXJhbXMgPyB7cGFyYW1zOiBhc3RQYXJhbXN9IDogbnVsbFxuICAgIH07XG4gIH1cblxuICB2aXNpdFRyYW5zaXRpb24obWV0YWRhdGE6IEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSwgY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpOlxuICAgICAgVHJhbnNpdGlvbkFzdCB7XG4gICAgY29udGV4dC5xdWVyeUNvdW50ID0gMDtcbiAgICBjb250ZXh0LmRlcENvdW50ID0gMDtcbiAgICBjb25zdCBhbmltYXRpb24gPSB2aXNpdERzbE5vZGUodGhpcywgbm9ybWFsaXplQW5pbWF0aW9uRW50cnkobWV0YWRhdGEuYW5pbWF0aW9uKSwgY29udGV4dCk7XG4gICAgY29uc3QgbWF0Y2hlcnMgPSBwYXJzZVRyYW5zaXRpb25FeHByKG1ldGFkYXRhLmV4cHIsIGNvbnRleHQuZXJyb3JzKTtcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbixcbiAgICAgIG1hdGNoZXJzLFxuICAgICAgYW5pbWF0aW9uLFxuICAgICAgcXVlcnlDb3VudDogY29udGV4dC5xdWVyeUNvdW50LFxuICAgICAgZGVwQ291bnQ6IGNvbnRleHQuZGVwQ291bnQsXG4gICAgICBvcHRpb25zOiBub3JtYWxpemVBbmltYXRpb25PcHRpb25zKG1ldGFkYXRhLm9wdGlvbnMpXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0U2VxdWVuY2UobWV0YWRhdGE6IEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTpcbiAgICAgIFNlcXVlbmNlQXN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLFxuICAgICAgc3RlcHM6IG1ldGFkYXRhLnN0ZXBzLm1hcChzID0+IHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBjb250ZXh0KSksXG4gICAgICBvcHRpb25zOiBub3JtYWxpemVBbmltYXRpb25PcHRpb25zKG1ldGFkYXRhLm9wdGlvbnMpXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0R3JvdXAobWV0YWRhdGE6IEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTogR3JvdXBBc3Qge1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gY29udGV4dC5jdXJyZW50VGltZTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gMDtcbiAgICBjb25zdCBzdGVwcyA9IG1ldGFkYXRhLnN0ZXBzLm1hcChzdGVwID0+IHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGlubmVyQXN0ID0gdmlzaXREc2xOb2RlKHRoaXMsIHN0ZXAsIGNvbnRleHQpO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHJldHVybiBpbm5lckFzdDtcbiAgICB9KTtcblxuICAgIGNvbnRleHQuY3VycmVudFRpbWUgPSBmdXJ0aGVzdFRpbWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cCxcbiAgICAgIHN0ZXBzLFxuICAgICAgb3B0aW9uczogbm9ybWFsaXplQW5pbWF0aW9uT3B0aW9ucyhtZXRhZGF0YS5vcHRpb25zKVxuICAgIH07XG4gIH1cblxuICB2aXNpdEFuaW1hdGUobWV0YWRhdGE6IEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSwgY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpOlxuICAgICAgQW5pbWF0ZUFzdCB7XG4gICAgY29uc3QgdGltaW5nQXN0ID0gY29uc3RydWN0VGltaW5nQXN0KG1ldGFkYXRhLnRpbWluZ3MsIGNvbnRleHQuZXJyb3JzKTtcbiAgICBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IHRpbWluZ0FzdDtcblxuICAgIGxldCBzdHlsZUFzdDogU3R5bGVBc3R8S2V5ZnJhbWVzQXN0O1xuICAgIGxldCBzdHlsZU1ldGFkYXRhOiBBbmltYXRpb25NZXRhZGF0YSA9IG1ldGFkYXRhLnN0eWxlcyA/IG1ldGFkYXRhLnN0eWxlcyA6IHN0eWxlKHt9KTtcbiAgICBpZiAoc3R5bGVNZXRhZGF0YS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMpIHtcbiAgICAgIHN0eWxlQXN0ID0gdGhpcy52aXNpdEtleWZyYW1lcyhzdHlsZU1ldGFkYXRhIGFzIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc3R5bGVNZXRhZGF0YSA9IG1ldGFkYXRhLnN0eWxlcyBhcyBBbmltYXRpb25TdHlsZU1ldGFkYXRhO1xuICAgICAgbGV0IGlzRW1wdHkgPSBmYWxzZTtcbiAgICAgIGlmICghc3R5bGVNZXRhZGF0YSkge1xuICAgICAgICBpc0VtcHR5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmV3U3R5bGVEYXRhOiB7W3Byb3A6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gPSB7fTtcbiAgICAgICAgaWYgKHRpbWluZ0FzdC5lYXNpbmcpIHtcbiAgICAgICAgICBuZXdTdHlsZURhdGFbJ2Vhc2luZyddID0gdGltaW5nQXN0LmVhc2luZztcbiAgICAgICAgfVxuICAgICAgICBzdHlsZU1ldGFkYXRhID0gc3R5bGUobmV3U3R5bGVEYXRhKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWUgKz0gdGltaW5nQXN0LmR1cmF0aW9uICsgdGltaW5nQXN0LmRlbGF5O1xuICAgICAgY29uc3QgX3N0eWxlQXN0ID0gdGhpcy52aXNpdFN0eWxlKHN0eWxlTWV0YWRhdGEsIGNvbnRleHQpO1xuICAgICAgX3N0eWxlQXN0LmlzRW1wdHlTdGVwID0gaXNFbXB0eTtcbiAgICAgIHN0eWxlQXN0ID0gX3N0eWxlQXN0O1xuICAgIH1cblxuICAgIGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGUsXG4gICAgICB0aW1pbmdzOiB0aW1pbmdBc3QsXG4gICAgICBzdHlsZTogc3R5bGVBc3QsXG4gICAgICBvcHRpb25zOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0U3R5bGUobWV0YWRhdGE6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTogU3R5bGVBc3Qge1xuICAgIGNvbnN0IGFzdCA9IHRoaXMuX21ha2VTdHlsZUFzdChtZXRhZGF0YSwgY29udGV4dCk7XG4gICAgdGhpcy5fdmFsaWRhdGVTdHlsZUFzdChhc3QsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF9tYWtlU3R5bGVBc3QobWV0YWRhdGE6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTpcbiAgICAgIFN0eWxlQXN0IHtcbiAgICBjb25zdCBzdHlsZXM6ICjJtVN0eWxlRGF0YSB8IHN0cmluZylbXSA9IFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1ldGFkYXRhLnN0eWxlcykpIHtcbiAgICAgIChtZXRhZGF0YS5zdHlsZXMgYXMoybVTdHlsZURhdGEgfCBzdHJpbmcpW10pLmZvckVhY2goc3R5bGVUdXBsZSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R5bGVUdXBsZSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChzdHlsZVR1cGxlID09IEFVVE9fU1RZTEUpIHtcbiAgICAgICAgICAgIHN0eWxlcy5wdXNoKHN0eWxlVHVwbGUgYXMgc3RyaW5nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5lcnJvcnMucHVzaChgVGhlIHByb3ZpZGVkIHN0eWxlIHN0cmluZyB2YWx1ZSAke3N0eWxlVHVwbGV9IGlzIG5vdCBhbGxvd2VkLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZXMucHVzaChzdHlsZVR1cGxlIGFzIMm1U3R5bGVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlcy5wdXNoKG1ldGFkYXRhLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgbGV0IGNvbnRhaW5zRHluYW1pY1N0eWxlcyA9IGZhbHNlO1xuICAgIGxldCBjb2xsZWN0ZWRFYXNpbmc6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBzdHlsZXMuZm9yRWFjaChzdHlsZURhdGEgPT4ge1xuICAgICAgaWYgKGlzT2JqZWN0KHN0eWxlRGF0YSkpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVNYXAgPSBzdHlsZURhdGEgYXMgybVTdHlsZURhdGE7XG4gICAgICAgIGNvbnN0IGVhc2luZyA9IHN0eWxlTWFwWydlYXNpbmcnXTtcbiAgICAgICAgaWYgKGVhc2luZykge1xuICAgICAgICAgIGNvbGxlY3RlZEVhc2luZyA9IGVhc2luZyBhcyBzdHJpbmc7XG4gICAgICAgICAgZGVsZXRlIHN0eWxlTWFwWydlYXNpbmcnXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbnRhaW5zRHluYW1pY1N0eWxlcykge1xuICAgICAgICAgIGZvciAobGV0IHByb3AgaW4gc3R5bGVNYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVNYXBbcHJvcF07XG4gICAgICAgICAgICBpZiAodmFsdWUudG9TdHJpbmcoKS5pbmRleE9mKFNVQlNUSVRVVElPTl9FWFBSX1NUQVJUKSA+PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnRhaW5zRHluYW1pY1N0eWxlcyA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZSxcbiAgICAgIHN0eWxlcyxcbiAgICAgIGVhc2luZzogY29sbGVjdGVkRWFzaW5nLFxuICAgICAgb2Zmc2V0OiBtZXRhZGF0YS5vZmZzZXQsIGNvbnRhaW5zRHluYW1pY1N0eWxlcyxcbiAgICAgIG9wdGlvbnM6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfdmFsaWRhdGVTdHlsZUFzdChhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBBbmltYXRpb25Bc3RCdWlsZGVyQ29udGV4dCk6IHZvaWQge1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncztcbiAgICBsZXQgZW5kVGltZSA9IGNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgbGV0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgaWYgKHRpbWluZ3MgJiYgc3RhcnRUaW1lID4gMCkge1xuICAgICAgc3RhcnRUaW1lIC09IHRpbWluZ3MuZHVyYXRpb24gKyB0aW1pbmdzLmRlbGF5O1xuICAgIH1cblxuICAgIGFzdC5zdHlsZXMuZm9yRWFjaCh0dXBsZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHR1cGxlID09ICdzdHJpbmcnKSByZXR1cm47XG5cbiAgICAgIE9iamVjdC5rZXlzKHR1cGxlKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2RyaXZlci52YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICBjb250ZXh0LmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgICBgVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiBwcm9wZXJ0eSBcIiR7cHJvcH1cIiBpcyBub3QgYSBzdXBwb3J0ZWQgQ1NTIHByb3BlcnR5IGZvciBhbmltYXRpb25zYCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29sbGVjdGVkU3R5bGVzID0gY29udGV4dC5jb2xsZWN0ZWRTdHlsZXNbY29udGV4dC5jdXJyZW50UXVlcnlTZWxlY3RvciAhXTtcbiAgICAgICAgY29uc3QgY29sbGVjdGVkRW50cnkgPSBjb2xsZWN0ZWRTdHlsZXNbcHJvcF07XG4gICAgICAgIGxldCB1cGRhdGVDb2xsZWN0ZWRTdHlsZSA9IHRydWU7XG4gICAgICAgIGlmIChjb2xsZWN0ZWRFbnRyeSkge1xuICAgICAgICAgIGlmIChzdGFydFRpbWUgIT0gZW5kVGltZSAmJiBzdGFydFRpbWUgPj0gY29sbGVjdGVkRW50cnkuc3RhcnRUaW1lICYmXG4gICAgICAgICAgICAgIGVuZFRpbWUgPD0gY29sbGVjdGVkRW50cnkuZW5kVGltZSkge1xuICAgICAgICAgICAgY29udGV4dC5lcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgICBgVGhlIENTUyBwcm9wZXJ0eSBcIiR7cHJvcH1cIiB0aGF0IGV4aXN0cyBiZXR3ZWVuIHRoZSB0aW1lcyBvZiBcIiR7Y29sbGVjdGVkRW50cnkuc3RhcnRUaW1lfW1zXCIgYW5kIFwiJHtjb2xsZWN0ZWRFbnRyeS5lbmRUaW1lfW1zXCIgaXMgYWxzbyBiZWluZyBhbmltYXRlZCBpbiBhIHBhcmFsbGVsIGFuaW1hdGlvbiBiZXR3ZWVuIHRoZSB0aW1lcyBvZiBcIiR7c3RhcnRUaW1lfW1zXCIgYW5kIFwiJHtlbmRUaW1lfW1zXCJgKTtcbiAgICAgICAgICAgIHVwZGF0ZUNvbGxlY3RlZFN0eWxlID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gd2UgYWx3YXlzIGNob29zZSB0aGUgc21hbGxlciBzdGFydCB0aW1lIHZhbHVlIHNpbmNlIHdlXG4gICAgICAgICAgLy8gd2FudCB0byBoYXZlIGEgcmVjb3JkIG9mIHRoZSBlbnRpcmUgYW5pbWF0aW9uIHdpbmRvdyB3aGVyZVxuICAgICAgICAgIC8vIHRoZSBzdHlsZSBwcm9wZXJ0eSBpcyBiZWluZyBhbmltYXRlZCBpbiBiZXR3ZWVuXG4gICAgICAgICAgc3RhcnRUaW1lID0gY29sbGVjdGVkRW50cnkuc3RhcnRUaW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVwZGF0ZUNvbGxlY3RlZFN0eWxlKSB7XG4gICAgICAgICAgY29sbGVjdGVkU3R5bGVzW3Byb3BdID0ge3N0YXJ0VGltZSwgZW5kVGltZX07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5vcHRpb25zKSB7XG4gICAgICAgICAgdmFsaWRhdGVTdHlsZVBhcmFtcyh0dXBsZVtwcm9wXSwgY29udGV4dC5vcHRpb25zLCBjb250ZXh0LmVycm9ycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRLZXlmcmFtZXMobWV0YWRhdGE6IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTpcbiAgICAgIEtleWZyYW1lc0FzdCB7XG4gICAgY29uc3QgYXN0OiBLZXlmcmFtZXNBc3QgPSB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcywgc3R5bGVzOiBbXSwgb3B0aW9uczogbnVsbH07XG4gICAgaWYgKCFjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncykge1xuICAgICAgY29udGV4dC5lcnJvcnMucHVzaChga2V5ZnJhbWVzKCkgbXVzdCBiZSBwbGFjZWQgaW5zaWRlIG9mIGEgY2FsbCB0byBhbmltYXRlKClgKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgTUFYX0tFWUZSQU1FX09GRlNFVCA9IDE7XG5cbiAgICBsZXQgdG90YWxLZXlmcmFtZXNXaXRoT2Zmc2V0cyA9IDA7XG4gICAgY29uc3Qgb2Zmc2V0czogbnVtYmVyW10gPSBbXTtcbiAgICBsZXQgb2Zmc2V0c091dE9mT3JkZXIgPSBmYWxzZTtcbiAgICBsZXQga2V5ZnJhbWVzT3V0T2ZSYW5nZSA9IGZhbHNlO1xuICAgIGxldCBwcmV2aW91c09mZnNldDogbnVtYmVyID0gMDtcblxuICAgIGNvbnN0IGtleWZyYW1lczogU3R5bGVBc3RbXSA9IG1ldGFkYXRhLnN0ZXBzLm1hcChzdHlsZXMgPT4ge1xuICAgICAgY29uc3Qgc3R5bGUgPSB0aGlzLl9tYWtlU3R5bGVBc3Qoc3R5bGVzLCBjb250ZXh0KTtcbiAgICAgIGxldCBvZmZzZXRWYWw6IG51bWJlcnxudWxsID1cbiAgICAgICAgICBzdHlsZS5vZmZzZXQgIT0gbnVsbCA/IHN0eWxlLm9mZnNldCA6IGNvbnN1bWVPZmZzZXQoc3R5bGUuc3R5bGVzKTtcbiAgICAgIGxldCBvZmZzZXQ6IG51bWJlciA9IDA7XG4gICAgICBpZiAob2Zmc2V0VmFsICE9IG51bGwpIHtcbiAgICAgICAgdG90YWxLZXlmcmFtZXNXaXRoT2Zmc2V0cysrO1xuICAgICAgICBvZmZzZXQgPSBzdHlsZS5vZmZzZXQgPSBvZmZzZXRWYWw7XG4gICAgICB9XG4gICAgICBrZXlmcmFtZXNPdXRPZlJhbmdlID0ga2V5ZnJhbWVzT3V0T2ZSYW5nZSB8fCBvZmZzZXQgPCAwIHx8IG9mZnNldCA+IDE7XG4gICAgICBvZmZzZXRzT3V0T2ZPcmRlciA9IG9mZnNldHNPdXRPZk9yZGVyIHx8IG9mZnNldCA8IHByZXZpb3VzT2Zmc2V0O1xuICAgICAgcHJldmlvdXNPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICBvZmZzZXRzLnB1c2gob2Zmc2V0KTtcbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9KTtcblxuICAgIGlmIChrZXlmcmFtZXNPdXRPZlJhbmdlKSB7XG4gICAgICBjb250ZXh0LmVycm9ycy5wdXNoKGBQbGVhc2UgZW5zdXJlIHRoYXQgYWxsIGtleWZyYW1lIG9mZnNldHMgYXJlIGJldHdlZW4gMCBhbmQgMWApO1xuICAgIH1cblxuICAgIGlmIChvZmZzZXRzT3V0T2ZPcmRlcikge1xuICAgICAgY29udGV4dC5lcnJvcnMucHVzaChgUGxlYXNlIGVuc3VyZSB0aGF0IGFsbCBrZXlmcmFtZSBvZmZzZXRzIGFyZSBpbiBvcmRlcmApO1xuICAgIH1cblxuICAgIGNvbnN0IGxlbmd0aCA9IG1ldGFkYXRhLnN0ZXBzLmxlbmd0aDtcbiAgICBsZXQgZ2VuZXJhdGVkT2Zmc2V0ID0gMDtcbiAgICBpZiAodG90YWxLZXlmcmFtZXNXaXRoT2Zmc2V0cyA+IDAgJiYgdG90YWxLZXlmcmFtZXNXaXRoT2Zmc2V0cyA8IGxlbmd0aCkge1xuICAgICAgY29udGV4dC5lcnJvcnMucHVzaChgTm90IGFsbCBzdHlsZSgpIHN0ZXBzIHdpdGhpbiB0aGUgZGVjbGFyZWQga2V5ZnJhbWVzKCkgY29udGFpbiBvZmZzZXRzYCk7XG4gICAgfSBlbHNlIGlmICh0b3RhbEtleWZyYW1lc1dpdGhPZmZzZXRzID09IDApIHtcbiAgICAgIGdlbmVyYXRlZE9mZnNldCA9IE1BWF9LRVlGUkFNRV9PRkZTRVQgLyAobGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgY29uc3QgbGltaXQgPSBsZW5ndGggLSAxO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gY29udGV4dC5jdXJyZW50VGltZTtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyAhO1xuICAgIGNvbnN0IGFuaW1hdGVEdXJhdGlvbiA9IGN1cnJlbnRBbmltYXRlVGltaW5ncy5kdXJhdGlvbjtcbiAgICBrZXlmcmFtZXMuZm9yRWFjaCgoa2YsIGkpID0+IHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IGdlbmVyYXRlZE9mZnNldCA+IDAgPyAoaSA9PSBsaW1pdCA/IDEgOiAoZ2VuZXJhdGVkT2Zmc2V0ICogaSkpIDogb2Zmc2V0c1tpXTtcbiAgICAgIGNvbnN0IGR1cmF0aW9uVXBUb1RoaXNGcmFtZSA9IG9mZnNldCAqIGFuaW1hdGVEdXJhdGlvbjtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWUgPSBjdXJyZW50VGltZSArIGN1cnJlbnRBbmltYXRlVGltaW5ncy5kZWxheSArIGR1cmF0aW9uVXBUb1RoaXNGcmFtZTtcbiAgICAgIGN1cnJlbnRBbmltYXRlVGltaW5ncy5kdXJhdGlvbiA9IGR1cmF0aW9uVXBUb1RoaXNGcmFtZTtcbiAgICAgIHRoaXMuX3ZhbGlkYXRlU3R5bGVBc3Qoa2YsIGNvbnRleHQpO1xuICAgICAga2Yub2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgICBhc3Quc3R5bGVzLnB1c2goa2YpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKG1ldGFkYXRhOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSwgY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpOlxuICAgICAgUmVmZXJlbmNlQXN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZSxcbiAgICAgIGFuaW1hdGlvbjogdmlzaXREc2xOb2RlKHRoaXMsIG5vcm1hbGl6ZUFuaW1hdGlvbkVudHJ5KG1ldGFkYXRhLmFuaW1hdGlvbiksIGNvbnRleHQpLFxuICAgICAgb3B0aW9uczogbm9ybWFsaXplQW5pbWF0aW9uT3B0aW9ucyhtZXRhZGF0YS5vcHRpb25zKVxuICAgIH07XG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChtZXRhZGF0YTogQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTpcbiAgICAgIEFuaW1hdGVDaGlsZEFzdCB7XG4gICAgY29udGV4dC5kZXBDb3VudCsrO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLFxuICAgICAgb3B0aW9uczogbm9ybWFsaXplQW5pbWF0aW9uT3B0aW9ucyhtZXRhZGF0YS5vcHRpb25zKVxuICAgIH07XG4gIH1cblxuICB2aXNpdEFuaW1hdGVSZWYobWV0YWRhdGE6IEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSwgY29udGV4dDogQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQpOlxuICAgICAgQW5pbWF0ZVJlZkFzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLFxuICAgICAgYW5pbWF0aW9uOiB0aGlzLnZpc2l0UmVmZXJlbmNlKG1ldGFkYXRhLmFuaW1hdGlvbiwgY29udGV4dCksXG4gICAgICBvcHRpb25zOiBub3JtYWxpemVBbmltYXRpb25PcHRpb25zKG1ldGFkYXRhLm9wdGlvbnMpXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0UXVlcnkobWV0YWRhdGE6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEsIGNvbnRleHQ6IEFuaW1hdGlvbkFzdEJ1aWxkZXJDb250ZXh0KTogUXVlcnlBc3Qge1xuICAgIGNvbnN0IHBhcmVudFNlbGVjdG9yID0gY29udGV4dC5jdXJyZW50UXVlcnlTZWxlY3RvciAhO1xuICAgIGNvbnN0IG9wdGlvbnMgPSAobWV0YWRhdGEub3B0aW9ucyB8fCB7fSkgYXMgQW5pbWF0aW9uUXVlcnlPcHRpb25zO1xuXG4gICAgY29udGV4dC5xdWVyeUNvdW50Kys7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnkgPSBtZXRhZGF0YTtcbiAgICBjb25zdCBbc2VsZWN0b3IsIGluY2x1ZGVTZWxmXSA9IG5vcm1hbGl6ZVNlbGVjdG9yKG1ldGFkYXRhLnNlbGVjdG9yKTtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVNlbGVjdG9yID1cbiAgICAgICAgcGFyZW50U2VsZWN0b3IubGVuZ3RoID8gKHBhcmVudFNlbGVjdG9yICsgJyAnICsgc2VsZWN0b3IpIDogc2VsZWN0b3I7XG4gICAgZ2V0T3JTZXRBc0luTWFwKGNvbnRleHQuY29sbGVjdGVkU3R5bGVzLCBjb250ZXh0LmN1cnJlbnRRdWVyeVNlbGVjdG9yLCB7fSk7XG5cbiAgICBjb25zdCBhbmltYXRpb24gPSB2aXNpdERzbE5vZGUodGhpcywgbm9ybWFsaXplQW5pbWF0aW9uRW50cnkobWV0YWRhdGEuYW5pbWF0aW9uKSwgY29udGV4dCk7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnkgPSBudWxsO1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5U2VsZWN0b3IgPSBwYXJlbnRTZWxlY3RvcjtcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuUXVlcnksXG4gICAgICBzZWxlY3RvcixcbiAgICAgIGxpbWl0OiBvcHRpb25zLmxpbWl0IHx8IDAsXG4gICAgICBvcHRpb25hbDogISFvcHRpb25zLm9wdGlvbmFsLCBpbmNsdWRlU2VsZiwgYW5pbWF0aW9uLFxuICAgICAgb3JpZ2luYWxTZWxlY3RvcjogbWV0YWRhdGEuc2VsZWN0b3IsXG4gICAgICBvcHRpb25zOiBub3JtYWxpemVBbmltYXRpb25PcHRpb25zKG1ldGFkYXRhLm9wdGlvbnMpXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0U3RhZ2dlcihtZXRhZGF0YTogQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhLCBjb250ZXh0OiBBbmltYXRpb25Bc3RCdWlsZGVyQ29udGV4dCk6XG4gICAgICBTdGFnZ2VyQXN0IHtcbiAgICBpZiAoIWNvbnRleHQuY3VycmVudFF1ZXJ5KSB7XG4gICAgICBjb250ZXh0LmVycm9ycy5wdXNoKGBzdGFnZ2VyKCkgY2FuIG9ubHkgYmUgdXNlZCBpbnNpZGUgb2YgcXVlcnkoKWApO1xuICAgIH1cbiAgICBjb25zdCB0aW1pbmdzID0gbWV0YWRhdGEudGltaW5ncyA9PT0gJ2Z1bGwnID9cbiAgICAgICAge2R1cmF0aW9uOiAwLCBkZWxheTogMCwgZWFzaW5nOiAnZnVsbCd9IDpcbiAgICAgICAgcmVzb2x2ZVRpbWluZyhtZXRhZGF0YS50aW1pbmdzLCBjb250ZXh0LmVycm9ycywgdHJ1ZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsXG4gICAgICBhbmltYXRpb246IHZpc2l0RHNsTm9kZSh0aGlzLCBub3JtYWxpemVBbmltYXRpb25FbnRyeShtZXRhZGF0YS5hbmltYXRpb24pLCBjb250ZXh0KSwgdGltaW5ncyxcbiAgICAgIG9wdGlvbnM6IG51bGxcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBbc3RyaW5nLCBib29sZWFuXSB7XG4gIGNvbnN0IGhhc0FtcGVyc2FuZCA9IHNlbGVjdG9yLnNwbGl0KC9cXHMqLFxccyovKS5maW5kKHRva2VuID0+IHRva2VuID09IFNFTEZfVE9LRU4pID8gdHJ1ZSA6IGZhbHNlO1xuICBpZiAoaGFzQW1wZXJzYW5kKSB7XG4gICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKFNFTEZfVE9LRU5fUkVHRVgsICcnKTtcbiAgfVxuXG4gIC8vIHRoZSA6ZW50ZXIgYW5kIDpsZWF2ZSBzZWxlY3RvcnMgYXJlIGZpbGxlZCBpbiBhdCBydW50aW1lIGR1cmluZyB0aW1lbGluZSBidWlsZGluZ1xuICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL0BcXCovZywgTkdfVFJJR0dFUl9TRUxFQ1RPUilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL0BcXHcrL2csIG1hdGNoID0+IE5HX1RSSUdHRVJfU0VMRUNUT1IgKyAnLScgKyBtYXRjaC5zdWJzdHIoMSkpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC86YW5pbWF0aW5nL2csIE5HX0FOSU1BVElOR19TRUxFQ1RPUik7XG5cbiAgcmV0dXJuIFtzZWxlY3RvciwgaGFzQW1wZXJzYW5kXTtcbn1cblxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXJhbXMob2JqOiB7W2tleTogc3RyaW5nXTogYW55fSB8IGFueSk6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwge1xuICByZXR1cm4gb2JqID8gY29weU9iaihvYmopIDogbnVsbDtcbn1cblxuZXhwb3J0IHR5cGUgU3R5bGVUaW1lVHVwbGUgPSB7XG4gIHN0YXJ0VGltZTogbnVtYmVyOyBlbmRUaW1lOiBudW1iZXI7XG59O1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uQXN0QnVpbGRlckNvbnRleHQge1xuICBwdWJsaWMgcXVlcnlDb3VudDogbnVtYmVyID0gMDtcbiAgcHVibGljIGRlcENvdW50OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFRyYW5zaXRpb246IEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YXxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeTogQW5pbWF0aW9uUXVlcnlNZXRhZGF0YXxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeVNlbGVjdG9yOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIHB1YmxpYyBjdXJyZW50QW5pbWF0ZVRpbWluZ3M6IFRpbWluZ0FzdHxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRUaW1lOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY29sbGVjdGVkU3R5bGVzOiB7W3NlbGVjdG9yTmFtZTogc3RyaW5nXToge1twcm9wTmFtZTogc3RyaW5nXTogU3R5bGVUaW1lVHVwbGV9fSA9IHt9O1xuICBwdWJsaWMgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsID0gbnVsbDtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yczogYW55W10pIHt9XG59XG5cbmZ1bmN0aW9uIGNvbnN1bWVPZmZzZXQoc3R5bGVzOiDJtVN0eWxlRGF0YSB8IHN0cmluZyB8ICjJtVN0eWxlRGF0YSB8IHN0cmluZylbXSk6IG51bWJlcnxudWxsIHtcbiAgaWYgKHR5cGVvZiBzdHlsZXMgPT0gJ3N0cmluZycpIHJldHVybiBudWxsO1xuXG4gIGxldCBvZmZzZXQ6IG51bWJlcnxudWxsID0gbnVsbDtcblxuICBpZiAoQXJyYXkuaXNBcnJheShzdHlsZXMpKSB7XG4gICAgc3R5bGVzLmZvckVhY2goc3R5bGVUdXBsZSA9PiB7XG4gICAgICBpZiAoaXNPYmplY3Qoc3R5bGVUdXBsZSkgJiYgc3R5bGVUdXBsZS5oYXNPd25Qcm9wZXJ0eSgnb2Zmc2V0JykpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gc3R5bGVUdXBsZSBhcyDJtVN0eWxlRGF0YTtcbiAgICAgICAgb2Zmc2V0ID0gcGFyc2VGbG9hdChvYmpbJ29mZnNldCddIGFzIHN0cmluZyk7XG4gICAgICAgIGRlbGV0ZSBvYmpbJ29mZnNldCddO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KHN0eWxlcykgJiYgc3R5bGVzLmhhc093blByb3BlcnR5KCdvZmZzZXQnKSkge1xuICAgIGNvbnN0IG9iaiA9IHN0eWxlcyBhcyDJtVN0eWxlRGF0YTtcbiAgICBvZmZzZXQgPSBwYXJzZUZsb2F0KG9ialsnb2Zmc2V0J10gYXMgc3RyaW5nKTtcbiAgICBkZWxldGUgb2JqWydvZmZzZXQnXTtcbiAgfVxuICByZXR1cm4gb2Zmc2V0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RUaW1pbmdBc3QodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IEFuaW1hdGVUaW1pbmdzLCBlcnJvcnM6IGFueVtdKSB7XG4gIGxldCB0aW1pbmdzOiBBbmltYXRlVGltaW5nc3xudWxsID0gbnVsbDtcbiAgaWYgKHZhbHVlLmhhc093blByb3BlcnR5KCdkdXJhdGlvbicpKSB7XG4gICAgdGltaW5ncyA9IHZhbHVlIGFzIEFuaW1hdGVUaW1pbmdzO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIGNvbnN0IGR1cmF0aW9uID0gcmVzb2x2ZVRpbWluZyh2YWx1ZSBhcyBudW1iZXIsIGVycm9ycykuZHVyYXRpb247XG4gICAgcmV0dXJuIG1ha2VUaW1pbmdBc3QoZHVyYXRpb24gYXMgbnVtYmVyLCAwLCAnJyk7XG4gIH1cblxuICBjb25zdCBzdHJWYWx1ZSA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNEeW5hbWljID0gc3RyVmFsdWUuc3BsaXQoL1xccysvKS5zb21lKHYgPT4gdi5jaGFyQXQoMCkgPT0gJ3snICYmIHYuY2hhckF0KDEpID09ICd7Jyk7XG4gIGlmIChpc0R5bmFtaWMpIHtcbiAgICBjb25zdCBhc3QgPSBtYWtlVGltaW5nQXN0KDAsIDAsICcnKSBhcyBhbnk7XG4gICAgYXN0LmR5bmFtaWMgPSB0cnVlO1xuICAgIGFzdC5zdHJWYWx1ZSA9IHN0clZhbHVlO1xuICAgIHJldHVybiBhc3QgYXMgRHluYW1pY1RpbWluZ0FzdDtcbiAgfVxuXG4gIHRpbWluZ3MgPSB0aW1pbmdzIHx8IHJlc29sdmVUaW1pbmcoc3RyVmFsdWUsIGVycm9ycyk7XG4gIHJldHVybiBtYWtlVGltaW5nQXN0KHRpbWluZ3MuZHVyYXRpb24sIHRpbWluZ3MuZGVsYXksIHRpbWluZ3MuZWFzaW5nKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uT3B0aW9ucyhvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCk6IEFuaW1hdGlvbk9wdGlvbnMge1xuICBpZiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBjb3B5T2JqKG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zWydwYXJhbXMnXSkge1xuICAgICAgb3B0aW9uc1sncGFyYW1zJ10gPSBub3JtYWxpemVQYXJhbXMob3B0aW9uc1sncGFyYW1zJ10pICE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuICByZXR1cm4gb3B0aW9ucztcbn1cblxuZnVuY3Rpb24gbWFrZVRpbWluZ0FzdChkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLCBlYXNpbmc6IHN0cmluZyB8IG51bGwpOiBUaW1pbmdBc3Qge1xuICByZXR1cm4ge2R1cmF0aW9uLCBkZWxheSwgZWFzaW5nfTtcbn1cbiJdfQ==