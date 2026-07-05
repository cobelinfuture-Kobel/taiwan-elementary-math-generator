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
const ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const ADD_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const ADD_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";
const SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const SUB_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const SUB_SPEC_ID = "ps_g3a_u02_4digit_sub_multi_borrow";
const D_ROW_KP_ID = "kp_g3a_u02_word_problem_estimation_add_sub";
const D_ROW_GROUP_ID = "pg_g3a_u02_word_problem_estimation_add_sub";

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

function buildSingleKpWorksheet({ kpId = ADD_KP_ID, groupId = ADD_GROUP_ID, questionCount = 12 } = {}) {
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount,
    generationSeed: `s43g2-phase1-single-kp-${kpId}-${questionCount}`,
    includeAnswerKey: true,
    ordering: "groupedByPattern",
    printLayout: { columns: 4, rowsPerPage: 10 }
  });
}

test("S43G2 Phase 1 smoke: two G3A-U02 visible KPs are exposed", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 2);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, 2);
  assert.deepEqual(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID], {
    sourceId: SOURCE_ID,
    visibleCount: 2,
    hiddenPendingCount: 0,
    notSelectableCount: 2
  });

  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  assert.deepEqual(visibleKnowledgePoints.map((entry) => entry.knowledgePointId), [ADD_KP_ID, SUB_KP_ID]);
  assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(ADD_KP_ID).map((entry) => entry.patternGroupId), [ADD_GROUP_ID]);
  assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(SUB_KP_ID).map((entry) => entry.patternGroupId), [SUB_GROUP_ID]);
});

test("S43G2 Phase 1 smoke: add single-KP plan resolves to only add-multi-carry", () => {
  const plan = buildBatchABrowserPlan({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43g2-plan-add"
  });

  assert.equal(plan.worksheetMode, "batchAKnowledgePoint");
  assert.deepEqual(plan.selectedKnowledgePointIds, [ADD_KP_ID]);
  assert.deepEqual(plan.selectedPatternGroupIds, [ADD_GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [ADD_SPEC_ID]);
});

test("S43G2 Phase 1 smoke: subtraction single-KP plan resolves to only subtraction regroup", () => {
  const plan = buildBatchABrowserPlan({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [SUB_KP_ID],
    selectedPatternGroupIds: [SUB_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43g2-plan-sub"
  });

  assert.equal(plan.worksheetMode, "batchAKnowledgePoint");
  assert.deepEqual(plan.selectedKnowledgePointIds, [SUB_KP_ID]);
  assert.deepEqual(plan.selectedPatternGroupIds, [SUB_GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [SUB_SPEC_ID]);
});

test("S43G2 Phase 1 smoke: add single-KP generation creates validated questions", () => {
  const generated = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43g2-generation-add"
  });

  assert.equal(generated.ok, true);
  assert.deepEqual(generated.errors, []);
  assert.equal(generated.questions.length, 12);
  assert.deepEqual([...new Set(generated.questions.map((question) => question.patternSpecId))], [ADD_SPEC_ID]);

  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true);
  assert.deepEqual(validation.errors, []);
});

test("S43G2 Phase 1 smoke: worksheet, answer key, and renderable HTML remain available", () => {
  const result = buildSingleKpWorksheet({ kpId: ADD_KP_ID, groupId: ADD_GROUP_ID, questionCount: 12 });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  const worksheet = result.worksheetDocument;
  assert.equal(worksheet.generationContext.generationMode, "batchAKnowledgePoint");
  assert.equal(worksheet.configSnapshot.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(worksheet.configSnapshot.selectedKnowledgePointIds, [ADD_KP_ID]);
  assert.deepEqual(worksheet.configSnapshot.selectedPatternGroupIds, [ADD_GROUP_ID]);
  assert.deepEqual(worksheet.batchA.knowledgePointIds, [ADD_KP_ID]);
  assert.deepEqual(worksheet.batchA.patternGroupIds, [ADD_GROUP_ID]);
  assert.deepEqual(worksheet.batchA.patternSpecIds, [ADD_SPEC_ID]);
  assert.equal(worksheet.summary.questionCount, 12);
  assert.equal(worksheet.generatedQuestions.length, 12);
  assert.equal(worksheet.questionDisplayModels.length, 12);
  assert.equal(worksheet.answerKeyItems.length, 12);
  assert.equal(worksheet.questionPages.length > 0, true);
  assert.equal(worksheet.answerKeyPages.length > 0, true);

  const html = renderWorksheetDocumentToHtml(worksheet, {
    title: worksheet.title,
    stylesheetHref: "./assets/styles/print-styles.css",
    debugDataAttributes: true
  });
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.match(html, new RegExp(`data-pattern-id="${ADD_SPEC_ID}"`));
});

test("S43G2 Phase 1 smoke: visible KP survives query while D-row query falls back", () => {
  const visible = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${SUB_KP_ID}&pg=${SUB_GROUP_ID}&questionCount=12`);
  assert.equal(visible.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(visible.selectedKnowledgePointIds, [SUB_KP_ID]);
  assert.deepEqual(visible.selectedPatternGroupIds, [SUB_GROUP_ID]);
  assert.deepEqual(visible.selectorWarnings, []);

  const blocked = parseQueryState(`?sourceId=${SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${D_ROW_KP_ID}&pg=${D_ROW_GROUP_ID}&questionCount=12`);
  assert.equal(blocked.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(blocked.selectedKnowledgePointIds, []);
  assert.deepEqual(blocked.selectedPatternGroupIds, []);
  assert.ok(blocked.selectorWarnings.some((warning) => warning.code === "selector_id_dropped"));
  assert.ok(blocked.selectorWarnings.some((warning) => warning.code === "selector_mode_fallback"));
});

test("S43G2 Phase 1 smoke: D-row ids remain rejected", () => {
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

test("S43G2 Phase 1 smoke: sourceUnit path remains available and keeps source worksheet mode", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 10,
    generationSeed: "s43g2-source-unit-smoke",
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
  assert.deepEqual(worksheet.batchA.patternSpecIds, [ADD_SPEC_ID, SUB_SPEC_ID]);
  assert.equal(worksheet.generatedQuestions.length, 10);
  assert.equal(worksheet.answerKeyItems.length, 10);
});

test("S43G2 Phase 1 smoke: same-unit mixed KP mode is available", () => {
  const sameUnit = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [ADD_KP_ID, SUB_KP_ID],
    questionCount: 10
  });
  assert.equal(sameUnit.ok, true);
  assert.deepEqual(sameUnit.knowledgePointIds, [ADD_KP_ID, SUB_KP_ID]);
  assert.deepEqual(sameUnit.patternSpecIds, [ADD_SPEC_ID, SUB_SPEC_ID]);

  const crossUnit = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [ADD_KP_ID, SUB_KP_ID],
    questionCount: 10
  });
  assert.equal(crossUnit.ok, false);
  assert.deepEqual(errorCodes(crossUnit), [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
  assert.deepEqual(crossUnit.patternSpecIds, []);
  assert.deepEqual(crossUnit.allocation, []);
});
