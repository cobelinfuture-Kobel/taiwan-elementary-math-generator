export const P05F5_TASK_ID = "P05F_W5DirectProductVerticalSlice005Implementation";
export const G4B_U10_P05F5_SOURCE_ID = "g4b_u10_4b10";
export const G4B_U10_P05F5_UNIT_CODE = "4B-U10";
export const G4B_U10_P05F5_UNIT_TITLE = "立方公分與體積";
export const G4B_U10_P05F5_KP_ID = "kp_g4b_u10_cubic_centimeter_unit";
export const G4B_U10_P05F5_GROUP_ID = "pg_g4b_u10_cubic_centimeter_unit";
export const G4B_U10_P05F5_FUTURE_KP_IDS = Object.freeze([
  "kp_g4b_u10_unit_cube_counting",
  "kp_g4b_u10_layered_cube_counting",
  "kp_g4b_u10_volume_conservation_rearrangement",
  "kp_g4b_u10_rectangular_prism_volume_structure",
]);
export const G4B_U10_P05F5_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
]);
export const G4B_U10_P05F5_SPEC_IDS = Object.freeze([
  "ps_g4b_u10_identify_one_cubic_centimeter",
  "ps_g4b_u10_match_one_cm_edge_cube_to_one_cm3",
  "ps_g4b_u10_recognize_cm3_as_volume_unit",
  "ps_g4b_u10_distinguish_volume_unit_dimension",
]);

const spec = (patternSpecId, relation, diagramMode, answerDomain, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G4B_U10_P05F5_KP_ID,
  patternFamilyId: "CUBIC_CENTIMETER_UNIT_IDENTITY",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain,
  requiresSolidGeometryRepresentation: true,
  applicationAllowed: false,
  unitCubeCountingAllowed: false,
  layeredCubeCountingAllowed: false,
  volumeConservationRearrangementAllowed: false,
  rectangularPrismVolumeStructureAllowed: false,
  sourceEvidenceTopic,
});

export const G4B_U10_P05F5_PATTERN_SPECS = Object.freeze([
  spec(G4B_U10_P05F5_SPEC_IDS[0], "IDENTIFY_ONE_CUBIC_CENTIMETER", "UNIT_CUBE_VOLUME", "ONE_CUBIC_CENTIMETER_ZH", "邊長1公分正方體的體積是1立方公分"),
  spec(G4B_U10_P05F5_SPEC_IDS[1], "MATCH_ONE_CM_EDGE_CUBE_TO_ONE_CM3", "EDGE_LABELS", "ONE_CUBIC_CENTIMETER_ZH", "邊長1公分正方體與1立方公分對應"),
  spec(G4B_U10_P05F5_SPEC_IDS[2], "RECOGNIZE_CM3_AS_VOLUME_UNIT", "CM3_UNIT", "CUBIC_CENTIMETER_ZH", "立方公分是體積單位"),
  spec(G4B_U10_P05F5_SPEC_IDS[3], "DISTINGUISH_VOLUME_UNIT_FROM_AREA_OR_LENGTH_UNIT", "DIMENSION_CUE", "VOLUME_UNIT_ZH", "體積單位不同於面積或長度單位"),
]);

