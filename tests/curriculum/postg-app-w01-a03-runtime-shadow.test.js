import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01ValidatorShadowFixtures,
  validateW01ShadowFixture,
  validateW01ValidatorShadowRuntime
} from '../../src/curriculum/application/w01-validator-fixture-shadow-runtime.mjs';
import { runPOSTGAPPW01A03Validation } from '../../tools/curriculum/validate-postg-app-w01-a03-runtime-shadow.mjs';

const materialized = materializeW01ValidatorShadowFixtures();
const codes = (result) => result.issues.map((row) => row.code);

test('W01-A03 executes all deterministic positive and negative shadow fixtures', () => {
  const result = runPOSTGAPPW01A03Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W01_A03_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W01_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_PASS');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.fixtureCount, result.counts.positiveFixtureCount + result.counts.negativeFixtureCount);
  assert.equal(result.counts.unexpectedPassCount, 0);
  assert.equal(result.counts.unexpectedRejectCount, 0);
  assert.equal(result.counts.productionAdmittedCount, 0);
});

test('fixture cardinality follows the candidate, N+1 and PBL coverage contract', () => {
  const validation = validateW01ValidatorShadowRuntime(materialized);
  const expected = validation.counts.candidateCount * 3
    + validation.counts.nPlusOneProofCount * 2
    + validation.counts.pblCandidateCount * 2;
  assert.equal(validation.counts.fixtureCount, expected);
  assert.equal(new Set(materialized.fixtures.map((row) => row.fixtureId)).size, expected);
});

test('all 15 Golden units and all 16 Macro Context Domains remain covered', () => {
  const validation = validateW01ValidatorShadowRuntime(materialized);
  assert.equal(validation.counts.goldenUnitCoverageCount, 15);
  assert.equal(validation.counts.macroContextCoverageCount, 16);
  assert.equal(validation.sourceCoverage.length, 15);
  assert.equal(validation.macroCoverage.length, 16);
});

test('every A01 candidate has positive, wrong-role and unit-mismatch fixtures', () => {
  for (const candidate of materialized.a02.a01.candidates) {
    const rows = materialized.fixtures.filter((row) => row.bindingCandidateId === candidate.bindingCandidateId);
    assert.equal(rows.filter((row) => row.fixtureType === 'POSITIVE_SINGLE_APPLICATION').length, 1);
    assert.equal(rows.filter((row) => row.fixtureType === 'NEGATIVE_WRONG_ANSWER_ROLE').length, 1);
    assert.equal(rows.filter((row) => row.fixtureType === 'NEGATIVE_UNIT_MISMATCH').length, 1);
  }
});

test('registered operation-family adapters recompute every numeric witness deterministically', () => {
  for (const fixture of materialized.fixtures) {
    const result = validateW01ShadowFixture(materialized, fixture);
    assert.equal(result.calculationPass, true, fixture.fixtureId);
    assert.equal(materialized.adapterIndex.has(fixture.operationFamily), true);
    assert.equal(materialized.adapterIndex.get(fixture.operationFamily).adapterId, fixture.fixtureAdapterId);
  }
});

test('wrong answer role and unit mismatch reject at their intended validator layer', () => {
  const wrongRole = materialized.fixtures.find((row) => row.fixtureType === 'NEGATIVE_WRONG_ANSWER_ROLE');
  const unitMismatch = materialized.fixtures.find((row) => row.fixtureType === 'NEGATIVE_UNIT_MISMATCH');
  const roleResult = validateW01ShadowFixture(materialized, wrongRole);
  const unitResult = validateW01ShadowFixture(materialized, unitMismatch);
  assert.deepEqual(roleResult, {
    pass: false,
    errorCode: 'ANSWER_ROLE_MISMATCH',
    calculationPass: true,
    interpretationPass: true,
    pblPass: true
  });
  assert.deepEqual(unitResult, {
    pass: false,
    errorCode: 'ANSWER_UNIT_MISMATCH',
    calculationPass: true,
    interpretationPass: true,
    pblPass: true
  });
});

test('N+1 interpretation failure preserves calculation pass', () => {
  const fixtures = materialized.fixtures.filter((row) => (
    row.fixtureType === 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL'
  ));
  assert.equal(fixtures.length, materialized.a02.nPlusOneProofCandidates.length);
  for (const fixture of fixtures) {
    const result = validateW01ShadowFixture(materialized, fixture);
    assert.equal(result.pass, false);
    assert.equal(result.errorCode, 'INTERPRETATION_WITNESS_MISSING');
    assert.equal(result.calculationPass, true);
    assert.equal(result.interpretationPass, false);
    assert.equal(result.pblPass, true);
  }
});

