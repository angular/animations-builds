import { AnimationDslVisitor } from './animation_dsl_visitor';
import * as meta from './animation_metadata';
export declare type StyleTimeTuple = {
    startTime: number;
    endTime: number;
};
export declare function validateAnimationSequence(ast: meta.AnimationMetadata): string[];
export declare class AnimationValidatorVisitor implements AnimationDslVisitor {
    validate(ast: meta.AnimationMetadata): string[];
    visitState(ast: meta.AnimationStateMetadata, context: any): any;
    visitTransition(ast: meta.AnimationTransitionMetadata, context: any): any;
    visitSequence(ast: meta.AnimationSequenceMetadata, context: AnimationValidatorContext): any;
    visitGroup(ast: meta.AnimationGroupMetadata, context: AnimationValidatorContext): any;
    visitAnimate(ast: meta.AnimationAnimateMetadata, context: AnimationValidatorContext): any;
    visitStyle(ast: meta.AnimationStyleMetadata, context: AnimationValidatorContext): any;
    visitKeyframeSequence(ast: meta.AnimationKeyframesSequenceMetadata, context: AnimationValidatorContext): any;
}
export declare class AnimationValidatorContext {
    errors: string[];
    currentTime: number;
    currentAnimateTimings: meta.AnimateTimings;
    collectedStyles: {
        [propName: string]: StyleTimeTuple;
    };
}
