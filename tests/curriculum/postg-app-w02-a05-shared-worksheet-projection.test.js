import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  buildSharedW02WorksheetProjectionReadback,
  materializeSharedW02WorksheetProjection,
  validateSharedW02WorksheetProjection
} from '../../src/curriculum/application/shared/worksheet-projection-runtime.mjs';
import {
  resolveWaveApplicationAccess,
  validateSharedApplicationRegistries
} from '../../src/curriculum/application/shared/application-capability-resolver.mjs';

const materialized = materializeSharedW02WorksheetProjection();

test('A05 materializes the exact W02 shared worksheet shadow counts', () => {
  const result = validateSharedW02WorksheetProjection(materialized);
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.deepEqual(result.counts, {
    sourceNodeCount: 13,
    applicationCapabilityEntryCount: 61,
    applicationQuestionRecordCount: 61,
    answerKeyRecordCount: 61,
    pblTaskSetRecordCount: 31,
    pbl3TaskSetRecordCount: 19,
    pbl5TaskSetRecordCount: 12,
    worksheetProjectionCount: 13,
    futureWaveFailClosedFixtureCount: 1,
    productionAdmittedCount: 0,
    publicSelectableCount: 0,
    shadowHtmlCount: 0
  });
  assert.deepEqual(result.classificationCounts, {
    APPLICATION_COMPATIBLE: 30,
    APPLICATION_REQUIRED: 31
  });
  assert.deepEqual(result.pblGraphCounts, {
    PBL3_LINEAR: 19,
    PBL5_BOUNDED_DECISION: 12
  });
  assert.equal(result.status, 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS');
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration');
});

test('question, answer and validator lineage remains one-to-one', () => {
  const capabilityIds = new Set(materialized.capabilityEntries.map((row) => row.applicationCapabilityEntryId));
  const answers = new Map(materialized.answerKeyRecords.map((row) => [row.applicationQuestionRecordId, row]));
  const fixtures = new Map(materialized.a04.fixtures.map((row) => [row.fixtureId, row]));
  for (const question of materialized.applicationQuestionRecords) {
    assert.equal(capabilityIds.has(question.applicationCapabilityEntryId), true);
    assert.equal(answers.has(question.applicationQuestionRecordId), true);
    const fixture = fixtures.get(question.validatorEvidence.fixtureId);
    assert.equal(fixture.fixtureType, 'POSITIVE_SINGLE_APPLICATION');
    assert.equal(fixture.expectedValidation.shouldPass, true);
    assert.equal(question.productionSelectable, false);
    assert.equal(question.publicSelectable, false);
  }
});

test('numeric and application modes remain separated and HTML stays outside A05', () => {
  for (const projection of materialized.projections) {
    assert.equal(projection.questionMode, 'APPLICATION');
    assert.equal(projection.modeSeparation.numericPatternSpecsProjected, false);
    assert.equal(projection.modeSeparation.applicationPatternSpecsProjected, true);
    assert.equal(projection.modeSeparation.forcedStoryAuthoringAllowed, false);
    assert.equal(Object.hasOwn(projection, 'shadowHtml'), false);
    assert.equal(projection.printMetadata.dataOnlyShadow, true);
    assert.equal(projection.printMetadata.supportsPreview, false);
    assert.equal(projection.printMetadata.supportsPrint, false);
    assert.equal(projection.printMetadata.supportsAnswerKey, true);
  }
});

test('PBL records preserve complete graph and approved page projection candidates', () => {
  for (const record of materialized.pblTaskSetRecords) {
    const expectedCount = record.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    const expectedProjection = record.graphType === 'PBL5_BOUNDED_DECISION'
      ? 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE'
      : 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE';
    assert.equal(record.tasks.length, expectedCount);
    assert.equal(record.milestones.length, expectedCount);
    assert.equal(record.pageProjectionCandidate, expectedProjection);
    assert.equal(record.finalProduct.requiredMilestoneIds.length >= 2, true);
    assert.equal(record.productionSelectable, false);
  }
});

test('W03 future slot is readable but fails closed for shadow projection', () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/curriculum/postg-app-w02-a05-future-wave-registry.json', 'utf8'));
  assert.equal(fixture.waveId, 'W03');
  const access = resolveWaveApplicationAccess(materialized.registries, fixture.waveId, 'SHADOW');
  assert.equal(access.ok, fixture.expectedResolution.shadowProjectionAllowed);
  assert.equal(access.errorCode, fixture.expectedResolution.expectedErrorCode);
  assert.equal(fixture.expectedResolution.registryReadable, true);
});

test('forged future-wave admission and W02 public exposure fail closed', () => {
  const future = structuredClone(materialized.registries);
  future.capabilityRegistry.waveProviders[2].shadowProjectionAllowed = true;
  assert.equal(validateSharedApplicationRegistries(future).ok, false);

  const publicCase = structuredClone(materialized);
  publicCase.capabilityEntries[0].publicSelectable = true;
  assert.equal(validateSharedW02WorksheetProjection(publicCase).ok, false);
});

test('duplicate PDF content projection parity is preserved', () => {
  assert.equal(materialized.duplicateComparisons.length, 1);
  assert.deepEqual(materialized.duplicateComparisons[0].sourceNodeIds, ['g4a_u06_4a06', 'g4b_u03_4b03']);
  assert.equal(materialized.duplicateComparisons[0].equal, true);
});

test('readback exposes representative shared records without production claims', () => {
  const result = buildSharedW02WorksheetProjectionReadback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.sampleCapabilityEntry.waveId, 'W02');
  assert.equal(result.sampleQuestionRecord.questionMode, 'APPLICATION');
  assert.equal(result.sampleAnswerKeyRecord.productionSelectable, false);
  assert.equal(result.samplePBLTaskSetRecord.productionSelectable, false);
  assert.equal(result.sampleWorksheetProjection.projectionStatus, 'SHADOW_DATA_PROJECTION');
});
