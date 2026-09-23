export const P05F7_TASK_ID = "P05F_W5DirectProductVerticalSlice007Implementation";
export const G5A_U10A_P05F7_SOURCE_ID = "g5a_u10_5a10a";
export const G5A_U10A_P05F7_UNIT_CODE = "5A-U10A";
export const G5A_U10A_P05F7_UNIT_TITLE = "柱體錐體和球";
export const G5A_U10A_P05F7_KP_ID = "kp_g5a_u10a_solid_shape_classification";
export const G5A_U10A_P05F7_GROUP_ID = "pg_g5a_u10a_solid_shape_classification";
export const G5A_U10A_P05F7_FUTURE_KP_IDS = Object.freeze([
  "kp_g5a_u10a_prism_pyramid_elements",
  "kp_g5a_u10a_solid_net_correspondence",
  "kp_g5a_u10a_solid_cross_section",
  "kp_g5a_u10a_solid_viewpoint_representation",
]);
export const G5A_U10A_P05F7_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
]);
export const G5A_U10A_P05F7_SPEC_IDS = Object.freeze([
  "ps_g5a_u10a_classify_solids_by_features",
  "ps_g5a_u10a_distinguish_column_cone_sphere",
  "ps_g5a_u10a_recognize_defining_solid_features",
]);

const spec = (patternSpecId, relation, diagramMode, sourceEvidenceTopic) => Object.freeze({
  patternSpecId,
  knowledgePointId: G5A_U10A_P05F7_KP_ID,
  patternFamilyId: "SOLID_SHAPE_CLASSIFICATION",
  relation,
  diagramMode,
  questionMode: "diagram",
  answerDomain: "SOLID_FAMILY_ZH",
  requiresSolidGeometryRepresentation: true,
  applicationAllowed: false,
  solidElementsNamingOrCountAllowed: false,
  solidNetCorrespondenceAllowed: false,
  solidCrossSectionAllowed: false,
  solidViewpointRepresentationAllowed: false,
  cubeCuboidSpecialCaseReasoningAllowed: false,
  solidMeasurementOrFormulaAllowed: false,
  sourceEvidenceTopic,
});

export const G5A_U10A_P05F7_PATTERN_SPECS = Object.freeze([
  spec(G5A_U10A_P05F7_SPEC_IDS[0], "CLASSIFY_SOLIDS_BY_BASE_SIDE_VERTEX_FEATURES", "CLASSIFY_BY_FEATURES", "依底面、側面與頂點特徵分類柱體、錐體與球"),
  spec(G5A_U10A_P05F7_SPEC_IDS[1], "DISTINGUISH_COLUMN_CONE_SPHERE", "COLUMN_CONE_SPHERE_CHOICE", "區分柱體、錐體與球"),
  spec(G5A_U10A_P05F7_SPEC_IDS[2], "RECOGNIZE_DEFINING_SOLID_FEATURES", "DEFINING_FEATURES", "由兩平行全等底面、單一頂點或無平面底面辨認立體"),
]);

export const G5A_U10A_P05F7_FORMAL_MAPPING = Object.freeze({
  mappingId: "fm_g5a_u10a_solid_shape_classification_p05f7",
  sourceId: G5A_U10A_P05F7_SOURCE_ID,
  sourcePages: Object.freeze([1, 2]),
  knowledgePointId: G5A_U10A_P05F7_KP_ID,
  canonicalNameZh: "柱體錐體與球分類",
  relationFamily: "SOLID_SHAPE_CLASSIFICATION",
  inputRepresentation: "BOUNDED_SOLID_GEOMETRY_DIAGRAM",
  answerDomain: Object.freeze(["柱體", "錐體", "球"]),
  reasoningInvariant: "柱體有兩個全等平行底面，錐體向一頂點收斂，球無平面底面。",
  directSourceConcepts: Object.freeze([
    "SOLID_SHAPE_CLASSIFICATION_BY_BASE_SIDE_VERTEX_FEATURES",
    "COLUMN_HAS_TWO_CONGRUENT_PARALLEL_BASES",
    "CONE_CONVERGES_TO_ONE_APEX",
    "SPHERE_HAS_NO_PLANE_BASE",
  ]),
  learnerFacingVocabulary: Object.freeze(["立體圖形", "底面", "側面", "頂點", "柱體", "錐體", "球"]),
  learnerFacingForbiddenVocabulary: Object.freeze(["幾個面", "幾條稜", "幾個頂點", "展開圖", "截面", "視圖", "正方體", "長方體", "體積", "表面積", "公式", "應用題"]),
  includedRelations: Object.freeze([
    "CLASSIFY_SOLIDS_BY_BASE_SIDE_VERTEX_FEATURES",
    "DISTINGUISH_COLUMN_CONE_SPHERE",
    "RECOGNIZE_DEFINING_SOLID_FEATURES",
  ]),
  excludedRelations: Object.freeze([
    "SOLID_ELEMENTS_NAMING_OR_COUNT",
    "SOLID_NET_CORRESPONDENCE",
    "SOLID_CROSS_SECTION",
    "SOLID_VIEWPOINT_REPRESENTATION",
    "CUBE_CUBOID_SPECIAL_CASE_REASONING",
    "SOLID_MEASUREMENT_OR_FORMULA",
    "APPLICATION_CONTEXT",
  ]),
  applicationSuitability: "APPLICATION_COMPATIBLE",
  applicationContextSupportedByDirectPdf: false,
  applicationImplementationAllowed: false,
  requiredCapabilityIds: G5A_U10A_P05F7_REQUIRED_CAPABILITY_IDS,
  patternSpecIds: G5A_U10A_P05F7_SPEC_IDS,
});

