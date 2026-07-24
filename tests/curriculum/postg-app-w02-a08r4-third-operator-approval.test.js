import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A08R4ApprovalReadback,
  loadW02A08R4Approval,
  validateW02A08R4Approval,
  W02_A08R4_STATUS,
  W03_A00_HISTORICAL_TASK,
  W03_A00_TASK
} from '../../src/curriculum/application/w02-a08r4-third-operator-approval.mjs';

const loaded = loadW02A08R4Approval();
const codes = (result) => result.issues.map((row) => row.code);

test('A08R4 records APPROVE and production-admits W02 at E5', () => {
  const result = buildW02A08R4ApprovalReadback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, W02_A08R4_STATUS);
  assert.equal(result.operatorDecision, 'APPROVE');
  assert.equal(result.evidenceLevel, 'E5_PRODUCTION_ADMITTED');
  assert.deepEqual(result.counts, {
    generatedItemCount: 195,
    numericQuestionCount: 134,
    applicationQuestionCount: 61,
    pblTaskSetCount: 31,
    operationRoleContractCount: 71,
    pdfPageCount: 110
  });
  assert.equal(result.productionAdmissionGranted, true);
  assert.equal(result.publicRouteChanged, false);
  assert.equal(result.publicSelectable, false);
  assert.equal(result.activatedWaveId, 'W03');
  assert.equal(result.w03ExecutionFrozen, true);
  assert.equal(result.nextShortestStep, W03_A00_TASK);
});

test('third approval is bound to the exact A08R3 artifact and complete acceptance matrix', () => {
  assert.equal(loaded.decision.reviewedArtifactAuthority.headSha, '544a642b8d40fc30edd082dd41ed8065e978ed6a');
  assert.equal(loaded.decision.reviewedArtifactAuthority.workflowRunId, 30051709864);
  assert.equal(loaded.decision.reviewedArtifactAuthority.artifactId, 8581273640);
  assert.equal(loaded.decision.reviewedArtifactAuthority.artifactDigest, 'sha256:d42de8c0707372521689d1acba15801c41cf2c90088820c13b197649ff24c8cb');
  assert.equal(Object.values(loaded.decision.operatorAcceptance).every(Boolean), true);
  assert.equal(Object.values(loaded.decision.blockingFindingCounts).every((value) => value === 0), true);
  assert.equal(Object.values(loaded.evidence.blockingFindingCounts).every((value) => value === 0), true);
});

test('shared access connects W02 production while public and W03 shadow remain closed', () => {
  assert.equal(loaded.registryValidation.ok, true, JSON.stringify(loaded.registryValidation.issues, null, 2));
  assert.equal(loaded.productionAccess.ok, true);
  assert.equal(loaded.productionAccess.provider.lifecycleState, 'PRODUCTION_ADMITTED');
  assert.equal(loaded.productionAccess.provider.productionAdmitted, true);
  assert.equal(loaded.productionAccess.admission.productionAdmitted, true);
  assert.equal(loaded.publicAccess.ok, false);
  assert.equal(loaded.publicAccess.errorCode, 'POSTG_APP_SHARED_WAVE_PUBLIC_SELECTION_FORBIDDEN');
  assert.equal(loaded.w03ShadowAccess.ok, false);
  assert.equal(loaded.w03ShadowAccess.errorCode, 'POSTG_APP_SHARED_WAVE_SHADOW_PROJECTION_FORBIDDEN');
  assert.deepEqual(loaded.registries.admissionRegistry.admittedWaveIds, ['W01', 'W02']);
});

test('historical A08R4 artifacts remain immutable while A09A supersedes their next task', () => {
  assert.equal(loaded.decision.controllerTransition.nextTaskId, W03_A00_HISTORICAL_TASK);
  assert.equal(loaded.evidence.nextWaveActivation.nextTaskId, W03_A00_HISTORICAL_TASK);
  assert.equal(loaded.claim.nextStep.taskId, W03_A00_HISTORICAL_TASK);
  assert.equal(loaded.authorityFreeze.ok, true, JSON.stringify(loaded.authorityFreeze.issues, null, 2));
  assert.equal(loaded.authorityFreeze.w03ExecutionAllowed, false);
  assert.equal(W03_A00_TASK, loaded.authorityFreeze.nextShortestStep);
});

test('E5 approval does not claim public route activation or program D0', () => {
  assert.equal(loaded.decision.productionAdmission.publicRouteChanged, false);
  assert.equal(loaded.decision.productionAdmission.publicSelectionEnabled, false);
  assert.equal(loaded.decision.failClosedBoundaries.programD0Complete, false);
  assert.equal(loaded.claim.claims.productionAdmitted, true);
  assert.equal(loaded.claim.claims.d0Complete, false);
});

test('forged approval, public exposure and non-contiguous admission fail closed', () => {
  const decisionCase = structuredClone(loaded);
  decisionCase.decision.operatorAcceptance.numericMinimalIndependentGivenSetAccepted = false;
  assert.equal(codes(validateW02A08R4Approval(decisionCase)).includes('POSTG_APP_W02_A08R4_DECISION_INVALID'), true);

  const publicCase = structuredClone(loaded);
  publicCase.publicAccess = { ok: true, errorCode: null };
  assert.equal(codes(validateW02A08R4Approval(publicCase)).includes('POSTG_APP_W02_A08R4_PUBLIC_ROUTE_PREMATURE'), true);

  const registryCase = structuredClone(loaded);
  registryCase.registries.admissionRegistry.admittedWaveIds = ['W01', 'W03'];
  registryCase.registryValidation = { ok: false, issues: [{ code: 'FORGED_NON_CONTIGUOUS' }] };
  assert.equal(codes(validateW02A08R4Approval(registryCase)).includes('POSTG_APP_W02_A08R4_SHARED_REGISTRY_INVALID'), true);

  const freezeCase = structuredClone(loaded);
  freezeCase.authorityFreeze = { ok: false, issues: [{ code: 'FORGED_FREEZE' }] };
  assert.equal(codes(validateW02A08R4Approval(freezeCase)).includes('POSTG_APP_W02_A08R4_A09A_SUCCESSOR_FREEZE_INVALID'), true);
});
