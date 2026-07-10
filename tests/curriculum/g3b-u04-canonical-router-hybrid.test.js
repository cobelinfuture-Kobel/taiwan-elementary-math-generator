import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { generateBatchABrowserQuestions as generateLegacyBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  G3B_U04_CANONICAL_ROUTER_INTEGRATION,
  G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID,
  buildG3BU04CanonicalSemanticSubplan,
  classifyG3BU04CanonicalRouterPlan,
  generateG3BU04CanonicalSemanticQuestions
} from "../../site/modules/curriculum/batch-a/g3b-u04-canonical-semantic-router.js";
import { validateG3BU04SemanticQuestion } from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u04_3b04";
const CONSECUTIVE_KP_ID = "kp_g3b_u04_consecutive_multiplication";
const NUMERIC_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_numeric";
const APPLICATION_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_application";
const ADD_DIVIDE_KP_ID = "kp_g3b_u04_add_then_divide";
const ADD_DIVIDE_GROUP_ID = "pg_g3b_u04_add_then_divide";

function semanticGroupsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

function semanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_DIVIDE_KP_ID],
    selectedPatternGroupIds: [ADD_DIVIDE_GROUP_ID],
    questionCount: 12,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f4-pure-semantic",
    ...overrides
  };
}

function hybridOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [CONSECUTIVE_KP_ID],
    selectedPatternGroupIds: [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID],
    questionCount: 11,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f4-hybrid",
    ...overrides
  };
}

function countBy(values, keyFn) {
  const counts = new Map();
  for (const value of values) {
    const key = keyFn(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function spread(values) {
  return Math.max(...values) - Math.min(...values);
}

test("S57F4 canonical integration advertises only the approved router scope", () => {
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.status, "canonical_router_integrated_validator_worksheet_gate_pending");
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.resolverDerivedOnly, true);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.publicHiddenModeFlagAllowed, false);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.blockingSemanticValidatorRequired, true);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.genericFallbackOnSemanticFailureAllowed, false);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.productionEligibilityChanged, false);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.worksheetRendererChanged, false);
  assert.equal(G3B_U04_CANONICAL_ROUTER_INTEGRATION.requiredNextGate, "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration");
});

test("S57F4 routes a visible single-KP semantic selection through the blocking canonical path", () => {
  const result = generateBatchABrowserQuestions(semanticOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 12);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 12);
  assert.equal(result.plan.routeKind, G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC);
  assert.equal(result.questions.every((question) => question.kind === "g3bU04SemanticWordProblem"), true);
  assert.equal(result.questions.every((question) => question.selectorStatus === "visible"), true);
  assert.equal(result.questions.every((question) => question.productionUse === "allowed"), true);
  assert.equal(result.questions.every((question) => question.generatorRouting === "canonical_resolver_allocation"), true);
  assert.equal(result.questions.every((question) => question.canonicalRoute.publicHiddenModeFlagUsed === false), true);
  assert.equal(result.questions.every((question) => validateG3BU04SemanticQuestion(question).ok), true);
  assert.equal(new Set(result.questions.map((question) => question.patternSpecId)).size, 4);
  assert.equal(result.questions.every((question) => question.resolvedPatternGroupId === ADD_DIVIDE_GROUP_ID), true);
});

test("S57F4 routes all nine semantic KnowledgePoints with exact group-then-family allocation", () => {
  const selectedPatternGroupIds = semanticGroupsForKnowledgePoints(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
  const options = semanticOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds,
    questionCount: 257,
    generationSeed: "s57f4-nine-kp-257"
  });
  const result = generateBatchABrowserQuestions(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 257);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 257);
  assert.equal(new Set(result.questions.map((question) => question.knowledgePointId)).size, 9);
  assert.equal(new Set(result.questions.map((question) => question.patternSpecId)).size, 32);
  assert.deepEqual(
    new Set(result.questions.map((question) => question.patternSpecId)),
    new Set(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)
  );

  const groupCounts = countBy(result.questions, (question) => question.resolvedPatternGroupId);
  assert.equal(groupCounts.size, 9);
  assert.equal(spread([...groupCounts.values()]) <= 1, true);
  for (const groupId of groupCounts.keys()) {
    const familyCounts = countBy(
      result.questions.filter((question) => question.resolvedPatternGroupId === groupId),
      (question) => question.patternSpecId
    );
    assert.equal(spread([...familyCounts.values()]) <= 1, true);
  }
});

test("S57F4 preserves the existing numeric consecutive-multiplication route", () => {
  const options = hybridOptions({
    selectedPatternGroupIds: [NUMERIC_GROUP_ID],
    questionCount: 8,
    generationSeed: "s57f4-numeric-only"
  });
  const plan = buildBatchABrowserPlan(options);
  assert.equal(classifyG3BU04CanonicalRouterPlan(plan), G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC);
  const result = generateBatchABrowserQuestions(options);
  const legacy = generateLegacyBatchABrowserQuestions(options);
  assert.deepEqual(result, legacy);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 8);
  assert.equal(result.questions.every((question) => question.patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID), true);
  assert.equal(result.questions.some((question) => question.kind === "g3bU04SemanticWordProblem"), false);
});

