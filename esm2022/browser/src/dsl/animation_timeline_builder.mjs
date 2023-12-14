/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationMetadataType, AUTO_STYLE, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { invalidQuery } from '../error_helpers';
import { interpolateParams, resolveTiming, resolveTimingValue, visitDslNode } from '../util';
import { createTimelineInstruction } from './animation_timeline_instruction';
import { ElementInstructionMap } from './element_instruction_map';
const ONE_FRAME_IN_MILLISECONDS = 1;
const ENTER_TOKEN = ':enter';
const ENTER_TOKEN_REGEX = new RegExp(ENTER_TOKEN, 'g');
const LEAVE_TOKEN = ':leave';
const LEAVE_TOKEN_REGEX = new RegExp(LEAVE_TOKEN, 'g');
/*
 * The code within this file aims to generate web-animations-compatible keyframes from Angular's
 * animation DSL code.
 *
 * The code below will be converted from:
 *
 * ```
 * sequence([
 *   style({ opacity: 0 }),
 *   animate(1000, style({ opacity: 0 }))
 * ])
 * ```
 *
 * To:
 * ```
 * keyframes = [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 1 }]
 * duration = 1000
 * delay = 0
 * easing = ''
 * ```
 *
 * For this operation to cover the combination of animation verbs (style, animate, group, etc...) a
 * combination of AST traversal and merge-sort-like algorithms are used.
 *
 * [AST Traversal]
 * Each of the animation verbs, when executed, will return an string-map object representing what
 * type of action it is (style, animate, group, etc...) and the data associated with it. This means
 * that when functional composition mix of these functions is evaluated (like in the example above)
 * then it will end up producing a tree of objects representing the animation itself.
 *
 * When this animation object tree is processed by the visitor code below it will visit each of the
 * verb statements within the visitor. And during each visit it will build the context of the
 * animation keyframes by interacting with the `TimelineBuilder`.
 *
 * [TimelineBuilder]
 * This class is responsible for tracking the styles and building a series of keyframe objects for a
 * timeline between a start and end time. The builder starts off with an initial timeline and each
 * time the AST comes across a `group()`, `keyframes()` or a combination of the two within a
 * `sequence()` then it will generate a sub timeline for each step as well as a new one after
 * they are complete.
 *
 * As the AST is traversed, the timing state on each of the timelines will be incremented. If a sub
 * timeline was created (based on one of the cases above) then the parent timeline will attempt to
 * merge the styles used within the sub timelines into itself (only with group() this will happen).
 * This happens with a merge operation (much like how the merge works in mergeSort) and it will only
 * copy the most recently used styles from the sub timelines into the parent timeline. This ensures
 * that if the styles are used later on in another phase of the animation then they will be the most
 * up-to-date values.
 *
 * [How Missing Styles Are Updated]
 * Each timeline has a `backFill` property which is responsible for filling in new styles into
 * already processed keyframes if a new style shows up later within the animation sequence.
 *
 * ```
 * sequence([
 *   style({ width: 0 }),
 *   animate(1000, style({ width: 100 })),
 *   animate(1000, style({ width: 200 })),
 *   animate(1000, style({ width: 300 }))
 *   animate(1000, style({ width: 400, height: 400 })) // notice how `height` doesn't exist anywhere
 * else
 * ])
 * ```
 *
 * What is happening here is that the `height` value is added later in the sequence, but is missing
 * from all previous animation steps. Therefore when a keyframe is created it would also be missing
 * from all previous keyframes up until where it is first used. For the timeline keyframe generation
 * to properly fill in the style it will place the previous value (the value from the parent
 * timeline) or a default value of `*` into the backFill map.
 *
 * When a sub-timeline is created it will have its own backFill property. This is done so that
 * styles present within the sub-timeline do not accidentally seep into the previous/future timeline
 * keyframes
 *
 * [Validation]
 * The code in this file is not responsible for validation. That functionality happens with within
 * the `AnimationValidatorVisitor` code.
 */
