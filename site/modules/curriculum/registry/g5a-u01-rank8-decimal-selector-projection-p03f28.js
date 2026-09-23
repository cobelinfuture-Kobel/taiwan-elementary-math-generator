import { G5A_U01_SOURCE_ID, G5A_U01_UNIT_CODE, G5A_U01_UNIT_TITLE } from "./g5a-u01-decimal-read-place-selector-projection.js";

export const P03F28_TASK_ID = "P03F_W3DirectProductVerticalSlice028Implementation";
export const G5A_U01_P03F28_SOURCE_ID = G5A_U01_SOURCE_ID;
export const G5A_U01_P03F28_KP_ID = "kp_g5a_u01_decimal_compose_decompose";
export const G5A_U01_P03F28_GROUP_ID = "pg_g5a_u01_decimal_compose_decompose_numeric";
export const G5A_U01_P03F28_SPEC_ID = "ps_g5a_u01_decimal_compose_decompose_decimal_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; for (const nested of Object.values(value)) freeze(nested); return Object.freeze(value); };

export const G5A_U01_P03F28_PATTERN_GROUPS = freeze([{
  patternGroupId: G5A_U01_P03F28_GROUP_ID,
  sourceId: G5A_U01_P03F28_SOURCE_ID,
  unitCode: G5A_U01_UNIT_CODE,
  unitTitle: G5A_U01_UNIT_TITLE,
  displayName: "多位小數組成分解",
  primaryKnowledgePointId: G5A_U01_P03F28_KP_ID,
  knowledgePointIds: [G5A_U01_P03F28_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "decimal_compose_decompose",
  representationTags: ["decimal", "place_value", "expanded_decimal_form"],
  patternSpecIds: [G5A_U01_P03F28_SPEC_ID],
  allocationPolicy: "single_numeric_pattern",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G5A_U01_P03F28_SELECTOR_ROWS = freeze([{
  knowledgePointId: G5A_U01_P03F28_KP_ID,
  sourceId: G5A_U01_P03F28_SOURCE_ID,
  unitCode: G5A_U01_UNIT_CODE,
  unitTitle: G5A_U01_UNIT_TITLE,
  displayName: "多位小數組成分解",
  canonicalNameZh: "多位小數組成分解",
  mode: "numeric",
  questionMode: "numeric",
  questionModes: ["numeric"],
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G5A_U01_P03F28_GROUP_ID],
  canonicalPatternSpecIds: [G5A_U01_P03F28_SPEC_ID],
  patternGroupIds: [G5A_U01_P03F28_GROUP_ID],
  patternSpecIds: [G5A_U01_P03F28_SPEC_ID],
  qaStatusLabel: "P03F28_SLICE028_AUTHORITY_FROZEN",
  productionUse: "full_product_w3_slice028_candidate",
}]);

export const G5A_U01_P03F28_SELECTOR_PROJECTION = freeze({
  taskId: P03F28_TASK_ID,
  sourceId: G5A_U01_P03F28_SOURCE_ID,
  status: "RANK8_DECIMAL_COMPOSE_DECOMPOSE_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  numericPatternSpecCount: 1,
  applicationPatternSpecCount: 0,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 2,
  expectedSourceHiddenCountAfterAdmission: 6,
  expectedPublicSourceCountAfterAdmission: 29,
  expectedPublicKnowledgePointCountAfterAdmission: 219,
});

export function listG5AU01P03F28SelectorRows(){ return clone(G5A_U01_P03F28_SELECTOR_ROWS); }
export function getG5AU01P03F28SelectorRow(id){ return clone(G5A_U01_P03F28_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG5AU01P03F28PatternGroups(id){ return clone(G5A_U01_P03F28_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG5AU01P03F28PatternSpecIds(id){ return id === G5A_U01_P03F28_KP_ID ? [G5A_U01_P03F28_SPEC_ID] : []; }
export function auditG5AU01P03F28SelectorProjection(){
  const errors=[];
  if(G5A_U01_P03F28_SELECTOR_ROWS.length!==1) errors.push("P03F28_KP_COUNT_INVALID");
  if(G5A_U01_P03F28_PATTERN_GROUPS.length!==1) errors.push("P03F28_GROUP_COUNT_INVALID");
  if(G5A_U01_P03F28_PATTERN_GROUPS[0]?.patternSpecIds?.length!==1) errors.push("P03F28_SPEC_COUNT_INVALID");
  if(G5A_U01_P03F28_PATTERN_GROUPS.some((group)=>group.publicQuestionMode!=="numeric")) errors.push("P03F28_APPLICATION_MODE_LEAK");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:1,numeric:1,application:0})});
}
