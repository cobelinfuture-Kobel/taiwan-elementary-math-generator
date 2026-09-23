import fs from 'node:fs';
import path from 'node:path';

const DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';
const CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08.claim.json';
const A07_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A07.claim.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const stableHashRows = (rows) => [...(rows ?? [])]
  .map((row) => ({ path: row.path, sha256: row.sha256 }))
  .sort((left, right) => left.path.localeCompare(right.path));

function findingSummary(decision) {
  const byCode = new Map((decision.blockingFindings ?? []).map((row) => [row.code, row]));
  const count = (code) => byCode.get(code)?.affectedCount ?? null;
  const reviewed = (code) => byCode.get(code)?.reviewedCount ?? null;
  return {
    application: {
      reviewedCount: reviewed('W02_A08_APPLICATION_RAW_SLOT_LABEL_LEAKAGE'),
      rawSlotLeakageCount: count('W02_A08_APPLICATION_RAW_SLOT_LABEL_LEAKAGE'),
      malformedSurfaceCount: count('W02_A08_APPLICATION_SURFACE_TEMPLATE_MALFORMED')
    },
    numeric: {
      reviewedCount: reviewed('W02_A08_NUMERIC_INTERNAL_ROLE_LABEL_LEAKAGE'),
      rawSlotLeakageCount: count('W02_A08_NUMERIC_INTERNAL_ROLE_LABEL_LEAKAGE')
    },
    pbl: {
      reviewedCount: reviewed('W02_A08_PBL_NOT_FULLY_INSTANTIATED'),
      dependencyGraphMissingCount: count('W02_A08_PBL_DEPENDENCY_READBACK_NOT_MATERIALIZED'),
      notFullyInstantiatedCount: count('W02_A08_PBL_NOT_FULLY_INSTANTIATED'),
      internalTokenLeakageCount: count('W02_A08_PBL_INTERNAL_TOKEN_LEAKAGE')
    }
  };
}

export function materializeW02A08OperatorReviewDecision({ root = process.cwd() } = {}) {
  const decision = readJson(root, DECISION_PATH);
  const claim = readJson(root, CLAIM_PATH);
  const a07Claim = readJson(root, A07_CLAIM_PATH);
  const findings = findingSummary(decision);
  return { root, decision, claim, a07Claim, findings };
}

