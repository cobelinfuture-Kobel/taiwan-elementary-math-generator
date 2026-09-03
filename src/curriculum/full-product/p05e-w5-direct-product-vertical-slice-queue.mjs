import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR05DeliveryWaveRebase } from "../global/r05-delivery-wave-rebase.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const P05E_DIR = path.join(ROOT, "data/curriculum/full-product/p05e");
const QUEUE_REGISTRY_PATH = path.join(P05E_DIR, "w5-direct-product-vertical-slice-queue.json");

export const P05E_W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION =
  "p05e-w5-direct-product-vertical-slice-queue-v1";

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const readP05EJson = (fileName) => readJson(path.join(P05E_DIR, fileName));
const unique = (values) => [...new Set((values ?? []).filter(Boolean))];
const freezeArray = (values) => Object.freeze([...(values ?? [])]);
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
    requiredW5CapabilityIds: [...entry.requiredW5CapabilityIds],
  }));
}

function buildRegistrySnapshot({ programId, taskId, policy, queueEntries, metrics }) {
  const comparable = comparableQueue(queueEntries);
  return {
    schemaName: "P05EW5DirectProductVerticalSliceQueueRegistryV1",
    schemaVersion: 1,
    programId,
    taskId,
    status: "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN",
    queueVersion: P05E_W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
    executionMode: policy.sliceRules.executionMode,
    targetEvidenceLevelPerSlice: policy.verticalSliceD0Gate.targetEvidenceLevel,
    maxKnowledgePointsPerSlice: policy.sliceRules.maxKnowledgePointsPerSlice,
    directW5KnowledgePointCount: metrics.directW5KnowledgePointCount,
    directW5SourceNodeCount: metrics.directW5SourceNodeCount,
    directW5RuntimeProfileCount: metrics.directW5RuntimeProfileCount,
    directW5PrerequisiteRankCount: metrics.directW5PrerequisiteRankCount,
    queueSliceCount: metrics.queueSliceCount,
    queueDigest: sha256Json(comparable),
    orderedSliceIds: comparable.map((entry) => entry.sliceId),
    orderedImplementationTaskIds: comparable.map((entry) => entry.implementationTaskId),
    orderedKnowledgePointIds: comparable.flatMap((entry) => entry.knowledgePointIds),
    firstExecutableSlice: comparable[0] ?? null,
    lastSliceId: comparable.at(-1)?.sliceId ?? null,
  };
}

