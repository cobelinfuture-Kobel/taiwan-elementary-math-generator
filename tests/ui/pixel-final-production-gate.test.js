import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listPixelSourceOptions } from "../../site/pixel/pixel-registry-bridge.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import { renderPixelWorksheetPreview } from "../../site/pixel/pixel-preview-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "../../site/pixel/pixel-print-controller.js";

const CLASSIC_INDEX = new URL("../../site/index.html", import.meta.url);
const FALLBACK_INDEX = new URL("../../site/404.html", import.meta.url);
const PIXEL_INDEX = new URL("../../site/pixel/index.html", import.meta.url);
const PAGES_WORKFLOW = new URL("../../.github/workflows/pages.yml", import.meta.url);

const REQUIRED_RELEASE_QA = Object.freeze([
  new URL("./classic-regression-qa.test.js", import.meta.url),
  new URL("./pixel-functional-qa.test.js", import.meta.url),
  new URL("./pixel-browser-path-release-qa.test.js", import.meta.url)
]);

function createFrame() {
  let focusCount = 0;
  let printCount = 0;
  return {
    frame: {
      srcdoc: "",
      contentWindow: {
        focus() { focusCount += 1; },
        print() { printCount += 1; }
      },
      removeAttribute(name) {
        if (name === "srcdoc") this.srcdoc = "";
      }
    },
    counters() {
      return { focusCount, printCount };
    }
  };
}

test("S50 release gate retains Classic, fallback, and Pixel public surfaces", async () => {
  const [classicHtml, fallbackHtml, pixelHtml] = await Promise.all([
    readFile(CLASSIC_INDEX, "utf8"),
    readFile(FALLBACK_INDEX, "utf8"),
    readFile(PIXEL_INDEX, "utf8")
  ]);

  assert.match(classicHtml, /href="\.\/pixel\/"/);
  assert.match(classicHtml, /id="batch-a-source-select"/);
  assert.match(classicHtml, /id="regenerate-button"/);
  assert.match(classicHtml, /id="preview-frame"/);

  assert.match(fallbackHtml, /href="\.\/index\.html"/);
  assert.match(fallbackHtml, /href="\.\/pixel\/"/);
  assert.match(fallbackHtml, /id="batch-a-source-select"/);

  assert.match(pixelHtml, /href="\.\.\/index\.html"/);
  assert.match(pixelHtml, /Pixel UI Beta/);
  assert.match(pixelHtml, /id="pixel-source-select"/);
  assert.match(pixelHtml, /id="pixel-selection-mode-select"/);
  assert.match(pixelHtml, /id="pixel-generate-button"/);
  assert.match(pixelHtml, /id="pixel-preview-frame"/);
  assert.match(pixelHtml, /id="pixel-print-button"[^>]*disabled/);
  assert.match(pixelHtml, /跨單元知識點混合尚未開放/);
});

test("S50 release gate requires the accepted S49 QA layers and Pages test-before-deploy workflow", async () => {
  await Promise.all(REQUIRED_RELEASE_QA.map((file) => access(file)));
  const workflow = await readFile(PAGES_WORKFLOW, "utf8");
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /deploy:\s*[\s\S]*?needs:\s*test/);
  assert.match(workflow, /uses:\s*actions\/upload-pages-artifact@v3[\s\S]*?path:\s*site/);
  assert.match(workflow, /uses:\s*actions\/deploy-pages@v4/);
});

test("S50 release gate executes every public source through Pixel generation, validation, preview, answer, and print", () => {
  const sharedSources = listBatchASourceUnits();
  const pixelSources = listPixelSourceOptions();

  assert.equal(sharedSources.length, 13);
  assert.equal(pixelSources.length, 13);
  assert.deepEqual(
    pixelSources.map((entry) => entry.sourceId).sort(),
    sharedSources.map((entry) => entry.sourceId).sort()
  );

  for (const [index, source] of pixelSources.entries()) {
    const includeAnswerKey = index % 2 === 0;
    const state = createPixelWorksheetState({
      sourceId: source.sourceId,
      questionCount: 4,
      ordering: index % 2 === 0 ? "groupedByPattern" : "shuffleAcrossPatterns",
      includeAnswerKey,
      generationSeed: `s50-final-${source.sourceId}`,
      columns: 2,
      rowsPerPage: 2
    });

    const execution = runPixelWorksheetGeneration(state);
    assert.equal(execution.summary.ok, true, source.sourceId);
    assert.equal(execution.summary.validationOk, true, source.sourceId);
    assert.equal(execution.summary.questionCount, 4, source.sourceId);
    assert.equal(execution.summary.answerKeyItemCount, includeAnswerKey ? 4 : 0, source.sourceId);
    assert.equal(execution.result.worksheetDocument.schemaVersion, "worksheet-document-v1", source.sourceId);
    assert.equal(execution.result.worksheetDocument.batchA.sourceId, source.sourceId);

    const fixture = createFrame();
    const preview = renderPixelWorksheetPreview(fixture.frame, execution.result.worksheetDocument);
    const printSummary = summarizePixelPrintAvailability(execution);

    assert.equal(preview.questionCount, 4, source.sourceId);
    assert.equal(preview.answerKeyItemCount, includeAnswerKey ? 4 : 0, source.sourceId);
    assert.match(preview.html, /<!doctype html>/i, source.sourceId);
    assert.match(preview.html, /\.\.\/assets\/styles\/print-styles\.css/, source.sourceId);
    assert.equal(printSummary.ready, true, source.sourceId);
    assert.equal(printSummary.includesAnswerKey, includeAnswerKey, source.sourceId);

    const printed = printPixelWorksheet(fixture.frame, execution);
    assert.equal(printed.ready, true, source.sourceId);
    assert.deepEqual(fixture.counters(), { focusCount: 1, printCount: 1 }, source.sourceId);
  }
});
