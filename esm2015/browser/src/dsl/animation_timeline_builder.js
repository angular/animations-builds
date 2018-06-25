/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { copyObj, copyStyles, interpolateParams, iteratorToArray, resolveTiming, resolveTimingValue, visitDslNode } from '../util';
import { createTimelineInstruction } from './animation_timeline_instruction';
import { ElementInstructionMap } from './element_instruction_map';
const /** @type {?} */ ONE_FRAME_IN_MILLISECONDS = 1;
const /** @type {?} */ ENTER_TOKEN = ':enter';
const /** @type {?} */ ENTER_TOKEN_REGEX = new RegExp(ENTER_TOKEN, 'g');
const /** @type {?} */ LEAVE_TOKEN = ':leave';
const /** @type {?} */ LEAVE_TOKEN_REGEX = new RegExp(LEAVE_TOKEN, 'g');
/**
 * @param {?} driver
 * @param {?} rootElement
 * @param {?} ast
 * @param {?} enterClassName
 * @param {?} leaveClassName
 * @param {?=} startingStyles
 * @param {?=} finalStyles
 * @param {?=} options
 * @param {?=} subInstructions
 * @param {?=} errors
 * @return {?}
 */
export function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = {}, finalStyles = {}, options, subInstructions, errors = []) {
    return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
export class AnimationTimelineBuilderVisitor {
    /**
     * @param {?} driver
     * @param {?} rootElement
     * @param {?} ast
     * @param {?} enterClassName
     * @param {?} leaveClassName
     * @param {?} startingStyles
     * @param {?} finalStyles
     * @param {?} options
     * @param {?=} subInstructions
     * @param {?=} errors
     * @return {?}
     */
    buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
        subInstructions = subInstructions || new ElementInstructionMap();
        const /** @type {?} */ context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
        context.options = options;
        context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
        visitDslNode(this, ast, context);
        // this checks to see if an actual animation happened
        const /** @type {?} */ timelines = context.timelines.filter(timeline => timeline.containsAnimation());
        if (timelines.length && Object.keys(finalStyles).length) {
            const /** @type {?} */ tl = timelines[timelines.length - 1];
            if (!tl.allowOnlyTimelineStyles()) {
                tl.setStyles([finalStyles], null, context.errors, options);
            }
        }
        return timelines.length ? timelines.map(timeline => timeline.buildKeyframes()) :
            [createTimelineInstruction(rootElement, [], [], [], 0, 0, '', false)];
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTrigger(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimateChild(ast, context) {
        const /** @type {?} */ elementInstructions = context.subInstructions.consume(context.element);
        if (elementInstructions) {
            const /** @type {?} */ innerContext = context.createSubContext(ast.options);
            const /** @type {?} */ startTime = context.currentTimeline.currentTime;
            const /** @type {?} */ endTime = this._visitSubInstructions(elementInstructions, innerContext, /** @type {?} */ (innerContext.options));
            if (startTime != endTime) {
                // we do this on the upper context because we created a sub context for
                // the sub child animations
                context.transformIntoNewTimeline(endTime);
            }
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimateRef(ast, context) {
        const /** @type {?} */ innerContext = context.createSubContext(ast.options);
        innerContext.transformIntoNewTimeline();
        this.visitReference(ast.animation, innerContext);
        context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        context.previousNode = ast;
    }
    /**
     * @param {?} instructions
     * @param {?} context
     * @param {?} options
     * @return {?}
     */
    _visitSubInstructions(instructions, context, options) {
        const /** @type {?} */ startTime = context.currentTimeline.currentTime;
        let /** @type {?} */ furthestTime = startTime;
        // this is a special-case for when a user wants to skip a sub
        // animation from being fired entirely.
        const /** @type {?} */ duration = options.duration != null ? resolveTimingValue(options.duration) : null;
        const /** @type {?} */ delay = options.delay != null ? resolveTimingValue(options.delay) : null;
        if (duration !== 0) {
            instructions.forEach(instruction => {
                const /** @type {?} */ instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
                furthestTime =
                    Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
            });
        }
        return furthestTime;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitReference(ast, context) {
        context.updateOptions(ast.options, true);
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) {
        const /** @type {?} */ subContextCount = context.subContextCount;
        let /** @type {?} */ ctx = context;
        const /** @type {?} */ options = ast.options;
        if (options && (options.params || options.delay)) {
            ctx = context.createSubContext(options);
            ctx.transformIntoNewTimeline();
            if (options.delay != null) {
                if (ctx.previousNode.type == 6 /* Style */) {
                    ctx.currentTimeline.snapshotCurrentStyles();
                    ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
                }
                const /** @type {?} */ delay = resolveTimingValue(options.delay);
                ctx.delayNextStep(delay);
            }
        }
        if (ast.steps.length) {
            ast.steps.forEach(s => visitDslNode(this, s, ctx));
            // this is here just incase the inner steps only contain or end with a style() call
            ctx.currentTimeline.applyStylesToKeyframe();
            // this means that some animation function within the sequence
            // ended up creating a sub timeline (which means the current
            // timeline cannot overlap with the contents of the sequence)
            if (ctx.subContextCount > subContextCount) {
                ctx.transformIntoNewTimeline();
            }
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) {
        const /** @type {?} */ innerTimelines = [];
        let /** @type {?} */ furthestTime = context.currentTimeline.currentTime;
        const /** @type {?} */ delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
        ast.steps.forEach(s => {
            const /** @type {?} */ innerContext = context.createSubContext(ast.options);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            visitDslNode(this, s, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach(timeline => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
        context.transformIntoNewTimeline(furthestTime);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    _visitTiming(ast, context) {
        if ((/** @type {?} */ (ast)).dynamic) {
            const /** @type {?} */ strValue = (/** @type {?} */ (ast)).strValue;
            const /** @type {?} */ timingValue = context.params ? interpolateParams(strValue, context.params, context.errors) : strValue;
            return resolveTiming(timingValue, context.errors);
        }
        else {
            return { duration: ast.duration, delay: ast.delay, easing: ast.easing };
        }
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) {
        const /** @type {?} */ timings = context.currentAnimateTimings = this._visitTiming(ast.timings, context);
        const /** @type {?} */ timeline = context.currentTimeline;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            timeline.snapshotCurrentStyles();
        }
        const /** @type {?} */ style = ast.style;
        if (style.type == 5 /* Keyframes */) {
            this.visitKeyframes(style, context);
        }
        else {
            context.incrementTime(timings.duration);
            this.visitStyle(/** @type {?} */ (style), context);
            timeline.applyStylesToKeyframe();
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) {
        const /** @type {?} */ timeline = context.currentTimeline;
        const /** @type {?} */ timings = /** @type {?} */ ((context.currentAnimateTimings));
        // this is a special case for when a style() call
        // directly follows  an animate() call (but not inside of an animate() call)
        if (!timings && timeline.getCurrentStyleProperties().length) {
            timeline.forwardFrame();
        }
        const /** @type {?} */ easing = (timings && timings.easing) || ast.easing;
        if (ast.isEmptyStep) {
            timeline.applyEmptyStep(easing);
        }
        else {
            timeline.setStyles(ast.styles, easing, context.errors, context.options);
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframes(ast, context) {
        const /** @type {?} */ currentAnimateTimings = /** @type {?} */ ((context.currentAnimateTimings));
        const /** @type {?} */ startTime = (/** @type {?} */ ((context.currentTimeline))).duration;
        const /** @type {?} */ duration = currentAnimateTimings.duration;
        const /** @type {?} */ innerContext = context.createSubContext();
        const /** @type {?} */ innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = currentAnimateTimings.easing;
        ast.styles.forEach(step => {
            const /** @type {?} */ offset = step.offset || 0;
            innerTimeline.forwardTime(offset * duration);
            innerTimeline.setStyles(step.styles, step.easing, context.errors, context.options);
            innerTimeline.applyStylesToKeyframe();
        });
        // this will ensure that the parent timeline gets all the styles from
        // the child even if the new timeline below is not used
        context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.transformIntoNewTimeline(startTime + duration);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitQuery(ast, context) {
        // in the event that the first step before this is a style step we need
        // to ensure the styles are applied before the children are animated
        const /** @type {?} */ startTime = context.currentTimeline.currentTime;
        const /** @type {?} */ options = /** @type {?} */ ((ast.options || {}));
        const /** @type {?} */ delay = options.delay ? resolveTimingValue(options.delay) : 0;
        if (delay && (context.previousNode.type === 6 /* Style */ ||
            (startTime == 0 && context.currentTimeline.getCurrentStyleProperties().length))) {
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        let /** @type {?} */ furthestTime = startTime;
        const /** @type {?} */ elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
        context.currentQueryTotal = elms.length;
        let /** @type {?} */ sameElementTimeline = null;
        elms.forEach((element, i) => {
            context.currentQueryIndex = i;
            const /** @type {?} */ innerContext = context.createSubContext(ast.options, element);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            if (element === context.element) {
                sameElementTimeline = innerContext.currentTimeline;
            }
            visitDslNode(this, ast.animation, innerContext);
            // this is here just incase the inner steps only contain or end
            // with a style() call (which is here to signal that this is a preparatory
            // call to style an element before it is animated again)
            innerContext.currentTimeline.applyStylesToKeyframe();
            const /** @type {?} */ endTime = innerContext.currentTimeline.currentTime;
            furthestTime = Math.max(furthestTime, endTime);
        });
        context.currentQueryIndex = 0;
        context.currentQueryTotal = 0;
        context.transformIntoNewTimeline(furthestTime);
        if (sameElementTimeline) {
            context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
            context.currentTimeline.snapshotCurrentStyles();
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStagger(ast, context) {
        const /** @type {?} */ parentContext = /** @type {?} */ ((context.parentContext));
        const /** @type {?} */ tl = context.currentTimeline;
        const /** @type {?} */ timings = ast.timings;
        const /** @type {?} */ duration = Math.abs(timings.duration);
        const /** @type {?} */ maxTime = duration * (context.currentQueryTotal - 1);
        let /** @type {?} */ delay = duration * context.currentQueryIndex;
        let /** @type {?} */ staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
        switch (staggerTransformer) {
            case 'reverse':
                delay = maxTime - delay;
                break;
            case 'full':
                delay = parentContext.currentStaggerTime;
                break;
        }
        const /** @type {?} */ timeline = context.currentTimeline;
        if (delay) {
            timeline.delayNextStep(delay);
        }
        const /** @type {?} */ startingTime = timeline.currentTime;
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
        // time = duration + delay
        // the reason why this computation is so complex is because
        // the inner timeline may either have a delay value or a stretched
        // keyframe depending on if a subtimeline is not used or is used.
        parentContext.currentStaggerTime =
            (tl.currentTime - startingTime) + (tl.startTime - parentContext.currentTimeline.startTime);
    }
}
const /** @type {?} */ DEFAULT_NOOP_PREVIOUS_NODE = /** @type {?} */ ({});
export class AnimationTimelineContext {
    /**
     * @param {?} _driver
     * @param {?} element
     * @param {?} subInstructions
     * @param {?} _enterClassName
     * @param {?} _leaveClassName
     * @param {?} errors
     * @param {?} timelines
     * @param {?=} initialTimeline
     */
    constructor(_driver, element, subInstructions, _enterClassName, _leaveClassName, errors, timelines, initialTimeline) {
        this._driver = _driver;
        this.element = element;
        this.subInstructions = subInstructions;
        this._enterClassName = _enterClassName;
        this._leaveClassName = _leaveClassName;
        this.errors = errors;
        this.timelines = timelines;
        this.parentContext = null;
        this.currentAnimateTimings = null;
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.subContextCount = 0;
        this.options = {};
        this.currentQueryIndex = 0;
        this.currentQueryTotal = 0;
        this.currentStaggerTime = 0;
        this.currentTimeline = initialTimeline || new TimelineBuilder(this._driver, element, 0);
        timelines.push(this.currentTimeline);
    }
    /**
     * @return {?}
     */
    get params() { return this.options.params; }
    /**
     * @param {?} options
     * @param {?=} skipIfExists
     * @return {?}
     */
    updateOptions(options, skipIfExists) {
        if (!options)
            return;
        const /** @type {?} */ newOptions = /** @type {?} */ (options);
        let /** @type {?} */ optionsToUpdate = this.options;
        // NOTE: this will get patched up when other animation methods support duration overrides
        if (newOptions.duration != null) {
            (/** @type {?} */ (optionsToUpdate)).duration = resolveTimingValue(newOptions.duration);
        }
        if (newOptions.delay != null) {
            optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
        }
        const /** @type {?} */ newParams = newOptions.params;
        if (newParams) {
            let /** @type {?} */ paramsToUpdate = /** @type {?} */ ((optionsToUpdate.params));
            if (!paramsToUpdate) {
                paramsToUpdate = this.options.params = {};
            }
            Object.keys(newParams).forEach(name => {
                if (!skipIfExists || !paramsToUpdate.hasOwnProperty(name)) {
                    paramsToUpdate[name] = interpolateParams(newParams[name], paramsToUpdate, this.errors);
                }
            });
        }
    }
    /**
     * @return {?}
     */
    _copyOptions() {
        const /** @type {?} */ options = {};
        if (this.options) {
            const /** @type {?} */ oldParams = this.options.params;
            if (oldParams) {
                const /** @type {?} */ params = options['params'] = {};
                Object.keys(oldParams).forEach(name => { params[name] = oldParams[name]; });
            }
        }
        return options;
    }
    /**
     * @param {?=} options
     * @param {?=} element
     * @param {?=} newTime
     * @return {?}
     */
    createSubContext(options = null, element, newTime) {
        const /** @type {?} */ target = element || this.element;
        const /** @type {?} */ context = new AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        context.options = this._copyOptions();
        context.updateOptions(options);
        context.currentQueryIndex = this.currentQueryIndex;
        context.currentQueryTotal = this.currentQueryTotal;
        context.parentContext = this;
        this.subContextCount++;
        return context;
    }
    /**
     * @param {?=} newTime
     * @return {?}
     */
    transformIntoNewTimeline(newTime) {
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    }
    /**
     * @param {?} instruction
     * @param {?} duration
     * @param {?} delay
     * @return {?}
     */
    appendInstructionToTimeline(instruction, duration, delay) {
        const /** @type {?} */ updatedTimings = {
            duration: duration != null ? duration : instruction.duration,
            delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
            easing: ''
        };
        const /** @type {?} */ builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
        this.timelines.push(builder);
        return updatedTimings;
    }
    /**
     * @param {?} time
     * @return {?}
     */
    incrementTime(time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    }
    /**
     * @param {?} delay
     * @return {?}
     */
    delayNextStep(delay) {
        // negative delays are not yet supported
        if (delay > 0) {
            this.currentTimeline.delayNextStep(delay);
        }
    }
    /**
     * @param {?} selector
     * @param {?} originalSelector
     * @param {?} limit
     * @param {?} includeSelf
     * @param {?} optional
     * @param {?} errors
     * @return {?}
     */
    invokeQuery(selector, originalSelector, limit, includeSelf, optional, errors) {
        let /** @type {?} */ results = [];
        if (includeSelf) {
            results.push(this.element);
        }
        if (selector.length > 0) { // if :self is only used then the selector is empty
            // if :self is only used then the selector is empty
            selector = selector.replace(ENTER_TOKEN_REGEX, '.' + this._enterClassName);
            selector = selector.replace(LEAVE_TOKEN_REGEX, '.' + this._leaveClassName);
            const /** @type {?} */ multi = limit != 1;
            let /** @type {?} */ elements = this._driver.query(this.element, selector, multi);
            if (limit !== 0) {
                elements = limit < 0 ? elements.slice(elements.length + limit, elements.length) :
                    elements.slice(0, limit);
            }
            results.push(...elements);
        }
        if (!optional && results.length == 0) {
            errors.push(`\`query("${originalSelector}")\` returned zero elements. (Use \`query("${originalSelector}", { optional: true })\` if you wish to allow this.)`);
        }
        return results;
    }
}
function AnimationTimelineContext_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTimelineContext.prototype.parentContext;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentTimeline;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentAnimateTimings;
    /** @type {?} */
    AnimationTimelineContext.prototype.previousNode;
    /** @type {?} */
    AnimationTimelineContext.prototype.subContextCount;
    /** @type {?} */
    AnimationTimelineContext.prototype.options;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentQueryIndex;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentQueryTotal;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentStaggerTime;
    /** @type {?} */
    AnimationTimelineContext.prototype._driver;
    /** @type {?} */
    AnimationTimelineContext.prototype.element;
    /** @type {?} */
    AnimationTimelineContext.prototype.subInstructions;
    /** @type {?} */
    AnimationTimelineContext.prototype._enterClassName;
    /** @type {?} */
    AnimationTimelineContext.prototype._leaveClassName;
    /** @type {?} */
    AnimationTimelineContext.prototype.errors;
    /** @type {?} */
    AnimationTimelineContext.prototype.timelines;
}
export class TimelineBuilder {
    /**
     * @param {?} _driver
     * @param {?} element
     * @param {?} startTime
     * @param {?=} _elementTimelineStylesLookup
     */
    constructor(_driver, element, startTime, _elementTimelineStylesLookup) {
        this._driver = _driver;
        this.element = element;
        this.startTime = startTime;
        this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
        this.duration = 0;
        this._previousKeyframe = {};
        this._currentKeyframe = {};
        this._keyframes = new Map();
        this._styleSummary = {};
        this._pendingStyles = {};
        this._backFill = {};
        this._currentEmptyStepKeyframe = null;
        if (!this._elementTimelineStylesLookup) {
            this._elementTimelineStylesLookup = new Map();
        }
        this._localTimelineStyles = Object.create(this._backFill, {});
        this._globalTimelineStyles = /** @type {?} */ ((this._elementTimelineStylesLookup.get(element)));
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
            this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
        }
        this._loadKeyframe();
    }
    /**
     * @return {?}
     */
    containsAnimation() {
        switch (this._keyframes.size) {
            case 0:
                return false;
            case 1:
                return this.getCurrentStyleProperties().length > 0;
            default:
                return true;
        }
    }
    /**
     * @return {?}
     */
    getCurrentStyleProperties() { return Object.keys(this._currentKeyframe); }
    /**
     * @return {?}
     */
    get currentTime() { return this.startTime + this.duration; }
    /**
     * @param {?} delay
     * @return {?}
     */
    delayNextStep(delay) {
        // in the event that a style() step is placed right before a stagger()
        // and that style() step is the very first style() value in the animation
        // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
        // properly applies the style() values to work with the stagger...
        const /** @type {?} */ hasPreStyleStep = this._keyframes.size == 1 && Object.keys(this._pendingStyles).length;
        if (this.duration || hasPreStyleStep) {
            this.forwardTime(this.currentTime + delay);
            if (hasPreStyleStep) {
                this.snapshotCurrentStyles();
            }
        }
        else {
            this.startTime += delay;
        }
    }
    /**
     * @param {?} element
     * @param {?=} currentTime
     * @return {?}
     */
    fork(element, currentTime) {
        this.applyStylesToKeyframe();
        return new TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
    }
    /**
     * @return {?}
     */
    _loadKeyframe() {
        if (this._currentKeyframe) {
            this._previousKeyframe = this._currentKeyframe;
        }
        this._currentKeyframe = /** @type {?} */ ((this._keyframes.get(this.duration)));
        if (!this._currentKeyframe) {
            this._currentKeyframe = Object.create(this._backFill, {});
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    }
    /**
     * @return {?}
     */
    forwardFrame() {
        this.duration += ONE_FRAME_IN_MILLISECONDS;
        this._loadKeyframe();
    }
    /**
     * @param {?} time
     * @return {?}
     */
    forwardTime(time) {
        this.applyStylesToKeyframe();
        this.duration = time;
        this._loadKeyframe();
    }
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    _updateStyle(prop, value) {
        this._localTimelineStyles[prop] = value;
        this._globalTimelineStyles[prop] = value;
        this._styleSummary[prop] = { time: this.currentTime, value };
    }
    /**
     * @return {?}
     */
    allowOnlyTimelineStyles() { return this._currentEmptyStepKeyframe !== this._currentKeyframe; }
    /**
     * @param {?} easing
     * @return {?}
     */
    applyEmptyStep(easing) {
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        // special case for animate(duration):
        // all missing styles are filled with a `*` value then
        // if any destination styles are filled in later on the same
        // keyframe then they will override the overridden styles
        // We use `_globalTimelineStyles` here because there may be
        // styles in previous keyframes that are not present in this timeline
        Object.keys(this._globalTimelineStyles).forEach(prop => {
            this._backFill[prop] = this._globalTimelineStyles[prop] || AUTO_STYLE;
            this._currentKeyframe[prop] = AUTO_STYLE;
        });
        this._currentEmptyStepKeyframe = this._currentKeyframe;
    }
    /**
     * @param {?} input
     * @param {?} easing
     * @param {?} errors
     * @param {?=} options
     * @return {?}
     */
    setStyles(input, easing, errors, options) {
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        const /** @type {?} */ params = (options && options.params) || {};
        const /** @type {?} */ styles = flattenStyles(input, this._globalTimelineStyles);
        Object.keys(styles).forEach(prop => {
            const /** @type {?} */ val = interpolateParams(styles[prop], params, errors);
            this._pendingStyles[prop] = val;
            if (!this._localTimelineStyles.hasOwnProperty(prop)) {
                this._backFill[prop] = this._globalTimelineStyles.hasOwnProperty(prop) ?
                    this._globalTimelineStyles[prop] :
                    AUTO_STYLE;
            }
            this._updateStyle(prop, val);
        });
    }
    /**
     * @return {?}
     */
    applyStylesToKeyframe() {
        const /** @type {?} */ styles = this._pendingStyles;
        const /** @type {?} */ props = Object.keys(styles);
        if (props.length == 0)
            return;
        this._pendingStyles = {};
        props.forEach(prop => {
            const /** @type {?} */ val = styles[prop];
            this._currentKeyframe[prop] = val;
        });
        Object.keys(this._localTimelineStyles).forEach(prop => {
            if (!this._currentKeyframe.hasOwnProperty(prop)) {
                this._currentKeyframe[prop] = this._localTimelineStyles[prop];
            }
        });
    }
    /**
     * @return {?}
     */
    snapshotCurrentStyles() {
        Object.keys(this._localTimelineStyles).forEach(prop => {
            const /** @type {?} */ val = this._localTimelineStyles[prop];
            this._pendingStyles[prop] = val;
            this._updateStyle(prop, val);
        });
    }
    /**
     * @return {?}
     */
    getFinalKeyframe() { return this._keyframes.get(this.duration); }
    /**
     * @return {?}
     */
    get properties() {
        const /** @type {?} */ properties = [];
        for (let /** @type {?} */ prop in this._currentKeyframe) {
            properties.push(prop);
        }
        return properties;
    }
    /**
     * @param {?} timeline
     * @return {?}
     */
    mergeTimelineCollectedStyles(timeline) {
        Object.keys(timeline._styleSummary).forEach(prop => {
            const /** @type {?} */ details0 = this._styleSummary[prop];
            const /** @type {?} */ details1 = timeline._styleSummary[prop];
            if (!details0 || details1.time > details0.time) {
                this._updateStyle(prop, details1.value);
            }
        });
    }
    /**
     * @return {?}
     */
    buildKeyframes() {
        this.applyStylesToKeyframe();
        const /** @type {?} */ preStyleProps = new Set();
        const /** @type {?} */ postStyleProps = new Set();
        const /** @type {?} */ isEmpty = this._keyframes.size === 1 && this.duration === 0;
        let /** @type {?} */ finalKeyframes = [];
        this._keyframes.forEach((keyframe, time) => {
            const /** @type {?} */ finalKeyframe = copyStyles(keyframe, true);
            Object.keys(finalKeyframe).forEach(prop => {
                const /** @type {?} */ value = finalKeyframe[prop];
                if (value == PRE_STYLE) {
                    preStyleProps.add(prop);
                }
                else if (value == AUTO_STYLE) {
                    postStyleProps.add(prop);
                }
            });
            if (!isEmpty) {
                finalKeyframe['offset'] = time / this.duration;
            }
            finalKeyframes.push(finalKeyframe);
        });
        const /** @type {?} */ preProps = preStyleProps.size ? iteratorToArray(preStyleProps.values()) : [];
        const /** @type {?} */ postProps = postStyleProps.size ? iteratorToArray(postStyleProps.values()) : [];
        // special case for a 0-second animation (which is designed just to place styles onscreen)
        if (isEmpty) {
            const /** @type {?} */ kf0 = finalKeyframes[0];
            const /** @type {?} */ kf1 = copyObj(kf0);
            kf0['offset'] = 0;
            kf1['offset'] = 1;
            finalKeyframes = [kf0, kf1];
        }
        return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
    }
}
function TimelineBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    TimelineBuilder.prototype.duration;
    /** @type {?} */
    TimelineBuilder.prototype.easing;
    /** @type {?} */
    TimelineBuilder.prototype._previousKeyframe;
    /** @type {?} */
    TimelineBuilder.prototype._currentKeyframe;
    /** @type {?} */
    TimelineBuilder.prototype._keyframes;
    /** @type {?} */
    TimelineBuilder.prototype._styleSummary;
    /** @type {?} */
    TimelineBuilder.prototype._localTimelineStyles;
    /** @type {?} */
    TimelineBuilder.prototype._globalTimelineStyles;
    /** @type {?} */
    TimelineBuilder.prototype._pendingStyles;
    /** @type {?} */
    TimelineBuilder.prototype._backFill;
    /** @type {?} */
    TimelineBuilder.prototype._currentEmptyStepKeyframe;
    /** @type {?} */
    TimelineBuilder.prototype._driver;
    /** @type {?} */
    TimelineBuilder.prototype.element;
    /** @type {?} */
    TimelineBuilder.prototype.startTime;
    /** @type {?} */
    TimelineBuilder.prototype._elementTimelineStylesLookup;
}
class SubTimelineBuilder extends TimelineBuilder {
    /**
     * @param {?} driver
     * @param {?} element
     * @param {?} keyframes
     * @param {?} preStyleProps
     * @param {?} postStyleProps
     * @param {?} timings
     * @param {?=} _stretchStartingKeyframe
     */
    constructor(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
        super(driver, element, timings.delay);
        this.element = element;
        this.keyframes = keyframes;
        this.preStyleProps = preStyleProps;
        this.postStyleProps = postStyleProps;
        this._stretchStartingKeyframe = _stretchStartingKeyframe;
        this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
    }
    /**
     * @return {?}
     */
    containsAnimation() { return this.keyframes.length > 1; }
    /**
     * @return {?}
     */
    buildKeyframes() {
        let /** @type {?} */ keyframes = this.keyframes;
        let { delay, duration, easing } = this.timings;
        if (this._stretchStartingKeyframe && delay) {
            const /** @type {?} */ newKeyframes = [];
            const /** @type {?} */ totalTime = duration + delay;
            const /** @type {?} */ startingGap = delay / totalTime;
            // the original starting keyframe now starts once the delay is done
            const /** @type {?} */ newFirstKeyframe = copyStyles(keyframes[0], false);
            newFirstKeyframe['offset'] = 0;
            newKeyframes.push(newFirstKeyframe);
            const /** @type {?} */ oldFirstKeyframe = copyStyles(keyframes[0], false);
            oldFirstKeyframe['offset'] = roundOffset(startingGap);
            newKeyframes.push(oldFirstKeyframe);
            /*
                    When the keyframe is stretched then it means that the delay before the animation
                    starts is gone. Instead the first keyframe is placed at the start of the animation
                    and it is then copied to where it starts when the original delay is over. This basically
                    means nothing animates during that delay, but the styles are still renderered. For this
                    to work the original offset values that exist in the original keyframes must be "warped"
                    so that they can take the new keyframe + delay into account.
            
                    delay=1000, duration=1000, keyframes = 0 .5 1
            
                    turns into
            
                    delay=0, duration=2000, keyframes = 0 .33 .66 1
                   */
            // offsets between 1 ... n -1 are all warped by the keyframe stretch
            const /** @type {?} */ limit = keyframes.length - 1;
            for (let /** @type {?} */ i = 1; i <= limit; i++) {
                let /** @type {?} */ kf = copyStyles(keyframes[i], false);
                const /** @type {?} */ oldOffset = /** @type {?} */ (kf['offset']);
                const /** @type {?} */ timeAtKeyframe = delay + oldOffset * duration;
                kf['offset'] = roundOffset(timeAtKeyframe / totalTime);
                newKeyframes.push(kf);
            }
            // the new starting keyframe should be added at the start
            duration = totalTime;
            delay = 0;
            easing = '';
            keyframes = newKeyframes;
        }
        return createTimelineInstruction(this.element, keyframes, this.preStyleProps, this.postStyleProps, duration, delay, easing, true);
    }
}
function SubTimelineBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    SubTimelineBuilder.prototype.timings;
    /** @type {?} */
    SubTimelineBuilder.prototype.element;
    /** @type {?} */
    SubTimelineBuilder.prototype.keyframes;
    /** @type {?} */
    SubTimelineBuilder.prototype.preStyleProps;
    /** @type {?} */
    SubTimelineBuilder.prototype.postStyleProps;
    /** @type {?} */
    SubTimelineBuilder.prototype._stretchStartingKeyframe;
}
/**
 * @param {?} offset
 * @param {?=} decimalPoints
 * @return {?}
 */
function roundOffset(offset, decimalPoints = 3) {
    const /** @type {?} */ mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
/**
 * @param {?} input
 * @param {?} allStyles
 * @return {?}
 */
function flattenStyles(input, allStyles) {
    const /** @type {?} */ styles = {};
    let /** @type {?} */ allProperties;
    input.forEach(token => {
        if (token === '*') {
            allProperties = allProperties || Object.keys(allStyles);
            allProperties.forEach(prop => { styles[prop] = AUTO_STYLE; });
        }
        else {
            copyStyles(/** @type {?} */ (token), false, styles);
        }
    });
    return styles;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBdUcsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBR3pMLE9BQU8sRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR2pJLE9BQU8sRUFBK0IseUJBQXlCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN6RyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSx1QkFBTSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7QUFDcEMsdUJBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3Qix1QkFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkQsdUJBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3Qix1QkFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBc0Z2RCxNQUFNLGtDQUNGLE1BQXVCLEVBQUUsV0FBZ0IsRUFBRSxHQUErQixFQUMxRSxjQUFzQixFQUFFLGNBQXNCLEVBQUUsaUJBQTZCLEVBQUUsRUFDL0UsY0FBMEIsRUFBRSxFQUFFLE9BQXlCLEVBQ3ZELGVBQXVDLEVBQUUsU0FBZ0IsRUFBRTtJQUM3RCxPQUFPLElBQUksK0JBQStCLEVBQUUsQ0FBQyxjQUFjLENBQ3ZELE1BQU0sRUFBRSxXQUFXLEVB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S0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNwQixJQUFJLEtBQUssS0FBSyxHQUFHLEVBQUU7WUFDakIsYUFBYSxHQUFHLGFBQWEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hELGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO2FBQU07WUFDTCxVQUFVLG1CQUFDLEtBQW1CLEdBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hEO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7Q0FDZiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0ZUNoaWxkT3B0aW9ucywgQW5pbWF0ZVRpbWluZ3MsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUXVlcnlPcHRpb25zLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Y29weU9iaiwgY29weVN0eWxlcywgaW50ZXJwb2xhdGVQYXJhbXMsIGl0ZXJhdG9yVG9BcnJheSwgcmVzb2x2ZVRpbWluZywgcmVzb2x2ZVRpbWluZ1ZhbHVlLCB2aXNpdERzbE5vZGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGVBc3QsIEFuaW1hdGVDaGlsZEFzdCwgQW5pbWF0ZVJlZkFzdCwgQXN0LCBBc3RWaXNpdG9yLCBEeW5hbWljVGltaW5nQXN0LCBHcm91cEFzdCwgS2V5ZnJhbWVzQXN0LCBRdWVyeUFzdCwgUmVmZXJlbmNlQXN0LCBTZXF1ZW5jZUFzdCwgU3RhZ2dlckFzdCwgU3RhdGVBc3QsIFN0eWxlQXN0LCBUaW1pbmdBc3QsIFRyYW5zaXRpb25Bc3QsIFRyaWdnZXJBc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcblxuY29uc3QgT05FX0ZSQU1FX0lOX01JTExJU0VDT05EUyA9IDE7XG5jb25zdCBFTlRFUl9UT0tFTiA9ICc6ZW50ZXInO1xuY29uc3QgRU5URVJfVE9LRU5fUkVHRVggPSBuZXcgUmVnRXhwKEVOVEVSX1RPS0VOLCAnZycpO1xuY29uc3QgTEVBVkVfVE9LRU4gPSAnOmxlYXZlJztcbmNvbnN0IExFQVZFX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChMRUFWRV9UT0tFTiwgJ2cnKTtcblxuLypcbiAqIFRoZSBjb2RlIHdpdGhpbiB0aGlzIGZpbGUgYWltcyB0byBnZW5lcmF0ZSB3ZWItYW5pbWF0aW9ucy1jb21wYXRpYmxlIGtleWZyYW1lcyBmcm9tIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBjb2RlLlxuICpcbiAqIFRoZSBjb2RlIGJlbG93IHdpbGwgYmUgY29udmVydGVkIGZyb206XG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogVG86XG4gKiBgYGBcbiAqIGtleWZyYW1lcyA9IFt7IG9wYWNpdHk6IDAsIG9mZnNldDogMCB9LCB7IG9wYWNpdHk6IDEsIG9mZnNldDogMSB9XVxuICogZHVyYXRpb24gPSAxMDAwXG4gKiBkZWxheSA9IDBcbiAqIGVhc2luZyA9ICcnXG4gKiBgYGBcbiAqXG4gKiBGb3IgdGhpcyBvcGVyYXRpb24gdG8gY292ZXIgdGhlIGNvbWJpbmF0aW9uIG9mIGFuaW1hdGlvbiB2ZXJicyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFcbiAqIGNvbWJpbmF0aW9uIG9mIHByb3RvdHlwaWNhbCBpbmhlcml0YW5jZSwgQVNUIHRyYXZlcnNhbCBhbmQgbWVyZ2Utc29ydC1saWtlIGFsZ29yaXRobXMgYXJlIHVzZWQuXG4gKlxuICogW0FTVCBUcmF2ZXJzYWxdXG4gKiBFYWNoIG9mIHRoZSBhbmltYXRpb24gdmVyYnMsIHdoZW4gZXhlY3V0ZWQsIHdpbGwgcmV0dXJuIGFuIHN0cmluZy1tYXAgb2JqZWN0IHJlcHJlc2VudGluZyB3aGF0XG4gKiB0eXBlIG9mIGFjdGlvbiBpdCBpcyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFuZCB0aGUgZGF0YSBhc3NvY2lhdGVkIHdpdGggaXQuIFRoaXMgbWVhbnNcbiAqIHRoYXQgd2hlbiBmdW5jdGlvbmFsIGNvbXBvc2l0aW9uIG1peCBvZiB0aGVzZSBmdW5jdGlvbnMgaXMgZXZhbHVhdGVkIChsaWtlIGluIHRoZSBleGFtcGxlIGFib3ZlKVxuICogdGhlbiBpdCB3aWxsIGVuZCB1cCBwcm9kdWNpbmcgYSB0cmVlIG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBhbmltYXRpb24gaXRzZWxmLlxuICpcbiAqIFdoZW4gdGhpcyBhbmltYXRpb24gb2JqZWN0IHRyZWUgaXMgcHJvY2Vzc2VkIGJ5IHRoZSB2aXNpdG9yIGNvZGUgYmVsb3cgaXQgd2lsbCB2aXNpdCBlYWNoIG9mIHRoZVxuICogdmVyYiBzdGF0ZW1lbnRzIHdpdGhpbiB0aGUgdmlzaXRvci4gQW5kIGR1cmluZyBlYWNoIHZpc2l0IGl0IHdpbGwgYnVpbGQgdGhlIGNvbnRleHQgb2YgdGhlXG4gKiBhbmltYXRpb24ga2V5ZnJhbWVzIGJ5IGludGVyYWN0aW5nIHdpdGggdGhlIGBUaW1lbGluZUJ1aWxkZXJgLlxuICpcbiAqIFtUaW1lbGluZUJ1aWxkZXJdXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciB0cmFja2luZyB0aGUgc3R5bGVzIGFuZCBidWlsZGluZyBhIHNlcmllcyBvZiBrZXlmcmFtZSBvYmplY3RzIGZvciBhXG4gKiB0aW1lbGluZSBiZXR3ZWVuIGEgc3RhcnQgYW5kIGVuZCB0aW1lLiBUaGUgYnVpbGRlciBzdGFydHMgb2ZmIHdpdGggYW4gaW5pdGlhbCB0aW1lbGluZSBhbmQgZWFjaFxuICogdGltZSB0aGUgQVNUIGNvbWVzIGFjcm9zcyBhIGBncm91cCgpYCwgYGtleWZyYW1lcygpYCBvciBhIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28gd2lodGluIGFcbiAqIGBzZXF1ZW5jZSgpYCB0aGVuIGl0IHdpbGwgZ2VuZXJhdGUgYSBzdWIgdGltZWxpbmUgZm9yIGVhY2ggc3RlcCBhcyB3ZWxsIGFzIGEgbmV3IG9uZSBhZnRlclxuICogdGhleSBhcmUgY29tcGxldGUuXG4gKlxuICogQXMgdGhlIEFTVCBpcyB0cmF2ZXJzZWQsIHRoZSB0aW1pbmcgc3RhdGUgb24gZWFjaCBvZiB0aGUgdGltZWxpbmVzIHdpbGwgYmUgaW5jcmVtZW50ZWQuIElmIGEgc3ViXG4gKiB0aW1lbGluZSB3YXMgY3JlYXRlZCAoYmFzZWQgb24gb25lIG9mIHRoZSBjYXNlcyBhYm92ZSkgdGhlbiB0aGUgcGFyZW50IHRpbWVsaW5lIHdpbGwgYXR0ZW1wdCB0b1xuICogbWVyZ2UgdGhlIHN0eWxlcyB1c2VkIHdpdGhpbiB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIGl0c2VsZiAob25seSB3aXRoIGdyb3VwKCkgdGhpcyB3aWxsIGhhcHBlbikuXG4gKiBUaGlzIGhhcHBlbnMgd2l0aCBhIG1lcmdlIG9wZXJhdGlvbiAobXVjaCBsaWtlIGhvdyB0aGUgbWVyZ2Ugd29ya3MgaW4gbWVyZ2Vzb3J0KSBhbmQgaXQgd2lsbCBvbmx5XG4gKiBjb3B5IHRoZSBtb3N0IHJlY2VudGx5IHVzZWQgc3R5bGVzIGZyb20gdGhlIHN1YiB0aW1lbGluZXMgaW50byB0aGUgcGFyZW50IHRpbWVsaW5lLiBUaGlzIGVuc3VyZXNcbiAqIHRoYXQgaWYgdGhlIHN0eWxlcyBhcmUgdXNlZCBsYXRlciBvbiBpbiBhbm90aGVyIHBoYXNlIG9mIHRoZSBhbmltYXRpb24gdGhlbiB0aGV5IHdpbGwgYmUgdGhlIG1vc3RcbiAqIHVwLXRvLWRhdGUgdmFsdWVzLlxuICpcbiAqIFtIb3cgTWlzc2luZyBTdHlsZXMgQXJlIFVwZGF0ZWRdXG4gKiBFYWNoIHRpbWVsaW5lIGhhcyBhIGBiYWNrRmlsbGAgcHJvcGVydHkgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGZpbGxpbmcgaW4gbmV3IHN0eWxlcyBpbnRvXG4gKiBhbHJlYWR5IHByb2Nlc3NlZCBrZXlmcmFtZXMgaWYgYSBuZXcgc3R5bGUgc2hvd3MgdXAgbGF0ZXIgd2l0aGluIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgd2lkdGg6IDAgfSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMTAwIH0pKSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAyMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDMwMCB9KSlcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiA0MDAsIGhlaWdodDogNDAwIH0pKSAvLyBub3RpY2UgaG93IGBoZWlnaHRgIGRvZXNuJ3QgZXhpc3QgYW55d2hlcmVcbiAqIGVsc2VcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBXaGF0IGlzIGhhcHBlbmluZyBoZXJlIGlzIHRoYXQgdGhlIGBoZWlnaHRgIHZhbHVlIGlzIGFkZGVkIGxhdGVyIGluIHRoZSBzZXF1ZW5jZSwgYnV0IGlzIG1pc3NpbmdcbiAqIGZyb20gYWxsIHByZXZpb3VzIGFuaW1hdGlvbiBzdGVwcy4gVGhlcmVmb3JlIHdoZW4gYSBrZXlmcmFtZSBpcyBjcmVhdGVkIGl0IHdvdWxkIGFsc28gYmUgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMga2V5ZnJhbWVzIHVwIHVudGlsIHdoZXJlIGl0IGlzIGZpcnN0IHVzZWQuIEZvciB0aGUgdGltZWxpbmUga2V5ZnJhbWUgZ2VuZXJhdGlvblxuICogdG8gcHJvcGVybHkgZmlsbCBpbiB0aGUgc3R5bGUgaXQgd2lsbCBwbGFjZSB0aGUgcHJldmlvdXMgdmFsdWUgKHRoZSB2YWx1ZSBmcm9tIHRoZSBwYXJlbnRcbiAqIHRpbWVsaW5lKSBvciBhIGRlZmF1bHQgdmFsdWUgb2YgYCpgIGludG8gdGhlIGJhY2tGaWxsIG9iamVjdC4gR2l2ZW4gdGhhdCBlYWNoIG9mIHRoZSBrZXlmcmFtZVxuICogc3R5bGVzIGFyZSBvYmplY3RzIHRoYXQgcHJvdG90eXBpY2FsbHkgaW5oZXJ0IGZyb20gdGhlIGJhY2tGaWxsIG9iamVjdCwgdGhpcyBtZWFucyB0aGF0IGlmIGFcbiAqIHZhbHVlIGlzIGFkZGVkIGludG8gdGhlIGJhY2tGaWxsIHRoZW4gaXQgd2lsbCBhdXRvbWF0aWNhbGx5IHByb3BhZ2F0ZSBhbnkgbWlzc2luZyB2YWx1ZXMgdG8gYWxsXG4gKiBrZXlmcmFtZXMuIFRoZXJlZm9yZSB0aGUgbWlzc2luZyBgaGVpZ2h0YCB2YWx1ZSB3aWxsIGJlIHByb3Blcmx5IGZpbGxlZCBpbnRvIHRoZSBhbHJlYWR5XG4gKiBwcm9jZXNzZWQga2V5ZnJhbWVzLlxuICpcbiAqIFdoZW4gYSBzdWItdGltZWxpbmUgaXMgY3JlYXRlZCBpdCB3aWxsIGhhdmUgaXRzIG93biBiYWNrRmlsbCBwcm9wZXJ0eS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAqIHN0eWxlcyBwcmVzZW50IHdpdGhpbiB0aGUgc3ViLXRpbWVsaW5lIGRvIG5vdCBhY2NpZGVudGFsbHkgc2VlcCBpbnRvIHRoZSBwcmV2aW91cy9mdXR1cmUgdGltZWxpbmVcbiAqIGtleWZyYW1lc1xuICpcbiAqIChGb3IgcHJvdG90eXBpY2FsbHktaW5oZXJpdGVkIGNvbnRlbnRzIHRvIGJlIGRldGVjdGVkIGEgYGZvcihpIGluIG9iailgIGxvb3AgbXVzdCBiZSB1c2VkLilcbiAqXG4gKiBbVmFsaWRhdGlvbl1cbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBub3QgcmVzcG9uc2libGUgZm9yIHZhbGlkYXRpb24uIFRoYXQgZnVuY3Rpb25hbGl0eSBoYXBwZW5zIHdpdGggd2l0aGluXG4gKiB0aGUgYEFuaW1hdGlvblZhbGlkYXRvclZpc2l0b3JgIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFuaW1hdGlvblRpbWVsaW5lcyhcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICBlbnRlckNsYXNzTmFtZTogc3RyaW5nLCBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBzdGFydGluZ1N0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBmaW5hbFN0eWxlczogybVTdHlsZURhdGEgPSB7fSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVycm9yczogYW55W10gPSBbXSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gIHJldHVybiBuZXcgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvcigpLmJ1aWxkS2V5ZnJhbWVzKFxuICAgICAgZHJpdmVyLCByb290RWxlbWVudCwgYXN0LCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIHN0YXJ0aW5nU3R5bGVzLCBmaW5hbFN0eWxlcyxcbiAgICAgIG9wdGlvbnMsIHN1Ykluc3RydWN0aW9ucywgZXJyb3JzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YSxcbiAgICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgICAgZXJyb3JzOiBhbnlbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgICBzdWJJbnN0cnVjdGlvbnMgPSBzdWJJbnN0cnVjdGlvbnMgfHwgbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBzdWJJbnN0cnVjdGlvbnMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgZXJyb3JzLCBbXSk7XG4gICAgY29udGV4dC5vcHRpb25zID0gb3B0aW9ucztcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zZXRTdHlsZXMoW3N0YXJ0aW5nU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuXG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdCwgY29udGV4dCk7XG5cbiAgICAvLyB0aGlzIGNoZWNrcyB0byBzZWUgaWYgYW4gYWN0dWFsIGFuaW1hdGlvbiBoYXBwZW5lZFxuICAgIGNvbnN0IHRpbWVsaW5lcyA9IGNvbnRleHQudGltZWxpbmVzLmZpbHRlcih0aW1lbGluZSA9PiB0aW1lbGluZS5jb250YWluc0FuaW1hdGlvbigpKTtcbiAgICBpZiAodGltZWxpbmVzLmxlbmd0aCAmJiBPYmplY3Qua2V5cyhmaW5hbFN0eWxlcykubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0bCA9IHRpbWVsaW5lc1t0aW1lbGluZXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoIXRsLmFsbG93T25seVRpbWVsaW5lU3R5bGVzKCkpIHtcbiAgICAgICAgdGwuc2V0U3R5bGVzKFtmaW5hbFN0eWxlc10sIG51bGwsIGNvbnRleHQuZXJyb3JzLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGltZWxpbmVzLmxlbmd0aCA/IHRpbWVsaW5lcy5tYXAodGltZWxpbmUgPT4gdGltZWxpbmUuYnVpbGRLZXlmcmFtZXMoKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24ocm9vdEVsZW1lbnQsIFtdLCBbXSwgW10sIDAsIDAsICcnLCBmYWxzZSldO1xuICB9XG5cbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IGFueSB7XG4gICAgLy8gdGhlc2UgdmFsdWVzIGFyZSBub3QgdmlzaXRlZCBpbiB0aGlzIEFTVFxuICB9XG5cbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChhc3Q6IEFuaW1hdGVDaGlsZEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBlbGVtZW50SW5zdHJ1Y3Rpb25zID0gY29udGV4dC5zdWJJbnN0cnVjdGlvbnMuY29uc3VtZShjb250ZXh0LmVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50SW5zdHJ1Y3Rpb25zKSB7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgICBjb25zdCBlbmRUaW1lID0gdGhpcy5fdmlzaXRTdWJJbnN0cnVjdGlvbnMoXG4gICAgICAgICAgZWxlbWVudEluc3RydWN0aW9ucywgaW5uZXJDb250ZXh0LCBpbm5lckNvbnRleHQub3B0aW9ucyBhcyBBbmltYXRlQ2hpbGRPcHRpb25zKTtcbiAgICAgIGlmIChzdGFydFRpbWUgIT0gZW5kVGltZSkge1xuICAgICAgICAvLyB3ZSBkbyB0aGlzIG9uIHRoZSB1cHBlciBjb250ZXh0IGJlY2F1c2Ugd2UgY3JlYXRlZCBhIHN1YiBjb250ZXh0IGZvclxuICAgICAgICAvLyB0aGUgc3ViIGNoaWxkIGFuaW1hdGlvbnNcbiAgICAgICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZW5kVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRBbmltYXRlUmVmKGFzdDogQW5pbWF0ZVJlZkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgIGlubmVyQ29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICB0aGlzLnZpc2l0UmVmZXJlbmNlKGFzdC5hbmltYXRpb24sIGlubmVyQ29udGV4dCk7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgIGluc3RydWN0aW9uczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdLCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQsXG4gICAgICBvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zKTogbnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwtY2FzZSBmb3Igd2hlbiBhIHVzZXIgd2FudHMgdG8gc2tpcCBhIHN1YlxuICAgIC8vIGFuaW1hdGlvbiBmcm9tIGJlaW5nIGZpcmVkIGVudGlyZWx5LlxuICAgIGNvbnN0IGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZHVyYXRpb24pIDogbnVsbDtcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgIT0gbnVsbCA/IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KSA6IG51bGw7XG4gICAgaWYgKGR1cmF0aW9uICE9PSAwKSB7XG4gICAgICBpbnN0cnVjdGlvbnMuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uVGltaW5ncyA9XG4gICAgICAgICAgICBjb250ZXh0LmFwcGVuZEluc3RydWN0aW9uVG9UaW1lbGluZShpbnN0cnVjdGlvbiwgZHVyYXRpb24sIGRlbGF5KTtcbiAgICAgICAgZnVydGhlc3RUaW1lID1cbiAgICAgICAgICAgIE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgaW5zdHJ1Y3Rpb25UaW1pbmdzLmR1cmF0aW9uICsgaW5zdHJ1Y3Rpb25UaW1pbmdzLmRlbGF5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmdXJ0aGVzdFRpbWU7XG4gIH1cblxuICB2aXNpdFJlZmVyZW5jZShhc3Q6IFJlZmVyZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29udGV4dC51cGRhdGVPcHRpb25zKGFzdC5vcHRpb25zLCB0cnVlKTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFNlcXVlbmNlKGFzdDogU2VxdWVuY2VBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHN1YkNvbnRleHRDb3VudCA9IGNvbnRleHQuc3ViQ29udGV4dENvdW50O1xuICAgIGxldCBjdHggPSBjb250ZXh0O1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhc3Qub3B0aW9ucztcblxuICAgIGlmIChvcHRpb25zICYmIChvcHRpb25zLnBhcmFtcyB8fCBvcHRpb25zLmRlbGF5KSkge1xuICAgICAgY3R4ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KG9wdGlvbnMpO1xuICAgICAgY3R4LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdHgucHJldmlvdXNOb2RlLnR5cGUgPT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlKSB7XG4gICAgICAgICAgY3R4LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgICAgICBjdHgucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KTtcbiAgICAgICAgY3R4LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhc3Quc3RlcHMubGVuZ3RoKSB7XG4gICAgICBhc3Quc3RlcHMuZm9yRWFjaChzID0+IHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBjdHgpKTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kIHdpdGggYSBzdHlsZSgpIGNhbGxcbiAgICAgIGN0eC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBzb21lIGFuaW1hdGlvbiBmdW5jdGlvbiB3aXRoaW4gdGhlIHNlcXVlbmNlXG4gICAgICAvLyBlbmRlZCB1cCBjcmVhdGluZyBhIHN1YiB0aW1lbGluZSAod2hpY2ggbWVhbnMgdGhlIGN1cnJlbnRcbiAgICAgIC8vIHRpbWVsaW5lIGNhbm5vdCBvdmVybGFwIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBzZXF1ZW5jZSlcbiAgICAgIGlmIChjdHguc3ViQ29udGV4dENvdW50ID4gc3ViQ29udGV4dENvdW50KSB7XG4gICAgICAgIGN0eC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0R3JvdXAoYXN0OiBHcm91cEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZXM6IFRpbWVsaW5lQnVpbGRlcltdID0gW107XG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGRlbGF5ID0gYXN0Lm9wdGlvbnMgJiYgYXN0Lm9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUoYXN0Lm9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zKTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBpbm5lckNvbnRleHQpO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICAgIGlubmVyVGltZWxpbmVzLnB1c2goaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIG9wZXJhdGlvbiBpcyBydW4gYWZ0ZXIgdGhlIEFTVCBsb29wIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gaWYgdGhlIHBhcmVudCB0aW1lbGluZSdzIGNvbGxlY3RlZCBzdHlsZXMgd2VyZSB1cGRhdGVkIHRoZW5cbiAgICAvLyBpdCB3b3VsZCBwYXNzIGluIGludmFsaWQgZGF0YSBpbnRvIHRoZSBuZXctdG8tYmUgZm9ya2VkIGl0ZW1zXG4gICAgaW5uZXJUaW1lbGluZXMuZm9yRWFjaChcbiAgICAgICAgdGltZWxpbmUgPT4gY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZSkpO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRpbWluZyhhc3Q6IFRpbWluZ0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGlmICgoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLmR5bmFtaWMpIHtcbiAgICAgIGNvbnN0IHN0clZhbHVlID0gKGFzdCBhcyBEeW5hbWljVGltaW5nQXN0KS5zdHJWYWx1ZTtcbiAgICAgIGNvbnN0IHRpbWluZ1ZhbHVlID1cbiAgICAgICAgICBjb250ZXh0LnBhcmFtcyA/IGludGVycG9sYXRlUGFyYW1zKHN0clZhbHVlLCBjb250ZXh0LnBhcmFtcywgY29udGV4dC5lcnJvcnMpIDogc3RyVmFsdWU7XG4gICAgICByZXR1cm4gcmVzb2x2ZVRpbWluZyh0aW1pbmdWYWx1ZSwgY29udGV4dC5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiBhc3QuZHVyYXRpb24sIGRlbGF5OiBhc3QuZGVsYXksIGVhc2luZzogYXN0LmVhc2luZ307XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBbmltYXRlKGFzdDogQW5pbWF0ZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgdGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5fdmlzaXRUaW1pbmcoYXN0LnRpbWluZ3MsIGNvbnRleHQpO1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKHRpbWluZ3MuZGVsYXkpIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmRlbGF5KTtcbiAgICAgIHRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gYXN0LnN0eWxlO1xuICAgIGlmIChzdHlsZS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMpIHtcbiAgICAgIHRoaXMudmlzaXRLZXlmcmFtZXMoc3R5bGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmluY3JlbWVudFRpbWUodGltaW5ncy5kdXJhdGlvbik7XG4gICAgICB0aGlzLnZpc2l0U3R5bGUoc3R5bGUgYXMgU3R5bGVBc3QsIGNvbnRleHQpO1xuICAgICAgdGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBudWxsO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdHlsZShhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyAhO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhIHN0eWxlKCkgY2FsbFxuICAgIC8vIGRpcmVjdGx5IGZvbGxvd3MgIGFuIGFuaW1hdGUoKSBjYWxsIChidXQgbm90IGluc2lkZSBvZiBhbiBhbmltYXRlKCkgY2FsbClcbiAgICBpZiAoIXRpbWluZ3MgJiYgdGltZWxpbmUuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCkge1xuICAgICAgdGltZWxpbmUuZm9yd2FyZEZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZWFzaW5nID0gKHRpbWluZ3MgJiYgdGltaW5ncy5lYXNpbmcpIHx8IGFzdC5lYXNpbmc7XG4gICAgaWYgKGFzdC5pc0VtcHR5U3RlcCkge1xuICAgICAgdGltZWxpbmUuYXBwbHlFbXB0eVN0ZXAoZWFzaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZWxpbmUuc2V0U3R5bGVzKGFzdC5zdHlsZXMsIGVhc2luZywgY29udGV4dC5lcnJvcnMsIGNvbnRleHQub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEtleWZyYW1lcyhhc3Q6IEtleWZyYW1lc0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgY3VycmVudEFuaW1hdGVUaW1pbmdzID0gY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgITtcbiAgICBjb25zdCBzdGFydFRpbWUgPSAoY29udGV4dC5jdXJyZW50VGltZWxpbmUgISkuZHVyYXRpb247XG4gICAgY29uc3QgZHVyYXRpb24gPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZHVyYXRpb247XG4gICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KCk7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaW5uZXJUaW1lbGluZS5lYXNpbmcgPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZWFzaW5nO1xuXG4gICAgYXN0LnN0eWxlcy5mb3JFYWNoKHN0ZXAgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBzdGVwLm9mZnNldCB8fCAwO1xuICAgICAgaW5uZXJUaW1lbGluZS5mb3J3YXJkVGltZShvZmZzZXQgKiBkdXJhdGlvbik7XG4gICAgICBpbm5lclRpbWVsaW5lLnNldFN0eWxlcyhzdGVwLnN0eWxlcywgc3RlcC5lYXNpbmcsIGNvbnRleHQuZXJyb3JzLCBjb250ZXh0Lm9wdGlvbnMpO1xuICAgICAgaW5uZXJUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgcGFyZW50IHRpbWVsaW5lIGdldHMgYWxsIHRoZSBzdHlsZXMgZnJvbVxuICAgIC8vIHRoZSBjaGlsZCBldmVuIGlmIHRoZSBuZXcgdGltZWxpbmUgYmVsb3cgaXMgbm90IHVzZWRcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKGlubmVyVGltZWxpbmUpO1xuXG4gICAgLy8gd2UgZG8gdGhpcyBiZWNhdXNlIHRoZSB3aW5kb3cgYmV0d2VlbiB0aGlzIHRpbWVsaW5lIGFuZCB0aGUgc3ViIHRpbWVsaW5lXG4gICAgLy8gc2hvdWxkIGVuc3VyZSB0aGF0IHRoZSBzdHlsZXMgd2l0aGluIGFyZSBleGFjdGx5IHRoZSBzYW1lIGFzIHRoZXkgd2VyZSBiZWZvcmVcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShzdGFydFRpbWUgKyBkdXJhdGlvbik7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFF1ZXJ5KGFzdDogUXVlcnlBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBmaXJzdCBzdGVwIGJlZm9yZSB0aGlzIGlzIGEgc3R5bGUgc3RlcCB3ZSBuZWVkXG4gICAgLy8gdG8gZW5zdXJlIHRoZSBzdHlsZXMgYXJlIGFwcGxpZWQgYmVmb3JlIHRoZSBjaGlsZHJlbiBhcmUgYW5pbWF0ZWRcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBvcHRpb25zID0gKGFzdC5vcHRpb25zIHx8IHt9KSBhcyBBbmltYXRpb25RdWVyeU9wdGlvbnM7XG4gICAgY29uc3QgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGlmIChkZWxheSAmJiAoY29udGV4dC5wcmV2aW91c05vZGUudHlwZSA9PT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlIHx8XG4gICAgICAgICAgICAgICAgICAoc3RhcnRUaW1lID09IDAgJiYgY29udGV4dC5jdXJyZW50VGltZWxpbmUuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCkpKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgfVxuXG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IHN0YXJ0VGltZTtcbiAgICBjb25zdCBlbG1zID0gY29udGV4dC5pbnZva2VRdWVyeShcbiAgICAgICAgYXN0LnNlbGVjdG9yLCBhc3Qub3JpZ2luYWxTZWxlY3RvciwgYXN0LmxpbWl0LCBhc3QuaW5jbHVkZVNlbGYsXG4gICAgICAgIG9wdGlvbnMub3B0aW9uYWwgPyB0cnVlIDogZmFsc2UsIGNvbnRleHQuZXJyb3JzKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSBlbG1zLmxlbmd0aDtcbiAgICBsZXQgc2FtZUVsZW1lbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyfG51bGwgPSBudWxsO1xuICAgIGVsbXMuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuXG4gICAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gaTtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucywgZWxlbWVudCk7XG4gICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgaW5uZXJDb250ZXh0LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudCA9PT0gY29udGV4dC5lbGVtZW50KSB7XG4gICAgICAgIHNhbWVFbGVtZW50VGltZWxpbmUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgICAgfVxuXG4gICAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kXG4gICAgICAvLyB3aXRoIGEgc3R5bGUoKSBjYWxsICh3aGljaCBpcyBoZXJlIHRvIHNpZ25hbCB0aGF0IHRoaXMgaXMgYSBwcmVwYXJhdG9yeVxuICAgICAgLy8gY2FsbCB0byBzdHlsZSBhbiBlbGVtZW50IGJlZm9yZSBpdCBpcyBhbmltYXRlZCBhZ2FpbilcbiAgICAgIGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIGNvbnN0IGVuZFRpbWUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBlbmRUaW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSAwO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG5cbiAgICBpZiAoc2FtZUVsZW1lbnRUaW1lbGluZSkge1xuICAgICAgY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyhzYW1lRWxlbWVudFRpbWVsaW5lKTtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdGFnZ2VyKGFzdDogU3RhZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgcGFyZW50Q29udGV4dCA9IGNvbnRleHQucGFyZW50Q29udGV4dCAhO1xuICAgIGNvbnN0IHRsID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGFzdC50aW1pbmdzO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5hYnModGltaW5ncy5kdXJhdGlvbik7XG4gICAgY29uc3QgbWF4VGltZSA9IGR1cmF0aW9uICogKGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgLSAxKTtcbiAgICBsZXQgZGVsYXkgPSBkdXJhdGlvbiAqIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXg7XG5cbiAgICBsZXQgc3RhZ2dlclRyYW5zZm9ybWVyID0gdGltaW5ncy5kdXJhdGlvbiA8IDAgPyAncmV2ZXJzZScgOiB0aW1pbmdzLmVhc2luZztcbiAgICBzd2l0Y2ggKHN0YWdnZXJUcmFuc2Zvcm1lcikge1xuICAgICAgY2FzZSAncmV2ZXJzZSc6XG4gICAgICAgIGRlbGF5ID0gbWF4VGltZSAtIGRlbGF5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgICBkZWxheSA9IHBhcmVudENvbnRleHQuY3VycmVudFN0YWdnZXJUaW1lO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGlmIChkZWxheSkge1xuICAgICAgdGltZWxpbmUuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRpbmdUaW1lID0gdGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuXG4gICAgLy8gdGltZSA9IGR1cmF0aW9uICsgZGVsYXlcbiAgICAvLyB0aGUgcmVhc29uIHdoeSB0aGlzIGNvbXB1dGF0aW9uIGlzIHNvIGNvbXBsZXggaXMgYmVjYXVzZVxuICAgIC8vIHRoZSBpbm5lciB0aW1lbGluZSBtYXkgZWl0aGVyIGhhdmUgYSBkZWxheSB2YWx1ZSBvciBhIHN0cmV0Y2hlZFxuICAgIC8vIGtleWZyYW1lIGRlcGVuZGluZyBvbiBpZiBhIHN1YnRpbWVsaW5lIGlzIG5vdCB1c2VkIG9yIGlzIHVzZWQuXG4gICAgcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWUgPVxuICAgICAgICAodGwuY3VycmVudFRpbWUgLSBzdGFydGluZ1RpbWUpICsgKHRsLnN0YXJ0VGltZSAtIHBhcmVudENvbnRleHQuY3VycmVudFRpbWVsaW5lLnN0YXJ0VGltZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBTdHlsZUF0VGltZSA9IHtcbiAgdGltZTogbnVtYmVyOyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyO1xufTtcblxuY29uc3QgREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREUgPSA8QXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4+e307XG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHtcbiAgcHVibGljIHBhcmVudENvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dHxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyO1xuICBwdWJsaWMgY3VycmVudEFuaW1hdGVUaW1pbmdzOiBBbmltYXRlVGltaW5nc3xudWxsID0gbnVsbDtcbiAgcHVibGljIHByZXZpb3VzTm9kZTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4gPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgcHVibGljIHN1YkNvbnRleHRDb3VudCA9IDA7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gIHB1YmxpYyBjdXJyZW50UXVlcnlJbmRleDogbnVtYmVyID0gMDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeVRvdGFsOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFN0YWdnZXJUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksXG4gICAgICBwdWJsaWMgc3ViSW5zdHJ1Y3Rpb25zOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIHByaXZhdGUgX2VudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIF9sZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBwdWJsaWMgZXJyb3JzOiBhbnlbXSwgcHVibGljIHRpbWVsaW5lczogVGltZWxpbmVCdWlsZGVyW10sXG4gICAgICBpbml0aWFsVGltZWxpbmU/OiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IGluaXRpYWxUaW1lbGluZSB8fCBuZXcgVGltZWxpbmVCdWlsZGVyKHRoaXMuX2RyaXZlciwgZWxlbWVudCwgMCk7XG4gICAgdGltZWxpbmVzLnB1c2godGhpcy5jdXJyZW50VGltZWxpbmUpO1xuICB9XG5cbiAgZ2V0IHBhcmFtcygpIHsgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXM7IH1cblxuICB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCwgc2tpcElmRXhpc3RzPzogYm9vbGVhbikge1xuICAgIGlmICghb3B0aW9ucykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV3T3B0aW9ucyA9IG9wdGlvbnMgYXMgYW55O1xuICAgIGxldCBvcHRpb25zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBOT1RFOiB0aGlzIHdpbGwgZ2V0IHBhdGNoZWQgdXAgd2hlbiBvdGhlciBhbmltYXRpb24gbWV0aG9kcyBzdXBwb3J0IGR1cmF0aW9uIG92ZXJyaWRlc1xuICAgIGlmIChuZXdPcHRpb25zLmR1cmF0aW9uICE9IG51bGwpIHtcbiAgICAgIChvcHRpb25zVG9VcGRhdGUgYXMgYW55KS5kdXJhdGlvbiA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAobmV3T3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zVG9VcGRhdGUuZGVsYXkgPSByZXNvbHZlVGltaW5nVmFsdWUobmV3T3B0aW9ucy5kZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGFyYW1zID0gbmV3T3B0aW9ucy5wYXJhbXM7XG4gICAgaWYgKG5ld1BhcmFtcykge1xuICAgICAgbGV0IHBhcmFtc1RvVXBkYXRlOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSBvcHRpb25zVG9VcGRhdGUucGFyYW1zICE7XG4gICAgICBpZiAoIXBhcmFtc1RvVXBkYXRlKSB7XG4gICAgICAgIHBhcmFtc1RvVXBkYXRlID0gdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBPYmplY3Qua2V5cyhuZXdQYXJhbXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGlmICghc2tpcElmRXhpc3RzIHx8ICFwYXJhbXNUb1VwZGF0ZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgIHBhcmFtc1RvVXBkYXRlW25hbWVdID0gaW50ZXJwb2xhdGVQYXJhbXMobmV3UGFyYW1zW25hbWVdLCBwYXJhbXNUb1VwZGF0ZSwgdGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb3B5T3B0aW9ucygpIHtcbiAgICBjb25zdCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgY29uc3Qgb2xkUGFyYW1zID0gdGhpcy5vcHRpb25zLnBhcmFtcztcbiAgICAgIGlmIChvbGRQYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSBvcHRpb25zWydwYXJhbXMnXSA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhvbGRQYXJhbXMpLmZvckVhY2gobmFtZSA9PiB7IHBhcmFtc1tuYW1lXSA9IG9sZFBhcmFtc1tuYW1lXTsgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgY3JlYXRlU3ViQ29udGV4dChvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGwgPSBudWxsLCBlbGVtZW50PzogYW55LCBuZXdUaW1lPzogbnVtYmVyKTpcbiAgICAgIEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZWxlbWVudCB8fCB0aGlzLmVsZW1lbnQ7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgdGFyZ2V0LCB0aGlzLnN1Ykluc3RydWN0aW9ucywgdGhpcy5fZW50ZXJDbGFzc05hbWUsIHRoaXMuX2xlYXZlQ2xhc3NOYW1lLFxuICAgICAgICB0aGlzLmVycm9ycywgdGhpcy50aW1lbGluZXMsIHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGFyZ2V0LCBuZXdUaW1lIHx8IDApKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IHRoaXMucHJldmlvdXNOb2RlO1xuICAgIGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5jdXJyZW50QW5pbWF0ZVRpbWluZ3M7XG5cbiAgICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLl9jb3B5T3B0aW9ucygpO1xuICAgIGNvbnRleHQudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSB0aGlzLmN1cnJlbnRRdWVyeUluZGV4O1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSB0aGlzLmN1cnJlbnRRdWVyeVRvdGFsO1xuICAgIGNvbnRleHQucGFyZW50Q29udGV4dCA9IHRoaXM7XG4gICAgdGhpcy5zdWJDb250ZXh0Q291bnQrKztcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuXG4gIHRyYW5zZm9ybUludG9OZXdUaW1lbGluZShuZXdUaW1lPzogbnVtYmVyKSB7XG4gICAgdGhpcy5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGhpcy5lbGVtZW50LCBuZXdUaW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKHRoaXMuY3VycmVudFRpbWVsaW5lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZWxpbmU7XG4gIH1cblxuICBhcHBlbmRJbnN0cnVjdGlvblRvVGltZWxpbmUoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwgZHVyYXRpb246IG51bWJlcnxudWxsLFxuICAgICAgZGVsYXk6IG51bWJlcnxudWxsKTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGNvbnN0IHVwZGF0ZWRUaW1pbmdzOiBBbmltYXRlVGltaW5ncyA9IHtcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAhPSBudWxsID8gZHVyYXRpb24gOiBpbnN0cnVjdGlvbi5kdXJhdGlvbixcbiAgICAgIGRlbGF5OiB0aGlzLmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSArIChkZWxheSAhPSBudWxsID8gZGVsYXkgOiAwKSArIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgZWFzaW5nOiAnJ1xuICAgIH07XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTdWJUaW1lbGluZUJ1aWxkZXIoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgaW5zdHJ1Y3Rpb24uZWxlbWVudCwgaW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBpbnN0cnVjdGlvbi5wcmVTdHlsZVByb3BzLFxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcywgdXBkYXRlZFRpbWluZ3MsIGluc3RydWN0aW9uLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKGJ1aWxkZXIpO1xuICAgIHJldHVybiB1cGRhdGVkVGltaW5ncztcbiAgfVxuXG4gIGluY3JlbWVudFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZWxpbmUuZHVyYXRpb24gKyB0aW1lKTtcbiAgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIG5lZ2F0aXZlIGRlbGF5cyBhcmUgbm90IHlldCBzdXBwb3J0ZWRcbiAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG4gIH1cblxuICBpbnZva2VRdWVyeShcbiAgICAgIHNlbGVjdG9yOiBzdHJpbmcsIG9yaWdpbmFsU2VsZWN0b3I6IHN0cmluZywgbGltaXQ6IG51bWJlciwgaW5jbHVkZVNlbGY6IGJvb2xlYW4sXG4gICAgICBvcHRpb25hbDogYm9vbGVhbiwgZXJyb3JzOiBhbnlbXSk6IGFueVtdIHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAoaW5jbHVkZVNlbGYpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkgeyAgLy8gaWYgOnNlbGYgaXMgb25seSB1c2VkIHRoZW4gdGhlIHNlbGVjdG9yIGlzIGVtcHR5XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoRU5URVJfVE9LRU5fUkVHRVgsICcuJyArIHRoaXMuX2VudGVyQ2xhc3NOYW1lKTtcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShMRUFWRV9UT0tFTl9SRUdFWCwgJy4nICsgdGhpcy5fbGVhdmVDbGFzc05hbWUpO1xuICAgICAgY29uc3QgbXVsdGkgPSBsaW1pdCAhPSAxO1xuICAgICAgbGV0IGVsZW1lbnRzID0gdGhpcy5fZHJpdmVyLnF1ZXJ5KHRoaXMuZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgICAgIGlmIChsaW1pdCAhPT0gMCkge1xuICAgICAgICBlbGVtZW50cyA9IGxpbWl0IDwgMCA/IGVsZW1lbnRzLnNsaWNlKGVsZW1lbnRzLmxlbmd0aCArIGxpbWl0LCBlbGVtZW50cy5sZW5ndGgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICB9XG4gICAgICByZXN1bHRzLnB1c2goLi4uZWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9uYWwgJiYgcmVzdWx0cy5sZW5ndGggPT0gMCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgYFxcYHF1ZXJ5KFwiJHtvcmlnaW5hbFNlbGVjdG9yfVwiKVxcYCByZXR1cm5lZCB6ZXJvIGVsZW1lbnRzLiAoVXNlIFxcYHF1ZXJ5KFwiJHtvcmlnaW5hbFNlbGVjdG9yfVwiLCB7IG9wdGlvbmFsOiB0cnVlIH0pXFxgIGlmIHlvdSB3aXNoIHRvIGFsbG93IHRoaXMuKWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgZHVyYXRpb246IG51bWJlciA9IDA7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwdWJsaWMgZWFzaW5nICE6IHN0cmluZyB8IG51bGw7XG4gIHByaXZhdGUgX3ByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2N1cnJlbnRLZXlmcmFtZTogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfa2V5ZnJhbWVzID0gbmV3IE1hcDxudW1iZXIsIMm1U3R5bGVEYXRhPigpO1xuICBwcml2YXRlIF9zdHlsZVN1bW1hcnk6IHtbcHJvcDogc3RyaW5nXTogU3R5bGVBdFRpbWV9ID0ge307XG4gIHByaXZhdGUgX2xvY2FsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhO1xuICBwcml2YXRlIF9nbG9iYWxUaW1lbGluZVN0eWxlczogybVTdHlsZURhdGE7XG4gIHByaXZhdGUgX3BlbmRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2JhY2tGaWxsOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWU6IMm1U3R5bGVEYXRhfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBzdGFydFRpbWU6IG51bWJlcixcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cD86IE1hcDxhbnksIMm1U3R5bGVEYXRhPikge1xuICAgIGlmICghdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKSB7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcyA9IE9iamVjdC5jcmVhdGUodGhpcy5fYmFja0ZpbGwsIHt9KTtcbiAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cC5nZXQoZWxlbWVudCkgITtcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXM7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuc2V0KGVsZW1lbnQsIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodGhpcy5fa2V5ZnJhbWVzLnNpemUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoID4gMDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRTdHlsZVByb3BlcnRpZXMoKTogc3RyaW5nW10geyByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY3VycmVudEtleWZyYW1lKTsgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHsgcmV0dXJuIHRoaXMuc3RhcnRUaW1lICsgdGhpcy5kdXJhdGlvbjsgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IGEgc3R5bGUoKSBzdGVwIGlzIHBsYWNlZCByaWdodCBiZWZvcmUgYSBzdGFnZ2VyKClcbiAgICAvLyBhbmQgdGhhdCBzdHlsZSgpIHN0ZXAgaXMgdGhlIHZlcnkgZmlyc3Qgc3R5bGUoKSB2YWx1ZSBpbiB0aGUgYW5pbWF0aW9uXG4gICAgLy8gdGhlbiB3ZSBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIHRoZSBrZXlmcmFtZSBbMCwgY29weSwgMV0gc28gdGhhdCB0aGUgZGVsYXlcbiAgICAvLyBwcm9wZXJseSBhcHBsaWVzIHRoZSBzdHlsZSgpIHZhbHVlcyB0byB3b3JrIHdpdGggdGhlIHN0YWdnZXIuLi5cbiAgICBjb25zdCBoYXNQcmVTdHlsZVN0ZXAgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PSAxICYmIE9iamVjdC5rZXlzKHRoaXMuX3BlbmRpbmdTdHlsZXMpLmxlbmd0aDtcblxuICAgIGlmICh0aGlzLmR1cmF0aW9uIHx8IGhhc1ByZVN0eWxlU3RlcCkge1xuICAgICAgdGhpcy5mb3J3YXJkVGltZSh0aGlzLmN1cnJlbnRUaW1lICsgZGVsYXkpO1xuICAgICAgaWYgKGhhc1ByZVN0eWxlU3RlcCkge1xuICAgICAgICB0aGlzLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZSArPSBkZWxheTtcbiAgICB9XG4gIH1cblxuICBmb3JrKGVsZW1lbnQ6IGFueSwgY3VycmVudFRpbWU/OiBudW1iZXIpOiBUaW1lbGluZUJ1aWxkZXIge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgcmV0dXJuIG5ldyBUaW1lbGluZUJ1aWxkZXIoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgZWxlbWVudCwgY3VycmVudFRpbWUgfHwgdGhpcy5jdXJyZW50VGltZSwgdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRLZXlmcmFtZSgpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lID0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUgPSB0aGlzLl9rZXlmcmFtZXMuZ2V0KHRoaXMuZHVyYXRpb24pICE7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSA9IE9iamVjdC5jcmVhdGUodGhpcy5fYmFja0ZpbGwsIHt9KTtcbiAgICAgIHRoaXMuX2tleWZyYW1lcy5zZXQodGhpcy5kdXJhdGlvbiwgdGhpcy5fY3VycmVudEtleWZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkRnJhbWUoKSB7XG4gICAgdGhpcy5kdXJhdGlvbiArPSBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgZm9yd2FyZFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB0aGlzLmR1cmF0aW9uID0gdGltZTtcbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0eWxlKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXIpIHtcbiAgICB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdID0gdmFsdWU7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9zdHlsZVN1bW1hcnlbcHJvcF0gPSB7dGltZTogdGhpcy5jdXJyZW50VGltZSwgdmFsdWV9O1xuICB9XG5cbiAgYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgIT09IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTsgfVxuXG4gIGFwcGx5RW1wdHlTdGVwKGVhc2luZzogc3RyaW5nfG51bGwpIHtcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lWydlYXNpbmcnXSA9IGVhc2luZztcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGFuaW1hdGUoZHVyYXRpb24pOlxuICAgIC8vIGFsbCBtaXNzaW5nIHN0eWxlcyBhcmUgZmlsbGVkIHdpdGggYSBgKmAgdmFsdWUgdGhlblxuICAgIC8vIGlmIGFueSBkZXN0aW5hdGlvbiBzdHlsZXMgYXJlIGZpbGxlZCBpbiBsYXRlciBvbiB0aGUgc2FtZVxuICAgIC8vIGtleWZyYW1lIHRoZW4gdGhleSB3aWxsIG92ZXJyaWRlIHRoZSBvdmVycmlkZGVuIHN0eWxlc1xuICAgIC8vIFdlIHVzZSBgX2dsb2JhbFRpbWVsaW5lU3R5bGVzYCBoZXJlIGJlY2F1c2UgdGhlcmUgbWF5IGJlXG4gICAgLy8gc3R5bGVzIGluIHByZXZpb3VzIGtleWZyYW1lcyB0aGF0IGFyZSBub3QgcHJlc2VudCBpbiB0aGlzIHRpbWVsaW5lXG4gICAgT2JqZWN0LmtleXModGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB0aGlzLl9iYWNrRmlsbFtwcm9wXSA9IHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzW3Byb3BdIHx8IEFVVE9fU1RZTEU7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWVbcHJvcF0gPSBBVVRPX1NUWUxFO1xuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZSA9IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgfVxuXG4gIHNldFN0eWxlcyhcbiAgICAgIGlucHV0OiAoybVTdHlsZURhdGF8c3RyaW5nKVtdLCBlYXNpbmc6IHN0cmluZ3xudWxsLCBlcnJvcnM6IGFueVtdLFxuICAgICAgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lWydlYXNpbmcnXSA9IGVhc2luZztcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXMgPSAob3B0aW9ucyAmJiBvcHRpb25zLnBhcmFtcykgfHwge307XG4gICAgY29uc3Qgc3R5bGVzID0gZmxhdHRlblN0eWxlcyhpbnB1dCwgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMpO1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IGludGVycG9sYXRlUGFyYW1zKHN0eWxlc1twcm9wXSwgcGFyYW1zLCBlcnJvcnMpO1xuICAgICAgdGhpcy5fcGVuZGluZ1N0eWxlc1twcm9wXSA9IHZhbDtcbiAgICAgIGlmICghdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICB0aGlzLl9iYWNrRmlsbFtwcm9wXSA9IHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzLmhhc093blByb3BlcnR5KHByb3ApID9cbiAgICAgICAgICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzW3Byb3BdIDpcbiAgICAgICAgICAgIEFVVE9fU1RZTEU7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCB2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlTdHlsZXNUb0tleWZyYW1lKCkge1xuICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuX3BlbmRpbmdTdHlsZXM7XG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHlsZXMpO1xuICAgIGlmIChwcm9wcy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgdGhpcy5fcGVuZGluZ1N0eWxlcyA9IHt9O1xuXG4gICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IHZhbDtcbiAgICB9KTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2N1cnJlbnRLZXlmcmFtZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWVbcHJvcF0gPSB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc25hcHNob3RDdXJyZW50U3R5bGVzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWwgPSB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdO1xuICAgICAgdGhpcy5fcGVuZGluZ1N0eWxlc1twcm9wXSA9IHZhbDtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIHZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRGaW5hbEtleWZyYW1lKCkgeyByZXR1cm4gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKTsgfVxuXG4gIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChsZXQgcHJvcCBpbiB0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaChwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICBtZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICBPYmplY3Qua2V5cyh0aW1lbGluZS5fc3R5bGVTdW1tYXJ5KS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgZGV0YWlsczAgPSB0aGlzLl9zdHlsZVN1bW1hcnlbcHJvcF07XG4gICAgICBjb25zdCBkZXRhaWxzMSA9IHRpbWVsaW5lLl9zdHlsZVN1bW1hcnlbcHJvcF07XG4gICAgICBpZiAoIWRldGFpbHMwIHx8IGRldGFpbHMxLnRpbWUgPiBkZXRhaWxzMC50aW1lKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIGRldGFpbHMxLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgY29uc3QgcHJlU3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHBvc3RTdHlsZVByb3BzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgaXNFbXB0eSA9IHRoaXMuX2tleWZyYW1lcy5zaXplID09PSAxICYmIHRoaXMuZHVyYXRpb24gPT09IDA7XG5cbiAgICBsZXQgZmluYWxLZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10gPSBbXTtcbiAgICB0aGlzLl9rZXlmcmFtZXMuZm9yRWFjaCgoa2V5ZnJhbWUsIHRpbWUpID0+IHtcbiAgICAgIGNvbnN0IGZpbmFsS2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lLCB0cnVlKTtcbiAgICAgIE9iamVjdC5rZXlzKGZpbmFsS2V5ZnJhbWUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZmluYWxLZXlmcmFtZVtwcm9wXTtcbiAgICAgICAgaWYgKHZhbHVlID09IFBSRV9TVFlMRSkge1xuICAgICAgICAgIHByZVN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09IEFVVE9fU1RZTEUpIHtcbiAgICAgICAgICBwb3N0U3R5bGVQcm9wcy5hZGQocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFpc0VtcHR5KSB7XG4gICAgICAgIGZpbmFsS2V5ZnJhbWVbJ29mZnNldCddID0gdGltZSAvIHRoaXMuZHVyYXRpb247XG4gICAgICB9XG4gICAgICBmaW5hbEtleWZyYW1lcy5wdXNoKGZpbmFsS2V5ZnJhbWUpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcHJlUHJvcHM6IHN0cmluZ1tdID0gcHJlU3R5bGVQcm9wcy5zaXplID8gaXRlcmF0b3JUb0FycmF5KHByZVN0eWxlUHJvcHMudmFsdWVzKCkpIDogW107XG4gICAgY29uc3QgcG9zdFByb3BzOiBzdHJpbmdbXSA9IHBvc3RTdHlsZVByb3BzLnNpemUgPyBpdGVyYXRvclRvQXJyYXkocG9zdFN0eWxlUHJvcHMudmFsdWVzKCkpIDogW107XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGEgMC1zZWNvbmQgYW5pbWF0aW9uICh3aGljaCBpcyBkZXNpZ25lZCBqdXN0IHRvIHBsYWNlIHN0eWxlcyBvbnNjcmVlbilcbiAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgY29uc3Qga2YwID0gZmluYWxLZXlmcmFtZXNbMF07XG4gICAgICBjb25zdCBrZjEgPSBjb3B5T2JqKGtmMCk7XG4gICAgICBrZjBbJ29mZnNldCddID0gMDtcbiAgICAgIGtmMVsnb2Zmc2V0J10gPSAxO1xuICAgICAgZmluYWxLZXlmcmFtZXMgPSBba2YwLCBrZjFdO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGZpbmFsS2V5ZnJhbWVzLCBwcmVQcm9wcywgcG9zdFByb3BzLCB0aGlzLmR1cmF0aW9uLCB0aGlzLnN0YXJ0VGltZSxcbiAgICAgICAgdGhpcy5lYXNpbmcsIGZhbHNlKTtcbiAgfVxufVxuXG5jbGFzcyBTdWJUaW1lbGluZUJ1aWxkZXIgZXh0ZW5kcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgdGltaW5nczogQW5pbWF0ZVRpbWluZ3M7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczogybVTdHlsZURhdGFbXSxcbiAgICAgIHB1YmxpYyBwcmVTdHlsZVByb3BzOiBzdHJpbmdbXSwgcHVibGljIHBvc3RTdHlsZVByb3BzOiBzdHJpbmdbXSwgdGltaW5nczogQW5pbWF0ZVRpbWluZ3MsXG4gICAgICBwcml2YXRlIF9zdHJldGNoU3RhcnRpbmdLZXlmcmFtZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoZHJpdmVyLCBlbGVtZW50LCB0aW1pbmdzLmRlbGF5KTtcbiAgICB0aGlzLnRpbWluZ3MgPSB7ZHVyYXRpb246IHRpbWluZ3MuZHVyYXRpb24sIGRlbGF5OiB0aW1pbmdzLmRlbGF5LCBlYXNpbmc6IHRpbWluZ3MuZWFzaW5nfTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5rZXlmcmFtZXMubGVuZ3RoID4gMTsgfVxuXG4gIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBrZXlmcmFtZXMgPSB0aGlzLmtleWZyYW1lcztcbiAgICBsZXQge2RlbGF5LCBkdXJhdGlvbiwgZWFzaW5nfSA9IHRoaXMudGltaW5ncztcbiAgICBpZiAodGhpcy5fc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgJiYgZGVsYXkpIHtcbiAgICAgIGNvbnN0IG5ld0tleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICAgICAgY29uc3QgdG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTtcbiAgICAgIGNvbnN0IHN0YXJ0aW5nR2FwID0gZGVsYXkgLyB0b3RhbFRpbWU7XG5cbiAgICAgIC8vIHRoZSBvcmlnaW5hbCBzdGFydGluZyBrZXlmcmFtZSBub3cgc3RhcnRzIG9uY2UgdGhlIGRlbGF5IGlzIGRvbmVcbiAgICAgIGNvbnN0IG5ld0ZpcnN0S2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lc1swXSwgZmFsc2UpO1xuICAgICAgbmV3Rmlyc3RLZXlmcmFtZVsnb2Zmc2V0J10gPSAwO1xuICAgICAgbmV3S2V5ZnJhbWVzLnB1c2gobmV3Rmlyc3RLZXlmcmFtZSk7XG5cbiAgICAgIGNvbnN0IG9sZEZpcnN0S2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lc1swXSwgZmFsc2UpO1xuICAgICAgb2xkRmlyc3RLZXlmcmFtZVsnb2Zmc2V0J10gPSByb3VuZE9mZnNldChzdGFydGluZ0dhcCk7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChvbGRGaXJzdEtleWZyYW1lKTtcblxuICAgICAgLypcbiAgICAgICAgV2hlbiB0aGUga2V5ZnJhbWUgaXMgc3RyZXRjaGVkIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgZGVsYXkgYmVmb3JlIHRoZSBhbmltYXRpb25cbiAgICAgICAgc3RhcnRzIGlzIGdvbmUuIEluc3RlYWQgdGhlIGZpcnN0IGtleWZyYW1lIGlzIHBsYWNlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgICBhbmQgaXQgaXMgdGhlbiBjb3BpZWQgdG8gd2hlcmUgaXQgc3RhcnRzIHdoZW4gdGhlIG9yaWdpbmFsIGRlbGF5IGlzIG92ZXIuIFRoaXMgYmFzaWNhbGx5XG4gICAgICAgIG1lYW5zIG5vdGhpbmcgYW5pbWF0ZXMgZHVyaW5nIHRoYXQgZGVsYXksIGJ1dCB0aGUgc3R5bGVzIGFyZSBzdGlsbCByZW5kZXJlcmVkLiBGb3IgdGhpc1xuICAgICAgICB0byB3b3JrIHRoZSBvcmlnaW5hbCBvZmZzZXQgdmFsdWVzIHRoYXQgZXhpc3QgaW4gdGhlIG9yaWdpbmFsIGtleWZyYW1lcyBtdXN0IGJlIFwid2FycGVkXCJcbiAgICAgICAgc28gdGhhdCB0aGV5IGNhbiB0YWtlIHRoZSBuZXcga2V5ZnJhbWUgKyBkZWxheSBpbnRvIGFjY291bnQuXG5cbiAgICAgICAgZGVsYXk9MTAwMCwgZHVyYXRpb249MTAwMCwga2V5ZnJhbWVzID0gMCAuNSAxXG5cbiAgICAgICAgdHVybnMgaW50b1xuXG4gICAgICAgIGRlbGF5PTAsIGR1cmF0aW9uPTIwMDAsIGtleWZyYW1lcyA9IDAgLjMzIC42NiAxXG4gICAgICAgKi9cblxuICAgICAgLy8gb2Zmc2V0cyBiZXR3ZWVuIDEgLi4uIG4gLTEgYXJlIGFsbCB3YXJwZWQgYnkgdGhlIGtleWZyYW1lIHN0cmV0Y2hcbiAgICAgIGNvbnN0IGxpbWl0ID0ga2V5ZnJhbWVzLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBsaW1pdDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzW2ldLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IG9sZE9mZnNldCA9IGtmWydvZmZzZXQnXSBhcyBudW1iZXI7XG4gICAgICAgIGNvbnN0IHRpbWVBdEtleWZyYW1lID0gZGVsYXkgKyBvbGRPZmZzZXQgKiBkdXJhdGlvbjtcbiAgICAgICAga2ZbJ29mZnNldCddID0gcm91bmRPZmZzZXQodGltZUF0S2V5ZnJhbWUgLyB0b3RhbFRpbWUpO1xuICAgICAgICBuZXdLZXlmcmFtZXMucHVzaChrZik7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBuZXcgc3RhcnRpbmcga2V5ZnJhbWUgc2hvdWxkIGJlIGFkZGVkIGF0IHRoZSBzdGFydFxuICAgICAgZHVyYXRpb24gPSB0b3RhbFRpbWU7XG4gICAgICBkZWxheSA9IDA7XG4gICAgICBlYXNpbmcgPSAnJztcblxuICAgICAga2V5ZnJhbWVzID0gbmV3S2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGtleWZyYW1lcywgdGhpcy5wcmVTdHlsZVByb3BzLCB0aGlzLnBvc3RTdHlsZVByb3BzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZyxcbiAgICAgICAgdHJ1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm91bmRPZmZzZXQob2Zmc2V0OiBudW1iZXIsIGRlY2ltYWxQb2ludHMgPSAzKTogbnVtYmVyIHtcbiAgY29uc3QgbXVsdCA9IE1hdGgucG93KDEwLCBkZWNpbWFsUG9pbnRzIC0gMSk7XG4gIHJldHVybiBNYXRoLnJvdW5kKG9mZnNldCAqIG11bHQpIC8gbXVsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlblN0eWxlcyhpbnB1dDogKMm1U3R5bGVEYXRhIHwgc3RyaW5nKVtdLCBhbGxTdHlsZXM6IMm1U3R5bGVEYXRhKSB7XG4gIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgbGV0IGFsbFByb3BlcnRpZXM6IHN0cmluZ1tdO1xuICBpbnB1dC5mb3JFYWNoKHRva2VuID0+IHtcbiAgICBpZiAodG9rZW4gPT09ICcqJykge1xuICAgICAgYWxsUHJvcGVydGllcyA9IGFsbFByb3BlcnRpZXMgfHwgT2JqZWN0LmtleXMoYWxsU3R5bGVzKTtcbiAgICAgIGFsbFByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHsgc3R5bGVzW3Byb3BdID0gQVVUT19TVFlMRTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlTdHlsZXModG9rZW4gYXMgybVTdHlsZURhdGEsIGZhbHNlLCBzdHlsZXMpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdHlsZXM7XG59XG4iXX0=