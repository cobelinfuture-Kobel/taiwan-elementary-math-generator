import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { validateP01CandidateBinding } from "./build-gctx-p09-g3b-u04-exact-binding-pilot.mjs";
import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT,
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  buildG3BU04GlobalContextExpansionPreview,
  validateG3BU04GlobalContextExpansionQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-expansion-pilot.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P12_G3BU04GlobalContextExpansionPilotAndRenderedDifferenceGate.json"
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function buildSlots(variant) {
  return [
    {
      slotId: "actor_payer_group",
      slotKind: "actor",
      assetId: variant.actorAssetId,
      semanticRole: "shared_payer_group",
      required: true
    },
    {
      slotId: "place_purchase_scene",
      slotKind: "place",
      assetId: variant.placeAssetId,
      semanticRole: "joint_purchase_place",
      required: true
    },
    {
      slotId: "object_purchase_item_1",
      slotKind: "object",
      assetId: `gctx_object_${variant.contextDomainId}_first_cost`,
      semanticRole: "first_purchased_item",
      required: true
    },
    {
      slotId: "object_purchase_item_2",
      slotKind: "object",
      assetId: `gctx_object_${variant.contextDomainId}_second_cost`,
      semanticRole: "second_purchased_item",
      required: true
    },
    {
      slotId: "activity_joint_purchase",
      slotKind: "activity",
      assetId: variant.activityAssetId,
      semanticRole: "joint_purchase_equal_share",
      required: true
    },
    {
      slotId: "unit_currency_twd",
      slotKind: "unit",
      assetId: "twd",
      semanticRole: "currency_unit",
      required: true
    }
  ];
}

function buildQuantities() {
  return [
    {
      quantityRoleId: "qty_first_shared_cost",
      roleKind: "given",
      semanticRole: "first_shared_cost",
      entitySlotId: "object_purchase_item_1",
      valueOrigin: "numeric_profile",
      unitDimension: "currency",
      allowedUnitIds: ["twd"],
      numericProfileRoleKey: "a",
      isQuestionTarget: false
    },
    {
      quantityRoleId: "qty_second_shared_cost",
      roleKind: "given",
      semanticRole: "second_shared_cost",
      entitySlotId: "object_purchase_item_2",
      valueOrigin: "numeric_profile",
      unitDimension: "currency",
      allowedUnitIds: ["twd"],
      numericProfileRoleKey: "b",
      isQuestionTarget: false
    },
    {
      quantityRoleId: "qty_payer_count",
      roleKind: "given",
      semanticRole: "payer_count",
      entitySlotId: "actor_payer_group",
      valueOrigin: "numeric_profile",
      unitDimension: "count",
      allowedUnitIds: ["person"],
      numericProfileRoleKey: "c",
      isQuestionTarget: false
    },
    {
      quantityRoleId: "qty_combined_shared_cost",
      roleKind: "derived_intermediate",
      semanticRole: "combined_shared_cost",
      entitySlotId: "activity_joint_purchase",
      valueOrigin: "formula",
      unitDimension: "currency",
      allowedUnitIds: ["twd"],
      numericProfileRoleKey: "combined_cost",
      isQuestionTarget: false
    },
    {
      quantityRoleId: "qty_cost_per_person",
      roleKind: "answer_target",
      semanticRole: "cost_per_person",
      entitySlotId: "actor_payer_group",
      valueOrigin: "canonical_answer",
      unitDimension: "currency",
      allowedUnitIds: ["twd"],
      numericProfileRoleKey: "answer",
      isQuestionTarget: true
    }
  ];
}

