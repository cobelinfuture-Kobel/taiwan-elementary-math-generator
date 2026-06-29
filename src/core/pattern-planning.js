import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  V1_BLOCKED_SUPPORT_STATUSES
} from "./constants.js";
import {
  isKnownAllocationMode,
  isPlainObject,
  isPositiveInteger
} from "./config-schema.js";

function createIssue(code, severity, path, message) {
  return { code, severity, path, message };
}

export function getEnabledPatterns(patternPool) {
  if (!patternPool || !Array.isArray(patternPool.patterns)) {
    return [];
  }
  return patternPool.patterns.filter((pattern) => pattern && pattern.enabled !== false);
}

export function isPatternV1Generatable(pattern) {
  if (!pattern || pattern.questionKind !== QUESTION_KINDS.EXPRESSION) {
    return false;
  }

  const statuses = Array.isArray(pattern.supportStatus) ? pattern.supportStatus : [];
  if (!statuses.includes(SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED)) {
    return false;
  }

  return !statuses.some((status) => V1_BLOCKED_SUPPORT_STATUSES.includes(status));
}

export function validatePatternPlan(config) {
  const errors = [];
  const warnings = [];
  const patternPlan = config?.patternPlan;
  const questionCount = config?.generation?.questionCount;

  if (!isPlainObject(patternPlan)) {
    errors.push(createIssue("pattern_plan_missing", "error", "patternPlan", "patternPlan is required."));
    return { ok: false, errors, warnings };
  }

  const { patternPool, allocation } = patternPlan;
  if (!isPlainObject(patternPool)) {
    errors.push(createIssue("pattern_pool_missing", "error", "patternPlan.patternPool", "patternPool is required."));
    return { ok: false, errors, warnings };
  }

  const patterns = Array.isArray(patternPool.patterns) ? patternPool.patterns : null;
  if (!patterns) {
    errors.push(createIssue("pattern_pool_patterns_invalid", "error", "patternPlan.patternPool.patterns", "patternPool.patterns must be an array."));
    return { ok: false, errors, warnings };
  }

  const ids = new Set();
  for (const [index, pattern] of patterns.entries()) {
    const path = `patternPlan.patternPool.patterns[${index}]`;
    if (!pattern || typeof pattern.patternId !== "string" || !pattern.patternId) {
      errors.push(createIssue("pattern_id_missing", "error", `${path}.patternId`, "Each pattern must have a non-empty patternId."));
      continue;
    }
    if (ids.has(pattern.patternId)) {
      errors.push(createIssue("pattern_id_duplicate", "error", `${path}.patternId`, `Duplicate patternId '${pattern.patternId}' is not allowed.`));
    }
    ids.add(pattern.patternId);
  }

  const enabledPatterns = getEnabledPatterns(patternPool);
  if (config.generationMode === GENERATION_MODES.SINGLE_PATTERN && enabledPatterns.length !== 1) {
    errors.push(createIssue("single_pattern_count_invalid", "error", "patternPlan.patternPool.patterns", "singlePattern mode requires exactly one enabled pattern."));
  }
  if (config.generationMode === GENERATION_MODES.MIXED_PATTERN && enabledPatterns.length < 2) {
    errors.push(createIssue("mixed_pattern_count_invalid", "error", "patternPlan.patternPool.patterns", "mixedPattern mode requires at least two enabled patterns."));
  }

  enabledPatterns.forEach((pattern, index) => {
    const path = `patternPlan.patternPool.patterns[enabled:${index}]`;
    if (!isPatternV1Generatable(pattern)) {
      errors.push(createIssue("pattern_not_v1_generatable", "error", path, `Pattern '${pattern.patternId}' is not allowed for V1 generation.`));
    }
  });

  if (!isPlainObject(allocation)) {
    errors.push(createIssue("pattern_allocation_missing", "error", "patternPlan.allocation", "pattern allocation is required."));
    return { ok: false, errors, warnings };
  }

  if (!isKnownAllocationMode(allocation.mode)) {
    errors.push(createIssue("pattern_allocation_mode_invalid", "error", "patternPlan.allocation.mode", "Pattern allocation mode is invalid."));
    return { ok: false, errors, warnings };
  }

  if (allocation.totalQuestionCount !== questionCount) {
    errors.push(createIssue("pattern_allocation_total_mismatch", "error", "patternPlan.allocation.totalQuestionCount", "Pattern allocation total must match generation.questionCount."));
  }

  if (allocation.mode === ALLOCATION_MODES.FIXED_COUNTS) {
    const fixedCounts = Array.isArray(allocation.fixedCounts) ? allocation.fixedCounts : [];
    const total = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0);
    if (total !== questionCount) {
      errors.push(createIssue("pattern_fixed_counts_sum_invalid", "error", "patternPlan.allocation.fixedCounts", "fixedCounts must sum to generation.questionCount."));
    }
  }

  if (allocation.mode === ALLOCATION_MODES.EQUAL_DISTRIBUTION) {
    if (!isPositiveInteger(questionCount) || enabledPatterns.length < 1) {
      errors.push(createIssue("pattern_equal_distribution_invalid", "error", "patternPlan.allocation", "equalDistribution requires a positive question count and at least one enabled pattern."));
    }
  }

  if (allocation.mode === ALLOCATION_MODES.WEIGHTED_DISTRIBUTION) {
    warnings.push(createIssue("pattern_weighted_distribution_scaffold_only", "warning", "patternPlan.allocation.mode", "weightedDistribution is scaffold-only in S3 and is not allocated yet."));
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function allocatePatternCounts(config) {
  const validation = validatePatternPlan(config);
  if (!validation.ok) {
    return {
      ok: false,
      allocations: [],
      warnings: validation.warnings,
      errors: validation.errors
    };
  }

  const { patternPool, allocation } = config.patternPlan;
  const enabledPatterns = getEnabledPatterns(patternPool);

  if (allocation.mode === ALLOCATION_MODES.FIXED_COUNTS) {
    return {
      ok: true,
      allocations: allocation.fixedCounts.map((item) => ({
        patternId: item.patternId,
        questionCount: item.questionCount
      })),
      warnings: validation.warnings,
      errors: []
    };
  }

  if (allocation.mode === ALLOCATION_MODES.EQUAL_DISTRIBUTION) {
    const base = Math.floor(config.generation.questionCount / enabledPatterns.length);
    const remainder = config.generation.questionCount % enabledPatterns.length;
    const allocations = enabledPatterns.map((pattern, index) => ({
      patternId: pattern.patternId,
      questionCount: base + (index < remainder ? 1 : 0)
    }));
    return {
      ok: true,
      allocations,
      warnings: validation.warnings,
      errors: []
    };
  }

  return {
    ok: false,
    allocations: [],
    warnings: validation.warnings,
    errors: [
      createIssue(
        "pattern_weighted_distribution_not_implemented",
        "error",
        "patternPlan.allocation.mode",
        "weightedDistribution planning is not implemented in S3."
      )
    ]
  };
}
