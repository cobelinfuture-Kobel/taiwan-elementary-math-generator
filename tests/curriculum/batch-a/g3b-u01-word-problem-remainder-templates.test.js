import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU01RemainderWordProblemTemplates,
  validateG3BU01RemainderWordProblemTemplates
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-remainder-templates.js";

test("S43E5 R4E remainder template registry is valid", () => {
  const templates = listG3BU01RemainderWordProblemTemplates();
  assert.equal(templates.length, 4);
  assert.equal(validateG3BU01RemainderWordProblemTemplates().ok, true);
});

test("S43E5 R4E remainder templates are split by PatternSpec", () => {
  const counts = new Map();
  for (const template of listG3BU01RemainderWordProblemTemplates()) counts.set(template.patternSpecId, (counts.get(template.patternSpecId) ?? 0) + 1);
  assert.equal(counts.get("ps_g3b_u01_wp_remainder_packaging_leftover"), 2);
  assert.equal(counts.get("ps_g3b_u01_wp_remainder_calendar_weeks_days"), 2);
});

test("S43E5 R4E remainder templates keep quotient-remainder answer model", () => {
  for (const template of listG3BU01RemainderWordProblemTemplates()) {
    assert.equal(template.answerModel.shape, "quotient_remainder");
    assert.equal(template.slotModel.requireRemainder, true);
    assert.equal(template.promptTemplate.includes("幾"), true);
  }
});
