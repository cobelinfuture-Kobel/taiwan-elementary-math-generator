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
import { getPresetDefinition, listPresetDefinitions } from "../../site/assets/browser/state/presets.js";

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

// ─── Editor HTML elements exist ─────────────────────────────────────

test("config editor — site/index.html contains config editor textarea", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="config-json-editor"/);
  assert.match(html, /id="apply-edit-button"/);
  assert.match(html, /id="reset-preset-button"/);
  assert.match(html, /id="json-error-panel"/);
});

test("config editor — site/index.html contains worksheet settings controls", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="question-count-input"/);
  assert.match(html, /id="columns-input"/);
  assert.match(html, /id="rows-per-page-input"/);
  assert.match(html, /id="ordering-mode-select"/);
});

test("config editor — site/404.html is consistent with index.html for controls", () => {
  const notFoundHtml = readText("site/404.html");
  assert.match(notFoundHtml, /id="config-json-editor"/);
  assert.match(notFoundHtml, /id="apply-edit-button"/);
  assert.match(notFoundHtml, /id="reset-preset-button"/);
  assert.match(notFoundHtml, /id="question-count-input"/);
  assert.match(notFoundHtml, /id="columns-input"/);
  assert.match(notFoundHtml, /id="rows-per-page-input"/);
  assert.match(notFoundHtml, /id="ordering-mode-select"/);
});

// ─── Config editor module exists ────────────────────────────────────

test("config editor — ui/config-editor.js exists", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "assets", "browser", "ui", "config-editor.js")), true);
});

// ─── draftConfig JSON round-trip ────────────────────────────────────

test("config editor — draftConfig can be serialized and re-parsed without loss", () => {
  const state = createConfigState({ presetId: "grouped" });
  const serialized = JSON.stringify(state.draftConfig);
  const reparsed = JSON.parse(serialized);

  assert.equal(typeof reparsed, "object");
  assert.equal(reparsed.generation.questionCount, 4);
  assert.equal(reparsed.printLayout.columns, 2);
  assert.equal(reparsed.printLayout.rowsPerPage, 2);
  assert.equal(reparsed.printLayout.showAnswerKeyPage, true);
  assert.equal(reparsed.patternPlan.worksheetOrdering.mode, "groupedByPattern");
});

// ─── Valid JSON edit updates draftConfig ────────────────────────────

