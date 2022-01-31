/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
    return {
        type: 0 /* TransitionAnimation */,
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
        errors
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUF3QkgsTUFBTSxVQUFVLDJCQUEyQixDQUN2QyxPQUFZLEVBQUUsV0FBbUIsRUFBRSxTQUFpQixFQUFFLE9BQWUsRUFDckUsbUJBQTRCLEVBQUUsVUFBeUIsRUFBRSxRQUF1QixFQUNoRixTQUF5QyxFQUFFLGVBQXNCLEVBQ2pFLGFBQW9DLEVBQUUsY0FBcUMsRUFBRSxTQUFpQixFQUM5RixNQUFpQjtJQUNuQixPQUFPO1FBQ0wsSUFBSSw2QkFBd0Q7UUFDNUQsT0FBTztRQUNQLFdBQVc7UUFDWCxtQkFBbUI7UUFDbkIsU0FBUztRQUNULFVBQVU7UUFDVixPQUFPO1FBQ1AsUUFBUTtRQUNSLFNBQVM7UUFDVCxlQUFlO1FBQ2YsYUFBYTtRQUNiLGNBQWM7UUFDZCxTQUFTO1FBQ1QsTUFBTTtLQUNQLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkVuZ2luZUluc3RydWN0aW9uLCBBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb25UeXBlfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2VuZ2luZV9pbnN0cnVjdGlvbic7XG5cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfaW5zdHJ1Y3Rpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiBleHRlbmRzIEFuaW1hdGlvbkVuZ2luZUluc3RydWN0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICB0cmlnZ2VyTmFtZTogc3RyaW5nO1xuICBpc1JlbW92YWxUcmFuc2l0aW9uOiBib29sZWFuO1xuICBmcm9tU3RhdGU6IHN0cmluZztcbiAgZnJvbVN0eWxlczogybVTdHlsZURhdGFNYXA7XG4gIHRvU3RhdGU6IHN0cmluZztcbiAgdG9TdHlsZXM6IMm1U3R5bGVEYXRhTWFwO1xuICB0aW1lbGluZXM6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXTtcbiAgcXVlcmllZEVsZW1lbnRzOiBhbnlbXTtcbiAgcHJlU3R5bGVQcm9wczogTWFwPGFueSwgU2V0PHN0cmluZz4+O1xuICBwb3N0U3R5bGVQcm9wczogTWFwPGFueSwgU2V0PHN0cmluZz4+O1xuICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgZXJyb3JzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLFxuICAgIGlzUmVtb3ZhbFRyYW5zaXRpb246IGJvb2xlYW4sIGZyb21TdHlsZXM6IMm1U3R5bGVEYXRhTWFwLCB0b1N0eWxlczogybVTdHlsZURhdGFNYXAsXG4gICAgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIHF1ZXJpZWRFbGVtZW50czogYW55W10sXG4gICAgcHJlU3R5bGVQcm9wczogTWFwPGFueSwgU2V0PHN0cmluZz4+LCBwb3N0U3R5bGVQcm9wczogTWFwPGFueSwgU2V0PHN0cmluZz4+LCB0b3RhbFRpbWU6IG51bWJlcixcbiAgICBlcnJvcnM/OiBzdHJpbmdbXSk6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZS5UcmFuc2l0aW9uQW5pbWF0aW9uLFxuICAgIGVsZW1lbnQsXG4gICAgdHJpZ2dlck5hbWUsXG4gICAgaXNSZW1vdmFsVHJhbnNpdGlvbixcbiAgICBmcm9tU3RhdGUsXG4gICAgZnJvbVN0eWxlcyxcbiAgICB0b1N0YXRlLFxuICAgIHRvU3R5bGVzLFxuICAgIHRpbWVsaW5lcyxcbiAgICBxdWVyaWVkRWxlbWVudHMsXG4gICAgcHJlU3R5bGVQcm9wcyxcbiAgICBwb3N0U3R5bGVQcm9wcyxcbiAgICB0b3RhbFRpbWUsXG4gICAgZXJyb3JzXG4gIH07XG59XG4iXX0=