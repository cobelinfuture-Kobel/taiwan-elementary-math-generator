import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
);

const Q049_ID = 'p03e_q049_r11_g5b_u04_5b04_profile_decimal_c1';
const Q050_ID = 'p03e_q050_r11_g5b_u06_5b06_profile_decimal_c1';
const APPLICATION_KP = 'kp_g5b_u04_decimal_multiplication_application';
const ESTIMATION_KP = 'kp_g5b_u04_decimal_multiplication_estimation';

const q048Admission = readJson(
  'data/curriculum/full-product/p03f/slice048-product-admission.manifest.json'
);
const queue = readJson(
  'data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json'
);
const sourceResolution = readJson(
  'data/curriculum/full-product/p03f/slice049-g5b-u04-direct-source-witness-resolution.json'
);
const q045Authority = readJson(
  'data/curriculum/full-product/p03f/slice045-g5b-u04-rank10-decimal-times-decimal-authority.json'
);
const reconciliation = readJson(
  'data/curriculum/full-product/p03f/slice049-g5b-u04-queue-allocation-reconciliation.json'
);

test('P03F49 reconciliation starts only after q048 D0 release', () => {
  assert.equal(q048Admission.admissionState, 'PRODUCTION_ADMITTED_D0');
  assert.equal(q048Admission.goalDistance, 'D0');
  assert.equal(q048Admission.productionAdmission.slice049MayStart, true);
});

test('P03F49 preserves frozen q049 ordering and q050 successor', () => {
  assert.equal(queue.orderedSliceIds[48], Q049_ID);
  assert.equal(queue.orderedSliceIds[49], Q050_ID);
  assert.equal(reconciliation.frozenQueue.position, 49);
  assert.equal(reconciliation.frozenQueue.entryId, Q049_ID);
  assert.equal(reconciliation.frozenQueue.queueMutationRequired, false);
  assert.equal(reconciliation.frozenQueue.frozenQueuePreserved, true);
  assert.equal(reconciliation.frozenQueue.silentReorderUsed, false);

  const applicationIndex = queue.orderedKnowledgePointIds.indexOf(APPLICATION_KP);
  const estimationIndex = queue.orderedKnowledgePointIds.indexOf(ESTIMATION_KP);
  assert.ok(applicationIndex >= 0);
  assert.equal(estimationIndex, applicationIndex + 1);
});

test('P03F49 keeps exactly the two frozen G5B-U04 rank11 knowledge points', () => {
  assert.deepEqual(reconciliation.frozenQueue.knowledgePointIds, [
    APPLICATION_KP,
    ESTIMATION_KP
  ]);
  assert.deepEqual(sourceResolution.frozenKnowledgePointIds, [
    APPLICATION_KP,
    ESTIMATION_KP
  ]);

  assert.equal(q045Authority.futureQueueBoundary.applicationQueuePosition, 49);
  assert.equal(q045Authority.futureQueueBoundary.estimationQueuePosition, 49);
  assert.deepEqual(q045Authority.futureQueueBoundary.futureKnowledgePointIds, [
    APPLICATION_KP,
    ESTIMATION_KP
  ]);
});

test('P03F49 operator approval reconciles allocation without rewriting textbook evidence', () => {
  assert.equal(reconciliation.operatorApproval.approved, true);
  assert.equal(reconciliation.operatorApproval.approvedDate, '2026-08-22');
  assert.equal(reconciliation.operatorApproval.applicationClassification, 'OPERATOR_APPROVED_CONTEXTUAL_EXTENSION');
  assert.equal(reconciliation.operatorApproval.estimationClassification, 'OPERATOR_APPROVED_CURRICULUM_EXTENSION');
  assert.equal(reconciliation.operatorApproval.doesNotRewriteSourceEvidence, true);

  assert.equal(reconciliation.sourceTruth.applicationDirectTextbookWitness, false);
  assert.equal(reconciliation.sourceTruth.estimationDirectTextbookWitness, false);
  assert.equal(reconciliation.sourceTruth.textbookDirectWitnessClaimAdded, false);
  assert.equal(reconciliation.sourceTruth.sha256, sourceResolution.source.sha256);
  assert.equal(reconciliation.sourceTruth.reviewedPage, 1);

  for (const candidate of sourceResolution.candidateReview) {
    assert.equal(candidate.directSourceWitnessFound, false);
    assert.equal(candidate.primarySourceTaxonomyMatch, false);
  }
});

test('P03F49 reconciliation opens authority freeze but not product implementation', () => {
  assert.equal(reconciliation.status, 'PASS_QUEUE_ALLOCATION_RECONCILED');
  assert.equal(reconciliation.resolution.allocationReconciled, true);
  assert.equal(reconciliation.resolution.implementationAuthorityWorkMayStart, true);
  assert.equal(reconciliation.resolution.implementationBranchMayStart, false);
  assert.equal(
    reconciliation.resolution.nextTask,
    'P03F49_G5BU04Rank11ApplicationEstimationAuthorityFreeze'
  );

  assert.equal(reconciliation.scope.sourceCountUnchanged, 33);
  assert.equal(reconciliation.scope.currentKnowledgePointCountBeforeQ049, 249);
  assert.equal(reconciliation.scope.expectedKnowledgePointCountAfterQ049, 251);
  assert.equal(reconciliation.scope.g5bU04VisibleBeforeQ049, 3);
  assert.equal(reconciliation.scope.expectedG5bU04VisibleAfterQ049, 5);
  assert.equal(reconciliation.scope.q050Included, false);
  assert.equal(reconciliation.scope.globalContextExpansion, false);
  assert.equal(reconciliation.scope.queueMutation, false);
});
