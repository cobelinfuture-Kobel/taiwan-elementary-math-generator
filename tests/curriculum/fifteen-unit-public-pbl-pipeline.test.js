import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const PBL_SOURCE_IDS = Object.freeze([
  "g3b_u04_3b04",
  "g4a_u08_4a08",
  "g5a_u08_5a08",
  "g4b_u04_4b04",
  "g5a_u02_5a02",
]);

function pblPlan(sourceId) {
  return {
    sourceId,
    questionCount: 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `test-pbl-${sourceId}`,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode: "pbl",
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  };
}

test("five approved units materialize complete PBL worksheets through the public pipeline", () => {
  for (const sourceId of PBL_SOURCE_IDS) {
    const result = buildWorksheetDocumentFromPlan(pblPlan(sourceId));
    assert.equal(result.ok, true, `${sourceId} PBL result must pass: ${JSON.stringify(result.errors ?? [])}`);

    const document = result.worksheetDocument;
    assert.ok(document, `${sourceId} PBL worksheet document missing`);
    assert.equal(document.questionCount, 2);
    assert.equal(document.questionDisplayModels.length, 2);
    assert.equal(document.answerKeyItems.length, 2);
    assert.ok(document.questionPages.length > 0);
    assert.ok(document.answerKeyPages.length > 0);
    assert.equal(document.publicControls.questionMode, "pbl");
    assert.equal(document.metadata.globalContextRegistryId, "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1");
    assert.equal(document.metadata.productionUse, "allowed");
    assert.equal(document.pblTaskSetRecords.length, 2);
    assert.ok(document.pblTaskSetRecords.every((row) => row.completeProjection === true));
    assert.ok(document.pblTaskSetRecords.every((row) => row.arbitraryPageSplitAllowed === false));
    assert.ok(document.questions.every((row) => row.globalContextProduction?.runtimeResolvable === true));
    assert.ok(document.questions.every((row) => row.prompt.includes("PBL任務")));
    assert.equal(document.validationSummary.pblCompleteProjectionValidated, true);
  }
});