test('counterfactual N+1 fixtures pass with explicit interpretation evidence', () => {
  const fixtures = materialized.fixtures.filter((row) => (
    row.fixtureType === 'POSITIVE_COUNTERFACTUAL_INTERPRETATION'
  ));
  assert.equal(fixtures.length, materialized.a02.nPlusOneProofCandidates.length);
  for (const fixture of fixtures) {
    assert.equal(fixture.interpretationEvidence.counterfactualApplied, true);
    assert.equal(fixture.lineage.a02ProofCandidateId.startsWith('w01_n1proof_'), true);
    assert.deepEqual(validateW01ShadowFixture(materialized, fixture), {
      pass: true,
      errorCode: null,
      calculationPass: true,
      interpretationPass: true,
      pblPass: true
    });
  }
});

test('PBL positive graphs pass and broken dependencies fail closed', () => {
  const positives = materialized.fixtures.filter((row) => row.fixtureType === 'POSITIVE_PBL_DEPENDENCY_GRAPH');
  const negatives = materialized.fixtures.filter((row) => row.fixtureType === 'NEGATIVE_PBL_DEPENDENCY_BROKEN');
  assert.equal(positives.length, materialized.a02.pblTaskSetCandidates.length);
  assert.equal(negatives.length, materialized.a02.pblTaskSetCandidates.length);
  for (const fixture of positives) {
    const result = validateW01ShadowFixture(materialized, fixture);
    assert.equal(result.pass, true, fixture.fixtureId);
    assert.equal(result.pblPass, true);
    assert.equal(fixture.pblEvidence.finalRequiredMilestoneIds.length >= 2, true);
  }
  for (const fixture of negatives) {
    const result = validateW01ShadowFixture(materialized, fixture);
    assert.equal(result.pass, false, fixture.fixtureId);
    assert.equal(result.errorCode, 'PBL_DEPENDENCY_INVALID');
    assert.equal(result.calculationPass, true);
    assert.equal(result.interpretationPass, true);
    assert.equal(result.pblPass, false);
  }
});

test('fixture mutation at lineage, context and numeric layers fails closed', () => {
  const lineageCase = structuredClone(materialized);
  lineageCase.fixtures[0].lineage.a01BindingCandidateId = 'w01_bind_missing';
  assert.equal(validateW01ShadowFixture(lineageCase, lineageCase.fixtures[0]).errorCode, 'CANDIDATE_LINEAGE_INVALID');

  const contextCase = structuredClone(materialized);
  contextCase.fixtures[0].contextLineage.atomicEpisodeId = 'gctx_episode_wrong';
  assert.equal(validateW01ShadowFixture(contextCase, contextCase.fixtures[0]).errorCode, 'CONTEXT_CHAIN_INVALID');

  const numericCase = structuredClone(materialized);
  numericCase.fixtures[0].answerPayload = 'wrong-answer-payload';
  assert.equal(validateW01ShadowFixture(numericCase, numericCase.fixtures[0]).errorCode, 'SHADOW_NUMERIC_WITNESS_INVALID');
});

test('missing fixture coverage and premature production admission are blocking', () => {
  const missingCase = structuredClone(materialized);
  const removed = missingCase.fixtures.findIndex((row) => row.fixtureType === 'NEGATIVE_UNIT_MISMATCH');
  missingCase.fixtures.splice(removed, 1);
  const missingCodes = codes(validateW01ValidatorShadowRuntime(missingCase));
  assert.equal(missingCodes.includes('POSTG_APP_W01_A03_FIXTURE_COUNT_MISMATCH'), true);
  assert.equal(missingCodes.includes('POSTG_APP_W01_A03_SINGLE_FIXTURE_COVERAGE_INVALID'), true);

  const productionCase = structuredClone(materialized);
  productionCase.fixtures[0].productionAdmissionAllowed = true;
  const productionCodes = codes(validateW01ValidatorShadowRuntime(productionCase));
  assert.equal(productionCodes.includes('POSTG_APP_W01_A03_FIXTURE_EXPECTATION_MISMATCH'), true);
  assert.equal(productionCodes.includes('POSTG_APP_W01_A03_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});
