import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildG5AU02BrowserDynamicWorksheet as buildSourceWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { buildG5AU02BrowserDynamicWorksheet as buildBundledWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const SOURCE_ID = "g5a_u02_5a02";
const RENDERER_PROFILE = "g5a_u02_s104_p0_integrated_v1";
const CONTRACT = JSON.parse(readFileSync(new URL("../../data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json", import.meta.url), "utf8"));
const P0_PATTERNS = Object.freeze(CONTRACT.patternContracts.map((row) => row.patternSpecId));
const EXPECTED_KIND = new Map(CONTRACT.patternContracts.map((row) => [row.patternSpecId, row.requiredDisplayModelKind]));

function printableDocument(document) {
  return {
    ...document,
    questionPages: [{
      pageNumber: 1,
      columns: 1,
      rowsPerPage: 1,
      cells: document.questionDisplayModels.map((displayModel) => ({
        cellType: "question",
        questionNumber: displayModel.questionNumber,
        displayModel,
      })),
    }],
    answerKeyPages: [{
      pageNumber: 1,
      columns: 1,
      rowsPerPage: 1,
      cells: document.answerKeyItems.map((answerKeyItem) => ({
        cellType: "answerKey",
        answerKeyItem,
      })),
    }],
  };
}

function build(builder, patternSpecId, seed) {
  const result = builder({
    sourceId: SOURCE_ID,
    patternSpecIds: [patternSpecId],
    questionCount: 1,
    generationSeed: seed,
    includeAnswerKey: true,
    questionRowsPerPage: 1,
    answerRowsPerPage: 1,
  });
  assert.equal(result?.ok, true, `${patternSpecId}:${seed}:${result?.errors?.join(",")}`);
  return result.worksheetDocument;
}

test("S104 contract locks exactly the 12 approved P0 patterns and matrices", () => {
  assert.equal(P0_PATTERNS.length, 12);
  assert.deepEqual(CONTRACT.implementationMilestones.find((row) => row.milestoneId === "S104")?.patternOrders, [1, 2, 4, 8, 9, 11, 13, 16, 17, 20, 21, 22]);
  assert.equal(CONTRACT.acceptance.focusedGeneration.scenarioCount, 768);
  assert.equal(CONTRACT.acceptance.layoutMatrix.scenarioCount, 216);
  assert.equal(CONTRACT.acceptance.answerBoundaryMatrix.scenarioCount, 72);
  assert.equal(CONTRACT.acceptance.all22SemanticD0AfterP0, false);
});

test("S104 12-pattern x 64-seed canonical-to-bundle-to-renderer matrix passes 768/768", () => {
  let passCount = 0;
  for (const patternSpecId of P0_PATTERNS) {
    for (let seed = 1; seed <= 64; seed += 1) {
      const sourceDocument = build(buildSourceWorksheet, patternSpecId, seed);
      const bundledDocument = build(buildBundledWorksheet, patternSpecId, seed);
      assert.deepEqual(bundledDocument, sourceDocument, `bundle drift:${patternSpecId}:${seed}`);
      assert.equal(bundledDocument.questionCount, 1);
      assert.equal(bundledDocument.questionItems.length, 1);
      assert.equal(bundledDocument.answerKeyItems.length, 1);
      assert.equal(bundledDocument.questionItems[0].patternSpecId, patternSpecId);
      assert.equal(bundledDocument.questionItems[0].questionDisplayModel?.kind, EXPECTED_KIND.get(patternSpecId));
      assert.equal(bundledDocument.questionItems[0].promptCompletenessStatus, "visible_unique_solution_data_complete");

      const projected = projectG5AU02DynamicDocumentForGlobalLayout({
        ok: true,
        errors: [],
        worksheetDocument: bundledDocument,
      });
      assert.equal(projected?.ok, true, `${patternSpecId}:${seed}:${projected?.errors?.join(",")}`);
      const publicDocument = projected.worksheetDocument;
      assert.equal(publicDocument.questionDisplayModels.length, 1);
      assert.equal(publicDocument.answerKeyItems.length, 1);
      assert.equal(publicDocument.questionDisplayModels[0].questionDisplayModel?.kind, EXPECTED_KIND.get(patternSpecId));
      assert.equal(publicDocument.answerKeyItems[0].questionDisplayModel?.kind, EXPECTED_KIND.get(patternSpecId));
      assert.ok(publicDocument.answerKeyItems[0].answerText.length > 0);

      const html = renderWorksheetDocumentToHtml(printableDocument(publicDocument), { stylesheetHref: "" });
      assert.match(html, new RegExp(`data-renderer-profile="${RENDERER_PROFILE}"`));
      assert.match(html, /data-layout-columns="1" data-layout-rows="1"/);
      assert.match(html, /worksheet-section--questions/);
      assert.match(html, /worksheet-section--answer-key/);
      assert.ok(html.includes(`data-semantic-kind="${EXPECTED_KIND.get(patternSpecId)}"`));
      assert.doesNotMatch(html, /\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/i);

      if (patternSpecId === "ps_g5a_u02_multi_constraint_digit_code") {
        assert.equal(bundledDocument.questionItems[0].questionDisplayModel.profileId, "generated_unique_code_v1");
        assert.notEqual(bundledDocument.answerKeyItems[0].structuredAnswer.value, 1725);
      }
      passCount += 1;
    }
  }
  assert.equal(passCount, 768);
});
