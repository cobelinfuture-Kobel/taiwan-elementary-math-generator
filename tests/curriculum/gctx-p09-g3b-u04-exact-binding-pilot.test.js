import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP09ExactBindingPilot,
  loadGctxP09Contract,
  validateP01CandidateBinding,
} from "../../tools/curriculum/build-gctx-p09-g3b-u04-exact-binding-pilot.mjs";

const contract = loadGctxP09Contract();
const pilot = buildGctxP09ExactBindingPilot();
const sorted = (values) => [...values].sort();

test("GCTX-P09 scope remains one PatternSpec and four fixed legacy domains", () => {
  assert.equal(contract.task, "GCTX-P09_G3BU04ExactSemanticBindingExtractionPilot");
  assert.equal(contract.scope.sourceId, "g3b_u04_3b04");
  assert.equal(contract.scope.pilotPatternSpecId, "ps_g3b_u04_add_divide_joint_purchase_equal_share");
  assert.equal(contract.scope.pilotTemplateFamilyId, "tpl_g3b_u04_add_divide_joint_purchase_equal_share");
  assert.equal(contract.scope.pilotKnowledgePointId, "kp_g3b_u04_add_then_divide");
  assert.equal(contract.scope.expectedBindingCount, 4);
  assert.equal(contract.scope.remainingG3BU04EligiblePatternSpecCount, 31);
  assert.equal(contract.scope.runtimeBehaviorChanged, false);
  assert.equal(contract.scope.approvedRegistryChanged, false);
  assert.equal(contract.scope.productionSelectable, false);
  assert.equal(contract.scope.unitAuthorityDeletedOrRewritten, false);
  assert.equal(contract.scope.rendererChanged, false);
});

test("GCTX-P09 consumes an admitted P08 legacy-normalization candidate", () => {
  assert.ok(pilot.admissionEvidence);
  assert.equal(pilot.admissionEvidence.sourceId, contract.scope.sourceId);
  assert.equal(pilot.admissionEvidence.patternSpecId, contract.scope.pilotPatternSpecId);
  assert.equal(pilot.admissionEvidence.admissionClass, "legacy_authority_normalization");
  assert.equal(pilot.admissionEvidence.bindingReadiness.productionSelectable, false);
  assert.equal(pilot.admissionEvidence.bindingReadiness.runtimeResolvable, false);
});

test("GCTX-P09 extracts exactly four complete fixed-domain candidate bindings", () => {
  assert.deepEqual(pilot.errors, []);
  assert.equal(pilot.status, "accepted_for_p10_remaining_extraction");
  assert.equal(pilot.summary.readyForP10RemainingExtraction, true);
  assert.equal(pilot.summary.patternSpecCount, 1);
  assert.equal(pilot.summary.bindingCount, 4);
  assert.equal(pilot.summary.contextDomainCount, 4);
  assert.equal(pilot.summary.schemaValidBindingCount, 4);
  assert.equal(pilot.summary.legacyParityBindingCount, 4);
  assert.equal(pilot.summary.errorCount, 0);

  const domains = pilot.validations.map((row) => row.contextDomain);
  assert.deepEqual(sorted(domains), sorted(contract.scope.expectedContextDomains));
  assert.equal(new Set(domains).size, 4);
  assert.equal(new Set(pilot.entries.map((row) => row.bindingId)).size, 4);
  assert.equal(new Set(pilot.entries.map((row) => row.semanticVariantId)).size, 4);
  assert.equal(new Set(pilot.entries.flatMap((row) => row.languageVariantIds)).size, 4);
});

test("GCTX-P09 candidate bindings pass the P01 structural and internal-reference validator", () => {
  for (const binding of pilot.entries) {
    const validation = validateP01CandidateBinding(binding);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.deepEqual(validation.errors, []);

    assert.equal(binding.rulesetVersion, "0.1.0");
    assert.equal(binding.sourceId, "g3b_u04_3b04");
    assert.equal(binding.unitCode, "3B-U04");
    assert.equal(binding.knowledgePointId, "kp_g3b_u04_add_then_divide");
    assert.equal(binding.patternSpecId, "ps_g3b_u04_add_divide_joint_purchase_equal_share");
    assert.equal(binding.contextFamilyId, "gctx_cf_g3b_u04_add_divide_joint_purchase_equal_share");
    assert.equal(binding.operationSignature, "(a+b)/c");
    assert.equal(binding.lifecycleStatus, "candidate");
    assert.equal(binding.reviewEvidence.approvalState, "candidate");
    assert.equal(binding.reviewEvidence.approvedAt, null);
    assert.equal(binding.randomnessPolicy.fallbackPolicy, "block");
    assert.equal(binding.validationContract.blocking, true);
    assert.equal(binding.validationContract.canonicalAnswerRecomputationRequired, true);
  }
});

