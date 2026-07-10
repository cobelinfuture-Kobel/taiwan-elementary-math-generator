import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const CLASSIC_INDEX_PATH = new URL("../../site/index.html", import.meta.url);
const CLASSIC_FALLBACK_PATH = new URL("../../site/404.html", import.meta.url);
const CLASSIC_MAIN_PATH = new URL("../../site/assets/browser/main.js", import.meta.url);
const CLASSIC_CSS_PATH = new URL("../../site/assets/styles/app.css", import.meta.url);

const REQUIRED_MAIN_IDS = Object.freeze([
  "batch-a-source-select",
  "batch-a-selection-mode-select",
  "batch-a-knowledge-point-panel",
  "batch-a-question-count-input",
  "batch-a-ordering-select",
  "batch-a-answer-key-input",
  "generation-seed-input",
  "columns-input",
  "rows-per-page-input",
  "regenerate-button",
  "print-button",
  "status-panel",
  "validation-panel",
  "preview-meta",
  "preview-frame"
]);

const REQUIRED_FALLBACK_IDS = Object.freeze([
  "batch-a-source-select",
  "batch-a-question-count-input",
  "batch-a-ordering-select",
  "batch-a-answer-key-input",
  "generation-seed-input",
  "columns-input",
  "rows-per-page-input",
  "regenerate-button",
  "print-button",
  "status-panel",
  "validation-panel",
  "preview-meta",
  "preview-frame"
]);

function assertIds(html, ids) {
  for (const id of ids) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing Classic public control: ${id}`);
  }
}

test("Classic main and fallback routes preserve the public worksheet control surfaces", async () => {
  const [indexHtml, fallbackHtml] = await Promise.all([
    readFile(CLASSIC_INDEX_PATH, "utf8"),
    readFile(CLASSIC_FALLBACK_PATH, "utf8")
  ]);

  assertIds(indexHtml, REQUIRED_MAIN_IDS);
  assertIds(fallbackHtml, REQUIRED_FALLBACK_IDS);

  assert.match(indexHtml, /src="\.\/assets\/browser\/main\.js"/);
  assert.match(fallbackHtml, /src="\.\/assets\/browser\/main\.js"/);
  assert.match(indexHtml, /href="\.\/pixel\/"/);
  assert.match(fallbackHtml, /href="\.\/index\.html"/);
  assert.match(fallbackHtml, /href="\.\/pixel\/"/);
  assert.match(indexHtml, /id="print-button"[^>]*disabled/);
  assert.match(fallbackHtml, /id="print-button"[^>]*disabled/);
});

test("Classic browser entry remains wired to the shared state, generator, preview, and print pipeline", async () => {
  const script = await readFile(CLASSIC_MAIN_PATH, "utf8");

  assert.match(script, /listBatchASourceUnits/);
  assert.match(script, /createConfigState/);
  assert.match(script, /buildWorksheetDocumentFromState/);
  assert.match(script, /renderPreviewFrame/);
  assert.match(script, /printPreviewFrame/);
  assert.match(script, /regenerateButton\?\.addEventListener\("click", regenerate\)/);
  assert.match(script, /printButton\?\.addEventListener\("click"/);
  assert.doesNotMatch(script, /pixel-generation-bridge|pixel-registry-bridge|pixel-worksheet-state/);
});

test("Classic source-unit generation remains valid for every public Batch A source", () => {
  const sourceUnits = listBatchASourceUnits();
  assert.equal(sourceUnits.length, 13);

  for (const [index, unit] of sourceUnits.entries()) {
    const state = createConfigState({
      queryState: {
        sourceId: unit.sourceId,
        questionCount: 4,
        ordering: index % 2 === 0 ? "groupedByPattern" : "shuffleAcrossPatterns",
        includeAnswerKey: true,
        generationSeed: `s49a-classic-${unit.sourceId}`,
        columns: 2,
        rowsPerPage: 2,
        selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT
      }
    });

    const result = buildWorksheetDocumentFromState(state);
    assert.equal(result.ok, true, `${unit.sourceId}: ${JSON.stringify(result.errors ?? [])}`);
    assert.equal(result.stage, "complete", unit.sourceId);
    assert.equal(result.validation.ok, true, unit.sourceId);
    assert.equal(result.worksheetDocument.batchA.sourceId, unit.sourceId);
    assert.equal(result.worksheetDocument.generatedQuestions.length, 4, unit.sourceId);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 4, unit.sourceId);
    assert.equal(result.worksheetDocument.printOptions.showAnswerKey, true, unit.sourceId);
  }
});

test("Classic answer-key-off path and responsive preview contract remain available", async () => {
  const state = createConfigState({
    queryState: {
      sourceId: "g3a_u02_3a02",
      questionCount: 6,
      ordering: "groupedByPattern",
      includeAnswerKey: false,
      generationSeed: "s49a-classic-no-answer",
      columns: 3,
      rowsPerPage: 2,
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT
    }
  });
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 6);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.printOptions.showAnswerKey, false);

  const css = await readFile(CLASSIC_CSS_PATH, "utf8");
  assert.match(css, /\.preview-frame/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /\.version-link:focus-visible/);
});
