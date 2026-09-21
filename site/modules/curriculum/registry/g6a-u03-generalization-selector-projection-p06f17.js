export const P06F17_TASK_ID="P06F_W6DirectProductVerticalSlice017Implementation";
export const G6A_U03_P06F17_SOURCE_ID="g6a_u03_6a03";
export const G6A_U03_P06F17_UNIT_CODE="6A-U03";
export const G6A_U03_P06F17_UNIT_TITLE="數量關係與規律問題";
export const G6A_U03_P06F17_GEOMETRIC_KP_ID="kp_g6a_u03_geometric_count_generalization";
export const G6A_U03_P06F17_INPUT_OUTPUT_KP_ID="kp_g6a_u03_input_output_general_rule";
export const G6A_U03_P06F17_LINEAR_KP_ID="kp_g6a_u03_linear_pattern_nth_term";
export const G6A_U03_P06F17_TARGET_KP_IDS=Object.freeze([G6A_U03_P06F17_GEOMETRIC_KP_ID,G6A_U03_P06F17_INPUT_OUTPUT_KP_ID,G6A_U03_P06F17_LINEAR_KP_ID]);
export const G6A_U03_P06F17_PREDECESSOR_KP_IDS=Object.freeze(["kp_g6a_u03_symbolic_quantity_relation"]);
export const G6A_U03_P06F17_REMAINING_KP_IDS=Object.freeze(["kp_g6a_u03_relation_equation_unknown"]);
export const G6A_U03_P06F17_QUEUE_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"]);
export const G6A_U03_P06F17_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
export const G6A_U03_P06F17_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_symbolic_relation_reasoning"]);
export const G6A_U03_P06F17_INCLUDED_RELATIONS=Object.freeze(["GENERALIZE_GEOMETRIC_COUNT_BY_STAGE","GENERALIZE_INPUT_OUTPUT_RULE","DERIVE_LINEAR_PATTERN_NTH_TERM"]);
const GROUP=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:"pg_g6a_u03_geometric_count_generalization",
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:"pg_g6a_u03_input_output_general_rule",
  [G6A_U03_P06F17_LINEAR_KP_ID]:"pg_g6a_u03_linear_pattern_nth_term"
});
const NAME=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:"圖形規律一般化",
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:"輸入輸出一般式",
  [G6A_U03_P06F17_LINEAR_KP_ID]:"線性規律第n項"
});
const CAP=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:"學生能將階段圖形數量表示成項次公式。",
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:"學生能由多組對應值歸納一般規則。",
  [G6A_U03_P06F17_LINEAR_KP_ID]:"學生能由固定差與首項求指定項。"
});
const INV=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:"公式須分離固定部分與每階段新增部分。",
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:"一般式必須解釋所有已知輸入輸出對。",
  [G6A_U03_P06F17_LINEAR_KP_ID]:"第n項等於首項加n減1個固定差。"
});
const CORE=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:"GEOMETRIC_COUNT_GENERALIZATION",
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:"INPUT_OUTPUT_GENERAL_RULE",
  [G6A_U03_P06F17_LINEAR_KP_ID]:"LINEAR_PATTERN_NTH_TERM"
});
const PAGES=Object.freeze({
  [G6A_U03_P06F17_GEOMETRIC_KP_ID]:Object.freeze([1]),
  [G6A_U03_P06F17_INPUT_OUTPUT_KP_ID]:Object.freeze([2]),
  [G6A_U03_P06F17_LINEAR_KP_ID]:Object.freeze([3])
});
function makeSpec(id,kp,family,relation){
  return Object.freeze({patternSpecId:id,knowledgePointId:kp,patternGroupId:GROUP[kp],patternFamilyId:family,relation,semanticCore:CORE[kp],questionMode:"numeric",answerDomain:"INTEGER",representation:"text_numeric_pattern_relation",requiresPatternSequenceReasoning:true,requiresPatternRelationValidation:true,requiresTextNumericRepresentation:true,symbolicRelationReasoningRequired:false,symbolicRelationReasoningOptional:true,stageIndexFormulaRequired:kp===G6A_U03_P06F17_GEOMETRIC_KP_ID,fixedPartAndPerStageIncrementSeparated:kp===G6A_U03_P06F17_GEOMETRIC_KP_ID,multipleKnownPairsRequired:kp===G6A_U03_P06F17_INPUT_OUTPUT_KP_ID,generalRuleExplainsAllPairsRequired:kp===G6A_U03_P06F17_INPUT_OUTPUT_KP_ID,firstTermAndFixedDifferenceRequired:kp===G6A_U03_P06F17_LINEAR_KP_ID,nthTermFormulaRequired:kp===G6A_U03_P06F17_LINEAR_KP_ID,genericSymbolicQuantityRelationReownershipAllowed:false,relationEquationUnknownSolvingAllowed:false,applicationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G6A_U03_P06F17_PATTERN_SPECS=Object.freeze([
  makeSpec("ps_g6a_u03_geometric_count_stage_formula",G6A_U03_P06F17_GEOMETRIC_KP_ID,"GEOMETRIC_STAGE_COUNT_AFFINE",G6A_U03_P06F17_INCLUDED_RELATIONS[0]),
  makeSpec("ps_g6a_u03_input_output_affine_general_rule",G6A_U03_P06F17_INPUT_OUTPUT_KP_ID,"INPUT_OUTPUT_AFFINE_RULE",G6A_U03_P06F17_INCLUDED_RELATIONS[1]),
  makeSpec("ps_g6a_u03_linear_pattern_nth_term",G6A_U03_P06F17_LINEAR_KP_ID,"LINEAR_SEQUENCE_NTH_TERM",G6A_U03_P06F17_INCLUDED_RELATIONS[2])
]);
export const G6A_U03_P06F17_SPEC_IDS=Object.freeze(G6A_U03_P06F17_PATTERN_SPECS.map(x=>x.patternSpecId));
export const G6A_U03_P06F17_FORMAL_MAPPINGS=Object.freeze(G6A_U03_P06F17_TARGET_KP_IDS.map(kp=>Object.freeze({
  mappingId:"fm_"+kp.replace(/^kp_/,"")+"_p06f17",r04MappingId:"r04map_"+kp.replace(/^kp_/,""),sourceId:G6A_U03_P06F17_SOURCE_ID,sourcePages:PAGES[kp],knowledgePointId:kp,canonicalNameZh:NAME[kp],capabilityStatement:CAP[kp],reasoningInvariant:INV[kp],sourceSemanticCore:CORE[kp],primaryRuntimeProfileId:"profile_pattern_relation",requiredCapabilityIds:G6A_U03_P06F17_REQUIRED_CAPABILITY_IDS,queueRequiredW6CapabilityIds:G6A_U03_P06F17_QUEUE_REQUIRED_CAPABILITY_IDS,optionalRuntimeCapabilityIds:G6A_U03_P06F17_OPTIONAL_CAPABILITY_IDS,patternSpecIds:Object.freeze(G6A_U03_P06F17_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId)),symbolicRelationReasoningPromotedToRequired:false,genericSymbolicQuantityRelationReownershipAllowed:false,relationEquationUnknownSolvingIsCore:false,applicationImplementationAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false,r04ReclassificationAllowed:false,q018OrLaterTouched:false
})));
export const G6A_U03_P06F17_PATTERN_GROUPS=Object.freeze(G6A_U03_P06F17_TARGET_KP_IDS.map(kp=>Object.freeze({
  patternGroupId:GROUP[kp],sourceId:G6A_U03_P06F17_SOURCE_ID,unitCode:G6A_U03_P06F17_UNIT_CODE,unitTitle:G6A_U03_P06F17_UNIT_TITLE,displayName:NAME[kp],primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"numeric",publicQuestionMode:"numeric",representationTag:"text_numeric_pattern_relation",representationTags:Object.freeze(["pattern_relation","text_numeric",CORE[kp].toLowerCase()]),patternSpecIds:Object.freeze(G6A_U03_P06F17_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp).map(x=>x.patternSpecId)),allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
})));
export const G6A_U03_P06F17_SELECTOR_ROWS=Object.freeze(G6A_U03_P06F17_TARGET_KP_IDS.map(kp=>{const g=G6A_U03_P06F17_PATTERN_GROUPS.find(x=>x.primaryKnowledgePointId===kp);return Object.freeze({
  knowledgePointId:kp,sourceId:G6A_U03_P06F17_SOURCE_ID,unitCode:G6A_U03_P06F17_UNIT_CODE,unitTitle:G6A_U03_P06F17_UNIT_TITLE,displayName:NAME[kp],canonicalNameZh:NAME[kp],mode:"numeric",questionMode:"numeric",questionModes:Object.freeze(["numeric"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE",canonicalPatternGroupIds:Object.freeze([g.patternGroupId]),canonicalPatternSpecIds:Object.freeze(g.patternSpecIds.slice()),patternGroupIds:Object.freeze([g.patternGroupId]),patternSpecIds:Object.freeze(g.patternSpecIds.slice()),requiredCapabilityIds:G6A_U03_P06F17_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G6A_U03_P06F17_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P06F17_G6A_U03_SOURCE_BACKED_GENERALIZATION",productionUse:"full_product_w6_slice017_candidate"
});}));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG6AU03P06F17SelectorRow=id=>clone(G6A_U03_P06F17_SELECTOR_ROWS.find(x=>x.knowledgePointId===id)||null);
export const listG6AU03P06F17PatternGroups=id=>clone(G6A_U03_P06F17_PATTERN_GROUPS.filter(x=>x.primaryKnowledgePointId===id));
export const resolveG6AU03P06F17PatternSpecIds=id=>clone(G6A_U03_P06F17_PATTERN_SPECS.filter(x=>x.knowledgePointId===id).map(x=>x.patternSpecId));
export function auditG6AU03P06F17Projection(){const e=[];if(G6A_U03_P06F17_FORMAL_MAPPINGS.length!==3||G6A_U03_P06F17_PATTERN_GROUPS.length!==3||G6A_U03_P06F17_PATTERN_SPECS.length!==3)e.push("P06F17_CARDINALITY_INVALID");if(new Set(G6A_U03_P06F17_SPEC_IDS).size!==3)e.push("P06F17_PATTERN_ID_DUPLICATE");if(G6A_U03_P06F17_PATTERN_SPECS.some(x=>x.questionMode!=="numeric"||!x.requiresPatternSequenceReasoning||!x.requiresPatternRelationValidation||!x.requiresTextNumericRepresentation||x.symbolicRelationReasoningRequired||!x.symbolicRelationReasoningOptional||x.genericSymbolicQuantityRelationReownershipAllowed||x.relationEquationUnknownSolvingAllowed||x.applicationAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P06F17_PATTERN_SCOPE_INVALID");if(G6A_U03_P06F17_FORMAL_MAPPINGS.some(x=>x.primaryRuntimeProfileId!=="profile_pattern_relation"||x.symbolicRelationReasoningPromotedToRequired||x.genericSymbolicQuantityRelationReownershipAllowed||x.relationEquationUnknownSolvingIsCore||x.r04ReclassificationAllowed||x.q018OrLaterTouched))e.push("P06F17_MAPPING_SCOPE_INVALID");return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:3,formalMappings:3})});}
