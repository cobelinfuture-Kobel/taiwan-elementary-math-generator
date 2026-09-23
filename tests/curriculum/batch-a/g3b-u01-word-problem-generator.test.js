import test from "node:test";
import assert from "node:assert/strict";

import { listG3BU01WordProblemTemplates, validateG3BU01WordProblemTemplateLibrary } from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-template-registry.js";
import { generateG3BU01WordProblem, validateG3BU01WordProblemQuestion } from "../../../site/modules/curriculum/batch-a/g3b-u01-word-problem-generator.js";

test("S43E5 R4H aggregate template library contains 20 valid templates", () => {
  const templates = listG3BU01WordProblemTemplates();
  assert.equal(templates.length, 20);
  assert.equal(validateG3BU01WordProblemTemplateLibrary().ok, true);
});

test("S43E5 R4H generator can instantiate every first-pass template", () => {
  const templates = listG3BU01WordProblemTemplates();
  for (let i = 0; i < templates.length; i += 1) {
    const question = generateG3BU01WordProblem({ templateId: templates[i].templateId, seed: i });
    assert.equal(question.templateId, templates[i].templateId);
    assert.equal(question.questionText.includes("{"), false);
    assert.equal(validateG3BU01WordProblemQuestion(question).ok, true);
  }
});

test("S43E5 R4H generated word problems preserve answer shapes", () => {
  const remainder = generateG3BU01WordProblem({ patternSpecId: "ps_g3b_u01_wp_remainder_packaging_leftover", seed: 3 });
  assert.equal(Number.isInteger(remainder.answer.quotient), true);
  assert.equal(Number.isInteger(remainder.answer.remainder), true);
  assert.equal(remainder.answer.remainder > 0, true);

  const floorQ = generateG3BU01WordProblem({ patternSpecId: "ps_g3b_u01_wp_remainder_floor_max_groups", seed: 4 });
  const ceilQ = generateG3BU01WordProblem({ patternSpecId: "ps_g3b_u01_wp_remainder_ceil_min_containers", seed: 4 });
  assert.equal(floorQ.answer.value + 1, ceilQ.answer.value);

  const twoStep = generateG3BU01WordProblem({ patternSpecId: "ps_g3b_u01_wp_two_step_subtract_then_divide", seed: 5 });
  assert.equal(Number.isInteger(twoStep.answer.value), true);
});
