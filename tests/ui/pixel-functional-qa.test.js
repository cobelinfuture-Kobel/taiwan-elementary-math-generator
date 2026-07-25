import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { G5A_U02_PUBLIC_SOURCE_ID } from "../../site/modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import {
  listPixelKnowledgePointsForSource,
  listPixelSourceOptions,
} from "../../site/pixel/pixel-registry-bridge.js";
import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState,
} from "../../site/pixel/pixel-selector-state.js";
import { runPixelWorksheetGeneration } from "../../site/pixel/pixel-generation-controller.js";
import { renderPixelWorksheetPreview } from "../../site/pixel/pixel-preview-controller.js";
import {
  printPixelWorksheet,
  summarizePixelPrintAvailability,
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
  "pixel-print-button",
]);

function createFrame() {
  let focusCount = 0;
  let printCount = 0;
  return {
    frame: {
      srcdoc: "",
      dataset: {},
      contentWindow: {
        focus() { focusCount += 1; },
        print() { printCount += 1; },
      },
      removeAttribute(name) {
        if (name === "srcdoc") this.srcdoc = "";
      },
    },
    counters() {
      return { focusCount, printCount };
    },
  };
}

function sorted(values) {
  return [...values].sort();
}

function assertSuccessfulExecution(execution, {
  sourceId,
  questionCount,
  answerKeyItemCount,
  staticCanonical = false,
}) {
  assert.equal(
    execution.summary.ok,
    true,
    `${sourceId}: ${JSON.stringify({
      summary: execution.summary,
      errors: execution.result.errors ?? [],
      validation: execution.result.validation ?? null,
    })}`,
  );
  assert.equal(execution.summary.validationOk, true, sourceId);
  assert.ok(execution.result.worksheetDocument, sourceId);
  const document = execution.result.worksheetDocument;
  assert.equal(execution.summary.questionCount, questionCount, sourceId);
  assert.equal(execution.summary.answerKeyItemCount, answerKeyItemCount, sourceId);

  if (staticCanonical) {
    assert.equal(document.schemaName, "G5AU02PublicCanonicalWorksheet", sourceId);
    assert.equal(document.schemaVersion, 1, sourceId);
    assert.equal(document.sourceId, sourceId);
    assert.equal(document.summary.publicCanonicalRelease, true, sourceId);
    assert.equal(document.lifecycle.productionUse, "allowed_canonical_static_release", sourceId);
    assert.equal(document.lifecycle.arbitraryRegeneration, false, sourceId);
    assert.equal(typeof document.staticHtmlUrl, "string", sourceId);
    assert.equal(document.staticHtmlUrl.includes("5bd0e6d3aa904768e8436ab19d49e9aa12b4b32a"), true, sourceId);
    assert.equal(Array.isArray(document.generatedQuestions), false, sourceId);
    assert.equal(document.answerKeyItems.length, answerKeyItemCount, sourceId);
    return;
  }

  assert.equal(document.schemaVersion, "worksheet-document-v1", sourceId);
  assert.equal(document.batchA.sourceId, sourceId);
  assert.equal(document.generatedQuestions.length, questionCount, sourceId);
  assert.equal(document.answerKeyItems.length, answerKeyItemCount, sourceId);
  assert.equal(document.printOptions.showAnswerKey, answerKeyItemCount > 0, sourceId);
}

