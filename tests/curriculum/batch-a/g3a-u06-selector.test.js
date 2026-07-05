import test from "node:test";
import assert from "node:assert/strict";

import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = ["g3a", "u06", "3a06"].join("_");
const suffixes = ["exact_division_check", "divisibility_exact_check"];
const kpIds = suffixes.map((suffix) => `kp_g3a_u06_${suffix}`);
const groupIds = suffixes.map((suffix) => `pg_g3a_u06_${suffix}`);
const rowSpecIds = suffixes.map((suffix) => `ps_g3a_u06_${suffix}`);
const planSpecIds = [...rowSpecIds].sort();

test("S43G4A G3A U06 selector QA", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 10);
  assert.equal(availability.visibleCount, 2);
  for (let index = 0; index < kpIds.length; index += 1) {
    assert.equal(getVisibleBatchAKnowledgePoint(kpIds[index])?.sourceId, sourceId);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpIds[index]), [rowSpecIds[index]]);
  }

  const plan = resolveVisiblePatternGroupSelection({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds,
    questionCount: 6
  });
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.patternSpecIds, planSpecIds);

  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds,
    questionCount: 6,
    generationSeed: "s43g4a",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 6);

  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {});
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
});
