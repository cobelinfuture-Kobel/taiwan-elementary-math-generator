import fs from 'node:fs';
import path from 'node:path';

import {
  loadSharedApplicationRegistries,
  resolveWaveApplicationAccess,
  validateSharedApplicationRegistries
} from './shared/application-capability-resolver.mjs';
import {
  W02_A09A_NEXT_TASK,
  W02_A09A_POLICY_PATH,
  buildW02A09AAuthorityFreezeReadback
} from './w02-a09a-authority-reconciliation-freeze.mjs';

export const W02_A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';
export const W02_A08R4_STATUS = 'W02_PRODUCTION_ADMITTED_W03_ASSESSMENT_READY';
export const W03_A00_HISTORICAL_TASK = 'POSTG-APP-W03-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline';
export const W03_A00_TASK = W02_A09A_NEXT_TASK;
export const W02_A08R4_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision.json';
export const W02_A08R4_EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r4/POSTG_APP_W02_A08R4_THIRD_OPERATOR_REVIEW_EVIDENCE.json';
export const W02_A08R4_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08R4.claim.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const readJsonIfExists = (root, repoPath) => fs.existsSync(path.join(root, repoPath)) ? readJson(root, repoPath) : null;
const zeroFindings = (value) => Object.values(value ?? {}).every((count) => count === 0);

export function loadW02A08R4Approval({ root = process.cwd() } = {}) {
  const registries = loadSharedApplicationRegistries({ root });
  const authorityFreeze = fs.existsSync(path.join(root, W02_A09A_POLICY_PATH))
    ? buildW02A09AAuthorityFreezeReadback({ root })
    : null;
  return {
    root,
    decision: readJsonIfExists(root, W02_A08R4_DECISION_PATH),
    evidence: readJsonIfExists(root, W02_A08R4_EVIDENCE_PATH),
    claim: readJsonIfExists(root, W02_A08R4_CLAIM_PATH),
    registries,
    registryValidation: validateSharedApplicationRegistries(registries),
    productionAccess: resolveWaveApplicationAccess(registries, 'W02', 'PRODUCTION'),
    publicAccess: resolveWaveApplicationAccess(registries, 'W02', 'PUBLIC'),
    w03ShadowAccess: resolveWaveApplicationAccess(registries, 'W03', 'SHADOW'),
    authorityFreeze
  };
}

