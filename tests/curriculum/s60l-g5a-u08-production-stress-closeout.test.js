import assert from "node:assert/strict";
import test from "node:test";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_LIFECYCLE,
  validateG5AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js";
import {
  G5A_U08_S60H_PATTERN_SPEC_IDS,
  SPEC_POLICY,
  generateG5AU08ApplicationQuestion,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-generator.js";

const PUBLIC_COUNTS = Object.freeze([1, 11, 29, 72, 120, 200]);
const EXTRA_STRESS_COUNT = 600;
const EXPECTED_TEMPLATE_FAMILIES = 10;
const EXPECTED_SEMANTIC_DELTAS = Object.freeze([
  "combine_groups",
  "discount_or_compensation",
  "adjust_unit_amount",
  "nested_grouping",
  "reverse_from_total",
  "reverse_from_average",
  "update_population",
]);

function options(questionCount, seed, overrides = {}) {
  return {
    sourceId: "g5a_u08_5a08",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    depthMode: "mixed",
    contextMode: "mixed",
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: seed,
    includeAnswerKey: true,
    ...overrides,
  };
}

function build(questionCount, seed, overrides = {}) {
  const result = buildBatchABrowserWorksheetDocument(options(questionCount, seed, overrides));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  assert.equal(result.worksheetDocument.generatedQuestions.length, questionCount);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, questionCount);
  assert.equal(result.worksheetDocument.answerKeyItems.length, questionCount);
  assert.equal(result.validation.errors.length, 0);
  return result.worksheetDocument;
}

test("S60L production promotion reaches D0 for G5A-U08 only", () => {
  const checked = validateG5AU08ProductionPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, { knowledgePoints: 11, patternGroups: 17, patternSpecs: 30 });
  assert.equal(G5A_U08_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G5A_U08_PRODUCTION_LIFECYCLE.distance, "D0_G5A_U08");
  assert.equal(G5A_U08_PRODUCTION_LIFECYCLE.requiredNextGate, "S60M_BatchA_AllUnitsProductionCloseout");
});

test("S60L public count matrix and cumulative stress exceed 1000 validated questions", () => {
  let cumulative = 0;
  for (const count of PUBLIC_COUNTS) {
    const document = build(count, `s60l-public-count-${count}`);
    cumulative += document.generatedQuestions.length;
    assert.equal(document.summary.questionCount, count);
    assert.equal(document.answerKeyItems.length, count);
  }
  const extra = build(EXTRA_STRESS_COUNT, "s60l-extra-600");
  cumulative += extra.generatedQuestions.length;
  assert.equal(cumulative, 1033);
  assert.ok(cumulative >= 1000);
});

test("S60L 120-question canonical worksheet reaches every promoted KP group and PatternSpec", () => {
  const document = build(120, "s60l-120-all-promoted", { ordering: "groupedByPattern" });
  const reachedKPs = new Set(document.generatedQuestions.map((row) => row.knowledgePointId));
  const reachedGroups = new Set(document.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId));
  const reachedSpecs = new Set(document.generatedQuestions.map((row) => row.patternSpecId));
  assert.deepEqual(reachedKPs, new Set(G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS));
  assert.deepEqual(reachedGroups, new Set(G5A_U08_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(reachedSpecs, new Set(G5A_U08_PROMOTED_PATTERN_SPEC_IDS));
  assert.equal(document.generatedQuestions.some((row) => row.mode === "numeric"), true);
  assert.equal(document.generatedQuestions.some((row) => row.mode === "application"), true);
  assert.equal(document.generatedQuestions.some((row) => row.mode === "reasoning"), true);
});

test("S60L reaches all application families, approved semantic deltas and both context types", () => {
  const families = new Set();
  const deltas = new Set();
  const contexts = new Set();
  for (const patternSpecId of G5A_U08_S60H_PATTERN_SPEC_IDS) {
    const policy = SPEC_POLICY[patternSpecId];
    families.add(policy.templateFamilyId);
    for (const depth of policy.depths) {
      for (const contextType of policy.contexts) {
        const question = generateG5AU08ApplicationQuestion(patternSpecId, {
          seed: `s60l-${patternSpecId}-${depth}-${contextType}`,
          depth,
          contextType,
        });
        contexts.add(question.context.contextType);
        for (const delta of question.semanticDeltaIds) deltas.add(delta);
        assert.equal(question.applicationText, true);
        assert.equal(question.context.dataStatus, "fictionalized_for_practice");
        assert.equal(question.context.sourceRef, null);
        assert.ok(question.answerText.length > 0);
      }
    }
  }
  assert.equal(families.size, EXPECTED_TEMPLATE_FAMILIES);
  assert.deepEqual(contexts, new Set(["daily_life", "sdg"]));
  assert.deepEqual(deltas, new Set(EXPECTED_SEMANTIC_DELTAS));
});

test("S60L application-only and reasoning-only production surfaces remain blocking validated", () => {
  const application = build(72, "s60l-application-sdg", {
    selectedKnowledgePointIds: [
      "kp_g5a_u08_mixed_operation_order",
      "kp_g5a_u08_mul_div_equivalent_regroup",
      "kp_g5a_u08_distributive_expand",
      "kp_g5a_u08_common_factor_extract",
      "kp_g5a_u08_near_round_multiply_compensation",
      "kp_g5a_u08_average_inverse_update",
    ],
    selectedPatternGroupIds: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.filter((id) => id.includes("application")),
    questionMode: "application",
    depthMode: "N_PLUS_1",
    contextMode: "sdg",
  });
  assert.equal(application.generatedQuestions.every((row) => row.applicationText === true), true);
  assert.equal(application.generatedQuestions.every((row) => row.context.contextType === "sdg"), true);
  assert.equal(application.generatedQuestions.every((row) => row.depth === "N_PLUS_1"), true);

  const reasoning = build(29, "s60l-reasoning", {
    selectedKnowledgePointIds: [
      "kp_g5a_u08_missing_operator_inference",
      "kp_g5a_u08_equivalence_error_judgement",
      "kp_g5a_u08_average_inverse_update",
    ],
    selectedPatternGroupIds: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.filter((id) => id.includes("reasoning")),
    questionMode: "reasoning",
    depthMode: "mixed",
    contextMode: "mixed",
  });
  assert.equal(reasoning.generatedQuestions.every((row) => row.mode === "reasoning"), true);
});
