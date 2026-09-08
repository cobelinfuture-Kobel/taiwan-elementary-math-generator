import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const contract = readJson("data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_06_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json");
const matrix = readJson("data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json");
const g4aU04 = readJson("data/curriculum/knowledge/units/g4a_u04_4a04.knowledge-operation.json");
const sourceCorpora = readJson("data/curriculum/application/reviews/PATH1_WORD_PROBLEM_SOURCE_CORPUS_ADDITION_V1.json");

const primaryKps = [
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

test("P1-06 preflight locks estimate/trial quotient as arithmetic strategy, not a new word-problem relation", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_06_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_06_ESTIMATE_TRIAL_QUOTIENT_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
  assert.equal(contract.newRelationMinted, false);
  assert.equal(contract.sourceBackedCapabilityFinding.distinctiveCapability, "ESTIMATE_AND_TRIAL_QUOTIENT_ARITHMETIC_STRATEGY");
  assert.equal(contract.sourceBackedCapabilityFinding.notANewRelation, true);
  assert.equal(contract.transferDecision.decision, "DO_NOT_ADMIT_GENERIC_WORD_PROBLEM_MODELING_TRANSFER_IN_P1_06_V1");
  assert.equal(contract.transferDecision.relationId, null);
  assert.equal(contract.transferDecision.wordProblemPracticeModePlanned, false);
  assert.equal(contract.transferDecision.p112AuthorityReused, false);
  assert.equal(contract.representationDecision.strategy, "PATH1_LOCAL_ESTIMATE_TRIAL_QUOTIENT_REPRESENTATION_LAYER");
  assert.deepEqual(contract.representationDecision.candidateLocalPatternSpecIds, [
    "P106_ESTIMATE_DIVISOR_TENS_SELECT",
    "P106_ESTIMATE_DIVISOR_TENS_FILL",
    "P106_ESTIMATE_THEN_DIVIDE_TENS_SUFFICIENT",
    "P106_ESTIMATE_THEN_DIVIDE_TENS_INSUFFICIENT",
  ]);
});

test("P1-06 matrix and G4A-U04 canonical authority remain exact and application-free", () => {
  const block = matrix.blocks.find((entry) => entry.blockId === "P1-06");
  assert.ok(block);
  assert.equal(block.title, "估商");
  assert.equal(block.blockType, "COMPOSITE_KP");
  assert.deepEqual(block.primaryKnowledgePointIds, primaryKps);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-05"]);
  assert.deepEqual(block.optionalSupportingKnowledgePointIds, ["kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor"]);
  assert.equal(block.patternExpansion.length, 1);
  assert.equal(block.patternExpansion[0].kind, "DESCRIPTIVE_DIFFICULTY_EXPANSION");
  assert.equal(block.patternExpansion[0].id, "estimate_trial_quotient");
  assert.deepEqual(block.masteryGate.requiredKnowledgePointIds, primaryKps);
  assert.deepEqual(block.masteryGate.requiredPatternIds, ["estimate_trial_quotient"]);

  const unitKps = new Map(g4aU04.knowledgePoints.map((entry) => [entry.knowledgePointId, entry]));
  for (const knowledgePointId of primaryKps) {
    const kp = unitKps.get(knowledgePointId);
    assert.ok(kp, knowledgePointId);
    assert.equal(kp.applicationCapability, "NOT_APPLICABLE");
    assert.equal(kp.existingApplicationQuestionCount, 0);
    assert.equal(kp.operationModels.length, 1);
    const model = kp.operationModels[0];
    assert.ok(model.numberConstraints.includes("100 <= dividend <= 999"));
    assert.ok(model.numberConstraints.includes("10 <= divisor <= 99"));
    assert.ok(model.validationInvariants.includes("quotient and remainder reconstruct dividend"));
    assert.ok(model.validationInvariants.includes("remainder is less than divisor"));
  }
});

