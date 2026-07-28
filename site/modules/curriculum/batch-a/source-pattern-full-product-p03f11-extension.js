import { getBatchABrowserPatternDefinition as baseGetDefinition, getBatchAPatternSpecIdsForSource as baseGetPatternIds } from "./source-pattern-full-product-p03f10-extension.js";
import { G4B_U06_SOURCE_ID, G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, G4B_U06_NUMERIC_GROUP_ID, G4B_U06_APPLICATION_GROUP_ID, G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID } from "../registry/g4b-u06-one-decimal-times-integer-selector-projection.js";

export const P03F11_REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]);
export const P03F11_CONTEXT_AUTHORITY = Object.freeze({
  bindingCandidateId: "w02_bind_ps_g4b_u06_one_decimal_times_integer_product_application",
  itemCandidateId: "w02_item_ps_g4b_u06_one_decimal_times_integer_product_application",
  macroContextId: "gctx_macro_charity_cooperation",
  mesoSituationId: "gctx_meso_charity_donation",
  microScenarioId: "gctx_micro_donation_package_allocation",
  atomicEpisodeId: "gctx_episode_donation_package_allocation_direct_quantity",
  surfaceTemplateId: "tpl_fusion_charity_donation_direct_01",
  contextFamilyLabel: "公益捐贈物資包分配",
  place: "社區物資中心",
  actor: "志工團隊",
  decimalFactorUnit: "份／包",
  integerFactorUnit: "包",
  productUnit: "份",
  sourceAuthority: "POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization",
});

const common = { sourceId: G4B_U06_SOURCE_ID, operation: "decimal_multiplication", operationFamilyId: "decimal_multiplication", operationModelId: "op_g4b_u06_one_decimal_times_integer", knowledgePointId: G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, requestedUnknownRole: "product", givenRoles: Object.freeze(["decimalFactor", "integerFactor"]), answerType: "decimal", canonicalExpressions: Object.freeze(["product = decimalFactor * integerFactor"]), canonicalSkillIds: Object.freeze([G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID]), skillTags: Object.freeze(["decimal", "multiplication", "one_decimal", "integer_factor", G4B_U06_SOURCE_ID]), difficultyTags: Object.freeze(["exact_decimal_product", "scale_at_most_2", "full_product_w3_slice011"]), requiredCapabilityIds: P03F11_REQUIRED_CAPABILITY_IDS, sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1" };

export const G4B_U06_NUMERIC_PATTERN_DEFINITION = Object.freeze({ ...common, title: "一位小數乘整數｜數字題", kind: "g4bU06OneDecimalTimesIntegerNumeric", patternGroupId: G4B_U06_NUMERIC_GROUP_ID, patternSpecId: G4B_U06_NUMERIC_SPEC_ID, mode: "NUMERIC", questionMode: "numeric", applicationClassification: "APPLICATION_COMPATIBLE", globalContextRequired: false, numericDomain: Object.freeze({ decimalFactorScale: 1, integerFactorMin: 2, integerFactorMax: 9, nonnegative: true }) });
export const G4B_U06_APPLICATION_PATTERN_DEFINITION = Object.freeze({ ...common, title: "一位小數乘整數｜應用題", kind: "g4bU06OneDecimalTimesIntegerApplication", patternGroupId: G4B_U06_APPLICATION_GROUP_ID, patternSpecId: G4B_U06_APPLICATION_SPEC_ID, mode: "APPLICATION", questionMode: "application", applicationClassification: "APPLICATION_COMPATIBLE", globalContextRequired: true, contextAuthority: P03F11_CONTEXT_AUTHORITY, numericDomain: Object.freeze({ decimalFactorScale: 1, integerFactorMin: 2, integerFactorMax: 9, nonnegative: true }) });

export function getBatchABrowserPatternDefinition(id) { if (id === G4B_U06_NUMERIC_SPEC_ID) return G4B_U06_NUMERIC_PATTERN_DEFINITION; if (id === G4B_U06_APPLICATION_SPEC_ID) return G4B_U06_APPLICATION_PATTERN_DEFINITION; return baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) { return sourceId === G4B_U06_SOURCE_ID ? [G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID] : baseGetPatternIds(sourceId); }
export function validateP03F11PatternDefinitions() { const errors = []; for (const definition of [G4B_U06_NUMERIC_PATTERN_DEFINITION, G4B_U06_APPLICATION_PATTERN_DEFINITION]) { if (definition.knowledgePointId !== G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID) errors.push("P03F11_KP_BINDING_INVALID"); if (definition.requestedUnknownRole !== "product") errors.push("P03F11_UNKNOWN_ROLE_INVALID"); if (JSON.stringify(definition.givenRoles) !== JSON.stringify(["decimalFactor", "integerFactor"])) errors.push("P03F11_GIVEN_ROLE_PARITY_INVALID"); if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(P03F11_REQUIRED_CAPABILITY_IDS)) errors.push("P03F11_CAPABILITY_SET_INVALID"); } if (!G4B_U06_APPLICATION_PATTERN_DEFINITION.globalContextRequired || G4B_U06_NUMERIC_PATTERN_DEFINITION.globalContextRequired) errors.push("P03F11_CONTEXT_MODE_INVALID"); return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 2 }); }
