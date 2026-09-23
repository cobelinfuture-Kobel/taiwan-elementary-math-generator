import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  listG3BU04SemanticPatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  listG3BU04ScenarioProfilesForFamily,
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-scenarios.js";
import {
  buildGctxP08BindingAdmissionManifest,
  loadApprovedSemanticBindingRegistry,
} from "./build-gctx-p08-binding-admission-manifest.mjs";
import {
  buildGctxP09ExactBindingPilot,
  validateP01CandidateBinding,
} from "./build-gctx-p09-g3b-u04-exact-binding-pilot.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P10_G3BU04RemainingExactSemanticBindingExtraction.json",
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const slug = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");
const sortedUnique = (values) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))].sort();
const exactMembers = (left, right) => JSON.stringify(sortedUnique(left)) === JSON.stringify(sortedUnique(right));
const aliasValue = (value) => typeof value === "string" ? value : JSON.stringify(value);

function guardId(constraintId) {
  return `gctx_guard_${slug(constraintId)}`;
}

function placeholderKind(key) {
  const token = key.toLowerCase();
  if (/(person|child|sibling|parent|recipient|student|teacher|player|worker|buyer|payer)/.test(token)) return "actor";
  if (/(unit|currency|classifier)/.test(token)) return "unit";
  if (/(place|scene|location)/.test(token)) return "place";
  if (/(action|activity)/.test(token)) return "activity";
  return "object";
}

function buildSlots(profile) {
  const slots = [
    {
      slotId: "place_context_scene",
      slotKind: "place",
      assetId: `legacy_g3b_u04_scene_${slug(profile.contextDomain)}`,
      semanticRole: "context_scene",
      required: true,
    },
    {
      slotId: "activity_semantic_operation",
      slotKind: "activity",
      assetId: `legacy_g3b_u04_activity_${slug(profile.semanticSignature)}`,
      semanticRole: "semantic_operation_activity",
      required: true,
    },
  ];
  for (const [key, value] of Object.entries(profile.placeholderBindings ?? {})) {
    const keySlug = slug(key) || "placeholder";
    const kind = placeholderKind(key);
    slots.push({
      slotId: `${kind}_${keySlug}`,
      slotKind: kind,
      assetId: `legacy_g3b_u04_${slug(profile.contextDomain)}_${keySlug}_${slug(value) || "value"}`,
      semanticRole: keySlug,
      required: true,
    });
  }
  const seen = new Set();
  return slots.filter((row) => {
    if (seen.has(row.slotId)) return false;
    seen.add(row.slotId);
    return true;
  });
}

function answerDimension(pattern, profile, contract) {
  const token = `${pattern.unknownRole} ${profile.unitFlowModel ?? ""}`.toLowerCase();
  const rules = contract.answerDimensionRules;
  if (rules.currencyKeywords.some((keyword) => token.includes(keyword))) return "currency";
  if (rules.ageKeywords.some((keyword) => token.includes(keyword))) return "age_years";
  if (rules.capacityKeywords.some((keyword) => token.includes(keyword))) return "capacity";
  if (rules.weightKeywords.some((keyword) => token.includes(keyword))) return "weight";
  if (rules.lengthKeywords.some((keyword) => token.includes(keyword))) return "length";
  if (rules.dimensionlessKeywords.some((keyword) => token.includes(keyword))) return "dimensionless_times";
  if (rules.periodKeywords.some((keyword) => token.includes(keyword))) return "count_per_period";
  if (rules.pointKeywords.some((keyword) => token.includes(keyword))) return "points";
  return rules.defaultDimension;
}

