/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TransitionFactory } from '@angular/core';
import { StyleData } from '../common/style_data';
import { AnimationTransitionMetadata } from './animation_metadata';
import { TransitionMatcherFn } from './animation_transition_expr';
import { AnimationTransitionInstruction } from './animation_transition_instruction';
export declare class AnimationTransitionFactory implements TransitionFactory {
    private _triggerName;
    private matchFns;
    private _stateStyles;
    private _animationAst;
    constructor(_triggerName: string, ast: AnimationTransitionMetadata, matchFns: TransitionMatcherFn[], _stateStyles: {
        [stateName: string]: StyleData;
    });
    match(currentState: any, nextState: any): AnimationTransitionInstruction;
}
