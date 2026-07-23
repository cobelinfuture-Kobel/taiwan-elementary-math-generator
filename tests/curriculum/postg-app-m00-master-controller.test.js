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

test('M00 validates the exact 79-node scope with W01 admitted and W02 A05 shared projection passed', () => {
  const result = runPOSTGAPPM00Validation();
  assert.equal(
    result.validationStatus,
    'PASS_POSTG_APP_M00_MASTER_CONTROLLER_79_UNIT_REGISTRY_AND_WAVE_ADMISSION',
    JSON.stringify(result.issues, null, 2)
  );
  assert.equal(result.status, 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS');
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
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration');
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

test('Wave 02 has A05 shared worksheet projection complete without admission', () => {
  const w02 = resolvePOSTGAPPWave(controller, 'W02');
  assert.equal(w02.sourceNodes.length, 13);
  assert.equal(w02.productionAdmissionGranted, false);
  assert.equal(w02.currentState.state, 'SHARED_WORKSHEET_PROJECTION_SHADOW_PASS');
  assert.deepEqual(w02.currentState.completedGates, REQUIRED_GATES.slice(0, 10));
  assert.equal(w02.currentState.admissionGateComplete, false);
  assert.equal(w02.currentState.assessmentBaselineState, 'SOURCE_AUTHORITY_BASELINE_READY');
  assert.equal(w02.currentState.sourceMetadataAvailableCount, 13);
  assert.equal(w02.currentState.sourceNodeCount, 13);
  assert.equal(w02.currentState.sourcePdfReferenceCount, 13);
  assert.equal(w02.currentState.uniquePdfContentCount, 12);
  assert.equal(w02.currentState.totalSourcePdfPageCount, 31);
  assert.equal(w02.currentState.knowledgePointCandidateCount, 90);
  assert.equal(w02.currentState.uniqueContentKnowledgePointCandidateCount, 84);
  assert.equal(w02.currentState.applicationRequiredCount, 17);
  assert.equal(w02.currentState.applicationCompatibleCount, 27);
  assert.equal(w02.currentState.applicationNotApplicableCount, 46);
  assert.equal(w02.currentState.canonicalOperationModelCount, 90);
  assert.equal(w02.currentState.uniqueContentCanonicalOperationModelCount, 84);
  assert.equal(w02.currentState.numericPatternSpecCount, 134);
  assert.equal(w02.currentState.applicationPatternSpecCount, 61);
  assert.equal(w02.currentState.hiddenPatternSpecCount, 195);
  assert.equal(w02.currentState.visiblePatternSpecCount, 0);
  assert.equal(w02.currentState.hiddenPatternSpecsComplete, true);
  assert.equal(w02.currentState.forcedStoryAuthoringAllowed, false);
  assert.equal(w02.currentState.atomicContextBindingCount, 61);
  assert.equal(w02.currentState.singleApplicationCandidateCount, 61);
  assert.equal(w02.currentState.macroContextDomainCount, 16);
  assert.equal(w02.currentState.duplicateContentProjectionParity, true);
  assert.equal(w02.currentState.atomicContextBindingsComplete, true);
  assert.equal(w02.currentState.nPlusOneProofCandidateCount, 61);
  assert.equal(w02.currentState.misconceptionCandidateCount, 183);
  assert.equal(w02.currentState.pblEligibleCandidateCount, 31);
  assert.equal(w02.currentState.pblTaskSetCandidateCount, 31);
  assert.equal(w02.currentState.crossContextPairCount, 61);
  assert.equal(w02.currentState.pbl3TaskSetCandidateCount, 19);
  assert.equal(w02.currentState.pbl5TaskSetCandidateCount, 12);
  assert.equal(w02.currentState.duplicateProofProjectionParity, true);
  assert.equal(w02.currentState.duplicatePblProjectionParity, true);
  assert.equal(w02.currentState.compatiblePblCandidateCount, 0);
  assert.equal(w02.currentState.nPlusOnePblBlueprintsComplete, true);
  assert.equal(w02.currentState.validatorFixtureCount, 672);
  assert.equal(w02.currentState.validatorPositiveFixtureCount, 275);
  assert.equal(w02.currentState.validatorNegativeFixtureCount, 397);
  assert.equal(w02.currentState.validatorPassCount, 275);
  assert.equal(w02.currentState.validatorExpectedRejectCount, 397);
  assert.equal(w02.currentState.validatorUnexpectedPassCount, 0);
  assert.equal(w02.currentState.validatorUnexpectedRejectCount, 0);
  assert.equal(w02.currentState.pairedNPlusOneExecutionCount, 61);
  assert.equal(w02.currentState.misconceptionExecutionCount, 183);
  assert.equal(w02.currentState.calculationPassInterpretationFailCount, 122);
  assert.equal(w02.currentState.counterfactualExecutionCount, 61);
  assert.equal(w02.currentState.crossContextExecutionCount, 61);
  assert.equal(w02.currentState.uniquenessNegativeExecutionCount, 61);
  assert.equal(w02.currentState.pblDependencyExecutionCount, 62);
  assert.equal(w02.currentState.sourceNodeRuntimeCoverageCount, 13);
  assert.equal(w02.currentState.primaryMacroContextRuntimeCoverageCount, 16);
  assert.equal(w02.currentState.alternateMacroContextRuntimeCoverageCount, 2);
  assert.equal(w02.currentState.operationFamilyRuntimeCoverageCount, 22);
  assert.equal(w02.currentState.answerShapeRuntimeCoverageCount, 2);
  assert.equal(w02.currentState.adapterRuntimeCoverageCount, 2);
  assert.equal(w02.currentState.duplicateFixtureProjectionGroupCount, 1);
  assert.equal(w02.currentState.duplicateFixtureProjectionParity, true);
  assert.equal(w02.currentState.validatorFixturesComplete, true);
  assert.equal(w02.currentState.sharedRuntimeShadowPass, true);
  assert.equal(w02.currentState.applicationCapabilityEntryCount, 61);
  assert.equal(w02.currentState.applicationQuestionRecordCount, 61);
  assert.equal(w02.currentState.answerKeyRecordCount, 61);
  assert.equal(w02.currentState.sharedPblTaskSetRecordCount, 31);
  assert.equal(w02.currentState.worksheetProjectionCount, 13);
  assert.equal(w02.currentState.futureWaveFailClosedFixtureCount, 1);
  assert.equal(w02.currentState.duplicateWorksheetProjectionGroupCount, 1);
  assert.equal(w02.currentState.duplicateWorksheetProjectionParity, true);
  assert.equal(w02.currentState.shadowHtmlCount, 0);
  assert.equal(w02.currentState.sharedWorksheetProjectionComplete, true);
  assert.equal(w02.currentState.productionAdmittedCandidateCount, 0);
  assert.equal(w02.currentState.publicSelectableCandidateCount, 0);
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

test('W01 stays E5 while W02 A00 through A05 remain E3 non-production', () => {
  assert.equal(controller.approvalDecision.operatorDecision, 'APPROVE');
  assert.equal(controller.approvalDecision.productionAdmission.granted, true);
  assert.equal(controller.approvalDecision.productionAdmission.publicRouteChanged, false);
  assert.equal(controller.w01Claim.actualEvidenceLevel, 'E5_PRODUCTION_ADMITTED');
  assert.equal(controller.w01Claim.claims.productionAdmitted, true);
  assert.equal(controller.w01Claim.claims.d0Complete, false);
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
  assert.equal(codes(validatePOSTGAPPMasterController(productionCase)).includes('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID'), true);
});

test('forged approval, W02 claims and A05 projection state fail closed', () => {
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
    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID']
  ];
  for (const [property, code] of claimCases) {
    const changed = structuredClone(controller);
    changed[property].claims.productionAdmitted = true;
    assert.equal(codes(validatePOSTGAPPMasterController(changed)).includes(code), true);
  }

  const evidenceCase = structuredClone(controller);
  evidenceCase.controllerState.waveStates[1].worksheetProjectionCount = 12;
  assert.equal(codes(validatePOSTGAPPMasterController(evidenceCase)).includes('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID'), true);
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