function buildEventFlow() {
  return [
    {
      eventStepId: "evt_introduce_joint_purchase_inputs",
      order: 1,
      eventType: "quantity_introduction",
      actorSlotId: "actor_payer_group",
      placeSlotId: "place_purchase_scene",
      objectSlotIds: ["object_purchase_item_1", "object_purchase_item_2"],
      actionId: "introduce_joint_purchase_costs_and_payers",
      inputQuantityRoleIds: [],
      outputQuantityRoleIds: ["qty_first_shared_cost", "qty_second_shared_cost", "qty_payer_count"],
      stateTransition: "two_activity_costs_and_payer_count_are_known",
      mustPreserveOrder: true
    },
    {
      eventStepId: "evt_combine_shared_costs",
      order: 2,
      eventType: "quantity_change",
      actorSlotId: "actor_payer_group",
      placeSlotId: "place_purchase_scene",
      objectSlotIds: ["object_purchase_item_1", "object_purchase_item_2"],
      actionId: "add_first_and_second_shared_cost",
      inputQuantityRoleIds: ["qty_first_shared_cost", "qty_second_shared_cost"],
      outputQuantityRoleIds: ["qty_combined_shared_cost"],
      stateTransition: "combined_shared_cost_is_derived",
      mustPreserveOrder: true
    },
    {
      eventStepId: "evt_share_combined_cost_equally",
      order: 3,
      eventType: "quantity_grouping",
      actorSlotId: "actor_payer_group",
      placeSlotId: "place_purchase_scene",
      objectSlotIds: ["object_purchase_item_1", "object_purchase_item_2"],
      actionId: "divide_combined_cost_by_payer_count",
      inputQuantityRoleIds: ["qty_combined_shared_cost", "qty_payer_count"],
      outputQuantityRoleIds: ["qty_cost_per_person"],
      stateTransition: "equal_cost_per_person_is_derived",
      mustPreserveOrder: true
    },
    {
      eventStepId: "evt_ask_cost_per_person",
      order: 4,
      eventType: "question_terminal",
      actorSlotId: "actor_payer_group",
      placeSlotId: "place_purchase_scene",
      objectSlotIds: ["object_purchase_item_1", "object_purchase_item_2"],
      actionId: "ask_equal_cost_per_person",
      inputQuantityRoleIds: ["qty_cost_per_person"],
      outputQuantityRoleIds: [],
      stateTransition: "cost_per_person_is_the_terminal_question_target",
      mustPreserveOrder: true
    }
  ];
}

function buildUnitFlow() {
  return [
    {
      fromQuantityRoleId: "qty_first_shared_cost",
      toQuantityRoleId: "qty_combined_shared_cost",
      relationType: "same_unit",
      conversionRuleId: null,
      mustBeExact: true
    },
    {
      fromQuantityRoleId: "qty_second_shared_cost",
      toQuantityRoleId: "qty_combined_shared_cost",
      relationType: "same_unit",
      conversionRuleId: null,
      mustBeExact: true
    },
    {
      fromQuantityRoleId: "qty_combined_shared_cost",
      toQuantityRoleId: "qty_cost_per_person",
      relationType: "rate_composition",
      conversionRuleId: null,
      mustBeExact: true
    },
    {
      fromQuantityRoleId: "qty_payer_count",
      toQuantityRoleId: "qty_cost_per_person",
      relationType: "rate_composition",
      conversionRuleId: null,
      mustBeExact: true
    }
  ];
}

