import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q026-g4b-u07-rectangle-square-area-formula-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");

const KP = "kp_g4b_u07_rectangle_square_area_formula";
const REQUIRED_W5 = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const DIRECT_R04_CONTRACT_ONLY = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
];
const REQUIRED_PRODUCT_NODES = [
  "SOURCE_EVIDENCE",
  "KNOWLEDGE_POINT_IDENTITY",
  "TAG_REGISTRY_BINDING",
  "FORMAL_MAPPING",
  "PATTERN_SPEC",
  "SHARED_GENERATOR_BINDING",
  "DETERMINISTIC_VALIDATOR_BINDING",
  "PUBLIC_SOURCE_ADAPTER",
  "PUBLIC_UI_SELECTION",
  "WORKSHEET_AND_ANSWER_KEY",
  "PRODUCTION_HTML",
  "CHROMIUM_PDF_AND_PRINT",
  "PRODUCT_ADMISSION_CLAIM",
];

test("Q026 preflight binds the exact frozen queue-position-26 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);

  const row = queue.queueEntries.find((entry) => entry.queuePosition === 26);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q026_r2_g4b_u07_4b07_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice026Implementation");
  assert.equal(row.previousSliceId, "p05e_q025_r2_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete, true);
  assert.equal(row.assignedDeliveryWaveId, "R05-W5");
  assert.equal(row.primarySourceNodeId, "g4b_u07_4b07");
  assert.deepEqual(row.supportingSourceNodeIds, ["g4b_u07_4b07"]);
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 1);
  assert.deepEqual(row.knowledgePointIds, [KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.deepEqual(row.requiredProductNodes, REQUIRED_PRODUCT_NODES);
  assert.equal(row.admissionState, "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED");
  assert.equal(row.productProductionAdmitted, false);
  assert.equal(row.implementationAllowedByP05E, false);

  assert.equal(preflight.queueAuthority.queueVersion, queue.derivedRegistrySnapshot.queueVersion);
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, row.knowledgePointIds);
});

test("Q026 binds the exact R02 area-formula candidate while explicitly reconciling the evidence-page pointer", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === "g4b_u07_4b07");
  assert.ok(source);
  assert.equal(source.sourceTitle, "周長與面積");
  assert.equal(source.sourcePdfTitle, "meow911_4b07_source.pdf");
  assert.equal(source.pageCount, 3);
  assert.deepEqual(source.reviewedPages, [1, 2, 3]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "長方形正方形面積公式");
  assert.equal(candidate.capabilityStatement, "學生能以長乘寬或邊長平方求面積。");
  assert.equal(candidate.reasoningInvariant, "面積等於橫向單位數與縱向單位數的乘積。");
  assert.deepEqual(candidate.evidencePages, [3]);
  assert.equal(candidate.category, "geometry");
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  const bound = preflight.r02ReviewedCandidateAuthority.knowledgePoints.find((row) => row.knowledgePointId === KP);
  assert.ok(bound);
  assert.equal(bound.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(bound.capabilityStatement, candidate.capabilityStatement);
  assert.equal(bound.reasoningInvariant, candidate.reasoningInvariant);
  assert.deepEqual(bound.evidencePages, candidate.evidencePages);

  assert.equal(preflight.sourceAuthority.r02EvidencePageReconciliation.evidencePagePointerMismatchObserved, true);
  assert.deepEqual(preflight.sourceAuthority.r02EvidencePageReconciliation.r02DeclaredEvidencePages, [3]);
  assert.deepEqual(preflight.sourceAuthority.r02EvidencePageReconciliation.directVisualFormulaEvidencePages, [1]);
  assert.equal(preflight.sourceAuthority.r02EvidencePageReconciliation.targetSemanticIdentityStillSupportedByExactSourcePdf, true);
  assert.equal(preflight.sourceAuthority.r02EvidencePageReconciliation.r02AuthorityModified, false);
  assert.equal(preflight.preflightDecision.r02EvidencePagePointerMismatchExplicitlyReconciled, true);
});

test("Q026 direct visual evidence locks only the source-supported rectangle/square area formula semantics", () => {
  const page1 = preflight.sourceAuthority.directVisualEvidence.page1;
  assert.ok(page1.observedPanels.includes("面積的單位"));
  assert.ok(page1.observedPanels.includes("長方形與正方形面積公式"));
  assert.ok(page1.directlySupportedConcepts.includes("RECTANGLE_AREA_LENGTH_TIMES_WIDTH"));
  assert.ok(page1.directlySupportedConcepts.includes("SQUARE_AREA_SIDE_TIMES_SIDE"));
  assert.ok(page1.directlySupportedConcepts.includes("AREA_AS_ROW_COUNT_TIMES_COLUMN_COUNT"));

  assert.equal(preflight.sourceConstraintReconciliation.rectangleAreaLengthTimesWidthSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.squareAreaSideTimesSideSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.areaRowColumnProductInvariantSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.perimeterFormulaExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.compositeRectilinearAreaExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.areaUnitConversionExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.equalAreaPerimeterComparisonExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowed, false);
});

