import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromState } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../../site/assets/browser/state/config-state.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { evaluateG4AU08ApplicationEquationTokens } from "../../../site/modules/curriculum/batch-a/g4a-u08-application-generator.js";
import {
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const APP_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub"
]);
const APP_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_app_add_three_quantities",
  "ps_g4a_u08_app_add_then_subtract_state_change",
  "ps_g4a_u08_app_subtract_then_add_state_change",
  "ps_g4a_u08_app_subtract_twice_state_change",
  "ps_g4a_u08_app_adjusted_amount_then_subtract",
  "ps_g4a_u08_app_divide_by_group_product",
  "ps_g4a_u08_app_multiply_after_difference_then_add_sub",
  "ps_g4a_u08_app_multiply_then_share",
  "ps_g4a_u08_app_unit_rate_then_scale",
  "ps_g4a_u08_app_divide_then_divide",
  "ps_g4a_u08_app_payment_minus_unit_cost_times_quantity",
  "ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount"
]);
const FORBIDDEN_SEMANTIC_PHRASES = Object.freeze([
  "道路分成三批",
  "盒道路",
  "盒課程時間",
  "標準門票",
  "每次使用門票",
  "道路共有",
  "課程時間共有",
  "再鋸",
  "運動會2 份",
  "園藝課5 份",
  "籃球隊4 份",
  "共有 200 時",
  "共有200時",
  "用掉閱讀時間",
  "用掉練球時間",
  "用掉烘烤時間"
]);

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function appStateFor(kpIds, count = 48, ordering = "groupedByPattern") {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, true);
  state.batchA.ordering = ordering;
  setBatchASelectorSelection(state, {
    selectionMode: kpIds.length === 1 ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...kpIds],
    selectedPatternGroupIds: kpIds.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

function conversionCount(questions) {
  return questions.filter((question) => question.conversionRequired === true).length;
}

function assertNoForbiddenSemanticPhrase(questions) {
  const prompts = questions.map((question) => question.promptText).join("\n");
  for (const phrase of FORBIDDEN_SEMANTIC_PHRASES) assert.equal(prompts.includes(phrase), false, `${phrase} should not appear in Phase2A prompts`);
}

test("G4A-U08 Phase2A exposes four application KnowledgePoints and twelve PatternSpecs", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 8);
  const appKps = listVisibleBatchAKnowledgePoints().filter((kp) => APP_KP_IDS.includes(kp.knowledgePointId));
  assert.deepEqual(appKps.map((kp) => kp.knowledgePointId), APP_KP_IDS);
  const exposedSpecIds = appKps.flatMap((kp) => kp.patternSpecIds);
  assert.deepEqual(new Set(exposedSpecIds), new Set(APP_SPEC_IDS));
  for (const kpId of APP_KP_IDS) assert.ok(firstGroupId(kpId), `${kpId} should resolve to a visible PatternGroup`);
});

test("G4A-U08 Phase2A single-KP generation validates each application group", () => {
  for (const kpId of APP_KP_IDS) {
    const result = generateBatchABrowserQuestions({
      sourceId: SOURCE_ID,
      selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [kpId],
      selectedPatternGroupIds: [firstGroupId(kpId)],
      questionCount: 24,
      generationSeed: `s56g2r-${kpId}`
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 24);
    assert.equal(result.questions.every((question) => question.kind === "g4aU08ApplicationWordProblem"), true);
    assert.equal(result.questions.every((question) => question.phase === "Phase2A"), true);
    assert.equal(result.questions.every((question) => question.knowledgePointId === kpId), true);
    assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
  }
});

test("G4A-U08 Phase2A application equations recompute and keep equation-plus-answer fields", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...APP_KP_IDS],
    selectedPatternGroupIds: APP_KP_IDS.map(firstGroupId),
    questionCount: 60,
    generationSeed: "s56g2r-equation"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(APP_SPEC_IDS));
  for (const question of result.questions) {
    const evaluated = evaluateG4AU08ApplicationEquationTokens(question.equationTokens);
    assert.equal(evaluated.finalAnswer, question.finalAnswer);
    assert.equal(question.equationModel.length > 0, true);
    assert.equal(question.finalAnswerWithUnit, `${question.finalAnswer} ${question.finalUnitLabel}`);
    assert.equal(question.answerText, question.finalAnswerWithUnit);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("G4A-U08 Phase2A mixed application worksheet builds answer key and conversion overlay", () => {
  const result = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 60));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.generatedQuestions;
  assert.equal(questions.length, 60);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 60);
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(APP_SPEC_IDS));
  const converted = conversionCount(questions);
  assert.equal(converted >= 18 && converted <= 30, true);
  for (const question of questions) {
    if (question.conversionRequired) {
      assert.ok(question.conversionLine);
      assert.ok(question.conversionRule?.ruleId);
      assert.ok(question.convertedQuantities);
    } else {
      assert.equal(question.conversionRule, null);
      assert.equal(question.conversionLine, null);
      assert.equal(question.convertedQuantities, null);
    }
  }
});

