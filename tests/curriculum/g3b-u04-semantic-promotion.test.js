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

const registry = JSON.parse(readFileSync(registryUrl, "utf8"));
const semanticRegistry = JSON.parse(readFileSync(semanticRegistryUrl, "utf8"));

function sorted(values) {
  return [...values].sort();
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contains duplicate IDs`);
}

function assertEvidenceExists(key) {
  const evidencePath = registry.promotionEvidence[key];
  assert.equal(typeof evidencePath, "string", `Missing evidence path for ${key}`);
  assert.equal(
    existsSync(new URL(`../../${evidencePath}`, import.meta.url)),
    true,
    `Missing committed promotion evidence: ${evidencePath}`
  );
}

test("S57F7 retains the exact 9-KP, 9-group, 32-PatternSpec lifecycle registry and accepts production promotion", () => {
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
  assert.equal(registry.activation.status, "production_promotion_accepted");
  assert.equal(registry.activation.acceptedByTask, "S57F7_G3B_U04_ProductionRegressionStressHTMLPDFPromotionCloseout");
  assert.equal(registry.activation.requiredNextGate, null);
  assert.equal(registry.activation.publicProjectionChanged, true);
  assert.equal(registry.activation.selectorBehaviorChanged, true);
  assert.equal(registry.activation.productionEligibilityBehaviorChanged, true);
  assert.equal(registry.activation.canonicalRouterChanged, true);
  assert.equal(registry.activation.canonicalWorksheetChanged, true);
  assert.equal(registry.activation.publicSelectorAndPrintQaAccepted, true);
  assert.equal(registry.activation.finalStressAccepted, true);
  assert.equal(registry.activation.finalHtmlPdfSmokeAccepted, true);
  assert.equal(registry.rollbackKey, registry.promotionRegistryId);
});

test("S57F7 JSON and browser-neutral projection retain exact ID and activation parity", () => {
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

test("S57F7 promotion IDs exactly cover the immutable S57E semantic authority", () => {
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

test("S57F7 promotion evidence includes hidden-runtime, public-control, and final HTML/PDF acceptance artifacts", () => {
  for (const key of [
    "s57eFinalCloseout",
    "s57e7r1UnitFlowFullFix",
    "s57f6PublicSelectorPrintCloseout",
    "publicHtmlSmoke",
    "publicPdfSmoke",
    "publicSmokeManifest"
  ]) {
    assertEvidenceExists(key);
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

  const publicManifest = JSON.parse(readFileSync(
    new URL(`../../${registry.promotionEvidence.publicSmokeManifest}`, import.meta.url),
    "utf8"
  ));
  assert.equal(publicManifest.status, "public_html_pdf_smoke_pass");
  assert.equal(publicManifest.questionCount, 64);
  assert.equal(publicManifest.answerKeyItemCount, 64);
  assert.equal(publicManifest.templateFamilyCount, 32);
  assert.equal(publicManifest.familyContextVariantCount, 117);
  assert.equal(publicManifest.actualPdfPageCount, 16);
  assert.equal(publicManifest.publicHiddenModeFlagUsed, false);
  assert.equal(publicManifest.internalIdLeakCount, 0);

  assert.equal(registry.semanticAuthorityPolicy.overlayOnly, true);
  assert.equal(registry.semanticAuthorityPolicy.semanticFieldsImmutable, true);
  assert.equal(registry.semanticAuthorityPolicy.freeFormAIGeneration, "forbidden");
});
