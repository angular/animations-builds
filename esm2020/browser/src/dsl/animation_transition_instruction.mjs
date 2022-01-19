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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE2QkEsTUFBTSxVQUFVLDJCQUEyQixDQUN2QyxPQUFZLEVBQUUsV0FBbUIsRUFBRSxTQUFpQixFQUFFLE9BQWUsRUFDckUsbUJBQTRCLEVBQUUsVUFBc0IsRUFBRSxRQUFvQixFQUMxRSxTQUF5QyxFQUFFLGVBQXNCLEVBQ2pFLGFBQWtELEVBQ2xELGNBQW1ELEVBQUUsU0FBaUIsRUFDdEUsTUFBaUI7SUFDbkIsT0FBTztRQUNMLElBQUksNkJBQXdEO1FBQzVELE9BQU87UUFDUCxXQUFXO1FBQ1gsbUJBQW1CO1FBQ25CLFNBQVM7UUFDVCxVQUFVO1FBQ1YsT0FBTztRQUNQLFFBQVE7UUFDUixTQUFTO1FBQ1QsZUFBZTtRQUNmLGFBQWE7UUFDYixjQUFjO1FBQ2QsU0FBUztRQUNULE1BQU07S0FDUCxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHvJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRW5naW5lSW5zdHJ1Y3Rpb24sIEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvblR5cGV9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZW5naW5lX2luc3RydWN0aW9uJztcblxuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uIGV4dGVuZHMgQW5pbWF0aW9uRW5naW5lSW5zdHJ1Y3Rpb24ge1xuICBlbGVtZW50OiBhbnk7XG4gIHRyaWdnZXJOYW1lOiBzdHJpbmc7XG4gIGlzUmVtb3ZhbFRyYW5zaXRpb246IGJvb2xlYW47XG4gIGZyb21TdGF0ZTogc3RyaW5nO1xuICBmcm9tU3R5bGVzOiDJtVN0eWxlRGF0YTtcbiAgdG9TdGF0ZTogc3RyaW5nO1xuICB0b1N0eWxlczogybVTdHlsZURhdGE7XG4gIHRpbWVsaW5lczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdO1xuICBxdWVyaWVkRWxlbWVudHM6IGFueVtdO1xuICBwcmVTdHlsZVByb3BzOiBNYXA8YW55LCB7W3Byb3A6IHN0cmluZ106IGJvb2xlYW59PjtcbiAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+O1xuICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgZXJyb3JzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLFxuICAgIGlzUmVtb3ZhbFRyYW5zaXRpb246IGJvb2xlYW4sIGZyb21TdHlsZXM6IMm1U3R5bGVEYXRhLCB0b1N0eWxlczogybVTdHlsZURhdGEsXG4gICAgdGltZWxpbmVzOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10sIHF1ZXJpZWRFbGVtZW50czogYW55W10sXG4gICAgcHJlU3R5bGVQcm9wczogTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4sXG4gICAgcG9zdFN0eWxlUHJvcHM6IE1hcDxhbnksIHtbcHJvcDogc3RyaW5nXTogYm9vbGVhbn0+LCB0b3RhbFRpbWU6IG51bWJlcixcbiAgICBlcnJvcnM/OiBzdHJpbmdbXSk6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uVHlwZS5UcmFuc2l0aW9uQW5pbWF0aW9uLFxuICAgIGVsZW1lbnQsXG4gICAgdHJpZ2dlck5hbWUsXG4gICAgaXNSZW1vdmFsVHJhbnNpdGlvbixcbiAgICBmcm9tU3RhdGUsXG4gICAgZnJvbVN0eWxlcyxcbiAgICB0b1N0YXRlLFxuICAgIHRvU3R5bGVzLFxuICAgIHRpbWVsaW5lcyxcbiAgICBxdWVyaWVkRWxlbWVudHMsXG4gICAgcHJlU3R5bGVQcm9wcyxcbiAgICBwb3N0U3R5bGVQcm9wcyxcbiAgICB0b3RhbFRpbWUsXG4gICAgZXJyb3JzXG4gIH07XG59XG4iXX0=