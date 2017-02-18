var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { NoOpAnimationPlayer } from '../src/private_import_core';
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
export { MockAnimationDriver };
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
export { MockAnimationPlayer };
//# sourceMappingURL=mock_animation_driver.js.map