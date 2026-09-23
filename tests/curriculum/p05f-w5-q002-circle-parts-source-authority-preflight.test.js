import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q002-g3a-u09-circle-parts-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q002 frozen queue identity remains exact and Q001 D0 evidence is recorded", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[1];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 2);
  assert.equal(slice.sliceId, "p05e_q002_r0_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice002Implementation");
  assert.equal(slice.previousSliceId, "p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g3a_u09_3a09");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_circle_center_radius_diameter"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);

  assert.equal(preflight.previousSliceD0Evidence.mergeSha, "f95225d2f76f5072dc71411f94d6fdce66173c20");
  assert.equal(preflight.previousSliceD0Evidence.exactPostMergePagesE2ERunId, "33879084977");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
});

test("P05F W5 Q002 source preflight records full-page visual evidence for circle parts", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3a_u09_3a09");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3a09_circle.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1nvx2cakQe_A5HqTi6u6MWhVrPi6D32IL");
  assert.equal(preflight.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle, "圓的各部位名稱");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.targetKnowledgePointLabels, ["圓心", "半徑", "直徑"]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.visibleStatement, "直徑=半徑×2");
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.nonDiameterStatement, "這條不是直徑");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q002 records the embedded 3b06 header URL mismatch without turning it into source ambiguity", () => {
  const anomaly = preflight.sourceAuthority.sourceIdentityAnomaly;
  assert.equal(anomaly.embeddedHeaderUrl, "https://meow911.com/3b06/");
  assert.equal(anomaly.queueAndDriveSourceUrl, "https://meow911.com/3a09/");
  assert.equal(anomaly.queueAndDriveSourceNodeId, "g3a_u09_3a09");
  assert.equal(anomaly.fileName, "meow911_3a09_circle.pdf");
  assert.equal(anomaly.disposition, "RECORDED_NON_BLOCKING_EMBEDDED_HEADER_URL_MISMATCH");
  assert.equal(anomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
});

test("P05F W5 Q002 reconciles the R02 circle-parts candidate without consuming later circle slices", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.knowledgePointId, "kp_circle_center_radius_diameter");
  assert.equal(authority.canonicalNameZh, "圓心、半徑與直徑");
  assert.equal(authority.capabilityStatement, "學生能辨認圓心、半徑、直徑及其名稱。");
  assert.equal(authority.reasoningInvariant, "所有半徑等長，直徑通過圓心且等於兩個半徑。");
  assert.equal(authority.applicationSuitability, "APPLICATION_COMPATIBLE");
  assert.equal(preflight.sourceConstraintReconciliation.directPdfSupportsR02KnowledgePointIdentity, true);
  assert.equal(preflight.sourceConstraintReconciliation.circumferenceLabelAppearsButIsOutsideQ002KnowledgePoint, true);
  assert.equal(preflight.sourceConstraintReconciliation.directPdfContainsApplicationStoryContext, false);
});

test("P05F W5 Q002 preflight locks identification-only scope and forbids product cutover", () => {
  assert.deepEqual(preflight.q002ScopeLock.includedRelations, [
    "IDENTIFY_CIRCLE_CENTER",
    "IDENTIFY_RADIUS",
    "IDENTIFY_DIAMETER",
    "MATCH_CIRCLE_PART_LABEL_TO_DIAGRAM",
    "DISTINGUISH_DIAMETER_FROM_NONCENTER_CHORD",
  ]);

  for (const forbidden of [
    "IDENTIFY_CIRCUMFERENCE_AS_TARGET_KP",
    "COMPASS_CONSTRUCTION",
    "CONCENTRIC_CIRCLE_CONSTRUCTION",
    "RADIUS_DIAMETER_MEASUREMENT",
    "COMPUTE_RADIUS_FROM_DIAMETER",
    "COMPUTE_DIAMETER_FROM_RADIUS",
    "COMPARE_RADIUS_DIAMETER_MEASUREMENTS",
    "CIRCLE_POINT_POSITION",
    "TWO_CIRCLE_INTERSECTION",
    "TWO_CIRCLE_TANGENCY",
    "COMPASS_LENGTH_COMPARISON",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q002ScopeLock.excludedRelations.includes(forbidden));
  }

  assert.equal(preflight.q002ScopeLock.requiresDiagramRepresentation, true);
  assert.equal(preflight.q002ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q002ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q002ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ002ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice002Implementation");
});
