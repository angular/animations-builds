/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationStyles } from '@angular/core';
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
var Animation = (function () {
    /**
     * @param {?} input
     */
    function Animation(input) {
        var ast = Array.isArray(input) ? sequence(input) : input;
        var errors = validateAnimationSequence(ast);
        if (errors.length) {
            var errorMessage = "animation validation failed:\n" + errors.join("\n");
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @return {?}
     */
    Animation.prototype.buildTimelines = function (startingStyles, destinationStyles) {
        var /** @type {?} */ start = Array.isArray(startingStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (startingStyles))) : (startingStyles);
        var /** @type {?} */ dest = Array.isArray(destinationStyles) ?
            normalizeStyles(new AnimationStyles(/** @type {?} */ (destinationStyles))) : (destinationStyles);
        return buildAnimationKeyframes(this._animationAst, start, dest);
    };
    /**
     * @param {?} injector
     * @param {?} element
     * @param {?=} startingStyles
     * @param {?=} destinationStyles
     * @return {?}
     */
    Animation.prototype.create = function (injector, element, startingStyles, destinationStyles) {
        if (startingStyles === void 0) { startingStyles = {}; }
        if (destinationStyles === void 0) { destinationStyles = {}; }
        var /** @type {?} */ instructions = this.buildTimelines(startingStyles, destinationStyles);
        // note the code below is only here to make the tests happy (once the new renderer is
        // within core then the code below will interact with Renderer.transition(...))
        var /** @type {?} */ driver = injector.get(AnimationDriver);
        var /** @type {?} */ normalizer = injector.get(AnimationStyleNormalizer);
        var /** @type {?} */ engine = new DomAnimationTransitionEngine(driver, normalizer);
        return engine.process(element, instructions);
    };
    return Animation;
}());
export { Animation };
function Animation_tsickle_Closure_declarations() {
    /** @type {?} */
    Animation.prototype._animationAst;
}
//# sourceMappingURL=animation.js.map