import fs from 'node:fs';
import path from 'node:path';

import {
  loadPOSTGAPPMasterController as loadLegacyController,
  resolvePOSTGAPPWave,
  validatePOSTGAPPMasterController as validateLegacyController
} from './postg-app-master-controller-legacy.mjs';

const W02_A07_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A07.claim.json';
const W02_A07_EVIDENCE_PATH = 'docs/curriculum/output/POSTG_APP_W02_A07_E4_HUMAN_REVIEW_EVIDENCE.json';
const A07_STATUS = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';
const A08_TASK = 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function readJsonIfExists(root, repoPath) {
  const absolutePath = path.join(root, repoPath);
  return fs.existsSync(absolutePath)
    ? JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
    : null;
}

function legacyA06View(controller) {
  const controllerState = structuredClone(controller.controllerState);
  controllerState.taskId = 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration';
  controllerState.status = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
  controllerState.currentCapability = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
  controllerState.currentMainlineBlocker = 'W02_HUMAN_REVIEW_PACKAGE_PENDING';
  controllerState.nextShortestStep = 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage';
  const w02State = controllerState.waveStates.find((row) => row.waveId === 'W02');
  if (w02State) {
    w02State.state = 'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
    w02State.humanReviewReady = false;
  }
  return { ...controller, controllerState };
}

function validateA07ControllerState(controller, issues) {
  const state = controller.controllerState;
  const w02 = state?.waveStates?.find((row) => row.waveId === 'W02');
  const stateValid = Boolean(
    state?.taskId === 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage'
    && state?.status === A07_STATUS
    && state?.currentWaveId === 'W02'
    && state?.currentCapability === A07_STATUS
    && state?.currentMainlineBlocker === 'W02_OPERATOR_HUMAN_REVIEW_DECISION_PENDING'
    && state?.nextShortestStep === A08_TASK
    && state?.stopReason === 'NONE'
  );
  if (!stateValid) issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));

  const w02Valid = Boolean(
    w02?.state === A07_STATUS
    && w02?.admissionGateComplete === false
    && w02?.productionAdmissionGranted === false
    && w02?.reviewDecision === 'NOT_STARTED'
    && w02?.productionEquivalentOutputVerified === true
    && w02?.humanReviewReady === true
    && w02?.humanReviewEvidence === W02_A07_EVIDENCE_PATH
    && w02?.humanReviewArtifactHashCount === 9
    && w02?.humanReviewApplicationQuestionCount === 61
    && w02?.humanReviewPblTaskSetCount === 31
    && w02?.humanReviewNumericBoundaryCount === 49
    && w02?.humanReviewMacroContextCount === 16
    && w02?.humanReviewPersistentArtifactProvider === 'google_drive'
    && w02?.humanReviewPersistentArtifactId === '1MoK94otZr5hVPdSjX70M-V5pbREbS3dU'
    && w02?.productionAdmittedCandidateCount === 0
    && w02?.publicSelectableCandidateCount === 0
  );
  if (!w02Valid) issues.push(issue('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID', 'controllerState.waveStates.W02'));
}

function validateA07Claim(claim, issues) {
  const valid = Boolean(
    claim
    && claim.actualEvidenceLevel === 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
    && claim.claimedStatus === A07_STATUS
    && claim.claims?.runtimeIntegrated === true
    && claim.claims?.productionEquivalentGeneratorUsed === true
    && claim.claims?.productionRendererUsed === true
    && claim.claims?.htmlOutputVerified === true
    && claim.claims?.pdfOutputVerified === true
    && claim.claims?.visibleOutputChanged === true
    && claim.claims?.humanReviewReady === true
    && claim.claims?.productionAdmitted === false
    && claim.claims?.d0Complete === false
    && claim.nextStep?.taskId === A08_TASK
    && claim.nextStep?.requiredEvidenceLevelBeforeStart === 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
  );
  if (!valid) issues.push(issue('POSTG_APP_W02_A07_CLAIM_INVALID', W02_A07_CLAIM_PATH));
}