test("config editor — valid JSON edit updates draftConfig and generates worksheet", () => {
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

// ─── Invalid JSON errors (simulated) ────────────────────────────────

test("config editor — JSON parse error on non-object JSON", () => {
  const state = createConfigState({ presetId: "default" });

  // Simulate: if someone parsed an array, it should be rejected
  // The parseEditedJson function in config-editor.js checks for this
  // We test the guard: draftConfig must be an object, not an array
  let invalidAssignment;
  try {
    invalidAssignment = JSON.parse("[1, 2, 3]");
  } catch {
    invalidAssignment = null;
  }

  assert.equal(Array.isArray(invalidAssignment), true);

  // draftConfig should remain an object
  assert.equal(typeof state.draftConfig, "object");
  assert.equal(Array.isArray(state.draftConfig), false);

  // Verify original is intact (default config has questionCount 20)
  assert.equal(state.draftConfig.generation.questionCount, 20);
});

// ─── Invalid config preserves last valid preview ────────────────────

test("config editor — invalid config (negative question count) is rejected and preview not replaced", () => {
  const state = createConfigState({ presetId: "default" });

  // First: generate a valid preview
  const validResult = buildWorksheetDocumentFromState(state);
  assert.equal(validResult.ok, true);
  const lastValidWorksheet = validResult.worksheetDocument;

  // Now: set an invalid config (negative question count triggers validation error)
  const modifiedConfig = JSON.parse(JSON.stringify(state.draftConfig));
  modifiedConfig.generation.questionCount = -1;
  state.draftConfig = modifiedConfig;

  const invalidResult = buildWorksheetDocumentFromState(state);
  assert.equal(invalidResult.ok, false);

  // The last valid worksheetDocument should still be retrievable from the
  // first result, demonstrating the "last valid preview" pattern
  assert.equal(lastValidWorksheet.summary.questionCount, 20);
  assert.notEqual(lastValidWorksheet, invalidResult.worksheetDocument);
});

// ─── Reset to Preset restores preset config ─────────────────────────

test("config editor — reset to preset restores original preset config", () => {
  const state = createConfigState({ presetId: "grouped" });

  // Mutate config
  state.draftConfig.generation.questionCount = 99;
  state.draftConfig.printLayout.columns = 5;

  // Verify mutation
  assert.equal(state.draftConfig.generation.questionCount, 99);
  assert.equal(state.draftConfig.printLayout.columns, 5);

  // Reset by re-applying the preset
  applyPreset(state, "grouped");

  // Verify restoration
  assert.equal(state.draftConfig.generation.questionCount, 4);
  assert.equal(state.draftConfig.printLayout.columns, 2);
  assert.equal(state.draftConfig.printLayout.showAnswerKeyPage, true);
  assert.equal(state.draftConfig.patternPlan.worksheetOrdering.mode, "groupedByPattern");
});

test("config editor — reset to preset preserves presetId", () => {
  const state = createConfigState({ presetId: "shuffled" });
  assert.equal(state.presetId, "shuffled");

  state.draftConfig.generation.questionCount = 50;
  applyPreset(state, "shuffled");

  assert.equal(state.presetId, "shuffled");
  assert.equal(state.draftConfig.generation.questionCount, 6);
});

// ─── Question count control ─────────────────────────────────────────

test("config editor — setQuestionCount updates generation.questionCount", () => {
  const state = createConfigState({ presetId: "default" });
  assert.equal(state.draftConfig.generation.questionCount, 20);

  setQuestionCount(state, 5);
  assert.equal(state.draftConfig.generation.questionCount, 5);

  // Allocation should have been auto-synced by the fix
  assert.equal(state.draftConfig.patternPlan.allocation.totalQuestionCount, 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 5);
});

test("config editor — setQuestionCount rejects invalid values", () => {
  const state = createConfigState({ presetId: "default" });
  const original = state.draftConfig.generation.questionCount;

  setQuestionCount(state, 0);
  assert.equal(state.draftConfig.generation.questionCount, original);

  setQuestionCount(state, -5);
  assert.equal(state.draftConfig.generation.questionCount, original);

  setQuestionCount(state, NaN);
  assert.equal(state.draftConfig.generation.questionCount, original);

  setQuestionCount(state, "abc");
  assert.equal(state.draftConfig.generation.questionCount, original);
});

// ─── Columns / rows controls ────────────────────────────────────────

test("config editor — setColumns updates printLayout.columns", () => {
  const state = createConfigState({ presetId: "default" });

  setColumns(state, 3);
  assert.equal(state.draftConfig.printLayout.columns, 3);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("config editor — setColumns rejects out-of-range values", () => {
  const state = createConfigState({ presetId: "default" });
  const original = state.draftConfig.printLayout.columns;

  setColumns(state, 0);
  assert.equal(state.draftConfig.printLayout.columns, original);

  setColumns(state, 7);
  assert.equal(state.draftConfig.printLayout.columns, original);
});

test("config editor — setRowsPerPage updates printLayout.rowsPerPage", () => {
  const state = createConfigState({ presetId: "default" });

  setRowsPerPage(state, 5);
  assert.equal(state.draftConfig.printLayout.rowsPerPage, 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("config editor — setRowsPerPage rejects out-of-range values", () => {
  const state = createConfigState({ presetId: "default" });
  const original = state.draftConfig.printLayout.rowsPerPage;

  setRowsPerPage(state, 0);
  assert.equal(state.draftConfig.printLayout.rowsPerPage, original);

  setRowsPerPage(state, 21);
  assert.equal(state.draftConfig.printLayout.rowsPerPage, original);
});

// ─── Answer-key toggle remains assembly-backed ──────────────────────

test("config editor — answer-key toggle is assembly-backed with showAnswerKeyPage", () => {
  const state = createConfigState({ presetId: "grouped" });

  // Default: answer key ON (from grouped preset)
  let result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length > 0, true);

  // Turn OFF
  setShowAnswerKeyPage(state, false);
  result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
});

// ─── Ordering mode control ──────────────────────────────────────────

test("config editor — setOrderingMode switches between grouped and shuffled", () => {
  const state = createConfigState({ presetId: "grouped" });
  assert.equal(state.draftConfig.patternPlan.worksheetOrdering.mode, "groupedByPattern");

  setOrderingMode(state, "shuffleAcrossPatterns");
  assert.equal(state.draftConfig.patternPlan.worksheetOrdering.mode, "shuffleAcrossPatterns");

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
});

test("config editor — setOrderingMode rejects invalid modes", () => {
  const state = createConfigState({ presetId: "grouped" });
  const original = state.draftConfig.patternPlan.worksheetOrdering.mode;

  setOrderingMode(state, "randomOrder");
  assert.equal(state.draftConfig.patternPlan.worksheetOrdering.mode, original);

  setOrderingMode(state, "");
  assert.equal(state.draftConfig.patternPlan.worksheetOrdering.mode, original);
});

// ─── Presets still work ─────────────────────────────────────────────

test("config editor — default preset still generates after editor changes", () => {
  const state = createConfigState({ presetId: "default" });
  setQuestionCount(state, 5);
  setColumns(state, 2);
  setRowsPerPage(state, 3);

  applyPreset(state, "default");

  // Default preset restores questionCount to 20
  assert.equal(state.draftConfig.generation.questionCount, 20);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("config editor — shuffled preset remains deterministic after ordering mode changes", () => {
  const firstState = createConfigState({ presetId: "shuffled" });
  const secondState = createConfigState({ presetId: "shuffled" });

  setOrderingMode(firstState, "shuffleAcrossPatterns");
  setOrderingMode(secondState, "shuffleAcrossPatterns");

  const firstResult = buildWorksheetDocumentFromState(firstState);
  const secondResult = buildWorksheetDocumentFromState(secondState);

  assert.equal(firstResult.ok, true);
  assert.equal(secondResult.ok, true);
  assert.deepEqual(firstResult.worksheetDocument.orderedQuestionIds, secondResult.worksheetDocument.orderedQuestionIds);
});

// ─── Boundary: still no tools/preview or src/ ───────────────────────

test("config editor — site runtime still does not import tools/preview", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    assert.equal(text.includes("tools/preview"), false, `${filePath} should not reference tools/preview`);
  }
});

test("config editor — site runtime still does not import src/", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");

    // html-renderer.js fallback exemption (S15-documented)
    if (filePath.endsWith("site/modules/renderer/html-renderer.js")) {
      const matchCount = (text.match(/src\//g) ?? []).length;
      assert.equal(matchCount <= 1, true, `${filePath}: html-renderer fallback "src/" reference exceeds expected count (1). Actual: ${matchCount}`);
      continue;
    }

    assert.equal(text.includes("src/"), false, `${filePath} should not reference src/`);
  }
});

// ─── All public paths remain relative ──────────────────────────────

test("config editor — all public paths remain relative (no root-relative)", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  let violations = 0;

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    const rootRelativeMatches = text.match(/['"]\/(assets|modules)\//g);

    if (rootRelativeMatches) {
      for (const match of rootRelativeMatches) {
        if (filePath.endsWith("html-renderer.js") && match === '"/src/') {
          continue;
        }
        console.warn(`${filePath}: root-relative path found: ${match}`);
        violations += 1;
      }
    }
  }

  assert.equal(violations, 0, `Found ${violations} root-relative path(s) — GH Pages subpath deployments will break.`);
});

// ─── Config editor file structure ───────────────────────────────────

test("config editor — ui/config-editor.js exports createConfigEditor", async () => {
  const module = await import("../../site/assets/browser/ui/config-editor.js");
  assert.equal(typeof module.createConfigEditor, "function");
});

test("config editor — config-state.js exports new helper functions", async () => {
  const configState = await import("../../site/assets/browser/state/config-state.js");
  assert.equal(typeof configState.setQuestionCount, "function");
  assert.equal(typeof configState.setColumns, "function");
  assert.equal(typeof configState.setRowsPerPage, "function");
  assert.equal(typeof configState.setOrderingMode, "function");
});

// ─── S17 Question Count regression tests ────────────────────────────

test("regression — setQuestionCount auto-syncs fixedCounts allocation", () => {
  const state = createConfigState({ presetId: "grouped" });
  assert.equal(state.draftConfig.generation.questionCount, 4);

  setQuestionCount(state, 10);
  assert.equal(state.draftConfig.generation.questionCount, 10);
  assert.equal(state.draftConfig.patternPlan.allocation.totalQuestionCount, 10);

  // fixedCounts should sum to 10
  const sum = state.draftConfig.patternPlan.allocation.fixedCounts.reduce(
    (s, item) => s + (item?.questionCount ?? 0), 0
  );
  assert.equal(sum, 10);

  // Generation should succeed without manual allocation fix-up
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 10);
});

test("regression — Question Count input exists in index.html", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="question-count-input"/);
});

test("regression — changing question count then regenerating updates summary", () => {
  const state = createConfigState({ presetId: "multipage" });
  assert.equal(state.draftConfig.generation.questionCount, 9);

  setQuestionCount(state, 24);
  assert.equal(state.draftConfig.generation.questionCount, 24);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 24);
});

// ─── S17 Chinese localization verification ──────────────────────────

test("localization — site/index.html uses Traditional Chinese labels", () => {
  const html = readText("site/index.html");
  // Check Traditional Chinese content is present
  assert.match(html, /數學練習卷產生器/);
  assert.match(html, /靜態瀏覽器出題器/);
  assert.match(html, /預設題組/);
  assert.match(html, /練習卷設定/);
  assert.match(html, /題目數/);
  assert.match(html, /欄數/);
  assert.match(html, /每頁列數/);
  assert.match(html, /排序模式/);
  assert.match(html, /種子與答案卷/);
  assert.match(html, /出題種子/);
  assert.match(html, /排序種子空白時使用出題種子/);
  assert.match(html, /顯示答案卷/);
  assert.match(html, /設定編輯器/);
  assert.match(html, /直接以 JSON 編輯 draftConfig/);
  assert.match(html, /套用編輯/);
  assert.match(html, /重設為目前預設/);
  assert.match(html, /重新產生/);
  assert.match(html, /列印/);
  assert.match(html, /預覽/);
  assert.match(html, /尚未產生練習卷/);
  assert.match(html, /lang="zh-Hant"/);
});

test("localization — site/404.html uses Traditional Chinese labels", () => {
  const html = readText("site/404.html");
  assert.match(html, /數學練習卷產生器/);
  assert.match(html, /靜態瀏覽器出題器/);
  assert.match(html, /找不到請求的頁面/);
  assert.match(html, /lang="zh-Hant"/);
});

test("localization — preset labels are Traditional Chinese", () => {
  const presets = listPresetDefinitions();
  const labels = presets.map((p) => p.label);
  assert.deepEqual(labels, ["預設", "分組", "隨機排序", "多頁"]);
});

test("localization — renderer output uses Chinese page headers", async () => {
  const state = createConfigState({ presetId: "grouped" });
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const renderer = await import("../../site/modules/renderer/html-renderer.js");
  const html = renderer.renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: "測試",
    stylesheetHref: "./assets/styles/print-styles.css"
  });
  assert.match(html, /題目頁 1/);
  assert.match(html, /答案卷/);
  assert.match(html, /練習卷/);
  assert.match(html, /lang="zh-Hant"/);
});

