import { fileURLToPath } from "node:url";

import { materializeP02GW2FoundationCloseoutUnblockMatrix } from "../../src/curriculum/full-product/p02g-w2-foundation-closeout-unblock.mjs";

const EXPECTED_FOUNDATION_IDS = [
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
];

const EXPECTED_WAVE_COUNTS = {
  "R05-W0": 3,
  "R05-W4": 41,
  "R05-W5": 1,
  "R05-W7": 5,
  "R05-W8": 1,
};

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP02GW2FoundationCloseoutUnblockMatrix() {
  const runtime = materializeP02GW2FoundationCloseoutUnblockMatrix();
  const errors = [];

  push(errors, runtime.taskId === "P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix", "P02G_TASK_ID_DRIFT");
  push(errors, JSON.stringify([...runtime.requiredFoundationCapabilityIds].sort()) === JSON.stringify(EXPECTED_FOUNDATION_IDS), `P02G_REQUIRED_FOUNDATION_IDS_DRIFT:${runtime.requiredFoundationCapabilityIds.join(",")}`);
  push(errors, JSON.stringify([...runtime.effectivePromotionCapabilityIds].sort()) === JSON.stringify(EXPECTED_FOUNDATION_IDS), `P02G_EFFECTIVE_PROMOTION_IDS_DRIFT:${runtime.effectivePromotionCapabilityIds.join(",")}`);
  push(errors, runtime.metrics.foundationCapabilityCount === 5, `P02G_FOUNDATION_COUNT_DRIFT:${runtime.metrics.foundationCapabilityCount}`);
  push(errors, runtime.metrics.productionAdmittedFoundationCount === 5, `P02G_CLOSED_FOUNDATION_COUNT_DRIFT:${runtime.metrics.productionAdmittedFoundationCount}`);
  push(errors, runtime.metrics.remainingShadowFoundationCount === 0, `P02G_REMAINING_SHADOW_FOUNDATION_COUNT:${runtime.metrics.remainingShadowFoundationCount}`);
  push(errors, runtime.metrics.foundationE5ClaimCount === 5, `P02G_E5_CLAIM_COUNT_DRIFT:${runtime.metrics.foundationE5ClaimCount}`);

  for (const row of runtime.foundationCloseoutRows) {
    push(errors, row.closeoutState === "FOUNDATION_PRODUCTION_ADMISSION_CLOSED", `P02G_FOUNDATION_NOT_CLOSED:${row.capabilityId}:${row.closeoutState}`);
    push(errors, row.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", `P02G_FOUNDATION_EVIDENCE_DRIFT:${row.capabilityId}:${row.actualEvidenceLevel}`);
    push(errors, row.runtimeIntegrated === true, `P02G_FOUNDATION_RUNTIME_NOT_INTEGRATED:${row.capabilityId}`);
    push(errors, row.productionAdmitted === true, `P02G_FOUNDATION_NOT_PRODUCTION_ADMITTED:${row.capabilityId}`);
    push(errors, row.effectiveDeliveryStatus === "production_admitted", `P02G_FOUNDATION_DELIVERY_STATUS_DRIFT:${row.capabilityId}:${row.effectiveDeliveryStatus}`);
  }

  const authority = runtime.foundationCloseoutRows.find((row) => row.capabilityId === "cap_kp_authority_lookup");
  const prerequisite = runtime.foundationCloseoutRows.find((row) => row.capabilityId === "cap_prerequisite_readiness");
  push(errors, authority?.directlyRequiredDependentKnowledgePointCount === 0 && authority?.systemicFoundationWithoutDirectRows === true, "P02G_AUTHORITY_SYSTEMIC_FOUNDATION_DRIFT");
  push(errors, prerequisite?.directlyRequiredDependentKnowledgePointCount === 0 && prerequisite?.systemicFoundationWithoutDirectRows === true, "P02G_PREREQUISITE_SYSTEMIC_FOUNDATION_DRIFT");

  push(errors, runtime.historicalInventory.metrics.directW2KnowledgePointCount === 0, `P02G_INVENTED_DIRECT_W2_COHORT:${runtime.historicalInventory.metrics.directW2KnowledgePointCount}`);
  push(errors, runtime.metrics.dependentKnowledgePointCount === 51, `P02G_DEPENDENT_KP_COUNT_DRIFT:${runtime.metrics.dependentKnowledgePointCount}`);
  push(errors, runtime.metrics.capabilityUnblockedKnowledgePointCount === 51, `P02G_UNBLOCKED_KP_COUNT_DRIFT:${runtime.metrics.capabilityUnblockedKnowledgePointCount}`);
  push(errors, runtime.metrics.capabilityBlockedKnowledgePointCount === 0, `P02G_BLOCKED_KP_COUNT_DRIFT:${runtime.metrics.capabilityBlockedKnowledgePointCount}`);
  push(errors, runtime.metrics.dependentSourceNodeCount === 20, `P02G_SOURCE_COUNT_DRIFT:${runtime.metrics.dependentSourceNodeCount}`);
  push(errors, runtime.metrics.dependentWaveCount === 5, `P02G_WAVE_COUNT_DRIFT:${runtime.metrics.dependentWaveCount}`);
  push(errors, JSON.stringify(runtime.metrics.dependentCountsByWave) === JSON.stringify(EXPECTED_WAVE_COUNTS), `P02G_WAVE_DISTRIBUTION_DRIFT:${JSON.stringify(runtime.metrics.dependentCountsByWave)}`);

  for (const row of runtime.downstreamUnblockRows) {
    push(errors, row.historicalCapabilityBlocked === true, `P02G_HISTORICAL_BLOCKED_EVIDENCE_MUTATED:${row.knowledgePointId}`);
    push(errors, row.capabilityUnblocked === true, `P02G_ROW_STILL_CAPABILITY_BLOCKED:${row.knowledgePointId}:${row.missingW2CapabilityIds.join(",")}`);
    push(errors, row.missingW2CapabilityIds.length === 0, `P02G_ROW_MISSING_PROMOTION:${row.knowledgePointId}:${row.missingW2CapabilityIds.join(",")}`);
    push(errors, row.capabilityGateState === "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", `P02G_ROW_GATE_STATE_DRIFT:${row.knowledgePointId}:${row.capabilityGateState}`);
    push(errors, row.directProductAdmissionAllowed === false, `P02G_DIRECT_PRODUCT_ADMISSION_ENABLED:${row.knowledgePointId}`);
    push(errors, row.productProductionAdmitted === false, `P02G_PRODUCT_ADMISSION_FABRICATED:${row.knowledgePointId}`);
    push(errors, row.nextProductActions.every((action) => !action.startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY")), `P02G_STALE_CAPABILITY_ACTION_RETAINED:${row.knowledgePointId}`);
  }

  const acceptanceRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING");
  const bindingRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED");
  const verticalRows = runtime.downstreamUnblockRows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED");
  push(errors, acceptanceRows.length === 3, `P02G_ACCEPTANCE_PENDING_COUNT_DRIFT:${acceptanceRows.length}`);
  push(errors, bindingRows.length === 0, `P02G_PATTERN_BINDING_REQUIRED_COUNT_DRIFT:${bindingRows.length}`);
  push(errors, verticalRows.length === 48, `P02G_VERTICAL_SLICE_COUNT_DRIFT:${verticalRows.length}`);
  push(errors, runtime.metrics.directProductAdmissionCount === 0, `P02G_DIRECT_PRODUCT_ADMISSION_COUNT_DRIFT:${runtime.metrics.directProductAdmissionCount}`);

  for (const row of acceptanceRows) {
    push(errors, row.currentProductCoverage.publicKnowledgePointVisible === true, `P02G_ACCEPTANCE_ROW_NOT_PUBLIC:${row.knowledgePointId}`);
    push(errors, row.currentProductCoverage.publicPatternBindingPresent === true, `P02G_ACCEPTANCE_ROW_PATTERN_MISSING:${row.knowledgePointId}`);
    push(errors, row.downstreamProductState === "CAPABILITY_UNBLOCKED_EXISTING_PUBLIC_PATTERN_ACCEPTANCE_PENDING", `P02G_ACCEPTANCE_ROW_STATE_DRIFT:${row.knowledgePointId}`);
  }
  for (const row of verticalRows) {
    push(errors, row.downstreamProductState === "CAPABILITY_UNBLOCKED_PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED", `P02G_VERTICAL_ROW_STATE_DRIFT:${row.knowledgePointId}`);
  }

  push(errors, runtime.manifest.mainlineBoundary.historicalP02InventoryMutated === false, "P02G_MANIFEST_HISTORY_MUTATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.foundationPromotionChanged === false, "P02G_MANIFEST_PROMOTION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.productAdmissionChanged === false, "P02G_MANIFEST_PRODUCT_ADMISSION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.patternSpecImplementationStarted === false, "P02G_MANIFEST_PATTERNSPEC_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.generatorImplementationStarted === false, "P02G_MANIFEST_GENERATOR_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.publicUiChanged === false, "P02G_MANIFEST_UI_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.p03ToP08WorkStarted === false, "P02G_MANIFEST_DOWNSTREAM_SCOPE_DRIFT");

  const counts = Object.freeze({
    foundations: runtime.metrics.foundationCapabilityCount,
    productionAdmittedFoundations: runtime.metrics.productionAdmittedFoundationCount,
    remainingShadowFoundations: runtime.metrics.remainingShadowFoundationCount,
    foundationE5Claims: runtime.metrics.foundationE5ClaimCount,
    dependentKnowledgePoints: runtime.metrics.dependentKnowledgePointCount,
    capabilityUnblockedKnowledgePoints: runtime.metrics.capabilityUnblockedKnowledgePointCount,
    capabilityBlockedKnowledgePoints: runtime.metrics.capabilityBlockedKnowledgePointCount,
    dependentSources: runtime.metrics.dependentSourceNodeCount,
    dependentWaves: runtime.metrics.dependentWaveCount,
    existingPublicPatternAcceptancePending: runtime.metrics.existingPublicPatternAcceptancePendingCount,
    patternBindingRequired: runtime.metrics.patternBindingRequiredCount,
    publicProductVerticalSliceRequired: runtime.metrics.publicProductVerticalSliceRequiredCount,
    directProductAdmissions: runtime.metrics.directProductAdmissionCount,
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
    waveSummaries: runtime.waveSummaries,
    acceptancePendingKnowledgePointIds: Object.freeze(acceptanceRows.map((row) => row.knowledgePointId).sort()),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP02GW2FoundationCloseoutUnblockMatrix();
  process.stdout.write(`P02G_READBACK ${JSON.stringify(result.counts)}\n`);
  process.stdout.write(`P02G_WAVE_READBACK ${JSON.stringify(result.waveSummaries)}\n`);
  process.stdout.write(`P02G_ACCEPTANCE_PENDING ${JSON.stringify(result.acceptancePendingKnowledgePointIds)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
