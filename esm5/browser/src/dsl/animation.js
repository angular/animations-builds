/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { ENTER_CLASSNAME, LEAVE_CLASSNAME, normalizeStyles } from '../util';
import { buildAnimationAst } from './animation_ast_builder';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { ElementInstructionMap } from './element_instruction_map';
var Animation = /** @class */ (function () {
    function Animation(_driver, input) {
        this._driver = _driver;
        var /** @type {?} */ errors = [];
        var /** @type {?} */ ast = buildAnimationAst(_driver, input, errors);
        if (errors.length) {
            var /** @type {?} */ errorMessage = "animation validation failed:\n" + errors.join("\n");
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} element
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @param {?} options
     * @param {?=} subInstructions
     * @return {?}
     */
    Animation.prototype.buildTimelines = /**
     * @param {?} element
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @param {?} options
     * @param {?=} subInstructions
     * @return {?}
     */
    function (element, startingStyles, destinationStyles, options, subInstructions) {
        var /** @type {?} */ start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) : /** @type {?} */ (startingStyles);
        var /** @type {?} */ dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) : /** @type {?} */ (destinationStyles);
        var /** @type {?} */ errors = [];
        subInstructions = subInstructions || new ElementInstructionMap();
        var /** @type {?} */ result = buildAnimationTimelines(this._driver, element, this._animationAst, ENTER_CLASSNAME, LEAVE_CLASSNAME, start, dest, options, subInstructions, errors);
        if (errors.length) {
            var /** @type {?} */ errorMessage = "animation building failed:\n" + errors.join("\n");
            throw new Error(errorMessage);
        }
        return result;
    };
    return Animation;
}());
export { Animation };
function Animation_tsickle_Closure_declarations() {
    /** @type {?} */
    Animation.prototype._animationAst;
    /** @type {?} */
    Animation.prototype._driver;
}
//# sourceMappingURL=animation.js.map