import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const r02 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json"), "utf8"));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN") throw new Error(`Q023_QUEUE_STATUS:${queue.status}`);
if (queue.queueRegistryParity !== true || queue.queueFrozen !== true) throw new Error("Q023_QUEUE_NOT_FROZEN");
const q023 = queue.queueEntries.find((row) => row.queuePosition === 23);
if (!q023) throw new Error("Q023_FROZEN_ROW_MISSING");
const source = r02.sourceRecords.find((row) => row.sourceNodeId === q023.primarySourceNodeId);
if (!source) throw new Error(`Q023_R02_SOURCE_MISSING:${q023.primarySourceNodeId}`);
const candidates = q023.knowledgePointIds.map((id) => {
  const row = source.candidates.find((candidate) => candidate.knowledgePointId === id);
  if (!row) throw new Error(`Q023_R02_KP_MISSING:${id}`);
  return row;
});
const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mappings = q023.knowledgePointIds.map((id) => {
  const row = r04.getMapping(id);
  if (!row) throw new Error(`Q023_R04_MAPPING_MISSING:${id}`);
  return row;
});
const contractOnlyIds = new Set(r04.capabilities.filter((row) => row.deliveryStatus === "contract_only").map((row) => row.capabilityId));
const contractOnlyRequired = [...new Set(mappings.flatMap((row) => row.requiredRuntimeCapabilityIds.filter((id) => contractOnlyIds.has(id))))].sort();
const report = {
  schemaName: "P05FW5Q023SourceAuthorityReadbackV1",
  status: "PASS_Q023_EXACT_AUTHORITY_READBACK",
  queue: q023,
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
process.stdout.write(`P05F23_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
