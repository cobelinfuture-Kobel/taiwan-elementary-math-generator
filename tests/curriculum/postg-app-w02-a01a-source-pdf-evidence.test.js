import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW02Source13PdfEvidence,
  validateW02Source13PdfEvidence
} from '../../src/curriculum/application/w02-source13-pdf-evidence-runtime.mjs';
import { runPOSTGAPPW02A01AValidation } from '../../tools/curriculum/validate-postg-app-w02-a01a-source-pdf-evidence.mjs';

const materialized = materializeW02Source13PdfEvidence();
const codes = (result) => result.issues.map((row) => row.code);

test('A01A verifies all 13 source PDF references without copying private PDFs', () => {
  const result = runPOSTGAPPW02A01AValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A01A_SOURCE_PDF_EVIDENCE_VERIFIED');
  assert.deepEqual(result.counts, {
    sourceNodeCount: 13,
    sourcePdfReferenceCount: 13,
    uniquePdfContentCount: 12,
    totalPageCount: 31,
    textLayerAvailableCount: 13,
    firstPageRenderAvailableCount: 13,
    duplicateContentGroupCount: 1
  });
  assert.equal(result.knowledgePointCountClaimed, 0);
  assert.equal(result.productionAdmissionAllowed, false);
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification');
});

test('all PDF identities are explicit, hash-locked and renderable', () => {
  const records = materialized.inventory.records;
  assert.equal(records.length, 13);
  assert.equal(new Set(records.map((row) => row.sourcePdfDriveFileId)).size, 13);
  for (const row of records) {
    assert.match(row.sourcePdfDriveFileId, /^[A-Za-z0-9_-]+$/);
    assert.match(row.sha256, /^[a-f0-9]{64}$/);
    assert.equal(row.contentIdentityGroup, `pdf_${row.sha256.slice(0, 12)}`);
    assert.ok(row.pageCount > 0);
    assert.equal(row.textLayerAvailable, true);
    assert.ok(row.textLayerNonWhitespaceCharCount > 20);
    assert.equal(row.firstPageRenderAvailable, true);
    assert.equal(Object.hasOwn(row, 'repositoryPdfPath'), false);
  }
});

test('the byte-identical improper/mixed fraction source is deduplicated exactly once', () => {
  assert.deepEqual(materialized.inventory.duplicateContentGroups, [{
    contentIdentityGroup: 'pdf_5ba57aff6a97',
    sha256: '5ba57aff6a973bd1a8df63791155df7b15fe25ec2b546fc94fb2d8a8323070b3',
    sourceNodeIds: ['g4a_u06_4a06', 'g4b_u03_4b03'],
    deduplicationPolicy: 'PARSE_ONCE_PROJECT_TO_SEPARATE_SOURCE_NODES',
    note: 'Both source nodes reference byte-identical improper-and-mixed-fraction evidence; downstream KnowledgeOperation records remain source-node-specific.'
  }]);
});

test('forged hash, page count and render state fail closed', () => {
  const hashCase = structuredClone(materialized);
  hashCase.inventory.records[0].sha256 = '0'.repeat(64);
  assert.equal(codes(validateW02Source13PdfEvidence(hashCase)).includes('POSTG_APP_W02_A01A_HASH_INVALID'), true);

  const pageCase = structuredClone(materialized);
  pageCase.inventory.records[0].pageCount = 0;
  assert.equal(codes(validateW02Source13PdfEvidence(pageCase)).includes('POSTG_APP_W02_A01A_PAGE_COUNT_INVALID'), true);

  const renderCase = structuredClone(materialized);
  renderCase.inventory.records[0].firstPageRenderAvailable = false;
  assert.equal(codes(validateW02Source13PdfEvidence(renderCase)).includes('POSTG_APP_W02_A01A_RENDERABILITY_INVALID'), true);
});

test('duplicate group drift and private PDF repository copy fail closed', () => {
  const duplicateCase = structuredClone(materialized);
  duplicateCase.inventory.records[5].sha256 = '1'.repeat(64);
  duplicateCase.inventory.records[5].contentIdentityGroup = `pdf_${'1'.repeat(12)}`;
  assert.equal(codes(validateW02Source13PdfEvidence(duplicateCase)).includes('POSTG_APP_W02_A01A_UNIQUE_CONTENT_COUNT_INVALID'), true);

  const privateCopyCase = structuredClone(materialized);
  privateCopyCase.inventory.records[0].repositoryPdfPath = 'data/private/source.pdf';
  assert.equal(codes(validateW02Source13PdfEvidence(privateCopyCase)).includes('POSTG_APP_W02_A01A_PRIVATE_PDF_REPOSITORY_COPY_INVALID'), true);
});

test('source-order drift and premature KP claims fail closed', () => {
  const orderCase = structuredClone(materialized);
  [orderCase.inventory.records[0], orderCase.inventory.records[1]] = [orderCase.inventory.records[1], orderCase.inventory.records[0]];
  assert.equal(codes(validateW02Source13PdfEvidence(orderCase)).includes('POSTG_APP_W02_A01A_SOURCE_ORDER_INVALID'), true);

  const claimCase = structuredClone(materialized);
  claimCase.policy.claimBoundary.knowledgePointCountClaimed = 1;
  assert.equal(codes(validateW02Source13PdfEvidence(claimCase)).includes('POSTG_APP_W02_A01A_PREMATURE_KP_CLAIM'), true);
});
