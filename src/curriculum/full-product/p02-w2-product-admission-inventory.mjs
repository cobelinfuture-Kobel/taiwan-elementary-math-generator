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
const W2_WAVE_ID = "R05-W2";

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

function capabilitySequenceRank(capabilityId, capabilityById, w2CapabilityIds, memo = new Map(), visiting = new Set()) {
  if (memo.has(capabilityId)) return memo.get(capabilityId);
  if (visiting.has(capabilityId)) throw new Error(`P02_CAPABILITY_DEPENDENCY_CYCLE:${capabilityId}`);
  visiting.add(capabilityId);
  const dependencyRanks = (capabilityById.get(capabilityId)?.dependsOnCapabilityIds ?? [])
    .filter((dependencyId) => w2CapabilityIds.has(dependencyId))
    .map((dependencyId) => capabilitySequenceRank(
      dependencyId,
      capabilityById,
      w2CapabilityIds,
      memo,
      visiting,
    ));
  visiting.delete(capabilityId);
  const rank = dependencyRanks.length > 0 ? Math.max(...dependencyRanks) + 1 : 0;
  memo.set(capabilityId, rank);
  return rank;
}

function buildDependentKnowledgePointRows({
  assignments,
  w2CapabilityIds,
  knowledgePointById,
  mappingById,
  capabilityById,
  visibleKnowledgePointById,
  visibleSourceIds,
}) {
  return assignments
    .filter((assignment) => assignment.effectiveRequiredRuntimeCapabilityIds.some((id) => w2CapabilityIds.has(id)))
    .map((assignment) => {
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
      const w2FoundationCapabilityIds = assignment.effectiveRequiredRuntimeCapabilityIds
        .filter((id) => w2CapabilityIds.has(id))
        .sort();
      const directlyRequiredW2CapabilityIds = assignment.requiredRuntimeCapabilityIds
        .filter((id) => w2CapabilityIds.has(id))
        .sort();
      const runtimeEvidencePaths = unique(w2FoundationCapabilityIds.flatMap((capabilityId) => (
        capabilityById.get(capabilityId)?.runtimeEvidencePaths ?? []
      ))).sort();
      const productGapState = classifyProductGap({
        visibleKnowledgePoint: Boolean(visibleKnowledgePoint),
        patternGroupIds,
        patternSpecIds,
      });
      const nextAdmissionActions = [
        ...w2FoundationCapabilityIds.map((capabilityId) => `HARDEN_AND_ADMIT_SHARED_CAPABILITY:${capabilityId}`),
        ...productAdmissionActions(productGapState),
      ];

      return Object.freeze({
        inventoryRowId: `p02dep_${assignment.knowledgePointId.replace(/^kp_/, "")}`,
        knowledgePointId: assignment.knowledgePointId,
        canonicalNameZh: displayNameOf(knowledgePoint),
        capabilityStatement: knowledgePoint.capabilityStatement ?? null,
        reasoningInvariant: knowledgePoint.reasoningInvariant ?? null,
        sourceNodeIds: freezeArray(sourceNodeIds),
        sourceRefs: freezeArray(knowledgePoint.sourceRefs ?? []),
        assignedDeliveryWaveId: assignment.deliveryWaveId,
        baseDeliveryWaveId: assignment.baseDeliveryWaveId,
        intraWavePrerequisiteRank: assignment.intraWavePrerequisiteRank,
        prerequisiteWaveLowerBound: assignment.prerequisiteWaveLowerBound,
        waveEscalatedByPrerequisite: assignment.waveEscalatedByPrerequisite,
        primaryRuntimeProfileId: assignment.primaryRuntimeProfileId,
        requiredRuntimeCapabilityIds: freezeArray(assignment.requiredRuntimeCapabilityIds),
        effectiveRequiredRuntimeCapabilityIds: freezeArray(assignment.effectiveRequiredRuntimeCapabilityIds),
        w2FoundationCapabilityIds: freezeArray(w2FoundationCapabilityIds),
        directlyRequiredW2CapabilityIds: freezeArray(directlyRequiredW2CapabilityIds),
        productionAdmittedRequiredCapabilityIds: freezeArray(assignment.productionAdmittedRequiredCapabilityIds),
        shadowRequiredCapabilityIds: freezeArray(assignment.shadowRequiredCapabilityIds),
        contractOnlyRequiredCapabilityIds: freezeArray(assignment.contractOnlyRequiredCapabilityIds),
        capabilityProof: Object.freeze({
          w2FoundationCapabilityBlocked: true,
          runtimeEvidencePaths: freezeArray(runtimeEvidencePaths),
        }),
        currentProductCoverage: Object.freeze({
          publicSourceSelectable: sourceNodeIds.some((sourceNodeId) => visibleSourceIds.has(sourceNodeId)),
          publicKnowledgePointVisible: Boolean(visibleKnowledgePoint),
          publicPatternBindingPresent: patternGroupIds.length > 0 && patternSpecIds.length > 0,
          patternGroupIds: freezeArray(patternGroupIds),
          patternSpecIds: freezeArray(patternSpecIds),
        }),
        productGapState,
        nextAdmissionActions: freezeArray(nextAdmissionActions),
        directProductionAdmissionAllowed: false,
        productionAdmissionState: "DEPENDENCY_INVENTORIED_NOT_ADMITTED",
      });
    })
    .sort((a, b) => (
      a.assignedDeliveryWaveId.localeCompare(b.assignedDeliveryWaveId)
      || a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
      || a.knowledgePointId.localeCompare(b.knowledgePointId)
    ));
}

