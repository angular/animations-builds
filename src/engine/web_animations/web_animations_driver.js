import { WebAnimationsPlayer } from './web_animations_player';
export class WebAnimationsDriver {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const /** @type {?} */ playerOptions = { 'duration': duration, 'delay': delay, 'fill': 'forwards' };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        const /** @type {?} */ previousWebAnimationPlayers = (previousPlayers.filter(player => { return player instanceof WebAnimationsPlayer; }));
        return new WebAnimationsPlayer(element, keyframes, playerOptions, previousWebAnimationPlayers);
    }
}
/**
 * @return {?}
 */
export function supportsWebAnimations() {
    return typeof Element !== 'undefined' && typeof ((Element)).prototype['animate'] === 'function';
}
//# sourceMappingURL=web_animations_driver.js.map