export function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = new Map(), finalStyles = new Map(), options, subInstructions, errors = []) {
    return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
export class AnimationTimelineBuilderVisitor {
    buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
        subInstructions = subInstructions || new ElementInstructionMap();
        const context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
        context.options = options;
        const delay = options.delay ? resolveTimingValue(options.delay) : 0;
        context.currentTimeline.delayNextStep(delay);
        context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
        visitDslNode(this, ast, context);
        // this checks to see if an actual animation happened
        const timelines = context.timelines.filter(timeline => timeline.containsAnimation());
        // note: we just want to apply the final styles for the rootElement, so we do not
        //       just apply the styles to the last timeline but the last timeline which
        //       element is the root one (basically `*`-styles are replaced with the actual
        //       state style values only for the root element)
        if (timelines.length && finalStyles.size) {
            let lastRootTimeline;
            for (let i = timelines.length - 1; i >= 0; i--) {
                const timeline = timelines[i];
                if (timeline.element === rootElement) {
                    lastRootTimeline = timeline;
                    break;
                }
            }
            if (lastRootTimeline && !lastRootTimeline.allowOnlyTimelineStyles()) {
                lastRootTimeline.setStyles([finalStyles], null, context.errors, options);
            }
        }
        return timelines.length ?
            timelines.map(timeline => timeline.buildKeyframes()) :
            [createTimelineInstruction(rootElement, [], [], [], 0, delay, '', false)];
    }
    visitTrigger(ast, context) {
        // these values are not visited in this AST
    }
    visitState(ast, context) {
        // these values are not visited in this AST
    }
    visitTransition(ast, context) {
        // these values are not visited in this AST
    }
    visitAnimateChild(ast, context) {
        const elementInstructions = context.subInstructions.get(context.element);
        if (elementInstructions) {
            const innerContext = context.createSubContext(ast.options);
            const startTime = context.currentTimeline.currentTime;
            const endTime = this._visitSubInstructions(elementInstructions, innerContext, innerContext.options);
            if (startTime != endTime) {
                // we do this on the upper context because we created a sub context for
                // the sub child animations
                context.transformIntoNewTimeline(endTime);
            }
        }
        context.previousNode = ast;
    }
    visitAnimateRef(ast, context) {
        const innerContext = context.createSubContext(ast.options);
        innerContext.transformIntoNewTimeline();
        this._applyAnimationRefDelays([ast.options, ast.animation.options], context, innerContext);
        this.visitReference(ast.animation, innerContext);
        context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        context.previousNode = ast;
    }
    _applyAnimationRefDelays(animationsRefsOptions, context, innerContext) {
        for (const animationRefOptions of animationsRefsOptions) {
            const animationDelay = animationRefOptions?.delay;
            if (animationDelay) {
                const animationDelayValue = typeof animationDelay === 'number' ?
                    animationDelay :
                    resolveTimingValue(interpolateParams(animationDelay, animationRefOptions?.params ?? {}, context.errors));
                innerContext.delayNextStep(animationDelayValue);
            }
        }
    }
    _visitSubInstructions(instructions, context, options) {
        const startTime = context.currentTimeline.currentTime;
        let furthestTime = startTime;
        // this is a special-case for when a user wants to skip a sub
        // animation from being fired entirely.
        const duration = options.duration != null ? resolveTimingValue(options.duration) : null;
        const delay = options.delay != null ? resolveTimingValue(options.delay) : null;
        if (duration !== 0) {
            instructions.forEach(instruction => {
                const instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
                furthestTime =
                    Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
            });
        }
        return furthestTime;
    }
    visitReference(ast, context) {
        context.updateOptions(ast.options, true);
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
    }
    visitSequence(ast, context) {
        const subContextCount = context.subContextCount;
        let ctx = context;
        const options = ast.options;
        if (options && (options.params || options.delay)) {
            ctx = context.createSubContext(options);
            ctx.transformIntoNewTimeline();
            if (options.delay != null) {
                if (ctx.previousNode.type == AnimationMetadataType.Style) {
                    ctx.currentTimeline.snapshotCurrentStyles();
                    ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
                }
                const delay = resolveTimingValue(options.delay);
                ctx.delayNextStep(delay);
            }
        }
        if (ast.steps.length) {
            ast.steps.forEach(s => visitDslNode(this, s, ctx));
            // this is here just in case the inner steps only contain or end with a style() call
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
    visitGroup(ast, context) {
        const innerTimelines = [];
        let furthestTime = context.currentTimeline.currentTime;
        const delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
        ast.steps.forEach(s => {
            const innerContext = context.createSubContext(ast.options);
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
    _visitTiming(ast, context) {
        if (ast.dynamic) {
            const strValue = ast.strValue;
            const timingValue = context.params ? interpolateParams(strValue, context.params, context.errors) : strValue;
            return resolveTiming(timingValue, context.errors);
        }
        else {
            return { duration: ast.duration, delay: ast.delay, easing: ast.easing };
        }
    }
    visitAnimate(ast, context) {
        const timings = context.currentAnimateTimings = this._visitTiming(ast.timings, context);
        const timeline = context.currentTimeline;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            timeline.snapshotCurrentStyles();
        }
        const style = ast.style;
        if (style.type == AnimationMetadataType.Keyframes) {
            this.visitKeyframes(style, context);
        }
        else {
            context.incrementTime(timings.duration);
            this.visitStyle(style, context);
            timeline.applyStylesToKeyframe();
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    }
    visitStyle(ast, context) {
        const timeline = context.currentTimeline;
        const timings = context.currentAnimateTimings;
        // this is a special case for when a style() call
        // directly follows  an animate() call (but not inside of an animate() call)
        if (!timings && timeline.hasCurrentStyleProperties()) {
            timeline.forwardFrame();
        }
        const easing = (timings && timings.easing) || ast.easing;
        if (ast.isEmptyStep) {
            timeline.applyEmptyStep(easing);
        }
        else {
            timeline.setStyles(ast.styles, easing, context.errors, context.options);
        }
        context.previousNode = ast;
    }
    visitKeyframes(ast, context) {
        const currentAnimateTimings = context.currentAnimateTimings;
        const startTime = (context.currentTimeline).duration;
        const duration = currentAnimateTimings.duration;
        const innerContext = context.createSubContext();
        const innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = currentAnimateTimings.easing;
        ast.styles.forEach(step => {
            const offset = step.offset || 0;
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
    visitQuery(ast, context) {
        // in the event that the first step before this is a style step we need
        // to ensure the styles are applied before the children are animated
        const startTime = context.currentTimeline.currentTime;
        const options = (ast.options || {});
        const delay = options.delay ? resolveTimingValue(options.delay) : 0;
        if (delay &&
            (context.previousNode.type === AnimationMetadataType.Style ||
                (startTime == 0 && context.currentTimeline.hasCurrentStyleProperties()))) {
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        let furthestTime = startTime;
        const elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
        context.currentQueryTotal = elms.length;
        let sameElementTimeline = null;
        elms.forEach((element, i) => {
            context.currentQueryIndex = i;
            const innerContext = context.createSubContext(ast.options, element);
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
            const endTime = innerContext.currentTimeline.currentTime;
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
    visitStagger(ast, context) {
        const parentContext = context.parentContext;
        const tl = context.currentTimeline;
        const timings = ast.timings;
        const duration = Math.abs(timings.duration);
        const maxTime = duration * (context.currentQueryTotal - 1);
        let delay = duration * context.currentQueryIndex;
        let staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
        switch (staggerTransformer) {
            case 'reverse':
                delay = maxTime - delay;
                break;
            case 'full':
                delay = parentContext.currentStaggerTime;
                break;
        }
        const timeline = context.currentTimeline;
        if (delay) {
            timeline.delayNextStep(delay);
        }
        const startingTime = timeline.currentTime;
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
const DEFAULT_NOOP_PREVIOUS_NODE = {};
export class AnimationTimelineContext {
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
    get params() {
        return this.options.params;
    }
    updateOptions(options, skipIfExists) {
        if (!options)
            return;
        const newOptions = options;
        let optionsToUpdate = this.options;
        // NOTE: this will get patched up when other animation methods support duration overrides
        if (newOptions.duration != null) {
            optionsToUpdate.duration = resolveTimingValue(newOptions.duration);
        }
        if (newOptions.delay != null) {
            optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
        }
        const newParams = newOptions.params;
        if (newParams) {
            let paramsToUpdate = optionsToUpdate.params;
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
    _copyOptions() {
        const options = {};
        if (this.options) {
            const oldParams = this.options.params;
            if (oldParams) {
                const params = options['params'] = {};
                Object.keys(oldParams).forEach(name => {
                    params[name] = oldParams[name];
                });
            }
        }
        return options;
    }
    createSubContext(options = null, element, newTime) {
        const target = element || this.element;
        const context = new AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
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
    transformIntoNewTimeline(newTime) {
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    }
    appendInstructionToTimeline(instruction, duration, delay) {
        const updatedTimings = {
            duration: duration != null ? duration : instruction.duration,
            delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
            easing: ''
        };
        const builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
        this.timelines.push(builder);
        return updatedTimings;
    }
    incrementTime(time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    }
    delayNextStep(delay) {
        // negative delays are not yet supported
        if (delay > 0) {
            this.currentTimeline.delayNextStep(delay);
        }
    }
    invokeQuery(selector, originalSelector, limit, includeSelf, optional, errors) {
        let results = [];
        if (includeSelf) {
            results.push(this.element);
        }
        if (selector.length > 0) { // only if :self is used then the selector can be empty
            selector = selector.replace(ENTER_TOKEN_REGEX, '.' + this._enterClassName);
            selector = selector.replace(LEAVE_TOKEN_REGEX, '.' + this._leaveClassName);
            const multi = limit != 1;
            let elements = this._driver.query(this.element, selector, multi);
            if (limit !== 0) {
                elements = limit < 0 ? elements.slice(elements.length + limit, elements.length) :
                    elements.slice(0, limit);
            }
            results.push(...elements);
        }
        if (!optional && results.length == 0) {
            errors.push(invalidQuery(originalSelector));
        }
        return results;
    }
}
export class TimelineBuilder {
    constructor(_driver, element, startTime, _elementTimelineStylesLookup) {
        this._driver = _driver;
        this.element = element;
        this.startTime = startTime;
        this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
        this.duration = 0;
        this.easing = null;
        this._previousKeyframe = new Map();
        this._currentKeyframe = new Map();
        this._keyframes = new Map();
        this._styleSummary = new Map();
        this._localTimelineStyles = new Map();
        this._pendingStyles = new Map();
        this._backFill = new Map();
        this._currentEmptyStepKeyframe = null;
        if (!this._elementTimelineStylesLookup) {
            this._elementTimelineStylesLookup = new Map();
        }
        this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element);
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
            this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
        }
        this._loadKeyframe();
    }
    containsAnimation() {
        switch (this._keyframes.size) {
            case 0:
                return false;
            case 1:
                return this.hasCurrentStyleProperties();
            default:
                return true;
        }
    }
    hasCurrentStyleProperties() {
        return this._currentKeyframe.size > 0;
    }
    get currentTime() {
        return this.startTime + this.duration;
    }
    delayNextStep(delay) {
        // in the event that a style() step is placed right before a stagger()
        // and that style() step is the very first style() value in the animation
        // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
        // properly applies the style() values to work with the stagger...
        const hasPreStyleStep = this._keyframes.size === 1 && this._pendingStyles.size;
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
    fork(element, currentTime) {
        this.applyStylesToKeyframe();
        return new TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
    }
    _loadKeyframe() {
        if (this._currentKeyframe) {
            this._previousKeyframe = this._currentKeyframe;
        }
        this._currentKeyframe = this._keyframes.get(this.duration);
        if (!this._currentKeyframe) {
            this._currentKeyframe = new Map();
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    }
    forwardFrame() {
        this.duration += ONE_FRAME_IN_MILLISECONDS;
        this._loadKeyframe();
    }
    forwardTime(time) {
        this.applyStylesToKeyframe();
        this.duration = time;
        this._loadKeyframe();
    }
    _updateStyle(prop, value) {
        this._localTimelineStyles.set(prop, value);
        this._globalTimelineStyles.set(prop, value);
        this._styleSummary.set(prop, { time: this.currentTime, value });
    }
    allowOnlyTimelineStyles() {
        return this._currentEmptyStepKeyframe !== this._currentKeyframe;
    }
    applyEmptyStep(easing) {
        if (easing) {
            this._previousKeyframe.set('easing', easing);
        }
        // special case for animate(duration):
        // all missing styles are filled with a `*` value then
        // if any destination styles are filled in later on the same
        // keyframe then they will override the overridden styles
        // We use `_globalTimelineStyles` here because there may be
        // styles in previous keyframes that are not present in this timeline
        for (let [prop, value] of this._globalTimelineStyles) {
            this._backFill.set(prop, value || AUTO_STYLE);
            this._currentKeyframe.set(prop, AUTO_STYLE);
        }
        this._currentEmptyStepKeyframe = this._currentKeyframe;
    }
    setStyles(input, easing, errors, options) {
        if (easing) {
            this._previousKeyframe.set('easing', easing);
        }
        const params = (options && options.params) || {};
        const styles = flattenStyles(input, this._globalTimelineStyles);
        for (let [prop, value] of styles) {
            const val = interpolateParams(value, params, errors);
            this._pendingStyles.set(prop, val);
            if (!this._localTimelineStyles.has(prop)) {
                this._backFill.set(prop, this._globalTimelineStyles.get(prop) ?? AUTO_STYLE);
            }
            this._updateStyle(prop, val);
        }
    }
    applyStylesToKeyframe() {
        if (this._pendingStyles.size == 0)
            return;
        this._pendingStyles.forEach((val, prop) => {
            this._currentKeyframe.set(prop, val);
        });
        this._pendingStyles.clear();
        this._localTimelineStyles.forEach((val, prop) => {
            if (!this._currentKeyframe.has(prop)) {
                this._currentKeyframe.set(prop, val);
            }
        });
    }
    snapshotCurrentStyles() {
        for (let [prop, val] of this._localTimelineStyles) {
            this._pendingStyles.set(prop, val);
            this._updateStyle(prop, val);
        }
    }
    getFinalKeyframe() {
        return this._keyframes.get(this.duration);
    }
    get properties() {
        const properties = [];
        for (let prop in this._currentKeyframe) {
            properties.push(prop);
        }
        return properties;
    }
    mergeTimelineCollectedStyles(timeline) {
        timeline._styleSummary.forEach((details1, prop) => {
            const details0 = this._styleSummary.get(prop);
            if (!details0 || details1.time > details0.time) {
                this._updateStyle(prop, details1.value);
            }
        });
    }
    buildKeyframes() {
        this.applyStylesToKeyframe();
        const preStyleProps = new Set();
        const postStyleProps = new Set();
        const isEmpty = this._keyframes.size === 1 && this.duration === 0;
        let finalKeyframes = [];
        this._keyframes.forEach((keyframe, time) => {
            const finalKeyframe = new Map([...this._backFill, ...keyframe]);
            finalKeyframe.forEach((value, prop) => {
                if (value === PRE_STYLE) {
                    preStyleProps.add(prop);
                }
                else if (value === AUTO_STYLE) {
                    postStyleProps.add(prop);
                }
            });
            if (!isEmpty) {
                finalKeyframe.set('offset', time / this.duration);
            }
            finalKeyframes.push(finalKeyframe);
        });
        const preProps = [...preStyleProps.values()];
        const postProps = [...postStyleProps.values()];
        // special case for a 0-second animation (which is designed just to place styles onscreen)
        if (isEmpty) {
            const kf0 = finalKeyframes[0];
            const kf1 = new Map(kf0);
            kf0.set('offset', 0);
            kf1.set('offset', 1);
            finalKeyframes = [kf0, kf1];
        }
        return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
    }
}
class SubTimelineBuilder extends TimelineBuilder {
    constructor(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
        super(driver, element, timings.delay);
        this.keyframes = keyframes;
        this.preStyleProps = preStyleProps;
        this.postStyleProps = postStyleProps;
        this._stretchStartingKeyframe = _stretchStartingKeyframe;
        this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
    }
    containsAnimation() {
        return this.keyframes.length > 1;
    }
    buildKeyframes() {
        let keyframes = this.keyframes;
        let { delay, duration, easing } = this.timings;
        if (this._stretchStartingKeyframe && delay) {
            const newKeyframes = [];
            const totalTime = duration + delay;
            const startingGap = delay / totalTime;
            // the original starting keyframe now starts once the delay is done
            const newFirstKeyframe = new Map(keyframes[0]);
            newFirstKeyframe.set('offset', 0);
            newKeyframes.push(newFirstKeyframe);
            const oldFirstKeyframe = new Map(keyframes[0]);
            oldFirstKeyframe.set('offset', roundOffset(startingGap));
            newKeyframes.push(oldFirstKeyframe);
            /*
              When the keyframe is stretched then it means that the delay before the animation
              starts is gone. Instead the first keyframe is placed at the start of the animation
              and it is then copied to where it starts when the original delay is over. This basically
              means nothing animates during that delay, but the styles are still rendered. For this
              to work the original offset values that exist in the original keyframes must be "warped"
              so that they can take the new keyframe + delay into account.
      
              delay=1000, duration=1000, keyframes = 0 .5 1
      
              turns into
      
              delay=0, duration=2000, keyframes = 0 .33 .66 1
             */
            // offsets between 1 ... n -1 are all warped by the keyframe stretch
            const limit = keyframes.length - 1;
            for (let i = 1; i <= limit; i++) {
                let kf = new Map(keyframes[i]);
                const oldOffset = kf.get('offset');
                const timeAtKeyframe = delay + oldOffset * duration;
                kf.set('offset', roundOffset(timeAtKeyframe / totalTime));
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
function roundOffset(offset, decimalPoints = 3) {
    const mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
function flattenStyles(input, allStyles) {
    const styles = new Map();
    let allProperties;
    input.forEach(token => {
        if (token === '*') {
            allProperties ??= allStyles.keys();
            for (let prop of allProperties) {
                styles.set(prop, AUTO_STYLE);
            }
        }
        else {
            for (let [prop, val] of token) {
                styles.set(prop, val);
            }
        }
    });
    return styles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQXNDLHFCQUFxQixFQUEyQyxVQUFVLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUU1TCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFOUMsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHM0YsT0FBTyxFQUErQix5QkFBeUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3pHLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkVHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUNuQyxNQUF1QixFQUFFLFdBQWdCLEVBQUUsR0FBK0IsRUFDMUUsY0FBc0IsRUFBRSxjQUFzQixFQUFFLGlCQUFnQyxJQUFJ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SSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFDLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFzQyxFQUFFLFNBQXdCO0lBQ3JGLE1BQU0sTUFBTSxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3hDLElBQUksYUFBZ0QsQ0FBQztJQUNyRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLGFBQWEsS0FBSyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkMsS0FBSyxJQUFJLElBQUksSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ04sS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEtBQXNCLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0ZUNoaWxkT3B0aW9ucywgQW5pbWF0ZVRpbWluZ3MsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUXVlcnlPcHRpb25zLCBBVVRPX1NUWUxFLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhTWFwfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtpbnZhbGlkUXVlcnl9IGZyb20gJy4uL2Vycm9yX2hlbHBlcnMnO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7aW50ZXJwb2xhdGVQYXJhbXMsIHJlc29sdmVUaW1pbmcsIHJlc29sdmVUaW1pbmdWYWx1ZSwgdmlzaXREc2xOb2RlfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtBbmltYXRlQXN0LCBBbmltYXRlQ2hpbGRBc3QsIEFuaW1hdGVSZWZBc3QsIEFzdCwgQXN0VmlzaXRvciwgRHluYW1pY1RpbWluZ0FzdCwgR3JvdXBBc3QsIEtleWZyYW1lc0FzdCwgUXVlcnlBc3QsIFJlZmVyZW5jZUFzdCwgU2VxdWVuY2VBc3QsIFN0YWdnZXJBc3QsIFN0YXRlQXN0LCBTdHlsZUFzdCwgVGltaW5nQXN0LCBUcmFuc2l0aW9uQXN0LCBUcmlnZ2VyQXN0fSBmcm9tICcuL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5cbmNvbnN0IE9ORV9GUkFNRV9JTl9NSUxMSVNFQ09ORFMgPSAxO1xuY29uc3QgRU5URVJfVE9LRU4gPSAnOmVudGVyJztcbmNvbnN0IEVOVEVSX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChFTlRFUl9UT0tFTiwgJ2cnKTtcbmNvbnN0IExFQVZFX1RPS0VOID0gJzpsZWF2ZSc7XG5jb25zdCBMRUFWRV9UT0tFTl9SRUdFWCA9IG5ldyBSZWdFeHAoTEVBVkVfVE9LRU4sICdnJyk7XG5cbi8qXG4gKiBUaGUgY29kZSB3aXRoaW4gdGhpcyBmaWxlIGFpbXMgdG8gZ2VuZXJhdGUgd2ViLWFuaW1hdGlvbnMtY29tcGF0aWJsZSBrZXlmcmFtZXMgZnJvbSBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgY29kZS5cbiAqXG4gKiBUaGUgY29kZSBiZWxvdyB3aWxsIGJlIGNvbnZlcnRlZCBmcm9tOlxuICpcbiAqIGBgYFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFRvOlxuICogYGBgXG4gKiBrZXlmcmFtZXMgPSBbeyBvcGFjaXR5OiAwLCBvZmZzZXQ6IDAgfSwgeyBvcGFjaXR5OiAxLCBvZmZzZXQ6IDEgfV1cbiAqIGR1cmF0aW9uID0gMTAwMFxuICogZGVsYXkgPSAwXG4gKiBlYXNpbmcgPSAnJ1xuICogYGBgXG4gKlxuICogRm9yIHRoaXMgb3BlcmF0aW9uIHRvIGNvdmVyIHRoZSBjb21iaW5hdGlvbiBvZiBhbmltYXRpb24gdmVyYnMgKHN0eWxlLCBhbmltYXRlLCBncm91cCwgZXRjLi4uKSBhXG4gKiBjb21iaW5hdGlvbiBvZiBBU1QgdHJhdmVyc2FsIGFuZCBtZXJnZS1zb3J0LWxpa2UgYWxnb3JpdGhtcyBhcmUgdXNlZC5cbiAqXG4gKiBbQVNUIFRyYXZlcnNhbF1cbiAqIEVhY2ggb2YgdGhlIGFuaW1hdGlvbiB2ZXJicywgd2hlbiBleGVjdXRlZCwgd2lsbCByZXR1cm4gYW4gc3RyaW5nLW1hcCBvYmplY3QgcmVwcmVzZW50aW5nIHdoYXRcbiAqIHR5cGUgb2YgYWN0aW9uIGl0IGlzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYW5kIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBpdC4gVGhpcyBtZWFuc1xuICogdGhhdCB3aGVuIGZ1bmN0aW9uYWwgY29tcG9zaXRpb24gbWl4IG9mIHRoZXNlIGZ1bmN0aW9ucyBpcyBldmFsdWF0ZWQgKGxpa2UgaW4gdGhlIGV4YW1wbGUgYWJvdmUpXG4gKiB0aGVuIGl0IHdpbGwgZW5kIHVwIHByb2R1Y2luZyBhIHRyZWUgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIGFuaW1hdGlvbiBpdHNlbGYuXG4gKlxuICogV2hlbiB0aGlzIGFuaW1hdGlvbiBvYmplY3QgdHJlZSBpcyBwcm9jZXNzZWQgYnkgdGhlIHZpc2l0b3IgY29kZSBiZWxvdyBpdCB3aWxsIHZpc2l0IGVhY2ggb2YgdGhlXG4gKiB2ZXJiIHN0YXRlbWVudHMgd2l0aGluIHRoZSB2aXNpdG9yLiBBbmQgZHVyaW5nIGVhY2ggdmlzaXQgaXQgd2lsbCBidWlsZCB0aGUgY29udGV4dCBvZiB0aGVcbiAqIGFuaW1hdGlvbiBrZXlmcmFtZXMgYnkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgYFRpbWVsaW5lQnVpbGRlcmAuXG4gKlxuICogW1RpbWVsaW5lQnVpbGRlcl1cbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIHRoZSBzdHlsZXMgYW5kIGJ1aWxkaW5nIGEgc2VyaWVzIG9mIGtleWZyYW1lIG9iamVjdHMgZm9yIGFcbiAqIHRpbWVsaW5lIGJldHdlZW4gYSBzdGFydCBhbmQgZW5kIHRpbWUuIFRoZSBidWlsZGVyIHN0YXJ0cyBvZmYgd2l0aCBhbiBpbml0aWFsIHRpbWVsaW5lIGFuZCBlYWNoXG4gKiB0aW1lIHRoZSBBU1QgY29tZXMgYWNyb3NzIGEgYGdyb3VwKClgLCBga2V5ZnJhbWVzKClgIG9yIGEgY29tYmluYXRpb24gb2YgdGhlIHR3byB3aXRoaW4gYVxuICogYHNlcXVlbmNlKClgIHRoZW4gaXQgd2lsbCBnZW5lcmF0ZSBhIHN1YiB0aW1lbGluZSBmb3IgZWFjaCBzdGVwIGFzIHdlbGwgYXMgYSBuZXcgb25lIGFmdGVyXG4gKiB0aGV5IGFyZSBjb21wbGV0ZS5cbiAqXG4gKiBBcyB0aGUgQVNUIGlzIHRyYXZlcnNlZCwgdGhlIHRpbWluZyBzdGF0ZSBvbiBlYWNoIG9mIHRoZSB0aW1lbGluZXMgd2lsbCBiZSBpbmNyZW1lbnRlZC4gSWYgYSBzdWJcbiAqIHRpbWVsaW5lIHdhcyBjcmVhdGVkIChiYXNlZCBvbiBvbmUgb2YgdGhlIGNhc2VzIGFib3ZlKSB0aGVuIHRoZSBwYXJlbnQgdGltZWxpbmUgd2lsbCBhdHRlbXB0IHRvXG4gKiBtZXJnZSB0aGUgc3R5bGVzIHVzZWQgd2l0aGluIHRoZSBzdWIgdGltZWxpbmVzIGludG8gaXRzZWxmIChvbmx5IHdpdGggZ3JvdXAoKSB0aGlzIHdpbGwgaGFwcGVuKS5cbiAqIFRoaXMgaGFwcGVucyB3aXRoIGEgbWVyZ2Ugb3BlcmF0aW9uIChtdWNoIGxpa2UgaG93IHRoZSBtZXJnZSB3b3JrcyBpbiBtZXJnZVNvcnQpIGFuZCBpdCB3aWxsIG9ubHlcbiAqIGNvcHkgdGhlIG1vc3QgcmVjZW50bHkgdXNlZCBzdHlsZXMgZnJvbSB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIHRoZSBwYXJlbnQgdGltZWxpbmUuIFRoaXMgZW5zdXJlc1xuICogdGhhdCBpZiB0aGUgc3R5bGVzIGFyZSB1c2VkIGxhdGVyIG9uIGluIGFub3RoZXIgcGhhc2Ugb2YgdGhlIGFuaW1hdGlvbiB0aGVuIHRoZXkgd2lsbCBiZSB0aGUgbW9zdFxuICogdXAtdG8tZGF0ZSB2YWx1ZXMuXG4gKlxuICogW0hvdyBNaXNzaW5nIFN0eWxlcyBBcmUgVXBkYXRlZF1cbiAqIEVhY2ggdGltZWxpbmUgaGFzIGEgYGJhY2tGaWxsYCBwcm9wZXJ0eSB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgZmlsbGluZyBpbiBuZXcgc3R5bGVzIGludG9cbiAqIGFscmVhZHkgcHJvY2Vzc2VkIGtleWZyYW1lcyBpZiBhIG5ldyBzdHlsZSBzaG93cyB1cCBsYXRlciB3aXRoaW4gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAxMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDIwMCB9KSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMzAwIH0pKVxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSkpIC8vIG5vdGljZSBob3cgYGhlaWdodGAgZG9lc24ndCBleGlzdCBhbnl3aGVyZVxuICogZWxzZVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFdoYXQgaXMgaGFwcGVuaW5nIGhlcmUgaXMgdGhhdCB0aGUgYGhlaWdodGAgdmFsdWUgaXMgYWRkZWQgbGF0ZXIgaW4gdGhlIHNlcXVlbmNlLCBidXQgaXMgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMgYW5pbWF0aW9uIHN0ZXBzLiBUaGVyZWZvcmUgd2hlbiBhIGtleWZyYW1lIGlzIGNyZWF0ZWQgaXQgd291bGQgYWxzbyBiZSBtaXNzaW5nXG4gKiBmcm9tIGFsbCBwcmV2aW91cyBrZXlmcmFtZXMgdXAgdW50aWwgd2hlcmUgaXQgaXMgZmlyc3QgdXNlZC4gRm9yIHRoZSB0aW1lbGluZSBrZXlmcmFtZSBnZW5lcmF0aW9uXG4gKiB0byBwcm9wZXJseSBmaWxsIGluIHRoZSBzdHlsZSBpdCB3aWxsIHBsYWNlIHRoZSBwcmV2aW91cyB2YWx1ZSAodGhlIHZhbHVlIGZyb20gdGhlIHBhcmVudFxuICogdGltZWxpbmUpIG9yIGEgZGVmYXVsdCB2YWx1ZSBvZiBgKmAgaW50byB0aGUgYmFja0ZpbGwgbWFwLlxuICpcbiAqIFdoZW4gYSBzdWItdGltZWxpbmUgaXMgY3JlYXRlZCBpdCB3aWxsIGhhdmUgaXRzIG93biBiYWNrRmlsbCBwcm9wZXJ0eS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAqIHN0eWxlcyBwcmVzZW50IHdpdGhpbiB0aGUgc3ViLXRpbWVsaW5lIGRvIG5vdCBhY2NpZGVudGFsbHkgc2VlcCBpbnRvIHRoZSBwcmV2aW91cy9mdXR1cmUgdGltZWxpbmVcbiAqIGtleWZyYW1lc1xuICpcbiAqIFtWYWxpZGF0aW9uXVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIG5vdCByZXNwb25zaWJsZSBmb3IgdmFsaWRhdGlvbi4gVGhhdCBmdW5jdGlvbmFsaXR5IGhhcHBlbnMgd2l0aCB3aXRoaW5cbiAqIHRoZSBgQW5pbWF0aW9uVmFsaWRhdG9yVmlzaXRvcmAgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCByb290RWxlbWVudDogYW55LCBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKSxcbiAgICBmaW5hbFN0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCksIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLCBlcnJvcnM6IEVycm9yW10gPSBbXSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gIHJldHVybiBuZXcgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvcigpLmJ1aWxkS2V5ZnJhbWVzKFxuICAgICAgZHJpdmVyLCByb290RWxlbWVudCwgYXN0LCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIHN0YXJ0aW5nU3R5bGVzLCBmaW5hbFN0eWxlcyxcbiAgICAgIG9wdGlvbnMsIHN1Ykluc3RydWN0aW9ucywgZXJyb3JzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCxcbiAgICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgIHN1Ykluc3RydWN0aW9ucz86IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCxcbiAgICAgIGVycm9yczogRXJyb3JbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgICBzdWJJbnN0cnVjdGlvbnMgPSBzdWJJbnN0cnVjdGlvbnMgfHwgbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBzdWJJbnN0cnVjdGlvbnMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgZXJyb3JzLCBbXSk7XG4gICAgY29udGV4dC5vcHRpb25zID0gb3B0aW9ucztcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSkgOiAwO1xuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNldFN0eWxlcyhbc3RhcnRpbmdTdHlsZXNdLCBudWxsLCBjb250ZXh0LmVycm9ycywgb3B0aW9ucyk7XG5cbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LCBjb250ZXh0KTtcblxuICAgIC8vIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiBhbiBhY3R1YWwgYW5pbWF0aW9uIGhhcHBlbmVkXG4gICAgY29uc3QgdGltZWxpbmVzID0gY29udGV4dC50aW1lbGluZXMuZmlsdGVyKHRpbWVsaW5lID0+IHRpbWVsaW5lLmNvbnRhaW5zQW5pbWF0aW9uKCkpO1xuXG4gICAgLy8gbm90ZTogd2UganVzdCB3YW50IHRvIGFwcGx5IHRoZSBmaW5hbCBzdHlsZXMgZm9yIHRoZSByb290RWxlbWVudCwgc28gd2UgZG8gbm90XG4gICAgLy8gICAgICAganVzdCBhcHBseSB0aGUgc3R5bGVzIHRvIHRoZSBsYXN0IHRpbWVsaW5lIGJ1dCB0aGUgbGFzdCB0aW1lbGluZSB3aGljaFxuICAgIC8vICAgICAgIGVsZW1lbnQgaXMgdGhlIHJvb3Qgb25lIChiYXNpY2FsbHkgYCpgLXN0eWxlcyBhcmUgcmVwbGFjZWQgd2l0aCB0aGUgYWN0dWFsXG4gICAgLy8gICAgICAgc3RhdGUgc3R5bGUgdmFsdWVzIG9ubHkgZm9yIHRoZSByb290IGVsZW1lbnQpXG4gICAgaWYgKHRpbWVsaW5lcy5sZW5ndGggJiYgZmluYWxTdHlsZXMuc2l6ZSkge1xuICAgICAgbGV0IGxhc3RSb290VGltZWxpbmU6IFRpbWVsaW5lQnVpbGRlcnx1bmRlZmluZWQ7XG4gICAgICBmb3IgKGxldCBpID0gdGltZWxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGltZWxpbmVzW2ldO1xuICAgICAgICBpZiAodGltZWxpbmUuZWxlbWVudCA9PT0gcm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICBsYXN0Um9vdFRpbWVsaW5lID0gdGltZWxpbmU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChsYXN0Um9vdFRpbWVsaW5lICYmICFsYXN0Um9vdFRpbWVsaW5lLmFsbG93T25seVRpbWVsaW5lU3R5bGVzKCkpIHtcbiAgICAgICAgbGFzdFJvb3RUaW1lbGluZS5zZXRTdHlsZXMoW2ZpbmFsU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGltZWxpbmVzLmxlbmd0aCA/XG4gICAgICAgIHRpbWVsaW5lcy5tYXAodGltZWxpbmUgPT4gdGltZWxpbmUuYnVpbGRLZXlmcmFtZXMoKSkgOlxuICAgICAgICBbY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihyb290RWxlbWVudCwgW10sIFtdLCBbXSwgMCwgZGVsYXksICcnLCBmYWxzZSldO1xuICB9XG5cbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IGFueSB7XG4gICAgLy8gdGhlc2UgdmFsdWVzIGFyZSBub3QgdmlzaXRlZCBpbiB0aGlzIEFTVFxuICB9XG5cbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChhc3Q6IEFuaW1hdGVDaGlsZEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBlbGVtZW50SW5zdHJ1Y3Rpb25zID0gY29udGV4dC5zdWJJbnN0cnVjdGlvbnMuZ2V0KGNvbnRleHQuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLl92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgICAgICBlbGVtZW50SW5zdHJ1Y3Rpb25zLCBpbm5lckNvbnRleHQsIGlubmVyQ29udGV4dC5vcHRpb25zIGFzIEFuaW1hdGVDaGlsZE9wdGlvbnMpO1xuICAgICAgaWYgKHN0YXJ0VGltZSAhPSBlbmRUaW1lKSB7XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgb24gdGhlIHVwcGVyIGNvbnRleHQgYmVjYXVzZSB3ZSBjcmVhdGVkIGEgc3ViIGNvbnRleHQgZm9yXG4gICAgICAgIC8vIHRoZSBzdWIgY2hpbGQgYW5pbWF0aW9uc1xuICAgICAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShlbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEFuaW1hdGVSZWYoYXN0OiBBbmltYXRlUmVmQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgaW5uZXJDb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgIHRoaXMuX2FwcGx5QW5pbWF0aW9uUmVmRGVsYXlzKFthc3Qub3B0aW9ucywgYXN0LmFuaW1hdGlvbi5vcHRpb25zXSwgY29udGV4dCwgaW5uZXJDb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0UmVmZXJlbmNlKGFzdC5hbmltYXRpb24sIGlubmVyQ29udGV4dCk7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUFuaW1hdGlvblJlZkRlbGF5cyhcbiAgICAgIGFuaW1hdGlvbnNSZWZzT3B0aW9uczogKEFuaW1hdGlvbk9wdGlvbnN8bnVsbClbXSwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0LFxuICAgICAgaW5uZXJDb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBmb3IgKGNvbnN0IGFuaW1hdGlvblJlZk9wdGlvbnMgb2YgYW5pbWF0aW9uc1JlZnNPcHRpb25zKSB7XG4gICAgICBjb25zdCBhbmltYXRpb25EZWxheSA9IGFuaW1hdGlvblJlZk9wdGlvbnM/LmRlbGF5O1xuICAgICAgaWYgKGFuaW1hdGlvbkRlbGF5KSB7XG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbkRlbGF5VmFsdWUgPSB0eXBlb2YgYW5pbWF0aW9uRGVsYXkgPT09ICdudW1iZXInID9cbiAgICAgICAgICAgIGFuaW1hdGlvbkRlbGF5IDpcbiAgICAgICAgICAgIHJlc29sdmVUaW1pbmdWYWx1ZShpbnRlcnBvbGF0ZVBhcmFtcyhcbiAgICAgICAgICAgICAgICBhbmltYXRpb25EZWxheSwgYW5pbWF0aW9uUmVmT3B0aW9ucz8ucGFyYW1zID8/IHt9LCBjb250ZXh0LmVycm9ycykpO1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChhbmltYXRpb25EZWxheVZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgIGluc3RydWN0aW9uczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdLCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQsXG4gICAgICBvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zKTogbnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwtY2FzZSBmb3Igd2hlbiBhIHVzZXIgd2FudHMgdG8gc2tpcCBhIHN1YlxuICAgIC8vIGFuaW1hdGlvbiBmcm9tIGJlaW5nIGZpcmVkIGVudGlyZWx5LlxuICAgIGNvbnN0IGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZHVyYXRpb24pIDogbnVsbDtcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgIT0gbnVsbCA/IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KSA6IG51bGw7XG4gICAgaWYgKGR1cmF0aW9uICE9PSAwKSB7XG4gICAgICBpbnN0cnVjdGlvbnMuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uVGltaW5ncyA9XG4gICAgICAgICAgICBjb250ZXh0LmFwcGVuZEluc3RydWN0aW9uVG9UaW1lbGluZShpbnN0cnVjdGlvbiwgZHVyYXRpb24sIGRlbGF5KTtcbiAgICAgICAgZnVydGhlc3RUaW1lID1cbiAgICAgICAgICAgIE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgaW5zdHJ1Y3Rpb25UaW1pbmdzLmR1cmF0aW9uICsgaW5zdHJ1Y3Rpb25UaW1pbmdzLmRlbGF5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmdXJ0aGVzdFRpbWU7XG4gIH1cblxuICB2aXNpdFJlZmVyZW5jZShhc3Q6IFJlZmVyZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29udGV4dC51cGRhdGVPcHRpb25zKGFzdC5vcHRpb25zLCB0cnVlKTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFNlcXVlbmNlKGFzdDogU2VxdWVuY2VBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHN1YkNvbnRleHRDb3VudCA9IGNvbnRleHQuc3ViQ29udGV4dENvdW50O1xuICAgIGxldCBjdHggPSBjb250ZXh0O1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhc3Qub3B0aW9ucztcblxuICAgIGlmIChvcHRpb25zICYmIChvcHRpb25zLnBhcmFtcyB8fCBvcHRpb25zLmRlbGF5KSkge1xuICAgICAgY3R4ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KG9wdGlvbnMpO1xuICAgICAgY3R4LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdHgucHJldmlvdXNOb2RlLnR5cGUgPT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlKSB7XG4gICAgICAgICAgY3R4LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgICAgICBjdHgucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KTtcbiAgICAgICAgY3R4LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhc3Quc3RlcHMubGVuZ3RoKSB7XG4gICAgICBhc3Quc3RlcHMuZm9yRWFjaChzID0+IHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBjdHgpKTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW4gY2FzZSB0aGUgaW5uZXIgc3RlcHMgb25seSBjb250YWluIG9yIGVuZCB3aXRoIGEgc3R5bGUoKSBjYWxsXG4gICAgICBjdHguY3VycmVudFRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgc29tZSBhbmltYXRpb24gZnVuY3Rpb24gd2l0aGluIHRoZSBzZXF1ZW5jZVxuICAgICAgLy8gZW5kZWQgdXAgY3JlYXRpbmcgYSBzdWIgdGltZWxpbmUgKHdoaWNoIG1lYW5zIHRoZSBjdXJyZW50XG4gICAgICAvLyB0aW1lbGluZSBjYW5ub3Qgb3ZlcmxhcCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgc2VxdWVuY2UpXG4gICAgICBpZiAoY3R4LnN1YkNvbnRleHRDb3VudCA+IHN1YkNvbnRleHRDb3VudCkge1xuICAgICAgICBjdHgudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEdyb3VwKGFzdDogR3JvdXBBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IGlubmVyVGltZWxpbmVzOiBUaW1lbGluZUJ1aWxkZXJbXSA9IFtdO1xuICAgIGxldCBmdXJ0aGVzdFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBkZWxheSA9IGFzdC5vcHRpb25zICYmIGFzdC5vcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKGFzdC5vcHRpb25zLmRlbGF5KSA6IDA7XG5cbiAgICBhc3Quc3RlcHMuZm9yRWFjaChzID0+IHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgaW5uZXJDb250ZXh0LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuXG4gICAgICB2aXNpdERzbE5vZGUodGhpcywgcywgaW5uZXJDb250ZXh0KTtcbiAgICAgIGZ1cnRoZXN0VGltZSA9IE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSk7XG4gICAgICBpbm5lclRpbWVsaW5lcy5wdXNoKGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBvcGVyYXRpb24gaXMgcnVuIGFmdGVyIHRoZSBBU1QgbG9vcCBiZWNhdXNlIG90aGVyd2lzZVxuICAgIC8vIGlmIHRoZSBwYXJlbnQgdGltZWxpbmUncyBjb2xsZWN0ZWQgc3R5bGVzIHdlcmUgdXBkYXRlZCB0aGVuXG4gICAgLy8gaXQgd291bGQgcGFzcyBpbiBpbnZhbGlkIGRhdGEgaW50byB0aGUgbmV3LXRvLWJlIGZvcmtlZCBpdGVtc1xuICAgIGlubmVyVGltZWxpbmVzLmZvckVhY2goXG4gICAgICAgIHRpbWVsaW5lID0+IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXModGltZWxpbmUpKTtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShmdXJ0aGVzdFRpbWUpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRUaW1pbmcoYXN0OiBUaW1pbmdBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IEFuaW1hdGVUaW1pbmdzIHtcbiAgICBpZiAoKGFzdCBhcyBEeW5hbWljVGltaW5nQXN0KS5keW5hbWljKSB7XG4gICAgICBjb25zdCBzdHJWYWx1ZSA9IChhc3QgYXMgRHluYW1pY1RpbWluZ0FzdCkuc3RyVmFsdWU7XG4gICAgICBjb25zdCB0aW1pbmdWYWx1ZSA9XG4gICAgICAgICAgY29udGV4dC5wYXJhbXMgPyBpbnRlcnBvbGF0ZVBhcmFtcyhzdHJWYWx1ZSwgY29udGV4dC5wYXJhbXMsIGNvbnRleHQuZXJyb3JzKSA6IHN0clZhbHVlO1xuICAgICAgcmV0dXJuIHJlc29sdmVUaW1pbmcodGltaW5nVmFsdWUsIGNvbnRleHQuZXJyb3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtkdXJhdGlvbjogYXN0LmR1cmF0aW9uLCBkZWxheTogYXN0LmRlbGF5LCBlYXNpbmc6IGFzdC5lYXNpbmd9O1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QW5pbWF0ZShhc3Q6IEFuaW1hdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IHRoaXMuX3Zpc2l0VGltaW5nKGFzdC50aW1pbmdzLCBjb250ZXh0KTtcbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGlmICh0aW1pbmdzLmRlbGF5KSB7XG4gICAgICBjb250ZXh0LmluY3JlbWVudFRpbWUodGltaW5ncy5kZWxheSk7XG4gICAgICB0aW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZSA9IGFzdC5zdHlsZTtcbiAgICBpZiAoc3R5bGUudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzKSB7XG4gICAgICB0aGlzLnZpc2l0S2V5ZnJhbWVzKHN0eWxlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5pbmNyZW1lbnRUaW1lKHRpbWluZ3MuZHVyYXRpb24pO1xuICAgICAgdGhpcy52aXNpdFN0eWxlKHN0eWxlIGFzIFN0eWxlQXN0LCBjb250ZXh0KTtcbiAgICAgIHRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIH1cblxuICAgIGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gbnVsbDtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U3R5bGUoYXN0OiBTdHlsZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgdGltZWxpbmUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBjb25zdCB0aW1pbmdzID0gY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MhO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhIHN0eWxlKCkgY2FsbFxuICAgIC8vIGRpcmVjdGx5IGZvbGxvd3MgIGFuIGFuaW1hdGUoKSBjYWxsIChidXQgbm90IGluc2lkZSBvZiBhbiBhbmltYXRlKCkgY2FsbClcbiAgICBpZiAoIXRpbWluZ3MgJiYgdGltZWxpbmUuaGFzQ3VycmVudFN0eWxlUHJvcGVydGllcygpKSB7XG4gICAgICB0aW1lbGluZS5mb3J3YXJkRnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmcgPSAodGltaW5ncyAmJiB0aW1pbmdzLmVhc2luZykgfHwgYXN0LmVhc2luZztcbiAgICBpZiAoYXN0LmlzRW1wdHlTdGVwKSB7XG4gICAgICB0aW1lbGluZS5hcHBseUVtcHR5U3RlcChlYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lbGluZS5zZXRTdHlsZXMoYXN0LnN0eWxlcywgZWFzaW5nLCBjb250ZXh0LmVycm9ycywgY29udGV4dC5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZnJhbWVzKGFzdDogS2V5ZnJhbWVzQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyE7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gKGNvbnRleHQuY3VycmVudFRpbWVsaW5lISkuZHVyYXRpb247XG4gICAgY29uc3QgZHVyYXRpb24gPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZHVyYXRpb247XG4gICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KCk7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaW5uZXJUaW1lbGluZS5lYXNpbmcgPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZWFzaW5nO1xuXG4gICAgYXN0LnN0eWxlcy5mb3JFYWNoKHN0ZXAgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBzdGVwLm9mZnNldCB8fCAwO1xuICAgICAgaW5uZXJUaW1lbGluZS5mb3J3YXJkVGltZShvZmZzZXQgKiBkdXJhdGlvbik7XG4gICAgICBpbm5lclRpbWVsaW5lLnNldFN0eWxlcyhzdGVwLnN0eWxlcywgc3RlcC5lYXNpbmcsIGNvbnRleHQuZXJyb3JzLCBjb250ZXh0Lm9wdGlvbnMpO1xuICAgICAgaW5uZXJUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgcGFyZW50IHRpbWVsaW5lIGdldHMgYWxsIHRoZSBzdHlsZXMgZnJvbVxuICAgIC8vIHRoZSBjaGlsZCBldmVuIGlmIHRoZSBuZXcgdGltZWxpbmUgYmVsb3cgaXMgbm90IHVzZWRcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKGlubmVyVGltZWxpbmUpO1xuXG4gICAgLy8gd2UgZG8gdGhpcyBiZWNhdXNlIHRoZSB3aW5kb3cgYmV0d2VlbiB0aGlzIHRpbWVsaW5lIGFuZCB0aGUgc3ViIHRpbWVsaW5lXG4gICAgLy8gc2hvdWxkIGVuc3VyZSB0aGF0IHRoZSBzdHlsZXMgd2l0aGluIGFyZSBleGFjdGx5IHRoZSBzYW1lIGFzIHRoZXkgd2VyZSBiZWZvcmVcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShzdGFydFRpbWUgKyBkdXJhdGlvbik7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFF1ZXJ5KGFzdDogUXVlcnlBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBmaXJzdCBzdGVwIGJlZm9yZSB0aGlzIGlzIGEgc3R5bGUgc3RlcCB3ZSBuZWVkXG4gICAgLy8gdG8gZW5zdXJlIHRoZSBzdHlsZXMgYXJlIGFwcGxpZWQgYmVmb3JlIHRoZSBjaGlsZHJlbiBhcmUgYW5pbWF0ZWRcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBvcHRpb25zID0gKGFzdC5vcHRpb25zIHx8IHt9KSBhcyBBbmltYXRpb25RdWVyeU9wdGlvbnM7XG4gICAgY29uc3QgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGlmIChkZWxheSAmJlxuICAgICAgICAoY29udGV4dC5wcmV2aW91c05vZGUudHlwZSA9PT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlIHx8XG4gICAgICAgICAoc3RhcnRUaW1lID09IDAgJiYgY29udGV4dC5jdXJyZW50VGltZWxpbmUuaGFzQ3VycmVudFN0eWxlUHJvcGVydGllcygpKSkpIHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB9XG5cbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuICAgIGNvbnN0IGVsbXMgPSBjb250ZXh0Lmludm9rZVF1ZXJ5KFxuICAgICAgICBhc3Quc2VsZWN0b3IsIGFzdC5vcmlnaW5hbFNlbGVjdG9yLCBhc3QubGltaXQsIGFzdC5pbmNsdWRlU2VsZixcbiAgICAgICAgb3B0aW9ucy5vcHRpb25hbCA/IHRydWUgOiBmYWxzZSwgY29udGV4dC5lcnJvcnMpO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IGVsbXMubGVuZ3RoO1xuICAgIGxldCBzYW1lRWxlbWVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXJ8bnVsbCA9IG51bGw7XG4gICAgZWxtcy5mb3JFYWNoKChlbGVtZW50LCBpKSA9PiB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gaTtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucywgZWxlbWVudCk7XG4gICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgaW5uZXJDb250ZXh0LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudCA9PT0gY29udGV4dC5lbGVtZW50KSB7XG4gICAgICAgIHNhbWVFbGVtZW50VGltZWxpbmUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgICAgfVxuXG4gICAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kXG4gICAgICAvLyB3aXRoIGEgc3R5bGUoKSBjYWxsICh3aGljaCBpcyBoZXJlIHRvIHNpZ25hbCB0aGF0IHRoaXMgaXMgYSBwcmVwYXJhdG9yeVxuICAgICAgLy8gY2FsbCB0byBzdHlsZSBhbiBlbGVtZW50IGJlZm9yZSBpdCBpcyBhbmltYXRlZCBhZ2FpbilcbiAgICAgIGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIGNvbnN0IGVuZFRpbWUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBlbmRUaW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSAwO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG5cbiAgICBpZiAoc2FtZUVsZW1lbnRUaW1lbGluZSkge1xuICAgICAgY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyhzYW1lRWxlbWVudFRpbWVsaW5lKTtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdGFnZ2VyKGFzdDogU3RhZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgcGFyZW50Q29udGV4dCA9IGNvbnRleHQucGFyZW50Q29udGV4dCE7XG4gICAgY29uc3QgdGwgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBjb25zdCB0aW1pbmdzID0gYXN0LnRpbWluZ3M7XG4gICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLmFicyh0aW1pbmdzLmR1cmF0aW9uKTtcbiAgICBjb25zdCBtYXhUaW1lID0gZHVyYXRpb24gKiAoY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCAtIDEpO1xuICAgIGxldCBkZWxheSA9IGR1cmF0aW9uICogY29udGV4dC5jdXJyZW50UXVlcnlJbmRleDtcblxuICAgIGxldCBzdGFnZ2VyVHJhbnNmb3JtZXIgPSB0aW1pbmdzLmR1cmF0aW9uIDwgMCA/ICdyZXZlcnNlJyA6IHRpbWluZ3MuZWFzaW5nO1xuICAgIHN3aXRjaCAoc3RhZ2dlclRyYW5zZm9ybWVyKSB7XG4gICAgICBjYXNlICdyZXZlcnNlJzpcbiAgICAgICAgZGVsYXkgPSBtYXhUaW1lIC0gZGVsYXk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVsbCc6XG4gICAgICAgIGRlbGF5ID0gcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICB0aW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydGluZ1RpbWUgPSB0aW1lbGluZS5jdXJyZW50VGltZTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG5cbiAgICAvLyB0aW1lID0gZHVyYXRpb24gKyBkZWxheVxuICAgIC8vIHRoZSByZWFzb24gd2h5IHRoaXMgY29tcHV0YXRpb24gaXMgc28gY29tcGxleCBpcyBiZWNhdXNlXG4gICAgLy8gdGhlIGlubmVyIHRpbWVsaW5lIG1heSBlaXRoZXIgaGF2ZSBhIGRlbGF5IHZhbHVlIG9yIGEgc3RyZXRjaGVkXG4gICAgLy8ga2V5ZnJhbWUgZGVwZW5kaW5nIG9uIGlmIGEgc3VidGltZWxpbmUgaXMgbm90IHVzZWQgb3IgaXMgdXNlZC5cbiAgICBwYXJlbnRDb250ZXh0LmN1cnJlbnRTdGFnZ2VyVGltZSA9XG4gICAgICAgICh0bC5jdXJyZW50VGltZSAtIHN0YXJ0aW5nVGltZSkgKyAodGwuc3RhcnRUaW1lIC0gcGFyZW50Q29udGV4dC5jdXJyZW50VGltZWxpbmUuc3RhcnRUaW1lKTtcbiAgfVxufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIFN0eWxlQXRUaW1lID0ge1xuICB0aW1lOiBudW1iZXI7IHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XG59O1xuXG5jb25zdCBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERSA9IDxBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPj57fTtcbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICBwdWJsaWMgcGFyZW50Q29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0fG51bGwgPSBudWxsO1xuICBwdWJsaWMgY3VycmVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXI7XG4gIHB1YmxpYyBjdXJyZW50QW5pbWF0ZVRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzfG51bGwgPSBudWxsO1xuICBwdWJsaWMgcHJldmlvdXNOb2RlOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICBwdWJsaWMgc3ViQ29udGV4dENvdW50ID0gMDtcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgcHVibGljIGN1cnJlbnRRdWVyeUluZGV4OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFF1ZXJ5VG90YWw6IG51bWJlciA9IDA7XG4gIHB1YmxpYyBjdXJyZW50U3RhZ2dlclRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSxcbiAgICAgIHB1YmxpYyBzdWJJbnN0cnVjdGlvbnM6IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgcHJpdmF0ZSBfZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgX2xlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHB1YmxpYyBlcnJvcnM6IEVycm9yW10sIHB1YmxpYyB0aW1lbGluZXM6IFRpbWVsaW5lQnVpbGRlcltdLFxuICAgICAgaW5pdGlhbFRpbWVsaW5lPzogVGltZWxpbmVCdWlsZGVyKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUgPSBpbml0aWFsVGltZWxpbmUgfHwgbmV3IFRpbWVsaW5lQnVpbGRlcih0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIDApO1xuICAgIHRpbWVsaW5lcy5wdXNoKHRoaXMuY3VycmVudFRpbWVsaW5lKTtcbiAgfVxuXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXM7XG4gIH1cblxuICB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCwgc2tpcElmRXhpc3RzPzogYm9vbGVhbikge1xuICAgIGlmICghb3B0aW9ucykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV3T3B0aW9ucyA9IG9wdGlvbnMgYXMgYW55O1xuICAgIGxldCBvcHRpb25zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBOT1RFOiB0aGlzIHdpbGwgZ2V0IHBhdGNoZWQgdXAgd2hlbiBvdGhlciBhbmltYXRpb24gbWV0aG9kcyBzdXBwb3J0IGR1cmF0aW9uIG92ZXJyaWRlc1xuICAgIGlmIChuZXdPcHRpb25zLmR1cmF0aW9uICE9IG51bGwpIHtcbiAgICAgIChvcHRpb25zVG9VcGRhdGUgYXMgYW55KS5kdXJhdGlvbiA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAobmV3T3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zVG9VcGRhdGUuZGVsYXkgPSByZXNvbHZlVGltaW5nVmFsdWUobmV3T3B0aW9ucy5kZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGFyYW1zID0gbmV3T3B0aW9ucy5wYXJhbXM7XG4gICAgaWYgKG5ld1BhcmFtcykge1xuICAgICAgbGV0IHBhcmFtc1RvVXBkYXRlOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSBvcHRpb25zVG9VcGRhdGUucGFyYW1zITtcbiAgICAgIGlmICghcGFyYW1zVG9VcGRhdGUpIHtcbiAgICAgICAgcGFyYW1zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnMucGFyYW1zID0ge307XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKCFza2lwSWZFeGlzdHMgfHwgIXBhcmFtc1RvVXBkYXRlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgcGFyYW1zVG9VcGRhdGVbbmFtZV0gPSBpbnRlcnBvbGF0ZVBhcmFtcyhuZXdQYXJhbXNbbmFtZV0sIHBhcmFtc1RvVXBkYXRlLCB0aGlzLmVycm9ycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvcHlPcHRpb25zKCkge1xuICAgIGNvbnN0IG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBjb25zdCBvbGRQYXJhbXMgPSB0aGlzLm9wdGlvbnMucGFyYW1zO1xuICAgICAgaWYgKG9sZFBhcmFtcykge1xuICAgICAgICBjb25zdCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNbJ3BhcmFtcyddID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG9sZFBhcmFtcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgICBwYXJhbXNbbmFtZV0gPSBvbGRQYXJhbXNbbmFtZV07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfVxuXG4gIGNyZWF0ZVN1YkNvbnRleHQob3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsID0gbnVsbCwgZWxlbWVudD86IGFueSwgbmV3VGltZT86IG51bWJlcik6XG4gICAgICBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICAgIGNvbnN0IHRhcmdldCA9IGVsZW1lbnQgfHwgdGhpcy5lbGVtZW50O1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgICB0aGlzLl9kcml2ZXIsIHRhcmdldCwgdGhpcy5zdWJJbnN0cnVjdGlvbnMsIHRoaXMuX2VudGVyQ2xhc3NOYW1lLCB0aGlzLl9sZWF2ZUNsYXNzTmFtZSxcbiAgICAgICAgdGhpcy5lcnJvcnMsIHRoaXMudGltZWxpbmVzLCB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3JrKHRhcmdldCwgbmV3VGltZSB8fCAwKSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSB0aGlzLnByZXZpb3VzTm9kZTtcbiAgICBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IHRoaXMuY3VycmVudEFuaW1hdGVUaW1pbmdzO1xuXG4gICAgY29udGV4dC5vcHRpb25zID0gdGhpcy5fY29weU9wdGlvbnMoKTtcbiAgICBjb250ZXh0LnVwZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gdGhpcy5jdXJyZW50UXVlcnlJbmRleDtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVRvdGFsID0gdGhpcy5jdXJyZW50UXVlcnlUb3RhbDtcbiAgICBjb250ZXh0LnBhcmVudENvbnRleHQgPSB0aGlzO1xuICAgIHRoaXMuc3ViQ29udGV4dENvdW50Kys7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICB0cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUobmV3VGltZT86IG51bWJlcikge1xuICAgIHRoaXMucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUgPSB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3JrKHRoaXMuZWxlbWVudCwgbmV3VGltZSk7XG4gICAgdGhpcy50aW1lbGluZXMucHVzaCh0aGlzLmN1cnJlbnRUaW1lbGluZSk7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWVsaW5lO1xuICB9XG5cbiAgYXBwZW5kSW5zdHJ1Y3Rpb25Ub1RpbWVsaW5lKFxuICAgICAgaW5zdHJ1Y3Rpb246IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGR1cmF0aW9uOiBudW1iZXJ8bnVsbCxcbiAgICAgIGRlbGF5OiBudW1iZXJ8bnVsbCk6IEFuaW1hdGVUaW1pbmdzIHtcbiAgICBjb25zdCB1cGRhdGVkVGltaW5nczogQW5pbWF0ZVRpbWluZ3MgPSB7XG4gICAgICBkdXJhdGlvbjogZHVyYXRpb24gIT0gbnVsbCA/IGR1cmF0aW9uIDogaW5zdHJ1Y3Rpb24uZHVyYXRpb24sXG4gICAgICBkZWxheTogdGhpcy5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWUgKyAoZGVsYXkgIT0gbnVsbCA/IGRlbGF5IDogMCkgKyBpbnN0cnVjdGlvbi5kZWxheSxcbiAgICAgIGVhc2luZzogJydcbiAgICB9O1xuICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU3ViVGltZWxpbmVCdWlsZGVyKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIGluc3RydWN0aW9uLmVsZW1lbnQsIGluc3RydWN0aW9uLmtleWZyYW1lcywgaW5zdHJ1Y3Rpb24ucHJlU3R5bGVQcm9wcyxcbiAgICAgICAgaW5zdHJ1Y3Rpb24ucG9zdFN0eWxlUHJvcHMsIHVwZGF0ZWRUaW1pbmdzLCBpbnN0cnVjdGlvbi5zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSk7XG4gICAgdGhpcy50aW1lbGluZXMucHVzaChidWlsZGVyKTtcbiAgICByZXR1cm4gdXBkYXRlZFRpbWluZ3M7XG4gIH1cblxuICBpbmNyZW1lbnRUaW1lKHRpbWU6IG51bWJlcikge1xuICAgIHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcndhcmRUaW1lKHRoaXMuY3VycmVudFRpbWVsaW5lLmR1cmF0aW9uICsgdGltZSk7XG4gIH1cblxuICBkZWxheU5leHRTdGVwKGRlbGF5OiBudW1iZXIpIHtcbiAgICAvLyBuZWdhdGl2ZSBkZWxheXMgYXJlIG5vdCB5ZXQgc3VwcG9ydGVkXG4gICAgaWYgKGRlbGF5ID4gMCkge1xuICAgICAgdGhpcy5jdXJyZW50VGltZWxpbmUuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgfVxuICB9XG5cbiAgaW52b2tlUXVlcnkoXG4gICAgICBzZWxlY3Rvcjogc3RyaW5nLCBvcmlnaW5hbFNlbGVjdG9yOiBzdHJpbmcsIGxpbWl0OiBudW1iZXIsIGluY2x1ZGVTZWxmOiBib29sZWFuLFxuICAgICAgb3B0aW9uYWw6IGJvb2xlYW4sIGVycm9yczogRXJyb3JbXSk6IGFueVtdIHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAoaW5jbHVkZVNlbGYpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkgeyAgLy8gb25seSBpZiA6c2VsZiBpcyB1c2VkIHRoZW4gdGhlIHNlbGVjdG9yIGNhbiBiZSBlbXB0eVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKEVOVEVSX1RPS0VOX1JFR0VYLCAnLicgKyB0aGlzLl9lbnRlckNsYXNzTmFtZSk7XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoTEVBVkVfVE9LRU5fUkVHRVgsICcuJyArIHRoaXMuX2xlYXZlQ2xhc3NOYW1lKTtcbiAgICAgIGNvbnN0IG11bHRpID0gbGltaXQgIT0gMTtcbiAgICAgIGxldCBlbGVtZW50cyA9IHRoaXMuX2RyaXZlci5xdWVyeSh0aGlzLmVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gICAgICBpZiAobGltaXQgIT09IDApIHtcbiAgICAgICAgZWxlbWVudHMgPSBsaW1pdCA8IDAgPyBlbGVtZW50cy5zbGljZShlbGVtZW50cy5sZW5ndGggKyBsaW1pdCwgZWxlbWVudHMubGVuZ3RoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbmFsICYmIHJlc3VsdHMubGVuZ3RoID09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGludmFsaWRRdWVyeShvcmlnaW5hbFNlbGVjdG9yKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgZHVyYXRpb246IG51bWJlciA9IDA7XG4gIHB1YmxpYyBlYXNpbmc6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX2N1cnJlbnRLZXlmcmFtZTogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX2tleWZyYW1lcyA9IG5ldyBNYXA8bnVtYmVyLCDJtVN0eWxlRGF0YU1hcD4oKTtcbiAgcHJpdmF0ZSBfc3R5bGVTdW1tYXJ5ID0gbmV3IE1hcDxzdHJpbmcsIFN0eWxlQXRUaW1lPigpO1xuICBwcml2YXRlIF9sb2NhbFRpbWVsaW5lU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfZ2xvYmFsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhTWFwO1xuICBwcml2YXRlIF9wZW5kaW5nU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfYmFja0ZpbGw6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIF9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWU6IMm1U3R5bGVEYXRhTWFwfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBzdGFydFRpbWU6IG51bWJlcixcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cD86IE1hcDxhbnksIMm1U3R5bGVEYXRhTWFwPikge1xuICAgIGlmICghdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKSB7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGFNYXA+KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMgPSB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuZ2V0KGVsZW1lbnQpITtcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXM7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuc2V0KGVsZW1lbnQsIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodGhpcy5fa2V5ZnJhbWVzLnNpemUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5oYXNDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBoYXNDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2l6ZSA+IDA7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRUaW1lICsgdGhpcy5kdXJhdGlvbjtcbiAgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IGEgc3R5bGUoKSBzdGVwIGlzIHBsYWNlZCByaWdodCBiZWZvcmUgYSBzdGFnZ2VyKClcbiAgICAvLyBhbmQgdGhhdCBzdHlsZSgpIHN0ZXAgaXMgdGhlIHZlcnkgZmlyc3Qgc3R5bGUoKSB2YWx1ZSBpbiB0aGUgYW5pbWF0aW9uXG4gICAgLy8gdGhlbiB3ZSBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIHRoZSBrZXlmcmFtZSBbMCwgY29weSwgMV0gc28gdGhhdCB0aGUgZGVsYXlcbiAgICAvLyBwcm9wZXJseSBhcHBsaWVzIHRoZSBzdHlsZSgpIHZhbHVlcyB0byB3b3JrIHdpdGggdGhlIHN0YWdnZXIuLi5cbiAgICBjb25zdCBoYXNQcmVTdHlsZVN0ZXAgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PT0gMSAmJiB0aGlzLl9wZW5kaW5nU3R5bGVzLnNpemU7XG5cbiAgICBpZiAodGhpcy5kdXJhdGlvbiB8fCBoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZSArIGRlbGF5KTtcbiAgICAgIGlmIChoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgICAgdGhpcy5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFRpbWUgKz0gZGVsYXk7XG4gICAgfVxuICB9XG5cbiAgZm9yayhlbGVtZW50OiBhbnksIGN1cnJlbnRUaW1lPzogbnVtYmVyKTogVGltZWxpbmVCdWlsZGVyIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHJldHVybiBuZXcgVGltZWxpbmVCdWlsZGVyKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIGN1cnJlbnRUaW1lIHx8IHRoaXMuY3VycmVudFRpbWUsIHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCk7XG4gIH1cblxuICBwcml2YXRlIF9sb2FkS2V5ZnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZSA9IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEtleWZyYW1lID0gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKSE7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX2tleWZyYW1lcy5zZXQodGhpcy5kdXJhdGlvbiwgdGhpcy5fY3VycmVudEtleWZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkRnJhbWUoKSB7XG4gICAgdGhpcy5kdXJhdGlvbiArPSBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgZm9yd2FyZFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB0aGlzLmR1cmF0aW9uID0gdGltZTtcbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0eWxlKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXIpIHtcbiAgICB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzLnNldChwcm9wLCB2YWx1ZSk7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMuc2V0KHByb3AsIHZhbHVlKTtcbiAgICB0aGlzLl9zdHlsZVN1bW1hcnkuc2V0KHByb3AsIHt0aW1lOiB0aGlzLmN1cnJlbnRUaW1lLCB2YWx1ZX0pO1xuICB9XG5cbiAgYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZSAhPT0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICB9XG5cbiAgYXBwbHlFbXB0eVN0ZXAoZWFzaW5nOiBzdHJpbmd8bnVsbCkge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWUuc2V0KCdlYXNpbmcnLCBlYXNpbmcpO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYW5pbWF0ZShkdXJhdGlvbik6XG4gICAgLy8gYWxsIG1pc3Npbmcgc3R5bGVzIGFyZSBmaWxsZWQgd2l0aCBhIGAqYCB2YWx1ZSB0aGVuXG4gICAgLy8gaWYgYW55IGRlc3RpbmF0aW9uIHN0eWxlcyBhcmUgZmlsbGVkIGluIGxhdGVyIG9uIHRoZSBzYW1lXG4gICAgLy8ga2V5ZnJhbWUgdGhlbiB0aGV5IHdpbGwgb3ZlcnJpZGUgdGhlIG92ZXJyaWRkZW4gc3R5bGVzXG4gICAgLy8gV2UgdXNlIGBfZ2xvYmFsVGltZWxpbmVTdHlsZXNgIGhlcmUgYmVjYXVzZSB0aGVyZSBtYXkgYmVcbiAgICAvLyBzdHlsZXMgaW4gcHJldmlvdXMga2V5ZnJhbWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGluIHRoaXMgdGltZWxpbmVcbiAgICBmb3IgKGxldCBbcHJvcCwgdmFsdWVdIG9mIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9iYWNrRmlsbC5zZXQocHJvcCwgdmFsdWUgfHwgQVVUT19TVFlMRSk7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUuc2V0KHByb3AsIEFVVE9fU1RZTEUpO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgPSB0aGlzLl9jdXJyZW50S2V5ZnJhbWU7XG4gIH1cblxuICBzZXRTdHlsZXMoXG4gICAgICBpbnB1dDogQXJyYXk8KMm1U3R5bGVEYXRhTWFwIHwgc3RyaW5nKT4sIGVhc2luZzogc3RyaW5nfG51bGwsIGVycm9yczogRXJyb3JbXSxcbiAgICAgIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zKSB7XG4gICAgaWYgKGVhc2luZykge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZS5zZXQoJ2Vhc2luZycsIGVhc2luZyk7XG4gICAgfVxuICAgIGNvbnN0IHBhcmFtcyA9IChvcHRpb25zICYmIG9wdGlvbnMucGFyYW1zKSB8fCB7fTtcbiAgICBjb25zdCBzdHlsZXMgPSBmbGF0dGVuU3R5bGVzKGlucHV0LCB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyk7XG4gICAgZm9yIChsZXQgW3Byb3AsIHZhbHVlXSBvZiBzdHlsZXMpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGludGVycG9sYXRlUGFyYW1zKHZhbHVlLCBwYXJhbXMsIGVycm9ycyk7XG4gICAgICB0aGlzLl9wZW5kaW5nU3R5bGVzLnNldChwcm9wLCB2YWwpO1xuICAgICAgaWYgKCF0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzLmhhcyhwcm9wKSkge1xuICAgICAgICB0aGlzLl9iYWNrRmlsbC5zZXQocHJvcCwgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMuZ2V0KHByb3ApID8/IEFVVE9fU1RZTEUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlU3R5bGUocHJvcCwgdmFsKTtcbiAgICB9XG4gIH1cblxuICBhcHBseVN0eWxlc1RvS2V5ZnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdTdHlsZXMuc2l6ZSA9PSAwKSByZXR1cm47XG5cbiAgICB0aGlzLl9wZW5kaW5nU3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lLnNldChwcm9wLCB2YWwpO1xuICAgIH0pO1xuICAgIHRoaXMuX3BlbmRpbmdTdHlsZXMuY2xlYXIoKTtcblxuICAgIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMuZm9yRWFjaCgodmFsLCBwcm9wKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2N1cnJlbnRLZXlmcmFtZS5oYXMocHJvcCkpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lLnNldChwcm9wLCB2YWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc25hcHNob3RDdXJyZW50U3R5bGVzKCkge1xuICAgIGZvciAobGV0IFtwcm9wLCB2YWxdIG9mIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdTdHlsZXMuc2V0KHByb3AsIHZhbCk7XG4gICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCB2YWwpO1xuICAgIH1cbiAgfVxuXG4gIGdldEZpbmFsS2V5ZnJhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWZyYW1lcy5nZXQodGhpcy5kdXJhdGlvbik7XG4gIH1cblxuICBnZXQgcHJvcGVydGllcygpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3AgaW4gdGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2gocHJvcCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgbWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZTogVGltZWxpbmVCdWlsZGVyKSB7XG4gICAgdGltZWxpbmUuX3N0eWxlU3VtbWFyeS5mb3JFYWNoKChkZXRhaWxzMSwgcHJvcCkgPT4ge1xuICAgICAgY29uc3QgZGV0YWlsczAgPSB0aGlzLl9zdHlsZVN1bW1hcnkuZ2V0KHByb3ApO1xuICAgICAgaWYgKCFkZXRhaWxzMCB8fCBkZXRhaWxzMS50aW1lID4gZGV0YWlsczAudGltZSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCBkZXRhaWxzMS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBidWlsZEtleWZyYW1lcygpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIGNvbnN0IHByZVN0eWxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBwb3N0U3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGlzRW1wdHkgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PT0gMSAmJiB0aGlzLmR1cmF0aW9uID09PSAwO1xuXG4gICAgbGV0IGZpbmFsS2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4gPSBbXTtcbiAgICB0aGlzLl9rZXlmcmFtZXMuZm9yRWFjaCgoa2V5ZnJhbWUsIHRpbWUpID0+IHtcbiAgICAgIGNvbnN0IGZpbmFsS2V5ZnJhbWUgPSBuZXcgTWFwKFsuLi50aGlzLl9iYWNrRmlsbCwgLi4ua2V5ZnJhbWVdKTtcbiAgICAgIGZpbmFsS2V5ZnJhbWUuZm9yRWFjaCgodmFsdWUsIHByb3ApID0+IHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBQUkVfU1RZTEUpIHtcbiAgICAgICAgICBwcmVTdHlsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gQVVUT19TVFlMRSkge1xuICAgICAgICAgIHBvc3RTdHlsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWlzRW1wdHkpIHtcbiAgICAgICAgZmluYWxLZXlmcmFtZS5zZXQoJ29mZnNldCcsIHRpbWUgLyB0aGlzLmR1cmF0aW9uKTtcbiAgICAgIH1cbiAgICAgIGZpbmFsS2V5ZnJhbWVzLnB1c2goZmluYWxLZXlmcmFtZSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcmVQcm9wczogc3RyaW5nW10gPSBbLi4ucHJlU3R5bGVQcm9wcy52YWx1ZXMoKV07XG4gICAgY29uc3QgcG9zdFByb3BzOiBzdHJpbmdbXSA9IFsuLi5wb3N0U3R5bGVQcm9wcy52YWx1ZXMoKV07XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGEgMC1zZWNvbmQgYW5pbWF0aW9uICh3aGljaCBpcyBkZXNpZ25lZCBqdXN0IHRvIHBsYWNlIHN0eWxlcyBvbnNjcmVlbilcbiAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgY29uc3Qga2YwID0gZmluYWxLZXlmcmFtZXNbMF07XG4gICAgICBjb25zdCBrZjEgPSBuZXcgTWFwKGtmMCk7XG4gICAgICBrZjAuc2V0KCdvZmZzZXQnLCAwKTtcbiAgICAgIGtmMS5zZXQoJ29mZnNldCcsIDEpO1xuICAgICAgZmluYWxLZXlmcmFtZXMgPSBba2YwLCBrZjFdO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGZpbmFsS2V5ZnJhbWVzLCBwcmVQcm9wcywgcG9zdFByb3BzLCB0aGlzLmR1cmF0aW9uLCB0aGlzLnN0YXJ0VGltZSxcbiAgICAgICAgdGhpcy5lYXNpbmcsIGZhbHNlKTtcbiAgfVxufVxuXG5jbGFzcyBTdWJUaW1lbGluZUJ1aWxkZXIgZXh0ZW5kcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgdGltaW5nczogQW5pbWF0ZVRpbWluZ3M7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgZWxlbWVudDogYW55LCBwdWJsaWMga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4sXG4gICAgICBwdWJsaWMgcHJlU3R5bGVQcm9wczogc3RyaW5nW10sIHB1YmxpYyBwb3N0U3R5bGVQcm9wczogc3RyaW5nW10sIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzLFxuICAgICAgcHJpdmF0ZSBfc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHN1cGVyKGRyaXZlciwgZWxlbWVudCwgdGltaW5ncy5kZWxheSk7XG4gICAgdGhpcy50aW1pbmdzID0ge2R1cmF0aW9uOiB0aW1pbmdzLmR1cmF0aW9uLCBkZWxheTogdGltaW5ncy5kZWxheSwgZWFzaW5nOiB0aW1pbmdzLmVhc2luZ307XG4gIH1cblxuICBvdmVycmlkZSBjb250YWluc0FuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5rZXlmcmFtZXMubGVuZ3RoID4gMTtcbiAgfVxuXG4gIG92ZXJyaWRlIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBrZXlmcmFtZXMgPSB0aGlzLmtleWZyYW1lcztcbiAgICBsZXQge2RlbGF5LCBkdXJhdGlvbiwgZWFzaW5nfSA9IHRoaXMudGltaW5ncztcbiAgICBpZiAodGhpcy5fc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgJiYgZGVsYXkpIHtcbiAgICAgIGNvbnN0IG5ld0tleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+ID0gW107XG4gICAgICBjb25zdCB0b3RhbFRpbWUgPSBkdXJhdGlvbiArIGRlbGF5O1xuICAgICAgY29uc3Qgc3RhcnRpbmdHYXAgPSBkZWxheSAvIHRvdGFsVGltZTtcblxuICAgICAgLy8gdGhlIG9yaWdpbmFsIHN0YXJ0aW5nIGtleWZyYW1lIG5vdyBzdGFydHMgb25jZSB0aGUgZGVsYXkgaXMgZG9uZVxuICAgICAgY29uc3QgbmV3Rmlyc3RLZXlmcmFtZSA9IG5ldyBNYXAoa2V5ZnJhbWVzWzBdKTtcbiAgICAgIG5ld0ZpcnN0S2V5ZnJhbWUuc2V0KCdvZmZzZXQnLCAwKTtcbiAgICAgIG5ld0tleWZyYW1lcy5wdXNoKG5ld0ZpcnN0S2V5ZnJhbWUpO1xuXG4gICAgICBjb25zdCBvbGRGaXJzdEtleWZyYW1lID0gbmV3IE1hcChrZXlmcmFtZXNbMF0pO1xuICAgICAgb2xkRmlyc3RLZXlmcmFtZS5zZXQoJ29mZnNldCcsIHJvdW5kT2Zmc2V0KHN0YXJ0aW5nR2FwKSk7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChvbGRGaXJzdEtleWZyYW1lKTtcblxuICAgICAgLypcbiAgICAgICAgV2hlbiB0aGUga2V5ZnJhbWUgaXMgc3RyZXRjaGVkIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgZGVsYXkgYmVmb3JlIHRoZSBhbmltYXRpb25cbiAgICAgICAgc3RhcnRzIGlzIGdvbmUuIEluc3RlYWQgdGhlIGZpcnN0IGtleWZyYW1lIGlzIHBsYWNlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgICBhbmQgaXQgaXMgdGhlbiBjb3BpZWQgdG8gd2hlcmUgaXQgc3RhcnRzIHdoZW4gdGhlIG9yaWdpbmFsIGRlbGF5IGlzIG92ZXIuIFRoaXMgYmFzaWNhbGx5XG4gICAgICAgIG1lYW5zIG5vdGhpbmcgYW5pbWF0ZXMgZHVyaW5nIHRoYXQgZGVsYXksIGJ1dCB0aGUgc3R5bGVzIGFyZSBzdGlsbCByZW5kZXJlZC4gRm9yIHRoaXNcbiAgICAgICAgdG8gd29yayB0aGUgb3JpZ2luYWwgb2Zmc2V0IHZhbHVlcyB0aGF0IGV4aXN0IGluIHRoZSBvcmlnaW5hbCBrZXlmcmFtZXMgbXVzdCBiZSBcIndhcnBlZFwiXG4gICAgICAgIHNvIHRoYXQgdGhleSBjYW4gdGFrZSB0aGUgbmV3IGtleWZyYW1lICsgZGVsYXkgaW50byBhY2NvdW50LlxuXG4gICAgICAgIGRlbGF5PTEwMDAsIGR1cmF0aW9uPTEwMDAsIGtleWZyYW1lcyA9IDAgLjUgMVxuXG4gICAgICAgIHR1cm5zIGludG9cblxuICAgICAgICBkZWxheT0wLCBkdXJhdGlvbj0yMDAwLCBrZXlmcmFtZXMgPSAwIC4zMyAuNjYgMVxuICAgICAgICovXG5cbiAgICAgIC8vIG9mZnNldHMgYmV0d2VlbiAxIC4uLiBuIC0xIGFyZSBhbGwgd2FycGVkIGJ5IHRoZSBrZXlmcmFtZSBzdHJldGNoXG4gICAgICBjb25zdCBsaW1pdCA9IGtleWZyYW1lcy5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbGltaXQ7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBuZXcgTWFwKGtleWZyYW1lc1tpXSk7XG4gICAgICAgIGNvbnN0IG9sZE9mZnNldCA9IGtmLmdldCgnb2Zmc2V0JykgYXMgbnVtYmVyO1xuICAgICAgICBjb25zdCB0aW1lQXRLZXlmcmFtZSA9IGRlbGF5ICsgb2xkT2Zmc2V0ICogZHVyYXRpb247XG4gICAgICAgIGtmLnNldCgnb2Zmc2V0Jywgcm91bmRPZmZzZXQodGltZUF0S2V5ZnJhbWUgLyB0b3RhbFRpbWUpKTtcbiAgICAgICAgbmV3S2V5ZnJhbWVzLnB1c2goa2YpO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgbmV3IHN0YXJ0aW5nIGtleWZyYW1lIHNob3VsZCBiZSBhZGRlZCBhdCB0aGUgc3RhcnRcbiAgICAgIGR1cmF0aW9uID0gdG90YWxUaW1lO1xuICAgICAgZGVsYXkgPSAwO1xuICAgICAgZWFzaW5nID0gJyc7XG5cbiAgICAgIGtleWZyYW1lcyA9IG5ld0tleWZyYW1lcztcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihcbiAgICAgICAgdGhpcy5lbGVtZW50LCBrZXlmcmFtZXMsIHRoaXMucHJlU3R5bGVQcm9wcywgdGhpcy5wb3N0U3R5bGVQcm9wcywgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsXG4gICAgICAgIHRydWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kT2Zmc2V0KG9mZnNldDogbnVtYmVyLCBkZWNpbWFsUG9pbnRzID0gMyk6IG51bWJlciB7XG4gIGNvbnN0IG11bHQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbFBvaW50cyAtIDEpO1xuICByZXR1cm4gTWF0aC5yb3VuZChvZmZzZXQgKiBtdWx0KSAvIG11bHQ7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5TdHlsZXMoaW5wdXQ6IEFycmF5PCjJtVN0eWxlRGF0YU1hcCB8IHN0cmluZyk+LCBhbGxTdHlsZXM6IMm1U3R5bGVEYXRhTWFwKSB7XG4gIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIGxldCBhbGxQcm9wZXJ0aWVzOiBzdHJpbmdbXXxJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz47XG4gIGlucHV0LmZvckVhY2godG9rZW4gPT4ge1xuICAgIGlmICh0b2tlbiA9PT0gJyonKSB7XG4gICAgICBhbGxQcm9wZXJ0aWVzID8/PSBhbGxTdHlsZXMua2V5cygpO1xuICAgICAgZm9yIChsZXQgcHJvcCBvZiBhbGxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIHN0eWxlcy5zZXQocHJvcCwgQVVUT19TVFlMRSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IFtwcm9wLCB2YWxdIG9mIHRva2VuIGFzIMm1U3R5bGVEYXRhTWFwKSB7XG4gICAgICAgIHN0eWxlcy5zZXQocHJvcCwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3R5bGVzO1xufVxuIl19