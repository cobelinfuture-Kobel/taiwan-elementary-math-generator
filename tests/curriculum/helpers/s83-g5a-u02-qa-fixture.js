import { readFile } from "node:fs/promises";

const url = (path) => new URL(`../../${path}`, import.meta.url);
const load = async (path) => JSON.parse(await readFile(url(path), "utf8"));
export const clone = (value) => structuredClone(value);

export async function loadS82() {
  const index = await load("data/curriculum/contracts/S82_G5A_U02_PatternSpecContractDesign.json");
  const [rules, answers, templates, groups, validator, ...specBundles] = await Promise.all([
    load(index.artifacts.rules),
    load(index.artifacts.answerSchemas),
    load(index.artifacts.templates),
    load(index.artifacts.patternGroups),
    load(index.artifacts.validator),
    ...index.artifacts.patternSpecs.map(load),
  ]);
  return {
    ...index,
    globalBoundary: rules.globalBoundary,
    formalRules: rules.formalRules,
    identifierRules: rules.identifierRules,
    inputContracts: rules.inputContracts,
    qaOverlayApplications: rules.qaOverlayApplications,
    answerModelSchemas: answers.answerModelSchemas,
    controlledTemplateFamilies: templates.controlledTemplateFamilies,
    patternGroups: groups.patternGroups,
    validatorContract: validator.validatorContract,
    patternSpecs: specBundles.flatMap((bundle) => bundle.patternSpecs).sort((a, b) => a.patternOrder - b.patternOrder),
  };
}

export async function loadS83() {
  const index = await load("data/curriculum/contracts/S83_G5A_U02_PatternSpecContractQA.json");
  const [answers, templates, semantic, validator] = await Promise.all([
    load(index.artifacts.answerSchemaOverlay),
    load(index.artifacts.templateSemanticOverlay),
    load(index.artifacts.semanticGrammarOverlay),
    load(index.artifacts.validatorCoverageOverlay),
  ]);
  return {
    ...index,
    effectiveContractOverlay: {
      consumptionRule: validator.consumptionRule,
      answerSchemaPolicy: answers.answerSchemaPolicy,
      controlledTemplateOverrides: templates.controlledTemplateOverrides,
      problemTypeDecisionTable: semantic.problemTypeDecisionTable,
      closedStatementGrammar: semantic.closedStatementGrammar,
      requiredHookAugmentations: semantic.requiredHookAugmentations,
      validatorCoverageByStage: validator.validatorCoverageByStage,
    },
    mutationRequirements: validator.mutationRequirements,
  };
}

function placeholders(prompt) {
  return [...new Set([...prompt.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]))].sort();
}

function exactSet(actual, expected) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

export function templateRoleBlocks(template) {
  return template.controlledVariants ?? [template];
}

export function effectiveHooks(spec, overlay) {
  return [...new Set([...spec.validatorHooks, ...(overlay.requiredHookAugmentations[spec.patternSpecId] ?? [])])];
}

