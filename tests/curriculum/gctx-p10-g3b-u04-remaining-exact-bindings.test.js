import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP10RemainingExactBindings,
  loadGctxP10Contract,
} from "../../tools/curriculum/build-gctx-p10-g3b-u04-remaining-exact-bindings.mjs";
import { validateP01CandidateBinding } from "../../tools/curriculum/build-gctx-p09-g3b-u04-exact-binding-pilot.mjs";

const contract = loadGctxP10Contract();
const registry = buildGctxP10RemainingExactBindings();
const sorted = (values) => [...values].sort();

test("GCTX-P10 scope completes G3B-U04 candidate extraction without enabling runtime", () => {
  assert.equal(contract.task, "GCTX-P10_G3BU04RemainingExactSemanticBindingExtraction");
  assert.equal(contract.scope.sourceId, "g3b_u04_3b04");
  assert.equal(contract.scope.remainingPatternSpecCount, 31);
  assert.equal(contract.scope.remainingBindingCount, 113);
  assert.equal(contract.scope.combinedPatternSpecCount, 32);
  assert.equal(contract.scope.combinedBindingCount, 117);
  assert.equal(contract.scope.runtimeBehaviorChanged, false);
  assert.equal(contract.scope.formalApprovedRegistryChanged, false);
  assert.equal(contract.scope.productionSelectable, false);
  assert.equal(contract.scope.unitAuthorityDeletedOrRewritten, false);
  assert.equal(contract.scope.rendererChanged, false);
  assert.deepEqual(registry.scopeBoundary, {
    runtimeBehaviorChanged: false,
    formalApprovedRegistryChanged: false,
    productionSelectable: false,
    unitAuthorityDeletedOrRewritten: false,
    rendererChanged: false,
  });
});

test("GCTX-P10 produces the complete 32-PatternSpec 117-binding candidate registry", () => {
  assert.deepEqual(registry.errors, []);
  assert.equal(registry.status, "accepted_for_p11_reference_admission");
  assert.equal(registry.summary.readyForP11ReferenceAdmission, true);
  assert.equal(registry.summary.patternSpecCount, 32);
  assert.equal(registry.summary.bindingCount, 117);
  assert.equal(registry.summary.pilotBindingCount, 4);
  assert.equal(registry.summary.newBindingCount, 113);
  assert.equal(registry.summary.knowledgePointCount, 9);
  assert.equal(registry.summary.contextDomainCount, 77);
  assert.equal(registry.summary.schemaValidBindingCount, 117);
  assert.equal(registry.summary.legacyParityBindingCount, 117);
  assert.equal(registry.summary.errorCount, 0);
  assert.equal(Object.keys(registry.byPatternSpec).length, 32);
});

test("GCTX-P10 assigns one fixed binding to every legacy PatternSpec-domain pair", () => {
  const bindingIds = registry.entries.map((row) => row.bindingId);
  const semanticVariantIds = registry.entries.map((row) => row.semanticVariantId);
  const languageVariantIds = registry.entries.flatMap((row) => row.languageVariantIds);
  assert.equal(new Set(bindingIds).size, 117);
  assert.equal(new Set(semanticVariantIds).size, 117);
  assert.equal(new Set(languageVariantIds).size, 117);

  for (const [patternSpecId, summary] of Object.entries(registry.byPatternSpec)) {
    const entries = registry.entries.filter((row) => row.patternSpecId === patternSpecId);
    const validations = registry.validations.filter((row) => row.patternSpecId === patternSpecId);
    assert.equal(entries.length, summary.bindingCount);
    assert.equal(validations.length, summary.bindingCount);
    assert.equal(new Set(validations.map((row) => row.contextDomain)).size, summary.bindingCount);
    assert.deepEqual(sorted(validations.map((row) => row.contextDomain)), sorted(summary.contextDomains));
    assert.ok(entries.every((row) => row.operationSignature === summary.operationSignature));
    assert.ok(entries.every((row) => row.knowledgePointId === summary.knowledgePointId));
  }
});

