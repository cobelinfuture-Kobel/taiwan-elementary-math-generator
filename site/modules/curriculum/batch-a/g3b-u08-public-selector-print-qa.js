import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../registry/g3b-u08-semantic-promotion.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../registry/batch-a-selector-extension.js";

export const G3B_U08_PUBLIC_SELECTOR_PRINT_QA = Object.freeze({
  task: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA",
  sourceId: "g3b_u08_3b08",
  status: "public_selector_and_print_controls_qa_contract",
  visibleKnowledgePointCount: 6,
  visiblePatternGroupCount: 6,
  promotedPatternSpecCount: 24,
  applicationOnly: true,
  horizontalOnly: true,
  publicNumericModeAllowed: false,
  representationToggleAllowed: false,
  publicHiddenModeFlagAllowed: false,
  classicSurfaceRequired: true,
  notFoundFallbackSurfaceRequired: true,
  pixelSurfaceRequired: true,
  publicControls: Object.freeze([
    "source",
    "selectionMode",
    "knowledgePoint",
    "questionCount",
    "ordering",
    "answerKey",
    "generate",
    "print"
  ]),
  stalePrintInvalidationRequired: true,
  internalIdentifierRedactionRequired: true,
  rendererProfileId: "g3b_u08_semantic_long_text_v1",
  questionLayout: "2x4",
  answerLayout: "1x8",
  requiredNextGate: "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout"
});

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

export function validateG3BU08PublicSelectorProjectionForPrintQA() {
  const errors = [];
  const visibleKnowledgePoints = G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS
    .map((knowledgePointId) => getVisibleBatchAKnowledgePoint(knowledgePointId));
  const groups = visibleKnowledgePoints.flatMap((knowledgePoint) => (
    knowledgePoint
      ? getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId)
      : []
  ));
  const groupIds = groups.map((group) => group.patternGroupId);
  const patternSpecIds = groups.flatMap((group) => group.patternSpecIds ?? []);

  if (visibleKnowledgePoints.some((knowledgePoint) => !knowledgePoint)) errors.push("visible_knowledge_point_missing");
  if (visibleKnowledgePoints.length !== 6) errors.push("visible_knowledge_point_count_mismatch");
  if (groups.length !== 6) errors.push("visible_pattern_group_count_mismatch");
  if (patternSpecIds.length !== 24) errors.push("promoted_pattern_spec_count_mismatch");
  if (duplicates(groupIds).length > 0) errors.push("duplicate_pattern_group_id");
  if (duplicates(patternSpecIds).length > 0) errors.push("duplicate_pattern_spec_membership");
  if (JSON.stringify(groupIds) !== JSON.stringify([...G3B_U08_PROMOTED_PATTERN_GROUP_IDS])) errors.push("pattern_group_projection_drift");
  if (JSON.stringify(patternSpecIds) !== JSON.stringify([...G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS])) errors.push("pattern_spec_projection_drift");
  if (visibleKnowledgePoints.some((knowledgePoint) => knowledgePoint.sourceId !== G3B_U08_PUBLIC_SELECTOR_PRINT_QA.sourceId)) errors.push("knowledge_point_source_mismatch");
  if (visibleKnowledgePoints.some((knowledgePoint) => knowledgePoint.patternGroupIds.length !== 1)) errors.push("representation_toggle_exposed");
  if (visibleKnowledgePoints.some((knowledgePoint) => knowledgePoint.representationTags.includes("numeric_expression"))) errors.push("public_numeric_mode_exposed");
  if (groups.some((group) => group.representationTag !== "application_word_problem")) errors.push("non_application_group_exposed");
  if (groups.some((group) => group.visibilityStatus !== "visible")) errors.push("pattern_group_not_visible");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: visibleKnowledgePoints.length,
      patternGroups: groups.length,
      patternSpecs: patternSpecIds.length
    })
  });
}
