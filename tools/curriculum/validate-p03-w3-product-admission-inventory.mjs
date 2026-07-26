import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03W3ProductAdmissionInventory } from "../../src/curriculum/full-product/p03-w3-product-admission-inventory.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");

const EXPECTED_CAPABILITY_IDS = [
  "cap_decimal_arithmetic",
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
  "cap_mixed_number_domain_normalization",
];

const VALID_PRODUCT_GAP_STATES = new Set([
  "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY",
  "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY",
  "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY",
]);

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP03W3ProductAdmissionInventory() {
  const errors = [];
  const runtime = materializeP03W3ProductAdmissionInventory();
  const claim = readJson("data/project/milestones/FPL-P03.claim.json");
  const directIds = new Set(runtime.directW3KnowledgePointRows.map((row) => row.knowledgePointId));
  const dependentIds = new Set(runtime.dependentKnowledgePointRows.map((row) => row.knowledgePointId));

  push(errors, runtime.taskId === "P03_W3ProductAdmissionInventoryAndGapMatrix", "P03_TASK_ID_DRIFT");
  push(errors, runtime.policy.sourceAuthorities.deliveryWaveId === "R05-W3", "P03_WAVE_ID_DRIFT");
  push(errors, runtime.policy.sourceAuthorities.waveName === "DECIMAL_FRACTION_NUMBER_DOMAIN", "P03_WAVE_NAME_DRIFT");
  push(errors, JSON.stringify([...runtime.requiredW3CapabilityIds].sort()) === JSON.stringify(EXPECTED_CAPABILITY_IDS), `P03_POLICY_CAPABILITY_IDENTITY_DRIFT:${runtime.requiredW3CapabilityIds.join(",")}`);
  push(errors, JSON.stringify([...runtime.plannedW3CapabilityIds].sort()) === JSON.stringify(EXPECTED_CAPABILITY_IDS), `P03_R05_CAPABILITY_IDENTITY_DRIFT:${runtime.plannedW3CapabilityIds.join(",")}`);
  push(errors, runtime.capabilitySummaries.length === 7, `P03_CAPABILITY_SUMMARY_COUNT_DRIFT:${runtime.capabilitySummaries.length}`);

  for (const capability of runtime.capabilitySummaries) {
    push(errors, capability.deliveryStatusBeforeP03 === "contract_only", `P03_CAPABILITY_NOT_CONTRACT_ONLY:${capability.capabilityId}:${capability.deliveryStatusBeforeP03}`);
    push(errors, capability.implementationState === "CONTRACT_ONLY_NOT_IMPLEMENTED", `P03_CAPABILITY_IMPLEMENTATION_STATE_DRIFT:${capability.capabilityId}`);
    push(errors, capability.productionAdmissionState === "CAPABILITY_INVENTORIED_NOT_ADMITTED", `P03_CAPABILITY_FALSE_ADMISSION:${capability.capabilityId}`);
    push(errors, capability.directProductionAdmissionAllowed === false, `P03_CAPABILITY_DIRECT_ADMISSION_ENABLED:${capability.capabilityId}`);
  }

  push(errors, runtime.directW3KnowledgePointRows.length > 0, "P03_DIRECT_W3_COHORT_EMPTY");
  push(errors, runtime.dependentKnowledgePointRows.length >= runtime.directW3KnowledgePointRows.length, "P03_DEPENDENT_COHORT_SMALLER_THAN_DIRECT");
  for (const row of runtime.directW3KnowledgePointRows) {
    push(errors, row.assignedDeliveryWaveId === "R05-W3", `P03_DIRECT_ROW_WAVE_INVALID:${row.knowledgePointId}:${row.assignedDeliveryWaveId}`);
    push(errors, row.directW3CohortMember === true, `P03_DIRECT_ROW_FLAG_MISSING:${row.knowledgePointId}`);
    push(errors, dependentIds.has(row.knowledgePointId), `P03_DIRECT_ROW_NOT_DEPENDENT:${row.knowledgePointId}`);
  }

  for (const row of runtime.dependentKnowledgePointRows) {
    push(errors, row.w3CapabilityIds.length > 0, `P03_W3_CAPABILITY_INTERSECTION_MISSING:${row.knowledgePointId}`);
    push(errors, row.missingW3CapabilityIds.length === row.w3CapabilityIds.length, `P03_CONTRACT_CAPABILITY_FALSE_UNBLOCK:${row.knowledgePointId}`);
    push(errors, row.capabilityGateState === "W3_CONTRACT_CAPABILITY_BLOCKED", `P03_CAPABILITY_GATE_FALSE_UNBLOCK:${row.knowledgePointId}:${row.capabilityGateState}`);
    push(errors, VALID_PRODUCT_GAP_STATES.has(row.productGapState), `P03_PRODUCT_GAP_STATE_INVALID:${row.knowledgePointId}:${row.productGapState}`);
    push(errors, row.directProductionAdmissionAllowed === false, `P03_DIRECT_PRODUCT_ADMISSION_ENABLED:${row.knowledgePointId}`);
    push(errors, row.productProductionAdmitted === false, `P03_FALSE_PRODUCT_ADMISSION:${row.knowledgePointId}`);
    push(errors, row.productionAdmissionState === "W3_DEPENDENCY_INVENTORIED_NOT_ADMITTED", `P03_PRODUCTION_STATE_DRIFT:${row.knowledgePointId}`);
    push(errors, row.nextAdmissionActions.some((action) => action.startsWith("IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY:")), `P03_CAPABILITY_FIRST_ACTION_MISSING:${row.knowledgePointId}`);
    push(errors, row.nextAdmissionActions.some((action) => action.startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY")) === false, `P03_STALE_W2_ACTION_PRESENT:${row.knowledgePointId}`);
    if (row.inheritedW2DependencyPresent) {
      push(errors, row.inheritedW2DependencyUnblocked === true, `P03_INHERITED_W2_BLOCKER_REMAINING:${row.knowledgePointId}`);
      push(errors, row.inheritedW2GateState === "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", `P03_INHERITED_W2_GATE_DRIFT:${row.knowledgePointId}:${row.inheritedW2GateState}`);
    }
    if (row.directW3CohortMember) push(errors, directIds.has(row.knowledgePointId), `P03_DIRECT_SET_DRIFT:${row.knowledgePointId}`);
    if (row.laterWaveDependent) push(errors, row.assignedDeliveryWaveId !== "R05-W3", `P03_LATER_WAVE_FLAG_INVALID:${row.knowledgePointId}`);
  }

  const gapSum = runtime.metrics.existingPublicPatternAfterCapabilityCount
    + runtime.metrics.patternBindingRequiredAfterCapabilityCount
    + runtime.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount;
  push(errors, gapSum === runtime.metrics.w3CapabilityDependentKnowledgePointCount, `P03_PRODUCT_GAP_PARTITION_INVALID:${gapSum}:${runtime.metrics.w3CapabilityDependentKnowledgePointCount}`);
  push(errors, runtime.sourceSummaries.length === runtime.metrics.dependentSourceNodeCount, "P03_SOURCE_SUMMARY_COUNT_DRIFT");
  push(errors, runtime.waveSummaries.length === runtime.metrics.dependentWaveCount, "P03_WAVE_SUMMARY_COUNT_DRIFT");
  push(errors, runtime.metrics.inheritedW2DependencyUnblockedCount === runtime.metrics.inheritedW2DependencyCount, `P03_INHERITED_W2_UNBLOCK_COUNT_DRIFT:${runtime.metrics.inheritedW2DependencyUnblockedCount}:${runtime.metrics.inheritedW2DependencyCount}`);
  push(errors, runtime.metrics.capabilityBlockedKnowledgePointCount === runtime.metrics.w3CapabilityDependentKnowledgePointCount, "P03_CAPABILITY_BLOCKED_COUNT_DRIFT");
  push(errors, runtime.metrics.capabilityUnblockedKnowledgePointCount === 0, `P03_FALSE_CAPABILITY_UNBLOCK_COUNT:${runtime.metrics.capabilityUnblockedKnowledgePointCount}`);
  push(errors, runtime.metrics.directProductAdmissionCount === 0, `P03_FALSE_DIRECT_PRODUCT_ADMISSION:${runtime.metrics.directProductAdmissionCount}`);

  push(errors, claim.actualEvidenceLevel === "E3_SHADOW_RUNTIME_INTEGRATED", `P03_CLAIM_EVIDENCE_INVALID:${claim.actualEvidenceLevel}`);
  push(errors, claim.claims.runtimeIntegrated === true, "P03_CLAIM_RUNTIME_MISSING");
  push(errors, claim.claims.productionAdmitted === false, "P03_CLAIM_FALSE_PRODUCTION_ADMISSION");
  push(errors, claim.claims.visibleOutputChanged === false, "P03_CLAIM_VISIBLE_OUTPUT_INVALID");
  push(errors, runtime.manifest.mainlineBoundary.inventoryOnly === true, "P03_MANIFEST_INVENTORY_BOUNDARY_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.w3CapabilityImplementationStarted === false, "P03_MANIFEST_CAPABILITY_IMPLEMENTATION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.patternSpecImplementationStarted === false, "P03_MANIFEST_PATTERNSPEC_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.generatorImplementationStarted === false, "P03_MANIFEST_GENERATOR_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.publicUiChanged === false, "P03_MANIFEST_UI_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.p04ToP08WorkStarted === false, "P03_MANIFEST_DOWNSTREAM_SCOPE_DRIFT");

  const counts = Object.freeze({
    contractCapabilities: runtime.metrics.contractCapabilityCount,
    capabilitiesWithDependents: runtime.metrics.capabilityWithDependentsCount,
    capabilitiesWithoutDependents: runtime.metrics.capabilityWithoutDependentsCount,
    directW3KnowledgePoints: runtime.metrics.directW3KnowledgePointCount,
    baseW3KnowledgePoints: runtime.metrics.baseW3KnowledgePointCount,
    prerequisiteEscalatedIntoW3: runtime.metrics.prerequisiteEscalatedIntoW3Count,
    w3CapabilityDependentKnowledgePoints: runtime.metrics.w3CapabilityDependentKnowledgePointCount,
    laterWaveDependentKnowledgePoints: runtime.metrics.laterWaveDependentKnowledgePointCount,
    dependentSources: runtime.metrics.dependentSourceNodeCount,
    dependentWaves: runtime.metrics.dependentWaveCount,
    inheritedW2Dependencies: runtime.metrics.inheritedW2DependencyCount,
    inheritedW2DependenciesUnblocked: runtime.metrics.inheritedW2DependencyUnblockedCount,
    publicKnowledgePointsVisible: runtime.metrics.publicKnowledgePointVisibleCount,
    publicPatternBindingsPresent: runtime.metrics.publicPatternBindingPresentCount,
    publicSourcesSelectable: runtime.metrics.publicSourceSelectableCount,
    existingPublicPatternAfterCapability: runtime.metrics.existingPublicPatternAfterCapabilityCount,
    patternBindingRequiredAfterCapability: runtime.metrics.patternBindingRequiredAfterCapabilityCount,
    publicProductVerticalSliceRequiredAfterCapability: runtime.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount,
    capabilityBlockedKnowledgePoints: runtime.metrics.capabilityBlockedKnowledgePointCount,
    capabilityUnblockedKnowledgePoints: runtime.metrics.capabilityUnblockedKnowledgePointCount,
    directProductAdmissions: runtime.metrics.directProductAdmissionCount,
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
    directKnowledgePointIds: Object.freeze(runtime.directW3KnowledgePointRows.map((row) => row.knowledgePointId)),
    capabilitySummaries: runtime.capabilitySummaries,
    waveSummaries: runtime.waveSummaries,
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP03W3ProductAdmissionInventory();
  process.stdout.write(`P03_READBACK ${JSON.stringify(result.counts)}\n`);
  process.stdout.write(`P03_DIRECT_KPS ${JSON.stringify(result.directKnowledgePointIds)}\n`);
  process.stdout.write(`P03_CAPABILITY_MATRIX ${JSON.stringify(result.capabilitySummaries)}\n`);
  process.stdout.write(`P03_WAVE_MATRIX ${JSON.stringify(result.waveSummaries)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
