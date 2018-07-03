/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { computeStyle } from '../../util';
import { ElementAnimationStyleHandler } from './element_animation_style_handler';
const /** @type {?} */ DEFAULT_FILL_MODE = 'forwards';
const /** @type {?} */ DEFAULT_EASING = 'linear';
const /** @type {?} */ ANIMATION_END_EVENT = 'animationend';
/** @enum {number} */
const AnimatorControlState = { INITIALIZED: 1, STARTED: 2, FINISHED: 3, DESTROYED: 4, };
export { AnimatorControlState };
export class CssKeyframesPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} animationName
     * @param {?} _duration
     * @param {?} _delay
     * @param {?} easing
     * @param {?} _finalStyles
     */
    constructor(element, keyframes, animationName, _duration, _delay, easing, _finalStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.animationName = animationName;
        this._duration = _duration;
        this._delay = _delay;
        this._finalStyles = _finalStyles;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._started = false;
        this.currentSnapshot = {};
        this._state = 0;
        this.easing = easing || DEFAULT_EASING;
        this.totalTime = _duration + _delay;
        this._buildStyler();
    }
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
    destroy() {
        this.init();
        if (this._state >= 4 /* DESTROYED */)
            return;
        this._state = 4 /* DESTROYED */;
        this._styler.destroy();
        this._flushStartFns();
        this._flushDoneFns();
        this._onDestroyFns.forEach(fn => fn());
        this._onDestroyFns = [];
    }
    /**
     * @return {?}
     */
    _flushDoneFns() {
        this._onDoneFns.forEach(fn => fn());
        this._onDoneFns = [];
    }
    /**
     * @return {?}
     */
    _flushStartFns() {
        this._onStartFns.forEach(fn => fn());
        this._onStartFns = [];
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        if (this._state >= 3 /* FINISHED */)
            return;
        this._state = 3 /* FINISHED */;
        this._styler.finish();
        this._flushStartFns();
        this._flushDoneFns();
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setPosition(value) { this._styler.setPosition(value); }
    /**
     * @return {?}
     */
    getPosition() { return this._styler.getPosition(); }
    /**
     * @return {?}
     */
    hasStarted() { return this._state >= 2 /* STARTED */; }
    /**
     * @return {?}
     */
    init() {
        if (this._state >= 1 /* INITIALIZED */)
            return;
        this._state = 1 /* INITIALIZED */;
        const /** @type {?} */ elm = this.element;
        this._styler.apply();
        if (this._delay) {
            this._styler.pause();
        }
    }
    /**
     * @return {?}
     */
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._flushStartFns();
            this._state = 2 /* STARTED */;
        }
        this._styler.resume();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this._styler.pause();
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
    reset() {
        this._styler.destroy();
        this._buildStyler();
        this._styler.apply();
    }
    /**
     * @return {?}
     */
    _buildStyler() {
        this._styler = new ElementAnimationStyleHandler(this.element, this.animationName, this._duration, this._delay, this.easing, DEFAULT_FILL_MODE, () => this.finish());
    }
    /**
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        const /** @type {?} */ methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(fn => fn());
        methods.length = 0;
    }
    /**
     * @return {?}
     */
    beforeDestroy() {
        this.init();
        const /** @type {?} */ styles = {};
        if (this.hasStarted()) {
            const /** @type {?} */ finished = this._state >= 3 /* FINISHED */;
            Object.keys(this._finalStyles).forEach(prop => {
                if (prop != 'offset') {
                    styles[prop] = finished ? this._finalStyles[prop] : computeStyle(this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    }
}
function CssKeyframesPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    CssKeyframesPlayer.prototype._onDoneFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._onStartFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._onDestroyFns;
    /** @type {?} */
    CssKeyframesPlayer.prototype._started;
    /** @type {?} */
    CssKeyframesPlayer.prototype._styler;
    /** @type {?} */
    CssKeyframesPlayer.prototype.parentPlayer;
    /** @type {?} */
    CssKeyframesPlayer.prototype.totalTime;
    /** @type {?} */
    CssKeyframesPlayer.prototype.easing;
    /** @type {?} */
    CssKeyframesPlayer.prototype.currentSnapshot;
    /** @type {?} */
    CssKeyframesPlayer.prototype._state;
    /** @type {?} */
    CssKeyframesPlayer.prototype.element;
    /** @type {?} */
    CssKeyframesPlayer.prototype.keyframes;
    /** @type {?} */
    CssKeyframesPlayer.prototype.animationName;
    /** @type {?} */
    CssKeyframesPlayer.prototype._duration;
    /** @type {?} */
    CssKeyframesPlayer.prototype._delay;
    /** @type {?} */
    CssKeyframesPlayer.prototype._finalStyles;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2tleWZyYW1lc19wbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBRS9FLHVCQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztBQUNyQyx1QkFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBQ2hDLHVCQUFNLG1CQUFtQixHQUFHLGNBQWMsQ0FBQzs7OztBQUkzQyxNQUFNOzs7Ozs7Ozs7O0lBaUJKLFlBQ29CLFNBQThCLFNBQTZDLEVBQzNFLGVBQXdDLFNBQWlCLEVBQ3hELFFBQWdCLE1BQWMsRUFDOUI7UUFIRCxZQUFPLEdBQVAsT0FBTztRQUF1QixjQUFTLEdBQVQsU0FBUyxDQUFvQztRQUMzRSxrQkFBYSxHQUFiLGFBQWE7UUFBMkIsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUN4RCxXQUFNLEdBQU4sTUFBTTtRQUNOLGlCQUFZLEdBQVosWUFBWTswQkFwQkEsRUFBRTsyQkFDRCxFQUFFOzZCQUNBLEVBQUU7d0JBRW5CLEtBQUs7K0JBUTBCLEVBQUU7c0JBRWIsQ0FBQztRQU90QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxjQUFjLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNyQjs7Ozs7SUFFRCxPQUFPLENBQUMsRUFBYyxJQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Ozs7O0lB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LENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDdEY7YUFDRixDQUFDLENBQUM7U0FDSjtRQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0tBQy9CO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29tcHV0ZVN0eWxlfSBmcm9tICcuLi8uLi91dGlsJztcblxuaW1wb3J0IHtFbGVtZW50QW5pbWF0aW9uU3R5bGVIYW5kbGVyfSBmcm9tICcuL2VsZW1lbnRfYW5pbWF0aW9uX3N0eWxlX2hhbmRsZXInO1xuXG5jb25zdCBERUZBVUxUX0ZJTExfTU9ERSA9ICdmb3J3YXJkcyc7XG5jb25zdCBERUZBVUxUX0VBU0lORyA9ICdsaW5lYXInO1xuY29uc3QgQU5JTUFUSU9OX0VORF9FVkVOVCA9ICdhbmltYXRpb25lbmQnO1xuXG5leHBvcnQgY29uc3QgZW51bSBBbmltYXRvckNvbnRyb2xTdGF0ZSB7SU5JVElBTElaRUQgPSAxLCBTVEFSVEVEID0gMiwgRklOSVNIRUQgPSAzLCBERVNUUk9ZRUQgPSA0fVxuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVzUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfc3R5bGVyICE6IEVsZW1lbnRBbmltYXRpb25TdHlsZUhhbmRsZXI7XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXIgITogQW5pbWF0aW9uUGxheWVyO1xuICBwdWJsaWMgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXI7XG4gIHB1YmxpYyByZWFkb25seSBlYXNpbmc6IHN0cmluZztcbiAgcHVibGljIGN1cnJlbnRTbmFwc2hvdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICBwcml2YXRlIF9zdGF0ZTogQW5pbWF0b3JDb250cm9sU3RhdGUgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IGFueSwgcHVibGljIHJlYWRvbmx5IGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn1bXSxcbiAgICAgIHB1YmxpYyByZWFkb25seSBhbmltYXRpb25OYW1lOiBzdHJpbmcsIHByaXZhdGUgcmVhZG9ubHkgX2R1cmF0aW9uOiBudW1iZXIsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9kZWxheTogbnVtYmVyLCBlYXNpbmc6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2ZpbmFsU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuZWFzaW5nID0gZWFzaW5nIHx8IERFRkFVTFRfRUFTSU5HO1xuICAgIHRoaXMudG90YWxUaW1lID0gX2R1cmF0aW9uICsgX2RlbGF5O1xuICAgIHRoaXMuX2J1aWxkU3R5bGVyKCk7XG4gIH1cblxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7IH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pOyB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTsgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgaWYgKHRoaXMuX3N0YXRlID49IEFuaW1hdG9yQ29udHJvbFN0YXRlLkRFU1RST1lFRCkgcmV0dXJuO1xuICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuREVTVFJPWUVEO1xuICAgIHRoaXMuX3N0eWxlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fZmx1c2hTdGFydEZucygpO1xuICAgIHRoaXMuX2ZsdXNoRG9uZUZucygpO1xuICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hEb25lRm5zKCkge1xuICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hTdGFydEZucygpIHtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICB9XG5cbiAgZmluaXNoKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA+PSBBbmltYXRvckNvbnRyb2xTdGF0ZS5GSU5JU0hFRCkgcmV0dXJuO1xuICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuRklOSVNIRUQ7XG4gICAgdGhpcy5fc3R5bGVyLmZpbmlzaCgpO1xuICAgIHRoaXMuX2ZsdXNoU3RhcnRGbnMoKTtcbiAgICB0aGlzLl9mbHVzaERvbmVGbnMoKTtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fc3R5bGVyLnNldFBvc2l0aW9uKHZhbHVlKTsgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zdHlsZXIuZ2V0UG9zaXRpb24oKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGF0ZSA+PSBBbmltYXRvckNvbnRyb2xTdGF0ZS5TVEFSVEVEOyB9XG4gIGluaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXRlID49IEFuaW1hdG9yQ29udHJvbFN0YXRlLklOSVRJQUxJWkVEKSByZXR1cm47XG4gICAgdGhpcy5fc3RhdGUgPSBBbmltYXRvckNvbnRyb2xTdGF0ZS5JTklUSUFMSVpFRDtcbiAgICBjb25zdCBlbG0gPSB0aGlzLmVsZW1lbnQ7XG4gICAgdGhpcy5fc3R5bGVyLmFwcGx5KCk7XG4gICAgaWYgKHRoaXMuX2RlbGF5KSB7XG4gICAgICB0aGlzLl9zdHlsZXIucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX2ZsdXNoU3RhcnRGbnMoKTtcbiAgICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuU1RBUlRFRDtcbiAgICB9XG4gICAgdGhpcy5fc3R5bGVyLnJlc3VtZSgpO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgdGhpcy5fc3R5bGVyLnBhdXNlKCk7XG4gIH1cbiAgcmVzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5wbGF5KCk7XG4gIH1cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9idWlsZFN0eWxlcigpO1xuICAgIHRoaXMuX3N0eWxlci5hcHBseSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRTdHlsZXIoKSB7XG4gICAgdGhpcy5fc3R5bGVyID0gbmV3IEVsZW1lbnRBbmltYXRpb25TdHlsZUhhbmRsZXIoXG4gICAgICAgIHRoaXMuZWxlbWVudCwgdGhpcy5hbmltYXRpb25OYW1lLCB0aGlzLl9kdXJhdGlvbiwgdGhpcy5fZGVsYXksIHRoaXMuZWFzaW5nLFxuICAgICAgICBERUZBVUxUX0ZJTExfTU9ERSwgKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IHRoaXMuX3N0YXRlID49IEFuaW1hdG9yQ29udHJvbFN0YXRlLkZJTklTSEVEO1xuICAgICAgT2JqZWN0LmtleXModGhpcy5fZmluYWxTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wICE9ICdvZmZzZXQnKSB7XG4gICAgICAgICAgc3R5bGVzW3Byb3BdID0gZmluaXNoZWQgPyB0aGlzLl9maW5hbFN0eWxlc1twcm9wXSA6IGNvbXB1dGVTdHlsZSh0aGlzLmVsZW1lbnQsIHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBzdHlsZXM7XG4gIH1cbn1cbiJdfQ==