import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const preflight = readJson("data/curriculum/full-product/p05f/q027-g4b-u10-layered-cube-volume-conservation-source-authority-preflight.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();

if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN" || queue.queueRegistryParity !== true || queue.queueFrozen !== true) {
  throw new Error("Q027_QUEUE_NOT_FROZEN");
}

const q027 = queue.queueEntries.find((row) => row.queuePosition === 27);
if (!q027) throw new Error("Q027_FROZEN_ROW_MISSING");
if (q027.implementationTaskId !== "P05F_W5DirectProductVerticalSlice027Implementation") throw new Error(`Q027_TASK_ID:${q027.implementationTaskId}`);
if (q027.previousSliceId !== "p05e_q026_r2_g4b_u07_4b07_profile_geometry_formula_c1") throw new Error(`Q027_PREVIOUS_SLICE:${q027.previousSliceId}`);

const source = r02.sourceRecords.find((row) => row.sourceNodeId === q027.primarySourceNodeId);
if (!source) throw new Error(`Q027_R02_SOURCE_MISSING:${q027.primarySourceNodeId}`);
const candidates = q027.knowledgePointIds.map((id) => {
  const row = source.candidates.find((candidate) => candidate.knowledgePointId === id);
  if (!row) throw new Error(`Q027_R02_KP_MISSING:${id}`);
  return row;
});

const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mappings = q027.knowledgePointIds.map((id) => {
  const row = r04.getMapping(id);
  if (!row) throw new Error(`Q027_R04_MAPPING_MISSING:${id}`);
  return row;
});
if (mappings.some((row) => row.primaryRuntimeProfileId !== q027.primaryRuntimeProfileId)) throw new Error("Q027_R04_PROFILE_MISMATCH");

const contractOnlyIds = new Set(r04.capabilities.filter((row) => row.deliveryStatus === "contract_only").map((row) => row.capabilityId));
const contractOnlyRequired = [...new Set(mappings.flatMap((row) => row.requiredRuntimeCapabilityIds.filter((id) => contractOnlyIds.has(id))))].sort();

const report = {
  schemaName: "P05FW5Q027SourceAuthorityReadbackV1",
  status: "PASS_Q027_EXACT_AUTHORITY_READBACK",
  queue: q027,
  queueRegistry: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queueFrozen: queue.queueFrozen,
    queueRegistryParity: queue.queueRegistryParity,
  },
  preflightQueueParity: {
    sliceId: preflight.queueAuthority.sliceId === q027.sliceId,
    knowledgePointIds: JSON.stringify(preflight.queueAuthority.knowledgePointIds) === JSON.stringify(q027.knowledgePointIds),
    requiredW5CapabilityIds: JSON.stringify([...preflight.queueAuthority.requiredW5CapabilityIds].sort()) === JSON.stringify([...q027.requiredW5CapabilityIds].sort()),
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

process.stdout.write(`P05F27_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
