/**
 * @license Angular v20.0.0-next.2+sha-1dba2a8
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { AnimationPlayer, ɵStyleDataMap as _StyleDataMap, NoopAnimationPlayer } from '@angular/animations';
import { AnimationDriver } from '@angular/animations/browser';

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
