import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03AW3CapabilityHardeningOrderEvidence } from "../../src/curriculum/full-product/p03a-w3-capability-hardening-order-evidence.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP03AW3CapabilityHardeningOrderEvidence() {
  const errors = [];
  const runtime = materializeP03AW3CapabilityHardeningOrderEvidence();
  const claim = readJson("data/project/milestones/FPL-P03A.claim.json");
  const expected = runtime.manifest.expectedCounts;

  push(errors, runtime.taskId === "P03A_W3ContractCapabilityHardeningOrderAndEvidenceReconciliation", "P03A_TASK_ID_DRIFT");
  push(errors, runtime.metrics.capabilityCount === expected.capabilityCount, `P03A_CAPABILITY_COUNT_DRIFT:${runtime.metrics.capabilityCount}`);
  push(errors, runtime.metrics.hardeningStageCount === expected.hardeningStageCount, `P03A_STAGE_COUNT_DRIFT:${runtime.metrics.hardeningStageCount}`);
  push(errors, runtime.metrics.rootNumberSystemCapabilityCount === expected.rootNumberSystemCapabilityCount, "P03A_ROOT_COUNT_DRIFT");
  push(errors, runtime.metrics.domainValidatorCapabilityCount === expected.domainValidatorCapabilityCount, "P03A_VALIDATOR_COUNT_DRIFT");
  push(errors, runtime.metrics.arithmeticCapabilityCount === expected.arithmeticCapabilityCount, "P03A_ARITHMETIC_COUNT_DRIFT");
  push(errors, runtime.metrics.crossDomainNormalizationCapabilityCount === expected.crossDomainNormalizationCapabilityCount, "P03A_NORMALIZATION_COUNT_DRIFT");
  push(errors, runtime.metrics.canonicalDependencyEdgeCount === expected.canonicalDependencyEdgeCount, `P03A_CANONICAL_EDGE_COUNT_DRIFT:${runtime.metrics.canonicalDependencyEdgeCount}`);
  push(errors, runtime.metrics.hardeningGateEdgeCount === expected.hardeningGateEdgeCount, `P03A_HARDENING_GATE_EDGE_COUNT_DRIFT:${runtime.metrics.hardeningGateEdgeCount}`);
  push(errors, runtime.metrics.authoritativeContractEvidenceCount === expected.authoritativeContractEvidenceCount, "P03A_CONTRACT_EVIDENCE_COUNT_DRIFT");
  push(errors, runtime.metrics.sourceDependentCohortEvidenceCount === expected.sourceDependentCohortEvidenceCount, "P03A_SOURCE_EVIDENCE_COUNT_DRIFT");
  push(errors, runtime.metrics.capabilityWithExistingRuntimeEvidenceCount === 0, "P03A_EXISTING_RUNTIME_EVIDENCE_FALSE_POSITIVE");
  push(errors, runtime.metrics.capabilityWithoutExistingRuntimeEvidenceCount === 7, "P03A_MISSING_RUNTIME_EVIDENCE_COUNT_DRIFT");
  push(errors, runtime.metrics.capabilityWithPartialCandidateCount === 3, "P03A_PARTIAL_CANDIDATE_CAPABILITY_COUNT_DRIFT");
  push(errors, runtime.metrics.partialCandidateRelationshipCount === 9, "P03A_PARTIAL_CANDIDATE_RELATIONSHIP_COUNT_DRIFT");
  push(errors, runtime.metrics.uniquePartialCandidatePathCount === 3, "P03A_PARTIAL_CANDIDATE_PATH_COUNT_DRIFT");
  push(errors, runtime.metrics.partialCandidateExistingPathCount === 9, "P03A_PARTIAL_CANDIDATE_MISSING_PATH");
  push(errors, runtime.metrics.capabilityWithProductCompatibilityWitnessCount === 5, "P03A_PRODUCT_WITNESS_COUNT_DRIFT");
  push(errors, runtime.metrics.missingBlockingEvidenceRelationshipCount === 35, `P03A_MISSING_EVIDENCE_COUNT_DRIFT:${runtime.metrics.missingBlockingEvidenceRelationshipCount}`);
  push(errors, runtime.metrics.productionReadyCapabilityCount === 0, "P03A_FALSE_PRODUCTION_READY_CAPABILITY");
  push(errors, runtime.metrics.contractOnlyCapabilityCount === 7, "P03A_CAPABILITY_STATUS_DRIFT");

  push(errors, JSON.stringify(runtime.queue.map((row) => row.capabilityId)) === JSON.stringify(runtime.manifest.expectedQueue), "P03A_QUEUE_IDENTITY_DRIFT");
  push(errors, JSON.stringify(runtime.queue.map((row) => row.nextTaskId)) === JSON.stringify(runtime.manifest.expectedNextTasks), "P03A_NEXT_TASK_IDENTITY_DRIFT");

  for (const row of runtime.queue) {
    push(errors, row.deliveryStatusBeforeP03A === "contract_only", `P03A_STATUS_NOT_CONTRACT_ONLY:${row.capabilityId}:${row.deliveryStatusBeforeP03A}`);
    push(errors, row.hardeningGateOrderValid, `P03A_HARDENING_GATE_ORDER_INVALID:${row.capabilityId}`);
    push(errors, row.canonicalDependenciesIncludedInHardeningGate, `P03A_CANONICAL_DEPENDENCY_NOT_GATED:${row.capabilityId}`);
    push(errors, row.evidenceBundleState.AUTHORITATIVE_CONTRACT === true, `P03A_CONTRACT_EVIDENCE_MISSING:${row.capabilityId}`);
    push(errors, row.evidenceBundleState.SOURCE_DEPENDENT_COHORT === true, `P03A_SOURCE_COHORT_MISSING:${row.capabilityId}`);
    push(errors, row.evidenceBundleState.RUNTIME_CONSUMER === false, `P03A_RUNTIME_EVIDENCE_FALSE_POSITIVE:${row.capabilityId}`);
    push(errors, row.missingBlockingEvidenceIds.length === 5, `P03A_MISSING_EVIDENCE_CARDINALITY_DRIFT:${row.capabilityId}:${row.missingBlockingEvidenceIds.length}`);
    push(errors, row.evidenceReconciliationState === "MISSING_BLOCKING_EVIDENCE", `P03A_EVIDENCE_STATE_DRIFT:${row.capabilityId}`);
    push(errors, row.readyForProductionAdmission === false, `P03A_FALSE_ADMISSION_READY:${row.capabilityId}`);
    push(errors, row.directProductionAdmissionAllowed === false, `P03A_DIRECT_ADMISSION_ENABLED:${row.capabilityId}`);
    for (const candidate of row.partialCandidateEvidence) {
      push(errors, candidate.exists, `P03A_CANDIDATE_PATH_MISSING:${row.capabilityId}:${candidate.repoPath}`);
      push(errors, candidate.productionSufficient === false, `P03A_PARTIAL_CANDIDATE_PROMOTED:${row.capabilityId}:${candidate.repoPath}`);
      push(errors, candidate.evidenceClass === "PARTIAL_COMPONENT_CANDIDATE", `P03A_CANDIDATE_CLASS_DRIFT:${row.capabilityId}`);
    }
    if (row.productCompatibilityWitnessCount > 0) {
      push(errors, row.productCompatibilityWitnessEvidenceClass === "PRODUCT_COMPATIBILITY_WITNESS_ONLY", `P03A_PRODUCT_WITNESS_CLASS_DRIFT:${row.capabilityId}`);
    }
  }

  const first = runtime.getQueueEntry(1);
  push(errors, first?.capabilityId === "cap_fraction_number_system", `P03A_FIRST_CAPABILITY_DRIFT:${first?.capabilityId}`);
  push(errors, first?.readyForImplementationTask === true, "P03A_FIRST_TASK_NOT_READY");
  push(errors, runtime.queue.slice(1).every((row) => row.readyForImplementationTask === false), "P03A_MULTIPLE_IMPLEMENTATION_TASKS_READY");

  push(errors, claim.actualEvidenceLevel === "E3_SHADOW_RUNTIME_INTEGRATED", `P03A_CLAIM_EVIDENCE_DRIFT:${claim.actualEvidenceLevel}`);
  push(errors, claim.claims.runtimeIntegrated === true, "P03A_CLAIM_RUNTIME_NOT_INTEGRATED");
  push(errors, claim.claims.productionAdmitted === false, "P03A_CLAIM_FALSE_PRODUCTION_ADMISSION");
  push(errors, claim.claims.visibleOutputChanged === false, "P03A_CLAIM_VISIBLE_OUTPUT_DRIFT");
  push(errors, claim.nextStep.taskId === "P03B1_W3FractionNumberSystemConsumerAdmission", `P03A_CLAIM_NEXT_TASK_DRIFT:${claim.nextStep.taskId}`);

  const boundary = runtime.manifest.mainlineBoundary;
  push(errors, boundary.planningAndEvidenceReconciliationOnly === true, "P03A_PLANNING_BOUNDARY_MISSING");
  push(errors, boundary.r04CanonicalDependenciesMutated === false, "P03A_R04_DEPENDENCIES_MUTATED");
  push(errors, boundary.w3CapabilityImplementationStarted === false, "P03A_IMPLEMENTATION_SCOPE_DRIFT");
  push(errors, boundary.capabilityPromotionChanged === false, "P03A_PROMOTION_SCOPE_DRIFT");
  push(errors, boundary.newProductAdmissionChanged === false, "P03A_PRODUCT_ADMISSION_SCOPE_DRIFT");
  push(errors, boundary.publicUiChanged === false, "P03A_UI_SCOPE_DRIFT");
  push(errors, boundary.worksheetRendererChanged === false, "P03A_RENDERER_SCOPE_DRIFT");

  const counts = Object.freeze({ ...runtime.metrics });
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP03AW3CapabilityHardeningOrderEvidence();
  process.stdout.write(`P03A_READBACK ${JSON.stringify(result.counts)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
