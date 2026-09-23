export const P07F16_TASK_ID="P07F_W7DirectProductVerticalSlice016Implementation";
export const G5B_U08_P07F16_SOURCE_ID="g5b_u08_5b08";
export const G5B_U08_P07F16_UNIT_CODE="5B-U08";
export const G5B_U08_P07F16_UNIT_TITLE="比率與百分率";
export const G5B_U08_P07F16_TARGET_KP_IDS=Object.freeze([
  "kp_g5b_u08_find_base_quantity_percent",
  "kp_g5b_u08_percent_discount_increase_application"
]);
export const G5B_U08_P07F16_FIND_BASE_KP_ID=G5B_U08_P07F16_TARGET_KP_IDS[0];
export const G5B_U08_P07F16_APPLICATION_KP_ID=G5B_U08_P07F16_TARGET_KP_IDS[1];
export const G5B_U08_P07F16_PREDECESSOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_g5b_u08_ratio_fraction_decimal_percent_conversion",
  "kp_g5b_u08_find_percentage_rate",
  "kp_g5b_u08_percentage_of_quantity"
]);
export const G5B_U08_P07F16_PROTECTED_FUTURE_KP_IDS=Object.freeze([]);
export const G5B_U08_P07F16_PREDECESSOR_KP_IDS_BY_KP=Object.freeze({
  [G5B_U08_P07F16_FIND_BASE_KP_ID]:Object.freeze(["kp_g5b_u08_find_percentage_rate","kp_g5b_u08_percentage_of_quantity"]),
  [G5B_U08_P07F16_APPLICATION_KP_ID]:Object.freeze(["kp_g5a_u08_mixed_operation_order","kp_g5b_u08_percentage_of_quantity"])
});
export const G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP=Object.freeze({
  [G5B_U08_P07F16_FIND_BASE_KP_ID]:Object.freeze([
    "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
    "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"
  ]),
  [G5B_U08_P07F16_APPLICATION_KP_ID]:Object.freeze([
    "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
    "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation",
    "cap_relation_model_binding","cap_word_problem_semantic_validation"
  ])
});
export const G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP=Object.freeze({
  [G5B_U08_P07F16_FIND_BASE_KP_ID]:Object.freeze([]),
  [G5B_U08_P07F16_APPLICATION_KP_ID]:Object.freeze(["cap_global_context_binding","cap_pbl_task_set_projection"])
});
export const G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP=Object.freeze({
  [G5B_U08_P07F16_FIND_BASE_KP_ID]:Object.freeze([]),
  [G5B_U08_P07F16_APPLICATION_KP_ID]:Object.freeze(["mod_application_semantics"])
});
export const G5B_U08_P07F16_INCLUDED_RELATIONS=Object.freeze([
  "FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
  "FORWARD_DISCOUNT_RETENTION_RATE_APPLICATION",
  "FORWARD_MARKUP_GROWTH_RATE_APPLICATION",
  "MARKUP_THEN_DISCOUNT_APPLICATION"
]);
const commonSpec=x=>Object.freeze({...x,sourceId:G5B_U08_P07F16_SOURCE_ID,questionMode:"numeric",representation:"text_application",
  q008ConversionReownershipAllowed:false,q013FindRateReownershipAllowed:false,q013PercentageQuantityReownershipAllowed:false,
  genericRatioApplicationReownershipAllowed:false,sugarWaterRatioAsCoreAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
export const G5B_U08_P07F16_PATTERN_GROUPS=Object.freeze([
  Object.freeze({patternGroupId:"pg_g5b_u08_find_base_quantity_percent",sourceId:G5B_U08_P07F16_SOURCE_ID,unitCode:G5B_U08_P07F16_UNIT_CODE,unitTitle:G5B_U08_P07F16_UNIT_TITLE,
    displayName:"由百分率反求基準量",primaryKnowledgePointId:G5B_U08_P07F16_FIND_BASE_KP_ID,knowledgePointIds:Object.freeze([G5B_U08_P07F16_FIND_BASE_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",representationTags:Object.freeze(["percent","comparison_quantity","base_quantity","reverse_relation","application"]),
    patternSpecIds:Object.freeze(["ps_g5b_u08_find_base_from_comparison_percent","ps_g5b_u08_find_base_source_broken_eggs"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null}),
  Object.freeze({patternGroupId:"pg_g5b_u08_percent_discount_increase_application",sourceId:G5B_U08_P07F16_SOURCE_ID,unitCode:G5B_U08_P07F16_UNIT_CODE,unitTitle:G5B_U08_P07F16_UNIT_TITLE,
    displayName:"折扣與增減百分率",primaryKnowledgePointId:G5B_U08_P07F16_APPLICATION_KP_ID,knowledgePointIds:Object.freeze([G5B_U08_P07F16_APPLICATION_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_application",representationTags:Object.freeze(["percent","discount","markup","retention_rate","growth_rate","application"]),
    patternSpecIds:Object.freeze(["ps_g5b_u08_discount_sale_price","ps_g5b_u08_markup_new_price","ps_g5b_u08_markup_then_discount"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null})
]);
export const G5B_U08_P07F16_PATTERN_SPECS=Object.freeze([
  commonSpec({patternSpecId:"ps_g5b_u08_find_base_from_comparison_percent",knowledgePointId:G5B_U08_P07F16_FIND_BASE_KP_ID,patternGroupId:"pg_g5b_u08_find_base_quantity_percent",
    patternFamilyId:"FIND_BASE_FROM_COMPARISON_PERCENT",relation:G5B_U08_P07F16_INCLUDED_RELATIONS[0],semanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    targetKind:"BASE_QUANTITY",answerDomain:"POSITIVE_INTEGER_QUANTITY",comparisonQuantityKnownRequired:true,percentRateKnownRequired:true,baseQuantityUnknownRequired:true,
    comparisonDividedByRateRequired:true,reconstructComparisonRequired:true,supplementaryEvidenceCarrier:false}),
  commonSpec({patternSpecId:"ps_g5b_u08_find_base_source_broken_eggs",knowledgePointId:G5B_U08_P07F16_FIND_BASE_KP_ID,patternGroupId:"pg_g5b_u08_find_base_quantity_percent",
    patternFamilyId:"SOURCE_BROKEN_EGGS_FIND_BASE",relation:G5B_U08_P07F16_INCLUDED_RELATIONS[0],semanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    targetKind:"BASE_QUANTITY",answerDomain:"POSITIVE_INTEGER_QUANTITY",comparisonQuantityKnownRequired:true,percentRateKnownRequired:true,baseQuantityUnknownRequired:true,
    comparisonDividedByRateRequired:true,reconstructComparisonRequired:true,supplementaryEvidenceCarrier:true}),
  commonSpec({patternSpecId:"ps_g5b_u08_discount_sale_price",knowledgePointId:G5B_U08_P07F16_APPLICATION_KP_ID,patternGroupId:"pg_g5b_u08_percent_discount_increase_application",
    patternFamilyId:"DISCOUNT_SALE_PRICE",relation:G5B_U08_P07F16_INCLUDED_RELATIONS[1],semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    targetKind:"DISCOUNTED_NEW_QUANTITY",answerDomain:"NONNEGATIVE_NUMBER",originalQuantityKnownRequired:true,percentRole:"DISCOUNT_RATE",retentionRateRequired:true,forwardOnly:true}),
  commonSpec({patternSpecId:"ps_g5b_u08_markup_new_price",knowledgePointId:G5B_U08_P07F16_APPLICATION_KP_ID,patternGroupId:"pg_g5b_u08_percent_discount_increase_application",
    patternFamilyId:"MARKUP_NEW_PRICE",relation:G5B_U08_P07F16_INCLUDED_RELATIONS[2],semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    targetKind:"INCREASED_NEW_QUANTITY",answerDomain:"NONNEGATIVE_NUMBER",originalQuantityKnownRequired:true,percentRole:"INCREASE_RATE",growthRateRequired:true,forwardOnly:true}),
  commonSpec({patternSpecId:"ps_g5b_u08_markup_then_discount",knowledgePointId:G5B_U08_P07F16_APPLICATION_KP_ID,patternGroupId:"pg_g5b_u08_percent_discount_increase_application",
    patternFamilyId:"MARKUP_THEN_DISCOUNT",relation:G5B_U08_P07F16_INCLUDED_RELATIONS[3],semanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    targetKind:"TWO_STEP_NEW_QUANTITY",answerDomain:"NONNEGATIVE_NUMBER",originalQuantityKnownRequired:true,percentRole:"MARKUP_THEN_DISCOUNT",growthRateRequired:true,retentionRateRequired:true,forwardOnly:true})
]);
export const G5B_U08_P07F16_SPEC_IDS=Object.freeze(G5B_U08_P07F16_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G5B_U08_P07F16_SPEC_IDS_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F16_TARGET_KP_IDS.map(kp=>[kp,Object.freeze(G5B_U08_P07F16_PATTERN_SPECS.filter(s=>s.knowledgePointId===kp).map(s=>s.patternSpecId))])));
const GROUP_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F16_PATTERN_GROUPS.map(g=>[g.primaryKnowledgePointId,g])));
export const G5B_U08_P07F16_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({mappingId:"fm_g5b_u08_find_base_quantity_percent_p07f16",sourceId:G5B_U08_P07F16_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),primarySourceDirectSupportingPages:Object.freeze([]),
    supplementaryEvidenceDriveFileId:"1grJyszUbRVBWShcWAoxqOjIeD_zQCKVj",supplementaryEvidencePage:1,supplementaryEvidenceSha256:"b58dd564626ae6295be2499a4f4b60801d39d81a5cf3decf369d3ee541ade780",
    knowledgePointId:G5B_U08_P07F16_FIND_BASE_KP_ID,canonicalNameZh:"由百分率反求基準量",capabilityStatement:"學生能以比較量除以百分率求基準量。",
    reasoningInvariant:"反求基準量後乘原百分率必須重建比較量。",sourceSemanticCore:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE",
    semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_DIRECT_SUPPLEMENTARY_GRADE5_EXAM_WITNESS",currentVisualSupportLevel:"SUPPLEMENTARY_DIRECT_LITERAL_APPLICATION",
    primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP[G5B_U08_P07F16_FIND_BASE_KP_ID],
    requiredCapabilityIds:G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP[G5B_U08_P07F16_FIND_BASE_KP_ID],optionalCapabilityIds:G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP[G5B_U08_P07F16_FIND_BASE_KP_ID],
    patternSpecIds:G5B_U08_P07F16_SPEC_IDS_BY_KP[G5B_U08_P07F16_FIND_BASE_KP_ID],requiredPrerequisiteKnowledgePointIds:G5B_U08_P07F16_PREDECESSOR_KP_IDS_BY_KP[G5B_U08_P07F16_FIND_BASE_KP_ID],
    comparisonDividedByRateRequired:true,reconstructComparisonRequired:true,discountOrMarkupReownershipAllowed:false,q013ForwardModelsReownershipAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false}),
  Object.freeze({mappingId:"fm_g5b_u08_percent_discount_increase_application_p07f16",sourceId:G5B_U08_P07F16_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),primarySourceDirectSupportingPages:Object.freeze([1,2]),
    knowledgePointId:G5B_U08_P07F16_APPLICATION_KP_ID,canonicalNameZh:"折扣與增減百分率",capabilityStatement:"學生能處理打折、加成、成長或減少問題。",
    reasoningInvariant:"新量等於原量乘保留率或成長率，百分率角色不可混淆。",sourceSemanticCore:"PERCENT_DISCOUNT_INCREASE_APPLICATION",
    semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_DISCOUNT_MARKUP_APPLICATION_EVIDENCE",currentVisualSupportLevel:"DIRECT_LITERAL_APPLICATION",
    primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:G5B_U08_P07F16_APPLIED_MODIFIER_IDS_BY_KP[G5B_U08_P07F16_APPLICATION_KP_ID],
    requiredCapabilityIds:G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP[G5B_U08_P07F16_APPLICATION_KP_ID],optionalCapabilityIds:G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP[G5B_U08_P07F16_APPLICATION_KP_ID],
    patternSpecIds:G5B_U08_P07F16_SPEC_IDS_BY_KP[G5B_U08_P07F16_APPLICATION_KP_ID],requiredPrerequisiteKnowledgePointIds:G5B_U08_P07F16_PREDECESSOR_KP_IDS_BY_KP[G5B_U08_P07F16_APPLICATION_KP_ID],
    discountRetentionRateRequired:true,markupGrowthRateRequired:true,markupThenDiscountAllowed:true,genericReverseBaseReownershipAllowed:false,q013ForwardModelSupportOnly:true,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false})
]);
const MAPPING_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F16_FORMAL_MAPPINGS.map(m=>[m.knowledgePointId,m])));
function selectorRow(kp){
  const g=GROUP_BY_KP[kp],m=MAPPING_BY_KP[kp],isFind=kp===G5B_U08_P07F16_FIND_BASE_KP_ID;
  return Object.freeze({knowledgePointId:kp,sourceId:G5B_U08_P07F16_SOURCE_ID,unitCode:G5B_U08_P07F16_UNIT_CODE,unitTitle:G5B_U08_P07F16_UNIT_TITLE,
    displayName:m.canonicalNameZh,canonicalNameZh:m.canonicalNameZh,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",
    visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:isFind?"SUPPLEMENTARY_DIRECT_APPLICATION_ADMITTED":"SOURCE_BACKED_APPLICATION_ADMITTED",
    canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:G5B_U08_P07F16_SPEC_IDS_BY_KP[kp],patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:G5B_U08_P07F16_SPEC_IDS_BY_KP[kp],
    requiredCapabilityIds:G5B_U08_P07F16_REQUIRED_CAPABILITY_IDS_BY_KP[kp],optionalCapabilityIds:G5B_U08_P07F16_OPTIONAL_CAPABILITY_IDS_BY_KP[kp],
    qaStatusLabel:isFind?"P07F16_G5B_U08_FIND_BASE_QUANTITY_PERCENT":"P07F16_G5B_U08_PERCENT_DISCOUNT_INCREASE_APPLICATION",productionUse:"full_product_w7_slice016_candidate"});
}
export const G5B_U08_P07F16_SELECTOR_ROWS=Object.freeze(G5B_U08_P07F16_TARGET_KP_IDS.map(selectorRow));
const ROW_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F16_SELECTOR_ROWS.map(r=>[r.knowledgePointId,r])));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5BU08P07F16SelectorRow=id=>ROW_BY_KP[id]?clone(ROW_BY_KP[id]):null;
export const listG5BU08P07F16PatternGroups=id=>GROUP_BY_KP[id]?[clone(GROUP_BY_KP[id])]:[];
export const resolveG5BU08P07F16PatternSpecIds=id=>clone(G5B_U08_P07F16_SPEC_IDS_BY_KP[id]??[]);
export const getG5BU08P07F16FormalMapping=id=>clone(MAPPING_BY_KP[id]??null);
export function auditG5BU08P07F16Projection(){
  const e=[];
  if(G5B_U08_P07F16_PATTERN_GROUPS.length!==2||G5B_U08_P07F16_PATTERN_SPECS.length!==5||G5B_U08_P07F16_FORMAL_MAPPINGS.length!==2)e.push("P07F16_CARDINALITY_INVALID");
  if(new Set(G5B_U08_P07F16_SPEC_IDS).size!==5)e.push("P07F16_PATTERN_SPEC_DUPLICATE");
  for(const s of G5B_U08_P07F16_PATTERN_SPECS){
    if(s.questionMode!=="numeric"||s.representation!=="text_application"||s.q008ConversionReownershipAllowed||s.q013FindRateReownershipAllowed||s.q013PercentageQuantityReownershipAllowed||s.genericRatioApplicationReownershipAllowed||s.sugarWaterRatioAsCoreAllowed||s.sameUnitMixedAllowed||s.crossUnitMixedAllowed)e.push("P07F16_PATTERN_SCOPE_INVALID:"+s.patternSpecId);
    if(s.knowledgePointId===G5B_U08_P07F16_FIND_BASE_KP_ID&&(!s.comparisonDividedByRateRequired||!s.reconstructComparisonRequired||s.semanticCore!=="FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE"))e.push("P07F16_FIND_BASE_PATTERN_INVALID:"+s.patternSpecId);
    if(s.knowledgePointId===G5B_U08_P07F16_APPLICATION_KP_ID&&(s.semanticCore!=="PERCENT_DISCOUNT_INCREASE_APPLICATION"||!s.forwardOnly))e.push("P07F16_APPLICATION_PATTERN_INVALID:"+s.patternSpecId);
  }
  for(const m of G5B_U08_P07F16_FORMAL_MAPPINGS){
    if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed)e.push("P07F16_MAPPING_SCOPE_INVALID:"+m.knowledgePointId);
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:5,formalMappings:2})});
}
