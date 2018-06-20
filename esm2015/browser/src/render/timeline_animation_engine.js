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
     * @param {?} bodyNode
     * @param {?} _driver
     * @param {?} _normalizer
     */
    constructor(bodyNode, _driver, _normalizer) {
        this.bodyNode = bodyNode;
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
    TimelineAnimationEngine.prototype.bodyNode;
    /** @type {?} */
    TimelineAnimationEngine.prototype._driver;
    /** @type {?} */
    TimelineAnimationEngine.prototype._normalizer;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVfYW5pbWF0aW9uX2VuZ2luZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL3RpbWVsaW5lX2FuaW1hdGlvbl9lbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQU9BLE9BQU8sRUFBQyxVQUFVLEVBQTBGLE1BQU0scUJBQXFCLENBQUM7QUFHeEksT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFMUUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHekQsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFdEgsdUJBQU0scUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0FBRTFELE1BQU07Ozs7OztJQUtKLFlBQ1csVUFBdUIsT0FBd0IsRUFDOUM7UUFERCxhQUFRLEdBQVIsUUFBUTtRQUFlLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQzlDLGdCQUFXLEdBQVgsV0FBVzsyQkFOMkMsRUFBRTs0QkFDWixFQUFFO3VCQUN0QixFQUFFO0tBSWU7Ozs7OztJQUVyRCxRQUFRLENBQUMsRUFBVSxFQUFFLFFBQStDO1FBQ2xFLHVCQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7UUFDekIsdUJBQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQ1gsOERBQThELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3hGO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUM1QjtLQUNGOzs7Ozs7O0lBRU8sWUFBWSxDQUNoQixDQUErQixFQUFFLFNBQXFCLEVBQ3RELFVBQXVCO1FBQ3pCLHVCQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzFCLHVCQUFNLFNBQVMsR0FBRyxrQkFBa0IsQ0FDaEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7Ozs7Ozs7O0lBRzNGLE1BQU0sQ0FBQyxFQUFVLEVBQUUsT0FBWSxFQUFFLFVBQTRCLEVBQUU7UUFDN0QsdUJBQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQztRQUN6Qix1QkFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxxQkFBSSxZQUE0QyxDQUFDO1FBRWpELHVCQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztRQUVqRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1IsWUFBWSxHQUFHLHVCQUF1QixDQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFDN0UscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDMUIsdUJBQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDMUQsQ0FBQyxDQUFDO1NBQ0o7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztZQUNwRixZQUFZLEdBQUcsRUFBRSxDQUFDO1NBQ25CO1FBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FDWCwrREFBK0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDekY7UUFFRCxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGLENBQUMsQ0FBQztRQUVILHVCQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25DLHVCQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3pDLENBQUMsQ0FBQztRQUNILHVCQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUMvQixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDO0tBQ2Y7Ozs7O0lBRUQsT0FBTyxDQUFDLEVBQVU7UUFDaEIsdUJBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3Qix1QkFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDL0I7S0FDRjs7Ozs7SUFFTyxVQUFVLENBQUMsRUFBVTtRQUMzQix1QkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7Ozs7Ozs7O0lBR2hCLE1BQU0sQ0FBQyxFQUFVLEVBQUUsT0FBZSxFQUFFLFNBQWlCLEVBQUUsUUFBNkI7O1FBR2xGLHVCQUFNLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRCxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBRyxDQUFDO0tBQ2pCOzs7Ozs7OztJQUVELE9BQU8sQ0FBQyxFQUFVLEVBQUUsT0FBWSxFQUFFLE9BQWUsRUFBRSxJQUFXO1FBQzVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxvQkFBRSxJQUFJLENBQUMsQ0FBQyxDQUE0QyxFQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDO1NBQ1I7UUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN4Qix1QkFBTSxPQUFPLHFCQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBcUIsQ0FBQSxDQUFDO1lBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUM7U0FDUjtRQUVELHVCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEIsS0FBSyxNQUFNO2dCQUNULE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZCxLQUFLLENBQUM7WUFDUixLQUFLLE9BQU87Z0JBQ1YsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNmLEtBQUssQ0FBQztZQUNSLEtBQUssT0FBTztnQkFDVixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxDQUFDO1lBQ1IsS0FBSyxTQUFTO2dCQUNaLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxRQUFRO2dCQUNYLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxDQUFDO1lBQ1IsS0FBSyxNQUFNO2dCQUNULE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZCxLQUFLLENBQUM7WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxtQkFBQyxJQUFJLENBQUMsQ0FBQyxDQUFXLEVBQUMsQ0FBQyxDQUFDO2dCQUNsRCxLQUFLLENBQUM7WUFDUixLQUFLLFNBQVM7Z0JBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakIsS0FBSyxDQUFDO1NBQ1Q7S0FDRjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBVVRPX1NUWUxFLCBBbmltYXRpb25NZXRhZGF0YSwgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLCBBbmltYXRpb25PcHRpb25zLCBBbmltYXRpb25QbGF5ZXIsIMm1U3R5bGVEYXRhfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7YnVpbGRBbmltYXRpb25Bc3R9IGZyb20gJy4uL2RzbC9hbmltYXRpb25fYXN0X2J1aWxkZXInO1xuaW1wb3J0IHtidWlsZEFuaW1hdGlvblRpbWVsaW5lc30gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9idWlsZGVyJztcbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRJbnN0cnVjdGlvbk1hcH0gZnJvbSAnLi4vZHNsL2VsZW1lbnRfaW5zdHJ1Y3Rpb25fbWFwJztcbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge0VOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4vYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0QXNJbk1hcCwgbGlzdGVuT25QbGF5ZXIsIG1ha2VBbmltYXRpb25FdmVudCwgbm9ybWFsaXplS2V5ZnJhbWVzLCBvcHRpbWl6ZUdyb3VwUGxheWVyfSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IEVNUFRZX0lOU1RSVUNUSU9OX01BUCA9IG5ldyBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAoKTtcblxuZXhwb3J0IGNsYXNzIFRpbWVsaW5lQW5pbWF0aW9uRW5naW5lIHtcbiAgcHJpdmF0ZSBfYW5pbWF0aW9uczoge1tpZDogc3RyaW5nXTogQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT59ID0ge307XG4gIHByaXZhdGUgX3BsYXllcnNCeUlkOiB7W2lkOiBzdHJpbmddOiBBbmltYXRpb25QbGF5ZXJ9ID0ge307XG4gIHB1YmxpYyBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGJvZHlOb2RlOiBhbnksIHByaXZhdGUgX2RyaXZlcjogQW5pbWF0aW9uRHJpdmVyLFxuICAgICAgcHJpdmF0ZSBfbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyKSB7fVxuXG4gIHJlZ2lzdGVyKGlkOiBzdHJpbmcsIG1ldGFkYXRhOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdKSB7XG4gICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuICAgIGNvbnN0IGFzdCA9IGJ1aWxkQW5pbWF0aW9uQXN0KHRoaXMuX2RyaXZlciwgbWV0YWRhdGEsIGVycm9ycyk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGJ1aWxkIHRoZSBhbmltYXRpb24gZHVlIHRvIHRoZSBmb2xsb3dpbmcgZXJyb3JzOiAke2Vycm9ycy5qb2luKFwiXFxuXCIpfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hbmltYXRpb25zW2lkXSA9IGFzdDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb24sIHByZVN0eWxlczogybVTdHlsZURhdGEsXG4gICAgICBwb3N0U3R5bGVzPzogybVTdHlsZURhdGEpOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBpLmVsZW1lbnQ7XG4gICAgY29uc3Qga2V5ZnJhbWVzID0gbm9ybWFsaXplS2V5ZnJhbWVzKFxuICAgICAgICB0aGlzLl9kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIGkua2V5ZnJhbWVzLCBwcmVTdHlsZXMsIHBvc3RTdHlsZXMpO1xuICAgIHJldHVybiB0aGlzLl9kcml2ZXIuYW5pbWF0ZShlbGVtZW50LCBrZXlmcmFtZXMsIGkuZHVyYXRpb24sIGkuZGVsYXksIGkuZWFzaW5nLCBbXSwgdHJ1ZSk7XG4gIH1cblxuICBjcmVhdGUoaWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zID0ge30pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IGVycm9yczogYW55W10gPSBbXTtcbiAgICBjb25zdCBhc3QgPSB0aGlzLl9hbmltYXRpb25zW2lkXTtcbiAgICBsZXQgaW5zdHJ1Y3Rpb25zOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW107XG5cbiAgICBjb25zdCBhdXRvU3R5bGVzTWFwID0gbmV3IE1hcDxhbnksIMm1U3R5bGVEYXRhPigpO1xuXG4gICAgaWYgKGFzdCkge1xuICAgICAgaW5zdHJ1Y3Rpb25zID0gYnVpbGRBbmltYXRpb25UaW1lbGluZXMoXG4gICAgICAgICAgdGhpcy5fZHJpdmVyLCBlbGVtZW50LCBhc3QsIEVOVEVSX0NMQVNTTkFNRSwgTEVBVkVfQ0xBU1NOQU1FLCB7fSwge30sIG9wdGlvbnMsXG4gICAgICAgICAgRU1QVFlfSU5TVFJVQ1RJT05fTUFQLCBlcnJvcnMpO1xuICAgICAgaW5zdHJ1Y3Rpb25zLmZvckVhY2goaW5zdCA9PiB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IGdldE9yU2V0QXNJbk1hcChhdXRvU3R5bGVzTWFwLCBpbnN0LmVsZW1lbnQsIHt9KTtcbiAgICAgICAgaW5zdC5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKHByb3AgPT4gc3R5bGVzW3Byb3BdID0gbnVsbCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JzLnB1c2goJ1RoZSByZXF1ZXN0ZWQgYW5pbWF0aW9uIGRvZXNuXFwndCBleGlzdCBvciBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZCcpO1xuICAgICAgaW5zdHJ1Y3Rpb25zID0gW107XG4gICAgfVxuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGNyZWF0ZSB0aGUgYW5pbWF0aW9uIGR1ZSB0byB0aGUgZm9sbG93aW5nIGVycm9yczogJHtlcnJvcnMuam9pbihcIlxcblwiKX1gKTtcbiAgICB9XG5cbiAgICBhdXRvU3R5bGVzTWFwLmZvckVhY2goKHN0eWxlcywgZWxlbWVudCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKFxuICAgICAgICAgIHByb3AgPT4geyBzdHlsZXNbcHJvcF0gPSB0aGlzLl9kcml2ZXIuY29tcHV0ZVN0eWxlKGVsZW1lbnQsIHByb3AsIEFVVE9fU1RZTEUpOyB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBsYXllcnMgPSBpbnN0cnVjdGlvbnMubWFwKGkgPT4ge1xuICAgICAgY29uc3Qgc3R5bGVzID0gYXV0b1N0eWxlc01hcC5nZXQoaS5lbGVtZW50KTtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFBsYXllcihpLCB7fSwgc3R5bGVzKTtcbiAgICB9KTtcbiAgICBjb25zdCBwbGF5ZXIgPSBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpO1xuICAgIHRoaXMuX3BsYXllcnNCeUlkW2lkXSA9IHBsYXllcjtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHRoaXMuZGVzdHJveShpZCkpO1xuXG4gICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVzdHJveShpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5fZ2V0UGxheWVyKGlkKTtcbiAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgIGRlbGV0ZSB0aGlzLl9wbGF5ZXJzQnlJZFtpZF07XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRQbGF5ZXIoaWQ6IHN0cmluZyk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgY29uc3QgcGxheWVyID0gdGhpcy5fcGxheWVyc0J5SWRbaWRdO1xuICAgIGlmICghcGxheWVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIHRoZSB0aW1lbGluZSBwbGF5ZXIgcmVmZXJlbmNlZCBieSAke2lkfWApO1xuICAgIH1cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgbGlzdGVuKGlkOiBzdHJpbmcsIGVsZW1lbnQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KTpcbiAgICAgICgpID0+IHZvaWQge1xuICAgIC8vIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUgYXJlIGFsbCBpZ25vcmVkIGZvciB0aW1lbGluZSBhbmltYXRpb25zXG4gICAgY29uc3QgYmFzZUV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KGVsZW1lbnQsICcnLCAnJywgJycpO1xuICAgIGxpc3Rlbk9uUGxheWVyKHRoaXMuX2dldFBsYXllcihpZCksIGV2ZW50TmFtZSwgYmFzZUV2ZW50LCBjYWxsYmFjayk7XG4gICAgcmV0dXJuICgpID0+IHt9O1xuICB9XG5cbiAgY29tbWFuZChpZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGNvbW1hbmQ6IHN0cmluZywgYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoY29tbWFuZCA9PSAncmVnaXN0ZXInKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyKGlkLCBhcmdzWzBdIGFzIEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT0gJ2NyZWF0ZScpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSAoYXJnc1swXSB8fCB7fSkgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICAgIHRoaXMuY3JlYXRlKGlkLCBlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9nZXRQbGF5ZXIoaWQpO1xuICAgIHN3aXRjaCAoY29tbWFuZCkge1xuICAgICAgY2FzZSAncGxheSc6XG4gICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGF1c2UnOlxuICAgICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZXNldCc6XG4gICAgICAgIHBsYXllci5yZXNldCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jlc3RhcnQnOlxuICAgICAgICBwbGF5ZXIucmVzdGFydCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpbmlzaCc6XG4gICAgICAgIHBsYXllci5maW5pc2goKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgcGxheWVyLmluaXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXRQb3NpdGlvbic6XG4gICAgICAgIHBsYXllci5zZXRQb3NpdGlvbihwYXJzZUZsb2F0KGFyZ3NbMF0gYXMgc3RyaW5nKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGVzdHJveSc6XG4gICAgICAgIHRoaXMuZGVzdHJveShpZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19