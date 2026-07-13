import test from "node:test";
import assert from "node:assert/strict";

import { generateG4AU08Phase2BItem as generateSourceItem } from "../../src/curriculum/g4a-u08/phase2b-extension-generator.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import {
  G4A_U08_CANONICAL_ROUTE_KINDS,
  classifyG4AU08CanonicalRouterPlan,
  normalizeG4AU08ResolverPlan,
  validateG4AU08CanonicalQuestion,
} from "../../site/modules/curriculum/batch-a/g4a-u08-canonical-router.js";
import {
  generateG4AU08Phase2BBrowserItem,
  getG4AU08Phase2BBrowserTemplateIds,
} from "../../site/modules/curriculum/batch-a/g4a-u08-phase2b-browser-runtime.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  validateG4AU08Phase2BVisibleSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  validateG4AU08Phase2BPromotionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-phase2b-promotion.js";
import { validateG4AU08WorksheetPromotionProjection } from "../../site/modules/curriculum/registry/g4a-u08-worksheet-promotion.js";

const SOURCE_ID = "g4a_u08_4a08";
const TEMPLATE_IDS = [
  "tpl_ext_comparison_chain",
  "tpl_ext_equal_value_unit_price",
  "tpl_ext_relative_difference",
  "tpl_ext_two_cost_component_payment",
];

function options(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "application",
    questionCount: 12,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s76j-g4a-u08",
    ...overrides,
  };
}

function recompute(question) {
  const o = question.operands;
  switch (question.legacyTemplateId) {
    case "tpl_ext_comparison_chain": return o[0] + o[1] - o[2];
    case "tpl_ext_equal_value_unit_price": return o[0] * o[1] / o[2];
    case "tpl_ext_relative_difference": return (o[1] - o[0]) * o[2];
    case "tpl_ext_two_cost_component_payment": return o[0] - (o[1] * o[2] + o[3] * o[4]);
    default: throw new Error(question.legacyTemplateId);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S76J reuses exactly 3 existing KnowledgePoints and promotes 4 PatternGroups and 4 PatternSpecs", () => {
  assert.equal(validateG4AU08Phase2BPromotionProjection().ok, true);
  assert.equal(validateG4AU08Phase2BVisibleSelectorProjection().ok, true);
  assert.equal(validateG4AU08WorksheetPromotionProjection().ok, true);
  assert.equal(G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.length, 3);
  assert.equal(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS.length, 4);
  assert.equal(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length, 4);
  assert.deepEqual(getG4AU08Phase2BBrowserTemplateIds(), TEMPLATE_IDS);
});

test("S76J selector extends approved existing KP rows without changing public KP counts", () => {
  const visible = listVisibleBatchAKnowledgePoints();
  assert.equal(visible.filter((row) => row.sourceId === SOURCE_ID).length, 8);
  for (const knowledgePointId of G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    assert.equal(row.sourceId, SOURCE_ID);
    assert.ok(row.promotionRegistryIds.includes(G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID));
    assert.ok(visible.some((candidate) => candidate.knowledgePointId === knowledgePointId));
  }
  assert.equal(getVisiblePatternGroupsForKnowledgePoint("kp_g4a_u08_app_add_sub_sequence").length, 2);
  assert.equal(getVisiblePatternGroupsForKnowledgePoint("kp_g4a_u08_app_mul_div_sequence").length, 3);
  assert.equal(getVisiblePatternGroupsForKnowledgePoint("kp_g4a_u08_app_mul_div_before_add_sub").length, 2);
  assert.ok(getVisibleBatchAKnowledgePoint("kp_g4b_u04_round_half_up_place_value"));
  assert.ok(getVisibleBatchAKnowledgePoint("kp_g5a_u08_mixed_operation_order"));
});

test("browser runtime remains deterministic and aligned with the S76I source generator", () => {
  for (const templateId of TEMPLATE_IDS) {
    for (const seed of [1, 12, 7601]) {
      const browser = generateG4AU08Phase2BBrowserItem({ templateId, seed });
      const source = generateSourceItem({ templateId, seed });
      assert.equal(browser.prompt, source.prompt, `${templateId}/${seed}`);
      assert.deepEqual(browser.operands, source.operands, `${templateId}/${seed}`);
      assert.deepEqual(browser.intermediateValues, source.intermediateValues, `${templateId}/${seed}`);
      assert.deepEqual(browser.semanticRelations, source.semanticRelations, `${templateId}/${seed}`);
      assert.deepEqual(browser.answerModel, source.answerModel, `${templateId}/${seed}`);
      assert.equal(browser.patternSpecId, source.patternSpecId, `${templateId}/${seed}`);
    }
  }
});

