import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR05DeliveryWaveRebase } from "../global/r05-delivery-wave-rebase.mjs";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P01_DIR = path.join(ROOT, "data/curriculum/full-product/p01");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P01_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function sourceNodeIdOf(ref) {
  return typeof ref === "string" ? ref : ref?.sourceNodeId;
}

function displayNameOf(knowledgePoint) {
  return knowledgePoint.canonicalNameZh
    ?? knowledgePoint.displayName
    ?? knowledgePoint.knowledgePointName
    ?? knowledgePoint.knowledgePointId;
}

function classifyGap({ visibleKnowledgePoint, patternGroupIds, patternSpecIds }) {
  if (visibleKnowledgePoint && patternGroupIds.length > 0 && patternSpecIds.length > 0) {
    return "ADMISSION_READY_EXISTING_PUBLIC_PATTERN";
  }
  if (visibleKnowledgePoint || patternGroupIds.length > 0 || patternSpecIds.length > 0) {
    return "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED";
  }
  return "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED";
}

function admissionActions(gapState) {
  if (gapState === "ADMISSION_READY_EXISTING_PUBLIC_PATTERN") {
    return [
      "VERIFY_SOURCE_AND_KP_IDENTITY",
      "VERIFY_SHARED_GENERATOR_VALIDATOR_BINDING",
      "RUN_PUBLIC_UI_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  if (gapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED") {
    return [
      "RECONCILE_FORMAL_MAPPING_TO_PUBLIC_PATTERN_GROUP",
      "MATERIALIZE_OR_BIND_PATTERN_SPEC",
      "BIND_EXISTING_SHARED_GENERATOR_VALIDATOR",
      "ADD_PUBLIC_SOURCE_ADAPTER_AND_UI_SELECTION",
      "RUN_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  return [
    "MATERIALIZE_FORMAL_MAPPING_AND_PATTERN_SPEC_FROM_SOURCE_EVIDENCE",
    "BIND_EXISTING_SHARED_GENERATOR_VALIDATOR",
    "ADD_PUBLIC_SOURCE_ADAPTER",
    "ADD_PUBLIC_UI_SELECTION",
    "RUN_WORKSHEET_ANSWER_KEY_HTML_PDF_PRINT_ACCEPTANCE",
  ];
}

function buildSourceSummaries(rows) {
  const bySource = new Map();
  for (const row of rows) {
    for (const sourceNodeId of row.sourceNodeIds) {
      if (!bySource.has(sourceNodeId)) bySource.set(sourceNodeId, []);
      bySource.get(sourceNodeId).push(row);
    }
  }
  return [...bySource.entries()].map(([sourceNodeId, sourceRows]) => Object.freeze({
    sourceNodeId,
    knowledgePointCount: sourceRows.length,
    knowledgePointIds: freezeArray(sourceRows.map((row) => row.knowledgePointId).sort()),
    gapStateCounts: Object.freeze(Object.fromEntries([
      "ADMISSION_READY_EXISTING_PUBLIC_PATTERN",
      "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED",
      "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED",
    ].map((state) => [state, sourceRows.filter((row) => row.productGapState === state).length]))),
    publicSourceSelectable: sourceRows.some((row) => row.currentProductCoverage.publicSourceSelectable),
  })).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId));
}

function buildMetrics(rows, sourceSummaries) {
  const stateCount = (state) => rows.filter((row) => row.productGapState === state).length;
  return Object.freeze({
    knowledgePointCount: rows.length,
    sourceNodeCount: sourceSummaries.length,
    allRequiredCapabilitiesProductionAdmittedCount: rows.filter((row) => row.capabilityProof.allRequiredCapabilitiesProductionAdmitted).length,
    shadowCapabilityGapCount: rows.filter((row) => row.shadowRequiredCapabilityIds.length > 0).length,
    contractOnlyCapabilityGapCount: rows.filter((row) => row.contractOnlyRequiredCapabilityIds.length > 0).length,
    publicKnowledgePointVisibleCount: rows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
    publicPatternBindingPresentCount: rows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
    publicSourceSelectableCount: sourceSummaries.filter((row) => row.publicSourceSelectable).length,
    admissionReadyExistingPublicPatternCount: stateCount("ADMISSION_READY_EXISTING_PUBLIC_PATTERN"),
    patternGroupOrSpecBindingRequiredCount: stateCount("PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED"),
    publicProductVerticalSliceRequiredCount: stateCount("PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED"),
    directProductionAdmissionCount: rows.filter((row) => row.directProductionAdmissionAllowed).length,
  });
}

