import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS,
  G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS,
  G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS,
  getG4AU08NumericCanonicalPatternSpec,
  listG4AU08NumericCanonicalPatternSpecs,
  sampleG4AU08NumericCanonicalPatternSpec,
  validateG4AU08NumericCanonicalHiddenRegistry,
} from "../../site/modules/curriculum/batch-a/g4a-u08-numeric-canonical-hidden.js";
import { G4A_U08_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const SUPPLEMENTAL_IDS = [
  "ps_g4a_u08_num_add_group_round",
  "ps_g4a_u08_num_signed_term_move",
  "ps_g4a_u08_num_repeated_subtract_group",
  "ps_g4a_u08_num_mul_div_safe_reorder",
  "ps_g4a_u08_num_repeated_divide_group",
  "ps_g4a_u08_num_compound_parentheses",
];

function evaluate(tokens) {
  const precedence = { "+": 1, "-": 1, "×": 2, "÷": 2 };
  const output = [];
  const operators = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") operators.push(token);
    else if (token === ")") {
      while (operators.at(-1) !== "(") output.push(operators.pop());
      operators.pop();
    } else {
      while (operators.length > 0 && operators.at(-1) !== "(" && precedence[operators.at(-1)] >= precedence[token]) output.push(operators.pop());
      operators.push(token);
    }
  }
  output.push(...operators.reverse());
  const stack = [];
  for (const token of output) {
    if (Number.isInteger(token)) stack.push(token);
    else {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(token === "+" ? left + right : token === "-" ? left - right : token === "×" ? left * right : left / right);
    }
  }
  return stack[0];
}

test("S76N hidden registry contains ten primary and six supplemental numeric PatternSpecs", () => {
  const result = validateG4AU08NumericCanonicalHiddenRegistry();
  assert.equal(result.ok, true, result.errors.join(","));
  assert.deepEqual(result.counts, {
    primary: 10,
    supplemental: 6,
    patternSpecs: 16,
    patternGroups: 11,
    knowledgePoints: 11,
  });
  assert.equal(G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS.length, 10);
  assert.equal(G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS.length, 6);
  assert.equal(G4A_U08_NUMERIC_CANONICAL_PATTERN_SPECS.length, 16);
  assert.deepEqual(G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS.map((row) => row.patternSpecId), G4A_U08_PATTERN_SPEC_IDS);
  assert.deepEqual(G4A_U08_NUMERIC_CANONICAL_SUPPLEMENTAL_PATTERN_SPECS.map((row) => row.patternSpecId), SUPPLEMENTAL_IDS);
});

test("S76N registry remains hidden and production-forbidden", () => {
  for (const row of listG4AU08NumericCanonicalPatternSpecs()) {
    assert.equal(row.sourceId, SOURCE_ID);
    assert.equal(row.mode, "numeric");
    assert.equal(row.lifecycle.registryStatus, "implemented_hidden");
    assert.equal(row.lifecycle.samplerStatus, "implemented_hidden");
    assert.equal(row.lifecycle.validatorStatus, "pending_s76o");
    assert.equal(row.lifecycle.selectorVisibility, "hidden");
    assert.equal(row.lifecycle.canonicalRouting, "disabled");
    assert.equal(row.lifecycle.worksheetReachability, "disabled");
    assert.equal(row.lifecycle.productionUse, "forbidden");
  }
  assert.equal(getG4AU08NumericCanonicalPatternSpec("unknown"), null);
});

test("S76N does not alter the existing public G4A-U08 selector surface", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 8);
  const visible = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(visible.length, 8);
  assert.equal(visible.some((row) => row.knowledgePointId.startsWith("kp_g4a_u08_num_")), false);
});

test("S76N primary samplers preserve legacy IDs while adding canonical KP and PatternGroup identity", () => {
  for (const definition of G4A_U08_NUMERIC_CANONICAL_PRIMARY_PATTERN_SPECS) {
    const item = sampleG4AU08NumericCanonicalPatternSpec(definition.patternSpecId, { seed: `s76n-primary:${definition.patternSpecId}` });
    assert.equal(item.patternSpecId, definition.patternSpecId);
    assert.equal(item.legacyPatternSpecId, definition.patternSpecId);
    assert.equal(item.knowledgePointId, definition.knowledgePointId);
    assert.equal(item.patternGroupId, definition.patternGroupId);
    assert.equal(item.canonicalReasoningRole, definition.reasoningRole);
    assert.equal(item.finalAnswer, evaluate(item.expressionTokens));
    assert.equal(item.lifecycle.productionUse, "forbidden");
  }
});

