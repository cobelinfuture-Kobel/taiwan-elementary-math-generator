import { generateG4AU08ExpressionQuestions } from "./g4a-u08-expression-generator.js";
import { G4A_U08_PATTERN_SPEC_IDS, G4A_U08_SOURCE_ID } from "./source-pattern-g4a-u08-extension.js";

const UNIT_CODE = "4A-U08";
const HIDDEN_LIFECYCLE = Object.freeze({
  registryStatus: "implemented_hidden",
  samplerStatus: "implemented_hidden",
  validatorStatus: "pending_s76o",
  selectorVisibility: "hidden",
  canonicalRouting: "disabled",
  worksheetReachability: "disabled",
  productionUse: "forbidden",
});

const PRIMARY_ROWS = Object.freeze([
  ["ps_g4a_u08_parentheses_add_sub", "kp_g4a_u08_num_parentheses_first", "pg_g4a_u08_num_parentheses_first", "evaluate_parenthesized_add_sub_group_first"],
  ["ps_g4a_u08_parentheses_mul_div", "kp_g4a_u08_num_parentheses_first", "pg_g4a_u08_num_parentheses_first", "evaluate_parenthesized_mul_div_group_first"],
  ["ps_g4a_u08_mul_before_add_sub", "kp_g4a_u08_num_mul_div_before_add_sub", "pg_g4a_u08_num_mul_div_before_add_sub", "multiply_before_additive_overlay"],
  ["ps_g4a_u08_div_before_add_sub", "kp_g4a_u08_num_mul_div_before_add_sub", "pg_g4a_u08_num_mul_div_before_add_sub", "divide_before_additive_overlay"],
  ["ps_g4a_u08_add_sub_left_to_right", "kp_g4a_u08_num_add_sub_left_assoc", "pg_g4a_u08_num_add_sub_left_assoc", "left_associative_add_sub"],
  ["ps_g4a_u08_mul_div_left_to_right", "kp_g4a_u08_num_mul_div_left_assoc", "pg_g4a_u08_num_mul_div_left_assoc", "left_associative_mul_div"],
  ["ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses", "kp_g4a_u08_num_mul_div_before_add_sub", "pg_g4a_u08_num_mul_div_before_add_sub", "complete_precedence_without_parentheses"],
  ["ps_g4a_u08_mixed_with_parentheses", "kp_g4a_u08_num_parentheses_change_precedence", "pg_g4a_u08_num_parentheses_change_precedence", "nonredundant_parentheses_change_mixed_ast"],
  ["ps_g4a_u08_large_add_sub_overlay_no_parentheses", "kp_g4a_u08_num_mul_div_before_add_sub", "pg_g4a_u08_num_mul_div_before_add_sub", "large_add_sub_overlay_with_operator_precedence"],
  ["ps_g4a_u08_large_add_sub_overlay_with_parentheses", "kp_g4a_u08_num_parentheses_change_precedence", "pg_g4a_u08_num_parentheses_change_precedence", "large_overlay_nonredundant_parentheses_ast_change"],
]);

