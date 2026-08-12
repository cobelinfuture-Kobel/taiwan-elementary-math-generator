import test from "node:test";
import assert from "node:assert/strict";

import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
} from "../../site/modules/curriculum/registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";
import { generateG3BU09TenthsFractionDecimalQuestions } from "../../site/modules/curriculum/batch-a/tenths-fraction-decimal-runtime.js";
import { validateBatchABrowserQuestion } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f9.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f9-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";
import { materializeP03FSlice009ProductAdmission } from "../../src/curriculum/full-product/p03f-slice009-product-admission.mjs";
import { validateP03FSlice009ProductAdmission } from "../../tools/curriculum/validate-p03f-slice009-product-admission.mjs";

const EXPECTED_CAPABILITIES = ["cap_fraction_domain_validator", "cap_fraction_number_system"];
const plan = (overrides = {}) => ({
  sourceId: G3B_U09_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID],
  selectedPatternGroupIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f-slice009-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F9 consumes exact queue position 9 after slice008 D0", () => {
  const evidence = materializeP03FSlice009ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 9);
  assert.equal(evidence.slice.sliceId, "p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_CAPABILITIES);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F9 deterministically generates four witnesses per conversion direction", () => {
  const first = generateG3BU09TenthsFractionDecimalQuestions(plan());
  const second = generateG3BU09TenthsFractionDecimalQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  assert.deepEqual(first.directionCounts, { fraction_to_decimal: 4, decimal_to_fraction: 4 });
  for (const question of first.questions) {
    assert.equal(question.metadata.knowledgePointId, G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID);
    assert.equal(question.denominator, 10);
    assert.equal(question.decimalScale, 1);
    assert.equal(question.decimalValue, `0.${question.numerator}`);
    assert.equal(question.fractionText, `${question.numerator}/10`);
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.deepEqual(question.metadata.requiredCapabilityIds, EXPECTED_CAPABILITIES);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F9 validator rejects denominator, decimal scale, and answer tampering", () => {
  const original = generateG3BU09TenthsFractionDecimalQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateBatchABrowserQuestion({ ...original, denominator: 5 }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...original, decimalScale: 2 }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...original, answerText: "1.0" }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F9 binds each witness to exact fraction capabilities", () => {
  const evidence = materializeP03FSlice009ProductAdmission();
  assert.equal(evidence.capabilityWitnesses.length, 8);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.numberSystemOk, true);
    assert.equal(witness.domainValidatorOk, true);
    assert.equal(witness.sourceDenominatorPreserved, true);
    assert.deepEqual(witness.canonicalValue, witness.domainCanonicalValue);
  }
});

test("P03F9 historical Classic stays at four KPs while current Pixel includes later slices through Slice032", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 4);
  assert.equal(rows.some((row) => row.knowledgePointId === G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID), true);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 4);
  assert.equal(availability.hiddenPendingCount, 3);
  assert.equal(listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID).length, 6);
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 32);
});

test("P03F9 shared worksheet renders eight questions and answer keys on two pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
  assert.equal(result.worksheetDocument.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
});

test("P03F9 aggregate fail-closes before review and admits exactly one KP after reviewed hashes", () => {
  const result = validateP03FSlice009ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.metrics.knowledgePointCount, 1);
  assert.equal(result.metrics.patternSpecCount, 1);
  const preReviewPending = result.status.includes("PENDING_CHROMIUM_ACCEPTANCE") || result.status.includes("PENDING_VISUAL_REVIEW");
  if (preReviewPending) {
    assert.equal(result.d0Complete, false);
    assert.equal(result.metrics.newProductAdmissionCount, 0);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 10);
    assert.equal(result.metrics.remainingDirectSliceCount, 45);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 72);
  } else {
    assert.equal(result.d0Complete, true);
    assert.equal(result.metrics.newProductAdmissionCount, 1);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 11);
    assert.equal(result.metrics.remainingDirectSliceCount, 44);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 71);
  }
});
