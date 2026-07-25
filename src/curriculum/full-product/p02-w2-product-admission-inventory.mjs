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
const P02_DIR = path.join(ROOT, "data/curriculum/full-product/p02");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02_DIR, fileName), "utf8"));
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

function classifyCapabilityGap(assignment) {
  if (assignment.contractOnlyRequiredCapabilityIds.length > 0) {
    return "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT";
  }
  if (assignment.shadowRequiredCapabilityIds.length > 0) {
    return "SHADOW_CAPABILITY_HARDENING_REQUIRED";
  }
  return "CAPABILITY_READY_FOR_PRODUCT_ADMISSION";
}

function classifyProductGap({ visibleKnowledgePoint, patternGroupIds, patternSpecIds }) {
  if (visibleKnowledgePoint && patternGroupIds.length > 0 && patternSpecIds.length > 0) {
    return "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY";
  }
  if (visibleKnowledgePoint || patternGroupIds.length > 0 || patternSpecIds.length > 0) {
    return "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY";
  }
  return "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY";
}

function productAdmissionActions(productGapState) {
  if (productGapState === "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY") {
    return [
      "VERIFY_SOURCE_KP_AND_PATTERN_IDENTITY_AFTER_CAPABILITY_ADMISSION",
      "VERIFY_SHARED_GENERATOR_VALIDATOR_BINDING",
      "RUN_PUBLIC_UI_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  if (productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY") {
    return [
      "RECONCILE_FORMAL_MAPPING_TO_PUBLIC_PATTERN_GROUP",
      "MATERIALIZE_OR_BIND_PATTERN_SPEC",
      "BIND_HARDENED_SHARED_GENERATOR_VALIDATOR",
      "ADD_PUBLIC_SOURCE_ADAPTER_AND_UI_SELECTION",
      "RUN_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  return [
    "MATERIALIZE_FORMAL_MAPPING_AND_PATTERN_SPEC_FROM_SOURCE_EVIDENCE",
    "BIND_HARDENED_SHARED_GENERATOR_VALIDATOR",
    "ADD_PUBLIC_SOURCE_ADAPTER",
    "ADD_PUBLIC_UI_SELECTION",
    "RUN_WORKSHEET_ANSWER_KEY_HTML_PDF_PRINT_ACCEPTANCE",
  ];
}

function nextAdmissionActions(capabilityGapState, shadowCapabilityIds, productGapState) {
  const actions = [];
  if (capabilityGapState === "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT") {
    actions.push("FAIL_CLOSED_AND_REASSIGN_TO_CORRECT_DELIVERY_WAVE");
  } else if (capabilityGapState === "SHADOW_CAPABILITY_HARDENING_REQUIRED") {
    actions.push(...shadowCapabilityIds.map((capabilityId) => (
      `HARDEN_AND_ADMIT_SHARED_CAPABILITY:${capabilityId}`
    )));
  }
  actions.push(...productAdmissionActions(productGapState));
  return actions;
}

function buildSourceSummaries(rows) {
  const bySource = new Map();
  for (const row of rows) {
    for (const sourceNodeId of row.sourceNodeIds) {
      if (!bySource.has(sourceNodeId)) bySource.set(sourceNodeId, []);
      bySource.get(sourceNodeId).push(row);
    }
  }
  const productStates = [
    "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY",
    "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY",
    "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY",
  ];
  return [...bySource.entries()].map(([sourceNodeId, sourceRows]) => Object.freeze({
    sourceNodeId,
    knowledgePointCount: sourceRows.length,
    knowledgePointIds: freezeArray(sourceRows.map((row) => row.knowledgePointId).sort()),
    shadowCapabilityIds: freezeArray(unique(sourceRows.flatMap((row) => row.shadowRequiredCapabilityIds)).sort()),
    capabilityGapStateCounts: Object.freeze({
      SHADOW_CAPABILITY_HARDENING_REQUIRED: sourceRows.filter((row) => (
        row.capabilityGapState === "SHADOW_CAPABILITY_HARDENING_REQUIRED"
      )).length,
      CAPABILITY_READY_FOR_PRODUCT_ADMISSION: sourceRows.filter((row) => (
        row.capabilityGapState === "CAPABILITY_READY_FOR_PRODUCT_ADMISSION"
      )).length,
      OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT: sourceRows.filter((row) => (
        row.capabilityGapState === "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT"
      )).length,
    }),
    productGapStateCounts: Object.freeze(Object.fromEntries(
      productStates.map((state) => [state, sourceRows.filter((row) => row.productGapState === state).length]),
    )),
    publicSourceSelectable: sourceRows.some((row) => row.currentProductCoverage.publicSourceSelectable),
  })).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId));
}

