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

const EXPECTED_COUNTS = Object.freeze({
  contractCapabilities: 7,
  capabilitiesWithDependents: 7,
  capabilitiesWithoutDependents: 0,
  directW3KnowledgePoints: 82,
  directW3Sources: 17,
  baseW3KnowledgePoints: 94,
  baseW3EscalatedBeyondW3: 12,
  w3CapabilityDependentKnowledgePoints: 119,
  protectedExistingD0Compatibility: 4,
  newProductDependentKnowledgePoints: 115,
  laterWaveDependentKnowledgePoints: 33,
  dependentSources: 28,
  dependentWaves: 6,
  inheritedW2Dependencies: 5,
  inheritedW2DependenciesUnblocked: 5,
  publicKnowledgePointsVisible: 4,
  publicPatternBindingsPresent: 4,
  publicSourcesSelectable: 4,
  protectedD0CompatibilityRevalidation: 4,
  existingPublicPatternAfterCapability: 0,
  patternBindingRequiredAfterCapability: 0,
  publicProductVerticalSliceRequiredAfterCapability: 115,
  capabilityBlockedNewProducts: 115,
  capabilityUnblockedNewProducts: 0,
  currentProtectedProductAdmissions: 4,
  newlyProductAdmittedByP03: 0,
});

const EXPECTED_WAVE_COUNTS = Object.freeze({
  "R05-W0": 4,
  "R05-W3": 82,
  "R05-W4": 11,
  "R05-W6": 1,
  "R05-W7": 18,
  "R05-W8": 3,
});

const EXPECTED_PROTECTED_IDS = Object.freeze([
  "kp_g3a_u01_digit_arrangement_max_min",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4b_u01_trailing_zero_division_remainder_restore",
]);

