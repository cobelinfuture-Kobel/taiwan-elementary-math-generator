import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadPOSTGAPPMasterController,
  resolvePOSTGAPPWave,
  validatePOSTGAPPMasterController
} from '../../src/curriculum/application/postg-app-master-controller.mjs';
import { runPOSTGAPPM00Validation } from '../../tools/curriculum/validate-postg-app-m00-master-controller.mjs';

const controller = loadPOSTGAPPMasterController();
const codes = (result) => result.issues.map((row) => row.code);

test('M00 validates the exact 79-node source scope and six-wave queue', () => {
  const result = runPOSTGAPPM00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'WAVE01_IN_PROGRESS');
  assert.equal(result.consumerGate, true);
  assert.deepEqual(result.counts, {
    sourceNodeCount: 79,
    goldenBaselineUnitCount: 15,
    goldenBaselineSourceNodeCount: 16,
    remainingSourceNodeCount: 63,
    waveCount: 6,
    productionAdmittedApplicationUnitCount: 0
  });
});

test('S29C batch totals remain 13, 24, 17, 16 and 9', () => {
  assert.deepEqual(
    controller.unitRegistry.batches.map((row) => [row.batchId, row.sourceNodeIds.length]),
    [['A', 13], ['B', 24], ['C', 17], ['D', 16], ['E', 9]]
  );
  assert.equal(new Set(controller.sourceNodes.map((row) => row.sourceNodeId)).size, 79);
  assert.deepEqual(controller.sourceNodes.map((row) => row.queueOrdinal), Array.from({ length: 79 }, (_, index) => index + 1));
});

test('Wave 01 distinguishes 15 golden units from 16 source nodes', () => {
  const w01 = resolvePOSTGAPPWave(controller, 'W01');
  assert.equal(w01.goldenUnitIds.length, 15);
  assert.equal(w01.sourceNodes.length, 16);
  assert.equal(w01.productionSelectable, false);
  assert.equal(w01.currentState.state, 'ASSESSMENT_IN_PROGRESS');
  const composite = controller.unitRegistry.goldenBaselineUnits.find((row) => row.goldenUnitId === 'g5a_u02_5a02');
  assert.deepEqual(composite.sourceNodeRefs, ['g5a_u02_5a02a', 'g5a_u02_5a02a1']);
  assert.equal(composite.mappingType, 'EXPLICIT_COMPOSITE_GOLDEN_BASELINE');
});

test('all 15 golden KnowledgeOperation registries are present and validated', () => {
  assert.equal(controller.goldenRegistries.length, 15);
  for (const row of controller.goldenRegistries) {
    assert.equal(row.exists, true, row.registryPath);
    assert.equal(row.registry.sourceId, row.mapping.goldenUnitId);
    assert.equal(row.registry.conformanceState, 'GOLDEN_CONFORMANT');
    assert.equal(row.registry.knowledgeRegistryState, 'VALIDATED_COMPLETE');
  }
});

test('M00 consumes the exact M01 shadow context authority', () => {
  const result = validatePOSTGAPPMasterController(controller);
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.contextCounts.macroDomainCount, 16);
  assert.equal(result.contextCounts.mesoSituationCount, 48);
  assert.equal(result.contextCounts.microScenarioCount, 48);
  assert.equal(result.contextCounts.atomicEpisodeCount, 96);
  assert.equal(result.contextCounts.facetCount, 48);
  assert.equal(result.contextCounts.legacyFamilyMappingCount, 18);
  assert.equal(result.contextCounts.productionAdmittedNodeCount, 0);
});

test('W02 to W06 cover the remaining 63 nodes in deterministic source order', () => {
  const goldenSourceIds = new Set(controller.unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs));
  const expected = controller.sourceNodes.map((row) => row.sourceNodeId).filter((id) => !goldenSourceIds.has(id));
  const actual = controller.wavePlan.waves.slice(1).flatMap((row) => row.sourceNodeIds);
  assert.equal(actual.length, 63);
  assert.deepEqual(actual, expected);
  assert.deepEqual(controller.wavePlan.waves.map((row) => row.sourceNodeIds.length), [16, 13, 13, 13, 12, 12]);
});

test('admission gate order stays frozen while W01 progresses', () => {
  assert.deepEqual(controller.wavePlan.admissionGateOrder, [
    'SOURCE_NODE_REGISTERED',
    'KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED',
    'KP_APPLICATION_CLASSIFICATION_COMPLETE',
    'CANONICAL_OPERATION_MODEL_COMPLETE',
    'SINGLE_APPLICATION_ADMISSION_COMPLETE',
    'GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE',
    'N_PLUS_1_CONTRACT_COMPLETE',
    'VALIDATOR_CONTRACT_COMPLETE',
    'POSITIVE_NEGATIVE_FIXTURES_COMPLETE',
    'SHARED_RUNTIME_SHADOW_PASS',
    'PRODUCTION_ADMISSION_REVIEWED'
  ]);
  assert.deepEqual(controller.controllerState.waveStates.map((row) => row.state), [
    'ASSESSMENT_IN_PROGRESS',
    'QUEUED',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ]);
  assert.deepEqual(controller.controllerState.waveStates[0].completedGates, [
    'SOURCE_NODE_REGISTERED',
    'KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED',
    'KP_APPLICATION_CLASSIFICATION_COMPLETE',
    'CANONICAL_OPERATION_MODEL_COMPLETE'
  ]);
});

test('duplicate source nodes and premature production admissions fail closed', () => {
  const duplicateCase = structuredClone(controller);
  duplicateCase.sourceNodes[1].sourceNodeId = duplicateCase.sourceNodes[0].sourceNodeId;
  assert.equal(codes(validatePOSTGAPPMasterController(duplicateCase)).includes('POSTG_APP_SOURCE_NODE_DUPLICATED'), true);

  const productionCase = structuredClone(controller);
  productionCase.wavePlan.waves[0].productionAdmissionGranted = true;
  productionCase.controllerState.productionAdmission.applicationUnitCount = 1;
  const productionCodes = codes(validatePOSTGAPPMasterController(productionCase));
  assert.equal(productionCodes.includes('POSTG_APP_M00_PRODUCTION_WAVE_FORBIDDEN'), true);
  assert.equal(productionCodes.includes('POSTG_APP_M00_PRODUCTION_ADMISSION_FORBIDDEN'), true);
});

test('missing source coverage and altered wave order fail closed', () => {
  const missingCase = structuredClone(controller);
  missingCase.wavePlan.waves[5].sourceNodeIds.pop();
  const missingCodes = codes(validatePOSTGAPPMasterController(missingCase));
  assert.equal(missingCodes.includes('POSTG_APP_WAVE_SOURCE_COVERAGE_INVALID'), true);
  assert.equal(missingCodes.includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);

  const orderCase = structuredClone(controller);
  [orderCase.wavePlan.waves[1].sourceNodeIds[0], orderCase.wavePlan.waves[1].sourceNodeIds[1]] = [
    orderCase.wavePlan.waves[1].sourceNodeIds[1],
    orderCase.wavePlan.waves[1].sourceNodeIds[0]
  ];
  assert.equal(codes(validatePOSTGAPPMasterController(orderCase)).includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);
});

test('unknown completed gate fails closed', () => {
  const changed = structuredClone(controller);
  changed.controllerState.waveStates[0].completedGates.push('UNKNOWN_GATE');
  assert.equal(codes(validatePOSTGAPPMasterController(changed)).includes('POSTG_APP_CONTROLLER_COMPLETED_GATE_UNKNOWN'), true);
});
