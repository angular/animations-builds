/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as meta from './animation_metadata';
export interface AnimationDslVisitor {
    visitState(ast: meta.AnimationStateMetadata, context: any): any;
    visitTransition(ast: meta.AnimationTransitionMetadata, context: any): any;
    visitSequence(ast: meta.AnimationSequenceMetadata, context: any): any;
    visitGroup(ast: meta.AnimationGroupMetadata, context: any): any;
    visitAnimate(ast: meta.AnimationAnimateMetadata, context: any): any;
    visitStyle(ast: meta.AnimationStyleMetadata, context: any): any;
    visitKeyframeSequence(ast: meta.AnimationKeyframesSequenceMetadata, context: any): any;
}
export declare function visitAnimationNode(visitor: AnimationDslVisitor, node: meta.AnimationMetadata, context: any): any;
