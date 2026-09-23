import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1P106EstimateTrialQuotientItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-generator.js";
import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPEC_IDS,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
  getPath1P106WholeTenEstimate,
  isPath1P106SourceBackedEstimateDivisor,
} from "../../site/modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-patterns.js";
import {
  validatePath1P106EstimateTrialQuotientItem,
  validatePath1P106EstimateTrialQuotientItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-validator.js";
import {
  buildPath1P106EstimateTrialQuotientWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-06-estimate-trial-quotient-worksheet.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_06_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_IMPLEMENTATION_V1.json";
const REGISTRY_PATH = "data/curriculum/pattern_specs/PATH1_P1_06_EstimateTrialQuotientPatternSpecRegistry.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const PUBLIC_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";

const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));

function build(count, seed = `path1-p106-estimate:${count}`) {
  return buildPath1P106EstimateTrialQuotientItems({
    blockId: "P1-06",
    count,
    seed,
    practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  });
}

function clone(value) {
  return structuredClone(value);
}

function errorCodes(validation) {
  return new Set(validation.errors.map((entry) => entry.code));
}

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

function assertRelativeImportsExist(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const resolved = path.resolve(path.dirname(filePath), match[1]);
    assert.equal(fs.existsSync(resolved), true, `${filePath} -> ${match[1]}`);
  }
}

test("implementation follows merged P1-06 preflight and remains non-public", () => {
  assert.equal(preflight.status, "P1_06_ESTIMATE_TRIAL_QUOTIENT_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_IMPLEMENTATION_V1");
  assert.equal(implementation.status, "P1_06_ESTIMATE_TRIAL_QUOTIENT_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.operatorApproval, "APPROVED");
  assert.equal(implementation.preflightMergeSha, "d2234131a79af72f755835167e451959fb21a9cf");
  assert.equal(implementation.runtimeChanged, true);
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.visibleUiChanged, false);
  assert.equal(implementation.queryStateChanged, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.path1MatrixChanged, false);
  assert.equal(implementation.g4aU04CanonicalAuthorityChanged, false);
  assert.equal(implementation.wordProblemRelationMinted, false);
  assert.equal(implementation.distance.goalDistanceBefore, "D2_P106_ESTIMATE_TRIAL_QUOTIENT_MAPPING_PATTERN_CANDIDATES_AND_VALIDATOR_BOUNDARY_LOCKED");
  assert.equal(implementation.distance.goalDistanceAfterTarget, "D1_P106_ESTIMATE_TRIAL_QUOTIENT_GENERATOR_VALIDATOR_WORKSHEET_USABLE_NON_PUBLIC");
});

test("local registry materializes exactly four representation PatternSpecs with no relation mint", () => {
  assert.equal(registry.status, "PATH1_LOCAL_REPRESENTATION_PATTERN_SPECS_MATERIALIZED_NON_PUBLIC");
  assert.equal(registry.path1BlockId, "P1-06");
  assert.equal(registry.practiceMode, PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE);
  assert.equal(registry.relationId, null);
  assert.equal(registry.wordProblemRelationMinted, false);
  assert.equal(registry.canonicalKnowledgePointMinted, false);
  assert.deepEqual(registry.matrixPrimaryKnowledgePointIds, [
    PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
    PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  ]);
  assert.deepEqual(registry.patternSpecs.map((entry) => entry.patternSpecId), PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPEC_IDS);
  assert.deepEqual(registry.roundingEvidenceBoundary.allowedDivisorOnesDigits, [1, 2, 3, 4, 6, 7, 8, 9]);
  assert.equal(registry.roundingEvidenceBoundary.divisorsEndingInFiveGenerated, false);
  assert.equal(registry.roundingEvidenceBoundary.divisorsEndingInZeroGenerated, false);
});

test("Path1 matrix and public arithmetic binding remain aligned to the two P1-06 primary KPs", () => {
  const block = matrix.blocks.find((entry) => entry.blockId === "P1-06");
  assert.ok(block);
  assert.deepEqual(block.primaryKnowledgePointIds, [
    PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
    PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  ]);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-05"]);
  const binding = getPath1PublicWorksheetBlock("P1-06");
  assert.ok(binding);
  assert.deepEqual([...binding.knowledgePointIds], block.primaryKnowledgePointIds);
});

