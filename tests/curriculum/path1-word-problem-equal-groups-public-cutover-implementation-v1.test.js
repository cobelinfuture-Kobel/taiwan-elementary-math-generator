import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildPath1ManualWorksheet as buildPublicPracticeWorksheet,
  PATH1_EQUAL_GROUPS_MODELING_TRANSFER_GATE_ID,
  PATH1_EQUAL_GROUPS_MODELING_TRANSFER_MASTERY_CREDIT,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1ManualWorksheet as buildArithmeticWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  serializePath1ManualQueryState,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04"];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(state) {
  return new Set((state?.warnings ?? []).map((entry) => entry.code));
}

test("Path1-local query state defaults and round-trips supported public modes", () => {
  const defaults = parsePath1ManualQueryState("", { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(defaults.path1BlockId, "P1-01");
  assert.equal(defaults.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.equal(defaults.warnings.length, 0);

  for (const [path1BlockId, practiceMode] of [
    ["P1-01", "arithmetic"],
    ["P1-01", "equalGroupsTransfer"],
    ["P1-02", "arithmetic"],
    ["P1-02", "equalGroupsTransfer"],
  ]) {
    const serialized = serializePath1ManualQueryState(
      { path1BlockId, practiceMode },
      { validBlockIds: VALID_BLOCK_IDS, search: "?retained=1" },
    );
    assert.match(serialized.search, /retained=1/);
    const parsed = parsePath1ManualQueryState(serialized.search, { validBlockIds: VALID_BLOCK_IDS });
    assert.equal(parsed.path1BlockId, path1BlockId);
    assert.equal(parsed.practiceMode, practiceMode);
    assert.equal(parsed.warnings.length, 0);
  }
});

test("Path1-local query state normalizes invalid block, invalid mode, and unsupported transfer pair", () => {
  const invalidBlock = parsePath1ManualQueryState(
    "?path1BlockId=P1-99&practiceMode=arithmetic",
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(invalidBlock.path1BlockId, "P1-01");
  assert.ok(warningCodes(invalidBlock).has("PATH1_PUBLIC_BLOCK_QUERY_FALLBACK"));

  const invalidMode = parsePath1ManualQueryState(
    "?path1BlockId=P1-01&practiceMode=unknown",
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(invalidMode.practiceMode, "arithmetic");
  assert.ok(warningCodes(invalidMode).has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK"));

  const unsupported = normalizePath1ManualQueryState(
    { path1BlockId: "P1-03", practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE },
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(unsupported.path1BlockId, "P1-03");
  assert.equal(unsupported.practiceMode, "arithmetic");
  assert.ok(warningCodes(unsupported).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
});

test("Path1 query-state module is local and does not depend on Classic query state", () => {
  const source = fs.readFileSync("site/assets/browser/state/path1-manual-query-state.js", "utf8");
  assert.doesNotMatch(source, /query-state\.js/);
  assert.doesNotMatch(source, /sourceId|questionMode|selectedKnowledgePointIds|selectedPatternGroupIds/);
});

test("public adapter preserves arithmetic question and answer content while adding practice metadata", () => {
  for (const blockId of ["P1-01", "P1-02", "P1-03", "P1-04"]) {
    const options = {
      blockId,
      questionCount: 8,
      generationSeed: `public-cutover-v1:arithmetic:${blockId}`,
      includeAnswerKey: true,
    };
    const before = buildArithmeticWorksheet(options);
    const after = buildPublicPracticeWorksheet({ ...options, practiceMode: "arithmetic" });
    assert.equal(before.ok, true, JSON.stringify(before.errors));
    assert.equal(after.ok, true, JSON.stringify(after.errors));
    assert.deepEqual(after.worksheetDocument.questions, before.worksheetDocument.questions);
    assert.deepEqual(after.worksheetDocument.answerKeyItems, before.worksheetDocument.answerKeyItems);
    assert.equal(after.worksheetDocument.configSnapshot.metadata.path1BlockId, blockId);
    assert.equal(after.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
  }
});

test("public adapter exposes transfer only for P1-01/P1-02 and projects modeling metadata", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 20,
      generationSeed: `public-cutover-v1:transfer:${blockId}`,
      includeAnswerKey: true,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.questions.length, 20);
    assert.ok(result.worksheetDocument.questions.every((item) => item.mode === "application"));
    assert.ok(result.worksheetDocument.questions.every((item) => item.prompt.includes("請先列出乘法算式，再寫答案。")));
    const metadata = result.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.path1BlockId, blockId);
    assert.equal(metadata.practiceMode, PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE);
    assert.equal(metadata.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
    assert.ok(Array.isArray(metadata.semanticPatternSpecIdsUsed));
    assert.equal(metadata.modelingTransferGateId, PATH1_EQUAL_GROUPS_MODELING_TRANSFER_GATE_ID);
    assert.equal(metadata.modelingTransferMasteryCredit, PATH1_EQUAL_GROUPS_MODELING_TRANSFER_MASTERY_CREDIT);
  }

  for (const blockId of ["P1-03", "P1-04"]) {
    const unsupported = buildPublicPracticeWorksheet({
      blockId,
      questionCount: 1,
      generationSeed: `public-cutover-v1:unsupported:${blockId}`,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    });
    assert.equal(unsupported.ok, false);
    assert.ok(errorCodes(unsupported).has("PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
  }
});

test("unknown practice mode fails closed at the public adapter", () => {
  const result = buildPublicPracticeWorksheet({
    blockId: "P1-01",
    questionCount: 1,
    generationSeed: "public-cutover-v1:unknown-mode",
    practiceMode: "unknown-mode",
  });
  assert.equal(result.ok, false);
  assert.ok(errorCodes(result).has("PATH1_PRACTICE_MODE_NOT_SUPPORTED"));
});

test("Path1 visible page and controller expose only the bounded local cutover", () => {
  const html = fs.readFileSync("site/path1/index.html", "utf8");
  const controller = fs.readFileSync("site/assets/browser/path1-manual.js", "utf8");

  assert.match(html, /id="path1-practice-mode"/);
  assert.match(html, /value="arithmetic">算式練習/);
  assert.match(html, /value="equalGroupsTransfer">文字建模練習/);

  assert.match(controller, /build-path1-manual-worksheet-practice-mode-entry\.js/);
  assert.match(controller, /state\/path1-manual-query-state\.js/);
  assert.match(controller, /practiceMode,/);
  assert.match(controller, /PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED/);
  assert.doesNotMatch(controller, /state\/query-state\.js/);
});

test("forbidden authority/runtime surfaces remain untouched by the public adapter design", () => {
  const adapter = fs.readFileSync("site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js", "utf8");
  assert.match(adapter, /build-path1-manual-worksheet-p1-03-extension\.js/);
  assert.match(adapter, /build-path1-manual-worksheet\.js/);
  assert.doesNotMatch(adapter, /path1-public-worksheet-binding/);
  assert.doesNotMatch(adapter, /curriculum-matrix/);
});
