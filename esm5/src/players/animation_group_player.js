/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { scheduleMicroTask } from '../util';
var AnimationGroupPlayer = /** @class */ (function () {
    function AnimationGroupPlayer(_players) {
        var _this = this;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this._onDestroyFns = [];
        this.parentPlayer = null;
        this.totalTime = 0;
        this.players = _players;
        var doneCount = 0;
        var destroyCount = 0;
        var startCount = 0;
        var total = this.players.length;
        if (total == 0) {
            scheduleMicroTask(function () { return _this._onFinish(); });
        }
        else {
            this.players.forEach(function (player) {
                player.onDone(function () {
                    if (++doneCount == total) {
                        _this._onFinish();
                    }
                });
                player.onDestroy(function () {
                    if (++destroyCount == total) {
                        _this._onDestroy();
                    }
                });
                player.onStart(function () {
                    if (++startCount == total) {
                        _this._onStart();
                    }
                });
            });
        }
        this.totalTime = this.players.reduce(function (time, player) { return Math.max(time, player.totalTime); }, 0);
    }
    AnimationGroupPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    AnimationGroupPlayer.prototype.init = function () { this.players.forEach(function (player) { return player.init(); }); };
    AnimationGroupPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    AnimationGroupPlayer.prototype._onStart = function () {
        if (!this.hasStarted()) {
            this._started = true;
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
        }
    };
    AnimationGroupPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    AnimationGroupPlayer.prototype.onDestroy = function (fn) { this._onDestroyFns.push(fn); };
    AnimationGroupPlayer.prototype.hasStarted = function () { return this._started; };
    AnimationGroupPlayer.prototype.play = function () {
        if (!this.parentPlayer) {
            this.init();
        }
        this._onStart();
        this.players.forEach(function (player) { return player.play(); });
    };
    AnimationGroupPlayer.prototype.pause = function () { this.players.forEach(function (player) { return player.pause(); }); };
    AnimationGroupPlayer.prototype.restart = function () { this.players.forEach(function (player) { return player.restart(); }); };
    AnimationGroupPlayer.prototype.finish = function () {
        this._onFinish();
        this.players.forEach(function (player) { return player.finish(); });
    };
    AnimationGroupPlayer.prototype.destroy = function () { this._onDestroy(); };
    AnimationGroupPlayer.prototype._onDestroy = function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this._onFinish();
            this.players.forEach(function (player) { return player.destroy(); });
            this._onDestroyFns.forEach(function (fn) { return fn(); });
            this._onDestroyFns = [];
        }
    };
    AnimationGroupPlayer.prototype.reset = function () {
        this.players.forEach(function (player) { return player.reset(); });
        this._destroyed = false;
        this._finished = false;
        this._started = false;
    };
    AnimationGroupPlayer.prototype.setPosition = function (p) {
        var timeAtPosition = p * this.totalTime;
        this.players.forEach(function (player) {
            var position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
            player.setPosition(position);
        });
    };
    AnimationGroupPlayer.prototype.getPosition = function () {
        var min = 0;
        this.players.forEach(function (player) {
            var p = player.getPosition();
            min = Math.min(p, min);
        });
        return min;
    };
    AnimationGroupPlayer.prototype.beforeDestroy = function () {
        this.players.forEach(function (player) {
            if (player.beforeDestroy) {
                player.beforeDestroy();
            }
        });
    };
    /* @internal */
    /* @internal */
    AnimationGroupPlayer.prototype.triggerCallback = /* @internal */
    function (phaseName) {
        var methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(function (fn) { return fn(); });
        methods.length = 0;
    };
    return AnimationGroupPlayer;
}());
export { AnimationGroupPlayer };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2dyb3VwX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX2dyb3VwX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRzFDLElBQUE7SUFZRSw4QkFBWSxRQUEyQjtRQUF2QyxpQkE4QkM7MEJBekNnQyxFQUFFOzJCQUNELEVBQUU7eUJBQ2hCLEtBQUs7d0JBQ04sS0FBSzswQkFDSCxLQUFLOzZCQUNVLEVBQUU7NEJBRU0sSUFBSTt5QkFDckIsQ0FBQztRQUkxQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUN4QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUVsQyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDZCxpQkFBaUIsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFNBQVMsRUFBRSxFQUFoQixDQUFnQixDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtnQkFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBQztvQkFDWixJQUFJLEVBQUUsU0FBUyxJQUFJLEtBQUssRUFBRTt3QkFDeEIsS0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO3FCQUNsQjtpQkFDRixDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQztvQkFDZixJQUFJLEVBQUUsWUFBWSxJQUFJLEtBQUssRUFBRTt3QkFDM0IsS0FBSSxD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LENBQUM7WUFDdkYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM5QixDQUFDLENBQUM7S0FDSjtJQUVELDBDQUFXLEdBQVg7UUFDRSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07WUFDekIsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsNENBQWEsR0FBYjtRQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtZQUN6QixJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN4QjtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsZUFBZTs7SUFDZiw4Q0FBZTtJQUFmLFVBQWdCLFNBQWlCO1FBQy9CLElBQU0sT0FBTyxHQUFHLFNBQVMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDMUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCOytCQW5KSDtJQW9KQyxDQUFBO0FBeklELGdDQXlJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnLi9hbmltYXRpb25fcGxheWVyJztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkdyb3VwUGxheWVyIGltcGxlbWVudHMgQW5pbWF0aW9uUGxheWVyIHtcbiAgcHJpdmF0ZSBfb25Eb25lRm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfb25EZXN0cm95Rm5zOiBGdW5jdGlvbltdID0gW107XG5cbiAgcHVibGljIHBhcmVudFBsYXllcjogQW5pbWF0aW9uUGxheWVyfG51bGwgPSBudWxsO1xuICBwdWJsaWMgdG90YWxUaW1lOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgcmVhZG9ubHkgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW107XG5cbiAgY29uc3RydWN0b3IoX3BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gICAgdGhpcy5wbGF5ZXJzID0gX3BsYXllcnM7XG4gICAgbGV0IGRvbmVDb3VudCA9IDA7XG4gICAgbGV0IGRlc3Ryb3lDb3VudCA9IDA7XG4gICAgbGV0IHN0YXJ0Q291bnQgPSAwO1xuICAgIGNvbnN0IHRvdGFsID0gdGhpcy5wbGF5ZXJzLmxlbmd0aDtcblxuICAgIGlmICh0b3RhbCA9PSAwKSB7XG4gICAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCsrZG9uZUNvdW50ID09IHRvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9vbkZpbmlzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIGlmICgrK2Rlc3Ryb3lDb3VudCA9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fb25EZXN0cm95KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4ge1xuICAgICAgICAgIGlmICgrK3N0YXJ0Q291bnQgPT0gdG90YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnBsYXllcnMucmVkdWNlKCh0aW1lLCBwbGF5ZXIpID0+IE1hdGgubWF4KHRpbWUsIHBsYXllci50b3RhbFRpbWUpLCAwKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uRmluaXNoKCkge1xuICAgIGlmICghdGhpcy5fZmluaXNoZWQpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRG9uZUZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgICAgdGhpcy5fb25Eb25lRm5zID0gW107XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpOiB2b2lkIHsgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5pbml0KCkpOyB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vblN0YXJ0Rm5zLnB1c2goZm4pOyB9XG5cbiAgcHJpdmF0ZSBfb25TdGFydCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pOyB9XG5cbiAgb25EZXN0cm95KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTsgfVxuXG4gIGhhc1N0YXJ0ZWQoKSB7IHJldHVybiB0aGlzLl9zdGFydGVkOyB9XG5cbiAgcGxheSgpIHtcbiAgICBpZiAoIXRoaXMucGFyZW50UGxheWVyKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gICAgdGhpcy5fb25TdGFydCgpO1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIucGxheSgpKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQgeyB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLnBhdXNlKCkpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5yZXN0YXJ0KCkpOyB9XG5cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHBsYXllci5maW5pc2goKSk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9vbkRlc3Ryb3koKTsgfVxuXG4gIHByaXZhdGUgX29uRGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uRmluaXNoKCk7XG4gICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiBwbGF5ZXIucmVzZXQoKSk7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fZmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0aW1lQXRQb3NpdGlvbiA9IHAgKiB0aGlzLnRvdGFsVGltZTtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBwbGF5ZXIudG90YWxUaW1lID8gTWF0aC5taW4oMSwgdGltZUF0UG9zaXRpb24gLyBwbGF5ZXIudG90YWxUaW1lKSA6IDE7XG4gICAgICBwbGF5ZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICBsZXQgbWluID0gMDtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgY29uc3QgcCA9IHBsYXllci5nZXRQb3NpdGlvbigpO1xuICAgICAgbWluID0gTWF0aC5taW4ocCwgbWluKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWluO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgaWYgKHBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgIHBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=