import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q023-g3b-u05-area-conservation-irregular-grid-source-authority-preflight.json");
const q012 = readJson("data/curriculum/full-product/p05f/q012-g3b-u05-area-grid-counting-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");

const TARGET_KPS = [
  "kp_area_conservation_cut_rearrange",
  "kp_irregular_grid_area",
];
const FROZEN_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const CURRENT_R04_REQUIRED = [
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
];
const CURRENT_UNDELIVERED = [
  "cap_geometry_formula_evaluation",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
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

const QUEUE_ROW_FIELDS = [
  "queuePosition",
  "sliceId",
  "implementationTaskId",
  "previousSliceId",
  "previousSliceMustBeD0Complete",
  "assignedDeliveryWaveId",
  "primarySourceNodeId",
  "supportingSourceNodeIds",
  "intraWavePrerequisiteRank",
  "primaryRuntimeProfileId",
  "chunkIndex",
  "knowledgePointCount",
  "knowledgePointIds",
  "requiredW5CapabilityIds",
  "targetEvidenceLevel",
  "requiredProductNodes",
  "admissionState",
  "productProductionAdmitted",
  "implementationAllowedByP05E",
];

const R02_FIELDS = [
  "knowledgePointId",
  "canonicalNameZh",
  "capabilityStatement",
  "reasoningInvariant",
  "category",
  "evidencePages",
  "applicationSuitability",
];

test("Q023 preflight binds the exact frozen queue-position-23 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 23);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q023_r2_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice023Implementation");
  assert.equal(row.previousSliceId, "p05e_q022_r2_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete, true);
  assert.equal(row.assignedDeliveryWaveId, "R05-W5");
  assert.equal(row.primarySourceNodeId, "g3b_u05_3b05");
  assert.deepEqual(row.supportingSourceNodeIds, ["g3b_u05_3b05"]);
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 2);
  assert.deepEqual(row.knowledgePointIds, TARGET_KPS);
  assert.deepEqual(row.requiredW5CapabilityIds, FROZEN_CAPS);
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.deepEqual(row.requiredProductNodes, REQUIRED_PRODUCT_NODES);
  assert.equal(row.admissionState, "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED");
  assert.equal(row.productProductionAdmitted, false);
  assert.equal(row.implementationAllowedByP05E, false);
  assert.equal(preflight.queueAuthority.queueVersion, queue.derivedRegistrySnapshot.queueVersion);
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  for (const field of QUEUE_ROW_FIELDS) assert.deepEqual(preflight.queueAuthority[field], row[field], field);
});

test("Q023 binds the two exact R02 reviewed candidates and same-source exclusions", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === "g3b_u05_3b05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "面積與平方公分");
  assert.equal(source.sourcePdfTitle, "meow911_3b05_cm2_area.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);
  const bound = new Map(preflight.r02ReviewedCandidateAuthority.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  for (const id of TARGET_KPS) {
    const candidate = source.candidates.find((row) => row.knowledgePointId === id);
    assert.ok(candidate, id);
    const boundCandidate = bound.get(id);
    assert.ok(boundCandidate, id);
    for (const field of R02_FIELDS) assert.deepEqual(boundCandidate[field], candidate[field], `${id}:${field}`);
  }
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds, source.candidates.map((row) => row.knowledgePointId));
  assert.deepEqual(preflight.q023ScopeLock.protectedExistingSameSourceKnowledgePointIds, [
    "kp_area_square_centimeter_unit",
    "kp_area_grid_counting",
  ]);
  assert.ok(preflight.q023ScopeLock.excludedSameSourceKnowledgePointIds.includes("kp_area_compare_same_perimeter"));
});

