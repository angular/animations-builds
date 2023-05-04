/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { animationFailed } from '../error_helpers';
import { ANIMATABLE_PROP_SET } from './web_animations/animatable_props_set';
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
export function normalizeKeyframes(normalizer, keyframes, preStyles = new Map(), postStyles = new Map()) {
    const errors = [];
    const normalizedKeyframes = [];
    let previousOffset = -1;
    let previousKeyframe = null;
    keyframes.forEach(kf => {
        const offset = kf.get('offset');
        const isSameOffset = offset == previousOffset;
        const normalizedKeyframe = (isSameOffset && previousKeyframe) || new Map();
        kf.forEach((val, prop) => {
            let normalizedProp = prop;
            let normalizedValue = val;
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles.get(prop);
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles.get(prop);
                        break;
                    default:
                        normalizedValue =
                            normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe.set(normalizedProp, normalizedValue);
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        throw animationFailed(errors);
    }
    return normalizedKeyframes;
}
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
            break;
        case 'done':
            player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
            break;
        case 'destroy':
            player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
            break;
    }
}
export function copyAnimationEvent(e, phaseName, player) {
    const totalTime = player.totalTime;
    const disabled = player.disabled ? true : false;
    const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    const data = e['_data'];
    if (data != null) {
        event['_data'] = data;
    }
    return event;
}
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
export function getOrSetDefaultValue(map, key, defaultValue) {
    let value = map.get(key);
    if (!value) {
        map.set(key, value = defaultValue);
    }
    return value;
}
export function parseTimelineCommand(command) {
    const separatorPos = command.indexOf(':');
    const id = command.substring(1, separatorPos);
    const action = command.slice(separatorPos + 1);
    return [id, action];
}
const documentElement = 
/* @__PURE__ */ (() => typeof document === 'undefined' ? null : document.documentElement)();
export function getParentElement(element) {
    const parent = element.parentNode || element.host || null; // consider host to support shadow DOM
    if (parent === documentElement) {
        return null;
    }
    return parent;
}
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
let _CACHED_BODY = null;
let _IS_WEBKIT = false;
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = _CACHED_BODY.style ? ('WebkitAppearance' in _CACHED_BODY.style) : false;
    }
    let result = true;
    if (_CACHED_BODY.style && !containsVendorPrefix(prop)) {
        result = prop in _CACHED_BODY.style;
        if (!result && _IS_WEBKIT) {
            const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.slice(1);
            result = camelProp in _CACHED_BODY.style;
        }
    }
    return result;
}
export function validateWebAnimatableStyleProperty(prop) {
    return ANIMATABLE_PROP_SET.has(prop);
}
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
export function containsElement(elm1, elm2) {
    while (elm2) {
        if (elm2 === elm1) {
            return true;
        }
        elm2 = getParentElement(elm2);
    }
    return false;
}
export function invokeQuery(element, selector, multi) {
    if (multi) {
        return Array.from(element.querySelectorAll(selector));
    }
    const elem = element.querySelector(selector);
    return elem ? [elem] : [];
}
export function hypenatePropsKeys(original) {
    const newMap = new Map();
    original.forEach((val, prop) => {
        const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newMap.set(newProp, val);
    });
    return newMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBa0MsVUFBVSxFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQWdCLE1BQU0scUJBQXFCLENBQUM7QUFHcEssT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBRTFFLE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxPQUEwQjtJQUM1RCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEI7WUFDRSxPQUFPLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0M7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUM5QixVQUFvQyxFQUFFLFNBQStCLEVBQ3JFLFlBQTJCLElBQUksR0FBRyxFQUFFLEVBQ3BDLGFBQTRCLElBQUksR0FBRyxFQUFFO0lBQ3ZDLE1BQU0sTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUMzQixNQUFNLG1CQUFtQixHQUF5QixFQUFFLENBQUM7SUFDckQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEIsSUFBSSxnQkFBZ0IsR0FBdUIsSUFBSSxDQUFDO0lBQ2hELFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDckIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENB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QUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFFBQXVCO0lBQ3ZELE1BQU0sTUFBTSxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uRXZlbnQsIEFuaW1hdGlvblBsYXllciwgQVVUT19TVFlMRSwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YU1hcH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi8uLi9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHthbmltYXRpb25GYWlsZWR9IGZyb20gJy4uL2Vycm9yX2hlbHBlcnMnO1xuXG5pbXBvcnQge0FOSU1BVEFCTEVfUFJPUF9TRVR9IGZyb20gJy4vd2ViX2FuaW1hdGlvbnMvYW5pbWF0YWJsZV9wcm9wc19zZXQnO1xuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgbm9ybWFsaXplcjogQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyLCBrZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPixcbiAgICBwcmVTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpLFxuICAgIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpKTogQXJyYXk8ybVTdHlsZURhdGFNYXA+IHtcbiAgY29uc3QgZXJyb3JzOiBFcnJvcltdID0gW107XG4gIGNvbnN0IG5vcm1hbGl6ZWRLZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPiA9IFtdO1xuICBsZXQgcHJldmlvdXNPZmZzZXQgPSAtMTtcbiAgbGV0IHByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhTWFwfG51bGwgPSBudWxsO1xuICBrZXlmcmFtZXMuZm9yRWFjaChrZiA9PiB7XG4gICAgY29uc3Qgb2Zmc2V0ID0ga2YuZ2V0KCdvZmZzZXQnKSBhcyBudW1iZXI7XG4gICAgY29uc3QgaXNTYW1lT2Zmc2V0ID0gb2Zmc2V0ID09IHByZXZpb3VzT2Zmc2V0O1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRLZXlmcmFtZTogybVTdHlsZURhdGFNYXAgPSAoaXNTYW1lT2Zmc2V0ICYmIHByZXZpb3VzS2V5ZnJhbWUpIHx8IG5ldyBNYXAoKTtcbiAgICBrZi5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICAgIGxldCBub3JtYWxpemVkUHJvcCA9IHByb3A7XG4gICAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0gdmFsO1xuICAgICAgaWYgKHByb3AgIT09ICdvZmZzZXQnKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplci5ub3JtYWxpemVQcm9wZXJ0eU5hbWUobm9ybWFsaXplZFByb3AsIGVycm9ycyk7XG4gICAgICAgIHN3aXRjaCAobm9ybWFsaXplZFZhbHVlKSB7XG4gICAgICAgICAgY2FzZSBQUkVfU1RZTEU6XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSBwcmVTdHlsZXMuZ2V0KHByb3ApITtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBBVVRPX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcG9zdFN0eWxlcy5nZXQocHJvcCkhO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID1cbiAgICAgICAgICAgICAgICBub3JtYWxpemVyLm5vcm1hbGl6ZVN0eWxlVmFsdWUocHJvcCwgbm9ybWFsaXplZFByb3AsIG5vcm1hbGl6ZWRWYWx1ZSwgZXJyb3JzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWUuc2V0KG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUpO1xuICAgIH0pO1xuICAgIGlmICghaXNTYW1lT2Zmc2V0KSB7XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWVzLnB1c2gobm9ybWFsaXplZEtleWZyYW1lKTtcbiAgICB9XG4gICAgcHJldmlvdXNLZXlmcmFtZSA9IG5vcm1hbGl6ZWRLZXlmcmFtZTtcbiAgICBwcmV2aW91c09mZnNldCA9IG9mZnNldDtcbiAgfSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgYW5pbWF0aW9uRmFpbGVkKGVycm9ycyk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICAgIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEFuaW1hdGlvbkV2ZW50fHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueSkge1xuICBzd2l0Y2ggKGV2ZW50TmFtZSkge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ3N0YXJ0JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG9uZSc6XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2RvbmUnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXN0cm95JzpcbiAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZGVzdHJveScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5QW5pbWF0aW9uRXZlbnQoXG4gICAgZTogQW5pbWF0aW9uRXZlbnQsIHBoYXNlTmFtZTogc3RyaW5nLCBwbGF5ZXI6IEFuaW1hdGlvblBsYXllcik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgY29uc3QgdG90YWxUaW1lID0gcGxheWVyLnRvdGFsVGltZTtcbiAgY29uc3QgZGlzYWJsZWQgPSAocGxheWVyIGFzIGFueSkuZGlzYWJsZWQgPyB0cnVlIDogZmFsc2U7XG4gIGNvbnN0IGV2ZW50ID0gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgZS5lbGVtZW50LCBlLnRyaWdnZXJOYW1lLCBlLmZyb21TdGF0ZSwgZS50b1N0YXRlLCBwaGFzZU5hbWUgfHwgZS5waGFzZU5hbWUsXG4gICAgICB0b3RhbFRpbWUgPT0gdW5kZWZpbmVkID8gZS50b3RhbFRpbWUgOiB0b3RhbFRpbWUsIGRpc2FibGVkKTtcbiAgY29uc3QgZGF0YSA9IChlIGFzIGFueSlbJ19kYXRhJ107XG4gIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAoZXZlbnQgYXMgYW55KVsnX2RhdGEnXSA9IGRhdGE7XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUFuaW1hdGlvbkV2ZW50KFxuICAgIGVsZW1lbnQ6IGFueSwgdHJpZ2dlck5hbWU6IHN0cmluZywgZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgcGhhc2VOYW1lOiBzdHJpbmcgPSAnJyxcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDAsIGRpc2FibGVkPzogYm9vbGVhbik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgcmV0dXJuIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwaGFzZU5hbWUsIHRvdGFsVGltZSwgZGlzYWJsZWQ6ICEhZGlzYWJsZWR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0VmFsdWU8VCwgVj4obWFwOiBNYXA8VCwgVj4sIGtleTogVCwgZGVmYXVsdFZhbHVlOiBWKSB7XG4gIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSA9IGRlZmF1bHRWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lbGluZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIGNvbnN0IHNlcGFyYXRvclBvcyA9IGNvbW1hbmQuaW5kZXhPZignOicpO1xuICBjb25zdCBpZCA9IGNvbW1hbmQuc3Vic3RyaW5nKDEsIHNlcGFyYXRvclBvcyk7XG4gIGNvbnN0IGFjdGlvbiA9IGNvbW1hbmQuc2xpY2Uoc2VwYXJhdG9yUG9zICsgMSk7XG4gIHJldHVybiBbaWQsIGFjdGlvbl07XG59XG5cbmNvbnN0IGRvY3VtZW50RWxlbWVudDogSFRNTEVsZW1lbnR8bnVsbCA9XG4gICAgLyogQF9fUFVSRV9fICovICgoKSA9PiB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogYW55KTogdW5rbm93bnxudWxsIHtcbiAgY29uc3QgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlIHx8IGVsZW1lbnQuaG9zdCB8fCBudWxsOyAgLy8gY29uc2lkZXIgaG9zdCB0byBzdXBwb3J0IHNoYWRvdyBET01cbiAgaWYgKHBhcmVudCA9PT0gZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHBhcmVudDtcbn1cblxuZnVuY3Rpb24gY29udGFpbnNWZW5kb3JQcmVmaXgocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFdlYmtpdCBpcyB0aGUgb25seSByZWFsIHBvcHVsYXIgdmVuZG9yIHByZWZpeCBub3dhZGF5c1xuICAvLyBjYzogaHR0cDovL3Nob3VsZGlwcmVmaXguY29tL1xuICByZXR1cm4gcHJvcC5zdWJzdHJpbmcoMSwgNikgPT0gJ2Via2l0JzsgIC8vIHdlYmtpdCBvciBXZWJraXRcbn1cblxubGV0IF9DQUNIRURfQk9EWToge3N0eWxlOiBhbnl9fG51bGwgPSBudWxsO1xubGV0IF9JU19XRUJLSVQgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX0NBQ0hFRF9CT0RZKSB7XG4gICAgX0NBQ0hFRF9CT0RZID0gZ2V0Qm9keU5vZGUoKSB8fCB7fTtcbiAgICBfSVNfV0VCS0lUID0gX0NBQ0hFRF9CT0RZIS5zdHlsZSA/ICgnV2Via2l0QXBwZWFyYW5jZScgaW4gX0NBQ0hFRF9CT0RZIS5zdHlsZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBpZiAoX0NBQ0hFRF9CT0RZIS5zdHlsZSAmJiAhY29udGFpbnNWZW5kb3JQcmVmaXgocHJvcCkpIHtcbiAgICByZXN1bHQgPSBwcm9wIGluIF9DQUNIRURfQk9EWSEuc3R5bGU7XG4gICAgaWYgKCFyZXN1bHQgJiYgX0lTX1dFQktJVCkge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gJ1dlYmtpdCcgKyBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKTtcbiAgICAgIHJlc3VsdCA9IGNhbWVsUHJvcCBpbiBfQ0FDSEVEX0JPRFkhLnN0eWxlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVdlYkFuaW1hdGFibGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQU5JTUFUQUJMRV9QUk9QX1NFVC5oYXMocHJvcCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2R5Tm9kZSgpOiBhbnl8bnVsbCB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuYm9keTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICB3aGlsZSAoZWxtMikge1xuICAgIGlmIChlbG0yID09PSBlbG0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxtMiA9IGdldFBhcmVudEVsZW1lbnQoZWxtMik7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlUXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdIHtcbiAgaWYgKG11bHRpKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gIH1cbiAgY29uc3QgZWxlbSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIHJldHVybiBlbGVtID8gW2VsZW1dIDogW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoeXBlbmF0ZVByb3BzS2V5cyhvcmlnaW5hbDogybVTdHlsZURhdGFNYXApOiDJtVN0eWxlRGF0YU1hcCB7XG4gIGNvbnN0IG5ld01hcDogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCk7XG4gIG9yaWdpbmFsLmZvckVhY2goKHZhbCwgcHJvcCkgPT4ge1xuICAgIGNvbnN0IG5ld1Byb3AgPSBwcm9wLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpO1xuICAgIG5ld01hcC5zZXQobmV3UHJvcCwgdmFsKTtcbiAgfSk7XG4gIHJldHVybiBuZXdNYXA7XG59XG4iXX0=