function buildBinding(variant, contract) {
  const slots = buildSlots(variant);
  return {
    bindingId: `gctx_bind_g3b_u04_joint_purchase_${variant.contextDomainId}`,
    rulesetVersion: contract.rulesetVersion,
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    knowledgePointId: contract.scope.knowledgePointId,
    patternSpecId: contract.scope.patternSpecId,
    contextFamilyId: contract.scope.contextFamilyId,
    semanticVariantId: variant.variantId,
    commonKnowledgeIds: [
      "gctx_ck_equal_sharing",
      "gctx_ck_shared_payment",
      "gctx_ck_currency_twd"
    ],
    semanticSlotBindings: slots,
    operationSignature: contract.scope.operationSignature,
    eventFlow: buildEventFlow(),
    quantityRoles: buildQuantities(),
    unitFlow: buildUnitFlow(),
    questionRole: {
      questionRoleId: "qrole_cost_per_person",
      intent: "calculate",
      targetQuantityRoleIds: ["qty_cost_per_person"],
      answerShape: "quantity",
      mustUseEventStepIds: [
        "evt_combine_shared_costs",
        "evt_share_combined_cost_equally",
        "evt_ask_cost_per_person"
      ],
      terminalForBinding: true
    },
    languageVariantIds: [variant.languageVariantId],
    numericProfileIds: ["gctx_num_g3b_u04_joint_purchase_equal_share_positive_integer"],
    compatibilityRules: {
      requiredSlotIds: slots.map((slot) => slot.slotId),
      forbiddenCombinationIds: [],
      allowedEraTags: ["modern"],
      allowedGradeBands: ["G3"],
      requiredCommonKnowledgeIds: [
        "gctx_ck_equal_sharing",
        "gctx_ck_shared_payment",
        "gctx_ck_currency_twd"
      ],
      forbiddenCommonKnowledgeIds: [],
      semanticGuardIds: [
        "gctx_guard_sum_divisible_by_c",
        "gctx_guard_c_at_least_2",
        "gctx_guard_cost_unit_flow",
        "gctx_guard_shared_ownership_clear"
      ]
    },
    reviewEvidence: {
      approvalState: "candidate",
      rulesetVersion: contract.rulesetVersion,
      semanticReviewIds: [],
      mathematicalReviewIds: [],
      sourceEvidenceIds: [
        contract.inputs.p01Schema,
        contract.inputs.patternAuthority,
        contract.inputs.legacyScenarioAuthority,
        contract.inputs.pilotRuntimeModule,
        variant.variantId
      ],
      semanticCompletenessConfirmed: true,
      mathematicalMeaningPreserved: true,
      approvedAt: null
    },
    randomnessPolicy: {
      mode: "select_approved_components_only",
      selectableAxes: ["language_variant", "numeric_profile"],
      mayCreateNewSemanticBinding: false,
      mayReplaceContextFamily: false,
      mayMutateSemanticSlotBindings: false,
      mayMutateEventFlow: false,
      mayChangeQuestionRole: false,
      fallbackPolicy: "block"
    },
    validationContract: {
      semanticValidatorHooks: [
        "S57_G3B_U04_SemanticValidationContract",
        "gctx_guard_sum_divisible_by_c",
        "gctx_guard_c_at_least_2",
        "gctx_guard_cost_unit_flow",
        "gctx_guard_shared_ownership_clear",
        "gctx_p12_visible_context_difference_gate"
      ],
      mathValidatorHooks: [
        "gctx_math_recompute_add_then_divide",
        "gctx_math_require_sum_divisible_by_payer_count"
      ],
      canonicalAnswerRecomputationRequired: true,
      blocking: true,
      mustValidateSlotBindings: true,
      mustValidateEventFlow: true,
      mustValidateQuantityRoles: true,
      mustValidateUnitFlow: true,
      mustValidateQuestionRole: true
    },
    answerUnitPolicy: {
      mode: "required",
      allowedUnitIds: ["twd"],
      studentAnswerMayOmitUnit: false
    },
    lifecycleStatus: "candidate",
    legacyAliases: []
  };
}

function buildReviewPacket(binding, question, validation) {
  return {
    reviewPacketId: `gctx_review_${binding.semanticVariantId.replace(/^gctx_semvar_/, "")}`,
    bindingId: binding.bindingId,
    patternSpecId: binding.patternSpecId,
    knowledgePointId: binding.knowledgePointId,
    contextFamilyId: binding.contextFamilyId,
    semanticVariantId: binding.semanticVariantId,
    languageVariantId: binding.languageVariantIds[0],
    renderedPromptText: question.promptText,
    equationModel: question.equationModel,
    quantities: clone(question.quantities),
    finalAnswer: question.finalAnswer,
    answerText: question.answerText,
    mathematicalWitness: {
      recomputation: `(${question.quantities.a}+${question.quantities.b})/${question.quantities.c}`,
      expected: (question.quantities.a + question.quantities.b) / question.quantities.c,
      actual: question.finalAnswer,
      valid: validation.ok
    },
    changedAxes: [
      "event_purpose",
      "place_or_activity_scope",
      "actor_group_relationship",
      "two_cost_objects",
      "language_variant"
    ],
    preservedAxes: [
      "patternSpecId",
      "knowledgePointId",
      "operationSignature",
      "quantity_role_mapping",
      "event_flow",
      "question_target",
      "answer_unit_policy"
    ],
    contentOrigin: "project_designed_fictionalized_exercise",
    semanticReview: {
      status: "pending_human_review",
      reviewerId: null,
      evidenceId: null,
      decision: null
    },
    mathematicalReview: {
      status: "pending_human_review",
      reviewerId: null,
      evidenceId: null,
      decision: null
    },
    productionSelectable: false,
    runtimeResolvable: false
  };
}

export function loadGctxP12Contract() {
  return readJson(CONTRACT_PATH);
}

