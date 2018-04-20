/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { Injectable } from '@angular/core';
import { containsElement, invokeQuery, matchesElement, validateStyleProperty } from './shared';
/**
 * \@experimental
 */
var NoopAnimationDriver = /** @class */ (function () {
    function NoopAnimationDriver() {
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    NoopAnimationDriver.prototype.validateStyleProperty = /**
     * @param {?} prop
     * @return {?}
     */
    function (prop) { return validateStyleProperty(prop); };
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    NoopAnimationDriver.prototype.matchesElement = /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    function (element, selector) {
        return matchesElement(element, selector);
    };
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    NoopAnimationDriver.prototype.containsElement = /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    function (elm1, elm2) { return containsElement(elm1, elm2); };
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    NoopAnimationDriver.prototype.query = /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    function (element, selector, multi) {
        return invokeQuery(element, selector, multi);
    };
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    NoopAnimationDriver.prototype.computeStyle = /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    function (element, prop, defaultValue) {
        return defaultValue || '';
    };
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    NoopAnimationDriver.prototype.animate = /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    function (element, keyframes, duration, delay, easing, previousPlayers, scrubberAccessRequested) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        return new NoopAnimationPlayer(duration, delay);
    };
    NoopAnimationDriver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NoopAnimationDriver.ctorParameters = function () { return []; };
    return NoopAnimationDriver;
}());
export { NoopAnimationDriver };
function NoopAnimationDriver_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    NoopAnimationDriver.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    NoopAnimationDriver.ctorParameters;
}
/**
 * \@experimental
 * @abstract
 */
var AnimationDriver = /** @class */ (function () {
    function AnimationDriver() {
    }
    AnimationDriver.NOOP = new NoopAnimationDriver();
    return AnimationDriver;
}());
export { AnimationDriver };
function AnimationDriver_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationDriver.NOOP;
    /**
     * @abstract
     * @param {?} prop
     * @return {?}
     */
    AnimationDriver.prototype.validateStyleProperty = function (prop) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    AnimationDriver.prototype.matchesElement = function (element, selector) { };
    /**
     * @abstract
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    AnimationDriver.prototype.containsElement = function (elm1, elm2) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    AnimationDriver.prototype.query = function (element, selector, multi) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    AnimationDriver.prototype.computeStyle = function (element, prop, defaultValue) { };
    /**
     * @abstract
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?=} easing
     * @param {?=} previousPlayers
     * @param {?=} scrubberAccessRequested
     * @return {?}
     */
    AnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers, scrubberAccessRequested) { };
}
//# sourceMappingURL=animation_driver.js.map