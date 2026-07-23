import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A08OperatorReviewReadback,
  materializeW02A08OperatorReviewDecision,
  validateW02A08OperatorReviewDecision
} from '../../src/curriculum/application/w02-a08-operator-review-decision.mjs';

const codes = (result) => result.issues.map((row) => row.code);

test('W02 A08 records a fail-closed REVISE decision from the full review cohort', () => {
  const result = buildW02A08OperatorReviewReadback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A08_OPERATOR_REVIEW_REVISE_RECORDED');
  assert.equal(result.decision, 'REVISE');
  assert.equal(result.productionAdmissionGranted, false);
  assert.equal(result.artifactHashCount, 10);
  assert.equal(result.findings.application.reviewedCount, 61);
  assert.equal(result.findings.application.rawSlotLeakageCount, 61);
  assert.equal(result.findings.application.malformedSurfaceCount, 61);
  assert.equal(result.findings.numeric.reviewedCount, 49);
  assert.equal(result.findings.numeric.rawSlotLeakageCount, 48);
  assert.equal(result.findings.pbl.reviewedCount, 31);
  assert.equal(result.findings.pbl.notFullyInstantiatedCount, 31);
  assert.equal(result.findings.pbl.internalTokenLeakageCount, 31);
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview');
});

test('forged approval and production admission fail closed', () => {
  const materialized = materializeW02A08OperatorReviewDecision();

  const forgedApproval = structuredClone(materialized);
  forgedApproval.decision.operatorDecision = 'APPROVE';
  assert.equal(codes(validateW02A08OperatorReviewDecision(forgedApproval)).includes('POSTG_APP_W02_A08_OPERATOR_DECISION_INVALID'), true);

  const forgedAdmission = structuredClone(materialized);
  forgedAdmission.decision.productionAdmission.granted = true;
  assert.equal(codes(validateW02A08OperatorReviewDecision(forgedAdmission)).includes('POSTG_APP_W02_A08_PRODUCTION_ADMISSION_FAIL_CLOSED_INVALID'), true);
});

test('finding-count drift and weakened acceptance matrix fail closed', () => {
  const materialized = materializeW02A08OperatorReviewDecision();

  const countDrift = structuredClone(materialized);
  countDrift.findings.application.rawSlotLeakageCount = 60;
  assert.equal(codes(validateW02A08OperatorReviewDecision(countDrift)).includes('POSTG_APP_W02_A08_REVIEW_FINDING_COUNT_MISMATCH'), true);

  const weakenedAcceptance = structuredClone(materialized);
  weakenedAcceptance.decision.operatorAcceptance.applicationSemanticNaturalnessAccepted = true;
  assert.equal(codes(validateW02A08OperatorReviewDecision(weakenedAcceptance)).includes('POSTG_APP_W02_A08_ACCEPTANCE_MATRIX_INVALID'), true);
});

test('remediation task and future-wave boundaries cannot be bypassed', () => {
  const materialized = materializeW02A08OperatorReviewDecision();

  const bypass = structuredClone(materialized);
  bypass.decision.remediation.required = false;
  bypass.decision.failClosedBoundaries.w03ToW06Unblocked = true;
  const resultCodes = codes(validateW02A08OperatorReviewDecision(bypass));
  assert.equal(resultCodes.includes('POSTG_APP_W02_A08_REMEDIATION_TRANSITION_INVALID'), true);
  assert.equal(resultCodes.includes('POSTG_APP_W02_A08_FAIL_CLOSED_BOUNDARY_INVALID'), true);
});
