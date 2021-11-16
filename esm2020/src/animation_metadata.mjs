/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Specifies automatic styling.
 *
 * @publicApi
 */
export const AUTO_STYLE = '*';
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
 * @publicApi
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name, definitions, options: {} };
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
 *   style({ background: "blue" }),
 *   style({ background: "red" })
 *  ])
 * ```
 *
 * @publicApi
 */
export function animate(timings, styles = null) {
    return { type: 4 /* Animate */, styles, timings };
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
 *   animate("1s", style({ background: "black" })),
 *   animate("2s", style({ color: "white" }))
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
 *
 * @publicApi
 */
export function group(steps, options = null) {
    return { type: 3 /* Group */, steps, options };
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
 *   style({ opacity: 0 }),
 *   animate("1s", style({ opacity: 1 }))
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
 * Compare this to the `{@link animations/group group()}` call, which runs animation steps in
 *parallel.
 *
 * When a sequence is used within a `{@link animations/group group()}` or a `transition()` call,
 * execution continues to the next instruction only after each of the inner animation
 * steps have completed.
 *
 * @publicApi
 **/
export function sequence(steps, options = null) {
    return { type: 2 /* Sequence */, steps, options };
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
 * The following example uses auto-styling to allow an element to animate from
 * a height of 0 up to its full height:
 *
 * ```
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * @publicApi
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
 *
 * @publicApi
 **/
