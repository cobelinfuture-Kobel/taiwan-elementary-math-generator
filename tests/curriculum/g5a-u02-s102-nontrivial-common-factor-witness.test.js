import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { generateG5AU02Canonical, validateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import { enrichG5AU02GeneratedItemPrompt } from "../../src/curriculum/g5a-u02/question-display-model.js";
import { getG5AU02S102PatternIds } from "../../src/curriculum/g5a-u02/s102-common-factor-runtime.js";

const PATTERN_IDS = getG5AU02S102PatternIds();
const KINDS = new Map([
  ["ps_g5a_u02_common_factor_enumeration", "parallel_factor_sets_with_intersection"],
  ["ps_g5a_u02_greatest_common_factor", "common_factor_set_with_gcf"],
]);
const ANSWER_MODELS = new Map([
  ["ps_g5a_u02_common_factor_enumeration", "integerListAnswer"],
  ["ps_g5a_u02_greatest_common_factor", "commonFactorAndGcfAnswer"],
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function factorsOf(value) {
  const values = [];
  for (let candidate = 1; candidate <= value; candidate += 1) if (value % candidate === 0) values.push(candidate);
  return values;
}
function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}
function intersection(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}
function expectCode(item, mutate, code) {
  const changed = clone(item);
  mutate(changed);
  const validation = validateG5AU02Canonical(changed);
  assert.equal(validation.ok, false, `${code}:${validation.errors.join(",")}`);
  assert.ok(validation.errors.includes(code), validation.errors.join(","));
}

function assertNondegenerate(item) {
  const { a, b, factorSetA, factorSetB, commonFactors, greatestCommonFactor } = item.data;
  const greatest = gcd(a, b);
  assert.notEqual(a, b);
  assert.ok(greatest >= 2);
  assert.ok(greatest < Math.min(a, b));
  assert.notDeepEqual(factorSetA, factorSetB);
  assert.deepEqual(factorSetA, factorsOf(a));
  assert.deepEqual(factorSetB, factorsOf(b));
  assert.deepEqual(commonFactors, intersection(factorSetA, factorSetB));
  assert.equal(greatestCommonFactor, commonFactors.at(-1));
}

test("S102 scope is exactly pattern orders 16 and 17", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_common_factor_enumeration",
    "ps_g5a_u02_greatest_common_factor",
  ]);
});

test("S102 canonical 128/128 scenarios enforce nondegenerate sampling and visible factor-set witnesses", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const seed = 102000 + patternIndex * 1000 + offset;
      const item = generateG5AU02Canonical(patternSpecId, { seed });
      const replay = generateG5AU02Canonical(patternSpecId, { seed });
      assert.deepEqual(item, replay);
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      assert.equal(item.canonicalRoute.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(item.data.samplingProfileId, "nontrivial_common_factor_pair_v1");
      assertNondegenerate(item);

      const enriched = enrichG5AU02GeneratedItemPrompt(item);
      assert.equal(enriched.questionDisplayModel.kind, KINDS.get(patternSpecId));
      assert.ok(enriched.prompt.includes(`甲數 ${item.data.a} 的因數：${item.data.factorSetA.join("、")}`));
      assert.ok(enriched.prompt.includes(`乙數 ${item.data.b} 的因數：${item.data.factorSetB.join("、")}`));
      assert.ok(enriched.prompt.includes("公因數（兩個因數集合的交集）：________________"));
      if (patternIndex === 1) {
        assert.ok(enriched.prompt.includes("最大公因數（公因數中的最大值）：________________"));
        assert.deepEqual(item.answer, {
          commonFactors: item.data.commonFactors,
          greatestCommonFactor: item.data.greatestCommonFactor,
        });
      } else {
        assert.deepEqual(item.answer, { values: item.data.commonFactors });
      }
      inspected += 1;
    }
  }
  assert.equal(inspected, 128);
});

test("S102 public worksheets retain 128 structured questions and leak no answers", () => {
  let inspected = 0;
  for (let index = 0; index < PATTERN_IDS.length; index += 1) {
    const patternSpecId = PATTERN_IDS[index];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 202000 + index * 1000,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 64);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
    for (let row = 0; row < 64; row += 1) {
      const question = result.worksheetDocument.questionItems[row];
      const answer = result.worksheetDocument.answerKeyItems[row];
      assert.equal(question.questionDisplayModel.kind, KINDS.get(patternSpecId));
      assert.equal(question.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(answer.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(question.promptCompletenessStatus, "visible_unique_solution_data_complete");
      assert.equal("answer" in question, false);
      assert.equal("structuredAnswer" in question, false);
      assert.equal("answerText" in question, false);
      assert.ok(question.prompt.includes("的因數："));
      assert.ok(answer.answerText.length > 0);
      if (patternSpecId === "ps_g5a_u02_greatest_common_factor") {
        assert.match(answer.answerText, /公因數：.+；最大公因數：\d+/);
      }
      inspected += 1;
    }
  }
  assert.equal(inspected, 128);
});

test("S102 blocking validators reject all six S99 mutations", () => {
  const enumeration = generateG5AU02Canonical(PATTERN_IDS[0], { seed: 302001 });
  expectCode(enumeration, (item) => { item.data.b = item.data.a; }, "G5AU02_P0_COMMON_FACTOR_OPERANDS_DEGENERATE");
  expectCode(enumeration, (item) => { item.data.factorSetA.pop(); }, "G5AU02_P0_FACTOR_SET_WITNESS_MISSING");
  expectCode(enumeration, (item) => { item.data.commonFactors.pop(); }, "G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH");

  const greatest = generateG5AU02Canonical(PATTERN_IDS[1], { seed: 303001 });
  expectCode(greatest, (item) => { item.data.b = item.data.a; }, "G5AU02_P0_GCF_OPERANDS_DEGENERATE");
  expectCode(greatest, (item) => { item.data.commonFactors.pop(); }, "G5AU02_P0_GCF_COMMON_SET_MISSING");
  expectCode(greatest, (item) => {
    item.data.greatestCommonFactor = 1;
    item.answer.greatestCommonFactor = 1;
  }, "G5AU02_P0_GCF_NOT_MAXIMUM");
});

test("S102 keeps S103 and P1/P2 outside the implemented runtime", () => {
  assert.equal(PATTERN_IDS.includes("ps_g5a_u02_multi_constraint_digit_code"), false);
  assert.equal(PATTERN_IDS.length, 2);
});
