import { readFileSync } from "node:fs";

import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { generateQuestionFromPattern, generateQuestionsForPattern } from "../../core/generate-expression.js";
import { validateBatchAItem } from "../validator/batch-a-validator.js";

const REGISTRY_URL = new URL("../../../data/curriculum/registry/pattern_specs.batch_a.json", import.meta.url);

export const BATCH_A_GENERATOR_STATUSES = Object.freeze({
  EXECUTABLE: "executable",
  CONTRACT_ONLY: "contract_only",
  NOT_FOUND: "not_found"
});

function createIssue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function createWarning(code, path, message) {
  return createIssue(code, path, message, "warning");
}

function readRegistryFromDisk() {
  return JSON.parse(readFileSync(REGISTRY_URL, "utf-8"));
}

function validatorContractIdFromPatternSpecId(patternSpecId) {
  return `vc_${String(patternSpecId).replace(/^ps_/, "")}`;
}

function normalizeRegistryRow(sourceUnit, row, readiness) {
  const patternSpecId = typeof row === "string" ? row : row?.patternSpecId;
  return {
    sourceId: sourceUnit.sourceId,
    sourceTitle: sourceUnit.sourceTitle,
    readiness,
    patternSpecId,
    knowledgePointRefs: typeof row === "string" ? [] : row?.knowledgePointRefs ?? [],
    validatorContractRef: typeof row === "string" ? validatorContractIdFromPatternSpecId(patternSpecId) : row?.validatorContractRef ?? validatorContractIdFromPatternSpecId(patternSpecId)
  };
}

export function loadBatchAPatternSpecRegistry(options = {}) {
  return options.registry ?? readRegistryFromDisk();
}

export function flattenBatchAPatternSpecs(options = {}) {
  const registry = loadBatchAPatternSpecRegistry(options);
  const rows = [];

  for (const sourceUnit of registry.sourceUnits ?? []) {
    for (const readiness of ["ready", "partial"]) {
      for (const row of sourceUnit[readiness] ?? []) {
        rows.push(normalizeRegistryRow(sourceUnit, row, readiness));
      }
    }
  }

  return rows;
}

export function findBatchAPatternSpecRow(patternSpecId, options = {}) {
  return flattenBatchAPatternSpecs(options).find((row) => row.patternSpecId === patternSpecId) ?? null;
}

function expressionBlueprint(args) {
  return Object.freeze({
    operandCount: args.operandCount ?? 2,
    allowedOperatorsBySlot: args.allowedOperatorsBySlot,
    operandRanges: args.operandRanges,
    answerConstraint: {
      min: args.answerMin ?? 0,
      max: args.answerMax,
      allowZero: args.allowZero ?? true,
      allowNegative: args.allowNegative ?? false,
      requireInteger: true
    },
    division: args.division ?? null,
    canonicalSkillIds: Array.isArray(args.canonicalSkillIds) ? args.canonicalSkillIds : [args.canonicalSkillId],
    skillTags: Array.isArray(args.skillTags) ? args.skillTags : [args.canonicalSkillId],
    difficultyTags: args.difficultyTags ?? ["batch_a_core_expression"],
    precedenceMode: args.precedenceMode ?? "left_to_right",
    parenthesesMode: args.parenthesesMode ?? "none",
    semanticCoverage: args.semanticCoverage ?? "numeric_expression_only"
  });
}

const FOUR_DIGIT_ADD = expressionBlueprint({
  canonicalSkillId: "integer_addition",
  allowedOperatorsBySlot: [["+"]],
  operandRanges: [
    { position: 1, min: 1000, max: 4999, allowZero: false, allowOne: true },
    { position: 2, min: 1000, max: 4999, allowZero: false, allowOne: true }
  ],
  answerMax: 9999,
  difficultyTags: ["g3_4digit_addition"]
});

const FOUR_DIGIT_SUB = expressionBlueprint({
  canonicalSkillId: "integer_subtraction",
  allowedOperatorsBySlot: [["-"]],
  operandRanges: [
    { position: 1, min: 1000, max: 9999, allowZero: false, allowOne: true },
    { position: 2, min: 1000, max: 9999, allowZero: false, allowOne: true }
  ],
  answerMax: 9999,
  difficultyTags: ["g3_4digit_subtraction"]
});

