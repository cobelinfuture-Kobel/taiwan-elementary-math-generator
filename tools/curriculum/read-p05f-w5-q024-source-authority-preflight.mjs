import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const r02 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json"), "utf8"));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN") throw new Error(`Q024_QUEUE_STATUS:${queue.status}`);
if (queue.queueRegistryParity !== true || queue.queueFrozen !== true) throw new Error("Q024_QUEUE_NOT_FROZEN");
const q024 = queue.queueEntries.find((row) => row.queuePosition === 24);
if (!q024) throw new Error("Q024_FROZEN_ROW_MISSING");
if (q024.implementationTaskId !== "P05F_W5DirectProductVerticalSlice024Implementation") throw new Error(`Q024_TASK_ID:${q024.implementationTaskId}`);
const source = r02.sourceRecords.find((row) => row.sourceNodeId === q024.primarySourceNodeId);
if (!source) throw new Error(`Q024_R02_SOURCE_MISSING:${q024.primarySourceNodeId}`);
const candidates = q024.knowledgePointIds.map((id) => {
  const row = source.candidates.find((candidate) => candidate.knowledgePointId === id);
  if (!row) throw new Error(`Q024_R02_KP_MISSING:${id}`);
  return row;
});
const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mappings = q024.knowledgePointIds.map((id) => {
  const row = r04.getMapping(id);
  if (!row) throw new Error(`Q024_R04_MAPPING_MISSING:${id}`);
  return row;
});
const contractOnlyIds = new Set(r04.capabilities.filter((row) => row.deliveryStatus === "contract_only").map((row) => row.capabilityId));
const contractOnlyRequired = [...new Set(mappings.flatMap((row) => row.requiredRuntimeCapabilityIds.filter((id) => contractOnlyIds.has(id))))].sort();
const report = {
  schemaName: "P05FW5Q024SourceAuthorityReadbackV1",
  status: "PASS_Q024_EXACT_AUTHORITY_READBACK",
  queue: q024,
  queueRegistry: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queueFrozen: queue.queueFrozen,
    queueRegistryParity: queue.queueRegistryParity,
  },
  r02: {
    sourceNodeId: source.sourceNodeId,
    sourceTitle: source.sourceTitle,
    sourcePdfTitle: source.sourcePdfTitle,
    pageCount: source.pageCount,
    reviewedPages: source.reviewedPages,
    candidates,
    sameSourceCandidateIds: source.candidates.map((row) => row.knowledgePointId),
  },
  r04: mappings.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    mappingId: row.mappingId,
    primaryRuntimeProfileId: row.primaryRuntimeProfileId,
    classificationRuleId: row.classificationRuleId,
    appliedModifierIds: row.appliedModifierIds,
    requiredRuntimeCapabilityIds: row.requiredRuntimeCapabilityIds,
    optionalRuntimeCapabilityIds: row.optionalRuntimeCapabilityIds,
    forbiddenRuntimeCapabilityIds: row.forbiddenRuntimeCapabilityIds,
    runtimeCapabilityDeliveryState: row.runtimeCapabilityDeliveryState,
    undeliveredRequiredCapabilityIds: row.undeliveredRequiredCapabilityIds,
  })),
  contractOnlyRequiredCapabilityIds: contractOnlyRequired,
};
process.stdout.write(`P05F24_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
