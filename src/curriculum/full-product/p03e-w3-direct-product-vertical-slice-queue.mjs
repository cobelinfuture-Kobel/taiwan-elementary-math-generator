import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "./p03c-w3-capability-closeout-product-unblock.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03E_DIR = path.join(ROOT, "data/curriculum/full-product/p03e");
const P03D_MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03d/protected-d0-compatibility-revalidation.manifest.json");
const QUEUE_REGISTRY_PATH = path.join(P03E_DIR, "w3-direct-product-vertical-slice-queue.json");

export const P03E_W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION =
  "p03e-w3-direct-product-vertical-slice-queue-v1";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readP03EJson(fileName) {
  return readJson(path.join(P03E_DIR, fileName));
}

function readOptionalJson(filePath) {
  return fs.existsSync(filePath) ? readJson(filePath) : null;
}

function freezeArray(values) {
  return Object.freeze([...(values ?? [])]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function stableToken(value) {
  return String(value ?? "none")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "none";
}

function pad(value, width = 3) {
  return String(value).padStart(width, "0");
}

function countBy(rows, selector) {
  const counts = new Map();
  for (const row of rows) {
    const key = selector(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.freeze(Object.fromEntries(
    [...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))),
  ));
}

function queueComparable(queueEntries) {
  return queueEntries.map((entry) => ({
    queuePosition: entry.queuePosition,
    sliceId: entry.sliceId,
    implementationTaskId: entry.implementationTaskId,
    previousSliceId: entry.previousSliceId,
    primarySourceNodeId: entry.primarySourceNodeId,
    intraWavePrerequisiteRank: entry.intraWavePrerequisiteRank,
    primaryRuntimeProfileId: entry.primaryRuntimeProfileId,
    chunkIndex: entry.chunkIndex,
    knowledgePointIds: [...entry.knowledgePointIds],
    supportingSourceNodeIds: [...entry.supportingSourceNodeIds],
    requiredW3CapabilityIds: [...entry.requiredW3CapabilityIds],
  }));
}

function buildQueueRegistrySnapshot({ programId, taskId, policy, queueEntries, metrics }) {
  return {
    schemaName: "P03EW3DirectProductVerticalSliceQueueRegistryV1",
    schemaVersion: 1,
    programId,
    taskId,
    status: "W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN",
    queueVersion: P03E_W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
    executionMode: policy.sliceRules.executionMode,
    targetEvidenceLevelPerSlice: policy.verticalSliceD0Gate.targetEvidenceLevel,
    maxKnowledgePointsPerSlice: policy.sliceRules.maxKnowledgePointsPerSlice,
    directW3KnowledgePointCount: metrics.directW3KnowledgePointCount,
    directW3SourceNodeCount: metrics.directW3SourceNodeCount,
    directW3RuntimeProfileCount: metrics.directW3RuntimeProfileCount,
    directW3PrerequisiteRankCount: metrics.directW3PrerequisiteRankCount,
    queueSliceCount: metrics.queueSliceCount,
    queueEntries: queueComparable(queueEntries),
  };
}

export function materializeP03EW3DirectProductVerticalSliceQueue() {
  const policy = readP03EJson("w3-direct-product-vertical-slice-queue-policy.json");
  const manifest = readP03EJson("w3-direct-product-vertical-slice-queue.manifest.json");
  const p03dManifest = readJson(P03D_MANIFEST_PATH);
  const p03c = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const historicalRows = p03c.historicalInventory.dependentKnowledgePointRows;
  const historicalById = new Map(historicalRows.map((row) => [row.knowledgePointId, row]));

  const directRows = p03c.downstreamUnblockRows
    .filter((row) => row.directW3CohortMember)
    .filter((row) => !row.protectedExistingD0)
    .filter((row) => !row.productProductionAdmitted)
    .map((row) => {
      const historical = historicalById.get(row.knowledgePointId);
      if (!historical) throw new Error(`P03E_HISTORICAL_ROW_MISSING:${row.knowledgePointId}`);
      const sortedSourceNodeIds = [...row.sourceNodeIds].sort();
      if (sortedSourceNodeIds.length === 0) throw new Error(`P03E_SOURCE_NODE_MISSING:${row.knowledgePointId}`);
      return Object.freeze({
        ...row,
        primarySourceNodeId: sortedSourceNodeIds[0],
        supportingSourceNodeIds: freezeArray(sortedSourceNodeIds),
        intraWavePrerequisiteRank: historical.intraWavePrerequisiteRank,
        primaryRuntimeProfileId: historical.primaryRuntimeProfileId,
      });
    })
    .sort((a, b) => (
      a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
      || a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)
      || a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)
      || a.knowledgePointId.localeCompare(b.knowledgePointId)
    ));

  const groupMap = new Map();
  for (const row of directRows) {
    const key = [
      row.intraWavePrerequisiteRank,
      row.primarySourceNodeId,
      row.primaryRuntimeProfileId,
    ].join("|");
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        intraWavePrerequisiteRank: row.intraWavePrerequisiteRank,
        primarySourceNodeId: row.primarySourceNodeId,
        primaryRuntimeProfileId: row.primaryRuntimeProfileId,
        rows: [],
      });
    }
    groupMap.get(key).rows.push(row);
  }

  const maxPerSlice = policy.sliceRules.maxKnowledgePointsPerSlice;
  const provisionalSlices = [];
  const orderedGroups = [...groupMap.values()].sort((a, b) => (
    a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)
    || a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)
  ));

  for (const group of orderedGroups) {
    const sortedRows = [...group.rows].sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
    for (let offset = 0, chunkIndex = 1; offset < sortedRows.length; offset += maxPerSlice, chunkIndex += 1) {
      const rows = sortedRows.slice(offset, offset + maxPerSlice);
      provisionalSlices.push({
        intraWavePrerequisiteRank: group.intraWavePrerequisiteRank,
        primarySourceNodeId: group.primarySourceNodeId,
        primaryRuntimeProfileId: group.primaryRuntimeProfileId,
        chunkIndex,
        rows,
      });
    }
  }

  const queueEntries = provisionalSlices.map((slice, index) => {
    const queuePosition = index + 1;
    const previous = queuePosition > 1 ? provisionalSlices[index - 1] : null;
    const sliceId = [
      "p03e",
      `q${pad(queuePosition)}`,
      `r${slice.intraWavePrerequisiteRank}`,
      stableToken(slice.primarySourceNodeId),
      stableToken(slice.primaryRuntimeProfileId),
      `c${slice.chunkIndex}`,
    ].join("_");
    const previousSliceId = previous
      ? [
          "p03e",
          `q${pad(queuePosition - 1)}`,
          `r${previous.intraWavePrerequisiteRank}`,
          stableToken(previous.primarySourceNodeId),
          stableToken(previous.primaryRuntimeProfileId),
          `c${previous.chunkIndex}`,
        ].join("_")
      : null;
    const knowledgePointIds = slice.rows.map((row) => row.knowledgePointId);
    return Object.freeze({
      queuePosition,
      sliceId,
      implementationTaskId: `P03F_W3DirectProductVerticalSlice${pad(queuePosition)}Implementation`,
      previousSliceId,
      previousSliceMustBeD0Complete: previousSliceId !== null,
      assignedDeliveryWaveId: "R05-W3",
      primarySourceNodeId: slice.primarySourceNodeId,
      supportingSourceNodeIds: freezeArray(unique(slice.rows.flatMap((row) => row.supportingSourceNodeIds)).sort()),
      intraWavePrerequisiteRank: slice.intraWavePrerequisiteRank,
      primaryRuntimeProfileId: slice.primaryRuntimeProfileId,
      chunkIndex: slice.chunkIndex,
      knowledgePointCount: knowledgePointIds.length,
      knowledgePointIds: freezeArray(knowledgePointIds),
      requiredW3CapabilityIds: freezeArray(unique(slice.rows.flatMap((row) => row.requiredW3CapabilityIds)).sort()),
      targetEvidenceLevel: policy.verticalSliceD0Gate.targetEvidenceLevel,
      requiredProductNodes: freezeArray(policy.verticalSliceD0Gate.requiredNodes),
      admissionState: "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED",
      productProductionAdmitted: false,
      implementationAllowedByP03E: false,
    });
  });

  const protectedRows = p03c.downstreamUnblockRows.filter((row) => row.protectedExistingD0);
  const laterWaveRows = p03c.downstreamUnblockRows.filter((row) => row.laterWaveDependent && !row.protectedExistingD0);
  const newProductRows = p03c.downstreamUnblockRows.filter((row) => !row.protectedExistingD0);
  const allocatedKnowledgePointIds = queueEntries.flatMap((entry) => entry.knowledgePointIds);

  const metrics = Object.freeze({
    directW3KnowledgePointCount: directRows.length,
    directW3SourceNodeCount: new Set(directRows.map((row) => row.primarySourceNodeId)).size,
    directW3RuntimeProfileCount: new Set(directRows.map((row) => row.primaryRuntimeProfileId)).size,
    directW3PrerequisiteRankCount: new Set(directRows.map((row) => row.intraWavePrerequisiteRank)).size,
    queueSliceCount: queueEntries.length,
    allocatedKnowledgePointCount: allocatedKnowledgePointIds.length,
    uniqueAllocatedKnowledgePointCount: new Set(allocatedKnowledgePointIds).size,
    protectedD0ExcludedCount: protectedRows.length,
    laterWaveDependentExcludedCount: laterWaveRows.length,
    unaffectedNewProductRowCount: newProductRows.length,
    newProductAdmissionCount: p03c.metrics.newProductAdmissionCount,
    maximumSliceKnowledgePointCount: Math.max(0, ...queueEntries.map((entry) => entry.knowledgePointCount)),
    queueSlicesByPrerequisiteRank: countBy(queueEntries, (entry) => entry.intraWavePrerequisiteRank),
    directKnowledgePointsByPrerequisiteRank: countBy(directRows, (row) => row.intraWavePrerequisiteRank),
    queueSlicesByRuntimeProfile: countBy(queueEntries, (entry) => entry.primaryRuntimeProfileId),
    directKnowledgePointsByRuntimeProfile: countBy(directRows, (row) => row.primaryRuntimeProfileId),
    directKnowledgePointsByPrimarySource: countBy(directRows, (row) => row.primarySourceNodeId),
  });

  const derivedRegistrySnapshot = buildQueueRegistrySnapshot({
    programId: manifest.programId,
    taskId: manifest.taskId,
    policy,
    queueEntries,
    metrics,
  });
  const queueRegistry = readOptionalJson(QUEUE_REGISTRY_PATH);
  const queueRegistryPresent = Boolean(queueRegistry);
  const queueRegistryParity = queueRegistryPresent
    ? JSON.stringify(queueRegistry) === JSON.stringify(derivedRegistrySnapshot)
    : false;

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: queueRegistryPresent && queueRegistryParity
      ? "W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"
      : "W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE",
    version: P03E_W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    predecessorP03C: p03c,
    predecessorP03DManifest: Object.freeze(p03dManifest),
    directRows: freezeArray(directRows),
    protectedExcludedRows: freezeArray(protectedRows),
    laterWaveExcludedRows: freezeArray(laterWaveRows),
    queueEntries: freezeArray(queueEntries),
    rows: freezeArray(queueEntries),
    queueRegistry: queueRegistry ? Object.freeze(queueRegistry) : null,
    derivedRegistrySnapshot: Object.freeze(derivedRegistrySnapshot),
    queueRegistryPresent,
    queueRegistryParity,
    queueFrozen: queueRegistryPresent && queueRegistryParity,
    metrics,
    nextExecutableSlice: queueEntries[0] ?? null,
  });
}

export function buildP03EW3DirectProductVerticalSliceQueueRegistrySnapshot() {
  return materializeP03EW3DirectProductVerticalSliceQueue().derivedRegistrySnapshot;
}

export function listP03EW3DirectProductVerticalSlices() {
  return materializeP03EW3DirectProductVerticalSliceQueue().queueEntries;
}
