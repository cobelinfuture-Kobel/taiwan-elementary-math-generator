import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice004ProductAdmission } from "../../src/curriculum/full-product/p03f-slice004-product-admission.mjs";
import { validateP03FSlice004ProductAdmission } from "../../tools/curriculum/validate-p03f-slice004-product-admission.mjs";
import { validateP03FSlice003ProductAdmission } from "../../tools/curriculum/validate-p03f-slice003-product-admission.mjs";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTH_DECIMAL_KP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID,
} from "../../site/modules/curriculum/registry/g3b-u09-tenth-decimal-selector-projection.js";
import {
  generateG3BU09TenthDecimalQuestions,
  validateG3BU09TenthDecimalQuestion,
} from "../../site/modules/curriculum/batch-a/tenth-decimal-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f4-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const EXPECTED_W3_CAPABILITY_IDS = [
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
];

const plan = (overrides = {}) => ({
  sourceId: G3B_U09_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3B_U09_TENTH_DECIMAL_KP_ID],
  selectedPatternGroupIds: [G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f4-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F4 consumes exact queue position 4 after slice003 D0", () => {
  const evidence = materializeP03FSlice004ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 4);
  assert.equal(evidence.slice.sliceId, "p03e_q004_r5_g3b_u09_3b09_profile_decimal_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q003_r5_g3b_u07_3b07_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G3B_U09_TENTH_DECIMAL_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.deepEqual(evidence.authority.knowledgePoint.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F4 deterministically generates eight unique tenth-decimal witnesses", () => {
  const first = generateG3BU09TenthDecimalQuestions(plan());
  const second = generateG3BU09TenthDecimalQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  for (const question of first.questions) {
    assert.equal(question.patternSpecId, G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID);
    assert.equal(question.answerText, "0.1");
    assert.equal(question.decimalValue, "0.1");
    assert.equal(question.whole, 0);
    assert.equal(question.fractionalUnits, 1);
    assert.equal(question.placeUnit, "0.1");
    assert.deepEqual(question.finalAnswer, { coefficient: "1", scale: 1, canonicalText: "0.1", exact: true });
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.deepEqual(question.metadata.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
    assert.equal(validateG3BU09TenthDecimalQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F4 validator rejects decimal identity and scope tampering", () => {
  const original = generateG3BU09TenthDecimalQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG3BU09TenthDecimalQuestion({ ...original, answerText: "1.0" }).ok, false);
  assert.equal(validateG3BU09TenthDecimalQuestion({ ...original, fractionalUnits: 2 }).ok, false);
  assert.equal(validateG3BU09TenthDecimalQuestion({ ...original, finalAnswer: { ...original.finalAnswer, coefficient: "10" } }).ok, false);
  assert.equal(validateG3BU09TenthDecimalQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F4 binds decimal number-system and domain-validator witnesses", () => {
  const evidence = materializeP03FSlice004ProductAdmission();
  assert.equal(evidence.numberSystem.capabilityId, "cap_decimal_number_system");
  assert.equal(evidence.domainValidator.capabilityId, "cap_decimal_domain_validator");
  assert.equal(evidence.capabilityWitnesses.length, 8);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.numberSystemOk, true);
    assert.equal(witness.domainValidatorOk, true);
    assert.equal(witness.domainCanonicalIdentity, "1e-1");
    assert.deepEqual(witness.domainCanonicalValue, witness.canonicalValue);
  }
});

test("P03F4 historical selector snapshot exposes only one G3B-U09 KP", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G3B_U09_TENTH_DECIMAL_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 6);
});

test("P03F4 current Pixel retains historical sources and includes later successor sources and KPs", () => {
  const sources = listCurrentPixelSourceOptions();
  assert.equal(sources.length, 32);
  const source = sources.find((row) => row.sourceId === G3B_U09_SOURCE_ID);
  assert.ok(source);
  assert.equal(source.visibleKnowledgePointCount, 6);
  assert.equal(source.hiddenPendingCount, 1);
  const currentIds = listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID).map((row) => row.knowledgePointId);
  assert.equal(currentIds.includes(G3B_U09_TENTH_DECIMAL_KP_ID), true);
  assert.equal(currentIds.length, 6);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 32);
  assert.equal(snapshot.bySourceId[G3B_U09_SOURCE_ID].visibleKnowledgePoints.length, 6);
});

test("P03F4 shared worksheet and answer key render eight items", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F4 committed aggregate is production admitted while preserving slice003 D0", () => {
  const predecessor = validateP03FSlice003ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  assert.equal(predecessor.d0Complete, true);
  const result = validateP03FSlice004ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(result.d0Complete, true);
  assert.equal(result.metrics.requiredCapabilityCount, 2);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  assert.equal(result.metrics.newProductAdmissionCount, 1);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 5);
  assert.equal(result.metrics.remainingDirectSliceCount, 49);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 77);
});
