import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU01RemainderInterpretationTemplates,
  validateG3BU01RemainderInterpretationTemplates
} from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-remainder-interpretation-templates.js";

test("S43E5 R4F remainder interpretation registry is valid", () => {
  const templates = listG3BU01RemainderInterpretationTemplates();
  assert.equal(templates.length, 4);
  assert.equal(validateG3BU01RemainderInterpretationTemplates().ok, true);
});

test("S43E5 R4F floor and ceil PatternSpecs each have two templates", () => {
  const counts = new Map();
  for (const template of listG3BU01RemainderInterpretationTemplates()) counts.set(template.patternSpecId, (counts.get(template.patternSpecId) ?? 0) + 1);
  assert.equal(counts.get("ps_g3b_u01_wp_remainder_floor_max_groups"), 2);
  assert.equal(counts.get("ps_g3b_u01_wp_remainder_ceil_min_containers"), 2);
});

test("S43E5 R4F floor and ceil templates keep distinct operation models", () => {
  const templates = listG3BU01RemainderInterpretationTemplates();
  const floors = templates.filter((template) => template.semanticModel === "remainder_interpretation_floor");
  const ceils = templates.filter((template) => template.semanticModel === "remainder_interpretation_ceil");
  assert.equal(floors.every((template) => template.operationModel.kind === "floor_division"), true);
  assert.equal(ceils.every((template) => template.operationModel.kind === "ceil_division"), true);
  assert.equal(floors.every((template) => template.promptTemplate.includes("最多")), true);
  assert.equal(ceils.every((template) => template.promptTemplate.includes("最少")), true);
});