function unitIdsForDimension(dimension) {
  const token = String(dimension ?? "count").toLowerCase();
  if (token.includes("currency") || token.includes("cost") || token.includes("price")) return ["twd"];
  if (token.includes("age") || token.includes("year")) return ["year"];
  if (token.includes("capacity") || token.includes("volume")) return ["milliliter", "liter"];
  if (token.includes("weight") || token.includes("mass")) return ["gram", "kilogram"];
  if (token.includes("length") || token.includes("distance")) return ["centimeter", "meter"];
  if (token.includes("time") || token.includes("period")) return ["per_period"];
  if (token.includes("point")) return ["point"];
  if (token.includes("dimensionless") || token.includes("multiplier") || token.includes("ratio")) return ["times"];
  return ["count"];
}

function givenQuantityRoles(profile) {
  return Object.entries(profile.quantityRoleBindings).map(([symbol, semanticRole]) => {
    const legacyRole = profile.quantityBounds?.[symbol] ?? {};
    const unitDimension = slug(legacyRole.unitDimension) || "count";
    return {
      quantityRoleId: `qty_${slug(symbol)}_${slug(semanticRole)}`,
      roleKind: "given",
      semanticRole: slug(semanticRole),
      entitySlotId: null,
      valueOrigin: "numeric_profile",
      unitDimension,
      allowedUnitIds: unitIdsForDimension(unitDimension),
      numericProfileRoleKey: slug(symbol),
      isQuestionTarget: false,
    };
  });
}

function answerQuantityRole(pattern, profile, contract) {
  const unitDimension = answerDimension(pattern, profile, contract);
  return {
    quantityRoleId: `qty_answer_${slug(pattern.unknownRole)}`,
    roleKind: "answer_target",
    semanticRole: slug(pattern.unknownRole),
    entitySlotId: null,
    valueOrigin: "canonical_answer",
    unitDimension,
    allowedUnitIds: unitIdsForDimension(unitDimension),
    numericProfileRoleKey: "answer",
    isQuestionTarget: true,
  };
}

function operationEventType(pattern, profile) {
  const token = `${pattern.equationShape} ${profile.profileClass} ${profile.scenarioSubtype}`.toLowerCase();
  if (token.includes("ratio") || token.includes("comparison") || token.includes("倍")) return "quantity_comparison";
  if (pattern.equationShape.includes("/")) return "quantity_grouping";
  return "quantity_change";
}

function buildEventFlow(pattern, profile, slots, givenRoles, answerRole) {
  const actorSlotId = slots.find((row) => row.slotKind === "actor")?.slotId ?? null;
  const objectSlotIds = slots.filter((row) => row.slotKind === "object").map((row) => row.slotId);
  const givenIds = givenRoles.map((row) => row.quantityRoleId);
  return [
    {
      eventStepId: "evt_introduce_legacy_quantities",
      order: 1,
      eventType: "quantity_introduction",
      actorSlotId,
      placeSlotId: "place_context_scene",
      objectSlotIds,
      actionId: `introduce_${slug(profile.semanticSignature)}_inputs`,
      inputQuantityRoleIds: [],
      outputQuantityRoleIds: givenIds,
      stateTransition: "all_legacy_given_quantities_are_available",
      mustPreserveOrder: true,
    },
    {
      eventStepId: "evt_apply_canonical_semantic_operation",
      order: 2,
      eventType: operationEventType(pattern, profile),
      actorSlotId,
      placeSlotId: "place_context_scene",
      objectSlotIds,
      actionId: `apply_${slug(profile.semanticSignature)}`,
      inputQuantityRoleIds: givenIds,
      outputQuantityRoleIds: [answerRole.quantityRoleId],
      stateTransition: `canonical_operation_${slug(pattern.equationShape)}_produces_${slug(pattern.unknownRole)}`,
      mustPreserveOrder: true,
    },
    {
      eventStepId: "evt_ask_legacy_question_target",
      order: 3,
      eventType: "question_terminal",
      actorSlotId,
      placeSlotId: "place_context_scene",
      objectSlotIds,
      actionId: `ask_${slug(pattern.unknownRole)}`,
      inputQuantityRoleIds: [answerRole.quantityRoleId],
      outputQuantityRoleIds: [],
      stateTransition: `${slug(pattern.unknownRole)}_is_the_terminal_question_target`,
      mustPreserveOrder: true,
    },
  ];
}

