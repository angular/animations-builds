/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
export function AnimationTransitionInstruction() { }
function AnimationTransitionInstruction_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTransitionInstruction.prototype.element;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.triggerName;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.isRemovalTransition;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.fromState;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.fromStyles;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.toState;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.toStyles;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.timelines;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.queriedElements;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.preStyleProps;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.postStyleProps;
    /** @type {?} */
    AnimationTransitionInstruction.prototype.totalTime;
    /** @type {?|undefined} */
    AnimationTransitionInstruction.prototype.errors;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?} isRemovalTransition
 * @param {?} fromStyles
 * @param {?} toStyles
 * @param {?} timelines
 * @param {?} queriedElements
 * @param {?} preStyleProps
 * @param {?} postStyleProps
 * @param {?} totalTime
 * @param {?=} errors
 * @return {?}
 */
export function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
    return {
        type: 0 /* TransitionAnimation */,
        element: element,
        triggerName: triggerName,
        isRemovalTransition: isRemovalTransition,
        fromState: fromState,
        fromStyles: fromStyles,
        toState: toState,
        toStyles: toStyles,
        timelines: timelines,
        queriedElements: queriedElements,
        preStyleProps: preStyleProps,
        postStyleProps: postStyleProps,
        totalTime: totalTime,
        errors: errors
    };
}
//# sourceMappingURL=animation_transition_instruction.js.map