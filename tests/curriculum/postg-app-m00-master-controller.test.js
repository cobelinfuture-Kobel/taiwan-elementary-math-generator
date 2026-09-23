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

const A08R1_STATUS = 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY';
const A08R2_STATUS = 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED';
const A08R2_TASK = 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision';
const A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';
const A08R3_STATUS = 'W02_A08R3_NUMERIC_SURFACE_REMEDIATED_THIRD_REVIEW_READY';
const A08R4_TASK = 'POSTG-APP-W02-A08R4_RegeneratedHTMLPDFThirdOperatorReviewDecision';
const A08_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';
const A08R2_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision.json';

test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R3 third-review ready', () => {
  const result = runPOSTGAPPM00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, A08R3_STATUS);
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
  assert.equal(result.nextShortestStep, A08R4_TASK);
});

test('S29C registry and deterministic 79-node queue remain unchanged', () => {
  assert.deepEqual(
    controller.unitRegistry.batches.map((row) => [row.batchId, row.sourceNodeIds.length]),
    [['A', 13], ['B', 24], ['C', 17], ['D', 16], ['E', 9]]
  );
  assert.equal(new Set(controller.sourceNodes.map((row) => row.sourceNodeId)).size, 79);
  assert.deepEqual(
    controller.sourceNodes.map((row) => row.queueOrdinal),
    Array.from({ length: 79 }, (_, index) => index + 1)
  );
});

test('Wave 01 remains the only production-admitted wave', () => {
  const w01 = resolvePOSTGAPPWave(controller, 'W01');
  assert.equal(w01.goldenUnitIds.length, 15);
  assert.equal(w01.sourceNodes.length, 16);
  assert.equal(w01.productionSelectable, false);
  assert.equal(w01.productionAdmissionGranted, true);
  assert.equal(w01.currentState.state, 'PRODUCTION_ADMITTED');
  assert.equal(w01.currentState.reviewDecision, 'APPROVE');
  assert.deepEqual(w01.currentState.completedGates, REQUIRED_GATES);
  assert.deepEqual(controller.controllerState.productionAdmission.admittedWaveIds, ['W01']);
  assert.equal(controller.controllerState.productionAdmission.applicationUnitCount, 12);
  assert.equal(controller.controllerState.productionAdmission.waveCount, 1);
  assert.equal(controller.controllerState.productionAdmission.lastReviewDecision, 'APPROVE');

  const composite = controller.unitRegistry.goldenBaselineUnits.find((row) => row.goldenUnitId === 'g5a_u02_5a02');
  assert.deepEqual(composite.sourceNodeRefs, ['g5a_u02_5a02a', 'g5a_u02_5a02a1']);
  assert.equal(composite.mappingType, 'EXPLICIT_COMPOSITE_GOLDEN_BASELINE');
});