test("P1-06 public arithmetic binding matches matrix authority and modeling mode remains unsupported during preflight", () => {
  const binding = getPath1PublicWorksheetBlock("P1-06");
  assert.ok(binding);
  assert.deepEqual([...binding.knowledgePointIds], primaryKps);
  assert.equal(contract.publicBindingReconciliation.status, "ALIGNED_NO_BINDING_DRIFT");
  assert.equal(contract.publicBindingReconciliation.publicBindingChangeRequired, false);

  const validBlockIds = matrix.blocks.filter((entry) => entry.blockId !== "P1-00").map((entry) => entry.blockId);
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-06",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(normalized.path1BlockId, "P1-06");
  assert.equal(normalized.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(normalized.warnings.some((entry) => entry.code === "PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
});

test("school-exam evidence supports estimate representation breadth while adjacent semantic boundaries remain excluded", () => {
  assert.deepEqual(contract.schoolExamEvidence.map((entry) => entry.fileId), [
    "17Xn_khLxO9AQfl5a4on07lf0SuvytvPg",
    "1WlXVM_G-gk_A9gvjof2j0C4cekL8umdw",
    "1knMV1ZIQ5dnUsfV28VuSbuZgBvLE1jrM",
  ]);
  const evidenceText = JSON.stringify(contract.schoolExamEvidence);
  assert.match(evidenceText, /38/);
  assert.match(evidenceText, /92/);
  assert.match(evidenceText, /11/);
  assert.match(evidenceText, /47/);
  assert.match(evidenceText, /P1-07/);
  assert.match(evidenceText, /remainder/);

  assert.equal(contract.boundaryWithAdjacentBlocks["P1-07"].includes("商的位值"), true);
  assert.equal(contract.boundaryWithAdjacentBlocks["P1-11"].includes("remainder"), true);
  assert.equal(contract.boundaryWithAdjacentBlocks["P1-12"].includes("inverse relation"), true);
});

test("rounding evidence stays source-bounded and does not silently resolve the divisor-ending-5 tie", () => {
  assert.deepEqual(contract.roundingEvidenceBoundary.observedExamples, [
    "11 -> 10",
    "38 -> 40",
    "47 -> 50",
    "92 -> 90",
  ]);
  assert.deepEqual(contract.roundingEvidenceBoundary.candidateEstimateRepresentationDivisorOnesDigits, [1,2,3,4,6,7,8,9]);
  assert.match(contract.roundingEvidenceBoundary.divisorsEndingInFive, /DEFER_TIE_CONVENTION/);
  assert.match(contract.roundingEvidenceBoundary.canonicalArithmeticDomainStillRemains, /10\.\.99/);
});

test("registered school and Li-teacher corpora are used only within their approved evidence roles", () => {
  const corpora = new Map(sourceCorpora.sourceCorpora.map((entry) => [entry.sourceCorpusId, entry]));
  const school = corpora.get("MULTI_SCHOOL_EXAM_CORPUS_G03_G09");
  const li = corpora.get("LI_TEACHER_MATH_THINKING_G1_G6");
  assert.ok(school);
  assert.ok(li);
  assert.ok(school.sourceRole.includes("MULTI_SCHOOL_BREADTH_EVIDENCE"));
  assert.ok(school.sourceRole.includes("MULTI_PUBLISHER_BREADTH_EVIDENCE"));
  assert.ok(li.sourceRole.includes("STRUCTURED_PROBLEM_SOLVING_PATTERN_EVIDENCE"));
  assert.equal(contract.liTeacherEvidence.directP106EstimateQuotientPatternWitnessFound, false);
  assert.equal(contract.liTeacherEvidence.newP106PatternAdmissionFromLiTeacher, false);
  assert.equal(contract.liTeacherEvidence.mustNotFabricateP106SpecificLiTeacherEvidence, true);
});

test("P1-06 preflight remains KP-focused and forbids full regression/global replay", () => {
  assert.equal(contract.validationPolicy.currentScope, "KP_LEAF");
  assert.equal(contract.validationPolicy.sharedExecutableChange, false);
  assert.equal(contract.validationPolicy.publicAuthorityCutover, false);
  assert.equal(contract.validationPolicy.legalRouteSemanticsChanged, false);
  assert.equal(contract.validationPolicy.affectedRoutes, "BOUNDED");
  assert.equal(contract.validationPolicy.derivedGate, "KP_FOCUSED");
  assert.equal(contract.validationPolicy.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validationPolicy.globalBrowserReplayRequired, false);
  assert.equal(contract.futureImplementationContract.implementationRequiresSeparateOperatorApproval, true);
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_IMPLEMENTATION_V1");
});