test("rounding helper preserves source-unambiguous whole-ten evidence boundary", () => {
  assert.equal(getPath1P106WholeTenEstimate(11), 10);
  assert.equal(getPath1P106WholeTenEstimate(38), 40);
  assert.equal(getPath1P106WholeTenEstimate(47), 50);
  assert.equal(getPath1P106WholeTenEstimate(92), 90);
  assert.equal(getPath1P106WholeTenEstimate(18), 20);
  assert.equal(getPath1P106WholeTenEstimate(14), 10);
  assert.equal(getPath1P106WholeTenEstimate(45), null);
  assert.equal(getPath1P106WholeTenEstimate(40), null);
  assert.equal(isPath1P106SourceBackedEstimateDivisor(99), true);
  assert.equal(getPath1P106WholeTenEstimate(99), 100);
});

test("generator and validator accept 1/20/120 without introducing application semantics", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P106EstimateTrialQuotientItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    for (const item of result.items) {
      assert.equal(item.mode, "numeric");
      assert.equal(item.path1BlockId, "P1-06");
      assert.ok([PATH1_P1_06_TENS_SUFFICIENT_KP_ID, PATH1_P1_06_TENS_INSUFFICIENT_KP_ID].includes(item.knowledgePointId));
      assert.ok(item.dividend >= 100 && item.dividend <= 999);
      assert.ok(item.divisor >= 10 && item.divisor <= 99);
      assert.equal(isPath1P106SourceBackedEstimateDivisor(item.divisor), true);
      assert.equal(item.estimateDivisor, getPath1P106WholeTenEstimate(item.divisor));
      assert.equal(item.quotient, Math.floor(item.dividend / item.divisor));
      assert.equal(item.remainder, item.dividend % item.divisor);
      assert.equal(item.divisor * item.quotient + item.remainder, item.dividend);
      assert.ok(item.remainder >= 0 && item.remainder < item.divisor);
      assert.equal(item.relationId, null);
      assert.equal(item.unknownRole, null);
      assert.equal(item.metadata.applicationPromptUsed, false);
      assert.equal(item.metadata.relationPromptUsed, false);
      assert.equal(item.metadata.remainderContextInterpretationUsed, false);
      assert.equal(item.metadata.quotientPlaceTeachingUsed, false);
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("120 items balance all four representations, cover both KPs, and include the four observed estimate anchors", () => {
  const result = build(120, "path1-p106-estimate:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(Object.values(result.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
  assert.equal(result.summary.distinctPromptCount, 120);
  assert.ok(result.summary.knowledgePointCounts[PATH1_P1_06_TENS_SUFFICIENT_KP_ID] > 0);
  assert.ok(result.summary.knowledgePointCounts[PATH1_P1_06_TENS_INSUFFICIENT_KP_ID] > 0);
  assert.deepEqual(result.summary.observedEstimateAnchorsPresent, {
    "11->10": true,
    "38->40": true,
    "47->50": true,
    "92->90": true,
  });
  assert.equal(result.summary.divisorEndingFiveUsed, false);
  assert.equal(result.summary.divisorEndingZeroUsed, false);
  assert.ok(result.items.some((entry) => entry.patternSpecId === "P106_ESTIMATE_DIVISOR_TENS_SELECT"));
  assert.ok(result.items.some((entry) => entry.patternSpecId === "P106_ESTIMATE_DIVISOR_TENS_FILL"));
  assert.ok(result.items.some((entry) => entry.patternSpecId === "P106_ESTIMATE_THEN_DIVIDE_TENS_SUFFICIENT"));
  assert.ok(result.items.some((entry) => entry.patternSpecId === "P106_ESTIMATE_THEN_DIVIDE_TENS_INSUFFICIENT"));
});

test("canonical case boundary remains correct for every generated item", () => {
  const result = build(120, "path1-p106-estimate:case-boundary");
  assert.equal(result.ok, true);
  for (const item of result.items) {
    const firstTwo = Math.floor(item.dividend / 10);
    if (item.knowledgePointId === PATH1_P1_06_TENS_SUFFICIENT_KP_ID) {
      assert.ok(firstTwo >= item.divisor);
      assert.equal(item.metadata.canonicalCase, "tens_sufficient");
      assert.ok(item.quotient >= 10);
    } else {
      assert.ok(firstTwo < item.divisor);
      assert.equal(item.metadata.canonicalCase, "tens_insufficient");
      assert.ok(item.quotient >= 1 && item.quotient <= 9);
    }
  }
});

test("same seed replays exactly and different seed changes sequence", () => {
  const a = build(40, "path1-p106-estimate:replay");
  const b = build(40, "path1-p106-estimate:replay");
  const c = build(40, "path1-p106-estimate:replay-other");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("generator fails closed on block/mode/count/seed violations", () => {
  let result = buildPath1P106EstimateTrialQuotientItems({ blockId: "P1-07", count: 20, seed: "bad-block" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P106_ESTIMATE_BLOCK_NOT_SUPPORTED");

  result = buildPath1P106EstimateTrialQuotientItems({ blockId: "P1-06", count: 20, seed: "bad-mode", practiceMode: "multiplicativeModelingTransfer" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P106_ESTIMATE_PRACTICE_MODE_INVALID");

  result = buildPath1P106EstimateTrialQuotientItems({ count: 121, seed: "too-many" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P106_ESTIMATE_COUNT_INVALID");

  result = buildPath1P106EstimateTrialQuotientItems({ count: 20, seed: "" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P106_ESTIMATE_SEED_REQUIRED");
});

test("validator fails closed on tie-ending, estimate, KP-case, quotient, relation, quotient-place, mode, and PatternSpec mutations", () => {
  const result = build(20, "path1-p106-estimate:negative");
  assert.equal(result.ok, true);
  const original = result.items.find((entry) => entry.patternSpecId === "P106_ESTIMATE_THEN_DIVIDE_TENS_SUFFICIENT") ?? result.items[0];

  let mutated = clone(original);
  mutated.divisor = 45;
  mutated.metadata.divisor = 45;
  let validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_DIVISOR_EVIDENCE_BOUNDARY_FAILED"));

  mutated = clone(original);
  mutated.estimateDivisor += 10;
  mutated.metadata.estimateDivisor = mutated.estimateDivisor;
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_WHOLE_TEN_MISMATCH"));

  mutated = clone(original);
  mutated.knowledgePointId = original.knowledgePointId === PATH1_P1_06_TENS_SUFFICIENT_KP_ID
    ? PATH1_P1_06_TENS_INSUFFICIENT_KP_ID
    : PATH1_P1_06_TENS_SUFFICIENT_KP_ID;
  mutated.metadata.knowledgePointId = mutated.knowledgePointId;
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_KP_CASE_MISMATCH") || errorCodes(validation).has("PATH1_P106_ESTIMATE_PATTERN_KP_MISMATCH"));

  mutated = clone(original);
  mutated.quotient += 1;
  mutated.metadata.quotient = mutated.quotient;
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_QUOTIENT_MISMATCH"));

  mutated = clone(original);
  mutated.relationId = "R03_EQUAL_GROUPS";
  mutated.metadata.relationId = "R03_EQUAL_GROUPS";
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_RELATION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.quotientPlaceTeachingUsed = true;
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_QUOTIENT_PLACE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.mode = "application";
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_QUESTION_MODE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.patternSpecId = "P106_UNAPPROVED";
  mutated.metadata.representationPatternId = "P106_UNAPPROVED";
  validation = validatePath1P106EstimateTrialQuotientItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P106_ESTIMATE_UNAPPROVED_PATTERN_SPEC"));
});

test("dedicated non-public worksheet renders 120 numeric questions and answer-key parity", () => {
  const result = buildPath1P106EstimateTrialQuotientWorksheet({
    blockId: "P1-06",
    questionCount: 120,
    generationSeed: "path1-p106-estimate-worksheet-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.ok(document);
  assert.equal(document.questionCount, 120);
  assert.equal(document.questions.length, 120);
  assert.equal(countCells(document.questionPages, "question"), 120);
  assert.equal(countCells(document.answerKeyPages, "answerKey"), 120);
  assert.ok(document.questions.every((entry) => entry.mode === "numeric"));
  assert.equal(document.configSnapshot.metadata.path1BlockId, "P1-06");
  assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE);
  assert.equal(document.configSnapshot.metadata.relationId, null);
  assert.equal(document.configSnapshot.metadata.wordProblemModelingUsed, false);
  assert.equal(document.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(document.configSnapshot.metadata.quotientPlaceTeachingUsed, false);
  assert.equal(document.configSnapshot.metadata.remainderContextInterpretationUsed, false);
});

test("P1-06 dedicated implementation remains non-public semantic authority after wrapper-level public cutover", () => {
  assert.equal(implementation.scope.implementationType, "NON_PUBLIC_PATH1_LOCAL_REPRESENTATION_AND_VALIDATION_LAYER");
  assert.equal(implementation.scope.publicRoute, "NOT_CONNECTED");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.worksheetContract.public, false);
  assert.equal(implementation.worksheetContract.publicCutoverApplied, false);
  assert.equal(implementation.wordProblemRelationMinted, false);
  assert.equal(implementation.g4aU04CanonicalAuthorityChanged, false);
});

test("new executable files pass relative static-import smoke", () => {
  for (const filePath of implementation.runtimeArtifacts) assertRelativeImportsExist(filePath);
});
