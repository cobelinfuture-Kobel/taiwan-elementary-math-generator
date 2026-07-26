import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR05DeliveryWaveRebase } from "../global/r05-delivery-wave-rebase.mjs";
import { materializeP02GW2FoundationCloseoutUnblockMatrix } from "./p02g-w2-foundation-closeout-unblock.mjs";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03_DIR = path.join(ROOT, "data/curriculum/full-product/p03");
const W3_WAVE_ID = "R05-W3";

export const P03_W3_PRODUCT_ADMISSION_INVENTORY_VERSION = "p03-w3-product-admission-inventory-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03_DIR, fileName), "utf8"));
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

function countBy(rows, keySelector) {
  const counts = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.freeze(Object.fromEntries(
    [...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))),
  ));
}

function classifyProductGap({ visibleKnowledgePoint, patternGroupIds, patternSpecIds }) {
  if (visibleKnowledgePoint && patternGroupIds.length > 0 && patternSpecIds.length > 0) {
    return "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY";
  }
  if (visibleKnowledgePoint || patternGroupIds.length > 0 || patternSpecIds.length > 0) {
    return "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY";
  }
  return "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY";
}

function productActions(productGapState) {
  if (productGapState === "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY") {
    return [
      "VERIFY_SOURCE_KP_AND_PATTERN_IDENTITY_AFTER_W3_CAPABILITY_ADMISSION",
      "VERIFY_SHARED_GENERATOR_VALIDATOR_BINDING",
      "RUN_PUBLIC_UI_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  if (productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY") {
    return [
      "RECONCILE_FORMAL_MAPPING_TO_PUBLIC_PATTERN_GROUP",
      "MATERIALIZE_OR_BIND_PATTERN_SPEC",
      "BIND_W3_NUMBER_DOMAIN_GENERATOR_VALIDATOR",
      "ADD_PUBLIC_SOURCE_ADAPTER_AND_UI_SELECTION",
      "RUN_WORKSHEET_HTML_PDF_PRINT_ACCEPTANCE",
    ];
  }
  return [
    "MATERIALIZE_FORMAL_MAPPING_AND_PATTERN_SPEC_FROM_SOURCE_EVIDENCE",
    "BIND_W3_NUMBER_DOMAIN_GENERATOR_VALIDATOR",
    "ADD_PUBLIC_SOURCE_ADAPTER",
    "ADD_PUBLIC_UI_SELECTION",
    "RUN_WORKSHEET_ANSWER_KEY_HTML_PDF_PRINT_ACCEPTANCE",
  ];
}

function buildCapabilitySummaries({ capabilityPlan, dependentRows, directRows, capabilityById }) {
  return capabilityPlan.map((plan) => {
    const capability = capabilityById.get(plan.capabilityId);
    const effectiveRows = dependentRows.filter((row) => row.w3CapabilityIds.includes(plan.capabilityId));
    const directlyRequiredRows = dependentRows.filter((row) => row.directlyRequiredW3CapabilityIds.includes(plan.capabilityId));
    const directWaveRows = directRows.filter((row) => row.w3CapabilityIds.includes(plan.capabilityId));
    return Object.freeze({
      capabilityId: plan.capabilityId,
      capabilityClass: plan.capabilityClass,
      deliveryStatusBeforeP03: capability?.deliveryStatus ?? null,
      dependencyCapabilityIds: freezeArray(capability?.dependsOnCapabilityIds ?? []),
      requiredByAllKnowledgePointCount: plan.requiredByKnowledgePointCount,
      blockedKnowledgePointCountBeforeP03: plan.blockedKnowledgePointCount,
      effectiveDependentKnowledgePointCount: effectiveRows.length,
      directlyRequiredDependentKnowledgePointCount: directlyRequiredRows.length,
      directW3KnowledgePointCount: directWaveRows.length,
      dependentKnowledgePointIds: freezeArray(effectiveRows.map((row) => row.knowledgePointId).sort()),
      dependentSourceNodeIds: freezeArray(unique(effectiveRows.flatMap((row) => row.sourceNodeIds)).sort()),
      dependentCountsByWave: countBy(effectiveRows, (row) => row.assignedDeliveryWaveId),
      runtimeEvidencePaths: freezeArray(capability?.runtimeEvidencePaths ?? []),
      implementationState: "CONTRACT_ONLY_NOT_IMPLEMENTED",
      productionAdmissionState: "CAPABILITY_INVENTORIED_NOT_ADMITTED",
      nextAction: "IMPLEMENT_VALIDATE_AND_ADMIT_W3_CONTRACT_CAPABILITY",
      directProductionAdmissionAllowed: false,
    });
  }).sort((a, b) => (
    b.effectiveDependentKnowledgePointCount - a.effectiveDependentKnowledgePointCount
    || b.directW3KnowledgePointCount - a.directW3KnowledgePointCount
    || a.capabilityId.localeCompare(b.capabilityId)
  ));
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
    dependentKnowledgePointCount: sourceRows.length,
    directW3KnowledgePointCount: sourceRows.filter((row) => row.directW3CohortMember).length,
    laterWaveDependentKnowledgePointCount: sourceRows.filter((row) => row.laterWaveDependent).length,
    knowledgePointIds: freezeArray(sourceRows.map((row) => row.knowledgePointId).sort()),
    w3CapabilityIds: freezeArray(unique(sourceRows.flatMap((row) => row.w3CapabilityIds)).sort()),
    deliveryWaveIds: freezeArray(unique(sourceRows.map((row) => row.assignedDeliveryWaveId)).sort()),
    publicSourceSelectable: sourceRows.some((row) => row.currentProductCoverage.publicSourceSelectable),
    publicKnowledgePointVisibleCount: sourceRows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
    publicPatternBindingPresentCount: sourceRows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
  })).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId));
}

