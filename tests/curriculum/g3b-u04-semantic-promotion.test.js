import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_SEMANTIC_PROMOTION_ACTIVATION,
  G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  getG3BU04SemanticPromotionProjection,
  isS57FPromotedG3BU04KnowledgePointId,
  isS57FPromotedG3BU04PatternGroupId,
  isS57FPromotedG3BU04SemanticPatternSpecId,
  validateG3BU04SemanticPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";

const registryUrl = new URL(
  "../../data/curriculum/registry/promotions/S57F_G3B_U04_SemanticPromotionRegistry.json",
  import.meta.url
);
const semanticRegistryUrl = new URL(
  "../../data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json",
  import.meta.url
);
const selectorExtensionUrl = new URL(
  "../../site/modules/curriculum/registry/batch-a-selector-extension.js",
  import.meta.url
);
const productionEligibilityUrl = new URL(
  "../../site/modules/curriculum/batch-a/production-eligibility.js",
  import.meta.url
);

const registry = JSON.parse(readFileSync(registryUrl, "utf8"));
const semanticRegistry = JSON.parse(readFileSync(semanticRegistryUrl, "utf8"));

function sorted(values) {
  return [...values].sort();
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contains duplicate IDs`);
}

test("S57F1 materializes an exact 9-KP, 9-group, 32-PatternSpec lifecycle registry", () => {
  assert.equal(registry.schemaName, "G3BU04SemanticPromotionRegistry");
  assert.equal(registry.task, "S57F1_G3B_U04_SemanticPromotionLifecycleRegistry");
  assert.equal(registry.promotionRegistryId, G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID);
  assert.equal(registry.sourceId, "g3b_u04_3b04");
  assert.equal(registry.knowledgePointIds.length, 9);
  assert.equal(registry.patternGroupIds.length, 9);
  assert.equal(registry.patternSpecIds.length, 32);
  assertUnique(registry.knowledgePointIds, "knowledgePointIds");
  assertUnique(registry.patternGroupIds, "patternGroupIds");
  assertUnique(registry.patternSpecIds, "patternSpecIds");
  assert.deepEqual(registry.lifecycle, G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE);
  assert.deepEqual(registry.activation, G3B_U04_SEMANTIC_PROMOTION_ACTIVATION);
  assert.equal(registry.activation.status, "materialized_not_consumed");
  assert.equal(registry.activation.publicProjectionChanged, false);
  assert.equal(registry.activation.selectorBehaviorChanged, false);
  assert.equal(registry.activation.productionEligibilityBehaviorChanged, false);
  assert.equal(registry.rollbackKey, registry.promotionRegistryId);
});

test("S57F1 JSON and browser-neutral projection have exact ID parity", () => {
  const projection = getG3BU04SemanticPromotionProjection();
  assert.deepEqual(registry.knowledgePointIds, G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
  assert.deepEqual(registry.patternGroupIds, G3B_U04_PROMOTED_PATTERN_GROUP_IDS);
  assert.deepEqual(registry.patternSpecIds, G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS);
  assert.deepEqual(projection.knowledgePointIds, registry.knowledgePointIds);
  assert.deepEqual(projection.patternGroupIds, registry.patternGroupIds);
  assert.deepEqual(projection.patternSpecIds, registry.patternSpecIds);
  assert.deepEqual(projection.lifecycle, registry.lifecycle);
  assert.deepEqual(projection.activation, registry.activation);
  assert.equal(validateG3BU04SemanticPromotionProjection().ok, true);
  assert.deepEqual(validateG3BU04SemanticPromotionProjection().errors, []);

  for (const id of registry.knowledgePointIds) assert.equal(isS57FPromotedG3BU04KnowledgePointId(id), true);
  for (const id of registry.patternGroupIds) assert.equal(isS57FPromotedG3BU04PatternGroupId(id), true);
  for (const id of registry.patternSpecIds) assert.equal(isS57FPromotedG3BU04SemanticPatternSpecId(id), true);
  assert.equal(isS57FPromotedG3BU04SemanticPatternSpecId("ps_g3b_u04_unregistered"), false);
});

test("S57F1 promotion IDs exactly cover immutable S57E semantic authority", () => {
  const definitions = listG3BU04SemanticPatternDefinitions();
  assert.equal(definitions.length, 32);
  assert.deepEqual(
    registry.patternSpecIds,
    definitions.map((definition) => definition.patternSpecId)
  );
  assert.deepEqual(
    sorted(registry.knowledgePointIds),
    sorted(new Set(definitions.map((definition) => definition.knowledgePointId)))
  );
  assert.deepEqual(
    sorted(registry.patternGroupIds),
    sorted(new Set(definitions.map((definition) => definition.patternGroupId)))
  );
  assert.deepEqual(
    registry.patternSpecIds,
    semanticRegistry.patternSpecs.map((patternSpec) => patternSpec.patternSpecId)
  );
  assert.equal(definitions.every((definition) => definition.selectorStatus === "hidden"), true);
  assert.equal(definitions.every((definition) => definition.productionUse === "forbidden"), true);
  assert.equal(semanticRegistry.patternSpecs.every((patternSpec) => patternSpec.selectorStatus === "hidden"), true);
  assert.equal(semanticRegistry.patternSpecs.every((patternSpec) => patternSpec.productionUse === "forbidden"), true);
});

test("S57F1 evidence is complete and activation remains disconnected from public behavior", () => {
  const committedEvidenceKeys = ["s57eFinalCloseout", "s57e7r1UnitFlowFullFix"];
  for (const key of committedEvidenceKeys) {
    const evidencePath = registry.promotionEvidence[key];
    assert.equal(
      existsSync(new URL(`../../${evidencePath}`, import.meta.url)),
      true,
      `Missing committed promotion evidence: ${evidencePath}`
    );
  }

  assert.equal(
    registry.promotionEvidence.hiddenHtmlSmoke,
    "docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.html"
  );
  assert.equal(
    registry.promotionEvidence.hiddenPdfSmoke,
    "docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.pdf"
  );
  assert.equal(
    registry.promotionEvidence.hiddenSmokeManifest,
    "docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.manifest.json"
  );

  const finalCloseout = readFileSync(
    new URL(`../../${registry.promotionEvidence.s57eFinalCloseout}`, import.meta.url),
    "utf8"
  );
  assert.match(finalCloseout, /HTML_SMOKE = PASS/);
  assert.match(finalCloseout, /PDF_SMOKE = PASS/);
  assert.match(finalCloseout, /PDF_PAGES = 16/);

  const selectorExtension = readFileSync(selectorExtensionUrl, "utf8");
  const productionEligibility = readFileSync(productionEligibilityUrl, "utf8");
  assert.equal(selectorExtension.includes("g3b-u04-semantic-promotion"), false);
  assert.equal(selectorExtension.includes("s57f_g3b_u04_semantic_promotion"), false);
  assert.equal(productionEligibility.includes("s57f_g3b_u04_semantic_promotion"), false);
  assert.equal(registry.semanticAuthorityPolicy.overlayOnly, true);
  assert.equal(registry.semanticAuthorityPolicy.semanticFieldsImmutable, true);
  assert.equal(registry.semanticAuthorityPolicy.freeFormAIGeneration, "forbidden");
});
