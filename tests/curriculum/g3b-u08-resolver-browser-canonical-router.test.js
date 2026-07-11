import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  G3B_U08_RESOLVER_BROWSER_STATE_INTEGRATION,
  resolveVisiblePatternGroupSelection
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  G3B_U08_CANONICAL_ROUTER_INTEGRATION,
  classifyG3BU08CanonicalRouterPlan,
  generateG3BU08CanonicalSemanticQuestions,
  validateG3BU08CanonicalSemanticPlan
} from "../../site/modules/curriculum/batch-a/g3b-u08-canonical-semantic-router.js";
import {
  validateG3BU08SemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  createConfigState,
  getBatchAWorksheetPlan
} from "../../site/assets/browser/state/config-state.js";
import {
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";

const SOURCE_ID = "g3b_u08_3b08";
const TOTAL_KP = "kp_g3b_u08_total_from_groups";
const TOTAL_GROUP = "pg_g3b_u08_total_from_groups";
const GROUP_COUNT_KP = "kp_g3b_u08_group_count_from_total";
const GROUP_COUNT_GROUP = "pg_g3b_u08_group_count_from_total";
const PER_GROUP_KP = "kp_g3b_u08_per_group_from_total";
const PER_GROUP_GROUP = "pg_g3b_u08_per_group_from_total";
const ESTIMATION_KP = "kp_g3b_u08_shopping_estimation";
const ESTIMATION_GROUP = "pg_g3b_u08_shopping_estimation";

function codes(result) {
  return result.errors.map((entry) => entry.code);
}

function groupCounts(allocation) {
  const counts = new Map();
  for (const entry of allocation) {
    counts.set(entry.patternGroupId, (counts.get(entry.patternGroupId) ?? 0) + entry.questionCount);
  }
  return counts;
}

function assertSpreadAtMostOne(values, label) {
  assert.ok(values.length > 0, label);
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${label}: ${values.join(",")}`);
}

function assertFamilyFairness(allocation) {
  const byGroup = new Map();
  for (const entry of allocation) {
    const counts = byGroup.get(entry.patternGroupId) ?? [];
    counts.push(entry.questionCount);
    byGroup.set(entry.patternGroupId, counts);
  }
  for (const [groupId, counts] of byGroup) assertSpreadAtMostOne(counts, groupId);
}

function resolve(overrides = {}) {
  return resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [TOTAL_KP],
    selectedPatternGroupIds: [],
    questionCount: 17,
    ordering: "groupedByPattern",
    generationSeed: "s58g-resolver",
    includeAnswerKey: true,
    ...overrides
  });
}

function canonicalOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [TOTAL_KP],
    selectedPatternGroupIds: [TOTAL_GROUP],
    questionCount: 17,
    ordering: "groupedByPattern",
    generationSeed: "s58g-canonical",
    includeAnswerKey: true,
    ...overrides
  };
}

test("S58G integration contract keeps the unit application-only and pre-worksheet", () => {
  assert.deepEqual(G3B_U08_RESOLVER_BROWSER_STATE_INTEGRATION, {
    task: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration",
    sourceId: SOURCE_ID,
    status: "resolver_browser_state_and_canonical_router_integrated_worksheet_gate_pending",
    allocationStrategy: "balanced_by_group_then_family",
    supportedSelectionModes: [
      BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
    ],
    browserStateFields: [
      "selectionMode",
      "selectedKnowledgePointIds",
      "selectedPatternGroupIds",
      "questionCount",
      "ordering",
      "includeAnswerKey"
    ],
    applicationOnly: true,
    publicNumericModeAdded: false,
    representationToggleAdded: false,
    publicHiddenModeFlagAllowed: false,
    canonicalRouterChanged: true,
    productionEligibilityChanged: false,
    worksheetRendererChanged: false,
    requiredNextGate: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration"
  });
  assert.equal(G3B_U08_CANONICAL_ROUTER_INTEGRATION.applicationOnly, true);
  assert.equal(G3B_U08_CANONICAL_ROUTER_INTEGRATION.publicNumericModeAdded, false);
  assert.equal(G3B_U08_CANONICAL_ROUTER_INTEGRATION.productionEligibilityChanged, false);
  assert.equal(G3B_U08_CANONICAL_ROUTER_INTEGRATION.worksheetRendererChanged, false);
});

test("S58G single application KP auto-resolves its only visible group and four families", () => {
  const result = resolve();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.knowledgePointIds, [TOTAL_KP]);
  assert.deepEqual(result.patternGroupIds, [TOTAL_GROUP]);
  assert.equal(result.patternSpecIds.length, 4);
  assert.equal(result.patternSpecIds.every((id) => G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(id)), true);
  assert.equal(result.allocation.length, 4);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 17);
  assertFamilyFairness(result.allocation);
  assert.equal(result.provenance.allocationStrategy, "balanced_by_group_then_family");
  assert.equal(result.provenance.publicHiddenModeFlagUsed, false);
});

test("S58G mixed same-unit selection balances groups before families", () => {
  const result = resolve({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [TOTAL_KP, GROUP_COUNT_KP, PER_GROUP_KP],
    selectedPatternGroupIds: [],
    questionCount: 31
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 31);
  assert.deepEqual(new Set(result.patternGroupIds), new Set([TOTAL_GROUP, GROUP_COUNT_GROUP, PER_GROUP_GROUP]));
  assertSpreadAtMostOne([...groupCounts(result.allocation).values()], "group fairness");
  assertFamilyFairness(result.allocation);
});

test("S58G strict visible selection rejects stale, unlinked and cross-unit group input", () => {
  const stale = resolve({ selectedPatternGroupIds: ["pg_g3b_u08_stale"] });
  assert.equal(stale.ok, false);
  assert.ok(codes(stale).includes(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_VISIBLE));

  const wrongGroup = resolve({ selectedPatternGroupIds: [ESTIMATION_GROUP] });
  assert.equal(wrongGroup.ok, false);
  assert.ok(codes(wrongGroup).includes(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_LINKED_TO_KP));

  const crossUnit = resolve({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [TOTAL_KP, "kp_g3b_u04_add_then_divide"],
    selectedPatternGroupIds: [TOTAL_GROUP, "pg_g3b_u04_add_then_divide"]
  });
  assert.equal(crossUnit.ok, false);
  assert.ok(codes(crossUnit).includes(BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH));
});

test("S58G browser state carries application selection without a hidden mode or representation toggle", () => {
  const state = createConfigState({ queryState: canonicalOptions({ questionCount: 19, ordering: "shuffleAcrossPatterns", includeAnswerKey: false }) });
  const worksheetPlan = getBatchAWorksheetPlan(state);
  assert.deepEqual(worksheetPlan.selectedKnowledgePointIds, [TOTAL_KP]);
  assert.deepEqual(worksheetPlan.selectedPatternGroupIds, [TOTAL_GROUP]);
  assert.equal(worksheetPlan.questionCount, 19);
  assert.equal(worksheetPlan.ordering, "shuffleAcrossPatterns");
  assert.equal(worksheetPlan.includeAnswerKey, false);
  assert.equal(Object.hasOwn(worksheetPlan, "hiddenSemanticMode"), false);
  assert.equal(Object.hasOwn(worksheetPlan, "g3bU08Semantic"), false);
  assert.equal(Object.hasOwn(worksheetPlan, "representationMode"), false);

  const plan = buildBatchABrowserPlan(worksheetPlan);
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));
  assert.equal(plan.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 19);
  assertFamilyFairness(plan.allocation);
});

test("S58G canonical route consumes exact resolver allocation and applies all 8 validator stages", () => {
  const result = generateBatchABrowserQuestions(canonicalOptions({ questionCount: 25 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 25);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 25);
  assert.equal(result.plan.routeKind, G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC);
  assert.deepEqual(result.allocation, result.plan.allocation);
  for (const question of result.questions) {
    assert.equal(question.phase, "S58G");
    assert.equal(question.kind, "g3bU08SemanticApplication");
    assert.equal(question.selectorStatus, "visible");
    assert.equal(question.visibilityStatus, "visible");
    assert.equal(question.productionUse, "canonical_runtime_only");
    assert.equal(question.generatorRouting, "canonical_resolver_allocation");
    assert.equal(question.representation, "horizontal_only");
    assert.equal(question.canonicalRoute.kind, G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC);
    assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
    assert.equal(question.fallback, undefined);
    const validation = validateG3BU08SemanticQuestion(question);
    assert.equal(validation.valid, true, JSON.stringify(validation.blockingErrors));
    assert.equal(validation.stageResults.length, 8);
    assert.equal(validation.stageResults.every((stage) => stage.ok), true);
  }
});

test("S58G mixed-KP canonical shuffle is deterministic and preserves exact hierarchical allocation", () => {
  const options = canonicalOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [TOTAL_KP, GROUP_COUNT_KP, PER_GROUP_KP, ESTIMATION_KP],
    selectedPatternGroupIds: [TOTAL_GROUP, GROUP_COUNT_GROUP, PER_GROUP_GROUP, ESTIMATION_GROUP],
    questionCount: 47,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s58g-mixed-shuffle"
  });
  const first = generateBatchABrowserQuestions(options);
  const second = generateBatchABrowserQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 47);
  assertSpreadAtMostOne([...groupCounts(first.allocation).values()], "group fairness");
  assertFamilyFairness(first.allocation);
  assert.equal(first.questions.every((question) => G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(question.patternSpecId)), true);
});

test("S58G classifier rejects arbitrary allocation injection and never falls back", () => {
  const plan = buildBatchABrowserPlan(canonicalOptions({ questionCount: 8 }));
  const injected = structuredClone(plan);
  injected.allocation[0].patternSpecId = "ps_g3b_u08_injected";
  assert.equal(classifyG3BU08CanonicalRouterPlan(injected), G3B_U08_CANONICAL_ROUTE_KINDS.INVALID_SEMANTIC_SCOPE);
  const validation = validateG3BU08CanonicalSemanticPlan(injected);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "G3B_U08_CANONICAL_PATTERN_NOT_PROMOTED"));

  const routed = generateBatchABrowserQuestions({
    ...canonicalOptions({ questionCount: 8 }),
    selectedPatternSpecIds: ["ps_g3b_u08_injected"]
  });
  assert.equal(routed.ok, true);
  assert.equal(routed.questions.some((question) => question.patternSpecId === "ps_g3b_u08_injected"), false);
});

test("S58G blocking validator failure returns zero questions and no generic fallback", () => {
  const plan = buildBatchABrowserPlan(canonicalOptions({ questionCount: 5 }));
  const result = generateG3BU08CanonicalSemanticQuestions(plan, {
    validator: () => ({
      valid: false,
      blockingErrors: [{ code: "G3BU08_TEST_BLOCK", severity: "error", path: "test", message: "blocked" }],
      warnings: [],
      validatorVersion: "test"
    })
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.ok(result.errors.some((entry) => entry.code === "G3BU08_TEST_BLOCK"));
  assert.ok(result.errors.some((entry) => entry.code === "G3B_U08_CANONICAL_OUTPUT_COUNT_MISMATCH"));
});

test("S58G validator blocks canonical numeric-bound mutation", () => {
  const result = generateBatchABrowserQuestions(canonicalOptions({ questionCount: 1 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const mutated = structuredClone(result.questions[0]);
  mutated.quantities.b = 12;
  const validation = validateG3BU08SemanticQuestion(mutated);
  assert.equal(validation.valid, false);
  assert.ok(validation.blockingErrors.some((entry) => entry.code === "G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN"));
});

test("S58G classifier remains legacy for other Batch A sources and source-unit mode", () => {
  assert.equal(classifyG3BU08CanonicalRouterPlan({ sourceId: "g3b_u04_3b04" }), G3B_U08_CANONICAL_ROUTE_KINDS.LEGACY);
  assert.equal(classifyG3BU08CanonicalRouterPlan({ sourceId: SOURCE_ID, selectionMode: "sourceUnit", worksheetMode: "batchASource" }), G3B_U08_CANONICAL_ROUTE_KINDS.LEGACY);
});
