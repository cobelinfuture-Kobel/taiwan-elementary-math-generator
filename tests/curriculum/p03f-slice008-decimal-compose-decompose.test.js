import test from "node:test";
import assert from "node:assert/strict";
import { materializeP03FSlice008ProductAdmission } from "../../src/curriculum/full-product/p03f-slice008-product-admission.mjs";
import { validateP03FSlice008ProductAdmission } from "../../tools/curriculum/validate-p03f-slice008-product-admission.mjs";
import { validateP03FSlice007ProductAdmission } from "../../tools/curriculum/validate-p03f-slice007-product-admission.mjs";
import { G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, G3B_U09_SOURCE_ID } from "../../site/modules/curriculum/registry/g3b-u09-decimal-compose-decompose-selector-projection.js";
import { G3B_U09_DECIMAL_READ_WRITE_KP_ID, G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID, G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID } from "../../site/modules/curriculum/registry/g3b-u09-decimal-read-write-selector-projection.js";
import { generateG3BU09DecimalComposeDecomposeQuestions, validateG3BU09DecimalComposeDecomposeQuestion } from "../../site/modules/curriculum/batch-a/decimal-compose-decompose-runtime.js";
import { generateG3BU09DecimalReadWriteQuestions, validateG3BU09DecimalReadWriteQuestion } from "../../site/modules/curriculum/batch-a/decimal-read-write-runtime.js";
import { generateP03F8DecimalSliceQuestions } from "../../site/modules/curriculum/batch-a/decimal-slice008-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f8-extension.js";
import { getCurrentPixelRegistrySnapshot, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const CAPS = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
const plan = (overrides = {}) => ({ sourceId: G3B_U09_SOURCE_ID, selectionMode: "mixedKnowledgePoints", selectedKnowledgePointIds: [G3B_U09_DECIMAL_READ_WRITE_KP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID], selectedPatternGroupIds: [G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID], questionMode: "numeric", questionCount: 8, ordering: "groupedByPattern", includeAnswerKey: true, generationSeed: "p03f8-focused", printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true }, ...overrides });

test("P03F8 consumes exact queue position 8 after slice007 D0", () => {
  assert.equal(validateP03FSlice007ProductAdmission().d0Complete, true);
  const e = materializeP03FSlice008ProductAdmission();
  assert.equal(e.slice.queuePosition, 8);
  assert.equal(e.slice.sliceId, "p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1");
  assert.deepEqual([...e.slice.knowledgePointIds].sort(), [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID, G3B_U09_DECIMAL_READ_WRITE_KP_ID]);
  assert.deepEqual(e.slice.requiredW3CapabilityIds, CAPS);
  assert.equal(e.predecessorPassed, true);
});

test("P03F8 read-write witnesses preserve notation and reading", () => {
  const result = generateG3BU09DecimalReadWriteQuestions({ questionCount: 8, generationSeed: "p03f8-rw" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 8);
  assert.equal(new Set(result.questions.map((q) => q.blankedDisplayText)).size, 8);
  for (const q of result.questions) {
    assert.equal(q.patternSpecId, G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID);
    assert.equal(validateG3BU09DecimalReadWriteQuestion(q).ok, true);
    assert.equal(q.finalAnswer.scale, 1);
    assert.equal(q.finalAnswer.canonicalText, q.decimalValue);
    assert.deepEqual(q.metadata.requiredCapabilityIds, CAPS);
  }
});

test("P03F8 compose-decompose witnesses preserve place-value identity", () => {
  const options = plan({ selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID], selectedPatternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID] });
  const result = generateG3BU09DecimalComposeDecomposeQuestions(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const q of result.questions) {
    assert.equal(q.patternSpecId, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID);
    assert.equal(q.answerText, `${q.whole}.${q.fractionalUnits}`);
    assert.equal(validateG3BU09DecimalComposeDecomposeQuestion(q).ok, true);
  }
});

test("P03F8 combined allocator creates four witnesses per PatternSpec", () => {
  const first = generateP03F8DecimalSliceQuestions(plan());
  const second = generateP03F8DecimalSliceQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.deepEqual(first.allocation.map((r) => r.questionCount), [4, 4]);
  assert.deepEqual(first.allocation.map((r) => r.patternSpecId).sort(), [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID].sort());
  assert.equal(new Set(first.questions.map((q) => q.blankedDisplayText)).size, 8);
});

test("P03F8 validators reject read-write and compose tampering", () => {
  const read = generateG3BU09DecimalReadWriteQuestions({ questionCount: 1 }).questions[0];
  assert.equal(validateG3BU09DecimalReadWriteQuestion({ ...read, answerText: "錯誤" }).ok, false);
  const compose = generateG3BU09DecimalComposeDecomposeQuestions(plan({ selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID], selectedPatternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID], questionCount: 1 })).questions[0];
  assert.equal(validateG3BU09DecimalComposeDecomposeQuestion({ ...compose, answerText: "9.9" }).ok, false);
});

test("P03F8 binds both KPs to exact decimal capabilities", () => {
  const e = materializeP03FSlice008ProductAdmission();
  assert.equal(e.capabilityWitnesses.length, 8);
  assert.equal(new Set(e.capabilityWitnesses.map((w) => w.knowledgePointId)).size, 2);
  for (const w of e.capabilityWitnesses) {
    assert.equal(w.numberSystemOk, true);
    assert.equal(w.domainValidatorOk, true);
    assert.equal(w.canonicalValue.coefficient, w.expectedCoefficient);
    assert.equal(w.canonicalValue.scale, 1);
    assert.deepEqual(w.domainCanonicalValue, w.canonicalValue);
  }
});

test("P03F8 historical selector remains three KPs while current Pixel includes Slice016", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((r) => r.sourceId === G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 3);
  assert.ok(rows.some((r) => r.knowledgePointId === G3B_U09_DECIMAL_READ_WRITE_KP_ID));
  assert.ok(rows.some((r) => r.knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID));
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 3);
  assert.equal(availability.hiddenPendingCount, 4);
  assert.equal(listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID).length, 6);
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 31);
});

test("P03F8 shared worksheet renders eight questions and answer keys on two pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
});

test("P03F8 aggregate remains D0 after later current-surface expansion", () => {
  const result = validateP03FSlice008ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.metrics.knowledgePointCount, 2);
  assert.equal(result.metrics.patternSpecCount, 2);
  assert.equal(result.d0Complete, true);
  assert.equal(result.metrics.newProductAdmissionCount, 2);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 10);
  assert.equal(result.metrics.remainingDirectSliceCount, 45);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 72);
});
