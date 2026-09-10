import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const r02Chunk = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json"), "utf8"));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN") throw new Error(`Q022_QUEUE_STATUS:${queue.status}`);
if (queue.queueRegistryParity !== true || queue.queueFrozen !== true) throw new Error("Q022_QUEUE_PARITY_NOT_FROZEN");
const q022 = queue.queueEntries.find((row) => row.queuePosition === 22);
if (!q022) throw new Error("Q022_FROZEN_ROW_MISSING");
if (q022.implementationTaskId !== "P05F_W5DirectProductVerticalSlice022Implementation") throw new Error(`Q022_TASK_ID:${q022.implementationTaskId}`);
if (q022.previousSliceId !== "p05e_q021_r1_g5b_u10_5b10a_profile_geometry_formula_c1") throw new Error(`Q022_PREVIOUS_SLICE:${q022.previousSliceId}`);
const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === q022.primarySourceNodeId);
if (!source) throw new Error(`Q022_R02_SOURCE_MISSING:${q022.primarySourceNodeId}`);
const candidates = q022.knowledgePointIds.map((id) => {
  const row = source.candidates.find((candidate) => candidate.knowledgePointId === id);
  if (!row) throw new Error(`Q022_R02_KP_MISSING:${id}`);
  return row;
});
const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mappings = q022.knowledgePointIds.map((id) => {
  const row = r04.getMapping(id);
  if (!row) throw new Error(`Q022_R04_MAPPING_MISSING:${id}`);
  return row;
});
if (mappings.some((row) => row.primaryRuntimeProfileId !== q022.primaryRuntimeProfileId)) throw new Error("Q022_R04_PROFILE_MISMATCH");
const contractOnly = new Set(r04.capabilities.filter((row) => row.deliveryStatus === "contract_only").map((row) => row.capabilityId));
const effectiveRequiredW5CapabilityIds = [...new Set(mappings.flatMap((row) => row.requiredRuntimeCapabilityIds.filter((id) => contractOnly.has(id))))].sort();
const frozenRequired = [...q022.requiredW5CapabilityIds].sort();
if (JSON.stringify(effectiveRequiredW5CapabilityIds) !== JSON.stringify(frozenRequired)) throw new Error(`Q022_W5_CAPABILITY_MISMATCH:${JSON.stringify({effectiveRequiredW5CapabilityIds,frozenRequired})}`);
const report = {
  schemaName: "P05FW5Q022SourceAuthorityReadbackV1",
  status: "PASS_Q022_EXACT_AUTHORITY_READBACK",
  queue: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queuePosition: q022.queuePosition,
    sliceId: q022.sliceId,
    implementationTaskId: q022.implementationTaskId,
    previousSliceId: q022.previousSliceId,
    primarySourceNodeId: q022.primarySourceNodeId,
    supportingSourceNodeIds: q022.supportingSourceNodeIds,
    intraWavePrerequisiteRank: q022.intraWavePrerequisiteRank,
    primaryRuntimeProfileId: q022.primaryRuntimeProfileId,
    chunkIndex: q022.chunkIndex,
    knowledgePointCount: q022.knowledgePointCount,
    knowledgePointIds: q022.knowledgePointIds,
    requiredW5CapabilityIds: q022.requiredW5CapabilityIds,
    targetEvidenceLevel: q022.targetEvidenceLevel,
    requiredProductNodes: q022.requiredProductNodes,
  },
  r02: {
    sourceNodeId: source.sourceNodeId,
    sourceTitle: source.sourceTitle,
    sourcePdfTitle: source.sourcePdfTitle,
    pageCount: source.pageCount,
    reviewedPages: source.reviewedPages,
    candidates: candidates.map((row) => ({
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      category: row.category,
      evidencePages: row.evidencePages,
      applicationSuitability: row.applicationSuitability,
    })),
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
};
process.stdout.write(`P05F22_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