const VALID_PRODUCT_GAP_STATES = new Set([
  "PROTECTED_EXISTING_D0_COMPATIBILITY_REVALIDATION_REQUIRED",
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
  const dependentIds = new Set(runtime.rows.map((row) => row.knowledgePointId));

  push(errors, runtime.taskId === "P03_W3ProductAdmissionInventoryAndGapMatrix", "P03_TASK_ID_DRIFT");
  push(errors, runtime.policy.sourceAuthorities.deliveryWaveId === "R05-W3", "P03_WAVE_ID_DRIFT");
  push(errors, runtime.policy.sourceAuthorities.waveName === "DECIMAL_FRACTION_NUMBER_DOMAIN", "P03_WAVE_NAME_DRIFT");
  push(errors, JSON.stringify([...runtime.requiredW3CapabilityIds].sort()) === JSON.stringify(EXPECTED_CAPABILITY_IDS), `P03_POLICY_CAPABILITY_IDENTITY_DRIFT:${runtime.requiredW3CapabilityIds.join(",")}`);
  push(errors, JSON.stringify([...runtime.plannedW3CapabilityIds].sort()) === JSON.stringify(EXPECTED_CAPABILITY_IDS), `P03_R05_CAPABILITY_IDENTITY_DRIFT:${runtime.plannedW3CapabilityIds.join(",")}`);

  for (const capability of runtime.capabilitySummaries) {
    push(errors, capability.deliveryStatusBeforeP03 === "contract_only", `P03_CAPABILITY_NOT_CONTRACT_ONLY:${capability.capabilityId}:${capability.deliveryStatusBeforeP03}`);
    push(errors, capability.implementationState === "CONTRACT_ONLY_NOT_IMPLEMENTED", `P03_CAPABILITY_IMPLEMENTATION_STATE_DRIFT:${capability.capabilityId}`);
    push(errors, capability.productionAdmissionState === "CAPABILITY_INVENTORIED_NOT_ADMITTED", `P03_CAPABILITY_FALSE_ADMISSION:${capability.capabilityId}`);
    push(errors, capability.directProductionAdmissionAllowed === false, `P03_CAPABILITY_DIRECT_ADMISSION_ENABLED:${capability.capabilityId}`);
    push(errors, capability.effectiveDependentKnowledgePointCount > 0, `P03_CAPABILITY_WITHOUT_DEPENDENT:${capability.capabilityId}`);
  }

  push(errors, runtime.directW3KnowledgePointRows.length === 82, `P03_DIRECT_W3_COUNT_DRIFT:${runtime.directW3KnowledgePointRows.length}`);
  push(errors, runtime.rows.length === 119, `P03_DEPENDENT_COUNT_DRIFT:${runtime.rows.length}`);
  for (const row of runtime.directW3KnowledgePointRows) {
    push(errors, row.assignedDeliveryWaveId === "R05-W3", `P03_DIRECT_ROW_WAVE_INVALID:${row.knowledgePointId}:${row.assignedDeliveryWaveId}`);
    push(errors, row.directW3CohortMember === true, `P03_DIRECT_ROW_FLAG_MISSING:${row.knowledgePointId}`);
    push(errors, row.protectedExistingD0 === false, `P03_DIRECT_ROW_PROTECTED_D0_INVALID:${row.knowledgePointId}`);
    push(errors, dependentIds.has(row.knowledgePointId), `P03_DIRECT_ROW_NOT_DEPENDENT:${row.knowledgePointId}`);
  }

  for (const row of runtime.rows) {
    push(errors, row.w3CapabilityIds.length > 0, `P03_W3_CAPABILITY_INTERSECTION_MISSING:${row.knowledgePointId}`);
    push(errors, row.missingW3CapabilityIds.length === row.w3CapabilityIds.length, `P03_CONTRACT_CAPABILITY_FALSE_UNBLOCK:${row.knowledgePointId}`);
    push(errors, VALID_PRODUCT_GAP_STATES.has(row.productGapState), `P03_PRODUCT_GAP_STATE_INVALID:${row.knowledgePointId}:${row.productGapState}`);
    push(errors, row.directProductionAdmissionAllowed === false, `P03_DIRECT_PRODUCT_ADMISSION_ENABLED:${row.knowledgePointId}`);
    push(errors, row.newlyProductAdmittedByP03 === false, `P03_FALSE_NEW_PRODUCT_ADMISSION:${row.knowledgePointId}`);
    push(errors, row.nextAdmissionActions.some((action) => action.startsWith("IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY:")), `P03_CAPABILITY_FIRST_ACTION_MISSING:${row.knowledgePointId}`);
    push(errors, row.nextAdmissionActions.some((action) => action.startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY")) === false, `P03_STALE_W2_ACTION_PRESENT:${row.knowledgePointId}`);
    if (row.inheritedW2DependencyPresent) {
      push(errors, row.inheritedW2DependencyUnblocked === true, `P03_INHERITED_W2_BLOCKER_REMAINING:${row.knowledgePointId}`);
      push(errors, row.inheritedW2GateState === "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", `P03_INHERITED_W2_GATE_DRIFT:${row.knowledgePointId}:${row.inheritedW2GateState}`);
    }
    if (row.protectedExistingD0) {
      push(errors, row.r05ProductionAdmissionState === "PROTECTED_EXISTING_D0", `P03_PROTECTED_R05_STATE_DRIFT:${row.knowledgePointId}`);
      push(errors, row.capabilityGateState === "PROTECTED_EXISTING_D0_W3_COMPATIBILITY_REVALIDATION_REQUIRED", `P03_PROTECTED_CAPABILITY_GATE_DRIFT:${row.knowledgePointId}`);
      push(errors, row.productGapState === "PROTECTED_EXISTING_D0_COMPATIBILITY_REVALIDATION_REQUIRED", `P03_PROTECTED_PRODUCT_GAP_DRIFT:${row.knowledgePointId}`);
      push(errors, row.productProductionAdmitted === true, `P03_PROTECTED_PRODUCT_ADMISSION_LOST:${row.knowledgePointId}`);
      push(errors, row.productionAdmissionState === "PROTECTED_EXISTING_D0_PRESERVED_PENDING_W3_COMPATIBILITY_REVALIDATION", `P03_PROTECTED_PRODUCTION_STATE_DRIFT:${row.knowledgePointId}`);
    } else {
      push(errors, row.capabilityGateState === "W3_CONTRACT_CAPABILITY_BLOCKED", `P03_NEW_PRODUCT_CAPABILITY_GATE_DRIFT:${row.knowledgePointId}:${row.capabilityGateState}`);
      push(errors, row.productProductionAdmitted === false, `P03_FALSE_NEW_PRODUCT_CURRENT_ADMISSION:${row.knowledgePointId}`);
      push(errors, row.productionAdmissionState === "W3_DEPENDENCY_INVENTORIED_NOT_ADMITTED", `P03_NEW_PRODUCT_PRODUCTION_STATE_DRIFT:${row.knowledgePointId}`);
    }
    if (row.directW3CohortMember) push(errors, directIds.has(row.knowledgePointId), `P03_DIRECT_SET_DRIFT:${row.knowledgePointId}`);
    if (row.laterWaveDependent) push(errors, !row.directW3CohortMember && row.assignedDeliveryWaveId !== "R05-W0", `P03_LATER_WAVE_FLAG_INVALID:${row.knowledgePointId}`);
  }

  push(errors, JSON.stringify(runtime.protectedExistingD0Rows.map((row) => row.knowledgePointId).sort()) === JSON.stringify(EXPECTED_PROTECTED_IDS), `P03_PROTECTED_IDENTITY_DRIFT:${runtime.protectedExistingD0Rows.map((row) => row.knowledgePointId).join(",")}`);
  push(errors, runtime.baseW3EscalatedBeyondW3Rows.length === 12, `P03_BASE_W3_ESCALATION_COUNT_DRIFT:${runtime.baseW3EscalatedBeyondW3Rows.length}`);
  push(errors, runtime.metrics.inheritedW2DependencyUnblockedCount === runtime.metrics.inheritedW2DependencyCount, `P03_INHERITED_W2_UNBLOCK_COUNT_DRIFT:${runtime.metrics.inheritedW2DependencyUnblockedCount}:${runtime.metrics.inheritedW2DependencyCount}`);
  push(errors, JSON.stringify(runtime.metrics.dependentCountsByWave) === JSON.stringify(EXPECTED_WAVE_COUNTS), `P03_WAVE_COUNT_DRIFT:${JSON.stringify(runtime.metrics.dependentCountsByWave)}`);

  const counts = Object.freeze({
    contractCapabilities: runtime.metrics.contractCapabilityCount,
    capabilitiesWithDependents: runtime.metrics.capabilityWithDependentsCount,
    capabilitiesWithoutDependents: runtime.metrics.capabilityWithoutDependentsCount,
    directW3KnowledgePoints: runtime.metrics.directW3KnowledgePointCount,
    directW3Sources: runtime.metrics.directW3SourceNodeCount,
    baseW3KnowledgePoints: runtime.metrics.baseW3KnowledgePointCount,
    baseW3EscalatedBeyondW3: runtime.metrics.baseW3EscalatedBeyondW3Count,
    w3CapabilityDependentKnowledgePoints: runtime.metrics.w3CapabilityDependentKnowledgePointCount,
    protectedExistingD0Compatibility: runtime.metrics.protectedExistingD0CompatibilityCount,
    newProductDependentKnowledgePoints: runtime.metrics.newProductDependentKnowledgePointCount,
    laterWaveDependentKnowledgePoints: runtime.metrics.laterWaveDependentKnowledgePointCount,
    dependentSources: runtime.metrics.dependentSourceNodeCount,
    dependentWaves: runtime.metrics.dependentWaveCount,
    inheritedW2Dependencies: runtime.metrics.inheritedW2DependencyCount,
    inheritedW2DependenciesUnblocked: runtime.metrics.inheritedW2DependencyUnblockedCount,
    publicKnowledgePointsVisible: runtime.metrics.publicKnowledgePointVisibleCount,
    publicPatternBindingsPresent: runtime.metrics.publicPatternBindingPresentCount,
    publicSourcesSelectable: runtime.metrics.publicSourceSelectableCount,
    protectedD0CompatibilityRevalidation: runtime.metrics.protectedD0CompatibilityRevalidationCount,
    existingPublicPatternAfterCapability: runtime.metrics.existingPublicPatternAfterCapabilityCount,
    patternBindingRequiredAfterCapability: runtime.metrics.patternBindingRequiredAfterCapabilityCount,
    publicProductVerticalSliceRequiredAfterCapability: runtime.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount,
    capabilityBlockedNewProducts: runtime.metrics.capabilityBlockedNewProductCount,
    capabilityUnblockedNewProducts: runtime.metrics.capabilityUnblockedNewProductCount,
    currentProtectedProductAdmissions: runtime.metrics.currentProtectedProductAdmissionCount,
    newlyProductAdmittedByP03: runtime.metrics.newlyProductAdmittedByP03Count,
  });

  push(errors, JSON.stringify(counts) === JSON.stringify(EXPECTED_COUNTS), `P03_EXACT_COUNT_DRIFT:${JSON.stringify(counts)}`);
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

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
    directKnowledgePointIds: Object.freeze(runtime.directW3KnowledgePointRows.map((row) => row.knowledgePointId)),
    protectedKnowledgePointIds: Object.freeze(runtime.protectedExistingD0Rows.map((row) => row.knowledgePointId)),
    capabilitySummaries: runtime.capabilitySummaries,
    waveSummaries: runtime.waveSummaries,
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP03W3ProductAdmissionInventory();
  process.stdout.write(`P03_READBACK ${JSON.stringify(result.counts)}\n`);
  process.stdout.write(`P03_DIRECT_KPS ${JSON.stringify(result.directKnowledgePointIds)}\n`);
  process.stdout.write(`P03_PROTECTED_KPS ${JSON.stringify(result.protectedKnowledgePointIds)}\n`);
  process.stdout.write(`P03_CAPABILITY_MATRIX ${JSON.stringify(result.capabilitySummaries)}\n`);
  process.stdout.write(`P03_WAVE_MATRIX ${JSON.stringify(result.waveSummaries)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
