/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AUTO_STYLE } from '@angular/animations';
import { buildAnimationAst } from '../dsl/animation_ast_builder';
import { buildAnimationTimelines } from '../dsl/animation_timeline_builder';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
import { ENTER_CLASSNAME, LEAVE_CLASSNAME } from '../util';
import { getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
const /** @type {?} */ EMPTY_INSTRUCTION_MAP = new ElementInstructionMap();
export class TimelineAnimationEngine {
    /**
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(_driver, _normalizer) {
        this._driver = _driver;
        this._normalizer = _normalizer;
        this._animations = {};
        this._playersById = {};
        this.players = [];
    }
    /**
     * @param {?} id
     * @param {?} metadata
     * @return {?}
     */
    register(id, metadata) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = buildAnimationAst(this._driver, metadata, errors);
        if (errors.length) {
            throw new Error(`Unable to build the animation due to the following errors: ${errors.join("\n")}`);
        }
        else {
            this._animations[id] = ast;
        }
    }
    /**
     * @param {?} i
     * @param {?} preStyles
     * @param {?=} postStyles
     * @return {?}
     */
    _buildPlayer(i, preStyles, postStyles) {
        const /** @type {?} */ element = i.element;
        const /** @type {?} */ keyframes = normalizeKeyframes(this._driver, this._normalizer, element, i.keyframes, preStyles, postStyles);
        return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?=} options
     * @return {?}
     */
    create(id, element, options = {}) {
        const /** @type {?} */ errors = [];
        const /** @type {?} */ ast = this._animations[id];
        let /** @type {?} */ instructions;
        const /** @type {?} */ autoStylesMap = new Map();
        if (ast) {
            instructions = buildAnimationTimelines(this._driver, element, ast, ENTER_CLASSNAME, LEAVE_CLASSNAME, {}, {}, options, EMPTY_INSTRUCTION_MAP, errors);
            instructions.forEach(inst => {
                const /** @type {?} */ styles = getOrSetAsInMap(autoStylesMap, inst.element, {});
                inst.postStyleProps.forEach(prop => styles[prop] = null);
            });
        }
        else {
            errors.push('The requested animation doesn\'t exist or has already been destroyed');
            instructions = [];
        }
        if (errors.length) {
            throw new Error(`Unable to create the animation due to the following errors: ${errors.join("\n")}`);
        }
        autoStylesMap.forEach((styles, element) => {
            Object.keys(styles).forEach(prop => { styles[prop] = this._driver.computeStyle(element, prop, AUTO_STYLE); });
        });
        const /** @type {?} */ players = instructions.map(i => {
            const /** @type {?} */ styles = autoStylesMap.get(i.element);
            return this._buildPlayer(i, {}, styles);
        });
        const /** @type {?} */ player = optimizeGroupPlayer(players);
        this._playersById[id] = player;
        player.onDestroy(() => this.destroy(id));
        this.players.push(player);
        return player;
    }
    /**
     * @param {?} id
     * @return {?}
     */
    destroy(id) {
        const /** @type {?} */ player = this._getPlayer(id);
        player.destroy();
        delete this._playersById[id];
        const /** @type {?} */ index = this.players.indexOf(player);
        if (index >= 0) {
            this.players.splice(index, 1);
        }
    }
    /**
     * @param {?} id
     * @return {?}
     */
    _getPlayer(id) {
        const /** @type {?} */ player = this._playersById[id];
        if (!player) {
            throw new Error(`Unable to find the timeline player referenced by ${id}`);
        }
        return player;
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    listen(id, element, eventName, callback) {
        // triggerName, fromState, toState are all ignored for timeline animations
        const /** @type {?} */ baseEvent = makeAnimationEvent(element, '', '', '');
        listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
        return () => { };
    }
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} command
     * @param {?} args
     * @return {?}
     */
    command(id, element, command, args) {
        if (command == 'register') {
            this.register(id, /** @type {?} */ (args[0]));
            return;
        }
        if (command == 'create') {
            const /** @type {?} */ options = /** @type {?} */ ((args[0] || {}));
            this.create(id, element, options);
            return;
        }
        const /** @type {?} */ player = this._getPlayer(id);
        switch (command) {
            case 'play':
                player.play();
                break;
            case 'pause':
                player.pause();
                break;
            case 'reset':
                player.reset();
                break;
            case 'restart':
                player.restart();
                break;
            case 'finish':
                player.finish();
                break;
            case 'init':
                player.init();
                break;
            case 'setPosition':
                player.setPosition(parseFloat(/** @type {?} */ (args[0])));
                break;
            case 'destroy':
                this.destroy(id);
                break;
        }
    }
}
function TimelineAnimationEngine_tsickle_Closure_declarations() {
    /** @type {?} */
    TimelineAnimationEngine.prototype._animations;
    /** @type {?} */
    TimelineAnimationEngine.prototype._playersById;
    /** @type {?} */
    TimelineAnimationEngine.prototype.players;
    /** @type {?} */
    TimelineAnimationEngine.prototype._driver;
    /** @type {?} */
    TimelineAnimationEngine.prototype._normalizer;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVfYW5pbWF0aW9uX2VuZ2luZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL3RpbWVsaW5lX2FuaW1hdGlvbl9lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQTBGLE1BQU0scUJBQXFCLENBQUM7QUFHeEksT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFMUUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHekQsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFdEgsdUJBQU0scUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0FBRTFELE1BQU07Ozs7O0lBS0osWUFBb0IsT0FBd0IsRUFBVSxXQUFxQztRQUF2RSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUEwQjsyQkFKekIsRUFBRTs0QkFDWixFQUFFO3VCQUN0QixFQUFFO0tBRXlEOzs7Ozs7SUFFL0YsUUFBUSxDQUFDLEVBQVUsRUFBRSxRQUErQztRQUNsRSx1QkFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO1FBQ3pCLHVCQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsTUFBTSxJQUFJLEtBQUss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LENBQUMsVUFBVSxtQkFBQyxJQUFJLENBQUMsQ0FBQyxDQUFXLEVBQUMsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNO1lBQ1IsS0FBSyxTQUFTO2dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pCLE1BQU07U0FDVDtLQUNGO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25NZXRhZGF0YVR5cGUsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgybVTdHlsZURhdGF9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQge0FzdH0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtidWlsZEFuaW1hdGlvbkFzdH0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl9hc3RfYnVpbGRlcic7XG5pbXBvcnQge2J1aWxkQW5pbWF0aW9uVGltZWxpbmVzfSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RpbWVsaW5lX2J1aWxkZXInO1xuaW1wb3J0IHtBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9ufSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuLi9kc2wvZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RU5URVJfQ0xBU1NOQU1FLCBMRUFWRV9DTEFTU05BTUV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvbkRyaXZlcn0gZnJvbSAnLi9hbmltYXRpb25fZHJpdmVyJztcbmltcG9ydCB7Z2V0T3JTZXRBc0luTWFwLCBsaXN0ZW5PblBsYXllciwgbWFrZUFuaW1hdGlvbkV2ZW50LCBub3JtYWxpemVLZXlmcmFtZXMsIG9wdGltaXplR3JvdXBQbGF5ZXJ9IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgRU1QVFlfSU5TVFJVQ1RJT05fTUFQID0gbmV3IEVsZW1lbnRJbnN0cnVjdGlvbk1hcCgpO1xuXG5leHBvcnQgY2xhc3MgVGltZWxpbmVBbmltYXRpb25FbmdpbmUge1xuICBwcml2YXRlIF9hbmltYXRpb25zOiB7W2lkOiBzdHJpbmddOiBBc3Q8QW5pbWF0aW9uTWV0YWRhdGFUeXBlPn0gPSB7fTtcbiAgcHJpdmF0ZSBfcGxheWVyc0J5SWQ6IHtbaWQ6IHN0cmluZ106IEFuaW1hdGlvblBsYXllcn0gPSB7fTtcbiAgcHVibGljIHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIHByaXZhdGUgX25vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcikge31cblxuICByZWdpc3RlcihpZDogc3RyaW5nLCBtZXRhZGF0YTogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXSkge1xuICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICBjb25zdCBhc3QgPSBidWlsZEFuaW1hdGlvbkFzdCh0aGlzLl9kcml2ZXIsIG1ldGFkYXRhLCBlcnJvcnMpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBidWlsZCB0aGUgYW5pbWF0aW9uIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczogJHtlcnJvcnMuam9pbihcIlxcblwiKX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uc1tpZF0gPSBhc3Q7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRQbGF5ZXIoXG4gICAgICBpOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBwcmVTdHlsZXM6IMm1U3R5bGVEYXRhLFxuICAgICAgcG9zdFN0eWxlcz86IMm1U3R5bGVEYXRhKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBlbGVtZW50ID0gaS5lbGVtZW50O1xuICAgIGNvbnN0IGtleWZyYW1lcyA9IG5vcm1hbGl6ZUtleWZyYW1lcyhcbiAgICAgICAgdGhpcy5fZHJpdmVyLCB0aGlzLl9ub3JtYWxpemVyLCBlbGVtZW50LCBpLmtleWZyYW1lcywgcHJlU3R5bGVzLCBwb3N0U3R5bGVzKTtcbiAgICByZXR1cm4gdGhpcy5fZHJpdmVyLmFuaW1hdGUoZWxlbWVudCwga2V5ZnJhbWVzLCBpLmR1cmF0aW9uLCBpLmRlbGF5LCBpLmVhc2luZywgW10sIHRydWUpO1xuICB9XG5cbiAgY3JlYXRlKGlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyA9IHt9KTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG4gICAgY29uc3QgYXN0ID0gdGhpcy5fYW5pbWF0aW9uc1tpZF07XG4gICAgbGV0IGluc3RydWN0aW9uczogQW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbltdO1xuXG4gICAgY29uc3QgYXV0b1N0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcblxuICAgIGlmIChhc3QpIHtcbiAgICAgIGluc3RydWN0aW9ucyA9IGJ1aWxkQW5pbWF0aW9uVGltZWxpbmVzKFxuICAgICAgICAgIHRoaXMuX2RyaXZlciwgZWxlbWVudCwgYXN0LCBFTlRFUl9DTEFTU05BTUUsIExFQVZFX0NMQVNTTkFNRSwge30sIHt9LCBvcHRpb25zLFxuICAgICAgICAgIEVNUFRZX0lOU1RSVUNUSU9OX01BUCwgZXJyb3JzKTtcbiAgICAgIGluc3RydWN0aW9ucy5mb3JFYWNoKGluc3QgPT4ge1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBnZXRPclNldEFzSW5NYXAoYXV0b1N0eWxlc01hcCwgaW5zdC5lbGVtZW50LCB7fSk7XG4gICAgICAgIGluc3QucG9zdFN0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHN0eWxlc1twcm9wXSA9IG51bGwpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9ycy5wdXNoKCdUaGUgcmVxdWVzdGVkIGFuaW1hdGlvbiBkb2VzblxcJ3QgZXhpc3Qgb3IgaGFzIGFscmVhZHkgYmVlbiBkZXN0cm95ZWQnKTtcbiAgICAgIGluc3RydWN0aW9ucyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBjcmVhdGUgdGhlIGFuaW1hdGlvbiBkdWUgdG8gdGhlIGZvbGxvd2luZyBlcnJvcnM6ICR7ZXJyb3JzLmpvaW4oXCJcXG5cIil9YCk7XG4gICAgfVxuXG4gICAgYXV0b1N0eWxlc01hcC5mb3JFYWNoKChzdHlsZXMsIGVsZW1lbnQpID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChcbiAgICAgICAgICBwcm9wID0+IHsgc3R5bGVzW3Byb3BdID0gdGhpcy5fZHJpdmVyLmNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wLCBBVVRPX1NUWUxFKTsgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwbGF5ZXJzID0gaW5zdHJ1Y3Rpb25zLm1hcChpID0+IHtcbiAgICAgIGNvbnN0IHN0eWxlcyA9IGF1dG9TdHlsZXNNYXAuZ2V0KGkuZWxlbWVudCk7XG4gICAgICByZXR1cm4gdGhpcy5fYnVpbGRQbGF5ZXIoaSwge30sIHN0eWxlcyk7XG4gICAgfSk7XG4gICAgY29uc3QgcGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKTtcbiAgICB0aGlzLl9wbGF5ZXJzQnlJZFtpZF0gPSBwbGF5ZXI7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koaWQpKTtcblxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIGRlc3Ryb3koaWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX2dldFBsYXllcihpZCk7XG4gICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICBkZWxldGUgdGhpcy5fcGxheWVyc0J5SWRbaWRdO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGxheWVyKGlkOiBzdHJpbmcpOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX3BsYXllcnNCeUlkW2lkXTtcbiAgICBpZiAoIXBsYXllcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCB0aGUgdGltZWxpbmUgcGxheWVyIHJlZmVyZW5jZWQgYnkgJHtpZH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYXllcjtcbiAgfVxuXG4gIGxpc3RlbihpZDogc3RyaW5nLCBlbGVtZW50OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSk6XG4gICAgICAoKSA9PiB2b2lkIHtcbiAgICAvLyB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlIGFyZSBhbGwgaWdub3JlZCBmb3IgdGltZWxpbmUgYW5pbWF0aW9uc1xuICAgIGNvbnN0IGJhc2VFdmVudCA9IG1ha2VBbmltYXRpb25FdmVudChlbGVtZW50LCAnJywgJycsICcnKTtcbiAgICBsaXN0ZW5PblBsYXllcih0aGlzLl9nZXRQbGF5ZXIoaWQpLCBldmVudE5hbWUsIGJhc2VFdmVudCwgY2FsbGJhY2spO1xuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuXG4gIGNvbW1hbmQoaWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKGNvbW1hbmQgPT0gJ3JlZ2lzdGVyJykge1xuICAgICAgdGhpcy5yZWdpc3RlcihpZCwgYXJnc1swXSBhcyBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjb21tYW5kID09ICdjcmVhdGUnKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gKGFyZ3NbMF0gfHwge30pIGFzIEFuaW1hdGlvbk9wdGlvbnM7XG4gICAgICB0aGlzLmNyZWF0ZShpZCwgZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5fZ2V0UGxheWVyKGlkKTtcbiAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICAgIGNhc2UgJ3BsYXknOlxuICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BhdXNlJzpcbiAgICAgICAgcGxheWVyLnBhdXNlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVzZXQnOlxuICAgICAgICBwbGF5ZXIucmVzZXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZXN0YXJ0JzpcbiAgICAgICAgcGxheWVyLnJlc3RhcnQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmaW5pc2gnOlxuICAgICAgICBwbGF5ZXIuZmluaXNoKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW5pdCc6XG4gICAgICAgIHBsYXllci5pbml0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0UG9zaXRpb24nOlxuICAgICAgICBwbGF5ZXIuc2V0UG9zaXRpb24ocGFyc2VGbG9hdChhcmdzWzBdIGFzIHN0cmluZykpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgICB0aGlzLmRlc3Ryb3koaWQpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiJdfQ==