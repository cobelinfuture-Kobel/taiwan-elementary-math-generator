import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import {
  collectOperators,
  createBinaryNode,
  createGeneratedQuestionSkeleton,
  createValueNode
} from "../../core/expression-model.js";
import { evaluateExpression } from "../../core/evaluate-expression.js";
import { createIntegerValue } from "../../core/number-value.js";
import { createSeededRandom } from "../../core/random.js";
import { validateBatchAItem } from "../validator/batch-a-validator.js";
import {
  BATCH_A_GENERATOR_STATUSES,
  getBatchAPatternSpecRuntimePlan
} from "./batch-a-generator.js";
import {
  sampleAdditionOperandsByCarryPolicy,
  sampleDivisionOperandsByPlaceCasePolicy,
  sampleMultiplicationOperandsByCarryPolicy,
  sampleSubtractionOperandsByBorrowPolicy
} from "./algorithmic-complexity-samplers.js";

export const BATCH_A_SEMANTIC_GENERATOR_STATUSES = Object.freeze({
  SEMANTIC_EXECUTABLE: "semantic_executable",
  CONTRACT_ONLY: BATCH_A_GENERATOR_STATUSES.CONTRACT_ONLY,
  NOT_FOUND: BATCH_A_GENERATOR_STATUSES.NOT_FOUND,
  NOT_SEMANTICALLY_HARDENED: "not_semantically_hardened"
});