export function buildGctxP12GlobalContextExpansionPilot() {
  const contract = loadGctxP12Contract();
  const preview = buildG3BU04GlobalContextExpansionPreview();
  const bindings = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => buildBinding(variant, contract));
  const bindingValidations = bindings.map((binding) => ({
    bindingId: binding.bindingId,
    ...validateP01CandidateBinding(binding)
  }));
  const questionValidations = preview.questions.map((question) => ({
    semanticVariantId: question.semanticVariantId,
    ...validateG3BU04GlobalContextExpansionQuestion(question)
  }));
  const reviewPackets = bindings.map((binding, index) => buildReviewPacket(
    binding,
    preview.questions[index],
    questionValidations[index]
  ));
  const errors = [
    ...bindingValidations.flatMap((validation) => validation.errors),
    ...questionValidations.flatMap((validation) => validation.errors),
    ...preview.errors
  ];

  const fingerprints = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => variant.semanticFingerprint);
  const changedAxisSignatures = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => [
    variant.eventPurposeId,
    variant.placeAssetId,
    variant.activityAssetId,
    variant.actorAssetId,
    variant.firstCostLabel,
    variant.secondCostLabel
  ].join("|"));
  if (new Set(fingerprints).size !== fingerprints.length) errors.push(issue("GCTX_P12_SEMANTIC_FINGERPRINT_DUPLICATE", "variants"));
  if (new Set(changedAxisSignatures).size !== changedAxisSignatures.length) errors.push(issue("GCTX_P12_CHANGED_AXIS_SIGNATURE_DUPLICATE", "variants"));
  if (bindings.length !== contract.acceptance.p01CandidateBindingCount) errors.push(issue("GCTX_P12_BINDING_COUNT_MISMATCH", "bindings"));
  if (preview.summary.uniquePromptCount !== contract.acceptance.uniquePromptCount) errors.push(issue("GCTX_P12_UNIQUE_PROMPT_COUNT_MISMATCH", "preview.summary.uniquePromptCount"));
  if (preview.summary.uniqueContextDomainCount !== contract.acceptance.uniqueContextDomainCount) errors.push(issue("GCTX_P12_CONTEXT_DOMAIN_COUNT_MISMATCH", "preview.summary.uniqueContextDomainCount"));
  if (preview.summary.uniqueSemanticFingerprintCount !== contract.acceptance.uniqueSemanticFingerprintCount) errors.push(issue("GCTX_P12_FINGERPRINT_COUNT_MISMATCH", "preview.summary.uniqueSemanticFingerprintCount"));
  if (preview.summary.legacyPromptCount !== 0) errors.push(issue("GCTX_P12_LEGACY_PROMPT_REMAINS", "preview.questions"));
  if (reviewPackets.some((packet) => packet.semanticReview.decision !== null || packet.mathematicalReview.decision !== null)) {
    errors.push(issue("GCTX_P12_AUTOMATIC_HUMAN_DECISION_FORBIDDEN", "reviewPackets"));
  }

  const summary = {
    bindingCount: bindings.length,
    p01ValidBindingCount: bindingValidations.filter((validation) => validation.ok).length,
    p01BindingErrorCount: bindingValidations.flatMap((validation) => validation.errors).length,
    renderedQuestionCount: preview.questions.length,
    uniquePromptCount: preview.summary.uniquePromptCount,
    uniqueContextDomainCount: preview.summary.uniqueContextDomainCount,
    uniqueSemanticFingerprintCount: preview.summary.uniqueSemanticFingerprintCount,
    legacyPromptCount: preview.summary.legacyPromptCount,
    mathematicalRecomputationErrorCount: questionValidations.flatMap((validation) => validation.errors).filter((entry) => entry.code === "GCTX_P12_ANSWER_RECOMPUTATION_MISMATCH").length,
    productionSelectableCount: bindings.filter((binding) => binding.lifecycleStatus === "approved").length,
    runtimeResolvableCount: reviewPackets.filter((packet) => packet.runtimeResolvable).length,
    humanReviewPacketCount: reviewPackets.length,
    humanDecisionCount: reviewPackets.filter((packet) => packet.semanticReview.decision || packet.mathematicalReview.decision).length,
    errorCount: errors.length,
    readyForHumanRenderedQuestionReview: errors.length === 0
  };

  return clone({
    registryId: "gctx_registry_g3b_u04_global_context_expansion_pilot_v1",
    schemaVersion: 1,
    rulesetVersion: contract.rulesetVersion,
    task: contract.task,
    status: errors.length === 0 ? "accepted_for_human_rendered_question_review" : "blocked",
    pilot: G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT,
    bindings,
    preview,
    reviewPackets,
    summary,
    scopeBoundary: {
      formalApprovedRegistryChanged: false,
      publicRouterChanged: false,
      productionSelectable: false,
      runtimeResolvable: false,
      humanReviewExecuted: false,
      rendererChanged: false
    },
    errors,
    nextShortestStep: contract.distance.nextShortestStep
  });
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const result = buildGctxP12GlobalContextExpansionPilot();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.errors.length > 0) process.exitCode = 1;
}
