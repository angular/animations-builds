/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationPlayer, AnimationTriggerMetadata } from '@angular/animations';
import { AnimationEngine } from '../animation_engine';
export declare class NoopAnimationEngine extends AnimationEngine {
    private _listeners;
    private _changes;
    private _flaggedRemovals;
    private _onDoneFns;
    private _triggerStyles;
    onRemovalComplete: (element: any, context: any) => void;
    registerTrigger(componentId: string, namespaceId: string, hostElement: any, name: string, metadata: AnimationTriggerMetadata): void;
    onInsert(namespaceId: string, element: any, parent: any, insertBefore: boolean): void;
    onRemove(namespaceId: string, element: any, context: any): void;
    setProperty(namespaceId: string, element: any, property: string, value: any): void;
    listen(namespaceId: string, element: any, eventName: string, eventPhase: string, callback: (event: any) => any): () => any;
    flush(): void;
    readonly players: AnimationPlayer[];
    destroy(namespaceId: string): void;
}
