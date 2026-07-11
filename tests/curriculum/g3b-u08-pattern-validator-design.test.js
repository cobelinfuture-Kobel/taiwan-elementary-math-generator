import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapping = JSON.parse(
  readFileSync("data/curriculum/mapping/S58B_G3B_U08_FormalMappingDesign.json", "utf8")
);
const schema = JSON.parse(
  readFileSync("data/curriculum/contracts/S58B_G3B_U08_PatternSpecSchema.json", "utf8")
);
const validator = JSON.parse(
  readFileSync("data/curriculum/contracts/S58B_G3B_U08_SemanticValidationContract.json", "utf8")
);
const freeze = JSON.parse(
  readFileSync("data/curriculum/contracts/S58A1_G3B_U08_24FamilyHumanReadbackFreeze.json", "utf8")
);

test("S58B maps six KPs to six PatternGroups and 24 future PatternSpecs", () => {
  assert.equal(mapping.patternGroups.length, 6);
  assert.equal(mapping.mappingPolicy.patternGroupCount, 6);
  assert.equal(mapping.mappingPolicy.familyCount, 24);
  assert.equal(mapping.mappingPolicy.patternSpecCount, 24);
  assert.equal(mapping.mappingPolicy.oneFamilyPerPatternSpec, true);
  assert.equal(
    mapping.patternGroups.reduce((sum, group) => sum + group.familyCount, 0),
    24
  );
  assert.equal(freeze.acceptedFamilyCount, 24);
});

test("S58B defines three answer models with a unique comparison winner", () => {
  assert.deepEqual(
    new Set(Object.keys(mapping.answerModels)),
    new Set([
      "answer_single_integer_with_unit",
      "answer_estimation_judgment_with_reason",
      "answer_same_price_comparison"
    ])
  );
  assert.equal(mapping.answerModels.answer_same_price_comparison.tieAllowed, false);
  assert.deepEqual(
    mapping.answerModels.answer_same_price_comparison.allowedWinnerValues,
    ["option_a", "option_b"]
  );
});

test("S58B PatternSpec schema keeps hidden horizontal-only lifecycle", () => {
  assert.equal(schema.cardinality.requiredPatternSpecCount, 24);
  assert.equal(schema.cardinality.oneFamilyPerPatternSpec, true);
  assert.equal(schema.fixedValues.kind, "g3bU08SemanticApplication");
  assert.equal(schema.fixedValues.representation, "horizontal_only");
  assert.equal(schema.fixedValues.selectorVisibility, "hidden");
  assert.equal(schema.fixedValues.productionUse, "forbidden");
  assert.equal(schema.fixedValues.freeFormAIGeneration, "forbidden");
  assert.equal(schema.requiredLifecycle.materialization, "hidden_not_routed");
});

test("S58B preserves the prior Batch A numeric boundary", () => {
  assert.deepEqual(mapping.sharedNumericBoundary.multiplicationCalculatedShapes, [
    "1digit_x_1digit",
    "2digit_x_1digit",
    "3digit_x_1digit"
  ]);
  assert.deepEqual(mapping.sharedNumericBoundary.divisionCalculatedShapes, [
    "2digit_div_1digit_exact",
    "3digit_div_1digit_exact"
  ]);
  assert.equal(mapping.sharedNumericBoundary.twoDigitMultiplierComputationAllowed, false);
  assert.equal(mapping.sharedNumericBoundary.twoDigitDivisorComputationAllowed, false);
  assert.equal(mapping.sharedNumericBoundary.publicRemainderApplicationAllowed, false);
  assert.equal(mapping.sharedNumericBoundary.decimalAllowed, false);
  assert.equal(mapping.sharedNumericBoundary.fractionAllowed, false);
  assert.equal(mapping.sharedNumericBoundary.percentAllowed, false);
});

test("S58B defines an eight-stage validator with 44 unique blocking codes", () => {
  assert.equal(validator.stageCount, 8);
  assert.equal(validator.stages.length, 8);
  assert.deepEqual(
    validator.stages.map((stage) => stage.stage),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );
  assert.equal(validator.blockingCodeCount, 44);
  assert.equal(validator.blockingCodes.length, 44);
  assert.equal(new Set(validator.blockingCodes).size, 44);
  assert.equal(validator.warnings.length, 3);
  assert.equal(validator.resultContract.fallbackQuestionAllowed, false);
});

test("S58B transfers all S58A1 FullFix directives into design enforcement", () => {
  const refs = new Set(schema.fullFixDirectiveRefs);
  for (const directive of freeze.fullFixDirectives) {
    assert.ok(refs.has(directive.blockingRule), directive.blockingRule);
  }
  assert.ok(validator.blockingCodes.includes("G3BU08_SEGMENT_LENGTH_WORDING_UNNATURAL"));
  assert.ok(validator.blockingCodes.includes("G3BU08_SUCCESS_EVENT_PHRASE_UNNATURAL"));
  assert.ok(validator.blockingCodes.includes("G3BU08_SUCCESS_EVENT_CLASSIFIER_MISMATCH"));
  assert.ok(validator.blockingCodes.includes("G3BU08_SAME_PRICE_NOT_EXPLICIT"));
  assert.ok(validator.blockingCodes.includes("G3BU08_COMPARISON_NO_UNIQUE_WINNER"));
});
