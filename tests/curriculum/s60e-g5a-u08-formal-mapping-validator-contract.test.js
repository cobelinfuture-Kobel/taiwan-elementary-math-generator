import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const MAPPING_PATH = new URL(
  "../../data/curriculum/mapping/S60E_G5A_U08_FormalMapping.json",
  import.meta.url,
);
const ANSWER_PATH = new URL(
  "../../data/curriculum/contracts/S60E_G5A_U08_AnswerModels.json",
  import.meta.url,
);
const VALIDATOR_PATH = new URL(
  "../../data/curriculum/contracts/S60E_G5A_U08_ValidatorContract.json",
  import.meta.url,
);
const KP_PATH = new URL(
  "../../data/curriculum/contracts/S60B_G5A_U08_KPPatternGroupTagContract.json",
  import.meta.url,
);
const TEMPLATE_PATH = new URL(
  "../../data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json",
  import.meta.url,
);

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

test("S60E defines 30 hidden PatternSpecs with expected mode distribution", () => {
  const mapping = readJson(MAPPING_PATH);
  const ids = mapping.patternSpecs.map((row) => row.patternSpecId);
  const counts = mapping.patternSpecs.reduce((acc, row) => {
    acc[row.mode] = (acc[row.mode] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(mapping.patternSpecs.length, 30);
  assert.equal(new Set(ids).size, 30);
  assert.deepEqual(counts, { numeric: 16, reasoning: 3, application: 11 });
  assert.equal(mapping.lifecycle.visibility, "hidden");
  assert.equal(mapping.lifecycle.canonicalRouting, false);
  assert.equal(mapping.lifecycle.productionUse, false);
});

test("S60E mapping references registered KPs, groups, templates and answer models", () => {
  const mapping = readJson(MAPPING_PATH);
  const kpContract = readJson(KP_PATH);
  const templateContract = readJson(TEMPLATE_PATH);
  const answerContract = readJson(ANSWER_PATH);
  const kpIds = new Set(kpContract.knowledgePoints.map((row) => row.knowledgePointId));
  const groupIds = new Set(kpContract.patternGroups.map((row) => row.patternGroupId));
  const templateIds = new Set(templateContract.templateFamilies.map((row) => row.templateFamilyId));
  const answerIds = new Set(answerContract.answerModels.map((row) => row.answerModelId));

  for (const spec of mapping.patternSpecs) {
    assert.equal(kpIds.has(spec.knowledgePointId), true, `${spec.patternSpecId} KP`);
    assert.equal(groupIds.has(spec.patternGroupId), true, `${spec.patternSpecId} group`);
    assert.equal(answerIds.has(spec.answerModelId), true, `${spec.patternSpecId} answer model`);
    assert.ok(spec.operandBounds && Object.keys(spec.operandBounds).length > 0);
    assert.ok(spec.requiredInvariants.length > 0);
    if (spec.mode === "application") {
      assert.equal(templateIds.has(spec.templateFamilyId), true, `${spec.patternSpecId} template`);
    } else {
      assert.equal(spec.templateFamilyId, undefined);
    }
  }
});

test("S60E N+1 specs have exactly one allowed delta and core specs never allow N+2", () => {
  const mapping = readJson(MAPPING_PATH);
  for (const spec of mapping.patternSpecs) {
    assert.equal(spec.allowedDepths.includes("N_PLUS_2"), false);
    if (spec.allowedDepths.length === 1 && spec.allowedDepths[0] === "N_PLUS_1") {
      assert.equal(spec.allowedSemanticDeltaIds.length, 1, `${spec.patternSpecId} delta count`);
    }
  }
  assert.equal(mapping.acceptance.allNPlus1SpecsHaveExactlyOneAllowedDelta, true);
});

test("S60E answer models support structural equivalence and challenge models stay non-core", () => {
  const answers = readJson(ANSWER_PATH);
  assert.equal(answers.answerModels.length, 8);
  assert.equal(answers.answerModels.filter((row) => row.core).length, 6);
  assert.equal(answers.answerModels.filter((row) => !row.core).length, 2);
  assert.equal(answers.equivalencePolicy.stringEqualityRequired, false);
  assert.equal(answers.equivalencePolicy.subtractionAssociative, false);
  assert.equal(answers.equivalencePolicy.divisionAssociative, false);
  assert.equal(answers.equivalencePolicy.divisionCommutative, false);
  assert.equal(answers.equivalencePolicy.coincidentalNumericEqualityWithoutSemanticValidityAccepted, false);
});

test("S60E validator contract is blocking, deterministic and fallback-free", () => {
  const validator = readJson(VALIDATOR_PATH);
  assert.equal(validator.blockingErrorCodes.length, 36);
  assert.equal(new Set(validator.blockingErrorCodes).size, 36);
  assert.equal(validator.warningCodes.length, 3);
  assert.equal(new Set(validator.warningCodes).size, 3);
  assert.equal(validator.validationStages.length, 6);
  assert.equal(validator.mutationRequirements.length, 20);
  assert.equal(validator.contracts.zeroOutputOnBlockingError, true);
  assert.equal(validator.contracts.genericFallbackAllowed, false);
  assert.equal(validator.contracts.numericCoincidenceOverridesSemanticFailure, false);
});
