import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import { generateG4AU04DivisionQuestions } from "../../site/modules/curriculum/batch-a/g4a-u04-division-generator.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_IMPLEMENTATION_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.validation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

function generatedQuestions(result) {
  return result?.worksheetDocument?.generatedQuestions
    ?? result?.worksheetDocument?.questions
    ?? result?.worksheetDocument?.questionItems
    ?? [];
}

test("P1-08 remediation preflight remains immutable historical planning evidence", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1");
  assert.equal(contract.operatorScope, "APPROVED_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.deepEqual(
    contract.confirmedBlockers.map((entry) => entry.id),
    [
      "P108_GENERIC_ARITHMETIC_COUNT1_KP_COVERAGE_CONFLICT",
      "P108_RUNTIME_KP_METADATA_NOT_EMITTED",
    ],
  );
  assert.equal(implementation.taskId, contract.futureImplementationBoundary.taskId);
});

test("preflight small-count decision is exactly the policy implemented by the approved implementation", () => {
  const decision = contract.smallCountPolicyDecision;
  assert.equal(decision.decision, "ALLOW_PARTIAL_KP_COVERAGE_ONLY_WHEN_QUESTION_COUNT_IS_BELOW_SELECTED_KP_COUNT");
  assert.match(decision.fullCoverageRule, /questionCount >= selectedKnowledgePointCount/);
  assert.match(decision.smallCountRule, /do not fail/i);
  assert.match(decision.allocationRule, /deterministic seed-derived rotation/);
  assert.match(decision.normalCountPreservation, /7\/7\/6/);
  assert.match(decision.normalCountPreservation, /40\/40\/40/);
  assert.equal(implementation.implementation.smallCountPolicyId, decision.policyId);
});

test("preflight KP metadata ownership remains generic subplan normalization rather than the G4A-U04 generator", () => {
  const decision = contract.knowledgePointMetadataDecision;
  assert.equal(decision.ownerLayer, "normalizeGeneratedQuestion in the generic Path1 builder");
  assert.deepEqual(decision.fallbackOrder, [
    "question.knowledgePointId",
    "question.metadata.knowledgePointId",
    "enclosingSubplanKnowledgePointId",
  ]);
  assert.equal(decision.generatorMutationRequired, false);
  assert.equal(decision.canonicalG4aU04GeneratorMutationAllowed, false);
  assert.deepEqual(implementation.implementation.knowledgePointIdFallbackOrder, decision.fallbackOrder);
});

test("current runtime realizes the preflight count=1 decision while canonical G4A-U04 generator remains independently capable", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.deepEqual(block.knowledgePointIds, PRIMARY_KPS);

  const publicResult = buildPath1ManualWorksheet({
    blockId: "P1-08",
    questionCount: 1,
    generationSeed: "p108-remediation-preflight-transition",
    practiceMode: "arithmetic",
  });
  assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors ?? []));
  const publicQuestions = generatedQuestions(publicResult);
  assert.equal(publicQuestions.length, 1);
  assert.equal(PRIMARY_KPS.includes(publicQuestions[0].knowledgePointId), true);

  const generatorResult = generateG4AU04DivisionQuestions({
    sourceId: "g4a_u04_4a04",
    questionCount: 1,
    generationSeed: "p108-remediation-preflight-transition",
  });
  assert.equal(generatorResult.ok, true);
  assert.equal(generatorResult.questions.length, 1);
});

test("current normal-count generic output now carries exact non-null KP metadata", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    questionCount: 20,
    generationSeed: "path1-p1-08-generic-arithmetic-acceptance-v1",
    practiceMode: "arithmetic",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  const questions = generatedQuestions(result);
  assert.equal(questions.length, 20);
  assert.equal(questions.every((question) => PRIMARY_KPS.includes(question.knowledgePointId)), true);
});

test("historical preflight validation classification remains bounded and never requested full regression or global replay", () => {
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.changeImpact.sharedExecutableChange, false);
  assert.equal(impact.futureImplementationImpact.currentScope, "SHARED_RUNTIME");
  assert.equal(impact.futureImplementationImpact.sharedExecutableChange, true);
  assert.equal(impact.futureImplementationImpact.affectedRoutes, "BOUNDED");
  assert.equal(impact.futureImplementationImpact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.futureImplementationImpact.fullRepositoryRegressionRequired, false);
  assert.equal(impact.futureImplementationImpact.globalBrowserReplayRequired, false);

  const lane = plan.lanes.KP_FOCUSED;
  assert.deepEqual(lane.map((entry) => entry.gateId), [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS",
  ]);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
});
