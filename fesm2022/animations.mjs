/**
 * @license Angular v21.1.0-next.1+sha-14713d0
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { inject, Injectable, ANIMATION_MODULE_TYPE, ɵRuntimeError as _RuntimeError, DOCUMENT, Inject, ViewEncapsulation } from '@angular/core';
import { sequence } from './_private_export-chunk.mjs';
export { AUTO_STYLE, AnimationMetadataType, NoopAnimationPlayer, animate, animateChild, animation, group, keyframes, query, stagger, state, style, transition, trigger, useAnimation, AnimationGroupPlayer as ɵAnimationGroupPlayer, ɵPRE_STYLE } from './_private_export-chunk.mjs';

class AnimationBuilder {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.1+sha-14713d0",
    ngImport: i0,
    type: AnimationBuilder,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.1+sha-14713d0",
    ngImport: i0,
    type: AnimationBuilder,
    providedIn: 'root',
    useFactory: () => inject(BrowserAnimationBuilder)
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.1+sha-14713d0",
  ngImport: i0,
  type: AnimationBuilder,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root',
      useFactory: () => inject(BrowserAnimationBuilder)
    }]
  }]
});
class AnimationFactory {}
class BrowserAnimationBuilder extends AnimationBuilder {
  animationModuleType = inject(ANIMATION_MODULE_TYPE, {
    optional: true
  });
  _nextAnimationId = 0;
  _renderer;
  constructor(rootRenderer, doc) {
    super();
    const typeData = {
      id: '0',
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {
        animation: []
      }
    };
    this._renderer = rootRenderer.createRenderer(doc.body, typeData);
    if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
      throw new _RuntimeError(3600, (typeof ngDevMode === 'undefined' || ngDevMode) && 'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' + 'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.');
    }
  }
  build(animation) {
    const id = this._nextAnimationId;
    this._nextAnimationId++;
    const entry = Array.isArray(animation) ? sequence(animation) : animation;
    issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
    return new BrowserAnimationFactory(id, this._renderer);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.1+sha-14713d0",
    ngImport: i0,
    type: BrowserAnimationBuilder,
    deps: [{
      token: i0.RendererFactory2
    }, {
      token: DOCUMENT
    }],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.1+sha-14713d0",
    ngImport: i0,
    type: BrowserAnimationBuilder,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.1+sha-14713d0",
  ngImport: i0,
  type: BrowserAnimationBuilder,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => [{
    type: i0.RendererFactory2
  }, {
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }]
});
class BrowserAnimationFactory extends AnimationFactory {
  _id;
  _renderer;
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
  id;
  element;
  _renderer;
  parentPlayer = null;
  _started = false;
  constructor(id, element, options, _renderer) {
    this.id = id;
    this.element = element;
    this._renderer = _renderer;
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
  totalTime = 0;
}
function issueAnimationCommand(renderer, element, id, command, args) {
  renderer.setProperty(element, `@@${id}:${command}`, args);
}
function unwrapAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  if (type === 0) {
    return renderer;
  } else if (type === 1) {
    return renderer.animationRenderer;
  }
  return null;
}
function isAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  return type === 0 || type === 1;
}

export { AnimationBuilder, AnimationFactory, sequence, BrowserAnimationBuilder as ɵBrowserAnimationBuilder };
//# sourceMappingURL=animations.mjs.map
