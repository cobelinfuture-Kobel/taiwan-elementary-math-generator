import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  materializeW02Source13ApplicationAssessment,
  validateW02Source13ApplicationAssessment
} from '../../src/curriculum/application/w02-source13-application-assessment.mjs';
import { runPOSTGAPPW02A00Validation } from '../../tools/curriculum/validate-postg-app-w02-a00-assessment.mjs';

const materialized = materializeW02Source13ApplicationAssessment();
const codes = (result) => result.issues.map((row) => row.code);

const EXPECTED_SOURCE_IDS = [
  'g3a_u08_3a08',
  'g3b_u07_3b07',
  'g3b_u09_3b09',
  'g4a_u06_4a06',
  'g4a_u09_4a09',
  'g4b_u03_4b03',
  'g4b_u06_4b06',
  'g4b_u08_4b08',
  'g5a_u01_5a01',
  'g5a_u03_5a03a',
  'g5a_u03_5a03a1',
  'g5a_u04_5a04',
  'g5a_u06_5a06'
];

test('W02 A00 validates a deterministic 13-source readiness baseline', () => {
  const result = runPOSTGAPPW02A00Validation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, 'PASS_POSTG_APP_W02_A00_SOURCE13_ASSESSMENT_BASELINE');
  assert.equal(result.currentWaveId, 'W02');
  assert.equal(result.sourceLevelApplicationPotential, 'MIXED_KP_SPLIT_REQUIRED');
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification');
  assert.equal(result.counts.sourceNodeCount, 13);
  assert.equal(result.counts.metadataAvailableCount, 13);
  assert.equal(result.counts.knowledgeOperationPresentCount + result.counts.knowledgeOperationMissingCount, 13);
  assert.equal(result.counts.kpClassificationCompleteCount, 0);
  assert.equal(result.counts.productionAdmissionCount, 0);
});

test('W02 source identities and queue order match the fixed controller wave', () => {
  assert.deepEqual(materialized.records.map((row) => row.sourceNodeId), EXPECTED_SOURCE_IDS);
  assert.deepEqual(materialized.records.map((row) => row.queueOrdinal), Array.from({ length: 13 }, (_, index) => index + 1));
  assert.deepEqual(materialized.wave.sourceNodeIds, EXPECTED_SOURCE_IDS);
});

test('all source metadata authorities are explicit and unique', () => {
  const ids = materialized.records.map((row) => row.sourceMetadata.driveFileId);
  assert.equal(new Set(ids).size, 13);
  for (const row of materialized.records) {
    assert.equal(row.sourceMetadata.state, 'VERIFIED_AVAILABLE');
    assert.match(row.sourceMetadata.driveFileId, /^[A-Za-z0-9_-]+$/);
    assert.match(row.sourceMetadata.url, /^https:\/\/drive\.google\.com\/file\/d\//);
    assert.ok(row.sourceTitle.length > 0);
    assert.ok(row.domainFamily.length > 0);
  }
});

test('KnowledgeOperation readiness always matches the repository filesystem', () => {
  for (const row of materialized.records) {
    const exists = fs.existsSync(path.join(materialized.root, row.knowledgeOperation.expectedPath));
    assert.equal(row.knowledgeOperation.exists, exists);
    assert.equal(
      row.knowledgeOperation.readinessDecision,
      exists
        ? 'READY_FOR_KP_APPLICATION_CLASSIFICATION'
        : 'KNOWLEDGE_OPERATION_MATERIALIZATION_REQUIRED'
    );
  }
});

test('A00 never fabricates KP classification, stories or production admission', () => {
  for (const row of materialized.records) {
    assert.equal(row.kpApplicationClassificationState, 'NOT_PERMITTED_AT_SOURCE_BASELINE');
    assert.equal(row.kpApplicationClassificationComplete, false);
    assert.equal(row.inferredKnowledgePointCount, 0);
    assert.equal(row.inferredCanonicalOperationModelCount, 0);
    assert.equal(row.sourceLevelApplicationPotential, 'MIXED_KP_SPLIT_REQUIRED');
    assert.equal(row.forcedStoryAuthoringAllowed, false);
    assert.equal(row.productionAdmissionAllowed, false);
  }
});

test('duplicate source identity and changed queue order fail closed', () => {
  const duplicateCase = structuredClone(materialized);
  duplicateCase.records[1].sourceNodeId = duplicateCase.records[0].sourceNodeId;
  assert.equal(codes(validateW02Source13ApplicationAssessment(duplicateCase)).includes('POSTG_APP_W02_A00_SOURCE_IDENTITY_DUPLICATED'), true);

  const orderCase = structuredClone(materialized);
  [orderCase.records[0], orderCase.records[1]] = [orderCase.records[1], orderCase.records[0]];
  assert.equal(codes(validateW02Source13ApplicationAssessment(orderCase)).includes('POSTG_APP_W02_A00_SOURCE_ORDER_INVALID'), true);
});

test('forged metadata and KnowledgeOperation path fail closed', () => {
  const metadataCase = structuredClone(materialized);
  metadataCase.records[0].sourceMetadata.driveFileId = '';
  assert.equal(codes(validateW02Source13ApplicationAssessment(metadataCase)).includes('POSTG_APP_W02_A00_SOURCE_METADATA_INVALID'), true);

  const pathCase = structuredClone(materialized);
  pathCase.records[0].knowledgeOperation.expectedPath = 'data/curriculum/knowledge/units/forged.json';
  assert.equal(codes(validateW02Source13ApplicationAssessment(pathCase)).includes('POSTG_APP_W02_A00_KNOWLEDGE_OPERATION_PATH_INVALID'), true);
});

test('premature KP claims, forced stories and production admission fail closed', () => {
  const kpCase = structuredClone(materialized);
  kpCase.records[0].kpApplicationClassificationComplete = true;
  kpCase.records[0].inferredKnowledgePointCount = 1;
  assert.equal(codes(validateW02Source13ApplicationAssessment(kpCase)).includes('POSTG_APP_W02_A00_PREMATURE_KP_CLASSIFICATION'), true);

  const storyCase = structuredClone(materialized);
  storyCase.records[0].forcedStoryAuthoringAllowed = true;
  assert.equal(codes(validateW02Source13ApplicationAssessment(storyCase)).includes('POSTG_APP_W02_A00_FORCED_STORY_AUTHORIZATION_INVALID'), true);

  const productionCase = structuredClone(materialized);
  productionCase.records[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW02Source13ApplicationAssessment(productionCase)).includes('POSTG_APP_W02_A00_PRODUCTION_ADMISSION_INVALID'), true);
});
