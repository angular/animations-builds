/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { scheduleMicroTask } from '../util';
export class AnimationGroupPlayer {
    /**
     * @param {?} _players
     */
    constructor(_players) {
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this._onDestroyFns = [];
        this.parentPlayer = null;
        this.totalTime = 0;
        this.players = _players;
        let /** @type {?} */ doneCount = 0;
        let /** @type {?} */ destroyCount = 0;
        let /** @type {?} */ startCount = 0;
        const /** @type {?} */ total = this.players.length;
        if (total == 0) {
            scheduleMicroTask(() => this._onFinish());
        }
        else {
            this.players.forEach(player => {
                player.onDone(() => {
                    if (++doneCount == total) {
                        this._onFinish();
                    }
                });
                player.onDestroy(() => {
                    if (++destroyCount == total) {
                        this._onDestroy();
                    }
                });
                player.onStart(() => {
                    if (++startCount == total) {
                        this._onStart();
                    }
                });
            });
        }
        this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
    }
    /**
     * @return {?}
     */
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(fn => fn());
            this._onDoneFns = [];
        }
    }
    /**
     * @return {?}
     */
    init() { this.players.forEach(player => player.init()); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @return {?}
     */
    _onStart() {
        if (!this.hasStarted()) {
            this._started = true;
            this._onStartFns.forEach(fn => fn());
            this._onStartFns = [];
        }
    }
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
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    play() {
        if (!this.parentPlayer) {
            this.init();
        }
        this._onStart();
        this.players.forEach(player => player.play());
    }
    /**
     * @return {?}
     */
    pause() { this.players.forEach(player => player.pause()); }
    /**
     * @return {?}
     */
    restart() { this.players.forEach(player => player.restart()); }
    /**
     * @return {?}
     */
    finish() {
        this._onFinish();
        this.players.forEach(player => player.finish());
    }
    /**
     * @return {?}
     */
    destroy() { this._onDestroy(); }
    /**
     * @return {?}
     */
    _onDestroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this._onFinish();
            this.players.forEach(player => player.destroy());
            this._onDestroyFns.forEach(fn => fn());
            this._onDestroyFns = [];
        }
    }
    /**
     * @return {?}
     */
    reset() {
        this.players.forEach(player => player.reset());
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) {
        const /** @type {?} */ timeAtPosition = p * this.totalTime;
        this.players.forEach(player => {
            const /** @type {?} */ position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
            player.setPosition(position);
        });
    }
    /**
     * @return {?}
     */
    getPosition() {
        let /** @type {?} */ min = 0;
        this.players.forEach(player => {
            const /** @type {?} */ p = player.getPosition();
            min = Math.min(p, min);
        });
        return min;
    }
    /**
     * @return {?}
     */
    beforeDestroy() {
        this.players.forEach(player => {
            if (player.beforeDestroy) {
                player.beforeDestroy();
            }
        });
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
}
function AnimationGroupPlayer_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationGroupPlayer.prototype._onDoneFns;
    /** @type {?} */
    AnimationGroupPlayer.prototype._onStartFns;
    /** @type {?} */
    AnimationGroupPlayer.prototype._finished;
    /** @type {?} */
    AnimationGroupPlayer.prototype._started;
    /** @type {?} */
    AnimationGroupPlayer.prototype._destroyed;
    /** @type {?} */
    AnimationGroupPlayer.prototype._onDestroyFns;
    /** @type {?} */
    AnimationGroupPlayer.prototype.parentPlayer;
    /** @type {?} */
    AnimationGroupPlayer.prototype.totalTime;
    /** @type {?} */
    AnimationGroupPlayer.prototype.players;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2dyb3VwX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX2dyb3VwX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUcxQyxNQUFNOzs7O0lBWUosWUFBWSxRQUEyQjswQkFYTixFQUFFOzJCQUNELEVBQUU7eUJBQ2hCLEtBQUs7d0JBQ04sS0FBSzswQkFDSCxLQUFLOzZCQUNVLEVBQUU7NEJBRU0sSUFBSTt5QkFDckIsQ0FBQztRQUkxQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUN4QixxQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLHFCQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDckIscUJBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQix1QkFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbEMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQ2QsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtvQkFDakIsSUFBSSxFQUFFLFNBQVMsSUFBSSxLQUFLLEVBQUU7d0JBQ3hCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztxQkFDbEI7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO29CQUNwQixJQUFJLEVBQUUsWUFBWSxJQUFJLEtBQUssRUFBRTt3QkFDM0Is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QyxNQUFNLENBQUMsRUFBRTtZQUM1Qix1QkFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztLQUNaOzs7O0lBRUQsYUFBYTtRQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLElBQUksTUFBTSxDQUFDLGFBQWEsRUFBRTtnQkFDeEIsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3hCO1NBQ0YsQ0FBQyxDQUFDO0tBQ0o7Ozs7O0lBR0QsZUFBZSxDQUFDLFNBQWlCO1FBQy9CLHVCQUFNLE9BQU8sR0FBRyxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2NoZWR1bGVNaWNyb1Rhc2t9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX3BsYXllcic7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25Hcm91cFBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX2ZpbmlzaGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsID0gbnVsbDtcbiAgcHVibGljIHRvdGFsVGltZTogbnVtYmVyID0gMDtcbiAgcHVibGljIHJlYWRvbmx5IHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdO1xuXG4gIGNvbnN0cnVjdG9yKF9wbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICAgIHRoaXMucGxheWVycyA9IF9wbGF5ZXJzO1xuICAgIGxldCBkb25lQ291bnQgPSAwO1xuICAgIGxldCBkZXN0cm95Q291bnQgPSAwO1xuICAgIGxldCBzdGFydENvdW50ID0gMDtcbiAgICBjb25zdCB0b3RhbCA9IHRoaXMucGxheWVycy5sZW5ndGg7XG5cbiAgICBpZiAodG90YWwgPT0gMCkge1xuICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4gdGhpcy5fb25GaW5pc2goKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgICAgIGlmICgrK2RvbmVDb3VudCA9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fb25GaW5pc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgICAgICBpZiAoKytkZXN0cm95Q291bnQgPT0gdG90YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX29uRGVzdHJveSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHtcbiAgICAgICAgICBpZiAoKytzdGFydENvdW50ID09IHRvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudG90YWxUaW1lID0gdGhpcy5wbGF5ZXJzLnJlZHVjZSgodGltZSwgcGxheWVyKSA9PiBNYXRoLm1heCh0aW1lLCBwbGF5ZXIudG90YWxUaW1lKSwgMCk7XG4gIH1cblxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIGluaXQoKTogdm9pZCB7IHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuaW5pdCgpKTsgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25TdGFydEZucy5wdXNoKGZuKTsgfVxuXG4gIHByaXZhdGUgX29uU3RhcnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vblN0YXJ0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vblN0YXJ0Rm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTsgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRlc3Ryb3lGbnMucHVzaChmbik7IH1cblxuICBoYXNTdGFydGVkKCkgeyByZXR1cm4gdGhpcy5fc3RhcnRlZDsgfVxuXG4gIHBsYXkoKSB7XG4gICAgaWYgKCF0aGlzLnBhcmVudFBsYXllcikge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLnBsYXkoKSk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHsgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5wYXVzZSgpKTsgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7IHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIucmVzdGFydCgpKTsgfVxuXG4gIGZpbmlzaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIuZmluaXNoKCkpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95KCk7IH1cblxuICBwcml2YXRlIF9vbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLnJlc2V0KCkpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGltZUF0UG9zaXRpb24gPSBwICogdGhpcy50b3RhbFRpbWU7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gcGxheWVyLnRvdGFsVGltZSA/IE1hdGgubWluKDEsIHRpbWVBdFBvc2l0aW9uIC8gcGxheWVyLnRvdGFsVGltZSkgOiAxO1xuICAgICAgcGxheWVyLnNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgbGV0IG1pbiA9IDA7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGNvbnN0IHAgPSBwbGF5ZXIuZ2V0UG9zaXRpb24oKTtcbiAgICAgIG1pbiA9IE1hdGgubWluKHAsIG1pbik7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1pbjtcbiAgfVxuXG4gIGJlZm9yZURlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGlmIChwbGF5ZXIuYmVmb3JlRGVzdHJveSkge1xuICAgICAgICBwbGF5ZXIuYmVmb3JlRGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIG1ldGhvZHMubGVuZ3RoID0gMDtcbiAgfVxufVxuIl19