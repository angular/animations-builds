/**
 * @license Angular v4.1.0-beta.0-64f1bf6
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
import { AUTO_STYLE, NoopAnimationPlayer, PRE_STYLE, sequence, style, ɵAnimationGroupPlayer } from '@angular/animations';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @experimental
 */
class NoopAnimationDriver {
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        return new NoopAnimationPlayer();
    }
}
/**
 * @experimental
 */
class AnimationDriver {
}
AnimationDriver.NOOP = new NoopAnimationDriver();

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @abstract
 */
class AnimationEngine {
    /**
     * @abstract
     * @param {?} componentId
     * @param {?} namespaceId
     * @param {?} hostElement
     * @param {?} name
     * @param {?} metadata
     * @return {?}
     */
    registerTrigger(componentId, namespaceId, hostElement, name, metadata) { }
    /**
     * @abstract
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    onInsert(namespaceId, element, parent, insertBefore) { }
    /**
     * @abstract
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    onRemove(namespaceId, element, context) { }
    /**
     * @abstract
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    setProperty(namespaceId, element, property, value) { }
    /**
     * @abstract
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} eventName
     * @param {?} eventPhase
     * @param {?} callback
     * @return {?}
     */
    listen(namespaceId, element, eventName, eventPhase, callback) { }
    /**
     * @abstract
     * @return {?}
     */
    flush() { }
    /**
     * @abstract
     * @param {?} namespaceId
     * @param {?} context
     * @return {?}
     */
    destroy(namespaceId, context) { }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ONE_SECOND = 1000;
const ENTER_CLASSNAME = 'ng-enter';
const LEAVE_CLASSNAME = 'ng-leave';
const ENTER_SELECTOR = '.ng-enter';
const LEAVE_SELECTOR = '.ng-leave';
const NG_TRIGGER_CLASSNAME = 'ng-trigger';
const NG_TRIGGER_SELECTOR = '.ng-trigger';
const NG_ANIMATING_CLASSNAME = 'ng-animating';
const NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} timings
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function resolveTimingValue(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration') ? (timings) :
        parseTimeExpression(/** @type {?} */ (timings), errors, allowNegativeValues);
}
/**
 * @param {?} exp
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function parseTimeExpression(exp, errors, allowNegativeValues) {
    const /** @type {?} */ regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let /** @type {?} */ duration;
    let /** @type {?} */ delay = 0;
    let /** @type {?} */ easing = null;
    if (typeof exp === 'string') {
        const /** @type {?} */ matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: null };
        }
        let /** @type {?} */ durationMatch = parseFloat(matches[1]);
        const /** @type {?} */ durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        const /** @type {?} */ delayMatch = matches[3];
        const /** @type {?} */ delayUnit = matches[4];
        if (delayMatch != null) {
            let /** @type {?} */ delayVal = parseFloat(delayMatch);
            if (delayUnit != null && delayUnit == 's') {
                delayVal *= ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        const /** @type {?} */ easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = (exp);
    }
    if (!allowNegativeValues) {
        let /** @type {?} */ containsErrors = false;
        let /** @type {?} */ startIndex = errors.length;
        if (duration < 0) {
            errors.push(`Duration values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(`Delay values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, `The provided timing value "${exp}" is invalid.`);
        }
    }
    return { duration, delay, easing };
}
/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */
function copyObj(obj, destination = {}) {
    Object.keys(obj).forEach(prop => { destination[prop] = obj[prop]; });
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
function normalizeStyles(styles) {
    const /** @type {?} */ normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach(data => copyStyles(data, false, normalizedStyles));
    }
    else {
        copyStyles(styles, false, normalizedStyles);
    }
    return normalizedStyles;
}
/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */
function copyStyles(styles, readPrototype, destination = {}) {
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (let /** @type {?} */ prop in styles) {
            destination[prop] = styles[prop];
        }
    }
    else {
        copyObj(styles, destination);
    }
    return destination;
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
function setStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => element.style[prop] = styles[prop]);
    }
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
function eraseStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            // IE requires '' instead of null
            // see https://github.com/angular/angular/issues/7916
            element.style[prop] = '';
        });
    }
}
/**
 * @param {?} steps
 * @return {?}
 */
function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return (steps);
}
// this is a naive approach to search/replace
// TODO: check to see that transforms are not effected
const SIMPLE_STYLE_INTERPOLATION_REGEX = /\$\w+/;
const ADVANCED_STYLE_INTERPOLATION_REGEX = /\$\{([-\w\s]+)\}/;
/**
 * @param {?} value
 * @param {?} locals
 * @param {?} errors
 * @return {?}
 */
function validateStyleLocals(value, locals, errors) {
    if (typeof value == 'string') {
        matchAndValidate(SIMPLE_STYLE_INTERPOLATION_REGEX, 1, 0, /** @type {?} */ (value), locals, errors);
        matchAndValidate(ADVANCED_STYLE_INTERPOLATION_REGEX, 2, 1, /** @type {?} */ (value), locals, errors);
    }
}
/**
 * @param {?} regex
 * @param {?} prefixLength
 * @param {?} suffixLength
 * @param {?} str
 * @param {?} locals
 * @param {?} errors
 * @return {?}
 */
function matchAndValidate(regex, prefixLength, suffixLength, str, locals, errors) {
    const /** @type {?} */ matches = str.toString().match(regex);
    if (matches) {
        matches.forEach(varName => {
            varName =
                varName.substring(prefixLength, varName.length - suffixLength); // drop the $ or ${}
            if (!locals.hasOwnProperty(varName)) {
                errors.push(`Unable to resolve the local animation variable $${varName} in the given list of values`);
            }
        });
    }
}
/**
 * @param {?} value
 * @param {?} locals
 * @param {?} errors
 * @return {?}
 */
function interpolateStyleLocals(value, locals, errors) {
    let /** @type {?} */ str = value.toString();
    str = matchAndReplace(SIMPLE_STYLE_INTERPOLATION_REGEX, 1, 0, str, locals, errors);
    str = matchAndReplace(ADVANCED_STYLE_INTERPOLATION_REGEX, 2, 1, str, locals, errors);
    return str;
}
/**
 * @param {?} regex
 * @param {?} prefixLength
 * @param {?} suffixLength
 * @param {?} str
 * @param {?} locals
 * @param {?} errors
 * @return {?}
 */
function matchAndReplace(regex, prefixLength, suffixLength, str, locals, errors) {
    return str.replace(regex, varName => {
        varName = varName.substring(prefixLength, varName.length - suffixLength); // drop the $ or ${}
        let /** @type {?} */ localVal = locals[varName];
        // this means that the value was never overidden by the data passed in by the user
        if (localVal === true) {
            errors.push(`Please provide a value for the animation variable $${varName}`);
            localVal = '';
        }
        return localVal.toString();
    });
}
/**
 * @param {?} iterator
 * @return {?}
 */
function iteratorToArray(iterator) {
    const /** @type {?} */ arr = [];
    let /** @type {?} */ item = iterator.next();
    while (!item.done) {
        arr.push(item.value);
        item = iterator.next();
    }
    return arr;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} players
 * @return {?}
 */
function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?} preStyles
 * @param {?} postStyles
 * @return {?}
 */
