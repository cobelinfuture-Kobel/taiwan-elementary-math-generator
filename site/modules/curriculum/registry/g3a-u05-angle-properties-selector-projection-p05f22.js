export const P05F22_TASK_ID="P05F_W5DirectProductVerticalSlice022Implementation";
export const G3A_U05_P05F22_SOURCE_ID="g3a_u05_3a05";
export const G3A_U05_P05F22_UNIT_CODE="3A-U05";
export const G3A_U05_P05F22_UNIT_TITLE="角與形狀";
export const G3A_U05_P05F22_KP_IDS=Object.freeze([
  "kp_acute_obtuse_angle_qualitative_classification",
  "kp_rectangle_square_right_angle_properties",
]);
export const G3A_U05_P05F22_PRIOR_VISIBLE_KP_IDS=Object.freeze([
  "kp_angle_parts_identification",
  "kp_right_angle_recognition",
]);
export const G3A_U05_P05F22_REMAINING_FUTURE_KP_IDS=Object.freeze([]);
export const G3A_U05_P05F22_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);
export const G3A_U05_P05F22_GROUP_IDS=Object.freeze([
  "pg_g3a_u05_acute_obtuse_angle_qualitative_classification",
  "pg_g3a_u05_rectangle_square_right_angle_properties",
]);
export const G3A_U05_P05F22_SPEC_IDS=Object.freeze([
  "ps_g3a_u05_classify_acute_by_right_angle_benchmark",
  "ps_g3a_u05_classify_right_by_right_angle_benchmark",
  "ps_g3a_u05_classify_obtuse_by_right_angle_benchmark",
  "ps_g3a_u05_rectangle_four_right_angles",
  "ps_g3a_u05_square_four_right_angles",
  "ps_g3a_u05_rectangle_right_angles_preserved",
  "ps_g3a_u05_square_right_angles_preserved",
]);
const KP_CLASSIFY=G3A_U05_P05F22_KP_IDS[0],KP_SHAPES=G3A_U05_P05F22_KP_IDS[1];
const GROUP_CLASSIFY=G3A_U05_P05F22_GROUP_IDS[0],GROUP_SHAPES=G3A_U05_P05F22_GROUP_IDS[1];
const classificationSpec=(patternSpecId,targetClass)=>Object.freeze({
  patternSpecId,knowledgePointId:KP_CLASSIFY,patternGroupId:GROUP_CLASSIFY,patternFamilyId:"ANGLE_PROPERTY_REASONING",
  relation:"CLASSIFY_ACUTE_RIGHT_OBTUSE_BY_RIGHT_ANGLE_BENCHMARK",targetClass,propertyMode:"CLASSIFY_ANGLE_BY_RIGHT_ANGLE_BENCHMARK",
  questionMode:"diagram",diagramKind:"angle_properties_diagram",answerDomain:"ACUTE_RIGHT_OBTUSE_ZH",
  requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryPropertyReasoning:true,
  rightAngleRecognitionUsedAsBenchmarkOnly:true,numericAngleMeasurementAllowed:false,protractorMeasurementAllowed:false,constructionAllowed:false,applicationAllowed:false,
});
const shapeSpec=(patternSpecId,shapeClass,relation,propertyMode)=>Object.freeze({
  patternSpecId,knowledgePointId:KP_SHAPES,patternGroupId:GROUP_SHAPES,patternFamilyId:"ANGLE_PROPERTY_REASONING",
  relation,shapeClass,propertyMode,questionMode:"diagram",diagramKind:"angle_properties_diagram",answerDomain:"FOUR_RIGHT_ANGLES_PROPERTY_ZH",
  requiresGeometryDiagramRepresentation:true,requiresGeometryDomainValidator:true,requiresGeometryPropertyReasoning:true,
  numericAngleMeasurementAllowed:false,protractorMeasurementAllowed:false,constructionAllowed:false,applicationAllowed:false,
});
export const G3A_U05_P05F22_PATTERN_SPECS=Object.freeze([
  classificationSpec(G3A_U05_P05F22_SPEC_IDS[0],"ACUTE"),
  classificationSpec(G3A_U05_P05F22_SPEC_IDS[1],"RIGHT"),
  classificationSpec(G3A_U05_P05F22_SPEC_IDS[2],"OBTUSE"),
  shapeSpec(G3A_U05_P05F22_SPEC_IDS[3],"RECTANGLE","RECOGNIZE_RECTANGLE_AND_SQUARE_HAVE_FOUR_RIGHT_ANGLES","COUNT_FOUR_RIGHT_ANGLES"),
  shapeSpec(G3A_U05_P05F22_SPEC_IDS[4],"SQUARE","RECOGNIZE_RECTANGLE_AND_SQUARE_HAVE_FOUR_RIGHT_ANGLES","COUNT_FOUR_RIGHT_ANGLES"),
  shapeSpec(G3A_U05_P05F22_SPEC_IDS[5],"RECTANGLE","PRESERVE_RECTANGLE_SQUARE_RIGHT_ANGLE_PROPERTY_UNDER_ROTATION_OR_SIDE_LENGTH_CHANGE","PRESERVE_UNDER_ROTATION_OR_SIDE_LENGTH_CHANGE"),
  shapeSpec(G3A_U05_P05F22_SPEC_IDS[6],"SQUARE","PRESERVE_RECTANGLE_SQUARE_RIGHT_ANGLE_PROPERTY_UNDER_ROTATION_OR_SIDE_LENGTH_CHANGE","PRESERVE_UNDER_ROTATION_OR_SIDE_LENGTH_CHANGE"),
]);
const specsFor=id=>G3A_U05_P05F22_PATTERN_SPECS.filter(row=>row.knowledgePointId===id);
export const G3A_U05_P05F22_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({
    mappingId:"fm_g3a_u05_acute_obtuse_angle_qualitative_classification_p05f22",sourceId:G3A_U05_P05F22_SOURCE_ID,sourcePages:Object.freeze([1]),
    knowledgePointId:KP_CLASSIFY,canonicalNameZh:"銳角與鈍角定性分類",capabilityStatement:"學生能以直角為基準分辨銳角、直角與鈍角。",
    reasoningInvariant:"角度小於直角為銳角，大於直角且小於平角為鈍角。",relationFamily:"ANGLE_PROPERTY_REASONING",
    includedRelations:Object.freeze(["CLASSIFY_ACUTE_RIGHT_OBTUSE_BY_RIGHT_ANGLE_BENCHMARK"]),
    excludedRelations:Object.freeze(["ANGLE_PARTS_IDENTIFICATION_AS_TARGET_KP","RIGHT_ANGLE_RECOGNITION_AS_TARGET_KP","NUMERIC_ANGLE_MEASUREMENT","PROTRACTOR_MEASUREMENT","ANGLE_CONSTRUCTION","APPLICATION_CONTEXT_IMPLEMENTATION","Q023_OR_LATER_SEMANTICS"]),
    answerDomain:Object.freeze(["銳角","直角","鈍角"]),requiredCapabilityIds:G3A_U05_P05F22_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_CLASSIFY).map(row=>row.patternSpecId)),
    rightAngleRecognitionUsedAsBenchmarkOnly:true,applicationImplementationAllowed:false,
  }),
  Object.freeze({
    mappingId:"fm_g3a_u05_rectangle_square_right_angle_properties_p05f22",sourceId:G3A_U05_P05F22_SOURCE_ID,sourcePages:Object.freeze([1]),
    knowledgePointId:KP_SHAPES,canonicalNameZh:"長方形與正方形直角性質",capabilityStatement:"學生能辨認長方形、正方形均有四個直角。",
    reasoningInvariant:"圖形旋轉或邊長改變時，四個內角仍保持直角。",relationFamily:"ANGLE_PROPERTY_REASONING",
    includedRelations:Object.freeze(["RECOGNIZE_RECTANGLE_AND_SQUARE_HAVE_FOUR_RIGHT_ANGLES","PRESERVE_RECTANGLE_SQUARE_RIGHT_ANGLE_PROPERTY_UNDER_ROTATION_OR_SIDE_LENGTH_CHANGE"]),
    excludedRelations:Object.freeze(["ANGLE_PARTS_IDENTIFICATION_AS_TARGET_KP","RIGHT_ANGLE_RECOGNITION_AS_TARGET_KP","NUMERIC_ANGLE_MEASUREMENT","PROTRACTOR_MEASUREMENT","ANGLE_CONSTRUCTION","APPLICATION_CONTEXT_IMPLEMENTATION","Q023_OR_LATER_SEMANTICS"]),
    answerDomain:Object.freeze(["4個直角","不會，仍有4個直角"]),requiredCapabilityIds:G3A_U05_P05F22_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_SHAPES).map(row=>row.patternSpecId)),
    applicationImplementationAllowed:false,
  }),
]);
export const G3A_U05_P05F22_PATTERN_GROUPS=Object.freeze([
  Object.freeze({patternGroupId:GROUP_CLASSIFY,sourceId:G3A_U05_P05F22_SOURCE_ID,unitCode:G3A_U05_P05F22_UNIT_CODE,unitTitle:G3A_U05_P05F22_UNIT_TITLE,displayName:"銳角、直角與鈍角分類",primaryKnowledgePointId:KP_CLASSIFY,knowledgePointIds:Object.freeze([KP_CLASSIFY]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"angle_properties_diagram",representationTags:Object.freeze(["geometry","angle","acute","right","obtuse","right_angle_benchmark","diagram_classification"]),patternSpecIds:Object.freeze(specsFor(KP_CLASSIFY).map(row=>row.patternSpecId)),allocationPolicy:"balanced_qualitative_angle_classes",visibilityStatus:"visible",holdReason:null}),
  Object.freeze({patternGroupId:GROUP_SHAPES,sourceId:G3A_U05_P05F22_SOURCE_ID,unitCode:G3A_U05_P05F22_UNIT_CODE,unitTitle:G3A_U05_P05F22_UNIT_TITLE,displayName:"長方形與正方形的四個直角",primaryKnowledgePointId:KP_SHAPES,knowledgePointIds:Object.freeze([KP_SHAPES]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"angle_properties_diagram",representationTags:Object.freeze(["geometry","rectangle","square","four_right_angles","rotation_invariance","side_length_invariance"]),patternSpecIds:Object.freeze(specsFor(KP_SHAPES).map(row=>row.patternSpecId)),allocationPolicy:"balanced_rectangle_square_property_reasoning",visibilityStatus:"visible",holdReason:null}),
]);
const selectorRow=(knowledgePointId,displayName,groupId)=>Object.freeze({
  knowledgePointId,sourceId:G3A_U05_P05F22_SOURCE_ID,unitCode:G3A_U05_P05F22_UNIT_CODE,unitTitle:G3A_U05_P05F22_UNIT_TITLE,
  displayName,canonicalNameZh:displayName,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:Object.freeze(specsFor(knowledgePointId).map(row=>row.patternSpecId)),patternGroupIds:Object.freeze([groupId]),patternSpecIds:Object.freeze(specsFor(knowledgePointId).map(row=>row.patternSpecId)),requiredCapabilityIds:G3A_U05_P05F22_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F22_G3A_U05_SOURCE_BACKED_ANGLE_PROPERTY_REASONING",productionUse:"full_product_w5_slice022_candidate",
});
export const G3A_U05_P05F22_SELECTOR_ROWS=Object.freeze([
  selectorRow(KP_CLASSIFY,"銳角與鈍角定性分類",GROUP_CLASSIFY),
  selectorRow(KP_SHAPES,"長方形與正方形直角性質",GROUP_SHAPES),
]);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG3AU05P05F22SelectorRow(id){return clone(G3A_U05_P05F22_SELECTOR_ROWS.find(row=>row.knowledgePointId===id)??null);}
export function listG3AU05P05F22PatternGroups(id){return clone(G3A_U05_P05F22_PATTERN_GROUPS.filter(group=>group.primaryKnowledgePointId===id));}
export function resolveG3AU05P05F22PatternSpecIds(id){return clone(G3A_U05_P05F22_PATTERN_SPECS.filter(spec=>spec.knowledgePointId===id).map(spec=>spec.patternSpecId));}
export function auditG3AU05P05F22Projection(){
  const errors=[];
  if(G3A_U05_P05F22_SELECTOR_ROWS.length!==2||G3A_U05_P05F22_PATTERN_GROUPS.length!==2||G3A_U05_P05F22_PATTERN_SPECS.length!==7||G3A_U05_P05F22_FORMAL_MAPPINGS.length!==2)errors.push("P05F22_CARDINALITY_INVALID");
  if(new Set(G3A_U05_P05F22_SPEC_IDS).size!==7)errors.push("P05F22_PATTERN_ID_DUPLICATE");
  const relations=new Set(G3A_U05_P05F22_PATTERN_SPECS.map(row=>row.relation));
  for(const mapping of G3A_U05_P05F22_FORMAL_MAPPINGS){for(const relation of mapping.includedRelations)if(!relations.has(relation))errors.push(`P05F22_RELATION_MISSING:${mapping.knowledgePointId}:${relation}`);}
  if(G3A_U05_P05F22_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||row.requiresGeometryDiagramRepresentation!==true||row.requiresGeometryDomainValidator!==true||row.requiresGeometryPropertyReasoning!==true||row.numericAngleMeasurementAllowed!==false||row.protractorMeasurementAllowed!==false||row.constructionAllowed!==false||row.applicationAllowed!==false))errors.push("P05F22_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:7,diagram:7,application:0})});
}
