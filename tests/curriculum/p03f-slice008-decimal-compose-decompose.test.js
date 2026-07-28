import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice008ProductAdmission } from "../../src/curriculum/full-product/p03f-slice008-product-admission.mjs";
import { validateP03FSlice008ProductAdmission } from "../../tools/curriculum/validate-p03f-slice008-product-admission.mjs";
import { validateP03FSlice007ProductAdmission } from "../../tools/curriculum/validate-p03f-slice007-product-admission.mjs";
import {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
  G3B_U09_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g3b-u09-decimal-compose-decompose-selector-projection.js";
import {
  generateG3BU09DecimalComposeDecomposeQuestions,
  validateG3BU09DecimalComposeDecomposeQuestion,
} from "../../site/modules/curriculum/batch-a/decimal-compose-decompose-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f8-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const EXPECTED_W3_CAPABILITY_IDS = [
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
];
const plan = (overrides = {}) => ({
  sourceId: G3B_U09_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID],
  selectedPatternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f8-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F8 consumes exact queue position 8 after slice007 D0", () => {
  const predecessor = validateP03FSlice007ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  assert.equal(predecessor.d0Complete, true);
  const evidence = materializeP03FSlice008ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 8);
  assert.equal(evidence.slice.sliceId, "p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q007_r6_g3b_u07_3b07_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F8 deterministically generates eight unique decimal compose witnesses", () => {
  const first = generateG3BU09DecimalComposeDecomposeQuestions(plan());
  const second = generateG3BU09DecimalComposeDecomposeQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  assert.equal(new Set(first.questions.map((row) => row.answerText)).size, 8);
  for (const question of first.questions) {
    const coefficient = question.whole * 10 + question.fractionalUnits;
    assert.equal(question.patternSpecId, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID);
    assert.equal(question.answerText, `${question.whole}.${question.fractionalUnits}`);
    assert.equal(question.decimalValue, question.answerText);
    assert.equal(question.placeUnit, "0.1");
    assert.deepEqual(question.finalAnswer, { coefficient: String(coefficient), scale: 1, canonicalText: question.answerText, exact: true });
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.deepEqual(question.metadata.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
    assert.equal(validateG3BU09DecimalComposeDecomposeQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F8 validator rejects place-value, answer and scope tampering", () => {
  const original = generateG3BU09DecimalComposeDecomposeQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG3BU09DecimalComposeDecomposeQuestion({ ...original, answerText: "9.9" }).ok, false);
  assert.equal(validateG3BU09DecimalComposeDecomposeQuestion({ ...original, fractionalUnits: 0 }).ok, false);
  assert.equal(validateG3BU09DecimalComposeDecomposeQuestion({ ...original, finalAnswer: { ...original.finalAnswer, scale: 2 } }).ok, false);
  assert.equal(validateG3BU09DecimalComposeDecomposeQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F8 binds exact decimal number-system and domain-validator witnesses", () => {
  const evidence = materializeP03FSlice008ProductAdmission();
  assert.equal(evidence.numberSystem.capabilityId, "cap_decimal_number_system");
  assert.equal(evidence.domainValidator.capabilityId, "cap_decimal_domain_validator");
  assert.equal(evidence.capabilityWitnesses.length, 8);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.numberSystemOk, true);
    assert.equal(witness.domainValidatorOk, true);
    assert.equal(witness.canonicalValue.coefficient, witness.expectedCoefficient);
    assert.equal(witness.canonicalValue.scale, 1);
    assert.equal(witness.domainCanonicalIdentity, `${witness.expectedCoefficient}e-1`);
    assert.deepEqual(witness.domainCanonicalValue, witness.canonicalValue);
  }
});

test("P03F8 current Classic exposes two G3B-U09 KPs and leaves five hidden", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 2);
  assert.ok(rows.some((row) => row.knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID));
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 2);
  assert.equal(availability.hiddenPendingCount, 5);
});

test("P03F8 current Pixel exposes 23 sources and two G3B-U09 KPs", () => {
  const rows = listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID);
  assert.equal(rows.length, 2);
  assert.ok(rows.some((row) => row.knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID));
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 23);
  assert.equal(snapshot.bySourceId[G3B_U09_SOURCE_ID].visibleKnowledgePoints.length, 2);
  assert.equal(snapshot.bySourceId[G3B_U09_SOURCE_ID].hiddenPendingCount, 5);
});

test("P03F8 shared worksheet and answer key render eight items on two pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F8 aggregate remains fail closed before artifacts and admits only after reviewed hashes", () => {
  const result = validateP03FSlice008ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.metrics.requiredCapabilityCount, 2);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  if (result.status.includes("PENDING_CHROMIUM_ACCEPTANCE")) {
    assert.equal(result.productAdmissionState, "PRODUCT_ACCEPTANCE_PENDING");
    assert.equal(result.d0Complete, false);
    assert.equal(result.metrics.newProductAdmissionCount, 0);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 8);
    assert.equal(result.metrics.remainingDirectSliceCount, 46);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 74);
  } else {
    assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
    assert.equal(result.d0Complete, true);
    assert.equal(result.metrics.newProductAdmissionCount, 1);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 9);
    assert.equal(result.metrics.remainingDirectSliceCount, 45);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 73);
  }
});
