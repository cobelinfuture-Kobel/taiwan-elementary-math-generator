import fs from 'node:fs';
import path from 'node:path';

import {
  loadGlobalContextAuthority,
  validateGlobalContextAuthority
} from '../context/global-context-ontology-resolver.mjs';
import { buildW02A08R1Readback } from './w02-a08r1-student-facing-remediation.mjs';
import {
  applyW02A08R2ControllerOverlay,
  loadW02A08R2ControllerEvidence,
  validateW02A08R2ControllerEvidence,
  W02_A08R2_DECISION_PATH,
  W02_A08R2_EVIDENCE_PATH,
  W02_A08R2_STATUS,
  W02_A08R3_TASK
} from './w02-a08r2-controller-overlay.mjs';
import {
  applyW02A08R3ControllerOverlay,
  loadW02A08R3ControllerEvidence,
  validateW02A08R3ControllerEvidence,
  W02_A08R3_BLOCKER
} from './w02-a08r3-controller-overlay.mjs';
import {
  W02_A08R3_STATUS,
  W02_A08R4_TASK
} from './w02-a08r3-numeric-surface-remediation.mjs';
import {
  applyW02A08R4ControllerOverlay,
  loadW02A08R4ControllerEvidence,
  validateW02A08R4ControllerEvidence
} from './w02-a08r4-controller-overlay.mjs';
import {
  W02_A08R4_CLAIM_PATH,
  W02_A08R4_DECISION_PATH,
  W02_A08R4_EVIDENCE_PATH,
  W02_A08R4_STATUS,
  W03_A00_TASK
} from './w02-a08r4-third-operator-approval.mjs';
import {
  W02_A09A_NEXT_TASK,
  W02_A09A_POLICY_PATH,
  W02_A09A_STATUS,
  W02_A09A_TASK
} from './w02-a09a-authority-reconciliation-freeze.mjs';

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
const W02_A03_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A03.claim.json';
const W02_A04_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A04.claim.json';
const W02_A05_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A05.claim.json';
const W02_A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A06.claim.json';
const W02_A07_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A07.claim.json';
const W02_A08_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A08.claim.json';
const W02_A08_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';
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

const WAVE_SOURCE_COUNTS = Object.freeze({ W01: 15, W02: 13, W03: 13, W04: 13, W05: 13, W06: 12 });
const WAVE_SOURCE_OFFSETS = Object.freeze({ W01: 0, W02: 15, W03: 28, W04: 41, W05: 54, W06: 67 });
const W01_REQUIRED_SOURCE_IDS = Object.freeze([
  'g3a_u01_3a01',
  'g3a_u02_3a02',
  'g3a_u03_3a03',
  'g3a_u04_3a04',
  'g3a_u05_3a05',
  'g3a_u06_3a06',
  'g3a_u07_3a07',
  'g3b_u01_3b01',
  'g3b_u02_3b02',
  'g3b_u03_3b03',
  'g3b_u04_3b04',
  'g3b_u05_3b05',
  'g3b_u06_3b06',
  'g3b_u08_3b08',
  'g4a_u01_4a01'
]);
const W02_REQUIRED_SOURCE_IDS = Object.freeze([
  'g3a_u08_3a08',
  'g3b_u07_3b07',
  'g3b_u09_3b09',
  'g4a_u06_4a06',
  'g4a_u09_4a09',
  'g4b_u03_4b03',
  'g4b_u06_4b06',
  'g4b_u08_4b08',
  'g5a_u01_5a01',
  'g5a_u03_5a03a',
  'g5a_u03_5a03a1',
  'g5a_u04_5a04',
  'g5a_u06_5a06'
]);

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
  return `${GOLDEN_UNIT_DIR}/${goldenUnitId}.knowledge-operation.json`;
}