export function validateW02A08R4Approval(loaded) {
  const issues = [];
  const { decision, evidence, claim, registryValidation, productionAccess, publicAccess, w03ShadowAccess, authorityFreeze } = loaded;

  if (!decision
      || decision.operatorDecision !== 'APPROVE'
      || decision.reviewedArtifactAuthority?.headSha !== '544a642b8d40fc30edd082dd41ed8065e978ed6a'
      || decision.reviewedArtifactAuthority?.artifactId !== 8581273640
      || decision.reviewCoverage?.generatedItemCount !== 195
      || decision.reviewCoverage?.operationRoleContractCount !== 71
      || decision.reviewCoverage?.pdfPageCount !== 110
      || !zeroFindings(decision.blockingFindingCounts)
      || !Object.values(decision.operatorAcceptance ?? {}).every(Boolean)
      || decision.productionAdmission?.granted !== true
      || decision.productionAdmission?.evidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || decision.productionAdmission?.publicRouteChanged !== false
      || decision.productionAdmission?.publicSelectionEnabled !== false
      || decision.controllerTransition?.nextTaskId !== W03_A00_HISTORICAL_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R4_DECISION_INVALID', W02_A08R4_DECISION_PATH));
  }
  if (!evidence
      || evidence.status !== W02_A08R4_STATUS
      || evidence.operatorDecision !== 'APPROVE'
      || evidence.reviewCoverage?.generatedItemCount !== 195
      || evidence.reviewCoverage?.operationRoleContractCount !== 71
      || evidence.reviewCoverage?.pdfPageCount !== 110
      || !zeroFindings(evidence.blockingFindingCounts)
      || evidence.productionAdmission?.granted !== true
      || evidence.productionAdmission?.productionRuntimeAccessEnabled !== true
      || evidence.productionAdmission?.publicSelectionEnabled !== false
      || evidence.nextWaveActivation?.state !== 'ASSESSMENT_READY'
      || evidence.nextWaveActivation?.nextTaskId !== W03_A00_HISTORICAL_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R4_EVIDENCE_INVALID', W02_A08R4_EVIDENCE_PATH));
  }
  if (!claim
      || claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.claimedStatus !== W02_A08R4_STATUS
      || claim.claims?.productionAdmitted !== true
      || claim.claims?.humanReviewReady !== true
      || claim.claims?.d0Complete !== false
      || claim.humanReview?.decision !== 'APPROVE'
      || claim.nextStep?.taskId !== W03_A00_HISTORICAL_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R4_CLAIM_INVALID', W02_A08R4_CLAIM_PATH));
  }
  if (!authorityFreeze?.ok
      || authorityFreeze.w03ExecutionAllowed !== false
      || authorityFreeze.nextShortestStep !== W02_A09A_NEXT_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R4_A09A_SUCCESSOR_FREEZE_INVALID', W02_A09A_POLICY_PATH));
  }
  if (!registryValidation.ok) {
    issues.push(issue('POSTG_APP_W02_A08R4_SHARED_REGISTRY_INVALID', 'registries', { registryIssues: registryValidation.issues }));
  }
  if (!productionAccess.ok
      || productionAccess.provider?.productionAdmitted !== true
      || productionAccess.admission?.productionAdmitted !== true) {
    issues.push(issue('POSTG_APP_W02_A08R4_PRODUCTION_ACCESS_NOT_CONNECTED', 'W02.PRODUCTION'));
  }
  if (publicAccess.ok || publicAccess.errorCode !== 'POSTG_APP_SHARED_WAVE_PUBLIC_SELECTION_FORBIDDEN') {
    issues.push(issue('POSTG_APP_W02_A08R4_PUBLIC_ROUTE_PREMATURE', 'W02.PUBLIC'));
  }
  if (w03ShadowAccess.ok || w03ShadowAccess.errorCode !== 'POSTG_APP_SHARED_WAVE_SHADOW_PROJECTION_FORBIDDEN') {
    issues.push(issue('POSTG_APP_W02_A08R4_W03_FAIL_CLOSED_INVALID', 'W03.SHADOW'));
  }
  return {
    ok: issues.length === 0,
    issues,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: W02_A08R4_TASK,
    status: issues.length === 0 ? W02_A08R4_STATUS : 'W02_A08R4_APPROVAL_BLOCKED',
    operatorDecision: decision?.operatorDecision ?? null,
    evidenceLevel: claim?.actualEvidenceLevel ?? null,
    counts: {
      generatedItemCount: evidence?.reviewCoverage?.generatedItemCount ?? 0,
      numericQuestionCount: evidence?.reviewCoverage?.numericQuestionCount ?? 0,
      applicationQuestionCount: evidence?.reviewCoverage?.applicationQuestionCount ?? 0,
      pblTaskSetCount: evidence?.reviewCoverage?.pblTaskSetCount ?? 0,
      operationRoleContractCount: evidence?.reviewCoverage?.operationRoleContractCount ?? 0,
      pdfPageCount: evidence?.reviewCoverage?.pdfPageCount ?? 0
    },
    productionAdmissionGranted: issues.length === 0,
    publicRouteChanged: false,
    publicSelectable: false,
    activatedWaveId: issues.length === 0 ? 'W03' : null,
    w03ExecutionFrozen: issues.length === 0,
    nextShortestStep: issues.length === 0 ? W02_A09A_NEXT_TASK : W02_A08R4_TASK
  };
}

export function buildW02A08R4ApprovalReadback(options = {}) {
  return validateW02A08R4Approval(loadW02A08R4Approval(options));
}
