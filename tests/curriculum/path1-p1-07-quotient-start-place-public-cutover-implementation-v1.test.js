import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
  PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P107QuotientStartPlaceWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-07-quotient-start-place-worksheet.js";
import {
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPEC_IDS,
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  PATH1_P1_07_TWO_DIGIT_KP_ID,
  PATH1_P1_07_THREE_DIGIT_KP_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  serializePath1ManualQueryState,
  path1ManualBlockSupportsQuotientStartPlace,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
  PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const CONTRACT_PATH = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_IMPLEMENTATION_V1.json",
);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const VALID_BLOCK_IDS = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06", "P1-07", "P1-08"];
const P107_KPS = [PATH1_P1_07_TWO_DIGIT_KP_ID, PATH1_P1_07_THREE_DIGIT_KP_ID];
const P107_CASES = [
  "P107_2DIGIT_LEADING_INSUFFICIENT",
  "P107_2DIGIT_LEADING_SUFFICIENT",
  "P107_3DIGIT_HUNDREDS_INSUFFICIENT",
  "P107_3DIGIT_HUNDREDS_SUFFICIENT",
];

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
    caseId: item.caseId,
    dividend: item.dividend,
    divisor: item.divisor,
    quotient: item.quotient,
    remainder: item.remainder,
    startPlace: item.startPlace,
    quotientDigits: item.quotientDigits,
    relationId: item.relationId,
    metadataPublicCutoverApplied: item.metadata?.publicCutoverApplied,
  }));
}

test("P1-07 public cutover implementation is bounded to the approved four product files", () => {
  assert.equal(contract.taskId, "PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_IMPLEMENTATION_V1");
  assert.equal(contract.operatorApproval, "APPROVED");
  assert.equal(contract.preflightMergeSha, "0c442ea3f957ded56267b69b1a6ec233b3468fe9");
  assert.equal(contract.nonPublicImplementationMergeSha, "f64c6ef05edbb26d0c39144a451667e8c3d3f0b5");
  assert.equal(contract.publicCutoverApplied, true);
  assert.equal(contract.productRuntimeChanged, true);
  assert.equal(contract.visibleUiChanged, true);
  assert.equal(contract.queryStateChanged, true);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p107GeneratorChanged, false);
  assert.equal(contract.p107ValidatorChanged, false);
  assert.equal(contract.p107PatternSpecsChanged, false);
  assert.equal(contract.p107WorksheetAdapterChanged, false);
  assert.deepEqual(contract.changedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
});

