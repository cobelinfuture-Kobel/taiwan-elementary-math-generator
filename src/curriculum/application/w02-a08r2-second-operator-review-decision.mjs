import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  W02_A08R2_CLAIM_PATH,
  W02_A08R2_DECISION_PATH,
  W02_A08R2_EVIDENCE_PATH,
  W02_A08R2_STATUS,
  W02_A08R3_TASK
} from './w02-a08r2-controller-overlay.mjs';

const PACKAGE_PATH = 'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json';
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const readJson = (root, repoPath) => JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
const sha256File = (root, repoPath) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, repoPath))).digest('hex');
const stable = (value) => JSON.stringify(value);

export function materializeW02A08R2SecondOperatorReview({ root = process.cwd(), verifyRegeneratedArtifacts = false } = {}) {
  const evidence = readJson(root, W02_A08R2_EVIDENCE_PATH);
  const decision = readJson(root, W02_A08R2_DECISION_PATH);
  const claim = readJson(root, W02_A08R2_CLAIM_PATH);
  const artifactVerification = verifyRegeneratedArtifacts
    ? evidence.artifacts.map((row) => ({
        ...row,
        exists: fs.existsSync(path.join(root, row.path)),
        actualSha256: fs.existsSync(path.join(root, row.path)) ? sha256File(root, row.path) : null,
        actualSizeBytes: fs.existsSync(path.join(root, row.path)) ? fs.statSync(path.join(root, row.path)).size : null
      }))
    : [];
  const regeneratedPackage = verifyRegeneratedArtifacts ? readJson(root, PACKAGE_PATH) : null;
  return { root, evidence, decision, claim, verifyRegeneratedArtifacts, artifactVerification, regeneratedPackage };
}

