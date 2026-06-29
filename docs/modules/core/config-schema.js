import {
  ALLOCATION_MODES,
  DIGIT_CONSTRAINT_TARGETS,
  GENERATION_MODES,
  PAPER_SIZES,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES
} from "./constants.js";

/**
 * This module documents the conceptual config/data shapes defined in S2/S2A.
 * It is intentionally lightweight: no external schema library, no runtime
 * generation logic, and only small helper predicates for validation modules.
 */

export const SHAPE_NAMES = Object.freeze({
  WORKSHEET_CONFIG: "WorksheetConfig",
  PATTERN_PLAN: "PatternPlan",
  QUESTION_PATTERN: "QuestionPattern",
  EXPRESSION_PATTERN: "ExpressionPattern",
  PATTERN_POOL: "PatternPool",
  PATTERN_ALLOCATION: "PatternAllocation",
  MIXED_PATTERN_MODE: "MixedPatternMode",
  WORKSHEET_ORDERING: "WorksheetOrdering",
  DIGIT_CONSTRAINT: "DigitConstraint",
  ALGORITHMIC_COMPLEXITY_POLICY: "AlgorithmicComplexityPolicy",
  DIVISION_PATTERN: "DivisionPattern",
  TAG_METADATA: "TagMetadata",
  CURRICULUM_METADATA: "CurriculumMetadata",
  PATTERN_LEVEL_GENERATION_REPORT: "PatternLevelGenerationReport",
  VALIDATION_ERROR: "ValidationError"
});

export const DOC_SHAPES = Object.freeze({
  WorksheetConfig: {
    version: "string",
    numberDomain: { kind: "string" },
    questionKind: "string",
    generationMode: "string",
    metadata: "object",
    expression: "object",
    generation: "object",
    patternPlan: "object",
    printLayout: "object"
  },
  PatternPlan: {
    patternPool: "PatternPool",
    allocation: "PatternAllocation",
    mixedPatternMode: "MixedPatternMode",
    worksheetOrdering: "WorksheetOrdering"
  },
  QuestionPattern: {
    patternId: "string",
    enabled: "boolean",
    questionKind: "string",
    supportStatus: "string[]",
    patternTags: "string[]",
    skillTags: "string[]",
    difficultyTags: "string[]",
    curriculumNodeIds: "string[]",
    canonicalSkillIds: "string[]",
    expressionTemplate: "ExpressionPattern|null"
  },
  ExpressionPattern: {
    operandCount: "number",
    allowedOperatorsBySlot: "string[][]",
    operandDigitConstraints: "DigitConstraint[]",
    divisionPattern: "DivisionPattern|null",
    algorithmicComplexityPolicy: "AlgorithmicComplexityPolicy|null"
  },
  PatternPool: {
    poolId: "string",
    patterns: "QuestionPattern[]",
    selectionMode: "single|multiple"
  },
  PatternAllocation: {
    mode: "fixedCounts|equalDistribution|weightedDistribution",
    totalQuestionCount: "number",
    fixedCounts: "Array<{patternId,questionCount}>",
    weights: "Array<{patternId,weight}>"
  },
  MixedPatternMode: {
    enabled: "boolean",
    allowRepeatedPatterns: "boolean",
    weightingEnabled: "boolean"
  },
  WorksheetOrdering: {
    mode: "groupedByPattern|shuffleAcrossPatterns",
    stablePatternOrder: "string[]"
  },
  DigitConstraint: {
    target: "operand1|operand2|operand3|operand4|answer|intermediate",
    minDigits: "number",
    maxDigits: "number",
    allowZero: "boolean",
    allowNegative: "boolean"
  },
  AlgorithmicComplexityPolicy: {
    additionCarry: "string|null",
    subtractionBorrow: "string|null",
    multiplicationCarry: "string|null"
  },
  DivisionPattern: {
    dividendDigits: "object",
    divisorDigits: "object",
    quotientDigits: "object",
    exactOnly: "boolean",
    allowRemainderFuture: "boolean",
    quotientHasZeroFuture: "boolean",
    longDivisionFormatFuture: "boolean"
  },
  TagMetadata: {
    patternTags: "string[]",
    skillTags: "string[]",
    difficultyTags: "string[]",
    canonicalSkillIds: "string[]"
  },
  CurriculumMetadata: {
    curriculumNodeIds: "string[]"
  },
  PatternLevelGenerationReport: {
    patternId: "string",
    requestedQuestionCount: "number",
    generatedQuestionCount: "number",
    totalAttempts: "number"
  },
  ValidationError: {
    code: "string",
    severity: "error|warning",
    path: "string",
    message: "string"
  }
});

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

export function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function isKnownGenerationMode(value) {
  return Object.values(GENERATION_MODES).includes(value);
}

export function isKnownQuestionKind(value) {
  return Object.values(QUESTION_KINDS).includes(value);
}

export function isKnownAllocationMode(value) {
  return Object.values(ALLOCATION_MODES).includes(value);
}

export function isKnownWorksheetOrderingMode(value) {
  return Object.values(WORKSHEET_ORDERING_MODES).includes(value);
}

export function isKnownPaperSize(value) {
  return Object.values(PAPER_SIZES).includes(value);
}

export function isKnownSupportStatus(value) {
  return Object.values(SUPPORT_STATUSES).includes(value);
}

export function isKnownDigitConstraintTarget(value) {
  return DIGIT_CONSTRAINT_TARGETS.includes(value);
}
