import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';
const CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08.claim.json';
const REVIEW_DATA_PATH = 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_DATA.json';
const REVIEW_MANIFEST_PATH = 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const sha256File = (root, repoPath) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, repoPath))).digest('hex');

function internalRoleIdentifiers(prompt) {
  return [...String(prompt).matchAll(/([A-Za-z][A-Za-z0-9_]*)為/g)].map((match) => match[1]);
}

function analyzeApplicationRows(rows) {
  return {
    reviewedCount: rows.length,
    rawSlotLeakageCount: rows.filter((row) => internalRoleIdentifiers(row.promptText).length > 0).length,
    malformedSurfaceCount: rows.filter((row) => /^在[^。]+為了/.test(String(row.promptText))).length,
    genericContextPrefixCount: rows.filter((row) => String(row.promptText).includes('情境中')).length
  };
}

function analyzeNumericRows(rows) {
  return {
    reviewedCount: rows.length,
    rawSlotLeakageCount: rows.filter((row) => internalRoleIdentifiers(row.promptText).length > 0).length
  };
}

function analyzePblRows(rows) {
  return {
    reviewedCount: rows.length,
    dependencyGraphMissingCount: rows.filter((row) => row.dependencyGraph == null).length,
    authenticityNotVerifiedCount: rows.filter((row) => row.record?.drivingProblem?.authenticityExecutionVerified === false).length,
    notFullyInstantiatedCount: rows.filter((row) => row.record?.tasks?.some((task) => task.fullyInstantiated === false)).length,
    internalOperationIdLeakageCount: rows.filter((row) => row.record?.drivingProblem?.successCriteria?.some((text) => String(text).includes('op_'))).length,
    internalFinalProductTokenLeakageCount: rows.filter((row) => {
      const token = row.record?.drivingProblem?.finalProductType;
      return Boolean(token && String(row.record?.drivingProblem?.problemStatementZh).includes(token));
    }).length
  };
}

export function materializeW02A08OperatorReviewDecision({ root = process.cwd() } = {}) {
  const decision = readJson(root, DECISION_PATH);
  const claim = readJson(root, CLAIM_PATH);
  const reviewData = readJson(root, REVIEW_DATA_PATH);
  const reviewManifest = readJson(root, REVIEW_MANIFEST_PATH);
  const actualArtifactHashes = decision.reviewedArtifactHashes.map((row) => ({
    path: row.path,
    expectedSha256: row.sha256,
    actualSha256: sha256File(root, row.path)
  }));
  const findings = {
    application: analyzeApplicationRows(reviewData.applicationReviewRows ?? []),
    numeric: analyzeNumericRows(reviewData.numericBoundaryReviewRows ?? []),
    pbl: analyzePblRows(reviewData.pblReviewRows ?? [])
  };
  return { root, decision, claim, reviewData, reviewManifest, actualArtifactHashes, findings };
}

export function validateW02A08OperatorReviewDecision(materialized) {
  const issues = [];
  const { decision, claim, reviewData, reviewManifest, actualArtifactHashes, findings } = materialized;

  if (decision.schemaName !== 'POSTGAPPW02A08OperatorHumanReviewDecisionV1'
      || decision.taskId !== 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission'
      || decision.operatorDecision !== 'REVISE'
      || decision.decisionSource !== 'ASSISTED_REVIEW_UNDER_OPERATOR_CONTINUE_AUTHORIZATION') {
    issues.push(issue('POSTG_APP_W02_A08_OPERATOR_DECISION_INVALID', DECISION_PATH));
  }

  const acceptance = decision.operatorAcceptance ?? {};
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
  if (JSON.stringify(acceptance) !== JSON.stringify(expectedAcceptance)) {
    issues.push(issue('POSTG_APP_W02_A08_ACCEPTANCE_MATRIX_INVALID', `${DECISION_PATH}.operatorAcceptance`));
  }

  const expectedFindings = {
    application: {
      reviewedCount: 61,
      rawSlotLeakageCount: 61,
      malformedSurfaceCount: 61,
      genericContextPrefixCount: 61
    },
    numeric: {
      reviewedCount: 49,
      rawSlotLeakageCount: 48
    },
    pbl: {
      reviewedCount: 31,
      dependencyGraphMissingCount: 31,
      authenticityNotVerifiedCount: 31,
      notFullyInstantiatedCount: 31,
      internalOperationIdLeakageCount: 31,
      internalFinalProductTokenLeakageCount: 31
    }
  };
  if (JSON.stringify(findings) !== JSON.stringify(expectedFindings)) {
    issues.push(issue('POSTG_APP_W02_A08_REVIEW_FINDING_COUNT_MISMATCH', REVIEW_DATA_PATH, {
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

  for (const row of actualArtifactHashes) {
    if (row.actualSha256 !== row.expectedSha256) {
      issues.push(issue('POSTG_APP_W02_A08_REVIEW_ARTIFACT_HASH_MISMATCH', row.path, {
        expected: row.expectedSha256,
        actual: row.actualSha256
      }));
    }
  }

  if (reviewData.summary?.applicationReviewCount !== 61
      || reviewData.summary?.numericBoundaryReviewCount !== 49
      || reviewData.summary?.pblReviewCount !== 31
      || reviewData.summary?.macroContextCount !== 16
      || reviewManifest.status !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
      || reviewManifest.humanReviewReady !== true
      || reviewManifest.reviewDecision !== 'NOT_STARTED'
      || reviewManifest.productionAdmissionGranted !== false) {
    issues.push(issue('POSTG_APP_W02_A08_REVIEW_EVIDENCE_INVALID', REVIEW_MANIFEST_PATH));
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

  if (claim.actualEvidenceLevel !== 'E4_OPERATOR_REVIEW_REVISE_REQUIRED'
      || claim.claimedStatus !== 'W02_OPERATOR_REVIEW_REVISE_REQUIRED'
      || claim.claims?.humanReviewCompleted !== true
      || claim.claims?.operatorDecisionRecorded !== true
      || claim.claims?.operatorDecision !== 'REVISE'
      || claim.claims?.productionAdmitted !== false
      || claim.claims?.publicSelectable !== false
      || claim.claims?.d0Complete !== false
      || claim.nextStep?.taskId !== decision.remediation.taskId) {
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
    artifactHashCount: actualArtifactHashes.length,
    nextShortestStep: decision.remediation?.taskId ?? null
  };
}

export function buildW02A08OperatorReviewReadback({ root = process.cwd() } = {}) {
  return validateW02A08OperatorReviewDecision(materializeW02A08OperatorReviewDecision({ root }));
}