export const G4B_U10_P05F5_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g4b_u10_cubic_centimeter_unit_p05f5",
  sourceId: G4B_U10_P05F5_SOURCE_ID,
  sourcePages: Object.freeze([1, 2]),
  knowledgePointId: G4B_U10_P05F5_KP_ID,
  canonicalNameZh: "立方公分體積單位",
  relationFamily: "CUBIC_CENTIMETER_UNIT_IDENTITY",
  inputRepresentation: "SINGLE_ONE_CENTIMETER_EDGE_CUBE_DIAGRAM",
  answerDomain: Object.freeze(["1 立方公分", "立方公分", "體積單位"]),
  reasoningInvariant: "體積單位是三維堆疊單位，不等同面積或長度單位。",
  directSourceConcepts: Object.freeze([
    "ONE_CENTIMETER_EDGE_CUBE",
    "ONE_CUBIC_CENTIMETER_VOLUME",
    "THREE_DIMENSIONAL_VOLUME_UNIT",
    "VOLUME_UNIT_DISTINCT_FROM_AREA_OR_LENGTH_UNIT",
  ]),
  learnerFacingVocabulary: Object.freeze(["正方體", "邊長", "1公分", "體積", "立方公分", "長度單位", "面積單位", "體積單位"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["數方塊", "幾個方塊", "每層", "層數", "重組", "長乘寬乘高", "應用題"]),
  includedRelations: Object.freeze([
    "IDENTIFY_ONE_CUBIC_CENTIMETER",
    "MATCH_ONE_CM_EDGE_CUBE_TO_ONE_CM3",
    "RECOGNIZE_CM3_AS_VOLUME_UNIT",
    "DISTINGUISH_VOLUME_UNIT_FROM_AREA_OR_LENGTH_UNIT",
  ]),
  excludedRelations: Object.freeze([
    "UNIT_CUBE_COUNTING",
    "LAYERED_CUBE_COUNTING",
    "VOLUME_CONSERVATION_REARRANGEMENT",
    "RECTANGULAR_PRISM_VOLUME_STRUCTURE",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G4B_U10_P05F5_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G4B_U10_P05F5_SPEC_IDS,
});

export const G4B_U10_P05F5_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G4B_U10_P05F5_GROUP_ID,
    sourceId: G4B_U10_P05F5_SOURCE_ID,
    unitCode: G4B_U10_P05F5_UNIT_CODE,
    unitTitle: G4B_U10_P05F5_UNIT_TITLE,
    displayName: "立方公分體積單位圖形題",
    primaryKnowledgePointId: G4B_U10_P05F5_KP_ID,
    knowledgePointIds: Object.freeze([G4B_U10_P05F5_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "cubic_centimeter_unit_diagram",
    representationTags: Object.freeze(["geometry", "spatial_solid", "unit_cube", "cubic_centimeter", "volume_unit", "diagram_identification"]),
    patternSpecIds: G4B_U10_P05F5_SPEC_IDS,
    allocationPolicy: "balanced_cubic_centimeter_unit_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G4B_U10_P05F5_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G4B_U10_P05F5_KP_ID,
    sourceId: G4B_U10_P05F5_SOURCE_ID,
    unitCode: G4B_U10_P05F5_UNIT_CODE,
    unitTitle: G4B_U10_P05F5_UNIT_TITLE,
    displayName: "立方公分體積單位",
    canonicalNameZh: "立方公分體積單位",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G4B_U10_P05F5_GROUP_ID]),
    canonicalPatternSpecIds: G4B_U10_P05F5_SPEC_IDS,
    patternGroupIds: Object.freeze([G4B_U10_P05F5_GROUP_ID]),
    patternSpecIds: G4B_U10_P05F5_SPEC_IDS,
    requiredCapabilityIds: G4B_U10_P05F5_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F5_G4B_U10_SOURCE_BACKED_SOLID_DIAGRAM",
    productionUse: "full_product_w5_slice005_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG4BU10P05F5SelectorRows() { return clone(G4B_U10_P05F5_SELECTOR_ROWS); }
export function getG4BU10P05F5SelectorRow(id) { return clone(id === G4B_U10_P05F5_KP_ID ? G4B_U10_P05F5_SELECTOR_ROWS[0] : null); }
export function listG4BU10P05F5PatternGroups(id) { return clone(id === G4B_U10_P05F5_KP_ID ? G4B_U10_P05F5_PATTERN_GROUPS : []); }
export function resolveG4BU10P05F5PatternSpecIds(id) { return clone(id === G4B_U10_P05F5_KP_ID ? G4B_U10_P05F5_SPEC_IDS : []); }
export function auditG4BU10P05F5SelectorProjection() {
  const errors = [];
  if (G4B_U10_P05F5_SELECTOR_ROWS.length !== 1 || G4B_U10_P05F5_PATTERN_GROUPS.length !== 1 || G4B_U10_P05F5_PATTERN_SPECS.length !== 4) errors.push("P05F5_CARDINALITY_INVALID");
  const relations = new Set(G4B_U10_P05F5_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G4B_U10_P05F5_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F5_RELATION_MISSING:${relation}`);
  if (G4B_U10_P05F5_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresSolidGeometryRepresentation !== true || row.applicationAllowed !== false || row.unitCubeCountingAllowed !== false || row.layeredCubeCountingAllowed !== false || row.volumeConservationRearrangementAllowed !== false || row.rectangularPrismVolumeStructureAllowed !== false)) errors.push("P05F5_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 4, diagram: 4, application: 0 }) });
}
