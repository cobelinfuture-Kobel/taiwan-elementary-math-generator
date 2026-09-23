export const P07F13_TASK_ID="P07F_W7DirectProductVerticalSlice013Implementation";
export const G5B_U08_P07F13_SOURCE_ID="g5b_u08_5b08";
export const G5B_U08_P07F13_UNIT_CODE="5B-U08";
export const G5B_U08_P07F13_UNIT_TITLE="比率與百分率";
export const G5B_U08_P07F13_KP_IDS=Object.freeze([
  "kp_g5b_u08_find_percentage_rate",
  "kp_g5b_u08_percentage_of_quantity"
]);
export const G5B_U08_P07F13_RATE_KP_ID=G5B_U08_P07F13_KP_IDS[0];
export const G5B_U08_P07F13_QUANTITY_KP_ID=G5B_U08_P07F13_KP_IDS[1];
export const G5B_U08_P07F13_PREDECESSOR_KP_IDS_BY_KP=Object.freeze({
  [G5B_U08_P07F13_RATE_KP_ID]:Object.freeze(["kp_g5b_u08_ratio_fraction_decimal_percent_conversion"]),
  [G5B_U08_P07F13_QUANTITY_KP_ID]:Object.freeze(["kp_g5b_u02_fraction_of_quantity","kp_g5b_u08_ratio_fraction_decimal_percent_conversion"])
});
export const G5B_U08_P07F13_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_g5b_u08_find_base_quantity_percent",
  "kp_g5b_u08_percent_discount_increase_application"
]);
export const G5B_U08_P07F13_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G5B_U08_P07F13_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly",
  "cap_answer_key_projection","cap_html_print_renderer","cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G5B_U08_P07F13_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G5B_U08_P07F13_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G5B_U08_P07F13_INCLUDED_RELATIONS=Object.freeze([
  "FIND_PERCENTAGE_RATE_FROM_COMPARISON_AND_BASE_QUANTITIES",
  "PERCENTAGE_OF_BASE_QUANTITY",
  "SOURCE_BACKED_ERROR_RATE_APPLICATION",
  "SOURCE_BACKED_UPDATED_SHOOTING_RATE_APPLICATION",
  "SOURCE_BACKED_CORRECT_QUANTITY_FROM_ERROR_RATE_APPLICATION"
]);

const commonSpec=(x)=>Object.freeze({
  ...x,
  sourceId:G5B_U08_P07F13_SOURCE_ID,
  questionMode:"numeric",
  representation:"text_application",
  baseQuantityRoleRequired:true,
  q008RepresentationConversionTeachingReownershipAllowed:false,
  q016FindBaseQuantityAllowed:false,
  q016DiscountIncreaseApplicationAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
});