const TENS_MULTIPLY_1DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 10, max: 90, allowZero: false, allowOne: true },
    { position: 2, min: 2, max: 9, allowZero: false, allowOne: false }
  ],
  answerMax: 810,
  difficultyTags: ["g3_tens_by_1digit"]
});

const TWO_DIGIT_MULTIPLY_1DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 10, max: 99, allowZero: false, allowOne: true },
    { position: 2, min: 2, max: 9, allowZero: false, allowOne: false }
  ],
  answerMax: 891,
  difficultyTags: ["g3_2digit_by_1digit"]
});

const THREE_DIGIT_MULTIPLY_1DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 100, max: 999, allowZero: false, allowOne: true },
    { position: 2, min: 2, max: 9, allowZero: false, allowOne: false }
  ],
  answerMax: 8991,
  difficultyTags: ["g3_g4_3digit_by_1digit"]
});

const ONE_DIGIT_MULTIPLY_2DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 2, max: 9, allowZero: false, allowOne: false },
    { position: 2, min: 10, max: 99, allowZero: false, allowOne: true }
  ],
  answerMax: 891,
  difficultyTags: ["g4_1digit_by_2digit"]
});

const ONE_DIGIT_MULTIPLY_3DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 2, max: 9, allowZero: false, allowOne: false },
    { position: 2, min: 100, max: 999, allowZero: false, allowOne: true }
  ],
  answerMax: 8991,
  difficultyTags: ["g4_1digit_by_3digit"]
});

const TWO_DIGIT_MULTIPLY_2DIGIT = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  allowedOperatorsBySlot: [["×"]],
  operandRanges: [
    { position: 1, min: 10, max: 99, allowZero: false, allowOne: true },
    { position: 2, min: 10, max: 99, allowZero: false, allowOne: true }
  ],
  answerMax: 9801,
  difficultyTags: ["g4_2digit_by_2digit"]
});

const CONSECUTIVE_MULTIPLICATION = expressionBlueprint({
  canonicalSkillId: "integer_multiplication",
  operandCount: 3,
  allowedOperatorsBySlot: [["×"], ["×"]],
  operandRanges: [
    { position: 1, min: 2, max: 9, allowZero: false, allowOne: false },
    { position: 2, min: 2, max: 9, allowZero: false, allowOne: false },
    { position: 3, min: 2, max: 9, allowZero: false, allowOne: false }
  ],
  answerMax: 729,
  difficultyTags: ["g3_consecutive_multiplication"]
});

function exactDivisionBlueprint({ dividendMin, dividendMax, divisorMin = 2, divisorMax = 9, answerMax, difficultyTags }) {
  return expressionBlueprint({
    canonicalSkillId: "integer_division_exact",
    allowedOperatorsBySlot: [["÷"]],
    operandRanges: [
      { position: 1, min: dividendMin, max: dividendMax, allowZero: false, allowOne: true },
      { position: 2, min: divisorMin, max: divisorMax, allowZero: false, allowOne: false }
    ],
    answerMin: 1,
    answerMax,
    allowZero: false,
    division: {
      allowDivideByOne: false,
      allowZeroDividend: false,
      requireExactQuotient: true
    },
    difficultyTags
  });
}

const TWO_DIGIT_DIVIDE_1DIGIT = exactDivisionBlueprint({
  dividendMin: 10,
  dividendMax: 99,
  answerMax: 99,
  difficultyTags: ["g3_2digit_by_1digit_exact_division"]
});

const THREE_DIGIT_DIVIDE_1DIGIT = exactDivisionBlueprint({
  dividendMin: 100,
  dividendMax: 999,
  answerMax: 999,
  difficultyTags: ["g3_3digit_by_1digit_exact_division"]
});

const FOUR_DIGIT_DIVIDE_1DIGIT = exactDivisionBlueprint({
  dividendMin: 1000,
  dividendMax: 9999,
  answerMax: 9999,
  difficultyTags: ["g4_4digit_by_1digit_exact_division"]
});

