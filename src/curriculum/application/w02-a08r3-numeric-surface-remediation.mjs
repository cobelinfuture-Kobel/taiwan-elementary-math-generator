import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW02A06ProductionEquivalentPackage,
  validateW02A06ProductionEquivalentPackage
} from './shared/production-equivalent-html-pdf-runtime.mjs';
import {
  auditNumericStudentFacingSurfaceV4,
  validateStudentFacingOperationSurface,
  W02_A08R3_NUMERIC_SEMANTIC_REVISION,
  W02_A08R3_NUMERIC_SURFACE_VERSION
} from './shared/student-facing-numeric-remediation-v4.mjs';
import { buildW02A08R2SecondOperatorReviewReadback } from './w02-a08r2-second-operator-review-decision.mjs';

export const W02_A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';
export const W02_A08R3_STATUS = 'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY';
export const W02_A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';
export const W02_A08R2_EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r2/POSTG_APP_W02_A08R2_SECOND_REVIEW_EVIDENCE.json';
export const W02_A08R3_READBACK_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R3_NumericSurfaceRemediationReadback.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const stable = (value) => JSON.stringify(value);

function historicalAffectedIds(evidence) {
  return [...new Set((evidence.blockingFindings ?? []).flatMap((row) => row.generatedItemIds ?? []))].sort();
}

export function materializeW02A08R3NumericRemediation({ root = process.cwd() } = {}) {
  const priorReview = buildW02A08R2SecondOperatorReviewReadback({ root });
  const priorEvidence = readJson(root, W02_A08R2_EVIDENCE_PATH);
  const a06Package = materializeW02A06ProductionEquivalentPackage({ root });
  const a06Validation = validateW02A06ProductionEquivalentPackage(a06Package);
  const audit = auditNumericStudentFacingSurfaceV4({ specs: a06Package.specs, items: a06Package.generatedItems });
  const specByPattern = new Map(a06Package.specs.map((spec) => [spec.patternSpecId, spec]));
  const itemById = new Map(a06Package.generatedItems.map((item) => [item.generatedItemId, item]));
  const affectedIds = historicalAffectedIds(priorEvidence);
  const historicalFindingReadback = affectedIds.map((generatedItemId) => {
    const item = itemById.get(generatedItemId) ?? null;
    const spec = item ? specByPattern.get(item.patternSpecId) : null;
    const validation = item && spec ? validateStudentFacingOperationSurface({ spec, item }) : { ok: false, issues: [{ code: 'ITEM_NOT_FOUND' }] };
    return Object.freeze({
      generatedItemId,
      ordinal: item?.ordinal ?? null,
      patternSpecId: item?.patternSpecId ?? null,
      prompt: item?.prompt ?? null,
      answerText: item?.answerText ?? null,
      givenRoleNames: item ? Object.keys(item.givenRoleValues ?? {}).sort() : [],
      ok: validation.ok,
      issues: validation.issues
    });
  });
  return {
    root,
    priorReview,
    priorEvidence,
    a06Package,
    a06Validation,
    audit,
    historicalFindingReadback
  };
}

