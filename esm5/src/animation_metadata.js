/**
 * @experimental Animation support is experimental.
 */
export var AUTO_STYLE = '*';
/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better
 * understanding of how animations in Angular are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and
 * {@link transition transition} entries that will be evaluated when the expression
 * bound to the trigger changes.
 *
 * Triggers are registered within the component annotation data under the
 * {@link Component#animations animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that
 * the trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * Animation trigger bindings strigify values and then match the previous and current values against
 * any linked transitions. If a boolean value is provided into the trigger binding then it will both
 * be represented as `1` or `true` and `0` or `false` for a true and false boolean values
 * respectively.
 *
 * **Usage**
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {@link state state} and
 * {@link transition transition} declarations.
 *
 * ```typescript
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
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
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * **Using an inline function**
 *
 * The `transition` animation method also supports reading an inline function which can decide
 * if its associated animation should be run.
 *
 * ```
 * // this method will be run each time the `myAnimationTrigger`
 * // trigger value changes...
 * function myInlineMatcherFn(
 *   fromState: string,
 *   toState: string,
 *   element: any,
 *   params: {[key: string]: any}
 * ): boolean {
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
 * The inline method will be run each time the trigger
 * value changes
 *
 * **Disable Animations**
 *
 * A special animation control binding called `@.disabled` can be placed on an element which will
 * then disable animations for any inner animation triggers situated within the element as well as
 * any animations on the element itself.
 *
 * When true, the `@.disabled` binding will prevent all animations from rendering. The example
 * below shows how to use this feature:
 *
 * ```ts
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
 * The `@childAnimation` trigger will not animate because `@.disabled` prevents it from happening
 * (when true).
 *
 * Note that `@.disabled` will only disable all animations (this means any animations running on
 * the same element will also be disabled).
 *
 * **Disabling Animations Application-wide**
 *
 * When an area of the template is set to have animations disabled, **all** inner components will
 * also have their animations disabled as well. This means that all animations for an angular
 * application can be disabled by placing a host binding set on `@.disabled` on the topmost Angular
 * component.
 *
 * ```ts
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
 * **What about animations that use `query()` and `animateChild()`?**
 *
 * Despite inner animations being disabled, a parent animation can `query` for inner
 * elements located in disabled areas of the template and still animate them as it sees fit. This is
 * also the case for when a sub animation is queried by a parent and then later animated using
 * animateChild`.
 *
 * **Detecting when an animation is disabled**
 *
 * If a region of the DOM (or the entire application) has its animations disabled, then animation
 * trigger callbacks will still fire just as normal (only for zero seconds).
 *
 * When a trigger callback fires it will provide an instance of an {@link AnimationEvent}. If
 * animations are disabled then the `.disabled` flag on the event will be true.
 *
 * @experimental Animation support is experimental.
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name: name, definitions: definitions, options: {} };
}
/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {@link sequence an animation sequence}, {@link group group}, or {@link
 * transition transition}.
 *
 * {@a usage}
 * **Usage**
 *
 * The `animate` function accepts two input parameters: `timing` and `styles`:
 *
 * - `timing` is a string based value that can be a combination of a duration with optional delay
 * and easing values. The format for the expression breaks down to `duration delay easing`
 * (therefore a value such as `1s 100ms ease-out` will be parse itself into `duration=1000,
 * delay=100, easing=ease-out`. If a numeric value is provided then that will be used as the
 * `duration` value in millisecond form.
 * - `styles` is the style input data which can either be a call to {@link style style} or {@link
 * keyframes keyframes}. If left empty then the styles from the destination state will be collected
 * and used (this is useful when describing an animation step that will complete an animation by
 * {@link transition#the-final-animate-call animating to the final state}).
 *
 * ```typescript
 * // various functions for specifying timing data
 * animate(500, style(...))
 * animate("1s", style(...))
 * animate("100ms 0.5s", style(...))
 * animate("5s ease", style(...))
 * animate("5s 10ms cubic-bezier(.17,.67,.88,.1)", style(...))
 *
 * // either style() of keyframes() can be used
 * animate(500, style({ background: "red" }))
 * animate(500, keyframes([
 *   style({ background: "blue" })),
 *   style({ background: "red" }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function animate(timings, styles) {
    if (styles === void 0) { styles = null; }
    return { type: 4 /* Animate */, styles: styles, timings: timings };
}
/**
 * `group` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different starting/ending times.
 *
 * The `group` function can either be used within a {@link sequence sequence} or a {@link transition
 * transition} and it will only continue to the next instruction once all of the inner animation
 * steps have completed.
 *
 * **Usage**
 *
 * The `steps` data that is passed into the `group` animation function can either consist of {@link
 * style style} or {@link animate animate} function calls. Each call to `style()` or `animate()`
 * within a group will be executed instantly (use {@link keyframes keyframes} or a {@link
 * animate#usage animate() with a delay value} to offset styles to be applied at a later time).
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function group(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 3 /* Group */, steps: steps, options: options };
}
/**
 * `sequence` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used by
 * default when an array is passed as animation data into {@link transition transition}.)
 *
 * The `sequence` function can either be used within a {@link group group} or a {@link transition
 * transition} and it will only continue to the next instruction once each of the inner animation
 * steps have completed.
 *
 * To perform animation styling in parallel with other animation steps then have a look at the
 * {@link group group} animation function.
 *
 * **Usage**
 *
 * The `steps` data that is passed into the `sequence` animation function can either consist of
 * {@link style style} or {@link animate animate} function calls. A call to `style()` will apply the
 * provided styling data immediately while a call to `animate()` will apply its styling data over a
 * given time depending on its timing data.
 *
 * ```typescript
 * sequence([
 *   style({ opacity: 0 })),
 *   animate("1s", { opacity: 1 }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function sequence(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 2 /* Sequence */, steps: steps, options: options };
}
/**
 * `style` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {@link state animation states}, within an {@link sequence animation sequence}, or as styling data
 * for both {@link animate animate} and {@link keyframes keyframes}.
 *
 * **Usage**
 *
 * `style` takes in a key/value string map as data and expects one or more CSS property/value pairs
 * to be defined.
 *
 * ```typescript
 * // string values are used for css properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical (pixel) values are also supported
 * style({ width: 100, height: 0 })
 * ```
 *
 * **Auto-styles (using `*`)**
 *
 * When an asterix (`*`) character is used as a value then it will be detected from the element
 * being animated and applied as animation data when the animation starts.
 *
 * This feature proves useful for a state depending on layout and/or environment factors; in such
 * cases the styles are calculated just before the animation starts.
 *
 * ```typescript
 * // the steps below will animate from 0 to the
 * // actual height of the element
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function style(tokens) {
    return { type: 6 /* Style */, styles: tokens, offset: null };
}
/**
 * `state` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `state` declares an animation state within the given trigger. When a state is active within a
 * component then its associated styles will persist on the element that the trigger is attached to
 * (even when the animation ends).
 *
 * To animate between states, have a look at the animation {@link transition transition} DSL
 * function. To register states to an animation trigger please have a look at the {@link trigger
 * trigger} function.
 *
 * **The `void` state**
 *
 * The `void` state value is a reserved word that angular uses to determine when the element is not
 * apart of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
 * associated element is void).
 *
 * **The `*` (default) state**
 *
 * The `*` state (when styled) is a fallback state that will be used if the state that is being
 * animated is not declared within the trigger.
 *
 * **Usage**
 *
 * `state` will declare an animation state with its associated styles
 * within the given trigger.
 *
 * - `stateNameExpr` can be one or more state names separated by commas.
 * - `styles` refers to the {@link style styling data} that will be persisted on the element once
 * the state has been reached.
 *
 * ```typescript
 * // "void" is a reserved name for a state and is used to represent
 * // the state in which an element is detached from from the application.
 * state("void", style({ height: 0 }))
 *
 * // user-defined states
 * state("closed", style({ height: 0 }))
 * state("open, visible", style({ height: "*" }))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function state(name, styles, options) {
    return { type: 0 /* State */, name: name, styles: styles, options: options };
}
/**
 * `keyframes` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better understanding
 * of how animations in Angular are used.
 *
 * `keyframes` specifies a collection of {@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * **Usage**
 *
 * The `keyframes` animation function is designed to be used alongside the {@link animate animate}
 * animation function. Instead of applying animations from where they are currently to their
 * destination, keyframes can describe how each style entry is applied and at what point within the
 * animation arc (much like CSS Keyframe Animations do).
 *
 * For each `style()` entry an `offset` value can be set. Doing so allows to specify at what
 * percentage of the animate time the styles will be applied.
 *
 * ```typescript
 * // the provided offset values describe when each backgroundColor value is applied.
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * Alternatively, if there are no `offset` values used within the style entries then the offsets
 * will be calculated automatically.
 *
 * ```typescript
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function keyframes(steps) {
    return { type: 5 /* Keyframes */, steps: steps };
}
/**
 * `transition` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `transition` declares the {@link sequence sequence of animation steps} that will be run when the
 * provided `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 =>
 * state2` which consists of two known states (use an asterix (`*`) to refer to a dynamic starting
 * and/or ending state).
 *
 * A function can also be provided as the `stateChangeExpr` argument for a transition and this
 * function will be executed each time a state change occurs. If the value returned within the
 * function is true then the associated animation will be run.
 *
 * Animation transitions are placed within an {@link trigger animation trigger}. For an transition
 * to animate to a state value and persist its styles then one or more {@link state animation
 * states} is expected to be defined.
 *
 * **Usage**
 *
 * An animation transition is kicked off the `stateChangeExpr` predicate evaluates to true based on
 * what the previous state is and what the current state has become. In other words, if a transition
 * is defined that matches the old/current state criteria then the associated animation will be
 * triggered.
 *
 * ```typescript
 * // all transition/state changes are defined within an animation trigger
 * trigger("myAnimationTrigger", [
 *   // if a state is defined then its styles will be persisted when the
 *   // animation has fully completed itself
 *   state("on", style({ background: "green" })),
 *   state("off", style({ background: "grey" })),
 *
 *   // a transition animation that will be kicked off when the state value
 *   // bound to "myAnimationTrigger" changes from "on" to "off"
 *   transition("on => off", animate(500)),
 *
 *   // it is also possible to do run the same animation for both directions
 *   transition("on <=> off", animate(500)),
 *
 *   // or to define multiple states pairs separated by commas
 *   transition("on => off, off => void", animate(500)),
 *
 *   // this is a catch-all state change for when an element is inserted into
 *   // the page and the destination state is unknown
 *   transition("void => *", [
 *     style({ opacity: 0 }),
 *     animate(500)
 *   ]),
 *
 *   // this will capture a state change between any states
 *   transition("* => *", animate("1s 0s")),
 *
 *   // you can also go full out and include a function
 *   transition((fromState, toState) => {
 *     // when `true` then it will allow the animation below to be invoked
 *     return fromState == "off" && toState == "on";
 *   }, animate("1s 0s"))
 * ])
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * {@a the-final-animate-call}
 * **The final `animate` call**
 *
 * If the final step within the transition steps is a call to `animate()` that **only** uses a
 * timing value with **no style data** then it will be automatically used as the final animation arc
 * for the element to animate itself to the final state. This involves an automatic mix of
 * adding/removing CSS styles so that the element will be in the exact state it should be for the
 * applied state to be presented correctly.
 *
 * ```
 * // start off by hiding the element, but make sure that it animates properly to whatever state
 * // is currently active for "myAnimationTrigger"
 * transition("void => *", [
 *   style({ opacity: 0 }),
 *   animate(500)
 * ])
 * ```
 *
 * **Using :enter and :leave**
 *
 * Given that enter (insertion) and leave (removal) animations are so common, the `transition`
 * function accepts both `:enter` and `:leave` values which are aliases for the `void => *` and `*
 * => void` state changes.
 *
 * ```
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 * ]),
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 * ])
 * ```
 *
 * **Boolean values**
 *
 * if a trigger binding value is a boolean value then it can be matched using a transition
 * expression that compares `true` and `false` or `1` and `0`.
 *
 * ```
 * // in the template
 * <div [@openClose]="open ? true : false">...</div>
 *
 * // in the component metadata
 * trigger('openClose', [
 *   state('true', style({ height: '*' })),
 *   state('false', style({ height: '0px' })),
 *   transition('false <=> true', animate(500))
 * ])
 * ```
 *
 * **Using :increment and :decrement**
 *
 * In addition to the :enter and :leave transition aliases, the :increment and :decrement aliases
 * can be used to kick off a transition when a numeric value has increased or decreased in value.
 *
 * ```
 * import {group, animate, query, transition, style, trigger} from '@angular/animations';
 * import {Component} from '@angular/core';
 *
 * @Component({
 *   selector: 'banner-carousel-component',
 *   styles: [`
 *     .banner-container {
 *        position:relative;
 *        height:500px;
 *        overflow:hidden;
 *      }
 *     .banner-container > .banner {
 *        position:absolute;
 *        left:0;
 *        top:0;
 *        font-size:200px;
 *        line-height:500px;
 *        font-weight:bold;
 *        text-align:center;
 *        width:100%;
 *      }
 *   `],
 *   template: `
 *     <button (click)="previous()">Previous</button>
 *     <button (click)="next()">Next</button>
 *     <hr>
 *     <div [@bannerAnimation]="selectedIndex" class="banner-container">
 *       <div class="banner" *ngFor="let banner of banners"> {{ banner }} </div>
 *     </div>
 *   `,
 *   animations: [
 *     trigger('bannerAnimation', [
 *       transition(":increment", group([
 *         query(':enter', [
 *           style({ left: '100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '-100%' }))
 *         ])
 *       ])),
 *       transition(":decrement", group([
 *         query(':enter', [
 *           style({ left: '-100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '100%' }))
 *         ])
 *       ]))
 *     ])
 *   ]
 * })
 * class BannerCarouselComponent {
 *   allBanners: string[] = ['1', '2', '3', '4'];
 *   selectedIndex: number = 0;
 *
 *   get banners() {
 *      return [this.allBanners[this.selectedIndex]];
 *   }
 *
 *   previous() {
 *     this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
 *   }
 *
 *   next() {
 *     this.selectedIndex = Math.min(this.selectedIndex + 1, this.allBanners.length - 1);
 *   }
 * }
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function transition(stateChangeExpr, steps, options) {
    if (options === void 0) { options = null; }
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options: options };
}
/**
 * `animation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * `var myAnimation = animation(...)` is designed to produce a reusable animation that can be later
 * invoked in another animation or sequence. Reusable animations are designed to make use of
 * animation parameters and the produced animation can be used via the `useAnimation` method.
 *
 * ```
 * var fadeAnimation = animation([
 *   style({ opacity: '{{ start }}' }),
 *   animate('{{ time }}',
 *     style({ opacity: '{{ end }}'}))
 * ], { params: { time: '1000ms', start: 0, end: 1 }});
 * ```
 *
 * If parameters are attached to an animation then they act as **default parameter values**. When an
 * animation is invoked via `useAnimation` then parameter values are allowed to be passed in
 * directly. If any of the passed in parameter values are missing then the default values will be
 * used.
 *
 * ```
 * useAnimation(fadeAnimation, {
 *   params: {
 *     time: '2s',
 *     start: 1,
 *     end: 0
 *   }
 * })
 * ```
 *
 * If one or more parameter values are missing before animated then an error will be thrown.
 *
 * @experimental Animation support is experimental.
 */
