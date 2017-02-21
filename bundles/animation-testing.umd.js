/**
 * @license Angular v4.0.0-beta.8-d6a58f9
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.animation = global.ng.animation || {}, global.ng.animation.testing = global.ng.animation.testing || {}),global.ng.core));
}(this, function (exports,_angular_core) { 'use strict';

    var NoOpAnimationPlayer = _angular_core.__core_private__.NoOpAnimationPlayer;

    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var MockAnimationDriver = (function () {
        function MockAnimationDriver() {
        }
        MockAnimationDriver.prototype.animate = function (element, keyframes, duration, delay, easing, previousPlayers) {
            if (previousPlayers === void 0) { previousPlayers = []; }
            var player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
            MockAnimationDriver.log.push(player);
            return player;
        };
        return MockAnimationDriver;
    }());
    MockAnimationDriver.log = [];
    var MockAnimationPlayer = (function (_super) {
        __extends(MockAnimationPlayer, _super);
        function MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.keyframes = keyframes;
            _this.duration = duration;
            _this.delay = delay;
            _this.easing = easing;
            _this.previousPlayers = previousPlayers;
            return _this;
        }
        return MockAnimationPlayer;
    }(NoOpAnimationPlayer));

    exports.MockAnimationDriver = MockAnimationDriver;
    exports.MockAnimationPlayer = MockAnimationPlayer;

}));