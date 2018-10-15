/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Represents a set of CSS styles for use in an animation style.
 * @record
 */
export function ɵStyleData() { }
/** @enum {number} */
var AnimationMetadataType = {
    /**
       * Associates a named animation state with a set of CSS styles.
       * See `state()`
       */
    State: 0,
    /**
       * Data for a transition from one animation state to another.
       * See `transition()`
       */
    Transition: 1,
    /**
       * Contains a set of animation steps.
       * See `sequence()`
       */
    Sequence: 2,
    /**
       * Contains a set of animation steps.
       * See `{@link animations/group group()}`
       */
    Group: 3,
    /**
       * Contains an animation step.
       * See `animate()`
       */
    Animate: 4,
    /**
       * Contains a set of animation steps.
       * See `keyframes()`
       */
    Keyframes: 5,
    /**
       * Contains a set of CSS property-value pairs into a named style.
       * See `style()`
       */
    Style: 6,
    /**
       * Associates an animation with an entry trigger that can be attached to an element.
       * See `trigger()`
       */
    Trigger: 7,
    /**
       * Contains a re-usable animation.
       * See `animation()`
       */
    Reference: 8,
    /**
       * Contains data to use in executing child animations returned by a query.
       * See `animateChild()`
       */
    AnimateChild: 9,
    /**
       * Contains animation parameters for a re-usable animation.
       * See `useAnimation()`
       */
    AnimateRef: 10,
    /**
       * Contains child-animation query data.
       * See `query()`
       */
    Query: 11,
    /**
       * Contains data for staggering an animation sequence.
       * See `stagger()`
       */
    Stagger: 12,
};
export { AnimationMetadataType };
/** *
 * Specifies automatic styling.
  @type {?} */
export const AUTO_STYLE = '*';
/**
 * Base for animation data structures.
 * @record
 */
export function AnimationMetadata() { }
/** @type {?} */
AnimationMetadata.prototype.type;
/**
 * Contains an animation trigger. Instantiated and returned by the
 * `trigger()` function.
 * @record
 */
export function AnimationTriggerMetadata() { }
/**
 * The trigger name, used to associate it with an element. Unique within the component.
 * @type {?}
 */
AnimationTriggerMetadata.prototype.name;
/**
 * An animation definition object, containing an array of state and transition declarations.
 * @type {?}
 */
AnimationTriggerMetadata.prototype.definitions;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationTriggerMetadata.prototype.options;
/**
 * Encapsulates an animation state by associating a state name with a set of CSS styles.
 * Instantiated and returned by the `state()` function.
 * @record
 */
export function AnimationStateMetadata() { }
/**
 * The state name, unique within the component.
 * @type {?}
 */
AnimationStateMetadata.prototype.name;
/**
 *  The CSS styles associated with this state.
 * @type {?}
 */
AnimationStateMetadata.prototype.styles;
/**
 * An options object containing
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 * @type {?|undefined}
 */
AnimationStateMetadata.prototype.options;
/**
 * Encapsulates an animation transition. Instantiated and returned by the
 * `transition()` function.
 * @record
 */
export function AnimationTransitionMetadata() { }
/**
 * An expression that describes a state change.
 * @type {?}
 */
AnimationTransitionMetadata.prototype.expr;
/**
 * One or more animation objects to which this transition applies.
 * @type {?}
 */
AnimationTransitionMetadata.prototype.animation;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationTransitionMetadata.prototype.options;
/**
 * Encapsulates a reusable animation, which is a collection of individual animation steps.
 * Instantiated and returned by the `animation()` function, and
 * passed to the `useAnimation()` function.
 * @record
 */
export function AnimationReferenceMetadata() { }
/**
 *  One or more animation step objects.
 * @type {?}
 */
AnimationReferenceMetadata.prototype.animation;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationReferenceMetadata.prototype.options;
/**
 * Encapsulates an animation query. Instantiated and returned by
 * the `query()` function.
 * @record
 */
export function AnimationQueryMetadata() { }
/**
 *  The CSS selector for this query.
 * @type {?}
 */
AnimationQueryMetadata.prototype.selector;
/**
 * One or more animation step objects.
 * @type {?}
 */
AnimationQueryMetadata.prototype.animation;
/**
 * A query options object.
 * @type {?}
 */
AnimationQueryMetadata.prototype.options;
/**
 * Encapsulates a keyframes sequence. Instantiated and returned by
 * the `keyframes()` function.
 * @record
 */
export function AnimationKeyframesSequenceMetadata() { }
/**
 * An array of animation styles.
 * @type {?}
 */
AnimationKeyframesSequenceMetadata.prototype.steps;
/**
 * Encapsulates an animation style. Instantiated and returned by
 * the `style()` function.
 * @record
 */
export function AnimationStyleMetadata() { }
/**
 * A set of CSS style properties.
 * @type {?}
 */
AnimationStyleMetadata.prototype.styles;
/**
 * A percentage of the total animate time at which the style is to be applied.
 * @type {?}
 */
AnimationStyleMetadata.prototype.offset;
/**
 * Encapsulates an animation step. Instantiated and returned by
 * the `animate()` function.
 * @record
 */
export function AnimationAnimateMetadata() { }
/**
 * The timing data for the step.
 * @type {?}
 */
AnimationAnimateMetadata.prototype.timings;
/**
 * A set of styles used in the step.
 * @type {?}
 */
AnimationAnimateMetadata.prototype.styles;
/**
 * Encapsulates a child animation, that can be run explicitly when the parent is run.
 * Instantiated and returned by the `animateChild` function.
 * @record
 */
export function AnimationAnimateChildMetadata() { }
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationAnimateChildMetadata.prototype.options;
/**
 * Encapsulates a reusable animation.
 * Instantiated and returned by the `useAnimation()` function.
 * @record
 */
export function AnimationAnimateRefMetadata() { }
/**
 * An animation reference object.
 * @type {?}
 */
AnimationAnimateRefMetadata.prototype.animation;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationAnimateRefMetadata.prototype.options;
/**
 * Encapsulates an animation sequence.
 * Instantiated and returned by the `sequence()` function.
 * @record
 */
export function AnimationSequenceMetadata() { }
/**
 *  An array of animation step objects.
 * @type {?}
 */
AnimationSequenceMetadata.prototype.steps;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationSequenceMetadata.prototype.options;
/**
 * Encapsulates an animation group.
 * Instantiated and returned by the `{\@link animations/group group()}` function.
 * @record
 */
export function AnimationGroupMetadata() { }
/**
 * One or more animation or style steps that form this group.
 * @type {?}
 */
AnimationGroupMetadata.prototype.steps;
/**
 * An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation. Default delay is 0.
 * @type {?}
 */
AnimationGroupMetadata.prototype.options;
/**
 * Encapsulates parameters for staggering the start times of a set of animation steps.
 * Instantiated and returned by the `stagger()` function.
 *
 * @record
 */
export function AnimationStaggerMetadata() { }
/**
 * The timing data for the steps.
 * @type {?}
 */
AnimationStaggerMetadata.prototype.timings;
/**
 * One or more animation steps.
 * @type {?}
 */
AnimationStaggerMetadata.prototype.animation;
/**
 * Creates a named animation trigger, containing a  list of `state()`
 * and `transition()` entries to be evaluated when the expression
 * bound to the trigger changes.
 *
 * \@usageNotes
 * Define an animation trigger in the `animations` section of `\@Component` metadata.
 * In the template, reference the trigger by name and bind it to a trigger expression that
 * evaluates to a defined animation state, using the following format:
 *
 * `[\@triggerName]="expression"`
 *
 * Animation trigger bindings convert all values to strings, and then match the
 * previous and current values against any linked transitions.
 * Booleans can be specified as `1` or `true` and `0` or `false`.
 *
 * ### Usage Example
 *
 * The following example creates an animation trigger reference based on the provided
 * name value.
 * The provided animation value is expected to be an array consisting of state and
 * transition declarations.
 *
 * ```typescript
 * \@Component({
 *   selector: "my-component",
 *   templateUrl: "my-component-tpl.html",
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
 * The template associated with this component makes use of the defined trigger
 * by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * ### Using an inline function
 * The `transition` animation method also supports reading an inline function which can decide
 * if its associated animation should be run.
 *
 * ```typescript
 * // this method is run each time the `myAnimationTrigger` trigger value changes.
 * function myInlineMatcherFn(fromState: string, toState: string, element: any, params: {[key:
 * string]: any}): boolean {
 *   // notice that `element` and `params` are also available here
 *   return toState == 'yes-please-animate';
 * }
 *
 * \@Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger('myAnimationTrigger', [
 *       transition(myInlineMatcherFn, [
 *         // the animation sequence code
 *       ]),
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "yes-please-animate";
 * }
 * ```
 *
 * ### Disabling Animations
 * When true, the special animation control binding `\@.disabled` binding prevents
 * all animations from rendering.
 * Place the  `\@.disabled` binding on an element to disable
 * animations on the element itself, as well as any inner animation triggers
 * within the element.
 *
 * The following example shows how to use this feature:
 *
 * ```typescript
 * \@Component({
 *   selector: 'my-component',
 *   template: `
 *     <div [\@.disabled]="isDisabled">
 *       <div [\@childAnimation]="exp"></div>
 *     </div>
 *   `,
 *   animations: [
 *     trigger("childAnimation", [
 *       // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   isDisabled = true;
 *   exp = '...';
 * }
 * ```
 *
 * When `\@.disabled` is true, it prevents the `\@childAnimation` trigger from animating,
 * along with any inner animations.
 *
 * ### Disable animations application-wide
 * When an area of the template is set to have animations disabled,
 * **all** inner components have their animations disabled as well.
 * This means that you can disable all animations for an app
 * by placing a host binding set on `\@.disabled` on the topmost Angular component.
 *
 * ```typescript
 * import {Component, HostBinding} from '\@angular/core';
 *
 * \@Component({
 *   selector: 'app-component',
 *   templateUrl: 'app.component.html',
 * })
 * class AppComponent {
 * \@HostBinding('@.disabled')
 *   public animationsDisabled = true;
 * }
 * ```
 *
 * ### Overriding disablement of inner animations
 * Despite inner animations being disabled, a parent animation can `query()`
 * for inner elements located in disabled areas of the template and still animate
 * them if needed. This is also the case for when a sub animation is
 * queried by a parent and then later animated using `animateChild()`.
 *
 * ### Detecting when an animation is disabled
 * If a region of the DOM (or the entire application) has its animations disabled, the animation
 * trigger callbacks still fire, but for zero seconds. When the callback fires, it provides
 * an instance of an `AnimationEvent`. If animations are disabled,
 * the `.disabled` flag on the event is true.
 *
 * \@experimental Animation support is experimental.
 * @param {?} name An identifying string.
 * @param {?} definitions  An animation definition object, containing an array of `state()`
 * and `transition()` declarations.
 *
 * @return {?} An object that encapsulates the trigger data.
 *
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name, definitions, options: {} };
}
/**
 * Defines an animation step that combines styling information with timing information.
 *
 * \@usageNotes
 * Call within an animation `sequence()`, `{\@link animations/group group()}`, or
 * `transition()` call to specify an animation step
 * that applies given style data to the parent animation for a given amount of time.
 *
 * ### Syntax Examples
 * **Timing examples**
 *
 * The following examples show various `timings` specifications.
 * - `animate(500)` : Duration is 500 milliseconds.
 * - `animate("1s")` : Duration is 1000 milliseconds.
 * - `animate("100ms 0.5s")` : Duration is 100 milliseconds, delay is 500 milliseconds.
 * - `animate("5s ease-in")` : Duration is 5000 milliseconds, easing in.
 * - `animate("5s 10ms cubic-bezier(.17,.67,.88,.1)")` : Duration is 5000 milliseconds, delay is 10
 * milliseconds, easing according to a bezier curve.
 *
 * **Style examples**
 *
 * The following example calls `style()` to set a single CSS style.
 * ```typescript
 * animate(500, style({ background: "red" }))
 * ```
 * The following example calls `keyframes()` to set a CSS style
 * to different values for successive keyframes.
 * ```typescript
 * animate(500, keyframes(
 *  [
 *   style({ background: "blue" })),
 *   style({ background: "red" }))
 *  ])
 * ```
 * @param {?} timings Sets `AnimateTimings` for the parent animation.
 * A string in the format "duration [delay] [easing]".
 *  - Duration and delay are expressed as a number and optional time unit,
 * such as "1s" or "10ms" for one second and 10 milliseconds, respectively.
 * The default unit is milliseconds.
 *  - The easing value controls how the animation accelerates and decelerates
 * during its runtime. Value is one of  `ease`, `ease-in`, `ease-out`,
 * `ease-in-out`, or a `cubic-bezier()` function call.
 * If not supplied, no easing is applied.
 *
 * For example, the string "1s 100ms ease-out" specifies a duration of
 * 1000 milliseconds, and delay of 100 ms, and the "ease-out" easing style,
 * which decelerates near the end of the duration.
 * @param {?=} styles Sets AnimationStyles for the parent animation.
 * A function call to either `style()` or `keyframes()`
 * that returns a collection of CSS style entries to be applied to the parent animation.
 * When null, uses the styles from the destination state.
 * This is useful when describing an animation step that will complete an animation;
 * see "Animating to the final state" in `transitions()`.
 * @return {?} An object that encapsulates the animation step.
 *
 */