const SUPPLEMENTAL_ROWS = Object.freeze([
  {
    patternSpecId: "ps_g4a_u08_num_add_group_round",
    knowledgePointId: "kp_g4a_u08_num_add_group_round",
    patternGroupId: "pg_g4a_u08_num_add_group_round",
    reasoningRole: "equivalent_add_sub_regroup_to_round_number",
    strategy: "constrained_reuse",
    legacyPatternSpecIds: ["ps_g4a_u08_add_sub_left_to_right"],
    allowedShapeVariants: ["add_sub_ltr_subtract_then_add", "add_sub_ltr_add_then_subtract"],
  },
  {
    patternSpecId: "ps_g4a_u08_num_signed_term_move",
    knowledgePointId: "kp_g4a_u08_num_signed_term_move",
    patternGroupId: "pg_g4a_u08_num_signed_term_move",
    reasoningRole: "move_signed_terms_without_changing_sign_binding",
    strategy: "shape_split_with_derived_equivalence",
    legacyPatternSpecIds: ["ps_g4a_u08_add_sub_left_to_right"],
    allowedShapeVariants: ["add_sub_ltr_subtract_then_add", "add_sub_ltr_add_then_subtract", "add_sub_ltr_two_subtractions"],
  },
  {
    patternSpecId: "ps_g4a_u08_num_repeated_subtract_group",
    knowledgePointId: "kp_g4a_u08_num_repeated_subtract_group",
    patternGroupId: "pg_g4a_u08_num_repeated_subtract_group",
    reasoningRole: "group_repeated_subtrahends_as_sum",
    strategy: "cross_family_equivalence_pair",
    legacyPatternSpecIds: ["ps_g4a_u08_add_sub_left_to_right", "ps_g4a_u08_parentheses_add_sub"],
    allowedShapeVariants: ["add_sub_ltr_two_subtractions", "parentheses_add_sub_middle_subtract_sum"],
  },
  {
    patternSpecId: "ps_g4a_u08_num_mul_div_safe_reorder",
    knowledgePointId: "kp_g4a_u08_num_mul_div_safe_reorder",
    patternGroupId: "pg_g4a_u08_num_mul_div_safe_reorder",
    reasoningRole: "reorder_factor_and_reciprocal_terms_safely",
    strategy: "shape_split_with_rational_equivalence",
    legacyPatternSpecIds: ["ps_g4a_u08_mul_div_left_to_right"],
    allowedShapeVariants: ["mul_div_ltr_divide_then_multiply", "mul_div_ltr_multiply_then_divide"],
  },
  {
    patternSpecId: "ps_g4a_u08_num_repeated_divide_group",
    knowledgePointId: "kp_g4a_u08_num_repeated_divide_group",
    patternGroupId: "pg_g4a_u08_num_repeated_divide_group",
    reasoningRole: "group_repeated_divisors_as_product",
    strategy: "cross_family_equivalence_pair",
    legacyPatternSpecIds: ["ps_g4a_u08_mul_div_left_to_right", "ps_g4a_u08_parentheses_mul_div"],
    allowedShapeVariants: ["mul_div_ltr_two_divisions", "parentheses_mul_div_divide_by_product"],
  },
  {
    patternSpecId: "ps_g4a_u08_num_compound_parentheses",
    knowledgePointId: "kp_g4a_u08_num_compound_parentheses",
    patternGroupId: "pg_g4a_u08_num_compound_parentheses",
    reasoningRole: "evaluate_two_parenthetical_groups_with_full_four_operations",
    strategy: "new_bounded_family",
    legacyPatternSpecIds: [],
    allowedShapeVariants: ["compound_two_parenthetical_groups_full_four_ops"],
  },
]);

function freezeDefinition(row) {
  return Object.freeze({
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    mode: "numeric",
    depth: "N",
    lifecycle: HIDDEN_LIFECYCLE,
    ...row,
  });
}

export const G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS = Object.freeze(PRIMARY_ROWS.map(([patternSpecId, knowledgePointId, patternGroupId, reasoningRole]) => freezeDefinition({
  patternSpecId,
  knowledgePointId,
  patternGroupId,
  reasoningRole,
  strategy: "preserve_id_reclassify",
  legacyPatternSpecIds: Object.freeze([patternSpecId]),
  allowedShapeVariants: Object.freeze([]),
})));

export const G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS = Object.freeze(SUPPLEMENTAL_ROWS.map((row) => freezeDefinition({
  ...row,
  legacyPatternSpecIds: Object.freeze([...row.legacyPatternSpecIds]),
  allowedShapeVariants: Object.freeze([...row.allowedShapeVariants]),
})));

export const G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS = Object.freeze([
  ...G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS,
  ...G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS,
]);

const DEFINITION_BY_ID = new Map(G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.map((row) => [row.patternSpecId, row]));

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "s76n")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function signedTerms(tokens) {
  const result = [];
  let sign = 1;
  for (const token of tokens) {
    if (token === "+") sign = 1;
    else if (token === "-") sign = -1;
    else if (Number.isInteger(token)) {
      result.push({ value: token, sign });
      sign = 1;
    }
  }
  return result;
}

function usefulGrouping(termVector) {
  for (let left = 0; left < termVector.length; left += 1) {
    for (let right = left + 1; right < termVector.length; right += 1) {
      if (termVector[left].sign !== termVector[right].sign) continue;
      const sum = termVector[left].value + termVector[right].value;
      if (sum % 10 === 0 || sum % 100 === 0) return [left, right];
    }
  }
  return null;
}

function reorderedSignedExpression(termVector, order) {
  const tokens = [];
  order.forEach((index, position) => {
    const term = termVector[index];
    if (position === 0) {
      if (term.sign < 0) tokens.push(0, "-");
      tokens.push(term.value);
    } else {
      tokens.push(term.sign < 0 ? "-" : "+", term.value);
    }
  });
  return tokens;
}

function generateLegacyPool(seed) {
  const result = generateG4AU08ExpressionQuestions({
    sourceId: G4A_U08_SOURCE_ID,
    questionCount: 100,
    ordering: "groupedByPattern",
    generationSeed: seed,
  });
  if (!result.ok) throw new Error(`G4AU08_S76N_LEGACY_POOL_FAILED:${result.errors?.[0]?.code ?? "unknown"}`);
  return result.questions;
}

