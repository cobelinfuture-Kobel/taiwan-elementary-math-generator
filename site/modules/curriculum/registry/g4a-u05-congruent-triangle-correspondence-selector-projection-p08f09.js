export const P08F09_TASK_ID="P08F_W8DirectProductVerticalSlice009Implementation";
export const G4A_U05_P08F09_SOURCE_ID="g4a_u05_4a05";
export const G4A_U05_P08F09_UNIT_CODE="4A-U05";
export const G4A_U05_P08F09_UNIT_TITLE="三角形與全等";
export const G4A_U05_P08F09_KP_ID="kp_g4a_u05_congruent_triangle_correspondence";
export const G4A_U05_P08F09_PRIOR_KP_IDS=Object.freeze(["kp_g4a_u05_triangle_elements_naming","kp_g4a_u05_triangle_side_classification","kp_g4a_u05_triangle_inequality","kp_g4a_u05_triangle_angle_classification"]);
export const G4A_U05_P08F09_PROTECTED_FUTURE_KP_IDS=Object.freeze([]);
export const G4A_U05_P08F09_BLOCKING_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4A_U05_P08F09_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
export const G4A_U05_P08F09_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U05_P08F09_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G4A_U05_P08F09_RELATIONS=Object.freeze(["IDENTIFY_CONGRUENT_TRIANGLE_PAIR","MATCH_CORRESPONDING_VERTICES_SIDES_ANGLES","PRESERVE_CORRESPONDENCE_UNDER_TRANSLATION_ROTATION_REFLECTION"]);
export const G4A_U05_P08F09_SPEC_IDS=Object.freeze(["ps_g4a_u05_congruent_identify_pair","ps_g4a_u05_congruent_match_correspondence","ps_g4a_u05_congruent_preserve_measure"]);
export const G4A_U05_P08F09_PATTERN_GROUP=Object.freeze({
 patternGroupId:"pg_g4a_u05_congruent_triangle_correspondence",
 sourceId:G4A_U05_P08F09_SOURCE_ID,
 unitCode:G4A_U05_P08F09_UNIT_CODE,
 unitTitle:G4A_U05_P08F09_UNIT_TITLE,
 displayName:"全等三角形對應關係",
 primaryKnowledgePointId:G4A_U05_P08F09_KP_ID,
 knowledgePointIds:Object.freeze([G4A_U05_P08F09_KP_ID]),
 supportClass:"A",
 mode:"diagram",
 publicQuestionMode:"diagram",
 representationTag:"congruent_triangle_correspondence_diagram",
 representationTags:Object.freeze(["geometry","triangle","congruence","correspondence","rigid-motion","diagram"]),
 patternSpecIds:G4A_U05_P08F09_SPEC_IDS,
 allocationPolicy:"balanced_pattern_spec",
 visibilityStatus:"visible",
 holdReason:null
});
function spec(index,answerDomain,taskForm){
 return Object.freeze({
  patternSpecId:G4A_U05_P08F09_SPEC_IDS[index],
  knowledgePointId:G4A_U05_P08F09_KP_ID,
  patternGroupId:G4A_U05_P08F09_PATTERN_GROUP.patternGroupId,
  patternFamilyId:"CONGRUENT_TRIANGLE_CORRESPONDENCE",
  semanticCore:"CONGRUENT_TRIANGLE_CORRESPONDENCE_UNDER_RIGID_MOTION",
  relation:G4A_U05_P08F09_RELATIONS[index],
  taskForm,
  questionMode:"diagram",
  answerDomain,
  representation:"congruent_triangle_correspondence_diagram",
  allowedRigidMotions:Object.freeze(["TRANSLATION","ROTATION","REFLECTION"]),
  sameShapeRequired:true,
  sameSizeRequired:true,
  correspondingSidesEqual:true,
  correspondingAnglesEqual:true,
  vertexCorrespondenceMustBeConsistent:true,
  transformationPreservesCongruence:true,
  triangleElementsNamingAllowed:false,
  triangleSideClassificationAllowed:false,
  triangleInequalityAllowed:false,
  triangleAngleClassificationAllowed:false,
  geometryConstructionAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
 });
}
export const G4A_U05_P08F09_PATTERN_SPECS=Object.freeze([
 spec(0,"CONGRUENCE_JUDGMENT_ZH","IDENTIFY_PAIR"),
 spec(1,"CORRESPONDING_ELEMENT_TOKEN","MATCH_VERTEX_SIDE_OR_ANGLE"),
 spec(2,"INTEGER_LENGTH_CM","TRANSFER_CORRESPONDING_SIDE_MEASURE")
]);
export const G4A_U05_P08F09_FORMAL_MAPPING=Object.freeze({
 mappingId:"fm_g4a_u05_congruent_triangle_correspondence_p08f09",
 sourceId:G4A_U05_P08F09_SOURCE_ID,
 sourcePages:Object.freeze([1,2]),
 r02EvidencePages:Object.freeze([1,2]),
 knowledgePointId:G4A_U05_P08F09_KP_ID,
 canonicalNameZh:"全等三角形對應關係",
 capabilityStatement:"學生能辨認全等圖形並配對對應邊與對應角。",
 reasoningInvariant:"全等圖形經平移、旋轉或翻轉後形狀大小不變，對應邊角分別相等。",
 sourceSemanticCore:"CONGRUENT_TRIANGLE_CORRESPONDENCE_UNDER_RIGID_MOTION",
 primaryRuntimeProfileId:"profile_geometry_property",
 classificationRuleId:"rule_geometry_property",
 appliedRuntimeModifierIds:G4A_U05_P08F09_APPLIED_MODIFIER_IDS,
 requiredCapabilityIds:G4A_U05_P08F09_REQUIRED_CAPABILITY_IDS,
 optionalCapabilityIds:G4A_U05_P08F09_OPTIONAL_CAPABILITY_IDS,
 blockingCapabilityIds:G4A_U05_P08F09_BLOCKING_CAPABILITY_IDS,
 patternSpecIds:G4A_U05_P08F09_SPEC_IDS,
 controlledRepresentationCarrier:"DEDICATED_CONGRUENT_TRIANGLE_CORRESPONDENCE_DIAGRAM",
 sourceLearnerFigureCopied:false,
 r04ReclassificationAllowed:false,
 frozenQueueMutationAllowed:false
});
export const G4A_U05_P08F09_SELECTOR_ROW=Object.freeze({
 knowledgePointId:G4A_U05_P08F09_KP_ID,
 sourceId:G4A_U05_P08F09_SOURCE_ID,
 unitCode:G4A_U05_P08F09_UNIT_CODE,
 unitTitle:G4A_U05_P08F09_UNIT_TITLE,
 displayName:"全等三角形對應關係",
 canonicalNameZh:"全等三角形對應關係",
 mode:"diagram",
 questionMode:"diagram",
 questionModes:Object.freeze(["diagram"]),
 supportClass:"A",
 visibilityStatus:"visible",
 selectorStatus:"visible",
 holdReason:null,
 applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
 canonicalPatternGroupIds:Object.freeze([G4A_U05_P08F09_PATTERN_GROUP.patternGroupId]),
 canonicalPatternSpecIds:G4A_U05_P08F09_SPEC_IDS,
 patternGroupIds:Object.freeze([G4A_U05_P08F09_PATTERN_GROUP.patternGroupId]),
 patternSpecIds:G4A_U05_P08F09_SPEC_IDS,
 requiredCapabilityIds:G4A_U05_P08F09_REQUIRED_CAPABILITY_IDS,
 optionalCapabilityIds:G4A_U05_P08F09_OPTIONAL_CAPABILITY_IDS,
 qaStatusLabel:"P08F09_G4A_U05_SOURCE_BACKED_CONGRUENT_TRIANGLE_CORRESPONDENCE",
 productionUse:"full_product_w8_slice009_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU05P08F09SelectorRow=id=>id===G4A_U05_P08F09_KP_ID?clone(G4A_U05_P08F09_SELECTOR_ROW):null;
export const listG4AU05P08F09PatternGroups=id=>id===G4A_U05_P08F09_KP_ID?[clone(G4A_U05_P08F09_PATTERN_GROUP)]:[];
export const resolveG4AU05P08F09PatternSpecIds=id=>id===G4A_U05_P08F09_KP_ID?clone(G4A_U05_P08F09_SPEC_IDS):[];
export function auditG4AU05P08F09Projection(){
 const e=[],m=G4A_U05_P08F09_FORMAL_MAPPING;
 if(G4A_U05_P08F09_PATTERN_SPECS.length!==3||G4A_U05_P08F09_RELATIONS.length!==3||new Set(G4A_U05_P08F09_SPEC_IDS).size!==3)e.push("P08F09_CARDINALITY_INVALID");
 if(G4A_U05_P08F09_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.representation!=="congruent_triangle_correspondence_diagram"||x.allowedRigidMotions.join("|")!=="TRANSLATION|ROTATION|REFLECTION"||x.sameShapeRequired!==true||x.sameSizeRequired!==true||x.correspondingSidesEqual!==true||x.correspondingAnglesEqual!==true||x.vertexCorrespondenceMustBeConsistent!==true||x.transformationPreservesCongruence!==true||x.triangleElementsNamingAllowed||x.triangleSideClassificationAllowed||x.triangleInequalityAllowed||x.triangleAngleClassificationAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))e.push("P08F09_PATTERN_SCOPE_INVALID");
 if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied)e.push("P08F09_MAPPING_SCOPE_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
