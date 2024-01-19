/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
    return {
        type: 0 /* AnimationTransitionInstructionType.TransitionAnimation */,
        element,
        triggerName,
        isRemovalTransition,
        fromState,
        fromStyles,
        toState,
        toStyles,
        timelines,
        queriedElements,
        preStyleProps,
        postStyleProps,
        totalTime,
        errors,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUEyQkgsTUFBTSxVQUFVLDJCQUEyQixDQUN6QyxPQUFZLEVBQ1osV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsT0FBZSxFQUNmLG1CQUE0QixFQUM1QixVQUF5QixFQUN6QixRQUF1QixFQUN2QixTQUF5QyxFQUN6QyxlQUFzQixFQUN0QixhQUFvQyxFQUNwQyxjQUFxQyxFQUNyQyxTQUFpQixFQUNqQixNQUFnQjtJQUVoQixPQUFPO1FBQ0wsSUFBSSxnRUFBd0Q7UUFDNUQsT0FBTztRQUNQLFdBQVc7UUFDWCxtQkFBbUI7UUFDbkIsU0FBUztRQUNULFVBQVU7UUFDVixPQUFPO1FBQ1AsUUFBUTtRQUNSLFNBQVM7UUFDVCxlQUFlO1FBQ2YsYUFBYTtRQUNiLGNBQWM7UUFDZCxTQUFTO1FBQ1QsTUFBTTtLQUNQLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge1xuICBBbmltYXRpb25FbmdpbmVJbnN0cnVjdGlvbixcbiAgQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZSxcbn0gZnJvbSAnLi4vcmVuZGVyL2FuaW1hdGlvbl9lbmdpbmVfaW5zdHJ1Y3Rpb24nO1xuXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBBbmltYXRpb25FbmdpbmVJbnN0cnVjdGlvbiB7XG4gIGVsZW1lbnQ6IGFueTtcbiAgdHJpZ2dlck5hbWU6IHN0cmluZztcbiAgaXNSZW1vdmFsVHJhbnNpdGlvbjogYm9vbGVhbjtcbiAgZnJvbVN0YXRlOiBzdHJpbmc7XG4gIGZyb21TdHlsZXM6IMm1U3R5bGVEYXRhTWFwO1xuICB0b1N0YXRlOiBzdHJpbmc7XG4gIHRvU3R5bGVzOiDJtVN0eWxlRGF0YU1hcDtcbiAgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW107XG4gIHF1ZXJpZWRFbGVtZW50czogYW55W107XG4gIHByZVN0eWxlUHJvcHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PjtcbiAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PjtcbiAgdG90YWxUaW1lOiBudW1iZXI7XG4gIGVycm9ycz86IEVycm9yW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gIGVsZW1lbnQ6IGFueSxcbiAgdHJpZ2dlck5hbWU6IHN0cmluZyxcbiAgZnJvbVN0YXRlOiBzdHJpbmcsXG4gIHRvU3RhdGU6IHN0cmluZyxcbiAgaXNSZW1vdmFsVHJhbnNpdGlvbjogYm9vbGVhbixcbiAgZnJvbVN0eWxlczogybVTdHlsZURhdGFNYXAsXG4gIHRvU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCxcbiAgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sXG4gIHF1ZXJpZWRFbGVtZW50czogYW55W10sXG4gIHByZVN0eWxlUHJvcHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PixcbiAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PixcbiAgdG90YWxUaW1lOiBudW1iZXIsXG4gIGVycm9ycz86IEVycm9yW10sXG4pOiBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvblR5cGUuVHJhbnNpdGlvbkFuaW1hdGlvbixcbiAgICBlbGVtZW50LFxuICAgIHRyaWdnZXJOYW1lLFxuICAgIGlzUmVtb3ZhbFRyYW5zaXRpb24sXG4gICAgZnJvbVN0YXRlLFxuICAgIGZyb21TdHlsZXMsXG4gICAgdG9TdGF0ZSxcbiAgICB0b1N0eWxlcyxcbiAgICB0aW1lbGluZXMsXG4gICAgcXVlcmllZEVsZW1lbnRzLFxuICAgIHByZVN0eWxlUHJvcHMsXG4gICAgcG9zdFN0eWxlUHJvcHMsXG4gICAgdG90YWxUaW1lLFxuICAgIGVycm9ycyxcbiAgfTtcbn1cbiJdfQ==