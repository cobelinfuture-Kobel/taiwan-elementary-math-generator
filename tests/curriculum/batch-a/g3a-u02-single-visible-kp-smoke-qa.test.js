import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-candidates.js";
import { parseQueryState } from "../../../site/assets/browser/state/query-state.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const SOURCE_ID = "g3a_u02_3a02";
const VISIBLE_KP_ID = "kp_g3a_u02_add_multi_carry";
const VISIBLE_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const VISIBLE_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";
const HIDDEN_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const HIDDEN_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const D_ROW_KP_ID = "kp_g3a_u02_word_problem_estimation_add_sub";
const D_ROW_GROUP_ID = "pg_g3a_u02_word_problem_estimation_add_sub";

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

function buildSingleVisibleKpWorksheet(questionCount = 12) {
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount,
    generationSeed: `s43c14-single-visible-kp-${questionCount}`,
    includeAnswerKey: true,
    ordering: "groupedByPattern",
    printLayout: { columns: 4, rowsPerPage: 10 }
  });
}

test("S43C14 smoke: exactly one G3A-U02 visible KP is exposed", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 1);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount, 1);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, 2);
  assert.deepEqual(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID], {
    sourceId: SOURCE_ID,
    visibleCount: 1,
    hiddenPendingCount: 1,
    notSelectableCount: 2
  });

  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  assert.deepEqual(visibleKnowledgePoints.map((entry) => entry.knowledgePointId), [VISIBLE_KP_ID]);
  assert.deepEqual(
    getVisiblePatternGroupsForKnowledgePoint(VISIBLE_KP_ID).map((entry) => entry.patternGroupId),
    [VISIBLE_GROUP_ID]
  );
});

test("S43C14 smoke: single visible KP plan resolves to only add-multi-carry", () => {
  const plan = buildBatchABrowserPlan({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43c14-plan"
  });

  assert.equal(plan.worksheetMode, "batchAKnowledgePoint");
  assert.deepEqual(plan.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(plan.selectedPatternGroupIds, [VISIBLE_GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [VISIBLE_SPEC_ID]);
  assert.deepEqual(plan.allocation, [{
    patternGroupId: VISIBLE_GROUP_ID,
    patternSpecId: VISIBLE_SPEC_ID,
    questionCount: 12
  }]);
});

test("S43C14 smoke: single visible KP generation creates validated questions", () => {
  const generated = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43c14-generation"
  });

  assert.equal(generated.ok, true);
  assert.deepEqual(generated.errors, []);
  assert.equal(generated.questions.length, 12);
  assert.deepEqual([...new Set(generated.questions.map((question) => question.patternSpecId))], [VISIBLE_SPEC_ID]);
  assert.deepEqual([...new Set(generated.questions.map((question) => question.metadata.patternId))], [VISIBLE_SPEC_ID]);
  assert.deepEqual([...new Set(generated.questions.map((question) => question.sourceId))], [SOURCE_ID]);

  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true);
  assert.deepEqual(validation.errors, []);
});

