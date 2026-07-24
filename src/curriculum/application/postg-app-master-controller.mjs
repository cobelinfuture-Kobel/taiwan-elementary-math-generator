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
  W02_A08R4_EVIDENCE_PATH
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
    w02A02Claim: readJsonIfExists(root, W02_A02_CLAIM_PATH),
    w02A03Claim: readJsonIfExists(root, W02_A03_CLAIM_PATH),
    w02A04Claim: readJsonIfExists(root, W02_A04_CLAIM_PATH),
    w02A05Claim: readJsonIfExists(root, W02_A05_CLAIM_PATH),
    w02A06Claim: readJsonIfExists(root, W02_A06_CLAIM_PATH),
    w02A07Claim: readJsonIfExists(root, W02_A07_CLAIM_PATH),
    w02A08Claim: readJsonIfExists(root, W02_A08_CLAIM_PATH),
    w02A08Decision: readJsonIfExists(root, W02_A08_DECISION_PATH),
    w02A08R1Readback: buildW02A08R1Readback({ root }),
    ...a08r2Evidence,
    ...a08r3Evidence,
    ...a08r4Evidence
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

function validateW02Metrics(w02State) {
  const expected = {
    assessmentBaselineState: 'SOURCE_AUTHORITY_BASELINE_READY',
    sourceMetadataAvailableCount: 13,
    sourceNodeCount: 13,
    sourcePdfReferenceCount: 13,
    uniquePdfContentCount: 12,
    totalSourcePdfPageCount: 31,
    knowledgePointCandidateCount: 90,
    uniqueContentKnowledgePointCandidateCount: 84,
    applicationRequiredCount: 17,
    applicationCompatibleCount: 27,
    applicationNotApplicableCount: 46,
    canonicalOperationModelCount: 90,
    uniqueContentCanonicalOperationModelCount: 84,
    numericPatternSpecCount: 134,
    applicationPatternSpecCount: 61,
    hiddenPatternSpecCount: 195,
    visiblePatternSpecCount: 0,
    hiddenPatternSpecsComplete: true,
    forcedStoryAuthoringAllowed: false,
    atomicContextBindingCount: 61,
    singleApplicationCandidateCount: 61,
    macroContextDomainCount: 16,
    duplicateContentProjectionParity: true,
    atomicContextBindingsComplete: true,
    nPlusOneProofCandidateCount: 61,
    misconceptionCandidateCount: 183,
    pblEligibleCandidateCount: 31,
    pblTaskSetCandidateCount: 31,
    crossContextPairCount: 61,
    pbl3TaskSetCandidateCount: 19,
    pbl5TaskSetCandidateCount: 12,
    duplicateProofProjectionParity: true,
    duplicatePblProjectionParity: true,
    compatiblePblCandidateCount: 0,
    nPlusOnePblBlueprintsComplete: true,
    validatorFixtureCount: 672,
    validatorPositiveFixtureCount: 275,
    validatorNegativeFixtureCount: 397,
    validatorPassCount: 275,
    validatorExpectedRejectCount: 397,
    validatorUnexpectedPassCount: 0,
    validatorUnexpectedRejectCount: 0,
    pairedNPlusOneExecutionCount: 61,
    misconceptionExecutionCount: 183,
    calculationPassInterpretationFailCount: 122,
    counterfactualExecutionCount: 61,
    crossContextExecutionCount: 61,
    uniquenessNegativeExecutionCount: 61,
    pblDependencyExecutionCount: 62,
    sourceNodeRuntimeCoverageCount: 13,
    primaryMacroContextRuntimeCoverageCount: 16,
    alternateMacroContextRuntimeCoverageCount: 2,
    operationFamilyRuntimeCoverageCount: 22,
    answerShapeRuntimeCoverageCount: 2,
    adapterRuntimeCoverageCount: 2,
    duplicateFixtureProjectionGroupCount: 1,
    duplicateFixtureProjectionParity: true,
    validatorFixturesComplete: true,
    sharedRuntimeShadowPass: true,
    applicationCapabilityEntryCount: 61,
    applicationQuestionRecordCount: 61,
    answerKeyRecordCount: 61,
    sharedPblTaskSetRecordCount: 31,
    worksheetProjectionCount: 13,
    futureWaveFailClosedFixtureCount: 1,
    duplicateWorksheetProjectionGroupCount: 1,
    duplicateWorksheetProjectionParity: true,
    shadowHtmlCount: 0,
    sharedWorksheetProjectionComplete: true,
    generatedItemCount: 195,
    numericGeneratedItemCount: 134,
    applicationGeneratedItemCount: 61,
    productionOperationFamilyCount: 49,
    productionValidatedItemCount: 195,
    htmlArtifactCount: 2,
    pdfArtifactCount: 2,
    numericPdfPageCount: 68,
    applicationPdfPageCount: 42,
    artifactHashCount: 10,
    productionEquivalentOutputVerified: true,
    humanReviewReady: true,
    humanReviewPackageComplete: true,
    applicationReviewCount: 61,
    pblReviewCount: 31,
    pbl3ReviewCount: 19,
    pbl5ReviewCount: 12,
    numericBoundaryReviewCount: 49,
    reviewMacroContextCount: 16,
    reviewArtifactCount: 10,
    productionAdmittedCandidateCount: 0,
    publicSelectableCandidateCount: 0,
    operatorDecisionState: 'SECOND_REVISE_RECORDED',
    remediationState: 'PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY',
    studentFacingSemanticRevision: 3,
    remediatedGeneratedItemCount: 195,
    remediatedApplicationReviewCount: 61,
    remediatedNumericBoundaryReviewCount: 49,
    remediatedPblReviewCount: 31,
    studentFacingSemanticAuditPass: true,
    regeneratedHtmlPdfReviewReady: true
  };
  return Object.entries(expected).every(([key, value]) => w02State[key] === value);
}

