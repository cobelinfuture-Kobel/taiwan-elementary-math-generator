import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1P105MultiplicativeModelingItems,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-generator.js";
import {
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  isPath1P105ZeroMiddleAmountPerGroup,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-patterns.js";
import {
  validatePath1P105MultiplicativeModelingItem,
  validatePath1P105MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-validator.js";
import {
  buildPath1P105MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js";
import {
  buildPath1EqualGroupsTransferItems,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";
import {
  buildPath1P103MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js";
import {
  buildPath1P104MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-generator.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const REGISTRY_PATH = "data/curriculum/pattern_specs/PATH1_P1_05_ZeroSpecialMultiplicativeModelingPatternSpecRegistry.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";

const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));

function build(count, seed = `path1-p105-modeling:${count}`) {
  return buildPath1P105MultiplicativeModelingItems({
    blockId: PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
    count,
    seed,
    practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  });
}

function clone(value) {
  return structuredClone(value);
}

function errorCodes(validation) {
  return new Set(validation.errors.map((entry) => entry.code));
}

function assertRelativeImportsExist(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const resolved = path.resolve(path.dirname(filePath), match[1]);
    assert.equal(fs.existsSync(resolved), true, `${filePath} -> ${match[1]}`);
  }
}

test("implementation follows merged P1-05 preflight and remains non-public", () => {
  assert.equal(preflight.status, "P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
  assert.equal(implementation.status, "P1_05_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.operatorApproval, "APPROVED");
  assert.equal(implementation.preflightMergeSha, "a847f430c3252842937d394a1f518d0b03386280");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.visibleUiChanged, false);
  assert.equal(implementation.queryStateChanged, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.path1MatrixChanged, false);
  assert.equal(implementation.g3bU08CanonicalAuthorityChanged, false);
  assert.equal(implementation.g4bU01ModelingExpanded, false);
  assert.equal(implementation.p101P102P103P104TransfersChanged, false);
  assert.equal(implementation.p112PublicRouteChanged, false);
  assert.equal(implementation.distance.goalDistanceBefore, "D2_P105_ZERO_SPECIAL_R03_TRANSFER_AND_VALIDATOR_CONTRACT_LOCKED");
  assert.equal(implementation.distance.goalDistanceAfterTarget, "D1_P105_PATH1_LOCAL_PATTERN_GENERATOR_VALIDATOR_WORKSHEET_USABLE");
});

test("P1-05 registry materializes exactly four local R03 families without widening canonical authority", () => {
  assert.equal(registry.status, "PATH1_LOCAL_PATTERN_SPECS_MATERIALIZED_NON_PUBLIC");
  assert.equal(registry.path1BlockId, "P1-05");
  assert.equal(registry.arithmeticKnowledgePointId, PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID);
  assert.equal(registry.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.equal(registry.relationId, "R03_EQUAL_GROUPS");
  assert.equal(registry.unknownRole, "totalAmount");
  assert.equal(registry.numericAuthority.operandPairCapacityBeforeContextProjection, 648);
  assert.equal(registry.numericAuthority.writesBackToG3BU08CanonicalAuthority, false);
  assert.equal(registry.numericAuthority.adoptsG4BU01PublicBindingBreadth, false);
  assert.deepEqual(PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS, [
    "P105_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P105_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P105_R03_SCORE_PER_EVENT_TOTAL",
    "P105_R03_AMOUNT_PER_PERIOD_TOTAL",
  ]);
  assert.deepEqual(registry.patternSpecs.map((entry) => entry.patternSpecId), PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS);
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceSurfaceLineageOnly === true));
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceParentNumericAuthorityReused === false));
  assert.ok(registry.patternSpecs.every((entry) => entry.contexts.length === 3));
  assert.equal(registry.globalBoundaries.publicCutoverApplied, false);
  assert.equal(registry.globalBoundaries.publicBindingReconciled, false);
});

test("P1-05 matrix remains exactly the single zero-middle G3A-U03 primary KP", () => {
  const block = matrix.blocks.find((entry) => entry.blockId === "P1-05");
  assert.ok(block);
  assert.deepEqual(block.primaryKnowledgePointIds, ["kp_g3a_u03_3digit_zero_middle_by_1digit"]);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-04"]);
});

test("generator and validator accept 1/20/120 while preserving the zero-middle arithmetic boundary", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.generated, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P105MultiplicativeModelingItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    for (const item of result.items) {
      assert.equal(item.mode, "application");
      assert.equal(item.path1BlockId, "P1-05");
      assert.equal(item.knowledgePointId, PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID);
      assert.equal(item.arithmeticKnowledgePointId, PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID);
      assert.equal(item.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
      assert.equal(item.relationId, "R03_EQUAL_GROUPS");
      assert.equal(item.unknownRole, "totalAmount");
      assert.equal(isPath1P105ZeroMiddleAmountPerGroup(item.amountPerGroup), true);
      assert.ok(item.groupCount >= 2 && item.groupCount <= 9);
      assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
      assert.ok(item.totalAmount >= 202 && item.totalAmount <= 8181);
      assert.equal(item.finalAnswer, item.totalAmount);
      assert.equal(item.equationModel, `${item.amountPerGroup} × ${item.groupCount} = ${item.totalAmount}`);
      assert.equal(item.metadata.zeroMiddleArithmeticBoundaryPreserved, true);
      assert.equal(item.metadata.languageDifficulty, "LD0_DIRECT_ROLE_EXPLICIT");
      assert.equal(item.metadata.singleRelationOnly, true);
      assert.equal(item.metadata.unitConversionUsed, false);
      assert.equal(item.metadata.semanticCommutativeRoleSwapAllowed, false);
      assert.equal(item.metadata.g4bU01ModelingExpanded, false);
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("120 items balance all four families and prove the full-envelope projection above G3B-U08's 999 cap", () => {
  const result = build(120, "path1-p105-modeling:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(Object.values(result.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
  assert.equal(result.summary.distinctPromptCount, 120);
  assert.equal(result.summary.operandPairCapacityBeforeContextProjection, 648);
  assert.equal(result.summary.includesTotalAbove999, true);
  assert.equal(result.summary.includesLowBoundary, true);
  assert.equal(result.summary.includesHighBoundary, true);
  assert.ok(result.items.some((entry) => entry.totalAmount === 202));
  assert.ok(result.items.some((entry) => entry.totalAmount === 8181));
});

test("same seed replays exactly and different seed changes the generated sequence", () => {
  const a = build(40, "path1-p105-modeling:replay");
  const b = build(40, "path1-p105-modeling:replay");
  const c = build(40, "path1-p105-modeling:replay-different");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("generator fails closed outside P1-05, invalid mode/count, or missing seed", () => {
  let result = buildPath1P105MultiplicativeModelingItems({ blockId: "P1-04", count: 20, seed: "wrong-block" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P105_MODELING_BLOCK_NOT_SUPPORTED");

  result = buildPath1P105MultiplicativeModelingItems({ blockId: "P1-05", count: 20, seed: "wrong-mode", practiceMode: "equalGroupsTransfer" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P105_MODELING_PRACTICE_MODE_INVALID");

  result = buildPath1P105MultiplicativeModelingItems({ count: 121, seed: "too-many" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P105_MODELING_COUNT_INVALID");

  result = buildPath1P105MultiplicativeModelingItems({ count: 20, seed: "" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P105_MODELING_SEED_REQUIRED");
});

test("validator fails closed on zero-boundary, G4B leakage, inverse role, role swap, wrong unit/equation, and unapproved PatternSpec", () => {
  const result = build(20, "path1-p105-modeling:negative");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.amountPerGroup = 314;
  mutated.leftFactor = 314;
  mutated.totalAmount = 314 * mutated.groupCount;
  mutated.product = mutated.totalAmount;
  mutated.finalAnswer = mutated.totalAmount;
  mutated.metadata.amountPerGroup = 314;
  mutated.metadata.leftFactor = 314;
  mutated.metadata.totalAmount = mutated.totalAmount;
  mutated.metadata.product = mutated.totalAmount;
  let validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_ZERO_MIDDLE_BOUNDARY_FAILED"));

  mutated = clone(original);
  mutated.knowledgePointId = "kp_g4b_u01_multiplier_internal_zero";
  mutated.arithmeticKnowledgePointId = "kp_g4b_u01_multiplier_internal_zero";
  mutated.metadata.arithmeticKnowledgePointId = "kp_g4b_u01_multiplier_internal_zero";
  mutated.metadata.g4bU01ModelingExpanded = true;
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_G4BU01_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.unknownRole = "groupCount";
  mutated.metadata.unknownRole = "groupCount";
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.semanticRoleBinding = { leftFactor: "groupCount", rightFactor: "amountPerGroup", product: "totalAmount" };
  mutated.metadata.semanticRoleBinding = clone(mutated.semanticRoleBinding);
  mutated.metadata.semanticCommutativeRoleSwapAllowed = true;
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.equationModel = `${original.groupCount} × ${original.amountPerGroup} = ${original.totalAmount}`;
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_EQUATION_ROLE_MISMATCH"));

  mutated = clone(original);
  mutated.finalAnswerUnit = "盒";
  mutated.metadata.answerUnit = "盒";
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_ANSWER_UNIT_MISMATCH"));

  mutated = clone(original);
  mutated.patternSpecId = "P105_R03_UNAPPROVED";
  mutated.metadata.patternSpecId = "P105_R03_UNAPPROVED";
  validation = validatePath1P105MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P105_MODELING_UNAPPROVED_PATTERN_SPEC"));
});

test("dedicated non-public worksheet renders application questions and equation-bearing answer key", () => {
  const result = buildPath1P105MultiplicativeModelingWorksheet({
    blockId: "P1-05",
    questionCount: 120,
    generationSeed: "path1-p105-worksheet-120",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.ok(document);
  assert.equal(document.questionCount, 120);
  assert.equal(document.questionDisplayModels.length, 120);
  assert.equal(document.answerKeyItems.length, 120);
  assert.ok(document.answerKeyItems.every((entry) => /×/.test(entry.answerText) && /答：/.test(entry.answerText)));
  assert.equal(document.metadata.path1BlockId, "P1-05");
  assert.equal(document.metadata.publicCutoverApplied, false);
  assert.equal(document.metadata.publicBindingReconciled, false);
  assert.equal(document.metadata.g4bU01ModelingExpanded, false);
  assert.equal(document.metadata.zeroMiddleArithmeticBoundaryPreserved, true);
});

test("existing P1-01/P1-02 transfer and P1-03/P1-04 modeling remain usable", () => {
  const p101 = buildPath1EqualGroupsTransferItems({ blockId: "P1-01", count: 8, seed: "p105-preserve-p101" });
  const p102 = buildPath1EqualGroupsTransferItems({ blockId: "P1-02", count: 8, seed: "p105-preserve-p102" });
  const p103 = buildPath1P103MultiplicativeModelingItems({ blockId: "P1-03", count: 8, seed: "p105-preserve-p103" });
  const p104 = buildPath1P104MultiplicativeModelingItems({ blockId: "P1-04", count: 8, seed: "p105-preserve-p104" });
  assert.equal(p101.ok, true, JSON.stringify(p101.errors));
  assert.equal(p102.ok, true, JSON.stringify(p102.errors));
  assert.equal(p103.ok, true, JSON.stringify(p103.errors));
  assert.equal(p104.ok, true, JSON.stringify(p104.errors));
});

test("current public P1-05 arithmetic compatibility breadth remains untouched and excluded from modeling authority", () => {
  const publicBlock = getPath1PublicWorksheetBlock("P1-05");
  assert.ok(publicBlock);
  assert.deepEqual(publicBlock.knowledgePointIds, [
    "kp_g3a_u03_3digit_zero_middle_by_1digit",
    "kp_g4b_u01_multiplier_internal_zero",
    "kp_g4b_u01_trailing_zero_multiplication",
  ]);
  assert.deepEqual(implementation.publicBindingBoundary.observedCompatibilityBreadthNotAdoptedForModeling, [
    "kp_g4b_u01_multiplier_internal_zero",
    "kp_g4b_u01_trailing_zero_multiplication",
  ]);
  assert.equal(implementation.publicBindingBoundary.publicBindingChanged, false);
  assert.equal(implementation.publicBindingBoundary.separateReconciliationRequiredBeforeCutover, true);
});

test("all new production relative static imports resolve at repository HEAD", () => {
  for (const filePath of [
    "site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-patterns.js",
    "site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-generator.js",
    "site/modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-validator.js",
    "site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js",
  ]) assertRelativeImportsExist(filePath);
});
