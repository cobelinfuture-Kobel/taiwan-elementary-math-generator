import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildPath1ManualWorksheet as buildPublicPracticeWorksheet,
  PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
  PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1ManualWorksheet as buildArithmeticWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";
import {
  buildPath1P104MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js";
import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  path1ManualBlockSupportsEqualGroupsTransfer,
  path1ManualBlockSupportsMultiplicativeModeling,
  path1ManualBlockSupportsP103MultiplicativeModeling,
  serializePath1ManualQueryState,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05"];
const ALLOWED_P104_KPS = new Set([
  "kp_g4a_u02_2digit_by_3digit",
  "kp_g4a_u02_3digit_by_2digit",
]);
const FORBIDDEN_P104_KPS = new Set([
  "kp_g4b_u01_3digit_by_3digit",
  "kp_g4b_u01_4digit_by_3digit",
]);

function warningCodes(state) {
  return new Set((state?.warnings ?? []).map((entry) => entry.code));
}

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function relativeImports(source) {
  const matches = source.matchAll(/(?:from\s+|import\s*)["'](\.\.?\/[^"']+)["']/g);
  return [...matches].map((match) => match[1]);
}

function assertRelativeImportsExist(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const specifier of relativeImports(source)) {
    const resolved = path.resolve(path.dirname(filePath), specifier);
    assert.equal(fs.existsSync(resolved), true, `${filePath} -> ${specifier}`);
  }
}

test("P1-04 public query state round-trips the shared multiplicative modeling mode", () => {
  const state = serializePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, {
    validBlockIds: VALID_BLOCK_IDS,
    search: "?retained=1",
  });
  assert.equal(state.path1BlockId, "P1-04");
  assert.equal(state.practiceMode, "multiplicativeModelingTransfer");
  assert.match(state.search, /retained=1/);
  assert.match(state.search, /path1BlockId=P1-04/);
  assert.match(state.search, /practiceMode=multiplicativeModelingTransfer/);

  const parsed = parsePath1ManualQueryState(state.search, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(parsed.path1BlockId, "P1-04");
  assert.equal(parsed.practiceMode, "multiplicativeModelingTransfer");
  assert.equal(parsed.warnings.length, 0);
});

test("shared modeling support is exactly P1-03/P1-04 while early transfer remains exactly P1-01/P1-02", () => {
  for (const blockId of ["P1-03", "P1-04"]) {
    assert.equal(path1ManualBlockSupportsMultiplicativeModeling(blockId), true);
    assert.equal(path1ManualBlockSupportsP103MultiplicativeModeling(blockId), true);
  }
  for (const blockId of ["P1-01", "P1-02", "P1-05"]) {
    assert.equal(path1ManualBlockSupportsMultiplicativeModeling(blockId), false);
  }
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-01"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-02"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-03"), false);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-04"), false);
});

test("unsupported block/mode combinations still normalize to arithmetic with warnings", () => {
  const p105Modeling = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p105Modeling.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p105Modeling).has("PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));

  const p104EqualGroups = normalizePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p104EqualGroups.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p104EqualGroups).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
});

test("P1-04 arithmetic public route remains unchanged", () => {
  const options = {
    blockId: "P1-04",
    questionCount: 24,
    generationSeed: "p104-public-cutover:arithmetic",
    includeAnswerKey: true,
  };
  const direct = buildArithmeticWorksheet(options);
  const publicResult = buildPublicPracticeWorksheet({ ...options, practiceMode: "arithmetic" });
  assert.equal(direct.ok, true, JSON.stringify(direct.errors));
  assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
  assert.deepEqual(publicResult.worksheetDocument.questions, direct.worksheetDocument.questions);
  assert.deepEqual(publicResult.worksheetDocument.answerKeyItems, direct.worksheetDocument.answerKeyItems);
});

