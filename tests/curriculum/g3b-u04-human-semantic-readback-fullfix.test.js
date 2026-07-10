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
  G3B_U04_HUMAN_SEMANTIC_BLOCKING_ERROR_CODES,
  G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX,
  applyG3BU04HumanSemanticReadbackFullFix,
  validateG3BU04HumanSemanticReadback
} from "../../site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-fullfix.js";
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
import {
  validateBatchABrowserQuestion
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js";

function generate(patternSpecId, contextDomain, sequenceNumber = 1) {
  const options = {
    patternSpecId,
    contextDomain,
    sequenceNumber,
    seed: `s57f7r1-test:${patternSpecId}:${contextDomain}`
  };
  const result = isG3BU04StructuralSemanticPatternSpecId(patternSpecId)
    ? generateG3BU04StructuralSemanticQuestion(options)
    : generateG3BU04MultiplicativeSemanticQuestion(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

function fixed(patternSpecId, contextDomain, sequenceNumber = 1) {
  return applyG3BU04HumanSemanticReadbackFullFix(generate(patternSpecId, contextDomain, sequenceNumber));
}

function expectReadbackCode(question, code) {
  const result = validateG3BU04HumanSemanticReadback(question);
  assert.equal(result.ok, false, code);
  assert.equal(result.errors.some((error) => error.code === code), true, JSON.stringify(result.errors, null, 2));
}

function semanticGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

test("S57F7R1 locks the 32-family, 117-variant human semantic FullFix contract", () => {
  assert.equal(G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.status, "human_semantic_readback_fullfix_applied");
  assert.equal(G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.auditedFamilyCount, 32);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.auditedFamilyContextVariantCount, 117);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.authorityMutationAllowed, false);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.productionOverlayOnly, true);
  assert.equal(G3B_U04_HUMAN_SEMANTIC_BLOCKING_ERROR_CODES.length, 10);
  assert.equal(new Set(G3B_U04_HUMAN_SEMANTIC_BLOCKING_ERROR_CODES).size, 10);
});

test("S57F7R1 applies the FullFix to all 117 family-context variants without mutating hidden authority questions", () => {
  const definitions = listG3BU04SemanticPatternDefinitions();
  let variantCount = 0;
  const reachedFamilies = new Set();

  for (const definition of definitions) {
    for (const contextDomain of definition.contextDomains) {
      variantCount += 1;
      const raw = generate(definition.patternSpecId, contextDomain, variantCount);
      const rawSnapshot = structuredClone(raw);
      const question = applyG3BU04HumanSemanticReadbackFullFix(raw);
      reachedFamilies.add(question.patternSpecId);

      assert.deepEqual(raw, rawSnapshot, `${definition.patternSpecId}/${contextDomain} mutated hidden authority output`);
      assert.notEqual(question, raw);
      assert.equal(question.humanSemanticReadback.fullFixApplied, true);
      assert.equal(question.humanSemanticReadback.authorityMutated, false);
      assert.equal(question.semanticSnapshot.humanSemanticReadback.fullFixApplied, true);
      assert.equal(question.promptText.includes("兩批共"), false);
      assert.equal(question.promptText.includes("和另外的人共"), false);
      assert.equal(question.promptText.includes("每段時間"), false);
      assert.equal(question.promptText.includes("罐飲料罐"), false);
      assert.equal(question.promptText.includes("新做好的"), false);

      const semantic = validateG3BU04SemanticQuestion(question);
      const readback = validateG3BU04HumanSemanticReadback(question);
      assert.equal(semantic.ok, true, `${definition.patternSpecId}/${contextDomain}: ${JSON.stringify(semantic.errors)}`);
      assert.equal(readback.ok, true, `${definition.patternSpecId}/${contextDomain}: ${JSON.stringify(readback.errors)}`);
    }
  }

  assert.equal(definitions.length, 32);
  assert.equal(reachedFamilies.size, 32);
  assert.equal(variantCount, 117);
});

