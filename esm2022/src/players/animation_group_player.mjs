/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A programmatic controller for a group of reusable animations.
 * Used internally to control animations.
 *
 * @see {@link AnimationPlayer}
 * @see {@link animations/group group}
 *
 */
export class AnimationGroupPlayer {
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
        let doneCount = 0;
        let destroyCount = 0;
        let startCount = 0;
        const total = this.players.length;
        if (total == 0) {
            queueMicrotask(() => this._onFinish());
        }
        else {
            this.players.forEach((player) => {
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
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach((fn) => fn());
            this._onDoneFns = [];
        }
    }
    init() {
        this.players.forEach((player) => player.init());
    }
    onStart(fn) {
        this._onStartFns.push(fn);
    }
    _onStart() {
        if (!this.hasStarted()) {
            this._started = true;
            this._onStartFns.forEach((fn) => fn());
            this._onStartFns = [];
        }
    }
    onDone(fn) {
        this._onDoneFns.push(fn);
    }
    onDestroy(fn) {
        this._onDestroyFns.push(fn);
    }
    hasStarted() {
        return this._started;
    }
    play() {
        if (!this.parentPlayer) {
            this.init();
        }
        this._onStart();
        this.players.forEach((player) => player.play());
    }
    pause() {
        this.players.forEach((player) => player.pause());
    }
    restart() {
        this.players.forEach((player) => player.restart());
    }
    finish() {
        this._onFinish();
        this.players.forEach((player) => player.finish());
    }
    destroy() {
        this._onDestroy();
    }
    _onDestroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this._onFinish();
            this.players.forEach((player) => player.destroy());
            this._onDestroyFns.forEach((fn) => fn());
            this._onDestroyFns = [];
        }
    }
    reset() {
        this.players.forEach((player) => player.reset());
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    }
    setPosition(p) {
        const timeAtPosition = p * this.totalTime;
        this.players.forEach((player) => {
            const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
            player.setPosition(position);
        });
    }
    getPosition() {
        const longestPlayer = this.players.reduce((longestSoFar, player) => {
            const newPlayerIsLongest = longestSoFar === null || player.totalTime > longestSoFar.totalTime;
            return newPlayerIsLongest ? player : longestSoFar;
        }, null);
        return longestPlayer != null ? longestPlayer.getPosition() : 0;
    }
    beforeDestroy() {
        this.players.forEach((player) => {
            if (player.beforeDestroy) {
                player.beforeDestroy();
            }
        });
    }
    /** @internal */
    triggerCallback(phaseName) {
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach((fn) => fn());
        methods.length = 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2dyb3VwX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX2dyb3VwX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQVkvQixZQUFZLFFBQTJCO1FBWC9CLGVBQVUsR0FBZSxFQUFFLENBQUM7UUFDNUIsZ0JBQVcsR0FBZSxFQUFFLENBQUM7UUFDN0IsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsa0JBQWEsR0FBZSxFQUFFLENBQUM7UUFFaEMsaUJBQVksR0FBMkIsSUFBSSxDQUFDO1FBQzVDLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFJM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7UUFDeEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbEMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDZixjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDekMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtvQkFDakIsSUFBSSxFQUFFLFNBQVMsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDekIs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LElBQUksQ0FBQyxVQUFVLENBQUM7UUFDMUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBbmltYXRpb25QbGF5ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX3BsYXllcic7XG5cbi8qKlxuICogQSBwcm9ncmFtbWF0aWMgY29udHJvbGxlciBmb3IgYSBncm91cCBvZiByZXVzYWJsZSBhbmltYXRpb25zLlxuICogVXNlZCBpbnRlcm5hbGx5IHRvIGNvbnRyb2wgYW5pbWF0aW9ucy5cbiAqXG4gKiBAc2VlIHtAbGluayBBbmltYXRpb25QbGF5ZXJ9XG4gKiBAc2VlIHtAbGluayBhbmltYXRpb25zL2dyb3VwIGdyb3VwfVxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkdyb3VwUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG5cbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyIHwgbnVsbCA9IG51bGw7XG4gIHB1YmxpYyB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG4gIHB1YmxpYyByZWFkb25seSBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXTtcblxuICBjb25zdHJ1Y3RvcihfcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pIHtcbiAgICB0aGlzLnBsYXllcnMgPSBfcGxheWVycztcbiAgICBsZXQgZG9uZUNvdW50ID0gMDtcbiAgICBsZXQgZGVzdHJveUNvdW50ID0gMDtcbiAgICBsZXQgc3RhcnRDb3VudCA9IDA7XG4gICAgY29uc3QgdG90YWwgPSB0aGlzLnBsYXllcnMubGVuZ3RoO1xuXG4gICAgaWYgKHRvdGFsID09IDApIHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMuX29uRmluaXNoKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4ge1xuICAgICAgICAgIGlmICgrK2RvbmVDb3VudCA9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fb25GaW5pc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgICAgICBpZiAoKytkZXN0cm95Q291bnQgPT0gdG90YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX29uRGVzdHJveSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IHtcbiAgICAgICAgICBpZiAoKytzdGFydENvdW50ID09IHRvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudG90YWxUaW1lID0gdGhpcy5wbGF5ZXJzLnJlZHVjZSgodGltZSwgcGxheWVyKSA9PiBNYXRoLm1heCh0aW1lLCBwbGF5ZXIudG90YWxUaW1lKSwgMCk7XG4gIH1cblxuICBwcml2YXRlIF9vbkZpbmlzaCgpIHtcbiAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25Eb25lRm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIuaW5pdCgpKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vblN0YXJ0Rm5zLnB1c2goZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25TdGFydCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uRG9uZUZucy5wdXNoKGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTtcbiAgfVxuXG4gIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0ZWQ7XG4gIH1cblxuICBwbGF5KCkge1xuICAgIGlmICghdGhpcy5wYXJlbnRQbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgICB0aGlzLl9vblN0YXJ0KCk7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLnBsYXkoKSk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIucGF1c2UoKSk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHBsYXllci5yZXN0YXJ0KCkpO1xuICB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmZpbmlzaCgpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fb25EZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9vbkRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25EZXN0cm95Rm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLnJlc2V0KCkpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGltZUF0UG9zaXRpb24gPSBwICogdGhpcy50b3RhbFRpbWU7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBwbGF5ZXIudG90YWxUaW1lID8gTWF0aC5taW4oMSwgdGltZUF0UG9zaXRpb24gLyBwbGF5ZXIudG90YWxUaW1lKSA6IDE7XG4gICAgICBwbGF5ZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICBjb25zdCBsb25nZXN0UGxheWVyID0gdGhpcy5wbGF5ZXJzLnJlZHVjZShcbiAgICAgIChsb25nZXN0U29GYXI6IEFuaW1hdGlvblBsYXllciB8IG51bGwsIHBsYXllcjogQW5pbWF0aW9uUGxheWVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1BsYXllcklzTG9uZ2VzdCA9XG4gICAgICAgICAgbG9uZ2VzdFNvRmFyID09PSBudWxsIHx8IHBsYXllci50b3RhbFRpbWUgPiBsb25nZXN0U29GYXIudG90YWxUaW1lO1xuICAgICAgICByZXR1cm4gbmV3UGxheWVySXNMb25nZXN0ID8gcGxheWVyIDogbG9uZ2VzdFNvRmFyO1xuICAgICAgfSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgICByZXR1cm4gbG9uZ2VzdFBsYXllciAhPSBudWxsID8gbG9uZ2VzdFBsYXllci5nZXRQb3NpdGlvbigpIDogMDtcbiAgfVxuXG4gIGJlZm9yZURlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgaWYgKHBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgIHBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=