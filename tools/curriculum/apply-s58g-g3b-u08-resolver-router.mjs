import { readFileSync, writeFileSync } from "node:fs";

function replaceExactly(path, oldText, newText) {
  let text = readFileSync(path, "utf8");
  const count = text.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${path}: expected replacement count 1, got ${count}`);
  text = text.replace(oldText, newText);
  writeFileSync(path, text, "utf8");
}

const resolver = "site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
replaceExactly(
  resolver,
  `export const G3B_U04_RESOLVER_BROWSER_STATE_INTEGRATION = Object.freeze({
  task: "S57F3_G3B_U04_ResolverAndBrowserStateIntegration",
  sourceId: "g3b_u04_3b04",
  status: "resolver_and_browser_state_integrated_router_not_promoted",
  allocationStrategy: "balanced_by_group_then_family",
  supportedSelectionModes: Object.freeze([
    BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
  ]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionCount",
    "ordering",
    "includeAnswerKey"
  ]),
  publicHiddenModeFlagAllowed: false,
  canonicalRouterChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration"
});

const G3B_U04_SOURCE_ID = "g3b_u04_3b04";`,
  `export const G3B_U04_RESOLVER_BROWSER_STATE_INTEGRATION = Object.freeze({
  task: "S57F3_G3B_U04_ResolverAndBrowserStateIntegration",
  sourceId: "g3b_u04_3b04",
  status: "resolver_and_browser_state_integrated_router_not_promoted",
  allocationStrategy: "balanced_by_group_then_family",
  supportedSelectionModes: Object.freeze([
    BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
  ]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionCount",
    "ordering",
    "includeAnswerKey"
  ]),
  publicHiddenModeFlagAllowed: false,
  canonicalRouterChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration"
});

export const G3B_U08_RESOLVER_BROWSER_STATE_INTEGRATION = Object.freeze({
  task: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration",
  sourceId: "g3b_u08_3b08",
  status: "resolver_browser_state_and_canonical_router_integrated_worksheet_gate_pending",
  allocationStrategy: "balanced_by_group_then_family",
  supportedSelectionModes: Object.freeze([
    BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
  ]),
  browserStateFields: Object.freeze([
    "selectionMode",
    "selectedKnowledgePointIds",
    "selectedPatternGroupIds",
    "questionCount",
    "ordering",
    "includeAnswerKey"
  ]),
  applicationOnly: true,
  publicNumericModeAdded: false,
  representationToggleAdded: false,
  publicHiddenModeFlagAllowed: false,
  canonicalRouterChanged: true,
  productionEligibilityChanged: false,
  worksheetRendererChanged: false,
  requiredNextGate: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration"
});

