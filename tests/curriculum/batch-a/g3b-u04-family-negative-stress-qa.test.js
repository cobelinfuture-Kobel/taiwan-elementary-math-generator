import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_HIDDEN_SEMANTIC_MODE,
  generateG3BU04HiddenSemanticQuestions
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js";
import {
  G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04MultiplicativeSemanticQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js";
import {
  G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES,
  G3B_U04_SEMANTIC_WARNING_CODES
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator.js";
import {
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g3b-u04-extension.js";
import {
  getG3BU04SemanticPatternDefinition
} from "../../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";

const templateRegistry = JSON.parse(readFileSync(new URL(
  "../../../data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json",
  import.meta.url
), "utf8"));

function clone(value) {
  return structuredClone(value);
}

function generateDirect(patternSpecId, options = {}) {
  const input = {
    patternSpecId,
    seed: options.seed ?? `s57e7:${patternSpecId}`,
    sequenceNumber: options.sequenceNumber ?? 1,
    contextDomain: options.contextDomain
  };
  const result = isG3BU04StructuralSemanticPatternSpecId(patternSpecId)
    ? generateG3BU04StructuralSemanticQuestion(input)
    : generateG3BU04MultiplicativeSemanticQuestion(input);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

function hiddenOptions(overrides = {}) {
  return {
    sourceId: "g3b_u04_3b04",
    hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    questionCount: 32,
    generationSeed: "s57e7-aggregate",
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    ...overrides
  };
}

function expectRoutedCode(question, code) {
  const result = validateBatchABrowserQuestion(question);
  assert.equal(result.ok, false, `Expected routed blocking code ${code}`);
  assert.equal(result.errors.some((error) => error.code === code), true, JSON.stringify(result.errors, null, 2));
}

test("S57E7 independently confirms 32 families, 9 KnowledgePoints, and all 117 approved context variants", () => {
  assert.equal(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS.length, 32);
  assert.equal(G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.length, 25);
  assert.equal(G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.length, 7);
  assert.equal(new Set(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS).size, 32);

  const familyIds = new Set();
  const kpIds = new Set();
  const contextPairs = new Set();
  for (const [familyIndex, family] of templateRegistry.templateFamilies.entries()) {
    const patternSpecId = `ps_${family.templateFamilyId.slice(4)}`;
    assert.equal(G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS.includes(patternSpecId), true, patternSpecId);
    familyIds.add(family.templateFamilyId);
    kpIds.add(family.knowledgePointId);
    for (const [contextIndex, contextDomain] of family.contextDomains.entries()) {
      const question = generateDirect(patternSpecId, {
        seed: "s57e7-context-matrix",
        sequenceNumber: familyIndex * 10 + contextIndex + 1,
        contextDomain
      });
      const validation = validateBatchABrowserQuestion(question);
      assert.equal(validation.ok, true, `${patternSpecId}/${contextDomain}: ${JSON.stringify(validation.errors)}`);
      assert.equal(question.templateFamilyId, family.templateFamilyId);
      assert.equal(question.knowledgePointId, family.knowledgePointId);
      assert.equal(question.contextDomain, contextDomain);
      contextPairs.add(`${family.templateFamilyId}::${contextDomain}`);
    }
  }
  assert.equal(familyIds.size, 32);
  assert.equal(kpIds.size, 9);
  assert.equal(contextPairs.size, 117);
});

test("S57E7 aggregate route gives exact family coverage and fair allocation at 32, 257, and 1000 questions", () => {
  for (const questionCount of [32, 257, 1000]) {
    const result = generateG3BU04HiddenSemanticQuestions(hiddenOptions({
      questionCount,
      generationSeed: `s57e7-fair-${questionCount}`
    }));
    assert.equal(result.ok, true, `${questionCount}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, questionCount);
    assert.equal(result.allocation.length, 32);
    assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), questionCount);
    const counts = result.allocation.map((entry) => entry.questionCount);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    assert.equal(new Set(result.questions.map((question) => question.patternSpecId)).size, 32);
    assert.equal(new Set(result.questions.map((question) => question.knowledgePointId)).size, 9);
    assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
  }
});

test("S57E7 640-question replay is deterministic and exercises context variation within every multi-context family", () => {
  const options = hiddenOptions({
    questionCount: 640,
    generationSeed: "s57e7-640-replay",
    ordering: "shuffleAcrossPatterns"
  });
  const first = generateG3BU04HiddenSemanticQuestions(options);
  const replay = generateG3BU04HiddenSemanticQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(replay.ok, true, JSON.stringify(replay.errors));
  assert.deepEqual(replay.questions, first.questions);
  assert.equal(first.allocation.every((entry) => entry.questionCount === 20), true);
  assert.equal(validateBatchABrowserQuestions(first.questions).ok, true);

  const contextsByPattern = new Map();
  for (const question of first.questions) {
    if (!contextsByPattern.has(question.patternSpecId)) contextsByPattern.set(question.patternSpecId, new Set());
    contextsByPattern.get(question.patternSpecId).add(question.contextDomain);
  }
  for (const patternSpecId of G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS) {
    const approvedCount = getG3BU04SemanticPatternDefinition(patternSpecId).contextDomains.length;
    const observedCount = contextsByPattern.get(patternSpecId)?.size ?? 0;
    assert.ok(observedCount >= Math.min(2, approvedCount), `${patternSpecId}: observed ${observedCount}/${approvedCount}`);
  }
});

test("S57E7 routed validator rejects all 25 contract blocking codes", () => {
  const fixtures = new Map();
  const get = (id, context) => clone(generateDirect(id, { seed: `s57e7-negative:${id}`, sequenceNumber: 5, contextDomain: context }));

  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.templateFamilyId = "tpl_g3b_u04_unregistered";
    fixtures.set("G3B_U04_SEM_TEMPLATE_UNREGISTERED", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.knowledgePointId = "kp_g3b_u04_unregistered";
    fixtures.set("G3B_U04_SEM_KP_UNREGISTERED", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.equationModel = `${q.quantities.a} - ${q.quantities.b}`;
    fixtures.set("G3B_U04_SEM_EQUATION_SHAPE_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.unknownRole = "wrong_unknown";
    fixtures.set("G3B_U04_SEM_UNKNOWN_ROLE_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    delete q.quantityRoleBindings.a;
    fixtures.set("G3B_U04_SEM_QUANTITY_ROLE_MISSING", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.ownershipModel = "wrong_actor_scope";
    fixtures.set("G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.eventSequence.reverse();
    fixtures.set("G3B_U04_SEM_EVENT_ORDER_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.quantityRoleBindings.a.unitDimension = "currency";
    fixtures.set("G3B_U04_SEM_UNIT_FLOW_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.answerUnit = "元";
    fixtures.set("G3B_U04_SEM_ANSWER_UNIT_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold", "pudding");
    q.countNounModel = { answerClassifier: "隊" };
    fixtures.set("G3B_U04_SEM_COUNT_NOUN_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.quantities.a += 1;
    q.quantityRoleBindings.a.value = q.quantities.a;
    fixtures.set("G3B_U04_SEM_DIVISION_NOT_EXACT", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.quantities.a = 0;
    q.quantityRoleBindings.a.value = 0;
    fixtures.set("G3B_U04_SEM_NON_POSITIVE_OR_NEGATIVE_RESULT", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.quantities.a = 10001;
    q.quantityRoleBindings.a.value = 10001;
    fixtures.set("G3B_U04_SEM_RANGE_EXCEEDED", q);
  }
  {
    const q = get("ps_g3b_u04_mul_div_buy_get_free_average_price", "bakery");
    q.quantities.r = q.quantities.q;
    q.quantityRoleBindings.r.value = q.quantities.r;
    fixtures.set("G3B_U04_SEM_PROMOTION_INCONSISTENT", q);
  }
  {
    const q = get("ps_g3b_u04_sub_div_damage_loss_then_package", "eggs");
    q.eventSequence[0].result += 1;
    fixtures.set("G3B_U04_SEM_CONSERVATION_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_ratio_length_ratio_composition", "ribbon");
    q.relationshipDirection = "final_to_middle_then_middle_to_base";
    fixtures.set("G3B_U04_SEM_COMPARISON_DIRECTION_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_quantity_chain_production_capacity_chain", "printing");
    q.timePeriodModel.finalPeriod = "different_period";
    fixtures.set("G3B_U04_SEM_TIME_PERIOD_MISMATCH", q);
  }
  {
    const q = get("ps_g3b_u04_quantity_chain_age_ratio_chain", "family_age");
    q.ageModel.parentAge = 70;
    fixtures.set("G3B_U04_SEM_AGE_IMPLAUSIBLE", q);
  }
  {
    const q = get("ps_g3b_u04_sub_div_damage_loss_then_package", "eggs");
    q.quantities.c = 1;
    q.quantityRoleBindings.c.value = 1;
    fixtures.set("G3B_U04_SEM_PACKAGE_QUANTITY_IMPLAUSIBLE", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.contextDomain = "family_age";
    q.scenarioId = "scnprof_wrong__family_age";
    fixtures.set("G3B_U04_SEM_CONTEXT_OBJECT_INCOMPATIBLE", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.promptText = `那個人處理後，${q.promptText}`;
    q.blankedDisplayText = q.promptText;
    fixtures.set("G3B_U04_SEM_AMBIGUOUS_REFERENT", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.promptText = `${q.promptText} 另外還剩多少？`;
    q.blankedDisplayText = q.promptText;
    fixtures.set("G3B_U04_SEM_MULTIPLE_QUESTIONS_OR_UNKNOWNS", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.finalAnswer += 1;
    q.answerText = `${q.finalAnswer}${q.answerUnit}`;
    q.finalAnswerWithUnit = q.answerText;
    fixtures.set("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.semanticFamilyClaim = { claimedNew: true, duplicatesTemplateFamilyId: q.templateFamilyId };
    fixtures.set("G3B_U04_SEM_DUPLICATE_SIGNATURE", q);
  }
  {
    const q = get("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.sourceFieldId = "p1_r2_r";
    q.sourceLabelResolution = "unresolved_source_heading";
    fixtures.set("G3B_U04_SEM_SOURCE_LABEL_MISMATCH_UNRESOLVED", q);
  }

  assert.equal(fixtures.size, 25);
  assert.deepEqual(new Set(fixtures.keys()), new Set(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES));
  for (const [code, question] of fixtures) expectRoutedCode(question, code);
});

test("S57E7 confirms all three style warnings remain nonblocking through the routed validator", () => {
  const question = generateDirect("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", {
    seed: "s57e7-warnings",
    sequenceNumber: 1,
    contextDomain: "classroom"
  });
  const repeated = validateBatchABrowserQuestion(question, { recentPrompts: [question.promptText] });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.warnings.some((warning) => warning.code === "G3B_U04_STYLE_REPETITIVE_WORDING"), true);

  const imbalanced = validateBatchABrowserQuestion(question, {
    worksheetQuestions: Array.from({ length: 10 }, () => ({ contextDomain: "classroom" }))
  });
  assert.equal(imbalanced.ok, true);
  assert.equal(imbalanced.warnings.some((warning) => warning.code === "G3B_U04_STYLE_CONTEXT_IMBALANCE"), true);

  const long = validateBatchABrowserQuestion(question, { maxPromptLength: 10 });
  assert.equal(long.ok, true);
  assert.equal(long.warnings.some((warning) => warning.code === "G3B_U04_STYLE_LONG_SENTENCE"), true);
  assert.deepEqual(new Set([
    ...repeated.warnings,
    ...imbalanced.warnings,
    ...long.warnings
  ].map((warning) => warning.code)), new Set(G3B_U04_SEMANTIC_WARNING_CODES));
});

test("S57E7 hidden runtime remains hidden after later selector lifecycle promotion", () => {
  const selectorPath = new URL(
    "../../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js",
    import.meta.url
  );
  assert.equal(existsSync(selectorPath), true);
  const generated = generateG3BU04HiddenSemanticQuestions(hiddenOptions({ questionCount: 64 }));
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.plan.selectorStatus, "hidden");
  assert.equal(generated.plan.productionUse, "forbidden");
  assert.equal(generated.plan.publicProjectionChanged, false);
  assert.equal(generated.questions.every((question) => question.selectorStatus === "hidden"), true);
  assert.equal(generated.questions.every((question) => question.productionUse === "forbidden"), true);
});
