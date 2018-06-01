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
 the
 * trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * Animation trigger bindings strigify values and then match the previous and current values against
 * any linked transitions. If a boolean value is provided into the trigger binding then it will both
 * be represented as `1` or `true` and `0` or `false` for a true and false boolean values
 * respectively.
 *
 * ### Usage
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
 trigger by binding to an element within its template code.
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
 * ```
 * // this method will be run each time the `myAnimationTrigger`
 * // trigger value changes...
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
 * The inline method will be run each time the trigger
 * value changes
 *
 * ## Disable Animations
 * A special animation control binding called `@.disabled` can be placed on an element which will
 then disable animations for any inner animation triggers situated within the element as well as
 any animations on the element itself.
 *
 * When true, the `@.disabled` binding will prevent all animations from rendering. The example
 below shows how to use this feature:
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
 (when true).
 *
 * Note that `@.disabled` will only disable all animations (this means any animations running on
 * the same element will also be disabled).
 *
 * ### Disabling Animations Application-wide
 * When an area of the template is set to have animations disabled, **all** inner components will
 also have their animations disabled as well. This means that all animations for an angular
 application can be disabled by placing a host binding set on `@.disabled` on the topmost Angular
 component.
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
 * ### What about animations that us `query()` and `animateChild()`?
 * Despite inner animations being disabled, a parent animation can {@link query query} for inner
 elements located in disabled areas of the template and still animate them as it sees fit. This is
 also the case for when a sub animation is queried by a parent and then later animated using {@link
 animateChild animateChild}.

 * ### Detecting when an animation is disabled
 * If a region of the DOM (or the entire application) has its animations disabled, then animation
 * trigger callbacks will still fire just as normal (only for zero seconds).
 *
 * When a trigger callback fires it will provide an instance of an {@link AnimationEvent}. If
 animations
 * are disabled then the `.disabled` flag on the event will be true.
 *
 * @experimental Animation support is experimental.
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name: name, definitions: definitions, options: {} };
}
/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {@link sequence an animation sequence}, {@link group group}, or {@link
 * transition transition}.
 *
 * ### Usage
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
 * ### Usage
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
 * ### Usage
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
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {@link state animation states}, within an {@link sequence animation sequence}, or as styling data
 * for both {@link animate animate} and {@link keyframes keyframes}.
 *
 * ### Usage
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
 * #### Auto-styles (using `*`)
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
 * #### The `void` state
 *
 * The `void` state value is a reserved word that angular uses to determine when the element is not
 * apart of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
 * associated element is void).
 *
 * #### The `*` (default) state
 *
 * The `*` state (when styled) is a fallback state that will be used if the state that is being
 * animated is not declared within the trigger.
 *
 * ### Usage
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
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `keyframes` specifies a collection of {@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * ### Usage
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
 * ### Usage
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
 * #### The final `animate` call
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
 * ### Using :enter and :leave
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
 * ### Boolean values
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
 * ### Using :increment and :decrement
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
 * ## The first frame of child animations
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
 * ### Usage
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
 * ### Special Selector Values
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
 * ### Demo
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
 * ### Usage
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTRFQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFzSzlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Skc7QUFDSCxNQUFNLGtCQUFrQixJQUFZLEVBQUUsV0FBZ0M7SUFDcEUsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLE1BQUEsRUFBRSxXQUFXLGFBQUEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDL0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRDRztBQUNILE1BQU0sa0JBQ0YsT0FBd0IsRUFBRSxNQUNYO0lBRFcsdUJBQUEsRUFBQSxhQUNYO0lBQ2pCLE1BQU0sQ0FBQyxFQUFDLElBQUksaUJBQStCLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILE1BQU0sZ0JBQ0YsS0FBMEIsRUFBRSxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3JFLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxLQUFLLE9BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNHO0FBQ0gsTUFBTSxtQkFBbUIsS0FBMEIsRUFBRSxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBRTFGLE1BQU0sQ0FBQyxFQUFDLElBQUksa0JBQWdDLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUNHO0FBQ0gsTUFBTSxnQkFDRixNQUMyQztJQUM3QyxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStDRztBQUNILE1BQU0sZ0JBQ0YsSUFBWSxFQUFFLE1BQThCLEVBQzVDLE9BQXlDO0lBQzNDLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxJQUFJLE1BQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Q0c7QUFDSCxNQUFNLG9CQUFvQixLQUErQjtJQUN2RCxNQUFNLENBQUMsRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssT0FBQSxFQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzTUc7QUFDSCxNQUFNLHFCQUNGLGVBQ3NFLEVBQ3RFLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsTUFBTSxDQUFDLEVBQUMsSUFBSSxvQkFBa0MsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxNQUFNLG9CQUNGLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsTUFBTSxDQUFDLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnR0c7QUFDSCxNQUFNLHVCQUF1QixPQUEwQztJQUExQyx3QkFBQSxFQUFBLGNBQTBDO0lBRXJFLE1BQU0sQ0FBQyxFQUFDLElBQUksc0JBQW9DLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSx1QkFDRixTQUFxQyxFQUNyQyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUkscUJBQWtDLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyRkc7QUFDSCxNQUFNLGdCQUNGLFFBQWdCLEVBQUUsU0FBa0QsRUFDcEUsT0FBNEM7SUFBNUMsd0JBQUEsRUFBQSxjQUE0QztJQUM5QyxNQUFNLENBQUMsRUFBQyxJQUFJLGdCQUE2QixFQUFFLFFBQVEsVUFBQSxFQUFFLFNBQVMsV0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZFRztBQUNILE1BQU0sa0JBQ0YsT0FBd0IsRUFDeEIsU0FBa0Q7SUFDcEQsTUFBTSxDQUFDLEVBQUMsSUFBSSxrQkFBK0IsRUFBRSxPQUFPLFNBQUEsRUFBRSxTQUFTLFdBQUEsRUFBQyxDQUFDO0FBQ25FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIMm1U3R5bGVEYXRhIHsgW2tleTogc3RyaW5nXTogc3RyaW5nfG51bWJlcjsgfVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBjcmVhdGVkIGludGVybmFsbHlcbiAqIHdpdGhpbiB0aGUgQW5ndWxhciBhbmltYXRpb24gRFNMLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZGVjbGFyZSB0eXBlIEFuaW1hdGVUaW1pbmdzID0ge1xuICBkdXJhdGlvbjogbnVtYmVyLFxuICBkZWxheTogbnVtYmVyLFxuICBlYXNpbmc6IHN0cmluZyB8IG51bGxcbn07XG5cbi8qKlxuICogYEFuaW1hdGlvbk9wdGlvbnNgIHJlcHJlc2VudHMgb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byBtb3N0IGFuaW1hdGlvbiBEU0wgbWV0aG9kcy5cbiAqIFdoZW4gb3B0aW9ucyBhcmUgcHJvdmlkZWQsIHRoZSBkZWxheSB2YWx1ZSBvZiBhbiBhbmltYXRpb24gY2FuIGJlIGNoYW5nZWQgYW5kIGFuaW1hdGlvbiBpbnB1dFxuICogcGFyYW1ldGVycyBjYW4gYmUgcGFzc2VkIGluIHRvIGNoYW5nZSBzdHlsaW5nIGFuZCB0aW1pbmcgZGF0YSB3aGVuIGFuIGFuaW1hdGlvbiBpcyBzdGFydGVkLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgYW5pbWF0aW9uIERTTCBmdW5jdGlvbnMgYXJlIGFibGUgdG8gYWNjZXB0IGFuaW1hdGlvbiBvcHRpb24gZGF0YTpcbiAqXG4gKiAtIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb24oKX1cbiAqIC0ge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlKCl9XG4gKiAtIHtAbGluayBncm91cCBncm91cCgpfVxuICogLSB7QGxpbmsgcXVlcnkgcXVlcnkoKX1cbiAqIC0ge0BsaW5rIGFuaW1hdGlvbiBhbmltYXRpb24oKX1cbiAqIC0ge0BsaW5rIHVzZUFuaW1hdGlvbiB1c2VBbmltYXRpb24oKX1cbiAqIC0ge0BsaW5rIGFuaW1hdGVDaGlsZCBhbmltYXRlQ2hpbGQoKX1cbiAqXG4gKiBQcm9ncmFtbWF0aWMgYW5pbWF0aW9ucyBidWlsdCB1c2luZyB7QGxpbmsgQW5pbWF0aW9uQnVpbGRlciB0aGUgQW5pbWF0aW9uQnVpbGRlciBzZXJ2aWNlfSBhbHNvXG4gKiBtYWtlIHVzZSBvZiBBbmltYXRpb25PcHRpb25zLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIGRlbGF5PzogbnVtYmVyfHN0cmluZztcbiAgcGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9O1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBjcmVhdGVkIGludGVybmFsbHlcbiAqIHdpdGhpbiB0aGUgQW5ndWxhciBhbmltYXRpb24gRFNMIHdoZW4ge0BsaW5rIGFuaW1hdGVDaGlsZCBhbmltYXRlQ2hpbGQoKX0gaXMgdXNlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGVDaGlsZE9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHsgZHVyYXRpb24/OiBudW1iZXJ8c3RyaW5nOyB9XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBVc2FnZXMgb2YgdGhpcyBlbnVtIGFyZSBjcmVhdGVkXG4gKiBlYWNoIHRpbWUgYW4gYW5pbWF0aW9uIERTTCBmdW5jdGlvbiBpcyB1c2VkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBBbmltYXRpb25NZXRhZGF0YVR5cGUge1xuICBTdGF0ZSA9IDAsXG4gIFRyYW5zaXRpb24gPSAxLFxuICBTZXF1ZW5jZSA9IDIsXG4gIEdyb3VwID0gMyxcbiAgQW5pbWF0ZSA9IDQsXG4gIEtleWZyYW1lcyA9IDUsXG4gIFN0eWxlID0gNixcbiAgVHJpZ2dlciA9IDcsXG4gIFJlZmVyZW5jZSA9IDgsXG4gIEFuaW1hdGVDaGlsZCA9IDksXG4gIEFuaW1hdGVSZWYgPSAxMCxcbiAgUXVlcnkgPSAxMSxcbiAgU3RhZ2dlciA9IDEyXG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjb25zdCBBVVRPX1NUWUxFID0gJyonO1xuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbk1ldGFkYXRhIHsgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlOyB9XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHRyaWdnZXIgdHJpZ2dlciBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgZGVmaW5pdGlvbnM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IHtwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IGFueX19fG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHN0YXRlIHN0YXRlIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhO1xuICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9uIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgZXhwcjogc3RyaW5nfFxuICAgICAgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbik7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25RdWVyeU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBrZXlmcmFtZXMga2V5ZnJhbWVzIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW107XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHN0eWxlIHN0eWxlIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0eWxlczogJyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fEFycmF5PHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9fCcqJz47XG4gIG9mZnNldDogbnVtYmVyfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIGFuaW1hdGUgYW5pbWF0ZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXJ8QW5pbWF0ZVRpbWluZ3M7XG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YXxBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIGFuaW1hdGVDaGlsZCBhbmltYXRlQ2hpbGQgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgdXNlQW5pbWF0aW9uIHVzZUFuaW1hdGlvbiBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGE7XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgc2VxdWVuY2Ugc2VxdWVuY2UgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgZ3JvdXAgZ3JvdXAgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uR3JvdXBNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgcXVlcnkgcXVlcnkgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25RdWVyeU9wdGlvbnMgZXh0ZW5kcyBBbmltYXRpb25PcHRpb25zIHtcbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKipcbiAgICogVXNlZCB0byBsaW1pdCB0aGUgdG90YWwgYW1vdW50IG9mIHJlc3VsdHMgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHF1ZXJ5IGxpc3QuXG4gICAqXG4gICAqIElmIGEgbmVnYXRpdmUgdmFsdWUgaXMgcHJvdmlkZWQgdGhlbiB0aGUgcXVlcmllZCByZXN1bHRzIHdpbGwgYmUgbGltaXRlZCBmcm9tIHRoZVxuICAgKiBlbmQgb2YgdGhlIHF1ZXJ5IGxpc3QgdG93YXJkcyB0aGUgYmVnaW5uaW5nIChlLmcuIGlmIGBsaW1pdDogLTNgIGlzIHVzZWQgdGhlbiB0aGVcbiAgICogZmluYWwgMyAob3IgbGVzcykgcXVlcmllZCByZXN1bHRzIHdpbGwgYmUgdXNlZCBmb3IgdGhlIGFuaW1hdGlvbikuXG4gICAqL1xuICBsaW1pdD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgc3RhZ2dlciBzdGFnZ2VyIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHRpbWluZ3M6IHN0cmluZ3xudW1iZXI7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBgdHJpZ2dlcmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZVxuICoge0BsaW5rIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXJcbiAqIHVuZGVyc3RhbmRpbmcgb2YgaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgdHJpZ2dlcmAgQ3JlYXRlcyBhbiBhbmltYXRpb24gdHJpZ2dlciB3aGljaCB3aWxsIGEgbGlzdCBvZiB7QGxpbmsgc3RhdGUgc3RhdGV9IGFuZFxuICoge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0gZW50cmllcyB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIHdoZW4gdGhlIGV4cHJlc3Npb25cbiAqIGJvdW5kIHRvIHRoZSB0cmlnZ2VyIGNoYW5nZXMuXG4gKlxuICogVHJpZ2dlcnMgYXJlIHJlZ2lzdGVyZWQgd2l0aGluIHRoZSBjb21wb25lbnQgYW5ub3RhdGlvbiBkYXRhIHVuZGVyIHRoZVxuICoge0BsaW5rIENvbXBvbmVudCNhbmltYXRpb25zIGFuaW1hdGlvbnMgc2VjdGlvbn0uIEFuIGFuaW1hdGlvbiB0cmlnZ2VyIGNhbiBiZSBwbGFjZWQgb24gYW4gZWxlbWVudFxuICogd2l0aGluIGEgdGVtcGxhdGUgYnkgcmVmZXJlbmNpbmcgdGhlIG5hbWUgb2YgdGhlIHRyaWdnZXIgZm9sbG93ZWQgYnkgdGhlIGV4cHJlc3Npb24gdmFsdWUgdGhhdFxuIHRoZVxuICogdHJpZ2dlciBpcyBib3VuZCB0byAoaW4gdGhlIGZvcm0gb2YgYFtAdHJpZ2dlck5hbWVdPVwiZXhwcmVzc2lvblwiYC5cbiAqXG4gKiBBbmltYXRpb24gdHJpZ2dlciBiaW5kaW5ncyBzdHJpZ2lmeSB2YWx1ZXMgYW5kIHRoZW4gbWF0Y2ggdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHZhbHVlcyBhZ2FpbnN0XG4gKiBhbnkgbGlua2VkIHRyYW5zaXRpb25zLiBJZiBhIGJvb2xlYW4gdmFsdWUgaXMgcHJvdmlkZWQgaW50byB0aGUgdHJpZ2dlciBiaW5kaW5nIHRoZW4gaXQgd2lsbCBib3RoXG4gKiBiZSByZXByZXNlbnRlZCBhcyBgMWAgb3IgYHRydWVgIGFuZCBgMGAgb3IgYGZhbHNlYCBmb3IgYSB0cnVlIGFuZCBmYWxzZSBib29sZWFuIHZhbHVlc1xuICogcmVzcGVjdGl2ZWx5LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIGB0cmlnZ2VyYCB3aWxsIGNyZWF0ZSBhbiBhbmltYXRpb24gdHJpZ2dlciByZWZlcmVuY2UgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGBuYW1lYCB2YWx1ZS4gVGhlXG4gKiBwcm92aWRlZCBgYW5pbWF0aW9uYCB2YWx1ZSBpcyBleHBlY3RlZCB0byBiZSBhbiBhcnJheSBjb25zaXN0aW5nIG9mIHtAbGluayBzdGF0ZSBzdGF0ZX0gYW5kXG4gKiB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9ufSBkZWNsYXJhdGlvbnMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteS1jb21wb25lbnQtdHBsLmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKSxcbiAqICAgICAgIHRyYW5zaXRpb24oLi4uKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJzb21ldGhpbmdcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb21wb25lbnQgd2lsbCBtYWtlIHVzZSBvZiB0aGUgYG15QW5pbWF0aW9uVHJpZ2dlcmAgYW5pbWF0aW9uXG4gdHJpZ2dlciBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgYW4gaW5saW5lIGZ1bmN0aW9uXG4gKiBUaGUgYHRyYW5zaXRpb25gIGFuaW1hdGlvbiBtZXRob2QgYWxzbyBzdXBwb3J0cyByZWFkaW5nIGFuIGlubGluZSBmdW5jdGlvbiB3aGljaCBjYW4gZGVjaWRlXG4gKiBpZiBpdHMgYXNzb2NpYXRlZCBhbmltYXRpb24gc2hvdWxkIGJlIHJ1bi5cbiAqXG4gKiBgYGBcbiAqIC8vIHRoaXMgbWV0aG9kIHdpbGwgYmUgcnVuIGVhY2ggdGltZSB0aGUgYG15QW5pbWF0aW9uVHJpZ2dlcmBcbiAqIC8vIHRyaWdnZXIgdmFsdWUgY2hhbmdlcy4uLlxuICogZnVuY3Rpb24gbXlJbmxpbmVNYXRjaGVyRm4oZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OlxuIHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAqICAgLy8gbm90aWNlIHRoYXQgYGVsZW1lbnRgIGFuZCBgcGFyYW1zYCBhcmUgYWxzbyBhdmFpbGFibGUgaGVyZVxuICogICByZXR1cm4gdG9TdGF0ZSA9PSAneWVzLXBsZWFzZS1hbmltYXRlJztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215LWNvbXBvbmVudC10cGwuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdteUFuaW1hdGlvblRyaWdnZXInLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKG15SW5saW5lTWF0Y2hlckZuLCBbXG4gKiAgICAgICAgIC8vIHRoZSBhbmltYXRpb24gc2VxdWVuY2UgY29kZVxuICogICAgICAgXSksXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInllcy1wbGVhc2UtYW5pbWF0ZVwiO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIGlubGluZSBtZXRob2Qgd2lsbCBiZSBydW4gZWFjaCB0aW1lIHRoZSB0cmlnZ2VyXG4gKiB2YWx1ZSBjaGFuZ2VzXG4gKlxuICogIyMgRGlzYWJsZSBBbmltYXRpb25zXG4gKiBBIHNwZWNpYWwgYW5pbWF0aW9uIGNvbnRyb2wgYmluZGluZyBjYWxsZWQgYEAuZGlzYWJsZWRgIGNhbiBiZSBwbGFjZWQgb24gYW4gZWxlbWVudCB3aGljaCB3aWxsXG4gdGhlbiBkaXNhYmxlIGFuaW1hdGlvbnMgZm9yIGFueSBpbm5lciBhbmltYXRpb24gdHJpZ2dlcnMgc2l0dWF0ZWQgd2l0aGluIHRoZSBlbGVtZW50IGFzIHdlbGwgYXNcbiBhbnkgYW5pbWF0aW9ucyBvbiB0aGUgZWxlbWVudCBpdHNlbGYuXG4gKlxuICogV2hlbiB0cnVlLCB0aGUgYEAuZGlzYWJsZWRgIGJpbmRpbmcgd2lsbCBwcmV2ZW50IGFsbCBhbmltYXRpb25zIGZyb20gcmVuZGVyaW5nLiBUaGUgZXhhbXBsZVxuIGJlbG93IHNob3dzIGhvdyB0byB1c2UgdGhpcyBmZWF0dXJlOlxuICpcbiAqIGBgYHRzXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0AuZGlzYWJsZWRdPVwiaXNEaXNhYmxlZFwiPlxuICogICAgICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcihcImNoaWxkQW5pbWF0aW9uXCIsIFtcbiAqICAgICAgIC8vIC4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGlzRGlzYWJsZWQgPSB0cnVlO1xuICogICBleHAgPSAnLi4uJztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBgQGNoaWxkQW5pbWF0aW9uYCB0cmlnZ2VyIHdpbGwgbm90IGFuaW1hdGUgYmVjYXVzZSBgQC5kaXNhYmxlZGAgcHJldmVudHMgaXQgZnJvbSBoYXBwZW5pbmdcbiAod2hlbiB0cnVlKS5cbiAqXG4gKiBOb3RlIHRoYXQgYEAuZGlzYWJsZWRgIHdpbGwgb25seSBkaXNhYmxlIGFsbCBhbmltYXRpb25zICh0aGlzIG1lYW5zIGFueSBhbmltYXRpb25zIHJ1bm5pbmcgb25cbiAqIHRoZSBzYW1lIGVsZW1lbnQgd2lsbCBhbHNvIGJlIGRpc2FibGVkKS5cbiAqXG4gKiAjIyMgRGlzYWJsaW5nIEFuaW1hdGlvbnMgQXBwbGljYXRpb24td2lkZVxuICogV2hlbiBhbiBhcmVhIG9mIHRoZSB0ZW1wbGF0ZSBpcyBzZXQgdG8gaGF2ZSBhbmltYXRpb25zIGRpc2FibGVkLCAqKmFsbCoqIGlubmVyIGNvbXBvbmVudHMgd2lsbFxuIGFsc28gaGF2ZSB0aGVpciBhbmltYXRpb25zIGRpc2FibGVkIGFzIHdlbGwuIFRoaXMgbWVhbnMgdGhhdCBhbGwgYW5pbWF0aW9ucyBmb3IgYW4gYW5ndWxhclxuIGFwcGxpY2F0aW9uIGNhbiBiZSBkaXNhYmxlZCBieSBwbGFjaW5nIGEgaG9zdCBiaW5kaW5nIHNldCBvbiBgQC5kaXNhYmxlZGAgb24gdGhlIHRvcG1vc3QgQW5ndWxhclxuIGNvbXBvbmVudC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtDb21wb25lbnQsIEhvc3RCaW5kaW5nfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAtY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnLFxuICogfSlcbiAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gKiAgIEBIb3N0QmluZGluZygnQC5kaXNhYmxlZCcpXG4gKiAgIHB1YmxpYyBhbmltYXRpb25zRGlzYWJsZWQgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKlxuICogIyMjIFdoYXQgYWJvdXQgYW5pbWF0aW9ucyB0aGF0IHVzIGBxdWVyeSgpYCBhbmQgYGFuaW1hdGVDaGlsZCgpYD9cbiAqIERlc3BpdGUgaW5uZXIgYW5pbWF0aW9ucyBiZWluZyBkaXNhYmxlZCwgYSBwYXJlbnQgYW5pbWF0aW9uIGNhbiB7QGxpbmsgcXVlcnkgcXVlcnl9IGZvciBpbm5lclxuIGVsZW1lbnRzIGxvY2F0ZWQgaW4gZGlzYWJsZWQgYXJlYXMgb2YgdGhlIHRlbXBsYXRlIGFuZCBzdGlsbCBhbmltYXRlIHRoZW0gYXMgaXQgc2VlcyBmaXQuIFRoaXMgaXNcbiBhbHNvIHRoZSBjYXNlIGZvciB3aGVuIGEgc3ViIGFuaW1hdGlvbiBpcyBxdWVyaWVkIGJ5IGEgcGFyZW50IGFuZCB0aGVuIGxhdGVyIGFuaW1hdGVkIHVzaW5nIHtAbGlua1xuIGFuaW1hdGVDaGlsZCBhbmltYXRlQ2hpbGR9LlxuXG4gKiAjIyMgRGV0ZWN0aW5nIHdoZW4gYW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXG4gKiBJZiBhIHJlZ2lvbiBvZiB0aGUgRE9NIChvciB0aGUgZW50aXJlIGFwcGxpY2F0aW9uKSBoYXMgaXRzIGFuaW1hdGlvbnMgZGlzYWJsZWQsIHRoZW4gYW5pbWF0aW9uXG4gKiB0cmlnZ2VyIGNhbGxiYWNrcyB3aWxsIHN0aWxsIGZpcmUganVzdCBhcyBub3JtYWwgKG9ubHkgZm9yIHplcm8gc2Vjb25kcykuXG4gKlxuICogV2hlbiBhIHRyaWdnZXIgY2FsbGJhY2sgZmlyZXMgaXQgd2lsbCBwcm92aWRlIGFuIGluc3RhbmNlIG9mIGFuIHtAbGluayBBbmltYXRpb25FdmVudH0uIElmXG4gYW5pbWF0aW9uc1xuICogYXJlIGRpc2FibGVkIHRoZW4gdGhlIGAuZGlzYWJsZWRgIGZsYWcgb24gdGhlIGV2ZW50IHdpbGwgYmUgdHJ1ZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXIobmFtZTogc3RyaW5nLCBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyaWdnZXIsIG5hbWUsIGRlZmluaXRpb25zLCBvcHRpb25zOiB7fX07XG59XG5cbi8qKlxuICogYGFuaW1hdGVgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYGFuaW1hdGVgIHNwZWNpZmllcyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IHdpbGwgYXBwbHkgdGhlIHByb3ZpZGVkIGBzdHlsZXNgIGRhdGEgZm9yIGEgZ2l2ZW5cbiAqIGFtb3VudCBvZiB0aW1lIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBgdGltaW5nYCBleHByZXNzaW9uIHZhbHVlLiBDYWxscyB0byBgYW5pbWF0ZWAgYXJlIGV4cGVjdGVkXG4gKiB0byBiZSB1c2VkIHdpdGhpbiB7QGxpbmsgc2VxdWVuY2UgYW4gYW5pbWF0aW9uIHNlcXVlbmNlfSwge0BsaW5rIGdyb3VwIGdyb3VwfSwgb3Ige0BsaW5rXG4gKiB0cmFuc2l0aW9uIHRyYW5zaXRpb259LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIFRoZSBgYW5pbWF0ZWAgZnVuY3Rpb24gYWNjZXB0cyB0d28gaW5wdXQgcGFyYW1ldGVyczogYHRpbWluZ2AgYW5kIGBzdHlsZXNgOlxuICpcbiAqIC0gYHRpbWluZ2AgaXMgYSBzdHJpbmcgYmFzZWQgdmFsdWUgdGhhdCBjYW4gYmUgYSBjb21iaW5hdGlvbiBvZiBhIGR1cmF0aW9uIHdpdGggb3B0aW9uYWwgZGVsYXlcbiAqIGFuZCBlYXNpbmcgdmFsdWVzLiBUaGUgZm9ybWF0IGZvciB0aGUgZXhwcmVzc2lvbiBicmVha3MgZG93biB0byBgZHVyYXRpb24gZGVsYXkgZWFzaW5nYFxuICogKHRoZXJlZm9yZSBhIHZhbHVlIHN1Y2ggYXMgYDFzIDEwMG1zIGVhc2Utb3V0YCB3aWxsIGJlIHBhcnNlIGl0c2VsZiBpbnRvIGBkdXJhdGlvbj0xMDAwLFxuICogZGVsYXk9MTAwLCBlYXNpbmc9ZWFzZS1vdXRgLiBJZiBhIG51bWVyaWMgdmFsdWUgaXMgcHJvdmlkZWQgdGhlbiB0aGF0IHdpbGwgYmUgdXNlZCBhcyB0aGVcbiAqIGBkdXJhdGlvbmAgdmFsdWUgaW4gbWlsbGlzZWNvbmQgZm9ybS5cbiAqIC0gYHN0eWxlc2AgaXMgdGhlIHN0eWxlIGlucHV0IGRhdGEgd2hpY2ggY2FuIGVpdGhlciBiZSBhIGNhbGwgdG8ge0BsaW5rIHN0eWxlIHN0eWxlfSBvciB7QGxpbmtcbiAqIGtleWZyYW1lcyBrZXlmcmFtZXN9LiBJZiBsZWZ0IGVtcHR5IHRoZW4gdGhlIHN0eWxlcyBmcm9tIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZSB3aWxsIGJlIGNvbGxlY3RlZFxuICogYW5kIHVzZWQgKHRoaXMgaXMgdXNlZnVsIHdoZW4gZGVzY3JpYmluZyBhbiBhbmltYXRpb24gc3RlcCB0aGF0IHdpbGwgY29tcGxldGUgYW4gYW5pbWF0aW9uIGJ5XG4gKiB7QGxpbmsgdHJhbnNpdGlvbiN0aGUtZmluYWwtYW5pbWF0ZS1jYWxsIGFuaW1hdGluZyB0byB0aGUgZmluYWwgc3RhdGV9KS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB2YXJpb3VzIGZ1bmN0aW9ucyBmb3Igc3BlY2lmeWluZyB0aW1pbmcgZGF0YVxuICogYW5pbWF0ZSg1MDAsIHN0eWxlKC4uLikpXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCIxMDBtcyAwLjVzXCIsIHN0eWxlKC4uLikpXG4gKiBhbmltYXRlKFwiNXMgZWFzZVwiLCBzdHlsZSguLi4pKVxuICogYW5pbWF0ZShcIjVzIDEwbXMgY3ViaWMtYmV6aWVyKC4xNywuNjcsLjg4LC4xKVwiLCBzdHlsZSguLi4pKVxuICpcbiAqIC8vIGVpdGhlciBzdHlsZSgpIG9mIGtleWZyYW1lcygpIGNhbiBiZSB1c2VkXG4gKiBhbmltYXRlKDUwMCwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiIH0pKVxuICogYW5pbWF0ZSg1MDAsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJibHVlXCIgfSkpLFxuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlciwgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHwgQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB8XG4gICAgICAgIG51bGwgPSBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZSwgc3R5bGVzLCB0aW1pbmdzfTtcbn1cblxuLyoqXG4gKiBgZ3JvdXBgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYGdyb3VwYCBzcGVjaWZpZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0aGF0IGFyZSBhbGwgcnVuIGluIHBhcmFsbGVsLiBHcm91cGVkIGFuaW1hdGlvbnMgYXJlXG4gKiB1c2VmdWwgd2hlbiBhIHNlcmllcyBvZiBzdHlsZXMgbXVzdCBiZSBhbmltYXRlZC9jbG9zZWQgb2ZmIGF0IGRpZmZlcmVudCBzdGFydGluZy9lbmRpbmcgdGltZXMuXG4gKlxuICogVGhlIGBncm91cGAgZnVuY3Rpb24gY2FuIGVpdGhlciBiZSB1c2VkIHdpdGhpbiBhIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZX0gb3IgYSB7QGxpbmsgdHJhbnNpdGlvblxuICogdHJhbnNpdGlvbn0gYW5kIGl0IHdpbGwgb25seSBjb250aW51ZSB0byB0aGUgbmV4dCBpbnN0cnVjdGlvbiBvbmNlIGFsbCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBUaGUgYHN0ZXBzYCBkYXRhIHRoYXQgaXMgcGFzc2VkIGludG8gdGhlIGBncm91cGAgYW5pbWF0aW9uIGZ1bmN0aW9uIGNhbiBlaXRoZXIgY29uc2lzdCBvZiB7QGxpbmtcbiAqIHN0eWxlIHN0eWxlfSBvciB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlfSBmdW5jdGlvbiBjYWxscy4gRWFjaCBjYWxsIHRvIGBzdHlsZSgpYCBvciBgYW5pbWF0ZSgpYFxuICogd2l0aGluIGEgZ3JvdXAgd2lsbCBiZSBleGVjdXRlZCBpbnN0YW50bHkgKHVzZSB7QGxpbmsga2V5ZnJhbWVzIGtleWZyYW1lc30gb3IgYSB7QGxpbmtcbiAqIGFuaW1hdGUjdXNhZ2UgYW5pbWF0ZSgpIHdpdGggYSBkZWxheSB2YWx1ZX0gdG8gb2Zmc2V0IHN0eWxlcyB0byBiZSBhcHBsaWVkIGF0IGEgbGF0ZXIgdGltZSkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZ3JvdXAoW1xuICogICBhbmltYXRlKFwiMXNcIiwgeyBiYWNrZ3JvdW5kOiBcImJsYWNrXCIgfSkpXG4gKiAgIGFuaW1hdGUoXCIyc1wiLCB7IGNvbG9yOiBcIndoaXRlXCIgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cChcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uR3JvdXBNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkdyb3VwLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHNlcXVlbmNlYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBzZXF1ZW5jZWAgU3BlY2lmaWVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdGhhdCBhcmUgcnVuIG9uZSBieSBvbmUuIChgc2VxdWVuY2VgIGlzIHVzZWQgYnlcbiAqIGRlZmF1bHQgd2hlbiBhbiBhcnJheSBpcyBwYXNzZWQgYXMgYW5pbWF0aW9uIGRhdGEgaW50byB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9ufS4pXG4gKlxuICogVGhlIGBzZXF1ZW5jZWAgZnVuY3Rpb24gY2FuIGVpdGhlciBiZSB1c2VkIHdpdGhpbiBhIHtAbGluayBncm91cCBncm91cH0gb3IgYSB7QGxpbmsgdHJhbnNpdGlvblxuICogdHJhbnNpdGlvbn0gYW5kIGl0IHdpbGwgb25seSBjb250aW51ZSB0byB0aGUgbmV4dCBpbnN0cnVjdGlvbiBvbmNlIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvblxuICogc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICogVG8gcGVyZm9ybSBhbmltYXRpb24gc3R5bGluZyBpbiBwYXJhbGxlbCB3aXRoIG90aGVyIGFuaW1hdGlvbiBzdGVwcyB0aGVuIGhhdmUgYSBsb29rIGF0IHRoZVxuICoge0BsaW5rIGdyb3VwIGdyb3VwfSBhbmltYXRpb24gZnVuY3Rpb24uXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogVGhlIGBzdGVwc2AgZGF0YSB0aGF0IGlzIHBhc3NlZCBpbnRvIHRoZSBgc2VxdWVuY2VgIGFuaW1hdGlvbiBmdW5jdGlvbiBjYW4gZWl0aGVyIGNvbnNpc3Qgb2ZcbiAqIHtAbGluayBzdHlsZSBzdHlsZX0gb3Ige0BsaW5rIGFuaW1hdGUgYW5pbWF0ZX0gZnVuY3Rpb24gY2FsbHMuIEEgY2FsbCB0byBgc3R5bGUoKWAgd2lsbCBhcHBseSB0aGVcbiAqIHByb3ZpZGVkIHN0eWxpbmcgZGF0YSBpbW1lZGlhdGVseSB3aGlsZSBhIGNhbGwgdG8gYGFuaW1hdGUoKWAgd2lsbCBhcHBseSBpdHMgc3R5bGluZyBkYXRhIG92ZXIgYVxuICogZ2l2ZW4gdGltZSBkZXBlbmRpbmcgb24gaXRzIHRpbWluZyBkYXRhLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHNlcXVlbmNlKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgb3BhY2l0eTogMSB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlKHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZSwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBzdHlsZWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgc3R5bGVgIGRlY2xhcmVzIGEga2V5L3ZhbHVlIG9iamVjdCBjb250YWluaW5nIENTUyBwcm9wZXJ0aWVzL3N0eWxlcyB0aGF0IGNhbiB0aGVuIGJlIHVzZWQgZm9yXG4gKiB7QGxpbmsgc3RhdGUgYW5pbWF0aW9uIHN0YXRlc30sIHdpdGhpbiBhbiB7QGxpbmsgc2VxdWVuY2UgYW5pbWF0aW9uIHNlcXVlbmNlfSwgb3IgYXMgc3R5bGluZyBkYXRhXG4gKiBmb3IgYm90aCB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlfSBhbmQge0BsaW5rIGtleWZyYW1lcyBrZXlmcmFtZXN9LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIGBzdHlsZWAgdGFrZXMgaW4gYSBrZXkvdmFsdWUgc3RyaW5nIG1hcCBhcyBkYXRhIGFuZCBleHBlY3RzIG9uZSBvciBtb3JlIENTUyBwcm9wZXJ0eS92YWx1ZSBwYWlyc1xuICogdG8gYmUgZGVmaW5lZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBzdHJpbmcgdmFsdWVzIGFyZSB1c2VkIGZvciBjc3MgcHJvcGVydGllc1xuICogc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiLCBjb2xvcjogXCJibHVlXCIgfSlcbiAqXG4gKiAvLyBudW1lcmljYWwgKHBpeGVsKSB2YWx1ZXMgYXJlIGFsc28gc3VwcG9ydGVkXG4gKiBzdHlsZSh7IHdpZHRoOiAxMDAsIGhlaWdodDogMCB9KVxuICogYGBgXG4gKlxuICogIyMjIyBBdXRvLXN0eWxlcyAodXNpbmcgYCpgKVxuICpcbiAqIFdoZW4gYW4gYXN0ZXJpeCAoYCpgKSBjaGFyYWN0ZXIgaXMgdXNlZCBhcyBhIHZhbHVlIHRoZW4gaXQgd2lsbCBiZSBkZXRlY3RlZCBmcm9tIHRoZSBlbGVtZW50XG4gKiBiZWluZyBhbmltYXRlZCBhbmQgYXBwbGllZCBhcyBhbmltYXRpb24gZGF0YSB3aGVuIHRoZSBhbmltYXRpb24gc3RhcnRzLlxuICpcbiAqIFRoaXMgZmVhdHVyZSBwcm92ZXMgdXNlZnVsIGZvciBhIHN0YXRlIGRlcGVuZGluZyBvbiBsYXlvdXQgYW5kL29yIGVudmlyb25tZW50IGZhY3RvcnM7IGluIHN1Y2hcbiAqIGNhc2VzIHRoZSBzdHlsZXMgYXJlIGNhbGN1bGF0ZWQganVzdCBiZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHN0ZXBzIGJlbG93IHdpbGwgYW5pbWF0ZSBmcm9tIDAgdG8gdGhlXG4gKiAvLyBhY3R1YWwgaGVpZ2h0IG9mIHRoZSBlbGVtZW50XG4gKiBzdHlsZSh7IGhlaWdodDogMCB9KSxcbiAqIGFuaW1hdGUoXCIxc1wiLCBzdHlsZSh7IGhlaWdodDogXCIqXCIgfSkpXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlKFxuICAgIHRva2VuczogJyonIHwge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0gfFxuICAgIEFycmF5PCcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfT4pOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGUsIHN0eWxlczogdG9rZW5zLCBvZmZzZXQ6IG51bGx9O1xufVxuXG4vKipcbiAqIGBzdGF0ZWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgc3RhdGVgIGRlY2xhcmVzIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoaW4gdGhlIGdpdmVuIHRyaWdnZXIuIFdoZW4gYSBzdGF0ZSBpcyBhY3RpdmUgd2l0aGluIGFcbiAqIGNvbXBvbmVudCB0aGVuIGl0cyBhc3NvY2lhdGVkIHN0eWxlcyB3aWxsIHBlcnNpc3Qgb24gdGhlIGVsZW1lbnQgdGhhdCB0aGUgdHJpZ2dlciBpcyBhdHRhY2hlZCB0b1xuICogKGV2ZW4gd2hlbiB0aGUgYW5pbWF0aW9uIGVuZHMpLlxuICpcbiAqIFRvIGFuaW1hdGUgYmV0d2VlbiBzdGF0ZXMsIGhhdmUgYSBsb29rIGF0IHRoZSBhbmltYXRpb24ge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0gRFNMXG4gKiBmdW5jdGlvbi4gVG8gcmVnaXN0ZXIgc3RhdGVzIHRvIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHBsZWFzZSBoYXZlIGEgbG9vayBhdCB0aGUge0BsaW5rIHRyaWdnZXJcbiAqIHRyaWdnZXJ9IGZ1bmN0aW9uLlxuICpcbiAqICMjIyMgVGhlIGB2b2lkYCBzdGF0ZVxuICpcbiAqIFRoZSBgdm9pZGAgc3RhdGUgdmFsdWUgaXMgYSByZXNlcnZlZCB3b3JkIHRoYXQgYW5ndWxhciB1c2VzIHRvIGRldGVybWluZSB3aGVuIHRoZSBlbGVtZW50IGlzIG5vdFxuICogYXBhcnQgb2YgdGhlIGFwcGxpY2F0aW9uIGFueW1vcmUgKGUuZy4gd2hlbiBhbiBgbmdJZmAgZXZhbHVhdGVzIHRvIGZhbHNlIHRoZW4gdGhlIHN0YXRlIG9mIHRoZVxuICogYXNzb2NpYXRlZCBlbGVtZW50IGlzIHZvaWQpLlxuICpcbiAqICMjIyMgVGhlIGAqYCAoZGVmYXVsdCkgc3RhdGVcbiAqXG4gKiBUaGUgYCpgIHN0YXRlICh3aGVuIHN0eWxlZCkgaXMgYSBmYWxsYmFjayBzdGF0ZSB0aGF0IHdpbGwgYmUgdXNlZCBpZiB0aGUgc3RhdGUgdGhhdCBpcyBiZWluZ1xuICogYW5pbWF0ZWQgaXMgbm90IGRlY2xhcmVkIHdpdGhpbiB0aGUgdHJpZ2dlci5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgc3RhdGVgIHdpbGwgZGVjbGFyZSBhbiBhbmltYXRpb24gc3RhdGUgd2l0aCBpdHMgYXNzb2NpYXRlZCBzdHlsZXNcbiAqIHdpdGhpbiB0aGUgZ2l2ZW4gdHJpZ2dlci5cbiAqXG4gKiAtIGBzdGF0ZU5hbWVFeHByYCBjYW4gYmUgb25lIG9yIG1vcmUgc3RhdGUgbmFtZXMgc2VwYXJhdGVkIGJ5IGNvbW1hcy5cbiAqIC0gYHN0eWxlc2AgcmVmZXJzIHRvIHRoZSB7QGxpbmsgc3R5bGUgc3R5bGluZyBkYXRhfSB0aGF0IHdpbGwgYmUgcGVyc2lzdGVkIG9uIHRoZSBlbGVtZW50IG9uY2VcbiAqIHRoZSBzdGF0ZSBoYXMgYmVlbiByZWFjaGVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIFwidm9pZFwiIGlzIGEgcmVzZXJ2ZWQgbmFtZSBmb3IgYSBzdGF0ZSBhbmQgaXMgdXNlZCB0byByZXByZXNlbnRcbiAqIC8vIHRoZSBzdGF0ZSBpbiB3aGljaCBhbiBlbGVtZW50IGlzIGRldGFjaGVkIGZyb20gZnJvbSB0aGUgYXBwbGljYXRpb24uXG4gKiBzdGF0ZShcInZvaWRcIiwgc3R5bGUoeyBoZWlnaHQ6IDAgfSkpXG4gKlxuICogLy8gdXNlci1kZWZpbmVkIHN0YXRlc1xuICogc3RhdGUoXCJjbG9zZWRcIiwgc3R5bGUoeyBoZWlnaHQ6IDAgfSkpXG4gKiBzdGF0ZShcIm9wZW4sIHZpc2libGVcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZShcbiAgICBuYW1lOiBzdHJpbmcsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSxcbiAgICBvcHRpb25zPzoge3BhcmFtczoge1tuYW1lOiBzdHJpbmddOiBhbnl9fSk6IEFuaW1hdGlvblN0YXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZSwgbmFtZSwgc3R5bGVzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBga2V5ZnJhbWVzYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBrZXlmcmFtZXNgIHNwZWNpZmllcyBhIGNvbGxlY3Rpb24gb2Yge0BsaW5rIHN0eWxlIHN0eWxlfSBlbnRyaWVzIGVhY2ggb3B0aW9uYWxseSBjaGFyYWN0ZXJpemVkXG4gKiBieSBhbiBgb2Zmc2V0YCB2YWx1ZS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBUaGUgYGtleWZyYW1lc2AgYW5pbWF0aW9uIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgYWxvbmdzaWRlIHRoZSB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlfVxuICogYW5pbWF0aW9uIGZ1bmN0aW9uLiBJbnN0ZWFkIG9mIGFwcGx5aW5nIGFuaW1hdGlvbnMgZnJvbSB3aGVyZSB0aGV5IGFyZSBjdXJyZW50bHkgdG8gdGhlaXJcbiAqIGRlc3RpbmF0aW9uLCBrZXlmcmFtZXMgY2FuIGRlc2NyaWJlIGhvdyBlYWNoIHN0eWxlIGVudHJ5IGlzIGFwcGxpZWQgYW5kIGF0IHdoYXQgcG9pbnQgd2l0aGluIHRoZVxuICogYW5pbWF0aW9uIGFyYyAobXVjaCBsaWtlIENTUyBLZXlmcmFtZSBBbmltYXRpb25zIGRvKS5cbiAqXG4gKiBGb3IgZWFjaCBgc3R5bGUoKWAgZW50cnkgYW4gYG9mZnNldGAgdmFsdWUgY2FuIGJlIHNldC4gRG9pbmcgc28gYWxsb3dzIHRvIHNwZWNpZnkgYXQgd2hhdFxuICogcGVyY2VudGFnZSBvZiB0aGUgYW5pbWF0ZSB0aW1lIHRoZSBzdHlsZXMgd2lsbCBiZSBhcHBsaWVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoZSBwcm92aWRlZCBvZmZzZXQgdmFsdWVzIGRlc2NyaWJlIHdoZW4gZWFjaCBiYWNrZ3JvdW5kQ29sb3IgdmFsdWUgaXMgYXBwbGllZC5cbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiwgb2Zmc2V0OiAwIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIsIG9mZnNldDogMC4yIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiwgb2Zmc2V0OiAwLjMgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIsIG9mZnNldDogMSB9KVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBBbHRlcm5hdGl2ZWx5LCBpZiB0aGVyZSBhcmUgbm8gYG9mZnNldGAgdmFsdWVzIHVzZWQgd2l0aGluIHRoZSBzdHlsZSBlbnRyaWVzIHRoZW4gdGhlIG9mZnNldHNcbiAqIHdpbGwgYmUgY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGFuaW1hdGUoXCI1c1wiLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJyZWRcIiB9KSAvLyBvZmZzZXQgPSAwXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiB9KSAvLyBvZmZzZXQgPSAwLjMzXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiIH0pIC8vIG9mZnNldCA9IDAuNjZcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiB9KSAvLyBvZmZzZXQgPSAxXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5ZnJhbWVzKHN0ZXBzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhW10pOiBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzLCBzdGVwc307XG59XG5cbi8qKlxuICogYHRyYW5zaXRpb25gIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHRyYW5zaXRpb25gIGRlY2xhcmVzIHRoZSB7QGxpbmsgc2VxdWVuY2Ugc2VxdWVuY2Ugb2YgYW5pbWF0aW9uIHN0ZXBzfSB0aGF0IHdpbGwgYmUgcnVuIHdoZW4gdGhlXG4gKiBwcm92aWRlZCBgc3RhdGVDaGFuZ2VFeHByYCB2YWx1ZSBpcyBzYXRpc2ZpZWQuIFRoZSBgc3RhdGVDaGFuZ2VFeHByYCBjb25zaXN0cyBvZiBhIGBzdGF0ZTEgPT5cbiAqIHN0YXRlMmAgd2hpY2ggY29uc2lzdHMgb2YgdHdvIGtub3duIHN0YXRlcyAodXNlIGFuIGFzdGVyaXggKGAqYCkgdG8gcmVmZXIgdG8gYSBkeW5hbWljIHN0YXJ0aW5nXG4gKiBhbmQvb3IgZW5kaW5nIHN0YXRlKS5cbiAqXG4gKiBBIGZ1bmN0aW9uIGNhbiBhbHNvIGJlIHByb3ZpZGVkIGFzIHRoZSBgc3RhdGVDaGFuZ2VFeHByYCBhcmd1bWVudCBmb3IgYSB0cmFuc2l0aW9uIGFuZCB0aGlzXG4gKiBmdW5jdGlvbiB3aWxsIGJlIGV4ZWN1dGVkIGVhY2ggdGltZSBhIHN0YXRlIGNoYW5nZSBvY2N1cnMuIElmIHRoZSB2YWx1ZSByZXR1cm5lZCB3aXRoaW4gdGhlXG4gKiBmdW5jdGlvbiBpcyB0cnVlIHRoZW4gdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHdpbGwgYmUgcnVuLlxuICpcbiAqIEFuaW1hdGlvbiB0cmFuc2l0aW9ucyBhcmUgcGxhY2VkIHdpdGhpbiBhbiB7QGxpbmsgdHJpZ2dlciBhbmltYXRpb24gdHJpZ2dlcn0uIEZvciBhbiB0cmFuc2l0aW9uXG4gKiB0byBhbmltYXRlIHRvIGEgc3RhdGUgdmFsdWUgYW5kIHBlcnNpc3QgaXRzIHN0eWxlcyB0aGVuIG9uZSBvciBtb3JlIHtAbGluayBzdGF0ZSBhbmltYXRpb25cbiAqIHN0YXRlc30gaXMgZXhwZWN0ZWQgdG8gYmUgZGVmaW5lZC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBBbiBhbmltYXRpb24gdHJhbnNpdGlvbiBpcyBraWNrZWQgb2ZmIHRoZSBgc3RhdGVDaGFuZ2VFeHByYCBwcmVkaWNhdGUgZXZhbHVhdGVzIHRvIHRydWUgYmFzZWQgb25cbiAqIHdoYXQgdGhlIHByZXZpb3VzIHN0YXRlIGlzIGFuZCB3aGF0IHRoZSBjdXJyZW50IHN0YXRlIGhhcyBiZWNvbWUuIEluIG90aGVyIHdvcmRzLCBpZiBhIHRyYW5zaXRpb25cbiAqIGlzIGRlZmluZWQgdGhhdCBtYXRjaGVzIHRoZSBvbGQvY3VycmVudCBzdGF0ZSBjcml0ZXJpYSB0aGVuIHRoZSBhc3NvY2lhdGVkIGFuaW1hdGlvbiB3aWxsIGJlXG4gKiB0cmlnZ2VyZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gYWxsIHRyYW5zaXRpb24vc3RhdGUgY2hhbmdlcyBhcmUgZGVmaW5lZCB3aXRoaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXJcbiAqIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogICAvLyBpZiBhIHN0YXRlIGlzIGRlZmluZWQgdGhlbiBpdHMgc3R5bGVzIHdpbGwgYmUgcGVyc2lzdGVkIHdoZW4gdGhlXG4gKiAgIC8vIGFuaW1hdGlvbiBoYXMgZnVsbHkgY29tcGxldGVkIGl0c2VsZlxuICogICBzdGF0ZShcIm9uXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmVlblwiIH0pKSxcbiAqICAgc3RhdGUoXCJvZmZcIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZXlcIiB9KSksXG4gKlxuICogICAvLyBhIHRyYW5zaXRpb24gYW5pbWF0aW9uIHRoYXQgd2lsbCBiZSBraWNrZWQgb2ZmIHdoZW4gdGhlIHN0YXRlIHZhbHVlXG4gKiAgIC8vIGJvdW5kIHRvIFwibXlBbmltYXRpb25UcmlnZ2VyXCIgY2hhbmdlcyBmcm9tIFwib25cIiB0byBcIm9mZlwiXG4gKiAgIHRyYW5zaXRpb24oXCJvbiA9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKSxcbiAqXG4gKiAgIC8vIGl0IGlzIGFsc28gcG9zc2libGUgdG8gZG8gcnVuIHRoZSBzYW1lIGFuaW1hdGlvbiBmb3IgYm90aCBkaXJlY3Rpb25zXG4gKiAgIHRyYW5zaXRpb24oXCJvbiA8PT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSksXG4gKlxuICogICAvLyBvciB0byBkZWZpbmUgbXVsdGlwbGUgc3RhdGVzIHBhaXJzIHNlcGFyYXRlZCBieSBjb21tYXNcbiAqICAgdHJhbnNpdGlvbihcIm9uID0+IG9mZiwgb2ZmID0+IHZvaWRcIiwgYW5pbWF0ZSg1MDApKSxcbiAqXG4gKiAgIC8vIHRoaXMgaXMgYSBjYXRjaC1hbGwgc3RhdGUgY2hhbmdlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgaW5zZXJ0ZWQgaW50b1xuICogICAvLyB0aGUgcGFnZSBhbmQgdGhlIGRlc3RpbmF0aW9uIHN0YXRlIGlzIHVua25vd25cbiAqICAgdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICAgIGFuaW1hdGUoNTAwKVxuICogICBdKSxcbiAqXG4gKiAgIC8vIHRoaXMgd2lsbCBjYXB0dXJlIGEgc3RhdGUgY2hhbmdlIGJldHdlZW4gYW55IHN0YXRlc1xuICogICB0cmFuc2l0aW9uKFwiKiA9PiAqXCIsIGFuaW1hdGUoXCIxcyAwc1wiKSksXG4gKlxuICogICAvLyB5b3UgY2FuIGFsc28gZ28gZnVsbCBvdXQgYW5kIGluY2x1ZGUgYSBmdW5jdGlvblxuICogICB0cmFuc2l0aW9uKChmcm9tU3RhdGUsIHRvU3RhdGUpID0+IHtcbiAqICAgICAvLyB3aGVuIGB0cnVlYCB0aGVuIGl0IHdpbGwgYWxsb3cgdGhlIGFuaW1hdGlvbiBiZWxvdyB0byBiZSBpbnZva2VkXG4gKiAgICAgcmV0dXJuIGZyb21TdGF0ZSA9PSBcIm9mZlwiICYmIHRvU3RhdGUgPT0gXCJvblwiO1xuICogICB9LCBhbmltYXRlKFwiMXMgMHNcIikpXG4gKiBdKVxuICogYGBgXG4gKlxuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbXBvbmVudCB3aWxsIG1ha2UgdXNlIG9mIHRoZSBgbXlBbmltYXRpb25UcmlnZ2VyYCBhbmltYXRpb25cbiAqIHRyaWdnZXIgYnkgYmluZGluZyB0byBhbiBlbGVtZW50IHdpdGhpbiBpdHMgdGVtcGxhdGUgY29kZS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIHNvbWV3aGVyZSBpbnNpZGUgb2YgbXktY29tcG9uZW50LXRwbC5odG1sIC0tPlxuICogPGRpdiBbQG15QW5pbWF0aW9uVHJpZ2dlcl09XCJteVN0YXR1c0V4cFwiPi4uLjwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIyBUaGUgZmluYWwgYGFuaW1hdGVgIGNhbGxcbiAqXG4gKiBJZiB0aGUgZmluYWwgc3RlcCB3aXRoaW4gdGhlIHRyYW5zaXRpb24gc3RlcHMgaXMgYSBjYWxsIHRvIGBhbmltYXRlKClgIHRoYXQgKipvbmx5KiogdXNlcyBhXG4gKiB0aW1pbmcgdmFsdWUgd2l0aCAqKm5vIHN0eWxlIGRhdGEqKiB0aGVuIGl0IHdpbGwgYmUgYXV0b21hdGljYWxseSB1c2VkIGFzIHRoZSBmaW5hbCBhbmltYXRpb24gYXJjXG4gKiBmb3IgdGhlIGVsZW1lbnQgdG8gYW5pbWF0ZSBpdHNlbGYgdG8gdGhlIGZpbmFsIHN0YXRlLiBUaGlzIGludm9sdmVzIGFuIGF1dG9tYXRpYyBtaXggb2ZcbiAqIGFkZGluZy9yZW1vdmluZyBDU1Mgc3R5bGVzIHNvIHRoYXQgdGhlIGVsZW1lbnQgd2lsbCBiZSBpbiB0aGUgZXhhY3Qgc3RhdGUgaXQgc2hvdWxkIGJlIGZvciB0aGVcbiAqIGFwcGxpZWQgc3RhdGUgdG8gYmUgcHJlc2VudGVkIGNvcnJlY3RseS5cbiAqXG4gKiBgYGBcbiAqIC8vIHN0YXJ0IG9mZiBieSBoaWRpbmcgdGhlIGVsZW1lbnQsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBhbmltYXRlcyBwcm9wZXJseSB0byB3aGF0ZXZlciBzdGF0ZVxuICogLy8gaXMgY3VycmVudGx5IGFjdGl2ZSBmb3IgXCJteUFuaW1hdGlvblRyaWdnZXJcIlxuICogdHJhbnNpdGlvbihcInZvaWQgPT4gKlwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDApXG4gKiBdKVxuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIDplbnRlciBhbmQgOmxlYXZlXG4gKlxuICogR2l2ZW4gdGhhdCBlbnRlciAoaW5zZXJ0aW9uKSBhbmQgbGVhdmUgKHJlbW92YWwpIGFuaW1hdGlvbnMgYXJlIHNvIGNvbW1vbiwgdGhlIGB0cmFuc2l0aW9uYFxuICogZnVuY3Rpb24gYWNjZXB0cyBib3RoIGA6ZW50ZXJgIGFuZCBgOmxlYXZlYCB2YWx1ZXMgd2hpY2ggYXJlIGFsaWFzZXMgZm9yIHRoZSBgdm9pZCA9PiAqYCBhbmQgYCpcbiAqID0+IHZvaWRgIHN0YXRlIGNoYW5nZXMuXG4gKlxuICogYGBgXG4gKiB0cmFuc2l0aW9uKFwiOmVudGVyXCIsIFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogXSksXG4gKiB0cmFuc2l0aW9uKFwiOmxlYXZlXCIsIFtcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgQm9vbGVhbiB2YWx1ZXNcbiAqIGlmIGEgdHJpZ2dlciBiaW5kaW5nIHZhbHVlIGlzIGEgYm9vbGVhbiB2YWx1ZSB0aGVuIGl0IGNhbiBiZSBtYXRjaGVkIHVzaW5nIGEgdHJhbnNpdGlvblxuICogZXhwcmVzc2lvbiB0aGF0IGNvbXBhcmVzIGB0cnVlYCBhbmQgYGZhbHNlYCBvciBgMWAgYW5kIGAwYC5cbiAqXG4gKiBgYGBcbiAqIC8vIGluIHRoZSB0ZW1wbGF0ZVxuICogPGRpdiBbQG9wZW5DbG9zZV09XCJvcGVuID8gdHJ1ZSA6IGZhbHNlXCI+Li4uPC9kaXY+XG4gKlxuICogLy8gaW4gdGhlIGNvbXBvbmVudCBtZXRhZGF0YVxuICogdHJpZ2dlcignb3BlbkNsb3NlJywgW1xuICogICBzdGF0ZSgndHJ1ZScsIHN0eWxlKHsgaGVpZ2h0OiAnKicgfSkpLFxuICogICBzdGF0ZSgnZmFsc2UnLCBzdHlsZSh7IGhlaWdodDogJzBweCcgfSkpLFxuICogICB0cmFuc2l0aW9uKCdmYWxzZSA8PT4gdHJ1ZScsIGFuaW1hdGUoNTAwKSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgOmluY3JlbWVudCBhbmQgOmRlY3JlbWVudFxuICogSW4gYWRkaXRpb24gdG8gdGhlIDplbnRlciBhbmQgOmxlYXZlIHRyYW5zaXRpb24gYWxpYXNlcywgdGhlIDppbmNyZW1lbnQgYW5kIDpkZWNyZW1lbnQgYWxpYXNlc1xuICogY2FuIGJlIHVzZWQgdG8ga2ljayBvZmYgYSB0cmFuc2l0aW9uIHdoZW4gYSBudW1lcmljIHZhbHVlIGhhcyBpbmNyZWFzZWQgb3IgZGVjcmVhc2VkIGluIHZhbHVlLlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtncm91cCwgYW5pbWF0ZSwgcXVlcnksIHRyYW5zaXRpb24sIHN0eWxlLCB0cmlnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdiYW5uZXItY2Fyb3VzZWwtY29tcG9uZW50JyxcbiAqICAgc3R5bGVzOiBbYFxuICogICAgIC5iYW5uZXItY29udGFpbmVyIHtcbiAqICAgICAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAqICAgICAgICBoZWlnaHQ6NTAwcHg7XG4gKiAgICAgICAgb3ZlcmZsb3c6aGlkZGVuO1xuICogICAgICB9XG4gKiAgICAgLmJhbm5lci1jb250YWluZXIgPiAuYmFubmVyIHtcbiAqICAgICAgICBwb3NpdGlvbjphYnNvbHV0ZTtcbiAqICAgICAgICBsZWZ0OjA7XG4gKiAgICAgICAgdG9wOjA7XG4gKiAgICAgICAgZm9udC1zaXplOjIwMHB4O1xuICogICAgICAgIGxpbmUtaGVpZ2h0OjUwMHB4O1xuICogICAgICAgIGZvbnQtd2VpZ2h0OmJvbGQ7XG4gKiAgICAgICAgdGV4dC1hbGlnbjpjZW50ZXI7XG4gKiAgICAgICAgd2lkdGg6MTAwJTtcbiAqICAgICAgfVxuICogICBgXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJwcmV2aW91cygpXCI+UHJldmlvdXM8L2J1dHRvbj5cbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJuZXh0KClcIj5OZXh0PC9idXR0b24+XG4gKiAgICAgPGhyPlxuICogICAgIDxkaXYgW0BiYW5uZXJBbmltYXRpb25dPVwic2VsZWN0ZWRJbmRleFwiIGNsYXNzPVwiYmFubmVyLWNvbnRhaW5lclwiPlxuICogICAgICAgPGRpdiBjbGFzcz1cImJhbm5lclwiICpuZ0Zvcj1cImxldCBiYW5uZXIgb2YgYmFubmVyc1wiPiB7eyBiYW5uZXIgfX0gPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdiYW5uZXJBbmltYXRpb24nLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKFwiOmluY3JlbWVudFwiLCBncm91cChbXG4gKiAgICAgICAgIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgICAgICAgc3R5bGUoeyBsZWZ0OiAnMTAwJScgfSksXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKCcqJykpXG4gKiAgICAgICAgIF0pLFxuICogICAgICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSkpXG4gKiAgICAgICAgIF0pXG4gKiAgICAgICBdKSksXG4gKiAgICAgICB0cmFuc2l0aW9uKFwiOmRlY3JlbWVudFwiLCBncm91cChbXG4gKiAgICAgICAgIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgICAgICAgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pLFxuICogICAgICAgICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICAgICAgICBdKSxcbiAqICAgICAgICAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICAgICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnMTAwJScgfSkpXG4gKiAgICAgICAgIF0pXG4gKiAgICAgICBdKSlcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgQmFubmVyQ2Fyb3VzZWxDb21wb25lbnQge1xuICogICBhbGxCYW5uZXJzOiBzdHJpbmdbXSA9IFsnMScsICcyJywgJzMnLCAnNCddO1xuICogICBzZWxlY3RlZEluZGV4OiBudW1iZXIgPSAwO1xuICpcbiAqICAgZ2V0IGJhbm5lcnMoKSB7XG4gKiAgICAgIHJldHVybiBbdGhpcy5hbGxCYW5uZXJzW3RoaXMuc2VsZWN0ZWRJbmRleF1dO1xuICogICB9XG4gKlxuICogICBwcmV2aW91cygpIHtcbiAqICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1heCh0aGlzLnNlbGVjdGVkSW5kZXggLSAxLCAwKTtcbiAqICAgfVxuICpcbiAqICAgbmV4dCgpIHtcbiAqICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1pbih0aGlzLnNlbGVjdGVkSW5kZXggKyAxLCB0aGlzLmFsbEJhbm5lcnMubGVuZ3RoIC0gMSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNpdGlvbihcbiAgICBzdGF0ZUNoYW5nZUV4cHI6IHN0cmluZyB8ICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pLFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbiwgZXhwcjogc3RhdGVDaGFuZ2VFeHByLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgYW5pbWF0aW9uYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuXG4gKlxuICogYHZhciBteUFuaW1hdGlvbiA9IGFuaW1hdGlvbiguLi4pYCBpcyBkZXNpZ25lZCB0byBwcm9kdWNlIGEgcmV1c2FibGUgYW5pbWF0aW9uIHRoYXQgY2FuIGJlIGxhdGVyXG4gKiBpbnZva2VkIGluIGFub3RoZXIgYW5pbWF0aW9uIG9yIHNlcXVlbmNlLiBSZXVzYWJsZSBhbmltYXRpb25zIGFyZSBkZXNpZ25lZCB0byBtYWtlIHVzZSBvZlxuICogYW5pbWF0aW9uIHBhcmFtZXRlcnMgYW5kIHRoZSBwcm9kdWNlZCBhbmltYXRpb24gY2FuIGJlIHVzZWQgdmlhIHRoZSBgdXNlQW5pbWF0aW9uYCBtZXRob2QuXG4gKlxuICogYGBgXG4gKiB2YXIgZmFkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbihbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IHN0YXJ0IH19JyB9KSxcbiAqICAgYW5pbWF0ZSgne3sgdGltZSB9fScsXG4gKiAgICAgc3R5bGUoeyBvcGFjaXR5OiAne3sgZW5kIH19J30pKVxuICogXSwgeyBwYXJhbXM6IHsgdGltZTogJzEwMDBtcycsIHN0YXJ0OiAwLCBlbmQ6IDEgfX0pO1xuICogYGBgXG4gKlxuICogSWYgcGFyYW1ldGVycyBhcmUgYXR0YWNoZWQgdG8gYW4gYW5pbWF0aW9uIHRoZW4gdGhleSBhY3QgYXMgKipkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZXMqKi4gV2hlbiBhblxuICogYW5pbWF0aW9uIGlzIGludm9rZWQgdmlhIGB1c2VBbmltYXRpb25gIHRoZW4gcGFyYW1ldGVyIHZhbHVlcyBhcmUgYWxsb3dlZCB0byBiZSBwYXNzZWQgaW5cbiAqIGRpcmVjdGx5LiBJZiBhbnkgb2YgdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBtaXNzaW5nIHRoZW4gdGhlIGRlZmF1bHQgdmFsdWVzIHdpbGwgYmVcbiAqIHVzZWQuXG4gKlxuICogYGBgXG4gKiB1c2VBbmltYXRpb24oZmFkZUFuaW1hdGlvbiwge1xuICogICBwYXJhbXM6IHtcbiAqICAgICB0aW1lOiAnMnMnLFxuICogICAgIHN0YXJ0OiAxLFxuICogICAgIGVuZDogMFxuICogICB9XG4gKiB9KVxuICogYGBgXG4gKlxuICogSWYgb25lIG9yIG1vcmUgcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyBiZWZvcmUgYW5pbWF0ZWQgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGlvbihcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuUmVmZXJlbmNlLCBhbmltYXRpb246IHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgYW5pbWF0ZUNoaWxkYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIEl0IHdvcmtzIGJ5IGFsbG93aW5nIGEgcXVlcmllZCBlbGVtZW50IHRvIGV4ZWN1dGUgaXRzIG93blxuICogYW5pbWF0aW9uIHdpdGhpbiB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLlxuICpcbiAqIEVhY2ggdGltZSBhbiBhbmltYXRpb24gaXMgdHJpZ2dlcmVkIGluIGFuZ3VsYXIsIHRoZSBwYXJlbnQgYW5pbWF0aW9uXG4gKiB3aWxsIGFsd2F5cyBnZXQgcHJpb3JpdHkgYW5kIGFueSBjaGlsZCBhbmltYXRpb25zIHdpbGwgYmUgYmxvY2tlZC4gSW4gb3JkZXJcbiAqIGZvciBhIGNoaWxkIGFuaW1hdGlvbiB0byBydW4sIHRoZSBwYXJlbnQgYW5pbWF0aW9uIG11c3QgcXVlcnkgZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAqIGNvbnRhaW5pbmcgY2hpbGQgYW5pbWF0aW9ucyBhbmQgdGhlbiBhbGxvdyB0aGUgYW5pbWF0aW9ucyB0byBydW4gdXNpbmcgYGFuaW1hdGVDaGlsZGAuXG4gKlxuICogVGhlIGV4YW1wbGUgSFRNTCBjb2RlIGJlbG93IHNob3dzIGJvdGggcGFyZW50IGFuZCBjaGlsZCBlbGVtZW50cyB0aGF0IGhhdmUgYW5pbWF0aW9uXG4gKiB0cmlnZ2VycyB0aGF0IHdpbGwgZXhlY3V0ZSBhdCB0aGUgc2FtZSB0aW1lLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gcGFyZW50LWNoaWxkLmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwiZXhwID0hIGV4cFwiPlRvZ2dsZTwvYnV0dG9uPlxuICogPGhyPlxuICpcbiAqIDxkaXYgW0BwYXJlbnRBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgIDxoZWFkZXI+SGVsbG88L2hlYWRlcj5cbiAqICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgb25lXG4gKiAgIDwvZGl2PlxuICogICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICB0d29cbiAqICAgPC9kaXY+XG4gKiAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIHRocmVlXG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBOb3cgd2hlbiB0aGUgYGV4cGAgdmFsdWUgY2hhbmdlcyB0byB0cnVlLCBvbmx5IHRoZSBgcGFyZW50QW5pbWF0aW9uYCBhbmltYXRpb24gd2lsbCBhbmltYXRlXG4gKiBiZWNhdXNlIGl0IGhhcyBwcmlvcml0eS4gSG93ZXZlciwgdXNpbmcgYHF1ZXJ5YCBhbmQgYGFuaW1hdGVDaGlsZGAgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uc1xuICogY2FuIGFsc28gZmlyZTpcbiAqXG4gKiBgYGB0c1xuICogLy8gcGFyZW50LWNoaWxkLmNvbXBvbmVudC50c1xuICogaW1wb3J0IHt0cmlnZ2VyLCB0cmFuc2l0aW9uLCBhbmltYXRlLCBzdHlsZSwgcXVlcnksIGFuaW1hdGVDaGlsZH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYXJlbnQtY2hpbGQtY29tcG9uZW50JyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ3BhcmVudEFuaW1hdGlvbicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24oJ2ZhbHNlID0+IHRydWUnLCBbXG4gKiAgICAgICAgIHF1ZXJ5KCdoZWFkZXInLCBbXG4gKiAgICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICAgICAgICAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICAgIF0pLFxuICogICAgICAgICBxdWVyeSgnQGNoaWxkQW5pbWF0aW9uJywgW1xuICogICAgICAgICAgIGFuaW1hdGVDaGlsZCgpXG4gKiAgICAgICAgIF0pXG4gKiAgICAgICBdKVxuICogICAgIF0pLFxuICogICAgIHRyaWdnZXIoJ2NoaWxkQW5pbWF0aW9uJywgW1xuICogICAgICAgdHJhbnNpdGlvbignZmFsc2UgPT4gdHJ1ZScsIFtcbiAqICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICAgICAgICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogICAgICAgXSlcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgUGFyZW50Q2hpbGRDbXAge1xuICogICBleHA6IGJvb2xlYW4gPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoZSBhbmltYXRpb24gY29kZSBhYm92ZSwgd2hlbiB0aGUgYHBhcmVudEFuaW1hdGlvbmAgdHJhbnNpdGlvbiBraWNrcyBvZmYgaXQgZmlyc3QgcXVlcmllcyB0b1xuICogZmluZCB0aGUgaGVhZGVyIGVsZW1lbnQgYW5kIGZhZGVzIGl0IGluLiBJdCB0aGVuIGZpbmRzIGVhY2ggb2YgdGhlIHN1YiBlbGVtZW50cyB0aGF0IGNvbnRhaW4gdGhlXG4gKiBgQGNoaWxkQW5pbWF0aW9uYCB0cmlnZ2VyIGFuZCB0aGVuIGFsbG93cyBmb3IgdGhlaXIgYW5pbWF0aW9ucyB0byBmaXJlLlxuICpcbiAqIFRoaXMgZXhhbXBsZSBjYW4gYmUgZnVydGhlciBleHRlbmRlZCBieSB1c2luZyBzdGFnZ2VyOlxuICpcbiAqIGBgYHRzXG4gKiBxdWVyeSgnQGNoaWxkQW5pbWF0aW9uJywgc3RhZ2dlcigxMDAsIFtcbiAqICAgYW5pbWF0ZUNoaWxkKClcbiAqIF0pKVxuICogYGBgXG4gKlxuICogTm93IGVhY2ggb2YgdGhlIHN1YiBhbmltYXRpb25zIHN0YXJ0IG9mZiB3aXRoIHJlc3BlY3QgdG8gdGhlIGAxMDBtc2Agc3RhZ2dlcmluZyBzdGVwLlxuICpcbiAqICMjIFRoZSBmaXJzdCBmcmFtZSBvZiBjaGlsZCBhbmltYXRpb25zXG4gKiBXaGVuIHN1YiBhbmltYXRpb25zIGFyZSBleGVjdXRlZCB1c2luZyBgYW5pbWF0ZUNoaWxkYCB0aGUgYW5pbWF0aW9uIGVuZ2luZSB3aWxsIGFsd2F5cyBhcHBseSB0aGVcbiAqIGZpcnN0IGZyYW1lIG9mIGV2ZXJ5IHN1YiBhbmltYXRpb24gaW1tZWRpYXRlbHkgYXQgdGhlIHN0YXJ0IG9mIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuIFRoaXMgd2F5XG4gKiB0aGUgcGFyZW50IGFuaW1hdGlvbiBkb2VzIG5vdCBuZWVkIHRvIHNldCBhbnkgaW5pdGlhbCBzdHlsaW5nIGRhdGEgb24gdGhlIHN1YiBlbGVtZW50cyBiZWZvcmUgdGhlXG4gKiBzdWIgYW5pbWF0aW9ucyBraWNrIG9mZi5cbiAqXG4gKiBJbiB0aGUgZXhhbXBsZSBhYm92ZSB0aGUgZmlyc3QgZnJhbWUgb2YgdGhlIGBjaGlsZEFuaW1hdGlvbmAncyBgZmFsc2UgPT4gdHJ1ZWAgdHJhbnNpdGlvblxuICogY29uc2lzdHMgb2YgYSBzdHlsZSBvZiBgb3BhY2l0eTogMGAuIFRoaXMgaXMgYXBwbGllZCBpbW1lZGlhdGVseSB3aGVuIHRoZSBgcGFyZW50QW5pbWF0aW9uYFxuICogYW5pbWF0aW9uIHRyYW5zaXRpb24gc2VxdWVuY2Ugc3RhcnRzLiBPbmx5IHRoZW4gd2hlbiB0aGUgYEBjaGlsZEFuaW1hdGlvbmAgaXMgcXVlcmllZCBhbmQgY2FsbGVkXG4gKiB3aXRoIGBhbmltYXRlQ2hpbGRgIHdpbGwgaXQgdGhlbiBhbmltYXRlIHRvIGl0cyBkZXN0aW5hdGlvbiBvZiBgb3BhY2l0eTogMWAuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgZmVhdHVyZSBkZXNpZ25lZCB0byBiZSB1c2VkIGFsb25nc2lkZSB7QGxpbmsgcXVlcnkgcXVlcnkoKX0gYW5kIGl0IHdpbGwgb25seSB3b3JrXG4gKiB3aXRoIGFuaW1hdGlvbnMgdGhhdCBhcmUgYXNzaWduZWQgdXNpbmcgdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIERTTCAodGhpcyBtZWFucyB0aGF0IENTUyBrZXlmcmFtZXNcbiAqIGFuZCB0cmFuc2l0aW9ucyBhcmUgbm90IGhhbmRsZWQgYnkgdGhpcyBBUEkpLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZUNoaWxkKG9wdGlvbnM6IEFuaW1hdGVDaGlsZE9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uQW5pbWF0ZUNoaWxkTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlQ2hpbGQsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGB1c2VBbmltYXRpb25gIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSXQgaXMgdXNlZCB0byBraWNrIG9mZiBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGlzIGNyZWF0ZWQgdXNpbmcge0BsaW5rXG4gKiBhbmltYXRpb24gYW5pbWF0aW9uKCl9LlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQW5pbWF0aW9uKFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEsXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uQW5pbWF0ZVJlZk1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZVJlZiwgYW5pbWF0aW9uLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgcXVlcnlgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS5cbiAqXG4gKiBxdWVyeSgpIGlzIHVzZWQgdG8gZmluZCBvbmUgb3IgbW9yZSBpbm5lciBlbGVtZW50cyB3aXRoaW4gdGhlIGN1cnJlbnQgZWxlbWVudCB0aGF0IGlzXG4gKiBiZWluZyBhbmltYXRlZCB3aXRoaW4gdGhlIHNlcXVlbmNlLiBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHN0ZXBzIGFyZSBhcHBsaWVkXG4gKiB0byB0aGUgcXVlcmllZCBlbGVtZW50IChieSBkZWZhdWx0LCBhbiBhcnJheSBpcyBwcm92aWRlZCwgdGhlbiB0aGlzIHdpbGwgYmVcbiAqIHRyZWF0ZWQgYXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlKS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBxdWVyeSgpIGlzIGRlc2lnbmVkIHRvIGNvbGxlY3QgbXVsdGlwbGUgZWxlbWVudHMgYW5kIHdvcmtzIGludGVybmFsbHkgYnkgdXNpbmdcbiAqIGBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGxgLiBBbiBhZGRpdGlvbmFsIG9wdGlvbnMgb2JqZWN0IGNhbiBiZSBwcm92aWRlZCB3aGljaFxuICogY2FuIGJlIHVzZWQgdG8gbGltaXQgdGhlIHRvdGFsIGFtb3VudCBvZiBpdGVtcyB0byBiZSBjb2xsZWN0ZWQuXG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCdkaXYnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IGxpbWl0OiAxIH0pXG4gKiBgYGBcbiAqXG4gKiBxdWVyeSgpLCBieSBkZWZhdWx0LCB3aWxsIHRocm93IGFuIGVycm9yIHdoZW4gemVybyBpdGVtcyBhcmUgZm91bmQuIElmIGEgcXVlcnlcbiAqIGhhcyB0aGUgYG9wdGlvbmFsYCBmbGFnIHNldCB0byB0cnVlIHRoZW4gdGhpcyBlcnJvciB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogYGBganNcbiAqIHF1ZXJ5KCcuc29tZS1lbGVtZW50LXRoYXQtbWF5LW5vdC1iZS10aGVyZScsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgb3B0aW9uYWw6IHRydWUgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBTcGVjaWFsIFNlbGVjdG9yIFZhbHVlc1xuICpcbiAqIFRoZSBzZWxlY3RvciB2YWx1ZSB3aXRoaW4gYSBxdWVyeSBjYW4gY29sbGVjdCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW5ndWxhci1zcGVjaWZpY1xuICogY2hhcmFjdGVyaXN0aWNzXG4gKiB1c2luZyBzcGVjaWFsIHBzZXVkby1zZWxlY3RvcnMgdG9rZW5zLlxuICpcbiAqIFRoZXNlIGluY2x1ZGU6XG4gKlxuICogIC0gUXVlcnlpbmcgZm9yIG5ld2x5IGluc2VydGVkL3JlbW92ZWQgZWxlbWVudHMgdXNpbmcgYHF1ZXJ5KFwiOmVudGVyXCIpYC9gcXVlcnkoXCI6bGVhdmVcIilgXG4gKiAgLSBRdWVyeWluZyBhbGwgY3VycmVudGx5IGFuaW1hdGluZyBlbGVtZW50cyB1c2luZyBgcXVlcnkoXCI6YW5pbWF0aW5nXCIpYFxuICogIC0gUXVlcnlpbmcgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHVzaW5nIGBxdWVyeShcIkB0cmlnZ2VyTmFtZVwiKWBcbiAqICAtIFF1ZXJ5aW5nIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXJzIHVzaW5nIGBxdWVyeShcIkAqXCIpYFxuICogIC0gSW5jbHVkaW5nIHRoZSBjdXJyZW50IGVsZW1lbnQgaW50byB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlIHVzaW5nIGBxdWVyeShcIjpzZWxmXCIpYFxuICpcbiAqXG4gKiAgRWFjaCBvZiB0aGVzZSBwc2V1ZG8tc2VsZWN0b3IgdG9rZW5zIGNhbiBiZSBtZXJnZWQgdG9nZXRoZXIgaW50byBhIGNvbWJpbmVkIHF1ZXJ5IHNlbGVjdG9yXG4gKiBzdHJpbmc6XG4gKlxuICogIGBgYFxuICogIHF1ZXJ5KCc6c2VsZiwgLnJlY29yZDplbnRlciwgLnJlY29yZDpsZWF2ZSwgQHN1YlRyaWdnZXInLCBbLi4uXSlcbiAqICBgYGBcbiAqXG4gKiAjIyMgRGVtb1xuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaW5uZXInLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXYgW0BxdWVyeUFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIDxoMT5UaXRsZTwvaDE+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICogICAgICAgICBCbGFoIGJsYWggYmxhaFxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgIHRyaWdnZXIoJ3F1ZXJ5QW5pbWF0aW9uJywgW1xuICogICAgICB0cmFuc2l0aW9uKCcqID0+IGdvQW5pbWF0ZScsIFtcbiAqICAgICAgICAvLyBoaWRlIHRoZSBpbm5lciBlbGVtZW50c1xuICogICAgICAgIHF1ZXJ5KCdoMScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50Jywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqXG4gKiAgICAgICAgLy8gYW5pbWF0ZSB0aGUgaW5uZXIgZWxlbWVudHMgaW4sIG9uZSBieSBvbmVcbiAqICAgICAgICBxdWVyeSgnaDEnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgICAgcXVlcnkoJy5jb250ZW50JywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICBdKVxuICogICAgXSlcbiAqICBdXG4gKiB9KVxuICogY2xhc3MgQ21wIHtcbiAqICAgZXhwID0gJyc7XG4gKlxuICogICBnb0FuaW1hdGUoKSB7XG4gKiAgICAgdGhpcy5leHAgPSAnZ29BbmltYXRlJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5RdWVyeSwgc2VsZWN0b3IsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHN0YWdnZXJgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgYW4gYW5pbWF0aW9uIHtAbGluayBxdWVyeSBxdWVyeSgpfVxuICogYW5kIHdvcmtzIGJ5IGlzc3VpbmcgYSB0aW1pbmcgZ2FwIGJldHdlZW4gYWZ0ZXIgZWFjaCBxdWVyaWVkIGl0ZW0gaXMgYW5pbWF0ZWQuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogSW4gdGhlIGV4YW1wbGUgYmVsb3cgdGhlcmUgaXMgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIGEgbGlzdCBvZiBpdGVtcyBzdGFtcGVkIG91dFxuICogYnkgYW4gbmdGb3IuIFRoZSBjb250YWluZXIgZWxlbWVudCBjb250YWlucyBhbiBhbmltYXRpb24gdHJpZ2dlciB0aGF0IHdpbGwgbGF0ZXIgYmUgc2V0XG4gKiB0byBxdWVyeSBmb3IgZWFjaCBvZiB0aGUgaW5uZXIgaXRlbXMuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBsaXN0LmNvbXBvbmVudC5odG1sIC0tPlxuICogPGJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlKClcIj5TaG93IC8gSGlkZSBJdGVtczwvYnV0dG9uPlxuICogPGhyIC8+XG4gKiA8ZGl2IFtAbGlzdEFuaW1hdGlvbl09XCJpdGVtcy5sZW5ndGhcIj5cbiAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtc1wiPlxuICogICAgIHt7IGl0ZW0gfX1cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFRoZSBjb21wb25lbnQgY29kZSBmb3IgdGhpcyBsb29rcyBhcyBzdWNoOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge3RyaWdnZXIsIHRyYW5zaXRpb24sIHN0eWxlLCBhbmltYXRlLCBxdWVyeSwgc3RhZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgdGVtcGxhdGVVcmw6ICdsaXN0LmNvbXBvbmVudC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgICAgICAgLy8uLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTGlzdENvbXBvbmVudCB7XG4gKiAgIGl0ZW1zID0gW107XG4gKlxuICogICBzaG93SXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFswLDEsMiwzLDRdO1xuICogICB9XG4gKlxuICogICBoaWRlSXRlbXMoKSB7XG4gKiAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICogICB9XG4gKlxuICogICB0b2dnbGUoKSB7XG4gKiAgICAgdGhpcy5pdGVtcy5sZW5ndGggPyB0aGlzLmhpZGVJdGVtcygpIDogdGhpcy5zaG93SXRlbXMoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQW5kIG5vdyBmb3IgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIGNvZGU6XG4gKlxuICogYGBgdHNcbiAqIHRyaWdnZXIoJ2xpc3RBbmltYXRpb24nLCBbXG4gKiAgIHRyYW5zaXRpb24oJyogPT4gKicsIFsgLy8gZWFjaCB0aW1lIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXNcbiAqICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF0pXG4gKiBdKVxuICogYGBgXG4gKlxuICogTm93IGVhY2ggdGltZSB0aGUgaXRlbXMgYXJlIGFkZGVkL3JlbW92ZWQgdGhlbiBlaXRoZXIgdGhlIG9wYWNpdHlcbiAqIGZhZGUtaW4gYW5pbWF0aW9uIHdpbGwgcnVuIG9yIGVhY2ggcmVtb3ZlZCBpdGVtIHdpbGwgYmUgZmFkZWQgb3V0LlxuICogV2hlbiBlaXRoZXIgb2YgdGhlc2UgYW5pbWF0aW9ucyBvY2N1ciB0aGVuIGEgc3RhZ2dlciBlZmZlY3Qgd2lsbCBiZVxuICogYXBwbGllZCBhZnRlciBlYWNoIGl0ZW0ncyBhbmltYXRpb24gaXMgc3RhcnRlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdnZXIoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhZ2dlciwgdGltaW5ncywgYW5pbWF0aW9ufTtcbn1cbiJdfQ==