export function animate(timings, styles = null) {
    return { type: 4 /* Animate */, styles, timings };
}
/**
 * \@description Defines a list of animation steps to be run in parallel.
 *
 * \@usageNotes
 * Grouped animations are useful when a series of styles must be
 * animated at different starting times and closed off at different ending times.
 *
 * When called within a `sequence()` or a
 * `transition()` call, does not continue to the next
 * instruction until all of the inner animation steps have completed.
 * @param {?} steps An array of animation step objects.
 * - When steps are defined by `style()` or `animate()`
 * function calls, each call within the group is executed instantly.
 * - To specify offset styles to be applied at a later time, define steps with
 * `keyframes()`, or use `animate()` calls with a delay value.
 * For example:
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * @param {?=} options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return {?} An object that encapsulates the group data.
 *
 */
export function group(steps, options = null) {
    return { type: 3 /* Group */, steps, options };
}
/**
 * Defines a list of animation steps to be run sequentially, one by one.
 *
 * \@usageNotes
 * When you pass an array of steps to a
 * `transition()` call, the steps run sequentially by default.
 * Compare this to the `{\@link animations/group group()}` call, which runs animation steps in parallel.
 *
 * When a sequence is used within a `{\@link animations/group group()}` or a `transition()` call,
 * execution continues to the next instruction only after each of the inner animation
 * steps have completed.
 *
 *
 * @param {?} steps An array of animation step objects.
 * - Steps defined by `style()` calls apply the styling data immediately.
 * - Steps defined by `animate()` calls apply the styling data over time
 *   as specified by the timing data.
 *
 * ```typescript
 * sequence([
 *   style({ opacity: 0 })),
 *   animate("1s", { opacity: 1 }))
 * ])
 * ```
 *
 * @param {?=} options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return {?} An object that encapsulates the sequence data.
 *
 */
export function sequence(steps, options = null) {
    return { type: 2 /* Sequence */, steps, options };
}
/**
 * Declares a key/value object containing CSS properties/styles that
 * can then be used for an animation `state`, within an animation `sequence`,
 * or as styling data for calls to `animate()` and `keyframes()`.
 *
 * \@usageNotes
 * The following examples create animation styles that collect a set of
 * CSS property values:
 *
 * ```typescript
 * // string values for CSS properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical pixel values
 * style({ width: 100, height: 0 })
 * ```
 *
 * The following example uses auto-styling to allow a component to animate from
 * a height of 0 up to the height of the parent element:
 *
 * ```
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 *
 * @param {?} tokens A set of CSS styles or HTML styles associated with an animation state.
 * The value can be any of the following:
 * - A key-value style pair associating a CSS property with a value.
 * - An array of key-value style pairs.
 * - An asterisk (*), to use auto-styling, where styles are derived from the element
 * being animated and applied to the animation when it starts.
 *
 * Auto-styling can be used to define a state that depends on layout or other
 * environmental factors.
 *
 * @return {?} An object that encapsulates the style data.
 *
 */
export function style(tokens) {
    return { type: 6 /* Style */, styles: tokens, offset: null };
}
/**
 * Declares an animation state within a trigger attached to an element.
 *
 * \@usageNotes
 * Use the `trigger()` function to register states to an animation trigger.
 * Use the `transition()` function to animate between states.
 * When a state is active within a component, its associated styles persist on the element,
 * even when the animation ends.
 *
 * @param {?} name One or more names for the defined state in a comma-separated string.
 * The following reserved state names can be supplied to define a style for specific use
 * cases:
 *
 * - `void` You can associate styles with this name to be used when
 * the element is detached from the application. For example, when an `ngIf` evaluates
 * to false, the state of the associated element is void.
 *  - `*` (asterisk) Indicates the default state. You can associate styles with this name
 * to be used as the fallback when the state that is being animated is not declared
 * within the trigger.
 *
 * @param {?} styles A set of CSS styles associated with this state, created using the
 * `style()` function.
 * This set of styles persists on the element once the state has been reached.
 * @param {?=} options Parameters that can be passed to the state when it is invoked.
 * 0 or more key-value pairs.
 * @return {?} An object that encapsulates the new state data.
 *
 */
export function state(name, styles, options) {
    return { type: 0 /* State */, name, styles, options };
}
/**
 * Defines a set of animation styles, associating each style with an optional `offset` value.
 *
 * \@usageNotes
 * Use with the `animate()` call. Instead of applying animations
 * from the current state
 * to the destination state, keyframes describe how each style entry is applied and at what point
 * within the animation arc.
 * Compare [CSS Keyframe Animations](https://www.w3schools.com/css/css3_animations.asp).
 *
 * ### Usage
 *
 * In the following example, the offset values describe
 * when each `backgroundColor` value is applied. The color is red at the start, and changes to
 * blue when 20% of the total time has elapsed.
 *
 * ```typescript
 * // the provided offset values
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * If there are no `offset` values specified in the style entries, the offsets
 * are calculated automatically.
 *
 * ```typescript
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 * ```
 * @param {?} steps A set of animation styles with optional offset data.
 * The optional `offset` value for a style specifies a percentage of the total animation
 * time at which that style is applied.
 * @return {?} An object that encapsulates the keyframes data.
 *
 */
export function keyframes(steps) {
    return { type: 5 /* Keyframes */, steps };
}
/**
 * Declares an animation transition as a sequence of animation steps to run when a given
 * condition is satisfied. The condition is a Boolean expression or function that compares
 * the previous and current animation states, and returns true if this transition should occur.
 * When the state criteria of a defined transition are met, the associated animation is
 * triggered.
 *
 * \@usageNotes
 * The template associated with a component binds an animation trigger to an element.
 *
 * ```HTML
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * All transitions are defined within an animation trigger,
 * along with named states that the transitions change to and from.
 *
 * ```typescript
 * trigger("myAnimationTrigger", [
 *  // define states
 *  state("on", style({ background: "green" })),
 *  state("off", style({ background: "grey" })),
 *  ...]
 * ```
 *
 * Note that when you call the `sequence()` function within a `{\@link animations/group group()}`
 * or a `transition()` call, execution does not continue to the next instruction
 * until each of the inner animation steps have completed.
 *
 * ### Syntax examples
 *
 * The following examples define transitions between the two defined states (and default states),
 * using various options:
 *
 * ```typescript
 * // Transition occurs when the state value
 * // bound to "myAnimationTrigger" changes from "on" to "off"
 * transition("on => off", animate(500))
 * // Run the same animation for both directions
 * transition("on <=> off", animate(500))
 * // Define multiple state-change pairs separated by commas
 * transition("on => off, off => void", animate(500))
 * ```
 *
 * ### Special values for state-change expressions
 *
 * - Catch-all state change for when an element is inserted into the page and the
 * destination state is unknown:
 *
 * ```typescript
 * transition("void => *", [
 *  style({ opacity: 0 }),
 *  animate(500)
 *  ])
 * ```
 *
 * - Capture a state change between any states:
 *
 *  `transition("* => *", animate("1s 0s"))`
 *
 * - Entry and exit transitions:
 *
 * ```typescript
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 *   ]),
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 *   ])
 * ```
 *
 * - Use `:increment` and `:decrement` to initiate transitions:
 *
 * ```typescript
 * transition(":increment", group([
 *  query(':enter', [
 *     style({ left: '100%' }),
 *     animate('0.5s ease-out', style('*'))
 *   ]),
 *  query(':leave', [
 *     animate('0.5s ease-out', style({ left: '-100%' }))
 *  ])
 * ]))
 *
 * transition(":decrement", group([
 *  query(':enter', [
 *     style({ left: '100%' }),
 *     animate('0.5s ease-out', style('*'))
 *   ]),
 *  query(':leave', [
 *     animate('0.5s ease-out', style({ left: '-100%' }))
 *  ])
 * ]))
 * ```
 *
 * ### State-change functions
 *
 * Here is an example of a `fromState` specified as a state-change function that invokes an
 * animation when true:
 *
 * ```typescript
 * transition((fromState, toState) =>
 *  {
 *   return fromState == "off" && toState == "on";
 *  },
 *  animate("1s 0s"))
 * ```
 *
 * ### Animating to the final state
 *
 * If the final step in a transition is a call to `animate()` that uses a timing value
 * with no style data, that step is automatically considered the final animation arc,
 * for the element to reach the final state. Angular automatically adds or removes
 * CSS styles to ensure that the element is in the correct final state.
 *
 * The following example defines a transition that starts by hiding the element,
 * then makes sure that it animates properly to whatever state is currently active for trigger:
 *
 * ```typescript
 * transition("void => *", [
 *   style({ opacity: 0 }),
 *   animate(500)
 *  ])
 * ```
 * ### Boolean value matching
 * If a trigger binding value is a Boolean, it can be matched using a transition expression
 * that compares true and false or 1 and 0. For example:
 *
 * ```
 * // in the template
 * <div [\@openClose]="open ? true : false">...</div>
 * // in the component metadata
 * trigger('openClose', [
 *   state('true', style({ height: '*' })),
 *   state('false', style({ height: '0px' })),
 *   transition('false <=> true', animate(500))
 * ])
 * ```
 *
 * @param {?} stateChangeExpr A Boolean expression or function that compares the previous and current
 * animation states, and returns true if this transition should occur. Note that  "true" and "false"
 * match 1 and 0, respectively. An expression is evaluated each time a state change occurs in the
 * animation trigger element.
 * The animation steps run when the expression evaluates to true.
 *
 * - A state-change string takes the form "state1 => state2", where each side is a defined animation
 * state, or an asterix (*) to refer to a dynamic start or end state.
 *   - The expression string can contain multiple comma-separated statements;
 * for example "state1 => state2, state3 => state4".
 *   - Special values `:enter` and `:leave` initiate a transition on the entry and exit states,
 * equivalent to  "void => *"  and "* => void".
 *   - Special values `:increment` and `:decrement` initiate a transition when a numeric value has
 * increased or decreased in value.
 * - A function is executed each time a state change occurs in the animation trigger element.
 * The animation steps run when the function returns true.
 *
 * @param {?} steps One or more animation objects, as returned by the `animate()` or
 * `sequence()` function, that form a transformation from one state to another.
 * A sequence is used by default when you pass an array.
 * @param {?=} options An options object that can contain a delay value for the start of the animation,
 * and additional developer-defined parameters. Provided values for additional parameters are used
 * as defaults, and override values can be passed to the caller on invocation.
 * @return {?} An object that encapsulates the transition data.
 *
 */
export function transition(stateChangeExpr, steps, options = null) {
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options };
}
/**
 * Produces a reusable animation that can be invoked in another animation or sequence,
 * by calling the `useAnimation()` function.
 *
 * \@usageNotes
 * The following example defines a reusable animation, providing some default parameter
 * values.
 *
 * ```typescript
 * var fadeAnimation = animation([
 *   style({ opacity: '{{ start }}' }),
 *   animate('{{ time }}',
 *   style({ opacity: '{{ end }}'}))
 *   ],
 *   { params: { time: '1000ms', start: 0, end: 1 }});
 * ```
 *
 * The following invokes the defined animation with a call to `useAnimation()`,
 * passing in override parameter values.
 *
 * ```js
 * useAnimation(fadeAnimation, {
 *   params: {
 *     time: '2s',
 *     start: 1,
 *     end: 0
 *   }
 * })
 * ```
 *
 * If any of the passed-in parameter values are missing from this call,
 * the default values are used. If one or more parameter values are missing before a step is
 * animated, `useAnimation()` throws an error.
 * @param {?} steps One or more animation objects, as returned by the `animate()`
 * or `sequence()` function, that form a transformation from one state to another.
 * A sequence is used by default when you pass an array.
 * @param {?=} options An options object that can contain a delay value for the start of the
 * animation, and additional developer-defined parameters.
 * Provided values for additional parameters are used as defaults,
 * and override values can be passed to the caller on invocation.
 * @return {?} An object that encapsulates the animation data.
 *
 */
export function animation(steps, options = null) {
    return { type: 8 /* Reference */, animation: steps, options };
}
/**
 * Executes a queried inner animation element within an animation sequence.
 *
 * \@usageNotes
 * Each time an animation is triggered in Angular, the parent animation
 * has priority and any child animations are blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations, and run them using this function.
 *
 * Note that this feature designed to be used with `query()` and it will only work
 * with animations that are assigned using the Angular animation library. CSS keyframes
 * and transitions are not handled by this API.
 * @param {?=} options An options object that can contain a delay value for the start of the
 * animation, and additional override values for developer-defined parameters.
 * @return {?} An object that encapsulates the child animation data.
 *
 */