export function qaErrors(s82, s83) {
  const errors = [];
  const overlay = s83.effectiveContractOverlay;

  if (s82.patternSpecs.length !== 22) errors.push("PATTERN_SPEC_COUNT");
  if (s82.patternGroups.length !== 18) errors.push("PATTERN_GROUP_COUNT");
  if (new Set(s82.patternSpecs.map((row) => row.patternSpecId)).size !== 22) errors.push("PATTERN_SPEC_ID_DUPLICATE");
  if (!exactSet(s82.patternGroups.flatMap((row) => row.patternSpecIds), s82.patternSpecs.map((row) => row.patternSpecId))) errors.push("PATTERN_GROUP_COVERAGE");

  const closedSchemas = overlay.answerSchemaPolicy.closedSchemas;
  if (overlay.answerSchemaPolicy.additionalProperties !== false) errors.push("ANSWER_SCHEMA_REGISTRY_OPEN");
  if (!exactSet(Object.keys(closedSchemas), Object.keys(s82.answerModelSchemas))) errors.push("ANSWER_SCHEMA_COVERAGE");
  for (const [name, schema] of Object.entries(closedSchemas)) {
    if (schema.type !== "object" || schema.additionalProperties !== false) errors.push(`ANSWER_SCHEMA_OPEN:${name}`);
    if (!Array.isArray(schema.required) || schema.required.length === 0) {
      errors.push(`ANSWER_SCHEMA_REQUIRED:${name}`);
      continue;
    }
    if (!schema.properties || typeof schema.properties !== "object") {
      errors.push(`ANSWER_SCHEMA_PROPERTIES:${name}`);
      continue;
    }
    for (const field of schema.required) if (!Object.hasOwn(schema.properties, field)) errors.push(`ANSWER_SCHEMA_PROPERTY_MISSING:${name}:${field}`);
  }

  const relation = closedSchemas.relationClassificationAnswer;
  if (!relation?.required?.includes("quotient")) errors.push("RELATION_QUOTIENT_REQUIRED");
  if (!relation?.properties?.quotient?.anyOf?.some((row) => row.type === "null")) errors.push("RELATION_QUOTIENT_NULLABLE");
  if (!relation?.conditionalWitness?.whenTrue?.includes("candidateDivisor*quotient===target")) errors.push("RELATION_TRUE_WITNESS");
  if (!relation?.conditionalWitness?.whenFalse?.includes("quotient===null")) errors.push("RELATION_FALSE_WITNESS");

  for (const name of ["integerListAnswer", "integerListWithUnitAnswer", "lengthListAnswer", "areaListAnswer"]) {
    if (closedSchemas[name]?.properties?.values?.completeSet !== true) errors.push(`LIST_COMPLETE:${name}`);
  }
  const pairRules = closedSchemas.factorPairListAnswer?.rules ?? [];
  if (!pairRules.includes("pair_product_equals_target")) errors.push("PAIR_PRODUCT_RULE");
  if (!pairRules.includes("complete_pair_set")) errors.push("PAIR_COMPLETE_RULE");
  if (closedSchemas.missingValueMapAnswer?.properties?.valuesByPosition?.additionalProperties?.type !== "integer") errors.push("MISSING_VALUE_MAP_CLOSED");
  if (!closedSchemas.booleanSetAnswer?.rules?.includes("values_length_equals_statement_count")) errors.push("BOOLEAN_VECTOR_ALIGNMENT");
  if (!exactSet(closedSchemas.areaListAnswer?.properties?.unitLabel?.enum ?? [], ["平方公分", "平方公尺"])) errors.push("AREA_UNIT_ENUM");
  if (closedSchemas.digitTupleAnswer?.properties?.digits?.uniqueItems !== true) errors.push("DIGIT_TUPLE_UNIQUE");
  if (!closedSchemas.digitTupleAnswer?.rules?.includes("value_encodes_digits_in_order")) errors.push("DIGIT_VALUE_ENCODING");

  const templates = overlay.controlledTemplateOverrides;
  const templateById = new Map(templates.map((row) => [row.templateFamilyId, row]));
  if (templates.length !== 8 || templateById.size !== 8) errors.push("TEMPLATE_COUNT");
  if (!exactSet(templates.map((row) => row.templateFamilyId), s82.controlledTemplateFamilies.map((row) => row.templateFamilyId))) errors.push("TEMPLATE_ID_COVERAGE");
  for (const template of templates) {
    const source = s82.controlledTemplateFamilies.find((row) => row.templateFamilyId === template.templateFamilyId);
    if (!source || source.mappingId !== template.mappingId) errors.push(`TEMPLATE_MAPPING:${template.templateFamilyId}`);
    for (const block of templateRoleBlocks(template)) {
      const roles = [...(block.requiredRoles ?? [])].sort();
      const promptRoles = placeholders(block.promptSkeletonZh ?? "");
      const bindingRoles = Object.keys(block.roleBindings ?? {}).sort();
      if (JSON.stringify(roles) !== JSON.stringify(promptRoles)) errors.push(`TEMPLATE_PLACEHOLDER_ROLE:${template.templateFamilyId}:${block.variantId ?? "default"}`);
      if (JSON.stringify(roles) !== JSON.stringify(bindingRoles)) errors.push(`TEMPLATE_BINDING_ROLE:${template.templateFamilyId}:${block.variantId ?? "default"}`);
      for (const binding of Object.values(block.roleBindings ?? {})) if (!/^(input|context|derived|fixed)\./.test(binding)) errors.push(`TEMPLATE_BINDING_SOURCE:${template.templateFamilyId}`);
    }
  }

  const partition = templateById.get("tpl_g5a_u02_equal_partition_segments");
  if (partition?.arbitraryAnswerRoleForbidden !== true) errors.push("PARTITION_FREE_ANSWER_ROLE");
  if (!exactSet(partition?.controlledVariants?.map((row) => row.variantId) ?? [], ["segment_count", "per_segment_quantity"])) errors.push("PARTITION_VARIANTS");
  for (const variant of partition?.controlledVariants ?? []) if (variant.promptSkeletonZh.includes("{answerRole}") || variant.requiredRoles.includes("answerRole")) errors.push(`PARTITION_ANSWER_ROLE:${variant.variantId}`);
  const segmentCount = partition?.controlledVariants?.find((row) => row.variantId === "segment_count");
  const perSegment = partition?.controlledVariants?.find((row) => row.variantId === "per_segment_quantity");
  if (segmentCount?.answerUnitPolicy?.fixed !== "段") errors.push("PARTITION_SEGMENT_UNIT");
  if (perSegment?.answerUnitPolicy?.fromContext !== "itemUnit") errors.push("PARTITION_LENGTH_UNIT");

  for (const templateId of ["tpl_g5a_u02_maximum_equal_grouping", "tpl_g5a_u02_possible_equal_packaging"]) {
    const template = templateById.get(templateId);
    if (template?.crossCategoryEqualityRequired !== false) errors.push(`CROSS_CATEGORY_EQUALITY:${templateId}`);
    if (!template?.promptSkeletonZh?.includes("第一類數量相同") || !template?.promptSkeletonZh?.includes("第二類數量也相同")) errors.push(`CATEGORY_SEMANTICS:${templateId}`);
  }
  const area = templateById.get("tpl_g5a_u02_square_tile_areas");
  if (JSON.stringify(area?.answerUnitPolicy?.derivedMap) !== JSON.stringify({"公分": "平方公分", "公尺": "平方公尺"})) errors.push("AREA_UNIT_DERIVATION");
  const password = templateById.get("tpl_g5a_u02_source_password");
  if (password?.arbitraryRuleParaphraseForbidden !== true || password?.fixedPredicateFamily !== "S81_DIGIT_CODE_POSITIONAL_PREDICATES_REQUIRED") errors.push("PASSWORD_FIXED_PREDICATES");
  if ((password?.requiredRoles ?? []).length !== 0) errors.push("PASSWORD_ARBITRARY_ROLES");
  const remainder = templateById.get("tpl_g5a_u02_remainder_transfer");
  if (!exactSet(Object.keys(remainder?.hiddenWitnessBindings ?? {}), ["quotient", "total"])) errors.push("REMAINDER_HIDDEN_WITNESS");

  const table = overlay.problemTypeDecisionTable;
  if (!exactSet(table.labels ?? [], ["factor", "multiple", "common_factor", "common_multiple"])) errors.push("PROBLEM_TYPE_LABELS");
  const caseLabels = table.cases?.map((row) => row.label) ?? [];
  if (!exactSet(caseLabels, table.labels ?? []) || new Set(caseLabels).size !== caseLabels.length) errors.push("PROBLEM_TYPE_CASE_COVERAGE");
  if (table.mutuallyExclusive !== true || table.exhaustiveForControlledCases !== true || table.freeFormClassificationForbidden !== true) errors.push("PROBLEM_TYPE_CLOSED");
  if (!table.ambiguityPolicy?.includes("more than one")) errors.push("PROBLEM_TYPE_AMBIGUITY");

  const grammar = overlay.closedStatementGrammar;
  if (!exactSet(grammar.factorStatementKinds?.map((row) => row.kind) ?? [], ["candidate_is_factor_of_target", "target_is_multiple_of_candidate"])) errors.push("FACTOR_STATEMENT_GRAMMAR");
  if (!exactSet(grammar.completeFactorStatementKinds ?? [], ["value_is_factor_of_target", "target_is_multiple_of_value", "symmetric_pair_product_equals_target", "target_is_even_iff_factor_two_present", "factor_count_is_odd_iff_target_is_perfect_square"])) errors.push("COMPLETE_FACTOR_STATEMENT_GRAMMAR");
  if (grammar.relationDirectionMustBeExplicit !== true) errors.push("STATEMENT_DIRECTION");
  if (grammar.targetParityAndFactorCountParitySeparated !== true) errors.push("PARITY_SEPARATION");
  if (grammar.booleanVectorOrderMatchesStatementOrder !== true || grammar.booleanVectorLengthEqualsStatementCount !== true) errors.push("STATEMENT_VECTOR_ALIGNMENT");
  if (grammar.unknownStatementKindsForbidden !== true) errors.push("UNKNOWN_STATEMENT_ALLOWED");

  const stageRows = overlay.validatorCoverageByStage;
  if (stageRows.length !== 9 || JSON.stringify(stageRows.map((row) => row.stage)) !== JSON.stringify([1,2,3,4,5,6,7,8,9])) errors.push("VALIDATOR_STAGE_COUNT_ORDER");
  const coveredCodes = stageRows.flatMap((row) => row.blockingCodes);
  if (new Set(coveredCodes).size !== coveredCodes.length) errors.push("VALIDATOR_CODE_DUPLICATE");
  if (!exactSet(coveredCodes, s82.validatorContract.blockingCodes)) errors.push("VALIDATOR_CODE_COVERAGE");
  const stageHooks = new Set(stageRows.flatMap((row) => row.hooks));
  for (const stage of stageRows) if (!stage.name || stage.hooks.length === 0 || stage.blockingCodes.length === 0) errors.push(`VALIDATOR_STAGE_EMPTY:${stage.stage}`);
  for (const sourceStage of s82.validatorContract.stages) for (const hook of sourceStage.hooks) if (!stageHooks.has(hook)) errors.push(`VALIDATOR_BASE_HOOK_MISSING:${hook}`);
  for (const spec of s82.patternSpecs) {
    for (const hook of effectiveHooks(spec, overlay)) if (!stageHooks.has(hook)) errors.push(`VALIDATOR_SPEC_HOOK_MISSING:${spec.patternSpecId}:${hook}`);
    if (spec.qaOverlayRefs.length > 0) {
      const additions = overlay.requiredHookAugmentations[spec.patternSpecId] ?? [];
      if (!additions.includes("validateG5AU02S81Overlay")) errors.push(`S81_HOOK_AUGMENTATION:${spec.patternSpecId}`);
    }
  }
  for (const [patternSpecId, hooks] of Object.entries(overlay.requiredHookAugmentations)) {
    if (!s82.patternSpecs.some((row) => row.patternSpecId === patternSpecId)) errors.push(`HOOK_AUGMENTATION_UNKNOWN_SPEC:${patternSpecId}`);
    for (const hook of hooks) if (!stageHooks.has(hook)) errors.push(`HOOK_AUGMENTATION_UNKNOWN_HOOK:${patternSpecId}:${hook}`);
  }

  if (s83.mutationRequirements.length !== 36) errors.push("MUTATION_COUNT");
  if (new Set(s83.mutationRequirements.map((row) => row.caseId)).size !== 36) errors.push("MUTATION_ID_DUPLICATE");
  if (s83.mutationRequirements.some((row) => row.mustBlock !== true)) errors.push("MUTATION_NOT_BLOCKING");
  if (s83.scopeBoundary.formalMappingMaterialized !== false || s83.scopeBoundary.patternSpecsMaterialized !== false || s83.scopeBoundary.generatorImplemented !== false || s83.scopeBoundary.validatorImplemented !== false || s83.scopeBoundary.publicSelectorEnabled !== false || s83.scopeBoundary.canonicalRoutingEnabled !== false || s83.scopeBoundary.productionUse !== "forbidden") errors.push("SCOPE_LEAK");
  if (s83.handoff.nextTask !== "S84_G5A_U02_FormalMappingAndHiddenPatternSpecMaterialization" || s83.handoff.materializationAllowedByS83 !== false) errors.push("HANDOFF");
  return errors;
}

export const factorSet = (n) => Array.from({ length: n }, (_, index) => index + 1).filter((d) => n % d === 0);

export function factorPairs(n) {
  const pairs = [];
  for (let a = 1; a <= Math.floor(Math.sqrt(n)); a += 1) if (n % a === 0) pairs.push([a, n / a]);
  return pairs;
}

export function digitCodeSolutions() {
  const divides = (n, d) => d > 0 && n % d === 0;
  const values = [];
  for (let x1 = 1; x1 <= 9; x1 += 1)
    for (let x2 = 1; x2 <= 9; x2 += 1)
      for (let x3 = 0; x3 <= 9; x3 += 1)
        for (let x4 = 1; x4 <= 9; x4 += 1) {
          if (![22, 33, 45, 60].every((n) => divides(n, x1))) continue;
          if (!(divides(6, x3) && divides(8, x3) && x3 !== x1)) continue;
          if (!(divides(70, x2) && divides(70, x4))) continue;
          const value = 1000 * x1 + 100 * x2 + 10 * x3 + x4;
          if (value % 3 || value % 5) continue;
          if (new Set([x1, x2, x3, x4]).size !== 4) continue;
          values.push([x1, x2, x3, x4]);
        }
  return values;
}