test("Q023 reuses Q012 full-page source identity and only promotes panels Q012 explicitly left for later siblings", () => {
  assert.equal(q012.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(q012.sourceAuthority.sourceNodeId, preflight.sourceAuthority.sourceNodeId);
  assert.equal(q012.sourceAuthority.sourcePdfTitle, preflight.sourceAuthority.sourcePdfTitle);
  assert.equal(q012.sourceAuthority.sourcePdfDriveFileId, preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q012.sourceAuthority.sourceMetadataDriveFileId, preflight.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(q012.sourceAuthority.verificationNotesDriveFileId, preflight.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(q012.sourceAuthority.sourceUrlFromMetadata, preflight.sourceAuthority.sourceUrlFromMetadata);
  assert.equal(q012.sourceAuthority.embeddedHeaderUrlFromPdf, preflight.sourceAuthority.embeddedHeaderUrlFromPdf);
  assert.equal(q012.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.ok(q012.sourceAuthority.page1DirectEvidence.laterSiblingPanelsObservedButExcluded.includes("正方形切割後 翻轉拼貼面積不會改變"));
  assert.ok(q012.sourceAuthority.page1DirectEvidence.laterSiblingPanelsObservedButExcluded.includes("把綠色面積接著塗色 填滿成8cm²"));
  assert.equal(preflight.sourceConstraintReconciliation.embeddedHeaderUrlMismatchIsNonBlocking, true);
  assert.equal(preflight.sourceConstraintReconciliation.metadataTitleOrderDifferenceIsNonBlocking, true);
});

test("Q023 binds current R04 formula mappings and distinguishes current undelivered capabilities from frozen dependency closure", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const contractOnlyIds = new Set(r04.capabilities.filter((row) => row.deliveryStatus === "contract_only").map((row) => row.capabilityId));
  const contractOnlyRequired = new Set();
  for (const id of TARGET_KPS) {
    const mapping = r04.getMapping(id);
    assert.ok(mapping, id);
    assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
    assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
    assert.deepEqual(mapping.appliedModifierIds, []);
    assert.deepEqual(mapping.requiredRuntimeCapabilityIds, CURRENT_R04_REQUIRED);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds, []);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds, []);
    assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
    assert.deepEqual(mapping.undeliveredRequiredCapabilityIds, CURRENT_UNDELIVERED);
    for (const cap of mapping.requiredRuntimeCapabilityIds) if (contractOnlyIds.has(cap)) contractOnlyRequired.add(cap);
    const bound = preflight.runtimeCapabilityAuthority.perKnowledgePointMappings.find((row) => row.knowledgePointId === id);
    assert.deepEqual(bound, {
      knowledgePointId: mapping.knowledgePointId,
      mappingId: mapping.mappingId,
      primaryRuntimeProfileId: mapping.primaryRuntimeProfileId,
      requiredRuntimeCapabilityIds: mapping.requiredRuntimeCapabilityIds,
      optionalRuntimeCapabilityIds: mapping.optionalRuntimeCapabilityIds,
      forbiddenRuntimeCapabilityIds: mapping.forbiddenRuntimeCapabilityIds,
      runtimeCapabilityDeliveryState: mapping.runtimeCapabilityDeliveryState,
      undeliveredRequiredCapabilityIds: mapping.undeliveredRequiredCapabilityIds,
    });
  }
  assert.deepEqual([...contractOnlyRequired].sort(), [...preflight.runtimeCapabilityAuthority.contractOnlyRequiredCapabilityIdsFromCurrentR04].sort());
  assert.deepEqual(preflight.runtimeCapabilityAuthority.frozenQueueDependencyClosureCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds, FROZEN_CAPS);
  assert.equal(preflight.runtimeCapabilityAuthority.r02CategoryAlignedWithFrozenProfile, true);
  assert.equal(preflight.runtimeCapabilityAuthority.r04AuthorityTouched, false);
});

test("Q023 semantic scope is exactly conservation plus irregular-grid decomposition/completion and remains preflight-only", () => {
  assert.deepEqual(preflight.q023ScopeLock.includedKnowledgePointIds, TARGET_KPS);
  assert.equal(preflight.sourceConstraintReconciliation.cutTranslateRearrangeAreaConservationSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.noAdditionNoOverlapNoLossInvariantSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.irregularGridDecompositionSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.irregularGridCompletionSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.partialGridActualProportionCombinationSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.priorSquareCentimeterUnitAbsorbed, false);
  assert.equal(preflight.sourceConstraintReconciliation.priorAreaGridCountingAbsorbed, false);
  assert.equal(preflight.sourceConstraintReconciliation.samePerimeterAreaComparisonExpansion, false);
  for (const relation of [
    "SQUARE_CENTIMETER_UNIT_IDENTITY_AS_TARGET_KP",
    "BASIC_GRID_COUNTING_AS_TARGET_KP",
    "COMPARE_AREA_UNDER_SAME_PERIMETER",
    "RECTANGLE_AREA_FORMULA",
    "SQUARE_AREA_FORMULA",
    "PERIMETER_COMPUTATION",
    "REAL_WORLD_AREA_ESTIMATION",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q024_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q023ScopeLock.excludedRelations.includes(relation), relation);
  assert.equal(preflight.q023ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q023ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q023ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q023ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q023ScopeLock.r04AuthorityTouched, false);
  assert.equal(preflight.q023ScopeLock.q024OrLaterTouched, false);
});

test("Q023 predecessor D0 evidence is exact and the next task remains separately approved implementation", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 874);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "7d3f31bffe9386889d1994b0cbe3e3852f948c77");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId, "34457438488");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34457627044");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34457627030");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10144178845");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:d28f15a21e171a10705174103d10b2045d529cac9a01b2ee132879ab0bf4746f");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed, false);
  assert.equal(preflight.preflightValidationBoundary.productImplementationAllowed, false);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ023ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice023Implementation");
});
