import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A08R1Readback,
  materializeW02A08R1Remediation,
  validateW02A08R1Remediation
} from '../../src/curriculum/application/w02-a08r1-student-facing-remediation.mjs';

const codes = (result) => result.issues.map((row) => row.code);
const A08R1_STATUS = 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY';
const A08R2_TASK = 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision';

function assertReadback(result) {
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, A08R1_STATUS);
  assert.deepEqual(result.counts, {
    generatedItemCount: 195,
    applicationReviewCount: 61,
    numericBoundaryReviewCount: 49,
    pblReviewCount: 31,
    operationFamilyCount: 49
  });
  assert.deepEqual(result.audit.application, {
    reviewedCount: 61,
    rawRoleLeakageCount: 0,
    internalIdLeakageCount: 0,
    internalTokenLeakageCount: 0,
    malformedSurfaceCount: 0,
    missingAnswerCount: 0,
    sameDenominatorKnowledgeMismatchCount: 0,
    lengthConversionSurfaceMismatchCount: 0,
    rateDistanceSurfaceMismatchCount: 0,
    fractionalCapacityDisplayMismatchCount: 0,
    gradeInappropriateFractionVariableCount: 0
  });
  assert.deepEqual(result.audit.numeric, {
    reviewedCount: 49,
    rawRoleLeakageCount: 0,
    internalIdLeakageCount: 0,
    internalTokenLeakageCount: 0,
    malformedSurfaceCount: 0
  });
  assert.deepEqual(result.audit.pbl, {
    reviewedCount: 31,
    dependencyGraphMissingCount: 0,
    authenticityNotVerifiedCount: 0,
    notFullyInstantiatedCount: 0,
    finalDecisionIncompleteCount: 0,
    internalIdLeakageCount: 0,
    internalTokenLeakageCount: 0,
    malformedSurfaceCount: 0,
    genericTaskSurfaceCount: 0,
    governancePhraseLeakageCount: 0,
    genericProductLabelCount: 0,
    duplicatedTaskSurfaceCount: 0
  });
  assert.equal(result.studentFacingSemanticRevision, 3);
  assert.equal(result.productionAdmissionGranted, false);
  assert.equal(result.nextShortestStep, A08R2_TASK);
}

test('W02 A08R1 persisted readback records the zero-defect non-production state', () => {
  assertReadback(buildW02A08R1Readback());
});

test('persisted A08R1 readback matches a fresh dynamic materialization', () => {
  const snapshot = buildW02A08R1Readback();
  const dynamic = validateW02A08R1Remediation(materializeW02A08R1Remediation());
  assertReadback(dynamic);
  assert.deepEqual(
    {
      ok: snapshot.ok,
      issues: snapshot.issues,
      status: snapshot.status,
      counts: snapshot.counts,
      audit: snapshot.audit,
      studentFacingSemanticRevision: snapshot.studentFacingSemanticRevision,
      productionAdmissionGranted: snapshot.productionAdmissionGranted,
      nextShortestStep: snapshot.nextShortestStep
    },
    dynamic
  );
});

test('remediated application and numeric samples are readable and token-safe', () => {
  const materialized = materializeW02A08R1Remediation();
  const application = materialized.a06Package.applicationItems[0];
  const numeric = materialized.a06Package.numericItems[0];
  for (const item of [application, numeric]) {
    assert.equal(item.studentFacingSurfaceVersion, 'W02_A08R1_V1');
    assert.equal(item.studentFacingSemanticRevision, 3);
    assert.equal(item.prompt.length > 10, true, item.prompt);
    assert.equal(/([A-Za-z][A-Za-z0-9_]*)為/.test(item.prompt), false, item.prompt);
    assert.equal(/\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(item.prompt), false, item.prompt);
    assert.equal(/[A-Z]{2,}(?:_[A-Z]+)+/.test(`${item.prompt} ${item.answerText}`), false, item.prompt);
  }
  assert.equal(application.prompt.includes('情境中'), false);
  assert.equal(/^在[^。]+為了/.test(application.prompt), false);
});

test('all PBL task sets contain operation-specific dependency and final-decision surfaces', () => {
  const materialized = materializeW02A08R1Remediation();
  for (const record of materialized.a06Package.pblTaskSetRecords) {
    assert.equal(record.studentFacingInstantiationVersion, 'W02_A08R1_V1');
    assert.equal(record.studentFacingSemanticRevision, 3);
    assert.equal(record.drivingProblem.authenticityExecutionVerified, true);
    assert.equal(record.tasks.every((task) => task.fullyInstantiated === true), true);
    assert.equal(new Set(record.tasks.map((task) => task.promptZh)).size, record.tasks.length);
    assert.equal(record.dependencyGraph.length > 0, true);
    assert.equal(record.finalProduct.executed, true);
    assert.equal(record.finalDecisionRequired, true);
    assert.notEqual(record.drivingProblem.finalProductType, '可執行方案');
    assert.notEqual(record.drivingProblem.finalProductType, '數學成果報告');
  }
});

test('raw role regression and incomplete PBL regression fail closed', () => {
  const materialized = materializeW02A08R1Remediation();

  const rawRole = structuredClone(materialized);
  rawRole.reviewModel.applicationReviewRows[0].promptText += ' denominator為8';
  rawRole.audit.application.rawRoleLeakageCount = 1;
  assert.equal(codes(validateW02A08R1Remediation(rawRole)).includes('POSTG_APP_W02_A08R1_SEMANTIC_AUDIT_FAILED'), true);

  const incompletePbl = structuredClone(materialized);
  incompletePbl.a06Package.pblTaskSetRecords[0].studentFacingSemanticRevision = 2;
  assert.equal(codes(validateW02A08R1Remediation(incompletePbl)).includes('POSTG_APP_W02_A08R1_PBL_VERSION_INVALID'), true);
});

test('production or public selection cannot be enabled by remediation', () => {
  const materialized = structuredClone(materializeW02A08R1Remediation());
  materialized.a06Package.generatedItems[0].productionSelectable = true;
  const result = validateW02A08R1Remediation(materialized);
  assert.equal(result.ok, false);
  assert.equal(codes(result).includes('POSTG_APP_W02_A08R1_PREMATURE_ADMISSION'), true);
});