function buildCapabilitySummaries({ capabilityPlan, dependentRows, capabilityById }) {
  const w2CapabilityIds = new Set(capabilityPlan.map((row) => row.capabilityId));
  const rankMemo = new Map();
  return capabilityPlan.map((plan) => {
    const capability = capabilityById.get(plan.capabilityId);
    const effectiveRows = dependentRows.filter((row) => row.w2FoundationCapabilityIds.includes(plan.capabilityId));
    const directRows = dependentRows.filter((row) => row.directlyRequiredW2CapabilityIds.includes(plan.capabilityId));
    const dependentCountsByWave = Object.freeze(Object.fromEntries(
      unique(effectiveRows.map((row) => row.assignedDeliveryWaveId)).sort().map((waveId) => [
        waveId,
        effectiveRows.filter((row) => row.assignedDeliveryWaveId === waveId).length,
      ]),
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
      effectiveDependentKnowledgePointCount: effectiveRows.length,
      directlyRequiredDependentKnowledgePointCount: directRows.length,
      dependentKnowledgePointIds: freezeArray(effectiveRows.map((row) => row.knowledgePointId).sort()),
      dependentSourceNodeIds: freezeArray(unique(effectiveRows.flatMap((row) => row.sourceNodeIds)).sort()),
      dependentCountsByWave,
      runtimeEvidencePaths: freezeArray(capability?.runtimeEvidencePaths ?? []),
      nextAction: "HARDEN_AND_ADMIT_SHARED_CAPABILITY",
      directProductionAdmissionAllowed: false,
      productionAdmissionState: "CAPABILITY_INVENTORIED_NOT_ADMITTED",
    });
  }).sort((a, b) => (
    a.foundationSequenceRank - b.foundationSequenceRank
    || b.effectiveDependentKnowledgePointCount - a.effectiveDependentKnowledgePointCount
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
    dependentKnowledgePointIds: freezeArray(sourceRows.map((row) => row.knowledgePointId).sort()),
    w2FoundationCapabilityIds: freezeArray(unique(sourceRows.flatMap((row) => row.w2FoundationCapabilityIds)).sort()),
    deliveryWaveIds: freezeArray(unique(sourceRows.map((row) => row.assignedDeliveryWaveId)).sort()),
    publicSourceSelectable: sourceRows.some((row) => row.currentProductCoverage.publicSourceSelectable),
    publicKnowledgePointVisibleCount: sourceRows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
    publicPatternBindingPresentCount: sourceRows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
  })).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId));
}

function buildWaveSummaries(rows) {
  const waveIds = unique(rows.map((row) => row.assignedDeliveryWaveId)).sort();
  return waveIds.map((waveId) => {
    const waveRows = rows.filter((row) => row.assignedDeliveryWaveId === waveId);
    return Object.freeze({
      deliveryWaveId: waveId,
      dependentKnowledgePointCount: waveRows.length,
      dependentSourceNodeCount: new Set(waveRows.flatMap((row) => row.sourceNodeIds)).size,
      w2FoundationCapabilityIds: freezeArray(unique(waveRows.flatMap((row) => row.w2FoundationCapabilityIds)).sort()),
      publicKnowledgePointVisibleCount: waveRows.filter((row) => row.currentProductCoverage.publicKnowledgePointVisible).length,
      publicPatternBindingPresentCount: waveRows.filter((row) => row.currentProductCoverage.publicPatternBindingPresent).length,
    });
  });
}

