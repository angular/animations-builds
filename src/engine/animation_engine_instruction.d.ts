/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TransitionInstruction } from '@angular/core';
export declare const enum AnimationTransitionInstructionType {
    TransitionAnimation = 0,
    TimelineAnimation = 1,
}
export interface AnimationEngineInstruction extends TransitionInstruction {
    type: AnimationTransitionInstructionType;
}
