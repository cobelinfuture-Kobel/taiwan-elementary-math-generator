import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04MultiplicativeSemanticQuestion,
  isG3BU04MultiplicativeSemanticPatternSpecId
} from "../../../site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js";
import {
  getG3BU04SemanticPatternDefinition
} from "../../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES,
  G3B_U04_SEMANTIC_VALIDATION_STAGES,
  G3B_U04_SEMANTIC_WARNING_CODES,
  validateG3BU04SemanticQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator.js";

const contract = JSON.parse(readFileSync(new URL(
  "../../../data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json",
  import.meta.url
), "utf8"));

function generate(patternSpecId, options = {}) {
  const common = {
    patternSpecId,
    seed: options.seed ?? "s57e5-positive",
    sequenceNumber: options.sequenceNumber ?? 1,
    contextDomain: options.contextDomain
  };
  const result = isG3BU04StructuralSemanticPatternSpecId(patternSpecId)
    ? generateG3BU04StructuralSemanticQuestion(common)
    : generateG3BU04MultiplicativeSemanticQuestion(common);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

function clone(value) {
  return structuredClone(value);
}

function expectCode(question, code, options = {}) {
  const result = validateG3BU04SemanticQuestion(question, options);
  assert.equal(result.ok, false, `Expected blocking code ${code}`);
  assert.equal(result.errors.some((error) => error.code === code), true, JSON.stringify(result.errors, null, 2));
  return result;
}

function base(patternSpecId, contextDomain = undefined) {
  return generate(patternSpecId, { seed: `negative:${patternSpecId}`, sequenceNumber: 3, contextDomain });
}

test("S57E5 contract projection exposes exactly eight stages, 25 blocking codes, and three nonblocking warnings", () => {
  assert.deepEqual(G3B_U04_SEMANTIC_VALIDATION_STAGES, contract.validationStages.map((entry) => entry.stage));
  assert.deepEqual(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES, contract.blockingErrorCodes.map((entry) => entry.code));
  assert.deepEqual(G3B_U04_SEMANTIC_WARNING_CODES, contract.warningCodes.map((entry) => entry.code));
  assert.equal(G3B_U04_SEMANTIC_VALIDATION_STAGES.length, 8);
  assert.equal(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES.length, 25);
  assert.equal(new Set(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES).size, 25);
  assert.equal(G3B_U04_SEMANTIC_WARNING_CODES.length, 3);
  assert.equal(contract.validationPolicy.semanticErrorsAreBlocking, true);
});

test("S57E5 accepts all 32 registered semantic families through all eight stages", () => {
  const ids = [...G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS, ...G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS];
  assert.equal(ids.length, 32);
  for (const [index, patternSpecId] of ids.entries()) {
    const question = generate(patternSpecId, { seed: "s57e5-all-families", sequenceNumber: index + 1 });
    const result = validateG3BU04SemanticQuestion(question);
    assert.equal(result.ok, true, `${patternSpecId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.errors.length, 0);
    assert.equal(result.stages.length, 8);
    assert.equal(result.stages.every((stage) => stage.ok), true, `${patternSpecId}: ${JSON.stringify(result.stages)}`);
    assert.equal(result.semanticErrorsAreBlocking, true);
    assert.equal(result.styleWarningsAreBlocking, false);
    assert.equal(result.validatorVersion, "s57e5-g3b-u04-semantic-validator-v1");
  }
});

test("S57E5 accepts all 117 approved family-context variants", () => {
  const ids = [...G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS, ...G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS];
  let count = 0;
  for (const patternSpecId of ids) {
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    for (const [contextIndex, contextDomain] of spec.contextDomains.entries()) {
      const question = generate(patternSpecId, {
        seed: "s57e5-context-matrix",
        sequenceNumber: contextIndex + 1,
        contextDomain
      });
      const result = validateG3BU04SemanticQuestion(question);
      assert.equal(result.ok, true, `${patternSpecId}/${contextDomain}: ${JSON.stringify(result.errors)}`);
      count += 1;
    }
  }
  assert.equal(count, 117);
});

test("S57E5 blocks every approved semantic error code with a targeted mutation", () => {
  const fixtures = new Map();

  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.templateFamilyId = "tpl_g3b_u04_unregistered";
    fixtures.set("G3B_U04_SEM_TEMPLATE_UNREGISTERED", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.knowledgePointId = "kp_g3b_u04_unregistered";
    fixtures.set("G3B_U04_SEM_KP_UNREGISTERED", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.equationModel = `${q.quantities.a} - ${q.quantities.b}`;
    fixtures.set("G3B_U04_SEM_EQUATION_SHAPE_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.unknownRole = "wrong_unknown";
    fixtures.set("G3B_U04_SEM_UNKNOWN_ROLE_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    delete q.quantityRoleBindings.a;
    fixtures.set("G3B_U04_SEM_QUANTITY_ROLE_MISSING", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.ownershipModel = "wrong_actor_scope";
    fixtures.set("G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.eventSequence.reverse();
    fixtures.set("G3B_U04_SEM_EVENT_ORDER_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.quantityRoleBindings.a.unitDimension = "currency";
    fixtures.set("G3B_U04_SEM_UNIT_FLOW_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.answerUnit = "元";
    fixtures.set("G3B_U04_SEM_ANSWER_UNIT_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold", "pudding"));
    q.countNounModel = { answerClassifier: "隊" };
    fixtures.set("G3B_U04_SEM_COUNT_NOUN_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.quantities.a += 1;
    q.quantityRoleBindings.a.value = q.quantities.a;
    fixtures.set("G3B_U04_SEM_DIVISION_NOT_EXACT", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.quantities.a = 0;
    q.quantityRoleBindings.a.value = 0;
    fixtures.set("G3B_U04_SEM_NON_POSITIVE_OR_NEGATIVE_RESULT", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.quantities.a = 10001;
    q.quantityRoleBindings.a.value = 10001;
    fixtures.set("G3B_U04_SEM_RANGE_EXCEEDED", q);
  }
  {
    const q = clone(base("ps_g3b_u04_mul_div_buy_get_free_average_price", "bakery"));
    q.quantities.r = q.quantities.q;
    q.quantityRoleBindings.r.value = q.quantities.r;
    fixtures.set("G3B_U04_SEM_PROMOTION_INCONSISTENT", q);
  }
  {
    const q = clone(base("ps_g3b_u04_sub_div_damage_loss_then_package", "eggs"));
    q.eventSequence[0].result += 1;
    fixtures.set("G3B_U04_SEM_CONSERVATION_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_ratio_length_ratio_composition", "ribbon"));
    q.relationshipDirection = "final_to_middle_then_middle_to_base";
    fixtures.set("G3B_U04_SEM_COMPARISON_DIRECTION_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_quantity_chain_production_capacity_chain", "printing"));
    q.timePeriodModel.finalPeriod = "different_period";
    fixtures.set("G3B_U04_SEM_TIME_PERIOD_MISMATCH", q);
  }
  {
    const q = clone(base("ps_g3b_u04_quantity_chain_age_ratio_chain", "family_age"));
    q.ageModel.parentAge = 70;
    fixtures.set("G3B_U04_SEM_AGE_IMPLAUSIBLE", q);
  }
  {
    const q = clone(base("ps_g3b_u04_sub_div_damage_loss_then_package", "eggs"));
    q.quantities.c = 1;
    q.quantityRoleBindings.c.value = 1;
    fixtures.set("G3B_U04_SEM_PACKAGE_QUANTITY_IMPLAUSIBLE", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.contextDomain = "family_age";
    q.scenarioId = "scnprof_wrong__family_age";
    fixtures.set("G3B_U04_SEM_CONTEXT_OBJECT_INCOMPATIBLE", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.promptText = `那個人把材料分給大家，${q.promptText}`;
    q.blankedDisplayText = q.promptText;
    fixtures.set("G3B_U04_SEM_AMBIGUOUS_REFERENT", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.promptText = `${q.promptText} 另外還剩多少？`;
    q.blankedDisplayText = q.promptText;
    fixtures.set("G3B_U04_SEM_MULTIPLE_QUESTIONS_OR_UNKNOWNS", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.finalAnswer += 1;
    q.answerText = `${q.finalAnswer}${q.answerUnit}`;
    q.finalAnswerWithUnit = q.answerText;
    fixtures.set("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.semanticFamilyClaim = {
      claimedNew: true,
      duplicatesTemplateFamilyId: q.templateFamilyId
    };
    fixtures.set("G3B_U04_SEM_DUPLICATE_SIGNATURE", q);
  }
  {
    const q = clone(base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom"));
    q.sourceFieldId = "p1_r2_r";
    q.sourceLabelResolution = "unresolved_source_heading";
    fixtures.set("G3B_U04_SEM_SOURCE_LABEL_MISMATCH_UNRESOLVED", q);
  }

  assert.equal(fixtures.size, 25);
  assert.deepEqual(new Set(fixtures.keys()), new Set(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES));
  for (const [code, question] of fixtures) expectCode(question, code);
});

test("S57E5 semantic errors remain blocking even when the numeric answer is unchanged", () => {
  const baseQuestion = base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
  const mutations = [
    ["G3B_U04_SEM_ACTOR_OWNERSHIP_MISMATCH", (q) => { q.ownershipModel = "wrong_actor_scope"; }],
    ["G3B_U04_SEM_EVENT_ORDER_MISMATCH", (q) => { q.eventSequence.reverse(); }],
    ["G3B_U04_SEM_UNIT_FLOW_MISMATCH", (q) => { q.quantityRoleBindings.a.unitDimension = "currency"; }],
    ["G3B_U04_SEM_AMBIGUOUS_REFERENT", (q) => { q.promptText = `那個人處理後，${q.promptText}`; q.blankedDisplayText = q.promptText; }]
  ];
  for (const [code, mutate] of mutations) {
    const question = clone(baseQuestion);
    const originalAnswer = question.finalAnswer;
    mutate(question);
    assert.equal(question.finalAnswer, originalAnswer);
    const result = expectCode(question, code);
    assert.equal(result.semanticErrorsAreBlocking, true);
  }
});

test("S57E5 style warnings are emitted but do not block valid questions", () => {
  const question = base("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
  const repeated = validateG3BU04SemanticQuestion(question, { recentPrompts: [question.promptText] });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.warnings.some((warning) => warning.code === "G3B_U04_STYLE_REPETITIVE_WORDING"), true);

  const imbalanced = validateG3BU04SemanticQuestion(question, {
    worksheetQuestions: Array.from({ length: 10 }, () => ({ contextDomain: "classroom" }))
  });
  assert.equal(imbalanced.ok, true);
  assert.equal(imbalanced.warnings.some((warning) => warning.code === "G3B_U04_STYLE_CONTEXT_IMBALANCE"), true);

  const long = validateG3BU04SemanticQuestion(question, { maxPromptLength: 10 });
  assert.equal(long.ok, true);
  assert.equal(long.warnings.some((warning) => warning.code === "G3B_U04_STYLE_LONG_SENTENCE"), true);
  assert.equal(long.styleWarningsAreBlocking, false);
});
