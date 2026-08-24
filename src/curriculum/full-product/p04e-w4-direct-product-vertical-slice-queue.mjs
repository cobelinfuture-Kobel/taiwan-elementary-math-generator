import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR05DeliveryWaveRebase } from "../global/r05-delivery-wave-rebase.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const P04E_DIR = path.join(ROOT, "data/curriculum/full-product/p04e");
const QUEUE_REGISTRY_PATH = path.join(P04E_DIR, "w4-direct-product-vertical-slice-queue.json");

export const P04E_W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION =
  "p04e-w4-direct-product-vertical-slice-queue-v1";

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const readP04EJson = (fileName) => readJson(path.join(P04E_DIR, fileName));
const freezeArray = (values) => Object.freeze([...(values ?? [])]);
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const pad = (value, width = 3) => String(value).padStart(width, "0");
const stableToken = (value) => String(value ?? "none")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "") || "none";
const sha256Json = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

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

function comparableQueue(queueEntries) {
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
    requiredW4CapabilityIds: [...entry.requiredW4CapabilityIds]
  }));
}

function buildRegistrySnapshot({ programId, taskId, policy, queueEntries, metrics }) {
  const comparable = comparableQueue(queueEntries);
  return {
    schemaName: "P04EW4DirectProductVerticalSliceQueueRegistryV1",
    schemaVersion: 1,
    programId,
    taskId,
    status: "W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN",
    queueVersion: P04E_W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
    executionMode: policy.sliceRules.executionMode,
    targetEvidenceLevelPerSlice: policy.verticalSliceD0Gate.targetEvidenceLevel,
    maxKnowledgePointsPerSlice: policy.sliceRules.maxKnowledgePointsPerSlice,
    directW4KnowledgePointCount: metrics.directW4KnowledgePointCount,
    directW4SourceNodeCount: metrics.directW4SourceNodeCount,
    directW4RuntimeProfileCount: metrics.directW4RuntimeProfileCount,
    directW4PrerequisiteRankCount: metrics.directW4PrerequisiteRankCount,
    queueSliceCount: metrics.queueSliceCount,
    queueDigest: sha256Json(comparable),
    orderedSliceIds: comparable.map((entry) => entry.sliceId),
    orderedImplementationTaskIds: comparable.map((entry) => entry.implementationTaskId),
    orderedKnowledgePointIds: comparable.flatMap((entry) => entry.knowledgePointIds),
    firstExecutableSlice: comparable[0] ?? null,
    lastSliceId: comparable.at(-1)?.sliceId ?? null
  };
}

