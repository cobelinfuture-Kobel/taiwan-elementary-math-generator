import {G6A_U02_SOURCE_ID,G6A_U02_UNIT_CODE,G6A_U02_UNIT_TITLE} from "./g6a-u02-reciprocal-selector-projection.js";

export const P04F37_TASK_ID="P04F37_Q037_SourceBackedApplicationImplementation";
export const G6A_U02_P04F37_SOURCE_ID=G6A_U02_SOURCE_ID;
export const G6A_U02_P04F37_KP_ID="kp_g6a_u02_fraction_division_application";
export const G6A_U02_P04F37_GROUP_ID="pg_g6a_u02_fraction_division_application";
export const G6A_U02_P04F37_SPEC_IDS=Object.freeze([
  "ps_g6a_u02_fraction_division_quotative_application",
  "ps_g6a_u02_fraction_division_partitive_application",
]);
export const G6A_U02_P04F37_FUTURE_KP_IDS=Object.freeze([]);

export const G6A_U02_P04F37_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:G6A_U02_P04F37_SPEC_IDS[0],knowledgePointId:G6A_U02_P04F37_KP_ID,patternFamilyId:"FRACTION_DIVISION_APPLICATION_RELATION",semanticRelation:"QUOTATIVE_DIVISION",relationVariantId:"QUOTATIVE_DIVISION_GROUP_COUNT",knownRoleIds:Object.freeze(["TOTAL_QUANTITY","PER_GROUP_QUANTITY"]),targetRoleId:"GROUP_COUNT",targetRoleMode:"FIXED",questionMode:"application",answerModel:"exact_integer_group_count_with_unit",divisionRelationMustReconstructTotal:true,exactRationalArithmeticRequired:true,equivalentFractionReductionAllowed:true,roundingAllowed:false,sourceEvidenceTopic:"分數除法應用－包含除"}),
  Object.freeze({patternSpecId:G6A_U02_P04F37_SPEC_IDS[1],knowledgePointId:G6A_U02_P04F37_KP_ID,patternFamilyId:"FRACTION_DIVISION_APPLICATION_RELATION",semanticRelation:"PARTITIVE_DIVISION",relationVariantId:"PARTITIVE_DIVISION_PER_GROUP",knownRoleIds:Object.freeze(["TOTAL_QUANTITY","GROUP_COUNT"]),targetRoleId:"PER_GROUP_QUANTITY",targetRoleMode:"FIXED",questionMode:"application",answerModel:"exact_reduced_fraction_quantity_with_unit",divisionRelationMustReconstructTotal:true,exactRationalArithmeticRequired:true,equivalentFractionReductionAllowed:true,roundingAllowed:false,sourceEvidenceTopic:"分數除法應用－等分除"}),
]);

export const G6A_U02_P04F37_PATTERN_GROUPS=Object.freeze([Object.freeze({patternGroupId:G6A_U02_P04F37_GROUP_ID,sourceId:G6A_U02_P04F37_SOURCE_ID,unitCode:G6A_U02_UNIT_CODE,unitTitle:G6A_U02_UNIT_TITLE,displayName:"分數除法包含除與等分除",primaryKnowledgePointId:G6A_U02_P04F37_KP_ID,knowledgePointIds:Object.freeze([G6A_U02_P04F37_KP_ID]),supportClass:"A",mode:"application",publicQuestionMode:"application",representationTag:"fraction_division_application",representationTags:Object.freeze(["application","fraction","division","quotative","partitive","exact_rational"]),patternSpecIds:G6A_U02_P04F37_SPEC_IDS,allocationPolicy:"balanced_relation_variants",visibilityStatus:"visible",holdReason:null})]);

export const G6A_U02_P04F37_SELECTOR_ROWS=Object.freeze([Object.freeze({knowledgePointId:G6A_U02_P04F37_KP_ID,sourceId:G6A_U02_P04F37_SOURCE_ID,unitCode:G6A_U02_UNIT_CODE,unitTitle:G6A_U02_UNIT_TITLE,displayName:"分數除法包含除與等分除",canonicalNameZh:"分數除法包含除與等分除",mode:"application",questionMode:"application",questionModes:Object.freeze(["application"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_REQUIRED",canonicalPatternGroupIds:Object.freeze([G6A_U02_P04F37_GROUP_ID]),canonicalPatternSpecIds:G6A_U02_P04F37_SPEC_IDS,patternGroupIds:Object.freeze([G6A_U02_P04F37_GROUP_ID]),patternSpecIds:G6A_U02_P04F37_SPEC_IDS,requiredCapabilityIds:Object.freeze(["cap_fraction_number_system","cap_fraction_domain_validator","cap_fraction_arithmetic","cap_quantity_semantic_roles"]),qaStatusLabel:"P04F37_Q037_SOURCE_BACKED_APPLICATION",productionUse:"full_product_w4_slice037_candidate"})]);

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function listG6AU02P04F37SelectorRows(){return clone(G6A_U02_P04F37_SELECTOR_ROWS);}
export function getG6AU02P04F37SelectorRow(id){return clone(id===G6A_U02_P04F37_KP_ID?G6A_U02_P04F37_SELECTOR_ROWS[0]:null);}
export function listG6AU02P04F37PatternGroups(id){return clone(id===G6A_U02_P04F37_KP_ID?G6A_U02_P04F37_PATTERN_GROUPS:[]);}
export function resolveG6AU02P04F37PatternSpecIds(id){return clone(id===G6A_U02_P04F37_KP_ID?G6A_U02_P04F37_SPEC_IDS:[]);}
export function auditG6AU02P04F37SelectorProjection(){const errors=[],specs=G6A_U02_P04F37_PATTERN_SPECS;if(G6A_U02_P04F37_SELECTOR_ROWS.length!==1||G6A_U02_P04F37_PATTERN_GROUPS.length!==1||specs.length!==2)errors.push("P04F37_CARDINALITY_INVALID");if(specs[0]?.semanticRelation!=="QUOTATIVE_DIVISION"||specs[0]?.knownRoleIds.join("|")!=="TOTAL_QUANTITY|PER_GROUP_QUANTITY"||specs[0]?.targetRoleId!=="GROUP_COUNT")errors.push("P04F37_QUOTATIVE_MAPPING_INVALID");if(specs[1]?.semanticRelation!=="PARTITIVE_DIVISION"||specs[1]?.knownRoleIds.join("|")!=="TOTAL_QUANTITY|GROUP_COUNT"||specs[1]?.targetRoleId!=="PER_GROUP_QUANTITY")errors.push("P04F37_PARTITIVE_MAPPING_INVALID");if(specs.some(spec=>spec.divisionRelationMustReconstructTotal!==true||spec.exactRationalArithmeticRequired!==true||spec.roundingAllowed!==false))errors.push("P04F37_INVARIANT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2,numeric:0,application:2})});}