test("Q026 source identity is cross-checked while the embedded header URL mismatch stays explicit and non-blocking", () => {
  assert.equal(preflight.sourceAuthority.sourceNodeId, "g4b_u07_4b07");
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_4b07_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "19yZxx2bt_rQgqAA7Rx4HALoL3l3nfpw-");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1X-hyC3X8aw72FoLJql5v7BbUq601yjS5");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1xYu4mXNY1R7JlNteWn65_9LsvZ8vwm_4");
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/4b07/");
  assert.equal(preflight.sourceAuthority.embeddedHeaderUrlFromPdf, "https://meow911.com/4b06/");

  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved, true);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceConstraintReconciliation.embeddedHeaderUrlMismatchIsNonBlocking, true);

  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataManualReviewed, false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.metadataExtractionStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.verificationNotesStatus, "pending");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse, "STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("Q026 binds current R04 geometry-formula mapping and the frozen dependency closure", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const mapping = r04.getMapping(KP);
  assert.ok(mapping);

  const bound = preflight.runtimeCapabilityAuthority.perKnowledgePointMappings.find((row) => row.knowledgePointId === KP);
  assert.ok(bound);
  assert.equal(mapping.mappingId, "r04map_g4b_u07_rectangle_square_area_formula");
  assert.equal(mapping.mappingId, bound.mappingId);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds, []);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds, bound.requiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds, []);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds, []);
  assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.deepEqual([...mapping.undeliveredRequiredCapabilityIds].sort(), [...DIRECT_R04_CONTRACT_ONLY].sort());

  assert.deepEqual(
    [...preflight.runtimeCapabilityAuthority.contractOnlyRequiredCapabilityIdsFromCurrentR04].sort(),
    [...DIRECT_R04_CONTRACT_ONLY].sort(),
  );
  assert.deepEqual(preflight.runtimeCapabilityAuthority.frozenQueueDependencyClosureCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(
    [...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(),
    [...REQUIRED_W5].sort(),
  );
  assert.equal(preflight.runtimeCapabilityAuthority.r02CategoryAlignedWithFrozenProfile, true);
  assert.equal(preflight.runtimeCapabilityAuthority.r04AuthorityTouched, false);
});

test("Q026 predecessor is pinned to exact Q025 E6 D0 evidence", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 882);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "946ac0221aefa9c6b0aac2515752270ba2410909");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId, "34502165965");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34502372333");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34502372626");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10162429517");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:9fad5db90fb3d7df802788a065a50fdf6ac76a1667244a8bcc862f9298d0ab35");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion, "success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesEvidenceUploaded, true);
});

test("Q026 remains preflight-only and forbids sibling, application, and Q027+ expansion", () => {
  assert.deepEqual(preflight.q026ScopeLock.includedKnowledgePointIds, [KP]);
  assert.deepEqual(preflight.q026ScopeLock.includedRelations, [
    "COMPUTE_RECTANGLE_AREA_AS_LENGTH_TIMES_WIDTH",
    "COMPUTE_SQUARE_AREA_AS_SIDE_TIMES_SIDE",
    "PRESERVE_AREA_AS_ROW_COUNT_TIMES_COLUMN_COUNT",
  ]);

  for (const id of [
    "kp_g4b_u07_perimeter_path_sum",
    "kp_g4b_u07_rectangle_square_perimeter_formula",
    "kp_g4b_u07_composite_perimeter",
    "kp_g4b_u07_composite_rectilinear_area",
  ]) assert.ok(preflight.q026ScopeLock.excludedSameSourceKnowledgePointIds.includes(id), id);

  for (const relation of [
    "PERIMETER_PATH_SUM_AS_TARGET_KP",
    "RECTANGLE_SQUARE_PERIMETER_FORMULA_AS_TARGET_KP",
    "COMPOSITE_PERIMETER_AS_TARGET_KP",
    "COMPOSITE_RECTILINEAR_AREA_AS_TARGET_KP",
    "AREA_UNIT_CONVERSION",
    "SAME_PERIMETER_AREA_COMPARISON",
    "EQUAL_AREA_PERIMETER_COMPARISON",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q027_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q026ScopeLock.excludedRelations.includes(relation), relation);

  assert.equal(preflight.q026ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q026ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q026ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q026ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q026ScopeLock.r02AuthorityTouched, false);
  assert.equal(preflight.q026ScopeLock.r04AuthorityTouched, false);
  assert.equal(preflight.q026ScopeLock.q027OrLaterTouched, false);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed, false);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice026Implementation");
});
