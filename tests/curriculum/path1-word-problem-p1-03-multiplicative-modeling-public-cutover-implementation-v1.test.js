import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildPath1ManualWorksheet as buildPublicPracticeWorksheet,
  PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1ManualWorksheet as buildArithmeticWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";
import {
  buildPath1P103MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js";
import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  path1ManualBlockSupportsEqualGroupsTransfer,
  path1ManualBlockSupportsP103MultiplicativeModeling,
  serializePath1ManualQueryState,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04"];

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

test("P1-03 public query state round-trips the exact multiplicative modeling mode", () => {
  const state = serializePath1ManualQueryState({
    path1BlockId: "P1-03",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, {
    validBlockIds: VALID_BLOCK_IDS,
    search: "?retained=1",
  });
  assert.equal(state.path1BlockId, "P1-03");
  assert.equal(state.practiceMode, "multiplicativeModelingTransfer");
  assert.match(state.search, /retained=1/);
  assert.match(state.search, /path1BlockId=P1-03/);
  assert.match(state.search, /practiceMode=multiplicativeModelingTransfer/);

  const parsed = parsePath1ManualQueryState(state.search, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(parsed.path1BlockId, "P1-03");
  assert.equal(parsed.practiceMode, "multiplicativeModelingTransfer");
  assert.equal(parsed.warnings.length, 0);
});

test("public query state keeps the two modeling modes block-specific and fail-safe", () => {
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-01"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-02"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-03"), false);
  assert.equal(path1ManualBlockSupportsP103MultiplicativeModeling("P1-03"), true);
  assert.equal(path1ManualBlockSupportsP103MultiplicativeModeling("P1-01"), false);
  assert.equal(path1ManualBlockSupportsP103MultiplicativeModeling("P1-04"), false);

  const p103WithEarlyMode = normalizePath1ManualQueryState({
    path1BlockId: "P1-03",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p103WithEarlyMode.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p103WithEarlyMode).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));

  for (const blockId of ["P1-01", "P1-02", "P1-04"]) {
    const unsupported = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    }, { validBlockIds: VALID_BLOCK_IDS });
    assert.equal(unsupported.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
    assert.ok(warningCodes(unsupported).has("PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
  }

  const p104EqualGroups = normalizePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p104EqualGroups.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
});

test("P1-03 arithmetic public route is unchanged", () => {
  const options = {
    blockId: "P1-03",
    questionCount: 24,
    generationSeed: "p103-public-cutover:arithmetic",
    includeAnswerKey: true,
  };
  const direct = buildArithmeticWorksheet(options);
  const publicResult = buildPublicPracticeWorksheet({ ...options, practiceMode: "arithmetic" });
  assert.equal(direct.ok, true, JSON.stringify(direct.errors));
  assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
  assert.deepEqual(publicResult.worksheetDocument.questions, direct.worksheetDocument.questions);
  assert.deepEqual(publicResult.worksheetDocument.answerKeyItems, direct.worksheetDocument.answerKeyItems);
});

test("P1-03 public modeling dispatch preserves the dedicated generator semantics at 1/20/120", () => {
  for (const count of [1, 20, 120]) {
    const options = {
      blockId: "P1-03",
      questionCount: count,
      generationSeed: `p103-public-cutover:modeling:${count}`,
      includeAnswerKey: true,
      practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    };
    const direct = buildPath1P103MultiplicativeModelingWorksheet(options);
    const publicResult = buildPublicPracticeWorksheet(options);
    assert.equal(direct.ok, true, JSON.stringify(direct.errors));
    assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
    assert.equal(publicResult.worksheetDocument.questions.length, count);
    assert.deepEqual(publicResult.worksheetDocument.questions, direct.worksheetDocument.questions);
    assert.deepEqual(publicResult.worksheetDocument.answerKeyItems, direct.worksheetDocument.answerKeyItems);

    const metadata = publicResult.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.path1BlockId, "P1-03");
    assert.equal(metadata.practiceMode, "multiplicativeModelingTransfer");
    assert.equal(metadata.publicCutoverApplied, true);
    assert.equal(metadata.publicRoute, "path1-manual");
    assert.equal(metadata.publicCutoverGateId, PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID);
    assert.equal(metadata.masteryCredit, PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT);

    for (const item of publicResult.worksheetDocument.questions) {
      assert.equal(item.mode, "application");
      assert.equal(item.unknownRole, "totalAmount");
      assert.ok(item.amountPerGroup >= 10 && item.amountPerGroup <= 99);
      assert.ok(item.groupCount >= 10 && item.groupCount <= 99);
      assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
      assert.ok(item.totalAmount >= 100 && item.totalAmount <= 9801);
      assert.equal(item.metadata.publicCutoverApplied, false);
      assert.equal(item.metadata.semanticCommutativeRoleSwapAllowed, false);
      assert.equal(item.metadata.unitConversionUsed, false);
      assert.equal(item.metadata.singleRelationOnly, true);
      assert.match(item.answerText, / × /);
      assert.match(item.answerText, /；答：/);
    }
  }
});

test("P1-03 public 120-question modeling keeps four families and distinct prompts", () => {
  const result = buildPublicPracticeWorksheet({
    blockId: "P1-03",
    questionCount: 120,
    generationSeed: "p103-public-cutover:capacity",
    includeAnswerKey: true,
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.questions;
  assert.equal(new Set(questions.map((item) => item.prompt)).size, 120);
  assert.deepEqual(
    new Set(questions.map((item) => item.patternSpecId)),
    new Set(PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS),
  );
  const answerKeyCellCount = result.worksheetDocument.answerKeyPages
    .flatMap((page) => page.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey").length;
  assert.equal(answerKeyCellCount, 120);
});

test("P1-01/P1-02 equalGroupsTransfer remains accepted and unchanged", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 20,
      generationSeed: `p103-public-cutover:preserve:${blockId}`,
      includeAnswerKey: true,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.questions.length, 20);
    assert.ok(result.worksheetDocument.questions.every((item) => item.mode === "application"));
    assert.ok(result.worksheetDocument.questions.every((item) => item.unknownRole === "totalAmount"));
    assert.equal(result.worksheetDocument.configSnapshot.metadata.practiceMode, "equalGroupsTransfer");
  }
});

test("public adapter rejects P1-03 modeling mode on every unsupported block", () => {
  for (const blockId of ["P1-01", "P1-02", "P1-04"]) {
    const result = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 1,
      generationSeed: `p103-public-cutover:unsupported:${blockId}`,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    });
    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).has("PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
  }
});

test("Path1 page/controller expose P1-03 modeling without aliasing the early transfer mode", () => {
  const html = fs.readFileSync("site/path1/index.html", "utf8");
  const controller = fs.readFileSync("site/assets/browser/path1-manual.js", "utf8");
  const queryState = fs.readFileSync("site/assets/browser/state/path1-manual-query-state.js", "utf8");

  assert.match(html, /value="equalGroupsTransfer">文字建模練習/);
  assert.match(html, /value="multiplicativeModelingTransfer">文字建模練習/);
  assert.match(html, /P1-03 使用二位數×二位數乘法建模/);
  assert.match(controller, /PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE/);
  assert.match(controller, /path1ManualBlockSupportsP103MultiplicativeModeling/);
  assert.match(controller, /PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED/);
  assert.match(queryState, /const P103_MULTIPLICATIVE_MODELING_BLOCK_IDS = new Set\(\["P1-03"\]\)/);
  assert.doesNotMatch(controller, /state\/query-state\.js/);
});

test("pre-push static import smoke resolves all relative imports used by the cutover", () => {
  for (const filePath of [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-validator.js",
  ]) {
    assertRelativeImportsExist(filePath);
  }
});
