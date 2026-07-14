import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  G4B_U04_VISIBLE_SELECTOR_PROJECTION,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
  validateG4BU04VisibleSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PUBLIC_CONTROLS,
  validateG4BU04PromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_EFFECTIVE_PATTERN_GROUPS,
  G4B_U04_EFFECTIVE_PATTERN_SPECS,
  G4B_U04_HIDDEN_PATTERN_GROUPS,
  G4B_U04_HIDDEN_PATTERN_SPECS,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_CANONICAL_ROUTE_KINDS,
  classifyG4BU04CanonicalRouterPlan,
  generateG4BU04CanonicalQuestions,
  normalizeG4BU04ResolverPlan,
  validateG4BU04CanonicalPlan,
  validateG4BU04CanonicalQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import {
  G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC,
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/registry/promotions/S72_G4B_U04_PromotionRegistry.json",
  import.meta.url,
);

function basePlan(overrides = {}) {
  return {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_round_half_up_place_value"],
    selectedPatternGroupIds: [],
    patternSpecIds: ["ps_g4b_u04_payment_amount_ceiling"],
    questionMode: "mixed",
    questionCount: 19,
    ordering: "groupedByPattern",
    generationSeed: "s72-test",
    includeAnswerKey: true,
    resolverResult: { ok: false, errors: [{ code: "stale" }] },
    ...overrides,
  };
}

function errorCodes(result) {
  return new Set((result.errors ?? []).map((row) => row.code));
}

test("S72 promotion projects the R2C effective authority while preserving the S68 base prefix", () => {
  const projection = validateG4BU04PromotionProjection();
  assert.equal(projection.ok, true, projection.errors.join(","));
  assert.equal(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length, 13);
  assert.equal(G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length, 13);
  assert.equal(G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length, 19);
  assert.deepEqual(G4B_U04_PROMOTED_PATTERN_GROUP_IDS, G4B_U04_EFFECTIVE_PATTERN_GROUPS.map((row) => row.patternGroupId));
  assert.deepEqual(G4B_U04_PROMOTED_PATTERN_SPEC_IDS, G4B_U04_EFFECTIVE_PATTERN_SPECS.map((row) => row.patternSpecId));
  assert.deepEqual(G4B_U04_EFFECTIVE_PATTERN_GROUPS.slice(0, 12), G4B_U04_HIDDEN_PATTERN_GROUPS);
  assert.deepEqual(G4B_U04_EFFECTIVE_PATTERN_SPECS.slice(0, 17), G4B_U04_HIDDEN_PATTERN_SPECS);
  assert.equal(G4B_U04_EFFECTIVE_PATTERN_GROUPS.every((row) => row.visibilityStatus === "hidden" && row.productionUse === "forbidden"), true);
  assert.equal(G4B_U04_EFFECTIVE_PATTERN_SPECS.every((row) => row.selectorStatus === "hidden" && row.canonicalRouting === "disabled" && row.productionUse === "forbidden"), true);
});

test("S72 public selector exposes 13 KPs, 13 groups and 19 specs while preserving prior projections", () => {
  const projection = validateG4BU04VisibleSelectorProjection();
  assert.equal(projection.ok, true, projection.errors.join(","));
  assert.deepEqual(projection.counts, { knowledgePoints: 13, patternGroups: 13, patternSpecs: 19 });
  assert.deepEqual(projection.modeCounts, { concept: 4, numeric: 3, application: 6, operation_estimation: 4, reasoning: 2 });
  assert.equal(G4B_U04_VISIBLE_SELECTOR_PROJECTION.visibleKnowledgePointCount, 13);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId.g4b_u04_4b04.visibleCount, 13);
  const all = listVisibleBatchAKnowledgePoints();
  assert.equal(all.filter((row) => row.sourceId === "g4b_u04_4b04").length, 13);
  assert.ok(all.some((row) => row.sourceId === "g5a_u08_5a08"));
});

test("S72 selector maps each effective KnowledgePoint to its authoritative group and specs", () => {
  for (const knowledgePointId of G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS) {
    const kp = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    assert.equal(kp.sourceId, "g4b_u04_4b04");
    assert.equal(groups.length, 1);
    assert.equal(groups[0].visibilityStatus, "visible");
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), groups[0].patternSpecIds);
  }
});

test("S72 public controls expose only the five authoritative modes plus mixed", () => {
  assert.deepEqual(G4B_U04_PUBLIC_CONTROLS.questionModes, [
    "mixed", "concept", "numeric", "application", "operation_estimation", "reasoning",
  ]);
  assert.equal(G4B_U04_PUBLIC_CONTROLS.publicPatternSpecInjection, false);
  assert.equal(G4B_U04_PUBLIC_CONTROLS.publicGenericFallback, false);
});

test("S72 resolver ignores arbitrary PatternSpec injection and derives authority scope", () => {
  const normalized = normalizeG4BU04ResolverPlan(basePlan());
  assert.equal(normalized.resolverResult.ok, true, JSON.stringify(normalized.resolverResult.errors));
  assert.deepEqual(normalized.patternSpecIds, ["ps_g4b_u04_round_half_up"]);
  assert.deepEqual(normalized.selectedPatternGroupIds, ["pg_g4b_u04_round_half_up"]);
  assert.equal(normalized.publicPatternSpecInjectionUsed, false);
  assert.equal(normalized.resolverResult.provenance.arbitraryPatternSpecInjectionIgnored, true);
  assert.equal(classifyG4BU04CanonicalRouterPlan(normalized), G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL);
});

