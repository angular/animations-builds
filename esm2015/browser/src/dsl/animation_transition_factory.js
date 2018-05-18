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
     * @return {?}
     */
    build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions) {
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
        const /** @type {?} */ timelines = buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVVBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBd0IsTUFBTSxTQUFTLENBQUM7QUFHM0YsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFpQywyQkFBMkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBRy9HLHVCQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFFeEIsTUFBTTs7Ozs7O0lBQ0osWUFDWSxjQUE2QixHQUFrQixFQUMvQztRQURBLGlCQUFZLEdBQVosWUFBWTtRQUFpQixRQUFHLEdBQUgsR0FBRyxDQUFlO1FBQy9DLGlCQUFZLEdBQVosWUFBWTtLQUFpRDs7Ozs7Ozs7SUFFekUsS0FBSyxDQUFDLFlBQWlCLEVBQUUsU0FBYyxFQUFFLE9BQVksRUFBRSxNQUE0QjtRQUNqRixPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQy9GOzs7Ozs7O0lBRUQsV0FBVyxDQUFDLFNBQWlCLEVBQUUsTUFBNEIsRUFBRSxNQUFhO1FBQ3hFLHVCQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsdUJBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsdUJBQU0sWUFBWSxHQUFH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TUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDaEMsdUJBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7Z0JBQ2pCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDN0I7U0FDRixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLHVCQUFNLFFBQVEscUJBQUcsS0FBWSxDQUFBLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNuQyxxQkFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNsQixHQUFHLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDdEQ7b0JBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztpQkFDekIsQ0FBQyxDQUFDO2FBQ0o7U0FDRixDQUFDLENBQUM7UUFDSCxPQUFPLFdBQVcsQ0FBQztLQUNwQjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25PcHRpb25zLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0QXNJbk1hcH0gZnJvbSAnLi4vcmVuZGVyL3NoYXJlZCc7XG5pbXBvcnQge2NvcHlPYmosIGludGVycG9sYXRlUGFyYW1zLCBpdGVyYXRvclRvQXJyYXksIG1lcmdlQW5pbWF0aW9uT3B0aW9uc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U3R5bGVBc3QsIFRyYW5zaXRpb25Bc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge2J1aWxkQW5pbWF0aW9uVGltZWxpbmVzfSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9idWlsZGVyJztcbmltcG9ydCB7VHJhbnNpdGlvbk1hdGNoZXJGbn0gZnJvbSAnLi9hbmltYXRpb25fdHJhbnNpdGlvbl9leHByJztcbmltcG9ydCB7QW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLCBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4vZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuXG5jb25zdCBFTVBUWV9PQkpFQ1QgPSB7fTtcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF90cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgYXN0OiBUcmFuc2l0aW9uQXN0LFxuICAgICAgcHJpdmF0ZSBfc3RhdGVTdHlsZXM6IHtbc3RhdGVOYW1lOiBzdHJpbmddOiBBbmltYXRpb25TdGF0ZVN0eWxlc30pIHt9XG5cbiAgbWF0Y2goY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICByZXR1cm4gb25lT3JNb3JlVHJhbnNpdGlvbnNNYXRjaCh0aGlzLmFzdC5tYXRjaGVycywgY3VycmVudFN0YXRlLCBuZXh0U3RhdGUsIGVsZW1lbnQsIHBhcmFtcyk7XG4gIH1cblxuICBidWlsZFN0eWxlcyhzdGF0ZU5hbWU6IHN0cmluZywgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBhbnlbXSkge1xuICAgIGNvbnN0IGJhY2t1cFN0YXRlU3R5bGVyID0gdGhpcy5fc3RhdGVTdHlsZXNbJyonXTtcbiAgICBjb25zdCBzdGF0ZVN0eWxlciA9IHRoaXMuX3N0YXRlU3R5bGVzW3N0YXRlTmFtZV07XG4gICAgY29uc3QgYmFja3VwU3R5bGVzID0gYmFja3VwU3RhdGVTdHlsZXIgPyBiYWNrdXBTdGF0ZVN0eWxlci5idWlsZFN0eWxlcyhwYXJhbXMsIGVycm9ycykgOiB7fTtcbiAgICByZXR1cm4gc3RhdGVTdHlsZXIgPyBzdGF0ZVN0eWxlci5idWlsZFN0eWxlcyhwYXJhbXMsIGVycm9ycykgOiBiYWNrdXBTdHlsZXM7XG4gIH1cblxuICBidWlsZChcbiAgICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBlbGVtZW50OiBhbnksIGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSxcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIGN1cnJlbnRPcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgIG5leHRPcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgIHN1Ykluc3RydWN0aW9ucz86IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCk6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiB7XG4gICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuXG4gICAgY29uc3QgdHJhbnNpdGlvbkFuaW1hdGlvblBhcmFtcyA9IHRoaXMuYXN0Lm9wdGlvbnMgJiYgdGhpcy5hc3Qub3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IGN1cnJlbnRBbmltYXRpb25QYXJhbXMgPSBjdXJyZW50T3B0aW9ucyAmJiBjdXJyZW50T3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZVN0eWxlcyA9IHRoaXMuYnVpbGRTdHlsZXMoY3VycmVudFN0YXRlLCBjdXJyZW50QW5pbWF0aW9uUGFyYW1zLCBlcnJvcnMpO1xuICAgIGNvbnN0IG5leHRBbmltYXRpb25QYXJhbXMgPSBuZXh0T3B0aW9ucyAmJiBuZXh0T3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IG5leHRTdGF0ZVN0eWxlcyA9IHRoaXMuYnVpbGRTdHlsZXMobmV4dFN0YXRlLCBuZXh0QW5pbWF0aW9uUGFyYW1zLCBlcnJvcnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgcHJlU3R5bGVNYXAgPSBuZXcgTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4oKTtcbiAgICBjb25zdCBwb3N0U3R5bGVNYXAgPSBuZXcgTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4oKTtcbiAgICBjb25zdCBpc1JlbW92YWwgPSBuZXh0U3RhdGUgPT09ICd2b2lkJztcblxuICAgIGNvbnN0IGFuaW1hdGlvbk9wdGlvbnMgPSB7cGFyYW1zOiB7Li4udHJhbnNpdGlvbkFuaW1hdGlvblBhcmFtcywgLi4ubmV4dEFuaW1hdGlvblBhcmFtc319O1xuXG4gICAgY29uc3QgdGltZWxpbmVzID0gYnVpbGRBbmltYXRpb25UaW1lbGluZXMoXG4gICAgICAgIGRyaXZlciwgZWxlbWVudCwgdGhpcy5hc3QuYW5pbWF0aW9uLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIGN1cnJlbnRTdGF0ZVN0eWxlcyxcbiAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCBhbmltYXRpb25PcHRpb25zLCBzdWJJbnN0cnVjdGlvbnMsIGVycm9ycyk7XG5cbiAgICBsZXQgdG90YWxUaW1lID0gMDtcbiAgICB0aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB7IHRvdGFsVGltZSA9IE1hdGgubWF4KHRsLmR1cmF0aW9uICsgdGwuZGVsYXksIHRvdGFsVGltZSk7IH0pO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgZWxlbWVudCwgdGhpcy5fdHJpZ2dlck5hbWUsIGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBpc1JlbW92YWwsIGN1cnJlbnRTdGF0ZVN0eWxlcyxcbiAgICAgICAgICBuZXh0U3RhdGVTdHlsZXMsIFtdLCBbXSwgcHJlU3R5bGVNYXAsIHBvc3RTdHlsZU1hcCwgdG90YWxUaW1lLCBlcnJvcnMpO1xuICAgIH1cblxuICAgIHRpbWVsaW5lcy5mb3JFYWNoKHRsID0+IHtcbiAgICAgIGNvbnN0IGVsbSA9IHRsLmVsZW1lbnQ7XG4gICAgICBjb25zdCBwcmVQcm9wcyA9IGdldE9yU2V0QXNJbk1hcChwcmVTdHlsZU1hcCwgZWxtLCB7fSk7XG4gICAgICB0bC5wcmVTdHlsZVByb3BzLmZvckVhY2gocHJvcCA9PiBwcmVQcm9wc1twcm9wXSA9IHRydWUpO1xuXG4gICAgICBjb25zdCBwb3N0UHJvcHMgPSBnZXRPclNldEFzSW5NYXAocG9zdFN0eWxlTWFwLCBlbG0sIHt9KTtcbiAgICAgIHRsLnBvc3RTdHlsZVByb3BzLmZvckVhY2gocHJvcCA9PiBwb3N0UHJvcHNbcHJvcF0gPSB0cnVlKTtcblxuICAgICAgaWYgKGVsbSAhPT0gZWxlbWVudCkge1xuICAgICAgICBxdWVyaWVkRWxlbWVudHMuYWRkKGVsbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBxdWVyaWVkRWxlbWVudHNMaXN0ID0gaXRlcmF0b3JUb0FycmF5KHF1ZXJpZWRFbGVtZW50cy52YWx1ZXMoKSk7XG4gICAgcmV0dXJuIGNyZWF0ZVRyYW5zaXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgZWxlbWVudCwgdGhpcy5fdHJpZ2dlck5hbWUsIGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBpc1JlbW92YWwsIGN1cnJlbnRTdGF0ZVN0eWxlcyxcbiAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCB0aW1lbGluZXMsIHF1ZXJpZWRFbGVtZW50c0xpc3QsIHByZVN0eWxlTWFwLCBwb3N0U3R5bGVNYXAsIHRvdGFsVGltZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25lT3JNb3JlVHJhbnNpdGlvbnNNYXRjaChcbiAgICBtYXRjaEZuczogVHJhbnNpdGlvbk1hdGNoZXJGbltdLCBjdXJyZW50U3RhdGU6IGFueSwgbmV4dFN0YXRlOiBhbnksIGVsZW1lbnQ6IGFueSxcbiAgICBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIHJldHVybiBtYXRjaEZucy5zb21lKGZuID0+IGZuKGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBlbGVtZW50LCBwYXJhbXMpKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblN0YXRlU3R5bGVzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzdHlsZXM6IFN0eWxlQXN0LCBwcml2YXRlIGRlZmF1bHRQYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7fVxuXG4gIGJ1aWxkU3R5bGVzKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0sIGVycm9yczogc3RyaW5nW10pOiDJtVN0eWxlRGF0YSB7XG4gICAgY29uc3QgZmluYWxTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gICAgY29uc3QgY29tYmluZWRQYXJhbXMgPSBjb3B5T2JqKHRoaXMuZGVmYXVsdFBhcmFtcyk7XG4gICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1trZXldO1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgY29tYmluZWRQYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuc3R5bGVzLnN0eWxlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlT2JqID0gdmFsdWUgYXMgYW55O1xuICAgICAgICBPYmplY3Qua2V5cyhzdHlsZU9iaikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgICBsZXQgdmFsID0gc3R5bGVPYmpbcHJvcF07XG4gICAgICAgICAgaWYgKHZhbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB2YWwgPSBpbnRlcnBvbGF0ZVBhcmFtcyh2YWwsIGNvbWJpbmVkUGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaW5hbFN0eWxlc1twcm9wXSA9IHZhbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsU3R5bGVzO1xuICB9XG59XG4iXX0=