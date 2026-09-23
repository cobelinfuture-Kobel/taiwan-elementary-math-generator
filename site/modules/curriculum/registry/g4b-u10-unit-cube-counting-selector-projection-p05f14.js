export const P05F14_TASK_ID="P05F_W5DirectProductVerticalSlice014Implementation";
export const G4B_U10_P05F14_SOURCE_ID="g4b_u10_4b10";
export const G4B_U10_P05F14_UNIT_CODE="4B-U10";
export const G4B_U10_P05F14_UNIT_TITLE="立方公分與體積";
export const G4B_U10_P05F14_KP_ID="kp_g4b_u10_unit_cube_counting";
export const G4B_U10_P05F14_EXISTING_KP_ID="kp_g4b_u10_cubic_centimeter_unit";
export const G4B_U10_P05F14_FUTURE_KP_IDS=Object.freeze([
  "kp_g4b_u10_layered_cube_counting",
  "kp_g4b_u10_volume_conservation_rearrangement",
  "kp_g4b_u10_rectangular_prism_volume_structure",
]);
export const G4B_U10_P05F14_PATTERN_GROUP_ID="pg_g4b_u10_unit_cube_counting";
export const G4B_U10_P05F14_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
]);
export const G4B_U10_P05F14_INCLUDED_RELATIONS=Object.freeze([
  "COUNT_UNIT_CUBES_IN_SOLID",
  "ACCOUNT_FOR_VISIBLE_AND_HIDDEN_UNIT_CUBES",
  "MAP_TOTAL_UNIT_CUBE_COUNT_TO_VOLUME",
  "PRESERVE_NON_OVERLAPPING_UNIT_CUBE_CONTRIBUTION",
]);
export const G4B_U10_P05F14_EXCLUDED_RELATIONS=Object.freeze([
  "LAYERED_CUBE_MULTIPLICATION",
  "VOLUME_CONSERVATION_REARRANGEMENT",
  "RECTANGULAR_PRISM_LENGTH_WIDTH_HEIGHT_FORMULA",
  "APPLICATION_CONTEXT",
]);
const MODES=Object.freeze(["COUNT_CUBES","VISIBLE_HIDDEN","COUNT_TO_VOLUME","NON_OVERLAP_VOLUME"]);
export const G4B_U10_P05F14_PATTERN_SPECS=Object.freeze(G4B_U10_P05F14_INCLUDED_RELATIONS.map((relation,index)=>Object.freeze({
  patternSpecId:`ps_g4b_u10_${relation.toLowerCase()}`,
  knowledgePointId:G4B_U10_P05F14_KP_ID,
  patternGroupId:G4B_U10_P05F14_PATTERN_GROUP_ID,
  patternFamilyId:"UNIT_CUBE_COUNTING",
  relation,
  diagramMode:MODES[index],
  questionMode:"diagram",
  requiresSolidGeometryRepresentation:true,
  applicationAllowed:false,
  layeredCubeCountingAllowed:false,
  volumeConservationRearrangementAllowed:false,
  rectangularPrismFormulaAllowed:false,
})));
export const G4B_U10_P05F14_SPEC_IDS=Object.freeze(G4B_U10_P05F14_PATTERN_SPECS.map(row=>row.patternSpecId));
export const G4B_U10_P05F14_FORMAL_MAPPING=Object.freeze({
  mappingId:"fm_g4b_u10_unit_cube_counting_p05f14",
  sourceId:G4B_U10_P05F14_SOURCE_ID,
  sourcePages:Object.freeze([1,2]),
  knowledgePointId:G4B_U10_P05F14_KP_ID,
  canonicalNameZh:"單位立方體計數",
  relationFamily:"UNIT_CUBE_COUNTING",
  capabilityStatement:"學生能由可見與隱藏方塊數求立體體積。",
  reasoningInvariant:"每個無重疊單位立方體貢獻1個體積單位。",
  includedRelations:G4B_U10_P05F14_INCLUDED_RELATIONS,
  excludedRelations:G4B_U10_P05F14_EXCLUDED_RELATIONS,
  questionMode:"diagram",
  applicationImplementationAllowed:false,
  requiredCapabilityIds:G4B_U10_P05F14_REQUIRED_CAPABILITY_IDS,
  patternSpecIds:G4B_U10_P05F14_SPEC_IDS,
});
export const G4B_U10_P05F14_PATTERN_GROUP=Object.freeze({
  patternGroupId:G4B_U10_P05F14_PATTERN_GROUP_ID,sourceId:G4B_U10_P05F14_SOURCE_ID,unitCode:G4B_U10_P05F14_UNIT_CODE,unitTitle:G4B_U10_P05F14_UNIT_TITLE,
  displayName:"單位立方體計數",primaryKnowledgePointId:G4B_U10_P05F14_KP_ID,knowledgePointIds:Object.freeze([G4B_U10_P05F14_KP_ID]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",
  representationTag:"unit_cube_counting_diagram",representationTags:Object.freeze(["geometry","spatial_solid","unit_cube","volume","visible_hidden","diagram"]),patternSpecIds:G4B_U10_P05F14_SPEC_IDS,
  allocationPolicy:"balanced_unit_cube_counting_relation",visibilityStatus:"visible",holdReason:null,
});
export const G4B_U10_P05F14_SELECTOR_ROW=Object.freeze({
  knowledgePointId:G4B_U10_P05F14_KP_ID,sourceId:G4B_U10_P05F14_SOURCE_ID,unitCode:G4B_U10_P05F14_UNIT_CODE,unitTitle:G4B_U10_P05F14_UNIT_TITLE,displayName:"單位立方體計數",canonicalNameZh:"單位立方體計數",
  mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,
  applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",canonicalPatternGroupIds:Object.freeze([G4B_U10_P05F14_PATTERN_GROUP_ID]),canonicalPatternSpecIds:G4B_U10_P05F14_SPEC_IDS,
  patternGroupIds:Object.freeze([G4B_U10_P05F14_PATTERN_GROUP_ID]),patternSpecIds:G4B_U10_P05F14_SPEC_IDS,requiredCapabilityIds:G4B_U10_P05F14_REQUIRED_CAPABILITY_IDS,
  qaStatusLabel:"P05F14_G4B_U10_SOURCE_BACKED_UNIT_CUBE_COUNTING_DIAGRAM",productionUse:"full_product_w5_slice014_candidate",
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function getG4BU10P05F14SelectorRow(id){return id===G4B_U10_P05F14_KP_ID?clone(G4B_U10_P05F14_SELECTOR_ROW):null;}
export function listG4BU10P05F14PatternGroups(id){return id===G4B_U10_P05F14_KP_ID?[clone(G4B_U10_P05F14_PATTERN_GROUP)]:[];}
export function resolveG4BU10P05F14PatternSpecIds(id){return id===G4B_U10_P05F14_KP_ID?clone(G4B_U10_P05F14_SPEC_IDS):[];}
export function auditG4BU10P05F14SelectorProjection(){const errors=[];if(G4B_U10_P05F14_PATTERN_SPECS.length!==4)errors.push("P05F14_PATTERN_CARDINALITY_INVALID");if(new Set(G4B_U10_P05F14_SPEC_IDS).size!==4)errors.push("P05F14_DUPLICATE_SPEC_ID");if(G4B_U10_P05F14_PATTERN_SPECS.some(row=>row.questionMode!=="diagram"||!row.requiresSolidGeometryRepresentation||row.applicationAllowed||row.layeredCubeCountingAllowed||row.volumeConservationRearrangementAllowed||row.rectangularPrismFormulaAllowed))errors.push("P05F14_PATTERN_INVARIANT_INVALID");if(G4B_U10_P05F14_FORMAL_MAPPING.includedRelations.some(relation=>!G4B_U10_P05F14_PATTERN_SPECS.some(row=>row.relation===relation)))errors.push("P05F14_RELATION_MISSING");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0})});}
