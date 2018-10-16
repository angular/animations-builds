/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { AnimationStateStyles, AnimationTransitionFactory } from './animation_transition_factory';
/**
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} ast
 * @return {?}
 */
export function buildTrigger(name, ast) {
    return new AnimationTrigger(name, ast);
}
/**
 * \@experimental Animation support is experimental.
 */
export class AnimationTrigger {
    /**
     * @param {?} name
     * @param {?} ast
     */
    constructor(name, ast) {
        this.name = name;
        this.ast = ast;
        this.transitionFactories = [];
        this.states = {};
        ast.states.forEach(ast => {
            /** @type {?} */
            const defaultParams = (ast.options && ast.options.params) || {};
            this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams);
        });
        balanceProperties(this.states, 'true', '1');
        balanceProperties(this.states, 'false', '0');
        ast.transitions.forEach(ast => {
            this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
        });
        this.fallbackTransition = createFallbackTransition(name, this.states);
    }
    /**
     * @return {?}
     */
    get containsQueries() { return this.ast.queryCount > 0; }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    matchTransition(currentState, nextState, element, params) {
        /** @type {?} */
        const entry = this.transitionFactories.find(f => f.match(currentState, nextState, element, params));
        return entry || null;
    }
    /**
     * @param {?} currentState
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    matchStyles(currentState, params, errors) {
        return this.fallbackTransition.buildStyles(currentState, params, errors);
    }
}
if (false) {
    /** @type {?} */
    AnimationTrigger.prototype.transitionFactories;
    /** @type {?} */
    AnimationTrigger.prototype.fallbackTransition;
    /** @type {?} */
    AnimationTrigger.prototype.states;
    /** @type {?} */
    AnimationTrigger.prototype.name;
    /** @type {?} */
    AnimationTrigger.prototype.ast;
}
/**
 * @param {?} triggerName
 * @param {?} states
 * @return {?}
 */
function createFallbackTransition(triggerName, states) {
    /** @type {?} */
    const matchers = [(fromState, toState) => true];
    /** @type {?} */
    const animation = { type: 2 /* Sequence */, steps: [], options: null };
    /** @type {?} */
    const transition = {
        type: 1 /* Transition */,
        animation,
        matchers,
        options: null,
        queryCount: 0,
        depCount: 0
    };
    return new AnimationTransitionFactory(triggerName, transition, states);
}
/**
 * @param {?} obj
 * @param {?} key1
 * @param {?} key2
 * @return {?}
 */
