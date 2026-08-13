export const P03F33_TASK_ID = "P03F_W3DirectProductVerticalSlice033Implementation";
export const G4A_U06_P03F33_SOURCE_ID = "g4a_u06_4a06";
export const G4A_U06_P03F33_UNIT_CODE = "4A-U06";
export const G4A_U06_P03F33_UNIT_TITLE = "假分數與帶分數";
export const P03F33_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

export const G4A_U06_P03F33_SURFACES = Object.freeze([
  Object.freeze({
    knowledgePointId:"kp_fraction_improper_mixed_compare_order",
    sourceCanonicalKnowledgePointId:"kp_g4a_u06_fraction_compare_order",
    displayName:"假分數與帶分數比較排序",
    applicationClassification:"APPLICATION_COMPATIBLE",
    operationModelId:"op_g4a_u06_fraction_compare_order",
    operationFamilyId:"fraction_compare",
    requestedUnknownRole:"comparison",
    patternGroupId:"pg_g4a_u06_fraction_compare_order_numeric",
    patternSpecIds:Object.freeze(["ps_g4a_u06_fraction_compare_order_comparison_numeric"]),
    hiddenApplicationPatternSpecIds:Object.freeze(["ps_g4a_u06_fraction_compare_order_comparison_application"]),
    representationTags:Object.freeze(["fraction","improper_fraction","mixed_number","comparison","exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId:"kp_fraction_improper_mixed_number_line",
    sourceCanonicalKnowledgePointId:"kp_g4a_u06_fraction_number_line",
    displayName:"假分數與帶分數數線定位",
    applicationClassification:"APPLICATION_NOT_APPLICABLE",
    operationModelId:"op_g4a_u06_fraction_number_line",
    operationFamilyId:"number_line",
    requestedUnknownRole:"coordinate_or_distance",
    patternGroupId:"pg_g4a_u06_fraction_number_line_numeric",
    patternSpecIds:Object.freeze([
      "ps_g4a_u06_fraction_number_line_coordinate_numeric",
      "ps_g4a_u06_fraction_number_line_distance_numeric",
    ]),
    hiddenApplicationPatternSpecIds:Object.freeze([]),
    representationTags:Object.freeze(["fraction","improper_fraction","mixed_number","number_line","exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId:"kp_fraction_same_denominator_mixed_add_sub",
    sourceCanonicalKnowledgePointId:"kp_g4a_u06_mixed_fraction_add_sub",
    displayName:"同分母帶分數加減",
    applicationClassification:"APPLICATION_COMPATIBLE",
    operationModelId:"op_g4a_u06_mixed_fraction_add_sub",
    operationFamilyId:"fraction_add_sub",
    requestedUnknownRole:"result",
    patternGroupId:"pg_g4a_u06_mixed_fraction_add_sub_numeric",
    patternSpecIds:Object.freeze(["ps_g4a_u06_mixed_fraction_add_sub_result_numeric"]),
    hiddenApplicationPatternSpecIds:Object.freeze(["ps_g4a_u06_mixed_fraction_add_sub_result_application"]),
    representationTags:Object.freeze(["fraction","mixed_number","same_denominator","addition","subtraction","exact_rational"]),
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export const G4A_U06_P03F33_PATTERN_GROUPS = Object.freeze(G4A_U06_P03F33_SURFACES.map((surface) => Object.freeze({
  patternGroupId:surface.patternGroupId,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  unitCode:G4A_U06_P03F33_UNIT_CODE,
  unitTitle:G4A_U06_P03F33_UNIT_TITLE,
  displayName:surface.displayName,
  primaryKnowledgePointId:surface.knowledgePointId,
  knowledgePointIds:Object.freeze([surface.knowledgePointId]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:surface.operationFamilyId,
  representationTags:surface.representationTags,
  patternSpecIds:surface.patternSpecIds,
  allocationPolicy:surface.patternSpecIds.length === 1 ? "single_pattern_spec" : "balanced_across_pattern_specs",
  visibilityStatus:"visible",
  holdReason:null,
})));

export const G4A_U06_P03F33_SELECTOR_ROWS = Object.freeze(G4A_U06_P03F33_SURFACES.map((surface) => Object.freeze({
  knowledgePointId:surface.knowledgePointId,
  sourceCanonicalKnowledgePointId:surface.sourceCanonicalKnowledgePointId,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  unitCode:G4A_U06_P03F33_UNIT_CODE,
  unitTitle:G4A_U06_P03F33_UNIT_TITLE,
  displayName:surface.displayName,
  canonicalNameZh:surface.displayName,
  mode:"numeric",
  questionMode:"numeric",
  questionModes:Object.freeze(["numeric"]),
  supportClass:"A",
  visibilityStatus:"visible",
  selectorStatus:"visible",
  holdReason:null,
  applicationClassification:surface.applicationClassification,
  canonicalPatternGroupIds:Object.freeze([surface.patternGroupId]),
  canonicalPatternSpecIds:surface.patternSpecIds,
  patternGroupIds:Object.freeze([surface.patternGroupId]),
  patternSpecIds:surface.patternSpecIds,
  requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
  hiddenApplicationPatternSpecIds:surface.hiddenApplicationPatternSpecIds,
  qaStatusLabel:"P03F33_SLICE033_AUTHORITY_FROZEN",
  productionUse:"full_product_w3_slice033_candidate",
})));

export const G4A_U06_P03F33_KP_IDS = Object.freeze(G4A_U06_P03F33_SURFACES.map((surface) => surface.knowledgePointId));
export const G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS = Object.freeze(G4A_U06_P03F33_SURFACES.flatMap((surface) => surface.patternSpecIds));
export const G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS = Object.freeze(G4A_U06_P03F33_SURFACES.flatMap((surface) => surface.hiddenApplicationPatternSpecIds));
export const G4A_U06_P03F33_SELECTOR_PROJECTION = Object.freeze({
  taskId:P03F33_TASK_ID,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  status:"THREE_RANK9_FRACTION_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount:3,
  patternGroupCount:3,
  patternSpecCount:4,
  numericPatternSpecCount:4,
  applicationPatternSpecCount:0,
  hiddenApplicationPatternSpecIds:G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS,
  publicSelectionEnabled:true,
  sharedPipelineRequired:true,
  applicationModeAllowed:false,
  expectedSourceVisibleCountAfterAdmission:5,
  expectedSourceHiddenCountAfterAdmission:1,
  expectedPublicSourceCountAfterAdmission:32,
  expectedPublicKnowledgePointCountAfterAdmission:229,
});

export function listG4AU06P03F33SelectorRows(){ return clone(G4A_U06_P03F33_SELECTOR_ROWS); }
export function getG4AU06P03F33SelectorRow(id){ return clone(G4A_U06_P03F33_SELECTOR_ROWS.find((row)=>row.knowledgePointId===id) ?? null); }
export function listG4AU06P03F33PatternGroups(id){ return clone(G4A_U06_P03F33_PATTERN_GROUPS.filter((group)=>group.primaryKnowledgePointId===id)); }
export function resolveG4AU06P03F33PatternSpecIds(id){ return clone(G4A_U06_P03F33_SURFACES.find((surface)=>surface.knowledgePointId===id)?.patternSpecIds ?? []); }
export function auditG4AU06P03F33SelectorProjection(){
  const errors=[];
  if(G4A_U06_P03F33_SELECTOR_ROWS.length!==3) errors.push("P03F33_KP_COUNT_INVALID");
  if(G4A_U06_P03F33_PATTERN_GROUPS.length!==3) errors.push("P03F33_GROUP_COUNT_INVALID");
  if(new Set(G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS).size!==4) errors.push("P03F33_SPEC_COUNT_INVALID");
  if(G4A_U06_P03F33_SELECTOR_ROWS.some((row)=>row.questionMode!=="numeric" || row.patternSpecIds.some((id)=>G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS.includes(id)))) errors.push("P03F33_APPLICATION_MODE_LEAK");
  if(G4A_U06_P03F33_SELECTOR_ROWS.some((row)=>JSON.stringify(row.requiredCapabilityIds)!==JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS))) errors.push("P03F33_CAPABILITY_SET_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:3,patternGroups:3,patternSpecs:4,numeric:4,application:0})});
}
