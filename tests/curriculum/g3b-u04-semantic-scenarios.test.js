import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { G3B_U04_SEMANTIC_DOMAIN_ROWS } from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-domain-rows.js";
import { G3B_U04_SEMANTIC_ROLE_ROWS } from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-role-rows.js";
import { G3B_U04_SEMANTIC_SCENARIO_ROWS } from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-scenario-rows.js";
import {
  G3B_U04_SEMANTIC_DOMAIN_PROFILES,
  G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS,
  G3B_U04_SEMANTIC_REALISM_PROFILES,
  G3B_U04_SEMANTIC_ROLE_DEFINITIONS,
  G3B_U04_SEMANTIC_SCENARIO_PROFILES,
  G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY,
  getG3BU04SemanticDomainProfile,
  getG3BU04SemanticRoleDefinition,
  listG3BU04ScenarioProfilesForContext,
  listG3BU04ScenarioProfilesForFamily,
  resolveG3BU04SemanticScenarioProfile
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js";

const source = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json",
  import.meta.url
), "utf8"));
const patternRegistry = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/pattern_specs/S57E_G3B_U04_SemanticPatternSpecs.json",
  import.meta.url
), "utf8"));
const manifest = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/scenarios/S57E2_G3B_U04_SemanticScenarioRoleRegistry.json",
  import.meta.url
), "utf8"));
const roleShard = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/scenarios/S57E2_G3B_U04_SemanticRoles.json",
  import.meta.url
), "utf8"));
const domainShard = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/scenarios/S57E2_G3B_U04_DomainProfiles.json",
  import.meta.url
), "utf8"));
const scenarioShard = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/scenarios/S57E2_G3B_U04_ScenarioProfiles.json",
  import.meta.url
), "utf8"));

function promptPlaceholders(prompt) {
  return [...String(prompt).matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function familyContextPairs(families) {
  return families.flatMap((family) => family.contextDomains.map((domain) => `${family.templateFamilyId}::${domain}`)).sort();
}

test("S57E2 manifest locks a complete hidden scenario-role milestone", () => {
  assert.equal(manifest.schemaName, "G3BU04SemanticScenarioRoleRegistry");
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.task, "S57E2_G3B_U04_SemanticScenarioAndRoleRegistry");
  assert.equal(manifest.sourceId, "g3b_u04_3b04");
  assert.equal(manifest.summary.scenarioProfileCount, 32);
  assert.equal(manifest.summary.domainVariantCount, 117);
  assert.equal(manifest.summary.semanticRoleCount, 77);
  assert.equal(manifest.summary.domainProfileCount, 77);
  assert.equal(manifest.summary.templateFamilyCount, 32);
  assert.equal(manifest.summary.knowledgePointCount, 9);
  assert.equal(manifest.summary.contextDomainCount, 77);
  assert.equal(manifest.summary.profileClassCount, 7);
  assert.equal(manifest.summary.uncoveredFamilyCount, 0);
  assert.equal(manifest.summary.uncoveredContextDomainCount, 0);
  assert.equal(manifest.summary.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.summary.unregisteredRoleCount, 0);
  assert.equal(manifest.summary.selectorVisibleCount, 0);
  assert.equal(manifest.summary.productionReadyCount, 0);
  assert.equal(manifest.summary.runtimeProjectionMaterialized, true);
  assert.equal(manifest.summary.runtimeProjectionRouted, false);
  assert.equal(manifest.policy.selectorVisibility, "hidden");
  assert.equal(manifest.policy.generatorRouting, "not_implemented_in_s57e2");
  assert.equal(manifest.policy.productionUse, "forbidden");
});

test("S57E2 authoritative shards and browser rows are drift-identical", () => {
  assert.equal(roleShard.schemaName, "G3BU04SemanticRoleDefinitions");
  assert.equal(domainShard.schemaName, "G3BU04SemanticDomainProfiles");
  assert.equal(scenarioShard.schemaName, "G3BU04SemanticFamilyScenarioProfiles");
  assert.deepEqual(G3B_U04_SEMANTIC_ROLE_ROWS, roleShard.rows);
  assert.deepEqual(G3B_U04_SEMANTIC_DOMAIN_ROWS, domainShard.rows);
  assert.deepEqual(G3B_U04_SEMANTIC_SCENARIO_ROWS, scenarioShard.rows);
  assert.equal(roleShard.rows.length, 77);
  assert.equal(domainShard.rows.length, 77);
  assert.equal(scenarioShard.rows.length, 32);
  assert.equal(new Set(roleShard.rows.map((row) => row[0])).size, 77);
  assert.equal(new Set(domainShard.rows.map((row) => row[1])).size, 77);
  assert.equal(new Set(scenarioShard.rows.map((row) => row[1])).size, 32);
});

test("S57E2 covers every approved family and all 117 family-context variants", () => {
  const sourceByFamily = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));
  const runtimeByFamily = new Map(G3B_U04_SEMANTIC_SCENARIO_PROFILES.map((profile) => [profile.templateFamilyId, profile]));
  assert.equal(sourceByFamily.size, 32);
  assert.equal(runtimeByFamily.size, 32);
  for (const [templateFamilyId, family] of sourceByFamily) {
    const profile = runtimeByFamily.get(templateFamilyId);
    assert.ok(profile, templateFamilyId);
    assert.equal(profile.knowledgePointId, family.knowledgePointId);
    assert.equal(profile.semanticSignature, family.semanticSignature);
    assert.equal(profile.equationShape, family.equationShape);
    assert.equal(profile.unknownRole, family.unknownRole);
    assert.deepEqual(profile.quantityRoleBindings, family.quantityRoles);
    assert.deepEqual(profile.allowedContextDomains, family.contextDomains);
    assert.equal(listG3BU04ScenarioProfilesForFamily(templateFamilyId).length, family.contextDomains.length);
  }
  const sourcePairs = familyContextPairs(source.templateFamilies);
  const resolvedPairs = G3B_U04_SEMANTIC_SCENARIO_PROFILES.flatMap((profile) => (
    profile.allowedContextDomains.map((contextDomain) => {
      const resolved = resolveG3BU04SemanticScenarioProfile(profile.templateFamilyId, contextDomain);
      assert.ok(resolved);
      return `${resolved.templateFamilyId}::${resolved.contextDomain}`;
    })
  )).sort();
  assert.deepEqual(resolvedPairs, sourcePairs);
  assert.equal(new Set(resolvedPairs).size, 117);
});

