import { AnimationPlayer } from '@angular/animations';
/**
 * @experimental
 */
export declare class NoopAnimationDriver implements AnimationDriver {
    computeStyle(element: any, prop: string, defaultValue?: string): string;
    animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing: string, previousPlayers?: any[]): AnimationPlayer;
}
/**
 * @experimental
 */
export declare abstract class AnimationDriver {
    static NOOP: AnimationDriver;
    abstract computeStyle(element: any, prop: string, defaultValue?: string): string;
    abstract animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing?: string | null, previousPlayers?: any[]): any;
}
