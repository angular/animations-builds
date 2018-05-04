/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { NoopAnimationPlayer } from '@angular/animations';
import { hypenatePropsObject } from '../shared';
var DirectStylePlayer = /** @class */ (function (_super) {
    tslib_1.__extends(DirectStylePlayer, _super);
    function DirectStylePlayer(element, styles) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._startingStyles = {};
        _this.__initialized = false;
        _this._styles = hypenatePropsObject(styles);
        return _this;
    }
    /**
     * @return {?}
     */
    DirectStylePlayer.prototype.init = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach(function (prop) {
            /** @type {?} */ ((_this._startingStyles))[prop] = _this.element.style[prop];
        });
        _super.prototype.init.call(this);
    };
    /**
     * @return {?}
     */
    DirectStylePlayer.prototype.play = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles)
            .forEach(function (prop) { return _this.element.style.setProperty(prop, _this._styles[prop]); });
        _super.prototype.play.call(this);
    };
    /**
     * @return {?}
     */
    DirectStylePlayer.prototype.destroy = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach(function (prop) {
            var /** @type {?} */ value = /** @type {?} */ ((_this._startingStyles))[prop];
            if (value) {
                _this.element.style.setProperty(prop, value);
            }
            else {
                _this.element.style.removeProperty(prop);
            }
        });
        this._startingStyles = null;
        _super.prototype.destroy.call(this);
    };
    return DirectStylePlayer;
}(NoopAnimationPlayer));
export { DirectStylePlayer };
function DirectStylePlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    DirectStylePlayer.prototype._startingStyles;
    /** @type {?} */
    DirectStylePlayer.prototype.__initialized;
    /** @type {?} */
    DirectStylePlayer.prototype._styles;
    /** @type {?} */
    DirectStylePlayer.prototype.element;
}
//# sourceMappingURL=direct_style_player.js.map