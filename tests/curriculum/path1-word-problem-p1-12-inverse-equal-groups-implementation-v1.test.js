import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1P112InverseEqualGroupsItems,
  getPath1P112InverseEqualGroupsRoleConfig,
  PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
  PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS,
  PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
  PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS,
} from "../../site/modules/curriculum/learning-paths/path1-p1-12-inverse-equal-groups-generator.js";
import {
  validatePath1P112InverseEqualGroupsItem,
  validatePath1P112InverseEqualGroupsItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-12-inverse-equal-groups-validator.js";
import {
  buildPath1P112InverseEqualGroupsWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-12-inverse-equal-groups-worksheet.js";
import {
  buildPath1EqualGroupsTransferItems,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";

function build(count, seed = `path1-p112-implementation:${count}`) {
  return buildPath1P112InverseEqualGroupsItems({
    blockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
    count,
    seed,
    practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
  });
}

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

function errorCodes(validation) {
  return new Set(validation.errors.map((entry) => entry.code));
}

test("P1-12 inverse equal-groups generator and validator accept 1/20/120", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.generated, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P112InverseEqualGroupsItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  }
});

test("120 items balance all three unknown roles and all 12 existing PatternSpecs", () => {
  const result = build(120, "path1-p112-implementation:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS.length, 3);
  assert.equal(PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS.length, 12);
  assert.deepEqual(new Set(result.summary.unknownRolesUsed), new Set(["totalAmount", "groupCount", "amountPerGroup"]));
  assert.deepEqual(new Set(result.summary.semanticPatternSpecIdsUsed), new Set(PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS));
  assert.deepEqual(Object.values(result.summary.unknownRoleCounts).sort((a, b) => a - b), [40, 40, 40]);
  assert.ok(Object.values(result.summary.semanticPatternSpecCounts).every((count) => count === 10));

  for (const item of result.items) {
    const role = getPath1P112InverseEqualGroupsRoleConfig(item.unknownRole);
    assert.ok(role);
    assert.equal(item.relationKnowledgePointId, role.relationKnowledgePointId);
    assert.equal(item.relationOperationModelId, role.relationOperationModelId);
    assert.equal(item.relationOperation, role.operation);
    assert.ok(role.semanticPatternSpecIds.includes(item.semanticPatternSpecId));
    assert.equal(item.knowledgePointId, role.relationKnowledgePointId);
  }
});

test("operation and equation direction follow the semantic unknown role", () => {
  const result = build(120, "path1-p112-implementation:role-equations");
  assert.equal(result.ok, true);
  const byRole = Object.groupBy(result.items, (entry) => entry.unknownRole);

  for (const item of byRole.totalAmount) {
    assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
    assert.equal(item.finalAnswer, item.totalAmount);
    assert.equal(item.equationModel, `${item.amountPerGroup} × ${item.groupCount} = ${item.totalAmount}`);
    assert.equal(item.metadata.exactDivisionRequired, false);
  }
  for (const item of byRole.groupCount) {
    assert.equal(item.totalAmount % item.amountPerGroup, 0);
    assert.equal(item.groupCount, item.totalAmount / item.amountPerGroup);
    assert.equal(item.finalAnswer, item.groupCount);
    assert.equal(item.equationModel, `${item.totalAmount} ÷ ${item.amountPerGroup} = ${item.groupCount}`);
    assert.equal(item.metadata.exactDivisionRequired, true);
  }
  for (const item of byRole.amountPerGroup) {
    assert.equal(item.totalAmount % item.groupCount, 0);
    assert.equal(item.amountPerGroup, item.totalAmount / item.groupCount);
    assert.equal(item.finalAnswer, item.amountPerGroup);
    assert.equal(item.equationModel, `${item.totalAmount} ÷ ${item.groupCount} = ${item.amountPerGroup}`);
    assert.equal(item.metadata.exactDivisionRequired, true);
  }
});

test("same seed replays exactly and different seed changes the generated sequence", () => {
  const a = build(36, "path1-p112-implementation:replay");
  const b = build(36, "path1-p112-implementation:replay");
  const c = build(36, "path1-p112-implementation:replay-different");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("validator fails closed on role, equation, unit, pattern, exact-division and numeric-boundary mutations", () => {
  const result = build(120, "path1-p112-implementation:negative");
  assert.equal(result.ok, true);
  const total = result.items.find((entry) => entry.unknownRole === "totalAmount");
  const groupCount = result.items.find((entry) => entry.unknownRole === "groupCount");
  const perGroup = result.items.find((entry) => entry.unknownRole === "amountPerGroup");
  assert.ok(total && groupCount && perGroup);

  let validation = validatePath1P112InverseEqualGroupsItem({ ...total, unknownRole: "groupCount" });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_RELATION_KP_MISMATCH"));

  validation = validatePath1P112InverseEqualGroupsItem({ ...groupCount, equationModel: `${groupCount.amountPerGroup} ÷ ${groupCount.totalAmount} = ${groupCount.groupCount}` });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_EQUATION_ROLE_MISMATCH"));

  validation = validatePath1P112InverseEqualGroupsItem({ ...perGroup, finalAnswerUnit: "盒" });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_ANSWER_UNIT_MISMATCH"));

  validation = validatePath1P112InverseEqualGroupsItem({
    ...groupCount,
    semanticPatternSpecId: PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS[2].semanticPatternSpecIds[0],
    patternSpecId: PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS[2].semanticPatternSpecIds[0],
  });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_PATTERN_NOT_ALLOWED_FOR_ROLE"));

  validation = validatePath1P112InverseEqualGroupsItem({ ...groupCount, totalAmount: groupCount.totalAmount + 1 });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_QUOTATIVE_EXACT_DIVISION_FAILED"));

  validation = validatePath1P112InverseEqualGroupsItem({
    ...total,
    amountPerGroup: 200,
    groupCount: 5,
    totalAmount: 1000,
    finalAnswer: 1000,
    equationModel: "200 × 5 = 1000",
  });
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P112_INVERSE_TOTAL_AMOUNT_OUT_OF_RANGE"));
});

test("generator and worksheet adapter fail closed outside P1-12", () => {
  const generator = buildPath1P112InverseEqualGroupsItems({
    blockId: "P1-03",
    count: 20,
    seed: "path1-p112-unsupported",
    practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
  });
  assert.equal(generator.ok, false);
  assert.equal(generator.errors[0].code, "PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED");

  const worksheet = buildPath1P112InverseEqualGroupsWorksheet({
    blockId: "P1-04",
    questionCount: 20,
    generationSeed: "path1-p112-unsupported-worksheet",
  });
  assert.equal(worksheet.ok, false);
  assert.equal(worksheet.errors[0].code, "PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED");
});

test("P1-12 worksheet adapter renders three-role application questions with equation-bearing answer keys", () => {
  const result = buildPath1P112InverseEqualGroupsWorksheet({
    questionCount: 36,
    generationSeed: "path1-p112-implementation:worksheet",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.questionCount, 36);
  assert.equal(document.questions.length, 36);
  assert.equal(countCells(document.questionPages, "question"), 36);
  assert.equal(countCells(document.answerKeyPages, "answerKey"), 36);
  assert.ok(document.questions.every((item) => item.mode === "application"));
  assert.ok(document.questions.every((item) => item.answerText.includes("；答：")));
  assert.ok(document.questions.every((item) => item.answerText.includes(" × ") || item.answerText.includes(" ÷ ")));
  assert.deepEqual(new Set(document.configSnapshot.metadata.unknownRolesUsed), new Set(["totalAmount", "groupCount", "amountPerGroup"]));
  assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE);
  assert.equal(document.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(document.configSnapshot.metadata.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
});

test("deployed P1-01/P1-02 equal-groups transfer remains totalAmount-only", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPath1EqualGroupsTransferItems({
      blockId,
      count: 20,
      seed: `path1-p112-implementation:early-transfer:${blockId}`,
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.ok(result.items.every((entry) => entry.unknownRole === "totalAmount"));
    assert.ok(result.items.every((entry) => entry.relationKnowledgePointId === "kp_g3b_u08_total_from_groups"));
  }
});
