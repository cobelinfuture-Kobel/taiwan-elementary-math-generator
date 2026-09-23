import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q002-g3a-u09-circle-parts-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[1];

const report = {
  schemaName: "P05FW5Q002SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  previousSliceId: slice?.previousSliceId ?? null,
  previousSliceD0Status: preflight.previousSliceD0Evidence.status,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  panelTitle: preflight.sourceAuthority.page1DirectEvidence.panelTitle,
  targetKnowledgePointLabels: preflight.sourceAuthority.page1DirectEvidence.targetKnowledgePointLabels,
  visibleStatement: preflight.sourceAuthority.page1DirectEvidence.visibleStatement,
  nonDiameterStatement: preflight.sourceAuthority.page1DirectEvidence.nonDiameterStatement,
  embeddedHeaderUrlMismatchDisposition: preflight.sourceAuthority.sourceIdentityAnomaly.disposition,
  directPdfSupportsR02KnowledgePointIdentity:
    preflight.sourceConstraintReconciliation.directPdfSupportsR02KnowledgePointIdentity,
  requiresDiagramRepresentation: preflight.q002ScopeLock.requiresDiagramRepresentation,
  implementationAllowedByThisPreflight: preflight.q002ScopeLock.implementationAllowedByThisPreflight,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  sourceRefAmbiguity: preflight.preflightDecision.sourceRefAmbiguity,
  nextTask: preflight.preflightDecision.nextTask,
};

const pass = report.status === "PASS_SOURCE_AUTHORITY_PREFLIGHT"
  && report.queueFrozen === true
  && report.queuePosition === 2
  && report.sliceId === "p05e_q002_r0_g3a_u09_3a09_profile_geometry_property_c1"
  && report.previousSliceId === "p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1"
  && report.previousSliceD0Status === "PASS_E6_D0_COMPLETE"
  && report.primarySourceNodeId === "g3a_u09_3a09"
  && JSON.stringify(report.knowledgePointIds) === JSON.stringify(["kp_circle_center_radius_diameter"])
  && report.sourcePdfDriveFileId === "1nvx2cakQe_A5HqTi6u6MWhVrPi6D32IL"
  && JSON.stringify(report.reviewedPages) === JSON.stringify([1, 2])
  && report.panelTitle === "圓的各部位名稱"
  && JSON.stringify(report.targetKnowledgePointLabels) === JSON.stringify(["圓心", "半徑", "直徑"])
  && report.visibleStatement === "直徑=半徑×2"
  && report.nonDiameterStatement === "這條不是直徑"
  && report.embeddedHeaderUrlMismatchDisposition === "RECORDED_NON_BLOCKING_EMBEDDED_HEADER_URL_MISMATCH"
  && report.directPdfSupportsR02KnowledgePointIdentity === true
  && report.requiresDiagramRepresentation === true
  && report.implementationAllowedByThisPreflight === false
  && report.manualSourceChoiceRequired === false
  && report.sourceRefAmbiguity === false
  && report.nextTask === "P05F_W5DirectProductVerticalSlice002Implementation";

console.log(JSON.stringify(report, null, 2));
if (!pass) throw new Error("P05F_W5_Q002_SOURCE_AUTHORITY_PREFLIGHT_READBACK_FAILED");
