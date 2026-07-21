import assert from 'node:assert/strict';
import test from 'node:test';

import {
  materializeW01AtomicContextSingleApplicationCandidatePack,
  validateW01AtomicContextSingleApplicationCandidatePack
} from '../../src/curriculum/application/w01-atomic-context-single-application-candidate-pack.mjs';
import { runPOSTGAPPW01A01Validation } from '../../tools/curriculum/validate-postg-app-w01-a01-candidate-pack.mjs';

const materialized = materializeW01AtomicContextSingleApplicationCandidatePack();
const codes = (result) => result.issues.map((row) => row.code);

test('W01-A01 creates exactly one candidate for every suitable KnowledgePoint', () => {
  const result = runPOSTGAPPW01A01Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_W01_A01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_READY');
  assert.equal(result.consumerGate, true);
  assert.equal(result.deterministicSecondPassEqual, true);
  assert.equal(result.counts.candidateCount, result.counts.suitableKnowledgePointCount);
  assert.equal(result.counts.uniqueCandidateIdentityCount, result.counts.candidateCount);
  assert.equal(result.counts.productionAdmittedCandidateCount, 0);
});

test('all 16 Macro Context Domains are connected to Wave 01 candidates', () => {
  const validation = validateW01AtomicContextSingleApplicationCandidatePack(materialized);
  assert.equal(validation.counts.globalMacroDomainCount, 16);
  assert.equal(validation.macroCoverage.length, 16);
  assert.deepEqual(validation.macroCoverage, [
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
  ]);
});

test('units with at least three candidates use at least three Macro Context Domains', () => {
  const validation = validateW01AtomicContextSingleApplicationCandidatePack(materialized);
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

test('all mathematical operand roles remain traceable through given or target candidates', () => {
  for (const candidate of materialized.candidates) {
    const key = `${candidate.sourceId}::${candidate.knowledgePointId}::${candidate.canonicalOperationModelId}`;
    const model = materialized.operationIndexes.operationModels.get(key);
    const expected = Object.keys(model.operandRoles).sort();
    const actual = [...new Set([
      ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
      ...candidate.targetRoleCandidate.sourceMathRoleIds.filter((roleId) => roleId in model.operandRoles)
    ])].sort();
    assert.deepEqual(actual, expected, candidate.bindingCandidateId);
    assert.equal(candidate.primaryTargetCount, 1);
    assert.equal(candidate.targetRoleCandidate.isAnswerRole, true);
  }
});

test('existing G3B-U01 pilot lineage maps explicitly into M01 Atomic Task Episodes', () => {
  const direct = materialized.candidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_quotative_division'
  ));
  const nPlusOne = materialized.candidates.find((row) => (
    row.sourceId === 'g3b_u01_3b01'
    && row.knowledgePointId === 'kp_g3b_u01_wp_remainder_interpretation'
  ));
  assert.equal(direct.lineage.existingPilotBindingId, 'appctx_g3b_u01_direct_school_grouping_001');
  assert.equal(direct.contextSelection.selectionReason, 'EXISTING_PILOT_LEGACY_MAPPING');
  assert.equal(direct.contextSelection.atomicEpisodeId.includes('classroom_shared_resources'), true);
  assert.equal(nPlusOne.lineage.existingPilotBindingId, 'appctx_g3b_u01_n1_transit_capacity_001');
  assert.equal(nPlusOne.applicationMode, 'SINGLE_N_PLUS_1');
  assert.equal(nPlusOne.contextSelection.atomicEpisodeId.includes('student_vehicle_allocation'), true);
});

test('excluded KnowledgePoints receive no candidate and no forced story', () => {
  const excludedKeys = new Set(
    materialized.assessment.records
      .filter((row) => row.classification === 'APPLICATION_NOT_APPLICABLE')
      .map((row) => `${row.sourceId}::${row.knowledgePointId}`)
  );
  assert.equal(materialized.candidates.some((row) => excludedKeys.has(`${row.sourceId}::${row.knowledgePointId}`)), false);
});

test('candidate pack remains a blueprint rather than an instantiated or production item', () => {
  assert.equal(materialized.candidates.every((row) => row.promptBlueprint.fullyInstantiated === false), true);
  assert.equal(materialized.candidates.every((row) => row.answerModelCandidate.numericAnswerInstantiated === false), true);
  assert.equal(materialized.candidates.every((row) => row.admissionStatus === 'CONTEXT_BOUND_CANDIDATE'), true);
  assert.equal(materialized.candidates.every((row) => row.productionAdmissionAllowed === false), true);
});

test('ineligible Atomic Episode and incomplete role coverage fail closed', () => {
  const episodeCase = structuredClone(materialized);
  episodeCase.candidates[0].contextSelection.atomicEpisodeId = 'gctx_episode_not_eligible';
  assert.equal(codes(validateW01AtomicContextSingleApplicationCandidatePack(episodeCase)).includes('POSTG_APP_W01_A01_ATOMIC_EPISODE_NOT_ELIGIBLE'), true);

  const roleCase = structuredClone(materialized);
  roleCase.candidates[0].roleBindingCandidates.pop();
  assert.equal(codes(validateW01AtomicContextSingleApplicationCandidatePack(roleCase)).includes('POSTG_APP_W01_A01_MATH_ROLE_COVERAGE_INCOMPLETE'), true);
});

test('macro diversity and production admission failures are blocking', () => {
  const diversityCase = structuredClone(materialized);
  const firstMacro = diversityCase.candidates[0].contextSelection.macroContextId;
  for (const candidate of diversityCase.candidates) candidate.contextSelection.macroContextId = firstMacro;
  assert.equal(codes(validateW01AtomicContextSingleApplicationCandidatePack(diversityCase)).includes('POSTG_APP_W01_A01_GLOBAL_MACRO_DIVERSITY_INSUFFICIENT'), true);

  const productionCase = structuredClone(materialized);
  productionCase.candidates[0].productionAdmissionAllowed = true;
  assert.equal(codes(validateW01AtomicContextSingleApplicationCandidatePack(productionCase)).includes('POSTG_APP_W01_A01_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});
