import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-extension.js";
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from "../registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE,
  G4B_U01_PRODUCTION_PROMOTION_ACTIVATION,
  G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE,
} from "../registry/g4b-u01-horizontal-production-promotion.js";

export const G4B_U01_PUBLIC_SELECTOR_PRINT_QA = Object.freeze({
  task: "S59I_G4B_U01_PublicUIAndPrintControlsQA",
  sourceId: "g4b_u01_4b01",
  status: "public_selector_and_print_controls_qa",
  surfaces: Object.freeze(["classic", "fallback404", "pixel"]),
  visibleKnowledgePointCount: 9,
  visiblePatternGroupCount: 9,
  promotedPatternSpecCount: 12,
  publicApplicationGroupCount: 0,
  horizontalOnly: true,
  representationToggleAllowed: false,
  verticalRepresentationAllowed: false,
  publicHiddenModeFlagAllowed: false,
  queryStateRoundTripRequired: true,
  stalePreviewInvalidationRequired: true,
  stalePrintInvalidationRequired: true,
  answerKeyToggleRequired: true,
  groupedOrderingRequired: true,
  shuffledOrderingRequired: true,
  publicErrorLocalizationRequired: true,
  internalIdRedactionRequired: true,
  publicQuestionCountMin: 1,
  publicQuestionCountMax: 200,
  rendererProfileId: G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.profileId,
  requiredNextGate: "S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout",
});

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateG4BU01PublicSelectorPrintQAContract() {
  const errors = [];
  const publicRows = listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === G4B_U01_PUBLIC_SELECTOR_PRINT_QA.sourceId);
  const kpIds = publicRows.map((row) => row.knowledgePointId);
  const groups = publicRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const groupIds = groups.map((row) => row.patternGroupId);
  const patternSpecIds = groups.flatMap((row) => row.patternSpecIds ?? []);

  if (publicRows.length !== G4B_U01_PUBLIC_SELECTOR_PRINT_QA.visibleKnowledgePointCount) {
    errors.push("visible_knowledge_point_count_mismatch");
  }
  if (groups.length !== G4B_U01_PUBLIC_SELECTOR_PRINT_QA.visiblePatternGroupCount) {
    errors.push("visible_pattern_group_count_mismatch");
  }
  if (patternSpecIds.length !== G4B_U01_PUBLIC_SELECTOR_PRINT_QA.promotedPatternSpecCount) {
    errors.push("promoted_pattern_spec_count_mismatch");
  }
  if (duplicateValues(kpIds).length > 0) errors.push("duplicate_knowledge_point_id");
  if (duplicateValues(groupIds).length > 0) errors.push("duplicate_pattern_group_id");
  if (duplicateValues(patternSpecIds).length > 0) errors.push("duplicate_pattern_spec_membership");
  if (!sameMembers(kpIds, G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("knowledge_point_promotion_drift");
  if (!sameMembers(groupIds, G4B_U01_PROMOTED_PATTERN_GROUP_IDS)) errors.push("pattern_group_promotion_drift");
  if (!sameMembers(patternSpecIds, G4B_U01_PROMOTED_PATTERN_SPEC_IDS)) errors.push("pattern_spec_promotion_drift");

  for (const row of publicRows) {
    const live = getVisibleBatchAKnowledgePoint(row.knowledgePointId);
    if (!live || live.sourceId !== G4B_U01_PUBLIC_SELECTOR_PRINT_QA.sourceId) {
      errors.push("knowledge_point_lookup_mismatch");
      continue;
    }
    if (live.patternGroupIds.length !== 1) errors.push("representation_toggle_or_multi_group_exposed");
    if (live.representationTags.includes("word_problem")) errors.push("application_representation_exposed");
    if (!live.representationTags.includes("horizontal_expression")) errors.push("horizontal_representation_missing");
  }
  for (const group of groups) {
    if (group.visibilityStatus !== "visible") errors.push("group_not_visible");
    if (group.representationTag !== "numeric_expression") errors.push("non_numeric_group_exposed");
    if (group.representationTags?.includes("word_problem")) errors.push("application_group_exposed");
    if (!group.representationTags?.includes("horizontal_expression")) errors.push("horizontal_group_tag_missing");
  }

  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_lifecycle_not_visible");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus !== "production_eligible") errors.push("worksheet_not_eligible");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_use_not_allowed");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.publicPrintControlBehaviorChanged !== false) errors.push("print_control_behavior_changed_before_qa");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.applicationModeAdded !== false) errors.push("application_mode_added");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.verticalRepresentationAdded !== false) errors.push("vertical_representation_added");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.representationToggleAdded !== false) errors.push("representation_toggle_added");
  if (G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.questionSheet.columns !== 3) errors.push("question_column_profile_mismatch");
  if (G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.questionSheet.rowsPerPage !== 8) errors.push("question_row_profile_mismatch");
  if (G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.answerKey.columns !== 3) errors.push("answer_column_profile_mismatch");
  if (G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.answerKey.rowsPerPage !== 10) errors.push("answer_row_profile_mismatch");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      visibleKnowledgePoints: kpIds.length,
      visiblePatternGroups: groupIds.length,
      promotedPatternSpecs: patternSpecIds.length,
      publicApplicationGroups: groups.filter((row) => row.representationTags?.includes("word_problem")).length,
    }),
  });
}
