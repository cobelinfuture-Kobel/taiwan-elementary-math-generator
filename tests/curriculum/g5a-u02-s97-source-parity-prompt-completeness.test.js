import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  enrichG5AU02GeneratedItemPrompt,
  getG5AU02PromptCompletenessPatternIds,
  validateG5AU02QuestionDisplayModel,
} from "../../src/curriculum/g5a-u02/question-display-model.js";
import { generateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  G5A_U02_S103_GENERATED_PROFILE_ID,
  G5A_U02_S103_SOURCE_PROFILE_ID,
} from "../../src/curriculum/g5a-u02/s103-digit-code-runtime.js";

const SOURCE_ID = "g5a_u02_5a02";
const PATTERN_IDS = getG5AU02PromptCompletenessPatternIds();

function seedFor(baseSeed, index) {
  return ((baseSeed + index - 1) % 0x7fffffff) + 1;
}

function assertVisibleByPattern(record) {
  const model = record.questionDisplayModel;
  assert.ok(model, `${record.patternSpecId} must expose questionDisplayModel`);
  assert.equal(record.promptCompletenessStatus, "visible_unique_solution_data_complete");
  assert.ok(record.prompt.length > 20);

  switch (record.patternSpecId) {
    case "ps_g5a_u02_missing_factor_reconstruction":
      assert.equal(model.kind, "masked_factor_sequence");
      assert.match(record.prompt, /因數表：/);
      assert.match(record.prompt, /□/);
      break;
    case "ps_g5a_u02_divisor_candidate_selection":
      assert.equal(model.kind, "candidate_selection");
      assert.match(record.prompt, /候選數：/);
      for (const candidate of model.candidates) assert.ok(record.prompt.includes(String(candidate)));
      break;
    case "ps_g5a_u02_complete_factor_list_unknown_values":
      assert.equal(model.kind, "symbolic_complete_factor_sequence");
      assert.match(record.prompt, /最後一個數就是原數/);
      assert.ok(model.sequence.some((entry) => entry.role === "unknown"));
      for (const entry of model.sequence) assert.ok(record.prompt.includes(entry.text));
      break;
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      assert.equal(model.kind, "factor_list_reasoning_statement_set");
      assert.ok(model.statements.length >= 3);
      assert.ok(model.truthPattern.includes(true));
      assert.ok(model.truthPattern.includes(false));
      assert.match(record.prompt, /因數個數(是|為)/);
      for (const factor of model.factorList) assert.ok(record.prompt.includes(String(factor)));
      for (let index = 0; index < model.statements.length; index += 1) {
        assert.ok(record.prompt.includes(`${index + 1}.`));
      }
      break;
    case "ps_g5a_u02_common_factor_concept_identification":
      assert.equal(model.kind, "candidate_selection");
      assert.equal(model.selectionRole, "common_factor");
      assert.match(record.prompt, /所有公因數/);
      assert.match(record.prompt, /候選數：/);
      for (const candidate of model.candidates) assert.ok(record.prompt.includes(String(candidate)));
      break;
    case "ps_g5a_u02_multi_constraint_digit_code":
      assert.equal(model.kind, "unique_digit_code_constraints");
      assert.equal(model.profileId, G5A_U02_S103_GENERATED_PROFILE_ID);
      assert.equal(model.productionAllocation, "default_regeneration");
      assert.equal(model.solutionCount, 1);
      assert.equal(model.candidateDomain.distinctDigits, true);
      assert.equal(model.conditions.length, 4);
      assert.match(record.prompt, /候選範圍：1000 到 9999/);
      assert.match(record.prompt, /四個數字互不重複/);
      for (const condition of model.conditions) assert.ok(record.prompt.includes(condition.text));
      break;
    default:
      assert.fail(`unexpected pattern: ${record.patternSpecId}`);
  }
}

test("S97 contract locks exactly six prompt-completeness blocking patterns", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_missing_factor_reconstruction",
    "ps_g5a_u02_divisor_candidate_selection",
    "ps_g5a_u02_complete_factor_list_unknown_values",
    "ps_g5a_u02_complete_factor_list_statement_evaluation",
    "ps_g5a_u02_common_factor_concept_identification",
    "ps_g5a_u02_multi_constraint_digit_code",
  ]);
});

test("S97 120/120 generated questions expose all information required to answer", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    const baseSeed = 970000 + patternIndex * 100;
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: SOURCE_ID,
      patternSpecIds: [patternSpecId],
      questionCount: 20,
      generationSeed: baseSeed,
      includeAnswerKey: true,
      questionRowsPerPage: 5,
    });

    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 20);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 20);
    assert.equal(result.worksheetDocument.semanticProjection.promptCompletenessQuestionCount, 20);

    for (let index = 0; index < result.worksheetDocument.questionItems.length; index += 1) {
      const record = result.worksheetDocument.questionItems[index];
      const canonicalItem = generateG5AU02Canonical(patternSpecId, { seed: seedFor(baseSeed, index) });
      const validation = validateG5AU02QuestionDisplayModel(
        canonicalItem,
        record.questionDisplayModel,
        record.prompt,
      );
      assert.equal(validation.ok, true, validation.errors.join(","));
      assertVisibleByPattern(record);
      assert.equal("answer" in record, false);
      assert.equal("structuredAnswer" in record, false);
      assert.equal("answerText" in record, false);
      inspected += 1;
    }
  }
  assert.equal(inspected, 120);
});

test("S97 public page records retain the same complete visible prompts", () => {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: PATTERN_IDS,
    questionCount: 18,
    generationSeed: "s97-page-parity",
    includeAnswerKey: true,
    questionRowsPerPage: 4,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  const flattened = result.worksheetDocument.questionPages.flatMap((page) => page.records);
  assert.equal(flattened.length, 18);
  assert.deepEqual(
    flattened.map((record) => record.prompt),
    result.worksheetDocument.questionItems.map((record) => record.prompt),
  );
  assert.ok(flattened.every((record) => record.questionDisplayModel));
});

test("S97 source-backed password conditions preserve the original 1725 reference fixture", () => {
  const item = generateG5AU02Canonical("ps_g5a_u02_multi_constraint_digit_code", {
    seed: 1725,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  });
  const enriched = enrichG5AU02GeneratedItemPrompt(item);
  const model = enriched.questionDisplayModel;
  assert.equal(model.kind, "unique_digit_code_constraints");
  assert.equal(model.profileId, G5A_U02_S103_SOURCE_PROFILE_ID);
  assert.equal(model.productionAllocation, "reference_only");
  assert.equal(model.sourceReference.sourceEvidence, "g5a_u02_5a02a1:p2:right-top");
  assert.deepEqual(item.answer, { digits: [1, 7, 2, 5], value: 1725 });
  assert.match(enriched.prompt, /6 和 8 的公因數/);
  assert.match(enriched.prompt, /70 是第二個數字和第四個數字的公倍數/);
  assert.match(enriched.prompt, /22 和 33 的公因數，也是 45 和 60 的公因數/);
  assert.match(enriched.prompt, /3 的倍數和 5 的倍數/);
  assert.match(enriched.prompt, /四個數字互不重複/);
  assert.equal(enriched.prompt.includes("千位為1"), false);
  assert.equal(enriched.prompt.includes("百位為7"), false);
  assert.equal(enriched.prompt.includes("十位為2"), false);
  assert.equal(enriched.prompt.includes("個位為5"), false);
});
