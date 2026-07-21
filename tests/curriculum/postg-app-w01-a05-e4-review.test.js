import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01E4ProductionReview,
  validateW01E4ProductionReview
} from '../../src/curriculum/application/w01-e4-production-review-runtime.mjs';

const materialized = materializeW01E4ProductionReview({
  generationSeed: 'postg-app-w01-a05-focused-test'
});
const validation = validateW01E4ProductionReview(materialized);

function focusedFailureDiagnostics() {
  return JSON.stringify({
    issues: validation.issues,
    exactGenerationFailures: materialized.exactGenerationFailures
  }, null, 2);
}

test('W01-A05 builds an exact-generator E4 review cohort', () => {
  assert.equal(validation.ok, true, focusedFailureDiagnostics());
  assert.equal(validation.status, 'W01_E4_PRODUCTION_EQUIVALENT_REVIEW_RUNTIME_READY');
  assert.equal(validation.humanReviewReady, true);
  assert.equal(validation.productionAdmissionGranted, false);
  assert.equal(validation.counts.eligibleSourceCount, validation.counts.reviewCohortSourceCount);
  assert.equal(validation.counts.requiredMacroContextCount, 16);
  assert.equal(validation.counts.reviewCohortMacroContextCount, 16);
  assert.equal(validation.counts.reviewCohortQuestionCount >= validation.counts.reviewCohortSourceCount, true);
});

test('every selected item uses a visible exact production PatternGroup route', () => {
  assert.equal(materialized.transformedRows.length > 0, true);
  for (const row of materialized.transformedRows) {
    assert.equal(row.exactPatternGroupId.startsWith('pg_'), true, row.transformed.id);
    assert.equal(String(row.exactPatternSpecId).startsWith('ps_'), true, row.transformed.id);
    assert.equal(row.transformed.applicationReview.exactGeneratorUsed, true);
    assert.equal(row.transformed.resolvedPatternGroupId, row.exactPatternGroupId);
  }
});

test('context overlay changes only visible wording and preserves exact mathematical witness', () => {
  assert.equal(validation.counts.mathPreservedCount, validation.counts.reviewCohortQuestionCount);
  assert.equal(validation.counts.promptChangedCount, validation.counts.reviewCohortQuestionCount);
  for (const row of materialized.transformedRows) {
    assert.equal(row.mathPreserved, true, row.transformed.id);
    assert.equal(row.promptChanged, true, row.transformed.id);
    assert.equal(row.reviewPrompt.includes('{{'), false);
    assert.equal(/算式|答：|_{5,}/.test(row.reviewPrompt), false);
    assert.equal(row.transformed.productionUse, 'forbidden_pending_human_review');
    assert.equal(row.transformed.applicationReview.productionAdmissionAllowed, false);
  }
});

test('review cohort covers every application-eligible source and all 16 macro contexts', () => {
  assert.deepEqual(validation.selectedSources, materialized.eligibleSources);
  assert.deepEqual(validation.selectedMacros, materialized.requiredMacros);
  assert.equal(validation.selectedMacros.length, 16);
});

test('unit-flow review does not silently hide unresolved units', () => {
  assert.equal(materialized.unitFlowReviewRows.length, materialized.transformedRows.length);
  for (const row of materialized.unitFlowReviewRows) {
    assert.equal(['REVIEW_CANDIDATE_RESOLVED', 'HUMAN_REVIEW_REQUIRED'].includes(row.resolutionStatus), true);
    if (row.resolutionStatus === 'HUMAN_REVIEW_REQUIRED') {
      assert.equal(row.resolvedAnswerUnitCandidate, 'UNBOUND_UNIT_CANDIDATE');
    }
    assert.equal(row.productionAdmissionAllowed, false);
  }
});

test('production worksheet document has exact question-answer pairing', () => {
  const document = materialized.worksheetDocument;
  assert.equal(document.generatedQuestions.length, materialized.transformedRows.length);
  assert.equal(document.questionDisplayModels.length, document.generatedQuestions.length);
  assert.equal(document.answerKeyItems.length, document.generatedQuestions.length);
  assert.deepEqual(
    document.questionDisplayModels.map((row) => row.questionId),
    document.answerKeyItems.map((row) => row.questionId)
  );
  assert.equal(document.reviewRuntime.exactProductionGeneratorUsed, true);
  assert.equal(document.reviewRuntime.productionRendererRequired, true);
  assert.equal(document.reviewRuntime.productionSelectable, false);
});

test('PBL review sections preserve graph and complete projection policy', () => {
  const expected = materialized.a02.pblTaskSetCandidates
    .filter((row) => validation.selectedSources.includes(row.sourceId));
  assert.equal(materialized.pblReviewSections.length, expected.length);
  for (const section of materialized.pblReviewSections) {
    if (section.graphType === 'PBL3_LINEAR') {
      assert.equal(section.projectionCandidate, 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE');
      assert.equal(section.taskBlueprints.length, 3);
    } else {
      assert.equal(section.projectionCandidate, 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE');
      assert.equal(section.taskBlueprints.length, 5);
    }
    assert.equal(section.finalProductCandidate.requiredMilestoneIds.length >= 2, true);
    assert.equal(section.productionAdmissionAllowed, false);
  }
});

test('missing source or macro coverage fails closed', () => {
  const sourceCase = structuredClone(materialized);
  const removedSource = sourceCase.transformedRows[0].transformed.sourceId;
  sourceCase.transformedRows = sourceCase.transformedRows.filter((row) => row.transformed.sourceId !== removedSource);
  assert.equal(validateW01E4ProductionReview(sourceCase).issues.some((row) => row.code === 'POSTG_APP_W01_A05_ELIGIBLE_SOURCE_COVERAGE_INVALID'), true);

  const macroCase = structuredClone(materialized);
  const removedMacro = macroCase.transformedRows[0].transformed.applicationReview.contextSelection.macroContextId;
  macroCase.transformedRows = macroCase.transformedRows.filter((row) => row.transformed.applicationReview.contextSelection.macroContextId !== removedMacro);
  assert.equal(validateW01E4ProductionReview(macroCase).issues.some((row) => row.code === 'POSTG_APP_W01_A05_MACRO_CONTEXT_COVERAGE_INVALID'), true);
});

test('mathematical drift and premature production admission fail closed', () => {
  const mathCase = structuredClone(materialized);
  mathCase.transformedRows[0].mathPreserved = false;
  assert.equal(validateW01E4ProductionReview(mathCase).issues.some((row) => row.code === 'POSTG_APP_W01_A05_MATHEMATICAL_WITNESS_DRIFT'), true);

  const productionCase = structuredClone(materialized);
  productionCase.transformedRows[0].transformed.applicationReview.productionAdmissionAllowed = true;
  assert.equal(validateW01E4ProductionReview(productionCase).issues.some((row) => row.code === 'POSTG_APP_W01_A05_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});
