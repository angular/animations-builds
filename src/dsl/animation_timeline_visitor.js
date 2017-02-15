/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationStyles } from '@angular/core';
import { copyStyles, normalizeStyles, parseTimeExpression } from '../common/util';
import { visitAnimationNode } from './animation_dsl_visitor';
import * as meta from './animation_metadata';
import { createTimelineInstruction } from './animation_timeline_instruction';
/**
 * @param {?} ast
 * @param {?=} startingStyles
 * @param {?=} finalStyles
 * @return {?}
 */
export function buildAnimationKeyframes(ast, startingStyles, finalStyles) {
    if (startingStyles === void 0) { startingStyles = {}; }
    if (finalStyles === void 0) { finalStyles = {}; }
    var /** @type {?} */ normalizedAst = Array.isArray(ast) ? meta.sequence(/** @type {?} */ (ast)) : (ast);
    return new AnimationTimelineVisitor().buildKeyframes(normalizedAst, startingStyles, finalStyles);
}
var AnimationTimelineContext = (function () {
    /**
     * @param {?} errors
     * @param {?} timelines
     * @param {?=} initialTimeline
     */
    function AnimationTimelineContext(errors, timelines, initialTimeline) {
        if (initialTimeline === void 0) { initialTimeline = null; }
        this.errors = errors;
        this.timelines = timelines;
        this.previousNode = ({});
        this.subContextCount = 0;
        this.currentTimeline = initialTimeline || new TimelineBuilder(0);
        timelines.push(this.currentTimeline);
    }
    /**
     * @param {?=} inherit
     * @return {?}
     */
    AnimationTimelineContext.prototype.createSubContext = function (inherit) {
        if (inherit === void 0) { inherit = false; }
        var /** @type {?} */ context = new AnimationTimelineContext(this.errors, this.timelines, this.currentTimeline.fork(inherit));
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        this.subContextCount++;
        return context;
    };
    /**
     * @param {?=} newTime
     * @return {?}
     */
    AnimationTimelineContext.prototype.transformIntoNewTimeline = function (newTime) {
        if (newTime === void 0) { newTime = 0; }
        var /** @type {?} */ oldTimeline = this.currentTimeline;
        var /** @type {?} */ oldTime = oldTimeline.time;
        if (newTime > 0) {
            oldTimeline.time = newTime;
        }
        this.currentTimeline = oldTimeline.fork(true);
        oldTimeline.time = oldTime;
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    };
    /**
     * @param {?} time
     * @return {?}
     */
    AnimationTimelineContext.prototype.incrementTime = function (time) {
        this.currentTimeline.forwardTime(this.currentTimeline.time + time);
    };
    return AnimationTimelineContext;
}());
export { AnimationTimelineContext };
function AnimationTimelineContext_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTimelineContext.prototype.currentTimeline;
    /** @type {?} */
    AnimationTimelineContext.prototype.currentAnimateTimings;
    /** @type {?} */
    AnimationTimelineContext.prototype.previousNode;
    /** @type {?} */
    AnimationTimelineContext.prototype.subContextCount;
    /** @type {?} */
    AnimationTimelineContext.prototype.errors;
    /** @type {?} */
    AnimationTimelineContext.prototype.timelines;
}
var AnimationTimelineVisitor = (function () {
    function AnimationTimelineVisitor() {
    }
    /**
     * @param {?} ast
     * @param {?} startingStyles
     * @param {?} finalStyles
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.buildKeyframes = function (ast, startingStyles, finalStyles) {
        var /** @type {?} */ context = new AnimationTimelineContext([], []);
        context.currentTimeline.setStyles(startingStyles);
        visitAnimationNode(this, ast, context);
        var /** @type {?} */ normalizedFinalStyles = copyStyles(finalStyles, true);
        // this is a special case for when animate(TIME) is used (without any styles)
        // thus indicating to create an animation arc between the final keyframe and
        // the destination styles. When this occurs we need to ensure that the styles
        // that are missing on the finalStyles map are set to AUTO
        if (Object.keys(context.currentTimeline.getFinalKeyframe()).length == 0) {
            context.currentTimeline.properties.forEach(function (prop) {
                var /** @type {?} */ val = normalizedFinalStyles[prop];
                if (val == null) {
                    normalizedFinalStyles[prop] = meta.AUTO_STYLE;
                }
            });
        }
        context.currentTimeline.setStyles(normalizedFinalStyles);
        var /** @type {?} */ timelineInstructions = [];
        context.timelines.forEach(function (timeline) {
            // this checks to see if an actual animation happened
            if (timeline.hasStyling()) {
                timelineInstructions.push(timeline.buildKeyframes());
            }
        });
        if (timelineInstructions.length == 0) {
            timelineInstructions.push(createTimelineInstruction([], 0, 0, ''));
        }
        return timelineInstructions;
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitState = function (ast, context) {
        // these values are not visited in this AST
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitTransition = function (ast, context) {
        // these values are not visited in this AST
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitSequence = function (ast, context) {
        var _this = this;
        var /** @type {?} */ subContextCount = context.subContextCount;
        if (context.previousNode.type == 6 /* Style */) {
            context.currentTimeline.forwardFrame();
            context.currentTimeline.snapshotCurrentStyles();
        }
        ast.steps.map(function (s) { return visitAnimationNode(_this, s, context); });
        context.previousNode = ast;
        if (context.subContextCount > subContextCount) {
            context.transformIntoNewTimeline();
            context.currentTimeline.snapshotCurrentStyles();
        }
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitGroup = function (ast, context) {
        var _this = this;
        var /** @type {?} */ innerTimelines = [];
        var /** @type {?} */ furthestTime = context.currentTimeline.currentTime;
        ast.steps.map(function (s) {
            var /** @type {?} */ innerContext = context.createSubContext(false);
            innerContext.currentTimeline.snapshotCurrentStyles();
            visitAnimationNode(_this, s, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        context.transformIntoNewTimeline(furthestTime);
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach(function (timeline) { return context.currentTimeline.mergeTimelineCollectedStyles(timeline); });
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.currentTimeline.snapshotCurrentStyles();
        context.previousNode = ast;
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitAnimate = function (ast, context) {
        var /** @type {?} */ timings = ast.timings.hasOwnProperty('duration') ? (ast.timings) :
            parseTimeExpression(/** @type {?} */ (ast.timings), context.errors);
        context.currentAnimateTimings = timings;
        if (timings.delay) {
            context.incrementTime(timings.delay);
            context.currentTimeline.snapshotCurrentStyles();
        }
        var /** @type {?} */ astType = ast.styles ? ast.styles.type : -1;
        if (astType == 5 /* KeyframeSequence */) {
            this.visitKeyframeSequence(/** @type {?} */ (ast.styles), context);
        }
        else {
            context.incrementTime(timings.duration);
            if (astType == 6 /* Style */) {
                this.visitStyle(/** @type {?} */ (ast.styles), context);
            }
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitStyle = function (ast, context) {
        // this is a special case when a style() call is issued directly after
        // a call to animate(). If the clock is not forwarded by one frame then
        // the style() calls will be merged into the previous animate() call
        // which is incorrect.
        if (!context.currentAnimateTimings &&
            context.previousNode.type == 4 /* Animate */) {
            context.currentTimeline.forwardFrame();
        }
        var /** @type {?} */ normalizedStyles = normalizeStyles(new AnimationStyles(ast.styles));
        var /** @type {?} */ easing = context.currentAnimateTimings && context.currentAnimateTimings.easing;
        if (easing) {
            normalizedStyles['easing'] = easing;
        }
        context.currentTimeline.setStyles(normalizedStyles);
        context.previousNode = ast;
    };
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    AnimationTimelineVisitor.prototype.visitKeyframeSequence = function (ast, context) {
        var /** @type {?} */ MAX_KEYFRAME_OFFSET = 1;
        var /** @type {?} */ limit = ast.steps.length - 1;
        var /** @type {?} */ firstKeyframe = ast.steps[0];
        var /** @type {?} */ offsetGap = 0;
        var /** @type {?} */ containsOffsets = firstKeyframe.styles.find(function (styles) { return styles['offset'] >= 0; });
        if (!containsOffsets) {
            offsetGap = MAX_KEYFRAME_OFFSET / limit;
        }
        var /** @type {?} */ keyframeDuration = context.currentAnimateTimings.duration;
        var /** @type {?} */ innerContext = context.createSubContext(true);
        var /** @type {?} */ innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = context.currentAnimateTimings.easing;
        // this will ensure that all collected styles so far
        // are populated into the first keyframe of the keyframes()
        // timeline (even if there exists a starting keyframe then
        // it will override the contents of the first frame later)
        innerTimeline.snapshotCurrentStyles();
        ast.steps.map(function (step, i) {
            var /** @type {?} */ normalizedStyles = normalizeStyles(new AnimationStyles(step.styles));
            var /** @type {?} */ offset = containsOffsets ? (normalizedStyles['offset']) :
                (i == limit ? MAX_KEYFRAME_OFFSET : i * offsetGap);
            innerTimeline.forwardTime(offset * keyframeDuration);
            innerTimeline.setStyles(normalizedStyles);
        });
        // this will ensure that the parent timeline gets all the styles from
        // the child even if the new timeline below is not used
        context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.transformIntoNewTimeline(context.currentTimeline.time + keyframeDuration);
        context.currentTimeline.snapshotCurrentStyles();
        context.previousNode = ast;
    };
    return AnimationTimelineVisitor;
}());
export { AnimationTimelineVisitor };
var TimelineBuilder = (function () {
    /**
     * @param {?} startTime
     * @param {?=} _globalTimelineStyles
     * @param {?=} inheritedBackFill
     * @param {?=} inheritedStyles
     */
    function TimelineBuilder(startTime, _globalTimelineStyles, inheritedBackFill, inheritedStyles) {
        if (_globalTimelineStyles === void 0) { _globalTimelineStyles = null; }
        if (inheritedBackFill === void 0) { inheritedBackFill = null; }
        if (inheritedStyles === void 0) { inheritedStyles = null; }
        this.startTime = startTime;
        this._globalTimelineStyles = _globalTimelineStyles;
        this.time = 0;
        this.easing = '';
        this._keyframes = new Map();
        this._styleSummary = {};
        this._backFill = {};
        if (inheritedBackFill) {
            this._backFill = inheritedBackFill;
        }
        this._localTimelineStyles = Object.create(this._backFill, {});
        if (inheritedStyles) {
            this._localTimelineStyles = copyStyles(inheritedStyles, false, this._localTimelineStyles);
        }
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
        }
        this._loadKeyframe();
    }
    /**
     * @return {?}
     */
    TimelineBuilder.prototype.hasStyling = function () { return this._keyframes.size > 1; };
    Object.defineProperty(TimelineBuilder.prototype, "currentTime", {
        /**
         * @return {?}
         */
        get: function () { return this.startTime + this.time; },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?=} inherit
     * @return {?}
     */
    TimelineBuilder.prototype.fork = function (inherit) {
        if (inherit === void 0) { inherit = false; }
        var /** @type {?} */ inheritedBackFill = inherit ? this._backFill : null;
        var /** @type {?} */ inheritedStyles = inherit ? this._localTimelineStyles : null;
        return new TimelineBuilder(this.currentTime, this._globalTimelineStyles, inheritedBackFill, inheritedStyles);
    };
    /**
     * @return {?}
     */
    TimelineBuilder.prototype._loadKeyframe = function () {
        this._currentKeyframe = this._keyframes.get(this.time);
        if (!this._currentKeyframe) {
            this._currentKeyframe = Object.create(this._backFill, {});
            this._keyframes.set(this.time, this._currentKeyframe);
        }
    };
    /**
     * @return {?}
     */
    TimelineBuilder.prototype.forwardFrame = function () {
        this.time++;
        this._loadKeyframe();
    };
    /**
     * @param {?} time
     * @return {?}
     */
    TimelineBuilder.prototype.forwardTime = function (time) {
        this.time = time;
        this._loadKeyframe();
    };
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    TimelineBuilder.prototype._updateStyle = function (prop, value) {
        if (prop != 'easing') {
            if (!this._localTimelineStyles[prop]) {
                this._backFill[prop] = this._globalTimelineStyles[prop] || meta.AUTO_STYLE;
            }
            this._localTimelineStyles[prop] = value;
            this._globalTimelineStyles[prop] = value;
            this._styleSummary[prop] = { time: this.currentTime, value: value };
        }
    };
    /**
     * @param {?} styles
     * @return {?}
     */
    TimelineBuilder.prototype.setStyles = function (styles) {
        var _this = this;
        Object.keys(styles).forEach(function (prop) {
            if (prop !== 'offset') {
                var /** @type {?} */ val = styles[prop];
                _this._currentKeyframe[prop] = val;
                _this._updateStyle(prop, val);
            }
        });
        Object.keys(this._localTimelineStyles).forEach(function (prop) {
            if (!_this._currentKeyframe.hasOwnProperty(prop)) {
                _this._currentKeyframe[prop] = _this._localTimelineStyles[prop];
            }
        });
    };
    /**
     * @return {?}
     */
    TimelineBuilder.prototype.snapshotCurrentStyles = function () { copyStyles(this._localTimelineStyles, false, this._currentKeyframe); };
    /**
     * @return {?}
     */
    TimelineBuilder.prototype.getFinalKeyframe = function () { return this._keyframes.get(this.time); };
    Object.defineProperty(TimelineBuilder.prototype, "properties", {
        /**
         * @return {?}
         */
        get: function () {
            var /** @type {?} */ properties = [];
            for (var /** @type {?} */ prop in this._currentKeyframe) {
                properties.push(prop);
            }
            return properties;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} timeline
     * @return {?}
     */
    TimelineBuilder.prototype.mergeTimelineCollectedStyles = function (timeline) {
        var _this = this;
        Object.keys(timeline._styleSummary).forEach(function (prop) {
            var /** @type {?} */ details0 = _this._styleSummary[prop];
            var /** @type {?} */ details1 = timeline._styleSummary[prop];
            if (!details0 || details1.time > details0.time) {
                _this._updateStyle(prop, details1.value);
            }
        });
    };
    /**
     * @return {?}
     */
    TimelineBuilder.prototype.buildKeyframes = function () {
        var _this = this;
        var /** @type {?} */ finalKeyframes = [];
        // special case for when there are only start/destination
        // styles but no actual animation animate steps...
        if (this.time == 0) {
            var /** @type {?} */ targetKeyframe = this.getFinalKeyframe();
            var /** @type {?} */ firstKeyframe = copyStyles(targetKeyframe, true);
            firstKeyframe['offset'] = 0;
            finalKeyframes.push(firstKeyframe);
            var /** @type {?} */ lastKeyframe = copyStyles(targetKeyframe, true);
            lastKeyframe['offset'] = 1;
            finalKeyframes.push(lastKeyframe);
        }
        else {
            this._keyframes.forEach(function (keyframe, time) {
                var /** @type {?} */ finalKeyframe = copyStyles(keyframe, true);
                finalKeyframe['offset'] = time / _this.time;
                finalKeyframes.push(finalKeyframe);
            });
        }
        return createTimelineInstruction(finalKeyframes, this.time, this.startTime, this.easing);
    };
    return TimelineBuilder;
}());
export { TimelineBuilder };
function TimelineBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    TimelineBuilder.prototype.time;
    /** @type {?} */
    TimelineBuilder.prototype.easing;
    /** @type {?} */
    TimelineBuilder.prototype._currentKeyframe;
    /** @type {?} */
    TimelineBuilder.prototype._keyframes;
    /** @type {?} */
    TimelineBuilder.prototype._styleSummary;
    /** @type {?} */
    TimelineBuilder.prototype._localTimelineStyles;
    /** @type {?} */
    TimelineBuilder.prototype._backFill;
    /** @type {?} */
    TimelineBuilder.prototype.startTime;
    /** @type {?} */
    TimelineBuilder.prototype._globalTimelineStyles;
}
//# sourceMappingURL=animation_timeline_visitor.js.map