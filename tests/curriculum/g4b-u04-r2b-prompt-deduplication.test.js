import assert from "node:assert/strict";
import test from "node:test";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  generateG4BU04CanonicalQuestions,
  normalizeG4BU04ResolverPlan,
  validateG4BU04CanonicalPlan,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import {
  G4B_U04_INVERSE_DIGIT_SET_CASES,
  G4B_U04_INVERSE_ORIGINAL_VALUE_CASES,
  validateG4BU04InverseUniqueCasePools,
} from "../../site/modules/curriculum/batch-b/g4b-u04-inverse-unique-case-pool.js";
import {
  G4B_U04_PROMPT_DEDUPLICATION_VERSION,
  allocateG4BU04UniquePromptCapacity,
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

function mixedPlan(overrides = {}) {
  return {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: [],
    questionMode: "mixed",
    questionCount: 40,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "g4b-u04-r2b",
    includeAnswerKey: true,
    ...overrides,
  };
}

function reasoningPlan(overrides = {}) {
  return mixedPlan({
    selectedKnowledgePointIds: [
      "kp_g4b_u04_inverse_rounding_unknown_digit",
      "kp_g4b_u04_inverse_rounding_possible_original",
    ],
    questionMode: "reasoning",
    questionCount: 24,
    generationSeed: "g4b-u04-r2b1-reasoning",
    ...overrides,
  });
}

function errorCodes(result) {
  return new Set((result.errors ?? []).map((row) => row.code));
}

function promptSignatures(questions) {
  return questions.map((row) => normalizeG4BU04PromptSignature(row.promptText));
}

test("R2B1 prompt signature normalizes Unicode and ASCII punctuation spacing", () => {
  assert.equal(
    normalizeG4BU04PromptSignature("  符號 ｢≈｣  讀作什麼 ？  "),
    "符號 「≈」 讀作什麼？",
  );
  assert.equal(
    normalizeG4BU04PromptSignature("有 4,683 張紙，  每 100 張綁成一束。"),
    "有 4,683 張紙，每 100 張綁成一束。",
  );
  assert.equal(normalizeG4BU04PromptSignature("這樣正確嗎 ?"), "這樣正確嗎？");
  assert.equal(normalizeG4BU04PromptSignature("注意 !"), "注意！");
});

test("R2B1 inverse case pools expose 12 plus 12 unique validator-ready cases", () => {
  const audit = validateG4BU04InverseUniqueCasePools();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(G4B_U04_INVERSE_DIGIT_SET_CASES.length, 12);
  assert.equal(G4B_U04_INVERSE_ORIGINAL_VALUE_CASES.length, 12);
});

test("R2B1 capacity-aware allocation caps finite pools and redistributes excess", () => {
  const ids = [
    "ps_g4b_u04_approx_symbol_reading",
    "ps_g4b_u04_inverse_digit_set",
    "ps_g4b_u04_inverse_original_values",
    "ps_g4b_u04_round_half_up",
  ];
  const result = allocateG4BU04UniquePromptCapacity(40, ids);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(Object.values(result.patternAllocation).reduce((sum, value) => sum + value, 0), 40);
  assert.equal(result.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_digit_set, 12);
  assert.equal(result.patternAllocation.ps_g4b_u04_inverse_original_values, 12);
  assert.equal(result.patternAllocation.ps_g4b_u04_round_half_up, 15);
});

test("R2B blocks a single fixed prompt PatternSpec when requested count exceeds unique capacity", () => {
  const plan = {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_approximation_symbol_reading"],
    selectedPatternGroupIds: [],
    questionMode: "concept",
    questionCount: 2,
    ordering: "groupedByPattern",
    generationSeed: "g4b-u04-r2b-symbol",
    includeAnswerKey: true,
  };
  const checked = validateG4BU04CanonicalPlan(plan);
  assert.equal(checked.ok, false);
  assert.equal(errorCodes(checked).has("G4B_U04_CANONICAL_UNIQUE_CAPACITY_EXCEEDED"), true);
});

test("R2B mixed 40-question canonical output contains no duplicate normalized prompts", () => {
  const normalized = normalizeG4BU04ResolverPlan(mixedPlan());
  assert.equal(normalized.resolverResult.ok, true, JSON.stringify(normalized.resolverResult.errors));
  assert.equal(normalized.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);
  assert.ok(normalized.patternAllocation.ps_g4b_u04_inverse_digit_set > 0);
  assert.ok(normalized.patternAllocation.ps_g4b_u04_inverse_digit_set <= 12);
  assert.ok(normalized.patternAllocation.ps_g4b_u04_inverse_original_values > 0);
  assert.ok(normalized.patternAllocation.ps_g4b_u04_inverse_original_values <= 12);

  const result = generateG4BU04CanonicalQuestions(normalized);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 40);
  const signatures = promptSignatures(result.questions);
  assert.equal(new Set(signatures).size, 40);
  assert.equal(result.deduplication.version, G4B_U04_PROMPT_DEDUPLICATION_VERSION);
  assert.equal(result.deduplication.signatureCount, 40);
  assert.equal(result.deduplication.generatedQuestionCount, 40);
  assert.ok(result.deduplication.totalAttempts >= 40);
  assert.equal(result.questions.every((row) => row.metadata.promptSignature === normalizeG4BU04PromptSignature(row.promptText)), true);
});

test("R2B1 reasoning mode generates 24 validated unique inverse prompts", () => {
  const result = generateG4BU04CanonicalQuestions(reasoningPlan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 24);
  assert.equal(result.plan.patternAllocation.ps_g4b_u04_inverse_digit_set, 12);
  assert.equal(result.plan.patternAllocation.ps_g4b_u04_inverse_original_values, 12);
  assert.equal(result.questions.every((row) => row.mode === "reasoning"), true);
  assert.equal(new Set(promptSignatures(result.questions)).size, 24);
});

test("R2B 1000-question mixed generation remains deterministic and duplicate-free", () => {
  const plan = mixedPlan({ questionCount: 1000, generationSeed: "g4b-u04-r2b-stress" });
  const first = generateG4BU04CanonicalQuestions(plan);
  const second = generateG4BU04CanonicalQuestions(plan);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  const signatures = promptSignatures(first.questions);
  assert.equal(signatures.length, 1000);
  assert.equal(new Set(signatures).size, 1000);
  assert.equal(first.plan.patternAllocation.ps_g4b_u04_approx_symbol_reading, 1);
  assert.equal(first.plan.patternAllocation.ps_g4b_u04_inverse_digit_set, 12);
  assert.equal(first.plan.patternAllocation.ps_g4b_u04_inverse_original_values, 12);
});