function relationType(fromDimension, targetDimension, operationSignature) {
  if (fromDimension === targetDimension) return "same_unit";
  if (String(fromDimension).includes("dimensionless") || String(targetDimension).includes("dimensionless")) return "dimensionless";
  if (operationSignature.includes("*") || operationSignature.includes("/")) return "rate_composition";
  return "derived_unit";
}

function buildGenericBinding(pattern, profile, contract) {
  const slots = buildSlots(profile);
  const givenRoles = givenQuantityRoles(profile);
  const answerRole = answerQuantityRole(pattern, profile, contract);
  const quantityRoles = [...givenRoles, answerRole];
  const semanticGuards = pattern.requiredConstraints.map(guardId);
  const domain = slug(profile.contextDomain);
  const patternSuffix = slug(pattern.patternSpecId.replace(/^ps_/, ""));
  const commonKnowledgeIds = [
    "gctx_ck_elementary_two_step_reasoning",
    `gctx_ck_profile_${slug(profile.profileClass)}`,
    `gctx_ck_domain_${domain}`,
  ];

  return {
    bindingId: `gctx_bind_${patternSuffix}_${domain}`,
    rulesetVersion: contract.rulesetVersion,
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    knowledgePointId: pattern.knowledgePointId,
    patternSpecId: pattern.patternSpecId,
    contextFamilyId: `gctx_cf_${slug(pattern.templateFamilyId.replace(/^tpl_/, ""))}`,
    semanticVariantId: `gctx_semvar_${patternSuffix}_${domain}`,
    commonKnowledgeIds,
    semanticSlotBindings: slots,
    operationSignature: pattern.equationShape,
    eventFlow: buildEventFlow(pattern, profile, slots, givenRoles, answerRole),
    quantityRoles,
    unitFlow: givenRoles.map((row) => ({
      fromQuantityRoleId: row.quantityRoleId,
      toQuantityRoleId: answerRole.quantityRoleId,
      relationType: relationType(row.unitDimension, answerRole.unitDimension, pattern.equationShape),
      conversionRuleId: null,
      mustBeExact: true,
    })),
    questionRole: {
      questionRoleId: `qrole_${slug(pattern.unknownRole)}`,
      intent: "calculate",
      targetQuantityRoleIds: [answerRole.quantityRoleId],
      answerShape: "quantity",
      mustUseEventStepIds: ["evt_apply_canonical_semantic_operation", "evt_ask_legacy_question_target"],
      terminalForBinding: true,
    },
    languageVariantIds: [`gctx_lang_zh_tw_${patternSuffix}_${domain}`],
    numericProfileIds: [`gctx_num_${patternSuffix}_positive_integer`],
    compatibilityRules: {
      requiredSlotIds: slots.map((row) => row.slotId),
      forbiddenCombinationIds: [],
      allowedEraTags: ["modern"],
      allowedGradeBands: ["G3"],
      requiredCommonKnowledgeIds: commonKnowledgeIds,
      forbiddenCommonKnowledgeIds: [],
      semanticGuardIds: semanticGuards,
    },
    reviewEvidence: {
      approvalState: "candidate",
      rulesetVersion: contract.rulesetVersion,
      semanticReviewIds: [],
      mathematicalReviewIds: [],
      sourceEvidenceIds: [
        contract.inputs.patternAuthority,
        contract.inputs.scenarioAuthority,
        pattern.patternSpecId,
        pattern.templateFamilyId,
        profile.scenarioProfileId,
        profile.scenarioId,
      ],
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
      semanticValidatorHooks: [pattern.semanticValidatorRef, ...semanticGuards],
      mathValidatorHooks: [
        `gctx_math_recompute_${patternSuffix}`,
        `gctx_math_verify_operation_${slug(pattern.equationShape)}`,
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
      allowedUnitIds: answerRole.allowedUnitIds,
      studentAnswerMayOmitUnit: false,
    },
    lifecycleStatus: "candidate",
    legacyAliases: sortedUnique([
      pattern.patternSpecId,
      pattern.templateFamilyId,
      pattern.semanticSignature,
      profile.scenarioProfileId,
      profile.scenarioId,
      profile.contextDomain,
      profile.semanticSignature,
      aliasValue(profile.ownershipModel),
      aliasValue(profile.unitFlowModel),
      profile.realismProfileRef,
    ]),
  };
}

function validateLegacyParity(binding, pattern, profile) {
  const errors = [];
  if (pattern.templateFamilyId !== profile.templateFamilyId) errors.push(issue("GCTX_P10_TEMPLATE_FAMILY_DRIFT", "templateFamilyId"));
  if (pattern.knowledgePointId !== profile.knowledgePointId) errors.push(issue("GCTX_P10_KNOWLEDGE_POINT_DRIFT", "knowledgePointId"));
  if (pattern.semanticSignature !== profile.semanticSignature) errors.push(issue("GCTX_P10_SEMANTIC_SIGNATURE_DRIFT", "semanticSignature"));
  if (pattern.equationShape !== profile.equationShape || binding.operationSignature !== pattern.equationShape) errors.push(issue("GCTX_P10_OPERATION_SIGNATURE_DRIFT", "operationSignature"));
  if (pattern.unknownRole !== profile.unknownRole) errors.push(issue("GCTX_P10_UNKNOWN_ROLE_DRIFT", "unknownRole"));
  if (JSON.stringify(pattern.quantityRoles) !== JSON.stringify(profile.quantityRoleBindings)) errors.push(issue("GCTX_P10_QUANTITY_BINDING_AUTHORITY_DRIFT", "quantityRoleBindings"));

  const extractedInputs = Object.fromEntries(binding.quantityRoles
    .filter((row) => row.roleKind === "given")
    .map((row) => [row.numericProfileRoleKey, row.semanticRole]));
  if (JSON.stringify(extractedInputs) !== JSON.stringify(pattern.quantityRoles)) errors.push(issue("GCTX_P10_EXTRACTED_QUANTITY_BINDING_DRIFT", "quantityRoles"));
  const target = binding.quantityRoles.find((row) => row.isQuestionTarget === true);
  if (!target || target.semanticRole !== slug(pattern.unknownRole) || target.roleKind !== "answer_target") errors.push(issue("GCTX_P10_QUESTION_TARGET_DRIFT", "quantityRoles"));

  const expectedGuards = pattern.requiredConstraints.map(guardId);
  if (!exactMembers(binding.compatibilityRules.semanticGuardIds, expectedGuards)) errors.push(issue("GCTX_P10_CONSTRAINT_GUARD_DRIFT", "compatibilityRules.semanticGuardIds"));
  if (!binding.validationContract.semanticValidatorHooks.includes(pattern.semanticValidatorRef)) errors.push(issue("GCTX_P10_VALIDATOR_REF_DRIFT", "validationContract.semanticValidatorHooks"));
  for (const requiredAlias of [
    profile.scenarioId,
    profile.contextDomain,
    profile.semanticSignature,
    aliasValue(profile.ownershipModel),
    aliasValue(profile.unitFlowModel),
    profile.realismProfileRef,
  ]) {
    if (!binding.legacyAliases.includes(requiredAlias)) errors.push(issue("GCTX_P10_LEGACY_ALIAS_MISSING", "legacyAliases", { requiredAlias }));
  }
  return { ok: errors.length === 0, errors };
}

export function loadGctxP10Contract() {
  return readJson(CONTRACT_PATH);
}

export function buildGctxP10RemainingExactBindings() {
  const contract = loadGctxP10Contract();
  const p08 = buildGctxP08BindingAdmissionManifest();
  const p09 = buildGctxP09ExactBindingPilot();
  const approvedRegistry = loadApprovedSemanticBindingRegistry();
  const errors = [];

  const admissions = p08.candidates.filter((row) => row.sourceId === contract.scope.sourceId);
  if (admissions.length !== contract.scope.combinedPatternSpecCount
    || admissions.some((row) => row.admissionClass !== "legacy_authority_normalization")) {
    errors.push(issue("GCTX_P10_P08_ADMISSION_SET_INVALID", "p08Admissions", { count: admissions.length }));
  }

  const patterns = listG3BU04SemanticPatternDefinitions();
  const patternIds = patterns.map((pattern) => pattern.patternSpecId);
  if (patterns.length !== contract.scope.combinedPatternSpecCount || new Set(patternIds).size !== patternIds.length) {
    errors.push(issue("GCTX_P10_PATTERN_AUTHORITY_COUNT_INVALID", "patterns", { count: patterns.length }));
  }

  const pilotPatternId = p09.pilotPatternSpecId;
  const newEntries = [];
  const validationRows = [];
  for (const pattern of patterns) {
    const profiles = listG3BU04ScenarioProfilesForFamily(pattern.templateFamilyId);
    if (!exactMembers(profiles.map((row) => row.contextDomain), pattern.contextDomains)) {
      errors.push(issue("GCTX_P10_PATTERN_DOMAIN_SET_DRIFT", pattern.patternSpecId));
    }
    if (pattern.patternSpecId === pilotPatternId) continue;
    for (const profile of profiles) {
      const binding = buildGenericBinding(pattern, profile, contract);
      const schemaValidation = validateP01CandidateBinding(binding);
      const parityValidation = validateLegacyParity(binding, pattern, profile);
      errors.push(...schemaValidation.errors.map((row) => ({ ...row, bindingId: binding.bindingId })));
      errors.push(...parityValidation.errors.map((row) => ({ ...row, bindingId: binding.bindingId })));
      newEntries.push(binding);
      validationRows.push({
        bindingId: binding.bindingId,
        patternSpecId: pattern.patternSpecId,
        contextDomain: profile.contextDomain,
        p01SchemaValid: schemaValidation.ok,
        legacyParityValid: parityValidation.ok,
        errors: [...schemaValidation.errors, ...parityValidation.errors],
      });
    }
  }

  const entries = [...p09.entries, ...newEntries].sort((left, right) => left.bindingId.localeCompare(right.bindingId));
  const allValidations = [
    ...p09.validations.map((row) => ({
      ...row,
      patternSpecId: pilotPatternId,
    })),
    ...validationRows,
  ];

  const identityFields = {
    bindingId: entries.map((row) => row.bindingId),
    semanticVariantId: entries.map((row) => row.semanticVariantId),
    languageVariantId: entries.flatMap((row) => row.languageVariantIds),
  };
  for (const [field, values] of Object.entries(identityFields)) {
    if (new Set(values).size !== values.length) errors.push(issue("GCTX_P10_DUPLICATE_ID", field));
  }

  const representedPatternIds = sortedUnique(entries.map((row) => row.patternSpecId));
  if (!exactMembers(representedPatternIds, patternIds)) errors.push(issue("GCTX_P10_PATTERN_COVERAGE_MISMATCH", "entries.patternSpecId"));
  if (newEntries.length !== contract.scope.remainingBindingCount) errors.push(issue("GCTX_P10_NEW_BINDING_COUNT_MISMATCH", "newEntries", { actual: newEntries.length }));
  if (entries.length !== contract.scope.combinedBindingCount) errors.push(issue("GCTX_P10_COMBINED_BINDING_COUNT_MISMATCH", "entries", { actual: entries.length }));

  const pilotEntriesInCombined = entries.filter((row) => row.patternSpecId === pilotPatternId).sort((a, b) => a.bindingId.localeCompare(b.bindingId));
  const expectedPilotEntries = [...p09.entries].sort((a, b) => a.bindingId.localeCompare(b.bindingId));
  if (JSON.stringify(pilotEntriesInCombined) !== JSON.stringify(expectedPilotEntries)) {
    errors.push(issue("GCTX_P10_P09_PILOT_BYTE_PARITY_FAILED", "pilotEntries"));
  }

  if (approvedRegistry.entries.length !== 0) errors.push(issue("GCTX_P10_FORMAL_APPROVED_REGISTRY_NOT_EMPTY", "approvedRegistry.entries"));
  const productionSelectableBindingCount = entries.filter((row) => row.lifecycleStatus === "approved"
    || row.reviewEvidence.approvalState === "approved").length;
  if (productionSelectableBindingCount !== 0) errors.push(issue("GCTX_P10_FALSE_PRODUCTION_SELECTION_CLAIM", "entries"));

  const schemaValidBindingCount = allValidations.filter((row) => row.p01SchemaValid).length;
  const legacyParityBindingCount = allValidations.filter((row) => row.legacyParityValid).length;
  const knowledgePointCount = new Set(entries.map((row) => row.knowledgePointId)).size;
  const contextDomainCount = new Set(allValidations.map((row) => row.contextDomain)).size;
  const summary = {
    patternSpecCount: representedPatternIds.length,
    bindingCount: entries.length,
    pilotBindingCount: p09.entries.length,
    newBindingCount: newEntries.length,
    knowledgePointCount,
    contextDomainCount,
    schemaValidBindingCount,
    legacyParityBindingCount,
    approvedRegistryEntryCount: approvedRegistry.entries.length,
    productionSelectableBindingCount,
    errorCount: errors.length,
    readyForP11ReferenceAdmission: errors.length === 0,
  };
  for (const [field, expected] of Object.entries(contract.acceptedSnapshot)) {
    if (field === "errorCount") continue;
    if (summary[field] !== expected) errors.push(issue("GCTX_P10_ACCEPTED_SNAPSHOT_MISMATCH", `summary.${field}`, { expected, actual: summary[field] }));
  }
  summary.errorCount = errors.length;
  summary.readyForP11ReferenceAdmission = errors.length === 0;

  const byPatternSpec = Object.fromEntries(patterns.map((pattern) => {
    const rows = entries.filter((entry) => entry.patternSpecId === pattern.patternSpecId);
    return [pattern.patternSpecId, {
      templateFamilyId: pattern.templateFamilyId,
      knowledgePointId: pattern.knowledgePointId,
      operationSignature: pattern.equationShape,
      unknownRole: pattern.unknownRole,
      bindingCount: rows.length,
      contextDomains: allValidations
        .filter((row) => row.patternSpecId === pattern.patternSpecId)
        .map((row) => row.contextDomain)
        .sort(),
    }];
  }));

  return clone({
    registryId: contract.candidateRegistry.registryId,
    schemaVersion: 1,
    rulesetVersion: contract.rulesetVersion,
    registryKind: contract.candidateRegistry.registryKind,
    task: contract.task,
    status: errors.length === 0 ? "accepted_for_p11_reference_admission" : "blocked",
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    entries,
    validations: allValidations,
    byPatternSpec,
    summary,
    formalApprovedRegistry: {
      path: contract.inputs.formalApprovedRegistry,
      entryCount: approvedRegistry.entries.length,
      changedByP10: false,
    },
    errors,
    scopeBoundary: {
      runtimeBehaviorChanged: false,
      formalApprovedRegistryChanged: false,
      productionSelectable: false,
      unitAuthorityDeletedOrRewritten: false,
      rendererChanged: false,
    },
    nextShortestStep: contract.nextTask,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stdout.write(`${JSON.stringify(buildGctxP10RemainingExactBindings(), null, 2)}\n`);
}
