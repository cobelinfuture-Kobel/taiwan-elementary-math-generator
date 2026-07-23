import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW02AtomicContextSingleApplicationCandidatePack,
  validateW02AtomicContextSingleApplicationCandidatePack
} from '../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs';
import { runPOSTGAPPW02A02Validation } from '../../tools/curriculum/validate-postg-app-w02-a02-candidate-pack.mjs';

const materialized = materializeW02AtomicContextSingleApplicationCandidatePack();
const codes = (result) => result.issues.map((row) => row.code);

const EXPECTED_MACROS = [
  'gctx_macro_charity_cooperation',
  'gctx_macro_commerce_budget',
  'gctx_macro_community_civic',
  'gctx_macro_culture_history',
  'gctx_macro_data_public_information',
  'gctx_macro_disaster_resilience',
  'gctx_macro_environment_conservation',
  'gctx_macro_food_agriculture',
  'gctx_macro_future_sustainability',
  'gctx_macro_health_sports',
  'gctx_macro_household_family',
  'gctx_macro_school_learning',
  'gctx_macro_science_technology',
  'gctx_macro_transport_mobility',
  'gctx_macro_water_energy',
  'gctx_macro_work_logistics'
];

test('W02-A02 materializes one atomic binding and candidate per application PatternSpec', () => {
  const result = runPOSTGAPPW02A02Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W02_A02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_READY');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.deepEqual(result.counts, {
    applicationPatternSpecCount: 61,
    atomicContextBindingCount: 61,
    singleApplicationCandidateCount: 61,
    uniqueCandidateIdentityCount: 61,
    globalMacroDomainCount: 16,
    duplicateContentProjectionGroupCount: 1,
    preferredProfileFallbackCount: 0,
    productionAdmittedCandidateCount: 0
  });
});

test('all 16 Macro Context Domains are connected', () => {
  const validation = validateW02AtomicContextSingleApplicationCandidatePack(materialized);
  assert.equal(validation.counts.globalMacroDomainCount, 16);
  assert.deepEqual(validation.macroCoverage, EXPECTED_MACROS);
});

test('units with at least three candidates use at least three Macro Context Domains', () => {
  const validation = validateW02AtomicContextSingleApplicationCandidatePack(materialized);
  for (const unit of validation.unitDiversity) {
    assert.equal(
      unit.macroDomainCount >= unit.requiredMacroDomainCount,
      true,
      `${unit.sourceId}: ${unit.macroDomainCount}/${unit.requiredMacroDomainCount}`
    );
  }
});

test('every candidate closes the M01 hierarchy and surface chain', () => {
  for (const candidate of materialized.candidates) {
    const chain = materialized.contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
    assert.equal(Boolean(chain), true, candidate.bindingCandidateId);
    assert.equal(chain.macro.nodeId, candidate.contextSelection.macroContextId);
    assert.equal(chain.meso.nodeId, candidate.contextSelection.mesoSituationId);
    assert.equal(chain.micro.nodeId, candidate.contextSelection.microScenarioId);
    assert.equal(chain.episode.surfaceTemplateRefs.includes(candidate.contextSelection.surfaceTemplateId), true);
    assert.equal(candidate.contextSelection.facetRefs.length >= 2, true);
  }
});

test('all operation roles remain traceable through given and target bindings', () => {
  const rowBySpec = new Map(materialized.applicationPatternRows.map((row) => [row.patternSpec.patternSpecId, row]));
  for (const candidate of materialized.candidates) {
    const source = rowBySpec.get(candidate.patternSpecId);
    const expected = Object.keys(source.operationModel.operandRoles).sort();
    const actual = [...new Set([
      ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
      ...candidate.targetRoleCandidate.sourceMathRoleIds
    ])].sort();
    assert.deepEqual(actual, expected, candidate.bindingCandidateId);
    assert.equal(candidate.requestedUnknownRole, source.patternSpec.requestedUnknownRole);
    assert.equal(candidate.primaryTargetCount, 1);
  }
});

test('duplicate PDF source nodes preserve the same normalized context projection', () => {
  const validation = validateW02AtomicContextSingleApplicationCandidatePack(materialized);
  assert.equal(validation.duplicateComparisons.length, 1);
  assert.equal(validation.duplicateComparisons[0].contentIdentityGroup, 'pdf_5ba57aff6a97');
  assert.deepEqual(validation.duplicateComparisons[0].sourceIds, ['g4a_u06_4a06', 'g4b_u03_4b03']);
  assert.equal(validation.duplicateComparisons[0].equal, true);
});

test('candidate pack remains hidden, non-instantiated and non-production', () => {
  assert.equal(materialized.candidates.every((row) => row.applicationMode === 'SINGLE_DIRECT'), true);
  assert.equal(materialized.candidates.every((row) => row.promptBlueprint.fullyInstantiated === false), true);
  assert.equal(materialized.candidates.every((row) => row.answerModelCandidate.numericAnswerInstantiated === false), true);
  assert.equal(materialized.candidates.every((row) => row.admissionStatus === 'CONTEXT_BOUND_CANDIDATE'), true);
  assert.equal(materialized.candidates.every((row) => row.productionAdmissionAllowed === false), true);
});

test('broken context, role coverage, duplicate parity and production boundary fail closed', () => {
  const contextCase = structuredClone(materialized);
  contextCase.candidates[0].contextSelection.atomicEpisodeId = 'gctx_episode_not_found';
  assert.equal(codes(validateW02AtomicContextSingleApplicationCandidatePack(contextCase)).includes('POSTG_APP_W02_A02_CONTEXT_CHAIN_INVALID'), true);

  const roleCase = structuredClone(materialized);
  roleCase.candidates[0].roleBindingCandidates.pop();
  assert.equal(codes(validateW02AtomicContextSingleApplicationCandidatePack(roleCase)).includes('POSTG_APP_W02_A02_MATH_ROLE_COVERAGE_INCOMPLETE'), true);

  const duplicateCase = structuredClone(materialized);
  const duplicateCandidates = duplicateCase.candidates.filter((row) => row.sourceContentIdentityGroup === 'pdf_5ba57aff6a97');
  duplicateCandidates.at(-1).contextSelection.atomicEpisodeId = duplicateCandidates[0].contextSelection.atomicEpisodeId;
  duplicateCandidates.at(-1).contextSelection.surfaceTemplateId = duplicateCandidates[0].contextSelection.surfaceTemplateId;
  assert.equal(codes(validateW02AtomicContextSingleApplicationCandidatePack(duplicateCase)).includes('POSTG_APP_W02_A02_DUPLICATE_CONTENT_PROJECTION_INVALID'), true);

  const productionCase = structuredClone(materialized);
  productionCase.candidates[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW02AtomicContextSingleApplicationCandidatePack(productionCase)).includes('POSTG_APP_W02_A02_PRODUCTION_OR_MODE_BOUNDARY_INVALID'), true);
});