function normalizeKeyframes(driver, normalizer, element, keyframes, preStyles, postStyles) {
    const /** @type {?} */ errors = [];
    const /** @type {?} */ normalizedKeyframes = [];
    let /** @type {?} */ previousOffset = -1;
    let /** @type {?} */ previousKeyframe = null;
    keyframes.forEach(kf => {
        const /** @type {?} */ offset = (kf['offset']);
        const /** @type {?} */ isSameOffset = offset == previousOffset;
        const /** @type {?} */ normalizedKeyframe = isSameOffset ? previousKeyframe : {};
        Object.keys(kf).forEach(prop => {
            let /** @type {?} */ normalizedProp = prop;
            let /** @type {?} */ normalizedValue = kf[prop];
            if (normalizedValue == PRE_STYLE) {
                normalizedValue = preStyles[prop];
            }
            else if (normalizedValue == AUTO_STYLE) {
                normalizedValue = postStyles[prop];
            }
            else if (prop != 'offset') {
                normalizedProp = normalizer.normalizePropertyName(prop, errors);
                normalizedValue = normalizer.normalizeStyleValue(prop, normalizedProp, kf[prop], errors);
            }
            normalizedKeyframe[normalizedProp] = normalizedValue;
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        const /** @type {?} */ LINE_START = '\n - ';
        throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
}
/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */
function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => { callback(event && copyAnimationEvent(event, 'start', player.totalTime)); });
            break;
        case 'done':
            player.onDone(() => { callback(event && copyAnimationEvent(event, 'done', player.totalTime)); });
            break;
        case 'destroy':
            player.onDestroy(() => { callback(event && copyAnimationEvent(event, 'destroy', player.totalTime)); });
            break;
    }
}
/**
 * @param {?} e
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @return {?}
 */
function copyAnimationEvent(e, phaseName, totalTime) {
    return makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime);
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @return {?}
 */
function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = null, totalTime = null) {
    return { element, triggerName, fromState, toState, phaseName, totalTime };
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
function getOrSetAsInMap(map, key, defaultValue) {
    let /** @type {?} */ value;
    if (map instanceof Map) {
        value = map.get(key);
        if (!value) {
            map.set(key, value = defaultValue);
        }
    }
    else {
        value = map[key];
        if (!value) {
            value = map[key] = defaultValue;
        }
    }
    return value;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @abstract
 */
class AnimationAst {
    /**
     * @abstract
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visit(ast, context) { }
}
class AnimationTriggerAst extends AnimationAst {
    /**
     * @param {?} name
     * @param {?} states
     * @param {?} transitions
     */
    constructor(name, states, transitions) {
        super();
        this.name = name;
        this.states = states;
        this.transitions = transitions;
        this.queryCount = 0;
        this.depCount = 0;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitTrigger(this, context);
    }
}
class AnimationStateAst extends AnimationAst {
    /**
     * @param {?} name
     * @param {?} style
     */
    constructor(name, style$$1) {
        super();
        this.name = name;
        this.style = style$$1;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitState(this, context);
    }
}
class AnimationTransitionAst extends AnimationAst {
    /**
     * @param {?} matchers
     * @param {?} animation
     * @param {?} locals
     */
    constructor(matchers, animation, locals) {
        super();
        this.matchers = matchers;
        this.animation = animation;
        this.locals = locals;
        this.queryCount = 0;
        this.depCount = 0;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitTransition(this, context);
    }
}
class AnimationSequenceAst extends AnimationAst {
    /**
     * @param {?} steps
     */
    constructor(steps) {
        super();
        this.steps = steps;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitSequence(this, context);
    }
}
class AnimationGroupAst extends AnimationAst {
    /**
     * @param {?} steps
     */
    constructor(steps) {
        super();
        this.steps = steps;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitGroup(this, context);
    }
}
class AnimationAnimateAst extends AnimationAst {
    /**
     * @param {?} timings
     * @param {?} style
     */
    constructor(timings, style$$1) {
        super();
        this.timings = timings;
        this.style = style$$1;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitAnimate(this, context);
    }
}
class AnimationStyleAst extends AnimationAst {
    /**
     * @param {?} styles
     * @param {?} easing
     * @param {?} offset
     */
    constructor(styles, easing, offset) {
        super();
        this.styles = styles;
        this.easing = easing;
        this.offset = offset;
        this.isEmptyStep = false;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitStyle(this, context);
    }
}
class AnimationKeyframesSequenceAst extends AnimationAst {
    /**
     * @param {?} styles
     */
    constructor(styles) {
        super();
        this.styles = styles;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitKeyframeSequence(this, context);
    }
}
class AnimationReferenceAst extends AnimationAst {
    /**
     * @param {?} animation
     * @param {?} locals
     */
    constructor(animation, locals) {
        super();
        this.animation = animation;
        this.locals = locals;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitReference(this, context);
    }
}
class AnimationAnimateChildAst extends AnimationAst {
    /**
     * @param {?} timings
     * @param {?} animation
     * @param {?} locals
     */
    constructor(timings, animation, locals) {
        super();
        this.timings = timings;
        this.animation = animation;
        this.locals = locals;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitAnimateChild(this, context);
    }
}
class AnimationQueryAst extends AnimationAst {
    /**
     * @param {?} selector
     * @param {?} multi
     * @param {?} includeSelf
     * @param {?} animation
     */
    constructor(selector, multi, includeSelf, animation) {
        super();
        this.selector = selector;
        this.multi = multi;
        this.includeSelf = includeSelf;
        this.animation = animation;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitQuery(this, context);
    }
}
class AnimationStaggerAst extends AnimationAst {
    /**
     * @param {?} timings
     * @param {?} animation
     */
    constructor(timings, animation) {
        super();
        this.timings = timings;
        this.animation = animation;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitStagger(this, context);
    }
}
class AnimationWaitAst extends AnimationAst {
    /**
     * @param {?} delay
     * @param {?=} animation
     */
    constructor(delay, animation) {
        super();
        this.delay = delay;
        this.animation = animation;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitWait(this, context);
    }
}
class AnimationTimingAst extends AnimationAst {
    /**
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     */
    constructor(duration, delay, easing) {
        super();
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitTiming(this, context);
    }
}
class DynamicAnimationTimingAst extends AnimationTimingAst {
    /**
     * @param {?} value
     */
    constructor(value) {
        super(0, 0, '');
        this.value = value;
    }
    /**
     * @param {?} visitor
     * @param {?} context
     * @return {?}
     */
    visit(visitor, context) {
        return visitor.visitTiming(this, context);
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} visitor
 * @param {?} node
 * @param {?} context
 * @return {?}
 */
function visitAnimationNode(visitor, node, context) {
    switch (node.type) {
        case 0 /* Trigger */:
            return visitor.visitTrigger(/** @type {?} */ (node), context);
        case 1 /* State */:
            return visitor.visitState(/** @type {?} */ (node), context);
        case 2 /* Transition */:
            return visitor.visitTransition(/** @type {?} */ (node), context);
        case 3 /* Sequence */:
            return visitor.visitSequence(/** @type {?} */ (node), context);
        case 4 /* Group */:
            return visitor.visitGroup(/** @type {?} */ (node), context);
        case 5 /* Animate */:
            return visitor.visitAnimate(/** @type {?} */ (node), context);
        case 6 /* KeyframeSequence */:
            return visitor.visitKeyframeSequence(/** @type {?} */ (node), context);
        case 7 /* Style */:
            return visitor.visitStyle(/** @type {?} */ (node), context);
        case 8 /* Definition */:
            return visitor.visitReference(/** @type {?} */ (node), context);
        case 9 /* AnimateChild */:
            return visitor.visitAnimateChild(/** @type {?} */ (node), context);
        case 10 /* Query */:
            return visitor.visitQuery(/** @type {?} */ (node), context);
        case 11 /* Stagger */:
            return visitor.visitStagger(/** @type {?} */ (node), context);
        case 12 /* Wait */:
            return visitor.visitWait(/** @type {?} */ (node), context);
        default:
            throw new Error(`Unable to resolve animation metadata node #${node.type}`);
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ANY_STATE = '*';
/**
 * @param {?} transitionValue
 * @param {?} errors
 * @return {?}
 */
function parseTransitionExpr(transitionValue, errors) {
    const /** @type {?} */ expressions = [];
    if (typeof transitionValue == 'string') {
        ((transitionValue))
            .split(/\s*,\s*/)
            .forEach(str => parseInnerTransitionStr(str, expressions, errors));
    }
    else {
        expressions.push(/** @type {?} */ (transitionValue));
    }
    return expressions;
}
/**
 * @param {?} eventStr
 * @param {?} expressions
 * @param {?} errors
 * @return {?}
 */
function parseInnerTransitionStr(eventStr, expressions, errors) {
    if (eventStr[0] == ':') {
        eventStr = parseAnimationAlias(eventStr, errors);
    }
    const /** @type {?} */ match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
    if (match == null || match.length < 4) {
        errors.push(`The provided transition expression "${eventStr}" is not supported`);
        return expressions;
    }
    const /** @type {?} */ fromState = match[1];
    const /** @type {?} */ separator = match[2];
    const /** @type {?} */ toState = match[3];
    expressions.push(makeLambdaFromStates(fromState, toState));
    const /** @type {?} */ isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
    if (separator[0] == '<' && !isFullAnyStateExpr) {
        expressions.push(makeLambdaFromStates(toState, fromState));
    }
}
/**
 * @param {?} alias
 * @param {?} errors
 * @return {?}
 */
function parseAnimationAlias(alias, errors) {
    switch (alias) {
        case ':enter':
            return 'void => *';
        case ':leave':
            return '* => void';
        default:
            errors.push(`The transition alias value "${alias}" is not supported`);
            return '* => *';
    }
}
/**
 * @param {?} lhs
 * @param {?} rhs
 * @return {?}
 */
function makeLambdaFromStates(lhs, rhs) {
    return (fromState, toState) => {
        const /** @type {?} */ lhsMatch = lhs == ANY_STATE || lhs == fromState;
        const /** @type {?} */ rhsMatch = rhs == ANY_STATE || rhs == toState;
        return lhsMatch && rhsMatch;
    };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} metadata
 * @param {?} errors
 * @return {?}
 */
function buildAnimationAst(metadata, errors) {
    return new AnimationAstBuilderVisitor().build(metadata, errors);
}
const LEAVE_TOKEN = ':leave';
const LEAVE_TOKEN_REGEX = new RegExp(LEAVE_TOKEN, 'g');
const ENTER_TOKEN = ':enter';
const ENTER_TOKEN_REGEX = new RegExp(ENTER_TOKEN, 'g');
class AnimationAstBuilderVisitor {
    /**
     * @param {?} metadata
     * @param {?} errors
     * @return {?}
     */
    build(metadata, errors) {
        const /** @type {?} */ context = new AnimationAstBuilderContext(errors);
        return (visitAnimationNode(this, normalizeAnimationEntry(metadata), context));
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitTrigger(metadata, context) {
        let /** @type {?} */ queryCount = context.queryCount = 0;
        let /** @type {?} */ depCount = context.depCount = 0;
        const /** @type {?} */ states = [];
        const /** @type {?} */ transitions = [];
        metadata.definitions.forEach(def => {
            if (def.type == 1 /* State */) {
                const /** @type {?} */ stateDef = (def);
                const /** @type {?} */ name = stateDef.name;
                name.split(/\s*,\s*/).forEach(n => {
                    stateDef.name = n;
                    states.push(this.visitState(stateDef, context));
                });
                stateDef.name = name;
            }
            else if (def.type == 2 /* Transition */) {
                const /** @type {?} */ transition = this.visitTransition(/** @type {?} */ (def), context);
                queryCount += transition.queryCount;
                depCount += transition.depCount;
                transitions.push(transition);
            }
            else {
                context.errors.push('only state() and transition() definitions can sit inside of a trigger()');
            }
        });
        const /** @type {?} */ ast = new AnimationTriggerAst(metadata.name, states, transitions);
        ast.queryCount = queryCount;
        ast.depCount = depCount;
        return ast;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitState(metadata, context) {
        return new AnimationStateAst(metadata.name, this.visitStyle(metadata.styles, context));
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitTransition(metadata, context) {
        context.queryCount = 0;
        context.depCount = 0;
        const /** @type {?} */ entry = visitAnimationNode(this, normalizeAnimationEntry(metadata.animation), context);
        const /** @type {?} */ matchers = parseTransitionExpr(metadata.expr, context.errors);
        const /** @type {?} */ ast = new AnimationTransitionAst(matchers, entry, normalizeLocals(metadata.locals));
        ast.queryCount = context.queryCount;
        ast.depCount = context.depCount;
        return ast;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitSequence(metadata, context) {
        return new AnimationSequenceAst(metadata.steps.map(s => visitAnimationNode(this, s, context)));
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitGroup(metadata, context) {
        const /** @type {?} */ currentTime = context.currentTime;
        let /** @type {?} */ furthestTime = 0;
        const /** @type {?} */ steps = metadata.steps.map(step => {
            context.currentTime = currentTime;
            const /** @type {?} */ ast = visitAnimationNode(this, step, context);
            furthestTime = Math.max(furthestTime, context.currentTime);
            return ast;
        });
        context.currentTime = furthestTime;
        return new AnimationGroupAst(steps);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitAnimate(metadata, context) {
        const /** @type {?} */ timingAst = constructTimingAst(metadata.timings, context.errors);
        context.currentAnimateTimings = timingAst;
        let /** @type {?} */ styles = null;
        let /** @type {?} */ styleMetadata = metadata.styles ? metadata.styles : style({});
        if (styleMetadata.type == 6 /* KeyframeSequence */) {
            styles =
                this.visitKeyframeSequence(/** @type {?} */ (styleMetadata), context);
        }
        else {
            let /** @type {?} */ styleMetadata = (metadata.styles);
            let /** @type {?} */ isEmpty = false;
            if (!styleMetadata) {
                isEmpty = true;
                const /** @type {?} */ newStyleData = {};
                if (timingAst.easing) {
                    newStyleData['easing'] = timingAst.easing;
                }
                styleMetadata = style(newStyleData);
            }
            context.currentTime += timingAst.duration + timingAst.delay;
            const /** @type {?} */ styleAst = this.visitStyle(styleMetadata, context);
            styleAst.isEmptyStep = isEmpty;
            styles = styleAst;
        }
        context.currentAnimateTimings = null;
        return new AnimationAnimateAst(timingAst, styles);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitStyle(metadata, context) {
        const /** @type {?} */ ast = this._makeStyleAst(metadata, context);
        this._validateStyleAst(ast, context);
        return ast;
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    _makeStyleAst(metadata, context) {
        const /** @type {?} */ styles = [];
        if (Array.isArray(metadata.styles)) {
            ((metadata.styles)).forEach(styleTuple => {
                if (typeof styleTuple == 'string') {
                    if (styleTuple == AUTO_STYLE) {
                        styles.push(/** @type {?} */ (styleTuple));
                    }
                    else {
                        context.errors.push(`The provided style string value ${styleTuple} is not allowed.`);
                    }
                }
                else {
                    styles.push(/** @type {?} */ (styleTuple));
                }
            });
        }
        else {
            styles.push(metadata.styles);
        }
        let /** @type {?} */ collectedEasing = null;
        styles.forEach(styleData => {
            if (isObject(styleData)) {
                const /** @type {?} */ styleMap = (styleData);
                const /** @type {?} */ easing = styleMap['easing'];
                if (easing) {
                    collectedEasing = (easing);
                    delete styleMap['easing'];
                }
            }
        });
        return new AnimationStyleAst(styles, collectedEasing, metadata.offset);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    _validateStyleAst(ast, context) {
        const /** @type {?} */ timings = context.currentAnimateTimings;
        let /** @type {?} */ endTime = context.currentTime;
        let /** @type {?} */ startTime = context.currentTime;
        if (timings && startTime > 0) {
            startTime -= timings.duration + timings.delay;
        }
        ast.styles.forEach(tuple => {
            if (typeof tuple == 'string')
                return;
            Object.keys(tuple).forEach(prop => {
                const /** @type {?} */ collectedStyles = context.collectedStyles[context.currentQuerySelector];
                const /** @type {?} */ collectedEntry = collectedStyles[prop];
                let /** @type {?} */ updateCollectedStyle = true;
                if (collectedEntry) {
                    if (startTime != endTime && startTime >= collectedEntry.startTime &&
                        endTime <= collectedEntry.endTime) {
                        context.errors.push(`The CSS property "${prop}" that exists between the times of "${collectedEntry.startTime}ms" and "${collectedEntry.endTime}ms" is also being animated in a parallel animation between the times of "${startTime}ms" and "${endTime}ms"`);
                        updateCollectedStyle = false;
                    }
                    // we always choose the smaller start time value since we
                    // want to have a record of the entire animation window where
                    // the style property is being animated in between
                    startTime = collectedEntry.startTime;
                }
                if (updateCollectedStyle) {
                    collectedStyles[prop] = { startTime, endTime };
                }
                if (context.locals) {
                    validateStyleLocals(tuple[prop], context.locals, context.errors);
                }
            });
        });
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(metadata, context) {
        if (!context.currentAnimateTimings) {
            context.errors.push(`keyframes() must be placed inside of a call to animate()`);
            return;
        }
        const /** @type {?} */ MAX_KEYFRAME_OFFSET = 1;
        let /** @type {?} */ totalKeyframesWithOffsets = 0;
        const /** @type {?} */ offsets = [];
        let /** @type {?} */ offsetsOutOfOrder = false;
        let /** @type {?} */ keyframesOutOfRange = false;
        let /** @type {?} */ previousOffset = 0;
        const /** @type {?} */ keyframes = metadata.steps.map(styles => {
            const /** @type {?} */ style$$1 = this._makeStyleAst(styles, context);
            let /** @type {?} */ offsetVal = style$$1.offset != null ? style$$1.offset : consumeOffset(style$$1.styles);
            let /** @type {?} */ offset = 0;
            if (offsetVal != null) {
                totalKeyframesWithOffsets++;
                offset = style$$1.offset = offsetVal;
            }
            keyframesOutOfRange = keyframesOutOfRange || offset < 0 || offset > 1;
            offsetsOutOfOrder = offsetsOutOfOrder || offset < previousOffset;
            previousOffset = offset;
            offsets.push(offset);
            return style$$1;
        });
        if (keyframesOutOfRange) {
            context.errors.push(`Please ensure that all keyframe offsets are between 0 and 1`);
        }
        if (offsetsOutOfOrder) {
            context.errors.push(`Please ensure that all keyframe offsets are in order`);
        }
        const /** @type {?} */ length = metadata.steps.length;
        let /** @type {?} */ generatedOffset = 0;
        if (totalKeyframesWithOffsets > 0 && totalKeyframesWithOffsets < length) {
            context.errors.push(`Not all style() steps within the declared keyframes() contain offsets`);
        }
        else if (totalKeyframesWithOffsets == 0) {
            generatedOffset = MAX_KEYFRAME_OFFSET / (length - 1);
        }
        const /** @type {?} */ limit = length - 1;
        const /** @type {?} */ currentTime = context.currentTime;
        const /** @type {?} */ animateDuration = context.currentAnimateTimings.duration;
        keyframes.forEach((kf, i) => {
            const /** @type {?} */ offset = generatedOffset > 0 ? (i == limit ? 1 : (generatedOffset * i)) : offsets[i];
            const /** @type {?} */ durationUpToThisFrame = offset * animateDuration;
            context.currentTime =
                currentTime + context.currentAnimateTimings.delay + durationUpToThisFrame;
            context.currentAnimateTimings.duration = durationUpToThisFrame;
            this._validateStyleAst(kf, context);
            kf.offset = offset;
        });
        return new AnimationKeyframesSequenceAst(keyframes);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitReference(metadata, context) {
        const /** @type {?} */ entry = visitAnimationNode(this, normalizeAnimationEntry(metadata.animation), context);
        return new AnimationReferenceAst(entry, normalizeLocals(metadata.locals));
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitAnimateChild(metadata, context) {
        let /** @type {?} */ animationArg = null;
        let /** @type {?} */ timings = null;
        let /** @type {?} */ locals = null;
        const /** @type {?} */ args = metadata.args;
        switch (countArgs(args)) {
            case 0:
                // animateChild()
                context.depCount++;
                break;
            case 1:
                // animateChild(string|definition|number)
                const /** @type {?} */ arg = args[0];
                if (typeof arg == 'string' || arg >= 0) {
                    // animateChild(string|number)
                    context.depCount++;
                    timings = resolveTimingValue(/** @type {?} */ (arg), context.errors);
                }
                else if (((arg)).type == 8 /* Definition */) {
                    // animateChild(definition)
                    animationArg = (arg);
                }
                break;
            case 2:
                animationArg = (args[0]);
                if (animationArg['type']) {
                    // animateChild(definition, locals)
                    animationArg = (args[0]);
                    locals = normalizeLocals(/** @type {?} */ (args[1]));
                }
                else {
                    // animateChild(string|number, definition)
                    timings = resolveTimingValue(/** @type {?} */ (args[0]), context.errors);
                    animationArg = (args[1]);
                }
                break;
            default:
                // animateChild(string|number, definition, locals)
                timings = resolveTimingValue(/** @type {?} */ (args[0]), context.errors);
                animationArg = (args[1]);
                locals = normalizeLocals(/** @type {?} */ (args[2]));
                break;
        }
        const /** @type {?} */ animation = animationArg ? this.visitReference(animationArg, context) : null;
        return new AnimationAnimateChildAst(timings, animation, locals);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitQuery(metadata, context) {
        const /** @type {?} */ parentSelector = context.currentQuerySelector;
        context.queryCount++;
        context.currentQuery = metadata;
        const [selector, includeSelf] = normalizeSelector(metadata.selector);
        context.currentQuerySelector =
            parentSelector.length ? (parentSelector + ' ' + selector) : selector;
        getOrSetAsInMap(context.collectedStyles, context.currentQuerySelector, {});
        const /** @type {?} */ entry = visitAnimationNode(this, normalizeAnimationEntry(metadata.animation), context);
        context.currentQuery = null;
        context.currentQuerySelector = parentSelector;
        return new AnimationQueryAst(selector, metadata.multi, includeSelf, entry);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitStagger(metadata, context) {
        if (!context.currentQuery || !context.currentQuery.multi) {
            context.errors.push(`stagger() can only be used inside of queryAll()`);
        }
        let /** @type {?} */ timings;
        let /** @type {?} */ animation;
        switch (countArgs(metadata.args)) {
            case 1:
                // stagger(animation)
                timings = ({ duration: 0, delay: 0, easing: 'full' });
                animation = visitAnimationNode(this, normalizeAnimationEntry(metadata.args[0]), context);
                break;
            default:
                // stagger(timing, animation)
                timings = resolveTimingValue(/** @type {?} */ (metadata.args[0]), context.errors, true);
                animation = visitAnimationNode(this, normalizeAnimationEntry(metadata.args[1]), context);
                break;
        }
        return new AnimationStaggerAst(timings, animation);
    }
    /**
     * @param {?} metadata
     * @param {?} context
     * @return {?}
     */
    visitWait(metadata, context) {
        const /** @type {?} */ timings = resolveTimingValue(metadata.delay, context.errors);
        if (timings.duration < 0) {
            context.errors.push('Negative wait delays are not supported');
        }
        if (timings.duration && timings.delay) {
            context.errors.push('Wait delays can only support a single timing value');
        }
        if (timings.easing) {
            context.errors.push('Wait delays cannot support easing values');
        }
        const /** @type {?} */ animation = metadata.animation ?
            visitAnimationNode(this, normalizeAnimationEntry(metadata.animation), context) :
            null;
        return new AnimationWaitAst(timings.duration, animation);
    }
}
/**
 * @param {?} selector
 * @return {?}
 */
function normalizeSelector(selector) {
    const /** @type {?} */ hasAmpersand = selector.split(/\s*,\s*/).find(token => token == '&') ? true : false;
    if (hasAmpersand) {
        selector = selector.replace(/\s*&\s*,?/g, '');
    }
    selector = selector.replace(ENTER_TOKEN_REGEX, ENTER_SELECTOR)
        .replace(LEAVE_TOKEN_REGEX, LEAVE_SELECTOR)
        .replace(/@\*/g, NG_TRIGGER_SELECTOR)
        .replace(/@\w+/g, match => NG_TRIGGER_SELECTOR + '-' + match.substr(1))
        .replace(/:animating/g, NG_ANIMATING_SELECTOR);
    return [selector, hasAmpersand];
}
/**
 * @param {?} obj
 * @return {?}
 */
function normalizeLocals(obj) {
    return obj ? copyObj(obj) : null;
}
/**
 * @param {?} args
 * @return {?}
 */
function countArgs(args) {
    return args.reduce((count, arg) => (arg != null ? 1 : 0) + count, 0);
}
class AnimationAstBuilderContext {
    /**
     * @param {?} errors
     */
    constructor(errors) {
        this.errors = errors;
        this.queryCount = 0;
        this.depCount = 0;
        this.currentTime = 0;
        this.collectedStyles = {};
        this.locals = null;
        // this is for the rootElement's selector
        const ROOT_SELECTOR = '';
        this.currentQuerySelector = ROOT_SELECTOR;
        this.collectedStyles[ROOT_SELECTOR] = {};
    }
}
/**
 * @param {?} styles
 * @return {?}
 */
function consumeOffset(styles) {
    let /** @type {?} */ offset = null;
    if (typeof styles == 'string')
        return offset;
    if (Array.isArray(styles)) {
        styles.forEach(styleTuple => {
            if (isObject(styleTuple) && styleTuple.hasOwnProperty('offset')) {
                const /** @type {?} */ obj = (styleTuple);
                offset = parseFloat(/** @type {?} */ (obj['offset']));
                delete obj['offset'];
            }
        });
    }
    else if (isObject(styles) && styles.hasOwnProperty('offset')) {
        const /** @type {?} */ obj = (styles);
        offset = parseFloat(/** @type {?} */ (obj['offset']));
        delete obj['offset'];
    }
    return offset;
}
/**
 * @param {?} value
 * @return {?}
 */
function isObject(value) {
    return !Array.isArray(value) && typeof value == 'object';
}
/**
 * @param {?} value
 * @param {?} errors
 * @return {?}
 */
function constructTimingAst(value, errors) {
    let /** @type {?} */ timings = null;
    if (value.hasOwnProperty('duration')) {
        timings = (value);
    }
    else if (typeof value == 'number') {
        const /** @type {?} */ duration = resolveTimingValue(/** @type {?} */ (value), errors).duration;
        return new AnimationTimingAst(/** @type {?} */ (value), 0, '');
    }
    const /** @type {?} */ strValue = (value);
    const /** @type {?} */ isDynamic = strValue.split(/\s+/).some(v => v.charAt(0) == '$');
    if (isDynamic) {
        return new DynamicAnimationTimingAst(strValue);
    }
    timings = timings || resolveTimingValue(strValue, errors);
    return new AnimationTimingAst(timings.duration, timings.delay, timings.easing);
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} element
 * @param {?} keyframes
 * @param {?} preStyleProps
 * @param {?} postStyleProps
 * @param {?} duration
 * @param {?} delay
 * @param {?} easing
 * @param {?=} subTimeline
 * @return {?}
 */
function createTimelineInstruction(element, keyframes, preStyleProps, postStyleProps, duration, delay, easing, subTimeline = false) {
    return {
        type: 1 /* TimelineAnimation */,
        element,
        keyframes,
        preStyleProps,
        postStyleProps,
        duration,
        delay,
        totalTime: duration + delay, easing, subTimeline
    };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ElementInstructionMap {
    constructor() {
        this._map = new Map();
    }
    /**
     * @param {?} element
     * @return {?}
     */
    consume(element) {
        let /** @type {?} */ instructions = this._map.get(element);
        if (instructions) {
            this._map.delete(element);
        }
        else {
            instructions = [];
        }
        return instructions;
    }
    /**
     * @param {?} element
     * @param {?} instructions
     * @return {?}
     */
    append(element, instructions) {
        let /** @type {?} */ existingInstructions = this._map.get(element);
        if (!existingInstructions) {
            this._map.set(element, existingInstructions = []);
        }
        existingInstructions.push(...instructions);
    }
    /**
     * @param {?} element
     * @return {?}
     */
    has(element) { return this._map.has(element); }
    /**
     * @return {?}
     */
    clear() { this._map.clear(); }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} rootElement
 * @param {?} ast
 * @param {?=} startingStyles
 * @param {?=} finalStyles
 * @param {?=} locals
 * @param {?=} subInstructions
 * @param {?=} errors
 * @return {?}
 */
function buildAnimationTimelines(rootElement, ast, startingStyles = {}, finalStyles = {}, locals, subInstructions, errors) {
    return new AnimationTimelineBuilderVisitor().buildKeyframes(rootElement, ast, startingStyles, finalStyles, locals, subInstructions, errors);
}
const DEFAULT_NOOP_PREVIOUS_NODE = ({});
class AnimationTimelineContext {
    /**
     * @param {?} element
     * @param {?} subInstructions
     * @param {?} errors
     * @param {?} timelines
     * @param {?=} initialTimeline
     */
    constructor(element, subInstructions, errors, timelines, initialTimeline = null) {
        this.element = element;
        this.errors = errors;
        this.timelines = timelines;
        this.parentContext = null;
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.subContextCount = 0;
        this.locals = null;
        this.currentQueryIndex = 0;
        this.currentQueryTotal = 0;
        this.currentStaggerTime = 0;
        this.currentTimeline = initialTimeline || new TimelineBuilder(element, 0);
        timelines.push(this.currentTimeline);
        this.subInstructions = subInstructions || new ElementInstructionMap();
    }
    /**
     * @param {?=} element
     * @param {?=} newTime
     * @return {?}
     */
    createSubContext(element = null, newTime = 0) {
        const /** @type {?} */ target = element || this.element;
        const /** @type {?} */ context = new AnimationTimelineContext(target, this.subInstructions, this.errors, this.timelines, this.currentTimeline.fork(target, newTime));
        context.previousNode = this.previousNode;
        context.currentAnimateTimings = this.currentAnimateTimings;
        context.locals = this.locals ? copyObj(this.locals) : null;
        context.currentQueryIndex = this.currentQueryIndex;
        context.currentQueryTotal = this.currentQueryTotal;
        context.parentContext = this;
        this.subContextCount++;
        return context;
    }
    /**
     * @param {?=} newTime
     * @return {?}
     */
    transformIntoNewTimeline(newTime = 0) {
        this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
        this.timelines.push(this.currentTimeline);
        return this.currentTimeline;
    }
    /**
     * @param {?} instruction
     * @param {?} timings
     * @return {?}
     */
    appendInstructionToTimeline(instruction, timings) {
        const /** @type {?} */ updatedTimings = {
            duration: timings ? timings.duration : instruction.duration,
            delay: this.currentTimeline.currentTime + (timings ? timings.delay : 0) + instruction.delay,
            easing: timings ? timings.easing : instruction.easing
        };
        const /** @type {?} */ builder = new SubTimelineBuilder(instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
        this.timelines.push(builder);
        return updatedTimings;
    }
    /**
     * @param {?} time
     * @return {?}
     */
    incrementTime(time) {
        this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
    }
}
class AnimationTimelineBuilderVisitor {
    /**
     * @param {?} rootElement
     * @param {?} ast
     * @param {?} startingStyles
     * @param {?} finalStyles
     * @param {?} locals
     * @param {?=} subInstructions
     * @param {?=} errors
     * @return {?}
     */
    buildKeyframes(rootElement, ast, startingStyles, finalStyles, locals, subInstructions = null, errors) {
        const /** @type {?} */ context = new AnimationTimelineContext(rootElement, subInstructions, errors, []);
        if (locals && Object.keys(locals).length == 0) {
            locals = null;
        }
        context.locals = locals;
        context.currentTimeline.setStyles([startingStyles], null, false, context.errors, locals);
        ast.visit(this, context);
        // this checks to see if an actual animation happened
        const /** @type {?} */ timelines = context.timelines.filter(timeline => timeline.containsAnimation());
        if (timelines.length && Object.keys(finalStyles).length) {
            const /** @type {?} */ tl = timelines[timelines.length - 1];
            if (!tl.allowOnlyTimelineStyles()) {
                tl.setStyles([finalStyles], null, false, context.errors, locals);
            }
        }
        return timelines.length ? timelines.map(timeline => timeline.buildKeyframes()) :
            [createTimelineInstruction(rootElement, [], [], [], 0, 0, '', false)];
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTrigger(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitState(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTransition(ast, context) {
        // these values are not visited in this AST
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimateChild(ast, context) {
        const /** @type {?} */ innerContext = context.createSubContext();
        innerContext.locals = ast.locals ? copyObj(ast.locals) : context.locals;
        if (ast.animation) {
            innerContext.transformIntoNewTimeline();
            this.visitReference(ast.animation, innerContext);
            context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
        }
        else {
            const /** @type {?} */ elementInstructions = context.subInstructions.consume(context.element);
            if (elementInstructions) {
                this._visitSubInstructions(elementInstructions, ast.timings, context);
            }
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} instructions
     * @param {?} timings
     * @param {?} context
     * @return {?}
     */
    _visitSubInstructions(instructions, timings, context) {
        if (timings && timings.duration === 0)
            return;
        const /** @type {?} */ rootElement = context.element;
        const /** @type {?} */ startTime = context.currentTimeline.currentTime;
        let /** @type {?} */ furthestTime = startTime;
        instructions.forEach(instruction => {
            const /** @type {?} */ instructionTimings = context.appendInstructionToTimeline(instruction, timings);
            furthestTime = Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
        });
        // create an animation for the element containing sub animations which contains
        // keyframes from start to finish to cover the entire animation so the player
        // for the container element will complete once everything below has finished
        if (startTime != furthestTime) {
            // there is no need to set a delay here since it is already known by the inner
            // timeline start time (it is updated within the appendInstructionToTimeline code)
            const /** @type {?} */ delay = 0;
            const /** @type {?} */ parentTimings = { duration: furthestTime - startTime, delay, easing: '' };
            const /** @type {?} */ keyframes = [{ offset: 0 }, { offset: 1 }];
            const /** @type {?} */ parentInstruction = createTimelineInstruction(rootElement, keyframes, [], [], parentTimings.duration, delay, '', true);
            context.appendInstructionToTimeline(parentInstruction, parentTimings);
            context.transformIntoNewTimeline(furthestTime);
        }
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitReference(ast, context) {
        // we traverse over all of the DEFAULT local values defined
        // in the `animation()` declaration. This way if the user has
        // not provided them in the `animateChild()` call (which is called
        // just before this then it will substitute them in
        if (ast.locals) {
            context.locals = context.locals || {};
            Object.keys(ast.locals).forEach(varName => {
                if (!context.locals.hasOwnProperty(varName)) {
                    context.locals[varName] = ast.locals[varName];
                }
            });
        }
        ast.animation.visit(this, context);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitSequence(ast, context) {
        const /** @type {?} */ subContextCount = context.subContextCount;
        if (context.previousNode instanceof AnimationStyleAst) {
            context.currentTimeline.forwardFrame();
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        ast.steps.forEach(s => s.visit(this, context));
        // this means that some animation function within the sequence
        // ended up creating a sub timeline (which means the current
        // timeline cannot overlap with the contents of the sequence)
        if (context.subContextCount > subContextCount) {
            context.transformIntoNewTimeline();
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitGroup(ast, context) {
        const /** @type {?} */ innerTimelines = [];
        let /** @type {?} */ furthestTime = context.currentTimeline.currentTime;
        ast.steps.forEach(s => {
            const /** @type {?} */ innerContext = context.createSubContext();
            s.visit(this, innerContext);
            furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
            innerTimelines.push(innerContext.currentTimeline);
        });
        // this operation is run after the AST loop because otherwise
        // if the parent timeline's collected styles were updated then
        // it would pass in invalid data into the new-to-be forked items
        innerTimelines.forEach(timeline => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
        context.transformIntoNewTimeline(furthestTime);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitTiming(ast, context) {
        if (ast instanceof DynamicAnimationTimingAst) {
            const /** @type {?} */ strValue = interpolateStyleLocals(ast.value, context.locals, context.errors);
            return resolveTimingValue(strValue, context.errors);
        }
        else {
            return { duration: ast.duration, delay: ast.delay, easing: ast.easing };
        }
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitAnimate(ast, context) {
        const /** @type {?} */ timings = context.currentAnimateTimings = this.visitTiming(ast.timings, context);
        if (timings.delay) {
            context.incrementTime(timings.delay);
            context.currentTimeline.snapshotCurrentStyles();
        }
        const /** @type {?} */ style$$1 = ast.style;
        if (style$$1 instanceof AnimationKeyframesSequenceAst) {
            this.visitKeyframeSequence(style$$1, context);
        }
        else {
            context.incrementTime(timings.duration);
            this.visitStyle(/** @type {?} */ (style$$1), context);
        }
        context.currentAnimateTimings = null;
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStyle(ast, context) {
        // this is a special case when a style() call is issued directly after
        // a call to animate(). If the clock is not forwarded by one frame then
        // the style() calls will be merged into the previous animate() call
        // which is incorrect.
        if (!context.currentAnimateTimings && context.previousNode instanceof AnimationAnimateAst) {
            context.currentTimeline.forwardFrame();
        }
        const /** @type {?} */ easing = (context.currentAnimateTimings && context.currentAnimateTimings.easing) || ast.easing;
        this._applyStyles(ast.styles, easing, ast.isEmptyStep, context);
        context.previousNode = ast;
    }
    /**
     * @param {?} styles
     * @param {?} easing
     * @param {?} treatAsEmptyStep
     * @param {?} context
     * @return {?}
     */
    _applyStyles(styles, easing, treatAsEmptyStep, context) {
        context.currentTimeline.setStyles(styles, easing, treatAsEmptyStep, context.errors, context.locals);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitKeyframeSequence(ast, context) {
        const /** @type {?} */ startTime = context.currentTimeline.duration;
        const /** @type {?} */ duration = context.currentAnimateTimings.duration;
        const /** @type {?} */ innerContext = context.createSubContext();
        const /** @type {?} */ innerTimeline = innerContext.currentTimeline;
        innerTimeline.easing = context.currentAnimateTimings.easing;
        ast.styles.forEach(step => {
            innerTimeline.forwardTime(step.offset * duration);
            this._applyStyles(step.styles, step.easing, false, innerContext);
        });
        // this will ensure that the parent timeline gets all the styles from
        // the child even if the new timeline below is not used
        context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
        // we do this because the window between this timeline and the sub timeline
        // should ensure that the styles within are exactly the same as they were before
        context.transformIntoNewTimeline(startTime + duration);
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitQuery(ast, context) {
        // in the event that the first step before this is a style step we need
        // to ensure the styles are applied before the children are animated
        const /** @type {?} */ startTime = context.currentTimeline.currentTime;
        if (context.previousNode instanceof AnimationStyleAst ||
            (startTime == 0 && context.currentTimeline.getCurrentStyleProperties().length)) {
            context.currentTimeline.forwardFrame();
            context.currentTimeline.snapshotCurrentStyles();
            context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        let /** @type {?} */ furthestTime = startTime;
        const /** @type {?} */ elms = invokeQuery(context.element, ast.selector, ast.multi, ast.includeSelf);
        context.currentQueryTotal = elms.length;
        let /** @type {?} */ sameElementTimeline = null;
        elms.forEach((element, i) => {
            context.currentQueryIndex = i;
            const /** @type {?} */ innerContext = context.createSubContext(element);
            let /** @type {?} */ tl = innerContext.currentTimeline;
            if (element === context.element) {
                sameElementTimeline = tl;
            }
            const /** @type {?} */ startTime = tl.currentTime;
            ast.animation.visit(this, innerContext);
            tl = innerContext.currentTimeline;
            let /** @type {?} */ endTime = tl.currentTime;
            // this means that the query itself ONLY took on styling calls. When this
            // happens we need to gaurantee that the styles are applied on screen.
            if (innerContext.previousNode instanceof AnimationStyleAst && startTime == endTime) {
                tl.forwardFrame();
                tl.snapshotCurrentStyles();
                endTime = tl.currentTime;
                innerContext.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
            }
            furthestTime = Math.max(furthestTime, endTime);
        });
        context.currentQueryIndex = 0;
        context.currentQueryTotal = 0;
        context.transformIntoNewTimeline(furthestTime);
        if (sameElementTimeline) {
            context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
            context.currentTimeline.snapshotCurrentStyles();
        }
        context.previousNode = ast;
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitStagger(ast, context) {
        const /** @type {?} */ parentContext = context.parentContext;
        const /** @type {?} */ tl = context.currentTimeline;
        const /** @type {?} */ timings = ast.timings;
        const /** @type {?} */ duration = Math.abs(timings.duration);
        const /** @type {?} */ maxTime = duration * (context.currentQueryTotal - 1);
        let /** @type {?} */ delay = duration * context.currentQueryIndex;
        let /** @type {?} */ staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
        switch (staggerTransformer) {
            case 'reverse':
                delay = maxTime - delay;
                break;
            case 'full':
                delay = parentContext.currentStaggerTime;
                break;
        }
        if (delay) {
            context.currentTimeline.delayNextStep(delay);
        }
        const /** @type {?} */ startingTime = context.currentTimeline.currentTime;
        ast.animation.visit(this, context);
        context.previousNode = ast;
        // time = duration + delay
        // the reason why this computation is so complex is because
        // the inner timeline may either have a delay value or a stretched
        // keyframe depending on if a subtimeline is not used or is used.
        parentContext.currentStaggerTime =
            (tl.currentTime - startingTime) + (tl.startTime - parentContext.currentTimeline.startTime);
    }
    /**
     * @param {?} ast
     * @param {?} context
     * @return {?}
     */
    visitWait(ast, context) {
        if (ast.delay) {
            if (context.previousNode instanceof AnimationStyleAst) {
                context.currentTimeline.forwardFrame();
                context.currentTimeline.snapshotCurrentStyles();
                context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
            }
            context.currentTimeline.delayNextStep(ast.delay);
            context.currentTimeline.snapshotCurrentStyles();
        }
        if (ast.animation) {
            ast.animation.visit(this, context);
        }
        context.previousNode = ast;
    }
}
class TimelineBuilder {
    /**
     * @param {?} element
     * @param {?} startTime
     * @param {?=} _elementTimelineStylesLookup
     */
    constructor(element, startTime, _elementTimelineStylesLookup) {
        this.element = element;
        this.startTime = startTime;
        this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
        this.duration = 0;
        this.easing = '';
        this._previousKeyframe = {};
        this._keyframes = new Map();
        this._styleSummary = {};
        this._backFill = {};
        this._currentEmptyStepKeyframe = null;
        if (!this._elementTimelineStylesLookup) {
            this._elementTimelineStylesLookup = new Map();
        }
        this._localTimelineStyles = Object.create(this._backFill, {});
        this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element);
        if (!this._globalTimelineStyles) {
            this._globalTimelineStyles = this._localTimelineStyles;
            this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
        }
        this._loadKeyframe();
    }
    /**
     * @return {?}
     */
    containsAnimation() { return this._keyframes.size > 1; }
    /**
     * @return {?}
     */
    getCurrentStyleProperties() { return Object.keys(this._currentKeyframe); }
    /**
     * @return {?}
     */
    get currentTime() { return this.startTime + this.duration; }
    /**
     * @param {?} delay
     * @return {?}
     */
    delayNextStep(delay) {
        if (this.duration == 0) {
            this.startTime += delay;
        }
        else {
            this.forwardTime(this.currentTime + delay);
        }
    }
    /**
     * @param {?} duration
     * @return {?}
     */
    warpTiming(duration) { this.duration = duration; }
    /**
     * @param {?} element
     * @param {?=} currentTime
     * @return {?}
     */
    fork(element, currentTime = 0) {
        return new TimelineBuilder(element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
    }
    /**
     * @return {?}
     */
    _loadKeyframe() {
        if (this._currentKeyframe) {
            this._previousKeyframe = this._currentKeyframe;
        }
        this._currentKeyframe = this._keyframes.get(this.duration);
        if (!this._currentKeyframe) {
            this._currentKeyframe = Object.create(this._backFill, {});
            this._keyframes.set(this.duration, this._currentKeyframe);
        }
    }
    /**
     * @return {?}
     */
    forwardFrame() {
        this.duration++;
        this._loadKeyframe();
    }
    /**
     * @param {?} time
     * @return {?}
     */
    forwardTime(time) {
        this.duration = time;
        this._loadKeyframe();
    }
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    _updateStyle(prop, value) {
        if (prop != 'easing') {
            this._localTimelineStyles[prop] = value;
            this._globalTimelineStyles[prop] = value;
            this._styleSummary[prop] = { time: this.currentTime, value };
        }
    }
    /**
     * @return {?}
     */
    allowOnlyTimelineStyles() { return this._currentEmptyStepKeyframe !== this._currentKeyframe; }
    /**
     * @param {?} input
     * @param {?} easing
     * @param {?} treatAsEmptyStep
     * @param {?} errors
     * @param {?=} locals
     * @return {?}
     */
    setStyles(input, easing, treatAsEmptyStep, errors, locals = null) {
        if (easing) {
            this._previousKeyframe['easing'] = easing;
        }
        if (treatAsEmptyStep) {
            // special case for animate(duration):
            // all missing styles are filled with a `*` value then
            // if any destination styles are filled in later on the same
            // keyframe then they will override the overridden styles
            // We use `_globalTimelineStyles` here because there may be
            // styles in previous keyframes that are not present in this timeline
            Object.keys(this._globalTimelineStyles).forEach(prop => {
                this._backFill[prop] = this._globalTimelineStyles[prop] || AUTO_STYLE;
                this._currentKeyframe[prop] = AUTO_STYLE;
            });
            this._currentEmptyStepKeyframe = this._currentKeyframe;
        }
        else {
            const /** @type {?} */ styles = flattenStyles(input, this._globalTimelineStyles);
            Object.keys(styles).forEach(prop => {
                let /** @type {?} */ val = styles[prop];
                if (locals) {
                    val = interpolateStyleLocals(val, locals, errors);
                }
                this._currentKeyframe[prop] = val;
                if (!this._localTimelineStyles[prop]) {
                    this._backFill[prop] = this._globalTimelineStyles.hasOwnProperty(prop) ?
                        this._globalTimelineStyles[prop] :
                        AUTO_STYLE;
                }
                this._updateStyle(prop, val);
            });
            Object.keys(this._localTimelineStyles).forEach(prop => {
                if (!this._currentKeyframe.hasOwnProperty(prop)) {
                    this._currentKeyframe[prop] = this._localTimelineStyles[prop];
                }
            });
        }
    }
    /**
     * @return {?}
     */
    snapshotCurrentStyles() { copyStyles(this._localTimelineStyles, false, this._currentKeyframe); }
    /**
     * @return {?}
     */
    getFinalKeyframe() { return this._keyframes.get(this.duration); }
    /**
     * @return {?}
     */
    get properties() {
        const /** @type {?} */ properties = [];
        for (let /** @type {?} */ prop in this._currentKeyframe) {
            properties.push(prop);
        }
        return properties;
    }
    /**
     * @param {?} timeline
     * @return {?}
     */
    mergeTimelineCollectedStyles(timeline) {
        Object.keys(timeline._styleSummary).forEach(prop => {
            const /** @type {?} */ details0 = this._styleSummary[prop];
            const /** @type {?} */ details1 = timeline._styleSummary[prop];
            if (!details0 || details1.time > details0.time) {
                this._updateStyle(prop, details1.value);
            }
        });
    }
    /**
     * @return {?}
     */
    buildKeyframes() {
        const /** @type {?} */ preStyleProps = new Set();
        const /** @type {?} */ postStyleProps = new Set();
        const /** @type {?} */ finalKeyframes = [];
        this._keyframes.forEach((keyframe, time) => {
            const /** @type {?} */ finalKeyframe = copyStyles(keyframe, true);
            Object.keys(finalKeyframe).forEach(prop => {
                const /** @type {?} */ value = finalKeyframe[prop];
                if (value == PRE_STYLE) {
                    preStyleProps.add(prop);
                }
                else if (value == AUTO_STYLE) {
                    postStyleProps.add(prop);
                }
            });
            finalKeyframe['offset'] = time / this.duration;
            finalKeyframes.push(finalKeyframe);
        });
        const /** @type {?} */ preProps = preStyleProps.size ? iteratorToArray(preStyleProps.values()) : [];
        const /** @type {?} */ postProps = postStyleProps.size ? iteratorToArray(postStyleProps.values()) : [];
        return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
    }
}
class SubTimelineBuilder extends TimelineBuilder {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} preStyleProps
     * @param {?} postStyleProps
     * @param {?} timings
     * @param {?=} _stretchStartingKeyframe
     */
    constructor(element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
        super(element, timings.delay);
        this.element = element;
        this.keyframes = keyframes;
        this.preStyleProps = preStyleProps;
        this.postStyleProps = postStyleProps;
        this._stretchStartingKeyframe = _stretchStartingKeyframe;
        this.timings = { duration: timings.duration, delay: timings.delay, easing: timings.easing };
    }
    /**
     * @return {?}
     */
    containsAnimation() { return this.keyframes.length > 1; }
    /**
     * @return {?}
     */
    buildKeyframes() {
        let /** @type {?} */ keyframes = this.keyframes;
        let { delay, duration, easing } = this.timings;
        if (this._stretchStartingKeyframe && delay) {
            const /** @type {?} */ newKeyframes = [];
            const /** @type {?} */ totalTime = duration + delay;
            const /** @type {?} */ startingGap = delay / totalTime;
            // the original starting keyframe now starts once the delay is done
            const /** @type {?} */ newFirstKeyframe = copyStyles(keyframes[0], false);
            newFirstKeyframe['offset'] = 0;
            newKeyframes.push(newFirstKeyframe);
            const /** @type {?} */ oldFirstKeyframe = copyStyles(keyframes[0], false);
            oldFirstKeyframe['offset'] = roundOffset(startingGap);
            newKeyframes.push(oldFirstKeyframe);
            /*
              When the keyframe is stretched then it means that the delay before the animation
              starts is gone. Instead the first keyframe is placed at the start of the animation
              and it is then copied to where it starts when the original delay is over. This basically
              means nothing animates during that delay, but the styles are still renderered. For this
              to work the original offset values that exist in the original keyframes must be "warped"
              so that they can take the new keyframe + delay into account.
      
              delay=1000, duration=1000, keyframes = 0 .5 1
      
              turns into
      
              delay=0, duration=2000, keyframes = 0 .33 .66 1
             */
            // offsets between 1 ... n -1 are all warped by the keyframe stretch
            const /** @type {?} */ limit = keyframes.length - 1;
            for (let /** @type {?} */ i = 1; i <= limit; i++) {
                let /** @type {?} */ kf = copyStyles(keyframes[i], false);
                const /** @type {?} */ oldOffset = (kf['offset']);
                const /** @type {?} */ timeAtKeyframe = delay + oldOffset * duration;
                kf['offset'] = roundOffset(timeAtKeyframe / totalTime);
                newKeyframes.push(kf);
            }
            // the new starting keyframe should be added at the start
            duration = totalTime;
            delay = 0;
            easing = '';
            keyframes = newKeyframes;
        }
        return createTimelineInstruction(this.element, keyframes, this.preStyleProps, this.postStyleProps, duration, delay, easing, true);
    }
}
/**
 * @param {?} rootElement
 * @param {?} selector
 * @param {?} multi
 * @param {?} includeSelf
 * @return {?}
 */
function invokeQuery(rootElement, selector, multi, includeSelf) {
    let /** @type {?} */ results = [];
    if (includeSelf) {
        results.push(rootElement);
    }
    if (multi) {
        results.push(...rootElement.querySelectorAll(selector));
    }
    else if (results.length == 0) {
        const /** @type {?} */ elm = rootElement.querySelector(selector);
        if (elm) {
            results.push(elm);
        }
    }
    return results;
}
/**
 * @param {?} offset
 * @param {?=} decimalPoints
 * @return {?}
 */
function roundOffset(offset, decimalPoints = 3) {
    const /** @type {?} */ mult = Math.pow(10, decimalPoints - 1);
    return Math.round(offset * mult) / mult;
}
/**
 * @param {?} input
 * @param {?} allStyles
 * @return {?}
 */
function flattenStyles(input, allStyles) {
    const /** @type {?} */ styles = {};
    let /** @type {?} */ allProperties;
    input.forEach(token => {
        if (token === '*') {
            allProperties = allProperties || Object.keys(allStyles);
            allProperties.forEach(prop => { styles[prop] = AUTO_STYLE; });
        }
        else {
            copyStyles(/** @type {?} */ (token), false, styles);
        }
    });
    return styles;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Animation {
    /**
     * @param {?} input
     */
    constructor(input) {
        const errors = [];
        const ast = buildAnimationAst(input, errors);
        if (errors.length) {
            const errorMessage = `animation validation failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        this._animationAst = ast;
    }
    /**
     * @param {?} element
     * @param {?} startingStyles
     * @param {?} destinationStyles
     * @param {?} locals
     * @param {?=} subInstructions
     * @return {?}
     */
    buildTimelines(element, startingStyles, destinationStyles, locals, subInstructions = null) {
        const /** @type {?} */ start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) : (startingStyles);
        const /** @type {?} */ dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) : (destinationStyles);
        const /** @type {?} */ errors = [];
        subInstructions = subInstructions || new ElementInstructionMap();
        const /** @type {?} */ result = buildAnimationTimelines(element, this._animationAst, start, dest, locals, subInstructions, errors);
        if (errors.length) {
            const /** @type {?} */ errorMessage = `animation building failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        return result;
    }
}

/**
 * \@experimental Animation support is experimental.
 * @abstract
 */
class AnimationStyleNormalizer {
    /**
     * @abstract
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) { }
    /**
     * @abstract
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) { }
}
/**
 * \@experimental Animation support is experimental.
 */
class NoopAnimationStyleNormalizer {
    /**
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) { return propertyName; }
    /**
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        return (value);
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    /**
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) {
        return dashCaseToCamelCase(propertyName);
    }
    /**
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        let /** @type {?} */ unit = '';
        const /** @type {?} */ strVal = value.toString().trim();
        if (DIMENSIONAL_PROP_MAP[normalizedProperty] && value !== 0 && value !== '0') {
            if (typeof value === 'number') {
                unit = 'px';
            }
            else {
                const /** @type {?} */ valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errors.push(`Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
                }
            }
        }
        return strVal + unit;
    }
}
const DIMENSIONAL_PROP_MAP = makeBooleanMap('width,height,minWidth,minHeight,maxWidth,maxHeight,left,top,bottom,right,fontSize,outlineWidth,outlineOffset,paddingTop,paddingLeft,paddingBottom,paddingRight,marginTop,marginLeft,marginBottom,marginRight,borderRadius,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,textIndent'
    .split(','));
/**
 * @param {?} keys
 * @return {?}
 */
function makeBooleanMap(keys) {
    const /** @type {?} */ map = {};
    keys.forEach(key => map[key] = true);
    return map;
}
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?} isRemovalTransition
 * @param {?} fromStyles
 * @param {?} toStyles
 * @param {?} timelines
 * @param {?} queriedElements
 * @param {?} preStyleProps
 * @param {?} postStyleProps
 * @return {?}
 */
function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps) {
    return {
        type: 0 /* TransitionAnimation */,
        element,
        triggerName,
        isRemovalTransition,
        fromState,
        fromStyles,
        toState,
        toStyles,
        timelines,
        queriedElements,
        preStyleProps,
        postStyleProps
    };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class AnimationTransitionFactory {
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
     * @return {?}
     */
    match(currentState, nextState) {
        return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState);
    }
    /**
     * @param {?} element
     * @param {?} currentState
     * @param {?} nextState
     * @param {?=} locals
     * @param {?=} subInstructions
     * @return {?}
     */
    build(element, currentState, nextState, locals = null, subInstructions = null) {
        let /** @type {?} */ animationLocals = null;
        if (this.ast.locals) {
            animationLocals = ((locals || {}));
            Object.keys(this.ast.locals).forEach(prop => {
                if (!animationLocals.hasOwnProperty(prop)) {
                    animationLocals[prop] = this.ast.locals[prop];
                }
            });
        }
        const /** @type {?} */ backupStateStyles = this._stateStyles['*'] || {};
        const /** @type {?} */ currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
        const /** @type {?} */ nextStateStyles = this._stateStyles[nextState] || backupStateStyles;
        const /** @type {?} */ errors = [];
        const /** @type {?} */ timelines = buildAnimationTimelines(element, this.ast.animation, currentStateStyles, nextStateStyles, animationLocals, subInstructions, errors);
        if (errors.length) {
            const /** @type {?} */ errorMessage = `animation building failed:\n${errors.join("\n")}`;
            throw new Error(errorMessage);
        }
        const /** @type {?} */ preStyleMap = new Map();
        const /** @type {?} */ postStyleMap = new Map();
        const /** @type {?} */ queriedElements = new Set();
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
        return createTransitionInstruction(element, this._triggerName, currentState, nextState, nextState === 'void', currentStateStyles, nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap);
    }
}
/**
 * @param {?} matchFns
 * @param {?} currentState
 * @param {?} nextState
 * @return {?}
 */
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState) {
    return matchFns.some(fn => fn(currentState, nextState));
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} ast
 * @return {?}
 */
function buildTrigger(name, ast) {
    return new AnimationTrigger(name, ast);
}
/**
 * \@experimental Animation support is experimental.
 */
class AnimationTrigger {
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
            const obj = this.states[ast.name] = {};
            ast.style.styles.forEach(styleTuple => {
                if (typeof styleTuple == 'object') {
                    copyStyles(styleTuple, false, obj);
                }
            });
        });
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
     * @return {?}
     */
    matchTransition(currentState, nextState) {
        return this.transitionFactories.find(f => f.match(currentState, nextState));
    }
}
/**
 * @param {?} triggerName
 * @param {?} states
 * @return {?}
 */
function createFallbackTransition(triggerName, states) {
    const /** @type {?} */ matchers = [(fromState, toState) => true];
    const /** @type {?} */ animation = new AnimationSequenceAst([]);
    const /** @type {?} */ transition = new AnimationTransitionAst(matchers, animation, {});
    return new AnimationTransitionFactory(triggerName, transition, states);
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EMPTY_INSTRUCTION_MAP = new ElementInstructionMap();
class TimelineAnimationEngine {
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(_driver, _normalizer) {
        this._driver = _driver;
        this._normalizer = _normalizer;
        this._animations = {};
        this._playersById = {};
        this.players = [];
    }
    /**
     * @param {?} id
     * @param {?} metadata
     * @return {?}
     */
    register(id, metadata) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = buildAnimationAst(metadata, errors);
        if (errors.length) {
            throw new Error(`Unable to build the animation due to the following errors: ${errors.join("\n")}`);
        }
        else {
            this._animations[id] = ast;
        }
    }
    /**
     * @param {?} i
     * @param {?} preStyles
     * @param {?} postStyles
     * @return {?}
     */
    _buildPlayer(i, preStyles, postStyles) {
        const /** @type {?} */ element = i.element;
        const /** @type {?} */ keyframes = normalizeKeyframes(this._driver, this._normalizer, element, i.keyframes, preStyles, postStyles);
        return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, []);
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?=} locals
     * @return {?}
     */
    create(id, element, locals = {}) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = this._animations[id];
        let /** @type {?} */ instructions;
        const /** @type {?} */ autoStylesMap = new Map();
        if (ast) {
            instructions =
                buildAnimationTimelines(element, ast, {}, {}, locals, EMPTY_INSTRUCTION_MAP, errors);
            instructions.forEach(inst => {
                const /** @type {?} */ styles = getOrSetAsInMap(autoStylesMap, inst.element, {});
                inst.postStyleProps.forEach(prop => styles[prop] = null);
            });
        }
        else {
            errors.push('The requested animation doesn\'t exist or has already been destroyed');
        }
        if (errors.length) {
            throw new Error(`Unable to create the animation due to the following errors: ${errors.join("\n")}`);
        }
        autoStylesMap.forEach((styles, element) => {
            Object.keys(styles).forEach(prop => { styles[prop] = this._driver.computeStyle(element, prop, AUTO_STYLE); });
        });
        const /** @type {?} */ players = instructions.map(i => {
            const /** @type {?} */ styles = autoStylesMap.get(i.element);
            return this._buildPlayer(i, {}, styles);
        });
        const /** @type {?} */ player = optimizeGroupPlayer(players);
        this._playersById[id] = player;
        player.onDestroy(() => this.destroy(id));
        this.players.push(player);
        return player;
    }
    /**
     * @param {?} id
     * @return {?}
     */
    destroy(id) {
        const /** @type {?} */ player = this._getPlayer(id);
        player.destroy();
        delete this._playersById[id];
        const /** @type {?} */ index = this.players.indexOf(player);
        if (index >= 0) {
            this.players.splice(index, 1);
        }
    }
    /**
     * @param {?} id
     * @return {?}
     */
    _getPlayer(id) {
        const /** @type {?} */ player = this._playersById[id];
        if (!player) {
            throw new Error(`Unable to find the timeline player referenced by ${id}`);
        }
        return player;
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    listen(id, element, eventName, callback) {
        // triggerName, fromState, toState are all ignored for timeline animations
        const /** @type {?} */ baseEvent = makeAnimationEvent(element, null, null, null);
        listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
        return () => { };
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} command
     * @param {?} args
     * @return {?}
     */
    command(id, element, command, args) {
        if (command == 'register') {
            this.register(id, /** @type {?} */ (args[0]));
            return;
        }
        if (command == 'create') {
            const /** @type {?} */ locals = ((args[0] || {}));
            this.create(id, element, locals);
            return;
        }
        const /** @type {?} */ player = this._getPlayer(id);
        switch (command) {
            case 'play':
                player.play();
                break;
            case 'pause':
                player.pause();
                break;
            case 'reset':
                player.reset();
                break;
            case 'restart':
                player.restart();
                break;
            case 'finish':
                player.finish();
                break;
            case 'init':
                player.init();
                break;
            case 'setPosition':
                player.setPosition(parseFloat(/** @type {?} */ (args[0])));
                break;
            case 'destroy':
                this.destroy(id);
                break;
        }
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EMPTY_PLAYER_ARRAY = [];
class StateValue {
    /**
     * @param {?} input
     */
    constructor(input) {
        const isObj = input && input.hasOwnProperty('value');
        const value = isObj ? input['value'] : input;
        this.value = normalizeTriggerValue(value);
        this.data = isObj ? input : { value: value };
    }
}
const VOID_VALUE = 'void';
const DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
const DELETED_STATE_VALUE = new StateValue('DELETED');
const POTENTIAL_ENTER_CLASSNAME = ENTER_CLASSNAME + '-temp';
const POTENTIAL_ENTER_SELECTOR = '.' + POTENTIAL_ENTER_CLASSNAME;
class AnimationTransitionNamespace {
    /**
     * @param {?} id
     * @param {?} hostElement
     * @param {?} _engine
     */
    constructor(id, hostElement, _engine) {
        this.id = id;
        this.hostElement = hostElement;
        this._engine = _engine;
        this.players = [];
        this._triggers = {};
        this._queue = [];
        this._elementListeners = new Map();
        this._hostClassName = 'ng-tns-' + id;
    }
    /**
     * @param {?} element
     * @param {?} name
     * @param {?} phase
     * @param {?} callback
     * @return {?}
     */
    listen(element, name, phase, callback) {
        if (!this._triggers.hasOwnProperty(name)) {
            throw new Error(`Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn\'t exist!`);
        }
        if (phase == null || phase.length == 0) {
            throw new Error(`Unable to listen on the animation trigger "${name}" because the provided event is undefined!`);
        }
        if (!isTriggerEventValid(phase)) {
            throw new Error(`The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`);
        }
        const /** @type {?} */ listeners = getOrSetAsInMap(this._elementListeners, element, []);
        const /** @type {?} */ data = { name, phase, callback };
        listeners.push(data);
        const /** @type {?} */ triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
        if (!triggersWithStates.hasOwnProperty(name)) {
            element.classList.add(NG_TRIGGER_CLASSNAME);
            element.classList.add(NG_TRIGGER_CLASSNAME + '-' + name);
            triggersWithStates[name] = null;
        }
        return () => {
            // the event listener is removed AFTER the flush has occurred such
            // that leave animations callbacks can fire (otherwise if the node
            // is removed in between then the listeners would be deregistered)
            this._engine.afterFlush(() => {
                const /** @type {?} */ index = listeners.indexOf(data);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
                if (!this._triggers[name]) {
                    delete triggersWithStates[name];
                }
            });
        };
    }
    /**
     * @param {?} name
     * @param {?} ast
     * @return {?}
     */
    register(name, ast) {
        if (this._triggers[name]) {
            // throw
            return false;
        }
        else {
            this._triggers[name] = ast;
            return true;
        }
    }
    /**
     * @param {?} name
     * @return {?}
     */
    _getTrigger(name) {
        const /** @type {?} */ trigger = this._triggers[name];
        if (!trigger) {
            throw new Error(`The provided animation trigger "${name}" has not been registered!`);
        }
        return trigger;
    }
    /**
     * @param {?} element
     * @param {?} triggerName
     * @param {?} value
     * @param {?=} defaultToFallback
     * @return {?}
     */
    trigger(element, triggerName, value, defaultToFallback = true) {
        const /** @type {?} */ trigger = this._getTrigger(triggerName);
        const /** @type {?} */ player = new TransitionAnimationPlayer(this.id, triggerName, element);
        if (!document.body.contains(element)) {
            return player;
        }
        let /** @type {?} */ triggersWithStates = this._engine.statesByElement.get(element);
        if (!triggersWithStates) {
            element.classList.add(NG_TRIGGER_CLASSNAME);
            element.classList.add(NG_TRIGGER_CLASSNAME + '-' + triggerName);
            this._engine.statesByElement.set(element, triggersWithStates = {});
        }
        let /** @type {?} */ fromState = triggersWithStates[triggerName];
        const /** @type {?} */ toState = new StateValue(value);
        triggersWithStates[triggerName] = toState;
        if (!fromState) {
            fromState = DEFAULT_STATE_VALUE;
        }
        else if (fromState === DELETED_STATE_VALUE) {
            return player;
        }
        const /** @type {?} */ playersOnElement = getOrSetAsInMap(this._engine.playersByElement, element, []);
        playersOnElement.forEach(player => {
            // only remove the player if it is queued on the EXACT same trigger/namespace
            // we only also deal with queued players here because if the animation has
            // started then we want to keep the player alive until the flush happens
            // (which is where the previousPlayers are passed into the new palyer)
            if (player.namespaceId == this.id && player.triggerName == triggerName && player.queued) {
                player.destroy();
            }
        });
        let /** @type {?} */ transition = trigger.matchTransition(fromState.value, toState.value);
        let /** @type {?} */ isFallbackTransition = false;
        if (!transition) {
            if (!defaultToFallback)
                return null;
            transition = trigger.fallbackTransition;
            isFallbackTransition = true;
        }
        this._engine.totalQueuedPlayers++;
        this._queue.push({ element, triggerName, transition, fromState, toState, player, isFallbackTransition });
        if (!isFallbackTransition) {
            element.classList.add(NG_ANIMATING_CLASSNAME);
        }
        player.onDone(() => {
            element.classList.remove(NG_ANIMATING_CLASSNAME);
            let /** @type {?} */ index = this.players.indexOf(player);
            if (index >= 0) {
                this.players.splice(index, 1);
            }
            const /** @type {?} */ players = this._engine.playersByElement.get(element);
            if (players) {
                let /** @type {?} */ index = players.indexOf(player);
                if (index >= 0) {
                    players.splice(index, 1);
                }
            }
        });
        this.players.push(player);
        playersOnElement.push(player);
        return player;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    deregister(name) {
        delete this._triggers[name];
        this._engine.statesByElement.forEach((stateMap, element) => { delete stateMap[name]; });
        this._elementListeners.forEach((listeners, element) => {
            this._elementListeners.set(element, listeners.filter(entry => { return entry.name != name; }));
        });
    }
    /**
     * @param {?} element
     * @return {?}
     */
    _onElementDestroy(element) {
        this._engine.statesByElement.delete(element);
        this._elementListeners.delete(element);
        const /** @type {?} */ elementPlayers = this._engine.playersByElement.get(element);
        if (elementPlayers) {
            elementPlayers.forEach(player => player.destroy());
            this._engine.playersByElement.delete(element);
        }
    }
    /**
     * @param {?} rootElement
     * @param {?} context
     * @param {?=} animate
     * @return {?}
     */
    _destroyInnerNodes(rootElement, context, animate = false) {
        listToArray(rootElement.querySelectorAll(NG_TRIGGER_SELECTOR)).forEach(elm => {
            if (animate && elm.classList.contains(this._hostClassName)) {
                const /** @type {?} */ innerNs = this._engine.namespacesByHostElement.get(elm);
                // special case for a host element with animations on the same element
                if (innerNs) {
                    innerNs.removeNode(elm, context, true);
                }
                this.removeNode(elm, context, true);
            }
            else {
                this._onElementDestroy(elm);
            }
        });
    }
    /**
     * @param {?} element
     * @param {?} context
     * @param {?=} doNotRecurse
     * @return {?}
     */
    removeNode(element, context, doNotRecurse) {
        const /** @type {?} */ engine = this._engine;
        element.classList.add(LEAVE_CLASSNAME);
        engine.afterFlush(() => element.classList.remove(LEAVE_CLASSNAME));
        if (!doNotRecurse && element.childElementCount) {
            this._destroyInnerNodes(element, context, true);
        }
        const /** @type {?} */ triggerStates = engine.statesByElement.get(element);
        if (triggerStates) {
            const /** @type {?} */ players = [];
            Object.keys(triggerStates).forEach(triggerName => {
                // this check is here in the event that an element is removed
                // twice (both on the host level and the component level)
                if (this._triggers[triggerName]) {
                    const /** @type {?} */ player = this.trigger(element, triggerName, VOID_VALUE, false);
                    if (player) {
                        players.push(player);
                    }
                }
            });
            if (players.length) {
                optimizeGroupPlayer(players).onDone(() => {
                    engine.destroyInnerAnimations(element);
                    this._onElementDestroy(element);
                    engine.onRemovalComplete(element, context);
                });
                return;
            }
        }
        // find the player that is animating and make sure that the
        // removal is delayed until that player has completed
        let /** @type {?} */ containsPotentialParentTransition = false;
        if (engine.totalAnimations) {
            const /** @type {?} */ currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
            // when this `if statement` does not continue forward it means that
            // a previous animation query has selected the current element and
            // is animating it. In this situation want to continue fowards and
            // allow the element to be queued up for animation later.
            if (currentPlayers && currentPlayers.length) {
                containsPotentialParentTransition = true;
            }
            else {
                let /** @type {?} */ parent = element;
                while (parent = parent.parentNode) {
                    const /** @type {?} */ triggers = engine.statesByElement.get(parent);
                    if (triggers) {
                        containsPotentialParentTransition = true;
                        break;
                    }
                }
            }
        }
        // at this stage we know that the element will either get removed
        // during flush or will be picked up by a parent query. Either way
        // we need to fire the listeners for this element when it DOES get
        // removed (once the query parent animation is done or after flush)
        const /** @type {?} */ listeners = this._elementListeners.get(element);
        if (listeners) {
            const /** @type {?} */ visitedTriggers = new Set();
            listeners.forEach(listener => {
                const /** @type {?} */ triggerName = listener.name;
                if (visitedTriggers.has(triggerName))
                    return;
                visitedTriggers.add(triggerName);
                const /** @type {?} */ trigger = this._triggers[triggerName];
                const /** @type {?} */ transition = trigger.fallbackTransition;
                const /** @type {?} */ fromState = engine.statesByElement.get(element)[triggerName] || DEFAULT_STATE_VALUE;
                const /** @type {?} */ toState = new StateValue(VOID_VALUE);
                const /** @type {?} */ player = new TransitionAnimationPlayer(this.id, triggerName, element);
                this._engine.totalQueuedPlayers++;
                this._queue.push({
                    element,
                    triggerName,
                    transition,
                    fromState,
                    toState,
                    player,
                    isFallbackTransition: true
                });
            });
        }
        // whether or not a parent has an animation we need to delay the deferral of the leave
        // operation until we have more information (which we do after flush() has been called)
        if (containsPotentialParentTransition) {
            engine.queuedRemovals.set(element, () => {
                engine.destroyInnerAnimations(element);
                this._onElementDestroy(element);
                engine.onRemovalComplete(element, context);
            });
        }
        else {
            // we do this after the flush has occurred such
            // that the callbacks can be fired
            engine.afterFlush(() => this._onElementDestroy(element));
            engine.destroyInnerAnimations(element);
            engine.onRemovalComplete(element, context);
        }
    }
    /**
     * @param {?} element
     * @param {?} parent
     * @return {?}
     */
    insertNode(element, parent) { element.classList.add(this._hostClassName); }
    /**
     * @return {?}
     */
    drainQueuedTransitions() {
        const /** @type {?} */ instructions = [];
        this._queue.forEach(entry => {
            const /** @type {?} */ player = entry.player;
            if (player.destroyed)
                return;
            const /** @type {?} */ element = entry.element;
            const /** @type {?} */ listeners = this._elementListeners.get(element);
            if (listeners) {
                listeners.forEach((listener) => {
                    if (listener.name == entry.triggerName) {
                        const /** @type {?} */ baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
                        listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
                    }
                });
            }
            if (player.markedForDestroy) {
                this._engine.afterFlush(() => {
                    // now we can destroy the element properly since the event listeners have
                    // been bound to the player
                    player.destroy();
                });
            }
            else {
                instructions.push(entry);
            }
        });
        this._queue = [];
        return instructions.sort((a, b) => {
            // if depCount == 0 them move to front
            // otherwise if a.contains(b) then move back
            const /** @type {?} */ d0 = a.transition.ast.depCount;
            const /** @type {?} */ d1 = b.transition.ast.depCount;
            if (d0 == 0 || d1 == 0) {
                return d0 - d1;
            }
            return a.element.contains(b.element) ? 1 : -1;
        });
    }
    /**
     * @param {?} context
     * @return {?}
     */
    destroy(context) {
        this.players.forEach(p => p.destroy());
        this._destroyInnerNodes(this.hostElement, context);
    }
    /**
     * @param {?} element
     * @return {?}
     */
    elementContainsData(element) {
        let /** @type {?} */ containsData = false;
        if (this._elementListeners.has(element))
            containsData = true;
        containsData =
            (this._queue.find(entry => entry.element === element) ? true : false) || containsData;
        return containsData;
    }
}
class TransitionAnimationEngine {
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(_driver, _normalizer) {
        this._driver = _driver;
        this._normalizer = _normalizer;
        this.players = [];
        this.queuedRemovals = new Map();
        this.newlyInserted = new Set();
        this.newHostElements = new Map();
        this.playersByElement = new Map();
        this.playersByQueriedElement = new Map();
        this.statesByElement = new Map();
        this.totalAnimations = 0;
        this.totalQueuedPlayers = 0;
        this._namespaceLookup = {};
        this._namespaceList = [];
        this._flushFns = [];
        this._whenQuietFns = [];
        this.namespacesByHostElement = new Map();
        this.onRemovalComplete = (element, context) => { };
    }
    /**
     * @return {?}
     */
    get queuedPlayers() {
        const /** @type {?} */ players = [];
        this._namespaceList.forEach(ns => {
            ns.players.forEach(player => {
                if (player.queued) {
                    players.push(player);
                }
            });
        });
        return players;
    }
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @return {?}
     */
    createNamespace(namespaceId, hostElement) {
        const /** @type {?} */ ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
        if (hostElement.parentNode) {
            this._balanceNamespaceList(ns, hostElement);
        }
        else {
            // defer this later until flush during when the host element has
            // been inserted so that we know exactly where to place it in
            // the namespace list
            this.newHostElements.set(hostElement, ns);
        }
        return this._namespaceLookup[namespaceId] = ns;
    }
    /**
     * @param {?} ns
     * @param {?} hostElement
     * @return {?}
     */
    _balanceNamespaceList(ns, hostElement) {
        const /** @type {?} */ limit = this._namespaceList.length - 1;
        if (limit >= 0) {
            let /** @type {?} */ found = false;
            for (let /** @type {?} */ i = limit; i >= 0; i--) {
                const /** @type {?} */ nextNamespace = this._namespaceList[i];
                if (nextNamespace.hostElement.contains(hostElement)) {
                    this._namespaceList.splice(i + 1, 0, ns);
                    found = true;
                    break;
                }
            }
            if (!found) {
                this._namespaceList.splice(0, 0, ns);
            }
        }
        else {
            this._namespaceList.push(ns);
        }
        this.namespacesByHostElement.set(hostElement, ns);
        return ns;
    }
    /**
     * @param {?} namespaceId
     * @param {?} hostElement
     * @param {?} name
     * @param {?} trigger
     * @return {?}
     */
    register(namespaceId, hostElement, name, trigger) {
        let /** @type {?} */ ns = this._namespaceLookup[namespaceId];
        if (!ns) {
            ns = this.createNamespace(namespaceId, hostElement);
        }
        if (ns.register(name, trigger)) {
            this.totalAnimations++;
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} context
     * @return {?}
     */
    destroy(namespaceId, context) {
        const /** @type {?} */ ns = this._fetchNamespace(namespaceId);
        this.afterFlush(() => {
            this.namespacesByHostElement.delete(ns.hostElement);
            delete this._namespaceLookup[namespaceId];
            const /** @type {?} */ index = this._namespaceList.indexOf(ns);
            if (index >= 0) {
                this._namespaceList.splice(index, 1);
            }
        });
        this.afterFlushAnimationsDone(() => ns.destroy(context));
    }
    /**
     * @param {?} id
     * @return {?}
     */
    _fetchNamespace(id) {
        const /** @type {?} */ ns = this._namespaceLookup[id];
        if (!ns) {
        }
        return ns;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    trigger(namespaceId, element, name, value) {
        if (isElementNode(element)) {
            this._fetchNamespace(namespaceId).trigger(element, name, value);
            return true;
        }
        return false;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    insertNode(namespaceId, element, parent, insertBefore) {
        if (!isElementNode(element))
            return;
        this._fetchNamespace(namespaceId).insertNode(element, parent);
        // only *directives and host elements are inserted before
        if (insertBefore) {
            this.newlyInserted.add(element);
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @param {?=} doNotRecurse
     * @return {?}
     */
    removeNode(namespaceId, element, context, doNotRecurse) {
        if (!isElementNode(element)) {
            this.onRemovalComplete(element, context);
            return;
        }
        this._fetchNamespace(namespaceId).removeNode(element, context, doNotRecurse);
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} name
     * @param {?} phase
     * @param {?} callback
     * @return {?}
     */
    listen(namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return () => { };
    }
    /**
     * @param {?} entry
     * @param {?} subTimelines
     * @return {?}
     */
    _buildInstruction(entry, subTimelines) {
        return entry.transition.build(entry.element, entry.fromState.value, entry.toState.value, entry.toState.data, subTimelines);
    }
    /**
     * @param {?} containerElement
     * @return {?}
     */
    destroyInnerAnimations(containerElement) {
        listToArray(containerElement.querySelectorAll(NG_TRIGGER_SELECTOR)).forEach(element => {
            const /** @type {?} */ players = this.playersByElement.get(element);
            if (players) {
                players.forEach(player => {
                    // special case for when an element is set for destruction, but hasn't started.
                    // in this situation we want to delay the destruction until the flush occurs
                    // so that any event listeners attached to the player are triggered.
                    if (player.queued) {
                        player.markedForDestroy = true;
                    }
                    else {
                        player.destroy();
                    }
                });
            }
            const /** @type {?} */ stateMap = this.statesByElement.get(element);
            if (stateMap) {
                Object.keys(stateMap).forEach(triggerName => stateMap[triggerName] = DELETED_STATE_VALUE);
            }
        });
    }
    /**
     * @return {?}
     */
    flush() {
        let /** @type {?} */ players = [];
        if (this.newHostElements.size) {
            this.newHostElements.forEach((ns, element) => { this._balanceNamespaceList(ns, element); });
            this.newHostElements.clear();
        }
        if (this._namespaceList.length && (this.totalQueuedPlayers || this.queuedRemovals.size)) {
            players = this._flushAnimations();
        }
        this.totalQueuedPlayers = 0;
        this.queuedRemovals.clear();
        this.newlyInserted.clear();
        this._flushFns.forEach(fn => fn());
        this._flushFns = [];
        if (this._whenQuietFns.length) {
            // we move these over to a variable so that
            // if any new callbacks are registered in another
            // flush they do not populate the existing set
            const /** @type {?} */ quietFns = this._whenQuietFns;
            this._whenQuietFns = [];
            if (players.length) {
                optimizeGroupPlayer(players).onDone(() => { quietFns.forEach(fn => fn()); });
            }
            else {
                quietFns.forEach(fn => fn());
            }
        }
    }
    /**
     * @return {?}
     */
    _populateEnterElements() {
        const /** @type {?} */ allEnterNodes = iteratorToArray(this.newlyInserted.values());
        allEnterNodes.forEach(element => element.classList.add(POTENTIAL_ENTER_CLASSNAME));
        const /** @type {?} */ enterNodes = filterNodeClasses(document.body, POTENTIAL_ENTER_SELECTOR);
        enterNodes.forEach(element => element.classList.add(ENTER_CLASSNAME));
        allEnterNodes.forEach(element => element.classList.remove(POTENTIAL_ENTER_CLASSNAME));
        return enterNodes;
    }
    /**
     * @return {?}
     */
    _flushAnimations() {
        const /** @type {?} */ subTimelines = new ElementInstructionMap();
        const /** @type {?} */ skippedPlayers = [];
        const /** @type {?} */ skippedPlayersMap = new Map();
        const /** @type {?} */ queuedInstructions = [];
        const /** @type {?} */ queriedElements = new Map();
        const /** @type {?} */ allPreStyleElements = new Map();
        const /** @type {?} */ allPostStyleElements = new Map();
        // this must occur before the instructions are built below such that
        // the :enter queries match the elements
        const /** @type {?} */ enterNodes = this._populateEnterElements();
        for (let /** @type {?} */ i = this._namespaceList.length - 1; i >= 0; i--) {
            const /** @type {?} */ ns = this._namespaceList[i];
            ns.drainQueuedTransitions().forEach(entry => {
                const /** @type {?} */ instruction = this._buildInstruction(entry, subTimelines);
                const /** @type {?} */ player = entry.player;
                const /** @type {?} */ element = entry.element;
                // if a unmatched transition is queued to go then it SHOULD NOT render
                // an animation and cancel the previously running animations.
                if (entry.isFallbackTransition && !instruction.isRemovalTransition) {
                    skippedPlayers.push(player);
                    return;
                }
                // this means that if a parent animation uses this animation as a sub trigger
                // then it will instruct the timeline builder to not add a player delay, but
                // instead stretch the first keyframe gap up until the animation starts. The
                // reason this is important is to prevent extra initialization styles from being
                // required by the user in the animation.
                instruction.timelines.forEach(tl => tl.stretchStartingKeyframe = true);
                subTimelines.append(element, instruction.timelines);
                const /** @type {?} */ tuple = { instruction, player, element };
                queuedInstructions.push(tuple);
                instruction.queriedElements.forEach(element => getOrSetAsInMap(queriedElements, element, []).push(player));
                instruction.preStyleProps.forEach((stringMap, element) => {
                    const /** @type {?} */ props = Object.keys(stringMap);
                    if (props.length) {
                        let /** @type {?} */ setVal = allPreStyleElements.get(element);
                        if (!setVal) {
                            allPreStyleElements.set(element, setVal = new Set());
                        }
                        props.forEach(prop => setVal.add(prop));
                    }
                });
                instruction.postStyleProps.forEach((stringMap, element) => {
                    const /** @type {?} */ props = Object.keys(stringMap);
                    let /** @type {?} */ setVal = allPostStyleElements.get(element);
                    if (!setVal) {
                        allPostStyleElements.set(element, setVal = new Set());
                    }
                    props.forEach(prop => setVal.add(prop));
                });
            });
        }
        const /** @type {?} */ allPreviousPlayersMap = new Map();
        let /** @type {?} */ sortedParentElements = [];
        queuedInstructions.forEach(entry => {
            const /** @type {?} */ element = entry.element;
            if (subTimelines.has(element)) {
                sortedParentElements.unshift(element);
                this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
            }
        });
        allPreviousPlayersMap.forEach(players => { players.forEach(player => player.destroy()); });
        const /** @type {?} */ leaveNodes = allPostStyleElements.size ?
            listToArray(document.body.querySelectorAll(LEAVE_SELECTOR)) :
            [];
        // PRE STAGE: fill the ! styles
        const /** @type {?} */ preStylesMap = allPreStyleElements.size ?
            cloakAndComputeStyles(this._driver, enterNodes, allPreStyleElements, PRE_STYLE) :
            new Map();
        // POST STAGE: fill the * styles
        const /** @type {?} */ postStylesMap = cloakAndComputeStyles(this._driver, leaveNodes, allPostStyleElements, AUTO_STYLE);
        const /** @type {?} */ rootPlayers = [];
        const /** @type {?} */ subPlayers = [];
        queuedInstructions.forEach(entry => {
            const { element, player, instruction } = entry;
            // this means that it was never consumed by a parent animation which
            // means that it is independent and therefore should be set for animation
            if (subTimelines.has(element)) {
                const /** @type {?} */ innerPlayer = this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
                player.setRealPlayer(innerPlayer);
                let /** @type {?} */ parentHasPriority = null;
                for (let /** @type {?} */ i = 0; i < sortedParentElements.length; i++) {
                    const /** @type {?} */ parent = sortedParentElements[i];
                    if (parent === element)
                        break;
                    if (parent.contains(element)) {
                        parentHasPriority = parent;
                        break;
                    }
                }
                if (parentHasPriority) {
                    const /** @type {?} */ parentPlayers = this.playersByElement.get(parentHasPriority);
                    if (parentPlayers && parentPlayers.length) {
                        player.parentPlayer = optimizeGroupPlayer(parentPlayers);
                    }
                    skippedPlayers.push(player);
                }
                else {
                    rootPlayers.push(player);
                }
            }
            else {
                eraseStyles(element, instruction.fromStyles);
                player.onDestroy(() => setStyles(element, instruction.toStyles));
                subPlayers.push(player);
            }
        });
        subPlayers.forEach(player => {
            const /** @type {?} */ playersForElement = skippedPlayersMap.get(player.element);
            if (playersForElement && playersForElement.length) {
                const /** @type {?} */ innerPlayer = optimizeGroupPlayer(playersForElement);
                player.setRealPlayer(innerPlayer);
            }
        });
        rootPlayers.forEach(player => {
            this.players.push(player);
            player.onDone(() => {
                player.destroy();
                const /** @type {?} */ index = this.players.indexOf(player);
                this.players.splice(index, 1);
            });
            player.play();
        });
        // the reason why we don't actually play the animation is
        // because all that a skipped player is designed to do is to
        // fire the start/done transition callback events
        skippedPlayers.forEach(player => {
            if (player.parentPlayer) {
                player.parentPlayer.onDestroy(() => player.destroy());
            }
            else {
                player.destroy();
            }
        });
        // run through all of the queued removals and see if they
        // were picked up by a query. If not then perform the removal
        // operation right away unless a parent animation is ongoing.
        this.queuedRemovals.forEach((fn, element) => {
            const /** @type {?} */ players = queriedElements.get(element);
            if (players) {
                optimizeGroupPlayer(players).onDone(fn);
            }
            else {
                let /** @type {?} */ elementPlayers = null;
                let /** @type {?} */ parent = element;
                while (parent = parent.parentNode) {
                    const /** @type {?} */ playersForThisElement = this.playersByElement.get(parent);
                    if (playersForThisElement && playersForThisElement.length) {
                        elementPlayers = playersForThisElement;
                        break;
                    }
                }
                if (elementPlayers) {
                    optimizeGroupPlayer(elementPlayers).onDone(fn);
                }
                else {
                    fn();
                }
            }
        });
        enterNodes.forEach(element => element.classList.remove(ENTER_CLASSNAME));
        return rootPlayers;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @return {?}
     */
    elementContainsData(namespaceId, element) {
        let /** @type {?} */ containsData = false;
        if (this.queuedRemovals.has(element))
            containsData = true;
        if (this.newlyInserted.has(element))
            containsData = true;
        if (this.playersByElement.has(element))
            containsData = true;
        if (this.playersByQueriedElement.has(element))
            containsData = true;
        if (this.statesByElement.has(element))
            containsData = true;
        return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    afterFlush(callback) { this._flushFns.push(callback); }
    /**
     * @param {?} callback
     * @return {?}
     */
    afterFlushAnimationsDone(callback) { this._whenQuietFns.push(callback); }
    /**
     * @param {?} element
     * @param {?} instruction
     * @param {?} isQueriedElement
     * @param {?=} namespaceId
     * @param {?=} triggerName
     * @return {?}
     */
    _getPreviousPlayers(element, instruction, isQueriedElement, namespaceId, triggerName) {
        let /** @type {?} */ players = [];
        if (isQueriedElement) {
            const /** @type {?} */ queriedElementPlayers = this.playersByQueriedElement.get(element);
            if (queriedElementPlayers) {
                players = queriedElementPlayers;
            }
        }
        else {
            const /** @type {?} */ elementPlayers = this.playersByElement.get(element);
            if (elementPlayers) {
                const /** @type {?} */ isRemovalAnimation = instruction.toState == VOID_VALUE;
                elementPlayers.forEach(player => {
                    if (player.queued)
                        return;
                    if (!isRemovalAnimation && player.triggerName != instruction.triggerName)
                        return;
                    players.push(player);
                });
            }
        }
        if (namespaceId || triggerName) {
            players = players.filter(player => {
                if (namespaceId && namespaceId != player.namespaceId)
                    return false;
                if (triggerName && triggerName != player.triggerName)
                    return false;
                return true;
            });
        }
        return players;
    }
    /**
     * @param {?} namespaceId
     * @param {?} instruction
     * @param {?} allPreviousPlayersMap
     * @return {?}
     */
    _beforeAnimationBuild(namespaceId, instruction, allPreviousPlayersMap) {
        // it's important to do this step before destroying the players
        // so that the onDone callback below won't fire before this
        eraseStyles(instruction.element, instruction.fromStyles);
        const /** @type {?} */ triggerName = instruction.triggerName;
        const /** @type {?} */ rootElement = instruction.element;
        // when a removal animation occurs, ALL previous players are collected
        // and destroyed (even if they are outside of the current namespace)
        const /** @type {?} */ targetNameSpaceId = instruction.isRemovalTransition ? undefined : namespaceId;
        const /** @type {?} */ targetTriggerName = instruction.isRemovalTransition ? undefined : triggerName;
        instruction.timelines.map(timelineInstruction => {
            const /** @type {?} */ element = timelineInstruction.element;
            const /** @type {?} */ isQueriedElement = element !== rootElement;
            const /** @type {?} */ players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
            const /** @type {?} */ previousPlayers = this._getPreviousPlayers(element, instruction, isQueriedElement, targetNameSpaceId, targetTriggerName);
            previousPlayers.forEach(player => {
                const /** @type {?} */ realPlayer = (player.getRealPlayer());
                if (realPlayer['beforeDestroy']) {
                    realPlayer['beforeDestroy']();
                }
                players.push(player);
            });
        });
    }
    /**
     * @param {?} namespaceId
     * @param {?} instruction
     * @param {?} allPreviousPlayersMap
     * @param {?} skippedPlayersMap
     * @param {?} preStylesMap
     * @param {?} postStylesMap
     * @return {?}
     */
    _buildAnimation(namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
        const /** @type {?} */ triggerName = instruction.triggerName;
        const /** @type {?} */ rootElement = instruction.element;
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        const /** @type {?} */ allQueriedPlayers = [];
        const /** @type {?} */ allConsumedElements = new Set();
        const /** @type {?} */ allNewPlayers = instruction.timelines.map(timelineInstruction => {
            const /** @type {?} */ element = timelineInstruction.element;
            const /** @type {?} */ isQueriedElement = element !== rootElement;
            let /** @type {?} */ previousPlayers = EMPTY_PLAYER_ARRAY;
            if (!allConsumedElements.has(element)) {
                allConsumedElements.add(element);
                const /** @type {?} */ _previousPlayers = allPreviousPlayersMap.get(element);
                if (_previousPlayers) {
                    previousPlayers = _previousPlayers.map(p => p.getRealPlayer());
                }
            }
            const /** @type {?} */ preStyles = preStylesMap.get(element);
            const /** @type {?} */ postStyles = postStylesMap.get(element);
            const /** @type {?} */ keyframes = normalizeKeyframes(this._driver, this._normalizer, element, timelineInstruction.keyframes, preStyles, postStyles);
            const /** @type {?} */ player = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
            // this means that this particular player belongs to a sub trigger. It is
            // important that we match this player up with the corresponding (@trigger.listener)
            if (timelineInstruction.subTimeline && skippedPlayersMap) {
                getOrSetAsInMap(skippedPlayersMap, element, []).push(player);
            }
            if (isQueriedElement) {
                const /** @type {?} */ wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
                wrappedPlayer.setRealPlayer(player);
                allQueriedPlayers.push(wrappedPlayer);
            }
            return player;
        });
        allQueriedPlayers.forEach(player => {
            getOrSetAsInMap(this.playersByQueriedElement, player.element, []).push(player);
            player.onDone(() => { deleteOrUnsetInMap(this.playersByQueriedElement, player.element, player); });
        });
        allConsumedElements.forEach(element => { element.classList.add(NG_ANIMATING_CLASSNAME); });
        const /** @type {?} */ player = optimizeGroupPlayer(allNewPlayers);
        player.onDone(() => {
            allConsumedElements.forEach(element => { element.classList.remove(NG_ANIMATING_CLASSNAME); });
            setStyles(rootElement, instruction.toStyles);
        });
        return player;
    }
    /**
     * @param {?} instruction
     * @param {?} keyframes
     * @param {?} previousPlayers
     * @return {?}
     */
    _buildPlayer(instruction, keyframes, previousPlayers) {
        if (keyframes.length > 0) {
            return this._driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
        }
        // special case for when an empty transition|definition is provided
        // ... there is no point in rendering an empty animation
        return new NoopAnimationPlayer();
    }
}
class TransitionAnimationPlayer {
    /**
     * @param {?} namespaceId
     * @param {?} triggerName
     * @param {?} element
     */
    constructor(namespaceId, triggerName, element) {
        this.namespaceId = namespaceId;
        this.triggerName = triggerName;
        this.element = element;
        this._player = new NoopAnimationPlayer();
        this._containsRealPlayer = false;
        this._queuedCallbacks = {};
        this._destroyed = false;
        this.markedForDestroy = false;
    }
    /**
     * @return {?}
     */
    get queued() { return this._containsRealPlayer == false; }
    /**
     * @return {?}
     */
    get destroyed() { return this._destroyed; }
    /**
     * @param {?} player
     * @return {?}
     */
    setRealPlayer(player) {
        if (this._containsRealPlayer)
            return;
        this._player = player;
        Object.keys(this._queuedCallbacks).forEach(phase => {
            this._queuedCallbacks[phase].forEach(callback => { listenOnPlayer(player, phase, null, callback); });
        });
        this._queuedCallbacks = {};
        this._containsRealPlayer = true;
    }
    /**
     * @return {?}
     */
    getRealPlayer() { return this._player; }
    /**
     * @param {?} name
     * @param {?} callback
     * @return {?}
     */
    _queueEvent(name, callback) {
        getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) {
        if (this.queued) {
            this._queueEvent('done', fn);
        }
        this._player.onDone(fn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) {
        if (this.queued) {
            this._queueEvent('start', fn);
        }
        this._player.onStart(fn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) {
        if (this.queued) {
            this._queueEvent('destroy', fn);
        }
        this._player.onDestroy(fn);
    }
    /**
     * @return {?}
     */
    init() { this._player.init(); }
    /**
     * @return {?}
     */
    hasStarted() { return this.queued ? false : this._player.hasStarted(); }
    /**
     * @return {?}
     */
    play() { !this.queued && this._player.play(); }
    /**
     * @return {?}
     */
    pause() { !this.queued && this._player.pause(); }
    /**
     * @return {?}
     */
    restart() { !this.queued && this._player.restart(); }
    /**
     * @return {?}
     */
    finish() { this._player.finish(); }
    /**
     * @return {?}
     */
    destroy() {
        this._destroyed = true;
        this._player.destroy();
    }
    /**
     * @return {?}
     */
    reset() { !this.queued && this._player.reset(); }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    }
    /**
     * @return {?}
     */
    getPosition() { return this.queued ? 0 : this._player.getPosition(); }
    /**
     * @return {?}
     */
    get totalTime() { return this._player.totalTime; }
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function deleteOrUnsetInMap(map, key, value) {
    let /** @type {?} */ currentValues;
    if (map instanceof Map) {
        currentValues = map.get(key);
        if (currentValues) {
            if (currentValues.length) {
                const /** @type {?} */ index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                map.delete(key);
            }
        }
    }
    else {
        currentValues = map[key];
        if (currentValues) {
            if (currentValues.length) {
                const /** @type {?} */ index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                delete map[key];
            }
        }
    }
    return currentValues;
}
/**
 * @param {?} value
 * @return {?}
 */
function normalizeTriggerValue(value) {
    switch (typeof value) {
        case 'boolean':
            return value ? '1' : '0';
        default:
            return value ? value.toString() : null;
    }
}
/**
 * @param {?} node
 * @return {?}
 */
function isElementNode(node) {
    return node && node['nodeType'] === 1;
}
/**
 * @param {?} eventName
 * @return {?}
 */
function isTriggerEventValid(eventName) {
    return eventName == 'start' || eventName == 'done';
}
/**
 * @param {?} element
 * @param {?=} value
 * @return {?}
 */
function cloakElement(element, value) {
    const /** @type {?} */ oldValue = element.style.display;
    element.style.display = value != null ? value : 'none';
    return oldValue;
}
/**
 * @param {?} rootElement
 * @param {?} selector
 * @return {?}
 */
function filterNodeClasses(rootElement, selector) {
    const /** @type {?} */ rootElements = [];
    let /** @type {?} */ cursor = rootElement;
    let /** @type {?} */ nextCursor = null;
    do {
        nextCursor = cursor.querySelector(selector);
        if (!nextCursor) {
            cursor = cursor.parentElement;
            if (!cursor)
                break;
            nextCursor = cursor = cursor.nextElementSibling;
        }
        else {
            while (nextCursor && nextCursor.matches(selector)) {
                rootElements.push(nextCursor);
                nextCursor = nextCursor.nextElementSibling;
                if (nextCursor) {
                    cursor = nextCursor;
                }
                else {
                    cursor = cursor.parentElement;
                    if (!cursor)
                        break;
                    nextCursor = cursor = cursor.nextElementSibling;
                }
            }
        }
    } while (nextCursor && nextCursor !== rootElement);
    return rootElements;
}
/**
 * @param {?} driver
 * @param {?} elements
 * @param {?} elementPropsMap
 * @param {?} defaultStyle
 * @return {?}
 */
function cloakAndComputeStyles(driver, elements, elementPropsMap, defaultStyle) {
    const /** @type {?} */ cloakVals = elements.map(element => cloakElement(element));
    const /** @type {?} */ valuesMap = new Map();
    elementPropsMap.forEach((props, element) => {
        const /** @type {?} */ styles = {};
        props.forEach(prop => { styles[prop] = driver.computeStyle(element, prop, defaultStyle); });
        valuesMap.set(element, styles);
    });
    elements.forEach((element, i) => cloakElement(element, cloakVals[i]));
    return valuesMap;
}
/**
 * @param {?} list
 * @return {?}
 */
function listToArray(list) {
    const /** @type {?} */ arr = [];
    arr.push(...((list)));
    return arr;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DomAnimationEngine {
    /**
     * @param {?} driver
     * @param {?} normalizer
     */
    constructor(driver, normalizer) {
        this._triggerCache = {};
        this.onRemovalComplete = (element, context) => { };
        this._transitionEngine = new TransitionAnimationEngine(driver, normalizer);
        this._timelineEngine = new TimelineAnimationEngine(driver, normalizer);
        this._transitionEngine.onRemovalComplete =
            (element, context) => { this.onRemovalComplete(element, context); };
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
            const /** @type {?} */ ast = (buildAnimationAst(/** @type {?} */ (metadata), errors));
            if (errors.length) {
                throw new Error(`The animation trigger "${name}" has failed to build due to the following errors:\n - ${errors.join("\n - ")}`);
            }
            trigger = buildTrigger(name, ast);
            this._triggerCache[cacheKey] = trigger;
        }
        this._transitionEngine.register(namespaceId, hostElement, name, trigger);
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
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    setProperty(namespaceId, element, property, value) {
        // @@property
        if (property.charAt(0) == '@') {
            const [id, action] = parseCustomCommand(property);
            const /** @type {?} */ args = (value);
            this._timelineEngine.command(id, element, action, args);
            return false;
        }
        return this._transitionEngine.trigger(namespaceId, element, property, value);
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
            const [id, action] = parseCustomCommand(eventName);
            return this._timelineEngine.listen(id, element, action, callback);
        }
        return this._transitionEngine.listen(namespaceId, element, eventName, eventPhase, callback);
    }
    /**
     * @return {?}
     */
    flush() { this._transitionEngine.flush(); }
    /**
     * @return {?}
     */
    get players() {
        return ((this._transitionEngine.players))
            .concat(/** @type {?} */ (this._timelineEngine.players));
    }
}
/**
 * @param {?} command
 * @return {?}
 */
function parseCustomCommand(command) {
    const /** @type {?} */ separatorPos = command.indexOf(':');
    const /** @type {?} */ id = command.substring(1, separatorPos);
    const /** @type {?} */ action = command.substr(separatorPos + 1);
    return [id, action];
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DEFAULT_STATE_VALUE$1 = 'void';
const DEFAULT_STATE_STYLES = '*';
class NoopAnimationEngine extends AnimationEngine {
    constructor() {
        super(...arguments);
        this._listeners = new Map();
        this._changes = [];
        this._flaggedRemovals = new Set();
        this._onDoneFns = [];
        this._triggerStyles = Object.create(null);
        this.onRemovalComplete = (element, context) => { };
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
        name = name || metadata.name;
        name = namespaceId + '#' + name;
        if (this._triggerStyles[name]) {
            return;
        }
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = (buildAnimationAst(metadata, errors));
        const /** @type {?} */ trigger = buildTrigger(name, ast);
        this._triggerStyles[name] = trigger.states;
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} parent
     * @param {?} insertBefore
     * @return {?}
     */
    onInsert(namespaceId, element, parent, insertBefore) { }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} context
     * @return {?}
     */
    onRemove(namespaceId, element, context) {
        this.onRemovalComplete(element, context);
        if (element['nodeType'] == 1) {
            this._flaggedRemovals.add(element);
        }
    }
    /**
     * @param {?} namespaceId
     * @param {?} element
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    setProperty(namespaceId, element, property, value) {
        if (property.charAt(0) == '@')
            return; // TODO
        const /** @type {?} */ namespacedName = namespaceId + '#' + property;
        const /** @type {?} */ storageProp = makeStorageProp(namespacedName);
        const /** @type {?} */ oldValue = element[storageProp] || DEFAULT_STATE_VALUE$1;
        this._changes.push(/** @type {?} */ ({ element, oldValue, newValue: value, triggerName: property, namespacedName }));
        const /** @type {?} */ triggerStateStyles = this._triggerStyles[namespacedName] || {};
        const /** @type {?} */ fromStateStyles = triggerStateStyles[oldValue] || triggerStateStyles[DEFAULT_STATE_STYLES];
        if (fromStateStyles) {
            eraseStyles(element, fromStateStyles);
        }
        element[storageProp] = value;
        this._onDoneFns.push(() => {
            const /** @type {?} */ toStateStyles = triggerStateStyles[value] || triggerStateStyles[DEFAULT_STATE_STYLES];
            if (toStateStyles) {
                setStyles(element, toStateStyles);
            }
        });
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
        if (eventName.charAt(0) == '@')
            return; // TODO
        let /** @type {?} */ listeners = this._listeners.get(element);
        if (!listeners) {
            this._listeners.set(element, listeners = []);
        }
        const /** @type {?} */ tuple = ({
            namespacedName: namespaceId + '#' + eventName,
            triggerName: eventName, eventPhase, callback
        });
        listeners.push(tuple);
        return () => tuple.doRemove = true;
    }
    /**
     * @return {?}
     */
    flush() {
        const /** @type {?} */ onStartCallbacks = [];
        const /** @type {?} */ onDoneCallbacks = [];
        /**
         * @param {?} listener
         * @param {?} data
         * @return {?}
         */
        function handleListener(listener, data) {
            const /** @type {?} */ phase = listener.eventPhase;
            const /** @type {?} */ event = makeAnimationEvent$1(data.element, data.triggerName, data.oldValue, data.newValue, phase, 0);
            if (phase == 'start') {
                onStartCallbacks.push(() => listener.callback(event));
            }
            else if (phase == 'done') {
                onDoneCallbacks.push(() => listener.callback(event));
            }
        }
        this._changes.forEach(change => {
            const /** @type {?} */ element = change.element;
            const /** @type {?} */ listeners = this._listeners.get(element);
            if (listeners) {
                listeners.forEach(listener => {
                    if (listener.namespacedName == change.namespacedName) {
                        handleListener(listener, change);
                    }
                });
            }
        });
        // upon removal ALL the animation triggers need to get fired
        this._flaggedRemovals.forEach(element => {
            const /** @type {?} */ listeners = this._listeners.get(element);
            if (listeners) {
                listeners.forEach(listener => {
                    const /** @type {?} */ triggerName = listener.triggerName;
                    const /** @type {?} */ namespacedName = listener.namespacedName;
                    const /** @type {?} */ storageProp = makeStorageProp(namespacedName);
                    handleListener(listener, /** @type {?} */ ({
                        element,
                        triggerName,
                        namespacedName: listener.namespacedName,
                        oldValue: element[storageProp] || DEFAULT_STATE_VALUE$1,
                        newValue: DEFAULT_STATE_VALUE$1
                    }));
                });
            }
        });
        // remove all the listeners after everything is complete
        Array.from(this._listeners.keys()).forEach(element => {
            const /** @type {?} */ listenersToKeep = this._listeners.get(element).filter(l => !l.doRemove);
            if (listenersToKeep.length) {
                this._listeners.set(element, listenersToKeep);
            }
            else {
                this._listeners.delete(element);
            }
        });
        onStartCallbacks.forEach(fn => fn());
        onDoneCallbacks.forEach(fn => fn());
        this._flaggedRemovals.clear();
        this._changes = [];
        this._onDoneFns.forEach(doneFn => doneFn());
        this._onDoneFns = [];
    }
    /**
     * @return {?}
     */
    get players() { return []; }
    /**
     * @param {?} namespaceId
     * @return {?}
     */
    destroy(namespaceId) { }
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?} phaseName
 * @param {?} totalTime
 * @return {?}
 */
function makeAnimationEvent$1(element, triggerName, fromState, toState, phaseName, totalTime) {
    return ({ element, triggerName, fromState, toState, phaseName, totalTime });
}
/**
 * @param {?} property
 * @return {?}
 */
function makeStorageProp(property) {
    return '_@_' + property;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class WebAnimationsPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @param {?=} previousPlayers
     */
    constructor(element, keyframes, options, previousPlayers = []) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this.previousPlayers = previousPlayers;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._initialized = false;
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this.time = 0;
        this.parentPlayer = null;
        this.currentSnapshot = {};
        this._duration = options['duration'];
        this._delay = options['delay'] || 0;
        this.time = this._duration + this._delay;
        this.previousStyles = {};
        previousPlayers.forEach(player => {
            let styles = player.currentSnapshot;
            Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
        });
    }
    /**
     * @return {?}
     */
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(fn => fn());
            this._onDoneFns = [];
        }
    }
    /**
     * @return {?}
     */
    init() {
        if (this._initialized)
            return;
        this._initialized = true;
        const /** @type {?} */ keyframes = this.keyframes.map(styles => copyStyles(styles, false));
        const /** @type {?} */ previousStyleProps = Object.keys(this.previousStyles);
        if (previousStyleProps.length) {
            let /** @type {?} */ startingKeyframe = keyframes[0];
            let /** @type {?} */ missingStyleProps = [];
            previousStyleProps.forEach(prop => {
                if (!startingKeyframe.hasOwnProperty(prop)) {
                    missingStyleProps.push(prop);
                }
                startingKeyframe[prop] = this.previousStyles[prop];
            });
            if (missingStyleProps.length) {
                const /** @type {?} */ self = this;
                // tslint:disable-next-line
                for (var /** @type {?} */ i = 1; i < keyframes.length; i++) {
                    let /** @type {?} */ kf = keyframes[i];
                    missingStyleProps.forEach(function (prop) {
                        kf[prop] = _computeStyle(self.element, prop);
                    });
                }
            }
        }
        this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
        this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
        // this is required so that the player doesn't start to animate right away
        if (this._delay) {
            this._resetDomPlayerState();
        }
        else {
            this._player.pause();
        }
        this._player.addEventListener('finish', () => this._onFinish());
    }
    /**
     * \@internal
     * @param {?} element
     * @param {?} keyframes
     * @param {?} options
     * @return {?}
     */
    _triggerWebAnimation(element, keyframes, options) {
        // jscompiler doesn't seem to know animate is a native property because it's not fully
        // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
        return (element['animate'](keyframes, options));
    }
    /**
     * @return {?}
     */
    get domPlayer() { return this._player; }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._onDoneFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._onDestroyFns.push(fn); }
    /**
     * @return {?}
     */
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._onStartFns.forEach(fn => fn());
            this._onStartFns = [];
            this._started = true;
        }
        this._player.play();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this._player.pause();
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        this._onFinish();
        this._player.finish();
    }
    /**
     * @return {?}
     */
    reset() {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    /**
     * @return {?}
     */
    _resetDomPlayerState() {
        if (this._player) {
            this._player.cancel();
        }
    }
    /**
     * @return {?}
     */
    restart() {
        this.reset();
        this.play();
    }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._destroyed) {
            this._resetDomPlayerState();
            this._onFinish();
            this._destroyed = true;
            this._onDestroyFns.forEach(fn => fn());
            this._onDestroyFns = [];
        }
    }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { this._player.currentTime = p * this.time; }
    /**
     * @return {?}
     */
    getPosition() { return this._player.currentTime / this.time; }
    /**
     * @return {?}
     */
    get totalTime() { return this._delay + this._duration; }
    /**
     * @return {?}
     */
    beforeDestroy() {
        const /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            Object.keys(this._finalKeyframe).forEach(prop => {
                if (prop != 'offset') {
                    styles[prop] =
                        this._finished ? this._finalKeyframe[prop] : _computeStyle(this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    }
}
/**
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
function _computeStyle(element, prop) {
    return ((window.getComputedStyle(element)))[prop];
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class WebAnimationsDriver {
    /**
     * @param {?} element
     * @param {?} prop
     * @param {?=} defaultValue
     * @return {?}
     */
    computeStyle(element, prop, defaultValue) {
        return (((window.getComputedStyle(element)))[prop]);
    }
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
        const /** @type {?} */ fill = delay == 0 ? 'both' : 'forwards';
        const /** @type {?} */ playerOptions = { duration, delay, fill };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        const /** @type {?} */ previousWebAnimationPlayers = (previousPlayers.filter(player => { return player instanceof WebAnimationsPlayer; }));
        return new WebAnimationsPlayer(element, keyframes, playerOptions, previousWebAnimationPlayers);
    }
}
/**
 * @return {?}
 */
function supportsWebAnimations() {
    return typeof Element !== 'undefined' && typeof ((Element)).prototype['animate'] === 'function';
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all animation APIs of the animation browser package.
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the animation package.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AnimationDriver, AnimationEngine as ɵAnimationEngine, Animation as ɵAnimation, AnimationStyleNormalizer as ɵAnimationStyleNormalizer, NoopAnimationStyleNormalizer as ɵNoopAnimationStyleNormalizer, WebAnimationsStyleNormalizer as ɵWebAnimationsStyleNormalizer, NoopAnimationDriver as ɵNoopAnimationDriver, DomAnimationEngine as ɵDomAnimationEngine, NoopAnimationEngine as ɵNoopAnimationEngine, WebAnimationsDriver as ɵWebAnimationsDriver, supportsWebAnimations as ɵsupportsWebAnimations, WebAnimationsPlayer as ɵWebAnimationsPlayer };
//# sourceMappingURL=browser.js.map
