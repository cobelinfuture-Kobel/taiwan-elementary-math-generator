export const P07F22_TASK_ID="P07F_W7DirectProductVerticalSlice022Implementation";
export const G6B_U04_P07F22_SOURCE_ID="g6b_u04_6b04";
export const G6B_U04_P07F22_UNIT_CODE="6B-U04";
export const G6B_U04_P07F22_UNIT_TITLE="基準量與比較量";
export const G6B_U04_P07F22_PREDECESSOR_KP_ID="kp_g6b_u04_base_comparison_rate_roles";
export const G6B_U04_P07F22_TARGET_KP_IDS=Object.freeze([
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity",
  "kp_g6b_u04_find_rate_from_quantities"
]);
export const G6B_U04_P07F22_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g6b_u04_successive_rate_change"]);
export const G6B_U04_P07F22_REQUIRED_PREREQUISITE_KP_IDS=Object.freeze([G6B_U04_P07F22_PREDECESSOR_KP_ID]);
export const G6B_U04_P07F22_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
export const G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection",
  "cap_html_print_renderer","cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_text_application_representation"
]);
export const G6B_U04_P07F22_OPTIONAL_CAPABILITY_IDS=Object.freeze([]);
export const G6B_U04_P07F22_APPLIED_MODIFIER_IDS=Object.freeze([]);

const CONFIG=Object.freeze({
  "kp_g6b_u04_find_base_quantity":Object.freeze({
    canonicalNameZh:"求基準量",displayName:"由比較量與比率求基準量",semanticCore:"SOLVE_BASE_QUANTITY_FROM_COMPARISON_AND_RATE",
    invariant:"基準量乘比率必須重建比較量。",groupId:"pg_g6b_u04_find_base_quantity",
    specs:Object.freeze([
      ["ps_g6b_u04_find_base_from_decimal_rate","FIND_BASE_FROM_DECIMAL_RATE","decimal"],
      ["ps_g6b_u04_find_base_from_percent_rate","FIND_BASE_FROM_PERCENT_RATE","percent"]
    ])
  }),
  "kp_g6b_u04_find_comparison_quantity":Object.freeze({
    canonicalNameZh:"求比較量",displayName:"由基準量與比率求比較量",semanticCore:"SOLVE_COMPARISON_QUANTITY_FROM_BASE_AND_RATE",
    invariant:"計算結果代回比較量除以基準量須得到原比率。",groupId:"pg_g6b_u04_find_comparison_quantity",
    specs:Object.freeze([
      ["ps_g6b_u04_find_comparison_from_decimal_rate","FIND_COMPARISON_FROM_DECIMAL_RATE","decimal"],
      ["ps_g6b_u04_find_comparison_from_percent_rate","FIND_COMPARISON_FROM_PERCENT_RATE","percent"]
    ])
  }),
  "kp_g6b_u04_find_rate_from_quantities":Object.freeze({
    canonicalNameZh:"求比率",displayName:"由比較量與基準量求比率",semanticCore:"SOLVE_RATE_FROM_COMPARISON_AND_BASE",
    invariant:"比率等於比較量除以基準量，兩量單位須相容。",groupId:"pg_g6b_u04_find_rate_from_quantities",
    specs:Object.freeze([
      ["ps_g6b_u04_find_decimal_rate_from_quantities","FIND_DECIMAL_RATE_FROM_QUANTITIES","decimal"],
      ["ps_g6b_u04_find_percent_rate_from_quantities","FIND_PERCENT_RATE_FROM_QUANTITIES","percent"]
    ])
  })
});

const relationFor=id=>id==="kp_g6b_u04_find_base_quantity"?"SOLVE_BASE_QUANTITY_FROM_COMPARISON_AND_RATE":
  id==="kp_g6b_u04_find_comparison_quantity"?"SOLVE_COMPARISON_QUANTITY_FROM_BASE_AND_RATE":"SOLVE_RATE_FROM_COMPARISON_AND_BASE";

