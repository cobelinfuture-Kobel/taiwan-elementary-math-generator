import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G5A_U08_HIDDEN_PATTERN_GROUPS,
  G5A_U08_HIDDEN_PATTERN_SPECS,
  getG5AU08HiddenPatternGroups,
  getG5AU08HiddenPatternSpecById,
  getG5AU08HiddenPatternSpecs,
} from "../../site/modules/curriculum/batch-a/source-pattern-g5a-u08-extension.js";

const REGISTRY_PATH = new URL(
  "../../data/curriculum/pattern_specs/S60F_G5A_U08_PatternSpecRegistry.json",
  import.meta.url,
);

function loadRegistry() {
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
}

test("S60F materializes 17 hidden groups and 30 hidden PatternSpecs", () => {
  const registry = loadRegistry();
  const groupIds = registry.patternGroups.map((row) => row.patternGroupId);
  const specIds = registry.patternSpecs.map((row) => row.patternSpecId);

  assert.equal(registry.patternGroups.length, 17);
  assert.equal(registry.patternSpecs.length, 30);
  assert.equal(new Set(groupIds).size, 17);
  assert.equal(new Set(specIds).size, 30);
  assert.equal(registry.summary.visiblePatternSpecCount, 0);
  assert.equal(registry.summary.routedPatternSpecCount, 0);
  assert.equal(registry.summary.productionPatternSpecCount, 0);
});

test("S60F browser-neutral projection exactly matches authoritative identity rows", () => {
  const registry = loadRegistry();
  assert.deepEqual(
    G5A_U08_HIDDEN_PATTERN_GROUPS.map((row) => ({
      patternGroupId: row.patternGroupId,
      knowledgePointId: row.primaryKnowledgePointId,
      mode: row.mode,
      patternSpecIds: row.patternSpecIds,
    })),
    registry.patternGroups,
  );

  assert.deepEqual(
    G5A_U08_HIDDEN_PATTERN_SPECS.map((row) => ({
      patternSpecId: row.patternSpecId,
      patternGroupId: row.patternGroupId,
      knowledgePointId: row.knowledgePointId,
      mode: row.mode,
      answerModelId: row.answerModel.shape,
      ...(row.templateFamilyId ? { templateFamilyId: row.templateFamilyId } : {}),
      patternOrder: row.patternOrder,
    })),
    registry.patternSpecs,
  );
});

test("S60F group membership is complete and non-overlapping", () => {
  const registry = loadRegistry();
  const groupedSpecIds = registry.patternGroups.flatMap((row) => row.patternSpecIds);
  const specIds = registry.patternSpecs.map((row) => row.patternSpecId);

  assert.equal(groupedSpecIds.length, 30);
  assert.equal(new Set(groupedSpecIds).size, 30);
  assert.deepEqual([...groupedSpecIds].sort(), [...specIds].sort());

  for (const group of registry.patternGroups) {
    for (const patternSpecId of group.patternSpecIds) {
      const spec = registry.patternSpecs.find((row) => row.patternSpecId === patternSpecId);
      assert.ok(spec, `${patternSpecId} should exist`);
      assert.equal(spec.patternGroupId, group.patternGroupId);
      assert.equal(spec.knowledgePointId, group.knowledgePointId);
      assert.equal(spec.mode, group.mode);
    }
  }
});

test("S60F projection is deeply frozen and exposes stable read-only accessors", () => {
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_GROUPS), true);
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_SPECS), true);
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_GROUPS[0]), true);
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_GROUPS[0].patternSpecIds), true);
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_SPECS[0]), true);
  assert.equal(Object.isFrozen(G5A_U08_HIDDEN_PATTERN_SPECS[0].answerModel), true);

  assert.equal(getG5AU08HiddenPatternGroups(), G5A_U08_HIDDEN_PATTERN_GROUPS);
  assert.equal(getG5AU08HiddenPatternSpecs(), G5A_U08_HIDDEN_PATTERN_SPECS);
  assert.equal(
    getG5AU08HiddenPatternSpecById("ps_g5a_u08_app_average_update")?.patternOrder,
    30,
  );
  assert.equal(getG5AU08HiddenPatternSpecById("unknown"), null);
});

test("S60F keeps every materialized row hidden, unrouted and forbidden in production", () => {
  const registry = loadRegistry();

  assert.equal(registry.policy.selectorVisibility, "hidden");
  assert.equal(registry.policy.canonicalRouting, "disabled");
  assert.equal(registry.policy.productionUse, "forbidden");
  assert.equal(registry.policy.genericFallback, "forbidden");
  assert.equal(registry.policy.publicNPlus2, "forbidden");
  assert.equal(registry.policy.publicFormalEquation, "forbidden");

  for (const group of G5A_U08_HIDDEN_PATTERN_GROUPS) {
    assert.equal(group.visibilityStatus, "hidden");
  }
  for (const spec of G5A_U08_HIDDEN_PATTERN_SPECS) {
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.productionUse, "forbidden");
    assert.equal(spec.generatorStatus, "hidden_not_implemented");
    assert.equal(spec.validatorStatus, "contract_only_not_runtime");
  }
});
