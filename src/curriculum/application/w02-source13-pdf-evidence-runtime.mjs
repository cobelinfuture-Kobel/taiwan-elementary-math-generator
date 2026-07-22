import fs from 'node:fs';
import path from 'node:path';

import { buildW02Source13ApplicationAssessmentReadback } from './w02-source13-application-assessment.mjs';

const INVENTORY_PATH = 'data/curriculum/application/evidence/w02-source13-pdf-evidence-inventory.json';
const POLICY_PATH = 'data/curriculum/application/evidence/w02-source13-pdf-evidence-policy.json';
const A00_BASELINE_PATH = 'data/curriculum/application/assessment/w02-source13-source-authority-baseline.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function groupsByHash(records) {
  const groups = new Map();
  for (const row of records) {
    const group = groups.get(row.sha256) ?? [];
    group.push(row.sourceNodeId);
    groups.set(row.sha256, group);
  }
  return groups;
}

export function materializeW02Source13PdfEvidence({ root = process.cwd() } = {}) {
  return {
    root,
    inventory: readJson(root, INVENTORY_PATH),
    policy: readJson(root, POLICY_PATH),
    a00Baseline: readJson(root, A00_BASELINE_PATH),
    a00Readback: buildW02Source13ApplicationAssessmentReadback({ root })
  };
}

