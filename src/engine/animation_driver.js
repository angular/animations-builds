/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoOpAnimationPlayer } from '../private_import_core';
/**
 * @experimental
 */
var NoOpAnimationDriver = (function () {
    function NoOpAnimationDriver() {
    }
    NoOpAnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        return new NoOpAnimationPlayer();
    };
    return NoOpAnimationDriver;
}());
export { NoOpAnimationDriver };
/**
 * @experimental
 */
var AnimationDriver = (function () {
    function AnimationDriver() {
    }
    return AnimationDriver;
}());
export { AnimationDriver };
AnimationDriver.NOOP = new NoOpAnimationDriver();
//# sourceMappingURL=animation_driver.js.map