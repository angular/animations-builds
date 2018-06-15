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
 * Compare this to the `group()` call, which runs animation steps in parallel.
 *
 * When a sequence is used within a `group()` or a `transition()` call,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQWtKSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUF5UDlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtSkc7QUFDSCxNQUFNLGtCQUFrQixJQUFZLEVBQUUsV0FBZ0M7SUFDcEUsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLE1BQUEsRUFBRSxXQUFXLGFBQUEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDL0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdURHO0FBQ0gsTUFBTSxrQkFDRixPQUF3QixFQUFFLE1BQ1g7SUFEVyx1QkFBQSxFQUFBLGFBQ1g7SUFDakIsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxNQUFNLFFBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0gsTUFBTSxnQkFDRixLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDckUsTUFBTSxDQUFDLEVBQUMsSUFBSSxlQUE2QixFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUE4Qkk7QUFDSixNQUFNLG1CQUFtQixLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFFMUYsTUFBTSxDQUFDLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLE9BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXFDSTtBQUNKLE1BQU0sZ0JBQ0YsTUFDMkM7SUFDN0MsTUFBTSxDQUFDLEVBQUMsSUFBSSxlQUE2QixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzNFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEwQkk7QUFDSixNQUFNLGdCQUNGLElBQVksRUFBRSxNQUE4QixFQUM1QyxPQUF5QztJQUMzQyxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsSUFBSSxNQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNILE1BQU0sb0JBQW9CLEtBQStCO0lBQ3ZELE1BQU0sQ0FBQyxFQUFDLElBQUksbUJBQWlDLEVBQUUsS0FBSyxPQUFBLEVBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXFLSTtBQUNKLE1BQU0scUJBQ0YsZUFDc0UsRUFDdEUsS0FBOEMsRUFDOUMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxNQUFNLENBQUMsRUFBQyxJQUFJLG9CQUFrQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3BHLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMENHO0FBQ0gsTUFBTSxvQkFDRixLQUE4QyxFQUM5QyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUksbUJBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sdUJBQXVCLE9BQTBDO0lBQTFDLHdCQUFBLEVBQUEsY0FBMEM7SUFFckUsTUFBTSxDQUFDLEVBQUMsSUFBSSxzQkFBb0MsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSx1QkFDRixTQUFxQyxFQUNyQyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUkscUJBQWtDLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9GRztBQUNILE1BQU0sZ0JBQ0YsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxPQUE0QztJQUE1Qyx3QkFBQSxFQUFBLGNBQTRDO0lBQzlDLE1BQU0sQ0FBQyxFQUFDLElBQUksZ0JBQTZCLEVBQUUsUUFBUSxVQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkVHO0FBQ0gsTUFBTSxrQkFDRixPQUF3QixFQUN4QixTQUFrRDtJQUNwRCxNQUFNLENBQUMsRUFBQyxJQUFJLGtCQUErQixFQUFFLE9BQU8sU0FBQSxFQUFFLFNBQVMsV0FBQSxFQUFDLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2V0IG9mIENTUyBzdHlsZXMgZm9yIHVzZSBpbiBhbiBhbmltYXRpb24gc3R5bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgybVTdHlsZURhdGEgeyBba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyOyB9XG5cbi8qKlxuKiBSZXByZXNlbnRzIGFuaW1hdGlvbi1zdGVwIHRpbWluZyBwYXJhbWV0ZXJzIGZvciBhbiBhbmltYXRpb24gc3RlcC4gIFxuKiBAc2VlIGBhbmltYXRlKClgXG4qL1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBBbmltYXRlVGltaW5ncyA9IHtcbiAgLyoqXG4gICAqIFRoZSBmdWxsIGR1cmF0aW9uIG9mIGFuIGFuaW1hdGlvbiBzdGVwLiBBIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LFxuICAgKiBzdWNoIGFzIFwiMXNcIiBvciBcIjEwbXNcIiBmb3Igb25lIHNlY29uZCBhbmQgMTAgbWlsbGlzZWNvbmRzLCByZXNwZWN0aXZlbHkuXG4gICAqIFRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgZHVyYXRpb246IG51bWJlcixcbiAgLyoqXG4gICAqIFRoZSBkZWxheSBpbiBhcHBseWluZyBhbiBhbmltYXRpb24gc3RlcC4gQSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdC5cbiAgICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBkZWxheTogbnVtYmVyLFxuICAvKipcbiAgICogQW4gZWFzaW5nIHN0eWxlIHRoYXQgY29udHJvbHMgaG93IGFuIGFuaW1hdGlvbnMgc3RlcCBhY2NlbGVyYXRlc1xuICAgKiBhbmQgZGVjZWxlcmF0ZXMgZHVyaW5nIGl0cyBydW4gdGltZS4gQW4gZWFzaW5nIGZ1bmN0aW9uIHN1Y2ggYXMgYGN1YmljLWJlemllcigpYCxcbiAgICogb3Igb25lIG9mIHRoZSBmb2xsb3dpbmcgY29uc3RhbnRzOlxuICAgKiAtIGBlYXNlLWluYFxuICAgKiAtIGBlYXNlLW91dGBcbiAgICogLSBgZWFzZS1pbi1hbmQtb3V0YFxuICAgKi9cbiAgZWFzaW5nOiBzdHJpbmcgfCBudWxsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBPcHRpb25zIHRoYXQgY29udHJvbCBhbmltYXRpb24gc3R5bGluZyBhbmQgdGltaW5nLlxuICogVGhlIGZvbGxvd2luZyBhbmltYXRpb24gZnVuY3Rpb25zIGFjY2VwdCBgQW5pbWF0aW9uT3B0aW9uc2AgZGF0YTpcbiAqXG4gKiAtIGB0cmFuc2l0aW9uKClgXG4gKiAtIGBzZXF1ZW5jZSgpYFxuICogLSBgZ3JvdXAoKWBcbiAqIC0gYHF1ZXJ5KClgXG4gKiAtIGBhbmltYXRpb24oKWBcbiAqIC0gYHVzZUFuaW1hdGlvbigpYFxuICogLSBgYW5pbWF0ZUNoaWxkKClgXG4gKlxuICogUHJvZ3JhbW1hdGljIGFuaW1hdGlvbnMgYnVpbHQgdXNpbmcgdGhlIGBBbmltYXRpb25CdWlsZGVyYCBzZXJ2aWNlIGFsc29cbiAqIG1ha2UgdXNlIG9mIGBBbmltYXRpb25PcHRpb25zYC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogU2V0cyBhIHRpbWUtZGVsYXkgZm9yIGluaXRpYXRpbmcgYW4gYW5pbWF0aW9uIGFjdGlvbi5cbiAgICogQSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdCwgc3VjaCBhcyBcIjFzXCIgb3IgXCIxMG1zXCIgZm9yIG9uZSBzZWNvbmRcbiAgICogYW5kIDEwIG1pbGxpc2Vjb25kcywgcmVzcGVjdGl2ZWx5LlRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICAgKiBEZWZhdWx0IHZhbHVlIGlzIDAsIG1lYW5pbmcgbm8gZGVsYXkuXG4gICAqL1xuICBkZWxheT86IG51bWJlcnxzdHJpbmc7XG4gIC8qKlxuICAqIEEgc2V0IG9mIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBtb2RpZnkgc3R5bGluZyBhbmQgdGltaW5nXG4gICogd2hlbiBhbiBhbmltYXRpb24gYWN0aW9uIHN0YXJ0cy4gQW4gYXJyYXkgb2Yga2V5LXZhbHVlIHBhaXJzLCB3aGVyZSB0aGUgcHJvdmlkZWQgdmFsdWVcbiAgKiBpcyB1c2VkIGFzIGEgZGVmYXVsdC5cbiAgKi9cbiAgcGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9O1xufVxuXG4vKipcbiAqIEFkZHMgZHVyYXRpb24gb3B0aW9ucyB0byBjb250cm9sIGFuaW1hdGlvbiBzdHlsaW5nIGFuZCB0aW1pbmcgZm9yIGEgY2hpbGQgYW5pbWF0aW9uLlxuICpcbiAqIEBzZWUgYGFuaW1hdGVDaGlsZCgpYFxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0ZUNoaWxkT3B0aW9ucyBleHRlbmRzIEFuaW1hdGlvbk9wdGlvbnMgeyBkdXJhdGlvbj86IG51bWJlcnxzdHJpbmc7IH1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ29uc3RhbnRzIGZvciB0aGUgY2F0ZWdvcmllcyBvZiBwYXJhbWV0ZXJzIHRoYXQgY2FuIGJlIGRlZmluZWQgZm9yIGFuaW1hdGlvbnMuXG4gKlxuICogQSBjb3JyZXNwb25kaW5nIGZ1bmN0aW9uIGRlZmluZXMgYSBzZXQgb2YgcGFyYW1ldGVycyBmb3IgZWFjaCBjYXRlZ29yeSwgYW5kXG4gKiBjb2xsZWN0cyB0aGVtIGludG8gYSBjb3JyZXNwb25kaW5nIGBBbmltYXRpb25NZXRhZGF0YWAgb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3QgZW51bSBBbmltYXRpb25NZXRhZGF0YVR5cGUge1xuICAvKipcbiAgICogQXNzb2NpYXRlcyBhIG5hbWVkIGFuaW1hdGlvbiBzdGF0ZSB3aXRoIGEgc2V0IG9mIENTUyBzdHlsZXMuXG4gICAqIFNlZSBgc3RhdGUoKWBcbiAgICovXG4gIFN0YXRlID0gMCxcbiAgLyoqXG4gICAqIERhdGEgZm9yIGEgdHJhbnNpdGlvbiBmcm9tIG9uZSBhbmltYXRpb24gc3RhdGUgdG8gYW5vdGhlci5cbiAgICogU2VlIGB0cmFuc2l0aW9uKClgXG4gICAqL1xuICBUcmFuc2l0aW9uID0gMSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGBzZXF1ZW5jZSgpYFxuICAgKi9cbiAgU2VxdWVuY2UgPSAyLFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKiBTZWUgYGdyb3VwKClgXG4gICAqL1xuICBHcm91cCA9IDMsXG4gIC8qKlxuICAgKiBDb250YWlucyBhbiBhbmltYXRpb24gc3RlcC5cbiAgICogU2VlIGBhbmltYXRlKClgXG4gICAqL1xuICBBbmltYXRlID0gNCxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGBrZXlmcmFtZXMoKWBcbiAgICovXG4gIEtleWZyYW1lcyA9IDUsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBDU1MgcHJvcGVydHktdmFsdWUgcGFpcnMgaW50byBhIG5hbWVkIHN0eWxlLlxuICAgKiBTZWUgYHN0eWxlKClgXG4gICAqL1xuICBTdHlsZSA9IDYsXG4gIC8qKlxuICAgKiBBc3NvY2lhdGVzIGFuIGFuaW1hdGlvbiB3aXRoIGFuIGVudHJ5IHRyaWdnZXIgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gZWxlbWVudC5cbiAgICogU2VlIGB0cmlnZ2VyKClgXG4gICAqL1xuICBUcmlnZ2VyID0gNyxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgcmUtdXNhYmxlIGFuaW1hdGlvbi5cbiAgICogU2VlIGBhbmltYXRpb24oKWBcbiAgICovXG4gIFJlZmVyZW5jZSA9IDgsXG4gIC8qKlxuICAgKiBDb250YWlucyBkYXRhIHRvIHVzZSBpbiBleGVjdXRpbmcgY2hpbGQgYW5pbWF0aW9ucyByZXR1cm5lZCBieSBhIHF1ZXJ5LlxuICAgKiBTZWUgYGFuaW1hdGVDaGlsZCgpYFxuICAgKi9cbiAgQW5pbWF0ZUNoaWxkID0gOSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGFuaW1hdGlvbiBwYXJhbWV0ZXJzIGZvciBhIHJlLXVzYWJsZSBhbmltYXRpb24uXG4gICAqIFNlZSBgdXNlQW5pbWF0aW9uKClgXG4gICAqL1xuICBBbmltYXRlUmVmID0gMTAsXG4gIC8qKlxuICAgKiBDb250YWlucyBjaGlsZC1hbmltYXRpb24gcXVlcnkgZGF0YS5cbiAgICogU2VlIGBxdWVyeSgpYFxuICAgKi9cbiAgUXVlcnkgPSAxMSxcbiAgLyoqXG4gICAqIENvbnRhaW5zIGRhdGEgZm9yIHN0YWdnZXJpbmcgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICAgKiBTZWUgYHN0YWdnZXIoKWBcbiAgICovXG4gIFN0YWdnZXIgPSAxMlxufVxuXG4vKipcbiAqIFNwZWNpZmllcyBhdXRvbWF0aWMgc3R5bGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IEFVVE9fU1RZTEUgPSAnKic7XG5cbi8qKlxuICogQmFzZSBmb3IgYW5pbWF0aW9uIGRhdGEgc3RydWN0dXJlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25NZXRhZGF0YSB7IHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZTsgfVxuXG4vKipcbiAqIENvbnRhaW5zIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZVxuICogYHRyaWdnZXIoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICAqIFRoZSB0cmlnZ2VyIG5hbWUsIHVzZWQgdG8gYXNzb2NpYXRlIGl0IHdpdGggYW4gZWxlbWVudC4gVW5pcXVlIHdpdGhpbiB0aGUgY29tcG9uZW50LlxuICAgICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdCwgY29udGFpbmluZyBhbiBhcnJheSBvZiBzdGF0ZSBhbmQgdHJhbnNpdGlvbiBkZWNsYXJhdGlvbnMuXG4gICAqL1xuICBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczoge3BhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fX18bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0YXRlIGJ5IGFzc29jaWF0aW5nIGEgc3RhdGUgbmFtZSB3aXRoIGEgc2V0IG9mIENTUyBzdHlsZXMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc3RhdGUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBzdGF0ZSBuYW1lLCB1bmlxdWUgd2l0aGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiAgVGhlIENTUyBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc3RhdGUuXG4gICAqL1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGE7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gICAqL1xuICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fTtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHRyYW5zaXRpb24uIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlXG4gKiBgdHJhbnNpdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHRoYXQgZGVzY3JpYmVzIGEgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgZXhwcjogc3RyaW5nfFxuICAgICAgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbik7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cyB0byB3aGljaCB0aGlzIHRyYW5zaXRpb24gYXBwbGllcy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIHJldXNhYmxlIGFuaW1hdGlvbiwgd2hpY2ggaXMgYSBjb2xsZWN0aW9uIG9mIGluZGl2aWR1YWwgYW5pbWF0aW9uIHN0ZXBzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGlvbigpYCBmdW5jdGlvbiwgYW5kXG4gKiBwYXNzZWQgdG8gdGhlIGB1c2VBbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gcXVlcnkuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBgcXVlcnkoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqICBUaGUgQ1NTIHNlbGVjdG9yIGZvciB0aGlzIHF1ZXJ5LlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBIHF1ZXJ5IG9wdGlvbnMgb2JqZWN0LlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uUXVlcnlPcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEga2V5ZnJhbWVzIHNlcXVlbmNlLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYGtleWZyYW1lcygpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0eWxlcy5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW107XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzdHlsZS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBzdHlsZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHlsZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQSBzZXQgb2YgQ1NTIHN0eWxlIHByb3BlcnRpZXMuXG4gICAqL1xuICBzdHlsZXM6ICcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXxBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXwnKic+O1xuICAvKipcbiAgICogQSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRlIHRpbWUgYXQgd2hpY2ggdGhlIHN0eWxlIGlzIHRvIGJlIGFwcGxpZWQuXG4gICAqL1xuICBvZmZzZXQ6IG51bWJlcnxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3RlcC4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBhbmltYXRlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1pbmcgZGF0YSBmb3IgdGhlIHN0ZXAuXG4gICAqL1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyfEFuaW1hdGVUaW1pbmdzO1xuICAvKipcbiAgICogQSBzZXQgb2Ygc3R5bGVzIHVzZWQgaW4gdGhlIHN0ZXAuXG4gICAqL1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGF8QW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YXxudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIGNoaWxkIGFuaW1hdGlvbiwgdGhhdCBjYW4gYmUgcnVuIGV4cGxpY2l0bHkgd2hlbiB0aGUgcGFyZW50IGlzIHJ1bi5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlQ2hpbGRgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHVzZUFuaW1hdGlvbigpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBBbiBhbmltYXRpb24gcmVmZXJlbmNlIG9iamVjdC5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGE7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHNlcXVlbmNlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBncm91cC5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBncm91cCgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25Hcm91cE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9yIHN0eWxlIHN0ZXBzIHRoYXQgZm9ybSB0aGlzIGdyb3VwLlxuICAgKi9cbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW5pbWF0aW9uIHF1ZXJ5IG9wdGlvbnMuXG4gKiBQYXNzZWQgdG8gdGhlIGBxdWVyeSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyBleHRlbmRzIEFuaW1hdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogVHJ1ZSBpZiB0aGlzIHF1ZXJ5IGlzIG9wdGlvbmFsLCBmYWxzZSBpZiBpdCBpcyByZXF1aXJlZC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICogQSByZXF1aXJlZCBxdWVyeSB0aHJvd3MgYW4gZXJyb3IgaWYgbm8gZWxlbWVudHMgYXJlIHJldHJpZXZlZCB3aGVuXG4gICAqIHRoZSBxdWVyeSBpcyBleGVjdXRlZC4gQW4gb3B0aW9uYWwgcXVlcnkgZG9lcyBub3QuXG4gICAqXG4gICAqL1xuICBvcHRpb25hbD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBIG1heGltdW0gdG90YWwgbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuIGZyb20gdGhlIHF1ZXJ5LlxuICAgKiBJZiBuZWdhdGl2ZSwgcmVzdWx0cyBhcmUgbGltaXRlZCBmcm9tIHRoZSBlbmQgb2YgdGhlIHF1ZXJ5IGxpc3QgdG93YXJkcyB0aGUgYmVnaW5uaW5nLlxuICAgKiBCeSBkZWZhdWx0LCByZXN1bHRzIGFyZSBub3QgbGltaXRlZC5cbiAgICovXG4gIGxpbWl0PzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBwYXJhbWV0ZXJzIGZvciBzdGFnZ2VyaW5nIHRoZSBzdGFydCB0aW1lcyBvZiBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgc3RhZ2dlcigpYCBmdW5jdGlvbi5cbiAqKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIHRpbWluZyBkYXRhIGZvciB0aGUgc3RlcHMuXG4gICAqL1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyO1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuYW1lZCBhbmltYXRpb24gdHJpZ2dlciwgY29udGFpbmluZyBhICBsaXN0IG9mIGBzdGF0ZSgpYFxuICogYW5kIGB0cmFuc2l0aW9uKClgIGVudHJpZXMgdG8gYmUgZXZhbHVhdGVkIHdoZW4gdGhlIGV4cHJlc3Npb25cbiAqIGJvdW5kIHRvIHRoZSB0cmlnZ2VyIGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIG5hbWUgQW4gaWRlbnRpZnlpbmcgc3RyaW5nLlxuICogQHBhcmFtIGRlZmluaXRpb25zICBBbiBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QsIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgYHN0YXRlKClgXG4gKiBhbmQgYHRyYW5zaXRpb24oKWAgZGVjbGFyYXRpb25zLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSB0cmlnZ2VyIGRhdGEuXG4gKiBcbiAqIEB1c2FnZU5vdGVzXG4gKiBEZWZpbmUgYW4gYW5pbWF0aW9uIHRyaWdnZXIgaW4gdGhlIGBhbmltYXRpb25zYCBzZWN0aW9uIG9mIGBAQ29tcG9uZW50YCBtZXRhZGF0YS5cbiAqIEluIHRoZSB0ZW1wbGF0ZSwgcmVmZXJlbmNlIHRoZSB0cmlnZ2VyIGJ5IG5hbWUgYW5kIGJpbmQgaXQgdG8gYSB0cmlnZ2VyIGV4cHJlc3Npb24gdGhhdFxuICogZXZhbHVhdGVzIHRvIGEgZGVmaW5lZCBhbmltYXRpb24gc3RhdGUsIHVzaW5nIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICpcbiAqIGBbQHRyaWdnZXJOYW1lXT1cImV4cHJlc3Npb25cImBcbiAqXG4gKiBBbmltYXRpb24gdHJpZ2dlciBiaW5kaW5ncyBjb252ZXJ0IGFsbCB2YWx1ZXMgdG8gc3RyaW5ncywgYW5kIHRoZW4gbWF0Y2ggdGhlIFxuICogcHJldmlvdXMgYW5kIGN1cnJlbnQgdmFsdWVzIGFnYWluc3QgYW55IGxpbmtlZCB0cmFuc2l0aW9ucy5cbiAqIEJvb2xlYW5zIGNhbiBiZSBzcGVjaWZpZWQgYXMgYDFgIG9yIGB0cnVlYCBhbmQgYDBgIG9yIGBmYWxzZWAuXG4gKlxuICogIyMjIFVzYWdlIEV4YW1wbGVcbiAqIFxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgcmVmZXJlbmNlIGJhc2VkIG9uIHRoZSBwcm92aWRlZFxuICogbmFtZSB2YWx1ZS5cbiAqIFRoZSBwcm92aWRlZCBhbmltYXRpb24gdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXkgY29uc2lzdGluZyBvZiBzdGF0ZSBhbmRcbiAqIHRyYW5zaXRpb24gZGVjbGFyYXRpb25zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogXCJteS1jb21wb25lbnRcIixcbiAqICAgdGVtcGxhdGVVcmw6IFwibXktY29tcG9uZW50LXRwbC5odG1sXCIsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwibXlBbmltYXRpb25UcmlnZ2VyXCIsIFtcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInNvbWV0aGluZ1wiO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbXBvbmVudCBtYWtlcyB1c2Ugb2YgdGhlIGRlZmluZWQgdHJpZ2dlclxuICogYnkgYmluZGluZyB0byBhbiBlbGVtZW50IHdpdGhpbiBpdHMgdGVtcGxhdGUgY29kZS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIHNvbWV3aGVyZSBpbnNpZGUgb2YgbXktY29tcG9uZW50LXRwbC5odG1sIC0tPlxuICogPGRpdiBbQG15QW5pbWF0aW9uVHJpZ2dlcl09XCJteVN0YXR1c0V4cFwiPi4uLjwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIGFuIGlubGluZSBmdW5jdGlvblxuICogVGhlIGB0cmFuc2l0aW9uYCBhbmltYXRpb24gbWV0aG9kIGFsc28gc3VwcG9ydHMgcmVhZGluZyBhbiBpbmxpbmUgZnVuY3Rpb24gd2hpY2ggY2FuIGRlY2lkZVxuICogaWYgaXRzIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHNob3VsZCBiZSBydW4uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhpcyBtZXRob2QgaXMgcnVuIGVhY2ggdGltZSB0aGUgYG15QW5pbWF0aW9uVHJpZ2dlcmAgdHJpZ2dlciB2YWx1ZSBjaGFuZ2VzLlxuICogZnVuY3Rpb24gbXlJbmxpbmVNYXRjaGVyRm4oZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OlxuIHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAqICAgLy8gbm90aWNlIHRoYXQgYGVsZW1lbnRgIGFuZCBgcGFyYW1zYCBhcmUgYWxzbyBhdmFpbGFibGUgaGVyZVxuICogICByZXR1cm4gdG9TdGF0ZSA9PSAneWVzLXBsZWFzZS1hbmltYXRlJztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215LWNvbXBvbmVudC10cGwuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdteUFuaW1hdGlvblRyaWdnZXInLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKG15SW5saW5lTWF0Y2hlckZuLCBbXG4gKiAgICAgICAgIC8vIHRoZSBhbmltYXRpb24gc2VxdWVuY2UgY29kZVxuICogICAgICAgXSksXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInllcy1wbGVhc2UtYW5pbWF0ZVwiO1xuICogfVxuICogYGBgXG4gKlxuICogIyMjIERpc2FibGluZyBBbmltYXRpb25zXG4gKiBXaGVuIHRydWUsIHRoZSBzcGVjaWFsIGFuaW1hdGlvbiBjb250cm9sIGJpbmRpbmcgYEAuZGlzYWJsZWRgIGJpbmRpbmcgcHJldmVudHMgXG4gKiBhbGwgYW5pbWF0aW9ucyBmcm9tIHJlbmRlcmluZy5cbiAqIFBsYWNlIHRoZSAgYEAuZGlzYWJsZWRgIGJpbmRpbmcgb24gYW4gZWxlbWVudCB0byBkaXNhYmxlXG4gKiBhbmltYXRpb25zIG9uIHRoZSBlbGVtZW50IGl0c2VsZiwgYXMgd2VsbCBhcyBhbnkgaW5uZXIgYW5pbWF0aW9uIHRyaWdnZXJzXG4gKiB3aXRoaW4gdGhlIGVsZW1lbnQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byB1c2UgdGhpcyBmZWF0dXJlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdiBbQC5kaXNhYmxlZF09XCJpc0Rpc2FibGVkXCI+XG4gKiAgICAgICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwiY2hpbGRBbmltYXRpb25cIiwgW1xuICogICAgICAgLy8gLi4uXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgaXNEaXNhYmxlZCA9IHRydWU7XG4gKiAgIGV4cCA9ICcuLi4nO1xuICogfVxuICogYGBgXG4gKlxuICogV2hlbiBgQC5kaXNhYmxlZGAgaXMgdHJ1ZSwgaXQgcHJldmVudHMgdGhlIGBAY2hpbGRBbmltYXRpb25gIHRyaWdnZXIgZnJvbSBhbmltYXRpbmcsXG4gKiBhbG9uZyB3aXRoIGFueSBpbm5lciBhbmltYXRpb25zLlxuICpcbiAqICMjIyBEaXNhYmxlIGFuaW1hdGlvbnMgYXBwbGljYXRpb24td2lkZVxuICogV2hlbiBhbiBhcmVhIG9mIHRoZSB0ZW1wbGF0ZSBpcyBzZXQgdG8gaGF2ZSBhbmltYXRpb25zIGRpc2FibGVkLCBcbiAqICoqYWxsKiogaW5uZXIgY29tcG9uZW50cyBoYXZlIHRoZWlyIGFuaW1hdGlvbnMgZGlzYWJsZWQgYXMgd2VsbC5cbiAqIFRoaXMgbWVhbnMgdGhhdCB5b3UgY2FuIGRpc2FibGUgYWxsIGFuaW1hdGlvbnMgZm9yIGFuIGFwcFxuICogYnkgcGxhY2luZyBhIGhvc3QgYmluZGluZyBzZXQgb24gYEAuZGlzYWJsZWRgIG9uIHRoZSB0b3Btb3N0IEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBIb3N0QmluZGluZ30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwLWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJyxcbiAqIH0pXG4gKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ0AuZGlzYWJsZWQnKVxuICogICBwdWJsaWMgYW5pbWF0aW9uc0Rpc2FibGVkID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBPdmVycmlkaW5nIGRpc2FibGVtZW50IG9mIGlubmVyIGFuaW1hdGlvbnNcbiAqIERlc3BpdGUgaW5uZXIgYW5pbWF0aW9ucyBiZWluZyBkaXNhYmxlZCwgYSBwYXJlbnQgYW5pbWF0aW9uIGNhbiBgcXVlcnkoKWBcbiAqIGZvciBpbm5lciBlbGVtZW50cyBsb2NhdGVkIGluIGRpc2FibGVkIGFyZWFzIG9mIHRoZSB0ZW1wbGF0ZSBhbmQgc3RpbGwgYW5pbWF0ZSBcbiAqIHRoZW0gaWYgbmVlZGVkLiBUaGlzIGlzIGFsc28gdGhlIGNhc2UgZm9yIHdoZW4gYSBzdWIgYW5pbWF0aW9uIGlzIFxuICogcXVlcmllZCBieSBhIHBhcmVudCBhbmQgdGhlbiBsYXRlciBhbmltYXRlZCB1c2luZyBgYW5pbWF0ZUNoaWxkKClgLlxuICpcbiAqICMjIyBEZXRlY3Rpbmcgd2hlbiBhbiBhbmltYXRpb24gaXMgZGlzYWJsZWRcbiAqIElmIGEgcmVnaW9uIG9mIHRoZSBET00gKG9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb24pIGhhcyBpdHMgYW5pbWF0aW9ucyBkaXNhYmxlZCwgdGhlIGFuaW1hdGlvblxuICogdHJpZ2dlciBjYWxsYmFja3Mgc3RpbGwgZmlyZSwgYnV0IGZvciB6ZXJvIHNlY29uZHMuIFdoZW4gdGhlIGNhbGxiYWNrIGZpcmVzLCBpdCBwcm92aWRlc1xuICogYW4gaW5zdGFuY2Ugb2YgYW4gYEFuaW1hdGlvbkV2ZW50YC4gSWYgYW5pbWF0aW9ucyBhcmUgZGlzYWJsZWQsXG4gKiB0aGUgYC5kaXNhYmxlZGAgZmxhZyBvbiB0aGUgZXZlbnQgaXMgdHJ1ZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXIobmFtZTogc3RyaW5nLCBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyaWdnZXIsIG5hbWUsIGRlZmluaXRpb25zLCBvcHRpb25zOiB7fX07XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IGNvbWJpbmVzIHN0eWxpbmcgaW5mb3JtYXRpb24gd2l0aCB0aW1pbmcgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIHRpbWluZ3MgU2V0cyBgQW5pbWF0ZVRpbWluZ3NgIGZvciB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIEEgc3RyaW5nIGluIHRoZSBmb3JtYXQgXCJkdXJhdGlvbiBbZGVsYXldIFtlYXNpbmddXCIuXG4gKiAgLSBEdXJhdGlvbiBhbmQgZGVsYXkgYXJlIGV4cHJlc3NlZCBhcyBhIG51bWJlciBhbmQgb3B0aW9uYWwgdGltZSB1bml0LFxuICogc3VjaCBhcyBcIjFzXCIgb3IgXCIxMG1zXCIgZm9yIG9uZSBzZWNvbmQgYW5kIDEwIG1pbGxpc2Vjb25kcywgcmVzcGVjdGl2ZWx5LlxuICogVGhlIGRlZmF1bHQgdW5pdCBpcyBtaWxsaXNlY29uZHMuXG4gKiAgLSBUaGUgZWFzaW5nIHZhbHVlIGNvbnRyb2xzIGhvdyB0aGUgYW5pbWF0aW9uIGFjY2VsZXJhdGVzIGFuZCBkZWNlbGVyYXRlc1xuICogZHVyaW5nIGl0cyBydW50aW1lLiBWYWx1ZSBpcyBvbmUgb2YgIGBlYXNlYCwgYGVhc2UtaW5gLCBgZWFzZS1vdXRgLFxuICogYGVhc2UtaW4tb3V0YCwgb3IgYSBgY3ViaWMtYmV6aWVyKClgIGZ1bmN0aW9uIGNhbGwuXG4gKiBJZiBub3Qgc3VwcGxpZWQsIG5vIGVhc2luZyBpcyBhcHBsaWVkLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgc3RyaW5nIFwiMXMgMTAwbXMgZWFzZS1vdXRcIiBzcGVjaWZpZXMgYSBkdXJhdGlvbiBvZlxuICogMTAwMCBtaWxsaXNlY29uZHMsIGFuZCBkZWxheSBvZiAxMDAgbXMsIGFuZCB0aGUgXCJlYXNlLW91dFwiIGVhc2luZyBzdHlsZSxcbiAqIHdoaWNoIGRlY2VsZXJhdGVzIG5lYXIgdGhlIGVuZCBvZiB0aGUgZHVyYXRpb24uXG4gKiBAcGFyYW0gc3R5bGVzIFNldHMgQW5pbWF0aW9uU3R5bGVzIGZvciB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIEEgZnVuY3Rpb24gY2FsbCB0byBlaXRoZXIgYHN0eWxlKClgIG9yIGBrZXlmcmFtZXMoKWBcbiAqIHRoYXQgcmV0dXJucyBhIGNvbGxlY3Rpb24gb2YgQ1NTIHN0eWxlIGVudHJpZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgcGFyZW50IGFuaW1hdGlvbi5cbiAqIFdoZW4gbnVsbCwgdXNlcyB0aGUgc3R5bGVzIGZyb20gdGhlIGRlc3RpbmF0aW9uIHN0YXRlLlxuICogVGhpcyBpcyB1c2VmdWwgd2hlbiBkZXNjcmliaW5nIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBjb21wbGV0ZSBhbiBhbmltYXRpb247XG4gKiBzZWUgXCJBbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlXCIgaW4gYHRyYW5zaXRpb25zKClgLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBhbmltYXRpb24gc3RlcC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogQ2FsbCB3aXRoaW4gYW4gYW5pbWF0aW9uIGBzZXF1ZW5jZSgpYCwgYGdyb3VwKClgLCBvclxuICogYHRyYW5zaXRpb24oKWAgY2FsbCB0byBzcGVjaWZ5IGFuIGFuaW1hdGlvbiBzdGVwXG4gKiB0aGF0IGFwcGxpZXMgZ2l2ZW4gc3R5bGUgZGF0YSB0byB0aGUgcGFyZW50IGFuaW1hdGlvbiBmb3IgYSBnaXZlbiBhbW91bnQgb2YgdGltZS5cbiAqXG4gKiAjIyMgU3ludGF4IEV4YW1wbGVzXG4gKiAqKlRpbWluZyBleGFtcGxlcyoqXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBzaG93IHZhcmlvdXMgYHRpbWluZ3NgIHNwZWNpZmljYXRpb25zLlxuICogLSBgYW5pbWF0ZSg1MDApYCA6IER1cmF0aW9uIGlzIDUwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiMXNcIilgIDogRHVyYXRpb24gaXMgMTAwMCBtaWxsaXNlY29uZHMuXG4gKiAtIGBhbmltYXRlKFwiMTAwbXMgMC41c1wiKWAgOiBEdXJhdGlvbiBpcyAxMDAgbWlsbGlzZWNvbmRzLCBkZWxheSBpcyA1MDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjVzIGVhc2UtaW5cIilgIDogRHVyYXRpb24gaXMgNTAwMCBtaWxsaXNlY29uZHMsIGVhc2luZyBpbi5cbiAqIC0gYGFuaW1hdGUoXCI1cyAxMG1zIGN1YmljLWJlemllciguMTcsLjY3LC44OCwuMSlcIilgIDogRHVyYXRpb24gaXMgNTAwMCBtaWxsaXNlY29uZHMsIGRlbGF5IGlzIDEwXG4gKiBtaWxsaXNlY29uZHMsIGVhc2luZyBhY2NvcmRpbmcgdG8gYSBiZXppZXIgY3VydmUuXG4gKlxuICogKipTdHlsZSBleGFtcGxlcyoqXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNhbGxzIGBzdHlsZSgpYCB0byBzZXQgYSBzaW5nbGUgQ1NTIHN0eWxlLlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZSg1MDAsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqIGBgYFxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNhbGxzIGBrZXlmcmFtZXMoKWAgdG8gc2V0IGEgQ1NTIHN0eWxlXG4gKiB0byBkaWZmZXJlbnQgdmFsdWVzIGZvciBzdWNjZXNzaXZlIGtleWZyYW1lcy5cbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoNTAwLCBrZXlmcmFtZXMoXG4gKiAgW1xuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwiYmx1ZVwiIH0pKSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiIH0pKVxuICogIF0pXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGUoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgfCBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHxcbiAgICAgICAgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlLCBzdHlsZXMsIHRpbWluZ3N9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEZWZpbmVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdG8gYmUgcnVuIGluIHBhcmFsbGVsLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBBbiBhcnJheSBvZiBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICogLSBXaGVuIHN0ZXBzIGFyZSBkZWZpbmVkIGJ5IGBzdHlsZSgpYCBvciBgYW5pbWF0ZSgpYFxuICogZnVuY3Rpb24gY2FsbHMsIGVhY2ggY2FsbCB3aXRoaW4gdGhlIGdyb3VwIGlzIGV4ZWN1dGVkIGluc3RhbnRseS5cbiAqIC0gVG8gc3BlY2lmeSBvZmZzZXQgc3R5bGVzIHRvIGJlIGFwcGxpZWQgYXQgYSBsYXRlciB0aW1lLCBkZWZpbmUgc3RlcHMgd2l0aFxuICogYGtleWZyYW1lcygpYCwgb3IgdXNlIGBhbmltYXRlKClgIGNhbGxzIHdpdGggYSBkZWxheSB2YWx1ZS5cbiAqIEZvciBleGFtcGxlOlxuICogXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBncm91cChbXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCB7IGJhY2tncm91bmQ6IFwiYmxhY2tcIiB9KSlcbiAqICAgYW5pbWF0ZShcIjJzXCIsIHsgY29sb3I6IFwid2hpdGVcIiB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgZ3JvdXAgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogR3JvdXBlZCBhbmltYXRpb25zIGFyZSB1c2VmdWwgd2hlbiBhIHNlcmllcyBvZiBzdHlsZXMgbXVzdCBiZSBcbiAqIGFuaW1hdGVkIGF0IGRpZmZlcmVudCBzdGFydGluZyB0aW1lcyBhbmQgY2xvc2VkIG9mZiBhdCBkaWZmZXJlbnQgZW5kaW5nIHRpbWVzLlxuICpcbiAqIFdoZW4gY2FsbGVkIHdpdGhpbiBhIGBzZXF1ZW5jZSgpYCBvciBhXG4gKiBgdHJhbnNpdGlvbigpYCBjYWxsLCBkb2VzIG5vdCBjb250aW51ZSB0byB0aGUgbmV4dFxuICogaW5zdHJ1Y3Rpb24gdW50aWwgYWxsIG9mIHRoZSBpbm5lciBhbmltYXRpb24gc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cChcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uR3JvdXBNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkdyb3VwLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIGJlIHJ1biBzZXF1ZW50aWFsbHksIG9uZSBieSBvbmUuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gKiAtIFN0ZXBzIGRlZmluZWQgYnkgYHN0eWxlKClgIGNhbGxzIGFwcGx5IHRoZSBzdHlsaW5nIGRhdGEgaW1tZWRpYXRlbHkuXG4gKiAtIFN0ZXBzIGRlZmluZWQgYnkgYGFuaW1hdGUoKWAgY2FsbHMgYXBwbHkgdGhlIHN0eWxpbmcgZGF0YSBvdmVyIHRpbWVcbiAqICAgYXMgc3BlY2lmaWVkIGJ5IHRoZSB0aW1pbmcgZGF0YS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCB7IG9wYWNpdHk6IDEgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHNlcXVlbmNlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFdoZW4geW91IHBhc3MgYW4gYXJyYXkgb2Ygc3RlcHMgdG8gYVxuICogYHRyYW5zaXRpb24oKWAgY2FsbCwgdGhlIHN0ZXBzIHJ1biBzZXF1ZW50aWFsbHkgYnkgZGVmYXVsdC5cbiAqIENvbXBhcmUgdGhpcyB0byB0aGUgYGdyb3VwKClgIGNhbGwsIHdoaWNoIHJ1bnMgYW5pbWF0aW9uIHN0ZXBzIGluIHBhcmFsbGVsLlxuICpcbiAqIFdoZW4gYSBzZXF1ZW5jZSBpcyB1c2VkIHdpdGhpbiBhIGBncm91cCgpYCBvciBhIGB0cmFuc2l0aW9uKClgIGNhbGwsXG4gKiBleGVjdXRpb24gY29udGludWVzIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9ubHkgYWZ0ZXIgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2Uoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSBrZXkvdmFsdWUgb2JqZWN0IGNvbnRhaW5pbmcgQ1NTIHByb3BlcnRpZXMvc3R5bGVzIHRoYXRcbiAqIGNhbiB0aGVuIGJlIHVzZWQgZm9yIGFuIGFuaW1hdGlvbiBgc3RhdGVgLCB3aXRoaW4gYW4gYW5pbWF0aW9uIGBzZXF1ZW5jZWAsXG4gKiBvciBhcyBzdHlsaW5nIGRhdGEgZm9yIGNhbGxzIHRvIGBhbmltYXRlKClgIGFuZCBga2V5ZnJhbWVzKClgLlxuICpcbiAqIEBwYXJhbSB0b2tlbnMgQSBzZXQgb2YgQ1NTIHN0eWxlcyBvciBIVE1MIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggYW4gYW5pbWF0aW9uIHN0YXRlLlxuICogVGhlIHZhbHVlIGNhbiBiZSBhbnkgb2YgdGhlIGZvbGxvd2luZzpcbiAqIC0gQSBrZXktdmFsdWUgc3R5bGUgcGFpciBhc3NvY2lhdGluZyBhIENTUyBwcm9wZXJ0eSB3aXRoIGEgdmFsdWUuXG4gKiAtIEFuIGFycmF5IG9mIGtleS12YWx1ZSBzdHlsZSBwYWlycy5cbiAqIC0gQW4gYXN0ZXJpc2sgKCopLCB0byB1c2UgYXV0by1zdHlsaW5nLCB3aGVyZSBzdHlsZXMgYXJlIGRlcml2ZWQgZnJvbSB0aGUgZWxlbWVudFxuICogYmVpbmcgYW5pbWF0ZWQgYW5kIGFwcGxpZWQgdG8gdGhlIGFuaW1hdGlvbiB3aGVuIGl0IHN0YXJ0cy5cbiAqXG4gKiBBdXRvLXN0eWxpbmcgY2FuIGJlIHVzZWQgdG8gZGVmaW5lIGEgc3RhdGUgdGhhdCBkZXBlbmRzIG9uIGxheW91dCBvciBvdGhlciBcbiAqIGVudmlyb25tZW50YWwgZmFjdG9ycy5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgc3R5bGUgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBjcmVhdGUgYW5pbWF0aW9uIHN0eWxlcyB0aGF0IGNvbGxlY3QgYSBzZXQgb2ZcbiAqIENTUyBwcm9wZXJ0eSB2YWx1ZXM6XG4gKiBcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHN0cmluZyB2YWx1ZXMgZm9yIENTUyBwcm9wZXJ0aWVzXG4gKiBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIsIGNvbG9yOiBcImJsdWVcIiB9KVxuICpcbiAqIC8vIG51bWVyaWNhbCBwaXhlbCB2YWx1ZXNcbiAqIHN0eWxlKHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAwIH0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgdXNlcyBhdXRvLXN0eWxpbmcgdG8gYWxsb3cgYSBjb21wb25lbnQgdG8gYW5pbWF0ZSBmcm9tXG4gKiBhIGhlaWdodCBvZiAwIHVwIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHBhcmVudCBlbGVtZW50OlxuICpcbiAqIGBgYFxuICogc3R5bGUoeyBoZWlnaHQ6IDAgfSksXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlKFxuICAgIHRva2VuczogJyonIHwge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gfFxuICAgIEFycmF5PCcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfT4pOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUsIHN0eWxlczogdG9rZW5zLCBvZmZzZXQ6IG51bGx9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoaW4gYSB0cmlnZ2VyIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIG5hbWUgT25lIG9yIG1vcmUgbmFtZXMgZm9yIHRoZSBkZWZpbmVkIHN0YXRlIGluIGEgY29tbWEtc2VwYXJhdGVkIHN0cmluZy5cbiAqIFRoZSBmb2xsb3dpbmcgcmVzZXJ2ZWQgc3RhdGUgbmFtZXMgY2FuIGJlIHN1cHBsaWVkIHRvIGRlZmluZSBhIHN0eWxlIGZvciBzcGVjaWZpYyB1c2VcbiAqIGNhc2VzOlxuICpcbiAqIC0gYHZvaWRgIFlvdSBjYW4gYXNzb2NpYXRlIHN0eWxlcyB3aXRoIHRoaXMgbmFtZSB0byBiZSB1c2VkIHdoZW5cbiAqIHRoZSBlbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgd2hlbiBhbiBgbmdJZmAgZXZhbHVhdGVzXG4gKiB0byBmYWxzZSwgdGhlIHN0YXRlIG9mIHRoZSBhc3NvY2lhdGVkIGVsZW1lbnQgaXMgdm9pZC5cbiAqICAtIGAqYCAoYXN0ZXJpc2spIEluZGljYXRlcyB0aGUgZGVmYXVsdCBzdGF0ZS4gWW91IGNhbiBhc3NvY2lhdGUgc3R5bGVzIHdpdGggdGhpcyBuYW1lXG4gKiB0byBiZSB1c2VkIGFzIHRoZSBmYWxsYmFjayB3aGVuIHRoZSBzdGF0ZSB0aGF0IGlzIGJlaW5nIGFuaW1hdGVkIGlzIG5vdCBkZWNsYXJlZFxuICogd2l0aGluIHRoZSB0cmlnZ2VyLlxuICpcbiAqIEBwYXJhbSBzdHlsZXMgQSBzZXQgb2YgQ1NTIHN0eWxlcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBzdGF0ZSwgY3JlYXRlZCB1c2luZyB0aGVcbiAqIGBzdHlsZSgpYCBmdW5jdGlvbi5cbiAqIFRoaXMgc2V0IG9mIHN0eWxlcyBwZXJzaXN0cyBvbiB0aGUgZWxlbWVudCBvbmNlIHRoZSBzdGF0ZSBoYXMgYmVlbiByZWFjaGVkLlxuICogQHBhcmFtIG9wdGlvbnMgUGFyYW1ldGVycyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIHN0YXRlIHdoZW4gaXQgaXMgaW52b2tlZC5cbiAqIDAgb3IgbW9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgbmV3IHN0YXRlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFVzZSB0aGUgYHRyaWdnZXIoKWAgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgc3RhdGVzIHRvIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogVXNlIHRoZSBgdHJhbnNpdGlvbigpYCBmdW5jdGlvbiB0byBhbmltYXRlIGJldHdlZW4gc3RhdGVzLlxuICogV2hlbiBhIHN0YXRlIGlzIGFjdGl2ZSB3aXRoaW4gYSBjb21wb25lbnQsIGl0cyBhc3NvY2lhdGVkIHN0eWxlcyBwZXJzaXN0IG9uIHRoZSBlbGVtZW50LFxuICogZXZlbiB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZShcbiAgICBuYW1lOiBzdHJpbmcsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSxcbiAgICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fSk6IEFuaW1hdGlvblN0YXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZSwgbmFtZSwgc3R5bGVzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgc2V0IG9mIGFuaW1hdGlvbiBzdHlsZXMsIGFzc29jaWF0aW5nIGVhY2ggc3R5bGUgd2l0aCBhbiBvcHRpb25hbCBgb2Zmc2V0YCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQSBzZXQgb2YgYW5pbWF0aW9uIHN0eWxlcyB3aXRoIG9wdGlvbmFsIG9mZnNldCBkYXRhLlxuICogVGhlIG9wdGlvbmFsIGBvZmZzZXRgIHZhbHVlIGZvciBhIHN0eWxlIHNwZWNpZmllcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRvdGFsIGFuaW1hdGlvblxuICogdGltZSBhdCB3aGljaCB0aGF0IHN0eWxlIGlzIGFwcGxpZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGtleWZyYW1lcyBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBVc2Ugd2l0aCB0aGUgYGFuaW1hdGUoKWAgY2FsbC4gSW5zdGVhZCBvZiBhcHBseWluZyBhbmltYXRpb25zXG4gKiBmcm9tIHRoZSBjdXJyZW50IHN0YXRlXG4gKiB0byB0aGUgZGVzdGluYXRpb24gc3RhdGUsIGtleWZyYW1lcyBkZXNjcmliZSBob3cgZWFjaCBzdHlsZSBlbnRyeSBpcyBhcHBsaWVkIGFuZCBhdCB3aGF0IHBvaW50XG4gKiB3aXRoaW4gdGhlIGFuaW1hdGlvbiBhcmMuXG4gKiBDb21wYXJlIFtDU1MgS2V5ZnJhbWUgQW5pbWF0aW9uc10oaHR0cHM6Ly93d3cudzNzY2hvb2xzLmNvbS9jc3MvY3NzM19hbmltYXRpb25zLmFzcCkuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCB0aGUgb2Zmc2V0IHZhbHVlcyBkZXNjcmliZVxuICogd2hlbiBlYWNoIGBiYWNrZ3JvdW5kQ29sb3JgIHZhbHVlIGlzIGFwcGxpZWQuIFRoZSBjb2xvciBpcyByZWQgYXQgdGhlIHN0YXJ0LCBhbmQgY2hhbmdlcyB0b1xuICogYmx1ZSB3aGVuIDIwJSBvZiB0aGUgdG90YWwgdGltZSBoYXMgZWxhcHNlZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGUgcHJvdmlkZWQgb2Zmc2V0IHZhbHVlc1xuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiLCBvZmZzZXQ6IDAgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiwgb2Zmc2V0OiAwLjIgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiLCBvZmZzZXQ6IDAuMyB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiwgb2Zmc2V0OiAxIH0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIElmIHRoZXJlIGFyZSBubyBgb2Zmc2V0YCB2YWx1ZXMgc3BlY2lmaWVkIGluIHRoZSBzdHlsZSBlbnRyaWVzLCB0aGUgb2Zmc2V0c1xuICogYXJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKFwiNXNcIiwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIgfSkgLy8gb2Zmc2V0ID0gMFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIgfSkgLy8gb2Zmc2V0ID0gMC4zM1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiB9KSAvLyBvZmZzZXQgPSAwLjY2XG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIgfSkgLy8gb2Zmc2V0ID0gMVxuICogXSkpXG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5ZnJhbWVzKHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW10pOiBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzLCBzdGVwc307XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gYW5pbWF0aW9uIHRyYW5zaXRpb24gYXMgYSBzZXF1ZW5jZSBvZiBhbmltYXRpb24gc3RlcHMgdG8gcnVuIHdoZW4gYSBnaXZlblxuICogY29uZGl0aW9uIGlzIHNhdGlzZmllZC4gVGhlIGNvbmRpdGlvbiBpcyBhIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzXG4gKiB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLlxuICogV2hlbiB0aGUgc3RhdGUgY3JpdGVyaWEgb2YgYSBkZWZpbmVkIHRyYW5zaXRpb24gYXJlIG1ldCwgdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIGlzXG4gKiB0cmlnZ2VyZWQuXG4gKlxuICogQHBhcmFtIHN0YXRlQ2hhbmdlRXhwciBBIEJvb2xlYW4gZXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudFxuICogYW5pbWF0aW9uIHN0YXRlcywgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyYW5zaXRpb24gc2hvdWxkIG9jY3VyLiBOb3RlIHRoYXQgIFwidHJ1ZVwiIGFuZCBcImZhbHNlXCJcbiAqIG1hdGNoIDEgYW5kIDAsIHJlc3BlY3RpdmVseS4gQW4gZXhwcmVzc2lvbiBpcyBldmFsdWF0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3VycyBpbiB0aGVcbiAqIGFuaW1hdGlvbiB0cmlnZ2VyIGVsZW1lbnQuXG4gKiBUaGUgYW5pbWF0aW9uIHN0ZXBzIHJ1biB3aGVuIHRoZSBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlLlxuICpcbiAqIC0gQSBzdGF0ZS1jaGFuZ2Ugc3RyaW5nIHRha2VzIHRoZSBmb3JtIFwic3RhdGUxID0+IHN0YXRlMlwiLCB3aGVyZSBlYWNoIHNpZGUgaXMgYSBkZWZpbmVkIGFuaW1hdGlvblxuICogc3RhdGUsIG9yIGFuIGFzdGVyaXggKCopIHRvIHJlZmVyIHRvIGEgZHluYW1pYyBzdGFydCBvciBlbmQgc3RhdGUuXG4gKiAgIC0gVGhlIGV4cHJlc3Npb24gc3RyaW5nIGNhbiBjb250YWluIG11bHRpcGxlIGNvbW1hLXNlcGFyYXRlZCBzdGF0ZW1lbnRzO1xuICogZm9yIGV4YW1wbGUgXCJzdGF0ZTEgPT4gc3RhdGUyLCBzdGF0ZTMgPT4gc3RhdGU0XCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDplbnRlcmAgYW5kIGA6bGVhdmVgIGluaXRpYXRlIGEgdHJhbnNpdGlvbiBvbiB0aGUgZW50cnkgYW5kIGV4aXQgc3RhdGVzLFxuICogZXF1aXZhbGVudCB0byAgXCJ2b2lkID0+ICpcIiAgYW5kIFwiKiA9PiB2b2lkXCIuXG4gKiAgIC0gU3BlY2lhbCB2YWx1ZXMgYDppbmNyZW1lbnRgIGFuZCBgOmRlY3JlbWVudGAgaW5pdGlhdGUgYSB0cmFuc2l0aW9uIHdoZW4gYSBudW1lcmljIHZhbHVlIGhhc1xuICogaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCBpbiB2YWx1ZS5cbiAqIC0gQSBmdW5jdGlvbiBpcyBleGVjdXRlZCBlYWNoIHRpbWUgYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzIGluIHRoZSBhbmltYXRpb24gdHJpZ2dlciBlbGVtZW50LlxuICogVGhlIGFuaW1hdGlvbiBzdGVwcyBydW4gd2hlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cywgYXMgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlKClgIG9yXG4gKiBgc2VxdWVuY2UoKWAgZnVuY3Rpb24sIHRoYXQgZm9ybSBhIHRyYW5zZm9ybWF0aW9uIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKiBBIHNlcXVlbmNlIGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIHlvdSBwYXNzIGFuIGFycmF5LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvbixcbiAqIGFuZCBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuIFByb3ZpZGVkIHZhbHVlcyBmb3IgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGFyZSB1c2VkXG4gKiBhcyBkZWZhdWx0cywgYW5kIG92ZXJyaWRlIHZhbHVlcyBjYW4gYmUgcGFzc2VkIHRvIHRoZSBjYWxsZXIgb24gaW52b2NhdGlvbi5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgdHJhbnNpdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIGEgY29tcG9uZW50IGJpbmRzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogYGBgSFRNTFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEFsbCB0cmFuc2l0aW9ucyBhcmUgZGVmaW5lZCB3aXRoaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIsXG4gKiBhbG9uZyB3aXRoIG5hbWVkIHN0YXRlcyB0aGF0IHRoZSB0cmFuc2l0aW9ucyBjaGFuZ2UgdG8gYW5kIGZyb20uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgLy8gZGVmaW5lIHN0YXRlc1xuICogIHN0YXRlKFwib25cIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZWVuXCIgfSkpLFxuICogIHN0YXRlKFwib2ZmXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmV5XCIgfSkpLFxuICogIC4uLl1cbiAqIGBgYFxuICpcbiAqIE5vdGUgdGhhdCB3aGVuIHlvdSBjYWxsIHRoZSBgc2VxdWVuY2UoKWAgZnVuY3Rpb24gd2l0aGluIGEgYGdyb3VwKClgXG4gKiBvciBhIGB0cmFuc2l0aW9uKClgIGNhbGwsIGV4ZWN1dGlvbiBkb2VzIG5vdCBjb250aW51ZSB0byB0aGUgbmV4dCBpbnN0cnVjdGlvblxuICogdW50aWwgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICpcbiAqICMjIyBTeW50YXggZXhhbXBsZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGVzIGRlZmluZSB0cmFuc2l0aW9ucyBiZXR3ZWVuIHRoZSB0d28gZGVmaW5lZCBzdGF0ZXMgKGFuZCBkZWZhdWx0IHN0YXRlcyksXG4gKiB1c2luZyB2YXJpb3VzIG9wdGlvbnM6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gVHJhbnNpdGlvbiBvY2N1cnMgd2hlbiB0aGUgc3RhdGUgdmFsdWVcbiAqIC8vIGJvdW5kIHRvIFwibXlBbmltYXRpb25UcmlnZ2VyXCIgY2hhbmdlcyBmcm9tIFwib25cIiB0byBcIm9mZlwiXG4gKiB0cmFuc2l0aW9uKFwib24gPT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSlcbiAqIC8vIFJ1biB0aGUgc2FtZSBhbmltYXRpb24gZm9yIGJvdGggZGlyZWN0aW9uc1xuICogdHJhbnNpdGlvbihcIm9uIDw9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKVxuICogLy8gRGVmaW5lIG11bHRpcGxlIHN0YXRlLWNoYW5nZSBwYWlycyBzZXBhcmF0ZWQgYnkgY29tbWFzXG4gKiB0cmFuc2l0aW9uKFwib24gPT4gb2ZmLCBvZmYgPT4gdm9pZFwiLCBhbmltYXRlKDUwMCkpXG4gKiBgYGBcbiAqXG4gKiAjIyMgU3BlY2lhbCB2YWx1ZXMgZm9yIHN0YXRlLWNoYW5nZSBleHByZXNzaW9uc1xuICpcbiAqIC0gQ2F0Y2gtYWxsIHN0YXRlIGNoYW5nZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIGluc2VydGVkIGludG8gdGhlIHBhZ2UgYW5kIHRoZVxuICogZGVzdGluYXRpb24gc3RhdGUgaXMgdW5rbm93bjpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKFwidm9pZCA9PiAqXCIsIFtcbiAqICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgYW5pbWF0ZSg1MDApXG4gKiAgXSlcbiAqIGBgYFxuICpcbiAqIC0gQ2FwdHVyZSBhIHN0YXRlIGNoYW5nZSBiZXR3ZWVuIGFueSBzdGF0ZXM6XG4gKlxuICogIGB0cmFuc2l0aW9uKFwiKiA9PiAqXCIsIGFuaW1hdGUoXCIxcyAwc1wiKSlgXG4gKlxuICogLSBFbnRyeSBhbmQgZXhpdCB0cmFuc2l0aW9uczpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKFwiOmVudGVyXCIsIFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogICBdKSxcbiAqIHRyYW5zaXRpb24oXCI6bGVhdmVcIiwgW1xuICogICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogICBdKVxuICogYGBgXG4gKlxuICogLSBVc2UgYDppbmNyZW1lbnRgIGFuZCBgOmRlY3JlbWVudGAgdG8gaW5pdGlhdGUgdHJhbnNpdGlvbnM6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcIjppbmNyZW1lbnRcIiwgZ3JvdXAoW1xuICogIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgc3R5bGUoeyBsZWZ0OiAnMTAwJScgfSksXG4gKiAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKCcqJykpXG4gKiAgIF0pLFxuICogIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKHsgbGVmdDogJy0xMDAlJyB9KSlcbiAqICBdKVxuICogXSkpXG4gKlxuICogdHJhbnNpdGlvbihcIjpkZWNyZW1lbnRcIiwgZ3JvdXAoW1xuICogIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgc3R5bGUoeyBsZWZ0OiAnMTAwJScgfSksXG4gKiAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKCcqJykpXG4gKiAgIF0pLFxuICogIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKHsgbGVmdDogJy0xMDAlJyB9KSlcbiAqICBdKVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiAjIyMgU3RhdGUtY2hhbmdlIGZ1bmN0aW9uc1xuICpcbiAqIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBhIGBmcm9tU3RhdGVgIHNwZWNpZmllZCBhcyBhIHN0YXRlLWNoYW5nZSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYW5cbiAqIGFuaW1hdGlvbiB3aGVuIHRydWU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbigoZnJvbVN0YXRlLCB0b1N0YXRlKSA9PlxuICogIHtcbiAqICAgcmV0dXJuIGZyb21TdGF0ZSA9PSBcIm9mZlwiICYmIHRvU3RhdGUgPT0gXCJvblwiO1xuICogIH0sXG4gKiAgYW5pbWF0ZShcIjFzIDBzXCIpKVxuICogYGBgXG4gKlxuICogIyMjIEFuaW1hdGluZyB0byB0aGUgZmluYWwgc3RhdGVcbiAqXG4gKiBJZiB0aGUgZmluYWwgc3RlcCBpbiBhIHRyYW5zaXRpb24gaXMgYSBjYWxsIHRvIGBhbmltYXRlKClgIHRoYXQgdXNlcyBhIHRpbWluZyB2YWx1ZVxuICogd2l0aCBubyBzdHlsZSBkYXRhLCB0aGF0IHN0ZXAgaXMgYXV0b21hdGljYWxseSBjb25zaWRlcmVkIHRoZSBmaW5hbCBhbmltYXRpb24gYXJjLFxuICogZm9yIHRoZSBlbGVtZW50IHRvIHJlYWNoIHRoZSBmaW5hbCBzdGF0ZS4gQW5ndWxhciBhdXRvbWF0aWNhbGx5IGFkZHMgb3IgcmVtb3Zlc1xuICogQ1NTIHN0eWxlcyB0byBlbnN1cmUgdGhhdCB0aGUgZWxlbWVudCBpcyBpbiB0aGUgY29ycmVjdCBmaW5hbCBzdGF0ZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIHRyYW5zaXRpb24gdGhhdCBzdGFydHMgYnkgaGlkaW5nIHRoZSBlbGVtZW50LFxuICogdGhlbiBtYWtlcyBzdXJlIHRoYXQgaXQgYW5pbWF0ZXMgcHJvcGVybHkgdG8gd2hhdGV2ZXIgc3RhdGUgaXMgY3VycmVudGx5IGFjdGl2ZSBmb3IgdHJpZ2dlcjpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB0cmFuc2l0aW9uKFwidm9pZCA9PiAqXCIsIFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDUwMClcbiAqICBdKVxuICogYGBgXG4gKiAjIyMgQm9vbGVhbiB2YWx1ZSBtYXRjaGluZ1xuICogSWYgYSB0cmlnZ2VyIGJpbmRpbmcgdmFsdWUgaXMgYSBCb29sZWFuLCBpdCBjYW4gYmUgbWF0Y2hlZCB1c2luZyBhIHRyYW5zaXRpb24gZXhwcmVzc2lvblxuICogdGhhdCBjb21wYXJlcyB0cnVlIGFuZCBmYWxzZSBvciAxIGFuZCAwLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIC8vIGluIHRoZSB0ZW1wbGF0ZVxuICogPGRpdiBbQG9wZW5DbG9zZV09XCJvcGVuID8gdHJ1ZSA6IGZhbHNlXCI+Li4uPC9kaXY+XG4gKiAvLyBpbiB0aGUgY29tcG9uZW50IG1ldGFkYXRhXG4gKiB0cmlnZ2VyKCdvcGVuQ2xvc2UnLCBbXG4gKiAgIHN0YXRlKCd0cnVlJywgc3R5bGUoeyBoZWlnaHQ6ICcqJyB9KSksXG4gKiAgIHN0YXRlKCdmYWxzZScsIHN0eWxlKHsgaGVpZ2h0OiAnMHB4JyB9KSksXG4gKiAgIHRyYW5zaXRpb24oJ2ZhbHNlIDw9PiB0cnVlJywgYW5pbWF0ZSg1MDApKVxuICogXSlcbiAqIGBgYFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zaXRpb24oXG4gICAgc3RhdGVDaGFuZ2VFeHByOiBzdHJpbmcgfCAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKSxcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb24sIGV4cHI6IHN0YXRlQ2hhbmdlRXhwciwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogUHJvZHVjZXMgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBjYW4gYmUgaW52b2tlZCBpbiBhbm90aGVyIGFuaW1hdGlvbiBvciBzZXF1ZW5jZSxcbiAqIGJ5IGNhbGxpbmcgdGhlIGB1c2VBbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHN0ZXBzIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvYmplY3RzLCBhcyByZXR1cm5lZCBieSB0aGUgYGFuaW1hdGUoKWBcbiAqIG9yIGBzZXF1ZW5jZSgpYCBmdW5jdGlvbiwgdGhhdCBmb3JtIGEgdHJhbnNmb3JtYXRpb24gZnJvbSBvbmUgc3RhdGUgdG8gYW5vdGhlci5cbiAqIEEgc2VxdWVuY2UgaXMgdXNlZCBieSBkZWZhdWx0IHdoZW4geW91IHBhc3MgYW4gYXJyYXkuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCB0aGF0IGNhbiBjb250YWluIGEgZGVsYXkgdmFsdWUgZm9yIHRoZSBzdGFydCBvZiB0aGVcbiAqIGFuaW1hdGlvbiwgYW5kIGFkZGl0aW9uYWwgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIFByb3ZpZGVkIHZhbHVlcyBmb3IgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGFyZSB1c2VkIGFzIGRlZmF1bHRzLFxuICogYW5kIG92ZXJyaWRlIHZhbHVlcyBjYW4gYmUgcGFzc2VkIHRvIHRoZSBjYWxsZXIgb24gaW52b2NhdGlvbi5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgYW5pbWF0aW9uIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWZpbmVzIGEgcmV1c2FibGUgYW5pbWF0aW9uLCBwcm92aWRpbmcgc29tZSBkZWZhdWx0IHBhcmFtZXRlclxuICogdmFsdWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBmYWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAne3sgc3RhcnQgfX0nIH0pLFxuICogICBhbmltYXRlKCd7eyB0aW1lIH19JyxcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAne3sgZW5kIH19J30pKVxuICogICBdLFxuICogICB7IHBhcmFtczogeyB0aW1lOiAnMTAwMG1zJywgc3RhcnQ6IDAsIGVuZDogMSB9fSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGludm9rZXMgdGhlIGRlZmluZWQgYW5pbWF0aW9uIHdpdGggYSBjYWxsIHRvIGB1c2VBbmltYXRpb24oKWAsXG4gKiBwYXNzaW5nIGluIG92ZXJyaWRlIHBhcmFtZXRlciB2YWx1ZXMuXG4gKlxuICogYGBganNcbiAqIHVzZUFuaW1hdGlvbihmYWRlQW5pbWF0aW9uLCB7XG4gKiAgIHBhcmFtczoge1xuICogICAgIHRpbWU6ICcycycsXG4gKiAgICAgc3RhcnQ6IDEsXG4gKiAgICAgZW5kOiAwXG4gKiAgIH1cbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBJZiBhbnkgb2YgdGhlIHBhc3NlZC1pbiBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBtaXNzaW5nIGZyb20gdGhpcyBjYWxsLFxuICogdGhlIGRlZmF1bHQgdmFsdWVzIGFyZSB1c2VkLiBJZiBvbmUgb3IgbW9yZSBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBtaXNzaW5nIGJlZm9yZSBhIHN0ZXAgaXNcbiAqIGFuaW1hdGVkLCBgdXNlQW5pbWF0aW9uKClgIHRocm93cyBhbiBlcnJvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGlvbihcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuUmVmZXJlbmNlLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIHF1ZXJpZWQgaW5uZXIgYW5pbWF0aW9uIGVsZW1lbnQgd2l0aGluIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdCB0aGF0IGNhbiBjb250YWluIGEgZGVsYXkgdmFsdWUgZm9yIHRoZSBzdGFydCBvZiB0aGVcbiAqIGFuaW1hdGlvbiwgYW5kIGFkZGl0aW9uYWwgb3ZlcnJpZGUgdmFsdWVzIGZvciBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGNoaWxkIGFuaW1hdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBFYWNoIHRpbWUgYW4gYW5pbWF0aW9uIGlzIHRyaWdnZXJlZCBpbiBBbmd1bGFyLCB0aGUgcGFyZW50IGFuaW1hdGlvblxuICogaGFzIHByaW9yaXR5IGFuZCBhbnkgY2hpbGQgYW5pbWF0aW9ucyBhcmUgYmxvY2tlZC4gSW4gb3JkZXJcbiAqIGZvciBhIGNoaWxkIGFuaW1hdGlvbiB0byBydW4sIHRoZSBwYXJlbnQgYW5pbWF0aW9uIG11c3QgcXVlcnkgZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAqIGNvbnRhaW5pbmcgY2hpbGQgYW5pbWF0aW9ucywgYW5kIHJ1biB0aGVtIHVzaW5nIHRoaXMgZnVuY3Rpb24uXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgZmVhdHVyZSBkZXNpZ25lZCB0byBiZSB1c2VkIHdpdGggYHF1ZXJ5KClgIGFuZCBpdCB3aWxsIG9ubHkgd29ya1xuICogd2l0aCBhbmltYXRpb25zIHRoYXQgYXJlIGFzc2lnbmVkIHVzaW5nIHRoZSBBbmd1bGFyIGFuaW1hdGlvbiBsaWJyYXJ5LiBDU1Mga2V5ZnJhbWVzXG4gKiBhbmQgdHJhbnNpdGlvbnMgYXJlIG5vdCBoYW5kbGVkIGJ5IHRoaXMgQVBJLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZUNoaWxkKG9wdGlvbnM6IEFuaW1hdGVDaGlsZE9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlQ2hpbGQsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIFN0YXJ0cyBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGlzIGNyZWF0ZWQgdXNpbmcgdGhlIGBhbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGFuaW1hdGlvbiBUaGUgcmV1c2FibGUgYW5pbWF0aW9uIHRvIHN0YXJ0LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgXG4gKiB0aGUgYW5pbWF0aW9uLCBhbmQgYWRkaXRpb25hbCBvdmVycmlkZSB2YWx1ZXMgZm9yIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBhbmltYXRpb24gcGFyYW1ldGVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuaW1hdGlvbihcbiAgICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVSZWYsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogRmluZHMgb25lIG9yIG1vcmUgaW5uZXIgZWxlbWVudHMgd2l0aGluIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBpc1xuICogYmVpbmcgYW5pbWF0ZWQgd2l0aGluIGEgc2VxdWVuY2UuIFVzZSB3aXRoIGBhbmltYXRlQ2hpbGQoKWAuXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yIFRoZSBlbGVtZW50IHRvIHF1ZXJ5LCBvciBhIHNldCBvZiBlbGVtZW50cyB0aGF0IGNvbnRhaW4gQW5ndWxhci1zcGVjaWZpY1xuICogY2hhcmFjdGVyaXN0aWNzLCBzcGVjaWZpZWQgd2l0aCBvbmUgb3IgbW9yZSBvZiB0aGUgZm9sbG93aW5nIHRva2Vucy5cbiAqICAtIGBxdWVyeShcIjplbnRlclwiKWAgb3IgYHF1ZXJ5KFwiOmxlYXZlXCIpYCA6IFF1ZXJ5IGZvciBuZXdseSBpbnNlcnRlZC9yZW1vdmVkIGVsZW1lbnRzLlxuICogIC0gYHF1ZXJ5KFwiOmFuaW1hdGluZ1wiKWAgOiBRdWVyeSBhbGwgY3VycmVudGx5IGFuaW1hdGluZyBlbGVtZW50cy5cbiAqICAtIGBxdWVyeShcIkB0cmlnZ2VyTmFtZVwiKWAgOiBRdWVyeSBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIuXG4gKiAgLSBgcXVlcnkoXCJAKlwiKWAgOiBRdWVyeSBhbGwgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2Vycy5cbiAqICAtIGBxdWVyeShcIjpzZWxmXCIpYCA6IEluY2x1ZGUgdGhlIGN1cnJlbnQgZWxlbWVudCBpbnRvIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogQHBhcmFtIGFuaW1hdGlvbiBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcHMgdG8gYXBwbHkgdG8gdGhlIHF1ZXJpZWQgZWxlbWVudCBvciBlbGVtZW50cy5cbiAqIEFuIGFycmF5IGlzIHRyZWF0ZWQgYXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QuIFVzZSB0aGUgJ2xpbWl0JyBmaWVsZCB0byBsaW1pdCB0aGUgdG90YWwgbnVtYmVyIG9mXG4gKiBpdGVtcyB0byBjb2xsZWN0LlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHF1ZXJ5IGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRva2VucyBjYW4gYmUgbWVyZ2VkIGludG8gYSBjb21iaW5lZCBxdWVyeSBzZWxlY3RvciBzdHJpbmcuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqICBxdWVyeSgnOnNlbGYsIC5yZWNvcmQ6ZW50ZXIsIC5yZWNvcmQ6bGVhdmUsIEBzdWJUcmlnZ2VyJywgWy4uLl0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgYHF1ZXJ5KClgIGZ1bmN0aW9uIGNvbGxlY3RzIG11bHRpcGxlIGVsZW1lbnRzIGFuZCB3b3JrcyBpbnRlcm5hbGx5IGJ5IHVzaW5nXG4gKiBgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsYC4gVXNlIHRoZSBgbGltaXRgIGZpZWxkIG9mIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGxpbWl0XG4gKiB0aGUgdG90YWwgbnVtYmVyIG9mIGl0ZW1zIHRvIGJlIGNvbGxlY3RlZC4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCdkaXYnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IGxpbWl0OiAxIH0pXG4gKiBgYGBcbiAqXG4gKiBCeSBkZWZhdWx0LCB0aHJvd3MgYW4gZXJyb3Igd2hlbiB6ZXJvIGl0ZW1zIGFyZSBmb3VuZC4gU2V0IHRoZVxuICogYG9wdGlvbmFsYCBmbGFnIHRvIGlnbm9yZSB0aGlzIGVycm9yLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogcXVlcnkoJy5zb21lLWVsZW1lbnQtdGhhdC1tYXktbm90LWJlLXRoZXJlJywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBvcHRpb25hbDogdHJ1ZSB9KVxuICogYGBgXG4gKlxuICogIyMjIFVzYWdlIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgcXVlcmllcyBmb3IgaW5uZXIgZWxlbWVudHMgYW5kIGFuaW1hdGVzIHRoZW1cbiAqIGluZGl2aWR1YWxseSB1c2luZyBgYW5pbWF0ZUNoaWxkKClgLiBcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdpbm5lcicsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdiBbQHF1ZXJ5QW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgPGgxPlRpdGxlPC9oMT5cbiAqICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gKiAgICAgICAgIEJsYWggYmxhaCBibGFoXG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgdHJpZ2dlcigncXVlcnlBbmltYXRpb24nLCBbXG4gKiAgICAgIHRyYW5zaXRpb24oJyogPT4gZ29BbmltYXRlJywgW1xuICogICAgICAgIC8vIGhpZGUgdGhlIGlubmVyIGVsZW1lbnRzXG4gKiAgICAgICAgcXVlcnkoJ2gxJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqICAgICAgICBxdWVyeSgnLmNvbnRlbnQnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICpcbiAqICAgICAgICAvLyBhbmltYXRlIHRoZSBpbm5lciBlbGVtZW50cyBpbiwgb25lIGJ5IG9uZVxuICogICAgICAgIHF1ZXJ5KCdoMScsIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcbiAqICAgICAgICBxdWVyeSgnLmNvbnRlbnQnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgIF0pXG4gKiAgICBdKVxuICogIF1cbiAqIH0pXG4gKiBjbGFzcyBDbXAge1xuICogICBleHAgPSAnJztcbiAqXG4gKiAgIGdvQW5pbWF0ZSgpIHtcbiAqICAgICB0aGlzLmV4cCA9ICdnb0FuaW1hdGUnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KFxuICAgIHNlbGVjdG9yOiBzdHJpbmcsIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlF1ZXJ5LCBzZWxlY3RvciwgYW5pbWF0aW9uLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBVc2Ugd2l0aGluIGFuIGFuaW1hdGlvbiBgcXVlcnkoKWAgY2FsbCB0byBpc3N1ZSBhIHRpbWluZyBnYXAgYWZ0ZXJcbiAqIGVhY2ggcXVlcmllZCBpdGVtIGlzIGFuaW1hdGVkLlxuICpcbiAqIEBwYXJhbSB0aW1pbmdzIEEgZGVsYXkgdmFsdWUuXG4gKiBAcGFyYW0gYW5pbWF0aW9uIE9uZSBvcmUgbW9yZSBhbmltYXRpb24gc3RlcHMuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHN0YWdnZXIgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCBhIGNvbnRhaW5lciBlbGVtZW50IHdyYXBzIGEgbGlzdCBvZiBpdGVtcyBzdGFtcGVkIG91dFxuICogYnkgYW4gYG5nRm9yYC4gVGhlIGNvbnRhaW5lciBlbGVtZW50IGNvbnRhaW5zIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHRoYXQgd2lsbCBsYXRlciBiZSBzZXRcbiAqIHRvIHF1ZXJ5IGZvciBlYWNoIG9mIHRoZSBpbm5lciBpdGVtcy5cbiAqXG4gKiBFYWNoIHRpbWUgaXRlbXMgYXJlIGFkZGVkLCB0aGUgb3BhY2l0eSBmYWRlLWluIGFuaW1hdGlvbiBydW5zLFxuICogYW5kIGVhY2ggcmVtb3ZlZCBpdGVtIGlzIGZhZGVkIG91dC5cbiAqIFdoZW4gZWl0aGVyIG9mIHRoZXNlIGFuaW1hdGlvbnMgb2NjdXIsIHRoZSBzdGFnZ2VyIGVmZmVjdCBpc1xuICogYXBwbGllZCBhZnRlciBlYWNoIGl0ZW0ncyBhbmltYXRpb24gaXMgc3RhcnRlZC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIGxpc3QuY29tcG9uZW50Lmh0bWwgLS0+XG4gKiA8YnV0dG9uIChjbGljayk9XCJ0b2dnbGUoKVwiPlNob3cgLyBIaWRlIEl0ZW1zPC9idXR0b24+XG4gKiA8aHIgLz5cbiAqIDxkaXYgW0BsaXN0QW5pbWF0aW9uXT1cIml0ZW1zLmxlbmd0aFwiPlxuICogICA8ZGl2ICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zXCI+XG4gKiAgICAge3sgaXRlbSB9fVxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogSGVyZSBpcyB0aGUgY29tcG9uZW50IGNvZGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHt0cmlnZ2VyLCB0cmFuc2l0aW9uLCBzdHlsZSwgYW5pbWF0ZSwgcXVlcnksIHN0YWdnZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuICogQENvbXBvbmVudCh7XG4gKiAgIHRlbXBsYXRlVXJsOiAnbGlzdC5jb21wb25lbnQuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdsaXN0QW5pbWF0aW9uJywgW1xuICogICAgIC4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBMaXN0Q29tcG9uZW50IHtcbiAqICAgaXRlbXMgPSBbXTtcbiAqXG4gKiAgIHNob3dJdGVtcygpIHtcbiAqICAgICB0aGlzLml0ZW1zID0gWzAsMSwyLDMsNF07XG4gKiAgIH1cbiAqXG4gKiAgIGhpZGVJdGVtcygpIHtcbiAqICAgICB0aGlzLml0ZW1zID0gW107XG4gKiAgIH1cbiAqXG4gKiAgIHRvZ2dsZSgpIHtcbiAqICAgICB0aGlzLml0ZW1zLmxlbmd0aCA/IHRoaXMuaGlkZUl0ZW1zKCkgOiB0aGlzLnNob3dJdGVtcygpO1xuICogICAgfVxuICogIH1cbiAqIGBgYFxuICpcbiAqIEhlcmUgaXMgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGNvZGU6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgdHJhbnNpdGlvbignKiA9PiAqJywgWyAvLyBlYWNoIHRpbWUgdGhlIGJpbmRpbmcgdmFsdWUgY2hhbmdlc1xuICogICAgIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgICBzdGFnZ2VyKDEwMCwgW1xuICogICAgICAgICBhbmltYXRlKCcwLjVzJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogICAgICAgXSlcbiAqICAgICBdKSxcbiAqICAgICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSlcbiAqICAgXSlcbiAqIF0pXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdnZXIoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlciwgdGltaW5ncywgYW5pbWF0aW9ufTtcbn1cbiJdfQ==