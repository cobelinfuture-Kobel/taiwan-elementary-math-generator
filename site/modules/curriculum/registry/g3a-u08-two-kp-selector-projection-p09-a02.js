export const P09_A02_TASK_ID="P09_UI_A02_G3AU08_WholeAsFraction_And_UnlikeDenominatorComparisonLimit_TwoKPProductAdmission";
export const G3A_U08_P09_A02_SOURCE_ID="g3a_u08_3a08";
export const G3A_U08_P09_A02_WHOLE_KP_ID="kp_g3a_u08_whole_as_fraction";
export const G3A_U08_P09_A02_UNLIKE_KP_ID="kp_g3a_u08_unlike_denominator_comparison_limit";
export const G3A_U08_P09_A02_TARGET_KP_IDS=Object.freeze([G3A_U08_P09_A02_WHOLE_KP_ID,G3A_U08_P09_A02_UNLIKE_KP_ID]);

export const G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID="ps_g3a_u08_whole_as_fraction_complete_numeric";
export const G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID="ps_g3a_u08_whole_as_fraction_recognize_numeric";
export const G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID="ps_g3a_u08_unlike_denominator_method_check_numeric";
export const G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID="ps_g3a_u08_unlike_denominator_reason_check_numeric";
export const G3A_U08_P09_A02_SPEC_IDS=Object.freeze([
  G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID,
  G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID,
  G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID,
  G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID
]);

export const G3A_U08_P09_A02_WHOLE_GROUP_ID="pg_g3a_u08_whole_as_fraction_numeric";
export const G3A_U08_P09_A02_UNLIKE_GROUP_ID="pg_g3a_u08_unlike_denominator_comparison_limit_numeric";

