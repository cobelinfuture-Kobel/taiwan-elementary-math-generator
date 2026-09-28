import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const candidate = readJson("data/curriculum/contracts/G4A_U04_ExamDerived_LongDivisionStepReconstructionCandidate.json");
const contract = readJson("data/curriculum/contracts/G4A_U04_LongDivisionStepReconstruction_PatternSpecContract.json");
const unit = readJson("data/curriculum/knowledge/units/g4a_u04_4a04.knowledge-operation.json");

const EXPECTED_GROUP_IDS = [
  "G1_STEP_SEQUENCE_ORDERING",
  "G2_WHOLE_EXPRESSION_RECONSTRUCTION",
  "G3_INTERMEDIATE_STEP_IDENTIFICATION",
  "G4_ERROR_DIAGNOSIS",
  "G5_COMPOSITE_2SUB",
  "G6_FILL_IN_RECONSTRUCTION",
];

const EXPECTED_KP_IDS = [
  "kp_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_exact",
];

test("G4A-U04 human review freezes exactly G1-G6 including fill-in", () => {
  assert.equal(candidate.questionGroupReview.status, "OPERATOR_APPROVED");
  assert.equal(candidate.questionGroupReview.operatorDecision, "KEEP_ALL_PROPOSED_GROUPS_AND_ADD_FILL_IN");
  assert.deepEqual(
    candidate.questionGroupReview.approvedQuestionGroups.map((group) => group.questionGroupId),
    EXPECTED_GROUP_IDS,
  );
  assert.equal(candidate.questionGroupReview.fillInPolicy.allowed, true);
});

test("PatternSpec design contract preserves existing KP authority and runtime boundary", () => {
  assert.equal(contract.status, "OPERATOR_APPROVED_DESIGN_CONTRACT_NOT_RUNTIME");
  assert.equal(contract.canonicalKnowledgePointPolicy.createNewKnowledgePoint, false);
  assert.deepEqual(contract.canonicalKnowledgePointPolicy.bindsExistingKnowledgePoints, EXPECTED_KP_IDS);
  assert.equal(unit.knowledgePoints.length, 7);
  for (const kpId of EXPECTED_KP_IDS) {
    assert.ok(unit.knowledgePoints.some((kp) => kp.knowledgePointId === kpId), kpId);
  }
  assert.equal(contract.runtimeGate.generatorImplementation, "forbidden_in_this_contract_task");
  assert.equal(contract.runtimeGate.validatorImplementation, "forbidden_in_this_contract_task");
  assert.equal(contract.runtimeGate.selectorExposure, "forbidden");
  assert.equal(contract.runtimeGate.productionUse, "forbidden");
});

test("G5 remains two independently scored subitems and G6 remains trace-based fill-in", () => {
  const g5 = contract.approvedQuestionGroups.find((group) => group.id === "G5_COMPOSITE_2SUB");
  const g6 = contract.approvedQuestionGroups.find((group) => group.id === "G6_FILL_IN_RECONSTRUCTION");
  assert.ok(g5);
  assert.equal(g5.maxSubitems, 2);
  assert.equal(g5.subitems.length, 2);
  assert.equal(g5.scoringPolicy, "independent_subitem_scoring");
  assert.equal(g5.answerDependency, "forbidden");
  assert.deepEqual(g5.subitems.map((item) => item.uses), [
    "G1_STEP_SEQUENCE_ORDERING",
    "G2_WHOLE_EXPRESSION_RECONSTRUCTION",
  ]);
  assert.ok(g6);
  assert.equal(g6.answerModel, "structured_fill_in");
  assert.ok(g6.allowedBlankTargets.includes("place_value_conversion"));
  assert.ok(g6.allowedBlankTargets.includes("whole_expression_quotient"));
  assert.ok(g6.guardrails.includes("fill-in must remain trace-based"));
});

test("unique-answer and misconception constraints stay explicit", () => {
  assert.equal(
    contract.distractorAndMisconceptionPolicy.uniquenessRule,
    "exactly_one_accepted_answer_or_answer_tuple_per_subitem",
  );
  assert.ok(contract.distractorAndMisconceptionPolicy.misconceptionFamilies.includes(
    "INTERMEDIATE_STEP_AS_WHOLE_EXPRESSION",
  ));
  assert.ok(contract.distractorAndMisconceptionPolicy.misconceptionFamilies.includes(
    "ARITHMETICALLY_TRUE_BUT_PROCESS_MISMATCH",
  ));
});
