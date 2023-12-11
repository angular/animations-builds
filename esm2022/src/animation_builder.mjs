/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { ANIMATION_MODULE_TYPE, Inject, inject, Injectable, RendererFactory2, ViewEncapsulation, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { sequence } from './animation_metadata';
import * as i0 from "@angular/core";
/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
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
 * @publicApi
 */
export class AnimationBuilder {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: AnimationBuilder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: AnimationBuilder, providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: AnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder) }]
        }] });
/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 */
export class AnimationFactory {
}
export class BrowserAnimationBuilder extends AnimationBuilder {
    constructor(rootRenderer, doc) {
        super();
        this.animationModuleType = inject(ANIMATION_MODULE_TYPE, { optional: true });
        this._nextAnimationId = 0;
        const typeData = {
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] },
        };
        this._renderer = rootRenderer.createRenderer(doc.body, typeData);
        if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
            // We only support AnimationRenderer & DynamicDelegationRenderer for this AnimationBuilder
            throw new RuntimeError(3600 /* RuntimeErrorCode.BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' +
                    'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.');
        }
    }
    build(animation) {
        const id = this._nextAnimationId;
        this._nextAnimationId++;
        const entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: BrowserAnimationBuilder, deps: [{ token: i0.RendererFactory2 }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: BrowserAnimationBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6+sha-17610fa", ngImport: i0, type: BrowserAnimationBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
class BrowserAnimationFactory extends AnimationFactory {
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
class RendererAnimationPlayer {
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    _command(command, ...args) {
        issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    onDone(fn) {
        this._listen('done', fn);
    }
    onStart(fn) {
        this._listen('start', fn);
    }
    onDestroy(fn) {
        this._listen('destroy', fn);
    }
    init() {
        this._command('init');
    }
    hasStarted() {
        return this._started;
    }
    play() {
        this._command('play');
        this._started = true;
    }
    pause() {
        this._command('pause');
    }
    restart() {
        this._command('restart');
    }
    finish() {
        this._command('finish');
    }
    destroy() {
        this._command('destroy');
    }
    reset() {
        this._command('reset');
        this._started = false;
    }
    setPosition(p) {
        this._command('setPosition', p);
    }
    getPosition() {
        return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
    }
}
function issueAnimationCommand(renderer, element, id, command, args) {
    renderer.setProperty(element, `@@${id}:${command}`, args);
}
/**
 * The following 2 methods cannot reference their correct types (AnimationRenderer &
 * DynamicDelegationRenderer) since this would introduce a import cycle.
 */
function unwrapAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    if (type === 0 /* AnimationRendererType.Regular */) {
        return renderer;
    }
    else if (type === 1 /* AnimationRendererType.Delegated */) {
        return renderer.animationRenderer;
    }
    return null;
}
function isAnimationRenderer(renderer) {
    const type = renderer.ɵtype;
    return type === 0 /* AnimationRendererType.Regular */ || type === 1 /* AnimationRendererType.Delegated */;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL3NyYy9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFhLGdCQUFnQixFQUFpQixpQkFBaUIsRUFBbUQsYUFBYSxJQUFJLFlBQVksR0FBRSxNQUFNLGVBQWUsQ0FBQztBQUVoTyxPQUFPLEVBQXNDLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDOztBQUluRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkNHO0FBRUgsTUFBTSxPQUFnQixnQkFBZ0I7eUhBQWhCLGdCQUFnQjs2SEFBaEIsZ0JBQWdCLGNBRGIsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQzs7c0dBQzVELGdCQUFnQjtrQkFEckMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxFQUFDOztBQVduRjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQWdCLGdCQUFnQjtDQVdyQztBQUdELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7SUFLM0QsWUFBWSxZQUE4QixFQUFvQixHQUFhO1FBQ3pFLEtBQUssRUFBRSxDQUFDO1FBTEYsd0JBQW1CLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDdEUscUJBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBSzNCLE1BQU0sUUFBUSxHQUFrQjtZQUM5QixFQUFFLEVBQUUsR0FBRztZQUNQLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1lBQ3JDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLEVBQUUsRUFBQztTQUN0QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFakUsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdFLDBGQUEwRjtZQUUxRixNQUFNLElBQUksWUFBWSxvRkFFbEIsQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDO2dCQUMzQyxvR0FBb0c7b0JBQ2hHLDBJQUEwSSxDQUFDLENBQUM7U0FDeko7SUFDSCxDQUFDO0lBRVEsS0FBSyxDQUFDLFNBQWdEO1FBQzdELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN6RSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksdUJBQXVCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO3lIQWhDVSx1QkFBdUIsa0RBS2tCLFFBQVE7NkhBTGpELHVCQUF1QixjQURYLE1BQU07O3NHQUNsQix1QkFBdUI7a0JBRG5DLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFNZSxNQUFNOzJCQUFDLFFBQVE7O0FBOEI5RCxNQUFNLHVCQUF3QixTQUFRLGdCQUFnQjtJQUNwRCxZQUNZLEdBQVcsRUFDWCxTQUFvQjtRQUU5QixLQUFLLEVBQUUsQ0FBQztRQUhFLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFDWCxjQUFTLEdBQVQsU0FBUyxDQUFXO0lBR2hDLENBQUM7SUFFUSxNQUFNLENBQUMsT0FBWSxFQUFFLE9BQTBCO1FBQ3RELE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RixDQUFDO0NBQ0Y7QUFFRCxNQUFNLHVCQUF1QjtJQUkzQixZQUNXLEVBQVUsRUFDVixPQUFZLEVBQ25CLE9BQXlCLEVBQ2pCLFNBQW9CO1FBSHJCLE9BQUUsR0FBRixFQUFFLENBQVE7UUFDVixZQUFPLEdBQVAsT0FBTyxDQUFLO1FBRVgsY0FBUyxHQUFULFNBQVMsQ0FBVztRQVB6QixpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFDekMsYUFBUSxHQUFHLEtBQUssQ0FBQztRQXlFbEIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQWpFbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLE9BQU8sQ0FBQyxTQUFpQixFQUFFLFFBQTZCO1FBQzlELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLElBQUksU0FBUyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVPLFFBQVEsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQzlDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQWM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE9BQU8sQ0FBQyxFQUFjO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxTQUFTLENBQUMsRUFBYztRQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxDQUFTO1FBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FHRjtBQUVELFNBQVMscUJBQXFCLENBQzFCLFFBQW1CLEVBQ25CLE9BQVksRUFDWixFQUFVLEVBQ1YsT0FBZSxFQUNmLElBQVc7SUFFYixRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7OztHQUdHO0FBRUgsU0FBUyx1QkFBdUIsQ0FDNUIsUUFBbUI7SUFFckIsTUFBTSxJQUFJLEdBQUksUUFBc0QsQ0FBQyxLQUFLLENBQUM7SUFDM0UsSUFBSSxJQUFJLDBDQUFrQyxFQUFFO1FBQzFDLE9BQU8sUUFBZSxDQUFDO0tBQ3hCO1NBQU0sSUFBSSxJQUFJLDRDQUFvQyxFQUFFO1FBQ25ELE9BQVEsUUFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQztLQUM1QztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsUUFBbUI7SUFDOUMsTUFBTSxJQUFJLEdBQUksUUFBc0QsQ0FBQyxLQUFLLENBQUM7SUFDM0UsT0FBTyxJQUFJLDBDQUFrQyxJQUFJLElBQUksNENBQW9DLENBQUM7QUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFLCBJbmplY3QsIGluamVjdCwgSW5qZWN0YWJsZSwgUmVuZGVyZXIyLCBSZW5kZXJlckZhY3RvcnkyLCBSZW5kZXJlclR5cGUyLCBWaWV3RW5jYXBzdWxhdGlvbiwgybVBbmltYXRpb25SZW5kZXJlclR5cGUgYXMgQW5pbWF0aW9uUmVuZGVyZXJUeXBlLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uT3B0aW9ucywgc2VxdWVuY2V9IGZyb20gJy4vYW5pbWF0aW9uX21ldGFkYXRhJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXJ9IGZyb20gJy4vcGxheWVycy9hbmltYXRpb25fcGxheWVyJztcblxuLyoqXG4gKiBBbiBpbmplY3RhYmxlIHNlcnZpY2UgdGhhdCBwcm9kdWNlcyBhbiBhbmltYXRpb24gc2VxdWVuY2UgcHJvZ3JhbW1hdGljYWxseSB3aXRoaW4gYW5cbiAqIEFuZ3VsYXIgY29tcG9uZW50IG9yIGRpcmVjdGl2ZS5cbiAqIFByb3ZpZGVkIGJ5IHRoZSBgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVgIG9yIGBOb29wQW5pbWF0aW9uc01vZHVsZWAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUbyB1c2UgdGhpcyBzZXJ2aWNlLCBhZGQgaXQgdG8geW91ciBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGFzIGEgZGVwZW5kZW5jeS5cbiAqIFRoZSBzZXJ2aWNlIGlzIGluc3RhbnRpYXRlZCBhbG9uZyB3aXRoIHlvdXIgY29tcG9uZW50LlxuICpcbiAqIEFwcHMgZG8gbm90IHR5cGljYWxseSBuZWVkIHRvIGNyZWF0ZSB0aGVpciBvd24gYW5pbWF0aW9uIHBsYXllcnMsIGJ1dCBpZiB5b3VcbiAqIGRvIG5lZWQgdG8sIGZvbGxvdyB0aGVzZSBzdGVwczpcbiAqXG4gKiAxLiBVc2UgdGhlIDxjb2RlPltBbmltYXRpb25CdWlsZGVyLmJ1aWxkXShhcGkvYW5pbWF0aW9ucy9BbmltYXRpb25CdWlsZGVyI2J1aWxkKSgpPC9jb2RlPiBtZXRob2RcbiAqIHRvIGNyZWF0ZSBhIHByb2dyYW1tYXRpYyBhbmltYXRpb24uIFRoZSBtZXRob2QgcmV0dXJucyBhbiBgQW5pbWF0aW9uRmFjdG9yeWAgaW5zdGFuY2UuXG4gKlxuICogMi4gVXNlIHRoZSBmYWN0b3J5IG9iamVjdCB0byBjcmVhdGUgYW4gYEFuaW1hdGlvblBsYXllcmAgYW5kIGF0dGFjaCBpdCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIDMuIFVzZSB0aGUgcGxheWVyIG9iamVjdCB0byBjb250cm9sIHRoZSBhbmltYXRpb24gcHJvZ3JhbW1hdGljYWxseS5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogLy8gaW1wb3J0IHRoZSBzZXJ2aWNlIGZyb20gQnJvd3NlckFuaW1hdGlvbnNNb2R1bGVcbiAqIGltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiAvLyByZXF1aXJlIHRoZSBzZXJ2aWNlIGFzIGEgZGVwZW5kZW5jeVxuICogY2xhc3MgTXlDbXAge1xuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9idWlsZGVyOiBBbmltYXRpb25CdWlsZGVyKSB7fVxuICpcbiAqICAgbWFrZUFuaW1hdGlvbihlbGVtZW50OiBhbnkpIHtcbiAqICAgICAvLyBmaXJzdCBkZWZpbmUgYSByZXVzYWJsZSBhbmltYXRpb25cbiAqICAgICBjb25zdCBteUFuaW1hdGlvbiA9IHRoaXMuX2J1aWxkZXIuYnVpbGQoW1xuICogICAgICAgc3R5bGUoeyB3aWR0aDogMCB9KSxcbiAqICAgICAgIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyB3aWR0aDogJzEwMHB4JyB9KSlcbiAqICAgICBdKTtcbiAqXG4gKiAgICAgLy8gdXNlIHRoZSByZXR1cm5lZCBmYWN0b3J5IG9iamVjdCB0byBjcmVhdGUgYSBwbGF5ZXJcbiAqICAgICBjb25zdCBwbGF5ZXIgPSBteUFuaW1hdGlvbi5jcmVhdGUoZWxlbWVudCk7XG4gKlxuICogICAgIHBsYXllci5wbGF5KCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogKCkgPT4gaW5qZWN0KEJyb3dzZXJBbmltYXRpb25CdWlsZGVyKX0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBCdWlsZHMgYSBmYWN0b3J5IGZvciBwcm9kdWNpbmcgYSBkZWZpbmVkIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIGFuaW1hdGlvbiBBIHJldXNhYmxlIGFuaW1hdGlvbiBkZWZpbml0aW9uLlxuICAgKiBAcmV0dXJucyBBIGZhY3Rvcnkgb2JqZWN0IHRoYXQgY2FuIGNyZWF0ZSBhIHBsYXllciBmb3IgdGhlIGRlZmluZWQgYW5pbWF0aW9uLlxuICAgKiBAc2VlIHtAbGluayBhbmltYXRlfVxuICAgKi9cbiAgYWJzdHJhY3QgYnVpbGQoYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBBIGZhY3Rvcnkgb2JqZWN0IHJldHVybmVkIGZyb20gdGhlXG4gKiA8Y29kZT5bQW5pbWF0aW9uQnVpbGRlci5idWlsZF0oYXBpL2FuaW1hdGlvbnMvQW5pbWF0aW9uQnVpbGRlciNidWlsZCkoKTwvY29kZT5cbiAqIG1ldGhvZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbmltYXRpb25GYWN0b3J5IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYEFuaW1hdGlvblBsYXllcmAgaW5zdGFuY2UgZm9yIHRoZSByZXVzYWJsZSBhbmltYXRpb24gZGVmaW5lZCBieVxuICAgKiB0aGUgPGNvZGU+W0FuaW1hdGlvbkJ1aWxkZXIuYnVpbGRdKGFwaS9hbmltYXRpb25zL0FuaW1hdGlvbkJ1aWxkZXIjYnVpbGQpKCk8L2NvZGU+XG4gICAqIG1ldGhvZCB0aGF0IGNyZWF0ZWQgdGhpcyBmYWN0b3J5IGFuZCBhdHRhY2hlcyB0aGUgbmV3IHBsYXllciBhIERPTSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgRE9NIGVsZW1lbnQgdG8gd2hpY2ggdG8gYXR0YWNoIHRoZSBwbGF5ZXIuXG4gICAqIEBwYXJhbSBvcHRpb25zIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjYW4gaW5jbHVkZSBhIHRpbWUgZGVsYXkgYW5kXG4gICAqIGFkZGl0aW9uYWwgZGV2ZWxvcGVyLWRlZmluZWQgcGFyYW1ldGVycy5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZShlbGVtZW50OiBhbnksIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uUGxheWVyO1xufVxuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBCcm93c2VyQW5pbWF0aW9uQnVpbGRlciBleHRlbmRzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICBwcml2YXRlIGFuaW1hdGlvbk1vZHVsZVR5cGUgPSBpbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFLCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgcHJpdmF0ZSBfbmV4dEFuaW1hdGlvbklkID0gMDtcbiAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMjtcblxuICBjb25zdHJ1Y3Rvcihyb290UmVuZGVyZXI6IFJlbmRlcmVyRmFjdG9yeTIsIEBJbmplY3QoRE9DVU1FTlQpIGRvYzogRG9jdW1lbnQpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IHR5cGVEYXRhOiBSZW5kZXJlclR5cGUyID0ge1xuICAgICAgaWQ6ICcwJyxcbiAgICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgICBzdHlsZXM6IFtdLFxuICAgICAgZGF0YToge2FuaW1hdGlvbjogW119LFxuICAgIH07XG4gICAgdGhpcy5fcmVuZGVyZXIgPSByb290UmVuZGVyZXIuY3JlYXRlUmVuZGVyZXIoZG9jLmJvZHksIHR5cGVEYXRhKTtcblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbk1vZHVsZVR5cGUgPT09IG51bGwgJiYgIWlzQW5pbWF0aW9uUmVuZGVyZXIodGhpcy5fcmVuZGVyZXIpKSB7XG4gICAgICAvLyBXZSBvbmx5IHN1cHBvcnQgQW5pbWF0aW9uUmVuZGVyZXIgJiBEeW5hbWljRGVsZWdhdGlvblJlbmRlcmVyIGZvciB0aGlzIEFuaW1hdGlvbkJ1aWxkZXJcblxuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLkJST1dTRVJfQU5JTUFUSU9OX0JVSUxERVJfSU5KRUNURURfV0lUSE9VVF9BTklNQVRJT05TLFxuICAgICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgdGhlIGBBbmltYXRpb25CdWlsZGVyYCB3YXMgaW5qZWN0ZWQsIGJ1dCBhbmltYXRpb24gc3VwcG9ydCB3YXMgbm90IGVuYWJsZWQuICcgK1xuICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBtYWtlIHN1cmUgdGhhdCB5b3UgZW5hYmxlIGFuaW1hdGlvbnMgaW4geW91ciBhcHBsaWNhdGlvbiBieSBjYWxsaW5nIGBwcm92aWRlQW5pbWF0aW9ucygpYCBvciBgcHJvdmlkZUFuaW1hdGlvbnNBc3luYygpYCBmdW5jdGlvbi4nKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBidWlsZChhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25GYWN0b3J5IHtcbiAgICBjb25zdCBpZCA9IHRoaXMuX25leHRBbmltYXRpb25JZDtcbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uSWQrKztcbiAgICBjb25zdCBlbnRyeSA9IEFycmF5LmlzQXJyYXkoYW5pbWF0aW9uKSA/IHNlcXVlbmNlKGFuaW1hdGlvbikgOiBhbmltYXRpb247XG4gICAgaXNzdWVBbmltYXRpb25Db21tYW5kKHRoaXMuX3JlbmRlcmVyLCBudWxsLCBpZCwgJ3JlZ2lzdGVyJywgW2VudHJ5XSk7XG4gICAgcmV0dXJuIG5ldyBCcm93c2VyQW5pbWF0aW9uRmFjdG9yeShpZCwgdGhpcy5fcmVuZGVyZXIpO1xuICB9XG59XG5cbmNsYXNzIEJyb3dzZXJBbmltYXRpb25GYWN0b3J5IGV4dGVuZHMgQW5pbWF0aW9uRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfaWQ6IG51bWJlcixcbiAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSBjcmVhdGUoZWxlbWVudDogYW55LCBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgcmV0dXJuIG5ldyBSZW5kZXJlckFuaW1hdGlvblBsYXllcih0aGlzLl9pZCwgZWxlbWVudCwgb3B0aW9ucyB8fCB7fSwgdGhpcy5fcmVuZGVyZXIpO1xuICB9XG59XG5cbmNsYXNzIFJlbmRlcmVyQW5pbWF0aW9uUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaWQ6IG51bWJlcixcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBhbnksXG4gICAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zLFxuICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgKSB7XG4gICAgdGhpcy5fY29tbWFuZCgnY3JlYXRlJywgb3B0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogKCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVyLmxpc3Rlbih0aGlzLmVsZW1lbnQsIGBAQCR7dGhpcy5pZH06JHtldmVudE5hbWV9YCwgY2FsbGJhY2spO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWFuZChjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaXNzdWVBbmltYXRpb25Db21tYW5kKHRoaXMuX3JlbmRlcmVyLCB0aGlzLmVsZW1lbnQsIHRoaXMuaWQsIGNvbW1hbmQsIGFyZ3MpO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuKCdkb25lJywgZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2xpc3Rlbignc3RhcnQnLCBmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW4oJ2Rlc3Ryb3knLCBmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ2luaXQnKTtcbiAgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7XG4gIH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3BsYXknKTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3BhdXNlJyk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmQoJ3Jlc3RhcnQnKTtcbiAgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdmaW5pc2gnKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgnZGVzdHJveScpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgncmVzZXQnKTtcbiAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kKCdzZXRQb3NpdGlvbicsIHApO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdW53cmFwQW5pbWF0aW9uUmVuZGVyZXIodGhpcy5fcmVuZGVyZXIpPy5lbmdpbmU/LnBsYXllcnNbdGhpcy5pZF0/LmdldFBvc2l0aW9uKCkgPz8gMDtcbiAgfVxuXG4gIHB1YmxpYyB0b3RhbFRpbWUgPSAwO1xufVxuXG5mdW5jdGlvbiBpc3N1ZUFuaW1hdGlvbkNvbW1hbmQoXG4gICAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBlbGVtZW50OiBhbnksXG4gICAgaWQ6IG51bWJlcixcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogYW55W10sXG4gICAgKTogdm9pZCB7XG4gIHJlbmRlcmVyLnNldFByb3BlcnR5KGVsZW1lbnQsIGBAQCR7aWR9OiR7Y29tbWFuZH1gLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBUaGUgZm9sbG93aW5nIDIgbWV0aG9kcyBjYW5ub3QgcmVmZXJlbmNlIHRoZWlyIGNvcnJlY3QgdHlwZXMgKEFuaW1hdGlvblJlbmRlcmVyICZcbiAqIER5bmFtaWNEZWxlZ2F0aW9uUmVuZGVyZXIpIHNpbmNlIHRoaXMgd291bGQgaW50cm9kdWNlIGEgaW1wb3J0IGN5Y2xlLlxuICovXG5cbmZ1bmN0aW9uIHVud3JhcEFuaW1hdGlvblJlbmRlcmVyKFxuICAgIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgKToge2VuZ2luZToge3BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdfX18bnVsbCB7XG4gIGNvbnN0IHR5cGUgPSAocmVuZGVyZXIgYXMgdW5rbm93biBhcyB7ybV0eXBlOiBBbmltYXRpb25SZW5kZXJlclR5cGV9KS7JtXR5cGU7XG4gIGlmICh0eXBlID09PSBBbmltYXRpb25SZW5kZXJlclR5cGUuUmVndWxhcikge1xuICAgIHJldHVybiByZW5kZXJlciBhcyBhbnk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gQW5pbWF0aW9uUmVuZGVyZXJUeXBlLkRlbGVnYXRlZCkge1xuICAgIHJldHVybiAocmVuZGVyZXIgYXMgYW55KS5hbmltYXRpb25SZW5kZXJlcjtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0FuaW1hdGlvblJlbmRlcmVyKHJlbmRlcmVyOiBSZW5kZXJlcjIpOiBib29sZWFuIHtcbiAgY29uc3QgdHlwZSA9IChyZW5kZXJlciBhcyB1bmtub3duIGFzIHvJtXR5cGU6IEFuaW1hdGlvblJlbmRlcmVyVHlwZX0pLsm1dHlwZTtcbiAgcmV0dXJuIHR5cGUgPT09IEFuaW1hdGlvblJlbmRlcmVyVHlwZS5SZWd1bGFyIHx8IHR5cGUgPT09IEFuaW1hdGlvblJlbmRlcmVyVHlwZS5EZWxlZ2F0ZWQ7XG59XG4iXX0=