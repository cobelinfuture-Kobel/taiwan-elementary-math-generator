import fs from 'node:fs';
import path from 'node:path';

export const W02_A08R2_EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r2/POSTG_APP_W02_A08R2_SECOND_REVIEW_EVIDENCE.json';
export const W02_A08R2_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision.json';
export const W02_A08R2_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08R2.claim.json';
export const W02_A08R2_STATUS = 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED';
export const W02_A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJsonIfExists = (root, repoPath) => {
  const absolutePath = path.join(root, repoPath);
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : null;
};

export function loadW02A08R2ControllerEvidence({ root = process.cwd() } = {}) {
  return {
    w02A08R2Evidence: readJsonIfExists(root, W02_A08R2_EVIDENCE_PATH),
    w02A08R2Decision: readJsonIfExists(root, W02_A08R2_DECISION_PATH),
    w02A08R2Claim: readJsonIfExists(root, W02_A08R2_CLAIM_PATH)
  };
}

export function applyW02A08R2ControllerOverlay({ root = process.cwd(), controllerState }) {
  const loaded = loadW02A08R2ControllerEvidence({ root });
  if (!loaded.w02A08R2Evidence || !loaded.w02A08R2Decision || !loaded.w02A08R2Claim) return controllerState;

  const revised = structuredClone(controllerState);
  const w02 = revised.waveStates.find((row) => row.waveId === 'W02');
  if (!w02) return controllerState;

  revised.taskId = 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision';
  revised.status = W02_A08R2_STATUS;
  revised.currentWaveId = 'W02';
  revised.currentCapability = W02_A08R2_STATUS;
  revised.currentMainlineBlocker = 'W02_NUMERIC_STUDENT_FACING_SURFACE_REMEDIATION_REQUIRED';
  revised.nextShortestStep = W02_A08R3_TASK;

  Object.assign(w02, {
    state: W02_A08R2_STATUS,
    reviewDecision: 'REVISE',
    admissionGateComplete: false,
    productionAdmissionGranted: false,
    reviewEvidence: W02_A08R2_EVIDENCE_PATH,
    decisionEvidence: W02_A08R2_DECISION_PATH,
    operatorDecisionState: 'SECOND_REVISE_RECORDED',
    secondOperatorReviewComplete: true,
    secondOperatorReviewDecision: 'REVISE',
    secondReviewArtifactHashCount: 6,
    secondReviewNumericQuestionCount: 134,
    secondReviewApplicationQuestionCount: 61,
    secondReviewPblTaskSetCount: 31,
    secondReviewPdfPageCount: 110,
    unresolvedRequestedRoleSurfaceCount: 13,
    answerEquivalentGivenLeakageCount: 19,
    malformedOrIncoherentNumericSurfaceCount: 12,
    gradeUnsafeNotationCount: 2,
    productionAdmittedCandidateCount: 0,
    publicSelectableCandidateCount: 0
  });

  revised.producerStateConsumerReadback = {
    ...(revised.producerStateConsumerReadback ?? {}),
    producerTaskId: revised.taskId,
    authoritativeState: W02_A08R2_DECISION_PATH,
    runtimeConsumer: 'src/curriculum/application/w02-a08r2-second-operator-review-decision.mjs',
    readbackStatus: W02_A08R2_STATUS
  };
  return revised;
}

export function validateW02A08R2ControllerEvidence(controller) {
  const issues = [];
  const { w02A08R2Evidence: evidence, w02A08R2Decision: decision, w02A08R2Claim: claim } = controller;
  if (!evidence || evidence.status !== W02_A08R2_STATUS
      || evidence.reviewDecision !== 'REVISE'
      || evidence.reviewCoverage?.numericQuestionCount !== 134
      || evidence.reviewCoverage?.applicationQuestionCount !== 61
      || evidence.reviewCoverage?.pblTaskSetCount !== 31
      || evidence.reviewCoverage?.pdfPageCount !== 110
      || evidence.artifacts?.length !== 6
      || evidence.blockingFindings?.length !== 4) {
    issues.push(issue('POSTG_APP_W02_A08R2_EVIDENCE_INVALID', W02_A08R2_EVIDENCE_PATH));
  }
  if (!decision || decision.operatorDecision !== 'REVISE'
      || decision.productionAdmission?.granted !== false
      || decision.productionAdmission?.publicSelectionEnabled !== false
      || decision.controllerTransition?.waveState !== W02_A08R2_STATUS
      || decision.controllerTransition?.nextTaskId !== W02_A08R3_TASK
      || decision.failClosedBoundaries?.w03ToW06Unblocked !== false) {
    issues.push(issue('POSTG_APP_W02_A08R2_DECISION_INVALID', W02_A08R2_DECISION_PATH));
  }
  if (!claim || claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || claim.claimedStatus !== W02_A08R2_STATUS
      || claim.claims?.operatorDecision !== 'REVISE'
      || claim.claims?.productionAdmitted !== false
      || claim.claims?.publicSelectable !== false
      || claim.claims?.d0Complete !== false
      || claim.nextStep?.taskId !== W02_A08R3_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R2_CLAIM_INVALID', W02_A08R2_CLAIM_PATH));
  }
  return issues;
}
