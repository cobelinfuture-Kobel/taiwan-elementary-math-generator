import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const preflight = readJson("data/curriculum/full-product/p05f/q031-g5b-u10a-large-unit-estimation-application-source-authority-preflight.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();

if (queue.status !== "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN" || queue.queueRegistryParity !== true || queue.queueFrozen !== true) {
  throw new Error("Q031_QUEUE_NOT_FROZEN");
}

const q031 = queue.queueEntries.find((row) => row.queuePosition === 31);
if (!q031) throw new Error("Q031_FROZEN_ROW_MISSING");
if (q031.implementationTaskId !== "P05F_W5DirectProductVerticalSlice031Implementation") throw new Error(`Q031_TASK_ID:${q031.implementationTaskId}`);
if (q031.previousSliceId !== "p05e_q030_r2_g5b_u03_5b03_profile_geometry_formula_c1") throw new Error(`Q031_PREVIOUS_SLICE:${q031.previousSliceId}`);
if (q031.knowledgePointIds.length !== 1 || q031.knowledgePointIds[0] !== "kp_g5b_u10a_large_unit_estimation_application") {
  throw new Error(`Q031_KP:${q031.knowledgePointIds.join(",")}`);
}

const source = r02.sourceRecords.find((row) => row.sourceNodeId === q031.primarySourceNodeId);
if (!source) throw new Error(`Q031_R02_SOURCE_MISSING:${q031.primarySourceNodeId}`);
const candidate = source.candidates.find((row) => row.knowledgePointId === q031.knowledgePointIds[0]);
if (!candidate) throw new Error(`Q031_R02_KP_MISSING:${q031.knowledgePointIds[0]}`);

const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const mapping = r04.getMapping(q031.knowledgePointIds[0]);
if (!mapping) throw new Error(`Q031_R04_MAPPING_MISSING:${q031.knowledgePointIds[0]}`);
if (mapping.primaryRuntimeProfileId !== q031.primaryRuntimeProfileId) throw new Error("Q031_R04_PROFILE_MISMATCH");
if (mapping.classificationRuleId !== "rule_quantity_measurement") throw new Error("Q031_R04_CLASSIFICATION_RULE_MISMATCH");
if (JSON.stringify(mapping.appliedModifierIds) !== JSON.stringify(["mod_quantity_relation_semantics", "mod_application_semantics"])) {
  throw new Error(`Q031_R04_MODIFIERS:${mapping.appliedModifierIds.join(",")}`);
}

const report = {
  schemaName: "P05FW5Q031SourceAuthorityReadbackV1",
  status: "PASS_Q031_EXACT_AUTHORITY_READBACK",
  queue: q031,
  queueRegistry: {
    queueVersion: queue.derivedRegistrySnapshot.queueVersion,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
    queueFrozen: queue.queueFrozen,
    queueRegistryParity: queue.queueRegistryParity,
  },
  preflightQueueParity: {
    sliceId: preflight.queueAuthority.sliceId === q031.sliceId,
    knowledgePointIds: JSON.stringify(preflight.queueAuthority.knowledgePointIds) === JSON.stringify(q031.knowledgePointIds),
    requiredW5CapabilityIds: JSON.stringify(preflight.queueAuthority.requiredW5CapabilityIds) === JSON.stringify(q031.requiredW5CapabilityIds),
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
  sourceEvidencePage: 1,
  r02: {
    candidate,
    sameSourceCandidateIds: source.candidates.map((row) => row.knowledgePointId),
  },
  r04: {
    knowledgePointId: mapping.knowledgePointId,
    mappingId: mapping.mappingId,
    primaryRuntimeProfileId: mapping.primaryRuntimeProfileId,
    classificationRuleId: mapping.classificationRuleId,
    appliedModifierIds: mapping.appliedModifierIds,
    requiredRuntimeCapabilityIds: mapping.requiredRuntimeCapabilityIds,
    optionalRuntimeCapabilityIds: mapping.optionalRuntimeCapabilityIds,
    forbiddenRuntimeCapabilityIds: mapping.forbiddenRuntimeCapabilityIds,
    runtimeCapabilityDeliveryState: mapping.runtimeCapabilityDeliveryState,
    undeliveredRequiredCapabilityIds: mapping.undeliveredRequiredCapabilityIds,
  },
  predecessor: preflight.previousSliceD0Evidence,
  decision: preflight.preflightDecision,
};

process.stdout.write(`P05F31_PREFLIGHT_READBACK=${JSON.stringify(report)}\n`);
