import assert from 'node:assert/strict';
import test from 'node:test';

import {
  executeW02ValidatorShadowRuntime,
  materializeW02ValidatorShadowFixtures,
  validateW02ShadowFixture,
  validateW02ValidatorShadowRuntime
} from '../../src/curriculum/application/w02-validator-fixture-shadow-runtime.mjs';
import { runPOSTGAPPW02A04Validation } from '../../tools/curriculum/validate-postg-app-w02-a04-runtime-shadow.mjs';

const materialized = materializeW02ValidatorShadowFixtures();
const codes = (result) => result.issues.map((row) => row.code);
const fixturesOfType = (fixtureType) => materialized.fixtures.filter((row) => row.fixtureType === fixtureType);

test('W02-A04 executes the exact 672-fixture shared shadow matrix', () => {
  const result = runPOSTGAPPW02A04Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W02_A04_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W02_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_PASS');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.deepEqual(result.counts, {
    candidateCount: 61,
    nPlusOneProofCount: 61,
    misconceptionCandidateCount: 183,
    pblCandidateCount: 31,
    fixtureCount: 672,
    positiveFixtureCount: 275,
    negativeFixtureCount: 397,
    passCount: 275,
    expectedRejectCount: 397,
    unexpectedPassCount: 0,
    unexpectedRejectCount: 0,
    pairedNPlusOneExecutionCount: 61,
    misconceptionExecutionCount: 183,
    calculationPassInterpretationFailCount: 122,
    counterfactualExecutionCount: 61,
    crossContextExecutionCount: 61,
    uniquenessNegativeExecutionCount: 61,
    pblDependencyExecutionCount: 62,
    sourceNodeCoverageCount: 13,
    primaryMacroContextCoverageCount: 16,
    alternateMacroContextCoverageCount: result.counts.alternateMacroContextCoverageCount,
    operationFamilyCoverageCount: result.counts.operationFamilyCoverageCount,
    answerShapeCoverageCount: result.counts.answerShapeCoverageCount,
    adapterCoverageCount: result.counts.adapterCoverageCount,
    duplicateFixtureProjectionGroupCount: 1,
    productionAdmittedCount: 0
  });
});

test('fixture type counts implement the approved minimal matrix', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(validateW02ValidatorShadowRuntime(materialized).fixtureTypeCounts).sort()),
    Object.fromEntries(Object.entries({
      POSITIVE_SINGLE_APPLICATION: 61,
      NEGATIVE_WRONG_ANSWER_ROLE: 61,
      NEGATIVE_UNIT_MISMATCH: 61,
      POSITIVE_N_PLUS_ONE_INTERPRETATION: 61,
      NEGATIVE_MISCONCEPTION: 183,
      POSITIVE_COUNTERFACTUAL_INTERPRETATION: 61,
      POSITIVE_CROSS_CONTEXT_INTERPRETATION: 61,
      NEGATIVE_NON_UNIQUE_ANSWER_WITNESS: 61,
      POSITIVE_PBL_DEPENDENCY_GRAPH: 31,
      NEGATIVE_PBL_DEPENDENCY_BROKEN: 31
    }).sort())
  );
});

test('all runtime results match their positive or fail-closed expectation', () => {
  const results = executeW02ValidatorShadowRuntime(materialized);
  assert.equal(results.length, 672);
  assert.equal(results.every((row) => row.expectationMatched), true);
  assert.equal(results.filter((row) => row.actual.pass).length, 275);
  assert.equal(results.filter((row) => !row.actual.pass).length, 397);
});

test('every N+1 positive fixture is paired to the same numeric N fixture', () => {
  const byId = new Map(materialized.fixtures.map((row) => [row.fixtureId, row]));
  for (const fixture of fixturesOfType('POSITIVE_N_PLUS_ONE_INTERPRETATION')) {
    const base = byId.get(fixture.pairingEvidence.baseFixtureId);
    assert.equal(Boolean(base), true, fixture.fixtureId);
    assert.equal(base.fixtureType, 'POSITIVE_SINGLE_APPLICATION');
    assert.deepEqual(base.calculationWitness.inputValues, fixture.calculationWitness.inputValues);
    assert.deepEqual(base.answerPayload, fixture.answerPayload);
    assert.equal(fixture.pairingEvidence.sameNumericPrerequisites, true);
    assert.equal(fixture.pairingEvidence.sameNumberDomain, true);
    assert.equal(fixture.pairingEvidence.semanticDeltaOnly, true);
  }
});

test('all 183 misconception candidates execute with diagnostic separation', () => {
  const results = executeW02ValidatorShadowRuntime(materialized)
    .filter((row) => row.fixtureType === 'NEGATIVE_MISCONCEPTION');
  assert.equal(results.length, 183);
  assert.equal(new Set(materialized.fixtures
    .filter((row) => row.fixtureType === 'NEGATIVE_MISCONCEPTION')
    .map((row) => row.misconceptionEvidence.misconceptionId)).size, 183);
  assert.equal(results.filter((row) => row.actual.calculationPass === false).length, 61);
  assert.equal(results.filter((row) => row.actual.calculationPass === true && row.actual.interpretationPass === false).length, 122);
  assert.equal(results.every((row) => row.actual.pass === false && row.actual.errorCode !== null), true);
});

