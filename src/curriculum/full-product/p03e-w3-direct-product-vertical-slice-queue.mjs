import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "./p03c-w3-capability-closeout-product-unblock.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const P03E_DIR = path.join(ROOT, "data/curriculum/full-product/p03e");
const P03D_MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03d/protected-d0-compatibility-revalidation.manifest.json");
const QUEUE_REGISTRY_PATH = path.join(P03E_DIR, "w3-direct-product-vertical-slice-queue.json");

export const P03E_W3_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_VERSION =
  "p03e-w3-direct-product-vertical-slice-queue-v1";

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const readP03EJson = (fileName) => readJson(path.join(P03E_DIR, fileName));
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
    requiredW3CapabilityIds: [...entry.requiredW3CapabilityIds],
  }));
}

function buildRegistrySnapshot({ programId, taskId, policy, queueEntries, metrics }) {
  const comparable = comparableQueue(queueEntries);
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
    queueDigest: sha256Json(comparable),
    orderedSliceIds: comparable.map((entry) => entry.sliceId),
    orderedImplementationTaskIds: comparable.map((entry) => entry.implementationTaskId),
    orderedKnowledgePointIds: comparable.flatMap((entry) => entry.knowledgePointIds),
    firstExecutableSlice: comparable[0] ?? null,
    lastSliceId: comparable.at(-1)?.sliceId ?? null,
  };
}

export function materializeP03EW3DirectProductVerticalSliceQueue() {
  const policy = readP03EJson("w3-direct-product-vertical-slice-queue-policy.json");
  const manifest = readP03EJson("w3-direct-product-vertical-slice-queue.manifest.json");
  const p03dManifest = readJson(P03D_MANIFEST_PATH);
  const p03c = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const historicalById = new Map(
    p03c.historicalInventory.dependentKnowledgePointRows.map((row) => [row.knowledgePointId, row]),
  );

  const directRows = p03c.downstreamUnblockRows
    .filter((row) => row.directW3CohortMember && !row.protectedExistingD0 && !row.productProductionAdmitted)
    .map((row) => {
      const historical = historicalById.get(row.knowledgePointId);
      if (!historical) throw new Error(`P03E_HISTORICAL_ROW_MISSING:${row.knowledgePointId}`);
      const supportingSourceNodeIds = [...row.sourceNodeIds].sort();
      if (supportingSourceNodeIds.length === 0) throw new Error(`P03E_SOURCE_NODE_MISSING:${row.knowledgePointId}`);
      return Object.freeze({
        ...row,
        primarySourceNodeId: supportingSourceNodeIds[0],
        supportingSourceNodeIds: freezeArray(supportingSourceNodeIds),
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
    "p03e",
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
