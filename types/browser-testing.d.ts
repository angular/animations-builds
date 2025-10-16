/**
 * @license Angular v21.0.0-next.8+sha-df780fa
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import { AnimationPlayer, ɵStyleDataMap as _StyleDataMap, NoopAnimationPlayer } from './_animation_player-chunk.js';
import { AnimationDriver } from './_animation_driver-chunk.js';
import '@angular/core';

/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
declare class MockAnimationDriver implements AnimationDriver {
    static log: AnimationPlayer[];
    validateStyleProperty(prop: string): boolean;
    validateAnimatableStyleProperty(prop: string): boolean;
    containsElement(elm1: any, elm2: any): boolean;
    getParentElement(element: unknown): unknown;
    query(element: any, selector: string, multi: boolean): any[];
    computeStyle(element: any, prop: string, defaultValue?: string): string;
    animate(element: any, keyframes: Array<_StyleDataMap>, duration: number, delay: number, easing: string, previousPlayers?: any[]): MockAnimationPlayer;
}
/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
declare class MockAnimationPlayer extends NoopAnimationPlayer {
    element: any;
    keyframes: Array<_StyleDataMap>;
    duration: number;
    delay: number;
    easing: string;
    previousPlayers: any[];
    private __finished;
    private __started;
    previousStyles: _StyleDataMap;
    private _onInitFns;
    currentSnapshot: _StyleDataMap;
    private _keyframes;
    constructor(element: any, keyframes: Array<_StyleDataMap>, duration: number, delay: number, easing: string, previousPlayers: any[]);
    reset(): void;
    finish(): void;
    destroy(): void;
    play(): void;
    hasStarted(): boolean;
    beforeDestroy(): void;
}

export { MockAnimationDriver, MockAnimationPlayer };
