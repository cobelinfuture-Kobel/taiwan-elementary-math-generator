import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildPath1ManualWorksheet } from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";
import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import { generateG4AU04DivisionQuestions } from "../../site/modules/curriculum/batch-a/g4a-u04-division-generator.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_GENERIC_ARITHMETIC_SMALL_COUNT_AND_KP_METADATA_REMEDIATION_PREFLIGHT_V1.validation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

test("P1-08 remediation preflight stays planning-only and locks both isolated blockers", () => {
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
});

test("small-count policy allows partial composite-KP coverage without weakening normal-count coverage", () => {
  const decision = contract.smallCountPolicyDecision;
  assert.equal(decision.decision, "ALLOW_PARTIAL_KP_COVERAGE_ONLY_WHEN_QUESTION_COUNT_IS_BELOW_SELECTED_KP_COUNT");
  assert.match(decision.fullCoverageRule, /questionCount >= selectedKnowledgePointCount/);
  assert.match(decision.smallCountRule, /do not fail/i);
  assert.match(decision.allocationRule, /deterministic seed-derived rotation/);
  assert.match(decision.normalCountPreservation, /7\/7\/6/);
  assert.match(decision.normalCountPreservation, /40\/40\/40/);
});

test("KP metadata ownership is locked to generic subplan normalization, not the G4A-U04 generator", () => {
  const decision = contract.knowledgePointMetadataDecision;
  assert.equal(decision.ownerLayer, "normalizeGeneratedQuestion in the generic Path1 builder");
  assert.deepEqual(decision.fallbackOrder, [
    "question.knowledgePointId",
    "question.metadata.knowledgePointId",
    "enclosingSubplanKnowledgePointId",
  ]);
  assert.equal(decision.generatorMutationRequired, false);
  assert.equal(decision.canonicalG4aU04GeneratorMutationAllowed, false);
  assert.equal(decision.topLevelKnowledgePointIdRequired, true);
});

test("current runtime witness proves count=1 is blocked by generic coverage policy while the canonical generator itself can generate one item", () => {
  const block = getPath1PublicWorksheetBlock("P1-08");
  assert.equal(block.knowledgePointIds.length, 3);

  const publicResult = buildPath1ManualWorksheet({
    blockId: "P1-08",
    questionCount: 1,
    generationSeed: "p108-remediation-preflight",
    practiceMode: "arithmetic",
  });
  assert.equal(publicResult.ok, false);
  assert.equal(publicResult.errors?.[0]?.code, "PATH1_QUESTION_COUNT_BELOW_KP_COVERAGE");

  const generatorResult = generateG4AU04DivisionQuestions({
    sourceId: "g4a_u04_4a04",
    questionCount: 1,
    generationSeed: "p108-remediation-preflight",
  });
  assert.equal(generatorResult.ok, true);
  assert.equal(generatorResult.questions.length, 1);
});

test("current generic P1-08 normalization still exposes the metadata gap at normal count", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-08",
    questionCount: 20,
    generationSeed: "path1-p1-08-generic-arithmetic-acceptance-v1",
    practiceMode: "arithmetic",
  });
  assert.equal(result.ok, true);
  const questions = result.worksheetDocument?.generatedQuestions ?? result.worksheetDocument?.questions ?? [];
  assert.equal(questions.length, 20);
  assert.ok(questions.some((question) => question.knowledgePointId == null));
});

test("future implementation is bounded shared runtime and does not request full regression or global replay", () => {
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
