import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW02PageKnowledgeOperationCandidates,
  validateW02PageKnowledgeOperationCandidates
} from '../../src/curriculum/application/w02-page-knowledge-operation-candidates.mjs';
import { runPOSTGAPPW02A01BValidation } from '../../tools/curriculum/validate-postg-app-w02-a01b-page-knowledge-operation-candidates.mjs';

const materialized = materializeW02PageKnowledgeOperationCandidates();
const codes = (result) => result.issues.map((row) => row.code);

test('A01B materializes and classifies all page-evidenced candidates', () => {
  const result = runPOSTGAPPW02A01BValidation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A01B_PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED');
  assert.deepEqual(result.counts, {
    sourceNodeCount: 13,
    uniquePdfContentCount: 12,
    sourceNodePageCount: 31,
    knowledgePointCandidateCount: 90,
    applicationRequiredCount: 17,
    applicationCompatibleCount: 27,
    applicationNotApplicableCount: 46,
    uniqueContentKnowledgePointCandidateCount: 84
  });
  assert.equal(result.canonicalOperationModelsComplete, false);
  assert.equal(result.productionAdmissionAllowed, false);
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization');
});

test('every source page has visual-readback-backed KP coverage', () => {
  for (const { candidate, inventory } of materialized.records) {
    assert.deepEqual(candidate.sourceEvidence.reviewedPages, Array.from({ length: inventory.pageCount }, (_, index) => index + 1));
    const covered = new Set(candidate.knowledgePoints.flatMap((row) => row.evidencePages));
    assert.deepEqual([...covered].sort((a, b) => a - b), candidate.sourceEvidence.reviewedPages);
  }
});

test('the duplicate PDF is parsed once and projected to separate source identities', () => {
  const rows = materialized.records.filter((row) => row.inventory.contentIdentityGroup === 'pdf_5ba57aff6a97');
  assert.deepEqual(rows.map((row) => row.candidate.sourceNodeId), ['g4a_u06_4a06', 'g4b_u03_4b03']);
  assert.equal(rows[0].candidate.knowledgePoints.length, rows[1].candidate.knowledgePoints.length);
  assert.deepEqual(
    rows[0].candidate.knowledgePoints.map((row) => [row.name, row.scope, row.evidencePages, row.applicationClassification]),
    rows[1].candidate.knowledgePoints.map((row) => [row.name, row.scope, row.evidencePages, row.applicationClassification])
  );
});

test('invalid evidence page and classification fail closed', () => {
  const pageCase = structuredClone(materialized);
  pageCase.records[0].candidate.knowledgePoints[0].evidencePages = [99];
  assert.equal(codes(validateW02PageKnowledgeOperationCandidates(pageCase)).includes('POSTG_APP_W02_A01B_KP_CLASSIFICATION_INVALID'), true);

  const classificationCase = structuredClone(materialized);
  classificationCase.records[0].candidate.knowledgePoints[0].applicationClassification = 'FORCE_STORY';
  assert.equal(codes(validateW02PageKnowledgeOperationCandidates(classificationCase)).includes('POSTG_APP_W02_A01B_KP_CLASSIFICATION_INVALID'), true);
});

test('count drift and premature production claims fail closed', () => {
  const countCase = structuredClone(materialized);
  countCase.records[0].candidate.counts.knowledgePointCandidateCount += 1;
  assert.equal(codes(validateW02PageKnowledgeOperationCandidates(countCase)).includes('POSTG_APP_W02_A01B_COUNT_MISMATCH'), true);

  const admissionCase = structuredClone(materialized);
  admissionCase.records[0].candidate.productionBoundary.productionAdmissionAllowed = true;
  assert.equal(codes(validateW02PageKnowledgeOperationCandidates(admissionCase)).includes('POSTG_APP_W02_A01B_PREMATURE_PRODUCTION_CLAIM'), true);
});