test("GCTX-P09 preserves legacy equation, roles, guards, validator and unit policy", () => {
  const expectedRoles = contract.expectedLegacyParity.quantityRoleBindings;
  const expectedGuards = contract.expectedLegacyParity.requiredConstraints
    .map((constraintId) => `gctx_guard_${constraintId.toLowerCase()}`)
    .sort();

  for (const binding of pilot.entries) {
    const actualRoles = Object.fromEntries(binding.quantityRoles
      .filter((row) => ["a", "b", "c"].includes(row.numericProfileRoleKey))
      .map((row) => [row.numericProfileRoleKey, row.semanticRole]));
    assert.deepEqual(actualRoles, expectedRoles);
    assert.deepEqual(sorted(binding.compatibilityRules.semanticGuardIds), expectedGuards);
    assert.ok(binding.validationContract.semanticValidatorHooks.includes(
      contract.expectedLegacyParity.semanticValidatorRef,
    ));
    assert.equal(binding.questionRole.targetQuantityRoleIds.length, 1);
    assert.deepEqual(binding.questionRole.targetQuantityRoleIds, ["qty_cost_per_person"]);
    assert.equal(binding.questionRole.answerShape, "quantity");
    assert.equal(binding.answerUnitPolicy.mode, "required");
    assert.deepEqual(binding.answerUnitPolicy.allowedUnitIds, ["twd"]);
    assert.equal(binding.answerUnitPolicy.studentAnswerMayOmitUnit, false);
  }
});

test("GCTX-P09 fixes one domain per binding and forbids runtime Cartesian semantic assembly", () => {
  for (const [index, binding] of pilot.entries.entries()) {
    const domain = pilot.validations[index].contextDomain;
    assert.ok(binding.semanticVariantId.endsWith(`_${domain}`));
    assert.ok(binding.languageVariantIds[0].endsWith(`_${domain}`));
    assert.ok(binding.legacyAliases.includes(domain));
    assert.equal(binding.randomnessPolicy.mayCreateNewSemanticBinding, false);
    assert.equal(binding.randomnessPolicy.mayReplaceContextFamily, false);
    assert.equal(binding.randomnessPolicy.mayMutateSemanticSlotBindings, false);
    assert.equal(binding.randomnessPolicy.mayMutateEventFlow, false);
    assert.equal(binding.randomnessPolicy.mayChangeQuestionRole, false);
    assert.deepEqual(sorted(binding.randomnessPolicy.selectableAxes), ["language_variant", "numeric_profile"]);
  }
});

test("GCTX-P09 leaves the formal approved registry empty and all candidate bindings non-selectable", () => {
  assert.equal(pilot.formalApprovedRegistry.entryCount, 0);
  assert.equal(pilot.formalApprovedRegistry.changedByP09, false);
  assert.equal(pilot.summary.approvedRegistryEntryCount, 0);
  assert.equal(pilot.summary.productionSelectableBindingCount, 0);
  for (const binding of pilot.entries) {
    assert.notEqual(binding.lifecycleStatus, "approved");
    assert.notEqual(binding.reviewEvidence.approvalState, "approved");
  }
  assert.deepEqual(pilot.scopeBoundary, {
    runtimeBehaviorChanged: false,
    approvedRegistryChanged: false,
    productionSelectable: false,
    unitAuthorityDeletedOrRewritten: false,
    rendererChanged: false,
  });
});

test("GCTX-P09 exposes the remaining G3B-U04 extraction as the sole next step", () => {
  assert.equal(
    pilot.nextShortestStep,
    "GCTX-P10_G3BU04RemainingExactSemanticBindingExtraction",
  );
});

test("GCTX-P09 readback", () => {
  console.log(`GCTX_P09_EXACT_BINDING_PILOT_SUMMARY=${JSON.stringify({
    summary: pilot.summary,
    domains: pilot.validations.map((row) => row.contextDomain),
    bindingIds: pilot.entries.map((row) => row.bindingId),
  })}`);
  assert.equal(pilot.summary.errorCount, 0);
});
