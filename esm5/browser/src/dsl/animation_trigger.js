/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AnimationStateStyles, AnimationTransitionFactory } from './animation_transition_factory';
/**
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} ast
 * @return {?}
 */
export function buildTrigger(name, ast) {
    return new AnimationTrigger(name, ast);
}
/**
 * \@experimental Animation support is experimental.
 */
var /**
 * \@experimental Animation support is experimental.
 */
AnimationTrigger = /** @class */ (function () {
    function AnimationTrigger(name, ast) {
        var _this = this;
        this.name = name;
        this.ast = ast;
        this.transitionFactories = [];
        this.states = {};
        ast.states.forEach(function (ast) {
            var /** @type {?} */ defaultParams = (ast.options && ast.options.params) || {};
            _this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams);
        });
        balanceProperties(this.states, 'true', '1');
        balanceProperties(this.states, 'false', '0');
        ast.transitions.forEach(function (ast) {
            _this.transitionFactories.push(new AnimationTransitionFactory(name, ast, _this.states));
        });
        this.fallbackTransition = createFallbackTransition(name, this.states);
    }
    Object.defineProperty(AnimationTrigger.prototype, "containsQueries", {
        get: /**
         * @return {?}
         */
        function () { return this.ast.queryCount > 0; },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    AnimationTrigger.prototype.matchTransition = /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    function (currentState, nextState, element, params) {
        var /** @type {?} */ entry = this.transitionFactories.find(function (f) { return f.match(currentState, nextState, element, params); });
        return entry || null;
    };
    /**
     * @param {?} currentState
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    AnimationTrigger.prototype.matchStyles = /**
     * @param {?} currentState
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    function (currentState, params, errors) {
        return this.fallbackTransition.buildStyles(currentState, params, errors);
    };
    return AnimationTrigger;
}());
/**
 * \@experimental Animation support is experimental.
 */
export { AnimationTrigger };
function AnimationTrigger_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTrigger.prototype.transitionFactories;
    /** @type {?} */
    AnimationTrigger.prototype.fallbackTransition;
    /** @type {?} */
    AnimationTrigger.prototype.states;
    /** @type {?} */
    AnimationTrigger.prototype.name;
    /** @type {?} */
    AnimationTrigger.prototype.ast;
}
/**
 * @param {?} triggerName
 * @param {?} states
 * @return {?}
 */
function createFallbackTransition(triggerName, states) {
    var /** @type {?} */ matchers = [function (fromState, toState) { return true; }];
    var /** @type {?} */ animation = { type: 2 /* Sequence */, steps: [], options: null };
    var /** @type {?} */ transition = {
        type: 1 /* Transition */,
        animation: animation,
        matchers: matchers,
        options: null,
        queryCount: 0,
        depCount: 0
    };
    return new AnimationTransitionFactory(triggerName, transition, states);
}
/**
 * @param {?} obj
 * @param {?} key1
 * @param {?} key2
 * @return {?}
 */
function balanceProperties(obj, key1, key2) {
    if (obj.hasOwnProperty(key1)) {
        if (!obj.hasOwnProperty(key2)) {
            obj[key2] = obj[key1];
        }
    }
    else if (obj.hasOwnProperty(key2)) {
        obj[key1] = obj[key2];
    }
}
//# sourceMappingURL=animation_trigger.js.map