test("Pixel public route exposes the complete selector, generation, preview, answer, and print surface", async () => {
  const [html, pixelUi, livePreview, printSurface] = await Promise.all([
    readFile(PIXEL_INDEX_PATH, "utf8"),
    readFile(PIXEL_UI_PATH, "utf8"),
    readFile(PIXEL_LIVE_PREVIEW_PATH, "utf8"),
    readFile(PIXEL_PRINT_SURFACE_PATH, "utf8"),
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
  assert.match(pixelUi, /generateButton\?\.addEventListener\("click",\s*generateWorksheet\)/);
  assert.match(livePreview, /subscribePixelGeneration/);
  assert.match(livePreview, /renderPixelWorksheetPreview/);
  assert.match(printSurface, /subscribePixelGeneration/);
  assert.match(printSurface, /printPixelWorksheet/);
});

test("Pixel source-unit full chain handles eighteen generated sources and the G5A-U02 canonical static release", () => {
  const sources = listPixelSourceOptions();
  assert.equal(sources.length, 19);

  for (const [index, source] of sources.entries()) {
    const staticCanonical = source.sourceId === G5A_U02_PUBLIC_SOURCE_ID;
    const requestedQuestionCount = 4;
    const includeAnswerKey = index % 2 === 0;
    const expectedQuestionCount = staticCanonical ? 22 : requestedQuestionCount;
    const expectedAnswerKeyItemCount = staticCanonical
      ? (includeAnswerKey ? 22 : 0)
      : (includeAnswerKey ? requestedQuestionCount : 0);
    const state = createPixelWorksheetState({
      sourceId: source.sourceId,
      questionCount: requestedQuestionCount,
      ordering: index % 2 === 0 ? "groupedByPattern" : "shuffleAcrossPatterns",
      includeAnswerKey,
      generationSeed: `s49b-pixel-${source.sourceId}`,
      columns: 2,
      rowsPerPage: 2,
    });

    const execution = runPixelWorksheetGeneration(state);
    assertSuccessfulExecution(execution, {
      sourceId: source.sourceId,
      questionCount: expectedQuestionCount,
      answerKeyItemCount: expectedAnswerKeyItemCount,
      staticCanonical,
    });

    const fixture = createFrame();
    const preview = renderPixelWorksheetPreview(fixture.frame, execution.result.worksheetDocument);
    const printSummary = summarizePixelPrintAvailability(execution);

    assert.equal(preview.worksheetId, execution.summary.worksheetId, source.sourceId);
    assert.equal(preview.questionCount, expectedQuestionCount, source.sourceId);
    assert.equal(preview.answerKeyItemCount, expectedAnswerKeyItemCount, source.sourceId);
    assert.equal(printSummary.ready, true, source.sourceId);
    assert.equal(printSummary.includesAnswerKey, expectedAnswerKeyItemCount > 0, source.sourceId);
    if (staticCanonical) {
      assert.equal(preview.html, null, source.sourceId);
      assert.equal(preview.staticHtmlUrl, execution.result.worksheetDocument.staticHtmlUrl, source.sourceId);
      assert.equal(fixture.frame.dataset.staticCandidateStatus, "loading", source.sourceId);
    } else {
      assert.equal(fixture.frame.srcdoc, preview.html, source.sourceId);
      assert.match(fixture.frame.srcdoc, /<!doctype html>/i, source.sourceId);
      assert.match(fixture.frame.srcdoc, /\.\.\/assets\/styles\/print-styles\.css/, source.sourceId);
      assert.equal(
        fixture.frame.srcdoc.includes(execution.result.worksheetDocument.title),
        true,
        source.sourceId,
      );
    }

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
    selectedKnowledgePointIds: [knowledgePoints[0].knowledgePointId],
  });
  const singleState = createPixelWorksheetState({
    sourceId,
    selectorState: singleSelector,
    questionCount: 6,
    includeAnswerKey: false,
    generationSeed: "s49b-single-kp",
    columns: 2,
    rowsPerPage: 3,
  });
  const singleExecution = runPixelWorksheetGeneration(singleState);
  assertSuccessfulExecution(singleExecution, {
    sourceId,
    questionCount: 6,
    answerKeyItemCount: 0,
  });
  assert.deepEqual(
    sorted(singleExecution.result.worksheetDocument.batchA.knowledgePointIds),
    sorted(singleSelector.selectedKnowledgePointIds),
  );
  assert.deepEqual(
    sorted(singleExecution.result.worksheetDocument.batchA.patternGroupIds),
    sorted(singleSelector.selectedPatternGroupIds),
  );

  const mixedSelector = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: knowledgePoints.slice(0, 2).map((entry) => entry.knowledgePointId),
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
    rowsPerPage: 4,
  });
  const mixedExecution = runPixelWorksheetGeneration(mixedState);
  assertSuccessfulExecution(mixedExecution, {
    sourceId,
    questionCount: 8,
    answerKeyItemCount: 8,
  });
  assert.deepEqual(
    sorted(mixedExecution.result.worksheetDocument.batchA.knowledgePointIds),
    sorted(mixedSelector.selectedKnowledgePointIds),
  );
  assert.deepEqual(
    sorted(mixedExecution.result.worksheetDocument.batchA.patternGroupIds),
    sorted(mixedSelector.selectedPatternGroupIds),
  );
});

test("Pixel selector drops unknown KnowledgePoint IDs before generation", () => {
  const sourceId = "g4a_u08_4a08";
  const knowledgePoints = listPixelKnowledgePointsForSource(sourceId);
  const selector = createPixelKnowledgePointSelectorState({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_not_public", knowledgePoints[0].knowledgePointId],
  });

  assert.deepEqual(selector.selectedKnowledgePointIds, [knowledgePoints[0].knowledgePointId]);
  assert.equal(
    selector.warnings.some((entry) => entry.code === "pixel_selector_knowledge_point_dropped"),
    true,
  );

  const state = createPixelWorksheetState({
    sourceId,
    selectorState: selector,
    questionCount: 4,
    includeAnswerKey: true,
    generationSeed: "s49b-sanitized-kp",
  });
  const execution = runPixelWorksheetGeneration(state);
  assertSuccessfulExecution(execution, {
    sourceId,
    questionCount: 4,
    answerKeyItemCount: 4,
  });
  assert.deepEqual(
    execution.result.worksheetDocument.batchA.knowledgePointIds,
    [knowledgePoints[0].knowledgePointId],
  );
  assert.equal(
    execution.result.worksheetDocument.batchA.knowledgePointIds.includes("kp_not_public"),
    false,
  );
});
