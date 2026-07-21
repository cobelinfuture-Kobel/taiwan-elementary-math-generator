import fs from 'node:fs';
import path from 'node:path';

import {
  loadGlobalContextAuthority,
  validateGlobalContextAuthority
} from '../context/global-context-ontology-resolver.mjs';

const UNIT_REGISTRY_PATH = 'data/curriculum/application/controller/postg-app-79-unit-registry.json';
const WAVE_PLAN_PATH = 'data/curriculum/application/controller/postg-app-wave-plan.json';
const CONTROLLER_STATE_PATH = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const GOLDEN_UNIT_DIR = 'data/curriculum/knowledge/units';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
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
    goldenRegistries
  };
}

export function validatePOSTGAPPMasterController(controller) {
  const issues = [];
  const { unitRegistry, wavePlan, controllerState, sourceNodes, goldenRegistries } = controller;
  const sourceIds = sourceNodes.map((row) => row.sourceNodeId);
  const sourceSet = new Set(sourceIds);

  if (sourceNodes.length !== 79) issues.push(issue('POSTG_APP_SOURCE_NODE_COUNT_MISMATCH', 'sourceNodes', { expected: 79, actual: sourceNodes.length }));
  if (!unique(sourceIds)) issues.push(issue('POSTG_APP_SOURCE_NODE_DUPLICATED', 'sourceNodes'));
  if (!sourceNodes.every((row, index) => row.queueOrdinal === index + 1)) {
    issues.push(issue('POSTG_APP_QUEUE_ORDINAL_NOT_CONTIGUOUS', 'sourceNodes'));
  }
  if (!sourceNodes.every((row) => row.grade !== null && row.semester !== null)) {
    issues.push(issue('POSTG_APP_SOURCE_NODE_ID_INVALID', 'sourceNodes'));
  }

  const expectedBatchCounts = { A: 13, B: 24, C: 17, D: 16, E: 9 };
  for (const batch of unitRegistry.batches) {
    if (expectedBatchCounts[batch.batchId] !== batch.expectedCount || batch.sourceNodeIds.length !== batch.expectedCount) {
      issues.push(issue('POSTG_APP_BATCH_COUNT_MISMATCH', `batches.${batch.batchId}`, {
        expected: expectedBatchCounts[batch.batchId],
        declared: batch.expectedCount,
        actual: batch.sourceNodeIds.length
      }));
    }
  }
  if (unitRegistry.batches.length !== 5) issues.push(issue('POSTG_APP_BATCH_SET_INVALID', 'batches'));

  const goldenIds = unitRegistry.goldenBaselineUnits.map((row) => row.goldenUnitId);
  const goldenSourceIds = unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs);
  if (goldenIds.length !== 15 || !unique(goldenIds)) {
    issues.push(issue('POSTG_APP_GOLDEN_BASELINE_COUNT_INVALID', 'goldenBaselineUnits', { actual: goldenIds.length }));
  }
  if (goldenSourceIds.length !== 16 || !unique(goldenSourceIds)) {
    issues.push(issue('POSTG_APP_GOLDEN_SOURCE_COVERAGE_INVALID', 'goldenBaselineUnits', { actual: goldenSourceIds.length }));
  }
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
    if (row.registry.sourceId !== row.mapping.goldenUnitId) {
      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_ID_MISMATCH', row.registryPath, {
        expected: row.mapping.goldenUnitId,
        actual: row.registry.sourceId
      }));
    }
    if (row.registry.conformanceState !== 'GOLDEN_CONFORMANT'
        || row.registry.knowledgeRegistryState !== 'VALIDATED_COMPLETE') {
      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_NOT_VALIDATED', row.registryPath, {
        conformanceState: row.registry.conformanceState,
        knowledgeRegistryState: row.registry.knowledgeRegistryState
      }));
    }
  }

  if (wavePlan.waves.length !== 6) issues.push(issue('POSTG_APP_WAVE_COUNT_INVALID', 'waves', { actual: wavePlan.waves.length }));
  const waveIds = wavePlan.waves.map((row) => row.waveId);
  if (JSON.stringify(waveIds) !== JSON.stringify(['W01', 'W02', 'W03', 'W04', 'W05', 'W06'])) {
    issues.push(issue('POSTG_APP_WAVE_ORDER_INVALID', 'waves', { waveIds }));
  }
  const w01 = wavePlan.waves[0];
  if (w01.goldenUnitIds?.length !== 15 || w01.sourceNodeIds.length !== 16) {
    issues.push(issue('POSTG_APP_W01_COVERAGE_INVALID', 'waves.W01'));
  }
  if (JSON.stringify(w01.goldenUnitIds) !== JSON.stringify(goldenIds)
      || JSON.stringify(w01.sourceNodeIds) !== JSON.stringify(goldenSourceIds)) {
    issues.push(issue('POSTG_APP_W01_BASELINE_MAPPING_MISMATCH', 'waves.W01'));
  }

  const allWaveSourceIds = wavePlan.waves.flatMap((row) => row.sourceNodeIds);
  if (allWaveSourceIds.length !== 79 || !unique(allWaveSourceIds)) {
    issues.push(issue('POSTG_APP_WAVE_SOURCE_COVERAGE_INVALID', 'waves', { actual: allWaveSourceIds.length }));
  }
  if ([...allWaveSourceIds].sort().join('\n') !== [...sourceIds].sort().join('\n')) {
    issues.push(issue('POSTG_APP_WAVE_SOURCE_SET_MISMATCH', 'waves'));
  }
  const remainingSourceIds = sourceIds.filter((id) => !new Set(goldenSourceIds).has(id));
  const remainingWaveIds = wavePlan.waves.slice(1).flatMap((row) => row.sourceNodeIds);
  if (remainingWaveIds.length !== 63 || JSON.stringify(remainingWaveIds) !== JSON.stringify(remainingSourceIds)) {
    issues.push(issue('POSTG_APP_REMAINING_QUEUE_ORDER_MISMATCH', 'waves.W02-W06', {
      expectedCount: remainingSourceIds.length,
      actualCount: remainingWaveIds.length
    }));
  }
  const expectedWaveCounts = [16, 13, 13, 13, 12, 12];
  wavePlan.waves.forEach((wave, index) => {
    if (wave.sourceNodeIds.length !== expectedWaveCounts[index]) {
      issues.push(issue('POSTG_APP_WAVE_SIZE_MISMATCH', `waves.${wave.waveId}`, {
        expected: expectedWaveCounts[index],
        actual: wave.sourceNodeIds.length
      }));
    }
    if (wave.productionAdmissionGranted !== false) {
      issues.push(issue('POSTG_APP_M00_PRODUCTION_WAVE_FORBIDDEN', `waves.${wave.waveId}`));
    }
  });

  const requiredGateOrder = [
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
  if (JSON.stringify(wavePlan.admissionGateOrder) !== JSON.stringify(requiredGateOrder)) {
    issues.push(issue('POSTG_APP_ADMISSION_GATE_ORDER_INVALID', 'admissionGateOrder'));
  }

  const expectedStates = ['BASELINE_READY', 'QUEUED', 'BLOCKED_BY_PREVIOUS_WAVE', 'BLOCKED_BY_PREVIOUS_WAVE', 'BLOCKED_BY_PREVIOUS_WAVE', 'BLOCKED_BY_PREVIOUS_WAVE'];
  if (JSON.stringify(controllerState.waveStates.map((row) => row.state)) !== JSON.stringify(expectedStates)) {
    issues.push(issue('POSTG_APP_CONTROLLER_WAVE_STATE_INVALID', 'controllerState.waveStates'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 0
      || controllerState.productionAdmission.waveCount !== 0
      || controllerState.productionAdmission.allowed !== false) {
    issues.push(issue('POSTG_APP_M00_PRODUCTION_ADMISSION_FORBIDDEN', 'controllerState.productionAdmission'));
  }

  const contextValidation = validateGlobalContextAuthority(controller.contextAuthority);
  if (!contextValidation.ok) {
    issues.push(issue('POSTG_APP_M01_CONTEXT_AUTHORITY_INVALID', 'globalContextAuthority', {
      contextIssues: contextValidation.issues
    }));
  }
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
      ? 'READY_FOR_WAVE01_ASSESSMENT'
      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'
  };
}

export function resolvePOSTGAPPWave(controller, waveId) {
  const wave = controller.wavePlan.waves.find((row) => row.waveId === waveId);
  if (!wave) return null;
  const sourceMap = new Map(controller.sourceNodes.map((row) => [row.sourceNodeId, row]));
  return {
    ...wave,
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
      state: wave.controllerState,
      sourceNodeCount: wave.sourceNodeIds.length,
      goldenUnitCount: wave.goldenUnitIds?.length ?? 0,
      productionAdmissionGranted: wave.productionAdmissionGranted
    }))
  };
}