export function validateW02A08OperatorReviewDecision(materialized) {
  const issues = [];
  const { decision, claim, a07Claim, findings } = materialized;

  if (decision.schemaName !== 'POSTGAPPW02A08OperatorHumanReviewDecisionV1'
      || decision.taskId !== 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission'
      || decision.operatorDecision !== 'REVISE'
      || decision.decisionSource !== 'ASSISTED_REVIEW_UNDER_OPERATOR_CONTINUE_AUTHORIZATION') {
    issues.push(issue('POSTG_APP_W02_A08_OPERATOR_DECISION_INVALID', DECISION_PATH));
  }

  const expectedAcceptance = {
    applicationSemanticNaturalnessAccepted: false,
    quantityRoleBindingAccepted: false,
    unitBindingAccepted: false,
    mathematicalWitnessPreservationAccepted: true,
    answerUniquenessAndPairingAccepted: true,
    pblDependencyStructureAccepted: true,
    pblStudentFacingInstantiationAccepted: false,
    numericApplicationModeSeparationAccepted: true,
    htmlPdfLayoutAndContainmentAccepted: true,
    forbiddenInternalLabelAbsenceAccepted: false
  };
  if (JSON.stringify(decision.operatorAcceptance ?? {}) !== JSON.stringify(expectedAcceptance)) {
    issues.push(issue('POSTG_APP_W02_A08_ACCEPTANCE_MATRIX_INVALID', `${DECISION_PATH}.operatorAcceptance`));
  }

  const expectedFindings = {
    application: { reviewedCount: 61, rawSlotLeakageCount: 61, malformedSurfaceCount: 61 },
    numeric: { reviewedCount: 49, rawSlotLeakageCount: 48 },
    pbl: { reviewedCount: 31, dependencyGraphMissingCount: 31, notFullyInstantiatedCount: 31, internalTokenLeakageCount: 31 }
  };
  if (JSON.stringify(findings) !== JSON.stringify(expectedFindings)) {
    issues.push(issue('POSTG_APP_W02_A08_REVIEW_FINDING_COUNT_MISMATCH', `${DECISION_PATH}.blockingFindings`, {
      expected: expectedFindings,
      actual: findings
    }));
  }

  const findingByCode = new Map((decision.blockingFindings ?? []).map((row) => [row.code, row]));
  const expectedDecisionCounts = {
    W02_A08_APPLICATION_RAW_SLOT_LABEL_LEAKAGE: [61, 61],
    W02_A08_APPLICATION_SURFACE_TEMPLATE_MALFORMED: [61, 61],
    W02_A08_NUMERIC_INTERNAL_ROLE_LABEL_LEAKAGE: [48, 49],
    W02_A08_PBL_NOT_FULLY_INSTANTIATED: [31, 31],
    W02_A08_PBL_INTERNAL_TOKEN_LEAKAGE: [31, 31],
    W02_A08_PBL_DEPENDENCY_READBACK_NOT_MATERIALIZED: [31, 31]
  };
  for (const [code, [affectedCount, reviewedCount]] of Object.entries(expectedDecisionCounts)) {
    const row = findingByCode.get(code);
    if (!row || row.severity !== 'BLOCKING' || row.affectedCount !== affectedCount || row.reviewedCount !== reviewedCount) {
      issues.push(issue('POSTG_APP_W02_A08_BLOCKING_FINDING_INVALID', `${DECISION_PATH}.blockingFindings`, { code }));
    }
  }

  const a07Hashes = stableHashRows(a07Claim.evidence?.artifactHashes);
  const decisionHashes = stableHashRows(decision.reviewedArtifactHashes);
  if (a07Claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || a07Claim.claimedStatus !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
      || a07Claim.claims?.humanReviewReady !== true
      || a07Claim.claims?.productionAdmitted !== false
      || a07Claim.evidenceRun?.reviewArtifactCount !== 10
      || a07Hashes.length !== 10
      || JSON.stringify(decisionHashes) !== JSON.stringify(a07Hashes)) {
    issues.push(issue('POSTG_APP_W02_A08_FROZEN_A07_EVIDENCE_MISMATCH', A07_CLAIM_PATH, {
      expected: a07Hashes,
      actual: decisionHashes
    }));
  }

  const reviewed = decision.reviewedArtifact ?? {};
  if (reviewed.sourceNodeCount !== 13
      || reviewed.applicationQuestionCount !== 61
      || reviewed.numericQuestionCount !== 134
      || reviewed.numericBoundaryReviewCount !== 49
      || reviewed.pblTaskSetCount !== 31
      || reviewed.macroContextCount !== 16
      || reviewed.reviewArtifactCount !== 10) {
    issues.push(issue('POSTG_APP_W02_A08_REVIEW_COVERAGE_INVALID', `${DECISION_PATH}.reviewedArtifact`));
  }

  const admission = decision.productionAdmission ?? {};
  if (admission.granted !== false
      || admission.evidenceLevel !== 'E4_OPERATOR_REVIEW_REVISE_REQUIRED'
      || admission.waveId !== 'W02'
      || admission.publicRouteChanged !== false
      || admission.publicSelectionEnabled !== false
      || admission.authorizedUse !== 'REVIEW_AND_REMEDIATION_ONLY') {
    issues.push(issue('POSTG_APP_W02_A08_PRODUCTION_ADMISSION_FAIL_CLOSED_INVALID', `${DECISION_PATH}.productionAdmission`));
  }

  if (decision.remediation?.required !== true
      || decision.remediation?.taskId !== 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview'
      || decision.controllerTransition?.reviewDecision !== 'REVISE'
      || decision.controllerTransition?.productionAdmissionGranted !== false
      || decision.controllerTransition?.nextTaskId !== decision.remediation.taskId) {
    issues.push(issue('POSTG_APP_W02_A08_REMEDIATION_TRANSITION_INVALID', `${DECISION_PATH}.remediation`));
  }

  const claimPipelineReady = claim.claims?.dataStructureReady === true
    && claim.claims?.contentAuthored === true
    && claim.claims?.runtimeIntegrated === true
    && claim.claims?.productionEquivalentGeneratorUsed === true
    && claim.claims?.productionRendererUsed === true
    && claim.claims?.htmlOutputVerified === true
    && claim.claims?.pdfOutputVerified === true
    && claim.claims?.visibleOutputChanged === true
    && claim.claims?.humanReviewReady === true;
  if (claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || claim.targetEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.claimedStatus !== 'W02_OPERATOR_REVIEW_REVISE_REQUIRED'
      || !claimPipelineReady
      || claim.claims?.humanReviewCompleted !== true
      || claim.claims?.operatorDecisionRecorded !== true
      || claim.claims?.operatorDecision !== 'REVISE'
      || claim.claims?.productionAdmitted !== false
      || claim.claims?.publicSelectable !== false
      || claim.claims?.d0Complete !== false
      || claim.humanReview?.type !== 'production_equivalent_output_review'
      || claim.humanReview?.decision !== 'REVISE'
      || claim.nextStep?.taskId !== decision.remediation.taskId
      || claim.nextStep?.requiredEvidenceLevelBeforeStart !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED') {
    issues.push(issue('POSTG_APP_W02_A08_CLAIM_INVALID', CLAIM_PATH));
  }

  const boundaries = decision.failClosedBoundaries ?? {};
  if (boundaries.automaticApprovalAllowed !== false
      || boundaries.reviewDecisionMayBeUpgradedWithoutNewArtifacts !== false
      || boundaries.productionAdmissionGranted !== false
      || boundaries.publicSelectable !== false
      || boundaries.publicRouteChanged !== false
      || boundaries.w03ToW06Unblocked !== false
      || boundaries.programD0Complete !== false) {
    issues.push(issue('POSTG_APP_W02_A08_FAIL_CLOSED_BOUNDARY_INVALID', `${DECISION_PATH}.failClosedBoundaries`));
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'PASS_POSTG_APP_W02_A08_OPERATOR_REVIEW_REVISE_RECORDED'
      : 'FAIL_POSTG_APP_W02_A08_OPERATOR_REVIEW_DECISION',
    decision: decision.operatorDecision,
    productionAdmissionGranted: admission.granted,
    findings,
    artifactHashCount: decisionHashes.length,
    nextShortestStep: decision.remediation?.taskId ?? null
  };
}

export function buildW02A08OperatorReviewReadback({ root = process.cwd() } = {}) {
  return validateW02A08OperatorReviewDecision(materializeW02A08OperatorReviewDecision({ root }));
}
