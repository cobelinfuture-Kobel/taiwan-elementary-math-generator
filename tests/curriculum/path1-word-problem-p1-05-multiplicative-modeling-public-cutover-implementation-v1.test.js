import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
  PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
  PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID,
  PATH1_P105_MODELING_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P105MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js";
import {
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  serializePath1ManualQueryState,
  path1ManualBlockSupportsMultiplicativeModeling,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const CONTRACT_PATH = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1.json",
);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06"];
const P105_ONLY_KP = "kp_g3a_u03_3digit_zero_middle_by_1digit";
const FORBIDDEN_G4B = new Set([
  "kp_g4b_u01_multiplier_internal_zero",
  "kp_g4b_u01_trailing_zero_multiplication",
]);

function answerCount(document) {
  return (document?.answerKeyPages ?? [])
    .flatMap((pageEntry) => pageEntry.cells ?? [])
    .filter((cell) => cell.cellType === "answerKey").length;
}

function warningCodes(state) {
  return new Set((state?.warnings ?? []).map((entry) => entry.code));
}

function questionProjection(result) {
  return (result.worksheetDocument?.questions ?? []).map((item) => ({
    prompt: item.prompt,
    answerText: item.answerText,
    knowledgePointId: item.knowledgePointId,
    arithmeticKnowledgePointId: item.arithmeticKnowledgePointId,
    patternSpecId: item.patternSpecId,
    relationId: item.relationId,
    unknownRole: item.unknownRole,
    amountPerGroup: item.amountPerGroup,
    groupCount: item.groupCount,
    totalAmount: item.totalAmount,
    metadataPublicCutoverApplied: item.metadata?.publicCutoverApplied,
    metadataG4bExpanded: item.metadata?.g4bU01ModelingExpanded,
  }));
}

test("P1-05 public cutover implementation is bounded to the approved four product files", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1");
  assert.equal(contract.operatorApproval, "APPROVED");
  assert.equal(contract.publicCutoverApplied, true);
  assert.equal(contract.productRuntimeChanged, true);
  assert.equal(contract.visibleUiChanged, true);
  assert.equal(contract.queryStateChanged, true);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p105GeneratorChanged, false);
  assert.equal(contract.p105ValidatorChanged, false);
  assert.equal(contract.p105PatternSpecsChanged, false);
  assert.deepEqual(contract.changedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
});

test("P1-05 public modeling exactly matches the dedicated adapter at 1/20/120 while route metadata is projected only at wrapper level", () => {
  for (const count of [1, 20, 120]) {
    const options = {
      blockId: "P1-05",
      practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      questionCount: count,
      generationSeed: `p105-public-cutover-${count}`,
      includeAnswerKey: true,
    };
    const direct = buildPath1P105MultiplicativeModelingWorksheet(options);
    const publicResult = buildPath1ManualWorksheet(options);
    assert.equal(direct.ok, true, JSON.stringify(direct.errors));
    assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
    assert.equal(publicResult.worksheetDocument.questionCount, count);
    assert.equal(answerCount(publicResult.worksheetDocument), count);
    assert.deepEqual(questionProjection(publicResult), questionProjection(direct));
    assert.equal(publicResult.worksheetDocument.configSnapshot.metadata.publicCutoverApplied, true);
    assert.equal(publicResult.worksheetDocument.configSnapshot.metadata.publicRoute, "path1-manual");
    assert.equal(
      publicResult.worksheetDocument.configSnapshot.metadata.publicCutoverGateId,
      PATH1_P105_MODELING_PUBLIC_CUTOVER_GATE_ID,
    );
    for (const item of publicResult.worksheetDocument.questions) {
      assert.equal(item.metadata.publicCutoverApplied, false);
      assert.equal(item.metadata.g4bU01ModelingExpanded, false);
    }
  }
});

test("P1-05 120-item public modeling preserves zero-middle full-envelope semantics and excludes G4B-U01 KPs", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 120,
    generationSeed: "p105-public-cutover-capacity",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.worksheetDocument.questions;
  assert.equal(items.length, 120);
  assert.equal(new Set(items.map((item) => item.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(items.map((item) => item.patternSpecId))].sort(),
    [...PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS].sort(),
  );
  assert.equal(items.some((item) => item.totalAmount > 999), true);
  for (const item of items) {
    assert.equal(item.knowledgePointId, P105_ONLY_KP);
    assert.equal(item.arithmeticKnowledgePointId, P105_ONLY_KP);
    assert.equal(FORBIDDEN_G4B.has(item.knowledgePointId), false);
    assert.equal(FORBIDDEN_G4B.has(item.arithmeticKnowledgePointId), false);
    assert.ok(Number.isInteger(item.amountPerGroup));
    assert.ok(item.amountPerGroup >= 101 && item.amountPerGroup <= 909);
    assert.equal(Math.floor(item.amountPerGroup / 10) % 10, 0);
    assert.ok(item.amountPerGroup % 10 >= 1 && item.amountPerGroup % 10 <= 9);
    assert.ok(item.groupCount >= 2 && item.groupCount <= 9);
    assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
    assert.equal(item.relationId, "R03_EQUAL_GROUPS");
    assert.equal(item.unknownRole, "totalAmount");
  }
});