export const G5B_U08_P07F13_PATTERN_GROUPS=Object.freeze([
  Object.freeze({
    patternGroupId:"pg_g5b_u08_find_percentage_rate",
    sourceId:G5B_U08_P07F13_SOURCE_ID,
    unitCode:G5B_U08_P07F13_UNIT_CODE,
    unitTitle:G5B_U08_P07F13_UNIT_TITLE,
    displayName:"由兩量求百分率",
    primaryKnowledgePointId:G5B_U08_P07F13_RATE_KP_ID,
    knowledgePointIds:Object.freeze([G5B_U08_P07F13_RATE_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
    representationTag:"text_application",
    representationTags:Object.freeze(["ratio","percent","rate","base_quantity","comparison_quantity","application"]),
    patternSpecIds:Object.freeze([
      "ps_g5b_u08_rate_from_comparison_base",
      "ps_g5b_u08_error_rate_from_correct_wrong",
      "ps_g5b_u08_updated_shooting_rate"
    ]),
    allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
  }),
  Object.freeze({
    patternGroupId:"pg_g5b_u08_percentage_of_quantity",
    sourceId:G5B_U08_P07F13_SOURCE_ID,
    unitCode:G5B_U08_P07F13_UNIT_CODE,
    unitTitle:G5B_U08_P07F13_UNIT_TITLE,
    displayName:"求百分率對應量",
    primaryKnowledgePointId:G5B_U08_P07F13_QUANTITY_KP_ID,
    knowledgePointIds:Object.freeze([G5B_U08_P07F13_QUANTITY_KP_ID]),
    supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
    representationTag:"text_application",
    representationTags:Object.freeze(["ratio","percent","part_quantity","base_quantity","application"]),
    patternSpecIds:Object.freeze([
      "ps_g5b_u08_percentage_of_base_quantity",
      "ps_g5b_u08_correct_quantity_from_error_rate",
      "ps_g5b_u08_reconstruct_made_quantity"
    ]),
    allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
  })
]);

const GROUP_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F13_PATTERN_GROUPS.map(g=>[g.primaryKnowledgePointId,g])));
export const G5B_U08_P07F13_PATTERN_SPECS=Object.freeze([
  commonSpec({
    patternSpecId:"ps_g5b_u08_rate_from_comparison_base",
    knowledgePointId:G5B_U08_P07F13_RATE_KP_ID,
    patternGroupId:"pg_g5b_u08_find_percentage_rate",
    patternFamilyId:"RATE_FROM_COMPARISON_BASE",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[0],
    semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    targetKind:"PERCENTAGE_RATE",
    answerDomain:"PERCENT",
    comparisonQuantityRoleRequired:true,denominatorMustBeBaseQuantity:true,
    reconstructComparisonQuantityFromPriorRateWhenNeeded:false,
    percentageOfQuantitySupportStepAllowed:false,
    sourceBackedApplicationContextAllowed:true
  }),
  commonSpec({
    patternSpecId:"ps_g5b_u08_error_rate_from_correct_wrong",
    knowledgePointId:G5B_U08_P07F13_RATE_KP_ID,
    patternGroupId:"pg_g5b_u08_find_percentage_rate",
    patternFamilyId:"ERROR_RATE_FROM_CORRECT_WRONG",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[2],
    semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    targetKind:"ERROR_RATE_PERCENT",
    answerDomain:"PERCENT",
    comparisonQuantityRoleRequired:true,denominatorMustBeBaseQuantity:true,
    reconstructComparisonQuantityFromPriorRateWhenNeeded:false,
    percentageOfQuantitySupportStepAllowed:false,
    sourceBackedApplicationContextAllowed:true
  }),
  commonSpec({
    patternSpecId:"ps_g5b_u08_updated_shooting_rate",
    knowledgePointId:G5B_U08_P07F13_RATE_KP_ID,
    patternGroupId:"pg_g5b_u08_find_percentage_rate",
    patternFamilyId:"UPDATED_SHOOTING_RATE",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[3],
    semanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    targetKind:"UPDATED_RATE_PERCENT",
    answerDomain:"PERCENT",
    comparisonQuantityRoleRequired:true,denominatorMustBeBaseQuantity:true,
    reconstructComparisonQuantityFromPriorRateWhenNeeded:true,
    percentageOfQuantitySupportStepAllowed:true,
    sourceBackedApplicationContextAllowed:true
  }),
  commonSpec({
    patternSpecId:"ps_g5b_u08_percentage_of_base_quantity",
    knowledgePointId:G5B_U08_P07F13_QUANTITY_KP_ID,
    patternGroupId:"pg_g5b_u08_percentage_of_quantity",
    patternFamilyId:"PERCENTAGE_OF_BASE_QUANTITY",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[1],
    semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    targetKind:"COMPARISON_QUANTITY",
    answerDomain:"NONNEGATIVE_INTEGER_QUANTITY",
    percentageRateRoleRequired:true,comparisonQuantityEqualsBaseTimesRateRequired:true,
    complementQuestionAllowedWhenDirectPercentQuantityStepIsExplicit:false,
    reconstructComparisonQuantityForMultiStepRateUpdateAllowed:false,
    findPercentageRateSupportStepAllowed:false,
    sourceBackedApplicationContextAllowed:true
  }),
  commonSpec({
    patternSpecId:"ps_g5b_u08_correct_quantity_from_error_rate",
    knowledgePointId:G5B_U08_P07F13_QUANTITY_KP_ID,
    patternGroupId:"pg_g5b_u08_percentage_of_quantity",
    patternFamilyId:"CORRECT_QUANTITY_FROM_ERROR_RATE",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[4],
    semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    targetKind:"COMPLEMENT_QUANTITY",
    answerDomain:"NONNEGATIVE_INTEGER_QUANTITY",
    percentageRateRoleRequired:true,comparisonQuantityEqualsBaseTimesRateRequired:true,
    complementQuestionAllowedWhenDirectPercentQuantityStepIsExplicit:true,
    reconstructComparisonQuantityForMultiStepRateUpdateAllowed:false,
    findPercentageRateSupportStepAllowed:false,
    sourceBackedApplicationContextAllowed:true
  }),
  commonSpec({
    patternSpecId:"ps_g5b_u08_reconstruct_made_quantity",
    knowledgePointId:G5B_U08_P07F13_QUANTITY_KP_ID,
    patternGroupId:"pg_g5b_u08_percentage_of_quantity",
    patternFamilyId:"RECONSTRUCT_MADE_QUANTITY",
    relation:G5B_U08_P07F13_INCLUDED_RELATIONS[1],
    semanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    targetKind:"RECONSTRUCTED_COMPARISON_QUANTITY",
    answerDomain:"NONNEGATIVE_INTEGER_QUANTITY",
    percentageRateRoleRequired:true,comparisonQuantityEqualsBaseTimesRateRequired:true,
    complementQuestionAllowedWhenDirectPercentQuantityStepIsExplicit:false,
    reconstructComparisonQuantityForMultiStepRateUpdateAllowed:true,
    findPercentageRateSupportStepAllowed:false,
    sourceBackedApplicationContextAllowed:true
  })
]);
export const G5B_U08_P07F13_SPEC_IDS=Object.freeze(G5B_U08_P07F13_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G5B_U08_P07F13_SPEC_IDS_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F13_KP_IDS.map(kp=>[
  kp,Object.freeze(G5B_U08_P07F13_PATTERN_SPECS.filter(s=>s.knowledgePointId===kp).map(s=>s.patternSpecId))
])));
export const G5B_U08_P07F13_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({
    mappingId:"fm_g5b_u08_find_percentage_rate_p07f13",
    r04MappingId:"r04map_g5b_u08_find_percentage_rate",
    sourceId:G5B_U08_P07F13_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([2]),
    knowledgePointId:G5B_U08_P07F13_RATE_KP_ID,canonicalNameZh:"由兩量求百分率",
    capabilityStatement:"學生能以比較量除以基準量求百分率。",
    reasoningInvariant:"比率的分母角色必須是基準量。",
    sourceSemanticCore:"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE",
    semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_RATE_FROM_QUANTITIES_EVIDENCE",
    currentVisualSupportLevel:"DIRECT_LITERAL_APPLICATION",
    primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
    appliedRuntimeModifierIds:G5B_U08_P07F13_APPLIED_MODIFIER_IDS,
    requiredCapabilityIds:G5B_U08_P07F13_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G5B_U08_P07F13_OPTIONAL_CAPABILITY_IDS,
    queueRequiredW7CapabilityIds:G5B_U08_P07F13_QUEUE_REQUIRED_CAPABILITY_IDS,
    patternSpecIds:G5B_U08_P07F13_SPEC_IDS_BY_KP[G5B_U08_P07F13_RATE_KP_ID],
    requiredPrerequisiteKnowledgePointIds:G5B_U08_P07F13_PREDECESSOR_KP_IDS_BY_KP[G5B_U08_P07F13_RATE_KP_ID],
    baseQuantityRoleRequired:true,comparisonQuantityRoleRequired:true,denominatorMustBeBaseQuantity:true,
    reconstructComparisonQuantityFromPriorRateWhenNeeded:true,sourceBackedApplicationContextAllowed:true,
    q008RepresentationConversionTeachingReownershipAllowed:false,q016FindBaseQuantityAllowed:false,q016DiscountIncreaseApplicationAllowed:false,
    sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
  }),
  Object.freeze({
    mappingId:"fm_g5b_u08_percentage_of_quantity_p07f13",
    r04MappingId:"r04map_g5b_u08_percentage_of_quantity",
    sourceId:G5B_U08_P07F13_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([2]),
    knowledgePointId:G5B_U08_P07F13_QUANTITY_KP_ID,canonicalNameZh:"求百分率對應量",
    capabilityStatement:"學生能以基準量乘百分率求部分量。",
    reasoningInvariant:"比較量等於基準量乘比率。",
    sourceSemanticCore:"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY",
    semanticAuthority:"R02_REVIEWED_CANDIDATE_PLUS_CURRENT_DIRECT_VISUAL_PERCENTAGE_OF_QUANTITY_EVIDENCE",
    currentVisualSupportLevel:"DIRECT_LITERAL_APPLICATION_WITH_COMPLEMENT_OR_RECONSTRUCTION_STEP",
    primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",
    appliedRuntimeModifierIds:G5B_U08_P07F13_APPLIED_MODIFIER_IDS,
    requiredCapabilityIds:G5B_U08_P07F13_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G5B_U08_P07F13_OPTIONAL_CAPABILITY_IDS,
    queueRequiredW7CapabilityIds:G5B_U08_P07F13_QUEUE_REQUIRED_CAPABILITY_IDS,
    patternSpecIds:G5B_U08_P07F13_SPEC_IDS_BY_KP[G5B_U08_P07F13_QUANTITY_KP_ID],
    requiredPrerequisiteKnowledgePointIds:G5B_U08_P07F13_PREDECESSOR_KP_IDS_BY_KP[G5B_U08_P07F13_QUANTITY_KP_ID],
    baseQuantityRoleRequired:true,percentageRateRoleRequired:true,comparisonQuantityEqualsBaseTimesRateRequired:true,
    complementQuestionAllowedWhenDirectPercentQuantityStepIsExplicit:true,reconstructComparisonQuantityForMultiStepRateUpdateAllowed:true,
    sourceBackedApplicationContextAllowed:true,q008RepresentationConversionTeachingReownershipAllowed:false,
    q016FindBaseQuantityAllowed:false,q016DiscountIncreaseApplicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,
    r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
  })
]);
const MAPPING_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F13_FORMAL_MAPPINGS.map(m=>[m.knowledgePointId,m])));
function selectorRow(kp){
  const g=GROUP_BY_KP[kp],m=MAPPING_BY_KP[kp];
  return Object.freeze({
    knowledgePointId:kp,sourceId:G5B_U08_P07F13_SOURCE_ID,unitCode:G5B_U08_P07F13_UNIT_CODE,unitTitle:G5B_U08_P07F13_UNIT_TITLE,
    displayName:m.canonicalNameZh,canonicalNameZh:m.canonicalNameZh,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
    supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
    applicationClassification:"SOURCE_BACKED_APPLICATION_ADMITTED",
    canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:G5B_U08_P07F13_SPEC_IDS_BY_KP[kp],
    patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:G5B_U08_P07F13_SPEC_IDS_BY_KP[kp],
    requiredCapabilityIds:G5B_U08_P07F13_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G5B_U08_P07F13_OPTIONAL_CAPABILITY_IDS,
    qaStatusLabel:"P07F13_G5B_U08_"+(kp===G5B_U08_P07F13_RATE_KP_ID?"FIND_PERCENTAGE_RATE":"PERCENTAGE_OF_QUANTITY"),
    productionUse:"full_product_w7_slice013_candidate"
  });
}
export const G5B_U08_P07F13_SELECTOR_ROWS=Object.freeze(G5B_U08_P07F13_KP_IDS.map(selectorRow));
const ROW_BY_KP=Object.freeze(Object.fromEntries(G5B_U08_P07F13_SELECTOR_ROWS.map(r=>[r.knowledgePointId,r])));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG5BU08P07F13SelectorRow=id=>ROW_BY_KP[id]?clone(ROW_BY_KP[id]):null;
export const listG5BU08P07F13PatternGroups=id=>GROUP_BY_KP[id]?[clone(GROUP_BY_KP[id])]:[];
export const resolveG5BU08P07F13PatternSpecIds=id=>clone(G5B_U08_P07F13_SPEC_IDS_BY_KP[id]??[]);
export const getG5BU08P07F13FormalMapping=id=>clone(MAPPING_BY_KP[id]??null);
export function auditG5BU08P07F13Projection(){
  const e=[];
  if(G5B_U08_P07F13_PATTERN_GROUPS.length!==2||G5B_U08_P07F13_PATTERN_SPECS.length!==6||G5B_U08_P07F13_FORMAL_MAPPINGS.length!==2)e.push("P07F13_CARDINALITY_INVALID");
  if(new Set(G5B_U08_P07F13_SPEC_IDS).size!==6)e.push("P07F13_PATTERN_SPEC_DUPLICATE");
  for(const kp of G5B_U08_P07F13_KP_IDS){
    if((G5B_U08_P07F13_SPEC_IDS_BY_KP[kp]??[]).length!==3)e.push("P07F13_KP_SPEC_CARDINALITY_INVALID:"+kp);
  }
  for(const s of G5B_U08_P07F13_PATTERN_SPECS){
    if(s.questionMode!=="numeric"||s.representation!=="text_application"||!s.baseQuantityRoleRequired||s.q008RepresentationConversionTeachingReownershipAllowed||s.q016FindBaseQuantityAllowed||s.q016DiscountIncreaseApplicationAllowed||s.sameUnitMixedAllowed||s.crossUnitMixedAllowed)e.push("P07F13_PATTERN_SCOPE_INVALID:"+s.patternSpecId);
    if(s.knowledgePointId===G5B_U08_P07F13_RATE_KP_ID&&(!s.comparisonQuantityRoleRequired||!s.denominatorMustBeBaseQuantity||s.semanticCore!=="COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE"))e.push("P07F13_RATE_PATTERN_INVALID:"+s.patternSpecId);
    if(s.knowledgePointId===G5B_U08_P07F13_QUANTITY_KP_ID&&(!s.percentageRateRoleRequired||!s.comparisonQuantityEqualsBaseTimesRateRequired||s.semanticCore!=="BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY"))e.push("P07F13_QUANTITY_PATTERN_INVALID:"+s.patternSpecId);
  }
  for(const m of G5B_U08_P07F13_FORMAL_MAPPINGS){
    if(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||m.currentVisualSupportingPages.join(",")!=="2"||m.q008RepresentationConversionTeachingReownershipAllowed||m.q016FindBaseQuantityAllowed||m.q016DiscountIncreaseApplicationAllowed||m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F13_MAPPING_SCOPE_INVALID:"+m.knowledgePointId);
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:6,formalMappings:2})});
}
