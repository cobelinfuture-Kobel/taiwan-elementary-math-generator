import { pathToFileURL } from "node:url";
import path from "node:path";

import { materializeP02W2ProductAdmissionInventory } from "../../src/curriculum/full-product/p02-w2-product-admission-inventory.mjs";

const EXPECTED_CAPABILITY_IDS = Object.freeze([
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
]);

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function count(rows, predicate) {
  return rows.filter(predicate).length;
}

export function validateP02W2ProductAdmissionInventory(candidate = null) {
  const inventory = candidate ?? materializeP02W2ProductAdmissionInventory();
  const errors = [];
  const directW2Rows = inventory.directW2KnowledgePointRows ?? [];
  const dependentRows = inventory.dependentKnowledgePointRows ?? inventory.rows ?? [];
  const sourceSummaries = inventory.sourceSummaries ?? [];
  const waveSummaries = inventory.waveSummaries ?? [];
  const capabilitySummaries = inventory.capabilitySummaries ?? [];
  const metrics = inventory.metrics ?? {};

  if (inventory.programId !== "FULL_PRODUCT_LINE_D0_V1") {
    errors.push(issue("P02_PROGRAM_ID_INVALID", { actual: inventory.programId }));
  }
  if (inventory.taskId !== "P02_W2ProductAdmissionInventoryAndGapMatrix") {
    errors.push(issue("P02_TASK_ID_INVALID", { actual: inventory.taskId }));
  }
  if (directW2Rows.length !== 0) {
    errors.push(issue("P02_DIRECT_W2_PRODUCT_COHORT_MUST_BE_EMPTY", {
      actual: directW2Rows.length,
      knowledgePointIds: directW2Rows.map((row) => row.knowledgePointId),
    }));
  }
  if (dependentRows.length === 0) errors.push(issue("P02_DEPENDENCY_MATRIX_EMPTY"));
  if (new Set(dependentRows.map((row) => row.knowledgePointId)).size !== dependentRows.length) {
    errors.push(issue("P02_DUPLICATE_DEPENDENT_KNOWLEDGE_POINT"));
  }

  const expectedCapabilityIds = [...EXPECTED_CAPABILITY_IDS].sort();
  const actualCapabilityIds = capabilitySummaries.map((row) => row.capabilityId).sort();
  if (JSON.stringify(actualCapabilityIds) !== JSON.stringify(expectedCapabilityIds)) {
    errors.push(issue("P02_W2_CAPABILITY_IDENTITY_DRIFT", {
      expected: expectedCapabilityIds,
      actual: actualCapabilityIds,
    }));
  }

  const capabilityIdSet = new Set(actualCapabilityIds);
  for (const row of dependentRows) {
    if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
      errors.push(issue("P02_SOURCE_TRACE_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (!Array.isArray(row.w2FoundationCapabilityIds) || row.w2FoundationCapabilityIds.length === 0) {
      errors.push(issue("P02_W2_FOUNDATION_DEPENDENCY_MISSING", { knowledgePointId: row.knowledgePointId }));
    } else if (row.w2FoundationCapabilityIds.some((id) => !capabilityIdSet.has(id))) {
      errors.push(issue("P02_UNKNOWN_W2_FOUNDATION_CAPABILITY", {
        knowledgePointId: row.knowledgePointId,
        capabilityIds: row.w2FoundationCapabilityIds,
      }));
    }
    if (!Array.isArray(row.nextAdmissionActions) || row.nextAdmissionActions.length === 0) {
      errors.push(issue("P02_NEXT_ACTIONS_MISSING", { knowledgePointId: row.knowledgePointId }));
    } else if (!row.nextAdmissionActions[0].startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY:")) {
      errors.push(issue("P02_CAPABILITY_FIRST_ACTION_REQUIRED", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.directProductionAdmissionAllowed !== false
      || row.productionAdmissionState !== "DEPENDENCY_INVENTORIED_NOT_ADMITTED") {
      errors.push(issue("P02_DEPENDENCY_INVENTORY_BOUNDARY_VIOLATION", {
        knowledgePointId: row.knowledgePointId,
      }));
    }
  }

  if (capabilitySummaries.length !== EXPECTED_CAPABILITY_IDS.length) {
    errors.push(issue("P02_SHADOW_FOUNDATION_CAPABILITY_COUNT_INVALID", {
      expected: EXPECTED_CAPABILITY_IDS.length,
      actual: capabilitySummaries.length,
    }));
  }
  for (const capability of capabilitySummaries) {
    if (capability.deliveryStatusBeforeP02 !== "shadow_available") {
      errors.push(issue("P02_CAPABILITY_NOT_SHADOW_AVAILABLE", {
        capabilityId: capability.capabilityId,
        status: capability.deliveryStatusBeforeP02,
      }));
    }
    if (capability.nextAction !== "HARDEN_AND_ADMIT_SHARED_CAPABILITY") {
      errors.push(issue("P02_CAPABILITY_ACTION_INVALID", { capabilityId: capability.capabilityId }));
    }
    if (capability.directProductionAdmissionAllowed !== false
      || capability.productionAdmissionState !== "CAPABILITY_INVENTORIED_NOT_ADMITTED") {
      errors.push(issue("P02_CAPABILITY_INVENTORY_BOUNDARY_VIOLATION", {
        capabilityId: capability.capabilityId,
      }));
    }
    const actualDependentCount = dependentRows.filter((row) => (
      row.w2FoundationCapabilityIds.includes(capability.capabilityId)
    )).length;
    if (capability.effectiveDependentKnowledgePointCount !== actualDependentCount) {
      errors.push(issue("P02_CAPABILITY_DEPENDENT_COUNT_MISMATCH", {
        capabilityId: capability.capabilityId,
        expected: actualDependentCount,
        actual: capability.effectiveDependentKnowledgePointCount,
      }));
    }
  }

  const expectedMetrics = {
    directW2KnowledgePointCount: directW2Rows.length,
    dependentKnowledgePointCount: dependentRows.length,
    dependentSourceNodeCount: sourceSummaries.length,
    dependentWaveCount: waveSummaries.length,
    shadowFoundationCapabilityCount: capabilitySummaries.length,
    capabilityWithKnowledgePointDependentsCount: count(capabilitySummaries, (row) => (
      row.effectiveDependentKnowledgePointCount > 0
    )),
    capabilityWithoutKnowledgePointDependentsCount: count(capabilitySummaries, (row) => (
      row.effectiveDependentKnowledgePointCount === 0
    )),
    publicKnowledgePointVisibleCount: count(dependentRows, (row) => (
      row.currentProductCoverage?.publicKnowledgePointVisible === true
    )),
    publicPatternBindingPresentCount: count(dependentRows, (row) => (
      row.currentProductCoverage?.publicPatternBindingPresent === true
    )),
    publicSourceSelectableCount: count(sourceSummaries, (row) => row.publicSourceSelectable === true),
    admissionReadyExistingPublicPatternAfterCapabilityCount: count(dependentRows, (row) => (
      row.productGapState === "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY"
    )),
    patternGroupOrSpecBindingRequiredAfterCapabilityCount: count(dependentRows, (row) => (
      row.productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY"
    )),
    publicProductVerticalSliceRequiredAfterCapabilityCount: count(dependentRows, (row) => (
      row.productGapState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY"
    )),
    directProductionAdmissionCount: count(dependentRows, (row) => row.directProductionAdmissionAllowed === true)
      + count(capabilitySummaries, (row) => row.directProductionAdmissionAllowed === true),
  };
  for (const [key, expected] of Object.entries(expectedMetrics)) {
    if (metrics[key] !== expected) {
      errors.push(issue("P02_METRIC_MISMATCH", { key, expected, actual: metrics[key] }));
    }
  }

  const sourceAuthority = inventory.manifest?.sourceAuthorities ?? {};
  for (const [key, actual] of [
    ["directW2KnowledgePointCount", metrics.directW2KnowledgePointCount],
    ["dependentKnowledgePointCount", metrics.dependentKnowledgePointCount],
    ["dependentSourceNodeCount", metrics.dependentSourceNodeCount],
    ["shadowFoundationCapabilityCount", metrics.shadowFoundationCapabilityCount],
  ]) {
    const expected = sourceAuthority[key];
    if (Number.isInteger(expected) && expected !== actual) {
      errors.push(issue("P02_MANIFEST_COUNT_MISMATCH", { key, expected, actual }));
    }
  }

  const policyRules = inventory.policy?.rules ?? {};
  const forbiddenTrueRules = [
    "directProductionAdmissionAllowed",
    "sharedCapabilityHardeningAllowed",
    "patternSpecImplementationAllowed",
    "publicSourceAdapterImplementationAllowed",
    "publicUiChangeAllowed",
    "w3ToW8ImplementationAllowed",
    "existing19SourceProductModificationAllowed",
    "recursiveImprovementAdminAllowed",
  ];
  for (const key of forbiddenTrueRules) {
    if (policyRules[key] !== false) {
      errors.push(issue("P02_POLICY_BOUNDARY_INVALID", { key, actual: policyRules[key] }));
    }
  }
  if (policyRules.inventoryOnly !== true) errors.push(issue("P02_POLICY_INVENTORY_ONLY_REQUIRED"));
  if (inventory.policy?.inventoryDecision?.selectedRoute !== "CAPABILITY_ONLY_W2_NO_DIRECT_PRODUCT_COHORT") {
    errors.push(issue("P02_SELECTED_ROUTE_INVALID", {
      actual: inventory.policy?.inventoryDecision?.selectedRoute,
    }));
  }

  const boundary = inventory.manifest?.mainlineBoundary ?? {};
  if (boundary.inventoryOnly !== true
    || boundary.productionAdmissionChanged !== false
    || boundary.sharedCapabilityHardeningStarted !== false
    || boundary.patternSpecImplementationStarted !== false
    || boundary.publicUiChanged !== false
    || boundary.existing19SourceProductPreserved !== true
    || boundary.w3ToW8WorkStarted !== false
    || boundary.recursiveImprovementAdminAllowed !== false) {
    errors.push(issue("P02_MAINLINE_BOUNDARY_INVALID", { boundary }));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({ ...metrics }),
  });
}

export function runP02W2ProductAdmissionInventoryValidation() {
  const report = validateP02W2ProductAdmissionInventory();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) runP02W2ProductAdmissionInventoryValidation();
