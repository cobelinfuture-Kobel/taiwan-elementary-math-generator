export const P07F15_TASK_ID="P07F_W7DirectProductVerticalSlice015Implementation";
export const G6B_U05_P07F15_SOURCE_ID="g6b_u05_6b05";
export const G6B_U05_P07F15_UNIT_CODE="6B-U05";
export const G6B_U05_P07F15_UNIT_TITLE="怎樣解題";
export const G6B_U05_P07F15_DIFFERENCE_KP_ID="kp_g6b_u05_difference_multiple_problem";
export const G6B_U05_P07F15_SUM_KP_ID="kp_g6b_u05_sum_multiple_problem";
export const G6B_U05_P07F15_TARGET_KP_IDS=Object.freeze([G6B_U05_P07F15_DIFFERENCE_KP_ID,G6B_U05_P07F15_SUM_KP_ID]);
export const G6B_U05_P07F15_PREDECESSOR_VISIBLE_KP_IDS=Object.freeze(["kp_g6b_u05_sum_difference_problem","kp_g6b_u05_age_or_repeated_relation_problem"]);
export const G6B_U05_P07F15_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6b_u05_work_or_distribution_strategy"]);
export const G6B_U05_P07F15_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_factor_multiple_reasoning","cap_factor_multiple_validator","cap_text_numeric_representation"
]);
export const G6B_U05_P07F15_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U05_P07F15_APPLIED_MODIFIER_IDS=Object.freeze([]);
const GROUPS=Object.freeze([
  Object.freeze({patternGroupId:"pg_g6b_u05_difference_multiple_problem",sourceId:G6B_U05_P07F15_SOURCE_ID,unitCode:G6B_U05_P07F15_UNIT_CODE,unitTitle:G6B_U05_P07F15_UNIT_TITLE,displayName:"差倍問題",primaryKnowledgePointId:G6B_U05_P07F15_DIFFERENCE_KP_ID,knowledgePointIds:Object.freeze([G6B_U05_P07F15_DIFFERENCE_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_numeric_factor_multiple_relation",representationTags:Object.freeze(["problem_relation","factor_multiple","difference","text_numeric"]),patternSpecIds:Object.freeze(["ps_g6b_u05_difference_multiple_find_smaller","ps_g6b_u05_difference_multiple_find_larger"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null}),
  Object.freeze({patternGroupId:"pg_g6b_u05_sum_multiple_problem",sourceId:G6B_U05_P07F15_SOURCE_ID,unitCode:G6B_U05_P07F15_UNIT_CODE,unitTitle:G6B_U05_P07F15_UNIT_TITLE,displayName:"和倍問題",primaryKnowledgePointId:G6B_U05_P07F15_SUM_KP_ID,knowledgePointIds:Object.freeze([G6B_U05_P07F15_SUM_KP_ID]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_numeric_factor_multiple_relation",representationTags:Object.freeze(["problem_relation","factor_multiple","sum","text_numeric"]),patternSpecIds:Object.freeze(["ps_g6b_u05_sum_multiple_find_smaller","ps_g6b_u05_sum_multiple_find_larger"]),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null})
]);
export const G6B_U05_P07F15_PATTERN_GROUPS=GROUPS;
function spec(id,kp,group,family,targetKind,relation,core){
  return Object.freeze({patternSpecId:id,knowledgePointId:kp,patternGroupId:group,patternFamilyId:family,relation,semanticCore:core,targetKind,questionMode:"numeric",answerDomain:"POSITIVE_INTEGER",representation:"text_numeric_factor_multiple_relation",multiplierAtLeastTwo:true,exactPartitionRequired:true,reconstructBothQuantitiesRequired:true,directRelationTextRequired:true,genericApplicationOverlayAllowed:false,sumDifferenceProblemReownershipAllowed:false,ageOrRepeatedRelationReownershipAllowed:false,workOrDistributionStrategyReownershipAllowed:false,affineMultipleOffsetAllowed:false,combinatoricsAllowed:false,routeCountingAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G6B_U05_P07F15_PATTERN_SPECS=Object.freeze([
  spec("ps_g6b_u05_difference_multiple_find_smaller",G6B_U05_P07F15_DIFFERENCE_KP_ID,GROUPS[0].patternGroupId,"DIFFERENCE_MULTIPLE_FIND_SMALLER","FIND_SMALLER","SOLVE_DIFFERENCE_MULTIPLE_FIND_SMALLER","DIFFERENCE_MULTIPLE_RELATION_MODEL"),
  spec("ps_g6b_u05_difference_multiple_find_larger",G6B_U05_P07F15_DIFFERENCE_KP_ID,GROUPS[0].patternGroupId,"DIFFERENCE_MULTIPLE_FIND_LARGER","FIND_LARGER","SOLVE_DIFFERENCE_MULTIPLE_FIND_LARGER","DIFFERENCE_MULTIPLE_RELATION_MODEL"),
  spec("ps_g6b_u05_sum_multiple_find_smaller",G6B_U05_P07F15_SUM_KP_ID,GROUPS[1].patternGroupId,"SUM_MULTIPLE_FIND_SMALLER","FIND_SMALLER","SOLVE_SUM_MULTIPLE_FIND_SMALLER","SUM_MULTIPLE_RELATION_MODEL"),
  spec("ps_g6b_u05_sum_multiple_find_larger",G6B_U05_P07F15_SUM_KP_ID,GROUPS[1].patternGroupId,"SUM_MULTIPLE_FIND_LARGER","FIND_LARGER","SOLVE_SUM_MULTIPLE_FIND_LARGER","SUM_MULTIPLE_RELATION_MODEL")
]);
export const G6B_U05_P07F15_SPEC_IDS=Object.freeze(G6B_U05_P07F15_PATTERN_SPECS.map(x=>x.patternSpecId));
const SPECS_BY_KP=new Map(G6B_U05_P07F15_TARGET_KP_IDS.map(kp=>[kp,Object.freeze(G6B_U05_P07F15_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp))]));
const GROUP_BY_KP=new Map(GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
export const G6B_U05_P07F15_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({mappingId:"fm_g6b_u05_difference_multiple_problem_p07f15",r04MappingId:"r04map_g6b_u05_difference_multiple_problem",sourceId:G6B_U05_P07F15_SOURCE_ID,knowledgePointId:G6B_U05_P07F15_DIFFERENCE_KP_ID,canonicalNameZh:"差倍問題",capabilityStatement:"學生能由兩量的差與倍數關係求各量。",reasoningInvariant:"差對應倍數差的份數，求一份後重建各量。",sourceSemanticCore:"DIFFERENCE_MULTIPLE_RELATION_MODEL",primaryRuntimeProfileId:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",appliedRuntimeModifierIds:G6B_U05_P07F15_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U05_P07F15_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U05_P07F15_OPTIONAL_CAPABILITY_IDS,patternSpecIds:Object.freeze(SPECS_BY_KP.get(G6B_U05_P07F15_DIFFERENCE_KP_ID).map(x=>x.patternSpecId)),requiredPrerequisiteKnowledgePointIds:Object.freeze(["kp_g4a_u08_num_add_sub_left_assoc","kp_g6a_u05_ratio_partition_application"]),authority:"ORIGINAL_G6B_U05_DIRECT_DIFFERENCE_MULTIPLE_VISUAL_EVIDENCE",originalSourceDirectSupport:true,supplementaryEvidenceUsed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false}),
  Object.freeze({mappingId:"fm_g6b_u05_sum_multiple_problem_p07f15",r04MappingId:"r04map_g6b_u05_sum_multiple_problem",sourceId:G6B_U05_P07F15_SOURCE_ID,knowledgePointId:G6B_U05_P07F15_SUM_KP_ID,canonicalNameZh:"和倍問題",capabilityStatement:"學生能由兩量的和與倍數關係求各量。",reasoningInvariant:"總量按總份數平均分，再依倍數重建各量。",sourceSemanticCore:"SUM_MULTIPLE_RELATION_MODEL",primaryRuntimeProfileId:"profile_factor_multiple",classificationRuleId:"rule_factor_multiple",appliedRuntimeModifierIds:G6B_U05_P07F15_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G6B_U05_P07F15_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U05_P07F15_OPTIONAL_CAPABILITY_IDS,patternSpecIds:Object.freeze(SPECS_BY_KP.get(G6B_U05_P07F15_SUM_KP_ID).map(x=>x.patternSpecId)),requiredPrerequisiteKnowledgePointIds:Object.freeze(["kp_g6a_u05_ratio_partition_application"]),authority:"SUPPLEMENTARY_EXAM_DIRECT_SUM_MULTIPLE_EVIDENCE",originalSourceDirectSupport:false,supplementaryEvidenceUsed:true,supplementaryEvidenceDriveFileId:"1-m7SwI4NcyWEhyymQ9gE3mL_KeDE21Wc",supplementaryEvidencePage:1,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false})
]);
function row(kp,name){
  const g=GROUP_BY_KP.get(kp),specs=SPECS_BY_KP.get(kp);
  return Object.freeze({knowledgePointId:kp,sourceId:G6B_U05_P07F15_SOURCE_ID,unitCode:G6B_U05_P07F15_UNIT_CODE,unitTitle:G6B_U05_P07F15_UNIT_TITLE,displayName:name,canonicalNameZh:name,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIRECT_RELATION_TEXT_ONLY",canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:Object.freeze(specs.map(x=>x.patternSpecId)),patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze(specs.map(x=>x.patternSpecId)),requiredCapabilityIds:G6B_U05_P07F15_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U05_P07F15_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P07F15_G6B_U05_SOURCE_BACKED_"+(kp===G6B_U05_P07F15_DIFFERENCE_KP_ID?"DIFFERENCE_MULTIPLE":"SUM_MULTIPLE"),productionUse:"full_product_w7_slice015_candidate"});
}
export const G6B_U05_P07F15_SELECTOR_ROWS=Object.freeze([row(G6B_U05_P07F15_DIFFERENCE_KP_ID,"差倍問題"),row(G6B_U05_P07F15_SUM_KP_ID,"和倍問題")]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU05P07F15SelectorRow=id=>clone(G6B_U05_P07F15_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);
export const listG6BU05P07F15PatternGroups=id=>{const g=GROUP_BY_KP.get(id);return g?[clone(g)]:[];};
export const resolveG6BU05P07F15PatternSpecIds=id=>clone((SPECS_BY_KP.get(id)??[]).map(x=>x.patternSpecId));
export function auditG6BU05P07F15Projection(){
  const e=[];
  if(G6B_U05_P07F15_PATTERN_GROUPS.length!==2||G6B_U05_P07F15_PATTERN_SPECS.length!==4||G6B_U05_P07F15_FORMAL_MAPPINGS.length!==2||G6B_U05_P07F15_SELECTOR_ROWS.length!==2)e.push("P07F15_CARDINALITY_INVALID");
  if(new Set(G6B_U05_P07F15_SPEC_IDS).size!==4)e.push("P07F15_PATTERN_SPEC_DUPLICATE");
  for(const x of G6B_U05_P07F15_PATTERN_SPECS){
    if(x.questionMode!=="numeric"||!["DIFFERENCE_MULTIPLE_RELATION_MODEL","SUM_MULTIPLE_RELATION_MODEL"].includes(x.semanticCore)||!x.multiplierAtLeastTwo||!x.exactPartitionRequired||!x.reconstructBothQuantitiesRequired||!x.directRelationTextRequired||x.genericApplicationOverlayAllowed||x.sumDifferenceProblemReownershipAllowed||x.ageOrRepeatedRelationReownershipAllowed||x.workOrDistributionStrategyReownershipAllowed||x.affineMultipleOffsetAllowed||x.combinatoricsAllowed||x.routeCountingAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F15_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  for(const m of G6B_U05_P07F15_FORMAL_MAPPINGS)if(m.primaryRuntimeProfileId!=="profile_factor_multiple"||m.classificationRuleId!=="rule_factor_multiple"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P07F15_MAPPING_SCOPE_INVALID:"+m.knowledgePointId);
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:4,formalMappings:2})});
}
