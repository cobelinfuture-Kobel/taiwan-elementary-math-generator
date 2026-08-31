import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { listP04EW4DirectProductVerticalSlices } from "../../src/curriculum/full-product/p04e-w4-direct-product-vertical-slice-queue.mjs";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));

const authority = read("data/curriculum/full-product/p04f/slice034-g5a-u06-measurement-difference-context-preflight-authority.json");
const queueRegistry = read("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const evidenceInventory = read("data/curriculum/application/evidence/w02-source13-pdf-evidence-inventory.json");
const knowledgeOperation = read("data/curriculum/knowledge/units/g5a_u06_5a06.knowledge-operation.json");
const canonicalOperation = read("data/curriculum/application/operations/w02/g5a_u06_5a06.canonical-operation.json");
const hiddenPatternSpec = read("data/curriculum/application/pattern-specs/w02/g5a_u06_5a06.hidden-pattern-spec.json");

const TARGET_KP = "kp_g5a_u06_measurement_difference_context";
const TARGET_SLICE = "p04e_q034_r9_g5a_u06_5a06_profile_quantity_measurement_c1";
const FUTURE_SLICE_IDS = [
  "p04e_q035_r9_g6a_u02_6a02_profile_fraction_c1",
  "p04e_q036_r10_g6a_u02_6a02_profile_fraction_c1",
  "p04e_q037_r11_g6a_u02_6a02_profile_fraction_c1",
];
const APPLICATION_SPECS = [
  "ps_g5a_u06_measurement_difference_context_total_application",
  "ps_g5a_u06_measurement_difference_context_original_application",
  "ps_g5a_u06_measurement_difference_context_difference_application",
].sort();
const NUMERIC_SPECS = [
  "ps_g5a_u06_measurement_difference_context_total_numeric",
  "ps_g5a_u06_measurement_difference_context_original_numeric",
  "ps_g5a_u06_measurement_difference_context_difference_numeric",
].sort();

const queueEntries = listP04EW4DirectProductVerticalSlices();
const queueEntry = queueEntries.find((row) => row.queuePosition === 34);
const evidenceRecord = evidenceInventory.records.find((row) => row.sourceNodeId === "g5a_u06_5a06");
const knowledgePoint = knowledgeOperation.candidates.find((row) => row.knowledgePointId === TARGET_KP || row.candidateId === TARGET_KP);
const canonicalKnowledgePoint = canonicalOperation.knowledgePoints.find((row) => row.knowledgePointId === TARGET_KP);
const hiddenKnowledgePoint = hiddenPatternSpec.knowledgePoints.find((row) => row.knowledgePointId === TARGET_KP);

test("q034 frozen P04E queue identity is exact and is not inferred from P03F Slice034", () => {
  assert.ok(queueEntry);
  assert.equal(queueEntry.sliceId, TARGET_SLICE);
  assert.equal(queueRegistry.orderedSliceIds[33], TARGET_SLICE);
  assert.equal(queueEntry.primarySourceNodeId, "g5a_u06_5a06");
  assert.equal(queueEntry.intraWavePrerequisiteRank, 9);
  assert.equal(queueEntry.primaryRuntimeProfileId, "profile_quantity_measurement");
  assert.deepEqual([...queueEntry.knowledgePointIds], [TARGET_KP]);
  assert.equal(queueRegistry.orderedKnowledgePointIds[47], TARGET_KP);
  assert.equal(queueEntry.previousSliceId, "p04e_q033_r8_g6a_u02_6a02_profile_fraction_c1");
  assert.deepEqual(queueEntries.slice(34, 37).map((row) => row.sliceId), FUTURE_SLICE_IDS);

  assert.equal(authority.queue.queuePosition, 34);
  assert.equal(authority.queue.sliceId, TARGET_SLICE);
  assert.deepEqual(authority.queue.knowledgePointIds, [TARGET_KP]);
});

test("q034 current source authority is hash-locked and full-page reviewed", () => {
  assert.ok(evidenceRecord);
  assert.equal(evidenceRecord.sourcePdfDriveFileId, "1E6TqH-QfF7UMiSgUL1hl5_luge50rPy3");
  assert.equal(evidenceRecord.sourcePdfFileName, "meow911_5a06_source.pdf");
  assert.equal(evidenceRecord.sha256, "670d4916c1627177cbd483942b5829fb4dab3dc622fc832b9f2a7abba2e30f83");
  assert.equal(evidenceRecord.pageCount, 2);
  assert.equal(evidenceRecord.textLayerAvailable, true);
  assert.equal(evidenceRecord.firstPageRenderAvailable, true);

  assert.equal(authority.sourceAuthority.driveFileId, evidenceRecord.sourcePdfDriveFileId);
  assert.equal(authority.sourceAuthority.sourceSha256, evidenceRecord.sha256);
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(authority.sourceAuthority.sourceTitle, "異分母分數加減");
});

test("q034 exact KnowledgePoint and canonical operation model are source-backed", () => {
  assert.ok(knowledgePoint);
  assert.equal(knowledgePoint.knowledgePointName, "異分母測量量的合併與差");
  assert.equal(knowledgePoint.scope, "由兩段長度或份量求合計、較長量或差量。");
  assert.deepEqual(knowledgePoint.evidencePages, [1, 2]);
  assert.equal(knowledgePoint.applicationClassification, "APPLICATION_REQUIRED");

  assert.ok(canonicalKnowledgePoint);
  assert.equal(canonicalKnowledgePoint.operationModels[0].modelId, "op_g5a_u06_measurement_difference_context");
  assert.equal(canonicalKnowledgePoint.operationModels[0].operationFamilyId, "fraction_context_total");
  assert.deepEqual(canonicalKnowledgePoint.operationModels[0].canonicalExpressions, [
    "total = firstQuantity + secondQuantity",
    "original = used + remaining",
    "difference = larger - smaller",
  ]);
  assert.deepEqual(canonicalKnowledgePoint.operationModels[0].unknownRoles, ["total", "original", "difference"]);
  assert.equal(canonicalKnowledgePoint.operationModels[0].answerType, "fraction_measure");
});

test("q034 preflight preserves application-required surface and keeps structural numeric specs hidden", () => {
  assert.ok(hiddenKnowledgePoint);
  assert.equal(hiddenKnowledgePoint.applicationClassification, "APPLICATION_REQUIRED");
  const applicationSpecs = hiddenKnowledgePoint.patternSpecs.filter((row) => row.mode === "APPLICATION");
  const numericSpecs = hiddenKnowledgePoint.patternSpecs.filter((row) => row.mode === "NUMERIC");
  assert.deepEqual(applicationSpecs.map((row) => row.patternSpecId).sort(), APPLICATION_SPECS);
  assert.deepEqual(numericSpecs.map((row) => row.patternSpecId).sort(), NUMERIC_SPECS);

  for (const spec of applicationSpecs) {
    assert.equal(spec.presentationContract.contextRequired, true);
    assert.equal(spec.presentationContract.contextBindingState, "PENDING_GLOBAL_ATOMIC_EPISODE_BINDING");
    assert.equal(spec.lifecycle.selectorVisibility, "hidden");
    assert.equal(spec.lifecycle.generatorStatus, "not_implemented");
    assert.equal(spec.lifecycle.canonicalRouting, "disabled");
    assert.equal(spec.lifecycle.productionUse, "forbidden");
  }
  for (const spec of numericSpecs) {
    assert.equal(spec.presentationContract.contextRequired, false);
    assert.equal(spec.lifecycle.selectorVisibility, "hidden");
    assert.equal(spec.lifecycle.productionUse, "forbidden");
  }

  assert.deepEqual([...authority.patternSurfacePlan.publicImplementationCandidatePatternSpecIds].sort(), APPLICATION_SPECS);
  assert.deepEqual([...authority.patternSurfacePlan.structuralNumericPatternSpecIdsRemainHidden].sort(), NUMERIC_SPECS);
  assert.equal(authority.patternSurfacePlan.globalContextExpansionAllowedInPreflight, false);
});

test("q034 FormalMapping candidate mirrors the exact source operation without falsely reusing q024", () => {
  const mapping = authority.formalMapping;
  assert.equal(mapping.knowledgePointId, TARGET_KP);
  assert.equal(mapping.classification, "SOURCE_BACKED_MULTI_TARGET_RELATION_CANDIDATE");
  assert.equal(mapping.relationFamilyId, "FRACTION_MEASUREMENT_QUANTITY_RELATION");
  assert.equal(mapping.sourceOperationModelId, canonicalKnowledgePoint.operationModels[0].modelId);
  assert.equal(mapping.sourceOperationFamilyId, canonicalKnowledgePoint.operationModels[0].operationFamilyId);
  assert.deepEqual(mapping.relationVariants.map((row) => row.canonicalExpression), canonicalKnowledgePoint.operationModels[0].canonicalExpressions);
  assert.deepEqual(mapping.relationVariants.map((row) => row.variantId), [
    "JOIN_TOTAL",
    "PART_WHOLE_RECONSTRUCTION",
    "COMPARISON_DIFFERENCE",
  ]);
  assert.equal(mapping.invariants.commonMeasurementUnitRequiredBeforeArithmetic, true);
  assert.equal(mapping.invariants.exactRationalArithmeticRequired, true);
  assert.equal(mapping.invariants.measurementUnitConsistencyRequired, true);
  assert.equal(mapping.invariants.roundingAllowed, false);
  assert.equal(authority.reconciliation.q024FractionOfQuantityRelationReused, false);
  assert.equal(authority.reconciliation.p02eQuantitySemanticRolePolicyTreatedAsExactFormalMapping, false);
  assert.equal(authority.reconciliation.sourceBackedCanonicalOperationReused, true);
});

test("q034 remains planning-only and preserves q035-q037 boundaries", () => {
  const boundary = authority.boundary;
  assert.equal(boundary.planningOnly, true);
  assert.equal(boundary.patternSpecLifecyclePromoted, false);
  assert.equal(boundary.generatorMaterialized, false);
  assert.equal(boundary.validatorMaterialized, false);
  assert.equal(boundary.selectorPromoted, false);
  assert.equal(boundary.worksheetEnabled, false);
  assert.equal(boundary.globalContextRegistryModified, false);
  assert.equal(boundary.q035Touched, false);
  assert.equal(boundary.q036Touched, false);
  assert.equal(boundary.q037Touched, false);
  assert.equal(boundary.implementationApprovalRequired, true);
});
