import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-04.json");
const preflight = readJson("data/curriculum/full-product/p05f/q030-g5b-u03-capacity-volume-equivalence-source-authority-preflight.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();

if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN" || queue.queueRegistryParity !== true || queue.queueFrozen !== true) {
  throw new Error("Q030_QUEUE_NOT_FROZEN");
}

const q030 = queue.queueEntries.find((row) => row.queuePosition === 30);
if (!q030) throw new Error("Q030_FROZEN_ROW_MISSING");
if (q030.implementationTaskId !== "P05F_W5DirectProductVerticalSlice030Implementation") throw new Error(`Q030_TASK_ID:${q030.implementationTaskId}`);
if (q030.previousSliceId !== "p05e_q029_r2_g5a_u10_5a10a1_profile_spatial_solid_c1") throw new Error(`Q030_PREVIOUS_SLICE:${q030.previousSliceId}`);

const source = r02.sourceRecords.find((row) => row.sourceNodeId === q030.primarySourceNodeId);
if (!source) throw new Error(`Q030_R02_SOURCE_MISSING:${q030.primarySourceNodeId}`);
const candidates = q030.knowledgePointIds.map((id) => {
  const row = source.candidates.find((candidate) => candidate.knowledgePointId === id);
  if (!row) throw new Error(`Q030_R02_KP_MISSING:${id}`);
  return row;
});

const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mappings = q030.knowledgePointIds.map((id) => {
  const row = r04.getMapping(id);
  if (!row) throw new Error(`Q030_R04_MAPPING_MISSING:${id}`);
  return row;
});
if (mappings.some((row) => row.primaryRuntimeProfileId !== q030.primaryRuntimeProfileId)) throw new Error("Q030_R04_PROFILE_MISMATCH");
if (mappings.some((row) => row.classificationRuleId !== "rule_geometry_formula")) throw new Error("Q030_R04_CLASSIFICATION_RULE_MISMATCH");
if (mappings.some((row) => row.appliedModifierIds.length !== 0)) throw new Error("Q030_UNEXPECTED_R04_MODIFIER");

const report = {
  schemaName: "P05FW5Q030SourceAuthorityReadbackV1",
  status: "PASS_Q030_EXACT_AUTHORITY_READBACK",
  queue: q030,
  queueRegistry: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queueFrozen: queue.queueFrozen,
    queueRegistryParity: queue.queueRegistryParity,
  },
  preflightQueueParity: {
    sliceId: preflight.queueAuthority.sliceId === q030.sliceId,
    knowledgePointIds: JSON.stringify(preflight.queueAuthority.knowledgePointIds) === JSON.stringify(q030.knowledgePointIds),
    requiredW5CapabilityIds: JSON.stringify([...preflight.queueAuthority.requiredW5CapabilityIds].sort()) === JSON.stringify([...q030.requiredW5CapabilityIds].sort()),
  },
  sourceIdentity: {
    sourceNodeId: source.sourceNodeId,
    sourceTitle: source.sourceTitle,
    sourcePdfTitle: source.sourcePdfTitle,
    sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
    sourceUrl: preflight.sourceAuthority.sourceUrl,
    pageCount: source.pageCount,
    reviewedPages: source.reviewedPages,
    sourceRefAmbiguity: preflight.sourceAuthority.sourceIdentityReuse.sourceRefAmbiguity,
  },
  evidenceBoundary: preflight.sourceAuthority.evidenceBoundary,
  r02: {
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
    runtimeCapabilityDeliveryState: row.runtimeCapabilityDeliveryState,
    undeliveredRequiredCapabilityIds: row.undeliveredRequiredCapabilityIds,
  })),
  predecessor: preflight.previousSliceD0Evidence,
};

process.stdout.write(`P05F30_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
