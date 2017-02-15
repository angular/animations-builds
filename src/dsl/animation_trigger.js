/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationStyles } from '@angular/core/index';
import { copyStyles, normalizeStyles } from '../common/util';
import { visitAnimationNode } from './animation_dsl_visitor';
import { parseTransitionExpr } from './animation_transition_expr';
import { AnimationTransitionFactory } from './animation_transition_factory';
import { validateAnimationSequence } from './animation_validator_visitor';
/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular2's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations-anchor component animations metadata page} to gain a better understanding of
 * how animations in Angular2 are used.
 *
 * `trigger` Creates an animation trigger which will a list of {\@link state state} and {\@link
 * transition transition} entries that will be evaluated when the expression bound to the trigger
 * changes.
 *
 * Triggers are registered within the component annotation data under the {\@link
 * Component#animations-anchor animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that the
 * trigger is bound to (in the form of `[\@triggerName]="expression"`.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {\@link state state} and {\@link
 * transition transition} declarations.
 *
 * ```typescript
 * \@Component({
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
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * tools/gulp-tasks/validate-commit-message.js ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} definitions
 * @return {?}
 */
export function trigger(name, definitions) {
    return new AnimationTriggerVisitor().buildTrigger(name, definitions);
}
/**
 * \@experimental Animation support is experimental.
 */
export class AnimationTrigger {
    /**
     * @param {?} name
     * @param {?} states
     * @param {?} _transitionAsts
     */
    constructor(name, states, _transitionAsts) {
        this.name = name;
        this._transitionAsts = _transitionAsts;
        this.transitionFactories = [];
        this.states = {};
        Object.keys(states).forEach(stateName => { this.states[stateName] = copyStyles(states[stateName], false); });
        const errors = [];
        _transitionAsts.forEach(ast => {
            const exprs = parseTransitionExpr(ast.expr, errors);
            const sequenceErrors = validateAnimationSequence(ast);
            if (sequenceErrors.length) {
                errors.push(...sequenceErrors);
            }
            else {
                this.transitionFactories.push(new AnimationTransitionFactory(this.name, ast, exprs, states));
            }
        });
        if (errors.length) {
            const LINE_START = '\n - ';
            throw new Error(`Animation parsing for the ${name} trigger have failed:${LINE_START}${errors.join(LINE_START)}`);
        }
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @return {?}
     */
    matchTransition(currentState, nextState) {
        for (let /** @type {?} */ i = 0; i < this.transitionFactories.length; i++) {
            let /** @type {?} */ result = this.transitionFactories[i].match(currentState, nextState);
            if (result)
                return result;
        }
        return null;
    }
}
function AnimationTrigger_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTrigger.prototype.transitionFactories;
    /** @type {?} */
    AnimationTrigger.prototype.states;
    /** @type {?} */
    AnimationTrigger.prototype.name;
    /** @type {?} */
    AnimationTrigger.prototype._transitionAsts;
}
class AnimationTriggerContext {
    constructor() {
        this.errors = [];
        this.states = {};
        this.transitions = [];
    }
}
function AnimationTriggerContext_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTriggerContext.prototype.errors;
    /** @type {?} */
    AnimationTriggerContext.prototype.states;
    /** @type {?} */
    AnimationTriggerContext.prototype.transitions;
}
class AnimationTriggerVisitor {
    /**
     * @param {?} name
     * @param {?} definitions
     * @return {?}
     */
    buildTrigger(name, definitions) {
        const /** @type {?} */ context = new AnimationTriggerContext();
        definitions.forEach(def => visitAnimationNode(this, def, context));
        return new AnimationTrigger(name, context.states, context.transitions);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) {
        context.states[ast.name] = normalizeStyles(new AnimationStyles(ast.styles.styles));
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) {
        context.transitions.push(ast);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) { }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(ast, context) { }
}
//# sourceMappingURL=animation_trigger.js.map