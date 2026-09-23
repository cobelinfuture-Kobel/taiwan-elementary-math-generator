export const NUMBER_DOMAINS = Object.freeze({
  INTEGER: "integer",
  DECIMAL: "decimal",
  FRACTION: "fraction",
  MIXED_NUMBER: "mixedNumber",
  PERCENT: "percent"
});

export const V1_ACTIVE_NUMBER_DOMAINS = Object.freeze([
  NUMBER_DOMAINS.INTEGER
]);

export const GENERATION_MODES = Object.freeze({
  SINGLE_PATTERN: "singlePattern",
  MIXED_PATTERN: "mixedPattern"
});

export const QUESTION_KINDS = Object.freeze({
  EXPRESSION: "expression",
  ROUNDING: "rounding",
  PATTERN_SEQUENCE: "patternSequence",
  RELATIONSHIP: "relationship",
  MEASUREMENT_CONVERSION: "measurementConversion",
  GEOMETRY_FORMULA: "geometryFormula",
  VISUAL_GEOMETRY: "visualGeometry",
  CHART_DATA: "chartData",
  WORD_PROBLEM: "wordProblem"
});

export const V1_ACTIVE_QUESTION_KINDS = Object.freeze([
  QUESTION_KINDS.EXPRESSION
]);

// Core modules use canonical worksheet operator tokens. ASCII aliases are
// accepted at input boundaries and normalized in operator helpers.
export const OPERATORS = Object.freeze({
  ADD: "+",
  SUBTRACT: "-",
  MULTIPLY: "×",
  DIVIDE: "÷"
});

export const OPERATOR_VALUES = Object.freeze(Object.values(OPERATORS));

export const ALLOCATION_MODES = Object.freeze({
  FIXED_COUNTS: "fixedCounts",
  EQUAL_DISTRIBUTION: "equalDistribution",
  WEIGHTED_DISTRIBUTION: "weightedDistribution"
});

export const WORKSHEET_ORDERING_MODES = Object.freeze({
  GROUPED_BY_PATTERN: "groupedByPattern",
  SHUFFLE_ACROSS_PATTERNS: "shuffleAcrossPatterns"
});

export const SUPPORT_STATUSES = Object.freeze({
  V1_EXPRESSION_SUPPORTED: "v1ExpressionSupported",
  V1_SCAFFOLD_ONLY: "v1ScaffoldOnly",
  V1_FORMULA_SUPPORTED_LATER: "v1FormulaSupportedLater",
  FUTURE_DECIMAL_DOMAIN: "futureDecimalDomain",
  FUTURE_FRACTION_DOMAIN: "futureFractionDomain",
  FUTURE_MEASUREMENT_ENGINE: "futureMeasurementEngine",
  FUTURE_GEOMETRY_FORMULA_ENGINE: "futureGeometryFormulaEngine",
  REQUIRES_VISUAL_GENERATOR: "requiresVisualGenerator",
  REQUIRES_CHART_DATA_ENGINE: "requiresChartDataEngine",
  REQUIRES_WORD_PROBLEM_TEMPLATE: "requiresWordProblemTemplate",
  PLANNED_ONLY: "plannedOnly",
  EXCLUDED: "excluded"
});

export const V1_BLOCKED_SUPPORT_STATUSES = Object.freeze([
  SUPPORT_STATUSES.FUTURE_DECIMAL_DOMAIN,
  SUPPORT_STATUSES.FUTURE_FRACTION_DOMAIN,
  SUPPORT_STATUSES.FUTURE_MEASUREMENT_ENGINE,
  SUPPORT_STATUSES.FUTURE_GEOMETRY_FORMULA_ENGINE,
  SUPPORT_STATUSES.REQUIRES_VISUAL_GENERATOR,
  SUPPORT_STATUSES.REQUIRES_CHART_DATA_ENGINE,
  SUPPORT_STATUSES.REQUIRES_WORD_PROBLEM_TEMPLATE,
  SUPPORT_STATUSES.PLANNED_ONLY,
  SUPPORT_STATUSES.EXCLUDED
]);

export const CURRICULUM_ITEM_TYPES = Object.freeze({
  MAIN_UNIT: "mainUnit",
  SUB_TOPIC: "subTopic",
  BRIDGE_SKILL: "bridgeSkill",
  REVIEW_SKILL: "reviewSkill",
  EXTENSION_SKILL: "extensionSkill"
});

export const PUBLISHERS = Object.freeze({
  KANGXUAN: "kangxuan",
  HANLIN: "hanlin",
  NANYI: "nanyi"
});

export const GRADES = Object.freeze([3, 4, 5, 6]);

export const SEMESTERS = Object.freeze({
  UPPER: "upper",
  LOWER: "lower"
});

export const EXAM_CHECKPOINTS = Object.freeze({
  MIDTERM: "midterm",
  FINAL: "final"
});

export const EXAM_SEGMENTS = Object.freeze({
  BEFORE_MIDTERM: "beforeMidterm",
  AFTER_MIDTERM: "afterMidterm",
  FULL_SEMESTER: "fullSemester"
});

export const COMPLEXITY_POLICIES = Object.freeze({
  ANY: "any",
  NO_CARRY: "noCarry",
  REQUIRE_CARRY: "requireCarry",
  SINGLE_CARRY: "singleCarry",
  MULTI_CARRY: "multiCarry",
  NO_BORROW: "noBorrow",
  REQUIRE_BORROW: "requireBorrow",
  SINGLE_BORROW: "singleBorrow",
  MULTI_BORROW: "multiBorrow",
  NO_MULTIPLICATION_CARRY: "noMultiplicationCarry",
  MULTIPLICATION_WITH_CARRY: "multiplicationWithCarry",
  MULTI_STEP_CARRY: "multiStepCarry"
});

export const PAPER_SIZES = Object.freeze({
  A4: "A4"
});

export const DIGIT_CONSTRAINT_TARGETS = Object.freeze([
  "operand1",
  "operand2",
  "operand3",
  "operand4",
  "answer",
  "intermediate"
]);

export const BLANK_MODES = Object.freeze({
  SOLVE_FINAL_ANSWER: "solveFinalAnswer"
});

export const PREFERRED_V1_PATTERN_SUPPORT_STATUSES = Object.freeze([
  SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED
]);
