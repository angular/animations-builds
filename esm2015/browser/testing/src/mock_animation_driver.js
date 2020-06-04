/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty } from '@angular/animations/browser';
/**
 * @publicApi
 */
let MockAnimationDriver = /** @class */ (() => {
    class MockAnimationDriver {
        validateStyleProperty(prop) {
            return validateStyleProperty(prop);
        }
        matchesElement(element, selector) {
            return matchesElement(element, selector);
        }
        containsElement(elm1, elm2) {
            return containsElement(elm1, elm2);
        }
        query(element, selector, multi) {
            return invokeQuery(element, selector, multi);
        }
        computeStyle(element, prop, defaultValue) {
            return defaultValue || '';
        }
        animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
            const player = new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
            MockAnimationDriver.log.push(player);
            return player;
        }
    }
    MockAnimationDriver.log = [];
    return MockAnimationDriver;
})();
export { MockAnimationDriver };
/**
 * @publicApi
 */
export class MockAnimationPlayer extends NoopAnimationPlayer {
    constructor(element, keyframes, duration, delay, easing, previousPlayers) {
        super(duration, delay);
        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
        this.previousPlayers = previousPlayers;
        this.__finished = false;
        this.__started = false;
        this.previousStyles = {};
        this._onInitFns = [];
        this.currentSnapshot = {};
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(player => {
                if (player instanceof MockAnimationPlayer) {
                    const styles = player.currentSnapshot;
                    Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
                }
            });
        }
    }
    /* @internal */
    onInit(fn) {
        this._onInitFns.push(fn);
    }
    /* @internal */
    init() {
        super.init();
        this._onInitFns.forEach(fn => fn());
        this._onInitFns = [];
    }
    finish() {
        super.finish();
        this.__finished = true;
    }
    destroy() {
        super.destroy();
        this.__finished = true;
    }
    /* @internal */
    triggerMicrotask() { }
    play() {
        super.play();
        this.__started = true;
    }
    hasStarted() {
        return this.__started;
    }
    beforeDestroy() {
        const captures = {};
        Object.keys(this.previousStyles).forEach(prop => {
            captures[prop] = this.previousStyles[prop];
        });
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this.keyframes.forEach(kf => {
                Object.keys(kf).forEach(prop => {
                    if (prop != 'offset') {
                        captures[prop] = this.__finished ? kf[prop] : AUTO_STYLE;
                    }
                });
            });
        }
        this.currentSnapshot = captures;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pHLE9BQU8sRUFBa0IsK0JBQStCLElBQUksOEJBQThCLEVBQUUsZ0JBQWdCLElBQUksZUFBZSxFQUFFLFlBQVksSUFBSSxXQUFXLEVBQUUsZUFBZSxJQUFJLGNBQWMsRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBR3JSOztHQUVHO0FBQ0g7SUFBQSxNQUFhLG1CQUFtQjtRQUc5QixxQkFBcUIsQ0FBQyxJQUFZO1lBQ2hDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELGNBQWMsQ0FBQyxPQUFZLEVBQUUsUUFBZ0I7WUFDM0MsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7WUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztZQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFBRSxZQUFxQjtZQUM1RCxPQUFPLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELE9BQU8sQ0FDSCxPQUFZLEVBQUUs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QUMsSUFBSSxDQUFDLEVBQUU7WUFDOUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNyQiwyREFBMkQ7WUFDM0QsdURBQXVEO1lBQ3ZELHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzdCLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRTt3QkFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO3FCQUMxRDtnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztJQUNsQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCBBVVRPX1NUWUxFLCBOb29wQW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlciwgybVhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UgYXMgYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlLCDJtWNvbnRhaW5zRWxlbWVudCBhcyBjb250YWluc0VsZW1lbnQsIMm1aW52b2tlUXVlcnkgYXMgaW52b2tlUXVlcnksIMm1bWF0Y2hlc0VsZW1lbnQgYXMgbWF0Y2hlc0VsZW1lbnQsIMm1dmFsaWRhdGVTdHlsZVByb3BlcnR5IGFzIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucy9icm93c2VyJztcblxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25Ecml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICBzdGF0aWMgbG9nOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApO1xuICB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1hdGNoZXNFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7XG4gIH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyfVtdLCBkdXJhdGlvbjogbnVtYmVyLCBkZWxheTogbnVtYmVyLFxuICAgICAgZWFzaW5nOiBzdHJpbmcsIHByZXZpb3VzUGxheWVyczogYW55W10gPSBbXSk6IE1vY2tBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHBsYXllciA9XG4gICAgICAgIG5ldyBNb2NrQW5pbWF0aW9uUGxheWVyKGVsZW1lbnQsIGtleWZyYW1lcywgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIHByZXZpb3VzUGxheWVycyk7XG4gICAgTW9ja0FuaW1hdGlvbkRyaXZlci5sb2cucHVzaCg8QW5pbWF0aW9uUGxheWVyPnBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxufVxuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25QbGF5ZXIgZXh0ZW5kcyBOb29wQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX19zdGFydGVkID0gZmFsc2U7XG4gIHB1YmxpYyBwcmV2aW91c1N0eWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXJ9ID0ge307XG4gIHByaXZhdGUgX29uSW5pdEZuczogKCgpID0+IGFueSlbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiDJtVN0eWxlRGF0YSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXJ9W10sXG4gICAgICBwdWJsaWMgZHVyYXRpb246IG51bWJlciwgcHVibGljIGRlbGF5OiBudW1iZXIsIHB1YmxpYyBlYXNpbmc6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBwcmV2aW91c1BsYXllcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoZHVyYXRpb24sIGRlbGF5KTtcblxuICAgIGlmIChhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb24sIGRlbGF5KSkge1xuICAgICAgcHJldmlvdXNQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgaWYgKHBsYXllciBpbnN0YW5jZW9mIE1vY2tBbmltYXRpb25QbGF5ZXIpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSBwbGF5ZXIuY3VycmVudFNuYXBzaG90O1xuICAgICAgICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHRoaXMucHJldmlvdXNTdHlsZXNbcHJvcF0gPSBzdHlsZXNbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgb25Jbml0KGZuOiAoKSA9PiBhbnkpIHtcbiAgICB0aGlzLl9vbkluaXRGbnMucHVzaChmbik7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgaW5pdCgpIHtcbiAgICBzdXBlci5pbml0KCk7XG4gICAgdGhpcy5fb25Jbml0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fb25Jbml0Rm5zID0gW107XG4gIH1cblxuICBmaW5pc2goKTogdm9pZCB7XG4gICAgc3VwZXIuZmluaXNoKCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHt9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICBzdXBlci5wbGF5KCk7XG4gICAgdGhpcy5fX3N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3N0YXJ0ZWQ7XG4gIH1cblxuICBiZWZvcmVEZXN0cm95KCkge1xuICAgIGNvbnN0IGNhcHR1cmVzOiDJtVN0eWxlRGF0YSA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5wcmV2aW91c1N0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNhcHR1cmVzW3Byb3BdID0gdGhpcy5wcmV2aW91c1N0eWxlc1twcm9wXTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgLy8gd2hlbiBhc3NlbWJsaW5nIHRoZSBjYXB0dXJlZCBzdHlsZXMsIGl0J3MgaW1wb3J0YW50IHRoYXRcbiAgICAgIC8vIHdlIGJ1aWxkIHRoZSBrZXlmcmFtZSBzdHlsZXMgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcbiAgICAgIC8vIHtvdGhlciBzdHlsZXMgd2l0aGluIGtleWZyYW1lcywgLi4uIHByZXZpb3VzU3R5bGVzIH1cbiAgICAgIHRoaXMua2V5ZnJhbWVzLmZvckVhY2goa2YgPT4ge1xuICAgICAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgICBpZiAocHJvcCAhPSAnb2Zmc2V0Jykge1xuICAgICAgICAgICAgY2FwdHVyZXNbcHJvcF0gPSB0aGlzLl9fZmluaXNoZWQgPyBrZltwcm9wXSA6IEFVVE9fU1RZTEU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gY2FwdHVyZXM7XG4gIH1cbn1cbiJdfQ==