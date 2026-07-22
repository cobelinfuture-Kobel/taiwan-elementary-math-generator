import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  loadPOSTGAPPMasterController,
  validatePOSTGAPPMasterController
} from './postg-app-master-controller.mjs';

const DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision.json';
const A06D_MANIFEST_PATH = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW_MANIFEST.json';
const A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W01-A06.claim.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function sha256File(root, repoPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, repoPath))).digest('hex');
}

export function materializeW01A06EOperatorApproval({ root = process.cwd() } = {}) {
  const decision = readJson(root, DECISION_PATH);
  const a06dManifest = readJson(root, A06D_MANIFEST_PATH);
  const claim = readJson(root, A06_CLAIM_PATH);
  const controller = loadPOSTGAPPMasterController({ root });
  const actualArtifactHashes = decision.reviewedArtifactHashes.map((row) => ({
    path: row.path,
    expectedSha256: row.sha256,
    actualSha256: sha256File(root, row.path)
  }));
  return {
    root,
    decision,
    a06dManifest,
    claim,
    controller,
    actualArtifactHashes
  };
}

export function validateW01A06EOperatorApproval(materialized) {
  const issues = [];
  const { decision, a06dManifest, claim, controller, actualArtifactHashes } = materialized;

  if (decision.schemaName !== 'POSTGAPPW01A06EOperatorSecondHumanReviewDecisionV1'
      || decision.taskId !== 'POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision'
      || decision.operatorDecision !== 'APPROVE'
      || decision.decisionSource !== 'EXPLICIT_OPERATOR_CHAT_DECISION') {
    issues.push(issue('POSTG_APP_W01_A06E_OPERATOR_DECISION_INVALID', DECISION_PATH));
  }

  const accepted = Object.values(decision.operatorAcceptance ?? {});
  if (accepted.length !== 8 || accepted.some((value) => value !== true)) {
    issues.push(issue('POSTG_APP_W01_A06E_OPERATOR_ACCEPTANCE_INCOMPLETE', `${DECISION_PATH}.operatorAcceptance`));
  }

  const admission = decision.productionAdmission ?? {};
  if (admission.granted !== true
      || admission.evidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || admission.scopeType !== 'WAVE_APPLICATION_CAPABILITY'
      || admission.waveId !== 'W01'
      || admission.applicationSourceUnitCount !== 12
      || admission.reviewQuestionCount !== 16
      || admission.applicationSurfaceCount !== 13
      || admission.numericPreservedCount !== 3
      || admission.publicRouteChanged !== false
      || admission.publicSelectionEnabled !== false) {
    issues.push(issue('POSTG_APP_W01_A06E_PRODUCTION_ADMISSION_SCOPE_INVALID', `${DECISION_PATH}.productionAdmission`));
  }

  if (decision.failClosedBoundaries?.automaticApprovalAllowed !== false
      || decision.failClosedBoundaries?.approvalArtifactMutationAllowed !== false
      || decision.failClosedBoundaries?.publicRouteActivationImpliedByApproval !== false
      || decision.failClosedBoundaries?.wavesW02ToW06ProductionAdmissionGranted !== false
      || decision.failClosedBoundaries?.programD0Complete !== false) {
    issues.push(issue('POSTG_APP_W01_A06E_FAIL_CLOSED_BOUNDARY_INVALID', `${DECISION_PATH}.failClosedBoundaries`));
  }

  for (const row of actualArtifactHashes) {
    if (row.actualSha256 !== row.expectedSha256) {
      issues.push(issue('POSTG_APP_W01_A06E_REVIEW_ARTIFACT_HASH_MISMATCH', row.path, {
        expected: row.expectedSha256,
        actual: row.actualSha256
      }));
    }
  }

  if (a06dManifest.status !== 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
      || a06dManifest.evidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || a06dManifest.humanReviewReady !== true
      || a06dManifest.productionAdmissionGranted !== false
      || a06dManifest.reviewDecision !== 'PENDING_SECOND_OPERATOR_DECISION'
      || a06dManifest.reviewCohortQuestionCount !== 16
      || a06dManifest.reviewCohortSourceCount !== 12
      || a06dManifest.reviewCohortMacroContextCount !== 16
      || a06dManifest.mathPreservedCount !== 16
      || a06dManifest.numberFactsPreservedCount !== 16
      || a06dManifest.visibleTitleCount !== 0
      || a06dManifest.genericVisibleUnitCount !== 0) {
    issues.push(issue('POSTG_APP_W01_A06E_REVIEW_EVIDENCE_INVALID', A06D_MANIFEST_PATH));
  }

  if (claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.targetEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.claimedStatus !== 'W01_APPLICATION_CAPABILITY_PRODUCTION_ADMITTED'
      || claim.claims?.productionAdmitted !== true
      || claim.claims?.d0Complete !== false
      || claim.claims?.humanReviewReady !== true
      || claim.nextStep?.taskId !== 'POSTG-APP-W02-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline') {
    issues.push(issue('POSTG_APP_W01_A06E_E5_CLAIM_INVALID', A06_CLAIM_PATH));
  }

  const controllerValidation = validatePOSTGAPPMasterController(controller);
  if (!controllerValidation.ok) {
    issues.push(issue('POSTG_APP_W01_A06E_CONTROLLER_TRANSITION_INVALID', 'postg-app-master-controller-state.json', {
      controllerIssues: controllerValidation.issues
    }));
  }

  const w01 = controller.controllerState.waveStates.find((row) => row.waveId === 'W01');
  const w02 = controller.controllerState.waveStates.find((row) => row.waveId === 'W02');
  if (w01?.state !== 'PRODUCTION_ADMITTED'
      || w01?.productionAdmissionGranted !== true
      || w01?.reviewDecision !== 'APPROVE'
      || w02?.state === 'BLOCKED_BY_PREVIOUS_WAVE'
      || w02?.state === 'PRODUCTION_ADMITTED'
      || !w02?.completedGates?.includes('SOURCE_NODE_REGISTERED')
      || !w02?.completedGates?.includes('KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED')
      || w02?.productionAdmissionGranted !== false
      || controller.controllerState.currentWaveId !== 'W02') {
    issues.push(issue('POSTG_APP_W01_A06E_WAVE_TRANSITION_INVALID', 'controllerState.waveStates'));
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'PASS_POSTG_APP_W01_A06E_OPERATOR_APPROVED_PRODUCTION_ADMITTED'
      : 'FAIL_POSTG_APP_W01_A06E_OPERATOR_APPROVAL',
    counts: {
      reviewedQuestionCount: decision.reviewedArtifact.questionCount,
      applicationSourceUnitCount: admission.applicationSourceUnitCount,
      macroContextMetadataCount: decision.reviewedArtifact.macroContextMetadataCount,
      artifactHashCount: actualArtifactHashes.length,
      productionAdmittedWaveCount: controller.wavePlan.coverage.productionAdmittedWaveCount
    },
    decision: decision.operatorDecision,
    productionAdmissionGranted: admission.granted,
    publicRouteChanged: admission.publicRouteChanged,
    currentWaveId: controller.controllerState.currentWaveId,
    nextShortestStep: controller.controllerState.nextShortestStep
  };
}

export function buildW01A06EOperatorApprovalReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01A06EOperatorApproval({ root });
  return validateW01A06EOperatorApproval(materialized);
}
