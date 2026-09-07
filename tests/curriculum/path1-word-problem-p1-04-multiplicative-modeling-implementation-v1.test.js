import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildPath1P104MultiplicativeModelingItems,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-generator.js";
import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  getPath1P104MultiplicativeModelingArithmeticForm,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js";
import {
  validatePath1P104MultiplicativeModelingItem,
  validatePath1P104MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-validator.js";
import {
  buildPath1P104MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js";
import {
  buildPath1P103MultiplicativeModelingItems,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const REGISTRY_PATH = "data/curriculum/pattern_specs/PATH1_P1_04_MultiplicativeModelingPatternSpecRegistry.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const P112_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_IMPLEMENTATION_V1.json";
const PRACTICE_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const preflight = JSON.parse(fs.readFileSync(PREFLIGHT_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const p112Implementation = JSON.parse(fs.readFileSync(P112_IMPLEMENTATION_PATH, "utf8"));

function build(count, seed = `path1-p104-modeling:${count}`) {
  return buildPath1P104MultiplicativeModelingItems({
    blockId: PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
    count,
    seed,
    practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
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

test("implementation follows merged P1-04 preflight and remains non-public", () => {
  assert.equal(preflight.status, "P1_04_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(preflight.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
  assert.equal(implementation.status, "P1_04_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.operatorApproval, "APPROVED");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.visibleUiChanged, false);
  assert.equal(implementation.queryStateChanged, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.path1MatrixChanged, false);
  assert.equal(implementation.g3bU08CanonicalAuthorityChanged, false);
  assert.equal(implementation.g4bU01ModelingExpanded, false);
  assert.equal(implementation.p101P102P103TransfersChanged, false);
  assert.equal(implementation.p105Changed, false);
  assert.equal(implementation.p112PublicRouteChanged, false);
  assert.equal(implementation.distance.goalDistanceBefore, "D2_P104_TRANSFER_RELATION_ROLE_ORDERED_NUMERIC_ENVELOPE_AND_BINDING_BOUNDARY_PREFLIGHT_LOCKED");
  assert.equal(implementation.distance.goalDistanceAfterTarget, "D1_P104_PATH1_LOCAL_PATTERN_GENERATOR_VALIDATOR_WORKSHEET_USABLE");
});

test("P1-04 local registry contains four R03 families across exactly two matrix-authoritative forms", () => {
  assert.equal(registry.status, "PATH1_LOCAL_PATTERN_SPECS_MATERIALIZED_NON_PUBLIC");
  assert.equal(registry.path1BlockId, "P1-04");
  assert.equal(registry.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.equal(registry.relationId, "R03_EQUAL_GROUPS");
  assert.equal(registry.unknownRole, "totalAmount");
  assert.equal(registry.numericAuthority.writesBackToG3BU08CanonicalAuthority, false);
  assert.equal(registry.numericAuthority.adoptsG4BU01PublicBindingBreadth, false);
  assert.deepEqual(PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS, [
    "P104_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P104_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P104_R03_SCORE_PER_EVENT_TOTAL",
    "P104_R03_AMOUNT_PER_PERIOD_TOTAL",
  ]);
  assert.deepEqual(registry.patternSpecs.map((entry) => entry.patternSpecId), PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS);
  assert.deepEqual(PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS.map((entry) => entry.formId), ["P104_2D_BY_3D", "P104_3D_BY_2D"]);
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceSurfaceLineageOnly === true));
  assert.ok(registry.patternSpecs.every((entry) => entry.sourceParentNumericAuthorityReused === false));
  assert.ok(registry.patternSpecs.every((entry) => entry.allowedArithmeticFormIds.length === 2));
  assert.ok(registry.patternSpecs.every((entry) => entry.contexts.length === 3));
});

test("approved 60×110 school witness falls inside only the role-ordered P104_2D_BY_3D form", () => {
  const form = getPath1P104MultiplicativeModelingArithmeticForm("P104_2D_BY_3D");
  assert.ok(form);
  assert.ok(60 >= form.amountPerGroupMin && 60 <= form.amountPerGroupMax);
  assert.ok(110 >= form.groupCountMin && 110 <= form.groupCountMax);
  assert.equal(60 * 110, 6600);
  const reverseForm = getPath1P104MultiplicativeModelingArithmeticForm("P104_3D_BY_2D");
  assert.ok(reverseForm);
  assert.equal(60 >= reverseForm.amountPerGroupMin && 60 <= reverseForm.amountPerGroupMax, false);
  const evidence = registry.patternSpecs[0].sourceEvidenceRefs[0];
  assert.equal(evidence.sourceFileId, "1x_dh_7JMpxdiWI7Yc_4R0KOwWdQapoOO");
  assert.match(evidence.witness, /60/);
  assert.match(evidence.witness, /110/);
});

test("P1-04 generator and validator accept 1/20/120 within exact role-ordered envelopes", () => {
  for (const count of [1, 20, 120]) {
    const result = build(count);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.items.length, count);
    assert.equal(result.summary.generated, count);
    assert.equal(result.summary.distinctPromptCount, count);
    assert.equal(new Set(result.items.map((entry) => entry.prompt)).size, count);
    const validation = validatePath1P104MultiplicativeModelingItems(result.items);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    for (const item of result.items) {
      const form = getPath1P104MultiplicativeModelingArithmeticForm(item.arithmeticFormId);
      assert.ok(form);
      assert.equal(item.mode, "application");
      assert.equal(item.path1BlockId, "P1-04");
      assert.equal(item.knowledgePointId, form.arithmeticKnowledgePointId);
      assert.equal(item.arithmeticKnowledgePointId, form.arithmeticKnowledgePointId);
      assert.equal(item.arithmeticOperationModelId, form.arithmeticOperationModelId);
      assert.equal(item.arithmeticPatternSpecId, form.arithmeticPatternSpecId);
      assert.equal(item.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
      assert.equal(item.relationId, "R03_EQUAL_GROUPS");
      assert.equal(item.unknownRole, "totalAmount");
      assert.ok(item.amountPerGroup >= form.amountPerGroupMin && item.amountPerGroup <= form.amountPerGroupMax);
      assert.ok(item.groupCount >= form.groupCountMin && item.groupCount <= form.groupCountMax);
      assert.equal(item.totalAmount, item.amountPerGroup * item.groupCount);
      assert.equal(item.finalAnswer, item.totalAmount);
      assert.equal(item.equationModel, `${item.amountPerGroup} × ${item.groupCount} = ${item.totalAmount}`);
      assert.equal(item.metadata.languageDifficulty, "LD0_DIRECT_ROLE_EXPLICIT");
      assert.equal(item.metadata.singleRelationOnly, true);
      assert.equal(item.metadata.unitConversionUsed, false);
      assert.equal(item.metadata.semanticCommutativeRoleSwapAllowed, false);
      assert.equal(item.metadata.g4bU01ModelingExpanded, false);
      assert.equal(item.metadata.p105ZeroSpecialCapabilityUsed, false);
      assert.equal(item.metadata.publicCutoverApplied, false);
    }
  }
});

test("120 items balance four families, two arithmetic forms, and all eight family-form cells", () => {
  const result = build(120, "path1-p104-modeling:balanced-120");
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(Object.values(result.summary.familyCounts).sort((a, b) => a - b), [30, 30, 30, 30]);
  assert.deepEqual(Object.values(result.summary.formCounts).sort((a, b) => a - b), [60, 60]);
  assert.deepEqual(Object.values(result.summary.familyFormCounts).sort((a, b) => a - b), [15, 15, 15, 15, 15, 15, 15, 15]);
  assert.equal(result.summary.distinctPromptCount, 120);
});

test("same seed replays exactly and different seed changes sequence", () => {
  const a = build(40, "path1-p104-modeling:replay");
  const b = build(40, "path1-p104-modeling:replay");
  const c = build(40, "path1-p104-modeling:replay-different");
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, true);
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
});

test("generator fails closed outside P1-04, invalid practice mode, invalid count, or missing seed", () => {
  let result = buildPath1P104MultiplicativeModelingItems({ blockId: "P1-03", count: 20, seed: "wrong-block" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P104_MODELING_BLOCK_NOT_SUPPORTED");

  result = buildPath1P104MultiplicativeModelingItems({ blockId: "P1-04", count: 20, seed: "wrong-mode", practiceMode: "equalGroupsTransfer" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P104_MODELING_PRACTICE_MODE_INVALID");

  result = buildPath1P104MultiplicativeModelingItems({ count: 121, seed: "too-many" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P104_MODELING_COUNT_INVALID");

  result = buildPath1P104MultiplicativeModelingItems({ count: 20, seed: "" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P104_MODELING_SEED_REQUIRED");
});

test("validator fails closed on inverse role, wrong arithmetic form, G4B scope, relation, role swap, multi-relation, P1-05 and public-cutover leaks", () => {
  const result = build(20, "path1-p104-modeling:negative");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.unknownRole = "groupCount";
  mutated.metadata.unknownRole = "groupCount";
  let validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_UNKNOWN_ROLE_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.arithmeticFormId = "P104_3D_BY_2D";
  mutated.metadata.arithmeticFormId = "P104_3D_BY_2D";
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_ARITHMETIC_AUTHORITY_MISMATCH") || errorCodes(validation).has("PATH1_P104_MODELING_AMOUNT_PER_GROUP_OUT_OF_SCOPE"));

  mutated = clone(original);
  mutated.knowledgePointId = "kp_g4b_u01_3digit_by_3digit";
  mutated.arithmeticKnowledgePointId = "kp_g4b_u01_3digit_by_3digit";
  mutated.metadata.arithmeticKnowledgePointId = "kp_g4b_u01_3digit_by_3digit";
  mutated.metadata.g4bU01ModelingExpanded = true;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_G4BU01_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.relationId = "R05_RATE_MEASURE_PRODUCT";
  mutated.metadata.relationId = "R05_RATE_MEASURE_PRODUCT";
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_RELATION_ID_MISMATCH"));

  mutated = clone(original);
  mutated.semanticRoleBinding = { leftFactor: "groupCount", rightFactor: "amountPerGroup", product: "totalAmount" };
  mutated.metadata.semanticRoleBinding = clone(mutated.semanticRoleBinding);
  mutated.metadata.semanticCommutativeRoleSwapAllowed = true;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_SEMANTIC_ROLE_BINDING_MISMATCH"));
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_SEMANTIC_ROLE_SWAP_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.singleRelationOnly = false;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_MULTI_RELATION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.unitConversionUsed = true;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_UNIT_CONVERSION_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.p105ZeroSpecialCapabilityUsed = true;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_P105_SCOPE_LEAK"));

  mutated = clone(original);
  mutated.metadata.publicCutoverApplied = true;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_PUBLIC_CUTOVER_SCOPE_LEAK"));
});

test("validator rejects unapproved local PatternSpec/context and wrong equation/product", () => {
  const result = build(20, "path1-p104-modeling:negative-whitelist");
  assert.equal(result.ok, true);
  const original = result.items[0];

  let mutated = clone(original);
  mutated.patternSpecId = "P104_R05_UNAPPROVED";
  mutated.metadata.patternSpecId = "P104_R05_UNAPPROVED";
  let validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_UNAPPROVED_PATTERN_SPEC"));

  mutated = clone(original);
  mutated.contextVariantId = "unapproved_context";
  mutated.metadata.contextVariantId = "unapproved_context";
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_UNAPPROVED_CONTEXT_VARIANT"));

  mutated = clone(original);
  mutated.equationModel = `${original.groupCount} × ${original.amountPerGroup} = ${original.totalAmount}`;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_EQUATION_ROLE_MISMATCH"));

  mutated = clone(original);
  mutated.totalAmount += 1;
  mutated.product = mutated.totalAmount;
  mutated.finalAnswer = mutated.totalAmount;
  mutated.metadata.totalAmount = mutated.totalAmount;
  mutated.metadata.product = mutated.totalAmount;
  validation = validatePath1P104MultiplicativeModelingItem(mutated);
  assert.equal(validation.ok, false);
  assert.ok(errorCodes(validation).has("PATH1_P104_MODELING_TOTAL_AMOUNT_INVARIANT_FAILED"));
});

test("non-public worksheet adapter renders 120 application questions and answer keys", () => {
  const result = buildPath1P104MultiplicativeModelingWorksheet({
    questionCount: 120,
    generationSeed: "path1-p104-modeling:worksheet-120",
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
  assert.equal(document.configSnapshot.metadata.path1BlockId, "P1-04");
  assert.equal(document.configSnapshot.metadata.practiceMode, PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE);
  assert.equal(document.configSnapshot.metadata.relationId, "R03_EQUAL_GROUPS");
  assert.equal(document.configSnapshot.metadata.unknownRole, "totalAmount");
  assert.equal(document.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(document.configSnapshot.metadata.publicBindingReconciled, false);
  assert.equal(document.configSnapshot.metadata.g4bU01ModelingExpanded, false);
});

test("P1-03 modeling remains usable and P1-04 public binding drift remains observed but untouched", () => {
  const p103 = buildPath1P103MultiplicativeModelingItems({ count: 20, seed: "path1-p104-preserve-p103" });
  assert.equal(p103.ok, true, JSON.stringify(p103.errors));
  assert.ok(p103.items.every((entry) => entry.path1BlockId === "P1-03"));

  const publicP104 = getPath1PublicWorksheetBlock("P1-04");
  assert.ok(publicP104);
  assert.deepEqual(publicP104.knowledgePointIds, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.deepEqual(preflight.observedPublicBindingScopeDrift.extraPublicBindingKnowledgePointIds, [
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.equal(implementation.publicBindingBoundary.publicBindingMutationApplied, false);
});

test("P1-05 and P1-12 sequence boundaries remain unchanged and P1-04 adapter is not publicly wired", () => {
  const p105 = matrix.blocks.find((entry) => entry.blockId === "P1-05");
  assert.ok(p105);
  assert.deepEqual(p105.requiredPrerequisites.blockIds, ["P1-04"]);
  assert.deepEqual(p105.primaryKnowledgePointIds, ["kp_g3a_u03_3digit_zero_middle_by_1digit"]);
  assert.equal(p112Implementation.publicCutoverApplied, false);
  const practiceEntry = fs.readFileSync(PRACTICE_ENTRY_PATH, "utf8");
  assert.doesNotMatch(practiceEntry, /buildPath1P104MultiplicativeModelingWorksheet/);
  assert.doesNotMatch(practiceEntry, /path1-p1-04-multiplicative-modeling/);
});

test("pre-push smoke: every static relative import in new P1-04 executable files exists", () => {
  const executableFiles = [
    "site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js",
    "site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-generator.js",
    "site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-validator.js",
    "site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js",
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
