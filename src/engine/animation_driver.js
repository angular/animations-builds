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
export class NoOpAnimationDriver {
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        return new NoOpAnimationPlayer();
    }
}
/**
 * @experimental
 */
export class AnimationDriver {
}
AnimationDriver.NOOP = new NoOpAnimationDriver();
//# sourceMappingURL=animation_driver.js.map