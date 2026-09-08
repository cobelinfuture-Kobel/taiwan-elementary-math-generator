import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const registry = readJson("data/curriculum/application/reviews/PATH1_CLOUD_SOURCE_CORPUS_REGISTRY_V2.json");
const review = readJson("data/curriculum/application/reviews/PATH1_P1_05_P1_07_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json");
const matrix = readJson("data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json");
const p105 = readJson("data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json");
const p106 = readJson("data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_06_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json");

const byBlock = new Map(review.reconciliations.map((entry) => [entry.blockId, entry]));

test("cloud registry V2 makes learning maps, Li Teacher, and multi-school exams mandatory evidence lanes", () => {
  assert.equal(registry.status, "THREE_MANDATORY_CLOUD_EVIDENCE_LANES_REGISTERED");
  assert.deepEqual(registry.mandatoryEvidenceLanes.map((entry) => entry.sourceCorpusId), [
    "TAIWAN_G3_G6_LEARNING_MAPS",
    "LI_TEACHER_MATH_THINKING_G1_G6",
    "MULTI_SCHOOL_EXAM_CORPUS_G03_G09",
  ]);
  assert.equal(registry.mandatoryLaneEvaluationPolicy.allThreeLanesMustBeEvaluated, true);
  assert.equal(registry.mandatoryLaneEvaluationPolicy.omittingALaneWithoutExplicitNOT_APPLICABLEIsForbidden, true);
  assert.equal(registry.mandatoryEvidenceLanes[0].folderId, "1U_rxMOL4_m07Rx6EABCCd6KlBiJ6wzj6");
  assert.equal(registry.mandatoryEvidenceLanes[1].folderId, "1VHxb5jEkw_xP683wP528HEYFC-_zFIKk");
  assert.equal(registry.mandatoryEvidenceLanes[2].folderId, "1m8ljMOMb0ugFQCsC76Q1hX9UMRj0Hxpr");
});

test("reconciliation evaluates all three lanes for each P1-05 through P1-07 block", () => {
  assert.deepEqual([...byBlock.keys()], ["P1-05", "P1-06", "P1-07"]);
  for (const blockId of ["P1-05", "P1-06", "P1-07"]) {
    const entry = byBlock.get(blockId);
    assert.equal(entry.learningMapEvidence.sourceCorpusId, "TAIWAN_G3_G6_LEARNING_MAPS");
    assert.equal(entry.liTeacherEvidence.sourceCorpusId, "LI_TEACHER_MATH_THINKING_G1_G6");
    assert.equal(entry.schoolExamEvidence.sourceCorpusId, "MULTI_SCHOOL_EXAM_CORPUS_G03_G09");
    assert.ok(entry.learningMapEvidence.reviewedFileIds.length > 0);
    assert.ok(entry.liTeacherEvidence.reviewedFileIds.length > 0);
    assert.ok(entry.schoolExamEvidence.reviewedFileIds.length > 0);
  }
});

