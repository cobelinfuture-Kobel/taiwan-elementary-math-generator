import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { OPERATORS } from "../../../site/modules/core/constants.js";
import { getBatchABrowserPatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-index.js";
import { BATCH_A_SELECTOR_AVAILABILITY } from "../../../site/modules/curriculum/registry/batch-a-selector-candidates.js";

const knowledgePoints = JSON.parse(fs.readFileSync("data/curriculum/registry/batch_a_knowledge_points.json", "utf8"));
const patternGroups = JSON.parse(fs.readFileSync("data/curriculum/registry/batch_a_pattern_groups.json", "utf8"));
const patternMap = JSON.parse(fs.readFileSync("data/curriculum/registry/batch_a_knowledge_point_pattern_map.json", "utf8"));

function rowById(registry, idField, id) {
  return registry.rows.find((row) => row[idField] === id);
}

test("add multi-carry candidate PatternSpec exists as four-digit addition seed", () => {
  const definition = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry");

  assert.ok(definition, "PatternSpec bridge must exist before promotion QA can continue");
  assert.equal(definition.sourceId, "g3a_u02_3a02");
  assert.equal(definition.kind, "expression");
  assert.deepEqual(definition.operators, [[OPERATORS.ADD]]);
  assert.deepEqual(definition.ranges, [[1000, 4999], [1000, 4999]]);
  assert.equal(definition.answerConstraint.max, 9999);
  assert.equal(definition.answerConstraint.allowNegative, false);
  assert.equal(definition.answerConstraint.requireInteger, true);
});

test("add multi-carry candidate registry triplet remains hidden until promotion QA passes", () => {
  const kp = rowById(knowledgePoints, "knowledgePointId", "kp_g3a_u02_add_multi_carry");
  const group = rowById(patternGroups, "patternGroupId", "pg_g3a_u02_add_multi_carry_seed");
  const mapping = rowById(patternMap, "mappingId", "map_g3a_u02_add_multi_carry_seed");

  assert.equal(kp.supportClass, "A");
  assert.equal(kp.registryStatus, "materialized");
  assert.equal(kp.htmlSelectableStatus, "hidden");
  assert.equal(kp.holdReason, "qa_pending");

  assert.equal(group.supportClass, "A");
  assert.deepEqual(group.patternSpecIds, ["ps_g3a_u02_4digit_add_multi_carry"]);
  assert.equal(group.generatorSupportStatus, "seed_supported");
  assert.equal(group.validatorSupportStatus, "seed_supported");
  assert.equal(group.htmlWorksheetStatus, "seed_printable");
  assert.equal(group.answerKeyStatus, "seed_supported");
  assert.equal(group.visibilityStatus, "hidden");
  assert.equal(group.holdReason, "qa_pending");

  assert.equal(mapping.patternSpecId, "ps_g3a_u02_4digit_add_multi_carry");
  assert.equal(mapping.htmlExposurePolicy, "internal_only");
  assert.equal(mapping.qaStatus, "smoke_test_required");
  assert.equal(mapping.holdReason, "constraint_warning");
});

test("strict multi-carry promotion is blocked until explicit carry policy exists", () => {
  const definition = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry");

  assert.equal(Object.hasOwn(definition, "carryPolicy"), false);
  assert.equal(Object.hasOwn(definition, "algorithmConstraint"), false);
  assert.equal(Object.hasOwn(definition, "validatorHooks"), false);
  assert.deepEqual(definition.difficultyTags, ["batch_a_browser_bridge"]);
});

test("browser selector projection remains zero-visible after promotion QA guard", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount, 2);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, 2);
  assert.deepEqual(BATCH_A_SELECTOR_AVAILABILITY.bySourceId.g3a_u02_3a02, {
    sourceId: "g3a_u02_3a02",
    visibleCount: 0,
    hiddenPendingCount: 2,
    notSelectableCount: 2
  });
});

test("D-class G3A-U02 rows remain non-promotable during add multi-carry QA", () => {
  const dKnowledgePointIds = [
    "kp_g3a_u02_estimate_nearest_thousand",
    "kp_g3a_u02_word_problem_estimation_add_sub"
  ];

  for (const knowledgePointId of dKnowledgePointIds) {
    const kp = rowById(knowledgePoints, "knowledgePointId", knowledgePointId);
    assert.equal(kp.supportClass, "D");
    assert.equal(kp.htmlSelectableStatus, "not_selectable");
    assert.notEqual(kp.holdReason, null);
  }
});
