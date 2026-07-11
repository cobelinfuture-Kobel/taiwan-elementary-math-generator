import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
  getG3BU08SemanticPatternDefinition,
  getG3BU08SemanticPatternGroup,
  listG3BU08SemanticPatternDefinitions,
  listG3BU08SemanticPatternDefinitionsForKnowledgePoint,
  listG3BU08SemanticPatternGroups
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";

const source = JSON.parse(readFileSync(new URL("../../data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json", import.meta.url), "utf8"));
const registry = JSON.parse(readFileSync(new URL("../../data/curriculum/pattern_specs/S58C_G3B_U08_SemanticPatternSpecRegistry.json", import.meta.url), "utf8"));

function projectedFamily(spec) {
  return {
    templateFamilyId: spec.templateFamilyId,
    knowledgePointId: spec.knowledgePointId,
    semanticSignature: spec.semanticSignature,
    equationShape: spec.equationShape,
    unknownRole: spec.unknownRole,
    contextDomains: spec.contextDomains,
    quantityRoles: spec.quantityRoles,
    requiredConstraints: spec.requiredConstraints,
    sourceEvidenceTier: spec.sourceEvidenceTier
  };
}

test("S58C materializes exactly 24 hidden PatternSpecs in six PatternGroups", () => {
  assert.equal(registry.schemaName, "G3BU08SemanticPatternSpecRegistry");
  assert.equal(registry.patternSpecs.length, 24);
  assert.equal(registry.patternGroups.length, 6);
  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)).size, 24);
  assert.equal(new Set(registry.patternSpecs.map((spec) => spec.templateFamilyId)).size, 24);
  assert.equal(registry.summary.selectorVisibleCount, 0);
  assert.equal(registry.summary.productionReadyCount, 0);
  for (const spec of registry.patternSpecs) {
    assert.equal(spec.patternSpecId, spec.templateFamilyId.replace(/^tpl_/, "ps_"));
    assert.equal(spec.kind, "g3bU08SemanticApplication");
    assert.equal(spec.sourceId, "g3b_u08_3b08");
    assert.equal(spec.patternGroupId, spec.knowledgePointId.replace(/^kp_/, "pg_"));
    assert.equal(spec.representation, "horizontal_only");
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.productionUse, "forbidden");
    assert.equal(spec.runtimeProjectionStatus, "materialized_not_routed");
    assert.equal(spec.generatorStatus, "hidden_not_implemented");
    assert.equal(spec.validatorStatus, "contract_only_not_runtime");
  }
});

test("S58C preserves every frozen family contract without semantic drift", () => {
  const sourceByFamily = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));
  assert.equal(sourceByFamily.size, 24);
  for (const spec of registry.patternSpecs) {
    const family = sourceByFamily.get(spec.templateFamilyId);
    const expected = {
      templateFamilyId: family.templateFamilyId,
      knowledgePointId: family.knowledgePointId,
      semanticSignature: family.semanticSignature,
      equationShape: family.equationShape,
      unknownRole: family.unknownRole,
      contextDomains: family.contextDomains,
      quantityRoles: family.quantityRoles,
      requiredConstraints: family.requiredConstraints,
      sourceEvidenceTier: family.sourceEvidenceTier
    };
    assert.deepEqual(projectedFamily(spec), expected);
  }
  assert.deepEqual(registry.coverageSummary, source.familyAllocation);
});

test("S58C applies the four frozen human-readback FullFix policies", () => {
  const segment = getG3BU08SemanticPatternDefinition("ps_g3b_u08_group_count_equal_segments");
  assert.match(segment.promptSkeletonZh, /每段長/);
  assert.doesNotMatch(segment.promptSkeletonZh, /每段剪成/);
  const scoreTotal = getG3BU08SemanticPatternDefinition("ps_g3b_u08_total_score_per_success");
  const scoreCount = getG3BU08SemanticPatternDefinition("ps_g3b_u08_group_count_score_events");
  assert.ok(scoreTotal.fullFixRules.includes("SUCCESS_EVENT_PHRASE_NATURAL"));
  assert.ok(scoreCount.fullFixRules.includes("SUCCESS_EVENT_CLASSIFIER_MATCH"));
  for (const spec of registry.patternSpecs.filter((entry) => entry.knowledgePointId === "kp_g3b_u08_same_price_value_comparison")) {
    assert.ok(spec.fullFixRules.includes("SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"));
  }
});

test("S58C PatternGroups partition the 24 families and remain hidden", () => {
  const ids = registry.patternGroups.flatMap((group) => group.patternSpecIds);
  assert.equal(ids.length, 24);
  assert.equal(new Set(ids).size, 24);
  assert.deepEqual(new Set(ids), new Set(registry.patternSpecs.map((spec) => spec.patternSpecId)));
  for (const group of registry.patternGroups) {
    assert.equal(group.patternSpecIds.length, 4);
    assert.equal(group.visibilityStatus, "hidden");
    assert.equal(group.allocationPolicy, "balanced_by_family");
    assert.equal(listG3BU08SemanticPatternDefinitionsForKnowledgePoint(group.primaryKnowledgePointId).length, 4);
    assert.deepEqual(getG3BU08SemanticPatternGroup(group.patternGroupId), group);
  }
});

test("S58C browser-neutral runtime projection exactly matches the authoritative registry", () => {
  assert.deepEqual(listG3BU08SemanticPatternDefinitions(), registry.patternSpecs);
  assert.deepEqual(listG3BU08SemanticPatternGroups(), registry.patternGroups);
  assert.deepEqual(G3B_U08_SEMANTIC_PATTERN_SPEC_IDS, registry.patternSpecs.map((spec) => spec.patternSpecId));
  for (const spec of registry.patternSpecs) assert.deepEqual(getG3BU08SemanticPatternDefinition(spec.patternSpecId), spec);
});

test("S58D adds only the hidden generator while selector and validator runtime remain deferred", () => {
  assert.equal(existsSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-g3b-u08-semantic-extension.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js", import.meta.url)), true);
  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js", import.meta.url)), true);
  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("../../site/modules/curriculum/batch-a/g3b-u08-semantic-router.js", import.meta.url)), false);
});