function findLegacySample(definition, seed, predicate = () => true) {
  for (let round = 0; round < 24; round += 1) {
    const pool = generateLegacyPool(`${seed}:round:${round}`);
    const match = pool.find((question) => definition.legacyPatternSpecIds.includes(question.patternSpecId)
      && (definition.allowedShapeVariants.length === 0 || definition.allowedShapeVariants.includes(question.shapeVariant))
      && predicate(question));
    if (match) return match;
  }
  throw new Error(`G4AU08_S76N_SAMPLE_EXHAUSTED:${definition.patternSpecId}`);
}

function canonicalize(definition, legacyQuestion, evidence = {}) {
  return Object.freeze({
    ...clone(legacyQuestion),
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    patternSpecId: definition.patternSpecId,
    legacyPatternSpecId: legacyQuestion?.patternSpecId ?? null,
    canonicalReasoningRole: definition.reasoningRole,
    canonicalSamplerStrategy: definition.strategy,
    canonicalEvidence: Object.freeze(clone(evidence)),
    lifecycle: HIDDEN_LIFECYCLE,
  });
}

function sampleAddGroupRound(definition, seed) {
  const question = findLegacySample(definition, seed, (candidate) => usefulGrouping(signedTerms(candidate.expressionTokens)) !== null);
  const vector = signedTerms(question.expressionTokens);
  const pair = usefulGrouping(vector);
  const order = [pair[0], pair[1], ...vector.map((_, index) => index).filter((index) => !pair.includes(index))];
  return canonicalize(definition, question, {
    signedTermVector: vector,
    usefulGroupingTermIndexes: pair,
    equivalentReorderedExpressionTokens: reorderedSignedExpression(vector, order),
    equivalenceRuleId: "eq_signed_term_permutation",
  });
}

function sampleSignedTermMove(definition, seed) {
  const question = findLegacySample(definition, seed);
  const vector = signedTerms(question.expressionTokens);
  const order = vector.map((_, index) => index).reverse();
  return canonicalize(definition, question, {
    signedTermVector: vector,
    permutation: order,
    equivalentReorderedExpressionTokens: reorderedSignedExpression(vector, order),
    equivalenceRuleId: "eq_signed_term_permutation",
  });
}

function sampleRepeatedSubtract(definition, seed) {
  const question = findLegacySample(definition, seed, (candidate) => candidate.shapeVariant === "add_sub_ltr_two_subtractions");
  const [a, , b, , c] = question.expressionTokens;
  return canonicalize(definition, question, {
    equivalenceRuleId: "eq_repeated_subtract_group",
    ungroupedExpressionTokens: [a, "-", b, "-", c],
    groupedExpressionTokens: [a, "-", "(", b, "+", c, ")"],
  });
}

function sampleMulDivSafeReorder(definition, seed) {
  const question = findLegacySample(definition, seed);
  const tokens = question.expressionTokens;
  const op1 = tokens[1];
  const op2 = tokens[3];
  const vector = [
    { value: tokens[0], exponent: 1 },
    { value: tokens[2], exponent: op1 === "÷" ? -1 : 1 },
    { value: tokens[4], exponent: op2 === "÷" ? -1 : 1 },
  ];
  return canonicalize(definition, question, {
    factorReciprocalVector: vector,
    safePermutation: [0, 2, 1],
    equivalentReorderedExpressionTokens: [tokens[0], op2, tokens[4], op1, tokens[2]],
    equivalenceRuleId: "eq_factor_reciprocal_permutation",
  });
}

function sampleRepeatedDivide(definition, seed) {
  const question = findLegacySample(definition, seed, (candidate) => candidate.shapeVariant === "mul_div_ltr_two_divisions");
  const [a, , b, , c] = question.expressionTokens;
  return canonicalize(definition, question, {
    equivalenceRuleId: "eq_repeated_divide_group",
    divisorProduct: b * c,
    ungroupedExpressionTokens: [a, "÷", b, "÷", c],
    groupedExpressionTokens: [a, "÷", "(", b, "×", c, ")"],
  });
}