test("P1-05 arithmetic compatibility binding remains three-KP breadth and is not inherited by modeling", () => {
  const block = getPath1PublicWorksheetBlock("P1-05");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [
    P105_ONLY_KP,
    "kp_g4b_u01_multiplier_internal_zero",
    "kp_g4b_u01_trailing_zero_multiplication",
  ]);
  const arithmetic = buildPath1ManualWorksheet({
    blockId: "P1-05",
    practiceMode: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    questionCount: 12,
    generationSeed: "p105-public-cutover-arithmetic-preservation",
    includeAnswerKey: true,
  });
  assert.equal(arithmetic.ok, true, JSON.stringify(arithmetic.errors));
  assert.equal(arithmetic.worksheetDocument.questionCount, 12);
  assert.equal(arithmetic.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
});

test("P1-05 public query state accepts modeling and P1-06 remains fail-safe arithmetic", () => {
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(normalized.practiceMode, PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE);
  assert.equal(normalized.warnings.length, 0);

  const parsed = parsePath1ManualQueryState(
    "?path1BlockId=P1-05&practiceMode=multiplicativeModelingTransfer",
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(parsed.path1BlockId, "P1-05");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE);

  const serialized = serializePath1ManualQueryState(parsed, { validBlockIds: VALID_BLOCK_IDS });
  assert.match(serialized.search, /path1BlockId=P1-05/);
  assert.match(serialized.search, /practiceMode=multiplicativeModelingTransfer/);
  assert.equal(path1ManualBlockSupportsMultiplicativeModeling("P1-05"), true);

  const p106 = normalizePath1ManualQueryState({
    path1BlockId: "P1-06",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p106.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p106).has("PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));

  const p105Early = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(p105Early.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p105Early).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
});

test("P1-03/P1-04 public modeling gate identities and P1-01/P1-02 equal-groups transfer are preserved", () => {
  const p103 = buildPath1ManualWorksheet({
    blockId: "P1-03",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 4,
    generationSeed: "p105-cutover-p103-preservation",
  });
  const p104 = buildPath1ManualWorksheet({
    blockId: "P1-04",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 4,
    generationSeed: "p105-cutover-p104-preservation",
  });
  assert.equal(p103.ok, true, JSON.stringify(p103.errors));
  assert.equal(p104.ok, true, JSON.stringify(p104.errors));
  assert.equal(p103.worksheetDocument.configSnapshot.metadata.publicCutoverGateId, PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID);
  assert.equal(p104.worksheetDocument.configSnapshot.metadata.publicCutoverGateId, PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID);
  assert.notEqual(PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID, PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID);
  assert.notEqual(PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID, PATH1_P105_MODELING_PUBLIC_CUTOVER_GATE_ID);

  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
      questionCount: 4,
      generationSeed: `p105-cutover-${blockId}-transfer-preservation`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.questionCount, 4);
  }
});

test("HTML keeps one shared multiplicative modeling option and documents P1-05", () => {
  const html = fs.readFileSync(path.join(repoRoot, "site/path1/index.html"), "utf8");
  const matches = html.match(/<option value="multiplicativeModelingTransfer">/g) ?? [];
  assert.equal(matches.length, 1);
  assert.match(html, /P1-05 使用中間為 0 的三位數×一位數乘法建模/);
});

test("all relative static imports in changed executable files resolve at repository HEAD", () => {
  const executableFiles = [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
  ];
  const importPattern = /from\s+["'](\.[^"']+)["']/g;
  for (const relativeFile of executableFiles) {
    const absoluteFile = path.join(repoRoot, relativeFile);
    const source = fs.readFileSync(absoluteFile, "utf8");
    let match;
    while ((match = importPattern.exec(source)) !== null) {
      const resolved = path.resolve(path.dirname(absoluteFile), match[1]);
      const candidates = [resolved, `${resolved}.js`, `${resolved}.mjs`, path.join(resolved, "index.js")];
      assert.equal(candidates.some((candidate) => fs.existsSync(candidate)), true, `${relativeFile} -> ${match[1]}`);
    }
  }
});
