import {
  OPERATOR_VALUES,
  PAPER_SIZES,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  V1_ACTIVE_NUMBER_DOMAINS,
  V1_ACTIVE_QUESTION_KINDS,
  V1_BLOCKED_SUPPORT_STATUSES
} from "./constants.js";
import {
  isKnownDigitConstraintTarget,
  isKnownGenerationMode,
  isKnownPaperSize,
  isKnownQuestionKind,
  isPlainObject,
  isPositiveInteger
} from "./config-schema.js";
import { isSupportedOperator } from "./operators.js";
import { validatePatternPlan } from "./pattern-planning.js";

function issue(code, severity, path, message) {
  return { code, severity, path, message };
}

function pushArrayFieldTypeIssues(errors, obj, key, basePath) {
  if (obj[key] !== undefined && !Array.isArray(obj[key])) {
    errors.push(issue("metadata_array_invalid", "error", `${basePath}.${key}`, `${key} must be an array when present.`));
  }
}

export function validateConfig(config) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(config)) {
    return {
      ok: false,
      errors: [issue("config_invalid", "error", "", "Config must be a plain object.")],
      warnings
    };
  }

  const requiredRootFields = ["numberDomain", "questionKind", "generationMode", "expression", "generation", "patternPlan", "printLayout"];
  for (const field of requiredRootFields) {
    if (config[field] === undefined) {
      errors.push(issue("required_root_field_missing", "error", field, `Required root field '${field}' is missing.`));
    }
  }

  if (!isPlainObject(config.numberDomain) || typeof config.numberDomain.kind !== "string") {
    errors.push(issue("number_domain_invalid", "error", "numberDomain.kind", "numberDomain.kind is required."));
  } else if (!V1_ACTIVE_NUMBER_DOMAINS.includes(config.numberDomain.kind)) {
    errors.push(issue("number_domain_not_supported_in_v1", "error", "numberDomain.kind", `Active number domain '${config.numberDomain.kind}' is not supported in V1.`));
  }

  if (!isKnownQuestionKind(config.questionKind)) {
    errors.push(issue("question_kind_invalid", "error", "questionKind", "questionKind is invalid."));
  } else if (!V1_ACTIVE_QUESTION_KINDS.includes(config.questionKind)) {
    errors.push(issue("question_kind_not_supported_in_v1", "error", "questionKind", `Question kind '${config.questionKind}' is not supported in V1.`));
  }

  if (!isKnownGenerationMode(config.generationMode)) {
    errors.push(issue("generation_mode_invalid", "error", "generationMode", "generationMode is invalid."));
  }

  if (!isPlainObject(config.generation) || !isPositiveInteger(config.generation.questionCount)) {
    errors.push(issue("generation_question_count_invalid", "error", "generation.questionCount", "generation.questionCount must be a positive integer."));
  }

  if (!isPlainObject(config.expression)) {
    errors.push(issue("expression_invalid", "error", "expression", "expression is required."));
  } else {
    if (!Number.isInteger(config.expression.operandCount) || config.expression.operandCount < 2 || config.expression.operandCount > 4) {
      errors.push(issue("operand_count_invalid", "error", "expression.operandCount", "operandCount must be an integer between 2 and 4."));
    }

    const globalOperators = Array.isArray(config.expression.globalOperators) ? config.expression.globalOperators : [];
    if (globalOperators.length < 1) {
      errors.push(issue("global_operators_missing", "error", "expression.globalOperators", "At least one global operator is required."));
    }

    globalOperators.forEach((operator, index) => {
      if (!OPERATOR_VALUES.includes(operator) && !isSupportedOperator(operator)) {
        errors.push(issue("operator_invalid", "error", `expression.globalOperators[${index}]`, `Operator '${operator}' is not supported.`));
      }
    });

    const slots = Array.isArray(config.expression.operatorSlots) ? config.expression.operatorSlots : [];
    slots.forEach((slot, slotIndex) => {
      const allowedOperators = Array.isArray(slot?.allowedOperators) ? slot.allowedOperators : [];
      allowedOperators.forEach((operator, index) => {
        if (!OPERATOR_VALUES.includes(operator) && !isSupportedOperator(operator)) {
          errors.push(issue("slot_operator_invalid", "error", `expression.operatorSlots[${slotIndex}].allowedOperators[${index}]`, `Operator '${operator}' is not supported.`));
        } else if (!globalOperators.includes(operator)) {
          errors.push(issue("slot_operator_not_in_global", "error", `expression.operatorSlots[${slotIndex}].allowedOperators[${index}]`, `Operator '${operator}' must also be enabled globally.`));
        }
      });
    });

    const digitConstraints = Array.isArray(config.expression.digitConstraints) ? config.expression.digitConstraints : [];
    digitConstraints.forEach((constraint, index) => {
      const path = `expression.digitConstraints[${index}]`;
      if (!constraint || !isKnownDigitConstraintTarget(constraint.target)) {
        errors.push(issue("digit_constraint_target_invalid", "error", `${path}.target`, "Digit constraint target is invalid."));
      }
      if (!isPositiveInteger(constraint.minDigits) || !isPositiveInteger(constraint.maxDigits)) {
        errors.push(issue("digit_constraint_digits_invalid", "error", path, "Digit constraint minDigits and maxDigits must be positive integers."));
      } else if (constraint.minDigits > constraint.maxDigits) {
        errors.push(issue("digit_constraint_range_invalid", "error", path, "Digit constraint minDigits must be less than or equal to maxDigits."));
      }
    });
  }

  const activePatterns = config?.patternPlan?.patternPool?.patterns ?? [];
  activePatterns.forEach((pattern, patternIndex) => {
    const path = `patternPlan.patternPool.patterns[${patternIndex}]`;
    const statuses = Array.isArray(pattern?.supportStatus) ? pattern.supportStatus : [];
    if (pattern?.enabled !== false && statuses.some((status) => V1_BLOCKED_SUPPORT_STATUSES.includes(status))) {
      errors.push(issue("pattern_support_status_blocked", "error", `${path}.supportStatus`, `Pattern '${pattern.patternId}' contains support statuses blocked in V1.`));
    }
    if (pattern?.enabled !== false && pattern?.questionKind !== QUESTION_KINDS.EXPRESSION) {
      errors.push(issue("pattern_question_kind_blocked", "error", `${path}.questionKind`, `Pattern '${pattern.patternId}' is not an expression pattern and cannot be active in V1.`));
    }

    const tagFields = ["skillTags", "patternTags", "difficultyTags", "curriculumNodeIds", "canonicalSkillIds"];
    tagFields.forEach((key) => {
      if (pattern?.[key] !== undefined && !Array.isArray(pattern[key])) {
        errors.push(issue("pattern_metadata_array_invalid", "error", `${path}.${key}`, `${key} must be an array when present.`));
      }
    });

    const divisionPattern = pattern?.expressionTemplate?.divisionPattern;
    const operandCount = pattern?.expressionTemplate?.operandCount;
    const allowedOperatorsBySlot = pattern?.expressionTemplate?.allowedOperatorsBySlot;
    if (pattern?.expressionTemplate) {
      if (!Number.isInteger(operandCount) || operandCount < 2 || operandCount > 4) {
        errors.push(issue("pattern_operand_count_invalid", "error", `${path}.expressionTemplate.operandCount`, "Pattern expressionTemplate.operandCount must be an integer between 2 and 4."));
      }
      if (!Array.isArray(allowedOperatorsBySlot) || allowedOperatorsBySlot.length !== operandCount - 1) {
        errors.push(issue("pattern_allowed_operators_slots_invalid", "error", `${path}.expressionTemplate.allowedOperatorsBySlot`, "allowedOperatorsBySlot must contain one operator list per active slot."));
      } else {
        allowedOperatorsBySlot.forEach((slotOperators, slotIndex) => {
          if (!Array.isArray(slotOperators) || slotOperators.length < 1) {
            errors.push(issue("pattern_slot_operator_list_invalid", "error", `${path}.expressionTemplate.allowedOperatorsBySlot[${slotIndex}]`, "Each pattern operator slot must provide at least one operator."));
            return;
          }
          slotOperators.forEach((operator, index) => {
            if (!OPERATOR_VALUES.includes(operator) && !isSupportedOperator(operator)) {
              errors.push(issue("pattern_slot_operator_invalid", "error", `${path}.expressionTemplate.allowedOperatorsBySlot[${slotIndex}][${index}]`, `Pattern operator '${operator}' is not supported.`));
            }
          });
        });
      }
    }
    if (divisionPattern) {
      if (divisionPattern.exactOnly !== true) {
        errors.push(issue("division_pattern_exact_only_required", "error", `${path}.expressionTemplate.divisionPattern.exactOnly`, "V1 division patterns must set exactOnly to true."));
      }
      if (divisionPattern.allowRemainderFuture === true) {
        errors.push(issue("division_pattern_remainder_not_supported", "error", `${path}.expressionTemplate.divisionPattern.allowRemainderFuture`, "Remainder division is not supported in V1 runtime generation."));
      }
      if (divisionPattern.longDivisionFormatFuture === true) {
        errors.push(issue("division_pattern_long_division_not_supported", "error", `${path}.expressionTemplate.divisionPattern.longDivisionFormatFuture`, "Long-division layout is not supported in V1 runtime generation."));
      }
    }
  });

  if (isPlainObject(config.metadata)) {
    pushArrayFieldTypeIssues(errors, config.metadata, "skillTags", "metadata");
    pushArrayFieldTypeIssues(errors, config.metadata, "patternTags", "metadata");
    pushArrayFieldTypeIssues(errors, config.metadata, "difficultyTags", "metadata");
    pushArrayFieldTypeIssues(errors, config.metadata, "curriculumNodeIds", "metadata");
    pushArrayFieldTypeIssues(errors, config.metadata, "canonicalSkillIds", "metadata");
  } else if (config.metadata !== undefined) {
    errors.push(issue("metadata_invalid", "error", "metadata", "metadata must be an object when present."));
  }

  if (!isPlainObject(config.printLayout)) {
    errors.push(issue("print_layout_invalid", "error", "printLayout", "printLayout is required."));
  } else {
    if (!isKnownPaperSize(config.printLayout.paperSize) || config.printLayout.paperSize !== PAPER_SIZES.A4) {
      errors.push(issue("print_layout_paper_size_invalid", "error", "printLayout.paperSize", "paperSize must be A4."));
    }
    if (!isPositiveInteger(config.printLayout.columns)) {
      errors.push(issue("print_layout_columns_invalid", "error", "printLayout.columns", "columns must be a positive integer."));
    }
    if (!isPositiveInteger(config.printLayout.rowsPerPage)) {
      errors.push(issue("print_layout_rows_invalid", "error", "printLayout.rowsPerPage", "rowsPerPage must be a positive integer."));
    }
    if (typeof config.printLayout.showQuestionNumbers !== "boolean") {
      errors.push(issue("print_layout_show_question_numbers_invalid", "error", "printLayout.showQuestionNumbers", "showQuestionNumbers must be a boolean."));
    }
    if (typeof config.printLayout.showAnswerKeyPage !== "boolean") {
      errors.push(issue("print_layout_show_answer_key_invalid", "error", "printLayout.showAnswerKeyPage", "showAnswerKeyPage must be a boolean."));
    }
    if ("questionCount" in config.printLayout) {
      warnings.push(issue("print_layout_question_count_ignored", "warning", "printLayout.questionCount", "printLayout.questionCount is ignored; generation.questionCount is the single source of truth."));
    }
  }

  const patternValidation = validatePatternPlan(config);
  errors.push(...patternValidation.errors);
  warnings.push(...patternValidation.warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}