export function validateW02Source13PdfEvidence(materialized) {
  const issues = [];
  const { inventory, policy, a00Baseline, a00Readback } = materialized;
  const records = inventory.records ?? [];

  if (!a00Readback.ok || a00Readback.counts.sourceNodeCount !== 13) {
    issues.push(issue('POSTG_APP_W02_A01A_A00_BASELINE_INVALID', 'a00Readback', {
      a00Issues: a00Readback.issues
    }));
  }

  if (records.length !== policy.requiredSourceNodeCount
      || inventory.counts.sourceNodeCount !== policy.requiredSourceNodeCount
      || inventory.counts.sourcePdfReferenceCount !== policy.requiredSourcePdfReferenceCount) {
    issues.push(issue('POSTG_APP_W02_A01A_SOURCE_COUNT_INVALID', 'records', {
      expected: policy.requiredSourceNodeCount,
      actual: records.length
    }));
  }

  const expectedIds = a00Baseline.records.map((row) => row.sourceNodeId);
  const actualIds = records.map((row) => row.sourceNodeId);
  if (!unique(actualIds)
      || JSON.stringify(actualIds) !== JSON.stringify(expectedIds)
      || !records.every((row, index) => row.queueOrdinal === index + 1)) {
    issues.push(issue('POSTG_APP_W02_A01A_SOURCE_ORDER_INVALID', 'records', {
      expected: expectedIds,
      actual: actualIds
    }));
  }

  const driveIds = records.map((row) => row.sourcePdfDriveFileId);
  if (!unique(driveIds)) issues.push(issue('POSTG_APP_W02_A01A_DRIVE_PDF_ID_INVALID', 'records'));

  for (const row of records) {
    const recordPath = `records.${row.sourceNodeId}`;
    if (!/^[A-Za-z0-9_-]+$/.test(row.sourcePdfDriveFileId)
        || !row.sourcePdfUrl.startsWith(`https://drive.google.com/file/d/${row.sourcePdfDriveFileId}`)
        || !row.sourcePdfFileName.endsWith('.pdf')) {
      issues.push(issue('POSTG_APP_W02_A01A_DRIVE_PDF_ID_INVALID', recordPath));
    }
    if (!/^[a-f0-9]{64}$/.test(row.sha256)
        || row.contentIdentityGroup !== `pdf_${row.sha256.slice(0, 12)}`) {
      issues.push(issue('POSTG_APP_W02_A01A_HASH_INVALID', recordPath));
    }
    if (!Number.isInteger(row.pageCount) || row.pageCount <= 0 || row.byteSize <= 0) {
      issues.push(issue('POSTG_APP_W02_A01A_PAGE_COUNT_INVALID', recordPath));
    }
    if (row.textLayerAvailable !== true || row.textLayerNonWhitespaceCharCount <= 20) {
      issues.push(issue('POSTG_APP_W02_A01A_TEXT_LAYER_INVALID', recordPath));
    }
    if (row.firstPageRenderAvailable !== true) {
      issues.push(issue('POSTG_APP_W02_A01A_RENDERABILITY_INVALID', recordPath));
    }
    if (Object.hasOwn(row, 'repositoryPdfPath') || Object.hasOwn(row, 'repositoryRawPdfPath')) {
      issues.push(issue('POSTG_APP_W02_A01A_PRIVATE_PDF_REPOSITORY_COPY_INVALID', recordPath));
    }
  }

  const uniqueHashes = new Set(records.map((row) => row.sha256));
  const totalPageCount = records.reduce((sum, row) => sum + row.pageCount, 0);
  const textLayerCount = records.filter((row) => row.textLayerAvailable).length;
  const renderableCount = records.filter((row) => row.firstPageRenderAvailable).length;
  if (uniqueHashes.size !== policy.expectedUniquePdfContentCount
      || inventory.counts.uniquePdfContentCount !== uniqueHashes.size) {
    issues.push(issue('POSTG_APP_W02_A01A_UNIQUE_CONTENT_COUNT_INVALID', 'counts.uniquePdfContentCount', {
      expected: policy.expectedUniquePdfContentCount,
      actual: uniqueHashes.size
    }));
  }
  if (totalPageCount !== policy.expectedTotalPageCount
      || inventory.counts.totalPageCount !== totalPageCount
      || inventory.counts.textLayerAvailableCount !== textLayerCount
      || inventory.counts.firstPageRenderAvailableCount !== renderableCount) {
    issues.push(issue('POSTG_APP_W02_A01A_PAGE_COUNT_INVALID', 'counts', {
      totalPageCount,
      textLayerCount,
      renderableCount
    }));
  }

  const actualDuplicateGroups = [...groupsByHash(records).entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sha256, sourceNodeIds]) => ({ sha256, sourceNodeIds }));
  const expectedDuplicateGroups = policy.deduplication.expectedDuplicateContentGroups;
  if (JSON.stringify(actualDuplicateGroups) !== JSON.stringify(expectedDuplicateGroups)
      || inventory.duplicateContentGroups.length !== expectedDuplicateGroups.length
      || inventory.counts.duplicateContentGroupCount !== expectedDuplicateGroups.length) {
    issues.push(issue('POSTG_APP_W02_A01A_DUPLICATE_GROUP_INVALID', 'duplicateContentGroups', {
      expected: expectedDuplicateGroups,
      actual: actualDuplicateGroups
    }));
  }

  const boundary = policy.claimBoundary;
  if (boundary.knowledgePointCountClaimed !== 0
      || boundary.canonicalOperationModelCountClaimed !== 0
      || boundary.kpApplicationClassificationClaimed !== false
      || boundary.storyTemplateClaimed !== false
      || boundary.productionAdmissionAllowed !== false) {
    issues.push(issue('POSTG_APP_W02_A01A_PREMATURE_KP_CLAIM', 'policy.claimBoundary'));
  }
  if (inventory.verificationMethod.privatePdfCopiedToRepository !== false) {
    issues.push(issue('POSTG_APP_W02_A01A_PRIVATE_PDF_REPOSITORY_COPY_INVALID', 'verificationMethod'));
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'PASS_POSTG_APP_W02_A01A_SOURCE_PDF_EVIDENCE_VERIFIED'
      : 'FAIL_POSTG_APP_W02_A01A_SOURCE_PDF_EVIDENCE',
    counts: {
      sourceNodeCount: records.length,
      sourcePdfReferenceCount: records.length,
      uniquePdfContentCount: uniqueHashes.size,
      totalPageCount,
      textLayerAvailableCount: textLayerCount,
      firstPageRenderAvailableCount: renderableCount,
      duplicateContentGroupCount: actualDuplicateGroups.length
    },
    knowledgePointCountClaimed: 0,
    productionAdmissionAllowed: false,
    nextShortestStep: inventory.nextShortestStep
  };
}

export function buildW02Source13PdfEvidenceReadback({ root = process.cwd() } = {}) {
  return validateW02Source13PdfEvidence(materializeW02Source13PdfEvidence({ root }));
}
