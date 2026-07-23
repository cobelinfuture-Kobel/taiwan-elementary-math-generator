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

const A08 = 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission';
const A07_READY = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';

test('M00 validates the exact 79-node scope with W01 admitted and W02 A07 human review ready', () => {
  const result = runPOSTGAPPM00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, A07_READY);
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
  assert.equal(result.nextShortestStep, A08);
});

test('S29C batch totals and deterministic 79-node order remain unchanged', () => {
  assert.deepEqual(
    controller.unitRegistry.batches.map((row) => [row.batchId, row.sourceNodeIds.length]),
    [['A', 13], ['B', 24], ['C', 17], ['D', 16], ['E', 9]]
  );
  assert.equal(new Set(controller.sourceNodes.map((row) => row.sourceNodeId)).size, 79);
  assert.deepEqual(controller.sourceNodes.map((row) => row.queueOrdinal), Array.from({ length: 79 }, (_, index) => index + 1));
});

test('Wave 01 remains production admitted without public selection', () => {
  const w01 = resolvePOSTGAPPWave(controller, 'W01');
  assert.equal(w01.goldenUnitIds.length, 15);
  assert.equal(w01.sourceNodes.length, 16);
  assert.equal(w01.productionSelectable, false);
  assert.equal(w01.productionAdmissionGranted, true);
  assert.equal(w01.currentState.state, 'PRODUCTION_ADMITTED');
  assert.equal(w01.currentState.reviewDecision, 'APPROVE');
  assert.deepEqual(w01.currentState.completedGates, REQUIRED_GATES);
  const composite = controller.unitRegistry.goldenBaselineUnits.find((row) => row.goldenUnitId === 'g5a_u02_5a02');
  assert.deepEqual(composite.sourceNodeRefs, ['g5a_u02_5a02a', 'g5a_u02_5a02a1']);
});

test('Wave 02 is A07 human-review-ready while admission and public selection remain false', () => {
  const w02 = resolvePOSTGAPPWave(controller, 'W02');
  const state = w02.currentState;
  assert.equal(w02.sourceNodes.length, 13);
  assert.equal(w02.productionAdmissionGranted, false);
  assert.equal(w02.productionSelectable, false);
  assert.equal(state.state, A07_READY);
  assert.deepEqual(state.completedGates, REQUIRED_GATES.slice(0, 10));
  assert.equal(state.admissionGateComplete, false);
  assert.equal(state.productionAdmissionGranted, false);
  assert.equal(state.reviewDecision, 'NOT_STARTED');
  assert.equal(state.productionEquivalentOutputVerified, true);
  assert.equal(state.humanReviewReady, true);
  assert.equal(state.humanReviewEvidence, 'docs/curriculum/output/POSTG_APP_W02_A07_E4_HUMAN_REVIEW_EVIDENCE.json');
  assert.equal(state.humanReviewArtifactHashCount, 9);
  assert.equal(state.humanReviewApplicationQuestionCount, 61);
  assert.equal(state.humanReviewPblTaskSetCount, 31);
  assert.equal(state.humanReviewNumericBoundaryCount, 49);
  assert.equal(state.humanReviewMacroContextCount, 16);
  assert.equal(state.humanReviewPersistentArtifactProvider, 'google_drive');
  assert.equal(state.humanReviewPersistentArtifactId, '1MoK94otZr5hVPdSjX70M-V5pbREbS3dU');
  assert.equal(state.productionAdmittedCandidateCount, 0);
  assert.equal(state.publicSelectableCandidateCount, 0);
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
  assert.deepEqual(result.contextCounts, {
    macroDomainCount: 16,
    mesoSituationCount: 48,
    microScenarioCount: 48,
    atomicEpisodeCount: 96,
    facetCount: 48,
    legacyFamilyMappingCount: 18,
    productionAdmittedNodeCount: 0
  });
});

