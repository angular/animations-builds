import { ɵNoOpAnimationPlayer } from '@angular/core';

class MockAnimationDriver {
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
        MockAnimationDriver.log.push(player);
        return player;
    }
}
MockAnimationDriver.log = [];
class MockAnimationPlayer extends ɵNoOpAnimationPlayer {
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

export { MockAnimationDriver, MockAnimationPlayer };