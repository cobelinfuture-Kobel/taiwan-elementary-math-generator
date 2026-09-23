import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  G4B_U04_EFFECTIVE_AUTHORITY_COUNTS,
  G4B_U04_RENDERER_PROFILES,
  G4B_U04_WORKSHEET_LIFECYCLE,
} from "../registry/g4b-u04-worksheet-promotion.js";

export const G4B_U04_PUBLIC_UI_PRINT_QA = Object.freeze({
  task: "S74_G4B_U04_PublicUIPrintAndQueryStateQA",
  status: "public_ui_print_query_state_qa_integrated",
  authorityLayer: "s73_base_plus_r2c_effective_overlay",
  sourceId: G4B_U04_SOURCE_ID,
  surfaces: Object.freeze(["classic", "fallback404", "pixel"]),
  visibleKnowledgePointCount: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  visiblePatternGroupCount: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
  promotedPatternSpecCount: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
  questionModes: Object.freeze([...G4B_U04_PUBLIC_CONTROLS.questionModes]),
  queryStateFields: Object.freeze([
    "sourceId",
    "selectionMode",
    "kp",
    "pg",
    "questionMode",
    "questionCount",
    "ordering",
    "answerKey",
    "generationSeed",
    "columns",
    "rowsPerPage",
  ]),
  rendererProfileIds: Object.freeze([
    G4B_U04_RENDERER_PROFILES.compact.profileId,
    G4B_U04_RENDERER_PROFILES.contextual.profileId,
    G4B_U04_RENDERER_PROFILES.inverseLong.profileId,
  ]),
  classicControlMount: "dynamic_shared_surface_mount",
  fallback404ControlMount: "dynamic_shared_surface_mount",
  pixelControlMount: "dynamic_pixel_surface_mount",
  stalePreviewInvalidationRequired: true,
  stalePrintInvalidationRequired: true,
  answerKeySuppressionRequired: true,
  querySanitizationRequired: true,
  traditionalChinesePublicMessagesRequired: true,
  internalIdsVisible: false,
  publicPatternSpecInjection: false,
  genericFallback: false,
  htmlPdfSmokeImplemented: false,
  productionUse: G4B_U04_WORKSHEET_LIFECYCLE.productionUse,
  requiredNextGate: "S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout",
});

export function validateG4BU04PublicUIPrintQAContract() {
  const errors = [];
  if (G4B_U04_PUBLIC_UI_PRINT_QA.surfaces.length !== 3) errors.push("surface_count_mismatch");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.visibleKnowledgePointCount !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.knowledgePoints) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.visiblePatternGroupCount !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternGroups) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.promotedPatternSpecCount !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternSpecs) errors.push("pattern_spec_count_mismatch");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.questionModes.length !== 6) errors.push("question_mode_count_mismatch");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.rendererProfileIds.length !== 3) errors.push("renderer_profile_count_mismatch");
  if (!G4B_U04_PUBLIC_UI_PRINT_QA.stalePreviewInvalidationRequired) errors.push("stale_preview_not_required");
  if (!G4B_U04_PUBLIC_UI_PRINT_QA.stalePrintInvalidationRequired) errors.push("stale_print_not_required");
  if (!G4B_U04_PUBLIC_UI_PRINT_QA.answerKeySuppressionRequired) errors.push("answer_suppression_not_required");
  if (!G4B_U04_PUBLIC_UI_PRINT_QA.querySanitizationRequired) errors.push("query_sanitization_not_required");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.internalIdsVisible) errors.push("internal_id_leaked");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.publicPatternSpecInjection) errors.push("pattern_spec_injection_leaked");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.genericFallback) errors.push("generic_fallback_leaked");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.htmlPdfSmokeImplemented) errors.push("html_pdf_smoke_scope_leaked");
  if (G4B_U04_PUBLIC_UI_PRINT_QA.productionUse !== "preview_only_pending_s75") errors.push("production_scope_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      surfaces: G4B_U04_PUBLIC_UI_PRINT_QA.surfaces.length,
      knowledgePoints: G4B_U04_PUBLIC_UI_PRINT_QA.visibleKnowledgePointCount,
      patternGroups: G4B_U04_PUBLIC_UI_PRINT_QA.visiblePatternGroupCount,
      patternSpecs: G4B_U04_PUBLIC_UI_PRINT_QA.promotedPatternSpecCount,
      questionModes: G4B_U04_PUBLIC_UI_PRINT_QA.questionModes.length,
      rendererProfiles: G4B_U04_PUBLIC_UI_PRINT_QA.rendererProfileIds.length,
    }),
  });
}
