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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZXhwci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2V4cHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFM0UsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUk3QixNQUFNLFVBQVUsbUJBQW1CLENBQy9CLGVBQTJDLEVBQUUsTUFBZTtJQUM5RCxNQUFNLFdBQVcsR0FBMEIsRUFBRSxDQUFDO0lBQzlDLElBQUksT0FBTyxlQUFlLElBQUksUUFBUSxFQUFFO1FBQ3RDLGVBQWUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUNwQyxHQUFHLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUMvRDtTQUFNO1FBQ0wsV0FBVyxDQUFDLElBQUksQ0FBc0IsZUFBZSxDQUFDLENBQUM7S0FDeEQ7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBRUQsU0FBUyx1QkFBdUIsQ0FDNUIsUUFBZ0IsRUFBRSxXQUFrQyxFQUFFLE1BQWU7SUFDdkUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyRCxJQUFJLE9BQU8sTUFBTSxJQUFJLFVBQVUsRUFBRTtZQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLE9BQU87U0FDUjtRQUNELFFBQVEsR0FBRyxNQUFNLENB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LENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyRjtRQUNELElBQUksQ0FBQyxRQUFRLElBQUksaUJBQWlCLElBQUksT0FBTyxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ2xFLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ25GO1FBRUQsT0FBTyxRQUFRLElBQUksUUFBUSxDQUFDO0lBQzlCLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbnZhbGlkRXhwcmVzc2lvbiwgaW52YWxpZFRyYW5zaXRpb25BbGlhc30gZnJvbSAnLi4vZXJyb3JfaGVscGVycyc7XG5cbmV4cG9ydCBjb25zdCBBTllfU1RBVEUgPSAnKic7XG5leHBvcnQgZGVjbGFyZSB0eXBlIFRyYW5zaXRpb25NYXRjaGVyRm4gPVxuICAgIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55LCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW47XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRyYW5zaXRpb25FeHByKFxuICAgIHRyYW5zaXRpb25WYWx1ZTogc3RyaW5nfFRyYW5zaXRpb25NYXRjaGVyRm4sIGVycm9yczogRXJyb3JbXSk6IFRyYW5zaXRpb25NYXRjaGVyRm5bXSB7XG4gIGNvbnN0IGV4cHJlc3Npb25zOiBUcmFuc2l0aW9uTWF0Y2hlckZuW10gPSBbXTtcbiAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uVmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICB0cmFuc2l0aW9uVmFsdWUuc3BsaXQoL1xccyosXFxzKi8pLmZvckVhY2goXG4gICAgICAgIHN0ciA9PiBwYXJzZUlubmVyVHJhbnNpdGlvblN0cihzdHIsIGV4cHJlc3Npb25zLCBlcnJvcnMpKTtcbiAgfSBlbHNlIHtcbiAgICBleHByZXNzaW9ucy5wdXNoKDxUcmFuc2l0aW9uTWF0Y2hlckZuPnRyYW5zaXRpb25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGV4cHJlc3Npb25zO1xufVxuXG5mdW5jdGlvbiBwYXJzZUlubmVyVHJhbnNpdGlvblN0cihcbiAgICBldmVudFN0cjogc3RyaW5nLCBleHByZXNzaW9uczogVHJhbnNpdGlvbk1hdGNoZXJGbltdLCBlcnJvcnM6IEVycm9yW10pIHtcbiAgaWYgKGV2ZW50U3RyWzBdID09ICc6Jykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlQW5pbWF0aW9uQWxpYXMoZXZlbnRTdHIsIGVycm9ycyk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZXhwcmVzc2lvbnMucHVzaChyZXN1bHQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBldmVudFN0ciA9IHJlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IG1hdGNoID0gZXZlbnRTdHIubWF0Y2goL14oXFwqfFstXFx3XSspXFxzKig8P1s9LV0+KVxccyooXFwqfFstXFx3XSspJC8pO1xuICBpZiAobWF0Y2ggPT0gbnVsbCB8fCBtYXRjaC5sZW5ndGggPCA0KSB7XG4gICAgZXJyb3JzLnB1c2goaW52YWxpZEV4cHJlc3Npb24oZXZlbnRTdHIpKTtcbiAgICByZXR1cm4gZXhwcmVzc2lvbnM7XG4gIH1cblxuICBjb25zdCBmcm9tU3RhdGUgPSBtYXRjaFsxXTtcbiAgY29uc3Qgc2VwYXJhdG9yID0gbWF0Y2hbMl07XG4gIGNvbnN0IHRvU3RhdGUgPSBtYXRjaFszXTtcbiAgZXhwcmVzc2lvbnMucHVzaChtYWtlTGFtYmRhRnJvbVN0YXRlcyhmcm9tU3RhdGUsIHRvU3RhdGUpKTtcblxuICBjb25zdCBpc0Z1bGxBbnlTdGF0ZUV4cHIgPSBmcm9tU3RhdGUgPT0gQU5ZX1NUQVRFICYmIHRvU3RhdGUgPT0gQU5ZX1NUQVRFO1xuICBpZiAoc2VwYXJhdG9yWzBdID09ICc8JyAmJiAhaXNGdWxsQW55U3RhdGVFeHByKSB7XG4gICAgZXhwcmVzc2lvbnMucHVzaChtYWtlTGFtYmRhRnJvbVN0YXRlcyh0b1N0YXRlLCBmcm9tU3RhdGUpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUFuaW1hdGlvbkFsaWFzKGFsaWFzOiBzdHJpbmcsIGVycm9yczogRXJyb3JbXSk6IHN0cmluZ3xUcmFuc2l0aW9uTWF0Y2hlckZuIHtcbiAgc3dpdGNoIChhbGlhcykge1xuICAgIGNhc2UgJzplbnRlcic6XG4gICAgICByZXR1cm4gJ3ZvaWQgPT4gKic7XG4gICAgY2FzZSAnOmxlYXZlJzpcbiAgICAgIHJldHVybiAnKiA9PiB2b2lkJztcbiAgICBjYXNlICc6aW5jcmVtZW50JzpcbiAgICAgIHJldHVybiAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh0b1N0YXRlKSA+IHBhcnNlRmxvYXQoZnJvbVN0YXRlKTtcbiAgICBjYXNlICc6ZGVjcmVtZW50JzpcbiAgICAgIHJldHVybiAoZnJvbVN0YXRlOiBhbnksIHRvU3RhdGU6IGFueSk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh0b1N0YXRlKSA8IHBhcnNlRmxvYXQoZnJvbVN0YXRlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgZXJyb3JzLnB1c2goaW52YWxpZFRyYW5zaXRpb25BbGlhcyhhbGlhcykpO1xuICAgICAgcmV0dXJuICcqID0+IConO1xuICB9XG59XG5cbi8vIERPIE5PVCBSRUZBQ1RPUiAuLi4ga2VlcCB0aGUgZm9sbG93IHNldCBpbnN0YW50aWF0aW9uc1xuLy8gd2l0aCB0aGUgdmFsdWVzIGludGFjdCAoY2xvc3VyZSBjb21waWxlciBmb3Igc29tZSByZWFzb25cbi8vIHJlbW92ZXMgZm9sbG93LXVwIGxpbmVzIHRoYXQgYWRkIHRoZSB2YWx1ZXMgb3V0c2lkZSBvZlxuLy8gdGhlIGNvbnN0cnVjdG9yLi4uXG5jb25zdCBUUlVFX0JPT0xFQU5fVkFMVUVTID0gbmV3IFNldDxzdHJpbmc+KFsndHJ1ZScsICcxJ10pO1xuY29uc3QgRkFMU0VfQk9PTEVBTl9WQUxVRVMgPSBuZXcgU2V0PHN0cmluZz4oWydmYWxzZScsICcwJ10pO1xuXG5mdW5jdGlvbiBtYWtlTGFtYmRhRnJvbVN0YXRlcyhsaHM6IHN0cmluZywgcmhzOiBzdHJpbmcpOiBUcmFuc2l0aW9uTWF0Y2hlckZuIHtcbiAgY29uc3QgTEhTX01BVENIX0JPT0xFQU4gPSBUUlVFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpIHx8IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpO1xuICBjb25zdCBSSFNfTUFUQ0hfQk9PTEVBTiA9IFRSVUVfQk9PTEVBTl9WQUxVRVMuaGFzKHJocykgfHwgRkFMU0VfQk9PTEVBTl9WQUxVRVMuaGFzKHJocyk7XG5cbiAgcmV0dXJuIChmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KTogYm9vbGVhbiA9PiB7XG4gICAgbGV0IGxoc01hdGNoID0gbGhzID09IEFOWV9TVEFURSB8fCBsaHMgPT0gZnJvbVN0YXRlO1xuICAgIGxldCByaHNNYXRjaCA9IHJocyA9PSBBTllfU1RBVEUgfHwgcmhzID09IHRvU3RhdGU7XG5cbiAgICBpZiAoIWxoc01hdGNoICYmIExIU19NQVRDSF9CT09MRUFOICYmIHR5cGVvZiBmcm9tU3RhdGUgPT09ICdib29sZWFuJykge1xuICAgICAgbGhzTWF0Y2ggPSBmcm9tU3RhdGUgPyBUUlVFX0JPT0xFQU5fVkFMVUVTLmhhcyhsaHMpIDogRkFMU0VfQk9PTEVBTl9WQUxVRVMuaGFzKGxocyk7XG4gICAgfVxuICAgIGlmICghcmhzTWF0Y2ggJiYgUkhTX01BVENIX0JPT0xFQU4gJiYgdHlwZW9mIHRvU3RhdGUgPT09ICdib29sZWFuJykge1xuICAgICAgcmhzTWF0Y2ggPSB0b1N0YXRlID8gVFJVRV9CT09MRUFOX1ZBTFVFUy5oYXMocmhzKSA6IEZBTFNFX0JPT0xFQU5fVkFMVUVTLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHJldHVybiBsaHNNYXRjaCAmJiByaHNNYXRjaDtcbiAgfTtcbn1cbiJdfQ==