test('Wave 02 records A08R3 numeric remediation without admission', () => {
  const w02 = resolvePOSTGAPPWave(controller, 'W02');
  const state = w02.currentState;

  assert.equal(w02.sourceNodes.length, 13);
  assert.equal(w02.productionAdmissionGranted, false);
  assert.equal(w02.productionSelectable, false);
  assert.equal(state.state, A08R3_STATUS);
  assert.deepEqual(state.completedGates, REQUIRED_GATES.slice(0, 10));
  assert.equal(state.admissionGateComplete, false);
  assert.equal(state.productionAdmissionGranted, false);
  assert.equal(state.reviewDecision, 'REVISE');
  assert.equal(state.decisionEvidence, A08R2_DECISION_PATH);
  assert.equal(state.operatorDecisionState, 'SECOND_REVISE_RECORDED');
  assert.equal(state.remediationState, 'PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY');
  assert.equal(state.studentFacingSemanticRevision, 3);
  assert.equal(state.regeneratedHtmlPdfReviewReady, true);
  assert.equal(state.studentFacingSemanticAuditPass, true);
  assert.equal(state.productionAdmittedCandidateCount, 0);
  assert.equal(state.publicSelectableCandidateCount, 0);

  assert.equal(state.generatedItemCount, 195);
  assert.equal(state.numericGeneratedItemCount, 134);
  assert.equal(state.applicationGeneratedItemCount, 61);
  assert.equal(state.productionValidatedItemCount, 195);
  assert.equal(state.productionOperationFamilyCount, 49);
  assert.equal(state.applicationReviewCount, 61);
  assert.equal(state.numericBoundaryReviewCount, 49);
  assert.equal(state.pblReviewCount, 31);
  assert.equal(state.pbl3ReviewCount, 19);
  assert.equal(state.pbl5ReviewCount, 12);
  assert.equal(state.reviewMacroContextCount, 16);
  assert.equal(state.htmlArtifactCount, 2);
  assert.equal(state.pdfArtifactCount, 2);
  assert.equal(state.numericPdfPageCount, 68);
  assert.equal(state.applicationPdfPageCount, 42);
  assert.equal(state.artifactHashCount, 10);
  assert.equal(state.productionEquivalentOutputVerified, true);
  assert.equal(state.secondOperatorReviewComplete, true);
  assert.equal(state.secondOperatorReviewDecision, 'REVISE');
  assert.equal(state.unresolvedRequestedRoleSurfaceCount, 0);
  assert.equal(state.answerEquivalentGivenLeakageCount, 0);
  assert.equal(state.malformedOrIncoherentNumericSurfaceCount, 0);
  assert.equal(state.gradeUnsafeNotationCount, 0);
  assert.equal(state.numericStudentFacingSurfaceVersion, 'W02_A08R3_V1');
  assert.equal(state.numericStudentFacingSemanticRevision, 4);
  assert.equal(state.historicalAffectedItemCount, 45);
  assert.equal(state.thirdOperatorReviewReady, true);
});

test('A08 claim, operator decision and A08R1 executable readback form one fail-closed lineage', () => {
  assert.equal(controller.w02A08Claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
  assert.equal(controller.w02A08Claim.claimedStatus, 'W02_OPERATOR_REVIEW_REVISE_REQUIRED');
  assert.equal(controller.w02A08Claim.claims.operatorDecisionRecorded, true);
  assert.equal(controller.w02A08Claim.claims.operatorDecision, 'REVISE');
  assert.equal(controller.w02A08Claim.claims.productionAdmitted, false);
  assert.equal(controller.w02A08Claim.claims.publicSelectable, false);
  assert.equal(controller.w02A08Claim.claims.d0Complete, false);
  assert.equal(controller.w02A08Claim.nextStep.taskId, 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview');

  assert.equal(controller.w02A08Decision.operatorDecision, 'REVISE');
  assert.equal(controller.w02A08Decision.productionAdmission.granted, false);
  assert.equal(controller.w02A08Decision.controllerTransition.reviewDecision, 'REVISE');
  assert.equal(controller.w02A08Decision.failClosedBoundaries.publicSelectable, false);
  assert.equal(controller.w02A08Decision.failClosedBoundaries.w03ToW06Unblocked, false);

  const readback = controller.w02A08R1Readback;
  assert.equal(readback.ok, true, JSON.stringify(readback.issues, null, 2));
  assert.equal(readback.status, A08R1_STATUS);
  assert.equal(readback.studentFacingSemanticRevision, 3);
  assert.equal(readback.productionAdmissionGranted, false);
  assert.deepEqual(readback.counts, {
    generatedItemCount: 195,
    applicationReviewCount: 61,
    numericBoundaryReviewCount: 49,
    pblReviewCount: 31,
    operationFamilyCount: 49
  });
  assert.equal(readback.nextShortestStep, A08R2_TASK);
  assert.equal(readback.audit.application.rawRoleLeakageCount, 0);
  assert.equal(readback.audit.application.sameDenominatorKnowledgeMismatchCount, 0);
  assert.equal(readback.audit.application.lengthConversionSurfaceMismatchCount, 0);
  assert.equal(readback.audit.application.rateDistanceSurfaceMismatchCount, 0);
  assert.equal(readback.audit.pbl.genericTaskSurfaceCount, 0);
  assert.equal(readback.audit.pbl.governancePhraseLeakageCount, 0);
  assert.equal(readback.audit.pbl.genericProductLabelCount, 0);
});

test('all 15 golden registries and the M01 context authority remain valid', () => {
  assert.equal(controller.goldenRegistries.length, 15);
  for (const row of controller.goldenRegistries) {
    assert.equal(row.exists, true, row.registryPath);
    assert.equal(row.registry.sourceId, row.mapping.goldenUnitId);
    assert.equal(row.registry.conformanceState, 'GOLDEN_CONFORMANT');
    assert.equal(row.registry.knowledgeRegistryState, 'VALIDATED_COMPLETE');
  }

  const result = validatePOSTGAPPMasterController(controller);
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.deepEqual(result.contextCounts, {
    macroDomainCount: 16,
    mesoSituationCount: 48,
    microScenarioCount: 48,
    atomicEpisodeCount: 96,
    surfaceRealizationCount: 96,
    facetCount: 48,
    legacyFamilyMappingCount: 18,
    productionAdmittedNodeCount: 0
  });
});

test('W02 to W06 preserve deterministic coverage of the remaining 63 nodes', () => {
  const goldenSourceIds = new Set(controller.unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs));
  const expected = controller.sourceNodes.map((row) => row.sourceNodeId).filter((id) => !goldenSourceIds.has(id));
  const actual = controller.wavePlan.waves.slice(1).flatMap((row) => row.sourceNodeIds);
  assert.equal(actual.length, 63);
  assert.deepEqual(actual, expected);
  assert.deepEqual(controller.wavePlan.waves.map((row) => row.sourceNodeIds.length), [16, 13, 13, 13, 12, 12]);
  assert.deepEqual(controller.controllerState.waveStates.slice(2).map((row) => row.state), [
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ]);
});

test('prior evidence levels remain unchanged while A08 stays non-production E4', () => {
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

  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim, controller.w02A08R3Claim]) {
    assert.equal(claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');
    assert.equal(claim.claims.productionAdmitted, false);
    assert.equal(claim.claims.d0Complete, false);
  }
});

