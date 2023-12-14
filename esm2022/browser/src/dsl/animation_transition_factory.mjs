import { getOrSetDefaultValue } from '../render/shared';
import { interpolateParams } from '../util';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { createTransitionInstruction } from './animation_transition_instruction';
const EMPTY_OBJECT = {};
export class AnimationTransitionFactory {
    constructor(_triggerName, ast, _stateStyles) {
        this._triggerName = _triggerName;
        this.ast = ast;
        this._stateStyles = _stateStyles;
    }
    match(currentState, nextState, element, params) {
        return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
    }
    buildStyles(stateName, params, errors) {
        let styler = this._stateStyles.get('*');
        if (stateName !== undefined) {
            styler = this._stateStyles.get(stateName?.toString()) || styler;
        }
        return styler ? styler.buildStyles(params, errors) : new Map();
    }
    build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions, skipAstBuild) {
        const errors = [];
        const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
        const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
        const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
        const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
        const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
        const queriedElements = new Set();
        const preStyleMap = new Map();
        const postStyleMap = new Map();
        const isRemoval = nextState === 'void';
        const animationOptions = {
            params: applyParamDefaults(nextAnimationParams, transitionAnimationParams),
            delay: this.ast.options?.delay,
        };
        const timelines = skipAstBuild ?
            [] :
            buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
        let totalTime = 0;
        timelines.forEach(tl => {
            totalTime = Math.max(tl.duration + tl.delay, totalTime);
        });
        if (errors.length) {
            return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
        }
        timelines.forEach(tl => {
            const elm = tl.element;
            const preProps = getOrSetDefaultValue(preStyleMap, elm, new Set());
            tl.preStyleProps.forEach(prop => preProps.add(prop));
            const postProps = getOrSetDefaultValue(postStyleMap, elm, new Set());
            tl.postStyleProps.forEach(prop => postProps.add(prop));
            if (elm !== element) {
                queriedElements.add(elm);
            }
        });
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            checkNonAnimatableInTimelines(timelines, this._triggerName, driver);
        }
        return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, [...queriedElements.values()], preStyleMap, postStyleMap, totalTime);
    }
}
/**
 * Checks inside a set of timelines if they try to animate a css property which is not considered
 * animatable, in that case it prints a warning on the console.
 * Besides that the function doesn't have any other effect.
 *
 * Note: this check is done here after the timelines are built instead of doing on a lower level so
 * that we can make sure that the warning appears only once per instruction (we can aggregate here
 * all the issues instead of finding them separately).
 *
 * @param timelines The built timelines for the current instruction.
 * @param triggerName The name of the trigger for the current instruction.
 * @param driver Animation driver used to perform the check.
 *
 */
