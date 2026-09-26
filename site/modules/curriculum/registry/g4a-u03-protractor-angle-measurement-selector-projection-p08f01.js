export const P08F01_TASK_ID="P08F_W8DirectProductVerticalSlice001Implementation";
export const G4A_U03_P08F01_SOURCE_ID="g4a_u03_4a03";
export const G4A_U03_P08F01_UNIT_CODE="4A-U03";
export const G4A_U03_P08F01_UNIT_TITLE="角度";
export const G4A_U03_P08F01_KP_ID="kp_protractor_angle_measurement";
export const G4A_U03_P08F01_PROTECTED_FUTURE_KP_IDS=Object.freeze([
  "kp_angle_composition_decomposition",
  "kp_rotation_angle_clock",
  "kp_angle_estimation_and_classification",
  "kp_unknown_angle_linear_full_vertical"
]);
export const G4A_U03_P08F01_BLOCKING_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_scale_instrument_representation"
]);
export const G4A_U03_P08F01_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_geometry_property_reasoning",
  "cap_geometry_domain_validator",
  "cap_geometry_diagram_representation",
  "cap_scale_instrument_representation"
]);
export const G4A_U03_P08F01_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U03_P08F01_APPLIED_MODIFIER_IDS=Object.freeze(["mod_scale_instrument"]);
export const G4A_U03_P08F01_INCLUDED_RELATIONS=Object.freeze([
  "READ_PROTRACTOR_FROM_ZERO_LEFT",
  "READ_PROTRACTOR_FROM_ZERO_RIGHT",
  "VERIFY_PROTRACTOR_ALIGNMENT"
]);
export const G4A_U03_P08F01_SPEC_IDS=Object.freeze([
  "ps_g4a_u03_protractor_read_zero_left",
  "ps_g4a_u03_protractor_read_zero_right",
  "ps_g4a_u03_protractor_verify_alignment"
]);
export const G4A_U03_P08F01_PATTERN_GROUP=Object.freeze({
  patternGroupId:"pg_g4a_u03_protractor_angle_measurement",
  sourceId:G4A_U03_P08F01_SOURCE_ID,
  unitCode:G4A_U03_P08F01_UNIT_CODE,
  unitTitle:G4A_U03_P08F01_UNIT_TITLE,
  displayName:"量角器量角",
  primaryKnowledgePointId:G4A_U03_P08F01_KP_ID,
  knowledgePointIds:Object.freeze([G4A_U03_P08F01_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"protractor_angle_measurement_diagram",
  representationTags:Object.freeze(["geometry","angle","protractor","scale_instrument","diagram"]),
  patternSpecIds:G4A_U03_P08F01_SPEC_IDS,
  allocationPolicy:"balanced_pattern_spec",
  visibilityStatus:"visible",
  holdReason:null
});
function spec(patternSpecId,relation,baselineSide,answerDomain){
  return Object.freeze({
    patternSpecId,
    knowledgePointId:G4A_U03_P08F01_KP_ID,
    patternGroupId:G4A_U03_P08F01_PATTERN_GROUP.patternGroupId,
    patternFamilyId:"PROTRACTOR_ANGLE_MEASUREMENT",
    semanticCore:"PROTRACTOR_CENTER_BASELINE_AND_SCALE_READING",
    relation,
    baselineSide,
    questionMode:"diagram",
    answerDomain,
    representation:"protractor_angle_measurement_diagram",
    protractorCenterMustAlignWithVertex:true,
    zeroDegreeBaselineMustAlignWithOneRay:true,
    readingDirectionMustMatchSelectedZeroScale:true,
    applicationContextAllowed:false,
    angleCompositionAllowed:false,
    rotationClockAllowed:false,
    estimationClassificationAllowed:false,
    unknownAngleAllowed:false,
    sameUnitMixedAllowed:false,
    crossUnitMixedAllowed:false
  });
}
export const G4A_U03_P08F01_PATTERN_SPECS=Object.freeze([
  spec(G4A_U03_P08F01_SPEC_IDS[0],G4A_U03_P08F01_INCLUDED_RELATIONS[0],"LEFT","INTEGER_DEGREES"),
  spec(G4A_U03_P08F01_SPEC_IDS[1],G4A_U03_P08F01_INCLUDED_RELATIONS[1],"RIGHT","INTEGER_DEGREES"),
  spec(G4A_U03_P08F01_SPEC_IDS[2],G4A_U03_P08F01_INCLUDED_RELATIONS[2],"VARIABLE","ALIGNMENT_STATE_4WAY_ZH")
]);
export const G4A_U03_P08F01_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g4a_u03_protractor_angle_measurement_p08f01",
  sourceId:G4A_U03_P08F01_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  r02EvidencePages:Object.freeze([1,2]),
  knowledgePointId:G4A_U03_P08F01_KP_ID,
  canonicalNameZh:"量角器量角",
  capabilityStatement:"學生能正確放置量角器並讀取角度。",
  reasoningInvariant:"量角器中心對準頂點、零度線對準一邊，從正確刻度方向讀值。",
  sourceSemanticCore:"PROTRACTOR_CENTER_BASELINE_AND_SCALE_READING",
  primaryRuntimeProfileId:"profile_geometry_property",
  classificationRuleId:"rule_geometry_property",
  appliedRuntimeModifierIds:G4A_U03_P08F01_APPLIED_MODIFIER_IDS,
  requiredCapabilityIds:G4A_U03_P08F01_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G4A_U03_P08F01_OPTIONAL_CAPABILITY_IDS,
  blockingCapabilityIds:G4A_U03_P08F01_BLOCKING_CAPABILITY_IDS,
  patternSpecIds:G4A_U03_P08F01_SPEC_IDS,
  r04ReclassificationAllowed:false,
  frozenQueueMutationAllowed:false
});
export const G4A_U03_P08F01_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G4A_U03_P08F01_KP_ID,
  sourceId:G4A_U03_P08F01_SOURCE_ID,
  unitCode:G4A_U03_P08F01_UNIT_CODE,
  unitTitle:G4A_U03_P08F01_UNIT_TITLE,
  displayName:"量角器量角",
  canonicalNameZh:"量角器量角",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
  canonicalPatternGroupIds:Object.freeze([G4A_U03_P08F01_PATTERN_GROUP.patternGroupId]),
  canonicalPatternSpecIds:G4A_U03_P08F01_SPEC_IDS,
  patternGroupIds:Object.freeze([G4A_U03_P08F01_PATTERN_GROUP.patternGroupId]),
  patternSpecIds:G4A_U03_P08F01_SPEC_IDS,
  requiredCapabilityIds:G4A_U03_P08F01_REQUIRED_CAPABILITY_IDS,
  optionalCapabilityIds:G4A_U03_P08F01_OPTIONAL_CAPABILITY_IDS,
  qaStatusLabel:"P08F01_G4A_U03_SOURCE_BACKED_PROTRACTOR_MEASUREMENT",
  productionUse:"full_product_w8_slice001_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU03P08F01SelectorRow=id=>id===G4A_U03_P08F01_KP_ID?clone(G4A_U03_P08F01_SELECTOR_ROW):null;
export const listG4AU03P08F01PatternGroups=id=>id===G4A_U03_P08F01_KP_ID?[clone(G4A_U03_P08F01_PATTERN_GROUP)]:[];
export const resolveG4AU03P08F01PatternSpecIds=id=>id===G4A_U03_P08F01_KP_ID?clone(G4A_U03_P08F01_SPEC_IDS):[];
export function auditG4AU03P08F01Projection(){
  const e=[];
  if(G4A_U03_P08F01_PATTERN_SPECS.length!==3||new Set(G4A_U03_P08F01_SPEC_IDS).size!==3)e.push("P08F01_PATTERN_CARDINALITY_INVALID");
  if(G4A_U03_P08F01_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.semanticCore!=="PROTRACTOR_CENTER_BASELINE_AND_SCALE_READING"||x.applicationContextAllowed||x.angleCompositionAllowed||x.rotationClockAllowed||x.estimationClassificationAllowed||x.unknownAngleAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F01_PATTERN_SCOPE_INVALID");
  const m=G4A_U03_P08F01_FORMAL_MAPPING;
  if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.join("|")!=="mod_scale_instrument"||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed)e.push("P08F01_MAPPING_SCOPE_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
