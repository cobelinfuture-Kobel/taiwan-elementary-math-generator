import assert from "node:assert/strict";
import test from "node:test";

import {
  G4B_U04_ALLOWLISTED_SDG_GOALS,
  G4B_U04_CONTEXT_CONTRACT_VERSION,
  G4B_U04_CONTEXT_MODES,
  G4B_U04_CONTROLLED_SDG_VARIANTS,
  G4B_U04_SDG_ELIGIBLE_PATTERN_SPEC_IDS,
  normalizeG4BU04ContextMode,
  validateG4BU04ControlledContextQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-controlled-context-variants.js";
import {
  generateG4BU04CanonicalQuestions,
  validateG4BU04CanonicalQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router-r2e.js";
import {
  G4B_U04_PROMOTION_LIFECYCLE,
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_R2E_CONTEXT_LIFECYCLE,
  validateG4BU04PromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import { normalizeG4BU04PromptSignature } from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const SOURCE_ID = "g4b_u04_4b04";

function plan({
  knowledgePointId = "kp_g4b_u04_round_then_add_subtract",
  patternGroupId = "pg_g4b_u04_estimate_add_subtract",
  questionMode = "operation_estimation",
  contextMode = "mixed",
  questionCount = 18,
  seed = "r2e-context",
} = {}) {
  return {
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionMode,
    contextMode,
    questionCount,
    ordering: "groupedByPattern",
    generationSeed: seed,
    includeAnswerKey: true,
  };
}

function clone(value) {
  return structuredClone(value);
}

function codes(result) {
  return new Set((result.errors ?? []).map((entry) => entry.code));
}

test("R2E registers three context modes and preserves 13/13/19 authority", () => {
  assert.deepEqual(G4B_U04_CONTEXT_MODES, ["mixed", "daily_life", "sdg"]);
  assert.equal(G4B_U04_PUBLIC_CONTROLS.defaults.contextMode, "mixed");
  assert.deepEqual(G4B_U04_PUBLIC_CONTROLS.contextModes, G4B_U04_CONTEXT_MODES);
  assert.equal(normalizeG4BU04ContextMode("unsupported"), "mixed");
  const promotion = validateG4BU04PromotionProjection();
  assert.equal(promotion.ok, true, promotion.errors.join(","));
  assert.deepEqual(promotion.counts, { knowledgePoints: 13, patternGroups: 13, patternSpecs: 19 });
  assert.equal(G4B_U04_PROMOTION_LIFECYCLE.worksheetStatus, "not_eligible");
  assert.equal(G4B_U04_PROMOTION_LIFECYCLE.productionUse, "forbidden");
  assert.equal(G4B_U04_R2E_CONTEXT_LIFECYCLE.promotionAuthorityMutated, false);
  assert.equal(G4B_U04_R2E_CONTEXT_LIFECYCLE.curriculumAuthorityMutated, false);
});

test("R2E SDG registry covers only approved mappings and all six allowlisted goals", () => {
  assert.deepEqual(G4B_U04_SDG_ELIGIBLE_PATTERN_SPEC_IDS, [
    "ps_g4b_u04_floor_complete_groups",
    "ps_g4b_u04_ceiling_minimum_required",
    "ps_g4b_u04_round_then_add",
    "ps_g4b_u04_round_then_subtract",
    "ps_g4b_u04_round_then_multiply",
    "ps_g4b_u04_round_then_divide",
  ]);
  const variants = Object.values(G4B_U04_CONTROLLED_SDG_VARIANTS);
  assert.ok(variants.length >= 12);
  assert.deepEqual([...new Set(variants.map((entry) => entry.sdgGoal))].sort((a, b) => a - b), G4B_U04_ALLOWLISTED_SDG_GOALS);
  assert.equal(variants.every((entry) => G4B_U04_SDG_ELIGIBLE_PATTERN_SPEC_IDS.includes(entry.patternSpecId)), true);
});

test("R2E daily_life preserves the original validator-backed prompts", () => {
  const result = generateG4BU04CanonicalQuestions(plan({ contextMode: "daily_life", questionCount: 12, seed: "r2e-daily" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.contextAllocation.counts.sdg, 0);
  assert.equal(result.contextAllocation.counts.daily_life, 12);
  assert.equal(result.questions.every((question) => question.contextModeApplied === "daily_life"), true);
  assert.equal(result.questions.every((question) => question.sdgGoal === null), true);
  assert.equal(result.questions.every((question) => validateG4BU04CanonicalQuestion(question).ok), true);
  assert.equal(new Set(result.questions.map((question) => normalizeG4BU04PromptSignature(question.promptText))).size, 12);
});

test("R2E sdg applies allowlisted fictional variants to every eligible question", () => {
  const result = generateG4BU04CanonicalQuestions(plan({ contextMode: "sdg", questionCount: 18, seed: "r2e-sdg" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.contextAllocation.counts.sdg, 18);
  assert.equal(result.contextAllocation.counts.daily_life, 0);
  assert.equal(result.questions.every((question) => question.contextContractVersion === G4B_U04_CONTEXT_CONTRACT_VERSION), true);
  assert.equal(result.questions.every((question) => question.contextModeApplied === "sdg"), true);
  assert.equal(result.questions.every((question) => G4B_U04_ALLOWLISTED_SDG_GOALS.includes(question.sdgGoal)), true);
  assert.equal(result.questions.every((question) => question.context.fictionalExerciseData === true), true);
  assert.equal(result.questions.every((question) => question.context.currentRealWorldStatistic === false), true);
  assert.equal(result.questions.every((question) => question.context.persuasion === false), true);
  assert.equal(result.questions.every((question) => question.context.fearBasedLanguage === false), true);
  assert.equal(result.questions.every((question) => validateG4BU04CanonicalQuestion(question).ok), true);
});

test("R2E mixed uses deterministic approximately one-third SDG allocation", () => {
  const first = generateG4BU04CanonicalQuestions(plan({ contextMode: "mixed", questionCount: 18, seed: "r2e-mixed" }));
  const second = generateG4BU04CanonicalQuestions(plan({ contextMode: "mixed", questionCount: 18, seed: "r2e-mixed" }));
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  assert.deepEqual(first.contextAllocation.counts, { daily_life: 12, sdg: 6, not_applicable: 0 });
  assert.equal(first.contextAllocation.sdgShareAmongEligible, 1 / 3);
});

test("R2E small mixed worksheets do not force an SDG item", () => {
  const result = generateG4BU04CanonicalQuestions(plan({ contextMode: "mixed", questionCount: 2, seed: "r2e-small" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.contextAllocation.counts, { daily_life: 2, sdg: 0, not_applicable: 0 });
});

test("R2E keeps payment and source-backed discount questions source-faithful in sdg mode", () => {
  for (const options of [
    {
      knowledgePointId: "kp_g4b_u04_payment_denomination_ceiling",
      patternGroupId: "pg_g4b_u04_payment_ceiling",
      seed: "r2e-payment",
    },
    {
      knowledgePointId: "kp_g4b_u04_discount_denomination_round_down",
      patternGroupId: "pg_g4b_u04_discount_round_down",
      seed: "r2e-discount",
    },
  ]) {
    const result = generateG4BU04CanonicalQuestions(plan({
      ...options,
      questionMode: "application",
      contextMode: "sdg",
      questionCount: 8,
    }));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.deepEqual(result.contextAllocation.counts, { daily_life: 0, sdg: 0, not_applicable: 8 });
    assert.equal(result.questions.every((question) => question.contextModeApplied === "not_applicable"), true);
    assert.equal(result.questions.every((question) => question.contextVariantId === null), true);
    assert.equal(result.questions.every((question) => question.sdgGoal === null), true);
    assert.equal(result.questions.every((question) => validateG4BU04CanonicalQuestion(question).ok), true);
  }
});

test("R2E does not force SDG wording onto Class C concept questions", () => {
  const result = generateG4BU04CanonicalQuestions(plan({
    knowledgePointId: "kp_g4b_u04_approximation_language_cues",
    patternGroupId: "pg_g4b_u04_approximation_language",
    questionMode: "concept",
    contextMode: "sdg",
    questionCount: 6,
    seed: "r2e-concept",
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.contextAllocation.counts, { daily_life: 0, sdg: 0, not_applicable: 6 });
  assert.equal(result.questions.every((question) => question.implementationClass === "C"), true);
  assert.equal(result.questions.every((question) => question.contextVariantId === undefined), true);
});

test("R2E validator blocks math mutation, unknown variants and unsafe claims", () => {
  const result = generateG4BU04CanonicalQuestions(plan({ contextMode: "sdg", questionCount: 6, seed: "r2e-block" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const original = result.questions[0];

  const mathMutation = clone(original);
  mathMutation.finalAnswer += 1;
  assert.equal(validateG4BU04ControlledContextQuestion(mathMutation).ok, false);
  assert.equal(codes(validateG4BU04ControlledContextQuestion(mathMutation)).has("G4BU04_R2E_MATH_AUTHORITY_MUTATED"), true);

  const unknownVariant = clone(original);
  unknownVariant.contextVariantId = "sdg99_unknown";
  assert.equal(validateG4BU04ControlledContextQuestion(unknownVariant).ok, false);
  assert.equal(codes(validateG4BU04ControlledContextQuestion(unknownVariant)).has("G4BU04_R2E_SDG_VARIANT_NOT_ALLOWLISTED"), true);

  const unsafe = clone(original);
  unsafe.promptText += " 這是最新數據，大家一定要支持候選人。";
  const unsafeValidation = validateG4BU04ControlledContextQuestion(unsafe);
  assert.equal(unsafeValidation.ok, false);
  assert.equal(codes(unsafeValidation).has("G4BU04_R2E_CONTEXT_SAFETY_VIOLATION"), true);
});
