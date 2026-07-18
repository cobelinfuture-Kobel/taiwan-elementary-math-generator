import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  getG3BU04SemanticPatternDefinition,
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  listG3BU04ScenarioProfilesForFamily,
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js";
import {
  buildGctxP08BindingAdmissionManifest,
  loadApprovedSemanticBindingRegistry,
} from "./build-gctx-p08-binding-admission-manifest.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P09_G3BU04ExactSemanticBindingExtractionPilot.json",
);

const TOP_LEVEL_REQUIRED_FIELDS = Object.freeze([
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
const TOP_LEVEL_ALLOWED_FIELDS = new Set([...TOP_LEVEL_REQUIRED_FIELDS, "legacyAliases"]);
const SLOT_KINDS = new Set(["actor", "place", "object", "activity", "classifier", "unit"]);
const EVENT_TYPES = new Set([
  "state_observation",
  "quantity_introduction",
  "quantity_change",
  "quantity_grouping",
  "quantity_comparison",
  "unit_conversion",
  "question_terminal",
]);
const QUANTITY_ROLE_KINDS = new Set(["given", "sampled_base", "derived_intermediate", "answer_target"]);
const VALUE_ORIGINS = new Set(["stimulus", "numeric_profile", "formula", "canonical_answer"]);
const UNIT_RELATIONS = new Set(["same_unit", "conversion", "rate_composition", "dimensionless", "derived_unit"]);
const QUESTION_INTENTS = new Set(["calculate", "compare", "identify", "estimate", "select_from_approved_options"]);
const ANSWER_SHAPES = new Set(["integer", "decimal", "fraction", "quantity", "choice", "ordered_tuple", "text_label"]);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const sortedUnique = (values) => [...new Set(values.filter(Boolean))].sort();
const slug = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function unique(values) {
  return new Set(values).size === values.length;
}

function exactMembers(left, right) {
  return JSON.stringify(sortedUnique(left)) === JSON.stringify(sortedUnique(right));
}

function guardId(constraintId) {
  return `gctx_guard_${slug(constraintId)}`;
}

function domainAssetId(kind, domain, value) {
  return `legacy_g3b_u04_${kind}_${slug(domain)}_${slug(value)}`;
}

function buildSemanticSlotBindings(profile) {
  return [
    {
      slotId: "actor_payer_group",
      slotKind: "actor",
      assetId: "legacy_g3b_u04_actor_shared_payers",
      semanticRole: "shared_payer_group",
      required: true,
    },
    {
      slotId: "place_purchase_scene",
      slotKind: "place",
      assetId: domainAssetId("place", profile.contextDomain, profile.sceneLabel),
      semanticRole: "joint_purchase_place",
      required: true,
    },
    {
      slotId: "object_purchase_item_1",
      slotKind: "object",
      assetId: domainAssetId("item", profile.contextDomain, profile.placeholderBindings.item1),
      semanticRole: "first_purchased_item",
      required: true,
    },
    {
      slotId: "object_purchase_item_2",
      slotKind: "object",
      assetId: domainAssetId("item", profile.contextDomain, profile.placeholderBindings.item2),
      semanticRole: "second_purchased_item",
      required: true,
    },
    {
      slotId: "activity_joint_purchase",
      slotKind: "activity",
      assetId: "legacy_g3b_u04_activity_joint_purchase_equal_share",
      semanticRole: "joint_purchase_equal_share",
      required: true,
    },
    {
      slotId: "unit_currency_twd",
      slotKind: "unit",
      assetId: "twd",
      semanticRole: "currency_unit",
      required: true,
    },
  ];
}

function buildQuantityRoles() {
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
      isQuestionTarget: false,
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
      isQuestionTarget: false,
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
      isQuestionTarget: false,
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
      isQuestionTarget: false,
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
      isQuestionTarget: true,
    },
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
      stateTransition: "two_item_costs_and_payer_count_are_known",
      mustPreserveOrder: true,
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
      mustPreserveOrder: true,
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
      mustPreserveOrder: true,
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
      mustPreserveOrder: true,
    },
  ];
}

