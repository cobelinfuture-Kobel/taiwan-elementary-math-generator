import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  G5A_U02_REASONING_DEPTH_CONTRACT,
  auditG5AU02ReasoningDepthContract,
  filterG5AU02PatternSpecIdsByReasoningDepth,
  getG5AU02PatternReasoningDepth,
  normalizeG5AU02ReasoningDepth,
} from "../../site/modules/curriculum/batch-b/g5a-u02-reasoning-depth-contract.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

const specs = getG5AU02HiddenPatternSpecs();
const ids = specs.map((spec) => spec.patternSpecId);

test("S96L maps all 22 PatternSpecs to explicit basic or extended depth", () => {
  const audit = auditG5AU02ReasoningDepthContract();
  assert.equal(audit.ok, true);
  assert.deepEqual(audit.errors, []);
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.mappedPatternSpecCount, 22);
  assert.equal(audit.countsByDepth.basic + audit.countsByDepth.extended, 22);
  assert.ok(audit.countsByDepth.basic > 0);
  assert.ok(audit.countsByDepth.extended > 0);
});

test("S96L preserves mixed pool and filters canonical-only depth subsets", () => {
  assert.deepEqual(filterG5AU02PatternSpecIdsByReasoningDepth(ids, "mixed"), ids);
  for (const depth of ["basic", "extended"]) {
    const filtered = filterG5AU02PatternSpecIdsByReasoningDepth(ids, depth);
    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((id) => ids.includes(id)));
    assert.ok(filtered.every((id) => getG5AU02PatternReasoningDepth(id) === depth));
  }
});

test("S96L explicitly classifies high-reasoning patterns as extended", () => {
  for (const id of [
    "ps_g5a_u02_missing_factor_reconstruction",
    "ps_g5a_u02_complete_factor_list_unknown_values",
    "ps_g5a_u02_remainder_transfer",
    "ps_g5a_u02_multi_constraint_digit_code",
  ]) {
    assert.equal(getG5AU02PatternReasoningDepth(id), "extended");
  }
});

test("S96L contract does not infer cognitive depth from implementationClass", async () => {
  const source = await readFile("site/modules/curriculum/batch-b/g5a-u02-reasoning-depth-contract.js", "utf8");
  assert.equal(G5A_U02_REASONING_DEPTH_CONTRACT.classificationMethod, "explicit_pattern_spec_allowlist");
  assert.equal(G5A_U02_REASONING_DEPTH_CONTRACT.implementationClassInference, false);
  assert.doesNotMatch(source, /spec\.implementationClass/);
  assert.doesNotMatch(source, /implementationClass\s*===/);
});

test("S96L invalid values normalize to mixed and empty pools remain blocked upstream", () => {
  assert.equal(normalizeG5AU02ReasoningDepth("N_PLUS_1"), "mixed");
  assert.deepEqual(filterG5AU02PatternSpecIdsByReasoningDepth([], "extended"), []);
  assert.equal(G5A_U02_REASONING_DEPTH_CONTRACT.genericFallback, false);
  assert.equal(G5A_U02_REASONING_DEPTH_CONTRACT.freeFormAI, false);
});
