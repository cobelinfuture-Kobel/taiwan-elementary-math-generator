import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U08_SEMANTIC_PROMOTION_ACTIVATION,
  G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE,
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  getG3BU08SemanticPromotionProjection,
  isS58FPromotedG3BU08KnowledgePointId,
  isS58FPromotedG3BU08PatternGroupId,
  isS58FPromotedG3BU08SemanticPatternSpecId,
  validateG3BU08SemanticPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";

const registry = JSON.parse(readFileSync(
  new URL("../../data/curriculum/registry/promotions/S58F_G3B_U08_SemanticPromotionRegistry.json", import.meta.url),
  "utf8"
));

test("S58F promotion registry has exact 6-KP, 6-group and 24-family parity", () => {
  assert.equal(registry.schemaName, "G3BU08SemanticPromotionRegistry");
  assert.equal(registry.promotionRegistryId, G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID);
  assert.deepEqual(registry.knowledgePointIds, [...G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS]);
  assert.deepEqual(registry.patternGroupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
  assert.deepEqual(registry.patternSpecIds, [...G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS]);
  assert.equal(registry.knowledgePointIds.length, 6);
  assert.equal(registry.patternGroupIds.length, 6);
  assert.equal(registry.patternSpecIds.length, 24);
  assert.deepEqual(
    registry.patternSpecIds,
    listG3BU08SemanticPatternDefinitions().map((definition) => definition.patternSpecId)
  );
});

test("S58F promotes selector visibility without prematurely enabling production", () => {
  assert.deepEqual(registry.lifecycle, G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE);
  assert.deepEqual(registry.activation, G3B_U08_SEMANTIC_PROMOTION_ACTIVATION);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.selectorStatus, "visible");
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.runtimeStatus, "hidden_validated_not_canonical_routed");
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.worksheetStatus, "not_connected");
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE.productionUse, "forbidden");
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.productionEligibilityBehaviorChanged, false);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.canonicalRouterChanged, false);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.canonicalWorksheetChanged, false);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.publicNumericModeAdded, false);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.representationToggleAdded, false);
});

test("S58F overlay does not mutate hidden S58C semantic authority", () => {
  for (const definition of listG3BU08SemanticPatternDefinitions()) {
    assert.equal(definition.selectorStatus, "hidden");
    assert.equal(definition.productionUse, "forbidden");
    assert.equal(isS58FPromotedG3BU08SemanticPatternSpecId(definition.patternSpecId), true);
  }
  for (const id of G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS) {
    assert.equal(isS58FPromotedG3BU08KnowledgePointId(id), true);
  }
  for (const id of G3B_U08_PROMOTED_PATTERN_GROUP_IDS) {
    assert.equal(isS58FPromotedG3BU08PatternGroupId(id), true);
  }
  assert.equal(isS58FPromotedG3BU08SemanticPatternSpecId("ps_unknown"), false);
});

test("S58F runtime promotion projection is immutable-by-copy and self-validating", () => {
  const projection = getG3BU08SemanticPromotionProjection();
  assert.deepEqual(projection.knowledgePointIds, registry.knowledgePointIds);
  assert.deepEqual(projection.patternGroupIds, registry.patternGroupIds);
  assert.deepEqual(projection.patternSpecIds, registry.patternSpecIds);
  projection.patternSpecIds.length = 0;
  assert.equal(getG3BU08SemanticPromotionProjection().patternSpecIds.length, 24);
  const validation = validateG3BU08SemanticPromotionProjection();
  assert.equal(validation.ok, true, validation.errors.join(", "));
  assert.deepEqual(validation.counts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
});