test("S57E2 registers all source context domains and exposes reverse context resolution", () => {
  const sourceDomains = [...new Set(source.templateFamilies.flatMap((family) => family.contextDomains))].sort();
  assert.equal(sourceDomains.length, 77);
  assert.deepEqual(G3B_U04_SEMANTIC_DOMAIN_PROFILES.map((profile) => profile.contextDomain).sort(), sourceDomains);
  for (const contextDomain of sourceDomains) {
    const domain = getG3BU04SemanticDomainProfile(contextDomain);
    assert.ok(domain);
    assert.equal(typeof domain.sceneLabel, "string");
    assert.equal(typeof domain.objectLabel, "string");
    assert.equal(typeof domain.itemUnit, "string");
    const reverse = listG3BU04ScenarioProfilesForContext(contextDomain);
    assert.ok(reverse.length > 0);
    assert.ok(reverse.every((profile) => profile.contextDomain === contextDomain));
  }
});

test("S57E2 resolves every nonnumeric placeholder and semantic quantity role", () => {
  const familyById = new Map(source.templateFamilies.map((family) => [family.templateFamilyId, family]));
  for (const scenario of G3B_U04_SEMANTIC_SCENARIO_PROFILES) {
    const family = familyById.get(scenario.templateFamilyId);
    assert.ok(family);
    const numericSymbols = new Set(Object.keys(family.quantityRoles));
    const expectedPlaceholders = [...new Set(promptPlaceholders(family.promptSkeletonZh)
      .filter((placeholder) => !numericSymbols.has(placeholder)))].sort();
    assert.deepEqual([...scenario.placeholderSchema].sort(), expectedPlaceholders);
    for (const contextDomain of scenario.allowedContextDomains) {
      const resolved = resolveG3BU04SemanticScenarioProfile(scenario.templateFamilyId, contextDomain);
      assert.ok(resolved);
      assert.deepEqual(Object.keys(resolved.placeholderBindings).sort(), expectedPlaceholders);
      for (const placeholder of expectedPlaceholders) {
        assert.equal(typeof resolved.placeholderBindings[placeholder], "string");
        assert.ok(resolved.placeholderBindings[placeholder].length > 0);
      }
      for (const [symbol, semanticRole] of Object.entries(family.quantityRoles)) {
        const registered = getG3BU04SemanticRoleDefinition(semanticRole);
        assert.ok(registered, semanticRole);
        assert.equal(resolved.quantityBounds[symbol].semanticRole, semanticRole);
        assert.equal(resolved.quantityBounds[symbol].integerOnly, true);
        assert.equal(resolved.quantityBounds[symbol].positiveRequired, true);
        assert.ok(resolved.quantityBounds[symbol].min > 0);
        assert.ok(resolved.quantityBounds[symbol].max <= 10000);
      }
    }
  }
});

