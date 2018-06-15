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
 * Represents a set of CSS styles for use in an animation style.
 * @record
 */
export function ɵStyleData() { }
function ɵStyleData_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [key: string]: string|number;
    */
}
/** @enum {number} */
const AnimationMetadataType = {
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
       * See `group()`
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
/**
 * Specifies automatic styling.
 */
export const /** @type {?} */ AUTO_STYLE = '*';
/**
 * Base for animation data structures.
 * @record
 */
export function AnimationMetadata() { }
function AnimationMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationMetadata.prototype.type;
}
/**
 * Contains an animation trigger. Instantiated and returned by the
 * `trigger()` function.
 * @record
 */
export function AnimationTriggerMetadata() { }
function AnimationTriggerMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation state by associating a state name with a set of CSS styles.
 * Instantiated and returned by the `state()` function.
 * @record
 */
export function AnimationStateMetadata() { }
function AnimationStateMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation transition. Instantiated and returned by the
 * `transition()` function.
 * @record
 */
export function AnimationTransitionMetadata() { }
function AnimationTransitionMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates a reusable animation, which is a collection of individual animation steps.
 * Instantiated and returned by the `animation()` function, and
 * passed to the `useAnimation()` function.
 * @record
 */
export function AnimationReferenceMetadata() { }
function AnimationReferenceMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation query. Instantiated and returned by
 * the `query()` function.
 * @record
 */
export function AnimationQueryMetadata() { }
function AnimationQueryMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates a keyframes sequence. Instantiated and returned by
 * the `keyframes()` function.
 * @record
 */
export function AnimationKeyframesSequenceMetadata() { }
function AnimationKeyframesSequenceMetadata_tsickle_Closure_declarations() {
    /**
     * An array of animation styles.
     * @type {?}
     */
    AnimationKeyframesSequenceMetadata.prototype.steps;
}
/**
 * Encapsulates an animation style. Instantiated and returned by
 * the `style()` function.
 * @record
 */
export function AnimationStyleMetadata() { }
function AnimationStyleMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation step. Instantiated and returned by
 * the `animate()` function.
 * @record
 */
export function AnimationAnimateMetadata() { }
function AnimationAnimateMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates a child animation, that can be run explicitly when the parent is run.
 * Instantiated and returned by the `animateChild` function.
 * @record
 */
export function AnimationAnimateChildMetadata() { }
function AnimationAnimateChildMetadata_tsickle_Closure_declarations() {
    /**
     * An options object containing a delay and
     * developer-defined parameters that provide styling defaults and
     * can be overridden on invocation. Default delay is 0.
     * @type {?}
     */
    AnimationAnimateChildMetadata.prototype.options;
}
/**
 * Encapsulates a reusable animation.
 * Instantiated and returned by the `useAnimation()` function.
 * @record
 */
export function AnimationAnimateRefMetadata() { }
function AnimationAnimateRefMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation sequence.
 * Instantiated and returned by the `sequence()` function.
 * @record
 */
export function AnimationSequenceMetadata() { }
function AnimationSequenceMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates an animation group.
 * Instantiated and returned by the `group()` function.
 * @record
 */
export function AnimationGroupMetadata() { }
function AnimationGroupMetadata_tsickle_Closure_declarations() {
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
}
/**
 * Encapsulates parameters for staggering the start times of a set of animation steps.
 * Instantiated and returned by the `stagger()` function.
 *
 * @record
 */
