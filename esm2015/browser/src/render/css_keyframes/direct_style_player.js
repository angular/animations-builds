/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { hypenatePropsObject } from '../shared';
export class DirectStylePlayer extends NoopAnimationPlayer {
    constructor(element, styles) {
        super();
        this.element = element;
        this._startingStyles = {};
        this.__initialized = false;
        this._styles = hypenatePropsObject(styles);
    }
    init() {
        if (this.__initialized || !this._startingStyles)
            return;
        this.__initialized = true;
        Object.keys(this._styles).forEach(prop => {
            this._startingStyles[prop] = this.element.style[prop];
        });
        super.init();
    }
    play() {
        if (!this._startingStyles)
            return;
        this.init();
        Object.keys(this._styles)
            .forEach(prop => this.element.style.setProperty(prop, this._styles[prop]));
        super.play();
    }
    destroy() {
        if (!this._startingStyles)
            return;
        Object.keys(this._startingStyles).forEach(prop => {
            const value = this._startingStyles[prop];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0X3N0eWxlX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2Nzc19rZXlmcmFtZXMvZGlyZWN0X3N0eWxlX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFOUMsTUFBTSxPQUFPLGlCQUFrQixTQUFRLG1CQUFtQjtJQUt4RCxZQUFtQixPQUFZLEVBQUUsTUFBNEI7UUFDM0QsS0FBSyxFQUFFLENBQUM7UUFEUyxZQUFPLEdBQVAsT0FBTyxDQUFLO1FBSnZCLG9CQUFlLEdBQThCLEVBQUUsQ0FBQztRQUNoRCxrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUs1QixJQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFBRSxPQUFPO1FBQ3hELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsZUFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUNsQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZTtZQUFFLE9BQU87UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQUksS0FBSyxFQUFFO2dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtOb29wQW5pbWF0aW9uUGxheWVyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7aHlwZW5hdGVQcm9wc09iamVjdH0gZnJvbSAnLi4vc2hhcmVkJztcblxuZXhwb3J0IGNsYXNzIERpcmVjdFN0eWxlUGxheWVyIGV4dGVuZHMgTm9vcEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3N0YXJ0aW5nU3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0ge307XG4gIHByaXZhdGUgX19pbml0aWFsaXplZCA9IGZhbHNlO1xuICBwcml2YXRlIF9zdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBhbnksIHN0eWxlczoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3N0eWxlcyA9IGh5cGVuYXRlUHJvcHNPYmplY3Qoc3R5bGVzKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMuX19pbml0aWFsaXplZCB8fCAhdGhpcy5fc3RhcnRpbmdTdHlsZXMpIHJldHVybjtcbiAgICB0aGlzLl9faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0aW5nU3R5bGVzIVtwcm9wXSA9IHRoaXMuZWxlbWVudC5zdHlsZVtwcm9wXTtcbiAgICB9KTtcbiAgICBzdXBlci5pbml0KCk7XG4gIH1cblxuICBwbGF5KCkge1xuICAgIGlmICghdGhpcy5fc3RhcnRpbmdTdHlsZXMpIHJldHVybjtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9zdHlsZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3AgPT4gdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHRoaXMuX3N0eWxlc1twcm9wXSkpO1xuICAgIHN1cGVyLnBsYXkoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9zdGFydGluZ1N0eWxlcykgcmV0dXJuO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX3N0YXJ0aW5nU3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zdGFydGluZ1N0eWxlcyFbcHJvcF07XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9zdGFydGluZ1N0eWxlcyA9IG51bGw7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=