function validateA08Evidence(controller) {
  const issues = [];
  const { w02A08Claim, w02A08Decision, w02A08R1Readback } = controller;
  if (!w02A08Claim
      || w02A08Claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || w02A08Claim.claimedStatus !== 'W02_OPERATOR_REVIEW_REVISE_REQUIRED'
      || w02A08Claim.claims?.operatorDecisionRecorded !== true
      || w02A08Claim.claims?.operatorDecision !== 'REVISE'
      || w02A08Claim.claims?.productionAdmitted !== false
      || w02A08Claim.claims?.publicSelectable !== false
      || w02A08Claim.claims?.d0Complete !== false
      || w02A08Claim.nextStep?.taskId !== 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview') {
    issues.push(issue('POSTG_APP_W02_A08_CLAIM_INVALID', W02_A08_CLAIM_PATH));
  }
  if (!w02A08Decision
      || w02A08Decision.operatorDecision !== 'REVISE'
      || w02A08Decision.productionAdmission?.granted !== false
      || w02A08Decision.controllerTransition?.waveState !== 'OPERATOR_REVIEW_REVISE_REQUIRED'
      || w02A08Decision.controllerTransition?.reviewDecision !== 'REVISE'
      || w02A08Decision.failClosedBoundaries?.publicSelectable !== false
      || w02A08Decision.failClosedBoundaries?.w03ToW06Unblocked !== false
      || w02A08Decision.remediation?.taskId !== 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview') {
    issues.push(issue('POSTG_APP_W02_A08_DECISION_INVALID', W02_A08_DECISION_PATH));
  }
  if (!w02A08R1Readback?.ok
      || w02A08R1Readback.status !== 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'
      || w02A08R1Readback.studentFacingSemanticRevision !== 3
      || w02A08R1Readback.productionAdmissionGranted !== false
      || w02A08R1Readback.counts?.generatedItemCount !== 195
      || w02A08R1Readback.counts?.applicationReviewCount !== 61
      || w02A08R1Readback.counts?.numericBoundaryReviewCount !== 49
      || w02A08R1Readback.counts?.pblReviewCount !== 31
      || w02A08R1Readback.nextShortestStep !== 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision') {
    issues.push(issue('POSTG_APP_W02_A08R1_READBACK_INVALID', 'w02A08R1Readback'));
  }
  return issues;
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
    w02A02Claim,
    w02A03Claim,
    w02A04Claim,
    w02A05Claim,
    w02A06Claim,
    w02A07Claim
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
  const w03Plan = wavePlan.waves.find((row) => row.waveId === 'W03');
  if (w03Plan?.executionFrozen !== true
      || w03Plan?.implementationAllowed !== false
      || w03Plan?.freezeAuthorityPath !== W02_A09A_POLICY_PATH
      || wavePlan.lastTransition?.taskId !== W02_A09A_TASK
      || wavePlan.lastTransition?.frozenWaveId !== 'W03'
      || wavePlan.lastTransition?.nextTaskId !== W02_A09A_NEXT_TASK) {
    issues.push(issue('POSTG_APP_W03_WAVE_PLAN_FREEZE_INVALID', 'waves.W03'));
  }

  const admitted = admissionPrefix(wavePlan.waves);
  if (!admitted.contiguous) issues.push(issue('POSTG_APP_PRODUCTION_ADMISSION_PREFIX_INVALID', 'waves'));
  if (JSON.stringify(admitted.admitted) !== JSON.stringify(['W01', 'W02'])) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_SET_INVALID', 'waves'));
  if (wavePlan.coverage?.productionAdmittedWaveCount !== admitted.admitted.length) issues.push(issue('POSTG_APP_PRODUCTION_ADMITTED_WAVE_COUNT_MISMATCH', 'coverage.productionAdmittedWaveCount'));
  if (JSON.stringify(wavePlan.admissionGateOrder) !== JSON.stringify(REQUIRED_GATE_ORDER)) issues.push(issue('POSTG_APP_ADMISSION_GATE_ORDER_INVALID', 'admissionGateOrder'));

  const expectedStates = [
    'PRODUCTION_ADMITTED',
    'PRODUCTION_ADMITTED',
    'ASSESSMENT_READY',
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
      || w02State.legacyApplicationRoutesFrozen !== true
      || !validateW02Metrics(w02State)) {
    issues.push(issue('POSTG_APP_W02_PRODUCTION_ADMISSION_STATE_INVALID', 'controllerState.waveStates.W02'));
  }
  const w03State = controllerState.waveStates[2];
  if (w03State.state !== 'ASSESSMENT_READY'
      || w03State.productionAdmissionGranted !== false
      || w03State.shadowProjectionAllowed !== false
      || w03State.executionFrozen !== true
      || w03State.implementationAllowed !== false
      || w03State.freezeStatus !== W02_A09A_STATUS) {
    issues.push(issue('POSTG_APP_W03_EXECUTION_FREEZE_INVALID', 'controllerState.waveStates.W03'));
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

  const shadowClaims = [
    [w02A00Claim, W02_A00_CLAIM_PATH, 'POSTG_APP_W02_A00_CLAIM_INVALID', 'W02_SOURCE13_AUTHORITY_AND_READINESS_BASELINE_READY', 'POSTG-APP-W02-A01_13SourceNodeKnowledgeOperationCandidateMaterializationAndKPClassification'],
    [w02A01AClaim, W02_A01A_CLAIM_PATH, 'POSTG_APP_W02_A01A_CLAIM_INVALID', 'W02_SOURCE13_PDF_EVIDENCE_HASH_LOCKED_RENDERABLE', 'POSTG-APP-W02-A01B_PageLevelKnowledgeOperationCandidateMaterializationAndKPClassification'],
    [w02A01BClaim, W02_A01B_CLAIM_PATH, 'POSTG_APP_W02_A01B_CLAIM_INVALID', 'W02_PAGE_EVIDENCED_KP_CANDIDATES_CLASSIFIED', 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization'],
    [w02A01CClaim, W02_A01C_CLAIM_PATH, 'POSTG_APP_W02_A01C_CLAIM_INVALID', 'W02_CANONICAL_OPERATION_MODELS_MATERIALIZED', 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization'],
    [w02A01DClaim, W02_A01D_CLAIM_PATH, 'POSTG_APP_W02_A01D_CLAIM_INVALID', 'W02_HIDDEN_PATTERNSPECS_MATERIALIZED', 'POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization'],
    [w02A02Claim, W02_A02_CLAIM_PATH, 'POSTG_APP_W02_A02_CLAIM_INVALID', 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATES_MATERIALIZED', 'POSTG-APP-W02-A03_NPlusOneProofMisconceptionAndPBLCandidateContract'],
    [w02A03Claim, W02_A03_CLAIM_PATH, 'POSTG_APP_W02_A03_CLAIM_INVALID', 'W02_N_PLUS_ONE_PROOF_MISCONCEPTION_AND_PBL_BLUEPRINTS_MATERIALIZED', 'POSTG-APP-W02-A04_ValidatorFixturesAndSharedRuntimeShadow'],
    [w02A04Claim, W02_A04_CLAIM_PATH, 'POSTG_APP_W02_A04_CLAIM_INVALID', 'W02_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_PASS', 'POSTG-APP-W02-A05_SharedWorksheetProjectionContractAndW02ShadowProjection'],
    [w02A05Claim, W02_A05_CLAIM_PATH, 'POSTG_APP_W02_A05_CLAIM_INVALID', 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS', 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration']
  ];
  for (const [claim, pathValue, code, claimedStatus, nextTaskId] of shadowClaims) {
    issues.push(...validateShadowClaim({ claim, pathValue, code, claimedStatus, nextTaskId }));
  }

  if (!w02A06Claim
      || w02A06Claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || w02A06Claim.claimedStatus !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'
      || w02A06Claim.claims?.runtimeIntegrated !== true
      || w02A06Claim.claims?.productionEquivalentGeneratorUsed !== true
      || w02A06Claim.claims?.productionRendererUsed !== true
      || w02A06Claim.claims?.htmlOutputVerified !== true
      || w02A06Claim.claims?.pdfOutputVerified !== true
      || w02A06Claim.claims?.visibleOutputChanged !== false
      || w02A06Claim.claims?.humanReviewReady !== false
      || w02A06Claim.claims?.productionAdmitted !== false
      || w02A06Claim.claims?.d0Complete !== false
      || w02A06Claim.nextStep?.taskId !== 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage') {
    issues.push(issue('POSTG_APP_W02_A06_CLAIM_INVALID', W02_A06_CLAIM_PATH));
  }
  if (!w02A07Claim
      || w02A07Claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
      || w02A07Claim.claimedStatus !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
      || w02A07Claim.claims?.runtimeIntegrated !== true
      || w02A07Claim.claims?.productionEquivalentGeneratorUsed !== true
      || w02A07Claim.claims?.productionRendererUsed !== true
      || w02A07Claim.claims?.htmlOutputVerified !== true
      || w02A07Claim.claims?.pdfOutputVerified !== true
      || w02A07Claim.claims?.visibleOutputChanged !== true
      || w02A07Claim.claims?.humanReviewReady !== true
      || w02A07Claim.claims?.productionAdmitted !== false
      || w02A07Claim.claims?.d0Complete !== false
      || w02A07Claim.humanReview?.type !== 'production_equivalent_output_review'
      || w02A07Claim.evidence?.reviewArtifactPaths?.length !== 10
      || w02A07Claim.evidence?.artifactHashes?.length !== 10
      || w02A07Claim.nextStep?.taskId !== 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission') {
    issues.push(issue('POSTG_APP_W02_A07_CLAIM_INVALID', W02_A07_CLAIM_PATH));
  }
  issues.push(...validateA08Evidence(controller));
  issues.push(...validateW02A08R2ControllerEvidence(controller));
  issues.push(...validateW02A08R3ControllerEvidence(controller));
  issues.push(...validateW02A08R4ControllerEvidence(controller));

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
      ? W02_A09A_STATUS
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
