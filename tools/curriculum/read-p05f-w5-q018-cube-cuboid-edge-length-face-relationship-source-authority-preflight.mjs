import { readFileSync } from "node:fs";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q018-g5a-u10a1-edge-length-face-relationship-source-authority-preflight.json", import.meta.url), "utf8"));
const r02 = JSON.parse(readFileSync(new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json", import.meta.url), "utf8"));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const row = queue.queueEntries[17];
const sourceRecord = r02.sourceRecords.find((record) => record.sourceNodeId === preflight.queueAuthority.primarySourceNodeId);

if (!sourceRecord) throw new Error("Q018_R02_SOURCE_RECORD_MISSING");
if (preflight.status !== "PASS_SOURCE_AUTHORITY_PREFLIGHT") throw new Error("Q018_PREFLIGHT_NOT_PASS");
if (row.queuePosition !== 18 || row.sliceId !== preflight.queueAuthority.sliceId) throw new Error("Q018_FROZEN_ROW_MISMATCH");
if (JSON.stringify(row.knowledgePointIds) !== JSON.stringify(preflight.queueAuthority.knowledgePointIds)) throw new Error("Q018_FROZEN_KP_BOUNDARY_MISMATCH");
if (preflight.previousSliceD0Evidence.status !== "PASS_E6_D0_COMPLETE") throw new Error("Q018_Q017_PREDECESSOR_NOT_D0");
if (preflight.preflightDecision.manualSourceChoiceRequired) throw new Error("Q018_MANUAL_SOURCE_CHOICE_REQUIRED");
if (!preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval) throw new Error("Q018_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

const report = {
  schemaName: "P05FW5Q018SourceAuthorityPreflightReadbackV1",
  taskId: preflight.taskId,
  status: preflight.status,
  queuePosition: row.queuePosition,
  sliceId: row.sliceId,
  sourceId: row.primarySourceNodeId,
  runtimeProfileId: row.primaryRuntimeProfileId,
  knowledgePointIds: row.knowledgePointIds,
  requiredW5CapabilityIds: row.requiredW5CapabilityIds,
  predecessorD0: preflight.previousSliceD0Evidence,
  sourceAuthority: {
    sourceTitle: preflight.sourceAuthority.sourceTitle,
    sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
    reviewedPages: preflight.sourceAuthority.reviewedPages,
    reviewMethod: preflight.sourceAuthority.reviewMethod,
    sourceRefAmbiguity: preflight.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity,
  },
  r02Authorities: preflight.r02ReviewedCandidateAuthorities.map((entry) => ({
    knowledgePointId: entry.knowledgePointId,
    canonicalNameZh: entry.canonicalNameZh,
    capabilityStatement: entry.capabilityStatement,
    reasoningInvariant: entry.reasoningInvariant,
  })),
  excludedSameSourceKnowledgePointIds: preflight.q018ScopeLock.excludedKnowledgePointIdsFromSameSource,
  implementationAllowedByThisPreflight: preflight.q018ScopeLock.implementationAllowedByThisPreflight,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

console.log(`P05F_W5_Q018_SOURCE_AUTHORITY_PREFLIGHT=${JSON.stringify(report)}`);