export function validateW02A08R3NumericRemediation(materialized) {
  const issues = [];
  const { priorReview, priorEvidence, a06Package, a06Validation, audit, historicalFindingReadback } = materialized;

  if (!priorReview.ok || priorReview.decision !== 'REVISE' || priorReview.productionAdmissionGranted !== false) {
    issues.push(issue('POSTG_APP_W02_A08R3_PRIOR_REVISE_DECISION_INVALID', 'A08R2'));
  }
  if (priorEvidence.status !== 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED'
      || priorEvidence.reviewDecision !== 'REVISE'
      || priorEvidence.blockingFindings?.length !== 4) {
    issues.push(issue('POSTG_APP_W02_A08R3_PRIOR_FINDING_AUTHORITY_INVALID', W02_A08R2_EVIDENCE_PATH));
  }
  if (!a06Validation.ok) {
    issues.push(issue('POSTG_APP_W02_A08R3_A06_RUNTIME_INVALID', 'A06', { issues: a06Validation.issues }));
  }

  const expectedZero = {
    unresolvedRequestedUnknown: 0,
    answerEquivalentOrNonMinimalGivenSet: 0,
    malformedOrIncoherentSurface: 0,
    gradeUnsafeNotation: 0
  };
  if (audit.reviewedCount !== 134 || stable(audit.counts) !== stable(expectedZero)) {
    issues.push(issue('POSTG_APP_W02_A08R3_NUMERIC_AUDIT_FAILED', 'audit', { expected: expectedZero, actual: audit }));
  }
  if (historicalFindingReadback.length !== 45
      || historicalFindingReadback.some((row) => !row.ok || !row.prompt || !row.answerText)) {
    issues.push(issue('POSTG_APP_W02_A08R3_HISTORICAL_FINDINGS_NOT_REMEDIATED', 'historicalFindingReadback', {
      failed: historicalFindingReadback.filter((row) => !row.ok)
    }));
  }

  if (a06Package.numericItems.length !== 134
      || a06Package.applicationItems.length !== 61
      || a06Package.pblTaskSetRecords.length !== 31
      || new Set(a06Package.generatedItems.map((item) => item.operationFamilyId)).size !== 49) {
    issues.push(issue('POSTG_APP_W02_A08R3_COHORT_DRIFT', 'A06'));
  }
  if (a06Package.numericItems.some((item) => item.studentFacingSurfaceVersion !== W02_A08R3_NUMERIC_SURFACE_VERSION
      || item.studentFacingSemanticRevision !== W02_A08R3_NUMERIC_SEMANTIC_REVISION)) {
    issues.push(issue('POSTG_APP_W02_A08R3_NUMERIC_VERSION_INVALID', 'numericItems'));
  }
  if (a06Package.applicationItems.some((item) => item.studentFacingSurfaceVersion !== 'W02_A08R1_V1'
      || item.studentFacingSemanticRevision !== 3)
      || a06Package.pblTaskSetRecords.some((record) => record.studentFacingInstantiationVersion !== 'W02_A08R1_V1'
        || record.studentFacingSemanticRevision !== 3)) {
    issues.push(issue('POSTG_APP_W02_A08R3_NON_NUMERIC_SURFACE_DRIFT', 'applicationOrPbl'));
  }
  if (a06Package.generatedItems.some((item) => item.productionSelectable || item.publicSelectable)
      || a06Package.projection.access.w02.provider.productionAdmitted
      || a06Package.projection.access.w02.provider.publicSelectable) {
    issues.push(issue('POSTG_APP_W02_A08R3_PREMATURE_ADMISSION', 'boundaries'));
  }

  return {
    ok: issues.length === 0,
    issues,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: W02_A08R3_TASK,
    status: issues.length === 0 ? W02_A08R3_STATUS : 'W02_A08R3_NUMERIC_SURFACE_REMEDIATION_BLOCKED',
    counts: {
      generatedItemCount: a06Package.generatedItems.length,
      numericQuestionCount: a06Package.numericItems.length,
      applicationQuestionCount: a06Package.applicationItems.length,
      pblTaskSetCount: a06Package.pblTaskSetRecords.length,
      operationFamilyCount: new Set(a06Package.generatedItems.map((item) => item.operationFamilyId)).size,
      historicalAffectedItemCount: historicalFindingReadback.length
    },
    audit,
    studentFacingVersions: {
      numeric: W02_A08R3_NUMERIC_SURFACE_VERSION,
      numericSemanticRevision: W02_A08R3_NUMERIC_SEMANTIC_REVISION,
      application: 'W02_A08R1_V1',
      applicationSemanticRevision: 3,
      pbl: 'W02_A08R1_V1',
      pblSemanticRevision: 3
    },
    productionAdmissionGranted: false,
    publicSelectable: false,
    thirdOperatorReviewReady: issues.length === 0,
    nextShortestStep: W02_A08R4_TASK,
    historicalFindingReadback
  };
}

export function buildW02A08R3NumericRemediationReadback(options = {}) {
  return validateW02A08R3NumericRemediation(materializeW02A08R3NumericRemediation(options));
}

export function loadW02A08R3ReadbackSnapshot({ root = process.cwd() } = {}) {
  return readJson(root, W02_A08R3_READBACK_PATH);
}
