/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { copyObj, copyStyles, interpolateParams, iteratorToArray, resolveTiming, resolveTimingValue, visitDslNode } from '../util';
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
 * combination of prototypical inheritance, AST traversal and merge-sort-like algorithms are used.
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
 * timeline) or a default value of `*` into the backFill object. Given that each of the keyframe
 * styles is an object that prototypically inherits from the backFill object, this means that if a
 * value is added into the backFill then it will automatically propagate any missing values to all
 * keyframes. Therefore the missing `height` value will be properly filled into the already
 * processed keyframes.
 *
 * When a sub-timeline is created it will have its own backFill property. This is done so that
 * styles present within the sub-timeline do not accidentally seep into the previous/future timeline
 * keyframes
 *
 * (For prototypically-inherited contents to be detected a `for(i in obj)` loop must be used.)
 *
 * [Validation]
 * The code in this file is not responsible for validation. That functionality happens with within
 * the `AnimationValidatorVisitor` code.
 */
export function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = {}, finalStyles = {}, options, subInstructions, errors = []) {
    return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
export class AnimationTimelineBuilderVisitor {
    buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
        subInstructions = subInstructions || new ElementInstructionMap();
        const context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
        context.options = options;
        context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
        visitDslNode(this, ast, context);
        // this checks to see if an actual animation happened
        const timelines = context.timelines.filter(timeline => timeline.containsAnimation());
        if (Object.keys(finalStyles).length) {
            // note: we just want to apply the final styles for the rootElement, so we do not
            //       just apply the styles to the last timeline but the last timeline which
            //       element is the root one (basically `*`-styles are replaced with the actual
            //       state style values only for the root element)
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
        return timelines.length ? timelines.map(timeline => timeline.buildKeyframes()) :
            [createTimelineInstruction(rootElement, [], [], [], 0, 0, '', false)];
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
        this.visitReference(ast.animation, innerContext);
        context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        context.previousNode = ast;
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
                if (ctx.previousNode.type == 6 /* Style */) {
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
        if (style.type == 5 /* Keyframes */) {
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
        if (!timings && timeline.getCurrentStyleProperties().length) {
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
            (context.previousNode.type === 6 /* Style */ ||
                (startTime == 0 && context.currentTimeline.getCurrentStyleProperties().length))) {
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
            errors.push(`\`query("${originalSelector}")\` returned zero elements. (Use \`query("${originalSelector}", { optional: true })\` if you wish to allow this.)`);
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
                return this.getCurrentStyleProperties().length > 0;
            default:
                return true;
        }
    }
    getCurrentStyleProperties() {
        return Object.keys(this._currentKeyframe);
    }
    get currentTime() {
        return this.startTime + this.duration;
    }
    delayNextStep(delay) {
        // in the event that a style() step is placed right before a stagger()
        // and that style() step is the very first style() value in the animation
        // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
        // properly applies the style() values to work with the stagger...
        const hasPreStyleStep = this._keyframes.size == 1 && Object.keys(this._pendingStyles).length;
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
            this._currentKeyframe = Object.create(this._backFill, {});
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
        this._localTimelineStyles[prop] = value;
        this._globalTimelineStyles[prop] = value;
        this._styleSummary[prop] = { time: this.currentTime, value };
    }
    allowOnlyTimelineStyles() {
        return this._currentEmptyStepKeyframe !== this._currentKeyframe;
    }
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
    setStyles(input, easing, errors, options) {
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        const params = (options && options.params) || {};
        const styles = flattenStyles(input, this._globalTimelineStyles);
        Object.keys(styles).forEach(prop => {
            const val = interpolateParams(styles[prop], params, errors);
            this._pendingStyles[prop] = val;
            if (!this._localTimelineStyles.hasOwnProperty(prop)) {
                this._backFill[prop] = this._globalTimelineStyles.hasOwnProperty(prop) ?
                    this._globalTimelineStyles[prop] :
                    AUTO_STYLE;
            }
            this._updateStyle(prop, val);
        });
    }
    applyStylesToKeyframe() {
        const styles = this._pendingStyles;
        const props = Object.keys(styles);
        if (props.length == 0)
            return;
        this._pendingStyles = {};
        props.forEach(prop => {
            const val = styles[prop];
            this._currentKeyframe[prop] = val;
        });
        Object.keys(this._localTimelineStyles).forEach(prop => {
            if (!this._currentKeyframe.hasOwnProperty(prop)) {
                this._currentKeyframe[prop] = this._localTimelineStyles[prop];
            }
        });
    }
    snapshotCurrentStyles() {
        Object.keys(this._localTimelineStyles).forEach(prop => {
            const val = this._localTimelineStyles[prop];
            this._pendingStyles[prop] = val;
            this._updateStyle(prop, val);
        });
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
        Object.keys(timeline._styleSummary).forEach(prop => {
            const details0 = this._styleSummary[prop];
            const details1 = timeline._styleSummary[prop];
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
            const finalKeyframe = copyStyles(keyframe, true);
            Object.keys(finalKeyframe).forEach(prop => {
                const value = finalKeyframe[prop];
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
        const preProps = preStyleProps.size ? iteratorToArray(preStyleProps.values()) : [];
        const postProps = postStyleProps.size ? iteratorToArray(postStyleProps.values()) : [];
        // special case for a 0-second animation (which is designed just to place styles onscreen)
        if (isEmpty) {
            const kf0 = finalKeyframes[0];
            const kf1 = copyObj(kf0);
            kf0['offset'] = 0;
            kf1['offset'] = 1;
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
            const newFirstKeyframe = copyStyles(keyframes[0], false);
            newFirstKeyframe['offset'] = 0;
            newKeyframes.push(newFirstKeyframe);
            const oldFirstKeyframe = copyStyles(keyframes[0], false);
            oldFirstKeyframe['offset'] = roundOffset(startingGap);
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
                let kf = copyStyles(keyframes[i], false);
                const oldOffset = kf['offset'];
                const timeAtKeyframe = delay + oldOffset * duration;
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
function roundOffset(offset, decimalPoints = 3) {
    const mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
function flattenStyles(input, allStyles) {
    const styles = {};
    let allProperties;
    input.forEach(token => {
        if (token === '*') {
            allProperties = allProperties || Object.keys(allStyles);
            allProperties.forEach(prop => {
                styles[prop] = AUTO_STYLE;
            });
        }
        else {
            copyStyles(token, false, styles);
        }
    });
    return styles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQXNHLFVBQVUsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFHekwsT0FBTyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHakksT0FBTyxFQUErQix5QkFBeUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3pHLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUZHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUNuQyxNQUF1QixFQUFFLFdBQWdCLEVBQUUsR0FBK0IsRUFDMUUsY0FBc0IsRUFBRSxjQUFzQixFQUFFLGlCQUE2QixFQUFFLEVBQy9FLGNBQTBCLEVBQUUsRUFB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QUFDLENBQUM7SUFDN0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDMUMsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQTRCLEVBQUUsU0FBcUI7SUFDeEUsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO0lBQzlCLElBQUksYUFBdUIsQ0FBQztJQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUNqQixhQUFhLEdBQUcsYUFBYSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxVQUFVLENBQUMsS0FBbUIsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDaEQ7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0ZUNoaWxkT3B0aW9ucywgQW5pbWF0ZVRpbWluZ3MsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUXVlcnlPcHRpb25zLCBBVVRPX1NUWUxFLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Y29weU9iaiwgY29weVN0eWxlcywgaW50ZXJwb2xhdGVQYXJhbXMsIGl0ZXJhdG9yVG9BcnJheSwgcmVzb2x2ZVRpbWluZywgcmVzb2x2ZVRpbWluZ1ZhbHVlLCB2aXNpdERzbE5vZGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGVBc3QsIEFuaW1hdGVDaGlsZEFzdCwgQW5pbWF0ZVJlZkFzdCwgQXN0LCBBc3RWaXNpdG9yLCBEeW5hbWljVGltaW5nQXN0LCBHcm91cEFzdCwgS2V5ZnJhbWVzQXN0LCBRdWVyeUFzdCwgUmVmZXJlbmNlQXN0LCBTZXF1ZW5jZUFzdCwgU3RhZ2dlckFzdCwgU3RhdGVBc3QsIFN0eWxlQXN0LCBUaW1pbmdBc3QsIFRyYW5zaXRpb25Bc3QsIFRyaWdnZXJBc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcblxuY29uc3QgT05FX0ZSQU1FX0lOX01JTExJU0VDT05EUyA9IDE7XG5jb25zdCBFTlRFUl9UT0tFTiA9ICc6ZW50ZXInO1xuY29uc3QgRU5URVJfVE9LRU5fUkVHRVggPSBuZXcgUmVnRXhwKEVOVEVSX1RPS0VOLCAnZycpO1xuY29uc3QgTEVBVkVfVE9LRU4gPSAnOmxlYXZlJztcbmNvbnN0IExFQVZFX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChMRUFWRV9UT0tFTiwgJ2cnKTtcblxuLypcbiAqIFRoZSBjb2RlIHdpdGhpbiB0aGlzIGZpbGUgYWltcyB0byBnZW5lcmF0ZSB3ZWItYW5pbWF0aW9ucy1jb21wYXRpYmxlIGtleWZyYW1lcyBmcm9tIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBjb2RlLlxuICpcbiAqIFRoZSBjb2RlIGJlbG93IHdpbGwgYmUgY29udmVydGVkIGZyb206XG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogVG86XG4gKiBgYGBcbiAqIGtleWZyYW1lcyA9IFt7IG9wYWNpdHk6IDAsIG9mZnNldDogMCB9LCB7IG9wYWNpdHk6IDEsIG9mZnNldDogMSB9XVxuICogZHVyYXRpb24gPSAxMDAwXG4gKiBkZWxheSA9IDBcbiAqIGVhc2luZyA9ICcnXG4gKiBgYGBcbiAqXG4gKiBGb3IgdGhpcyBvcGVyYXRpb24gdG8gY292ZXIgdGhlIGNvbWJpbmF0aW9uIG9mIGFuaW1hdGlvbiB2ZXJicyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFcbiAqIGNvbWJpbmF0aW9uIG9mIHByb3RvdHlwaWNhbCBpbmhlcml0YW5jZSwgQVNUIHRyYXZlcnNhbCBhbmQgbWVyZ2Utc29ydC1saWtlIGFsZ29yaXRobXMgYXJlIHVzZWQuXG4gKlxuICogW0FTVCBUcmF2ZXJzYWxdXG4gKiBFYWNoIG9mIHRoZSBhbmltYXRpb24gdmVyYnMsIHdoZW4gZXhlY3V0ZWQsIHdpbGwgcmV0dXJuIGFuIHN0cmluZy1tYXAgb2JqZWN0IHJlcHJlc2VudGluZyB3aGF0XG4gKiB0eXBlIG9mIGFjdGlvbiBpdCBpcyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFuZCB0aGUgZGF0YSBhc3NvY2lhdGVkIHdpdGggaXQuIFRoaXMgbWVhbnNcbiAqIHRoYXQgd2hlbiBmdW5jdGlvbmFsIGNvbXBvc2l0aW9uIG1peCBvZiB0aGVzZSBmdW5jdGlvbnMgaXMgZXZhbHVhdGVkIChsaWtlIGluIHRoZSBleGFtcGxlIGFib3ZlKVxuICogdGhlbiBpdCB3aWxsIGVuZCB1cCBwcm9kdWNpbmcgYSB0cmVlIG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBhbmltYXRpb24gaXRzZWxmLlxuICpcbiAqIFdoZW4gdGhpcyBhbmltYXRpb24gb2JqZWN0IHRyZWUgaXMgcHJvY2Vzc2VkIGJ5IHRoZSB2aXNpdG9yIGNvZGUgYmVsb3cgaXQgd2lsbCB2aXNpdCBlYWNoIG9mIHRoZVxuICogdmVyYiBzdGF0ZW1lbnRzIHdpdGhpbiB0aGUgdmlzaXRvci4gQW5kIGR1cmluZyBlYWNoIHZpc2l0IGl0IHdpbGwgYnVpbGQgdGhlIGNvbnRleHQgb2YgdGhlXG4gKiBhbmltYXRpb24ga2V5ZnJhbWVzIGJ5IGludGVyYWN0aW5nIHdpdGggdGhlIGBUaW1lbGluZUJ1aWxkZXJgLlxuICpcbiAqIFtUaW1lbGluZUJ1aWxkZXJdXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciB0cmFja2luZyB0aGUgc3R5bGVzIGFuZCBidWlsZGluZyBhIHNlcmllcyBvZiBrZXlmcmFtZSBvYmplY3RzIGZvciBhXG4gKiB0aW1lbGluZSBiZXR3ZWVuIGEgc3RhcnQgYW5kIGVuZCB0aW1lLiBUaGUgYnVpbGRlciBzdGFydHMgb2ZmIHdpdGggYW4gaW5pdGlhbCB0aW1lbGluZSBhbmQgZWFjaFxuICogdGltZSB0aGUgQVNUIGNvbWVzIGFjcm9zcyBhIGBncm91cCgpYCwgYGtleWZyYW1lcygpYCBvciBhIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28gd2l0aGluIGFcbiAqIGBzZXF1ZW5jZSgpYCB0aGVuIGl0IHdpbGwgZ2VuZXJhdGUgYSBzdWIgdGltZWxpbmUgZm9yIGVhY2ggc3RlcCBhcyB3ZWxsIGFzIGEgbmV3IG9uZSBhZnRlclxuICogdGhleSBhcmUgY29tcGxldGUuXG4gKlxuICogQXMgdGhlIEFTVCBpcyB0cmF2ZXJzZWQsIHRoZSB0aW1pbmcgc3RhdGUgb24gZWFjaCBvZiB0aGUgdGltZWxpbmVzIHdpbGwgYmUgaW5jcmVtZW50ZWQuIElmIGEgc3ViXG4gKiB0aW1lbGluZSB3YXMgY3JlYXRlZCAoYmFzZWQgb24gb25lIG9mIHRoZSBjYXNlcyBhYm92ZSkgdGhlbiB0aGUgcGFyZW50IHRpbWVsaW5lIHdpbGwgYXR0ZW1wdCB0b1xuICogbWVyZ2UgdGhlIHN0eWxlcyB1c2VkIHdpdGhpbiB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIGl0c2VsZiAob25seSB3aXRoIGdyb3VwKCkgdGhpcyB3aWxsIGhhcHBlbikuXG4gKiBUaGlzIGhhcHBlbnMgd2l0aCBhIG1lcmdlIG9wZXJhdGlvbiAobXVjaCBsaWtlIGhvdyB0aGUgbWVyZ2Ugd29ya3MgaW4gbWVyZ2VTb3J0KSBhbmQgaXQgd2lsbCBvbmx5XG4gKiBjb3B5IHRoZSBtb3N0IHJlY2VudGx5IHVzZWQgc3R5bGVzIGZyb20gdGhlIHN1YiB0aW1lbGluZXMgaW50byB0aGUgcGFyZW50IHRpbWVsaW5lLiBUaGlzIGVuc3VyZXNcbiAqIHRoYXQgaWYgdGhlIHN0eWxlcyBhcmUgdXNlZCBsYXRlciBvbiBpbiBhbm90aGVyIHBoYXNlIG9mIHRoZSBhbmltYXRpb24gdGhlbiB0aGV5IHdpbGwgYmUgdGhlIG1vc3RcbiAqIHVwLXRvLWRhdGUgdmFsdWVzLlxuICpcbiAqIFtIb3cgTWlzc2luZyBTdHlsZXMgQXJlIFVwZGF0ZWRdXG4gKiBFYWNoIHRpbWVsaW5lIGhhcyBhIGBiYWNrRmlsbGAgcHJvcGVydHkgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGZpbGxpbmcgaW4gbmV3IHN0eWxlcyBpbnRvXG4gKiBhbHJlYWR5IHByb2Nlc3NlZCBrZXlmcmFtZXMgaWYgYSBuZXcgc3R5bGUgc2hvd3MgdXAgbGF0ZXIgd2l0aGluIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgd2lkdGg6IDAgfSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMTAwIH0pKSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAyMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDMwMCB9KSlcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiA0MDAsIGhlaWdodDogNDAwIH0pKSAvLyBub3RpY2UgaG93IGBoZWlnaHRgIGRvZXNuJ3QgZXhpc3QgYW55d2hlcmVcbiAqIGVsc2VcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBXaGF0IGlzIGhhcHBlbmluZyBoZXJlIGlzIHRoYXQgdGhlIGBoZWlnaHRgIHZhbHVlIGlzIGFkZGVkIGxhdGVyIGluIHRoZSBzZXF1ZW5jZSwgYnV0IGlzIG1pc3NpbmdcbiAqIGZyb20gYWxsIHByZXZpb3VzIGFuaW1hdGlvbiBzdGVwcy4gVGhlcmVmb3JlIHdoZW4gYSBrZXlmcmFtZSBpcyBjcmVhdGVkIGl0IHdvdWxkIGFsc28gYmUgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMga2V5ZnJhbWVzIHVwIHVudGlsIHdoZXJlIGl0IGlzIGZpcnN0IHVzZWQuIEZvciB0aGUgdGltZWxpbmUga2V5ZnJhbWUgZ2VuZXJhdGlvblxuICogdG8gcHJvcGVybHkgZmlsbCBpbiB0aGUgc3R5bGUgaXQgd2lsbCBwbGFjZSB0aGUgcHJldmlvdXMgdmFsdWUgKHRoZSB2YWx1ZSBmcm9tIHRoZSBwYXJlbnRcbiAqIHRpbWVsaW5lKSBvciBhIGRlZmF1bHQgdmFsdWUgb2YgYCpgIGludG8gdGhlIGJhY2tGaWxsIG9iamVjdC4gR2l2ZW4gdGhhdCBlYWNoIG9mIHRoZSBrZXlmcmFtZVxuICogc3R5bGVzIGlzIGFuIG9iamVjdCB0aGF0IHByb3RvdHlwaWNhbGx5IGluaGVyaXRzIGZyb20gdGhlIGJhY2tGaWxsIG9iamVjdCwgdGhpcyBtZWFucyB0aGF0IGlmIGFcbiAqIHZhbHVlIGlzIGFkZGVkIGludG8gdGhlIGJhY2tGaWxsIHRoZW4gaXQgd2lsbCBhdXRvbWF0aWNhbGx5IHByb3BhZ2F0ZSBhbnkgbWlzc2luZyB2YWx1ZXMgdG8gYWxsXG4gKiBrZXlmcmFtZXMuIFRoZXJlZm9yZSB0aGUgbWlzc2luZyBgaGVpZ2h0YCB2YWx1ZSB3aWxsIGJlIHByb3Blcmx5IGZpbGxlZCBpbnRvIHRoZSBhbHJlYWR5XG4gKiBwcm9jZXNzZWQga2V5ZnJhbWVzLlxuICpcbiAqIFdoZW4gYSBzdWItdGltZWxpbmUgaXMgY3JlYXRlZCBpdCB3aWxsIGhhdmUgaXRzIG93biBiYWNrRmlsbCBwcm9wZXJ0eS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAqIHN0eWxlcyBwcmVzZW50IHdpdGhpbiB0aGUgc3ViLXRpbWVsaW5lIGRvIG5vdCBhY2NpZGVudGFsbHkgc2VlcCBpbnRvIHRoZSBwcmV2aW91cy9mdXR1cmUgdGltZWxpbmVcbiAqIGtleWZyYW1lc1xuICpcbiAqIChGb3IgcHJvdG90eXBpY2FsbHktaW5oZXJpdGVkIGNvbnRlbnRzIHRvIGJlIGRldGVjdGVkIGEgYGZvcihpIGluIG9iailgIGxvb3AgbXVzdCBiZSB1c2VkLilcbiAqXG4gKiBbVmFsaWRhdGlvbl1cbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBub3QgcmVzcG9uc2libGUgZm9yIHZhbGlkYXRpb24uIFRoYXQgZnVuY3Rpb25hbGl0eSBoYXBwZW5zIHdpdGggd2l0aGluXG4gKiB0aGUgYEFuaW1hdGlvblZhbGlkYXRvclZpc2l0b3JgIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFuaW1hdGlvblRpbWVsaW5lcyhcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICBlbnRlckNsYXNzTmFtZTogc3RyaW5nLCBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBzdGFydGluZ1N0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBmaW5hbFN0eWxlczogybVTdHlsZURhdGEgPSB7fSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVycm9yczogYW55W10gPSBbXSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gIHJldHVybiBuZXcgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvcigpLmJ1aWxkS2V5ZnJhbWVzKFxuICAgICAgZHJpdmVyLCByb290RWxlbWVudCwgYXN0LCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIHN0YXJ0aW5nU3R5bGVzLCBmaW5hbFN0eWxlcyxcbiAgICAgIG9wdGlvbnMsIHN1Ykluc3RydWN0aW9ucywgZXJyb3JzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YSxcbiAgICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgICAgZXJyb3JzOiBhbnlbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgICBzdWJJbnN0cnVjdGlvbnMgPSBzdWJJbnN0cnVjdGlvbnMgfHwgbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBzdWJJbnN0cnVjdGlvbnMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgZXJyb3JzLCBbXSk7XG4gICAgY29udGV4dC5vcHRpb25zID0gb3B0aW9ucztcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zZXRTdHlsZXMoW3N0YXJ0aW5nU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuXG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdCwgY29udGV4dCk7XG5cbiAgICAvLyB0aGlzIGNoZWNrcyB0byBzZWUgaWYgYW4gYWN0dWFsIGFuaW1hdGlvbiBoYXBwZW5lZFxuICAgIGNvbnN0IHRpbWVsaW5lcyA9IGNvbnRleHQudGltZWxpbmVzLmZpbHRlcih0aW1lbGluZSA9PiB0aW1lbGluZS5jb250YWluc0FuaW1hdGlvbigpKTtcblxuICAgIGlmIChPYmplY3Qua2V5cyhmaW5hbFN0eWxlcykubGVuZ3RoKSB7XG4gICAgICAvLyBub3RlOiB3ZSBqdXN0IHdhbnQgdG8gYXBwbHkgdGhlIGZpbmFsIHN0eWxlcyBmb3IgdGhlIHJvb3RFbGVtZW50LCBzbyB3ZSBkbyBub3RcbiAgICAgIC8vICAgICAgIGp1c3QgYXBwbHkgdGhlIHN0eWxlcyB0byB0aGUgbGFzdCB0aW1lbGluZSBidXQgdGhlIGxhc3QgdGltZWxpbmUgd2hpY2hcbiAgICAgIC8vICAgICAgIGVsZW1lbnQgaXMgdGhlIHJvb3Qgb25lIChiYXNpY2FsbHkgYCpgLXN0eWxlcyBhcmUgcmVwbGFjZWQgd2l0aCB0aGUgYWN0dWFsXG4gICAgICAvLyAgICAgICBzdGF0ZSBzdHlsZSB2YWx1ZXMgb25seSBmb3IgdGhlIHJvb3QgZWxlbWVudClcbiAgICAgIGxldCBsYXN0Um9vdFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXJ8dW5kZWZpbmVkO1xuICAgICAgZm9yIChsZXQgaSA9IHRpbWVsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRpbWVsaW5lc1tpXTtcbiAgICAgICAgaWYgKHRpbWVsaW5lLmVsZW1lbnQgPT09IHJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgbGFzdFJvb3RUaW1lbGluZSA9IHRpbWVsaW5lO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobGFzdFJvb3RUaW1lbGluZSAmJiAhbGFzdFJvb3RUaW1lbGluZS5hbGxvd09ubHlUaW1lbGluZVN0eWxlcygpKSB7XG4gICAgICAgIGxhc3RSb290VGltZWxpbmUuc2V0U3R5bGVzKFtmaW5hbFN0eWxlc10sIG51bGwsIGNvbnRleHQuZXJyb3JzLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGltZWxpbmVzLmxlbmd0aCA/IHRpbWVsaW5lcy5tYXAodGltZWxpbmUgPT4gdGltZWxpbmUuYnVpbGRLZXlmcmFtZXMoKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24ocm9vdEVsZW1lbnQsIFtdLCBbXSwgW10sIDAsIDAsICcnLCBmYWxzZSldO1xuICB9XG5cbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IGFueSB7XG4gICAgLy8gdGhlc2UgdmFsdWVzIGFyZSBub3QgdmlzaXRlZCBpbiB0aGlzIEFTVFxuICB9XG5cbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChhc3Q6IEFuaW1hdGVDaGlsZEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBlbGVtZW50SW5zdHJ1Y3Rpb25zID0gY29udGV4dC5zdWJJbnN0cnVjdGlvbnMuZ2V0KGNvbnRleHQuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLl92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgICAgICBlbGVtZW50SW5zdHJ1Y3Rpb25zLCBpbm5lckNvbnRleHQsIGlubmVyQ29udGV4dC5vcHRpb25zIGFzIEFuaW1hdGVDaGlsZE9wdGlvbnMpO1xuICAgICAgaWYgKHN0YXJ0VGltZSAhPSBlbmRUaW1lKSB7XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgb24gdGhlIHVwcGVyIGNvbnRleHQgYmVjYXVzZSB3ZSBjcmVhdGVkIGEgc3ViIGNvbnRleHQgZm9yXG4gICAgICAgIC8vIHRoZSBzdWIgY2hpbGQgYW5pbWF0aW9uc1xuICAgICAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShlbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEFuaW1hdGVSZWYoYXN0OiBBbmltYXRlUmVmQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgaW5uZXJDb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgIHRoaXMudmlzaXRSZWZlcmVuY2UoYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0U3ViSW5zdHJ1Y3Rpb25zKFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCxcbiAgICAgIG9wdGlvbnM6IEFuaW1hdGVDaGlsZE9wdGlvbnMpOiBudW1iZXIge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGxldCBmdXJ0aGVzdFRpbWUgPSBzdGFydFRpbWU7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbC1jYXNlIGZvciB3aGVuIGEgdXNlciB3YW50cyB0byBza2lwIGEgc3ViXG4gICAgLy8gYW5pbWF0aW9uIGZyb20gYmVpbmcgZmlyZWQgZW50aXJlbHkuXG4gICAgY29uc3QgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uICE9IG51bGwgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kdXJhdGlvbikgOiBudWxsO1xuICAgIGNvbnN0IGRlbGF5ID0gb3B0aW9ucy5kZWxheSAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogbnVsbDtcbiAgICBpZiAoZHVyYXRpb24gIT09IDApIHtcbiAgICAgIGluc3RydWN0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25UaW1pbmdzID1cbiAgICAgICAgICAgIGNvbnRleHQuYXBwZW5kSW5zdHJ1Y3Rpb25Ub1RpbWVsaW5lKGluc3RydWN0aW9uLCBkdXJhdGlvbiwgZGVsYXkpO1xuICAgICAgICBmdXJ0aGVzdFRpbWUgPVxuICAgICAgICAgICAgTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbnN0cnVjdGlvblRpbWluZ3MuZHVyYXRpb24gKyBpbnN0cnVjdGlvblRpbWluZ3MuZGVsYXkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1cnRoZXN0VGltZTtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb250ZXh0LnVwZGF0ZU9wdGlvbnMoYXN0Lm9wdGlvbnMsIHRydWUpO1xuICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBhc3QuYW5pbWF0aW9uLCBjb250ZXh0KTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U2VxdWVuY2UoYXN0OiBTZXF1ZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3Qgc3ViQ29udGV4dENvdW50ID0gY29udGV4dC5zdWJDb250ZXh0Q291bnQ7XG4gICAgbGV0IGN0eCA9IGNvbnRleHQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGFzdC5vcHRpb25zO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMucGFyYW1zIHx8IG9wdGlvbnMuZGVsYXkpKSB7XG4gICAgICBjdHggPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQob3B0aW9ucyk7XG4gICAgICBjdHgudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKCk7XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGN0eC5wcmV2aW91c05vZGUudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUpIHtcbiAgICAgICAgICBjdHguY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgICAgIGN0eC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpO1xuICAgICAgICBjdHguZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFzdC5zdGVwcy5sZW5ndGgpIHtcbiAgICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4gdmlzaXREc2xOb2RlKHRoaXMsIHMsIGN0eCkpO1xuXG4gICAgICAvLyB0aGlzIGlzIGhlcmUganVzdCBpbiBjYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kIHdpdGggYSBzdHlsZSgpIGNhbGxcbiAgICAgIGN0eC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBzb21lIGFuaW1hdGlvbiBmdW5jdGlvbiB3aXRoaW4gdGhlIHNlcXVlbmNlXG4gICAgICAvLyBlbmRlZCB1cCBjcmVhdGluZyBhIHN1YiB0aW1lbGluZSAod2hpY2ggbWVhbnMgdGhlIGN1cnJlbnRcbiAgICAgIC8vIHRpbWVsaW5lIGNhbm5vdCBvdmVybGFwIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBzZXF1ZW5jZSlcbiAgICAgIGlmIChjdHguc3ViQ29udGV4dENvdW50ID4gc3ViQ29udGV4dENvdW50KSB7XG4gICAgICAgIGN0eC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0R3JvdXAoYXN0OiBHcm91cEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZXM6IFRpbWVsaW5lQnVpbGRlcltdID0gW107XG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGRlbGF5ID0gYXN0Lm9wdGlvbnMgJiYgYXN0Lm9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUoYXN0Lm9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zKTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBpbm5lckNvbnRleHQpO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICAgIGlubmVyVGltZWxpbmVzLnB1c2goaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIG9wZXJhdGlvbiBpcyBydW4gYWZ0ZXIgdGhlIEFTVCBsb29wIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gaWYgdGhlIHBhcmVudCB0aW1lbGluZSdzIGNvbGxlY3RlZCBzdHlsZXMgd2VyZSB1cGRhdGVkIHRoZW5cbiAgICAvLyBpdCB3b3VsZCBwYXNzIGluIGludmFsaWQgZGF0YSBpbnRvIHRoZSBuZXctdG8tYmUgZm9ya2VkIGl0ZW1zXG4gICAgaW5uZXJUaW1lbGluZXMuZm9yRWFjaChcbiAgICAgICAgdGltZWxpbmUgPT4gY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZSkpO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRpbWluZyhhc3Q6IFRpbWluZ0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGlmICgoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLmR5bmFtaWMpIHtcbiAgICAgIGNvbnN0IHN0clZhbHVlID0gKGFzdCBhcyBEeW5hbWljVGltaW5nQXN0KS5zdHJWYWx1ZTtcbiAgICAgIGNvbnN0IHRpbWluZ1ZhbHVlID1cbiAgICAgICAgICBjb250ZXh0LnBhcmFtcyA/IGludGVycG9sYXRlUGFyYW1zKHN0clZhbHVlLCBjb250ZXh0LnBhcmFtcywgY29udGV4dC5lcnJvcnMpIDogc3RyVmFsdWU7XG4gICAgICByZXR1cm4gcmVzb2x2ZVRpbWluZyh0aW1pbmdWYWx1ZSwgY29udGV4dC5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiBhc3QuZHVyYXRpb24sIGRlbGF5OiBhc3QuZGVsYXksIGVhc2luZzogYXN0LmVhc2luZ307XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBbmltYXRlKGFzdDogQW5pbWF0ZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgdGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5fdmlzaXRUaW1pbmcoYXN0LnRpbWluZ3MsIGNvbnRleHQpO1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKHRpbWluZ3MuZGVsYXkpIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmRlbGF5KTtcbiAgICAgIHRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gYXN0LnN0eWxlO1xuICAgIGlmIChzdHlsZS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMpIHtcbiAgICAgIHRoaXMudmlzaXRLZXlmcmFtZXMoc3R5bGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmluY3JlbWVudFRpbWUodGltaW5ncy5kdXJhdGlvbik7XG4gICAgICB0aGlzLnZpc2l0U3R5bGUoc3R5bGUgYXMgU3R5bGVBc3QsIGNvbnRleHQpO1xuICAgICAgdGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBudWxsO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdHlsZShhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyE7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB3aGVuIGEgc3R5bGUoKSBjYWxsXG4gICAgLy8gZGlyZWN0bHkgZm9sbG93cyAgYW4gYW5pbWF0ZSgpIGNhbGwgKGJ1dCBub3QgaW5zaWRlIG9mIGFuIGFuaW1hdGUoKSBjYWxsKVxuICAgIGlmICghdGltaW5ncyAmJiB0aW1lbGluZS5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoKSB7XG4gICAgICB0aW1lbGluZS5mb3J3YXJkRnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmcgPSAodGltaW5ncyAmJiB0aW1pbmdzLmVhc2luZykgfHwgYXN0LmVhc2luZztcbiAgICBpZiAoYXN0LmlzRW1wdHlTdGVwKSB7XG4gICAgICB0aW1lbGluZS5hcHBseUVtcHR5U3RlcChlYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lbGluZS5zZXRTdHlsZXMoYXN0LnN0eWxlcywgZWFzaW5nLCBjb250ZXh0LmVycm9ycywgY29udGV4dC5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZnJhbWVzKGFzdDogS2V5ZnJhbWVzQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyE7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gKGNvbnRleHQuY3VycmVudFRpbWVsaW5lISkuZHVyYXRpb247XG4gICAgY29uc3QgZHVyYXRpb24gPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZHVyYXRpb247XG4gICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KCk7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaW5uZXJUaW1lbGluZS5lYXNpbmcgPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZWFzaW5nO1xuXG4gICAgYXN0LnN0eWxlcy5mb3JFYWNoKHN0ZXAgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBzdGVwLm9mZnNldCB8fCAwO1xuICAgICAgaW5uZXJUaW1lbGluZS5mb3J3YXJkVGltZShvZmZzZXQgKiBkdXJhdGlvbik7XG4gICAgICBpbm5lclRpbWVsaW5lLnNldFN0eWxlcyhzdGVwLnN0eWxlcywgc3RlcC5lYXNpbmcsIGNvbnRleHQuZXJyb3JzLCBjb250ZXh0Lm9wdGlvbnMpO1xuICAgICAgaW5uZXJUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgcGFyZW50IHRpbWVsaW5lIGdldHMgYWxsIHRoZSBzdHlsZXMgZnJvbVxuICAgIC8vIHRoZSBjaGlsZCBldmVuIGlmIHRoZSBuZXcgdGltZWxpbmUgYmVsb3cgaXMgbm90IHVzZWRcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKGlubmVyVGltZWxpbmUpO1xuXG4gICAgLy8gd2UgZG8gdGhpcyBiZWNhdXNlIHRoZSB3aW5kb3cgYmV0d2VlbiB0aGlzIHRpbWVsaW5lIGFuZCB0aGUgc3ViIHRpbWVsaW5lXG4gICAgLy8gc2hvdWxkIGVuc3VyZSB0aGF0IHRoZSBzdHlsZXMgd2l0aGluIGFyZSBleGFjdGx5IHRoZSBzYW1lIGFzIHRoZXkgd2VyZSBiZWZvcmVcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShzdGFydFRpbWUgKyBkdXJhdGlvbik7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFF1ZXJ5KGFzdDogUXVlcnlBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBmaXJzdCBzdGVwIGJlZm9yZSB0aGlzIGlzIGEgc3R5bGUgc3RlcCB3ZSBuZWVkXG4gICAgLy8gdG8gZW5zdXJlIHRoZSBzdHlsZXMgYXJlIGFwcGxpZWQgYmVmb3JlIHRoZSBjaGlsZHJlbiBhcmUgYW5pbWF0ZWRcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBvcHRpb25zID0gKGFzdC5vcHRpb25zIHx8IHt9KSBhcyBBbmltYXRpb25RdWVyeU9wdGlvbnM7XG4gICAgY29uc3QgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGlmIChkZWxheSAmJlxuICAgICAgICAoY29udGV4dC5wcmV2aW91c05vZGUudHlwZSA9PT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlIHx8XG4gICAgICAgICAoc3RhcnRUaW1lID09IDAgJiYgY29udGV4dC5jdXJyZW50VGltZWxpbmUuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCkpKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgfVxuXG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IHN0YXJ0VGltZTtcbiAgICBjb25zdCBlbG1zID0gY29udGV4dC5pbnZva2VRdWVyeShcbiAgICAgICAgYXN0LnNlbGVjdG9yLCBhc3Qub3JpZ2luYWxTZWxlY3RvciwgYXN0LmxpbWl0LCBhc3QuaW5jbHVkZVNlbGYsXG4gICAgICAgIG9wdGlvbnMub3B0aW9uYWwgPyB0cnVlIDogZmFsc2UsIGNvbnRleHQuZXJyb3JzKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSBlbG1zLmxlbmd0aDtcbiAgICBsZXQgc2FtZUVsZW1lbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyfG51bGwgPSBudWxsO1xuICAgIGVsbXMuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuICAgICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IGk7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMsIGVsZW1lbnQpO1xuICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIGlubmVyQ29udGV4dC5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVsZW1lbnQgPT09IGNvbnRleHQuZWxlbWVudCkge1xuICAgICAgICBzYW1lRWxlbWVudFRpbWVsaW5lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICAgIH1cblxuICAgICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGlubmVyQ29udGV4dCk7XG5cbiAgICAgIC8vIHRoaXMgaXMgaGVyZSBqdXN0IGluY2FzZSB0aGUgaW5uZXIgc3RlcHMgb25seSBjb250YWluIG9yIGVuZFxuICAgICAgLy8gd2l0aCBhIHN0eWxlKCkgY2FsbCAod2hpY2ggaXMgaGVyZSB0byBzaWduYWwgdGhhdCB0aGlzIGlzIGEgcHJlcGFyYXRvcnlcbiAgICAgIC8vIGNhbGwgdG8gc3R5bGUgYW4gZWxlbWVudCBiZWZvcmUgaXQgaXMgYW5pbWF0ZWQgYWdhaW4pXG4gICAgICBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuXG4gICAgICBjb25zdCBlbmRUaW1lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGZ1cnRoZXN0VGltZSA9IE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgZW5kVGltZSk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gMDtcbiAgICBjb250ZXh0LmN1cnJlbnRRdWVyeVRvdGFsID0gMDtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShmdXJ0aGVzdFRpbWUpO1xuXG4gICAgaWYgKHNhbWVFbGVtZW50VGltZWxpbmUpIHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXMoc2FtZUVsZW1lbnRUaW1lbGluZSk7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U3RhZ2dlcihhc3Q6IFN0YWdnZXJBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHBhcmVudENvbnRleHQgPSBjb250ZXh0LnBhcmVudENvbnRleHQhO1xuICAgIGNvbnN0IHRsID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGFzdC50aW1pbmdzO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5hYnModGltaW5ncy5kdXJhdGlvbik7XG4gICAgY29uc3QgbWF4VGltZSA9IGR1cmF0aW9uICogKGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgLSAxKTtcbiAgICBsZXQgZGVsYXkgPSBkdXJhdGlvbiAqIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXg7XG5cbiAgICBsZXQgc3RhZ2dlclRyYW5zZm9ybWVyID0gdGltaW5ncy5kdXJhdGlvbiA8IDAgPyAncmV2ZXJzZScgOiB0aW1pbmdzLmVhc2luZztcbiAgICBzd2l0Y2ggKHN0YWdnZXJUcmFuc2Zvcm1lcikge1xuICAgICAgY2FzZSAncmV2ZXJzZSc6XG4gICAgICAgIGRlbGF5ID0gbWF4VGltZSAtIGRlbGF5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgICBkZWxheSA9IHBhcmVudENvbnRleHQuY3VycmVudFN0YWdnZXJUaW1lO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGlmIChkZWxheSkge1xuICAgICAgdGltZWxpbmUuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRpbmdUaW1lID0gdGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuXG4gICAgLy8gdGltZSA9IGR1cmF0aW9uICsgZGVsYXlcbiAgICAvLyB0aGUgcmVhc29uIHdoeSB0aGlzIGNvbXB1dGF0aW9uIGlzIHNvIGNvbXBsZXggaXMgYmVjYXVzZVxuICAgIC8vIHRoZSBpbm5lciB0aW1lbGluZSBtYXkgZWl0aGVyIGhhdmUgYSBkZWxheSB2YWx1ZSBvciBhIHN0cmV0Y2hlZFxuICAgIC8vIGtleWZyYW1lIGRlcGVuZGluZyBvbiBpZiBhIHN1YnRpbWVsaW5lIGlzIG5vdCB1c2VkIG9yIGlzIHVzZWQuXG4gICAgcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWUgPVxuICAgICAgICAodGwuY3VycmVudFRpbWUgLSBzdGFydGluZ1RpbWUpICsgKHRsLnN0YXJ0VGltZSAtIHBhcmVudENvbnRleHQuY3VycmVudFRpbWVsaW5lLnN0YXJ0VGltZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBTdHlsZUF0VGltZSA9IHtcbiAgdGltZTogbnVtYmVyOyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyO1xufTtcblxuY29uc3QgREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREUgPSA8QXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4+e307XG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHtcbiAgcHVibGljIHBhcmVudENvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dHxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyO1xuICBwdWJsaWMgY3VycmVudEFuaW1hdGVUaW1pbmdzOiBBbmltYXRlVGltaW5nc3xudWxsID0gbnVsbDtcbiAgcHVibGljIHByZXZpb3VzTm9kZTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4gPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgcHVibGljIHN1YkNvbnRleHRDb3VudCA9IDA7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gIHB1YmxpYyBjdXJyZW50UXVlcnlJbmRleDogbnVtYmVyID0gMDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeVRvdGFsOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFN0YWdnZXJUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksXG4gICAgICBwdWJsaWMgc3ViSW5zdHJ1Y3Rpb25zOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIHByaXZhdGUgX2VudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIF9sZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBwdWJsaWMgZXJyb3JzOiBhbnlbXSwgcHVibGljIHRpbWVsaW5lczogVGltZWxpbmVCdWlsZGVyW10sXG4gICAgICBpbml0aWFsVGltZWxpbmU/OiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IGluaXRpYWxUaW1lbGluZSB8fCBuZXcgVGltZWxpbmVCdWlsZGVyKHRoaXMuX2RyaXZlciwgZWxlbWVudCwgMCk7XG4gICAgdGltZWxpbmVzLnB1c2godGhpcy5jdXJyZW50VGltZWxpbmUpO1xuICB9XG5cbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnBhcmFtcztcbiAgfVxuXG4gIHVwZGF0ZU9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsLCBza2lwSWZFeGlzdHM/OiBib29sZWFuKSB7XG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBhbnk7XG4gICAgbGV0IG9wdGlvbnNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIE5PVEU6IHRoaXMgd2lsbCBnZXQgcGF0Y2hlZCB1cCB3aGVuIG90aGVyIGFuaW1hdGlvbiBtZXRob2RzIHN1cHBvcnQgZHVyYXRpb24gb3ZlcnJpZGVzXG4gICAgaWYgKG5ld09wdGlvbnMuZHVyYXRpb24gIT0gbnVsbCkge1xuICAgICAgKG9wdGlvbnNUb1VwZGF0ZSBhcyBhbnkpLmR1cmF0aW9uID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG5ld09wdGlvbnMuZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChuZXdPcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnNUb1VwZGF0ZS5kZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXdPcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBsZXQgcGFyYW1zVG9VcGRhdGU6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNUb1VwZGF0ZS5wYXJhbXMhO1xuICAgICAgaWYgKCFwYXJhbXNUb1VwZGF0ZSkge1xuICAgICAgICBwYXJhbXNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucy5wYXJhbXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMobmV3UGFyYW1zKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBpZiAoIXNraXBJZkV4aXN0cyB8fCAhcGFyYW1zVG9VcGRhdGUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICBwYXJhbXNUb1VwZGF0ZVtuYW1lXSA9IGludGVycG9sYXRlUGFyYW1zKG5ld1BhcmFtc1tuYW1lXSwgcGFyYW1zVG9VcGRhdGUsIHRoaXMuZXJyb3JzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29weU9wdGlvbnMoKSB7XG4gICAgY29uc3Qgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyA9IHt9O1xuICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXM7XG4gICAgICBpZiAob2xkUGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9ID0gb3B0aW9uc1sncGFyYW1zJ10gPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMob2xkUGFyYW1zKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IG9sZFBhcmFtc1tuYW1lXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgY3JlYXRlU3ViQ29udGV4dChvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGwgPSBudWxsLCBlbGVtZW50PzogYW55LCBuZXdUaW1lPzogbnVtYmVyKTpcbiAgICAgIEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZWxlbWVudCB8fCB0aGlzLmVsZW1lbnQ7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgdGFyZ2V0LCB0aGlzLnN1Ykluc3RydWN0aW9ucywgdGhpcy5fZW50ZXJDbGFzc05hbWUsIHRoaXMuX2xlYXZlQ2xhc3NOYW1lLFxuICAgICAgICB0aGlzLmVycm9ycywgdGhpcy50aW1lbGluZXMsIHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGFyZ2V0LCBuZXdUaW1lIHx8IDApKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IHRoaXMucHJldmlvdXNOb2RlO1xuICAgIGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5jdXJyZW50QW5pbWF0ZVRpbWluZ3M7XG5cbiAgICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLl9jb3B5T3B0aW9ucygpO1xuICAgIGNvbnRleHQudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSB0aGlzLmN1cnJlbnRRdWVyeUluZGV4O1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSB0aGlzLmN1cnJlbnRRdWVyeVRvdGFsO1xuICAgIGNvbnRleHQucGFyZW50Q29udGV4dCA9IHRoaXM7XG4gICAgdGhpcy5zdWJDb250ZXh0Q291bnQrKztcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuXG4gIHRyYW5zZm9ybUludG9OZXdUaW1lbGluZShuZXdUaW1lPzogbnVtYmVyKSB7XG4gICAgdGhpcy5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGhpcy5lbGVtZW50LCBuZXdUaW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKHRoaXMuY3VycmVudFRpbWVsaW5lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZWxpbmU7XG4gIH1cblxuICBhcHBlbmRJbnN0cnVjdGlvblRvVGltZWxpbmUoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwgZHVyYXRpb246IG51bWJlcnxudWxsLFxuICAgICAgZGVsYXk6IG51bWJlcnxudWxsKTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGNvbnN0IHVwZGF0ZWRUaW1pbmdzOiBBbmltYXRlVGltaW5ncyA9IHtcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAhPSBudWxsID8gZHVyYXRpb24gOiBpbnN0cnVjdGlvbi5kdXJhdGlvbixcbiAgICAgIGRlbGF5OiB0aGlzLmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSArIChkZWxheSAhPSBudWxsID8gZGVsYXkgOiAwKSArIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgZWFzaW5nOiAnJ1xuICAgIH07XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTdWJUaW1lbGluZUJ1aWxkZXIoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgaW5zdHJ1Y3Rpb24uZWxlbWVudCwgaW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBpbnN0cnVjdGlvbi5wcmVTdHlsZVByb3BzLFxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcywgdXBkYXRlZFRpbWluZ3MsIGluc3RydWN0aW9uLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKGJ1aWxkZXIpO1xuICAgIHJldHVybiB1cGRhdGVkVGltaW5ncztcbiAgfVxuXG4gIGluY3JlbWVudFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZWxpbmUuZHVyYXRpb24gKyB0aW1lKTtcbiAgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIG5lZ2F0aXZlIGRlbGF5cyBhcmUgbm90IHlldCBzdXBwb3J0ZWRcbiAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG4gIH1cblxuICBpbnZva2VRdWVyeShcbiAgICAgIHNlbGVjdG9yOiBzdHJpbmcsIG9yaWdpbmFsU2VsZWN0b3I6IHN0cmluZywgbGltaXQ6IG51bWJlciwgaW5jbHVkZVNlbGY6IGJvb2xlYW4sXG4gICAgICBvcHRpb25hbDogYm9vbGVhbiwgZXJyb3JzOiBhbnlbXSk6IGFueVtdIHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAoaW5jbHVkZVNlbGYpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkgeyAgLy8gb25seSBpZiA6c2VsZiBpcyB1c2VkIHRoZW4gdGhlIHNlbGVjdG9yIGNhbiBiZSBlbXB0eVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKEVOVEVSX1RPS0VOX1JFR0VYLCAnLicgKyB0aGlzLl9lbnRlckNsYXNzTmFtZSk7XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoTEVBVkVfVE9LRU5fUkVHRVgsICcuJyArIHRoaXMuX2xlYXZlQ2xhc3NOYW1lKTtcbiAgICAgIGNvbnN0IG11bHRpID0gbGltaXQgIT0gMTtcbiAgICAgIGxldCBlbGVtZW50cyA9IHRoaXMuX2RyaXZlci5xdWVyeSh0aGlzLmVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gICAgICBpZiAobGltaXQgIT09IDApIHtcbiAgICAgICAgZWxlbWVudHMgPSBsaW1pdCA8IDAgPyBlbGVtZW50cy5zbGljZShlbGVtZW50cy5sZW5ndGggKyBsaW1pdCwgZWxlbWVudHMubGVuZ3RoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKC4uLmVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbmFsICYmIHJlc3VsdHMubGVuZ3RoID09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcXGBxdWVyeShcIiR7b3JpZ2luYWxTZWxlY3Rvcn1cIilcXGAgcmV0dXJuZWQgemVybyBlbGVtZW50cy4gKFVzZSBcXGBxdWVyeShcIiR7XG4gICAgICAgICAgb3JpZ2luYWxTZWxlY3Rvcn1cIiwgeyBvcHRpb25hbDogdHJ1ZSB9KVxcYCBpZiB5b3Ugd2lzaCB0byBhbGxvdyB0aGlzLilgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgVGltZWxpbmVCdWlsZGVyIHtcbiAgcHVibGljIGR1cmF0aW9uOiBudW1iZXIgPSAwO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHVibGljIGVhc2luZyE6IHN0cmluZ3xudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c0tleWZyYW1lOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9jdXJyZW50S2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2tleWZyYW1lcyA9IG5ldyBNYXA8bnVtYmVyLCDJtVN0eWxlRGF0YT4oKTtcbiAgcHJpdmF0ZSBfc3R5bGVTdW1tYXJ5OiB7W3Byb3A6IHN0cmluZ106IFN0eWxlQXRUaW1lfSA9IHt9O1xuICBwcml2YXRlIF9sb2NhbFRpbWVsaW5lU3R5bGVzOiDJtVN0eWxlRGF0YTtcbiAgcHJpdmF0ZSBfZ2xvYmFsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhO1xuICBwcml2YXRlIF9wZW5kaW5nU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9iYWNrRmlsbDogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfY3VycmVudEVtcHR5U3RlcEtleWZyYW1lOiDJtVN0eWxlRGF0YXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgc3RhcnRUaW1lOiBudW1iZXIsXG4gICAgICBwcml2YXRlIF9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXA/OiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pIHtcbiAgICBpZiAoIXRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCkge1xuICAgICAgdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIH1cblxuICAgIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMgPSBPYmplY3QuY3JlYXRlKHRoaXMuX2JhY2tGaWxsLCB7fSk7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMgPSB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuZ2V0KGVsZW1lbnQpITtcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXM7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuc2V0KGVsZW1lbnQsIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodGhpcy5fa2V5ZnJhbWVzLnNpemUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoID4gMDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRTdHlsZVByb3BlcnRpZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9jdXJyZW50S2V5ZnJhbWUpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0VGltZSArIHRoaXMuZHVyYXRpb247XG4gIH1cblxuICBkZWxheU5leHRTdGVwKGRlbGF5OiBudW1iZXIpIHtcbiAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCBhIHN0eWxlKCkgc3RlcCBpcyBwbGFjZWQgcmlnaHQgYmVmb3JlIGEgc3RhZ2dlcigpXG4gICAgLy8gYW5kIHRoYXQgc3R5bGUoKSBzdGVwIGlzIHRoZSB2ZXJ5IGZpcnN0IHN0eWxlKCkgdmFsdWUgaW4gdGhlIGFuaW1hdGlvblxuICAgIC8vIHRoZW4gd2UgbmVlZCB0byBtYWtlIGEgY29weSBvZiB0aGUga2V5ZnJhbWUgWzAsIGNvcHksIDFdIHNvIHRoYXQgdGhlIGRlbGF5XG4gICAgLy8gcHJvcGVybHkgYXBwbGllcyB0aGUgc3R5bGUoKSB2YWx1ZXMgdG8gd29yayB3aXRoIHRoZSBzdGFnZ2VyLi4uXG4gICAgY29uc3QgaGFzUHJlU3R5bGVTdGVwID0gdGhpcy5fa2V5ZnJhbWVzLnNpemUgPT0gMSAmJiBPYmplY3Qua2V5cyh0aGlzLl9wZW5kaW5nU3R5bGVzKS5sZW5ndGg7XG5cbiAgICBpZiAodGhpcy5kdXJhdGlvbiB8fCBoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZSArIGRlbGF5KTtcbiAgICAgIGlmIChoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgICAgdGhpcy5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFRpbWUgKz0gZGVsYXk7XG4gICAgfVxuICB9XG5cbiAgZm9yayhlbGVtZW50OiBhbnksIGN1cnJlbnRUaW1lPzogbnVtYmVyKTogVGltZWxpbmVCdWlsZGVyIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHJldHVybiBuZXcgVGltZWxpbmVCdWlsZGVyKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIGN1cnJlbnRUaW1lIHx8IHRoaXMuY3VycmVudFRpbWUsIHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCk7XG4gIH1cblxuICBwcml2YXRlIF9sb2FkS2V5ZnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZSA9IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEtleWZyYW1lID0gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKSE7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSA9IE9iamVjdC5jcmVhdGUodGhpcy5fYmFja0ZpbGwsIHt9KTtcbiAgICAgIHRoaXMuX2tleWZyYW1lcy5zZXQodGhpcy5kdXJhdGlvbiwgdGhpcy5fY3VycmVudEtleWZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkRnJhbWUoKSB7XG4gICAgdGhpcy5kdXJhdGlvbiArPSBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgZm9yd2FyZFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB0aGlzLmR1cmF0aW9uID0gdGltZTtcbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0eWxlKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXIpIHtcbiAgICB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdID0gdmFsdWU7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9zdHlsZVN1bW1hcnlbcHJvcF0gPSB7dGltZTogdGhpcy5jdXJyZW50VGltZSwgdmFsdWV9O1xuICB9XG5cbiAgYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZSAhPT0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICB9XG5cbiAgYXBwbHlFbXB0eVN0ZXAoZWFzaW5nOiBzdHJpbmd8bnVsbCkge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWVbJ2Vhc2luZyddID0gZWFzaW5nO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYW5pbWF0ZShkdXJhdGlvbik6XG4gICAgLy8gYWxsIG1pc3Npbmcgc3R5bGVzIGFyZSBmaWxsZWQgd2l0aCBhIGAqYCB2YWx1ZSB0aGVuXG4gICAgLy8gaWYgYW55IGRlc3RpbmF0aW9uIHN0eWxlcyBhcmUgZmlsbGVkIGluIGxhdGVyIG9uIHRoZSBzYW1lXG4gICAgLy8ga2V5ZnJhbWUgdGhlbiB0aGV5IHdpbGwgb3ZlcnJpZGUgdGhlIG92ZXJyaWRkZW4gc3R5bGVzXG4gICAgLy8gV2UgdXNlIGBfZ2xvYmFsVGltZWxpbmVTdHlsZXNgIGhlcmUgYmVjYXVzZSB0aGVyZSBtYXkgYmVcbiAgICAvLyBzdHlsZXMgaW4gcHJldmlvdXMga2V5ZnJhbWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGluIHRoaXMgdGltZWxpbmVcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX2JhY2tGaWxsW3Byb3BdID0gdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gfHwgQVVUT19TVFlMRTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IEFVVE9fU1RZTEU7XG4gICAgfSk7XG4gICAgdGhpcy5fY3VycmVudEVtcHR5U3RlcEtleWZyYW1lID0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICB9XG5cbiAgc2V0U3R5bGVzKFxuICAgICAgaW5wdXQ6ICjJtVN0eWxlRGF0YXxzdHJpbmcpW10sIGVhc2luZzogc3RyaW5nfG51bGwsIGVycm9yczogYW55W10sXG4gICAgICBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWVbJ2Vhc2luZyddID0gZWFzaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IChvcHRpb25zICYmIG9wdGlvbnMucGFyYW1zKSB8fCB7fTtcbiAgICBjb25zdCBzdHlsZXMgPSBmbGF0dGVuU3R5bGVzKGlucHV0LCB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyk7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsID0gaW50ZXJwb2xhdGVQYXJhbXMoc3R5bGVzW3Byb3BdLCBwYXJhbXMsIGVycm9ycyk7XG4gICAgICB0aGlzLl9wZW5kaW5nU3R5bGVzW3Byb3BdID0gdmFsO1xuICAgICAgaWYgKCF0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRoaXMuX2JhY2tGaWxsW3Byb3BdID0gdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMuaGFzT3duUHJvcGVydHkocHJvcCkgP1xuICAgICAgICAgICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gOlxuICAgICAgICAgICAgQVVUT19TVFlMRTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIHZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBhcHBseVN0eWxlc1RvS2V5ZnJhbWUoKSB7XG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fcGVuZGluZ1N0eWxlcztcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0eWxlcyk7XG4gICAgaWYgKHByb3BzLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICB0aGlzLl9wZW5kaW5nU3R5bGVzID0ge307XG5cbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsID0gc3R5bGVzW3Byb3BdO1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lW3Byb3BdID0gdmFsO1xuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGlmICghdGhpcy5fY3VycmVudEtleWZyYW1lLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXNbcHJvcF07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzbmFwc2hvdEN1cnJlbnRTdHlsZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXNbcHJvcF07XG4gICAgICB0aGlzLl9wZW5kaW5nU3R5bGVzW3Byb3BdID0gdmFsO1xuICAgICAgdGhpcy5fdXBkYXRlU3R5bGUocHJvcCwgdmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbmFsS2V5ZnJhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWZyYW1lcy5nZXQodGhpcy5kdXJhdGlvbik7XG4gIH1cblxuICBnZXQgcHJvcGVydGllcygpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3AgaW4gdGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2gocHJvcCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgbWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZTogVGltZWxpbmVCdWlsZGVyKSB7XG4gICAgT2JqZWN0LmtleXModGltZWxpbmUuX3N0eWxlU3VtbWFyeSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGRldGFpbHMwID0gdGhpcy5fc3R5bGVTdW1tYXJ5W3Byb3BdO1xuICAgICAgY29uc3QgZGV0YWlsczEgPSB0aW1lbGluZS5fc3R5bGVTdW1tYXJ5W3Byb3BdO1xuICAgICAgaWYgKCFkZXRhaWxzMCB8fCBkZXRhaWxzMS50aW1lID4gZGV0YWlsczAudGltZSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCBkZXRhaWxzMS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBidWlsZEtleWZyYW1lcygpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIGNvbnN0IHByZVN0eWxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBwb3N0U3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGlzRW1wdHkgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PT0gMSAmJiB0aGlzLmR1cmF0aW9uID09PSAwO1xuXG4gICAgbGV0IGZpbmFsS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gICAgdGhpcy5fa2V5ZnJhbWVzLmZvckVhY2goKGtleWZyYW1lLCB0aW1lKSA9PiB7XG4gICAgICBjb25zdCBmaW5hbEtleWZyYW1lID0gY29weVN0eWxlcyhrZXlmcmFtZSwgdHJ1ZSk7XG4gICAgICBPYmplY3Qua2V5cyhmaW5hbEtleWZyYW1lKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGZpbmFsS2V5ZnJhbWVbcHJvcF07XG4gICAgICAgIGlmICh2YWx1ZSA9PSBQUkVfU1RZTEUpIHtcbiAgICAgICAgICBwcmVTdHlsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PSBBVVRPX1NUWUxFKSB7XG4gICAgICAgICAgcG9zdFN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghaXNFbXB0eSkge1xuICAgICAgICBmaW5hbEtleWZyYW1lWydvZmZzZXQnXSA9IHRpbWUgLyB0aGlzLmR1cmF0aW9uO1xuICAgICAgfVxuICAgICAgZmluYWxLZXlmcmFtZXMucHVzaChmaW5hbEtleWZyYW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHByZVByb3BzOiBzdHJpbmdbXSA9IHByZVN0eWxlUHJvcHMuc2l6ZSA/IGl0ZXJhdG9yVG9BcnJheShwcmVTdHlsZVByb3BzLnZhbHVlcygpKSA6IFtdO1xuICAgIGNvbnN0IHBvc3RQcm9wczogc3RyaW5nW10gPSBwb3N0U3R5bGVQcm9wcy5zaXplID8gaXRlcmF0b3JUb0FycmF5KHBvc3RTdHlsZVByb3BzLnZhbHVlcygpKSA6IFtdO1xuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciBhIDAtc2Vjb25kIGFuaW1hdGlvbiAod2hpY2ggaXMgZGVzaWduZWQganVzdCB0byBwbGFjZSBzdHlsZXMgb25zY3JlZW4pXG4gICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgIGNvbnN0IGtmMCA9IGZpbmFsS2V5ZnJhbWVzWzBdO1xuICAgICAgY29uc3Qga2YxID0gY29weU9iaihrZjApO1xuICAgICAga2YwWydvZmZzZXQnXSA9IDA7XG4gICAgICBrZjFbJ29mZnNldCddID0gMTtcbiAgICAgIGZpbmFsS2V5ZnJhbWVzID0gW2tmMCwga2YxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihcbiAgICAgICAgdGhpcy5lbGVtZW50LCBmaW5hbEtleWZyYW1lcywgcHJlUHJvcHMsIHBvc3RQcm9wcywgdGhpcy5kdXJhdGlvbiwgdGhpcy5zdGFydFRpbWUsXG4gICAgICAgIHRoaXMuZWFzaW5nLCBmYWxzZSk7XG4gIH1cbn1cblxuY2xhc3MgU3ViVGltZWxpbmVCdWlsZGVyIGV4dGVuZHMgVGltZWxpbmVCdWlsZGVyIHtcbiAgcHVibGljIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczogybVTdHlsZURhdGFbXSxcbiAgICAgIHB1YmxpYyBwcmVTdHlsZVByb3BzOiBzdHJpbmdbXSwgcHVibGljIHBvc3RTdHlsZVByb3BzOiBzdHJpbmdbXSwgdGltaW5nczogQW5pbWF0ZVRpbWluZ3MsXG4gICAgICBwcml2YXRlIF9zdHJldGNoU3RhcnRpbmdLZXlmcmFtZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoZHJpdmVyLCBlbGVtZW50LCB0aW1pbmdzLmRlbGF5KTtcbiAgICB0aGlzLnRpbWluZ3MgPSB7ZHVyYXRpb246IHRpbWluZ3MuZHVyYXRpb24sIGRlbGF5OiB0aW1pbmdzLmRlbGF5LCBlYXNpbmc6IHRpbWluZ3MuZWFzaW5nfTtcbiAgfVxuXG4gIG92ZXJyaWRlIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmtleWZyYW1lcy5sZW5ndGggPiAxO1xuICB9XG5cbiAgb3ZlcnJpZGUgYnVpbGRLZXlmcmFtZXMoKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiB7XG4gICAgbGV0IGtleWZyYW1lcyA9IHRoaXMua2V5ZnJhbWVzO1xuICAgIGxldCB7ZGVsYXksIGR1cmF0aW9uLCBlYXNpbmd9ID0gdGhpcy50aW1pbmdzO1xuICAgIGlmICh0aGlzLl9zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSAmJiBkZWxheSkge1xuICAgICAgY29uc3QgbmV3S2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gICAgICBjb25zdCB0b3RhbFRpbWUgPSBkdXJhdGlvbiArIGRlbGF5O1xuICAgICAgY29uc3Qgc3RhcnRpbmdHYXAgPSBkZWxheSAvIHRvdGFsVGltZTtcblxuICAgICAgLy8gdGhlIG9yaWdpbmFsIHN0YXJ0aW5nIGtleWZyYW1lIG5vdyBzdGFydHMgb25jZSB0aGUgZGVsYXkgaXMgZG9uZVxuICAgICAgY29uc3QgbmV3Rmlyc3RLZXlmcmFtZSA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzWzBdLCBmYWxzZSk7XG4gICAgICBuZXdGaXJzdEtleWZyYW1lWydvZmZzZXQnXSA9IDA7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChuZXdGaXJzdEtleWZyYW1lKTtcblxuICAgICAgY29uc3Qgb2xkRmlyc3RLZXlmcmFtZSA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzWzBdLCBmYWxzZSk7XG4gICAgICBvbGRGaXJzdEtleWZyYW1lWydvZmZzZXQnXSA9IHJvdW5kT2Zmc2V0KHN0YXJ0aW5nR2FwKTtcbiAgICAgIG5ld0tleWZyYW1lcy5wdXNoKG9sZEZpcnN0S2V5ZnJhbWUpO1xuXG4gICAgICAvKlxuICAgICAgICBXaGVuIHRoZSBrZXlmcmFtZSBpcyBzdHJldGNoZWQgdGhlbiBpdCBtZWFucyB0aGF0IHRoZSBkZWxheSBiZWZvcmUgdGhlIGFuaW1hdGlvblxuICAgICAgICBzdGFydHMgaXMgZ29uZS4gSW5zdGVhZCB0aGUgZmlyc3Qga2V5ZnJhbWUgaXMgcGxhY2VkIGF0IHRoZSBzdGFydCBvZiB0aGUgYW5pbWF0aW9uXG4gICAgICAgIGFuZCBpdCBpcyB0aGVuIGNvcGllZCB0byB3aGVyZSBpdCBzdGFydHMgd2hlbiB0aGUgb3JpZ2luYWwgZGVsYXkgaXMgb3Zlci4gVGhpcyBiYXNpY2FsbHlcbiAgICAgICAgbWVhbnMgbm90aGluZyBhbmltYXRlcyBkdXJpbmcgdGhhdCBkZWxheSwgYnV0IHRoZSBzdHlsZXMgYXJlIHN0aWxsIHJlbmRlcmVkLiBGb3IgdGhpc1xuICAgICAgICB0byB3b3JrIHRoZSBvcmlnaW5hbCBvZmZzZXQgdmFsdWVzIHRoYXQgZXhpc3QgaW4gdGhlIG9yaWdpbmFsIGtleWZyYW1lcyBtdXN0IGJlIFwid2FycGVkXCJcbiAgICAgICAgc28gdGhhdCB0aGV5IGNhbiB0YWtlIHRoZSBuZXcga2V5ZnJhbWUgKyBkZWxheSBpbnRvIGFjY291bnQuXG5cbiAgICAgICAgZGVsYXk9MTAwMCwgZHVyYXRpb249MTAwMCwga2V5ZnJhbWVzID0gMCAuNSAxXG5cbiAgICAgICAgdHVybnMgaW50b1xuXG4gICAgICAgIGRlbGF5PTAsIGR1cmF0aW9uPTIwMDAsIGtleWZyYW1lcyA9IDAgLjMzIC42NiAxXG4gICAgICAgKi9cblxuICAgICAgLy8gb2Zmc2V0cyBiZXR3ZWVuIDEgLi4uIG4gLTEgYXJlIGFsbCB3YXJwZWQgYnkgdGhlIGtleWZyYW1lIHN0cmV0Y2hcbiAgICAgIGNvbnN0IGxpbWl0ID0ga2V5ZnJhbWVzLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBsaW1pdDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzW2ldLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IG9sZE9mZnNldCA9IGtmWydvZmZzZXQnXSBhcyBudW1iZXI7XG4gICAgICAgIGNvbnN0IHRpbWVBdEtleWZyYW1lID0gZGVsYXkgKyBvbGRPZmZzZXQgKiBkdXJhdGlvbjtcbiAgICAgICAga2ZbJ29mZnNldCddID0gcm91bmRPZmZzZXQodGltZUF0S2V5ZnJhbWUgLyB0b3RhbFRpbWUpO1xuICAgICAgICBuZXdLZXlmcmFtZXMucHVzaChrZik7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBuZXcgc3RhcnRpbmcga2V5ZnJhbWUgc2hvdWxkIGJlIGFkZGVkIGF0IHRoZSBzdGFydFxuICAgICAgZHVyYXRpb24gPSB0b3RhbFRpbWU7XG4gICAgICBkZWxheSA9IDA7XG4gICAgICBlYXNpbmcgPSAnJztcblxuICAgICAga2V5ZnJhbWVzID0gbmV3S2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGtleWZyYW1lcywgdGhpcy5wcmVTdHlsZVByb3BzLCB0aGlzLnBvc3RTdHlsZVByb3BzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZyxcbiAgICAgICAgdHJ1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm91bmRPZmZzZXQob2Zmc2V0OiBudW1iZXIsIGRlY2ltYWxQb2ludHMgPSAzKTogbnVtYmVyIHtcbiAgY29uc3QgbXVsdCA9IE1hdGgucG93KDEwLCBkZWNpbWFsUG9pbnRzIC0gMSk7XG4gIHJldHVybiBNYXRoLnJvdW5kKG9mZnNldCAqIG11bHQpIC8gbXVsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlblN0eWxlcyhpbnB1dDogKMm1U3R5bGVEYXRhfHN0cmluZylbXSwgYWxsU3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIGxldCBhbGxQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcbiAgaW5wdXQuZm9yRWFjaCh0b2tlbiA9PiB7XG4gICAgaWYgKHRva2VuID09PSAnKicpIHtcbiAgICAgIGFsbFByb3BlcnRpZXMgPSBhbGxQcm9wZXJ0aWVzIHx8IE9iamVjdC5rZXlzKGFsbFN0eWxlcyk7XG4gICAgICBhbGxQcm9wZXJ0aWVzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIHN0eWxlc1twcm9wXSA9IEFVVE9fU1RZTEU7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29weVN0eWxlcyh0b2tlbiBhcyDJtVN0eWxlRGF0YSwgZmFsc2UsIHN0eWxlcyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN0eWxlcztcbn1cbiJdfQ==