import test from "node:test";
import assert from "node:assert/strict";

import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  generateG3BU04MultiplicativeSemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js";
import {
  validateG3BU04SemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  G3B_U04_HUMAN_SEMANTIC_QUALITY_V2,
  G3B_U04_HUMAN_SEMANTIC_QUALITY_V2_ERROR_CODES,
  applyG3BU04HumanSemanticQualityV2,
  validateG3BU04HumanSemanticQualityV2
} from "../../site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-quality-v2.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";

function raw(patternSpecId, contextDomain, sequenceNumber = 1) {
  const options = {
    patternSpecId,
    contextDomain,
    sequenceNumber,
    seed: `s57f7r1-quality-v2:${patternSpecId}:${contextDomain}`
  };
  const result = isG3BU04StructuralSemanticPatternSpecId(patternSpecId)
    ? generateG3BU04StructuralSemanticQuestion(options)
    : generateG3BU04MultiplicativeSemanticQuestion(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

function fixed(patternSpecId, contextDomain, sequenceNumber = 1) {
  return applyG3BU04HumanSemanticQualityV2(raw(patternSpecId, contextDomain, sequenceNumber));
}

function semanticGroupIds() {
  return G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

test("S57F7R1 quality v2 covers the full 32-family and 117-variant public language surface", () => {
  assert.equal(G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.familyCount, 32);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.familyContextVariantCount, 117);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.authorityMutationAllowed, false);

  const definitions = listG3BU04SemanticPatternDefinitions();
  const families = new Set();
  let variants = 0;
  for (const definition of definitions) {
    for (const contextDomain of definition.contextDomains) {
      variants += 1;
      const before = raw(definition.patternSpecId, contextDomain, variants);
      const authoritySnapshot = structuredClone(before);
      const question = applyG3BU04HumanSemanticQualityV2(before);
      families.add(question.patternSpecId);

      assert.deepEqual(before, authoritySnapshot, `${definition.patternSpecId}/${contextDomain} mutated authority output`);
      assert.equal(question.humanSemanticQuality.version, G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version);
      assert.equal(question.semanticSnapshot.humanSemanticQuality.version, G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version);
      assert.equal(validateG3BU04SemanticQuestion(question).ok, true, `${definition.patternSpecId}/${contextDomain}`);
      const quality = validateG3BU04HumanSemanticQualityV2(question);
      assert.equal(quality.ok, true, `${definition.patternSpecId}/${contextDomain}: ${JSON.stringify(quality.errors)}`);
    }
  }
  assert.equal(definitions.length, 32);
  assert.equal(families.size, 32);
  assert.equal(variants, 117);
});

test("S57F7R1 quality v2 fixes measured units, realistic per-recipient quantities, and contextual costs", () => {
  for (const [context, unit] of [["milk", "毫升"], ["juice", "毫升"], ["ribbon", "公分"], ["clay", "公克"]]) {
    const question = fixed("ps_g3b_u04_sub_div_used_amount_then_share", context);
    assert.equal(question.answerUnit, unit);
    assert.match(question.answerText, new RegExp(`${unit}$`));
    assert.match(question.promptText, new RegExp(`多少${unit}？$`));
  }

  const display = fixed("ps_g3b_u04_consecutive_length_width_layers_array", "display_array");
  assert.equal(display.answerUnit, "件");
  assert.match(display.promptText, /展示品/);
  assert.match(display.answerText, /件$/);

  const combinedSports = fixed("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "sports");
  assert.equal(combinedSports.finalAnswer <= 2, true);

  const sports = fixed("ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group", "sports");
  const technology = fixed("ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group", "technology");
  assert.equal(sports.finalAnswer <= 3, true);
  assert.equal(technology.finalAnswer <= 2, true);

  const ticketPrice = fixed("ps_g3b_u04_consecutive_unit_price_items_per_pack_packs", "tickets");
  assert.equal(ticketPrice.quantities.a >= 30, true);
  assert.match(ticketPrice.promptText, /每張門票50元/);
  assert.equal(ticketPrice.promptText.includes("undefined"), false);
  assert.match(ticketPrice.promptText, /每本有/);

  const budget = fixed("ps_g3b_u04_total_minus_share_personal_budget_minus_group_fee", "field_trip");
  assert.equal(budget.quantities.a >= 50, true);
  assert.match(budget.promptText, /活動預算/);
});

test("S57F7R1 quality v2 fixes shared activity scope and context lexicons", () => {
  const rental = fixed("ps_g3b_u04_add_divide_joint_purchase_equal_share", "equipment_rental");
  assert.match(rental.promptText, /帳篷租金/);
  assert.match(rental.promptText, /共同租用/);
  assert.equal(rental.promptText.includes("合買"), false);

  const tickets = fixed("ps_g3b_u04_add_divide_joint_purchase_equal_share", "tickets");
  assert.match(tickets.promptText, /人的門票費用共/);
  assert.match(tickets.promptText, /車票費用共/);

  const plant = fixed("ps_g3b_u04_consecutive_items_per_row_per_box", "plants");
  assert.match(plant.promptText, /展示架/);
  assert.equal(plant.promptText.includes("每箱"), false);

  const equivalence = fixed("ps_g3b_u04_quantity_chain_price_equivalence_chain", "tickets");
  assert.match(equivalence.promptText, /組車票套票/);
  assert.match(equivalence.promptText, /套門票套票/);
  assert.equal(equivalence.promptText.includes("本車票"), false);
  assert.equal(equivalence.promptText.includes("本門票"), false);

  const length = fixed("ps_g3b_u04_ratio_length_ratio_composition", "ribbon");
  assert.equal((length.promptText.match(/長度是/g) ?? []).length, 3);
});

test("S57F7R1 quality v2 exposes five additional blocking quality codes", () => {
  assert.equal(G3B_U04_HUMAN_SEMANTIC_QUALITY_V2_ERROR_CODES.length, 5);
  const fixtures = new Map();

  {
    const q = fixed("ps_g3b_u04_add_divide_joint_purchase_equal_share", "equipment_rental");
    q.promptText = `${q.quantities.c}人合買帳篷和睡袋，平均分擔，每人多少元？`;
    fixtures.set("G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR", q);
  }
  {
    const q = fixed("ps_g3b_u04_sub_div_used_amount_then_share", "milk");
    q.answerUnit = "瓶";
    q.answerText = `${q.finalAnswer}瓶`;
    q.semanticSnapshot.answerUnit = "瓶";
    fixtures.set("G3B_U04_READBACK_MEASURE_UNIT_MISMATCH", q);
  }
  {
    const q = fixed("ps_g3b_u04_consecutive_unit_price_items_per_pack_packs", "tickets");
    q.quantities.a = 2;
    fixtures.set("G3B_U04_READBACK_COST_IMPLAUSIBLE", q);
  }
  {
    const q = fixed("ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group", "technology");
    q.finalAnswer = 10;
    fixtures.set("G3B_U04_READBACK_PER_RECIPIENT_QUANTITY_IMPLAUSIBLE", q);
  }
  {
    const q = fixed("ps_g3b_u04_quantity_chain_price_equivalence_chain", "tickets");
    q.promptText = q.promptText.replaceAll("組車票套票", "本車票");
    fixtures.set("G3B_U04_READBACK_CONTEXT_LEXICON_UNNATURAL", q);
  }

  assert.deepEqual(new Set(fixtures.keys()), new Set(G3B_U04_HUMAN_SEMANTIC_QUALITY_V2_ERROR_CODES));
  for (const [code, question] of fixtures) {
    const result = validateG3BU04HumanSemanticQualityV2(question);
    assert.equal(result.ok, false, code);
    assert.equal(result.errors.some((error) => error.code === code), true, JSON.stringify(result.errors));
  }
});

test("S57F7R1 canonical public worksheet emits only quality-v2 accepted questions", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g3b_u04_3b04",
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: semanticGroupIds(),
    questionCount: 200,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f7r1-quality-v2-public",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 200);
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.humanSemanticQuality.version, G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version);
    assert.equal(validateG3BU04HumanSemanticQualityV2(question).ok, true);
  }
});
