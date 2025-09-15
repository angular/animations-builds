/**
 * @license Angular v21.0.0-next.3+sha-de8be97
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { AnimationPlayer } from './animation_player.d.js';

/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 *
 * `AnimationDriver` implentation for Noop animations
 */
declare class NoopAnimationDriver implements AnimationDriver {
    /**
     * @returns Whether `prop` is a valid CSS property
     */
    validateStyleProperty(prop: string): boolean;
    /**
     *
     * @returns Whether elm1 contains elm2.
     */
    containsElement(elm1: any, elm2: any): boolean;
    /**
     * @returns Rhe parent of the given element or `null` if the element is the `document`
     */
    getParentElement(element: unknown): unknown;
    /**
     * @returns The result of the query selector on the element. The array will contain up to 1 item
     *     if `multi` is  `false`.
     */
    query(element: any, selector: string, multi: boolean): any[];
    /**
     * @returns The `defaultValue` or empty string
     */
    computeStyle(element: any, prop: string, defaultValue?: string): string;
    /**
     * @returns An `NoopAnimationPlayer`
     */
    animate(element: any, keyframes: Array<Map<string, string | number>>, duration: number, delay: number, easing: string, previousPlayers?: any[], scrubberAccessRequested?: boolean): AnimationPlayer;
    static ɵfac: i0.ɵɵFactoryDeclaration<NoopAnimationDriver, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NoopAnimationDriver>;
}
/**
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
declare abstract class AnimationDriver {
    /**
     * @deprecated Use the NoopAnimationDriver class.
     */
    static NOOP: AnimationDriver;
    abstract validateStyleProperty(prop: string): boolean;
    abstract validateAnimatableStyleProperty?: (prop: string) => boolean;
    abstract containsElement(elm1: any, elm2: any): boolean;
    /**
     * Obtains the parent element, if any. `null` is returned if the element does not have a parent.
     */
    abstract getParentElement(element: unknown): unknown;
    abstract query(element: any, selector: string, multi: boolean): any[];
    abstract computeStyle(element: any, prop: string, defaultValue?: string): string;
    abstract animate(element: any, keyframes: Array<Map<string, string | number>>, duration: number, delay: number, easing?: string | null, previousPlayers?: any[], scrubberAccessRequested?: boolean): any;
}

export { AnimationDriver, NoopAnimationDriver };
