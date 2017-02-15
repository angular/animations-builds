import { NoOpAnimationPlayer } from '../src/private_import_core';
export class MockAnimationDriver {
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(player);
        return player;
    }
}
MockAnimationDriver.log = [];
export class MockAnimationPlayer extends NoOpAnimationPlayer {
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super();
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
    }
}
//# sourceMappingURL=mock_animation_driver.js.map