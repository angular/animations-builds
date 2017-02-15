/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationPlayer } from '@angular/core';
import { StyleData } from '../src/common/style_data';
import { AnimationDriver } from '../src/engine/animation_driver';
import { NoOpAnimationPlayer } from '../src/private_import_core';
export declare class MockAnimationDriver implements AnimationDriver {
    static log: AnimationPlayer[];
    animate(element: any, keyframes: StyleData[], duration: number, delay: number, easing: string, previousPlayers?: AnimationPlayer[]): AnimationPlayer;
}
export declare class MockAnimationPlayer extends NoOpAnimationPlayer {
    element: any;
    keyframes: StyleData[];
    duration: number;
    delay: number;
    easing: string;
    previousPlayers: AnimationPlayer[];
    constructor(element: any, keyframes: StyleData[], duration: number, delay: number, easing: string, previousPlayers: AnimationPlayer[]);
}
