import { OPERATORS } from "../../../modules/core/constants.js";

export const CONFIG_VALIDATION_MESSAGES = Object.freeze({
  firstOperandRangeInvalid: "第一個運算數的最小值不能大於最大值。",
  secondOperandRangeInvalid: "第二個運算數的最小值不能大於最大值。",
  operatorSelectionRequired: "至少要啟用一個運算符號。",
  divisionDivisorZeroOnly: "除法的第二個運算數不能只包含 0。",
  divisionSkipsZeroInfo: "除法會自動略過 0，不會把 0 當作除數。",
  subtractionNonNegativeWarning: "減法目前不允許負數答案，請提高第一個運算數範圍或降低第二個運算數範圍。",
  generationFeasibilityError: "目前的條件太嚴格，暫時無法產生足夠題目，請調整運算符號、數字範圍或題數。",
  divisionExactIntegerInfo: "除法只會產生整除題，且不會使用 0 當除數。"
});

function createIssue(level, code, path, message) {
  return { level, severity: level, code, path, message };
}

function getOperandRange(config, position) {
  return config?.expression?.operandRanges?.find((range) => range?.position === position) ?? null;
}

function getGlobalOperators(config) {
  return Array.isArray(config?.expression?.globalOperators) ? config.expression.globalOperators : [];
}

function hasOperator(config, operator) {
  return getGlobalOperators(config).includes(operator);
}

export function validateOperandRanges(config) {
  const issues = [];
  const firstRange = getOperandRange(config, 1);
  const secondRange = getOperandRange(config, 2);

  if (
    firstRange &&
    Number.isFinite(firstRange.min) &&
    Number.isFinite(firstRange.max) &&
    firstRange.min > firstRange.max
  ) {
    issues.push(
      createIssue(
        "error",
        "first_operand_range_invalid",
        "expression.operandRanges[position:1]",
        CONFIG_VALIDATION_MESSAGES.firstOperandRangeInvalid
      )
    );
  }

  if (
    secondRange &&
    Number.isFinite(secondRange.min) &&
    Number.isFinite(secondRange.max) &&
    secondRange.min > secondRange.max
  ) {
    issues.push(
      createIssue(
        "error",
        "second_operand_range_invalid",
        "expression.operandRanges[position:2]",
        CONFIG_VALIDATION_MESSAGES.secondOperandRangeInvalid
      )
    );
  }

  return issues;
}

export function validateOperatorSelection(config) {
  if (getGlobalOperators(config).length > 0) {
    return [];
  }

  return [
    createIssue(
      "error",
      "operator_selection_required",
      "expression.globalOperators",
      CONFIG_VALIDATION_MESSAGES.operatorSelectionRequired
    )
  ];
}

export function validateDivisionConfig(config) {
  if (!hasOperator(config, OPERATORS.DIVIDE)) {
    return [];
  }

  const issues = [];
  const secondRange = getOperandRange(config, 2);
  if (!secondRange || !Number.isFinite(secondRange.min) || !Number.isFinite(secondRange.max)) {
    return [
      createIssue(
        "info",
        "division_exact_integer_info",
        "expression.operandRanges[position:2]",
        CONFIG_VALIDATION_MESSAGES.divisionExactIntegerInfo
      )
    ];
  }

  if (secondRange.min === 0 && secondRange.max === 0) {
    issues.push(
      createIssue(
        "error",
        "division_divisor_zero_only",
        "expression.operandRanges[position:2]",
        CONFIG_VALIDATION_MESSAGES.divisionDivisorZeroOnly
      )
    );
    return issues;
  }

  if (secondRange.min <= 0 && secondRange.max >= 0) {
    issues.push(
      createIssue(
        "info",
        "division_skips_zero_info",
        "expression.operandRanges[position:2]",
        CONFIG_VALIDATION_MESSAGES.divisionSkipsZeroInfo
      )
    );
  }

  issues.push(
    createIssue(
      "info",
      "division_exact_integer_info",
      "division.mode",
      CONFIG_VALIDATION_MESSAGES.divisionExactIntegerInfo
    )
  );

  return issues;
}

export function validateSubtractionConfig(config) {
  if (!hasOperator(config, OPERATORS.SUBTRACT)) {
    return [];
  }

  if (config?.answerConstraint?.allowNegative === true) {
    return [];
  }

  const firstRange = getOperandRange(config, 1);
  const secondRange = getOperandRange(config, 2);
  if (
    !firstRange ||
    !secondRange ||
    !Number.isFinite(firstRange.max) ||
    !Number.isFinite(secondRange.min)
  ) {
    return [];
  }

  if (firstRange.max < secondRange.min) {
    return [
      createIssue(
        "warning",
        "subtraction_non_negative_warning",
        "answerConstraint.allowNegative",
        CONFIG_VALIDATION_MESSAGES.subtractionNonNegativeWarning
      )
    ];
  }

  return [];
}

export function validateBrowserConfig(config) {
  const issues = [
    ...validateOperandRanges(config),
    ...validateOperatorSelection(config),
    ...validateDivisionConfig(config),
    ...validateSubtractionConfig(config)
  ];

  return {
    ok: !issues.some((issue) => issue.level === "error"),
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
    infos: issues.filter((issue) => issue.level === "info"),
    issues
  };
}

export function translateGenerationFailure(errors = []) {
  const normalizedErrors = Array.isArray(errors) ? errors : [];
  const failureCodes = new Set(normalizedErrors.map((issue) => issue?.code));

  if (
    failureCodes.has("operand_candidate_pool_empty") ||
    failureCodes.has("division_candidate_pool_empty") ||
    failureCodes.has("pattern_generation_attempts_exhausted")
  ) {
    return createIssue(
      "error",
      "generation_feasibility_error",
      "generation",
      CONFIG_VALIDATION_MESSAGES.generationFeasibilityError
    );
  }

  return createIssue(
    "error",
    "generation_failed",
    "generation",
    CONFIG_VALIDATION_MESSAGES.generationFeasibilityError
  );
}