test("S57E2 resolved profiles bind units, actions, ownership, and realism instead of acting as a noun bank", () => {
  assert.equal(Object.keys(G3B_U04_SEMANTIC_PROFILE_CLASS_DEFINITIONS).length, 7);
  assert.equal(G3B_U04_SEMANTIC_ROLE_DEFINITIONS.length, 77);
  assert.equal(G3B_U04_SEMANTIC_DOMAIN_PROFILES.length, 77);
  assert.equal(G3B_U04_SEMANTIC_SCENARIO_PROFILES.length, 32);
  for (const scenario of G3B_U04_SEMANTIC_SCENARIO_PROFILES) {
    for (const contextDomain of scenario.allowedContextDomains) {
      const resolved = resolveG3BU04SemanticScenarioProfile(scenario.templateFamilyId, contextDomain);
      assert.ok(resolved.itemUnit || resolved.measureUnit || resolved.capacityUnit || resolved.currencyUnit);
      assert.ok(Array.isArray(resolved.allowedActions) && resolved.allowedActions.length > 0);
      assert.ok(Array.isArray(resolved.forbiddenActions) && resolved.forbiddenActions.length > 0);
      assert.equal(typeof resolved.ownershipModel, "string");
      assert.equal(typeof resolved.unitFlowModel, "string");
      assert.ok(resolved.realismProfile);
      assert.equal(resolved.selectorStatus, "hidden");
      assert.equal(resolved.generatorRouting, "not_implemented_in_s57e2");
      assert.equal(resolved.productionUse, "forbidden");
      assert.equal(resolved.status, "approved_hidden_runtime_candidate");
    }
  }
});

test("S57E2 preserves contract realism bounds", () => {
  assert.deepEqual(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_age, {
    baseChildAge: { min: 6, max: 12 },
    siblingAge: { min: 10, max: 24 },
    parentAge: { min: 25, max: 60 },
    ordering: "baseChildAge<siblingAge<parentAge"
  });
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_money_and_promotion.maximumReceivedItems, 20);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_money_and_promotion.averagePriceMustNotExceedUnitPrice, true);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_packages_and_groups.itemsPerPackageMin, 2);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_packages_and_groups.itemsPerPackageMax, 50);
  assert.deepEqual(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_liquid_containers.allowedUnits, ["毫升", "公升"]);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_liquid_containers.sameSubstanceBeforeCombining, true);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_multiplicative_relationship.multiplierMin, 2);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_multiplicative_relationship.multiplierMax, 9);
  assert.equal(G3B_U04_SEMANTIC_REALISM_PROFILES.realism_g3b_u04_production_common_period.sameTimePeriodRequired, true);
});

test("S57E2 links every scenario family to S57E1 and preserves hidden scope", () => {
  const specFamilies = new Set(patternRegistry.patternSpecs.map((spec) => spec.templateFamilyId));
  assert.equal(specFamilies.size, 32);
  for (const scenario of G3B_U04_SEMANTIC_SCENARIO_PROFILES) assert.equal(specFamilies.has(scenario.templateFamilyId), true);
  assert.equal(G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.policy.selectorVisibility, "hidden");
  assert.equal(G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.policy.generatorRouting, "not_implemented_in_s57e2");
  assert.equal(G3B_U04_SEMANTIC_SCENARIO_ROLE_REGISTRY.policy.productionUse, "forbidden");
  const selectorPath = new URL(
    "../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js",
    import.meta.url
  );
  assert.equal(existsSync(selectorPath), false);
});
