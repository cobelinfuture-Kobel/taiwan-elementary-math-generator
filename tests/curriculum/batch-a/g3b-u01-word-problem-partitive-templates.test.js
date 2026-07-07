import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU01PartitiveWordProblemTemplates,
  validateG3BU01PartitiveWordProblemTemplates
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-partitive-templates.js";

const PARTITIVE_SPECS = Object.freeze([
  "ps_g3b_u01_wp_partitive_equal_sharing",
  "ps_g3b_u01_wp_partitive_unit_rate"
]);

test("S43E5 R4C partitive templates expose four first-pass contexts", () => {
  const templates = listG3BU01PartitiveWordProblemTemplates();
  assert.equal(templates.length, 4);
  assert.deepEqual(new Set(templates.map((template) => template.patternSpecId)), new Set(PARTITIVE_SPECS));
  assert.equal(validateG3BU01PartitiveWordProblemTemplates().ok, true);
});

test("S43E5 R4C equal-sharing templates preserve partitive division semantics", () => {
  const templates = listG3BU01PartitiveWordProblemTemplates().filter((template) => template.patternSpecId === "ps_g3b_u01_wp_partitive_equal_sharing");
  assert.equal(templates.length, 2);
  for (const template of templates) {
    assert.equal(template.semanticModel, "partitive_division_equal_sharing");
    assert.equal(template.operationModel.expression, "total / groupCount");
    assert.equal(template.answerModel.shape, "single_integer");
    assert.equal(template.slotModel.requireExactQuotient, true);
    assert.equal(template.promptTemplate.includes("平均分"), true);
  }
});

test("S43E5 R4C unit-rate templates preserve single-unit price semantics", () => {
  const templates = listG3BU01PartitiveWordProblemTemplates().filter((template) => template.patternSpecId === "ps_g3b_u01_wp_partitive_unit_rate");
  assert.equal(templates.length, 2);
  for (const template of templates) {
    assert.equal(template.semanticModel, "partitive_division_unit_rate");
    assert.equal(template.operationModel.expression, "totalCost / itemCount");
    assert.equal(template.answerModel.shape, "single_integer");
    assert.equal(template.slotModel.requireExactQuotient, true);
    assert.equal(template.promptTemplate.includes("1 {itemUnit}"), true);
  }
});
