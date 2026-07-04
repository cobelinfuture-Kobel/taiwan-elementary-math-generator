import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";

const SOURCE_ID = "g3a_u02_3a02";
const VISIBLE_KP_ID = "kp_g3a_u02_add_multi_carry";
const VISIBLE_PATTERN_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const VISIBLE_PATTERN_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";

test("S43C13 single visible KP plan uses resolver allocation", () => {
  const plan = buildBatchABrowserPlan({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_PATTERN_GROUP_ID],
    questionCount: 7,
    generationSeed: "s43c13-plan"
  });

  assert.equal(plan.worksheetMode, "batchAKnowledgePoint");
  assert.equal(plan.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(plan.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(plan.selectedPatternGroupIds, [VISIBLE_PATTERN_GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [VISIBLE_PATTERN_SPEC_ID]);
  assert.deepEqual(plan.allocation, [{
    patternGroupId: VISIBLE_PATTERN_GROUP_ID,
    patternSpecId: VISIBLE_PATTERN_SPEC_ID,
    questionCount: 7
  }]);
});

test("S43C13 single visible KP generation produces only add-multi-carry questions", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_PATTERN_GROUP_ID],
    questionCount: 7,
    generationSeed: "s43c13-generation"
  });

  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 7);
  assert.deepEqual([...new Set(result.questions.map((question) => question.patternSpecId))], [VISIBLE_PATTERN_SPEC_ID]);
  assert.deepEqual(result.allocation, [{
    patternGroupId: VISIBLE_PATTERN_GROUP_ID,
    patternSpecId: VISIBLE_PATTERN_SPEC_ID,
    questionCount: 7
  }]);
});

test("S43C13 worksheet document records visible KP mode metadata", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [VISIBLE_KP_ID],
    selectedPatternGroupIds: [VISIBLE_PATTERN_GROUP_ID],
    questionCount: 7,
    generationSeed: "s43c13-worksheet",
    includeAnswerKey: true,
    printLayout: { columns: 4, rowsPerPage: 10 }
  });

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.generationContext.generationMode, "batchAKnowledgePoint");
  assert.equal(result.worksheetDocument.configSnapshot.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(result.worksheetDocument.configSnapshot.selectedKnowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(result.worksheetDocument.configSnapshot.selectedPatternGroupIds, [VISIBLE_PATTERN_GROUP_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, [VISIBLE_KP_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.patternGroupIds, [VISIBLE_PATTERN_GROUP_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, [VISIBLE_PATTERN_SPEC_ID]);
});

test("S43C13 sourceUnit generation remains unaffected", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 10,
    generationSeed: "s43c13-source-unit"
  });

  assert.equal(result.ok, true);
  assert.equal(result.plan.worksheetMode, "batchASource");
  assert.deepEqual(result.plan.patternSpecIds, [
    "ps_g3a_u02_4digit_add_multi_carry",
    "ps_g3a_u02_4digit_sub_multi_borrow"
  ]);
  assert.equal(result.questions.length, 10);
});
