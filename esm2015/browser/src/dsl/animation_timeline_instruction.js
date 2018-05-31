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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9kc2wvYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLE1BQU0sb0NBQ0YsT0FBWSxFQUFFLFNBQXVCLEVBQUUsYUFBdUIsRUFBRSxjQUF3QixFQUN4RixRQUFnQixFQUFFLEtBQWEsRUFBRSxTQUF3QixJQUFJLEVBQzdELGNBQXVCLEtBQUs7SUFDOUIsT0FBTztRQUNMLElBQUksMkJBQXNEO1FBQzFELE9BQU87UUFDUCxTQUFTO1FBQ1QsYUFBYTtRQUNiLGNBQWM7UUFDZCxRQUFRO1FBQ1IsS0FBSztRQUNMLFNBQVMsRUFBRSxRQUFRLEdBQUcsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXO0tBQ2pELENBQUM7Q0FDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb25FbmdpbmVJbnN0cnVjdGlvbiwgQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZX0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9lbmdpbmVfaW5zdHJ1Y3Rpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBBbmltYXRpb25FbmdpbmVJbnN0cnVjdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAga2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdO1xuICBwcmVTdHlsZVByb3BzOiBzdHJpbmdbXTtcbiAgcG9zdFN0eWxlUHJvcHM6IHN0cmluZ1tdO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICBkZWxheTogbnVtYmVyO1xuICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgZWFzaW5nOiBzdHJpbmd8bnVsbDtcbiAgc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWU/OiBib29sZWFuO1xuICBzdWJUaW1lbGluZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRpbWVsaW5lSW5zdHJ1Y3Rpb24oXG4gICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sIHByZVN0eWxlUHJvcHM6IHN0cmluZ1tdLCBwb3N0U3R5bGVQcm9wczogc3RyaW5nW10sXG4gICAgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlciwgZWFzaW5nOiBzdHJpbmcgfCBudWxsID0gbnVsbCxcbiAgICBzdWJUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlKTogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZS5UaW1lbGluZUFuaW1hdGlvbixcbiAgICBlbGVtZW50LFxuICAgIGtleWZyYW1lcyxcbiAgICBwcmVTdHlsZVByb3BzLFxuICAgIHBvc3RTdHlsZVByb3BzLFxuICAgIGR1cmF0aW9uLFxuICAgIGRlbGF5LFxuICAgIHRvdGFsVGltZTogZHVyYXRpb24gKyBkZWxheSwgZWFzaW5nLCBzdWJUaW1lbGluZVxuICB9O1xufVxuIl19