test("G4A-U08 Phase2A scenario bank avoids invalid phrases and provides life-context diversity", () => {
  const result = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 60, "shuffleAcrossPatterns"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assertNoForbiddenSemanticPhrase(result.worksheetDocument.generatedQuestions);
  const sceneSet = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.metadata?.scenarioScene).filter(Boolean));
  const itemSet = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.metadata?.scenarioItem).filter(Boolean));
  assert.equal(sceneSet.size >= 10, true, `expected at least 10 scenes, got ${sceneSet.size}`);
  assert.equal(itemSet.size >= 12, true, `expected at least 12 scenario items, got ${itemSet.size}`);
  assert.equal([...sceneSet].some((scene) => ["美術課", "圖書館活動", "運動會補給站", "烘焙社", "校外教學", "閱讀課"].includes(scene)), true);
});

test("G4A-U08 Phase2A high-count generation supports single-KP and mixed worksheets", () => {
  for (const kpId of APP_KP_IDS) {
    const single = buildWorksheetDocumentFromState(appStateFor([kpId], 120, "groupedByPattern"));
    assert.equal(single.ok, true, JSON.stringify(single.errors));
    assert.equal(single.worksheetDocument.generatedQuestions.length, 120);
    assert.equal(single.worksheetDocument.answerKeyItems.length, 120);
    assert.equal(validateBatchABrowserQuestions(single.worksheetDocument.generatedQuestions).ok, true);
    assertNoForbiddenSemanticPhrase(single.worksheetDocument.generatedQuestions);
  }

  const mixed = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 200, "shuffleAcrossPatterns"));
  assert.equal(mixed.ok, true, JSON.stringify(mixed.errors));
  assert.equal(mixed.worksheetDocument.generatedQuestions.length, 200);
  assert.equal(mixed.worksheetDocument.answerKeyItems.length, 200);
  assert.equal(validateBatchABrowserQuestions(mixed.worksheetDocument.generatedQuestions).ok, true);
  assertNoForbiddenSemanticPhrase(mixed.worksheetDocument.generatedQuestions);
});

test("G4A-U08 Phase2A high-count prompts keep scenario quantities in user-facing ranges", () => {
  const result = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 200, "shuffleAcrossPatterns"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const prompts = result.worksheetDocument.generatedQuestions.map((question) => question.promptText).join("\n");
  assert.equal(/\d{4,}L/.test(prompts), false, "large L quantities should not appear in prompts");
  assert.equal(/\d{4,}kg/.test(prompts), false, "large kg quantities should not appear in prompts");
  assert.equal(/\d{3,}時/.test(prompts), false, "large hour quantities should not appear in prompts");
  assert.equal(/\d{4,}(條|張|本|個|顆|人)/.test(prompts), false, "large count-item quantities should not appear in prompts");
});

test("G4A-U08 Phase2A validator rejects corrupted application fields", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [APP_KP_IDS[0]],
    selectedPatternGroupIds: [firstGroupId(APP_KP_IDS[0])],
    questionCount: 20,
    generationSeed: "s56g2r-corrupt"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const baseQuestion = result.questions[0];
  assert.equal(validateBatchABrowserQuestion({ ...baseQuestion, finalAnswer: baseQuestion.finalAnswer + 1 }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...baseQuestion, unitLabel: "bad-unit" }).ok, false);

  const conversionQuestion = result.questions.find((question) => question.conversionRequired === true);
  assert.ok(conversionQuestion);
  assert.equal(validateBatchABrowserQuestion({ ...conversionQuestion, conversionRule: { ...conversionQuestion.conversionRule, ruleId: "bad_rule" } }).ok, false);
});

test("G4A-U08 Phase2A shuffle changes application render order", () => {
  const grouped = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 48, "groupedByPattern"));
  const shuffled = buildWorksheetDocumentFromState(appStateFor(APP_KP_IDS, 48, "shuffleAcrossPatterns"));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(new Set(grouped.worksheetDocument.generatedQuestions.map((question) => question.id)), new Set(shuffled.worksheetDocument.generatedQuestions.map((question) => question.id)));
  assert.notDeepEqual(grouped.worksheetDocument.generatedQuestions.map((question) => question.id), shuffled.worksheetDocument.generatedQuestions.map((question) => question.id));
});