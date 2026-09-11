import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import { W5_SLICE005_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import * as currentSelector from "../../site/modules/curriculum/registry/batch-a-selector-p05f26-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q027-g4b-u10-layered-cube-volume-conservation-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");

const SOURCE = "g4b_u10_4b10";
const TARGET_KPS = [
  "kp_g4b_u10_layered_cube_counting",
  "kp_g4b_u10_volume_conservation_rearrangement",
];
const EXISTING_PUBLIC_KPS = [
  "kp_g4b_u10_cubic_centimeter_unit",
  "kp_g4b_u10_unit_cube_counting",
];
const FUTURE_KP = "kp_g4b_u10_rectangular_prism_volume_structure";
const REQUIRED_W5 = [
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
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

test("Q027 preflight binds the exact frozen queue-position-27 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);

  const row = queue.queueEntries.find((entry) => entry.queuePosition === 27);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q027_r2_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice027Implementation");
  assert.equal(row.previousSliceId, "p05e_q026_r2_g4b_u07_4b07_profile_geometry_formula_c1");
  assert.equal(row.previousSliceMustBeD0Complete, true);
  assert.equal(row.assignedDeliveryWaveId, "R05-W5");
  assert.equal(row.primarySourceNodeId, SOURCE);
  assert.deepEqual(row.supportingSourceNodeIds, [SOURCE]);
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 2);
  assert.deepEqual(row.knowledgePointIds, TARGET_KPS);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.deepEqual(row.requiredProductNodes, REQUIRED_PRODUCT_NODES);
  assert.equal(row.admissionState, "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED");
  assert.equal(row.productProductionAdmitted, false);
  assert.equal(row.implementationAllowedByP05E, false);

  assert.equal(preflight.queueAuthority.queueVersion, queue.derivedRegistrySnapshot.queueVersion);
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  for (const key of [
    "sliceId",
    "implementationTaskId",
    "previousSliceId",
    "primarySourceNodeId",
    "intraWavePrerequisiteRank",
    "primaryRuntimeProfileId",
    "chunkIndex",
    "knowledgePointCount",
    "targetEvidenceLevel",
  ]) assert.deepEqual(preflight.queueAuthority[key], row[key], key);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, row.knowledgePointIds);
  assert.deepEqual([...preflight.queueAuthority.requiredW5CapabilityIds].sort(), [...row.requiredW5CapabilityIds].sort());
});

test("Q027 binds both exact R02 G4B-U10 candidates without pulling the future prism formula forward", () => {
  const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === SOURCE);
  assert.ok(source);
  assert.equal(source.sourceTitle, "立方公分與體積");
  assert.equal(source.sourcePdfTitle, "meow911_4b10_source.pdf");
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const expected = {
    kp_g4b_u10_layered_cube_counting: {
      canonicalNameZh: "分層計算體積",
      capabilityStatement: "學生能依每層方塊數與層數求總數。",
      reasoningInvariant: "總方塊數等於每層數量乘層數，缺角須逐層扣除。",
    },
    kp_g4b_u10_volume_conservation_rearrangement: {
      canonicalNameZh: "立體重組與體積守恆",
      capabilityStatement: "學生能判斷相同方塊重組後體積不變。",
      reasoningInvariant: "未增減單位立方體時，外形改變不影響總體積。",
    },
  };

  for (const id of TARGET_KPS) {
    const candidate = source.candidates.find((row) => row.knowledgePointId === id);
    const bound = preflight.r02ReviewedCandidateAuthority.knowledgePoints.find((row) => row.knowledgePointId === id);
    assert.ok(candidate, id);
    assert.ok(bound, id);
    assert.equal(candidate.canonicalNameZh, expected[id].canonicalNameZh);
    assert.equal(candidate.capabilityStatement, expected[id].capabilityStatement);
    assert.equal(candidate.reasoningInvariant, expected[id].reasoningInvariant);
    assert.deepEqual(candidate.evidencePages, [1, 2]);
    assert.equal(candidate.category, "geometry");
    assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");
    assert.equal(bound.canonicalNameZh, candidate.canonicalNameZh);
    assert.equal(bound.capabilityStatement, candidate.capabilityStatement);
    assert.equal(bound.reasoningInvariant, candidate.reasoningInvariant);
    assert.deepEqual(bound.evidencePages, candidate.evidencePages);
  }

  assert.ok(source.candidates.some((row) => row.knowledgePointId === FUTURE_KP));
  assert.deepEqual(preflight.q027ScopeLock.excludedKnowledgePointIdsFromSameSource, [FUTURE_KP]);
});

