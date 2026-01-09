/**
 * @license Angular v21.0.8+sha-24fa4a2
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

var AnimationMetadataType;
(function (AnimationMetadataType) {
  AnimationMetadataType[AnimationMetadataType["State"] = 0] = "State";
  AnimationMetadataType[AnimationMetadataType["Transition"] = 1] = "Transition";
  AnimationMetadataType[AnimationMetadataType["Sequence"] = 2] = "Sequence";
  AnimationMetadataType[AnimationMetadataType["Group"] = 3] = "Group";
  AnimationMetadataType[AnimationMetadataType["Animate"] = 4] = "Animate";
  AnimationMetadataType[AnimationMetadataType["Keyframes"] = 5] = "Keyframes";
  AnimationMetadataType[AnimationMetadataType["Style"] = 6] = "Style";
  AnimationMetadataType[AnimationMetadataType["Trigger"] = 7] = "Trigger";
  AnimationMetadataType[AnimationMetadataType["Reference"] = 8] = "Reference";
  AnimationMetadataType[AnimationMetadataType["AnimateChild"] = 9] = "AnimateChild";
  AnimationMetadataType[AnimationMetadataType["AnimateRef"] = 10] = "AnimateRef";
  AnimationMetadataType[AnimationMetadataType["Query"] = 11] = "Query";
  AnimationMetadataType[AnimationMetadataType["Stagger"] = 12] = "Stagger";
})(AnimationMetadataType || (AnimationMetadataType = {}));
const AUTO_STYLE = '*';
function trigger(name, definitions) {
  return {
    type: AnimationMetadataType.Trigger,
    name,
    definitions,
    options: {}
  };
}
function animate(timings, styles = null) {
  return {
    type: AnimationMetadataType.Animate,
    styles,
    timings
  };
}
function group(steps, options = null) {
  return {
    type: AnimationMetadataType.Group,
    steps,
    options
  };
}
function sequence(steps, options = null) {
  return {
    type: AnimationMetadataType.Sequence,
    steps,
    options
  };
}
function style(tokens) {
  return {
    type: AnimationMetadataType.Style,
    styles: tokens,
    offset: null
  };
}
function state(name, styles, options) {
  return {
    type: AnimationMetadataType.State,
    name,
    styles,
    options
  };
}
function keyframes(steps) {
  return {
    type: AnimationMetadataType.Keyframes,
    steps
  };
}
function transition(stateChangeExpr, steps, options = null) {
  return {
    type: AnimationMetadataType.Transition,
    expr: stateChangeExpr,
    animation: steps,
    options
  };
}
function animation(steps, options = null) {
  return {
    type: AnimationMetadataType.Reference,
    animation: steps,
    options
  };
}
function animateChild(options = null) {
  return {
    type: AnimationMetadataType.AnimateChild,
    options
  };
}
function useAnimation(animation, options = null) {
  return {
    type: AnimationMetadataType.AnimateRef,
    animation,
    options
  };
}
function query(selector, animation, options = null) {
  return {
    type: AnimationMetadataType.Query,
    selector,
    animation,
    options
  };
}
function stagger(timings, animation) {
  return {
    type: AnimationMetadataType.Stagger,
    timings,
    animation
  };
}

class NoopAnimationPlayer {
  _onDoneFns = [];
  _onStartFns = [];
  _onDestroyFns = [];
  _originalOnDoneFns = [];
  _originalOnStartFns = [];
  _started = false;
  _destroyed = false;
  _finished = false;
  _position = 0;
  parentPlayer = null;
  totalTime;
  constructor(duration = 0, delay = 0) {
    this.totalTime = duration + delay;
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }
  onStart(fn) {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }
  onDone(fn) {
    this._originalOnDoneFns.push(fn);
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  hasStarted() {
    return this._started;
  }
  init() {}
  play() {
    if (!this.hasStarted()) {
      this._onStart();
      this.triggerMicrotask();
    }
    this._started = true;
  }
  triggerMicrotask() {
    queueMicrotask(() => this._onFinish());
  }
  _onStart() {
    this._onStartFns.forEach(fn => fn());
    this._onStartFns = [];
  }
  pause() {}
  restart() {}
  finish() {
    this._onFinish();
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      if (!this.hasStarted()) {
        this._onStart();
      }
      this.finish();
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this._started = false;
    this._finished = false;
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
  }
  setPosition(position) {
    this._position = this.totalTime ? position * this.totalTime : 1;
  }
  getPosition() {
    return this.totalTime ? this._position / this.totalTime : 1;
  }
  triggerCallback(phaseName) {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }
}

class AnimationGroupPlayer {
  _onDoneFns = [];
  _onStartFns = [];
  _finished = false;
  _started = false;
  _destroyed = false;
  _onDestroyFns = [];
  parentPlayer = null;
  totalTime = 0;
  players;
  constructor(_players) {
    this.players = _players;
    let doneCount = 0;
    let destroyCount = 0;
    let startCount = 0;
    const total = this.players.length;
    if (total == 0) {
      queueMicrotask(() => this._onFinish());
    } else {
      this.players.forEach(player => {
        player.onDone(() => {
          if (++doneCount == total) {
            this._onFinish();
          }
        });
        player.onDestroy(() => {
          if (++destroyCount == total) {
            this._onDestroy();
          }
        });
        player.onStart(() => {
          if (++startCount == total) {
            this._onStart();
          }
        });
      });
    }
    this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }
  init() {
    this.players.forEach(player => player.init());
  }
  onStart(fn) {
    this._onStartFns.push(fn);
  }
  _onStart() {
    if (!this.hasStarted()) {
      this._started = true;
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
    }
  }
  onDone(fn) {
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  hasStarted() {
    return this._started;
  }
  play() {
    if (!this.parentPlayer) {
      this.init();
    }
    this._onStart();
    this.players.forEach(player => player.play());
  }
  pause() {
    this.players.forEach(player => player.pause());
  }
  restart() {
    this.players.forEach(player => player.restart());
  }
  finish() {
    this._onFinish();
    this.players.forEach(player => player.finish());
  }
  destroy() {
    this._onDestroy();
  }
  _onDestroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._onFinish();
      this.players.forEach(player => player.destroy());
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this.players.forEach(player => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }
  setPosition(p) {
    const timeAtPosition = p * this.totalTime;
    this.players.forEach(player => {
      const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
      player.setPosition(position);
    });
  }
  getPosition() {
    const longestPlayer = this.players.reduce((longestSoFar, player) => {
      const newPlayerIsLongest = longestSoFar === null || player.totalTime > longestSoFar.totalTime;
      return newPlayerIsLongest ? player : longestSoFar;
    }, null);
    return longestPlayer != null ? longestPlayer.getPosition() : 0;
  }
  beforeDestroy() {
    this.players.forEach(player => {
      if (player.beforeDestroy) {
        player.beforeDestroy();
      }
    });
  }
  triggerCallback(phaseName) {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }
}

const ɵPRE_STYLE = '!';

export { AUTO_STYLE, AnimationGroupPlayer, AnimationMetadataType, NoopAnimationPlayer, animate, animateChild, animation, group, keyframes, query, sequence, stagger, state, style, transition, trigger, useAnimation, ɵPRE_STYLE };
//# sourceMappingURL=_private_export-chunk.mjs.map
