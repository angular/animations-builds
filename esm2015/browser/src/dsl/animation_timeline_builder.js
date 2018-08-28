/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
 * time the AST comes across a `group()`, `keyframes()` or a combination of the two wihtin a
 * `sequence()` then it will generate a sub timeline for each step as well as a new one after
 * they are complete.
 *
 * As the AST is traversed, the timing state on each of the timelines will be incremented. If a sub
 * timeline was created (based on one of the cases above) then the parent timeline will attempt to
 * merge the styles used within the sub timelines into itself (only with group() this will happen).
 * This happens with a merge operation (much like how the merge works in mergesort) and it will only
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
 * styles are objects that prototypically inhert from the backFill object, this means that if a
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
        if (timelines.length && Object.keys(finalStyles).length) {
            const tl = timelines[timelines.length - 1];
            if (!tl.allowOnlyTimelineStyles()) {
                tl.setStyles([finalStyles], null, context.errors, options);
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
        const elementInstructions = context.subInstructions.consume(context.element);
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
        if (delay && (context.previousNode.type === 6 /* Style */ ||
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
    get params() { return this.options.params; }
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
                Object.keys(oldParams).forEach(name => { params[name] = oldParams[name]; });
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
        if (selector.length > 0) { // if :self is only used then the selector is empty
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
    getCurrentStyleProperties() { return Object.keys(this._currentKeyframe); }
    get currentTime() { return this.startTime + this.duration; }
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
    allowOnlyTimelineStyles() { return this._currentEmptyStepKeyframe !== this._currentKeyframe; }
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
    getFinalKeyframe() { return this._keyframes.get(this.duration); }
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
        this.element = element;
        this.keyframes = keyframes;
        this.preStyleProps = preStyleProps;
        this.postStyleProps = postStyleProps;
        this._stretchStartingKeyframe = _stretchStartingKeyframe;
        this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
    }
    containsAnimation() { return this.keyframes.length > 1; }
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
              means nothing animates during that delay, but the styles are still renderered. For this
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
            allProperties.forEach(prop => { styles[prop] = AUTO_STYLE; });
        }
        else {
            copyStyles(token, false, styles);
        }
    });
    return styles;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUF1RyxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFHekwsT0FBTyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHakksT0FBTyxFQUErQix5QkFBeUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3pHLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRWhFLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUZHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUNuQyxNQUF1QixFQUFFLFdBQWdCLEVBQUUsR0FBK0IsRUFDMUUsY0FBc0IsRUFBRSxjQUFzQixFQUFFLGlCQUE2QixFQUFFLEVBQy9FLGNBQTBCLEVBQUUsRUFB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Q3BCLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUNqQixhQUFhLEdBQUcsYUFBYSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvRDthQUFNO1lBQ0wsVUFBVSxDQUFDLEtBQW1CLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRlQ2hpbGRPcHRpb25zLCBBbmltYXRlVGltaW5ncywgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25RdWVyeU9wdGlvbnMsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtjb3B5T2JqLCBjb3B5U3R5bGVzLCBpbnRlcnBvbGF0ZVBhcmFtcywgaXRlcmF0b3JUb0FycmF5LCByZXNvbHZlVGltaW5nLCByZXNvbHZlVGltaW5nVmFsdWUsIHZpc2l0RHNsTm9kZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0ZUFzdCwgQW5pbWF0ZUNoaWxkQXN0LCBBbmltYXRlUmVmQXN0LCBBc3QsIEFzdFZpc2l0b3IsIER5bmFtaWNUaW1pbmdBc3QsIEdyb3VwQXN0LCBLZXlmcmFtZXNBc3QsIFF1ZXJ5QXN0LCBSZWZlcmVuY2VBc3QsIFNlcXVlbmNlQXN0LCBTdGFnZ2VyQXN0LCBTdGF0ZUFzdCwgU3R5bGVBc3QsIFRpbWluZ0FzdCwgVHJhbnNpdGlvbkFzdCwgVHJpZ2dlckFzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwgY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4vZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuXG5jb25zdCBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTID0gMTtcbmNvbnN0IEVOVEVSX1RPS0VOID0gJzplbnRlcic7XG5jb25zdCBFTlRFUl9UT0tFTl9SRUdFWCA9IG5ldyBSZWdFeHAoRU5URVJfVE9LRU4sICdnJyk7XG5jb25zdCBMRUFWRV9UT0tFTiA9ICc6bGVhdmUnO1xuY29uc3QgTEVBVkVfVE9LRU5fUkVHRVggPSBuZXcgUmVnRXhwKExFQVZFX1RPS0VOLCAnZycpO1xuXG4vKlxuICogVGhlIGNvZGUgd2l0aGluIHRoaXMgZmlsZSBhaW1zIHRvIGdlbmVyYXRlIHdlYi1hbmltYXRpb25zLWNvbXBhdGlibGUga2V5ZnJhbWVzIGZyb20gQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGNvZGUuXG4gKlxuICogVGhlIGNvZGUgYmVsb3cgd2lsbCBiZSBjb252ZXJ0ZWQgZnJvbTpcbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBUbzpcbiAqIGBgYFxuICoga2V5ZnJhbWVzID0gW3sgb3BhY2l0eTogMCwgb2Zmc2V0OiAwIH0sIHsgb3BhY2l0eTogMSwgb2Zmc2V0OiAxIH1dXG4gKiBkdXJhdGlvbiA9IDEwMDBcbiAqIGRlbGF5ID0gMFxuICogZWFzaW5nID0gJydcbiAqIGBgYFxuICpcbiAqIEZvciB0aGlzIG9wZXJhdGlvbiB0byBjb3ZlciB0aGUgY29tYmluYXRpb24gb2YgYW5pbWF0aW9uIHZlcmJzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYVxuICogY29tYmluYXRpb24gb2YgcHJvdG90eXBpY2FsIGluaGVyaXRhbmNlLCBBU1QgdHJhdmVyc2FsIGFuZCBtZXJnZS1zb3J0LWxpa2UgYWxnb3JpdGhtcyBhcmUgdXNlZC5cbiAqXG4gKiBbQVNUIFRyYXZlcnNhbF1cbiAqIEVhY2ggb2YgdGhlIGFuaW1hdGlvbiB2ZXJicywgd2hlbiBleGVjdXRlZCwgd2lsbCByZXR1cm4gYW4gc3RyaW5nLW1hcCBvYmplY3QgcmVwcmVzZW50aW5nIHdoYXRcbiAqIHR5cGUgb2YgYWN0aW9uIGl0IGlzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYW5kIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBpdC4gVGhpcyBtZWFuc1xuICogdGhhdCB3aGVuIGZ1bmN0aW9uYWwgY29tcG9zaXRpb24gbWl4IG9mIHRoZXNlIGZ1bmN0aW9ucyBpcyBldmFsdWF0ZWQgKGxpa2UgaW4gdGhlIGV4YW1wbGUgYWJvdmUpXG4gKiB0aGVuIGl0IHdpbGwgZW5kIHVwIHByb2R1Y2luZyBhIHRyZWUgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIGFuaW1hdGlvbiBpdHNlbGYuXG4gKlxuICogV2hlbiB0aGlzIGFuaW1hdGlvbiBvYmplY3QgdHJlZSBpcyBwcm9jZXNzZWQgYnkgdGhlIHZpc2l0b3IgY29kZSBiZWxvdyBpdCB3aWxsIHZpc2l0IGVhY2ggb2YgdGhlXG4gKiB2ZXJiIHN0YXRlbWVudHMgd2l0aGluIHRoZSB2aXNpdG9yLiBBbmQgZHVyaW5nIGVhY2ggdmlzaXQgaXQgd2lsbCBidWlsZCB0aGUgY29udGV4dCBvZiB0aGVcbiAqIGFuaW1hdGlvbiBrZXlmcmFtZXMgYnkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgYFRpbWVsaW5lQnVpbGRlcmAuXG4gKlxuICogW1RpbWVsaW5lQnVpbGRlcl1cbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIHRoZSBzdHlsZXMgYW5kIGJ1aWxkaW5nIGEgc2VyaWVzIG9mIGtleWZyYW1lIG9iamVjdHMgZm9yIGFcbiAqIHRpbWVsaW5lIGJldHdlZW4gYSBzdGFydCBhbmQgZW5kIHRpbWUuIFRoZSBidWlsZGVyIHN0YXJ0cyBvZmYgd2l0aCBhbiBpbml0aWFsIHRpbWVsaW5lIGFuZCBlYWNoXG4gKiB0aW1lIHRoZSBBU1QgY29tZXMgYWNyb3NzIGEgYGdyb3VwKClgLCBga2V5ZnJhbWVzKClgIG9yIGEgY29tYmluYXRpb24gb2YgdGhlIHR3byB3aWh0aW4gYVxuICogYHNlcXVlbmNlKClgIHRoZW4gaXQgd2lsbCBnZW5lcmF0ZSBhIHN1YiB0aW1lbGluZSBmb3IgZWFjaCBzdGVwIGFzIHdlbGwgYXMgYSBuZXcgb25lIGFmdGVyXG4gKiB0aGV5IGFyZSBjb21wbGV0ZS5cbiAqXG4gKiBBcyB0aGUgQVNUIGlzIHRyYXZlcnNlZCwgdGhlIHRpbWluZyBzdGF0ZSBvbiBlYWNoIG9mIHRoZSB0aW1lbGluZXMgd2lsbCBiZSBpbmNyZW1lbnRlZC4gSWYgYSBzdWJcbiAqIHRpbWVsaW5lIHdhcyBjcmVhdGVkIChiYXNlZCBvbiBvbmUgb2YgdGhlIGNhc2VzIGFib3ZlKSB0aGVuIHRoZSBwYXJlbnQgdGltZWxpbmUgd2lsbCBhdHRlbXB0IHRvXG4gKiBtZXJnZSB0aGUgc3R5bGVzIHVzZWQgd2l0aGluIHRoZSBzdWIgdGltZWxpbmVzIGludG8gaXRzZWxmIChvbmx5IHdpdGggZ3JvdXAoKSB0aGlzIHdpbGwgaGFwcGVuKS5cbiAqIFRoaXMgaGFwcGVucyB3aXRoIGEgbWVyZ2Ugb3BlcmF0aW9uIChtdWNoIGxpa2UgaG93IHRoZSBtZXJnZSB3b3JrcyBpbiBtZXJnZXNvcnQpIGFuZCBpdCB3aWxsIG9ubHlcbiAqIGNvcHkgdGhlIG1vc3QgcmVjZW50bHkgdXNlZCBzdHlsZXMgZnJvbSB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIHRoZSBwYXJlbnQgdGltZWxpbmUuIFRoaXMgZW5zdXJlc1xuICogdGhhdCBpZiB0aGUgc3R5bGVzIGFyZSB1c2VkIGxhdGVyIG9uIGluIGFub3RoZXIgcGhhc2Ugb2YgdGhlIGFuaW1hdGlvbiB0aGVuIHRoZXkgd2lsbCBiZSB0aGUgbW9zdFxuICogdXAtdG8tZGF0ZSB2YWx1ZXMuXG4gKlxuICogW0hvdyBNaXNzaW5nIFN0eWxlcyBBcmUgVXBkYXRlZF1cbiAqIEVhY2ggdGltZWxpbmUgaGFzIGEgYGJhY2tGaWxsYCBwcm9wZXJ0eSB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgZmlsbGluZyBpbiBuZXcgc3R5bGVzIGludG9cbiAqIGFscmVhZHkgcHJvY2Vzc2VkIGtleWZyYW1lcyBpZiBhIG5ldyBzdHlsZSBzaG93cyB1cCBsYXRlciB3aXRoaW4gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAxMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDIwMCB9KSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMzAwIH0pKVxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSkpIC8vIG5vdGljZSBob3cgYGhlaWdodGAgZG9lc24ndCBleGlzdCBhbnl3aGVyZVxuICogZWxzZVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFdoYXQgaXMgaGFwcGVuaW5nIGhlcmUgaXMgdGhhdCB0aGUgYGhlaWdodGAgdmFsdWUgaXMgYWRkZWQgbGF0ZXIgaW4gdGhlIHNlcXVlbmNlLCBidXQgaXMgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMgYW5pbWF0aW9uIHN0ZXBzLiBUaGVyZWZvcmUgd2hlbiBhIGtleWZyYW1lIGlzIGNyZWF0ZWQgaXQgd291bGQgYWxzbyBiZSBtaXNzaW5nXG4gKiBmcm9tIGFsbCBwcmV2aW91cyBrZXlmcmFtZXMgdXAgdW50aWwgd2hlcmUgaXQgaXMgZmlyc3QgdXNlZC4gRm9yIHRoZSB0aW1lbGluZSBrZXlmcmFtZSBnZW5lcmF0aW9uXG4gKiB0byBwcm9wZXJseSBmaWxsIGluIHRoZSBzdHlsZSBpdCB3aWxsIHBsYWNlIHRoZSBwcmV2aW91cyB2YWx1ZSAodGhlIHZhbHVlIGZyb20gdGhlIHBhcmVudFxuICogdGltZWxpbmUpIG9yIGEgZGVmYXVsdCB2YWx1ZSBvZiBgKmAgaW50byB0aGUgYmFja0ZpbGwgb2JqZWN0LiBHaXZlbiB0aGF0IGVhY2ggb2YgdGhlIGtleWZyYW1lXG4gKiBzdHlsZXMgYXJlIG9iamVjdHMgdGhhdCBwcm90b3R5cGljYWxseSBpbmhlcnQgZnJvbSB0aGUgYmFja0ZpbGwgb2JqZWN0LCB0aGlzIG1lYW5zIHRoYXQgaWYgYVxuICogdmFsdWUgaXMgYWRkZWQgaW50byB0aGUgYmFja0ZpbGwgdGhlbiBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgcHJvcGFnYXRlIGFueSBtaXNzaW5nIHZhbHVlcyB0byBhbGxcbiAqIGtleWZyYW1lcy4gVGhlcmVmb3JlIHRoZSBtaXNzaW5nIGBoZWlnaHRgIHZhbHVlIHdpbGwgYmUgcHJvcGVybHkgZmlsbGVkIGludG8gdGhlIGFscmVhZHlcbiAqIHByb2Nlc3NlZCBrZXlmcmFtZXMuXG4gKlxuICogV2hlbiBhIHN1Yi10aW1lbGluZSBpcyBjcmVhdGVkIGl0IHdpbGwgaGF2ZSBpdHMgb3duIGJhY2tGaWxsIHByb3BlcnR5LiBUaGlzIGlzIGRvbmUgc28gdGhhdFxuICogc3R5bGVzIHByZXNlbnQgd2l0aGluIHRoZSBzdWItdGltZWxpbmUgZG8gbm90IGFjY2lkZW50YWxseSBzZWVwIGludG8gdGhlIHByZXZpb3VzL2Z1dHVyZSB0aW1lbGluZVxuICoga2V5ZnJhbWVzXG4gKlxuICogKEZvciBwcm90b3R5cGljYWxseS1pbmhlcml0ZWQgY29udGVudHMgdG8gYmUgZGV0ZWN0ZWQgYSBgZm9yKGkgaW4gb2JqKWAgbG9vcCBtdXN0IGJlIHVzZWQuKVxuICpcbiAqIFtWYWxpZGF0aW9uXVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIG5vdCByZXNwb25zaWJsZSBmb3IgdmFsaWRhdGlvbi4gVGhhdCBmdW5jdGlvbmFsaXR5IGhhcHBlbnMgd2l0aCB3aXRoaW5cbiAqIHRoZSBgQW5pbWF0aW9uVmFsaWRhdG9yVmlzaXRvcmAgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCByb290RWxlbWVudDogYW55LCBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgIHN1Ykluc3RydWN0aW9ucz86IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgZXJyb3JzOiBhbnlbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgcmV0dXJuIG5ldyBBbmltYXRpb25UaW1lbGluZUJ1aWxkZXJWaXNpdG9yKCkuYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBhc3QsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgc3RhcnRpbmdTdHlsZXMsIGZpbmFsU3R5bGVzLFxuICAgICAgb3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zLCBlcnJvcnMpO1xufVxuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICBidWlsZEtleWZyYW1lcyhcbiAgICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCByb290RWxlbWVudDogYW55LCBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgICAgZW50ZXJDbGFzc05hbWU6IHN0cmluZywgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgc3RhcnRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhLFxuICAgICAgZmluYWxTdHlsZXM6IMm1U3R5bGVEYXRhLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLCBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsXG4gICAgICBlcnJvcnM6IGFueVtdID0gW10pOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10ge1xuICAgIHN1Ykluc3RydWN0aW9ucyA9IHN1Ykluc3RydWN0aW9ucyB8fCBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICAgIGRyaXZlciwgcm9vdEVsZW1lbnQsIHN1Ykluc3RydWN0aW9ucywgZW50ZXJDbGFzc05hbWUsIGxlYXZlQ2xhc3NOYW1lLCBlcnJvcnMsIFtdKTtcbiAgICBjb250ZXh0Lm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNldFN0eWxlcyhbc3RhcnRpbmdTdHlsZXNdLCBudWxsLCBjb250ZXh0LmVycm9ycywgb3B0aW9ucyk7XG5cbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LCBjb250ZXh0KTtcblxuICAgIC8vIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiBhbiBhY3R1YWwgYW5pbWF0aW9uIGhhcHBlbmVkXG4gICAgY29uc3QgdGltZWxpbmVzID0gY29udGV4dC50aW1lbGluZXMuZmlsdGVyKHRpbWVsaW5lID0+IHRpbWVsaW5lLmNvbnRhaW5zQW5pbWF0aW9uKCkpO1xuICAgIGlmICh0aW1lbGluZXMubGVuZ3RoICYmIE9iamVjdC5rZXlzKGZpbmFsU3R5bGVzKS5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRsID0gdGltZWxpbmVzW3RpbWVsaW5lcy5sZW5ndGggLSAxXTtcbiAgICAgIGlmICghdGwuYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSkge1xuICAgICAgICB0bC5zZXRTdHlsZXMoW2ZpbmFsU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aW1lbGluZXMubGVuZ3RoID8gdGltZWxpbmVzLm1hcCh0aW1lbGluZSA9PiB0aW1lbGluZS5idWlsZEtleWZyYW1lcygpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihyb290RWxlbWVudCwgW10sIFtdLCBbXSwgMCwgMCwgJycsIGZhbHNlKV07XG4gIH1cblxuICB2aXNpdFRyaWdnZXIoYXN0OiBUcmlnZ2VyQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIC8vIHRoZXNlIHZhbHVlcyBhcmUgbm90IHZpc2l0ZWQgaW4gdGhpcyBBU1RcbiAgfVxuXG4gIHZpc2l0U3RhdGUoYXN0OiBTdGF0ZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFRyYW5zaXRpb24oYXN0OiBUcmFuc2l0aW9uQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIC8vIHRoZXNlIHZhbHVlcyBhcmUgbm90IHZpc2l0ZWQgaW4gdGhpcyBBU1RcbiAgfVxuXG4gIHZpc2l0QW5pbWF0ZUNoaWxkKGFzdDogQW5pbWF0ZUNoaWxkQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGVsZW1lbnRJbnN0cnVjdGlvbnMgPSBjb250ZXh0LnN1Ykluc3RydWN0aW9ucy5jb25zdW1lKGNvbnRleHQuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLl92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgICAgICBlbGVtZW50SW5zdHJ1Y3Rpb25zLCBpbm5lckNvbnRleHQsIGlubmVyQ29udGV4dC5vcHRpb25zIGFzIEFuaW1hdGVDaGlsZE9wdGlvbnMpO1xuICAgICAgaWYgKHN0YXJ0VGltZSAhPSBlbmRUaW1lKSB7XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgb24gdGhlIHVwcGVyIGNvbnRleHQgYmVjYXVzZSB3ZSBjcmVhdGVkIGEgc3ViIGNvbnRleHQgZm9yXG4gICAgICAgIC8vIHRoZSBzdWIgY2hpbGQgYW5pbWF0aW9uc1xuICAgICAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShlbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEFuaW1hdGVSZWYoYXN0OiBBbmltYXRlUmVmQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgaW5uZXJDb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgIHRoaXMudmlzaXRSZWZlcmVuY2UoYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0U3ViSW5zdHJ1Y3Rpb25zKFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCxcbiAgICAgIG9wdGlvbnM6IEFuaW1hdGVDaGlsZE9wdGlvbnMpOiBudW1iZXIge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGxldCBmdXJ0aGVzdFRpbWUgPSBzdGFydFRpbWU7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbC1jYXNlIGZvciB3aGVuIGEgdXNlciB3YW50cyB0byBza2lwIGEgc3ViXG4gICAgLy8gYW5pbWF0aW9uIGZyb20gYmVpbmcgZmlyZWQgZW50aXJlbHkuXG4gICAgY29uc3QgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uICE9IG51bGwgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kdXJhdGlvbikgOiBudWxsO1xuICAgIGNvbnN0IGRlbGF5ID0gb3B0aW9ucy5kZWxheSAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogbnVsbDtcbiAgICBpZiAoZHVyYXRpb24gIT09IDApIHtcbiAgICAgIGluc3RydWN0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25UaW1pbmdzID1cbiAgICAgICAgICAgIGNvbnRleHQuYXBwZW5kSW5zdHJ1Y3Rpb25Ub1RpbWVsaW5lKGluc3RydWN0aW9uLCBkdXJhdGlvbiwgZGVsYXkpO1xuICAgICAgICBmdXJ0aGVzdFRpbWUgPVxuICAgICAgICAgICAgTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbnN0cnVjdGlvblRpbWluZ3MuZHVyYXRpb24gKyBpbnN0cnVjdGlvblRpbWluZ3MuZGVsYXkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1cnRoZXN0VGltZTtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb250ZXh0LnVwZGF0ZU9wdGlvbnMoYXN0Lm9wdGlvbnMsIHRydWUpO1xuICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBhc3QuYW5pbWF0aW9uLCBjb250ZXh0KTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U2VxdWVuY2UoYXN0OiBTZXF1ZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3Qgc3ViQ29udGV4dENvdW50ID0gY29udGV4dC5zdWJDb250ZXh0Q291bnQ7XG4gICAgbGV0IGN0eCA9IGNvbnRleHQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGFzdC5vcHRpb25zO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMucGFyYW1zIHx8IG9wdGlvbnMuZGVsYXkpKSB7XG4gICAgICBjdHggPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQob3B0aW9ucyk7XG4gICAgICBjdHgudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKCk7XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGN0eC5wcmV2aW91c05vZGUudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUpIHtcbiAgICAgICAgICBjdHguY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgICAgIGN0eC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpO1xuICAgICAgICBjdHguZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFzdC5zdGVwcy5sZW5ndGgpIHtcbiAgICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4gdmlzaXREc2xOb2RlKHRoaXMsIHMsIGN0eCkpO1xuXG4gICAgICAvLyB0aGlzIGlzIGhlcmUganVzdCBpbmNhc2UgdGhlIGlubmVyIHN0ZXBzIG9ubHkgY29udGFpbiBvciBlbmQgd2l0aCBhIHN0eWxlKCkgY2FsbFxuICAgICAgY3R4LmN1cnJlbnRUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHNvbWUgYW5pbWF0aW9uIGZ1bmN0aW9uIHdpdGhpbiB0aGUgc2VxdWVuY2VcbiAgICAgIC8vIGVuZGVkIHVwIGNyZWF0aW5nIGEgc3ViIHRpbWVsaW5lICh3aGljaCBtZWFucyB0aGUgY3VycmVudFxuICAgICAgLy8gdGltZWxpbmUgY2Fubm90IG92ZXJsYXAgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHNlcXVlbmNlKVxuICAgICAgaWYgKGN0eC5zdWJDb250ZXh0Q291bnQgPiBzdWJDb250ZXh0Q291bnQpIHtcbiAgICAgICAgY3R4LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRHcm91cChhc3Q6IEdyb3VwQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBpbm5lclRpbWVsaW5lczogVGltZWxpbmVCdWlsZGVyW10gPSBbXTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgY29uc3QgZGVsYXkgPSBhc3Qub3B0aW9ucyAmJiBhc3Qub3B0aW9ucy5kZWxheSA/IHJlc29sdmVUaW1pbmdWYWx1ZShhc3Qub3B0aW9ucy5kZWxheSkgOiAwO1xuXG4gICAgYXN0LnN0ZXBzLmZvckVhY2gocyA9PiB7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIGlubmVyQ29udGV4dC5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICAgIH1cblxuICAgICAgdmlzaXREc2xOb2RlKHRoaXMsIHMsIGlubmVyQ29udGV4dCk7XG4gICAgICBmdXJ0aGVzdFRpbWUgPSBNYXRoLm1heChmdXJ0aGVzdFRpbWUsIGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWUpO1xuICAgICAgaW5uZXJUaW1lbGluZXMucHVzaChpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgb3BlcmF0aW9uIGlzIHJ1biBhZnRlciB0aGUgQVNUIGxvb3AgYmVjYXVzZSBvdGhlcndpc2VcbiAgICAvLyBpZiB0aGUgcGFyZW50IHRpbWVsaW5lJ3MgY29sbGVjdGVkIHN0eWxlcyB3ZXJlIHVwZGF0ZWQgdGhlblxuICAgIC8vIGl0IHdvdWxkIHBhc3MgaW4gaW52YWxpZCBkYXRhIGludG8gdGhlIG5ldy10by1iZSBmb3JrZWQgaXRlbXNcbiAgICBpbm5lclRpbWVsaW5lcy5mb3JFYWNoKFxuICAgICAgICB0aW1lbGluZSA9PiBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lKSk7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZnVydGhlc3RUaW1lKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0VGltaW5nKGFzdDogVGltaW5nQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBBbmltYXRlVGltaW5ncyB7XG4gICAgaWYgKChhc3QgYXMgRHluYW1pY1RpbWluZ0FzdCkuZHluYW1pYykge1xuICAgICAgY29uc3Qgc3RyVmFsdWUgPSAoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLnN0clZhbHVlO1xuICAgICAgY29uc3QgdGltaW5nVmFsdWUgPVxuICAgICAgICAgIGNvbnRleHQucGFyYW1zID8gaW50ZXJwb2xhdGVQYXJhbXMoc3RyVmFsdWUsIGNvbnRleHQucGFyYW1zLCBjb250ZXh0LmVycm9ycykgOiBzdHJWYWx1ZTtcbiAgICAgIHJldHVybiByZXNvbHZlVGltaW5nKHRpbWluZ1ZhbHVlLCBjb250ZXh0LmVycm9ycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZHVyYXRpb246IGFzdC5kdXJhdGlvbiwgZGVsYXk6IGFzdC5kZWxheSwgZWFzaW5nOiBhc3QuZWFzaW5nfTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEFuaW1hdGUoYXN0OiBBbmltYXRlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1pbmdzID0gY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSB0aGlzLl92aXNpdFRpbWluZyhhc3QudGltaW5ncywgY29udGV4dCk7XG4gICAgY29uc3QgdGltZWxpbmUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBpZiAodGltaW5ncy5kZWxheSkge1xuICAgICAgY29udGV4dC5pbmNyZW1lbnRUaW1lKHRpbWluZ3MuZGVsYXkpO1xuICAgICAgdGltZWxpbmUuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGUgPSBhc3Quc3R5bGU7XG4gICAgaWYgKHN0eWxlLnR5cGUgPT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcykge1xuICAgICAgdGhpcy52aXNpdEtleWZyYW1lcyhzdHlsZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmR1cmF0aW9uKTtcbiAgICAgIHRoaXMudmlzaXRTdHlsZShzdHlsZSBhcyBTdHlsZUFzdCwgY29udGV4dCk7XG4gICAgICB0aW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IG51bGw7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFN0eWxlKGFzdDogU3R5bGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzICE7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB3aGVuIGEgc3R5bGUoKSBjYWxsXG4gICAgLy8gZGlyZWN0bHkgZm9sbG93cyAgYW4gYW5pbWF0ZSgpIGNhbGwgKGJ1dCBub3QgaW5zaWRlIG9mIGFuIGFuaW1hdGUoKSBjYWxsKVxuICAgIGlmICghdGltaW5ncyAmJiB0aW1lbGluZS5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoKSB7XG4gICAgICB0aW1lbGluZS5mb3J3YXJkRnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmcgPSAodGltaW5ncyAmJiB0aW1pbmdzLmVhc2luZykgfHwgYXN0LmVhc2luZztcbiAgICBpZiAoYXN0LmlzRW1wdHlTdGVwKSB7XG4gICAgICB0aW1lbGluZS5hcHBseUVtcHR5U3RlcChlYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lbGluZS5zZXRTdHlsZXMoYXN0LnN0eWxlcywgZWFzaW5nLCBjb250ZXh0LmVycm9ycywgY29udGV4dC5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZnJhbWVzKGFzdDogS2V5ZnJhbWVzQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyAhO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IChjb250ZXh0LmN1cnJlbnRUaW1lbGluZSAhKS5kdXJhdGlvbjtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGN1cnJlbnRBbmltYXRlVGltaW5ncy5kdXJhdGlvbjtcbiAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoKTtcbiAgICBjb25zdCBpbm5lclRpbWVsaW5lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBpbm5lclRpbWVsaW5lLmVhc2luZyA9IGN1cnJlbnRBbmltYXRlVGltaW5ncy5lYXNpbmc7XG5cbiAgICBhc3Quc3R5bGVzLmZvckVhY2goc3RlcCA9PiB7XG4gICAgICBjb25zdCBvZmZzZXQ6IG51bWJlciA9IHN0ZXAub2Zmc2V0IHx8IDA7XG4gICAgICBpbm5lclRpbWVsaW5lLmZvcndhcmRUaW1lKG9mZnNldCAqIGR1cmF0aW9uKTtcbiAgICAgIGlubmVyVGltZWxpbmUuc2V0U3R5bGVzKHN0ZXAuc3R5bGVzLCBzdGVwLmVhc2luZywgY29udGV4dC5lcnJvcnMsIGNvbnRleHQub3B0aW9ucyk7XG4gICAgICBpbm5lclRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBwYXJlbnQgdGltZWxpbmUgZ2V0cyBhbGwgdGhlIHN0eWxlcyBmcm9tXG4gICAgLy8gdGhlIGNoaWxkIGV2ZW4gaWYgdGhlIG5ldyB0aW1lbGluZSBiZWxvdyBpcyBub3QgdXNlZFxuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXMoaW5uZXJUaW1lbGluZSk7XG5cbiAgICAvLyB3ZSBkbyB0aGlzIGJlY2F1c2UgdGhlIHdpbmRvdyBiZXR3ZWVuIHRoaXMgdGltZWxpbmUgYW5kIHRoZSBzdWIgdGltZWxpbmVcbiAgICAvLyBzaG91bGQgZW5zdXJlIHRoYXQgdGhlIHN0eWxlcyB3aXRoaW4gYXJlIGV4YWN0bHkgdGhlIHNhbWUgYXMgdGhleSB3ZXJlIGJlZm9yZVxuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKHN0YXJ0VGltZSArIGR1cmF0aW9uKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0UXVlcnkoYXN0OiBRdWVyeUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGZpcnN0IHN0ZXAgYmVmb3JlIHRoaXMgaXMgYSBzdHlsZSBzdGVwIHdlIG5lZWRcbiAgICAvLyB0byBlbnN1cmUgdGhlIHN0eWxlcyBhcmUgYXBwbGllZCBiZWZvcmUgdGhlIGNoaWxkcmVuIGFyZSBhbmltYXRlZFxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IG9wdGlvbnMgPSAoYXN0Lm9wdGlvbnMgfHwge30pIGFzIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucztcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSkgOiAwO1xuXG4gICAgaWYgKGRlbGF5ICYmIChjb250ZXh0LnByZXZpb3VzTm9kZS50eXBlID09PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUgfHxcbiAgICAgICAgICAgICAgICAgIChzdGFydFRpbWUgPT0gMCAmJiBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoKSkpIHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB9XG5cbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuICAgIGNvbnN0IGVsbXMgPSBjb250ZXh0Lmludm9rZVF1ZXJ5KFxuICAgICAgICBhc3Quc2VsZWN0b3IsIGFzdC5vcmlnaW5hbFNlbGVjdG9yLCBhc3QubGltaXQsIGFzdC5pbmNsdWRlU2VsZixcbiAgICAgICAgb3B0aW9ucy5vcHRpb25hbCA/IHRydWUgOiBmYWxzZSwgY29udGV4dC5lcnJvcnMpO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IGVsbXMubGVuZ3RoO1xuICAgIGxldCBzYW1lRWxlbWVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXJ8bnVsbCA9IG51bGw7XG4gICAgZWxtcy5mb3JFYWNoKChlbGVtZW50LCBpKSA9PiB7XG5cbiAgICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSBpO1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zLCBlbGVtZW50KTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbGVtZW50ID09PSBjb250ZXh0LmVsZW1lbnQpIHtcbiAgICAgICAgc2FtZUVsZW1lbnRUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBhc3QuYW5pbWF0aW9uLCBpbm5lckNvbnRleHQpO1xuXG4gICAgICAvLyB0aGlzIGlzIGhlcmUganVzdCBpbmNhc2UgdGhlIGlubmVyIHN0ZXBzIG9ubHkgY29udGFpbiBvciBlbmRcbiAgICAgIC8vIHdpdGggYSBzdHlsZSgpIGNhbGwgKHdoaWNoIGlzIGhlcmUgdG8gc2lnbmFsIHRoYXQgdGhpcyBpcyBhIHByZXBhcmF0b3J5XG4gICAgICAvLyBjYWxsIHRvIHN0eWxlIGFuIGVsZW1lbnQgYmVmb3JlIGl0IGlzIGFuaW1hdGVkIGFnYWluKVxuICAgICAgaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcblxuICAgICAgY29uc3QgZW5kVGltZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgICBmdXJ0aGVzdFRpbWUgPSBNYXRoLm1heChmdXJ0aGVzdFRpbWUsIGVuZFRpbWUpO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IDA7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IDA7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZnVydGhlc3RUaW1lKTtcblxuICAgIGlmIChzYW1lRWxlbWVudFRpbWVsaW5lKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHNhbWVFbGVtZW50VGltZWxpbmUpO1xuICAgICAgY29udGV4dC5jdXJyZW50VGltZWxpbmUuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFN0YWdnZXIoYXN0OiBTdGFnZ2VyQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBwYXJlbnRDb250ZXh0ID0gY29udGV4dC5wYXJlbnRDb250ZXh0ICE7XG4gICAgY29uc3QgdGwgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBjb25zdCB0aW1pbmdzID0gYXN0LnRpbWluZ3M7XG4gICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLmFicyh0aW1pbmdzLmR1cmF0aW9uKTtcbiAgICBjb25zdCBtYXhUaW1lID0gZHVyYXRpb24gKiAoY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCAtIDEpO1xuICAgIGxldCBkZWxheSA9IGR1cmF0aW9uICogY29udGV4dC5jdXJyZW50UXVlcnlJbmRleDtcblxuICAgIGxldCBzdGFnZ2VyVHJhbnNmb3JtZXIgPSB0aW1pbmdzLmR1cmF0aW9uIDwgMCA/ICdyZXZlcnNlJyA6IHRpbWluZ3MuZWFzaW5nO1xuICAgIHN3aXRjaCAoc3RhZ2dlclRyYW5zZm9ybWVyKSB7XG4gICAgICBjYXNlICdyZXZlcnNlJzpcbiAgICAgICAgZGVsYXkgPSBtYXhUaW1lIC0gZGVsYXk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVsbCc6XG4gICAgICAgIGRlbGF5ID0gcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICB0aW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydGluZ1RpbWUgPSB0aW1lbGluZS5jdXJyZW50VGltZTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG5cbiAgICAvLyB0aW1lID0gZHVyYXRpb24gKyBkZWxheVxuICAgIC8vIHRoZSByZWFzb24gd2h5IHRoaXMgY29tcHV0YXRpb24gaXMgc28gY29tcGxleCBpcyBiZWNhdXNlXG4gICAgLy8gdGhlIGlubmVyIHRpbWVsaW5lIG1heSBlaXRoZXIgaGF2ZSBhIGRlbGF5IHZhbHVlIG9yIGEgc3RyZXRjaGVkXG4gICAgLy8ga2V5ZnJhbWUgZGVwZW5kaW5nIG9uIGlmIGEgc3VidGltZWxpbmUgaXMgbm90IHVzZWQgb3IgaXMgdXNlZC5cbiAgICBwYXJlbnRDb250ZXh0LmN1cnJlbnRTdGFnZ2VyVGltZSA9XG4gICAgICAgICh0bC5jdXJyZW50VGltZSAtIHN0YXJ0aW5nVGltZSkgKyAodGwuc3RhcnRUaW1lIC0gcGFyZW50Q29udGV4dC5jdXJyZW50VGltZWxpbmUuc3RhcnRUaW1lKTtcbiAgfVxufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIFN0eWxlQXRUaW1lID0ge1xuICB0aW1lOiBudW1iZXI7IHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XG59O1xuXG5jb25zdCBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERSA9IDxBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPj57fTtcbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICBwdWJsaWMgcGFyZW50Q29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0fG51bGwgPSBudWxsO1xuICBwdWJsaWMgY3VycmVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXI7XG4gIHB1YmxpYyBjdXJyZW50QW5pbWF0ZVRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzfG51bGwgPSBudWxsO1xuICBwdWJsaWMgcHJldmlvdXNOb2RlOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICBwdWJsaWMgc3ViQ29udGV4dENvdW50ID0gMDtcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgcHVibGljIGN1cnJlbnRRdWVyeUluZGV4OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFF1ZXJ5VG90YWw6IG51bWJlciA9IDA7XG4gIHB1YmxpYyBjdXJyZW50U3RhZ2dlclRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSxcbiAgICAgIHB1YmxpYyBzdWJJbnN0cnVjdGlvbnM6IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgcHJpdmF0ZSBfZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgX2xlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHB1YmxpYyBlcnJvcnM6IGFueVtdLCBwdWJsaWMgdGltZWxpbmVzOiBUaW1lbGluZUJ1aWxkZXJbXSxcbiAgICAgIGluaXRpYWxUaW1lbGluZT86IFRpbWVsaW5lQnVpbGRlcikge1xuICAgIHRoaXMuY3VycmVudFRpbWVsaW5lID0gaW5pdGlhbFRpbWVsaW5lIHx8IG5ldyBUaW1lbGluZUJ1aWxkZXIodGhpcy5fZHJpdmVyLCBlbGVtZW50LCAwKTtcbiAgICB0aW1lbGluZXMucHVzaCh0aGlzLmN1cnJlbnRUaW1lbGluZSk7XG4gIH1cblxuICBnZXQgcGFyYW1zKCkgeyByZXR1cm4gdGhpcy5vcHRpb25zLnBhcmFtczsgfVxuXG4gIHVwZGF0ZU9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsLCBza2lwSWZFeGlzdHM/OiBib29sZWFuKSB7XG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBhbnk7XG4gICAgbGV0IG9wdGlvbnNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIE5PVEU6IHRoaXMgd2lsbCBnZXQgcGF0Y2hlZCB1cCB3aGVuIG90aGVyIGFuaW1hdGlvbiBtZXRob2RzIHN1cHBvcnQgZHVyYXRpb24gb3ZlcnJpZGVzXG4gICAgaWYgKG5ld09wdGlvbnMuZHVyYXRpb24gIT0gbnVsbCkge1xuICAgICAgKG9wdGlvbnNUb1VwZGF0ZSBhcyBhbnkpLmR1cmF0aW9uID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG5ld09wdGlvbnMuZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChuZXdPcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnNUb1VwZGF0ZS5kZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXdPcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBsZXQgcGFyYW1zVG9VcGRhdGU6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNUb1VwZGF0ZS5wYXJhbXMgITtcbiAgICAgIGlmICghcGFyYW1zVG9VcGRhdGUpIHtcbiAgICAgICAgcGFyYW1zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnMucGFyYW1zID0ge307XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKCFza2lwSWZFeGlzdHMgfHwgIXBhcmFtc1RvVXBkYXRlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgcGFyYW1zVG9VcGRhdGVbbmFtZV0gPSBpbnRlcnBvbGF0ZVBhcmFtcyhuZXdQYXJhbXNbbmFtZV0sIHBhcmFtc1RvVXBkYXRlLCB0aGlzLmVycm9ycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvcHlPcHRpb25zKCkge1xuICAgIGNvbnN0IG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBjb25zdCBvbGRQYXJhbXMgPSB0aGlzLm9wdGlvbnMucGFyYW1zO1xuICAgICAgaWYgKG9sZFBhcmFtcykge1xuICAgICAgICBjb25zdCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNbJ3BhcmFtcyddID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG9sZFBhcmFtcykuZm9yRWFjaChuYW1lID0+IHsgcGFyYW1zW25hbWVdID0gb2xkUGFyYW1zW25hbWVdOyB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICBjcmVhdGVTdWJDb250ZXh0KG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCA9IG51bGwsIGVsZW1lbnQ/OiBhbnksIG5ld1RpbWU/OiBudW1iZXIpOlxuICAgICAgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlbGVtZW50IHx8IHRoaXMuZWxlbWVudDtcbiAgICBjb25zdCBjb250ZXh0ID0gbmV3IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dChcbiAgICAgICAgdGhpcy5fZHJpdmVyLCB0YXJnZXQsIHRoaXMuc3ViSW5zdHJ1Y3Rpb25zLCB0aGlzLl9lbnRlckNsYXNzTmFtZSwgdGhpcy5fbGVhdmVDbGFzc05hbWUsXG4gICAgICAgIHRoaXMuZXJyb3JzLCB0aGlzLnRpbWVsaW5lcywgdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yayh0YXJnZXQsIG5ld1RpbWUgfHwgMCkpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gdGhpcy5wcmV2aW91c05vZGU7XG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSB0aGlzLmN1cnJlbnRBbmltYXRlVGltaW5ncztcblxuICAgIGNvbnRleHQub3B0aW9ucyA9IHRoaXMuX2NvcHlPcHRpb25zKCk7XG4gICAgY29udGV4dC51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IHRoaXMuY3VycmVudFF1ZXJ5SW5kZXg7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IHRoaXMuY3VycmVudFF1ZXJ5VG90YWw7XG4gICAgY29udGV4dC5wYXJlbnRDb250ZXh0ID0gdGhpcztcbiAgICB0aGlzLnN1YkNvbnRleHRDb3VudCsrO1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgdHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKG5ld1RpbWU/OiBudW1iZXIpIHtcbiAgICB0aGlzLnByZXZpb3VzTm9kZSA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICAgIHRoaXMuY3VycmVudFRpbWVsaW5lID0gdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yayh0aGlzLmVsZW1lbnQsIG5ld1RpbWUpO1xuICAgIHRoaXMudGltZWxpbmVzLnB1c2godGhpcy5jdXJyZW50VGltZWxpbmUpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lbGluZTtcbiAgfVxuXG4gIGFwcGVuZEluc3RydWN0aW9uVG9UaW1lbGluZShcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBkdXJhdGlvbjogbnVtYmVyfG51bGwsXG4gICAgICBkZWxheTogbnVtYmVyfG51bGwpOiBBbmltYXRlVGltaW5ncyB7XG4gICAgY29uc3QgdXBkYXRlZFRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzID0ge1xuICAgICAgZHVyYXRpb246IGR1cmF0aW9uICE9IG51bGwgPyBkdXJhdGlvbiA6IGluc3RydWN0aW9uLmR1cmF0aW9uLFxuICAgICAgZGVsYXk6IHRoaXMuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lICsgKGRlbGF5ICE9IG51bGwgPyBkZWxheSA6IDApICsgaW5zdHJ1Y3Rpb24uZGVsYXksXG4gICAgICBlYXNpbmc6ICcnXG4gICAgfTtcbiAgICBjb25zdCBidWlsZGVyID0gbmV3IFN1YlRpbWVsaW5lQnVpbGRlcihcbiAgICAgICAgdGhpcy5fZHJpdmVyLCBpbnN0cnVjdGlvbi5lbGVtZW50LCBpbnN0cnVjdGlvbi5rZXlmcmFtZXMsIGluc3RydWN0aW9uLnByZVN0eWxlUHJvcHMsXG4gICAgICAgIGluc3RydWN0aW9uLnBvc3RTdHlsZVByb3BzLCB1cGRhdGVkVGltaW5ncywgaW5zdHJ1Y3Rpb24uc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUpO1xuICAgIHRoaXMudGltZWxpbmVzLnB1c2goYnVpbGRlcik7XG4gICAgcmV0dXJuIHVwZGF0ZWRUaW1pbmdzO1xuICB9XG5cbiAgaW5jcmVtZW50VGltZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3J3YXJkVGltZSh0aGlzLmN1cnJlbnRUaW1lbGluZS5kdXJhdGlvbiArIHRpbWUpO1xuICB9XG5cbiAgZGVsYXlOZXh0U3RlcChkZWxheTogbnVtYmVyKSB7XG4gICAgLy8gbmVnYXRpdmUgZGVsYXlzIGFyZSBub3QgeWV0IHN1cHBvcnRlZFxuICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWVsaW5lLmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIGludm9rZVF1ZXJ5KFxuICAgICAgc2VsZWN0b3I6IHN0cmluZywgb3JpZ2luYWxTZWxlY3Rvcjogc3RyaW5nLCBsaW1pdDogbnVtYmVyLCBpbmNsdWRlU2VsZjogYm9vbGVhbixcbiAgICAgIG9wdGlvbmFsOiBib29sZWFuLCBlcnJvcnM6IGFueVtdKTogYW55W10ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChpbmNsdWRlU2VsZikge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZWxlbWVudCk7XG4gICAgfVxuICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7ICAvLyBpZiA6c2VsZiBpcyBvbmx5IHVzZWQgdGhlbiB0aGUgc2VsZWN0b3IgaXMgZW1wdHlcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShFTlRFUl9UT0tFTl9SRUdFWCwgJy4nICsgdGhpcy5fZW50ZXJDbGFzc05hbWUpO1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKExFQVZFX1RPS0VOX1JFR0VYLCAnLicgKyB0aGlzLl9sZWF2ZUNsYXNzTmFtZSk7XG4gICAgICBjb25zdCBtdWx0aSA9IGxpbWl0ICE9IDE7XG4gICAgICBsZXQgZWxlbWVudHMgPSB0aGlzLl9kcml2ZXIucXVlcnkodGhpcy5lbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICAgICAgaWYgKGxpbWl0ICE9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRzID0gbGltaXQgPCAwID8gZWxlbWVudHMuc2xpY2UoZWxlbWVudHMubGVuZ3RoICsgbGltaXQsIGVsZW1lbnRzLmxlbmd0aCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMucHVzaCguLi5lbGVtZW50cyk7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25hbCAmJiByZXN1bHRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgXFxgcXVlcnkoXCIke29yaWdpbmFsU2VsZWN0b3J9XCIpXFxgIHJldHVybmVkIHplcm8gZWxlbWVudHMuIChVc2UgXFxgcXVlcnkoXCIke29yaWdpbmFsU2VsZWN0b3J9XCIsIHsgb3B0aW9uYWw6IHRydWUgfSlcXGAgaWYgeW91IHdpc2ggdG8gYWxsb3cgdGhpcy4pYCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFRpbWVsaW5lQnVpbGRlciB7XG4gIHB1YmxpYyBkdXJhdGlvbjogbnVtYmVyID0gMDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBlYXNpbmcgITogc3RyaW5nIHwgbnVsbDtcbiAgcHJpdmF0ZSBfcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfY3VycmVudEtleWZyYW1lOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9rZXlmcmFtZXMgPSBuZXcgTWFwPG51bWJlciwgybVTdHlsZURhdGE+KCk7XG4gIHByaXZhdGUgX3N0eWxlU3VtbWFyeToge1twcm9wOiBzdHJpbmddOiBTdHlsZUF0VGltZX0gPSB7fTtcbiAgcHJpdmF0ZSBfbG9jYWxUaW1lbGluZVN0eWxlczogybVTdHlsZURhdGE7XG4gIHByaXZhdGUgX2dsb2JhbFRpbWVsaW5lU3R5bGVzOiDJtVN0eWxlRGF0YTtcbiAgcHJpdmF0ZSBfcGVuZGluZ1N0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfYmFja0ZpbGw6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZTogybVTdHlsZURhdGF8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIHN0YXJ0VGltZTogbnVtYmVyLFxuICAgICAgcHJpdmF0ZSBfZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwPzogTWFwPGFueSwgybVTdHlsZURhdGE+KSB7XG4gICAgaWYgKCF0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXApIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzID0gT2JqZWN0LmNyZWF0ZSh0aGlzLl9iYWNrRmlsbCwge30pO1xuICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzID0gdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwLmdldChlbGVtZW50KSAhO1xuICAgIGlmICghdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMpIHtcbiAgICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzID0gdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcztcbiAgICAgIHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cC5zZXQoZWxlbWVudCwgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcyk7XG4gICAgfVxuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgY29udGFpbnNBbmltYXRpb24oKTogYm9vbGVhbiB7XG4gICAgc3dpdGNoICh0aGlzLl9rZXlmcmFtZXMuc2l6ZSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRTdHlsZVByb3BlcnRpZXMoKS5sZW5ndGggPiAwO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpOiBzdHJpbmdbXSB7IHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9jdXJyZW50S2V5ZnJhbWUpOyB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkgeyByZXR1cm4gdGhpcy5zdGFydFRpbWUgKyB0aGlzLmR1cmF0aW9uOyB9XG5cbiAgZGVsYXlOZXh0U3RlcChkZWxheTogbnVtYmVyKSB7XG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgYSBzdHlsZSgpIHN0ZXAgaXMgcGxhY2VkIHJpZ2h0IGJlZm9yZSBhIHN0YWdnZXIoKVxuICAgIC8vIGFuZCB0aGF0IHN0eWxlKCkgc3RlcCBpcyB0aGUgdmVyeSBmaXJzdCBzdHlsZSgpIHZhbHVlIGluIHRoZSBhbmltYXRpb25cbiAgICAvLyB0aGVuIHdlIG5lZWQgdG8gbWFrZSBhIGNvcHkgb2YgdGhlIGtleWZyYW1lIFswLCBjb3B5LCAxXSBzbyB0aGF0IHRoZSBkZWxheVxuICAgIC8vIHByb3Blcmx5IGFwcGxpZXMgdGhlIHN0eWxlKCkgdmFsdWVzIHRvIHdvcmsgd2l0aCB0aGUgc3RhZ2dlci4uLlxuICAgIGNvbnN0IGhhc1ByZVN0eWxlU3RlcCA9IHRoaXMuX2tleWZyYW1lcy5zaXplID09IDEgJiYgT2JqZWN0LmtleXModGhpcy5fcGVuZGluZ1N0eWxlcykubGVuZ3RoO1xuXG4gICAgaWYgKHRoaXMuZHVyYXRpb24gfHwgaGFzUHJlU3R5bGVTdGVwKSB7XG4gICAgICB0aGlzLmZvcndhcmRUaW1lKHRoaXMuY3VycmVudFRpbWUgKyBkZWxheSk7XG4gICAgICBpZiAoaGFzUHJlU3R5bGVTdGVwKSB7XG4gICAgICAgIHRoaXMuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lICs9IGRlbGF5O1xuICAgIH1cbiAgfVxuXG4gIGZvcmsoZWxlbWVudDogYW55LCBjdXJyZW50VGltZT86IG51bWJlcik6IFRpbWVsaW5lQnVpbGRlciB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICByZXR1cm4gbmV3IFRpbWVsaW5lQnVpbGRlcihcbiAgICAgICAgdGhpcy5fZHJpdmVyLCBlbGVtZW50LCBjdXJyZW50VGltZSB8fCB0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXApO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZEtleWZyYW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWUgPSB0aGlzLl9jdXJyZW50S2V5ZnJhbWU7XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSA9IHRoaXMuX2tleWZyYW1lcy5nZXQodGhpcy5kdXJhdGlvbikgITtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lID0gT2JqZWN0LmNyZWF0ZSh0aGlzLl9iYWNrRmlsbCwge30pO1xuICAgICAgdGhpcy5fa2V5ZnJhbWVzLnNldCh0aGlzLmR1cmF0aW9uLCB0aGlzLl9jdXJyZW50S2V5ZnJhbWUpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmRGcmFtZSgpIHtcbiAgICB0aGlzLmR1cmF0aW9uICs9IE9ORV9GUkFNRV9JTl9NSUxMSVNFQ09ORFM7XG4gICAgdGhpcy5fbG9hZEtleWZyYW1lKCk7XG4gIH1cblxuICBmb3J3YXJkVGltZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHRoaXMuZHVyYXRpb24gPSB0aW1lO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU3R5bGUocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcikge1xuICAgIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXNbcHJvcF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlc1twcm9wXSA9IHZhbHVlO1xuICAgIHRoaXMuX3N0eWxlU3VtbWFyeVtwcm9wXSA9IHt0aW1lOiB0aGlzLmN1cnJlbnRUaW1lLCB2YWx1ZX07XG4gIH1cblxuICBhbGxvd09ubHlUaW1lbGluZVN0eWxlcygpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZSAhPT0gdGhpcy5fY3VycmVudEtleWZyYW1lOyB9XG5cbiAgYXBwbHlFbXB0eVN0ZXAoZWFzaW5nOiBzdHJpbmd8bnVsbCkge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWVbJ2Vhc2luZyddID0gZWFzaW5nO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYW5pbWF0ZShkdXJhdGlvbik6XG4gICAgLy8gYWxsIG1pc3Npbmcgc3R5bGVzIGFyZSBmaWxsZWQgd2l0aCBhIGAqYCB2YWx1ZSB0aGVuXG4gICAgLy8gaWYgYW55IGRlc3RpbmF0aW9uIHN0eWxlcyBhcmUgZmlsbGVkIGluIGxhdGVyIG9uIHRoZSBzYW1lXG4gICAgLy8ga2V5ZnJhbWUgdGhlbiB0aGV5IHdpbGwgb3ZlcnJpZGUgdGhlIG92ZXJyaWRkZW4gc3R5bGVzXG4gICAgLy8gV2UgdXNlIGBfZ2xvYmFsVGltZWxpbmVTdHlsZXNgIGhlcmUgYmVjYXVzZSB0aGVyZSBtYXkgYmVcbiAgICAvLyBzdHlsZXMgaW4gcHJldmlvdXMga2V5ZnJhbWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IGluIHRoaXMgdGltZWxpbmVcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX2JhY2tGaWxsW3Byb3BdID0gdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gfHwgQVVUT19TVFlMRTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IEFVVE9fU1RZTEU7XG4gICAgfSk7XG4gICAgdGhpcy5fY3VycmVudEVtcHR5U3RlcEtleWZyYW1lID0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICB9XG5cbiAgc2V0U3R5bGVzKFxuICAgICAgaW5wdXQ6ICjJtVN0eWxlRGF0YXxzdHJpbmcpW10sIGVhc2luZzogc3RyaW5nfG51bGwsIGVycm9yczogYW55W10sXG4gICAgICBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGlmIChlYXNpbmcpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzS2V5ZnJhbWVbJ2Vhc2luZyddID0gZWFzaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IChvcHRpb25zICYmIG9wdGlvbnMucGFyYW1zKSB8fCB7fTtcbiAgICBjb25zdCBzdHlsZXMgPSBmbGF0dGVuU3R5bGVzKGlucHV0LCB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyk7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsID0gaW50ZXJwb2xhdGVQYXJhbXMoc3R5bGVzW3Byb3BdLCBwYXJhbXMsIGVycm9ycyk7XG4gICAgICB0aGlzLl9wZW5kaW5nU3R5bGVzW3Byb3BdID0gdmFsO1xuICAgICAgaWYgKCF0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRoaXMuX2JhY2tGaWxsW3Byb3BdID0gdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMuaGFzT3duUHJvcGVydHkocHJvcCkgP1xuICAgICAgICAgICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gOlxuICAgICAgICAgICAgQVVUT19TVFlMRTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIHZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBhcHBseVN0eWxlc1RvS2V5ZnJhbWUoKSB7XG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fcGVuZGluZ1N0eWxlcztcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0eWxlcyk7XG4gICAgaWYgKHByb3BzLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICB0aGlzLl9wZW5kaW5nU3R5bGVzID0ge307XG5cbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsID0gc3R5bGVzW3Byb3BdO1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lW3Byb3BdID0gdmFsO1xuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGlmICghdGhpcy5fY3VycmVudEtleWZyYW1lLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXNbcHJvcF07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzbmFwc2hvdEN1cnJlbnRTdHlsZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXNbcHJvcF07XG4gICAgICB0aGlzLl9wZW5kaW5nU3R5bGVzW3Byb3BdID0gdmFsO1xuICAgICAgdGhpcy5fdXBkYXRlU3R5bGUocHJvcCwgdmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbmFsS2V5ZnJhbWUoKSB7IHJldHVybiB0aGlzLl9rZXlmcmFtZXMuZ2V0KHRoaXMuZHVyYXRpb24pOyB9XG5cbiAgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgY29uc3QgcHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCBwcm9wIGluIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgcHJvcGVydGllcy5wdXNoKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG4gIG1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXModGltZWxpbmU6IFRpbWVsaW5lQnVpbGRlcikge1xuICAgIE9iamVjdC5rZXlzKHRpbWVsaW5lLl9zdHlsZVN1bW1hcnkpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCBkZXRhaWxzMCA9IHRoaXMuX3N0eWxlU3VtbWFyeVtwcm9wXTtcbiAgICAgIGNvbnN0IGRldGFpbHMxID0gdGltZWxpbmUuX3N0eWxlU3VtbWFyeVtwcm9wXTtcbiAgICAgIGlmICghZGV0YWlsczAgfHwgZGV0YWlsczEudGltZSA+IGRldGFpbHMwLnRpbWUpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3R5bGUocHJvcCwgZGV0YWlsczEudmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYnVpbGRLZXlmcmFtZXMoKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICBjb25zdCBwcmVTdHlsZVByb3BzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgcG9zdFN0eWxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBpc0VtcHR5ID0gdGhpcy5fa2V5ZnJhbWVzLnNpemUgPT09IDEgJiYgdGhpcy5kdXJhdGlvbiA9PT0gMDtcblxuICAgIGxldCBmaW5hbEtleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICAgIHRoaXMuX2tleWZyYW1lcy5mb3JFYWNoKChrZXlmcmFtZSwgdGltZSkgPT4ge1xuICAgICAgY29uc3QgZmluYWxLZXlmcmFtZSA9IGNvcHlTdHlsZXMoa2V5ZnJhbWUsIHRydWUpO1xuICAgICAgT2JqZWN0LmtleXMoZmluYWxLZXlmcmFtZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBmaW5hbEtleWZyYW1lW3Byb3BdO1xuICAgICAgICBpZiAodmFsdWUgPT0gUFJFX1NUWUxFKSB7XG4gICAgICAgICAgcHJlU3R5bGVQcm9wcy5hZGQocHJvcCk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT0gQVVUT19TVFlMRSkge1xuICAgICAgICAgIHBvc3RTdHlsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWlzRW1wdHkpIHtcbiAgICAgICAgZmluYWxLZXlmcmFtZVsnb2Zmc2V0J10gPSB0aW1lIC8gdGhpcy5kdXJhdGlvbjtcbiAgICAgIH1cbiAgICAgIGZpbmFsS2V5ZnJhbWVzLnB1c2goZmluYWxLZXlmcmFtZSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcmVQcm9wczogc3RyaW5nW10gPSBwcmVTdHlsZVByb3BzLnNpemUgPyBpdGVyYXRvclRvQXJyYXkocHJlU3R5bGVQcm9wcy52YWx1ZXMoKSkgOiBbXTtcbiAgICBjb25zdCBwb3N0UHJvcHM6IHN0cmluZ1tdID0gcG9zdFN0eWxlUHJvcHMuc2l6ZSA/IGl0ZXJhdG9yVG9BcnJheShwb3N0U3R5bGVQcm9wcy52YWx1ZXMoKSkgOiBbXTtcblxuICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgYSAwLXNlY29uZCBhbmltYXRpb24gKHdoaWNoIGlzIGRlc2lnbmVkIGp1c3QgdG8gcGxhY2Ugc3R5bGVzIG9uc2NyZWVuKVxuICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICBjb25zdCBrZjAgPSBmaW5hbEtleWZyYW1lc1swXTtcbiAgICAgIGNvbnN0IGtmMSA9IGNvcHlPYmooa2YwKTtcbiAgICAgIGtmMFsnb2Zmc2V0J10gPSAwO1xuICAgICAga2YxWydvZmZzZXQnXSA9IDE7XG4gICAgICBmaW5hbEtleWZyYW1lcyA9IFtrZjAsIGtmMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuZWxlbWVudCwgZmluYWxLZXlmcmFtZXMsIHByZVByb3BzLCBwb3N0UHJvcHMsIHRoaXMuZHVyYXRpb24sIHRoaXMuc3RhcnRUaW1lLFxuICAgICAgICB0aGlzLmVhc2luZywgZmFsc2UpO1xuICB9XG59XG5cbmNsYXNzIFN1YlRpbWVsaW5lQnVpbGRlciBleHRlbmRzIFRpbWVsaW5lQnVpbGRlciB7XG4gIHB1YmxpYyB0aW1pbmdzOiBBbmltYXRlVGltaW5ncztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdLFxuICAgICAgcHVibGljIHByZVN0eWxlUHJvcHM6IHN0cmluZ1tdLCBwdWJsaWMgcG9zdFN0eWxlUHJvcHM6IHN0cmluZ1tdLCB0aW1pbmdzOiBBbmltYXRlVGltaW5ncyxcbiAgICAgIHByaXZhdGUgX3N0cmV0Y2hTdGFydGluZ0tleWZyYW1lOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcihkcml2ZXIsIGVsZW1lbnQsIHRpbWluZ3MuZGVsYXkpO1xuICAgIHRoaXMudGltaW5ncyA9IHtkdXJhdGlvbjogdGltaW5ncy5kdXJhdGlvbiwgZGVsYXk6IHRpbWluZ3MuZGVsYXksIGVhc2luZzogdGltaW5ncy5lYXNpbmd9O1xuICB9XG5cbiAgY29udGFpbnNBbmltYXRpb24oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmtleWZyYW1lcy5sZW5ndGggPiAxOyB9XG5cbiAgYnVpbGRLZXlmcmFtZXMoKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiB7XG4gICAgbGV0IGtleWZyYW1lcyA9IHRoaXMua2V5ZnJhbWVzO1xuICAgIGxldCB7ZGVsYXksIGR1cmF0aW9uLCBlYXNpbmd9ID0gdGhpcy50aW1pbmdzO1xuICAgIGlmICh0aGlzLl9zdHJldGNoU3RhcnRpbmdLZXlmcmFtZSAmJiBkZWxheSkge1xuICAgICAgY29uc3QgbmV3S2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gICAgICBjb25zdCB0b3RhbFRpbWUgPSBkdXJhdGlvbiArIGRlbGF5O1xuICAgICAgY29uc3Qgc3RhcnRpbmdHYXAgPSBkZWxheSAvIHRvdGFsVGltZTtcblxuICAgICAgLy8gdGhlIG9yaWdpbmFsIHN0YXJ0aW5nIGtleWZyYW1lIG5vdyBzdGFydHMgb25jZSB0aGUgZGVsYXkgaXMgZG9uZVxuICAgICAgY29uc3QgbmV3Rmlyc3RLZXlmcmFtZSA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzWzBdLCBmYWxzZSk7XG4gICAgICBuZXdGaXJzdEtleWZyYW1lWydvZmZzZXQnXSA9IDA7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChuZXdGaXJzdEtleWZyYW1lKTtcblxuICAgICAgY29uc3Qgb2xkRmlyc3RLZXlmcmFtZSA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzWzBdLCBmYWxzZSk7XG4gICAgICBvbGRGaXJzdEtleWZyYW1lWydvZmZzZXQnXSA9IHJvdW5kT2Zmc2V0KHN0YXJ0aW5nR2FwKTtcbiAgICAgIG5ld0tleWZyYW1lcy5wdXNoKG9sZEZpcnN0S2V5ZnJhbWUpO1xuXG4gICAgICAvKlxuICAgICAgICBXaGVuIHRoZSBrZXlmcmFtZSBpcyBzdHJldGNoZWQgdGhlbiBpdCBtZWFucyB0aGF0IHRoZSBkZWxheSBiZWZvcmUgdGhlIGFuaW1hdGlvblxuICAgICAgICBzdGFydHMgaXMgZ29uZS4gSW5zdGVhZCB0aGUgZmlyc3Qga2V5ZnJhbWUgaXMgcGxhY2VkIGF0IHRoZSBzdGFydCBvZiB0aGUgYW5pbWF0aW9uXG4gICAgICAgIGFuZCBpdCBpcyB0aGVuIGNvcGllZCB0byB3aGVyZSBpdCBzdGFydHMgd2hlbiB0aGUgb3JpZ2luYWwgZGVsYXkgaXMgb3Zlci4gVGhpcyBiYXNpY2FsbHlcbiAgICAgICAgbWVhbnMgbm90aGluZyBhbmltYXRlcyBkdXJpbmcgdGhhdCBkZWxheSwgYnV0IHRoZSBzdHlsZXMgYXJlIHN0aWxsIHJlbmRlcmVyZWQuIEZvciB0aGlzXG4gICAgICAgIHRvIHdvcmsgdGhlIG9yaWdpbmFsIG9mZnNldCB2YWx1ZXMgdGhhdCBleGlzdCBpbiB0aGUgb3JpZ2luYWwga2V5ZnJhbWVzIG11c3QgYmUgXCJ3YXJwZWRcIlxuICAgICAgICBzbyB0aGF0IHRoZXkgY2FuIHRha2UgdGhlIG5ldyBrZXlmcmFtZSArIGRlbGF5IGludG8gYWNjb3VudC5cblxuICAgICAgICBkZWxheT0xMDAwLCBkdXJhdGlvbj0xMDAwLCBrZXlmcmFtZXMgPSAwIC41IDFcblxuICAgICAgICB0dXJucyBpbnRvXG5cbiAgICAgICAgZGVsYXk9MCwgZHVyYXRpb249MjAwMCwga2V5ZnJhbWVzID0gMCAuMzMgLjY2IDFcbiAgICAgICAqL1xuXG4gICAgICAvLyBvZmZzZXRzIGJldHdlZW4gMSAuLi4gbiAtMSBhcmUgYWxsIHdhcnBlZCBieSB0aGUga2V5ZnJhbWUgc3RyZXRjaFxuICAgICAgY29uc3QgbGltaXQgPSBrZXlmcmFtZXMubGVuZ3RoIC0gMTtcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGxpbWl0OyBpKyspIHtcbiAgICAgICAgbGV0IGtmID0gY29weVN0eWxlcyhrZXlmcmFtZXNbaV0sIGZhbHNlKTtcbiAgICAgICAgY29uc3Qgb2xkT2Zmc2V0ID0ga2ZbJ29mZnNldCddIGFzIG51bWJlcjtcbiAgICAgICAgY29uc3QgdGltZUF0S2V5ZnJhbWUgPSBkZWxheSArIG9sZE9mZnNldCAqIGR1cmF0aW9uO1xuICAgICAgICBrZlsnb2Zmc2V0J10gPSByb3VuZE9mZnNldCh0aW1lQXRLZXlmcmFtZSAvIHRvdGFsVGltZSk7XG4gICAgICAgIG5ld0tleWZyYW1lcy5wdXNoKGtmKTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhlIG5ldyBzdGFydGluZyBrZXlmcmFtZSBzaG91bGQgYmUgYWRkZWQgYXQgdGhlIHN0YXJ0XG4gICAgICBkdXJhdGlvbiA9IHRvdGFsVGltZTtcbiAgICAgIGRlbGF5ID0gMDtcbiAgICAgIGVhc2luZyA9ICcnO1xuXG4gICAgICBrZXlmcmFtZXMgPSBuZXdLZXlmcmFtZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuZWxlbWVudCwga2V5ZnJhbWVzLCB0aGlzLnByZVN0eWxlUHJvcHMsIHRoaXMucG9zdFN0eWxlUHJvcHMsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLFxuICAgICAgICB0cnVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByb3VuZE9mZnNldChvZmZzZXQ6IG51bWJlciwgZGVjaW1hbFBvaW50cyA9IDMpOiBudW1iZXIge1xuICBjb25zdCBtdWx0ID0gTWF0aC5wb3coMTAsIGRlY2ltYWxQb2ludHMgLSAxKTtcbiAgcmV0dXJuIE1hdGgucm91bmQob2Zmc2V0ICogbXVsdCkgLyBtdWx0O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuU3R5bGVzKGlucHV0OiAoybVTdHlsZURhdGEgfCBzdHJpbmcpW10sIGFsbFN0eWxlczogybVTdHlsZURhdGEpIHtcbiAgY29uc3Qgc3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBsZXQgYWxsUHJvcGVydGllczogc3RyaW5nW107XG4gIGlucHV0LmZvckVhY2godG9rZW4gPT4ge1xuICAgIGlmICh0b2tlbiA9PT0gJyonKSB7XG4gICAgICBhbGxQcm9wZXJ0aWVzID0gYWxsUHJvcGVydGllcyB8fCBPYmplY3Qua2V5cyhhbGxTdHlsZXMpO1xuICAgICAgYWxsUHJvcGVydGllcy5mb3JFYWNoKHByb3AgPT4geyBzdHlsZXNbcHJvcF0gPSBBVVRPX1NUWUxFOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29weVN0eWxlcyh0b2tlbiBhcyDJtVN0eWxlRGF0YSwgZmFsc2UsIHN0eWxlcyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN0eWxlcztcbn1cbiJdfQ==