const FRACTION_CAPS=Object.freeze(["cap_fraction_number_system","cap_fraction_domain_validator","cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer"]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

export const G3A_U08_P09_A02_PATTERN_SPECS=Object.freeze([
  Object.freeze({patternSpecId:G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID,knowledgePointId:G3A_U08_P09_A02_WHOLE_KP_ID,patternFamilyId:"WHOLE_AS_FRACTION",semanticRelation:"WHOLE_AS_EQUAL_NUMERATOR_DENOMINATOR_FRACTION",questionMode:"numeric",answerModel:"exact_integer",denominatorPositive:true,numeratorEqualsDenominator:true,applicationContextAllowed:false}),
  Object.freeze({patternSpecId:G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID,knowledgePointId:G3A_U08_P09_A02_WHOLE_KP_ID,patternFamilyId:"WHOLE_AS_FRACTION",semanticRelation:"WHOLE_AS_EQUAL_NUMERATOR_DENOMINATOR_FRACTION",questionMode:"numeric",answerModel:"exact_integer_one",denominatorPositive:true,numeratorEqualsDenominator:true,applicationContextAllowed:false}),
  Object.freeze({patternSpecId:G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID,knowledgePointId:G3A_U08_P09_A02_UNLIKE_KP_ID,patternFamilyId:"UNLIKE_DENOMINATOR_COMPARISON_LIMIT",semanticRelation:"UNLIKE_DENOMINATOR_NUMERATOR_ONLY_METHOD_INVALID",questionMode:"numeric",answerModel:"method_invalid",actualFractionRelationRequired:false,applicationContextAllowed:false}),
  Object.freeze({patternSpecId:G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID,knowledgePointId:G3A_U08_P09_A02_UNLIKE_KP_ID,patternFamilyId:"UNLIKE_DENOMINATOR_COMPARISON_LIMIT",semanticRelation:"UNLIKE_DENOMINATOR_NUMERATOR_ONLY_METHOD_INVALID",questionMode:"numeric",answerModel:"method_invalid_with_reason",actualFractionRelationRequired:false,applicationContextAllowed:false})
]);

const group=(id,name,kp,specIds,tag)=>Object.freeze({patternGroupId:id,sourceId:G3A_U08_P09_A02_SOURCE_ID,unitCode:"3A-U08",unitTitle:"分數",displayName:name,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:tag,representationTags:Object.freeze(["numeric","fraction","concept_boundary"]),patternSpecIds:Object.freeze(specIds),allocationPolicy:"deterministic_even_pattern_spec_allocation",visibilityStatus:"visible",holdReason:null});
export const G3A_U08_P09_A02_PATTERN_GROUPS=Object.freeze([
  group(G3A_U08_P09_A02_WHOLE_GROUP_ID,"整體等於分母分之分母",G3A_U08_P09_A02_WHOLE_KP_ID,[G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID,G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID],"whole_as_fraction"),
  group(G3A_U08_P09_A02_UNLIKE_GROUP_ID,"異分母比較限制",G3A_U08_P09_A02_UNLIKE_KP_ID,[G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID,G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID],"unlike_denominator_method_limit")
]);

const row=(kp,name,groupId,specIds)=>Object.freeze({knowledgePointId:kp,sourceId:G3A_U08_P09_A02_SOURCE_ID,unitCode:"3A-U08",unitTitle:"分數",displayName:name,canonicalNameZh:name,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_NOT_APPLICABLE",canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:Object.freeze(specIds),patternGroupIds:Object.freeze([groupId]),patternSpecIds:Object.freeze(specIds),requiredCapabilityIds:FRACTION_CAPS,qaStatusLabel:"P09_A02_G3A_U08_TWO_KP_PRODUCT_ADMISSION",productionUse:"p09_ui_a02_public_single_kp_product_admitted"});
export const G3A_U08_P09_A02_SELECTOR_ROWS=Object.freeze([
  row(G3A_U08_P09_A02_WHOLE_KP_ID,"整體等於分母分之分母",G3A_U08_P09_A02_WHOLE_GROUP_ID,[G3A_U08_P09_A02_WHOLE_COMPLETE_SPEC_ID,G3A_U08_P09_A02_WHOLE_RECOGNIZE_SPEC_ID]),
  row(G3A_U08_P09_A02_UNLIKE_KP_ID,"異分母比較限制",G3A_U08_P09_A02_UNLIKE_GROUP_ID,[G3A_U08_P09_A02_UNLIKE_METHOD_SPEC_ID,G3A_U08_P09_A02_UNLIKE_REASON_SPEC_ID])
]);

export function listG3AU08P09A02SelectorRows(){return G3A_U08_P09_A02_SELECTOR_ROWS.map(clone);}
export function getG3AU08P09A02SelectorRow(id){return clone(G3A_U08_P09_A02_SELECTOR_ROWS.find(row=>row.knowledgePointId===id)??null);}
export function listG3AU08P09A02PatternGroups(id){return G3A_U08_P09_A02_PATTERN_GROUPS.filter(group=>group.primaryKnowledgePointId===id).map(clone);}
export function resolveG3AU08P09A02PatternSpecIds(id){const row=G3A_U08_P09_A02_SELECTOR_ROWS.find(candidate=>candidate.knowledgePointId===id);return row?[...row.patternSpecIds]:[];}
export function getG3AU08P09A02PatternSpec(id){return clone(G3A_U08_P09_A02_PATTERN_SPECS.find(spec=>spec.patternSpecId===id)??null);}
export function auditG3AU08P09A02SelectorProjection(){
  const errors=[];
  if(G3A_U08_P09_A02_SELECTOR_ROWS.length!==2||G3A_U08_P09_A02_PATTERN_GROUPS.length!==2||G3A_U08_P09_A02_PATTERN_SPECS.length!==4)errors.push("P09_A02_CARDINALITY_INVALID");
  if(G3A_U08_P09_A02_PATTERN_SPECS.some(spec=>spec.questionMode!=="numeric"||spec.applicationContextAllowed!==false))errors.push("P09_A02_SCOPE_INVALID");
  if(G3A_U08_P09_A02_PATTERN_SPECS.filter(spec=>spec.knowledgePointId===G3A_U08_P09_A02_UNLIKE_KP_ID).some(spec=>spec.actualFractionRelationRequired!==false))errors.push("P09_A02_UNLIKE_SCOPE_EXPANDED");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:4})});
}
