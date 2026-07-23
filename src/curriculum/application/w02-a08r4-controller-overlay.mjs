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

const readJsonIfExists = (root, repoPath) => {
  const absolute = path.join(root, repoPath);
  return fs.existsSync(absolute) ? JSON.parse(fs.readFileSync(absolute, 'utf8')) : null;
};
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

export function loadW02A08R4ControllerEvidence({ root = process.cwd() } = {}) {
  return {
    w02A08R4Decision: readJsonIfExists(root, W02_A08R4_DECISION_PATH),
    w02A08R4Evidence: readJsonIfExists(root, W02_A08R4_EVIDENCE_PATH),
    w02A08R4Claim: readJsonIfExists(root, W02_A08R4_CLAIM_PATH)
  };
}

export function applyW02A08R4ControllerOverlay({ root = process.cwd(), controllerState }) {
  const loaded = loadW02A08R4ControllerEvidence({ root });
  if (!loaded.w02A08R4Decision || !loaded.w02A08R4Evidence || !loaded.w02A08R4Claim) return controllerState;

  const revised = structuredClone(controllerState);
  const w02 = revised.waveStates.find((row) => row.waveId === 'W02');
  const w03 = revised.waveStates.find((row) => row.waveId === 'W03');
  if (!w02 || !w03) return controllerState;

  revised.taskId = W02_A08R4_TASK;
  revised.status = W02_A08R4_STATUS;
  revised.currentWaveId = 'W03';
  revised.currentCapability = 'W03_ASSESSMENT_READY';
  revised.currentMainlineBlocker = 'W03_SOURCE_ASSESSMENT_PENDING';
  revised.nextShortestStep = W03_A00_TASK;
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
    publicRouteChanged: false
  });

  Object.assign(w03, {
    state: 'ASSESSMENT_READY',
    admissionGateComplete: false,
    productionAdmissionGranted: false,
    reviewDecision: null,
    shadowProjectionAllowed: false,
    publicSelectable: false
  });

  revised.producerStateConsumerReadback = {
    producerTaskId: W02_A08R4_TASK,
    authoritativeState: W02_A08R4_DECISION_PATH,
    runtimeConsumer: 'src/curriculum/application/shared/application-capability-resolver.mjs',
    readbackStatus: W02_A08R4_STATUS
  };
  return revised;
}

export function validateW02A08R4ControllerEvidence(controller) {
  const issues = [];
  const { w02A08R4Decision: decision, w02A08R4Evidence: evidence, w02A08R4Claim: claim } = controller;
  if (!decision || decision.operatorDecision !== 'APPROVE' || decision.productionAdmission?.granted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_DECISION_INVALID', W02_A08R4_DECISION_PATH));
  }
  if (!evidence || evidence.status !== W02_A08R4_STATUS || evidence.productionAdmission?.granted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_EVIDENCE_INVALID', W02_A08R4_EVIDENCE_PATH));
  }
  if (!claim || claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED' || claim.claims?.productionAdmitted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_CONTROLLER_CLAIM_INVALID', W02_A08R4_CLAIM_PATH));
  }
  return issues;
}
