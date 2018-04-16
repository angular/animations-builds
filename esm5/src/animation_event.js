/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * An instance of this class is returned as an event parameter when an animation
 * callback is captured for an animation either during the start or done phase.
 *
 * ```typescript
 * \@Component({
 *   host: {
 *     '[\@myAnimationTrigger]': 'someExpression',
 *     '(\@myAnimationTrigger.start)': 'captureStartEvent($event)',
 *     '(\@myAnimationTrigger.done)': 'captureDoneEvent($event)',
 *   },
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *        // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   someExpression: any = false;
 *   captureStartEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 *
 *   captureDoneEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 * }
 * ```
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationEvent() { }
function AnimationEvent_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationEvent.prototype.fromState;
    /** @type {?} */
    AnimationEvent.prototype.toState;
    /** @type {?} */
    AnimationEvent.prototype.totalTime;
    /** @type {?} */
    AnimationEvent.prototype.phaseName;
    /** @type {?} */
    AnimationEvent.prototype.element;
    /** @type {?} */
    AnimationEvent.prototype.triggerName;
    /** @type {?} */
    AnimationEvent.prototype.disabled;
}
//# sourceMappingURL=animation_event.js.map