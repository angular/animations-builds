/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
export function AnimationTimelineInstruction() { }
function AnimationTimelineInstruction_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTimelineInstruction.prototype.element;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.keyframes;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.preStyleProps;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.postStyleProps;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.duration;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.delay;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.totalTime;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.easing;
    /** @type {?|undefined} */
    AnimationTimelineInstruction.prototype.stretchStartingKeyframe;
    /** @type {?} */
    AnimationTimelineInstruction.prototype.subTimeline;
}
/**
 * @param {?} element
 * @param {?} keyframes
 * @param {?} preStyleProps
 * @param {?} postStyleProps
 * @param {?} duration
 * @param {?} delay
 * @param {?=} easing
 * @param {?=} subTimeline
 * @return {?}
 */
export function createTimelineInstruction(element, keyframes, preStyleProps, postStyleProps, duration, delay, easing = null, subTimeline = false) {
    return {
        type: 1 /* TimelineAnimation */,
        element,
        keyframes,
        preStyleProps,
        postStyleProps,
        duration,
        delay,
        totalTime: duration + delay, easing, subTimeline
    };
}
//# sourceMappingURL=animation_timeline_instruction.js.map