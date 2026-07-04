import test from "node:test";
import assert from "node:assert/strict";

import { BATCH_A_RESOLVER_ERROR_CODES, BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";

const SOURCE_ID = "g3a_u02_3a02";
const VISIBLE_KP_ID = "kp_g3a_u02_add_multi_carry";
const VISIBLE_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const VISIBLE_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";

test("S43C14 smoke: single visible KP creates worksheet, questions, and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 12,
    generationSeed: "s43c14-single-visible-kp-smoke",
    includeAnswerKey: true,
    ordering: "groupedByPattern",
    printLayout: { columns: 4, rowsPerPage: 10 }
  });

  assert.equal(result.ok, true);
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
  assert.equal(worksheet.answerKeyPages.length > 0, true);
  assert.deepEqual([...new Set(worksheet.generatedQuestions.map((question) => question.patternSpecId))], [VISIBLE_SPEC_ID]);

  const validation = validateBatchABrowserQuestions(worksheet.generatedQuestions);
  assert.equal(validation.ok, true);
  assert.deepEqual(validation.errors, []);
});

test("S43C14 smoke: sourceUnit path remains available and keeps source worksheet mode", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
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

test("S43C14 smoke: hidden and non-selectable ids remain rejected", () => {
  const hidden = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: ["kp_g3a_u02_sub_multi_borrow"],
    selectedPatternGroupIds: ["pg_g3a_u02_sub_multi_borrow_seed"],
    questionCount: 10
  });
  assert.equal(hidden.ok, false);
  assert.deepEqual(hidden.patternSpecIds, []);
  assert.deepEqual(hidden.allocation, []);
  assert.ok(hidden.errors.map((error) => error.code).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));

  const blocked = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: ["kp_g3a_u02_word_problem_estimation_add_sub"],
    selectedPatternGroupIds: ["pg_g3a_u02_word_problem_estimation_add_sub"],
    questionCount: 10
  });
  assert.equal(blocked.ok, false);
  assert.deepEqual(blocked.patternSpecIds, []);
  assert.deepEqual(blocked.allocation, []);
  assert.ok(blocked.errors.map((error) => error.code).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));
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
  assert.deepEqual(sameUnit.errors.map((error) => error.code), [BATCH_A_RESOLVER_ERROR_CODES.SAME_UNIT_MIXED_NOT_SUPPORTED_YET]);

  const crossUnit = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_GROUP_ID],
    questionCount: 10
  });
  assert.equal(crossUnit.ok, false);
  assert.deepEqual(crossUnit.errors.map((error) => error.code), [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
});
