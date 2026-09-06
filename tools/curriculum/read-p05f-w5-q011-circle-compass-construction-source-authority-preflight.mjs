import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q011-g3a-u09-circle-compass-construction-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[10];
const mappings = Object.fromEntries(
  (slice?.knowledgePointIds ?? []).map((kpId) => [kpId, getR04KnowledgePointCapabilityMapping(kpId)]),
);

const report = {
  schemaName: "P05FW5Q011SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  previousSliceExactPagesRunId: preflight.previousSliceD0Evidence.exactPagesRunId,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  runtimeProfileId: slice?.primaryRuntimeProfileId ?? null,
  knowledgePointCount: slice?.knowledgePointCount ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  r04Mappings: Object.fromEntries(Object.entries(mappings).map(([kpId, mapping]) => [kpId, {
    primaryRuntimeProfileId: mapping?.primaryRuntimeProfileId ?? null,
    classificationRuleId: mapping?.classificationRuleId ?? null,
    appliedModifierIds: mapping?.appliedModifierIds ?? [],
  }])),
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  runtimeCapabilityAuthority: preflight.runtimeCapabilityAuthority,
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  sourceUrlFromMetadata: preflight.sourceAuthority.sourceUrlFromMetadata,
  sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  sourceEvidence: {
    compassConstructionPanelTitle: preflight.sourceAuthority.page1DirectEvidence.compassConstruction.panelTitle,
    radiusDiameterMeasureCompare: preflight.sourceAuthority.page1DirectEvidence.radiusDiameterMeasureCompare,
    pointPositionAndIntersectionPage1: preflight.sourceAuthority.page1DirectEvidence.pointPositionAndIntersection,
    page2: preflight.sourceAuthority.page2DirectEvidence,
  },
  r02ReviewedCandidateAuthorities: preflight.r02ReviewedCandidateAuthorities,
  includedRelations: preflight.q011ScopeLock.includedRelations,
  protectedExistingSameSourceKnowledgePointIds: preflight.q011ScopeLock.protectedExistingSameSourceKnowledgePointIds,
  excludedKnowledgePointIdsFromSameSource: preflight.q011ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  atomicThreeKnowledgePointSliceLocked: preflight.preflightDecision.atomicThreeKnowledgePointSliceLocked,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
