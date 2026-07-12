import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_SDG_IDS,
  G5A_U08_S60H_PATTERN_SPEC_IDS,
  SPEC_POLICY,
  generateG5AU08ApplicationBatch,
  generateG5AU08ApplicationQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-generator.js";
import {
  validateG5AU08ApplicationBatch,
  validateG5AU08ApplicationQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-validator.js";

function clone(value) {
  return structuredClone(value);
}

function hasCode(result, code) {
  return result.errors.some((entry) => entry.code === code);
}

test("S60H scope contains 9 application and 2 contextual reasoning PatternSpecs", () => {
  assert.equal(G5A_U08_S60H_PATTERN_SPEC_IDS.length, 11);
  assert.equal(new Set(G5A_U08_S60H_PATTERN_SPEC_IDS).size, 11);
  assert.equal(Object.keys(SPEC_POLICY).length, 11);
  assert.deepEqual(ALLOWED_SDG_IDS, ["SDG_2", "SDG_4", "SDG_6", "SDG_7", "SDG_11", "SDG_12", "SDG_13", "SDG_15"]);
});

test("S60H generates and validates every PatternSpec in every supported depth/context", () => {
  for (const patternSpecId of G5A_U08_S60H_PATTERN_SPEC_IDS) {
    const policy = SPEC_POLICY[patternSpecId];
    for (const depth of policy.depths) {
      for (const contextType of policy.contexts) {
        const question = generateG5AU08ApplicationQuestion(patternSpecId, {
          seed: `positive:${patternSpecId}:${depth}:${contextType}`,
          depth,
          contextType,
        });
        const result = validateG5AU08ApplicationQuestion(question);
        assert.equal(result.valid, true, `${patternSpecId}/${depth}/${contextType}: ${JSON.stringify(result.errors)}`);
        assert.equal(result.output, question);
        assert.equal(question.applicationText, true);
        assert.equal(question.context.contextType, contextType);
        assert.equal(question.semanticDeltaIds.length, depth === "N_PLUS_1" ? 1 : 0);
        assert.match(question.promptText, /[\u3400-\u9fff]/u);
      }
    }
  }
});

test("S60H deterministic replay is stable", () => {
  const first = generateG5AU08ApplicationBatch({ questionCount: 137, seed: "deterministic", ordering: "shuffled" });
  const second = generateG5AU08ApplicationBatch({ questionCount: 137, seed: "deterministic", ordering: "shuffled" });
  assert.deepEqual(first, second);
  assert.equal(validateG5AU08ApplicationBatch(first).valid, true);
});

test("S60H default 1000-question stress reaches all specs, families, SDGs and target mixes", () => {
  const batch = generateG5AU08ApplicationBatch({ questionCount: 1000, seed: "s60h-stress", ordering: "shuffled" });
  assert.equal(batch.questions.length, 1000);
  assert.deepEqual(batch.depthAllocation, { N: 300, N_PLUS_1: 700 });
  assert.deepEqual(batch.contextAllocation, { daily_life: 500, sdg: 500 });
  assert.equal(new Set(batch.questions.map((row) => row.patternSpecId)).size, 11);
  assert.equal(new Set(batch.questions.map((row) => row.templateFamilyId)).size, 10);
  assert.deepEqual(
    [...new Set(batch.questions.filter((row) => row.context.contextType === "sdg").map((row) => row.context.sdgGoalId))].sort(),
    [...ALLOWED_SDG_IDS].sort(),
  );
  const result = validateG5AU08ApplicationBatch(batch);
  assert.equal(result.valid, true, JSON.stringify(result.errors.slice(0, 5)));
  assert.equal(result.acceptedQuestions.length, 1000);
});

test("S60H N+1 items contain exactly one allowlisted semantic delta", () => {
  const batch = generateG5AU08ApplicationBatch({ questionCount: 220, seed: "delta-coverage", depthMode: "N_PLUS_1" });
  for (const question of batch.questions) {
    assert.equal(question.depth, "N_PLUS_1");
    assert.equal(question.semanticDeltaIds.length, 1);
    assert.deepEqual(question.semanticDeltaIds, SPEC_POLICY[question.patternSpecId].deltaByDepth.N_PLUS_1);
  }
  const deltas = new Set(batch.questions.flatMap((row) => row.semanticDeltaIds));
  assert.deepEqual(
    [...deltas].sort(),
    [
      "adjust_unit_amount",
      "combine_groups",
      "discount_or_compensation",
      "nested_grouping",
      "reverse_from_average",
      "reverse_from_total",
      "update_population",
    ].sort(),
  );
});

test("S60H SDG contexts are semantically active and use fictional practice data", () => {
  const batch = generateG5AU08ApplicationBatch({ questionCount: 160, seed: "sdg-only", contextMode: "sdg" });
  for (const question of batch.questions) {
    assert.equal(question.context.contextType, "sdg");
    assert.equal(question.context.sdgActionAffectsMath, true);
    assert.equal(question.context.dataStatus, "fictionalized_for_practice");
    assert.equal(question.context.sourceRef, null);
    assert.equal(ALLOWED_SDG_IDS.includes(question.context.sdgGoalId), true);
    assert.equal(question.context.semanticRelevance.length >= 8, true);
  }
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H daily-life contexts contain no SDG identity", () => {
  const selected = G5A_U08_S60H_PATTERN_SPEC_IDS.filter((id) => SPEC_POLICY[id].contexts.includes("daily_life"));
  const batch = generateG5AU08ApplicationBatch({
    questionCount: 110,
    seed: "daily-only",
    selectedPatternSpecIds: selected,
    contextMode: "daily_life",
  });
  for (const question of batch.questions) {
    assert.equal(question.context.contextType, "daily_life");
    assert.equal(question.context.sdgGoalId, null);
    assert.equal(question.context.sdgActionAffectsMath, false);
  }
  assert.equal(validateG5AU08ApplicationBatch(batch).valid, true);
});

test("S60H average inverse and update remain contextual reasoning", () => {
  for (const patternSpecId of ["ps_g5a_u08_app_average_inverse", "ps_g5a_u08_app_average_update"]) {
    const question = generateG5AU08ApplicationQuestion(patternSpecId, { seed: patternSpecId, contextType: "sdg" });
    assert.equal(question.mode, "reasoning");
    assert.equal(question.contextualReasoning, true);
    assert.equal(question.answerModelShape, "averageInverseAnswer");
    assert.equal(validateG5AU08ApplicationQuestion(question).valid, true);
  }
});

test("S60H one-expression source patterns preserve expression, value and unit", () => {
  const ids = G5A_U08_S60H_PATTERN_SPEC_IDS.filter((id) => SPEC_POLICY[id].templateFamilyId !== "tf_g5a_u08_direct_average" && !id.includes("average_"));
  for (const id of ids) {
    const contextType = SPEC_POLICY[id].contexts[0];
    const depth = SPEC_POLICY[id].depths[0];
    const question = generateG5AU08ApplicationQuestion(id, { seed: `expression:${id}`, contextType, depth });
    if (question.answerModelShape !== "expressionAnswer") continue;
    assert.equal(question.structuredAnswer.expression, question.canonicalExpression);
    assert.equal(question.structuredAnswer.value, question.finalAnswer);
    assert.equal(typeof question.structuredAnswer.unit, "string");
    assert.equal(question.canonicalExpression.includes("\n"), false);
  }
});

test("S60H source, mode, family, depth and delta mutations are blocking", () => {
  const base = generateG5AU08ApplicationQuestion("ps_g5a_u08_app_discount_change", {
    seed: "identity-mutations",
    depth: "N_PLUS_1",
    contextType: "sdg",
  });

  const source = clone(base);
  source.sourceId = "wrong";
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(source), "G5A_U08_SOURCE_ID_MISMATCH"), true);

  const mode = clone(base);
  mode.mode = "numeric";
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(mode), "G5A_U08_MODE_MISMATCH"), true);

  const family = clone(base);
  family.templateFamilyId = "tf_wrong";
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(family), "G5A_U08_PATTERN_SPEC_MISMATCH"), true);

  const depth = clone(base);
  depth.depth = "N_PLUS_2";
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(depth), "G5A_U08_N_PLUS_2_FORBIDDEN_IN_CORE"), true);

  const delta = clone(base);
  delta.semanticDeltaIds = ["combine_groups"];
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(delta), "G5A_U08_SEMANTIC_DELTA_NOT_ALLOWED"), true);
});

