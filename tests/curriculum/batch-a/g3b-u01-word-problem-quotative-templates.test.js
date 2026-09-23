import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU01QuotativeWordProblemTemplates,
  validateG3BU01QuotativeWordProblemTemplates
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-quotative-templates.js";

test("S43E5 R4D quotative template registry is valid", () => {
  const templates = listG3BU01QuotativeWordProblemTemplates();
  assert.equal(templates.length, 4);
  assert.equal(validateG3BU01QuotativeWordProblemTemplates().ok, true);
});

test("S43E5 R4D quotative templates are split by PatternSpec", () => {
  const templates = listG3BU01QuotativeWordProblemTemplates();
  const counts = new Map();
  for (const template of templates) counts.set(template.patternSpecId, (counts.get(template.patternSpecId) ?? 0) + 1);
  assert.equal(counts.get("ps_g3b_u01_wp_quotative_packaging_exact"), 2);
  assert.equal(counts.get("ps_g3b_u01_wp_quotative_grouping_exact"), 2);
});

test("S43E5 R4D quotative templates keep operation and answer models", () => {
  for (const template of listG3BU01QuotativeWordProblemTemplates()) {
    assert.equal(template.operationModel.expression, "total / groupSize");
    assert.equal(template.answerModel.shape, "single_integer");
    assert.equal(template.answerModel.unitRole, "groupUnit");
    assert.equal(template.slotModel.requireExactQuotient, true);
    assert.equal(template.promptTemplate.includes("{total}"), true);
    assert.equal(template.promptTemplate.includes("{groupSize}"), true);
  }
});
