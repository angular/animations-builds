/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var /** @type {?} */ ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
var /** @type {?} */ ANIMATION_PROP = 'animation';
var /** @type {?} */ ANIMATIONEND_EVENT = 'animationend';
var /** @type {?} */ ONE_SECOND = 1000;
var ElementAnimationStyleHandler = /** @class */ (function () {
    function ElementAnimationStyleHandler(_element, _name, _duration, _delay, _easing, _fillMode, _onDoneFn) {
        var _this = this;
        this._element = _element;
        this._name = _name;
        this._duration = _duration;
        this._delay = _delay;
        this._easing = _easing;
        this._fillMode = _fillMode;
        this._onDoneFn = _onDoneFn;
        this._finished = false;
        this._destroyed = false;
        this._startTime = 0;
        this._position = 0;
        this._eventFn = function (e) { return _this._handleCallback(e); };
    }
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.apply = /**
     * @return {?}
     */
    function () {
        applyKeyframeAnimation(this._element, this._duration + "ms " + this._easing + " " + this._delay + "ms 1 normal " + this._fillMode + " " + this._name);
        addRemoveAnimationEvent(this._element, this._eventFn, false);
        this._startTime = Date.now();
    };
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.pause = /**
     * @return {?}
     */
    function () { playPauseAnimation(this._element, this._name, 'paused'); };
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.resume = /**
     * @return {?}
     */
    function () { playPauseAnimation(this._element, this._name, 'running'); };
    /**
     * @param {?} position
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.setPosition = /**
     * @param {?} position
     * @return {?}
     */
    function (position) {
        var /** @type {?} */ index = findIndexForAnimation(this._element, this._name);
        this._position = position * this._duration;
        setAnimationStyle(this._element, 'Delay', "-" + this._position + "ms", index);
    };
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.getPosition = /**
     * @return {?}
     */
    function () { return this._position; };
    /**
     * @param {?} event
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype._handleCallback = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        var /** @type {?} */ timestamp = event._ngTestManualTimestamp || Date.now();
        var /** @type {?} */ elapsedTime = parseFloat(event.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES)) * ONE_SECOND;
        if (event.animationName == this._name &&
            Math.max(timestamp - this._startTime, 0) >= this._delay && elapsedTime >= this._duration) {
            this.finish();
        }
    };
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.finish = /**
     * @return {?}
     */
    function () {
        if (this._finished)
            return;
        this._finished = true;
        this._onDoneFn();
        addRemoveAnimationEvent(this._element, this._eventFn, true);
    };
    /**
     * @return {?}
     */
    ElementAnimationStyleHandler.prototype.destroy = /**
     * @return {?}
     */
    function () {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.finish();
        removeKeyframeAnimation(this._element, this._name);
    };
    return ElementAnimationStyleHandler;
}());
export { ElementAnimationStyleHandler };
function ElementAnimationStyleHandler_tsickle_Closure_declarations() {
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._eventFn;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._finished;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._destroyed;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._startTime;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._position;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._element;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._name;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._duration;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._delay;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._easing;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._fillMode;
    /** @type {?} */
    ElementAnimationStyleHandler.prototype._onDoneFn;
}
/**
 * @param {?} element
 * @param {?} name
 * @param {?} status
 * @return {?}
 */
function playPauseAnimation(element, name, status) {
    var /** @type {?} */ index = findIndexForAnimation(element, name);
    setAnimationStyle(element, 'PlayState', status, index);
}
/**
 * @param {?} element
 * @param {?} value
 * @return {?}
 */
function applyKeyframeAnimation(element, value) {
    var /** @type {?} */ anim = getAnimationStyle(element, '').trim();
    var /** @type {?} */ index = 0;
    if (anim.length) {
        index = countChars(anim, ',') + 1;
        value = anim + ", " + value;
    }
    setAnimationStyle(element, '', value);
    return index;
}
/**
 * @param {?} element
 * @param {?} name
 * @return {?}
 */
function removeKeyframeAnimation(element, name) {
    var /** @type {?} */ anim = getAnimationStyle(element, '');
    var /** @type {?} */ tokens = anim.split(',');
    var /** @type {?} */ index = findMatchingTokenIndex(tokens, name);
    if (index >= 0) {
        tokens.splice(index, 1);
        var /** @type {?} */ newValue = tokens.join(',');
        setAnimationStyle(element, '', newValue);
    }
}
/**
 * @param {?} element
 * @param {?} value
 * @return {?}
 */
function findIndexForAnimation(element, value) {
    var /** @type {?} */ anim = getAnimationStyle(element, '');
    if (anim.indexOf(',') > 0) {
        var /** @type {?} */ tokens = anim.split(',');
        return findMatchingTokenIndex(tokens, value);
    }
    return findMatchingTokenIndex([anim], value);
}
/**
 * @param {?} tokens
 * @param {?} searchToken
 * @return {?}
 */
function findMatchingTokenIndex(tokens, searchToken) {
    for (var /** @type {?} */ i = 0; i < tokens.length; i++) {
        if (tokens[i].indexOf(searchToken) >= 0) {
            return i;
        }
    }
    return -1;
}
/**
 * @param {?} element
 * @param {?} fn
 * @param {?} doRemove
 * @return {?}
 */
function addRemoveAnimationEvent(element, fn, doRemove) {
    doRemove ? element.removeEventListener(ANIMATIONEND_EVENT, fn) :
        element.addEventListener(ANIMATIONEND_EVENT, fn);
}
/**
 * @param {?} element
 * @param {?} name
 * @param {?} value
 * @param {?=} index
 * @return {?}
 */
function setAnimationStyle(element, name, value, index) {
    var /** @type {?} */ prop = ANIMATION_PROP + name;
    if (index != null) {
        var /** @type {?} */ oldValue = element.style[prop];
        if (oldValue.length) {
            var /** @type {?} */ tokens = oldValue.split(',');
            tokens[index] = value;
            value = tokens.join(',');
        }
    }
    element.style[prop] = value;
}
/**
 * @param {?} element
 * @param {?} name
 * @return {?}
 */
function getAnimationStyle(element, name) {
    return element.style[ANIMATION_PROP + name];
}
/**
 * @param {?} value
 * @param {?} char
 * @return {?}
 */
function countChars(value, char) {
    var /** @type {?} */ count = 0;
    for (var /** @type {?} */ i = 0; i < value.length; i++) {
        var /** @type {?} */ c = value.charAt(i);
        if (c === char)
            count++;
    }
    return count;
}
//# sourceMappingURL=element_animation_style_handler.js.map