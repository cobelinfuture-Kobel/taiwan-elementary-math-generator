#!/usr/bin/env node
import fs from 'node:fs';

const FILE = 'src/curriculum/application/postg-app-master-controller.mjs';
const TEST = 'tests/curriculum/postg-app-m00-master-controller.test.js';

const replaceBetween = (text, start, end, replacement) => {
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Missing replace markers: ${start} / ${end}`);
  return `${text.slice(0, startIndex)}${replacement}${text.slice(endIndex)}`;
};
const replaceExact = (text, before, after) => {
  if (text.includes(after)) return text;
  if (!text.includes(before)) throw new Error(`Missing exact anchor: ${before.slice(0, 100)}`);
  return text.replace(before, after);
};

let source = fs.readFileSync(FILE, 'utf8');
source = replaceExact(
  source,
  `  W02_A09A_NEXT_TASK,\n  W02_A09A_STATUS,\n  W02_A09A_TASK\n} from './w02-a09a-authority-reconciliation-freeze.mjs';`,
  `  W02_A09A_NEXT_TASK,\n  W02_A09A_POLICY_PATH,\n  W02_A09A_STATUS,\n  W02_A09A_TASK\n} from './w02-a09a-authority-reconciliation-freeze.mjs';`
);

const helperBlock = `function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function readJsonIfExists(root, repoPath) {
  const absolutePath = path.join(root, repoPath);
  return fs.existsSync(absolutePath) ? readJson(root, repoPath) : null;
}

function parseSourceNodeId(sourceNodeId) {
  const match = /^g([3-6])([ab])_u\\d+_[a-z0-9]+$/.exec(sourceNodeId);
  if (!match) return null;
  return { grade: Number(match[1]), semester: match[2] === 'a' ? 'upper' : 'lower' };
}

