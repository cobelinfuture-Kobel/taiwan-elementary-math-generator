import {
  G5A_U08_BLOCKING_CODES,
  G5A_U08_WARNING_CODES,
  validateG5AU08ApplicationBatch as validateCoreBatch,
  validateG5AU08ApplicationQuestion,
} from "./g5a-u08-application-validator-core.js";

function issue(code, path, message, stage = "production_gate") {
  return Object.freeze({ code, severity: "error", path, message, stage });
}

function countBy(questions, selector) {
  const counts = {};
  for (const question of questions) {
    const key = selector(question);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function sameCounts(actual, declared, requiredKeys = []) {
  const keys = new Set([...Object.keys(actual ?? {}), ...Object.keys(declared ?? {}), ...requiredKeys]);
  return [...keys].every((key) => (actual?.[key] ?? 0) === (declared?.[key] ?? 0));
}

function cellKey(question) {
  return `${question.patternSpecId}|${question.depth}|${question.context.contextType}`;
}

export { G5A_U08_BLOCKING_CODES, G5A_U08_WARNING_CODES, validateG5AU08ApplicationQuestion };

export function validateG5AU08ApplicationBatch(batch) {
  const base = validateCoreBatch(batch);
  if (!base.valid) return base;

  const questions = Array.isArray(batch?.questions) ? batch.questions : [];
  const errors = [];
  const actualSpec = countBy(questions, (row) => row.patternSpecId);
  const actualDepth = countBy(questions, (row) => row.depth);
  const actualContext = countBy(questions, (row) => row.context.contextType);
  const actualCells = countBy(questions, cellKey);
  const actualSdgGoals = [...new Set(
    questions
      .filter((row) => row.context.contextType === "sdg")
      .map((row) => row.context.sdgGoalId)
      .filter(Boolean),
  )].sort();
  const declaredSdgGoals = [...(batch?.coveredSdgGoalIds ?? [])].sort();

  if (batch?.allocationPolicy !== "pattern_spec_x_depth_x_context_with_feasible_coverage_seeding") {
    errors.push(issue(
      "G5A_U08_PATTERN_SPEC_MISMATCH",
      "batch.allocationPolicy",
      "批次未使用 PatternSpec × depth × contextType 配置政策。",
    ));
  }
  if (!sameCounts(actualSpec, batch?.specAllocation, batch?.selectedPatternSpecIds ?? [])) {
    errors.push(issue(
      "G5A_U08_PATTERN_SPEC_MISMATCH",
      "batch.specAllocation",
      "PatternSpec 配置未完整對應實際題目。",
    ));
  }
  if (!sameCounts(actualDepth, batch?.depthAllocation, ["N", "N_PLUS_1"])) {
    errors.push(issue(
      "G5A_U08_DEPTH_NOT_ALLOWED",
      "batch.depthAllocation",
      "深度配置未完整對應實際題目。",
    ));
  }
  if (!sameCounts(actualContext, batch?.contextAllocation, ["daily_life", "sdg"])) {
    errors.push(issue(
      "G5A_U08_ROLE_BINDING_INVALID",
      "batch.contextAllocation",
      "情境配置未完整對應實際題目。",
    ));
  }
  if (!sameCounts(actualCells, batch?.cellAllocation)) {
    errors.push(issue(
      "G5A_U08_PATTERN_SPEC_MISMATCH",
      "batch.cellAllocation",
      "PatternSpec × depth × contextType 配置與實際題目不一致。",
    ));
  }
  if (JSON.stringify(actualSdgGoals) !== JSON.stringify(declaredSdgGoals)) {
    errors.push(issue(
      "G5A_U08_SDG_LABEL_ONLY_CONTEXT",
      "batch.coveredSdgGoalIds",
      "SDG coverage 摘要與實際題目不一致。",
    ));
  }

  const valid = errors.length === 0;
  return Object.freeze({
    valid,
    errors: Object.freeze(errors),
    warnings: base.warnings,
    output: valid ? batch : null,
    acceptedQuestions: valid ? questions : Object.freeze([]),
  });
}
