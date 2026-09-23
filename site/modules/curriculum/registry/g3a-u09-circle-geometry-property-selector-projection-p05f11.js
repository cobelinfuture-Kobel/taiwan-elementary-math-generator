export const P05F11_TASK_ID="P05F_W5DirectProductVerticalSlice011Implementation";
export const G3A_U09_P05F11_SOURCE_ID="g3a_u09_3a09";
export const G3A_U09_P05F11_UNIT_CODE="3A-U09";
export const G3A_U09_P05F11_UNIT_TITLE="圓";
export const G3A_U09_P05F11_KP_IDS=Object.freeze([
  "kp_circle_compass_construction",
  "kp_circle_point_position_and_intersection",
  "kp_circle_radius_diameter_measure_compare",
]);
export const G3A_U09_P05F11_EXISTING_KP_ID="kp_circle_center_radius_diameter";
export const G3A_U09_P05F11_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_construction",
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
]);

const GROUP_BY_KP=Object.freeze({
  [G3A_U09_P05F11_KP_IDS[0]]:"pg_g3a_u09_circle_compass_construction",
  [G3A_U09_P05F11_KP_IDS[1]]:"pg_g3a_u09_circle_point_position_intersection",
  [G3A_U09_P05F11_KP_IDS[2]]:"pg_g3a_u09_circle_radius_diameter_measure_compare",
});
export const G3A_U09_P05F11_GROUP_IDS=Object.freeze(G3A_U09_P05F11_KP_IDS.map(id=>GROUP_BY_KP[id]));

