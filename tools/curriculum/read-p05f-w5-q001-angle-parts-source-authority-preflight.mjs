import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/full-product/p05f/q001-g3a-u05-angle-parts-source-authority-preflight.json"),
  "utf8",
));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[0];

const report = {
  schemaName: "P05FW5Q001SourceAuthorityPreflightReadbackV1",
  status: preflight.status,
  queueFrozen: queue.queueFrozen,
  queuePosition: slice?.queuePosition ?? null,
  sliceId: slice?.sliceId ?? null,
  primarySourceNodeId: slice?.primarySourceNodeId ?? null,
  knowledgePointIds: slice?.knowledgePointIds ?? [],
  requiredW5CapabilityIds: slice?.requiredW5CapabilityIds ?? [],
  sourcePdfTitle: preflight.sourceAuthority.sourcePdfTitle,
  sourcePdfDriveFileId: preflight.sourceAuthority.sourcePdfDriveFileId,
  reviewedPages: preflight.sourceAuthority.reviewedPages,
  panelTitle: preflight.sourceAuthority.page1DirectEvidence.panelTitle,
  visibleStatement: preflight.sourceAuthority.page1DirectEvidence.visibleStatement,
  directPdfSupportsR02KnowledgePointIdentity:
    preflight.sourceConstraintReconciliation.directPdfSupportsR02KnowledgePointIdentity,
  requiresDiagramRepresentation: preflight.q001ScopeLock.requiresDiagramRepresentation,
  implementationAllowedByThisPreflight: preflight.q001ScopeLock.implementationAllowedByThisPreflight,
  manualSourceChoiceRequired: preflight.preflightDecision.manualSourceChoiceRequired,
  nextTask: preflight.preflightDecision.nextTask,
};

const pass = report.status === "PASS_SOURCE_AUTHORITY_PREFLIGHT"
  && report.queueFrozen === true
  && report.queuePosition === 1
  && report.sliceId === "p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1"
  && report.primarySourceNodeId === "g3a_u05_3a05"
  && JSON.stringify(report.knowledgePointIds) === JSON.stringify(["kp_angle_parts_identification"])
  && report.sourcePdfDriveFileId === "1SqfJ5IqI4lCeDGMA5TNhTd0MNw4BAe6K"
  && JSON.stringify(report.reviewedPages) === JSON.stringify([1])
  && report.panelTitle === "角的組成"
  && report.visibleStatement === "兩條邊+1個頂點"
  && report.directPdfSupportsR02KnowledgePointIdentity === true
  && report.requiresDiagramRepresentation === true
  && report.implementationAllowedByThisPreflight === false
  && report.manualSourceChoiceRequired === false
  && report.nextTask === "P05F_W5DirectProductVerticalSlice001Implementation";

console.log(JSON.stringify(report, null, 2));
if (!pass) throw new Error("P05F_W5_Q001_SOURCE_AUTHORITY_PREFLIGHT_READBACK_FAILED");
