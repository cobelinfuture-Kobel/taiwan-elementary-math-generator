import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/S60B_G5A_U08_KPPatternGroupTagContract.json",
  import.meta.url,
);

function loadContract() {
  return JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
}

test("S60B freezes 11 mathematical KPs and 17 explicit PatternGroups", () => {
  const contract = loadContract();
  const kpIds = contract.knowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = contract.patternGroups.map((row) => row.patternGroupId);

  assert.equal(contract.knowledgePoints.length, 11);
  assert.equal(contract.patternGroups.length, 17);
  assert.equal(new Set(kpIds).size, 11);
  assert.equal(new Set(groupIds).size, 17);

  for (const group of contract.patternGroups) {
    assert.equal(kpIds.includes(group.knowledgePointId), true, `${group.patternGroupId} has valid KP`);
    assert.equal(["numeric", "application", "reasoning"].includes(group.mode), true);
  }

  for (const kp of contract.knowledgePoints) {
    assert.ok(kp.definition.length > 20, `${kp.knowledgePointId} has a precise definition`);
    assert.ok(kp.patternGroupIds.length > 0, `${kp.knowledgePointId} owns a PatternGroup`);
    for (const groupId of kp.patternGroupIds) {
      assert.equal(groupIds.includes(groupId), true, `${groupId} exists`);
    }
  }
});

test("S60B canonical tags are unique and every KP tag is registered", () => {
  const contract = loadContract();
  const tags = contract.canonicalTags.map((row) => row.tag);

  assert.equal(tags.length, 37);
  assert.equal(new Set(tags).size, 37);
  for (const kp of contract.knowledgePoints) {
    for (const tag of kp.tags) {
      assert.equal(tags.includes(tag), true, `${tag} should be canonical`);
    }
  }
});

test("S60B keeps application, reasoning, N+1 and SDG outside KnowledgePoint identity", () => {
  const contract = loadContract();
  const names = contract.knowledgePoints.map((row) => row.displayName).join(" ");

  assert.equal(contract.layerPolicy.knowledgePoint, "mathematical_concept");
  assert.equal(contract.layerPolicy.patternGroup, "representation_and_task_mode");
  assert.equal(contract.layerPolicy.sdg, "semantic_context_taxonomy_only");
  assert.equal(contract.layerPolicy.nPlus1, "semantic_depth_property_only");
  assert.doesNotMatch(names, /應用題|SDG|多步驟情境/);
  assert.equal(contract.modePolicy.genericWordProblemKnowledgePointAllowed, false);
  assert.equal(contract.modePolicy.genericMultiStepKnowledgePointAllowed, false);
});

test("S60B gives application and reasoning groups the required downstream contracts", () => {
  const contract = loadContract();
  const modes = new Set(contract.patternGroups.map((row) => row.mode));

  assert.deepEqual([...modes].sort(), ["application", "numeric", "reasoning"]);
  assert.equal(contract.modePolicy.applicationRequiresTemplateFamily, true);
  assert.equal(contract.modePolicy.reasoningRequiresStructuredAnswerModel, true);

  const missingOperator = contract.knowledgePoints.find(
    (row) => row.knowledgePointId === "kp_g5a_u08_missing_operator_inference",
  );
  const equivalence = contract.knowledgePoints.find(
    (row) => row.knowledgePointId === "kp_g5a_u08_equivalence_error_judgement",
  );
  assert.ok(missingOperator.tags.includes("answer.operator_sequence"));
  assert.ok(equivalence.tags.includes("answer.equality_judgement"));
});
