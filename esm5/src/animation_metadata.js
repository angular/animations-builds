/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Specifies automatic styling.
 */
export var AUTO_STYLE = '*';
/**
 * Creates a named animation trigger, containing a  list of `state()`
 * and `transition()` entries to be evaluated when the expression
 * bound to the trigger changes.
 *
 * @param name An identifying string.
 * @param definitions  An animation definition object, containing an array of `state()`
 * and `transition()` declarations.
 *
 * @return An object that encapsulates the trigger data.
 *
 * @usageNotes
 * Define an animation trigger in the `animations` section of `@Component` metadata.
 * In the template, reference the trigger by name and bind it to a trigger expression that
 * evaluates to a defined animation state, using the following format:
 *
 * `[@triggerName]="expression"`
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
 * @Component({
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
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * ### Using an inline function
 * The `transition` animation method also supports reading an inline function which can decide
 * if its associated animation should be run.
 *
 * ```typescript
 * // this method is run each time the `myAnimationTrigger` trigger value changes.
 * function myInlineMatcherFn(fromState: string, toState: string, element: any, params: {[key:
 string]: any}): boolean {
 *   // notice that `element` and `params` are also available here
 *   return toState == 'yes-please-animate';
 * }
 *
 * @Component({
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
 * When true, the special animation control binding `@.disabled` binding prevents
 * all animations from rendering.
 * Place the  `@.disabled` binding on an element to disable
 * animations on the element itself, as well as any inner animation triggers
 * within the element.
 *
 * The following example shows how to use this feature:
 *
 * ```typescript
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     <div [@.disabled]="isDisabled">
 *       <div [@childAnimation]="exp"></div>
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
 * When `@.disabled` is true, it prevents the `@childAnimation` trigger from animating,
 * along with any inner animations.
 *
 * ### Disable animations application-wide
 * When an area of the template is set to have animations disabled,
 * **all** inner components have their animations disabled as well.
 * This means that you can disable all animations for an app
 * by placing a host binding set on `@.disabled` on the topmost Angular component.
 *
 * ```typescript
 * import {Component, HostBinding} from '@angular/core';
 *
 * @Component({
 *   selector: 'app-component',
 *   templateUrl: 'app.component.html',
 * })
 * class AppComponent {
 *   @HostBinding('@.disabled')
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
 * @experimental Animation support is experimental.
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name: name, definitions: definitions, options: {} };
}
/**
 * Defines an animation step that combines styling information with timing information.
 *
 * @param timings Sets `AnimateTimings` for the parent animation.
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
 * @param styles Sets AnimationStyles for the parent animation.
 * A function call to either `style()` or `keyframes()`
 * that returns a collection of CSS style entries to be applied to the parent animation.
 * When null, uses the styles from the destination state.
 * This is useful when describing an animation step that will complete an animation;
 * see "Animating to the final state" in `transitions()`.
 * @returns An object that encapsulates the animation step.
 *
 * @usageNotes
 * Call within an animation `sequence()`, `{@link animations/group group()}`, or
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
 */
export function animate(timings, styles) {
    if (styles === void 0) { styles = null; }
    return { type: 4 /* Animate */, styles: styles, timings: timings };
}
/**
 * @description Defines a list of animation steps to be run in parallel.
 *
 * @param steps An array of animation step objects.
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
 * @param options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return An object that encapsulates the group data.
 *
 * @usageNotes
 * Grouped animations are useful when a series of styles must be
 * animated at different starting times and closed off at different ending times.
 *
 * When called within a `sequence()` or a
 * `transition()` call, does not continue to the next
 * instruction until all of the inner animation steps have completed.
 */
export function group(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 3 /* Group */, steps: steps, options: options };
}
/**
 * Defines a list of animation steps to be run sequentially, one by one.
 *
 * @param steps An array of animation step objects.
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
 * @param options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return An object that encapsulates the sequence data.
 *
 * @usageNotes
 * When you pass an array of steps to a
 * `transition()` call, the steps run sequentially by default.
 * Compare this to the `{@link animations/group group()}` call, which runs animation steps in parallel.
 *
 * When a sequence is used within a `{@link animations/group group()}` or a `transition()` call,
 * execution continues to the next instruction only after each of the inner animation
 * steps have completed.
 *
 **/
export function sequence(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 2 /* Sequence */, steps: steps, options: options };
}
/**
 * Declares a key/value object containing CSS properties/styles that
 * can then be used for an animation `state`, within an animation `sequence`,
 * or as styling data for calls to `animate()` and `keyframes()`.
 *
 * @param tokens A set of CSS styles or HTML styles associated with an animation state.
 * The value can be any of the following:
 * - A key-value style pair associating a CSS property with a value.
 * - An array of key-value style pairs.
 * - An asterisk (*), to use auto-styling, where styles are derived from the element
 * being animated and applied to the animation when it starts.
 *
 * Auto-styling can be used to define a state that depends on layout or other
 * environmental factors.
 *
 * @return An object that encapsulates the style data.
 *
 * @usageNotes
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
 **/
export function style(tokens) {
    return { type: 6 /* Style */, styles: tokens, offset: null };
}
/**
 * Declares an animation state within a trigger attached to an element.
 *
 * @param name One or more names for the defined state in a comma-separated string.
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
 * @param styles A set of CSS styles associated with this state, created using the
 * `style()` function.
 * This set of styles persists on the element once the state has been reached.
 * @param options Parameters that can be passed to the state when it is invoked.
 * 0 or more key-value pairs.
 * @return An object that encapsulates the new state data.
 *
 * @usageNotes
 * Use the `trigger()` function to register states to an animation trigger.
 * Use the `transition()` function to animate between states.
 * When a state is active within a component, its associated styles persist on the element,
 * even when the animation ends.
 **/
export function state(name, styles, options) {
    return { type: 0 /* State */, name: name, styles: styles, options: options };
}
/**
 * Defines a set of animation styles, associating each style with an optional `offset` value.
 *
 * @param steps A set of animation styles with optional offset data.
 * The optional `offset` value for a style specifies a percentage of the total animation
 * time at which that style is applied.
 * @returns An object that encapsulates the keyframes data.
 *
 * @usageNotes
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
 *```
 */
export function keyframes(steps) {
    return { type: 5 /* Keyframes */, steps: steps };
}
/**
 * Declares an animation transition as a sequence of animation steps to run when a given
 * condition is satisfied. The condition is a Boolean expression or function that compares
 * the previous and current animation states, and returns true if this transition should occur.
 * When the state criteria of a defined transition are met, the associated animation is
 * triggered.
 *
 * @param stateChangeExpr A Boolean expression or function that compares the previous and current
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
 * @param steps One or more animation objects, as returned by the `animate()` or
 * `sequence()` function, that form a transformation from one state to another.
 * A sequence is used by default when you pass an array.
 * @param options An options object that can contain a delay value for the start of the animation,
 * and additional developer-defined parameters. Provided values for additional parameters are used
 * as defaults, and override values can be passed to the caller on invocation.
 * @returns An object that encapsulates the transition data.
 *
 * @usageNotes
 * The template associated with a component binds an animation trigger to an element.
 *
 * ```HTML
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
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
 * Note that when you call the `sequence()` function within a `{@link animations/group group()}`
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
 * <div [@openClose]="open ? true : false">...</div>
 * // in the component metadata
 * trigger('openClose', [
 *   state('true', style({ height: '*' })),
 *   state('false', style({ height: '0px' })),
 *   transition('false <=> true', animate(500))
 * ])
 * ```
 **/
export function transition(stateChangeExpr, steps, options) {
    if (options === void 0) { options = null; }
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options: options };
}
/**
 * Produces a reusable animation that can be invoked in another animation or sequence,
 * by calling the `useAnimation()` function.
 *
 * @param steps One or more animation objects, as returned by the `animate()`
 * or `sequence()` function, that form a transformation from one state to another.
 * A sequence is used by default when you pass an array.
 * @param options An options object that can contain a delay value for the start of the
 * animation, and additional developer-defined parameters.
 * Provided values for additional parameters are used as defaults,
 * and override values can be passed to the caller on invocation.
 * @returns An object that encapsulates the animation data.
 *
 * @usageNotes
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
 * The following example invokes the defined animation with a call to `useAnimation()`,
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
 */
export function animation(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 8 /* Reference */, animation: steps, options: options };
}
/**
 * Executes a queried inner animation element within an animation sequence.
 *
 * @param options An options object that can contain a delay value for the start of the
 * animation, and additional override values for developer-defined parameters.
 * @return An object that encapsulates the child animation data.
 *
 * @usageNotes
 * Each time an animation is triggered in Angular, the parent animation
 * has priority and any child animations are blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations, and run them using this function.
 *
 * Note that this feature designed to be used with `query()` and it will only work
 * with animations that are assigned using the Angular animation library. CSS keyframes
 * and transitions are not handled by this API.
 */
export function animateChild(options) {
    if (options === void 0) { options = null; }
    return { type: 9 /* AnimateChild */, options: options };
}
/**
 * Starts a reusable animation that is created using the `animation()` function.
 *
 * @param animation The reusable animation to start.
 * @param options An options object that can contain a delay value for the start of
 * the animation, and additional override values for developer-defined parameters.
 * @return An object that contains the animation parameters.
 */
export function useAnimation(animation, options) {
    if (options === void 0) { options = null; }
    return { type: 10 /* AnimateRef */, animation: animation, options: options };
}
/**
 * Finds one or more inner elements within the current element that is
 * being animated within a sequence. Use with `animateChild()`.
 *
 * @param selector The element to query, or a set of elements that contain Angular-specific
 * characteristics, specified with one or more of the following tokens.
 *  - `query(":enter")` or `query(":leave")` : Query for newly inserted/removed elements.
 *  - `query(":animating")` : Query all currently animating elements.
 *  - `query("@triggerName")` : Query elements that contain an animation trigger.
 *  - `query("@*")` : Query all elements that contain an animation triggers.
 *  - `query(":self")` : Include the current element into the animation sequence.
 *
 * @param animation One or more animation steps to apply to the queried element or elements.
 * An array is treated as an animation sequence.
 * @param options An options object. Use the 'limit' field to limit the total number of
 * items to collect.
 * @return An object that encapsulates the query data.
 *
 * @usageNotes
 * Tokens can be merged into a combined query selector string. For example:
 *
 * ```typescript
 *  query(':self, .record:enter, .record:leave, @subTrigger', [...])
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
 * @Component({
 *   selector: 'inner',
 *   template: `
 *     <div [@queryAnimation]="exp">
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
 */
