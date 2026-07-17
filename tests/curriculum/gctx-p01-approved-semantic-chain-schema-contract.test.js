import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");
const schema = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/context/schemas/GCTX_ApprovedSemanticChain.schema.json",
), "utf8"));
const contract = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P01_ApprovedSemanticChainSchemaContract.json",
), "utf8"));
const p00 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P00_GlobalOwnershipScopeAndRuleVersioningContract.json",
), "utf8"));

const expectedRequiredFields = Object.freeze([
  "bindingId",
  "rulesetVersion",
  "sourceId",
  "unitCode",
  "knowledgePointId",
  "patternSpecId",
  "contextFamilyId",
  "semanticVariantId",
  "commonKnowledgeIds",
  "semanticSlotBindings",
  "operationSignature",
  "eventFlow",
  "quantityRoles",
  "unitFlow",
  "questionRole",
  "languageVariantIds",
  "numericProfileIds",
  "compatibilityRules",
  "reviewEvidence",
  "randomnessPolicy",
  "validationContract",
  "answerUnitPolicy",
  "lifecycleStatus",
]);

const p02OnlyFields = Object.freeze([
  "scenarioChainId",
  "projectGoal",
  "requiredMilestones",
  "dependencyGraph",
  "quantityLedgerAcrossQuestions",
  "decisionCriteria",
  "terminalDeliverable",
  "approvedQuestionCountProfiles",
  "completeProjection",
  "approvedTwoPageProjection",
]);