function listGoldenUnitFiles(root) {
  const dir = path.join(root, GOLDEN_UNIT_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

function validateRegistry(registry, issues) {
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
      issues.push(issue('POSTG_APP_BATCH_COUNT_MISMATCH', `batches.${batch.batchId}`));
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

function validateWavePlan(wavePlan, registry, issues) {
  if (wavePlan.schemaName !== 'POSTGAPPWavePlanV1'
      || wavePlan.schemaVersion !== 1
      || wavePlan.programId !== registry.programId
      || wavePlan.waveCount !== 6
      || wavePlan.waves.length !== 6) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_SCHEMA_INVALID', WAVE_PLAN_PATH));
    return;
  }
  const expectedWaveIds = ['W01', 'W02', 'W03', 'W04', 'W05', 'W06'];
  if (JSON.stringify(wavePlan.waves.map((row) => row.waveId)) !== JSON.stringify(expectedWaveIds)) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_ORDER_INVALID', WAVE_PLAN_PATH));
  }
  for (const wave of wavePlan.waves) {
    if (wave.sourceNodeCount !== WAVE_SOURCE_COUNTS[wave.waveId]) {
      issues.push(issue('POSTG_APP_WAVE_PLAN_SOURCE_COUNT_INVALID', `waves.${wave.waveId}`));
    }
    if (wave.publicRouteChanged !== false || wave.publicSelectable !== false) {
      issues.push(issue('POSTG_APP_WAVE_PLAN_PUBLIC_BOUNDARY_INVALID', `waves.${wave.waveId}`));
    }
  }
  const productionAdmitted = wavePlan.waves.filter((row) => row.productionAdmissionGranted).map((row) => row.waveId);
  if (JSON.stringify(productionAdmitted) !== JSON.stringify(['W01', 'W02'])) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_ADMISSION_PREFIX_INVALID', WAVE_PLAN_PATH, { productionAdmitted }));
  }
  if (wavePlan.coverage?.productionAdmittedWaveCount !== 2) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_COVERAGE_INVALID', WAVE_PLAN_PATH));
  }
  const w03 = wavePlan.waves.find((row) => row.waveId === 'W03');
  if (w03?.executionFrozen !== true
      || w03?.implementationAllowed !== false
      || w03?.freezeAuthorityPath !== W02_A09A_POLICY_PATH) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_W03_FREEZE_INVALID', 'waves.W03'));
  }
  if (wavePlan.lastTransition?.taskId !== W02_A09A_TASK
      || wavePlan.lastTransition?.decision !== 'FREEZE'
      || wavePlan.lastTransition?.frozenWaveId !== 'W03'
      || wavePlan.lastTransition?.nextTaskId !== W02_A09A_NEXT_TASK) {
    issues.push(issue('POSTG_APP_WAVE_PLAN_A09A_TRANSITION_INVALID', 'lastTransition'));
  }
}

function validateW01Evidence(controller, issues) {
  const decision = controller.w01Approval;
  const claim = controller.w01Claim;
  if (decision.operatorDecision !== 'APPROVE'
      || decision.productionAdmission?.granted !== true
      || decision.productionAdmission?.evidenceLevel !== 'E5_PRODUCTION_ADMITTED') {
    issues.push(issue('POSTG_APP_W01_APPROVAL_EVIDENCE_INVALID', W01_APPROVAL_PATH));
  }
  if (claim.actualEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.targetEvidenceLevel !== 'E5_PRODUCTION_ADMITTED'
      || claim.claims?.productionAdmitted !== true
      || claim.claims?.d0Complete !== false) {
    issues.push(issue('POSTG_APP_W01_CLAIM_INVALID', W01_CLAIM_PATH));
  }
}

function validateW02Metrics(state) {
  return state.sourceNodeCount === 13
    && state.atomicContextBindingCount === 61
    && state.singleApplicationCandidateCount === 61
    && state.nPlusOneProofCandidateCount === 61
    && state.misconceptionCandidateCount === 61
    && state.pblBlueprintCount === 61
    && state.validatorFixtureCount === 122
    && state.worksheetProjectionCount === 13;
}

