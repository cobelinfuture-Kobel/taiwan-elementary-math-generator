import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PROMOTION_LIFECYCLE,
  G5A_U08_PUBLIC_CONTROLS,
  validateG5AU08PromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_VISIBLE_SELECTOR_PROJECTION,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  validateG5AU08VisibleSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5A_U08_HIDDEN_PATTERN_GROUPS,
  G5A_U08_HIDDEN_PATTERN_SPECS,
} from "../../site/modules/curriculum/batch-a/source-pattern-g5a-u08-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  G5A_U08_RESOLVER_BROWSER_STATE_INTEGRATION,
  resolveVisiblePatternGroupSelection,
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserPlan,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  G5A_U08_CANONICAL_ROUTE_KINDS,
  G5A_U08_CANONICAL_ROUTER_INTEGRATION,
  classifyG5AU08CanonicalRouterPlan,
  generateG5AU08CanonicalQuestions,
  normalizeG5AU08ResolverPlan,
  validateG5AU08CanonicalPlan,
  validateG5AU08CanonicalQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAQuestionMode,
} from "../../site/assets/browser/state/config-state.js";

const SOURCE_ID = "g5a_u08_5a08";
const MIXED_KP = "kp_g5a_u08_mixed_operation_order";
const MIXED_NUMERIC_GROUP = "pg_g5a_u08_mixed_operation_order_numeric";
const MULDIV_KP = "kp_g5a_u08_mul_div_equivalent_regroup";
const MULDIV_APP_GROUP = "pg_g5a_u08_mul_div_regroup_application";
const MISSING_KP = "kp_g5a_u08_missing_operator_inference";
const MISSING_GROUP = "pg_g5a_u08_missing_operator_reasoning";
const AVERAGE_KP = "kp_g5a_u08_average_inverse_update";
const AVERAGE_REASONING_GROUP = "pg_g5a_u08_average_reasoning";

function options(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [MIXED_KP],
    selectedPatternGroupIds: [MIXED_NUMERIC_GROUP],
    questionMode: "numeric",
    depthMode: "N",
    contextMode: "mixed",
    questionCount: 20,
    ordering: "groupedByPattern",
    generationSeed: "s60i-g5a-u08",
    includeAnswerKey: true,
    ...overrides,
  };
}

function registryJson() {
  return JSON.parse(readFileSync(new URL(
    "../../data/curriculum/registry/promotions/S60I_G5A_U08_PromotionRegistry.json",
    import.meta.url,
  ), "utf8"));
}

test("S60I promotion registry matches hidden authority without mutating it", () => {
  const registry = registryJson();
  assert.equal(validateG5AU08PromotionProjection().ok, true);
  assert.equal(registry.promotionRegistryId, G5A_U08_PROMOTION_LIFECYCLE.promotionRegistryId);
  assert.deepEqual(registry.knowledgePointIds, G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS);
  assert.deepEqual(registry.patternGroupIds, G5A_U08_PROMOTED_PATTERN_GROUP_IDS);
  assert.deepEqual(registry.patternSpecIds, G5A_U08_PROMOTED_PATTERN_SPEC_IDS);
  assert.equal(G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length, 11);
  assert.equal(G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length, 17);
  assert.equal(G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length, 30);
  assert.equal(G5A_U08_HIDDEN_PATTERN_GROUPS.every((row) => row.visibilityStatus === "hidden"), true);
  assert.equal(G5A_U08_HIDDEN_PATTERN_SPECS.every((row) => row.selectorStatus === "hidden" && row.productionUse === "forbidden"), true);
  assert.equal(G5A_U08_PROMOTION_LIFECYCLE.worksheetStatus, "not_eligible");
  assert.equal(G5A_U08_PROMOTION_LIFECYCLE.productionUse, "forbidden");
});

test("S60I visible selector projects 11 KPs, 17 groups and three authority modes", () => {
  const checked = validateG5AU08VisibleSelectorProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, {
    visibleKnowledgePoints: 11,
    visiblePatternGroups: 17,
    numericGroups: 8,
    applicationGroups: 6,
    reasoningGroups: 3,
    patternSpecs: 30,
  });
  assert.equal(G5A_U08_VISIBLE_SELECTOR_PROJECTION.publicNPlus2, false);
  assert.equal(G5A_U08_VISIBLE_SELECTOR_PROJECTION.publicFormalEquation, false);
  assert.equal(getVisibleBatchAKnowledgePoint(AVERAGE_KP).publicQuestionModes.includes("reasoning"), true);
  assert.equal(getVisiblePatternGroupsForKnowledgePoint(MIXED_KP).length, 2);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 11);
});

test("S60I strict resolver requires an explicit group for a multi-group KP", () => {
  const missingGroup = resolveVisiblePatternGroupSelection({
    ...options(),
    selectedPatternGroupIds: [],
  });
  assert.equal(missingGroup.ok, false);
  assert.equal(missingGroup.errors.some((row) => row.code === "kp_resolver_pattern_group_selection_required"), true);

  const resolved = resolveVisiblePatternGroupSelection(options());
  assert.equal(resolved.ok, true, JSON.stringify(resolved.errors));
  assert.deepEqual(resolved.knowledgePointIds, [MIXED_KP]);
  assert.deepEqual(resolved.patternGroupIds, [MIXED_NUMERIC_GROUP]);
  assert.equal(resolved.provenance.s60iAdapterApplied, true);
});

