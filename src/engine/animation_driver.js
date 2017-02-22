/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵNoOpAnimationPlayer } from '@angular/core';
/**
 * @experimental
 */
export class NoOpAnimationDriver {
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        return new ɵNoOpAnimationPlayer();
    }
}
/**
 * @experimental
 */
export class AnimationDriver {
}
AnimationDriver.NOOP = new NoOpAnimationDriver();
//# sourceMappingURL=animation_driver.js.map