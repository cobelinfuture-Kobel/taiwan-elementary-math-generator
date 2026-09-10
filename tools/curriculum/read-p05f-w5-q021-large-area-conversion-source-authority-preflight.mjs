import { readFileSync } from "node:fs";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q021-g5b-u10a-large-area-conversion-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json", import.meta.url),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const row = queue.queueEntries[20];
const sourceRecord = r02.sourceRecords.find((record) => record.sourceNodeId === preflight.queueAuthority.primarySourceNodeId);
const targetIds = preflight.queueAuthority.knowledgePointIds;
const mappings = targetIds.map((knowledgePointId) => ({
  knowledgePointId,
  mapping: getR04KnowledgePointCapabilityMapping(knowledgePointId),
}));

if (!sourceRecord) throw new Error("Q021_R02_SOURCE_RECORD_MISSING");
if (preflight.status !== "PASS_SOURCE_AUTHORITY_PREFLIGHT") throw new Error("Q021_PREFLIGHT_NOT_PASS");
if (row.queuePosition !== 21 || row.sliceId !== preflight.queueAuthority.sliceId) throw new Error("Q021_FROZEN_ROW_MISMATCH");
if (JSON.stringify(row.knowledgePointIds) !== JSON.stringify(targetIds)) throw new Error("Q021_FROZEN_KP_BOUNDARY_MISMATCH");
if (preflight.previousSliceD0Evidence.status !== "PASS_E6_D0_COMPLETE") throw new Error("Q021_Q020_PREDECESSOR_NOT_D0");
if (preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion !== "success") throw new Error("Q021_Q020_EXACT_PAGES_NOT_SUCCESS");
if (preflight.preflightDecision.manualSourceChoiceRequired) throw new Error("Q021_MANUAL_SOURCE_CHOICE_REQUIRED");
if (preflight.preflightDecision.sourceRefAmbiguity) throw new Error("Q021_SOURCE_REF_AMBIGUITY");
if (!preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval) throw new Error("Q021_IMPLEMENTATION_APPROVAL_BOUNDARY_MISSING");

for (const knowledgePointId of targetIds) {
  if (!sourceRecord.candidates.some((candidate) => candidate.knowledgePointId === knowledgePointId)) {
    throw new Error(`Q021_R02_TARGET_MISSING:${knowledgePointId}`);
  }
}
for (const { knowledgePointId, mapping } of mappings) {
  if (!mapping) throw new Error(`Q021_R04_MAPPING_MISSING:${knowledgePointId}`);
  if (mapping.primaryRuntimeProfileId !== "profile_geometry_formula") throw new Error(`Q021_R04_PROFILE_MISMATCH:${knowledgePointId}`);
  if (mapping.classificationRuleId !== "rule_geometry_formula") throw new Error(`Q021_R04_RULE_MISMATCH:${knowledgePointId}`);
  if (mapping.appliedModifierIds.length !== 0) throw new Error(`Q021_R04_MODIFIER_MISMATCH:${knowledgePointId}`);
}

const report = {
  schemaName: "P05FW5Q021SourceAuthorityPreflightReadbackV1",
  taskId: preflight.taskId,
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: row.queuePosition,
  sliceId: row.sliceId,
  implementationTaskId: row.implementationTaskId,
  previousSliceId: row.previousSliceId,
  predecessorD0: preflight.previousSliceD0Evidence,
  sourceId: row.primarySourceNodeId,
  runtimeProfileId: row.primaryRuntimeProfileId,
  knowledgePointCount: row.knowledgePointCount,
  knowledgePointIds: row.knowledgePointIds,
  requiredW5CapabilityIds: row.requiredW5CapabilityIds,
  r04Mappings: mappings.map(({ knowledgePointId, mapping }) => ({
    knowledgePointId,
    primaryRuntimeProfileId: mapping.primaryRuntimeProfileId,
    classificationRuleId: mapping.classificationRuleId,
    appliedModifierIds: mapping.appliedModifierIds,
  })),
  sourceAuthority: {
    sourceTitle: preflight.sourceAuthority.sourceTitle,
    sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
    sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
    sourceUrl: preflight.sourceAuthority.sourceUrl,
    reviewedPages: preflight.sourceAuthority.reviewedPages,
    reviewMethod: preflight.sourceAuthority.reviewMethod,
    sourceRefAmbiguity: preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity,
    disposition: preflight.sourceAuthority.sourceIdentityCrossCheck.disposition,
  },
  r02Authorities: preflight.r02ReviewedCandidateAuthority.knowledgePoints,
  includedRelations: preflight.q021ScopeLock.includedRelations,
  excludedSameSourceKnowledgePointIds: preflight.q021ScopeLock.excludedKnowledgePointIdsFromSameSource,
  runtimeProfileCategoryMismatchExplicitlyBounded: preflight.preflightDecision.runtimeProfileCategoryMismatchExplicitlyBounded,
  twoKnowledgePointSliceLocked: preflight.preflightDecision.twoKnowledgePointSliceLocked,
  implementationAllowedByThisPreflight: preflight.q021ScopeLock.implementationAllowedByThisPreflight,
  validationBoundary: preflight.preflightValidationBoundary,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

console.log(`P05F_W5_Q021_SOURCE_AUTHORITY_PREFLIGHT=${JSON.stringify(report)}`);
