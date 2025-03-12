/**
 * @license Angular v19.2.2+sha-7529512
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { AnimationPlayer, AnimationTriggerMetadata, ɵStyleDataMap as _StyleDataMap, AnimationMetadata, AnimationOptions, ɵStyleData as _StyleData } from '@angular/animations';
import * as i0 from '@angular/core';
import { Renderer2, ɵAnimationRendererType as _AnimationRendererType, RendererStyleFlags2, ListenerOptions, RendererFactory2, NgZone, RendererType2 } from '@angular/core';

/**
 * @publicApi
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

declare abstract class AnimationStyleNormalizer {
    abstract normalizePropertyName(propertyName: string, errors: Error[]): string;
    abstract normalizeStyleValue(userProvidedProperty: string, normalizedProperty: string, value: string | number, errors: Error[]): string;
}
declare class NoopAnimationStyleNormalizer {
    normalizePropertyName(propertyName: string, errors: Error[]): string;
    normalizeStyleValue(userProvidedProperty: string, normalizedProperty: string, value: string | number, errors: Error[]): string;
}

declare class AnimationEngine {
    private _driver;
    private _normalizer;
    private _transitionEngine;
    private _timelineEngine;
    private _triggerCache;
    onRemovalComplete: (element: any, context: any) => void;
    constructor(doc: Document, _driver: AnimationDriver, _normalizer: AnimationStyleNormalizer);
    registerTrigger(componentId: string, namespaceId: string, hostElement: any, name: string, metadata: AnimationTriggerMetadata): void;
    register(namespaceId: string, hostElement: any): void;
    destroy(namespaceId: string, context: any): void;
    onInsert(namespaceId: string, element: any, parent: any, insertBefore: boolean): void;
    onRemove(namespaceId: string, element: any, context: any): void;
    disableAnimations(element: any, disable: boolean): void;
    process(namespaceId: string, element: any, property: string, value: any): void;
    listen(namespaceId: string, element: any, eventName: string, eventPhase: string, callback: (event: any) => any): () => any;
    flush(microtaskId?: number): void;
    get players(): AnimationPlayer[];
    whenRenderingDone(): Promise<any>;
    afterFlushAnimationsDone(cb: VoidFunction): void;
}

declare function createEngine(type: 'animations' | 'noop', doc: Document): AnimationEngine;

declare const enum AnimationTransitionInstructionType {
    TransitionAnimation = 0,
    TimelineAnimation = 1
}
interface AnimationEngineInstruction {
    type: AnimationTransitionInstructionType;
}

interface AnimationTimelineInstruction extends AnimationEngineInstruction {
    element: any;
    keyframes: Array<_StyleDataMap>;
    preStyleProps: string[];
    postStyleProps: string[];
    duration: number;
    delay: number;
    totalTime: number;
    easing: string | null;
    stretchStartingKeyframe?: boolean;
    subTimeline: boolean;
}

declare class ElementInstructionMap {
    private _map;
    get(element: any): AnimationTimelineInstruction[];
    append(element: any, instructions: AnimationTimelineInstruction[]): void;
    has(element: any): boolean;
    clear(): void;
}

declare class Animation$1 {
    private _driver;
    private _animationAst;
    constructor(_driver: AnimationDriver, input: AnimationMetadata | AnimationMetadata[]);
    buildTimelines(element: any, startingStyles: _StyleDataMap | Array<_StyleDataMap>, destinationStyles: _StyleDataMap | Array<_StyleDataMap>, options: AnimationOptions, subInstructions?: ElementInstructionMap): AnimationTimelineInstruction[];
}

declare class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    normalizePropertyName(propertyName: string, errors: Error[]): string;
    normalizeStyleValue(userProvidedProperty: string, normalizedProperty: string, value: string | number, errors: Error[]): string;
}

type AnimationFactoryWithListenerCallback = RendererFactory2 & {
    scheduleListenerCallback: (count: number, fn: (e: any) => any, data: any) => void;
};
declare class BaseAnimationRenderer implements Renderer2 {
    protected namespaceId: string;
    delegate: Renderer2;
    engine: AnimationEngine;
    private _onDestroy?;
    readonly ɵtype: _AnimationRendererType.Regular;
    constructor(namespaceId: string, delegate: Renderer2, engine: AnimationEngine, _onDestroy?: (() => void) | undefined);
    get data(): {
        [key: string]: any;
    };
    destroyNode(node: any): void;
    destroy(): void;
    createElement(name: string, namespace?: string | null | undefined): any;
    createComment(value: string): any;
    createText(value: string): any;
    appendChild(parent: any, newChild: any): void;
    insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean): void;
    removeChild(parent: any, oldChild: any, isHostElement?: boolean): void;
    selectRootElement(selectorOrNode: any, preserveContent?: boolean): any;
    parentNode(node: any): any;
    nextSibling(node: any): any;
    setAttribute(el: any, name: string, value: string, namespace?: string | null | undefined): void;
    removeAttribute(el: any, name: string, namespace?: string | null | undefined): void;
    addClass(el: any, name: string): void;
    removeClass(el: any, name: string): void;
    setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2 | undefined): void;
    removeStyle(el: any, style: string, flags?: RendererStyleFlags2 | undefined): void;
    setProperty(el: any, name: string, value: any): void;
    setValue(node: any, value: string): void;
    listen(target: any, eventName: string, callback: (event: any) => boolean | void, options?: ListenerOptions): () => void;
    protected disableAnimations(element: any, value: boolean): void;
}
declare class AnimationRenderer extends BaseAnimationRenderer implements Renderer2 {
    factory: AnimationFactoryWithListenerCallback;
    constructor(factory: AnimationFactoryWithListenerCallback, namespaceId: string, delegate: Renderer2, engine: AnimationEngine, onDestroy?: () => void);
    setProperty(el: any, name: string, value: any): void;
    listen(target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => any, options?: ListenerOptions): () => void;
}

declare class AnimationRendererFactory implements RendererFactory2 {
    private delegate;
    private engine;
    private _zone;
    private _currentId;
    private _microtaskId;
    private _animationCallbacksBuffer;
    private _rendererCache;
    private _cdRecurDepth;
    constructor(delegate: RendererFactory2, engine: AnimationEngine, _zone: NgZone);
    createRenderer(hostElement: any, type: RendererType2): BaseAnimationRenderer;
    begin(): void;
    private _scheduleCountTask;
    end(): void;
    whenRenderingDone(): Promise<any>;
    /**
     * Used during HMR to clear any cached data about a component.
     * @param componentId ID of the component that is being replaced.
     */
    protected componentReplaced(componentId: string): void;
}