test("Q027 exact PDF visual readback supports layered counting and conservation while excluding the prism formula", () => {
  const page1 = preflight.sourceAuthority.directVisualEvidence.page1;
  for (const concept of [
    "COUNT_CUBES_BY_LAYER",
    "MULTIPLY_EQUAL_LAYER_COUNT_BY_LAYER_NUMBER",
    "SUM_UNEQUAL_LAYER_COUNTS",
    "ACCOUNT_FOR_HIDDEN_OR_MISSING_CUBES_BY_LAYER",
    "VOLUME_CONSERVATION_UNDER_RESHAPING_OR_REARRANGEMENT",
    "NO_GAIN_OR_LOSS_MEANS_TOTAL_VOLUME_UNCHANGED",
  ]) assert.ok(page1.directlySupportedConcepts.includes(concept), concept);

  assert.equal(preflight.sourceConstraintReconciliation.layeredEqualHeightCountingSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.layeredUnequalHeightCountingSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.hiddenLowerCubeAccountingSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.volumeConservationUnderReshapingSupported, true);
  assert.equal(preflight.sourceConstraintReconciliation.rectangularPrismFormulaExpansion, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowed, false);
  assert.ok(preflight.sourceAuthority.directVisualEvidence.page2.useRestriction.includes("not admitted into Q027"));
});

test("Q027 reuses the already verified G4B-U10 source identity with no source-ref ambiguity", () => {
  assert.equal(preflight.sourceAuthority.sourceNodeId, SOURCE);
  assert.equal(preflight.sourceAuthority.sourcePdfTitle, "meow911_4b10_source.pdf");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, "1WvktYZkvxrWVdzPr68Z8GNauosbF2POG");
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, "1D0tFC88EPUmyAFhhlljuho_PZIAoZNsZ");
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, "1-Glky7Y0RnnmiY7lQ68x2jJnYYOdFKSZ");
  assert.equal(preflight.sourceAuthority.sourceUrlFromMetadata, "https://meow911.com/4b10/");
  assert.equal(preflight.sourceAuthority.embeddedHeaderUrlFromPdf, "https://meow911.com/4b10/");
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sameSourceNodeConfirmed, true);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.samePdfIdentityConfirmed, true);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved, false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
});

test("Q027 binds current R04 spatial-solid profile and exact frozen W5 capability closure", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  for (const id of TARGET_KPS) {
    const mapping = r04.getMapping(id);
    assert.ok(mapping, id);
    assert.equal(mapping.mappingId, `r04map_${id.slice(3)}`);
    assert.equal(mapping.primaryRuntimeProfileId, "profile_spatial_solid");
    assert.equal(mapping.classificationRuleId, "rule_spatial_solid");
    assert.deepEqual(mapping.appliedModifierIds, []);
    for (const requiredId of [
      "cap_spatial_solid_reasoning",
      "cap_geometry_domain_validator",
      "cap_solid_geometry_representation",
    ]) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(requiredId), `${id}:${requiredId}`);
  }
  assert.deepEqual(preflight.runtimeCapabilityAuthority.profileRequiredCapabilityIds, [
    "cap_spatial_solid_reasoning",
    "cap_geometry_domain_validator",
    "cap_solid_geometry_representation",
  ]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(preflight.runtimeCapabilityAuthority.r04AuthorityTouched, false);
});

