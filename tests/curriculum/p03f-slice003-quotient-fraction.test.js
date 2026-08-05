import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice003ProductAdmission } from "../../src/curriculum/full-product/p03f-slice003-product-admission.mjs";
import { validateP03FSlice003ProductAdmission } from "../../tools/curriculum/validate-p03f-slice003-product-admission.mjs";
import { validateP03FSlice002ProductAdmission } from "../../tools/curriculum/validate-p03f-slice002-product-admission.mjs";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_KP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../../site/modules/curriculum/registry/g3b-u07-quotient-fraction-selector-projection.js";
import { G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID } from "../../site/modules/curriculum/registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
import {
  generateG3BU07QuotientFractionQuestions,
  validateG3BU07QuotientFractionQuestion,
} from "../../site/modules/curriculum/batch-a/quotient-fraction-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f3-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const EXPECTED_W3_CAPABILITY_IDS = [
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
];

const plan = (overrides = {}) => ({
  sourceId: G3B_U07_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3B_U07_QUOTIENT_FRACTION_KP_ID],
  selectedPatternGroupIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f3-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F3 consumes exact queue position 3 after slice002 D0", () => {
  const evidence = materializeP03FSlice003ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 3);
  assert.equal(evidence.slice.sliceId, "p03e_q003_r5_g3b_u07_3b07_profile_fraction_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q002_r5_g3a_u08_3a08_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G3B_U07_QUOTIENT_FRACTION_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.deepEqual(evidence.authority.knowledgePoint.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F3 deterministically generates eight unique quotient fractions", () => {
  const first = generateG3BU07QuotientFractionQuestions(plan());
  const second = generateG3BU07QuotientFractionQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  for (const question of first.questions) {
    assert.equal(question.patternSpecId, G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID);
    assert.equal(question.answerText, `${question.dividend}/${question.divisor}`);
    assert.equal(question.finalAnswer.numerator, question.dividend);
    assert.equal(question.finalAnswer.denominator, question.divisor);
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.equal(validateG3BU07QuotientFractionQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F3 validator rejects ordered-role and answer tampering", () => {
  const original = generateG3BU07QuotientFractionQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG3BU07QuotientFractionQuestion({ ...original, answerText: `${original.divisor}/${original.dividend}` }).ok, false);
  assert.equal(validateG3BU07QuotientFractionQuestion({ ...original, finalAnswer: { ...original.finalAnswer, numerator: original.divisor } }).ok, false);
  assert.equal(validateG3BU07QuotientFractionQuestion({ ...original, divisor: 0 }).ok, false);
  assert.equal(validateG3BU07QuotientFractionQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F3 binds number-system, domain-validator and arithmetic witnesses", () => {
  const evidence = materializeP03FSlice003ProductAdmission();
  assert.equal(evidence.fractionArithmetic.capabilityId, "cap_fraction_arithmetic");
  assert.equal(evidence.capabilityWitnesses.length, 8);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.numberSystemOk, true);
    assert.equal(witness.domainValidatorOk, true);
    assert.equal(witness.fractionArithmeticOk, true);
    assert.deepEqual(witness.arithmeticCanonicalValue, witness.canonicalValue);
  }
});

test("P03F3 selector exposes only one G3B-U07 KP", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G3B_U07_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G3B_U07_QUOTIENT_FRACTION_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U07_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 7);
});

test("P03F3 current Pixel preserves early G3B-U07 KPs while later slices extend the current source surface", () => {
  const sources = listCurrentPixelSourceOptions();
  assert.equal(sources.length, 29);
  const source = sources.find((row) => row.sourceId === G3B_U07_SOURCE_ID);
  assert.ok(source);
  assert.equal(source.visibleKnowledgePointCount, 8);
  assert.equal(source.hiddenPendingCount, 0);
  const currentIds = listPixelKnowledgePointsForSource(G3B_U07_SOURCE_ID).map((row) => row.knowledgePointId);
  assert.equal(currentIds.length, 8);
  assert.equal(currentIds.includes(G3B_U07_QUOTIENT_FRACTION_KP_ID), true);
  assert.equal(currentIds.includes(G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID), true);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 29);
  assert.equal(snapshot.bySourceId[G3B_U07_SOURCE_ID].visibleKnowledgePoints.length, 8);
});

test("P03F3 shared worksheet and answer key render eight items", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F3 aggregate admission is D0 and preserves slice002 D0", () => {
  const predecessor = validateP03FSlice002ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  const result = validateP03FSlice003ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(result.d0Complete, true);
  assert.equal(result.metrics.requiredCapabilityCount, 3);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  assert.equal(result.metrics.newProductAdmissionCount, 1);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 4);
  assert.equal(result.metrics.remainingDirectSliceCount, 50);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 78);
});
