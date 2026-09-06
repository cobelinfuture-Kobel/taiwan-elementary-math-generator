import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildPath1P103MultiplicativeModelingItems,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js";
import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  renderPath1P103MultiplicativeModelingPrompt,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js";
import {
  validatePath1P103MultiplicativeModelingItem,
  validatePath1P103MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-validator.js";
import {
  buildPath1P103MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js";
import {
  buildPath1P103DiversityItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-diversity.js";
import {
  buildPath1EqualGroupsTransferItems,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";

const REGISTRY_PATH = "data/curriculum/pattern_specs/PATH1_P1_03_MultiplicativeModelingPatternSpecRegistry.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const P112_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_IMPLEMENTATION_V1.json";
const PRACTICE_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const p112Implementation = JSON.parse(fs.readFileSync(P112_IMPLEMENTATION_PATH, "utf8"));

function build(count, seed = `path1-p103-modeling:${count}`) {
  return buildPath1P103MultiplicativeModelingItems({
    blockId: PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
    count,
    seed,
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  });
}

function countCells(pages, cellType) {
  return (pages ?? []).flatMap((page) => page.cells ?? []).filter((cell) => cell.cellType === cellType).length;
}

function errorCodes(validation) {
  return new Set(validation.errors.map((entry) => entry.code));
}

function clone(value) {
  return structuredClone(value);
}

test("implementation follows the merged P1-03 preflight and remains non-public", () => {
  assert.equal(preflight.status, "P1_03_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
  assert.equal(implementation.status, "P1_03_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.operatorApproval, "APPROVED");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.visibleUiChanged, false);
  assert.equal(implementation.queryStateChanged, false);
  assert.equal(implementation.path1MatrixChanged, false);
  assert.equal(implementation.g3bU08CanonicalAuthorityChanged, false);
  assert.equal(implementation.p101P102TransferChanged, false);
  assert.equal(implementation.p104Changed, false);
  assert.equal(implementation.p112PublicRouteChanged, false);
  assert.equal(implementation.distance.goalDistanceBefore, "D2_P103_TRANSFER_RELATION_AND_PATH1_LOCAL_NUMERIC_ENVELOPE_PREFLIGHT_LOCKED");
  assert.equal(implementation.distance.goalDistanceAfterTarget, "D1_P103_PATH1_LOCAL_PATTERN_GENERATOR_VALIDATOR_WORKSHEET_USABLE");
});

test("Path1-local PatternSpec registry contains exactly the four approved R03 direct-total families", () => {
  assert.equal(registry.status, "PATH1_LOCAL_PATTERN_SPECS_MATERIALIZED_NON_PUBLIC");
  assert.equal(registry.path1BlockId, "P1-03");
  assert.equal(registry.arithmeticKnowledgePointId, "kp_g4a_u02_2digit_by_2digit");
  assert.equal(registry.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.equal(registry.relationId, "R03_EQUAL_GROUPS");
  assert.equal(registry.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(registry.unknownRole, "totalAmount");
  assert.equal(registry.numericAuthority.writesBackToG3BU08CanonicalAuthority, false);
  assert.equal(registry.globalBoundaries.r05RateMeasureProductIncluded, false);
  assert.equal(registry.globalBoundaries.publicCutoverApplied, false);
  assert.deepEqual(
    registry.patternSpecs.map((entry) => entry.patternSpecId),
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  );
  assert.deepEqual(PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS, [
    "P103_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P103_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P103_R03_SCORE_PER_EVENT_TOTAL",
    "P103_R03_AMOUNT_PER_PERIOD_TOTAL",
  ]);
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceSurfaceLineageOnly === true));
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceParentNumericAuthorityReused === false));
  assert.ok(registry.patternSpecs.every((entry) => entry.contexts.length === 3));
});

test("school-exam 28×60 witness is renderable inside the P1-03 local package surface", () => {
  const prompt = renderPath1P103MultiplicativeModelingPrompt({
    patternSpecId: "P103_R03_ITEMS_PER_PACKAGE_TOTAL",
    contextVariantId: "cookies_box",
    amountPerGroup: 28,
    groupCount: 60,
  });
  assert.equal(prompt, "一盒餅乾有28片，有60盒，一共有多少片餅乾？");
  const evidence = registry.patternSpecs[0].sourceEvidenceRefs[0];
  assert.equal(evidence.sourceFileId, "1knMV1ZIQ5dnUsfV28VuSbuZgBvLE1jrM");
  assert.match(evidence.witness, /28/);
  assert.match(evidence.witness, /60/);
});

test("P1-03 modeling generator and validator accept 1/20/120 with exact two-digit factors", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.generated, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P103MultiplicativeModelingItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    for (const item of result.items) {
      assert.equal(item.mode, "application");
      assert.equal(item.knowledgePointId, "kp_g4a_u02_2digit_by_2digit");
      assert.equal(item.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
      assert.equal(item.relationId, "R03_EQUAL_GROUPS");
      assert.equal(item.unknownRole, "totalAmount");
      assert.ok(item.amountPerGroup >= 10 && item.amountPerGroup <= 99);
      assert.ok(item.groupCount >= 10 && item.groupCount <= 99);
      assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
      assert.equal(item.finalAnswer, item.totalAmount);
      assert.equal(item.equationModel, `${item.amountPerGroup} × ${item.groupCount} = ${item.totalAmount}`);
      assert.match(item.answerText, /；答：/);
      assert.equal(item.metadata.languageDifficulty, "LD0_DIRECT_ROLE_EXPLICIT");
      assert.equal(item.metadata.singleRelationOnly, true);
      assert.equal(item.metadata.unitConversionUsed, false);
      assert.equal(item.metadata.semanticCommutativeRoleSwapAllowed, false);
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("120 items balance all four approved PatternSpec families with 30 each", () => {
  const result = build(120, "path1-p103-modeling:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.summary.patternSpecIdsUsed), new Set(PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS));
  assert.deepEqual(Object.values(result.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
  assert.equal(result.summary.distinctPromptCount, 120);
});

test("same seed replays exactly and different seed changes the generated sequence", () => {
  const a = build(40, "path1-p103-modeling:replay");
  const b = build(40, "path1-p103-modeling:replay");
  const c = build(40, "path1-p103-modeling:replay-different");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("generator fails closed outside P1-03, invalid practice mode, invalid count, or missing seed", () => {
  let result = buildPath1P103MultiplicativeModelingItems({
    blockId: "P1-04",
    count: 20,
    seed: "wrong-block",
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_BLOCK_NOT_SUPPORTED");

  result = buildPath1P103MultiplicativeModelingItems({
    blockId: "P1-03",
    count: 20,
    seed: "wrong-mode",
    practiceMode: "equalGroupsTransfer",
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_PRACTICE_MODE_INVALID");

  result = buildPath1P103MultiplicativeModelingItems({ count: 121, seed: "too-many" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_COUNT_INVALID");

  result = buildPath1P103MultiplicativeModelingItems({ count: 20, seed: "" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_SEED_REQUIRED");
});

test("validator fails closed on inverse role, numeric envelope, relation, unit, role-swap, multi-relation and public-route mutations", () => {
  const result = build(20, "path1-p103-modeling:negative");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.unknownRole = "groupCount";
  mutated.metadata.unknownRole = "groupCount";
  let validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.groupCount = 9;
  mutated.rightFactor = 9;
  mutated.metadata.groupCount = 9;
  mutated.metadata.rightFactor = 9;
  mutated.totalAmount = original.amountPerGroup * 9;
  mutated.product = mutated.totalAmount;
  mutated.finalAnswer = mutated.totalAmount;
  mutated.metadata.totalAmount = mutated.totalAmount;
  mutated.metadata.product = mutated.totalAmount;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_GROUP_COUNT_OUT_OF_SCOPE"));

  mutated = clone(original);
  mutated.relationId = "R05_RATE_MEASURE_PRODUCT";
  mutated.metadata.relationId = "R05_RATE_MEASURE_PRODUCT";
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_RELATION_ID_MISMATCH"));

  mutated = clone(original);
  mutated.finalAnswerUnit = "盒";
  mutated.metadata.answerUnit = "盒";
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_ANSWER_UNIT_MISMATCH"));

  mutated = clone(original);
  mutated.semanticRoleBinding = { leftFactor: "groupCount", rightFactor: "amountPerGroup", product: "totalAmount" };
  mutated.metadata.semanticRoleBinding = clone(mutated.semanticRoleBinding);
  mutated.metadata.semanticCommutativeRoleSwapAllowed = true;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.singleRelationOnly = false;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_MULTI_RELATION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.unitConversionUsed = true;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_UNIT_CONVERSION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.publicCutoverApplied = true;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_PUBLIC_CUTOVER_SCOPE_LEAK"));
});

test("validator rejects unapproved PatternSpec/context and wrong equation or product", () => {
  const result = build(20, "path1-p103-modeling:negative-whitelist");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.patternSpecId = "P103_R05_UNAPPROVED";
  mutated.metadata.patternSpecId = "P103_R05_UNAPPROVED";
  let validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_UNAPPROVED_PATTERN_SPEC"));

  mutated = clone(original);
  mutated.contextVariantId = "unapproved_context";
  mutated.metadata.contextVariantId = "unapproved_context";
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_UNAPPROVED_CONTEXT_VARIANT"));

  mutated = clone(original);
  mutated.equationModel = `${original.groupCount} × ${original.amountPerGroup} = ${original.totalAmount}`;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_EQUATION_ROLE_MISMATCH"));

  mutated = clone(original);
  mutated.totalAmount += 1;
  mutated.product = mutated.totalAmount;
  mutated.finalAnswer = mutated.totalAmount;
  mutated.metadata.totalAmount = mutated.totalAmount;
  mutated.metadata.product = mutated.totalAmount;
  validation = validatePath1P103MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P103_MODELING_TOTAL_AMOUNT_INVARIANT_FAILED"));
});

test("non-public worksheet adapter renders 120 application questions and answer keys", () => {
  const result = buildPath1P103MultiplicativeModelingWorksheet({
    questionCount: 120,
    generationSeed: "path1-p103-modeling:worksheet-120",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.questionCount, 120);
  assert.equal(document.questions.length, 120);
  assert.equal(countCells(document.questionPages, "question"), 120);
  assert.equal(countCells(document.answerKeyPages, "answerKey"), 120);
  assert.ok(document.questions.every((entry) => entry.mode === "application"));
  assert.ok(document.questions.every((entry) => entry.answerText.includes(" × ")));
  assert.ok(document.questions.every((entry) => entry.answerText.includes("；答：")));
  assert.equal(document.configSnapshot.metadata.path1BlockId, "P1-03");
  assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE);
  assert.equal(document.configSnapshot.metadata.relationId, "R03_EQUAL_GROUPS");
  assert.equal(document.configSnapshot.metadata.unknownRole, "totalAmount");
  assert.equal(document.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(document.configSnapshot.metadata.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
});

test("existing P1-03 arithmetic diversity remains numeric-only and unchanged in role scope", () => {
  const arithmetic = buildPath1P103DiversityItems({ count: 120, seed: "path1-p103-modeling:arithmetic-preservation" });
  assert.equal(arithmetic.ok, true, JSON.stringify(arithmetic.errors));
  assert.equal(arithmetic.items.length, 120);
  assert.ok(arithmetic.items.every((entry) => entry.mode === "numeric"));
  assert.ok(arithmetic.items.every((entry) => entry.metadata.applicationPromptUsed === false));
  assert.ok(arithmetic.items.every((entry) => entry.metadata.relationPromptUsed === false));
  assert.ok(arithmetic.items.every((entry) => entry.metadata.answerRole === "product"));
});

test("deployed P1-01/P1-02 transfer remains total-only and P1-12 stays non-public/deferred", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const transfer = buildPath1EqualGroupsTransferItems({
      blockId,
      count: 20,
      seed: `path1-p103-modeling:early-transfer:${blockId}`,
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
    });
    assert.equal(transfer.ok, true, JSON.stringify(transfer.errors));
    assert.ok(transfer.items.every((entry) => entry.unknownRole === "totalAmount"));
    assert.ok(transfer.items.every((entry) => entry.relationKnowledgePointId === "kp_g3b_u08_total_from_groups"));
  }
  assert.equal(p112Implementation.publicCutoverApplied, false);
  assert.equal(p112Implementation.visibleUiChanged, false);
  assert.equal(preflight.roadmapSequence.p112Status, "IMPLEMENTED_BUT_DEFERRED_FOR_SEQUENCE_ALIGNMENT");
  assert.equal(preflight.roadmapSequence.p112PublicCutoverAllowedNow, false);
  const practiceEntry = fs.readFileSync(PRACTICE_ENTRY_PATH, "utf8");
  assert.doesNotMatch(practiceEntry, /multiplicativeModelingTransfer/);
});

test("pre-push smoke: every static relative import in new executable files exists at repository HEAD", () => {
  const executableFiles = [
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js",
    "site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-validator.js",
    "site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js",
  ];
  const missing = [];
  for (const file of executableFiles) {
    const text = fs.readFileSync(file, "utf8");
    const imports = [...text.matchAll(/from\s+["'](\.[^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      const resolved = path.normalize(path.join(path.dirname(file), specifier));
      if (!fs.existsSync(resolved)) missing.push({ file, specifier, resolved });
    }
  }
  assert.deepEqual(missing, []);
});
