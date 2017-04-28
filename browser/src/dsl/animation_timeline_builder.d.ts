/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimateTimings, ɵStyleData } from '@angular/animations';
import { AnimateAst, AnimateChildAst, AnimateRefAst, Ast, AstVisitor, GroupAst, KeyframesAst, QueryAst, ReferenceAst, SequenceAst, StaggerAst, StateAst, StyleAst, TimingAst, TransitionAst, TriggerAst } from './animation_ast';
import { AnimationTimelineInstruction } from './animation_timeline_instruction';
import { ElementInstructionMap } from './element_instruction_map';
export declare function buildAnimationTimelines(rootElement: any, ast: Ast, startingStyles: ɵStyleData, finalStyles: ɵStyleData, locals: {
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
    previousNode: Ast;
    subContextCount: number;
    locals: {
        [name: string]: any;
    };
    currentQueryIndex: number;
    currentQueryTotal: number;
    currentStaggerTime: number;
    constructor(element: any, subInstructions: ElementInstructionMap, errors: any[], timelines: TimelineBuilder[], initialTimeline?: TimelineBuilder);
    updateLocals(newLocals: {
        [name: string]: any;
    } | null, skipIfExists?: boolean): void;
    private _copyLocals();
    createSubContext(locals?: {
        [name: string]: any;
    } | null, element?: any, newTime?: number): AnimationTimelineContext;
    transformIntoNewTimeline(newTime?: number): TimelineBuilder;
    appendInstructionToTimeline(instruction: AnimationTimelineInstruction, timings: AnimateTimings): AnimateTimings;
    incrementTime(time: number): void;
    delayNextStep(delay: number): void;
}
export declare class AnimationTimelineBuilderVisitor implements AstVisitor {
    buildKeyframes(rootElement: any, ast: Ast, startingStyles: ɵStyleData, finalStyles: ɵStyleData, locals: {
        [name: string]: any;
    }, subInstructions?: ElementInstructionMap, errors?: any[]): AnimationTimelineInstruction[];
    visitTrigger(ast: TriggerAst, context: AnimationTimelineContext): any;
    visitState(ast: StateAst, context: AnimationTimelineContext): any;
    visitTransition(ast: TransitionAst, context: AnimationTimelineContext): any;
    visitAnimateChild(ast: AnimateChildAst, context: AnimationTimelineContext): any;
    visitAnimateRef(ast: AnimateRefAst, context: AnimationTimelineContext): any;
    private _visitSubInstructions(instructions, context);
    visitReference(ast: ReferenceAst, context: AnimationTimelineContext): void;
    visitSequence(ast: SequenceAst, context: AnimationTimelineContext): void;
    visitGroup(ast: GroupAst, context: AnimationTimelineContext): void;
    visitTiming(ast: TimingAst, context: AnimationTimelineContext): AnimateTimings;
    visitAnimate(ast: AnimateAst, context: AnimationTimelineContext): void;
    visitStyle(ast: StyleAst, context: AnimationTimelineContext): void;
    visitKeyframes(ast: KeyframesAst, context: AnimationTimelineContext): void;
    visitQuery(ast: QueryAst, context: AnimationTimelineContext): void;
    visitStagger(ast: StaggerAst, context: AnimationTimelineContext): void;
}
export declare class TimelineBuilder {
    element: any;
    startTime: number;
    private _elementTimelineStylesLookup;
    duration: number;
    easing: string | null;
    private _previousKeyframe;
    private _currentKeyframe;
    private _keyframes;
    private _styleSummary;
    private _localTimelineStyles;
    private _globalTimelineStyles;
    private _pendingStyles;
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
    applyEmptyStep(easing: string | null): void;
    setStyles(input: (ɵStyleData | string)[], easing: string | null, errors: any[], locals?: {
        [name: string]: any;
    }): void;
    applyStylesToKeyframe(): void;
    snapshotCurrentStyles(): void;
    getFinalKeyframe(): ɵStyleData | undefined;
    readonly properties: string[];
    mergeTimelineCollectedStyles(timeline: TimelineBuilder): void;
    buildKeyframes(): AnimationTimelineInstruction;
}
