/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
        // this method is designed to be overridden by the code that uses this engine
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
        /** @type {?} */
        const cacheKey = componentId + '-' + name;
        /** @type {?} */
        let trigger = this._triggerCache[cacheKey];
        if (!trigger) {
            /** @type {?} */
            const errors = [];
            /** @type {?} */
            const ast = (/** @type {?} */ (buildAnimationAst(this._driver, (/** @type {?} */ (metadata)), errors)));
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
     * @param {?=} isHostElement
     * @return {?}
     */
    onRemove(namespaceId, element, context, isHostElement) {
        this._transitionEngine.removeNode(namespaceId, element, isHostElement || false, context);
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
            /** @type {?} */
            const args = (/** @type {?} */ (value));
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
        return ((/** @type {?} */ (this._transitionEngine.players)))
            .concat((/** @type {?} */ (this._timelineEngine.players)));
    }
    /**
     * @return {?}
     */
    whenRenderingDone() { return this._transitionEngine.whenRenderingDone(); }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._transitionEngine;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._timelineEngine;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._triggerCache;
    /** @type {?} */
    AnimationEngine.prototype.onRemovalComplete;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype.bodyNode;
    /**
     * @type {?}
     * @private
     */
    AnimationEngine.prototype._driver;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2VuZ2luZV9uZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2VuZ2luZV9uZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQW1CLFlBQVksRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBSXhFLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUV4RSxNQUFNLE9BQU8sZUFBZTs7Ozs7O0lBUzFCLFlBQ1ksUUFBYSxFQUFVLE9BQXdCLEVBQ3ZELFVBQW9DO1FBRDVCLGFBQVEsR0FBUixRQUFRLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQU5uRCxrQkFBYSxHQUFzQyxFQUFFLENBQUM7O1FBR3ZELHNCQUFpQixHQUFHLENBQUMsT0FBWSxFQUFFLE9BQVksRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBSzVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFbEYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixHQUFHLENBQUMsT0FBWSxFQUFFLE9BQVksRUFBRSxFQUFFLENBQ3RFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENB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QUMsQ0FBQyxJQUFJLEdBQUcsRUFBRTtrQkFDeEIsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbkU7UUFDRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlGLENBQUM7Ozs7O0lBRUQsS0FBSyxDQUFDLGNBQXNCLENBQUMsQ0FBQyxJQUFVLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRXBGLElBQUksT0FBTztRQUNULE9BQU8sQ0FBQyxtQkFBQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFxQixDQUFDO2FBQ3ZELE1BQU0sQ0FBQyxtQkFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBcUIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Ozs7SUFFRCxpQkFBaUIsS0FBbUIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekY7Ozs7OztJQXRGQyw0Q0FBcUQ7Ozs7O0lBQ3JELDBDQUFpRDs7Ozs7SUFFakQsd0NBQThEOztJQUc5RCw0Q0FBOEQ7Ozs7O0lBRzFELG1DQUFxQjs7Ozs7SUFBRSxrQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25QbGF5ZXIsIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1RyaWdnZXJBc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25Bc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0X2J1aWxkZXInO1xuaW1wb3J0IHtBbmltYXRpb25UcmlnZ2VyLCBidWlsZFRyaWdnZXJ9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fdHJpZ2dlcic7XG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7cGFyc2VUaW1lbGluZUNvbW1hbmR9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VGltZWxpbmVBbmltYXRpb25FbmdpbmV9IGZyb20gJy4vdGltZWxpbmVfYW5pbWF0aW9uX2VuZ2luZSc7XG5pbXBvcnQge1RyYW5zaXRpb25BbmltYXRpb25FbmdpbmV9IGZyb20gJy4vdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lJztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkVuZ2luZSB7XG4gIHByaXZhdGUgX3RyYW5zaXRpb25FbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmU7XG4gIHByaXZhdGUgX3RpbWVsaW5lRW5naW5lOiBUaW1lbGluZUFuaW1hdGlvbkVuZ2luZTtcblxuICBwcml2YXRlIF90cmlnZ2VyQ2FjaGU6IHtba2V5OiBzdHJpbmddOiBBbmltYXRpb25UcmlnZ2VyfSA9IHt9O1xuXG4gIC8vIHRoaXMgbWV0aG9kIGlzIGRlc2lnbmVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGNvZGUgdGhhdCB1c2VzIHRoaXMgZW5naW5lXG4gIHB1YmxpYyBvblJlbW92YWxDb21wbGV0ZSA9IChlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGJvZHlOb2RlOiBhbnksIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLFxuICAgICAgbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbkVuZ2luZSA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lKGJvZHlOb2RlLCBfZHJpdmVyLCBub3JtYWxpemVyKTtcbiAgICB0aGlzLl90aW1lbGluZUVuZ2luZSA9IG5ldyBUaW1lbGluZUFuaW1hdGlvbkVuZ2luZShib2R5Tm9kZSwgX2RyaXZlciwgbm9ybWFsaXplcik7XG5cbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLm9uUmVtb3ZhbENvbXBsZXRlID0gKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSA9PlxuICAgICAgICB0aGlzLm9uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQsIGNvbnRleHQpO1xuICB9XG5cbiAgcmVnaXN0ZXJUcmlnZ2VyKFxuICAgICAgY29tcG9uZW50SWQ6IHN0cmluZywgbmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLFxuICAgICAgbWV0YWRhdGE6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gY29tcG9uZW50SWQgKyAnLScgKyBuYW1lO1xuICAgIGxldCB0cmlnZ2VyID0gdGhpcy5fdHJpZ2dlckNhY2hlW2NhY2hlS2V5XTtcbiAgICBpZiAoIXRyaWdnZXIpIHtcbiAgICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICAgIGNvbnN0IGFzdCA9XG4gICAgICAgICAgYnVpbGRBbmltYXRpb25Bc3QodGhpcy5fZHJpdmVyLCBtZXRhZGF0YSBhcyBBbmltYXRpb25NZXRhZGF0YSwgZXJyb3JzKSBhcyBUcmlnZ2VyQXN0O1xuICAgICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7bmFtZX1cIiBoYXMgZmFpbGVkIHRvIGJ1aWxkIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczpcXG4gLSAke2Vycm9ycy5qb2luKFwiXFxuIC0gXCIpfWApO1xuICAgICAgfVxuICAgICAgdHJpZ2dlciA9IGJ1aWxkVHJpZ2dlcihuYW1lLCBhc3QpO1xuICAgICAgdGhpcy5fdHJpZ2dlckNhY2hlW2NhY2hlS2V5XSA9IHRyaWdnZXI7XG4gICAgfVxuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUucmVnaXN0ZXJUcmlnZ2VyKG5hbWVzcGFjZUlkLCBuYW1lLCB0cmlnZ2VyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLnJlZ2lzdGVyKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCk7XG4gIH1cblxuICBkZXN0cm95KG5hbWVzcGFjZUlkOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUuZGVzdHJveShuYW1lc3BhY2VJZCwgY29udGV4dCk7XG4gIH1cblxuICBvbkluc2VydChuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmVudDogYW55LCBpbnNlcnRCZWZvcmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLmluc2VydE5vZGUobmFtZXNwYWNlSWQsIGVsZW1lbnQsIHBhcmVudCwgaW5zZXJ0QmVmb3JlKTtcbiAgfVxuXG4gIG9uUmVtb3ZlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55LCBpc0hvc3RFbGVtZW50PzogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUucmVtb3ZlTm9kZShuYW1lc3BhY2VJZCwgZWxlbWVudCwgaXNIb3N0RWxlbWVudCB8fCBmYWxzZSwgY29udGV4dCk7XG4gIH1cblxuICBkaXNhYmxlQW5pbWF0aW9ucyhlbGVtZW50OiBhbnksIGRpc2FibGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uRW5naW5lLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBkaXNhYmxlKTtcbiAgfVxuXG4gIHByb2Nlc3MobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBwcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKHByb3BlcnR5LmNoYXJBdCgwKSA9PSAnQCcpIHtcbiAgICAgIGNvbnN0IFtpZCwgYWN0aW9uXSA9IHBhcnNlVGltZWxpbmVDb21tYW5kKHByb3BlcnR5KTtcbiAgICAgIGNvbnN0IGFyZ3MgPSB2YWx1ZSBhcyBhbnlbXTtcbiAgICAgIHRoaXMuX3RpbWVsaW5lRW5naW5lLmNvbW1hbmQoaWQsIGVsZW1lbnQsIGFjdGlvbiwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUudHJpZ2dlcihuYW1lc3BhY2VJZCwgZWxlbWVudCwgcHJvcGVydHksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBsaXN0ZW4oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudFBoYXNlOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSk6ICgpID0+IGFueSB7XG4gICAgLy8gQEBsaXN0ZW5cbiAgICBpZiAoZXZlbnROYW1lLmNoYXJBdCgwKSA9PSAnQCcpIHtcbiAgICAgIGNvbnN0IFtpZCwgYWN0aW9uXSA9IHBhcnNlVGltZWxpbmVDb21tYW5kKGV2ZW50TmFtZSk7XG4gICAgICByZXR1cm4gdGhpcy5fdGltZWxpbmVFbmdpbmUubGlzdGVuKGlkLCBlbGVtZW50LCBhY3Rpb24sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb25FbmdpbmUubGlzdGVuKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBldmVudE5hbWUsIGV2ZW50UGhhc2UsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZsdXNoKG1pY3JvdGFza0lkOiBudW1iZXIgPSAtMSk6IHZvaWQgeyB0aGlzLl90cmFuc2l0aW9uRW5naW5lLmZsdXNoKG1pY3JvdGFza0lkKTsgfVxuXG4gIGdldCBwbGF5ZXJzKCk6IEFuaW1hdGlvblBsYXllcltdIHtcbiAgICByZXR1cm4gKHRoaXMuX3RyYW5zaXRpb25FbmdpbmUucGxheWVycyBhcyBBbmltYXRpb25QbGF5ZXJbXSlcbiAgICAgICAgLmNvbmNhdCh0aGlzLl90aW1lbGluZUVuZ2luZS5wbGF5ZXJzIGFzIEFuaW1hdGlvblBsYXllcltdKTtcbiAgfVxuXG4gIHdoZW5SZW5kZXJpbmdEb25lKCk6IFByb21pc2U8YW55PiB7IHJldHVybiB0aGlzLl90cmFuc2l0aW9uRW5naW5lLndoZW5SZW5kZXJpbmdEb25lKCk7IH1cbn1cbiJdfQ==