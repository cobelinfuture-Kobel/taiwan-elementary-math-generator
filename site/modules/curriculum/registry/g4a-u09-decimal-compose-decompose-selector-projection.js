export const G4A_U09_DECIMAL_COMPOSE_SOURCE_ID = "g4a_u09_4a09";
export const G4A_U09_DECIMAL_COMPOSE_KP_ID = "kp_g4a_u09_decimal_compose_decompose";
export const G4A_U09_DECIMAL_COMPOSE_GROUP_ID = "pg_g4a_u09_decimal_compose_decompose_numeric";
export const G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID = "ps_g4a_u09_decimal_compose_decompose_decimal_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4A_U09_DECIMAL_COMPOSE_PATTERN_GROUPS = freeze([{
  patternGroupId: G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  unitCode: "4A-U09",
  unitTitle: "2位小數",
  displayName: "二位小數組成分解",
  primaryKnowledgePointId: G4A_U09_DECIMAL_COMPOSE_KP_ID,
  knowledgePointIds: [G4A_U09_DECIMAL_COMPOSE_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "decimal_compose_decompose",
  representationTags: ["decimal", "place_value", "tenths", "hundredths"],
  patternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
  allocationPolicy: "single_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G4A_U09_DECIMAL_COMPOSE_ROWS = freeze([{
  knowledgePointId: G4A_U09_DECIMAL_COMPOSE_KP_ID,
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  unitCode: "4A-U09",
  unitTitle: "2位小數",
  displayName: "二位小數組成分解",
  canonicalNameZh: "二位小數組成分解",
  mode: "numeric",
  questionMode: "numeric",
  questionModes: ["numeric"],
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G4A_U09_DECIMAL_COMPOSE_GROUP_ID],
  canonicalPatternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
  patternGroupIds: [G4A_U09_DECIMAL_COMPOSE_GROUP_ID],
  patternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F_SLICE018_IMPLEMENTATION",
  productionUse: "full_product_w3_slice018_candidate",
}]);

export function listG4AU09DecimalComposeSelectorRows() { return clone(G4A_U09_DECIMAL_COMPOSE_ROWS); }
export function getG4AU09DecimalComposeSelectorRow(id) { return clone(G4A_U09_DECIMAL_COMPOSE_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4AU09DecimalComposePatternGroups(id) { return clone(G4A_U09_DECIMAL_COMPOSE_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG4AU09DecimalComposePatternSpecIds(id) { return listG4AU09DecimalComposePatternGroups(id).flatMap((row) => row.patternSpecIds); }
export function auditG4AU09DecimalComposeProjection() {
  const errors = [];
  if (G4A_U09_DECIMAL_COMPOSE_ROWS.length !== 1) errors.push("P03F18_KP_COUNT_INVALID");
  if (G4A_U09_DECIMAL_COMPOSE_PATTERN_GROUPS.length !== 1) errors.push("P03F18_GROUP_COUNT_INVALID");
  if (G4A_U09_DECIMAL_COMPOSE_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F18_SPEC_COUNT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }) });
}
