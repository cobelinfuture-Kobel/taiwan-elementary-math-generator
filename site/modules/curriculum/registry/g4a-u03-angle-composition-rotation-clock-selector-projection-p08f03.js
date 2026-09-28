export const P08F03_TASK_ID="P08F_W8DirectProductVerticalSlice003Implementation";
export const G4A_U03_P08F03_SOURCE_ID="g4a_u03_4a03";
export const G4A_U03_P08F03_UNIT_CODE="4A-U03";
export const G4A_U03_P08F03_UNIT_TITLE="角度";
export const G4A_U03_P08F03_ANGLE_KP_ID="kp_angle_composition_decomposition";
export const G4A_U03_P08F03_CLOCK_KP_ID="kp_rotation_angle_clock";
export const G4A_U03_P08F03_KP_IDS=Object.freeze([G4A_U03_P08F03_ANGLE_KP_ID,G4A_U03_P08F03_CLOCK_KP_ID]);
export const G4A_U03_P08F03_PROTECTED_PRIOR_KP_IDS=Object.freeze(["kp_protractor_angle_measurement"]);
export const G4A_U03_P08F03_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_angle_estimation_and_classification","kp_unknown_angle_linear_full_vertical"]);
export const G4A_U03_P08F03_BLOCKING_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_scale_instrument_representation"]);
const COMMON=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
export const G4A_U03_P08F03_REQUIRED_CAPABILITY_IDS_BY_KP=Object.freeze({
 [G4A_U03_P08F03_ANGLE_KP_ID]:COMMON,
 [G4A_U03_P08F03_CLOCK_KP_ID]:Object.freeze([...COMMON,"cap_scale_instrument_representation"])
});
export const G4A_U03_P08F03_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U03_P08F03_APPLIED_MODIFIER_IDS_BY_KP=Object.freeze({
 [G4A_U03_P08F03_ANGLE_KP_ID]:Object.freeze([]),
 [G4A_U03_P08F03_CLOCK_KP_ID]:Object.freeze(["mod_scale_instrument"])
});
export const G4A_U03_P08F03_RELATIONS_BY_KP=Object.freeze({
 [G4A_U03_P08F03_ANGLE_KP_ID]:Object.freeze(["COMPOSE_ADJACENT_NON_OVERLAPPING_ANGLES","DECOMPOSE_WHOLE_ANGLE_INTO_PARTS","SOLVE_MISSING_PART_FROM_WHOLE_AND_KNOWN_PART"]),
 [G4A_U03_P08F03_CLOCK_KP_ID]:Object.freeze(["ROTATION_TURN_TO_ANGLE","CLOCK_FACE_STEP_TO_ANGLE","CLOCK_HAND_ANGLE"])
});
export const G4A_U03_P08F03_SPEC_IDS_BY_KP=Object.freeze({
 [G4A_U03_P08F03_ANGLE_KP_ID]:Object.freeze(["ps_g4a_u03_compose_adjacent_angles","ps_g4a_u03_decompose_whole_angle","ps_g4a_u03_missing_angle_part"]),
 [G4A_U03_P08F03_CLOCK_KP_ID]:Object.freeze(["ps_g4a_u03_rotation_turn_to_angle","ps_g4a_u03_clock_steps_to_angle","ps_g4a_u03_clock_hands_angle"])
});
export const G4A_U03_P08F03_SPEC_IDS=Object.freeze(G4A_U03_P08F03_KP_IDS.flatMap(id=>G4A_U03_P08F03_SPEC_IDS_BY_KP[id]));
function group(kp,displayName,family,tags){
 const patternGroupId=kp===G4A_U03_P08F03_ANGLE_KP_ID?"pg_g4a_u03_angle_composition_decomposition":"pg_g4a_u03_rotation_angle_clock";
 return Object.freeze({patternGroupId,sourceId:G4A_U03_P08F03_SOURCE_ID,unitCode:G4A_U03_P08F03_UNIT_CODE,unitTitle:G4A_U03_P08F03_UNIT_TITLE,displayName,primaryKnowledgePointId:kp,knowledgePointIds:Object.freeze([kp]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"angle_composition_rotation_clock_diagram",representationTags:Object.freeze(["geometry","angle",family,"diagram",...tags]),patternSpecIds:G4A_U03_P08F03_SPEC_IDS_BY_KP[kp],allocationPolicy:"balanced_pattern_spec",visibilityStatus:"visible",holdReason:null});
}
export const G4A_U03_P08F03_PATTERN_GROUPS=Object.freeze([
 group(G4A_U03_P08F03_ANGLE_KP_ID,"角的合成與分解","angle_composition",["adjacent_angle","whole_part"]),
 group(G4A_U03_P08F03_CLOCK_KP_ID,"旋轉角與鐘面角","rotation_clock",["rotation","clock","scale_instrument"])
]);
const GROUP_BY_KP=new Map(G4A_U03_P08F03_PATTERN_GROUPS.map(x=>[x.primaryKnowledgePointId,x]));
function spec(kp,index,semanticCore,answerDomain,diagramMode){
 const relation=G4A_U03_P08F03_RELATIONS_BY_KP[kp][index],patternSpecId=G4A_U03_P08F03_SPEC_IDS_BY_KP[kp][index],group=GROUP_BY_KP.get(kp);
 return Object.freeze({patternSpecId,knowledgePointId:kp,patternGroupId:group.patternGroupId,patternFamilyId:kp===G4A_U03_P08F03_ANGLE_KP_ID?"ANGLE_COMPOSITION_DECOMPOSITION":"ROTATION_ANGLE_CLOCK",semanticCore,relation,questionMode:"diagram",answerDomain,representation:"angle_composition_rotation_clock_diagram",diagramMode,adjacentNonOverlappingRequired:kp===G4A_U03_P08F03_ANGLE_KP_ID,wholeEqualsPartsRequired:kp===G4A_U03_P08F03_ANGLE_KP_ID,fullTurnDegrees:kp===G4A_U03_P08F03_CLOCK_KP_ID?360:null,clockDivisionCount:kp===G4A_U03_P08F03_CLOCK_KP_ID?12:null,clockDegreesPerDivision:kp===G4A_U03_P08F03_CLOCK_KP_ID?30:null,protractorMeasurementAllowed:false,estimationClassificationAllowed:false,linearFullVerticalAngleAllowed:false,geometryConstructionAllowed:false,sameUnitMixedAllowed:false,crossUnitMixedAllowed:false});
}
export const G4A_U03_P08F03_PATTERN_SPECS=Object.freeze([
 spec(G4A_U03_P08F03_ANGLE_KP_ID,0,"ADJACENT_ANGLE_COMPOSITION_AND_WHOLE_PART_DECOMPOSITION","INTEGER_DEGREES","ADJACENT_COMPOSITION"),
 spec(G4A_U03_P08F03_ANGLE_KP_ID,1,"ADJACENT_ANGLE_COMPOSITION_AND_WHOLE_PART_DECOMPOSITION","INTEGER_DEGREES","WHOLE_PART_DECOMPOSITION"),
 spec(G4A_U03_P08F03_ANGLE_KP_ID,2,"ADJACENT_ANGLE_COMPOSITION_AND_WHOLE_PART_DECOMPOSITION","INTEGER_DEGREES","NAMED_RAY_MISSING_PART"),
 spec(G4A_U03_P08F03_CLOCK_KP_ID,0,"ROTATION_TURN_AND_CLOCK_FACE_ANGLE","INTEGER_DEGREES","ROTATION_TURN"),
 spec(G4A_U03_P08F03_CLOCK_KP_ID,1,"ROTATION_TURN_AND_CLOCK_FACE_ANGLE","INTEGER_DEGREES","CLOCK_STEP"),
 spec(G4A_U03_P08F03_CLOCK_KP_ID,2,"ROTATION_TURN_AND_CLOCK_FACE_ANGLE","INTEGER_DEGREES","CLOCK_HANDS")
]);
export const G4A_U03_P08F03_FORMAL_MAPPINGS=Object.freeze([
 Object.freeze({mappingId:"fm_g4a_u03_angle_composition_decomposition_p08f03",sourceId:G4A_U03_P08F03_SOURCE_ID,sourcePages:Object.freeze([1,2]),r02EvidencePages:Object.freeze([1,2]),knowledgePointId:G4A_U03_P08F03_ANGLE_KP_ID,canonicalNameZh:"角的合成與分解",capabilityStatement:"學生能將相鄰角合成或把大角分解求未知角。",reasoningInvariant:"相鄰且不重疊角的角度可相加，分解後各部分和等於原角。",sourceSemanticCore:"ADJACENT_ANGLE_COMPOSITION_AND_WHOLE_PART_DECOMPOSITION",primaryRuntimeProfileId:"profile_geometry_property",classificationRuleId:"rule_geometry_property",appliedRuntimeModifierIds:G4A_U03_P08F03_APPLIED_MODIFIER_IDS_BY_KP[G4A_U03_P08F03_ANGLE_KP_ID],requiredCapabilityIds:G4A_U03_P08F03_REQUIRED_CAPABILITY_IDS_BY_KP[G4A_U03_P08F03_ANGLE_KP_ID],optionalCapabilityIds:G4A_U03_P08F03_OPTIONAL_CAPABILITY_IDS,blockingCapabilityIds:Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]),patternSpecIds:G4A_U03_P08F03_SPEC_IDS_BY_KP[G4A_U03_P08F03_ANGLE_KP_ID],controlledRepresentationCarrier:"ADJACENT_RAY_WHOLE_PART_ANGLE_DIAGRAM",sourceLearnerFigureCopied:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false}),
 Object.freeze({mappingId:"fm_g4a_u03_rotation_angle_clock_p08f03",sourceId:G4A_U03_P08F03_SOURCE_ID,sourcePages:Object.freeze([1,2]),r02EvidencePages:Object.freeze([1,2]),knowledgePointId:G4A_U03_P08F03_CLOCK_KP_ID,canonicalNameZh:"旋轉角與鐘面角",capabilityStatement:"學生能把旋轉方向與圈數轉換為角度，並計算鐘面指針角。",reasoningInvariant:"一周為360度，鐘面12等分，每格30度。",sourceSemanticCore:"ROTATION_TURN_AND_CLOCK_FACE_ANGLE",primaryRuntimeProfileId:"profile_geometry_property",classificationRuleId:"rule_geometry_property",appliedRuntimeModifierIds:G4A_U03_P08F03_APPLIED_MODIFIER_IDS_BY_KP[G4A_U03_P08F03_CLOCK_KP_ID],requiredCapabilityIds:G4A_U03_P08F03_REQUIRED_CAPABILITY_IDS_BY_KP[G4A_U03_P08F03_CLOCK_KP_ID],optionalCapabilityIds:G4A_U03_P08F03_OPTIONAL_CAPABILITY_IDS,blockingCapabilityIds:G4A_U03_P08F03_BLOCKING_CAPABILITY_IDS,patternSpecIds:G4A_U03_P08F03_SPEC_IDS_BY_KP[G4A_U03_P08F03_CLOCK_KP_ID],controlledRepresentationCarrier:"ROTATION_AND_12_DIVISION_CLOCK_DIAGRAM",sourceLearnerFigureCopied:false,r04ReclassificationAllowed:false,frozenQueueMutationAllowed:false})
]);
function selectorRow(kp,displayName){
 const group=GROUP_BY_KP.get(kp);
 return Object.freeze({knowledgePointId:kp,sourceId:G4A_U03_P08F03_SOURCE_ID,unitCode:G4A_U03_P08F03_UNIT_CODE,unitTitle:G4A_U03_P08F03_UNIT_TITLE,displayName,canonicalNameZh:displayName,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",canonicalPatternGroupIds:Object.freeze([group.patternGroupId]),canonicalPatternSpecIds:G4A_U03_P08F03_SPEC_IDS_BY_KP[kp],patternGroupIds:Object.freeze([group.patternGroupId]),patternSpecIds:G4A_U03_P08F03_SPEC_IDS_BY_KP[kp],requiredCapabilityIds:G4A_U03_P08F03_REQUIRED_CAPABILITY_IDS_BY_KP[kp],optionalCapabilityIds:G4A_U03_P08F03_OPTIONAL_CAPABILITY_IDS,qaStatusLabel:"P08F03_G4A_U03_SOURCE_BACKED_"+(kp===G4A_U03_P08F03_ANGLE_KP_ID?"ANGLE_COMPOSITION":"ROTATION_CLOCK"),productionUse:"full_product_w8_slice003_candidate"});
}
export const G4A_U03_P08F03_SELECTOR_ROWS=Object.freeze([
 selectorRow(G4A_U03_P08F03_ANGLE_KP_ID,"角的合成與分解"),
 selectorRow(G4A_U03_P08F03_CLOCK_KP_ID,"旋轉角與鐘面角")
]);
const ROW_BY_KP=new Map(G4A_U03_P08F03_SELECTOR_ROWS.map(x=>[x.knowledgePointId,x])),clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU03P08F03SelectorRow=id=>clone(ROW_BY_KP.get(id)??null);
export const listG4AU03P08F03PatternGroups=id=>GROUP_BY_KP.has(id)?[clone(GROUP_BY_KP.get(id))]:[];
export const resolveG4AU03P08F03PatternSpecIds=id=>clone(G4A_U03_P08F03_SPEC_IDS_BY_KP[id]??[]);
export function auditG4AU03P08F03Projection(){
 const e=[];
 if(G4A_U03_P08F03_KP_IDS.length!==2||G4A_U03_P08F03_PATTERN_GROUPS.length!==2||G4A_U03_P08F03_PATTERN_SPECS.length!==6||G4A_U03_P08F03_FORMAL_MAPPINGS.length!==2)e.push("P08F03_CARDINALITY_INVALID");
 for(const kp of G4A_U03_P08F03_KP_IDS){const specs=G4A_U03_P08F03_PATTERN_SPECS.filter(x=>x.knowledgePointId===kp),mapping=G4A_U03_P08F03_FORMAL_MAPPINGS.find(x=>x.knowledgePointId===kp);if(specs.length!==3||!mapping||mapping.patternSpecIds.length!==3)e.push("P08F03_KP_MAPPING_INVALID:"+kp);}
 if(G4A_U03_P08F03_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.protractorMeasurementAllowed||x.estimationClassificationAllowed||x.linearFullVerticalAngleAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F03_SCOPE_INVALID");
 if(G4A_U03_P08F03_FORMAL_MAPPINGS.some(x=>x.primaryRuntimeProfileId!=="profile_geometry_property"||x.classificationRuleId!=="rule_geometry_property"||x.r04ReclassificationAllowed||x.frozenQueueMutationAllowed||x.sourceLearnerFigureCopied))e.push("P08F03_MAPPING_SCOPE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:6,formalMappings:2})});
}
