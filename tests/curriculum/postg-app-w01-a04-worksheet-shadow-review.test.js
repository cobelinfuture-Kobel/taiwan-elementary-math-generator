import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01WorksheetShadowReview,
  validateW01WorksheetShadowReview
} from '../../src/curriculum/application/w01-worksheet-shadow-review.mjs';
import { runPOSTGAPPW01A04Validation } from '../../tools/curriculum/validate-postg-app-w01-a04-worksheet-shadow-review.mjs';

const materialized = materializeW01WorksheetShadowReview();
const codes = (result) => result.issues.map((row) => row.code);

test('W01-A04 projects every eligible application candidate and defers admission', () => {
  const result = runPOSTGAPPW01A04Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W01_A04_WORKSHEET_SHADOW_PROJECTION_REVIEW_DEFERRED',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W01_WORKSHEET_SHADOW_PROJECTION_PASS_PRODUCTION_REVIEW_DEFERRED');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.goldenAssessmentUnitCount, 15);
  assert.equal(result.counts.candidateQuestionCount, result.counts.answerKeyCount);
  assert.equal(result.counts.productionAdmittedUnitCount, 0);
  assert.equal(result.review.reviewDecision, 'DEFERRED_PENDING_PRODUCTION_EVIDENCE');
  assert.equal(result.review.productionAdmissionGranted, false);
});

test('eligible and excluded source scopes are exact and disjoint', () => {
  const validation = validateW01WorksheetShadowReview(materialized);
  const eligible = new Set(validation.projectedSources);
  const excluded = new Set(validation.excludedSources);
  assert.equal(validation.counts.eligibleProjectionUnitCount + validation.counts.excludedUnitCount, 15);
  assert.equal([...eligible].some((sourceId) => excluded.has(sourceId)), false);
  assert.equal(materialized.excludedReadbacks.every((row) => row.projectionCount === 0), true);
  assert.equal(materialized.excludedReadbacks.every((row) => row.status === 'APPLICATION_NOT_APPLICABLE_NO_PROJECTION'), true);
});

test('every projected candidate has one question and one matching answer key', () => {
  const allBindingIds = [];
  for (const projection of materialized.projections) {
    const questionIds = projection.questionItems.map((row) => row.questionId).sort();
    const answerIds = projection.answerKeyItems.map((row) => row.questionId).sort();
    assert.deepEqual(answerIds, questionIds, projection.worksheetProjectionId);
    allBindingIds.push(...projection.questionItems.map((row) => row.bindingCandidateId));
    assert.equal(projection.productionSelectable, false);
    assert.equal(projection.projectionStatus, 'SHADOW_STRUCTURAL_PROJECTION');
  }
  assert.equal(allBindingIds.length, materialized.a03.a02.a01.candidates.length);
  assert.equal(new Set(allBindingIds).size, allBindingIds.length);
});

test('PBL3 and PBL5 retain approved complete projections', () => {
  const sections = materialized.projections.flatMap((row) => row.pblSections);
  assert.equal(sections.length, materialized.a03.a02.pblTaskSetCandidates.length);
  for (const section of sections) {
    if (section.graphType === 'PBL3_LINEAR') {
      assert.equal(section.projectionCandidate, 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE');
      assert.equal(section.taskIds.length, 3);
    } else {
      assert.equal(section.projectionCandidate, 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE');
      assert.equal(section.taskIds.length, 5);
    }
    assert.equal(section.milestoneIds.length >= 2, true);
    assert.equal(section.taskIds.includes(section.finalTaskId), true);
  }
});

test('shadow worksheet HTML omits prohibited layout-heavy labels', () => {
  for (const projection of materialized.projections) {
    for (const label of ['算式', '答：', '_____']) {
      assert.equal(projection.shadowHtml.includes(label), false, `${projection.worksheetProjectionId}:${label}`);
    }
    assert.equal(projection.shadowHtml.includes('shadow-answer-key'), true);
    assert.equal(projection.shadowHtml.includes('data-source-id'), true);
  }
});

test('production review exposes unresolved evidence instead of fabricating admission', () => {
  const validation = validateW01WorksheetShadowReview(materialized);
  assert.equal(validation.review.blockers.includes('EXACT_PRODUCTION_GENERATOR_EVIDENCE_MISSING'), true);
  assert.equal(validation.review.blockers.includes('PRODUCTION_RENDERER_EVIDENCE_MISSING'), true);
  assert.equal(validation.review.blockers.includes('HTML_PDF_EVIDENCE_MISSING'), true);
  assert.equal(validation.review.blockers.includes('HUMAN_VISUAL_REVIEW_EVIDENCE_MISSING'), true);
  assert.equal(validation.review.productionAdmissionGranted, false);
  assert.equal(Object.values(validation.review.reviewChecks).filter(Boolean).length >= 4, true);
});

test('missing answer key, invalid PBL projection and premature selection fail closed', () => {
  const answerCase = structuredClone(materialized);
  answerCase.projections[0].answerKeyItems.pop();
  assert.equal(codes(validateW01WorksheetShadowReview(answerCase)).includes('POSTG_APP_W01_A04_ANSWER_KEY_COUNT_INVALID'), true);

  const pblCase = structuredClone(materialized);
  const projectionWithPBL = pblCase.projections.find((row) => row.pblSections.length > 0);
  if (projectionWithPBL) {
    projectionWithPBL.pblSections[0].projectionCandidate = 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE';
    assert.equal(codes(validateW01WorksheetShadowReview(pblCase)).includes('POSTG_APP_W01_A04_PBL_PROJECTION_INTEGRITY_INVALID'), true);
  }

  const productionCase = structuredClone(materialized);
  productionCase.projections[0].productionSelectable = true;
  assert.equal(codes(validateW01WorksheetShadowReview(productionCase)).includes('POSTG_APP_W01_A04_PRODUCTION_SELECTION_FORBIDDEN'), true);
});

test('admission review cannot pass while evidence blockers remain', () => {
  const changed = structuredClone(materialized);
  changed.review.reviewDecision = 'PRODUCTION_ADMITTED';
  changed.review.productionAdmissionGranted = true;
  assert.equal(codes(validateW01WorksheetShadowReview(changed)).includes('POSTG_APP_W01_A04_REVIEW_DECISION_INVALID'), true);
});