test('counterfactual and cross-context proof candidates execute for every proof', () => {
  const counterfactuals = fixturesOfType('POSITIVE_COUNTERFACTUAL_INTERPRETATION');
  const crossContexts = fixturesOfType('POSITIVE_CROSS_CONTEXT_INTERPRETATION');
  assert.equal(counterfactuals.length, 61);
  assert.equal(crossContexts.length, 61);
  assert.equal(counterfactuals.every((row) => row.interpretationEvidence.counterfactualApplied), true);
  for (const fixture of crossContexts) {
    const candidate = materialized.a03.candidateByPatternSpecId.get(fixture.patternSpecId);
    assert.equal(fixture.contextMode, 'ALTERNATE');
    assert.notEqual(fixture.contextLineage.macroContextId, candidate.contextSelection.macroContextId);
    assert.equal(fixture.interpretationEvidence.crossContextApplied, true);
  }
});

test('uniqueness and PBL dependency negatives reject without production admission', () => {
  const uniqueNegatives = fixturesOfType('NEGATIVE_NON_UNIQUE_ANSWER_WITNESS');
  assert.equal(uniqueNegatives.length, 61);
  assert.equal(uniqueNegatives.every((row) => row.uniquenessEvidence.answerCardinality === 2), true);
  assert.equal(uniqueNegatives.every((row) => validateW02ShadowFixture(materialized, row).errorCode === 'ANSWER_NOT_UNIQUE'), true);

  const pblPositive = fixturesOfType('POSITIVE_PBL_DEPENDENCY_GRAPH');
  const pblNegative = fixturesOfType('NEGATIVE_PBL_DEPENDENCY_BROKEN');
  assert.equal(pblPositive.length, 31);
  assert.equal(pblNegative.length, 31);
  assert.equal(pblPositive.every((row) => validateW02ShadowFixture(materialized, row).pass), true);
  assert.equal(pblNegative.every((row) => validateW02ShadowFixture(materialized, row).errorCode === 'PBL_DEPENDENCY_INVALID'), true);
});

test('duplicate PDF fixture projection preserves normalized parity', () => {
  const result = validateW02ValidatorShadowRuntime(materialized);
  assert.equal(result.duplicateComparisons.length, 1);
  assert.equal(result.duplicateComparisons[0].contentIdentityGroup, 'pdf_5ba57aff6a97');
  assert.deepEqual(result.duplicateComparisons[0].sourceIds, ['g4a_u06_4a06', 'g4b_u03_4b03']);
  assert.equal(result.duplicateComparisons[0].equal, true);
});

test('lineage, numeric witness, cross-context and production mutations fail closed', () => {
  const positive = structuredClone(fixturesOfType('POSITIVE_SINGLE_APPLICATION')[0]);
  positive.bindingCandidateId = `${positive.bindingCandidateId}_wrong`;
  assert.equal(validateW02ShadowFixture(materialized, positive).errorCode, 'CANDIDATE_LINEAGE_INVALID');

  const numeric = structuredClone(fixturesOfType('POSITIVE_SINGLE_APPLICATION')[0]);
  numeric.answerPayload = typeof numeric.answerPayload === 'number' ? numeric.answerPayload + 7 : { wrong: true };
  assert.equal(validateW02ShadowFixture(materialized, numeric).errorCode, 'SHADOW_NUMERIC_WITNESS_INVALID');

  const cross = structuredClone(fixturesOfType('POSITIVE_CROSS_CONTEXT_INTERPRETATION')[0]);
  const candidate = materialized.a03.candidateByPatternSpecId.get(cross.patternSpecId);
  cross.contextLineage.macroContextId = candidate.contextSelection.macroContextId;
  assert.equal(validateW02ShadowFixture(materialized, cross).errorCode, 'CONTEXT_CHAIN_INVALID');

  const production = structuredClone(fixturesOfType('POSITIVE_SINGLE_APPLICATION')[0]);
  production.productionAdmissionAllowed = true;
  assert.equal(validateW02ShadowFixture(materialized, production).errorCode, 'PRODUCTION_ADMISSION_FORBIDDEN');
});

test('missing fixture and corrupted PBL positive fail aggregate and runtime gates', () => {
  const missing = { ...materialized, fixtures: structuredClone(materialized.fixtures) };
  missing.fixtures.pop();
  assert.equal(codes(validateW02ValidatorShadowRuntime(missing)).includes('POSTG_APP_W02_A04_FIXTURE_COUNT_MISMATCH'), true);

  const pbl = structuredClone(fixturesOfType('POSITIVE_PBL_DEPENDENCY_GRAPH')[0]);
  pbl.pblEvidence.dependencies[1].inputRefs = [];
  assert.equal(validateW02ShadowFixture(materialized, pbl).errorCode, 'PBL_DEPENDENCY_INVALID');
});