function validateA08Evidence(controller, issues) {
  const a08Decision = controller.w02A08Decision;
  const a08Claim = controller.w02A08Claim;
  const a08r1 = controller.w02A08R1Readback;
  if (a08Decision?.operatorDecision !== 'REVISE'
      || a08Decision?.productionAdmission?.granted !== false
      || a08Decision?.remediation?.taskId !== 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview') {
    issues.push(issue('POSTG_APP_W02_A08_REVISE_DECISION_INVALID', W02_A08_DECISION_PATH));
  }
  if (a08Claim?.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || a08Claim?.claims?.productionAdmitted !== false
      || a08Claim?.claims?.humanReviewReady !== true
      || a08Claim?.humanReview?.decision !== 'REVISE') {
    issues.push(issue('POSTG_APP_W02_A08_CLAIM_INVALID', W02_A08_CLAIM_PATH));
  }
  if (!a08r1?.ok
      || a08r1?.status !== 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'
      || a08r1?.counts?.generatedItemCount !== 195
      || a08r1?.counts?.validatedItemCount !== 195
      || a08r1?.counts?.applicationReviewCount !== 61
      || a08r1?.counts?.numericBoundaryReviewCount !== 49
      || a08r1?.counts?.pblReviewCount !== 31
      || a08r1?.counts?.pbl3Count !== 19
      || a08r1?.counts?.pbl5Count !== 12
      || a08r1?.counts?.operationFamilyCount !== 49
      || a08r1?.counts?.applicationRawRoleLeakageCount !== 0
      || a08r1?.counts?.applicationInternalIdLeakageCount !== 0
      || a08r1?.counts?.applicationInternalTokenLeakageCount !== 0
      || a08r1?.counts?.applicationMalformedSurfaceCount !== 0
      || a08r1?.counts?.applicationMissingAnswerCount !== 0
      || a08r1?.counts?.applicationSameDenominatorKnowledgeMismatchCount !== 0
      || a08r1?.counts?.applicationLengthConversionSurfaceMismatchCount !== 0
      || a08r1?.counts?.applicationRateDistanceSurfaceMismatchCount !== 0
      || a08r1?.counts?.applicationFractionalCapacityDisplayMismatchCount !== 0
      || a08r1?.counts?.applicationGradeInappropriateFractionVariableCount !== 0
      || a08r1?.counts?.numericRawRoleLeakageCount !== 0
      || a08r1?.counts?.numericInternalIdLeakageCount !== 0
      || a08r1?.counts?.numericInternalTokenLeakageCount !== 0
      || a08r1?.counts?.numericMalformedSurfaceCount !== 0
      || a08r1?.counts?.pblMissingDependencyLinkageCount !== 0
      || a08r1?.counts?.pblMissingRealUseDecisionCount !== 0
      || a08r1?.counts?.pblNotInstantiatedCount !== 0
      || a08r1?.counts?.pblMissingFinalDecisionCount !== 0
      || a08r1?.counts?.pblInternalIdLeakageCount !== 0
      || a08r1?.counts?.pblInternalTokenLeakageCount !== 0
      || a08r1?.counts?.pblMalformedSurfaceCount !== 0
      || a08r1?.counts?.pblGenericTaskSurfaceCount !== 0
      || a08r1?.counts?.pblGovernancePhraseLeakageCount !== 0
      || a08r1?.counts?.pblGenericProductLabelCount !== 0
      || a08r1?.counts?.pblDuplicatedTaskSurfaceCount !== 0
      || a08r1?.studentFacingSurfaceVersion !== 'W02_A08R1_V1'
      || a08r1?.studentFacingSemanticRevision !== 3
      || a08r1?.studentFacingInstantiationVersion !== 'W02_A08R1_V1'
      || a08r1?.applicationMacroContextCount !== 16
      || a08r1?.productionAdmissionGranted !== false
      || a08r1?.publicSelectable !== false
      || a08r1?.nextShortestStep !== 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision') {
    issues.push(issue('POSTG_APP_W02_A08R1_READBACK_INVALID', 'POSTG-APP-W02-A08R1'));
  }
}

