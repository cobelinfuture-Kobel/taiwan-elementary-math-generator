import test from "node:test";
import assert from "node:assert/strict";

import {
  G3B_U01_WORD_PROBLEM_FIRST_PASS_TEMPLATE_TARGET,
  G3B_U01_WORD_PROBLEM_TEMPLATE_REQUIRED_FIELDS,
  listG3BU01WordProblemKnowledgePoints,
  listG3BU01WordProblemPatternSpecs,
  validateG3BU01WordProblemRegistryContract,
  validateG3BU01WordProblemTemplateSpec
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-template-contract.js";

test("S43E5 R4B word-problem registry contract exposes five UI KPs", () => {
  const kps = listG3BU01WordProblemKnowledgePoints();
  assert.equal(kps.length, 5);
  assert.deepEqual(kps.map((kp) => kp.displayName), [
    "等分除：平分與單位量",
    "包含除：分裝與分組",
    "有餘數除法應用題",
    "餘數判讀：最多與最少",
    "兩步驟除法應用題"
  ]);
  assert.equal(validateG3BU01WordProblemRegistryContract().ok, true);
});

test("S43E5 R4B word-problem PatternSpec target totals are locked", () => {
  const specs = listG3BU01WordProblemPatternSpecs();
  assert.equal(specs.length, 12);
  assert.equal(specs.reduce((sum, spec) => sum + spec.templateTargetCount, 0), G3B_U01_WORD_PROBLEM_FIRST_PASS_TEMPLATE_TARGET);
  assert.equal(G3B_U01_WORD_PROBLEM_FIRST_PASS_TEMPLATE_TARGET, 20);
});

test("S43E5 R4B TemplateSpec schema validates required fields and semantic mapping", () => {
  const template = {
    templateId: "tpl_g3b_u01_wp_partitive_money_people",
    patternSpecId: "ps_g3b_u01_wp_partitive_equal_sharing",
    semanticModel: "partitive_division_equal_sharing",
    operationModel: { kind: "division", expression: "total / groupCount" },
    answerModel: { shape: "single_integer", unitRole: "answerUnit" },
    unitModel: { totalUnit: "元", groupUnit: "人", answerUnit: "元" },
    slotModel: { total: 36, groupCount: 3, itemNoun: "錢" },
    promptTemplate: "把 {total}{totalUnit}平均分給 {groupCount} 個人，每人分到幾{answerUnit}？"
  };
  assert.equal(validateG3BU01WordProblemTemplateSpec(template).ok, true);
  const missing = validateG3BU01WordProblemTemplateSpec({});
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.errors.map((error) => error.path), [...G3B_U01_WORD_PROBLEM_TEMPLATE_REQUIRED_FIELDS]);
  const mismatch = validateG3BU01WordProblemTemplateSpec({ ...template, semanticModel: "quotative_division_packaging_exact" });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.errors.some((error) => error.code === "g3b_u01_wp_template_semantic_mismatch"), true);
});
