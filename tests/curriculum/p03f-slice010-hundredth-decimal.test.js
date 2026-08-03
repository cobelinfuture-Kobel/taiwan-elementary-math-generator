import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice010ProductAdmission } from "../../src/curriculum/full-product/p03f-slice010-product-admission.mjs";
import { validateP03FSlice010ProductAdmission } from "../../tools/curriculum/validate-p03f-slice010-product-admission.mjs";
import { validateP03FSlice009ProductAdmission } from "../../tools/curriculum/validate-p03f-slice009-product-admission.mjs";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../../site/modules/curriculum/registry/g4a-u09-hundredth-decimal-selector-projection.js";
import { generateG4AU09HundredthDecimalQuestions, validateG4AU09HundredthDecimalQuestion } from "../../site/modules/curriculum/batch-a/hundredth-decimal-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f10-extension.js";
import { getCurrentPixelRegistrySnapshot, listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const EXPECTED_W3_CAPABILITY_IDS = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
const plan = (overrides = {}) => ({
  sourceId: G4A_U09_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G4A_U09_HUNDREDTH_DECIMAL_KP_ID],
  selectedPatternGroupIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID],
  questionMode: "numeric",
  questionCount: 8,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: "p03f10-focused",
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  ...overrides,
});

test("P03F10 consumes exact queue position 10 after slice009 D0", () => {
  const predecessor = validateP03FSlice009ProductAdmission();
  assert.equal(predecessor.ok, true, JSON.stringify(predecessor.errors));
  assert.equal(predecessor.d0Complete, true);
  const evidence = materializeP03FSlice010ProductAdmission();
  assert.equal(evidence.slice.queuePosition, 10);
  assert.equal(evidence.slice.sliceId, "p03e_q010_r6_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(evidence.slice.previousSliceId, "p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1");
  assert.deepEqual(evidence.slice.knowledgePointIds, [G4A_U09_HUNDREDTH_DECIMAL_KP_ID]);
  assert.deepEqual(evidence.slice.requiredW3CapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
  assert.equal(evidence.predecessorPassed, true);
});

test("P03F10 preserves hidden PatternSpec identity and role contract", () => {
  const evidence = materializeP03FSlice010ProductAdmission();
  assert.equal(evidence.authority.patternSurface.patternGroupId, G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID);
  assert.equal(evidence.authority.patternSurface.patternSpecId, G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID);
  assert.deepEqual(evidence.authority.patternSurface.givenRoles, ["whole", "fractionalUnits", "placeUnit"]);
  assert.equal(evidence.patternAudit.ok, true, JSON.stringify(evidence.patternAudit.errors));
  assert.deepEqual(evidence.patternAudit.definition.givenRoles, ["whole", "fractionalUnits", "placeUnit"]);
});

test("P03F10 deterministically generates eight unique hundredth-decimal witnesses", () => {
  const first = generateG4AU09HundredthDecimalQuestions(plan());
  const second = generateG4AU09HundredthDecimalQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 8);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 8);
  for (const question of first.questions) {
    assert.equal(question.patternSpecId, G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID);
    assert.equal(question.answerText, "0.01");
    assert.equal(question.decimalValue, "0.01");
    assert.equal(question.whole, 0);
    assert.equal(question.fractionalUnits, 1);
    assert.equal(question.placeUnit, "0.01");
    assert.deepEqual(question.finalAnswer, { coefficient: "1", scale: 2, canonicalText: "0.01", exact: true });
    assert.deepEqual(question.metadata.requiredCapabilityIds, EXPECTED_W3_CAPABILITY_IDS);
    assert.equal(validateG4AU09HundredthDecimalQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：]|\{\{)/);
  }
});

test("P03F10 validator rejects hundredth identity and scope tampering", () => {
  const original = generateG4AU09HundredthDecimalQuestions(plan({ questionCount: 1 })).questions[0];
  assert.equal(validateG4AU09HundredthDecimalQuestion({ ...original, answerText: "0.1" }).ok, false);
  assert.equal(validateG4AU09HundredthDecimalQuestion({ ...original, fractionalUnits: 2 }).ok, false);
  assert.equal(validateG4AU09HundredthDecimalQuestion({ ...original, finalAnswer: { ...original.finalAnswer, scale: 1 } }).ok, false);
  assert.equal(validateG4AU09HundredthDecimalQuestion({ ...original, questionMode: "application" }).ok, false);
});

test("P03F10 binds decimal number-system and domain-validator witnesses", () => {
  const evidence = materializeP03FSlice010ProductAdmission();
  assert.equal(evidence.numberSystem.capabilityId, "cap_decimal_number_system");
  assert.equal(evidence.domainValidator.capabilityId, "cap_decimal_domain_validator");
  assert.equal(evidence.capabilityWitnesses.length, 8);
  for (const witness of evidence.capabilityWitnesses) {
    assert.equal(witness.numberSystemOk, true);
    assert.equal(witness.domainValidatorOk, true);
    assert.equal(witness.domainCanonicalIdentity, "1e-2");
    assert.deepEqual(witness.domainCanonicalValue, witness.canonicalValue);
  }
});

test("P03F10 historical selector stays at one G4A-U09 KP while current Pixel preserves it after successors", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U09_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G4A_U09_HUNDREDTH_DECIMAL_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U09_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 6);
  const sources = listCurrentPixelSourceOptions();
  assert.equal(sources.length, 27);
  const pixelRows = listPixelKnowledgePointsForSource(G4A_U09_SOURCE_ID);
  assert.equal(pixelRows.some((row) => row.knowledgePointId === G4A_U09_HUNDREDTH_DECIMAL_KP_ID), true);
  assert.equal(getCurrentPixelRegistrySnapshot().sourceCount, 27);
});

test("P03F10 shared worksheet and answer key render eight items", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
});

test("P03F10 fail-closes before review and admits exactly one KP after reviewed hashes", () => {
  const result = validateP03FSlice010ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const preReviewPending = result.status.includes("PENDING_CHROMIUM_ACCEPTANCE") || result.status.includes("PENDING_VISUAL_REVIEW");
  if (preReviewPending) {
    assert.equal(result.productAdmissionState, "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE");
    assert.equal(result.d0Complete, false);
    assert.equal(result.metrics.newProductAdmissionCount, 0);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 11);
    assert.equal(result.metrics.remainingDirectSliceCount, 44);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 71);
  } else {
    assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
    assert.equal(result.d0Complete, true);
    assert.equal(result.artifactIntegrity.ok, true);
    assert.equal(result.metrics.newProductAdmissionCount, 1);
    assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 12);
    assert.equal(result.metrics.remainingDirectSliceCount, 43);
    assert.equal(result.metrics.remainingDirectKnowledgePointCount, 70);
  }
});