function buildUnitFlow() {
  return [
    {
      fromQuantityRoleId: "qty_first_shared_cost",
      toQuantityRoleId: "qty_combined_shared_cost",
      relationType: "same_unit",
      conversionRuleId: null,
      mustBeExact: true,
    },
    {
      fromQuantityRoleId: "qty_second_shared_cost",
      toQuantityRoleId: "qty_combined_shared_cost",
      relationType: "same_unit",
      conversionRuleId: null,
      mustBeExact: true,
    },
    {
      fromQuantityRoleId: "qty_combined_shared_cost",
      toQuantityRoleId: "qty_cost_per_person",
      relationType: "rate_composition",
      conversionRuleId: null,
      mustBeExact: true,
    },
    {
      fromQuantityRoleId: "qty_payer_count",
      toQuantityRoleId: "qty_cost_per_person",
      relationType: "rate_composition",
      conversionRuleId: null,
      mustBeExact: true,
    },
  ];
}

function buildBinding(profile, pattern, contract) {
  const domain = slug(profile.contextDomain);
  const semanticGuardIds = contract.expectedLegacyParity.requiredConstraints.map(guardId);
  const sourceEvidenceIds = [
    contract.inputs.patternAuthority,
    contract.inputs.scenarioAuthority,
    contract.inputs.domainAuthority,
    contract.inputs.roleAuthority,
    profile.scenarioId,
  ];

  return {
    bindingId: `gctx_bind_g3b_u04_add_divide_joint_purchase_equal_share_${domain}`,
    rulesetVersion: contract.rulesetVersion,
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    knowledgePointId: contract.scope.pilotKnowledgePointId,
    patternSpecId: contract.scope.pilotPatternSpecId,
    contextFamilyId: contract.fixedGlobalCandidateRefs.contextFamilyId,
    semanticVariantId: `gctx_semvar_g3b_u04_add_divide_joint_purchase_equal_share_${domain}`,
    commonKnowledgeIds: [...contract.fixedGlobalCandidateRefs.commonKnowledgeIds],
    semanticSlotBindings: buildSemanticSlotBindings(profile),
    operationSignature: pattern.equationShape,
    eventFlow: buildEventFlow(),
    quantityRoles: buildQuantityRoles(),
    unitFlow: buildUnitFlow(),
    questionRole: {
      questionRoleId: "qrole_cost_per_person",
      intent: "calculate",
      targetQuantityRoleIds: ["qty_cost_per_person"],
      answerShape: "quantity",
      mustUseEventStepIds: [
        "evt_combine_shared_costs",
        "evt_share_combined_cost_equally",
        "evt_ask_cost_per_person",
      ],
      terminalForBinding: true,
    },
    languageVariantIds: [`gctx_lang_zh_tw_g3b_u04_joint_purchase_equal_share_${domain}`],
    numericProfileIds: [...contract.fixedGlobalCandidateRefs.numericProfileIds],
    compatibilityRules: {
      requiredSlotIds: buildSemanticSlotBindings(profile).map((row) => row.slotId),
      forbiddenCombinationIds: [],
      allowedEraTags: ["modern"],
      allowedGradeBands: ["G3"],
      requiredCommonKnowledgeIds: [...contract.fixedGlobalCandidateRefs.commonKnowledgeIds],
      forbiddenCommonKnowledgeIds: [],
      semanticGuardIds,
    },
    reviewEvidence: {
      approvalState: "candidate",
      rulesetVersion: contract.rulesetVersion,
      semanticReviewIds: [],
      mathematicalReviewIds: [],
      sourceEvidenceIds,
      semanticCompletenessConfirmed: true,
      mathematicalMeaningPreserved: true,
      approvedAt: null,
    },
    randomnessPolicy: {
      mode: "select_approved_components_only",
      selectableAxes: ["language_variant", "numeric_profile"],
      mayCreateNewSemanticBinding: false,
      mayReplaceContextFamily: false,
      mayMutateSemanticSlotBindings: false,
      mayMutateEventFlow: false,
      mayChangeQuestionRole: false,
      fallbackPolicy: "block",
    },
    validationContract: {
      semanticValidatorHooks: [
        pattern.semanticValidatorRef,
        ...semanticGuardIds,
      ],
      mathValidatorHooks: [
        "gctx_math_recompute_add_then_divide",
        "gctx_math_require_sum_divisible_by_payer_count",
      ],
      canonicalAnswerRecomputationRequired: true,
      blocking: true,
      mustValidateSlotBindings: true,
      mustValidateEventFlow: true,
      mustValidateQuantityRoles: true,
      mustValidateUnitFlow: true,
      mustValidateQuestionRole: true,
    },
    answerUnitPolicy: {
      mode: "required",
      allowedUnitIds: [...contract.fixedGlobalCandidateRefs.answerUnitIds],
      studentAnswerMayOmitUnit: false,
    },
    lifecycleStatus: "candidate",
    legacyAliases: sortedUnique([
      pattern.patternSpecId,
      pattern.templateFamilyId,
      profile.scenarioProfileId,
      profile.scenarioId,
      profile.contextDomain,
      profile.semanticSignature,
      profile.unitFlowModel,
      profile.ownershipModel,
    ]),
  };
}

