import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01Golden15ApplicationAssessment,
  validateW01Golden15ApplicationAssessment
} from '../../src/curriculum/application/w01-golden15-application-assessment.mjs';
import { runPOSTGAPPW01A00Validation } from '../../tools/curriculum/validate-postg-app-w01-a00-assessment.mjs';

const materialized = materializeW01Golden15ApplicationAssessment();
const codes = (result) => result.issues.map((row) => row.code);

test('W01-A00 assesses all 156 KnowledgePoints across the 15 golden units', () => {
  const result = runPOSTGAPPW01A00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W01_A00_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W01_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT_READY');
  assert.equal(result.assessmentConsumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.goldenUnitCount, 15);
  assert.equal(result.counts.sourceNodeCoverageCount, 16);
  assert.equal(result.counts.knowledgePointCount, 156);
  assert.equal(result.counts.operationModelOwnerCount, 156);
  assert.equal(result.counts.unclassifiedCount, 0);
  assert.equal(result.counts.productionAdmittedRecordCount, 0);
});

test('every KnowledgePoint has exactly one classification and identity', () => {
  const records = materialized.records;
  const identities = records.map((row) => `${row.sourceId}::${row.knowledgePointId}`);
  assert.equal(new Set(identities).size, 156);
  assert.equal(records.every((row) => [
    'APPLICATION_REQUIRED',
    'APPLICATION_COMPATIBLE',
    'APPLICATION_NOT_APPLICABLE'
  ].includes(row.classification)), true);
  assert.equal(Object.values(validateW01Golden15ApplicationAssessment(materialized).classificationCounts).reduce((a, b) => a + b, 0), 156);
});

test('existing application evidence is preserved as required', () => {
  const existing = materialized.records.filter((row) => row.existingApplicationPresent);
  assert.equal(existing.length > 0, true);
  assert.equal(existing.every((row) => row.classification === 'APPLICATION_REQUIRED'), true);
  assert.equal(existing.every((row) => row.backlogAdmissionDecision === 'ADMITTED_TO_W01_DESIGN_BACKLOG'), true);
});

test('suitable KnowledgePoints have direct mode and eligible Atomic Task Episodes', () => {
  const suitable = materialized.records.filter((row) => row.classification !== 'APPLICATION_NOT_APPLICABLE');
  assert.equal(suitable.length > 0, true);
  assert.equal(suitable.every((row) => row.applicationModes.includes('SINGLE_DIRECT')), true);
  assert.equal(suitable.every((row) => row.operationFamilyCandidates.length > 0), true);
  assert.equal(suitable.every((row) => row.eligibleAtomicEpisodeIds.length > 0), true);
  assert.equal(suitable.every((row) => row.productionAdmissionAllowed === false), true);
});

test('not-applicable KnowledgePoints receive no forced story mode or context episode', () => {
  const excluded = materialized.records.filter((row) => row.classification === 'APPLICATION_NOT_APPLICABLE');
  assert.equal(excluded.length > 0, true);
  assert.equal(excluded.every((row) => row.applicationModes.length === 0), true);
  assert.equal(excluded.every((row) => row.eligibleAtomicEpisodeIds.length === 0), true);
  assert.equal(excluded.every((row) => row.backlogAdmissionDecision === 'EXCLUDED_FROM_APPLICATION_AUTHORING'), true);
});

test('G3B-U01 remainder interpretation enters N+1 and PBL candidate modes', () => {
  const record = materialized.records.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  assert.equal(record.classification, 'APPLICATION_REQUIRED');
  assert.equal(record.applicationModes.includes('SINGLE_DIRECT'), true);
  assert.equal(record.applicationModes.includes('SINGLE_N_PLUS_1'), true);
  assert.equal(record.applicationModes.includes('PBL_TASK_SET'), true);
  assert.equal(record.applicationDepth, 'PBL_CANDIDATE');
});

test('unit summaries cover all 15 units and preserve the composite source mapping', () => {
  const validation = validateW01Golden15ApplicationAssessment(materialized);
  assert.equal(validation.unitSummaries.length, 15);
  assert.equal(validation.unitSummaries.reduce((sum, row) => sum + row.knowledgePointCount, 0), 156);
  const composite = validation.unitSummaries.find((row) => row.sourceId === 'g5a_u02_5a02');
  assert.deepEqual(composite.sourceNodeRefs, ['g5a_u02_5a02a', 'g5a_u02_5a02a1']);
});

test('downgrading existing application evidence fails closed', () => {
  const changed = structuredClone(materialized);
  const record = changed.records.find((row) => row.existingApplicationPresent);
  record.classification = 'APPLICATION_NOT_APPLICABLE';
  record.applicationModes = [];
  record.eligibleAtomicEpisodeIds = [];
  assert.equal(codes(validateW01Golden15ApplicationAssessment(changed)).includes('POSTG_APP_W01_EXISTING_APPLICATION_DOWNGRADED'), true);
});

test('suitable record without context candidates fails closed', () => {
  const changed = structuredClone(materialized);
  const record = changed.records.find((row) => row.classification !== 'APPLICATION_NOT_APPLICABLE');
  record.eligibleAtomicEpisodeIds = [];
  assert.equal(codes(validateW01Golden15ApplicationAssessment(changed)).includes('POSTG_APP_W01_SUITABLE_KP_HAS_NO_CONTEXT_EPISODE'), true);
});

test('premature production admission fails closed', () => {
  const changed = structuredClone(materialized);
  changed.records[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW01Golden15ApplicationAssessment(changed)).includes('POSTG_APP_W01_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});