declare function getParentElement(element: any): unknown | null;
declare function validateStyleProperty(prop: string): boolean;
declare function validateWebAnimatableStyleProperty(prop: string): boolean;
declare function containsElement(elm1: any, elm2: any): boolean;
declare function invokeQuery(element: any, selector: string, multi: boolean): any[];

declare class WebAnimationsDriver implements AnimationDriver {
    validateStyleProperty(prop: string): boolean;
    validateAnimatableStyleProperty(prop: string): boolean;
    containsElement(elm1: any, elm2: any): boolean;
    getParentElement(element: unknown): unknown;
    query(element: any, selector: string, multi: boolean): any[];
    computeStyle(element: any, prop: string, defaultValue?: string): string;
    animate(element: any, keyframes: Array<Map<string, string | number>>, duration: number, delay: number, easing: string, previousPlayers?: AnimationPlayer[]): AnimationPlayer;
}

/**
 * Designed to be executed during a keyframe-based animation to apply any special-cased styles.
 *
 * When started (when the `start()` method is run) then the provided `startStyles`
 * will be applied. When finished (when the `finish()` method is called) the
 * `endStyles` will be applied as well any any starting styles. Finally when
 * `destroy()` is called then all styles will be removed.
 */
declare class SpecialCasedStyles {
    private _element;
    private _startStyles;
    private _endStyles;
    static initialStylesByElement: WeakMap<any, _StyleDataMap>;
    private _state;
    private _initialStyles;
    constructor(_element: any, _startStyles: _StyleDataMap | null, _endStyles: _StyleDataMap | null);
    start(): void;
    finish(): void;
    destroy(): void;
}

declare class WebAnimationsPlayer implements AnimationPlayer {
    element: any;
    keyframes: Array<_StyleDataMap>;
    options: {
        [key: string]: string | number;
    };
    private _specialStyles?;
    private _onDoneFns;
    private _onStartFns;
    private _onDestroyFns;
    private _duration;
    private _delay;
    private _initialized;
    private _finished;
    private _started;
    private _destroyed;
    private _finalKeyframe?;
    private _originalOnDoneFns;
    private _originalOnStartFns;
    readonly domPlayer: Animation;
    time: number;
    parentPlayer: AnimationPlayer | null;
    currentSnapshot: _StyleDataMap;
    constructor(element: any, keyframes: Array<_StyleDataMap>, options: {
        [key: string]: string | number;
    }, _specialStyles?: (SpecialCasedStyles | null) | undefined);
    private _onFinish;
    init(): void;
    private _buildPlayer;
    private _preparePlayerBeforeStart;
    private _convertKeyframesToObject;
    onStart(fn: () => void): void;
    onDone(fn: () => void): void;
    onDestroy(fn: () => void): void;
    play(): void;
    pause(): void;
    finish(): void;
    reset(): void;
    private _resetDomPlayerState;
    restart(): void;
    hasStarted(): boolean;
    destroy(): void;
    setPosition(p: number): void;
    getPosition(): number;
    get totalTime(): number;
    beforeDestroy(): void;
}

declare function normalizeKeyframes(keyframes: Array<_StyleData> | Array<_StyleDataMap>): Array<_StyleDataMap>;
declare function camelCaseToDashCase(input: string): string;
declare function allowPreviousPlayerStylesMerge(duration: number, delay: number): boolean;

export { AnimationDriver, NoopAnimationDriver, Animation$1 as ɵAnimation, AnimationEngine as ɵAnimationEngine, AnimationRenderer as ɵAnimationRenderer, AnimationRendererFactory as ɵAnimationRendererFactory, AnimationStyleNormalizer as ɵAnimationStyleNormalizer, BaseAnimationRenderer as ɵBaseAnimationRenderer, NoopAnimationStyleNormalizer as ɵNoopAnimationStyleNormalizer, WebAnimationsDriver as ɵWebAnimationsDriver, WebAnimationsPlayer as ɵWebAnimationsPlayer, WebAnimationsStyleNormalizer as ɵWebAnimationsStyleNormalizer, allowPreviousPlayerStylesMerge as ɵallowPreviousPlayerStylesMerge, camelCaseToDashCase as ɵcamelCaseToDashCase, containsElement as ɵcontainsElement, createEngine as ɵcreateEngine, getParentElement as ɵgetParentElement, invokeQuery as ɵinvokeQuery, normalizeKeyframes as ɵnormalizeKeyframes, validateStyleProperty as ɵvalidateStyleProperty, validateWebAnimatableStyleProperty as ɵvalidateWebAnimatableStyleProperty };
