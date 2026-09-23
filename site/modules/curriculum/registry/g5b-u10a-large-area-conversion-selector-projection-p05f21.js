export const P05F21_TASK_ID="P05F_W5DirectProductVerticalSlice021Implementation";
export const G5B_U10A_P05F21_SOURCE_ID="g5b_u10_5b10a";
export const G5B_U10A_P05F21_UNIT_CODE="5B-U10A";
export const G5B_U10A_P05F21_UNIT_TITLE="生活中的大單位";
export const G5B_U10A_P05F21_KP_IDS=Object.freeze([
  "kp_g5b_u10a_hectare_square_meter_conversion",
  "kp_g5b_u10a_square_kilometer_hectare_conversion",
]);
export const G5B_U10A_P05F21_REMAINING_FUTURE_KP_IDS=Object.freeze([
  "kp_g5b_u10a_large_unit_estimation_application",
]);
export const G5B_U10A_P05F21_REQUIRED_CAPABILITY_IDS=Object.freeze([
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
]);
export const G5B_U10A_P05F21_GROUP_IDS=Object.freeze([
  "pg_g5b_u10a_hectare_square_meter_conversion",
  "pg_g5b_u10a_square_kilometer_hectare_conversion",
]);
export const G5B_U10A_P05F21_SPEC_IDS=Object.freeze([
  "ps_g5b_u10a_hectare_to_square_meter",
  "ps_g5b_u10a_square_meter_to_hectare",
  "ps_g5b_u10a_square_kilometer_to_hectare",
  "ps_g5b_u10a_hectare_to_square_kilometer",
]);
const KP_HA_M2=G5B_U10A_P05F21_KP_IDS[0],KP_KM2_HA=G5B_U10A_P05F21_KP_IDS[1];
const GROUP_HA_M2=G5B_U10A_P05F21_GROUP_IDS[0],GROUP_KM2_HA=G5B_U10A_P05F21_GROUP_IDS[1];
const spec=(patternSpecId,knowledgePointId,patternGroupId,relation,direction,equivalence)=>Object.freeze({
  patternSpecId,knowledgePointId,patternGroupId,patternFamilyId:"LARGE_AREA_SOURCE_EQUIVALENCE_CONVERSION",
  relation,direction,questionMode:"diagram",diagramKind:"large_area_unit_scale_diagram",answerDomain:"EXACT_INTEGER_WITH_AREA_UNIT_ZH",
  equivalence,requiresGeometryDiagramRepresentation:true,requiresGeometryFormulaEvaluation:true,
  applicationAllowed:false,generalUnitConversionFrameworkRewriteAllowed:false,unitConversionModifierApplied:false,
});
export const G5B_U10A_P05F21_PATTERN_SPECS=Object.freeze([
  spec(G5B_U10A_P05F21_SPEC_IDS[0],KP_HA_M2,GROUP_HA_M2,"CONVERT_HECTARE_AND_SQUARE_METER_BY_SOURCE_EQUIVALENCE","HECTARE_TO_SQUARE_METER","1公頃=10000平方公尺"),
  spec(G5B_U10A_P05F21_SPEC_IDS[1],KP_HA_M2,GROUP_HA_M2,"CONVERT_HECTARE_AND_SQUARE_METER_BY_SOURCE_EQUIVALENCE","SQUARE_METER_TO_HECTARE","1公頃=10000平方公尺"),
  spec(G5B_U10A_P05F21_SPEC_IDS[2],KP_KM2_HA,GROUP_KM2_HA,"CONVERT_SQUARE_KILOMETER_AND_HECTARE_BY_SOURCE_EQUIVALENCE","SQUARE_KILOMETER_TO_HECTARE","1平方公里=100公頃"),
  spec(G5B_U10A_P05F21_SPEC_IDS[3],KP_KM2_HA,GROUP_KM2_HA,"CONVERT_SQUARE_KILOMETER_AND_HECTARE_BY_SOURCE_EQUIVALENCE","HECTARE_TO_SQUARE_KILOMETER","1平方公里=100公頃"),
]);
const specsFor=id=>G5B_U10A_P05F21_PATTERN_SPECS.filter(s=>s.knowledgePointId===id);
export const G5B_U10A_P05F21_FORMAL_MAPPINGS=Object.freeze([
  Object.freeze({
    mappingId:"fm_g5b_u10a_hectare_square_meter_conversion_p05f21",sourceId:G5B_U10A_P05F21_SOURCE_ID,sourcePages:Object.freeze([1]),
    knowledgePointId:KP_HA_M2,canonicalNameZh:"公頃與平方公尺換算",capabilityStatement:"學生能運用1公頃等於10000平方公尺。",
    reasoningInvariant:"同一面積換單位時實際覆蓋範圍不變。",relationFamily:"LARGE_AREA_SOURCE_EQUIVALENCE_CONVERSION",
    includedRelations:Object.freeze(["CONVERT_HECTARE_AND_SQUARE_METER_BY_SOURCE_EQUIVALENCE","PRESERVE_AREA_EQUIVALENCE_ACROSS_UNIT_REPRESENTATIONS"]),
    excludedRelations:Object.freeze(["LARGE_AREA_UNIT_IDENTITY_AS_TARGET_KP","SQUARE_KILOMETER_HECTARE_CONVERSION_AS_TARGET_KP","METRIC_TON_KILOGRAM_CONVERSION_AS_TARGET_KP","LARGE_UNIT_ESTIMATION_AS_TARGET_KP","GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN","Q022_OR_LATER_SEMANTICS"]),
    requiredCapabilityIds:G5B_U10A_P05F21_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_HA_M2).map(s=>s.patternSpecId)),
    applicationImplementationAllowed:false,unitConversionModifierApplied:false,r02CandidateCategory:"measurement",frozenRuntimeProfile:"profile_geometry_formula",runtimeProfileCategoryMismatchBounded:true,
  }),
  Object.freeze({
    mappingId:"fm_g5b_u10a_square_kilometer_hectare_conversion_p05f21",sourceId:G5B_U10A_P05F21_SOURCE_ID,sourcePages:Object.freeze([1]),
    knowledgePointId:KP_KM2_HA,canonicalNameZh:"平方公里與公頃換算",capabilityStatement:"學生能在平方公里與公頃間換算。",
    reasoningInvariant:"1平方公里等於100公頃，換算保持面積等值。",relationFamily:"LARGE_AREA_SOURCE_EQUIVALENCE_CONVERSION",
    includedRelations:Object.freeze(["CONVERT_SQUARE_KILOMETER_AND_HECTARE_BY_SOURCE_EQUIVALENCE","PRESERVE_AREA_EQUIVALENCE_ACROSS_UNIT_REPRESENTATIONS"]),
    excludedRelations:Object.freeze(["LARGE_AREA_UNIT_IDENTITY_AS_TARGET_KP","HECTARE_SQUARE_METER_CONVERSION_AS_TARGET_KP","METRIC_TON_KILOGRAM_CONVERSION_AS_TARGET_KP","LARGE_UNIT_ESTIMATION_AS_TARGET_KP","GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN","Q022_OR_LATER_SEMANTICS"]),
    requiredCapabilityIds:G5B_U10A_P05F21_REQUIRED_CAPABILITY_IDS,patternSpecIds:Object.freeze(specsFor(KP_KM2_HA).map(s=>s.patternSpecId)),
    applicationImplementationAllowed:false,unitConversionModifierApplied:false,r02CandidateCategory:"measurement",frozenRuntimeProfile:"profile_geometry_formula",runtimeProfileCategoryMismatchBounded:true,
  }),
]);
export const G5B_U10A_P05F21_PATTERN_GROUPS=Object.freeze([
  Object.freeze({patternGroupId:GROUP_HA_M2,sourceId:G5B_U10A_P05F21_SOURCE_ID,unitCode:G5B_U10A_P05F21_UNIT_CODE,unitTitle:G5B_U10A_P05F21_UNIT_TITLE,displayName:"公頃與平方公尺換算",primaryKnowledgePointId:KP_HA_M2,knowledgePointIds:Object.freeze([KP_HA_M2]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"large_area_unit_scale_diagram",representationTags:Object.freeze(["measurement","area_equivalence","hectare","square_meter","diagram_conversion"]),patternSpecIds:Object.freeze(specsFor(KP_HA_M2).map(s=>s.patternSpecId)),allocationPolicy:"balanced_bidirectional_source_equivalence",visibilityStatus:"visible",holdReason:null}),
  Object.freeze({patternGroupId:GROUP_KM2_HA,sourceId:G5B_U10A_P05F21_SOURCE_ID,unitCode:G5B_U10A_P05F21_UNIT_CODE,unitTitle:G5B_U10A_P05F21_UNIT_TITLE,displayName:"平方公里與公頃換算",primaryKnowledgePointId:KP_KM2_HA,knowledgePointIds:Object.freeze([KP_KM2_HA]),supportClass:"A",mode:"diagram",publicQuestionMode:"diagram",representationTag:"large_area_unit_scale_diagram",representationTags:Object.freeze(["measurement","area_equivalence","square_kilometer","hectare","diagram_conversion"]),patternSpecIds:Object.freeze(specsFor(KP_KM2_HA).map(s=>s.patternSpecId)),allocationPolicy:"balanced_bidirectional_source_equivalence",visibilityStatus:"visible",holdReason:null}),
]);
const row=(knowledgePointId,displayName,groupId,specIds)=>Object.freeze({
  knowledgePointId,sourceId:G5B_U10A_P05F21_SOURCE_ID,unitCode:G5B_U10A_P05F21_UNIT_CODE,unitTitle:G5B_U10A_P05F21_UNIT_TITLE,
  displayName,canonicalNameZh:displayName,mode:"diagram",questionMode:"diagram",questionModes:Object.freeze(["diagram"]),supportClass:"A",
  visibilityStatus:"visible",selectorStatus:"visible",holdReason:null,applicationClassification:"DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
  canonicalPatternGroupIds:Object.freeze([groupId]),canonicalPatternSpecIds:Object.freeze([...specIds]),patternGroupIds:Object.freeze([groupId]),patternSpecIds:Object.freeze([...specIds]),
  requiredCapabilityIds:G5B_U10A_P05F21_REQUIRED_CAPABILITY_IDS,qaStatusLabel:"P05F21_G5B_U10A_SOURCE_EQUIVALENCE_CONVERSION",productionUse:"full_product_w5_slice021_candidate",
});
export const G5B_U10A_P05F21_SELECTOR_ROWS=Object.freeze([
  row(KP_HA_M2,"公頃與平方公尺換算",GROUP_HA_M2,G5B_U10A_P05F21_SPEC_IDS.slice(0,2)),
  row(KP_KM2_HA,"平方公里與公頃換算",GROUP_KM2_HA,G5B_U10A_P05F21_SPEC_IDS.slice(2,4)),
]);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function getG5BU10AP05F21SelectorRow(id){return clone(G5B_U10A_P05F21_SELECTOR_ROWS.find(r=>r.knowledgePointId===id)??null);}
export function listG5BU10AP05F21PatternGroups(id){return clone(G5B_U10A_P05F21_PATTERN_GROUPS.filter(g=>g.primaryKnowledgePointId===id));}
export function resolveG5BU10AP05F21PatternSpecIds(id){return clone(G5B_U10A_P05F21_PATTERN_SPECS.filter(s=>s.knowledgePointId===id).map(s=>s.patternSpecId));}
export function auditG5BU10AP05F21Projection(){
  const errors=[];
  if(G5B_U10A_P05F21_SELECTOR_ROWS.length!==2||G5B_U10A_P05F21_PATTERN_GROUPS.length!==2||G5B_U10A_P05F21_PATTERN_SPECS.length!==4||G5B_U10A_P05F21_FORMAL_MAPPINGS.length!==2)errors.push("P05F21_CARDINALITY_INVALID");
  if(new Set(G5B_U10A_P05F21_SPEC_IDS).size!==4)errors.push("P05F21_PATTERN_ID_DUPLICATE");
  for(const mapping of G5B_U10A_P05F21_FORMAL_MAPPINGS){
    const specs=G5B_U10A_P05F21_PATTERN_SPECS.filter(s=>s.knowledgePointId===mapping.knowledgePointId);
    if(specs.length!==2||specs.some(s=>!mapping.includedRelations.includes(s.relation)))errors.push(`P05F21_MAPPING_SPEC_MISMATCH:${mapping.knowledgePointId}`);
  }
  if(G5B_U10A_P05F21_PATTERN_SPECS.some(s=>s.questionMode!=="diagram"||s.requiresGeometryDiagramRepresentation!==true||s.requiresGeometryFormulaEvaluation!==true||s.applicationAllowed!==false||s.generalUnitConversionFrameworkRewriteAllowed!==false||s.unitConversionModifierApplied!==false))errors.push("P05F21_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:2,patternGroups:2,patternSpecs:4,formalMappings:2})});
}
