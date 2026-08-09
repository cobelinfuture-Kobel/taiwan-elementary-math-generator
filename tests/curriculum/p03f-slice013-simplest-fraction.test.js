import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f13.js";
import { generateG5AU04SimplestFractionQuestions, validateG5AU04SimplestFractionQuestion } from "../../site/modules/curriculum/batch-a/simplest-fraction-runtime.js";
import { generateG5AU04QuotientFractionQuestions, validateG5AU04QuotientFractionQuestion, P03F13_QUOTIENT_APPLICATION_AUTHORITY } from "../../site/modules/curriculum/batch-a/quotient-as-fraction-context-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5a-u04-expand-reduce-simplest-selector-projection.js";
import { listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const SLICE_CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];
const SIMPLEST_CAPS = ["cap_fraction_domain_validator", "cap_fraction_number_system"];
const QUOTIENT_CAPS = SLICE_CAPS;
const simplestPlan = (overrides = {}) => ({
  sourceId: G5A_U04_SOURCE_ID, selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID], selectedPatternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
  questionMode: "numeric", questionCount: 9, ordering: "groupedByPattern", includeAnswerKey: true,
  generationSeed: "p03f13-focused", printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true }, ...overrides,
});
const quotientPlan = (mode, overrides = {}) => ({
  sourceId: G5A_U04_SOURCE_ID, selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5A_U04_QUOTIENT_CONTEXT_KP_ID],
  selectedPatternGroupIds: [mode === "application" ? G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID : G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID],
  questionMode: mode, questionCount: 3, ordering: "groupedByPattern", includeAnswerKey: true,
  generationSeed: `p03f13-quotient-${mode}`, printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true }, ...overrides,
});
function gcd(a, b) { let x = Math.abs(a); let y = Math.abs(b); while (y !== 0) [x, y] = [y, x % y]; return x; }

test("P03F13 consumes exact frozen queue position 13 with two KPs", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[12];
  assert.equal(slice.queuePosition, 13);
  assert.equal(slice.sliceId, "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1");
  assert.deepEqual(slice.knowledgePointIds, [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID, G5A_U04_QUOTIENT_CONTEXT_KP_ID]);
  assert.deepEqual(slice.requiredW3CapabilityIds, SLICE_CAPS);
});

test("P03F13 source default remains simplest while explicit quotient routes by mode", () => {
  assert.deepEqual(buildBatchABrowserPlan(simplestPlan()).patternSpecIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS);
  assert.deepEqual(buildBatchABrowserPlan({ sourceId: G5A_U04_SOURCE_ID, selectionMode: "sourceUnit", questionMode: "numeric", questionCount: 3 }).patternSpecIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS);
  assert.deepEqual(buildBatchABrowserPlan(quotientPlan("numeric")).patternSpecIds, [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID]);
  assert.deepEqual(buildBatchABrowserPlan(quotientPlan("application")).patternSpecIds, [G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID]);
});

test("P03F13 deterministically generates nine balanced simplest-fraction witnesses", () => {
  const first = generateG5AU04SimplestFractionQuestions(simplestPlan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(first.questions.length, 9);
  assert.deepEqual(first.allocation.map((row) => row.questionCount), [3, 3, 3]);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 9);
  for (const question of first.questions) {
    assert.equal(question.commonFactor, gcd(question.numerator, question.denominator));
    assert.equal(question.simplestNumerator, question.numerator / question.commonFactor);
    assert.equal(question.simplestDenominator, question.denominator / question.commonFactor);
    assert.deepEqual(question.metadata.requiredCapabilityIds, SIMPLEST_CAPS);
    assert.equal(validateG5AU04SimplestFractionQuestion(question).ok, true);
  }
});

test("P03F13 quotient numeric and application share exact reduced answer model", () => {
  for (const mode of ["numeric", "application"]) {
    const result = generateG5AU04QuotientFractionQuestions(quotientPlan(mode));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 3);
    for (const question of result.questions) {
      assert.equal(question.sharePerRecipient.numerator * question.recipientCount, question.totalQuantity * question.sharePerRecipient.denominator);
      assert.deepEqual(question.metadata.requiredCapabilityIds, QUOTIENT_CAPS);
      assert.equal(validateG5AU04QuotientFractionQuestion(question).ok, true);
      if (mode === "application") {
        assert.equal(question.metadata.bindingCandidateId, P03F13_QUOTIENT_APPLICATION_AUTHORITY.bindingCandidateId);
        assert.equal(question.metadata.contextLineage.atomicEpisodeId, "gctx_episode_crop_batch_plan_direct_quantity");
      }
    }
  }
});

test("P03F13 validators reject simplest and quotient tampering", () => {
  const simplest = generateG5AU04SimplestFractionQuestions(simplestPlan({ questionCount: 1 })).questions[0];
  assert.equal(validateG5AU04SimplestFractionQuestion({ ...simplest, commonFactor: simplest.commonFactor + 1 }).ok, false);
  const quotient = generateG5AU04QuotientFractionQuestions(quotientPlan("application", { questionCount: 1 })).questions[0];
  assert.equal(validateG5AU04QuotientFractionQuestion({ ...quotient, totalQuantity: quotient.totalQuantity + 1 }).ok, false);
  assert.equal(validateG5AU04QuotientFractionQuestion({ ...quotient, metadata: { ...quotient.metadata, bindingCandidateId: "wrong" } }).ok, false);
});

test("P03F13 historical selector stays two KPs while current Pixel advances through Slice030 monotonically", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5A_U04_SOURCE_ID);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.knowledgePointId), [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID, G5A_U04_QUOTIENT_CONTEXT_KP_ID]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_SOURCE_ID);
  assert.equal(availability.visibleCount, 2);
  assert.equal(availability.hiddenPendingCount, 5);
  assert.equal(listCurrentPixelSourceOptions().length, 30);
  const currentPixelRows = listPixelKnowledgePointsForSource(G5A_U04_SOURCE_ID);
  assert.equal(currentPixelRows.length, 5);
  assert.deepEqual(currentPixelRows.slice(0, 2).map((row) => row.knowledgePointId), [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID, G5A_U04_QUOTIENT_CONTEXT_KP_ID]);
  assert.deepEqual(currentPixelRows.slice(2, 4).map((row) => row.knowledgePointId), ["kp_g5a_u04_common_denominator", "kp_g5a_u04_divisibility_supported_reduction"]);
  assert.equal(currentPixelRows[4].knowledgePointId, "kp_g5a_u04_unlike_fraction_compare");
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 30);
});

test("P03F13 shared worksheets render all three public paths", () => {
  for (const request of [simplestPlan(), quotientPlan("numeric"), quotientPlan("application")]) {
    const result = buildWorksheetDocumentFromPlan(request);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.generatedQuestions.length, request.questionCount);
    assert.equal(result.worksheetDocument.answerKeyItems.length, request.questionCount);
    assert.equal(result.worksheetDocument.questionPages.length, 1);
    assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
  }
});
