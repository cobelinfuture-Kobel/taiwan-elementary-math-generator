import assert from "node:assert/strict";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { printPreviewFrame, renderPreviewFrame } from "../../site/assets/browser/pipeline/render-preview-frame.js";
import {
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASourceId
} from "../../site/assets/browser/state/config-state.js";

function createMockPreviewFrame() {
  const calls = { focus: 0, print: 0 };
  return {
    calls,
    srcdoc: "",
    contentWindow: {
      focus() {
        calls.focus += 1;
      },
      print() {
        calls.print += 1;
      }
    }
  };
}

function buildPreviewDocument(options = {}) {
  const state = createConfigState();
  setBatchASourceId(state, options.sourceId ?? "g3a_u02_3a02");
  setBatchAQuestionCount(state, options.questionCount ?? 8);
  setBatchAOrdering(state, options.ordering ?? "groupedByPattern");
  setBatchAIncludeAnswerKey(state, options.includeAnswerKey ?? true);
  setBatchAPrintLayout(state, {
    columns: options.columns ?? 2,
    rowsPerPage: options.rowsPerPage ?? 4
  });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, options.questionCount ?? 8);
  return result.worksheetDocument;
}

test("S42B20 iframe preview writes rendered worksheet HTML into srcdoc", () => {
  const worksheetDocument = buildPreviewDocument({
    sourceId: "g3a_u02_3a02",
    questionCount: 8,
    includeAnswerKey: true
  });
  const previewFrame = createMockPreviewFrame();

  const result = renderPreviewFrame(previewFrame, worksheetDocument, {
    title: worksheetDocument.title,
    stylesheetHref: "./assets/styles/print-styles.css"
  });

  assert.equal(previewFrame.srcdoc, result.html);
  assert.match(previewFrame.srcdoc, /<!doctype html>/);
  assert.match(previewFrame.srcdoc, /<html lang="zh-Hant">/);
  assert.match(previewFrame.srcdoc, /worksheet-renderer/);
  assert.match(previewFrame.srcdoc, /data-worksheet-kind="batchAWorksheet"/);
  assert.match(previewFrame.srcdoc, /題目頁 1/);
  assert.match(previewFrame.srcdoc, /答案頁 1/);
  assert.match(previewFrame.srcdoc, /\.\/assets\/styles\/print-styles\.css/);
});

test("S42B20 iframe preview omits answer key HTML when answer key is disabled", () => {
  const worksheetDocument = buildPreviewDocument({
    sourceId: "g3a_u02_3a02",
    questionCount: 8,
    includeAnswerKey: false
  });
  const previewFrame = createMockPreviewFrame();

  const result = renderPreviewFrame(previewFrame, worksheetDocument, {
    title: worksheetDocument.title,
    stylesheetHref: "./assets/styles/print-styles.css"
  });

  assert.equal(previewFrame.srcdoc, result.html);
  assert.equal(worksheetDocument.answerKeyPages.length, 0);
  assert.doesNotMatch(previewFrame.srcdoc, /worksheet-section--answer-key/);
  assert.doesNotMatch(previewFrame.srcdoc, /答案頁 1/);
});

test("S42B20 iframe preview supports shuffled Batch A source output", () => {
  const worksheetDocument = buildPreviewDocument({
    sourceId: "g4a_u08_4a08",
    questionCount: 9,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    columns: 3,
    rowsPerPage: 3
  });
  const previewFrame = createMockPreviewFrame();

  renderPreviewFrame(previewFrame, worksheetDocument, {
    title: worksheetDocument.title,
    stylesheetHref: "./assets/styles/print-styles.css"
  });

  assert.equal(worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
  assert.match(previewFrame.srcdoc, /worksheet-page--questions/);
  assert.match(previewFrame.srcdoc, /worksheet-page--answer-key/);
  assert.match(previewFrame.srcdoc, /--worksheet-columns:3/);
});

test("S42B20 iframe preview throws when preview frame is missing", () => {
  const worksheetDocument = buildPreviewDocument();

  assert.throws(
    () => renderPreviewFrame(null, worksheetDocument),
    /Preview frame element is required\./
  );
});

test("S42B20 iframe print path focuses and prints contentWindow", () => {
  const previewFrame = createMockPreviewFrame();

  printPreviewFrame(previewFrame);

  assert.equal(previewFrame.calls.focus, 1);
  assert.equal(previewFrame.calls.print, 1);
});

test("S42B20 iframe print path throws when contentWindow is missing", () => {
  assert.throws(
    () => printPreviewFrame({ srcdoc: "" }),
    /Preview frame window is not available\./
  );
});
