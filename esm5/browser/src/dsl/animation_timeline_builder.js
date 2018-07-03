import * as tslib_1 from "tslib";
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
var ONE_FRAME_IN_MILLISECONDS = 1;
var ENTER_TOKEN = ':enter';
var ENTER_TOKEN_REGEX = new RegExp(ENTER_TOKEN, 'g');
var LEAVE_TOKEN = ':leave';
var LEAVE_TOKEN_REGEX = new RegExp(LEAVE_TOKEN, 'g');
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
export function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors) {
    if (startingStyles === void 0) { startingStyles = {}; }
    if (finalStyles === void 0) { finalStyles = {}; }
    if (errors === void 0) { errors = []; }
    return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
var AnimationTimelineBuilderVisitor = /** @class */ (function () {
    function AnimationTimelineBuilderVisitor() {
    }
    AnimationTimelineBuilderVisitor.prototype.buildKeyframes = function (driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors) {
        if (errors === void 0) { errors = []; }
        subInstructions = subInstructions || new ElementInstructionMap();
        var context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
        context.options = options;
        context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
        visitDslNode(this, ast, context);
        // this checks to see if an actual animation happened
        var timelines = context.timelines.filter(function (timeline) { return timeline.containsAnimation(); });
        if (timelines.length && Object.keys(finalStyles).length) {
            var tl = timelines[timelines.length - 1];
            if (!tl.allowOnlyTimelineStyles()) {
                tl.setStyles([finalStyles], null, context.errors, options);
            }
        }
        return timelines.length ? timelines.map(function (timeline) { return timeline.buildKeyframes(); }) :
            [createTimelineInstruction(rootElement, [], [], [], 0, 0, '', false)];
    };
    AnimationTimelineBuilderVisitor.prototype.visitTrigger = function (ast, context) {
        // these values are not visited in this AST
    };
    AnimationTimelineBuilderVisitor.prototype.visitState = function (ast, context) {
        // these values are not visited in this AST
    };
    AnimationTimelineBuilderVisitor.prototype.visitTransition = function (ast, context) {
        // these values are not visited in this AST
    };
    AnimationTimelineBuilderVisitor.prototype.visitAnimateChild = function (ast, context) {
        var elementInstructions = context.subInstructions.consume(context.element);
        if (elementInstructions) {
            var innerContext = context.createSubContext(ast.options);
            var startTime = context.currentTimeline.currentTime;
            var endTime = this._visitSubInstructions(elementInstructions, innerContext, innerContext.options);
            if (startTime != endTime) {
                // we do this on the upper context because we created a sub context for
                // the sub child animations
                context.transformIntoNewTimeline(endTime);
            }
        }
        context.previousNode = ast;
    };
    AnimationTimelineBuilderVisitor.prototype.visitAnimateRef = function (ast, context) {
        var innerContext = context.createSubContext(ast.options);
        innerContext.transformIntoNewTimeline();
        this.visitReference(ast.animation, innerContext);
        context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        context.previousNode = ast;
    };
    AnimationTimelineBuilderVisitor.prototype._visitSubInstructions = function (instructions, context, options) {
        var startTime = context.currentTimeline.currentTime;
        var furthestTime = startTime;
        // this is a special-case for when a user wants to skip a sub
        // animation from being fired entirely.
        var duration = options.duration != null ? resolveTimingValue(options.duration) : null;
        var delay = options.delay != null ? resolveTimingValue(options.delay) : null;
        if (duration !== 0) {
            instructions.forEach(function (instruction) {
                var instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
                furthestTime =
                    Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
            });
        }
        return furthestTime;
    };
    AnimationTimelineBuilderVisitor.prototype.visitReference = function (ast, context) {
        context.updateOptions(ast.options, true);
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
    };
    AnimationTimelineBuilderVisitor.prototype.visitSequence = function (ast, context) {
        var _this = this;
        var subContextCount = context.subContextCount;
        var ctx = context;
        var options = ast.options;
        if (options && (options.params || options.delay)) {
            ctx = context.createSubContext(options);
            ctx.transformIntoNewTimeline();
            if (options.delay != null) {
                if (ctx.previousNode.type == 6 /* Style */) {
                    ctx.currentTimeline.snapshotCurrentStyles();
                    ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
                }
                var delay = resolveTimingValue(options.delay);
                ctx.delayNextStep(delay);
            }
        }
        if (ast.steps.length) {
            ast.steps.forEach(function (s) { return visitDslNode(_this, s, ctx); });
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
    };
    AnimationTimelineBuilderVisitor.prototype.visitGroup = function (ast, context) {
        var _this = this;
        var innerTimelines = [];
        var furthestTime = context.currentTimeline.currentTime;
        var delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
        ast.steps.forEach(function (s) {
            var innerContext = context.createSubContext(ast.options);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            visitDslNode(_this, s, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach(function (timeline) { return context.currentTimeline.mergeTimelineCollectedStyles(timeline); });
        context.transformIntoNewTimeline(furthestTime);
        context.previousNode = ast;
    };
    AnimationTimelineBuilderVisitor.prototype._visitTiming = function (ast, context) {
        if (ast.dynamic) {
            var strValue = ast.strValue;
            var timingValue = context.params ? interpolateParams(strValue, context.params, context.errors) : strValue;
            return resolveTiming(timingValue, context.errors);
        }
        else {
            return { duration: ast.duration, delay: ast.delay, easing: ast.easing };
        }
    };
    AnimationTimelineBuilderVisitor.prototype.visitAnimate = function (ast, context) {
        var timings = context.currentAnimateTimings = this._visitTiming(ast.timings, context);
        var timeline = context.currentTimeline;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            timeline.snapshotCurrentStyles();
        }
        var style = ast.style;
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
    };
    AnimationTimelineBuilderVisitor.prototype.visitStyle = function (ast, context) {
        var timeline = context.currentTimeline;
        var timings = context.currentAnimateTimings;
        // this is a special case for when a style() call
        // directly follows  an animate() call (but not inside of an animate() call)
        if (!timings && timeline.getCurrentStyleProperties().length) {
            timeline.forwardFrame();
        }
        var easing = (timings && timings.easing) || ast.easing;
        if (ast.isEmptyStep) {
            timeline.applyEmptyStep(easing);
        }
        else {
            timeline.setStyles(ast.styles, easing, context.errors, context.options);
        }
        context.previousNode = ast;
    };
    AnimationTimelineBuilderVisitor.prototype.visitKeyframes = function (ast, context) {
        var currentAnimateTimings = context.currentAnimateTimings;
        var startTime = (context.currentTimeline).duration;
        var duration = currentAnimateTimings.duration;
        var innerContext = context.createSubContext();
        var innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = currentAnimateTimings.easing;
        ast.styles.forEach(function (step) {
            var offset = step.offset || 0;
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
    };
    AnimationTimelineBuilderVisitor.prototype.visitQuery = function (ast, context) {
        var _this = this;
        // in the event that the first step before this is a style step we need
        // to ensure the styles are applied before the children are animated
        var startTime = context.currentTimeline.currentTime;
        var options = (ast.options || {});
        var delay = options.delay ? resolveTimingValue(options.delay) : 0;
        if (delay && (context.previousNode.type === 6 /* Style */ ||
            (startTime == 0 && context.currentTimeline.getCurrentStyleProperties().length))) {
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        var furthestTime = startTime;
        var elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
        context.currentQueryTotal = elms.length;
        var sameElementTimeline = null;
        elms.forEach(function (element, i) {
            context.currentQueryIndex = i;
            var innerContext = context.createSubContext(ast.options, element);
            if (delay) {
                innerContext.delayNextStep(delay);
            }
            if (element === context.element) {
                sameElementTimeline = innerContext.currentTimeline;
            }
            visitDslNode(_this, ast.animation, innerContext);
            // this is here just incase the inner steps only contain or end
            // with a style() call (which is here to signal that this is a preparatory
            // call to style an element before it is animated again)
            innerContext.currentTimeline.applyStylesToKeyframe();
            var endTime = innerContext.currentTimeline.currentTime;
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
    };
    AnimationTimelineBuilderVisitor.prototype.visitStagger = function (ast, context) {
        var parentContext = context.parentContext;
        var tl = context.currentTimeline;
        var timings = ast.timings;
        var duration = Math.abs(timings.duration);
        var maxTime = duration * (context.currentQueryTotal - 1);
        var delay = duration * context.currentQueryIndex;
        var staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
        switch (staggerTransformer) {
            case 'reverse':
                delay = maxTime - delay;
                break;
            case 'full':
                delay = parentContext.currentStaggerTime;
                break;
        }
        var timeline = context.currentTimeline;
        if (delay) {
            timeline.delayNextStep(delay);
        }
        var startingTime = timeline.currentTime;
        visitDslNode(this, ast.animation, context);
        context.previousNode = ast;
        // time = duration + delay
        // the reason why this computation is so complex is because
        // the inner timeline may either have a delay value or a stretched
        // keyframe depending on if a subtimeline is not used or is used.
        parentContext.currentStaggerTime =
            (tl.currentTime - startingTime) + (tl.startTime - parentContext.currentTimeline.startTime);
    };
    return AnimationTimelineBuilderVisitor;
}());
export { AnimationTimelineBuilderVisitor };
var DEFAULT_NOOP_PREVIOUS_NODE = {};
var AnimationTimelineContext = /** @class */ (function () {
    function AnimationTimelineContext(_driver, element, subInstructions, _enterClassName, _leaveClassName, errors, timelines, initialTimeline) {
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
    Object.defineProperty(AnimationTimelineContext.prototype, "params", {
        get: function () { return this.options.params; },
        enumerable: true,
        configurable: true
    });
    AnimationTimelineContext.prototype.updateOptions = function (options, skipIfExists) {
        var _this = this;
        if (!options)
            return;
        var newOptions = options;
        var optionsToUpdate = this.options;
        // NOTE: this will get patched up when other animation methods support duration overrides
        if (newOptions.duration != null) {
            optionsToUpdate.duration = resolveTimingValue(newOptions.duration);
        }
        if (newOptions.delay != null) {
            optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
        }
        var newParams = newOptions.params;
        if (newParams) {
            var paramsToUpdate_1 = optionsToUpdate.params;
            if (!paramsToUpdate_1) {
                paramsToUpdate_1 = this.options.params = {};
            }
            Object.keys(newParams).forEach(function (name) {
                if (!skipIfExists || !paramsToUpdate_1.hasOwnProperty(name)) {
                    paramsToUpdate_1[name] = interpolateParams(newParams[name], paramsToUpdate_1, _this.errors);
                }
            });
        }
    };
    AnimationTimelineContext.prototype._copyOptions = function () {
        var options = {};
        if (this.options) {
            var oldParams_1 = this.options.params;
            if (oldParams_1) {
                var params_1 = options['params'] = {};
                Object.keys(oldParams_1).forEach(function (name) { params_1[name] = oldParams_1[name]; });
            }
        }
        return options;
    };
    AnimationTimelineContext.prototype.createSubContext = function (options, element, newTime) {
        if (options === void 0) { options = null; }
        var target = element || this.element;
        var context = new AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        context.options = this._copyOptions();
        context.updateOptions(options);
        context.currentQueryIndex = this.currentQueryIndex;
        context.currentQueryTotal = this.currentQueryTotal;
        context.parentContext = this;
        this.subContextCount++;
        return context;
    };
    AnimationTimelineContext.prototype.transformIntoNewTimeline = function (newTime) {
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    };
    AnimationTimelineContext.prototype.appendInstructionToTimeline = function (instruction, duration, delay) {
        var updatedTimings = {
            duration: duration != null ? duration : instruction.duration,
            delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
            easing: ''
        };
        var builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
        this.timelines.push(builder);
        return updatedTimings;
    };
    AnimationTimelineContext.prototype.incrementTime = function (time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    };
    AnimationTimelineContext.prototype.delayNextStep = function (delay) {
        // negative delays are not yet supported
        if (delay > 0) {
            this.currentTimeline.delayNextStep(delay);
        }
    };
    AnimationTimelineContext.prototype.invokeQuery = function (selector, originalSelector, limit, includeSelf, optional, errors) {
        var results = [];
        if (includeSelf) {
            results.push(this.element);
        }
        if (selector.length > 0) {
            selector = selector.replace(ENTER_TOKEN_REGEX, '.' + this._enterClassName);
            selector = selector.replace(LEAVE_TOKEN_REGEX, '.' + this._leaveClassName);
            var multi = limit != 1;
            var elements = this._driver.query(this.element, selector, multi);
            if (limit !== 0) {
                elements = limit < 0 ? elements.slice(elements.length + limit, elements.length) :
                    elements.slice(0, limit);
            }
            results.push.apply(results, tslib_1.__spread(elements));
        }
        if (!optional && results.length == 0) {
            errors.push("`query(\"" + originalSelector + "\")` returned zero elements. (Use `query(\"" + originalSelector + "\", { optional: true })` if you wish to allow this.)");
        }
        return results;
    };
    return AnimationTimelineContext;
}());
export { AnimationTimelineContext };
var TimelineBuilder = /** @class */ (function () {
    function TimelineBuilder(_driver, element, startTime, _elementTimelineStylesLookup) {
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
    TimelineBuilder.prototype.containsAnimation = function () {
        switch (this._keyframes.size) {
            case 0:
                return false;
            case 1:
                return this.getCurrentStyleProperties().length > 0;
            default:
                return true;
        }
    };
    TimelineBuilder.prototype.getCurrentStyleProperties = function () { return Object.keys(this._currentKeyframe); };
    Object.defineProperty(TimelineBuilder.prototype, "currentTime", {
        get: function () { return this.startTime + this.duration; },
        enumerable: true,
        configurable: true
    });
    TimelineBuilder.prototype.delayNextStep = function (delay) {
        // in the event that a style() step is placed right before a stagger()
        // and that style() step is the very first style() value in the animation
        // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
        // properly applies the style() values to work with the stagger...
        var hasPreStyleStep = this._keyframes.size == 1 && Object.keys(this._pendingStyles).length;
        if (this.duration || hasPreStyleStep) {
            this.forwardTime(this.currentTime + delay);
            if (hasPreStyleStep) {
                this.snapshotCurrentStyles();
            }
        }
        else {
            this.startTime += delay;
        }
    };
    TimelineBuilder.prototype.fork = function (element, currentTime) {
        this.applyStylesToKeyframe();
        return new TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
    };
    TimelineBuilder.prototype._loadKeyframe = function () {
        if (this._currentKeyframe) {
            this._previousKeyframe = this._currentKeyframe;
        }
        this._currentKeyframe = this._keyframes.get(this.duration);
        if (!this._currentKeyframe) {
            this._currentKeyframe = Object.create(this._backFill, {});
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    };
    TimelineBuilder.prototype.forwardFrame = function () {
        this.duration += ONE_FRAME_IN_MILLISECONDS;
        this._loadKeyframe();
    };
    TimelineBuilder.prototype.forwardTime = function (time) {
        this.applyStylesToKeyframe();
        this.duration = time;
        this._loadKeyframe();
    };
    TimelineBuilder.prototype._updateStyle = function (prop, value) {
        this._localTimelineStyles[prop] = value;
        this._globalTimelineStyles[prop] = value;
        this._styleSummary[prop] = { time: this.currentTime, value: value };
    };
    TimelineBuilder.prototype.allowOnlyTimelineStyles = function () { return this._currentEmptyStepKeyframe !== this._currentKeyframe; };
    TimelineBuilder.prototype.applyEmptyStep = function (easing) {
        var _this = this;
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        // special case for animate(duration):
        // all missing styles are filled with a `*` value then
        // if any destination styles are filled in later on the same
        // keyframe then they will override the overridden styles
        // We use `_globalTimelineStyles` here because there may be
        // styles in previous keyframes that are not present in this timeline
        Object.keys(this._globalTimelineStyles).forEach(function (prop) {
            _this._backFill[prop] = _this._globalTimelineStyles[prop] || AUTO_STYLE;
            _this._currentKeyframe[prop] = AUTO_STYLE;
        });
        this._currentEmptyStepKeyframe = this._currentKeyframe;
    };
    TimelineBuilder.prototype.setStyles = function (input, easing, errors, options) {
        var _this = this;
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        var params = (options && options.params) || {};
        var styles = flattenStyles(input, this._globalTimelineStyles);
        Object.keys(styles).forEach(function (prop) {
            var val = interpolateParams(styles[prop], params, errors);
            _this._pendingStyles[prop] = val;
            if (!_this._localTimelineStyles.hasOwnProperty(prop)) {
                _this._backFill[prop] = _this._globalTimelineStyles.hasOwnProperty(prop) ?
                    _this._globalTimelineStyles[prop] :
                    AUTO_STYLE;
            }
            _this._updateStyle(prop, val);
        });
    };
    TimelineBuilder.prototype.applyStylesToKeyframe = function () {
        var _this = this;
        var styles = this._pendingStyles;
        var props = Object.keys(styles);
        if (props.length == 0)
            return;
        this._pendingStyles = {};
        props.forEach(function (prop) {
            var val = styles[prop];
            _this._currentKeyframe[prop] = val;
        });
        Object.keys(this._localTimelineStyles).forEach(function (prop) {
            if (!_this._currentKeyframe.hasOwnProperty(prop)) {
                _this._currentKeyframe[prop] = _this._localTimelineStyles[prop];
            }
        });
    };
    TimelineBuilder.prototype.snapshotCurrentStyles = function () {
        var _this = this;
        Object.keys(this._localTimelineStyles).forEach(function (prop) {
            var val = _this._localTimelineStyles[prop];
            _this._pendingStyles[prop] = val;
            _this._updateStyle(prop, val);
        });
    };
    TimelineBuilder.prototype.getFinalKeyframe = function () { return this._keyframes.get(this.duration); };
    Object.defineProperty(TimelineBuilder.prototype, "properties", {
        get: function () {
            var properties = [];
            for (var prop in this._currentKeyframe) {
                properties.push(prop);
            }
            return properties;
        },
        enumerable: true,
        configurable: true
    });
    TimelineBuilder.prototype.mergeTimelineCollectedStyles = function (timeline) {
        var _this = this;
        Object.keys(timeline._styleSummary).forEach(function (prop) {
            var details0 = _this._styleSummary[prop];
            var details1 = timeline._styleSummary[prop];
            if (!details0 || details1.time > details0.time) {
                _this._updateStyle(prop, details1.value);
            }
        });
    };
    TimelineBuilder.prototype.buildKeyframes = function () {
        var _this = this;
        this.applyStylesToKeyframe();
        var preStyleProps = new Set();
        var postStyleProps = new Set();
        var isEmpty = this._keyframes.size === 1 && this.duration === 0;
        var finalKeyframes = [];
        this._keyframes.forEach(function (keyframe, time) {
            var finalKeyframe = copyStyles(keyframe, true);
            Object.keys(finalKeyframe).forEach(function (prop) {
                var value = finalKeyframe[prop];
                if (value == PRE_STYLE) {
                    preStyleProps.add(prop);
                }
                else if (value == AUTO_STYLE) {
                    postStyleProps.add(prop);
                }
            });
            if (!isEmpty) {
                finalKeyframe['offset'] = time / _this.duration;
            }
            finalKeyframes.push(finalKeyframe);
        });
        var preProps = preStyleProps.size ? iteratorToArray(preStyleProps.values()) : [];
        var postProps = postStyleProps.size ? iteratorToArray(postStyleProps.values()) : [];
        // special case for a 0-second animation (which is designed just to place styles onscreen)
        if (isEmpty) {
            var kf0 = finalKeyframes[0];
            var kf1 = copyObj(kf0);
            kf0['offset'] = 0;
            kf1['offset'] = 1;
            finalKeyframes = [kf0, kf1];
        }
        return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
    };
    return TimelineBuilder;
}());
export { TimelineBuilder };
var SubTimelineBuilder = /** @class */ (function (_super) {
    tslib_1.__extends(SubTimelineBuilder, _super);
    function SubTimelineBuilder(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe) {
        if (_stretchStartingKeyframe === void 0) { _stretchStartingKeyframe = false; }
        var _this = _super.call(this, driver, element, timings.delay) || this;
        _this.element = element;
        _this.keyframes = keyframes;
        _this.preStyleProps = preStyleProps;
        _this.postStyleProps = postStyleProps;
        _this._stretchStartingKeyframe = _stretchStartingKeyframe;
        _this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
        return _this;
    }
    SubTimelineBuilder.prototype.containsAnimation = function () { return this.keyframes.length > 1; };
    SubTimelineBuilder.prototype.buildKeyframes = function () {
        var keyframes = this.keyframes;
        var _a = this.timings, delay = _a.delay, duration = _a.duration, easing = _a.easing;
        if (this._stretchStartingKeyframe && delay) {
            var newKeyframes = [];
            var totalTime = duration + delay;
            var startingGap = delay / totalTime;
            // the original starting keyframe now starts once the delay is done
            var newFirstKeyframe = copyStyles(keyframes[0], false);
            newFirstKeyframe['offset'] = 0;
            newKeyframes.push(newFirstKeyframe);
            var oldFirstKeyframe = copyStyles(keyframes[0], false);
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
            var limit = keyframes.length - 1;
            for (var i = 1; i <= limit; i++) {
                var kf = copyStyles(keyframes[i], false);
                var oldOffset = kf['offset'];
                var timeAtKeyframe = delay + oldOffset * duration;
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
    };
    return SubTimelineBuilder;
}(TimelineBuilder));
function roundOffset(offset, decimalPoints) {
    if (decimalPoints === void 0) { decimalPoints = 3; }
    var mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
function flattenStyles(input, allStyles) {
    var styles = {};
    var allProperties;
    input.forEach(function (token) {
        if (token === '*') {
            allProperties = allProperties || Object.keys(allStyles);
            allProperties.forEach(function (prop) { styles[prop] = AUTO_STYLE; });
        }
        else {
            copyStyles(token, false, styles);
        }
    });
    return styles;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBdUcsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBR3pMLE9BQU8sRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR2pJLE9BQU8sRUFBK0IseUJBQXlCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN6RyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxJQUFNLHlCQUF5QixHQUFHLENBQUMsQ0FBQztBQUNwQyxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkQsSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDO0FBQzdCLElBQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1GRztBQUNILE1BQU0sa0NBQ0YsTUFBdUIsRUFBRSxXQUFnQixFQUFFLEdBQStCLEVBQzFFLGNBQXNCLEVBQUUsY0FBc0IsRUFBRSxjQUErQixFQUMvRSxXQUE0QixFQUFFLE9BQXlCLEVB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RCxDQUFDLEFBbkVELENBQWlDLGVBQWUsR0FtRS9DO0FBRUQscUJBQXFCLE1BQWMsRUFBRSxhQUFpQjtJQUFqQiw4QkFBQSxFQUFBLGlCQUFpQjtJQUNwRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQyxDQUFDO0FBRUQsdUJBQXVCLEtBQThCLEVBQUUsU0FBcUI7SUFDMUUsSUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO0lBQzlCLElBQUksYUFBdUIsQ0FBQztJQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztRQUNqQixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsQixhQUFhLEdBQUcsYUFBYSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sVUFBVSxDQUFDLEtBQW1CLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0ZUNoaWxkT3B0aW9ucywgQW5pbWF0ZVRpbWluZ3MsIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSwgQW5pbWF0aW9uT3B0aW9ucywgQW5pbWF0aW9uUXVlcnlPcHRpb25zLCDJtVBSRV9TVFlMRSBhcyBQUkVfU1RZTEUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Y29weU9iaiwgY29weVN0eWxlcywgaW50ZXJwb2xhdGVQYXJhbXMsIGl0ZXJhdG9yVG9BcnJheSwgcmVzb2x2ZVRpbWluZywgcmVzb2x2ZVRpbWluZ1ZhbHVlLCB2aXNpdERzbE5vZGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGVBc3QsIEFuaW1hdGVDaGlsZEFzdCwgQW5pbWF0ZVJlZkFzdCwgQXN0LCBBc3RWaXNpdG9yLCBEeW5hbWljVGltaW5nQXN0LCBHcm91cEFzdCwgS2V5ZnJhbWVzQXN0LCBRdWVyeUFzdCwgUmVmZXJlbmNlQXN0LCBTZXF1ZW5jZUFzdCwgU3RhZ2dlckFzdCwgU3RhdGVBc3QsIFN0eWxlQXN0LCBUaW1pbmdBc3QsIFRyYW5zaXRpb25Bc3QsIFRyaWdnZXJBc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcblxuY29uc3QgT05FX0ZSQU1FX0lOX01JTExJU0VDT05EUyA9IDE7XG5jb25zdCBFTlRFUl9UT0tFTiA9ICc6ZW50ZXInO1xuY29uc3QgRU5URVJfVE9LRU5fUkVHRVggPSBuZXcgUmVnRXhwKEVOVEVSX1RPS0VOLCAnZycpO1xuY29uc3QgTEVBVkVfVE9LRU4gPSAnOmxlYXZlJztcbmNvbnN0IExFQVZFX1RPS0VOX1JFR0VYID0gbmV3IFJlZ0V4cChMRUFWRV9UT0tFTiwgJ2cnKTtcblxuLypcbiAqIFRoZSBjb2RlIHdpdGhpbiB0aGlzIGZpbGUgYWltcyB0byBnZW5lcmF0ZSB3ZWItYW5pbWF0aW9ucy1jb21wYXRpYmxlIGtleWZyYW1lcyBmcm9tIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBjb2RlLlxuICpcbiAqIFRoZSBjb2RlIGJlbG93IHdpbGwgYmUgY29udmVydGVkIGZyb206XG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogVG86XG4gKiBgYGBcbiAqIGtleWZyYW1lcyA9IFt7IG9wYWNpdHk6IDAsIG9mZnNldDogMCB9LCB7IG9wYWNpdHk6IDEsIG9mZnNldDogMSB9XVxuICogZHVyYXRpb24gPSAxMDAwXG4gKiBkZWxheSA9IDBcbiAqIGVhc2luZyA9ICcnXG4gKiBgYGBcbiAqXG4gKiBGb3IgdGhpcyBvcGVyYXRpb24gdG8gY292ZXIgdGhlIGNvbWJpbmF0aW9uIG9mIGFuaW1hdGlvbiB2ZXJicyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFcbiAqIGNvbWJpbmF0aW9uIG9mIHByb3RvdHlwaWNhbCBpbmhlcml0YW5jZSwgQVNUIHRyYXZlcnNhbCBhbmQgbWVyZ2Utc29ydC1saWtlIGFsZ29yaXRobXMgYXJlIHVzZWQuXG4gKlxuICogW0FTVCBUcmF2ZXJzYWxdXG4gKiBFYWNoIG9mIHRoZSBhbmltYXRpb24gdmVyYnMsIHdoZW4gZXhlY3V0ZWQsIHdpbGwgcmV0dXJuIGFuIHN0cmluZy1tYXAgb2JqZWN0IHJlcHJlc2VudGluZyB3aGF0XG4gKiB0eXBlIG9mIGFjdGlvbiBpdCBpcyAoc3R5bGUsIGFuaW1hdGUsIGdyb3VwLCBldGMuLi4pIGFuZCB0aGUgZGF0YSBhc3NvY2lhdGVkIHdpdGggaXQuIFRoaXMgbWVhbnNcbiAqIHRoYXQgd2hlbiBmdW5jdGlvbmFsIGNvbXBvc2l0aW9uIG1peCBvZiB0aGVzZSBmdW5jdGlvbnMgaXMgZXZhbHVhdGVkIChsaWtlIGluIHRoZSBleGFtcGxlIGFib3ZlKVxuICogdGhlbiBpdCB3aWxsIGVuZCB1cCBwcm9kdWNpbmcgYSB0cmVlIG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBhbmltYXRpb24gaXRzZWxmLlxuICpcbiAqIFdoZW4gdGhpcyBhbmltYXRpb24gb2JqZWN0IHRyZWUgaXMgcHJvY2Vzc2VkIGJ5IHRoZSB2aXNpdG9yIGNvZGUgYmVsb3cgaXQgd2lsbCB2aXNpdCBlYWNoIG9mIHRoZVxuICogdmVyYiBzdGF0ZW1lbnRzIHdpdGhpbiB0aGUgdmlzaXRvci4gQW5kIGR1cmluZyBlYWNoIHZpc2l0IGl0IHdpbGwgYnVpbGQgdGhlIGNvbnRleHQgb2YgdGhlXG4gKiBhbmltYXRpb24ga2V5ZnJhbWVzIGJ5IGludGVyYWN0aW5nIHdpdGggdGhlIGBUaW1lbGluZUJ1aWxkZXJgLlxuICpcbiAqIFtUaW1lbGluZUJ1aWxkZXJdXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciB0cmFja2luZyB0aGUgc3R5bGVzIGFuZCBidWlsZGluZyBhIHNlcmllcyBvZiBrZXlmcmFtZSBvYmplY3RzIGZvciBhXG4gKiB0aW1lbGluZSBiZXR3ZWVuIGEgc3RhcnQgYW5kIGVuZCB0aW1lLiBUaGUgYnVpbGRlciBzdGFydHMgb2ZmIHdpdGggYW4gaW5pdGlhbCB0aW1lbGluZSBhbmQgZWFjaFxuICogdGltZSB0aGUgQVNUIGNvbWVzIGFjcm9zcyBhIGBncm91cCgpYCwgYGtleWZyYW1lcygpYCBvciBhIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28gd2lodGluIGFcbiAqIGBzZXF1ZW5jZSgpYCB0aGVuIGl0IHdpbGwgZ2VuZXJhdGUgYSBzdWIgdGltZWxpbmUgZm9yIGVhY2ggc3RlcCBhcyB3ZWxsIGFzIGEgbmV3IG9uZSBhZnRlclxuICogdGhleSBhcmUgY29tcGxldGUuXG4gKlxuICogQXMgdGhlIEFTVCBpcyB0cmF2ZXJzZWQsIHRoZSB0aW1pbmcgc3RhdGUgb24gZWFjaCBvZiB0aGUgdGltZWxpbmVzIHdpbGwgYmUgaW5jcmVtZW50ZWQuIElmIGEgc3ViXG4gKiB0aW1lbGluZSB3YXMgY3JlYXRlZCAoYmFzZWQgb24gb25lIG9mIHRoZSBjYXNlcyBhYm92ZSkgdGhlbiB0aGUgcGFyZW50IHRpbWVsaW5lIHdpbGwgYXR0ZW1wdCB0b1xuICogbWVyZ2UgdGhlIHN0eWxlcyB1c2VkIHdpdGhpbiB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIGl0c2VsZiAob25seSB3aXRoIGdyb3VwKCkgdGhpcyB3aWxsIGhhcHBlbikuXG4gKiBUaGlzIGhhcHBlbnMgd2l0aCBhIG1lcmdlIG9wZXJhdGlvbiAobXVjaCBsaWtlIGhvdyB0aGUgbWVyZ2Ugd29ya3MgaW4gbWVyZ2Vzb3J0KSBhbmQgaXQgd2lsbCBvbmx5XG4gKiBjb3B5IHRoZSBtb3N0IHJlY2VudGx5IHVzZWQgc3R5bGVzIGZyb20gdGhlIHN1YiB0aW1lbGluZXMgaW50byB0aGUgcGFyZW50IHRpbWVsaW5lLiBUaGlzIGVuc3VyZXNcbiAqIHRoYXQgaWYgdGhlIHN0eWxlcyBhcmUgdXNlZCBsYXRlciBvbiBpbiBhbm90aGVyIHBoYXNlIG9mIHRoZSBhbmltYXRpb24gdGhlbiB0aGV5IHdpbGwgYmUgdGhlIG1vc3RcbiAqIHVwLXRvLWRhdGUgdmFsdWVzLlxuICpcbiAqIFtIb3cgTWlzc2luZyBTdHlsZXMgQXJlIFVwZGF0ZWRdXG4gKiBFYWNoIHRpbWVsaW5lIGhhcyBhIGBiYWNrRmlsbGAgcHJvcGVydHkgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGZpbGxpbmcgaW4gbmV3IHN0eWxlcyBpbnRvXG4gKiBhbHJlYWR5IHByb2Nlc3NlZCBrZXlmcmFtZXMgaWYgYSBuZXcgc3R5bGUgc2hvd3MgdXAgbGF0ZXIgd2l0aGluIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogYGBgXG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgd2lkdGg6IDAgfSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMTAwIH0pKSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAyMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDMwMCB9KSlcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiA0MDAsIGhlaWdodDogNDAwIH0pKSAvLyBub3RpY2UgaG93IGBoZWlnaHRgIGRvZXNuJ3QgZXhpc3QgYW55d2hlcmVcbiAqIGVsc2VcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBXaGF0IGlzIGhhcHBlbmluZyBoZXJlIGlzIHRoYXQgdGhlIGBoZWlnaHRgIHZhbHVlIGlzIGFkZGVkIGxhdGVyIGluIHRoZSBzZXF1ZW5jZSwgYnV0IGlzIG1pc3NpbmdcbiAqIGZyb20gYWxsIHByZXZpb3VzIGFuaW1hdGlvbiBzdGVwcy4gVGhlcmVmb3JlIHdoZW4gYSBrZXlmcmFtZSBpcyBjcmVhdGVkIGl0IHdvdWxkIGFsc28gYmUgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMga2V5ZnJhbWVzIHVwIHVudGlsIHdoZXJlIGl0IGlzIGZpcnN0IHVzZWQuIEZvciB0aGUgdGltZWxpbmUga2V5ZnJhbWUgZ2VuZXJhdGlvblxuICogdG8gcHJvcGVybHkgZmlsbCBpbiB0aGUgc3R5bGUgaXQgd2lsbCBwbGFjZSB0aGUgcHJldmlvdXMgdmFsdWUgKHRoZSB2YWx1ZSBmcm9tIHRoZSBwYXJlbnRcbiAqIHRpbWVsaW5lKSBvciBhIGRlZmF1bHQgdmFsdWUgb2YgYCpgIGludG8gdGhlIGJhY2tGaWxsIG9iamVjdC4gR2l2ZW4gdGhhdCBlYWNoIG9mIHRoZSBrZXlmcmFtZVxuICogc3R5bGVzIGFyZSBvYmplY3RzIHRoYXQgcHJvdG90eXBpY2FsbHkgaW5oZXJ0IGZyb20gdGhlIGJhY2tGaWxsIG9iamVjdCwgdGhpcyBtZWFucyB0aGF0IGlmIGFcbiAqIHZhbHVlIGlzIGFkZGVkIGludG8gdGhlIGJhY2tGaWxsIHRoZW4gaXQgd2lsbCBhdXRvbWF0aWNhbGx5IHByb3BhZ2F0ZSBhbnkgbWlzc2luZyB2YWx1ZXMgdG8gYWxsXG4gKiBrZXlmcmFtZXMuIFRoZXJlZm9yZSB0aGUgbWlzc2luZyBgaGVpZ2h0YCB2YWx1ZSB3aWxsIGJlIHByb3Blcmx5IGZpbGxlZCBpbnRvIHRoZSBhbHJlYWR5XG4gKiBwcm9jZXNzZWQga2V5ZnJhbWVzLlxuICpcbiAqIFdoZW4gYSBzdWItdGltZWxpbmUgaXMgY3JlYXRlZCBpdCB3aWxsIGhhdmUgaXRzIG93biBiYWNrRmlsbCBwcm9wZXJ0eS4gVGhpcyBpcyBkb25lIHNvIHRoYXRcbiAqIHN0eWxlcyBwcmVzZW50IHdpdGhpbiB0aGUgc3ViLXRpbWVsaW5lIGRvIG5vdCBhY2NpZGVudGFsbHkgc2VlcCBpbnRvIHRoZSBwcmV2aW91cy9mdXR1cmUgdGltZWxpbmVcbiAqIGtleWZyYW1lc1xuICpcbiAqIChGb3IgcHJvdG90eXBpY2FsbHktaW5oZXJpdGVkIGNvbnRlbnRzIHRvIGJlIGRldGVjdGVkIGEgYGZvcihpIGluIG9iailgIGxvb3AgbXVzdCBiZSB1c2VkLilcbiAqXG4gKiBbVmFsaWRhdGlvbl1cbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBub3QgcmVzcG9uc2libGUgZm9yIHZhbGlkYXRpb24uIFRoYXQgZnVuY3Rpb25hbGl0eSBoYXBwZW5zIHdpdGggd2l0aGluXG4gKiB0aGUgYEFuaW1hdGlvblZhbGlkYXRvclZpc2l0b3JgIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFuaW1hdGlvblRpbWVsaW5lcyhcbiAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICBlbnRlckNsYXNzTmFtZTogc3RyaW5nLCBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBzdGFydGluZ1N0eWxlczogybVTdHlsZURhdGEgPSB7fSxcbiAgICBmaW5hbFN0eWxlczogybVTdHlsZURhdGEgPSB7fSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVycm9yczogYW55W10gPSBbXSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gIHJldHVybiBuZXcgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvcigpLmJ1aWxkS2V5ZnJhbWVzKFxuICAgICAgZHJpdmVyLCByb290RWxlbWVudCwgYXN0LCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIHN0YXJ0aW5nU3R5bGVzLCBmaW5hbFN0eWxlcyxcbiAgICAgIG9wdGlvbnMsIHN1Ykluc3RydWN0aW9ucywgZXJyb3JzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRpbWVsaW5lQnVpbGRlclZpc2l0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcm9vdEVsZW1lbnQ6IGFueSwgYXN0OiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPixcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YSxcbiAgICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgICAgZXJyb3JzOiBhbnlbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgICBzdWJJbnN0cnVjdGlvbnMgPSBzdWJJbnN0cnVjdGlvbnMgfHwgbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KFxuICAgICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBzdWJJbnN0cnVjdGlvbnMsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgZXJyb3JzLCBbXSk7XG4gICAgY29udGV4dC5vcHRpb25zID0gb3B0aW9ucztcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zZXRTdHlsZXMoW3N0YXJ0aW5nU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuXG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdCwgY29udGV4dCk7XG5cbiAgICAvLyB0aGlzIGNoZWNrcyB0byBzZWUgaWYgYW4gYWN0dWFsIGFuaW1hdGlvbiBoYXBwZW5lZFxuICAgIGNvbnN0IHRpbWVsaW5lcyA9IGNvbnRleHQudGltZWxpbmVzLmZpbHRlcih0aW1lbGluZSA9PiB0aW1lbGluZS5jb250YWluc0FuaW1hdGlvbigpKTtcbiAgICBpZiAodGltZWxpbmVzLmxlbmd0aCAmJiBPYmplY3Qua2V5cyhmaW5hbFN0eWxlcykubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0bCA9IHRpbWVsaW5lc1t0aW1lbGluZXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoIXRsLmFsbG93T25seVRpbWVsaW5lU3R5bGVzKCkpIHtcbiAgICAgICAgdGwuc2V0U3R5bGVzKFtmaW5hbFN0eWxlc10sIG51bGwsIGNvbnRleHQuZXJyb3JzLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGltZWxpbmVzLmxlbmd0aCA/IHRpbWVsaW5lcy5tYXAodGltZWxpbmUgPT4gdGltZWxpbmUuYnVpbGRLZXlmcmFtZXMoKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24ocm9vdEVsZW1lbnQsIFtdLCBbXSwgW10sIDAsIDAsICcnLCBmYWxzZSldO1xuICB9XG5cbiAgdmlzaXRUcmlnZ2VyKGFzdDogVHJpZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFN0YXRlKGFzdDogU3RhdGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCk6IGFueSB7XG4gICAgLy8gdGhlc2UgdmFsdWVzIGFyZSBub3QgdmlzaXRlZCBpbiB0aGlzIEFTVFxuICB9XG5cbiAgdmlzaXRUcmFuc2l0aW9uKGFzdDogVHJhbnNpdGlvbkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdEFuaW1hdGVDaGlsZChhc3Q6IEFuaW1hdGVDaGlsZEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBlbGVtZW50SW5zdHJ1Y3Rpb25zID0gY29udGV4dC5zdWJJbnN0cnVjdGlvbnMuY29uc3VtZShjb250ZXh0LmVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50SW5zdHJ1Y3Rpb25zKSB7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgICBjb25zdCBlbmRUaW1lID0gdGhpcy5fdmlzaXRTdWJJbnN0cnVjdGlvbnMoXG4gICAgICAgICAgZWxlbWVudEluc3RydWN0aW9ucywgaW5uZXJDb250ZXh0LCBpbm5lckNvbnRleHQub3B0aW9ucyBhcyBBbmltYXRlQ2hpbGRPcHRpb25zKTtcbiAgICAgIGlmIChzdGFydFRpbWUgIT0gZW5kVGltZSkge1xuICAgICAgICAvLyB3ZSBkbyB0aGlzIG9uIHRoZSB1cHBlciBjb250ZXh0IGJlY2F1c2Ugd2UgY3JlYXRlZCBhIHN1YiBjb250ZXh0IGZvclxuICAgICAgICAvLyB0aGUgc3ViIGNoaWxkIGFuaW1hdGlvbnNcbiAgICAgICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZW5kVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRBbmltYXRlUmVmKGFzdDogQW5pbWF0ZVJlZkFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgIGlubmVyQ29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICB0aGlzLnZpc2l0UmVmZXJlbmNlKGFzdC5hbmltYXRpb24sIGlubmVyQ29udGV4dCk7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgIGluc3RydWN0aW9uczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdLCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQsXG4gICAgICBvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zKTogbnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwtY2FzZSBmb3Igd2hlbiBhIHVzZXIgd2FudHMgdG8gc2tpcCBhIHN1YlxuICAgIC8vIGFuaW1hdGlvbiBmcm9tIGJlaW5nIGZpcmVkIGVudGlyZWx5LlxuICAgIGNvbnN0IGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZHVyYXRpb24pIDogbnVsbDtcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgIT0gbnVsbCA/IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KSA6IG51bGw7XG4gICAgaWYgKGR1cmF0aW9uICE9PSAwKSB7XG4gICAgICBpbnN0cnVjdGlvbnMuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uVGltaW5ncyA9XG4gICAgICAgICAgICBjb250ZXh0LmFwcGVuZEluc3RydWN0aW9uVG9UaW1lbGluZShpbnN0cnVjdGlvbiwgZHVyYXRpb24sIGRlbGF5KTtcbiAgICAgICAgZnVydGhlc3RUaW1lID1cbiAgICAgICAgICAgIE1hdGgubWF4KGZ1cnRoZXN0VGltZSwgaW5zdHJ1Y3Rpb25UaW1pbmdzLmR1cmF0aW9uICsgaW5zdHJ1Y3Rpb25UaW1pbmdzLmRlbGF5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmdXJ0aGVzdFRpbWU7XG4gIH1cblxuICB2aXNpdFJlZmVyZW5jZShhc3Q6IFJlZmVyZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29udGV4dC51cGRhdGVPcHRpb25zKGFzdC5vcHRpb25zLCB0cnVlKTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFNlcXVlbmNlKGFzdDogU2VxdWVuY2VBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHN1YkNvbnRleHRDb3VudCA9IGNvbnRleHQuc3ViQ29udGV4dENvdW50O1xuICAgIGxldCBjdHggPSBjb250ZXh0O1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhc3Qub3B0aW9ucztcblxuICAgIGlmIChvcHRpb25zICYmIChvcHRpb25zLnBhcmFtcyB8fCBvcHRpb25zLmRlbGF5KSkge1xuICAgICAgY3R4ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KG9wdGlvbnMpO1xuICAgICAgY3R4LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdHgucHJldmlvdXNOb2RlLnR5cGUgPT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlKSB7XG4gICAgICAgICAgY3R4LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgICAgICBjdHgucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KTtcbiAgICAgICAgY3R4LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhc3Quc3RlcHMubGVuZ3RoKSB7XG4gICAgICBhc3Quc3RlcHMuZm9yRWFjaChzID0+IHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBjdHgpKTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kIHdpdGggYSBzdHlsZSgpIGNhbGxcbiAgICAgIGN0eC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBzb21lIGFuaW1hdGlvbiBmdW5jdGlvbiB3aXRoaW4gdGhlIHNlcXVlbmNlXG4gICAgICAvLyBlbmRlZCB1cCBjcmVhdGluZyBhIHN1YiB0aW1lbGluZSAod2hpY2ggbWVhbnMgdGhlIGN1cnJlbnRcbiAgICAgIC8vIHRpbWVsaW5lIGNhbm5vdCBvdmVybGFwIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBzZXF1ZW5jZSlcbiAgICAgIGlmIChjdHguc3ViQ29udGV4dENvdW50ID4gc3ViQ29udGV4dENvdW50KSB7XG4gICAgICAgIGN0eC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0R3JvdXAoYXN0OiBHcm91cEFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZXM6IFRpbWVsaW5lQnVpbGRlcltdID0gW107XG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGRlbGF5ID0gYXN0Lm9wdGlvbnMgJiYgYXN0Lm9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUoYXN0Lm9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zKTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBzLCBpbm5lckNvbnRleHQpO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICAgIGlubmVyVGltZWxpbmVzLnB1c2goaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIG9wZXJhdGlvbiBpcyBydW4gYWZ0ZXIgdGhlIEFTVCBsb29wIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gaWYgdGhlIHBhcmVudCB0aW1lbGluZSdzIGNvbGxlY3RlZCBzdHlsZXMgd2VyZSB1cGRhdGVkIHRoZW5cbiAgICAvLyBpdCB3b3VsZCBwYXNzIGluIGludmFsaWQgZGF0YSBpbnRvIHRoZSBuZXctdG8tYmUgZm9ya2VkIGl0ZW1zXG4gICAgaW5uZXJUaW1lbGluZXMuZm9yRWFjaChcbiAgICAgICAgdGltZWxpbmUgPT4gY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZSkpO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRpbWluZyhhc3Q6IFRpbWluZ0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGlmICgoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLmR5bmFtaWMpIHtcbiAgICAgIGNvbnN0IHN0clZhbHVlID0gKGFzdCBhcyBEeW5hbWljVGltaW5nQXN0KS5zdHJWYWx1ZTtcbiAgICAgIGNvbnN0IHRpbWluZ1ZhbHVlID1cbiAgICAgICAgICBjb250ZXh0LnBhcmFtcyA/IGludGVycG9sYXRlUGFyYW1zKHN0clZhbHVlLCBjb250ZXh0LnBhcmFtcywgY29udGV4dC5lcnJvcnMpIDogc3RyVmFsdWU7XG4gICAgICByZXR1cm4gcmVzb2x2ZVRpbWluZyh0aW1pbmdWYWx1ZSwgY29udGV4dC5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiBhc3QuZHVyYXRpb24sIGRlbGF5OiBhc3QuZGVsYXksIGVhc2luZzogYXN0LmVhc2luZ307XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBbmltYXRlKGFzdDogQW5pbWF0ZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgdGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5fdmlzaXRUaW1pbmcoYXN0LnRpbWluZ3MsIGNvbnRleHQpO1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKHRpbWluZ3MuZGVsYXkpIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmRlbGF5KTtcbiAgICAgIHRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gYXN0LnN0eWxlO1xuICAgIGlmIChzdHlsZS50eXBlID09IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMpIHtcbiAgICAgIHRoaXMudmlzaXRLZXlmcmFtZXMoc3R5bGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmluY3JlbWVudFRpbWUodGltaW5ncy5kdXJhdGlvbik7XG4gICAgICB0aGlzLnZpc2l0U3R5bGUoc3R5bGUgYXMgU3R5bGVBc3QsIGNvbnRleHQpO1xuICAgICAgdGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBudWxsO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdHlsZShhc3Q6IFN0eWxlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGNvbnN0IHRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyAhO1xuXG4gICAgLy8gdGhpcyBpcyBhIHNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhIHN0eWxlKCkgY2FsbFxuICAgIC8vIGRpcmVjdGx5IGZvbGxvd3MgIGFuIGFuaW1hdGUoKSBjYWxsIChidXQgbm90IGluc2lkZSBvZiBhbiBhbmltYXRlKCkgY2FsbClcbiAgICBpZiAoIXRpbWluZ3MgJiYgdGltZWxpbmUuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCkge1xuICAgICAgdGltZWxpbmUuZm9yd2FyZEZyYW1lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZWFzaW5nID0gKHRpbWluZ3MgJiYgdGltaW5ncy5lYXNpbmcpIHx8IGFzdC5lYXNpbmc7XG4gICAgaWYgKGFzdC5pc0VtcHR5U3RlcCkge1xuICAgICAgdGltZWxpbmUuYXBwbHlFbXB0eVN0ZXAoZWFzaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZWxpbmUuc2V0U3R5bGVzKGFzdC5zdHlsZXMsIGVhc2luZywgY29udGV4dC5lcnJvcnMsIGNvbnRleHQub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEtleWZyYW1lcyhhc3Q6IEtleWZyYW1lc0FzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgY3VycmVudEFuaW1hdGVUaW1pbmdzID0gY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgITtcbiAgICBjb25zdCBzdGFydFRpbWUgPSAoY29udGV4dC5jdXJyZW50VGltZWxpbmUgISkuZHVyYXRpb247XG4gICAgY29uc3QgZHVyYXRpb24gPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZHVyYXRpb247XG4gICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KCk7XG4gICAgY29uc3QgaW5uZXJUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaW5uZXJUaW1lbGluZS5lYXNpbmcgPSBjdXJyZW50QW5pbWF0ZVRpbWluZ3MuZWFzaW5nO1xuXG4gICAgYXN0LnN0eWxlcy5mb3JFYWNoKHN0ZXAgPT4ge1xuICAgICAgY29uc3Qgb2Zmc2V0OiBudW1iZXIgPSBzdGVwLm9mZnNldCB8fCAwO1xuICAgICAgaW5uZXJUaW1lbGluZS5mb3J3YXJkVGltZShvZmZzZXQgKiBkdXJhdGlvbik7XG4gICAgICBpbm5lclRpbWVsaW5lLnNldFN0eWxlcyhzdGVwLnN0eWxlcywgc3RlcC5lYXNpbmcsIGNvbnRleHQuZXJyb3JzLCBjb250ZXh0Lm9wdGlvbnMpO1xuICAgICAgaW5uZXJUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgcGFyZW50IHRpbWVsaW5lIGdldHMgYWxsIHRoZSBzdHlsZXMgZnJvbVxuICAgIC8vIHRoZSBjaGlsZCBldmVuIGlmIHRoZSBuZXcgdGltZWxpbmUgYmVsb3cgaXMgbm90IHVzZWRcbiAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKGlubmVyVGltZWxpbmUpO1xuXG4gICAgLy8gd2UgZG8gdGhpcyBiZWNhdXNlIHRoZSB3aW5kb3cgYmV0d2VlbiB0aGlzIHRpbWVsaW5lIGFuZCB0aGUgc3ViIHRpbWVsaW5lXG4gICAgLy8gc2hvdWxkIGVuc3VyZSB0aGF0IHRoZSBzdHlsZXMgd2l0aGluIGFyZSBleGFjdGx5IHRoZSBzYW1lIGFzIHRoZXkgd2VyZSBiZWZvcmVcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShzdGFydFRpbWUgKyBkdXJhdGlvbik7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFF1ZXJ5KGFzdDogUXVlcnlBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBmaXJzdCBzdGVwIGJlZm9yZSB0aGlzIGlzIGEgc3R5bGUgc3RlcCB3ZSBuZWVkXG4gICAgLy8gdG8gZW5zdXJlIHRoZSBzdHlsZXMgYXJlIGFwcGxpZWQgYmVmb3JlIHRoZSBjaGlsZHJlbiBhcmUgYW5pbWF0ZWRcbiAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICBjb25zdCBvcHRpb25zID0gKGFzdC5vcHRpb25zIHx8IHt9KSBhcyBBbmltYXRpb25RdWVyeU9wdGlvbnM7XG4gICAgY29uc3QgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogMDtcblxuICAgIGlmIChkZWxheSAmJiAoY29udGV4dC5wcmV2aW91c05vZGUudHlwZSA9PT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlIHx8XG4gICAgICAgICAgICAgICAgICAoc3RhcnRUaW1lID09IDAgJiYgY29udGV4dC5jdXJyZW50VGltZWxpbmUuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCkpKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREU7XG4gICAgfVxuXG4gICAgbGV0IGZ1cnRoZXN0VGltZSA9IHN0YXJ0VGltZTtcbiAgICBjb25zdCBlbG1zID0gY29udGV4dC5pbnZva2VRdWVyeShcbiAgICAgICAgYXN0LnNlbGVjdG9yLCBhc3Qub3JpZ2luYWxTZWxlY3RvciwgYXN0LmxpbWl0LCBhc3QuaW5jbHVkZVNlbGYsXG4gICAgICAgIG9wdGlvbnMub3B0aW9uYWwgPyB0cnVlIDogZmFsc2UsIGNvbnRleHQuZXJyb3JzKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSBlbG1zLmxlbmd0aDtcbiAgICBsZXQgc2FtZUVsZW1lbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyfG51bGwgPSBudWxsO1xuICAgIGVsbXMuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuXG4gICAgICBjb250ZXh0LmN1cnJlbnRRdWVyeUluZGV4ID0gaTtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucywgZWxlbWVudCk7XG4gICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgaW5uZXJDb250ZXh0LmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudCA9PT0gY29udGV4dC5lbGVtZW50KSB7XG4gICAgICAgIHNhbWVFbGVtZW50VGltZWxpbmUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgICAgfVxuXG4gICAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcblxuICAgICAgLy8gdGhpcyBpcyBoZXJlIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzdGVwcyBvbmx5IGNvbnRhaW4gb3IgZW5kXG4gICAgICAvLyB3aXRoIGEgc3R5bGUoKSBjYWxsICh3aGljaCBpcyBoZXJlIHRvIHNpZ25hbCB0aGF0IHRoaXMgaXMgYSBwcmVwYXJhdG9yeVxuICAgICAgLy8gY2FsbCB0byBzdHlsZSBhbiBlbGVtZW50IGJlZm9yZSBpdCBpcyBhbmltYXRlZCBhZ2FpbilcbiAgICAgIGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG5cbiAgICAgIGNvbnN0IGVuZFRpbWUgPSBpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgICAgZnVydGhlc3RUaW1lID0gTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBlbmRUaW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSAwO1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSAwO1xuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKGZ1cnRoZXN0VGltZSk7XG5cbiAgICBpZiAoc2FtZUVsZW1lbnRUaW1lbGluZSkge1xuICAgICAgY29udGV4dC5jdXJyZW50VGltZWxpbmUubWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyhzYW1lRWxlbWVudFRpbWVsaW5lKTtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRTdGFnZ2VyKGFzdDogU3RhZ2dlckFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3QgcGFyZW50Q29udGV4dCA9IGNvbnRleHQucGFyZW50Q29udGV4dCAhO1xuICAgIGNvbnN0IHRsID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGFzdC50aW1pbmdzO1xuICAgIGNvbnN0IGR1cmF0aW9uID0gTWF0aC5hYnModGltaW5ncy5kdXJhdGlvbik7XG4gICAgY29uc3QgbWF4VGltZSA9IGR1cmF0aW9uICogKGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgLSAxKTtcbiAgICBsZXQgZGVsYXkgPSBkdXJhdGlvbiAqIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXg7XG5cbiAgICBsZXQgc3RhZ2dlclRyYW5zZm9ybWVyID0gdGltaW5ncy5kdXJhdGlvbiA8IDAgPyAncmV2ZXJzZScgOiB0aW1pbmdzLmVhc2luZztcbiAgICBzd2l0Y2ggKHN0YWdnZXJUcmFuc2Zvcm1lcikge1xuICAgICAgY2FzZSAncmV2ZXJzZSc6XG4gICAgICAgIGRlbGF5ID0gbWF4VGltZSAtIGRlbGF5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgICBkZWxheSA9IHBhcmVudENvbnRleHQuY3VycmVudFN0YWdnZXJUaW1lO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lbGluZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lO1xuICAgIGlmIChkZWxheSkge1xuICAgICAgdGltZWxpbmUuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRpbmdUaW1lID0gdGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgdmlzaXREc2xOb2RlKHRoaXMsIGFzdC5hbmltYXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuXG4gICAgLy8gdGltZSA9IGR1cmF0aW9uICsgZGVsYXlcbiAgICAvLyB0aGUgcmVhc29uIHdoeSB0aGlzIGNvbXB1dGF0aW9uIGlzIHNvIGNvbXBsZXggaXMgYmVjYXVzZVxuICAgIC8vIHRoZSBpbm5lciB0aW1lbGluZSBtYXkgZWl0aGVyIGhhdmUgYSBkZWxheSB2YWx1ZSBvciBhIHN0cmV0Y2hlZFxuICAgIC8vIGtleWZyYW1lIGRlcGVuZGluZyBvbiBpZiBhIHN1YnRpbWVsaW5lIGlzIG5vdCB1c2VkIG9yIGlzIHVzZWQuXG4gICAgcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWUgPVxuICAgICAgICAodGwuY3VycmVudFRpbWUgLSBzdGFydGluZ1RpbWUpICsgKHRsLnN0YXJ0VGltZSAtIHBhcmVudENvbnRleHQuY3VycmVudFRpbWVsaW5lLnN0YXJ0VGltZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBTdHlsZUF0VGltZSA9IHtcbiAgdGltZTogbnVtYmVyOyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyO1xufTtcblxuY29uc3QgREVGQVVMVF9OT09QX1BSRVZJT1VTX05PREUgPSA8QXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4+e307XG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHtcbiAgcHVibGljIHBhcmVudENvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dHxudWxsID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnRUaW1lbGluZTogVGltZWxpbmVCdWlsZGVyO1xuICBwdWJsaWMgY3VycmVudEFuaW1hdGVUaW1pbmdzOiBBbmltYXRlVGltaW5nc3xudWxsID0gbnVsbDtcbiAgcHVibGljIHByZXZpb3VzTm9kZTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4gPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgcHVibGljIHN1YkNvbnRleHRDb3VudCA9IDA7XG4gIHB1YmxpYyBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gIHB1YmxpYyBjdXJyZW50UXVlcnlJbmRleDogbnVtYmVyID0gMDtcbiAgcHVibGljIGN1cnJlbnRRdWVyeVRvdGFsOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFN0YWdnZXJUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksXG4gICAgICBwdWJsaWMgc3ViSW5zdHJ1Y3Rpb25zOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIHByaXZhdGUgX2VudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIF9sZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBwdWJsaWMgZXJyb3JzOiBhbnlbXSwgcHVibGljIHRpbWVsaW5lczogVGltZWxpbmVCdWlsZGVyW10sXG4gICAgICBpbml0aWFsVGltZWxpbmU/OiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IGluaXRpYWxUaW1lbGluZSB8fCBuZXcgVGltZWxpbmVCdWlsZGVyKHRoaXMuX2RyaXZlciwgZWxlbWVudCwgMCk7XG4gICAgdGltZWxpbmVzLnB1c2godGhpcy5jdXJyZW50VGltZWxpbmUpO1xuICB9XG5cbiAgZ2V0IHBhcmFtcygpIHsgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJhbXM7IH1cblxuICB1cGRhdGVPcHRpb25zKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCwgc2tpcElmRXhpc3RzPzogYm9vbGVhbikge1xuICAgIGlmICghb3B0aW9ucykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV3T3B0aW9ucyA9IG9wdGlvbnMgYXMgYW55O1xuICAgIGxldCBvcHRpb25zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBOT1RFOiB0aGlzIHdpbGwgZ2V0IHBhdGNoZWQgdXAgd2hlbiBvdGhlciBhbmltYXRpb24gbWV0aG9kcyBzdXBwb3J0IGR1cmF0aW9uIG92ZXJyaWRlc1xuICAgIGlmIChuZXdPcHRpb25zLmR1cmF0aW9uICE9IG51bGwpIHtcbiAgICAgIChvcHRpb25zVG9VcGRhdGUgYXMgYW55KS5kdXJhdGlvbiA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAobmV3T3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zVG9VcGRhdGUuZGVsYXkgPSByZXNvbHZlVGltaW5nVmFsdWUobmV3T3B0aW9ucy5kZWxheSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGFyYW1zID0gbmV3T3B0aW9ucy5wYXJhbXM7XG4gICAgaWYgKG5ld1BhcmFtcykge1xuICAgICAgbGV0IHBhcmFtc1RvVXBkYXRlOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSBvcHRpb25zVG9VcGRhdGUucGFyYW1zICE7XG4gICAgICBpZiAoIXBhcmFtc1RvVXBkYXRlKSB7XG4gICAgICAgIHBhcmFtc1RvVXBkYXRlID0gdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBPYmplY3Qua2V5cyhuZXdQYXJhbXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGlmICghc2tpcElmRXhpc3RzIHx8ICFwYXJhbXNUb1VwZGF0ZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgIHBhcmFtc1RvVXBkYXRlW25hbWVdID0gaW50ZXJwb2xhdGVQYXJhbXMobmV3UGFyYW1zW25hbWVdLCBwYXJhbXNUb1VwZGF0ZSwgdGhpcy5lcnJvcnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb3B5T3B0aW9ucygpIHtcbiAgICBjb25zdCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge307XG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgY29uc3Qgb2xkUGFyYW1zID0gdGhpcy5vcHRpb25zLnBhcmFtcztcbiAgICAgIGlmIChvbGRQYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0gPSBvcHRpb25zWydwYXJhbXMnXSA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhvbGRQYXJhbXMpLmZvckVhY2gobmFtZSA9PiB7IHBhcmFtc1tuYW1lXSA9IG9sZFBhcmFtc1tuYW1lXTsgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgY3JlYXRlU3ViQ29udGV4dChvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGwgPSBudWxsLCBlbGVtZW50PzogYW55LCBuZXdUaW1lPzogbnVtYmVyKTpcbiAgICAgIEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZWxlbWVudCB8fCB0aGlzLmVsZW1lbnQ7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgdGFyZ2V0LCB0aGlzLnN1Ykluc3RydWN0aW9ucywgdGhpcy5fZW50ZXJDbGFzc05hbWUsIHRoaXMuX2xlYXZlQ2xhc3NOYW1lLFxuICAgICAgICB0aGlzLmVycm9ycywgdGhpcy50aW1lbGluZXMsIHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGFyZ2V0LCBuZXdUaW1lIHx8IDApKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IHRoaXMucHJldmlvdXNOb2RlO1xuICAgIGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzID0gdGhpcy5jdXJyZW50QW5pbWF0ZVRpbWluZ3M7XG5cbiAgICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLl9jb3B5T3B0aW9ucygpO1xuICAgIGNvbnRleHQudXBkYXRlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSB0aGlzLmN1cnJlbnRRdWVyeUluZGV4O1xuICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5VG90YWwgPSB0aGlzLmN1cnJlbnRRdWVyeVRvdGFsO1xuICAgIGNvbnRleHQucGFyZW50Q29udGV4dCA9IHRoaXM7XG4gICAgdGhpcy5zdWJDb250ZXh0Q291bnQrKztcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuXG4gIHRyYW5zZm9ybUludG9OZXdUaW1lbGluZShuZXdUaW1lPzogbnVtYmVyKSB7XG4gICAgdGhpcy5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZSA9IHRoaXMuY3VycmVudFRpbWVsaW5lLmZvcmsodGhpcy5lbGVtZW50LCBuZXdUaW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKHRoaXMuY3VycmVudFRpbWVsaW5lKTtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZWxpbmU7XG4gIH1cblxuICBhcHBlbmRJbnN0cnVjdGlvblRvVGltZWxpbmUoXG4gICAgICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwgZHVyYXRpb246IG51bWJlcnxudWxsLFxuICAgICAgZGVsYXk6IG51bWJlcnxudWxsKTogQW5pbWF0ZVRpbWluZ3Mge1xuICAgIGNvbnN0IHVwZGF0ZWRUaW1pbmdzOiBBbmltYXRlVGltaW5ncyA9IHtcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAhPSBudWxsID8gZHVyYXRpb24gOiBpbnN0cnVjdGlvbi5kdXJhdGlvbixcbiAgICAgIGRlbGF5OiB0aGlzLmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZSArIChkZWxheSAhPSBudWxsID8gZGVsYXkgOiAwKSArIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgZWFzaW5nOiAnJ1xuICAgIH07XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTdWJUaW1lbGluZUJ1aWxkZXIoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgaW5zdHJ1Y3Rpb24uZWxlbWVudCwgaW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBpbnN0cnVjdGlvbi5wcmVTdHlsZVByb3BzLFxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcywgdXBkYXRlZFRpbWluZ3MsIGluc3RydWN0aW9uLnN0cmV0Y2hTdGFydGluZ0tleWZyYW1lKTtcbiAgICB0aGlzLnRpbWVsaW5lcy5wdXNoKGJ1aWxkZXIpO1xuICAgIHJldHVybiB1cGRhdGVkVGltaW5ncztcbiAgfVxuXG4gIGluY3JlbWVudFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZWxpbmUuZHVyYXRpb24gKyB0aW1lKTtcbiAgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIG5lZ2F0aXZlIGRlbGF5cyBhcmUgbm90IHlldCBzdXBwb3J0ZWRcbiAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG4gIH1cblxuICBpbnZva2VRdWVyeShcbiAgICAgIHNlbGVjdG9yOiBzdHJpbmcsIG9yaWdpbmFsU2VsZWN0b3I6IHN0cmluZywgbGltaXQ6IG51bWJlciwgaW5jbHVkZVNlbGY6IGJvb2xlYW4sXG4gICAgICBvcHRpb25hbDogYm9vbGVhbiwgZXJyb3JzOiBhbnlbXSk6IGFueVtdIHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAoaW5jbHVkZVNlbGYpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkgeyAgLy8gaWYgOnNlbGYgaXMgb25seSB1c2VkIHRoZW4gdGhlIHNlbGVjdG9yIGlzIGVtcHR5XG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoRU5URVJfVE9LRU5fUkVHRVgsICcuJyArIHRoaXMuX2VudGVyQ2xhc3NOYW1lKTtcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShMRUFWRV9UT0tFTl9SRUdFWCwgJy4nICsgdGhpcy5fbGVhdmVDbGFzc05hbWUpO1xuICAgICAgY29uc3QgbXVsdGkgPSBsaW1pdCAhPSAxO1xuICAgICAgbGV0IGVsZW1lbnRzID0gdGhpcy5fZHJpdmVyLnF1ZXJ5KHRoaXMuZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgICAgIGlmIChsaW1pdCAhPT0gMCkge1xuICAgICAgICBlbGVtZW50cyA9IGxpbWl0IDwgMCA/IGVsZW1lbnRzLnNsaWNlKGVsZW1lbnRzLmxlbmd0aCArIGxpbWl0LCBlbGVtZW50cy5sZW5ndGgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICB9XG4gICAgICByZXN1bHRzLnB1c2goLi4uZWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9uYWwgJiYgcmVzdWx0cy5sZW5ndGggPT0gMCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgYFxcYHF1ZXJ5KFwiJHtvcmlnaW5hbFNlbGVjdG9yfVwiKVxcYCByZXR1cm5lZCB6ZXJvIGVsZW1lbnRzLiAoVXNlIFxcYHF1ZXJ5KFwiJHtvcmlnaW5hbFNlbGVjdG9yfVwiLCB7IG9wdGlvbmFsOiB0cnVlIH0pXFxgIGlmIHlvdSB3aXNoIHRvIGFsbG93IHRoaXMuKWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgZHVyYXRpb246IG51bWJlciA9IDA7XG4gIHB1YmxpYyBlYXNpbmc6IHN0cmluZ3xudWxsO1xuICBwcml2YXRlIF9wcmV2aW91c0tleWZyYW1lOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9jdXJyZW50S2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2tleWZyYW1lcyA9IG5ldyBNYXA8bnVtYmVyLCDJtVN0eWxlRGF0YT4oKTtcbiAgcHJpdmF0ZSBfc3R5bGVTdW1tYXJ5OiB7W3Byb3A6IHN0cmluZ106IFN0eWxlQXRUaW1lfSA9IHt9O1xuICBwcml2YXRlIF9sb2NhbFRpbWVsaW5lU3R5bGVzOiDJtVN0eWxlRGF0YTtcbiAgcHJpdmF0ZSBfZ2xvYmFsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhO1xuICBwcml2YXRlIF9wZW5kaW5nU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9iYWNrRmlsbDogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfY3VycmVudEVtcHR5U3RlcEtleWZyYW1lOiDJtVN0eWxlRGF0YXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgc3RhcnRUaW1lOiBudW1iZXIsXG4gICAgICBwcml2YXRlIF9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXA/OiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pIHtcbiAgICBpZiAoIXRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCkge1xuICAgICAgdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuICAgIH1cblxuICAgIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMgPSBPYmplY3QuY3JlYXRlKHRoaXMuX2JhY2tGaWxsLCB7fSk7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMgPSB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuZ2V0KGVsZW1lbnQpICE7XG4gICAgaWYgKCF0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcykge1xuICAgICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMgPSB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzO1xuICAgICAgdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwLnNldChlbGVtZW50LCB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzKTtcbiAgICB9XG4gICAgdGhpcy5fbG9hZEtleWZyYW1lKCk7XG4gIH1cblxuICBjb250YWluc0FuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICBzd2l0Y2ggKHRoaXMuX2tleWZyYW1lcy5zaXplKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFN0eWxlUHJvcGVydGllcygpLmxlbmd0aCA+IDA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBnZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRLZXlmcmFtZSk7IH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7IHJldHVybiB0aGlzLnN0YXJ0VGltZSArIHRoaXMuZHVyYXRpb247IH1cblxuICBkZWxheU5leHRTdGVwKGRlbGF5OiBudW1iZXIpIHtcbiAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCBhIHN0eWxlKCkgc3RlcCBpcyBwbGFjZWQgcmlnaHQgYmVmb3JlIGEgc3RhZ2dlcigpXG4gICAgLy8gYW5kIHRoYXQgc3R5bGUoKSBzdGVwIGlzIHRoZSB2ZXJ5IGZpcnN0IHN0eWxlKCkgdmFsdWUgaW4gdGhlIGFuaW1hdGlvblxuICAgIC8vIHRoZW4gd2UgbmVlZCB0byBtYWtlIGEgY29weSBvZiB0aGUga2V5ZnJhbWUgWzAsIGNvcHksIDFdIHNvIHRoYXQgdGhlIGRlbGF5XG4gICAgLy8gcHJvcGVybHkgYXBwbGllcyB0aGUgc3R5bGUoKSB2YWx1ZXMgdG8gd29yayB3aXRoIHRoZSBzdGFnZ2VyLi4uXG4gICAgY29uc3QgaGFzUHJlU3R5bGVTdGVwID0gdGhpcy5fa2V5ZnJhbWVzLnNpemUgPT0gMSAmJiBPYmplY3Qua2V5cyh0aGlzLl9wZW5kaW5nU3R5bGVzKS5sZW5ndGg7XG5cbiAgICBpZiAodGhpcy5kdXJhdGlvbiB8fCBoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgIHRoaXMuZm9yd2FyZFRpbWUodGhpcy5jdXJyZW50VGltZSArIGRlbGF5KTtcbiAgICAgIGlmIChoYXNQcmVTdHlsZVN0ZXApIHtcbiAgICAgICAgdGhpcy5zbmFwc2hvdEN1cnJlbnRTdHlsZXMoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFRpbWUgKz0gZGVsYXk7XG4gICAgfVxuICB9XG5cbiAgZm9yayhlbGVtZW50OiBhbnksIGN1cnJlbnRUaW1lPzogbnVtYmVyKTogVGltZWxpbmVCdWlsZGVyIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIHJldHVybiBuZXcgVGltZWxpbmVCdWlsZGVyKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIGVsZW1lbnQsIGN1cnJlbnRUaW1lIHx8IHRoaXMuY3VycmVudFRpbWUsIHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cCk7XG4gIH1cblxuICBwcml2YXRlIF9sb2FkS2V5ZnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRLZXlmcmFtZSkge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZSA9IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEtleWZyYW1lID0gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKSAhO1xuICAgIGlmICghdGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUgPSBPYmplY3QuY3JlYXRlKHRoaXMuX2JhY2tGaWxsLCB7fSk7XG4gICAgICB0aGlzLl9rZXlmcmFtZXMuc2V0KHRoaXMuZHVyYXRpb24sIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZEZyYW1lKCkge1xuICAgIHRoaXMuZHVyYXRpb24gKz0gT05FX0ZSQU1FX0lOX01JTExJU0VDT05EUztcbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGZvcndhcmRUaW1lKHRpbWU6IG51bWJlcikge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgdGhpcy5kdXJhdGlvbiA9IHRpbWU7XG4gICAgdGhpcy5fbG9hZEtleWZyYW1lKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVTdHlsZShwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd8bnVtYmVyKSB7XG4gICAgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlc1twcm9wXSA9IHZhbHVlO1xuICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzW3Byb3BdID0gdmFsdWU7XG4gICAgdGhpcy5fc3R5bGVTdW1tYXJ5W3Byb3BdID0ge3RpbWU6IHRoaXMuY3VycmVudFRpbWUsIHZhbHVlfTtcbiAgfVxuXG4gIGFsbG93T25seVRpbWVsaW5lU3R5bGVzKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudEVtcHR5U3RlcEtleWZyYW1lICE9PSB0aGlzLl9jdXJyZW50S2V5ZnJhbWU7IH1cblxuICBhcHBseUVtcHR5U3RlcChlYXNpbmc6IHN0cmluZ3xudWxsKSB7XG4gICAgaWYgKGVhc2luZykge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZVsnZWFzaW5nJ10gPSBlYXNpbmc7XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciBhbmltYXRlKGR1cmF0aW9uKTpcbiAgICAvLyBhbGwgbWlzc2luZyBzdHlsZXMgYXJlIGZpbGxlZCB3aXRoIGEgYCpgIHZhbHVlIHRoZW5cbiAgICAvLyBpZiBhbnkgZGVzdGluYXRpb24gc3R5bGVzIGFyZSBmaWxsZWQgaW4gbGF0ZXIgb24gdGhlIHNhbWVcbiAgICAvLyBrZXlmcmFtZSB0aGVuIHRoZXkgd2lsbCBvdmVycmlkZSB0aGUgb3ZlcnJpZGRlbiBzdHlsZXNcbiAgICAvLyBXZSB1c2UgYF9nbG9iYWxUaW1lbGluZVN0eWxlc2AgaGVyZSBiZWNhdXNlIHRoZXJlIG1heSBiZVxuICAgIC8vIHN0eWxlcyBpbiBwcmV2aW91cyBrZXlmcmFtZXMgdGhhdCBhcmUgbm90IHByZXNlbnQgaW4gdGhpcyB0aW1lbGluZVxuICAgIE9iamVjdC5rZXlzKHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fYmFja0ZpbGxbcHJvcF0gPSB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlc1twcm9wXSB8fCBBVVRPX1NUWUxFO1xuICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lW3Byb3BdID0gQVVUT19TVFlMRTtcbiAgICB9KTtcbiAgICB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgPSB0aGlzLl9jdXJyZW50S2V5ZnJhbWU7XG4gIH1cblxuICBzZXRTdHlsZXMoXG4gICAgICBpbnB1dDogKMm1U3R5bGVEYXRhfHN0cmluZylbXSwgZWFzaW5nOiBzdHJpbmd8bnVsbCwgZXJyb3JzOiBhbnlbXSxcbiAgICAgIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zKSB7XG4gICAgaWYgKGVhc2luZykge1xuICAgICAgdGhpcy5fcHJldmlvdXNLZXlmcmFtZVsnZWFzaW5nJ10gPSBlYXNpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5wYXJhbXMpIHx8IHt9O1xuICAgIGNvbnN0IHN0eWxlcyA9IGZsYXR0ZW5TdHlsZXMoaW5wdXQsIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKTtcbiAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBpbnRlcnBvbGF0ZVBhcmFtcyhzdHlsZXNbcHJvcF0sIHBhcmFtcywgZXJyb3JzKTtcbiAgICAgIHRoaXMuX3BlbmRpbmdTdHlsZXNbcHJvcF0gPSB2YWw7XG4gICAgICBpZiAoIXRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgdGhpcy5fYmFja0ZpbGxbcHJvcF0gPSB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSA/XG4gICAgICAgICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlc1twcm9wXSA6XG4gICAgICAgICAgICBBVVRPX1NUWUxFO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlU3R5bGUocHJvcCwgdmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpIHtcbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLl9wZW5kaW5nU3R5bGVzO1xuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoc3R5bGVzKTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID09IDApIHJldHVybjtcblxuICAgIHRoaXMuX3BlbmRpbmdTdHlsZXMgPSB7fTtcblxuICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBzdHlsZXNbcHJvcF07XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWVbcHJvcF0gPSB2YWw7XG4gICAgfSk7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9jdXJyZW50S2V5ZnJhbWUuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudEtleWZyYW1lW3Byb3BdID0gdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlc1twcm9wXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNuYXBzaG90Q3VycmVudFN0eWxlcygpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsID0gdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlc1twcm9wXTtcbiAgICAgIHRoaXMuX3BlbmRpbmdTdHlsZXNbcHJvcF0gPSB2YWw7XG4gICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCB2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmluYWxLZXlmcmFtZSgpIHsgcmV0dXJuIHRoaXMuX2tleWZyYW1lcy5nZXQodGhpcy5kdXJhdGlvbik7IH1cblxuICBnZXQgcHJvcGVydGllcygpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3AgaW4gdGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2gocHJvcCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgbWVyZ2VUaW1lbGluZUNvbGxlY3RlZFN0eWxlcyh0aW1lbGluZTogVGltZWxpbmVCdWlsZGVyKSB7XG4gICAgT2JqZWN0LmtleXModGltZWxpbmUuX3N0eWxlU3VtbWFyeSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGRldGFpbHMwID0gdGhpcy5fc3R5bGVTdW1tYXJ5W3Byb3BdO1xuICAgICAgY29uc3QgZGV0YWlsczEgPSB0aW1lbGluZS5fc3R5bGVTdW1tYXJ5W3Byb3BdO1xuICAgICAgaWYgKCFkZXRhaWxzMCB8fCBkZXRhaWxzMS50aW1lID4gZGV0YWlsczAudGltZSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCBkZXRhaWxzMS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBidWlsZEtleWZyYW1lcygpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uIHtcbiAgICB0aGlzLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIGNvbnN0IHByZVN0eWxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBwb3N0U3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGlzRW1wdHkgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PT0gMSAmJiB0aGlzLmR1cmF0aW9uID09PSAwO1xuXG4gICAgbGV0IGZpbmFsS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gICAgdGhpcy5fa2V5ZnJhbWVzLmZvckVhY2goKGtleWZyYW1lLCB0aW1lKSA9PiB7XG4gICAgICBjb25zdCBmaW5hbEtleWZyYW1lID0gY29weVN0eWxlcyhrZXlmcmFtZSwgdHJ1ZSk7XG4gICAgICBPYmplY3Qua2V5cyhmaW5hbEtleWZyYW1lKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGZpbmFsS2V5ZnJhbWVbcHJvcF07XG4gICAgICAgIGlmICh2YWx1ZSA9PSBQUkVfU1RZTEUpIHtcbiAgICAgICAgICBwcmVTdHlsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PSBBVVRPX1NUWUxFKSB7XG4gICAgICAgICAgcG9zdFN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghaXNFbXB0eSkge1xuICAgICAgICBmaW5hbEtleWZyYW1lWydvZmZzZXQnXSA9IHRpbWUgLyB0aGlzLmR1cmF0aW9uO1xuICAgICAgfVxuICAgICAgZmluYWxLZXlmcmFtZXMucHVzaChmaW5hbEtleWZyYW1lKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHByZVByb3BzOiBzdHJpbmdbXSA9IHByZVN0eWxlUHJvcHMuc2l6ZSA/IGl0ZXJhdG9yVG9BcnJheShwcmVTdHlsZVByb3BzLnZhbHVlcygpKSA6IFtdO1xuICAgIGNvbnN0IHBvc3RQcm9wczogc3RyaW5nW10gPSBwb3N0U3R5bGVQcm9wcy5zaXplID8gaXRlcmF0b3JUb0FycmF5KHBvc3RTdHlsZVByb3BzLnZhbHVlcygpKSA6IFtdO1xuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciBhIDAtc2Vjb25kIGFuaW1hdGlvbiAod2hpY2ggaXMgZGVzaWduZWQganVzdCB0byBwbGFjZSBzdHlsZXMgb25zY3JlZW4pXG4gICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgIGNvbnN0IGtmMCA9IGZpbmFsS2V5ZnJhbWVzWzBdO1xuICAgICAgY29uc3Qga2YxID0gY29weU9iaihrZjApO1xuICAgICAga2YwWydvZmZzZXQnXSA9IDA7XG4gICAgICBrZjFbJ29mZnNldCddID0gMTtcbiAgICAgIGZpbmFsS2V5ZnJhbWVzID0gW2tmMCwga2YxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihcbiAgICAgICAgdGhpcy5lbGVtZW50LCBmaW5hbEtleWZyYW1lcywgcHJlUHJvcHMsIHBvc3RQcm9wcywgdGhpcy5kdXJhdGlvbiwgdGhpcy5zdGFydFRpbWUsXG4gICAgICAgIHRoaXMuZWFzaW5nLCBmYWxzZSk7XG4gIH1cbn1cblxuY2xhc3MgU3ViVGltZWxpbmVCdWlsZGVyIGV4dGVuZHMgVGltZWxpbmVCdWlsZGVyIHtcbiAgcHVibGljIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwdWJsaWMgcHJlU3R5bGVQcm9wczogc3RyaW5nW10sIHB1YmxpYyBwb3N0U3R5bGVQcm9wczogc3RyaW5nW10sIHRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzLFxuICAgICAgcHJpdmF0ZSBfc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHN1cGVyKGRyaXZlciwgZWxlbWVudCwgdGltaW5ncy5kZWxheSk7XG4gICAgdGhpcy50aW1pbmdzID0ge2R1cmF0aW9uOiB0aW1pbmdzLmR1cmF0aW9uLCBkZWxheTogdGltaW5ncy5kZWxheSwgZWFzaW5nOiB0aW1pbmdzLmVhc2luZ307XG4gIH1cblxuICBjb250YWluc0FuaW1hdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMua2V5ZnJhbWVzLmxlbmd0aCA+IDE7IH1cblxuICBidWlsZEtleWZyYW1lcygpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uIHtcbiAgICBsZXQga2V5ZnJhbWVzID0gdGhpcy5rZXlmcmFtZXM7XG4gICAgbGV0IHtkZWxheSwgZHVyYXRpb24sIGVhc2luZ30gPSB0aGlzLnRpbWluZ3M7XG4gICAgaWYgKHRoaXMuX3N0cmV0Y2hTdGFydGluZ0tleWZyYW1lICYmIGRlbGF5KSB7XG4gICAgICBjb25zdCBuZXdLZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10gPSBbXTtcbiAgICAgIGNvbnN0IHRvdGFsVGltZSA9IGR1cmF0aW9uICsgZGVsYXk7XG4gICAgICBjb25zdCBzdGFydGluZ0dhcCA9IGRlbGF5IC8gdG90YWxUaW1lO1xuXG4gICAgICAvLyB0aGUgb3JpZ2luYWwgc3RhcnRpbmcga2V5ZnJhbWUgbm93IHN0YXJ0cyBvbmNlIHRoZSBkZWxheSBpcyBkb25lXG4gICAgICBjb25zdCBuZXdGaXJzdEtleWZyYW1lID0gY29weVN0eWxlcyhrZXlmcmFtZXNbMF0sIGZhbHNlKTtcbiAgICAgIG5ld0ZpcnN0S2V5ZnJhbWVbJ29mZnNldCddID0gMDtcbiAgICAgIG5ld0tleWZyYW1lcy5wdXNoKG5ld0ZpcnN0S2V5ZnJhbWUpO1xuXG4gICAgICBjb25zdCBvbGRGaXJzdEtleWZyYW1lID0gY29weVN0eWxlcyhrZXlmcmFtZXNbMF0sIGZhbHNlKTtcbiAgICAgIG9sZEZpcnN0S2V5ZnJhbWVbJ29mZnNldCddID0gcm91bmRPZmZzZXQoc3RhcnRpbmdHYXApO1xuICAgICAgbmV3S2V5ZnJhbWVzLnB1c2gob2xkRmlyc3RLZXlmcmFtZSk7XG5cbiAgICAgIC8qXG4gICAgICAgIFdoZW4gdGhlIGtleWZyYW1lIGlzIHN0cmV0Y2hlZCB0aGVuIGl0IG1lYW5zIHRoYXQgdGhlIGRlbGF5IGJlZm9yZSB0aGUgYW5pbWF0aW9uXG4gICAgICAgIHN0YXJ0cyBpcyBnb25lLiBJbnN0ZWFkIHRoZSBmaXJzdCBrZXlmcmFtZSBpcyBwbGFjZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBhbmltYXRpb25cbiAgICAgICAgYW5kIGl0IGlzIHRoZW4gY29waWVkIHRvIHdoZXJlIGl0IHN0YXJ0cyB3aGVuIHRoZSBvcmlnaW5hbCBkZWxheSBpcyBvdmVyLiBUaGlzIGJhc2ljYWxseVxuICAgICAgICBtZWFucyBub3RoaW5nIGFuaW1hdGVzIGR1cmluZyB0aGF0IGRlbGF5LCBidXQgdGhlIHN0eWxlcyBhcmUgc3RpbGwgcmVuZGVyZXJlZC4gRm9yIHRoaXNcbiAgICAgICAgdG8gd29yayB0aGUgb3JpZ2luYWwgb2Zmc2V0IHZhbHVlcyB0aGF0IGV4aXN0IGluIHRoZSBvcmlnaW5hbCBrZXlmcmFtZXMgbXVzdCBiZSBcIndhcnBlZFwiXG4gICAgICAgIHNvIHRoYXQgdGhleSBjYW4gdGFrZSB0aGUgbmV3IGtleWZyYW1lICsgZGVsYXkgaW50byBhY2NvdW50LlxuXG4gICAgICAgIGRlbGF5PTEwMDAsIGR1cmF0aW9uPTEwMDAsIGtleWZyYW1lcyA9IDAgLjUgMVxuXG4gICAgICAgIHR1cm5zIGludG9cblxuICAgICAgICBkZWxheT0wLCBkdXJhdGlvbj0yMDAwLCBrZXlmcmFtZXMgPSAwIC4zMyAuNjYgMVxuICAgICAgICovXG5cbiAgICAgIC8vIG9mZnNldHMgYmV0d2VlbiAxIC4uLiBuIC0xIGFyZSBhbGwgd2FycGVkIGJ5IHRoZSBrZXlmcmFtZSBzdHJldGNoXG4gICAgICBjb25zdCBsaW1pdCA9IGtleWZyYW1lcy5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbGltaXQ7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBjb3B5U3R5bGVzKGtleWZyYW1lc1tpXSwgZmFsc2UpO1xuICAgICAgICBjb25zdCBvbGRPZmZzZXQgPSBrZlsnb2Zmc2V0J10gYXMgbnVtYmVyO1xuICAgICAgICBjb25zdCB0aW1lQXRLZXlmcmFtZSA9IGRlbGF5ICsgb2xkT2Zmc2V0ICogZHVyYXRpb247XG4gICAgICAgIGtmWydvZmZzZXQnXSA9IHJvdW5kT2Zmc2V0KHRpbWVBdEtleWZyYW1lIC8gdG90YWxUaW1lKTtcbiAgICAgICAgbmV3S2V5ZnJhbWVzLnB1c2goa2YpO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgbmV3IHN0YXJ0aW5nIGtleWZyYW1lIHNob3VsZCBiZSBhZGRlZCBhdCB0aGUgc3RhcnRcbiAgICAgIGR1cmF0aW9uID0gdG90YWxUaW1lO1xuICAgICAgZGVsYXkgPSAwO1xuICAgICAgZWFzaW5nID0gJyc7XG5cbiAgICAgIGtleWZyYW1lcyA9IG5ld0tleWZyYW1lcztcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihcbiAgICAgICAgdGhpcy5lbGVtZW50LCBrZXlmcmFtZXMsIHRoaXMucHJlU3R5bGVQcm9wcywgdGhpcy5wb3N0U3R5bGVQcm9wcywgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsXG4gICAgICAgIHRydWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kT2Zmc2V0KG9mZnNldDogbnVtYmVyLCBkZWNpbWFsUG9pbnRzID0gMyk6IG51bWJlciB7XG4gIGNvbnN0IG11bHQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbFBvaW50cyAtIDEpO1xuICByZXR1cm4gTWF0aC5yb3VuZChvZmZzZXQgKiBtdWx0KSAvIG11bHQ7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5TdHlsZXMoaW5wdXQ6ICjJtVN0eWxlRGF0YSB8IHN0cmluZylbXSwgYWxsU3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIGxldCBhbGxQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcbiAgaW5wdXQuZm9yRWFjaCh0b2tlbiA9PiB7XG4gICAgaWYgKHRva2VuID09PSAnKicpIHtcbiAgICAgIGFsbFByb3BlcnRpZXMgPSBhbGxQcm9wZXJ0aWVzIHx8IE9iamVjdC5rZXlzKGFsbFN0eWxlcyk7XG4gICAgICBhbGxQcm9wZXJ0aWVzLmZvckVhY2gocHJvcCA9PiB7IHN0eWxlc1twcm9wXSA9IEFVVE9fU1RZTEU7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb3B5U3R5bGVzKHRva2VuIGFzIMm1U3R5bGVEYXRhLCBmYWxzZSwgc3R5bGVzKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3R5bGVzO1xufVxuIl19