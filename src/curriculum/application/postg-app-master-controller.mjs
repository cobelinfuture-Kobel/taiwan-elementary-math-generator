import fs from 'node:fs';
import path from 'node:path';

import {
  loadGlobalContextAuthority,
  validateGlobalContextAuthority
} from '../context/global-context-ontology-resolver.mjs';

const UNIT_REGISTRY_PATH = 'data/curriculum/application/controller/postg-app-79-unit-registry.json';
const WAVE_PLAN_PATH = 'data/curriculum/application/controller/postg-app-wave-plan.json';
const CONTROLLER_STATE_PATH = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const W01_APPROVAL_PATH = 'data/curriculum/application/reviews/POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision.json';
const W01_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W01-A06.claim.json';
const W02_A00_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A00.claim.json';
const W02_A01A_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01A.claim.json';
const W02_A01B_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01B.claim.json';
const W02_A01C_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01C.claim.json';
const W02_A01D_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A01D.claim.json';
const W02_A02_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A02.claim.json';
const GOLDEN_UNIT_DIR = 'data/curriculum/knowledge/units';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

const REQUIRED_GATE_ORDER = [
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

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function readJsonIfExists(root, repoPath) {
  const absolutePath = path.join(root, repoPath);
  return fs.existsSync(absolutePath) ? readJson(root, repoPath) : null;
}

function parseSourceNodeId(sourceNodeId) {
  const match = /^g([3-6])([ab])_u\d+_[a-z0-9]+$/.exec(sourceNodeId);
  if (!match) return null;
  return {
    grade: Number(match[1]),
    semester: match[2] === 'a' ? 'upper' : 'lower'
  };
}

function materializeSourceNodes(unitRegistry) {
  const records = [];
  let queueOrdinal = 1;
  for (const batch of unitRegistry.batches) {
    for (const sourceNodeId of batch.sourceNodeIds) {
      const parsed = parseSourceNodeId(sourceNodeId);
      records.push({
        sourceNodeId,
        queueOrdinal,
        primaryBatchId: batch.batchId,
        sourceScope: batch.scope,
        grade: parsed?.grade ?? null,
        semester: parsed?.semester ?? null,
        sourceNodeType: 'SOURCE_UNIT_MACRO_NODE'
      });
      queueOrdinal += 1;
    }
  }
  return records;
}

function goldenRegistryPath(goldenUnitId) {
  return `${GOLDEN_UNIT_DIR}/${goldenUnitId}.knowledge-operation.json`;
}

function admissionPrefix(waves) {
  const admitted = [];
  let closed = false;
  for (const wave of waves) {
    if (wave.productionAdmissionGranted === true) {
      if (closed) return { admitted, contiguous: false };
      admitted.push(wave.waveId);
    } else {
      closed = true;
    }
  }
  return { admitted, contiguous: true };
}

export function loadPOSTGAPPMasterController({ root = process.cwd() } = {}) {
  const unitRegistry = readJson(root, UNIT_REGISTRY_PATH);
  const wavePlan = readJson(root, WAVE_PLAN_PATH);
  const controllerState = readJson(root, CONTROLLER_STATE_PATH);
  const contextAuthority = loadGlobalContextAuthority({ root });
  const sourceNodes = materializeSourceNodes(unitRegistry);
  const goldenRegistries = unitRegistry.goldenBaselineUnits.map((mapping) => {
    const registryPath = goldenRegistryPath(mapping.goldenUnitId);
    const absolutePath = path.join(root, registryPath);
    return {
      mapping,
      registryPath,
      exists: fs.existsSync(absolutePath),
      registry: fs.existsSync(absolutePath) ? readJson(root, registryPath) : null
    };
  });
  return {
    root,
    unitRegistry,
    wavePlan,
    controllerState,
    contextAuthority,
    sourceNodes,
    goldenRegistries,
    approvalDecision: readJsonIfExists(root, W01_APPROVAL_PATH),
    w01Claim: readJsonIfExists(root, W01_CLAIM_PATH),
    w02A00Claim: readJsonIfExists(root, W02_A00_CLAIM_PATH),
    w02A01AClaim: readJsonIfExists(root, W02_A01A_CLAIM_PATH),
    w02A01BClaim: readJsonIfExists(root, W02_A01B_CLAIM_PATH),
    w02A01CClaim: readJsonIfExists(root, W02_A01C_CLAIM_PATH),
    w02A01DClaim: readJsonIfExists(root, W02_A01D_CLAIM_PATH),
    w02A02Claim: readJsonIfExists(root, W02_A02_CLAIM_PATH)
  };
}

function validateShadowClaim({ claim, pathValue, code, claimedStatus, nextTaskId }) {
  return Boolean(
    claim
    && claim.actualEvidenceLevel === 'E3_SHADOW_RUNTIME_INTEGRATED'
    && claim.claimedStatus === claimedStatus
    && claim.claims?.runtimeIntegrated === true
    && claim.claims?.productionAdmitted === false
    && claim.claims?.d0Complete === false
    && claim.nextStep?.taskId === nextTaskId
  ) ? [] : [issue(code, pathValue)];
}

export function validatePOSTGAPPMasterController(controller) {
  const issues = [];
  const {
    unitRegistry,
    wavePlan,
    controllerState,
    sourceNodes,
    goldenRegistries,
    approvalDecision,
    w01Claim,
    w02A00Claim,
    w02A01AClaim,
    w02A01BClaim,
    w02A01CClaim,
    w02A01DClaim,
    w02A02Claim
  } = controller;
  const sourceIds = sourceNodes.map((row) => row.sourceNodeId);
  const sourceSet = new Set(sourceIds);

  if (sourceNodes.length !== 79) issues.push(issue('POSTG_APP_SOURCE_NODE_COUNT_MISMATCH', 'sourceNodes', { expected: 79, actual: sourceNodes.length }));
  if (!unique(sourceIds)) issues.push(issue('POSTG_APP_SOURCE_NODE_DUPLICATED', 'sourceNodes'));
  if (!sourceNodes.every((row, index) => row.queueOrdinal === index + 1)) issues.push(issue('POSTG_APP_QUEUE_ORDINAL_NOT_CONTIGUOUS', 'sourceNodes'));
  if (!sourceNodes.every((row) => row.grade !== null && row.semester !== null)) issues.push(issue('POSTG_APP_SOURCE_NODE_ID_INVALID', 'sourceNodes'));

  const expectedBatchCounts = { A: 13, B: 24, C: 17, D: 16, E: 9 };
  for (const batch of unitRegistry.batches) {
    if (expectedBatchCounts[batch.batchId] !== batch.expectedCount || batch.sourceNodeIds.length !== batch.expectedCount) {
      issues.push(issue('POSTG_APP_BATCH_COUNT_MISMATCH', `batches.${batch.batchId}`));
    }
  }
  if (unitRegistry.batches.length !== 5) issues.push(issue('POSTG_APP_BATCH_SET_INVALID', 'batches'));

  const goldenIds = unitRegistry.goldenBaselineUnits.map((row) => row.goldenUnitId);
  const goldenSourceIds = unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs);
  if (goldenIds.length !== 15 || !unique(goldenIds)) issues.push(issue('POSTG_APP_GOLDEN_BASELINE_COUNT_INVALID', 'goldenBaselineUnits'));
  if (goldenSourceIds.length !== 16 || !unique(goldenSourceIds)) issues.push(issue('POSTG_APP_GOLDEN_SOURCE_COVERAGE_INVALID', 'goldenBaselineUnits'));
  for (const sourceNodeId of goldenSourceIds) {
    if (!sourceSet.has(sourceNodeId)) issues.push(issue('POSTG_APP_GOLDEN_SOURCE_NODE_NOT_REGISTERED', 'goldenBaselineUnits', { sourceNodeId }));
  }
  const compositeMappings = unitRegistry.goldenBaselineUnits.filter((row) => row.sourceNodeRefs.length > 1);
  if (compositeMappings.length !== 1
      || compositeMappings[0].goldenUnitId !== 'g5a_u02_5a02'
      || JSON.stringify(compositeMappings[0].sourceNodeRefs) !== JSON.stringify(['g5a_u02_5a02a', 'g5a_u02_5a02a1'])) {
    issues.push(issue('POSTG_APP_COMPOSITE_GOLDEN_MAPPING_INVALID', 'goldenBaselineUnits'));
  }
  for (const row of goldenRegistries) {
    if (!row.exists) {
      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_NOT_FOUND', row.registryPath));
      continue;
    }
    if (row.registry.sourceId !== row.mapping.goldenUnitId) issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_ID_MISMATCH', row.registryPath));
    if (row.registry.conformanceState !== 'GOLDEN_CONFORMANT'
        || row.registry.knowledgeRegistryState !== 'VALIDATED_COMPLETE') {
      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_NOT_VALIDATED', row.registryPath));
    }
  }

  const waveIds = wavePlan.waves.map((row) => row.waveId);
  if (wavePlan.waves.length !== 6
      || JSON.stringify(waveIds) !== JSON.stringify(['W01', 'W02', 'W03', 'W04', 'W05', 'W06'])) {
    issues.push(issue('POSTG_APP_WAVE_ORDER_INVALID', 'waves', { waveIds }));
  }
  const w01Plan = wavePlan.waves[0];
  if (w01Plan.goldenUnitIds?.length !== 15 || w01Plan.sourceNodeIds.length !== 16
      || JSON.stringify(w01Plan.goldenUnitIds) !== JSON.stringify(goldenIds)
      || JSON.stringify(w01Plan.sourceNodeIds) !== JSON.stringify(goldenSourceIds)) {
    issues.push(issue('POSTG_APP_W01_BASELINE_MAPPING_MISMATCH', 'waves.W01'));
  }
  const allWaveSourceIds = wavePlan.waves.flatMap((row) => row.sourceNodeIds);
  if (allWaveSourceIds.length !== 79 || !unique(allWaveSourceIds)) issues.push(issue('POSTG_APP_WAVE_SOURCE_COVERAGE_INVALID', 'waves'));
  if ([...allWaveSourceIds].sort().join('\n') !== [...sourceIds].sort().join('\n')) issues.push(issue('POSTG_APP_WAVE_SOURCE_SET_MISMATCH', 'waves'));
  const remainingSourceIds = sourceIds.filter((id) => !new Set(goldenSourceIds).has(id));
  const remainingWaveIds = wavePlan.waves.slice(1).flatMap((row) => row.sourceNodeIds);
  if (remainingWaveIds.length !== 63 || JSON.stringify(remainingWaveIds) !== JSON.stringify(remainingSourceIds)) {
    issues.push(issue('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH', 'waves.W02-W06'));
  }
  const expectedWaveCounts = [16, 13, 13, 13, 12, 12];
  wavePlan.waves.forEach((wave, index) => {
    if (wave.sourceNodeIds.length !== expectedWaveCounts[index]) issues.push(issue('POSTG_APP_WAVE_SIZE_MISMATCH', `waves.${wave.waveId}`));
  });

  const admitted = admissionPrefix(wavePlan.waves);
  if (!admitted.contiguous) issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID', 'waves'));
  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));
  if (wavePlan.coverage?.productionAdmittedWaveCount !== admitted.admitted.length) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_COUNT_MISMATCH', 'coverage.productionAdmittedWaveCount'));
  if (JSON.stringify(wavePlan.admissionGateOrder) !== JSON.stringify(REQUIRED_GATE_ORDER)) issues.push(issue('POSTG_APP_ADMISSION_GATE_ORDER_INVALID', 'admissionGateOrder'));

  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATES_MATERIALIZED',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ];
  if (JSON.stringify(controllerState.waveStates.map((row) => row.state)) !== JSON.stringify(expectedStates)) {
    issues.push(issue('POSTG_APP_CONTROLLER_WAVE_STATE_INVALID', 'controllerState.waveStates'));
  }
  const w01State = controllerState.waveStates[0];
  if (JSON.stringify(w01State.completedGates ?? []) !== JSON.stringify(REQUIRED_GATE_ORDER)
      || w01State.admissionGateComplete !== true
      || w01State.productionAdmissionGranted !== true
      || w01State.reviewDecision !== 'APPROVE') {
    issues.push(issue('POSTG_APP_W01_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W01'));
  }
  const w02State = controllerState.waveStates[1];
  if (!Array.isArray(w02State.completedGates)
      || JSON.stringify(w02State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER.slice(0, 6))
      || w02State.productionAdmissionGranted !== false
      || w02State.admissionGateComplete !== false
      || w02State.assessmentBaselineState !== 'SOURCE_AUTHORITY_BASELINE_READY'
      || w02State.sourceMetadataAvailableCount !== 13
      || w02State.sourceNodeCount !== 13
      || w02State.sourcePdfReferenceCount !== 13
      || w02State.uniquePdfContentCount !== 12
      || w02State.totalSourcePdfPageCount !== 31
      || w02State.knowledgePointCandidateCount !== 90
      || w02State.uniqueContentKnowledgePointCandidateCount !== 84
      || w02State.applicationRequiredCount !== 17
      || w02State.applicationCompatibleCount !== 27
      || w02State.applicationNotApplicableCount !== 46
      || w02State.canonicalOperationModelCount !== 90
      || w02State.uniqueContentCanonicalOperationModelCount !== 84
      || w02State.numericPatternSpecCount !== 134
      || w02State.applicationPatternSpecCount !== 61
      || w02State.hiddenPatternSpecCount !== 195
      || w02State.visiblePatternSpecCount !== 0
      || w02State.hiddenPatternSpecsComplete !== true
      || w02State.forcedStoryAuthoringAllowed !== false
      || w02State.atomicContextBindingCount !== 61
      || w02State.singleApplicationCandidateCount !== 61
      || w02State.macroContextDomainCount !== 16
      || w02State.duplicateContentProjectionParity !== true
      || w02State.atomicContextBindingsComplete !== true
      || w02State.productionAdmittedCandidateCount !== 0) {
    issues.push(issue('POSTG_APP_W02_ASSESSMENT_READY_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATES_MATERIALIZED'
      || controllerState.currentMainlineBlocker !== 'W02_N_PLUS_ONE_PROOF_MISCONCEPTION_AND_PBL_CANDIDATES_PENDING'
      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A03_NPlusOneProofMisconceptionAndPBLCandidateContract') {
    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 12
      || controllerState.productionAdmission.waveCount !== 1
      || controllerState.productionAdmission.allowed !== true
      || controllerState.productionAdmission.lastReviewDecision !== 'APPROVE'
      || JSON.stringify(controllerState.productionAdmission.admittedWaveIds ?? []) !== JSON.stringify(['W01'])
      || controllerState.productionAdmission.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.productionAdmission'));
  }

  if (!approvalDecision
      || approvalDecision.operatorDecision !== 'APPROVE'
      || approvalDecision.productionAdmission?.granted !== true
      || approvalDecision.productionAdmission?.evidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || approvalDecision.controllerTransition?.nextWaveId !== 'W02') {
    issues.push(issue('POSTG_APP_W01_OPERATOR_APPROVAL_EVIDENCE_INVALID', W01_APPROVAL_PATH));
  }
  if (!w01Claim
      || w01Claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || w01Claim.claims?.productionAdmitted !== true
      || w01Claim.claims?.d0Complete !== false) {
    issues.push(issue('POSTG_APP_W01_E5_CLAIM_INVALID', W01_CLAIM_PATH));
  }
  issues.push(...validateShadowClaim({
    claim: w02A00Claim,
    pathValue: W02_A00_CLAIM_PATH,
    code: 'POSTG_APP_W02_A00_CLAIM_INVALID',
    claimedStatus: 'W02_SOURCE13_AUTHORITY_AND_READINESS_BASELINE_READY',
    nextTaskId: 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification'
  }));
  issues.push(...validateShadowClaim({
    claim: w02A01AClaim,
    pathValue: W02_A01A_CLAIM_PATH,
    code: 'POSTG_APP_W02_A01A_CLAIM_INVALID',
    claimedStatus: 'W02_SOURCE13_PDF_EVIDENCE_HASH_LOCKED_RENDERABLE',
    nextTaskId: 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification'
  }));
  issues.push(...validateShadowClaim({
    claim: w02A01BClaim,
    pathValue: W02_A01B_CLAIM_PATH,
    code: 'POSTG_APP_W02_A01B_CLAIM_INVALID',
    claimedStatus: 'W02_PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED',
    nextTaskId: 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization'
  }));
  issues.push(...validateShadowClaim({
    claim: w02A01CClaim,
    pathValue: W02_A01C_CLAIM_PATH,
    code: 'POSTG_APP_W02_A01C_CLAIM_INVALID',
    claimedStatus: 'W02_CANONICAL_OPERATION_MODELS_MATERIALIZED',
    nextTaskId: 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization'
  }));
  issues.push(...validateShadowClaim({
    claim: w02A01DClaim,
    pathValue: W02_A01D_CLAIM_PATH,
    code: 'POSTG_APP_W02_A01D_CLAIM_INVALID',
    claimedStatus: 'W02_HIDDEN_PATTERNSPECS_MATERIALIZED',
    nextTaskId: 'POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization'
  }));
  issues.push(...validateShadowClaim({
    claim: w02A02Claim,
    pathValue: W02_A02_CLAIM_PATH,
    code: 'POSTG_APP_W02_A02_CLAIM_INVALID',
    claimedStatus: 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATES_MATERIALIZED',
    nextTaskId: 'POSTG-APP-W02-A03_NPlusOneProofMisconceptionAndPBLCandidateContract'
  }));

  const contextValidation = validateGlobalContextAuthority(controller.contextAuthority);
  if (!contextValidation.ok) issues.push(issue('POSTG_APP_M01_CONTEXT_AUTHORITY_INVALID', 'globalContextAuthority', { contextIssues: contextValidation.issues }));
  const requiredContextCounts = {
    macroDomainCount: 16,
    mesoSituationCount: 48,
    microScenarioCount: 48,
    atomicEpisodeCount: 96,
    facetCount: 48,
    legacyFamilyMappingCount: 18,
    productionAdmittedNodeCount: 0
  };
  for (const [key, expected] of Object.entries(requiredContextCounts)) {
    if (contextValidation.counts[key] !== expected) {
      issues.push(issue('POSTG_APP_M01_CONTEXT_COUNT_MISMATCH', `globalContextAuthority.${key}`, {
        expected,
        actual: contextValidation.counts[key]
      }));
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      sourceNodeCount: sourceNodes.length,
      goldenBaselineUnitCount: goldenIds.length,
      goldenBaselineSourceNodeCount: goldenSourceIds.length,
      remainingSourceNodeCount: remainingSourceIds.length,
      waveCount: wavePlan.waves.length,
      productionAdmittedApplicationUnitCount: controllerState.productionAdmission.applicationUnitCount
    },
    contextCounts: contextValidation.counts,
    currentWaveId: controllerState.currentWaveId,
    nextShortestStep: controllerState.nextShortestStep,
    status: issues.length === 0
      ? 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATES_MATERIALIZED'
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'
  };
}

export function resolvePOSTGAPPWave(controller, waveId) {
  const wave = controller.wavePlan.waves.find((row) => row.waveId === waveId);
  if (!wave) return null;
  const sourceMap = new Map(controller.sourceNodes.map((row) => [row.sourceNodeId, row]));
  return {
    ...wave,
    currentState: controller.controllerState.waveStates.find((row) => row.waveId === waveId) ?? null,
    sourceNodes: wave.sourceNodeIds.map((id) => sourceMap.get(id)).filter(Boolean),
    gateOrder: controller.wavePlan.admissionGateOrder,
    productionSelectable: false
  };
}

export function buildPOSTGAPPMasterReadback({ root = process.cwd() } = {}) {
  const controller = loadPOSTGAPPMasterController({ root });
  const validation = validatePOSTGAPPMasterController(controller);
  return {
    ...validation,
    programId: controller.controllerState.programId,
    taskId: controller.controllerState.taskId,
    producerStateConsumerReadback: controller.controllerState.producerStateConsumerReadback,
    waveSummary: controller.wavePlan.waves.map((wave) => ({
      waveId: wave.waveId,
      plannedState: wave.controllerState,
      currentState: controller.controllerState.waveStates.find((row) => row.waveId === wave.waveId)?.state ?? null,
      sourceNodeCount: wave.sourceNodeIds.length,
      goldenUnitCount: wave.goldenUnitIds?.length ?? 0,
      productionAdmissionGranted: wave.productionAdmissionGranted
    }))
  };
}