const makeSpec=(kp,row)=>Object.freeze({
  patternSpecId:row[0],knowledgePointId:kp,patternGroupId:CONFIG[kp].groupId,patternFamilyId:row[1],rateDisplayMode:row[2],
  relation:relationFor(kp),semanticCore:CONFIG[kp].semanticCore,questionMode:"numeric",representation:"text_application",
  answerDomain:kp==="kp_g6b_u04_find_rate_from_quantities"?"DETERMINISTIC_RATE_LITERAL":"POSITIVE_INTEGER",
  baseComparisonRateRoleModelRequired:true,answerBackSubstitutionRequired:true,compatibleQuantityUnitsRequired:true,
  predecessorRoleClassificationReownershipAllowed:false,successiveRateChangeAllowed:false,multiStageDiscountGrowthDecreaseAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false
});

export const G6B_U04_P07F22_PATTERN_SPECS=Object.freeze(G6B_U04_P07F22_TARGET_KP_IDS.flatMap(kp=>CONFIG[kp].specs.map(row=>makeSpec(kp,row))));
export const G6B_U04_P07F22_SPEC_IDS=Object.freeze(G6B_U04_P07F22_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6B_U04_P07F22_PATTERN_GROUPS=Object.freeze(G6B_U04_P07F22_TARGET_KP_IDS.map(kp=>Object.freeze({
  patternGroupId:CONFIG[kp].groupId,sourceId:G6B_U04_P07F22_SOURCE_ID,unitCode:G6B_U04_P07F22_UNIT_CODE,unitTitle:G6B_U04_P07F22_UNIT_TITLE,
  displayName:CONFIG[kp].displayName,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",
  representationTag:"text_application",representationTags:Object.freeze(["ratio","percent","base_quantity","comparison_quantity","rate","application"]),
  patternSpecIds:Object.freeze(CONFIG[kp].specs.map(x=>x[0])),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
})));

export const G6B_U04_P07F22_FORMAL_MAPPINGS=Object.freeze(G6B_U04_P07F22_TARGET_KP_IDS.map(kp=>Object.freeze({
  mappingId:"fm_g6b_u04_"+kp.replace("kp_g6b_u04_","")+"_p07f22",
  r04MappingId:"r04map_"+kp.replace(/^kp_/,""),
  sourceId:G6B_U04_P07F22_SOURCE_ID,r02EvidencePages:Object.freeze([1,2]),currentVisualSupportingPages:Object.freeze([1,2]),
  knowledgePointId:kp,canonicalNameZh:CONFIG[kp].canonicalNameZh,capabilityStatement:kp==="kp_g6b_u04_find_base_quantity"?"學生能由比較量與比率反求基準量。":
    kp==="kp_g6b_u04_find_comparison_quantity"?"學生能由基準量與比率求比較量。":"學生能由比較量與基準量求比率或百分率。",
  reasoningInvariant:CONFIG[kp].invariant,sourceSemanticCore:CONFIG[kp].semanticCore,
  semanticAuthority:"R02_FULL_PAGE_VISUAL_READBACK_PLUS_Q019_CURRENT_DIRECT_PDF_VISUAL_CORROBORATION",
  primaryRuntimeProfileId:"profile_ratio_percent",classificationRuleId:"rule_ratio_percent",appliedRuntimeModifierIds:G6B_U04_P07F22_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U04_P07F22_OPTIONAL_CAPABILITY_IDS,
  queueRequiredW7CapabilityIds:G6B_U04_P07F22_QUEUE_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:Object.freeze(CONFIG[kp].specs.map(x=>x[0])),requiredPrerequisiteKnowledgePointIds:G6B_U04_P07F22_REQUIRED_PREREQUISITE_KP_IDS,
  baseComparisonRateRolePrerequisiteMayBeConsumed:true,priorKnowledgePointOwnershipMayNotBeReowned:true,
  baseComparisonRateRoleModelRequired:true,answerBackSubstitutionRequired:true,compatibleQuantityUnitsRequired:true,
  predecessorRoleClassificationReownershipAllowed:false,successiveRateChangeAllowed:false,multiStageDiscountGrowthDecreaseAllowed:false,
  sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
})));

export const G6B_U04_P07F22_SELECTOR_ROWS=Object.freeze(G6B_U04_P07F22_TARGET_KP_IDS.map(kp=>Object.freeze({
  knowledgePointId:kp,sourceId:G6B_U04_P07F22_SOURCE_ID,unitCode:G6B_U04_P07F22_UNIT_CODE,unitTitle:G6B_U04_P07F22_UNIT_TITLE,
  displayName:CONFIG[kp].displayName,canonicalNameZh:CONFIG[kp].canonicalNameZh,mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),
  supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds:Object.freeze([CONFIG[kp].groupId]),canonicalPatternSpecIds:Object.freeze(CONFIG[kp].specs.map(x=>x[0])),
  patternGroupIds:Object.freeze([CONFIG[kp].groupId]),patternSpecIds:Object.freeze(CONFIG[kp].specs.map(x=>x[0])),
  requiredCapabilityIds:G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6B_U04_P07F22_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P07F22_G6B_U04_"+kp.replace("kp_g6b_u04_","").toUpperCase(),productionUse:"full_product_w7_slice022_candidate"
})));

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6BU04P07F22SelectorRow=id=>clone(G6B_U04_P07F22_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)??null);
export const listG6BU04P07F22PatternGroups=id=>clone(G6B_U04_P07F22_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id));
export const resolveG6BU04P07F22PatternSpecIds=id=>clone(G6B_U04_P07F22_PATTERN_SPECS.filter(x=>x.knowledgePointId===id).map(x=>x.patternSpecId));
export const getG6BU04P07F22FormalMapping=id=>clone(G6B_U04_P07F22_FORMAL_MAPPINGS.find(x=>x.knowledgePointId===id)??null);