test("P1-04 public modeling dispatch preserves dedicated semantics at 1/20/120", () => {
  for (const count of [1, 20, 120]) {
    const options = {
      blockId: "P1-04",
      questionCount: count,
      generationSeed: `p104-public-cutover:modeling:${count}`,
      includeAnswerKey: true,
      practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    };
    const direct = buildPath1P104MultiplicativeModelingWorksheet(options);
    const publicResult = buildPublicPracticeWorksheet(options);
    assert.equal(direct.ok, true, JSON.stringify(direct.errors));
    assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
    assert.equal(publicResult.worksheetDocument.questions.length, count);
    assert.deepEqual(publicResult.worksheetDocument.questions, direct.worksheetDocument.questions);
    assert.deepEqual(publicResult.worksheetDocument.answerKeyItems, direct.worksheetDocument.answerKeyItems);

    const metadata = publicResult.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.path1BlockId, "P1-04");
    assert.equal(metadata.practiceMode, "multiplicativeModelingTransfer");
    assert.equal(metadata.publicCutoverApplied, true);
    assert.equal(metadata.publicRoute, "path1-manual");
    assert.equal(metadata.publicCutoverGateId, PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID);
    assert.notEqual(metadata.publicCutoverGateId, PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID);
    assert.equal(metadata.masteryCredit, PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT);

    for (const item of publicResult.worksheetDocument.questions) {
      assert.equal(item.mode, "application");
      assert.equal(item.path1BlockId, "P1-04");
      assert.equal(item.relationId, "R03_EQUAL_GROUPS");
      assert.equal(item.unknownRole, "totalAmount");
      assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
      assert.equal(ALLOWED_P104_KPS.has(item.knowledgePointId), true);
      assert.equal(FORBIDDEN_P104_KPS.has(item.knowledgePointId), false);
      assert.equal(item.metadata.publicCutoverApplied, false);
      assert.equal(item.metadata.semanticCommutativeRoleSwapAllowed, false);
      assert.equal(item.metadata.unitConversionUsed, false);
      assert.equal(item.metadata.singleRelationOnly, true);
      assert.match(item.answerText, / × /);
      assert.match(item.answerText, /；答：/);
    }
  }
});

test("P1-04 public 120-question modeling keeps four families, two forms, and distinct prompts", () => {
  const result = buildPublicPracticeWorksheet({
    blockId: "P1-04",
    questionCount: 120,
    generationSeed: "p104-public-cutover:capacity",
    includeAnswerKey: true,
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(new Set(questions.map((item) => item.prompt)).size, 120);
  assert.deepEqual(
    new Set(questions.map((item) => item.patternSpecId)),
    new Set(PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS),
  );
  assert.deepEqual(
    new Set(questions.map((item) => item.arithmeticFormId)),
    new Set(PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS.map((entry) => entry.formId)),
  );
  assert.equal(questions.some((item) => FORBIDDEN_P104_KPS.has(item.knowledgePointId)), false);
  const answerKeyCellCount = result.worksheetDocument.answerKeyPages
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey").length;
  assert.equal(answerKeyCellCount, 120);
});

test("P1-03 modeling remains public with its original gate identity", () => {
  const result = buildPublicPracticeWorksheet({
    blockId: "P1-03",
    questionCount: 20,
    generationSeed: "p104-public-cutover:p103-preservation",
    includeAnswerKey: true,
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questions.length, 20);
  assert.equal(
    result.worksheetDocument.configSnapshot.metadata.publicCutoverGateId,
    PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
  );
});

test("P1-01/P1-02 equalGroupsTransfer remains accepted", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 12,
      generationSeed: `p104-public-cutover:preserve:${blockId}`,
      includeAnswerKey: true,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.questions.length, 12);
    assert.ok(result.worksheetDocument.questions.every((item) => item.unknownRole === "totalAmount"));
  }
});

test("public adapter fails closed for modeling on unsupported blocks", () => {
  for (const blockId of ["P1-01", "P1-02", "P1-05"]) {
    const result = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 1,
      generationSeed: `p104-public-cutover:unsupported:${blockId}`,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    });
    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).has("PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
  }
});

test("Path1 page/controller expose one shared modeling option for P1-03/P1-04", () => {
  const html = fs.readFileSync("site/path1/index.html", "utf8");
  const controller = fs.readFileSync("site/assets/browser/path1-manual.js", "utf8");
  const queryState = fs.readFileSync("site/assets/browser/state/path1-manual-query-state.js", "utf8");

  assert.equal((html.match(/value="multiplicativeModelingTransfer"/g) ?? []).length, 1);
  assert.match(html, /P1-03 使用二位數×二位數乘法建模/);
  assert.match(html, /P1-04 使用多位數×多位數乘法建模/);
  assert.match(controller, /path1ManualBlockSupportsMultiplicativeModeling/);
  assert.match(controller, /P1-03、P1-04 的文字建模模式/);
  assert.match(queryState, /MULTIPLICATIVE_MODELING_BLOCK_IDS = new Set\(\["P1-03", "P1-04"\]\)/);
});

test("pre-push static import smoke resolves all relative imports used by the cutover", () => {
  for (const filePath of [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js",
    "site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js",
    "site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js",
  ]) {
    assertRelativeImportsExist(filePath);
  }
});
