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

function pblPlan(sourceId, overrides = {}) {
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
    ...overrides,
  };
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function promptSet(document) {
  return [...document.questions.map((row) => row.prompt)].sort();
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

test("PGC-R06 A04 gives all 12 G5A-U02 PBL routes deterministic cross-seed diversity at 20 questions", () => {
  const depths = ["basic", "extended", "mixed"];
  const contexts = ["abstract_math", "daily_life", "sdg", "mixed"];
  for (const depthMode of depths) {
    for (const contextMode of contexts) {
      const base = {
        questionCount: 20,
        depthMode,
        contextMode,
        printLayout: {
          paperSize: "A4",
          columns: 1,
          rowsPerPage: 20,
          showAnswerKeyPage: true,
          showQuestionNumbers: true,
        },
      };
      const firstPlan = pblPlan("g5a_u02_5a02", { ...base, generationSeed: "pgc-r06-a04-g5a-u02-01" });
      const secondPlan = pblPlan("g5a_u02_5a02", { ...base, generationSeed: "pgc-r06-a04-g5a-u02-02" });
      const first = buildWorksheetDocumentFromPlan(firstPlan);
      const firstReplay = buildWorksheetDocumentFromPlan(firstPlan);
      const second = buildWorksheetDocumentFromPlan(secondPlan);

      assert.equal(first.ok, true, `${depthMode}/${contextMode} first seed must pass`);
      assert.equal(firstReplay.ok, true, `${depthMode}/${contextMode} replay must pass`);
      assert.equal(second.ok, true, `${depthMode}/${contextMode} second seed must pass`);
      assert.deepEqual(promptSet(first.worksheetDocument), promptSet(firstReplay.worksheetDocument));
      assert.notDeepEqual(promptSet(first.worksheetDocument), promptSet(second.worksheetDocument));
      assert.equal(new Set(promptSet(first.worksheetDocument)).size, 20);
      assert.equal(new Set(promptSet(second.worksheetDocument)).size, 20);

      for (const document of [first.worksheetDocument, second.worksheetDocument]) {
        assert.equal(document.answerKeyItems.length, 20);
        assert.ok(document.questions.every((row) => row.patternSpecId === "pbl_g5a_u02_equal_group_design"));
        assert.ok(document.questions.every((row) => row.knowledgePointId === "kp_g5a_u02_common_factor"));
        for (const row of document.questions) {
          const { red, blue } = row.givenRoleValues;
          const greatestCommonFactor = gcd(red, blue);
          assert.ok(greatestCommonFactor >= 2);
          assert.ok(row.answerText.includes(`每包最多${greatestCommonFactor}張`));
        }
      }
    }
  }
});
