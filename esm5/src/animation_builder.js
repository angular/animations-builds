/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * AnimationBuilder is an injectable service that is available when the {\@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {\@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '\@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {\@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {\@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
var /**
 * AnimationBuilder is an injectable service that is available when the {\@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {\@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '\@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {\@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {\@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
AnimationBuilder = /** @class */ (function () {
    function AnimationBuilder() {
    }
    return AnimationBuilder;
}());
/**
 * AnimationBuilder is an injectable service that is available when the {\@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {\@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '\@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {\@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {\@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
export { AnimationBuilder };
function AnimationBuilder_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} animation
     * @return {?}
     */
    AnimationBuilder.prototype.build = function (animation) { };
}
/**
 * An instance of `AnimationFactory` is returned from {\@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
var /**
 * An instance of `AnimationFactory` is returned from {\@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
AnimationFactory = /** @class */ (function () {
    function AnimationFactory() {
    }
    return AnimationFactory;
}());
/**
 * An instance of `AnimationFactory` is returned from {\@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * \@experimental Animation support is experimental.
 * @abstract
 */
export { AnimationFactory };
function AnimationFactory_tsickle_Closure_declarations() {
    /**
     * @abstract
     * @param {?} element
     * @param {?=} options
     * @return {?}
     */
    AnimationFactory.prototype.create = function (element, options) { };
}
//# sourceMappingURL=animation_builder.js.map