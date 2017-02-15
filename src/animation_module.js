/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core/index';
import { AnimationStyleNormalizer } from './dsl/style_normalization/animation_style_normalizer';
import { WebAnimationsStyleNormalizer } from './dsl/style_normalization/web_animations_style_normalizer';
import { AnimationDriver, NoOpAnimationDriver } from './engine/animation_driver';
import { DomAnimationTransitionEngine } from './engine/dom_animation_transition_engine';
import { WebAnimationsDriver, supportsWebAnimations } from './engine/web_animations/web_animations_driver';
import { TransitionEngine } from './private_import_core';
/**
 * @return {?}
 */
export function resolveDefaultAnimationDriver() {
    if (supportsWebAnimations()) {
        return new WebAnimationsDriver();
    }
    return new NoOpAnimationDriver();
}
/**
 * The module that includes all animation code such as `style()`, `animate()`, `trigger()`, etc...
 *
 * \@experimental
 */
export class AnimationModule {
}
AnimationModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    { provide: AnimationDriver, useFactory: resolveDefaultAnimationDriver },
                    { provide: AnimationStyleNormalizer, useClass: WebAnimationsStyleNormalizer },
                    { provide: TransitionEngine, useClass: DomAnimationTransitionEngine }
                ]
            },] },
];
/** @nocollapse */
AnimationModule.ctorParameters = () => [];
function AnimationModule_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationModule.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    AnimationModule.ctorParameters;
}
//# sourceMappingURL=animation_module.js.map