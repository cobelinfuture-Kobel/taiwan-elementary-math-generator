import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A08R2SecondOperatorReviewReadback,
  materializeW02A08R2SecondOperatorReview,
  validateW02A08R2SecondOperatorReview
} from '../../src/curriculum/application/w02-a08r2-second-operator-review-decision.mjs';

const codes = (result) => result.issues.map((row) => row.code);

const expectedFindingCounts = {
  W02_A08R2_NUMERIC_UNRESOLVED_REQUESTED_ROLE_SURFACE: 13,
  W02_A08R2_NUMERIC_ANSWER_EQUIVALENT_GIVEN_LEAKAGE: 19,
  W02_A08R2_NUMERIC_MALFORMED_OR_INCOHERENT_SURFACE: 12,
  W02_A08R2_NUMERIC_GRADE_UNSAFE_NOTATION: 2
};

test('W02 A08R2 records the second operator REVISE decision without E5 admission', () => {
  const result = buildW02A08R2SecondOperatorReviewReadback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED');
  assert.equal(result.decision, 'REVISE');
  assert.equal(result.productionAdmissionGranted, false);
  assert.deepEqual(result.counts, {
    generatedItemCount: 195,
    numericQuestionCount: 134,
    applicationQuestionCount: 61,
    pblTaskSetCount: 31,
    pdfPageCount: 110,
    artifactHashCount: 6,
    blockingFindingClassCount: 4
  });
  assert.deepEqual(result.findingCounts, expectedFindingCounts);
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation');
});

test('second review is bound to the exact regenerated artifact and complete cohort', () => {
  const materialized = materializeW02A08R2SecondOperatorReview();
  const { evidence, decision, claim } = materialized;
  assert.equal(evidence.artifactAuthority.headSha, 'f3f22fc9574fce4b3b1989eec38dda6f8c4cb114');
  assert.equal(evidence.artifactAuthority.workflowRunId, 30017213141);
  assert.equal(evidence.artifactAuthority.artifactId, 8567716936);
  assert.equal(evidence.artifactAuthority.artifactDigest, 'sha256:92a39876b715901fb68f30d5cc9fe1b08c9df3fc175421af83b58d4142ce35b6');
  assert.equal(evidence.artifacts.length, 6);
  assert.equal(evidence.reviewCoverage.reviewedNumericQuestionCount, 134);
  assert.equal(evidence.reviewCoverage.reviewedApplicationQuestionCount, 61);
  assert.equal(evidence.reviewCoverage.reviewedPblTaskSetCount, 31);
  assert.equal(evidence.reviewCoverage.reviewedPdfPageCount, 110);
  assert.equal(decision.reviewEvidencePath.endsWith('POSTG_APP_W02_A08R2_SECOND_REVIEW_EVIDENCE.json'), true);
  assert.equal(claim.evidence.artifactHashes.length, 2);
  assert.equal(claim.evidence.reviewArtifactPaths.length, 2);
  assert.equal(evidence.artifacts.length, 6);
});

test('application, PBL and layout improvements are accepted while numeric defects remain blocking', () => {
  const { evidence } = materializeW02A08R2SecondOperatorReview();
  assert.equal(evidence.acceptedDimensions.applicationSemanticNaturalness, true);
  assert.equal(evidence.acceptedDimensions.pblDependencyTaskMilestoneInstantiation, true);
  assert.equal(evidence.acceptedDimensions.htmlPdfLayoutContainment, true);
  assert.equal(evidence.acceptedDimensions.numericStudentFacingUnknownNaming, false);
  assert.equal(evidence.acceptedDimensions.numericGivenSetMinimality, false);
  assert.equal(evidence.acceptedDimensions.numericRelationCoherence, false);
  assert.equal(evidence.acceptedDimensions.numericGradeAppropriateNotation, false);
  for (const finding of evidence.blockingFindings) {
    assert.equal(finding.severity, 'BLOCKING');
    assert.equal(finding.itemOrdinals.length, finding.affectedCount);
    assert.equal(finding.generatedItemIds.length, finding.affectedCount);
  }
});

test('forged approval, admission, finding count and artifact authority fail closed', () => {
  const base = materializeW02A08R2SecondOperatorReview();

  const approval = structuredClone(base);
  approval.decision.operatorDecision = 'APPROVE';
  assert.equal(codes(validateW02A08R2SecondOperatorReview(approval)).includes('POSTG_APP_W02_A08R2_DECISION_INVALID'), true);

  const admission = structuredClone(base);
  admission.claim.claims.productionAdmitted = true;
  assert.equal(codes(validateW02A08R2SecondOperatorReview(admission)).includes('POSTG_APP_W02_A08R2_CLAIM_INVALID'), true);

  const count = structuredClone(base);
  count.evidence.blockingFindings[0].affectedCount = 12;
  assert.equal(codes(validateW02A08R2SecondOperatorReview(count)).includes('POSTG_APP_W02_A08R2_FINDING_COUNT_OR_IDENTITY_INVALID'), true);

  const authority = structuredClone(base);
  authority.decision.reviewedArtifactAuthority.artifactDigest = `sha256:${'0'.repeat(64)}`;
  assert.equal(codes(validateW02A08R2SecondOperatorReview(authority)).includes('POSTG_APP_W02_A08R2_ARTIFACT_AUTHORITY_MISMATCH'), true);
});
