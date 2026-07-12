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
const FORMAL_MAPPING_PATH = new URL(
  "../../data/curriculum/mapping/S60E_G5A_U08_FormalMapping.json",
  import.meta.url,
);

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

test("S60F materializes 17 hidden groups and 30 hidden PatternSpecs", () => {
  const registry = readJson(REGISTRY_PATH);
  const groupIds = registry.patternGroups.map((row) => row.patternGroupId);
  const specIds = registry.patternSpecs.map((row) => row.patternSpecId);
  const modeCounts = registry.patternSpecs.reduce((acc, row) => {
    acc[row.mode] = (acc[row.mode] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(registry.schemaVersion, 2);
  assert.equal(registry.fullFixTask, "S60F_R1_G5A_U08_AverageReasoningModeConsistency_FullFix");
  assert.equal(registry.patternGroups.length, 17);
  assert.equal(registry.patternSpecs.length, 30);
  assert.equal(new Set(groupIds).size, 17);
  assert.equal(new Set(specIds).size, 30);
  assert.deepEqual(modeCounts, { numeric: 16, reasoning: 5, application: 9 });
  assert.equal(registry.summary.contextualReasoningPatternSpecCount, 2);
  assert.equal(registry.summary.visiblePatternSpecCount, 0);
  assert.equal(registry.summary.routedPatternSpecCount, 0);
  assert.equal(registry.summary.productionPatternSpecCount, 0);
});

test("S60F browser-neutral projection exactly matches authoritative identity rows", () => {
  const registry = readJson(REGISTRY_PATH);
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
      ...(row.contextualReasoning ? { contextualReasoning: true } : {}),
      answerModelId: row.answerModel.shape,
      ...(row.templateFamilyId ? { templateFamilyId: row.templateFamilyId } : {}),
      patternOrder: row.patternOrder,
    })),
    registry.patternSpecs,
  );
});

test("S60F registry remains identity-aligned with the corrected S60E FormalMapping", () => {
  const registry = readJson(REGISTRY_PATH);
  const mapping = readJson(FORMAL_MAPPING_PATH);
  const formalById = new Map(mapping.patternSpecs.map((row) => [row.patternSpecId, row]));

  assert.equal(formalById.size, registry.patternSpecs.length);
  for (const spec of registry.patternSpecs) {
    const formal = formalById.get(spec.patternSpecId);
    assert.ok(formal, `${spec.patternSpecId} should exist in S60E`);
    assert.equal(spec.patternGroupId, formal.patternGroupId, `${spec.patternSpecId} group`);
    assert.equal(spec.knowledgePointId, formal.knowledgePointId, `${spec.patternSpecId} KP`);
    assert.equal(spec.mode, formal.mode, `${spec.patternSpecId} mode`);
    assert.equal(spec.answerModelId, formal.answerModelId, `${spec.patternSpecId} answer model`);
    assert.equal(spec.templateFamilyId, formal.templateFamilyId, `${spec.patternSpecId} template`);
    assert.equal(spec.contextualReasoning, formal.contextualReasoning, `${spec.patternSpecId} contextual reasoning`);
  }
});

test("S60F group membership is complete, non-overlapping and mode-consistent", () => {
  const registry = readJson(REGISTRY_PATH);
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

test("S60F average inverse and update are contextual reasoning with preserved templates", () => {
  const registry = readJson(REGISTRY_PATH);
  const ids = ["ps_g5a_u08_app_average_inverse", "ps_g5a_u08_app_average_update"];

  for (const id of ids) {
    const spec = registry.patternSpecs.find((row) => row.patternSpecId === id);
    assert.ok(spec, `${id} should exist`);
    assert.equal(spec.patternGroupId, "pg_g5a_u08_average_reasoning");
    assert.equal(spec.mode, "reasoning");
    assert.equal(spec.contextualReasoning, true);
    assert.equal(spec.templateFamilyId, "tf_g5a_u08_average_inverse_or_update");
    assert.equal(spec.answerModelId, "averageInverseAnswer");
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
  const registry = readJson(REGISTRY_PATH);

  assert.equal(registry.policy.selectorVisibility, "hidden");
  assert.equal(registry.policy.canonicalRouting, "disabled");
  assert.equal(registry.policy.productionUse, "forbidden");
  assert.equal(registry.policy.genericFallback, "forbidden");
  assert.equal(registry.policy.publicNPlus2, "forbidden");
  assert.equal(registry.policy.publicFormalEquation, "forbidden");
  assert.equal(registry.policy.patternSpecModeMustMatchPatternGroupMode, true);
  assert.equal(registry.policy.contextualReasoningMayUseTemplateFamily, true);

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