const G3B_U04_SOURCE_ID = "g3b_u04_3b04";
const G3B_U08_SOURCE_ID = "g3b_u08_3b08";`
);
replaceExactly(
  resolver,
  `const MULTISPEC_ALLOCATION_SOURCE_IDS = Object.freeze(new Set([
  "g3a_u01_3a01",
  G3B_U04_SOURCE_ID,
  "g4a_u08_4a08"
]));`,
  `const MULTISPEC_ALLOCATION_SOURCE_IDS = Object.freeze(new Set([
  "g3a_u01_3a01",
  G3B_U04_SOURCE_ID,
  G3B_U08_SOURCE_ID,
  "g4a_u08_4a08"
]));
const HIERARCHICAL_ALLOCATION_SOURCE_IDS = Object.freeze(new Set([
  G3B_U04_SOURCE_ID,
  G3B_U08_SOURCE_ID
]));
const STRICT_VISIBLE_SELECTION_SOURCE_IDS = Object.freeze(new Set([
  G3B_U04_SOURCE_ID,
  G3B_U08_SOURCE_ID
]));`
);
replaceExactly(
  resolver,
  `function allocateEvenly({ patternGroups, patternSpecIdsByGroup, questionCount }) {
  const isG3BU04Selection = patternGroups.length > 0
    && patternGroups.every((group) => group.sourceId === G3B_U04_SOURCE_ID);
  return isG3BU04Selection
    ? allocateByGroupThenFamily({ patternGroups, patternSpecIdsByGroup, questionCount })
    : allocateFlatEvenly({ patternGroups, patternSpecIdsByGroup, questionCount });
}`,
  `function allocateEvenly({ patternGroups, patternSpecIdsByGroup, questionCount }) {
  const sourceIds = new Set(patternGroups.map((group) => group.sourceId));
  const useHierarchicalAllocation = sourceIds.size === 1
    && HIERARCHICAL_ALLOCATION_SOURCE_IDS.has([...sourceIds][0]);
  return useHierarchicalAllocation
    ? allocateByGroupThenFamily({ patternGroups, patternSpecIdsByGroup, questionCount })
    : allocateFlatEvenly({ patternGroups, patternSpecIdsByGroup, questionCount });
}`
);
replaceExactly(
  resolver,
  `  const strictSelection = sourceIds.length === 1 && sourceIds[0] === G3B_U04_SOURCE_ID;`,
  `  const strictSelection = sourceIds.length === 1 && STRICT_VISIBLE_SELECTION_SOURCE_IDS.has(sourceIds[0]);`
);

const validator = "site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
replaceExactly(
  validator,
  `function validateStage2(question, spec) {
  const errors = [];`,
  `function isHiddenPrePromotionLifecycle(question) {
  return question.selectorStatus === "hidden"
    && question.productionUse === "forbidden"
    && question.generatorRouting === "hidden_only_not_canonical";
}

function isCanonicalRuntimeLifecycle(question) {
  return question.phase === "S58G"
    && question.selectorStatus === "visible"
    && question.visibilityStatus === "visible"
    && question.productionUse === "canonical_runtime_only"
    && question.generatorRouting === "canonical_resolver_allocation"
    && question.canonicalRoute?.kind === "g3b_u08_pure_semantic"
    && question.canonicalRoute?.publicHiddenModeFlagUsed === false
    && question.semanticSnapshot?.runtimeStatus === "canonical_routed_pre_worksheet"
    && question.semanticSnapshot?.resolverDerived === true;
}

function validateStage2(question, spec) {
  const errors = [];`
);
replaceExactly(
  validator,
  `    if (question.selectorStatus !== "hidden" || question.productionUse !== "forbidden" || question.generatorRouting !== "hidden_only_not_canonical") {
      add(errors, "G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION", 2, "productionUse", "Question escaped the approved hidden pre-promotion lifecycle.");
    }`,
  `    if (!isHiddenPrePromotionLifecycle(question) && !isCanonicalRuntimeLifecycle(question)) {
      add(errors, "G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION", 2, "productionUse", "Question is outside the approved hidden or resolver-derived canonical lifecycle.");
    }`
);

const questionRouter = "site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
replaceExactly(
  questionRouter,
  `} from "./g3b-u04-canonical-semantic-router.js";
`,
  `} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  classifyG3BU08CanonicalRouterPlan,
  generateG3BU08CanonicalSemanticQuestions
} from "./g3b-u08-canonical-semantic-router.js";
`
);
replaceExactly(
  questionRouter,
  `function invalidG3BU04CanonicalResult(plan) {`,
  `function invalidG3BU08CanonicalResult(plan) {
  const resolverErrors = Array.isArray(plan.resolverResult?.errors) ? plan.resolverResult.errors : [];
  const errors = resolverErrors.length > 0
    ? resolverErrors.map((entry) => issue(
      entry.code ?? "G3B_U08_CANONICAL_SCOPE_INVALID",
      "resolverResult",
      \`G3B-U08 canonical selection was rejected by the visible resolver: ${"${entry.code ?? \"unknown\"}"}.\`
    ))
    : [issue(
      "G3B_U08_CANONICAL_SCOPE_INVALID",
      "allocation",
      "G3B-U08 canonical selection contains an invalid or unpromoted semantic scope."
    )];
  return {
    ok: false,
    plan,
    questions: [],
    allocation: cloneValue(plan.allocation ?? []),
    errors,
    warnings: cloneValue(plan.resolverResult?.warnings ?? [])
  };
}

function invalidG3BU04CanonicalResult(plan) {`
);
replaceExactly(
  questionRouter,
  `export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const g3bU04RouteKind = classifyG3BU04CanonicalRouterPlan(plan);`,
  `export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const g3bU08RouteKind = classifyG3BU08CanonicalRouterPlan(plan);
  if (g3bU08RouteKind === G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE) {
    return invalidG3BU08CanonicalResult(plan);
  }
  if (g3bU08RouteKind === G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC) {
    return generateG3BU08CanonicalSemanticQuestions(plan);
  }
  const g3bU04RouteKind = classifyG3BU04CanonicalRouterPlan(plan);`
);

console.log("S58G resolver, validator lifecycle and canonical router patches applied.");
