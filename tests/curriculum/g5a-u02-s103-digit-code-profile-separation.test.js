import assert from "node:assert/strict";
import test from "node:test";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  generateG5AU02Canonical,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  enrichG5AU02GeneratedItemPrompt,
  validateG5AU02QuestionDisplayModel,
} from "../../src/curriculum/g5a-u02/question-display-model.js";
import {
  G5A_U02_S103_GENERATED_PROFILE_ID,
  G5A_U02_S103_SOURCE_PROFILE_ID,
  getG5AU02S103GeneratedBlueprints,
  getG5AU02S103ProfileIds,
  solveG5AU02DigitCode,
  validateG5AU02S103Pattern,
} from "../../src/curriculum/g5a-u02/s103-digit-code-runtime.js";

const PATTERN_ID = "ps_g5a_u02_multi_constraint_digit_code";
const SOURCE_ID = "g5a_u02_5a02";

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function assertNoAnswerLeak(model) {
  for (const field of ["answer", "structuredAnswer", "answerText", "digits", "value", "expectedSolution", "sourceSolution"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(model, field), false, field);
  }
}

test("S103 locks exactly two profiles and eight finite generated blueprints", () => {
  assert.deepEqual(getG5AU02S103ProfileIds(), [
    G5A_U02_S103_SOURCE_PROFILE_ID,
    G5A_U02_S103_GENERATED_PROFILE_ID,
  ]);
  const blueprints = getG5AU02S103GeneratedBlueprints();
  assert.equal(blueprints.length, 8);
  assert.equal(new Set(blueprints.map((row) => row.blueprintId)).size, 8);
  assert.equal(new Set(blueprints.map((row) => row.expectedValue)).size, 8);
  assert.ok(blueprints.every((row) => row.conditions.length === 4));
});

test("S103 generated default passes 64/64 unique, minimal and answer-isolated scenarios", () => {
  const reachedBlueprints = new Set();
  const reachedSolutions = new Set();
  for (let seed = 1; seed <= 64; seed += 1) {
    const item = generateG5AU02Canonical(PATTERN_ID, { seed: 103000 + seed });
    assert.equal(item.data.profileId, G5A_U02_S103_GENERATED_PROFILE_ID);
    assert.equal(item.data.productionAllocation, "default_regeneration");
    assert.equal(item.answer.value === 1725, false);
    assert.equal(item.data.solutionCount, 1);
    assert.equal(item.data.candidateDomain.distinctDigits, true);
    assert.equal(item.data.candidateDomain.nonzeroThousandsDigit, true);
    assert.equal(new Set(item.answer.digits).size, 4);
    assert.notEqual(item.answer.digits[0], 0);
    assert.deepEqual(solveG5AU02DigitCode(item.data.candidateDomain, item.data.conditions), [item.answer]);
    assert.equal(item.data.conditionMinimality.length, item.data.conditions.length);
    assert.ok(item.data.conditionMinimality.every((row) => row.retainsSameUniqueSolution === false));
    assert.deepEqual(validateG5AU02S103Pattern(item), { ok: true, errors: [] });
    assert.deepEqual(validateG5AU02Canonical(item), { ok: true, errors: [] });

    const enriched = enrichG5AU02GeneratedItemPrompt(item);
    assert.equal(enriched.questionDisplayModel.kind, "unique_digit_code_constraints");
    assert.equal(enriched.questionDisplayModel.profileId, G5A_U02_S103_GENERATED_PROFILE_ID);
    assert.equal(enriched.questionDisplayModel.solutionCount, 1);
    assertNoAnswerLeak(enriched.questionDisplayModel);
    assert.equal(
      validateG5AU02QuestionDisplayModel(item, enriched.questionDisplayModel, enriched.prompt).ok,
      true,
    );
    for (const condition of enriched.questionDisplayModel.conditions) {
      assert.ok(enriched.prompt.includes(condition.text));
    }
    reachedBlueprints.add(item.data.blueprintId);
    reachedSolutions.add(item.answer.value);
  }
  assert.equal(reachedBlueprints.size, 8);
  assert.equal(reachedSolutions.size, 8);
});

test("S103 default browser allocation emits 64 generated questions and zero source repeats", () => {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: [PATTERN_ID],
    questionCount: 64,
    generationSeed: 103640,
    includeAnswerKey: true,
    questionRowsPerPage: 4,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  assert.equal(result.worksheetDocument.questionItems.length, 64);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
  assert.ok(result.worksheetDocument.questionItems.every((question) => (
    question.questionDisplayModel.profileId === G5A_U02_S103_GENERATED_PROFILE_ID
      && question.questionDisplayModel.productionAllocation === "default_regeneration"
      && question.questionDisplayModel.kind === "unique_digit_code_constraints"
  )));
  assert.ok(result.worksheetDocument.answerKeyItems.every((answer) => answer.structuredAnswer.value !== 1725));
  assert.ok(result.worksheetDocument.questionItems.every((question) => {
    assertNoAnswerLeak(question.questionDisplayModel);
    return true;
  }));
});

