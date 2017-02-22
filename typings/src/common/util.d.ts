/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationStyles } from '@angular/core';
import { AnimateTimings } from './../dsl/animation_metadata';
import { StyleData } from './style_data';
export declare const ONE_SECOND = 1000;
export declare function parseTimeExpression(exp: string | number, errors: string[]): AnimateTimings;
export declare function normalizeStyles(styles: AnimationStyles): StyleData;
export declare function copyStyles(styles: StyleData, readPrototype: boolean, destination?: StyleData): StyleData;