function buildWaveSummaries(rows) {
  return unique(rows.map((row) => row.assignedDeliveryWaveId)).sort().map((deliveryWaveId) => {
    const waveRows = rows.filter((row) => row.assignedDeliveryWaveId === deliveryWaveId);
    return Object.freeze({
      deliveryWaveId,
      dependentKnowledgePointCount: waveRows.length,
      dependentSourceNodeCount: new Set(waveRows.flatMap((row) => row.sourceNodeIds)).size,
      directW3KnowledgePointCount: waveRows.filter((row) => row.directW3CohortMember).length,
      prerequisiteEscalatedKnowledgePointCount: waveRows.filter((row) => row.waveEscalatedByPrerequisite).length,
      inheritedW2DependencyCount: waveRows.filter((row) => row.inheritedW2DependencyPresent).length,
      inheritedW2DependencyUnblockedCount: waveRows.filter((row) => row.inheritedW2DependencyUnblocked).length,
      existingPublicPatternAfterCapabilityCount: waveRows.filter((row) => row.productGapState === "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY").length,
      patternBindingRequiredAfterCapabilityCount: waveRows.filter((row) => row.productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY").length,
      publicProductVerticalSliceRequiredAfterCapabilityCount: waveRows.filter((row) => row.productGapState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY").length,
    });
  });
}

export function materializeP03W3ProductAdmissionInventory() {
  const policy = readJson("w3-product-admission-inventory-policy.json");
  const manifest = readJson("w3-product-admission-inventory.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const p02g = materializeP02GW2FoundationCloseoutUnblockMatrix();
  const r04 = r05.runtimeCapabilityMatrix;
  const w3CapabilityPlan = r05.capabilityDeliveryPlan.filter((row) => row.deliveryWaveId === W3_WAVE_ID);
  const w3CapabilityIds = new Set(w3CapabilityPlan.map((row) => row.capabilityId));
  const requiredPolicyCapabilityIds = [...policy.w3ContractCapabilityIds].sort();
  const plannedCapabilityIds = [...w3CapabilityIds].sort();
  const capabilityById = new Map(r04.capabilities.map((row) => [row.capabilityId, row]));
  const knowledgePointById = new Map(r04.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  const mappingById = new Map(r04.knowledgePointMappings.map((row) => [row.knowledgePointId, row]));
  const visibleRows = listVisibleBatchAKnowledgePoints();
  const visibleKnowledgePointById = new Map(visibleRows.map((row) => [row.knowledgePointId, row]));
  const visibleSourceIds = new Set(visibleRows.map((row) => row.sourceId));

  const dependentAssignments = r05.knowledgePointAssignments.filter((assignment) => (
    assignment.effectiveRequiredRuntimeCapabilityIds.some((id) => w3CapabilityIds.has(id))
  ));

  const dependentRows = dependentAssignments.map((assignment) => {
    const knowledgePoint = knowledgePointById.get(assignment.knowledgePointId);
    const mapping = mappingById.get(assignment.knowledgePointId);
    if (!knowledgePoint || !mapping) throw new Error(`P03_KP_OR_MAPPING_MISSING:${assignment.knowledgePointId}`);
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
    const effectiveW3CapabilityIds = assignment.effectiveRequiredRuntimeCapabilityIds
      .filter((id) => w3CapabilityIds.has(id))
      .sort();
    const directlyRequiredW3CapabilityIds = assignment.requiredRuntimeCapabilityIds
      .filter((id) => w3CapabilityIds.has(id))
      .sort();
    const inheritedW2Row = p02g.getRow(assignment.knowledgePointId);
    const productGapState = classifyProductGap({
      visibleKnowledgePoint: Boolean(visibleKnowledgePoint),
      patternGroupIds,
      patternSpecIds,
    });
    const directW3CohortMember = assignment.deliveryWaveId === W3_WAVE_ID;
    const baseW3CohortMember = assignment.baseDeliveryWaveId === W3_WAVE_ID;
    const laterWaveDependent = !directW3CohortMember;
    const missingW3CapabilityIds = effectiveW3CapabilityIds.filter((id) => (
      capabilityById.get(id)?.deliveryStatus !== "production_admitted"
    ));

    return Object.freeze({
      inventoryRowId: `p03dep_${assignment.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: assignment.knowledgePointId,
      canonicalNameZh: displayNameOf(knowledgePoint),
      capabilityStatement: knowledgePoint.capabilityStatement ?? null,
      reasoningInvariant: knowledgePoint.reasoningInvariant ?? null,
      sourceNodeIds: freezeArray(sourceNodeIds),
      sourceRefs: freezeArray(knowledgePoint.sourceRefs ?? []),
      assignedDeliveryWaveId: assignment.deliveryWaveId,
      baseDeliveryWaveId: assignment.baseDeliveryWaveId,
      directW3CohortMember,
      baseW3CohortMember,
      laterWaveDependent,
      intraWavePrerequisiteRank: assignment.intraWavePrerequisiteRank,
      prerequisiteWaveLowerBound: assignment.prerequisiteWaveLowerBound,
      waveEscalatedByPrerequisite: assignment.waveEscalatedByPrerequisite,
      prerequisiteEscalatedIntoW3: directW3CohortMember
        && assignment.baseDeliveryWaveId !== W3_WAVE_ID
        && assignment.waveEscalatedByPrerequisite,
      primaryRuntimeProfileId: assignment.primaryRuntimeProfileId,
      requiredRuntimeCapabilityIds: freezeArray(assignment.requiredRuntimeCapabilityIds),
      effectiveRequiredRuntimeCapabilityIds: freezeArray(assignment.effectiveRequiredRuntimeCapabilityIds),
      w3CapabilityIds: freezeArray(effectiveW3CapabilityIds),
      directlyRequiredW3CapabilityIds: freezeArray(directlyRequiredW3CapabilityIds),
      missingW3CapabilityIds: freezeArray(missingW3CapabilityIds),
      capabilityGateState: missingW3CapabilityIds.length > 0
        ? "W3_CONTRACT_CAPABILITY_BLOCKED"
        : "W3_CAPABILITY_DEPENDENCY_UNBLOCKED",
      inheritedW2DependencyPresent: Boolean(inheritedW2Row),
      inheritedW2DependencyUnblocked: inheritedW2Row ? inheritedW2Row.capabilityUnblocked === true : false,
      inheritedW2GateState: inheritedW2Row?.capabilityGateState ?? "NO_W2_DEPENDENCY",
      currentProductCoverage: Object.freeze({
        publicSourceSelectable: sourceNodeIds.some((sourceNodeId) => visibleSourceIds.has(sourceNodeId)),
        publicKnowledgePointVisible: Boolean(visibleKnowledgePoint),
        publicPatternBindingPresent: patternGroupIds.length > 0 && patternSpecIds.length > 0,
        patternGroupIds: freezeArray(patternGroupIds),
        patternSpecIds: freezeArray(patternSpecIds),
      }),
      productGapState,
      nextAdmissionActions: freezeArray([
        ...missingW3CapabilityIds.map((capabilityId) => `IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY:${capabilityId}`),
        ...productActions(productGapState),
      ]),
      directProductionAdmissionAllowed: false,
      productProductionAdmitted: false,
      productionAdmissionState: "W3_DEPENDENCY_INVENTORIED_NOT_ADMITTED",
    });
  }).sort((a, b) => (
    a.assignedDeliveryWaveId.localeCompare(b.assignedDeliveryWaveId)
    || a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.knowledgePointId.localeCompare(b.knowledgePointId)
  ));

  const directW3Rows = dependentRows.filter((row) => row.directW3CohortMember);
  const baseW3Rows = dependentRows.filter((row) => row.baseW3CohortMember);
  const laterWaveDependentRows = dependentRows.filter((row) => row.laterWaveDependent);
  const capabilitySummaries = buildCapabilitySummaries({
    capabilityPlan: w3CapabilityPlan,
    dependentRows,
    directRows: directW3Rows,
    capabilityById,
  });
  const sourceSummaries = buildSourceSummaries(dependentRows);
  const waveSummaries = buildWaveSummaries(dependentRows);
  const rowByKnowledgePointId = new Map(dependentRows.map((row) => [row.knowledgePointId, row]));

  const metrics = Object.freeze({
    contractCapabilityCount: requiredPolicyCapabilityIds.length,
    plannedContractCapabilityCount: plannedCapabilityIds.length,
    capabilityWithDependentsCount: capabilitySummaries.filter((row) => row.effectiveDependentKnowledgePointCount > 0).length,
    capabilityWithoutDependentsCount: capabilitySummaries.filter((row) => row.effectiveDependentKnowledgePointCount === 0).length,
    directW3KnowledgePointCount: directW3Rows.length,
    baseW3KnowledgePointCount: baseW3Rows.length,
    prerequisiteEscalatedIntoW3Count: directW3Rows.filter((row) => row.prerequisiteEscalatedIntoW3).length,
    w3CapabilityDependentKnowledgePointCount: dependentRows.length,
    laterWaveDependentKnowledgePointCount: laterWaveDependentRows.length,
    dependentSourceNodeCount: sourceSummaries.length,
    dependentWaveCount: waveSummaries.length,
    inheritedW2DependencyCount: dependentRows.filter((row) => row.inheritedW2DependencyPresent).length,
    inheritedW2DependencyUnblockedCount: dependentRows.filter((row) => row.inheritedW2DependencyUnblocked).length,
    publicKnowledgePointVisibleCount: dependentRows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
    publicPatternBindingPresentCount: dependentRows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
    publicSourceSelectableCount: sourceSummaries.filter((row) => row.publicSourceSelectable).length,
    existingPublicPatternAfterCapabilityCount: dependentRows.filter((row) => row.productGapState === "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY").length,
    patternBindingRequiredAfterCapabilityCount: dependentRows.filter((row) => row.productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY").length,
    publicProductVerticalSliceRequiredAfterCapabilityCount: dependentRows.filter((row) => row.productGapState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY").length,
    capabilityBlockedKnowledgePointCount: dependentRows.filter((row) => row.missingW3CapabilityIds.length > 0).length,
    capabilityUnblockedKnowledgePointCount: dependentRows.filter((row) => row.missingW3CapabilityIds.length === 0).length,
    directProductAdmissionCount: dependentRows.filter((row) => row.productProductionAdmitted).length,
    directCountsByWave: countBy(directW3Rows, (row) => row.assignedDeliveryWaveId),
    dependentCountsByWave: countBy(dependentRows, (row) => row.assignedDeliveryWaveId),
    productGapStateCounts: countBy(dependentRows, (row) => row.productGapState),
  });

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03_W3_PRODUCT_ADMISSION_INVENTORY_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    deliveryWaveAuthority: r05,
    inheritedW2SuccessorAuthority: p02g,
    requiredW3CapabilityIds: freezeArray(requiredPolicyCapabilityIds),
    plannedW3CapabilityIds: freezeArray(plannedCapabilityIds),
    directW3KnowledgePointRows: freezeArray(directW3Rows),
    baseW3KnowledgePointRows: freezeArray(baseW3Rows),
    laterWaveDependentRows: freezeArray(laterWaveDependentRows),
    dependentKnowledgePointRows: freezeArray(dependentRows),
    rows: freezeArray(dependentRows),
    capabilitySummaries: freezeArray(capabilitySummaries),
    sourceSummaries: freezeArray(sourceSummaries),
    waveSummaries: freezeArray(waveSummaries),
    metrics,
    getRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP03W3DirectKnowledgePointRows() {
  return materializeP03W3ProductAdmissionInventory().directW3KnowledgePointRows;
}

export function listP03W3CapabilityDependentRows() {
  return materializeP03W3ProductAdmissionInventory().dependentKnowledgePointRows;
}

export function getP03W3ProductAdmissionInventoryRow(knowledgePointId) {
  return materializeP03W3ProductAdmissionInventory().getRow(knowledgePointId);
}