test("S60I browser state carries normalized public mode, depth and context controls", () => {
  const state = createConfigState({ queryState: options({
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 24,
  }) });
  let plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.questionMode, "application");
  assert.equal(plan.depthMode, "N_PLUS_1");
  assert.equal(plan.contextMode, "sdg");
  assert.equal(plan.publicNPlus2, false);
  assert.equal(plan.publicFormalEquation, false);

  setBatchAQuestionMode(state, "reasoning");
  setBatchADepthMode(state, "mixed");
  setBatchAContextMode(state, "daily_life");
  plan = getBatchAWorksheetPlan(state);
  assert.deepEqual(plan.publicControls, {
    questionMode: "reasoning",
    depthMode: "mixed",
    contextMode: "daily_life",
  });
  assert.deepEqual(G5A_U08_PUBLIC_CONTROLS.questionModes, ["mixed", "numeric", "application", "reasoning"]);
});

test("S60I canonical numeric route uses S60G generation and blocking validation", () => {
  const result = generateBatchABrowserQuestions(options({ questionCount: 31 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 31);
  assert.equal(result.plan.routeKind, G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL);
  assert.equal(result.questions.every((row) => row.depth === "N" && row.applicationText === false), true);
  for (const question of result.questions) {
    assert.equal(question.phase, "S60I");
    assert.equal(question.selectorStatus, "visible");
    assert.equal(question.productionUse, "canonical_runtime_only");
    assert.equal(question.canonicalRoute.runtimeKind, "numeric_or_noncontext_reasoning");
    assert.equal(validateG5AU08CanonicalQuestion(question).ok, true);
  }
});

test("S60I canonical N+1 SDG application route uses S60H semantic runtime", () => {
  const result = generateBatchABrowserQuestions(options({
    selectedKnowledgePointIds: [MULDIV_KP],
    selectedPatternGroupIds: [MULDIV_APP_GROUP],
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
    questionCount: 24,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 24);
  assert.equal(result.questions.every((row) => row.depth === "N_PLUS_1"), true);
  assert.equal(result.questions.every((row) => row.context.contextType === "sdg"), true);
  assert.equal(result.questions.every((row) => row.canonicalRoute.runtimeKind === "contextual_application_or_reasoning"), true);
});

test("S60I reasoning mode can combine non-context and contextual reasoning groups", () => {
  const result = generateBatchABrowserQuestions(options({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [MISSING_KP, AVERAGE_KP],
    selectedPatternGroupIds: [MISSING_GROUP, AVERAGE_REASONING_GROUP],
    questionMode: "reasoning",
    depthMode: "mixed",
    contextMode: "mixed",
    questionCount: 30,
    ordering: "shuffleAcrossPatterns",
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 30);
  assert.deepEqual(new Set(result.questions.map((row) => row.mode)), new Set(["reasoning"]));
  assert.deepEqual(new Set(result.questions.map((row) => row.canonicalRoute.runtimeKind)), new Set([
    "numeric_or_noncontext_reasoning",
    "contextual_application_or_reasoning",
  ]));
});

test("S60I rejects an impossible N+1 numeric scope with zero output", () => {
  const result = generateBatchABrowserQuestions(options({
    questionMode: "numeric",
    depthMode: "N_PLUS_1",
    questionCount: 8,
  }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.equal(result.errors.some((row) => row.code === "G5A_U08_CANONICAL_SCOPE_INVALID"), true);
});

test("S60I ignores arbitrary public PatternSpec injection", () => {
  const result = generateBatchABrowserQuestions({
    ...options({ questionCount: 9 }),
    selectedPatternSpecIds: ["ps_g5a_u08_injected"],
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.some((row) => row.patternSpecId === "ps_g5a_u08_injected"), false);
  assert.equal(result.questions.every((row) => G5A_U08_PROMOTED_PATTERN_SPEC_IDS.includes(row.patternSpecId)), true);
});

test("S60I blocking validator failure returns zero output and no fallback", () => {
  const plan = normalizeG5AU08ResolverPlan(buildBatchABrowserPlan(options({ questionCount: 5 })));
  assert.equal(validateG5AU08CanonicalPlan(plan).ok, true);
  assert.equal(classifyG5AU08CanonicalRouterPlan(plan), G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL);
  const result = generateG5AU08CanonicalQuestions(plan, {
    numericValidator: () => ({
      valid: false,
      errors: [{ code: "G5A_U08_TEST_BLOCK", severity: "error", path: "test", message: "blocked" }],
      warnings: [],
      acceptedQuestions: [],
    }),
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.equal(result.errors.some((row) => row.code === "G5A_U08_TEST_BLOCK"), true);
  assert.equal(result.errors.some((row) => row.code === "G5A_U08_CANONICAL_OUTPUT_COUNT_MISMATCH"), true);
});

test("S60I integration contract remains pre-worksheet and fallback-free", () => {
  assert.equal(G5A_U08_RESOLVER_BROWSER_STATE_INTEGRATION.sourceId, SOURCE_ID);
  assert.equal(G5A_U08_CANONICAL_ROUTER_INTEGRATION.genericFallbackAllowed, false);
  assert.equal(G5A_U08_CANONICAL_ROUTER_INTEGRATION.blockingValidatorRequired, true);
  assert.equal(G5A_U08_CANONICAL_ROUTER_INTEGRATION.productionEligibilityChanged, false);
  assert.equal(G5A_U08_CANONICAL_ROUTER_INTEGRATION.worksheetRendererChanged, false);
  const sourcePlan = buildBatchABrowserPlan({ sourceId: SOURCE_ID, selectionMode: "sourceUnit", questionCount: 4 });
  assert.equal(classifyG5AU08CanonicalRouterPlan(sourcePlan), G5A_U08_CANONICAL_ROUTE_KINDS.LEGACY);
});
