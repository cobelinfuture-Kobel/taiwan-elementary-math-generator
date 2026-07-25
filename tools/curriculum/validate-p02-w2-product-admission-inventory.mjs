import { pathToFileURL } from "node:url";
import path from "node:path";

import { materializeP02W2ProductAdmissionInventory } from "../../src/curriculum/full-product/p02-w2-product-admission-inventory.mjs";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function count(rows, predicate) {
  return rows.filter(predicate).length;
}

export function validateP02W2ProductAdmissionInventory(candidate = null) {
  const inventory = candidate ?? materializeP02W2ProductAdmissionInventory();
  const errors = [];
  const rows = inventory.rows ?? [];
  const sourceSummaries = inventory.sourceSummaries ?? [];
  const capabilitySummaries = inventory.capabilitySummaries ?? [];
  const metrics = inventory.metrics ?? {};

  if (inventory.programId !== "FULL_PRODUCT_LINE_D0_V1") {
    errors.push(issue("P02_PROGRAM_ID_INVALID", { actual: inventory.programId }));
  }
  if (inventory.taskId !== "P02_W2ProductAdmissionInventoryAndGapMatrix") {
    errors.push(issue("P02_TASK_ID_INVALID", { actual: inventory.taskId }));
  }
  if (rows.length === 0) errors.push(issue("P02_W2_INVENTORY_EMPTY"));
  if (new Set(rows.map((row) => row.knowledgePointId)).size !== rows.length) {
    errors.push(issue("P02_DUPLICATE_KNOWLEDGE_POINT"));
  }

  for (const row of rows) {
    if (row.deliveryWaveId !== "R05-W2") {
      errors.push(issue("P02_NON_W2_ROW", { knowledgePointId: row.knowledgePointId, deliveryWaveId: row.deliveryWaveId }));
    }
    if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
      errors.push(issue("P02_SOURCE_TRACE_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (!Array.isArray(row.shadowRequiredCapabilityIds) || row.shadowRequiredCapabilityIds.length === 0) {
      errors.push(issue("P02_SHADOW_CAPABILITY_GAP_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if ((row.contractOnlyRequiredCapabilityIds ?? []).length > 0
      || row.capabilityGapState === "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT") {
      errors.push(issue("P02_CONTRACT_ONLY_CAPABILITY_DRIFT", {
        knowledgePointId: row.knowledgePointId,
        capabilityIds: row.contractOnlyRequiredCapabilityIds,
      }));
    }
    if (row.capabilityGapState !== "SHADOW_CAPABILITY_HARDENING_REQUIRED") {
      errors.push(issue("P02_CAPABILITY_GAP_STATE_INVALID", {
        knowledgePointId: row.knowledgePointId,
        state: row.capabilityGapState,
      }));
    }
    if (!Array.isArray(row.nextAdmissionActions) || row.nextAdmissionActions.length === 0) {
      errors.push(issue("P02_NEXT_ACTIONS_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.directProductionAdmissionAllowed !== false || row.productionAdmissionState !== "INVENTORIED_NOT_ADMITTED") {
      errors.push(issue("P02_INVENTORY_BOUNDARY_VIOLATION", { knowledgePointId: row.knowledgePointId }));
    }
  }

  if (capabilitySummaries.length === 0) errors.push(issue("P02_SHADOW_FOUNDATION_CAPABILITY_PLAN_EMPTY"));
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
      || capability.productionAdmissionState !== "INVENTORIED_NOT_ADMITTED") {
      errors.push(issue("P02_CAPABILITY_INVENTORY_BOUNDARY_VIOLATION", { capabilityId: capability.capabilityId }));
    }
  }

  const expectedMetrics = {
    knowledgePointCount: rows.length,
    sourceNodeCount: sourceSummaries.length,
    shadowFoundationCapabilityCount: capabilitySummaries.length,
    shadowCapabilityGapKnowledgePointCount: count(rows, (row) => row.capabilityGapState === "SHADOW_CAPABILITY_HARDENING_REQUIRED"),
    capabilityReadyForProductAdmissionCount: count(rows, (row) => row.capabilityGapState === "CAPABILITY_READY_FOR_PRODUCT_ADMISSION"),
    contractOnlyCapabilityDriftCount: count(rows, (row) => row.capabilityGapState === "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT"),
    publicKnowledgePointVisibleCount: count(rows, (row) => row.currentProductCoverage?.publicKnowledgePointVisible === true),
    publicPatternBindingPresentCount: count(rows, (row) => row.currentProductCoverage?.publicPatternBindingPresent === true),
    publicSourceSelectableCount: count(sourceSummaries, (row) => row.publicSourceSelectable === true),
    admissionReadyExistingPublicPatternAfterCapabilityCount: count(rows, (row) => (
      row.productGapState === "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY"
    )),
    patternGroupOrSpecBindingRequiredAfterCapabilityCount: count(rows, (row) => (
      row.productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY"
    )),
    publicProductVerticalSliceRequiredAfterCapabilityCount: count(rows, (row) => (
      row.productGapState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY"
    )),
    directProductionAdmissionCount: count(rows, (row) => row.directProductionAdmissionAllowed === true),
  };
  for (const [key, expected] of Object.entries(expectedMetrics)) {
    if (metrics[key] !== expected) errors.push(issue("P02_METRIC_MISMATCH", { key, expected, actual: metrics[key] }));
  }

  const sourceAuthority = inventory.manifest?.sourceAuthorities ?? {};
  for (const [key, actual] of [
    ["knowledgePointCount", metrics.knowledgePointCount],
    ["sourceNodeCount", metrics.sourceNodeCount],
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
    if (policyRules[key] !== false) errors.push(issue("P02_POLICY_BOUNDARY_INVALID", { key, actual: policyRules[key] }));
  }
  if (policyRules.inventoryOnly !== true) errors.push(issue("P02_POLICY_INVENTORY_ONLY_REQUIRED"));

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
