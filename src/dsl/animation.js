/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationStyles } from '@angular/core/index';
import { normalizeStyles } from '../common/util';
import { AnimationDriver } from '../engine/animation_driver';
import { DomAnimationTransitionEngine } from '../engine/dom_animation_transition_engine';
import { sequence } from './animation_metadata';
import { buildAnimationKeyframes } from './animation_timeline_visitor';
import { validateAnimationSequence } from './animation_validator_visitor';
import { AnimationStyleNormalizer } from './style_normalization/animation_style_normalizer';
/**
 * \@experimental Animation support is experimental.
 */
export class Animation {
    /**
     * @param {?} input
     */
    constructor(input) {
        const ast = Array.isArray(input) ? sequence(input) : input;
        const errors = validateAnimationSequence(ast);
        if (errors.length) {
            const errorMessage = `animation validation failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @return {?}
     */
    buildTimelines(startingStyles, destinationStyles) {
        const /** @type {?} */ start = Array.isArray(startingStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (startingStyles))) : (startingStyles);
        const /** @type {?} */ dest = Array.isArray(destinationStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (destinationStyles))) : (destinationStyles);
        return buildAnimationKeyframes(this._animationAst, start, dest);
    }
    /**
     * @param {?} injector
     * @param {?} element
     * @param {?=} startingStyles
     * @param {?=} destinationStyles
     * @return {?}
     */
    create(injector, element, startingStyles = {}, destinationStyles = {}) {
        const /** @type {?} */ instructions = this.buildTimelines(startingStyles, destinationStyles);
        // note the code below is only here to make the tests happy (once the new renderer is
        // within core then the code below will interact with Renderer.transition(...))
        const /** @type {?} */ driver = injector.get(AnimationDriver);
        const /** @type {?} */ normalizer = injector.get(AnimationStyleNormalizer);
        const /** @type {?} */ engine = new DomAnimationTransitionEngine(driver, normalizer);
        return engine.process(element, instructions);
    }
}
function Animation_tsickle_Closure_declarations() {
    /** @type {?} */
    Animation.prototype._animationAst;
}
//# sourceMappingURL=animation.js.map