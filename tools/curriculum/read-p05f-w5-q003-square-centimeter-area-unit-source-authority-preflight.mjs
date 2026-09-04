import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-area-unit-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[2];

const report = {
  schemaName: "P05FW5Q003SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  runtimeProfileId: slice?.primaryRuntimeProfileId ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  canonicalNameZh: preflight.r02ReviewedCandidateAuthority.canonicalNameZh,
  capabilityStatement: preflight.r02ReviewedCandidateAuthority.capabilityStatement,
  reasoningInvariant: preflight.r02ReviewedCandidateAuthority.reasoningInvariant,
  excludedKnowledgePointIdsFromSameSource: preflight.q003ScopeLock.excludedKnowledgePointIdsFromSameSource,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  postMergeEvidenceTriggerPolicy: preflight.postMergeEvidenceTriggerPolicy,
  nextTaskRequiresSeparateImplementationApproval: preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval,
  nextTask: preflight.preflightDecision.nextTask,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
