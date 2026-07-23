import {
  materializeW02A06ProductionEquivalentPackage,
  validateW02A06ProductionEquivalentPackage
} from './shared/production-equivalent-html-pdf-runtime.mjs';
import {
  materializeW02A07HumanReviewPackage,
  validateW02A07HumanReviewPackage
} from './w02-a07-human-review-package.mjs';
import { buildW02A08OperatorReviewReadback } from './w02-a08-operator-review-decision.mjs';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const internalRolePattern = /([A-Za-z][A-Za-z0-9_]*)為/;
const internalIdPattern = /\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i;
const internalTokenPattern = /[A-Z]{2,}(?:_[A-Z]+)+/;

function applicationAudit(rows) {
  return {
    reviewedCount: rows.length,
    rawRoleLeakageCount: rows.filter((row) => internalRolePattern.test(String(row.promptText))).length,
    internalIdLeakageCount: rows.filter((row) => internalIdPattern.test(String(row.promptText))).length,
    internalTokenLeakageCount: rows.filter((row) => internalTokenPattern.test(`${row.promptText} ${row.answerText}`)).length,
    malformedSurfaceCount: rows.filter((row) => /^在[^。]+為了/.test(String(row.promptText))
      || String(row.promptText).includes('情境中')
      || String(row.promptText).includes('{{')).length,
    missingAnswerCount: rows.filter((row) => row.answerText == null || String(row.answerText).trim() === '').length
  };
}

function numericAudit(rows) {
  return {
    reviewedCount: rows.length,
    rawRoleLeakageCount: rows.filter((row) => internalRolePattern.test(String(row.promptText))).length,
    internalIdLeakageCount: rows.filter((row) => internalIdPattern.test(String(row.promptText))).length,
    internalTokenLeakageCount: rows.filter((row) => internalTokenPattern.test(`${row.promptText} ${row.answerText}`)).length,
    malformedSurfaceCount: rows.filter((row) => String(row.promptText).includes('{{') || String(row.promptText).includes('情境中')).length
  };
}

function pblVisibleText(row) {
  const record = row.record ?? row;
  return [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
}

function pblAudit(rows) {
  return {
    reviewedCount: rows.length,
    dependencyGraphMissingCount: rows.filter((row) => !Array.isArray(row.dependencyGraph) || row.dependencyGraph.length === 0).length,
    authenticityNotVerifiedCount: rows.filter((row) => row.record?.drivingProblem?.authenticityExecutionVerified !== true).length,
    notFullyInstantiatedCount: rows.filter((row) => row.record?.tasks?.some((task) => task.fullyInstantiated !== true)).length,
    finalDecisionIncompleteCount: rows.filter((row) => row.record?.finalProduct?.executed !== true || row.finalDecisionRequired !== true).length,
    internalIdLeakageCount: rows.filter((row) => internalIdPattern.test(pblVisibleText(row))).length,
    internalTokenLeakageCount: rows.filter((row) => internalTokenPattern.test(pblVisibleText(row))).length,
    malformedSurfaceCount: rows.filter((row) => pblVisibleText(row).includes('在在') || pblVisibleText(row).includes('{{')).length
  };
}

export function materializeW02A08R1Remediation({ root = process.cwd() } = {}) {
  const priorDecision = buildW02A08OperatorReviewReadback({ root });
  const a06Package = materializeW02A06ProductionEquivalentPackage({ root });
  const a06Validation = validateW02A06ProductionEquivalentPackage(a06Package);
  const reviewModel = materializeW02A07HumanReviewPackage({ root, a06Package });
  const reviewValidation = validateW02A07HumanReviewPackage(reviewModel);
  const audit = {
    application: applicationAudit(reviewModel.applicationReviewRows),
    numeric: numericAudit(reviewModel.numericBoundaryReviewRows),
    pbl: pblAudit(reviewModel.pblReviewRows)
  };
  return { root, priorDecision, a06Package, a06Validation, reviewModel, reviewValidation, audit };
}

export function validateW02A08R1Remediation(materialized) {
  const issues = [];
  const { priorDecision, a06Package, a06Validation, reviewModel, reviewValidation, audit } = materialized;
  if (!priorDecision.ok || priorDecision.decision !== 'REVISE' || priorDecision.productionAdmissionGranted !== false) {
    issues.push(issue('POSTG_APP_W02_A08R1_PRIOR_REVISE_DECISION_INVALID', 'A08'));
  }
  if (!a06Validation.ok) issues.push(issue('POSTG_APP_W02_A08R1_A06_RUNTIME_INVALID', 'A06', { issues: a06Validation.issues }));
  if (!reviewValidation.ok) issues.push(issue('POSTG_APP_W02_A08R1_A07_REVIEW_PACKAGE_INVALID', 'A07', { issues: reviewValidation.issues }));

  const expectedAudit = {
    application: {
      reviewedCount: 61,
      rawRoleLeakageCount: 0,
      internalIdLeakageCount: 0,
      internalTokenLeakageCount: 0,
      malformedSurfaceCount: 0,
      missingAnswerCount: 0
    },
    numeric: {
      reviewedCount: 49,
      rawRoleLeakageCount: 0,
      internalIdLeakageCount: 0,
      internalTokenLeakageCount: 0,
      malformedSurfaceCount: 0
    },
    pbl: {
      reviewedCount: 31,
      dependencyGraphMissingCount: 0,
      authenticityNotVerifiedCount: 0,
      notFullyInstantiatedCount: 0,
      finalDecisionIncompleteCount: 0,
      internalIdLeakageCount: 0,
      internalTokenLeakageCount: 0,
      malformedSurfaceCount: 0
    }
  };
  if (JSON.stringify(audit) !== JSON.stringify(expectedAudit)) {
    issues.push(issue('POSTG_APP_W02_A08R1_SEMANTIC_AUDIT_FAILED', 'audit', { expected: expectedAudit, actual: audit }));
  }

  if (a06Package.generatedItems.some((item) => item.studentFacingSurfaceVersion !== 'W02_A08R1_V1')) {
    issues.push(issue('POSTG_APP_W02_A08R1_SURFACE_VERSION_INVALID', 'generatedItems'));
  }
  if (a06Package.pblTaskSetRecords.some((row) => row.studentFacingInstantiationVersion !== 'W02_A08R1_V1')) {
    issues.push(issue('POSTG_APP_W02_A08R1_PBL_VERSION_INVALID', 'pblTaskSetRecords'));
  }
  if (a06Package.generatedItems.some((item) => item.productionSelectable || item.publicSelectable)
      || reviewModel.boundaries.productionAdmissionGranted
      || reviewModel.boundaries.publicSelectable) {
    issues.push(issue('POSTG_APP_W02_A08R1_PREMATURE_ADMISSION', 'boundaries'));
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'W02_A08R1_STUDENT_FACING_SEMANTIC_SURFACE_PBL_REVIEW_READY'
      : 'W02_A08R1_REMEDIATION_BLOCKED',
    counts: {
      generatedItemCount: a06Package.generatedItems.length,
      applicationReviewCount: reviewModel.applicationReviewRows.length,
      numericBoundaryReviewCount: reviewModel.numericBoundaryReviewRows.length,
      pblReviewCount: reviewModel.pblReviewRows.length,
      operationFamilyCount: new Set(a06Package.generatedItems.map((item) => item.operationFamilyId)).size
    },
    audit,
    productionAdmissionGranted: false,
    nextShortestStep: 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision'
  };
}

export function buildW02A08R1Readback({ root = process.cwd() } = {}) {
  return validateW02A08R1Remediation(materializeW02A08R1Remediation({ root }));
}
