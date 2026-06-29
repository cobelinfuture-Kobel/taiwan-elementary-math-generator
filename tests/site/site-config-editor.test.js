import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  applyPreset,
  createConfigState,
  setColumns,
  setOrderingMode,
  setQuestionCount,
  setRowsPerPage,
  setShowAnswerKeyPage
} from "../../site/assets/browser/state/config-state.js";
import { listPresetDefinitions } from "../../site/assets/browser/state/presets.js";

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

test("config editor - site html contains editor controls", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="config-json-editor"/);
  assert.match(html, /id="apply-edit-button"/);
  assert.match(html, /id="reset-preset-button"/);
  assert.match(html, /id="json-error-panel"/);
  assert.match(html, /id="question-count-input"/);
  assert.match(html, /id="columns-input"/);
  assert.match(html, /id="rows-per-page-input"/);
  assert.match(html, /id="ordering-mode-select"/);
});

test("config editor - 404 page mirrors editor controls", () => {
  const html = readText("site/404.html");
  assert.match(html, /id="config-json-editor"/);
  assert.match(html, /id="apply-edit-button"/);
  assert.match(html, /id="reset-preset-button"/);
  assert.match(html, /id="question-count-input"/);
  assert.match(html, /id="columns-input"/);
  assert.match(html, /id="rows-per-page-input"/);
  assert.match(html, /id="ordering-mode-select"/);
});

test("config editor - module exists and exports createConfigEditor", async () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "assets", "browser", "ui", "config-editor.js")), true);
  const module = await import("../../site/assets/browser/ui/config-editor.js");
  assert.equal(typeof module.createConfigEditor, "function");
});

test("config editor - draft config can be serialized and re-parsed", () => {
  const state = createConfigState({ presetId: "grouped" });
  const serialized = JSON.stringify(state.draftConfig);
  const reparsed = JSON.parse(serialized);

  assert.equal(reparsed.generation.questionCount, 4);
  assert.equal(reparsed.printLayout.columns, 2);
  assert.equal(reparsed.printLayout.rowsPerPage, 2);
  assert.equal(reparsed.printLayout.showAnswerKeyPage, true);
});

test("config editor - valid config edit still generates", () => {
  const state = createConfigState({ presetId: "default" });
  const modifiedConfig = JSON.parse(JSON.stringify(state.draftConfig));
  modifiedConfig.generation.questionCount = 8;
  modifiedConfig.printLayout.columns = 3;
  modifiedConfig.printLayout.rowsPerPage = 3;
  modifiedConfig.patternPlan.allocation.totalQuestionCount = 8;
  modifiedConfig.patternPlan.allocation.fixedCounts = [
    { patternId: "default_integer_add_sub_2op", questionCount: 8 }
  ];

  state.draftConfig = modifiedConfig;

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
});

test("config editor - invalid config keeps last valid worksheet separate", () => {
  const state = createConfigState({ presetId: "default" });
  const validResult = buildWorksheetDocumentFromState(state);
  assert.equal(validResult.ok, true);

  const modifiedConfig = JSON.parse(JSON.stringify(state.draftConfig));
  modifiedConfig.generation.questionCount = -1;
  state.draftConfig = modifiedConfig;

  const invalidResult = buildWorksheetDocumentFromState(state);
  assert.equal(invalidResult.ok, false);
  assert.equal(validResult.worksheetDocument.summary.questionCount, 20);
  assert.equal(invalidResult.worksheetDocument, null);
});

test("config editor - reset to preset restores preset values", () => {
  const state = createConfigState({ presetId: "grouped" });
  state.draftConfig.generation.questionCount = 99;
  state.draftConfig.printLayout.columns = 5;

  applyPreset(state, "grouped");

  assert.equal(state.draftConfig.generation.questionCount, 4);
  assert.equal(state.draftConfig.printLayout.columns, 2);
  assert.equal(state.draftConfig.printLayout.showAnswerKeyPage, true);
});

test("config editor - question count helper updates generation and allocation", () => {
  const state = createConfigState({ presetId: "grouped" });
  setQuestionCount(state, 10);

  const total = state.draftConfig.patternPlan.allocation.fixedCounts.reduce(
    (sum, item) => sum + (item?.questionCount ?? 0), 0
  );

  assert.equal(state.draftConfig.generation.questionCount, 10);
  assert.equal(state.draftConfig.patternPlan.allocation.totalQuestionCount, 10);
  assert.equal(total, 10);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 10);
});

test("config editor - columns and rows helpers still generate", () => {
  const state = createConfigState({ presetId: "default" });
  setColumns(state, 2);
  setRowsPerPage(state, 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(state.draftConfig.printLayout.columns, 2);
  assert.equal(state.draftConfig.printLayout.rowsPerPage, 5);
});

test("config editor - ordering mode helper switches to shuffled", () => {
  const state = createConfigState({ presetId: "grouped" });
  setOrderingMode(state, "shuffleAcrossPatterns");

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
});

test("config editor - answer key toggle remains assembly-backed", () => {
  const state = createConfigState({ presetId: "grouped" });
  setShowAnswerKeyPage(state, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
});

test("config editor - site runtime still avoids tools preview and src imports", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    assert.equal(text.includes("tools/preview"), false, `${filePath} should not reference tools/preview`);

    if (filePath.endsWith("site/modules/renderer/html-renderer.js")) {
      const srcMatches = text.match(/src\//g) ?? [];
      assert.equal(srcMatches.length <= 1, true);
      continue;
    }

    assert.equal(text.includes("src/"), false, `${filePath} should not reference src/`);
  }
});

test("config editor - html labels are Traditional Chinese", () => {
  const indexHtml = readText("site/index.html");
  const notFoundHtml = readText("site/404.html");

  assert.match(indexHtml, /數學練習題產生器/);
  assert.match(indexHtml, /預設題組/);
  assert.match(indexHtml, /運算符號/);
  assert.match(indexHtml, /運算數範圍/);
  assert.match(indexHtml, /題目版面設定/);
  assert.match(indexHtml, /種子與答案頁/);
  assert.match(indexHtml, /進階 JSON 編輯/);
  assert.match(indexHtml, /重新產生/);
  assert.match(indexHtml, /列印/);
  assert.match(indexHtml, /尚未產生新的練習題/);
  assert.match(indexHtml, /lang="zh-Hant"/);

  assert.match(notFoundHtml, /找不到指定頁面/);
  assert.match(notFoundHtml, /lang="zh-Hant"/);
});

test("config editor - preset labels are Traditional Chinese", () => {
  const labels = listPresetDefinitions().map((preset) => preset.label);
  assert.deepEqual(labels, ["預設", "分組", "隨機排序", "多頁"]);
});

test("config editor - renderer output uses Traditional Chinese page headers", async () => {
  const state = createConfigState({ presetId: "grouped" });
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
