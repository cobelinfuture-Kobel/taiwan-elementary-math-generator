import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASourceId
} from "../../site/assets/browser/state/config-state.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE_ROOT = path.join(PROJECT_ROOT, "site");

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function collectFiles(rootDir) {
  const output = [];

  for (const entry of readdirSync(rootDir)) {
    const absolutePath = path.join(rootDir, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      output.push(...collectFiles(absolutePath));
      continue;
    }
    output.push(absolutePath);
  }

  return output;
}

function assertBatchAControls(html) {
  assert.match(html, /id="batch-a-source-select"/);
  assert.match(html, /id="batch-a-question-count-input"/);
  assert.match(html, /id="batch-a-ordering-select"/);
  assert.match(html, /id="generation-seed-input"/);
  assert.match(html, /id="batch-a-answer-key-input"/);
  assert.match(html, /id="columns-input"/);
  assert.match(html, /id="rows-per-page-input"/);
  assert.match(html, /id="regenerate-button"/);
  assert.match(html, /id="print-button"/);
  assert.match(html, /id="status-panel"/);
  assert.match(html, /id="validation-panel"/);
  assert.match(html, /id="preview-frame"/);
}

test("Batch A site - index html contains S42 controls", () => {
  const html = readText("site/index.html");
  assertBatchAControls(html);
  assert.doesNotMatch(html, /id="config-json-editor"/);
  assert.doesNotMatch(html, /id="operator-add-input"/);
});

test("Batch A site - 404 page mirrors S42 controls", () => {
  const html = readText("site/404.html");
  assertBatchAControls(html);
  assert.doesNotMatch(html, /id="config-json-editor"/);
  assert.doesNotMatch(html, /id="operator-add-input"/);
});

test("Batch A site - config editor compatibility module remains inert", async () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "assets", "browser", "ui", "config-editor.js")), true);
  const module = await import("../../site/assets/browser/ui/config-editor.js");
  const editor = module.createConfigEditor();
  assert.equal(typeof editor.refresh, "function");
  assert.equal(typeof editor.attach, "function");
});

test("Batch A state - default plan is serializable", () => {
  const state = createConfigState({ queryState: { sourceId: "g3a_u02_3a02", questionCount: 20 } });
  const plan = getBatchAWorksheetPlan(state);
  const serialized = JSON.stringify(plan);
  const reparsed = JSON.parse(serialized);

  assert.equal(reparsed.sourceId, "g3a_u02_3a02");
  assert.equal(reparsed.questionCount, 20);
  assert.equal(reparsed.ordering, "groupedByPattern");
  assert.equal(reparsed.includeAnswerKey, true);
  assert.equal(reparsed.printLayout.columns, 4);
  assert.equal(reparsed.printLayout.rowsPerPage, 10);
});

test("Batch A site - 13 source units are available", () => {
  const sourceUnits = listBatchASourceUnits();
  assert.equal(sourceUnits.length, 13);
  assert.equal(sourceUnits.some((unit) => unit.sourceId === "g3a_u01_3a01"), true);
  assert.equal(sourceUnits.some((unit) => unit.sourceId === "g5a_u08_5a08"), true);
});

test("Batch A state - valid edit still generates", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g4a_u08_4a08");
  setBatchAQuestionCount(state, 8);
  setBatchAOrdering(state, "shuffleAcrossPatterns");
  setBatchAPrintLayout(state, { columns: 3, rowsPerPage: 3 });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.batchA.sourceId, "g4a_u08_4a08");
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
  assert.equal(result.worksheetDocument.printOptions.columns, 3);
});

test("Batch A state - answer key toggle remains assembly-backed", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 6);
  setBatchAIncludeAnswerKey(state, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(result.worksheetDocument.printOptions.showAnswerKey, false);
});

test("Batch A site - runtime avoids tools preview and src imports", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    assert.equal(text.includes("tools/preview"), false, `${filePath} should not reference tools/preview`);
    assert.equal(text.includes("src/"), false, `${filePath} should not reference src/`);
  }
});

test("Batch A site - html labels are Traditional Chinese", () => {
  const indexHtml = readText("site/index.html");
  const notFoundHtml = readText("site/404.html");

  assert.match(indexHtml, /台灣小學數學 Batch A 練習題產生器/);
  assert.match(indexHtml, /選擇單元/);
  assert.match(indexHtml, /題目數量/);
  assert.match(indexHtml, /排序模式/);
  assert.match(indexHtml, /包含答案頁/);
  assert.match(indexHtml, /產生 \/ 重新產生/);
  assert.match(indexHtml, /列印/);
  assert.match(indexHtml, /尚未產生新的 Batch A 練習題/);
  assert.match(indexHtml, /lang="zh-Hant"/);

  assert.match(notFoundHtml, /找不到指定頁面/);
  assert.match(notFoundHtml, /lang="zh-Hant"/);
});

test("Batch A site - renderer output uses Traditional Chinese page headers", async () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 5);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const renderer = await import("../../site/modules/renderer/html-renderer.js");
  const html = renderer.renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: "測試",
    stylesheetHref: "./assets/styles/print-styles.css"
  });

  assert.match(html, /題目頁 1/);
  assert.match(html, /答案頁/);
  assert.match(html, /lang="zh-Hant"/);
});