function capabilitySequenceRank(capabilityId, capabilityById, w2CapabilityIds, memo = new Map(), visiting = new Set()) {
  if (memo.has(capabilityId)) return memo.get(capabilityId);
  if (visiting.has(capabilityId)) throw new Error(`P02_CAPABILITY_DEPENDENCY_CYCLE:${capabilityId}`);
  visiting.add(capabilityId);
  const dependencyRanks = (capabilityById.get(capabilityId)?.dependsOnCapabilityIds ?? [])
    .filter((dependencyId) => w2CapabilityIds.has(dependencyId))
    .map((dependencyId) => capabilitySequenceRank(dependencyId, capabilityById, w2CapabilityIds, memo, visiting));
  visiting.delete(capabilityId);
  const rank = dependencyRanks.length > 0 ? Math.max(...dependencyRanks) + 1 : 0;
  memo.set(capabilityId, rank);
  return rank;
}

function buildCapabilitySummaries(rows, r05, capabilityById) {
  const w2Plan = r05.capabilityDeliveryPlan.filter((row) => row.deliveryWaveId === "R05-W2");
  const w2CapabilityIds = new Set(w2Plan.map((row) => row.capabilityId));
  const rankMemo = new Map();
  return w2Plan.map((plan) => {
    const capability = capabilityById.get(plan.capabilityId);
    const effectiveRows = rows.filter((row) => (
      row.effectiveRequiredRuntimeCapabilityIds.includes(plan.capabilityId)
    ));
    const directRows = rows.filter((row) => (
      row.requiredRuntimeCapabilityIds.includes(plan.capabilityId)
    ));
    return Object.freeze({
      capabilityId: plan.capabilityId,
      capabilityClass: plan.capabilityClass,
      deliveryStatusBeforeP02: plan.deliveryStatusBeforeR05,
      dependencyCapabilityIds: freezeArray(plan.dependencyCapabilityIds),
      foundationSequenceRank: capabilitySequenceRank(
        plan.capabilityId,
        capabilityById,
        w2CapabilityIds,
        rankMemo,
      ),
      requiredByAllKnowledgePointCount: plan.requiredByKnowledgePointCount,
      requiredByW2KnowledgePointCount: effectiveRows.length,
      directlyRequiredByW2KnowledgePointCount: directRows.length,
      outsideW2KnowledgePointCount: Math.max(0, plan.requiredByKnowledgePointCount - effectiveRows.length),
      w2KnowledgePointIds: freezeArray(effectiveRows.map((row) => row.knowledgePointId).sort()),
      w2SourceNodeIds: freezeArray(unique(effectiveRows.flatMap((row) => row.sourceNodeIds)).sort()),
      runtimeEvidencePaths: freezeArray(capability?.runtimeEvidencePaths ?? []),
      nextAction: "HARDEN_AND_ADMIT_SHARED_CAPABILITY",
      directProductionAdmissionAllowed: false,
      productionAdmissionState: "INVENTORIED_NOT_ADMITTED",
    });
  }).sort((a, b) => (
    a.foundationSequenceRank - b.foundationSequenceRank
    || b.requiredByW2KnowledgePointCount - a.requiredByW2KnowledgePointCount
    || a.capabilityId.localeCompare(b.capabilityId)
  ));
}

function buildMetrics(rows, sourceSummaries, capabilitySummaries) {
  const productStateCount = (state) => rows.filter((row) => row.productGapState === state).length;
  const shadowCapabilityIds = unique(rows.flatMap((row) => row.shadowRequiredCapabilityIds));
  return Object.freeze({
    knowledgePointCount: rows.length,
    sourceNodeCount: sourceSummaries.length,
    shadowFoundationCapabilityCount: capabilitySummaries.length,
    w2RequiredShadowCapabilityCount: shadowCapabilityIds.length,
    shadowCapabilityGapKnowledgePointCount: rows.filter((row) => (
      row.capabilityGapState === "SHADOW_CAPABILITY_HARDENING_REQUIRED"
    )).length,
    capabilityReadyForProductAdmissionCount: rows.filter((row) => (
      row.capabilityGapState === "CAPABILITY_READY_FOR_PRODUCT_ADMISSION"
    )).length,
    contractOnlyCapabilityDriftCount: rows.filter((row) => (
      row.capabilityGapState === "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT"
    )).length,
    publicKnowledgePointVisibleCount: rows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
    publicPatternBindingPresentCount: rows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
    publicSourceSelectableCount: sourceSummaries.filter((row) => row.publicSourceSelectable).length,
    admissionReadyExistingPublicPatternAfterCapabilityCount: productStateCount(
      "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY",
    ),
    patternGroupOrSpecBindingRequiredAfterCapabilityCount: productStateCount(
      "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY",
    ),
    publicProductVerticalSliceRequiredAfterCapabilityCount: productStateCount(
      "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY",
    ),
    capabilityWithW2DependentsCount: capabilitySummaries.filter((row) => row.requiredByW2KnowledgePointCount > 0).length,
    capabilityWithoutW2DependentsCount: capabilitySummaries.filter((row) => row.requiredByW2KnowledgePointCount === 0).length,
    directProductionAdmissionCount: rows.filter((row) => row.directProductionAdmissionAllowed).length,
  });
}

