/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare abstract class AnimationStyleNormalizer {
    abstract normalizePropertyName(propertyName: string, errors: string[]): string;
    abstract normalizeStyleValue(userProvidedProperty: string, normalizedProperty: string, value: string | number, errors: string[]): string;
}
export declare class NoOpAnimationStyleNormalizer {
    normalizePropertyName(propertyName: string, errors: string[]): string;
    normalizeStyleValue(userProvidedProperty: string, normalizedProperty: string, value: string | number, errors: string[]): string;
}
