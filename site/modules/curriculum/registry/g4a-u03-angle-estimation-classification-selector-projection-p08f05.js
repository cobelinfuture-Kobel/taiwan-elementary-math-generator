export const P08F05_TASK_ID="P08F_W8DirectProductVerticalSlice005Implementation";
export const G4A_U03_P08F05_SOURCE_ID="g4a_u03_4a03";
export const G4A_U03_P08F05_UNIT_CODE="4A-U03";
export const G4A_U03_P08F05_UNIT_TITLE="角度";
export const G4A_U03_P08F05_KP_ID="kp_angle_estimation_and_classification";
export const G4A_U03_P08F05_PRIOR_KP_IDS=Object.freeze(["kp_protractor_angle_measurement","kp_angle_composition_decomposition","kp_rotation_angle_clock"]);
export const G4A_U03_P08F05_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_unknown_angle_linear_full_vertical"]);
export const G4A_U03_P08F05_BLOCKING_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4A_U03_P08F05_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
export const G4A_U03_P08F05_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U03_P08F05_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G4A_U03_P08F05_RELATIONS=Object.freeze(["ESTIMATE_ANGLE_USING_REFERENCE_ANGLE","CLASSIFY_ANGLE_BY_MAGNITUDE_RANGE","RECOGNIZE_CLASSIFICATION_INVARIANT_UNDER_ARM_LENGTH_CHANGE"]);
export const G4A_U03_P08F05_SPEC_IDS=Object.freeze(["ps_g4a_u03_estimate_angle_from_right_angle_reference","ps_g4a_u03_classify_angle_by_magnitude","ps_g4a_u03_arm_length_invariant_classification"]);
export const G4A_U03_P08F05_PATTERN_GROUP=Object.freeze({
 patternGroupId:"pg_g4a_u03_angle_estimation_classification",sourceId:G4A_U03_P08F05_SOURCE_ID,unitCode:G4A_U03_P08F05_UNIT_CODE,unitTitle:G4A_U03_P08F05_UNIT_TITLE,displayName:"角度估測與分類",primaryKnowledgePointId:G4A_U03_P08F05_KP_ID,knowledgePointIds:Object.freeze([G4A_U03_P08F05_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"angle_estimation_classification_diagram",representationTags:Object.freeze(["geometry","angle","estimation","classification","reference_angle","diagram"]),patternSpecIds:G4A_U03_P08F05_SPEC_IDS,allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(index,semanticCore,answerDomain,diagramMode){
 return Object.freeze({patternSpecId:G4A_U03_P08F05_SPEC_IDS[index],knowledgePointId:G4A_U03_P08F05_KP_ID,patternGroupId:G4A_U03_P08F05_PATTERN_GROUP.patternGroupId,patternFamilyId:"ANGLE_ESTIMATION_CLASSIFICATION",semanticCore,relation:G4A_U03_P08F05_RELATIONS[index],questionMode:"diagram",answerDomain,representation:"angle_estimation_classification_diagram",diagramMode,referenceAngleEstimateRequired:index===0,classificationByAngleMagnitudeRange:index!==0,classificationIndependentOfArmLength:index===2,protractorMeasurementAllowed:false,angleCompositionDecompositionAllowed:false,rotationClockAngleAllowed:false,linearFullVerticalUnknownAngleAllowed:false,geometryConstructionAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G4A_U03_P08F05_PATTERN_SPECS=Object.freeze([
 spec(0,"ANGLE_ESTIMATION_AND_CLASSIFICATION_BY_REFERENCE_ANGLE","APPROXIMATE_INTEGER_DEGREES","ESTIMATE_REFERENCE_90"),
 spec(1,"ANGLE_ESTIMATION_AND_CLASSIFICATION_BY_REFERENCE_ANGLE","ANGLE_CLASSIFICATION_ZH","CLASSIFY_SINGLE"),
 spec(2,"ANGLE_ESTIMATION_AND_CLASSIFICATION_BY_REFERENCE_ANGLE","ANGLE_CLASSIFICATION_ZH","ARM_LENGTH_INVARIANT_PAIR")
]);
export const G4A_U03_P08F05_FORMAL_MAPPING=Object.freeze({
 mappingId:"fm_g4a_u03_angle_estimation_classification_p08f05",sourceId:G4A_U03_P08F05_SOURCE_ID,sourcePages:Object.freeze([1,2]),r02EvidencePages:Object.freeze([1,2]),knowledgePointId:G4A_U03_P08F05_KP_ID,canonicalNameZh:"角度估測與分類",capabilityStatement:"學生能以基準角估測並分類銳角、直角、鈍角、平角與周角。",reasoningInvariant:"角的類型由角度範圍決定，與邊長無關。",sourceSemanticCore:"ANGLE_ESTIMATION_AND_CLASSIFICATION_BY_REFERENCE_ANGLE",primaryRuntimeProfileId:"profile_geometry_property",classificationRuleId:"rule_geometry_property",appliedRuntimeModifierIds:G4A_U03_P08F05_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G4A_U03_P08F05_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G4A_U03_P08F05_OPTIONAL_CAPABILITY_IDS,blockingCapabilityIds:G4A_U03_P08F05_BLOCKING_CAPABILITY_IDS,patternSpecIds:G4A_U03_P08F05_SPEC_IDS,controlledRepresentationCarrier:"REFERENCE_ANGLE_AND_CLASSIFICATION_DIAGRAM",sourceLearnerFigureCopied:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G4A_U03_P08F05_SELECTOR_ROW=Object.freeze({
 knowledgePointId:G4A_U03_P08F05_KP_ID,sourceId:G4A_U03_P08F05_SOURCE_ID,unitCode:G4A_U03_P08F05_UNIT_CODE,unitTitle:G4A_U03_P08F05_UNIT_TITLE,displayName:"角度估測與分類",canonicalNameZh:"角度估測與分類",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",canonicalPatternGroupIds:Object.freeze([G4A_U03_P08F05_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G4A_U03_P08F05_SPEC_IDS,patternGroupIds:Object.freeze([G4A_U03_P08F05_PATTERN_GROUP.patternGroupId]),patternSpecIds:G4A_U03_P08F05_SPEC_IDS,requiredCapabilityIds:G4A_U03_P08F05_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G4A_U03_P08F05_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P08F05_G4A_U03_SOURCE_BACKED_ANGLE_ESTIMATION_CLASSIFICATION",productionUse:"full_product_w8_slice005_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU03P08F05SelectorRow=id=>id===G4A_U03_P08F05_KP_ID?clone(G4A_U03_P08F05_SELECTOR_ROW):null;
export const listG4AU03P08F05PatternGroups=id=>id===G4A_U03_P08F05_KP_ID?[clone(G4A_U03_P08F05_PATTERN_GROUP)]:[];
export const resolveG4AU03P08F05PatternSpecIds=id=>id===G4A_U03_P08F05_KP_ID?clone(G4A_U03_P08F05_SPEC_IDS):[];
export function auditG4AU03P08F05Projection(){
 const e=[];
 if(G4A_U03_P08F05_PATTERN_SPECS.length!==3||G4A_U03_P08F05_RELATIONS.length!==3||G4A_U03_P08F05_FORMAL_MAPPING.patternSpecIds.length!==3)e.push("P08F05_CARDINALITY_INVALID");
 if(G4A_U03_P08F05_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.protractorMeasurementAllowed||x.angleCompositionDecompositionAllowed||x.rotationClockAngleAllowed||x.linearFullVerticalUnknownAngleAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F05_SCOPE_INVALID");
 if(G4A_U03_P08F05_FORMAL_MAPPING.primaryRuntimeProfileId!=="profile_geometry_property"||G4A_U03_P08F05_FORMAL_MAPPING.classificationRuleId!=="rule_geometry_property"||G4A_U03_P08F05_FORMAL_MAPPING.appliedRuntimeModifierIds.length!==0||G4A_U03_P08F05_FORMAL_MAPPING.r04ReclassificationAllowed||G4A_U03_P08F05_FORMAL_MAPPING.frozenQueueMutationAllowed||G4A_U03_P08F05_FORMAL_MAPPING.sourceLearnerFigureCopied)e.push("P08F05_MAPPING_SCOPE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