export function AnimationStaggerMetadata() { }
function AnimationStaggerMetadata_tsickle_Closure_declarations() {
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
}
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
 * Call within an animation `sequence()`, `group()`, or
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
 * Compare this to the `group()` call, which runs animation steps in parallel.
 *
 * When a sequence is used within a `group()` or a `transition()` call,
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
 * Note that when you call the `sequence()` function within a `group()`
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJKQSxNQUFNLENBQUMsdUJBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNlk5QixNQUFNLGtCQUFrQixJQUFZLEVBQUUsV0FBZ0M7SUFDcEUsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsQ0FBQztDQUM5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMERELE1BQU0sa0JBQ0YsT0FBd0IsRUFBRSxTQUNmLElBQUk7SUFDakIsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNELE1BQU0sZ0JBQ0YsS0FBMEIsRUFBRSxVQUFtQyxJQUFJO0lBQ3JFLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDNUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDRCxNQUFNLG1CQUFtQixLQUEwQixFQUFFLFVBQW1DLElBQUk7SUFFMUYsTUFBTSxDQUFDLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3Q0QsTUFBTSxnQkFDRixNQUMyQztJQUM3QyxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7Q0FDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJELE1BQU0sZ0JBQ0YsSUFBWSxFQUFFLE1BQThCLEVBQzVDLE9BQXlDO0lBQzNDLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQ25FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZDRCxNQUFNLG9CQUFvQixLQUErQjtJQUN2RCxNQUFNLENBQUMsRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssRUFBQyxDQUFDO0NBQ3ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3S0QsTUFBTSxxQkFDRixlQUNzRSxFQUN0RSxLQUE4QyxFQUM5QyxVQUFtQyxJQUFJO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUksb0JBQWtDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQ25HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZDRCxNQUFNLG9CQUNGLEtBQThDLEVBQzlDLFVBQW1DLElBQUk7SUFDekMsTUFBTSxDQUFDLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsTUFBTSx1QkFBdUIsVUFBc0MsSUFBSTtJQUVyRSxNQUFNLENBQUMsRUFBQyxJQUFJLHNCQUFvQyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzVEOzs7Ozs7Ozs7QUFVRCxNQUFNLHVCQUNGLFNBQXFDLEVBQ3JDLFVBQW1DLElBQUk7SUFDekMsTUFBTSxDQUFDLEVBQUMsSUFBSSxxQkFBa0MsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDckU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUZELE1BQU0sZ0JBQ0YsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxVQUF3QyxJQUFJO0lBQzlDLE1BQU0sQ0FBQyxFQUFDLElBQUksZ0JBQTZCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdGRCxNQUFNLGtCQUNGLE9BQXdCLEVBQ3hCLFNBQWtEO0lBQ3BELE1BQU0sQ0FBQyxFQUFDLElBQUksa0JBQStCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxDQUFDO0NBQ2xFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzZXQgb2YgQ1NTIHN0eWxlcyBmb3IgdXNlIGluIGFuIGFuaW1hdGlvbiBzdHlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSDJtVN0eWxlRGF0YSB7IFtrZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXI7IH1cblxuLyoqXG4qIFJlcHJlc2VudHMgYW5pbWF0aW9uLXN0ZXAgdGltaW5nIHBhcmFtZXRlcnMgZm9yIGFuIGFuaW1hdGlvbiBzdGVwLiAgXG4qIEBzZWUgYGFuaW1hdGUoKWBcbiovXG5leHBvcnQgZGVjbGFyZSB0eXBlIEFuaW1hdGVUaW1pbmdzID0ge1xuICAvKipcbiAgICogVGhlIGZ1bGwgZHVyYXRpb24gb2YgYW4gYW5pbWF0aW9uIHN0ZXAuIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsXG4gICAqIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5cbiAgICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBkdXJhdGlvbjogbnVtYmVyLFxuICAvKipcbiAgICogVGhlIGRlbGF5IGluIGFwcGx5aW5nIGFuIGFuaW1hdGlvbiBzdGVwLiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LlxuICAgKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGRlbGF5OiBudW1iZXIsXG4gIC8qKlxuICAgKiBBbiBlYXNpbmcgc3R5bGUgdGhhdCBjb250cm9scyBob3cgYW4gYW5pbWF0aW9ucyBzdGVwIGFjY2VsZXJhdGVzXG4gICAqIGFuZCBkZWNlbGVyYXRlcyBkdXJpbmcgaXRzIHJ1biB0aW1lLiBBbiBlYXNpbmcgZnVuY3Rpb24gc3VjaCBhcyBgY3ViaWMtYmV6aWVyKClgLFxuICAgKiBvciBvbmUgb2YgdGhlIGZvbGxvd2luZyBjb25zdGFudHM6XG4gICAqIC0gYGVhc2UtaW5gXG4gICAqIC0gYGVhc2Utb3V0YFxuICAgKiAtIGBlYXNlLWluLWFuZC1vdXRgXG4gICAqL1xuICBlYXNpbmc6IHN0cmluZyB8IG51bGxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIE9wdGlvbnMgdGhhdCBjb250cm9sIGFuaW1hdGlvbiBzdHlsaW5nIGFuZCB0aW1pbmcuXG4gKiBUaGUgZm9sbG93aW5nIGFuaW1hdGlvbiBmdW5jdGlvbnMgYWNjZXB0IGBBbmltYXRpb25PcHRpb25zYCBkYXRhOlxuICpcbiAqIC0gYHRyYW5zaXRpb24oKWBcbiAqIC0gYHNlcXVlbmNlKClgXG4gKiAtIGBncm91cCgpYFxuICogLSBgcXVlcnkoKWBcbiAqIC0gYGFuaW1hdGlvbigpYFxuICogLSBgdXNlQW5pbWF0aW9uKClgXG4gKiAtIGBhbmltYXRlQ2hpbGQoKWBcbiAqXG4gKiBQcm9ncmFtbWF0aWMgYW5pbWF0aW9ucyBidWlsdCB1c2luZyB0aGUgYEFuaW1hdGlvbkJ1aWxkZXJgIHNlcnZpY2UgYWxzb1xuICogbWFrZSB1c2Ugb2YgYEFuaW1hdGlvbk9wdGlvbnNgLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTZXRzIGEgdGltZS1kZWxheSBmb3IgaW5pdGlhdGluZyBhbiBhbmltYXRpb24gYWN0aW9uLlxuICAgKiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LCBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZFxuICAgKiBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqIERlZmF1bHQgdmFsdWUgaXMgMCwgbWVhbmluZyBubyBkZWxheS5cbiAgICovXG4gIGRlbGF5PzogbnVtYmVyfHN0cmluZztcbiAgLyoqXG4gICogQSBzZXQgb2YgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IG1vZGlmeSBzdHlsaW5nIGFuZCB0aW1pbmdcbiAgKiB3aGVuIGFuIGFuaW1hdGlvbiBhY3Rpb24gc3RhcnRzLiBBbiBhcnJheSBvZiBrZXktdmFsdWUgcGFpcnMsIHdoZXJlIHRoZSBwcm92aWRlZCB2YWx1ZVxuICAqIGlzIHVzZWQgYXMgYSBkZWZhdWx0LlxuICAqL1xuICBwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQWRkcyBkdXJhdGlvbiBvcHRpb25zIHRvIGNvbnRyb2wgYW5pbWF0aW9uIHN0eWxpbmcgYW5kIHRpbWluZyBmb3IgYSBjaGlsZCBhbmltYXRpb24uXG4gKlxuICogQHNlZSBgYW5pbWF0ZUNoaWxkKClgXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRlQ2hpbGRPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7IGR1cmF0aW9uPzogbnVtYmVyfHN0cmluZzsgfVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb25zdGFudHMgZm9yIHRoZSBjYXRlZ29yaWVzIG9mIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgZGVmaW5lZCBmb3IgYW5pbWF0aW9ucy5cbiAqXG4gKiBBIGNvcnJlc3BvbmRpbmcgZnVuY3Rpb24gZGVmaW5lcyBhIHNldCBvZiBwYXJhbWV0ZXJzIGZvciBlYWNoIGNhdGVnb3J5LCBhbmRcbiAqIGNvbGxlY3RzIHRoZW0gaW50byBhIGNvcnJlc3BvbmRpbmcgYEFuaW1hdGlvbk1ldGFkYXRhYCBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSB7XG4gIC8qKlxuICAgKiBBc3NvY2lhdGVzIGEgbmFtZWQgYW5pbWF0aW9uIHN0YXRlIHdpdGggYSBzZXQgb2YgQ1NTIHN0eWxlcy5cbiAgICogU2VlIGBzdGF0ZSgpYFxuICAgKi9cbiAgU3RhdGUgPSAwLFxuICAvKipcbiAgICogRGF0YSBmb3IgYSB0cmFuc2l0aW9uIGZyb20gb25lIGFuaW1hdGlvbiBzdGF0ZSB0byBhbm90aGVyLlxuICAgKiBTZWUgYHRyYW5zaXRpb24oKWBcbiAgICovXG4gIFRyYW5zaXRpb24gPSAxLFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYHNlcXVlbmNlKClgXG4gICAqL1xuICBTZXF1ZW5jZSA9IDIsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBgZ3JvdXAoKWBcbiAgICovXG4gIEdyb3VwID0gMyxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGFuIGFuaW1hdGlvbiBzdGVwLlxuICAgKiBTZWUgYGFuaW1hdGUoKWBcbiAgICovXG4gIEFuaW1hdGUgPSA0LFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYGtleWZyYW1lcygpYFxuICAgKi9cbiAgS2V5ZnJhbWVzID0gNSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIENTUyBwcm9wZXJ0eS12YWx1ZSBwYWlycyBpbnRvIGEgbmFtZWQgc3R5bGUuXG4gICAqIFNlZSBgc3R5bGUoKWBcbiAgICovXG4gIFN0eWxlID0gNixcbiAgLyoqXG4gICAqIEFzc29jaWF0ZXMgYW4gYW5pbWF0aW9uIHdpdGggYW4gZW50cnkgdHJpZ2dlciB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byBhbiBlbGVtZW50LlxuICAgKiBTZWUgYHRyaWdnZXIoKWBcbiAgICovXG4gIFRyaWdnZXIgPSA3LFxuICAvKipcbiAgICogQ29udGFpbnMgYSByZS11c2FibGUgYW5pbWF0aW9uLlxuICAgKiBTZWUgYGFuaW1hdGlvbigpYFxuICAgKi9cbiAgUmVmZXJlbmNlID0gOCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGRhdGEgdG8gdXNlIGluIGV4ZWN1dGluZyBjaGlsZCBhbmltYXRpb25zIHJldHVybmVkIGJ5IGEgcXVlcnkuXG4gICAqIFNlZSBgYW5pbWF0ZUNoaWxkKClgXG4gICAqL1xuICBBbmltYXRlQ2hpbGQgPSA5LFxuICAvKipcbiAgICogQ29udGFpbnMgYW5pbWF0aW9uIHBhcmFtZXRlcnMgZm9yIGEgcmUtdXNhYmxlIGFuaW1hdGlvbi5cbiAgICogU2VlIGB1c2VBbmltYXRpb24oKWBcbiAgICovXG4gIEFuaW1hdGVSZWYgPSAxMCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGNoaWxkLWFuaW1hdGlvbiBxdWVyeSBkYXRhLlxuICAgKiBTZWUgYHF1ZXJ5KClgXG4gICAqL1xuICBRdWVyeSA9IDExLFxuICAvKipcbiAgICogQ29udGFpbnMgZGF0YSBmb3Igc3RhZ2dlcmluZyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gICAqIFNlZSBgc3RhZ2dlcigpYFxuICAgKi9cbiAgU3RhZ2dlciA9IDEyXG59XG5cbi8qKlxuICogU3BlY2lmaWVzIGF1dG9tYXRpYyBzdHlsaW5nLlxuICovXG5leHBvcnQgY29uc3QgQVVUT19TVFlMRSA9ICcqJztcblxuLyoqXG4gKiBCYXNlIGZvciBhbmltYXRpb24gZGF0YSBzdHJ1Y3R1cmVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbk1ldGFkYXRhIHsgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlOyB9XG5cbi8qKlxuICogQ29udGFpbnMgYW4gYW5pbWF0aW9uIHRyaWdnZXIuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlXG4gKiBgdHJpZ2dlcigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgICogVGhlIHRyaWdnZXIgbmFtZSwgdXNlZCB0byBhc3NvY2lhdGUgaXQgd2l0aCBhbiBlbGVtZW50LiBVbmlxdWUgd2l0aGluIHRoZSBjb21wb25lbnQuXG4gICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogQW4gYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LCBjb250YWluaW5nIGFuIGFycmF5IG9mIHN0YXRlIGFuZCB0cmFuc2l0aW9uIGRlY2xhcmF0aW9ucy5cbiAgICovXG4gIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiB7cGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9fXxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3RhdGUgYnkgYXNzb2NpYXRpbmcgYSBzdGF0ZSBuYW1lIHdpdGggYSBzZXQgb2YgQ1NTIHN0eWxlcy5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBzdGF0ZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHN0YXRlIG5hbWUsIHVuaXF1ZSB3aXRoaW4gdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqICBUaGUgQ1NTIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzdGF0ZS5cbiAgICovXG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmdcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi5cbiAgICovXG4gIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19O1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gdHJhbnNpdGlvbi4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGVcbiAqIGB0cmFuc2l0aW9uKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gdGhhdCBkZXNjcmliZXMgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqL1xuICBleHByOiBzdHJpbmd8XG4gICAgICAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKTtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvYmplY3RzIHRvIHdoaWNoIHRoaXMgdHJhbnNpdGlvbiBhcHBsaWVzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLCB3aGljaCBpcyBhIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBhbmltYXRpb24gc3RlcHMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLCBhbmRcbiAqIHBhc3NlZCB0byB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBxdWVyeS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBxdWVyeSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25RdWVyeU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogIFRoZSBDU1Mgc2VsZWN0b3IgZm9yIHRoaXMgcXVlcnkuXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEEgcXVlcnkgb3B0aW9ucyBvYmplY3QuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSBrZXlmcmFtZXMgc2VxdWVuY2UuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBga2V5ZnJhbWVzKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBhbmltYXRpb24gc3R5bGVzLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0eWxlLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYHN0eWxlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBIHNldCBvZiBDU1Mgc3R5bGUgcHJvcGVydGllcy5cbiAgICovXG4gIHN0eWxlczogJyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fEFycmF5PHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fCcqJz47XG4gIC8qKlxuICAgKiBBIHBlcmNlbnRhZ2Ugb2YgdGhlIHRvdGFsIGFuaW1hdGUgdGltZSBhdCB3aGljaCB0aGUgc3R5bGUgaXMgdG8gYmUgYXBwbGllZC5cbiAgICovXG4gIG9mZnNldDogbnVtYmVyfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzdGVwLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYGFuaW1hdGUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHRpbWluZyBkYXRhIGZvciB0aGUgc3RlcC5cbiAgICovXG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXJ8QW5pbWF0ZVRpbWluZ3M7XG4gIC8qKlxuICAgKiBBIHNldCBvZiBzdHlsZXMgdXNlZCBpbiB0aGUgc3RlcC5cbiAgICovXG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YXxBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgY2hpbGQgYW5pbWF0aW9uLCB0aGF0IGNhbiBiZSBydW4gZXhwbGljaXRseSB3aGVuIHRoZSBwYXJlbnQgaXMgcnVuLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGVDaGlsZGAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSByZXVzYWJsZSBhbmltYXRpb24uXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGFuaW1hdGlvbiByZWZlcmVuY2Ugb2JqZWN0LlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc2VxdWVuY2UoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBBbiBhcnJheSBvZiBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIGdyb3VwLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYGdyb3VwKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gb3Igc3R5bGUgc3RlcHMgdGhhdCBmb3JtIHRoaXMgZ3JvdXAuXG4gICAqL1xuICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbmltYXRpb24gcXVlcnkgb3B0aW9ucy5cbiAqIFBhc3NlZCB0byB0aGUgYHF1ZXJ5KClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUcnVlIGlmIHRoaXMgcXVlcnkgaXMgb3B0aW9uYWwsIGZhbHNlIGlmIGl0IGlzIHJlcXVpcmVkLiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgKiBBIHJlcXVpcmVkIHF1ZXJ5IHRocm93cyBhbiBlcnJvciBpZiBubyBlbGVtZW50cyBhcmUgcmV0cmlldmVkIHdoZW5cbiAgICogdGhlIHF1ZXJ5IGlzIGV4ZWN1dGVkLiBBbiBvcHRpb25hbCBxdWVyeSBkb2VzIG5vdC5cbiAgICpcbiAgICovXG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEEgbWF4aW11bSB0b3RhbCBudW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4gZnJvbSB0aGUgcXVlcnkuXG4gICAqIElmIG5lZ2F0aXZlLCByZXN1bHRzIGFyZSBsaW1pdGVkIGZyb20gdGhlIGVuZCBvZiB0aGUgcXVlcnkgbGlzdCB0b3dhcmRzIHRoZSBiZWdpbm5pbmcuXG4gICAqIEJ5IGRlZmF1bHQsIHJlc3VsdHMgYXJlIG5vdCBsaW1pdGVkLlxuICAgKi9cbiAgbGltaXQ/OiBudW1iZXI7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIHBhcmFtZXRlcnMgZm9yIHN0YWdnZXJpbmcgdGhlIHN0YXJ0IHRpbWVzIG9mIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBzdGFnZ2VyKClgIGZ1bmN0aW9uLlxuICoqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgdGltaW5nIGRhdGEgZm9yIHRoZSBzdGVwcy5cbiAgICovXG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXI7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcHMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5hbWVkIGFuaW1hdGlvbiB0cmlnZ2VyLCBjb250YWluaW5nIGEgIGxpc3Qgb2YgYHN0YXRlKClgXG4gKiBhbmQgYHRyYW5zaXRpb24oKWAgZW50cmllcyB0byBiZSBldmFsdWF0ZWQgd2hlbiB0aGUgZXhwcmVzc2lvblxuICogYm91bmQgdG8gdGhlIHRyaWdnZXIgY2hhbmdlcy5cbiAqXG4gKiBAcGFyYW0gbmFtZSBBbiBpZGVudGlmeWluZyBzdHJpbmcuXG4gKiBAcGFyYW0gZGVmaW5pdGlvbnMgIEFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdCwgY29udGFpbmluZyBhbiBhcnJheSBvZiBgc3RhdGUoKWBcbiAqIGFuZCBgdHJhbnNpdGlvbigpYCBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHRyaWdnZXIgZGF0YS5cbiAqIFxuICogQHVzYWdlTm90ZXNcbiAqIERlZmluZSBhbiBhbmltYXRpb24gdHJpZ2dlciBpbiB0aGUgYGFuaW1hdGlvbnNgIHNlY3Rpb24gb2YgYEBDb21wb25lbnRgIG1ldGFkYXRhLlxuICogSW4gdGhlIHRlbXBsYXRlLCByZWZlcmVuY2UgdGhlIHRyaWdnZXIgYnkgbmFtZSBhbmQgYmluZCBpdCB0byBhIHRyaWdnZXIgZXhwcmVzc2lvbiB0aGF0XG4gKiBldmFsdWF0ZXMgdG8gYSBkZWZpbmVkIGFuaW1hdGlvbiBzdGF0ZSwgdXNpbmcgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKlxuICogYFtAdHJpZ2dlck5hbWVdPVwiZXhwcmVzc2lvblwiYFxuICpcbiAqIEFuaW1hdGlvbiB0cmlnZ2VyIGJpbmRpbmdzIGNvbnZlcnQgYWxsIHZhbHVlcyB0byBzdHJpbmdzLCBhbmQgdGhlbiBtYXRjaCB0aGUgXG4gKiBwcmV2aW91cyBhbmQgY3VycmVudCB2YWx1ZXMgYWdhaW5zdCBhbnkgbGlua2VkIHRyYW5zaXRpb25zLlxuICogQm9vbGVhbnMgY2FuIGJlIHNwZWNpZmllZCBhcyBgMWAgb3IgYHRydWVgIGFuZCBgMGAgb3IgYGZhbHNlYC5cbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZVxuICogXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhbiBhbmltYXRpb24gdHJpZ2dlciByZWZlcmVuY2UgYmFzZWQgb24gdGhlIHByb3ZpZGVkXG4gKiBuYW1lIHZhbHVlLlxuICogVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB2YWx1ZSBpcyBleHBlY3RlZCB0byBiZSBhbiBhcnJheSBjb25zaXN0aW5nIG9mIHN0YXRlIGFuZFxuICogdHJhbnNpdGlvbiBkZWNsYXJhdGlvbnMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiBcIm15LWNvbXBvbmVudFwiLFxuICogICB0ZW1wbGF0ZVVybDogXCJteS1jb21wb25lbnQtdHBsLmh0bWxcIixcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLilcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwic29tZXRoaW5nXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IG1ha2VzIHVzZSBvZiB0aGUgZGVmaW5lZCB0cmlnZ2VyXG4gKiBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgYW4gaW5saW5lIGZ1bmN0aW9uXG4gKiBUaGUgYHRyYW5zaXRpb25gIGFuaW1hdGlvbiBtZXRob2QgYWxzbyBzdXBwb3J0cyByZWFkaW5nIGFuIGlubGluZSBmdW5jdGlvbiB3aGljaCBjYW4gZGVjaWRlXG4gKiBpZiBpdHMgYXNzb2NpYXRlZCBhbmltYXRpb24gc2hvdWxkIGJlIHJ1bi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGlzIG1ldGhvZCBpcyBydW4gZWFjaCB0aW1lIHRoZSBgbXlBbmltYXRpb25UcmlnZ2VyYCB0cmlnZ2VyIHZhbHVlIGNoYW5nZXMuXG4gKiBmdW5jdGlvbiBteUlubGluZU1hdGNoZXJGbihmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6XG4gc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICogICAvLyBub3RpY2UgdGhhdCBgZWxlbWVudGAgYW5kIGBwYXJhbXNgIGFyZSBhbHNvIGF2YWlsYWJsZSBoZXJlXG4gKiAgIHJldHVybiB0b1N0YXRlID09ICd5ZXMtcGxlYXNlLWFuaW1hdGUnO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ215QW5pbWF0aW9uVHJpZ2dlcicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24obXlJbmxpbmVNYXRjaGVyRm4sIFtcbiAqICAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSBjb2RlXG4gKiAgICAgICBdKSxcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwieWVzLXBsZWFzZS1hbmltYXRlXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRGlzYWJsaW5nIEFuaW1hdGlvbnNcbiAqIFdoZW4gdHJ1ZSwgdGhlIHNwZWNpYWwgYW5pbWF0aW9uIGNvbnRyb2wgYmluZGluZyBgQC5kaXNhYmxlZGAgYmluZGluZyBwcmV2ZW50cyBcbiAqIGFsbCBhbmltYXRpb25zIGZyb20gcmVuZGVyaW5nLlxuICogUGxhY2UgdGhlICBgQC5kaXNhYmxlZGAgYmluZGluZyBvbiBhbiBlbGVtZW50IHRvIGRpc2FibGVcbiAqIGFuaW1hdGlvbnMgb24gdGhlIGVsZW1lbnQgaXRzZWxmLCBhcyB3ZWxsIGFzIGFueSBpbm5lciBhbmltYXRpb24gdHJpZ2dlcnNcbiAqIHdpdGhpbiB0aGUgZWxlbWVudC5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIHVzZSB0aGlzIGZlYXR1cmU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtALmRpc2FibGVkXT1cImlzRGlzYWJsZWRcIj5cbiAqICAgICAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJjaGlsZEFuaW1hdGlvblwiLCBbXG4gKiAgICAgICAvLyAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBpc0Rpc2FibGVkID0gdHJ1ZTtcbiAqICAgZXhwID0gJy4uLic7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIGBALmRpc2FibGVkYCBpcyB0cnVlLCBpdCBwcmV2ZW50cyB0aGUgYEBjaGlsZEFuaW1hdGlvbmAgdHJpZ2dlciBmcm9tIGFuaW1hdGluZyxcbiAqIGFsb25nIHdpdGggYW55IGlubmVyIGFuaW1hdGlvbnMuXG4gKlxuICogIyMjIERpc2FibGUgYW5pbWF0aW9ucyBhcHBsaWNhdGlvbi13aWRlXG4gKiBXaGVuIGFuIGFyZWEgb2YgdGhlIHRlbXBsYXRlIGlzIHNldCB0byBoYXZlIGFuaW1hdGlvbnMgZGlzYWJsZWQsIFxuICogKiphbGwqKiBpbm5lciBjb21wb25lbnRzIGhhdmUgdGhlaXIgYW5pbWF0aW9ucyBkaXNhYmxlZCBhcyB3ZWxsLlxuICogVGhpcyBtZWFucyB0aGF0IHlvdSBjYW4gZGlzYWJsZSBhbGwgYW5pbWF0aW9ucyBmb3IgYW4gYXBwXG4gKiBieSBwbGFjaW5nIGEgaG9zdCBiaW5kaW5nIHNldCBvbiBgQC5kaXNhYmxlZGAgb24gdGhlIHRvcG1vc3QgQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtDb21wb25lbnQsIEhvc3RCaW5kaW5nfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAtY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnLFxuICogfSlcbiAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gKiAgIEBIb3N0QmluZGluZygnQC5kaXNhYmxlZCcpXG4gKiAgIHB1YmxpYyBhbmltYXRpb25zRGlzYWJsZWQgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKlxuICogIyMjIE92ZXJyaWRpbmcgZGlzYWJsZW1lbnQgb2YgaW5uZXIgYW5pbWF0aW9uc1xuICogRGVzcGl0ZSBpbm5lciBhbmltYXRpb25zIGJlaW5nIGRpc2FibGVkLCBhIHBhcmVudCBhbmltYXRpb24gY2FuIGBxdWVyeSgpYFxuICogZm9yIGlubmVyIGVsZW1lbnRzIGxvY2F0ZWQgaW4gZGlzYWJsZWQgYXJlYXMgb2YgdGhlIHRlbXBsYXRlIGFuZCBzdGlsbCBhbmltYXRlIFxuICogdGhlbSBpZiBuZWVkZWQuIFRoaXMgaXMgYWxzbyB0aGUgY2FzZSBmb3Igd2hlbiBhIHN1YiBhbmltYXRpb24gaXMgXG4gKiBxdWVyaWVkIGJ5IGEgcGFyZW50IGFuZCB0aGVuIGxhdGVyIGFuaW1hdGVkIHVzaW5nIGBhbmltYXRlQ2hpbGQoKWAuXG4gKlxuICogIyMjIERldGVjdGluZyB3aGVuIGFuIGFuaW1hdGlvbiBpcyBkaXNhYmxlZFxuICogSWYgYSByZWdpb24gb2YgdGhlIERPTSAob3IgdGhlIGVudGlyZSBhcHBsaWNhdGlvbikgaGFzIGl0cyBhbmltYXRpb25zIGRpc2FibGVkLCB0aGUgYW5pbWF0aW9uXG4gKiB0cmlnZ2VyIGNhbGxiYWNrcyBzdGlsbCBmaXJlLCBidXQgZm9yIHplcm8gc2Vjb25kcy4gV2hlbiB0aGUgY2FsbGJhY2sgZmlyZXMsIGl0IHByb3ZpZGVzXG4gKiBhbiBpbnN0YW5jZSBvZiBhbiBgQW5pbWF0aW9uRXZlbnRgLiBJZiBhbmltYXRpb25zIGFyZSBkaXNhYmxlZCxcbiAqIHRoZSBgLmRpc2FibGVkYCBmbGFnIG9uIHRoZSBldmVudCBpcyB0cnVlLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlciwgbmFtZSwgZGVmaW5pdGlvbnMsIG9wdGlvbnM6IHt9fTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgY29tYmluZXMgc3R5bGluZyBpbmZvcm1hdGlvbiB3aXRoIHRpbWluZyBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBTZXRzIGBBbmltYXRlVGltaW5nc2AgZm9yIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogQSBzdHJpbmcgaW4gdGhlIGZvcm1hdCBcImR1cmF0aW9uIFtkZWxheV0gW2Vhc2luZ11cIi5cbiAqICAtIER1cmF0aW9uIGFuZCBkZWxheSBhcmUgZXhwcmVzc2VkIGFzIGEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsXG4gKiBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZCBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuXG4gKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAqICAtIFRoZSBlYXNpbmcgdmFsdWUgY29udHJvbHMgaG93IHRoZSBhbmltYXRpb24gYWNjZWxlcmF0ZXMgYW5kIGRlY2VsZXJhdGVzXG4gKiBkdXJpbmcgaXRzIHJ1bnRpbWUuIFZhbHVlIGlzIG9uZSBvZiAgYGVhc2VgLCBgZWFzZS1pbmAsIGBlYXNlLW91dGAsXG4gKiBgZWFzZS1pbi1vdXRgLCBvciBhIGBjdWJpYy1iZXppZXIoKWAgZnVuY3Rpb24gY2FsbC5cbiAqIElmIG5vdCBzdXBwbGllZCwgbm8gZWFzaW5nIGlzIGFwcGxpZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBzdHJpbmcgXCIxcyAxMDBtcyBlYXNlLW91dFwiIHNwZWNpZmllcyBhIGR1cmF0aW9uIG9mXG4gKiAxMDAwIG1pbGxpc2Vjb25kcywgYW5kIGRlbGF5IG9mIDEwMCBtcywgYW5kIHRoZSBcImVhc2Utb3V0XCIgZWFzaW5nIHN0eWxlLFxuICogd2hpY2ggZGVjZWxlcmF0ZXMgbmVhciB0aGUgZW5kIG9mIHRoZSBkdXJhdGlvbi5cbiAqIEBwYXJhbSBzdHlsZXMgU2V0cyBBbmltYXRpb25TdHlsZXMgZm9yIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogQSBmdW5jdGlvbiBjYWxsIHRvIGVpdGhlciBgc3R5bGUoKWAgb3IgYGtleWZyYW1lcygpYFxuICogdGhhdCByZXR1cm5zIGEgY29sbGVjdGlvbiBvZiBDU1Mgc3R5bGUgZW50cmllcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogV2hlbiBudWxsLCB1c2VzIHRoZSBzdHlsZXMgZnJvbSB0aGUgZGVzdGluYXRpb24gc3RhdGUuXG4gKiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGRlc2NyaWJpbmcgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCB3aWxsIGNvbXBsZXRlIGFuIGFuaW1hdGlvbjtcbiAqIHNlZSBcIkFuaW1hdGluZyB0byB0aGUgZmluYWwgc3RhdGVcIiBpbiBgdHJhbnNpdGlvbnMoKWAuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGFuaW1hdGlvbiBzdGVwLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBDYWxsIHdpdGhpbiBhbiBhbmltYXRpb24gYHNlcXVlbmNlKClgLCBgZ3JvdXAoKWAsIG9yXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsIHRvIHNwZWNpZnkgYW4gYW5pbWF0aW9uIHN0ZXBcbiAqIHRoYXQgYXBwbGllcyBnaXZlbiBzdHlsZSBkYXRhIHRvIHRoZSBwYXJlbnQgYW5pbWF0aW9uIGZvciBhIGdpdmVuIGFtb3VudCBvZiB0aW1lLlxuICpcbiAqICMjIyBTeW50YXggRXhhbXBsZXNcbiAqICoqVGltaW5nIGV4YW1wbGVzKipcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGVzIHNob3cgdmFyaW91cyBgdGltaW5nc2Agc3BlY2lmaWNhdGlvbnMuXG4gKiAtIGBhbmltYXRlKDUwMClgIDogRHVyYXRpb24gaXMgNTAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCIxc1wiKWAgOiBEdXJhdGlvbiBpcyAxMDAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCIxMDBtcyAwLjVzXCIpYCA6IER1cmF0aW9uIGlzIDEwMCBtaWxsaXNlY29uZHMsIGRlbGF5IGlzIDUwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiNXMgZWFzZS1pblwiKWAgOiBEdXJhdGlvbiBpcyA1MDAwIG1pbGxpc2Vjb25kcywgZWFzaW5nIGluLlxuICogLSBgYW5pbWF0ZShcIjVzIDEwbXMgY3ViaWMtYmV6aWVyKC4xNywuNjcsLjg4LC4xKVwiKWAgOiBEdXJhdGlvbiBpcyA1MDAwIG1pbGxpc2Vjb25kcywgZGVsYXkgaXMgMTBcbiAqIG1pbGxpc2Vjb25kcywgZWFzaW5nIGFjY29yZGluZyB0byBhIGJlemllciBjdXJ2ZS5cbiAqXG4gKiAqKlN0eWxlIGV4YW1wbGVzKipcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY2FsbHMgYHN0eWxlKClgIHRvIHNldCBhIHNpbmdsZSBDU1Mgc3R5bGUuXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKDUwMCwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiIH0pKVxuICogYGBgXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY2FsbHMgYGtleWZyYW1lcygpYCB0byBzZXQgYSBDU1Mgc3R5bGVcbiAqIHRvIGRpZmZlcmVudCB2YWx1ZXMgZm9yIHN1Y2Nlc3NpdmUga2V5ZnJhbWVzLlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZSg1MDAsIGtleWZyYW1lcyhcbiAqICBbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJibHVlXCIgfSkpLFxuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiAgXSlcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZShcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB8IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgfFxuICAgICAgICBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGUsIHN0eWxlcywgdGltaW5nc307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERlZmluZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0byBiZSBydW4gaW4gcGFyYWxsZWwuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gKiAtIFdoZW4gc3RlcHMgYXJlIGRlZmluZWQgYnkgYHN0eWxlKClgIG9yIGBhbmltYXRlKClgXG4gKiBmdW5jdGlvbiBjYWxscywgZWFjaCBjYWxsIHdpdGhpbiB0aGUgZ3JvdXAgaXMgZXhlY3V0ZWQgaW5zdGFudGx5LlxuICogLSBUbyBzcGVjaWZ5IG9mZnNldCBzdHlsZXMgdG8gYmUgYXBwbGllZCBhdCBhIGxhdGVyIHRpbWUsIGRlZmluZSBzdGVwcyB3aXRoXG4gKiBga2V5ZnJhbWVzKClgLCBvciB1c2UgYGFuaW1hdGUoKWAgY2FsbHMgd2l0aCBhIGRlbGF5IHZhbHVlLlxuICogRm9yIGV4YW1wbGU6XG4gKiBcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGdyb3VwKFtcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgYmFja2dyb3VuZDogXCJibGFja1wiIH0pKVxuICogICBhbmltYXRlKFwiMnNcIiwgeyBjb2xvcjogXCJ3aGl0ZVwiIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBncm91cCBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBHcm91cGVkIGFuaW1hdGlvbnMgYXJlIHVzZWZ1bCB3aGVuIGEgc2VyaWVzIG9mIHN0eWxlcyBtdXN0IGJlIFxuICogYW5pbWF0ZWQgYXQgZGlmZmVyZW50IHN0YXJ0aW5nIHRpbWVzIGFuZCBjbG9zZWQgb2ZmIGF0IGRpZmZlcmVudCBlbmRpbmcgdGltZXMuXG4gKlxuICogV2hlbiBjYWxsZWQgd2l0aGluIGEgYHNlcXVlbmNlKClgIG9yIGFcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwsIGRvZXMgbm90IGNvbnRpbnVlIHRvIHRoZSBuZXh0XG4gKiBpbnN0cnVjdGlvbiB1bnRpbCBhbGwgb2YgdGhlIGlubmVyIGFuaW1hdGlvbiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25Hcm91cE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXAsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdG8gYmUgcnVuIHNlcXVlbnRpYWxseSwgb25lIGJ5IG9uZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgc3R5bGUoKWAgY2FsbHMgYXBwbHkgdGhlIHN0eWxpbmcgZGF0YSBpbW1lZGlhdGVseS5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgYW5pbWF0ZSgpYCBjYWxscyBhcHBseSB0aGUgc3R5bGluZyBkYXRhIG92ZXIgdGltZVxuICogICBhcyBzcGVjaWZpZWQgYnkgdGhlIHRpbWluZyBkYXRhLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgb3BhY2l0eTogMSB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgc2VxdWVuY2UgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogV2hlbiB5b3UgcGFzcyBhbiBhcnJheSBvZiBzdGVwcyB0byBhXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsLCB0aGUgc3RlcHMgcnVuIHNlcXVlbnRpYWxseSBieSBkZWZhdWx0LlxuICogQ29tcGFyZSB0aGlzIHRvIHRoZSBgZ3JvdXAoKWAgY2FsbCwgd2hpY2ggcnVucyBhbmltYXRpb24gc3RlcHMgaW4gcGFyYWxsZWwuXG4gKlxuICogV2hlbiBhIHNlcXVlbmNlIGlzIHVzZWQgd2l0aGluIGEgYGdyb3VwKClgIG9yIGEgYHRyYW5zaXRpb24oKWAgY2FsbCxcbiAqIGV4ZWN1dGlvbiBjb250aW51ZXMgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb24gb25seSBhZnRlciBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb25cbiAqIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICpcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZShzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTpcbiAgICBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGtleS92YWx1ZSBvYmplY3QgY29udGFpbmluZyBDU1MgcHJvcGVydGllcy9zdHlsZXMgdGhhdFxuICogY2FuIHRoZW4gYmUgdXNlZCBmb3IgYW4gYW5pbWF0aW9uIGBzdGF0ZWAsIHdpdGhpbiBhbiBhbmltYXRpb24gYHNlcXVlbmNlYCxcbiAqIG9yIGFzIHN0eWxpbmcgZGF0YSBmb3IgY2FsbHMgdG8gYGFuaW1hdGUoKWAgYW5kIGBrZXlmcmFtZXMoKWAuXG4gKlxuICogQHBhcmFtIHRva2VucyBBIHNldCBvZiBDU1Mgc3R5bGVzIG9yIEhUTUwgc3R5bGVzIGFzc29jaWF0ZWQgd2l0aCBhbiBhbmltYXRpb24gc3RhdGUuXG4gKiBUaGUgdmFsdWUgY2FuIGJlIGFueSBvZiB0aGUgZm9sbG93aW5nOlxuICogLSBBIGtleS12YWx1ZSBzdHlsZSBwYWlyIGFzc29jaWF0aW5nIGEgQ1NTIHByb3BlcnR5IHdpdGggYSB2YWx1ZS5cbiAqIC0gQW4gYXJyYXkgb2Yga2V5LXZhbHVlIHN0eWxlIHBhaXJzLlxuICogLSBBbiBhc3RlcmlzayAoKiksIHRvIHVzZSBhdXRvLXN0eWxpbmcsIHdoZXJlIHN0eWxlcyBhcmUgZGVyaXZlZCBmcm9tIHRoZSBlbGVtZW50XG4gKiBiZWluZyBhbmltYXRlZCBhbmQgYXBwbGllZCB0byB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgc3RhcnRzLlxuICpcbiAqIEF1dG8tc3R5bGluZyBjYW4gYmUgdXNlZCB0byBkZWZpbmUgYSBzdGF0ZSB0aGF0IGRlcGVuZHMgb24gbGF5b3V0IG9yIG90aGVyIFxuICogZW52aXJvbm1lbnRhbCBmYWN0b3JzLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdHlsZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGVzIGNyZWF0ZSBhbmltYXRpb24gc3R5bGVzIHRoYXQgY29sbGVjdCBhIHNldCBvZlxuICogQ1NTIHByb3BlcnR5IHZhbHVlczpcbiAqIFxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gc3RyaW5nIHZhbHVlcyBmb3IgQ1NTIHByb3BlcnRpZXNcbiAqIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiwgY29sb3I6IFwiYmx1ZVwiIH0pXG4gKlxuICogLy8gbnVtZXJpY2FsIHBpeGVsIHZhbHVlc1xuICogc3R5bGUoeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDAgfSlcbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSB1c2VzIGF1dG8tc3R5bGluZyB0byBhbGxvdyBhIGNvbXBvbmVudCB0byBhbmltYXRlIGZyb21cbiAqIGEgaGVpZ2h0IG9mIDAgdXAgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFyZW50IGVsZW1lbnQ6XG4gKlxuICogYGBgXG4gKiBzdHlsZSh7IGhlaWdodDogMCB9KSxcbiAqIGFuaW1hdGUoXCIxc1wiLCBzdHlsZSh7IGhlaWdodDogXCIqXCIgfSkpXG4gKiBgYGBcbiAqXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGUoXG4gICAgdG9rZW5zOiAnKicgfCB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSB8XG4gICAgQXJyYXk8JyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9Pik6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZSwgc3R5bGVzOiB0b2tlbnMsIG9mZnNldDogbnVsbH07XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gYW5pbWF0aW9uIHN0YXRlIHdpdGhpbiBhIHRyaWdnZXIgYXR0YWNoZWQgdG8gYW4gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBPbmUgb3IgbW9yZSBuYW1lcyBmb3IgdGhlIGRlZmluZWQgc3RhdGUgaW4gYSBjb21tYS1zZXBhcmF0ZWQgc3RyaW5nLlxuICogVGhlIGZvbGxvd2luZyByZXNlcnZlZCBzdGF0ZSBuYW1lcyBjYW4gYmUgc3VwcGxpZWQgdG8gZGVmaW5lIGEgc3R5bGUgZm9yIHNwZWNpZmljIHVzZVxuICogY2FzZXM6XG4gKlxuICogLSBgdm9pZGAgWW91IGNhbiBhc3NvY2lhdGUgc3R5bGVzIHdpdGggdGhpcyBuYW1lIHRvIGJlIHVzZWQgd2hlblxuICogdGhlIGVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSB0aGUgYXBwbGljYXRpb24uIEZvciBleGFtcGxlLCB3aGVuIGFuIGBuZ0lmYCBldmFsdWF0ZXNcbiAqIHRvIGZhbHNlLCB0aGUgc3RhdGUgb2YgdGhlIGFzc29jaWF0ZWQgZWxlbWVudCBpcyB2b2lkLlxuICogIC0gYCpgIChhc3RlcmlzaykgSW5kaWNhdGVzIHRoZSBkZWZhdWx0IHN0YXRlLiBZb3UgY2FuIGFzc29jaWF0ZSBzdHlsZXMgd2l0aCB0aGlzIG5hbWVcbiAqIHRvIGJlIHVzZWQgYXMgdGhlIGZhbGxiYWNrIHdoZW4gdGhlIHN0YXRlIHRoYXQgaXMgYmVpbmcgYW5pbWF0ZWQgaXMgbm90IGRlY2xhcmVkXG4gKiB3aXRoaW4gdGhlIHRyaWdnZXIuXG4gKlxuICogQHBhcmFtIHN0eWxlcyBBIHNldCBvZiBDU1Mgc3R5bGVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHN0YXRlLCBjcmVhdGVkIHVzaW5nIHRoZVxuICogYHN0eWxlKClgIGZ1bmN0aW9uLlxuICogVGhpcyBzZXQgb2Ygc3R5bGVzIHBlcnNpc3RzIG9uIHRoZSBlbGVtZW50IG9uY2UgdGhlIHN0YXRlIGhhcyBiZWVuIHJlYWNoZWQuXG4gKiBAcGFyYW0gb3B0aW9ucyBQYXJhbWV0ZXJzIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgc3RhdGUgd2hlbiBpdCBpcyBpbnZva2VkLlxuICogMCBvciBtb3JlIGtleS12YWx1ZSBwYWlycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBuZXcgc3RhdGUgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVXNlIHRoZSBgdHJpZ2dlcigpYCBmdW5jdGlvbiB0byByZWdpc3RlciBzdGF0ZXMgdG8gYW4gYW5pbWF0aW9uIHRyaWdnZXIuXG4gKiBVc2UgdGhlIGB0cmFuc2l0aW9uKClgIGZ1bmN0aW9uIHRvIGFuaW1hdGUgYmV0d2VlbiBzdGF0ZXMuXG4gKiBXaGVuIGEgc3RhdGUgaXMgYWN0aXZlIHdpdGhpbiBhIGNvbXBvbmVudCwgaXRzIGFzc29jaWF0ZWQgc3R5bGVzIHBlcnNpc3Qgb24gdGhlIGVsZW1lbnQsXG4gKiBldmVuIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRzLlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRlKFxuICAgIG5hbWU6IHN0cmluZywgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19KTogQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlLCBuYW1lLCBzdHlsZXMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIERlZmluZXMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0eWxlcywgYXNzb2NpYXRpbmcgZWFjaCBzdHlsZSB3aXRoIGFuIG9wdGlvbmFsIGBvZmZzZXRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBBIHNldCBvZiBhbmltYXRpb24gc3R5bGVzIHdpdGggb3B0aW9uYWwgb2Zmc2V0IGRhdGEuXG4gKiBUaGUgb3B0aW9uYWwgYG9mZnNldGAgdmFsdWUgZm9yIGEgc3R5bGUgc3BlY2lmaWVzIGEgcGVyY2VudGFnZSBvZiB0aGUgdG90YWwgYW5pbWF0aW9uXG4gKiB0aW1lIGF0IHdoaWNoIHRoYXQgc3R5bGUgaXMgYXBwbGllZC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUga2V5ZnJhbWVzIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFVzZSB3aXRoIHRoZSBgYW5pbWF0ZSgpYCBjYWxsLiBJbnN0ZWFkIG9mIGFwcGx5aW5nIGFuaW1hdGlvbnNcbiAqIGZyb20gdGhlIGN1cnJlbnQgc3RhdGVcbiAqIHRvIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZSwga2V5ZnJhbWVzIGRlc2NyaWJlIGhvdyBlYWNoIHN0eWxlIGVudHJ5IGlzIGFwcGxpZWQgYW5kIGF0IHdoYXQgcG9pbnRcbiAqIHdpdGhpbiB0aGUgYW5pbWF0aW9uIGFyYy5cbiAqIENvbXBhcmUgW0NTUyBLZXlmcmFtZSBBbmltYXRpb25zXShodHRwczovL3d3dy53M3NjaG9vbHMuY29tL2Nzcy9jc3MzX2FuaW1hdGlvbnMuYXNwKS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIHRoZSBvZmZzZXQgdmFsdWVzIGRlc2NyaWJlXG4gKiB3aGVuIGVhY2ggYGJhY2tncm91bmRDb2xvcmAgdmFsdWUgaXMgYXBwbGllZC4gVGhlIGNvbG9yIGlzIHJlZCBhdCB0aGUgc3RhcnQsIGFuZCBjaGFuZ2VzIHRvXG4gKiBibHVlIHdoZW4gMjAlIG9mIHRoZSB0b3RhbCB0aW1lIGhhcyBlbGFwc2VkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoZSBwcm92aWRlZCBvZmZzZXQgdmFsdWVzXG4gKiBhbmltYXRlKFwiNXNcIiwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIsIG9mZnNldDogMCB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiLCBvZmZzZXQ6IDAuMiB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIsIG9mZnNldDogMC4zIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiLCBvZmZzZXQ6IDEgfSlcbiAqIF0pKVxuICogYGBgXG4gKlxuICogSWYgdGhlcmUgYXJlIG5vIGBvZmZzZXRgIHZhbHVlcyBzcGVjaWZpZWQgaW4gdGhlIHN0eWxlIGVudHJpZXMsIHRoZSBvZmZzZXRzXG4gKiBhcmUgY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiB9KSAvLyBvZmZzZXQgPSAwXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiB9KSAvLyBvZmZzZXQgPSAwLjMzXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiIH0pIC8vIG9mZnNldCA9IDAuNjZcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiB9KSAvLyBvZmZzZXQgPSAxXG4gKiBdKSlcbiAqYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXlmcmFtZXMoc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXSk6IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMsIHN0ZXBzfTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhbiBhbmltYXRpb24gdHJhbnNpdGlvbiBhcyBhIHNlcXVlbmNlIG9mIGFuaW1hdGlvbiBzdGVwcyB0byBydW4gd2hlbiBhIGdpdmVuXG4gKiBjb25kaXRpb24gaXMgc2F0aXNmaWVkLiBUaGUgY29uZGl0aW9uIGlzIGEgQm9vbGVhbiBleHByZXNzaW9uIG9yIGZ1bmN0aW9uIHRoYXQgY29tcGFyZXNcbiAqIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCBhbmltYXRpb24gc3RhdGVzLCBhbmQgcmV0dXJucyB0cnVlIGlmIHRoaXMgdHJhbnNpdGlvbiBzaG91bGQgb2NjdXIuXG4gKiBXaGVuIHRoZSBzdGF0ZSBjcml0ZXJpYSBvZiBhIGRlZmluZWQgdHJhbnNpdGlvbiBhcmUgbWV0LCB0aGUgYXNzb2NpYXRlZCBhbmltYXRpb24gaXNcbiAqIHRyaWdnZXJlZC5cbiAqXG4gKiBAcGFyYW0gc3RhdGVDaGFuZ2VFeHByIEEgQm9vbGVhbiBleHByZXNzaW9uIG9yIGZ1bmN0aW9uIHRoYXQgY29tcGFyZXMgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50XG4gKiBhbmltYXRpb24gc3RhdGVzLCBhbmQgcmV0dXJucyB0cnVlIGlmIHRoaXMgdHJhbnNpdGlvbiBzaG91bGQgb2NjdXIuIE5vdGUgdGhhdCAgXCJ0cnVlXCIgYW5kIFwiZmFsc2VcIlxuICogbWF0Y2ggMSBhbmQgMCwgcmVzcGVjdGl2ZWx5LiBBbiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZCBlYWNoIHRpbWUgYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzIGluIHRoZVxuICogYW5pbWF0aW9uIHRyaWdnZXIgZWxlbWVudC5cbiAqIFRoZSBhbmltYXRpb24gc3RlcHMgcnVuIHdoZW4gdGhlIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRydWUuXG4gKlxuICogLSBBIHN0YXRlLWNoYW5nZSBzdHJpbmcgdGFrZXMgdGhlIGZvcm0gXCJzdGF0ZTEgPT4gc3RhdGUyXCIsIHdoZXJlIGVhY2ggc2lkZSBpcyBhIGRlZmluZWQgYW5pbWF0aW9uXG4gKiBzdGF0ZSwgb3IgYW4gYXN0ZXJpeCAoKikgdG8gcmVmZXIgdG8gYSBkeW5hbWljIHN0YXJ0IG9yIGVuZCBzdGF0ZS5cbiAqICAgLSBUaGUgZXhwcmVzc2lvbiBzdHJpbmcgY2FuIGNvbnRhaW4gbXVsdGlwbGUgY29tbWEtc2VwYXJhdGVkIHN0YXRlbWVudHM7XG4gKiBmb3IgZXhhbXBsZSBcInN0YXRlMSA9PiBzdGF0ZTIsIHN0YXRlMyA9PiBzdGF0ZTRcIi5cbiAqICAgLSBTcGVjaWFsIHZhbHVlcyBgOmVudGVyYCBhbmQgYDpsZWF2ZWAgaW5pdGlhdGUgYSB0cmFuc2l0aW9uIG9uIHRoZSBlbnRyeSBhbmQgZXhpdCBzdGF0ZXMsXG4gKiBlcXVpdmFsZW50IHRvICBcInZvaWQgPT4gKlwiICBhbmQgXCIqID0+IHZvaWRcIi5cbiAqICAgLSBTcGVjaWFsIHZhbHVlcyBgOmluY3JlbWVudGAgYW5kIGA6ZGVjcmVtZW50YCBpbml0aWF0ZSBhIHRyYW5zaXRpb24gd2hlbiBhIG51bWVyaWMgdmFsdWUgaGFzXG4gKiBpbmNyZWFzZWQgb3IgZGVjcmVhc2VkIGluIHZhbHVlLlxuICogLSBBIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGVhY2ggdGltZSBhIHN0YXRlIGNoYW5nZSBvY2N1cnMgaW4gdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBUaGUgYW5pbWF0aW9uIHN0ZXBzIHJ1biB3aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUuXG4gKlxuICogQHBhcmFtIHN0ZXBzIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvYmplY3RzLCBhcyByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGUoKWAgb3JcbiAqIGBzZXF1ZW5jZSgpYCBmdW5jdGlvbiwgdGhhdCBmb3JtIGEgdHJhbnNmb3JtYXRpb24gZnJvbSBvbmUgc3RhdGUgdG8gYW5vdGhlci5cbiAqIEEgc2VxdWVuY2UgaXMgdXNlZCBieSBkZWZhdWx0IHdoZW4geW91IHBhc3MgYW4gYXJyYXkuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCB0aGF0IGNhbiBjb250YWluIGEgZGVsYXkgdmFsdWUgZm9yIHRoZSBzdGFydCBvZiB0aGUgYW5pbWF0aW9uLFxuICogYW5kIGFkZGl0aW9uYWwgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy4gUHJvdmlkZWQgdmFsdWVzIGZvciBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHVzZWRcbiAqIGFzIGRlZmF1bHRzLCBhbmQgb3ZlcnJpZGUgdmFsdWVzIGNhbiBiZSBwYXNzZWQgdG8gdGhlIGNhbGxlciBvbiBpbnZvY2F0aW9uLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSB0cmFuc2l0aW9uIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggYSBjb21wb25lbnQgYmluZHMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgdG8gYW4gZWxlbWVudC5cbiAqXG4gKiBgYGBIVE1MXG4gKiA8IS0tIHNvbWV3aGVyZSBpbnNpZGUgb2YgbXktY29tcG9uZW50LXRwbC5odG1sIC0tPlxuICogPGRpdiBbQG15QW5pbWF0aW9uVHJpZ2dlcl09XCJteVN0YXR1c0V4cFwiPi4uLjwvZGl2PlxuICogYGBgXG4gKlxuICogQWxsIHRyYW5zaXRpb25zIGFyZSBkZWZpbmVkIHdpdGhpbiBhbiBhbmltYXRpb24gdHJpZ2dlcixcbiAqIGFsb25nIHdpdGggbmFtZWQgc3RhdGVzIHRoYXQgdGhlIHRyYW5zaXRpb25zIGNoYW5nZSB0byBhbmQgZnJvbS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmlnZ2VyKFwibXlBbmltYXRpb25UcmlnZ2VyXCIsIFtcbiAqICAvLyBkZWZpbmUgc3RhdGVzXG4gKiAgc3RhdGUoXCJvblwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JlZW5cIiB9KSksXG4gKiAgc3RhdGUoXCJvZmZcIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZXlcIiB9KSksXG4gKiAgLi4uXVxuICogYGBgXG4gKlxuICogTm90ZSB0aGF0IHdoZW4geW91IGNhbGwgdGhlIGBzZXF1ZW5jZSgpYCBmdW5jdGlvbiB3aXRoaW4gYSBgZ3JvdXAoKWBcbiAqIG9yIGEgYHRyYW5zaXRpb24oKWAgY2FsbCwgZXhlY3V0aW9uIGRvZXMgbm90IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uXG4gKiB1bnRpbCBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb24gc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICogIyMjIFN5bnRheCBleGFtcGxlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgZGVmaW5lIHRyYW5zaXRpb25zIGJldHdlZW4gdGhlIHR3byBkZWZpbmVkIHN0YXRlcyAoYW5kIGRlZmF1bHQgc3RhdGVzKSxcbiAqIHVzaW5nIHZhcmlvdXMgb3B0aW9uczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBUcmFuc2l0aW9uIG9jY3VycyB3aGVuIHRoZSBzdGF0ZSB2YWx1ZVxuICogLy8gYm91bmQgdG8gXCJteUFuaW1hdGlvblRyaWdnZXJcIiBjaGFuZ2VzIGZyb20gXCJvblwiIHRvIFwib2ZmXCJcbiAqIHRyYW5zaXRpb24oXCJvbiA9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKVxuICogLy8gUnVuIHRoZSBzYW1lIGFuaW1hdGlvbiBmb3IgYm90aCBkaXJlY3Rpb25zXG4gKiB0cmFuc2l0aW9uKFwib24gPD0+IG9mZlwiLCBhbmltYXRlKDUwMCkpXG4gKiAvLyBEZWZpbmUgbXVsdGlwbGUgc3RhdGUtY2hhbmdlIHBhaXJzIHNlcGFyYXRlZCBieSBjb21tYXNcbiAqIHRyYW5zaXRpb24oXCJvbiA9PiBvZmYsIG9mZiA9PiB2b2lkXCIsIGFuaW1hdGUoNTAwKSlcbiAqIGBgYFxuICpcbiAqICMjIyBTcGVjaWFsIHZhbHVlcyBmb3Igc3RhdGUtY2hhbmdlIGV4cHJlc3Npb25zXG4gKlxuICogLSBDYXRjaC1hbGwgc3RhdGUgY2hhbmdlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgcGFnZSBhbmQgdGhlXG4gKiBkZXN0aW5hdGlvbiBzdGF0ZSBpcyB1bmtub3duOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICBhbmltYXRlKDUwMClcbiAqICBdKVxuICogYGBgXG4gKlxuICogLSBDYXB0dXJlIGEgc3RhdGUgY2hhbmdlIGJldHdlZW4gYW55IHN0YXRlczpcbiAqXG4gKiAgYHRyYW5zaXRpb24oXCIqID0+ICpcIiwgYW5pbWF0ZShcIjFzIDBzXCIpKWBcbiAqXG4gKiAtIEVudHJ5IGFuZCBleGl0IHRyYW5zaXRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCI6ZW50ZXJcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgIF0pLFxuICogdHJhbnNpdGlvbihcIjpsZWF2ZVwiLCBbXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiAgIF0pXG4gKiBgYGBcbiAqXG4gKiAtIFVzZSBgOmluY3JlbWVudGAgYW5kIGA6ZGVjcmVtZW50YCB0byBpbml0aWF0ZSB0cmFuc2l0aW9uczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKFwiOmluY3JlbWVudFwiLCBncm91cChbXG4gKiAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgXSksXG4gKiAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pKVxuICogIF0pXG4gKiBdKSlcbiAqXG4gKiB0cmFuc2l0aW9uKFwiOmRlY3JlbWVudFwiLCBncm91cChbXG4gKiAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgXSksXG4gKiAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pKVxuICogIF0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqICMjIyBTdGF0ZS1jaGFuZ2UgZnVuY3Rpb25zXG4gKlxuICogSGVyZSBpcyBhbiBleGFtcGxlIG9mIGEgYGZyb21TdGF0ZWAgc3BlY2lmaWVkIGFzIGEgc3RhdGUtY2hhbmdlIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhblxuICogYW5pbWF0aW9uIHdoZW4gdHJ1ZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKChmcm9tU3RhdGUsIHRvU3RhdGUpID0+XG4gKiAge1xuICogICByZXR1cm4gZnJvbVN0YXRlID09IFwib2ZmXCIgJiYgdG9TdGF0ZSA9PSBcIm9uXCI7XG4gKiAgfSxcbiAqICBhbmltYXRlKFwiMXMgMHNcIikpXG4gKiBgYGBcbiAqXG4gKiAjIyMgQW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZVxuICpcbiAqIElmIHRoZSBmaW5hbCBzdGVwIGluIGEgdHJhbnNpdGlvbiBpcyBhIGNhbGwgdG8gYGFuaW1hdGUoKWAgdGhhdCB1c2VzIGEgdGltaW5nIHZhbHVlXG4gKiB3aXRoIG5vIHN0eWxlIGRhdGEsIHRoYXQgc3RlcCBpcyBhdXRvbWF0aWNhbGx5IGNvbnNpZGVyZWQgdGhlIGZpbmFsIGFuaW1hdGlvbiBhcmMsXG4gKiBmb3IgdGhlIGVsZW1lbnQgdG8gcmVhY2ggdGhlIGZpbmFsIHN0YXRlLiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgYWRkcyBvciByZW1vdmVzXG4gKiBDU1Mgc3R5bGVzIHRvIGVuc3VyZSB0aGF0IHRoZSBlbGVtZW50IGlzIGluIHRoZSBjb3JyZWN0IGZpbmFsIHN0YXRlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWZpbmVzIGEgdHJhbnNpdGlvbiB0aGF0IHN0YXJ0cyBieSBoaWRpbmcgdGhlIGVsZW1lbnQsXG4gKiB0aGVuIG1ha2VzIHN1cmUgdGhhdCBpdCBhbmltYXRlcyBwcm9wZXJseSB0byB3aGF0ZXZlciBzdGF0ZSBpcyBjdXJyZW50bHkgYWN0aXZlIGZvciB0cmlnZ2VyOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwKVxuICogIF0pXG4gKiBgYGBcbiAqICMjIyBCb29sZWFuIHZhbHVlIG1hdGNoaW5nXG4gKiBJZiBhIHRyaWdnZXIgYmluZGluZyB2YWx1ZSBpcyBhIEJvb2xlYW4sIGl0IGNhbiBiZSBtYXRjaGVkIHVzaW5nIGEgdHJhbnNpdGlvbiBleHByZXNzaW9uXG4gKiB0aGF0IGNvbXBhcmVzIHRydWUgYW5kIGZhbHNlIG9yIDEgYW5kIDAuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYFxuICogLy8gaW4gdGhlIHRlbXBsYXRlXG4gKiA8ZGl2IFtAb3BlbkNsb3NlXT1cIm9wZW4gPyB0cnVlIDogZmFsc2VcIj4uLi48L2Rpdj5cbiAqIC8vIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAqIHRyaWdnZXIoJ29wZW5DbG9zZScsIFtcbiAqICAgc3RhdGUoJ3RydWUnLCBzdHlsZSh7IGhlaWdodDogJyonIH0pKSxcbiAqICAgc3RhdGUoJ2ZhbHNlJywgc3R5bGUoeyBoZWlnaHQ6ICcwcHgnIH0pKSxcbiAqICAgdHJhbnNpdGlvbignZmFsc2UgPD0+IHRydWUnLCBhbmltYXRlKDUwMCkpXG4gKiBdKVxuICogYGBgXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNpdGlvbihcbiAgICBzdGF0ZUNoYW5nZUV4cHI6IHN0cmluZyB8ICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pLFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbiwgZXhwcjogc3RhdGVDaGFuZ2VFeHByLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBQcm9kdWNlcyBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGNhbiBiZSBpbnZva2VkIGluIGFub3RoZXIgYW5pbWF0aW9uIG9yIHNlcXVlbmNlLFxuICogYnkgY2FsbGluZyB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMsIGFzIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZSgpYFxuICogb3IgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLCB0aGF0IGZvcm0gYSB0cmFuc2Zvcm1hdGlvbiBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICogQSBzZXF1ZW5jZSBpcyB1c2VkIGJ5IGRlZmF1bHQgd2hlbiB5b3UgcGFzcyBhbiBhcnJheS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZVxuICogYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogUHJvdmlkZWQgdmFsdWVzIGZvciBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHVzZWQgYXMgZGVmYXVsdHMsXG4gKiBhbmQgb3ZlcnJpZGUgdmFsdWVzIGNhbiBiZSBwYXNzZWQgdG8gdGhlIGNhbGxlciBvbiBpbnZvY2F0aW9uLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSByZXVzYWJsZSBhbmltYXRpb24sIHByb3ZpZGluZyBzb21lIGRlZmF1bHQgcGFyYW1ldGVyXG4gKiB2YWx1ZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIGZhZGVBbmltYXRpb24gPSBhbmltYXRpb24oW1xuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBzdGFydCB9fScgfSksXG4gKiAgIGFuaW1hdGUoJ3t7IHRpbWUgfX0nLFxuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBlbmQgfX0nfSkpXG4gKiAgIF0sXG4gKiAgIHsgcGFyYW1zOiB7IHRpbWU6ICcxMDAwbXMnLCBzdGFydDogMCwgZW5kOiAxIH19KTtcbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgaW52b2tlcyB0aGUgZGVmaW5lZCBhbmltYXRpb24gd2l0aCBhIGNhbGwgdG8gYHVzZUFuaW1hdGlvbigpYCxcbiAqIHBhc3NpbmcgaW4gb3ZlcnJpZGUgcGFyYW1ldGVyIHZhbHVlcy5cbiAqXG4gKiBgYGBqc1xuICogdXNlQW5pbWF0aW9uKGZhZGVBbmltYXRpb24sIHtcbiAqICAgcGFyYW1zOiB7XG4gKiAgICAgdGltZTogJzJzJyxcbiAqICAgICBzdGFydDogMSxcbiAqICAgICBlbmQ6IDBcbiAqICAgfVxuICogfSlcbiAqIGBgYFxuICpcbiAqIElmIGFueSBvZiB0aGUgcGFzc2VkLWluIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgZnJvbSB0aGlzIGNhbGwsXG4gKiB0aGUgZGVmYXVsdCB2YWx1ZXMgYXJlIHVzZWQuIElmIG9uZSBvciBtb3JlIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgYmVmb3JlIGEgc3RlcCBpc1xuICogYW5pbWF0ZWQsIGB1c2VBbmltYXRpb24oKWAgdGhyb3dzIGFuIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2UsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgcXVlcmllZCBpbm5lciBhbmltYXRpb24gZWxlbWVudCB3aXRoaW4gYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZVxuICogYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBvdmVycmlkZSB2YWx1ZXMgZm9yIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgY2hpbGQgYW5pbWF0aW9uIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEVhY2ggdGltZSBhbiBhbmltYXRpb24gaXMgdHJpZ2dlcmVkIGluIEFuZ3VsYXIsIHRoZSBwYXJlbnQgYW5pbWF0aW9uXG4gKiBoYXMgcHJpb3JpdHkgYW5kIGFueSBjaGlsZCBhbmltYXRpb25zIGFyZSBibG9ja2VkLiBJbiBvcmRlclxuICogZm9yIGEgY2hpbGQgYW5pbWF0aW9uIHRvIHJ1biwgdGhlIHBhcmVudCBhbmltYXRpb24gbXVzdCBxdWVyeSBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICogY29udGFpbmluZyBjaGlsZCBhbmltYXRpb25zLCBhbmQgcnVuIHRoZW0gdXNpbmcgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBmZWF0dXJlIGRlc2lnbmVkIHRvIGJlIHVzZWQgd2l0aCBgcXVlcnkoKWAgYW5kIGl0IHdpbGwgb25seSB3b3JrXG4gKiB3aXRoIGFuaW1hdGlvbnMgdGhhdCBhcmUgYXNzaWduZWQgdXNpbmcgdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIGxpYnJhcnkuIENTUyBrZXlmcmFtZXNcbiAqIGFuZCB0cmFuc2l0aW9ucyBhcmUgbm90IGhhbmRsZWQgYnkgdGhpcyBBUEkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlQ2hpbGQob3B0aW9uczogQW5pbWF0ZUNoaWxkT3B0aW9ucyB8IG51bGwgPSBudWxsKTpcbiAgICBBbmltYXRpb25BbmltYXRlQ2hpbGRNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVDaGlsZCwgb3B0aW9uc307XG59XG5cbi8qKlxuICogU3RhcnRzIGEgcmV1c2FibGUgYW5pbWF0aW9uIHRoYXQgaXMgY3JlYXRlZCB1c2luZyB0aGUgYGFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gYW5pbWF0aW9uIFRoZSByZXVzYWJsZSBhbmltYXRpb24gdG8gc3RhcnQuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCB0aGF0IGNhbiBjb250YWluIGEgZGVsYXkgdmFsdWUgZm9yIHRoZSBzdGFydCBvZiBcbiAqIHRoZSBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIG92ZXJyaWRlIHZhbHVlcyBmb3IgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGFuaW1hdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQW5pbWF0aW9uKFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEsXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZVJlZk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZVJlZiwgYW5pbWF0aW9uLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBGaW5kcyBvbmUgb3IgbW9yZSBpbm5lciBlbGVtZW50cyB3aXRoaW4gdGhlIGN1cnJlbnQgZWxlbWVudCB0aGF0IGlzXG4gKiBiZWluZyBhbmltYXRlZCB3aXRoaW4gYSBzZXF1ZW5jZS4gVXNlIHdpdGggYGFuaW1hdGVDaGlsZCgpYC5cbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3IgVGhlIGVsZW1lbnQgdG8gcXVlcnksIG9yIGEgc2V0IG9mIGVsZW1lbnRzIHRoYXQgY29udGFpbiBBbmd1bGFyLXNwZWNpZmljXG4gKiBjaGFyYWN0ZXJpc3RpY3MsIHNwZWNpZmllZCB3aXRoIG9uZSBvciBtb3JlIG9mIHRoZSBmb2xsb3dpbmcgdG9rZW5zLlxuICogIC0gYHF1ZXJ5KFwiOmVudGVyXCIpYCBvciBgcXVlcnkoXCI6bGVhdmVcIilgIDogUXVlcnkgZm9yIG5ld2x5IGluc2VydGVkL3JlbW92ZWQgZWxlbWVudHMuXG4gKiAgLSBgcXVlcnkoXCI6YW5pbWF0aW5nXCIpYCA6IFF1ZXJ5IGFsbCBjdXJyZW50bHkgYW5pbWF0aW5nIGVsZW1lbnRzLlxuICogIC0gYHF1ZXJ5KFwiQHRyaWdnZXJOYW1lXCIpYCA6IFF1ZXJ5IGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlci5cbiAqICAtIGBxdWVyeShcIkAqXCIpYCA6IFF1ZXJ5IGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXJzLlxuICogIC0gYHF1ZXJ5KFwiOnNlbGZcIilgIDogSW5jbHVkZSB0aGUgY3VycmVudCBlbGVtZW50IGludG8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBAcGFyYW0gYW5pbWF0aW9uIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwcyB0byBhcHBseSB0byB0aGUgcXVlcmllZCBlbGVtZW50IG9yIGVsZW1lbnRzLlxuICogQW4gYXJyYXkgaXMgdHJlYXRlZCBhcyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdC4gVXNlIHRoZSAnbGltaXQnIGZpZWxkIHRvIGxpbWl0IHRoZSB0b3RhbCBudW1iZXIgb2ZcbiAqIGl0ZW1zIHRvIGNvbGxlY3QuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgcXVlcnkgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVG9rZW5zIGNhbiBiZSBtZXJnZWQgaW50byBhIGNvbWJpbmVkIHF1ZXJ5IHNlbGVjdG9yIHN0cmluZy4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHF1ZXJ5KCc6c2VsZiwgLnJlY29yZDplbnRlciwgLnJlY29yZDpsZWF2ZSwgQHN1YlRyaWdnZXInLCBbLi4uXSlcbiAqIGBgYFxuICpcbiAqIFRoZSBgcXVlcnkoKWAgZnVuY3Rpb24gY29sbGVjdHMgbXVsdGlwbGUgZWxlbWVudHMgYW5kIHdvcmtzIGludGVybmFsbHkgYnkgdXNpbmdcbiAqIGBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGxgLiBVc2UgdGhlIGBsaW1pdGAgZmllbGQgb2YgYW4gb3B0aW9ucyBvYmplY3QgdG8gbGltaXRcbiAqIHRoZSB0b3RhbCBudW1iZXIgb2YgaXRlbXMgdG8gYmUgY29sbGVjdGVkLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogcXVlcnkoJ2RpdicsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgbGltaXQ6IDEgfSlcbiAqIGBgYFxuICpcbiAqIEJ5IGRlZmF1bHQsIHRocm93cyBhbiBlcnJvciB3aGVuIHplcm8gaXRlbXMgYXJlIGZvdW5kLiBTZXQgdGhlXG4gKiBgb3B0aW9uYWxgIGZsYWcgdG8gaWdub3JlIHRoaXMgZXJyb3IuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnLnNvbWUtZWxlbWVudC10aGF0LW1heS1ub3QtYmUtdGhlcmUnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IG9wdGlvbmFsOiB0cnVlIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBxdWVyaWVzIGZvciBpbm5lciBlbGVtZW50cyBhbmQgYW5pbWF0ZXMgdGhlbVxuICogaW5kaXZpZHVhbGx5IHVzaW5nIGBhbmltYXRlQ2hpbGQoKWAuIFxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2lubmVyJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtAcXVlcnlBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICA8aDE+VGl0bGU8L2gxPlxuICogICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAqICAgICAgICAgQmxhaCBibGFoIGJsYWhcbiAqICAgICAgIDwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICB0cmlnZ2VyKCdxdWVyeUFuaW1hdGlvbicsIFtcbiAqICAgICAgdHJhbnNpdGlvbignKiA9PiBnb0FuaW1hdGUnLCBbXG4gKiAgICAgICAgLy8gaGlkZSB0aGUgaW5uZXIgZWxlbWVudHNcbiAqICAgICAgICBxdWVyeSgnaDEnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICAgICAgIHF1ZXJ5KCcuY29udGVudCcsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKlxuICogICAgICAgIC8vIGFuaW1hdGUgdGhlIGlubmVyIGVsZW1lbnRzIGluLCBvbmUgYnkgb25lXG4gKiAgICAgICAgcXVlcnkoJ2gxJywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICAgIHF1ZXJ5KCcuY29udGVudCcsIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcbiAqICAgICAgXSlcbiAqICAgIF0pXG4gKiAgXVxuICogfSlcbiAqIGNsYXNzIENtcCB7XG4gKiAgIGV4cCA9ICcnO1xuICpcbiAqICAgZ29BbmltYXRlKCkge1xuICogICAgIHRoaXMuZXhwID0gJ2dvQW5pbWF0ZSc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcXVlcnkoXG4gICAgc2VsZWN0b3I6IHN0cmluZywgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uUXVlcnlPcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25RdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuUXVlcnksIHNlbGVjdG9yLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIFVzZSB3aXRoaW4gYW4gYW5pbWF0aW9uIGBxdWVyeSgpYCBjYWxsIHRvIGlzc3VlIGEgdGltaW5nIGdhcCBhZnRlclxuICogZWFjaCBxdWVyaWVkIGl0ZW0gaXMgYW5pbWF0ZWQuXG4gKlxuICogQHBhcmFtIHRpbWluZ3MgQSBkZWxheSB2YWx1ZS5cbiAqIEBwYXJhbSBhbmltYXRpb24gT25lIG9yZSBtb3JlIGFuaW1hdGlvbiBzdGVwcy5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgc3RhZ2dlciBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIGEgY29udGFpbmVyIGVsZW1lbnQgd3JhcHMgYSBsaXN0IG9mIGl0ZW1zIHN0YW1wZWQgb3V0XG4gKiBieSBhbiBgbmdGb3JgLiBUaGUgY29udGFpbmVyIGVsZW1lbnQgY29udGFpbnMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgdGhhdCB3aWxsIGxhdGVyIGJlIHNldFxuICogdG8gcXVlcnkgZm9yIGVhY2ggb2YgdGhlIGlubmVyIGl0ZW1zLlxuICpcbiAqIEVhY2ggdGltZSBpdGVtcyBhcmUgYWRkZWQsIHRoZSBvcGFjaXR5IGZhZGUtaW4gYW5pbWF0aW9uIHJ1bnMsXG4gKiBhbmQgZWFjaCByZW1vdmVkIGl0ZW0gaXMgZmFkZWQgb3V0LlxuICogV2hlbiBlaXRoZXIgb2YgdGhlc2UgYW5pbWF0aW9ucyBvY2N1ciwgdGhlIHN0YWdnZXIgZWZmZWN0IGlzXG4gKiBhcHBsaWVkIGFmdGVyIGVhY2ggaXRlbSdzIGFuaW1hdGlvbiBpcyBzdGFydGVkLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gbGlzdC5jb21wb25lbnQuaHRtbCAtLT5cbiAqIDxidXR0b24gKGNsaWNrKT1cInRvZ2dsZSgpXCI+U2hvdyAvIEhpZGUgSXRlbXM8L2J1dHRvbj5cbiAqIDxociAvPlxuICogPGRpdiBbQGxpc3RBbmltYXRpb25dPVwiaXRlbXMubGVuZ3RoXCI+XG4gKiAgIDxkaXYgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXNcIj5cbiAqICAgICB7eyBpdGVtIH19XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBIZXJlIGlzIHRoZSBjb21wb25lbnQgY29kZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge3RyaWdnZXIsIHRyYW5zaXRpb24sIHN0eWxlLCBhbmltYXRlLCBxdWVyeSwgc3RhZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgdGVtcGxhdGVVcmw6ICdsaXN0LmNvbXBvbmVudC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgICAgLi4uXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIExpc3RDb21wb25lbnQge1xuICogICBpdGVtcyA9IFtdO1xuICpcbiAqICAgc2hvd0l0ZW1zKCkge1xuICogICAgIHRoaXMuaXRlbXMgPSBbMCwxLDIsMyw0XTtcbiAqICAgfVxuICpcbiAqICAgaGlkZUl0ZW1zKCkge1xuICogICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAqICAgfVxuICpcbiAqICAgdG9nZ2xlKCkge1xuICogICAgIHRoaXMuaXRlbXMubGVuZ3RoID8gdGhpcy5oaWRlSXRlbXMoKSA6IHRoaXMuc2hvd0l0ZW1zKCk7XG4gKiAgICB9XG4gKiAgfVxuICogYGBgXG4gKlxuICogSGVyZSBpcyB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgY29kZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmlnZ2VyKCdsaXN0QW5pbWF0aW9uJywgW1xuICogICB0cmFuc2l0aW9uKCcqID0+IConLCBbIC8vIGVhY2ggdGltZSB0aGUgYmluZGluZyB2YWx1ZSBjaGFuZ2VzXG4gKiAgICAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pLFxuICogICAgIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICBzdGFnZ2VyKDEwMCwgW1xuICogICAgICAgICBhbmltYXRlKCcwLjVzJywgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogICAgICAgXSlcbiAqICAgICBdKVxuICogICBdKVxuICogXSlcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2dlcihcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIsXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGFnZ2VyLCB0aW1pbmdzLCBhbmltYXRpb259O1xufVxuIl19