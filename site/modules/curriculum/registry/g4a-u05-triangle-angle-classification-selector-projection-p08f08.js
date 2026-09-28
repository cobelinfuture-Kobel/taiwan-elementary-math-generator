export const P08F08_TASK_ID="P08F_W8DirectProductVerticalSlice008Implementation";
export const G4A_U05_P08F08_SOURCE_ID="g4a_u05_4a05";
export const G4A_U05_P08F08_UNIT_CODE="4A-U05";
export const G4A_U05_P08F08_UNIT_TITLE="三角形與全等";
export const G4A_U05_P08F08_KP_ID="kp_g4a_u05_triangle_angle_classification";
export const G4A_U05_P08F08_PRIOR_KP_IDS=Object.freeze(["kp_g4a_u05_triangle_elements_naming","kp_g4a_u05_triangle_side_classification","kp_g4a_u05_triangle_inequality"]);
export const G4A_U05_P08F08_PROTECTED_FUTURE_KP_IDS=Object.freeze(["kp_g4a_u05_congruent_triangle_correspondence"]);
export const G4A_U05_P08F08_BLOCKING_CAPABILITY_IDS=Object.freeze(["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
export const G4A_U05_P08F08_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_pattern_spec_resolution","cap_deterministic_answer_model","cap_worksheet_document_assembly","cap_answer_key_projection","cap_html_print_renderer","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
export const G4A_U05_P08F08_OPTIONAL_CAPABILITY_IDS=Object.freeze(["cap_geometry_construction"]);
export const G4A_U05_P08F08_APPLIED_MODIFIER_IDS=Object.freeze([]);
export const G4A_U05_P08F08_RELATIONS=Object.freeze(["CLASSIFY_ACUTE_TRIANGLE_BY_INTERIOR_ANGLES","CLASSIFY_RIGHT_TRIANGLE_BY_INTERIOR_ANGLES","CLASSIFY_OBTUSE_TRIANGLE_BY_INTERIOR_ANGLES"]);
export const G4A_U05_P08F08_SPEC_IDS=Object.freeze(["ps_g4a_u05_triangle_angle_classify_acute","ps_g4a_u05_triangle_angle_classify_right","ps_g4a_u05_triangle_angle_classify_obtuse"]);
export const G4A_U05_P08F08_PATTERN_GROUP=Object.freeze({
 patternGroupId:"pg_g4a_u05_triangle_angle_classification",
 sourceId:G4A_U05_P08F08_SOURCE_ID,
 unitCode:G4A_U05_P08F08_UNIT_CODE,
 unitTitle:G4A_U05_P08F08_UNIT_TITLE,
 displayName:"依角度分類三角形",
 primaryKnowledgePointId:G4A_U05_P08F08_KP_ID,
 knowledgePointIds:Object.freeze([G4A_U05_P08F08_KP_ID]),
 supportClass:"A",
 mode:"diagram",
 publicQuestionMode:"diagram",
 representationTag:"triangle_angle_classification_diagram",
 representationTags:Object.freeze(["geometry","triangle","interior-angle","classification","rotation","diagram"]),
 patternSpecIds:G4A_U05_P08F08_SPEC_IDS,
 allocationPolicy:"balanced_pattern_spec",
 visibilityStatus:"visible",
 holdReason:null
});
function spec(index,category,rule){
 return Object.freeze({
  patternSpecId:G4A_U05_P08F08_SPEC_IDS[index],
  knowledgePointId:G4A_U05_P08F08_KP_ID,
  patternGroupId:G4A_U05_P08F08_PATTERN_GROUP.patternGroupId,
  patternFamilyId:"TRIANGLE_ANGLE_CLASSIFICATION",
  semanticCore:"TRIANGLE_CLASSIFICATION_BY_INTERIOR_ANGLE_STRUCTURE",
  relation:G4A_U05_P08F08_RELATIONS[index],
  targetCategory:category,
  classificationRule:rule,
  classificationBasis:"MAXIMUM_INTERIOR_ANGLE",
  questionMode:"diagram",
  answerDomain:"TRIANGLE_ANGLE_CLASS_ZH",
  representation:"triangle_angle_classification_diagram",
  exactlyOneCategoryRequired:true,
  rotationInvariant:true,
  triangleElementsNamingAllowed:false,
  triangleSideClassificationAllowed:false,
  triangleInequalityAllowed:false,
  congruentTriangleCorrespondenceAllowed:false,
  geometryConstructionAllowed:false,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false
 });
}
export const G4A_U05_P08F08_PATTERN_SPECS=Object.freeze([
 spec(0,"ACUTE_TRIANGLE","ALL_INTERIOR_ANGLES_LESS_THAN_90_DEGREES"),
 spec(1,"RIGHT_TRIANGLE","EXACTLY_ONE_INTERIOR_ANGLE_EQUALS_90_DEGREES"),
 spec(2,"OBTUSE_TRIANGLE","EXACTLY_ONE_INTERIOR_ANGLE_GREATER_THAN_90_DEGREES")
]);
export const G4A_U05_P08F08_FORMAL_MAPPING=Object.freeze({
 mappingId:"fm_g4a_u05_triangle_angle_classification_p08f08",
 sourceId:G4A_U05_P08F08_SOURCE_ID,
 sourcePages:Object.freeze([1,2]),
 r02EvidencePages:Object.freeze([1,2]),
 knowledgePointId:G4A_U05_P08F08_KP_ID,
 canonicalNameZh:"依角度分類三角形",
 capabilityStatement:"學生能依最大內角分類銳角、直角與鈍角三角形。",
 reasoningInvariant:"三角形只能依其角度結構歸入一種角類別。",
 sourceSemanticCore:"TRIANGLE_CLASSIFICATION_BY_INTERIOR_ANGLE_STRUCTURE",
 primaryRuntimeProfileId:"profile_geometry_property",
 classificationRuleId:"rule_geometry_property",
 appliedRuntimeModifierIds:G4A_U05_P08F08_APPLIED_MODIFIER_IDS,
 requiredCapabilityIds:G4A_U05_P08F08_REQUIRED_CAPABILITY_IDS,
 optionalCapabilityIds:G4A_U05_P08F08_OPTIONAL_CAPABILITY_IDS,
 blockingCapabilityIds:G4A_U05_P08F08_BLOCKING_CAPABILITY_IDS,
 patternSpecIds:G4A_U05_P08F08_SPEC_IDS,
 controlledRepresentationCarrier:"DEDICATED_TRIANGLE_ANGLE_CLASSIFICATION_DIAGRAM",
 sourceLearnerFigureCopied:false,
 r04ReclassificationAllowed:false,
 frozenQueueMutationAllowed:false
});
export const G4A_U05_P08F08_SELECTOR_ROW=Object.freeze({
 knowledgePointId:G4A_U05_P08F08_KP_ID,
 sourceId:G4A_U05_P08F08_SOURCE_ID,
 unitCode:G4A_U05_P08F08_UNIT_CODE,
 unitTitle:G4A_U05_P08F08_UNIT_TITLE,
 displayName:"依角度分類三角形",
 canonicalNameZh:"依角度分類三角形",
 mode:"diagram",
 questionMode:"diagram",
 questionModes:Object.freeze(["diagram"]),
 supportClass:"A",
 visibilityStatus:"visible",
 selectorStatus:"visible",
 holdReason:null,
 applicationClassification:"APPLICATION_COMPATIBLE_DIAGRAM_CORE_ONLY",
 canonicalPatternGroupIds:Object.freeze([G4A_U05_P08F08_PATTERN_GROUP.patternGroupId]),
 canonicalPatternSpecIds:G4A_U05_P08F08_SPEC_IDS,
 patternGroupIds:Object.freeze([G4A_U05_P08F08_PATTERN_GROUP.patternGroupId]),
 patternSpecIds:G4A_U05_P08F08_SPEC_IDS,
 requiredCapabilityIds:G4A_U05_P08F08_REQUIRED_CAPABILITY_IDS,
 optionalCapabilityIds:G4A_U05_P08F08_OPTIONAL_CAPABILITY_IDS,
 qaStatusLabel:"P08F08_G4A_U05_SOURCE_BACKED_TRIANGLE_ANGLE_CLASSIFICATION",
 productionUse:"full_product_w8_slice008_candidate"
});
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export const getG4AU05P08F08SelectorRow=id=>id===G4A_U05_P08F08_KP_ID?clone(G4A_U05_P08F08_SELECTOR_ROW):null;
export const listG4AU05P08F08PatternGroups=id=>id===G4A_U05_P08F08_KP_ID?[clone(G4A_U05_P08F08_PATTERN_GROUP)]:[];
export const resolveG4AU05P08F08PatternSpecIds=id=>id===G4A_U05_P08F08_KP_ID?clone(G4A_U05_P08F08_SPEC_IDS):[];
export function auditG4AU05P08F08Projection(){
 const errors=[],m=G4A_U05_P08F08_FORMAL_MAPPING;
 if(G4A_U05_P08F08_PATTERN_SPECS.length!==3||G4A_U05_P08F08_RELATIONS.length!==3||new Set(G4A_U05_P08F08_SPEC_IDS).size!==3)errors.push("P08F08_CARDINALITY_INVALID");
 if(G4A_U05_P08F08_PATTERN_SPECS.some(x=>x.questionMode!=="diagram"||x.answerDomain!=="TRIANGLE_ANGLE_CLASS_ZH"||x.representation!=="triangle_angle_classification_diagram"||x.classificationBasis!=="MAXIMUM_INTERIOR_ANGLE"||x.exactlyOneCategoryRequired!==true||x.rotationInvariant!==true||x.triangleElementsNamingAllowed||x.triangleSideClassificationAllowed||x.triangleInequalityAllowed||x.congruentTriangleCorrespondenceAllowed||x.geometryConstructionAllowed||x.sameUnitMixedAllowed||x.crossUnitMixedAllowed))errors.push("P08F08_PATTERN_SCOPE_INVALID");
 if(m.primaryRuntimeProfileId!=="profile_geometry_property"||m.classificationRuleId!=="rule_geometry_property"||m.appliedRuntimeModifierIds.length!==0||m.r04ReclassificationAllowed||m.frozenQueueMutationAllowed||m.sourceLearnerFigureCopied)errors.push("P08F08_MAPPING_SCOPE_INVALID");
 return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1})});
}