function validateA07Evidence(evidence, issues) {
  const valid = Boolean(
    evidence
    && evidence.status === A07_STATUS
    && evidence.evidenceLevel === 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
    && evidence.exactHeadSha === '63b8356c129a8c09fd3df66a433601baaf17d3bf'
    && evidence.coverage?.sourceNodeCount === 13
    && evidence.coverage?.macroContextCount === 16
    && evidence.coverage?.applicationReviewCount === 61
    && evidence.coverage?.pblReviewCount === 31
    && evidence.coverage?.numericBoundaryReviewCount === 49
    && evidence.coverage?.numericPdfPageCount === 68
    && evidence.coverage?.applicationPdfPageCount === 42
    && Array.isArray(evidence.artifactHashes)
    && evidence.artifactHashes.length === 9
    && evidence.githubActions?.workflowConclusion === 'success'
    && evidence.githubActions?.workflowRunId === 29989017841
    && evidence.githubActions?.artifactId === 8556260550
    && evidence.githubActions?.artifactDigest === 'sha256:8264fc31c40858ab09d27f019c9d9c56613e1ed73f09731f64b39296ae7b946a'
    && evidence.persistentArtifact?.storageProvider === 'google_drive'
    && evidence.persistentArtifact?.fileId === '1MoK94otZr5hVPdSjX70M-V5pbREbS3dU'
    && evidence.persistentArtifact?.sha256 === '8264fc31c40858ab09d27f019c9d9c56613e1ed73f09731f64b39296ae7b946a'
    && evidence.failClosedBoundary?.humanReviewReady === true
    && evidence.failClosedBoundary?.operatorDecisionRecorded === false
    && evidence.failClosedBoundary?.reviewDecision === 'NOT_STARTED'
    && evidence.failClosedBoundary?.automaticApprovalAllowed === false
    && evidence.failClosedBoundary?.productionAdmissionGranted === false
    && evidence.failClosedBoundary?.publicSelectable === false
    && evidence.failClosedBoundary?.publicUIChanged === false
    && evidence.failClosedBoundary?.futureWaveContentAuthored === false
    && evidence.nextShortestStep === A08_TASK
  );
  if (!valid) issues.push(issue('POSTG_APP_W02_A07_EVIDENCE_INVALID', W02_A07_EVIDENCE_PATH));
}

export function loadPOSTGAPPMasterController({ root = process.cwd() } = {}) {
  const controller = loadLegacyController({ root });
  return {
    ...controller,
    w02A07Claim: readJsonIfExists(root, W02_A07_CLAIM_PATH),
    w02A07Evidence: readJsonIfExists(root, W02_A07_EVIDENCE_PATH)
  };
}

export function validatePOSTGAPPMasterController(controller) {
  const legacyResult = validateLegacyController(legacyA06View(controller));
  const issues = [...legacyResult.issues];
  validateA07ControllerState(controller, issues);
  validateA07Claim(controller.w02A07Claim, issues);
  validateA07Evidence(controller.w02A07Evidence, issues);
  return {
    ...legacyResult,
    ok: issues.length === 0,
    issues,
    currentWaveId: controller.controllerState.currentWaveId,
    nextShortestStep: controller.controllerState.nextShortestStep,
    status: issues.length === 0 ? A07_STATUS : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'
  };
}

export { resolvePOSTGAPPWave };

export function buildPOSTGAPPMasterReadback({ root = process.cwd() } = {}) {
  const controller = loadPOSTGAPPMasterController({ root });
  const validation = validatePOSTGAPPMasterController(controller);
  return {
    ...validation,
    programId: controller.controllerState.programId,
    taskId: controller.controllerState.taskId,
    producerStateConsumerReadback: controller.controllerState.producerStateConsumerReadback,
    waveSummary: controller.wavePlan.waves.map((wave) => ({
      waveId: wave.waveId,
      plannedState: wave.controllerState,
      currentState: controller.controllerState.waveStates.find((row) => row.waveId === wave.waveId)?.state ?? null,
      sourceNodeCount: wave.sourceNodeIds.length,
      goldenUnitCount: wave.goldenUnitIds?.length ?? 0,
      productionAdmissionGranted: wave.productionAdmissionGranted
    }))
  };
}