export function state(name, styles, options) {
    return { type: 0 /* State */, name, styles, options };
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

 * @publicApi
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
 *
 * @publicApi
 **/
export function transition(stateChangeExpr, steps, options = null) {
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options };
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
 *
 * @publicApi
 */
export function animation(steps, options = null) {
    return { type: 8 /* Reference */, animation: steps, options };
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
 * Note that this feature is designed to be used with `query()` and it will only work
 * with animations that are assigned using the Angular animation library. CSS keyframes
 * and transitions are not handled by this API.
 *
 * `animateChild()` does not currently work with route transition animations. Please see
 * GitHub Issue {@link https://github.com/angular/angular/issues/30477 #30477} for more
 * information.
 *
 * @publicApi
 */
export function animateChild(options = null) {
    return { type: 9 /* AnimateChild */, options };
}
/**
 * Starts a reusable animation that is created using the `animation()` function.
 *
 * @param animation The reusable animation to start.
 * @param options An options object that can contain a delay value for the start of
 * the animation, and additional override values for developer-defined parameters.
 * @return An object that contains the animation parameters.
 *
 * @publicApi
 */
export function useAnimation(animation, options = null) {
    return { type: 10 /* AnimateRef */, animation, options };
}
/**
 * Finds one or more inner elements within the current element that is
 * being animated within a sequence. Use with `animate()`.
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
 * individually using `animate()`.
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
 *        query('h1', animate(1000, style({ opacity: 1 }))),
 *        query('.content', animate(1000, style({ opacity: 1 }))),
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
 *
 * @publicApi
 */
export function query(selector, animation, options = null) {
    return { type: 11 /* Query */, selector, animation, options };
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
 *
 * @publicApi
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings, animation };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQStKSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztBQXlSOUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1KRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQUMsSUFBWSxFQUFFLFdBQWdDO0lBQ3BFLE9BQU8sRUFBQyxJQUFJLGlCQUErQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO0FBQy9FLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeURHO0FBQ0gsTUFBTSxVQUFVLE9BQU8sQ0FDbkIsT0FBc0IsRUFDdEIsU0FDSSxJQUFJO0lBQ1YsT0FBTyxFQUFDLElBQUksaUJBQStCLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUNqQixLQUEwQixFQUFFLFVBQWlDLElBQUk7SUFDbkUsT0FBTyxFQUFDLElBQUksZUFBNkIsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWdDSTtBQUNKLE1BQU0sVUFBVSxRQUFRLENBQ3BCLEtBQTBCLEVBQUUsVUFBaUMsSUFBSTtJQUNuRSxPQUFPLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXNDSTtBQUNKLE1BQU0sVUFBVSxLQUFLLENBQUMsTUFDMkM7SUFDL0QsT0FBTyxFQUFDLElBQUksZUFBNkIsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUE0Qkk7QUFDSixNQUFNLFVBQVUsS0FBSyxDQUNqQixJQUFZLEVBQUUsTUFBOEIsRUFDNUMsT0FBeUM7SUFDM0MsT0FBTyxFQUFDLElBQUksZUFBNkIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Q0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLEtBQStCO0lBQ3ZELE9BQU8sRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssRUFBQyxDQUFDO0FBQ3hELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1S0k7QUFDSixNQUFNLFVBQVUsVUFBVSxDQUN0QixlQUMrRixFQUMvRixLQUE0QyxFQUM1QyxVQUFpQyxJQUFJO0lBQ3ZDLE9BQU8sRUFBQyxJQUFJLG9CQUFrQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENHO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FDckIsS0FBNEMsRUFDNUMsVUFBaUMsSUFBSTtJQUN2QyxPQUFPLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsVUFBb0MsSUFBSTtJQUVuRSxPQUFPLEVBQUMsSUFBSSxzQkFBb0MsRUFBRSxPQUFPLEVBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDeEIsU0FBcUMsRUFDckMsVUFBaUMsSUFBSTtJQUN2QyxPQUFPLEVBQUMsSUFBSSxxQkFBa0MsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNGRztBQUNILE1BQU0sVUFBVSxLQUFLLENBQ2pCLFFBQWdCLEVBQUUsU0FBZ0QsRUFDbEUsVUFBc0MsSUFBSTtJQUM1QyxPQUFPLEVBQUMsSUFBSSxnQkFBNkIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDO0FBQzNFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStFRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQUMsT0FBc0IsRUFBRSxTQUFnRDtJQUU5RixPQUFPLEVBQUMsSUFBSSxrQkFBK0IsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFDLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzZXQgb2YgQ1NTIHN0eWxlcyBmb3IgdXNlIGluIGFuIGFuaW1hdGlvbiBzdHlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSDJtVN0eWxlRGF0YSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXI7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbmltYXRpb24tc3RlcCB0aW1pbmcgcGFyYW1ldGVycyBmb3IgYW4gYW5pbWF0aW9uIHN0ZXAuXG4gKiBAc2VlIGBhbmltYXRlKClgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZGVjbGFyZSB0eXBlIEFuaW1hdGVUaW1pbmdzID0ge1xuICAvKipcbiAgICogVGhlIGZ1bGwgZHVyYXRpb24gb2YgYW4gYW5pbWF0aW9uIHN0ZXAuIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsXG4gICAqIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5cbiAgICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBkdXJhdGlvbjogbnVtYmVyLFxuICAvKipcbiAgICogVGhlIGRlbGF5IGluIGFwcGx5aW5nIGFuIGFuaW1hdGlvbiBzdGVwLiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LlxuICAgKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGRlbGF5OiBudW1iZXIsXG4gIC8qKlxuICAgKiBBbiBlYXNpbmcgc3R5bGUgdGhhdCBjb250cm9scyBob3cgYW4gYW5pbWF0aW9ucyBzdGVwIGFjY2VsZXJhdGVzXG4gICAqIGFuZCBkZWNlbGVyYXRlcyBkdXJpbmcgaXRzIHJ1biB0aW1lLiBBbiBlYXNpbmcgZnVuY3Rpb24gc3VjaCBhcyBgY3ViaWMtYmV6aWVyKClgLFxuICAgKiBvciBvbmUgb2YgdGhlIGZvbGxvd2luZyBjb25zdGFudHM6XG4gICAqIC0gYGVhc2UtaW5gXG4gICAqIC0gYGVhc2Utb3V0YFxuICAgKiAtIGBlYXNlLWluLWFuZC1vdXRgXG4gICAqL1xuICBlYXNpbmc6IHN0cmluZyB8IG51bGxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIE9wdGlvbnMgdGhhdCBjb250cm9sIGFuaW1hdGlvbiBzdHlsaW5nIGFuZCB0aW1pbmcuXG4gKlxuICogVGhlIGZvbGxvd2luZyBhbmltYXRpb24gZnVuY3Rpb25zIGFjY2VwdCBgQW5pbWF0aW9uT3B0aW9uc2AgZGF0YTpcbiAqXG4gKiAtIGB0cmFuc2l0aW9uKClgXG4gKiAtIGBzZXF1ZW5jZSgpYFxuICogLSBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gXG4gKiAtIGBxdWVyeSgpYFxuICogLSBgYW5pbWF0aW9uKClgXG4gKiAtIGB1c2VBbmltYXRpb24oKWBcbiAqIC0gYGFuaW1hdGVDaGlsZCgpYFxuICpcbiAqIFByb2dyYW1tYXRpYyBhbmltYXRpb25zIGJ1aWx0IHVzaW5nIHRoZSBgQW5pbWF0aW9uQnVpbGRlcmAgc2VydmljZSBhbHNvXG4gKiBtYWtlIHVzZSBvZiBgQW5pbWF0aW9uT3B0aW9uc2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTZXRzIGEgdGltZS1kZWxheSBmb3IgaW5pdGlhdGluZyBhbiBhbmltYXRpb24gYWN0aW9uLlxuICAgKiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LCBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZFxuICAgKiBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqIERlZmF1bHQgdmFsdWUgaXMgMCwgbWVhbmluZyBubyBkZWxheS5cbiAgICovXG4gIGRlbGF5PzogbnVtYmVyfHN0cmluZztcbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBtb2RpZnkgc3R5bGluZyBhbmQgdGltaW5nXG4gICAqIHdoZW4gYW4gYW5pbWF0aW9uIGFjdGlvbiBzdGFydHMuIEFuIGFycmF5IG9mIGtleS12YWx1ZSBwYWlycywgd2hlcmUgdGhlIHByb3ZpZGVkIHZhbHVlXG4gICAqIGlzIHVzZWQgYXMgYSBkZWZhdWx0LlxuICAgKi9cbiAgcGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9O1xufVxuXG4vKipcbiAqIEFkZHMgZHVyYXRpb24gb3B0aW9ucyB0byBjb250cm9sIGFuaW1hdGlvbiBzdHlsaW5nIGFuZCB0aW1pbmcgZm9yIGEgY2hpbGQgYW5pbWF0aW9uLlxuICpcbiAqIEBzZWUgYGFuaW1hdGVDaGlsZCgpYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGVDaGlsZE9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHtcbiAgZHVyYXRpb24/OiBudW1iZXJ8c3RyaW5nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb25zdGFudHMgZm9yIHRoZSBjYXRlZ29yaWVzIG9mIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgZGVmaW5lZCBmb3IgYW5pbWF0aW9ucy5cbiAqXG4gKiBBIGNvcnJlc3BvbmRpbmcgZnVuY3Rpb24gZGVmaW5lcyBhIHNldCBvZiBwYXJhbWV0ZXJzIGZvciBlYWNoIGNhdGVnb3J5LCBhbmRcbiAqIGNvbGxlY3RzIHRoZW0gaW50byBhIGNvcnJlc3BvbmRpbmcgYEFuaW1hdGlvbk1ldGFkYXRhYCBvYmplY3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgZW51bSBBbmltYXRpb25NZXRhZGF0YVR5cGUge1xuICAvKipcbiAgICogQXNzb2NpYXRlcyBhIG5hbWVkIGFuaW1hdGlvbiBzdGF0ZSB3aXRoIGEgc2V0IG9mIENTUyBzdHlsZXMuXG4gICAqIFNlZSBgc3RhdGUoKWBcbiAgICovXG4gIFN0YXRlID0gMCxcbiAgLyoqXG4gICAqIERhdGEgZm9yIGEgdHJhbnNpdGlvbiBmcm9tIG9uZSBhbmltYXRpb24gc3RhdGUgdG8gYW5vdGhlci5cbiAgICogU2VlIGB0cmFuc2l0aW9uKClgXG4gICAqL1xuICBUcmFuc2l0aW9uID0gMSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGBzZXF1ZW5jZSgpYFxuICAgKi9cbiAgU2VxdWVuY2UgPSAyLFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YFxuICAgKi9cbiAgR3JvdXAgPSAzLFxuICAvKipcbiAgICogQ29udGFpbnMgYW4gYW5pbWF0aW9uIHN0ZXAuXG4gICAqIFNlZSBgYW5pbWF0ZSgpYFxuICAgKi9cbiAgQW5pbWF0ZSA9IDQsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBga2V5ZnJhbWVzKClgXG4gICAqL1xuICBLZXlmcmFtZXMgPSA1LFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgQ1NTIHByb3BlcnR5LXZhbHVlIHBhaXJzIGludG8gYSBuYW1lZCBzdHlsZS5cbiAgICogU2VlIGBzdHlsZSgpYFxuICAgKi9cbiAgU3R5bGUgPSA2LFxuICAvKipcbiAgICogQXNzb2NpYXRlcyBhbiBhbmltYXRpb24gd2l0aCBhbiBlbnRyeSB0cmlnZ2VyIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQuXG4gICAqIFNlZSBgdHJpZ2dlcigpYFxuICAgKi9cbiAgVHJpZ2dlciA9IDcsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHJlLXVzYWJsZSBhbmltYXRpb24uXG4gICAqIFNlZSBgYW5pbWF0aW9uKClgXG4gICAqL1xuICBSZWZlcmVuY2UgPSA4LFxuICAvKipcbiAgICogQ29udGFpbnMgZGF0YSB0byB1c2UgaW4gZXhlY3V0aW5nIGNoaWxkIGFuaW1hdGlvbnMgcmV0dXJuZWQgYnkgYSBxdWVyeS5cbiAgICogU2VlIGBhbmltYXRlQ2hpbGQoKWBcbiAgICovXG4gIEFuaW1hdGVDaGlsZCA9IDksXG4gIC8qKlxuICAgKiBDb250YWlucyBhbmltYXRpb24gcGFyYW1ldGVycyBmb3IgYSByZS11c2FibGUgYW5pbWF0aW9uLlxuICAgKiBTZWUgYHVzZUFuaW1hdGlvbigpYFxuICAgKi9cbiAgQW5pbWF0ZVJlZiA9IDEwLFxuICAvKipcbiAgICogQ29udGFpbnMgY2hpbGQtYW5pbWF0aW9uIHF1ZXJ5IGRhdGEuXG4gICAqIFNlZSBgcXVlcnkoKWBcbiAgICovXG4gIFF1ZXJ5ID0gMTEsXG4gIC8qKlxuICAgKiBDb250YWlucyBkYXRhIGZvciBzdGFnZ2VyaW5nIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAgICogU2VlIGBzdGFnZ2VyKClgXG4gICAqL1xuICBTdGFnZ2VyID0gMTJcbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgYXV0b21hdGljIHN0eWxpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQVVUT19TVFlMRSA9ICcqJztcblxuLyoqXG4gKiBCYXNlIGZvciBhbmltYXRpb24gZGF0YSBzdHJ1Y3R1cmVzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZTtcbn1cblxuLyoqXG4gKiBDb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlci4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGVcbiAqIGB0cmlnZ2VyKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgdHJpZ2dlciBuYW1lLCB1c2VkIHRvIGFzc29jaWF0ZSBpdCB3aXRoIGFuIGVsZW1lbnQuIFVuaXF1ZSB3aXRoaW4gdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdCwgY29udGFpbmluZyBhbiBhcnJheSBvZiBzdGF0ZSBhbmQgdHJhbnNpdGlvbiBkZWNsYXJhdGlvbnMuXG4gICAqL1xuICBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczoge3BhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fX18bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0YXRlIGJ5IGFzc29jaWF0aW5nIGEgc3RhdGUgbmFtZSB3aXRoIGEgc2V0IG9mIENTUyBzdHlsZXMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc3RhdGUoKWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgc3RhdGUgbmFtZSwgdW5pcXVlIHdpdGhpbiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogIFRoZSBDU1Mgc3R5bGVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHN0YXRlLlxuICAgKi9cbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZ1xuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICAgKi9cbiAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX07XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZVxuICogYHRyYW5zaXRpb24oKWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gdGhhdCBkZXNjcmliZXMgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqL1xuICBleHByOiBzdHJpbmd8XG4gICAgICAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKTtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvYmplY3RzIHRvIHdoaWNoIHRoaXMgdHJhbnNpdGlvbiBhcHBsaWVzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLCB3aGljaCBpcyBhIGNvbGxlY3Rpb24gb2YgaW5kaXZpZHVhbCBhbmltYXRpb24gc3RlcHMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLCBhbmRcbiAqIHBhc3NlZCB0byB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gcXVlcnkuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBgcXVlcnkoKWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgVGhlIENTUyBzZWxlY3RvciBmb3IgdGhpcyBxdWVyeS5cbiAgICovXG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQSBxdWVyeSBvcHRpb25zIG9iamVjdC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIGtleWZyYW1lcyBzZXF1ZW5jZS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBrZXlmcmFtZXMoKWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBhbmltYXRpb24gc3R5bGVzLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0eWxlLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYHN0eWxlKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHlsZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQSBzZXQgb2YgQ1NTIHN0eWxlIHByb3BlcnRpZXMuXG4gICAqL1xuICBzdHlsZXM6ICcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXxBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXwnKic+O1xuICAvKipcbiAgICogQSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRlIHRpbWUgYXQgd2hpY2ggdGhlIHN0eWxlIGlzIHRvIGJlIGFwcGxpZWQuXG4gICAqL1xuICBvZmZzZXQ6IG51bWJlcnxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3RlcC4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBhbmltYXRlKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgdGltaW5nIGRhdGEgZm9yIHRoZSBzdGVwLlxuICAgKi9cbiAgdGltaW5nczogc3RyaW5nfG51bWJlcnxBbmltYXRlVGltaW5ncztcbiAgLyoqXG4gICAqIEEgc2V0IG9mIHN0eWxlcyB1c2VkIGluIHRoZSBzdGVwLlxuICAgKi9cbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhfEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGF8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSBjaGlsZCBhbmltYXRpb24sIHRoYXQgY2FuIGJlIHJ1biBleHBsaWNpdGx5IHdoZW4gdGhlIHBhcmVudCBpcyBydW4uXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZUNoaWxkYCBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSByZXVzYWJsZSBhbmltYXRpb24uXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhbmltYXRpb24gcmVmZXJlbmNlIG9iamVjdC5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGE7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gICAqL1xuICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gZ3JvdXAuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25Hcm91cE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9yIHN0eWxlIHN0ZXBzIHRoYXQgZm9ybSB0aGlzIGdyb3VwLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW5pbWF0aW9uIHF1ZXJ5IG9wdGlvbnMuXG4gKiBQYXNzZWQgdG8gdGhlIGBxdWVyeSgpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25RdWVyeU9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFRydWUgaWYgdGhpcyBxdWVyeSBpcyBvcHRpb25hbCwgZmFsc2UgaWYgaXQgaXMgcmVxdWlyZWQuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAqIEEgcmVxdWlyZWQgcXVlcnkgdGhyb3dzIGFuIGVycm9yIGlmIG5vIGVsZW1lbnRzIGFyZSByZXRyaWV2ZWQgd2hlblxuICAgKiB0aGUgcXVlcnkgaXMgZXhlY3V0ZWQuIEFuIG9wdGlvbmFsIHF1ZXJ5IGRvZXMgbm90LlxuICAgKlxuICAgKi9cbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKipcbiAgICogQSBtYXhpbXVtIHRvdGFsIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybiBmcm9tIHRoZSBxdWVyeS5cbiAgICogSWYgbmVnYXRpdmUsIHJlc3VsdHMgYXJlIGxpbWl0ZWQgZnJvbSB0aGUgZW5kIG9mIHRoZSBxdWVyeSBsaXN0IHRvd2FyZHMgdGhlIGJlZ2lubmluZy5cbiAgICogQnkgZGVmYXVsdCwgcmVzdWx0cyBhcmUgbm90IGxpbWl0ZWQuXG4gICAqL1xuICBsaW1pdD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgcGFyYW1ldGVycyBmb3Igc3RhZ2dlcmluZyB0aGUgc3RhcnQgdGltZXMgb2YgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHN0YWdnZXIoKWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICoqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgdGltaW5nIGRhdGEgZm9yIHRoZSBzdGVwcy5cbiAgICovXG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXI7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcHMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5hbWVkIGFuaW1hdGlvbiB0cmlnZ2VyLCBjb250YWluaW5nIGEgIGxpc3Qgb2YgYHN0YXRlKClgXG4gKiBhbmQgYHRyYW5zaXRpb24oKWAgZW50cmllcyB0byBiZSBldmFsdWF0ZWQgd2hlbiB0aGUgZXhwcmVzc2lvblxuICogYm91bmQgdG8gdGhlIHRyaWdnZXIgY2hhbmdlcy5cbiAqXG4gKiBAcGFyYW0gbmFtZSBBbiBpZGVudGlmeWluZyBzdHJpbmcuXG4gKiBAcGFyYW0gZGVmaW5pdGlvbnMgIEFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdCwgY29udGFpbmluZyBhbiBhcnJheSBvZiBgc3RhdGUoKWBcbiAqIGFuZCBgdHJhbnNpdGlvbigpYCBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHRyaWdnZXIgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRGVmaW5lIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIGluIHRoZSBgYW5pbWF0aW9uc2Agc2VjdGlvbiBvZiBgQENvbXBvbmVudGAgbWV0YWRhdGEuXG4gKiBJbiB0aGUgdGVtcGxhdGUsIHJlZmVyZW5jZSB0aGUgdHJpZ2dlciBieSBuYW1lIGFuZCBiaW5kIGl0IHRvIGEgdHJpZ2dlciBleHByZXNzaW9uIHRoYXRcbiAqIGV2YWx1YXRlcyB0byBhIGRlZmluZWQgYW5pbWF0aW9uIHN0YXRlLCB1c2luZyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiBgW0B0cmlnZ2VyTmFtZV09XCJleHByZXNzaW9uXCJgXG4gKlxuICogQW5pbWF0aW9uIHRyaWdnZXIgYmluZGluZ3MgY29udmVydCBhbGwgdmFsdWVzIHRvIHN0cmluZ3MsIGFuZCB0aGVuIG1hdGNoIHRoZVxuICogcHJldmlvdXMgYW5kIGN1cnJlbnQgdmFsdWVzIGFnYWluc3QgYW55IGxpbmtlZCB0cmFuc2l0aW9ucy5cbiAqIEJvb2xlYW5zIGNhbiBiZSBzcGVjaWZpZWQgYXMgYDFgIG9yIGB0cnVlYCBhbmQgYDBgIG9yIGBmYWxzZWAuXG4gKlxuICogIyMjIFVzYWdlIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhbiBhbmltYXRpb24gdHJpZ2dlciByZWZlcmVuY2UgYmFzZWQgb24gdGhlIHByb3ZpZGVkXG4gKiBuYW1lIHZhbHVlLlxuICogVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiB2YWx1ZSBpcyBleHBlY3RlZCB0byBiZSBhbiBhcnJheSBjb25zaXN0aW5nIG9mIHN0YXRlIGFuZFxuICogdHJhbnNpdGlvbiBkZWNsYXJhdGlvbnMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiBcIm15LWNvbXBvbmVudFwiLFxuICogICB0ZW1wbGF0ZVVybDogXCJteS1jb21wb25lbnQtdHBsLmh0bWxcIixcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLilcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwic29tZXRoaW5nXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IG1ha2VzIHVzZSBvZiB0aGUgZGVmaW5lZCB0cmlnZ2VyXG4gKiBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgYW4gaW5saW5lIGZ1bmN0aW9uXG4gKiBUaGUgYHRyYW5zaXRpb25gIGFuaW1hdGlvbiBtZXRob2QgYWxzbyBzdXBwb3J0cyByZWFkaW5nIGFuIGlubGluZSBmdW5jdGlvbiB3aGljaCBjYW4gZGVjaWRlXG4gKiBpZiBpdHMgYXNzb2NpYXRlZCBhbmltYXRpb24gc2hvdWxkIGJlIHJ1bi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGlzIG1ldGhvZCBpcyBydW4gZWFjaCB0aW1lIHRoZSBgbXlBbmltYXRpb25UcmlnZ2VyYCB0cmlnZ2VyIHZhbHVlIGNoYW5nZXMuXG4gKiBmdW5jdGlvbiBteUlubGluZU1hdGNoZXJGbihmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6XG4gc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICogICAvLyBub3RpY2UgdGhhdCBgZWxlbWVudGAgYW5kIGBwYXJhbXNgIGFyZSBhbHNvIGF2YWlsYWJsZSBoZXJlXG4gKiAgIHJldHVybiB0b1N0YXRlID09ICd5ZXMtcGxlYXNlLWFuaW1hdGUnO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ215QW5pbWF0aW9uVHJpZ2dlcicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24obXlJbmxpbmVNYXRjaGVyRm4sIFtcbiAqICAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSBjb2RlXG4gKiAgICAgICBdKSxcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwieWVzLXBsZWFzZS1hbmltYXRlXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRGlzYWJsaW5nIEFuaW1hdGlvbnNcbiAqIFdoZW4gdHJ1ZSwgdGhlIHNwZWNpYWwgYW5pbWF0aW9uIGNvbnRyb2wgYmluZGluZyBgQC5kaXNhYmxlZGAgYmluZGluZyBwcmV2ZW50c1xuICogYWxsIGFuaW1hdGlvbnMgZnJvbSByZW5kZXJpbmcuXG4gKiBQbGFjZSB0aGUgIGBALmRpc2FibGVkYCBiaW5kaW5nIG9uIGFuIGVsZW1lbnQgdG8gZGlzYWJsZVxuICogYW5pbWF0aW9ucyBvbiB0aGUgZWxlbWVudCBpdHNlbGYsIGFzIHdlbGwgYXMgYW55IGlubmVyIGFuaW1hdGlvbiB0cmlnZ2Vyc1xuICogd2l0aGluIHRoZSBlbGVtZW50LlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIHRoaXMgZmVhdHVyZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0AuZGlzYWJsZWRdPVwiaXNEaXNhYmxlZFwiPlxuICogICAgICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcImNoaWxkQW5pbWF0aW9uXCIsIFtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGlzRGlzYWJsZWQgPSB0cnVlO1xuICogICBleHAgPSAnLi4uJztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdoZW4gYEAuZGlzYWJsZWRgIGlzIHRydWUsIGl0IHByZXZlbnRzIHRoZSBgQGNoaWxkQW5pbWF0aW9uYCB0cmlnZ2VyIGZyb20gYW5pbWF0aW5nLFxuICogYWxvbmcgd2l0aCBhbnkgaW5uZXIgYW5pbWF0aW9ucy5cbiAqXG4gKiAjIyMgRGlzYWJsZSBhbmltYXRpb25zIGFwcGxpY2F0aW9uLXdpZGVcbiAqIFdoZW4gYW4gYXJlYSBvZiB0aGUgdGVtcGxhdGUgaXMgc2V0IHRvIGhhdmUgYW5pbWF0aW9ucyBkaXNhYmxlZCxcbiAqICoqYWxsKiogaW5uZXIgY29tcG9uZW50cyBoYXZlIHRoZWlyIGFuaW1hdGlvbnMgZGlzYWJsZWQgYXMgd2VsbC5cbiAqIFRoaXMgbWVhbnMgdGhhdCB5b3UgY2FuIGRpc2FibGUgYWxsIGFuaW1hdGlvbnMgZm9yIGFuIGFwcFxuICogYnkgcGxhY2luZyBhIGhvc3QgYmluZGluZyBzZXQgb24gYEAuZGlzYWJsZWRgIG9uIHRoZSB0b3Btb3N0IEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBIb3N0QmluZGluZ30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwLWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJyxcbiAqIH0pXG4gKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ0AuZGlzYWJsZWQnKVxuICogICBwdWJsaWMgYW5pbWF0aW9uc0Rpc2FibGVkID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBPdmVycmlkaW5nIGRpc2FibGVtZW50IG9mIGlubmVyIGFuaW1hdGlvbnNcbiAqIERlc3BpdGUgaW5uZXIgYW5pbWF0aW9ucyBiZWluZyBkaXNhYmxlZCwgYSBwYXJlbnQgYW5pbWF0aW9uIGNhbiBgcXVlcnkoKWBcbiAqIGZvciBpbm5lciBlbGVtZW50cyBsb2NhdGVkIGluIGRpc2FibGVkIGFyZWFzIG9mIHRoZSB0ZW1wbGF0ZSBhbmQgc3RpbGwgYW5pbWF0ZVxuICogdGhlbSBpZiBuZWVkZWQuIFRoaXMgaXMgYWxzbyB0aGUgY2FzZSBmb3Igd2hlbiBhIHN1YiBhbmltYXRpb24gaXNcbiAqIHF1ZXJpZWQgYnkgYSBwYXJlbnQgYW5kIHRoZW4gbGF0ZXIgYW5pbWF0ZWQgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC5cbiAqXG4gKiAjIyMgRGV0ZWN0aW5nIHdoZW4gYW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXG4gKiBJZiBhIHJlZ2lvbiBvZiB0aGUgRE9NIChvciB0aGUgZW50aXJlIGFwcGxpY2F0aW9uKSBoYXMgaXRzIGFuaW1hdGlvbnMgZGlzYWJsZWQsIHRoZSBhbmltYXRpb25cbiAqIHRyaWdnZXIgY2FsbGJhY2tzIHN0aWxsIGZpcmUsIGJ1dCBmb3IgemVybyBzZWNvbmRzLiBXaGVuIHRoZSBjYWxsYmFjayBmaXJlcywgaXQgcHJvdmlkZXNcbiAqIGFuIGluc3RhbmNlIG9mIGFuIGBBbmltYXRpb25FdmVudGAuIElmIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLFxuICogdGhlIGAuZGlzYWJsZWRgIGZsYWcgb24gdGhlIGV2ZW50IGlzIHRydWUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlciwgbmFtZSwgZGVmaW5pdGlvbnMsIG9wdGlvbnM6IHt9fTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgY29tYmluZXMgc3R5bGluZyBpbmZvcm1hdGlvbiB3aXRoIHRpbWluZyBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBTZXRzIGBBbmltYXRlVGltaW5nc2AgZm9yIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogQSBzdHJpbmcgaW4gdGhlIGZvcm1hdCBcImR1cmF0aW9uIFtkZWxheV0gW2Vhc2luZ11cIi5cbiAqICAtIER1cmF0aW9uIGFuZCBkZWxheSBhcmUgZXhwcmVzc2VkIGFzIGEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsXG4gKiBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZCBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuXG4gKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAqICAtIFRoZSBlYXNpbmcgdmFsdWUgY29udHJvbHMgaG93IHRoZSBhbmltYXRpb24gYWNjZWxlcmF0ZXMgYW5kIGRlY2VsZXJhdGVzXG4gKiBkdXJpbmcgaXRzIHJ1bnRpbWUuIFZhbHVlIGlzIG9uZSBvZiAgYGVhc2VgLCBgZWFzZS1pbmAsIGBlYXNlLW91dGAsXG4gKiBgZWFzZS1pbi1vdXRgLCBvciBhIGBjdWJpYy1iZXppZXIoKWAgZnVuY3Rpb24gY2FsbC5cbiAqIElmIG5vdCBzdXBwbGllZCwgbm8gZWFzaW5nIGlzIGFwcGxpZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBzdHJpbmcgXCIxcyAxMDBtcyBlYXNlLW91dFwiIHNwZWNpZmllcyBhIGR1cmF0aW9uIG9mXG4gKiAxMDAwIG1pbGxpc2Vjb25kcywgYW5kIGRlbGF5IG9mIDEwMCBtcywgYW5kIHRoZSBcImVhc2Utb3V0XCIgZWFzaW5nIHN0eWxlLFxuICogd2hpY2ggZGVjZWxlcmF0ZXMgbmVhciB0aGUgZW5kIG9mIHRoZSBkdXJhdGlvbi5cbiAqIEBwYXJhbSBzdHlsZXMgU2V0cyBBbmltYXRpb25TdHlsZXMgZm9yIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogQSBmdW5jdGlvbiBjYWxsIHRvIGVpdGhlciBgc3R5bGUoKWAgb3IgYGtleWZyYW1lcygpYFxuICogdGhhdCByZXR1cm5zIGEgY29sbGVjdGlvbiBvZiBDU1Mgc3R5bGUgZW50cmllcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBwYXJlbnQgYW5pbWF0aW9uLlxuICogV2hlbiBudWxsLCB1c2VzIHRoZSBzdHlsZXMgZnJvbSB0aGUgZGVzdGluYXRpb24gc3RhdGUuXG4gKiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGRlc2NyaWJpbmcgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCB3aWxsIGNvbXBsZXRlIGFuIGFuaW1hdGlvbjtcbiAqIHNlZSBcIkFuaW1hdGluZyB0byB0aGUgZmluYWwgc3RhdGVcIiBpbiBgdHJhbnNpdGlvbnMoKWAuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGFuaW1hdGlvbiBzdGVwLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBDYWxsIHdpdGhpbiBhbiBhbmltYXRpb24gYHNlcXVlbmNlKClgLCBge0BsaW5rIGFuaW1hdGlvbnMvZ3JvdXAgZ3JvdXAoKX1gLCBvclxuICogYHRyYW5zaXRpb24oKWAgY2FsbCB0byBzcGVjaWZ5IGFuIGFuaW1hdGlvbiBzdGVwXG4gKiB0aGF0IGFwcGxpZXMgZ2l2ZW4gc3R5bGUgZGF0YSB0byB0aGUgcGFyZW50IGFuaW1hdGlvbiBmb3IgYSBnaXZlbiBhbW91bnQgb2YgdGltZS5cbiAqXG4gKiAjIyMgU3ludGF4IEV4YW1wbGVzXG4gKiAqKlRpbWluZyBleGFtcGxlcyoqXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBzaG93IHZhcmlvdXMgYHRpbWluZ3NgIHNwZWNpZmljYXRpb25zLlxuICogLSBgYW5pbWF0ZSg1MDApYCA6IER1cmF0aW9uIGlzIDUwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiMXNcIilgIDogRHVyYXRpb24gaXMgMTAwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiMTAwbXMgMC41c1wiKWAgOiBEdXJhdGlvbiBpcyAxMDAgbWlsbGlzZWNvbmRzLCBkZWxheSBpcyA1MDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjVzIGVhc2UtaW5cIilgIDogRHVyYXRpb24gaXMgNTAwMCBtaWxsaXNlY29uZHMsIGVhc2luZyBpbi5cbiAqIC0gYGFuaW1hdGUoXCI1cyAxMG1zIGN1YmljLWJlemllciguMTcsLjY3LC44OCwuMSlcIilgIDogRHVyYXRpb24gaXMgNTAwMCBtaWxsaXNlY29uZHMsIGRlbGF5IGlzIDEwXG4gKiBtaWxsaXNlY29uZHMsIGVhc2luZyBhY2NvcmRpbmcgdG8gYSBiZXppZXIgY3VydmUuXG4gKlxuICogKipTdHlsZSBleGFtcGxlcyoqXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNhbGxzIGBzdHlsZSgpYCB0byBzZXQgYSBzaW5nbGUgQ1NTIHN0eWxlLlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZSg1MDAsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqIGBgYFxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNhbGxzIGBrZXlmcmFtZXMoKWAgdG8gc2V0IGEgQ1NTIHN0eWxlXG4gKiB0byBkaWZmZXJlbnQgdmFsdWVzIGZvciBzdWNjZXNzaXZlIGtleWZyYW1lcy5cbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoNTAwLCBrZXlmcmFtZXMoXG4gKiAgW1xuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwiYmx1ZVwiIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSlcbiAqICBdKVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZShcbiAgICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyLFxuICAgIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YXxBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhfG51bGwgPVxuICAgICAgICBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZSwgc3R5bGVzLCB0aW1pbmdzfTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIGJlIHJ1biBpbiBwYXJhbGxlbC5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gV2hlbiBzdGVwcyBhcmUgZGVmaW5lZCBieSBgc3R5bGUoKWAgb3IgYGFuaW1hdGUoKWBcbiAqIGZ1bmN0aW9uIGNhbGxzLCBlYWNoIGNhbGwgd2l0aGluIHRoZSBncm91cCBpcyBleGVjdXRlZCBpbnN0YW50bHkuXG4gKiAtIFRvIHNwZWNpZnkgb2Zmc2V0IHN0eWxlcyB0byBiZSBhcHBsaWVkIGF0IGEgbGF0ZXIgdGltZSwgZGVmaW5lIHN0ZXBzIHdpdGhcbiAqIGBrZXlmcmFtZXMoKWAsIG9yIHVzZSBgYW5pbWF0ZSgpYCBjYWxscyB3aXRoIGEgZGVsYXkgdmFsdWUuXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBncm91cChbXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiYmxhY2tcIiB9KSksXG4gKiAgIGFuaW1hdGUoXCIyc1wiLCBzdHlsZSh7IGNvbG9yOiBcIndoaXRlXCIgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGdyb3VwIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEdyb3VwZWQgYW5pbWF0aW9ucyBhcmUgdXNlZnVsIHdoZW4gYSBzZXJpZXMgb2Ygc3R5bGVzIG11c3QgYmVcbiAqIGFuaW1hdGVkIGF0IGRpZmZlcmVudCBzdGFydGluZyB0aW1lcyBhbmQgY2xvc2VkIG9mZiBhdCBkaWZmZXJlbnQgZW5kaW5nIHRpbWVzLlxuICpcbiAqIFdoZW4gY2FsbGVkIHdpdGhpbiBhIGBzZXF1ZW5jZSgpYCBvciBhXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsLCBkb2VzIG5vdCBjb250aW51ZSB0byB0aGUgbmV4dFxuICogaW5zdHJ1Y3Rpb24gdW50aWwgYWxsIG9mIHRoZSBpbm5lciBhbmltYXRpb24gc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXAoXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCA9IG51bGwpOiBBbmltYXRpb25Hcm91cE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXAsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdG8gYmUgcnVuIHNlcXVlbnRpYWxseSwgb25lIGJ5IG9uZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgc3R5bGUoKWAgY2FsbHMgYXBwbHkgdGhlIHN0eWxpbmcgZGF0YSBpbW1lZGlhdGVseS5cbiAqIC0gU3RlcHMgZGVmaW5lZCBieSBgYW5pbWF0ZSgpYCBjYWxscyBhcHBseSB0aGUgc3R5bGluZyBkYXRhIG92ZXIgdGltZVxuICogICBhcyBzcGVjaWZpZWQgYnkgdGhlIHRpbWluZyBkYXRhLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzZXF1ZW5jZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBXaGVuIHlvdSBwYXNzIGFuIGFycmF5IG9mIHN0ZXBzIHRvIGFcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwsIHRoZSBzdGVwcyBydW4gc2VxdWVudGlhbGx5IGJ5IGRlZmF1bHQuXG4gKiBDb21wYXJlIHRoaXMgdG8gdGhlIGB7QGxpbmsgYW5pbWF0aW9ucy9ncm91cCBncm91cCgpfWAgY2FsbCwgd2hpY2ggcnVucyBhbmltYXRpb24gc3RlcHMgaW5cbiAqcGFyYWxsZWwuXG4gKlxuICogV2hlbiBhIHNlcXVlbmNlIGlzIHVzZWQgd2l0aGluIGEgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YCBvciBhIGB0cmFuc2l0aW9uKClgIGNhbGwsXG4gKiBleGVjdXRpb24gY29udGludWVzIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9ubHkgYWZ0ZXIgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2UoXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCA9IG51bGwpOiBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGtleS92YWx1ZSBvYmplY3QgY29udGFpbmluZyBDU1MgcHJvcGVydGllcy9zdHlsZXMgdGhhdFxuICogY2FuIHRoZW4gYmUgdXNlZCBmb3IgYW4gYW5pbWF0aW9uIGBzdGF0ZWAsIHdpdGhpbiBhbiBhbmltYXRpb24gYHNlcXVlbmNlYCxcbiAqIG9yIGFzIHN0eWxpbmcgZGF0YSBmb3IgY2FsbHMgdG8gYGFuaW1hdGUoKWAgYW5kIGBrZXlmcmFtZXMoKWAuXG4gKlxuICogQHBhcmFtIHRva2VucyBBIHNldCBvZiBDU1Mgc3R5bGVzIG9yIEhUTUwgc3R5bGVzIGFzc29jaWF0ZWQgd2l0aCBhbiBhbmltYXRpb24gc3RhdGUuXG4gKiBUaGUgdmFsdWUgY2FuIGJlIGFueSBvZiB0aGUgZm9sbG93aW5nOlxuICogLSBBIGtleS12YWx1ZSBzdHlsZSBwYWlyIGFzc29jaWF0aW5nIGEgQ1NTIHByb3BlcnR5IHdpdGggYSB2YWx1ZS5cbiAqIC0gQW4gYXJyYXkgb2Yga2V5LXZhbHVlIHN0eWxlIHBhaXJzLlxuICogLSBBbiBhc3RlcmlzayAoKiksIHRvIHVzZSBhdXRvLXN0eWxpbmcsIHdoZXJlIHN0eWxlcyBhcmUgZGVyaXZlZCBmcm9tIHRoZSBlbGVtZW50XG4gKiBiZWluZyBhbmltYXRlZCBhbmQgYXBwbGllZCB0byB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgc3RhcnRzLlxuICpcbiAqIEF1dG8tc3R5bGluZyBjYW4gYmUgdXNlZCB0byBkZWZpbmUgYSBzdGF0ZSB0aGF0IGRlcGVuZHMgb24gbGF5b3V0IG9yIG90aGVyXG4gKiBlbnZpcm9ubWVudGFsIGZhY3RvcnMuXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHN0eWxlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgY3JlYXRlIGFuaW1hdGlvbiBzdHlsZXMgdGhhdCBjb2xsZWN0IGEgc2V0IG9mXG4gKiBDU1MgcHJvcGVydHkgdmFsdWVzOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHN0cmluZyB2YWx1ZXMgZm9yIENTUyBwcm9wZXJ0aWVzXG4gKiBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIsIGNvbG9yOiBcImJsdWVcIiB9KVxuICpcbiAqIC8vIG51bWVyaWNhbCBwaXhlbCB2YWx1ZXNcbiAqIHN0eWxlKHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAwIH0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgdXNlcyBhdXRvLXN0eWxpbmcgdG8gYWxsb3cgYW4gZWxlbWVudCB0byBhbmltYXRlIGZyb21cbiAqIGEgaGVpZ2h0IG9mIDAgdXAgdG8gaXRzIGZ1bGwgaGVpZ2h0OlxuICpcbiAqIGBgYFxuICogc3R5bGUoeyBoZWlnaHQ6IDAgfSksXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlKHRva2VuczogJyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fFxuICAgICAgICAgICAgICAgICAgICAgIEFycmF5PCcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfT4pOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUsIHN0eWxlczogdG9rZW5zLCBvZmZzZXQ6IG51bGx9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoaW4gYSB0cmlnZ2VyIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIG5hbWUgT25lIG9yIG1vcmUgbmFtZXMgZm9yIHRoZSBkZWZpbmVkIHN0YXRlIGluIGEgY29tbWEtc2VwYXJhdGVkIHN0cmluZy5cbiAqIFRoZSBmb2xsb3dpbmcgcmVzZXJ2ZWQgc3RhdGUgbmFtZXMgY2FuIGJlIHN1cHBsaWVkIHRvIGRlZmluZSBhIHN0eWxlIGZvciBzcGVjaWZpYyB1c2VcbiAqIGNhc2VzOlxuICpcbiAqIC0gYHZvaWRgIFlvdSBjYW4gYXNzb2NpYXRlIHN0eWxlcyB3aXRoIHRoaXMgbmFtZSB0byBiZSB1c2VkIHdoZW5cbiAqIHRoZSBlbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgd2hlbiBhbiBgbmdJZmAgZXZhbHVhdGVzXG4gKiB0byBmYWxzZSwgdGhlIHN0YXRlIG9mIHRoZSBhc3NvY2lhdGVkIGVsZW1lbnQgaXMgdm9pZC5cbiAqICAtIGAqYCAoYXN0ZXJpc2spIEluZGljYXRlcyB0aGUgZGVmYXVsdCBzdGF0ZS4gWW91IGNhbiBhc3NvY2lhdGUgc3R5bGVzIHdpdGggdGhpcyBuYW1lXG4gKiB0byBiZSB1c2VkIGFzIHRoZSBmYWxsYmFjayB3aGVuIHRoZSBzdGF0ZSB0aGF0IGlzIGJlaW5nIGFuaW1hdGVkIGlzIG5vdCBkZWNsYXJlZFxuICogd2l0aGluIHRoZSB0cmlnZ2VyLlxuICpcbiAqIEBwYXJhbSBzdHlsZXMgQSBzZXQgb2YgQ1NTIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzdGF0ZSwgY3JlYXRlZCB1c2luZyB0aGVcbiAqIGBzdHlsZSgpYCBmdW5jdGlvbi5cbiAqIFRoaXMgc2V0IG9mIHN0eWxlcyBwZXJzaXN0cyBvbiB0aGUgZWxlbWVudCBvbmNlIHRoZSBzdGF0ZSBoYXMgYmVlbiByZWFjaGVkLlxuICogQHBhcmFtIG9wdGlvbnMgUGFyYW1ldGVycyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIHN0YXRlIHdoZW4gaXQgaXMgaW52b2tlZC5cbiAqIDAgb3IgbW9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgbmV3IHN0YXRlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFVzZSB0aGUgYHRyaWdnZXIoKWAgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgc3RhdGVzIHRvIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogVXNlIHRoZSBgdHJhbnNpdGlvbigpYCBmdW5jdGlvbiB0byBhbmltYXRlIGJldHdlZW4gc3RhdGVzLlxuICogV2hlbiBhIHN0YXRlIGlzIGFjdGl2ZSB3aXRoaW4gYSBjb21wb25lbnQsIGl0cyBhc3NvY2lhdGVkIHN0eWxlcyBwZXJzaXN0IG9uIHRoZSBlbGVtZW50LFxuICogZXZlbiB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGUoXG4gICAgbmFtZTogc3RyaW5nLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsXG4gICAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX0pOiBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGUsIG5hbWUsIHN0eWxlcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHNldCBvZiBhbmltYXRpb24gc3R5bGVzLCBhc3NvY2lhdGluZyBlYWNoIHN0eWxlIHdpdGggYW4gb3B0aW9uYWwgYG9mZnNldGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEEgc2V0IG9mIGFuaW1hdGlvbiBzdHlsZXMgd2l0aCBvcHRpb25hbCBvZmZzZXQgZGF0YS5cbiAqIFRoZSBvcHRpb25hbCBgb2Zmc2V0YCB2YWx1ZSBmb3IgYSBzdHlsZSBzcGVjaWZpZXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRpb25cbiAqIHRpbWUgYXQgd2hpY2ggdGhhdCBzdHlsZSBpcyBhcHBsaWVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBrZXlmcmFtZXMgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVXNlIHdpdGggdGhlIGBhbmltYXRlKClgIGNhbGwuIEluc3RlYWQgb2YgYXBwbHlpbmcgYW5pbWF0aW9uc1xuICogZnJvbSB0aGUgY3VycmVudCBzdGF0ZVxuICogdG8gdGhlIGRlc3RpbmF0aW9uIHN0YXRlLCBrZXlmcmFtZXMgZGVzY3JpYmUgaG93IGVhY2ggc3R5bGUgZW50cnkgaXMgYXBwbGllZCBhbmQgYXQgd2hhdCBwb2ludFxuICogd2l0aGluIHRoZSBhbmltYXRpb24gYXJjLlxuICogQ29tcGFyZSBbQ1NTIEtleWZyYW1lIEFuaW1hdGlvbnNdKGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vY3NzL2NzczNfYW5pbWF0aW9ucy5hc3ApLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIG9mZnNldCB2YWx1ZXMgZGVzY3JpYmVcbiAqIHdoZW4gZWFjaCBgYmFja2dyb3VuZENvbG9yYCB2YWx1ZSBpcyBhcHBsaWVkLiBUaGUgY29sb3IgaXMgcmVkIGF0IHRoZSBzdGFydCwgYW5kIGNoYW5nZXMgdG9cbiAqIGJsdWUgd2hlbiAyMCUgb2YgdGhlIHRvdGFsIHRpbWUgaGFzIGVsYXBzZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHByb3ZpZGVkIG9mZnNldCB2YWx1ZXNcbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiwgb2Zmc2V0OiAwIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIsIG9mZnNldDogMC4yIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiwgb2Zmc2V0OiAwLjMgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIsIG9mZnNldDogMSB9KVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBJZiB0aGVyZSBhcmUgbm8gYG9mZnNldGAgdmFsdWVzIHNwZWNpZmllZCBpbiB0aGUgc3R5bGUgZW50cmllcywgdGhlIG9mZnNldHNcbiAqIGFyZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiIH0pIC8vIG9mZnNldCA9IDBcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiIH0pIC8vIG9mZnNldCA9IDAuMzNcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIgfSkgLy8gb2Zmc2V0ID0gMC42NlxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiIH0pIC8vIG9mZnNldCA9IDFcbiAqIF0pKVxuICpgYGBcblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5ZnJhbWVzKHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW10pOiBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzLCBzdGVwc307XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gYW5pbWF0aW9uIHRyYW5zaXRpb24gYXMgYSBzZXF1ZW5jZSBvZiBhbmltYXRpb24gc3RlcHMgdG8gcnVuIHdoZW4gYSBnaXZlblxuICogY29uZGl0aW9uIGlzIHNhdGlzZmllZC4gVGhlIGNvbmRpdGlvbiBpcyBhIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzXG4gKiB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLlxuICogV2hlbiB0aGUgc3RhdGUgY3JpdGVyaWEgb2YgYSBkZWZpbmVkIHRyYW5zaXRpb24gYXJlIG1ldCwgdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIGlzXG4gKiB0cmlnZ2VyZWQuXG4gKlxuICogQHBhcmFtIHN0YXRlQ2hhbmdlRXhwciBBIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudFxuICogYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLiBOb3RlIHRoYXQgIFwidHJ1ZVwiIGFuZCBcImZhbHNlXCJcbiAqIG1hdGNoIDEgYW5kIDAsIHJlc3BlY3RpdmVseS4gQW4gZXhwcmVzc2lvbiBpcyBldmFsdWF0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3VycyBpbiB0aGVcbiAqIGFuaW1hdGlvbiB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBUaGUgYW5pbWF0aW9uIHN0ZXBzIHJ1biB3aGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlLlxuICpcbiAqIC0gQSBzdGF0ZS1jaGFuZ2Ugc3RyaW5nIHRha2VzIHRoZSBmb3JtIFwic3RhdGUxID0+IHN0YXRlMlwiLCB3aGVyZSBlYWNoIHNpZGUgaXMgYSBkZWZpbmVkIGFuaW1hdGlvblxuICogc3RhdGUsIG9yIGFuIGFzdGVyaXggKCopIHRvIHJlZmVyIHRvIGEgZHluYW1pYyBzdGFydCBvciBlbmQgc3RhdGUuXG4gKiAgIC0gVGhlIGV4cHJlc3Npb24gc3RyaW5nIGNhbiBjb250YWluIG11bHRpcGxlIGNvbW1hLXNlcGFyYXRlZCBzdGF0ZW1lbnRzO1xuICogZm9yIGV4YW1wbGUgXCJzdGF0ZTEgPT4gc3RhdGUyLCBzdGF0ZTMgPT4gc3RhdGU0XCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDplbnRlcmAgYW5kIGA6bGVhdmVgIGluaXRpYXRlIGEgdHJhbnNpdGlvbiBvbiB0aGUgZW50cnkgYW5kIGV4aXQgc3RhdGVzLFxuICogZXF1aXZhbGVudCB0byAgXCJ2b2lkID0+ICpcIiAgYW5kIFwiKiA9PiB2b2lkXCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDppbmNyZW1lbnRgIGFuZCBgOmRlY3JlbWVudGAgaW5pdGlhdGUgYSB0cmFuc2l0aW9uIHdoZW4gYSBudW1lcmljIHZhbHVlIGhhc1xuICogaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCBpbiB2YWx1ZS5cbiAqIC0gQSBmdW5jdGlvbiBpcyBleGVjdXRlZCBlYWNoIHRpbWUgYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzIGluIHRoZSBhbmltYXRpb24gdHJpZ2dlciBlbGVtZW50LlxuICogVGhlIGFuaW1hdGlvbiBzdGVwcyBydW4gd2hlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cywgYXMgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlKClgIG9yXG4gKiBgc2VxdWVuY2UoKWAgZnVuY3Rpb24sIHRoYXQgZm9ybSBhIHRyYW5zZm9ybWF0aW9uIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKiBBIHNlcXVlbmNlIGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIHlvdSBwYXNzIGFuIGFycmF5LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvbixcbiAqIGFuZCBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuIFByb3ZpZGVkIHZhbHVlcyBmb3IgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGFyZSB1c2VkXG4gKiBhcyBkZWZhdWx0cywgYW5kIG92ZXJyaWRlIHZhbHVlcyBjYW4gYmUgcGFzc2VkIHRvIHRoZSBjYWxsZXIgb24gaW52b2NhdGlvbi5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgdHJhbnNpdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIGEgY29tcG9uZW50IGJpbmRzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogYGBgSFRNTFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEFsbCB0cmFuc2l0aW9ucyBhcmUgZGVmaW5lZCB3aXRoaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIsXG4gKiBhbG9uZyB3aXRoIG5hbWVkIHN0YXRlcyB0aGF0IHRoZSB0cmFuc2l0aW9ucyBjaGFuZ2UgdG8gYW5kIGZyb20uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgLy8gZGVmaW5lIHN0YXRlc1xuICogIHN0YXRlKFwib25cIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZWVuXCIgfSkpLFxuICogIHN0YXRlKFwib2ZmXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmV5XCIgfSkpLFxuICogIC4uLl1cbiAqIGBgYFxuICpcbiAqIE5vdGUgdGhhdCB3aGVuIHlvdSBjYWxsIHRoZSBgc2VxdWVuY2UoKWAgZnVuY3Rpb24gd2l0aGluIGEgYHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwKCl9YFxuICogb3IgYSBgdHJhbnNpdGlvbigpYCBjYWxsLCBleGVjdXRpb24gZG9lcyBub3QgY29udGludWUgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb25cbiAqIHVudGlsIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvbiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiAjIyMgU3ludGF4IGV4YW1wbGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBkZWZpbmUgdHJhbnNpdGlvbnMgYmV0d2VlbiB0aGUgdHdvIGRlZmluZWQgc3RhdGVzIChhbmQgZGVmYXVsdCBzdGF0ZXMpLFxuICogdXNpbmcgdmFyaW91cyBvcHRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIFRyYW5zaXRpb24gb2NjdXJzIHdoZW4gdGhlIHN0YXRlIHZhbHVlXG4gKiAvLyBib3VuZCB0byBcIm15QW5pbWF0aW9uVHJpZ2dlclwiIGNoYW5nZXMgZnJvbSBcIm9uXCIgdG8gXCJvZmZcIlxuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZlwiLCBhbmltYXRlKDUwMCkpXG4gKiAvLyBSdW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZvciBib3RoIGRpcmVjdGlvbnNcbiAqIHRyYW5zaXRpb24oXCJvbiA8PT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSlcbiAqIC8vIERlZmluZSBtdWx0aXBsZSBzdGF0ZS1jaGFuZ2UgcGFpcnMgc2VwYXJhdGVkIGJ5IGNvbW1hc1xuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZiwgb2ZmID0+IHZvaWRcIiwgYW5pbWF0ZSg1MDApKVxuICogYGBgXG4gKlxuICogIyMjIFNwZWNpYWwgdmFsdWVzIGZvciBzdGF0ZS1jaGFuZ2UgZXhwcmVzc2lvbnNcbiAqXG4gKiAtIENhdGNoLWFsbCBzdGF0ZSBjaGFuZ2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBpbnNlcnRlZCBpbnRvIHRoZSBwYWdlIGFuZCB0aGVcbiAqIGRlc3RpbmF0aW9uIHN0YXRlIGlzIHVua25vd246XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogIGFuaW1hdGUoNTAwKVxuICogIF0pXG4gKiBgYGBcbiAqXG4gKiAtIENhcHR1cmUgYSBzdGF0ZSBjaGFuZ2UgYmV0d2VlbiBhbnkgc3RhdGVzOlxuICpcbiAqICBgdHJhbnNpdGlvbihcIiogPT4gKlwiLCBhbmltYXRlKFwiMXMgMHNcIikpYFxuICpcbiAqIC0gRW50cnkgYW5kIGV4aXQgdHJhbnNpdGlvbnM6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcIjplbnRlclwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgXSksXG4gKiB0cmFuc2l0aW9uKFwiOmxlYXZlXCIsIFtcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgXSlcbiAqIGBgYFxuICpcbiAqIC0gVXNlIGA6aW5jcmVtZW50YCBhbmQgYDpkZWNyZW1lbnRgIHRvIGluaXRpYXRlIHRyYW5zaXRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCI6aW5jcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICpcbiAqIHRyYW5zaXRpb24oXCI6ZGVjcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICogYGBgXG4gKlxuICogIyMjIFN0YXRlLWNoYW5nZSBmdW5jdGlvbnNcbiAqXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBgZnJvbVN0YXRlYCBzcGVjaWZpZWQgYXMgYSBzdGF0ZS1jaGFuZ2UgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGFuXG4gKiBhbmltYXRpb24gd2hlbiB0cnVlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oKGZyb21TdGF0ZSwgdG9TdGF0ZSkgPT5cbiAqICB7XG4gKiAgIHJldHVybiBmcm9tU3RhdGUgPT0gXCJvZmZcIiAmJiB0b1N0YXRlID09IFwib25cIjtcbiAqICB9LFxuICogIGFuaW1hdGUoXCIxcyAwc1wiKSlcbiAqIGBgYFxuICpcbiAqICMjIyBBbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlXG4gKlxuICogSWYgdGhlIGZpbmFsIHN0ZXAgaW4gYSB0cmFuc2l0aW9uIGlzIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB0aGF0IHVzZXMgYSB0aW1pbmcgdmFsdWVcbiAqIHdpdGggbm8gc3R5bGUgZGF0YSwgdGhhdCBzdGVwIGlzIGF1dG9tYXRpY2FsbHkgY29uc2lkZXJlZCB0aGUgZmluYWwgYW5pbWF0aW9uIGFyYyxcbiAqIGZvciB0aGUgZWxlbWVudCB0byByZWFjaCB0aGUgZmluYWwgc3RhdGUuIEFuZ3VsYXIgYXV0b21hdGljYWxseSBhZGRzIG9yIHJlbW92ZXNcbiAqIENTUyBzdHlsZXMgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGNvcnJlY3QgZmluYWwgc3RhdGUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSB0cmFuc2l0aW9uIHRoYXQgc3RhcnRzIGJ5IGhpZGluZyB0aGUgZWxlbWVudCxcbiAqIHRoZW4gbWFrZXMgc3VyZSB0aGF0IGl0IGFuaW1hdGVzIHByb3Blcmx5IHRvIHdoYXRldmVyIHN0YXRlIGlzIGN1cnJlbnRseSBhY3RpdmUgZm9yIHRyaWdnZXI6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDApXG4gKiAgXSlcbiAqIGBgYFxuICogIyMjIEJvb2xlYW4gdmFsdWUgbWF0Y2hpbmdcbiAqIElmIGEgdHJpZ2dlciBiaW5kaW5nIHZhbHVlIGlzIGEgQm9vbGVhbiwgaXQgY2FuIGJlIG1hdGNoZWQgdXNpbmcgYSB0cmFuc2l0aW9uIGV4cHJlc3Npb25cbiAqIHRoYXQgY29tcGFyZXMgdHJ1ZSBhbmQgZmFsc2Ugb3IgMSBhbmQgMC4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiAvLyBpbiB0aGUgdGVtcGxhdGVcbiAqIDxkaXYgW0BvcGVuQ2xvc2VdPVwib3BlbiA/IHRydWUgOiBmYWxzZVwiPi4uLjwvZGl2PlxuICogLy8gaW4gdGhlIGNvbXBvbmVudCBtZXRhZGF0YVxuICogdHJpZ2dlcignb3BlbkNsb3NlJywgW1xuICogICBzdGF0ZSgndHJ1ZScsIHN0eWxlKHsgaGVpZ2h0OiAnKicgfSkpLFxuICogICBzdGF0ZSgnZmFsc2UnLCBzdHlsZSh7IGhlaWdodDogJzBweCcgfSkpLFxuICogICB0cmFuc2l0aW9uKCdmYWxzZSA8PT4gdHJ1ZScsIGFuaW1hdGUoNTAwKSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNpdGlvbihcbiAgICBzdGF0ZUNoYW5nZUV4cHI6IHN0cmluZ3xcbiAgICAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKSxcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGwgPSBudWxsKTogQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbiwgZXhwcjogc3RhdGVDaGFuZ2VFeHByLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBQcm9kdWNlcyBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGNhbiBiZSBpbnZva2VkIGluIGFub3RoZXIgYW5pbWF0aW9uIG9yIHNlcXVlbmNlLFxuICogYnkgY2FsbGluZyB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMsIGFzIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZSgpYFxuICogb3IgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLCB0aGF0IGZvcm0gYSB0cmFuc2Zvcm1hdGlvbiBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICogQSBzZXF1ZW5jZSBpcyB1c2VkIGJ5IGRlZmF1bHQgd2hlbiB5b3UgcGFzcyBhbiBhcnJheS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZVxuICogYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogUHJvdmlkZWQgdmFsdWVzIGZvciBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXJlIHVzZWQgYXMgZGVmYXVsdHMsXG4gKiBhbmQgb3ZlcnJpZGUgdmFsdWVzIGNhbiBiZSBwYXNzZWQgdG8gdGhlIGNhbGxlciBvbiBpbnZvY2F0aW9uLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSByZXVzYWJsZSBhbmltYXRpb24sIHByb3ZpZGluZyBzb21lIGRlZmF1bHQgcGFyYW1ldGVyXG4gKiB2YWx1ZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIGZhZGVBbmltYXRpb24gPSBhbmltYXRpb24oW1xuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBzdGFydCB9fScgfSksXG4gKiAgIGFuaW1hdGUoJ3t7IHRpbWUgfX0nLFxuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBlbmQgfX0nfSkpXG4gKiAgIF0sXG4gKiAgIHsgcGFyYW1zOiB7IHRpbWU6ICcxMDAwbXMnLCBzdGFydDogMCwgZW5kOiAxIH19KTtcbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgaW52b2tlcyB0aGUgZGVmaW5lZCBhbmltYXRpb24gd2l0aCBhIGNhbGwgdG8gYHVzZUFuaW1hdGlvbigpYCxcbiAqIHBhc3NpbmcgaW4gb3ZlcnJpZGUgcGFyYW1ldGVyIHZhbHVlcy5cbiAqXG4gKiBgYGBqc1xuICogdXNlQW5pbWF0aW9uKGZhZGVBbmltYXRpb24sIHtcbiAqICAgcGFyYW1zOiB7XG4gKiAgICAgdGltZTogJzJzJyxcbiAqICAgICBzdGFydDogMSxcbiAqICAgICBlbmQ6IDBcbiAqICAgfVxuICogfSlcbiAqIGBgYFxuICpcbiAqIElmIGFueSBvZiB0aGUgcGFzc2VkLWluIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgZnJvbSB0aGlzIGNhbGwsXG4gKiB0aGUgZGVmYXVsdCB2YWx1ZXMgYXJlIHVzZWQuIElmIG9uZSBvciBtb3JlIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgYmVmb3JlIGEgc3RlcCBpc1xuICogYW5pbWF0ZWQsIGB1c2VBbmltYXRpb24oKWAgdGhyb3dzIGFuIGVycm9yLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGlvbihcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGwgPSBudWxsKTogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2UsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgcXVlcmllZCBpbm5lciBhbmltYXRpb24gZWxlbWVudCB3aXRoaW4gYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZVxuICogYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBvdmVycmlkZSB2YWx1ZXMgZm9yIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgY2hpbGQgYW5pbWF0aW9uIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEVhY2ggdGltZSBhbiBhbmltYXRpb24gaXMgdHJpZ2dlcmVkIGluIEFuZ3VsYXIsIHRoZSBwYXJlbnQgYW5pbWF0aW9uXG4gKiBoYXMgcHJpb3JpdHkgYW5kIGFueSBjaGlsZCBhbmltYXRpb25zIGFyZSBibG9ja2VkLiBJbiBvcmRlclxuICogZm9yIGEgY2hpbGQgYW5pbWF0aW9uIHRvIHJ1biwgdGhlIHBhcmVudCBhbmltYXRpb24gbXVzdCBxdWVyeSBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICogY29udGFpbmluZyBjaGlsZCBhbmltYXRpb25zLCBhbmQgcnVuIHRoZW0gdXNpbmcgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBmZWF0dXJlIGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgd2l0aCBgcXVlcnkoKWAgYW5kIGl0IHdpbGwgb25seSB3b3JrXG4gKiB3aXRoIGFuaW1hdGlvbnMgdGhhdCBhcmUgYXNzaWduZWQgdXNpbmcgdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIGxpYnJhcnkuIENTUyBrZXlmcmFtZXNcbiAqIGFuZCB0cmFuc2l0aW9ucyBhcmUgbm90IGhhbmRsZWQgYnkgdGhpcyBBUEkuXG4gKlxuICogYGFuaW1hdGVDaGlsZCgpYCBkb2VzIG5vdCBjdXJyZW50bHkgd29yayB3aXRoIHJvdXRlIHRyYW5zaXRpb24gYW5pbWF0aW9ucy4gUGxlYXNlIHNlZVxuICogR2l0SHViIElzc3VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zMDQ3NyAjMzA0Nzd9IGZvciBtb3JlXG4gKiBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlQ2hpbGQob3B0aW9uczogQW5pbWF0ZUNoaWxkT3B0aW9uc3xudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlQ2hpbGQsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIFN0YXJ0cyBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGlzIGNyZWF0ZWQgdXNpbmcgdGhlIGBhbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGFuaW1hdGlvbiBUaGUgcmV1c2FibGUgYW5pbWF0aW9uIHRvIHN0YXJ0LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2ZcbiAqIHRoZSBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIG92ZXJyaWRlIHZhbHVlcyBmb3IgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGFuaW1hdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuaW1hdGlvbihcbiAgICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEZpbmRzIG9uZSBvciBtb3JlIGlubmVyIGVsZW1lbnRzIHdpdGhpbiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgaXNcbiAqIGJlaW5nIGFuaW1hdGVkIHdpdGhpbiBhIHNlcXVlbmNlLiBVc2Ugd2l0aCBgYW5pbWF0ZSgpYC5cbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3IgVGhlIGVsZW1lbnQgdG8gcXVlcnksIG9yIGEgc2V0IG9mIGVsZW1lbnRzIHRoYXQgY29udGFpbiBBbmd1bGFyLXNwZWNpZmljXG4gKiBjaGFyYWN0ZXJpc3RpY3MsIHNwZWNpZmllZCB3aXRoIG9uZSBvciBtb3JlIG9mIHRoZSBmb2xsb3dpbmcgdG9rZW5zLlxuICogIC0gYHF1ZXJ5KFwiOmVudGVyXCIpYCBvciBgcXVlcnkoXCI6bGVhdmVcIilgIDogUXVlcnkgZm9yIG5ld2x5IGluc2VydGVkL3JlbW92ZWQgZWxlbWVudHMuXG4gKiAgLSBgcXVlcnkoXCI6YW5pbWF0aW5nXCIpYCA6IFF1ZXJ5IGFsbCBjdXJyZW50bHkgYW5pbWF0aW5nIGVsZW1lbnRzLlxuICogIC0gYHF1ZXJ5KFwiQHRyaWdnZXJOYW1lXCIpYCA6IFF1ZXJ5IGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlci5cbiAqICAtIGBxdWVyeShcIkAqXCIpYCA6IFF1ZXJ5IGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXJzLlxuICogIC0gYHF1ZXJ5KFwiOnNlbGZcIilgIDogSW5jbHVkZSB0aGUgY3VycmVudCBlbGVtZW50IGludG8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBAcGFyYW0gYW5pbWF0aW9uIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwcyB0byBhcHBseSB0byB0aGUgcXVlcmllZCBlbGVtZW50IG9yIGVsZW1lbnRzLlxuICogQW4gYXJyYXkgaXMgdHJlYXRlZCBhcyBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdC4gVXNlIHRoZSAnbGltaXQnIGZpZWxkIHRvIGxpbWl0IHRoZSB0b3RhbCBudW1iZXIgb2ZcbiAqIGl0ZW1zIHRvIGNvbGxlY3QuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgcXVlcnkgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVG9rZW5zIGNhbiBiZSBtZXJnZWQgaW50byBhIGNvbWJpbmVkIHF1ZXJ5IHNlbGVjdG9yIHN0cmluZy4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogIHF1ZXJ5KCc6c2VsZiwgLnJlY29yZDplbnRlciwgLnJlY29yZDpsZWF2ZSwgQHN1YlRyaWdnZXInLCBbLi4uXSlcbiAqIGBgYFxuICpcbiAqIFRoZSBgcXVlcnkoKWAgZnVuY3Rpb24gY29sbGVjdHMgbXVsdGlwbGUgZWxlbWVudHMgYW5kIHdvcmtzIGludGVybmFsbHkgYnkgdXNpbmdcbiAqIGBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGxgLiBVc2UgdGhlIGBsaW1pdGAgZmllbGQgb2YgYW4gb3B0aW9ucyBvYmplY3QgdG8gbGltaXRcbiAqIHRoZSB0b3RhbCBudW1iZXIgb2YgaXRlbXMgdG8gYmUgY29sbGVjdGVkLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogcXVlcnkoJ2RpdicsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgbGltaXQ6IDEgfSlcbiAqIGBgYFxuICpcbiAqIEJ5IGRlZmF1bHQsIHRocm93cyBhbiBlcnJvciB3aGVuIHplcm8gaXRlbXMgYXJlIGZvdW5kLiBTZXQgdGhlXG4gKiBgb3B0aW9uYWxgIGZsYWcgdG8gaWdub3JlIHRoaXMgZXJyb3IuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnLnNvbWUtZWxlbWVudC10aGF0LW1heS1ub3QtYmUtdGhlcmUnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IG9wdGlvbmFsOiB0cnVlIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNhZ2UgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBxdWVyaWVzIGZvciBpbm5lciBlbGVtZW50cyBhbmQgYW5pbWF0ZXMgdGhlbVxuICogaW5kaXZpZHVhbGx5IHVzaW5nIGBhbmltYXRlKClgLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2lubmVyJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtAcXVlcnlBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICA8aDE+VGl0bGU8L2gxPlxuICogICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAqICAgICAgICAgQmxhaCBibGFoIGJsYWhcbiAqICAgICAgIDwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICB0cmlnZ2VyKCdxdWVyeUFuaW1hdGlvbicsIFtcbiAqICAgICAgdHJhbnNpdGlvbignKiA9PiBnb0FuaW1hdGUnLCBbXG4gKiAgICAgICAgLy8gaGlkZSB0aGUgaW5uZXIgZWxlbWVudHNcbiAqICAgICAgICBxdWVyeSgnaDEnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICAgICAgIHF1ZXJ5KCcuY29udGVudCcsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKlxuICogICAgICAgIC8vIGFuaW1hdGUgdGhlIGlubmVyIGVsZW1lbnRzIGluLCBvbmUgYnkgb25lXG4gKiAgICAgICAgcXVlcnkoJ2gxJywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpKSxcbiAqICAgICAgICBxdWVyeSgnLmNvbnRlbnQnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcXVlcnkoXG4gICAgc2VsZWN0b3I6IHN0cmluZywgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9uc3xudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogVXNlIHdpdGhpbiBhbiBhbmltYXRpb24gYHF1ZXJ5KClgIGNhbGwgdG8gaXNzdWUgYSB0aW1pbmcgZ2FwIGFmdGVyXG4gKiBlYWNoIHF1ZXJpZWQgaXRlbSBpcyBhbmltYXRlZC5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBBIGRlbGF5IHZhbHVlLlxuICogQHBhcmFtIGFuaW1hdGlvbiBPbmUgb3JlIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdGFnZ2VyIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYSBjb250YWluZXIgZWxlbWVudCB3cmFwcyBhIGxpc3Qgb2YgaXRlbXMgc3RhbXBlZCBvdXRcbiAqIGJ5IGFuIGBuZ0ZvcmAuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogRWFjaCB0aW1lIGl0ZW1zIGFyZSBhZGRlZCwgdGhlIG9wYWNpdHkgZmFkZS1pbiBhbmltYXRpb24gcnVucyxcbiAqIGFuZCBlYWNoIHJlbW92ZWQgaXRlbSBpcyBmYWRlZCBvdXQuXG4gKiBXaGVuIGVpdGhlciBvZiB0aGVzZSBhbmltYXRpb25zIG9jY3VyLCB0aGUgc3RhZ2dlciBlZmZlY3QgaXNcbiAqIGFwcGxpZWQgYWZ0ZXIgZWFjaCBpdGVtJ3MgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEhlcmUgaXMgdGhlIGNvbXBvbmVudCBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgc3R5bGUsIGFuaW1hdGUsIHF1ZXJ5LCBzdGFnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICB0ZW1wbGF0ZVVybDogJ2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgICAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgIH1cbiAqICB9XG4gKiBgYGBcbiAqXG4gKiBIZXJlIGlzIHRoZSBhbmltYXRpb24gdHJpZ2dlciBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2dlcih0aW1pbmdzOiBzdHJpbmd8bnVtYmVyLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW10pOlxuICAgIEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsIHRpbWluZ3MsIGFuaW1hdGlvbn07XG59XG4iXX0=