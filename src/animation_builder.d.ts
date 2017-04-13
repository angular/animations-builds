/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationMetadata } from './animation_metadata';
import { AnimationPlayer } from './players/animation_player';
/**
 * @experimental Animation support is experimental.
 */
export declare abstract class AnimationBuilder {
    abstract build(animation: AnimationMetadata | AnimationMetadata[]): Animation;
}
/**
 * @experimental Animation support is experimental.
 */
export declare abstract class Animation {
    abstract create(element: any, locals?: {
        [key: string]: string | number;
    }): AnimationPlayer;
}