export function query(selector, animation, options) {
    if (options === void 0) { options = null; }
    return { type: 11 /* Query */, selector: selector, animation: animation, options: options };
}
/**
 * Use within an animation `query()` call to issue a timing gap after
 * each queried item is animated.
 *
 * @param timings A delay value.
 * @param animation One ore more animation steps.
 * @returns An object that encapsulates the stagger data.
 *
 * @usageNotes
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
 * <div [@listAnimation]="items.length">
 *   <div *ngFor="let item of items">
 *     {{ item }}
 *   </div>
 * </div>
 * ```
 *
 * Here is the component code:
 *
 * ```typescript
 * import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
 * @Component({
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
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings: timings, animation: animation };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQW1KSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUF5UDlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtSkc7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUFDLElBQVksRUFBRSxXQUFnQztJQUNwRSxPQUFPLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLE1BQUEsRUFBRSxXQUFXLGFBQUEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDL0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdURHO0FBQ0gsTUFBTSxVQUFVLE9BQU8sQ0FDbkIsT0FBd0IsRUFBRSxNQUNYO0lBRFcsdUJBQUEsRUFBQSxhQUNYO0lBQ2pCLE9BQU8sRUFBQyxJQUFJLGlCQUErQixFQUFFLE1BQU0sUUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUNqQixLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDckUsT0FBTyxFQUFDLElBQUksZUFBNkIsRUFBRSxLQUFLLE9BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBOEJJO0FBQ0osTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFFMUYsT0FBTyxFQUFDLElBQUksa0JBQWdDLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxQ0k7QUFDSixNQUFNLFVBQVUsS0FBSyxDQUNqQixNQUMyQztJQUM3QyxPQUFPLEVBQUMsSUFBSSxlQUE2QixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzNFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEwQkk7QUFDSixNQUFNLFVBQVUsS0FBSyxDQUNqQixJQUFZLEVBQUUsTUFBOEIsRUFDNUMsT0FBeUM7SUFDM0MsT0FBTyxFQUFDLElBQUksZUFBNkIsRUFBRSxJQUFJLE1BQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMENHO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FBQyxLQUErQjtJQUN2RCxPQUFPLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxLQUFLLE9BQUEsRUFBQyxDQUFDO0FBQ3hELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBcUtJO0FBQ0osTUFBTSxVQUFVLFVBQVUsQ0FDdEIsZUFDc0UsRUFDdEUsS0FBOEMsRUFDOUMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxPQUFPLEVBQUMsSUFBSSxvQkFBa0MsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQ3JCLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsT0FBTyxFQUFDLElBQUksbUJBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBMEM7SUFBMUMsd0JBQUEsRUFBQSxjQUEwQztJQUVyRSxPQUFPLEVBQUMsSUFBSSxzQkFBb0MsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDeEIsU0FBcUMsRUFDckMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxPQUFPLEVBQUMsSUFBSSxxQkFBa0MsRUFBRSxTQUFTLFdBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3RFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0ZHO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FDakIsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxPQUE0QztJQUE1Qyx3QkFBQSxFQUFBLGNBQTRDO0lBQzlDLE9BQU8sRUFBQyxJQUFJLGdCQUE2QixFQUFFLFFBQVEsVUFBQSxFQUFFLFNBQVMsV0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZFRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQ25CLE9BQXdCLEVBQ3hCLFNBQWtEO0lBQ3BELE9BQU8sRUFBQyxJQUFJLGtCQUErQixFQUFFLE9BQU8sU0FBQSxFQUFFLFNBQVMsV0FBQSxFQUFDLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2V0IG9mIENTUyBzdHlsZXMgZm9yIHVzZSBpbiBhbiBhbmltYXRpb24gc3R5bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgybVTdHlsZURhdGEgeyBba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyOyB9XG5cbi8qKlxuKiBSZXByZXNlbnRzIGFuaW1hdGlvbi1zdGVwIHRpbWluZyBwYXJhbWV0ZXJzIGZvciBhbiBhbmltYXRpb24gc3RlcC4gIFxuKiBAc2VlIGBhbmltYXRlKClgXG4qL1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBBbmltYXRlVGltaW5ncyA9IHtcbiAgLyoqXG4gICAqIFRoZSBmdWxsIGR1cmF0aW9uIG9mIGFuIGFuaW1hdGlvbiBzdGVwLiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LFxuICAgKiBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZCBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuXG4gICAqIFRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgZHVyYXRpb246IG51bWJlcixcbiAgLyoqXG4gICAqIFRoZSBkZWxheSBpbiBhcHBseWluZyBhbiBhbmltYXRpb24gc3RlcC4gQSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdC5cbiAgICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBkZWxheTogbnVtYmVyLFxuICAvKipcbiAgICogQW4gZWFzaW5nIHN0eWxlIHRoYXQgY29udHJvbHMgaG93IGFuIGFuaW1hdGlvbnMgc3RlcCBhY2NlbGVyYXRlc1xuICAgKiBhbmQgZGVjZWxlcmF0ZXMgZHVyaW5nIGl0cyBydW4gdGltZS4gQW4gZWFzaW5nIGZ1bmN0aW9uIHN1Y2ggYXMgYGN1YmljLWJlemllcigpYCxcbiAgICogb3Igb25lIG9mIHRoZSBmb2xsb3dpbmcgY29uc3RhbnRzOlxuICAgKiAtIGBlYXNlLWluYFxuICAgKiAtIGBlYXNlLW91dGBcbiAgICogLSBgZWFzZS1pbi1hbmQtb3V0YFxuICAgKi9cbiAgZWFzaW5nOiBzdHJpbmcgfCBudWxsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBPcHRpb25zIHRoYXQgY29udHJvbCBhbmltYXRpb24gc3R5bGluZyBhbmQgdGltaW5nLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgYW5pbWF0aW9uIGZ1bmN0aW9ucyBhY2NlcHQgYEFuaW1hdGlvbk9wdGlvbnNgIGRhdGE6XG4gKlxuICogLSBgdHJhbnNpdGlvbigpYFxuICogLSBgc2VxdWVuY2UoKWBcbiAqIC0gYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YFxuICogLSBgcXVlcnkoKWBcbiAqIC0gYGFuaW1hdGlvbigpYFxuICogLSBgdXNlQW5pbWF0aW9uKClgXG4gKiAtIGBhbmltYXRlQ2hpbGQoKWBcbiAqXG4gKiBQcm9ncmFtbWF0aWMgYW5pbWF0aW9ucyBidWlsdCB1c2luZyB0aGUgYEFuaW1hdGlvbkJ1aWxkZXJgIHNlcnZpY2UgYWxzb1xuICogbWFrZSB1c2Ugb2YgYEFuaW1hdGlvbk9wdGlvbnNgLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTZXRzIGEgdGltZS1kZWxheSBmb3IgaW5pdGlhdGluZyBhbiBhbmltYXRpb24gYWN0aW9uLlxuICAgKiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LCBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZFxuICAgKiBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqIERlZmF1bHQgdmFsdWUgaXMgMCwgbWVhbmluZyBubyBkZWxheS5cbiAgICovXG4gIGRlbGF5PzogbnVtYmVyfHN0cmluZztcbiAgLyoqXG4gICogQSBzZXQgb2YgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IG1vZGlmeSBzdHlsaW5nIGFuZCB0aW1pbmdcbiAgKiB3aGVuIGFuIGFuaW1hdGlvbiBhY3Rpb24gc3RhcnRzLiBBbiBhcnJheSBvZiBrZXktdmFsdWUgcGFpcnMsIHdoZXJlIHRoZSBwcm92aWRlZCB2YWx1ZVxuICAqIGlzIHVzZWQgYXMgYSBkZWZhdWx0LlxuICAqL1xuICBwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQWRkcyBkdXJhdGlvbiBvcHRpb25zIHRvIGNvbnRyb2wgYW5pbWF0aW9uIHN0eWxpbmcgYW5kIHRpbWluZyBmb3IgYSBjaGlsZCBhbmltYXRpb24uXG4gKlxuICogQHNlZSBgYW5pbWF0ZUNoaWxkKClgXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRlQ2hpbGRPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7IGR1cmF0aW9uPzogbnVtYmVyfHN0cmluZzsgfVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb25zdGFudHMgZm9yIHRoZSBjYXRlZ29yaWVzIG9mIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgZGVmaW5lZCBmb3IgYW5pbWF0aW9ucy5cbiAqXG4gKiBBIGNvcnJlc3BvbmRpbmcgZnVuY3Rpb24gZGVmaW5lcyBhIHNldCBvZiBwYXJhbWV0ZXJzIGZvciBlYWNoIGNhdGVnb3J5LCBhbmRcbiAqIGNvbGxlY3RzIHRoZW0gaW50byBhIGNvcnJlc3BvbmRpbmcgYEFuaW1hdGlvbk1ldGFkYXRhYCBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSB7XG4gIC8qKlxuICAgKiBBc3NvY2lhdGVzIGEgbmFtZWQgYW5pbWF0aW9uIHN0YXRlIHdpdGggYSBzZXQgb2YgQ1NTIHN0eWxlcy5cbiAgICogU2VlIGBzdGF0ZSgpYFxuICAgKi9cbiAgU3RhdGUgPSAwLFxuICAvKipcbiAgICogRGF0YSBmb3IgYSB0cmFuc2l0aW9uIGZyb20gb25lIGFuaW1hdGlvbiBzdGF0ZSB0byBhbm90aGVyLlxuICAgKiBTZWUgYHRyYW5zaXRpb24oKWBcbiAgICovXG4gIFRyYW5zaXRpb24gPSAxLFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYHNlcXVlbmNlKClgXG4gICAqL1xuICBTZXF1ZW5jZSA9IDIsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gXG4gICAqL1xuICBHcm91cCA9IDMsXG4gIC8qKlxuICAgKiBDb250YWlucyBhbiBhbmltYXRpb24gc3RlcC5cbiAgICogU2VlIGBhbmltYXRlKClgXG4gICAqL1xuICBBbmltYXRlID0gNCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGBrZXlmcmFtZXMoKWBcbiAgICovXG4gIEtleWZyYW1lcyA9IDUsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBDU1MgcHJvcGVydHktdmFsdWUgcGFpcnMgaW50byBhIG5hbWVkIHN0eWxlLlxuICAgKiBTZWUgYHN0eWxlKClgXG4gICAqL1xuICBTdHlsZSA9IDYsXG4gIC8qKlxuICAgKiBBc3NvY2lhdGVzIGFuIGFuaW1hdGlvbiB3aXRoIGFuIGVudHJ5IHRyaWdnZXIgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gZWxlbWVudC5cbiAgICogU2VlIGB0cmlnZ2VyKClgXG4gICAqL1xuICBUcmlnZ2VyID0gNyxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgcmUtdXNhYmxlIGFuaW1hdGlvbi5cbiAgICogU2VlIGBhbmltYXRpb24oKWBcbiAgICovXG4gIFJlZmVyZW5jZSA9IDgsXG4gIC8qKlxuICAgKiBDb250YWlucyBkYXRhIHRvIHVzZSBpbiBleGVjdXRpbmcgY2hpbGQgYW5pbWF0aW9ucyByZXR1cm5lZCBieSBhIHF1ZXJ5LlxuICAgKiBTZWUgYGFuaW1hdGVDaGlsZCgpYFxuICAgKi9cbiAgQW5pbWF0ZUNoaWxkID0gOSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGFuaW1hdGlvbiBwYXJhbWV0ZXJzIGZvciBhIHJlLXVzYWJsZSBhbmltYXRpb24uXG4gICAqIFNlZSBgdXNlQW5pbWF0aW9uKClgXG4gICAqL1xuICBBbmltYXRlUmVmID0gMTAsXG4gIC8qKlxuICAgKiBDb250YWlucyBjaGlsZC1hbmltYXRpb24gcXVlcnkgZGF0YS5cbiAgICogU2VlIGBxdWVyeSgpYFxuICAgKi9cbiAgUXVlcnkgPSAxMSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGRhdGEgZm9yIHN0YWdnZXJpbmcgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICAgKiBTZWUgYHN0YWdnZXIoKWBcbiAgICovXG4gIFN0YWdnZXIgPSAxMlxufVxuXG4vKipcbiAqIFNwZWNpZmllcyBhdXRvbWF0aWMgc3R5bGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IEFVVE9fU1RZTEUgPSAnKic7XG5cbi8qKlxuICogQmFzZSBmb3IgYW5pbWF0aW9uIGRhdGEgc3RydWN0dXJlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25NZXRhZGF0YSB7IHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZTsgfVxuXG4vKipcbiAqIENvbnRhaW5zIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZVxuICogYHRyaWdnZXIoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICAqIFRoZSB0cmlnZ2VyIG5hbWUsIHVzZWQgdG8gYXNzb2NpYXRlIGl0IHdpdGggYW4gZWxlbWVudC4gVW5pcXVlIHdpdGhpbiB0aGUgY29tcG9uZW50LlxuICAgICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdCwgY29udGFpbmluZyBhbiBhcnJheSBvZiBzdGF0ZSBhbmQgdHJhbnNpdGlvbiBkZWNsYXJhdGlvbnMuXG4gICAqL1xuICBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczoge3BhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fX18bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0YXRlIGJ5IGFzc29jaWF0aW5nIGEgc3RhdGUgbmFtZSB3aXRoIGEgc2V0IG9mIENTUyBzdHlsZXMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc3RhdGUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBzdGF0ZSBuYW1lLCB1bmlxdWUgd2l0aGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiAgVGhlIENTUyBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc3RhdGUuXG4gICAqL1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGE7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gICAqL1xuICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fTtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHRyYW5zaXRpb24uIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlXG4gKiBgdHJhbnNpdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHRoYXQgZGVzY3JpYmVzIGEgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgZXhwcjogc3RyaW5nfFxuICAgICAgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbik7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cyB0byB3aGljaCB0aGlzIHRyYW5zaXRpb24gYXBwbGllcy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIHJldXNhYmxlIGFuaW1hdGlvbiwgd2hpY2ggaXMgYSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgYW5pbWF0aW9uIHN0ZXBzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGlvbigpYCBmdW5jdGlvbiwgYW5kXG4gKiBwYXNzZWQgdG8gdGhlIGB1c2VBbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gcXVlcnkuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBgcXVlcnkoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBUaGUgQ1NTIHNlbGVjdG9yIGZvciB0aGlzIHF1ZXJ5LlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBIHF1ZXJ5IG9wdGlvbnMgb2JqZWN0LlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uUXVlcnlPcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEga2V5ZnJhbWVzIHNlcXVlbmNlLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYGtleWZyYW1lcygpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0eWxlcy5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW107XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzdHlsZS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBzdHlsZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHlsZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQSBzZXQgb2YgQ1NTIHN0eWxlIHByb3BlcnRpZXMuXG4gICAqL1xuICBzdHlsZXM6ICcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXxBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXwnKic+O1xuICAvKipcbiAgICogQSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRlIHRpbWUgYXQgd2hpY2ggdGhlIHN0eWxlIGlzIHRvIGJlIGFwcGxpZWQuXG4gICAqL1xuICBvZmZzZXQ6IG51bWJlcnxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3RlcC4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBhbmltYXRlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1pbmcgZGF0YSBmb3IgdGhlIHN0ZXAuXG4gICAqL1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyfEFuaW1hdGVUaW1pbmdzO1xuICAvKipcbiAgICogQSBzZXQgb2Ygc3R5bGVzIHVzZWQgaW4gdGhlIHN0ZXAuXG4gICAqL1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGF8QW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YXxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIGNoaWxkIGFuaW1hdGlvbiwgdGhhdCBjYW4gYmUgcnVuIGV4cGxpY2l0bHkgd2hlbiB0aGUgcGFyZW50IGlzIHJ1bi5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlQ2hpbGRgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhbmltYXRpb24gcmVmZXJlbmNlIG9iamVjdC5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGE7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBncm91cC5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uR3JvdXBNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvciBzdHlsZSBzdGVwcyB0aGF0IGZvcm0gdGhpcyBncm91cC5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuaW1hdGlvbiBxdWVyeSBvcHRpb25zLlxuICogUGFzc2VkIHRvIHRoZSBgcXVlcnkoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25RdWVyeU9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFRydWUgaWYgdGhpcyBxdWVyeSBpcyBvcHRpb25hbCwgZmFsc2UgaWYgaXQgaXMgcmVxdWlyZWQuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAqIEEgcmVxdWlyZWQgcXVlcnkgdGhyb3dzIGFuIGVycm9yIGlmIG5vIGVsZW1lbnRzIGFyZSByZXRyaWV2ZWQgd2hlblxuICAgKiB0aGUgcXVlcnkgaXMgZXhlY3V0ZWQuIEFuIG9wdGlvbmFsIHF1ZXJ5IGRvZXMgbm90LlxuICAgKlxuICAgKi9cbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKipcbiAgICogQSBtYXhpbXVtIHRvdGFsIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybiBmcm9tIHRoZSBxdWVyeS5cbiAgICogSWYgbmVnYXRpdmUsIHJlc3VsdHMgYXJlIGxpbWl0ZWQgZnJvbSB0aGUgZW5kIG9mIHRoZSBxdWVyeSBsaXN0IHRvd2FyZHMgdGhlIGJlZ2lubmluZy5cbiAgICogQnkgZGVmYXVsdCwgcmVzdWx0cyBhcmUgbm90IGxpbWl0ZWQuXG4gICAqL1xuICBsaW1pdD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgcGFyYW1ldGVycyBmb3Igc3RhZ2dlcmluZyB0aGUgc3RhcnQgdGltZXMgb2YgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHN0YWdnZXIoKWAgZnVuY3Rpb24uXG4gKiovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1pbmcgZGF0YSBmb3IgdGhlIHN0ZXBzLlxuICAgKi9cbiAgdGltaW5nczogc3RyaW5nfG51bWJlcjtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwcy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmFtZWQgYW5pbWF0aW9uIHRyaWdnZXIsIGNvbnRhaW5pbmcgYSAgbGlzdCBvZiBgc3RhdGUoKWBcbiAqIGFuZCBgdHJhbnNpdGlvbigpYCBlbnRyaWVzIHRvIGJlIGV2YWx1YXRlZCB3aGVuIHRoZSBleHByZXNzaW9uXG4gKiBib3VuZCB0byB0aGUgdHJpZ2dlciBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBuYW1lIEFuIGlkZW50aWZ5aW5nIHN0cmluZy5cbiAqIEBwYXJhbSBkZWZpbml0aW9ucyAgQW4gYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LCBjb250YWluaW5nIGFuIGFycmF5IG9mIGBzdGF0ZSgpYFxuICogYW5kIGB0cmFuc2l0aW9uKClgIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgdHJpZ2dlciBkYXRhLlxuICogXG4gKiBAdXNhZ2VOb3Rlc1xuICogRGVmaW5lIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIGluIHRoZSBgYW5pbWF0aW9uc2Agc2VjdGlvbiBvZiBgQENvbXBvbmVudGAgbWV0YWRhdGEuXG4gKiBJbiB0aGUgdGVtcGxhdGUsIHJlZmVyZW5jZSB0aGUgdHJpZ2dlciBieSBuYW1lIGFuZCBiaW5kIGl0IHRvIGEgdHJpZ2dlciBleHByZXNzaW9uIHRoYXRcbiAqIGV2YWx1YXRlcyB0byBhIGRlZmluZWQgYW5pbWF0aW9uIHN0YXRlLCB1c2luZyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiBgW0B0cmlnZ2VyTmFtZV09XCJleHByZXNzaW9uXCJgXG4gKlxuICogQW5pbWF0aW9uIHRyaWdnZXIgYmluZGluZ3MgY29udmVydCBhbGwgdmFsdWVzIHRvIHN0cmluZ3MsIGFuZCB0aGVuIG1hdGNoIHRoZSBcbiAqIHByZXZpb3VzIGFuZCBjdXJyZW50IHZhbHVlcyBhZ2FpbnN0IGFueSBsaW5rZWQgdHJhbnNpdGlvbnMuXG4gKiBCb29sZWFucyBjYW4gYmUgc3BlY2lmaWVkIGFzIGAxYCBvciBgdHJ1ZWAgYW5kIGAwYCBvciBgZmFsc2VgLlxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlXG4gKiBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHJlZmVyZW5jZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWRcbiAqIG5hbWUgdmFsdWUuXG4gKiBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHZhbHVlIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5IGNvbnNpc3Rpbmcgb2Ygc3RhdGUgYW5kXG4gKiB0cmFuc2l0aW9uIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6IFwibXktY29tcG9uZW50XCIsXG4gKiAgIHRlbXBsYXRlVXJsOiBcIm15LWNvbXBvbmVudC10cGwuaHRtbFwiLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJzb21ldGhpbmdcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb21wb25lbnQgbWFrZXMgdXNlIG9mIHRoZSBkZWZpbmVkIHRyaWdnZXJcbiAqIGJ5IGJpbmRpbmcgdG8gYW4gZWxlbWVudCB3aXRoaW4gaXRzIHRlbXBsYXRlIGNvZGUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2luZyBhbiBpbmxpbmUgZnVuY3Rpb25cbiAqIFRoZSBgdHJhbnNpdGlvbmAgYW5pbWF0aW9uIG1ldGhvZCBhbHNvIHN1cHBvcnRzIHJlYWRpbmcgYW4gaW5saW5lIGZ1bmN0aW9uIHdoaWNoIGNhbiBkZWNpZGVcbiAqIGlmIGl0cyBhc3NvY2lhdGVkIGFuaW1hdGlvbiBzaG91bGQgYmUgcnVuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoaXMgbWV0aG9kIGlzIHJ1biBlYWNoIHRpbWUgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIHRyaWdnZXIgdmFsdWUgY2hhbmdlcy5cbiAqIGZ1bmN0aW9uIG15SW5saW5lTWF0Y2hlckZuKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTpcbiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gKiAgIC8vIG5vdGljZSB0aGF0IGBlbGVtZW50YCBhbmQgYHBhcmFtc2AgYXJlIGFsc28gYXZhaWxhYmxlIGhlcmVcbiAqICAgcmV0dXJuIHRvU3RhdGUgPT0gJ3llcy1wbGVhc2UtYW5pbWF0ZSc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteS1jb21wb25lbnQtdHBsLmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbXlBbmltYXRpb25UcmlnZ2VyJywgW1xuICogICAgICAgdHJhbnNpdGlvbihteUlubGluZU1hdGNoZXJGbiwgW1xuICogICAgICAgICAvLyB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlIGNvZGVcbiAqICAgICAgIF0pLFxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJ5ZXMtcGxlYXNlLWFuaW1hdGVcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBEaXNhYmxpbmcgQW5pbWF0aW9uc1xuICogV2hlbiB0cnVlLCB0aGUgc3BlY2lhbCBhbmltYXRpb24gY29udHJvbCBiaW5kaW5nIGBALmRpc2FibGVkYCBiaW5kaW5nIHByZXZlbnRzIFxuICogYWxsIGFuaW1hdGlvbnMgZnJvbSByZW5kZXJpbmcuXG4gKiBQbGFjZSB0aGUgIGBALmRpc2FibGVkYCBiaW5kaW5nIG9uIGFuIGVsZW1lbnQgdG8gZGlzYWJsZVxuICogYW5pbWF0aW9ucyBvbiB0aGUgZWxlbWVudCBpdHNlbGYsIGFzIHdlbGwgYXMgYW55IGlubmVyIGFuaW1hdGlvbiB0cmlnZ2Vyc1xuICogd2l0aGluIHRoZSBlbGVtZW50LlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIHRoaXMgZmVhdHVyZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0AuZGlzYWJsZWRdPVwiaXNEaXNhYmxlZFwiPlxuICogICAgICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcImNoaWxkQW5pbWF0aW9uXCIsIFtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGlzRGlzYWJsZWQgPSB0cnVlO1xuICogICBleHAgPSAnLi4uJztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdoZW4gYEAuZGlzYWJsZWRgIGlzIHRydWUsIGl0IHByZXZlbnRzIHRoZSBgQGNoaWxkQW5pbWF0aW9uYCB0cmlnZ2VyIGZyb20gYW5pbWF0aW5nLFxuICogYWxvbmcgd2l0aCBhbnkgaW5uZXIgYW5pbWF0aW9ucy5cbiAqXG4gKiAjIyMgRGlzYWJsZSBhbmltYXRpb25zIGFwcGxpY2F0aW9uLXdpZGVcbiAqIFdoZW4gYW4gYXJlYSBvZiB0aGUgdGVtcGxhdGUgaXMgc2V0IHRvIGhhdmUgYW5pbWF0aW9ucyBkaXNhYmxlZCwgXG4gKiAqKmFsbCoqIGlubmVyIGNvbXBvbmVudHMgaGF2ZSB0aGVpciBhbmltYXRpb25zIGRpc2FibGVkIGFzIHdlbGwuXG4gKiBUaGlzIG1lYW5zIHRoYXQgeW91IGNhbiBkaXNhYmxlIGFsbCBhbmltYXRpb25zIGZvciBhbiBhcHBcbiAqIGJ5IHBsYWNpbmcgYSBob3N0IGJpbmRpbmcgc2V0IG9uIGBALmRpc2FibGVkYCBvbiB0aGUgdG9wbW9zdCBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0NvbXBvbmVudCwgSG9zdEJpbmRpbmd9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcC1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCcsXG4gKiB9KVxuICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAqICAgQEhvc3RCaW5kaW5nKCdALmRpc2FibGVkJylcbiAqICAgcHVibGljIGFuaW1hdGlvbnNEaXNhYmxlZCA9IHRydWU7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgT3ZlcnJpZGluZyBkaXNhYmxlbWVudCBvZiBpbm5lciBhbmltYXRpb25zXG4gKiBEZXNwaXRlIGlubmVyIGFuaW1hdGlvbnMgYmVpbmcgZGlzYWJsZWQsIGEgcGFyZW50IGFuaW1hdGlvbiBjYW4gYHF1ZXJ5KClgXG4gKiBmb3IgaW5uZXIgZWxlbWVudHMgbG9jYXRlZCBpbiBkaXNhYmxlZCBhcmVhcyBvZiB0aGUgdGVtcGxhdGUgYW5kIHN0aWxsIGFuaW1hdGUgXG4gKiB0aGVtIGlmIG5lZWRlZC4gVGhpcyBpcyBhbHNvIHRoZSBjYXNlIGZvciB3aGVuIGEgc3ViIGFuaW1hdGlvbiBpcyBcbiAqIHF1ZXJpZWQgYnkgYSBwYXJlbnQgYW5kIHRoZW4gbGF0ZXIgYW5pbWF0ZWQgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC5cbiAqXG4gKiAjIyMgRGV0ZWN0aW5nIHdoZW4gYW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXG4gKiBJZiBhIHJlZ2lvbiBvZiB0aGUgRE9NIChvciB0aGUgZW50aXJlIGFwcGxpY2F0aW9uKSBoYXMgaXRzIGFuaW1hdGlvbnMgZGlzYWJsZWQsIHRoZSBhbmltYXRpb25cbiAqIHRyaWdnZXIgY2FsbGJhY2tzIHN0aWxsIGZpcmUsIGJ1dCBmb3IgemVybyBzZWNvbmRzLiBXaGVuIHRoZSBjYWxsYmFjayBmaXJlcywgaXQgcHJvdmlkZXNcbiAqIGFuIGluc3RhbmNlIG9mIGFuIGBBbmltYXRpb25FdmVudGAuIElmIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLFxuICogdGhlIGAuZGlzYWJsZWRgIGZsYWcgb24gdGhlIGV2ZW50IGlzIHRydWUuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyKG5hbWU6IHN0cmluZywgZGVmaW5pdGlvbnM6IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyLCBuYW1lLCBkZWZpbml0aW9ucywgb3B0aW9uczoge319O1xufVxuXG4vKipcbiAqIERlZmluZXMgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCBjb21iaW5lcyBzdHlsaW5nIGluZm9ybWF0aW9uIHdpdGggdGltaW5nIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSB0aW1pbmdzIFNldHMgYEFuaW1hdGVUaW1pbmdzYCBmb3IgdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBBIHN0cmluZyBpbiB0aGUgZm9ybWF0IFwiZHVyYXRpb24gW2RlbGF5XSBbZWFzaW5nXVwiLlxuICogIC0gRHVyYXRpb24gYW5kIGRlbGF5IGFyZSBleHByZXNzZWQgYXMgYSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdCxcbiAqIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5cbiAqIFRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICogIC0gVGhlIGVhc2luZyB2YWx1ZSBjb250cm9scyBob3cgdGhlIGFuaW1hdGlvbiBhY2NlbGVyYXRlcyBhbmQgZGVjZWxlcmF0ZXNcbiAqIGR1cmluZyBpdHMgcnVudGltZS4gVmFsdWUgaXMgb25lIG9mICBgZWFzZWAsIGBlYXNlLWluYCwgYGVhc2Utb3V0YCxcbiAqIGBlYXNlLWluLW91dGAsIG9yIGEgYGN1YmljLWJlemllcigpYCBmdW5jdGlvbiBjYWxsLlxuICogSWYgbm90IHN1cHBsaWVkLCBubyBlYXNpbmcgaXMgYXBwbGllZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhlIHN0cmluZyBcIjFzIDEwMG1zIGVhc2Utb3V0XCIgc3BlY2lmaWVzIGEgZHVyYXRpb24gb2ZcbiAqIDEwMDAgbWlsbGlzZWNvbmRzLCBhbmQgZGVsYXkgb2YgMTAwIG1zLCBhbmQgdGhlIFwiZWFzZS1vdXRcIiBlYXNpbmcgc3R5bGUsXG4gKiB3aGljaCBkZWNlbGVyYXRlcyBuZWFyIHRoZSBlbmQgb2YgdGhlIGR1cmF0aW9uLlxuICogQHBhcmFtIHN0eWxlcyBTZXRzIEFuaW1hdGlvblN0eWxlcyBmb3IgdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBBIGZ1bmN0aW9uIGNhbGwgdG8gZWl0aGVyIGBzdHlsZSgpYCBvciBga2V5ZnJhbWVzKClgXG4gKiB0aGF0IHJldHVybnMgYSBjb2xsZWN0aW9uIG9mIENTUyBzdHlsZSBlbnRyaWVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBXaGVuIG51bGwsIHVzZXMgdGhlIHN0eWxlcyBmcm9tIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZS5cbiAqIFRoaXMgaXMgdXNlZnVsIHdoZW4gZGVzY3JpYmluZyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IHdpbGwgY29tcGxldGUgYW4gYW5pbWF0aW9uO1xuICogc2VlIFwiQW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZVwiIGluIGB0cmFuc2l0aW9ucygpYC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgYW5pbWF0aW9uIHN0ZXAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIENhbGwgd2l0aGluIGFuIGFuaW1hdGlvbiBgc2VxdWVuY2UoKWAsIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWAsIG9yXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsIHRvIHNwZWNpZnkgYW4gYW5pbWF0aW9uIHN0ZXBcbiAqIHRoYXQgYXBwbGllcyBnaXZlbiBzdHlsZSBkYXRhIHRvIHRoZSBwYXJlbnQgYW5pbWF0aW9uIGZvciBhIGdpdmVuIGFtb3VudCBvZiB0aW1lLlxuICpcbiAqICMjIyBTeW50YXggRXhhbXBsZXNcbiAqICoqVGltaW5nIGV4YW1wbGVzKipcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGVzIHNob3cgdmFyaW91cyBgdGltaW5nc2Agc3BlY2lmaWNhdGlvbnMuXG4gKiAtIGBhbmltYXRlKDUwMClgIDogRHVyYXRpb24gaXMgNTAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCIxc1wiKWAgOiBEdXJhdGlvbiBpcyAxMDAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCIxMDBtcyAwLjVzXCIpYCA6IER1cmF0aW9uIGlzIDEwMCBtaWxsaXNlY29uZHMsIGRlbGF5IGlzIDUwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiNXMgZWFzZS1pblwiKWAgOiBEdXJhdGlvbiBpcyA1MDAwIG1pbGxpc2Vjb25kcywgZWFzaW5nIGluLlxuICogLSBgYW5pbWF0ZShcIjVzIDEwbXMgY3ViaWMtYmV6aWVyKC4xNywuNjcsLjg4LC4xKVwiKWAgOiBEdXJhdGlvbiBpcyA1MDAwIG1pbGxpc2Vjb25kcywgZGVsYXkgaXMgMTBcbiAqIG1pbGxpc2Vjb25kcywgZWFzaW5nIGFjY29yZGluZyB0byBhIGJlemllciBjdXJ2ZS5cbiAqXG4gKiAqKlN0eWxlIGV4YW1wbGVzKipcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY2FsbHMgYHN0eWxlKClgIHRvIHNldCBhIHNpbmdsZSBDU1Mgc3R5bGUuXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKDUwMCwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiIH0pKVxuICogYGBgXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY2FsbHMgYGtleWZyYW1lcygpYCB0byBzZXQgYSBDU1Mgc3R5bGVcbiAqIHRvIGRpZmZlcmVudCB2YWx1ZXMgZm9yIHN1Y2Nlc3NpdmUga2V5ZnJhbWVzLlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZSg1MDAsIGtleWZyYW1lcyhcbiAqICBbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJibHVlXCIgfSkpLFxuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiAgXSlcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZShcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB8IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgfFxuICAgICAgICBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGUsIHN0eWxlcywgdGltaW5nc307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERlZmluZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0byBiZSBydW4gaW4gcGFyYWxsZWwuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gKiAtIFdoZW4gc3RlcHMgYXJlIGRlZmluZWQgYnkgYHN0eWxlKClgIG9yIGBhbmltYXRlKClgXG4gKiBmdW5jdGlvbiBjYWxscywgZWFjaCBjYWxsIHdpdGhpbiB0aGUgZ3JvdXAgaXMgZXhlY3V0ZWQgaW5zdGFudGx5LlxuICogLSBUbyBzcGVjaWZ5IG9mZnNldCBzdHlsZXMgdG8gYmUgYXBwbGllZCBhdCBhIGxhdGVyIHRpbWUsIGRlZmluZSBzdGVwcyB3aXRoXG4gKiBga2V5ZnJhbWVzKClgLCBvciB1c2UgYGFuaW1hdGUoKWAgY2FsbHMgd2l0aCBhIGRlbGF5IHZhbHVlLlxuICogRm9yIGV4YW1wbGU6XG4gKiBcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGdyb3VwKFtcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgYmFja2dyb3VuZDogXCJibGFja1wiIH0pKVxuICogICBhbmltYXRlKFwiMnNcIiwgeyBjb2xvcjogXCJ3aGl0ZVwiIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBncm91cCBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBHcm91cGVkIGFuaW1hdGlvbnMgYXJlIHVzZWZ1bCB3aGVuIGEgc2VyaWVzIG9mIHN0eWxlcyBtdXN0IGJlIFxuICogYW5pbWF0ZWQgYXQgZGlmZmVyZW50IHN0YXJ0aW5nIHRpbWVzIGFuZCBjbG9zZWQgb2ZmIGF0IGRpZmZlcmVudCBlbmRpbmcgdGltZXMuXG4gKlxuICogV2hlbiBjYWxsZWQgd2l0aGluIGEgYHNlcXVlbmNlKClgIG9yIGFcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwsIGRvZXMgbm90IGNvbnRpbnVlIHRvIHRoZSBuZXh0XG4gKiBpbnN0cnVjdGlvbiB1bnRpbCBhbGwgb2YgdGhlIGlubmVyIGFuaW1hdGlvbiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25Hcm91cE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXAsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdG8gYmUgcnVuIHNlcXVlbnRpYWxseSwgb25lIGJ5IG9uZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgc3R5bGUoKWAgY2FsbHMgYXBwbHkgdGhlIHN0eWxpbmcgZGF0YSBpbW1lZGlhdGVseS5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgYW5pbWF0ZSgpYCBjYWxscyBhcHBseSB0aGUgc3R5bGluZyBkYXRhIG92ZXIgdGltZVxuICogICBhcyBzcGVjaWZpZWQgYnkgdGhlIHRpbWluZyBkYXRhLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgb3BhY2l0eTogMSB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgc2VxdWVuY2UgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogV2hlbiB5b3UgcGFzcyBhbiBhcnJheSBvZiBzdGVwcyB0byBhXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsLCB0aGUgc3RlcHMgcnVuIHNlcXVlbnRpYWxseSBieSBkZWZhdWx0LlxuICogQ29tcGFyZSB0aGlzIHRvIHRoZSBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gIGNhbGwsIHdoaWNoIHJ1bnMgYW5pbWF0aW9uIHN0ZXBzIGluIHBhcmFsbGVsLlxuICpcbiAqIFdoZW4gYSBzZXF1ZW5jZSBpcyB1c2VkIHdpdGhpbiBhIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWAgb3IgYSBgdHJhbnNpdGlvbigpYCBjYWxsLFxuICogZXhlY3V0aW9uIGNvbnRpbnVlcyB0byB0aGUgbmV4dCBpbnN0cnVjdGlvbiBvbmx5IGFmdGVyIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvblxuICogc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlKHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZSwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGEga2V5L3ZhbHVlIG9iamVjdCBjb250YWluaW5nIENTUyBwcm9wZXJ0aWVzL3N0eWxlcyB0aGF0XG4gKiBjYW4gdGhlbiBiZSB1c2VkIGZvciBhbiBhbmltYXRpb24gYHN0YXRlYCwgd2l0aGluIGFuIGFuaW1hdGlvbiBgc2VxdWVuY2VgLFxuICogb3IgYXMgc3R5bGluZyBkYXRhIGZvciBjYWxscyB0byBgYW5pbWF0ZSgpYCBhbmQgYGtleWZyYW1lcygpYC5cbiAqXG4gKiBAcGFyYW0gdG9rZW5zIEEgc2V0IG9mIENTUyBzdHlsZXMgb3IgSFRNTCBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIGFuIGFuaW1hdGlvbiBzdGF0ZS5cbiAqIFRoZSB2YWx1ZSBjYW4gYmUgYW55IG9mIHRoZSBmb2xsb3dpbmc6XG4gKiAtIEEga2V5LXZhbHVlIHN0eWxlIHBhaXIgYXNzb2NpYXRpbmcgYSBDU1MgcHJvcGVydHkgd2l0aCBhIHZhbHVlLlxuICogLSBBbiBhcnJheSBvZiBrZXktdmFsdWUgc3R5bGUgcGFpcnMuXG4gKiAtIEFuIGFzdGVyaXNrICgqKSwgdG8gdXNlIGF1dG8tc3R5bGluZywgd2hlcmUgc3R5bGVzIGFyZSBkZXJpdmVkIGZyb20gdGhlIGVsZW1lbnRcbiAqIGJlaW5nIGFuaW1hdGVkIGFuZCBhcHBsaWVkIHRvIHRoZSBhbmltYXRpb24gd2hlbiBpdCBzdGFydHMuXG4gKlxuICogQXV0by1zdHlsaW5nIGNhbiBiZSB1c2VkIHRvIGRlZmluZSBhIHN0YXRlIHRoYXQgZGVwZW5kcyBvbiBsYXlvdXQgb3Igb3RoZXIgXG4gKiBlbnZpcm9ubWVudGFsIGZhY3RvcnMuXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHN0eWxlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgY3JlYXRlIGFuaW1hdGlvbiBzdHlsZXMgdGhhdCBjb2xsZWN0IGEgc2V0IG9mXG4gKiBDU1MgcHJvcGVydHkgdmFsdWVzOlxuICogXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBzdHJpbmcgdmFsdWVzIGZvciBDU1MgcHJvcGVydGllc1xuICogc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiLCBjb2xvcjogXCJibHVlXCIgfSlcbiAqXG4gKiAvLyBudW1lcmljYWwgcGl4ZWwgdmFsdWVzXG4gKiBzdHlsZSh7IHdpZHRoOiAxMDAsIGhlaWdodDogMCB9KVxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHVzZXMgYXV0by1zdHlsaW5nIHRvIGFsbG93IGEgY29tcG9uZW50IHRvIGFuaW1hdGUgZnJvbVxuICogYSBoZWlnaHQgb2YgMCB1cCB0byB0aGUgaGVpZ2h0IG9mIHRoZSBwYXJlbnQgZWxlbWVudDpcbiAqXG4gKiBgYGBcbiAqIHN0eWxlKHsgaGVpZ2h0OiAwIH0pLFxuICogYW5pbWF0ZShcIjFzXCIsIHN0eWxlKHsgaGVpZ2h0OiBcIipcIiB9KSlcbiAqIGBgYFxuICpcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZShcbiAgICB0b2tlbnM6ICcqJyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9IHxcbiAgICBBcnJheTwnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0+KTogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlLCBzdHlsZXM6IHRva2Vucywgb2Zmc2V0OiBudWxsfTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhbiBhbmltYXRpb24gc3RhdGUgd2l0aGluIGEgdHJpZ2dlciBhdHRhY2hlZCB0byBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSBuYW1lIE9uZSBvciBtb3JlIG5hbWVzIGZvciB0aGUgZGVmaW5lZCBzdGF0ZSBpbiBhIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmcuXG4gKiBUaGUgZm9sbG93aW5nIHJlc2VydmVkIHN0YXRlIG5hbWVzIGNhbiBiZSBzdXBwbGllZCB0byBkZWZpbmUgYSBzdHlsZSBmb3Igc3BlY2lmaWMgdXNlXG4gKiBjYXNlczpcbiAqXG4gKiAtIGB2b2lkYCBZb3UgY2FuIGFzc29jaWF0ZSBzdHlsZXMgd2l0aCB0aGlzIG5hbWUgdG8gYmUgdXNlZCB3aGVuXG4gKiB0aGUgZWxlbWVudCBpcyBkZXRhY2hlZCBmcm9tIHRoZSBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIHdoZW4gYW4gYG5nSWZgIGV2YWx1YXRlc1xuICogdG8gZmFsc2UsIHRoZSBzdGF0ZSBvZiB0aGUgYXNzb2NpYXRlZCBlbGVtZW50IGlzIHZvaWQuXG4gKiAgLSBgKmAgKGFzdGVyaXNrKSBJbmRpY2F0ZXMgdGhlIGRlZmF1bHQgc3RhdGUuIFlvdSBjYW4gYXNzb2NpYXRlIHN0eWxlcyB3aXRoIHRoaXMgbmFtZVxuICogdG8gYmUgdXNlZCBhcyB0aGUgZmFsbGJhY2sgd2hlbiB0aGUgc3RhdGUgdGhhdCBpcyBiZWluZyBhbmltYXRlZCBpcyBub3QgZGVjbGFyZWRcbiAqIHdpdGhpbiB0aGUgdHJpZ2dlci5cbiAqXG4gKiBAcGFyYW0gc3R5bGVzIEEgc2V0IG9mIENTUyBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc3RhdGUsIGNyZWF0ZWQgdXNpbmcgdGhlXG4gKiBgc3R5bGUoKWAgZnVuY3Rpb24uXG4gKiBUaGlzIHNldCBvZiBzdHlsZXMgcGVyc2lzdHMgb24gdGhlIGVsZW1lbnQgb25jZSB0aGUgc3RhdGUgaGFzIGJlZW4gcmVhY2hlZC5cbiAqIEBwYXJhbSBvcHRpb25zIFBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBzdGF0ZSB3aGVuIGl0IGlzIGludm9rZWQuXG4gKiAwIG9yIG1vcmUga2V5LXZhbHVlIHBhaXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIG5ldyBzdGF0ZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBVc2UgdGhlIGB0cmlnZ2VyKClgIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHN0YXRlcyB0byBhbiBhbmltYXRpb24gdHJpZ2dlci5cbiAqIFVzZSB0aGUgYHRyYW5zaXRpb24oKWAgZnVuY3Rpb24gdG8gYW5pbWF0ZSBiZXR3ZWVuIHN0YXRlcy5cbiAqIFdoZW4gYSBzdGF0ZSBpcyBhY3RpdmUgd2l0aGluIGEgY29tcG9uZW50LCBpdHMgYXNzb2NpYXRlZCBzdHlsZXMgcGVyc2lzdCBvbiB0aGUgZWxlbWVudCxcbiAqIGV2ZW4gd2hlbiB0aGUgYW5pbWF0aW9uIGVuZHMuXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGUoXG4gICAgbmFtZTogc3RyaW5nLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsXG4gICAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX0pOiBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGUsIG5hbWUsIHN0eWxlcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHNldCBvZiBhbmltYXRpb24gc3R5bGVzLCBhc3NvY2lhdGluZyBlYWNoIHN0eWxlIHdpdGggYW4gb3B0aW9uYWwgYG9mZnNldGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEEgc2V0IG9mIGFuaW1hdGlvbiBzdHlsZXMgd2l0aCBvcHRpb25hbCBvZmZzZXQgZGF0YS5cbiAqIFRoZSBvcHRpb25hbCBgb2Zmc2V0YCB2YWx1ZSBmb3IgYSBzdHlsZSBzcGVjaWZpZXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRpb25cbiAqIHRpbWUgYXQgd2hpY2ggdGhhdCBzdHlsZSBpcyBhcHBsaWVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBrZXlmcmFtZXMgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVXNlIHdpdGggdGhlIGBhbmltYXRlKClgIGNhbGwuIEluc3RlYWQgb2YgYXBwbHlpbmcgYW5pbWF0aW9uc1xuICogZnJvbSB0aGUgY3VycmVudCBzdGF0ZVxuICogdG8gdGhlIGRlc3RpbmF0aW9uIHN0YXRlLCBrZXlmcmFtZXMgZGVzY3JpYmUgaG93IGVhY2ggc3R5bGUgZW50cnkgaXMgYXBwbGllZCBhbmQgYXQgd2hhdCBwb2ludFxuICogd2l0aGluIHRoZSBhbmltYXRpb24gYXJjLlxuICogQ29tcGFyZSBbQ1NTIEtleWZyYW1lIEFuaW1hdGlvbnNdKGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vY3NzL2NzczNfYW5pbWF0aW9ucy5hc3ApLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIG9mZnNldCB2YWx1ZXMgZGVzY3JpYmVcbiAqIHdoZW4gZWFjaCBgYmFja2dyb3VuZENvbG9yYCB2YWx1ZSBpcyBhcHBsaWVkLiBUaGUgY29sb3IgaXMgcmVkIGF0IHRoZSBzdGFydCwgYW5kIGNoYW5nZXMgdG9cbiAqIGJsdWUgd2hlbiAyMCUgb2YgdGhlIHRvdGFsIHRpbWUgaGFzIGVsYXBzZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHByb3ZpZGVkIG9mZnNldCB2YWx1ZXNcbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiwgb2Zmc2V0OiAwIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIsIG9mZnNldDogMC4yIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiwgb2Zmc2V0OiAwLjMgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIsIG9mZnNldDogMSB9KVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBJZiB0aGVyZSBhcmUgbm8gYG9mZnNldGAgdmFsdWVzIHNwZWNpZmllZCBpbiB0aGUgc3R5bGUgZW50cmllcywgdGhlIG9mZnNldHNcbiAqIGFyZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiIH0pIC8vIG9mZnNldCA9IDBcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiIH0pIC8vIG9mZnNldCA9IDAuMzNcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIgfSkgLy8gb2Zmc2V0ID0gMC42NlxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiIH0pIC8vIG9mZnNldCA9IDFcbiAqIF0pKVxuICpgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleWZyYW1lcyhzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdKTogQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcywgc3RlcHN9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uIGFzIGEgc2VxdWVuY2Ugb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIHJ1biB3aGVuIGEgZ2l2ZW5cbiAqIGNvbmRpdGlvbiBpcyBzYXRpc2ZpZWQuIFRoZSBjb25kaXRpb24gaXMgYSBCb29sZWFuIGV4cHJlc3Npb24gb3IgZnVuY3Rpb24gdGhhdCBjb21wYXJlc1xuICogdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IGFuaW1hdGlvbiBzdGF0ZXMsIGFuZCByZXR1cm5zIHRydWUgaWYgdGhpcyB0cmFuc2l0aW9uIHNob3VsZCBvY2N1ci5cbiAqIFdoZW4gdGhlIHN0YXRlIGNyaXRlcmlhIG9mIGEgZGVmaW5lZCB0cmFuc2l0aW9uIGFyZSBtZXQsIHRoZSBhc3NvY2lhdGVkIGFuaW1hdGlvbiBpc1xuICogdHJpZ2dlcmVkLlxuICpcbiAqIEBwYXJhbSBzdGF0ZUNoYW5nZUV4cHIgQSBCb29sZWFuIGV4cHJlc3Npb24gb3IgZnVuY3Rpb24gdGhhdCBjb21wYXJlcyB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnRcbiAqIGFuaW1hdGlvbiBzdGF0ZXMsIGFuZCByZXR1cm5zIHRydWUgaWYgdGhpcyB0cmFuc2l0aW9uIHNob3VsZCBvY2N1ci4gTm90ZSB0aGF0ICBcInRydWVcIiBhbmQgXCJmYWxzZVwiXG4gKiBtYXRjaCAxIGFuZCAwLCByZXNwZWN0aXZlbHkuIEFuIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkIGVhY2ggdGltZSBhIHN0YXRlIGNoYW5nZSBvY2N1cnMgaW4gdGhlXG4gKiBhbmltYXRpb24gdHJpZ2dlciBlbGVtZW50LlxuICogVGhlIGFuaW1hdGlvbiBzdGVwcyBydW4gd2hlbiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdHJ1ZS5cbiAqXG4gKiAtIEEgc3RhdGUtY2hhbmdlIHN0cmluZyB0YWtlcyB0aGUgZm9ybSBcInN0YXRlMSA9PiBzdGF0ZTJcIiwgd2hlcmUgZWFjaCBzaWRlIGlzIGEgZGVmaW5lZCBhbmltYXRpb25cbiAqIHN0YXRlLCBvciBhbiBhc3Rlcml4ICgqKSB0byByZWZlciB0byBhIGR5bmFtaWMgc3RhcnQgb3IgZW5kIHN0YXRlLlxuICogICAtIFRoZSBleHByZXNzaW9uIHN0cmluZyBjYW4gY29udGFpbiBtdWx0aXBsZSBjb21tYS1zZXBhcmF0ZWQgc3RhdGVtZW50cztcbiAqIGZvciBleGFtcGxlIFwic3RhdGUxID0+IHN0YXRlMiwgc3RhdGUzID0+IHN0YXRlNFwiLlxuICogICAtIFNwZWNpYWwgdmFsdWVzIGA6ZW50ZXJgIGFuZCBgOmxlYXZlYCBpbml0aWF0ZSBhIHRyYW5zaXRpb24gb24gdGhlIGVudHJ5IGFuZCBleGl0IHN0YXRlcyxcbiAqIGVxdWl2YWxlbnQgdG8gIFwidm9pZCA9PiAqXCIgIGFuZCBcIiogPT4gdm9pZFwiLlxuICogICAtIFNwZWNpYWwgdmFsdWVzIGA6aW5jcmVtZW50YCBhbmQgYDpkZWNyZW1lbnRgIGluaXRpYXRlIGEgdHJhbnNpdGlvbiB3aGVuIGEgbnVtZXJpYyB2YWx1ZSBoYXNcbiAqIGluY3JlYXNlZCBvciBkZWNyZWFzZWQgaW4gdmFsdWUuXG4gKiAtIEEgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3VycyBpbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZWxlbWVudC5cbiAqIFRoZSBhbmltYXRpb24gc3RlcHMgcnVuIHdoZW4gdGhlIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMsIGFzIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZSgpYCBvclxuICogYHNlcXVlbmNlKClgIGZ1bmN0aW9uLCB0aGF0IGZvcm0gYSB0cmFuc2Zvcm1hdGlvbiBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICogQSBzZXF1ZW5jZSBpcyB1c2VkIGJ5IGRlZmF1bHQgd2hlbiB5b3UgcGFzcyBhbiBhcnJheS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBhbmltYXRpb24sXG4gKiBhbmQgYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLiBQcm92aWRlZCB2YWx1ZXMgZm9yIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBhcmUgdXNlZFxuICogYXMgZGVmYXVsdHMsIGFuZCBvdmVycmlkZSB2YWx1ZXMgY2FuIGJlIHBhc3NlZCB0byB0aGUgY2FsbGVyIG9uIGludm9jYXRpb24uXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHRyYW5zaXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCBhIGNvbXBvbmVudCBiaW5kcyBhbiBhbmltYXRpb24gdHJpZ2dlciB0byBhbiBlbGVtZW50LlxuICpcbiAqIGBgYEhUTUxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBBbGwgdHJhbnNpdGlvbnMgYXJlIGRlZmluZWQgd2l0aGluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLFxuICogYWxvbmcgd2l0aCBuYW1lZCBzdGF0ZXMgdGhhdCB0aGUgdHJhbnNpdGlvbnMgY2hhbmdlIHRvIGFuZCBmcm9tLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogIC8vIGRlZmluZSBzdGF0ZXNcbiAqICBzdGF0ZShcIm9uXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmVlblwiIH0pKSxcbiAqICBzdGF0ZShcIm9mZlwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JleVwiIH0pKSxcbiAqICAuLi5dXG4gKiBgYGBcbiAqXG4gKiBOb3RlIHRoYXQgd2hlbiB5b3UgY2FsbCB0aGUgYHNlcXVlbmNlKClgIGZ1bmN0aW9uIHdpdGhpbiBhIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWBcbiAqIG9yIGEgYHRyYW5zaXRpb24oKWAgY2FsbCwgZXhlY3V0aW9uIGRvZXMgbm90IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uXG4gKiB1bnRpbCBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb24gc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICogIyMjIFN5bnRheCBleGFtcGxlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgZGVmaW5lIHRyYW5zaXRpb25zIGJldHdlZW4gdGhlIHR3byBkZWZpbmVkIHN0YXRlcyAoYW5kIGRlZmF1bHQgc3RhdGVzKSxcbiAqIHVzaW5nIHZhcmlvdXMgb3B0aW9uczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBUcmFuc2l0aW9uIG9jY3VycyB3aGVuIHRoZSBzdGF0ZSB2YWx1ZVxuICogLy8gYm91bmQgdG8gXCJteUFuaW1hdGlvblRyaWdnZXJcIiBjaGFuZ2VzIGZyb20gXCJvblwiIHRvIFwib2ZmXCJcbiAqIHRyYW5zaXRpb24oXCJvbiA9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKVxuICogLy8gUnVuIHRoZSBzYW1lIGFuaW1hdGlvbiBmb3IgYm90aCBkaXJlY3Rpb25zXG4gKiB0cmFuc2l0aW9uKFwib24gPD0+IG9mZlwiLCBhbmltYXRlKDUwMCkpXG4gKiAvLyBEZWZpbmUgbXVsdGlwbGUgc3RhdGUtY2hhbmdlIHBhaXJzIHNlcGFyYXRlZCBieSBjb21tYXNcbiAqIHRyYW5zaXRpb24oXCJvbiA9PiBvZmYsIG9mZiA9PiB2b2lkXCIsIGFuaW1hdGUoNTAwKSlcbiAqIGBgYFxuICpcbiAqICMjIyBTcGVjaWFsIHZhbHVlcyBmb3Igc3RhdGUtY2hhbmdlIGV4cHJlc3Npb25zXG4gKlxuICogLSBDYXRjaC1hbGwgc3RhdGUgY2hhbmdlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgcGFnZSBhbmQgdGhlXG4gKiBkZXN0aW5hdGlvbiBzdGF0ZSBpcyB1bmtub3duOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICBhbmltYXRlKDUwMClcbiAqICBdKVxuICogYGBgXG4gKlxuICogLSBDYXB0dXJlIGEgc3RhdGUgY2hhbmdlIGJldHdlZW4gYW55IHN0YXRlczpcbiAqXG4gKiAgYHRyYW5zaXRpb24oXCIqID0+ICpcIiwgYW5pbWF0ZShcIjFzIDBzXCIpKWBcbiAqXG4gKiAtIEVudHJ5IGFuZCBleGl0IHRyYW5zaXRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCI6ZW50ZXJcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgIF0pLFxuICogdHJhbnNpdGlvbihcIjpsZWF2ZVwiLCBbXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiAgIF0pXG4gKiBgYGBcbiAqXG4gKiAtIFVzZSBgOmluY3JlbWVudGAgYW5kIGA6ZGVjcmVtZW50YCB0byBpbml0aWF0ZSB0cmFuc2l0aW9uczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKFwiOmluY3JlbWVudFwiLCBncm91cChbXG4gKiAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgXSksXG4gKiAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pKVxuICogIF0pXG4gKiBdKSlcbiAqXG4gKiB0cmFuc2l0aW9uKFwiOmRlY3JlbWVudFwiLCBncm91cChbXG4gKiAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgXSksXG4gKiAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pKVxuICogIF0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqICMjIyBTdGF0ZS1jaGFuZ2UgZnVuY3Rpb25zXG4gKlxuICogSGVyZSBpcyBhbiBleGFtcGxlIG9mIGEgYGZyb21TdGF0ZWAgc3BlY2lmaWVkIGFzIGEgc3RhdGUtY2hhbmdlIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhblxuICogYW5pbWF0aW9uIHdoZW4gdHJ1ZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKChmcm9tU3RhdGUsIHRvU3RhdGUpID0+XG4gKiAge1xuICogICByZXR1cm4gZnJvbVN0YXRlID09IFwib2ZmXCIgJiYgdG9TdGF0ZSA9PSBcIm9uXCI7XG4gKiAgfSxcbiAqICBhbmltYXRlKFwiMXMgMHNcIikpXG4gKiBgYGBcbiAqXG4gKiAjIyMgQW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZVxuICpcbiAqIElmIHRoZSBmaW5hbCBzdGVwIGluIGEgdHJhbnNpdGlvbiBpcyBhIGNhbGwgdG8gYGFuaW1hdGUoKWAgdGhhdCB1c2VzIGEgdGltaW5nIHZhbHVlXG4gKiB3aXRoIG5vIHN0eWxlIGRhdGEsIHRoYXQgc3RlcCBpcyBhdXRvbWF0aWNhbGx5IGNvbnNpZGVyZWQgdGhlIGZpbmFsIGFuaW1hdGlvbiBhcmMsXG4gKiBmb3IgdGhlIGVsZW1lbnQgdG8gcmVhY2ggdGhlIGZpbmFsIHN0YXRlLiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgYWRkcyBvciByZW1vdmVzXG4gKiBDU1Mgc3R5bGVzIHRvIGVuc3VyZSB0aGF0IHRoZSBlbGVtZW50IGlzIGluIHRoZSBjb3JyZWN0IGZpbmFsIHN0YXRlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWZpbmVzIGEgdHJhbnNpdGlvbiB0aGF0IHN0YXJ0cyBieSBoaWRpbmcgdGhlIGVsZW1lbnQsXG4gKiB0aGVuIG1ha2VzIHN1cmUgdGhhdCBpdCBhbmltYXRlcyBwcm9wZXJseSB0byB3aGF0ZXZlciBzdGF0ZSBpcyBjdXJyZW50bHkgYWN0aXZlIGZvciB0cmlnZ2VyOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwKVxuICogIF0pXG4gKiBgYGBcbiAqICMjIyBCb29sZWFuIHZhbHVlIG1hdGNoaW5nXG4gKiBJZiBhIHRyaWdnZXIgYmluZGluZyB2YWx1ZSBpcyBhIEJvb2xlYW4sIGl0IGNhbiBiZSBtYXRjaGVkIHVzaW5nIGEgdHJhbnNpdGlvbiBleHByZXNzaW9uXG4gKiB0aGF0IGNvbXBhcmVzIHRydWUgYW5kIGZhbHNlIG9yIDEgYW5kIDAuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYFxuICogLy8gaW4gdGhlIHRlbXBsYXRlXG4gKiA8ZGl2IFtAb3BlbkNsb3NlXT1cIm9wZW4gPyB0cnVlIDogZmFsc2VcIj4uLi48L2Rpdj5cbiAqIC8vIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAqIHRyaWdnZXIoJ29wZW5DbG9zZScsIFtcbiAqICAgc3RhdGUoJ3RydWUnLCBzdHlsZSh7IGhlaWdodDogJyonIH0pKSxcbiAqICAgc3RhdGUoJ2ZhbHNlJywgc3R5bGUoeyBoZWlnaHQ6ICcwcHgnIH0pKSxcbiAqICAgdHJhbnNpdGlvbignZmFsc2UgPD0+IHRydWUnLCBhbmltYXRlKDUwMCkpXG4gKiBdKVxuICogYGBgXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNpdGlvbihcbiAgICBzdGF0ZUNoYW5nZUV4cHI6IHN0cmluZyB8ICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pLFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbiwgZXhwcjogc3RhdGVDaGFuZ2VFeHByLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBQcm9kdWNlcyBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGNhbiBiZSBpbnZva2VkIGluIGFub3RoZXIgYW5pbWF0aW9uIG9yIHNlcXVlbmNlLFxuICogYnkgY2FsbGluZyB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMsIGFzIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZSgpYFxuICogb3IgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLCB0aGF0IGZvcm0gYSB0cmFuc2Zvcm1hdGlvbiBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICogQSBzZXF1ZW5jZSBpcyB1c2VkIGJ5IGRlZmF1bHQgd2hlbiB5b3UgcGFzcyBhbiBhcnJheS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZVxuICogYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogUHJvdmlkZWQgdmFsdWVzIGZvciBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHVzZWQgYXMgZGVmYXVsdHMsXG4gKiBhbmQgb3ZlcnJpZGUgdmFsdWVzIGNhbiBiZSBwYXNzZWQgdG8gdGhlIGNhbGxlciBvbiBpbnZvY2F0aW9uLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSByZXVzYWJsZSBhbmltYXRpb24sIHByb3ZpZGluZyBzb21lIGRlZmF1bHQgcGFyYW1ldGVyXG4gKiB2YWx1ZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIGZhZGVBbmltYXRpb24gPSBhbmltYXRpb24oW1xuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBzdGFydCB9fScgfSksXG4gKiAgIGFuaW1hdGUoJ3t7IHRpbWUgfX0nLFxuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBlbmQgfX0nfSkpXG4gKiAgIF0sXG4gKiAgIHsgcGFyYW1zOiB7IHRpbWU6ICcxMDAwbXMnLCBzdGFydDogMCwgZW5kOiAxIH19KTtcbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbnZva2VzIHRoZSBkZWZpbmVkIGFuaW1hdGlvbiB3aXRoIGEgY2FsbCB0byBgdXNlQW5pbWF0aW9uKClgLFxuICogcGFzc2luZyBpbiBvdmVycmlkZSBwYXJhbWV0ZXIgdmFsdWVzLlxuICpcbiAqIGBgYGpzXG4gKiB1c2VBbmltYXRpb24oZmFkZUFuaW1hdGlvbiwge1xuICogICBwYXJhbXM6IHtcbiAqICAgICB0aW1lOiAnMnMnLFxuICogICAgIHN0YXJ0OiAxLFxuICogICAgIGVuZDogMFxuICogICB9XG4gKiB9KVxuICogYGBgXG4gKlxuICogSWYgYW55IG9mIHRoZSBwYXNzZWQtaW4gcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBmcm9tIHRoaXMgY2FsbCxcbiAqIHRoZSBkZWZhdWx0IHZhbHVlcyBhcmUgdXNlZC4gSWYgb25lIG9yIG1vcmUgcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBiZWZvcmUgYSBzdGVwIGlzXG4gKiBhbmltYXRlZCwgYHVzZUFuaW1hdGlvbigpYCB0aHJvd3MgYW4gZXJyb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRpb24oXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZSwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBxdWVyaWVkIGlubmVyIGFuaW1hdGlvbiBlbGVtZW50IHdpdGhpbiBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlXG4gKiBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIG92ZXJyaWRlIHZhbHVlcyBmb3IgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBjaGlsZCBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgaW4gQW5ndWxhciwgdGhlIHBhcmVudCBhbmltYXRpb25cbiAqIGhhcyBwcmlvcml0eSBhbmQgYW55IGNoaWxkIGFuaW1hdGlvbnMgYXJlIGJsb2NrZWQuIEluIG9yZGVyXG4gKiBmb3IgYSBjaGlsZCBhbmltYXRpb24gdG8gcnVuLCB0aGUgcGFyZW50IGFuaW1hdGlvbiBtdXN0IHF1ZXJ5IGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gKiBjb250YWluaW5nIGNoaWxkIGFuaW1hdGlvbnMsIGFuZCBydW4gdGhlbSB1c2luZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZlYXR1cmUgZGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIGBxdWVyeSgpYCBhbmQgaXQgd2lsbCBvbmx5IHdvcmtcbiAqIHdpdGggYW5pbWF0aW9ucyB0aGF0IGFyZSBhc3NpZ25lZCB1c2luZyB0aGUgQW5ndWxhciBhbmltYXRpb24gbGlicmFyeS4gQ1NTIGtleWZyYW1lc1xuICogYW5kIHRyYW5zaXRpb25zIGFyZSBub3QgaGFuZGxlZCBieSB0aGlzIEFQSS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDaGlsZChvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBTdGFydHMgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBpcyBjcmVhdGVkIHVzaW5nIHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gVGhlIHJldXNhYmxlIGFuaW1hdGlvbiB0byBzdGFydC5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIFxuICogdGhlIGFuaW1hdGlvbiwgYW5kIGFkZGl0aW9uYWwgb3ZlcnJpZGUgdmFsdWVzIGZvciBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYW5pbWF0aW9uIHBhcmFtZXRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VBbmltYXRpb24oXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEZpbmRzIG9uZSBvciBtb3JlIGlubmVyIGVsZW1lbnRzIHdpdGhpbiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgaXNcbiAqIGJlaW5nIGFuaW1hdGVkIHdpdGhpbiBhIHNlcXVlbmNlLiBVc2Ugd2l0aCBgYW5pbWF0ZUNoaWxkKClgLlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZWxlbWVudCB0byBxdWVyeSwgb3IgYSBzZXQgb2YgZWxlbWVudHMgdGhhdCBjb250YWluIEFuZ3VsYXItc3BlY2lmaWNcbiAqIGNoYXJhY3RlcmlzdGljcywgc3BlY2lmaWVkIHdpdGggb25lIG9yIG1vcmUgb2YgdGhlIGZvbGxvd2luZyB0b2tlbnMuXG4gKiAgLSBgcXVlcnkoXCI6ZW50ZXJcIilgIG9yIGBxdWVyeShcIjpsZWF2ZVwiKWAgOiBRdWVyeSBmb3IgbmV3bHkgaW5zZXJ0ZWQvcmVtb3ZlZCBlbGVtZW50cy5cbiAqICAtIGBxdWVyeShcIjphbmltYXRpbmdcIilgIDogUXVlcnkgYWxsIGN1cnJlbnRseSBhbmltYXRpbmcgZWxlbWVudHMuXG4gKiAgLSBgcXVlcnkoXCJAdHJpZ2dlck5hbWVcIilgIDogUXVlcnkgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogIC0gYHF1ZXJ5KFwiQCpcIilgIDogUXVlcnkgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlcnMuXG4gKiAgLSBgcXVlcnkoXCI6c2VsZlwiKWAgOiBJbmNsdWRlIHRoZSBjdXJyZW50IGVsZW1lbnQgaW50byB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXBzIHRvIGFwcGx5IHRvIHRoZSBxdWVyaWVkIGVsZW1lbnQgb3IgZWxlbWVudHMuXG4gKiBBbiBhcnJheSBpcyB0cmVhdGVkIGFzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiBVc2UgdGhlICdsaW1pdCcgZmllbGQgdG8gbGltaXQgdGhlIHRvdGFsIG51bWJlciBvZlxuICogaXRlbXMgdG8gY29sbGVjdC5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBxdWVyeSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUb2tlbnMgY2FuIGJlIG1lcmdlZCBpbnRvIGEgY29tYmluZWQgcXVlcnkgc2VsZWN0b3Igc3RyaW5nLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAgcXVlcnkoJzpzZWxmLCAucmVjb3JkOmVudGVyLCAucmVjb3JkOmxlYXZlLCBAc3ViVHJpZ2dlcicsIFsuLi5dKVxuICogYGBgXG4gKlxuICogVGhlIGBxdWVyeSgpYCBmdW5jdGlvbiBjb2xsZWN0cyBtdWx0aXBsZSBlbGVtZW50cyBhbmQgd29ya3MgaW50ZXJuYWxseSBieSB1c2luZ1xuICogYGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbGAuIFVzZSB0aGUgYGxpbWl0YCBmaWVsZCBvZiBhbiBvcHRpb25zIG9iamVjdCB0byBsaW1pdFxuICogdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyB0byBiZSBjb2xsZWN0ZWQuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnZGl2JywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBsaW1pdDogMSB9KVxuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCwgdGhyb3dzIGFuIGVycm9yIHdoZW4gemVybyBpdGVtcyBhcmUgZm91bmQuIFNldCB0aGVcbiAqIGBvcHRpb25hbGAgZmxhZyB0byBpZ25vcmUgdGhpcyBlcnJvci4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCcuc29tZS1lbGVtZW50LXRoYXQtbWF5LW5vdC1iZS10aGVyZScsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgb3B0aW9uYWw6IHRydWUgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHF1ZXJpZXMgZm9yIGlubmVyIGVsZW1lbnRzIGFuZCBhbmltYXRlcyB0aGVtXG4gKiBpbmRpdmlkdWFsbHkgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC4gXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaW5uZXInLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0BxdWVyeUFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIDxoMT5UaXRsZTwvaDE+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICogICAgICAgICBCbGFoIGJsYWggYmxhaFxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgIHRyaWdnZXIoJ3F1ZXJ5QW5pbWF0aW9uJywgW1xuICogICAgICB0cmFuc2l0aW9uKCcqID0+IGdvQW5pbWF0ZScsIFtcbiAqICAgICAgICAvLyBoaWRlIHRoZSBpbm5lciBlbGVtZW50c1xuICogICAgICAgIHF1ZXJ5KCdoMScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50Jywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqXG4gKiAgICAgICAgLy8gYW5pbWF0ZSB0aGUgaW5uZXIgZWxlbWVudHMgaW4sIG9uZSBieSBvbmVcbiAqICAgICAgICBxdWVyeSgnaDEnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50JywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogVXNlIHdpdGhpbiBhbiBhbmltYXRpb24gYHF1ZXJ5KClgIGNhbGwgdG8gaXNzdWUgYSB0aW1pbmcgZ2FwIGFmdGVyXG4gKiBlYWNoIHF1ZXJpZWQgaXRlbSBpcyBhbmltYXRlZC5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBBIGRlbGF5IHZhbHVlLlxuICogQHBhcmFtIGFuaW1hdGlvbiBPbmUgb3JlIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdGFnZ2VyIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYSBjb250YWluZXIgZWxlbWVudCB3cmFwcyBhIGxpc3Qgb2YgaXRlbXMgc3RhbXBlZCBvdXRcbiAqIGJ5IGFuIGBuZ0ZvcmAuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogRWFjaCB0aW1lIGl0ZW1zIGFyZSBhZGRlZCwgdGhlIG9wYWNpdHkgZmFkZS1pbiBhbmltYXRpb24gcnVucyxcbiAqIGFuZCBlYWNoIHJlbW92ZWQgaXRlbSBpcyBmYWRlZCBvdXQuXG4gKiBXaGVuIGVpdGhlciBvZiB0aGVzZSBhbmltYXRpb25zIG9jY3VyLCB0aGUgc3RhZ2dlciBlZmZlY3QgaXNcbiAqIGFwcGxpZWQgYWZ0ZXIgZWFjaCBpdGVtJ3MgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEhlcmUgaXMgdGhlIGNvbXBvbmVudCBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgc3R5bGUsIGFuaW1hdGUsIHF1ZXJ5LCBzdGFnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICB0ZW1wbGF0ZVVybDogJ2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgICAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgIH1cbiAqICB9XG4gKiBgYGBcbiAqXG4gKiBIZXJlIGlzIHRoZSBhbmltYXRpb24gdHJpZ2dlciBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZ2VyKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlcixcbiAgICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsIHRpbWluZ3MsIGFuaW1hdGlvbn07XG59XG4iXX0=