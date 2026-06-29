import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";

import {
  buildPreviewHtml,
  writePreviewHtmlFile
} from "../../tools/preview/generate-preview-html.js";
import { createSampleWorksheetDocument } from "../../tools/preview/sample-worksheet-document.js";

test("preview html includes renderer output and print stylesheet", () => {
  const html = buildPreviewHtml();

  assert.equal(html.includes("../../src/renderer/print-styles.css"), true);
  assert.equal(html.includes("worksheet-page worksheet-page--questions print-page"), true);
  assert.equal(html.includes("worksheet-page worksheet-page--answer-key print-page"), true);
});

test("preview html includes browser print button shell", () => {
  const html = buildPreviewHtml();

  assert.equal(html.includes('onclick="window.print()"'), true);
  assert.equal(html.includes("Math Worksheet Preview"), true);
});

test("sample preview document renders question pages in document order", () => {
  const html = buildPreviewHtml({ worksheetDocument: createSampleWorksheetDocument() });

  assert.equal(html.indexOf("Question Page 1") < html.indexOf("Question Page 2"), true);
  assert.equal(html.indexOf("8 + 5 = ___") < html.indexOf("(8 + 5) - 4 = ___"), true);
});

test("sample preview renders answer-key section only when present", () => {
  const htmlWithAnswerKey = buildPreviewHtml();
  const htmlWithoutAnswerKey = buildPreviewHtml({
    worksheetDocument: {
      ...createSampleWorksheetDocument(),
      answerKeyPages: [],
      summary: {
        ...createSampleWorksheetDocument().summary,
        answerKeyPageCount: 0
      }
    }
  });

  assert.equal(htmlWithAnswerKey.includes("worksheet-section--answer-key"), true);
  assert.equal(htmlWithoutAnswerKey.includes("worksheet-section--answer-key"), false);
});

test("preview output file can be written as browser-openable html", () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "worksheet-preview-"));
  const outputPath = path.join(tempDir, "preview-output.html");

  const result = writePreviewHtmlFile(outputPath);
  const written = readFileSync(outputPath, "utf8");

  assert.equal(result.outputPath, outputPath);
  assert.equal(written.includes("<!doctype html>"), true);
  assert.equal(written.includes("</html>"), true);
});
