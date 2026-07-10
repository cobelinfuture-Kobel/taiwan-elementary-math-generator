import test from "node:test";
import assert from "node:assert/strict";

import {
  printPixelWorksheet,
  summarizePixelPrintAvailability
} from "../../site/pixel/pixel-print-controller.js";

function successfulExecution({ includeAnswerKey = true } = {}) {
  return {
    result: {
      worksheetDocument: {
        worksheetId: "worksheet-pixel-print"
      }
    },
    summary: {
      ok: true,
      worksheetId: "worksheet-pixel-print",
      questionCount: 20,
      questionPageCount: 2,
      answerKeyItemCount: includeAnswerKey ? 20 : 0,
      answerKeyPageCount: includeAnswerKey ? 1 : 0
    }
  };
}

test("Pixel print availability reports worksheet plus answer pages", () => {
  const summary = summarizePixelPrintAvailability(successfulExecution());
  assert.equal(summary.ready, true);
  assert.equal(summary.includesAnswerKey, true);
  assert.equal(summary.outputLabel, "題目卷＋答案頁");
  assert.equal(summary.buttonLabel, "列印題目卷＋答案頁");
  assert.match(summary.statusText, /答案 20 題／1 頁/);
});

test("Pixel print availability reports question-only output", () => {
  const summary = summarizePixelPrintAvailability(successfulExecution({ includeAnswerKey: false }));
  assert.equal(summary.ready, true);
  assert.equal(summary.includesAnswerKey, false);
  assert.equal(summary.outputLabel, "僅題目卷");
  assert.equal(summary.buttonLabel, "列印題目卷");
  assert.match(summary.statusText, /不含答案頁/);
});

test("Pixel print delegates to the shared preview-frame print path", () => {
  let focusCount = 0;
  let printCount = 0;
  const previewFrame = {
    contentWindow: {
      focus() { focusCount += 1; },
      print() { printCount += 1; }
    }
  };
  const summary = printPixelWorksheet(previewFrame, successfulExecution());
  assert.equal(summary.ready, true);
  assert.equal(focusCount, 1);
  assert.equal(printCount, 1);
});

test("Pixel print rejects missing successful generation result", () => {
  assert.throws(
    () => printPixelWorksheet({ contentWindow: {} }, null),
    /successful worksheet generation result/
  );
});
