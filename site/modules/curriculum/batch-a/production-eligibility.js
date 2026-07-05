import { isBatchASourceId } from "./source-units.js";

const CONTEXT_ESTIMATE_BRIDGE_SOURCE_ID = "g3a_u02_3a02_context_estimate_runtime";

export const BATCH_A_BROWSER_SCOPE = Object.freeze({
  batchId: "batch_a",
  artifactType: "browser_worksheet_html_preview_with_answer_key",
  limit: "Batch A worksheet output only"
});

export function createBatchAIssue(code, path, message) {
  return { code, severity: "error", path, message };
}

export function validateBatchASourceEligibility(sourceId) {
  if (!isBatchASourceId(sourceId) && sourceId !== CONTEXT_ESTIMATE_BRIDGE_SOURCE_ID) {
    return {
      ok: false,
      errors: [createBatchAIssue("batch_a_source_not_available", "sourceId", `Source '${sourceId}' is not available in Batch A browser worksheet scope.`)],
      warnings: []
    };
  }

  return { ok: true, errors: [], warnings: [] };
}

export function validateBatchAPlanScope(plan = {}) {
  const source = validateBatchASourceEligibility(plan.sourceId);
  const errors = [...source.errors];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 200) {
    errors.push(createBatchAIssue("batch_a_question_count_invalid", "questionCount", "questionCount must be an integer from 1 to 200."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
