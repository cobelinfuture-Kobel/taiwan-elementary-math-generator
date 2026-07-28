import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f13.js";
import {
  generateG5AU04SimplestFractionQuestions,
  validateG5AU04SimplestFractionQuestion,
} from "../../site/modules/curriculum/batch-a/simplest-fraction-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u04-expand-reduce-simplest-selector-projection.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const CAPS = [
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
];
const plan = (overrides = {}) => ({
  sourceId: G5A_U04_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID],
  selectedPatternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
  questionMode: "numeric",
  questionCount: 9,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f13-focused",
  printLayout: {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 5,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
  ...overrides,
});

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

test("P03F13 consumes exact frozen queue position 13", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[12];
  assert.equal(slice.queuePosition, 13);
  assert.equal(slice.sliceId, "p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1");
  assert.deepEqual(slice.knowledgePointIds, [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID]);
  assert.deepEqual(slice.requiredW3CapabilityIds, CAPS);
});

test("P03F13 source-unit and explicit KP planning resolve the same three specs", () => {
  const explicit = buildBatchABrowserPlan(plan());
  assert.deepEqual(explicit.patternSpecIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS);
  const sourceDefault = buildBatchABrowserPlan({
    sourceId: G5A_U04_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionMode: "numeric",
    questionCount: 3,
    generationSeed: "p03f13-source-default",
  });
  assert.deepEqual(sourceDefault.patternSpecIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS);
});

test("P03F13 deterministically generates nine unique balanced simplest-fraction witnesses", () => {
  const first = generateG5AU04SimplestFractionQuestions(plan());
  const second = generateG5AU04SimplestFractionQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 9);
  assert.deepEqual(first.allocation.map((row) => row.questionCount), [3, 3, 3]);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 9);
  for (const question of first.questions) {
    assert.equal(question.commonFactor, gcd(question.numerator, question.denominator));
    assert.equal(question.simplestNumerator, question.numerator / question.commonFactor);
    assert.equal(question.simplestDenominator, question.denominator / question.commonFactor);
    assert.equal(gcd(question.simplestNumerator, question.simplestDenominator), 1);
    assert.equal(question.answerText, String(question[question.requestedUnknownRole]));
    assert.deepEqual(question.metadata.requiredCapabilityIds, CAPS);
    assert.equal(validateG5AU04SimplestFractionQuestion(question).ok, true);
  }
});

test("P03F13 validator rejects factor, simplest form, answer and scope tampering", () => {
  const question = generateG5AU04SimplestFractionQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG5AU04SimplestFractionQuestion({ ...question, commonFactor: question.commonFactor + 1 }).ok, false);
  assert.equal(validateG5AU04SimplestFractionQuestion({ ...question, simplestNumerator: question.simplestNumerator + 1 }).ok, false);
  assert.equal(validateG5AU04SimplestFractionQuestion({ ...question, answerText: "99" }).ok, false);
  assert.equal(validateG5AU04SimplestFractionQuestion({ ...question, questionMode: "application" }).ok, false);
});

test("P03F13 selector and current Pixel add one source and one visible KP", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5A_U04_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID);
  assert.deepEqual(rows[0].patternSpecIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 4);
  assert.equal(listCurrentPixelSourceOptions().length, 26);
  assert.equal(listPixelKnowledgePointsForSource(G5A_U04_SOURCE_ID).length, 1);
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 26);
});

test("P03F13 shared worksheet and answer key render nine items on bounded pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 9);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 9);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
});