export function loadPOSTGAPPMasterController({ root = process.cwd() } = {}) {
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

export function validatePOSTGAPPMasterController(controller) {
  const issues = [];
  const { unitRegistry, wavePlan, controllerState, goldenUnitFiles, globalContextAuthority } = controller;
  validateRegistry(unitRegistry, issues);
  validateWavePlan(wavePlan, unitRegistry, issues);
  const contextValidation = validateGlobalContextAuthority(globalContextAuthority);
  if (!contextValidation.ok) {
    issues.push(issue('POSTG_APP_M01_CONTEXT_AUTHORITY_INVALID', 'globalContextAuthority', { contextIssues: contextValidation.issues }));
  }
  validateW01Evidence(controller, issues);
  if (goldenUnitFiles.length !== 15) {
    issues.push(issue('POSTG_APP_GOLDEN_UNIT_COUNT_INVALID', GOLDEN_UNIT_DIR, { actual: goldenUnitFiles.length }));
  }
  const admitted = controllerState.waveStates.reduce((acc, row) => {
    if (row.productionAdmissionGranted) acc.admitted.push(row.waveId);
    if (row.state === 'PRODUCTION_ADMITTED') acc.productionStates.push(row.waveId);
    return acc;
  }, { admitted: [], productionStates: [] });
  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01', 'W02'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));
  if (JSON.stringify(admitted.productionStates) !== JSON.stringify(admitted.admitted)) issues.push(issue('POSTG_APP_PRODUCTION_STATE_MISMATCH', 'waves'));
  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE',
    'BLOCKED_BY_PREVIOUS_WAVE'
  ];
  if (JSON.stringify(controllerState.waveStates.map((row) => row.state)) !== JSON.stringify(expectedStates)) {
    issues.push(issue('POSTG_APP_WAVE_STATE_TRANSITION_INVALID', 'waves'));
  }
  const w01State = controllerState.waveStates[0];
  if (JSON.stringify(w01State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER)
      || !w01State.admissionGateComplete
      || !w01State.productionAdmissionGranted
      || w01State.reviewDecision !== 'APPROVE') {
    issues.push(issue('POSTG_APP_W01_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W01'));
  }
  const w02State = controllerState.waveStates[1];
  if (!Array.isArray(w02State.completedGates)
      || JSON.stringify(w02State.completedGates) !== JSON.stringify(REQUIRED_GATE_ORDER)
      || w02State.productionAdmissionGranted !== true
      || w02State.admissionGateComplete !== true
      || w02State.reviewDecision !== 'APPROVE'
      || w02State.reviewEvidence !== W02_A08R4_EVIDENCE_PATH
      || w02State.decisionEvidence !== W02_A08R4_DECISION_PATH
      || w02State.operatorDecisionState !== 'THIRD_APPROVE_RECORDED'
      || w02State.generatedItemCount !== 195
      || w02State.numericGeneratedItemCount !== 134
      || w02State.applicationGeneratedItemCount !== 61
      || w02State.pblReviewCount !== 31
      || w02State.numericStudentFacingSemanticRevision !== 4
      || w02State.unresolvedRequestedRoleSurfaceCount !== 0
      || w02State.answerEquivalentGivenLeakageCount !== 0
      || w02State.malformedOrIncoherentNumericSurfaceCount !== 0
      || w02State.gradeUnsafeNotationCount !== 0
      || w02State.productionRuntimeAccessEnabled !== true
      || w02State.publicSelectableCandidateCount !== 0
      || w02State.canonicalCurriculumAuthorityReconciliationRequired !== true
      || w02State.canonicalCurriculumAuthorityReconciled !== false
      || w02State.globalContextSingleApplicationAuthorityRequired !== true
      || w02State.legacyApplicationRoutesFrozen !== true) {
    issues.push(issue('POSTG_APP_W02_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  const w03State = controllerState.waveStates[2];
  if (w03State.state !== 'ASSESSMENT_READY'
      || w03State.productionAdmissionGranted !== false
      || w03State.shadowProjectionAllowed !== false
      || w03State.executionFrozen !== true
      || w03State.implementationAllowed !== false
      || w03State.freezeStatus !== W02_A09A_STATUS) {
    issues.push(issue('POSTG_APP_W03_ASSESSMENT_READY_FREEZE_INVALID', 'controllerState.waveStates.W03'));
  }
  if (controllerState.currentWaveId !== 'W02'
      || controllerState.currentCapability !== W02_A09A_STATUS
      || controllerState.currentMainlineBlocker !== 'BATCH_B_CANONICAL_KNOWLEDGE_POINT_AUTHORITY_AND_SHARED_PUBLIC_APPLICATION_CONSUMER_PENDING'
      || controllerState.nextShortestStep !== W02_A09A_NEXT_TASK
      || controllerState.mainlineExecutionFreeze?.active !== true
      || controllerState.mainlineExecutionFreeze?.authorityPath !== W02_A09A_POLICY_PATH) {
    issues.push(issue('POSTG_APP_CONTROLLER_TRANSITION_INVALID', 'controllerState'));
  }
  if (controllerState.productionAdmission.applicationUnitCount !== 25
      || controllerState.productionAdmission.waveCount !== 2
      || controllerState.productionAdmission.allowed !== true
      || controllerState.productionAdmission.lastReviewDecision !== 'APPROVE'
      || JSON.stringify(controllerState.productionAdmission.admittedWaveIds ?? []) !== JSON.stringify(['W01', 'W02'])
      || controllerState.productionAdmission.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.productionAdmission'));
  }
  validateA08Evidence(controller, issues);
  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));
  issues.push(...validateW02A08R4ControllerEvidence(controller));
  for (const row of controller.goldenRegistries) {
    if (!row.exists
        || row.registry?.sourceId !== row.mapping.goldenUnitId
        || row.registry?.conformanceState !== 'GOLDEN_CONFORMANT'
        || row.registry?.knowledgeRegistryState !== 'VALIDATED_COMPLETE') {
      issues.push(issue('POSTG_APP_GOLDEN_REGISTRY_INVALID', row.registryPath));
    }
  }
  return {
    ok: issues.length === 0,
    issues,
    counts: {
      sourceNodeCount: controller.sourceNodes.length,
      goldenBaselineUnitCount: controller.unitRegistry.goldenBaselineUnits.length,
      goldenBaselineSourceNodeCount: controller.unitRegistry.goldenBaselineUnits.flatMap((row) => row.sourceNodeRefs).length,
      remainingSourceNodeCount: 63,
      waveCount: controller.wavePlan.waves.length,
      productionAdmittedApplicationUnitCount: controller.controllerState.productionAdmission.applicationUnitCount
    },
    contextCounts: contextValidation.counts,
    currentWaveId: controller.controllerState.currentWaveId,
    nextShortestStep: controller.controllerState.nextShortestStep,
    status: issues.length === 0 ? W02_A09A_STATUS : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'
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
    goldenUnitIds: wave.goldenUnitIds ?? [],
    gateOrder: controller.wavePlan.admissionGateOrder,
    productionSelectable: false,
    publicSelectable: false
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