export function animation(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 8 /* Reference */, animation: steps, options: options };
}
/**
 * `animateChild` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It works by allowing a queried element to execute its own
 * animation within the animation sequence.
 *
 * Each time an animation is triggered in angular, the parent animation
 * will always get priority and any child animations will be blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations and then allow the animations to run using `animateChild`.
 *
 * The example HTML code below shows both parent and child elements that have animation
 * triggers that will execute at the same time.
 *
 * ```html
 * <!-- parent-child.component.html -->
 * <button (click)="exp =! exp">Toggle</button>
 * <hr>
 *
 * <div [@parentAnimation]="exp">
 *   <header>Hello</header>
 *   <div [@childAnimation]="exp">
 *       one
 *   </div>
 *   <div [@childAnimation]="exp">
 *       two
 *   </div>
 *   <div [@childAnimation]="exp">
 *       three
 *   </div>
 * </div>
 * ```
 *
 * Now when the `exp` value changes to true, only the `parentAnimation` animation will animate
 * because it has priority. However, using `query` and `animateChild` each of the inner animations
 * can also fire:
 *
 * ```ts
 * // parent-child.component.ts
 * import {trigger, transition, animate, style, query, animateChild} from '@angular/animations';
 * @Component({
 *   selector: 'parent-child-component',
 *   animations: [
 *     trigger('parentAnimation', [
 *       transition('false => true', [
 *         query('header', [
 *           style({ opacity: 0 }),
 *           animate(500, style({ opacity: 1 }))
 *         ]),
 *         query('@childAnimation', [
 *           animateChild()
 *         ])
 *       ])
 *     ]),
 *     trigger('childAnimation', [
 *       transition('false => true', [
 *         style({ opacity: 0 }),
 *         animate(500, style({ opacity: 1 }))
 *       ])
 *     ])
 *   ]
 * })
 * class ParentChildCmp {
 *   exp: boolean = false;
 * }
 * ```
 *
 * In the animation code above, when the `parentAnimation` transition kicks off it first queries to
 * find the header element and fades it in. It then finds each of the sub elements that contain the
 * `@childAnimation` trigger and then allows for their animations to fire.
 *
 * This example can be further extended by using stagger:
 *
 * ```ts
 * query('@childAnimation', stagger(100, [
 *   animateChild()
 * ]))
 * ```
 *
 * Now each of the sub animations start off with respect to the `100ms` staggering step.
 *
 * **The first frame of child animations**
 *
 * When sub animations are executed using `animateChild` the animation engine will always apply the
 * first frame of every sub animation immediately at the start of the animation sequence. This way
 * the parent animation does not need to set any initial styling data on the sub elements before the
 * sub animations kick off.
 *
 * In the example above the first frame of the `childAnimation`'s `false => true` transition
 * consists of a style of `opacity: 0`. This is applied immediately when the `parentAnimation`
 * animation transition sequence starts. Only then when the `@childAnimation` is queried and called
 * with `animateChild` will it then animate to its destination of `opacity: 1`.
 *
 * Note that this feature designed to be used alongside {@link query query()} and it will only work
 * with animations that are assigned using the Angular animation DSL (this means that CSS keyframes
 * and transitions are not handled by this API).
 *
 * @experimental Animation support is experimental.
 */
export function animateChild(options) {
    if (options === void 0) { options = null; }
    return { type: 9 /* AnimateChild */, options: options };
}
/**
 * `useAnimation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is used to kick off a reusable animation that is created using {@link
 * animation animation()}.
 *
 * @experimental Animation support is experimental.
 */
export function useAnimation(animation, options) {
    if (options === void 0) { options = null; }
    return { type: 10 /* AnimateRef */, animation: animation, options: options };
}
/**
 * `query` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * query() is used to find one or more inner elements within the current element that is
 * being animated within the sequence. The provided animation steps are applied
 * to the queried element (by default, an array is provided, then this will be
 * treated as an animation sequence).
 *
 * **Usage**
 *
 * query() is designed to collect multiple elements and works internally by using
 * `element.querySelectorAll`. An additional options object can be provided which
 * can be used to limit the total amount of items to be collected.
 *
 * ```js
 * query('div', [
 *   animate(...),
 *   animate(...)
 * ], { limit: 1 })
 * ```
 *
 * query(), by default, will throw an error when zero items are found. If a query
 * has the `optional` flag set to true then this error will be ignored.
 *
 * ```js
 * query('.some-element-that-may-not-be-there', [
 *   animate(...),
 *   animate(...)
 * ], { optional: true })
 * ```
 *
 * **Special Selector Values**
 *
 *
 * The selector value within a query can collect elements that contain angular-specific
 * characteristics
 * using special pseudo-selectors tokens.
 *
 * These include:
 *
 *  - Querying for newly inserted/removed elements using `query(":enter")`/`query(":leave")`
 *  - Querying all currently animating elements using `query(":animating")`
 *  - Querying elements that contain an animation trigger using `query("@triggerName")`
 *  - Querying all elements that contain an animation triggers using `query("@*")`
 *  - Including the current element into the animation sequence using `query(":self")`
 *
 *
 *  Each of these pseudo-selector tokens can be merged together into a combined query selector
 * string:
 *
 *  ```
 *  query(':self, .record:enter, .record:leave, @subTrigger', [...])
 *  ```
 *
 * **Demo**
 *
 *
 * ```
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
 *
 * @experimental Animation support is experimental.
 */