test('W02 to W06 cover the remaining 63 nodes in deterministic source order', () => {
  const goldenSourceIds = new Set(controller.unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs));
  const expected = controller.sourceNodes.map((row) => row.sourceNodeId).filter((id) => !goldenSourceIds.has(id));
  const actual = controller.wavePlan.waves.slice(1).flatMap((row) => row.sourceNodeIds);
  assert.equal(actual.length, 63);
  assert.deepEqual(actual, expected);
  assert.deepEqual(controller.wavePlan.waves.map((row) => row.sourceNodeIds.length), [16, 13, 13, 13, 12, 12]);
});

test('W01 stays E5, W02 A00-A05 stay E3, A06 and A07 stay non-production E4', () => {
  assert.equal(controller.approvalDecision.operatorDecision, 'APPROVE');
  assert.equal(controller.w01Claim.actualEvidenceLevel, 'E5_PRODUCTION_ADMITTED');
  assert.equal(controller.w01Claim.claims.productionAdmitted, true);
  for (const claim of [
    controller.w02A00Claim,
    controller.w02A01AClaim,
    controller.w02A01BClaim,
    controller.w02A01CClaim,
    controller.w02A01DClaim,
    controller.w02A02Claim,
    controller.w02A03Claim,
    controller.w02A04Claim,
    controller.w02A05Claim
  ]) {
    assert.equal(claim.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');
    assert.equal(claim.claims.productionAdmitted, false);
    assert.equal(claim.claims.d0Complete, false);
  }
  assert.equal(controller.w02A06Claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
  assert.equal(controller.w02A06Claim.claims.humanReviewReady, false);
  assert.equal(controller.w02A07Claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
  assert.equal(controller.w02A07Claim.claimedStatus, A07_READY);
  assert.equal(controller.w02A07Claim.claims.visibleOutputChanged, true);
  assert.equal(controller.w02A07Claim.claims.humanReviewReady, true);
  assert.equal(controller.w02A07Claim.claims.productionAdmitted, false);
  assert.equal(controller.w02A07Claim.nextStep.taskId, A08);
});

test('A07 evidence preserves exact-head CI, complete coverage and fail-closed boundary', () => {
  const evidence = controller.w02A07Evidence;
  assert.equal(evidence.status, A07_READY);
  assert.equal(evidence.evidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
  assert.equal(evidence.exactHeadSha, '63b8356c129a8c09fd3df66a433601baaf17d3bf');
  assert.equal(evidence.githubActions.workflowConclusion, 'success');
  assert.equal(evidence.githubActions.workflowRunId, 29989017841);
  assert.equal(evidence.githubActions.artifactId, 8556260550);
  assert.equal(evidence.persistentArtifact.storageProvider, 'google_drive');
  assert.equal(evidence.persistentArtifact.fileId, '1MoK94otZr5hVPdSjX70M-V5pbREbS3dU');
  assert.equal(evidence.coverage.sourceNodeCount, 13);
  assert.equal(evidence.coverage.macroContextCount, 16);
  assert.equal(evidence.coverage.applicationReviewCount, 61);
  assert.equal(evidence.coverage.pblReviewCount, 31);
  assert.equal(evidence.coverage.numericBoundaryReviewCount, 49);
  assert.equal(evidence.artifactHashes.length, 9);
  assert.equal(evidence.failClosedBoundary.operatorDecisionRecorded, false);
  assert.equal(evidence.failClosedBoundary.reviewDecision, 'NOT_STARTED');
  assert.equal(evidence.failClosedBoundary.productionAdmissionGranted, false);
  assert.equal(evidence.failClosedBoundary.publicSelectable, false);
});

test('duplicate nodes and non-contiguous admissions fail closed', () => {
  const duplicateCase = structuredClone(controller);
  duplicateCase.sourceNodes[1].sourceNodeId = duplicateCase.sourceNodes[0].sourceNodeId;
  assert.equal(codes(validatePOSTGAPPMasterController(duplicateCase)).includes('POSTG_APP_SOURCE_NODE_DUPLICATED'), true);

  const productionCase = structuredClone(controller);
  productionCase.wavePlan.waves[2].productionAdmissionGranted = true;
  productionCase.wavePlan.coverage.productionAdmittedWaveCount = 2;
  assert.equal(codes(validatePOSTGAPPMasterController(productionCase)).includes('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID'), true);
});

test('forged approval, claims, A07 evidence and controller state fail closed', () => {
  const approvalCase = structuredClone(controller);
  approvalCase.approvalDecision.operatorDecision = 'REJECT';
  assert.equal(codes(validatePOSTGAPPMasterController(approvalCase)).includes('POSTG_APP_W01_OPERATOR_APPROVAL_EVIDENCE_INVALID'), true);

  const claimCases = [
    ['w02A00Claim', 'POSTG_APP_W02_A00_CLAIM_INVALID'],
    ['w02A01AClaim', 'POSTG_APP_W02_A01A_CLAIM_INVALID'],
    ['w02A01BClaim', 'POSTG_APP_W02_A01B_CLAIM_INVALID'],
    ['w02A01CClaim', 'POSTG_APP_W02_A01C_CLAIM_INVALID'],
    ['w02A01DClaim', 'POSTG_APP_W02_A01D_CLAIM_INVALID'],
    ['w02A02Claim', 'POSTG_APP_W02_A02_CLAIM_INVALID'],
    ['w02A03Claim', 'POSTG_APP_W02_A03_CLAIM_INVALID'],
    ['w02A04Claim', 'POSTG_APP_W02_A04_CLAIM_INVALID'],
    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID'],
    ['w02A06Claim', 'POSTG_APP_W02_A06_CLAIM_INVALID'],
    ['w02A07Claim', 'POSTG_APP_W02_A07_CLAIM_INVALID']
  ];
  for (const [property, code] of claimCases) {
    const changed = structuredClone(controller);
    changed[property].claims.productionAdmitted = true;
    assert.equal(codes(validatePOSTGAPPMasterController(changed)).includes(code), true);
  }

  const evidenceCase = structuredClone(controller);
  evidenceCase.w02A07Evidence.coverage.macroContextCount = 15;
  assert.equal(codes(validatePOSTGAPPMasterController(evidenceCase)).includes('POSTG_APP_W02_A07_EVIDENCE_INVALID'), true);

  const stateCase = structuredClone(controller);
  stateCase.controllerState.waveStates[1].humanReviewReady = false;
  assert.equal(codes(validatePOSTGAPPMasterController(stateCase)).includes('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID'), true);
});

test('missing source coverage, altered wave order and unknown gates fail closed', () => {
  const missingCase = structuredClone(controller);
  missingCase.wavePlan.waves[5].sourceNodeIds.pop();
  const missingCodes = codes(validatePOSTGAPPMasterController(missingCase));
  assert.equal(missingCodes.includes('POSTG_APP_WAVE_SOURCE_COVERAGE_INVALID'), true);
  assert.equal(missingCodes.includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);

  const orderCase = structuredClone(controller);
  [orderCase.wavePlan.waves[1].sourceNodeIds[0], orderCase.wavePlan.waves[1].sourceNodeIds[1]] = [orderCase.wavePlan.waves[1].sourceNodeIds[1], orderCase.wavePlan.waves[1].sourceNodeIds[0]];
  assert.equal(codes(validatePOSTGAPPMasterController(orderCase)).includes('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH'), true);

  const gateCase = structuredClone(controller);
  gateCase.controllerState.waveStates[0].completedGates.push('UNKNOWN_GATE');
  assert.equal(codes(validatePOSTGAPPMasterController(gateCase)).includes('POSTG_APP_W01_PRODUCTION_ADMISSION_STATE_INVALID'), true);
});