export function animateChild(options = null) {
    return { type: 9 /* AnimateChild */, options };
}
/**
 * Starts a reusable animation that is created using the `animation()` function.
 *
 * @param {?} animation The reusable animation to start.
 * @param {?=} options An options object that can contain a delay value for the start of
 * the animation, and additional override values for developer-defined parameters.
 * @return {?} An object that contains the animation parameters.
 */
export function useAnimation(animation, options = null) {
    return { type: 10 /* AnimateRef */, animation, options };
}
/**
 * Finds one or more inner elements within the current element that is
 * being animated within a sequence. Use with `animateChild()`.
 *
 * \@usageNotes
 * Tokens can be merged into a combined query selector string. For example:
 *
 * ```typescript
 *  query(':self, .record:enter, .record:leave, \@subTrigger', [...])
 * ```
 *
 * The `query()` function collects multiple elements and works internally by using
 * `element.querySelectorAll`. Use the `limit` field of an options object to limit
 * the total number of items to be collected. For example:
 *
 * ```js
 * query('div', [
 *   animate(...),
 *   animate(...)
 * ], { limit: 1 })
 * ```
 *
 * By default, throws an error when zero items are found. Set the
 * `optional` flag to ignore this error. For example:
 *
 * ```js
 * query('.some-element-that-may-not-be-there', [
 *   animate(...),
 *   animate(...)
 * ], { optional: true })
 * ```
 *
 * ### Usage Example
 *
 * The following example queries for inner elements and animates them
 * individually using `animateChild()`.
 *
 * ```typescript
 * \@Component({
 *   selector: 'inner',
 *   template: `
 *     <div [\@queryAnimation]="exp">
 *       <h1>Title</h1>
 *       <div class="content">
 *         Blah blah blah
 *       </div>
 *     </div>
 *   `,
 *   animations: [
 *    trigger('queryAnimation', [
 *      transition('* => goAnimate', [
 *        // hide the inner elements
 *        query('h1', style({ opacity: 0 })),
 *        query('.content', style({ opacity: 0 })),
 *
 *        // animate the inner elements in, one by one
 *        query('h1', animate(1000, style({ opacity: 1 })),
 *        query('.content', animate(1000, style({ opacity: 1 })),
 *      ])
 *    ])
 *  ]
 * })
 * class Cmp {
 *   exp = '';
 *
 *   goAnimate() {
 *     this.exp = 'goAnimate';
 *   }
 * }
 * ```
 * @param {?} selector The element to query, or a set of elements that contain Angular-specific
 * characteristics, specified with one or more of the following tokens.
 *  - `query(":enter")` or `query(":leave")` : Query for newly inserted/removed elements.
 *  - `query(":animating")` : Query all currently animating elements.
 *  - `query("\@triggerName")` : Query elements that contain an animation trigger.
 *  - `query("\@*")` : Query all elements that contain an animation triggers.
 *  - `query(":self")` : Include the current element into the animation sequence.
 *
 * @param {?} animation One or more animation steps to apply to the queried element or elements.
 * An array is treated as an animation sequence.
 * @param {?=} options An options object. Use the 'limit' field to limit the total number of
 * items to collect.
 * @return {?} An object that encapsulates the query data.
 *
 */
