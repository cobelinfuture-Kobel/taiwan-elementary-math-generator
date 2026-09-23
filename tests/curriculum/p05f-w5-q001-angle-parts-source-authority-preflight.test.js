import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q001-g3a-u05-angle-parts-source-authority-preflight.json", import.meta.url),
  "utf8",
));

const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q001 frozen queue identity remains exact", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[0];

  assert.equal(queue.queueFrozen, true);
  assert.equal(slice.queuePosition, 1);
  assert.equal(slice.sliceId, "p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice001Implementation");
  assert.equal(slice.previousSliceId, null);
  assert.equal(slice.primarySourceNodeId, "g3a_u05_3a05");
  assert.equal(slice.intraWavePrerequisiteRank, 0);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds, ["kp_angle_parts_identification"]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
});

test("P05F W5 Q001 source preflight records direct full-page visual evidence", () => {
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g3a_u05_3a05");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_3a05_angles.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1SqfJ5IqI4lCeDGMA5TNhTd0MNw4BAe6K");
  assert.equal(preflight.sourceAuthority.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages, [1]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle, "角的組成");
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.visibleStatement, "兩條邊+1個頂點");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.visibleLabels, ["頂點", "邊1", "邊2", "角"]);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("P05F W5 Q001 reconciles R02 reviewed candidate without broadening source scope", () => {
  const authority = preflight.r02ReviewedCandidateAuthority;
  assert.equal(authority.knowledgePointId, "kp_angle_parts_identification");
  assert.equal(authority.canonicalNameZh, "角的組成與標記");
  assert.equal(authority.capabilityStatement, "學生能辨認角的頂點、兩邊及角的符號標記。");
  assert.equal(authority.applicationSuitability, "APPLICATION_NOT_APPLICABLE");
  assert.equal(preflight.sourceConstraintReconciliation.directPdfSupportsR02KnowledgePointIdentity, true);
  assert.equal(preflight.sourceConstraintReconciliation.rayTerminologyAppearsInDirectPdf, false);
  assert.equal(
    preflight.sourceConstraintReconciliation.learnerFacingImplementationMustNotRequireRayVocabularyWithoutAdditionalSourceEvidence,
    true,
  );
});

test("P05F W5 Q001 preflight locks only angle-part identification and forbids implementation cutover", () => {
  assert.deepEqual(preflight.q001ScopeLock.includedRelations, [
    "IDENTIFY_VERTEX",
    "IDENTIFY_SIDE",
    "IDENTIFY_ANGLE_MARKER",
    "MATCH_ANGLE_PART_LABEL_TO_DIAGRAM",
  ]);
  for (const forbidden of [
    "COMPARE_ANGLE_SIZE",
    "RECOGNIZE_RIGHT_ANGLE",
    "CLASSIFY_ACUTE_RIGHT_OBTUSE",
    "RECTANGLE_SQUARE_PROPERTY_REASONING",
    "ANGLE_MEASURE_NUMERIC",
    "ANGLE_CONSTRUCTION",
    "APPLICATION_CONTEXT",
  ]) {
    assert.ok(preflight.q001ScopeLock.excludedRelations.includes(forbidden));
  }
  assert.equal(preflight.q001ScopeLock.requiresDiagramRepresentation, true);
  assert.equal(preflight.q001ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q001ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ001ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
});
