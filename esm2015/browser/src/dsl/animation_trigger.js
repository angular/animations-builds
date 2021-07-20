import { AnimationStateStyles, AnimationTransitionFactory } from './animation_transition_factory';
export function buildTrigger(name, ast, normalizer) {
    return new AnimationTrigger(name, ast, normalizer);
}
export class AnimationTrigger {
    constructor(name, ast, _normalizer) {
        this.name = name;
        this.ast = ast;
        this._normalizer = _normalizer;
        this.transitionFactories = [];
        this.states = {};
        ast.states.forEach(ast => {
            const defaultParams = (ast.options && ast.options.params) || {};
            this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams, _normalizer);
        });
        balanceProperties(this.states, 'true', '1');
        balanceProperties(this.states, 'false', '0');
        ast.transitions.forEach(ast => {
            this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
        });
        this.fallbackTransition = createFallbackTransition(name, this.states, this._normalizer);
    }
    get containsQueries() {
        return this.ast.queryCount > 0;
    }
    matchTransition(currentState, nextState, element, params) {
        const entry = this.transitionFactories.find(f => f.match(currentState, nextState, element, params));
        return entry || null;
    }
    matchStyles(currentState, params, errors) {
        return this.fallbackTransition.buildStyles(currentState, params, errors);
    }
}
function createFallbackTransition(triggerName, states, normalizer) {
    const matchers = [(fromState, toState) => true];
    const animation = { type: 2 /* Sequence */, steps: [], options: null };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUtoRyxNQUFNLFVBQVUsWUFBWSxDQUN4QixJQUFZLEVBQUUsR0FBZSxFQUFFLFVBQW9DO0lBQ3JFLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRCxNQUFNLE9BQU8sZ0JBQWdCO0lBSzNCLFlBQ1csSUFBWSxFQUFTLEdBQWUsRUFBVSxXQUFxQztRQUFuRixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBWTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUEwQjtRQUx2Rix3QkFBbUIsR0FBaUMsRUFBRSxDQUFDO1FBRXZELFdBQU0sR0FBZ0QsRUFBRSxDQUFDO1FBSTlELEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0MsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLDBCQUEwQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRCxJQUFJLGVBQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELGVBQWUsQ0FBQyxZQUFpQixFQUFFLFNBQWMsRUFBRSxPQUFZLEVBQUUsTUFBNEI7UUFFM0YsTUFBTSxLQUFLLEdBQ1AsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxRixPQUFPLEtBQUssSUFBSSxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVELFdBQVcsQ0FBQyxZQUFpQixFQUFFLE1BQTRCLEVBQUUsTUFBYTtRQUN4RSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzRSxDQUFDO0NBQ0Y7QUFFRCxTQUFTLHdCQUF3QixDQUM3QixXQUFtQixFQUFFLE1BQW1ELEVBQ3hFLFVBQW9DO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFjLEVBQUUsT0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRCxNQUFNLFNBQVMsR0FBZ0IsRUFBQyxJQUFJLGtCQUFnQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ2hHLE1BQU0sVUFBVSxHQUFrQjtRQUNoQyxJQUFJLG9CQUFrQztRQUN0QyxTQUFTO1FBQ1QsUUFBUTtRQUNSLE9BQU8sRUFBRSxJQUFJO1FBQ2IsVUFBVSxFQUFFLENBQUM7UUFDYixRQUFRLEVBQUUsQ0FBQztLQUNaLENBQUM7SUFDRixPQUFPLElBQUksMEJBQTBCLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxHQUF5QixFQUFFLElBQVksRUFBRSxJQUFZO0lBQzlFLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0Y7U0FBTSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uTWV0YWRhdGFUeXBlLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1NlcXVlbmNlQXN0LCBUcmFuc2l0aW9uQXN0LCBUcmlnZ2VyQXN0fSBmcm9tICcuL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25TdGF0ZVN0eWxlcywgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnl9IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFRyaWdnZXIoXG4gICAgbmFtZTogc3RyaW5nLCBhc3Q6IFRyaWdnZXJBc3QsIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcik6IEFuaW1hdGlvblRyaWdnZXIge1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRyaWdnZXIobmFtZSwgYXN0LCBub3JtYWxpemVyKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyaWdnZXIge1xuICBwdWJsaWMgdHJhbnNpdGlvbkZhY3RvcmllczogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3RvcnlbXSA9IFtdO1xuICBwdWJsaWMgZmFsbGJhY2tUcmFuc2l0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeTtcbiAgcHVibGljIHN0YXRlczoge1tzdGF0ZU5hbWU6IHN0cmluZ106IEFuaW1hdGlvblN0YXRlU3R5bGVzfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGFzdDogVHJpZ2dlckFzdCwgcHJpdmF0ZSBfbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7XG4gICAgYXN0LnN0YXRlcy5mb3JFYWNoKGFzdCA9PiB7XG4gICAgICBjb25zdCBkZWZhdWx0UGFyYW1zID0gKGFzdC5vcHRpb25zICYmIGFzdC5vcHRpb25zLnBhcmFtcykgfHwge307XG4gICAgICB0aGlzLnN0YXRlc1thc3QubmFtZV0gPSBuZXcgQW5pbWF0aW9uU3RhdGVTdHlsZXMoYXN0LnN0eWxlLCBkZWZhdWx0UGFyYW1zLCBfbm9ybWFsaXplcik7XG4gICAgfSk7XG5cbiAgICBiYWxhbmNlUHJvcGVydGllcyh0aGlzLnN0YXRlcywgJ3RydWUnLCAnMScpO1xuICAgIGJhbGFuY2VQcm9wZXJ0aWVzKHRoaXMuc3RhdGVzLCAnZmFsc2UnLCAnMCcpO1xuXG4gICAgYXN0LnRyYW5zaXRpb25zLmZvckVhY2goYXN0ID0+IHtcbiAgICAgIHRoaXMudHJhbnNpdGlvbkZhY3Rvcmllcy5wdXNoKG5ldyBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeShuYW1lLCBhc3QsIHRoaXMuc3RhdGVzKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmZhbGxiYWNrVHJhbnNpdGlvbiA9IGNyZWF0ZUZhbGxiYWNrVHJhbnNpdGlvbihuYW1lLCB0aGlzLnN0YXRlcywgdGhpcy5fbm9ybWFsaXplcik7XG4gIH1cblxuICBnZXQgY29udGFpbnNRdWVyaWVzKCkge1xuICAgIHJldHVybiB0aGlzLmFzdC5xdWVyeUNvdW50ID4gMDtcbiAgfVxuXG4gIG1hdGNoVHJhbnNpdGlvbihjdXJyZW50U3RhdGU6IGFueSwgbmV4dFN0YXRlOiBhbnksIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6XG4gICAgICBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeXxudWxsIHtcbiAgICBjb25zdCBlbnRyeSA9XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbkZhY3Rvcmllcy5maW5kKGYgPT4gZi5tYXRjaChjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKSk7XG4gICAgcmV0dXJuIGVudHJ5IHx8IG51bGw7XG4gIH1cblxuICBtYXRjaFN0eWxlcyhjdXJyZW50U3RhdGU6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBhbnlbXSk6IMm1U3R5bGVEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5mYWxsYmFja1RyYW5zaXRpb24uYnVpbGRTdHlsZXMoY3VycmVudFN0YXRlLCBwYXJhbXMsIGVycm9ycyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRmFsbGJhY2tUcmFuc2l0aW9uKFxuICAgIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHN0YXRlczoge1tzdGF0ZU5hbWU6IHN0cmluZ106IEFuaW1hdGlvblN0YXRlU3R5bGVzfSxcbiAgICBub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIpOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeSB7XG4gIGNvbnN0IG1hdGNoZXJzID0gWyhmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KSA9PiB0cnVlXTtcbiAgY29uc3QgYW5pbWF0aW9uOiBTZXF1ZW5jZUFzdCA9IHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzOiBbXSwgb3B0aW9uczogbnVsbH07XG4gIGNvbnN0IHRyYW5zaXRpb246IFRyYW5zaXRpb25Bc3QgPSB7XG4gICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb24sXG4gICAgYW5pbWF0aW9uLFxuICAgIG1hdGNoZXJzLFxuICAgIG9wdGlvbnM6IG51bGwsXG4gICAgcXVlcnlDb3VudDogMCxcbiAgICBkZXBDb3VudDogMFxuICB9O1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5KHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBzdGF0ZXMpO1xufVxuXG5mdW5jdGlvbiBiYWxhbmNlUHJvcGVydGllcyhvYmo6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXkxOiBzdHJpbmcsIGtleTI6IHN0cmluZykge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTEpKSB7XG4gICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5MikpIHtcbiAgICAgIG9ialtrZXkyXSA9IG9ialtrZXkxXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTIpKSB7XG4gICAgb2JqW2tleTFdID0gb2JqW2tleTJdO1xuICB9XG59XG4iXX0=