test("Q027 predecessor is pinned to exact Q026 E6 D0 evidence", () => {
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber, 884);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha, "7dd33a194123f451319f78541462c411d408fe67");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId, "34545692980");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId, "34545798829");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId, "34545798846");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId, "10178969240");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest, "sha256:e38dd4c2eca74deeb467d6b485a719130768d15e2ab8c8c8e5d2fe6e2549529e");
  assert.equal(preflight.previousSliceD0Evidence.status, "PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesWorkflowConclusion, "success");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesEvidenceUploaded, true);
});

test("Q027 public preflight preserves existing same-source products and needs no new source catalog admission", () => {
  assert.equal(W5_SLICE005_PUBLIC_SOURCE_UNITS[0].sourceId, SOURCE);
  const availability = currentSelector.listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.equal(availability.sourceId, SOURCE);
  for (const id of EXISTING_PUBLIC_KPS) {
    assert.ok(availability.visibleKnowledgePointIds.includes(id), id);
    assert.ok(currentSelector.getVisibleBatchAKnowledgePoint(id), id);
  }
  for (const id of [...TARGET_KPS, FUTURE_KP]) {
    assert.ok(availability.hiddenPendingKnowledgePointIds.includes(id), id);
    assert.ok(availability.notSelectableKnowledgePointIds.includes(id), id);
    assert.equal(currentSelector.getVisibleBatchAKnowledgePoint(id), null, id);
  }
  assert.equal(preflight.publicPreflightBaseline.sourceAlreadyAdmitted, true);
  assert.equal(preflight.publicPreflightBaseline.sourceCatalogAdmissionNeededForQ027, false);
  assert.deepEqual(preflight.publicPreflightBaseline.existingPublicSameSourceKnowledgePointIds, EXISTING_PUBLIC_KPS);
  assert.deepEqual(preflight.publicPreflightBaseline.targetKnowledgePointIds, TARGET_KPS);
  assert.deepEqual(preflight.publicPreflightBaseline.remainingFutureSameSourceKnowledgePointIds, [FUTURE_KP]);
  assert.equal(preflight.publicPreflightBaseline.publicCutoverPerformedByThisPreflight, false);
});

test("Q027 remains planning-only and blocks sibling, application, ownership-transfer, and Q028+ expansion", () => {
  assert.deepEqual(preflight.q027ScopeLock.includedKnowledgePointIds, TARGET_KPS);
  for (const relation of [
    "COUNT_CUBES_BY_LAYER",
    "MULTIPLY_EQUAL_LAYER_COUNT_BY_LAYER_NUMBER",
    "SUM_UNEQUAL_LAYER_COUNTS",
    "ACCOUNT_FOR_HIDDEN_OR_MISSING_CUBES_BY_LAYER",
    "PRESERVE_VOLUME_UNDER_RESHAPING_OR_REARRANGEMENT",
    "PRESERVE_VOLUME_WHEN_NO_UNIT_CUBES_ARE_ADDED_OR_REMOVED",
  ]) assert.ok(preflight.q027ScopeLock.includedRelations.includes(relation), relation);
  assert.deepEqual(preflight.q027ScopeLock.protectedExistingSameSourceKnowledgePointIds, EXISTING_PUBLIC_KPS);
  assert.equal(preflight.q027ScopeLock.q005SemanticsMustRemainUnchanged, true);
  assert.equal(preflight.q027ScopeLock.q014SemanticsMustRemainUnchanged, true);
  assert.equal(preflight.q027ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q027ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q027ScopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q027ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q027ScopeLock.r02AuthorityTouched, false);
  assert.equal(preflight.q027ScopeLock.r04AuthorityTouched, false);
  assert.equal(preflight.q027ScopeLock.q028OrLaterTouched, false);
  assert.equal(preflight.implementationContractLock.sourceCatalogMutationRequired, false);
  assert.equal(preflight.implementationContractLock.sourceUnitOwnershipTransferAllowed, false);
  assert.equal(preflight.validationBoundary.fullRepositoryRegression, "FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(preflight.validationBoundary.globalBrowserReplay, "FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice027Implementation");
  assert.equal(preflight.policyBoundary.planningOnly, true);
  assert.equal(preflight.policyBoundary.implementationPerformed, false);
});