export function loadGctxP09Contract() {
  return readJson(CONTRACT_PATH);
}

export function validateP01CandidateBinding(binding) {
  const errors = [];
  const keys = Object.keys(binding);
  for (const field of TOP_LEVEL_REQUIRED_FIELDS) {
    if (!(field in binding)) errors.push(issue("GCTX_P09_P01_REQUIRED_FIELD_MISSING", field));
  }
  for (const field of keys) {
    if (!TOP_LEVEL_ALLOWED_FIELDS.has(field)) errors.push(issue("GCTX_P09_P01_ADDITIONAL_FIELD", field));
  }

  const patternChecks = [
    [binding.bindingId, /^gctx_bind_[a-z0-9_]+$/, "bindingId"],
    [binding.rulesetVersion, /^[0-9]+\.[0-9]+\.[0-9]+$/, "rulesetVersion"],
    [binding.unitCode, /^[1-6][AB]-U[0-9]{2}$/, "unitCode"],
    [binding.contextFamilyId, /^gctx_cf_[a-z0-9_]+$/, "contextFamilyId"],
    [binding.semanticVariantId, /^gctx_semvar_[a-z0-9_]+$/, "semanticVariantId"],
  ];
  for (const [value, regex, field] of patternChecks) {
    if (typeof value !== "string" || !regex.test(value)) errors.push(issue("GCTX_P09_P01_PATTERN_INVALID", field));
  }

  const nonEmptyUniqueArrays = [
    [binding.commonKnowledgeIds, /^gctx_ck_[a-z0-9_]+$/, "commonKnowledgeIds"],
    [binding.languageVariantIds, /^gctx_lang_[a-z0-9_]+$/, "languageVariantIds"],
    [binding.numericProfileIds, /^gctx_num_[a-z0-9_]+$/, "numericProfileIds"],
  ];
  for (const [values, regex, field] of nonEmptyUniqueArrays) {
    if (!Array.isArray(values) || values.length === 0 || !unique(values) || values.some((value) => !regex.test(value))) {
      errors.push(issue("GCTX_P09_P01_ID_ARRAY_INVALID", field));
    }
  }

  const slots = Array.isArray(binding.semanticSlotBindings) ? binding.semanticSlotBindings : [];
  const slotIds = slots.map((row) => row.slotId);
  if (slots.length === 0 || !unique(slotIds)) errors.push(issue("GCTX_P09_P01_SLOT_SET_INVALID", "semanticSlotBindings"));
  for (const [index, slot] of slots.entries()) {
    if (!/^([a-z][a-z0-9_]*)$/.test(slot.slotId ?? "")) errors.push(issue("GCTX_P09_P01_SLOT_ID_INVALID", `semanticSlotBindings[${index}].slotId`));
    if (!SLOT_KINDS.has(slot.slotKind)) errors.push(issue("GCTX_P09_P01_SLOT_KIND_INVALID", `semanticSlotBindings[${index}].slotKind`));
    if (typeof slot.assetId !== "string" || slot.assetId.length === 0) errors.push(issue("GCTX_P09_P01_SLOT_ASSET_INVALID", `semanticSlotBindings[${index}].assetId`));
    if (!/^([a-z][a-z0-9_]*)$/.test(slot.semanticRole ?? "")) errors.push(issue("GCTX_P09_P01_SLOT_ROLE_INVALID", `semanticSlotBindings[${index}].semanticRole`));
  }
  const slotSet = new Set(slotIds);

  const quantities = Array.isArray(binding.quantityRoles) ? binding.quantityRoles : [];
  const quantityIds = quantities.map((row) => row.quantityRoleId);
  if (quantities.length === 0 || !unique(quantityIds)) errors.push(issue("GCTX_P09_P01_QUANTITY_SET_INVALID", "quantityRoles"));
  for (const [index, quantity] of quantities.entries()) {
    if (!/^qty_[a-z0-9_]+$/.test(quantity.quantityRoleId ?? "")) errors.push(issue("GCTX_P09_P01_QUANTITY_ID_INVALID", `quantityRoles[${index}].quantityRoleId`));
    if (!QUANTITY_ROLE_KINDS.has(quantity.roleKind)) errors.push(issue("GCTX_P09_P01_QUANTITY_KIND_INVALID", `quantityRoles[${index}].roleKind`));
    if (!VALUE_ORIGINS.has(quantity.valueOrigin)) errors.push(issue("GCTX_P09_P01_VALUE_ORIGIN_INVALID", `quantityRoles[${index}].valueOrigin`));
    if (quantity.entitySlotId !== null && !slotSet.has(quantity.entitySlotId)) errors.push(issue("GCTX_P09_P01_QUANTITY_SLOT_UNRESOLVED", `quantityRoles[${index}].entitySlotId`));
    if (!/^([a-z][a-z0-9_]*)$/.test(quantity.unitDimension ?? "")) errors.push(issue("GCTX_P09_P01_UNIT_DIMENSION_INVALID", `quantityRoles[${index}].unitDimension`));
    if (!/^([a-z][a-z0-9_]*)$/.test(quantity.numericProfileRoleKey ?? "")) errors.push(issue("GCTX_P09_P01_NUMERIC_ROLE_KEY_INVALID", `quantityRoles[${index}].numericProfileRoleKey`));
    if (typeof quantity.isQuestionTarget !== "boolean") errors.push(issue("GCTX_P09_P01_TARGET_FLAG_INVALID", `quantityRoles[${index}].isQuestionTarget`));
  }
  const quantitySet = new Set(quantityIds);

  const events = Array.isArray(binding.eventFlow) ? binding.eventFlow : [];
  const eventIds = events.map((row) => row.eventStepId);
  if (events.length === 0 || !unique(eventIds)) errors.push(issue("GCTX_P09_P01_EVENT_SET_INVALID", "eventFlow"));
  const eventSet = new Set(eventIds);
  const expectedOrders = events.map((row) => row.order);
  if (JSON.stringify(expectedOrders) !== JSON.stringify(events.map((_, index) => index + 1))) {
    errors.push(issue("GCTX_P09_P01_EVENT_ORDER_INVALID", "eventFlow"));
  }
  for (const [index, event] of events.entries()) {
    if (!/^evt_[a-z0-9_]+$/.test(event.eventStepId ?? "")) errors.push(issue("GCTX_P09_P01_EVENT_ID_INVALID", `eventFlow[${index}].eventStepId`));
    if (!EVENT_TYPES.has(event.eventType)) errors.push(issue("GCTX_P09_P01_EVENT_TYPE_INVALID", `eventFlow[${index}].eventType`));
    for (const slotId of [event.actorSlotId, event.placeSlotId, ...(event.objectSlotIds ?? [])].filter(Boolean)) {
      if (!slotSet.has(slotId)) errors.push(issue("GCTX_P09_P01_EVENT_SLOT_UNRESOLVED", `eventFlow[${index}]`, { slotId }));
    }
    for (const quantityId of [...(event.inputQuantityRoleIds ?? []), ...(event.outputQuantityRoleIds ?? [])]) {
      if (!quantitySet.has(quantityId)) errors.push(issue("GCTX_P09_P01_EVENT_QUANTITY_UNRESOLVED", `eventFlow[${index}]`, { quantityId }));
    }
    if (event.mustPreserveOrder !== true) errors.push(issue("GCTX_P09_P01_EVENT_ORDER_NOT_LOCKED", `eventFlow[${index}].mustPreserveOrder`));
  }

  const unitFlow = Array.isArray(binding.unitFlow) ? binding.unitFlow : [];
  for (const [index, edge] of unitFlow.entries()) {
    if (!quantitySet.has(edge.fromQuantityRoleId) || !quantitySet.has(edge.toQuantityRoleId)) {
      errors.push(issue("GCTX_P09_P01_UNIT_FLOW_QUANTITY_UNRESOLVED", `unitFlow[${index}]`));
    }
    if (!UNIT_RELATIONS.has(edge.relationType)) errors.push(issue("GCTX_P09_P01_UNIT_FLOW_RELATION_INVALID", `unitFlow[${index}].relationType`));
    if (edge.mustBeExact !== true) errors.push(issue("GCTX_P09_P01_UNIT_FLOW_NOT_EXACT", `unitFlow[${index}].mustBeExact`));
  }

  const question = binding.questionRole ?? {};
  if (!/^qrole_[a-z0-9_]+$/.test(question.questionRoleId ?? "")) errors.push(issue("GCTX_P09_P01_QUESTION_ROLE_ID_INVALID", "questionRole.questionRoleId"));
  if (!QUESTION_INTENTS.has(question.intent)) errors.push(issue("GCTX_P09_P01_QUESTION_INTENT_INVALID", "questionRole.intent"));
  if (!ANSWER_SHAPES.has(question.answerShape)) errors.push(issue("GCTX_P09_P01_ANSWER_SHAPE_INVALID", "questionRole.answerShape"));
  if (!Array.isArray(question.targetQuantityRoleIds) || question.targetQuantityRoleIds.length === 0 || question.targetQuantityRoleIds.some((id) => !quantitySet.has(id))) {
    errors.push(issue("GCTX_P09_P01_QUESTION_TARGET_UNRESOLVED", "questionRole.targetQuantityRoleIds"));
  }
  if (!Array.isArray(question.mustUseEventStepIds) || question.mustUseEventStepIds.length === 0 || question.mustUseEventStepIds.some((id) => !eventSet.has(id))) {
    errors.push(issue("GCTX_P09_P01_QUESTION_EVENT_UNRESOLVED", "questionRole.mustUseEventStepIds"));
  }
  if (question.terminalForBinding !== true) errors.push(issue("GCTX_P09_P01_QUESTION_NOT_TERMINAL", "questionRole.terminalForBinding"));

  const compatibility = binding.compatibilityRules ?? {};
  if (!Array.isArray(compatibility.requiredSlotIds) || compatibility.requiredSlotIds.length === 0 || compatibility.requiredSlotIds.some((id) => !slotSet.has(id))) {
    errors.push(issue("GCTX_P09_P01_REQUIRED_SLOT_UNRESOLVED", "compatibilityRules.requiredSlotIds"));
  }
  if (!Array.isArray(compatibility.semanticGuardIds) || compatibility.semanticGuardIds.length === 0 || compatibility.semanticGuardIds.some((id) => !/^gctx_guard_[a-z0-9_]+$/.test(id))) {
    errors.push(issue("GCTX_P09_P01_GUARD_SET_INVALID", "compatibilityRules.semanticGuardIds"));
  }

  const review = binding.reviewEvidence ?? {};
  if (review.approvalState !== "candidate" || review.rulesetVersion !== binding.rulesetVersion || review.approvedAt !== null) {
    errors.push(issue("GCTX_P09_P01_REVIEW_STATE_INVALID", "reviewEvidence"));
  }
  if (!Array.isArray(review.sourceEvidenceIds) || review.sourceEvidenceIds.length === 0) errors.push(issue("GCTX_P09_P01_SOURCE_EVIDENCE_EMPTY", "reviewEvidence.sourceEvidenceIds"));

  const randomness = binding.randomnessPolicy ?? {};
  const randomnessLocked = randomness.mode === "select_approved_components_only"
    && exactMembers(randomness.selectableAxes ?? [], ["language_variant", "numeric_profile"])
    && randomness.mayCreateNewSemanticBinding === false
    && randomness.mayReplaceContextFamily === false
    && randomness.mayMutateSemanticSlotBindings === false
    && randomness.mayMutateEventFlow === false
    && randomness.mayChangeQuestionRole === false
    && randomness.fallbackPolicy === "block";
  if (!randomnessLocked) errors.push(issue("GCTX_P09_P01_RANDOMNESS_POLICY_INVALID", "randomnessPolicy"));

  const validation = binding.validationContract ?? {};
  if (!Array.isArray(validation.semanticValidatorHooks) || validation.semanticValidatorHooks.length === 0
    || !Array.isArray(validation.mathValidatorHooks) || validation.mathValidatorHooks.length === 0
    || validation.canonicalAnswerRecomputationRequired !== true
    || validation.blocking !== true
    || validation.mustValidateSlotBindings !== true
    || validation.mustValidateEventFlow !== true
    || validation.mustValidateQuantityRoles !== true
    || validation.mustValidateUnitFlow !== true
    || validation.mustValidateQuestionRole !== true) {
    errors.push(issue("GCTX_P09_P01_VALIDATION_CONTRACT_INVALID", "validationContract"));
  }

  const answerPolicy = binding.answerUnitPolicy ?? {};
  if (answerPolicy.mode !== "required" || !Array.isArray(answerPolicy.allowedUnitIds) || answerPolicy.allowedUnitIds.length === 0 || answerPolicy.studentAnswerMayOmitUnit !== false) {
    errors.push(issue("GCTX_P09_P01_ANSWER_UNIT_POLICY_INVALID", "answerUnitPolicy"));
  }
  if (binding.lifecycleStatus !== "candidate") errors.push(issue("GCTX_P09_P01_LIFECYCLE_INVALID", "lifecycleStatus"));

  return { ok: errors.length === 0, errors };
}

