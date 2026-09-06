import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q009-g5b-u10a-large-area-unit-identity-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[8];
const mapping = getR04KnowledgePointCapabilityMapping("kp_g5b_u10a_large_area_unit_identity");

const report = {
  schemaName: "P05FW5Q009SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  previousSliceExactPagesRunId: preflight.previousSliceD0Evidence.exactPagesRunId,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  runtimeProfileId: slice?.primaryRuntimeProfileId ?? null,
  r04ClassificationRuleId: mapping?.classificationRuleId ?? null,
  r04AppliedModifierIds: mapping?.appliedModifierIds ?? [],
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  runtimeCapabilityAuthority: preflight.runtimeCapabilityAuthority,
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  sourceUrlFromMetadata: preflight.sourceAuthority.sourceUrlFromMetadata,
  sourceIdentityDisposition: preflight.sourceAuthority.sourceIdentityCrossCheck.disposition,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  canonicalNameZh: preflight.r02ReviewedCandidateAuthority.canonicalNameZh,
  capabilityStatement: preflight.r02ReviewedCandidateAuthority.capabilityStatement,
  reasoningInvariant: preflight.r02ReviewedCandidateAuthority.reasoningInvariant,
  r02Category: preflight.r02ReviewedCandidateAuthority.category,
  includedRelations: preflight.q009ScopeLock.includedRelations,
  excludedKnowledgePointIdsFromSameSource: preflight.q009ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  frozenProfileCategoryMismatchAcknowledged: preflight.preflightDecision.frozenProfileCategoryMismatchAcknowledged,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
