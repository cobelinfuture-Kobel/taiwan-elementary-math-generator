import test from "node:test";
import assert from "node:assert/strict";

import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = "g3a_u03_3a03";
const rows = [
  ["kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry"],
  ["kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_10_multiple_by_1digit"],
  ["kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit", "ps_g3a_u03_3digit_by_1digit"],
  ["kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step", "ps_g3a_u03_consecutive_multiplication_two_step"]
];
const kpIds = rows.map((row) => row[0]);
const groupIds = rows.map((row) => row[1]);
const specIds = rows.map((row) => row[2]).sort();

test("S43G3A selector extension keeps original G3A U03 four KPs visible", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 26);
  assert.equal(availability.visibleCount, 7);
  assert.equal(availability.notSelectableCount, 0);
  for (const [kpId,, specId] of rows) {
    assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.sourceId, sourceId);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
  }
});

test("S43G3A resolver accepts original G3A U03 four-KP same-unit mix", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: kpIds, selectedPatternGroupIds: groupIds, questionCount: 8, generationSeed: "s43g3a" });
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.sourceIds, [sourceId]);
  assert.deepEqual(plan.knowledgePointIds, [...kpIds].sort());
  assert.deepEqual(plan.patternSpecIds, specIds);
  assert.equal(plan.allocation.reduce((sum, item) => sum + item.questionCount, 0), 8);
});

test("S43G3A original G3A U03 mixed worksheet, answer key, and HTML render", () => {
  const result = buildBatchABrowserWorksheetDocument({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: kpIds, selectedPatternGroupIds: groupIds, questionCount: 8, generationSeed: "s43g3a", includeAnswerKey: true });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, specIds);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {});
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
});
