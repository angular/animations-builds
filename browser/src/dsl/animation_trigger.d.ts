/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵStyleData } from '@angular/animations';
import { AnimationTriggerAst } from './animation_ast';
import { AnimationTransitionFactory } from './animation_transition_factory';
/**
 * @experimental Animation support is experimental.
 */
export declare function buildTrigger(name: string, ast: AnimationTriggerAst): AnimationTrigger;
/**
* @experimental Animation support is experimental.
*/
export declare class AnimationTrigger {
    name: string;
    ast: AnimationTriggerAst;
    transitionFactories: AnimationTransitionFactory[];
    fallbackTransition: AnimationTransitionFactory;
    states: {
        [stateName: string]: ɵStyleData;
    };
    constructor(name: string, ast: AnimationTriggerAst);
    readonly containsQueries: boolean;
    matchTransition(currentState: any, nextState: any): AnimationTransitionFactory | null;
}