export function auditG6BU04P07F22Projection(){
  const e=[];
  if(G6B_U04_P07F22_TARGET_KP_IDS.length!==3||G6B_U04_P07F22_PATTERN_GROUPS.length!==3||G6B_U04_P07F22_PATTERN_SPECS.length!==6||G6B_U04_P07F22_FORMAL_MAPPINGS.length!==3)e.push("P07F22_CARDINALITY_INVALID");
  if(new Set(G6B_U04_P07F22_SPEC_IDS).size!==6)e.push("P07F22_PATTERN_SPEC_DUPLICATE");
  for(const kp of G6B_U04_P07F22_TARGET_KP_IDS){
    const m=G6B_U04_P07F22_FORMAL_MAPPINGS.find(x=>x.knowledgePointId===kp),specs=G6B_U04_P07F22_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp);
    if(!m||specs.length!==2||m.patternSpecIds.length!==2)e.push("P07F22_KP_MAPPING_CARDINALITY_INVALID:"+kp);
    if(m&&(m.primaryRuntimeProfileId!=="profile_ratio_percent"||m.classificationRuleId!=="rule_ratio_percent"||m.appliedRuntimeModifierIds.length!==0||
      m.requiredCapabilityIds.join("|")!==G6B_U04_P07F22_REQUIRED_CAPABILITY_IDS.join("|")||m.optionalCapabilityIds.length!==0||
      !m.baseComparisonRateRoleModelRequired||!m.answerBackSubstitutionRequired||!m.compatibleQuantityUnitsRequired||
      m.predecessorRoleClassificationReownershipAllowed||m.successiveRateChangeAllowed||m.multiStageDiscountGrowthDecreaseAllowed||
      m.sameUnitMixedAllowed||m.crossUnitMixedAllowed||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed))e.push("P07F22_MAPPING_SCOPE_INVALID:"+kp);
    for(const x of specs)if(x.questionMode!=="numeric"||x.representation!=="text_application"||!x.baseComparisonRateRoleModelRequired||!x.answerBackSubstitutionRequired||
      !x.compatibleQuantityUnitsRequired||x.predecessorRoleClassificationReownershipAllowed||x.successiveRateChangeAllowed||x.multiStageDiscountGrowthDecreaseAllowed||
      x.sameUnitMixedAllowed||x.crossUnitMixedAllowed)e.push("P07F22_PATTERN_SCOPE_INVALID:"+x.patternSpecId);
  }
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:6,formalMappings:3})});
}
