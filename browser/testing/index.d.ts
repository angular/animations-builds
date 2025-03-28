/**
 * @license Angular v19.2.4+sha-43d03f8
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { b as AnimationPlayer, I as _StyleDataMap, N as NoopAnimationPlayer } from '../../animation_player.d-BR41_NcW.js';
import { A as AnimationDriver } from '../../animation_driver.d-Chtv1cvS.js';
import '@angular/core';

/**
 * @publicApi
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