test("GCTX-P01 is schema-only and follows the merged P00 ruleset", () => {
  assert.equal(contract.task, "GCTX-P01_ApprovedSemanticChainSchema");
  assert.equal(contract.rulesetVersion, p00.rulesetVersioning.currentPlannedVersion);
  assert.equal(schema.$defs.registryEnvelope.properties.rulesetVersion.const, "0.1.0");
  assert.equal(contract.scope.schemaOnly, true);
  assert.equal(contract.scope.seedContentMaterialized, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
  assert.equal(contract.scope.scenarioChainImplemented, false);
  assert.equal(contract.scope.boundedPblImplemented, false);
});

test("GCTX-P01 requires one exact context family and forbids plural family selection", () => {
  const binding = schema.$defs.approvedSemanticBindingEntry;
  assert.equal(binding.additionalProperties, false);
  assert.ok(binding.required.includes("contextFamilyId"));
  assert.ok(binding.properties.contextFamilyId);
  assert.equal(Object.hasOwn(binding.properties, "contextFamilyIds"), false);
  assert.equal(contract.exactIdentityContract.singleContextFamilyIdRequired, true);
  assert.equal(contract.exactIdentityContract.pluralContextFamilyIdsForbidden, true);
  assert.equal(contract.exactIdentityContract.semanticVariantIdRequired, true);
  assert.equal(contract.exactIdentityContract.explicitSemanticSlotBindingsRequired, true);
});

test("GCTX-P01 requires the complete exact semantic binding field set", () => {
  const binding = schema.$defs.approvedSemanticBindingEntry;
  assert.deepEqual(binding.required, expectedRequiredFields);
  assert.deepEqual(contract.requiredBindingFields, expectedRequiredFields);

  for (const field of expectedRequiredFields) {
    assert.ok(binding.properties[field], `schema missing required property ${field}`);
  }

  assert.equal(binding.properties.semanticSlotBindings.minItems, 1);
  assert.equal(binding.properties.eventFlow.minItems, 1);
  assert.equal(binding.properties.quantityRoles.minItems, 1);
  assert.equal(binding.properties.languageVariantIds.minItems, 1);
  assert.equal(binding.properties.numericProfileIds.minItems, 1);
});

test("GCTX-P01 encodes explicit slot, event, quantity, unit and question roles", () => {
  const slot = schema.$defs.semanticSlotBinding;
  const event = schema.$defs.eventStep;
  const quantity = schema.$defs.quantityRole;
  const unitFlow = schema.$defs.unitFlowEdge;
  const question = schema.$defs.questionRole;

  assert.deepEqual(slot.required, ["slotId", "slotKind", "assetId", "semanticRole"]);
  assert.ok(slot.properties.slotKind.enum.includes("actor"));
  assert.ok(slot.properties.slotKind.enum.includes("object"));
  assert.ok(event.required.includes("stateTransition"));
  assert.equal(event.properties.mustPreserveOrder.const, true);
  assert.ok(quantity.required.includes("numericProfileRoleKey"));
  assert.ok(quantity.properties.roleKind.enum.includes("derived_intermediate"));
  assert.ok(unitFlow.properties.relationType.enum.includes("conversion"));
  assert.equal(question.properties.terminalForBinding.const, true);
  assert.equal(question.properties.targetQuantityRoleIds.minItems, 1);
  assert.equal(question.properties.mustUseEventStepIds.minItems, 1);
});

test("GCTX-P01 closes runtime randomness to approved language and numeric profiles", () => {
  const randomness = schema.$defs.randomnessPolicy;
  assert.equal(randomness.properties.mode.const, "select_approved_components_only");
  assert.deepEqual(
    randomness.properties.selectableAxes.items.enum,
    ["language_variant", "numeric_profile"],
  );
  assert.equal(randomness.properties.mayCreateNewSemanticBinding.const, false);
  assert.equal(randomness.properties.mayReplaceContextFamily.const, false);
  assert.equal(randomness.properties.mayMutateSemanticSlotBindings.const, false);
  assert.equal(randomness.properties.mayMutateEventFlow.const, false);
  assert.equal(randomness.properties.mayChangeQuestionRole.const, false);
  assert.equal(randomness.properties.fallbackPolicy.const, "block");

  assert.deepEqual(contract.randomnessBoundary.allowedAxes, ["language_variant", "numeric_profile"]);
  assert.equal(contract.randomnessBoundary.mayCreateNewSemanticBinding, false);
  assert.equal(contract.randomnessBoundary.mayReplaceContextFamily, false);
  assert.equal(contract.randomnessBoundary.fallbackPolicy, "block");
  assert.ok(contract.forbiddenRuntimeBehavior.includes("cartesian_context_slot_composition"));
  assert.ok(contract.forbiddenRuntimeBehavior.includes("generic_fallback"));
  assert.ok(contract.forbiddenRuntimeBehavior.includes("runtime_web_search"));
});

test("GCTX-P01 requires blocking semantic and mathematical validation", () => {
  const validation = schema.$defs.validationContract;
  assert.equal(validation.properties.canonicalAnswerRecomputationRequired.const, true);
  assert.equal(validation.properties.blocking.const, true);
  assert.equal(validation.properties.mustValidateSlotBindings.const, true);
  assert.equal(validation.properties.mustValidateEventFlow.const, true);
  assert.equal(validation.properties.mustValidateQuantityRoles.const, true);
  assert.equal(validation.properties.mustValidateUnitFlow.const, true);
  assert.equal(validation.properties.mustValidateQuestionRole.const, true);
  assert.equal(validation.properties.semanticValidatorHooks.minItems, 1);
  assert.equal(validation.properties.mathValidatorHooks.minItems, 1);
  assert.equal(contract.validationBoundary.canonicalAnswerRecomputationRequired, true);
  assert.equal(contract.validationBoundary.validationBlocking, true);
});

test("GCTX-P01 reserves multi-question and bounded-PBL closure fields for P02", () => {
  const binding = schema.$defs.approvedSemanticBindingEntry;
  assert.deepEqual(contract.deferredToP02, p02OnlyFields);
  assert.equal(contract.scope.scenarioChainImplemented, false);
  assert.equal(contract.scope.boundedPblImplemented, false);

  for (const field of p02OnlyFields) {
    assert.equal(
      Object.hasOwn(binding.properties, field),
      false,
      `P01 illegally owns P02 field ${field}`,
    );
  }

  assert.equal(
    contract.nextTask,
    "GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract",
  );
});

test("GCTX-P01 preserves global, PatternSpec and validator ownership", () => {
  assert.equal(contract.ownershipBoundary.owner, "unit_and_patternspec_binding");
  assert.equal(contract.ownershipBoundary.globalContextMayOwnCompleteMathPrompt, false);
  assert.equal(contract.ownershipBoundary.globalContextMayOwnOperationSignature, false);
  assert.equal(contract.ownershipBoundary.globalContextMayOwnQuantityDependency, false);
  assert.equal(contract.ownershipBoundary.globalContextMayOwnAnswerModel, false);
  assert.equal(contract.ownershipBoundary.bindingMayChangePatternSpecMath, false);
  assert.equal(contract.compatibilityContract.existingKnowledgePointAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingMathValidatorAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.historicalPr243SchemaIsProductionAuthority, false);
});
