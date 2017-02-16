import { StyleData } from '../common/style_data';
import { AnimationDslVisitor } from './animation_dsl_visitor';
import * as meta from './animation_metadata';
import { AnimationTimelineInstruction } from './animation_timeline_instruction';
export declare function buildAnimationKeyframes(ast: meta.AnimationMetadata | meta.AnimationMetadata[], startingStyles?: StyleData, finalStyles?: StyleData): AnimationTimelineInstruction[];
export declare type StyleAtTime = {
    time: number;
    value: string | number;
};
export declare class AnimationTimelineContext {
    errors: any[];
    timelines: TimelineBuilder[];
    currentTimeline: TimelineBuilder;
    currentAnimateTimings: meta.AnimateTimings;
    previousNode: meta.AnimationMetadata;
    subContextCount: number;
    constructor(errors: any[], timelines: TimelineBuilder[], initialTimeline?: TimelineBuilder);
    createSubContext(): AnimationTimelineContext;
    transformIntoNewTimeline(newTime?: number): TimelineBuilder;
    incrementTime(time: number): void;
}
export declare class AnimationTimelineVisitor implements AnimationDslVisitor {
    buildKeyframes(ast: meta.AnimationMetadata, startingStyles: StyleData, finalStyles: StyleData): AnimationTimelineInstruction[];
    visitState(ast: meta.AnimationStateMetadata, context: any): any;
    visitTransition(ast: meta.AnimationTransitionMetadata, context: any): any;
    visitSequence(ast: meta.AnimationSequenceMetadata, context: AnimationTimelineContext): void;
    visitGroup(ast: meta.AnimationGroupMetadata, context: AnimationTimelineContext): void;
    visitAnimate(ast: meta.AnimationAnimateMetadata, context: AnimationTimelineContext): void;
    visitStyle(ast: meta.AnimationStyleMetadata, context: AnimationTimelineContext): void;
    visitKeyframeSequence(ast: meta.AnimationKeyframesSequenceMetadata, context: AnimationTimelineContext): void;
}
export declare class TimelineBuilder {
    startTime: number;
    private _globalTimelineStyles;
    duration: number;
    easing: string;
    private _currentKeyframe;
    private _keyframes;
    private _styleSummary;
    private _localTimelineStyles;
    private _backFill;
    constructor(startTime: number, _globalTimelineStyles?: StyleData);
    hasStyling(): boolean;
    readonly currentTime: number;
    fork(currentTime?: number): TimelineBuilder;
    private _loadKeyframe();
    forwardFrame(): void;
    forwardTime(time: number): void;
    private _updateStyle(prop, value);
    setStyles(styles: StyleData): void;
    snapshotCurrentStyles(): void;
    getFinalKeyframe(): StyleData;
    readonly properties: string[];
    mergeTimelineCollectedStyles(timeline: TimelineBuilder): void;
    buildKeyframes(): AnimationTimelineInstruction;
}
