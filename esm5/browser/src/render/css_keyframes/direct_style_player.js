import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
    DirectStylePlayer.prototype.init = function () {
        var _this = this;
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach(function (prop) {
            _this._startingStyles[prop] = _this.element.style[prop];
        });
        _super.prototype.init.call(this);
    };
    DirectStylePlayer.prototype.play = function () {
        var _this = this;
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles)
            .forEach(function (prop) { return _this.element.style.setProperty(prop, _this._styles[prop]); });
        _super.prototype.play.call(this);
    };
    DirectStylePlayer.prototype.destroy = function () {
        var _this = this;
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach(function (prop) {
            var value = _this._startingStyles[prop];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0X3N0eWxlX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2Nzc19rZXlmcmFtZXMvZGlyZWN0X3N0eWxlX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRTlDO0lBQXVDLDZDQUFtQjtJQUt4RCwyQkFBbUIsT0FBWSxFQUFFLE1BQTRCO1FBQTdELFlBQ0UsaUJBQU8sU0FFUjtRQUhrQixhQUFPLEdBQVAsT0FBTyxDQUFLO1FBSnZCLHFCQUFlLEdBQThCLEVBQUUsQ0FBQztRQUNoRCxtQkFBYSxHQUFHLEtBQUssQ0FBQztRQUs1QixLQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztJQUM3QyxDQUFDO0lBRUQsZ0NBQUksR0FBSjtRQUFBLGlCQU9DO1FBTkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDeEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUNwQyxLQUFJLENBQUMsZUFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztRQUNILGlCQUFNLElBQUksV0FBRSxDQUFDO0lBQ2YsQ0FBQztJQUVELGdDQUFJLEdBQUo7UUFBQSxpQkFNQztRQUxDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDcEIsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQXhELENBQXdELENBQUMsQ0FBQztRQUMvRSxpQkFBTSxJQUFJLFdBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxtQ0FBTyxHQUFQO1FBQUEsaUJBWUM7UUFYQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUM1QyxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsZUFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNsQixDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBeENELENBQXVDLG1CQUFtQixHQXdDekQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge05vb3BBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtoeXBlbmF0ZVByb3BzT2JqZWN0fSBmcm9tICcuLi9zaGFyZWQnO1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0U3R5bGVQbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfc3RhcnRpbmdTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSB7fTtcbiAgcHJpdmF0ZSBfX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc3R5bGVzID0gaHlwZW5hdGVQcm9wc09iamVjdChzdHlsZXMpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5fX2luaXRpYWxpemVkIHx8ICF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIHRoaXMuX19pbml0aWFsaXplZCA9IHRydWU7XG4gICAgT2JqZWN0LmtleXModGhpcy5fc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fc3RhcnRpbmdTdHlsZXMgIVtwcm9wXSA9IHRoaXMuZWxlbWVudC5zdHlsZVtwcm9wXTtcbiAgICB9KTtcbiAgICBzdXBlci5pbml0KCk7XG4gIH1cblxuICBwbGF5KCkge1xuICAgIGlmICghdGhpcy5fc3RhcnRpbmdTdHlsZXMpIHJldHVybjtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHlsZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3AgPT4gdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHRoaXMuX3N0eWxlc1twcm9wXSkpO1xuICAgIHN1cGVyLnBsYXkoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0YXJ0aW5nU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zdGFydGluZ1N0eWxlcyAhW3Byb3BdO1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkocHJvcCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fc3RhcnRpbmdTdHlsZXMgPSBudWxsO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19