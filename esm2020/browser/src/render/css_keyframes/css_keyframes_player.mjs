import { computeStyle } from '../../util';
import { ElementAnimationStyleHandler } from './element_animation_style_handler';
const DEFAULT_FILL_MODE = 'forwards';
const DEFAULT_EASING = 'linear';
export class CssKeyframesPlayer {
    constructor(element, keyframes, animationName, _duration, _delay, easing, _finalStyles, _specialStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.animationName = animationName;
        this._duration = _duration;
        this._delay = _delay;
        this._finalStyles = _finalStyles;
        this._specialStyles = _specialStyles;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this.currentSnapshot = new Map();
        this._state = 0;
        this.easing = easing || DEFAULT_EASING;
        this.totalTime = _duration + _delay;
        this._buildStyler();
    }
    onStart(fn) {
        this._onStartFns.push(fn);
    }
    onDone(fn) {
        this._onDoneFns.push(fn);
    }
    onDestroy(fn) {
        this._onDestroyFns.push(fn);
    }
    destroy() {
        this.init();
        if (this._state >= 4 /* DESTROYED */)
            return;
        this._state = 4 /* DESTROYED */;
        this._styler.destroy();
        this._flushStartFns();
        this._flushDoneFns();
        if (this._specialStyles) {
            this._specialStyles.destroy();
        }
        this._onDestroyFns.forEach(fn => fn());
        this._onDestroyFns = [];
    }
    _flushDoneFns() {
        this._onDoneFns.forEach(fn => fn());
        this._onDoneFns = [];
    }
    _flushStartFns() {
        this._onStartFns.forEach(fn => fn());
        this._onStartFns = [];
    }
    finish() {
        this.init();
        if (this._state >= 3 /* FINISHED */)
            return;
        this._state = 3 /* FINISHED */;
        this._styler.finish();
        this._flushStartFns();
        if (this._specialStyles) {
            this._specialStyles.finish();
        }
        this._flushDoneFns();
    }
    setPosition(value) {
        this._styler.setPosition(value);
    }
    getPosition() {
        return this._styler.getPosition();
    }
    hasStarted() {
        return this._state >= 2 /* STARTED */;
    }
    init() {
        if (this._state >= 1 /* INITIALIZED */)
            return;
        this._state = 1 /* INITIALIZED */;
        const elm = this.element;
        this._styler.apply();
        if (this._delay) {
            this._styler.pause();
        }
    }
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._flushStartFns();
            this._state = 2 /* STARTED */;
            if (this._specialStyles) {
                this._specialStyles.start();
            }
        }
        this._styler.resume();
    }
    pause() {
        this.init();
        this._styler.pause();
    }
    restart() {
        this.reset();
        this.play();
    }
    reset() {
        this._state = 0 /* RESET */;
        this._styler.destroy();
        this._buildStyler();
        this._styler.apply();
    }
    _buildStyler() {
        this._styler = new ElementAnimationStyleHandler(this.element, this.animationName, this._duration, this._delay, this.easing, DEFAULT_FILL_MODE, () => this.finish());
    }
    /** @internal */
    triggerCallback(phaseName) {
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(fn => fn());
        methods.length = 0;
    }
    beforeDestroy() {
        this.init();
        const styles = new Map();
        if (this.hasStarted()) {
            const finished = this._state >= 3 /* FINISHED */;
            this._finalStyles.forEach((val, prop) => {
                if (prop !== 'offset') {
                    styles.set(prop, finished ? val : computeStyle(this.element, prop));
                }
            });
        }
        this.currentSnapshot = styles;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2tleWZyYW1lc19wbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFHeEMsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFL0UsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBVWhDLE1BQU0sT0FBTyxrQkFBa0I7SUFnQjdCLFlBQ29CLE9BQVksRUFBa0IsU0FBK0IsRUFDN0QsYUFBcUIsRUFBbUIsU0FBaUIsRUFDeEQsTUFBYyxFQUFFLE1BQWMsRUFBbUIsWUFBMkIsRUFDNUUsY0FBd0M7UUFIekMsWUFBTyxHQUFQLE9BQU8sQ0FBSztRQUFrQixjQUFTLEdBQVQsU0FBUyxDQUFzQjtRQUM3RCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUFtQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ3hELFdBQU0sR0FBTixNQUFNLENBQVE7UUFBbUMsaUJBQVksR0FBWixZQUFZLENBQWU7UUFDNUUsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1FBbkJyRCxlQUFVLEdBQWUsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQWUsRUFBRSxDQUFDO1FBQzdCLGtCQUFhLEdBQWUsRUFBRSxDQUFDO1FBU2hDLG9CQUFlLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFMUMsV0FBTSxHQUF5QixDQUFDLENBQUM7UUFPdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksY0FBYyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxFQUFjO1FBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBYztRQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsU0FBUyxDQUFDLEVBQWM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFJLElBQUksQ0FBQyxNQUFNLHFCQUFrQztZQUFFLE9BQU87UUFDMUQsSUFBSSxDQUFDLE1BQU0sb0JBQWlDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTyxhQUFhO1FBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFJLElBQUksQ0FBQyxNQUFNLG9CQUFpQztZQUFFLE9BQU87UUFDekQsSUFBSSxDQUFDLE1BQU0sbUJBQWdDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDOUI7UUFDRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxtQkFBZ0MsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsSUFBSTtRQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sdUJBQW9DO1lBQUUsT0FBTztRQUM1RCxJQUFJLENBQUMsTUFBTSxzQkFBbUMsQ0FBQztRQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN0QjtJQUNILENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1BQU0sa0JBQStCLENBQUM7WUFDM0MsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzdCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFDRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLE1BQU0sZ0JBQTZCLENBQUM7UUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksNEJBQTRCLENBQzNDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFDMUUsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixlQUFlLENBQUMsU0FBaUI7UUFDL0IsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsYUFBYTtRQUNYLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE1BQU0sTUFBTSxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLG9CQUFpQyxDQUFDO1lBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUN0QyxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNyRTtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCDJtVN0eWxlRGF0YU1hcH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29tcHV0ZVN0eWxlfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7U3BlY2lhbENhc2VkU3R5bGVzfSBmcm9tICcuLi9zcGVjaWFsX2Nhc2VkX3N0eWxlcyc7XG5cbmltcG9ydCB7RWxlbWVudEFuaW1hdGlvblN0eWxlSGFuZGxlcn0gZnJvbSAnLi9lbGVtZW50X2FuaW1hdGlvbl9zdHlsZV9oYW5kbGVyJztcblxuY29uc3QgREVGQVVMVF9GSUxMX01PREUgPSAnZm9yd2FyZHMnO1xuY29uc3QgREVGQVVMVF9FQVNJTkcgPSAnbGluZWFyJztcblxuZXhwb3J0IGNvbnN0IGVudW0gQW5pbWF0b3JDb250cm9sU3RhdGUge1xuICBSRVNFVCA9IDAsXG4gIElOSVRJQUxJWkVEID0gMSxcbiAgU1RBUlRFRCA9IDIsXG4gIEZJTklTSEVEID0gMyxcbiAgREVTVFJPWUVEID0gNFxufVxuXG5leHBvcnQgY2xhc3MgQ3NzS2V5ZnJhbWVzUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3N0eWxlciE6IEVsZW1lbnRBbmltYXRpb25TdHlsZUhhbmRsZXI7XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXIhOiBBbmltYXRpb25QbGF5ZXI7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGVhc2luZzogc3RyaW5nO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcblxuICBwcml2YXRlIF9zdGF0ZTogQW5pbWF0b3JDb250cm9sU3RhdGUgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IGFueSwgcHVibGljIHJlYWRvbmx5IGtleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+LFxuICAgICAgcHVibGljIHJlYWRvbmx5IGFuaW1hdGlvbk5hbWU6IHN0cmluZywgcHJpdmF0ZSByZWFkb25seSBfZHVyYXRpb246IG51bWJlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2RlbGF5OiBudW1iZXIsIGVhc2luZzogc3RyaW5nLCBwcml2YXRlIHJlYWRvbmx5IF9maW5hbFN0eWxlczogybVTdHlsZURhdGFNYXAsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9zcGVjaWFsU3R5bGVzPzogU3BlY2lhbENhc2VkU3R5bGVzfG51bGwpIHtcbiAgICB0aGlzLmVhc2luZyA9IGVhc2luZyB8fCBERUZBVUxUX0VBU0lORztcbiAgICB0aGlzLnRvdGFsVGltZSA9IF9kdXJhdGlvbiArIF9kZWxheTtcbiAgICB0aGlzLl9idWlsZFN0eWxlcigpO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkRvbmVGbnMucHVzaChmbik7XG4gIH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkRlc3Ryb3lGbnMucHVzaChmbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA+PSBBbmltYXRvckNvbnRyb2xTdGF0ZS5ERVNUUk9ZRUQpIHJldHVybjtcbiAgICB0aGlzLl9zdGF0ZSA9IEFuaW1hdG9yQ29udHJvbFN0YXRlLkRFU1RST1lFRDtcbiAgICB0aGlzLl9zdHlsZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX2ZsdXNoU3RhcnRGbnMoKTtcbiAgICB0aGlzLl9mbHVzaERvbmVGbnMoKTtcbiAgICBpZiAodGhpcy5fc3BlY2lhbFN0eWxlcykge1xuICAgICAgdGhpcy5fc3BlY2lhbFN0eWxlcy5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hEb25lRm5zKCkge1xuICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hTdGFydEZucygpIHtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICB9XG5cbiAgZmluaXNoKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLl9zdGF0ZSA+PSBBbmltYXRvckNvbnRyb2xTdGF0ZS5GSU5JU0hFRCkgcmV0dXJuO1xuICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuRklOSVNIRUQ7XG4gICAgdGhpcy5fc3R5bGVyLmZpbmlzaCgpO1xuICAgIHRoaXMuX2ZsdXNoU3RhcnRGbnMoKTtcbiAgICBpZiAodGhpcy5fc3BlY2lhbFN0eWxlcykge1xuICAgICAgdGhpcy5fc3BlY2lhbFN0eWxlcy5maW5pc2goKTtcbiAgICB9XG4gICAgdGhpcy5fZmx1c2hEb25lRm5zKCk7XG4gIH1cblxuICBzZXRQb3NpdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc3R5bGVyLnNldFBvc2l0aW9uKHZhbHVlKTtcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlci5nZXRQb3NpdGlvbigpO1xuICB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUgPj0gQW5pbWF0b3JDb250cm9sU3RhdGUuU1RBUlRFRDtcbiAgfVxuICBpbml0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGF0ZSA+PSBBbmltYXRvckNvbnRyb2xTdGF0ZS5JTklUSUFMSVpFRCkgcmV0dXJuO1xuICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuSU5JVElBTElaRUQ7XG4gICAgY29uc3QgZWxtID0gdGhpcy5lbGVtZW50O1xuICAgIHRoaXMuX3N0eWxlci5hcHBseSgpO1xuICAgIGlmICh0aGlzLl9kZWxheSkge1xuICAgICAgdGhpcy5fc3R5bGVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9mbHVzaFN0YXJ0Rm5zKCk7XG4gICAgICB0aGlzLl9zdGF0ZSA9IEFuaW1hdG9yQ29udHJvbFN0YXRlLlNUQVJURUQ7XG4gICAgICBpZiAodGhpcy5fc3BlY2lhbFN0eWxlcykge1xuICAgICAgICB0aGlzLl9zcGVjaWFsU3R5bGVzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3N0eWxlci5yZXN1bWUoKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHRoaXMuX3N0eWxlci5wYXVzZSgpO1xuICB9XG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMucGxheSgpO1xuICB9XG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXRlID0gQW5pbWF0b3JDb250cm9sU3RhdGUuUkVTRVQ7XG4gICAgdGhpcy5fc3R5bGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9idWlsZFN0eWxlcigpO1xuICAgIHRoaXMuX3N0eWxlci5hcHBseSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRTdHlsZXIoKSB7XG4gICAgdGhpcy5fc3R5bGVyID0gbmV3IEVsZW1lbnRBbmltYXRpb25TdHlsZUhhbmRsZXIoXG4gICAgICAgIHRoaXMuZWxlbWVudCwgdGhpcy5hbmltYXRpb25OYW1lLCB0aGlzLl9kdXJhdGlvbiwgdGhpcy5fZGVsYXksIHRoaXMuZWFzaW5nLFxuICAgICAgICBERUZBVUxUX0ZJTExfTU9ERSwgKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIG1ldGhvZHMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3Qgc3R5bGVzOiDJtVN0eWxlRGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgICBpZiAodGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gdGhpcy5fc3RhdGUgPj0gQW5pbWF0b3JDb250cm9sU3RhdGUuRklOSVNIRUQ7XG4gICAgICB0aGlzLl9maW5hbFN0eWxlcy5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgICAgc3R5bGVzLnNldChwcm9wLCBmaW5pc2hlZCA/IHZhbCA6IGNvbXB1dGVTdHlsZSh0aGlzLmVsZW1lbnQsIHByb3ApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gc3R5bGVzO1xuICB9XG59XG4iXX0=