/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopAnimationStyleNormalizer } from './dsl/style_normalization/animation_style_normalizer';
import { WebAnimationsStyleNormalizer } from './dsl/style_normalization/web_animations_style_normalizer';
import { NoopAnimationDriver } from './render/animation_driver';
import { AnimationEngine } from './render/animation_engine_next';
import { WebAnimationsDriver } from './render/web_animations/web_animations_driver';
export function createEngine(type, doc, scheduler) {
    // TODO: find a way to make this tree shakable.
    if (type === 'noop') {
        return new AnimationEngine(doc, new NoopAnimationDriver(), new NoopAnimationStyleNormalizer(), scheduler);
    }
    return new AnimationEngine(doc, new WebAnimationsDriver(), new WebAnimationsStyleNormalizer(), scheduler);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2VuZ2luZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvY3JlYXRlX2VuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxzREFBc0QsQ0FBQztBQUNsRyxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSwyREFBMkQsQ0FBQztBQUN2RyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sK0NBQStDLENBQUM7QUFFbEYsTUFBTSxVQUFVLFlBQVksQ0FDMUIsSUFBMkIsRUFDM0IsR0FBYSxFQUNiLFNBQTBDO0lBRTFDLCtDQUErQztJQUMvQyxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztRQUNwQixPQUFPLElBQUksZUFBZSxDQUN4QixHQUFHLEVBQ0gsSUFBSSxtQkFBbUIsRUFBRSxFQUN6QixJQUFJLDRCQUE0QixFQUFFLEVBQ2xDLFNBQVMsQ0FDVixDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sSUFBSSxlQUFlLENBQ3hCLEdBQUcsRUFDSCxJQUFJLG1CQUFtQixFQUFFLEVBQ3pCLElBQUksNEJBQTRCLEVBQUUsRUFDbEMsU0FBUyxDQUNWLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ybVDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIgYXMgQ2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOb29wQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7V2ViQW5pbWF0aW9uc1N0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi93ZWJfYW5pbWF0aW9uc19zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7Tm9vcEFuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge0FuaW1hdGlvbkVuZ2luZX0gZnJvbSAnLi9yZW5kZXIvYW5pbWF0aW9uX2VuZ2luZV9uZXh0JztcbmltcG9ydCB7V2ViQW5pbWF0aW9uc0RyaXZlcn0gZnJvbSAnLi9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfZHJpdmVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVuZ2luZShcbiAgdHlwZTogJ2FuaW1hdGlvbnMnIHwgJ25vb3AnLFxuICBkb2M6IERvY3VtZW50LFxuICBzY2hlZHVsZXI6IENoYW5nZURldGVjdGlvblNjaGVkdWxlciB8IG51bGwsXG4pOiBBbmltYXRpb25FbmdpbmUge1xuICAvLyBUT0RPOiBmaW5kIGEgd2F5IHRvIG1ha2UgdGhpcyB0cmVlIHNoYWthYmxlLlxuICBpZiAodHlwZSA9PT0gJ25vb3AnKSB7XG4gICAgcmV0dXJuIG5ldyBBbmltYXRpb25FbmdpbmUoXG4gICAgICBkb2MsXG4gICAgICBuZXcgTm9vcEFuaW1hdGlvbkRyaXZlcigpLFxuICAgICAgbmV3IE5vb3BBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIoKSxcbiAgICAgIHNjaGVkdWxlcixcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBBbmltYXRpb25FbmdpbmUoXG4gICAgZG9jLFxuICAgIG5ldyBXZWJBbmltYXRpb25zRHJpdmVyKCksXG4gICAgbmV3IFdlYkFuaW1hdGlvbnNTdHlsZU5vcm1hbGl6ZXIoKSxcbiAgICBzY2hlZHVsZXIsXG4gICk7XG59XG4iXX0=