export function materializeP02W2ProductAdmissionInventory() {
  const policy = readJson("w2-product-admission-inventory-policy.json");
  const manifest = readJson("w2-product-admission-inventory.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const r04 = r05.runtimeCapabilityMatrix;
  const knowledgePointById = new Map(r04.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  const mappingById = new Map(r04.knowledgePointMappings.map((row) => [row.knowledgePointId, row]));
  const capabilityById = new Map(r04.capabilities.map((row) => [row.capabilityId, row]));
  const visibleRows = listVisibleBatchAKnowledgePoints();
  const visibleKnowledgePointById = new Map(visibleRows.map((row) => [row.knowledgePointId, row]));
  const visibleSourceIds = new Set(visibleRows.map((row) => row.sourceId));
  const assignments = r05.knowledgePointAssignments.filter((row) => row.deliveryWaveId === "R05-W2");

  const rows = assignments.map((assignment) => {
    const knowledgePoint = knowledgePointById.get(assignment.knowledgePointId);
    const mapping = mappingById.get(assignment.knowledgePointId);
    if (!knowledgePoint || !mapping) throw new Error(`P02_KP_OR_MAPPING_MISSING:${assignment.knowledgePointId}`);
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
    const capabilityGapState = classifyCapabilityGap(assignment);
    const productGapState = classifyProductGap({
      visibleKnowledgePoint: Boolean(visibleKnowledgePoint),
      patternGroupIds,
      patternSpecIds,
    });

    return Object.freeze({
      inventoryRowId: `p02_${assignment.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: assignment.knowledgePointId,
      canonicalNameZh: displayNameOf(knowledgePoint),
      capabilityStatement: knowledgePoint.capabilityStatement ?? null,
      reasoningInvariant: knowledgePoint.reasoningInvariant ?? null,
      sourceNodeIds: freezeArray(sourceNodeIds),
      sourceRefs: freezeArray(knowledgePoint.sourceRefs ?? []),
      deliveryWaveId: assignment.deliveryWaveId,
      baseDeliveryWaveId: assignment.baseDeliveryWaveId,
      intraWavePrerequisiteRank: assignment.intraWavePrerequisiteRank,
      prerequisiteWaveLowerBound: assignment.prerequisiteWaveLowerBound,
      waveEscalatedByPrerequisite: assignment.waveEscalatedByPrerequisite,
      primaryRuntimeProfileId: assignment.primaryRuntimeProfileId,
      requiredRuntimeCapabilityIds: freezeArray(assignment.requiredRuntimeCapabilityIds),
      effectiveRequiredRuntimeCapabilityIds: freezeArray(assignment.effectiveRequiredRuntimeCapabilityIds),
      productionAdmittedRequiredCapabilityIds: freezeArray(assignment.productionAdmittedRequiredCapabilityIds),
      shadowRequiredCapabilityIds: freezeArray(assignment.shadowRequiredCapabilityIds),
      contractOnlyRequiredCapabilityIds: freezeArray(assignment.contractOnlyRequiredCapabilityIds),
      capabilityProof: Object.freeze({
        allRequiredCapabilitiesAvailableWithoutContractOnlyGap: assignment.contractOnlyRequiredCapabilityIds.length === 0,
        allRequiredCapabilitiesProductionAdmitted: assignment.shadowRequiredCapabilityIds.length === 0
          && assignment.contractOnlyRequiredCapabilityIds.length === 0,
        runtimeEvidencePaths: freezeArray(runtimeEvidencePaths),
      }),
      currentProductCoverage: Object.freeze({
        publicSourceSelectable,
        publicKnowledgePointVisible: Boolean(visibleKnowledgePoint),
        publicPatternBindingPresent: patternGroupIds.length > 0 && patternSpecIds.length > 0,
        patternGroupIds: freezeArray(patternGroupIds),
        patternSpecIds: freezeArray(patternSpecIds),
      }),
      capabilityGapState,
      productGapState,
      nextAdmissionActions: freezeArray(nextAdmissionActions(
        capabilityGapState,
        assignment.shadowRequiredCapabilityIds,
        productGapState,
      )),
      directProductionAdmissionAllowed: false,
      productionAdmissionState: "INVENTORIED_NOT_ADMITTED",
    });
  }).sort((a, b) => (
    a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.knowledgePointId.localeCompare(b.knowledgePointId)
  ));

  const sourceSummaries = buildSourceSummaries(rows);
  const capabilitySummaries = buildCapabilitySummaries(rows, r05, capabilityById);
  const metrics = buildMetrics(rows, sourceSummaries, capabilitySummaries);
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
    capabilitySummaries: freezeArray(capabilitySummaries),
    metrics,
    deliveryWaveAuthority: r05,
    getRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP02W2InventoryRows() {
  return materializeP02W2ProductAdmissionInventory().rows;
}

export function getP02W2InventoryRow(knowledgePointId) {
  return materializeP02W2ProductAdmissionInventory().getRow(knowledgePointId);
}