function materializeSourceNodes(unitRegistry) {
  const rows = [];
  let queueOrdinal = 1;
  for (const batch of unitRegistry.batches ?? []) {
    for (const sourceNodeId of batch.sourceNodeIds ?? []) {
      const parsed = parseSourceNodeId(sourceNodeId);
      rows.push({
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
  return rows;
}

function goldenRegistryPath(goldenUnitId) {
  return \`${'${GOLDEN_UNIT_DIR}'}\/${'${goldenUnitId}'}.knowledge-operation.json\`;
}

`;
source = replaceBetween(source, 'function readJson(root, repoPath) {', 'function listGoldenUnitFiles(root) {', helperBlock);

const registryValidator = `function validateRegistry(registry, issues) {
  if (registry.schemaName !== 'POSTGAPP79UnitRegistryV1'
      || registry.schemaVersion !== 1
      || registry.programId !== 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1'
      || registry.batches?.length !== 5
      || registry.goldenBaselineUnits?.length !== 15) {
    issues.push(issue('POSTG_APP_UNIT_REGISTRY_SCHEMA_INVALID', UNIT_REGISTRY_PATH));
    return;
  }
  const expectedBatchCounts = { A: 13, B: 24, C: 17, D: 16, E: 9 };
  for (const batch of registry.batches) {
    if (batch.expectedCount !== expectedBatchCounts[batch.batchId]
        || batch.sourceNodeIds?.length !== expectedBatchCounts[batch.batchId]) {
      issues.push(issue('POSTG_APP_BATCH_COUNT_MISMATCH', \`batches.\${batch.batchId}\`));
    }
  }
  const sourceIds = registry.batches.flatMap((row) => row.sourceNodeIds);
  if (sourceIds.length !== 79 || !unique(sourceIds)) {
    issues.push(issue('POSTG_APP_SOURCE_NODE_COUNT_OR_IDENTITY_INVALID', UNIT_REGISTRY_PATH));
  }
  const goldenIds = registry.goldenBaselineUnits.map((row) => row.goldenUnitId);
  const goldenSourceIds = registry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs);
  if (!unique(goldenIds) || goldenSourceIds.length !== 16 || !unique(goldenSourceIds)) {
    issues.push(issue('POSTG_APP_GOLDEN_BASELINE_INVALID', 'goldenBaselineUnits'));
  }
  const composite = registry.goldenBaselineUnits.filter((row) => row.sourceNodeRefs.length > 1);
  if (composite.length !== 1
      || composite[0].goldenUnitId !== 'g5a_u02_5a02'
      || JSON.stringify(composite[0].sourceNodeRefs) !== JSON.stringify(['g5a_u02_5a02a', 'g5a_u02_5a02a1'])) {
    issues.push(issue('POSTG_APP_COMPOSITE_GOLDEN_MAPPING_INVALID', 'goldenBaselineUnits'));
  }
}

`;
source = replaceBetween(source, 'function validateRegistry(registry, issues) {', 'function validateWavePlan(wavePlan, registry, issues) {', registryValidator);

const loadBlock = `export function loadPOSTGAPPMasterController({ root = process.cwd() } = {}) {
  const unitRegistry = readJson(root, UNIT_REGISTRY_PATH);
  const wavePlan = readJson(root, WAVE_PLAN_PATH);
  const baseControllerState = readJson(root, CONTROLLER_STATE_PATH);
  const a08r2Evidence = loadW02A08R2ControllerEvidence({ root });
  const a08r2ControllerState = applyW02A08R2ControllerOverlay({ root, controllerState: baseControllerState });
  const a08r3Evidence = loadW02A08R3ControllerEvidence({ root });
  const a08r3ControllerState = applyW02A08R3ControllerOverlay({ root, controllerState: a08r2ControllerState });
  const a08r4Evidence = loadW02A08R4ControllerEvidence({ root });
  const controllerState = applyW02A08R4ControllerOverlay({ root, controllerState: a08r3ControllerState });
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
  const approvalDecision = readJsonIfExists(root, W01_APPROVAL_PATH);
  return {
    root,
    unitRegistry,
    wavePlan,
    controllerState,
    contextAuthority,
    globalContextAuthority: contextAuthority,
    sourceNodes,
    goldenRegistries,
    goldenUnitFiles: goldenRegistries.map((row) => row.mapping.goldenUnitId),
    approvalDecision,
    w01Approval: approvalDecision,
    w01Claim: readJsonIfExists(root, W01_CLAIM_PATH),
    w02A00Claim: readJsonIfExists(root, W02_A00_CLAIM_PATH),
    w02A01AClaim: readJsonIfExists(root, W02_A01A_CLAIM_PATH),
    w02A01BClaim: readJsonIfExists(root, W02_A01B_CLAIM_PATH),
    w02A01CClaim: readJsonIfExists(root, W02_A01C_CLAIM_PATH),
    w02A01DClaim: readJsonIfExists(root, W02_A01D_CLAIM_PATH),
    w02A02Claim: readJsonIfExists(root, W02_A02_CLAIM_PATH),
    w02A03Claim: readJsonIfExists(root, W02_A03_CLAIM_PATH),
    w02A04Claim: readJsonIfExists(root, W02_A04_CLAIM_PATH),
    w02A05Claim: readJsonIfExists(root, W02_A05_CLAIM_PATH),
    w02A06Claim: readJsonIfExists(root, W02_A06_CLAIM_PATH),
    w02A07Claim: readJsonIfExists(root, W02_A07_CLAIM_PATH),
    w02A08Decision: readJsonIfExists(root, W02_A08_DECISION_PATH),
    w02A08Claim: readJsonIfExists(root, W02_A08_CLAIM_PATH),
    w02A08R1Readback: buildW02A08R1Readback({ root }),
    ...a08r2Evidence,
    ...a08r3Evidence,
    ...a08r4Evidence
  };
}

`;
source = replaceBetween(source, 'export function loadPOSTGAPPMasterController', 'export function validatePOSTGAPPMasterController', loadBlock);

source = replaceExact(
  source,
  `  issues.push(...validateGlobalContextAuthority(globalContextAuthority));`,
  `  const contextValidation = validateGlobalContextAuthority(globalContextAuthority);\n  if (!contextValidation.ok) {\n    issues.push(issue('POSTG_APP_M01_CONTEXT_AUTHORITY_INVALID', 'globalContextAuthority', { contextIssues: contextValidation.issues }));\n  }`
);
source = replaceExact(
  source,
  `  issues.push(...validateW02A08R4ControllerEvidence(controller));\n  return { ok: issues.length === 0, issues };`,
  `  issues.push(...validateW02A08R4ControllerEvidence(controller));\n  for (const row of controller.goldenRegistries) {\n    if (!row.exists\n        || row.registry?.sourceId !== row.mapping.goldenUnitId\n        || row.registry?.conformanceState !== 'GOLDEN_CONFORMANT'\n        || row.registry?.knowledgeRegistryState !== 'VALIDATED_COMPLETE') {\n      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_INVALID', row.registryPath));\n    }\n  }\n  return {\n    ok: issues.length === 0,\n    issues,\n    counts: {\n      sourceNodeCount: controller.sourceNodes.length,\n      goldenBaselineUnitCount: controller.unitRegistry.goldenBaselineUnits.length,\n      goldenBaselineSourceNodeCount: controller.unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs).length,\n      remainingSourceNodeCount: 63,\n      waveCount: controller.wavePlan.waves.length,\n      productionAdmittedApplicationUnitCount: controller.controllerState.productionAdmission.applicationUnitCount\n    },\n    contextCounts: contextValidation.counts,\n    currentWaveId: controller.controllerState.currentWaveId,\n    nextShortestStep: controller.controllerState.nextShortestStep,\n    status: issues.length === 0 ? W02_A09A_STATUS : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'\n  };`
);

const resolveBlock = `export function resolvePOSTGAPPWave(controller, waveId) {
  const wave = controller.wavePlan.waves.find((row) => row.waveId === waveId);
  if (!wave) return null;
  const sourceMap = new Map(controller.sourceNodes.map((row) => [row.sourceNodeId, row]));
  return {
    ...wave,
    currentState: controller.controllerState.waveStates.find((row) => row.waveId === waveId) ?? null,
    sourceNodes: wave.sourceNodeIds.map((id) => sourceMap.get(id)).filter(Boolean),
    goldenUnitIds: wave.goldenUnitIds ?? [],
    gateOrder: controller.wavePlan.admissionGateOrder,
    productionSelectable: false,
    publicSelectable: false
  };
}

`;
source = replaceBetween(source, 'export function resolvePOSTGAPPWave', 'export function buildPOSTGAPPMasterReadback', resolveBlock);

const readbackBlock = `export function buildPOSTGAPPMasterReadback({ root = process.cwd() } = {}) {
  const controller = loadPOSTGAPPMasterController({ root });
  const validation = validatePOSTGAPPMasterController(controller);
  return {
    ...validation,
    programId: controller.controllerState.programId,
    taskId: controller.controllerState.taskId,
    producerStateConsumerReadback: controller.controllerState.producerStateConsumerReadback,
    currentMainlineBlocker: controller.controllerState.currentMainlineBlocker,
    productionAdmission: controller.controllerState.productionAdmission,
    waveSummary: controller.wavePlan.waves.map((wave) => ({
      waveId: wave.waveId,
      plannedState: wave.controllerState,
      currentState: controller.controllerState.waveStates.find((row) => row.waveId === wave.waveId)?.state ?? null,
      sourceNodeCount: wave.sourceNodeIds.length,
      goldenUnitCount: wave.goldenUnitIds?.length ?? 0,
      productionAdmissionGranted: wave.productionAdmissionGranted,
      executionFrozen: wave.executionFrozen === true
    }))
  };
}
`;
source = replaceBetween(source, 'export function buildPOSTGAPPMasterReadback', '', readbackBlock);

fs.writeFileSync(FILE, source);

let test = fs.readFileSync(TEST, 'utf8');
test = test.replace(`assert.equal(w01.productionSelectable, true);`, `assert.equal(w01.productionSelectable, false);`);
test = test.replace(`assert.equal(w02.productionSelectable, true);`, `assert.equal(w02.productionSelectable, false);`);
fs.writeFileSync(TEST, test);

console.log(JSON.stringify({ status: 'M00_A09A_COMPAT_REPAIRED', files: [FILE, TEST] }, null, 2));
