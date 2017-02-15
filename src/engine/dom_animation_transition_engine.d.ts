/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationPlayer } from '@angular/core';
import { AnimationStyleNormalizer } from '../dsl/style_normalization/animation_style_normalizer';
import { TransitionEngine } from '../private_import_core';
import { AnimationDriver } from './animation_driver';
import { AnimationEngineInstruction } from './animation_engine_instruction';
export declare type AnimationPlayerTuple = {
    element: any;
    player: AnimationPlayer;
};
export declare class DomAnimationTransitionEngine extends TransitionEngine {
    private _driver;
    private _normalizer;
    private _flaggedInserts;
    private _queuedRemovals;
    private _queuedAnimations;
    private _activeElementAnimations;
    private _activeTransitionAnimations;
    constructor(_driver: AnimationDriver, _normalizer: AnimationStyleNormalizer);
    insertNode(container: any, element: any): void;
    removeNode(element: any): void;
    process(element: any, instructions: AnimationEngineInstruction[]): AnimationPlayer;
    private _handleTransitionAnimation(element, instruction);
    private _handleTimelineAnimation(element, instruction, previousPlayers);
    private _buildPlayer(element, instruction, previousPlayers);
    private _normalizeKeyframes(keyframes);
    private _queuePlayer(element, player);
    triggerAnimations(): void;
}
