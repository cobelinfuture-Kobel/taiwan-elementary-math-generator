import test from "node:test";
import assert from "node:assert/strict";
import { materializeP03FSlice009ProductAdmission } from "../../src/curriculum/full-product/p03f-slice009-product-admission.mjs";
import { validateP03FSlice009ProductAdmission } from "../../tools/curriculum/validate-p03f-slice009-product-admission.mjs";
import { validateP03FSlice008ProductAdmission } from "../../tools/curriculum/validate-p03f-slice008-product-admission.mjs";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
} from "../../site/modules/curriculum/registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";
import { generateG3BU09TenthsFractionDecimalQuestions, validateG3BU09TenthsFractionDecimalQuestion } from "../../site/modules/curriculum/batch-a/tenths-fraction-decimal-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f9-extension.js";
import { getCurrentPixelRegistrySnapshot, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const CAPS = ["cap_fraction_domain_validator", "cap_fraction_number_system"];
const plan = (overrides = {}) => ({ sourceId: G3B_U09_SOURCE_ID, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID], selectedPatternGroupIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID], questionMode: "numeric", questionCount: 8, ordering: "groupedByPattern", includeAnswerKey: true, generationSeed: "p03f9-focused", printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true }, ...overrides });

test("P03F9 consumes exact queue position 9 after slice008 D0", () => {
  assert.equal(validateP03FSlice008ProductAdmission().d0Complete, true);
  const e = materializeP03FSlice009ProductAdmission();
  assert.equal(e.slice.queuePosition, 9);
  assert.equal(e.slice.sliceId, "p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1");
  assert.deepEqual(e.slice.knowledgePointIds, [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID]);
  assert.deepEqual(e.slice.requiredW3CapabilityIds, CAPS);
  assert.equal(e.predecessorPassed, true);
});

test("P03F9 generates four witnesses in each conversion direction", () => {
  const first = generateG3BU09TenthsFractionDecimalQuestions(plan());
  const second = generateG3BU09TenthsFractionDecimalQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.deepEqual(first.directionCounts, { fraction_to_decimal: 4, decimal_to_fraction: 4 });
  assert.equal(new Set(first.questions.map((q) => q.blankedDisplayText)).size, 8);
});

test("P03F9 preserves denominator ten and one-decimal identity", () => {
  const result = generateG3BU09TenthsFractionDecimalQuestions(plan());
  for (const q of result.questions) {
    assert.equal(q.denominator, 10);
    assert.equal(q.decimalScale, 1);
    assert.equal(q.fractionText, `${q.numerator}/10`);
    assert.equal(q.decimalValue, `0.${q.numerator}`);
    assert.equal(q.answerText, q.conversionDirection === "fraction_to_decimal" ? q.decimalValue : q.fractionText);
    assert.deepEqual(q.metadata.requiredCapabilityIds, CAPS);
    assert.equal(validateG3BU09TenthsFractionDecimalQuestion(q).ok, true);
  }
});

test("P03F9 validator rejects answer, denominator and direction tampering", () => {
  const question = generateG3BU09TenthsFractionDecimalQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG3BU09TenthsFractionDecimalQuestion({ ...question, answerText: "9.9" }).ok, false);
  assert.equal(validateG3BU09TenthsFractionDecimalQuestion({ ...question, denominator: 5 }).ok, false);
  assert.equal(validateG3BU09TenthsFractionDecimalQuestion({ ...question, conversionDirection: "invalid" }).ok, false);
});

test("P03F9 binds each witness to exact fraction capabilities", () => {
  const e = materializeP03FSlice009ProductAdmission();
  assert.equal(e.capabilityWitnesses.length, 8);
  for (const w of e.capabilityWitnesses) {
    assert.equal(w.numberSystemOk, true);
    assert.equal(w.domainValidatorOk, true);
    assert.equal(w.sourceDenominatorPreserved, true);
    assert.deepEqual(w.domainCanonicalValue, w.canonicalValue);
  }
});

test("P03F9 current Classic and Pixel expose four G3B-U09 KPs and leave three hidden", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((r) => r.sourceId === G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 4);
  assert.ok(rows.some((r) => r.knowledgePointId === G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID));
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 4);
  assert.equal(availability.hiddenPendingCount, 3);
  assert.equal(listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID).length, 4);
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 23);
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

test("P03F9 aggregate fail-closes before artifacts and admits exactly one KP after reviewed hashes", () => {
  const result = validateP03FSlice009ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.metrics.knowledgePointCount, 1);
  assert.equal(result.metrics.patternSpecCount, 1);
  if (result.status.includes("PENDING_CHROMIUM_ACCEPTANCE")) {
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