test("P1-07 public quotient-place route exactly matches dedicated adapter at 1/20/120 while wrapper owns cutover metadata", () => {
  for (const count of [1, 20, 120]) {
    const options = {
      blockId: "P1-07",
      practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
      questionCount: count,
      generationSeed: `p107-public-cutover-${count}`,
      includeAnswerKey: true,
    };
    const direct = buildPath1P107QuotientStartPlaceWorksheet(options);
    const publicResult = buildPath1ManualWorksheet(options);
    assert.equal(direct.ok, true, JSON.stringify(direct.errors));
    assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
    assert.equal(publicResult.worksheetDocument.questionCount, count);
    assert.equal(answerCount(publicResult.worksheetDocument), count);
    assert.deepEqual(questionProjection(publicResult), questionProjection(direct));
    const metadata = publicResult.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.publicCutoverApplied, true);
    assert.equal(metadata.publicRoute, "path1-manual");
    assert.equal(metadata.publicCutoverGateId, PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_GATE_ID);
    assert.equal(metadata.representationLayer, "quotient_start_place_cases");
    for (const item of publicResult.worksheetDocument.questions) {
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("P1-07 120-item public route preserves all source-backed representation and V1 boundaries", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-07",
    practiceMode: PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE,
    questionCount: 120,
    generationSeed: "p107-public-cutover-capacity",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.worksheetDocument.questions;
  assert.equal(items.length, 120);
  assert.equal(new Set(items.map((item) => item.prompt)).size, 120);
  assert.deepEqual(
    [...new Set(items.map((item) => item.patternSpecId))].sort(),
    [...PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPEC_IDS].sort(),
  );
  assert.deepEqual([...new Set(items.map((item) => item.knowledgePointId))].sort(), [...P107_KPS].sort());
  assert.deepEqual([...new Set(items.map((item) => item.caseId))].sort(), [...P107_CASES].sort());
  for (const item of items) {
    assert.ok(item.divisor >= 2 && item.divisor <= 9);
    assert.equal(item.dividend % item.divisor, 0);
    assert.equal(item.remainder, 0);
    assert.equal(item.quotient, item.dividend / item.divisor);
    assert.equal(String(item.quotient).includes("0"), false);
    assert.equal(item.relationId, null);
    assert.equal(item.metadata.twoDigitDivisorRepresentationUsed, false);
    assert.equal(item.metadata.quotientZeroCaseUsed, false);
    assert.equal(item.metadata.divisorEstimationUsed, false);
    assert.equal(item.metadata.remainderContextInterpretationUsed, false);
    assert.equal(item.metadata.wordProblemRelationUsed, false);
    assert.equal(item.metadata.publicCutoverApplied, false);
  }
});

test("P1-07 public arithmetic binding remains exactly the two matrix KPs and arithmetic still generates", () => {
  const block = getPath1PublicWorksheetBlock("P1-07");
  assert.ok(block);
  assert.deepEqual([...block.knowledgePointIds], P107_KPS);
  const arithmetic = buildPath1ManualWorksheet({
    blockId: "P1-07",
    practiceMode: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    questionCount: 12,
    generationSeed: "p107-public-cutover-arithmetic-preservation",
    includeAnswerKey: true,
  });
  assert.equal(arithmetic.ok, true, JSON.stringify(arithmetic.errors));
  assert.equal(arithmetic.worksheetDocument.questionCount, 12);
  assert.equal(arithmetic.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
});

test("P1-07 public query state accepts quotientStartPlace and unsupported blocks fail safe to arithmetic", () => {
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-07",
    practiceMode: PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE,
  }, { validBlockIds: VALID_BLOCK_IDS });
  assert.equal(normalized.practiceMode, PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE);
  assert.equal(normalized.warnings.length, 0);
  assert.equal(path1ManualBlockSupportsQuotientStartPlace("P1-07"), true);

  const parsed = parsePath1ManualQueryState(
    "?path1BlockId=P1-07&practiceMode=quotientStartPlace",
    { validBlockIds: VALID_BLOCK_IDS },
  );
  assert.equal(parsed.path1BlockId, "P1-07");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE);
  const serialized = serializePath1ManualQueryState(parsed, { validBlockIds: VALID_BLOCK_IDS });
  assert.match(serialized.search, /path1BlockId=P1-07/);
  assert.match(serialized.search, /practiceMode=quotientStartPlace/);

  for (const blockId of ["P1-06", "P1-08"]) {
    const fallback = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_P107_QUOTIENT_START_PLACE_MODE,
    }, { validBlockIds: VALID_BLOCK_IDS });
    assert.equal(fallback.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
    assert.ok(warningCodes(fallback).has("PATH1_PUBLIC_P107_QUOTIENT_PLACE_MODE_BLOCK_NOT_SUPPORTED"));
  }
});

test("P1-06 estimate and earlier text-modeling public routes remain preserved", () => {
  const p106 = buildPath1ManualWorksheet({
    blockId: "P1-06",
    practiceMode: PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
    questionCount: 4,
    generationSeed: "p107-cutover-p106-estimate",
  });
  assert.equal(p106.ok, true, JSON.stringify(p106.errors));

  for (const blockId of ["P1-01", "P1-02"]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
      questionCount: 4,
      generationSeed: `p107-cutover-${blockId}-equal-groups`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  }
  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
      questionCount: 4,
      generationSeed: `p107-cutover-${blockId}-modeling`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  }
});

test("HTML exposes exactly one P1-07 quotient-start-place option without duplicating prior modes", () => {
  const html = fs.readFileSync(path.join(repoRoot, "site/path1/index.html"), "utf8");
  assert.equal((html.match(/<option value="quotientStartPlace">/g) ?? []).length, 1);
  assert.equal((html.match(/<option value="estimateTrialQuotient">/g) ?? []).length, 1);
  assert.equal((html.match(/<option value="equalGroupsTransfer">/g) ?? []).length, 1);
  assert.equal((html.match(/<option value="multiplicativeModelingTransfer">/g) ?? []).length, 1);
  assert.match(html, /P1-07 可使用「商的位值練習」/);
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
