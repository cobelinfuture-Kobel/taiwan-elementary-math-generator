export const P08F07_TASK_ID="P08F_W8DirectProductVerticalSlice007Implementation";
export const G4A_U03_P08F07_SOURCE_ID="g4a_u03_4a03";
export const G4A_U03_P08F07_UNIT_CODE="4A-U03";
export const G4A_U03_P08F07_UNIT_TITLE="角度";
export const G4A_U03_P08F07_KP_ID="kp_unknown_angle_linear_full_vertical";
export const G4A_U03_P08F07_PRIOR_KP_IDS=Object.freeze(["kp_protractor_angle_measurement","kp_angle_composition_decomposition","kp_rotation_angle_clock","kp_angle_estimation_and_classification"]);
export const G4A_U03_P08F07_PROTECTED_FUTURE_KP_IDS=Object.freeze([]);
export const G4A_U03_P08F07_BLOCKING_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4A_U03_P08F07_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
export const G4A_U03_P08F07_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U03_P08F07_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G4A_U03_P08F07_RELATIONS=Object.freeze(["LINEAR_ADJACENT_ANGLES_SUM_TO_180","FULL_TURN_ANGLES_SUM_TO_360","VERTICAL_ANGLES_ARE_EQUAL"]);
export const G4A_U03_P08F07_SPEC_IDS=Object.freeze(["ps_g4a_u03_unknown_angle_linear_pair","ps_g4a_u03_unknown_angle_full_turn","ps_g4a_u03_unknown_angle_vertical_pair"]);
export const G4A_U03_P08F07_PATTERN_GROUP=Object.freeze({
 patternGroupId:"pg_g4a_u03_unknown_angle_linear_full_vertical",sourceId:G4A_U03_P08F07_SOURCE_ID,unitCode:G4A_U03_P08F07_UNIT_CODE,unitTitle:G4A_U03_P08F07_UNIT_TITLE,displayName:"平角周角對頂角未知角",primaryKnowledgePointId:G4A_U03_P08F07_KP_ID,knowledgePointIds:Object.freeze([G4A_U03_P08F07_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"unknown_angle_linear_full_vertical_diagram",representationTags:Object.freeze(["geometry","angle","linear-pair","full-turn","vertical-angle","unknown-angle","diagram"]),patternSpecIds:G4A_U03_P08F07_SPEC_IDS,allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null
});
function spec(index,diagramMode){
 return Object.freeze({patternSpecId:G4A_U03_P08F07_SPEC_IDS[index],knowledgePointId:G4A_U03_P08F07_KP_ID,patternGroupId:G4A_U03_P08F07_PATTERN_GROUP.patternGroupId,patternFamilyId:"UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL",semanticCore:"UNKNOWN_ANGLE_FROM_LINEAR_FULL_AND_VERTICAL_ANGLE_RELATIONS",relation:G4A_U03_P08F07_RELATIONS[index],questionMode:"diagram",answerDomain:"INTEGER_DEGREES",representation:"unknown_angle_linear_full_vertical_diagram",diagramMode,linearAdjacentAngleSumDegrees:180,fullTurnAngleSumDegrees:360,verticalAnglesEqual:true,unknownAngleFromExplicitRelation:true,protractorMeasurementAllowed:false,generalAngleCompositionReownershipAllowed:false,rotationClockAngleAllowed:false,estimationClassificationAllowed:false,geometryConstructionAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G4A_U03_P08F07_PATTERN_SPECS=Object.freeze([
 spec(0,"LINEAR_PAIR_REMAINDER"),
 spec(1,"FULL_TURN_REMAINDER"),
 spec(2,"VERTICAL_OPPOSITE_EQUAL")
]);
export const G4A_U03_P08F07_FORMAL_MAPPING=Object.freeze({
 mappingId:"fm_g4a_u03_unknown_angle_linear_full_vertical_p08f07",sourceId:G4A_U03_P08F07_SOURCE_ID,sourcePages:Object.freeze([1,2]),r02EvidencePages:Object.freeze([1,2]),knowledgePointId:G4A_U03_P08F07_KP_ID,canonicalNameZh:"平角周角對頂角未知角",capabilityStatement:"學生能利用平角、周角與對頂角性質求未知角。",reasoningInvariant:"一直線上的相鄰角和為180度，一周為360度，對頂角相等。",sourceSemanticCore:"UNKNOWN_ANGLE_FROM_LINEAR_FULL_AND_VERTICAL_ANGLE_RELATIONS",primaryRuntimeProfileId:"profile_geometry_property",classificationRuleId:"rule_geometry_property",appliedRuntimeModifierIds:G4A_U03_P08F07_APPLIED_MODIFIER_IDS,requiredCapabilityIds:G4A_U03_P08F07_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G4A_U03_P08F07_OPTIONAL_CAPABILITY_IDS,blockingCapabilityIds:G4A_U03_P08F07_BLOCKING_CAPABILITY_IDS,patternSpecIds:G4A_U03_P08F07_SPEC_IDS,controlledRepresentationCarrier:"DEDICATED_LINEAR_FULL_VERTICAL_UNKNOWN_ANGLE_DIAGRAM",sourceLearnerFigureCopied:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false
});
export const G4A_U03_P08F07_SELECTOR_ROW=Object.freeze({
 knowledgePointId:G4A_U03_P08F07_KP_ID,sourceId:G4A_U03_P08F07_SOURCE_ID,unitCode:G4A_U03_P08F07_UNIT_CODE,unitTitle:G4A_U03_P08F07_UNIT_TITLE,displayName:"平角周角對頂角未知角",canonicalNameZh:"平角周角對頂角未知角",mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",canonicalPatternGroupIds:Object.freeze([G4A_U03_P08F07_PATTERN_GROUP.patternGroupId]),canonicalPatternSpecIds:G4A_U03_P08F07_SPEC_IDS,patternGroupIds:Object.freeze([G4A_U03_P08F07_PATTERN_GROUP.patternGroupId]),patternSpecIds:G4A_U03_P08F07_SPEC_IDS,requiredCapabilityIds:G4A_U03_P08F07_REQUIRED_CAPABILITY_IDS,optionalCapabilityIds:G4A_U03_P08F07_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P08F07_G4A_U03_SOURCE_BACKED_UNKNOWN_ANGLE_LINEAR_FULL_VERTICAL",productionUse:"full_product_w8_slice007_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU03P08F07SelectorRow=id=>id===G4A_U03_P08F07_KP_ID?clone(G4A_U03_P08F07_SELECTOR_ROW):null;
export const listG4AU03P08F07PatternGroups=id=>id===G4A_U03_P08F07_KP_ID?[clone(G4A_U03_P08F07_PATTERN_GROUP)]:[];
export const resolveG4AU03P08F07PatternSpecIds=id=>id===G4A_U03_P08F07_KP_ID?clone(G4A_U03_P08F07_SPEC_IDS):[];
export function auditG4AU03P08F07Projection(){
 const e=[],m=G4A_U03_P08F07_FORMAL_MAPPING;
 if(G4A_U03_P08F07_PATTERN_SPECS.length!==3||G4A_U03_P08F07_RELATIONS.length!==3||new Set(G4A_U03_P08F07_SPEC_IDS).size!==3)e.push("P08F07_CARDINALITY_INVALID");
 if(G4A_U03_P08F07_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.answerDomain!=="INTEGER_DEGREES"||x.representation!=="unknown_angle_linear_full_vertical_diagram"||x.linearAdjacentAngleSumDegrees!==180||x.fullTurnAngleSumDegrees!==360||x.verticalAnglesEqual!==true||x.unknownAngleFromExplicitRelation!==true||x.protractorMeasurementAllowed||x.generalAngleCompositionReownershipAllowed||x.rotationClockAngleAllowed||x.estimationClassificationAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F07_PATTERN_SCOPE_INVALID");
 if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied)e.push("P08F07_MAPPING_SCOPE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
