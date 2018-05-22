import * as tslib_1 from "tslib";
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
        var timings = (context.currentAnimateTimings);
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
        var currentAnimateTimings = (context.currentAnimateTimings);
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
        var parentContext = (context.parentContext);
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
            var paramsToUpdate_1 = (optionsToUpdate.params);
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
        if (selector.length > 0) { // if :self is only used then the selector is empty
            // if :self is only used then the selector is empty
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
        this._globalTimelineStyles = (this._elementTimelineStylesLookup.get(element));
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
        this._currentKeyframe = (this._keyframes.get(this.duration));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBdUcsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBR3pMLE9BQU8sRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR2pJLE9BQU8sRUFBK0IseUJBQXlCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN6RyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxJQUFNLHlCQUF5QixHQUFHLENBQUMsQ0FBQztBQUNwQyxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUM7QUFDN0IsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkQsSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDO0FBQzdCLElBQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0Z2RCxNQUFNLGtDQUNGLE1BQXVCLEVBQUUsV0FBZ0IsRUFBRSxHQUErQixFQUMxRSxjQUFzQixFQUFFLGNBQXNCLEVBQUUsY0FBK0IsRUFDL0UsV0FBNEIsRUFBRSxPQUF5QixFQUN2RCxlQUF1QyxFQUFFLE1BQWtCO0lB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QUFlLEVBbUUvQyxDQUFBO0FBRUQscUJBQXFCLE1BQWMsRUFBRSxhQUFpQjtJQUFqQiw4QkFBQSxFQUFBLGlCQUFpQjtJQUNwRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDekM7QUFFRCx1QkFBdUIsS0FBOEIsRUFBRSxTQUFxQjtJQUMxRSxJQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7SUFDOUIsSUFBSSxhQUF1QixDQUFDO0lBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO1FBQ2pCLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUNqQixhQUFhLEdBQUcsYUFBYSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO2FBQU07WUFDTCxVQUFVLENBQUMsS0FBbUIsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDaEQ7S0FDRixDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztDQUNmIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRlQ2hpbGRPcHRpb25zLCBBbmltYXRlVGltaW5ncywgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25RdWVyeU9wdGlvbnMsIMm1UFJFX1NUWUxFIGFzIFBSRV9TVFlMRSwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtjb3B5T2JqLCBjb3B5U3R5bGVzLCBpbnRlcnBvbGF0ZVBhcmFtcywgaXRlcmF0b3JUb0FycmF5LCByZXNvbHZlVGltaW5nLCByZXNvbHZlVGltaW5nVmFsdWUsIHZpc2l0RHNsTm9kZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0ZUFzdCwgQW5pbWF0ZUNoaWxkQXN0LCBBbmltYXRlUmVmQXN0LCBBc3QsIEFzdFZpc2l0b3IsIER5bmFtaWNUaW1pbmdBc3QsIEdyb3VwQXN0LCBLZXlmcmFtZXNBc3QsIFF1ZXJ5QXN0LCBSZWZlcmVuY2VBc3QsIFNlcXVlbmNlQXN0LCBTdGFnZ2VyQXN0LCBTdGF0ZUFzdCwgU3R5bGVBc3QsIFRpbWluZ0FzdCwgVHJhbnNpdGlvbkFzdCwgVHJpZ2dlckFzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiwgY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4vZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuXG5jb25zdCBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTID0gMTtcbmNvbnN0IEVOVEVSX1RPS0VOID0gJzplbnRlcic7XG5jb25zdCBFTlRFUl9UT0tFTl9SRUdFWCA9IG5ldyBSZWdFeHAoRU5URVJfVE9LRU4sICdnJyk7XG5jb25zdCBMRUFWRV9UT0tFTiA9ICc6bGVhdmUnO1xuY29uc3QgTEVBVkVfVE9LRU5fUkVHRVggPSBuZXcgUmVnRXhwKExFQVZFX1RPS0VOLCAnZycpO1xuXG4vKlxuICogVGhlIGNvZGUgd2l0aGluIHRoaXMgZmlsZSBhaW1zIHRvIGdlbmVyYXRlIHdlYi1hbmltYXRpb25zLWNvbXBhdGlibGUga2V5ZnJhbWVzIGZyb20gQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGNvZGUuXG4gKlxuICogVGhlIGNvZGUgYmVsb3cgd2lsbCBiZSBjb252ZXJ0ZWQgZnJvbTpcbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBUbzpcbiAqIGBgYFxuICoga2V5ZnJhbWVzID0gW3sgb3BhY2l0eTogMCwgb2Zmc2V0OiAwIH0sIHsgb3BhY2l0eTogMSwgb2Zmc2V0OiAxIH1dXG4gKiBkdXJhdGlvbiA9IDEwMDBcbiAqIGRlbGF5ID0gMFxuICogZWFzaW5nID0gJydcbiAqIGBgYFxuICpcbiAqIEZvciB0aGlzIG9wZXJhdGlvbiB0byBjb3ZlciB0aGUgY29tYmluYXRpb24gb2YgYW5pbWF0aW9uIHZlcmJzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYVxuICogY29tYmluYXRpb24gb2YgcHJvdG90eXBpY2FsIGluaGVyaXRhbmNlLCBBU1QgdHJhdmVyc2FsIGFuZCBtZXJnZS1zb3J0LWxpa2UgYWxnb3JpdGhtcyBhcmUgdXNlZC5cbiAqXG4gKiBbQVNUIFRyYXZlcnNhbF1cbiAqIEVhY2ggb2YgdGhlIGFuaW1hdGlvbiB2ZXJicywgd2hlbiBleGVjdXRlZCwgd2lsbCByZXR1cm4gYW4gc3RyaW5nLW1hcCBvYmplY3QgcmVwcmVzZW50aW5nIHdoYXRcbiAqIHR5cGUgb2YgYWN0aW9uIGl0IGlzIChzdHlsZSwgYW5pbWF0ZSwgZ3JvdXAsIGV0Yy4uLikgYW5kIHRoZSBkYXRhIGFzc29jaWF0ZWQgd2l0aCBpdC4gVGhpcyBtZWFuc1xuICogdGhhdCB3aGVuIGZ1bmN0aW9uYWwgY29tcG9zaXRpb24gbWl4IG9mIHRoZXNlIGZ1bmN0aW9ucyBpcyBldmFsdWF0ZWQgKGxpa2UgaW4gdGhlIGV4YW1wbGUgYWJvdmUpXG4gKiB0aGVuIGl0IHdpbGwgZW5kIHVwIHByb2R1Y2luZyBhIHRyZWUgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIGFuaW1hdGlvbiBpdHNlbGYuXG4gKlxuICogV2hlbiB0aGlzIGFuaW1hdGlvbiBvYmplY3QgdHJlZSBpcyBwcm9jZXNzZWQgYnkgdGhlIHZpc2l0b3IgY29kZSBiZWxvdyBpdCB3aWxsIHZpc2l0IGVhY2ggb2YgdGhlXG4gKiB2ZXJiIHN0YXRlbWVudHMgd2l0aGluIHRoZSB2aXNpdG9yLiBBbmQgZHVyaW5nIGVhY2ggdmlzaXQgaXQgd2lsbCBidWlsZCB0aGUgY29udGV4dCBvZiB0aGVcbiAqIGFuaW1hdGlvbiBrZXlmcmFtZXMgYnkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgYFRpbWVsaW5lQnVpbGRlcmAuXG4gKlxuICogW1RpbWVsaW5lQnVpbGRlcl1cbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIHRoZSBzdHlsZXMgYW5kIGJ1aWxkaW5nIGEgc2VyaWVzIG9mIGtleWZyYW1lIG9iamVjdHMgZm9yIGFcbiAqIHRpbWVsaW5lIGJldHdlZW4gYSBzdGFydCBhbmQgZW5kIHRpbWUuIFRoZSBidWlsZGVyIHN0YXJ0cyBvZmYgd2l0aCBhbiBpbml0aWFsIHRpbWVsaW5lIGFuZCBlYWNoXG4gKiB0aW1lIHRoZSBBU1QgY29tZXMgYWNyb3NzIGEgYGdyb3VwKClgLCBga2V5ZnJhbWVzKClgIG9yIGEgY29tYmluYXRpb24gb2YgdGhlIHR3byB3aWh0aW4gYVxuICogYHNlcXVlbmNlKClgIHRoZW4gaXQgd2lsbCBnZW5lcmF0ZSBhIHN1YiB0aW1lbGluZSBmb3IgZWFjaCBzdGVwIGFzIHdlbGwgYXMgYSBuZXcgb25lIGFmdGVyXG4gKiB0aGV5IGFyZSBjb21wbGV0ZS5cbiAqXG4gKiBBcyB0aGUgQVNUIGlzIHRyYXZlcnNlZCwgdGhlIHRpbWluZyBzdGF0ZSBvbiBlYWNoIG9mIHRoZSB0aW1lbGluZXMgd2lsbCBiZSBpbmNyZW1lbnRlZC4gSWYgYSBzdWJcbiAqIHRpbWVsaW5lIHdhcyBjcmVhdGVkIChiYXNlZCBvbiBvbmUgb2YgdGhlIGNhc2VzIGFib3ZlKSB0aGVuIHRoZSBwYXJlbnQgdGltZWxpbmUgd2lsbCBhdHRlbXB0IHRvXG4gKiBtZXJnZSB0aGUgc3R5bGVzIHVzZWQgd2l0aGluIHRoZSBzdWIgdGltZWxpbmVzIGludG8gaXRzZWxmIChvbmx5IHdpdGggZ3JvdXAoKSB0aGlzIHdpbGwgaGFwcGVuKS5cbiAqIFRoaXMgaGFwcGVucyB3aXRoIGEgbWVyZ2Ugb3BlcmF0aW9uIChtdWNoIGxpa2UgaG93IHRoZSBtZXJnZSB3b3JrcyBpbiBtZXJnZXNvcnQpIGFuZCBpdCB3aWxsIG9ubHlcbiAqIGNvcHkgdGhlIG1vc3QgcmVjZW50bHkgdXNlZCBzdHlsZXMgZnJvbSB0aGUgc3ViIHRpbWVsaW5lcyBpbnRvIHRoZSBwYXJlbnQgdGltZWxpbmUuIFRoaXMgZW5zdXJlc1xuICogdGhhdCBpZiB0aGUgc3R5bGVzIGFyZSB1c2VkIGxhdGVyIG9uIGluIGFub3RoZXIgcGhhc2Ugb2YgdGhlIGFuaW1hdGlvbiB0aGVuIHRoZXkgd2lsbCBiZSB0aGUgbW9zdFxuICogdXAtdG8tZGF0ZSB2YWx1ZXMuXG4gKlxuICogW0hvdyBNaXNzaW5nIFN0eWxlcyBBcmUgVXBkYXRlZF1cbiAqIEVhY2ggdGltZWxpbmUgaGFzIGEgYGJhY2tGaWxsYCBwcm9wZXJ0eSB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgZmlsbGluZyBpbiBuZXcgc3R5bGVzIGludG9cbiAqIGFscmVhZHkgcHJvY2Vzc2VkIGtleWZyYW1lcyBpZiBhIG5ldyBzdHlsZSBzaG93cyB1cCBsYXRlciB3aXRoaW4gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBgYGBcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAxMDAgfSkpLFxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDIwMCB9KSksXG4gKiAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogMzAwIH0pKVxuICogICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSkpIC8vIG5vdGljZSBob3cgYGhlaWdodGAgZG9lc24ndCBleGlzdCBhbnl3aGVyZVxuICogZWxzZVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFdoYXQgaXMgaGFwcGVuaW5nIGhlcmUgaXMgdGhhdCB0aGUgYGhlaWdodGAgdmFsdWUgaXMgYWRkZWQgbGF0ZXIgaW4gdGhlIHNlcXVlbmNlLCBidXQgaXMgbWlzc2luZ1xuICogZnJvbSBhbGwgcHJldmlvdXMgYW5pbWF0aW9uIHN0ZXBzLiBUaGVyZWZvcmUgd2hlbiBhIGtleWZyYW1lIGlzIGNyZWF0ZWQgaXQgd291bGQgYWxzbyBiZSBtaXNzaW5nXG4gKiBmcm9tIGFsbCBwcmV2aW91cyBrZXlmcmFtZXMgdXAgdW50aWwgd2hlcmUgaXQgaXMgZmlyc3QgdXNlZC4gRm9yIHRoZSB0aW1lbGluZSBrZXlmcmFtZSBnZW5lcmF0aW9uXG4gKiB0byBwcm9wZXJseSBmaWxsIGluIHRoZSBzdHlsZSBpdCB3aWxsIHBsYWNlIHRoZSBwcmV2aW91cyB2YWx1ZSAodGhlIHZhbHVlIGZyb20gdGhlIHBhcmVudFxuICogdGltZWxpbmUpIG9yIGEgZGVmYXVsdCB2YWx1ZSBvZiBgKmAgaW50byB0aGUgYmFja0ZpbGwgb2JqZWN0LiBHaXZlbiB0aGF0IGVhY2ggb2YgdGhlIGtleWZyYW1lXG4gKiBzdHlsZXMgYXJlIG9iamVjdHMgdGhhdCBwcm90b3R5cGljYWxseSBpbmhlcnQgZnJvbSB0aGUgYmFja0ZpbGwgb2JqZWN0LCB0aGlzIG1lYW5zIHRoYXQgaWYgYVxuICogdmFsdWUgaXMgYWRkZWQgaW50byB0aGUgYmFja0ZpbGwgdGhlbiBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgcHJvcGFnYXRlIGFueSBtaXNzaW5nIHZhbHVlcyB0byBhbGxcbiAqIGtleWZyYW1lcy4gVGhlcmVmb3JlIHRoZSBtaXNzaW5nIGBoZWlnaHRgIHZhbHVlIHdpbGwgYmUgcHJvcGVybHkgZmlsbGVkIGludG8gdGhlIGFscmVhZHlcbiAqIHByb2Nlc3NlZCBrZXlmcmFtZXMuXG4gKlxuICogV2hlbiBhIHN1Yi10aW1lbGluZSBpcyBjcmVhdGVkIGl0IHdpbGwgaGF2ZSBpdHMgb3duIGJhY2tGaWxsIHByb3BlcnR5LiBUaGlzIGlzIGRvbmUgc28gdGhhdFxuICogc3R5bGVzIHByZXNlbnQgd2l0aGluIHRoZSBzdWItdGltZWxpbmUgZG8gbm90IGFjY2lkZW50YWxseSBzZWVwIGludG8gdGhlIHByZXZpb3VzL2Z1dHVyZSB0aW1lbGluZVxuICoga2V5ZnJhbWVzXG4gKlxuICogKEZvciBwcm90b3R5cGljYWxseS1pbmhlcml0ZWQgY29udGVudHMgdG8gYmUgZGV0ZWN0ZWQgYSBgZm9yKGkgaW4gb2JqKWAgbG9vcCBtdXN0IGJlIHVzZWQuKVxuICpcbiAqIFtWYWxpZGF0aW9uXVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIG5vdCByZXNwb25zaWJsZSBmb3IgdmFsaWRhdGlvbi4gVGhhdCBmdW5jdGlvbmFsaXR5IGhhcHBlbnMgd2l0aCB3aXRoaW5cbiAqIHRoZSBgQW5pbWF0aW9uVmFsaWRhdG9yVmlzaXRvcmAgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCByb290RWxlbWVudDogYW55LCBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHN0YXJ0aW5nU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgIHN1Ykluc3RydWN0aW9ucz86IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgZXJyb3JzOiBhbnlbXSA9IFtdKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdIHtcbiAgcmV0dXJuIG5ldyBBbmltYXRpb25UaW1lbGluZUJ1aWxkZXJWaXNpdG9yKCkuYnVpbGRLZXlmcmFtZXMoXG4gICAgICBkcml2ZXIsIHJvb3RFbGVtZW50LCBhc3QsIGVudGVyQ2xhc3NOYW1lLCBsZWF2ZUNsYXNzTmFtZSwgc3RhcnRpbmdTdHlsZXMsIGZpbmFsU3R5bGVzLFxuICAgICAgb3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zLCBlcnJvcnMpO1xufVxuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVGltZWxpbmVCdWlsZGVyVmlzaXRvciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICBidWlsZEtleWZyYW1lcyhcbiAgICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCByb290RWxlbWVudDogYW55LCBhc3Q6IEFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICAgICAgZW50ZXJDbGFzc05hbWU6IHN0cmluZywgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgc3RhcnRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhLFxuICAgICAgZmluYWxTdHlsZXM6IMm1U3R5bGVEYXRhLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLCBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsXG4gICAgICBlcnJvcnM6IGFueVtdID0gW10pOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10ge1xuICAgIHN1Ykluc3RydWN0aW9ucyA9IHN1Ykluc3RydWN0aW9ucyB8fCBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3QgY29udGV4dCA9IG5ldyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQoXG4gICAgICAgIGRyaXZlciwgcm9vdEVsZW1lbnQsIHN1Ykluc3RydWN0aW9ucywgZW50ZXJDbGFzc05hbWUsIGxlYXZlQ2xhc3NOYW1lLCBlcnJvcnMsIFtdKTtcbiAgICBjb250ZXh0Lm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNldFN0eWxlcyhbc3RhcnRpbmdTdHlsZXNdLCBudWxsLCBjb250ZXh0LmVycm9ycywgb3B0aW9ucyk7XG5cbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LCBjb250ZXh0KTtcblxuICAgIC8vIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiBhbiBhY3R1YWwgYW5pbWF0aW9uIGhhcHBlbmVkXG4gICAgY29uc3QgdGltZWxpbmVzID0gY29udGV4dC50aW1lbGluZXMuZmlsdGVyKHRpbWVsaW5lID0+IHRpbWVsaW5lLmNvbnRhaW5zQW5pbWF0aW9uKCkpO1xuICAgIGlmICh0aW1lbGluZXMubGVuZ3RoICYmIE9iamVjdC5rZXlzKGZpbmFsU3R5bGVzKS5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRsID0gdGltZWxpbmVzW3RpbWVsaW5lcy5sZW5ndGggLSAxXTtcbiAgICAgIGlmICghdGwuYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSkge1xuICAgICAgICB0bC5zZXRTdHlsZXMoW2ZpbmFsU3R5bGVzXSwgbnVsbCwgY29udGV4dC5lcnJvcnMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aW1lbGluZXMubGVuZ3RoID8gdGltZWxpbmVzLm1hcCh0aW1lbGluZSA9PiB0aW1lbGluZS5idWlsZEtleWZyYW1lcygpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbY3JlYXRlVGltZWxpbmVJbnN0cnVjdGlvbihyb290RWxlbWVudCwgW10sIFtdLCBbXSwgMCwgMCwgJycsIGZhbHNlKV07XG4gIH1cblxuICB2aXNpdFRyaWdnZXIoYXN0OiBUcmlnZ2VyQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIC8vIHRoZXNlIHZhbHVlcyBhcmUgbm90IHZpc2l0ZWQgaW4gdGhpcyBBU1RcbiAgfVxuXG4gIHZpc2l0U3RhdGUoYXN0OiBTdGF0ZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KTogYW55IHtcbiAgICAvLyB0aGVzZSB2YWx1ZXMgYXJlIG5vdCB2aXNpdGVkIGluIHRoaXMgQVNUXG4gIH1cblxuICB2aXNpdFRyYW5zaXRpb24oYXN0OiBUcmFuc2l0aW9uQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIC8vIHRoZXNlIHZhbHVlcyBhcmUgbm90IHZpc2l0ZWQgaW4gdGhpcyBBU1RcbiAgfVxuXG4gIHZpc2l0QW5pbWF0ZUNoaWxkKGFzdDogQW5pbWF0ZUNoaWxkQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGVsZW1lbnRJbnN0cnVjdGlvbnMgPSBjb250ZXh0LnN1Ykluc3RydWN0aW9ucy5jb25zdW1lKGNvbnRleHQuZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLl92aXNpdFN1Ykluc3RydWN0aW9ucyhcbiAgICAgICAgICBlbGVtZW50SW5zdHJ1Y3Rpb25zLCBpbm5lckNvbnRleHQsIGlubmVyQ29udGV4dC5vcHRpb25zIGFzIEFuaW1hdGVDaGlsZE9wdGlvbnMpO1xuICAgICAgaWYgKHN0YXJ0VGltZSAhPSBlbmRUaW1lKSB7XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgb24gdGhlIHVwcGVyIGNvbnRleHQgYmVjYXVzZSB3ZSBjcmVhdGVkIGEgc3ViIGNvbnRleHQgZm9yXG4gICAgICAgIC8vIHRoZSBzdWIgY2hpbGQgYW5pbWF0aW9uc1xuICAgICAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShlbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdEFuaW1hdGVSZWYoYXN0OiBBbmltYXRlUmVmQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IGlubmVyQ29udGV4dCA9IGNvbnRleHQuY3JlYXRlU3ViQ29udGV4dChhc3Qub3B0aW9ucyk7XG4gICAgaW5uZXJDb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgIHRoaXMudmlzaXRSZWZlcmVuY2UoYXN0LmFuaW1hdGlvbiwgaW5uZXJDb250ZXh0KTtcbiAgICBjb250ZXh0LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZShpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0U3ViSW5zdHJ1Y3Rpb25zKFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCxcbiAgICAgIG9wdGlvbnM6IEFuaW1hdGVDaGlsZE9wdGlvbnMpOiBudW1iZXIge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGxldCBmdXJ0aGVzdFRpbWUgPSBzdGFydFRpbWU7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbC1jYXNlIGZvciB3aGVuIGEgdXNlciB3YW50cyB0byBza2lwIGEgc3ViXG4gICAgLy8gYW5pbWF0aW9uIGZyb20gYmVpbmcgZmlyZWQgZW50aXJlbHkuXG4gICAgY29uc3QgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uICE9IG51bGwgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kdXJhdGlvbikgOiBudWxsO1xuICAgIGNvbnN0IGRlbGF5ID0gb3B0aW9ucy5kZWxheSAhPSBudWxsID8gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpIDogbnVsbDtcbiAgICBpZiAoZHVyYXRpb24gIT09IDApIHtcbiAgICAgIGluc3RydWN0aW9ucy5mb3JFYWNoKGluc3RydWN0aW9uID0+IHtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25UaW1pbmdzID1cbiAgICAgICAgICAgIGNvbnRleHQuYXBwZW5kSW5zdHJ1Y3Rpb25Ub1RpbWVsaW5lKGluc3RydWN0aW9uLCBkdXJhdGlvbiwgZGVsYXkpO1xuICAgICAgICBmdXJ0aGVzdFRpbWUgPVxuICAgICAgICAgICAgTWF0aC5tYXgoZnVydGhlc3RUaW1lLCBpbnN0cnVjdGlvblRpbWluZ3MuZHVyYXRpb24gKyBpbnN0cnVjdGlvblRpbWluZ3MuZGVsYXkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1cnRoZXN0VGltZTtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb250ZXh0LnVwZGF0ZU9wdGlvbnMoYXN0Lm9wdGlvbnMsIHRydWUpO1xuICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBhc3QuYW5pbWF0aW9uLCBjb250ZXh0KTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0U2VxdWVuY2UoYXN0OiBTZXF1ZW5jZUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgY29uc3Qgc3ViQ29udGV4dENvdW50ID0gY29udGV4dC5zdWJDb250ZXh0Q291bnQ7XG4gICAgbGV0IGN0eCA9IGNvbnRleHQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGFzdC5vcHRpb25zO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMucGFyYW1zIHx8IG9wdGlvbnMuZGVsYXkpKSB7XG4gICAgICBjdHggPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQob3B0aW9ucyk7XG4gICAgICBjdHgudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKCk7XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGN0eC5wcmV2aW91c05vZGUudHlwZSA9PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUpIHtcbiAgICAgICAgICBjdHguY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgICAgIGN0eC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpO1xuICAgICAgICBjdHguZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFzdC5zdGVwcy5sZW5ndGgpIHtcbiAgICAgIGFzdC5zdGVwcy5mb3JFYWNoKHMgPT4gdmlzaXREc2xOb2RlKHRoaXMsIHMsIGN0eCkpO1xuXG4gICAgICAvLyB0aGlzIGlzIGhlcmUganVzdCBpbmNhc2UgdGhlIGlubmVyIHN0ZXBzIG9ubHkgY29udGFpbiBvciBlbmQgd2l0aCBhIHN0eWxlKCkgY2FsbFxuICAgICAgY3R4LmN1cnJlbnRUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcblxuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHNvbWUgYW5pbWF0aW9uIGZ1bmN0aW9uIHdpdGhpbiB0aGUgc2VxdWVuY2VcbiAgICAgIC8vIGVuZGVkIHVwIGNyZWF0aW5nIGEgc3ViIHRpbWVsaW5lICh3aGljaCBtZWFucyB0aGUgY3VycmVudFxuICAgICAgLy8gdGltZWxpbmUgY2Fubm90IG92ZXJsYXAgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHNlcXVlbmNlKVxuICAgICAgaWYgKGN0eC5zdWJDb250ZXh0Q291bnQgPiBzdWJDb250ZXh0Q291bnQpIHtcbiAgICAgICAgY3R4LnRyYW5zZm9ybUludG9OZXdUaW1lbGluZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gYXN0O1xuICB9XG5cbiAgdmlzaXRHcm91cChhc3Q6IEdyb3VwQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBpbm5lclRpbWVsaW5lczogVGltZWxpbmVCdWlsZGVyW10gPSBbXTtcbiAgICBsZXQgZnVydGhlc3RUaW1lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgY29uc3QgZGVsYXkgPSBhc3Qub3B0aW9ucyAmJiBhc3Qub3B0aW9ucy5kZWxheSA/IHJlc29sdmVUaW1pbmdWYWx1ZShhc3Qub3B0aW9ucy5kZWxheSkgOiAwO1xuXG4gICAgYXN0LnN0ZXBzLmZvckVhY2gocyA9PiB7XG4gICAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoYXN0Lm9wdGlvbnMpO1xuICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIGlubmVyQ29udGV4dC5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICAgIH1cblxuICAgICAgdmlzaXREc2xOb2RlKHRoaXMsIHMsIGlubmVyQ29udGV4dCk7XG4gICAgICBmdXJ0aGVzdFRpbWUgPSBNYXRoLm1heChmdXJ0aGVzdFRpbWUsIGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWUpO1xuICAgICAgaW5uZXJUaW1lbGluZXMucHVzaChpbm5lckNvbnRleHQuY3VycmVudFRpbWVsaW5lKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMgb3BlcmF0aW9uIGlzIHJ1biBhZnRlciB0aGUgQVNUIGxvb3AgYmVjYXVzZSBvdGhlcndpc2VcbiAgICAvLyBpZiB0aGUgcGFyZW50IHRpbWVsaW5lJ3MgY29sbGVjdGVkIHN0eWxlcyB3ZXJlIHVwZGF0ZWQgdGhlblxuICAgIC8vIGl0IHdvdWxkIHBhc3MgaW4gaW52YWxpZCBkYXRhIGludG8gdGhlIG5ldy10by1iZSBmb3JrZWQgaXRlbXNcbiAgICBpbm5lclRpbWVsaW5lcy5mb3JFYWNoKFxuICAgICAgICB0aW1lbGluZSA9PiBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lKSk7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZnVydGhlc3RUaW1lKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0VGltaW5nKGFzdDogVGltaW5nQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpOiBBbmltYXRlVGltaW5ncyB7XG4gICAgaWYgKChhc3QgYXMgRHluYW1pY1RpbWluZ0FzdCkuZHluYW1pYykge1xuICAgICAgY29uc3Qgc3RyVmFsdWUgPSAoYXN0IGFzIER5bmFtaWNUaW1pbmdBc3QpLnN0clZhbHVlO1xuICAgICAgY29uc3QgdGltaW5nVmFsdWUgPVxuICAgICAgICAgIGNvbnRleHQucGFyYW1zID8gaW50ZXJwb2xhdGVQYXJhbXMoc3RyVmFsdWUsIGNvbnRleHQucGFyYW1zLCBjb250ZXh0LmVycm9ycykgOiBzdHJWYWx1ZTtcbiAgICAgIHJldHVybiByZXNvbHZlVGltaW5nKHRpbWluZ1ZhbHVlLCBjb250ZXh0LmVycm9ycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZHVyYXRpb246IGFzdC5kdXJhdGlvbiwgZGVsYXk6IGFzdC5kZWxheSwgZWFzaW5nOiBhc3QuZWFzaW5nfTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEFuaW1hdGUoYXN0OiBBbmltYXRlQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCB0aW1pbmdzID0gY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSB0aGlzLl92aXNpdFRpbWluZyhhc3QudGltaW5ncywgY29udGV4dCk7XG4gICAgY29uc3QgdGltZWxpbmUgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBpZiAodGltaW5ncy5kZWxheSkge1xuICAgICAgY29udGV4dC5pbmNyZW1lbnRUaW1lKHRpbWluZ3MuZGVsYXkpO1xuICAgICAgdGltZWxpbmUuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGUgPSBhc3Quc3R5bGU7XG4gICAgaWYgKHN0eWxlLnR5cGUgPT0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcykge1xuICAgICAgdGhpcy52aXNpdEtleWZyYW1lcyhzdHlsZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuaW5jcmVtZW50VGltZSh0aW1pbmdzLmR1cmF0aW9uKTtcbiAgICAgIHRoaXMudmlzaXRTdHlsZShzdHlsZSBhcyBTdHlsZUFzdCwgY29udGV4dCk7XG4gICAgICB0aW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyA9IG51bGw7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFN0eWxlKGFzdDogU3R5bGVBc3QsIGNvbnRleHQ6IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dCkge1xuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgY29uc3QgdGltaW5ncyA9IGNvbnRleHQuY3VycmVudEFuaW1hdGVUaW1pbmdzICE7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB3aGVuIGEgc3R5bGUoKSBjYWxsXG4gICAgLy8gZGlyZWN0bHkgZm9sbG93cyAgYW4gYW5pbWF0ZSgpIGNhbGwgKGJ1dCBub3QgaW5zaWRlIG9mIGFuIGFuaW1hdGUoKSBjYWxsKVxuICAgIGlmICghdGltaW5ncyAmJiB0aW1lbGluZS5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoKSB7XG4gICAgICB0aW1lbGluZS5mb3J3YXJkRnJhbWUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmcgPSAodGltaW5ncyAmJiB0aW1pbmdzLmVhc2luZykgfHwgYXN0LmVhc2luZztcbiAgICBpZiAoYXN0LmlzRW1wdHlTdGVwKSB7XG4gICAgICB0aW1lbGluZS5hcHBseUVtcHR5U3RlcChlYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lbGluZS5zZXRTdHlsZXMoYXN0LnN0eWxlcywgZWFzaW5nLCBjb250ZXh0LmVycm9ycywgY29udGV4dC5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZnJhbWVzKGFzdDogS2V5ZnJhbWVzQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSBjb250ZXh0LmN1cnJlbnRBbmltYXRlVGltaW5ncyAhO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IChjb250ZXh0LmN1cnJlbnRUaW1lbGluZSAhKS5kdXJhdGlvbjtcbiAgICBjb25zdCBkdXJhdGlvbiA9IGN1cnJlbnRBbmltYXRlVGltaW5ncy5kdXJhdGlvbjtcbiAgICBjb25zdCBpbm5lckNvbnRleHQgPSBjb250ZXh0LmNyZWF0ZVN1YkNvbnRleHQoKTtcbiAgICBjb25zdCBpbm5lclRpbWVsaW5lID0gaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBpbm5lclRpbWVsaW5lLmVhc2luZyA9IGN1cnJlbnRBbmltYXRlVGltaW5ncy5lYXNpbmc7XG5cbiAgICBhc3Quc3R5bGVzLmZvckVhY2goc3RlcCA9PiB7XG4gICAgICBjb25zdCBvZmZzZXQ6IG51bWJlciA9IHN0ZXAub2Zmc2V0IHx8IDA7XG4gICAgICBpbm5lclRpbWVsaW5lLmZvcndhcmRUaW1lKG9mZnNldCAqIGR1cmF0aW9uKTtcbiAgICAgIGlubmVyVGltZWxpbmUuc2V0U3R5bGVzKHN0ZXAuc3R5bGVzLCBzdGVwLmVhc2luZywgY29udGV4dC5lcnJvcnMsIGNvbnRleHQub3B0aW9ucyk7XG4gICAgICBpbm5lclRpbWVsaW5lLmFwcGx5U3R5bGVzVG9LZXlmcmFtZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBwYXJlbnQgdGltZWxpbmUgZ2V0cyBhbGwgdGhlIHN0eWxlcyBmcm9tXG4gICAgLy8gdGhlIGNoaWxkIGV2ZW4gaWYgdGhlIG5ldyB0aW1lbGluZSBiZWxvdyBpcyBub3QgdXNlZFxuICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLm1lcmdlVGltZWxpbmVDb2xsZWN0ZWRTdHlsZXMoaW5uZXJUaW1lbGluZSk7XG5cbiAgICAvLyB3ZSBkbyB0aGlzIGJlY2F1c2UgdGhlIHdpbmRvdyBiZXR3ZWVuIHRoaXMgdGltZWxpbmUgYW5kIHRoZSBzdWIgdGltZWxpbmVcbiAgICAvLyBzaG91bGQgZW5zdXJlIHRoYXQgdGhlIHN0eWxlcyB3aXRoaW4gYXJlIGV4YWN0bHkgdGhlIHNhbWUgYXMgdGhleSB3ZXJlIGJlZm9yZVxuICAgIGNvbnRleHQudHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKHN0YXJ0VGltZSArIGR1cmF0aW9uKTtcbiAgICBjb250ZXh0LnByZXZpb3VzTm9kZSA9IGFzdDtcbiAgfVxuXG4gIHZpc2l0UXVlcnkoYXN0OiBRdWVyeUFzdCwgY29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0KSB7XG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGZpcnN0IHN0ZXAgYmVmb3JlIHRoaXMgaXMgYSBzdHlsZSBzdGVwIHdlIG5lZWRcbiAgICAvLyB0byBlbnN1cmUgdGhlIHN0eWxlcyBhcmUgYXBwbGllZCBiZWZvcmUgdGhlIGNoaWxkcmVuIGFyZSBhbmltYXRlZFxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IG9wdGlvbnMgPSAoYXN0Lm9wdGlvbnMgfHwge30pIGFzIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucztcbiAgICBjb25zdCBkZWxheSA9IG9wdGlvbnMuZGVsYXkgPyByZXNvbHZlVGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSkgOiAwO1xuXG4gICAgaWYgKGRlbGF5ICYmIChjb250ZXh0LnByZXZpb3VzTm9kZS50eXBlID09PSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUgfHxcbiAgICAgICAgICAgICAgICAgIChzdGFydFRpbWUgPT0gMCAmJiBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoKSkpIHtcbiAgICAgIGNvbnRleHQuY3VycmVudFRpbWVsaW5lLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERTtcbiAgICB9XG5cbiAgICBsZXQgZnVydGhlc3RUaW1lID0gc3RhcnRUaW1lO1xuICAgIGNvbnN0IGVsbXMgPSBjb250ZXh0Lmludm9rZVF1ZXJ5KFxuICAgICAgICBhc3Quc2VsZWN0b3IsIGFzdC5vcmlnaW5hbFNlbGVjdG9yLCBhc3QubGltaXQsIGFzdC5pbmNsdWRlU2VsZixcbiAgICAgICAgb3B0aW9ucy5vcHRpb25hbCA/IHRydWUgOiBmYWxzZSwgY29udGV4dC5lcnJvcnMpO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IGVsbXMubGVuZ3RoO1xuICAgIGxldCBzYW1lRWxlbWVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXJ8bnVsbCA9IG51bGw7XG4gICAgZWxtcy5mb3JFYWNoKChlbGVtZW50LCBpKSA9PiB7XG5cbiAgICAgIGNvbnRleHQuY3VycmVudFF1ZXJ5SW5kZXggPSBpO1xuICAgICAgY29uc3QgaW5uZXJDb250ZXh0ID0gY29udGV4dC5jcmVhdGVTdWJDb250ZXh0KGFzdC5vcHRpb25zLCBlbGVtZW50KTtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBpbm5lckNvbnRleHQuZGVsYXlOZXh0U3RlcChkZWxheSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbGVtZW50ID09PSBjb250ZXh0LmVsZW1lbnQpIHtcbiAgICAgICAgc2FtZUVsZW1lbnRUaW1lbGluZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgICB9XG5cbiAgICAgIHZpc2l0RHNsTm9kZSh0aGlzLCBhc3QuYW5pbWF0aW9uLCBpbm5lckNvbnRleHQpO1xuXG4gICAgICAvLyB0aGlzIGlzIGhlcmUganVzdCBpbmNhc2UgdGhlIGlubmVyIHN0ZXBzIG9ubHkgY29udGFpbiBvciBlbmRcbiAgICAgIC8vIHdpdGggYSBzdHlsZSgpIGNhbGwgKHdoaWNoIGlzIGhlcmUgdG8gc2lnbmFsIHRoYXQgdGhpcyBpcyBhIHByZXBhcmF0b3J5XG4gICAgICAvLyBjYWxsIHRvIHN0eWxlIGFuIGVsZW1lbnQgYmVmb3JlIGl0IGlzIGFuaW1hdGVkIGFnYWluKVxuICAgICAgaW5uZXJDb250ZXh0LmN1cnJlbnRUaW1lbGluZS5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcblxuICAgICAgY29uc3QgZW5kVGltZSA9IGlubmVyQ29udGV4dC5jdXJyZW50VGltZWxpbmUuY3VycmVudFRpbWU7XG4gICAgICBmdXJ0aGVzdFRpbWUgPSBNYXRoLm1heChmdXJ0aGVzdFRpbWUsIGVuZFRpbWUpO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IDA7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IDA7XG4gICAgY29udGV4dC50cmFuc2Zvcm1JbnRvTmV3VGltZWxpbmUoZnVydGhlc3RUaW1lKTtcblxuICAgIGlmIChzYW1lRWxlbWVudFRpbWVsaW5lKSB7XG4gICAgICBjb250ZXh0LmN1cnJlbnRUaW1lbGluZS5tZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHNhbWVFbGVtZW50VGltZWxpbmUpO1xuICAgICAgY29udGV4dC5jdXJyZW50VGltZWxpbmUuc25hcHNob3RDdXJyZW50U3R5bGVzKCk7XG4gICAgfVxuXG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG4gIH1cblxuICB2aXNpdFN0YWdnZXIoYXN0OiBTdGFnZ2VyQXN0LCBjb250ZXh0OiBBbmltYXRpb25UaW1lbGluZUNvbnRleHQpIHtcbiAgICBjb25zdCBwYXJlbnRDb250ZXh0ID0gY29udGV4dC5wYXJlbnRDb250ZXh0ICE7XG4gICAgY29uc3QgdGwgPSBjb250ZXh0LmN1cnJlbnRUaW1lbGluZTtcbiAgICBjb25zdCB0aW1pbmdzID0gYXN0LnRpbWluZ3M7XG4gICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLmFicyh0aW1pbmdzLmR1cmF0aW9uKTtcbiAgICBjb25zdCBtYXhUaW1lID0gZHVyYXRpb24gKiAoY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCAtIDEpO1xuICAgIGxldCBkZWxheSA9IGR1cmF0aW9uICogY29udGV4dC5jdXJyZW50UXVlcnlJbmRleDtcblxuICAgIGxldCBzdGFnZ2VyVHJhbnNmb3JtZXIgPSB0aW1pbmdzLmR1cmF0aW9uIDwgMCA/ICdyZXZlcnNlJyA6IHRpbWluZ3MuZWFzaW5nO1xuICAgIHN3aXRjaCAoc3RhZ2dlclRyYW5zZm9ybWVyKSB7XG4gICAgICBjYXNlICdyZXZlcnNlJzpcbiAgICAgICAgZGVsYXkgPSBtYXhUaW1lIC0gZGVsYXk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVsbCc6XG4gICAgICAgIGRlbGF5ID0gcGFyZW50Q29udGV4dC5jdXJyZW50U3RhZ2dlclRpbWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVsaW5lID0gY29udGV4dC5jdXJyZW50VGltZWxpbmU7XG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICB0aW1lbGluZS5kZWxheU5leHRTdGVwKGRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydGluZ1RpbWUgPSB0aW1lbGluZS5jdXJyZW50VGltZTtcbiAgICB2aXNpdERzbE5vZGUodGhpcywgYXN0LmFuaW1hdGlvbiwgY29udGV4dCk7XG4gICAgY29udGV4dC5wcmV2aW91c05vZGUgPSBhc3Q7XG5cbiAgICAvLyB0aW1lID0gZHVyYXRpb24gKyBkZWxheVxuICAgIC8vIHRoZSByZWFzb24gd2h5IHRoaXMgY29tcHV0YXRpb24gaXMgc28gY29tcGxleCBpcyBiZWNhdXNlXG4gICAgLy8gdGhlIGlubmVyIHRpbWVsaW5lIG1heSBlaXRoZXIgaGF2ZSBhIGRlbGF5IHZhbHVlIG9yIGEgc3RyZXRjaGVkXG4gICAgLy8ga2V5ZnJhbWUgZGVwZW5kaW5nIG9uIGlmIGEgc3VidGltZWxpbmUgaXMgbm90IHVzZWQgb3IgaXMgdXNlZC5cbiAgICBwYXJlbnRDb250ZXh0LmN1cnJlbnRTdGFnZ2VyVGltZSA9XG4gICAgICAgICh0bC5jdXJyZW50VGltZSAtIHN0YXJ0aW5nVGltZSkgKyAodGwuc3RhcnRUaW1lIC0gcGFyZW50Q29udGV4dC5jdXJyZW50VGltZWxpbmUuc3RhcnRUaW1lKTtcbiAgfVxufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIFN0eWxlQXRUaW1lID0ge1xuICB0aW1lOiBudW1iZXI7IHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XG59O1xuXG5jb25zdCBERUZBVUxUX05PT1BfUFJFVklPVVNfTk9ERSA9IDxBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPj57fTtcbmV4cG9ydCBjbGFzcyBBbmltYXRpb25UaW1lbGluZUNvbnRleHQge1xuICBwdWJsaWMgcGFyZW50Q29udGV4dDogQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0fG51bGwgPSBudWxsO1xuICBwdWJsaWMgY3VycmVudFRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXI7XG4gIHB1YmxpYyBjdXJyZW50QW5pbWF0ZVRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzfG51bGwgPSBudWxsO1xuICBwdWJsaWMgcHJldmlvdXNOb2RlOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPiA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICBwdWJsaWMgc3ViQ29udGV4dENvdW50ID0gMDtcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgcHVibGljIGN1cnJlbnRRdWVyeUluZGV4OiBudW1iZXIgPSAwO1xuICBwdWJsaWMgY3VycmVudFF1ZXJ5VG90YWw6IG51bWJlciA9IDA7XG4gIHB1YmxpYyBjdXJyZW50U3RhZ2dlclRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9kcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSxcbiAgICAgIHB1YmxpYyBzdWJJbnN0cnVjdGlvbnM6IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCwgcHJpdmF0ZSBfZW50ZXJDbGFzc05hbWU6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgX2xlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIHB1YmxpYyBlcnJvcnM6IGFueVtdLCBwdWJsaWMgdGltZWxpbmVzOiBUaW1lbGluZUJ1aWxkZXJbXSxcbiAgICAgIGluaXRpYWxUaW1lbGluZT86IFRpbWVsaW5lQnVpbGRlcikge1xuICAgIHRoaXMuY3VycmVudFRpbWVsaW5lID0gaW5pdGlhbFRpbWVsaW5lIHx8IG5ldyBUaW1lbGluZUJ1aWxkZXIodGhpcy5fZHJpdmVyLCBlbGVtZW50LCAwKTtcbiAgICB0aW1lbGluZXMucHVzaCh0aGlzLmN1cnJlbnRUaW1lbGluZSk7XG4gIH1cblxuICBnZXQgcGFyYW1zKCkgeyByZXR1cm4gdGhpcy5vcHRpb25zLnBhcmFtczsgfVxuXG4gIHVwZGF0ZU9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsLCBza2lwSWZFeGlzdHM/OiBib29sZWFuKSB7XG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBhbnk7XG4gICAgbGV0IG9wdGlvbnNUb1VwZGF0ZSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIE5PVEU6IHRoaXMgd2lsbCBnZXQgcGF0Y2hlZCB1cCB3aGVuIG90aGVyIGFuaW1hdGlvbiBtZXRob2RzIHN1cHBvcnQgZHVyYXRpb24gb3ZlcnJpZGVzXG4gICAgaWYgKG5ld09wdGlvbnMuZHVyYXRpb24gIT0gbnVsbCkge1xuICAgICAgKG9wdGlvbnNUb1VwZGF0ZSBhcyBhbnkpLmR1cmF0aW9uID0gcmVzb2x2ZVRpbWluZ1ZhbHVlKG5ld09wdGlvbnMuZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChuZXdPcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnNUb1VwZGF0ZS5kZWxheSA9IHJlc29sdmVUaW1pbmdWYWx1ZShuZXdPcHRpb25zLmRlbGF5KTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXdPcHRpb25zLnBhcmFtcztcbiAgICBpZiAobmV3UGFyYW1zKSB7XG4gICAgICBsZXQgcGFyYW1zVG9VcGRhdGU6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNUb1VwZGF0ZS5wYXJhbXMgITtcbiAgICAgIGlmICghcGFyYW1zVG9VcGRhdGUpIHtcbiAgICAgICAgcGFyYW1zVG9VcGRhdGUgPSB0aGlzLm9wdGlvbnMucGFyYW1zID0ge307XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKCFza2lwSWZFeGlzdHMgfHwgIXBhcmFtc1RvVXBkYXRlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgcGFyYW1zVG9VcGRhdGVbbmFtZV0gPSBpbnRlcnBvbGF0ZVBhcmFtcyhuZXdQYXJhbXNbbmFtZV0sIHBhcmFtc1RvVXBkYXRlLCB0aGlzLmVycm9ycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvcHlPcHRpb25zKCkge1xuICAgIGNvbnN0IG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7fTtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICBjb25zdCBvbGRQYXJhbXMgPSB0aGlzLm9wdGlvbnMucGFyYW1zO1xuICAgICAgaWYgKG9sZFBhcmFtcykge1xuICAgICAgICBjb25zdCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IG9wdGlvbnNbJ3BhcmFtcyddID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG9sZFBhcmFtcykuZm9yRWFjaChuYW1lID0+IHsgcGFyYW1zW25hbWVdID0gb2xkUGFyYW1zW25hbWVdOyB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICBjcmVhdGVTdWJDb250ZXh0KG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCA9IG51bGwsIGVsZW1lbnQ/OiBhbnksIG5ld1RpbWU/OiBudW1iZXIpOlxuICAgICAgQW5pbWF0aW9uVGltZWxpbmVDb250ZXh0IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlbGVtZW50IHx8IHRoaXMuZWxlbWVudDtcbiAgICBjb25zdCBjb250ZXh0ID0gbmV3IEFuaW1hdGlvblRpbWVsaW5lQ29udGV4dChcbiAgICAgICAgdGhpcy5fZHJpdmVyLCB0YXJnZXQsIHRoaXMuc3ViSW5zdHJ1Y3Rpb25zLCB0aGlzLl9lbnRlckNsYXNzTmFtZSwgdGhpcy5fbGVhdmVDbGFzc05hbWUsXG4gICAgICAgIHRoaXMuZXJyb3JzLCB0aGlzLnRpbWVsaW5lcywgdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yayh0YXJnZXQsIG5ld1RpbWUgfHwgMCkpO1xuICAgIGNvbnRleHQucHJldmlvdXNOb2RlID0gdGhpcy5wcmV2aW91c05vZGU7XG4gICAgY29udGV4dC5jdXJyZW50QW5pbWF0ZVRpbWluZ3MgPSB0aGlzLmN1cnJlbnRBbmltYXRlVGltaW5ncztcblxuICAgIGNvbnRleHQub3B0aW9ucyA9IHRoaXMuX2NvcHlPcHRpb25zKCk7XG4gICAgY29udGV4dC51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlJbmRleCA9IHRoaXMuY3VycmVudFF1ZXJ5SW5kZXg7XG4gICAgY29udGV4dC5jdXJyZW50UXVlcnlUb3RhbCA9IHRoaXMuY3VycmVudFF1ZXJ5VG90YWw7XG4gICAgY29udGV4dC5wYXJlbnRDb250ZXh0ID0gdGhpcztcbiAgICB0aGlzLnN1YkNvbnRleHRDb3VudCsrO1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgdHJhbnNmb3JtSW50b05ld1RpbWVsaW5lKG5ld1RpbWU/OiBudW1iZXIpIHtcbiAgICB0aGlzLnByZXZpb3VzTm9kZSA9IERFRkFVTFRfTk9PUF9QUkVWSU9VU19OT0RFO1xuICAgIHRoaXMuY3VycmVudFRpbWVsaW5lID0gdGhpcy5jdXJyZW50VGltZWxpbmUuZm9yayh0aGlzLmVsZW1lbnQsIG5ld1RpbWUpO1xuICAgIHRoaXMudGltZWxpbmVzLnB1c2godGhpcy5jdXJyZW50VGltZWxpbmUpO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lbGluZTtcbiAgfVxuXG4gIGFwcGVuZEluc3RydWN0aW9uVG9UaW1lbGluZShcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBkdXJhdGlvbjogbnVtYmVyfG51bGwsXG4gICAgICBkZWxheTogbnVtYmVyfG51bGwpOiBBbmltYXRlVGltaW5ncyB7XG4gICAgY29uc3QgdXBkYXRlZFRpbWluZ3M6IEFuaW1hdGVUaW1pbmdzID0ge1xuICAgICAgZHVyYXRpb246IGR1cmF0aW9uICE9IG51bGwgPyBkdXJhdGlvbiA6IGluc3RydWN0aW9uLmR1cmF0aW9uLFxuICAgICAgZGVsYXk6IHRoaXMuY3VycmVudFRpbWVsaW5lLmN1cnJlbnRUaW1lICsgKGRlbGF5ICE9IG51bGwgPyBkZWxheSA6IDApICsgaW5zdHJ1Y3Rpb24uZGVsYXksXG4gICAgICBlYXNpbmc6ICcnXG4gICAgfTtcbiAgICBjb25zdCBidWlsZGVyID0gbmV3IFN1YlRpbWVsaW5lQnVpbGRlcihcbiAgICAgICAgdGhpcy5fZHJpdmVyLCBpbnN0cnVjdGlvbi5lbGVtZW50LCBpbnN0cnVjdGlvbi5rZXlmcmFtZXMsIGluc3RydWN0aW9uLnByZVN0eWxlUHJvcHMsXG4gICAgICAgIGluc3RydWN0aW9uLnBvc3RTdHlsZVByb3BzLCB1cGRhdGVkVGltaW5ncywgaW5zdHJ1Y3Rpb24uc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUpO1xuICAgIHRoaXMudGltZWxpbmVzLnB1c2goYnVpbGRlcik7XG4gICAgcmV0dXJuIHVwZGF0ZWRUaW1pbmdzO1xuICB9XG5cbiAgaW5jcmVtZW50VGltZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLmN1cnJlbnRUaW1lbGluZS5mb3J3YXJkVGltZSh0aGlzLmN1cnJlbnRUaW1lbGluZS5kdXJhdGlvbiArIHRpbWUpO1xuICB9XG5cbiAgZGVsYXlOZXh0U3RlcChkZWxheTogbnVtYmVyKSB7XG4gICAgLy8gbmVnYXRpdmUgZGVsYXlzIGFyZSBub3QgeWV0IHN1cHBvcnRlZFxuICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWVsaW5lLmRlbGF5TmV4dFN0ZXAoZGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIGludm9rZVF1ZXJ5KFxuICAgICAgc2VsZWN0b3I6IHN0cmluZywgb3JpZ2luYWxTZWxlY3Rvcjogc3RyaW5nLCBsaW1pdDogbnVtYmVyLCBpbmNsdWRlU2VsZjogYm9vbGVhbixcbiAgICAgIG9wdGlvbmFsOiBib29sZWFuLCBlcnJvcnM6IGFueVtdKTogYW55W10ge1xuICAgIGxldCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChpbmNsdWRlU2VsZikge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZWxlbWVudCk7XG4gICAgfVxuICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7ICAvLyBpZiA6c2VsZiBpcyBvbmx5IHVzZWQgdGhlbiB0aGUgc2VsZWN0b3IgaXMgZW1wdHlcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShFTlRFUl9UT0tFTl9SRUdFWCwgJy4nICsgdGhpcy5fZW50ZXJDbGFzc05hbWUpO1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKExFQVZFX1RPS0VOX1JFR0VYLCAnLicgKyB0aGlzLl9sZWF2ZUNsYXNzTmFtZSk7XG4gICAgICBjb25zdCBtdWx0aSA9IGxpbWl0ICE9IDE7XG4gICAgICBsZXQgZWxlbWVudHMgPSB0aGlzLl9kcml2ZXIucXVlcnkodGhpcy5lbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICAgICAgaWYgKGxpbWl0ICE9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRzID0gbGltaXQgPCAwID8gZWxlbWVudHMuc2xpY2UoZWxlbWVudHMubGVuZ3RoICsgbGltaXQsIGVsZW1lbnRzLmxlbmd0aCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMucHVzaCguLi5lbGVtZW50cyk7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25hbCAmJiByZXN1bHRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgXFxgcXVlcnkoXCIke29yaWdpbmFsU2VsZWN0b3J9XCIpXFxgIHJldHVybmVkIHplcm8gZWxlbWVudHMuIChVc2UgXFxgcXVlcnkoXCIke29yaWdpbmFsU2VsZWN0b3J9XCIsIHsgb3B0aW9uYWw6IHRydWUgfSlcXGAgaWYgeW91IHdpc2ggdG8gYWxsb3cgdGhpcy4pYCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFRpbWVsaW5lQnVpbGRlciB7XG4gIHB1YmxpYyBkdXJhdGlvbjogbnVtYmVyID0gMDtcbiAgcHVibGljIGVhc2luZzogc3RyaW5nfG51bGw7XG4gIHByaXZhdGUgX3ByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2N1cnJlbnRLZXlmcmFtZTogybVTdHlsZURhdGEgPSB7fTtcbiAgcHJpdmF0ZSBfa2V5ZnJhbWVzID0gbmV3IE1hcDxudW1iZXIsIMm1U3R5bGVEYXRhPigpO1xuICBwcml2YXRlIF9zdHlsZVN1bW1hcnk6IHtbcHJvcDogc3RyaW5nXTogU3R5bGVBdFRpbWV9ID0ge307XG4gIHByaXZhdGUgX2xvY2FsVGltZWxpbmVTdHlsZXM6IMm1U3R5bGVEYXRhO1xuICBwcml2YXRlIF9nbG9iYWxUaW1lbGluZVN0eWxlczogybVTdHlsZURhdGE7XG4gIHByaXZhdGUgX3BlbmRpbmdTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIHByaXZhdGUgX2JhY2tGaWxsOiDJtVN0eWxlRGF0YSA9IHt9O1xuICBwcml2YXRlIF9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWU6IMm1U3R5bGVEYXRhfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBzdGFydFRpbWU6IG51bWJlcixcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cD86IE1hcDxhbnksIMm1U3R5bGVEYXRhPikge1xuICAgIGlmICghdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKSB7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcyA9IE9iamVjdC5jcmVhdGUodGhpcy5fYmFja0ZpbGwsIHt9KTtcbiAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2VsZW1lbnRUaW1lbGluZVN0eWxlc0xvb2t1cC5nZXQoZWxlbWVudCkgITtcbiAgICBpZiAoIXRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzKSB7XG4gICAgICB0aGlzLl9nbG9iYWxUaW1lbGluZVN0eWxlcyA9IHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXM7XG4gICAgICB0aGlzLl9lbGVtZW50VGltZWxpbmVTdHlsZXNMb29rdXAuc2V0KGVsZW1lbnQsIHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodGhpcy5fa2V5ZnJhbWVzLnNpemUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50U3R5bGVQcm9wZXJ0aWVzKCkubGVuZ3RoID4gMDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRTdHlsZVByb3BlcnRpZXMoKTogc3RyaW5nW10geyByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY3VycmVudEtleWZyYW1lKTsgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHsgcmV0dXJuIHRoaXMuc3RhcnRUaW1lICsgdGhpcy5kdXJhdGlvbjsgfVxuXG4gIGRlbGF5TmV4dFN0ZXAoZGVsYXk6IG51bWJlcikge1xuICAgIC8vIGluIHRoZSBldmVudCB0aGF0IGEgc3R5bGUoKSBzdGVwIGlzIHBsYWNlZCByaWdodCBiZWZvcmUgYSBzdGFnZ2VyKClcbiAgICAvLyBhbmQgdGhhdCBzdHlsZSgpIHN0ZXAgaXMgdGhlIHZlcnkgZmlyc3Qgc3R5bGUoKSB2YWx1ZSBpbiB0aGUgYW5pbWF0aW9uXG4gICAgLy8gdGhlbiB3ZSBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIHRoZSBrZXlmcmFtZSBbMCwgY29weSwgMV0gc28gdGhhdCB0aGUgZGVsYXlcbiAgICAvLyBwcm9wZXJseSBhcHBsaWVzIHRoZSBzdHlsZSgpIHZhbHVlcyB0byB3b3JrIHdpdGggdGhlIHN0YWdnZXIuLi5cbiAgICBjb25zdCBoYXNQcmVTdHlsZVN0ZXAgPSB0aGlzLl9rZXlmcmFtZXMuc2l6ZSA9PSAxICYmIE9iamVjdC5rZXlzKHRoaXMuX3BlbmRpbmdTdHlsZXMpLmxlbmd0aDtcblxuICAgIGlmICh0aGlzLmR1cmF0aW9uIHx8IGhhc1ByZVN0eWxlU3RlcCkge1xuICAgICAgdGhpcy5mb3J3YXJkVGltZSh0aGlzLmN1cnJlbnRUaW1lICsgZGVsYXkpO1xuICAgICAgaWYgKGhhc1ByZVN0eWxlU3RlcCkge1xuICAgICAgICB0aGlzLnNuYXBzaG90Q3VycmVudFN0eWxlcygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZSArPSBkZWxheTtcbiAgICB9XG4gIH1cblxuICBmb3JrKGVsZW1lbnQ6IGFueSwgY3VycmVudFRpbWU/OiBudW1iZXIpOiBUaW1lbGluZUJ1aWxkZXIge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgcmV0dXJuIG5ldyBUaW1lbGluZUJ1aWxkZXIoXG4gICAgICAgIHRoaXMuX2RyaXZlciwgZWxlbWVudCwgY3VycmVudFRpbWUgfHwgdGhpcy5jdXJyZW50VGltZSwgdGhpcy5fZWxlbWVudFRpbWVsaW5lU3R5bGVzTG9va3VwKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRLZXlmcmFtZSgpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudEtleWZyYW1lKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lID0gdGhpcy5fY3VycmVudEtleWZyYW1lO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWUgPSB0aGlzLl9rZXlmcmFtZXMuZ2V0KHRoaXMuZHVyYXRpb24pICE7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZSA9IE9iamVjdC5jcmVhdGUodGhpcy5fYmFja0ZpbGwsIHt9KTtcbiAgICAgIHRoaXMuX2tleWZyYW1lcy5zZXQodGhpcy5kdXJhdGlvbiwgdGhpcy5fY3VycmVudEtleWZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkRnJhbWUoKSB7XG4gICAgdGhpcy5kdXJhdGlvbiArPSBPTkVfRlJBTUVfSU5fTUlMTElTRUNPTkRTO1xuICAgIHRoaXMuX2xvYWRLZXlmcmFtZSgpO1xuICB9XG5cbiAgZm9yd2FyZFRpbWUodGltZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hcHBseVN0eWxlc1RvS2V5ZnJhbWUoKTtcbiAgICB0aGlzLmR1cmF0aW9uID0gdGltZTtcbiAgICB0aGlzLl9sb2FkS2V5ZnJhbWUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVN0eWxlKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudW1iZXIpIHtcbiAgICB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdID0gdmFsdWU7XG4gICAgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXNbcHJvcF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9zdHlsZVN1bW1hcnlbcHJvcF0gPSB7dGltZTogdGhpcy5jdXJyZW50VGltZSwgdmFsdWV9O1xuICB9XG5cbiAgYWxsb3dPbmx5VGltZWxpbmVTdHlsZXMoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50RW1wdHlTdGVwS2V5ZnJhbWUgIT09IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTsgfVxuXG4gIGFwcGx5RW1wdHlTdGVwKGVhc2luZzogc3RyaW5nfG51bGwpIHtcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lWydlYXNpbmcnXSA9IGVhc2luZztcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGFuaW1hdGUoZHVyYXRpb24pOlxuICAgIC8vIGFsbCBtaXNzaW5nIHN0eWxlcyBhcmUgZmlsbGVkIHdpdGggYSBgKmAgdmFsdWUgdGhlblxuICAgIC8vIGlmIGFueSBkZXN0aW5hdGlvbiBzdHlsZXMgYXJlIGZpbGxlZCBpbiBsYXRlciBvbiB0aGUgc2FtZVxuICAgIC8vIGtleWZyYW1lIHRoZW4gdGhleSB3aWxsIG92ZXJyaWRlIHRoZSBvdmVycmlkZGVuIHN0eWxlc1xuICAgIC8vIFdlIHVzZSBgX2dsb2JhbFRpbWVsaW5lU3R5bGVzYCBoZXJlIGJlY2F1c2UgdGhlcmUgbWF5IGJlXG4gICAgLy8gc3R5bGVzIGluIHByZXZpb3VzIGtleWZyYW1lcyB0aGF0IGFyZSBub3QgcHJlc2VudCBpbiB0aGlzIHRpbWVsaW5lXG4gICAgT2JqZWN0LmtleXModGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB0aGlzLl9iYWNrRmlsbFtwcm9wXSA9IHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzW3Byb3BdIHx8IEFVVE9fU1RZTEU7XG4gICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWVbcHJvcF0gPSBBVVRPX1NUWUxFO1xuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRFbXB0eVN0ZXBLZXlmcmFtZSA9IHRoaXMuX2N1cnJlbnRLZXlmcmFtZTtcbiAgfVxuXG4gIHNldFN0eWxlcyhcbiAgICAgIGlucHV0OiAoybVTdHlsZURhdGF8c3RyaW5nKVtdLCBlYXNpbmc6IHN0cmluZ3xudWxsLCBlcnJvcnM6IGFueVtdLFxuICAgICAgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBpZiAoZWFzaW5nKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0tleWZyYW1lWydlYXNpbmcnXSA9IGVhc2luZztcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXMgPSAob3B0aW9ucyAmJiBvcHRpb25zLnBhcmFtcykgfHwge307XG4gICAgY29uc3Qgc3R5bGVzID0gZmxhdHRlblN0eWxlcyhpbnB1dCwgdGhpcy5fZ2xvYmFsVGltZWxpbmVTdHlsZXMpO1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IGludGVycG9sYXRlUGFyYW1zKHN0eWxlc1twcm9wXSwgcGFyYW1zLCBlcnJvcnMpO1xuICAgICAgdGhpcy5fcGVuZGluZ1N0eWxlc1twcm9wXSA9IHZhbDtcbiAgICAgIGlmICghdGhpcy5fbG9jYWxUaW1lbGluZVN0eWxlcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICB0aGlzLl9iYWNrRmlsbFtwcm9wXSA9IHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzLmhhc093blByb3BlcnR5KHByb3ApID9cbiAgICAgICAgICAgIHRoaXMuX2dsb2JhbFRpbWVsaW5lU3R5bGVzW3Byb3BdIDpcbiAgICAgICAgICAgIEFVVE9fU1RZTEU7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTdHlsZShwcm9wLCB2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlTdHlsZXNUb0tleWZyYW1lKCkge1xuICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuX3BlbmRpbmdTdHlsZXM7XG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhzdHlsZXMpO1xuICAgIGlmIChwcm9wcy5sZW5ndGggPT0gMCkgcmV0dXJuO1xuXG4gICAgdGhpcy5fcGVuZGluZ1N0eWxlcyA9IHt9O1xuXG4gICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcbiAgICAgIHRoaXMuX2N1cnJlbnRLZXlmcmFtZVtwcm9wXSA9IHZhbDtcbiAgICB9KTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2N1cnJlbnRLZXlmcmFtZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICB0aGlzLl9jdXJyZW50S2V5ZnJhbWVbcHJvcF0gPSB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc25hcHNob3RDdXJyZW50U3R5bGVzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX2xvY2FsVGltZWxpbmVTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWwgPSB0aGlzLl9sb2NhbFRpbWVsaW5lU3R5bGVzW3Byb3BdO1xuICAgICAgdGhpcy5fcGVuZGluZ1N0eWxlc1twcm9wXSA9IHZhbDtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIHZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRGaW5hbEtleWZyYW1lKCkgeyByZXR1cm4gdGhpcy5fa2V5ZnJhbWVzLmdldCh0aGlzLmR1cmF0aW9uKTsgfVxuXG4gIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChsZXQgcHJvcCBpbiB0aGlzLl9jdXJyZW50S2V5ZnJhbWUpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaChwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICBtZXJnZVRpbWVsaW5lQ29sbGVjdGVkU3R5bGVzKHRpbWVsaW5lOiBUaW1lbGluZUJ1aWxkZXIpIHtcbiAgICBPYmplY3Qua2V5cyh0aW1lbGluZS5fc3R5bGVTdW1tYXJ5KS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgZGV0YWlsczAgPSB0aGlzLl9zdHlsZVN1bW1hcnlbcHJvcF07XG4gICAgICBjb25zdCBkZXRhaWxzMSA9IHRpbWVsaW5lLl9zdHlsZVN1bW1hcnlbcHJvcF07XG4gICAgICBpZiAoIWRldGFpbHMwIHx8IGRldGFpbHMxLnRpbWUgPiBkZXRhaWxzMC50aW1lKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlKHByb3AsIGRldGFpbHMxLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIHRoaXMuYXBwbHlTdHlsZXNUb0tleWZyYW1lKCk7XG4gICAgY29uc3QgcHJlU3R5bGVQcm9wcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IHBvc3RTdHlsZVByb3BzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgaXNFbXB0eSA9IHRoaXMuX2tleWZyYW1lcy5zaXplID09PSAxICYmIHRoaXMuZHVyYXRpb24gPT09IDA7XG5cbiAgICBsZXQgZmluYWxLZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10gPSBbXTtcbiAgICB0aGlzLl9rZXlmcmFtZXMuZm9yRWFjaCgoa2V5ZnJhbWUsIHRpbWUpID0+IHtcbiAgICAgIGNvbnN0IGZpbmFsS2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lLCB0cnVlKTtcbiAgICAgIE9iamVjdC5rZXlzKGZpbmFsS2V5ZnJhbWUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZmluYWxLZXlmcmFtZVtwcm9wXTtcbiAgICAgICAgaWYgKHZhbHVlID09IFBSRV9TVFlMRSkge1xuICAgICAgICAgIHByZVN0eWxlUHJvcHMuYWRkKHByb3ApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09IEFVVE9fU1RZTEUpIHtcbiAgICAgICAgICBwb3N0U3R5bGVQcm9wcy5hZGQocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFpc0VtcHR5KSB7XG4gICAgICAgIGZpbmFsS2V5ZnJhbWVbJ29mZnNldCddID0gdGltZSAvIHRoaXMuZHVyYXRpb247XG4gICAgICB9XG4gICAgICBmaW5hbEtleWZyYW1lcy5wdXNoKGZpbmFsS2V5ZnJhbWUpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcHJlUHJvcHM6IHN0cmluZ1tdID0gcHJlU3R5bGVQcm9wcy5zaXplID8gaXRlcmF0b3JUb0FycmF5KHByZVN0eWxlUHJvcHMudmFsdWVzKCkpIDogW107XG4gICAgY29uc3QgcG9zdFByb3BzOiBzdHJpbmdbXSA9IHBvc3RTdHlsZVByb3BzLnNpemUgPyBpdGVyYXRvclRvQXJyYXkocG9zdFN0eWxlUHJvcHMudmFsdWVzKCkpIDogW107XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGEgMC1zZWNvbmQgYW5pbWF0aW9uICh3aGljaCBpcyBkZXNpZ25lZCBqdXN0IHRvIHBsYWNlIHN0eWxlcyBvbnNjcmVlbilcbiAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgY29uc3Qga2YwID0gZmluYWxLZXlmcmFtZXNbMF07XG4gICAgICBjb25zdCBrZjEgPSBjb3B5T2JqKGtmMCk7XG4gICAgICBrZjBbJ29mZnNldCddID0gMDtcbiAgICAgIGtmMVsnb2Zmc2V0J10gPSAxO1xuICAgICAgZmluYWxLZXlmcmFtZXMgPSBba2YwLCBrZjFdO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGZpbmFsS2V5ZnJhbWVzLCBwcmVQcm9wcywgcG9zdFByb3BzLCB0aGlzLmR1cmF0aW9uLCB0aGlzLnN0YXJ0VGltZSxcbiAgICAgICAgdGhpcy5lYXNpbmcsIGZhbHNlKTtcbiAgfVxufVxuXG5jbGFzcyBTdWJUaW1lbGluZUJ1aWxkZXIgZXh0ZW5kcyBUaW1lbGluZUJ1aWxkZXIge1xuICBwdWJsaWMgdGltaW5nczogQW5pbWF0ZVRpbWluZ3M7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkcml2ZXI6IEFuaW1hdGlvbkRyaXZlciwgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczogybVTdHlsZURhdGFbXSxcbiAgICAgIHB1YmxpYyBwcmVTdHlsZVByb3BzOiBzdHJpbmdbXSwgcHVibGljIHBvc3RTdHlsZVByb3BzOiBzdHJpbmdbXSwgdGltaW5nczogQW5pbWF0ZVRpbWluZ3MsXG4gICAgICBwcml2YXRlIF9zdHJldGNoU3RhcnRpbmdLZXlmcmFtZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoZHJpdmVyLCBlbGVtZW50LCB0aW1pbmdzLmRlbGF5KTtcbiAgICB0aGlzLnRpbWluZ3MgPSB7ZHVyYXRpb246IHRpbWluZ3MuZHVyYXRpb24sIGRlbGF5OiB0aW1pbmdzLmRlbGF5LCBlYXNpbmc6IHRpbWluZ3MuZWFzaW5nfTtcbiAgfVxuXG4gIGNvbnRhaW5zQW5pbWF0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5rZXlmcmFtZXMubGVuZ3RoID4gMTsgfVxuXG4gIGJ1aWxkS2V5ZnJhbWVzKCk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBrZXlmcmFtZXMgPSB0aGlzLmtleWZyYW1lcztcbiAgICBsZXQge2RlbGF5LCBkdXJhdGlvbiwgZWFzaW5nfSA9IHRoaXMudGltaW5ncztcbiAgICBpZiAodGhpcy5fc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgJiYgZGVsYXkpIHtcbiAgICAgIGNvbnN0IG5ld0tleWZyYW1lczogybVTdHlsZURhdGFbXSA9IFtdO1xuICAgICAgY29uc3QgdG90YWxUaW1lID0gZHVyYXRpb24gKyBkZWxheTtcbiAgICAgIGNvbnN0IHN0YXJ0aW5nR2FwID0gZGVsYXkgLyB0b3RhbFRpbWU7XG5cbiAgICAgIC8vIHRoZSBvcmlnaW5hbCBzdGFydGluZyBrZXlmcmFtZSBub3cgc3RhcnRzIG9uY2UgdGhlIGRlbGF5IGlzIGRvbmVcbiAgICAgIGNvbnN0IG5ld0ZpcnN0S2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lc1swXSwgZmFsc2UpO1xuICAgICAgbmV3Rmlyc3RLZXlmcmFtZVsnb2Zmc2V0J10gPSAwO1xuICAgICAgbmV3S2V5ZnJhbWVzLnB1c2gobmV3Rmlyc3RLZXlmcmFtZSk7XG5cbiAgICAgIGNvbnN0IG9sZEZpcnN0S2V5ZnJhbWUgPSBjb3B5U3R5bGVzKGtleWZyYW1lc1swXSwgZmFsc2UpO1xuICAgICAgb2xkRmlyc3RLZXlmcmFtZVsnb2Zmc2V0J10gPSByb3VuZE9mZnNldChzdGFydGluZ0dhcCk7XG4gICAgICBuZXdLZXlmcmFtZXMucHVzaChvbGRGaXJzdEtleWZyYW1lKTtcblxuICAgICAgLypcbiAgICAgICAgV2hlbiB0aGUga2V5ZnJhbWUgaXMgc3RyZXRjaGVkIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgZGVsYXkgYmVmb3JlIHRoZSBhbmltYXRpb25cbiAgICAgICAgc3RhcnRzIGlzIGdvbmUuIEluc3RlYWQgdGhlIGZpcnN0IGtleWZyYW1lIGlzIHBsYWNlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgICBhbmQgaXQgaXMgdGhlbiBjb3BpZWQgdG8gd2hlcmUgaXQgc3RhcnRzIHdoZW4gdGhlIG9yaWdpbmFsIGRlbGF5IGlzIG92ZXIuIFRoaXMgYmFzaWNhbGx5XG4gICAgICAgIG1lYW5zIG5vdGhpbmcgYW5pbWF0ZXMgZHVyaW5nIHRoYXQgZGVsYXksIGJ1dCB0aGUgc3R5bGVzIGFyZSBzdGlsbCByZW5kZXJlcmVkLiBGb3IgdGhpc1xuICAgICAgICB0byB3b3JrIHRoZSBvcmlnaW5hbCBvZmZzZXQgdmFsdWVzIHRoYXQgZXhpc3QgaW4gdGhlIG9yaWdpbmFsIGtleWZyYW1lcyBtdXN0IGJlIFwid2FycGVkXCJcbiAgICAgICAgc28gdGhhdCB0aGV5IGNhbiB0YWtlIHRoZSBuZXcga2V5ZnJhbWUgKyBkZWxheSBpbnRvIGFjY291bnQuXG5cbiAgICAgICAgZGVsYXk9MTAwMCwgZHVyYXRpb249MTAwMCwga2V5ZnJhbWVzID0gMCAuNSAxXG5cbiAgICAgICAgdHVybnMgaW50b1xuXG4gICAgICAgIGRlbGF5PTAsIGR1cmF0aW9uPTIwMDAsIGtleWZyYW1lcyA9IDAgLjMzIC42NiAxXG4gICAgICAgKi9cblxuICAgICAgLy8gb2Zmc2V0cyBiZXR3ZWVuIDEgLi4uIG4gLTEgYXJlIGFsbCB3YXJwZWQgYnkgdGhlIGtleWZyYW1lIHN0cmV0Y2hcbiAgICAgIGNvbnN0IGxpbWl0ID0ga2V5ZnJhbWVzLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBsaW1pdDsgaSsrKSB7XG4gICAgICAgIGxldCBrZiA9IGNvcHlTdHlsZXMoa2V5ZnJhbWVzW2ldLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IG9sZE9mZnNldCA9IGtmWydvZmZzZXQnXSBhcyBudW1iZXI7XG4gICAgICAgIGNvbnN0IHRpbWVBdEtleWZyYW1lID0gZGVsYXkgKyBvbGRPZmZzZXQgKiBkdXJhdGlvbjtcbiAgICAgICAga2ZbJ29mZnNldCddID0gcm91bmRPZmZzZXQodGltZUF0S2V5ZnJhbWUgLyB0b3RhbFRpbWUpO1xuICAgICAgICBuZXdLZXlmcmFtZXMucHVzaChrZik7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBuZXcgc3RhcnRpbmcga2V5ZnJhbWUgc2hvdWxkIGJlIGFkZGVkIGF0IHRoZSBzdGFydFxuICAgICAgZHVyYXRpb24gPSB0b3RhbFRpbWU7XG4gICAgICBkZWxheSA9IDA7XG4gICAgICBlYXNpbmcgPSAnJztcblxuICAgICAga2V5ZnJhbWVzID0gbmV3S2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVUaW1lbGluZUluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLmVsZW1lbnQsIGtleWZyYW1lcywgdGhpcy5wcmVTdHlsZVByb3BzLCB0aGlzLnBvc3RTdHlsZVByb3BzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZyxcbiAgICAgICAgdHJ1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm91bmRPZmZzZXQob2Zmc2V0OiBudW1iZXIsIGRlY2ltYWxQb2ludHMgPSAzKTogbnVtYmVyIHtcbiAgY29uc3QgbXVsdCA9IE1hdGgucG93KDEwLCBkZWNpbWFsUG9pbnRzIC0gMSk7XG4gIHJldHVybiBNYXRoLnJvdW5kKG9mZnNldCAqIG11bHQpIC8gbXVsdDtcbn1cblxuZnVuY3Rpb24gZmxhdHRlblN0eWxlcyhpbnB1dDogKMm1U3R5bGVEYXRhIHwgc3RyaW5nKVtdLCBhbGxTdHlsZXM6IMm1U3R5bGVEYXRhKSB7XG4gIGNvbnN0IHN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgbGV0IGFsbFByb3BlcnRpZXM6IHN0cmluZ1tdO1xuICBpbnB1dC5mb3JFYWNoKHRva2VuID0+IHtcbiAgICBpZiAodG9rZW4gPT09ICcqJykge1xuICAgICAgYWxsUHJvcGVydGllcyA9IGFsbFByb3BlcnRpZXMgfHwgT2JqZWN0LmtleXMoYWxsU3R5bGVzKTtcbiAgICAgIGFsbFByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHsgc3R5bGVzW3Byb3BdID0gQVVUT19TVFlMRTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvcHlTdHlsZXModG9rZW4gYXMgybVTdHlsZURhdGEsIGZhbHNlLCBzdHlsZXMpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdHlsZXM7XG59XG4iXX0=