test("S60H rejects SDG label-only and unsourced real-statistic mutations", () => {
  const base = generateG5AU08ApplicationQuestion("ps_g5a_u08_app_group_select", {
    seed: "sdg-mutations",
    depth: "N_PLUS_1",
    contextType: "sdg",
  });

  const labelOnly = clone(base);
  labelOnly.context.sdgActionAffectsMath = false;
  labelOnly.context.semanticRelevance = "環保";
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(labelOnly), "G5A_U08_SDG_LABEL_ONLY_CONTEXT"), true);

  const real = clone(base);
  real.context.dataStatus = "claimed_real_statistic";
  real.context.sourceRef = null;
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(real), "G5A_U08_REAL_STATISTIC_SOURCE_REQUIRED"), true);
});

test("S60H rejects impossible allocation and insufficient payment", () => {
  const grouped = clone(generateG5AU08ApplicationQuestion("ps_g5a_u08_app_group_select", {
    seed: "allocation-mutation",
    depth: "N_PLUS_1",
    contextType: "daily_life",
  }));
  grouped.roleBindings.selectedGroupCount = grouped.roleBindings.groupCount + 1;
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(grouped), "G5A_U08_IMPOSSIBLE_ALLOCATION"), true);

  const discount = clone(generateG5AU08ApplicationQuestion("ps_g5a_u08_app_discount_change", {
    seed: "payment-mutation",
    depth: "N_PLUS_1",
    contextType: "daily_life",
  }));
  discount.roleBindings.payment = 1;
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(discount), "G5A_U08_PAYMENT_INSUFFICIENT"), true);
});

