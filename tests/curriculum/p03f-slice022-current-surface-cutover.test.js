import test from "node:test";
import assert from "node:assert/strict";
import { auditP03F22PublicSelectorComposition, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-p03f22-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f22-extension.js";
import { getCurrentPixelSourceSummary } from "../../site/pixel/pixel-registry-bridge.js";
import { G5A_U04_SLICE022_KP_IDS, G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID } from "../../site/modules/curriculum/registry/g5a-u04-rank7-fraction-selector-projection.js";

const options = { sourceId: "g5a_u04_5a04", selectedKnowledgePointIds: G5A_U04_SLICE022_KP_IDS,
  selectedPatternGroupIds: [G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID],
  questionMode: "numeric", questionCount: 24, generationSeed: "p03f22-current", includeAnswerKey: true,
  printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true } };

test("P03F22 Classic successor exposes four G5A-U04 KPs with three still hidden", () => {
  assert.equal(auditP03F22PublicSelectorComposition().ok, true);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource("g5a_u04_5a04").visibleCount, 4);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource("g5a_u04_5a04").hiddenPendingCount, 3);
  assert.deepEqual(G5A_U04_SLICE022_KP_IDS.map((id) => resolveVisiblePatternSpecIdsForKnowledgePoint(id).length), [3, 3]);
});

test("P03F22 shared worksheet emits 24 balanced questions and answers", () => {
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 24);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 24);
  assert.deepEqual(result.generation.allocation.map((row) => row.questionCount), [4, 4, 4, 4, 4, 4]);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
  assert.equal(result.worksheetDocument.questionPages.length, 3);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 3);
});

test("P03F22 Pixel current registry preserves the four-KP Slice022 successor while Slice029 adds the fifth G5A-U04 KP", () => {
  const summary = getCurrentPixelSourceSummary("g5a_u04_5a04");
  assert.equal(summary.visibleKnowledgePoints.length, 5);
  assert.deepEqual(summary.visibleKnowledgePoints.slice(2, 4).map((row) => row.knowledgePointId), G5A_U04_SLICE022_KP_IDS);
  assert.equal(summary.visibleKnowledgePoints[4].knowledgePointId, "kp_g5a_u04_unlike_fraction_compare");
});
