import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice005ProductAdmission } from "../../src/curriculum/full-product/p03f-slice005-product-admission.mjs";
import { validateP03FSlice005ProductAdmission } from "../../tools/curriculum/validate-p03f-slice005-product-admission.mjs";
import { validateP03FSlice004ProductAdmission } from "../../tools/curriculum/validate-p03f-slice004-product-admission.mjs";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-equivalent-fraction-selector-projection.js";
import { G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID } from "../../site/modules/curriculum/registry/g4b-u08-equivalence-cross-product-selector-projection.js";
import {
  generateG4BU08EquivalentFractionQuestions,
  validateG4BU08EquivalentFractionQuestion,
} from "../../site/modules/curriculum/batch-a/equivalent-fraction-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f5-extension.js";
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
  sourceId: G4B_U08_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G4B_U08_EQUIVALENT_FRACTION_KP_ID],
  selectedPatternGroupIds: [G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 9,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f5-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F5 consumes exact queue position 5 after slice004 D0", () => {
  const evidence = materializeP03FSlice005ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 5);
  assert.equal(evidence.slice.sliceId, "p03e_q005_r5_g4b_u08_4b08_profile_fraction_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q004_r5_g3b_u09_3b09_profile_decimal_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G4B_U08_EQUIVALENT_FRACTION_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.deepEqual(evidence.authority.knowledgePoint.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F5 deterministically generates nine unique balanced witnesses", () => {
  const first = generateG4BU08EquivalentFractionQuestions(plan());
  const second = generateG4BU08EquivalentFractionQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 9);
  assert.equal(first.allocation.length, 3);
  assert.deepEqual(first.allocation.map((row) => row.questionCount).sort(), [3, 3, 3]);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 9);
  for (const question of first.questions) {
    assert.equal(question.numerator * question.equivalentDenominator, question.equivalentNumerator * question.denominator);
    assert.equal(question.answerText, String(question[question.requestedUnknownRole]));
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.deepEqual(question.metadata.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
    assert.equal(validateG4BU08EquivalentFractionQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F5 validator rejects relation, answer and scope tampering", () => {
  const original = generateG4BU08EquivalentFractionQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG4BU08EquivalentFractionQuestion({ ...original, equivalentNumerator: original.equivalentNumerator + 1 }).ok, false);
  assert.equal(validateG4BU08EquivalentFractionQuestion({ ...original, answerText: "99" }).ok, false);
  assert.equal(validateG4BU08EquivalentFractionQuestion({ ...original, factor: 0 }).ok, false);
  assert.equal(validateG4BU08EquivalentFractionQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F5 binds all three fraction W3 capabilities", () => {
  const evidence = materializeP03FSlice005ProductAdmission();
  assert.equal(evidence.numberSystem.capabilityId, "cap_fraction_number_system");
  assert.equal(evidence.domainValidator.capabilityId, "cap_fraction_domain_validator");
  assert.equal(evidence.fractionArithmetic.capabilityId, "cap_fraction_arithmetic");
  assert.equal(evidence.capabilityWitnesses.length, 9);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.originalNumberSystemOk, true);
    assert.equal(witness.equivalentNumberSystemOk, true);
    assert.equal(witness.originalDomainValidatorOk, true);
    assert.equal(witness.equivalentDomainValidatorOk, true);
    assert.equal(witness.fractionArithmeticOk, true);
    assert.deepEqual(witness.originalCanonicalValue, witness.equivalentCanonicalValue);
    assert.equal(witness.originalCanonicalIdentity, witness.equivalentCanonicalIdentity);
  }
});

test("P03F5 selector exposes only one historical G4B-U08 KP and three specs", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G4B_U08_EQUIVALENT_FRACTION_KP_ID);
  assert.deepEqual(rows[0].patternSpecIds, G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 6);
});

test("P03F5 historical authority stays one KP while current Pixel expands monotonically to two", () => {
  const sources = listCurrentPixelSourceOptions();
  assert.equal(sources.length, 27);
  const source = sources.find((row) => row.sourceId === G4B_U08_SOURCE_ID);
  assert.ok(source);
  assert.equal(source.visibleKnowledgePointCount, 2);
  assert.equal(source.hiddenPendingCount, 5);
  assert.deepEqual(listPixelKnowledgePointsForSource(G4B_U08_SOURCE_ID).map((row) => row.knowledgePointId), [
    G4B_U08_EQUIVALENT_FRACTION_KP_ID,
    G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  ]);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 27);
  assert.equal(snapshot.bySourceId[G4B_U08_SOURCE_ID].visibleKnowledgePoints.length, 2);
});

test("P03F5 shared worksheet and answer key render nine items on bounded pages", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 9);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 9);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F5 committed aggregate is production admitted while preserving slice004 D0", () => {
  const predecessor = validateP03FSlice004ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  assert.equal(predecessor.d0Complete, true);
  const result = validateP03FSlice005ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(result.d0Complete, true);
  assert.equal(result.metrics.requiredCapabilityCount, 3);
  assert.equal(result.metrics.questionWitnessCount, 9);
  assert.equal(result.metrics.answerKeyWitnessCount, 9);
  assert.equal(result.metrics.newProductAdmissionCount, 1);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 6);
  assert.equal(result.metrics.remainingDirectSliceCount, 48);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 76);
});
