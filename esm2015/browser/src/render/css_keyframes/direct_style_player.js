/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NoopAnimationPlayer } from '@angular/animations';
export class DirectStylePlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} _styles
     */
    constructor(element, _styles) {
        super();
        this.element = element;
        this._styles = _styles;
        this._startingStyles = {};
        this.__initialized = false;
    }
    /**
     * @return {?}
     */
    init() {
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach(prop => {
            /** @type {?} */ ((this._startingStyles))[prop] = this.element.style[prop];
        });
        super.init();
    }
    /**
     * @return {?}
     */
    play() {
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles).forEach(prop => { this.element.style[prop] = this._styles[prop]; });
        super.play();
    }
    /**
     * @return {?}
     */
    destroy() {
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach(prop => {
            const /** @type {?} */ value = /** @type {?} */ ((this._startingStyles))[prop];
            if (value) {
                this.element.style[prop] = value;
            }
            else {
                this.element.style.removeProperty(prop);
            }
        });
        this._startingStyles = null;
        super.destroy();
    }
}
function DirectStylePlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    DirectStylePlayer.prototype._startingStyles;
    /** @type {?} */
    DirectStylePlayer.prototype.__initialized;
    /** @type {?} */
    DirectStylePlayer.prototype.element;
    /** @type {?} */
    DirectStylePlayer.prototype._styles;
}
//# sourceMappingURL=direct_style_player.js.map