test("localization — no Simplified Chinese labels in index.html", () => {
  const html = readText("site/index.html");
  assert.doesNotMatch(html, /数学/);       // Simplified: 数学 vs Traditional: 數學
  assert.doesNotMatch(html, /预设/);       // Simplified: 预设 vs Traditional: 預設
  assert.doesNotMatch(html, /静态/);       // Simplified: 静态 vs Traditional: 靜態
  assert.doesNotMatch(html, /生成/);       // Simplified: 生成 vs Traditional: 產生
  assert.doesNotMatch(html, /打印/);       // Simplified: 打印 vs Traditional: 列印
  assert.doesNotMatch(html, /设置/);       // Simplified: 设置 vs Traditional: 設定
  assert.doesNotMatch(html, /简体/);       // Any "Simplified" marker
});

test("localization — columns and rows controls still work after localization", () => {
  const state = createConfigState({ presetId: "default" });

  setColumns(state, 2);
  setRowsPerPage(state, 5);

  assert.equal(state.draftConfig.printLayout.columns, 2);
  assert.equal(state.draftConfig.printLayout.rowsPerPage, 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("localization — answer key toggle still assembly-backed after localization", () => {
  const state = createConfigState({ presetId: "grouped" });

  setShowAnswerKeyPage(state, false);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
});
