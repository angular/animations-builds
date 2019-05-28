/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * \@usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the `build()` method to create a programmatic animation using the
 * `animate()` function. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '\@angular/animations';
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
 * \@publicApi
 * @abstract
 */
export class AnimationBuilder {
}
if (false) {
    /**
     * Builds a factory for producing a defined animation.
     * @see `animate()`
     * @abstract
     * @param {?} animation A reusable animation definition.
     * @return {?} A factory object that can create a player for the defined animation.
     */
    AnimationBuilder.prototype.build = function (animation) { };
}
/**
 * A factory object returned from the `AnimationBuilder`.`build()` method.
 *
 * \@publicApi
 * @abstract
 */
export class AnimationFactory {
}
if (false) {
    /**
     * Creates an `AnimationPlayer` instance for the reusable animation defined by
     * the `AnimationBuilder`.`build()` method that created this factory.
     * Attaches the new player a DOM element.
     * @abstract
     * @param {?} element The DOM element to which to attach the animation.
     * @param {?=} options A set of options that can include a time delay and
     * additional developer-defined parameters.
     * @return {?}
     */
    AnimationFactory.prototype.create = function (element, options) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL3NyYy9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3REEsTUFBTSxPQUFnQixnQkFBZ0I7Q0FRckM7Ozs7Ozs7OztJQURDLDREQUFtRjs7Ozs7Ozs7QUFRckYsTUFBTSxPQUFnQixnQkFBZ0I7Q0FVckM7Ozs7Ozs7Ozs7OztJQURDLG9FQUEyRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvbk9wdGlvbnN9IGZyb20gJy4vYW5pbWF0aW9uX21ldGFkYXRhJztcbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyfSBmcm9tICcuL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllcic7XG5cbi8qKlxuICogQW4gaW5qZWN0YWJsZSBzZXJ2aWNlIHRoYXQgcHJvZHVjZXMgYW4gYW5pbWF0aW9uIHNlcXVlbmNlIHByb2dyYW1tYXRpY2FsbHkgd2l0aGluIGFuXG4gKiBBbmd1bGFyIGNvbXBvbmVudCBvciBkaXJlY3RpdmUuXG4gKiBQcm92aWRlZCBieSB0aGUgYEJyb3dzZXJBbmltYXRpb25zTW9kdWxlYCBvciBgTm9vcEFuaW1hdGlvbnNNb2R1bGVgLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoaXMgc2VydmljZSwgYWRkIGl0IHRvIHlvdXIgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBhcyBhIGRlcGVuZGVuY3kuXG4gKiBUaGUgc2VydmljZSBpcyBpbnN0YW50aWF0ZWQgYWxvbmcgd2l0aCB5b3VyIGNvbXBvbmVudC5cbiAqXG4gKiBBcHBzIGRvIG5vdCB0eXBpY2FsbHkgbmVlZCB0byBjcmVhdGUgdGhlaXIgb3duIGFuaW1hdGlvbiBwbGF5ZXJzLCBidXQgaWYgeW91XG4gKiBkbyBuZWVkIHRvLCBmb2xsb3cgdGhlc2Ugc3RlcHM6XG4gKlxuICogMS4gVXNlIHRoZSBgYnVpbGQoKWAgbWV0aG9kIHRvIGNyZWF0ZSBhIHByb2dyYW1tYXRpYyBhbmltYXRpb24gdXNpbmcgdGhlXG4gKiBgYW5pbWF0ZSgpYCBmdW5jdGlvbi4gVGhlIG1ldGhvZCByZXR1cm5zIGFuIGBBbmltYXRpb25GYWN0b3J5YCBpbnN0YW5jZS5cbiAqXG4gKiAyLiBVc2UgdGhlIGZhY3Rvcnkgb2JqZWN0IHRvIGNyZWF0ZSBhbiBgQW5pbWF0aW9uUGxheWVyYCBhbmQgYXR0YWNoIGl0IHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogMy4gVXNlIHRoZSBwbGF5ZXIgb2JqZWN0IHRvIGNvbnRyb2wgdGhlIGFuaW1hdGlvbiBwcm9ncmFtbWF0aWNhbGx5LlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBpbXBvcnQgdGhlIHNlcnZpY2UgZnJvbSBCcm93c2VyQW5pbWF0aW9uc01vZHVsZVxuICogaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIC8vIHJlcXVpcmUgdGhlIHNlcnZpY2UgYXMgYSBkZXBlbmRlbmN5XG4gKiBjbGFzcyBNeUNtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2J1aWxkZXI6IEFuaW1hdGlvbkJ1aWxkZXIpIHt9XG4gKlxuICogICBtYWtlQW5pbWF0aW9uKGVsZW1lbnQ6IGFueSkge1xuICogICAgIC8vIGZpcnN0IGRlZmluZSBhIHJldXNhYmxlIGFuaW1hdGlvblxuICogICAgIGNvbnN0IG15QW5pbWF0aW9uID0gdGhpcy5fYnVpbGRlci5idWlsZChbXG4gKiAgICAgICBzdHlsZSh7IHdpZHRoOiAwIH0pLFxuICogICAgICAgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IHdpZHRoOiAnMTAwcHgnIH0pKVxuICogICAgIF0pO1xuICpcbiAqICAgICAvLyB1c2UgdGhlIHJldHVybmVkIGZhY3Rvcnkgb2JqZWN0IHRvIGNyZWF0ZSBhIHBsYXllclxuICogICAgIGNvbnN0IHBsYXllciA9IG15QW5pbWF0aW9uLmNyZWF0ZShlbGVtZW50KTtcbiAqXG4gKiAgICAgcGxheWVyLnBsYXkoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBCdWlsZHMgYSBmYWN0b3J5IGZvciBwcm9kdWNpbmcgYSBkZWZpbmVkIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIGFuaW1hdGlvbiBBIHJldXNhYmxlIGFuaW1hdGlvbiBkZWZpbml0aW9uLlxuICAgKiBAcmV0dXJucyBBIGZhY3Rvcnkgb2JqZWN0IHRoYXQgY2FuIGNyZWF0ZSBhIHBsYXllciBmb3IgdGhlIGRlZmluZWQgYW5pbWF0aW9uLlxuICAgKiBAc2VlIGBhbmltYXRlKClgXG4gICAqL1xuICBhYnN0cmFjdCBidWlsZChhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25GYWN0b3J5O1xufVxuXG4vKipcbiAqIEEgZmFjdG9yeSBvYmplY3QgcmV0dXJuZWQgZnJvbSB0aGUgYEFuaW1hdGlvbkJ1aWxkZXJgLmBidWlsZCgpYCBtZXRob2QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGBBbmltYXRpb25QbGF5ZXJgIGluc3RhbmNlIGZvciB0aGUgcmV1c2FibGUgYW5pbWF0aW9uIGRlZmluZWQgYnlcbiAgICogdGhlIGBBbmltYXRpb25CdWlsZGVyYC5gYnVpbGQoKWAgbWV0aG9kIHRoYXQgY3JlYXRlZCB0aGlzIGZhY3RvcnkuXG4gICAqIEF0dGFjaGVzIHRoZSBuZXcgcGxheWVyIGEgRE9NIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBET00gZWxlbWVudCB0byB3aGljaCB0byBhdHRhY2ggdGhlIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbnMgQSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNhbiBpbmNsdWRlIGEgdGltZSBkZWxheSBhbmRcbiAgICogYWRkaXRpb25hbCBkZXZlbG9wZXItZGVmaW5lZCBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlKGVsZW1lbnQ6IGFueSwgb3B0aW9ucz86IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb25QbGF5ZXI7XG59XG4iXX0=