test("S103 retains the exact 1725 source reference only through explicit profile selection", () => {
  const item = generateG5AU02Canonical(PATTERN_ID, {
    seed: 1725,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  });
  assert.equal(item.data.profileId, G5A_U02_S103_SOURCE_PROFILE_ID);
  assert.equal(item.data.productionAllocation, "reference_only");
  assert.equal(item.data.sourceReference.defaultAllocationExcluded, true);
  assert.equal(item.data.sourceReference.sourceEvidence, "g5a_u02_5a02a1:p2:right-top");
  assert.deepEqual(item.answer, { digits: [1, 7, 2, 5], value: 1725 });
  assert.equal(item.data.solutionCount, 1);
  assert.deepEqual(validateG5AU02Canonical(item), { ok: true, errors: [] });

  const enriched = enrichG5AU02GeneratedItemPrompt(item);
  assert.equal(enriched.questionDisplayModel.profileId, G5A_U02_S103_SOURCE_PROFILE_ID);
  assert.equal(enriched.questionDisplayModel.productionAllocation, "reference_only");
  assert.deepEqual(enriched.questionDisplayModel.conditions.map((row) => row.text), [
    "第三個數字和第一個數字不同，且第三個數字是 6 和 8 的公因數。",
    "70 是第二個數字和第四個數字的公倍數。",
    "第一個數字同時是 22 和 33 的公因數，也是 45 和 60 的公因數。",
    "這個四位數同時是 3 的倍數和 5 的倍數。",
    "四個數字互不重複。",
  ]);
  assertNoAnswerLeak(enriched.questionDisplayModel);
  assert.equal(enriched.prompt.includes("千位為1"), false);
  assert.equal(enriched.prompt.includes("百位為7"), false);
  assert.equal(enriched.prompt.includes("十位為2"), false);
  assert.equal(enriched.prompt.includes("個位為5"), false);
});

test("S103 rejects unknown profile selection without generic fallback", () => {
  assert.throws(
    () => generateG5AU02Canonical(PATTERN_ID, { seed: 1, digitCodeProfileId: "unknown_profile" }),
    /G5AU02_P0_DIGIT_CODE_PROFILE_INVALID/,
  );
});

test("S103 blocking validator detects profile, uniqueness, sufficiency and source-allocation mutations", () => {
  const generated = clone(generateG5AU02Canonical(PATTERN_ID, { seed: 103777 }));

  const invalidProfile = clone(generated);
  invalidProfile.data.profileId = "unknown_profile";
  assert.ok(validateG5AU02S103Pattern(invalidProfile).errors.includes("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID"));

  const nonunique = clone(generated);
  nonunique.data.conditions = [];
  nonunique.data.solutionCount = 1;
  assert.ok(validateG5AU02S103Pattern(nonunique).errors.includes("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE"));

  const insufficient = clone(generated);
  insufficient.data.conditionMinimality[0].retainsSameUniqueSolution = true;
  assert.ok(validateG5AU02S103Pattern(insufficient).errors.includes("G5AU02_P0_DIGIT_CODE_CONDITION_INSUFFICIENT"));

  const source = clone(generateG5AU02Canonical(PATTERN_ID, {
    seed: 1725,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  }));
  source.data.productionAllocation = "default_regeneration";
  assert.ok(validateG5AU02S103Pattern(source).errors.includes("G5AU02_P0_SOURCE_REFERENCE_REPEATED_AS_DEFAULT"));
});

test("S103 independently recomputes both generated and source answers", () => {
  const generated = clone(generateG5AU02Canonical(PATTERN_ID, { seed: 103888 }));
  generated.answer.value += 1;
  generated.answer.digits = String(generated.answer.value).split("").map(Number);
  assert.ok(validateG5AU02S103Pattern(generated).errors.includes("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE"));

  const source = clone(generateG5AU02Canonical(PATTERN_ID, {
    seed: 1725,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  }));
  source.answer = { digits: [1, 7, 2, 6], value: 1726 };
  const errors = validateG5AU02S103Pattern(source).errors;
  assert.ok(errors.includes("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE"));
  assert.ok(errors.includes("G5AU02_DIGIT_TUPLE_NOT_1725"));
});

test("S103 generation is deterministic for profile and seed", () => {
  const first = generateG5AU02Canonical(PATTERN_ID, { seed: 103999 });
  const second = generateG5AU02Canonical(PATTERN_ID, { seed: 103999 });
  assert.deepEqual(first, second);

  const sourceA = generateG5AU02Canonical(PATTERN_ID, {
    seed: 1,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  });
  const sourceB = generateG5AU02Canonical(PATTERN_ID, {
    seed: 999,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  });
  assert.deepEqual(sourceA.answer, sourceB.answer);
  assert.deepEqual(sourceA.data.conditions, sourceB.data.conditions);
});
