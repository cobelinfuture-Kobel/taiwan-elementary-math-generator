import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
  PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P106EstimateTrialQuotientWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-06-estimate-trial-quotient-worksheet.js";
import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPEC_IDS,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
  getPath1P106WholeTenEstimate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  serializePath1ManualQueryState,
  path1ManualBlockSupportsEstimateTrialQuotient,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const CONTRACT_PATH = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_IMPLEMENTATION_V1.json",
);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06", "P1-07"];
const P106_KPS = [PATH1_P1_06_TENS_SUFFICIENT_KP_ID, PATH1_P1_06_TENS_INSUFFICIENT_KP_ID];
const ALLOWED_ENDINGS = new Set([1, 2, 3, 4, 6, 7, 8, 9]);

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
    patternSpecId: item.patternSpecId,
    dividend: item.dividend,
    divisor: item.divisor,
    estimateDivisor: item.estimateDivisor,
    quotient: item.quotient,
    remainder: item.remainder,
    relationId: item.relationId,
    metadataPublicCutoverApplied: item.metadata?.publicCutoverApplied,
  }));
}

test("P1-06 public cutover implementation is bounded to the approved four product files", () => {
  assert.equal(contract.taskId, "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_IMPLEMENTATION_V1");
  assert.equal(contract.operatorApproval, "APPROVED");
  assert.equal(contract.preflightMergeSha, "8b44bb6fa8b9b8c2fff6f04f61c19c1d3d0fa4ff");
  assert.equal(contract.publicCutoverApplied, true);
  assert.equal(contract.productRuntimeChanged, true);
  assert.equal(contract.visibleUiChanged, true);
  assert.equal(contract.queryStateChanged, true);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p106GeneratorChanged, false);
  assert.equal(contract.p106ValidatorChanged, false);
  assert.equal(contract.p106PatternSpecsChanged, false);
  assert.equal(contract.p106WorksheetAdapterChanged, false);
  assert.deepEqual(contract.changedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
});

test("P1-06 public estimate route exactly matches the dedicated adapter at 1/20/120 while wrapper owns cutover metadata", () => {
  for (const count of [1, 20, 120]) {
    const options = {
      blockId: "P1-06",
      practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
      questionCount: count,
      generationSeed: `p106-public-cutover-${count}`,
      includeAnswerKey: true,
    };
    const direct = buildPath1P106EstimateTrialQuotientWorksheet(options);
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
      PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_GATE_ID,
    );
    for (const item of publicResult.worksheetDocument.questions) {
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("P1-06 120-item public estimate route preserves all source-backed representation boundaries", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-06",
    practiceMode: PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
    questionCount: 120,
    generationSeed: "p106-public-cutover-capacity",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.worksheetDocument.questions;
  assert.equal(items.length, 120);
  assert.equal(new Set(items.map((item) => item.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(items.map((item) => item.patternSpecId))].sort(),
    [...PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPEC_IDS].sort(),
  );
  assert.deepEqual([...new Set(items.map((item) => item.knowledgePointId))].sort(), [...P106_KPS].sort());
  const anchorSet = new Set(items.map((item) => `${item.divisor}->${item.estimateDivisor}`));
  for (const anchor of ["11->10", "38->40", "47->50", "92->90"]) assert.ok(anchorSet.has(anchor), anchor);
  for (const item of items) {
    assert.equal(ALLOWED_ENDINGS.has(item.divisor % 10), true);
    assert.notEqual(item.divisor % 10, 5);
    assert.notEqual(item.divisor % 10, 0);
    assert.equal(item.estimateDivisor, getPath1P106WholeTenEstimate(item.divisor));
    assert.equal(item.quotient, Math.floor(item.dividend / item.divisor));
    assert.equal(item.remainder, item.dividend % item.divisor);
    assert.equal(item.divisor * item.quotient + item.remainder, item.dividend);
    assert.ok(item.remainder >= 0 && item.remainder < item.divisor);
    assert.equal(item.relationId, null);
    assert.equal(item.metadata.applicationPromptUsed, false);
    assert.equal(item.metadata.remainderContextInterpretationUsed, false);
    assert.equal(item.metadata.quotientPlaceTeachingUsed, false);
    assert.equal(item.metadata.publicCutoverApplied, false);
  }
});

test("P1-06 public arithmetic binding remains exactly the two matrix KPs and arithmetic still generates", () => {
  const block = getPath1PublicWorksheetBlock("P1-06");
  assert.ok(block);
  assert.deepEqual([...block.knowledgePointIds], P106_KPS);
  const arithmetic = buildPath1ManualWorksheet({
    blockId: "P1-06",
    practiceMode: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    questionCount: 12,
    generationSeed: "p106-public-cutover-arithmetic-preservation",
    includeAnswerKey: true,
  });
  assert.equal(arithmetic.ok, true, JSON.stringify(arithmetic.errors));
  assert.equal(arithmetic.worksheetDocument.questionCount, 12);
  assert.equal(arithmetic.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
});

test("P1-06 public query state accepts estimate mode and unsupported blocks fail safe to arithmetic", () => {
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-06",
    practiceMode: PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(normalized.practiceMode, PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE);
  assert.equal(normalized.warnings.length, 0);
  assert.equal(path1ManualBlockSupportsEstimateTrialQuotient("P1-06"), true);

  const parsed = parsePath1ManualQueryState(
    "?path1BlockId=P1-06&practiceMode=estimateTrialQuotient",
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(parsed.path1BlockId, "P1-06");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE);
  const serialized = serializePath1ManualQueryState(parsed, { validBlockIds: VALID_BLOCK_IDS });
  assert.match(serialized.search, /path1BlockId=P1-06/);
  assert.match(serialized.search, /practiceMode=estimateTrialQuotient/);

  for (const blockId of ["P1-05", "P1-07"]) {
    const fallback = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
    }, { validBlockIds: VALID_BLOCK_IDS });
    assert.equal(fallback.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
    assert.ok(warningCodes(fallback).has("PATH1_PUBLIC_P106_ESTIMATE_MODE_BLOCK_NOT_SUPPORTED"));
  }
});

test("existing equal-groups and multiplicative-modeling public routes remain preserved", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
      questionCount: 4,
      generationSeed: `p106-cutover-${blockId}-equal-groups`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  }
  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
      questionCount: 4,
      generationSeed: `p106-cutover-${blockId}-modeling`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  }
});

test("HTML exposes exactly one P1-06 estimate/trial-quotient option without duplicating existing modeling modes", () => {
  const html = fs.readFileSync(path.join(repoRoot, "site/path1/index.html"), "utf8");
  assert.equal((html.match(/<option value="estimateTrialQuotient">/g) ?? []).length, 1);
  assert.equal((html.match(/<option value="equalGroupsTransfer">/g) ?? []).length, 1);
  assert.equal((html.match(/<option value="multiplicativeModelingTransfer">/g) ?? []).length, 1);
  assert.match(html, /P1-06 可使用「估商與試商練習」/);
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
