/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵgetParentElement as getParentElement, ɵinvokeQuery as invokeQuery, ɵnormalizeKeyframes as normalizeKeyframes, ɵvalidateStyleProperty as validateStyleProperty, } from '@angular/animations/browser';
import { validateWebAnimatableStyleProperty } from '../../src/render/shared';
import { camelCaseToDashCase } from '../../src/util';
/**
 * @publicApi
 */
class MockAnimationDriver {
    static { this.log = []; }
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    validateAnimatableStyleProperty(prop) {
        const cssProp = camelCaseToDashCase(prop);
        return validateWebAnimatableStyleProperty(cssProp);
    }
    matchesElement(_element, _selector) {
        return false;
    }
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
    }
    getParentElement(element) {
        return getParentElement(element);
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
        this.previousStyles = new Map();
        this._onInitFns = [];
        this.currentSnapshot = new Map();
        this._keyframes = [];
        this._keyframes = normalizeKeyframes(keyframes);
        if (allowPreviousPlayerStylesMerge(duration, delay)) {
            previousPlayers.forEach(player => {
                if (player instanceof MockAnimationPlayer) {
                    const styles = player.currentSnapshot;
                    styles.forEach((val, prop) => this.previousStyles.set(prop, val));
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
    reset() {
        super.reset();
        this.__started = false;
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
        const captures = new Map();
        this.previousStyles.forEach((val, prop) => captures.set(prop, val));
        if (this.hasStarted()) {
            // when assembling the captured styles, it's important that
            // we build the keyframe styles in the following order:
            // {other styles within keyframes, ... previousStyles }
            this._keyframes.forEach(kf => {
                for (let [prop, val] of kf) {
                    if (prop !== 'offset') {
                        captures.set(prop, this.__finished ? val : AUTO_STYLE);
                    }
                }
            });
        }
        this.currentSnapshot = captures;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRyxPQUFPLEVBQWtCLCtCQUErQixJQUFJLDhCQUE4QixFQUFFLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBRSxZQUFZLElBQUksV0FBVyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLHNCQUFzQixJQUFJLHFCQUFxQixHQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFclUsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDM0UsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkQ7O0dBRUc7QUFDSCxNQUFhLG1CQUFtQjthQUN2QixRQUFHLEdBQXNCLEVBQUUsQ0FBQztJQUVuQyxxQkFBcUIsQ0FBQyxJQUFZO1FBQ2hDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELCtCQUErQixDQUFDLElBQVk7UUFDMUMsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsT0FBTyxrQ0FBa0MsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWEsRUFBRSxTQUFpQjtRQUM3QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FB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Q0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXIsIMm1YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlIGFzIGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgybVjb250YWluc0VsZW1lbnQgYXMgY29udGFpbnNFbGVtZW50LCDJtWdldFBhcmVudEVsZW1lbnQgYXMgZ2V0UGFyZW50RWxlbWVudCwgybVpbnZva2VRdWVyeSBhcyBpbnZva2VRdWVyeSwgybVub3JtYWxpemVLZXlmcmFtZXMgYXMgbm9ybWFsaXplS2V5ZnJhbWVzLCDJtXZhbGlkYXRlU3R5bGVQcm9wZXJ0eSBhcyB2YWxpZGF0ZVN0eWxlUHJvcGVydHksfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXInO1xuXG5pbXBvcnQge3ZhbGlkYXRlV2ViQW5pbWF0YWJsZVN0eWxlUHJvcGVydHl9IGZyb20gJy4uLy4uL3NyYy9yZW5kZXIvc2hhcmVkJztcbmltcG9ydCB7Y2FtZWxDYXNlVG9EYXNoQ2FzZX0gZnJvbSAnLi4vLi4vc3JjL3V0aWwnO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25Ecml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICBzdGF0aWMgbG9nOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApO1xuICB9XG5cbiAgdmFsaWRhdGVBbmltYXRhYmxlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBjc3NQcm9wID0gY2FtZWxDYXNlVG9EYXNoQ2FzZShwcm9wKTtcbiAgICByZXR1cm4gdmFsaWRhdGVXZWJBbmltYXRhYmxlU3R5bGVQcm9wZXJ0eShjc3NQcm9wKTtcbiAgfVxuXG4gIG1hdGNoZXNFbGVtZW50KF9lbGVtZW50OiBhbnksIF9zZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29udGFpbnNFbGVtZW50KGVsbTE6IGFueSwgZWxtMjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbnRhaW5zRWxlbWVudChlbG0xLCBlbG0yKTtcbiAgfVxuXG4gIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd24ge1xuICAgIHJldHVybiBnZXRQYXJlbnRFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gaW52b2tlUXVlcnkoZWxlbWVudCwgc2VsZWN0b3IsIG11bHRpKTtcbiAgfVxuXG4gIGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9XG5cbiAgYW5pbWF0ZShcbiAgICAgIGVsZW1lbnQ6IGFueSwga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4sIGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIsXG4gICAgICBlYXNpbmc6IHN0cmluZywgcHJldmlvdXNQbGF5ZXJzOiBhbnlbXSA9IFtdKTogTW9ja0FuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgcGxheWVyID1cbiAgICAgICAgbmV3IE1vY2tBbmltYXRpb25QbGF5ZXIoZWxlbWVudCwga2V5ZnJhbWVzLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICBNb2NrQW5pbWF0aW9uRHJpdmVyLmxvZy5wdXNoKDxBbmltYXRpb25QbGF5ZXI+cGxheWVyKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvblBsYXllciBleHRlbmRzIE5vb3BBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9fZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgcHVibGljIHByZXZpb3VzU3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfb25Jbml0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG4gIHB1YmxpYyBjdXJyZW50U25hcHNob3Q6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIF9rZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGtleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+LCBwdWJsaWMgZHVyYXRpb246IG51bWJlcixcbiAgICAgIHB1YmxpYyBkZWxheTogbnVtYmVyLCBwdWJsaWMgZWFzaW5nOiBzdHJpbmcsIHB1YmxpYyBwcmV2aW91c1BsYXllcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoZHVyYXRpb24sIGRlbGF5KTtcblxuICAgIHRoaXMuX2tleWZyYW1lcyA9IG5vcm1hbGl6ZUtleWZyYW1lcyhrZXlmcmFtZXMpO1xuXG4gICAgaWYgKGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZShkdXJhdGlvbiwgZGVsYXkpKSB7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBpZiAocGxheWVyIGluc3RhbmNlb2YgTW9ja0FuaW1hdGlvblBsYXllcikge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHBsYXllci5jdXJyZW50U25hcHNob3Q7XG4gICAgICAgICAgc3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gdGhpcy5wcmV2aW91c1N0eWxlcy5zZXQocHJvcCwgdmFsKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBvbkluaXQoZm46ICgpID0+IGFueSkge1xuICAgIHRoaXMuX29uSW5pdEZucy5wdXNoKGZuKTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBpbml0KCkge1xuICAgIHN1cGVyLmluaXQoKTtcbiAgICB0aGlzLl9vbkluaXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vbkluaXRGbnMgPSBbXTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJlc2V0KCkge1xuICAgIHN1cGVyLnJlc2V0KCk7XG4gICAgdGhpcy5fX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGZpbmlzaCgpOiB2b2lkIHtcbiAgICBzdXBlci5maW5pc2goKTtcbiAgICB0aGlzLl9fZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICB0cmlnZ2VyTWljcm90YXNrKCkge31cblxuICBvdmVycmlkZSBwbGF5KCk6IHZvaWQge1xuICAgIHN1cGVyLnBsYXkoKTtcbiAgICB0aGlzLl9fc3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBvdmVycmlkZSBoYXNTdGFydGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fc3RhcnRlZDtcbiAgfVxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgY29uc3QgY2FwdHVyZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5wcmV2aW91c1N0eWxlcy5mb3JFYWNoKCh2YWwsIHByb3ApID0+IGNhcHR1cmVzLnNldChwcm9wLCB2YWwpKTtcblxuICAgIGlmICh0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgLy8gd2hlbiBhc3NlbWJsaW5nIHRoZSBjYXB0dXJlZCBzdHlsZXMsIGl0J3MgaW1wb3J0YW50IHRoYXRcbiAgICAgIC8vIHdlIGJ1aWxkIHRoZSBrZXlmcmFtZSBzdHlsZXMgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcbiAgICAgIC8vIHtvdGhlciBzdHlsZXMgd2l0aGluIGtleWZyYW1lcywgLi4uIHByZXZpb3VzU3R5bGVzIH1cbiAgICAgIHRoaXMuX2tleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICAgICAgZm9yIChsZXQgW3Byb3AsIHZhbF0gb2Yga2YpIHtcbiAgICAgICAgICBpZiAocHJvcCAhPT0gJ29mZnNldCcpIHtcbiAgICAgICAgICAgIGNhcHR1cmVzLnNldChwcm9wLCB0aGlzLl9fZmluaXNoZWQgPyB2YWwgOiBBVVRPX1NUWUxFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gY2FwdHVyZXM7XG4gIH1cbn1cbiJdfQ==