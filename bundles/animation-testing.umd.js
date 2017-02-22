/**
 * @license Angular v0.0.0-PLACEHOLDER
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define('@angular/animation/testing', ['exports', '@angular/core'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@angular/core'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.ng.core);
        global.ng = global.ng || {};
        global.ng.animation = global.ng.animation || {};
        global.ng.animation.testing = mod.exports;
    }
})(this, function (exports, _core) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MockAnimationPlayer = exports.MockAnimationDriver = undefined;

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var MockAnimationDriver = function () {
        function MockAnimationDriver() {
            _classCallCheck(this, MockAnimationDriver);
        }

        _createClass(MockAnimationDriver, [{
            key: 'animate',
            value: function animate(element, keyframes, duration, delay, easing) {
                var previousPlayers = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

                var player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
                MockAnimationDriver.log.push(player);
                return player;
            }
        }]);

        return MockAnimationDriver;
    }();

    MockAnimationDriver.log = [];

    var MockAnimationPlayer = function (_NoOpAnimationPlayer) {
        _inherits(MockAnimationPlayer, _NoOpAnimationPlayer);

        function MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers) {
            _classCallCheck(this, MockAnimationPlayer);

            var _this = _possibleConstructorReturn(this, (MockAnimationPlayer.__proto__ || Object.getPrototypeOf(MockAnimationPlayer)).call(this));

            _this.element = element;
            _this.keyframes = keyframes;
            _this.duration = duration;
            _this.delay = delay;
            _this.easing = easing;
            _this.previousPlayers = previousPlayers;
            return _this;
        }

        return MockAnimationPlayer;
    }(_core.ɵNoOpAnimationPlayer);

    exports.MockAnimationDriver = MockAnimationDriver;
    exports.MockAnimationPlayer = MockAnimationPlayer;
});