test("S60H rejects average relation and transfer-direction mutations", () => {
  const inverse = clone(generateG5AU08ApplicationQuestion("ps_g5a_u08_app_average_inverse", {
    seed: "average-mutation",
    depth: "N_PLUS_1",
    contextType: "daily_life",
  }));
  inverse.roleBindings.missingValue += 1;
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(inverse), "G5A_U08_AVERAGE_CONTRACT_BROKEN"), true);

  const share = clone(generateG5AU08ApplicationQuestion("ps_g5a_u08_app_average_share_transfer", {
    seed: "transfer-mutation",
    depth: "N_PLUS_1",
    contextType: "daily_life",
  }));
  [share.structuredAnswer.from, share.structuredAnswer.to] = [share.structuredAnswer.to, share.structuredAnswer.from];
  assert.equal(hasCode(validateG5AU08ApplicationQuestion(share), "G5A_U08_ALLOCATION_TRANSFER_INCORRECT"), true);
});

test("S60H batch validator returns zero output when one semantic item is invalid", () => {
  const batch = clone(generateG5AU08ApplicationBatch({ questionCount: 73, seed: "zero-output", ordering: "shuffled" }));
  batch.questions[12].context.sdgActionAffectsMath = false;
  batch.questions[12].context.semanticRelevance = "標籤";
  const result = validateG5AU08ApplicationBatch(batch);
  assert.equal(result.valid, false);
  assert.equal(result.output, null);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.equal(result.errors.length > 0, true);
});

test("S60H rejects unsupported depth/context/spec and invalid batch bounds", () => {
  assert.throws(
    () => generateG5AU08ApplicationQuestion("ps_g5a_u08_app_direct_average", { depth: "N_PLUS_1", contextType: "daily_life" }),
    /DEPTH_UNSUPPORTED/,
  );
  assert.throws(
    () => generateG5AU08ApplicationQuestion("ps_g5a_u08_app_average_update", { depth: "N_PLUS_1", contextType: "daily_life" }),
    /CONTEXT_UNSUPPORTED/,
  );
  assert.throws(
    () => generateG5AU08ApplicationQuestion("ps_g5a_u08_mixed_precedence_3op"),
    /PATTERN_SPEC_UNSUPPORTED/,
  );
  assert.throws(() => generateG5AU08ApplicationBatch({ questionCount: 0 }), /QUESTION_COUNT_INVALID/);
  assert.throws(() => generateG5AU08ApplicationBatch({ questionCount: 1001 }), /QUESTION_COUNT_INVALID/);
  assert.throws(() => generateG5AU08ApplicationBatch({ questionCount: 10, selectedPatternSpecIds: [] }), /EMPTY_PATTERN_SELECTION/);
});
