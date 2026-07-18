import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  generateG5AU02Canonical,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";

const CONTRACT = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/contracts/G5AU02_S109_P2RegressionOnlySourceParityLock.json",
  import.meta.url,
), "utf8"));
const S105 = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/contracts/G5AU02_S105_P1P2SourceParityMilestoneDefinition.json",
  import.meta.url,
), "utf8"));

const PATTERNS = Object.freeze([
  Object.freeze({
    order: 10,
    id: "ps_g5a_u02_equal_partition_range_constrained_recipients",
    answerModelId: "integerListWithUnitAnswer",
    mutationCode: "G5AU02_EQUAL_PARTITION_NONDIVISOR",
  }),
  Object.freeze({
    order: 18,
    id: "ps_g5a_u02_maximum_equal_grouping",
    answerModelId: "integerAnswer",
    mutationCode: "G5AU02_GCF_NOT_MAXIMUM",
  }),
  Object.freeze({
    order: 19,
    id: "ps_g5a_u02_possible_equal_packaging_counts",
    answerModelId: "integerListWithUnitAnswer",
    mutationCode: "G5AU02_EQUAL_PARTITION_NONDIVISOR",
  }),
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function factorsOf(value) {
  const values = [];
  for (let candidate = 1; candidate <= value; candidate += 1) {
    if (value % candidate === 0) values.push(candidate);
  }
  return values;
}
function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}
function commonFactorsOf(a, b) { return factorsOf(gcd(a, b)); }

function assertOrder10(item) {
  const { total, minRecipients, maxRecipients } = item.data;
  assert.equal(item.data.semanticRole, "equal_partition_range");
  assert.equal(item.prompt, `${total} 個物品平均分給 ${minRecipients} 到 ${maxRecipients} 人，每人同樣多且沒有剩下。可能有幾人？`);
  assert.deepEqual(item.answer, {
    values: factorsOf(total).filter((value) => value >= minRecipients && value <= maxRecipients),
    unitLabel: "人",
  });
  assert.match(item.prompt, /平均分給/);
  assert.match(item.prompt, /每人同樣多/);
  assert.match(item.prompt, /沒有剩下/);
  assert.match(item.prompt, /可能有幾人/);
}

function assertOrder18(item) {
  const { red, blue } = item.data;
  assert.equal(item.data.semanticRole, "maximum_equal_grouping");
  assert.equal(item.prompt, `${red} 個紅球和 ${blue} 個藍球要分成最多組，每組紅球數相同、藍球數也相同。最多可分成幾組？`);
  assert.deepEqual(item.answer, { value: gcd(red, blue) });
  assert.ok(item.prompt.includes(`${red} 個紅球`));
  assert.ok(item.prompt.includes(`${blue} 個藍球`));
  assert.match(item.prompt, /要分成最多組/);
  assert.match(item.prompt, /每組紅球數相同、藍球數也相同/);
  assert.match(item.prompt, /最多可分成幾組/);
}

function assertOrder19(item) {
  const { quantityA, quantityB } = item.data;
  assert.equal(item.data.semanticRole, "possible_equal_packaging");
  assert.equal(item.prompt, `${quantityA} 個甲物品和 ${quantityB} 個乙物品分裝成若干盒，每盒兩類物品的數量分別相同且全部用完。可能裝成幾盒？`);
  assert.deepEqual(item.answer, { values: commonFactorsOf(quantityA, quantityB), unitLabel: "盒" });
  assert.ok(item.prompt.includes(`${quantityA} 個甲物品`));
  assert.ok(item.prompt.includes(`${quantityB} 個乙物品`));
  assert.match(item.prompt, /每盒兩類物品的數量分別相同/);
  assert.match(item.prompt, /全部用完/);
  assert.match(item.prompt, /可能裝成幾盒/);
}

function assertPattern(item, order) {
  if (order === 10) assertOrder10(item);
  else if (order === 18) assertOrder18(item);
  else if (order === 19) assertOrder19(item);
  else throw new Error(`S109_ORDER_UNSUPPORTED:${order}`);
}

test("S109 scope is exactly the three S105 regression-only orders with runtime mutation forbidden", () => {
  assert.equal(CONTRACT.schemaName, "G5AU02P2RegressionOnlySourceParityLock");
  assert.equal(CONTRACT.authority.runtimeMutationAllowed, false);
  assert.equal(CONTRACT.authority.learnerFacingMutationAllowed, false);
  assert.equal(CONTRACT.authority.validatorMutationAllowed, false);
  assert.equal(CONTRACT.authority.rendererMutationAllowed, false);
  assert.equal(CONTRACT.authority.browserBundleMutationAllowed, false);
  assert.deepEqual(CONTRACT.patternContracts.map((row) => row.patternOrder), [10, 18, 19]);
  assert.deepEqual(CONTRACT.patternContracts.map((row) => row.patternSpecId), PATTERNS.map((row) => row.id));
  assert.deepEqual(S105.regressionOnlyContracts.map((row) => row.patternOrder), [10, 18, 19]);
  assert.ok(CONTRACT.allowedChangePaths.every((path) => !path.startsWith("src/") && !path.startsWith("site/")));
});

test("S109 locks 192/192 deterministic canonical scenarios and independently recomputed answers", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERNS.length; patternIndex += 1) {
    const pattern = PATTERNS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const seed = 109000 + patternIndex * 1000 + offset;
      const item = generateG5AU02Canonical(pattern.id, { seed });
      const replay = generateG5AU02Canonical(pattern.id, { seed });
      assert.deepEqual(item, replay);
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      assert.equal(item.patternSpecId, pattern.id);
      assert.equal(item.canonicalRoute.binding.patternOrder, pattern.order);
      assert.equal(item.canonicalRoute.answerModelId, pattern.answerModelId);
      assertPattern(item, pattern.order);
      inspected += 1;
    }
  }
  assert.equal(inspected, 192);
});

