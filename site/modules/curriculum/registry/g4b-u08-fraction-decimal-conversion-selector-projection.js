import { G4B_U08_SOURCE_ID, G4B_U08_UNIT_CODE, G4B_U08_UNIT_TITLE } from "./g4b-u08-equivalent-fraction-selector-projection.js";

export const G4B_U08_FRACTION_DECIMAL_KP_ID = "kp_g4b_u08_fraction_decimal_conversion";
export const G4B_U08_FRACTION_DECIMAL_GROUP_ID = "pg_g4b_u08_fraction_decimal_conversion_numeric";
export const G4B_U08_FRACTION_DECIMAL_SPEC_IDS = Object.freeze([
  "ps_g4b_u08_fraction_decimal_conversion_decimal_numeric",
  "ps_g4b_u08_fraction_decimal_conversion_numerator_numeric",
]);
const clone = (v) => v == null ? v : JSON.parse(JSON.stringify(v));
const freeze = (v) => { if (!v || typeof v !== "object" || Object.isFrozen(v)) return v; Object.values(v).forEach(freeze); return Object.freeze(v); };
export const G4B_U08_FRACTION_DECIMAL_PATTERN_GROUPS = freeze([{
  patternGroupId: G4B_U08_FRACTION_DECIMAL_GROUP_ID, sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE, unitTitle: G4B_U08_UNIT_TITLE, displayName: "分數與有限小數互換",
  primaryKnowledgePointId: G4B_U08_FRACTION_DECIMAL_KP_ID, knowledgePointIds: [G4B_U08_FRACTION_DECIMAL_KP_ID],
  supportClass: "A", mode: "numeric", publicQuestionMode: "numeric",
  representationTags: ["fraction", "decimal", "exact_equivalence", "bidirectional_conversion"],
  patternSpecIds: G4B_U08_FRACTION_DECIMAL_SPEC_IDS, allocationPolicy: "balanced_pattern_specs",
  visibilityStatus: "visible", holdReason: null,
}]);
export const G4B_U08_FRACTION_DECIMAL_ROWS = freeze([{
  knowledgePointId: G4B_U08_FRACTION_DECIMAL_KP_ID, sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE, unitTitle: G4B_U08_UNIT_TITLE, displayName: "分數與有限小數互換",
  canonicalNameZh: "分數與有限小數互換", mode: "numeric", questionMode: "numeric", supportClass: "A",
  visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G4B_U08_FRACTION_DECIMAL_GROUP_ID], canonicalPatternSpecIds: G4B_U08_FRACTION_DECIMAL_SPEC_IDS,
  patternGroupIds: [G4B_U08_FRACTION_DECIMAL_GROUP_ID], patternSpecIds: G4B_U08_FRACTION_DECIMAL_SPEC_IDS,
  qaStatusLabel: "P03F20_SLICE020_IMPLEMENTATION", productionUse: "full_product_w3_slice020",
}]);
export function listG4BU08FractionDecimalSelectorRows(){ return clone(G4B_U08_FRACTION_DECIMAL_ROWS); }
export function getG4BU08FractionDecimalSelectorRow(id){ return id === G4B_U08_FRACTION_DECIMAL_KP_ID ? clone(G4B_U08_FRACTION_DECIMAL_ROWS[0]) : null; }
export function listG4BU08FractionDecimalPatternGroups(id){ return id === G4B_U08_FRACTION_DECIMAL_KP_ID ? clone(G4B_U08_FRACTION_DECIMAL_PATTERN_GROUPS) : []; }
export function resolveG4BU08FractionDecimalPatternSpecIds(id){ return id === G4B_U08_FRACTION_DECIMAL_KP_ID ? [...G4B_U08_FRACTION_DECIMAL_SPEC_IDS] : []; }
export function auditG4BU08FractionDecimalSelectorProjection(){
  const errors=[];
  if(G4B_U08_FRACTION_DECIMAL_ROWS.length!==1) errors.push("P03F20_KP_COUNT_INVALID");
  if(G4B_U08_FRACTION_DECIMAL_PATTERN_GROUPS.length!==1) errors.push("P03F20_GROUP_COUNT_INVALID");
  if(G4B_U08_FRACTION_DECIMAL_SPEC_IDS.length!==2) errors.push("P03F20_SPEC_COUNT_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({knowledgePoints:1,patternGroups:1,patternSpecs:2})});
}
