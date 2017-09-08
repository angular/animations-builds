/**
 * @license Angular v5.0.0-beta.6-112e777
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
import { __extends } from 'tslib';
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} players
 * @return {?}
 */

/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?=} preStyles
 * @param {?=} postStyles
 * @return {?}
 */

/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */

/**
 * @param {?} e
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @return {?}
 */

/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @return {?}
 */

/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */

/**
 * @param {?} command
 * @return {?}
 */

var _contains = function (elm1, elm2) { return false; };
var _matches = function (element, selector) {
    return false;
};
var _query = function (element, selector, multi) {
    return [];
};
if (typeof Element != 'undefined') {
    // this is well supported in all browsers
    _contains = function (elm1, elm2) { return (elm1.contains(elm2)); };
    if (Element.prototype.matches) {
        _matches = function (element, selector) { return element.matches(selector); };
    }
    else {
        var /** @type {?} */ proto = (Element.prototype);
        var /** @type {?} */ fn_1 = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
            proto.oMatchesSelector || proto.webkitMatchesSelector;
        if (fn_1) {
            _matches = function (element, selector) { return fn_1.apply(element, [selector]); };
        }
    }
    _query = function (element, selector, multi) {
        var /** @type {?} */ results = [];
        if (multi) {
            results.push.apply(results, element.querySelectorAll(selector));
        }
        else {
            var /** @type {?} */ elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    };
}
var _CACHED_BODY = null;
/**
 * @param {?} prop
 * @return {?}
 */
function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
    }
    return ((_CACHED_BODY)).style ? prop in ((_CACHED_BODY)).style : true;
}
/**
 * @return {?}
 */
function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
var matchesElement = _matches;
var containsElement = _contains;
var invokeQuery = _query;

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */











/**
 * @param {?} value
 * @return {?}
 */

/**
 * @param {?} timings
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */

/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */

/**
 * @param {?} styles
 * @return {?}
 */

/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */

/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */

/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */

/**
 * @param {?} steps
 * @return {?}
 */

/**
 * @param {?} value
 * @param {?} options
 * @param {?} errors
 * @return {?}
 */

/**
 * @param {?} value
 * @return {?}
 */

/**
 * @param {?} value
 * @param {?} params
 * @param {?} errors
 * @return {?}
 */

/**
 * @param {?} iterator
 * @return {?}
 */

/**
 * @param {?} source
 * @param {?} destination
 * @return {?}
 */

/**
 * @param {?} input
 * @return {?}
 */

/**
 * @param {?} duration
 * @param {?} delay
 * @return {?}
 */
function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@experimental Animation support is experimental.
 */
var MockAnimationDriver = (function () {
    function MockAnimationDriver() {
    }
    /**
     * @param {?} prop
     * @return {?}
     */
    MockAnimationDriver.prototype.validateStyleProperty = function (prop) { return validateStyleProperty(prop); };
    /**
     * @param {?} element
     * @param {?} selector
     * @return {?}
     */
    MockAnimationDriver.prototype.matchesElement = function (element, selector) {
        return matchesElement(element, selector);
    };
    /**
     * @param {?} elm1
     * @param {?} elm2
     * @return {?}
     */
    MockAnimationDriver.prototype.containsElement = function (elm1, elm2) { return containsElement(elm1, elm2); };
    /**
     * @param {?} element
     * @param {?} selector
     * @param {?} multi
     * @return {?}
     */
    MockAnimationDriver.prototype.query = function (element, selector, multi) {
        return invokeQuery(element, selector, multi);
    };
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    MockAnimationDriver.prototype.computeStyle = function (element, prop, defaultValue) {
        return defaultValue || '';
    };
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    MockAnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        var /** @type {?} */ player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(/** @type {?} */ (player));
        return player;
    };
    return MockAnimationDriver;
}());
MockAnimationDriver.log = [];
/**
 * \@experimental Animation support is experimental.
 */
var MockAnimationPlayer = (function (_super) {
    __extends(MockAnimationPlayer, _super);
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?} previousPlayers
     */
    function MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.keyframes = keyframes;
        _this.duration = duration;
        _this.delay = delay;
        _this.easing = easing;
        _this.previousPlayers = previousPlayers;
        _this.__finished = false;
        _this.__started = false;
        _this.previousStyles = {};
        _this._onInitFns = [];
        _this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(function (player) {
                if (player instanceof MockAnimationPlayer) {
                    var /** @type {?} */ styles_1 = player.currentSnapshot;
                    Object.keys(styles_1).forEach(function (prop) { return _this.previousStyles[prop] = styles_1[prop]; });
                }
            });
        }
        _this.totalTime = delay + duration;
        return _this;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    MockAnimationPlayer.prototype.onInit = function (fn) { this._onInitFns.push(fn); };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.init = function () {
        _super.prototype.init.call(this);
        this._onInitFns.forEach(function (fn) { return fn(); });
        this._onInitFns = [];
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.finish = function () {
        _super.prototype.finish.call(this);
        this.__finished = true;
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.__finished = true;
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.triggerMicrotask = function () { };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.play = function () {
        _super.prototype.play.call(this);
        this.__started = true;
    };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.hasStarted = function () { return this.__started; };
    /**
     * @return {?}
     */
    MockAnimationPlayer.prototype.beforeDestroy = function () {
        var _this = this;
        var /** @type {?} */ captures = {};
        Object.keys(this.previousStyles).forEach(function (prop) {
            captures[prop] = _this.previousStyles[prop];
        });
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach(function (kf) {
                Object.keys(kf).forEach(function (prop) {
                    if (prop != 'offset') {
                        captures[prop] = _this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                });
            });
        }
        this.currentSnapshot = captures;
    };
    return MockAnimationPlayer;
}(NoopAnimationPlayer));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of this package.
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { MockAnimationDriver, MockAnimationPlayer };
//# sourceMappingURL=index.js.map
