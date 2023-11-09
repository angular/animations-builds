/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { invalidExpression, invalidTransitionAlias } from '../error_helpers';
export const ANY_STATE = '*';
export function parseTransitionExpr(transitionValue, errors) {
    const expressions = [];
    if (typeof transitionValue == 'string') {
        transitionValue.split(/\s*,\s*/).forEach(str => parseInnerTransitionStr(str, expressions, errors));
    }
    else {
        expressions.push(transitionValue);
    }
    return expressions;
}
function parseInnerTransitionStr(eventStr, expressions, errors) {
    if (eventStr[0] == ':') {
        const result = parseAnimationAlias(eventStr, errors);
        if (typeof result == 'function') {
            expressions.push(result);
            return;
        }
        eventStr = result;
    }
    const match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
    if (match == null || match.length < 4) {
        errors.push(invalidExpression(eventStr));
        return expressions;
    }
    const fromState = match[1];
    const separator = match[2];
    const toState = match[3];
    expressions.push(makeLambdaFromStates(fromState, toState));
    const isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
    if (separator[0] == '<' && !isFullAnyStateExpr) {
        expressions.push(makeLambdaFromStates(toState, fromState));
    }
    return;
}
function parseAnimationAlias(alias, errors) {
    switch (alias) {
        case ':enter':
            return 'void => *';
        case ':leave':
            return '* => void';
        case ':increment':
            return (fromState, toState) => parseFloat(toState) > parseFloat(fromState);
        case ':decrement':
            return (fromState, toState) => parseFloat(toState) < parseFloat(fromState);
        default:
            errors.push(invalidTransitionAlias(alias));
            return '* => *';
    }
}
// DO NOT REFACTOR ... keep the follow set instantiations
// with the values intact (closure compiler for some reason
// removes follow-up lines that add the values outside of
// the constructor...
const TRUE_BOOLEAN_VALUES = new Set(['true', '1']);
const FALSE_BOOLEAN_VALUES = new Set(['false', '0']);
function makeLambdaFromStates(lhs, rhs) {
    const LHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(lhs) || FALSE_BOOLEAN_VALUES.has(lhs);
    const RHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(rhs) || FALSE_BOOLEAN_VALUES.has(rhs);
    return (fromState, toState) => {
        let lhsMatch = lhs == ANY_STATE || lhs == fromState;
        let rhsMatch = rhs == ANY_STATE || rhs == toState;
        if (!lhsMatch && LHS_MATCH_BOOLEAN && typeof fromState === 'boolean') {
            lhsMatch = fromState ? TRUE_BOOLEAN_VALUES.has(lhs) : FALSE_BOOLEAN_VALUES.has(lhs);
        }
        if (!rhsMatch && RHS_MATCH_BOOLEAN && typeof toState === 'boolean') {
            rhsMatch = toState ? TRUE_BOOLEAN_VALUES.has(rhs) : FALSE_BOOLEAN_VALUES.has(rhs);
        }
        return lhsMatch && rhsMatch;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZXhwci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2V4cHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFM0UsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUk3QixNQUFNLFVBQVUsbUJBQW1CLENBQy9CLGVBQTJDLEVBQUUsTUFBZTtJQUM5RCxNQUFNLFdBQVcsR0FBMEIsRUFBRSxDQUFDO0lBQzlDLElBQUksT0FBTyxlQUFlLElBQUksUUFBUSxFQUFFLENBQUM7UUFDdkMsZUFBZSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQ3BDLEdBQUcsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7U0FBTSxDQUFDO1FBQ04sV0FBVyxDQUFDLElBQUksQ0FBc0IsZUFBZSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUM1QixRQUFnQixFQUFFLFdBQWtDLEVBQUUsTUFBZTtJQUN2RSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsSUFBSSxPQUFPLE1BQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNoQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLE9B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QUssU0FBUyxFQUFFLENBQUM7WUFDckUsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLElBQUksaUJBQWlCLElBQUksT0FBTyxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbkUsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVELE9BQU8sUUFBUSxJQUFJLFFBQVEsQ0FBQztJQUM5QixDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW52YWxpZEV4cHJlc3Npb24sIGludmFsaWRUcmFuc2l0aW9uQWxpYXN9IGZyb20gJy4uL2Vycm9yX2hlbHBlcnMnO1xuXG5leHBvcnQgY29uc3QgQU5ZX1NUQVRFID0gJyonO1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBUcmFuc2l0aW9uTWF0Y2hlckZuID1cbiAgICAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSwgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuO1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUcmFuc2l0aW9uRXhwcihcbiAgICB0cmFuc2l0aW9uVmFsdWU6IHN0cmluZ3xUcmFuc2l0aW9uTWF0Y2hlckZuLCBlcnJvcnM6IEVycm9yW10pOiBUcmFuc2l0aW9uTWF0Y2hlckZuW10ge1xuICBjb25zdCBleHByZXNzaW9uczogVHJhbnNpdGlvbk1hdGNoZXJGbltdID0gW107XG4gIGlmICh0eXBlb2YgdHJhbnNpdGlvblZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgdHJhbnNpdGlvblZhbHVlLnNwbGl0KC9cXHMqLFxccyovKS5mb3JFYWNoKFxuICAgICAgICBzdHIgPT4gcGFyc2VJbm5lclRyYW5zaXRpb25TdHIoc3RyLCBleHByZXNzaW9ucywgZXJyb3JzKSk7XG4gIH0gZWxzZSB7XG4gICAgZXhwcmVzc2lvbnMucHVzaCg8VHJhbnNpdGlvbk1hdGNoZXJGbj50cmFuc2l0aW9uVmFsdWUpO1xuICB9XG4gIHJldHVybiBleHByZXNzaW9ucztcbn1cblxuZnVuY3Rpb24gcGFyc2VJbm5lclRyYW5zaXRpb25TdHIoXG4gICAgZXZlbnRTdHI6IHN0cmluZywgZXhwcmVzc2lvbnM6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSwgZXJyb3JzOiBFcnJvcltdKSB7XG4gIGlmIChldmVudFN0clswXSA9PSAnOicpIHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZUFuaW1hdGlvbkFsaWFzKGV2ZW50U3RyLCBlcnJvcnMpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgIGV4cHJlc3Npb25zLnB1c2gocmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnRTdHIgPSByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBtYXRjaCA9IGV2ZW50U3RyLm1hdGNoKC9eKFxcKnxbLVxcd10rKVxccyooPD9bPS1dPilcXHMqKFxcKnxbLVxcd10rKSQvKTtcbiAgaWYgKG1hdGNoID09IG51bGwgfHwgbWF0Y2gubGVuZ3RoIDwgNCkge1xuICAgIGVycm9ycy5wdXNoKGludmFsaWRFeHByZXNzaW9uKGV2ZW50U3RyKSk7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25zO1xuICB9XG5cbiAgY29uc3QgZnJvbVN0YXRlID0gbWF0Y2hbMV07XG4gIGNvbnN0IHNlcGFyYXRvciA9IG1hdGNoWzJdO1xuICBjb25zdCB0b1N0YXRlID0gbWF0Y2hbM107XG4gIGV4cHJlc3Npb25zLnB1c2gobWFrZUxhbWJkYUZyb21TdGF0ZXMoZnJvbVN0YXRlLCB0b1N0YXRlKSk7XG5cbiAgY29uc3QgaXNGdWxsQW55U3RhdGVFeHByID0gZnJvbVN0YXRlID09IEFOWV9TVEFURSAmJiB0b1N0YXRlID09IEFOWV9TVEFURTtcbiAgaWYgKHNlcGFyYXRvclswXSA9PSAnPCcgJiYgIWlzRnVsbEFueVN0YXRlRXhwcikge1xuICAgIGV4cHJlc3Npb25zLnB1c2gobWFrZUxhbWJkYUZyb21TdGF0ZXModG9TdGF0ZSwgZnJvbVN0YXRlKSk7XG4gIH1cbiAgcmV0dXJuO1xufVxuXG5mdW5jdGlvbiBwYXJzZUFuaW1hdGlvbkFsaWFzKGFsaWFzOiBzdHJpbmcsIGVycm9yczogRXJyb3JbXSk6IHN0cmluZ3xUcmFuc2l0aW9uTWF0Y2hlckZuIHtcbiAgc3dpdGNoIChhbGlhcykge1xuICAgIGNhc2UgJzplbnRlcic6XG4gICAgICByZXR1cm4gJ3ZvaWQgPT4gKic7XG4gICAgY2FzZSAnOmxlYXZlJzpcbiAgICAgIHJldHVybiAnKiA9PiB2b2lkJztcbiAgICBjYXNlICc6aW5jcmVtZW50JzpcbiAgICAgIHJldHVybiAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh0b1N0YXRlKSA+IHBhcnNlRmxvYXQoZnJvbVN0YXRlKTtcbiAgICBjYXNlICc6ZGVjcmVtZW50JzpcbiAgICAgIHJldHVybiAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh0b1N0YXRlKSA8IHBhcnNlRmxvYXQoZnJvbVN0YXRlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgZXJyb3JzLnB1c2goaW52YWxpZFRyYW5zaXRpb25BbGlhcyhhbGlhcykpO1xuICAgICAgcmV0dXJuICcqID0+IConO1xuICB9XG59XG5cbi8vIERPIE5PVCBSRUZBQ1RPUiAuLi4ga2VlcCB0aGUgZm9sbG93IHNldCBpbnN0YW50aWF0aW9uc1xuLy8gd2l0aCB0aGUgdmFsdWVzIGludGFjdCAoY2xvc3VyZSBjb21waWxlciBmb3Igc29tZSByZWFzb25cbi8vIHJlbW92ZXMgZm9sbG93LXVwIGxpbmVzIHRoYXQgYWRkIHRoZSB2YWx1ZXMgb3V0c2lkZSBvZlxuLy8gdGhlIGNvbnN0cnVjdG9yLi4uXG5jb25zdCBUUlVFX0JPT0xFQU5fVkFMVUVTID0gbmV3IFNldDxzdHJpbmc+KFsndHJ1ZScsICcxJ10pO1xuY29uc3QgRkFMU0VfQk9PTEVBTl9WQUxVRVMgPSBuZXcgU2V0PHN0cmluZz4oWydmYWxzZScsICcwJ10pO1xuXG5mdW5jdGlvbiBtYWtlTGFtYmRhRnJvbVN0YXRlcyhsaHM6IHN0cmluZywgcmhzOiBzdHJpbmcpOiBUcmFuc2l0aW9uTWF0Y2hlckZuIHtcbiAgY29uc3QgTEhTX01BVENIX0JPT0xFQU4gPSBUUlVFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpIHx8IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpO1xuICBjb25zdCBSSFNfTUFUQ0hfQk9PTEVBTiA9IFRSVUVfQk9PTEVBTl9WQUxVRVMuaGFzKHJocykgfHwgRkFMU0VfQk9PTEVBTl9WQUxVRVMuaGFzKHJocyk7XG5cbiAgcmV0dXJuIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KTogYm9vbGVhbiA9PiB7XG4gICAgbGV0IGxoc01hdGNoID0gbGhzID09IEFOWV9TVEFURSB8fCBsaHMgPT0gZnJvbVN0YXRlO1xuICAgIGxldCByaHNNYXRjaCA9IHJocyA9PSBBTllfU1RBVEUgfHwgcmhzID09IHRvU3RhdGU7XG5cbiAgICBpZiAoIWxoc01hdGNoICYmIExIU19NQVRDSF9CT09MRUFOICYmIHR5cGVvZiBmcm9tU3RhdGUgPT09ICdib29sZWFuJykge1xuICAgICAgbGhzTWF0Y2ggPSBmcm9tU3RhdGUgPyBUUlVFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpIDogRkFMU0VfQk9PTEVBTl9WQUxVRVMuaGFzKGxocyk7XG4gICAgfVxuICAgIGlmICghcmhzTWF0Y2ggJiYgUkhTX01BVENIX0JPT0xFQU4gJiYgdHlwZW9mIHRvU3RhdGUgPT09ICdib29sZWFuJykge1xuICAgICAgcmhzTWF0Y2ggPSB0b1N0YXRlID8gVFJVRV9CT09MRUFOX1ZBTFVFUy5oYXMocmhzKSA6IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHJldHVybiBsaHNNYXRjaCAmJiByaHNNYXRjaDtcbiAgfTtcbn1cbiJdfQ==