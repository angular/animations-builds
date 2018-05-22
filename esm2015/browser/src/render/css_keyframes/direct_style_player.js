/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { hypenatePropsObject } from '../shared';
export class DirectStylePlayer extends NoopAnimationPlayer {
    /**
     * @param {?} element
     * @param {?} styles
     */
    constructor(element, styles) {
        super();
        this.element = element;
        this._startingStyles = {};
        this.__initialized = false;
        this._styles = hypenatePropsObject(styles);
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
        Object.keys(this._styles)
            .forEach(prop => this.element.style.setProperty(prop, this._styles[prop]));
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
                this.element.style.setProperty(prop, value);
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
    DirectStylePlayer.prototype._styles;
    /** @type {?} */
    DirectStylePlayer.prototype.element;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0X3N0eWxlX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2Nzc19rZXlmcmFtZXMvZGlyZWN0X3N0eWxlX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRTlDLE1BQU0sd0JBQXlCLFNBQVEsbUJBQW1COzs7OztJQUt4RCxZQUFtQixPQUFZLEVBQUUsTUFBNEI7UUFDM0QsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFLOytCQUpzQixFQUFFOzZCQUMvQixLQUFLO1FBSzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDNUM7Ozs7SUFFRCxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPO1FBQ3hELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTsrQkFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1NBQ3hELENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNkOzs7O0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU87UUFDbEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0UsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7Ozs7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0MsdUJBQU0sS0FBSyxzQkFBRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzNDLElBQUksS0FBSyxFQUFFO2dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2pCO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge05vb3BBbmltYXRpb25QbGF5ZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtoeXBlbmF0ZVByb3BzT2JqZWN0fSBmcm9tICcuLi9zaGFyZWQnO1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0U3R5bGVQbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfc3RhcnRpbmdTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGwgPSB7fTtcbiAgcHJpdmF0ZSBfX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0eWxlczoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc3R5bGVzID0gaHlwZW5hdGVQcm9wc09iamVjdChzdHlsZXMpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5fX2luaXRpYWxpemVkIHx8ICF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIHRoaXMuX19pbml0aWFsaXplZCA9IHRydWU7XG4gICAgT2JqZWN0LmtleXModGhpcy5fc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fc3RhcnRpbmdTdHlsZXMgIVtwcm9wXSA9IHRoaXMuZWxlbWVudC5zdHlsZVtwcm9wXTtcbiAgICB9KTtcbiAgICBzdXBlci5pbml0KCk7XG4gIH1cblxuICBwbGF5KCkge1xuICAgIGlmICghdGhpcy5fc3RhcnRpbmdTdHlsZXMpIHJldHVybjtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHlsZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3AgPT4gdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHRoaXMuX3N0eWxlc1twcm9wXSkpO1xuICAgIHN1cGVyLnBsYXkoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0YXJ0aW5nU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zdGFydGluZ1N0eWxlcyAhW3Byb3BdO1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkocHJvcCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fc3RhcnRpbmdTdHlsZXMgPSBudWxsO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19