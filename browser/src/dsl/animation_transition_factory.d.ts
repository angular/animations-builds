/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵStyleData } from '@angular/animations';
import { TransitionAst } from './animation_ast';
import { AnimationTransitionInstruction } from './animation_transition_instruction';
import { ElementInstructionMap } from './element_instruction_map';
export declare class AnimationTransitionFactory {
    private _triggerName;
    ast: TransitionAst;
    private _stateStyles;
    constructor(_triggerName: string, ast: TransitionAst, _stateStyles: {
        [stateName: string]: ɵStyleData;
    });
    match(currentState: any, nextState: any): boolean;
    build(element: any, currentState: any, nextState: any, locals?: {
        [varName: string]: string | number;
    }, subInstructions?: ElementInstructionMap): AnimationTransitionInstruction | undefined;
}