test("resolver derives all four explicitly selected authority groups and ignores public PatternSpec injection", () => {
  const plan = normalizeG4AU08ResolverPlan(buildBatchABrowserPlan(options({ patternSpecIds: ["ps_injected_forbidden"] })));
  assert.equal(plan.resolverResult.ok, true);
  assert.equal(classifyG4AU08CanonicalRouterPlan(plan), G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL);
  assert.deepEqual(new Set(plan.selectedPatternGroupIds), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(new Set(plan.patternSpecIds), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS));
  assert.equal(plan.publicPatternSpecInjectionUsed, false);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.equal(plan.allocation.reduce((sum, row) => sum + row.questionCount, 0), 12);
});

test("single KnowledgePoint selection allocates only explicitly selected linked Phase2B groups", () => {
  const selectedPatternGroupIds = [
    "pg_g4a_u08_ext_equal_value_unit_price",
    "pg_g4a_u08_ext_relative_difference",
  ];
  const plan = normalizeG4AU08ResolverPlan(buildBatchABrowserPlan(options({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4a_u08_app_mul_div_sequence"],
    selectedPatternGroupIds,
    questionCount: 7,
  })));
  assert.equal(plan.resolverResult.ok, true);
  assert.deepEqual(new Set(plan.selectedPatternGroupIds), new Set(selectedPatternGroupIds));
  assert.equal(plan.allocation.reduce((sum, row) => sum + row.questionCount, 0), 7);
});

test("canonical router generates blocking-validated public questions with exact arithmetic", () => {
  const result = generateBatchABrowserQuestions(options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 12);
  assert.deepEqual(new Set(result.questions.map((row) => row.patternGroupId)), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS));
  for (const question of result.questions) {
    assert.equal(question.phase, "S76J");
    assert.equal(question.selectorStatus, "visible");
    assert.equal(question.canonicalRouting, "enabled");
    assert.equal(question.productionUse, "preview_only_pending_s76k");
    assert.equal(question.answerModelShape, "numericAnswer");
    assert.equal(question.finalAnswer, recompute(question));
    assert.equal(validateG4AU08CanonicalQuestion(question).ok, true);
    assert.doesNotMatch(question.promptText, /\b(?:kp|pg|ps|tpl)_g4a_u08_/i);
  }
});

test("legacy G4A-U08 selections do not enter the S76J route", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4a_u08_app_mul_div_sequence"],
    selectedPatternGroupIds: ["pg_g4a_u08_app_mul_div_sequence"],
    questionCount: 8,
    generationSeed: "s76j-legacy-boundary",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 8);
  assert.ok(result.questions.every((question) => question.phase !== "S76J"));
});

test("canonical lifecycle mutation and cross-source selections are blocking with zero output", () => {
  const valid = generateBatchABrowserQuestions(options({ questionCount: 4 }));
  const mutated = clone(valid.questions[0]);
  mutated.productionUse = "production";
  assert.equal(validateG4AU08CanonicalQuestion(mutated).ok, false);

  const rejected = generateBatchABrowserQuestions(options({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g5a_u08_mixed_operation_order"],
    selectedPatternGroupIds: ["pg_g4a_u08_ext_comparison_chain"],
    questionCount: 4,
  }));
  assert.equal(rejected.ok, false);
  assert.deepEqual(rejected.questions, []);
});

test("worksheet allocation produces exact question, answer-key and page contracts without renderer changes", () => {
  const result = buildBatchABrowserWorksheetDocument(options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.schemaVersion, "worksheet-document-v1");
  assert.equal(document.productionUse, "preview_only_pending_s76k");
  assert.equal(document.rendererBehaviorChanged, false);
  assert.equal(document.generatedQuestions.length, 12);
  assert.equal(document.questionDisplayModels.length, 12);
  assert.equal(document.answerKeyItems.length, 12);
  assert.equal(document.summary.questionCount, 12);
  assert.equal(document.g4aU08Phase2BSummary.applicationQuestionCount, 12);
  assert.deepEqual(new Set(document.batchA.patternGroupIds), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(new Set(document.batchA.patternSpecIds), new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS));
  assert.ok(document.questionPages.length >= 1);
  assert.ok(document.answerKeyPages.length >= 1);
});

test("worksheet answer-key suppression and invalid source-unit Phase2B request remain bounded", () => {
  const noKey = buildBatchABrowserWorksheetDocument(options({ includeAnswerKey: false, questionCount: 5 }));
  assert.equal(noKey.ok, true);
  assert.equal(noKey.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(noKey.worksheetDocument.answerKeyPages.length, 0);

  const invalid = buildBatchABrowserWorksheetDocument(options({
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    questionCount: 5,
  }));
  assert.equal(invalid.ok, false);
  assert.equal(invalid.worksheetDocument, null);
});
