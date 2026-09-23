import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_CONTEXT_TAXONOMY,
  auditG5AU02ContextTaxonomy,
  filterG5AU02PatternSpecIdsByContext,
  getG5AU02PatternContextType,
  normalizeG5AU02ContextType,
} from "../../site/modules/curriculum/batch-b/g5a-u02-context-taxonomy.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";

const specs = getG5AU02HiddenPatternSpecs();
const ids = specs.map((spec) => spec.patternSpecId);

test("S96M maps all 22 PatternSpecs to evidence-backed contexts", () => {
  const audit = auditG5AU02ContextTaxonomy();
  assert.equal(audit.ok, true);
  assert.deepEqual(audit.errors, []);
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.mappedPatternSpecCount, 22);
  assert.equal(Object.values(audit.countsByContext).reduce((sum, count) => sum + count, 0), 22);
  assert.ok(Object.values(audit.countsByContext).every((count) => count > 0));
});

test("S96M classifies only existing application evidence as daily-life or geometry", () => {
  for (const id of [
    "ps_g5a_u02_equal_partition_all_segment_counts",
    "ps_g5a_u02_equal_partition_range_constrained_recipients",
    "ps_g5a_u02_maximum_equal_grouping",
    "ps_g5a_u02_possible_equal_packaging_counts",
  ]) assert.equal(getG5AU02PatternContextType(id), "daily_life");

  for (const id of [
    "ps_g5a_u02_rectangle_square_side_lengths",
    "ps_g5a_u02_square_tile_area_possibilities",
  ]) assert.equal(getG5AU02PatternContextType(id), "geometry_context");

  assert.equal(getG5AU02PatternContextType("ps_g5a_u02_greatest_common_factor"), "abstract_math");
  assert.equal(getG5AU02PatternContextType("ps_g5a_u02_multi_constraint_digit_code"), "abstract_math");
});

test("S96M context filters remain canonical-only and mixed preserves the pool", () => {
  assert.deepEqual(filterG5AU02PatternSpecIdsByContext(ids, "mixed"), ids);
  for (const context of ["abstract_math", "daily_life", "geometry_context"]) {
    const filtered = filterG5AU02PatternSpecIdsByContext(ids, context);
    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((id) => ids.includes(id)));
    assert.ok(filtered.every((id) => getG5AU02PatternContextType(id) === context));
  }
});

test("S96M does not expose unsupported SDG or rewrite contexts", () => {
  assert.equal(normalizeG5AU02ContextType("sdg"), "mixed");
  assert.equal(G5A_U02_CONTEXT_TAXONOMY.sdgSupported, false);
  assert.equal(G5A_U02_CONTEXT_TAXONOMY.contextRewriteAllowed, false);
  assert.equal(G5A_U02_CONTEXT_TAXONOMY.genericFallback, false);
  assert.equal(G5A_U02_CONTEXT_TAXONOMY.freeFormAI, false);
  assert.deepEqual(filterG5AU02PatternSpecIdsByContext([], "daily_life"), []);
});