export function validateW02A08R2SecondOperatorReview(materialized) {
  const issues = [];
  const { evidence, decision, claim, verifyRegeneratedArtifacts, artifactVerification, regeneratedPackage } = materialized;
  const expectedCounts = new Map([
    ['W02_A08R2_NUMERIC_UNRESOLVED_REQUESTED_ROLE_SURFACE', 13],
    ['W02_A08R2_NUMERIC_ANSWER_EQUIVALENT_GIVEN_LEAKAGE', 19],
    ['W02_A08R2_NUMERIC_MALFORMED_OR_INCOHERENT_SURFACE', 12],
    ['W02_A08R2_NUMERIC_GRADE_UNSAFE_NOTATION', 2]
  ]);

  if (evidence.schemaName !== 'POSTGAPPW02A08R2SecondOperatorReviewEvidenceV1'
      || evidence.status !== W02_A08R2_STATUS
      || evidence.reviewDecision !== 'REVISE'
      || evidence.artifacts?.length !== 6
      || evidence.reviewCoverage?.generatedItemCount !== 195
      || evidence.reviewCoverage?.numericQuestionCount !== 134
      || evidence.reviewCoverage?.applicationQuestionCount !== 61
      || evidence.reviewCoverage?.pblTaskSetCount !== 31
      || evidence.reviewCoverage?.pdfPageCount !== 110
      || evidence.nextShortestStep !== W02_A08R3_TASK) {
    issues.push(issue('POSTG_APP_W02_A08R2_EVIDENCE_IDENTITY_INVALID', W02_A08R2_EVIDENCE_PATH));
  }

  const findingCodes = (evidence.blockingFindings ?? []).map((row) => row.code);
  if (findingCodes.length !== expectedCounts.size || new Set(findingCodes).size !== expectedCounts.size) {
    issues.push(issue('POSTG_APP_W02_A08R2_FINDING_SET_INVALID', `${W02_A08R2_EVIDENCE_PATH}.blockingFindings`));
  }
  for (const finding of evidence.blockingFindings ?? []) {
    const expected = expectedCounts.get(finding.code);
    if (expected == null || finding.severity !== 'BLOCKING' || finding.reviewedCount !== 134
        || finding.affectedCount !== expected || finding.itemOrdinals?.length !== expected
        || finding.generatedItemIds?.length !== expected
        || new Set(finding.itemOrdinals).size !== expected
        || new Set(finding.generatedItemIds).size !== expected) {
      issues.push(issue('POSTG_APP_W02_A08R2_FINDING_COUNT_OR_IDENTITY_INVALID', `${W02_A08R2_EVIDENCE_PATH}.${finding.code}`));
    }
  }

  if (decision.schemaName !== 'POSTGAPPW02A08R2RegeneratedHTMLPDFSecondOperatorReviewDecisionV1'
      || decision.operatorDecision !== 'REVISE'
      || decision.reviewEvidencePath !== W02_A08R2_EVIDENCE_PATH
      || decision.productionAdmission?.granted !== false
      || decision.productionAdmission?.publicSelectionEnabled !== false
      || decision.remediation?.taskId !== W02_A08R3_TASK
      || decision.controllerTransition?.waveState !== W02_A08R2_STATUS
      || decision.failClosedBoundaries?.w03ToW06Unblocked !== false
      || stable(decision.blockingFindings?.map((row) => [row.code, row.affectedCount]))
         !== stable(evidence.blockingFindings?.map((row) => [row.code, row.affectedCount]))) {
    issues.push(issue('POSTG_APP_W02_A08R2_DECISION_INVALID', W02_A08R2_DECISION_PATH));
  }

  if (claim.taskId !== decision.taskId
      || claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || claim.claimedStatus !== W02_A08R2_STATUS
      || claim.claims?.operatorDecision !== 'REVISE'
      || claim.claims?.productionAdmitted !== false
      || claim.claims?.publicSelectable !== false
      || claim.claims?.d0Complete !== false
      || claim.humanReview?.decision !== 'REVISE'
      || claim.nextStep?.taskId !== W02_A08R3_TASK
      || claim.evidence?.artifactHashes?.length !== 2
      || claim.evidence?.reviewArtifactPaths?.length !== 2
      || claim.evidence?.rendererTestPaths?.length !== 3
      || claim.evidence?.htmlArtifactPaths?.length !== 2
      || claim.evidence?.pdfArtifactPaths?.length !== 2
      || claim.evidence?.beforeAfterEvidencePaths?.length !== 2) {
    issues.push(issue('POSTG_APP_W02_A08R2_CLAIM_INVALID', W02_A08R2_CLAIM_PATH));
  }

  if (decision.reviewedArtifactAuthority?.artifactDigest !== evidence.artifactAuthority?.artifactDigest
      || decision.reviewedArtifactAuthority?.artifactId !== evidence.artifactAuthority?.artifactId
      || claim.evidence?.artifactAuthority?.artifactDigest !== evidence.artifactAuthority?.artifactDigest) {
    issues.push(issue('POSTG_APP_W02_A08R2_ARTIFACT_AUTHORITY_MISMATCH', 'artifactAuthority'));
  }

  if (verifyRegeneratedArtifacts) {
    for (const row of artifactVerification) {
      if (!row.exists || row.actualSha256 !== row.sha256 || row.actualSizeBytes !== row.sizeBytes) {
        issues.push(issue('POSTG_APP_W02_A08R2_REGENERATED_ARTIFACT_MISMATCH', row.path, {
          expectedSha256: row.sha256,
          actualSha256: row.actualSha256,
          expectedSizeBytes: row.sizeBytes,
          actualSizeBytes: row.actualSizeBytes
        }));
      }
    }
    const generatedItems = regeneratedPackage?.generatedItems ?? [];
    const numericItems = generatedItems.filter((row) => row.mode === 'NUMERIC');
    const applicationItems = generatedItems.filter((row) => row.mode === 'APPLICATION');
    const byOrdinal = new Map(generatedItems.map((row) => [row.ordinal, row]));
    if (generatedItems.length !== 195 || numericItems.length !== 134 || applicationItems.length !== 61
        || regeneratedPackage?.pblTaskSetRecords?.length !== 31) {
      issues.push(issue('POSTG_APP_W02_A08R2_REGENERATED_COHORT_COUNT_INVALID', PACKAGE_PATH));
    }
    for (const finding of evidence.blockingFindings ?? []) {
      const actualIds = finding.itemOrdinals.map((ordinal) => byOrdinal.get(ordinal)?.generatedItemId ?? null);
      if (stable(actualIds) !== stable(finding.generatedItemIds)) {
        issues.push(issue('POSTG_APP_W02_A08R2_FINDING_ARTIFACT_BINDING_INVALID', `${PACKAGE_PATH}.${finding.code}`, {
          expected: finding.generatedItemIds,
          actual: actualIds
        }));
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0 ? W02_A08R2_STATUS : 'W02_A08R2_SECOND_OPERATOR_REVIEW_BLOCKED',
    decision: decision.operatorDecision,
    productionAdmissionGranted: decision.productionAdmission?.granted ?? null,
    counts: {
      generatedItemCount: evidence.reviewCoverage?.generatedItemCount ?? null,
      numericQuestionCount: evidence.reviewCoverage?.numericQuestionCount ?? null,
      applicationQuestionCount: evidence.reviewCoverage?.applicationQuestionCount ?? null,
      pblTaskSetCount: evidence.reviewCoverage?.pblTaskSetCount ?? null,
      pdfPageCount: evidence.reviewCoverage?.pdfPageCount ?? null,
      artifactHashCount: evidence.artifacts?.length ?? 0,
      blockingFindingClassCount: evidence.blockingFindings?.length ?? 0
    },
    findingCounts: Object.fromEntries((evidence.blockingFindings ?? []).map((row) => [row.code, row.affectedCount])),
    nextShortestStep: decision.remediation?.taskId ?? null
  };
}

export function buildW02A08R2SecondOperatorReviewReadback(options = {}) {
  return validateW02A08R2SecondOperatorReview(materializeW02A08R2SecondOperatorReview(options));
}