export function materializeP05EW5DirectProductVerticalSliceQueue() {
  const policy = readP05EJson("w5-direct-product-vertical-slice-queue-policy.json");
  const manifest = readP05EJson("w5-direct-product-vertical-slice-queue.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const w5CapabilityIds = new Set(policy.w5CapabilityIds);

  const directRows = r05.knowledgePointAssignments
    .filter((row) => row.deliveryWaveId === policy.cohortRules.assignedDeliveryWaveId)
    .map((row) => {
      const supportingSourceNodeIds = [...row.sourceNodeIds].sort();
      if (supportingSourceNodeIds.length === 0) throw new Error(`P05E_SOURCE_NODE_MISSING:${row.knowledgePointId}`);
      return Object.freeze({
        ...row,
        primarySourceNodeId: supportingSourceNodeIds[0],
        supportingSourceNodeIds: freezeArray(supportingSourceNodeIds),
        requiredW5CapabilityIds: freezeArray(
          row.contractOnlyRequiredCapabilityIds.filter((id) => w5CapabilityIds.has(id)).sort(),
        ),
      });
    })
    .sort((a, b) => (
      a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
      || a.primarySourceNodeId.localeCompare(b.primarySourceNodeId)
      || a.primaryRuntimeProfileId.localeCompare(b.primaryRuntimeProfileId)
      || a.knowledgePointId.localeCompare(b.knowledgePointId)
    ));

  if (directRows.length !== policy.cohortRules.expectedKnowledgePointCount) {
    throw new Error(`P05E_W5_KP_COUNT_MISMATCH:${directRows.length}`);
  }

  const grouped = new Map();
  for (const row of directRows) {
    const key = `${row.intraWavePrerequisiteRank}|${row.primarySourceNodeId}|${row.primaryRuntimeProfileId}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        intraWavePrerequisiteRank: row.intraWavePrerequisiteRank,
        primarySourceNodeId: row.primarySourceNodeId,
        primaryRuntimeProfileId: row.primaryRuntimeProfileId,
        rows: [],
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
    "p05e",
    `q${pad(queuePosition)}`,
    `r${slice.intraWavePrerequisiteRank}`,
    stableToken(slice.primarySourceNodeId),
    stableToken(slice.primaryRuntimeProfileId),
    `c${slice.chunkIndex}`,
  ].join("_");

  const queueEntries = provisionalSlices.map((slice, index) => {
    const queuePosition = index + 1;
    const previousSliceId = index === 0 ? null : sliceIdFor(provisionalSlices[index - 1], index);
    const knowledgePointIds = slice.rows.map((row) => row.knowledgePointId);
    return Object.freeze({
      queuePosition,
      sliceId: sliceIdFor(slice, queuePosition),
      implementationTaskId: `P05F_W5DirectProductVerticalSlice${pad(queuePosition)}Implementation`,
      previousSliceId,
      previousSliceMustBeD0Complete: previousSliceId !== null,
      assignedDeliveryWaveId: "R05-W5",
      primarySourceNodeId: slice.primarySourceNodeId,
      supportingSourceNodeIds: freezeArray(unique(slice.rows.flatMap((row) => row.supportingSourceNodeIds)).sort()),
      intraWavePrerequisiteRank: slice.intraWavePrerequisiteRank,
      primaryRuntimeProfileId: slice.primaryRuntimeProfileId,
      chunkIndex: slice.chunkIndex,
      knowledgePointCount: knowledgePointIds.length,
      knowledgePointIds: freezeArray(knowledgePointIds),
      requiredW5CapabilityIds: freezeArray(unique(slice.rows.flatMap((row) => row.requiredW5CapabilityIds)).sort()),
      targetEvidenceLevel: policy.verticalSliceD0Gate.targetEvidenceLevel,
      requiredProductNodes: freezeArray(policy.verticalSliceD0Gate.requiredNodes),
      admissionState: "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED",
      productProductionAdmitted: false,
      implementationAllowedByP05E: false,
    });
  });

  const allocatedKnowledgePointIds = queueEntries.flatMap((entry) => entry.knowledgePointIds);
  const metrics = Object.freeze({
    directW5KnowledgePointCount: directRows.length,
    directW5SourceNodeCount: new Set(directRows.map((row) => row.primarySourceNodeId)).size,
    directW5RuntimeProfileCount: new Set(directRows.map((row) => row.primaryRuntimeProfileId)).size,
    directW5PrerequisiteRankCount: new Set(directRows.map((row) => row.intraWavePrerequisiteRank)).size,
    queueSliceCount: queueEntries.length,
    allocatedKnowledgePointCount: allocatedKnowledgePointIds.length,
    uniqueAllocatedKnowledgePointCount: new Set(allocatedKnowledgePointIds).size,
    maximumSliceKnowledgePointCount: Math.max(0, ...queueEntries.map((entry) => entry.knowledgePointCount)),
    queueSlicesByPrerequisiteRank: countBy(queueEntries, (entry) => entry.intraWavePrerequisiteRank),
    directKnowledgePointsByPrerequisiteRank: countBy(directRows, (row) => row.intraWavePrerequisiteRank),
    queueSlicesByRuntimeProfile: countBy(queueEntries, (entry) => entry.primaryRuntimeProfileId),
    directKnowledgePointsByRuntimeProfile: countBy(directRows, (row) => row.primaryRuntimeProfileId),
    directKnowledgePointsByPrimarySource: countBy(directRows, (row) => row.primarySourceNodeId),
  });

  const derivedRegistrySnapshot = buildRegistrySnapshot({
    programId: manifest.programId,
    taskId: manifest.taskId,
    policy,
    queueEntries,
    metrics,
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
      ? "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN"
      : "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE",
    version: P05E_W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION,
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
    nextExecutableSlice: queueEntries[0] ?? null,
  });
}

export function buildP05EW5DirectProductVerticalSliceQueueRegistrySnapshot() {
  return materializeP05EW5DirectProductVerticalSliceQueue().derivedRegistrySnapshot;
}

export function listP05EW5DirectProductVerticalSlices() {
  return materializeP05EW5DirectProductVerticalSliceQueue().queueEntries;
}
