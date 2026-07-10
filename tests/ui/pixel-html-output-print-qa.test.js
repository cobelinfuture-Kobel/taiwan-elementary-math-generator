import test from "node:test";
import assert from "node:assert/strict";

import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import { renderPixelWorksheetPreview } from "../../site/pixel/pixel-preview-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "../../site/pixel/pixel-print-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";

function createFrame() {
  let focusCount = 0;
  let printCount = 0;
  return {
    frame: {
      srcdoc: "",
      contentWindow: {
        focus() { focusCount += 1; },
        print() { printCount += 1; }
      }
    },
    counters() {
      return { focusCount, printCount };
    }
  };
}

function generate({ includeAnswerKey, questionCount, seed }) {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount,
    includeAnswerKey,
    generationSeed: seed,
    columns: 2,
    rowsPerPage: 5
  });
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true, JSON.stringify(execution.result.errors));
  assert.equal(execution.summary.validationOk, true);
  return execution;
}

test("Pixel full-chain HTML output preserves question and answer counts", () => {
  const execution = generate({
    includeAnswerKey: true,
    questionCount: 20,
    seed: "s47a-html-answer"
  });
  const { frame } = createFrame();
  const preview = renderPixelWorksheetPreview(frame, execution.result.worksheetDocument);
  const printSummary = summarizePixelPrintAvailability(execution);

  assert.equal(preview.questionCount, 20);
  assert.equal(preview.answerKeyItemCount, 20);
  assert.equal(preview.questionPageCount >= 1, true);
  assert.equal(preview.answerKeyPageCount >= 1, true);
  assert.equal(printSummary.ready, true);
  assert.equal(printSummary.includesAnswerKey, true);
  assert.equal(printSummary.questionCount, preview.questionCount);
  assert.equal(printSummary.questionPageCount, preview.questionPageCount);
  assert.equal(printSummary.answerKeyItemCount, preview.answerKeyItemCount);
  assert.equal(printSummary.answerKeyPageCount, preview.answerKeyPageCount);
  assert.equal(frame.srcdoc, preview.html);
  assert.match(frame.srcdoc, /<!doctype html>/i);
  assert.match(frame.srcdoc, /\.\.\/assets\/styles\/print-styles\.css/);
  assert.equal(frame.srcdoc.includes(execution.result.worksheetDocument.title), true);
  assert.equal(frame.srcdoc.length > 1000, true);
});

test("Pixel full-chain question-only HTML output omits answer pages", () => {
  const execution = generate({
    includeAnswerKey: false,
    questionCount: 12,
    seed: "s47a-html-question-only"
  });
  const { frame } = createFrame();
  const preview = renderPixelWorksheetPreview(frame, execution.result.worksheetDocument);
  const printSummary = summarizePixelPrintAvailability(execution);

  assert.equal(preview.questionCount, 12);
  assert.equal(preview.answerKeyItemCount, 0);
  assert.equal(preview.answerKeyPageCount, 0);
  assert.equal(execution.result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(execution.result.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(printSummary.ready, true);
  assert.equal(printSummary.includesAnswerKey, false);
  assert.equal(printSummary.outputLabel, "僅題目卷");
  assert.equal(printSummary.buttonLabel, "列印題目卷");
  assert.equal(frame.srcdoc, preview.html);
  assert.equal(frame.srcdoc.length > 1000, true);
});

test("Pixel full-chain print uses the rendered iframe after successful generation", () => {
  const execution = generate({
    includeAnswerKey: true,
    questionCount: 10,
    seed: "s47a-print"
  });
  const fixture = createFrame();
  renderPixelWorksheetPreview(fixture.frame, execution.result.worksheetDocument);
  const availability = printPixelWorksheet(fixture.frame, execution);

  assert.equal(availability.ready, true);
  assert.equal(availability.includesAnswerKey, true);
  assert.deepEqual(fixture.counters(), { focusCount: 1, printCount: 1 });
  assert.equal(fixture.frame.srcdoc.length > 1000, true);
});