test("S72 questionMode filters selector-derived groups and PatternSpecs", () => {
  const normalized = normalizeG4BU04ResolverPlan(basePlan({
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    questionMode: "operation_estimation",
    questionCount: 40,
  }));
  assert.equal(normalized.resolverResult.ok, true, JSON.stringify(normalized.resolverResult.errors));
  assert.deepEqual(normalized.selectedPatternGroupIds, [
    "pg_g4b_u04_estimate_add_subtract",
    "pg_g4b_u04_estimate_multiply_divide",
  ]);
  assert.deepEqual(normalized.patternSpecIds, [
    "ps_g4b_u04_round_then_add",
    "ps_g4b_u04_round_then_subtract",
    "ps_g4b_u04_round_then_multiply",
    "ps_g4b_u04_round_then_divide",
  ]);
  assert.equal(normalized.allocation.reduce((sum, row) => sum + row.questionCount, 0), 40);
});

test("S72 canonical plan rejects cross-unit, unlinked group and empty mode scopes", () => {
  const crossUnit = validateG4BU04CanonicalPlan(basePlan({
    selectedKnowledgePointIds: ["kp_g5a_u08_mixed_operation_order"],
  }));
  assert.equal(crossUnit.ok, false);
  assert.equal(errorCodes(crossUnit).has("G4B_U04_CANONICAL_KP_NOT_PROMOTED"), true);

  const unlinked = validateG4BU04CanonicalPlan(basePlan({
    selectedPatternGroupIds: ["pg_g4b_u04_payment_ceiling"],
  }));
  assert.equal(unlinked.ok, false);
  assert.equal(errorCodes(unlinked).has("G4B_U04_CANONICAL_GROUP_NOT_PROMOTED"), true);

  const emptyMode = validateG4BU04CanonicalPlan(basePlan({ questionMode: "application" }));
  assert.equal(emptyMode.ok, false);
  assert.equal(errorCodes(emptyMode).has("G4B_U04_CANONICAL_GROUP_NOT_RESOLVED"), true);
});

test("S72 generates a validated visible canonical question batch", () => {
  const result = generateG4BU04CanonicalQuestions(basePlan({ questionCount: 25 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 25);
  assert.equal(result.questions.every((row) => row.phase === "S72"), true);
  assert.equal(result.questions.every((row) => row.selectorStatus === "visible" && row.canonicalRouting === "enabled"), true);
  assert.equal(result.questions.every((row) => row.productionUse === "canonical_runtime_only"), true);
  assert.equal(result.questions.every((row) => validateG4BU04CanonicalQuestion(row).ok), true);
});

test("S72 mixed all-authority canonical generation reaches 19 specs and all five modes", () => {
  const result = generateG4BU04CanonicalQuestions(basePlan({
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    questionCount: 190,
    ordering: "shuffleAcrossPatterns",
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(new Set(result.questions.map((row) => row.patternSpecId)).size, 19);
  assert.deepEqual([...new Set(result.questions.map((row) => row.mode))].sort(), [
    "application", "concept", "numeric", "operation_estimation", "reasoning",
  ]);
  assert.equal(result.questions.some((row) => row.implementationClass === "C"), true);
  assert.equal(result.questions.some((row) => row.implementationClass === "D"), true);
  assert.equal(new Set(result.questions.map((row) => normalizeG4BU04PromptSignature(row.promptText))).size, 190);
});

test("S72 canonical generation is deterministic and duplicate-free through 1000 questions", () => {
  const plan = basePlan({
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    questionCount: 1000,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s72-stress",
  });
  const first = generateG4BU04CanonicalQuestions(plan);
  const second = generateG4BU04CanonicalQuestions(plan);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  assert.equal(Object.values(first.plan.patternAllocation).reduce((sum, count) => sum + count, 0), 1000);
  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);
  assert.equal(
    first.plan.patternAllocation.ps_g4b_u04_inverse_digit_set,
    G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_inverse_digit_set,
  );
  assert.equal(
    first.plan.patternAllocation.ps_g4b_u04_inverse_original_values,
    G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_inverse_original_values,
  );
  const signatures = first.questions.map((row) => normalizeG4BU04PromptSignature(row.promptText));
  assert.equal(new Set(signatures).size, 1000);
  assert.equal(first.deduplication.signatureCount, 1000);
});

test("S72 returns zero public output when the delegated integration validator blocks", () => {
  const result = generateG4BU04CanonicalQuestions(basePlan(), {
    integratedValidator: () => ({
      ok: false,
      errors: [{ code: "G4BU04_FORMULA_MISMATCH", severity: "error", path: "questions[0]" }],
      warnings: [],
      acceptedQuestions: [],
    }),
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.equal(errorCodes(result).has("G4BU04_FORMULA_MISMATCH"), true);
});

test("S72 browser question router dispatches G4B-U04 public selections to canonical runtime", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: "g4b_u04_4b04",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_round_half_up_place_value"],
    selectedPatternGroupIds: ["pg_g4b_u04_round_half_up"],
    questionMode: "numeric",
    questionCount: 12,
    ordering: "groupedByPattern",
    generationSeed: "s72-browser",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 12);
  assert.equal(result.plan.routeKind, G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL);
  assert.equal(result.questions.every((row) => row.patternSpecId === "ps_g4b_u04_round_half_up"), true);
});

test("S72 historical promotion contract remains unchanged beneath the R2C overlay", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(["implemented_pending_ci", "pass_ci_synced_and_merged"].includes(contract.status), true);
  assert.equal(contract.lifecycle.selectorStatus, "visible");
  assert.equal(contract.lifecycle.canonicalRouting, "enabled");
  assert.equal(contract.lifecycle.worksheetStatus, "not_eligible");
  assert.equal(contract.lifecycle.rendererStatus, "not_connected");
  assert.equal(contract.lifecycle.productionUse, "forbidden");
  assert.equal(contract.activation.requiredNextGate, "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration");
});
