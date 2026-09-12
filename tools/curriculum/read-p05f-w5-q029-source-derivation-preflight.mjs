import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-derivation-preflight.json");
const q028 = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-source-semantic-pattern-contract.json");
const q008 = readJson("data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();

if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN" || queue.queueRegistryParity !== true || queue.queueFrozen !== true) {
  throw new Error("Q029_QUEUE_NOT_FROZEN");
}
const q029 = queue.queueEntries.find((row) => row.queuePosition === 29);
if (!q029) throw new Error("Q029_FROZEN_ROW_MISSING");
if (q029.knowledgePointIds.length !== 1 || q029.knowledgePointIds[0] !== "kp_g5a_u10a1_cube_cuboid_net") {
  throw new Error(`Q029_KP_SCOPE:${q029.knowledgePointIds.join(",")}`);
}
if (q028.semanticContract.deferredQueuePosition !== 29 || q028.semanticContract.deferredKnowledgePointId !== q029.knowledgePointIds[0]) {
  throw new Error("Q029_Q028_DEFERRED_OWNERSHIP_MISMATCH");
}
const source = r02.sourceRecords.find((row) => row.sourceNodeId === q029.primarySourceNodeId);
if (!source) throw new Error(`Q029_R02_SOURCE_MISSING:${q029.primarySourceNodeId}`);
const candidate = source.candidates.find((row) => row.knowledgePointId === q029.knowledgePointIds[0]);
if (!candidate) throw new Error("Q029_R02_KP_MISSING");
if (q008.sourceAuthority.sourceNodeId !== q029.primarySourceNodeId || q008.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity !== false) {
  throw new Error("Q029_Q008_SOURCE_IDENTITY_REUSE_FAILED");
}
const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mapping = r04.getMapping(q029.knowledgePointIds[0]);
if (!mapping) throw new Error("Q029_R04_MAPPING_MISSING");
if (mapping.primaryRuntimeProfileId !== q029.primaryRuntimeProfileId) throw new Error("Q029_R04_PROFILE_MISMATCH");

const report = {
  schemaName: "P05FW5Q029SourceDerivationReadbackV1",
  status: "PASS_Q029_SOURCE_DERIVATION_PREFLIGHT",
  queue: q029,
  queueRegistry: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queueFrozen: queue.queueFrozen,
    queueRegistryParity: queue.queueRegistryParity,
  },
  sourceDerivation: {
    q028DeferredQueuePosition: q028.semanticContract.deferredQueuePosition,
    q028DeferredKnowledgePointId: q028.semanticContract.deferredKnowledgePointId,
    r02SourceNodeId: source.sourceNodeId,
    r02SourceTitle: source.sourceTitle,
    r02Candidate: candidate,
    reusedPdfDriveFileId: q008.sourceAuthority.sourcePdfDriveFileId,
    sourceRefAmbiguity: q008.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity,
  },
  runtime: {
    mappingId: mapping.mappingId,
    primaryRuntimeProfileId: mapping.primaryRuntimeProfileId,
    classificationRuleId: mapping.classificationRuleId,
    appliedModifierIds: mapping.appliedModifierIds,
    requiredRuntimeCapabilityIds: mapping.requiredRuntimeCapabilityIds,
    frozenRequiredW5CapabilityIds: q029.requiredW5CapabilityIds,
  },
  decision: preflight.preflightDecision,
};

process.stdout.write(`P05F29_SOURCE_DERIVATION_READBACK=${JSON.stringify(report)}\n`);
