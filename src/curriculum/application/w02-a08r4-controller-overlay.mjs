import fs from 'node:fs';
import path from 'node:path';

import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH,
  W02_A08R4_STATUS,
  W02_A08R4_TASK,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';
import {
  W02_A09A_NEXT_TASK,
  W02_A09A_POLICY_PATH,
  W02_A09A_STATUS,
  W02_A09A_TASK
} from './w02-a09a-authority-reconciliation-freeze.mjs';

const readJsonIfExists = (root, repoPath) => {
  const absolute = path.join(root, repoPath);
  return fs.existsSync(absolute) ? JSON.parse(fs.readFileSync(absolute, 'utf8')) : null;
};
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

export function loadW02A08R4ControllerEvidence({ root = process.cwd() } = {}) {
  return {
    w02A08R4Decision: readJsonIfExists(root, W02_A08R4_DECISION_PATH),
    w02A08R4Evidence: readJsonIfExists(root, W02_A08R4_EVIDENCE_PATH),
    w02A08R4Claim: readJsonIfExists(root, W02_A08R4_CLAIM_PATH),
    w02A09AFreezePolicy: readJsonIfExists(root, W02_A09A_POLICY_PATH)
  };
}

export function applyW02A08R4ControllerOverlay({ root = process.cwd(), controllerState }) {
  const loaded = loadW02A08R4ControllerEvidence({ root });
  if (!loaded.w02A08R4Decision || !loaded.w02A08R4Evidence || !loaded.w02A08R4Claim) return controllerState;

  const revised = structuredClone(controllerState);
  const w02 = revised.waveStates.find((row) => row.waveId === 'W02');
  const w03 = revised.waveStates.find((row) => row.waveId === 'W03');
  if (!w02 || !w03) return controllerState;

  const freezeActive = loaded.w02A09AFreezePolicy?.executionFreeze?.active === true;

  revised.taskId = freezeActive ? W02_A09A_TASK : W02_A08R4_TASK;
  revised.status = freezeActive ? W02_A09A_STATUS : W02_A08R4_STATUS;
  revised.currentWaveId = freezeActive ? 'W02' : 'W03';
  revised.currentCapability = freezeActive ? W02_A09A_STATUS : 'W03_ASSESSMENT_READY';
  revised.currentMainlineBlocker = freezeActive
    ? 'BATCH_B_CANONICAL_KNOWLEDGE_POINT_AUTHORITY_AND_SHARED_PUBLIC_APPLICATION_CONSUMER_PENDING'
    : 'W03_SOURCE_ASSESSMENT_PENDING';
  revised.nextShortestStep = freezeActive ? W02_A09A_NEXT_TASK : W03_A00_TASK;
  revised.mainlineExecutionFreeze = {
    active: freezeActive,
    status: loaded.w02A09AFreezePolicy?.status ?? null,
    authorityPath: W02_A09A_POLICY_PATH,
    blockedWaveIds: loaded.w02A09AFreezePolicy?.executionFreeze?.blockedWaveIds ?? [],
    nextShortestStep: freezeActive ? W02_A09A_NEXT_TASK : W03_A00_TASK
  };
  revised.productionAdmission = {
    ...(revised.productionAdmission ?? {}),
    applicationUnitCount: 25,
    waveCount: 2,
    allowed: true,
    lastReviewDecision: 'APPROVE',
    admittedWaveIds: ['W01', 'W02'],
    publicRouteChanged: false
  };

  Object.assign(w02, {
    state: 'PRODUCTION_ADMITTED',
    completedGates: [
      'SOURCE_NODE_REGISTERED',
      'KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED',
      'KP_APPLICATION_CLASSIFICATION_COMPLETE',
      'CANONICAL_OPERATION_MODEL_COMPLETE',
      'SINGLE_APPLICATION_ADMISSION_COMPLETE',
      'GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE',
      'N_PLUS_1_CONTRACT_COMPLETE',
      'VALIDATOR_CONTRACT_COMPLETE',
      'POSITIVE_NEGATIVE_FIXTURES_COMPLETE',
      'SHARED_RUNTIME_SHADOW_PASS',
      'PRODUCTION_ADMISSION_REVIEWED'
    ],
    admissionGateComplete: true,
    productionAdmissionGranted: true,
    reviewDecision: 'APPROVE',
    operatorDecisionState: 'THIRD_APPROVE_RECORDED',
    thirdOperatorReviewComplete: true,
    decisionEvidence: W02_A08R4_DECISION_PATH,
    reviewEvidence: W02_A08R4_EVIDENCE_PATH,
    productionAdmittedCandidateCount: 195,
    publicSelectableCandidateCount: 0,
    productionRuntimeAccessEnabled: true,
    publicRouteChanged: false,
    canonicalCurriculumAuthorityReconciliationRequired: freezeActive,
    canonicalCurriculumAuthorityReconciled: false,
    canonicalCurriculumAuthorityPath: freezeActive ? W02_A09A_POLICY_PATH : null,
    globalContextSingleApplicationAuthorityRequired: freezeActive,
    legacyApplicationRoutesFrozen: freezeActive
  });

  Object.assign(w03, {
    state: 'ASSESSMENT_READY',
    admissionGateComplete: false,
    productionAdmissionGranted: false,
    reviewDecision: null,
    shadowProjectionAllowed: false,
    publicSelectable: false,
    executionFrozen: freezeActive,
    implementationAllowed: false,
    freezeStatus: freezeActive ? W02_A09A_STATUS : null,
    freezeAuthorityPath: freezeActive ? W02_A09A_POLICY_PATH : null
  });

  revised.producerStateConsumerReadback = {
    producerTaskId: freezeActive ? W02_A09A_TASK : W02_A08R4_TASK,
    authoritativeState: freezeActive ? W02_A09A_POLICY_PATH : W02_A08R4_DECISION_PATH,
    runtimeConsumer: 'src/curriculum/application/postg-app-master-controller.mjs',
    readbackStatus: freezeActive ? W02_A09A_STATUS : W02_A08R4_STATUS,
    productionEvidence: W02_A08R4_EVIDENCE_PATH,
    mainlineExecutionFreezeAuthority: freezeActive ? W02_A09A_POLICY_PATH : null
  };
  return revised;
}

export function validateW02A08R4ControllerEvidence(controller) {
  const issues = [];
  const {
    w02A08R4Decision: decision,
    w02A08R4Evidence: evidence,
    w02A08R4Claim: claim,
    w02A09AFreezePolicy: freezePolicy
  } = controller;
  if (!decision || decision.operatorDecision !== 'APPROVE' || decision.productionAdmission?.granted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_DECISION_INVALID', W02_A08R4_DECISION_PATH));
  }
  if (!evidence || evidence.status !== W02_A08R4_STATUS || evidence.productionAdmission?.granted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_EVIDENCE_INVALID', W02_A08R4_EVIDENCE_PATH));
  }
  if (!claim || claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED' || claim.claims?.productionAdmitted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_CLAIM_INVALID', W02_A08R4_CLAIM_PATH));
  }
  if (!freezePolicy
      || freezePolicy.status !== W02_A09A_STATUS
      || freezePolicy.executionFreeze?.active !== true
      || freezePolicy.executionFreeze?.w03ImplementationMayStart !== false) {
    issues.push(issue('POSTG_APP_W02_A09A_CONTROLLER_FREEZE_INVALID', W02_A09A_POLICY_PATH));
  }
  return issues;
}