test('duplicate nodes, non-contiguous admissions and unknown gates fail closed', () => {
  const duplicateCase = structuredClone(controller);
  duplicateCase.sourceNodes[1].sourceNodeId = duplicateCase.sourceNodes[0].sourceNodeId;
  assert.equal(codes(validatePOSTGAPPMasterController(duplicateCase)).includes('POSTG_APP_SOURCE_NODE_DUPLICATED'), true);

  const productionCase = structuredClone(controller);
  productionCase.wavePlan.waves[2].productionAdmissionGranted = true;
  productionCase.wavePlan.coverage.productionAdmittedWaveCount = 2;
  assert.equal(codes(validatePOSTGAPPMasterController(productionCase)).includes('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID'), true);

  const gateCase = structuredClone(controller);
  gateCase.controllerState.waveStates[0].completedGates.push('UNKNOWN_GATE');
  assert.equal(codes(validatePOSTGAPPMasterController(gateCase)).includes('POSTG_APP_W01_PRODUCTION_ADMISSION_STATE_INVALID'), true);
});

test('forged A08 approval, premature admission and semantic-readback failure fail closed', () => {
  const approvalCase = structuredClone(controller);
  approvalCase.w02A08Decision.operatorDecision = 'APPROVE';
  assert.equal(codes(validatePOSTGAPPMasterController(approvalCase)).includes('POSTG_APP_W02_A08_DECISION_INVALID'), true);

  const claimCase = structuredClone(controller);
  claimCase.w02A08Claim.claims.productionAdmitted = true;
  assert.equal(codes(validatePOSTGAPPMasterController(claimCase)).includes('POSTG_APP_W02_A08_CLAIM_INVALID'), true);

  const readbackCase = structuredClone(controller);
  readbackCase.w02A08R1Readback.ok = false;
  readbackCase.w02A08R1Readback.audit.application.sameDenominatorKnowledgeMismatchCount = 1;
  assert.equal(codes(validatePOSTGAPPMasterController(readbackCase)).includes('POSTG_APP_W02_A08R1_READBACK_INVALID'), true);

  const stateCase = structuredClone(controller);
  stateCase.controllerState.waveStates[1].productionAdmissionGranted = true;
  assert.equal(codes(validatePOSTGAPPMasterController(stateCase)).includes('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID'), true);

  const transitionCase = structuredClone(controller);
  transitionCase.controllerState.nextShortestStep = 'POSTG-APP-W03-A00';
  assert.equal(codes(validatePOSTGAPPMasterController(transitionCase)).includes('POSTG_APP_CONTROLLER_TRANSITION_INVALID'), true);
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
