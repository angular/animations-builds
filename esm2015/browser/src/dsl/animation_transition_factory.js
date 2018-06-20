/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { getOrSetAsInMap } from '../render/shared';
import { copyObj, interpolateParams, iteratorToArray } from '../util';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { createTransitionInstruction } from './animation_transition_instruction';
const /** @type {?} */ EMPTY_OBJECT = {};
export class AnimationTransitionFactory {
    /**
     * @param {?} _triggerName
     * @param {?} ast
     * @param {?} _stateStyles
     */
    constructor(_triggerName, ast, _stateStyles) {
        this._triggerName = _triggerName;
        this.ast = ast;
        this._stateStyles = _stateStyles;
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    match(currentState, nextState, element, params) {
        return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
    }
    /**
     * @param {?} stateName
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(stateName, params, errors) {
        const /** @type {?} */ backupStateStyler = this._stateStyles['*'];
        const /** @type {?} */ stateStyler = this._stateStyles[stateName];
        const /** @type {?} */ backupStyles = backupStateStyler ? backupStateStyler.buildStyles(params, errors) : {};
        return stateStyler ? stateStyler.buildStyles(params, errors) : backupStyles;
    }
    /**
     * @param {?} driver
     * @param {?} element
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} enterClassName
     * @param {?} leaveClassName
     * @param {?=} currentOptions
     * @param {?=} nextOptions
     * @param {?=} subInstructions
     * @param {?=} skipAstBuild
     * @return {?}
     */
    build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions, skipAstBuild) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
        const /** @type {?} */ currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
        const /** @type {?} */ currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
        const /** @type {?} */ nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
        const /** @type {?} */ nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
        const /** @type {?} */ queriedElements = new Set();
        const /** @type {?} */ preStyleMap = new Map();
        const /** @type {?} */ postStyleMap = new Map();
        const /** @type {?} */ isRemoval = nextState === 'void';
        const /** @type {?} */ animationOptions = { params: Object.assign({}, transitionAnimationParams, nextAnimationParams) };
        const /** @type {?} */ timelines = skipAstBuild ? [] : buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
        let /** @type {?} */ totalTime = 0;
        timelines.forEach(tl => { totalTime = Math.max(tl.duration + tl.delay, totalTime); });
        if (errors.length) {
            return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
        }
        timelines.forEach(tl => {
            const /** @type {?} */ elm = tl.element;
            const /** @type {?} */ preProps = getOrSetAsInMap(preStyleMap, elm, {});
            tl.preStyleProps.forEach(prop => preProps[prop] = true);
            const /** @type {?} */ postProps = getOrSetAsInMap(postStyleMap, elm, {});
            tl.postStyleProps.forEach(prop => postProps[prop] = true);
            if (elm !== element) {
                queriedElements.add(elm);
            }
        });
        const /** @type {?} */ queriedElementsList = iteratorToArray(queriedElements.values());
        return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap, totalTime);
    }
}
function AnimationTransitionFactory_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTransitionFactory.prototype._triggerName;
    /** @type {?} */
    AnimationTransitionFactory.prototype.ast;
    /** @type {?} */
    AnimationTransitionFactory.prototype._stateStyles;
}
/**
 * @param {?} matchFns
 * @param {?} currentState
 * @param {?} nextState
 * @param {?} element
 * @param {?} params
 * @return {?}
 */
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
    return matchFns.some(fn => fn(currentState, nextState, element, params));
}
export class AnimationStateStyles {
    /**
     * @param {?} styles
     * @param {?} defaultParams
     */
    constructor(styles, defaultParams) {
        this.styles = styles;
        this.defaultParams = defaultParams;
    }
    /**
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(params, errors) {
        const /** @type {?} */ finalStyles = {};
        const /** @type {?} */ combinedParams = copyObj(this.defaultParams);
        Object.keys(params).forEach(key => {
            const /** @type {?} */ value = params[key];
            if (value != null) {
                combinedParams[key] = value;
            }
        });
        this.styles.styles.forEach(value => {
            if (typeof value !== 'string') {
                const /** @type {?} */ styleObj = /** @type {?} */ (value);
                Object.keys(styleObj).forEach(prop => {
                    let /** @type {?} */ val = styleObj[prop];
                    if (val.length > 1) {
                        val = interpolateParams(val, combinedParams, errors);
                    }
                    finalStyles[prop] = val;
                });
            }
        });
        return finalStyles;
    }
}
function AnimationStateStyles_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationStateStyles.prototype.styles;
    /** @type {?} */
    AnimationStateStyles.prototype.defaultParams;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVVBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBd0IsTUFBTSxTQUFTLENBQUM7QUFHM0YsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFpQywyQkFBMkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBRy9HLHVCQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFFeEIsTUFBTTs7Ozs7O0lBQ0osWUFDWSxjQUE2QixHQUFrQixFQUMvQztRQURBLGlCQUFZLEdBQVosWUFBWTtRQUFpQixRQUFHLEdBQUgsR0FBRyxDQUFlO1FBQy9DLGlCQUFZLEdBQVosWUFBWTtLQUFpRDs7Ozs7Ozs7SUFFekUsS0FBSyxDQUFDLFlBQWlCLEVBQUUsU0FBYyxFQUFFLE9BQVksRUFBRSxNQUE0QjtRQUNqRixPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQy9GOzs7Ozs7O0lBRUQsV0FBVyxDQUFDLFNBQWlCLEVBQUUsTUFBNEIsRUFBRSxNQUFhO1FBQ3hFLHVCQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsdUJBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsdUJBQU0sWUFBWSxHQUFH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TSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQyx1QkFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDakIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUM3QjtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsdUJBQU0sUUFBUSxxQkFBRyxLQUFZLENBQUEsQ0FBQztnQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ25DLHFCQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pCLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xCLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUN0RDtvQkFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUN6QixDQUFDLENBQUM7YUFDSjtTQUNGLENBQUMsQ0FBQztRQUNILE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbk9wdGlvbnMsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uL3JlbmRlci9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Z2V0T3JTZXRBc0luTWFwfSBmcm9tICcuLi9yZW5kZXIvc2hhcmVkJztcbmltcG9ydCB7Y29weU9iaiwgaW50ZXJwb2xhdGVQYXJhbXMsIGl0ZXJhdG9yVG9BcnJheSwgbWVyZ2VBbmltYXRpb25PcHRpb25zfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtTdHlsZUFzdCwgVHJhbnNpdGlvbkFzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25UaW1lbGluZXN9IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXInO1xuaW1wb3J0IHtUcmFuc2l0aW9uTWF0Y2hlckZufSBmcm9tICcuL2FuaW1hdGlvbl90cmFuc2l0aW9uX2V4cHInO1xuaW1wb3J0IHtBbmltYXRpb25UcmFuc2l0aW9uSW5zdHJ1Y3Rpb24sIGNyZWF0ZVRyYW5zaXRpb25JbnN0cnVjdGlvbn0gZnJvbSAnLi9hbmltYXRpb25fdHJhbnNpdGlvbl9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi9lbGVtZW50X2luc3RydWN0aW9uX21hcCc7XG5cbmNvbnN0IEVNUFRZX09CSkVDVCA9IHt9O1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3RyaWdnZXJOYW1lOiBzdHJpbmcsIHB1YmxpYyBhc3Q6IFRyYW5zaXRpb25Bc3QsXG4gICAgICBwcml2YXRlIF9zdGF0ZVN0eWxlczoge1tzdGF0ZU5hbWU6IHN0cmluZ106IEFuaW1hdGlvblN0YXRlU3R5bGVzfSkge31cblxuICBtYXRjaChjdXJyZW50U3RhdGU6IGFueSwgbmV4dFN0YXRlOiBhbnksIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBvbmVPck1vcmVUcmFuc2l0aW9uc01hdGNoKHRoaXMuYXN0Lm1hdGNoZXJzLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKTtcbiAgfVxuXG4gIGJ1aWxkU3R5bGVzKHN0YXRlTmFtZTogc3RyaW5nLCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IGFueVtdKSB7XG4gICAgY29uc3QgYmFja3VwU3RhdGVTdHlsZXIgPSB0aGlzLl9zdGF0ZVN0eWxlc1snKiddO1xuICAgIGNvbnN0IHN0YXRlU3R5bGVyID0gdGhpcy5fc3RhdGVTdHlsZXNbc3RhdGVOYW1lXTtcbiAgICBjb25zdCBiYWNrdXBTdHlsZXMgPSBiYWNrdXBTdGF0ZVN0eWxlciA/IGJhY2t1cFN0YXRlU3R5bGVyLmJ1aWxkU3R5bGVzKHBhcmFtcywgZXJyb3JzKSA6IHt9O1xuICAgIHJldHVybiBzdGF0ZVN0eWxlciA/IHN0YXRlU3R5bGVyLmJ1aWxkU3R5bGVzKHBhcmFtcywgZXJyb3JzKSA6IGJhY2t1cFN0eWxlcztcbiAgfVxuXG4gIGJ1aWxkKFxuICAgICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnQ6IGFueSwgY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LFxuICAgICAgZW50ZXJDbGFzc05hbWU6IHN0cmluZywgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgY3VycmVudE9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zLFxuICAgICAgbmV4dE9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zLCBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsXG4gICAgICBza2lwQXN0QnVpbGQ/OiBib29sZWFuKTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uIHtcbiAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG5cbiAgICBjb25zdCB0cmFuc2l0aW9uQW5pbWF0aW9uUGFyYW1zID0gdGhpcy5hc3Qub3B0aW9ucyAmJiB0aGlzLmFzdC5vcHRpb25zLnBhcmFtcyB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgY29uc3QgY3VycmVudEFuaW1hdGlvblBhcmFtcyA9IGN1cnJlbnRPcHRpb25zICYmIGN1cnJlbnRPcHRpb25zLnBhcmFtcyB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgY29uc3QgY3VycmVudFN0YXRlU3R5bGVzID0gdGhpcy5idWlsZFN0eWxlcyhjdXJyZW50U3RhdGUsIGN1cnJlbnRBbmltYXRpb25QYXJhbXMsIGVycm9ycyk7XG4gICAgY29uc3QgbmV4dEFuaW1hdGlvblBhcmFtcyA9IG5leHRPcHRpb25zICYmIG5leHRPcHRpb25zLnBhcmFtcyB8fCBFTVBUWV9PQkpFQ1Q7XG4gICAgY29uc3QgbmV4dFN0YXRlU3R5bGVzID0gdGhpcy5idWlsZFN0eWxlcyhuZXh0U3RhdGUsIG5leHRBbmltYXRpb25QYXJhbXMsIGVycm9ycyk7XG5cbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBwcmVTdHlsZU1hcCA9IG5ldyBNYXA8YW55LCB7W3Byb3A6IHN0cmluZ106IGJvb2xlYW59PigpO1xuICAgIGNvbnN0IHBvc3RTdHlsZU1hcCA9IG5ldyBNYXA8YW55LCB7W3Byb3A6IHN0cmluZ106IGJvb2xlYW59PigpO1xuICAgIGNvbnN0IGlzUmVtb3ZhbCA9IG5leHRTdGF0ZSA9PT0gJ3ZvaWQnO1xuXG4gICAgY29uc3QgYW5pbWF0aW9uT3B0aW9ucyA9IHtwYXJhbXM6IHsuLi50cmFuc2l0aW9uQW5pbWF0aW9uUGFyYW1zLCAuLi5uZXh0QW5pbWF0aW9uUGFyYW1zfX07XG5cbiAgICBjb25zdCB0aW1lbGluZXMgPSBza2lwQXN0QnVpbGQgPyBbXSA6IGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyaXZlciwgZWxlbWVudCwgdGhpcy5hc3QuYW5pbWF0aW9uLCBlbnRlckNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWF2ZUNsYXNzTmFtZSwgY3VycmVudFN0YXRlU3R5bGVzLCBuZXh0U3RhdGVTdHlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zLCBlcnJvcnMpO1xuXG4gICAgbGV0IHRvdGFsVGltZSA9IDA7XG4gICAgdGltZWxpbmVzLmZvckVhY2godGwgPT4geyB0b3RhbFRpbWUgPSBNYXRoLm1heCh0bC5kdXJhdGlvbiArIHRsLmRlbGF5LCB0b3RhbFRpbWUpOyB9KTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlVHJhbnNpdGlvbkluc3RydWN0aW9uKFxuICAgICAgICAgIGVsZW1lbnQsIHRoaXMuX3RyaWdnZXJOYW1lLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgaXNSZW1vdmFsLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCBbXSwgW10sIHByZVN0eWxlTWFwLCBwb3N0U3R5bGVNYXAsIHRvdGFsVGltZSwgZXJyb3JzKTtcbiAgICB9XG5cbiAgICB0aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB7XG4gICAgICBjb25zdCBlbG0gPSB0bC5lbGVtZW50O1xuICAgICAgY29uc3QgcHJlUHJvcHMgPSBnZXRPclNldEFzSW5NYXAocHJlU3R5bGVNYXAsIGVsbSwge30pO1xuICAgICAgdGwucHJlU3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gcHJlUHJvcHNbcHJvcF0gPSB0cnVlKTtcblxuICAgICAgY29uc3QgcG9zdFByb3BzID0gZ2V0T3JTZXRBc0luTWFwKHBvc3RTdHlsZU1hcCwgZWxtLCB7fSk7XG4gICAgICB0bC5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gcG9zdFByb3BzW3Byb3BdID0gdHJ1ZSk7XG5cbiAgICAgIGlmIChlbG0gIT09IGVsZW1lbnQpIHtcbiAgICAgICAgcXVlcmllZEVsZW1lbnRzLmFkZChlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzTGlzdCA9IGl0ZXJhdG9yVG9BcnJheShxdWVyaWVkRWxlbWVudHMudmFsdWVzKCkpO1xuICAgIHJldHVybiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgIGVsZW1lbnQsIHRoaXMuX3RyaWdnZXJOYW1lLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgaXNSZW1vdmFsLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgIG5leHRTdGF0ZVN0eWxlcywgdGltZWxpbmVzLCBxdWVyaWVkRWxlbWVudHNMaXN0LCBwcmVTdHlsZU1hcCwgcG9zdFN0eWxlTWFwLCB0b3RhbFRpbWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uZU9yTW9yZVRyYW5zaXRpb25zTWF0Y2goXG4gICAgbWF0Y2hGbnM6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSwgY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LCBlbGVtZW50OiBhbnksXG4gICAgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF0Y2hGbnMuc29tZShmbiA9PiBmbihjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25TdGF0ZVN0eWxlcyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3R5bGVzOiBTdHlsZUFzdCwgcHJpdmF0ZSBkZWZhdWx0UGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSkge31cblxuICBidWlsZFN0eWxlcyhwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IHN0cmluZ1tdKTogybVTdHlsZURhdGEge1xuICAgIGNvbnN0IGZpbmFsU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuICAgIGNvbnN0IGNvbWJpbmVkUGFyYW1zID0gY29weU9iaih0aGlzLmRlZmF1bHRQYXJhbXMpO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXNba2V5XTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGNvbWJpbmVkUGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnN0eWxlcy5zdHlsZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBzdHlsZU9iaiA9IHZhbHVlIGFzIGFueTtcbiAgICAgICAgT2JqZWN0LmtleXMoc3R5bGVPYmopLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgbGV0IHZhbCA9IHN0eWxlT2JqW3Byb3BdO1xuICAgICAgICAgIGlmICh2YWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFsID0gaW50ZXJwb2xhdGVQYXJhbXModmFsLCBjb21iaW5lZFBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmluYWxTdHlsZXNbcHJvcF0gPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFN0eWxlcztcbiAgfVxufVxuIl19