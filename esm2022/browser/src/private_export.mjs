/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { Animation as ɵAnimation } from './dsl/animation';
export { AnimationStyleNormalizer as ɵAnimationStyleNormalizer, NoopAnimationStyleNormalizer as ɵNoopAnimationStyleNormalizer } from './dsl/style_normalization/animation_style_normalizer';
export { WebAnimationsStyleNormalizer as ɵWebAnimationsStyleNormalizer } from './dsl/style_normalization/web_animations_style_normalizer';
export { AnimationEngine as ɵAnimationEngine } from './render/animation_engine_next';
export { containsElement as ɵcontainsElement, getParentElement as ɵgetParentElement, invokeQuery as ɵinvokeQuery, validateStyleProperty as ɵvalidateStyleProperty, validateWebAnimatableStyleProperty as ɵvalidateWebAnimatableStyleProperty } from './render/shared';
export { WebAnimationsDriver as ɵWebAnimationsDriver } from './render/web_animations/web_animations_driver';
export { WebAnimationsPlayer as ɵWebAnimationsPlayer } from './render/web_animations/web_animations_player';
export { allowPreviousPlayerStylesMerge as ɵallowPreviousPlayerStylesMerge, camelCaseToDashCase as ɵcamelCaseToDashCase, normalizeKeyframes as ɵnormalizeKeyframes } from './util';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZV9leHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3ByaXZhdGVfZXhwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxTQUFTLElBQUksVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHdCQUF3QixJQUFJLHlCQUF5QixFQUFFLDRCQUE0QixJQUFJLDZCQUE2QixFQUFDLE1BQU0sc0RBQXNELENBQUM7QUFDMUwsT0FBTyxFQUFDLDRCQUE0QixJQUFJLDZCQUE2QixFQUFDLE1BQU0sMkRBQTJELENBQUM7QUFDeEksT0FBTyxFQUFDLGVBQWUsSUFBSSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxlQUFlLElBQUksZ0JBQWdCLEVBQUUsZ0JBQWdCLElBQUksaUJBQWlCLEVBQUUsV0FBVyxJQUFJLFlBQVksRUFBRSxxQkFBcUIsSUFBSSxzQkFBc0IsRUFBRSxrQ0FBa0MsSUFBSSxtQ0FBbUMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3BRLE9BQU8sRUFBQyxtQkFBbUIsSUFBSSxvQkFBb0IsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBQzFHLE9BQU8sRUFBQyxtQkFBbUIsSUFBSSxvQkFBb0IsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBQzFHLE9BQU8sRUFBQyw4QkFBOEIsSUFBSSwrQkFBK0IsRUFBRSxtQkFBbUIsSUFBSSxvQkFBb0IsRUFBRSxrQkFBa0IsSUFBSSxtQkFBbUIsRUFBQyxNQUFNLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHtBbmltYXRpb24gYXMgybVBbmltYXRpb259IGZyb20gJy4vZHNsL2FuaW1hdGlvbic7XG5leHBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplciBhcyDJtUFuaW1hdGlvblN0eWxlTm9ybWFsaXplciwgTm9vcEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciBhcyDJtU5vb3BBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuZXhwb3J0IHtXZWJBbmltYXRpb25zU3R5bGVOb3JtYWxpemVyIGFzIMm1V2ViQW5pbWF0aW9uc1N0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi93ZWJfYW5pbWF0aW9uc19zdHlsZV9ub3JtYWxpemVyJztcbmV4cG9ydCB7QW5pbWF0aW9uRW5naW5lIGFzIMm1QW5pbWF0aW9uRW5naW5lfSBmcm9tICcuL3JlbmRlci9hbmltYXRpb25fZW5naW5lX25leHQnO1xuZXhwb3J0IHtjb250YWluc0VsZW1lbnQgYXMgybVjb250YWluc0VsZW1lbnQsIGdldFBhcmVudEVsZW1lbnQgYXMgybVnZXRQYXJlbnRFbGVtZW50LCBpbnZva2VRdWVyeSBhcyDJtWludm9rZVF1ZXJ5LCB2YWxpZGF0ZVN0eWxlUHJvcGVydHkgYXMgybV2YWxpZGF0ZVN0eWxlUHJvcGVydHksIHZhbGlkYXRlV2ViQW5pbWF0YWJsZVN0eWxlUHJvcGVydHkgYXMgybV2YWxpZGF0ZVdlYkFuaW1hdGFibGVTdHlsZVByb3BlcnR5fSBmcm9tICcuL3JlbmRlci9zaGFyZWQnO1xuZXhwb3J0IHtXZWJBbmltYXRpb25zRHJpdmVyIGFzIMm1V2ViQW5pbWF0aW9uc0RyaXZlcn0gZnJvbSAnLi9yZW5kZXIvd2ViX2FuaW1hdGlvbnMvd2ViX2FuaW1hdGlvbnNfZHJpdmVyJztcbmV4cG9ydCB7V2ViQW5pbWF0aW9uc1BsYXllciBhcyDJtVdlYkFuaW1hdGlvbnNQbGF5ZXJ9IGZyb20gJy4vcmVuZGVyL3dlYl9hbmltYXRpb25zL3dlYl9hbmltYXRpb25zX3BsYXllcic7XG5leHBvcnQge2FsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSBhcyDJtWFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgY2FtZWxDYXNlVG9EYXNoQ2FzZSBhcyDJtWNhbWVsQ2FzZVRvRGFzaENhc2UsIG5vcm1hbGl6ZUtleWZyYW1lcyBhcyDJtW5vcm1hbGl6ZUtleWZyYW1lc30gZnJvbSAnLi91dGlsJztcbiJdfQ==