function validateLegacyParity(binding, profile, pattern, contract) {
  const errors = [];
  const expected = contract.expectedLegacyParity;
  if (binding.operationSignature !== expected.operationSignature || pattern.equationShape !== expected.operationSignature || profile.equationShape !== expected.operationSignature) {
    errors.push(issue("GCTX_P09_LEGACY_OPERATION_SIGNATURE_DRIFT", "operationSignature"));
  }
  if (pattern.unknownRole !== expected.unknownRole || profile.unknownRole !== expected.unknownRole) {
    errors.push(issue("GCTX_P09_LEGACY_UNKNOWN_ROLE_DRIFT", "unknownRole"));
  }
  if (JSON.stringify(pattern.quantityRoles) !== JSON.stringify(expected.quantityRoleBindings)
    || JSON.stringify(profile.quantityRoleBindings) !== JSON.stringify(expected.quantityRoleBindings)) {
    errors.push(issue("GCTX_P09_LEGACY_QUANTITY_ROLE_BINDING_DRIFT", "quantityRoleBindings"));
  }
  const semanticRoles = Object.fromEntries(binding.quantityRoles
    .filter((row) => ["a", "b", "c"].includes(row.numericProfileRoleKey))
    .map((row) => [row.numericProfileRoleKey, row.semanticRole]));
  if (JSON.stringify(semanticRoles) !== JSON.stringify(expected.quantityRoleBindings)) {
    errors.push(issue("GCTX_P09_EXTRACTED_QUANTITY_ROLE_BINDING_DRIFT", "quantityRoles"));
  }
  if (!exactMembers(pattern.requiredConstraints, expected.requiredConstraints)) {
    errors.push(issue("GCTX_P09_LEGACY_CONSTRAINT_SET_DRIFT", "requiredConstraints"));
  }
  const expectedGuards = expected.requiredConstraints.map(guardId);
  if (!exactMembers(binding.compatibilityRules.semanticGuardIds, expectedGuards)) {
    errors.push(issue("GCTX_P09_EXTRACTED_GUARD_SET_DRIFT", "compatibilityRules.semanticGuardIds"));
  }
  if (pattern.semanticValidatorRef !== expected.semanticValidatorRef
    || !binding.validationContract.semanticValidatorHooks.includes(expected.semanticValidatorRef)) {
    errors.push(issue("GCTX_P09_LEGACY_VALIDATOR_REF_DRIFT", "validationContract.semanticValidatorHooks"));
  }
  if (binding.questionRole.answerShape !== expected.answerShape) {
    errors.push(issue("GCTX_P09_ANSWER_SHAPE_DRIFT", "questionRole.answerShape"));
  }
  if (binding.answerUnitPolicy.mode !== expected.answerUnitPolicy) {
    errors.push(issue("GCTX_P09_ANSWER_UNIT_POLICY_DRIFT", "answerUnitPolicy.mode"));
  }
  if (!binding.legacyAliases.includes(profile.scenarioId)
    || !binding.legacyAliases.includes(profile.contextDomain)
    || !binding.legacyAliases.includes(pattern.templateFamilyId)) {
    errors.push(issue("GCTX_P09_LEGACY_ALIAS_INCOMPLETE", "legacyAliases"));
  }
  return { ok: errors.length === 0, errors };
}