const DEFINITIONS=Object.freeze([
  Object.freeze({kp:G3A_U09_P05F11_KP_IDS[0],name:"用圓規畫圓",family:"CIRCLE_COMPASS_CONSTRUCTION",relations:Object.freeze([
    "CONSTRUCT_CIRCLE_WITH_COMPASS_FROM_SPECIFIED_CENTER_AND_RADIUS",
    "KEEP_COMPASS_POINT_FIXED_AT_CENTER",
    "KEEP_COMPASS_OPENING_EQUAL_TO_RADIUS",
    "ROTATE_COMPASS_TO_TRACE_CIRCLE",
  ])}),
  Object.freeze({kp:G3A_U09_P05F11_KP_IDS[1],name:"圓內外與圓的相交關係",family:"CIRCLE_POSITION_INTERSECTION",relations:Object.freeze([
    "CLASSIFY_POINT_INSIDE_ON_OUTSIDE_CIRCLE",
    "COMPARE_POINT_CENTER_DISTANCE_TO_RADIUS",
    "CLASSIFY_TWO_CIRCLE_INTERSECTION",
    "CLASSIFY_TWO_CIRCLE_TANGENCY",
    "CLASSIFY_TWO_CIRCLE_SEPARATION",
  ])}),
  Object.freeze({kp:G3A_U09_P05F11_KP_IDS[2],name:"半徑直徑測量與比較",family:"CIRCLE_RADIUS_DIAMETER_MEASURE_COMPARE",relations:Object.freeze([
    "MEASURE_CIRCLE_RADIUS_FROM_DIAGRAM",
    "MEASURE_CIRCLE_DIAMETER_FROM_DIAGRAM",
    "COMPUTE_RADIUS_FROM_DIAMETER",
    "COMPUTE_DIAMETER_FROM_RADIUS",
    "COMPARE_RADIUS_DIAMETER_MEASUREMENTS",
    "REQUIRE_MEASURED_DIAMETER_TO_PASS_CENTER",
  ])}),
]);
const slug=relation=>relation.toLowerCase();
const spec=(definition,relation)=>Object.freeze({
  patternSpecId:`ps_g3a_u09_${slug(relation)}`,
  knowledgePointId:definition.kp,
  patternGroupId:GROUP_BY_KP[definition.kp],
  patternFamilyId:definition.family,
  relation,
  questionMode:"diagram",
  requiresDiagramRepresentation:true,
  applicationAllowed:false,
  circumferenceFormulaAllowed:false,
  areaFormulaAllowed:false,
  concentricConstructionAllowed:false,
  foldLineConstructionAllowed:false,
});
export const G3A_U09_P05F11_PATTERN_SPECS=Object.freeze(DEFINITIONS.flatMap(definition=>definition.relations.map(relation=>spec(definition,relation))));
export const G3A_U09_P05F11_SPEC_IDS=Object.freeze(G3A_U09_P05F11_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G3A_U09_P05F11_SPEC_IDS_BY_KP=Object.freeze(Object.fromEntries(G3A_U09_P05F11_KP_IDS.map(kp=>[kp,Object.freeze(G3A_U09_P05F11_PATTERN_SPECS.filter(row=>row.knowledgePointId===kp).map(row=>row.patternSpecId))])));

export const G3A_U09_P05F11_FORMAL_MAPPINGS=Object.freeze(DEFINITIONS.map(definition=>Object.freeze({
  mappingId:`fm_g3a_u09_${definition.family.toLowerCase()}_p05f11`,
  sourceId:G3A_U09_P05F11_SOURCE_ID,
  knowledgePointId:definition.kp,
  canonicalNameZh:definition.name,
  relationFamily:definition.family,
  includedRelations:definition.relations,
  excludedRelations:Object.freeze([
    "CIRCLE_PART_LABEL_IDENTIFICATION_AS_TARGET_KP",
    "IDENTIFY_CIRCUMFERENCE_AS_TARGET_KP",
    "GENERIC_COMPASS_SEGMENT_LENGTH_MEASUREMENT",
    "GENERIC_COMPASS_SEGMENT_LENGTH_COMPARISON",
    "CONCENTRIC_CIRCLE_CONSTRUCTION",
    "FOLD_LINE_RADIUS_CONSTRUCTION",
    "CIRCLE_CIRCUMFERENCE_FORMULA",
    "CIRCLE_AREA_FORMULA",
    "APPLICATION_CONTEXT",
  ]),
  questionMode:"diagram",
  applicationImplementationAllowed:false,
  requiredCapabilityIds:G3A_U09_P05F11_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G3A_U09_P05F11_SPEC_IDS_BY_KP[definition.kp],
})));

export const G3A_U09_P05F11_PATTERN_GROUPS=Object.freeze(DEFINITIONS.map(definition=>Object.freeze({
  patternGroupId:GROUP_BY_KP[definition.kp],sourceId:G3A_U09_P05F11_SOURCE_ID,unitCode:G3A_U09_P05F11_UNIT_CODE,unitTitle:G3A_U09_P05F11_UNIT_TITLE,
  displayName:definition.name,primaryKnowledgePointId:definition.kp,knowledgePointIds:Object.freeze([definition.kp]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",
  representationTag:"circle_geometry_property_diagram",representationTags:Object.freeze(["geometry","circle","diagram_property"]),patternSpecIds:G3A_U09_P05F11_SPEC_IDS_BY_KP[definition.kp],
  allocationPolicy:"balanced_relation",visibilityStatus:"visible",holdReason:null,
})));
export const G3A_U09_P05F11_SELECTOR_ROWS=Object.freeze(DEFINITIONS.map(definition=>Object.freeze({
  knowledgePointId:definition.kp,sourceId:G3A_U09_P05F11_SOURCE_ID,unitCode:G3A_U09_P05F11_UNIT_CODE,unitTitle:G3A_U09_P05F11_UNIT_TITLE,displayName:definition.name,canonicalNameZh:definition.name,
  mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([GROUP_BY_KP[definition.kp]]),canonicalPatternSpecIds:G3A_U09_P05F11_SPEC_IDS_BY_KP[definition.kp],
  patternGroupIds:Object.freeze([GROUP_BY_KP[definition.kp]]),patternSpecIds:G3A_U09_P05F11_SPEC_IDS_BY_KP[definition.kp],requiredCapabilityIds:G3A_U09_P05F11_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F11_G3A_U09_SOURCE_BACKED_DIAGRAM",productionUse:"full_product_w5_slice011_candidate",
})));

const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG3AU09P05F11SelectorRow(id){return clone(G3A_U09_P05F11_SELECTOR_ROWS.find(row=>row.knowledgePointId===id)??null);}
export function listG3AU09P05F11PatternGroups(id){return clone(G3A_U09_P05F11_PATTERN_GROUPS.filter(row=>row.primaryKnowledgePointId===id));}
export function resolveG3AU09P05F11PatternSpecIds(id){return clone(G3A_U09_P05F11_SPEC_IDS_BY_KP[id]??[]);}
export function auditG3AU09P05F11SelectorProjection(){
  const errors=[];
  if(G3A_U09_P05F11_SELECTOR_ROWS.length!==3||G3A_U09_P05F11_PATTERN_GROUPS.length!==3||G3A_U09_P05F11_PATTERN_SPECS.length!==15)errors.push("P05F11_CARDINALITY_INVALID");
  const relationSet=new Set(G3A_U09_P05F11_PATTERN_SPECS.map(row=>row.relation));
  for(const mapping of G3A_U09_P05F11_FORMAL_MAPPINGS)for(const relation of mapping.includedRelations)if(!relationSet.has(relation))errors.push(`P05F11_RELATION_MISSING:${relation}`);
  if(G3A_U09_P05F11_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresDiagramRepresentation||row.applicationAllowed||row.circumferenceFormulaAllowed||row.areaFormulaAllowed||row.concentricConstructionAllowed||row.foldLineConstructionAllowed))errors.push("P05F11_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:15,diagram:15,application:0})});
}
