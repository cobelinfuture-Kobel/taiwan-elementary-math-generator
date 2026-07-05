import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";

const SOURCE_ID = "g3a_u02_3a02";
const KP_ID = "kp_g3a_u02_estimate_nearest_thousand";
const GROUP_ID = "pg_g3a_u02_estimate_nearest_thousand";
const SPEC_ID = "ps_g3a_u02_estimate_nearest_thousand";

test("S43G2L selector extension exposes rounding KP", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 3);
  assert.equal(availability.visibleCount, 3);
  assert.equal(availability.notSelectableCount, 1);

  const visibleIds = listVisibleBatchAKnowledgePoints().map((entry) => entry.knowledgePointId);
  assert.equal(visibleIds.includes(KP_ID), true);
  assert.equal(getVisibleBatchAKnowledgePoint(KP_ID)?.displayName, "整千估算");
  assert.equal(getVisiblePatternGroupsForKnowledgePoint(KP_ID)[0]?.patternGroupId, GROUP_ID);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [SPEC_ID]);
});

test("S43G2L resolver accepts rounding KP as a single-KP selection", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 4,
    generationSeed: "s43g2l"
  });

  assert.equal(plan.ok, true);
  assert.deepEqual(plan.knowledgePointIds, [KP_ID]);
  assert.deepEqual(plan.patternGroupIds, [GROUP_ID]);
  assert.deepEqual(plan.patternSpecIds, [SPEC_ID]);
});

test("S43G2L rounding KP builds worksheet and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 6,
    generationSeed: "s43g2l",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 6);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === SPEC_ID), true);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.kind === "rounding"), true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 6);
  assert.equal(result.worksheetDocument.questionPages.length > 0, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length > 0, true);
});
