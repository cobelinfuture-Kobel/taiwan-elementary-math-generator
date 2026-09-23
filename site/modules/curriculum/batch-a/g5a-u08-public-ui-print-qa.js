import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PUBLIC_CONTROLS,
} from "../registry/g5a-u08-promotion.js";
import { G5A_U08_RENDERER_PROFILES } from "../registry/g5a-u08-worksheet-promotion.js";

export const G5A_U08_PUBLIC_UI_PRINT_QA = Object.freeze({
  task: "S60K_G5A_U08_PublicUIPrintAndQueryStateQA",
  status: "public_ui_print_query_state_qa_integrated",
  sourceId: "g5a_u08_5a08",
  surfaces: Object.freeze(["classic", "fallback404", "pixel"]),
  visibleKnowledgePointCount: G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
  visiblePatternGroupCount: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length,
  promotedPatternSpecCount: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
  questionModes: Object.freeze([...G5A_U08_PUBLIC_CONTROLS.questionModes]),
  depthModes: Object.freeze([...G5A_U08_PUBLIC_CONTROLS.depthModes]),
  contextModes: Object.freeze([...G5A_U08_PUBLIC_CONTROLS.contextModes]),
  queryStateFields: Object.freeze([
    "sourceId",
    "selectionMode",
    "kp",
    "pg",
    "questionMode",
    "depthMode",
    "contextMode",
    "questionCount",
    "ordering",
    "answerKey",
    "generationSeed",
    "columns",
    "rowsPerPage",
  ]),
  rendererProfileIds: Object.freeze([
    G5A_U08_RENDERER_PROFILES.numeric.profileId,
    G5A_U08_RENDERER_PROFILES.mixedLongText.profileId,
  ]),
  stalePreviewInvalidationRequired: true,
  stalePrintInvalidationRequired: true,
  traditionalChinesePublicMessagesRequired: true,
  internalIdsVisible: false,
  publicNPlus2: false,
  publicFormalEquation: false,
  productionUse: "preview_only_pending_s60l",
  requiredNextGate: "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout",
});

export function validateG5AU08PublicUIPrintQAContract() {
  const errors = [];
  if (G5A_U08_PUBLIC_UI_PRINT_QA.surfaces.length !== 3) errors.push("surface_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.visibleKnowledgePointCount !== 11) errors.push("knowledge_point_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.visiblePatternGroupCount !== 17) errors.push("pattern_group_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.promotedPatternSpecCount !== 30) errors.push("pattern_spec_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.questionModes.length !== 4) errors.push("question_mode_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.depthModes.length !== 3) errors.push("depth_mode_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.contextModes.length !== 3) errors.push("context_mode_count_mismatch");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.publicNPlus2) errors.push("n_plus_2_leaked");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.publicFormalEquation) errors.push("formal_equation_leaked");
  if (G5A_U08_PUBLIC_UI_PRINT_QA.productionUse !== "preview_only_pending_s60l") errors.push("production_scope_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      surfaces: 3,
      knowledgePoints: 11,
      patternGroups: 17,
      patternSpecs: 30,
      questionModes: 4,
      depthModes: 3,
      contextModes: 3,
    }),
  });
}