export function query(selector, animation, options) {
    if (options === void 0) { options = null; }
    return { type: 11 /* Query */, selector: selector, animation: animation, options: options };
}
/**
 * `stagger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is designed to be used inside of an animation {@link query query()}
 * and works by issuing a timing gap between after each queried item is animated.
 *
 * **Usage**
 *
 * In the example below there is a container element that wraps a list of items stamped out
 * by an ngFor. The container element contains an animation trigger that will later be set
 * to query for each of the inner items.
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
 * The component code for this looks as such:
 *
 * ```ts
 * import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
 * @Component({
 *   templateUrl: 'list.component.html',
 *   animations: [
 *     trigger('listAnimation', [
 *        //...
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
 *   }
 * }
 * ```
 *
 * And now for the animation trigger code:
 *
 * ```ts
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
 * Now each time the items are added/removed then either the opacity
 * fade-in animation will run or each removed item will be faded out.
 * When either of these animations occur then a stagger effect will be
 * applied after each item's animation is started.
 *
 * @experimental Animation support is experimental.
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings: timings, animation: animation };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQStFQSxNQUFNLENBQUMsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1VTlCLE1BQU0sa0JBQWtCLElBQVksRUFBRSxXQUFnQztJQUNwRSxNQUFNLENBQUMsRUFBQyxJQUFJLGlCQUErQixFQUFFLElBQUksTUFBQSxFQUFFLFdBQVcsYUFBQSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsQ0FBQztDQUM5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnREQsTUFBTSxrQkFDRixPQUF3QixFQUFFLE1BQ1g7SUFEVyx1QkFBQSxFQUFBLGFBQ1g7SUFDakIsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxNQUFNLFFBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0NBQy9EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDRCxNQUFNLGdCQUNGLEtBQTBCLEVBQUUsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUNyRSxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUM1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ0QsTUFBTSxtQkFBbUIsS0FBMEIsRUFBRSxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBRTFGLE1BQU0sQ0FBQyxFQUFDLElBQUksa0JBQWdDLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUMvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDRCxNQUFNLGdCQUNGLE1BQzJDO0lBQzdDLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztDQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtERCxNQUFNLGdCQUNGLElBQVksRUFBRSxNQUE4QixFQUM1QyxPQUF5QztJQUMzQyxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsSUFBSSxNQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUNuRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStDRCxNQUFNLG9CQUFvQixLQUErQjtJQUN2RCxNQUFNLENBQUMsRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssT0FBQSxFQUFDLENBQUM7Q0FDdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNE1ELE1BQU0scUJBQ0YsZUFDc0UsRUFDdEUsS0FBOEMsRUFDOUMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxNQUFNLENBQUMsRUFBQyxJQUFJLG9CQUFrQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0NBQ25HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0QsTUFBTSxvQkFDRixLQUE4QyxFQUM5QyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUksbUJBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0NBQzNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvR0QsTUFBTSx1QkFBdUIsT0FBMEM7SUFBMUMsd0JBQUEsRUFBQSxjQUEwQztJQUVyRSxNQUFNLENBQUMsRUFBQyxJQUFJLHNCQUFvQyxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7Q0FDNUQ7Ozs7Ozs7O0FBU0QsTUFBTSx1QkFDRixTQUFxQyxFQUNyQyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUkscUJBQWtDLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUNyRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnR0QsTUFBTSxnQkFDRixRQUFnQixFQUFFLFNBQWtELEVBQ3BFLE9BQTRDO0lBQTVDLHdCQUFBLEVBQUEsY0FBNEM7SUFDOUMsTUFBTSxDQUFDLEVBQUMsSUFBSSxnQkFBNkIsRUFBRSxRQUFRLFVBQUEsRUFBRSxTQUFTLFdBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0NBQzFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0ZELE1BQU0sa0JBQ0YsT0FBd0IsRUFDeEIsU0FBa0Q7SUFDcEQsTUFBTSxDQUFDLEVBQUMsSUFBSSxrQkFBK0IsRUFBRSxPQUFPLFNBQUEsRUFBRSxTQUFTLFdBQUEsRUFBQyxDQUFDO0NBQ2xFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSDJtVN0eWxlRGF0YSB7IFtrZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXI7IH1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgY3JlYXRlZCBpbnRlcm5hbGx5XG4gKiB3aXRoaW4gdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIERTTC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBBbmltYXRlVGltaW5ncyA9IHtcbiAgZHVyYXRpb246IG51bWJlcixcbiAgZGVsYXk6IG51bWJlcixcbiAgZWFzaW5nOiBzdHJpbmcgfCBudWxsXG59O1xuXG4vKipcbiAqIGBBbmltYXRpb25PcHRpb25zYCByZXByZXNlbnRzIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIGludG8gbW9zdCBhbmltYXRpb24gRFNMIG1ldGhvZHMuXG4gKiBXaGVuIG9wdGlvbnMgYXJlIHByb3ZpZGVkLCB0aGUgZGVsYXkgdmFsdWUgb2YgYW4gYW5pbWF0aW9uIGNhbiBiZSBjaGFuZ2VkIGFuZCBhbmltYXRpb24gaW5wdXRcbiAqIHBhcmFtZXRlcnMgY2FuIGJlIHBhc3NlZCBpbiB0byBjaGFuZ2Ugc3R5bGluZyBhbmQgdGltaW5nIGRhdGEgd2hlbiBhbiBhbmltYXRpb24gaXMgc3RhcnRlZC5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGFuaW1hdGlvbiBEU0wgZnVuY3Rpb25zIGFyZSBhYmxlIHRvIGFjY2VwdCBhbmltYXRpb24gb3B0aW9uIGRhdGE6XG4gKlxuICogLSB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9uKCl9XG4gKiAtIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZSgpfVxuICogLSB7QGxpbmsgZ3JvdXAgZ3JvdXAoKX1cbiAqIC0ge0BsaW5rIHF1ZXJ5IHF1ZXJ5KCl9XG4gKiAtIHtAbGluayBhbmltYXRpb24gYW5pbWF0aW9uKCl9XG4gKiAtIHtAbGluayB1c2VBbmltYXRpb24gdXNlQW5pbWF0aW9uKCl9XG4gKiAtIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkKCl9XG4gKlxuICogUHJvZ3JhbW1hdGljIGFuaW1hdGlvbnMgYnVpbHQgdXNpbmcge0BsaW5rIEFuaW1hdGlvbkJ1aWxkZXIgdGhlIEFuaW1hdGlvbkJ1aWxkZXIgc2VydmljZX0gYWxzb1xuICogbWFrZSB1c2Ugb2YgQW5pbWF0aW9uT3B0aW9ucy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvbk9wdGlvbnMge1xuICBkZWxheT86IG51bWJlcnxzdHJpbmc7XG4gIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgY3JlYXRlZCBpbnRlcm5hbGx5XG4gKiB3aXRoaW4gdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIERTTCB3aGVuIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkKCl9IGlzIHVzZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRlQ2hpbGRPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7IGR1cmF0aW9uPzogbnVtYmVyfHN0cmluZzsgfVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gVXNhZ2VzIG9mIHRoaXMgZW51bSBhcmUgY3JlYXRlZFxuICogZWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBEU0wgZnVuY3Rpb24gaXMgdXNlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlIHtcbiAgU3RhdGUgPSAwLFxuICBUcmFuc2l0aW9uID0gMSxcbiAgU2VxdWVuY2UgPSAyLFxuICBHcm91cCA9IDMsXG4gIEFuaW1hdGUgPSA0LFxuICBLZXlmcmFtZXMgPSA1LFxuICBTdHlsZSA9IDYsXG4gIFRyaWdnZXIgPSA3LFxuICBSZWZlcmVuY2UgPSA4LFxuICBBbmltYXRlQ2hpbGQgPSA5LFxuICBBbmltYXRlUmVmID0gMTAsXG4gIFF1ZXJ5ID0gMTEsXG4gIFN0YWdnZXIgPSAxMlxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY29uc3QgQVVUT19TVFlMRSA9ICcqJztcblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25NZXRhZGF0YSB7IHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZTsgfVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayB0cmlnZ2VyIHRyaWdnZXIgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiB7cGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9fXxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzdGF0ZSBzdGF0ZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YTtcbiAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX07XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbiBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGV4cHI6IHN0cmluZ3xcbiAgICAgICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pO1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsga2V5ZnJhbWVzIGtleWZyYW1lcyBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzdHlsZSBzdHlsZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHlsZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdHlsZXM6ICcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXxBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXwnKic+O1xuICBvZmZzZXQ6IG51bWJlcnxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBhbmltYXRlIGFuaW1hdGUgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyfEFuaW1hdGVUaW1pbmdzO1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGF8QW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YXxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHVzZUFuaW1hdGlvbiB1c2VBbmltYXRpb24gYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZVJlZk1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIGdyb3VwIGdyb3VwIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHF1ZXJ5IHF1ZXJ5IGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFVzZWQgdG8gbGltaXQgdGhlIHRvdGFsIGFtb3VudCBvZiByZXN1bHRzIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBxdWVyeSBsaXN0LlxuICAgKlxuICAgKiBJZiBhIG5lZ2F0aXZlIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW4gdGhlIHF1ZXJpZWQgcmVzdWx0cyB3aWxsIGJlIGxpbWl0ZWQgZnJvbSB0aGVcbiAgICogZW5kIG9mIHRoZSBxdWVyeSBsaXN0IHRvd2FyZHMgdGhlIGJlZ2lubmluZyAoZS5nLiBpZiBgbGltaXQ6IC0zYCBpcyB1c2VkIHRoZW4gdGhlXG4gICAqIGZpbmFsIDMgKG9yIGxlc3MpIHF1ZXJpZWQgcmVzdWx0cyB3aWxsIGJlIHVzZWQgZm9yIHRoZSBhbmltYXRpb24pLlxuICAgKi9cbiAgbGltaXQ/OiBudW1iZXI7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHN0YWdnZXIgc3RhZ2dlciBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXI7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBgdHJpZ2dlcmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZVxuICoge0BsaW5rIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXJcbiAqIHVuZGVyc3RhbmRpbmcgb2YgaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgdHJpZ2dlcmAgQ3JlYXRlcyBhbiBhbmltYXRpb24gdHJpZ2dlciB3aGljaCB3aWxsIGEgbGlzdCBvZiB7QGxpbmsgc3RhdGUgc3RhdGV9IGFuZFxuICoge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0gZW50cmllcyB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIHdoZW4gdGhlIGV4cHJlc3Npb25cbiAqIGJvdW5kIHRvIHRoZSB0cmlnZ2VyIGNoYW5nZXMuXG4gKlxuICogVHJpZ2dlcnMgYXJlIHJlZ2lzdGVyZWQgd2l0aGluIHRoZSBjb21wb25lbnQgYW5ub3RhdGlvbiBkYXRhIHVuZGVyIHRoZVxuICoge0BsaW5rIENvbXBvbmVudCNhbmltYXRpb25zIGFuaW1hdGlvbnMgc2VjdGlvbn0uIEFuIGFuaW1hdGlvbiB0cmlnZ2VyIGNhbiBiZSBwbGFjZWQgb24gYW4gZWxlbWVudFxuICogd2l0aGluIGEgdGVtcGxhdGUgYnkgcmVmZXJlbmNpbmcgdGhlIG5hbWUgb2YgdGhlIHRyaWdnZXIgZm9sbG93ZWQgYnkgdGhlIGV4cHJlc3Npb24gdmFsdWUgdGhhdFxuICogdGhlIHRyaWdnZXIgaXMgYm91bmQgdG8gKGluIHRoZSBmb3JtIG9mIGBbQHRyaWdnZXJOYW1lXT1cImV4cHJlc3Npb25cImAuXG4gKlxuICogQW5pbWF0aW9uIHRyaWdnZXIgYmluZGluZ3Mgc3RyaWdpZnkgdmFsdWVzIGFuZCB0aGVuIG1hdGNoIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCB2YWx1ZXMgYWdhaW5zdFxuICogYW55IGxpbmtlZCB0cmFuc2l0aW9ucy4gSWYgYSBib29sZWFuIHZhbHVlIGlzIHByb3ZpZGVkIGludG8gdGhlIHRyaWdnZXIgYmluZGluZyB0aGVuIGl0IHdpbGwgYm90aFxuICogYmUgcmVwcmVzZW50ZWQgYXMgYDFgIG9yIGB0cnVlYCBhbmQgYDBgIG9yIGBmYWxzZWAgZm9yIGEgdHJ1ZSBhbmQgZmFsc2UgYm9vbGVhbiB2YWx1ZXNcbiAqIHJlc3BlY3RpdmVseS5cbiAqXG4gKiAqKlVzYWdlKipcbiAqXG4gKiBgdHJpZ2dlcmAgd2lsbCBjcmVhdGUgYW4gYW5pbWF0aW9uIHRyaWdnZXIgcmVmZXJlbmNlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBgbmFtZWAgdmFsdWUuIFRoZVxuICogcHJvdmlkZWQgYGFuaW1hdGlvbmAgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXkgY29uc2lzdGluZyBvZiB7QGxpbmsgc3RhdGUgc3RhdGV9IGFuZFxuICoge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0gZGVjbGFyYXRpb25zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLilcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwic29tZXRoaW5nXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IHdpbGwgbWFrZSB1c2Ugb2YgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIGFuaW1hdGlvblxuICogdHJpZ2dlciBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAqKlVzaW5nIGFuIGlubGluZSBmdW5jdGlvbioqXG4gKlxuICogVGhlIGB0cmFuc2l0aW9uYCBhbmltYXRpb24gbWV0aG9kIGFsc28gc3VwcG9ydHMgcmVhZGluZyBhbiBpbmxpbmUgZnVuY3Rpb24gd2hpY2ggY2FuIGRlY2lkZVxuICogaWYgaXRzIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHNob3VsZCBiZSBydW4uXG4gKlxuICogYGBgXG4gKiAvLyB0aGlzIG1ldGhvZCB3aWxsIGJlIHJ1biBlYWNoIHRpbWUgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgXG4gKiAvLyB0cmlnZ2VyIHZhbHVlIGNoYW5nZXMuLi5cbiAqIGZ1bmN0aW9uIG15SW5saW5lTWF0Y2hlckZuKFxuICogICBmcm9tU3RhdGU6IHN0cmluZyxcbiAqICAgdG9TdGF0ZTogc3RyaW5nLFxuICogICBlbGVtZW50OiBhbnksXG4gKiAgIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX1cbiAqICk6IGJvb2xlYW4ge1xuICogICAvLyBub3RpY2UgdGhhdCBgZWxlbWVudGAgYW5kIGBwYXJhbXNgIGFyZSBhbHNvIGF2YWlsYWJsZSBoZXJlXG4gKiAgIHJldHVybiB0b1N0YXRlID09ICd5ZXMtcGxlYXNlLWFuaW1hdGUnO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ215QW5pbWF0aW9uVHJpZ2dlcicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24obXlJbmxpbmVNYXRjaGVyRm4sIFtcbiAqICAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSBjb2RlXG4gKiAgICAgICBdKSxcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwieWVzLXBsZWFzZS1hbmltYXRlXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgaW5saW5lIG1ldGhvZCB3aWxsIGJlIHJ1biBlYWNoIHRpbWUgdGhlIHRyaWdnZXJcbiAqIHZhbHVlIGNoYW5nZXNcbiAqXG4gKiAqKkRpc2FibGUgQW5pbWF0aW9ucyoqXG4gKlxuICogQSBzcGVjaWFsIGFuaW1hdGlvbiBjb250cm9sIGJpbmRpbmcgY2FsbGVkIGBALmRpc2FibGVkYCBjYW4gYmUgcGxhY2VkIG9uIGFuIGVsZW1lbnQgd2hpY2ggd2lsbFxuICogdGhlbiBkaXNhYmxlIGFuaW1hdGlvbnMgZm9yIGFueSBpbm5lciBhbmltYXRpb24gdHJpZ2dlcnMgc2l0dWF0ZWQgd2l0aGluIHRoZSBlbGVtZW50IGFzIHdlbGwgYXNcbiAqIGFueSBhbmltYXRpb25zIG9uIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAqXG4gKiBXaGVuIHRydWUsIHRoZSBgQC5kaXNhYmxlZGAgYmluZGluZyB3aWxsIHByZXZlbnQgYWxsIGFuaW1hdGlvbnMgZnJvbSByZW5kZXJpbmcuIFRoZSBleGFtcGxlXG4gKiBiZWxvdyBzaG93cyBob3cgdG8gdXNlIHRoaXMgZmVhdHVyZTpcbiAqXG4gKiBgYGB0c1xuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtALmRpc2FibGVkXT1cImlzRGlzYWJsZWRcIj5cbiAqICAgICAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJjaGlsZEFuaW1hdGlvblwiLCBbXG4gKiAgICAgICAvLyAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBpc0Rpc2FibGVkID0gdHJ1ZTtcbiAqICAgZXhwID0gJy4uLic7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgYEBjaGlsZEFuaW1hdGlvbmAgdHJpZ2dlciB3aWxsIG5vdCBhbmltYXRlIGJlY2F1c2UgYEAuZGlzYWJsZWRgIHByZXZlbnRzIGl0IGZyb20gaGFwcGVuaW5nXG4gKiAod2hlbiB0cnVlKS5cbiAqXG4gKiBOb3RlIHRoYXQgYEAuZGlzYWJsZWRgIHdpbGwgb25seSBkaXNhYmxlIGFsbCBhbmltYXRpb25zICh0aGlzIG1lYW5zIGFueSBhbmltYXRpb25zIHJ1bm5pbmcgb25cbiAqIHRoZSBzYW1lIGVsZW1lbnQgd2lsbCBhbHNvIGJlIGRpc2FibGVkKS5cbiAqXG4gKiAqKkRpc2FibGluZyBBbmltYXRpb25zIEFwcGxpY2F0aW9uLXdpZGUqKlxuICpcbiAqIFdoZW4gYW4gYXJlYSBvZiB0aGUgdGVtcGxhdGUgaXMgc2V0IHRvIGhhdmUgYW5pbWF0aW9ucyBkaXNhYmxlZCwgKiphbGwqKiBpbm5lciBjb21wb25lbnRzIHdpbGxcbiAqIGFsc28gaGF2ZSB0aGVpciBhbmltYXRpb25zIGRpc2FibGVkIGFzIHdlbGwuIFRoaXMgbWVhbnMgdGhhdCBhbGwgYW5pbWF0aW9ucyBmb3IgYW4gYW5ndWxhclxuICogYXBwbGljYXRpb24gY2FuIGJlIGRpc2FibGVkIGJ5IHBsYWNpbmcgYSBob3N0IGJpbmRpbmcgc2V0IG9uIGBALmRpc2FibGVkYCBvbiB0aGUgdG9wbW9zdCBBbmd1bGFyXG4gKiBjb21wb25lbnQuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBIb3N0QmluZGluZ30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwLWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJyxcbiAqIH0pXG4gKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ0AuZGlzYWJsZWQnKVxuICogICBwdWJsaWMgYW5pbWF0aW9uc0Rpc2FibGVkID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICoqV2hhdCBhYm91dCBhbmltYXRpb25zIHRoYXQgdXNlIGBxdWVyeSgpYCBhbmQgYGFuaW1hdGVDaGlsZCgpYD8qKlxuICpcbiAqIERlc3BpdGUgaW5uZXIgYW5pbWF0aW9ucyBiZWluZyBkaXNhYmxlZCwgYSBwYXJlbnQgYW5pbWF0aW9uIGNhbiBgcXVlcnlgIGZvciBpbm5lclxuICogZWxlbWVudHMgbG9jYXRlZCBpbiBkaXNhYmxlZCBhcmVhcyBvZiB0aGUgdGVtcGxhdGUgYW5kIHN0aWxsIGFuaW1hdGUgdGhlbSBhcyBpdCBzZWVzIGZpdC4gVGhpcyBpc1xuICogYWxzbyB0aGUgY2FzZSBmb3Igd2hlbiBhIHN1YiBhbmltYXRpb24gaXMgcXVlcmllZCBieSBhIHBhcmVudCBhbmQgdGhlbiBsYXRlciBhbmltYXRlZCB1c2luZ1xuICogYW5pbWF0ZUNoaWxkYC5cbiAqXG4gKiAqKkRldGVjdGluZyB3aGVuIGFuIGFuaW1hdGlvbiBpcyBkaXNhYmxlZCoqXG4gKlxuICogSWYgYSByZWdpb24gb2YgdGhlIERPTSAob3IgdGhlIGVudGlyZSBhcHBsaWNhdGlvbikgaGFzIGl0cyBhbmltYXRpb25zIGRpc2FibGVkLCB0aGVuIGFuaW1hdGlvblxuICogdHJpZ2dlciBjYWxsYmFja3Mgd2lsbCBzdGlsbCBmaXJlIGp1c3QgYXMgbm9ybWFsIChvbmx5IGZvciB6ZXJvIHNlY29uZHMpLlxuICpcbiAqIFdoZW4gYSB0cmlnZ2VyIGNhbGxiYWNrIGZpcmVzIGl0IHdpbGwgcHJvdmlkZSBhbiBpbnN0YW5jZSBvZiBhbiB7QGxpbmsgQW5pbWF0aW9uRXZlbnR9LiBJZlxuICogYW5pbWF0aW9ucyBhcmUgZGlzYWJsZWQgdGhlbiB0aGUgYC5kaXNhYmxlZGAgZmxhZyBvbiB0aGUgZXZlbnQgd2lsbCBiZSB0cnVlLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlciwgbmFtZSwgZGVmaW5pdGlvbnMsIG9wdGlvbnM6IHt9fTtcbn1cblxuLyoqXG4gKiBgYW5pbWF0ZWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZVxuICoge0BsaW5rIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgYW5pbWF0ZWAgc3BlY2lmaWVzIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBhcHBseSB0aGUgcHJvdmlkZWQgYHN0eWxlc2AgZGF0YSBmb3IgYSBnaXZlblxuICogYW1vdW50IG9mIHRpbWUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGB0aW1pbmdgIGV4cHJlc3Npb24gdmFsdWUuIENhbGxzIHRvIGBhbmltYXRlYCBhcmUgZXhwZWN0ZWRcbiAqIHRvIGJlIHVzZWQgd2l0aGluIHtAbGluayBzZXF1ZW5jZSBhbiBhbmltYXRpb24gc2VxdWVuY2V9LCB7QGxpbmsgZ3JvdXAgZ3JvdXB9LCBvciB7QGxpbmtcbiAqIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0uXG4gKlxuICoge0BhIHVzYWdlfVxuICogKipVc2FnZSoqXG4gKlxuICogVGhlIGBhbmltYXRlYCBmdW5jdGlvbiBhY2NlcHRzIHR3byBpbnB1dCBwYXJhbWV0ZXJzOiBgdGltaW5nYCBhbmQgYHN0eWxlc2A6XG4gKlxuICogLSBgdGltaW5nYCBpcyBhIHN0cmluZyBiYXNlZCB2YWx1ZSB0aGF0IGNhbiBiZSBhIGNvbWJpbmF0aW9uIG9mIGEgZHVyYXRpb24gd2l0aCBvcHRpb25hbCBkZWxheVxuICogYW5kIGVhc2luZyB2YWx1ZXMuIFRoZSBmb3JtYXQgZm9yIHRoZSBleHByZXNzaW9uIGJyZWFrcyBkb3duIHRvIGBkdXJhdGlvbiBkZWxheSBlYXNpbmdgXG4gKiAodGhlcmVmb3JlIGEgdmFsdWUgc3VjaCBhcyBgMXMgMTAwbXMgZWFzZS1vdXRgIHdpbGwgYmUgcGFyc2UgaXRzZWxmIGludG8gYGR1cmF0aW9uPTEwMDAsXG4gKiBkZWxheT0xMDAsIGVhc2luZz1lYXNlLW91dGAuIElmIGEgbnVtZXJpYyB2YWx1ZSBpcyBwcm92aWRlZCB0aGVuIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHRoZVxuICogYGR1cmF0aW9uYCB2YWx1ZSBpbiBtaWxsaXNlY29uZCBmb3JtLlxuICogLSBgc3R5bGVzYCBpcyB0aGUgc3R5bGUgaW5wdXQgZGF0YSB3aGljaCBjYW4gZWl0aGVyIGJlIGEgY2FsbCB0byB7QGxpbmsgc3R5bGUgc3R5bGV9IG9yIHtAbGlua1xuICoga2V5ZnJhbWVzIGtleWZyYW1lc30uIElmIGxlZnQgZW1wdHkgdGhlbiB0aGUgc3R5bGVzIGZyb20gdGhlIGRlc3RpbmF0aW9uIHN0YXRlIHdpbGwgYmUgY29sbGVjdGVkXG4gKiBhbmQgdXNlZCAodGhpcyBpcyB1c2VmdWwgd2hlbiBkZXNjcmliaW5nIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBjb21wbGV0ZSBhbiBhbmltYXRpb24gYnlcbiAqIHtAbGluayB0cmFuc2l0aW9uI3RoZS1maW5hbC1hbmltYXRlLWNhbGwgYW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZX0pLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBzcGVjaWZ5aW5nIHRpbWluZyBkYXRhXG4gKiBhbmltYXRlKDUwMCwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCIxc1wiLCBzdHlsZSguLi4pKVxuICogYW5pbWF0ZShcIjEwMG1zIDAuNXNcIiwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCI1cyBlYXNlXCIsIHN0eWxlKC4uLikpXG4gKiBhbmltYXRlKFwiNXMgMTBtcyBjdWJpYy1iZXppZXIoLjE3LC42NywuODgsLjEpXCIsIHN0eWxlKC4uLikpXG4gKlxuICogLy8gZWl0aGVyIHN0eWxlKCkgb2Yga2V5ZnJhbWVzKCkgY2FuIGJlIHVzZWRcbiAqIGFuaW1hdGUoNTAwLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiBhbmltYXRlKDUwMCwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImJsdWVcIiB9KSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGUoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgfCBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHxcbiAgICAgICAgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlLCBzdHlsZXMsIHRpbWluZ3N9O1xufVxuXG4vKipcbiAqIGBncm91cGAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgZ3JvdXBgIHNwZWNpZmllcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRoYXQgYXJlIGFsbCBydW4gaW4gcGFyYWxsZWwuIEdyb3VwZWQgYW5pbWF0aW9ucyBhcmVcbiAqIHVzZWZ1bCB3aGVuIGEgc2VyaWVzIG9mIHN0eWxlcyBtdXN0IGJlIGFuaW1hdGVkL2Nsb3NlZCBvZmYgYXQgZGlmZmVyZW50IHN0YXJ0aW5nL2VuZGluZyB0aW1lcy5cbiAqXG4gKiBUaGUgYGdyb3VwYCBmdW5jdGlvbiBjYW4gZWl0aGVyIGJlIHVzZWQgd2l0aGluIGEge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlfSBvciBhIHtAbGluayB0cmFuc2l0aW9uXG4gKiB0cmFuc2l0aW9ufSBhbmQgaXQgd2lsbCBvbmx5IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9uY2UgYWxsIG9mIHRoZSBpbm5lciBhbmltYXRpb25cbiAqIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICpcbiAqICoqVXNhZ2UqKlxuICpcbiAqIFRoZSBgc3RlcHNgIGRhdGEgdGhhdCBpcyBwYXNzZWQgaW50byB0aGUgYGdyb3VwYCBhbmltYXRpb24gZnVuY3Rpb24gY2FuIGVpdGhlciBjb25zaXN0IG9mIHtAbGlua1xuICogc3R5bGUgc3R5bGV9IG9yIHtAbGluayBhbmltYXRlIGFuaW1hdGV9IGZ1bmN0aW9uIGNhbGxzLiBFYWNoIGNhbGwgdG8gYHN0eWxlKClgIG9yIGBhbmltYXRlKClgXG4gKiB3aXRoaW4gYSBncm91cCB3aWxsIGJlIGV4ZWN1dGVkIGluc3RhbnRseSAodXNlIHtAbGluayBrZXlmcmFtZXMga2V5ZnJhbWVzfSBvciBhIHtAbGlua1xuICogYW5pbWF0ZSN1c2FnZSBhbmltYXRlKCkgd2l0aCBhIGRlbGF5IHZhbHVlfSB0byBvZmZzZXQgc3R5bGVzIHRvIGJlIGFwcGxpZWQgYXQgYSBsYXRlciB0aW1lKS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBncm91cChbXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCB7IGJhY2tncm91bmQ6IFwiYmxhY2tcIiB9KSlcbiAqICAgYW5pbWF0ZShcIjJzXCIsIHsgY29sb3I6IFwid2hpdGVcIiB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25Hcm91cE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXAsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgc2VxdWVuY2VgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHNlcXVlbmNlYCBTcGVjaWZpZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0aGF0IGFyZSBydW4gb25lIGJ5IG9uZS4gKGBzZXF1ZW5jZWAgaXMgdXNlZCBieVxuICogZGVmYXVsdCB3aGVuIGFuIGFycmF5IGlzIHBhc3NlZCBhcyBhbmltYXRpb24gZGF0YSBpbnRvIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259LilcbiAqXG4gKiBUaGUgYHNlcXVlbmNlYCBmdW5jdGlvbiBjYW4gZWl0aGVyIGJlIHVzZWQgd2l0aGluIGEge0BsaW5rIGdyb3VwIGdyb3VwfSBvciBhIHtAbGluayB0cmFuc2l0aW9uXG4gKiB0cmFuc2l0aW9ufSBhbmQgaXQgd2lsbCBvbmx5IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9uY2UgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiBUbyBwZXJmb3JtIGFuaW1hdGlvbiBzdHlsaW5nIGluIHBhcmFsbGVsIHdpdGggb3RoZXIgYW5pbWF0aW9uIHN0ZXBzIHRoZW4gaGF2ZSBhIGxvb2sgYXQgdGhlXG4gKiB7QGxpbmsgZ3JvdXAgZ3JvdXB9IGFuaW1hdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiAqKlVzYWdlKipcbiAqXG4gKiBUaGUgYHN0ZXBzYCBkYXRhIHRoYXQgaXMgcGFzc2VkIGludG8gdGhlIGBzZXF1ZW5jZWAgYW5pbWF0aW9uIGZ1bmN0aW9uIGNhbiBlaXRoZXIgY29uc2lzdCBvZlxuICoge0BsaW5rIHN0eWxlIHN0eWxlfSBvciB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlfSBmdW5jdGlvbiBjYWxscy4gQSBjYWxsIHRvIGBzdHlsZSgpYCB3aWxsIGFwcGx5IHRoZVxuICogcHJvdmlkZWQgc3R5bGluZyBkYXRhIGltbWVkaWF0ZWx5IHdoaWxlIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB3aWxsIGFwcGx5IGl0cyBzdHlsaW5nIGRhdGEgb3ZlciBhXG4gKiBnaXZlbiB0aW1lIGRlcGVuZGluZyBvbiBpdHMgdGltaW5nIGRhdGEuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICBhbmltYXRlKFwiMXNcIiwgeyBvcGFjaXR5OiAxIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2Uoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHN0eWxlYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlXG4gKiB7QGxpbmsgQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBzdHlsZWAgZGVjbGFyZXMgYSBrZXkvdmFsdWUgb2JqZWN0IGNvbnRhaW5pbmcgQ1NTIHByb3BlcnRpZXMvc3R5bGVzIHRoYXQgY2FuIHRoZW4gYmUgdXNlZCBmb3JcbiAqIHtAbGluayBzdGF0ZSBhbmltYXRpb24gc3RhdGVzfSwgd2l0aGluIGFuIHtAbGluayBzZXF1ZW5jZSBhbmltYXRpb24gc2VxdWVuY2V9LCBvciBhcyBzdHlsaW5nIGRhdGFcbiAqIGZvciBib3RoIHtAbGluayBhbmltYXRlIGFuaW1hdGV9IGFuZCB7QGxpbmsga2V5ZnJhbWVzIGtleWZyYW1lc30uXG4gKlxuICogKipVc2FnZSoqXG4gKlxuICogYHN0eWxlYCB0YWtlcyBpbiBhIGtleS92YWx1ZSBzdHJpbmcgbWFwIGFzIGRhdGEgYW5kIGV4cGVjdHMgb25lIG9yIG1vcmUgQ1NTIHByb3BlcnR5L3ZhbHVlIHBhaXJzXG4gKiB0byBiZSBkZWZpbmVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHN0cmluZyB2YWx1ZXMgYXJlIHVzZWQgZm9yIGNzcyBwcm9wZXJ0aWVzXG4gKiBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIsIGNvbG9yOiBcImJsdWVcIiB9KVxuICpcbiAqIC8vIG51bWVyaWNhbCAocGl4ZWwpIHZhbHVlcyBhcmUgYWxzbyBzdXBwb3J0ZWRcbiAqIHN0eWxlKHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAwIH0pXG4gKiBgYGBcbiAqXG4gKiAqKkF1dG8tc3R5bGVzICh1c2luZyBgKmApKipcbiAqXG4gKiBXaGVuIGFuIGFzdGVyaXggKGAqYCkgY2hhcmFjdGVyIGlzIHVzZWQgYXMgYSB2YWx1ZSB0aGVuIGl0IHdpbGwgYmUgZGV0ZWN0ZWQgZnJvbSB0aGUgZWxlbWVudFxuICogYmVpbmcgYW5pbWF0ZWQgYW5kIGFwcGxpZWQgYXMgYW5pbWF0aW9uIGRhdGEgd2hlbiB0aGUgYW5pbWF0aW9uIHN0YXJ0cy5cbiAqXG4gKiBUaGlzIGZlYXR1cmUgcHJvdmVzIHVzZWZ1bCBmb3IgYSBzdGF0ZSBkZXBlbmRpbmcgb24gbGF5b3V0IGFuZC9vciBlbnZpcm9ubWVudCBmYWN0b3JzOyBpbiBzdWNoXG4gKiBjYXNlcyB0aGUgc3R5bGVzIGFyZSBjYWxjdWxhdGVkIGp1c3QgYmVmb3JlIHRoZSBhbmltYXRpb24gc3RhcnRzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoZSBzdGVwcyBiZWxvdyB3aWxsIGFuaW1hdGUgZnJvbSAwIHRvIHRoZVxuICogLy8gYWN0dWFsIGhlaWdodCBvZiB0aGUgZWxlbWVudFxuICogc3R5bGUoeyBoZWlnaHQ6IDAgfSksXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZShcbiAgICB0b2tlbnM6ICcqJyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9IHxcbiAgICBBcnJheTwnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0+KTogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlLCBzdHlsZXM6IHRva2Vucywgb2Zmc2V0OiBudWxsfTtcbn1cblxuLyoqXG4gKiBgc3RhdGVgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHN0YXRlYCBkZWNsYXJlcyBhbiBhbmltYXRpb24gc3RhdGUgd2l0aGluIHRoZSBnaXZlbiB0cmlnZ2VyLiBXaGVuIGEgc3RhdGUgaXMgYWN0aXZlIHdpdGhpbiBhXG4gKiBjb21wb25lbnQgdGhlbiBpdHMgYXNzb2NpYXRlZCBzdHlsZXMgd2lsbCBwZXJzaXN0IG9uIHRoZSBlbGVtZW50IHRoYXQgdGhlIHRyaWdnZXIgaXMgYXR0YWNoZWQgdG9cbiAqIChldmVuIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRzKS5cbiAqXG4gKiBUbyBhbmltYXRlIGJldHdlZW4gc3RhdGVzLCBoYXZlIGEgbG9vayBhdCB0aGUgYW5pbWF0aW9uIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259IERTTFxuICogZnVuY3Rpb24uIFRvIHJlZ2lzdGVyIHN0YXRlcyB0byBhbiBhbmltYXRpb24gdHJpZ2dlciBwbGVhc2UgaGF2ZSBhIGxvb2sgYXQgdGhlIHtAbGluayB0cmlnZ2VyXG4gKiB0cmlnZ2VyfSBmdW5jdGlvbi5cbiAqXG4gKiAqKlRoZSBgdm9pZGAgc3RhdGUqKlxuICpcbiAqIFRoZSBgdm9pZGAgc3RhdGUgdmFsdWUgaXMgYSByZXNlcnZlZCB3b3JkIHRoYXQgYW5ndWxhciB1c2VzIHRvIGRldGVybWluZSB3aGVuIHRoZSBlbGVtZW50IGlzIG5vdFxuICogYXBhcnQgb2YgdGhlIGFwcGxpY2F0aW9uIGFueW1vcmUgKGUuZy4gd2hlbiBhbiBgbmdJZmAgZXZhbHVhdGVzIHRvIGZhbHNlIHRoZW4gdGhlIHN0YXRlIG9mIHRoZVxuICogYXNzb2NpYXRlZCBlbGVtZW50IGlzIHZvaWQpLlxuICpcbiAqICoqVGhlIGAqYCAoZGVmYXVsdCkgc3RhdGUqKlxuICpcbiAqIFRoZSBgKmAgc3RhdGUgKHdoZW4gc3R5bGVkKSBpcyBhIGZhbGxiYWNrIHN0YXRlIHRoYXQgd2lsbCBiZSB1c2VkIGlmIHRoZSBzdGF0ZSB0aGF0IGlzIGJlaW5nXG4gKiBhbmltYXRlZCBpcyBub3QgZGVjbGFyZWQgd2l0aGluIHRoZSB0cmlnZ2VyLlxuICpcbiAqICoqVXNhZ2UqKlxuICpcbiAqIGBzdGF0ZWAgd2lsbCBkZWNsYXJlIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoIGl0cyBhc3NvY2lhdGVkIHN0eWxlc1xuICogd2l0aGluIHRoZSBnaXZlbiB0cmlnZ2VyLlxuICpcbiAqIC0gYHN0YXRlTmFtZUV4cHJgIGNhbiBiZSBvbmUgb3IgbW9yZSBzdGF0ZSBuYW1lcyBzZXBhcmF0ZWQgYnkgY29tbWFzLlxuICogLSBgc3R5bGVzYCByZWZlcnMgdG8gdGhlIHtAbGluayBzdHlsZSBzdHlsaW5nIGRhdGF9IHRoYXQgd2lsbCBiZSBwZXJzaXN0ZWQgb24gdGhlIGVsZW1lbnQgb25jZVxuICogdGhlIHN0YXRlIGhhcyBiZWVuIHJlYWNoZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gXCJ2b2lkXCIgaXMgYSByZXNlcnZlZCBuYW1lIGZvciBhIHN0YXRlIGFuZCBpcyB1c2VkIHRvIHJlcHJlc2VudFxuICogLy8gdGhlIHN0YXRlIGluIHdoaWNoIGFuIGVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSBmcm9tIHRoZSBhcHBsaWNhdGlvbi5cbiAqIHN0YXRlKFwidm9pZFwiLCBzdHlsZSh7IGhlaWdodDogMCB9KSlcbiAqXG4gKiAvLyB1c2VyLWRlZmluZWQgc3RhdGVzXG4gKiBzdGF0ZShcImNsb3NlZFwiLCBzdHlsZSh7IGhlaWdodDogMCB9KSlcbiAqIHN0YXRlKFwib3BlbiwgdmlzaWJsZVwiLCBzdHlsZSh7IGhlaWdodDogXCIqXCIgfSkpXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRlKFxuICAgIG5hbWU6IHN0cmluZywgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19KTogQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlLCBuYW1lLCBzdHlsZXMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBrZXlmcmFtZXNgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGVcbiAqIHtAbGluayBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmdcbiAqIG9mIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYGtleWZyYW1lc2Agc3BlY2lmaWVzIGEgY29sbGVjdGlvbiBvZiB7QGxpbmsgc3R5bGUgc3R5bGV9IGVudHJpZXMgZWFjaCBvcHRpb25hbGx5IGNoYXJhY3Rlcml6ZWRcbiAqIGJ5IGFuIGBvZmZzZXRgIHZhbHVlLlxuICpcbiAqICoqVXNhZ2UqKlxuICpcbiAqIFRoZSBga2V5ZnJhbWVzYCBhbmltYXRpb24gZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBhbG9uZ3NpZGUgdGhlIHtAbGluayBhbmltYXRlIGFuaW1hdGV9XG4gKiBhbmltYXRpb24gZnVuY3Rpb24uIEluc3RlYWQgb2YgYXBwbHlpbmcgYW5pbWF0aW9ucyBmcm9tIHdoZXJlIHRoZXkgYXJlIGN1cnJlbnRseSB0byB0aGVpclxuICogZGVzdGluYXRpb24sIGtleWZyYW1lcyBjYW4gZGVzY3JpYmUgaG93IGVhY2ggc3R5bGUgZW50cnkgaXMgYXBwbGllZCBhbmQgYXQgd2hhdCBwb2ludCB3aXRoaW4gdGhlXG4gKiBhbmltYXRpb24gYXJjIChtdWNoIGxpa2UgQ1NTIEtleWZyYW1lIEFuaW1hdGlvbnMgZG8pLlxuICpcbiAqIEZvciBlYWNoIGBzdHlsZSgpYCBlbnRyeSBhbiBgb2Zmc2V0YCB2YWx1ZSBjYW4gYmUgc2V0LiBEb2luZyBzbyBhbGxvd3MgdG8gc3BlY2lmeSBhdCB3aGF0XG4gKiBwZXJjZW50YWdlIG9mIHRoZSBhbmltYXRlIHRpbWUgdGhlIHN0eWxlcyB3aWxsIGJlIGFwcGxpZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHByb3ZpZGVkIG9mZnNldCB2YWx1ZXMgZGVzY3JpYmUgd2hlbiBlYWNoIGJhY2tncm91bmRDb2xvciB2YWx1ZSBpcyBhcHBsaWVkLlxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiLCBvZmZzZXQ6IDAgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiwgb2Zmc2V0OiAwLjIgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiLCBvZmZzZXQ6IDAuMyB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiwgb2Zmc2V0OiAxIH0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIEFsdGVybmF0aXZlbHksIGlmIHRoZXJlIGFyZSBubyBgb2Zmc2V0YCB2YWx1ZXMgdXNlZCB3aXRoaW4gdGhlIHN0eWxlIGVudHJpZXMgdGhlbiB0aGUgb2Zmc2V0c1xuICogd2lsbCBiZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiIH0pIC8vIG9mZnNldCA9IDBcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiIH0pIC8vIG9mZnNldCA9IDAuMzNcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIgfSkgLy8gb2Zmc2V0ID0gMC42NlxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiIH0pIC8vIG9mZnNldCA9IDFcbiAqIF0pKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXlmcmFtZXMoc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXSk6IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMsIHN0ZXBzfTtcbn1cblxuLyoqXG4gKiBgdHJhbnNpdGlvbmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgdHJhbnNpdGlvbmAgZGVjbGFyZXMgdGhlIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZSBvZiBhbmltYXRpb24gc3RlcHN9IHRoYXQgd2lsbCBiZSBydW4gd2hlbiB0aGVcbiAqIHByb3ZpZGVkIGBzdGF0ZUNoYW5nZUV4cHJgIHZhbHVlIGlzIHNhdGlzZmllZC4gVGhlIGBzdGF0ZUNoYW5nZUV4cHJgIGNvbnNpc3RzIG9mIGEgYHN0YXRlMSA9PlxuICogc3RhdGUyYCB3aGljaCBjb25zaXN0cyBvZiB0d28ga25vd24gc3RhdGVzICh1c2UgYW4gYXN0ZXJpeCAoYCpgKSB0byByZWZlciB0byBhIGR5bmFtaWMgc3RhcnRpbmdcbiAqIGFuZC9vciBlbmRpbmcgc3RhdGUpLlxuICpcbiAqIEEgZnVuY3Rpb24gY2FuIGFsc28gYmUgcHJvdmlkZWQgYXMgdGhlIGBzdGF0ZUNoYW5nZUV4cHJgIGFyZ3VtZW50IGZvciBhIHRyYW5zaXRpb24gYW5kIHRoaXNcbiAqIGZ1bmN0aW9uIHdpbGwgYmUgZXhlY3V0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3Vycy4gSWYgdGhlIHZhbHVlIHJldHVybmVkIHdpdGhpbiB0aGVcbiAqIGZ1bmN0aW9uIGlzIHRydWUgdGhlbiB0aGUgYXNzb2NpYXRlZCBhbmltYXRpb24gd2lsbCBiZSBydW4uXG4gKlxuICogQW5pbWF0aW9uIHRyYW5zaXRpb25zIGFyZSBwbGFjZWQgd2l0aGluIGFuIHtAbGluayB0cmlnZ2VyIGFuaW1hdGlvbiB0cmlnZ2VyfS4gRm9yIGFuIHRyYW5zaXRpb25cbiAqIHRvIGFuaW1hdGUgdG8gYSBzdGF0ZSB2YWx1ZSBhbmQgcGVyc2lzdCBpdHMgc3R5bGVzIHRoZW4gb25lIG9yIG1vcmUge0BsaW5rIHN0YXRlIGFuaW1hdGlvblxuICogc3RhdGVzfSBpcyBleHBlY3RlZCB0byBiZSBkZWZpbmVkLlxuICpcbiAqICoqVXNhZ2UqKlxuICpcbiAqIEFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uIGlzIGtpY2tlZCBvZmYgdGhlIGBzdGF0ZUNoYW5nZUV4cHJgIHByZWRpY2F0ZSBldmFsdWF0ZXMgdG8gdHJ1ZSBiYXNlZCBvblxuICogd2hhdCB0aGUgcHJldmlvdXMgc3RhdGUgaXMgYW5kIHdoYXQgdGhlIGN1cnJlbnQgc3RhdGUgaGFzIGJlY29tZS4gSW4gb3RoZXIgd29yZHMsIGlmIGEgdHJhbnNpdGlvblxuICogaXMgZGVmaW5lZCB0aGF0IG1hdGNoZXMgdGhlIG9sZC9jdXJyZW50IHN0YXRlIGNyaXRlcmlhIHRoZW4gdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHdpbGwgYmVcbiAqIHRyaWdnZXJlZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBhbGwgdHJhbnNpdGlvbi9zdGF0ZSBjaGFuZ2VzIGFyZSBkZWZpbmVkIHdpdGhpbiBhbiBhbmltYXRpb24gdHJpZ2dlclxuICogdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgIC8vIGlmIGEgc3RhdGUgaXMgZGVmaW5lZCB0aGVuIGl0cyBzdHlsZXMgd2lsbCBiZSBwZXJzaXN0ZWQgd2hlbiB0aGVcbiAqICAgLy8gYW5pbWF0aW9uIGhhcyBmdWxseSBjb21wbGV0ZWQgaXRzZWxmXG4gKiAgIHN0YXRlKFwib25cIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZWVuXCIgfSkpLFxuICogICBzdGF0ZShcIm9mZlwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JleVwiIH0pKSxcbiAqXG4gKiAgIC8vIGEgdHJhbnNpdGlvbiBhbmltYXRpb24gdGhhdCB3aWxsIGJlIGtpY2tlZCBvZmYgd2hlbiB0aGUgc3RhdGUgdmFsdWVcbiAqICAgLy8gYm91bmQgdG8gXCJteUFuaW1hdGlvblRyaWdnZXJcIiBjaGFuZ2VzIGZyb20gXCJvblwiIHRvIFwib2ZmXCJcbiAqICAgdHJhbnNpdGlvbihcIm9uID0+IG9mZlwiLCBhbmltYXRlKDUwMCkpLFxuICpcbiAqICAgLy8gaXQgaXMgYWxzbyBwb3NzaWJsZSB0byBkbyBydW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZvciBib3RoIGRpcmVjdGlvbnNcbiAqICAgdHJhbnNpdGlvbihcIm9uIDw9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKSxcbiAqXG4gKiAgIC8vIG9yIHRvIGRlZmluZSBtdWx0aXBsZSBzdGF0ZXMgcGFpcnMgc2VwYXJhdGVkIGJ5IGNvbW1hc1xuICogICB0cmFuc2l0aW9uKFwib24gPT4gb2ZmLCBvZmYgPT4gdm9pZFwiLCBhbmltYXRlKDUwMCkpLFxuICpcbiAqICAgLy8gdGhpcyBpcyBhIGNhdGNoLWFsbCBzdGF0ZSBjaGFuZ2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBpbnNlcnRlZCBpbnRvXG4gKiAgIC8vIHRoZSBwYWdlIGFuZCB0aGUgZGVzdGluYXRpb24gc3RhdGUgaXMgdW5rbm93blxuICogICB0cmFuc2l0aW9uKFwidm9pZCA9PiAqXCIsIFtcbiAqICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgYW5pbWF0ZSg1MDApXG4gKiAgIF0pLFxuICpcbiAqICAgLy8gdGhpcyB3aWxsIGNhcHR1cmUgYSBzdGF0ZSBjaGFuZ2UgYmV0d2VlbiBhbnkgc3RhdGVzXG4gKiAgIHRyYW5zaXRpb24oXCIqID0+ICpcIiwgYW5pbWF0ZShcIjFzIDBzXCIpKSxcbiAqXG4gKiAgIC8vIHlvdSBjYW4gYWxzbyBnbyBmdWxsIG91dCBhbmQgaW5jbHVkZSBhIGZ1bmN0aW9uXG4gKiAgIHRyYW5zaXRpb24oKGZyb21TdGF0ZSwgdG9TdGF0ZSkgPT4ge1xuICogICAgIC8vIHdoZW4gYHRydWVgIHRoZW4gaXQgd2lsbCBhbGxvdyB0aGUgYW5pbWF0aW9uIGJlbG93IHRvIGJlIGludm9rZWRcbiAqICAgICByZXR1cm4gZnJvbVN0YXRlID09IFwib2ZmXCIgJiYgdG9TdGF0ZSA9PSBcIm9uXCI7XG4gKiAgIH0sIGFuaW1hdGUoXCIxcyAwc1wiKSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IHdpbGwgbWFrZSB1c2Ugb2YgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIGFuaW1hdGlvblxuICogdHJpZ2dlciBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiB7QGEgdGhlLWZpbmFsLWFuaW1hdGUtY2FsbH1cbiAqICoqVGhlIGZpbmFsIGBhbmltYXRlYCBjYWxsKipcbiAqXG4gKiBJZiB0aGUgZmluYWwgc3RlcCB3aXRoaW4gdGhlIHRyYW5zaXRpb24gc3RlcHMgaXMgYSBjYWxsIHRvIGBhbmltYXRlKClgIHRoYXQgKipvbmx5KiogdXNlcyBhXG4gKiB0aW1pbmcgdmFsdWUgd2l0aCAqKm5vIHN0eWxlIGRhdGEqKiB0aGVuIGl0IHdpbGwgYmUgYXV0b21hdGljYWxseSB1c2VkIGFzIHRoZSBmaW5hbCBhbmltYXRpb24gYXJjXG4gKiBmb3IgdGhlIGVsZW1lbnQgdG8gYW5pbWF0ZSBpdHNlbGYgdG8gdGhlIGZpbmFsIHN0YXRlLiBUaGlzIGludm9sdmVzIGFuIGF1dG9tYXRpYyBtaXggb2ZcbiAqIGFkZGluZy9yZW1vdmluZyBDU1Mgc3R5bGVzIHNvIHRoYXQgdGhlIGVsZW1lbnQgd2lsbCBiZSBpbiB0aGUgZXhhY3Qgc3RhdGUgaXQgc2hvdWxkIGJlIGZvciB0aGVcbiAqIGFwcGxpZWQgc3RhdGUgdG8gYmUgcHJlc2VudGVkIGNvcnJlY3RseS5cbiAqXG4gKiBgYGBcbiAqIC8vIHN0YXJ0IG9mZiBieSBoaWRpbmcgdGhlIGVsZW1lbnQsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBhbmltYXRlcyBwcm9wZXJseSB0byB3aGF0ZXZlciBzdGF0ZVxuICogLy8gaXMgY3VycmVudGx5IGFjdGl2ZSBmb3IgXCJteUFuaW1hdGlvblRyaWdnZXJcIlxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDApXG4gKiBdKVxuICogYGBgXG4gKlxuICogKipVc2luZyA6ZW50ZXIgYW5kIDpsZWF2ZSoqXG4gKlxuICogR2l2ZW4gdGhhdCBlbnRlciAoaW5zZXJ0aW9uKSBhbmQgbGVhdmUgKHJlbW92YWwpIGFuaW1hdGlvbnMgYXJlIHNvIGNvbW1vbiwgdGhlIGB0cmFuc2l0aW9uYFxuICogZnVuY3Rpb24gYWNjZXB0cyBib3RoIGA6ZW50ZXJgIGFuZCBgOmxlYXZlYCB2YWx1ZXMgd2hpY2ggYXJlIGFsaWFzZXMgZm9yIHRoZSBgdm9pZCA9PiAqYCBhbmQgYCpcbiAqID0+IHZvaWRgIHN0YXRlIGNoYW5nZXMuXG4gKlxuICogYGBgXG4gKiB0cmFuc2l0aW9uKFwiOmVudGVyXCIsIFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogXSksXG4gKiB0cmFuc2l0aW9uKFwiOmxlYXZlXCIsIFtcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiAqKkJvb2xlYW4gdmFsdWVzKipcbiAqXG4gKiBpZiBhIHRyaWdnZXIgYmluZGluZyB2YWx1ZSBpcyBhIGJvb2xlYW4gdmFsdWUgdGhlbiBpdCBjYW4gYmUgbWF0Y2hlZCB1c2luZyBhIHRyYW5zaXRpb25cbiAqIGV4cHJlc3Npb24gdGhhdCBjb21wYXJlcyBgdHJ1ZWAgYW5kIGBmYWxzZWAgb3IgYDFgIGFuZCBgMGAuXG4gKlxuICogYGBgXG4gKiAvLyBpbiB0aGUgdGVtcGxhdGVcbiAqIDxkaXYgW0BvcGVuQ2xvc2VdPVwib3BlbiA/IHRydWUgOiBmYWxzZVwiPi4uLjwvZGl2PlxuICpcbiAqIC8vIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAqIHRyaWdnZXIoJ29wZW5DbG9zZScsIFtcbiAqICAgc3RhdGUoJ3RydWUnLCBzdHlsZSh7IGhlaWdodDogJyonIH0pKSxcbiAqICAgc3RhdGUoJ2ZhbHNlJywgc3R5bGUoeyBoZWlnaHQ6ICcwcHgnIH0pKSxcbiAqICAgdHJhbnNpdGlvbignZmFsc2UgPD0+IHRydWUnLCBhbmltYXRlKDUwMCkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogKipVc2luZyA6aW5jcmVtZW50IGFuZCA6ZGVjcmVtZW50KipcbiAqXG4gKiBJbiBhZGRpdGlvbiB0byB0aGUgOmVudGVyIGFuZCA6bGVhdmUgdHJhbnNpdGlvbiBhbGlhc2VzLCB0aGUgOmluY3JlbWVudCBhbmQgOmRlY3JlbWVudCBhbGlhc2VzXG4gKiBjYW4gYmUgdXNlZCB0byBraWNrIG9mZiBhIHRyYW5zaXRpb24gd2hlbiBhIG51bWVyaWMgdmFsdWUgaGFzIGluY3JlYXNlZCBvciBkZWNyZWFzZWQgaW4gdmFsdWUuXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge2dyb3VwLCBhbmltYXRlLCBxdWVyeSwgdHJhbnNpdGlvbiwgc3R5bGUsIHRyaWdnZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2Jhbm5lci1jYXJvdXNlbC1jb21wb25lbnQnLFxuICogICBzdHlsZXM6IFtgXG4gKiAgICAgLmJhbm5lci1jb250YWluZXIge1xuICogICAgICAgIHBvc2l0aW9uOnJlbGF0aXZlO1xuICogICAgICAgIGhlaWdodDo1MDBweDtcbiAqICAgICAgICBvdmVyZmxvdzpoaWRkZW47XG4gKiAgICAgIH1cbiAqICAgICAuYmFubmVyLWNvbnRhaW5lciA+IC5iYW5uZXIge1xuICogICAgICAgIHBvc2l0aW9uOmFic29sdXRlO1xuICogICAgICAgIGxlZnQ6MDtcbiAqICAgICAgICB0b3A6MDtcbiAqICAgICAgICBmb250LXNpemU6MjAwcHg7XG4gKiAgICAgICAgbGluZS1oZWlnaHQ6NTAwcHg7XG4gKiAgICAgICAgZm9udC13ZWlnaHQ6Ym9sZDtcbiAqICAgICAgICB0ZXh0LWFsaWduOmNlbnRlcjtcbiAqICAgICAgICB3aWR0aDoxMDAlO1xuICogICAgICB9XG4gKiAgIGBdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByZXZpb3VzKClcIj5QcmV2aW91czwvYnV0dG9uPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cIm5leHQoKVwiPk5leHQ8L2J1dHRvbj5cbiAqICAgICA8aHI+XG4gKiAgICAgPGRpdiBbQGJhbm5lckFuaW1hdGlvbl09XCJzZWxlY3RlZEluZGV4XCIgY2xhc3M9XCJiYW5uZXItY29udGFpbmVyXCI+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiYmFubmVyXCIgKm5nRm9yPVwibGV0IGJhbm5lciBvZiBiYW5uZXJzXCI+IHt7IGJhbm5lciB9fSA8L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ2Jhbm5lckFuaW1hdGlvbicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24oXCI6aW5jcmVtZW50XCIsIGdyb3VwKFtcbiAqICAgICAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICAgICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgICAgICAgXSksXG4gKiAgICAgICAgIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKHsgbGVmdDogJy0xMDAlJyB9KSlcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pKSxcbiAqICAgICAgIHRyYW5zaXRpb24oXCI6ZGVjcmVtZW50XCIsIGdyb3VwKFtcbiAqICAgICAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSksXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKCcqJykpXG4gKiAgICAgICAgIF0pLFxuICogICAgICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSlcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBCYW5uZXJDYXJvdXNlbENvbXBvbmVudCB7XG4gKiAgIGFsbEJhbm5lcnM6IHN0cmluZ1tdID0gWycxJywgJzInLCAnMycsICc0J107XG4gKiAgIHNlbGVjdGVkSW5kZXg6IG51bWJlciA9IDA7XG4gKlxuICogICBnZXQgYmFubmVycygpIHtcbiAqICAgICAgcmV0dXJuIFt0aGlzLmFsbEJhbm5lcnNbdGhpcy5zZWxlY3RlZEluZGV4XV07XG4gKiAgIH1cbiAqXG4gKiAgIHByZXZpb3VzKCkge1xuICogICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWF4KHRoaXMuc2VsZWN0ZWRJbmRleCAtIDEsIDApO1xuICogICB9XG4gKlxuICogICBuZXh0KCkge1xuICogICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWluKHRoaXMuc2VsZWN0ZWRJbmRleCArIDEsIHRoaXMuYWxsQmFubmVycy5sZW5ndGggLSAxKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uKFxuICAgIHN0YXRlQ2hhbmdlRXhwcjogc3RyaW5nIHwgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbiksXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uLCBleHByOiBzdGF0ZUNoYW5nZUV4cHIsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBhbmltYXRpb25gIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS5cbiAqXG4gKiBgdmFyIG15QW5pbWF0aW9uID0gYW5pbWF0aW9uKC4uLilgIGlzIGRlc2lnbmVkIHRvIHByb2R1Y2UgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBjYW4gYmUgbGF0ZXJcbiAqIGludm9rZWQgaW4gYW5vdGhlciBhbmltYXRpb24gb3Igc2VxdWVuY2UuIFJldXNhYmxlIGFuaW1hdGlvbnMgYXJlIGRlc2lnbmVkIHRvIG1ha2UgdXNlIG9mXG4gKiBhbmltYXRpb24gcGFyYW1ldGVycyBhbmQgdGhlIHByb2R1Y2VkIGFuaW1hdGlvbiBjYW4gYmUgdXNlZCB2aWEgdGhlIGB1c2VBbmltYXRpb25gIG1ldGhvZC5cbiAqXG4gKiBgYGBcbiAqIHZhciBmYWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAne3sgc3RhcnQgfX0nIH0pLFxuICogICBhbmltYXRlKCd7eyB0aW1lIH19JyxcbiAqICAgICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBlbmQgfX0nfSkpXG4gKiBdLCB7IHBhcmFtczogeyB0aW1lOiAnMTAwMG1zJywgc3RhcnQ6IDAsIGVuZDogMSB9fSk7XG4gKiBgYGBcbiAqXG4gKiBJZiBwYXJhbWV0ZXJzIGFyZSBhdHRhY2hlZCB0byBhbiBhbmltYXRpb24gdGhlbiB0aGV5IGFjdCBhcyAqKmRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlcyoqLiBXaGVuIGFuXG4gKiBhbmltYXRpb24gaXMgaW52b2tlZCB2aWEgYHVzZUFuaW1hdGlvbmAgdGhlbiBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBhbGxvd2VkIHRvIGJlIHBhc3NlZCBpblxuICogZGlyZWN0bHkuIElmIGFueSBvZiB0aGUgcGFzc2VkIGluIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgdGhlbiB0aGUgZGVmYXVsdCB2YWx1ZXMgd2lsbCBiZVxuICogdXNlZC5cbiAqXG4gKiBgYGBcbiAqIHVzZUFuaW1hdGlvbihmYWRlQW5pbWF0aW9uLCB7XG4gKiAgIHBhcmFtczoge1xuICogICAgIHRpbWU6ICcycycsXG4gKiAgICAgc3RhcnQ6IDEsXG4gKiAgICAgZW5kOiAwXG4gKiAgIH1cbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBJZiBvbmUgb3IgbW9yZSBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBtaXNzaW5nIGJlZm9yZSBhbmltYXRlZCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2UsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBhbmltYXRlQ2hpbGRgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSXQgd29ya3MgYnkgYWxsb3dpbmcgYSBxdWVyaWVkIGVsZW1lbnQgdG8gZXhlY3V0ZSBpdHMgb3duXG4gKiBhbmltYXRpb24gd2l0aGluIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogRWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgaW4gYW5ndWxhciwgdGhlIHBhcmVudCBhbmltYXRpb25cbiAqIHdpbGwgYWx3YXlzIGdldCBwcmlvcml0eSBhbmQgYW55IGNoaWxkIGFuaW1hdGlvbnMgd2lsbCBiZSBibG9ja2VkLiBJbiBvcmRlclxuICogZm9yIGEgY2hpbGQgYW5pbWF0aW9uIHRvIHJ1biwgdGhlIHBhcmVudCBhbmltYXRpb24gbXVzdCBxdWVyeSBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICogY29udGFpbmluZyBjaGlsZCBhbmltYXRpb25zIGFuZCB0aGVuIGFsbG93IHRoZSBhbmltYXRpb25zIHRvIHJ1biB1c2luZyBgYW5pbWF0ZUNoaWxkYC5cbiAqXG4gKiBUaGUgZXhhbXBsZSBIVE1MIGNvZGUgYmVsb3cgc2hvd3MgYm90aCBwYXJlbnQgYW5kIGNoaWxkIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbmltYXRpb25cbiAqIHRyaWdnZXJzIHRoYXQgd2lsbCBleGVjdXRlIGF0IHRoZSBzYW1lIHRpbWUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBwYXJlbnQtY2hpbGQuY29tcG9uZW50Lmh0bWwgLS0+XG4gKiA8YnV0dG9uIChjbGljayk9XCJleHAgPSEgZXhwXCI+VG9nZ2xlPC9idXR0b24+XG4gKiA8aHI+XG4gKlxuICogPGRpdiBbQHBhcmVudEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgPGhlYWRlcj5IZWxsbzwvaGVhZGVyPlxuICogICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICBvbmVcbiAqICAgPC9kaXY+XG4gKiAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIHR3b1xuICogICA8L2Rpdj5cbiAqICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgdGhyZWVcbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIE5vdyB3aGVuIHRoZSBgZXhwYCB2YWx1ZSBjaGFuZ2VzIHRvIHRydWUsIG9ubHkgdGhlIGBwYXJlbnRBbmltYXRpb25gIGFuaW1hdGlvbiB3aWxsIGFuaW1hdGVcbiAqIGJlY2F1c2UgaXQgaGFzIHByaW9yaXR5LiBIb3dldmVyLCB1c2luZyBgcXVlcnlgIGFuZCBgYW5pbWF0ZUNoaWxkYCBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb25zXG4gKiBjYW4gYWxzbyBmaXJlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBwYXJlbnQtY2hpbGQuY29tcG9uZW50LnRzXG4gKiBpbXBvcnQge3RyaWdnZXIsIHRyYW5zaXRpb24sIGFuaW1hdGUsIHN0eWxlLCBxdWVyeSwgYW5pbWF0ZUNoaWxkfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudC1jaGlsZC1jb21wb25lbnQnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcigncGFyZW50QW5pbWF0aW9uJywgW1xuICogICAgICAgdHJhbnNpdGlvbignZmFsc2UgPT4gdHJ1ZScsIFtcbiAqICAgICAgICAgcXVlcnkoJ2hlYWRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICAgICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgICAgICAgXSksXG4gKiAgICAgICAgIHF1ZXJ5KCdAY2hpbGRBbmltYXRpb24nLCBbXG4gKiAgICAgICAgICAgYW5pbWF0ZUNoaWxkKClcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgdHJpZ2dlcignY2hpbGRBbmltYXRpb24nLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKCdmYWxzZSA9PiB0cnVlJywgW1xuICogICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBQYXJlbnRDaGlsZENtcCB7XG4gKiAgIGV4cDogYm9vbGVhbiA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhlIGFuaW1hdGlvbiBjb2RlIGFib3ZlLCB3aGVuIHRoZSBgcGFyZW50QW5pbWF0aW9uYCB0cmFuc2l0aW9uIGtpY2tzIG9mZiBpdCBmaXJzdCBxdWVyaWVzIHRvXG4gKiBmaW5kIHRoZSBoZWFkZXIgZWxlbWVudCBhbmQgZmFkZXMgaXQgaW4uIEl0IHRoZW4gZmluZHMgZWFjaCBvZiB0aGUgc3ViIGVsZW1lbnRzIHRoYXQgY29udGFpbiB0aGVcbiAqIGBAY2hpbGRBbmltYXRpb25gIHRyaWdnZXIgYW5kIHRoZW4gYWxsb3dzIGZvciB0aGVpciBhbmltYXRpb25zIHRvIGZpcmUuXG4gKlxuICogVGhpcyBleGFtcGxlIGNhbiBiZSBmdXJ0aGVyIGV4dGVuZGVkIGJ5IHVzaW5nIHN0YWdnZXI6XG4gKlxuICogYGBgdHNcbiAqIHF1ZXJ5KCdAY2hpbGRBbmltYXRpb24nLCBzdGFnZ2VyKDEwMCwgW1xuICogICBhbmltYXRlQ2hpbGQoKVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBOb3cgZWFjaCBvZiB0aGUgc3ViIGFuaW1hdGlvbnMgc3RhcnQgb2ZmIHdpdGggcmVzcGVjdCB0byB0aGUgYDEwMG1zYCBzdGFnZ2VyaW5nIHN0ZXAuXG4gKlxuICogKipUaGUgZmlyc3QgZnJhbWUgb2YgY2hpbGQgYW5pbWF0aW9ucyoqXG4gKlxuICogV2hlbiBzdWIgYW5pbWF0aW9ucyBhcmUgZXhlY3V0ZWQgdXNpbmcgYGFuaW1hdGVDaGlsZGAgdGhlIGFuaW1hdGlvbiBlbmdpbmUgd2lsbCBhbHdheXMgYXBwbHkgdGhlXG4gKiBmaXJzdCBmcmFtZSBvZiBldmVyeSBzdWIgYW5pbWF0aW9uIGltbWVkaWF0ZWx5IGF0IHRoZSBzdGFydCBvZiB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLiBUaGlzIHdheVxuICogdGhlIHBhcmVudCBhbmltYXRpb24gZG9lcyBub3QgbmVlZCB0byBzZXQgYW55IGluaXRpYWwgc3R5bGluZyBkYXRhIG9uIHRoZSBzdWIgZWxlbWVudHMgYmVmb3JlIHRoZVxuICogc3ViIGFuaW1hdGlvbnMga2ljayBvZmYuXG4gKlxuICogSW4gdGhlIGV4YW1wbGUgYWJvdmUgdGhlIGZpcnN0IGZyYW1lIG9mIHRoZSBgY2hpbGRBbmltYXRpb25gJ3MgYGZhbHNlID0+IHRydWVgIHRyYW5zaXRpb25cbiAqIGNvbnNpc3RzIG9mIGEgc3R5bGUgb2YgYG9wYWNpdHk6IDBgLiBUaGlzIGlzIGFwcGxpZWQgaW1tZWRpYXRlbHkgd2hlbiB0aGUgYHBhcmVudEFuaW1hdGlvbmBcbiAqIGFuaW1hdGlvbiB0cmFuc2l0aW9uIHNlcXVlbmNlIHN0YXJ0cy4gT25seSB0aGVuIHdoZW4gdGhlIGBAY2hpbGRBbmltYXRpb25gIGlzIHF1ZXJpZWQgYW5kIGNhbGxlZFxuICogd2l0aCBgYW5pbWF0ZUNoaWxkYCB3aWxsIGl0IHRoZW4gYW5pbWF0ZSB0byBpdHMgZGVzdGluYXRpb24gb2YgYG9wYWNpdHk6IDFgLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZlYXR1cmUgZGVzaWduZWQgdG8gYmUgdXNlZCBhbG9uZ3NpZGUge0BsaW5rIHF1ZXJ5IHF1ZXJ5KCl9IGFuZCBpdCB3aWxsIG9ubHkgd29ya1xuICogd2l0aCBhbmltYXRpb25zIHRoYXQgYXJlIGFzc2lnbmVkIHVzaW5nIHRoZSBBbmd1bGFyIGFuaW1hdGlvbiBEU0wgKHRoaXMgbWVhbnMgdGhhdCBDU1Mga2V5ZnJhbWVzXG4gKiBhbmQgdHJhbnNpdGlvbnMgYXJlIG5vdCBoYW5kbGVkIGJ5IHRoaXMgQVBJKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDaGlsZChvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgdXNlQW5pbWF0aW9uYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIEl0IGlzIHVzZWQgdG8ga2ljayBvZmYgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBpcyBjcmVhdGVkIHVzaW5nIHtAbGlua1xuICogYW5pbWF0aW9uIGFuaW1hdGlvbigpfS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuaW1hdGlvbihcbiAgICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVSZWYsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHF1ZXJ5YCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuXG4gKlxuICogcXVlcnkoKSBpcyB1c2VkIHRvIGZpbmQgb25lIG9yIG1vcmUgaW5uZXIgZWxlbWVudHMgd2l0aGluIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBpc1xuICogYmVpbmcgYW5pbWF0ZWQgd2l0aGluIHRoZSBzZXF1ZW5jZS4gVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiBzdGVwcyBhcmUgYXBwbGllZFxuICogdG8gdGhlIHF1ZXJpZWQgZWxlbWVudCAoYnkgZGVmYXVsdCwgYW4gYXJyYXkgaXMgcHJvdmlkZWQsIHRoZW4gdGhpcyB3aWxsIGJlXG4gKiB0cmVhdGVkIGFzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZSkuXG4gKlxuICogKipVc2FnZSoqXG4gKlxuICogcXVlcnkoKSBpcyBkZXNpZ25lZCB0byBjb2xsZWN0IG11bHRpcGxlIGVsZW1lbnRzIGFuZCB3b3JrcyBpbnRlcm5hbGx5IGJ5IHVzaW5nXG4gKiBgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsYC4gQW4gYWRkaXRpb25hbCBvcHRpb25zIG9iamVjdCBjYW4gYmUgcHJvdmlkZWQgd2hpY2hcbiAqIGNhbiBiZSB1c2VkIHRvIGxpbWl0IHRoZSB0b3RhbCBhbW91bnQgb2YgaXRlbXMgdG8gYmUgY29sbGVjdGVkLlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnZGl2JywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBsaW1pdDogMSB9KVxuICogYGBgXG4gKlxuICogcXVlcnkoKSwgYnkgZGVmYXVsdCwgd2lsbCB0aHJvdyBhbiBlcnJvciB3aGVuIHplcm8gaXRlbXMgYXJlIGZvdW5kLiBJZiBhIHF1ZXJ5XG4gKiBoYXMgdGhlIGBvcHRpb25hbGAgZmxhZyBzZXQgdG8gdHJ1ZSB0aGVuIHRoaXMgZXJyb3Igd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnLnNvbWUtZWxlbWVudC10aGF0LW1heS1ub3QtYmUtdGhlcmUnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IG9wdGlvbmFsOiB0cnVlIH0pXG4gKiBgYGBcbiAqXG4gKiAqKlNwZWNpYWwgU2VsZWN0b3IgVmFsdWVzKipcbiAqXG4gKlxuICogVGhlIHNlbGVjdG9yIHZhbHVlIHdpdGhpbiBhIHF1ZXJ5IGNhbiBjb2xsZWN0IGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbmd1bGFyLXNwZWNpZmljXG4gKiBjaGFyYWN0ZXJpc3RpY3NcbiAqIHVzaW5nIHNwZWNpYWwgcHNldWRvLXNlbGVjdG9ycyB0b2tlbnMuXG4gKlxuICogVGhlc2UgaW5jbHVkZTpcbiAqXG4gKiAgLSBRdWVyeWluZyBmb3IgbmV3bHkgaW5zZXJ0ZWQvcmVtb3ZlZCBlbGVtZW50cyB1c2luZyBgcXVlcnkoXCI6ZW50ZXJcIilgL2BxdWVyeShcIjpsZWF2ZVwiKWBcbiAqICAtIFF1ZXJ5aW5nIGFsbCBjdXJyZW50bHkgYW5pbWF0aW5nIGVsZW1lbnRzIHVzaW5nIGBxdWVyeShcIjphbmltYXRpbmdcIilgXG4gKiAgLSBRdWVyeWluZyBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIgdXNpbmcgYHF1ZXJ5KFwiQHRyaWdnZXJOYW1lXCIpYFxuICogIC0gUXVlcnlpbmcgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlcnMgdXNpbmcgYHF1ZXJ5KFwiQCpcIilgXG4gKiAgLSBJbmNsdWRpbmcgdGhlIGN1cnJlbnQgZWxlbWVudCBpbnRvIHRoZSBhbmltYXRpb24gc2VxdWVuY2UgdXNpbmcgYHF1ZXJ5KFwiOnNlbGZcIilgXG4gKlxuICpcbiAqICBFYWNoIG9mIHRoZXNlIHBzZXVkby1zZWxlY3RvciB0b2tlbnMgY2FuIGJlIG1lcmdlZCB0b2dldGhlciBpbnRvIGEgY29tYmluZWQgcXVlcnkgc2VsZWN0b3JcbiAqIHN0cmluZzpcbiAqXG4gKiAgYGBgXG4gKiAgcXVlcnkoJzpzZWxmLCAucmVjb3JkOmVudGVyLCAucmVjb3JkOmxlYXZlLCBAc3ViVHJpZ2dlcicsIFsuLi5dKVxuICogIGBgYFxuICpcbiAqICoqRGVtbyoqXG4gKlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaW5uZXInLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0BxdWVyeUFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIDxoMT5UaXRsZTwvaDE+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICogICAgICAgICBCbGFoIGJsYWggYmxhaFxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgIHRyaWdnZXIoJ3F1ZXJ5QW5pbWF0aW9uJywgW1xuICogICAgICB0cmFuc2l0aW9uKCcqID0+IGdvQW5pbWF0ZScsIFtcbiAqICAgICAgICAvLyBoaWRlIHRoZSBpbm5lciBlbGVtZW50c1xuICogICAgICAgIHF1ZXJ5KCdoMScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50Jywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqXG4gKiAgICAgICAgLy8gYW5pbWF0ZSB0aGUgaW5uZXIgZWxlbWVudHMgaW4sIG9uZSBieSBvbmVcbiAqICAgICAgICBxdWVyeSgnaDEnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50JywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHN0YWdnZXJgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgYW4gYW5pbWF0aW9uIHtAbGluayBxdWVyeSBxdWVyeSgpfVxuICogYW5kIHdvcmtzIGJ5IGlzc3VpbmcgYSB0aW1pbmcgZ2FwIGJldHdlZW4gYWZ0ZXIgZWFjaCBxdWVyaWVkIGl0ZW0gaXMgYW5pbWF0ZWQuXG4gKlxuICogKipVc2FnZSoqXG4gKlxuICogSW4gdGhlIGV4YW1wbGUgYmVsb3cgdGhlcmUgaXMgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIGEgbGlzdCBvZiBpdGVtcyBzdGFtcGVkIG91dFxuICogYnkgYW4gbmdGb3IuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFRoZSBjb21wb25lbnQgY29kZSBmb3IgdGhpcyBsb29rcyBhcyBzdWNoOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge3RyaWdnZXIsIHRyYW5zaXRpb24sIHN0eWxlLCBhbmltYXRlLCBxdWVyeSwgc3RhZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgdGVtcGxhdGVVcmw6ICdsaXN0LmNvbXBvbmVudC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgICAgICAgLy8uLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQW5kIG5vdyBmb3IgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGNvZGU6XG4gKlxuICogYGBgdHNcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKlxuICogTm93IGVhY2ggdGltZSB0aGUgaXRlbXMgYXJlIGFkZGVkL3JlbW92ZWQgdGhlbiBlaXRoZXIgdGhlIG9wYWNpdHlcbiAqIGZhZGUtaW4gYW5pbWF0aW9uIHdpbGwgcnVuIG9yIGVhY2ggcmVtb3ZlZCBpdGVtIHdpbGwgYmUgZmFkZWQgb3V0LlxuICogV2hlbiBlaXRoZXIgb2YgdGhlc2UgYW5pbWF0aW9ucyBvY2N1ciB0aGVuIGEgc3RhZ2dlciBlZmZlY3Qgd2lsbCBiZVxuICogYXBwbGllZCBhZnRlciBlYWNoIGl0ZW0ncyBhbmltYXRpb24gaXMgc3RhcnRlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdnZXIoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlciwgdGltaW5ncywgYW5pbWF0aW9ufTtcbn1cbiJdfQ==