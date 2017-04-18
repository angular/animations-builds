/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimateTimings, ɵStyleData } from '@angular/animations';
import { AnimationAnimateAst, AnimationAnimateChildAst, AnimationAst, AnimationAstVisitor, AnimationGroupAst, AnimationKeyframesSequenceAst, AnimationQueryAst, AnimationReferenceAst, AnimationSequenceAst, AnimationStaggerAst, AnimationStateAst, AnimationStyleAst, AnimationTimingAst, AnimationTransitionAst, AnimationTriggerAst } from './animation_ast';
import { AnimationTimelineInstruction } from './animation_timeline_instruction';
import { ElementInstructionMap } from './element_instruction_map';
export declare function buildAnimationTimelines(rootElement: any, ast: AnimationAst, startingStyles: ɵStyleData, finalStyles: ɵStyleData, locals: {
    [name: string]: any;
}, subInstructions?: ElementInstructionMap, errors?: any[]): AnimationTimelineInstruction[];
export declare type StyleAtTime = {
    time: number;
    value: string | number;
};
export declare class AnimationTimelineContext {
    element: any;
    subInstructions: ElementInstructionMap;
    errors: any[];
    timelines: TimelineBuilder[];
    parentContext: AnimationTimelineContext | null;
    currentTimeline: TimelineBuilder;
    currentAnimateTimings: AnimateTimings | null;
    previousNode: AnimationAst;
    subContextCount: number;
    locals: {
        [name: string]: any;
    };
    currentQueryIndex: number;
    currentQueryTotal: number;
    currentStaggerTime: number;
    constructor(element: any, subInstructions: ElementInstructionMap, errors: any[], timelines: TimelineBuilder[], initialTimeline?: TimelineBuilder);
    updateLocals(newLocals?: {
        [name: string]: any;
    }, skipIfExists?: boolean): void;
    private _copyLocals();
    createSubContext(locals?: {
        [name: string]: any;
    }, element?: any, newTime?: number): AnimationTimelineContext;
    transformIntoNewTimeline(newTime?: number): TimelineBuilder;
    appendInstructionToTimeline(instruction: AnimationTimelineInstruction, timings: AnimateTimings): AnimateTimings;
    incrementTime(time: number): void;
    delayNextStep(delay: number): void;
}
export declare class AnimationTimelineBuilderVisitor implements AnimationAstVisitor {
    buildKeyframes(rootElement: any, ast: AnimationAst, startingStyles: ɵStyleData, finalStyles: ɵStyleData, locals: {
        [name: string]: any;
    }, subInstructions?: ElementInstructionMap, errors?: any[]): AnimationTimelineInstruction[];
    visitTrigger(ast: AnimationTriggerAst, context: AnimationTimelineContext): any;
    visitState(ast: AnimationStateAst, context: AnimationTimelineContext): any;
    visitTransition(ast: AnimationTransitionAst, context: AnimationTimelineContext): any;
    visitAnimateChild(ast: AnimationAnimateChildAst, context: AnimationTimelineContext): any;
    private _visitSubInstructions(instructions, context);
    visitReference(ast: AnimationReferenceAst, context: AnimationTimelineContext): void;
    visitSequence(ast: AnimationSequenceAst, context: AnimationTimelineContext): void;
    visitGroup(ast: AnimationGroupAst, context: AnimationTimelineContext): void;
    visitTiming(ast: AnimationTimingAst, context: AnimationTimelineContext): AnimateTimings;
    visitAnimate(ast: AnimationAnimateAst, context: AnimationTimelineContext): void;
    visitStyle(ast: AnimationStyleAst, context: AnimationTimelineContext): void;
    private _applyStyles(styles, easing, treatAsEmptyStep, context);
    visitKeyframeSequence(ast: AnimationKeyframesSequenceAst, context: AnimationTimelineContext): void;
    visitQuery(ast: AnimationQueryAst, context: AnimationTimelineContext): void;
    visitStagger(ast: AnimationStaggerAst, context: AnimationTimelineContext): void;
}
export declare class TimelineBuilder {
    element: any;
    startTime: number;
    private _elementTimelineStylesLookup;
    duration: number;
    easing: string | undefined;
    private _previousKeyframe;
    private _currentKeyframe;
    private _keyframes;
    private _styleSummary;
    private _localTimelineStyles;
    private _globalTimelineStyles;
    private _backFill;
    private _currentEmptyStepKeyframe;
    constructor(element: any, startTime: number, _elementTimelineStylesLookup?: Map<any, ɵStyleData>);
    containsAnimation(): boolean;
    getCurrentStyleProperties(): string[];
    readonly currentTime: number;
    delayNextStep(delay: number): void;
    fork(element: any, currentTime?: number): TimelineBuilder;
    private _loadKeyframe();
    forwardFrame(): void;
    forwardTime(time: number): void;
    private _updateStyle(prop, value);
    allowOnlyTimelineStyles(): boolean;
    setStyles(input: (ɵStyleData | string)[], easing: string | undefined, treatAsEmptyStep: boolean, errors: any[], locals?: {
        [name: string]: any;
    }): void;
    snapshotCurrentStyles(): void;
    getFinalKeyframe(): ɵStyleData | undefined;
    readonly properties: string[];
    mergeTimelineCollectedStyles(timeline: TimelineBuilder): void;
    buildKeyframes(): AnimationTimelineInstruction;
}
