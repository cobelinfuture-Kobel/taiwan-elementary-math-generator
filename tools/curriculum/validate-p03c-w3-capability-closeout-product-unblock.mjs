import { fileURLToPath } from "node:url";

import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "../../src/curriculum/full-product/p03c-w3-capability-closeout-product-unblock.mjs";

const EXPECTED_W3_IDS = [
  "cap_fraction_number_system",
  "cap_decimal_number_system",
  "cap_fraction_domain_validator",
  "cap_decimal_domain_validator",
  "cap_fraction_arithmetic",
  "cap_decimal_arithmetic",
  "cap_mixed_number_domain_normalization",
];

const EXPECTED_WAVE_COUNTS = {
  "R05-W0": 4,
  "R05-W3": 82,
  "R05-W4": 11,
  "R05-W6": 1,
  "R05-W7": 18,
  "R05-W8": 3,
};

const PROTECTED_D0_IDS = [
  "kp_g3a_u01_digit_arrangement_max_min",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4b_u01_trailing_zero_division_remainder_restore",
];

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP03CW3CapabilityCloseoutProductUnblockReconciliation() {
  const runtime = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const errors = [];

  push(errors, runtime.taskId === "P03C_W3CapabilityCloseoutAndProductUnblockReconciliation", "P03C_TASK_ID_DRIFT");
  push(errors, JSON.stringify(runtime.requiredW3CapabilityIds) === JSON.stringify(EXPECTED_W3_IDS), `P03C_REQUIRED_W3_IDS_DRIFT:${runtime.requiredW3CapabilityIds.join(",")}`);
  push(errors, EXPECTED_W3_IDS.every((id) => runtime.effectivePromotionCapabilityIds.includes(id)), `P03C_EFFECTIVE_PROMOTION_IDS_MISSING:${runtime.effectivePromotionCapabilityIds.join(",")}`);
  push(errors, runtime.metrics.w3CapabilityCount === 7, `P03C_W3_CAPABILITY_COUNT_DRIFT:${runtime.metrics.w3CapabilityCount}`);
  push(errors, runtime.metrics.productionAdmittedW3CapabilityCount === 7, `P03C_CLOSED_W3_CAPABILITY_COUNT_DRIFT:${runtime.metrics.productionAdmittedW3CapabilityCount}`);
  push(errors, runtime.metrics.remainingW3ContractCapabilityCount === 0, `P03C_REMAINING_W3_CONTRACT_COUNT:${runtime.metrics.remainingW3ContractCapabilityCount}`);
  push(errors, runtime.metrics.w3E5ClaimCount === 7, `P03C_W3_E5_CLAIM_COUNT_DRIFT:${runtime.metrics.w3E5ClaimCount}`);
  push(errors, runtime.metrics.effectivePromotionCount === 12, `P03C_EFFECTIVE_PROMOTION_COUNT_DRIFT:${runtime.metrics.effectivePromotionCount}`);

  for (const row of runtime.capabilityCloseoutRows) {
    push(errors, row.closeoutState === "W3_CAPABILITY_PRODUCTION_ADMISSION_CLOSED", `P03C_CAPABILITY_NOT_CLOSED:${row.capabilityId}:${row.closeoutState}`);
    push(errors, row.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", `P03C_CAPABILITY_EVIDENCE_DRIFT:${row.capabilityId}:${row.actualEvidenceLevel}`);
    push(errors, row.runtimeIntegrated === true, `P03C_CAPABILITY_RUNTIME_NOT_INTEGRATED:${row.capabilityId}`);
    push(errors, row.productionAdmitted === true, `P03C_CAPABILITY_NOT_PRODUCTION_ADMITTED:${row.capabilityId}`);
    push(errors, row.effectiveDeliveryStatus === "production_admitted", `P03C_CAPABILITY_DELIVERY_STATUS_DRIFT:${row.capabilityId}:${row.effectiveDeliveryStatus}`);
    push(errors, row.hardeningGateSatisfied === true, `P03C_HARDENING_GATE_UNSATISFIED:${row.capabilityId}`);
  }

  push(errors, runtime.historicalInventory.metrics.directW3KnowledgePointCount === 82, `P03C_DIRECT_W3_COUNT_DRIFT:${runtime.historicalInventory.metrics.directW3KnowledgePointCount}`);
  push(errors, runtime.metrics.dependentKnowledgePointCount === 119, `P03C_DEPENDENT_KP_COUNT_DRIFT:${runtime.metrics.dependentKnowledgePointCount}`);
  push(errors, runtime.metrics.capabilityUnblockedKnowledgePointCount === 119, `P03C_UNBLOCKED_KP_COUNT_DRIFT:${runtime.metrics.capabilityUnblockedKnowledgePointCount}`);
  push(errors, runtime.metrics.capabilityBlockedKnowledgePointCount === 0, `P03C_BLOCKED_KP_COUNT_DRIFT:${runtime.metrics.capabilityBlockedKnowledgePointCount}`);
  push(errors, runtime.metrics.protectedExistingD0KnowledgePointCount === 4, `P03C_PROTECTED_D0_COUNT_DRIFT:${runtime.metrics.protectedExistingD0KnowledgePointCount}`);
  push(errors, runtime.metrics.newProductDependentKnowledgePointCount === 115, `P03C_NEW_PRODUCT_DEPENDENT_COUNT_DRIFT:${runtime.metrics.newProductDependentKnowledgePointCount}`);
  push(errors, runtime.metrics.dependentSourceNodeCount === 28, `P03C_SOURCE_COUNT_DRIFT:${runtime.metrics.dependentSourceNodeCount}`);
  push(errors, runtime.metrics.dependentWaveCount === 6, `P03C_WAVE_COUNT_DRIFT:${runtime.metrics.dependentWaveCount}`);
  push(errors, JSON.stringify(runtime.metrics.dependentCountsByWave) === JSON.stringify(EXPECTED_WAVE_COUNTS), `P03C_WAVE_DISTRIBUTION_DRIFT:${JSON.stringify(runtime.metrics.dependentCountsByWave)}`);

  for (const row of runtime.downstreamUnblockRows) {
    push(errors, row.historicalCapabilityBlocked === true, `P03C_HISTORICAL_BLOCKED_EVIDENCE_MUTATED:${row.knowledgePointId}`);
    push(errors, row.capabilityUnblocked === true, `P03C_ROW_STILL_CAPABILITY_BLOCKED:${row.knowledgePointId}:${row.missingW3CapabilityIds.join(",")}`);
    push(errors, row.missingW3CapabilityIds.length === 0, `P03C_ROW_MISSING_PROMOTION:${row.knowledgePointId}:${row.missingW3CapabilityIds.join(",")}`);
    push(errors, row.directNewProductAdmissionAllowed === false, `P03C_DIRECT_NEW_PRODUCT_ADMISSION_ENABLED:${row.knowledgePointId}`);
    push(errors, row.newlyProductAdmittedByP03C === false, `P03C_NEW_PRODUCT_ADMISSION_FABRICATED:${row.knowledgePointId}`);
    push(errors, row.nextProductActions.every((action) => !action.startsWith("IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY")), `P03C_STALE_CAPABILITY_ACTION_RETAINED:${row.knowledgePointId}`);
  }

  const protectedRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING");
  const acceptanceRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING");
  const bindingRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED");
  const verticalRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED");

  push(errors, protectedRows.length === 4, `P03C_PROTECTED_REVALIDATION_COUNT_DRIFT:${protectedRows.length}`);
  push(errors, acceptanceRows.length === 0, `P03C_ACCEPTANCE_PENDING_COUNT_DRIFT:${acceptanceRows.length}`);
  push(errors, bindingRows.length === 0, `P03C_PATTERN_BINDING_REQUIRED_COUNT_DRIFT:${bindingRows.length}`);
  push(errors, verticalRows.length === 115, `P03C_VERTICAL_SLICE_COUNT_DRIFT:${verticalRows.length}`);
  push(errors, runtime.metrics.currentProtectedProductAdmissionCount === 4, `P03C_PROTECTED_PRODUCT_ADMISSION_COUNT_DRIFT:${runtime.metrics.currentProtectedProductAdmissionCount}`);
  push(errors, runtime.metrics.newProductAdmissionCount === 0, `P03C_NEW_PRODUCT_ADMISSION_COUNT_DRIFT:${runtime.metrics.newProductAdmissionCount}`);
  push(errors, JSON.stringify(protectedRows.map((row) => row.knowledgePointId).sort()) === JSON.stringify([...PROTECTED_D0_IDS].sort()), `P03C_PROTECTED_D0_IDENTITY_DRIFT:${protectedRows.map((row) => row.knowledgePointId).sort().join(",")}`);

  for (const row of protectedRows) {
    push(errors, row.protectedExistingD0 === true, `P03C_PROTECTED_ROW_FLAG_DRIFT:${row.knowledgePointId}`);
    push(errors, row.productProductionAdmitted === true, `P03C_PROTECTED_D0_ADMISSION_LOST:${row.knowledgePointId}`);
    push(errors, row.capabilityGateState === "W3_CAPABILITY_SET_AVAILABLE_PROTECTED_D0_REVALIDATION_REQUIRED", `P03C_PROTECTED_GATE_STATE_DRIFT:${row.knowledgePointId}:${row.capabilityGateState}`);
    push(errors, row.downstreamProductState === "CAPABILITY_UNBLOCKED_PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING", `P03C_PROTECTED_DOWNSTREAM_STATE_DRIFT:${row.knowledgePointId}:${row.downstreamProductState}`);
  }

  for (const row of verticalRows) {
    push(errors, row.protectedExistingD0 === false, `P03C_VERTICAL_ROW_PROTECTED_DRIFT:${row.knowledgePointId}`);
    push(errors, row.productProductionAdmitted === false, `P03C_VERTICAL_PRODUCT_ADMISSION_FABRICATED:${row.knowledgePointId}`);
    push(errors, row.capabilityGateState === "W3_CAPABILITY_DEPENDENCY_UNBLOCKED", `P03C_VERTICAL_GATE_STATE_DRIFT:${row.knowledgePointId}:${row.capabilityGateState}`);
    push(errors, row.downstreamProductState === "CAPABILITY_UNBLOCKED_PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED", `P03C_VERTICAL_DOWNSTREAM_STATE_DRIFT:${row.knowledgePointId}:${row.downstreamProductState}`);
  }

  push(errors, runtime.manifest.mainlineBoundary.historicalP03InventoryMutated === false, "P03C_MANIFEST_HISTORY_MUTATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.hardeningQueueMutated === false, "P03C_MANIFEST_HARDENING_QUEUE_MUTATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.capabilityPromotionChanged === false, "P03C_MANIFEST_PROMOTION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.productAdmissionChanged === false, "P03C_MANIFEST_PRODUCT_ADMISSION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.protectedExistingD0AdmissionPreserved === true, "P03C_MANIFEST_PROTECTED_D0_PRESERVATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.formalMappingImplementationStarted === false, "P03C_MANIFEST_FORMAL_MAPPING_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.patternSpecImplementationStarted === false, "P03C_MANIFEST_PATTERNSPEC_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.generatorImplementationStarted === false, "P03C_MANIFEST_GENERATOR_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.publicUiChanged === false, "P03C_MANIFEST_UI_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.p04ToP08WorkStarted === false, "P03C_MANIFEST_DOWNSTREAM_SCOPE_DRIFT");

  const counts = Object.freeze({
    w3Capabilities: runtime.metrics.w3CapabilityCount,
    productionAdmittedW3Capabilities: runtime.metrics.productionAdmittedW3CapabilityCount,
    remainingW3ContractCapabilities: runtime.metrics.remainingW3ContractCapabilityCount,
    w3E5Claims: runtime.metrics.w3E5ClaimCount,
    effectivePromotions: runtime.metrics.effectivePromotionCount,
    directW3KnowledgePoints: runtime.metrics.directW3KnowledgePointCount,
    dependentKnowledgePoints: runtime.metrics.dependentKnowledgePointCount,
    capabilityUnblockedKnowledgePoints: runtime.metrics.capabilityUnblockedKnowledgePointCount,
    capabilityBlockedKnowledgePoints: runtime.metrics.capabilityBlockedKnowledgePointCount,
    protectedExistingD0KnowledgePoints: runtime.metrics.protectedExistingD0KnowledgePointCount,
    newProductDependentKnowledgePoints: runtime.metrics.newProductDependentKnowledgePointCount,
    dependentSources: runtime.metrics.dependentSourceNodeCount,
    dependentWaves: runtime.metrics.dependentWaveCount,
    protectedD0CompatibilityRevalidationPending: runtime.metrics.protectedD0CompatibilityRevalidationPendingCount,
    existingPublicPatternAcceptancePending: runtime.metrics.existingPublicPatternAcceptancePendingCount,
    patternBindingRequired: runtime.metrics.patternBindingRequiredCount,
    publicProductVerticalSliceRequired: runtime.metrics.publicProductVerticalSliceRequiredCount,
    currentProtectedProductAdmissions: runtime.metrics.currentProtectedProductAdmissionCount,
    newProductAdmissions: runtime.metrics.newProductAdmissionCount,
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
    waveSummaries: runtime.waveSummaries,
    protectedD0KnowledgePointIds: Object.freeze(protectedRows.map((row) => row.knowledgePointId).sort()),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP03CW3CapabilityCloseoutProductUnblockReconciliation();
  process.stdout.write(`P03C_READBACK ${JSON.stringify(result.counts)}\n`);
  process.stdout.write(`P03C_WAVE_READBACK ${JSON.stringify(result.waveSummaries)}\n`);
  process.stdout.write(`P03C_PROTECTED_D0 ${JSON.stringify(result.protectedD0KnowledgePointIds)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
