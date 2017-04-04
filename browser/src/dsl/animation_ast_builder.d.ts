/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationAnimateChildMetadata, AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationQueryMetadata, AnimationReferenceMetadata, AnimationSequenceMetadata, AnimationStaggerMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, AnimationTriggerMetadata, AnimationWaitMetadata } from '@angular/animations';
import { AnimationAnimateAst, AnimationAnimateChildAst, AnimationAst, AnimationGroupAst, AnimationKeyframesSequenceAst, AnimationQueryAst, AnimationReferenceAst, AnimationSequenceAst, AnimationStaggerAst, AnimationStateAst, AnimationStyleAst, AnimationTimingAst, AnimationTransitionAst, AnimationTriggerAst, AnimationWaitAst } from './animation_ast';
import { AnimationDslVisitor } from './animation_dsl_visitor';
export declare function buildAnimationAst(metadata: AnimationMetadata | AnimationMetadata[], errors: any[]): AnimationAst;
export declare class AnimationAstBuilderVisitor implements AnimationDslVisitor {
    build(metadata: AnimationMetadata | AnimationMetadata[], errors: any[]): AnimationAst;
    visitTrigger(metadata: AnimationTriggerMetadata, context: AnimationAstBuilderContext): AnimationTriggerAst;
    visitState(metadata: AnimationStateMetadata, context: AnimationAstBuilderContext): AnimationStateAst;
    visitTransition(metadata: AnimationTransitionMetadata, context: AnimationAstBuilderContext): AnimationTransitionAst;
    visitSequence(metadata: AnimationSequenceMetadata, context: AnimationAstBuilderContext): AnimationSequenceAst;
    visitGroup(metadata: AnimationGroupMetadata, context: AnimationAstBuilderContext): AnimationGroupAst;
    visitAnimate(metadata: AnimationAnimateMetadata, context: AnimationAstBuilderContext): AnimationAnimateAst;
    visitStyle(metadata: AnimationStyleMetadata, context: AnimationAstBuilderContext): AnimationStyleAst;
    private _makeStyleAst(metadata, context);
    private _validateStyleAst(ast, context);
    visitKeyframeSequence(metadata: AnimationKeyframesSequenceMetadata, context: AnimationAstBuilderContext): AnimationKeyframesSequenceAst;
    visitReference(metadata: AnimationReferenceMetadata, context: AnimationAstBuilderContext): AnimationReferenceAst;
    visitAnimateChild(metadata: AnimationAnimateChildMetadata, context: AnimationAstBuilderContext): AnimationAnimateChildAst;
    visitQuery(metadata: AnimationQueryMetadata, context: AnimationAstBuilderContext): AnimationQueryAst;
    visitStagger(metadata: AnimationStaggerMetadata, context: AnimationAstBuilderContext): AnimationStaggerAst;
    visitWait(metadata: AnimationWaitMetadata, context: AnimationAstBuilderContext): AnimationWaitAst;
}
export declare type StyleTimeTuple = {
    startTime: number;
    endTime: number;
};
export declare class AnimationAstBuilderContext {
    errors: any[];
    queryCount: number;
    depCount: number;
    currentTransition: AnimationTransitionMetadata;
    currentQuery: AnimationQueryMetadata;
    currentQuerySelector: string;
    currentAnimateTimings: AnimationTimingAst;
    currentTime: number;
    collectedStyles: {
        [selectorName: string]: {
            [propName: string]: StyleTimeTuple;
        };
    };
    locals: {
        [varName: string]: string | number | boolean;
    };
    constructor(errors: any[]);
}
