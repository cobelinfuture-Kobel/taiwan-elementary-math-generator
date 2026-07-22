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

const REQUIRED_GATES = [
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
];

test('M00 validates the exact 79-node scope with W01 admitted and W02 ready', () => {
  const result = runPOSTGAPPM00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W02_ASSESSMENT_READY');
  assert.equal(result.consumerGate, true);
  assert.deepEqual(result.counts, {
    sourceNodeCount: 79,
    goldenBaselineUnitCount: 15,
    goldenBaselineSourceNodeCount: 16,
    remainingSourceNodeCount: 63,
    waveCount: 6,
    productionAdmittedApplicationUnitCount: 12
  });
  assert.equal(result.currentWaveId, 'W02');
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A00_13SourceNodeApplicationCapabilityAssessmentAndAdmissionBaseline');
});

test('S29C batch totals remain 13, 24, 17, 16 and 9', () => {
  assert.deepEqual(controller.unitRegistry.batches.map((row) => [row.batchId, row.sourceNodeIds.length]), [['A', 13], ['B', 24], ['C', 17], ['D', 16], ['E', 9]]);
  assert.equal(new Set(controller.sourceNodes.map((row) => row.sourceNodeId)).size, 79);
  assert.deepEqual(controller.sourceNodes.map((row) => row.queueOrdinal), Array.from({ length: 79 }, (_, index) => index + 1));
});

test('Wave 01 distinguishes 15 golden units from 16 source nodes and is production admitted', () => {
  const w01 = resolvePOSTGAPPWave(controller, 'W01');
  assert.equal(w01.goldenUnitIds.length, 15);
  assert.equal(w01.sourceNodes.length, 16);
  assert.equal(w01.productionSelectable, false);
  assert.equal(w01.productionAdmissionGranted, true);
  assert.equal(w01.currentState.state, 'PRODUCTION_ADMITTED');
  assert.equal(w01.currentState.reviewDecision, 'APPROVE');
  assert.equal(w01.currentState.productionAdmissionGranted, true);
  const composite = controller.unitRegistry.goldenBaselineUnits.find((row) => row.goldenUnitId === 'g5a_u02_5a02');
  assert.deepEqual(composite.sourceNodeRefs, ['g5a_u02_5a02a', 'g5a_u02_5a02a1']);
  assert.equal(composite.mappingType, 'EXPLICIT_COMPOSITE_GOLDEN_BASELINE');
});

test('Wave 02 is the sole assessment-ready wave', () => {
  const w02 = resolvePOSTGAPPWave(controller, 'W02');
  assert.equal(w02.sourceNodes.length, 13);
  assert.equal(w02.productionAdmissionGranted, false);
  assert.equal(w02.currentState.state, 'ASSESSMENT_READY');
  assert.deepEqual(w02.currentState.completedGates, REQUIRED_GATES.slice(0, 2));
  assert.equal(w02.currentState.admissionGateComplete, false);
});

test('all 15 golden KnowledgeOperation registries remain present and validated', () => {
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

test('W01 admission is backed by the explicit operator approval and E5 claim', () => {
  assert.equal(controller.approvalDecision.operatorDecision, 'APPROVE');
  assert.equal(controller.approvalDecision.productionAdmission.granted, true);
  assert.equal(controller.approvalDecision.productionAdmission.publicRouteChanged, false);
  assert.equal(controller.w01Claim.actualEvidenceLevel, 'E5_PRODUCTION_ADMITTED');
  assert.equal(controller.w01Claim.claims.productionAdmitted, true);
  assert.equal(controller.w01Claim.claims.d0Complete, false);
  assert.deepEqual(controller.controllerState.waveStates[0].completedGates, REQUIRED_GATES);
  assert.deepEqual(controller.controllerState.productionAdmission.admittedWaveIds, ['W01']);
  assert.equal(controller.controllerState.productionAdmission.applicationUnitCount, 12);
  assert.equal(controller.controllerState.productionAdmission.waveCount, 1);
  assert.equal(controller.controllerState.productionAdmission.allowed, true);
  assert.equal(controller.controllerState.productionAdmission.lastReviewDecision, 'APPROVE');
});

test('duplicate source nodes and non-contiguous production admissions fail closed', () => {
  const duplicateCase = structuredClone(controller);
  duplicateCase.sourceNodes[1].sourceNodeId = duplicateCase.sourceNodes[0].sourceNodeId;
  assert.equal(codes(validatePOSTGAPPMasterController(duplicateCase)).includes('POSTG_APP_SOURCE_NODE_DUPLICATED'), true);

  const productionCase = structuredClone(controller);
  productionCase.wavePlan.waves[2].productionAdmissionGranted = true;
  productionCase.wavePlan.coverage.productionAdmittedWaveCount = 2;
  const productionCodes = codes(validatePOSTGAPPMasterController(productionCase));
  assert.equal(productionCodes.includes('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID'), true);
});

test('forged approval and mismatched controller counts fail closed', () => {
  const approvalCase = structuredClone(controller);
  approvalCase.approvalDecision.operatorDecision = 'REJECT';
  assert.equal(codes(validatePOSTGAPPMasterController(approvalCase)).includes('POSTG_APP_W01_OPERATOR_APPROVAL_EVIDENCE_INVALID'), true);

  const countCase = structuredClone(controller);
  countCase.controllerState.productionAdmission.applicationUnitCount = 13;
  assert.equal(codes(validatePOSTGAPPMasterController(countCase)).includes('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID'), true);
});

test('missing source coverage and altered wave order fail closed', () => {
  const missingCase = structuredClone(controller);
  missingCase.wavePlan.waves[5].sourceNodeIds.pop();
  const missingCodes = codes(validatePOSTGAPPMasterController(missingCase));
  assert.equal(missingCodes.includes('POSTG_APP_WAVE_SOURCE_COVERAGE_INVALID'), true);
  assert.equal(missingCodes.includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);

  const orderCase = structuredClone(controller);
  [orderCase.wavePlan.waves[1].sourceNodeIds[0], orderCase.wavePlan.waves[1].sourceNodeIds[1]] = [orderCase.wavePlan.waves[1].sourceNodeIds[1], orderCase.wavePlan.waves[1].sourceNodeIds[0]];
  assert.equal(codes(validatePOSTGAPPMasterController(orderCase)).includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);
});

test('unknown completed gate fails closed', () => {
  const changed = structuredClone(controller);
  changed.controllerState.waveStates[0].completedGates.push('UNKNOWN_GATE');
  assert.equal(codes(validatePOSTGAPPMasterController(changed)).includes('POSTG_APP_W01_PRODUCTION_ADMISSION_STATE_INVALID'), true);
});
