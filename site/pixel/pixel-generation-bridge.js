import { buildWorksheetDocumentFromState } from "../assets/browser/pipeline/build-worksheet-document.js";
import { BATCH_A_SELECTION_MODES } from "../assets/browser/state/config-state.js";
import { getPixelWorksheetPlan } from "./pixel-worksheet-state.js";

export const PIXEL_GENERATION_ERROR_CODES = Object.freeze({
  MISSING_SOURCE_ID: "pixel_generation_missing_source_id",
  INVALID_QUESTION_COUNT: "pixel_generation_invalid_question_count",
  SINGLE_KP_SELECTION_INVALID: "pixel_generation_single_kp_selection_invalid",
  MIXED_KP_SELECTION_INVALID: "pixel_generation_mixed_kp_selection_invalid"
});

function issue(code, message, details = {}) {
  return Object.freeze({ code, message, ...details });
}

function validatePixelWorksheetPlan(plan = {}) {
  const errors = [];

  if (!String(plan.sourceId ?? "").trim()) {
    errors.push(issue(
      PIXEL_GENERATION_ERROR_CODES.MISSING_SOURCE_ID,
      "Pixel worksheet generation requires a Batch A sourceId."
    ));
  }

  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 200) {
    errors.push(issue(
      PIXEL_GENERATION_ERROR_CODES.INVALID_QUESTION_COUNT,
      "Pixel worksheet questionCount must be an integer from 1 to 200.",
      { actual: plan.questionCount }
    ));
  }

  const knowledgePointIds = Array.isArray(plan.selectedKnowledgePointIds) ? plan.selectedKnowledgePointIds : [];
  const patternGroupIds = Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : [];

  if (plan.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
    && (knowledgePointIds.length !== 1 || patternGroupIds.length < 1)) {
    errors.push(issue(
      PIXEL_GENERATION_ERROR_CODES.SINGLE_KP_SELECTION_INVALID,
      "Single-KnowledgePoint generation requires exactly one visible KnowledgePoint and at least one visible PatternGroup.",
      { knowledgePointCount: knowledgePointIds.length, patternGroupCount: patternGroupIds.length }
    ));
  }

  if (plan.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
    && (knowledgePointIds.length < 2 || patternGroupIds.length < 2)) {
    errors.push(issue(
      PIXEL_GENERATION_ERROR_CODES.MIXED_KP_SELECTION_INVALID,
      "Same-unit mixed generation requires at least two visible KnowledgePoints and PatternGroups.",
      { knowledgePointCount: knowledgePointIds.length, patternGroupCount: patternGroupIds.length }
    ));
  }

  return Object.freeze(errors);
}

export function resolvePixelWorksheetGenerationRequest(state) {
  const plan = getPixelWorksheetPlan(state);
  const errors = validatePixelWorksheetPlan(plan);
  return Object.freeze({
    ok: errors.length === 0,
    plan,
    errors
  });
}

export function buildPixelWorksheetDocument(state) {
  const request = resolvePixelWorksheetGenerationRequest(state);
  if (!request.ok) {
    return Object.freeze({
      ok: false,
      stage: "preflight",
      plan: request.plan,
      worksheetDocument: null,
      validation: { ok: false, errors: request.errors, warnings: [] },
      errors: request.errors,
      warnings: []
    });
  }

  const result = buildWorksheetDocumentFromState(state);
  return Object.freeze({
    ...result,
    stage: result.ok ? "complete" : "build",
    plan: request.plan
  });
}
