import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_UNIT_CODE,
  G4A_U06_UNIT_TITLE,
} from "./g4a-u06-fraction-type-classification-selector-projection.js";

export const P03F33_TASK_ID = "P03F_W3DirectProductVerticalSlice033Implementation";
export const G4A_U06_P03F33_SOURCE_ID = G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID;
export const P03F33_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

export const G4A_U06_P03F33_COMPARE_KP_ID = "kp_fraction_improper_mixed_compare_order";
export const G4A_U06_P03F33_NUMBER_LINE_KP_ID = "kp_fraction_improper_mixed_number_line";
export const G4A_U06_P03F33_ADD_SUB_KP_ID = "kp_fraction_same_denominator_mixed_add_sub";
export const G4A_U06_P03F33_KP_IDS = Object.freeze([
  G4A_U06_P03F33_COMPARE_KP_ID,
  G4A_U06_P03F33_NUMBER_LINE_KP_ID,
  G4A_U06_P03F33_ADD_SUB_KP_ID,
]);

export const G4A_U06_P03F33_SURFACES = Object.freeze([
  Object.freeze({
    knowledgePointId:G4A_U06_P03F33_COMPARE_KP_ID,
    displayName:"假分數與帶分數比較排序",
    applicationClassification:"APPLICATION_COMPATIBLE",
    operationModelId:"op_g4a_u06_fraction_compare_order",
    operationFamilyId:"fraction_compare",
    patternGroupId:"pg_g4a_u06_fraction_compare_order_numeric",
    patternSpecs:Object.freeze([
      Object.freeze({ patternSpecId:"ps_g4a_u06_fraction_compare_order_comparison_numeric", requestedUnknownRole:"comparison" }),
    ]),
    hiddenApplicationPatternSpecIds:Object.freeze(["ps_g4a_u06_fraction_compare_order_comparison_application"]),
    representationTags:Object.freeze(["fraction","improper_fraction","mixed_number","comparison","exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId:G4A_U06_P03F33_NUMBER_LINE_KP_ID,
    displayName:"分數數線定位",
    applicationClassification:"APPLICATION_NOT_APPLICABLE",
    operationModelId:"op_g4a_u06_fraction_number_line",
    operationFamilyId:"number_line",
    patternGroupId:"pg_g4a_u06_fraction_number_line_numeric",
    patternSpecs:Object.freeze([
      Object.freeze({ patternSpecId:"ps_g4a_u06_fraction_number_line_coordinate_numeric", requestedUnknownRole:"coordinate" }),
      Object.freeze({ patternSpecId:"ps_g4a_u06_fraction_number_line_distance_numeric", requestedUnknownRole:"distance" }),
    ]),
    hiddenApplicationPatternSpecIds:Object.freeze([]),
    representationTags:Object.freeze(["fraction","number_line","coordinate","distance","exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId:G4A_U06_P03F33_ADD_SUB_KP_ID,
    displayName:"同分母帶分數加減",
    applicationClassification:"APPLICATION_COMPATIBLE",
    operationModelId:"op_g4a_u06_mixed_fraction_add_sub",
    operationFamilyId:"fraction_add_sub",
    patternGroupId:"pg_g4a_u06_mixed_fraction_add_sub_numeric",
    patternSpecs:Object.freeze([
      Object.freeze({ patternSpecId:"ps_g4a_u06_mixed_fraction_add_sub_result_numeric", requestedUnknownRole:"result" }),
    ]),
    hiddenApplicationPatternSpecIds:Object.freeze(["ps_g4a_u06_mixed_fraction_add_sub_result_application"]),
    representationTags:Object.freeze(["fraction","mixed_number","same_denominator","addition","subtraction","exact_rational"]),
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const allSpecs = G4A_U06_P03F33_SURFACES.flatMap((surface) => surface.patternSpecs.map((row) => row.patternSpecId));

export const G4A_U06_P03F33_PATTERN_SPEC_IDS = Object.freeze(allSpecs);
export const G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS = Object.freeze(G4A_U06_P03F33_SURFACES.flatMap((surface) => surface.hiddenApplicationPatternSpecIds));
export const G4A_U06_P03F33_PATTERN_GROUPS = Object.freeze(G4A_U06_P03F33_SURFACES.map((surface) => Object.freeze({
  patternGroupId:surface.patternGroupId,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  unitCode:G4A_U06_UNIT_CODE,
  unitTitle:G4A_U06_UNIT_TITLE,
  displayName:surface.displayName,
  primaryKnowledgePointId:surface.knowledgePointId,
  knowledgePointIds:Object.freeze([surface.knowledgePointId]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:surface.operationFamilyId,
  representationTags:surface.representationTags,
  patternSpecIds:Object.freeze(surface.patternSpecs.map((row) => row.patternSpecId)),
  allocationPolicy:surface.patternSpecs.length === 1 ? "single_pattern_spec" : "balanced_across_numeric_roles",
  visibilityStatus:"visible",
  holdReason:null,
})));

export const G4A_U06_P03F33_SELECTOR_ROWS = Object.freeze(G4A_U06_P03F33_SURFACES.map((surface) => Object.freeze({
  knowledgePointId:surface.knowledgePointId,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  unitCode:G4A_U06_UNIT_CODE,
  unitTitle:G4A_U06_UNIT_TITLE,
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
  canonicalPatternSpecIds:Object.freeze(surface.patternSpecs.map((row) => row.patternSpecId)),
  patternGroupIds:Object.freeze([surface.patternGroupId]),
  patternSpecIds:Object.freeze(surface.patternSpecs.map((row) => row.patternSpecId)),
  requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
  hiddenApplicationPatternSpecIds:surface.hiddenApplicationPatternSpecIds,
  qaStatusLabel:"P03F33_SLICE033_AUTHORITY_FROZEN",
  productionUse:"full_product_w3_slice033_candidate",
})));

export const G4A_U06_P03F33_SELECTOR_PROJECTION = Object.freeze({
  taskId:P03F33_TASK_ID,
  sourceId:G4A_U06_P03F33_SOURCE_ID,
  status:"THREE_RANK9_FRACTION_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount:3,
  patternGroupCount:3,
  patternSpecCount:4,
  numericPatternSpecCount:4,
  applicationPatternSpecCount:0,
  publicSelectionEnabled:true,
  sharedPipelineRequired:true,
  applicationModeAllowed:false,
  expectedSourceVisibleCountAfterAdmission:5,
  expectedSourceHiddenCountAfterAdmission:1,
  expectedPublicSourceCountAfterAdmission:32,
  expectedPublicKnowledgePointCountAfterAdmission:229,
});

export function listG4AU06P03F33SelectorRows() { return clone(G4A_U06_P03F33_SELECTOR_ROWS); }
export function getG4AU06P03F33SelectorRow(id) { return clone(G4A_U06_P03F33_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4AU06P03F33PatternGroups(id) { return clone(G4A_U06_P03F33_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG4AU06P03F33PatternSpecIds(id) { const row = G4A_U06_P03F33_SELECTOR_ROWS.find((surface) => surface.knowledgePointId === id); return row ? [...row.patternSpecIds] : []; }
export function auditG4AU06P03F33SelectorProjection() {
  const errors = [];
  if (G4A_U06_P03F33_SELECTOR_ROWS.length !== 3) errors.push("P03F33_KP_COUNT_INVALID");
  if (G4A_U06_P03F33_PATTERN_GROUPS.length !== 3) errors.push("P03F33_GROUP_COUNT_INVALID");
  if (G4A_U06_P03F33_PATTERN_SPEC_IDS.length !== 4 || new Set(G4A_U06_P03F33_PATTERN_SPEC_IDS).size !== 4) errors.push("P03F33_SPEC_COUNT_INVALID");
  if (G4A_U06_P03F33_SELECTOR_ROWS.some((row) => row.questionMode !== "numeric" || row.patternSpecIds.some((id) => G4A_U06_P03F33_HIDDEN_APPLICATION_SPEC_IDS.includes(id)))) errors.push("P03F33_APPLICATION_MODE_LEAK");
  if (G4A_U06_P03F33_SELECTOR_ROWS.some((row) => JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS))) errors.push("P03F33_CAPABILITY_SET_INVALID");
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), counts:Object.freeze({ knowledgePoints:3, patternGroups:3, patternSpecs:4, numeric:4, application:0 }) });
}
