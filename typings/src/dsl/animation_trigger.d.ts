/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Trigger } from '@angular/core';
import { StyleData } from '../common/style_data';
import { AnimationMetadata, AnimationTransitionMetadata } from './animation_metadata';
import { AnimationTransitionFactory } from './animation_transition_factory';
import { AnimationTransitionInstruction } from './animation_transition_instruction';
/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular2's
 animation DSL language. If this information is new, please navigate to the {@link
 Component#animations-anchor component animations metadata page} to gain a better understanding of
 how animations in Angular2 are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and {@link
 transition transition} entries that will be evaluated when the expression bound to the trigger
 changes.
 *
 * Triggers are registered within the component annotation data under the {@link
 Component#animations-anchor animations section}. An animation trigger can be placed on an element
 within a template by referencing the name of the trigger followed by the expression value that the
 trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 provided `animation` value is expected to be an array consisting of {@link state state} and {@link
 transition transition} declarations.
 *
 * ```typescript
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *       state(...),
 *       state(...),
 *       transition(...),
 *       transition(...)
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "something";
 * }
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger;
/**
* @experimental Animation support is experimental.
*/
export declare class AnimationTrigger implements Trigger {
    name: string;
    private _transitionAsts;
    transitionFactories: AnimationTransitionFactory[];
    states: {
        [stateName: string]: StyleData;
    };
    constructor(name: string, states: {
        [stateName: string]: StyleData;
    }, _transitionAsts: AnimationTransitionMetadata[]);
    matchTransition(currentState: any, nextState: any): AnimationTransitionInstruction;
}
