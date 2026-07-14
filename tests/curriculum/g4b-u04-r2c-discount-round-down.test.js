import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_EFFECTIVE_PATTERN_GROUPS,
  G4B_U04_EFFECTIVE_PATTERN_SPECS,
  G4B_U04_HIDDEN_PATTERN_GROUPS,
  G4B_U04_HIDDEN_PATTERN_SPECS,
  G4B_U04_R2C_PATTERN_GROUPS,
  G4B_U04_R2C_PATTERN_SPECS,
  getG4BU04HiddenPatternSpecById,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  validateG4BU04PromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  validateG4BU04VisibleSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  generateG4BU04ClassDQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-d-semantic-generator.js";
import {
  validateG4BU04ClassDQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-d-semantic-validator.js";
import {
  G4B_U04_S71_ALL_PATTERN_SPEC_IDS,
  generateG4BU04IntegratedBatch,
  validateG4BU04IntegratedBatch,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-c-d-integration-gate.js";
import {
  generateG4BU04CanonicalQuestions,
  validateG4BU04CanonicalQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  generateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";

const KP_ID = "kp_g4b_u04_discount_denomination_round_down";
const GROUP_ID = "pg_g4b_u04_discount_round_down";
const AMOUNT_SPEC_ID = "ps_g4b_u04_discount_payment_amount_round_down";
const COUNT_SPEC_ID = "ps_g4b_u04_discount_banknote_count_round_down";
const SOURCE_EVIDENCE_ID = "r2c:source-overview:p1:discount-whole-thousands";

const MAPPING_OVERLAY_PATH = new URL(
  "../../data/curriculum/mapping/G4B_U04_R2C_DiscountRoundDownMappingCandidateOverlay.json",
  import.meta.url,
);
const FORMAL_OVERLAY_PATH = new URL(
  "../../data/curriculum/mapping/G4B_U04_R2C_DiscountRoundDownFormalMappingOverlay.json",
  import.meta.url,
);
const PATTERN_OVERLAY_PATH = new URL(
  "../../data/curriculum/pattern_specs/G4B_U04_R2C_DiscountRoundDownPatternSpecOverlay.json",
  import.meta.url,
);
const PROMOTION_OVERLAY_PATH = new URL(
  "../../data/curriculum/registry/promotions/G4B_U04_R2C_DiscountRoundDownPromotionOverlay.json",
  import.meta.url,
);

function clone(value) {
  return structuredClone(value);
}

function errorCodes(result) {
  return new Set((result.errors ?? []).map((row) => row.code));
}

function canonicalPlan(overrides = {}) {
  return {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [],
    questionMode: "application",
    questionCount: 20,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "g4b-u04-r2c-discount",
    includeAnswerKey: true,
    ...overrides,
  };
}

test("R2C preserves the S68 12/17 base and appends exactly one group plus two specs", () => {
  assert.equal(G4B_U04_HIDDEN_PATTERN_GROUPS.length, 12);
  assert.equal(G4B_U04_HIDDEN_PATTERN_SPECS.length, 17);
  assert.equal(G4B_U04_R2C_PATTERN_GROUPS.length, 1);
  assert.equal(G4B_U04_R2C_PATTERN_SPECS.length, 2);
  assert.equal(G4B_U04_EFFECTIVE_PATTERN_GROUPS.length, 13);
  assert.equal(G4B_U04_EFFECTIVE_PATTERN_SPECS.length, 19);
  assert.deepEqual(G4B_U04_EFFECTIVE_PATTERN_GROUPS.slice(0, 12), G4B_U04_HIDDEN_PATTERN_GROUPS);
  assert.deepEqual(G4B_U04_EFFECTIVE_PATTERN_SPECS.slice(0, 17), G4B_U04_HIDDEN_PATTERN_SPECS);
  assert.deepEqual(G4B_U04_R2C_PATTERN_GROUPS.map((row) => row.patternGroupId), [GROUP_ID]);
  assert.deepEqual(G4B_U04_R2C_PATTERN_SPECS.map((row) => row.patternSpecId), [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.deepEqual(G4B_U04_R2C_PATTERN_SPECS.map((row) => row.patternOrder), [18, 19]);
  assert.equal(G4B_U04_R2C_PATTERN_SPECS.every((row) => row.sourceEvidence.includes(SOURCE_EVIDENCE_ID)), true);
});

test("R2C overlay JSONs close source-to-promotion traceability without mutating historical files", () => {
  const mapping = JSON.parse(readFileSync(MAPPING_OVERLAY_PATH, "utf8"));
  const formal = JSON.parse(readFileSync(FORMAL_OVERLAY_PATH, "utf8"));
  const patterns = JSON.parse(readFileSync(PATTERN_OVERLAY_PATH, "utf8"));
  const promotion = JSON.parse(readFileSync(PROMOTION_OVERLAY_PATH, "utf8"));
  assert.equal(mapping.sourceRef.evidenceId, SOURCE_EVIDENCE_ID);
  assert.match(mapping.sourceRef.sourcePrompt, /特價只算整千元/);
  assert.equal(mapping.knowledgePoint.knowledgePointId, KP_ID);
  assert.equal(mapping.formalMappingCandidates.length, 2);
  assert.deepEqual(formal.formalMappings.map((row) => row.patternSpecId), [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.deepEqual(patterns.patternSpecs.map((row) => row.patternOrder), [18, 19]);
  assert.deepEqual(promotion.addedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(promotion.addedPatternGroupIds, [GROUP_ID]);
  assert.deepEqual(promotion.addedPatternSpecIds, [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.deepEqual(promotion.effectiveCounts, {
    knowledgePoints: 13,
    patternGroups: 13,
    patternSpecs: 19,
    classC: 9,
    classD: 10,
    concept: 4,
    numeric: 3,
    application: 6,
    operationEstimation: 4,
    reasoning: 2,
  });
});

test("R2C promotion and selector expose the exact 13/13/19 effective authority", () => {
  const promotion = validateG4BU04PromotionProjection();
  const selector = validateG4BU04VisibleSelectorProjection();
  assert.equal(promotion.ok, true, promotion.errors.join(","));
  assert.equal(selector.ok, true, selector.errors.join(","));
  assert.equal(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length, 13);
  assert.equal(G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length, 13);
  assert.equal(G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length, 19);
  const kp = getVisibleBatchAKnowledgePoint(KP_ID);
  const groups = getVisiblePatternGroupsForKnowledgePoint(KP_ID);
  assert.equal(kp.knowledgePointId, KP_ID);
  assert.deepEqual(kp.patternGroupIds, [GROUP_ID]);
  assert.deepEqual(kp.patternSpecIds, [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].patternSpecIds, [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.deepEqual(groups[0].promotionRegistryIds, [
    "s72_g4b_u04_rounding_approximation_promotion",
    "g4b_u04_r2c_discount_round_down_promotion",
  ]);
});

test("R2C amount and banknote generators are deterministic and validator-backed", () => {
  for (const patternSpecId of [AMOUNT_SPEC_ID, COUNT_SPEC_ID]) {
    const first = generateG4BU04ClassDQuestion({ patternSpecId, seed: "r2c-formula", sequence: 7 });
    const second = generateG4BU04ClassDQuestion({ patternSpecId, seed: "r2c-formula", sequence: 7 });
    assert.deepEqual(first, second);
    assert.equal(validateG4BU04ClassDQuestion(first).ok, true);
    assert.equal(first.input.denomination, 1000);
    assert.equal(first.input.discountPolicy, "whole_denomination_round_down");
    assert.equal(first.context.contextDomain, "discount_price");
    assert.equal(first.context.productName, "除濕機");
    assert.match(first.promptText, /特價只算整千元/);
    const expectedAmount = Math.floor(first.input.price / 1000) * 1000;
    const expectedCount = Math.floor(first.input.price / 1000);
    assert.equal(first.derived.discountedAmount, expectedAmount);
    assert.equal(first.derived.count, expectedCount);
    assert.equal(expectedAmount < first.input.price, true);
    if (patternSpecId === AMOUNT_SPEC_ID) {
      assert.equal(first.finalAnswer, expectedAmount);
      assert.equal(first.structuredAnswer.amount, expectedAmount);
    } else {
      assert.equal(first.finalAnswer, expectedCount);
      assert.equal(first.structuredAnswer.count, expectedCount);
      assert.equal(first.structuredAnswer.count * 1000, expectedAmount);
    }
  }
});

test("R2C blocks ceiling reinterpretation of both discount answer models", () => {
  const amount = clone(generateG4BU04ClassDQuestion({ patternSpecId: AMOUNT_SPEC_ID, seed: "r2c-ceiling", sequence: 1 }));
  const ceilingAmount = Math.ceil(amount.input.price / 1000) * 1000;
  amount.finalAnswer = ceilingAmount;
  amount.structuredAnswer.amount = ceilingAmount;
  const amountResult = validateG4BU04ClassDQuestion(amount);
  assert.equal(amountResult.ok, false);
  assert.equal(errorCodes(amountResult).has("G4BU04_ANSWER_MODEL_MISMATCH"), true);

  const count = clone(generateG4BU04ClassDQuestion({ patternSpecId: COUNT_SPEC_ID, seed: "r2c-ceiling", sequence: 1 }));
  const ceilingCount = Math.ceil(count.input.price / 1000);
  count.finalAnswer = ceilingCount;
  count.structuredAnswer.count = ceilingCount;
  const countResult = validateG4BU04ClassDQuestion(count);
  assert.equal(countResult.ok, false);
  assert.equal(errorCodes(countResult).has("G4BU04_ANSWER_MODEL_MISMATCH"), true);
});

test("R2C full integration covers all 19 specs and validates the two appended Class D routes", () => {
  assert.equal(G4B_U04_S71_ALL_PATTERN_SPEC_IDS.length, 19);
  assert.deepEqual(G4B_U04_S71_ALL_PATTERN_SPEC_IDS.slice(-2), [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  const batch = generateG4BU04IntegratedBatch({ questionCount: 38, seed: "r2c-integration" });
  const validation = validateG4BU04IntegratedBatch(batch);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(batch.patternAllocation[AMOUNT_SPEC_ID], 2);
  assert.equal(batch.patternAllocation[COUNT_SPEC_ID], 2);
  assert.deepEqual(batch.classAllocation, { C: 18, D: 20 });
  assert.deepEqual(batch.modeAllocation, {
    concept: 8,
    numeric: 6,
    application: 12,
    operation_estimation: 8,
    reasoning: 4,
  });
});

test("R2C single-KP canonical runtime generates 20 unique validated discount prompts", () => {
  const first = generateG4BU04CanonicalQuestions(canonicalPlan());
  const second = generateG4BU04CanonicalQuestions(canonicalPlan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 20);
  assert.deepEqual(first.plan.patternSpecIds, [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.equal(first.questions.every((row) => row.knowledgePointId === KP_ID), true);
  assert.equal(first.questions.every((row) => [AMOUNT_SPEC_ID, COUNT_SPEC_ID].includes(row.patternSpecId)), true);
  assert.equal(first.questions.every((row) => validateG4BU04CanonicalQuestion(row).ok), true);
  const signatures = first.questions.map((row) => normalizeG4BU04PromptSignature(row.promptText));
  assert.equal(new Set(signatures).size, 20);
});

test("R2C browser router dispatches the new KnowledgePoint through canonical runtime", () => {
  const result = generateBatchABrowserQuestions(canonicalPlan({
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 12,
    ordering: "groupedByPattern",
    generationSeed: "r2c-browser",
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 12);
  assert.deepEqual(result.plan.patternSpecIds, [AMOUNT_SPEC_ID, COUNT_SPEC_ID]);
  assert.equal(result.questions.every((row) => row.knowledgePointId === KP_ID), true);
});

test("R2C authority lookups resolve overlay specs while preserving hidden lifecycle", () => {
  for (const patternSpecId of [AMOUNT_SPEC_ID, COUNT_SPEC_ID]) {
    const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
    assert.ok(spec);
    assert.equal(spec.patternGroupId, GROUP_ID);
    assert.equal(spec.knowledgePointId, KP_ID);
    assert.equal(spec.implementationClass, "D");
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.productionUse, "forbidden");
  }
});