test("S43C14 smoke: single visible KP creates worksheet, answer key, and renderable HTML", () => {
  const result = buildSingleVisibleKpWorksheet(12);

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  const worksheet = result.worksheetDocument;
  assert.equal(worksheet.generationContext.generationMode, "batchAKnowledgePoint");
  assert.equal(worksheet.configSnapshot.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(worksheet.configSnapshot.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(worksheet.configSnapshot.selectedPatternGroupIds, [VISIBLE_GROUP_ID]);
  assert.deepEqual(worksheet.batchA.knowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(worksheet.batchA.patternGroupIds, [VISIBLE_GROUP_ID]);
  assert.deepEqual(worksheet.batchA.patternSpecIds, [VISIBLE_SPEC_ID]);
  assert.equal(worksheet.summary.questionCount, 12);
  assert.equal(worksheet.generatedQuestions.length, 12);
  assert.equal(worksheet.questionDisplayModels.length, 12);
  assert.equal(worksheet.answerKeyItems.length, 12);
  assert.equal(worksheet.questionPages.length > 0, true);
  assert.equal(worksheet.answerKeyPages.length > 0, true);
  assert.deepEqual([...new Set(worksheet.generatedQuestions.map((question) => question.patternSpecId))], [VISIBLE_SPEC_ID]);

  for (const [index, answerKeyItem] of worksheet.answerKeyItems.entries()) {
    assert.equal(answerKeyItem.questionNumber, index + 1);
    assert.equal(answerKeyItem.patternId, VISIBLE_SPEC_ID);
    assert.equal(typeof answerKeyItem.answerText, "string");
    assert.equal(answerKeyItem.answerText.length > 0, true);
  }

  const html = renderWorksheetDocumentToHtml(worksheet, {
    title: worksheet.title,
    stylesheetHref: "./assets/styles/print-styles.css",
    debugDataAttributes: true
  });
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.match(html, new RegExp(`data-pattern-id="${VISIBLE_SPEC_ID}"`));
});

test("S43C14 smoke: visible KP survives query while D-row query falls back", () => {
  const visible = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${VISIBLE_KP_ID}&pg=${VISIBLE_GROUP_ID}&questionCount=12`);
  assert.equal(visible.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(visible.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(visible.selectedPatternGroupIds, [VISIBLE_GROUP_ID]);
  assert.deepEqual(visible.selectorWarnings, []);

  const blocked = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${D_ROW_KP_ID}&pg=${D_ROW_GROUP_ID}&questionCount=12`);
  assert.equal(blocked.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(blocked.selectedKnowledgePointIds, []);
  assert.deepEqual(blocked.selectedPatternGroupIds, []);
  assert.ok(blocked.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
  assert.ok(blocked.selectorWarnings.some((warning) => warning.code === "selector_mode_fallback"));
});

test("S43C14 smoke: hidden and non-selectable ids remain rejected", () => {
  const hidden = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [HIDDEN_KP_ID],
    selectedPatternGroupIds: [HIDDEN_GROUP_ID],
    questionCount: 10
  });
  assert.equal(hidden.ok, false);
  assert.deepEqual(hidden.patternSpecIds, []);
  assert.deepEqual(hidden.allocation, []);
  assert.ok(errorCodes(hidden).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));

  const blocked = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [D_ROW_KP_ID],
    selectedPatternGroupIds: [D_ROW_GROUP_ID],
    questionCount: 10
  });
  assert.equal(blocked.ok, false);
  assert.deepEqual(blocked.patternSpecIds, []);
  assert.deepEqual(blocked.allocation, []);
  assert.ok(errorCodes(blocked).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));
});

test("S43C14 smoke: sourceUnit path remains available and keeps source worksheet mode", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 10,
    generationSeed: "s43c14-source-unit-smoke",
    includeAnswerKey: true,
    ordering: "groupedByPattern",
    printLayout: { columns: 4, rowsPerPage: 10 }
  });

  assert.equal(result.ok, true);
  const worksheet = result.worksheetDocument;
  assert.equal(worksheet.generationContext.generationMode, "batchASourceId");
  assert.equal(worksheet.configSnapshot.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(worksheet.configSnapshot.selectedKnowledgePointIds, []);
  assert.deepEqual(worksheet.configSnapshot.selectedPatternGroupIds, []);
  assert.deepEqual(worksheet.batchA.knowledgePointIds, []);
  assert.deepEqual(worksheet.batchA.patternSpecIds, [
    "ps_g3a_u02_4digit_add_multi_carry",
    "ps_g3a_u02_4digit_sub_multi_borrow"
  ]);
  assert.equal(worksheet.generatedQuestions.length, 10);
  assert.equal(worksheet.answerKeyItems.length, 10);
});

test("S43C14 smoke: mixed KP modes remain deferred before their gates", () => {
  const sameUnit = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 10
  });
  assert.equal(sameUnit.ok, false);
  assert.deepEqual(errorCodes(sameUnit), [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED]);
  assert.deepEqual(sameUnit.patternSpecIds, []);
  assert.deepEqual(sameUnit.allocation, []);

  const crossUnit = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 10
  });
  assert.equal(crossUnit.ok, false);
  assert.deepEqual(errorCodes(crossUnit), [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
  assert.deepEqual(crossUnit.patternSpecIds, []);
  assert.deepEqual(crossUnit.allocation, []);
});