const EXECUTABLE_BLUEPRINTS = new Map([
  ["ps_g3a_u02_4digit_add_multi_carry", FOUR_DIGIT_ADD],
  ["ps_g3a_u02_4digit_sub_multi_borrow", FOUR_DIGIT_SUB],
  ["ps_g3a_u02_4digit_sub_consecutive_borrow", FOUR_DIGIT_SUB],
  ["ps_g3a_u02_4digit_sub_zero_borrow_chain", FOUR_DIGIT_SUB],
  ["ps_g3a_u03_tens_multiple_by_1digit", TENS_MULTIPLY_1DIGIT],
  ["ps_g3a_u03_2digit_by_1digit_carry", TWO_DIGIT_MULTIPLY_1DIGIT],
  ["ps_g3a_u03_3digit_by_1digit", THREE_DIGIT_MULTIPLY_1DIGIT],
  ["ps_g3a_u03_consecutive_multiplication", CONSECUTIVE_MULTIPLICATION],
  ["ps_g3a_u06_exact_division_check", TWO_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_2digit_by_1digit_regroup_tens", TWO_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_2digit_by_1digit_ones_insufficient", TWO_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_3digit_by_1digit_regroup_hundreds", THREE_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_3digit_by_1digit_tens_insufficient", THREE_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_3digit_by_1digit_ones_insufficient", THREE_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u01_ones_equal_divisor", TWO_DIGIT_DIVIDE_1DIGIT],
  ["ps_g3b_u04_consecutive_multiplication", CONSECUTIVE_MULTIPLICATION],
  ["ps_g4a_u02_3digit_by_1digit_review", THREE_DIGIT_MULTIPLY_1DIGIT],
  ["ps_g4a_u02_1digit_by_2digit", ONE_DIGIT_MULTIPLY_2DIGIT],
  ["ps_g4a_u02_1digit_by_3digit", ONE_DIGIT_MULTIPLY_3DIGIT],
  ["ps_g4a_u02_2digit_by_2digit", TWO_DIGIT_MULTIPLY_2DIGIT],
  ["ps_g4a_u04_4digit_by_1digit_high_place_sufficient", FOUR_DIGIT_DIVIDE_1DIGIT],
  ["ps_g4a_u04_4digit_by_1digit_high_place_insufficient", FOUR_DIGIT_DIVIDE_1DIGIT],
  ["ps_g4a_u04_4digit_by_1digit_high_place_exact", FOUR_DIGIT_DIVIDE_1DIGIT]
]);

function createRuntimePattern(row, blueprint) {
  return {
    patternId: row.patternSpecId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["batch_a", row.sourceId, row.readiness, row.patternSpecId, row.validatorContractRef],
    skillTags: blueprint.skillTags,
    difficultyTags: blueprint.difficultyTags,
    curriculumNodeIds: [row.sourceId],
    canonicalSkillIds: blueprint.canonicalSkillIds,
    expressionTemplate: {
      operandCount: blueprint.operandCount,
      allowedOperatorsBySlot: blueprint.allowedOperatorsBySlot,
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: blueprint.division ? "exact_integer_division" : null,
      algorithmicComplexityPolicy: blueprint.semanticCoverage
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: blueprint.operandRanges
      },
      answerConstraint: blueprint.answerConstraint,
      division: blueprint.division ?? undefined,
      precedence: { mode: blueprint.precedenceMode },
      parentheses: { mode: blueprint.parenthesesMode }
    }
  };
}

function contractOnlyReasonFor(row) {
  if (!row) {
    return "pattern_spec_not_found";
  }
  if (row.readiness !== "ready") {
    return "partial_pattern_requires_template_or_validator_refinement";
  }
  return "no_safe_v1_expression_generator_blueprint";
}

export function getBatchAExecutablePatternSpecIds() {
  return [...EXECUTABLE_BLUEPRINTS.keys()];
}