test("S57F4 generates numeric-plus-semantic hybrid output from one resolver allocation", () => {
  const result = generateBatchABrowserQuestions(hybridOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.plan.routeKind, G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID);
  assert.equal(result.questions.length, 11);
  assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), 11);
  const semantic = result.questions.filter((question) => question.kind === "g3bU04SemanticWordProblem");
  const numeric = result.questions.filter((question) => question.kind !== "g3bU04SemanticWordProblem");
  assert.equal(semantic.length > 0, true);
  assert.equal(numeric.length > 0, true);
  assert.equal(semantic.every((question) => question.productionUse === "allowed"), true);
  assert.equal(semantic.every((question) => validateG3BU04SemanticQuestion(question).ok), true);
  assert.equal(numeric.every((question) => question.patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID), true);
  assert.equal(result.questions.every((question) => question.canonicalRoute.kind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID), true);
  assert.equal(result.questions.every((question) => question.canonicalRoute.publicHiddenModeFlagUsed === false), true);
  const groupCounts = countBy(result.allocation, (entry) => entry.patternGroupId);
  const totals = [...groupCounts.keys()].map((groupId) => result.allocation
    .filter((entry) => entry.patternGroupId === groupId)
    .reduce((sum, entry) => sum + entry.questionCount, 0));
  assert.equal(spread(totals) <= 1, true);
});

test("S57F4 hybrid shuffle is deterministic and preserves membership", () => {
  const options = hybridOptions({
    questionCount: 64,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s57f4-hybrid-deterministic"
  });
  const first = generateBatchABrowserQuestions(options);
  const replay = generateBatchABrowserQuestions(options);
  const grouped = generateBatchABrowserQuestions({ ...options, ordering: "groupedByPattern" });
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(replay.ok, true, JSON.stringify(replay.errors));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.deepEqual(replay.questions, first.questions);
  assert.notDeepEqual(first.questions.map((question) => question.id), grouped.questions.map((question) => question.id));
  assert.deepEqual(
    [...first.questions.map((question) => `${question.patternSpecId}:${question.finalAnswer}`).sort()],
    [...grouped.questions.map((question) => `${question.patternSpecId}:${question.finalAnswer}`).sort()]
  );
});

test("S57F4 rejects stale and invalid resolver scope instead of falling back to a generic expression", () => {
  const stale = generateBatchABrowserQuestions(semanticOptions({
    selectedPatternGroupIds: ["pg_g3b_u04_stale_group"],
    questionCount: 4
  }));
  assert.equal(stale.ok, false);
  assert.deepEqual(stale.questions, []);
  assert.equal(stale.errors.some((error) => [
    "kp_resolver_pattern_group_not_visible",
    "kp_resolver_pattern_group_not_linked_to_kp",
    "G3B_U04_CANONICAL_SCOPE_INVALID"
  ].includes(error.code)), true);
});

test("S57F4 blocking semantic validation failure returns zero output and never falls back", () => {
  const canonicalPlan = buildG3BU04CanonicalSemanticSubplan(buildBatchABrowserPlan(semanticOptions({ questionCount: 3 })));
  const result = generateG3BU04CanonicalSemanticQuestions(canonicalPlan, {
    validator: () => ({
      ok: false,
      errors: [{
        code: "G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED",
        severity: "error",
        stage: "answer_reconstruction",
        path: "finalAnswer",
        message: "forced blocking test failure"
      }],
      warnings: []
    })
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.equal(result.errors.some((error) => error.code === "G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED"), true);
  assert.equal(result.errors.some((error) => error.code === "G3B_U04_CANONICAL_OUTPUT_COUNT_MISMATCH"), true);
});

test("S57F4 canonical public router ignores hidden-mode inputs without visible selection", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    hiddenSemanticMode: "g3b_u04_hidden_semantic",
    g3bU04Semantic: true,
    questionCount: 6,
    generationSeed: "s57f4-public-hidden-mode-denied"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 6);
  assert.equal(result.questions.every((question) => question.patternSpecId === G3B_U04_PRESERVED_NUMERIC_PATTERN_SPEC_ID), true);
  assert.equal(result.questions.some((question) => question.kind === "g3bU04SemanticWordProblem"), false);
});

test("S57F4 keeps G3B-U04 source-unit default and unrelated Batch A routes byte-equivalent", () => {
  const sourceUnitOptions = {
    sourceId: SOURCE_ID,
    questionCount: 10,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f4-source-unit-regression"
  };
  assert.deepEqual(generateBatchABrowserQuestions(sourceUnitOptions), generateLegacyBatchABrowserQuestions(sourceUnitOptions));

  const unrelatedOptions = {
    sourceId: "g3a_u03_3a03",
    questionCount: 9,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s57f4-unrelated-regression"
  };
  assert.deepEqual(generateBatchABrowserQuestions(unrelatedOptions), generateLegacyBatchABrowserQuestions(unrelatedOptions));
});
