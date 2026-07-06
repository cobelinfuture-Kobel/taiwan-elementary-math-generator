import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, getVisiblePatternGroupsForKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u01_3a01";
const KP_ID = "kp_g3a_u01_4digit_compare";
const GROUP_ID = "pg_g3a_u01_4digit_compare";
const SPEC_ID = "ps_g3a_u01_4digit_compare";

test("S43E1 G3A U01 exposes four-digit comparison KP", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 24);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 1);
  const kp = getVisibleBatchAKnowledgePoint(KP_ID);
  assert.equal(kp.sourceId, SOURCE_ID);
  assert.equal(kp.displayName, "四位數比大小");
  assert.deepEqual(kp.patternSpecIds, [SPEC_ID]);
  const groups = getVisiblePatternGroupsForKnowledgePoint(KP_ID);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].patternGroupId, GROUP_ID);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [SPEC_ID]);
});

test("S43E1 G3A U01 resolver accepts single comparison KP", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 8,
    generationSeed: "s43e1-g3a-u01"
  });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, [KP_ID]);
  assert.deepEqual(plan.patternSpecIds, [SPEC_ID]);
});

test("S43E1 G3A U01 comparison worksheet is printable and valid", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s43e1-g3a-u01-printable",
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.batchA.sourceId, SOURCE_ID);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.patternSpecId, SPEC_ID);
    assert.equal(question.sourceId, SOURCE_ID);
    assert.equal(question.kind, "comparison");
    assert.equal(question.left >= 1000 && question.left <= 9999, true);
    assert.equal(question.right >= 1000 && question.right <= 9999, true);
    assert.equal([">", "<", "="].includes(question.answerText), true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});