function balanceProperties(obj, key1, key2) {
    if (obj.hasOwnProperty(key1)) {
        if (!obj.hasOwnProperty(key2)) {
            obj[key2] = obj[key1];
        }
    }
    else if (obj.hasOwnProperty(key2)) {
        obj[key1] = obj[key2];
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBWUEsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7Ozs7Ozs7QUFPaEcsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFZLEVBQUUsR0FBZTtJQUN4RCxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hDOzs7O0FBS0QsTUFBTSxPQUFPLGdCQUFnQjs7Ozs7SUFLM0IsWUFBbUIsSUFBWSxFQUFTLEdBQWU7UUFBcEMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVk7bUNBSkksRUFBRTtzQkFFQSxFQUFFO1FBRzdELEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztZQUN2QixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzVFLENBQUMsQ0FBQztRQUVILGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3ZGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZFOzs7O0lBRUQsSUFBSSxlQUFlLEtBQUssT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRTs7Ozs7Ozs7SUFFekQsZUFBZSxDQUFDLFlBQWlCLEVBQUUsU0FBYyxFQUFFLE9BQVksRUFBRSxNQUE0Qjs7UUFFM0YsTUFBTSxLQUFLLEdBQ1AsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxRixPQUFPLEtBQUssSUFBSSxJQUFJLENBQUM7S0FDdEI7Ozs7Ozs7SUFFRCxXQUFXLENBQUMsWUFBaUIsRUFBRSxNQUE0QixFQUFFLE1BQWE7UUFDeEUsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUU7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsU0FBUyx3QkFBd0IsQ0FDN0IsV0FBbUIsRUFDbkIsTUFBbUQ7O0lBQ3JELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFjLEVBQUUsT0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7SUFDMUQsTUFBTSxTQUFTLEdBQWdCLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQzs7SUFDaEcsTUFBTSxVQUFVLEdBQWtCO1FBQ2hDLElBQUksb0JBQWtDO1FBQ3RDLFNBQVM7UUFDVCxRQUFRO1FBQ1IsT0FBTyxFQUFFLElBQUk7UUFDYixVQUFVLEVBQUUsQ0FBQztRQUNiLFFBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztJQUNGLE9BQU8sSUFBSSwwQkFBMEIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ3hFOzs7Ozs7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxHQUF5QixFQUFFLElBQVksRUFBRSxJQUFZO0lBQzlFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0Y7U0FBTSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25NZXRhZGF0YVR5cGUsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtjb3B5U3R5bGVzLCBpbnRlcnBvbGF0ZVBhcmFtc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U2VxdWVuY2VBc3QsIFN0eWxlQXN0LCBUcmFuc2l0aW9uQXN0LCBUcmlnZ2VyQXN0fSBmcm9tICcuL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25TdGF0ZVN0eWxlcywgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnl9IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5cblxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRUcmlnZ2VyKG5hbWU6IHN0cmluZywgYXN0OiBUcmlnZ2VyQXN0KTogQW5pbWF0aW9uVHJpZ2dlciB7XG4gIHJldHVybiBuZXcgQW5pbWF0aW9uVHJpZ2dlcihuYW1lLCBhc3QpO1xufVxuXG4vKipcbiogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4qL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyaWdnZXIge1xuICBwdWJsaWMgdHJhbnNpdGlvbkZhY3RvcmllczogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3RvcnlbXSA9IFtdO1xuICBwdWJsaWMgZmFsbGJhY2tUcmFuc2l0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeTtcbiAgcHVibGljIHN0YXRlczoge1tzdGF0ZU5hbWU6IHN0cmluZ106IEFuaW1hdGlvblN0YXRlU3R5bGVzfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhc3Q6IFRyaWdnZXJBc3QpIHtcbiAgICBhc3Quc3RhdGVzLmZvckVhY2goYXN0ID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRQYXJhbXMgPSAoYXN0Lm9wdGlvbnMgJiYgYXN0Lm9wdGlvbnMucGFyYW1zKSB8fCB7fTtcbiAgICAgIHRoaXMuc3RhdGVzW2FzdC5uYW1lXSA9IG5ldyBBbmltYXRpb25TdGF0ZVN0eWxlcyhhc3Quc3R5bGUsIGRlZmF1bHRQYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgYmFsYW5jZVByb3BlcnRpZXModGhpcy5zdGF0ZXMsICd0cnVlJywgJzEnKTtcbiAgICBiYWxhbmNlUHJvcGVydGllcyh0aGlzLnN0YXRlcywgJ2ZhbHNlJywgJzAnKTtcblxuICAgIGFzdC50cmFuc2l0aW9ucy5mb3JFYWNoKGFzdCA9PiB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25GYWN0b3JpZXMucHVzaChuZXcgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3RvcnkobmFtZSwgYXN0LCB0aGlzLnN0YXRlcykpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5mYWxsYmFja1RyYW5zaXRpb24gPSBjcmVhdGVGYWxsYmFja1RyYW5zaXRpb24obmFtZSwgdGhpcy5zdGF0ZXMpO1xuICB9XG5cbiAgZ2V0IGNvbnRhaW5zUXVlcmllcygpIHsgcmV0dXJuIHRoaXMuYXN0LnF1ZXJ5Q291bnQgPiAwOyB9XG5cbiAgbWF0Y2hUcmFuc2l0aW9uKGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSwgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTpcbiAgICAgIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fG51bGwge1xuICAgIGNvbnN0IGVudHJ5ID1cbiAgICAgICAgdGhpcy50cmFuc2l0aW9uRmFjdG9yaWVzLmZpbmQoZiA9PiBmLm1hdGNoKGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBlbGVtZW50LCBwYXJhbXMpKTtcbiAgICByZXR1cm4gZW50cnkgfHwgbnVsbDtcbiAgfVxuXG4gIG1hdGNoU3R5bGVzKGN1cnJlbnRTdGF0ZTogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IGFueVtdKTogybVTdHlsZURhdGEge1xuICAgIHJldHVybiB0aGlzLmZhbGxiYWNrVHJhbnNpdGlvbi5idWlsZFN0eWxlcyhjdXJyZW50U3RhdGUsIHBhcmFtcywgZXJyb3JzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVGYWxsYmFja1RyYW5zaXRpb24oXG4gICAgdHJpZ2dlck5hbWU6IHN0cmluZyxcbiAgICBzdGF0ZXM6IHtbc3RhdGVOYW1lOiBzdHJpbmddOiBBbmltYXRpb25TdGF0ZVN0eWxlc30pOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeSB7XG4gIGNvbnN0IG1hdGNoZXJzID0gWyhmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KSA9PiB0cnVlXTtcbiAgY29uc3QgYW5pbWF0aW9uOiBTZXF1ZW5jZUFzdCA9IHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzOiBbXSwgb3B0aW9uczogbnVsbH07XG4gIGNvbnN0IHRyYW5zaXRpb246IFRyYW5zaXRpb25Bc3QgPSB7XG4gICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb24sXG4gICAgYW5pbWF0aW9uLFxuICAgIG1hdGNoZXJzLFxuICAgIG9wdGlvbnM6IG51bGwsXG4gICAgcXVlcnlDb3VudDogMCxcbiAgICBkZXBDb3VudDogMFxuICB9O1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5KHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBzdGF0ZXMpO1xufVxuXG5mdW5jdGlvbiBiYWxhbmNlUHJvcGVydGllcyhvYmo6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXkxOiBzdHJpbmcsIGtleTI6IHN0cmluZykge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTEpKSB7XG4gICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5MikpIHtcbiAgICAgIG9ialtrZXkyXSA9IG9ialtrZXkxXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTIpKSB7XG4gICAgb2JqW2tleTFdID0gb2JqW2tleTJdO1xuICB9XG59XG4iXX0=