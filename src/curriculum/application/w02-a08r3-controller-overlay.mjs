import fs from 'node:fs';
import path from 'node:path';

import {
  W02_A08R3_READBACK_PATH,
  W02_A08R3_STATUS,
  W02_A08R3_TASK,
  W02_A08R4_TASK
} from './w02-a08r3-numeric-surface-remediation.mjs';

export const W02_A08R3_EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r3/POSTG_APP_W02_A08R3_NUMERIC_SURFACE_REMEDIATION_EVIDENCE.json';
export const W02_A08R3_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08R3.claim.json';
export const W02_A08R3_BLOCKER = 'W02_REGENERATED_HTML_PDF_THIRD_OPERATOR_REVIEW_DECISION_PENDING';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJsonIfExists = (root, repoPath) => {
  const absolute = path.join(root, repoPath);
  return fs.existsSync(absolute) ? JSON.parse(fs.readFileSync(absolute, 'utf8')) : null;
};

export function loadW02A08R3ControllerEvidence({ root = process.cwd() } = {}) {
  return {
    w02A08R3Readback: readJsonIfExists(root, W02_A08R3_READBACK_PATH),
    w02A08R3Evidence: readJsonIfExists(root, W02_A08R3_EVIDENCE_PATH),
    w02A08R3Claim: readJsonIfExists(root, W02_A08R3_CLAIM_PATH)
  };
}

export function applyW02A08R3ControllerOverlay({ root = process.cwd(), controllerState }) {
  const loaded = loadW02A08R3ControllerEvidence({ root });
  if (!loaded.w02A08R3Readback || !loaded.w02A08R3Evidence || !loaded.w02A08R3Claim) return controllerState;

  const revised = structuredClone(controllerState);
  const w02 = revised.waveStates.find((row) => row.waveId === 'W02');
  if (!w02) return controllerState;

  revised.taskId = W02_A08R3_TASK;
  revised.status = W02_A08R3_STATUS;
  revised.currentWaveId = 'W02';
  revised.currentCapability = W02_A08R3_STATUS;
  revised.currentMainlineBlocker = W02_A08R3_BLOCKER;
  revised.nextShortestStep = W02_A08R4_TASK;

  Object.assign(w02, {
    state: W02_A08R3_STATUS,
    reviewDecision: 'REVISE',
    admissionGateComplete: false,
    productionAdmissionGranted: false,
    numericRemediationEvidence: W02_A08R3_EVIDENCE_PATH,
    numericRemediationReadback: W02_A08R3_READBACK_PATH,
    numericRemediationState: 'FOUR_BLOCKING_FINDING_CLASSES_ZERO',
    numericStudentFacingSurfaceVersion: 'W02_A08R3_V1',
    numericStudentFacingSemanticRevision: 4,
    applicationStudentFacingSurfaceVersion: 'W02_A08R1_V1',
    applicationStudentFacingSemanticRevision: 3,
    pblStudentFacingInstantiationVersion: 'W02_A08R1_V1',
    pblStudentFacingSemanticRevision: 3,
    historicalAffectedItemCount: 45,
    unresolvedRequestedRoleSurfaceCount: 0,
    answerEquivalentGivenLeakageCount: 0,
    malformedOrIncoherentNumericSurfaceCount: 0,
    gradeUnsafeNotationCount: 0,
    thirdOperatorReviewReady: true,
    productionAdmittedCandidateCount: 0,
    publicSelectableCandidateCount: 0
  });

  revised.producerStateConsumerReadback = {
    ...(revised.producerStateConsumerReadback ?? {}),
    producerTaskId: W02_A08R3_TASK,
    authoritativeState: W02_A08R3_READBACK_PATH,
    runtimeConsumer: 'src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs',
    readbackStatus: W02_A08R3_STATUS
  };
  return revised;
}

export function validateW02A08R3ControllerEvidence(controller) {
  const issues = [];
  const { w02A08R3Readback: readback, w02A08R3Evidence: evidence, w02A08R3Claim: claim } = controller;
  const zeroCounts = {
    unresolvedRequestedUnknown: 0,
    answerEquivalentOrNonMinimalGivenSet: 0,
    malformedOrIncoherentSurface: 0,
    gradeUnsafeNotation: 0
  };

  if (!readback || readback.ok !== true
      || readback.status !== W02_A08R3_STATUS
      || readback.counts?.generatedItemCount !== 195
      || readback.counts?.numericQuestionCount !== 134
      || readback.counts?.historicalAffectedItemCount !== 45
      || JSON.stringify(readback.audit?.counts) !== JSON.stringify(zeroCounts)
      || readback.productionAdmissionGranted !== false
      || readback.publicSelectable !== false
      || readback.thirdOperatorReviewReady !== true
      || readback.nextShortestStep !== W02_A08R4_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R3_READBACK_INVALID', W02_A08R3_READBACK_PATH));
  }
  if (!evidence || evidence.status !== W02_A08R3_STATUS
      || JSON.stringify(evidence.afterFindingCounts) !== JSON.stringify(zeroCounts)
      || evidence.coverage?.historicalAffectedItemCount !== 45
      || evidence.coverage?.pdfPageCount !== 110
      || evidence.boundaries?.productionAdmissionGranted !== false
      || evidence.thirdOperatorReviewReady !== true
      || evidence.nextShortestStep !== W02_A08R4_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R3_EVIDENCE_INVALID', W02_A08R3_EVIDENCE_PATH));
  }
  if (!claim || claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || claim.claimedStatus !== W02_A08R3_STATUS
      || claim.claims?.visibleOutputChanged !== true
      || claim.claims?.humanReviewReady !== true
      || claim.claims?.productionAdmitted !== false
      || claim.claims?.d0Complete !== false
      || claim.nextStep?.taskId !== W02_A08R4_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R3_CLAIM_INVALID', W02_A08R3_CLAIM_PATH));
  }
  return issues;
}
