import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03FSlice001ProductAdmission } from "../../src/curriculum/full-product/p03f-slice001-product-admission.mjs";
import { validateP03FSlice001ProductAdmission } from "../../tools/curriculum/validate-p03f-slice001-product-admission.mjs";
import { generateG3AU08PartWholeFractionQuestions, validateG3AU08PartWholeFractionQuestion } from "../../site/modules/curriculum/batch-a/part-whole-fraction-runtime.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listVisibleBatchAKnowledgePoints as listP03F1VisibleKnowledgePoints,
  listBatchAKnowledgePointAvailabilityBySource as getP03F1Availability,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f-extension.js";

const SOURCE_ID = "g3a_u08_3a08";
const KP_ID = "kp_g3a_u08_part_whole_fraction";
const GROUP_ID = "pg_g3a_u08_part_whole_fraction_numeric";

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionMode: "numeric",
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p03f-focused",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

test("P03F slice001 materializes the exact first frozen queue identity", () => {
  const evidence = materializeP03FSlice001ProductAdmission();
  assert.equal(evidence.firstSlice.queuePosition, 1);
  assert.equal(evidence.firstSlice.sliceId, "p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1");
  assert.equal(evidence.firstSlice.implementationTaskId, "P03F_W3DirectProductVerticalSlice001Implementation");
  assert.deepEqual(evidence.firstSlice.knowledgePointIds, [KP_ID]);
  assert.equal(evidence.authority.knowledgePoint.applicationClassification, "APPLICATION_NOT_APPLICABLE");
});

test("P03F reuses one hidden PatternSpec identity and covers two structural representations", () => {
  const first = generateG3AU08PartWholeFractionQuestions(plan());
  const second = generateG3AU08PartWholeFractionQuestions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(new Set(first.questions.map((row) => row.patternSpecId)).size, 1);
  assert.deepEqual([...new Set(first.questions.map((row) => row.representationMode))].sort(), [
    "CONTINUOUS_EQUAL_PARTITION",
    "DISCRETE_SET_PARTITION",
  ]);
  for (const question of first.questions) {
    assert.equal(question.answerText, `${question.selectedParts}/${question.equalParts}`);
    assert.ok(question.selectedParts > 0);
    assert.ok(question.selectedParts < question.equalParts);
    assert.equal(question.metadata.magnitudeClass, "PROPER_FRACTION");
    assert.equal(validateG3AU08PartWholeFractionQuestion(question).ok, true);
    assert.doesNotMatch(question.blankedDisplayText, /(?:算式|_{2,}|答\s*[:：])/);
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
  }
});

test("P03F deterministic validator fails closed on numerator, denominator, whole-fraction and answer tampering", () => {
  const generated = generateG3AU08PartWholeFractionQuestions(plan({ questionCount: 2 }));
  assert.equal(generated.ok, true);
  const original = generated.questions[0];
  const badNumerator = { ...original, selectedParts: original.equalParts + 1 };
  const badDenominator = { ...original, equalParts: 0 };
  const wholeFraction = {
    ...original,
    selectedParts: original.equalParts,
    numerator: original.equalParts,
    answerText: `${original.equalParts}/${original.equalParts}`,
    finalAnswer: { numerator: original.equalParts, denominator: original.equalParts },
  };
  const badAnswer = { ...original, answerText: "999/1" };
  assert.equal(validateG3AU08PartWholeFractionQuestion(badNumerator).ok, false);
  assert.equal(validateG3AU08PartWholeFractionQuestion(badDenominator).ok, false);
  assert.equal(validateG3AU08PartWholeFractionQuestion(wholeFraction).ok, false);
  assert.equal(validateG3AU08PartWholeFractionQuestion(badAnswer).ok, false);
});

test("P03F explicit slice001 selector authority remains one-KP reproducible", () => {
  const rows = listP03F1VisibleKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, KP_ID);
  const availability = getP03F1Availability(SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 6);
});

test("P03F shared worksheet, answer key and production HTML complete", () => {
  const result = buildWorksheetDocumentFromPlan(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 8);
  assert.equal(document.answerKeyItems.length, 8);
  assert.ok(document.questionPages.length > 0);
  assert.ok(document.answerKeyPages.length > 0);
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.match(html, /等分|平均分成/);
});

test("P03F committed HTML PDF and visual report hashes pass runtime integrity", () => {
  const evidence = materializeP03FSlice001ProductAdmission();
  assert.equal(evidence.artifactIntegrity.ok, true, JSON.stringify(evidence.artifactIntegrity));
  assert.equal(evidence.artifactIntegrity.pathsExist, true);
  assert.equal(evidence.artifactIntegrity.hashesMatch, true);
  assert.equal(evidence.artifactIntegrity.reportAccepted, true);
  assert.equal(evidence.artifactIntegrity.report.wholeAsFractionFindingCount, 0);
  assert.equal(evidence.artifactIntegrity.report.properFractionInvariantPassed, true);
});

test("P03F aggregate product admission validator closes slice001 at E6 D0", () => {
  const result = validateP03FSlice001ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(result.d0Complete, true);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  assert.equal(result.metrics.publicSourceCountAfterAdmission, 20);
  assert.equal(result.metrics.chromiumPdfWitnessCount, 1);
  assert.equal(result.metrics.overflowFindingCount, 0);
  assert.equal(result.metrics.newProductAdmissionCount, 1);
  assert.equal(result.metrics.remainingDirectSliceCount, 52);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 81);
});
