import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  G3B_U04_SEMANTIC_PATTERN_SPEC_IDS,
  getBatchABrowserPatternDefinition,
  getBatchAPatternSpecIdsForSource,
  getG3BU04SemanticPatternDefinition,
  listG3BU04SemanticPatternDefinitions,
  listG3BU04SemanticPatternGroups
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";

const SOURCE_ID = "g3b_u04_3b04";
const source = JSON.parse(readFileSync(new URL("../../data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json", import.meta.url), "utf8"));
const registry = JSON.parse(readFileSync(new URL("../../data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json", import.meta.url), "utf8"));
const obsoletePseudoKps = new Set([
  "kp_g3b_u04_divide_then_subtract",
  "kp_g3b_u04_basic_multiplicative_comparison",
  "kp_g3b_u04_multiplicative_relationship_chain",
  "kp_g3b_u04_line_segment_two_step_word_problem",
  "kp_g3b_u04_equal_sharing_then_add_subtract",
  "kp_g3b_u04_packaging_then_add_subtract",
  "kp_g3b_u04_multiplication_context_rows_boxes_groups",
  "kp_g3b_u04_multi_layer_multiplicative_reasoning"
]);

function projectedFamily(spec) {
  return {
    templateFamilyId: spec.templateFamilyId,
    knowledgePointId: spec.knowledgePointId,
    semanticSignature: spec.semanticSignature,
    equationShape: spec.equationShape,
    unknownRole: spec.unknownRole,
    contextDomains: spec.contextDomains,
    quantityRoles: spec.quantityRoles,
    promptSkeletonZh: spec.promptSkeletonZh,
    requiredConstraints: spec.requiredConstraints
  };
}

test("S57E1 materializes exactly 32 semantic PatternSpecs across the approved nine KnowledgePoints", () => {
  assert.equal(registry.schemaName, "G3BU04SemanticPatternSpecRegistry");
  assert.equal(registry.task, "S57E1_G3B_U04_SemanticPatternSpecMaterialization");
  assert.equal(registry.sourceId, SOURCE_ID);
  assert.equal(registry.patternSpecs.length, 32);
  assert.equal(registry.patternGroups.length, 9);
  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)).size, 32);
  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.templateFamilyId)).size, 32);
  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.knowledgePointId)).size, 9);
  assert.equal(registry.summary.orphanPatternSpecCount, 0);
  assert.equal(registry.summary.selectorVisibleCount, 0);
  assert.equal(registry.summary.productionReadyCount, 0);
  for (const spec of registry.patternSpecs) {
    assert.equal(spec.patternSpecId, spec.templateFamilyId.replace(/^tpl_/, "ps_"));
    assert.equal(spec.kind, "g3bU04SemanticWordProblem");
    assert.equal(spec.sourceId, SOURCE_ID);
    assert.equal(spec.patternGroupId, spec.knowledgePointId.replace(/^kp_/, "pg_"));
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.productionUse, "forbidden");
    assert.equal(spec.runtimeProjectionStatus, "materialized_not_routed");
    assert.equal(spec.generatorStatus, "hidden_implementation_candidate");
    assert.equal(spec.validatorStatus, "blocking_validator_required");
    assert.deepEqual(spec.answerModel, {
      shape: "semantic_equation_answer",
      fields: ["equationModel", "finalAnswer", "finalAnswerWithUnit", "semanticSnapshot"]
    });
    assert.equal(obsoletePseudoKps.has(spec.knowledgePointId), false);
  }
});

test("S57E1 PatternSpecs preserve the approved S57 family contract without registry drift", () => {
  const sourceByFamily = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));
  assert.equal(sourceByFamily.size, 32);
  for (const spec of registry.patternSpecs) {
    assert.deepEqual(projectedFamily(spec), sourceByFamily.get(spec.templateFamilyId));
  }
  assert.deepEqual(registry.coverageSummary, source.coverageSummary);
});

test("S57E1 PatternGroups partition all 32 families and preserve hidden balanced allocation", () => {
  const groupedIds = registry.patternGroups.flatMap((group) => group.patternSpecIds);
  assert.equal(groupedIds.length, 32);
  assert.equal(new Set(groupedIds).size, 32);
  assert.deepEqual(new Set(groupedIds), new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)));
  for (const group of registry.patternGroups) {
    assert.equal(group.patternGroupId, group.primaryKnowledgePointId.replace(/^kp_/, "pg_"));
    assert.deepEqual(group.knowledgePointIds, [group.primaryKnowledgePointId]);
    assert.equal(group.allocationPolicy, "balanced_by_family");
    assert.equal(group.visibilityStatus, "hidden");
    assert.equal(group.holdReason, "semantic_runtime_and_smoke_qa_required");
    assert.equal(group.patternSpecIds.length, source.coverageSummary[group.primaryKnowledgePointId]);
  }
});

test("S57E1 browser projection is an exact drift-checked copy and delegates prior definitions", () => {
  const runtimeSpecs = listG3BU04SemanticPatternDefinitions();
  const runtimeGroups = listG3BU04SemanticPatternGroups();
  assert.deepEqual(runtimeSpecs, registry.patternSpecs);
  assert.deepEqual(runtimeGroups, registry.patternGroups);
  assert.deepEqual(G3B_U04_SEMANTIC_PATTERN_SPEC_IDS, registry.patternSpecs.map((spec) => spec.patternSpecId));
  for (const spec of registry.patternSpecs) assert.deepEqual(getG3BU04SemanticPatternDefinition(spec.patternSpecId), spec);
  assert.equal(getBatchABrowserPatternDefinition("ps_g3b_u04_consecutive_multiplication")?.patternSpecId, "ps_g3b_u04_consecutive_multiplication");
  const sourceIds = getBatchAPatternSpecIdsForSource(SOURCE_ID);
  for (const patternSpecId of G3B_U04_SEMANTIC_PATTERN_SPEC_IDS) assert.equal(sourceIds.includes(patternSpecId), true);
});

test("S57E1 authority remains hidden after S57F2 selector overlay is materialized", () => {
  const selectorPath = new URL("../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js", import.meta.url);
  assert.equal(existsSync(selectorPath), true);
  assert.equal(registry.patternSpecs.every((spec) => spec.selectorStatus === "hidden"), true);
  assert.equal(registry.patternSpecs.every((spec) => spec.productionUse === "forbidden"), true);
  assert.equal(registry.patternGroups.every((group) => group.visibilityStatus === "hidden"), true);
});
