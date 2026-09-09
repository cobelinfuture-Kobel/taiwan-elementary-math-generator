import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1P107QuotientStartPlaceItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-generator.js";
import {
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPEC_IDS,
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  PATH1_P1_07_THREE_DIGIT_KP_ID,
  PATH1_P1_07_TWO_DIGIT_KP_ID,
  getPath1P107Case,
} from "../../site/modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-patterns.js";
import {
  validatePath1P107QuotientStartPlaceItem,
  validatePath1P107QuotientStartPlaceItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-validator.js";
import {
  buildPath1P107QuotientStartPlaceWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-07-quotient-start-place-worksheet.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_V1.json";
const REGISTRY_PATH = "data/curriculum/pattern_specs/PATH1_P1_07_QuotientStartPlacePatternSpecRegistry.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const G3B_U01_PATH = "data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json";
const CLOUD_REVIEW_PATH = "data/curriculum/application/reviews/PATH1_P1_05_P1_07_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json";
const PUBLIC_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";

const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const g3bU01 = JSON.parse(fs.readFileSync(G3B_U01_PATH, "utf8"));
const cloudReview = JSON.parse(fs.readFileSync(CLOUD_REVIEW_PATH, "utf8"));

function build(count, seed = `path1-p107-quotient-place:${count}`) {
  return buildPath1P107QuotientStartPlaceItems({
    blockId: "P1-07",
    count,
    seed,
    practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
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

test("implementation follows merged three-lane P1-07 preflight and remains non-public", () => {
  assert.equal(preflight.status, "P1_07_QUOTIENT_START_PLACE_PREFLIGHT_CLOUD_PROVENANCE_RECONCILED_NO_RUNTIME");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_V1");
  assert.equal(implementation.status, "P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.operatorApproval, "APPROVED");
  assert.equal(implementation.preflightMergeSha, "1fbb69ff6f3893400653ddf4d781fa9dd7e971c0");
  assert.equal(implementation.cloudProvenanceMergeSha, "0333cc608ad29a154eaedafb9eb2508332894a59");
  assert.equal(implementation.runtimeChanged, true);
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.visibleUiChanged, false);
  assert.equal(implementation.queryStateChanged, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.path1MatrixChanged, false);
  assert.equal(implementation.g3bU01CanonicalAuthorityChanged, false);
  assert.equal(implementation.twoDigitDivisorRuntimeAdmitted, false);
  assert.equal(implementation.quotientZeroPrimaryV1, false);
  assert.equal(implementation.distance.goalDistanceBefore, "D2_P107_SOURCE_AUTHORITY_PREFLIGHT_PASS_CI_SYNCED_AND_MERGED");
  assert.equal(implementation.distance.goalDistanceAfterTarget, "D1_P107_QUOTIENT_START_PLACE_GENERATOR_VALIDATOR_WORKSHEET_USABLE_NON_PUBLIC");
});

test("local registry materializes exactly four source-backed representation PatternSpecs", () => {
  assert.equal(registry.status, "PATH1_LOCAL_REPRESENTATION_PATTERN_SPECS_MATERIALIZED_NON_PUBLIC");
  assert.equal(registry.path1BlockId, "P1-07");
  assert.equal(registry.practiceMode, PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE);
  assert.equal(registry.relationId, null);
  assert.equal(registry.wordProblemRelationMinted, false);
  assert.equal(registry.canonicalKnowledgePointMinted, false);
  assert.deepEqual(registry.matrixPrimaryKnowledgePointIds, [
    PATH1_P1_07_TWO_DIGIT_KP_ID,
    PATH1_P1_07_THREE_DIGIT_KP_ID,
  ]);
  assert.deepEqual(registry.patternSpecs.map((entry) => entry.patternSpecId), PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPEC_IDS);
  assert.equal(registry.sourceEvidenceBoundary.twoDigitDivisorExamEvidencePresent, true);
  assert.equal(registry.sourceEvidenceBoundary.twoDigitDivisorRuntimeAdmitted, false);
  assert.equal(registry.sourceEvidenceBoundary.liTeacherUse, "NO_DIRECT_WITNESS_NO_PATTERN_ADMISSION");
});

test("canonical G3B-U01 and Path1 matrix remain exact for the two primary P1-07 KPs", () => {
  assert.equal(g3bU01.sourceId, "g3b_u01_3b01");
  const block = matrix.blocks.find((entry) => entry.blockId === "P1-07");
  assert.ok(block);
  assert.deepEqual(block.primaryKnowledgePointIds, [
    PATH1_P1_07_TWO_DIGIT_KP_ID,
    PATH1_P1_07_THREE_DIGIT_KP_ID,
  ]);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-06"]);
  const binding = getPath1PublicWorksheetBlock("P1-07");
  assert.ok(binding);
  assert.deepEqual([...binding.knowledgePointIds], block.primaryKnowledgePointIds);
  const kpIds = new Set(g3bU01.knowledgePoints.map((entry) => entry.knowledgePointId));
  assert.ok(kpIds.has(PATH1_P1_07_TWO_DIGIT_KP_ID));
  assert.ok(kpIds.has(PATH1_P1_07_THREE_DIGIT_KP_ID));
});

test("cloud source reconciliation remains consumed without admitting unsupported Li Teacher or two-digit-divisor runtime", () => {
  const p107 = cloudReview.reconciliations.find((entry) => entry.blockId === "P1-07");
  assert.ok(p107);
  assert.equal(p107.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
  assert.equal(implementation.representationAuthority.liTeacherDirectPatternAdmission, false);
  assert.equal(implementation.representationAuthority.twoDigitDivisorExamEvidenceRole, "SEMANTIC_REPRESENTATION_EVIDENCE_ONLY_NOT_RUNTIME");
});

test("formal case helper implements the four approved leading-place relations exactly", () => {
  assert.deepEqual(getPath1P107Case({ dividend: 18, divisor: 3 }), {
    caseId: "P107_2DIGIT_LEADING_INSUFFICIENT",
    dividendDigits: 2,
    leadingDigit: 1,
    expectedStartPlace: "ONES",
    expectedQuotientDigits: 1,
    knowledgePointId: PATH1_P1_07_TWO_DIGIT_KP_ID,
  });
  assert.deepEqual(getPath1P107Case({ dividend: 84, divisor: 4 }), {
    caseId: "P107_2DIGIT_LEADING_SUFFICIENT",
    dividendDigits: 2,
    leadingDigit: 8,
    expectedStartPlace: "TENS",
    expectedQuotientDigits: 2,
    knowledgePointId: PATH1_P1_07_TWO_DIGIT_KP_ID,
  });
  assert.deepEqual(getPath1P107Case({ dividend: 168, divisor: 4 }), {
    caseId: "P107_3DIGIT_HUNDREDS_INSUFFICIENT",
    dividendDigits: 3,
    leadingDigit: 1,
    expectedStartPlace: "TENS",
    expectedQuotientDigits: 2,
    knowledgePointId: PATH1_P1_07_THREE_DIGIT_KP_ID,
  });
  assert.deepEqual(getPath1P107Case({ dividend: 864, divisor: 4 }), {
    caseId: "P107_3DIGIT_HUNDREDS_SUFFICIENT",
    dividendDigits: 3,
    leadingDigit: 8,
    expectedStartPlace: "HUNDREDS",
    expectedQuotientDigits: 3,
    knowledgePointId: PATH1_P1_07_THREE_DIGIT_KP_ID,
  });
  assert.equal(getPath1P107Case({ dividend: 302, divisor: 42 }), null);
});

test("generator and validator accept 1/20/120 and stay inside one-digit exact-division V1", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P107QuotientStartPlaceItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    for (const item of result.items) {
      assert.equal(item.mode, "numeric");
      assert.equal(item.path1BlockId, "P1-07");
      assert.ok([PATH1_P1_07_TWO_DIGIT_KP_ID, PATH1_P1_07_THREE_DIGIT_KP_ID].includes(item.knowledgePointId));
      assert.ok(item.divisor >= 2 && item.divisor <= 9);
      assert.equal(item.dividend % item.divisor, 0);
      assert.equal(item.remainder, 0);
      assert.equal(item.quotient, item.dividend / item.divisor);
      assert.equal(String(item.quotient).includes("0"), false);
      assert.equal(item.metadata.twoDigitDivisorRepresentationUsed, false);
      assert.equal(item.metadata.divisorEstimationUsed, false);
      assert.equal(item.metadata.remainderContextInterpretationUsed, false);
      assert.equal(item.metadata.wordProblemRelationUsed, false);
      assert.equal(item.relationId, null);
      assert.equal(item.unknownRole, null);
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("120 items balance all four representations and cover both KPs plus all four formal cases", () => {
  const result = build(120, "path1-p107-quotient-place:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(Object.values(result.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
  assert.equal(result.summary.distinctPromptCount, 120);
  assert.ok(result.summary.knowledgePointCounts[PATH1_P1_07_TWO_DIGIT_KP_ID] > 0);
  assert.ok(result.summary.knowledgePointCounts[PATH1_P1_07_THREE_DIGIT_KP_ID] > 0);
  for (const count of Object.values(result.summary.caseCounts)) assert.ok(count > 0);
  assert.equal(result.summary.exactDivisionOnly, true);
  assert.equal(result.summary.quotientZeroCaseUsed, false);
  assert.equal(result.summary.twoDigitDivisorRepresentationUsed, false);
  assert.equal(result.summary.divisorEstimationUsed, false);
  assert.equal(result.summary.wordProblemModelingUsed, false);
});

test("same seed replays exactly and different seed changes sequence", () => {
  const a = build(40, "path1-p107-quotient-place:replay");
  const b = build(40, "path1-p107-quotient-place:replay");
  const c = build(40, "path1-p107-quotient-place:replay-other");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("generator fails closed on block/mode/count/seed violations", () => {
  let result = buildPath1P107QuotientStartPlaceItems({ blockId: "P1-08", count: 20, seed: "bad-block" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P107_QUOTIENT_PLACE_BLOCK_NOT_SUPPORTED");

  result = buildPath1P107QuotientStartPlaceItems({ blockId: "P1-07", count: 20, seed: "bad-mode", practiceMode: "estimateTrialQuotient" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P107_QUOTIENT_PLACE_PRACTICE_MODE_INVALID");

  result = buildPath1P107QuotientStartPlaceItems({ count: 121, seed: "too-many" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P107_QUOTIENT_PLACE_COUNT_INVALID");

  result = buildPath1P107QuotientStartPlaceItems({ count: 20, seed: "" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P107_QUOTIENT_PLACE_SEED_REQUIRED");
});

test("validator fails closed on divisor, exactness, place, digit-count, zero-case, estimation, relation, and PatternSpec mutations", () => {
  const result = build(20, "path1-p107-quotient-place:negative");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.divisor = 12;
  mutated.metadata.divisor = 12;
  let validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_DIVISOR_OUT_OF_SCOPE"));

  mutated = clone(original);
  mutated.remainder = 1;
  mutated.metadata.remainder = 1;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_EXACT_DIVISION_REQUIRED"));

  mutated = clone(original);
  mutated.startPlace = mutated.startPlace === "ONES" ? "TENS" : "ONES";
  mutated.metadata.startPlace = mutated.startPlace;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_START_PLACE_MISMATCH"));

  mutated = clone(original);
  mutated.quotientDigits += 1;
  mutated.metadata.quotientDigits = mutated.quotientDigits;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_DIGIT_COUNT_MISMATCH"));

  mutated = clone(original);
  mutated.quotient = 20;
  mutated.metadata.quotient = 20;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_ZERO_CASE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.divisorEstimationUsed = true;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_ESTIMATION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.relationId = "R03_EQUAL_GROUPS";
  mutated.metadata.relationId = "R03_EQUAL_GROUPS";
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_RELATION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.patternSpecId = "P107_TWO_DIGIT_DIVISOR_UNAPPROVED";
  mutated.metadata.representationPatternId = mutated.patternSpecId;
  validation = validatePath1P107QuotientStartPlaceItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P107_QUOTIENT_PLACE_UNAPPROVED_PATTERN_SPEC"));
});

test("dedicated non-public worksheet renders 120 numeric questions and answer-key parity", () => {
  const result = buildPath1P107QuotientStartPlaceWorksheet({
    blockId: "P1-07",
    questionCount: 120,
    generationSeed: "path1-p107-quotient-place-worksheet-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.ok(document);
  assert.equal(document.questionCount, 120);
  assert.equal(document.questions.length, 120);
  assert.equal(countCells(document.questionPages, "question"), 120);
  assert.equal(countCells(document.answerKeyPages, "answerKey"), 120);
  assert.equal(document.metadata.path1BlockId, "P1-07");
  assert.equal(document.metadata.practiceMode, PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE);
  assert.equal(document.metadata.publicCutoverApplied, false);
  assert.equal(document.metadata.twoDigitDivisorRepresentationUsed, false);
  assert.equal(document.metadata.quotientZeroCaseUsed, false);
});

test("implementation is additive/non-public and new executable files pass relative static-import smoke", () => {
  assert.equal(implementation.scope.implementationType, "NON_PUBLIC_PATH1_LOCAL_REPRESENTATION_AND_VALIDATION_LAYER");
  assert.equal(implementation.scope.publicRoute, "NOT_CONNECTED");
  assert.equal(implementation.worksheetContract.public, false);
  assert.equal(implementation.wordProblemRelationMinted, false);
  assert.equal(implementation.p101ThroughP106RuntimeChanged, false);
  assert.equal(implementation.p108OrLaterRuntimeChanged, false);
  assert.equal(fs.readFileSync(PUBLIC_ENTRY_PATH, "utf8").includes("quotientStartPlace"), false);

  for (const filePath of implementation.runtimeArtifacts) assertRelativeImportsExist(filePath);
});
