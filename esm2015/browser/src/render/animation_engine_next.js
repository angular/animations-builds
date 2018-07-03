/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { buildAnimationAst } from '../dsl/animation_ast_builder';
import { buildTrigger } from '../dsl/animation_trigger';
import { parseTimelineCommand } from './shared';
import { TimelineAnimationEngine } from './timeline_animation_engine';
import { TransitionAnimationEngine } from './transition_animation_engine';
export class AnimationEngine {
    /**
     * @param {?} bodyNode
     * @param {?} _driver
     * @param {?} normalizer
     */
    constructor(bodyNode, _driver, normalizer) {
        this.bodyNode = bodyNode;
        this._driver = _driver;
        this._triggerCache = {};
        this.onRemovalComplete = (element, context) => { };
        this._transitionEngine = new TransitionAnimationEngine(bodyNode, _driver, normalizer);
        this._timelineEngine = new TimelineAnimationEngine(bodyNode, _driver, normalizer);
        this._transitionEngine.onRemovalComplete = (element, context) => this.onRemovalComplete(element, context);
    }
    /**
     * @param {?} componentId
     * @param {?} namespaceId
     * @param {?} hostElement
     * @param {?} name
     * @param {?} metadata
     * @return {?}
     */
    registerTrigger(componentId, namespaceId, hostElement, name, metadata) {
        const /** @type {?} */ cacheKey = componentId + '-' + name;
        let /** @type {?} */ trigger = this._triggerCache[cacheKey];
        if (!trigger) {
            const /** @type {?} */ errors = [];
            const /** @type {?} */ ast = /** @type {?} */ (buildAnimationAst(this._driver, /** @type {?} */ (metadata), errors));
            if (errors.length) {
                throw new Error(`The animation trigger "${name}" has failed to build due to the following errors:\n - ${errors.join("\n - ")}`);
            }
            trigger = buildTrigger(name, ast);
            this._triggerCache[cacheKey] = trigger;
        }
        this._transitionEngine.registerTrigger(namespaceId, name, trigger);
    }
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @return {?}
     */
    register(namespaceId, hostElement) {
        this._transitionEngine.register(namespaceId, hostElement);
    }
    /**
     * @param {?} namespaceId
     * @param {?} context
     * @return {?}
     */
    destroy(namespaceId, context) {
        this._transitionEngine.destroy(namespaceId, context);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    onInsert(namespaceId, element, parent, insertBefore) {
        this._transitionEngine.insertNode(namespaceId, element, parent, insertBefore);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    onRemove(namespaceId, element, context) {
        this._transitionEngine.removeNode(namespaceId, element, context);
    }
    /**
     * @param {?} element
     * @param {?} disable
     * @return {?}
     */
    disableAnimations(element, disable) {
        this._transitionEngine.markElementAsDisabled(element, disable);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    process(namespaceId, element, property, value) {
        if (property.charAt(0) == '@') {
            const [id, action] = parseTimelineCommand(property);
            const /** @type {?} */ args = /** @type {?} */ (value);
            this._timelineEngine.command(id, element, action, args);
        }
        else {
            this._transitionEngine.trigger(namespaceId, element, property, value);
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} eventName
     * @param {?} eventPhase
     * @param {?} callback
     * @return {?}
     */
    listen(namespaceId, element, eventName, eventPhase, callback) {
        // @@listen
        if (eventName.charAt(0) == '@') {
            const [id, action] = parseTimelineCommand(eventName);
            return this._timelineEngine.listen(id, element, action, callback);
        }
        return this._transitionEngine.listen(namespaceId, element, eventName, eventPhase, callback);
    }
    /**
     * @param {?=} microtaskId
     * @return {?}
     */
    flush(microtaskId = -1) { this._transitionEngine.flush(microtaskId); }
    /**
     * @return {?}
     */
    get players() {
        return (/** @type {?} */ (this._transitionEngine.players))
            .concat(/** @type {?} */ (this._timelineEngine.players));
    }
    /**
     * @return {?}
     */
    whenRenderingDone() { return this._transitionEngine.whenRenderingDone(); }
}
function AnimationEngine_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationEngine.prototype._transitionEngine;
    /** @type {?} */
    AnimationEngine.prototype._timelineEngine;
    /** @type {?} */
    AnimationEngine.prototype._triggerCache;
    /** @type {?} */
    AnimationEngine.prototype.onRemovalComplete;
    /** @type {?} */
    AnimationEngine.prototype.bodyNode;
    /** @type {?} */
    AnimationEngine.prototype._driver;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2VuZ2luZV9uZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2VuZ2luZV9uZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQW1CLFlBQVksRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBSXhFLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUV4RSxNQUFNOzs7Ozs7SUFTSixZQUNZLFVBQXVCLE9BQXdCLEVBQ3ZELFVBQW9DO1FBRDVCLGFBQVEsR0FBUixRQUFRO1FBQWUsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7NkJBTkEsRUFBRTtpQ0FHbEMsQ0FBQyxPQUFZLEVBQUUsT0FBWSxFQUFFLEVBQUUsSUFBRztRQUszRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWxGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLE9BQVksRUFBRSxPQUFZLEVBQUUsRUFBRSxDQUN0RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzlDOzs7Ozs7Ozs7SUFFRCxlQUFlLENBQ1gsV0FBbUIsRUFBRSxXQUFtQixFQUFFLFdBQWdC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QUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3Rjs7Ozs7SUFFRCxLQUFLLENBQUMsY0FBc0IsQ0FBQyxDQUFDLElBQVUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFOzs7O0lBRXBGLElBQUksT0FBTztRQUNULE9BQU8sbUJBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQTRCLEVBQUM7YUFDdkQsTUFBTSxtQkFBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQTRCLEVBQUMsQ0FBQztLQUNoRTs7OztJQUVELGlCQUFpQixLQUFtQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUU7Q0FDekYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25QbGF5ZXIsIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1RyaWdnZXJBc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25Bc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0X2J1aWxkZXInO1xuaW1wb3J0IHtBbmltYXRpb25UcmlnZ2VyLCBidWlsZFRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7cGFyc2VUaW1lbGluZUNvbW1hbmR9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VGltZWxpbmVBbmltYXRpb25FbmdpbmV9IGZyb20gJy4vdGltZWxpbmVfYW5pbWF0aW9uX2VuZ2luZSc7XG5pbXBvcnQge1RyYW5zaXRpb25BbmltYXRpb25FbmdpbmV9IGZyb20gJy4vdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lJztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkVuZ2luZSB7XG4gIHByaXZhdGUgX3RyYW5zaXRpb25FbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmU7XG4gIHByaXZhdGUgX3RpbWVsaW5lRW5naW5lOiBUaW1lbGluZUFuaW1hdGlvbkVuZ2luZTtcblxuICBwcml2YXRlIF90cmlnZ2VyQ2FjaGU6IHtba2V5OiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuXG4gIC8vIHRoaXMgbWV0aG9kIGlzIGRlc2lnbmVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGNvZGUgdGhhdCB1c2VzIHRoaXMgZW5naW5lXG4gIHB1YmxpYyBvblJlbW92YWxDb21wbGV0ZSA9IChlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGJvZHlOb2RlOiBhbnksIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLFxuICAgICAgbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZSA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lKGJvZHlOb2RlLCBfZHJpdmVyLCBub3JtYWxpemVyKTtcbiAgICB0aGlzLl90aW1lbGluZUVuZ2luZSA9IG5ldyBUaW1lbGluZUFuaW1hdGlvbkVuZ2luZShib2R5Tm9kZSwgX2RyaXZlciwgbm9ybWFsaXplcik7XG5cbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLm9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PlxuICAgICAgICB0aGlzLm9uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICB9XG5cbiAgcmVnaXN0ZXJUcmlnZ2VyKFxuICAgICAgY29tcG9uZW50SWQ6IHN0cmluZywgbmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLFxuICAgICAgbWV0YWRhdGE6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gY29tcG9uZW50SWQgKyAnLScgKyBuYW1lO1xuICAgIGxldCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlckNhY2hlW2NhY2hlS2V5XTtcbiAgICBpZiAoIXRyaWdnZXIpIHtcbiAgICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICAgIGNvbnN0IGFzdCA9XG4gICAgICAgICAgYnVpbGRBbmltYXRpb25Bc3QodGhpcy5fZHJpdmVyLCBtZXRhZGF0YSBhcyBBbmltYXRpb25NZXRhZGF0YSwgZXJyb3JzKSBhcyBUcmlnZ2VyQXN0O1xuICAgICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBoYXMgZmFpbGVkIHRvIGJ1aWxkIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczpcXG4gLSAke2Vycm9ycy5qb2luKFwiXFxuIC0gXCIpfWApO1xuICAgICAgfVxuICAgICAgdHJpZ2dlciA9IGJ1aWxkVHJpZ2dlcihuYW1lLCBhc3QpO1xuICAgICAgdGhpcy5fdHJpZ2dlckNhY2hlW2NhY2hlS2V5XSA9IHRyaWdnZXI7XG4gICAgfVxuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUucmVnaXN0ZXJUcmlnZ2VyKG5hbWVzcGFjZUlkLCBuYW1lLCB0cmlnZ2VyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLnJlZ2lzdGVyKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUuZGVzdHJveShuYW1lc3BhY2VJZCwgY29udGV4dCk7XG4gIH1cblxuICBvbkluc2VydChuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLmluc2VydE5vZGUobmFtZXNwYWNlSWQsIGVsZW1lbnQsIHBhcmVudCwgaW5zZXJ0QmVmb3JlKTtcbiAgfVxuXG4gIG9uUmVtb3ZlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5yZW1vdmVOb2RlKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGRpc2FibGVBbmltYXRpb25zKGVsZW1lbnQ6IGFueSwgZGlzYWJsZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUubWFya0VsZW1lbnRBc0Rpc2FibGVkKGVsZW1lbnQsIGRpc2FibGUpO1xuICB9XG5cbiAgcHJvY2VzcyhuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBpZiAocHJvcGVydHkuY2hhckF0KDApID09ICdAJykge1xuICAgICAgY29uc3QgW2lkLCBhY3Rpb25dID0gcGFyc2VUaW1lbGluZUNvbW1hbmQocHJvcGVydHkpO1xuICAgICAgY29uc3QgYXJncyA9IHZhbHVlIGFzIGFueVtdO1xuICAgICAgdGhpcy5fdGltZWxpbmVFbmdpbmUuY29tbWFuZChpZCwgZWxlbWVudCwgYWN0aW9uLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS50cmlnZ2VyKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50UGhhc2U6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTogKCkgPT4gYW55IHtcbiAgICAvLyBAQGxpc3RlblxuICAgIGlmIChldmVudE5hbWUuY2hhckF0KDApID09ICdAJykge1xuICAgICAgY29uc3QgW2lkLCBhY3Rpb25dID0gcGFyc2VUaW1lbGluZUNvbW1hbmQoZXZlbnROYW1lKTtcbiAgICAgIHJldHVybiB0aGlzLl90aW1lbGluZUVuZ2luZS5saXN0ZW4oaWQsIGVsZW1lbnQsIGFjdGlvbiwgY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5saXN0ZW4obmFtZXNwYWNlSWQsIGVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRQaGFzZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgZmx1c2gobWljcm90YXNrSWQ6IG51bWJlciA9IC0xKTogdm9pZCB7IHRoaXMuX3RyYW5zaXRpb25FbmdpbmUuZmx1c2gobWljcm90YXNrSWQpOyB9XG5cbiAgZ2V0IHBsYXllcnMoKTogQW5pbWF0aW9uUGxheWVyW10ge1xuICAgIHJldHVybiAodGhpcy5fdHJhbnNpdGlvbkVuZ2luZS5wbGF5ZXJzIGFzIEFuaW1hdGlvblBsYXllcltdKVxuICAgICAgICAuY29uY2F0KHRoaXMuX3RpbWVsaW5lRW5naW5lLnBsYXllcnMgYXMgQW5pbWF0aW9uUGxheWVyW10pO1xuICB9XG5cbiAgd2hlblJlbmRlcmluZ0RvbmUoKTogUHJvbWlzZTxhbnk+IHsgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUud2hlblJlbmRlcmluZ0RvbmUoKTsgfVxufVxuIl19