export function materializeP04EW4DirectProductVerticalSliceQueue() {
  const policy = readP04EJson("w4-direct-product-vertical-slice-queue-policy.json");
  const manifest = readP04EJson("w4-direct-product-vertical-slice-queue.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const w4CapabilityIds = new Set(policy.w4CapabilityIds);

  const directRows = r05.knowledgePointAssignments
    .filter((row) => row.deliveryWaveId === policy.cohortRules.assignedDeliveryWaveId)
    .map((row) => {
      const supportingSourceNodeIds = [...row.sourceNodeIds].sort();
      if (supportingSourceNodeIds.length === 0) throw new Error(`P04E_SOURCE_NODE_MISSING:${row.knowledgePointId}`);
      return Object.freeze({
        ...row,
        primarySourceNodeId: supportingSourceNodeIds[0],
        supportingSourceNodeIds: freezeArray(supportingSourceNodeIds),
        requiredW4CapabilityIds: freezeArray(
          row.contractOnlyRequiredCapabilityIds.filter((id) => w4CapabilityIds.has(id)).sort()
        )
      });
    })
    .sort((a, b) => (
      a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
      || a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)
      || a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)
      || a.knowledgePointId.localeCompare(b.knowledgePointId)
    ));

  const grouped = new Map();
  for (const row of directRows) {
    const key = `${row.intraWavePrerequisiteRank}|${row.primarySourceNodeId}|${row.primaryRuntimeProfileId}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        intraWavePrerequisiteRank: row.intraWavePrerequisiteRank,
        primarySourceNodeId: row.primarySourceNodeId,
        primaryRuntimeProfileId: row.primaryRuntimeProfileId,
        rows: []
      });
    }
    grouped.get(key).rows.push(row);
  }

  const orderedGroups = [...grouped.values()].sort((a, b) => (
    a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)
    || a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)
  ));
  const provisionalSlices = [];
  const maxPerSlice = policy.sliceRules.maxKnowledgePointsPerSlice;
  for (const group of orderedGroups) {
    const rows = [...group.rows].sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
    for (let offset = 0, chunkIndex = 1; offset < rows.length; offset += maxPerSlice, chunkIndex += 1) {
      provisionalSlices.push({ ...group, rows: rows.slice(offset, offset + maxPerSlice), chunkIndex });
    }
  }

  const sliceIdFor = (slice, queuePosition) => [
    "p04e",
    `q${pad(queuePosition)}`,
    `r${slice.intraWavePrerequisiteRank}`,
    stableToken(slice.primarySourceNodeId),
    stableToken(slice.primaryRuntimeProfileId),
    `c${slice.chunkIndex}`
  ].join("_");

  const queueEntries = provisionalSlices.map((slice, index) => {
    const queuePosition = index + 1;
    const previousSliceId = index === 0 ? null : sliceIdFor(provisionalSlices[index - 1], index);
    const knowledgePointIds = slice.rows.map((row) => row.knowledgePointId);
    return Object.freeze({
      queuePosition,
      sliceId: sliceIdFor(slice, queuePosition),
      implementationTaskId: `P04F_W4DirectProductVerticalSlice${pad(queuePosition)}Implementation`,
      previousSliceId,
      previousSliceMustBeD0Complete: previousSliceId !== null,
      assignedDeliveryWaveId: "R05-W4",
      primarySourceNodeId: slice.primarySourceNodeId,
      supportingSourceNodeIds: freezeArray(unique(slice.rows.flatMap((row) => row.supportingSourceNodeIds)).sort()),
      intraWavePrerequisiteRank: slice.intraWavePrerequisiteRank,
      primaryRuntimeProfileId: slice.primaryRuntimeProfileId,
      chunkIndex: slice.chunkIndex,
      knowledgePointCount: knowledgePointIds.length,
      knowledgePointIds: freezeArray(knowledgePointIds),
      requiredW4CapabilityIds: freezeArray(unique(slice.rows.flatMap((row) => row.requiredW4CapabilityIds)).sort()),
      targetEvidenceLevel: policy.verticalSliceD0Gate.targetEvidenceLevel,
      requiredProductNodes: freezeArray(policy.verticalSliceD0Gate.requiredNodes),
      admissionState: "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED",
      productProductionAdmitted: false,
      implementationAllowedByP04E: false
    });
  });

  const allocatedKnowledgePointIds = queueEntries.flatMap((entry) => entry.knowledgePointIds);
  const metrics = Object.freeze({
    directW4KnowledgePointCount: directRows.length,
    directW4SourceNodeCount: new Set(directRows.map((row) => row.primarySourceNodeId)).size,
    directW4RuntimeProfileCount: new Set(directRows.map((row) => row.primaryRuntimeProfileId)).size,
    directW4PrerequisiteRankCount: new Set(directRows.map((row) => row.intraWavePrerequisiteRank)).size,
    queueSliceCount: queueEntries.length,
    allocatedKnowledgePointCount: allocatedKnowledgePointIds.length,
    uniqueAllocatedKnowledgePointCount: new Set(allocatedKnowledgePointIds).size,
    maximumSliceKnowledgePointCount: Math.max(0, ...queueEntries.map((entry) => entry.knowledgePointCount)),
    queueSlicesByPrerequisiteRank: countBy(queueEntries, (entry) => entry.intraWavePrerequisiteRank),
    directKnowledgePointsByPrerequisiteRank: countBy(directRows, (row) => row.intraWavePrerequisiteRank),
    queueSlicesByRuntimeProfile: countBy(queueEntries, (entry) => entry.primaryRuntimeProfileId),
    directKnowledgePointsByRuntimeProfile: countBy(directRows, (row) => row.primaryRuntimeProfileId),
    directKnowledgePointsByPrimarySource: countBy(directRows, (row) => row.primarySourceNodeId)
  });

  const derivedRegistrySnapshot = buildRegistrySnapshot({
    programId: manifest.programId,
    taskId: manifest.taskId,
    policy,
    queueEntries,
    metrics
  });
  const queueRegistry = fs.existsSync(QUEUE_REGISTRY_PATH) ? readJson(QUEUE_REGISTRY_PATH) : null;
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
      ? "W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"
      : "W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE",
    version: P04E_W4_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    predecessorR05: r05,
    directRows: freezeArray(directRows),
    queueEntries: freezeArray(queueEntries),
    rows: freezeArray(queueEntries),
    queueRegistry: queueRegistry ? Object.freeze(queueRegistry) : null,
    derivedRegistrySnapshot: Object.freeze(derivedRegistrySnapshot),
    queueRegistryPresent,
    queueRegistryParity,
    queueFrozen: queueRegistryPresent && queueRegistryParity,
    metrics,
    nextExecutableSlice: queueEntries[0] ?? null
  });
}

export function buildP04EW4DirectProductVerticalSliceQueueRegistrySnapshot() {
  return materializeP04EW4DirectProductVerticalSliceQueue().derivedRegistrySnapshot;
}

export function listP04EW4DirectProductVerticalSlices() {
  return materializeP04EW4DirectProductVerticalSliceQueue().queueEntries;
}