test("S109 locks 192/192 public questions without adding display models or leaking answers", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERNS.length; patternIndex += 1) {
    const pattern = PATTERNS[patternIndex];
    const baseSeed = 209000 + patternIndex * 1000;
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [pattern.id],
      questionCount: 64,
      generationSeed: baseSeed,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 64);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
    for (let index = 0; index < result.worksheetDocument.questionItems.length; index += 1) {
      const question = result.worksheetDocument.questionItems[index];
      const canonical = generateG5AU02Canonical(pattern.id, { seed: baseSeed + index });
      assert.equal(question.patternSpecId, pattern.id);
      assert.equal(question.answerModelId, pattern.answerModelId);
      assert.equal(question.prompt, canonical.prompt);
      assert.equal(question.promptText, canonical.prompt);
      assert.equal(question.questionDisplayModel, null);
      assert.equal(question.promptCompletenessStatus, "not_required_for_pattern");
      assert.equal("answer" in question, false);
      assert.equal("structuredAnswer" in question, false);
      assert.equal("answerText" in question, false);
      assertPattern(canonical, pattern.order);
      inspected += 1;
    }
  }
  assert.equal(inspected, 192);
});

test("S109 preserves existing blocking answer-mutation codes for all three locked patterns", () => {
  for (let index = 0; index < PATTERNS.length; index += 1) {
    const pattern = PATTERNS[index];
    const item = clone(generateG5AU02Canonical(pattern.id, { seed: 309000 + index }));
    if (pattern.order === 18) item.answer.value += 1;
    else item.answer.values = [999];
    const validation = validateG5AU02Canonical(item);
    assert.equal(validation.ok, false);
    assert.ok(validation.errors.includes(pattern.mutationCode), `${pattern.id}: ${validation.errors.join(",")}`);
  }
});

test("S109 contract preserves the approved identities, answer models and no-expansion boundary", () => {
  assert.deepEqual(CONTRACT.patternContracts.map((row) => row.answerModelId), [
    "integerListWithUnitAnswer",
    "integerAnswer",
    "integerListWithUnitAnswer",
  ]);
  assert.equal(CONTRACT.acceptance.canonicalScenarioCount, 192);
  assert.equal(CONTRACT.acceptance.publicScenarioCount, 192);
  assert.equal(CONTRACT.acceptance.publicQuestionDisplayModelChangeExpected, false);
  assert.equal(CONTRACT.globalInvariants.freeFormAI, "forbidden");
  assert.equal(CONTRACT.globalInvariants.genericFallback, "forbidden");
  assert.equal(CONTRACT.globalInvariants.crossUnitChangeForbidden, true);
  assert.equal(CONTRACT.distance.d0Eligible, false);
  assert.match(CONTRACT.distance.nextShortestStep, /S110/);
});