export function getBatchAPatternSpecRuntimePlan(patternSpecId, options = {}) {
  const row = findBatchAPatternSpecRow(patternSpecId, options);
  if (!row) {
    return {
      ok: false,
      status: BATCH_A_GENERATOR_STATUSES.NOT_FOUND,
      row: null,
      pattern: null,
      errors: [createIssue("BATCH_A_PATTERN_SPEC_NOT_FOUND", "patternSpecId", `PatternSpec '${patternSpecId}' was not found in Batch A registry.`)],
      warnings: []
    };
  }

  const blueprint = EXECUTABLE_BLUEPRINTS.get(row.patternSpecId);
  if (row.readiness !== "ready" || !blueprint) {
    return {
      ok: false,
      status: BATCH_A_GENERATOR_STATUSES.CONTRACT_ONLY,
      row,
      pattern: null,
      errors: [createIssue("BATCH_A_PATTERN_NOT_EXECUTABLE", "patternSpecId", `PatternSpec '${patternSpecId}' is contract-only for S36 generator consumption.`)],
      warnings: [createWarning("BATCH_A_GENERATOR_GATE", "patternSpecId", contractOnlyReasonFor(row))]
    };
  }

  return {
    ok: true,
    status: BATCH_A_GENERATOR_STATUSES.EXECUTABLE,
    row,
    pattern: createRuntimePattern(row, blueprint),
    errors: [],
    warnings: []
  };
}

export function generateBatchAQuestionFromPatternSpec(patternSpecId, options = {}) {
  const plan = getBatchAPatternSpecRuntimePlan(patternSpecId, options);
  if (!plan.ok || !plan.pattern) {
    return { ok: false, question: null, row: plan.row, errors: plan.errors, warnings: plan.warnings };
  }

  const generation = generateQuestionFromPattern(plan.pattern, options);
  if (!generation.ok || !generation.question) {
    return { ok: false, question: null, row: plan.row, errors: generation.errors ?? [], warnings: [...plan.warnings, ...(generation.warnings ?? [])] };
  }

  const validation = validateBatchAItem({
    question: generation.question,
    sourceId: plan.row.sourceId,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
  });

  return {
    ok: validation.ok,
    question: generation.question,
    row: plan.row,
    errors: validation.errors,
    warnings: [...plan.warnings, ...(generation.warnings ?? []), ...validation.warnings]
  };
}

export function generateBatchAQuestionsFromPatternSpec(patternSpecId, count, options = {}) {
  const plan = getBatchAPatternSpecRuntimePlan(patternSpecId, options);
  if (!plan.ok || !plan.pattern) {
    return { ok: false, questions: [], row: plan.row, errors: plan.errors, warnings: plan.warnings };
  }

  const generation = generateQuestionsForPattern(plan.pattern, count, options);
  if (!generation.ok) {
    return { ok: false, questions: generation.questions ?? [], row: plan.row, errors: generation.errors ?? [], warnings: [...plan.warnings, ...(generation.warnings ?? [])] };
  }

  const errors = [];
  const warnings = [...plan.warnings, ...(generation.warnings ?? [])];
  for (const [index, question] of generation.questions.entries()) {
    const validation = validateBatchAItem({
      question,
      sourceId: plan.row.sourceId,
      questionKind: QUESTION_KINDS.EXPRESSION,
      supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
    });
    if (!validation.ok) {
      errors.push(...validation.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    }
    warnings.push(...validation.warnings);
  }

  return {
    ok: errors.length === 0,
    questions: generation.questions,
    row: plan.row,
    errors,
    warnings
  };
}

export function generateBatchAQuestionSet(args = {}) {
  const patternSpecIds = args.patternSpecIds ?? getBatchAExecutablePatternSpecIds();
  const countPerPattern = args.countPerPattern ?? 1;
  const questions = [];
  const errors = [];
  const warnings = [];

  for (const patternSpecId of patternSpecIds) {
    const result = generateBatchAQuestionsFromPatternSpec(patternSpecId, countPerPattern, {
      ...args,
      seed: `${args.seed ?? "batch-a"}:${patternSpecId}`
    });
    if (!result.ok) {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      continue;
    }
    questions.push(...result.questions);
    warnings.push(...result.warnings);
  }

  return {
    ok: errors.length === 0,
    questions,
    errors,
    warnings
  };
}
