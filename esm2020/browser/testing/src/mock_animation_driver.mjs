/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer } from '@angular/animations';
import { ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵgetParentElement as getParentElement, ɵinvokeQuery as invokeQuery, ɵnormalizeKeyframes as normalizeKeyframes, ɵvalidateStyleProperty as validateStyleProperty, } from '@angular/animations/browser';
/**
 * @publicApi
 */
export class MockAnimationDriver {
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
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
MockAnimationDriver.log = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hbmltYXRpb25fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3Rlc3Rpbmcvc3JjL21vY2tfYW5pbWF0aW9uX2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxtQkFBbUIsRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRyxPQUFPLEVBQWtCLCtCQUErQixJQUFJLDhCQUE4QixFQUFFLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBRSxZQUFZLElBQUksV0FBVyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLHNCQUFzQixJQUFJLHFCQUFxQixHQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFclU7O0dBRUc7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBRzlCLHFCQUFxQixDQUFDLElBQVk7UUFDaEMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWEsRUFBRSxTQUFpQjtRQUM3QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFnQjtRQUMvQixPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztRQUNsRCxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVksRUFB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QUMsSUFBSSxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLFFBQVEsR0FBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFcEUsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsMkRBQTJEO1lBQzNELHVEQUF1RDtZQUN2RCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzNCLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQzFCLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTt3QkFDckIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDeEQ7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7SUFDbEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGFNYXB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXIsIMm1YWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlIGFzIGFsbG93UHJldmlvdXNQbGF5ZXJTdHlsZXNNZXJnZSwgybVjb250YWluc0VsZW1lbnQgYXMgY29udGFpbnNFbGVtZW50LCDJtWdldFBhcmVudEVsZW1lbnQgYXMgZ2V0UGFyZW50RWxlbWVudCwgybVpbnZva2VRdWVyeSBhcyBpbnZva2VRdWVyeSwgybVub3JtYWxpemVLZXlmcmFtZXMgYXMgbm9ybWFsaXplS2V5ZnJhbWVzLCDJtXZhbGlkYXRlU3R5bGVQcm9wZXJ0eSBhcyB2YWxpZGF0ZVN0eWxlUHJvcGVydHksfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXInO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25Ecml2ZXIgaW1wbGVtZW50cyBBbmltYXRpb25Ecml2ZXIge1xuICBzdGF0aWMgbG9nOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3ApO1xuICB9XG5cbiAgbWF0Y2hlc0VsZW1lbnQoX2VsZW1lbnQ6IGFueSwgX3NlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29udGFpbnNFbGVtZW50KGVsbTEsIGVsbTIpO1xuICB9XG5cbiAgZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiB1bmtub3duKTogdW5rbm93biB7XG4gICAgcmV0dXJuIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBxdWVyeShlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcsIG11bHRpOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiBpbnZva2VRdWVyeShlbGVtZW50LCBzZWxlY3RvciwgbXVsdGkpO1xuICB9XG5cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICBhbmltYXRlKFxuICAgICAgZWxlbWVudDogYW55LCBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPiwgZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcixcbiAgICAgIGVhc2luZzogc3RyaW5nLCBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10pOiBNb2NrQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBwbGF5ZXIgPVxuICAgICAgICBuZXcgTW9ja0FuaW1hdGlvblBsYXllcihlbGVtZW50LCBrZXlmcmFtZXMsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBwcmV2aW91c1BsYXllcnMpO1xuICAgIE1vY2tBbmltYXRpb25Ecml2ZXIubG9nLnB1c2goPEFuaW1hdGlvblBsYXllcj5wbGF5ZXIpO1xuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uUGxheWVyIGV4dGVuZHMgTm9vcEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX19maW5pc2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9fc3RhcnRlZCA9IGZhbHNlO1xuICBwdWJsaWMgcHJldmlvdXNTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIF9vbkluaXRGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHVibGljIGN1cnJlbnRTbmFwc2hvdDogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgX2tleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+ID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4sIHB1YmxpYyBkdXJhdGlvbjogbnVtYmVyLFxuICAgICAgcHVibGljIGRlbGF5OiBudW1iZXIsIHB1YmxpYyBlYXNpbmc6IHN0cmluZywgcHVibGljIHByZXZpb3VzUGxheWVyczogYW55W10pIHtcbiAgICBzdXBlcihkdXJhdGlvbiwgZGVsYXkpO1xuXG4gICAgdGhpcy5fa2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKGtleWZyYW1lcyk7XG5cbiAgICBpZiAoYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uLCBkZWxheSkpIHtcbiAgICAgIHByZXZpb3VzUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIgaW5zdGFuY2VvZiBNb2NrQW5pbWF0aW9uUGxheWVyKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gcGxheWVyLmN1cnJlbnRTbmFwc2hvdDtcbiAgICAgICAgICBzdHlsZXMuZm9yRWFjaCgodmFsLCBwcm9wKSA9PiB0aGlzLnByZXZpb3VzU3R5bGVzLnNldChwcm9wLCB2YWwpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIG9uSW5pdChmbjogKCkgPT4gYW55KSB7XG4gICAgdGhpcy5fb25Jbml0Rm5zLnB1c2goZm4pO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIG92ZXJyaWRlIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX29uSW5pdEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uSW5pdEZucyA9IFtdO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgICB0aGlzLl9fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgb3ZlcnJpZGUgZmluaXNoKCk6IHZvaWQge1xuICAgIHN1cGVyLmZpbmlzaCgpO1xuICAgIHRoaXMuX19maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICBvdmVycmlkZSBkZXN0cm95KCk6IHZvaWQge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIHRyaWdnZXJNaWNyb3Rhc2soKSB7fVxuXG4gIG92ZXJyaWRlIHBsYXkoKTogdm9pZCB7XG4gICAgc3VwZXIucGxheSgpO1xuICAgIHRoaXMuX19zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIG92ZXJyaWRlIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zdGFydGVkO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBjb25zdCBjYXB0dXJlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLnByZXZpb3VzU3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4gY2FwdHVyZXMuc2V0KHByb3AsIHZhbCkpO1xuXG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICAvLyB3aGVuIGFzc2VtYmxpbmcgdGhlIGNhcHR1cmVkIHN0eWxlcywgaXQncyBpbXBvcnRhbnQgdGhhdFxuICAgICAgLy8gd2UgYnVpbGQgdGhlIGtleWZyYW1lIHN0eWxlcyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOlxuICAgICAgLy8ge290aGVyIHN0eWxlcyB3aXRoaW4ga2V5ZnJhbWVzLCAuLi4gcHJldmlvdXNTdHlsZXMgfVxuICAgICAgdGhpcy5fa2V5ZnJhbWVzLmZvckVhY2goa2YgPT4ge1xuICAgICAgICBmb3IgKGxldCBbcHJvcCwgdmFsXSBvZiBrZikge1xuICAgICAgICAgIGlmIChwcm9wICE9PSAnb2Zmc2V0Jykge1xuICAgICAgICAgICAgY2FwdHVyZXMuc2V0KHByb3AsIHRoaXMuX19maW5pc2hlZCA/IHZhbCA6IEFVVE9fU1RZTEUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBjYXB0dXJlcztcbiAgfVxufVxuIl19