export function query(selector, animation, options = null) {
    return { type: 11 /* Query */, selector, animation, options };
}
/**
 * Use within an animation `query()` call to issue a timing gap after
 * each queried item is animated.
 *
 * \@usageNotes
 * In the following example, a container element wraps a list of items stamped out
 * by an `ngFor`. The container element contains an animation trigger that will later be set
 * to query for each of the inner items.
 *
 * Each time items are added, the opacity fade-in animation runs,
 * and each removed item is faded out.
 * When either of these animations occur, the stagger effect is
 * applied after each item's animation is started.
 *
 * ```html
 * <!-- list.component.html -->
 * <button (click)="toggle()">Show / Hide Items</button>
 * <hr />
 * <div [\@listAnimation]="items.length">
 *   <div *ngFor="let item of items">
 *     {{ item }}
 *   </div>
 * </div>
 * ```
 *
 * Here is the component code:
 *
 * ```typescript
 * import {trigger, transition, style, animate, query, stagger} from '\@angular/animations';
 * \@Component({
 *   templateUrl: 'list.component.html',
 *   animations: [
 *     trigger('listAnimation', [
 *     ...
 *     ])
 *   ]
 * })
 * class ListComponent {
 *   items = [];
 *
 *   showItems() {
 *     this.items = [0,1,2,3,4];
 *   }
 *
 *   hideItems() {
 *     this.items = [];
 *   }
 *
 *   toggle() {
 *     this.items.length ? this.hideItems() : this.showItems();
 *    }
 *  }
 * ```
 *
 * Here is the animation trigger code:
 *
 * ```typescript
 * trigger('listAnimation', [
 *   transition('* => *', [ // each time the binding value changes
 *     query(':leave', [
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 0 }))
 *       ])
 *     ]),
 *     query(':enter', [
 *       style({ opacity: 0 }),
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 1 }))
 *       ])
 *     ])
 *   ])
 * ])
 * ```
 * @param {?} timings A delay value.
 * @param {?} animation One ore more animation steps.
 * @return {?} An object that encapsulates the stagger data.
 *
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings, animation };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEwRkUsUUFBUzs7Ozs7SUFLVCxhQUFjOzs7OztJQUtkLFdBQVk7Ozs7O0lBS1osUUFBUzs7Ozs7SUFLVCxVQUFXOzs7OztJQUtYLFlBQWE7Ozs7O0lBS2IsUUFBUzs7Ozs7SUFLVCxVQUFXOzs7OztJQUtYLFlBQWE7Ozs7O0lBS2IsZUFBZ0I7Ozs7O0lBS2hCLGNBQWU7Ozs7O0lBS2YsU0FBVTs7Ozs7SUFLVixXQUFZOzs7Ozs7QUFNZCxhQUFhLFVBQVUsR0FBRyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNlk5QixNQUFNLFVBQVUsT0FBTyxDQUFDLElBQVksRUFBRSxXQUFnQztJQUNwRSxPQUFPLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsQ0FBQztDQUM5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMERELE1BQU0sVUFBVSxPQUFPLENBQ25CLE9BQXdCLEVBQUUsU0FDZixJQUFJO0lBQ2pCLE9BQU8sRUFBQyxJQUFJLGlCQUErQixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUMvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ0QsTUFBTSxVQUFVLEtBQUssQ0FDakIsS0FBMEIsRUFBRSxVQUFtQyxJQUFJO0lBQ3JFLE9BQU8sRUFBQyxJQUFJLGVBQTZCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ0QsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUEwQixFQUFFLFVBQW1DLElBQUk7SUFFMUYsT0FBTyxFQUFDLElBQUksa0JBQWdDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQy9EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NELE1BQU0sVUFBVSxLQUFLLENBQ2pCLE1BQzJDO0lBQzdDLE9BQU8sRUFBQyxJQUFJLGVBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7Q0FDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJELE1BQU0sVUFBVSxLQUFLLENBQ2pCLElBQVksRUFBRSxNQUE4QixFQUM1QyxPQUF5QztJQUMzQyxPQUFPLEVBQUMsSUFBSSxlQUE2QixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNELE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBK0I7SUFDdkQsT0FBTyxFQUFDLElBQUksbUJBQWlDLEVBQUUsS0FBSyxFQUFDLENBQUM7Q0FDdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdLRCxNQUFNLFVBQVUsVUFBVSxDQUN0QixlQUNzRSxFQUN0RSxLQUE4QyxFQUM5QyxVQUFtQyxJQUFJO0lBQ3pDLE9BQU8sRUFBQyxJQUFJLG9CQUFrQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUNuRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2Q0QsTUFBTSxVQUFVLFNBQVMsQ0FDckIsS0FBOEMsRUFDOUMsVUFBbUMsSUFBSTtJQUN6QyxPQUFPLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsTUFBTSxVQUFVLFlBQVksQ0FBQyxVQUFzQyxJQUFJO0lBRXJFLE9BQU8sRUFBQyxJQUFJLHNCQUFvQyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzVEOzs7Ozs7Ozs7QUFVRCxNQUFNLFVBQVUsWUFBWSxDQUN4QixTQUFxQyxFQUNyQyxVQUFtQyxJQUFJO0lBQ3pDLE9BQU8sRUFBQyxJQUFJLHFCQUFrQyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUNyRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1RkQsTUFBTSxVQUFVLEtBQUssQ0FDakIsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxVQUF3QyxJQUFJO0lBQzlDLE9BQU8sRUFBQyxJQUFJLGdCQUE2QixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnRkQsTUFBTSxVQUFVLE9BQU8sQ0FDbkIsT0FBd0IsRUFDeEIsU0FBa0Q7SUFDcEQsT0FBTyxFQUFDLElBQUksa0JBQStCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxDQUFDO0NBQ2xFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzZXQgb2YgQ1NTIHN0eWxlcyBmb3IgdXNlIGluIGFuIGFuaW1hdGlvbiBzdHlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSDJtVN0eWxlRGF0YSB7IFtrZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXI7IH1cblxuLyoqXG4qIFJlcHJlc2VudHMgYW5pbWF0aW9uLXN0ZXAgdGltaW5nIHBhcmFtZXRlcnMgZm9yIGFuIGFuaW1hdGlvbiBzdGVwLiAgXG4qIEBzZWUgYGFuaW1hdGUoKWBcbiovXG5leHBvcnQgZGVjbGFyZSB0eXBlIEFuaW1hdGVUaW1pbmdzID0ge1xuICAvKipcbiAgICogVGhlIGZ1bGwgZHVyYXRpb24gb2YgYW4gYW5pbWF0aW9uIHN0ZXAuIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsXG4gICAqIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5cbiAgICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBkdXJhdGlvbjogbnVtYmVyLFxuICAvKipcbiAgICogVGhlIGRlbGF5IGluIGFwcGx5aW5nIGFuIGFuaW1hdGlvbiBzdGVwLiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LlxuICAgKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGRlbGF5OiBudW1iZXIsXG4gIC8qKlxuICAgKiBBbiBlYXNpbmcgc3R5bGUgdGhhdCBjb250cm9scyBob3cgYW4gYW5pbWF0aW9ucyBzdGVwIGFjY2VsZXJhdGVzXG4gICAqIGFuZCBkZWNlbGVyYXRlcyBkdXJpbmcgaXRzIHJ1biB0aW1lLiBBbiBlYXNpbmcgZnVuY3Rpb24gc3VjaCBhcyBgY3ViaWMtYmV6aWVyKClgLFxuICAgKiBvciBvbmUgb2YgdGhlIGZvbGxvd2luZyBjb25zdGFudHM6XG4gICAqIC0gYGVhc2UtaW5gXG4gICAqIC0gYGVhc2Utb3V0YFxuICAgKiAtIGBlYXNlLWluLWFuZC1vdXRgXG4gICAqL1xuICBlYXNpbmc6IHN0cmluZyB8IG51bGxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIE9wdGlvbnMgdGhhdCBjb250cm9sIGFuaW1hdGlvbiBzdHlsaW5nIGFuZCB0aW1pbmcuXG4gKlxuICogVGhlIGZvbGxvd2luZyBhbmltYXRpb24gZnVuY3Rpb25zIGFjY2VwdCBgQW5pbWF0aW9uT3B0aW9uc2AgZGF0YTpcbiAqXG4gKiAtIGB0cmFuc2l0aW9uKClgXG4gKiAtIGBzZXF1ZW5jZSgpYFxuICogLSBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gXG4gKiAtIGBxdWVyeSgpYFxuICogLSBgYW5pbWF0aW9uKClgXG4gKiAtIGB1c2VBbmltYXRpb24oKWBcbiAqIC0gYGFuaW1hdGVDaGlsZCgpYFxuICpcbiAqIFByb2dyYW1tYXRpYyBhbmltYXRpb25zIGJ1aWx0IHVzaW5nIHRoZSBgQW5pbWF0aW9uQnVpbGRlcmAgc2VydmljZSBhbHNvXG4gKiBtYWtlIHVzZSBvZiBgQW5pbWF0aW9uT3B0aW9uc2AuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFNldHMgYSB0aW1lLWRlbGF5IGZvciBpbml0aWF0aW5nIGFuIGFuaW1hdGlvbiBhY3Rpb24uXG4gICAqIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kXG4gICAqIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5UaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICogRGVmYXVsdCB2YWx1ZSBpcyAwLCBtZWFuaW5nIG5vIGRlbGF5LlxuICAgKi9cbiAgZGVsYXk/OiBudW1iZXJ8c3RyaW5nO1xuICAvKipcbiAgKiBBIHNldCBvZiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgbW9kaWZ5IHN0eWxpbmcgYW5kIHRpbWluZ1xuICAqIHdoZW4gYW4gYW5pbWF0aW9uIGFjdGlvbiBzdGFydHMuIEFuIGFycmF5IG9mIGtleS12YWx1ZSBwYWlycywgd2hlcmUgdGhlIHByb3ZpZGVkIHZhbHVlXG4gICogaXMgdXNlZCBhcyBhIGRlZmF1bHQuXG4gICovXG4gIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBZGRzIGR1cmF0aW9uIG9wdGlvbnMgdG8gY29udHJvbCBhbmltYXRpb24gc3R5bGluZyBhbmQgdGltaW5nIGZvciBhIGNoaWxkIGFuaW1hdGlvbi5cbiAqXG4gKiBAc2VlIGBhbmltYXRlQ2hpbGQoKWBcbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGVDaGlsZE9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHsgZHVyYXRpb24/OiBudW1iZXJ8c3RyaW5nOyB9XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvbnN0YW50cyBmb3IgdGhlIGNhdGVnb3JpZXMgb2YgcGFyYW1ldGVycyB0aGF0IGNhbiBiZSBkZWZpbmVkIGZvciBhbmltYXRpb25zLlxuICpcbiAqIEEgY29ycmVzcG9uZGluZyBmdW5jdGlvbiBkZWZpbmVzIGEgc2V0IG9mIHBhcmFtZXRlcnMgZm9yIGVhY2ggY2F0ZWdvcnksIGFuZFxuICogY29sbGVjdHMgdGhlbSBpbnRvIGEgY29ycmVzcG9uZGluZyBgQW5pbWF0aW9uTWV0YWRhdGFgIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlIHtcbiAgLyoqXG4gICAqIEFzc29jaWF0ZXMgYSBuYW1lZCBhbmltYXRpb24gc3RhdGUgd2l0aCBhIHNldCBvZiBDU1Mgc3R5bGVzLlxuICAgKiBTZWUgYHN0YXRlKClgXG4gICAqL1xuICBTdGF0ZSA9IDAsXG4gIC8qKlxuICAgKiBEYXRhIGZvciBhIHRyYW5zaXRpb24gZnJvbSBvbmUgYW5pbWF0aW9uIHN0YXRlIHRvIGFub3RoZXIuXG4gICAqIFNlZSBgdHJhbnNpdGlvbigpYFxuICAgKi9cbiAgVHJhbnNpdGlvbiA9IDEsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBgc2VxdWVuY2UoKWBcbiAgICovXG4gIFNlcXVlbmNlID0gMixcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWBcbiAgICovXG4gIEdyb3VwID0gMyxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGFuIGFuaW1hdGlvbiBzdGVwLlxuICAgKiBTZWUgYGFuaW1hdGUoKWBcbiAgICovXG4gIEFuaW1hdGUgPSA0LFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYGtleWZyYW1lcygpYFxuICAgKi9cbiAgS2V5ZnJhbWVzID0gNSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIENTUyBwcm9wZXJ0eS12YWx1ZSBwYWlycyBpbnRvIGEgbmFtZWQgc3R5bGUuXG4gICAqIFNlZSBgc3R5bGUoKWBcbiAgICovXG4gIFN0eWxlID0gNixcbiAgLyoqXG4gICAqIEFzc29jaWF0ZXMgYW4gYW5pbWF0aW9uIHdpdGggYW4gZW50cnkgdHJpZ2dlciB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byBhbiBlbGVtZW50LlxuICAgKiBTZWUgYHRyaWdnZXIoKWBcbiAgICovXG4gIFRyaWdnZXIgPSA3LFxuICAvKipcbiAgICogQ29udGFpbnMgYSByZS11c2FibGUgYW5pbWF0aW9uLlxuICAgKiBTZWUgYGFuaW1hdGlvbigpYFxuICAgKi9cbiAgUmVmZXJlbmNlID0gOCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGRhdGEgdG8gdXNlIGluIGV4ZWN1dGluZyBjaGlsZCBhbmltYXRpb25zIHJldHVybmVkIGJ5IGEgcXVlcnkuXG4gICAqIFNlZSBgYW5pbWF0ZUNoaWxkKClgXG4gICAqL1xuICBBbmltYXRlQ2hpbGQgPSA5LFxuICAvKipcbiAgICogQ29udGFpbnMgYW5pbWF0aW9uIHBhcmFtZXRlcnMgZm9yIGEgcmUtdXNhYmxlIGFuaW1hdGlvbi5cbiAgICogU2VlIGB1c2VBbmltYXRpb24oKWBcbiAgICovXG4gIEFuaW1hdGVSZWYgPSAxMCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGNoaWxkLWFuaW1hdGlvbiBxdWVyeSBkYXRhLlxuICAgKiBTZWUgYHF1ZXJ5KClgXG4gICAqL1xuICBRdWVyeSA9IDExLFxuICAvKipcbiAgICogQ29udGFpbnMgZGF0YSBmb3Igc3RhZ2dlcmluZyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gICAqIFNlZSBgc3RhZ2dlcigpYFxuICAgKi9cbiAgU3RhZ2dlciA9IDEyXG59XG5cbi8qKlxuICogU3BlY2lmaWVzIGF1dG9tYXRpYyBzdHlsaW5nLlxuICovXG5leHBvcnQgY29uc3QgQVVUT19TVFlMRSA9ICcqJztcblxuLyoqXG4gKiBCYXNlIGZvciBhbmltYXRpb24gZGF0YSBzdHJ1Y3R1cmVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbk1ldGFkYXRhIHsgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlOyB9XG5cbi8qKlxuICogQ29udGFpbnMgYW4gYW5pbWF0aW9uIHRyaWdnZXIuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlXG4gKiBgdHJpZ2dlcigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgICogVGhlIHRyaWdnZXIgbmFtZSwgdXNlZCB0byBhc3NvY2lhdGUgaXQgd2l0aCBhbiBlbGVtZW50LiBVbmlxdWUgd2l0aGluIHRoZSBjb21wb25lbnQuXG4gICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogQW4gYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LCBjb250YWluaW5nIGFuIGFycmF5IG9mIHN0YXRlIGFuZCB0cmFuc2l0aW9uIGRlY2xhcmF0aW9ucy5cbiAgICovXG4gIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiB7cGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9fXxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3RhdGUgYnkgYXNzb2NpYXRpbmcgYSBzdGF0ZSBuYW1lIHdpdGggYSBzZXQgb2YgQ1NTIHN0eWxlcy5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBzdGF0ZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHN0YXRlIG5hbWUsIHVuaXF1ZSB3aXRoaW4gdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqICBUaGUgQ1NTIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzdGF0ZS5cbiAgICovXG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmdcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi5cbiAgICovXG4gIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19O1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gdHJhbnNpdGlvbi4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGVcbiAqIGB0cmFuc2l0aW9uKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gdGhhdCBkZXNjcmliZXMgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqL1xuICBleHByOiBzdHJpbmd8XG4gICAgICAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKTtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvYmplY3RzIHRvIHdoaWNoIHRoaXMgdHJhbnNpdGlvbiBhcHBsaWVzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLCB3aGljaCBpcyBhIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBhbmltYXRpb24gc3RlcHMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLCBhbmRcbiAqIHBhc3NlZCB0byB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBxdWVyeS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBxdWVyeSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25RdWVyeU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogIFRoZSBDU1Mgc2VsZWN0b3IgZm9yIHRoaXMgcXVlcnkuXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEEgcXVlcnkgb3B0aW9ucyBvYmplY3QuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSBrZXlmcmFtZXMgc2VxdWVuY2UuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBga2V5ZnJhbWVzKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBhbmltYXRpb24gc3R5bGVzLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0eWxlLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYHN0eWxlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBIHNldCBvZiBDU1Mgc3R5bGUgcHJvcGVydGllcy5cbiAgICovXG4gIHN0eWxlczogJyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fEFycmF5PHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fCcqJz47XG4gIC8qKlxuICAgKiBBIHBlcmNlbnRhZ2Ugb2YgdGhlIHRvdGFsIGFuaW1hdGUgdGltZSBhdCB3aGljaCB0aGUgc3R5bGUgaXMgdG8gYmUgYXBwbGllZC5cbiAgICovXG4gIG9mZnNldDogbnVtYmVyfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzdGVwLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYGFuaW1hdGUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHRpbWluZyBkYXRhIGZvciB0aGUgc3RlcC5cbiAgICovXG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXJ8QW5pbWF0ZVRpbWluZ3M7XG4gIC8qKlxuICAgKiBBIHNldCBvZiBzdHlsZXMgdXNlZCBpbiB0aGUgc3RlcC5cbiAgICovXG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YXxBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgY2hpbGQgYW5pbWF0aW9uLCB0aGF0IGNhbiBiZSBydW4gZXhwbGljaXRseSB3aGVuIHRoZSBwYXJlbnQgaXMgcnVuLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGVDaGlsZGAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSByZXVzYWJsZSBhbmltYXRpb24uXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGFuaW1hdGlvbiByZWZlcmVuY2Ugb2JqZWN0LlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc2VxdWVuY2UoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBBbiBhcnJheSBvZiBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIGdyb3VwLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25Hcm91cE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9yIHN0eWxlIHN0ZXBzIHRoYXQgZm9ybSB0aGlzIGdyb3VwLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW5pbWF0aW9uIHF1ZXJ5IG9wdGlvbnMuXG4gKiBQYXNzZWQgdG8gdGhlIGBxdWVyeSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyBleHRlbmRzIEFuaW1hdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogVHJ1ZSBpZiB0aGlzIHF1ZXJ5IGlzIG9wdGlvbmFsLCBmYWxzZSBpZiBpdCBpcyByZXF1aXJlZC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICogQSByZXF1aXJlZCBxdWVyeSB0aHJvd3MgYW4gZXJyb3IgaWYgbm8gZWxlbWVudHMgYXJlIHJldHJpZXZlZCB3aGVuXG4gICAqIHRoZSBxdWVyeSBpcyBleGVjdXRlZC4gQW4gb3B0aW9uYWwgcXVlcnkgZG9lcyBub3QuXG4gICAqXG4gICAqL1xuICBvcHRpb25hbD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBIG1heGltdW0gdG90YWwgbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuIGZyb20gdGhlIHF1ZXJ5LlxuICAgKiBJZiBuZWdhdGl2ZSwgcmVzdWx0cyBhcmUgbGltaXRlZCBmcm9tIHRoZSBlbmQgb2YgdGhlIHF1ZXJ5IGxpc3QgdG93YXJkcyB0aGUgYmVnaW5uaW5nLlxuICAgKiBCeSBkZWZhdWx0LCByZXN1bHRzIGFyZSBub3QgbGltaXRlZC5cbiAgICovXG4gIGxpbWl0PzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBwYXJhbWV0ZXJzIGZvciBzdGFnZ2VyaW5nIHRoZSBzdGFydCB0aW1lcyBvZiBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc3RhZ2dlcigpYCBmdW5jdGlvbi5cbiAqKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHRpbWluZyBkYXRhIGZvciB0aGUgc3RlcHMuXG4gICAqL1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyO1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuYW1lZCBhbmltYXRpb24gdHJpZ2dlciwgY29udGFpbmluZyBhICBsaXN0IG9mIGBzdGF0ZSgpYFxuICogYW5kIGB0cmFuc2l0aW9uKClgIGVudHJpZXMgdG8gYmUgZXZhbHVhdGVkIHdoZW4gdGhlIGV4cHJlc3Npb25cbiAqIGJvdW5kIHRvIHRoZSB0cmlnZ2VyIGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIG5hbWUgQW4gaWRlbnRpZnlpbmcgc3RyaW5nLlxuICogQHBhcmFtIGRlZmluaXRpb25zICBBbiBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QsIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgYHN0YXRlKClgXG4gKiBhbmQgYHRyYW5zaXRpb24oKWAgZGVjbGFyYXRpb25zLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSB0cmlnZ2VyIGRhdGEuXG4gKiBcbiAqIEB1c2FnZU5vdGVzXG4gKiBEZWZpbmUgYW4gYW5pbWF0aW9uIHRyaWdnZXIgaW4gdGhlIGBhbmltYXRpb25zYCBzZWN0aW9uIG9mIGBAQ29tcG9uZW50YCBtZXRhZGF0YS5cbiAqIEluIHRoZSB0ZW1wbGF0ZSwgcmVmZXJlbmNlIHRoZSB0cmlnZ2VyIGJ5IG5hbWUgYW5kIGJpbmQgaXQgdG8gYSB0cmlnZ2VyIGV4cHJlc3Npb24gdGhhdFxuICogZXZhbHVhdGVzIHRvIGEgZGVmaW5lZCBhbmltYXRpb24gc3RhdGUsIHVzaW5nIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICpcbiAqIGBbQHRyaWdnZXJOYW1lXT1cImV4cHJlc3Npb25cImBcbiAqXG4gKiBBbmltYXRpb24gdHJpZ2dlciBiaW5kaW5ncyBjb252ZXJ0IGFsbCB2YWx1ZXMgdG8gc3RyaW5ncywgYW5kIHRoZW4gbWF0Y2ggdGhlIFxuICogcHJldmlvdXMgYW5kIGN1cnJlbnQgdmFsdWVzIGFnYWluc3QgYW55IGxpbmtlZCB0cmFuc2l0aW9ucy5cbiAqIEJvb2xlYW5zIGNhbiBiZSBzcGVjaWZpZWQgYXMgYDFgIG9yIGB0cnVlYCBhbmQgYDBgIG9yIGBmYWxzZWAuXG4gKlxuICogIyMjIFVzYWdlIEV4YW1wbGVcbiAqIFxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgcmVmZXJlbmNlIGJhc2VkIG9uIHRoZSBwcm92aWRlZFxuICogbmFtZSB2YWx1ZS5cbiAqIFRoZSBwcm92aWRlZCBhbmltYXRpb24gdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXkgY29uc2lzdGluZyBvZiBzdGF0ZSBhbmRcbiAqIHRyYW5zaXRpb24gZGVjbGFyYXRpb25zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogXCJteS1jb21wb25lbnRcIixcbiAqICAgdGVtcGxhdGVVcmw6IFwibXktY29tcG9uZW50LXRwbC5odG1sXCIsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwibXlBbmltYXRpb25UcmlnZ2VyXCIsIFtcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInNvbWV0aGluZ1wiO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbXBvbmVudCBtYWtlcyB1c2Ugb2YgdGhlIGRlZmluZWQgdHJpZ2dlclxuICogYnkgYmluZGluZyB0byBhbiBlbGVtZW50IHdpdGhpbiBpdHMgdGVtcGxhdGUgY29kZS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIHNvbWV3aGVyZSBpbnNpZGUgb2YgbXktY29tcG9uZW50LXRwbC5odG1sIC0tPlxuICogPGRpdiBbQG15QW5pbWF0aW9uVHJpZ2dlcl09XCJteVN0YXR1c0V4cFwiPi4uLjwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIGFuIGlubGluZSBmdW5jdGlvblxuICogVGhlIGB0cmFuc2l0aW9uYCBhbmltYXRpb24gbWV0aG9kIGFsc28gc3VwcG9ydHMgcmVhZGluZyBhbiBpbmxpbmUgZnVuY3Rpb24gd2hpY2ggY2FuIGRlY2lkZVxuICogaWYgaXRzIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHNob3VsZCBiZSBydW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhpcyBtZXRob2QgaXMgcnVuIGVhY2ggdGltZSB0aGUgYG15QW5pbWF0aW9uVHJpZ2dlcmAgdHJpZ2dlciB2YWx1ZSBjaGFuZ2VzLlxuICogZnVuY3Rpb24gbXlJbmxpbmVNYXRjaGVyRm4oZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OlxuIHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAqICAgLy8gbm90aWNlIHRoYXQgYGVsZW1lbnRgIGFuZCBgcGFyYW1zYCBhcmUgYWxzbyBhdmFpbGFibGUgaGVyZVxuICogICByZXR1cm4gdG9TdGF0ZSA9PSAneWVzLXBsZWFzZS1hbmltYXRlJztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215LWNvbXBvbmVudC10cGwuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdteUFuaW1hdGlvblRyaWdnZXInLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKG15SW5saW5lTWF0Y2hlckZuLCBbXG4gKiAgICAgICAgIC8vIHRoZSBhbmltYXRpb24gc2VxdWVuY2UgY29kZVxuICogICAgICAgXSksXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInllcy1wbGVhc2UtYW5pbWF0ZVwiO1xuICogfVxuICogYGBgXG4gKlxuICogIyMjIERpc2FibGluZyBBbmltYXRpb25zXG4gKiBXaGVuIHRydWUsIHRoZSBzcGVjaWFsIGFuaW1hdGlvbiBjb250cm9sIGJpbmRpbmcgYEAuZGlzYWJsZWRgIGJpbmRpbmcgcHJldmVudHMgXG4gKiBhbGwgYW5pbWF0aW9ucyBmcm9tIHJlbmRlcmluZy5cbiAqIFBsYWNlIHRoZSAgYEAuZGlzYWJsZWRgIGJpbmRpbmcgb24gYW4gZWxlbWVudCB0byBkaXNhYmxlXG4gKiBhbmltYXRpb25zIG9uIHRoZSBlbGVtZW50IGl0c2VsZiwgYXMgd2VsbCBhcyBhbnkgaW5uZXIgYW5pbWF0aW9uIHRyaWdnZXJzXG4gKiB3aXRoaW4gdGhlIGVsZW1lbnQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byB1c2UgdGhpcyBmZWF0dXJlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdiBbQC5kaXNhYmxlZF09XCJpc0Rpc2FibGVkXCI+XG4gKiAgICAgICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwiY2hpbGRBbmltYXRpb25cIiwgW1xuICogICAgICAgLy8gLi4uXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgaXNEaXNhYmxlZCA9IHRydWU7XG4gKiAgIGV4cCA9ICcuLi4nO1xuICogfVxuICogYGBgXG4gKlxuICogV2hlbiBgQC5kaXNhYmxlZGAgaXMgdHJ1ZSwgaXQgcHJldmVudHMgdGhlIGBAY2hpbGRBbmltYXRpb25gIHRyaWdnZXIgZnJvbSBhbmltYXRpbmcsXG4gKiBhbG9uZyB3aXRoIGFueSBpbm5lciBhbmltYXRpb25zLlxuICpcbiAqICMjIyBEaXNhYmxlIGFuaW1hdGlvbnMgYXBwbGljYXRpb24td2lkZVxuICogV2hlbiBhbiBhcmVhIG9mIHRoZSB0ZW1wbGF0ZSBpcyBzZXQgdG8gaGF2ZSBhbmltYXRpb25zIGRpc2FibGVkLCBcbiAqICoqYWxsKiogaW5uZXIgY29tcG9uZW50cyBoYXZlIHRoZWlyIGFuaW1hdGlvbnMgZGlzYWJsZWQgYXMgd2VsbC5cbiAqIFRoaXMgbWVhbnMgdGhhdCB5b3UgY2FuIGRpc2FibGUgYWxsIGFuaW1hdGlvbnMgZm9yIGFuIGFwcFxuICogYnkgcGxhY2luZyBhIGhvc3QgYmluZGluZyBzZXQgb24gYEAuZGlzYWJsZWRgIG9uIHRoZSB0b3Btb3N0IEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBIb3N0QmluZGluZ30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwLWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJyxcbiAqIH0pXG4gKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ0AuZGlzYWJsZWQnKVxuICogICBwdWJsaWMgYW5pbWF0aW9uc0Rpc2FibGVkID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBPdmVycmlkaW5nIGRpc2FibGVtZW50IG9mIGlubmVyIGFuaW1hdGlvbnNcbiAqIERlc3BpdGUgaW5uZXIgYW5pbWF0aW9ucyBiZWluZyBkaXNhYmxlZCwgYSBwYXJlbnQgYW5pbWF0aW9uIGNhbiBgcXVlcnkoKWBcbiAqIGZvciBpbm5lciBlbGVtZW50cyBsb2NhdGVkIGluIGRpc2FibGVkIGFyZWFzIG9mIHRoZSB0ZW1wbGF0ZSBhbmQgc3RpbGwgYW5pbWF0ZSBcbiAqIHRoZW0gaWYgbmVlZGVkLiBUaGlzIGlzIGFsc28gdGhlIGNhc2UgZm9yIHdoZW4gYSBzdWIgYW5pbWF0aW9uIGlzIFxuICogcXVlcmllZCBieSBhIHBhcmVudCBhbmQgdGhlbiBsYXRlciBhbmltYXRlZCB1c2luZyBgYW5pbWF0ZUNoaWxkKClgLlxuICpcbiAqICMjIyBEZXRlY3Rpbmcgd2hlbiBhbiBhbmltYXRpb24gaXMgZGlzYWJsZWRcbiAqIElmIGEgcmVnaW9uIG9mIHRoZSBET00gKG9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb24pIGhhcyBpdHMgYW5pbWF0aW9ucyBkaXNhYmxlZCwgdGhlIGFuaW1hdGlvblxuICogdHJpZ2dlciBjYWxsYmFja3Mgc3RpbGwgZmlyZSwgYnV0IGZvciB6ZXJvIHNlY29uZHMuIFdoZW4gdGhlIGNhbGxiYWNrIGZpcmVzLCBpdCBwcm92aWRlc1xuICogYW4gaW5zdGFuY2Ugb2YgYW4gYEFuaW1hdGlvbkV2ZW50YC4gSWYgYW5pbWF0aW9ucyBhcmUgZGlzYWJsZWQsXG4gKiB0aGUgYC5kaXNhYmxlZGAgZmxhZyBvbiB0aGUgZXZlbnQgaXMgdHJ1ZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXIobmFtZTogc3RyaW5nLCBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyaWdnZXIsIG5hbWUsIGRlZmluaXRpb25zLCBvcHRpb25zOiB7fX07XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IGNvbWJpbmVzIHN0eWxpbmcgaW5mb3JtYXRpb24gd2l0aCB0aW1pbmcgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIHRpbWluZ3MgU2V0cyBgQW5pbWF0ZVRpbWluZ3NgIGZvciB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIEEgc3RyaW5nIGluIHRoZSBmb3JtYXQgXCJkdXJhdGlvbiBbZGVsYXldIFtlYXNpbmddXCIuXG4gKiAgLSBEdXJhdGlvbiBhbmQgZGVsYXkgYXJlIGV4cHJlc3NlZCBhcyBhIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LFxuICogc3VjaCBhcyBcIjFzXCIgb3IgXCIxMG1zXCIgZm9yIG9uZSBzZWNvbmQgYW5kIDEwIG1pbGxpc2Vjb25kcywgcmVzcGVjdGl2ZWx5LlxuICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gKiAgLSBUaGUgZWFzaW5nIHZhbHVlIGNvbnRyb2xzIGhvdyB0aGUgYW5pbWF0aW9uIGFjY2VsZXJhdGVzIGFuZCBkZWNlbGVyYXRlc1xuICogZHVyaW5nIGl0cyBydW50aW1lLiBWYWx1ZSBpcyBvbmUgb2YgIGBlYXNlYCwgYGVhc2UtaW5gLCBgZWFzZS1vdXRgLFxuICogYGVhc2UtaW4tb3V0YCwgb3IgYSBgY3ViaWMtYmV6aWVyKClgIGZ1bmN0aW9uIGNhbGwuXG4gKiBJZiBub3Qgc3VwcGxpZWQsIG5vIGVhc2luZyBpcyBhcHBsaWVkLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgc3RyaW5nIFwiMXMgMTAwbXMgZWFzZS1vdXRcIiBzcGVjaWZpZXMgYSBkdXJhdGlvbiBvZlxuICogMTAwMCBtaWxsaXNlY29uZHMsIGFuZCBkZWxheSBvZiAxMDAgbXMsIGFuZCB0aGUgXCJlYXNlLW91dFwiIGVhc2luZyBzdHlsZSxcbiAqIHdoaWNoIGRlY2VsZXJhdGVzIG5lYXIgdGhlIGVuZCBvZiB0aGUgZHVyYXRpb24uXG4gKiBAcGFyYW0gc3R5bGVzIFNldHMgQW5pbWF0aW9uU3R5bGVzIGZvciB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIEEgZnVuY3Rpb24gY2FsbCB0byBlaXRoZXIgYHN0eWxlKClgIG9yIGBrZXlmcmFtZXMoKWBcbiAqIHRoYXQgcmV0dXJucyBhIGNvbGxlY3Rpb24gb2YgQ1NTIHN0eWxlIGVudHJpZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIFdoZW4gbnVsbCwgdXNlcyB0aGUgc3R5bGVzIGZyb20gdGhlIGRlc3RpbmF0aW9uIHN0YXRlLlxuICogVGhpcyBpcyB1c2VmdWwgd2hlbiBkZXNjcmliaW5nIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBjb21wbGV0ZSBhbiBhbmltYXRpb247XG4gKiBzZWUgXCJBbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlXCIgaW4gYHRyYW5zaXRpb25zKClgLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBhbmltYXRpb24gc3RlcC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogQ2FsbCB3aXRoaW4gYW4gYW5pbWF0aW9uIGBzZXF1ZW5jZSgpYCwgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YCwgb3JcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwgdG8gc3BlY2lmeSBhbiBhbmltYXRpb24gc3RlcFxuICogdGhhdCBhcHBsaWVzIGdpdmVuIHN0eWxlIGRhdGEgdG8gdGhlIHBhcmVudCBhbmltYXRpb24gZm9yIGEgZ2l2ZW4gYW1vdW50IG9mIHRpbWUuXG4gKlxuICogIyMjIFN5bnRheCBFeGFtcGxlc1xuICogKipUaW1pbmcgZXhhbXBsZXMqKlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgc2hvdyB2YXJpb3VzIGB0aW1pbmdzYCBzcGVjaWZpY2F0aW9ucy5cbiAqIC0gYGFuaW1hdGUoNTAwKWAgOiBEdXJhdGlvbiBpcyA1MDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjFzXCIpYCA6IER1cmF0aW9uIGlzIDEwMDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjEwMG1zIDAuNXNcIilgIDogRHVyYXRpb24gaXMgMTAwIG1pbGxpc2Vjb25kcywgZGVsYXkgaXMgNTAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCI1cyBlYXNlLWluXCIpYCA6IER1cmF0aW9uIGlzIDUwMDAgbWlsbGlzZWNvbmRzLCBlYXNpbmcgaW4uXG4gKiAtIGBhbmltYXRlKFwiNXMgMTBtcyBjdWJpYy1iZXppZXIoLjE3LC42NywuODgsLjEpXCIpYCA6IER1cmF0aW9uIGlzIDUwMDAgbWlsbGlzZWNvbmRzLCBkZWxheSBpcyAxMFxuICogbWlsbGlzZWNvbmRzLCBlYXNpbmcgYWNjb3JkaW5nIHRvIGEgYmV6aWVyIGN1cnZlLlxuICpcbiAqICoqU3R5bGUgZXhhbXBsZXMqKlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjYWxscyBgc3R5bGUoKWAgdG8gc2V0IGEgc2luZ2xlIENTUyBzdHlsZS5cbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoNTAwLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiBgYGBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjYWxscyBga2V5ZnJhbWVzKClgIHRvIHNldCBhIENTUyBzdHlsZVxuICogdG8gZGlmZmVyZW50IHZhbHVlcyBmb3Igc3VjY2Vzc2l2ZSBrZXlmcmFtZXMuXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKDUwMCwga2V5ZnJhbWVzKFxuICogIFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImJsdWVcIiB9KSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqICBdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlciwgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHwgQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB8XG4gICAgICAgIG51bGwgPSBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZSwgc3R5bGVzLCB0aW1pbmdzfTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIGJlIHJ1biBpbiBwYXJhbGxlbC5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gV2hlbiBzdGVwcyBhcmUgZGVmaW5lZCBieSBgc3R5bGUoKWAgb3IgYGFuaW1hdGUoKWBcbiAqIGZ1bmN0aW9uIGNhbGxzLCBlYWNoIGNhbGwgd2l0aGluIHRoZSBncm91cCBpcyBleGVjdXRlZCBpbnN0YW50bHkuXG4gKiAtIFRvIHNwZWNpZnkgb2Zmc2V0IHN0eWxlcyB0byBiZSBhcHBsaWVkIGF0IGEgbGF0ZXIgdGltZSwgZGVmaW5lIHN0ZXBzIHdpdGhcbiAqIGBrZXlmcmFtZXMoKWAsIG9yIHVzZSBgYW5pbWF0ZSgpYCBjYWxscyB3aXRoIGEgZGVsYXkgdmFsdWUuXG4gKiBGb3IgZXhhbXBsZTpcbiAqIFxuICogYGBgdHlwZXNjcmlwdFxuICogZ3JvdXAoW1xuICogICBhbmltYXRlKFwiMXNcIiwgeyBiYWNrZ3JvdW5kOiBcImJsYWNrXCIgfSkpXG4gKiAgIGFuaW1hdGUoXCIyc1wiLCB7IGNvbG9yOiBcIndoaXRlXCIgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGdyb3VwIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEdyb3VwZWQgYW5pbWF0aW9ucyBhcmUgdXNlZnVsIHdoZW4gYSBzZXJpZXMgb2Ygc3R5bGVzIG11c3QgYmUgXG4gKiBhbmltYXRlZCBhdCBkaWZmZXJlbnQgc3RhcnRpbmcgdGltZXMgYW5kIGNsb3NlZCBvZmYgYXQgZGlmZmVyZW50IGVuZGluZyB0aW1lcy5cbiAqXG4gKiBXaGVuIGNhbGxlZCB3aXRoaW4gYSBgc2VxdWVuY2UoKWAgb3IgYVxuICogYHRyYW5zaXRpb24oKWAgY2FsbCwgZG9lcyBub3QgY29udGludWUgdG8gdGhlIG5leHRcbiAqIGluc3RydWN0aW9uIHVudGlsIGFsbCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXAoXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cCwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIERlZmluZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0byBiZSBydW4gc2VxdWVudGlhbGx5LCBvbmUgYnkgb25lLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBBbiBhcnJheSBvZiBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICogLSBTdGVwcyBkZWZpbmVkIGJ5IGBzdHlsZSgpYCBjYWxscyBhcHBseSB0aGUgc3R5bGluZyBkYXRhIGltbWVkaWF0ZWx5LlxuICogLSBTdGVwcyBkZWZpbmVkIGJ5IGBhbmltYXRlKClgIGNhbGxzIGFwcGx5IHRoZSBzdHlsaW5nIGRhdGEgb3ZlciB0aW1lXG4gKiAgIGFzIHNwZWNpZmllZCBieSB0aGUgdGltaW5nIGRhdGEuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICBhbmltYXRlKFwiMXNcIiwgeyBvcGFjaXR5OiAxIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzZXF1ZW5jZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBXaGVuIHlvdSBwYXNzIGFuIGFycmF5IG9mIHN0ZXBzIHRvIGFcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwsIHRoZSBzdGVwcyBydW4gc2VxdWVudGlhbGx5IGJ5IGRlZmF1bHQuXG4gKiBDb21wYXJlIHRoaXMgdG8gdGhlIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWAgY2FsbCwgd2hpY2ggcnVucyBhbmltYXRpb24gc3RlcHMgaW4gcGFyYWxsZWwuXG4gKlxuICogV2hlbiBhIHNlcXVlbmNlIGlzIHVzZWQgd2l0aGluIGEgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YCBvciBhIGB0cmFuc2l0aW9uKClgIGNhbGwsXG4gKiBleGVjdXRpb24gY29udGludWVzIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9ubHkgYWZ0ZXIgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2Uoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSBrZXkvdmFsdWUgb2JqZWN0IGNvbnRhaW5pbmcgQ1NTIHByb3BlcnRpZXMvc3R5bGVzIHRoYXRcbiAqIGNhbiB0aGVuIGJlIHVzZWQgZm9yIGFuIGFuaW1hdGlvbiBgc3RhdGVgLCB3aXRoaW4gYW4gYW5pbWF0aW9uIGBzZXF1ZW5jZWAsXG4gKiBvciBhcyBzdHlsaW5nIGRhdGEgZm9yIGNhbGxzIHRvIGBhbmltYXRlKClgIGFuZCBga2V5ZnJhbWVzKClgLlxuICpcbiAqIEBwYXJhbSB0b2tlbnMgQSBzZXQgb2YgQ1NTIHN0eWxlcyBvciBIVE1MIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggYW4gYW5pbWF0aW9uIHN0YXRlLlxuICogVGhlIHZhbHVlIGNhbiBiZSBhbnkgb2YgdGhlIGZvbGxvd2luZzpcbiAqIC0gQSBrZXktdmFsdWUgc3R5bGUgcGFpciBhc3NvY2lhdGluZyBhIENTUyBwcm9wZXJ0eSB3aXRoIGEgdmFsdWUuXG4gKiAtIEFuIGFycmF5IG9mIGtleS12YWx1ZSBzdHlsZSBwYWlycy5cbiAqIC0gQW4gYXN0ZXJpc2sgKCopLCB0byB1c2UgYXV0by1zdHlsaW5nLCB3aGVyZSBzdHlsZXMgYXJlIGRlcml2ZWQgZnJvbSB0aGUgZWxlbWVudFxuICogYmVpbmcgYW5pbWF0ZWQgYW5kIGFwcGxpZWQgdG8gdGhlIGFuaW1hdGlvbiB3aGVuIGl0IHN0YXJ0cy5cbiAqXG4gKiBBdXRvLXN0eWxpbmcgY2FuIGJlIHVzZWQgdG8gZGVmaW5lIGEgc3RhdGUgdGhhdCBkZXBlbmRzIG9uIGxheW91dCBvciBvdGhlciBcbiAqIGVudmlyb25tZW50YWwgZmFjdG9ycy5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgc3R5bGUgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBjcmVhdGUgYW5pbWF0aW9uIHN0eWxlcyB0aGF0IGNvbGxlY3QgYSBzZXQgb2ZcbiAqIENTUyBwcm9wZXJ0eSB2YWx1ZXM6XG4gKiBcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHN0cmluZyB2YWx1ZXMgZm9yIENTUyBwcm9wZXJ0aWVzXG4gKiBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIsIGNvbG9yOiBcImJsdWVcIiB9KVxuICpcbiAqIC8vIG51bWVyaWNhbCBwaXhlbCB2YWx1ZXNcbiAqIHN0eWxlKHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAwIH0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgdXNlcyBhdXRvLXN0eWxpbmcgdG8gYWxsb3cgYSBjb21wb25lbnQgdG8gYW5pbWF0ZSBmcm9tXG4gKiBhIGhlaWdodCBvZiAwIHVwIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHBhcmVudCBlbGVtZW50OlxuICpcbiAqIGBgYFxuICogc3R5bGUoeyBoZWlnaHQ6IDAgfSksXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlKFxuICAgIHRva2VuczogJyonIHwge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gfFxuICAgIEFycmF5PCcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfT4pOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUsIHN0eWxlczogdG9rZW5zLCBvZmZzZXQ6IG51bGx9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoaW4gYSB0cmlnZ2VyIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIG5hbWUgT25lIG9yIG1vcmUgbmFtZXMgZm9yIHRoZSBkZWZpbmVkIHN0YXRlIGluIGEgY29tbWEtc2VwYXJhdGVkIHN0cmluZy5cbiAqIFRoZSBmb2xsb3dpbmcgcmVzZXJ2ZWQgc3RhdGUgbmFtZXMgY2FuIGJlIHN1cHBsaWVkIHRvIGRlZmluZSBhIHN0eWxlIGZvciBzcGVjaWZpYyB1c2VcbiAqIGNhc2VzOlxuICpcbiAqIC0gYHZvaWRgIFlvdSBjYW4gYXNzb2NpYXRlIHN0eWxlcyB3aXRoIHRoaXMgbmFtZSB0byBiZSB1c2VkIHdoZW5cbiAqIHRoZSBlbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgd2hlbiBhbiBgbmdJZmAgZXZhbHVhdGVzXG4gKiB0byBmYWxzZSwgdGhlIHN0YXRlIG9mIHRoZSBhc3NvY2lhdGVkIGVsZW1lbnQgaXMgdm9pZC5cbiAqICAtIGAqYCAoYXN0ZXJpc2spIEluZGljYXRlcyB0aGUgZGVmYXVsdCBzdGF0ZS4gWW91IGNhbiBhc3NvY2lhdGUgc3R5bGVzIHdpdGggdGhpcyBuYW1lXG4gKiB0byBiZSB1c2VkIGFzIHRoZSBmYWxsYmFjayB3aGVuIHRoZSBzdGF0ZSB0aGF0IGlzIGJlaW5nIGFuaW1hdGVkIGlzIG5vdCBkZWNsYXJlZFxuICogd2l0aGluIHRoZSB0cmlnZ2VyLlxuICpcbiAqIEBwYXJhbSBzdHlsZXMgQSBzZXQgb2YgQ1NTIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzdGF0ZSwgY3JlYXRlZCB1c2luZyB0aGVcbiAqIGBzdHlsZSgpYCBmdW5jdGlvbi5cbiAqIFRoaXMgc2V0IG9mIHN0eWxlcyBwZXJzaXN0cyBvbiB0aGUgZWxlbWVudCBvbmNlIHRoZSBzdGF0ZSBoYXMgYmVlbiByZWFjaGVkLlxuICogQHBhcmFtIG9wdGlvbnMgUGFyYW1ldGVycyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIHN0YXRlIHdoZW4gaXQgaXMgaW52b2tlZC5cbiAqIDAgb3IgbW9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgbmV3IHN0YXRlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFVzZSB0aGUgYHRyaWdnZXIoKWAgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgc3RhdGVzIHRvIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogVXNlIHRoZSBgdHJhbnNpdGlvbigpYCBmdW5jdGlvbiB0byBhbmltYXRlIGJldHdlZW4gc3RhdGVzLlxuICogV2hlbiBhIHN0YXRlIGlzIGFjdGl2ZSB3aXRoaW4gYSBjb21wb25lbnQsIGl0cyBhc3NvY2lhdGVkIHN0eWxlcyBwZXJzaXN0IG9uIHRoZSBlbGVtZW50LFxuICogZXZlbiB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZShcbiAgICBuYW1lOiBzdHJpbmcsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSxcbiAgICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fSk6IEFuaW1hdGlvblN0YXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZSwgbmFtZSwgc3R5bGVzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgc2V0IG9mIGFuaW1hdGlvbiBzdHlsZXMsIGFzc29jaWF0aW5nIGVhY2ggc3R5bGUgd2l0aCBhbiBvcHRpb25hbCBgb2Zmc2V0YCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQSBzZXQgb2YgYW5pbWF0aW9uIHN0eWxlcyB3aXRoIG9wdGlvbmFsIG9mZnNldCBkYXRhLlxuICogVGhlIG9wdGlvbmFsIGBvZmZzZXRgIHZhbHVlIGZvciBhIHN0eWxlIHNwZWNpZmllcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRvdGFsIGFuaW1hdGlvblxuICogdGltZSBhdCB3aGljaCB0aGF0IHN0eWxlIGlzIGFwcGxpZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGtleWZyYW1lcyBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBVc2Ugd2l0aCB0aGUgYGFuaW1hdGUoKWAgY2FsbC4gSW5zdGVhZCBvZiBhcHBseWluZyBhbmltYXRpb25zXG4gKiBmcm9tIHRoZSBjdXJyZW50IHN0YXRlXG4gKiB0byB0aGUgZGVzdGluYXRpb24gc3RhdGUsIGtleWZyYW1lcyBkZXNjcmliZSBob3cgZWFjaCBzdHlsZSBlbnRyeSBpcyBhcHBsaWVkIGFuZCBhdCB3aGF0IHBvaW50XG4gKiB3aXRoaW4gdGhlIGFuaW1hdGlvbiBhcmMuXG4gKiBDb21wYXJlIFtDU1MgS2V5ZnJhbWUgQW5pbWF0aW9uc10oaHR0cHM6Ly93d3cudzNzY2hvb2xzLmNvbS9jc3MvY3NzM19hbmltYXRpb25zLmFzcCkuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCB0aGUgb2Zmc2V0IHZhbHVlcyBkZXNjcmliZVxuICogd2hlbiBlYWNoIGBiYWNrZ3JvdW5kQ29sb3JgIHZhbHVlIGlzIGFwcGxpZWQuIFRoZSBjb2xvciBpcyByZWQgYXQgdGhlIHN0YXJ0LCBhbmQgY2hhbmdlcyB0b1xuICogYmx1ZSB3aGVuIDIwJSBvZiB0aGUgdG90YWwgdGltZSBoYXMgZWxhcHNlZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGUgcHJvdmlkZWQgb2Zmc2V0IHZhbHVlc1xuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiLCBvZmZzZXQ6IDAgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiwgb2Zmc2V0OiAwLjIgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiLCBvZmZzZXQ6IDAuMyB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiwgb2Zmc2V0OiAxIH0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIElmIHRoZXJlIGFyZSBubyBgb2Zmc2V0YCB2YWx1ZXMgc3BlY2lmaWVkIGluIHRoZSBzdHlsZSBlbnRyaWVzLCB0aGUgb2Zmc2V0c1xuICogYXJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKFwiNXNcIiwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIgfSkgLy8gb2Zmc2V0ID0gMFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIgfSkgLy8gb2Zmc2V0ID0gMC4zM1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiB9KSAvLyBvZmZzZXQgPSAwLjY2XG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIgfSkgLy8gb2Zmc2V0ID0gMVxuICogXSkpXG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5ZnJhbWVzKHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW10pOiBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzLCBzdGVwc307XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gYW5pbWF0aW9uIHRyYW5zaXRpb24gYXMgYSBzZXF1ZW5jZSBvZiBhbmltYXRpb24gc3RlcHMgdG8gcnVuIHdoZW4gYSBnaXZlblxuICogY29uZGl0aW9uIGlzIHNhdGlzZmllZC4gVGhlIGNvbmRpdGlvbiBpcyBhIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzXG4gKiB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLlxuICogV2hlbiB0aGUgc3RhdGUgY3JpdGVyaWEgb2YgYSBkZWZpbmVkIHRyYW5zaXRpb24gYXJlIG1ldCwgdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIGlzXG4gKiB0cmlnZ2VyZWQuXG4gKlxuICogQHBhcmFtIHN0YXRlQ2hhbmdlRXhwciBBIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudFxuICogYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLiBOb3RlIHRoYXQgIFwidHJ1ZVwiIGFuZCBcImZhbHNlXCJcbiAqIG1hdGNoIDEgYW5kIDAsIHJlc3BlY3RpdmVseS4gQW4gZXhwcmVzc2lvbiBpcyBldmFsdWF0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3VycyBpbiB0aGVcbiAqIGFuaW1hdGlvbiB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBUaGUgYW5pbWF0aW9uIHN0ZXBzIHJ1biB3aGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlLlxuICpcbiAqIC0gQSBzdGF0ZS1jaGFuZ2Ugc3RyaW5nIHRha2VzIHRoZSBmb3JtIFwic3RhdGUxID0+IHN0YXRlMlwiLCB3aGVyZSBlYWNoIHNpZGUgaXMgYSBkZWZpbmVkIGFuaW1hdGlvblxuICogc3RhdGUsIG9yIGFuIGFzdGVyaXggKCopIHRvIHJlZmVyIHRvIGEgZHluYW1pYyBzdGFydCBvciBlbmQgc3RhdGUuXG4gKiAgIC0gVGhlIGV4cHJlc3Npb24gc3RyaW5nIGNhbiBjb250YWluIG11bHRpcGxlIGNvbW1hLXNlcGFyYXRlZCBzdGF0ZW1lbnRzO1xuICogZm9yIGV4YW1wbGUgXCJzdGF0ZTEgPT4gc3RhdGUyLCBzdGF0ZTMgPT4gc3RhdGU0XCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDplbnRlcmAgYW5kIGA6bGVhdmVgIGluaXRpYXRlIGEgdHJhbnNpdGlvbiBvbiB0aGUgZW50cnkgYW5kIGV4aXQgc3RhdGVzLFxuICogZXF1aXZhbGVudCB0byAgXCJ2b2lkID0+ICpcIiAgYW5kIFwiKiA9PiB2b2lkXCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDppbmNyZW1lbnRgIGFuZCBgOmRlY3JlbWVudGAgaW5pdGlhdGUgYSB0cmFuc2l0aW9uIHdoZW4gYSBudW1lcmljIHZhbHVlIGhhc1xuICogaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCBpbiB2YWx1ZS5cbiAqIC0gQSBmdW5jdGlvbiBpcyBleGVjdXRlZCBlYWNoIHRpbWUgYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzIGluIHRoZSBhbmltYXRpb24gdHJpZ2dlciBlbGVtZW50LlxuICogVGhlIGFuaW1hdGlvbiBzdGVwcyBydW4gd2hlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cywgYXMgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlKClgIG9yXG4gKiBgc2VxdWVuY2UoKWAgZnVuY3Rpb24sIHRoYXQgZm9ybSBhIHRyYW5zZm9ybWF0aW9uIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKiBBIHNlcXVlbmNlIGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIHlvdSBwYXNzIGFuIGFycmF5LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvbixcbiAqIGFuZCBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuIFByb3ZpZGVkIHZhbHVlcyBmb3IgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGFyZSB1c2VkXG4gKiBhcyBkZWZhdWx0cywgYW5kIG92ZXJyaWRlIHZhbHVlcyBjYW4gYmUgcGFzc2VkIHRvIHRoZSBjYWxsZXIgb24gaW52b2NhdGlvbi5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgdHJhbnNpdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIGEgY29tcG9uZW50IGJpbmRzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogYGBgSFRNTFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEFsbCB0cmFuc2l0aW9ucyBhcmUgZGVmaW5lZCB3aXRoaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIsXG4gKiBhbG9uZyB3aXRoIG5hbWVkIHN0YXRlcyB0aGF0IHRoZSB0cmFuc2l0aW9ucyBjaGFuZ2UgdG8gYW5kIGZyb20uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgLy8gZGVmaW5lIHN0YXRlc1xuICogIHN0YXRlKFwib25cIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZWVuXCIgfSkpLFxuICogIHN0YXRlKFwib2ZmXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmV5XCIgfSkpLFxuICogIC4uLl1cbiAqIGBgYFxuICpcbiAqIE5vdGUgdGhhdCB3aGVuIHlvdSBjYWxsIHRoZSBgc2VxdWVuY2UoKWAgZnVuY3Rpb24gd2l0aGluIGEgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YFxuICogb3IgYSBgdHJhbnNpdGlvbigpYCBjYWxsLCBleGVjdXRpb24gZG9lcyBub3QgY29udGludWUgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb25cbiAqIHVudGlsIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvbiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiAjIyMgU3ludGF4IGV4YW1wbGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBkZWZpbmUgdHJhbnNpdGlvbnMgYmV0d2VlbiB0aGUgdHdvIGRlZmluZWQgc3RhdGVzIChhbmQgZGVmYXVsdCBzdGF0ZXMpLFxuICogdXNpbmcgdmFyaW91cyBvcHRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIFRyYW5zaXRpb24gb2NjdXJzIHdoZW4gdGhlIHN0YXRlIHZhbHVlXG4gKiAvLyBib3VuZCB0byBcIm15QW5pbWF0aW9uVHJpZ2dlclwiIGNoYW5nZXMgZnJvbSBcIm9uXCIgdG8gXCJvZmZcIlxuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZlwiLCBhbmltYXRlKDUwMCkpXG4gKiAvLyBSdW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZvciBib3RoIGRpcmVjdGlvbnNcbiAqIHRyYW5zaXRpb24oXCJvbiA8PT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSlcbiAqIC8vIERlZmluZSBtdWx0aXBsZSBzdGF0ZS1jaGFuZ2UgcGFpcnMgc2VwYXJhdGVkIGJ5IGNvbW1hc1xuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZiwgb2ZmID0+IHZvaWRcIiwgYW5pbWF0ZSg1MDApKVxuICogYGBgXG4gKlxuICogIyMjIFNwZWNpYWwgdmFsdWVzIGZvciBzdGF0ZS1jaGFuZ2UgZXhwcmVzc2lvbnNcbiAqXG4gKiAtIENhdGNoLWFsbCBzdGF0ZSBjaGFuZ2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBpbnNlcnRlZCBpbnRvIHRoZSBwYWdlIGFuZCB0aGVcbiAqIGRlc3RpbmF0aW9uIHN0YXRlIGlzIHVua25vd246XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogIGFuaW1hdGUoNTAwKVxuICogIF0pXG4gKiBgYGBcbiAqXG4gKiAtIENhcHR1cmUgYSBzdGF0ZSBjaGFuZ2UgYmV0d2VlbiBhbnkgc3RhdGVzOlxuICpcbiAqICBgdHJhbnNpdGlvbihcIiogPT4gKlwiLCBhbmltYXRlKFwiMXMgMHNcIikpYFxuICpcbiAqIC0gRW50cnkgYW5kIGV4aXQgdHJhbnNpdGlvbnM6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcIjplbnRlclwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgXSksXG4gKiB0cmFuc2l0aW9uKFwiOmxlYXZlXCIsIFtcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgXSlcbiAqIGBgYFxuICpcbiAqIC0gVXNlIGA6aW5jcmVtZW50YCBhbmQgYDpkZWNyZW1lbnRgIHRvIGluaXRpYXRlIHRyYW5zaXRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCI6aW5jcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICpcbiAqIHRyYW5zaXRpb24oXCI6ZGVjcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICogYGBgXG4gKlxuICogIyMjIFN0YXRlLWNoYW5nZSBmdW5jdGlvbnNcbiAqXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBgZnJvbVN0YXRlYCBzcGVjaWZpZWQgYXMgYSBzdGF0ZS1jaGFuZ2UgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGFuXG4gKiBhbmltYXRpb24gd2hlbiB0cnVlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oKGZyb21TdGF0ZSwgdG9TdGF0ZSkgPT5cbiAqICB7XG4gKiAgIHJldHVybiBmcm9tU3RhdGUgPT0gXCJvZmZcIiAmJiB0b1N0YXRlID09IFwib25cIjtcbiAqICB9LFxuICogIGFuaW1hdGUoXCIxcyAwc1wiKSlcbiAqIGBgYFxuICpcbiAqICMjIyBBbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlXG4gKlxuICogSWYgdGhlIGZpbmFsIHN0ZXAgaW4gYSB0cmFuc2l0aW9uIGlzIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB0aGF0IHVzZXMgYSB0aW1pbmcgdmFsdWVcbiAqIHdpdGggbm8gc3R5bGUgZGF0YSwgdGhhdCBzdGVwIGlzIGF1dG9tYXRpY2FsbHkgY29uc2lkZXJlZCB0aGUgZmluYWwgYW5pbWF0aW9uIGFyYyxcbiAqIGZvciB0aGUgZWxlbWVudCB0byByZWFjaCB0aGUgZmluYWwgc3RhdGUuIEFuZ3VsYXIgYXV0b21hdGljYWxseSBhZGRzIG9yIHJlbW92ZXNcbiAqIENTUyBzdHlsZXMgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGNvcnJlY3QgZmluYWwgc3RhdGUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSB0cmFuc2l0aW9uIHRoYXQgc3RhcnRzIGJ5IGhpZGluZyB0aGUgZWxlbWVudCxcbiAqIHRoZW4gbWFrZXMgc3VyZSB0aGF0IGl0IGFuaW1hdGVzIHByb3Blcmx5IHRvIHdoYXRldmVyIHN0YXRlIGlzIGN1cnJlbnRseSBhY3RpdmUgZm9yIHRyaWdnZXI6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDApXG4gKiAgXSlcbiAqIGBgYFxuICogIyMjIEJvb2xlYW4gdmFsdWUgbWF0Y2hpbmdcbiAqIElmIGEgdHJpZ2dlciBiaW5kaW5nIHZhbHVlIGlzIGEgQm9vbGVhbiwgaXQgY2FuIGJlIG1hdGNoZWQgdXNpbmcgYSB0cmFuc2l0aW9uIGV4cHJlc3Npb25cbiAqIHRoYXQgY29tcGFyZXMgdHJ1ZSBhbmQgZmFsc2Ugb3IgMSBhbmQgMC4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiAvLyBpbiB0aGUgdGVtcGxhdGVcbiAqIDxkaXYgW0BvcGVuQ2xvc2VdPVwib3BlbiA/IHRydWUgOiBmYWxzZVwiPi4uLjwvZGl2PlxuICogLy8gaW4gdGhlIGNvbXBvbmVudCBtZXRhZGF0YVxuICogdHJpZ2dlcignb3BlbkNsb3NlJywgW1xuICogICBzdGF0ZSgndHJ1ZScsIHN0eWxlKHsgaGVpZ2h0OiAnKicgfSkpLFxuICogICBzdGF0ZSgnZmFsc2UnLCBzdHlsZSh7IGhlaWdodDogJzBweCcgfSkpLFxuICogICB0cmFuc2l0aW9uKCdmYWxzZSA8PT4gdHJ1ZScsIGFuaW1hdGUoNTAwKSlcbiAqIF0pXG4gKiBgYGBcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uKFxuICAgIHN0YXRlQ2hhbmdlRXhwcjogc3RyaW5nIHwgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbiksXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uLCBleHByOiBzdGF0ZUNoYW5nZUV4cHIsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIFByb2R1Y2VzIGEgcmV1c2FibGUgYW5pbWF0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgaW4gYW5vdGhlciBhbmltYXRpb24gb3Igc2VxdWVuY2UsXG4gKiBieSBjYWxsaW5nIHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cywgYXMgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlKClgXG4gKiBvciBgc2VxdWVuY2UoKWAgZnVuY3Rpb24sIHRoYXQgZm9ybSBhIHRyYW5zZm9ybWF0aW9uIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKiBBIHNlcXVlbmNlIGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIHlvdSBwYXNzIGFuIGFycmF5LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlXG4gKiBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gKiBQcm92aWRlZCB2YWx1ZXMgZm9yIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBhcmUgdXNlZCBhcyBkZWZhdWx0cyxcbiAqIGFuZCBvdmVycmlkZSB2YWx1ZXMgY2FuIGJlIHBhc3NlZCB0byB0aGUgY2FsbGVyIG9uIGludm9jYXRpb24uXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGFuaW1hdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIHJldXNhYmxlIGFuaW1hdGlvbiwgcHJvdmlkaW5nIHNvbWUgZGVmYXVsdCBwYXJhbWV0ZXJcbiAqIHZhbHVlcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgZmFkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbihbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IHN0YXJ0IH19JyB9KSxcbiAqICAgYW5pbWF0ZSgne3sgdGltZSB9fScsXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IGVuZCB9fSd9KSlcbiAqICAgXSxcbiAqICAgeyBwYXJhbXM6IHsgdGltZTogJzEwMDBtcycsIHN0YXJ0OiAwLCBlbmQ6IDEgfX0pO1xuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBpbnZva2VzIHRoZSBkZWZpbmVkIGFuaW1hdGlvbiB3aXRoIGEgY2FsbCB0byBgdXNlQW5pbWF0aW9uKClgLFxuICogcGFzc2luZyBpbiBvdmVycmlkZSBwYXJhbWV0ZXIgdmFsdWVzLlxuICpcbiAqIGBgYGpzXG4gKiB1c2VBbmltYXRpb24oZmFkZUFuaW1hdGlvbiwge1xuICogICBwYXJhbXM6IHtcbiAqICAgICB0aW1lOiAnMnMnLFxuICogICAgIHN0YXJ0OiAxLFxuICogICAgIGVuZDogMFxuICogICB9XG4gKiB9KVxuICogYGBgXG4gKlxuICogSWYgYW55IG9mIHRoZSBwYXNzZWQtaW4gcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBmcm9tIHRoaXMgY2FsbCxcbiAqIHRoZSBkZWZhdWx0IHZhbHVlcyBhcmUgdXNlZC4gSWYgb25lIG9yIG1vcmUgcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBiZWZvcmUgYSBzdGVwIGlzXG4gKiBhbmltYXRlZCwgYHVzZUFuaW1hdGlvbigpYCB0aHJvd3MgYW4gZXJyb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRpb24oXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZSwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBxdWVyaWVkIGlubmVyIGFuaW1hdGlvbiBlbGVtZW50IHdpdGhpbiBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlXG4gKiBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIG92ZXJyaWRlIHZhbHVlcyBmb3IgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBjaGlsZCBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgaW4gQW5ndWxhciwgdGhlIHBhcmVudCBhbmltYXRpb25cbiAqIGhhcyBwcmlvcml0eSBhbmQgYW55IGNoaWxkIGFuaW1hdGlvbnMgYXJlIGJsb2NrZWQuIEluIG9yZGVyXG4gKiBmb3IgYSBjaGlsZCBhbmltYXRpb24gdG8gcnVuLCB0aGUgcGFyZW50IGFuaW1hdGlvbiBtdXN0IHF1ZXJ5IGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gKiBjb250YWluaW5nIGNoaWxkIGFuaW1hdGlvbnMsIGFuZCBydW4gdGhlbSB1c2luZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZlYXR1cmUgZGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIGBxdWVyeSgpYCBhbmQgaXQgd2lsbCBvbmx5IHdvcmtcbiAqIHdpdGggYW5pbWF0aW9ucyB0aGF0IGFyZSBhc3NpZ25lZCB1c2luZyB0aGUgQW5ndWxhciBhbmltYXRpb24gbGlicmFyeS4gQ1NTIGtleWZyYW1lc1xuICogYW5kIHRyYW5zaXRpb25zIGFyZSBub3QgaGFuZGxlZCBieSB0aGlzIEFQSS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDaGlsZChvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBTdGFydHMgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBpcyBjcmVhdGVkIHVzaW5nIHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gVGhlIHJldXNhYmxlIGFuaW1hdGlvbiB0byBzdGFydC5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIFxuICogdGhlIGFuaW1hdGlvbiwgYW5kIGFkZGl0aW9uYWwgb3ZlcnJpZGUgdmFsdWVzIGZvciBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYW5pbWF0aW9uIHBhcmFtZXRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VBbmltYXRpb24oXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEZpbmRzIG9uZSBvciBtb3JlIGlubmVyIGVsZW1lbnRzIHdpdGhpbiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgaXNcbiAqIGJlaW5nIGFuaW1hdGVkIHdpdGhpbiBhIHNlcXVlbmNlLiBVc2Ugd2l0aCBgYW5pbWF0ZUNoaWxkKClgLlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZWxlbWVudCB0byBxdWVyeSwgb3IgYSBzZXQgb2YgZWxlbWVudHMgdGhhdCBjb250YWluIEFuZ3VsYXItc3BlY2lmaWNcbiAqIGNoYXJhY3RlcmlzdGljcywgc3BlY2lmaWVkIHdpdGggb25lIG9yIG1vcmUgb2YgdGhlIGZvbGxvd2luZyB0b2tlbnMuXG4gKiAgLSBgcXVlcnkoXCI6ZW50ZXJcIilgIG9yIGBxdWVyeShcIjpsZWF2ZVwiKWAgOiBRdWVyeSBmb3IgbmV3bHkgaW5zZXJ0ZWQvcmVtb3ZlZCBlbGVtZW50cy5cbiAqICAtIGBxdWVyeShcIjphbmltYXRpbmdcIilgIDogUXVlcnkgYWxsIGN1cnJlbnRseSBhbmltYXRpbmcgZWxlbWVudHMuXG4gKiAgLSBgcXVlcnkoXCJAdHJpZ2dlck5hbWVcIilgIDogUXVlcnkgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogIC0gYHF1ZXJ5KFwiQCpcIilgIDogUXVlcnkgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlcnMuXG4gKiAgLSBgcXVlcnkoXCI6c2VsZlwiKWAgOiBJbmNsdWRlIHRoZSBjdXJyZW50IGVsZW1lbnQgaW50byB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXBzIHRvIGFwcGx5IHRvIHRoZSBxdWVyaWVkIGVsZW1lbnQgb3IgZWxlbWVudHMuXG4gKiBBbiBhcnJheSBpcyB0cmVhdGVkIGFzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiBVc2UgdGhlICdsaW1pdCcgZmllbGQgdG8gbGltaXQgdGhlIHRvdGFsIG51bWJlciBvZlxuICogaXRlbXMgdG8gY29sbGVjdC5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBxdWVyeSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUb2tlbnMgY2FuIGJlIG1lcmdlZCBpbnRvIGEgY29tYmluZWQgcXVlcnkgc2VsZWN0b3Igc3RyaW5nLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAgcXVlcnkoJzpzZWxmLCAucmVjb3JkOmVudGVyLCAucmVjb3JkOmxlYXZlLCBAc3ViVHJpZ2dlcicsIFsuLi5dKVxuICogYGBgXG4gKlxuICogVGhlIGBxdWVyeSgpYCBmdW5jdGlvbiBjb2xsZWN0cyBtdWx0aXBsZSBlbGVtZW50cyBhbmQgd29ya3MgaW50ZXJuYWxseSBieSB1c2luZ1xuICogYGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbGAuIFVzZSB0aGUgYGxpbWl0YCBmaWVsZCBvZiBhbiBvcHRpb25zIG9iamVjdCB0byBsaW1pdFxuICogdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyB0byBiZSBjb2xsZWN0ZWQuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnZGl2JywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBsaW1pdDogMSB9KVxuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCwgdGhyb3dzIGFuIGVycm9yIHdoZW4gemVybyBpdGVtcyBhcmUgZm91bmQuIFNldCB0aGVcbiAqIGBvcHRpb25hbGAgZmxhZyB0byBpZ25vcmUgdGhpcyBlcnJvci4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCcuc29tZS1lbGVtZW50LXRoYXQtbWF5LW5vdC1iZS10aGVyZScsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgb3B0aW9uYWw6IHRydWUgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHF1ZXJpZXMgZm9yIGlubmVyIGVsZW1lbnRzIGFuZCBhbmltYXRlcyB0aGVtXG4gKiBpbmRpdmlkdWFsbHkgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC4gXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaW5uZXInLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0BxdWVyeUFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIDxoMT5UaXRsZTwvaDE+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICogICAgICAgICBCbGFoIGJsYWggYmxhaFxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgIHRyaWdnZXIoJ3F1ZXJ5QW5pbWF0aW9uJywgW1xuICogICAgICB0cmFuc2l0aW9uKCcqID0+IGdvQW5pbWF0ZScsIFtcbiAqICAgICAgICAvLyBoaWRlIHRoZSBpbm5lciBlbGVtZW50c1xuICogICAgICAgIHF1ZXJ5KCdoMScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50Jywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqXG4gKiAgICAgICAgLy8gYW5pbWF0ZSB0aGUgaW5uZXIgZWxlbWVudHMgaW4sIG9uZSBieSBvbmVcbiAqICAgICAgICBxdWVyeSgnaDEnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50JywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogVXNlIHdpdGhpbiBhbiBhbmltYXRpb24gYHF1ZXJ5KClgIGNhbGwgdG8gaXNzdWUgYSB0aW1pbmcgZ2FwIGFmdGVyXG4gKiBlYWNoIHF1ZXJpZWQgaXRlbSBpcyBhbmltYXRlZC5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBBIGRlbGF5IHZhbHVlLlxuICogQHBhcmFtIGFuaW1hdGlvbiBPbmUgb3JlIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdGFnZ2VyIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYSBjb250YWluZXIgZWxlbWVudCB3cmFwcyBhIGxpc3Qgb2YgaXRlbXMgc3RhbXBlZCBvdXRcbiAqIGJ5IGFuIGBuZ0ZvcmAuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogRWFjaCB0aW1lIGl0ZW1zIGFyZSBhZGRlZCwgdGhlIG9wYWNpdHkgZmFkZS1pbiBhbmltYXRpb24gcnVucyxcbiAqIGFuZCBlYWNoIHJlbW92ZWQgaXRlbSBpcyBmYWRlZCBvdXQuXG4gKiBXaGVuIGVpdGhlciBvZiB0aGVzZSBhbmltYXRpb25zIG9jY3VyLCB0aGUgc3RhZ2dlciBlZmZlY3QgaXNcbiAqIGFwcGxpZWQgYWZ0ZXIgZWFjaCBpdGVtJ3MgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEhlcmUgaXMgdGhlIGNvbXBvbmVudCBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgc3R5bGUsIGFuaW1hdGUsIHF1ZXJ5LCBzdGFnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICB0ZW1wbGF0ZVVybDogJ2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgICAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgIH1cbiAqICB9XG4gKiBgYGBcbiAqXG4gKiBIZXJlIGlzIHRoZSBhbmltYXRpb24gdHJpZ2dlciBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZ2VyKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlcixcbiAgICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsIHRpbWluZ3MsIGFuaW1hdGlvbn07XG59XG4iXX0=