export function materializeP01AW1ProductAdmissionInventory() {
  const policy = readJson("w1-product-admission-inventory-policy.json");
  const manifest = readJson("w1-product-admission-inventory.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const r04 = r05.runtimeCapabilityMatrix;
  const knowledgePointById = new Map(r04.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  const mappingById = new Map(r04.knowledgePointMappings.map((row) => [row.knowledgePointId, row]));
  const capabilityById = new Map(r04.capabilities.map((row) => [row.capabilityId, row]));
  const visibleRows = listVisibleBatchAKnowledgePoints();
  const visibleKnowledgePointById = new Map(visibleRows.map((row) => [row.knowledgePointId, row]));
  const visibleSourceIds = new Set(visibleRows.map((row) => row.sourceId));
  const assignments = r05.knowledgePointAssignments.filter((row) => row.deliveryWaveId === "R05-W1");

  const rows = assignments.map((assignment) => {
    const knowledgePoint = knowledgePointById.get(assignment.knowledgePointId);
    const mapping = mappingById.get(assignment.knowledgePointId);
    if (!knowledgePoint || !mapping) throw new Error(`P01A_KP_OR_MAPPING_MISSING:${assignment.knowledgePointId}`);
    const visibleKnowledgePoint = visibleKnowledgePointById.get(assignment.knowledgePointId) ?? null;
    const patternGroups = visibleKnowledgePoint
      ? getVisiblePatternGroupsForKnowledgePoint(assignment.knowledgePointId)
      : [];
    const patternGroupIds = unique(patternGroups.map((row) => row.patternGroupId)).sort();
    const patternSpecIds = unique(patternGroups.flatMap((row) => row.patternSpecIds ?? [])).sort();
    const sourceNodeIds = unique([
      ...assignment.sourceNodeIds,
      ...(knowledgePoint.sourceRefs ?? []).map(sourceNodeIdOf),
    ]).sort();
    const runtimeEvidencePaths = unique(assignment.effectiveRequiredRuntimeCapabilityIds.flatMap((capabilityId) => (
      capabilityById.get(capabilityId)?.runtimeEvidencePaths ?? []
    ))).sort();
    const publicSourceSelectable = sourceNodeIds.some((sourceNodeId) => visibleSourceIds.has(sourceNodeId));
    const productGapState = classifyGap({
      visibleKnowledgePoint: Boolean(visibleKnowledgePoint),
      patternGroupIds,
      patternSpecIds,
    });
    const allRequiredCapabilitiesProductionAdmitted = assignment.effectiveRequiredRuntimeCapabilityIds.length > 0
      && assignment.shadowRequiredCapabilityIds.length === 0
      && assignment.contractOnlyRequiredCapabilityIds.length === 0
      && assignment.effectiveRequiredRuntimeCapabilityIds.every((id) => (
        capabilityById.get(id)?.deliveryStatus === "production_admitted"
      ));

    return Object.freeze({
      inventoryRowId: `p01a_${assignment.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: assignment.knowledgePointId,
      canonicalNameZh: displayNameOf(knowledgePoint),
      capabilityStatement: knowledgePoint.capabilityStatement ?? null,
      reasoningInvariant: knowledgePoint.reasoningInvariant ?? null,
      sourceNodeIds: freezeArray(sourceNodeIds),
      sourceRefs: freezeArray(knowledgePoint.sourceRefs ?? []),
      deliveryWaveId: assignment.deliveryWaveId,
      intraWavePrerequisiteRank: assignment.intraWavePrerequisiteRank,
      prerequisiteWaveLowerBound: assignment.prerequisiteWaveLowerBound,
      primaryRuntimeProfileId: assignment.primaryRuntimeProfileId,
      effectiveRequiredRuntimeCapabilityIds: freezeArray(assignment.effectiveRequiredRuntimeCapabilityIds),
      productionAdmittedRequiredCapabilityIds: freezeArray(assignment.productionAdmittedRequiredCapabilityIds),
      shadowRequiredCapabilityIds: freezeArray(assignment.shadowRequiredCapabilityIds),
      contractOnlyRequiredCapabilityIds: freezeArray(assignment.contractOnlyRequiredCapabilityIds),
      capabilityProof: Object.freeze({
        allRequiredCapabilitiesProductionAdmitted,
        runtimeEvidencePaths: freezeArray(runtimeEvidencePaths),
      }),
      currentProductCoverage: Object.freeze({
        publicSourceSelectable,
        publicKnowledgePointVisible: Boolean(visibleKnowledgePoint),
        publicPatternBindingPresent: patternGroupIds.length > 0 && patternSpecIds.length > 0,
        patternGroupIds: freezeArray(patternGroupIds),
        patternSpecIds: freezeArray(patternSpecIds),
      }),
      productGapState,
      nextAdmissionActions: freezeArray(admissionActions(productGapState)),
      directProductionAdmissionAllowed: false,
      productionAdmissionState: "INVENTORIED_NOT_ADMITTED",
    });
  }).sort((a, b) => (
    a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.knowledgePointId.localeCompare(b.knowledgePointId)
  ));

  const sourceSummaries = buildSourceSummaries(rows);
  const metrics = buildMetrics(rows, sourceSummaries);
  const rowByKnowledgePointId = new Map(rows.map((row) => [row.knowledgePointId, row]));

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    rows: freezeArray(rows),
    sourceSummaries: freezeArray(sourceSummaries),
    metrics,
    deliveryWaveAuthority: r05,
    getRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP01AW1InventoryRows() {
  return materializeP01AW1ProductAdmissionInventory().rows;
}

export function getP01AW1InventoryRow(knowledgePointId) {
  return materializeP01AW1ProductAdmissionInventory().getRow(knowledgePointId);
}
