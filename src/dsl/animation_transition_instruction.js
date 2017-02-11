/**
 * @param {?} triggerName
 * @param {?} isRemovalTransition
 * @param {?} fromStyles
 * @param {?} toStyles
 * @param {?} timelines
 * @return {?}
 */
export function createTransitionInstruction(triggerName, isRemovalTransition, fromStyles, toStyles, timelines) {
    return {
        type: 0 /* TransitionAnimation */,
        triggerName,
        isRemovalTransition,
        fromStyles,
        toStyles,
        timelines
    };
}
//# sourceMappingURL=animation_transition_instruction.js.map