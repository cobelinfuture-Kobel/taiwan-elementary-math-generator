export const P05F17_TASK_ID="P05F_W5DirectProductVerticalSlice017Implementation";
export const G5A_U10A_P05F17_SOURCE_ID="g5a_u10_5a10a";
export const G5A_U10A_P05F17_UNIT_CODE="5A-U10A";
export const G5A_U10A_P05F17_UNIT_TITLE="柱體錐體和球";
export const G5A_U10A_P05F17_KP_ID="kp_g5a_u10a_prism_pyramid_elements";
export const G5A_U10A_P05F17_GROUP_ID="pg_g5a_u10a_prism_pyramid_elements";
export const G5A_U10A_P05F17_EXISTING_VISIBLE_KP_IDS=Object.freeze(["kp_g5a_u10a_solid_shape_classification"]);
export const G5A_U10A_P05F17_FUTURE_KP_IDS=Object.freeze(["kp_g5a_u10a_solid_net_correspondence","kp_g5a_u10a_solid_cross_section","kp_g5a_u10a_solid_viewpoint_representation"]);
export const G5A_U10A_P05F17_REQUIRED_CAPABILITY_IDS=Object.freeze(["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"]);
export const G5A_U10A_P05F17_SPEC_IDS=Object.freeze([
  "ps_g5a_u10a_identify_base_face",
  "ps_g5a_u10a_identify_side_face",
  "ps_g5a_u10a_identify_edge",
  "ps_g5a_u10a_identify_vertex",
  "ps_g5a_u10a_count_faces_from_base_polygon",
  "ps_g5a_u10a_count_edges_from_base_polygon",
  "ps_g5a_u10a_count_vertices_from_base_polygon",
]);