const SEMANTIC_SAMPLER_BY_PATTERN_SPEC_ID = new Map([
  ["ps_g3a_u02_4digit_add_multi_carry", { family: "additionCarry", policy: "multiCarry" }],
  ["ps_g3a_u02_4digit_sub_multi_borrow", { family: "subtractionBorrow", policy: "multiBorrow" }],
  ["ps_g3a_u02_4digit_sub_consecutive_borrow", { family: "subtractionBorrow", policy: "consecutiveBorrow" }],
  ["ps_g3a_u02_4digit_sub_zero_borrow_chain", { family: "subtractionBorrow", policy: "zeroBorrowChain" }],
  ["ps_g3a_u03_2digit_by_1digit_carry", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g3a_u03_3digit_by_1digit", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g4a_u02_3digit_by_1digit_review", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g4a_u02_1digit_by_2digit", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g4a_u02_1digit_by_3digit", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g4a_u02_2digit_by_2digit", { family: "multiplicationCarry", policy: "multiplicationWithCarry" }],
  ["ps_g3a_u06_exact_division_check", { family: "divisionPlaceCase", policy: "exact" }],
  ["ps_g3b_u01_2digit_by_1digit_regroup_tens", { family: "divisionPlaceCase", policy: "regroupTens" }],
  ["ps_g3b_u01_2digit_by_1digit_ones_insufficient", { family: "divisionPlaceCase", policy: "onesInsufficient" }],
  ["ps_g3b_u01_3digit_by_1digit_regroup_hundreds", { family: "divisionPlaceCase", policy: "regroupHundreds" }],
  ["ps_g3b_u01_3digit_by_1digit_tens_insufficient", { family: "divisionPlaceCase", policy: "tensInsufficient" }],
  ["ps_g3b_u01_3digit_by_1digit_ones_insufficient", { family: "divisionPlaceCase", policy: "onesInsufficient" }],
  ["ps_g3b_u01_ones_equal_divisor", { family: "divisionPlaceCase", policy: "onesEqualDivisor" }],
  ["ps_g4a_u04_4digit_by_1digit_high_place_sufficient", { family: "divisionPlaceCase", policy: "highPlaceSufficient" }],
  ["ps_g4a_u04_4digit_by_1digit_high_place_insufficient", { family: "divisionPlaceCase", policy: "highPlaceInsufficient" }],
  ["ps_g4a_u04_4digit_by_1digit_high_place_exact", { family: "divisionPlaceCase", policy: "highPlaceExact" }]
]);

function createIssue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function runSampler(sampler, ranges, randomFn) {
  switch (sampler.family) {
    case "additionCarry":
      return sampleAdditionOperandsByCarryPolicy(sampler.policy, ranges, randomFn);
    case "subtractionBorrow":
      return sampleSubtractionOperandsByBorrowPolicy(sampler.policy, ranges, randomFn);
    case "multiplicationCarry":
      return sampleMultiplicationOperandsByCarryPolicy(sampler.policy, ranges, randomFn);
    case "divisionPlaceCase":
      return sampleDivisionOperandsByPlaceCasePolicy(sampler.policy, ranges, randomFn);
    default:
      return {
        ok: false,
        operands: [],
        profile: null,
        errors: [createIssue("SAMPLER_FAMILY_UNSUPPORTED", "sampler.family", `Unsupported semantic sampler family '${sampler.family}'.`)],
        warnings: []
      };
  }
}

function buildExpressionFromOperands(operators, operands) {
  let expression = createValueNode(createIntegerValue(operands[0]), 1);
  for (let index = 0; index < operators.length; index += 1) {
    expression = createBinaryNode(
      operators[index],
      expression,
      createValueNode(createIntegerValue(operands[index + 1]), index + 2),
      { groupingHint: "leftAssociative" }
    );
  }
  return expression;
}

function buildMetadata(pattern, sampler, profile) {
  return {
    patternId: pattern.patternId,
    patternTags: pattern.patternTags ?? [],
    skillTags: pattern.skillTags ?? [],
    difficultyTags: pattern.difficultyTags ?? [],
    curriculumNodeIds: pattern.curriculumNodeIds ?? [],
    canonicalSkillIds: pattern.canonicalSkillIds ?? [],
    precedenceMode: pattern.generatorConfigPatch?.precedence?.mode ?? null,
    parenthesesMode: pattern.generatorConfigPatch?.parentheses?.mode ?? null,
    algorithmicSampler: sampler,
    algorithmicProfile: profile
  };
}

export function getBatchASemanticSamplerPatternSpecIds() {
  return [...SEMANTIC_SAMPLER_BY_PATTERN_SPEC_ID.keys()];
}

export function getBatchASemanticSamplerPlan(patternSpecId, options = {}) {
  const runtimePlan = getBatchAPatternSpecRuntimePlan(patternSpecId, options);
  if (!runtimePlan.ok) {
    return {
      ...runtimePlan,
      status: runtimePlan.status === BATCH_A_GENERATOR_STATUSES.NOT_FOUND
        ? BATCH_A_SEMANTIC_GENERATOR_STATUSES.NOT_FOUND
        : BATCH_A_SEMANTIC_GENERATOR_STATUSES.CONTRACT_ONLY,
      sampler: null
    };
  }

  const sampler = SEMANTIC_SAMPLER_BY_PATTERN_SPEC_ID.get(patternSpecId) ?? null;
  if (!sampler) {
    return {
      ok: false,
      status: BATCH_A_SEMANTIC_GENERATOR_STATUSES.NOT_SEMANTICALLY_HARDENED,
      row: runtimePlan.row,
      pattern: runtimePlan.pattern,
      sampler: null,
      errors: [createIssue("BATCH_A_PATTERN_NOT_SEMANTICALLY_HARDENED", "patternSpecId", `PatternSpec '${patternSpecId}' has no S36B semantic sampler.`)],
      warnings: []
    };
  }

  return {
    ok: true,
    status: BATCH_A_SEMANTIC_GENERATOR_STATUSES.SEMANTIC_EXECUTABLE,
    row: runtimePlan.row,
    pattern: runtimePlan.pattern,
    sampler,
    errors: [],
    warnings: []
  };
}

export function generateBatchASemanticQuestionFromPatternSpec(patternSpecId, options = {}) {
  const plan = getBatchASemanticSamplerPlan(patternSpecId, options);
  if (!plan.ok || !plan.pattern || !plan.sampler) {
    return { ok: false, question: null, row: plan.row, errors: plan.errors, warnings: plan.warnings };
  }

  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  const duplicateSet = options.existingDuplicateKeys ?? new Set();
  const ranges = plan.pattern.generatorConfigPatch?.expression?.operandRanges ?? [];
  const operators = plan.pattern.expressionTemplate.allowedOperatorsBySlot.map((slot) => slot[0]);

  const sample = runSampler(plan.sampler, ranges, randomFn);
  if (!sample.ok) {
    return { ok: false, question: null, row: plan.row, errors: sample.errors, warnings: sample.warnings };
  }

  const expression = buildExpressionFromOperands(operators, sample.operands);
  const evaluation = evaluateExpression(expression);
  if (!evaluation.ok || !evaluation.value) {
    return { ok: false, question: null, row: plan.row, errors: evaluation.errors, warnings: [] };
  }

  const duplicateKey = buildDuplicateKey(expression);
  if (duplicateSet.has(duplicateKey)) {
    return {
      ok: false,
      question: null,
      row: plan.row,
      errors: [createIssue("SEMANTIC_GENERATOR_DUPLICATE", "duplicateKey", `Duplicate generated question '${duplicateKey}'.`)],
      warnings: []
    };
  }

  const question = createGeneratedQuestionSkeleton({
    id: options.idFactory ? options.idFactory(plan.pattern, 1) : `${plan.pattern.patternId}-semantic-1`,
    expression,
    operandCount: sample.operands.length,
    operatorsUsed: collectOperators(expression),
    finalAnswer: evaluation.value,
    intermediateResults: evaluation.intermediateResults,
    blankTarget: options.blankTarget ?? { type: "finalAnswer" },
    duplicateKey,
    metadata: buildMetadata(plan.pattern, plan.sampler, sample.profile)
  });

  duplicateSet.add(duplicateKey);

  const validation = validateBatchAItem({
    question,
    sourceId: plan.row.sourceId,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
  });

  return {
    ok: validation.ok,
    question,
    row: plan.row,
    errors: validation.errors,
    warnings: [...(sample.warnings ?? []), ...validation.warnings]
  };
}

export function generateBatchASemanticQuestionSet(args = {}) {
  const patternSpecIds = args.patternSpecIds ?? getBatchASemanticSamplerPatternSpecIds();
  const questions = [];
  const errors = [];
  const warnings = [];

  for (const patternSpecId of patternSpecIds) {
    const result = generateBatchASemanticQuestionFromPatternSpec(patternSpecId, {
      ...args,
      seed: `${args.seed ?? "batch-a-semantic"}:${patternSpecId}`
    });
    if (!result.ok || !result.question) {
      errors.push(...(result.errors ?? []));
      warnings.push(...(result.warnings ?? []));
      continue;
    }
    questions.push(result.question);
    warnings.push(...(result.warnings ?? []));
  }

  return {
    ok: errors.length === 0,
    questions,
    errors,
    warnings
  };
}
