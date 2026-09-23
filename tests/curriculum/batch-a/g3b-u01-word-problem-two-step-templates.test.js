import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU01TwoStepWordProblemTemplates,
  validateG3BU01TwoStepWordProblemTemplates
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-two-step-templates.js";

test("S43E5 R4G two-step template registry is valid", () => {
  const templates = listG3BU01TwoStepWordProblemTemplates();
  assert.equal(templates.length, 4);
  assert.equal(validateG3BU01TwoStepWordProblemTemplates().ok, true);
});

test("S43E5 R4G two-step templates cover four operation orders", () => {
  const kinds = new Set(listG3BU01TwoStepWordProblemTemplates().map((template) => template.operationModel.kind));
  assert.deepEqual(kinds, new Set(["divide_then_add", "add_then_divide", "divide_then_subtract", "subtract_then_divide"]));
});

test("S43E5 R4G two-step templates keep single-integer answer model", () => {
  for (const template of listG3BU01TwoStepWordProblemTemplates()) {
    assert.equal(template.answerModel.shape, "single_integer");
    assert.equal(template.slotModel.requireExactDivision, true);
    assert.equal(template.promptTemplate.includes("?"), false);
    assert.equal(template.promptTemplate.includes("幾"), true);
  }
});