export const G5A_U10A_P05F7_PATTERN_GROUPS = Object.freeze([
  Object.freeze({
    patternGroupId: G5A_U10A_P05F7_GROUP_ID,
    sourceId: G5A_U10A_P05F7_SOURCE_ID,
    unitCode: G5A_U10A_P05F7_UNIT_CODE,
    unitTitle: G5A_U10A_P05F7_UNIT_TITLE,
    displayName: "柱體錐體與球分類圖形題",
    primaryKnowledgePointId: G5A_U10A_P05F7_KP_ID,
    knowledgePointIds: Object.freeze([G5A_U10A_P05F7_KP_ID]),
    supportClass: "A",
    mode: "diagram",
    publicQuestionMode: "diagram",
    representationTag: "solid_shape_classification_diagram",
    representationTags: Object.freeze(["geometry", "spatial_solid", "column", "cone", "sphere", "classification", "diagram_identification"]),
    patternSpecIds: G5A_U10A_P05F7_SPEC_IDS,
    allocationPolicy: "balanced_solid_shape_classification_relation",
    visibilityStatus: "visible",
    holdReason: null,
  }),
]);

export const G5A_U10A_P05F7_SELECTOR_ROWS = Object.freeze([
  Object.freeze({
    knowledgePointId: G5A_U10A_P05F7_KP_ID,
    sourceId: G5A_U10A_P05F7_SOURCE_ID,
    unitCode: G5A_U10A_P05F7_UNIT_CODE,
    unitTitle: G5A_U10A_P05F7_UNIT_TITLE,
    displayName: "柱體錐體與球分類",
    canonicalNameZh: "柱體錐體與球分類",
    mode: "diagram",
    questionMode: "diagram",
    questionModes: Object.freeze(["diagram"]),
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "DIAGRAM_ONLY_APPLICATION_COMPATIBLE_CONTEXT_NOT_ADMITTED",
    canonicalPatternGroupIds: Object.freeze([G5A_U10A_P05F7_GROUP_ID]),
    canonicalPatternSpecIds: G5A_U10A_P05F7_SPEC_IDS,
    patternGroupIds: Object.freeze([G5A_U10A_P05F7_GROUP_ID]),
    patternSpecIds: G5A_U10A_P05F7_SPEC_IDS,
    requiredCapabilityIds: G5A_U10A_P05F7_REQUIRED_CAPABILITY_IDS,
    qaStatusLabel: "P05F7_G5A_U10A_SOURCE_BACKED_SOLID_DIAGRAM",
    productionUse: "full_product_w5_slice007_candidate",
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG5AU10AP05F7SelectorRows() { return clone(G5A_U10A_P05F7_SELECTOR_ROWS); }
export function getG5AU10AP05F7SelectorRow(id) { return clone(id === G5A_U10A_P05F7_KP_ID ? G5A_U10A_P05F7_SELECTOR_ROWS[0] : null); }
export function listG5AU10AP05F7PatternGroups(id) { return clone(id === G5A_U10A_P05F7_KP_ID ? G5A_U10A_P05F7_PATTERN_GROUPS : []); }
export function resolveG5AU10AP05F7PatternSpecIds(id) { return clone(id === G5A_U10A_P05F7_KP_ID ? G5A_U10A_P05F7_SPEC_IDS : []); }
export function auditG5AU10AP05F7SelectorProjection() {
  const errors = [];
  if (G5A_U10A_P05F7_SELECTOR_ROWS.length !== 1 || G5A_U10A_P05F7_PATTERN_GROUPS.length !== 1 || G5A_U10A_P05F7_PATTERN_SPECS.length !== 3) errors.push("P05F7_CARDINALITY_INVALID");
  const relations = new Set(G5A_U10A_P05F7_PATTERN_SPECS.map((row) => row.relation));
  for (const relation of G5A_U10A_P05F7_FORMAL_MAPPING.includedRelations) if (!relations.has(relation)) errors.push(`P05F7_RELATION_MISSING:${relation}`);
  if (G5A_U10A_P05F7_PATTERN_SPECS.some((row) => row.questionMode !== "diagram" || row.requiresSolidGeometryRepresentation !== true || row.applicationAllowed !== false || row.solidElementsNamingOrCountAllowed !== false || row.solidNetCorrespondenceAllowed !== false || row.solidCrossSectionAllowed !== false || row.solidViewpointRepresentationAllowed !== false || row.cubeCuboidSpecialCaseReasoningAllowed !== false || row.solidMeasurementOrFormulaAllowed !== false)) errors.push("P05F7_PATTERN_INVARIANT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3, diagram: 3, application: 0 }) });
}
