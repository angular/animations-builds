/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ EMPTY_ANIMATION_OPTIONS = {};
/**
 * @record
 */
export function AstVisitor() { }
function AstVisitor_tsickle_Closure_declarations() {
    /** @type {?} */
    AstVisitor.prototype.visitTrigger;
    /** @type {?} */
    AstVisitor.prototype.visitState;
    /** @type {?} */
    AstVisitor.prototype.visitTransition;
    /** @type {?} */
    AstVisitor.prototype.visitSequence;
    /** @type {?} */
    AstVisitor.prototype.visitGroup;
    /** @type {?} */
    AstVisitor.prototype.visitAnimate;
    /** @type {?} */
    AstVisitor.prototype.visitStyle;
    /** @type {?} */
    AstVisitor.prototype.visitKeyframes;
    /** @type {?} */
    AstVisitor.prototype.visitReference;
    /** @type {?} */
    AstVisitor.prototype.visitAnimateChild;
    /** @type {?} */
    AstVisitor.prototype.visitAnimateRef;
    /** @type {?} */
    AstVisitor.prototype.visitQuery;
    /** @type {?} */
    AstVisitor.prototype.visitStagger;
}
// unsupported: template constraints.
/**
 * @record
 * @template T
 */
export function Ast() { }
function Ast_tsickle_Closure_declarations() {
    /** @type {?} */
    Ast.prototype.type;
    /** @type {?} */
    Ast.prototype.options;
}
/**
 * @record
 */
export function TriggerAst() { }
function TriggerAst_tsickle_Closure_declarations() {
    /** @type {?} */
    TriggerAst.prototype.type;
    /** @type {?} */
    TriggerAst.prototype.name;
    /** @type {?} */
    TriggerAst.prototype.states;
    /** @type {?} */
    TriggerAst.prototype.transitions;
    /** @type {?} */
    TriggerAst.prototype.queryCount;
    /** @type {?} */
    TriggerAst.prototype.depCount;
}
/**
 * @record
 */
export function StateAst() { }
function StateAst_tsickle_Closure_declarations() {
    /** @type {?} */
    StateAst.prototype.type;
    /** @type {?} */
    StateAst.prototype.name;
    /** @type {?} */
    StateAst.prototype.style;
}
/**
 * @record
 */
export function TransitionAst() { }
function TransitionAst_tsickle_Closure_declarations() {
    /** @type {?} */
    TransitionAst.prototype.matchers;
    /** @type {?} */
    TransitionAst.prototype.animation;
    /** @type {?} */
    TransitionAst.prototype.queryCount;
    /** @type {?} */
    TransitionAst.prototype.depCount;
}
/**
 * @record
 */
export function SequenceAst() { }
function SequenceAst_tsickle_Closure_declarations() {
    /** @type {?} */
    SequenceAst.prototype.steps;
}
/**
 * @record
 */
export function GroupAst() { }
function GroupAst_tsickle_Closure_declarations() {
    /** @type {?} */
    GroupAst.prototype.steps;
}
/**
 * @record
 */
export function AnimateAst() { }
function AnimateAst_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimateAst.prototype.timings;
    /** @type {?} */
    AnimateAst.prototype.style;
}
/**
 * @record
 */
export function StyleAst() { }
function StyleAst_tsickle_Closure_declarations() {
    /** @type {?} */
    StyleAst.prototype.styles;
    /** @type {?} */
    StyleAst.prototype.easing;
    /** @type {?} */
    StyleAst.prototype.offset;
    /** @type {?} */
    StyleAst.prototype.containsDynamicStyles;
    /** @type {?|undefined} */
    StyleAst.prototype.isEmptyStep;
}
/**
 * @record
 */
export function KeyframesAst() { }
function KeyframesAst_tsickle_Closure_declarations() {
    /** @type {?} */
    KeyframesAst.prototype.styles;
}
/**
 * @record
 */
export function ReferenceAst() { }
function ReferenceAst_tsickle_Closure_declarations() {
    /** @type {?} */
    ReferenceAst.prototype.animation;
}
/**
 * @record
 */
export function AnimateChildAst() { }
function AnimateChildAst_tsickle_Closure_declarations() {
}
/**
 * @record
 */
export function AnimateRefAst() { }
function AnimateRefAst_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimateRefAst.prototype.animation;
}
/**
 * @record
 */
export function QueryAst() { }
function QueryAst_tsickle_Closure_declarations() {
    /** @type {?} */
    QueryAst.prototype.selector;
    /** @type {?} */
    QueryAst.prototype.limit;
    /** @type {?} */
    QueryAst.prototype.optional;
    /** @type {?} */
    QueryAst.prototype.includeSelf;
    /** @type {?} */
    QueryAst.prototype.animation;
    /** @type {?} */
    QueryAst.prototype.originalSelector;
}
/**
 * @record
 */
export function StaggerAst() { }
function StaggerAst_tsickle_Closure_declarations() {
    /** @type {?} */
    StaggerAst.prototype.timings;
    /** @type {?} */
    StaggerAst.prototype.animation;
}
/**
 * @record
 */
export function TimingAst() { }
function TimingAst_tsickle_Closure_declarations() {
    /** @type {?} */
    TimingAst.prototype.duration;
    /** @type {?} */
    TimingAst.prototype.delay;
    /** @type {?} */
    TimingAst.prototype.easing;
    /** @type {?|undefined} */
    TimingAst.prototype.dynamic;
}
/**
 * @record
 */
export function DynamicTimingAst() { }
function DynamicTimingAst_tsickle_Closure_declarations() {
    /** @type {?} */
    DynamicTimingAst.prototype.strValue;
    /** @type {?} */
    DynamicTimingAst.prototype.dynamic;
}
//# sourceMappingURL=animation_ast.js.map