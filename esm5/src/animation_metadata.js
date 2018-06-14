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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQWtKSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUF5UDlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtSkc7QUFDSCxNQUFNLGtCQUFrQixJQUFZLEVBQUUsV0FBZ0M7SUFDcEUsT0FBTyxFQUFDLElBQUksaUJBQStCLEVBQUUsSUFBSSxNQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO0FBQy9FLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVERztBQUNILE1BQU0sa0JBQ0YsT0FBd0IsRUFBRSxNQUNYO0lBRFcsdUJBQUEsRUFBQSxhQUNYO0lBQ2pCLE9BQU8sRUFBQyxJQUFJLGlCQUErQixFQUFFLE1BQU0sUUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSCxNQUFNLGdCQUNGLEtBQTBCLEVBQUUsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUNyRSxPQUFPLEVBQUMsSUFBSSxlQUE2QixFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUE4Qkk7QUFDSixNQUFNLG1CQUFtQixLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFFMUYsT0FBTyxFQUFDLElBQUksa0JBQWdDLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxQ0k7QUFDSixNQUFNLGdCQUNGLE1BQzJDO0lBQzdDLE9BQU8sRUFBQyxJQUFJLGVBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTBCSTtBQUNKLE1BQU0sZ0JBQ0YsSUFBWSxFQUFFLE1BQThCLEVBQzVDLE9BQXlDO0lBQzNDLE9BQU8sRUFBQyxJQUFJLGVBQTZCLEVBQUUsSUFBSSxNQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNILE1BQU0sb0JBQW9CLEtBQStCO0lBQ3ZELE9BQU8sRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssT0FBQSxFQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxS0k7QUFDSixNQUFNLHFCQUNGLGVBQ3NFLEVBQ3RFLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsT0FBTyxFQUFDLElBQUksb0JBQWtDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDcEcsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQ0c7QUFDSCxNQUFNLG9CQUNGLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsT0FBTyxFQUFDLElBQUksbUJBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sdUJBQXVCLE9BQTBDO0lBQTFDLHdCQUFBLEVBQUEsY0FBMEM7SUFFckUsT0FBTyxFQUFDLElBQUksc0JBQW9DLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sdUJBQ0YsU0FBcUMsRUFDckMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxPQUFPLEVBQUMsSUFBSSxxQkFBa0MsRUFBRSxTQUFTLFdBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3RFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0ZHO0FBQ0gsTUFBTSxnQkFDRixRQUFnQixFQUFFLFNBQWtELEVBQ3BFLE9BQTRDO0lBQTVDLHdCQUFBLEVBQUEsY0FBNEM7SUFDOUMsT0FBTyxFQUFDLElBQUksZ0JBQTZCLEVBQUUsUUFBUSxVQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkVHO0FBQ0gsTUFBTSxrQkFDRixPQUF3QixFQUN4QixTQUFrRDtJQUNwRCxPQUFPLEVBQUMsSUFBSSxrQkFBK0IsRUFBRSxPQUFPLFNBQUEsRUFBRSxTQUFTLFdBQUEsRUFBQyxDQUFDO0FBQ25FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNldCBvZiBDU1Mgc3R5bGVzIGZvciB1c2UgaW4gYW4gYW5pbWF0aW9uIHN0eWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIMm1U3R5bGVEYXRhIHsgW2tleTogc3RyaW5nXTogc3RyaW5nfG51bWJlcjsgfVxuXG4vKipcbiogUmVwcmVzZW50cyBhbmltYXRpb24tc3RlcCB0aW1pbmcgcGFyYW1ldGVycyBmb3IgYW4gYW5pbWF0aW9uIHN0ZXAuICBcbiogQHNlZSBgYW5pbWF0ZSgpYFxuKi9cbmV4cG9ydCBkZWNsYXJlIHR5cGUgQW5pbWF0ZVRpbWluZ3MgPSB7XG4gIC8qKlxuICAgKiBUaGUgZnVsbCBkdXJhdGlvbiBvZiBhbiBhbmltYXRpb24gc3RlcC4gQSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdCxcbiAgICogc3VjaCBhcyBcIjFzXCIgb3IgXCIxMG1zXCIgZm9yIG9uZSBzZWNvbmQgYW5kIDEwIG1pbGxpc2Vjb25kcywgcmVzcGVjdGl2ZWx5LlxuICAgKiBUaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIGR1cmF0aW9uOiBudW1iZXIsXG4gIC8qKlxuICAgKiBUaGUgZGVsYXkgaW4gYXBwbHlpbmcgYW4gYW5pbWF0aW9uIHN0ZXAuIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQuXG4gICAqIFRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgZGVsYXk6IG51bWJlcixcbiAgLyoqXG4gICAqIEFuIGVhc2luZyBzdHlsZSB0aGF0IGNvbnRyb2xzIGhvdyBhbiBhbmltYXRpb25zIHN0ZXAgYWNjZWxlcmF0ZXNcbiAgICogYW5kIGRlY2VsZXJhdGVzIGR1cmluZyBpdHMgcnVuIHRpbWUuIEFuIGVhc2luZyBmdW5jdGlvbiBzdWNoIGFzIGBjdWJpYy1iZXppZXIoKWAsXG4gICAqIG9yIG9uZSBvZiB0aGUgZm9sbG93aW5nIGNvbnN0YW50czpcbiAgICogLSBgZWFzZS1pbmBcbiAgICogLSBgZWFzZS1vdXRgXG4gICAqIC0gYGVhc2UtaW4tYW5kLW91dGBcbiAgICovXG4gIGVhc2luZzogc3RyaW5nIHwgbnVsbFxufTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gT3B0aW9ucyB0aGF0IGNvbnRyb2wgYW5pbWF0aW9uIHN0eWxpbmcgYW5kIHRpbWluZy5cbiAqIFRoZSBmb2xsb3dpbmcgYW5pbWF0aW9uIGZ1bmN0aW9ucyBhY2NlcHQgYEFuaW1hdGlvbk9wdGlvbnNgIGRhdGE6XG4gKlxuICogLSBgdHJhbnNpdGlvbigpYFxuICogLSBgc2VxdWVuY2UoKWBcbiAqIC0gYGdyb3VwKClgXG4gKiAtIGBxdWVyeSgpYFxuICogLSBgYW5pbWF0aW9uKClgXG4gKiAtIGB1c2VBbmltYXRpb24oKWBcbiAqIC0gYGFuaW1hdGVDaGlsZCgpYFxuICpcbiAqIFByb2dyYW1tYXRpYyBhbmltYXRpb25zIGJ1aWx0IHVzaW5nIHRoZSBgQW5pbWF0aW9uQnVpbGRlcmAgc2VydmljZSBhbHNvXG4gKiBtYWtlIHVzZSBvZiBgQW5pbWF0aW9uT3B0aW9uc2AuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFNldHMgYSB0aW1lLWRlbGF5IGZvciBpbml0aWF0aW5nIGFuIGFuaW1hdGlvbiBhY3Rpb24uXG4gICAqIEEgbnVtYmVyIGFuZCBvcHRpb25hbCB0aW1lIHVuaXQsIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kXG4gICAqIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5UaGUgZGVmYXVsdCB1bml0IGlzIG1pbGxpc2Vjb25kcy5cbiAgICogRGVmYXVsdCB2YWx1ZSBpcyAwLCBtZWFuaW5nIG5vIGRlbGF5LlxuICAgKi9cbiAgZGVsYXk/OiBudW1iZXJ8c3RyaW5nO1xuICAvKipcbiAgKiBBIHNldCBvZiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgbW9kaWZ5IHN0eWxpbmcgYW5kIHRpbWluZ1xuICAqIHdoZW4gYW4gYW5pbWF0aW9uIGFjdGlvbiBzdGFydHMuIEFuIGFycmF5IG9mIGtleS12YWx1ZSBwYWlycywgd2hlcmUgdGhlIHByb3ZpZGVkIHZhbHVlXG4gICogaXMgdXNlZCBhcyBhIGRlZmF1bHQuXG4gICovXG4gIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBZGRzIGR1cmF0aW9uIG9wdGlvbnMgdG8gY29udHJvbCBhbmltYXRpb24gc3R5bGluZyBhbmQgdGltaW5nIGZvciBhIGNoaWxkIGFuaW1hdGlvbi5cbiAqXG4gKiBAc2VlIGBhbmltYXRlQ2hpbGQoKWBcbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGVDaGlsZE9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHsgZHVyYXRpb24/OiBudW1iZXJ8c3RyaW5nOyB9XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvbnN0YW50cyBmb3IgdGhlIGNhdGVnb3JpZXMgb2YgcGFyYW1ldGVycyB0aGF0IGNhbiBiZSBkZWZpbmVkIGZvciBhbmltYXRpb25zLlxuICpcbiAqIEEgY29ycmVzcG9uZGluZyBmdW5jdGlvbiBkZWZpbmVzIGEgc2V0IG9mIHBhcmFtZXRlcnMgZm9yIGVhY2ggY2F0ZWdvcnksIGFuZFxuICogY29sbGVjdHMgdGhlbSBpbnRvIGEgY29ycmVzcG9uZGluZyBgQW5pbWF0aW9uTWV0YWRhdGFgIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlIHtcbiAgLyoqXG4gICAqIEFzc29jaWF0ZXMgYSBuYW1lZCBhbmltYXRpb24gc3RhdGUgd2l0aCBhIHNldCBvZiBDU1Mgc3R5bGVzLlxuICAgKiBTZWUgYHN0YXRlKClgXG4gICAqL1xuICBTdGF0ZSA9IDAsXG4gIC8qKlxuICAgKiBEYXRhIGZvciBhIHRyYW5zaXRpb24gZnJvbSBvbmUgYW5pbWF0aW9uIHN0YXRlIHRvIGFub3RoZXIuXG4gICAqIFNlZSBgdHJhbnNpdGlvbigpYFxuICAgKi9cbiAgVHJhbnNpdGlvbiA9IDEsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBgc2VxdWVuY2UoKWBcbiAgICovXG4gIFNlcXVlbmNlID0gMixcbiAgLyoqXG4gICAqIENvbnRhaW5zIGEgc2V0IG9mIGFuaW1hdGlvbiBzdGVwcy5cbiAgICogU2VlIGBncm91cCgpYFxuICAgKi9cbiAgR3JvdXAgPSAzLFxuICAvKipcbiAgICogQ29udGFpbnMgYW4gYW5pbWF0aW9uIHN0ZXAuXG4gICAqIFNlZSBgYW5pbWF0ZSgpYFxuICAgKi9cbiAgQW5pbWF0ZSA9IDQsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHNldCBvZiBhbmltYXRpb24gc3RlcHMuXG4gICAqIFNlZSBga2V5ZnJhbWVzKClgXG4gICAqL1xuICBLZXlmcmFtZXMgPSA1LFxuICAvKipcbiAgICogQ29udGFpbnMgYSBzZXQgb2YgQ1NTIHByb3BlcnR5LXZhbHVlIHBhaXJzIGludG8gYSBuYW1lZCBzdHlsZS5cbiAgICogU2VlIGBzdHlsZSgpYFxuICAgKi9cbiAgU3R5bGUgPSA2LFxuICAvKipcbiAgICogQXNzb2NpYXRlcyBhbiBhbmltYXRpb24gd2l0aCBhbiBlbnRyeSB0cmlnZ2VyIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQuXG4gICAqIFNlZSBgdHJpZ2dlcigpYFxuICAgKi9cbiAgVHJpZ2dlciA9IDcsXG4gIC8qKlxuICAgKiBDb250YWlucyBhIHJlLXVzYWJsZSBhbmltYXRpb24uXG4gICAqIFNlZSBgYW5pbWF0aW9uKClgXG4gICAqL1xuICBSZWZlcmVuY2UgPSA4LFxuICAvKipcbiAgICogQ29udGFpbnMgZGF0YSB0byB1c2UgaW4gZXhlY3V0aW5nIGNoaWxkIGFuaW1hdGlvbnMgcmV0dXJuZWQgYnkgYSBxdWVyeS5cbiAgICogU2VlIGBhbmltYXRlQ2hpbGQoKWBcbiAgICovXG4gIEFuaW1hdGVDaGlsZCA9IDksXG4gIC8qKlxuICAgKiBDb250YWlucyBhbmltYXRpb24gcGFyYW1ldGVycyBmb3IgYSByZS11c2FibGUgYW5pbWF0aW9uLlxuICAgKiBTZWUgYHVzZUFuaW1hdGlvbigpYFxuICAgKi9cbiAgQW5pbWF0ZVJlZiA9IDEwLFxuICAvKipcbiAgICogQ29udGFpbnMgY2hpbGQtYW5pbWF0aW9uIHF1ZXJ5IGRhdGEuXG4gICAqIFNlZSBgcXVlcnkoKWBcbiAgICovXG4gIFF1ZXJ5ID0gMTEsXG4gIC8qKlxuICAgKiBDb250YWlucyBkYXRhIGZvciBzdGFnZ2VyaW5nIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAgICogU2VlIGBzdGFnZ2VyKClgXG4gICAqL1xuICBTdGFnZ2VyID0gMTJcbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgYXV0b21hdGljIHN0eWxpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBVVRPX1NUWUxFID0gJyonO1xuXG4vKipcbiAqIEJhc2UgZm9yIGFuaW1hdGlvbiBkYXRhIHN0cnVjdHVyZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uTWV0YWRhdGEgeyB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGU7IH1cblxuLyoqXG4gKiBDb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlci4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGVcbiAqIGB0cmlnZ2VyKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAgKiBUaGUgdHJpZ2dlciBuYW1lLCB1c2VkIHRvIGFzc29jaWF0ZSBpdCB3aXRoIGFuIGVsZW1lbnQuIFVuaXF1ZSB3aXRoaW4gdGhlIGNvbXBvbmVudC5cbiAgICAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBbiBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QsIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2Ygc3RhdGUgYW5kIHRyYW5zaXRpb24gZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgZGVmaW5pdGlvbnM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IHtwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IGFueX19fG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzdGF0ZSBieSBhc3NvY2lhdGluZyBhIHN0YXRlIG5hbWUgd2l0aCBhIHNldCBvZiBDU1Mgc3R5bGVzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHN0YXRlKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgc3RhdGUgbmFtZSwgdW5pcXVlIHdpdGhpbiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogIFRoZSBDU1Mgc3R5bGVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHN0YXRlLlxuICAgKi9cbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZ1xuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICAgKi9cbiAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX07XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uLiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZVxuICogYHRyYW5zaXRpb24oKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiB0aGF0IGRlc2NyaWJlcyBhIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIGV4cHI6IHN0cmluZ3xcbiAgICAgICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pO1xuICAvKipcbiAgICogT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMgdG8gd2hpY2ggdGhpcyB0cmFuc2l0aW9uIGFwcGxpZXMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSByZXVzYWJsZSBhbmltYXRpb24sIHdoaWNoIGlzIGEgY29sbGVjdGlvbiBvZiBpbmRpdmlkdWFsIGFuaW1hdGlvbiBzdGVwcy5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRpb24oKWAgZnVuY3Rpb24sIGFuZFxuICogcGFzc2VkIHRvIHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIC8qKlxuICAgKiBBbiBvcHRpb25zIG9iamVjdCBjb250YWluaW5nIGEgZGVsYXkgYW5kXG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gICAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uIERlZmF1bHQgZGVsYXkgaXMgMC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHF1ZXJ5LiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5XG4gKiB0aGUgYHF1ZXJ5KClgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiAgVGhlIENTUyBzZWxlY3RvciBmb3IgdGhpcyBxdWVyeS5cbiAgICovXG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPbmUgb3IgbW9yZSBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICAgKi9cbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQSBxdWVyeSBvcHRpb25zIG9iamVjdC5cbiAgICovXG4gIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIGtleWZyYW1lcyBzZXF1ZW5jZS4gSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieVxuICogdGhlIGBrZXlmcmFtZXMoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdHlsZXMuXG4gICAqL1xuICBzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gc3R5bGUuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBgc3R5bGUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEEgc2V0IG9mIENTUyBzdHlsZSBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgc3R5bGVzOiAnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn18QXJyYXk8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn18JyonPjtcbiAgLyoqXG4gICAqIEEgcGVyY2VudGFnZSBvZiB0aGUgdG90YWwgYW5pbWF0ZSB0aW1lIGF0IHdoaWNoIHRoZSBzdHlsZSBpcyB0byBiZSBhcHBsaWVkLlxuICAgKi9cbiAgb2Zmc2V0OiBudW1iZXJ8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYW4gYW5pbWF0aW9uIHN0ZXAuIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnlcbiAqIHRoZSBgYW5pbWF0ZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgdGltaW5nIGRhdGEgZm9yIHRoZSBzdGVwLlxuICAgKi9cbiAgdGltaW5nczogc3RyaW5nfG51bWJlcnxBbmltYXRlVGltaW5ncztcbiAgLyoqXG4gICAqIEEgc2V0IG9mIHN0eWxlcyB1c2VkIGluIHRoZSBzdGVwLlxuICAgKi9cbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhfEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGF8bnVsbDtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgYSBjaGlsZCBhbmltYXRpb24sIHRoYXQgY2FuIGJlIHJ1biBleHBsaWNpdGx5IHdoZW4gdGhlIHBhcmVudCBpcyBydW4uXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZUNoaWxkYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlQ2hpbGRNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhIHJldXNhYmxlIGFuaW1hdGlvbi5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGB1c2VBbmltYXRpb24oKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZVJlZk1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogQW4gYW5pbWF0aW9uIHJlZmVyZW5jZSBvYmplY3QuXG4gICAqL1xuICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqIEluc3RhbnRpYXRlZCBhbmQgcmV0dXJuZWQgYnkgdGhlIGBzZXF1ZW5jZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICAvKipcbiAgICogIEFuIGFycmF5IG9mIGFuaW1hdGlvbiBzdGVwIG9iamVjdHMuXG4gICAqL1xuICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAgICogY2FuIGJlIG92ZXJyaWRkZW4gb24gaW52b2NhdGlvbi4gRGVmYXVsdCBkZWxheSBpcyAwLlxuICAgKi9cbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyBhbiBhbmltYXRpb24gZ3JvdXAuXG4gKiBJbnN0YW50aWF0ZWQgYW5kIHJldHVybmVkIGJ5IHRoZSBgZ3JvdXAoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uR3JvdXBNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBvciBzdHlsZSBzdGVwcyB0aGF0IGZvcm0gdGhpcyBncm91cC5cbiAgICovXG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICAvKipcbiAgICogQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzIHRoYXQgcHJvdmlkZSBzdHlsaW5nIGRlZmF1bHRzIGFuZFxuICAgKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLiBEZWZhdWx0IGRlbGF5IGlzIDAuXG4gICAqL1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIGFuaW1hdGlvbiBxdWVyeSBvcHRpb25zLlxuICogUGFzc2VkIHRvIHRoZSBgcXVlcnkoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25RdWVyeU9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFRydWUgaWYgdGhpcyBxdWVyeSBpcyBvcHRpb25hbCwgZmFsc2UgaWYgaXQgaXMgcmVxdWlyZWQuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAqIEEgcmVxdWlyZWQgcXVlcnkgdGhyb3dzIGFuIGVycm9yIGlmIG5vIGVsZW1lbnRzIGFyZSByZXRyaWV2ZWQgd2hlblxuICAgKiB0aGUgcXVlcnkgaXMgZXhlY3V0ZWQuIEFuIG9wdGlvbmFsIHF1ZXJ5IGRvZXMgbm90LlxuICAgKlxuICAgKi9cbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKipcbiAgICogQSBtYXhpbXVtIHRvdGFsIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVybiBmcm9tIHRoZSBxdWVyeS5cbiAgICogSWYgbmVnYXRpdmUsIHJlc3VsdHMgYXJlIGxpbWl0ZWQgZnJvbSB0aGUgZW5kIG9mIHRoZSBxdWVyeSBsaXN0IHRvd2FyZHMgdGhlIGJlZ2lubmluZy5cbiAgICogQnkgZGVmYXVsdCwgcmVzdWx0cyBhcmUgbm90IGxpbWl0ZWQuXG4gICAqL1xuICBsaW1pdD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBFbmNhcHN1bGF0ZXMgcGFyYW1ldGVycyBmb3Igc3RhZ2dlcmluZyB0aGUgc3RhcnQgdGltZXMgb2YgYSBzZXQgb2YgYW5pbWF0aW9uIHN0ZXBzLlxuICogSW5zdGFudGlhdGVkIGFuZCByZXR1cm5lZCBieSB0aGUgYHN0YWdnZXIoKWAgZnVuY3Rpb24uXG4gKiovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1pbmcgZGF0YSBmb3IgdGhlIHN0ZXBzLlxuICAgKi9cbiAgdGltaW5nczogc3RyaW5nfG51bWJlcjtcbiAgLyoqXG4gICAqIE9uZSBvciBtb3JlIGFuaW1hdGlvbiBzdGVwcy5cbiAgICovXG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmFtZWQgYW5pbWF0aW9uIHRyaWdnZXIsIGNvbnRhaW5pbmcgYSAgbGlzdCBvZiBgc3RhdGUoKWBcbiAqIGFuZCBgdHJhbnNpdGlvbigpYCBlbnRyaWVzIHRvIGJlIGV2YWx1YXRlZCB3aGVuIHRoZSBleHByZXNzaW9uXG4gKiBib3VuZCB0byB0aGUgdHJpZ2dlciBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBuYW1lIEFuIGlkZW50aWZ5aW5nIHN0cmluZy5cbiAqIEBwYXJhbSBkZWZpbml0aW9ucyAgQW4gYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0LCBjb250YWluaW5nIGFuIGFycmF5IG9mIGBzdGF0ZSgpYFxuICogYW5kIGB0cmFuc2l0aW9uKClgIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgdHJpZ2dlciBkYXRhLlxuICogXG4gKiBAdXNhZ2VOb3Rlc1xuICogRGVmaW5lIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIGluIHRoZSBgYW5pbWF0aW9uc2Agc2VjdGlvbiBvZiBgQENvbXBvbmVudGAgbWV0YWRhdGEuXG4gKiBJbiB0aGUgdGVtcGxhdGUsIHJlZmVyZW5jZSB0aGUgdHJpZ2dlciBieSBuYW1lIGFuZCBiaW5kIGl0IHRvIGEgdHJpZ2dlciBleHByZXNzaW9uIHRoYXRcbiAqIGV2YWx1YXRlcyB0byBhIGRlZmluZWQgYW5pbWF0aW9uIHN0YXRlLCB1c2luZyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiBgW0B0cmlnZ2VyTmFtZV09XCJleHByZXNzaW9uXCJgXG4gKlxuICogQW5pbWF0aW9uIHRyaWdnZXIgYmluZGluZ3MgY29udmVydCBhbGwgdmFsdWVzIHRvIHN0cmluZ3MsIGFuZCB0aGVuIG1hdGNoIHRoZSBcbiAqIHByZXZpb3VzIGFuZCBjdXJyZW50IHZhbHVlcyBhZ2FpbnN0IGFueSBsaW5rZWQgdHJhbnNpdGlvbnMuXG4gKiBCb29sZWFucyBjYW4gYmUgc3BlY2lmaWVkIGFzIGAxYCBvciBgdHJ1ZWAgYW5kIGAwYCBvciBgZmFsc2VgLlxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlXG4gKiBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHJlZmVyZW5jZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWRcbiAqIG5hbWUgdmFsdWUuXG4gKiBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHZhbHVlIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5IGNvbnNpc3Rpbmcgb2Ygc3RhdGUgYW5kXG4gKiB0cmFuc2l0aW9uIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6IFwibXktY29tcG9uZW50XCIsXG4gKiAgIHRlbXBsYXRlVXJsOiBcIm15LWNvbXBvbmVudC10cGwuaHRtbFwiLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJzb21ldGhpbmdcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb21wb25lbnQgbWFrZXMgdXNlIG9mIHRoZSBkZWZpbmVkIHRyaWdnZXJcbiAqIGJ5IGJpbmRpbmcgdG8gYW4gZWxlbWVudCB3aXRoaW4gaXRzIHRlbXBsYXRlIGNvZGUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2luZyBhbiBpbmxpbmUgZnVuY3Rpb25cbiAqIFRoZSBgdHJhbnNpdGlvbmAgYW5pbWF0aW9uIG1ldGhvZCBhbHNvIHN1cHBvcnRzIHJlYWRpbmcgYW4gaW5saW5lIGZ1bmN0aW9uIHdoaWNoIGNhbiBkZWNpZGVcbiAqIGlmIGl0cyBhc3NvY2lhdGVkIGFuaW1hdGlvbiBzaG91bGQgYmUgcnVuLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoaXMgbWV0aG9kIGlzIHJ1biBlYWNoIHRpbWUgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIHRyaWdnZXIgdmFsdWUgY2hhbmdlcy5cbiAqIGZ1bmN0aW9uIG15SW5saW5lTWF0Y2hlckZuKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTpcbiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gKiAgIC8vIG5vdGljZSB0aGF0IGBlbGVtZW50YCBhbmQgYHBhcmFtc2AgYXJlIGFsc28gYXZhaWxhYmxlIGhlcmVcbiAqICAgcmV0dXJuIHRvU3RhdGUgPT0gJ3llcy1wbGVhc2UtYW5pbWF0ZSc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteS1jb21wb25lbnQtdHBsLmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbXlBbmltYXRpb25UcmlnZ2VyJywgW1xuICogICAgICAgdHJhbnNpdGlvbihteUlubGluZU1hdGNoZXJGbiwgW1xuICogICAgICAgICAvLyB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlIGNvZGVcbiAqICAgICAgIF0pLFxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJ5ZXMtcGxlYXNlLWFuaW1hdGVcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBEaXNhYmxpbmcgQW5pbWF0aW9uc1xuICogV2hlbiB0cnVlLCB0aGUgc3BlY2lhbCBhbmltYXRpb24gY29udHJvbCBiaW5kaW5nIGBALmRpc2FibGVkYCBiaW5kaW5nIHByZXZlbnRzIFxuICogYWxsIGFuaW1hdGlvbnMgZnJvbSByZW5kZXJpbmcuXG4gKiBQbGFjZSB0aGUgIGBALmRpc2FibGVkYCBiaW5kaW5nIG9uIGFuIGVsZW1lbnQgdG8gZGlzYWJsZVxuICogYW5pbWF0aW9ucyBvbiB0aGUgZWxlbWVudCBpdHNlbGYsIGFzIHdlbGwgYXMgYW55IGlubmVyIGFuaW1hdGlvbiB0cmlnZ2Vyc1xuICogd2l0aGluIHRoZSBlbGVtZW50LlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gdXNlIHRoaXMgZmVhdHVyZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0AuZGlzYWJsZWRdPVwiaXNEaXNhYmxlZFwiPlxuICogICAgICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcImNoaWxkQW5pbWF0aW9uXCIsIFtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGlzRGlzYWJsZWQgPSB0cnVlO1xuICogICBleHAgPSAnLi4uJztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdoZW4gYEAuZGlzYWJsZWRgIGlzIHRydWUsIGl0IHByZXZlbnRzIHRoZSBgQGNoaWxkQW5pbWF0aW9uYCB0cmlnZ2VyIGZyb20gYW5pbWF0aW5nLFxuICogYWxvbmcgd2l0aCBhbnkgaW5uZXIgYW5pbWF0aW9ucy5cbiAqXG4gKiAjIyMgRGlzYWJsZSBhbmltYXRpb25zIGFwcGxpY2F0aW9uLXdpZGVcbiAqIFdoZW4gYW4gYXJlYSBvZiB0aGUgdGVtcGxhdGUgaXMgc2V0IHRvIGhhdmUgYW5pbWF0aW9ucyBkaXNhYmxlZCwgXG4gKiAqKmFsbCoqIGlubmVyIGNvbXBvbmVudHMgaGF2ZSB0aGVpciBhbmltYXRpb25zIGRpc2FibGVkIGFzIHdlbGwuXG4gKiBUaGlzIG1lYW5zIHRoYXQgeW91IGNhbiBkaXNhYmxlIGFsbCBhbmltYXRpb25zIGZvciBhbiBhcHBcbiAqIGJ5IHBsYWNpbmcgYSBob3N0IGJpbmRpbmcgc2V0IG9uIGBALmRpc2FibGVkYCBvbiB0aGUgdG9wbW9zdCBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0NvbXBvbmVudCwgSG9zdEJpbmRpbmd9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcC1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCcsXG4gKiB9KVxuICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAqICAgQEhvc3RCaW5kaW5nKCdALmRpc2FibGVkJylcbiAqICAgcHVibGljIGFuaW1hdGlvbnNEaXNhYmxlZCA9IHRydWU7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgT3ZlcnJpZGluZyBkaXNhYmxlbWVudCBvZiBpbm5lciBhbmltYXRpb25zXG4gKiBEZXNwaXRlIGlubmVyIGFuaW1hdGlvbnMgYmVpbmcgZGlzYWJsZWQsIGEgcGFyZW50IGFuaW1hdGlvbiBjYW4gYHF1ZXJ5KClgXG4gKiBmb3IgaW5uZXIgZWxlbWVudHMgbG9jYXRlZCBpbiBkaXNhYmxlZCBhcmVhcyBvZiB0aGUgdGVtcGxhdGUgYW5kIHN0aWxsIGFuaW1hdGUgXG4gKiB0aGVtIGlmIG5lZWRlZC4gVGhpcyBpcyBhbHNvIHRoZSBjYXNlIGZvciB3aGVuIGEgc3ViIGFuaW1hdGlvbiBpcyBcbiAqIHF1ZXJpZWQgYnkgYSBwYXJlbnQgYW5kIHRoZW4gbGF0ZXIgYW5pbWF0ZWQgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC5cbiAqXG4gKiAjIyMgRGV0ZWN0aW5nIHdoZW4gYW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXG4gKiBJZiBhIHJlZ2lvbiBvZiB0aGUgRE9NIChvciB0aGUgZW50aXJlIGFwcGxpY2F0aW9uKSBoYXMgaXRzIGFuaW1hdGlvbnMgZGlzYWJsZWQsIHRoZSBhbmltYXRpb25cbiAqIHRyaWdnZXIgY2FsbGJhY2tzIHN0aWxsIGZpcmUsIGJ1dCBmb3IgemVybyBzZWNvbmRzLiBXaGVuIHRoZSBjYWxsYmFjayBmaXJlcywgaXQgcHJvdmlkZXNcbiAqIGFuIGluc3RhbmNlIG9mIGFuIGBBbmltYXRpb25FdmVudGAuIElmIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLFxuICogdGhlIGAuZGlzYWJsZWRgIGZsYWcgb24gdGhlIGV2ZW50IGlzIHRydWUuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyKG5hbWU6IHN0cmluZywgZGVmaW5pdGlvbnM6IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyLCBuYW1lLCBkZWZpbml0aW9ucywgb3B0aW9uczoge319O1xufVxuXG4vKipcbiAqIERlZmluZXMgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCBjb21iaW5lcyBzdHlsaW5nIGluZm9ybWF0aW9uIHdpdGggdGltaW5nIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSB0aW1pbmdzIFNldHMgYEFuaW1hdGVUaW1pbmdzYCBmb3IgdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBBIHN0cmluZyBpbiB0aGUgZm9ybWF0IFwiZHVyYXRpb24gW2RlbGF5XSBbZWFzaW5nXVwiLlxuICogIC0gRHVyYXRpb24gYW5kIGRlbGF5IGFyZSBleHByZXNzZWQgYXMgYSBudW1iZXIgYW5kIG9wdGlvbmFsIHRpbWUgdW5pdCxcbiAqIHN1Y2ggYXMgXCIxc1wiIG9yIFwiMTBtc1wiIGZvciBvbmUgc2Vjb25kIGFuZCAxMCBtaWxsaXNlY29uZHMsIHJlc3BlY3RpdmVseS5cbiAqIFRoZSBkZWZhdWx0IHVuaXQgaXMgbWlsbGlzZWNvbmRzLlxuICogIC0gVGhlIGVhc2luZyB2YWx1ZSBjb250cm9scyBob3cgdGhlIGFuaW1hdGlvbiBhY2NlbGVyYXRlcyBhbmQgZGVjZWxlcmF0ZXNcbiAqIGR1cmluZyBpdHMgcnVudGltZS4gVmFsdWUgaXMgb25lIG9mICBgZWFzZWAsIGBlYXNlLWluYCwgYGVhc2Utb3V0YCxcbiAqIGBlYXNlLWluLW91dGAsIG9yIGEgYGN1YmljLWJlemllcigpYCBmdW5jdGlvbiBjYWxsLlxuICogSWYgbm90IHN1cHBsaWVkLCBubyBlYXNpbmcgaXMgYXBwbGllZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhlIHN0cmluZyBcIjFzIDEwMG1zIGVhc2Utb3V0XCIgc3BlY2lmaWVzIGEgZHVyYXRpb24gb2ZcbiAqIDEwMDAgbWlsbGlzZWNvbmRzLCBhbmQgZGVsYXkgb2YgMTAwIG1zLCBhbmQgdGhlIFwiZWFzZS1vdXRcIiBlYXNpbmcgc3R5bGUsXG4gKiB3aGljaCBkZWNlbGVyYXRlcyBuZWFyIHRoZSBlbmQgb2YgdGhlIGR1cmF0aW9uLlxuICogQHBhcmFtIHN0eWxlcyBTZXRzIEFuaW1hdGlvblN0eWxlcyBmb3IgdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBBIGZ1bmN0aW9uIGNhbGwgdG8gZWl0aGVyIGBzdHlsZSgpYCBvciBga2V5ZnJhbWVzKClgXG4gKiB0aGF0IHJldHVybnMgYSBjb2xsZWN0aW9uIG9mIENTUyBzdHlsZSBlbnRyaWVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHBhcmVudCBhbmltYXRpb24uXG4gKiBXaGVuIG51bGwsIHVzZXMgdGhlIHN0eWxlcyBmcm9tIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZS5cbiAqIFRoaXMgaXMgdXNlZnVsIHdoZW4gZGVzY3JpYmluZyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IHdpbGwgY29tcGxldGUgYW4gYW5pbWF0aW9uO1xuICogc2VlIFwiQW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZVwiIGluIGB0cmFuc2l0aW9ucygpYC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgYW5pbWF0aW9uIHN0ZXAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIENhbGwgd2l0aGluIGFuIGFuaW1hdGlvbiBgc2VxdWVuY2UoKWAsIGBncm91cCgpYCwgb3JcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwgdG8gc3BlY2lmeSBhbiBhbmltYXRpb24gc3RlcFxuICogdGhhdCBhcHBsaWVzIGdpdmVuIHN0eWxlIGRhdGEgdG8gdGhlIHBhcmVudCBhbmltYXRpb24gZm9yIGEgZ2l2ZW4gYW1vdW50IG9mIHRpbWUuXG4gKlxuICogIyMjIFN5bnRheCBFeGFtcGxlc1xuICogKipUaW1pbmcgZXhhbXBsZXMqKlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgc2hvdyB2YXJpb3VzIGB0aW1pbmdzYCBzcGVjaWZpY2F0aW9ucy5cbiAqIC0gYGFuaW1hdGUoNTAwKWAgOiBEdXJhdGlvbiBpcyA1MDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjFzXCIpYCA6IER1cmF0aW9uIGlzIDEwMDAgbWlsbGlzZWNvbmRzLlxuICogLSBgYW5pbWF0ZShcIjEwMG1zIDAuNXNcIilgIDogRHVyYXRpb24gaXMgMTAwIG1pbGxpc2Vjb25kcywgZGVsYXkgaXMgNTAwIG1pbGxpc2Vjb25kcy5cbiAqIC0gYGFuaW1hdGUoXCI1cyBlYXNlLWluXCIpYCA6IER1cmF0aW9uIGlzIDUwMDAgbWlsbGlzZWNvbmRzLCBlYXNpbmcgaW4uXG4gKiAtIGBhbmltYXRlKFwiNXMgMTBtcyBjdWJpYy1iZXppZXIoLjE3LC42NywuODgsLjEpXCIpYCA6IER1cmF0aW9uIGlzIDUwMDAgbWlsbGlzZWNvbmRzLCBkZWxheSBpcyAxMFxuICogbWlsbGlzZWNvbmRzLCBlYXNpbmcgYWNjb3JkaW5nIHRvIGEgYmV6aWVyIGN1cnZlLlxuICpcbiAqICoqU3R5bGUgZXhhbXBsZXMqKlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjYWxscyBgc3R5bGUoKWAgdG8gc2V0IGEgc2luZ2xlIENTUyBzdHlsZS5cbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoNTAwLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiBgYGBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjYWxscyBga2V5ZnJhbWVzKClgIHRvIHNldCBhIENTUyBzdHlsZVxuICogdG8gZGlmZmVyZW50IHZhbHVlcyBmb3Igc3VjY2Vzc2l2ZSBrZXlmcmFtZXMuXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKDUwMCwga2V5ZnJhbWVzKFxuICogIFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImJsdWVcIiB9KSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqICBdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlciwgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHwgQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB8XG4gICAgICAgIG51bGwgPSBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZSwgc3R5bGVzLCB0aW1pbmdzfTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVmaW5lcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIGJlIHJ1biBpbiBwYXJhbGxlbC5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgQW4gYXJyYXkgb2YgYW5pbWF0aW9uIHN0ZXAgb2JqZWN0cy5cbiAqIC0gV2hlbiBzdGVwcyBhcmUgZGVmaW5lZCBieSBgc3R5bGUoKWAgb3IgYGFuaW1hdGUoKWBcbiAqIGZ1bmN0aW9uIGNhbGxzLCBlYWNoIGNhbGwgd2l0aGluIHRoZSBncm91cCBpcyBleGVjdXRlZCBpbnN0YW50bHkuXG4gKiAtIFRvIHNwZWNpZnkgb2Zmc2V0IHN0eWxlcyB0byBiZSBhcHBsaWVkIGF0IGEgbGF0ZXIgdGltZSwgZGVmaW5lIHN0ZXBzIHdpdGhcbiAqIGBrZXlmcmFtZXMoKWAsIG9yIHVzZSBgYW5pbWF0ZSgpYCBjYWxscyB3aXRoIGEgZGVsYXkgdmFsdWUuXG4gKiBGb3IgZXhhbXBsZTpcbiAqIFxuICogYGBgdHlwZXNjcmlwdFxuICogZ3JvdXAoW1xuICogICBhbmltYXRlKFwiMXNcIiwgeyBiYWNrZ3JvdW5kOiBcImJsYWNrXCIgfSkpXG4gKiAgIGFuaW1hdGUoXCIyc1wiLCB7IGNvbG9yOiBcIndoaXRlXCIgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgY29udGFpbmluZyBhIGRlbGF5IGFuZFxuICogZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycyB0aGF0IHByb3ZpZGUgc3R5bGluZyBkZWZhdWx0cyBhbmRcbiAqIGNhbiBiZSBvdmVycmlkZGVuIG9uIGludm9jYXRpb24uXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGdyb3VwIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEdyb3VwZWQgYW5pbWF0aW9ucyBhcmUgdXNlZnVsIHdoZW4gYSBzZXJpZXMgb2Ygc3R5bGVzIG11c3QgYmUgXG4gKiBhbmltYXRlZCBhdCBkaWZmZXJlbnQgc3RhcnRpbmcgdGltZXMgYW5kIGNsb3NlZCBvZmYgYXQgZGlmZmVyZW50IGVuZGluZyB0aW1lcy5cbiAqXG4gKiBXaGVuIGNhbGxlZCB3aXRoaW4gYSBgc2VxdWVuY2UoKWAgb3IgYVxuICogYHRyYW5zaXRpb24oKWAgY2FsbCwgZG9lcyBub3QgY29udGludWUgdG8gdGhlIG5leHRcbiAqIGluc3RydWN0aW9uIHVudGlsIGFsbCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXAoXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cCwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIERlZmluZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0byBiZSBydW4gc2VxdWVudGlhbGx5LCBvbmUgYnkgb25lLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBBbiBhcnJheSBvZiBhbmltYXRpb24gc3RlcCBvYmplY3RzLlxuICogLSBTdGVwcyBkZWZpbmVkIGJ5IGBzdHlsZSgpYCBjYWxscyBhcHBseSB0aGUgc3R5bGluZyBkYXRhIGltbWVkaWF0ZWx5LlxuICogLSBTdGVwcyBkZWZpbmVkIGJ5IGBhbmltYXRlKClgIGNhbGxzIGFwcGx5IHRoZSBzdHlsaW5nIGRhdGEgb3ZlciB0aW1lXG4gKiAgIGFzIHNwZWNpZmllZCBieSB0aGUgdGltaW5nIGRhdGEuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICBhbmltYXRlKFwiMXNcIiwgeyBvcGFjaXR5OiAxIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IGNvbnRhaW5pbmcgYSBkZWxheSBhbmRcbiAqIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMgdGhhdCBwcm92aWRlIHN0eWxpbmcgZGVmYXVsdHMgYW5kXG4gKiBjYW4gYmUgb3ZlcnJpZGRlbiBvbiBpbnZvY2F0aW9uLlxuICpcbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzZXF1ZW5jZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBXaGVuIHlvdSBwYXNzIGFuIGFycmF5IG9mIHN0ZXBzIHRvIGFcbiAqIGB0cmFuc2l0aW9uKClgIGNhbGwsIHRoZSBzdGVwcyBydW4gc2VxdWVudGlhbGx5IGJ5IGRlZmF1bHQuXG4gKiBDb21wYXJlIHRoaXMgdG8gdGhlIGBncm91cCgpYCBjYWxsLCB3aGljaCBydW5zIGFuaW1hdGlvbiBzdGVwcyBpbiBwYXJhbGxlbC5cbiAqXG4gKiBXaGVuIGEgc2VxdWVuY2UgaXMgdXNlZCB3aXRoaW4gYSBgZ3JvdXAoKWAgb3IgYSBgdHJhbnNpdGlvbigpYCBjYWxsLFxuICogZXhlY3V0aW9uIGNvbnRpbnVlcyB0byB0aGUgbmV4dCBpbnN0cnVjdGlvbiBvbmx5IGFmdGVyIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvblxuICogc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlKHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZSwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGEga2V5L3ZhbHVlIG9iamVjdCBjb250YWluaW5nIENTUyBwcm9wZXJ0aWVzL3N0eWxlcyB0aGF0XG4gKiBjYW4gdGhlbiBiZSB1c2VkIGZvciBhbiBhbmltYXRpb24gYHN0YXRlYCwgd2l0aGluIGFuIGFuaW1hdGlvbiBgc2VxdWVuY2VgLFxuICogb3IgYXMgc3R5bGluZyBkYXRhIGZvciBjYWxscyB0byBgYW5pbWF0ZSgpYCBhbmQgYGtleWZyYW1lcygpYC5cbiAqXG4gKiBAcGFyYW0gdG9rZW5zIEEgc2V0IG9mIENTUyBzdHlsZXMgb3IgSFRNTCBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIGFuIGFuaW1hdGlvbiBzdGF0ZS5cbiAqIFRoZSB2YWx1ZSBjYW4gYmUgYW55IG9mIHRoZSBmb2xsb3dpbmc6XG4gKiAtIEEga2V5LXZhbHVlIHN0eWxlIHBhaXIgYXNzb2NpYXRpbmcgYSBDU1MgcHJvcGVydHkgd2l0aCBhIHZhbHVlLlxuICogLSBBbiBhcnJheSBvZiBrZXktdmFsdWUgc3R5bGUgcGFpcnMuXG4gKiAtIEFuIGFzdGVyaXNrICgqKSwgdG8gdXNlIGF1dG8tc3R5bGluZywgd2hlcmUgc3R5bGVzIGFyZSBkZXJpdmVkIGZyb20gdGhlIGVsZW1lbnRcbiAqIGJlaW5nIGFuaW1hdGVkIGFuZCBhcHBsaWVkIHRvIHRoZSBhbmltYXRpb24gd2hlbiBpdCBzdGFydHMuXG4gKlxuICogQXV0by1zdHlsaW5nIGNhbiBiZSB1c2VkIHRvIGRlZmluZSBhIHN0YXRlIHRoYXQgZGVwZW5kcyBvbiBsYXlvdXQgb3Igb3RoZXIgXG4gKiBlbnZpcm9ubWVudGFsIGZhY3RvcnMuXG4gKlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHN0eWxlIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgY3JlYXRlIGFuaW1hdGlvbiBzdHlsZXMgdGhhdCBjb2xsZWN0IGEgc2V0IG9mXG4gKiBDU1MgcHJvcGVydHkgdmFsdWVzOlxuICogXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBzdHJpbmcgdmFsdWVzIGZvciBDU1MgcHJvcGVydGllc1xuICogc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiLCBjb2xvcjogXCJibHVlXCIgfSlcbiAqXG4gKiAvLyBudW1lcmljYWwgcGl4ZWwgdmFsdWVzXG4gKiBzdHlsZSh7IHdpZHRoOiAxMDAsIGhlaWdodDogMCB9KVxuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHVzZXMgYXV0by1zdHlsaW5nIHRvIGFsbG93IGEgY29tcG9uZW50IHRvIGFuaW1hdGUgZnJvbVxuICogYSBoZWlnaHQgb2YgMCB1cCB0byB0aGUgaGVpZ2h0IG9mIHRoZSBwYXJlbnQgZWxlbWVudDpcbiAqXG4gKiBgYGBcbiAqIHN0eWxlKHsgaGVpZ2h0OiAwIH0pLFxuICogYW5pbWF0ZShcIjFzXCIsIHN0eWxlKHsgaGVpZ2h0OiBcIipcIiB9KSlcbiAqIGBgYFxuICpcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZShcbiAgICB0b2tlbnM6ICcqJyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9IHxcbiAgICBBcnJheTwnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0+KTogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlLCBzdHlsZXM6IHRva2Vucywgb2Zmc2V0OiBudWxsfTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhbiBhbmltYXRpb24gc3RhdGUgd2l0aGluIGEgdHJpZ2dlciBhdHRhY2hlZCB0byBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSBuYW1lIE9uZSBvciBtb3JlIG5hbWVzIGZvciB0aGUgZGVmaW5lZCBzdGF0ZSBpbiBhIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmcuXG4gKiBUaGUgZm9sbG93aW5nIHJlc2VydmVkIHN0YXRlIG5hbWVzIGNhbiBiZSBzdXBwbGllZCB0byBkZWZpbmUgYSBzdHlsZSBmb3Igc3BlY2lmaWMgdXNlXG4gKiBjYXNlczpcbiAqXG4gKiAtIGB2b2lkYCBZb3UgY2FuIGFzc29jaWF0ZSBzdHlsZXMgd2l0aCB0aGlzIG5hbWUgdG8gYmUgdXNlZCB3aGVuXG4gKiB0aGUgZWxlbWVudCBpcyBkZXRhY2hlZCBmcm9tIHRoZSBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIHdoZW4gYW4gYG5nSWZgIGV2YWx1YXRlc1xuICogdG8gZmFsc2UsIHRoZSBzdGF0ZSBvZiB0aGUgYXNzb2NpYXRlZCBlbGVtZW50IGlzIHZvaWQuXG4gKiAgLSBgKmAgKGFzdGVyaXNrKSBJbmRpY2F0ZXMgdGhlIGRlZmF1bHQgc3RhdGUuIFlvdSBjYW4gYXNzb2NpYXRlIHN0eWxlcyB3aXRoIHRoaXMgbmFtZVxuICogdG8gYmUgdXNlZCBhcyB0aGUgZmFsbGJhY2sgd2hlbiB0aGUgc3RhdGUgdGhhdCBpcyBiZWluZyBhbmltYXRlZCBpcyBub3QgZGVjbGFyZWRcbiAqIHdpdGhpbiB0aGUgdHJpZ2dlci5cbiAqXG4gKiBAcGFyYW0gc3R5bGVzIEEgc2V0IG9mIENTUyBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc3RhdGUsIGNyZWF0ZWQgdXNpbmcgdGhlXG4gKiBgc3R5bGUoKWAgZnVuY3Rpb24uXG4gKiBUaGlzIHNldCBvZiBzdHlsZXMgcGVyc2lzdHMgb24gdGhlIGVsZW1lbnQgb25jZSB0aGUgc3RhdGUgaGFzIGJlZW4gcmVhY2hlZC5cbiAqIEBwYXJhbSBvcHRpb25zIFBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBzdGF0ZSB3aGVuIGl0IGlzIGludm9rZWQuXG4gKiAwIG9yIG1vcmUga2V5LXZhbHVlIHBhaXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIG5ldyBzdGF0ZSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBVc2UgdGhlIGB0cmlnZ2VyKClgIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHN0YXRlcyB0byBhbiBhbmltYXRpb24gdHJpZ2dlci5cbiAqIFVzZSB0aGUgYHRyYW5zaXRpb24oKWAgZnVuY3Rpb24gdG8gYW5pbWF0ZSBiZXR3ZWVuIHN0YXRlcy5cbiAqIFdoZW4gYSBzdGF0ZSBpcyBhY3RpdmUgd2l0aGluIGEgY29tcG9uZW50LCBpdHMgYXNzb2NpYXRlZCBzdHlsZXMgcGVyc2lzdCBvbiB0aGUgZWxlbWVudCxcbiAqIGV2ZW4gd2hlbiB0aGUgYW5pbWF0aW9uIGVuZHMuXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGUoXG4gICAgbmFtZTogc3RyaW5nLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsXG4gICAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX0pOiBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGUsIG5hbWUsIHN0eWxlcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHNldCBvZiBhbmltYXRpb24gc3R5bGVzLCBhc3NvY2lhdGluZyBlYWNoIHN0eWxlIHdpdGggYW4gb3B0aW9uYWwgYG9mZnNldGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHN0ZXBzIEEgc2V0IG9mIGFuaW1hdGlvbiBzdHlsZXMgd2l0aCBvcHRpb25hbCBvZmZzZXQgZGF0YS5cbiAqIFRoZSBvcHRpb25hbCBgb2Zmc2V0YCB2YWx1ZSBmb3IgYSBzdHlsZSBzcGVjaWZpZXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBhbmltYXRpb25cbiAqIHRpbWUgYXQgd2hpY2ggdGhhdCBzdHlsZSBpcyBhcHBsaWVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBrZXlmcmFtZXMgZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVXNlIHdpdGggdGhlIGBhbmltYXRlKClgIGNhbGwuIEluc3RlYWQgb2YgYXBwbHlpbmcgYW5pbWF0aW9uc1xuICogZnJvbSB0aGUgY3VycmVudCBzdGF0ZVxuICogdG8gdGhlIGRlc3RpbmF0aW9uIHN0YXRlLCBrZXlmcmFtZXMgZGVzY3JpYmUgaG93IGVhY2ggc3R5bGUgZW50cnkgaXMgYXBwbGllZCBhbmQgYXQgd2hhdCBwb2ludFxuICogd2l0aGluIHRoZSBhbmltYXRpb24gYXJjLlxuICogQ29tcGFyZSBbQ1NTIEtleWZyYW1lIEFuaW1hdGlvbnNdKGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vY3NzL2NzczNfYW5pbWF0aW9ucy5hc3ApLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIG9mZnNldCB2YWx1ZXMgZGVzY3JpYmVcbiAqIHdoZW4gZWFjaCBgYmFja2dyb3VuZENvbG9yYCB2YWx1ZSBpcyBhcHBsaWVkLiBUaGUgY29sb3IgaXMgcmVkIGF0IHRoZSBzdGFydCwgYW5kIGNoYW5nZXMgdG9cbiAqIGJsdWUgd2hlbiAyMCUgb2YgdGhlIHRvdGFsIHRpbWUgaGFzIGVsYXBzZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHByb3ZpZGVkIG9mZnNldCB2YWx1ZXNcbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiwgb2Zmc2V0OiAwIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIsIG9mZnNldDogMC4yIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiwgb2Zmc2V0OiAwLjMgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIsIG9mZnNldDogMSB9KVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBJZiB0aGVyZSBhcmUgbm8gYG9mZnNldGAgdmFsdWVzIHNwZWNpZmllZCBpbiB0aGUgc3R5bGUgZW50cmllcywgdGhlIG9mZnNldHNcbiAqIGFyZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiIH0pIC8vIG9mZnNldCA9IDBcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiIH0pIC8vIG9mZnNldCA9IDAuMzNcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIgfSkgLy8gb2Zmc2V0ID0gMC42NlxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiIH0pIC8vIG9mZnNldCA9IDFcbiAqIF0pKVxuICpgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleWZyYW1lcyhzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdKTogQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcywgc3RlcHN9O1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uIGFzIGEgc2VxdWVuY2Ugb2YgYW5pbWF0aW9uIHN0ZXBzIHRvIHJ1biB3aGVuIGEgZ2l2ZW5cbiAqIGNvbmRpdGlvbiBpcyBzYXRpc2ZpZWQuIFRoZSBjb25kaXRpb24gaXMgYSBCb29sZWFuIGV4cHJlc3Npb24gb3IgZnVuY3Rpb24gdGhhdCBjb21wYXJlc1xuICogdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IGFuaW1hdGlvbiBzdGF0ZXMsIGFuZCByZXR1cm5zIHRydWUgaWYgdGhpcyB0cmFuc2l0aW9uIHNob3VsZCBvY2N1ci5cbiAqIFdoZW4gdGhlIHN0YXRlIGNyaXRlcmlhIG9mIGEgZGVmaW5lZCB0cmFuc2l0aW9uIGFyZSBtZXQsIHRoZSBhc3NvY2lhdGVkIGFuaW1hdGlvbiBpc1xuICogdHJpZ2dlcmVkLlxuICpcbiAqIEBwYXJhbSBzdGF0ZUNoYW5nZUV4cHIgQSBCb29sZWFuIGV4cHJlc3Npb24gb3IgZnVuY3Rpb24gdGhhdCBjb21wYXJlcyB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnRcbiAqIGFuaW1hdGlvbiBzdGF0ZXMsIGFuZCByZXR1cm5zIHRydWUgaWYgdGhpcyB0cmFuc2l0aW9uIHNob3VsZCBvY2N1ci4gTm90ZSB0aGF0ICBcInRydWVcIiBhbmQgXCJmYWxzZVwiXG4gKiBtYXRjaCAxIGFuZCAwLCByZXNwZWN0aXZlbHkuIEFuIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkIGVhY2ggdGltZSBhIHN0YXRlIGNoYW5nZSBvY2N1cnMgaW4gdGhlXG4gKiBhbmltYXRpb24gdHJpZ2dlciBlbGVtZW50LlxuICogVGhlIGFuaW1hdGlvbiBzdGVwcyBydW4gd2hlbiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdHJ1ZS5cbiAqXG4gKiAtIEEgc3RhdGUtY2hhbmdlIHN0cmluZyB0YWtlcyB0aGUgZm9ybSBcInN0YXRlMSA9PiBzdGF0ZTJcIiwgd2hlcmUgZWFjaCBzaWRlIGlzIGEgZGVmaW5lZCBhbmltYXRpb25cbiAqIHN0YXRlLCBvciBhbiBhc3Rlcml4ICgqKSB0byByZWZlciB0byBhIGR5bmFtaWMgc3RhcnQgb3IgZW5kIHN0YXRlLlxuICogICAtIFRoZSBleHByZXNzaW9uIHN0cmluZyBjYW4gY29udGFpbiBtdWx0aXBsZSBjb21tYS1zZXBhcmF0ZWQgc3RhdGVtZW50cztcbiAqIGZvciBleGFtcGxlIFwic3RhdGUxID0+IHN0YXRlMiwgc3RhdGUzID0+IHN0YXRlNFwiLlxuICogICAtIFNwZWNpYWwgdmFsdWVzIGA6ZW50ZXJgIGFuZCBgOmxlYXZlYCBpbml0aWF0ZSBhIHRyYW5zaXRpb24gb24gdGhlIGVudHJ5IGFuZCBleGl0IHN0YXRlcyxcbiAqIGVxdWl2YWxlbnQgdG8gIFwidm9pZCA9PiAqXCIgIGFuZCBcIiogPT4gdm9pZFwiLlxuICogICAtIFNwZWNpYWwgdmFsdWVzIGA6aW5jcmVtZW50YCBhbmQgYDpkZWNyZW1lbnRgIGluaXRpYXRlIGEgdHJhbnNpdGlvbiB3aGVuIGEgbnVtZXJpYyB2YWx1ZSBoYXNcbiAqIGluY3JlYXNlZCBvciBkZWNyZWFzZWQgaW4gdmFsdWUuXG4gKiAtIEEgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3VycyBpbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZWxlbWVudC5cbiAqIFRoZSBhbmltYXRpb24gc3RlcHMgcnVuIHdoZW4gdGhlIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBAcGFyYW0gc3RlcHMgT25lIG9yIG1vcmUgYW5pbWF0aW9uIG9iamVjdHMsIGFzIHJldHVybmVkIGJ5IHRoZSBgYW5pbWF0ZSgpYCBvclxuICogYHNlcXVlbmNlKClgIGZ1bmN0aW9uLCB0aGF0IGZvcm0gYSB0cmFuc2Zvcm1hdGlvbiBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICogQSBzZXF1ZW5jZSBpcyB1c2VkIGJ5IGRlZmF1bHQgd2hlbiB5b3UgcGFzcyBhbiBhcnJheS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBhbmltYXRpb24sXG4gKiBhbmQgYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLiBQcm92aWRlZCB2YWx1ZXMgZm9yIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBhcmUgdXNlZFxuICogYXMgZGVmYXVsdHMsIGFuZCBvdmVycmlkZSB2YWx1ZXMgY2FuIGJlIHBhc3NlZCB0byB0aGUgY2FsbGVyIG9uIGludm9jYXRpb24uXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHRyYW5zaXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCBhIGNvbXBvbmVudCBiaW5kcyBhbiBhbmltYXRpb24gdHJpZ2dlciB0byBhbiBlbGVtZW50LlxuICpcbiAqIGBgYEhUTUxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBBbGwgdHJhbnNpdGlvbnMgYXJlIGRlZmluZWQgd2l0aGluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLFxuICogYWxvbmcgd2l0aCBuYW1lZCBzdGF0ZXMgdGhhdCB0aGUgdHJhbnNpdGlvbnMgY2hhbmdlIHRvIGFuZCBmcm9tLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogIC8vIGRlZmluZSBzdGF0ZXNcbiAqICBzdGF0ZShcIm9uXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmVlblwiIH0pKSxcbiAqICBzdGF0ZShcIm9mZlwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JleVwiIH0pKSxcbiAqICAuLi5dXG4gKiBgYGBcbiAqXG4gKiBOb3RlIHRoYXQgd2hlbiB5b3UgY2FsbCB0aGUgYHNlcXVlbmNlKClgIGZ1bmN0aW9uIHdpdGhpbiBhIGBncm91cCgpYFxuICogb3IgYSBgdHJhbnNpdGlvbigpYCBjYWxsLCBleGVjdXRpb24gZG9lcyBub3QgY29udGludWUgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb25cbiAqIHVudGlsIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvbiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiAjIyMgU3ludGF4IGV4YW1wbGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlcyBkZWZpbmUgdHJhbnNpdGlvbnMgYmV0d2VlbiB0aGUgdHdvIGRlZmluZWQgc3RhdGVzIChhbmQgZGVmYXVsdCBzdGF0ZXMpLFxuICogdXNpbmcgdmFyaW91cyBvcHRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIFRyYW5zaXRpb24gb2NjdXJzIHdoZW4gdGhlIHN0YXRlIHZhbHVlXG4gKiAvLyBib3VuZCB0byBcIm15QW5pbWF0aW9uVHJpZ2dlclwiIGNoYW5nZXMgZnJvbSBcIm9uXCIgdG8gXCJvZmZcIlxuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZlwiLCBhbmltYXRlKDUwMCkpXG4gKiAvLyBSdW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZvciBib3RoIGRpcmVjdGlvbnNcbiAqIHRyYW5zaXRpb24oXCJvbiA8PT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSlcbiAqIC8vIERlZmluZSBtdWx0aXBsZSBzdGF0ZS1jaGFuZ2UgcGFpcnMgc2VwYXJhdGVkIGJ5IGNvbW1hc1xuICogdHJhbnNpdGlvbihcIm9uID0+IG9mZiwgb2ZmID0+IHZvaWRcIiwgYW5pbWF0ZSg1MDApKVxuICogYGBgXG4gKlxuICogIyMjIFNwZWNpYWwgdmFsdWVzIGZvciBzdGF0ZS1jaGFuZ2UgZXhwcmVzc2lvbnNcbiAqXG4gKiAtIENhdGNoLWFsbCBzdGF0ZSBjaGFuZ2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBpbnNlcnRlZCBpbnRvIHRoZSBwYWdlIGFuZCB0aGVcbiAqIGRlc3RpbmF0aW9uIHN0YXRlIGlzIHVua25vd246XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogIGFuaW1hdGUoNTAwKVxuICogIF0pXG4gKiBgYGBcbiAqXG4gKiAtIENhcHR1cmUgYSBzdGF0ZSBjaGFuZ2UgYmV0d2VlbiBhbnkgc3RhdGVzOlxuICpcbiAqICBgdHJhbnNpdGlvbihcIiogPT4gKlwiLCBhbmltYXRlKFwiMXMgMHNcIikpYFxuICpcbiAqIC0gRW50cnkgYW5kIGV4aXQgdHJhbnNpdGlvbnM6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcIjplbnRlclwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgXSksXG4gKiB0cmFuc2l0aW9uKFwiOmxlYXZlXCIsIFtcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgXSlcbiAqIGBgYFxuICpcbiAqIC0gVXNlIGA6aW5jcmVtZW50YCBhbmQgYDpkZWNyZW1lbnRgIHRvIGluaXRpYXRlIHRyYW5zaXRpb25zOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oXCI6aW5jcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICpcbiAqIHRyYW5zaXRpb24oXCI6ZGVjcmVtZW50XCIsIGdyb3VwKFtcbiAqICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICBdKSxcbiAqICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgXSlcbiAqIF0pKVxuICogYGBgXG4gKlxuICogIyMjIFN0YXRlLWNoYW5nZSBmdW5jdGlvbnNcbiAqXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBgZnJvbVN0YXRlYCBzcGVjaWZpZWQgYXMgYSBzdGF0ZS1jaGFuZ2UgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGFuXG4gKiBhbmltYXRpb24gd2hlbiB0cnVlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyYW5zaXRpb24oKGZyb21TdGF0ZSwgdG9TdGF0ZSkgPT5cbiAqICB7XG4gKiAgIHJldHVybiBmcm9tU3RhdGUgPT0gXCJvZmZcIiAmJiB0b1N0YXRlID09IFwib25cIjtcbiAqICB9LFxuICogIGFuaW1hdGUoXCIxcyAwc1wiKSlcbiAqIGBgYFxuICpcbiAqICMjIyBBbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlXG4gKlxuICogSWYgdGhlIGZpbmFsIHN0ZXAgaW4gYSB0cmFuc2l0aW9uIGlzIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB0aGF0IHVzZXMgYSB0aW1pbmcgdmFsdWVcbiAqIHdpdGggbm8gc3R5bGUgZGF0YSwgdGhhdCBzdGVwIGlzIGF1dG9tYXRpY2FsbHkgY29uc2lkZXJlZCB0aGUgZmluYWwgYW5pbWF0aW9uIGFyYyxcbiAqIGZvciB0aGUgZWxlbWVudCB0byByZWFjaCB0aGUgZmluYWwgc3RhdGUuIEFuZ3VsYXIgYXV0b21hdGljYWxseSBhZGRzIG9yIHJlbW92ZXNcbiAqIENTUyBzdHlsZXMgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGNvcnJlY3QgZmluYWwgc3RhdGUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSB0cmFuc2l0aW9uIHRoYXQgc3RhcnRzIGJ5IGhpZGluZyB0aGUgZWxlbWVudCxcbiAqIHRoZW4gbWFrZXMgc3VyZSB0aGF0IGl0IGFuaW1hdGVzIHByb3Blcmx5IHRvIHdoYXRldmVyIHN0YXRlIGlzIGN1cnJlbnRseSBhY3RpdmUgZm9yIHRyaWdnZXI6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDApXG4gKiAgXSlcbiAqIGBgYFxuICogIyMjIEJvb2xlYW4gdmFsdWUgbWF0Y2hpbmdcbiAqIElmIGEgdHJpZ2dlciBiaW5kaW5nIHZhbHVlIGlzIGEgQm9vbGVhbiwgaXQgY2FuIGJlIG1hdGNoZWQgdXNpbmcgYSB0cmFuc2l0aW9uIGV4cHJlc3Npb25cbiAqIHRoYXQgY29tcGFyZXMgdHJ1ZSBhbmQgZmFsc2Ugb3IgMSBhbmQgMC4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiAvLyBpbiB0aGUgdGVtcGxhdGVcbiAqIDxkaXYgW0BvcGVuQ2xvc2VdPVwib3BlbiA/IHRydWUgOiBmYWxzZVwiPi4uLjwvZGl2PlxuICogLy8gaW4gdGhlIGNvbXBvbmVudCBtZXRhZGF0YVxuICogdHJpZ2dlcignb3BlbkNsb3NlJywgW1xuICogICBzdGF0ZSgndHJ1ZScsIHN0eWxlKHsgaGVpZ2h0OiAnKicgfSkpLFxuICogICBzdGF0ZSgnZmFsc2UnLCBzdHlsZSh7IGhlaWdodDogJzBweCcgfSkpLFxuICogICB0cmFuc2l0aW9uKCdmYWxzZSA8PT4gdHJ1ZScsIGFuaW1hdGUoNTAwKSlcbiAqIF0pXG4gKiBgYGBcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uKFxuICAgIHN0YXRlQ2hhbmdlRXhwcjogc3RyaW5nIHwgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbiksXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uLCBleHByOiBzdGF0ZUNoYW5nZUV4cHIsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIFByb2R1Y2VzIGEgcmV1c2FibGUgYW5pbWF0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgaW4gYW5vdGhlciBhbmltYXRpb24gb3Igc2VxdWVuY2UsXG4gKiBieSBjYWxsaW5nIHRoZSBgdXNlQW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBzdGVwcyBPbmUgb3IgbW9yZSBhbmltYXRpb24gb2JqZWN0cywgYXMgcmV0dXJuZWQgYnkgdGhlIGBhbmltYXRlKClgXG4gKiBvciBgc2VxdWVuY2UoKWAgZnVuY3Rpb24sIHRoYXQgZm9ybSBhIHRyYW5zZm9ybWF0aW9uIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKiBBIHNlcXVlbmNlIGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIHlvdSBwYXNzIGFuIGFycmF5LlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlXG4gKiBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIHBhcmFtZXRlcnMuXG4gKiBQcm92aWRlZCB2YWx1ZXMgZm9yIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBhcmUgdXNlZCBhcyBkZWZhdWx0cyxcbiAqIGFuZCBvdmVycmlkZSB2YWx1ZXMgY2FuIGJlIHBhc3NlZCB0byB0aGUgY2FsbGVyIG9uIGludm9jYXRpb24uXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGFuaW1hdGlvbiBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIHJldXNhYmxlIGFuaW1hdGlvbiwgcHJvdmlkaW5nIHNvbWUgZGVmYXVsdCBwYXJhbWV0ZXJcbiAqIHZhbHVlcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgZmFkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbihbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IHN0YXJ0IH19JyB9KSxcbiAqICAgYW5pbWF0ZSgne3sgdGltZSB9fScsXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IGVuZCB9fSd9KSlcbiAqICAgXSxcbiAqICAgeyBwYXJhbXM6IHsgdGltZTogJzEwMDBtcycsIHN0YXJ0OiAwLCBlbmQ6IDEgfX0pO1xuICogYGBgXG4gKlxuICogVGhlIGZvbGxvd2luZyBpbnZva2VzIHRoZSBkZWZpbmVkIGFuaW1hdGlvbiB3aXRoIGEgY2FsbCB0byBgdXNlQW5pbWF0aW9uKClgLFxuICogcGFzc2luZyBpbiBvdmVycmlkZSBwYXJhbWV0ZXIgdmFsdWVzLlxuICpcbiAqIGBgYGpzXG4gKiB1c2VBbmltYXRpb24oZmFkZUFuaW1hdGlvbiwge1xuICogICBwYXJhbXM6IHtcbiAqICAgICB0aW1lOiAnMnMnLFxuICogICAgIHN0YXJ0OiAxLFxuICogICAgIGVuZDogMFxuICogICB9XG4gKiB9KVxuICogYGBgXG4gKlxuICogSWYgYW55IG9mIHRoZSBwYXNzZWQtaW4gcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBmcm9tIHRoaXMgY2FsbCxcbiAqIHRoZSBkZWZhdWx0IHZhbHVlcyBhcmUgdXNlZC4gSWYgb25lIG9yIG1vcmUgcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBiZWZvcmUgYSBzdGVwIGlzXG4gKiBhbmltYXRlZCwgYHVzZUFuaW1hdGlvbigpYCB0aHJvd3MgYW4gZXJyb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRpb24oXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZSwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBxdWVyaWVkIGlubmVyIGFuaW1hdGlvbiBlbGVtZW50IHdpdGhpbiBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gY29udGFpbiBhIGRlbGF5IHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgdGhlXG4gKiBhbmltYXRpb24sIGFuZCBhZGRpdGlvbmFsIG92ZXJyaWRlIHZhbHVlcyBmb3IgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBjaGlsZCBhbmltYXRpb24gZGF0YS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogRWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgaW4gQW5ndWxhciwgdGhlIHBhcmVudCBhbmltYXRpb25cbiAqIGhhcyBwcmlvcml0eSBhbmQgYW55IGNoaWxkIGFuaW1hdGlvbnMgYXJlIGJsb2NrZWQuIEluIG9yZGVyXG4gKiBmb3IgYSBjaGlsZCBhbmltYXRpb24gdG8gcnVuLCB0aGUgcGFyZW50IGFuaW1hdGlvbiBtdXN0IHF1ZXJ5IGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gKiBjb250YWluaW5nIGNoaWxkIGFuaW1hdGlvbnMsIGFuZCBydW4gdGhlbSB1c2luZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZlYXR1cmUgZGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIGBxdWVyeSgpYCBhbmQgaXQgd2lsbCBvbmx5IHdvcmtcbiAqIHdpdGggYW5pbWF0aW9ucyB0aGF0IGFyZSBhc3NpZ25lZCB1c2luZyB0aGUgQW5ndWxhciBhbmltYXRpb24gbGlicmFyeS4gQ1NTIGtleWZyYW1lc1xuICogYW5kIHRyYW5zaXRpb25zIGFyZSBub3QgaGFuZGxlZCBieSB0aGlzIEFQSS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDaGlsZChvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBTdGFydHMgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBpcyBjcmVhdGVkIHVzaW5nIHRoZSBgYW5pbWF0aW9uKClgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gVGhlIHJldXNhYmxlIGFuaW1hdGlvbiB0byBzdGFydC5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGNvbnRhaW4gYSBkZWxheSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIFxuICogdGhlIGFuaW1hdGlvbiwgYW5kIGFkZGl0aW9uYWwgb3ZlcnJpZGUgdmFsdWVzIGZvciBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICogQHJldHVybiBBbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYW5pbWF0aW9uIHBhcmFtZXRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VBbmltYXRpb24oXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIEZpbmRzIG9uZSBvciBtb3JlIGlubmVyIGVsZW1lbnRzIHdpdGhpbiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgaXNcbiAqIGJlaW5nIGFuaW1hdGVkIHdpdGhpbiBhIHNlcXVlbmNlLiBVc2Ugd2l0aCBgYW5pbWF0ZUNoaWxkKClgLlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciBUaGUgZWxlbWVudCB0byBxdWVyeSwgb3IgYSBzZXQgb2YgZWxlbWVudHMgdGhhdCBjb250YWluIEFuZ3VsYXItc3BlY2lmaWNcbiAqIGNoYXJhY3RlcmlzdGljcywgc3BlY2lmaWVkIHdpdGggb25lIG9yIG1vcmUgb2YgdGhlIGZvbGxvd2luZyB0b2tlbnMuXG4gKiAgLSBgcXVlcnkoXCI6ZW50ZXJcIilgIG9yIGBxdWVyeShcIjpsZWF2ZVwiKWAgOiBRdWVyeSBmb3IgbmV3bHkgaW5zZXJ0ZWQvcmVtb3ZlZCBlbGVtZW50cy5cbiAqICAtIGBxdWVyeShcIjphbmltYXRpbmdcIilgIDogUXVlcnkgYWxsIGN1cnJlbnRseSBhbmltYXRpbmcgZWxlbWVudHMuXG4gKiAgLSBgcXVlcnkoXCJAdHJpZ2dlck5hbWVcIilgIDogUXVlcnkgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyLlxuICogIC0gYHF1ZXJ5KFwiQCpcIilgIDogUXVlcnkgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlcnMuXG4gKiAgLSBgcXVlcnkoXCI6c2VsZlwiKWAgOiBJbmNsdWRlIHRoZSBjdXJyZW50IGVsZW1lbnQgaW50byB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEBwYXJhbSBhbmltYXRpb24gT25lIG9yIG1vcmUgYW5pbWF0aW9uIHN0ZXBzIHRvIGFwcGx5IHRvIHRoZSBxdWVyaWVkIGVsZW1lbnQgb3IgZWxlbWVudHMuXG4gKiBBbiBhcnJheSBpcyB0cmVhdGVkIGFzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqIEBwYXJhbSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiBVc2UgdGhlICdsaW1pdCcgZmllbGQgdG8gbGltaXQgdGhlIHRvdGFsIG51bWJlciBvZlxuICogaXRlbXMgdG8gY29sbGVjdC5cbiAqIEByZXR1cm4gQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBxdWVyeSBkYXRhLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUb2tlbnMgY2FuIGJlIG1lcmdlZCBpbnRvIGEgY29tYmluZWQgcXVlcnkgc2VsZWN0b3Igc3RyaW5nLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAgcXVlcnkoJzpzZWxmLCAucmVjb3JkOmVudGVyLCAucmVjb3JkOmxlYXZlLCBAc3ViVHJpZ2dlcicsIFsuLi5dKVxuICogYGBgXG4gKlxuICogVGhlIGBxdWVyeSgpYCBmdW5jdGlvbiBjb2xsZWN0cyBtdWx0aXBsZSBlbGVtZW50cyBhbmQgd29ya3MgaW50ZXJuYWxseSBieSB1c2luZ1xuICogYGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbGAuIFVzZSB0aGUgYGxpbWl0YCBmaWVsZCBvZiBhbiBvcHRpb25zIG9iamVjdCB0byBsaW1pdFxuICogdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyB0byBiZSBjb2xsZWN0ZWQuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnZGl2JywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBsaW1pdDogMSB9KVxuICogYGBgXG4gKlxuICogQnkgZGVmYXVsdCwgdGhyb3dzIGFuIGVycm9yIHdoZW4gemVybyBpdGVtcyBhcmUgZm91bmQuIFNldCB0aGVcbiAqIGBvcHRpb25hbGAgZmxhZyB0byBpZ25vcmUgdGhpcyBlcnJvci4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCcuc29tZS1lbGVtZW50LXRoYXQtbWF5LW5vdC1iZS10aGVyZScsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgb3B0aW9uYWw6IHRydWUgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHF1ZXJpZXMgZm9yIGlubmVyIGVsZW1lbnRzIGFuZCBhbmltYXRlcyB0aGVtXG4gKiBpbmRpdmlkdWFsbHkgdXNpbmcgYGFuaW1hdGVDaGlsZCgpYC4gXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaW5uZXInLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0BxdWVyeUFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIDxoMT5UaXRsZTwvaDE+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICogICAgICAgICBCbGFoIGJsYWggYmxhaFxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgIHRyaWdnZXIoJ3F1ZXJ5QW5pbWF0aW9uJywgW1xuICogICAgICB0cmFuc2l0aW9uKCcqID0+IGdvQW5pbWF0ZScsIFtcbiAqICAgICAgICAvLyBoaWRlIHRoZSBpbm5lciBlbGVtZW50c1xuICogICAgICAgIHF1ZXJ5KCdoMScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50Jywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqXG4gKiAgICAgICAgLy8gYW5pbWF0ZSB0aGUgaW5uZXIgZWxlbWVudHMgaW4sIG9uZSBieSBvbmVcbiAqICAgICAgICBxdWVyeSgnaDEnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50JywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogVXNlIHdpdGhpbiBhbiBhbmltYXRpb24gYHF1ZXJ5KClgIGNhbGwgdG8gaXNzdWUgYSB0aW1pbmcgZ2FwIGFmdGVyXG4gKiBlYWNoIHF1ZXJpZWQgaXRlbSBpcyBhbmltYXRlZC5cbiAqXG4gKiBAcGFyYW0gdGltaW5ncyBBIGRlbGF5IHZhbHVlLlxuICogQHBhcmFtIGFuaW1hdGlvbiBPbmUgb3JlIG1vcmUgYW5pbWF0aW9uIHN0ZXBzLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdGFnZ2VyIGRhdGEuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYSBjb250YWluZXIgZWxlbWVudCB3cmFwcyBhIGxpc3Qgb2YgaXRlbXMgc3RhbXBlZCBvdXRcbiAqIGJ5IGFuIGBuZ0ZvcmAuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogRWFjaCB0aW1lIGl0ZW1zIGFyZSBhZGRlZCwgdGhlIG9wYWNpdHkgZmFkZS1pbiBhbmltYXRpb24gcnVucyxcbiAqIGFuZCBlYWNoIHJlbW92ZWQgaXRlbSBpcyBmYWRlZCBvdXQuXG4gKiBXaGVuIGVpdGhlciBvZiB0aGVzZSBhbmltYXRpb25zIG9jY3VyLCB0aGUgc3RhZ2dlciBlZmZlY3QgaXNcbiAqIGFwcGxpZWQgYWZ0ZXIgZWFjaCBpdGVtJ3MgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEhlcmUgaXMgdGhlIGNvbXBvbmVudCBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgc3R5bGUsIGFuaW1hdGUsIHF1ZXJ5LCBzdGFnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICB0ZW1wbGF0ZVVybDogJ2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgICAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgIH1cbiAqICB9XG4gKiBgYGBcbiAqXG4gKiBIZXJlIGlzIHRoZSBhbmltYXRpb24gdHJpZ2dlciBjb2RlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZ2VyKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlcixcbiAgICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsIHRpbWluZ3MsIGFuaW1hdGlvbn07XG59XG4iXX0=