function buildMetrics({ directW2Rows, dependentRows, sourceSummaries, capabilitySummaries, waveSummaries }) {
  const productGapCount = (state) => dependentRows.filter((row) => row.productGapState === state).length;
  return Object.freeze({
    directW2KnowledgePointCount: directW2Rows.length,
    dependentKnowledgePointCount: dependentRows.length,
    dependentSourceNodeCount: sourceSummaries.length,
    dependentWaveCount: waveSummaries.length,
    shadowFoundationCapabilityCount: capabilitySummaries.length,
    capabilityWithKnowledgePointDependentsCount: capabilitySummaries.filter((row) => (
      row.effectiveDependentKnowledgePointCount > 0
    )).length,
    capabilityWithoutKnowledgePointDependentsCount: capabilitySummaries.filter((row) => (
      row.effectiveDependentKnowledgePointCount === 0
    )).length,
    publicKnowledgePointVisibleCount: dependentRows.filter((row) => (
      row.currentProductCoverage.publicKnowledgePointVisible
    )).length,
    publicPatternBindingPresentCount: dependentRows.filter((row) => (
      row.currentProductCoverage.publicPatternBindingPresent
    )).length,
    publicSourceSelectableCount: sourceSummaries.filter((row) => row.publicSourceSelectable).length,
    admissionReadyExistingPublicPatternAfterCapabilityCount: productGapCount(
      "ADMISSION_READY_EXISTING_PUBLIC_PATTERN_AFTER_CAPABILITY",
    ),
    patternGroupOrSpecBindingRequiredAfterCapabilityCount: productGapCount(
      "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_CAPABILITY",
    ),
    publicProductVerticalSliceRequiredAfterCapabilityCount: productGapCount(
      "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_CAPABILITY",
    ),
    directProductionAdmissionCount: dependentRows.filter((row) => row.directProductionAdmissionAllowed).length
      + capabilitySummaries.filter((row) => row.directProductionAdmissionAllowed).length,
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
  const directW2KnowledgePointRows = r05.knowledgePointAssignments.filter((row) => row.deliveryWaveId === W2_WAVE_ID);
  const w2CapabilityPlan = r05.capabilityDeliveryPlan.filter((row) => row.deliveryWaveId === W2_WAVE_ID);
  const w2CapabilityIds = new Set(w2CapabilityPlan.map((row) => row.capabilityId));

  const dependentKnowledgePointRows = buildDependentKnowledgePointRows({
    assignments: r05.knowledgePointAssignments,
    w2CapabilityIds,
    knowledgePointById,
    mappingById,
    capabilityById,
    visibleKnowledgePointById,
    visibleSourceIds,
  });
  const capabilitySummaries = buildCapabilitySummaries({
    capabilityPlan: w2CapabilityPlan,
    dependentRows: dependentKnowledgePointRows,
    capabilityById,
  });
  const sourceSummaries = buildSourceSummaries(dependentKnowledgePointRows);
  const waveSummaries = buildWaveSummaries(dependentKnowledgePointRows);
  const metrics = buildMetrics({
    directW2Rows: directW2KnowledgePointRows,
    dependentRows: dependentKnowledgePointRows,
    sourceSummaries,
    capabilitySummaries,
    waveSummaries,
  });
  const rowByKnowledgePointId = new Map(
    dependentKnowledgePointRows.map((row) => [row.knowledgePointId, row]),
  );

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    directW2KnowledgePointRows: freezeArray(directW2KnowledgePointRows),
    dependentKnowledgePointRows: freezeArray(dependentKnowledgePointRows),
    rows: freezeArray(dependentKnowledgePointRows),
    capabilitySummaries: freezeArray(capabilitySummaries),
    sourceSummaries: freezeArray(sourceSummaries),
    waveSummaries: freezeArray(waveSummaries),
    metrics,
    deliveryWaveAuthority: r05,
    getDependentRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP02W2DependentKnowledgePointRows() {
  return materializeP02W2ProductAdmissionInventory().dependentKnowledgePointRows;
}

export function getP02W2DependentKnowledgePointRow(knowledgePointId) {
  return materializeP02W2ProductAdmissionInventory().getDependentRow(knowledgePointId);
}