test("S57F7R1 repairs the known human-readback defect classes at their production source", () => {
  const batches = fixed("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
  assert.match(batches.promptText, /第一批\d+支鉛筆和第二批\d+支鉛筆/);

  const participant = fixed("ps_g3b_u04_total_minus_share_wallet_minus_shared_purchase", "cake");
  assert.match(participant.promptText, /小安和其他人共\d+人/);

  const price = fixed("ps_g3b_u04_quantity_chain_price_equivalence_chain", "school_store");
  assert.equal((price.promptText.match(/價錢等於/g) ?? []).length, 2);
  assert.match(price.promptText, /每支鉛筆\d+元/);
  assert.equal(price.promptText.includes("一樣多"), false);

  const production = fixed("ps_g3b_u04_quantity_chain_production_capacity_chain", "printing");
  assert.equal((production.promptText.match(/每小時/g) ?? []).length, 4);
  assert.equal(production.timePeriodModel.label, "每小時");

  const beverage = fixed("ps_g3b_u04_consecutive_items_per_row_per_box", "beverages");
  assert.match(beverage.promptText, /罐飲料/);
  assert.equal(beverage.promptText.includes("飲料罐"), false);

  const sportsEquipment = fixed("ps_g3b_u04_sub_div_reserved_amount_then_distribute", "sports_equipment");
  assert.equal(sportsEquipment.answerUnit, "件");
  assert.match(sportsEquipment.answerText, /件$/);
  assert.match(sportsEquipment.promptText, /件器材/);

  const technology = fixed("ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group", "technology");
  assert.equal(technology.quantities.a / technology.quantities.b <= 3, true);
  assert.equal(technology.quantities.c <= 2, true);
  assert.equal(technology.finalAnswer <= 5, true);
  assert.match(technology.promptText, /臺平板/);

  const newStock = fixed("ps_g3b_u04_div_add_new_packages_plus_existing_stock", "books");
  assert.match(newStock.promptText, /新準備的/);
  assert.equal(newStock.promptText.includes("新做好的"), false);

  const capacity = fixed("ps_g3b_u04_ratio_capacity_ratio_composition", "bottles");
  assert.equal((capacity.promptText.match(/容量是/g) ?? []).length, 3);

  const weight = fixed("ps_g3b_u04_ratio_weight_ratio_composition", "parcels");
  assert.equal((weight.promptText.match(/重量是/g) ?? []).length, 3);

  const promotion = fixed("ps_g3b_u04_add_divide_promotion_total_equal_share", "food");
  assert.match(promotion.promptText, /一起分享/);
  assert.match(promotion.promptText, /平均分擔總費用/);

  const storage = fixed("ps_g3b_u04_consecutive_length_width_layers_array", "storage_grid");
  const display = fixed("ps_g3b_u04_consecutive_length_width_layers_array", "display_array");
  assert.match(storage.promptText, /收納盒/);
  assert.match(display.promptText, /展示品/);
});

test("S57F7R1 blocks all ten human semantic readback defect codes with targeted mutations", () => {
  const fixtures = new Map();

  {
    const q = fixed("ps_g3b_u04_add_divide_combined_inventory_equal_distribution", "classroom");
    q.promptText = `老師把兩批共${q.quantities.a}和${q.quantities.b}支鉛筆合在一起，平均分給${q.quantities.c}位學生，每位分到多少支？`;
    fixtures.set("G3B_U04_READBACK_BATCH_QUANTITIES_AMBIGUOUS", q);
  }
  {
    const q = fixed("ps_g3b_u04_total_minus_share_wallet_minus_shared_purchase", "cake");
    q.promptText = q.promptText.replace(`和其他人共${q.quantities.c}人`, `和另外的人共${q.quantities.c}人`);
    fixtures.set("G3B_U04_READBACK_PARTICIPANT_SCOPE_AMBIGUOUS", q);
  }
  {
    const q = fixed("ps_g3b_u04_quantity_chain_price_equivalence_chain", "bakery");
    q.promptText = q.promptText.replaceAll("的價錢等於", "和").replaceAll("的價錢，", "一樣多，");
    fixtures.set("G3B_U04_READBACK_EQUIVALENCE_DIMENSION_MISSING", q);
  }
  {
    const q = fixed("ps_g3b_u04_quantity_chain_production_capacity_chain", "printing");
    q.promptText = q.promptText.replaceAll("每小時", "每段時間");
    q.timePeriodModel.label = "每段時間";
    fixtures.set("G3B_U04_READBACK_COMMON_PERIOD_UNDEFINED", q);
  }
  {
    const q = fixed("ps_g3b_u04_consecutive_items_per_row_per_box", "beverages");
    q.promptText = q.promptText.replaceAll("罐飲料", "罐飲料罐");
    fixtures.set("G3B_U04_READBACK_CLASSIFIER_OBJECT_DUPLICATED", q);
  }
  {
    const q = fixed("ps_g3b_u04_sub_div_reserved_amount_then_distribute", "sports_equipment");
    q.answerUnit = "公斤";
    q.answerText = `${q.finalAnswer}公斤`;
    q.semanticSnapshot.answerUnit = "公斤";
    fixtures.set("G3B_U04_READBACK_ANSWER_UNIT_ROLE_MISMATCH", q);
  }
  {
    const q = fixed("ps_g3b_u04_div_add_new_packages_plus_existing_stock", "books");
    q.promptText = q.promptText.replace("新準備的", "新做好的");
    fixtures.set("G3B_U04_READBACK_CONTEXT_ACTION_INCOMPATIBLE", q);
  }
  {
    const q = fixed("ps_g3b_u04_add_divide_promotion_total_equal_share", "food");
    q.promptText = `${q.quantities.a}元再加${q.quantities.b}元可以多拿一份，${q.quantities.c}人平均分擔，每人要付多少元？`;
    fixtures.set("G3B_U04_READBACK_PROMOTION_OWNERSHIP_UNCLEAR", q);
  }
  {
    const q = fixed("ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group", "technology");
    q.quantities.c = 11;
    q.finalAnswer = q.quantities.a / q.quantities.b + q.quantities.c;
    fixtures.set("G3B_U04_READBACK_CONTEXT_QUANTITY_IMPLAUSIBLE", q);
  }
  {
    const q = fixed("ps_g3b_u04_ratio_capacity_ratio_composition", "bottles");
    q.promptText = q.promptText.replace("大水瓶的容量是中水瓶", "大水瓶是中水瓶");
    fixtures.set("G3B_U04_READBACK_RELATION_DIMENSION_IMPLICIT", q);
  }

  assert.deepEqual(new Set(fixtures.keys()), new Set(G3B_U04_HUMAN_SEMANTIC_BLOCKING_ERROR_CODES));
  for (const [code, question] of fixtures) expectReadbackCode(question, code);
});

test("S57F7R1 canonical public production emits only readback-accepted semantic questions", () => {
  const options = {
    sourceId: "g3b_u04_3b04",
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: semanticGroupIdsForKnowledgePoints(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS),
    questionCount: 200,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f7r1-public-production",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  };
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 200);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.humanSemanticReadback.fullFixApplied, true);
    assert.equal(validateG3BU04HumanSemanticReadback(question).ok, true);
    const canonical = validateBatchABrowserQuestion(question);
    assert.equal(canonical.ok, true, JSON.stringify(canonical.errors));
    assert.equal(canonical.stages.some((stage) => stage.stage === "human_semantic_readback" && stage.ok), true);
  }
});