test("P1-05 records direct zero-middle arithmetic evidence without fabricating a direct zero-middle story witness", () => {
  const p = byBlock.get("P1-05");
  assert.equal(p.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
  assert.ok(p.schoolExamEvidence.reviewedFileIds.includes("1fgRK7y1SehP7Ztro2Z3XKCnV-kuwedqw"));
  assert.match(p.schoolExamEvidence.observedWitnessesOrNoWitnessReason.join("\n"), /304×6/);
  assert.match(p.schoolExamEvidence.observedWitnessesOrNoWitnessReason.join("\n"), /no reviewed item simultaneously binds/i);
  assert.equal(p.liTeacherEvidence.evidenceStatus, "STRUCTURAL_ONLY");
  assert.match(p.liTeacherEvidence.observedWitnessesOrNoWitnessReason.join("\n"), /总量÷份数＝1份数量/);
  assert.match(p.liTeacherEvidence.observedWitnessesOrNoWitnessReason.join("\n"), /1份数量×所占份数＝所求几份的数量/);
  assert.equal(p.reconciledFinding.runtimeChangeRequired, false);
});

test("P1-05 deployed modeling semantics remain the existing R03 zero-middle transfer", () => {
  assert.equal(p105.status, "P1_05_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(p105.relationAuthority.relationId, "R03_EQUAL_GROUPS");
  assert.equal(p105.arithmeticAuthority.knowledgePointId, "kp_g3a_u03_3digit_zero_middle_by_1digit");
  assert.equal(byBlock.get("P1-05").existingRuntimeDecision, "KEEP_CURRENT_ZERO_MIDDLE_R03_MODELING_TRANSFER_SEMANTICS");
});

test("P1-06 keeps direct exam-backed estimate evidence and explicitly records Li Teacher as no-direct-witness", () => {
  const p = byBlock.get("P1-06");
  assert.equal(p.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
  const schoolText = p.schoolExamEvidence.observedWitnessesOrNoWitnessReason.join("\n");
  assert.match(schoolText, /88÷37/);
  assert.match(schoolText, /54÷12/);
  assert.match(schoolText, /11→10/);
  assert.match(schoolText, /38→40/);
  assert.match(schoolText, /47→50/);
  assert.match(schoolText, /92→90/);
  assert.equal(p.liTeacherEvidence.evidenceStatus, "NO_DIRECT_WITNESS");
  assert.match(p.liTeacherEvidence.observedWitnessesOrNoWitnessReason.join("\n"), /No direct 估商/);
  assert.equal(p.reconciledFinding.modelingEvidenceStatus, "NO_ESTIMATE_SPECIFIC_WORD_PROBLEM_TRANSFER_SUPPORT");
  assert.equal(p.reconciledFinding.runtimeChangeRequired, false);
  assert.equal(p106.transferDecision.decision, "DO_NOT_ADMIT_GENERIC_WORD_PROBLEM_MODELING_TRANSFER_IN_P1_06_V1");
});

test("P1-07 cloud evidence includes recurring quotient-digit-count assessment surfaces", () => {
  const p = byBlock.get("P1-07");
  assert.equal(p.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
  assert.deepEqual(p.schoolExamEvidence.reviewedFileIds, [
    "1ZcSC_R_O-ffR4VdC8mT4o8r8m9D0zKHE",
    "1WlXVM_G-gk_A9gvjof2j0C4cekL8umdw",
    "1ZLTZRGPTIFlYe9hIZBelgb-niUc8h1jx",
  ]);
  const text = p.schoolExamEvidence.observedWitnessesOrNoWitnessReason.join("\n");
  assert.match(text, /573÷57/);
  assert.match(text, /302÷42/);
  assert.match(text, /□36÷78/);
  assert.equal(p.liTeacherEvidence.evidenceStatus, "NO_DIRECT_WITNESS");
});

test("P1-07 versus P1-08 boundary separates quotient-place semantics from two-digit-divisor execution", () => {
  const p = byBlock.get("P1-07");
  assert.equal(p.p107VsP108BoundaryDecision.semanticCapabilityOwner, "P1-07");
  assert.equal(p.p107VsP108BoundaryDecision.semanticCapability, "QUOTIENT_START_PLACE_AND_DIGIT_COUNT_CLASSIFICATION");
  assert.match(p.p107VsP108BoundaryDecision.canonicalP107PrimaryRuntimeEnvelope, /2-digit÷1-digit and 3-digit÷1-digit/);
  assert.match(p.p107VsP108BoundaryDecision.twoDigitDivisorExamSurfaceRole, /representation evidence only/i);
  assert.match(p.p107VsP108BoundaryDecision.p108Owner, /full two-digit-divisor arithmetic execution/i);
  assert.equal(p.reconciledFinding.preflightCorrectionRequired, true);
});

test("Path1 matrix authority is preserved while provenance is corrected", () => {
  const p107 = matrix.blocks.find((entry) => entry.blockId === "P1-07");
  const p108 = matrix.blocks.find((entry) => entry.blockId === "P1-08");
  assert.ok(p107);
  assert.ok(p108);
  assert.deepEqual(p107.primaryKnowledgePointIds, [
    "kp_g3b_u01_2digit_division_place_value_cases",
    "kp_g3b_u01_3digit_division_place_value_cases",
  ]);
  assert.deepEqual(p107.requiredPrerequisites.blockIds, ["P1-06"]);
  assert.deepEqual(p107.optionalSupportingKnowledgePointIds, ["kp_g3b_u01_quotient_zero_cases"]);
  assert.ok(p108.primaryKnowledgePointIds.includes("kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor"));
  assert.equal(review.runtimeChanged, false);
  assert.equal(review.path1MatrixChanged, false);
  assert.equal(review.canonicalKnowledgePointChanged, false);
  assert.equal(review.numericEnvelopeChanged, false);
});

test("distance closes provenance omission but requires P1-07 preflight repair before merge", () => {
  assert.equal(review.crossBlockFindings.learningMapWasPreviouslyOmittedFromPath1SupplementaryRegistry, true);
  assert.equal(review.crossBlockFindings.learningMapNowRegisteredInV2, true);
  assert.equal(review.crossBlockFindings.allThreeCloudLanesMandatoryGoingForward, true);
  assert.equal(review.crossBlockFindings.negativeEvidenceMustBeRecordedInsteadOfSilentlyOmitted, true);
  assert.equal(review.distance.goalDistanceAfter, "D2_P105_P106_PROVENANCE_RECONCILED_AND_P107_SOURCE_BOUNDARY_RESOLVED_PENDING_PREFLIGHT_REPAIR");
  assert.equal(review.distance.nextShortestStep, "PATH1_P1_07_PREFLIGHT_CLOUD_PROVENANCE_AND_VALIDATION_RECONCILIATION_V1");
});
