import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f12.js";
import {
  generateG4BU08EquivalenceCrossProductQuestions,
  validateG4BU08EquivalenceCrossProductQuestion,
} from "../../site/modules/curriculum/batch-a/equivalence-cross-product-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-equivalent-fraction-selector-projection.js";
import {
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
} from "../../site/modules/curriculum/registry/g4b-u08-equivalence-cross-product-selector-projection.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f12-extension.js";
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
  sourceId: G4B_U08_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID],
  selectedPatternGroupIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f12-focused",
  printLayout: {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
  },
  ...overrides,
});

test("P03F12 consumes exact frozen queue position 12", () => {
  const slice = materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[11];
  assert.equal(slice.queuePosition, 12);
  assert.equal(slice.sliceId, "p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1");
  assert.equal(slice.previousSliceId, "p03e_q011_r6_g4b_u06_4b06_profile_decimal_c1");
  assert.deepEqual(slice.knowledgePointIds, [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID]);
  assert.deepEqual(slice.requiredW3CapabilityIds, CAPS);
});

test("P03F12 preserves source-unit default while explicit KP selects the new spec", () => {
  const explicit = buildBatchABrowserPlan(plan());
  assert.deepEqual(explicit.patternSpecIds, [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID]);
  const sourceDefault = buildBatchABrowserPlan({
    sourceId: G4B_U08_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionMode: "numeric",
    questionCount: 3,
    generationSeed: "p03f12-source-default",
  });
  assert.deepEqual(sourceDefault.patternSpecIds, G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS);
});

test("P03F12 generates eight deterministic unique exact judgments", () => {
  const first = generateG4BU08EquivalenceCrossProductQuestions(plan());
  const second = generateG4BU08EquivalenceCrossProductQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  assert.ok(first.questions.some((row) => row.equivalent));
  assert.ok(first.questions.some((row) => !row.equivalent));
  for (const question of first.questions) {
    assert.equal(
      question.equivalent,
      question.leftNumerator * question.rightDenominator
        === question.rightNumerator * question.leftDenominator,
    );
    assert.equal(question.answerText, question.equivalent ? "是" : "否");
    assert.deepEqual(question.metadata.requiredCapabilityIds, CAPS);
    assert.equal(validateG4BU08EquivalenceCrossProductQuestion(question).ok, true);
  }
});

test("P03F12 validator rejects cross-product, answer and scope tampering", () => {
  const question = generateG4BU08EquivalenceCrossProductQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG4BU08EquivalenceCrossProductQuestion({ ...question, leftCrossProduct: question.leftCrossProduct + 1 }).ok, false);
  assert.equal(validateG4BU08EquivalenceCrossProductQuestion({ ...question, answerText: "錯" }).ok, false);
  assert.equal(validateG4BU08EquivalenceCrossProductQuestion({ ...question, leftDenominator: 0 }).ok, false);
  assert.equal(validateG4BU08EquivalenceCrossProductQuestion({ ...question, questionMode: "application" }).ok, false);
});

test("P03F12 selector remains two G4B-U08 KPs while current Pixel includes later Slice020 monotonically", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_SOURCE_ID);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.knowledgePointId), [
    "kp_g4b_u08_generate_equivalent_fraction",
    G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  ]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);
  assert.equal(availability.visibleCount, 2);
  assert.equal(availability.hiddenPendingCount, 5);
  assert.equal(listCurrentPixelSourceOptions().length, 29);
  const currentPixelRows = listPixelKnowledgePointsForSource(G4B_U08_SOURCE_ID);
  assert.equal(currentPixelRows.length, 3);
  assert.equal(currentPixelRows[1].knowledgePointId, G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID);
  assert.equal(currentPixelRows[2].knowledgePointId, "kp_g4b_u08_fraction_decimal_conversion");
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 29);
});

test("P03F12 shared worksheet and answer key render bounded pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
});