test("S76N add-group-round sampler emits a useful same-sign grouping and equivalent reorder", () => {
  const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_add_group_round", { seed: "s76n-add-round" });
  const evidence = item.canonicalEvidence;
  const [left, right] = evidence.usefulGroupingTermIndexes;
  const terms = evidence.signedTermVector;
  assert.equal(terms[left].sign, terms[right].sign);
  assert.equal((terms[left].value + terms[right].value) % 10, 0);
  assert.equal(evaluate(item.expressionTokens), evaluate(evidence.equivalentReorderedExpressionTokens));
  assert.equal(evidence.equivalenceRuleId, "eq_signed_term_permutation");
});

test("S76N signed-term movement preserves every signed term and arithmetic value", () => {
  const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_signed_term_move", { seed: "s76n-signed-move" });
  const evidence = item.canonicalEvidence;
  assert.deepEqual([...evidence.permutation].sort(), evidence.signedTermVector.map((_, index) => index));
  assert.equal(evaluate(item.expressionTokens), evaluate(evidence.equivalentReorderedExpressionTokens));
  assert.equal(evidence.equivalenceRuleId, "eq_signed_term_permutation");
});

test("S76N repeated-subtraction sampler binds a-b-c to a-(b+c)", () => {
  const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_repeated_subtract_group", { seed: "s76n-repeat-sub" });
  assert.equal(item.shapeVariant, "add_sub_ltr_two_subtractions");
  assert.equal(evaluate(item.canonicalEvidence.ungroupedExpressionTokens), evaluate(item.canonicalEvidence.groupedExpressionTokens));
  assert.equal(item.canonicalEvidence.equivalenceRuleId, "eq_repeated_subtract_group");
});

test("S76N safe mul/div reorder preserves rational equivalence", () => {
  const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_mul_div_safe_reorder", { seed: "s76n-safe-mul-div" });
  assert.equal(evaluate(item.expressionTokens), evaluate(item.canonicalEvidence.equivalentReorderedExpressionTokens));
  assert.equal(item.canonicalEvidence.factorReciprocalVector.length, 3);
  assert.equal(item.canonicalEvidence.equivalenceRuleId, "eq_factor_reciprocal_permutation");
});

test("S76N repeated-division sampler binds a÷b÷c to a÷(b×c)", () => {
  const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_repeated_divide_group", { seed: "s76n-repeat-div" });
  assert.equal(item.shapeVariant, "mul_div_ltr_two_divisions");
  assert.equal(evaluate(item.canonicalEvidence.ungroupedExpressionTokens), evaluate(item.canonicalEvidence.groupedExpressionTokens));
  assert.equal(item.canonicalEvidence.equivalenceRuleId, "eq_repeated_divide_group");
});

test("S76N compound-parentheses sampler is bounded, integral and uses the full operator set", () => {
  for (let index = 0; index < 40; index += 1) {
    const item = sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_num_compound_parentheses", { seed: `s76n-compound:${index}` });
    assert.equal(item.shapeVariant, "compound_two_parenthetical_groups_full_four_ops");
    assert.equal(item.canonicalEvidence.parenthesisGroupCount, 2);
    assert.deepEqual(new Set(item.canonicalEvidence.operatorSet), new Set(["+", "-", "×", "÷"]));
    assert.equal(item.canonicalEvidence.astDepth <= 4, true);
    assert.equal(item.canonicalEvidence.exactIntegerDivision, true);
    assert.equal(item.finalAnswer, evaluate(item.expressionTokens));
    assert.equal(Number.isInteger(item.finalAnswer), true);
    assert.equal(item.intermediateResults.every((value) => Number.isInteger(value) && value >= 0 && value <= 9999), true);
  }
});

test("S76N rejects unknown hidden PatternSpec IDs", () => {
  assert.throws(
    () => sampleG4AU08NumericCanonicalPatternSpec("ps_g4a_u08_unknown", { seed: "x" }),
    /G4AU08_S76N_PATTERN_SPEC_UNKNOWN/,
  );
});
