import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT,
  auditG5AU02PublicQuestionTypeContract,
  filterG5AU02PatternSpecIdsByQuestionType,
  getG5AU02PatternPublicQuestionType,
  normalizeG5AU02PublicQuestionType,
} from "../../site/modules/curriculum/batch-b/g5a-u02-public-question-type-contract.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

const specs = getG5AU02HiddenPatternSpecs();
const ids = specs.map((spec) => spec.patternSpecId);

test("S96K maps all 22 canonical PatternSpecs into public question types", () => {
  const audit = auditG5AU02PublicQuestionTypeContract();
  assert.equal(audit.ok, true);
  assert.deepEqual(audit.errors, []);
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.mappedPatternSpecCount, 22);
  assert.equal(Object.values(audit.countsByType).reduce((sum, count) => sum + count, 0), 22);
  assert.ok(Object.values(audit.countsByType).every((count) => count > 0));
});

test("S96K mode mapping follows the approved taxonomy", () => {
  const expected = {
    concept: "concept",
    representation: "concept",
    numeric: "numeric",
    application: "application",
    geometry_application: "application",
    reasoning: "reasoning",
    reasoning_application: "reasoning",
  };
  for (const spec of specs) {
    const mode = spec.binding?.mode ?? spec.mode;
    assert.equal(getG5AU02PatternPublicQuestionType(spec.patternSpecId), expected[mode]);
  }
});

test("S96K filter returns canonical-only subsets and mixed preserves the selected pool", () => {
  assert.deepEqual(filterG5AU02PatternSpecIdsByQuestionType(ids, "mixed"), ids);
  for (const type of ["concept", "numeric", "application", "reasoning"]) {
    const filtered = filterG5AU02PatternSpecIdsByQuestionType(ids, type);
    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((id) => ids.includes(id)));
    assert.ok(filtered.every((id) => getG5AU02PatternPublicQuestionType(id) === type));
  }
});

test("S96K unknown UI values normalize to mixed without inventing a fallback PatternSpec", () => {
  assert.equal(normalizeG5AU02PublicQuestionType("unknown"), "mixed");
  assert.deepEqual(filterG5AU02PatternSpecIdsByQuestionType([], "mixed"), []);
  assert.equal(G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT.genericFallback, false);
  assert.equal(G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT.freeFormAI, false);
});
