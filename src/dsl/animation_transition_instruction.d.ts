/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StyleData } from '../common/style_data';
import { AnimationEngineInstruction } from '../engine/animation_engine_instruction';
import { AnimationTimelineInstruction } from './animation_timeline_instruction';
export interface AnimationTransitionInstruction extends AnimationEngineInstruction {
    triggerName: string;
    isRemovalTransition: boolean;
    fromStyles: StyleData;
    toStyles: StyleData;
    timelines: AnimationTimelineInstruction[];
}
export declare function createTransitionInstruction(triggerName: string, isRemovalTransition: boolean, fromStyles: StyleData, toStyles: StyleData, timelines: AnimationTimelineInstruction[]): AnimationTransitionInstruction;