function compoundQuestion(definition, seed) {
  const h = hashSeed(seed);
  const a = 10 + (h % 21);
  const b = 5 + ((h >>> 3) % 16);
  const c = 2 + ((h >>> 7) % 6);
  const divisor = 2 + ((h >>> 11) % 6);
  const quotient = 2 + ((h >>> 15) % 10);
  const e = divisor + 2 + ((h >>> 19) % 7);
  const f = e - divisor;
  const d = divisor * quotient;
  const expressionTokens = ["(", a, "+", b, ")", "×", c, "-", d, "÷", "(", e, "-", f, ")"];
  const groupA = a + b;
  const groupB = e - f;
  const product = groupA * c;
  const division = d / groupB;
  const finalAnswer = product - division;
  const expression = expressionTokens.join(" ").replaceAll("( ", "(").replaceAll(" )", ")");
  const question = {
    id: `${definition.patternSpecId}-${h}`,
    sourceId: G4A_U08_SOURCE_ID,
    kind: "g4aU08OrderOfOperationsExpression",
    expression,
    expressionTokens,
    shapeVariant: "compound_two_parenthetical_groups_full_four_ops",
    finalAnswer,
    answerText: String(finalAnswer),
    displayText: `${expression} = ${finalAnswer}`,
    blankedDisplayText: `${expression} = ______`,
    promptText: `${expression} = ______`,
    operationOrderTrace: [
      { step: 1, op: "+", left: a, right: b, result: groupA },
      { step: 2, op: "-", left: e, right: f, result: groupB },
      { step: 3, op: "×", left: groupA, right: c, result: product },
      { step: 4, op: "÷", left: d, right: groupB, result: division },
      { step: 5, op: "-", left: product, right: division, result: finalAnswer },
    ],
    intermediateResults: [groupA, groupB, product, division, finalAnswer],
    hasParentheses: true,
    hasMulDiv: true,
    requiresLeftToRight: false,
  };
  return canonicalize(definition, question, {
    parenthesisGroupCount: 2,
    operatorSet: ["+", "-", "×", "÷"],
    astDepth: 4,
    exactIntegerDivision: Number.isInteger(division),
  });
}

export function getG4AU08NumericCanonicalPatternSpec(patternSpecId) {
  return DEFINITION_BY_ID.get(patternSpecId) ?? null;
}

export function listG4AU08NumericCanonicalPatternSpecs() {
  return [...G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS];
}

export function sampleG4AU08NumericCanonicalPatternSpec(patternSpecId, options = {}) {
  const definition = DEFINITION_BY_ID.get(patternSpecId);
  if (!definition) throw new Error(`G4AU08_S76N_PATTERN_SPEC_UNKNOWN:${patternSpecId}`);
  const seed = String(options.seed ?? `s76n:${patternSpecId}`);
  if (definition.strategy === "preserve_id_reclassify") return canonicalize(definition, findLegacySample(definition, seed));
  if (patternSpecId === "ps_g4a_u08_num_add_group_round") return sampleAddGroupRound(definition, seed);
  if (patternSpecId === "ps_g4a_u08_num_signed_term_move") return sampleSignedTermMove(definition, seed);
  if (patternSpecId === "ps_g4a_u08_num_repeated_subtract_group") return sampleRepeatedSubtract(definition, seed);
  if (patternSpecId === "ps_g4a_u08_num_mul_div_safe_reorder") return sampleMulDivSafeReorder(definition, seed);
  if (patternSpecId === "ps_g4a_u08_num_repeated_divide_group") return sampleRepeatedDivide(definition, seed);
  if (patternSpecId === "ps_g4a_u08_num_compound_parentheses") return compoundQuestion(definition, seed);
  throw new Error(`G4AU08_S76N_SAMPLER_MISSING:${patternSpecId}`);
}

export function validateG4AU08NumericCanonicalHiddenRegistry() {
  const errors = [];
  const ids = G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.map((row) => row.patternSpecId);
  const groups = new Set(G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.map((row) => row.patternGroupId));
  const knowledgePoints = new Set(G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.map((row) => row.knowledgePointId));
  if (G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS.length !== 10) errors.push("primary_count_mismatch");
  if (G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS.length !== 6) errors.push("supplemental_count_mismatch");
  if (ids.length !== 16 || new Set(ids).size !== 16) errors.push("pattern_spec_identity_mismatch");
  if (groups.size !== 11) errors.push("pattern_group_coverage_mismatch");
  if (knowledgePoints.size !== 11) errors.push("knowledge_point_coverage_mismatch");
  if (!G4A_U08_PATTERN_SPEC_IDS.every((id) => ids.includes(id))) errors.push("legacy_primary_id_missing");
  if (G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.some((row) => row.lifecycle !== HIDDEN_LIFECYCLE)) errors.push("hidden_lifecycle_drift");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ primary: 10, supplemental: 6, patternSpecs: ids.length, patternGroups: groups.size, knowledgePoints: knowledgePoints.size }),
  });
}
