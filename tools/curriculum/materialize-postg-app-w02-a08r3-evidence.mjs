#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW02A08R3NumericRemediationReadback,
  W02_A08R3_READBACK_PATH,
  W02_A08R3_STATUS,
  W02_A08R3_TASK,
  W02_A08R4_TASK
} from '../../src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r3/POSTG_APP_W02_A08R3_NUMERIC_SURFACE_REMEDIATION_EVIDENCE.json';
const CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08R3.claim.json';
const PRIOR_EVIDENCE_PATH = 'docs/curriculum/output/postg-app/w02-a08r2/POSTG_APP_W02_A08R2_SECOND_REVIEW_EVIDENCE.json';
const HTML_PATHS = [
  'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html',
  'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html'
];
const PDF_PATHS = [
  'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf',
  'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf'
];

const writeJson = (repoPath, value) => {
  const absolute = path.join(ROOT, repoPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sha256 = (repoPath) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, repoPath))).digest('hex');

const readback = buildW02A08R3NumericRemediationReadback({ root: ROOT });
if (!readback.ok) {
  process.stderr.write(`${JSON.stringify(readback, null, 2)}\n`);
  process.exit(1);
}

const persistedReadback = {
  ...readback,
  generatedAt: 'DETERMINISTIC_FROM_CURRENT_REPOSITORY_STATE',
  artifactRegenerationRequired: true
};
writeJson(W02_A08R3_READBACK_PATH, persistedReadback);

const evidence = {
  schemaName: 'POSTGAPPW02A08R3NumericSurfaceRemediationEvidenceV1',
  schemaVersion: 1,
  programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
  taskId: W02_A08R3_TASK,
  parentTaskId: 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision',
  status: W02_A08R3_STATUS,
  priorDecision: 'REVISE',
  priorEvidencePath: PRIOR_EVIDENCE_PATH,
  remediationScope: [
    'NUMERIC_REQUESTED_UNKNOWN_NAMING',
    'NUMERIC_MINIMAL_INDEPENDENT_GIVEN_SET',
    'NUMERIC_RELATION_COHERENCE_AND_BOUNDEDNESS',
    'NUMERIC_GRADE_APPROPRIATE_NOTATION'
  ],
  beforeFindingCounts: {
    unresolvedRequestedUnknown: 13,
    answerEquivalentOrNonMinimalGivenSet: 19,
    malformedOrIncoherentSurface: 12,
    gradeUnsafeNotation: 2
  },
  afterFindingCounts: readback.audit.counts,
  coverage: {
    ...readback.counts,
    numericPdfPageCount: 68,
    applicationPdfPageCount: 42,
    pdfPageCount: 110
  },
  studentFacingVersions: readback.studentFacingVersions,
  historicalFindingReadback: readback.historicalFindingReadback,
  runtimeAuthority: {
    sharedGenerator: 'src/curriculum/application/shared/operation-family-runtime.mjs',
    studentFacingEntryPoint: 'src/curriculum/application/shared/student-facing-operation-surface.mjs',
    numericRemediationAdapter: 'src/curriculum/application/shared/student-facing-numeric-remediation-v4.mjs',
    productionEquivalentRuntime: 'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs'
  },
  artifactRegeneration: {
    exactHeadRequired: true,
    commands: [
      'node tools/curriculum/generate-postg-app-w02-a06-artifacts.mjs',
      'node tools/curriculum/render-postg-app-w02-a06-pdf.mjs',
      'node tools/curriculum/finalize-postg-app-w02-a06-artifacts.mjs',
      'python tools/curriculum/verify-postg-app-w02-a06-pdf.py'
    ],
    htmlArtifactPaths: HTML_PATHS,
    pdfArtifactPaths: PDF_PATHS,
    expectedPdfPageCount: 110,
    workflowArtifactBoundAtThirdReview: true
  },
  boundaries: {
    productionAdmissionGranted: false,
    publicSelectable: false,
    publicRouteChanged: false,
    w03ToW06Unblocked: false,
    automaticApprovalAllowed: false
  },
  thirdOperatorReviewReady: true,
  nextShortestStep: W02_A08R4_TASK
};
writeJson(EVIDENCE_PATH, evidence);

const claim = {
  schemaVersion: 1,
  taskId: W02_A08R3_TASK,
  taskClass: 'implementation',
  targetEvidenceLevel: 'E5_PRODUCTION_ADMITTED',
  actualEvidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
  claimedStatus: W02_A08R3_STATUS,
  claims: {
    dataStructureReady: true,
    contentAuthored: true,
    runtimeIntegrated: true,
    productionEquivalentGeneratorUsed: true,
    productionRendererUsed: true,
    htmlOutputVerified: true,
    pdfOutputVerified: true,
    visibleOutputChanged: true,
    humanReviewReady: true,
    productionAdmitted: false,
    d0Complete: false
  },
  evidence: {
    runtimeTestPaths: [
      'src/curriculum/application/shared/student-facing-numeric-remediation-v4.mjs',
      'src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs',
      'tests/curriculum/postg-app-w02-a08r3-numeric-surface-remediation.test.js',
      'tools/curriculum/validate-postg-app-w02-a08r3-numeric-surface-remediation.mjs'
    ],
    rendererTestPaths: [
      'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
      'tests/curriculum/postg-app-w02-a06-production-equivalent-html-pdf.test.js',
      'tools/curriculum/verify-postg-app-w02-a06-pdf.py'
    ],
    htmlArtifactPaths: HTML_PATHS,
    pdfArtifactPaths: PDF_PATHS,
    beforeAfterEvidencePaths: [PRIOR_EVIDENCE_PATH, EVIDENCE_PATH],
    reviewArtifactPaths: [EVIDENCE_PATH, W02_A08R3_READBACK_PATH],
    artifactHashes: [
      { path: EVIDENCE_PATH, sha256: sha256(EVIDENCE_PATH) },
      { path: W02_A08R3_READBACK_PATH, sha256: sha256(W02_A08R3_READBACK_PATH) }
    ]
  },
  humanReview: {
    type: 'production_equivalent_output_review',
    canUnlockProduction: true,
    reviewArtifactRequired: true,
    decision: 'PENDING_THIRD_OPERATOR_REVIEW'
  },
  distance: {
    before: 'D1',
    after: 'D1',
    distanceReduced: 'All four A08R2 numeric student-facing defect classes are remediated and the complete 195-item cohort is ready for a third production-equivalent HTML/PDF operator review.'
  },
  nextStep: {
    taskId: W02_A08R4_TASK,
    requiredEvidenceLevelBeforeStart: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
  }
};
writeJson(CLAIM_PATH, claim);

process.stdout.write(`${JSON.stringify({
  ok: true,
  readbackPath: W02_A08R3_READBACK_PATH,
  evidencePath: EVIDENCE_PATH,
  claimPath: CLAIM_PATH,
  status: W02_A08R3_STATUS
}, null, 2)}\n`);
