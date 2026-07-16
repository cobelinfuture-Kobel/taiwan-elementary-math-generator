import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");
const schema = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/context/schemas/GCTX_GlobalContextRegistry.schema.json",
), "utf8"));
const contract = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_S02_GlobalContextSchemaAndRegistryContract.json",
), "utf8"));
const s00 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_S00_GlobalContextScopeContract.json",
), "utf8"));

const expectedEntryDefinitions = Object.freeze([
  "contextDomainEntry",
  "sdgGoalEntry",
  "sourceAuthorityEntry",
  "commonKnowledgeEntry",
  "contextFamilyEntry",
  "unitContextBindingEntry",
  "contextLifecycleEntry",
]);

const expectedRegistryKinds = Object.freeze([
  "context_domain_registry",
  "sdg_goal_registry",
  "source_authority_registry",
  "common_knowledge_registry",
  "context_family_registry",
  "unit_context_binding_registry",
  "context_lifecycle_registry",
]);

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("GCTX-S02 publishes the seven canonical entry definitions and registry kinds", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  for (const definition of expectedEntryDefinitions) {
    assert.ok(schema.$defs[definition], `missing schema definition ${definition}`);
  }

  assert.equal(contract.scope.registryKindCount, 7);
  assert.equal(contract.registryManifest.length, 7);
  assert.deepEqual(
    contract.registryManifest.map((row) => row.registryKind),
    expectedRegistryKinds,
  );
  assert.deepEqual(
    schema.$defs.registryEnvelope.properties.registryKind.enum,
    expectedRegistryKinds,
  );

  const targetPaths = contract.registryManifest.map((row) => row.targetPath);
  const entryDefinitions = contract.registryManifest.map((row) => row.entryDefinition);
  assert.equal(new Set(targetPaths).size, targetPaths.length);
  assert.equal(new Set(entryDefinitions).size, entryDefinitions.length);
  assert.deepEqual(sorted(entryDefinitions), sorted(expectedEntryDefinitions));
});

test("GCTX-S02 preserves the S00 context-domain and era contracts", () => {
  assert.deepEqual(schema.$defs.contextDomainValue.enum, s00.contextDomains);
  assert.deepEqual(contract.domainAndEraContract.contextDomains, s00.contextDomains);
  assert.deepEqual(contract.domainAndEraContract.publicEraModes, s00.eraModes);
  assert.deepEqual(schema.$defs.eraTag.enum, ["modern", "ancient"]);
  assert.equal(contract.domainAndEraContract.mixedErasIsWorksheetAllocationMode, true);
  assert.equal(contract.domainAndEraContract.sameQuestionArbitraryEraMixingAllowed, false);
  assert.equal(contract.domainAndEraContract.ancientStudentFacingSDGClaimAllowed, false);
});

test("GCTX-S02 keeps all unit-math fields out of global shared asset definitions", () => {
  const globalDefinitions = contract.ownershipBoundary.globalAssetDefinitions;
  const forbiddenFields = contract.ownershipBoundary.forbiddenFieldsInGlobalAssets;

  for (const definitionName of globalDefinitions) {
    const definition = schema.$defs[definitionName];
    assert.ok(definition, `missing global definition ${definitionName}`);
    assert.equal(definition.additionalProperties, false);
    for (const field of forbiddenFields) {
      assert.equal(
        Object.hasOwn(definition.properties, field),
        false,
        `${definitionName} illegally owns unit-math field ${field}`,
      );
    }
  }

  const contextFamily = schema.$defs.contextFamilyEntry;
  assert.equal(contextFamily.properties.sharedContentOnly.const, true);
  assert.equal(contract.ownershipBoundary.sharedContentMayRenderCompleteMathPrompt, false);
  assert.equal(contract.ownershipBoundary.unitBindingMayChangePatternSpecMath, false);
});

test("GCTX-S02 requires all unit mathematical binding fields only in UnitContextBinding", () => {
  const binding = schema.$defs.unitContextBindingEntry;
  const requiredFields = contract.ownershipBoundary.requiredUnitBindingFields;

  assert.equal(binding.additionalProperties, false);
  for (const field of requiredFields) {
    assert.ok(binding.required.includes(field), `binding does not require ${field}`);
    assert.ok(binding.properties[field], `binding schema does not define ${field}`);
  }
  assert.equal(binding.properties.contextFamilyIds.minItems, 1);
  assert.equal(binding.properties.roleBindings.minProperties, 1);
  assert.equal(binding.properties.unitFlow.minItems, 1);
  assert.equal(binding.properties.plausibleRanges.minProperties, 1);
  assert.equal(binding.properties.validatorHooks.minItems, 1);
});

test("GCTX-S02 encodes lightweight web-verification shape without seed content", () => {
  const knowledge = schema.$defs.commonKnowledgeEntry;
  const specificRule = knowledge.allOf[0].then.properties.verificationRefs;
  const exactRule = knowledge.allOf[1].then;

  assert.equal(knowledge.properties.verificationRefs.minItems, 1);
  assert.equal(specificRule.minItems, 2);
  assert.ok(exactRule.required.includes("exactClaim"));
  assert.equal(
    exactRule.properties.exerciseNumbersPolicy.const,
    "source_bound_exact_values_only",
  );
  assert.equal(
    knowledge.properties.exactClaim.properties.valueMutationAllowed.const,
    false,
  );
  assert.equal(contract.verificationShapeContract.exerciseNumbersDefault, "fictionalized_for_practice");
  assert.equal(contract.scope.seedContentMaterialized, false);
  assert.equal(contract.scope.existingAuthorityMigrated, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
});

test("GCTX-S02 closes lifecycle, compatibility and next-task boundaries", () => {
  assert.deepEqual(
    schema.$defs.lifecycleStatus.enum,
    contract.lifecycleContract.statuses,
  );
  assert.equal(contract.lifecycleContract.productionUseRequiresStatus, "approved");
  assert.equal(contract.lifecycleContract.expiredOrBlockedProductionUseAllowed, false);
  assert.equal(contract.lifecycleContract.legacyAliasesRequiredForMigratedIds, true);
  assert.equal(contract.lifecycleContract.legacyAliasMayResolveToMultipleCanonicalIds, false);
  assert.equal(contract.compatibilityContract.existingIdsPreservedAsCanonicalOrLegacyAlias, true);
  assert.equal(contract.compatibilityContract.deterministicSeedReplayMustRemainStable, true);
  assert.equal(contract.compatibilityContract.existingBlockingValidatorsRemainBlocking, true);
  assert.equal(contract.compatibilityContract.freeFormAIAllowed, false);
  assert.equal(contract.compatibilityContract.genericFallbackAllowed, false);
  assert.equal(contract.compatibilityContract.runtimeWebSearchAllowed, false);
  assert.equal(contract.nextTask, "GCTX-S03_WebVerificationAndCommonKnowledgeAdmissionGovernance");
});