const spec=(patternSpecId,relation,taskMode,focusElement,sourceEvidenceTopic)=>Object.freeze({
  patternSpecId,
  knowledgePointId:G5A_U10A_P05F17_KP_ID,
  patternFamilyId:"PRISM_PYRAMID_ELEMENT_IDENTIFICATION_AND_STRUCTURE",
  relation,
  taskMode,
  focusElement,
  questionMode:"diagram",
  answerDomain:"PRISM_PYRAMID_ELEMENT_OR_COUNT_ZH",
  requiresSolidGeometryRepresentation:true,
  applicationAllowed:false,
  solidShapeClassificationAllowed:false,
  solidNetCorrespondenceAllowed:false,
  solidCrossSectionAllowed:false,
  solidViewpointRepresentationAllowed:false,
  geometryFormulaOrMeasurementAllowed:false,
  sourceEvidenceTopic,
});
export const G5A_U10A_P05F17_PATTERN_SPECS=Object.freeze([
  spec(G5A_U10A_P05F17_SPEC_IDS[0],"IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","IDENTIFY_BASE","BASE_FACE","辨認角柱與角錐的底面"),
  spec(G5A_U10A_P05F17_SPEC_IDS[1],"IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","IDENTIFY_SIDE_FACE","SIDE_FACE","辨認角柱與角錐的側面"),
  spec(G5A_U10A_P05F17_SPEC_IDS[2],"IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","IDENTIFY_EDGE","EDGE","辨認角柱與角錐的稜"),
  spec(G5A_U10A_P05F17_SPEC_IDS[3],"IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","IDENTIFY_VERTEX","VERTEX","辨認角柱與角錐的頂點"),
  spec(G5A_U10A_P05F17_SPEC_IDS[4],"RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON","COUNT_FACES","NONE","由底面多邊形邊數判斷面數"),
  spec(G5A_U10A_P05F17_SPEC_IDS[5],"RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON","COUNT_EDGES","NONE","由底面多邊形邊數判斷稜數"),
  spec(G5A_U10A_P05F17_SPEC_IDS[6],"RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON","COUNT_VERTICES","NONE","由底面多邊形邊數判斷頂點數"),
]);
export const G5A_U10A_P05F17_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g5a_u10a_prism_pyramid_elements_p05f17",
  sourceId:G5A_U10A_P05F17_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G5A_U10A_P05F17_KP_ID,
  canonicalNameZh:"柱體錐體構成要素",
  capabilityStatement:"學生能辨認立體的底面、側面、稜與頂點。",
  relationFamily:"PRISM_PYRAMID_ELEMENT_IDENTIFICATION_AND_STRUCTURE",
  inputRepresentation:"BOUNDED_PRISM_PYRAMID_SOLID_GEOMETRY_DIAGRAM",
  reasoningInvariant:"構成要素的數量與位置由底面多邊形決定。",
  directSourceConcepts:Object.freeze([
    "PRISM_PYRAMID_BASE_SIDE_FACE_EDGE_VERTEX_IDENTIFICATION",
    "N_GON_PRISM_FACE_VERTEX_EDGE_COUNT",
    "N_GON_PYRAMID_FACE_VERTEX_EDGE_COUNT",
  ]),
  learnerFacingVocabulary:Object.freeze(["角柱","角錐","底面","側面","稜","頂點","面"]),
  learnerFacingForbiddenVocabulary:Object.freeze(["展開圖","截面","視圖","體積","表面積","應用題","圓柱","圓錐","球"]),
  includedRelations:Object.freeze(["IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON"]),
  excludedRelations:Object.freeze(["SOLID_SHAPE_CLASSIFICATION","SOLID_NET_CORRESPONDENCE","SOLID_CROSS_SECTION","SOLID_VIEWPOINT_REPRESENTATION","APPLICATION_CONTEXT","GEOMETRY_FORMULA_OR_MEASUREMENT"]),
  applicationSuitability:"APPLICATION_COMPATIBLE",
  applicationImplementationAllowed:false,
  sourceUnitOwnershipKnowledgePointId:"kp_g5a_u10a_solid_shape_classification",
  sourceUnitActivationAllowed:false,
  mixedKnowledgePointActivationAllowed:false,
  requiredCapabilityIds:G5A_U10A_P05F17_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G5A_U10A_P05F17_SPEC_IDS,
});
export const G5A_U10A_P05F17_PATTERN_GROUP=Object.freeze({
  patternGroupId:G5A_U10A_P05F17_GROUP_ID,
  sourceId:G5A_U10A_P05F17_SOURCE_ID,
  unitCode:G5A_U10A_P05F17_UNIT_CODE,
  unitTitle:G5A_U10A_P05F17_UNIT_TITLE,
  displayName:"柱體錐體構成要素圖形題",
  primaryKnowledgePointId:G5A_U10A_P05F17_KP_ID,
  knowledgePointIds:Object.freeze([G5A_U10A_P05F17_KP_ID]),
  supportClass:"A",
  mode:"diagram",
  publicQuestionMode:"diagram",
  representationTag:"prism_pyramid_elements_diagram",
  representationTags:Object.freeze(["geometry","spatial_solid","prism","pyramid","base_face","side_face","edge","vertex","diagram_identification"]),
  patternSpecIds:G5A_U10A_P05F17_SPEC_IDS,
  allocationPolicy:"balanced_prism_pyramid_element_relation",
  visibilityStatus:"visible",
  holdReason:null,
});
export const G5A_U10A_P05F17_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G5A_U10A_P05F17_KP_ID,
  sourceId:G5A_U10A_P05F17_SOURCE_ID,
  unitCode:G5A_U10A_P05F17_UNIT_CODE,
  unitTitle:G5A_U10A_P05F17_UNIT_TITLE,
  displayName:"柱體錐體構成要素",
  canonicalNameZh:"柱體錐體構成要素",
  mode:"diagram",
  questionMode:"diagram",
  questionModes:Object.freeze(["diagram"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([G5A_U10A_P05F17_GROUP_ID]),
  canonicalPatternSpecIds:G5A_U10A_P05F17_SPEC_IDS,
  patternGroupIds:Object.freeze([G5A_U10A_P05F17_GROUP_ID]),
  patternSpecIds:G5A_U10A_P05F17_SPEC_IDS,
  requiredCapabilityIds:G5A_U10A_P05F17_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F17_G5A_U10A_SOURCE_BACKED_PRISM_PYRAMID_ELEMENTS",
  productionUse:"full_product_w5_slice017_candidate",
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function listG5AU10AP05F17SelectorRows(){return clone([G5A_U10A_P05F17_SELECTOR_ROW]);}
export function getG5AU10AP05F17SelectorRow(id){return clone(id===G5A_U10A_P05F17_KP_ID?G5A_U10A_P05F17_SELECTOR_ROW:null);}
export function listG5AU10AP05F17PatternGroups(id){return clone(id===G5A_U10A_P05F17_KP_ID?[G5A_U10A_P05F17_PATTERN_GROUP]:[]);}
export function resolveG5AU10AP05F17PatternSpecIds(id){return clone(id===G5A_U10A_P05F17_KP_ID?G5A_U10A_P05F17_SPEC_IDS:[]);}
export function auditG5AU10AP05F17SelectorProjection(){
  const errors=[];
  if(G5A_U10A_P05F17_PATTERN_SPECS.length!==7)errors.push("P05F17_PATTERN_COUNT_INVALID");
  const relations=new Set(G5A_U10A_P05F17_PATTERN_SPECS.map(row=>row.relation));
  for(const relation of G5A_U10A_P05F17_FORMAL_MAPPING.includedRelations)if(!relations.has(relation))errors.push(`P05F17_RELATION_MISSING:${relation}`);
  if(G5A_U10A_P05F17_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||row.requiresSolidGeometryRepresentation!==true||row.applicationAllowed!==false||row.solidShapeClassificationAllowed!==false||row.solidNetCorrespondenceAllowed!==false||row.solidCrossSectionAllowed!==false||row.solidViewpointRepresentationAllowed!==false||row.geometryFormulaOrMeasurementAllowed!==false))errors.push("P05F17_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:7,diagram:7,application:0})});
}
