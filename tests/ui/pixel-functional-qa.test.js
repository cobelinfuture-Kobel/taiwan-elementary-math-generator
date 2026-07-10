import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  listPixelKnowledgePointsForSource,
  listPixelSourceOptions
} from "../../site/pixel/pixel-registry-bridge.js";
import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState
} from "../../site/pixel/pixel-selector-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import { renderPixelWorksheetPreview } from "../../site/pixel/pixel-preview-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "../../site/pixel/pixel-print-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";

const PIXEL_INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const PIXEL_UI_PATH = new URL("../../site/pixel/pixel-ui.js", import.meta.url);
const PIXEL_LIVE_PREVIEW_PATH = new URL("../../site/pixel/pixel-live-preview.js", import.meta.url);
const PIXEL_PRINT_SURFACE_PATH = new URL("../../site/pixel/pixel-print-surface.js", import.meta.url);

const REQUIRED_PIXEL_IDS = Object.freeze([
  "pixel-grade-select",
  "pixel-semester-select",
  "pixel-source-select",
  "pixel-selection-mode-select",
  "pixel-kp-panel",
  "pixel-question-count",
  "pixel-ordering",
  "pixel-generation-seed",
  "pixel-columns",
  "pixel-rows-per-page",
  "pixel-answer-key",
  "pixel-plan-summary",
  "pixel-generate-button",
  "pixel-generation-status",
  "pixel-generation-errors",
  "pixel-preview-meta",
  "pixel-preview-frame",
  "pixel-output-summary",
  "pixel-print-button"
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

function assertSuccessfulExecution(execution, { sourceId, questionCount, includeAnswerKey }) {
  assert.equal(execution.summary.ok, true, `${sourceId}: ${JSON.stringify(execution.result.errors ?? [])}`);
  assert.equal(execution.summary.validationOk, true, sourceId);
  assert.ok(execution.result.worksheetDocument, sourceId);
  assert.equal(execution.result.worksheetDocument.schemaVersion, "worksheet-document-v1", sourceId);
  assert.equal(execution.result.worksheetDocument.batchA.sourceId, sourceId);
  assert.equal(execution.summary.questionCount, questionCount, sourceId);
  assert.equal(execution.result.worksheetDocument.generatedQuestions.length, questionCount, sourceId);
  assert.equal(execution.summary.answerKeyItemCount, includeAnswerKey ? questionCount : 0, sourceId);
  assert.equal(execution.result.worksheetDocument.answerKeyItems.length, includeAnswerKey ? questionCount : 0, sourceId);
  assert.equal(execution.result.worksheetDocument.printOptions.showAnswerKey, includeAnswerKey, sourceId);
}

test("Pixel public route exposes the complete selector, generation, preview, answer, and print surface", async () => {
  const [html, pixelUi, livePreview, printSurface] = await Promise.all([
    readFile(PIXEL_INDEX_PATH, "utf8"),
    readFile(PIXEL_UI_PATH, "utf8"),
    readFile(PIXEL_LIVE_PREVIEW_PATH, "utf8"),
    readFile(PIXEL_PRINT_SURFACE_PATH, "utf8")
  ]);

  for (const id of REQUIRED_PIXEL_IDS) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing Pixel public control: ${id}`);
  }

  assert.match(html, /href="\.\.\/index\.html"/);
  assert.match(html, /Pixel UI Beta/);
  assert.match(html, /pixel-ui\.js/);
  assert.match(html, /pixel-live-preview\.js/);
  assert.match(html, /pixel-print-surface\.js/);
  assert.match(html, /id="pixel-print-button"[^>]*disabled/);
  assert.match(pixelUi, /runPixelWorksheetGeneration/);
  assert.match(pixelUi, /pixelGenerateButton\?\.addEventListener\("click"/);
  assert.match(livePreview, /subscribePixelGeneration/);
  assert.match(livePreview, /renderPixelWorksheetPreview/);
  assert.match(printSurface, /subscribePixelGeneration/);
  assert.match(printSurface, /printPixelWorksheet/);
});

test("Pixel source-unit full chain generates, validates, previews, and prints every public Batch A source", () => {
  const sources = listPixelSourceOptions();
  assert.equal(sources.length, 13);

  for (const [index, source] of sources.entries()) {
    const questionCount = 4;
    const includeAnswerKey = index % 2 === 0;
    const state = createPixelWorksheetState({
      sourceId: source.sourceId,
      questionCount,
      ordering: index % 2 === 0 ? "groupedByPattern" : "shuffleAcrossPatterns",
      includeAnswerKey,
      generationSeed: `s49b-pixel-${source.sourceId}`,
      columns: 2,
      rowsPerPage: 2
    });

    const execution = runPixelWorksheetGeneration(state);
    assertSuccessfulExecution(execution, {
      sourceId: source.sourceId,
      questionCount,
      includeAnswerKey
    });

    const fixture = createFrame();
    const preview = renderPixelWorksheetPreview(fixture.frame, execution.result.worksheetDocument);
    const printSummary = summarizePixelPrintAvailability(execution);

    assert.equal(preview.worksheetId, execution.summary.worksheetId, source.sourceId);
    assert.equal(preview.questionCount, questionCount, source.sourceId);
    assert.equal(preview.answerKeyItemCount, includeAnswerKey ? questionCount : 0, source.sourceId);
    assert.equal(printSummary.ready, true, source.sourceId);
    assert.equal(printSummary.includesAnswerKey, includeAnswerKey, source.sourceId);
    assert.equal(fixture.frame.srcdoc, preview.html, source.sourceId);
    assert.match(fixture.frame.srcdoc, /<!doctype html>/i, source.sourceId);
    assert.match(fixture.frame.srcdoc, /\.\.\/assets\/styles\/print-styles\.css/, source.sourceId);
    assert.equal(fixture.frame.srcdoc.includes(execution.result.worksheetDocument.title), true, source.sourceId);

    const printed = printPixelWorksheet(fixture.frame, execution);
    assert.equal(printed.ready, true, source.sourceId);
    assert.deepEqual(fixture.counters(), { focusCount: 1, printCount: 1 }, source.sourceId);
  }
});

test("Pixel single-KnowledgePoint and same-unit mixed modes preserve authoritative selections", () => {
  const sourceId = "g4a_u08_4a08";
  const knowledgePoints = listPixelKnowledgePointsForSource(sourceId);
  assert.equal(knowledgePoints.length >= 2, true);

  const singleSelector = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [knowledgePoints[0].knowledgePointId]
  });
  const singleState = createPixelWorksheetState({
    sourceId,
    selectorState: singleSelector,
    questionCount: 6,
    includeAnswerKey: false,
    generationSeed: "s49b-single-kp",
    columns: 2,
    rowsPerPage: 3
  });
  const singleExecution = runPixelWorksheetGeneration(singleState);
  assertSuccessfulExecution(singleExecution, { sourceId, questionCount: 6, includeAnswerKey: false });
  assert.deepEqual(singleExecution.result.worksheetDocument.batchA.knowledgePointIds, singleSelector.selectedKnowledgePointIds);
  assert.deepEqual(singleExecution.result.worksheetDocument.batchA.patternGroupIds, singleSelector.selectedPatternGroupIds);

  const mixedSelector = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: knowledgePoints.slice(0, 2).map((entry) => entry.knowledgePointId)
  });
  assert.equal(mixedSelector.selectedKnowledgePointIds.length >= 2, true);
  assert.equal(mixedSelector.selectedPatternGroupIds.length >= 2, true);

  const mixedState = createPixelWorksheetState({
    sourceId,
    selectorState: mixedSelector,
    questionCount: 8,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s49b-mixed-kp",
    columns: 2,
    rowsPerPage: 4
  });
  const mixedExecution = runPixelWorksheetGeneration(mixedState);
  assertSuccessfulExecution(mixedExecution, { sourceId, questionCount: 8, includeAnswerKey: true });
  assert.deepEqual(mixedExecution.result.worksheetDocument.batchA.knowledgePointIds, mixedSelector.selectedKnowledgePointIds);
  assert.deepEqual(mixedExecution.result.worksheetDocument.batchA.patternGroupIds, mixedSelector.selectedPatternGroupIds);
});

test("Pixel selector drops unknown KnowledgePoint IDs before generation", () => {
  const sourceId = "g4a_u08_4a08";
  const knowledgePoints = listPixelKnowledgePointsForSource(sourceId);
  const selector = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_not_public", knowledgePoints[0].knowledgePointId]
  });

  assert.deepEqual(selector.selectedKnowledgePointIds, [knowledgePoints[0].knowledgePointId]);
  assert.equal(selector.warnings.some((entry) => entry.code === "pixel_selector_knowledge_point_dropped"), true);

  const state = createPixelWorksheetState({
    sourceId,
    selectorState: selector,
    questionCount: 4,
    includeAnswerKey: true,
    generationSeed: "s49b-sanitized-kp"
  });
  const execution = runPixelWorksheetGeneration(state);
  assertSuccessfulExecution(execution, { sourceId, questionCount: 4, includeAnswerKey: true });
  assert.deepEqual(execution.result.worksheetDocument.batchA.knowledgePointIds, [knowledgePoints[0].knowledgePointId]);
  assert.equal(execution.result.worksheetDocument.batchA.knowledgePointIds.includes("kp_not_public"), false);
});