test("GCTX-P10 all 117 bindings pass P01 structural and internal-reference validation", () => {
  for (const binding of registry.entries) {
    const validation = validateP01CandidateBinding(binding);
    assert.equal(validation.ok, true, `${binding.bindingId}: ${JSON.stringify(validation.errors)}`);
    assert.deepEqual(validation.errors, []);
    assert.equal(binding.rulesetVersion, "0.1.0");
    assert.equal(binding.sourceId, "g3b_u04_3b04");
    assert.equal(binding.unitCode, "3B-U04");
    assert.equal(binding.lifecycleStatus, "candidate");
    assert.equal(binding.reviewEvidence.approvalState, "candidate");
    assert.equal(binding.reviewEvidence.approvedAt, null);
    assert.equal(binding.randomnessPolicy.fallbackPolicy, "block");
    assert.equal(binding.validationContract.blocking, true);
    assert.equal(binding.validationContract.canonicalAnswerRecomputationRequired, true);
  }
});

test("GCTX-P10 preserves each PatternSpec's exact operation, roles, constraints and target", () => {
  for (const validation of registry.validations) {
    assert.equal(validation.p01SchemaValid, true, validation.bindingId);
    assert.equal(validation.legacyParityValid, true, validation.bindingId);
    assert.deepEqual(validation.errors, []);
  }

  for (const binding of registry.entries) {
    const summary = registry.byPatternSpec[binding.patternSpecId];
    assert.equal(binding.operationSignature, summary.operationSignature);
    const target = binding.quantityRoles.find((row) => row.isQuestionTarget === true);
    assert.ok(target);
    assert.equal(target.semanticRole, summary.unknownRole);
    assert.deepEqual(binding.questionRole.targetQuantityRoleIds, [target.quantityRoleId]);
    assert.ok(binding.compatibilityRules.semanticGuardIds.length > 0);
    assert.ok(binding.validationContract.semanticValidatorHooks.length > 1);
    assert.ok(binding.legacyAliases.includes(summary.templateFamilyId));
  }
});

test("GCTX-P10 retains the four P09 pilot bindings inside the complete registry", () => {
  const pilotPatternSpecId = "ps_g3b_u04_add_divide_joint_purchase_equal_share";
  const pilotEntries = registry.entries.filter((row) => row.patternSpecId === pilotPatternSpecId);
  assert.equal(pilotEntries.length, 4);
  assert.deepEqual(
    sorted(registry.validations
      .filter((row) => row.patternSpecId === pilotPatternSpecId)
      .map((row) => row.contextDomain)),
    ["equipment_rental", "food", "school_supplies", "tickets"],
  );
  assert.ok(pilotEntries.every((row) => row.eventFlow.length === 4));
  assert.ok(registry.entries
    .filter((row) => row.patternSpecId !== pilotPatternSpecId)
    .every((row) => row.eventFlow.length === 3));
});

test("GCTX-P10 forbids semantic assembly and false production approval", () => {
  assert.equal(registry.formalApprovedRegistry.entryCount, 0);
  assert.equal(registry.formalApprovedRegistry.changedByP10, false);
  assert.equal(registry.summary.approvedRegistryEntryCount, 0);
  assert.equal(registry.summary.productionSelectableBindingCount, 0);

  for (const binding of registry.entries) {
    assert.equal(binding.randomnessPolicy.mayCreateNewSemanticBinding, false);
    assert.equal(binding.randomnessPolicy.mayReplaceContextFamily, false);
    assert.equal(binding.randomnessPolicy.mayMutateSemanticSlotBindings, false);
    assert.equal(binding.randomnessPolicy.mayMutateEventFlow, false);
    assert.equal(binding.randomnessPolicy.mayChangeQuestionRole, false);
    assert.notEqual(binding.lifecycleStatus, "approved");
    assert.notEqual(binding.reviewEvidence.approvalState, "approved");
  }
});

test("GCTX-P10 exposes cross-registry admission and review as the sole next step", () => {
  assert.equal(
    registry.nextShortestStep,
    "GCTX-P11_G3BU04CandidateReferenceRegistryAdmissionAndReviewGate",
  );
});

test("GCTX-P10 readback", () => {
  console.log(`GCTX_P10_FULL_BINDING_SUMMARY=${JSON.stringify({
    summary: registry.summary,
    patternSpecCount: Object.keys(registry.byPatternSpec).length,
    largestFamilies: Object.entries(registry.byPatternSpec)
      .sort((left, right) => right[1].bindingCount - left[1].bindingCount)
      .slice(0, 5),
  })}`);
  assert.equal(registry.summary.errorCount, 0);
});