export function buildGctxP09ExactBindingPilot() {
  const contract = loadGctxP09Contract();
  const p08 = buildGctxP08BindingAdmissionManifest();
  const approvedRegistry = loadApprovedSemanticBindingRegistry();
  const errors = [];

  const admission = p08.candidates.find((row) => row.sourceId === contract.scope.sourceId
    && row.patternSpecId === contract.scope.pilotPatternSpecId);
  if (!admission || admission.admissionClass !== "legacy_authority_normalization") {
    errors.push(issue("GCTX_P09_P08_LEGACY_ADMISSION_MISSING", "p08Admission"));
  }

  const pattern = getG3BU04SemanticPatternDefinition(contract.scope.pilotPatternSpecId);
  if (!pattern) errors.push(issue("GCTX_P09_PATTERN_AUTHORITY_MISSING", "patternSpecId"));
  if (pattern && pattern.templateFamilyId !== contract.scope.pilotTemplateFamilyId) {
    errors.push(issue("GCTX_P09_TEMPLATE_FAMILY_DRIFT", "templateFamilyId"));
  }
  if (pattern && pattern.knowledgePointId !== contract.scope.pilotKnowledgePointId) {
    errors.push(issue("GCTX_P09_KNOWLEDGE_POINT_DRIFT", "knowledgePointId"));
  }

  const profiles = pattern
    ? listG3BU04ScenarioProfilesForFamily(pattern.templateFamilyId)
    : [];
  const domains = profiles.map((profile) => profile.contextDomain);
  if (!exactMembers(domains, contract.scope.expectedContextDomains)) {
    errors.push(issue("GCTX_P09_CONTEXT_DOMAIN_SET_DRIFT", "contextDomains", {
      expected: sortedUnique(contract.scope.expectedContextDomains),
      actual: sortedUnique(domains),
    }));
  }

  const entries = pattern
    ? profiles.map((profile) => buildBinding(profile, pattern, contract))
    : [];
  const bindingIds = entries.map((entry) => entry.bindingId);
  const semanticVariantIds = entries.map((entry) => entry.semanticVariantId);
  const languageVariantIds = entries.flatMap((entry) => entry.languageVariantIds);
  if (!unique(bindingIds)) errors.push(issue("GCTX_P09_DUPLICATE_BINDING_ID", "entries"));
  if (!unique(semanticVariantIds)) errors.push(issue("GCTX_P09_DUPLICATE_SEMANTIC_VARIANT_ID", "entries"));
  if (!unique(languageVariantIds)) errors.push(issue("GCTX_P09_DUPLICATE_LANGUAGE_VARIANT_ID", "entries"));

  let schemaValidBindingCount = 0;
  let legacyParityBindingCount = 0;
  const validations = [];
  for (let index = 0; index < entries.length; index += 1) {
    const binding = entries[index];
    const profile = profiles[index];
    const schemaValidation = validateP01CandidateBinding(binding);
    const legacyParity = validateLegacyParity(binding, profile, pattern, contract);
    if (schemaValidation.ok) schemaValidBindingCount += 1;
    if (legacyParity.ok) legacyParityBindingCount += 1;
    errors.push(...schemaValidation.errors.map((entry) => ({ ...entry, bindingId: binding.bindingId })));
    errors.push(...legacyParity.errors.map((entry) => ({ ...entry, bindingId: binding.bindingId })));
    validations.push({
      bindingId: binding.bindingId,
      contextDomain: profile.contextDomain,
      p01SchemaValid: schemaValidation.ok,
      legacyParityValid: legacyParity.ok,
      errors: [...schemaValidation.errors, ...legacyParity.errors],
    });
  }

  if (approvedRegistry.entries.length !== 0) {
    errors.push(issue("GCTX_P09_FORMAL_APPROVED_REGISTRY_NOT_EMPTY", "approvedRegistry.entries", {
      entryCount: approvedRegistry.entries.length,
    }));
  }
  const productionSelectableBindingCount = entries.filter((entry) => entry.lifecycleStatus === "approved"
    || entry.reviewEvidence.approvalState === "approved").length;
  if (productionSelectableBindingCount !== 0) {
    errors.push(issue("GCTX_P09_FALSE_PRODUCTION_SELECTION_CLAIM", "entries"));
  }

  const summary = {
    patternSpecCount: pattern ? 1 : 0,
    bindingCount: entries.length,
    contextDomainCount: sortedUnique(domains).length,
    schemaValidBindingCount,
    legacyParityBindingCount,
    approvedRegistryEntryCount: approvedRegistry.entries.length,
    productionSelectableBindingCount,
    errorCount: errors.length,
    readyForP10RemainingExtraction: errors.length === 0,
  };
  for (const [field, expected] of Object.entries(contract.acceptedSnapshot)) {
    if (field === "errorCount") continue;
    if (summary[field] !== expected) {
      errors.push(issue("GCTX_P09_ACCEPTED_SNAPSHOT_MISMATCH", `summary.${field}`, {
        expected,
        actual: summary[field],
      }));
    }
  }
  summary.errorCount = errors.length;
  summary.readyForP10RemainingExtraction = errors.length === 0;

  return clone({
    registryId: contract.candidateRegistry.registryId,
    schemaVersion: 1,
    rulesetVersion: contract.rulesetVersion,
    registryKind: contract.candidateRegistry.registryKind,
    task: contract.task,
    status: errors.length === 0 ? "accepted_for_p10_remaining_extraction" : "blocked",
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    pilotPatternSpecId: contract.scope.pilotPatternSpecId,
    pilotTemplateFamilyId: contract.scope.pilotTemplateFamilyId,
    admissionEvidence: admission ?? null,
    entries,
    validations,
    summary,
    formalApprovedRegistry: {
      path: contract.candidateRegistry.formalApprovedRegistryTarget,
      entryCount: approvedRegistry.entries.length,
      changedByP09: false,
    },
    errors,
    scopeBoundary: {
      runtimeBehaviorChanged: false,
      approvedRegistryChanged: false,
      productionSelectable: false,
      unitAuthorityDeletedOrRewritten: false,
      rendererChanged: false,
    },
    nextShortestStep: contract.nextTask,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stdout.write(`${JSON.stringify(buildGctxP09ExactBindingPilot(), null, 2)}\n`);
}
