import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1EqualGroupsTransferItems,
  PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";
import {
  validatePath1EqualGroupsTransferItem,
  validatePath1EqualGroupsTransferItems,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-validator.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet.js";

function codes(validation) {
  return new Set((validation?.errors ?? []).map((entry) => entry.code));
}

function assertBalanced(counts, maxDelta = 1) {
  const values = Object.values(counts);
  assert.ok(values.length > 0);
  assert.ok(Math.max(...values) - Math.min(...values) <= maxDelta, JSON.stringify(counts));
}

for (const blockId of ["P1-01", "P1-02"]) {
  for (const count of [1, 20, 120]) {
    test(`${blockId} equal-groups transfer generates and validates ${count}`, () => {
      const result = buildPath1EqualGroupsTransferItems({
        blockId,
        count,
        seed: `implementation-v1:${blockId}:${count}`,
        practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
      });
      assert.equal(result.ok, true, JSON.stringify(result.errors));
      assert.equal(result.items.length, count);
      assert.equal(new Set(result.items.map((item) => item.prompt)).size, count);
      assert.equal(validatePath1EqualGroupsTransferItems(result.items).ok, true);
      for (const item of result.items) {
        assert.equal(item.mode, "application");
        assert.equal(item.knowledgePointId, item.arithmeticKnowledgePointId);
        assert.equal(item.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
        assert.equal(item.unknownRole, "totalAmount");
        assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
        assert.match(item.answerText, / × .* = .*；答：/);
      }
      if (count >= 20) assertBalanced(result.summary.semanticPatternSpecCounts);
    });
  }
}

test("P1-02 transfer keeps two arithmetic KPs balanced and three-digit values inside relation envelope", () => {
  const result = buildPath1EqualGroupsTransferItems({
    blockId: "P1-02",
    count: 120,
    seed: "implementation-v1:p102:balanced",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(Object.keys(result.summary.arithmeticKnowledgePointCounts).sort(), [
    "kp_g3a_u03_2digit_by_1digit_carry",
    "kp_g3a_u03_3digit_by_1digit",
  ].sort());
  assertBalanced(result.summary.arithmeticKnowledgePointCounts);
  assertBalanced(result.summary.semanticPatternSpecCounts);
  const threeDigit = result.items.filter((item) => item.arithmeticKnowledgePointId === "kp_g3a_u03_3digit_by_1digit");
  assert.ok(threeDigit.length > 0);
  assert.ok(threeDigit.every((item) => item.amountPerGroup >= 100 && item.amountPerGroup <= Math.floor(999 / item.groupCount)));
  assert.ok(threeDigit.every((item) => item.totalAmount <= 999));
});

test("all four promoted equal-groups semantic surfaces are used without minting a KP", () => {
  const result = buildPath1EqualGroupsTransferItems({ blockId: "P1-01", count: 20, seed: "implementation-v1:surfaces" });
  assert.equal(result.ok, true);
  assert.deepEqual([...result.summary.semanticPatternSpecIdsUsed].sort(), [...PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS].sort());
  assert.ok(result.items.every((item) => item.metadata.canonicalKnowledgePointMinted === false));
  assert.ok(result.items.every((item) => item.sourceIds.includes("g3a_u03_3a03") && item.sourceIds.includes("g3b_u08_3b08")));
});

test("same seed replays exactly and different seed changes transfer selection", () => {
  const options = { blockId: "P1-02", count: 20, practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE };
  const first = buildPath1EqualGroupsTransferItems({ ...options, seed: "implementation-v1:replay-a" });
  const second = buildPath1EqualGroupsTransferItems({ ...options, seed: "implementation-v1:replay-a" });
  const different = buildPath1EqualGroupsTransferItems({ ...options, seed: "implementation-v1:replay-b" });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(different.ok, true);
  assert.deepEqual(first.items, second.items);
  assert.notDeepEqual(first.items.map((item) => item.generatedItemId), different.items.map((item) => item.generatedItemId));
});

test("relation-aware validator fails closed on semantic and arithmetic corruption", () => {
  const source = buildPath1EqualGroupsTransferItems({ blockId: "P1-02", count: 20, seed: "implementation-v1:negative" });
  assert.equal(source.ok, true);
  const base = source.items.find((item) => item.arithmeticKnowledgePointId === "kp_g3a_u03_3digit_by_1digit") ?? source.items[0];

  const roleSwap = {
    ...base,
    amountPerGroup: base.groupCount,
    groupCount: base.amountPerGroup,
  };
  assert.equal(validatePath1EqualGroupsTransferItem(roleSwap).ok, false);

  const wrongEquation = { ...base, equationModel: `${base.groupCount} × ${base.amountPerGroup} = ${base.totalAmount}` };
  assert.equal(validatePath1EqualGroupsTransferItem(wrongEquation).ok, false);
  assert.ok(codes(validatePath1EqualGroupsTransferItem(wrongEquation)).has("PATH1_TRANSFER_EQUATION_ROLE_ORDER_MISMATCH"));

  const wrongUnit = { ...base, finalAnswerUnit: "箱" };
  assert.equal(validatePath1EqualGroupsTransferItem(wrongUnit).ok, false);
  assert.ok(codes(validatePath1EqualGroupsTransferItem(wrongUnit)).has("PATH1_TRANSFER_ANSWER_UNIT_MISMATCH"));

  const unpromotedSurface = { ...base, semanticPatternSpecId: "ps_unpromoted_equal_groups_surface", patternSpecId: "ps_unpromoted_equal_groups_surface" };
  const unpromotedValidation = validatePath1EqualGroupsTransferItem(unpromotedSurface);
  assert.equal(unpromotedValidation.ok, false);
  assert.ok(codes(unpromotedValidation).has("PATH1_TRANSFER_SEMANTIC_PATTERN_NOT_PROMOTED"));

  const over999 = {
    ...base,
    amountPerGroup: 876,
    groupCount: 8,
    totalAmount: 7008,
    finalAnswer: 7008,
    equationModel: "876 × 8 = 7008",
  };
  const over999Validation = validatePath1EqualGroupsTransferItem(over999);
  assert.equal(over999Validation.ok, false);
  assert.ok(codes(over999Validation).has("PATH1_TRANSFER_RELATION_ENVELOPE_EXCEEDED"));
  assert.ok(codes(over999Validation).has("PATH1_TRANSFER_P102_THREE_DIGIT_BOUNDED_SUBSET_FAILED"));
});

test("unsupported block and unknown practice mode fail closed", () => {
  const unsupported = buildPath1EqualGroupsTransferItems({ blockId: "P1-03", count: 1, seed: "implementation-v1:unsupported" });
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.errors[0].code, "PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED");

  const worksheet = buildPath1ManualWorksheet({ blockId: "P1-03", questionCount: 1, practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE });
  assert.equal(worksheet.ok, false);
  assert.equal(worksheet.errors[0].code, "PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED");

  const unknown = buildPath1ManualWorksheet({ blockId: "P1-01", questionCount: 1, practiceMode: "unknown-mode" });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.errors[0].code, "PATH1_PRACTICE_MODE_NOT_SUPPORTED");
});

test("worksheet transfer route is additive and default arithmetic output stays unchanged", () => {
  const defaultArithmetic = buildPath1ManualWorksheet({
    blockId: "P1-01",
    questionCount: 12,
    generationSeed: "implementation-v1:default-arithmetic",
  });
  const explicitArithmetic = buildPath1ManualWorksheet({
    blockId: "P1-01",
    questionCount: 12,
    generationSeed: "implementation-v1:default-arithmetic",
    practiceMode: "arithmetic",
  });
  assert.equal(defaultArithmetic.ok, true, JSON.stringify(defaultArithmetic.errors));
  assert.equal(explicitArithmetic.ok, true, JSON.stringify(explicitArithmetic.errors));
  assert.deepEqual(defaultArithmetic.worksheetDocument, explicitArithmetic.worksheetDocument);

  for (const blockId of ["P1-01", "P1-02"]) {
    const transfer = buildPath1ManualWorksheet({
      blockId,
      questionCount: 20,
      generationSeed: `implementation-v1:worksheet:${blockId}`,
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
      includeAnswerKey: true,
    });
    assert.equal(transfer.ok, true, JSON.stringify(transfer.errors));
    assert.equal(transfer.worksheetDocument.questionCount, 20);
    assert.ok(transfer.worksheetDocument.questions.every((item) => item.mode === "application"));
    assert.ok(transfer.worksheetDocument.questions.every((item) => item.answerText.includes("；答：")));
    assert.equal(transfer.worksheetDocument.configSnapshot.metadata.practiceMode, PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE);
    assert.equal(transfer.worksheetDocument.configSnapshot.metadata.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  }
});