function checkNonAnimatableInTimelines(timelines, triggerName, driver) {
    if (!driver.validateAnimatableStyleProperty) {
        return;
    }
    const allowedNonAnimatableProps = new Set([
        // 'easing' is a utility/synthetic prop we use to represent
        // easing functions, it represents a property of the animation
        // which is not animatable but different values can be used
        // in different steps
        'easing'
    ]);
    const invalidNonAnimatableProps = new Set();
    timelines.forEach(({ keyframes }) => {
        const nonAnimatablePropsInitialValues = new Map();
        keyframes.forEach(keyframe => {
            const entriesToCheck = Array.from(keyframe.entries()).filter(([prop]) => !allowedNonAnimatableProps.has(prop));
            for (const [prop, value] of entriesToCheck) {
                if (!driver.validateAnimatableStyleProperty(prop)) {
                    if (nonAnimatablePropsInitialValues.has(prop) && !invalidNonAnimatableProps.has(prop)) {
                        const propInitialValue = nonAnimatablePropsInitialValues.get(prop);
                        if (propInitialValue !== value) {
                            invalidNonAnimatableProps.add(prop);
                        }
                    }
                    else {
                        nonAnimatablePropsInitialValues.set(prop, value);
                    }
                }
            }
        });
    });
    if (invalidNonAnimatableProps.size > 0) {
        console.warn(`Warning: The animation trigger "${triggerName}" is attempting to animate the following` +
            ' not animatable properties: ' + Array.from(invalidNonAnimatableProps).join(', ') + '\n' +
            '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)');
    }
}
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
    return matchFns.some(fn => fn(currentState, nextState, element, params));
}
function applyParamDefaults(userParams, defaults) {
    const result = { ...defaults };
    Object.entries(userParams).forEach(([key, value]) => {
        if (value != null) {
            result[key] = value;
        }
    });
    return result;
}
export class AnimationStateStyles {
    constructor(styles, defaultParams, normalizer) {
        this.styles = styles;
        this.defaultParams = defaultParams;
        this.normalizer = normalizer;
    }
    buildStyles(params, errors) {
        const finalStyles = new Map();
        const combinedParams = applyParamDefaults(params, this.defaultParams);
        this.styles.styles.forEach(value => {
            if (typeof value !== 'string') {
                value.forEach((val, prop) => {
                    if (val) {
                        val = interpolateParams(val, combinedParams, errors);
                    }
                    const normalizedProp = this.normalizer.normalizePropertyName(prop, errors);
                    val = this.normalizer.normalizeStyleValue(prop, normalizedProp, val, errors);
                    finalStyles.set(prop, val);
                });
            }
        });
        return finalStyles;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRzFDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE9BQU8sRUFBaUMsMkJBQTJCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUkvRyxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFFeEIsTUFBTSxPQUFPLDBCQUEwQjtJQUNyQyxZQUNZLFlBQW9CLEVBQVMsR0FBa0IsRUFDL0MsWUFBK0M7UUFEL0MsaUJBQVksR0FBWixZQUFZLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFlO1FBQy9DLGlCQUFZLEdBQVosWUFBWSxDQUFtQztJQUFHLENBQUM7SUFFL0QsS0FBSyxDQUFDLFlBQWlCLEVBQUUsU0FBYyxFQUFFLE9BQVksRUFBRSxNQUE0QjtRQUNqRixPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxXQUFXLENBQUMsU0FBbUMsRUFBRSxNQUE0QixFQUFFLE1BQWU7UUFFNUYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDNUIsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNsRSxDQUFDO1FBQ0QsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pFLENBQUM7SUFFRCxLQUFLLENBQ0QsTUFBdUIsRUFBRSxPQUFZLEVBQUUsWUFBaUIsRUFBRSxTQUFjLEVBQ3hFLGNBQXNCLEVBQUUsY0FBc0IsRUFBRSxjQUFpQyxFQUNqRixXQUE4QixFQUFFLGVBQXVDLEVBQ3ZFLFlBQXNCO1FBQ3hCLE1BQU0sTUFBTSxHQUFZLEVBQUUsQ0FBQztRQUUzQixNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUM7UUFDOUYsTUFBTSxzQkFBc0IsR0FBRyxjQUFjLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUM7UUFDdkYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRixNQUFNLG1CQUFtQixHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLFlBQVksQ0FBQztRQUM5RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVqRixNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBTyxDQUFDO1FBQ3ZDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBQ2hELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBQ2pELE1BQU0sU0FBUyxHQUFHLFNBQVMsS0FBSyxNQUFNLENBQUM7UUFFdkMsTUFBTSxnQkFBZ0IsR0FBcUI7WUFDekMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLHlCQUF5QixDQUFDO1lBQzFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLO1NBQy9CLENBQUM7UUFFRixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQztZQUNKLHVCQUF1QixDQUNuQixNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQ3ZGLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFcEUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDckIsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTywyQkFBMkIsQ0FDOUIsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQ2xGLGVBQWUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDdkIsTUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsRUFBVSxDQUFDLENBQUM7WUFDM0UsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFckQsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsRUFBVSxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFdkQsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3BCLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7WUFDbEQsNkJBQTZCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELE9BQU8sMkJBQTJCLENBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUNsRixlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUNwRixTQUFTLENBQUMsQ0FBQztJQUNqQixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDbEMsU0FBeUMsRUFBRSxXQUFtQixFQUFFLE1BQXVCO0lBQ3pGLElBQUksQ0FBQyxNQUFNLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUM1QyxPQUFPO0lBQ1QsQ0FBQztJQUVELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxHQUFHLENBQVM7UUFDaEQsMkRBQTJEO1FBQzNELDhEQUE4RDtRQUM5RCwyREFBMkQ7UUFDM0QscUJBQXFCO1FBQ3JCLFFBQVE7S0FDVCxDQUFDLENBQUM7SUFFSCxNQUFNLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFFcEQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLEVBQUUsRUFBRTtRQUNoQyxNQUFNLCtCQUErQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQ3pFLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0IsTUFBTSxjQUFjLEdBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1RixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsK0JBQWdDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbkQsSUFBSSwrQkFBK0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDdEYsTUFBTSxnQkFBZ0IsR0FBRywrQkFBK0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ25FLElBQUksZ0JBQWdCLEtBQUssS0FBSyxFQUFFLENBQUM7NEJBQy9CLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdEMsQ0FBQztvQkFDSCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sK0JBQStCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbkQsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLHlCQUF5QixDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2QyxPQUFPLENBQUMsSUFBSSxDQUNSLG1DQUFtQyxXQUFXLDBDQUEwQztZQUN4Riw4QkFBOEIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUk7WUFDeEYsaUlBQWlJLENBQUMsQ0FBQztJQUN6SSxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQzlCLFFBQStCLEVBQUUsWUFBaUIsRUFBRSxTQUFjLEVBQUUsT0FBWSxFQUNoRixNQUE0QjtJQUM5QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxVQUErQixFQUFFLFFBQTZCO0lBQ3hGLE1BQU0sTUFBTSxHQUF3QixFQUFDLEdBQUcsUUFBUSxFQUFDLENBQUM7SUFDbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ2xELElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELE1BQU0sT0FBTyxvQkFBb0I7SUFDL0IsWUFDWSxNQUFnQixFQUFVLGFBQW1DLEVBQzdELFVBQW9DO1FBRHBDLFdBQU0sR0FBTixNQUFNLENBQVU7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUFDN0QsZUFBVSxHQUFWLFVBQVUsQ0FBMEI7SUFBRyxDQUFDO0lBRXBELFdBQVcsQ0FBQyxNQUE0QixFQUFFLE1BQWU7UUFDdkQsTUFBTSxXQUFXLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0MsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtvQkFDMUIsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDUixHQUFHLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDdkQsQ0FBQztvQkFDRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDM0UsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzdFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25PcHRpb25zLCDJtVN0eWxlRGF0YU1hcH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0RGVmYXVsdFZhbHVlfSBmcm9tICcuLi9yZW5kZXIvc2hhcmVkJztcbmltcG9ydCB7aW50ZXJwb2xhdGVQYXJhbXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1N0eWxlQXN0LCBUcmFuc2l0aW9uQXN0fSBmcm9tICcuL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtidWlsZEFuaW1hdGlvblRpbWVsaW5lc30gZnJvbSAnLi9hbmltYXRpb25fdGltZWxpbmVfYnVpbGRlcic7XG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7VHJhbnNpdGlvbk1hdGNoZXJGbn0gZnJvbSAnLi9hbmltYXRpb25fdHJhbnNpdGlvbl9leHByJztcbmltcG9ydCB7QW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLCBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4vZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4vc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5cbmNvbnN0IEVNUFRZX09CSkVDVCA9IHt9O1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3RyaWdnZXJOYW1lOiBzdHJpbmcsIHB1YmxpYyBhc3Q6IFRyYW5zaXRpb25Bc3QsXG4gICAgICBwcml2YXRlIF9zdGF0ZVN0eWxlczogTWFwPHN0cmluZywgQW5pbWF0aW9uU3RhdGVTdHlsZXM+KSB7fVxuXG4gIG1hdGNoKGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSwgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9uZU9yTW9yZVRyYW5zaXRpb25zTWF0Y2godGhpcy5hc3QubWF0Y2hlcnMsIGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBlbGVtZW50LCBwYXJhbXMpO1xuICB9XG5cbiAgYnVpbGRTdHlsZXMoc3RhdGVOYW1lOiBzdHJpbmd8Ym9vbGVhbnx1bmRlZmluZWQsIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0sIGVycm9yczogRXJyb3JbXSk6XG4gICAgICDJtVN0eWxlRGF0YU1hcCB7XG4gICAgbGV0IHN0eWxlciA9IHRoaXMuX3N0YXRlU3R5bGVzLmdldCgnKicpO1xuICAgIGlmIChzdGF0ZU5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3R5bGVyID0gdGhpcy5fc3RhdGVTdHlsZXMuZ2V0KHN0YXRlTmFtZT8udG9TdHJpbmcoKSkgfHwgc3R5bGVyO1xuICAgIH1cbiAgICByZXR1cm4gc3R5bGVyID8gc3R5bGVyLmJ1aWxkU3R5bGVzKHBhcmFtcywgZXJyb3JzKSA6IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGJ1aWxkKFxuICAgICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIGVsZW1lbnQ6IGFueSwgY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LFxuICAgICAgZW50ZXJDbGFzc05hbWU6IHN0cmluZywgbGVhdmVDbGFzc05hbWU6IHN0cmluZywgY3VycmVudE9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zLFxuICAgICAgbmV4dE9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zLCBzdWJJbnN0cnVjdGlvbnM/OiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsXG4gICAgICBza2lwQXN0QnVpbGQ/OiBib29sZWFuKTogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uIHtcbiAgICBjb25zdCBlcnJvcnM6IEVycm9yW10gPSBbXTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb25BbmltYXRpb25QYXJhbXMgPSB0aGlzLmFzdC5vcHRpb25zICYmIHRoaXMuYXN0Lm9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBjdXJyZW50QW5pbWF0aW9uUGFyYW1zID0gY3VycmVudE9wdGlvbnMgJiYgY3VycmVudE9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBjdXJyZW50U3RhdGVTdHlsZXMgPSB0aGlzLmJ1aWxkU3R5bGVzKGN1cnJlbnRTdGF0ZSwgY3VycmVudEFuaW1hdGlvblBhcmFtcywgZXJyb3JzKTtcbiAgICBjb25zdCBuZXh0QW5pbWF0aW9uUGFyYW1zID0gbmV4dE9wdGlvbnMgJiYgbmV4dE9wdGlvbnMucGFyYW1zIHx8IEVNUFRZX09CSkVDVDtcbiAgICBjb25zdCBuZXh0U3RhdGVTdHlsZXMgPSB0aGlzLmJ1aWxkU3R5bGVzKG5leHRTdGF0ZSwgbmV4dEFuaW1hdGlvblBhcmFtcywgZXJyb3JzKTtcblxuICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IHByZVN0eWxlTWFwID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuICAgIGNvbnN0IHBvc3RTdHlsZU1hcCA9IG5ldyBNYXA8YW55LCBTZXQ8c3RyaW5nPj4oKTtcbiAgICBjb25zdCBpc1JlbW92YWwgPSBuZXh0U3RhdGUgPT09ICd2b2lkJztcblxuICAgIGNvbnN0IGFuaW1hdGlvbk9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgPSB7XG4gICAgICBwYXJhbXM6IGFwcGx5UGFyYW1EZWZhdWx0cyhuZXh0QW5pbWF0aW9uUGFyYW1zLCB0cmFuc2l0aW9uQW5pbWF0aW9uUGFyYW1zKSxcbiAgICAgIGRlbGF5OiB0aGlzLmFzdC5vcHRpb25zPy5kZWxheSxcbiAgICB9O1xuXG4gICAgY29uc3QgdGltZWxpbmVzID0gc2tpcEFzdEJ1aWxkID9cbiAgICAgICAgW10gOlxuICAgICAgICBidWlsZEFuaW1hdGlvblRpbWVsaW5lcyhcbiAgICAgICAgICAgIGRyaXZlciwgZWxlbWVudCwgdGhpcy5hc3QuYW5pbWF0aW9uLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIGN1cnJlbnRTdGF0ZVN0eWxlcyxcbiAgICAgICAgICAgIG5leHRTdGF0ZVN0eWxlcywgYW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zLCBlcnJvcnMpO1xuXG4gICAgbGV0IHRvdGFsVGltZSA9IDA7XG4gICAgdGltZWxpbmVzLmZvckVhY2godGwgPT4ge1xuICAgICAgdG90YWxUaW1lID0gTWF0aC5tYXgodGwuZHVyYXRpb24gKyB0bC5kZWxheSwgdG90YWxUaW1lKTtcbiAgICB9KTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlVHJhbnNpdGlvbkluc3RydWN0aW9uKFxuICAgICAgICAgIGVsZW1lbnQsIHRoaXMuX3RyaWdnZXJOYW1lLCBjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgaXNSZW1vdmFsLCBjdXJyZW50U3RhdGVTdHlsZXMsXG4gICAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCBbXSwgW10sIHByZVN0eWxlTWFwLCBwb3N0U3R5bGVNYXAsIHRvdGFsVGltZSwgZXJyb3JzKTtcbiAgICB9XG5cbiAgICB0aW1lbGluZXMuZm9yRWFjaCh0bCA9PiB7XG4gICAgICBjb25zdCBlbG0gPSB0bC5lbGVtZW50O1xuICAgICAgY29uc3QgcHJlUHJvcHMgPSBnZXRPclNldERlZmF1bHRWYWx1ZShwcmVTdHlsZU1hcCwgZWxtLCBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICB0bC5wcmVTdHlsZVByb3BzLmZvckVhY2gocHJvcCA9PiBwcmVQcm9wcy5hZGQocHJvcCkpO1xuXG4gICAgICBjb25zdCBwb3N0UHJvcHMgPSBnZXRPclNldERlZmF1bHRWYWx1ZShwb3N0U3R5bGVNYXAsIGVsbSwgbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgdGwucG9zdFN0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHBvc3RQcm9wcy5hZGQocHJvcCkpO1xuXG4gICAgICBpZiAoZWxtICE9PSBlbGVtZW50KSB7XG4gICAgICAgIHF1ZXJpZWRFbGVtZW50cy5hZGQoZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGNoZWNrTm9uQW5pbWF0YWJsZUluVGltZWxpbmVzKHRpbWVsaW5lcywgdGhpcy5fdHJpZ2dlck5hbWUsIGRyaXZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVRyYW5zaXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgZWxlbWVudCwgdGhpcy5fdHJpZ2dlck5hbWUsIGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBpc1JlbW92YWwsIGN1cnJlbnRTdGF0ZVN0eWxlcyxcbiAgICAgICAgbmV4dFN0YXRlU3R5bGVzLCB0aW1lbGluZXMsIFsuLi5xdWVyaWVkRWxlbWVudHMudmFsdWVzKCldLCBwcmVTdHlsZU1hcCwgcG9zdFN0eWxlTWFwLFxuICAgICAgICB0b3RhbFRpbWUpO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIGluc2lkZSBhIHNldCBvZiB0aW1lbGluZXMgaWYgdGhleSB0cnkgdG8gYW5pbWF0ZSBhIGNzcyBwcm9wZXJ0eSB3aGljaCBpcyBub3QgY29uc2lkZXJlZFxuICogYW5pbWF0YWJsZSwgaW4gdGhhdCBjYXNlIGl0IHByaW50cyBhIHdhcm5pbmcgb24gdGhlIGNvbnNvbGUuXG4gKiBCZXNpZGVzIHRoYXQgdGhlIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSBhbnkgb3RoZXIgZWZmZWN0LlxuICpcbiAqIE5vdGU6IHRoaXMgY2hlY2sgaXMgZG9uZSBoZXJlIGFmdGVyIHRoZSB0aW1lbGluZXMgYXJlIGJ1aWx0IGluc3RlYWQgb2YgZG9pbmcgb24gYSBsb3dlciBsZXZlbCBzb1xuICogdGhhdCB3ZSBjYW4gbWFrZSBzdXJlIHRoYXQgdGhlIHdhcm5pbmcgYXBwZWFycyBvbmx5IG9uY2UgcGVyIGluc3RydWN0aW9uICh3ZSBjYW4gYWdncmVnYXRlIGhlcmVcbiAqIGFsbCB0aGUgaXNzdWVzIGluc3RlYWQgb2YgZmluZGluZyB0aGVtIHNlcGFyYXRlbHkpLlxuICpcbiAqIEBwYXJhbSB0aW1lbGluZXMgVGhlIGJ1aWx0IHRpbWVsaW5lcyBmb3IgdGhlIGN1cnJlbnQgaW5zdHJ1Y3Rpb24uXG4gKiBAcGFyYW0gdHJpZ2dlck5hbWUgVGhlIG5hbWUgb2YgdGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50IGluc3RydWN0aW9uLlxuICogQHBhcmFtIGRyaXZlciBBbmltYXRpb24gZHJpdmVyIHVzZWQgdG8gcGVyZm9ybSB0aGUgY2hlY2suXG4gKlxuICovXG5mdW5jdGlvbiBjaGVja05vbkFuaW1hdGFibGVJblRpbWVsaW5lcyhcbiAgICB0aW1lbGluZXM6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSwgdHJpZ2dlck5hbWU6IHN0cmluZywgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIpOiB2b2lkIHtcbiAgaWYgKCFkcml2ZXIudmFsaWRhdGVBbmltYXRhYmxlU3R5bGVQcm9wZXJ0eSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGFsbG93ZWROb25BbmltYXRhYmxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oW1xuICAgIC8vICdlYXNpbmcnIGlzIGEgdXRpbGl0eS9zeW50aGV0aWMgcHJvcCB3ZSB1c2UgdG8gcmVwcmVzZW50XG4gICAgLy8gZWFzaW5nIGZ1bmN0aW9ucywgaXQgcmVwcmVzZW50cyBhIHByb3BlcnR5IG9mIHRoZSBhbmltYXRpb25cbiAgICAvLyB3aGljaCBpcyBub3QgYW5pbWF0YWJsZSBidXQgZGlmZmVyZW50IHZhbHVlcyBjYW4gYmUgdXNlZFxuICAgIC8vIGluIGRpZmZlcmVudCBzdGVwc1xuICAgICdlYXNpbmcnXG4gIF0pO1xuXG4gIGNvbnN0IGludmFsaWROb25BbmltYXRhYmxlUHJvcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICB0aW1lbGluZXMuZm9yRWFjaCgoe2tleWZyYW1lc30pID0+IHtcbiAgICBjb25zdCBub25BbmltYXRhYmxlUHJvcHNJbml0aWFsVmFsdWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ3xudW1iZXI+KCk7XG4gICAga2V5ZnJhbWVzLmZvckVhY2goa2V5ZnJhbWUgPT4ge1xuICAgICAgY29uc3QgZW50cmllc1RvQ2hlY2sgPVxuICAgICAgICAgIEFycmF5LmZyb20oa2V5ZnJhbWUuZW50cmllcygpKS5maWx0ZXIoKFtwcm9wXSkgPT4gIWFsbG93ZWROb25BbmltYXRhYmxlUHJvcHMuaGFzKHByb3ApKTtcbiAgICAgIGZvciAoY29uc3QgW3Byb3AsIHZhbHVlXSBvZiBlbnRyaWVzVG9DaGVjaykge1xuICAgICAgICBpZiAoIWRyaXZlci52YWxpZGF0ZUFuaW1hdGFibGVTdHlsZVByb3BlcnR5IShwcm9wKSkge1xuICAgICAgICAgIGlmIChub25BbmltYXRhYmxlUHJvcHNJbml0aWFsVmFsdWVzLmhhcyhwcm9wKSAmJiAhaW52YWxpZE5vbkFuaW1hdGFibGVQcm9wcy5oYXMocHJvcCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BJbml0aWFsVmFsdWUgPSBub25BbmltYXRhYmxlUHJvcHNJbml0aWFsVmFsdWVzLmdldChwcm9wKTtcbiAgICAgICAgICAgIGlmIChwcm9wSW5pdGlhbFZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICBpbnZhbGlkTm9uQW5pbWF0YWJsZVByb3BzLmFkZChwcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uQW5pbWF0YWJsZVByb3BzSW5pdGlhbFZhbHVlcy5zZXQocHJvcCwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoaW52YWxpZE5vbkFuaW1hdGFibGVQcm9wcy5zaXplID4gMCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFdhcm5pbmc6IFRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7dHJpZ2dlck5hbWV9XCIgaXMgYXR0ZW1wdGluZyB0byBhbmltYXRlIHRoZSBmb2xsb3dpbmdgICtcbiAgICAgICAgJyBub3QgYW5pbWF0YWJsZSBwcm9wZXJ0aWVzOiAnICsgQXJyYXkuZnJvbShpbnZhbGlkTm9uQW5pbWF0YWJsZVByb3BzKS5qb2luKCcsICcpICsgJ1xcbicgK1xuICAgICAgICAnKHRvIGNoZWNrIHRoZSBsaXN0IG9mIGFsbCBhbmltYXRhYmxlIHByb3BlcnRpZXMgdmlzaXQgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NTU19hbmltYXRlZF9wcm9wZXJ0aWVzKScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uZU9yTW9yZVRyYW5zaXRpb25zTWF0Y2goXG4gICAgbWF0Y2hGbnM6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSwgY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LCBlbGVtZW50OiBhbnksXG4gICAgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF0Y2hGbnMuc29tZShmbiA9PiBmbihjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSwgZWxlbWVudCwgcGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UGFyYW1EZWZhdWx0cyh1c2VyUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBkZWZhdWx0czogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7Li4uZGVmYXVsdHN9O1xuICBPYmplY3QuZW50cmllcyh1c2VyUGFyYW1zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uU3RhdGVTdHlsZXMge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgc3R5bGVzOiBTdHlsZUFzdCwgcHJpdmF0ZSBkZWZhdWx0UGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAgIHByaXZhdGUgbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7fVxuXG4gIGJ1aWxkU3R5bGVzKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0sIGVycm9yczogRXJyb3JbXSk6IMm1U3R5bGVEYXRhTWFwIHtcbiAgICBjb25zdCBmaW5hbFN0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgY29tYmluZWRQYXJhbXMgPSBhcHBseVBhcmFtRGVmYXVsdHMocGFyYW1zLCB0aGlzLmRlZmF1bHRQYXJhbXMpO1xuICAgIHRoaXMuc3R5bGVzLnN0eWxlcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhbHVlLmZvckVhY2goKHZhbCwgcHJvcCkgPT4ge1xuICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHZhbCA9IGludGVycG9sYXRlUGFyYW1zKHZhbCwgY29tYmluZWRQYXJhbXMsIGVycm9ycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQcm9wID0gdGhpcy5ub3JtYWxpemVyLm5vcm1hbGl6ZVByb3BlcnR5TmFtZShwcm9wLCBlcnJvcnMpO1xuICAgICAgICAgIHZhbCA9IHRoaXMubm9ybWFsaXplci5ub3JtYWxpemVTdHlsZVZhbHVlKHByb3AsIG5vcm1hbGl6ZWRQcm9wLCB2YWwsIGVycm9ycyk7XG4gICAgICAgICAgZmluYWxTdHlsZXMuc2V0KHByb3AsIHZhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFN0eWxlcztcbiAgfVxufVxuIl19