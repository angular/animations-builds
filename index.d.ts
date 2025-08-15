/**
 * @license Angular v21.0.0-next.0+sha-3f88fbd
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { RendererFactory2 } from '@angular/core';
import { AnimationMetadata, AnimationOptions, AnimationPlayer } from './animation_player.d.js';
export { AUTO_STYLE, AnimateChildOptions, AnimateTimings, AnimationAnimateChildMetadata, AnimationAnimateMetadata, AnimationAnimateRefMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadataType, AnimationQueryMetadata, AnimationQueryOptions, AnimationReferenceMetadata, AnimationSequenceMetadata, AnimationStaggerMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, AnimationTriggerMetadata, NoopAnimationPlayer, animate, animateChild, animation, group, keyframes, query, sequence, stagger, state, style, transition, trigger, useAnimation, ɵStyleData, ɵStyleDataMap } from './animation_player.d.js';

/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
 * // require the service as a dependency
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first define a reusable animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // use the returned factory object to create a player
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
declare abstract class AnimationBuilder {
    /**
     * Builds a factory for producing a defined animation.
     * @param animation A reusable animation definition.
     * @returns A factory object that can create a player for the defined animation.
     * @see {@link animate}
     */
    abstract build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory;
    static ɵfac: i0.ɵɵFactoryDeclaration<AnimationBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AnimationBuilder>;
}
/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
declare abstract class AnimationFactory {
    /**
     * Creates an `AnimationPlayer` instance for the reusable animation defined by
     * the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
     * method that created this factory and attaches the new player a DOM element.
     *
     * @param element The DOM element to which to attach the player.
     * @param options A set of options that can include a time delay and
     * additional developer-defined parameters.
     */
    abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}
declare class BrowserAnimationBuilder extends AnimationBuilder {
    private animationModuleType;
    private _nextAnimationId;
    private _renderer;
    constructor(rootRenderer: RendererFactory2, doc: Document);
    build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory;
    static ɵfac: i0.ɵɵFactoryDeclaration<BrowserAnimationBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BrowserAnimationBuilder>;
}

/**
 * An instance of this class is returned as an event parameter when an animation
 * callback is captured for an animation either during the start or done phase.
 *
 * ```ts
 * @Component({
 *   host: {
 *     '[@myAnimationTrigger]': 'someExpression',
 *     '(@myAnimationTrigger.start)': 'captureStartEvent($event)',
 *     '(@myAnimationTrigger.done)': 'captureDoneEvent($event)',
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
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
interface AnimationEvent {
    /**
     * The name of the state from which the animation is triggered.
     */
    fromState: string;
    /**
     * The name of the state in which the animation completes.
     */
    toState: string;
    /**
     * The time it takes the animation to complete, in milliseconds.
     */
    totalTime: number;
    /**
     * The animation phase in which the callback was invoked, one of
     * "start" or "done".
     */
    phaseName: string;
    /**
     * The element to which the animation is attached.
     */
    element: any;
    /**
     * Internal.
     */
    triggerName: string;
    /**
     * Internal.
     */
    disabled: boolean;
}

/**
 * The list of error codes used in runtime code of the `animations` package.
 * Reserved error code range: 3000-3999.
 */
declare const enum RuntimeErrorCode {
    INVALID_TIMING_VALUE = 3000,
    INVALID_STYLE_PARAMS = 3001,
    INVALID_STYLE_VALUE = 3002,
    INVALID_PARAM_VALUE = 3003,
    INVALID_NODE_TYPE = 3004,
    INVALID_CSS_UNIT_VALUE = 3005,
    INVALID_TRIGGER = 3006,
    INVALID_DEFINITION = 3007,
    INVALID_STATE = 3008,
    INVALID_PROPERTY = 3009,
    INVALID_PARALLEL_ANIMATION = 3010,
    INVALID_KEYFRAMES = 3011,
    INVALID_OFFSET = 3012,
    INVALID_STAGGER = 3013,
    INVALID_QUERY = 3014,
    INVALID_EXPRESSION = 3015,
    INVALID_TRANSITION_ALIAS = 3016,
    NEGATIVE_STEP_VALUE = 3100,
    NEGATIVE_DELAY_VALUE = 3101,
    KEYFRAME_OFFSETS_OUT_OF_ORDER = 3200,
    KEYFRAMES_MISSING_OFFSETS = 3202,
    MISSING_OR_DESTROYED_ANIMATION = 3300,
    MISSING_PLAYER = 3301,
    MISSING_TRIGGER = 3302,
    MISSING_EVENT = 3303,
    UNSUPPORTED_TRIGGER_EVENT = 3400,
    UNREGISTERED_TRIGGER = 3401,
    TRIGGER_TRANSITIONS_FAILED = 3402,
    TRIGGER_PARSING_FAILED = 3403,
    TRIGGER_BUILD_FAILED = 3404,
    VALIDATION_FAILED = 3500,
    BUILDING_FAILED = 3501,
    ANIMATION_FAILED = 3502,
    REGISTRATION_FAILED = 3503,
    CREATE_ANIMATION_FAILED = 3504,
    TRANSITION_FAILED = 3505,
    BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS = 3600
}

/**
 * A programmatic controller for a group of reusable animations.
 * Used internally to control animations.
 *
 * @see {@link AnimationPlayer}
 * @see {@link animations/group group}
 *
 */
declare class AnimationGroupPlayer implements AnimationPlayer {
    private _onDoneFns;
    private _onStartFns;
    private _finished;
    private _started;
    private _destroyed;
    private _onDestroyFns;
    parentPlayer: AnimationPlayer | null;
    totalTime: number;
    readonly players: AnimationPlayer[];
    constructor(_players: AnimationPlayer[]);
    private _onFinish;
    init(): void;
    onStart(fn: () => void): void;
    private _onStart;
    onDone(fn: () => void): void;
    onDestroy(fn: () => void): void;
    hasStarted(): boolean;
    play(): void;
    pause(): void;
    restart(): void;
    finish(): void;
    destroy(): void;
    private _onDestroy;
    reset(): void;
    setPosition(p: number): void;
    getPosition(): number;
    beforeDestroy(): void;
}

declare const ɵPRE_STYLE = "!";

export { AnimationBuilder, AnimationFactory, AnimationMetadata, AnimationOptions, AnimationPlayer, AnimationGroupPlayer as ɵAnimationGroupPlayer, BrowserAnimationBuilder as ɵBrowserAnimationBuilder, ɵPRE_STYLE, RuntimeErrorCode as ɵRuntimeErrorCode };
export type { AnimationEvent };
