import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { createConfigState } from "../../site/assets/browser/state/config-state.js";
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

test("site scaffold files exist", () => {
  [
    "site/index.html",
    "site/404.html",
    "site/assets/styles/app.css",
    "site/assets/styles/print-styles.css",
    "site/assets/browser/main.js",
    "site/assets/browser/state/presets.js",
    "site/assets/browser/state/config-state.js",
    "site/assets/browser/state/query-state.js",
    "site/assets/browser/pipeline/build-worksheet-document.js",
    "site/assets/browser/pipeline/render-preview-frame.js",
    "site/modules/core/index.js",
    "site/modules/renderer/html-renderer.js"
  ].forEach((relativePath) => {
    assert.equal(existsSync(path.join(PROJECT_ROOT, relativePath)), true, `${relativePath} should exist`);
  });
});

test("site HTML uses relative asset and module paths", () => {
  const indexHtml = readText("site/index.html");
  const notFoundHtml = readText("site/404.html");

  for (const html of [indexHtml, notFoundHtml]) {
    assert.match(html, /href="\.\/assets\/styles\/app\.css"/);
    assert.match(html, /src="\.\/assets\/browser\/main\.js"/);
    assert.doesNotMatch(html, /href="\/assets\//);
    assert.doesNotMatch(html, /src="\/assets\//);
  }
});

test("site runtime files do not import tools preview or src modules", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    assert.equal(text.includes("tools/preview"), false, `${filePath} should not reference tools/preview`);
  }

  const pipelineSource = readText("site/assets/browser/pipeline/build-worksheet-document.js");
  const renderSource = readText("site/assets/browser/pipeline/render-preview-frame.js");
  const presetsSource = readText("site/assets/browser/state/presets.js");

  assert.equal(pipelineSource.includes("../../../modules/core/index.js"), true);
  assert.equal(renderSource.includes("../../../modules/renderer/html-renderer.js"), true);
  assert.equal(presetsSource.includes("../../../modules/core/index.js"), true);
  assert.equal(pipelineSource.includes("src/"), false);
  assert.equal(renderSource.includes("src/"), false);
  assert.equal(presetsSource.includes("src/"), false);
});

test("presets include default grouped shuffled and multipage", () => {
  const presetIds = listPresetDefinitions().map((preset) => preset.id);
  assert.deepEqual(presetIds, ["default", "grouped", "shuffled", "multipage"]);
});

test("default preset generates a worksheet document", () => {
  const state = createConfigState({ presetId: "default" });
  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount > 0, true);
  assert.equal(result.worksheetDocument.questionPages.length > 0, true);
});

test("grouped preset generates grouped worksheet output", () => {
  const state = createConfigState({ presetId: "grouped" });
  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.orderingMode, "groupedByPattern");
  assert.deepEqual(result.worksheetDocument.summary.patternIdsInRenderOrder, ["group_sub", "group_add"]);
});

test("shuffled preset is deterministic for the same ordering seed", () => {
  const firstState = createConfigState({ presetId: "shuffled" });
  const secondState = createConfigState({ presetId: "shuffled" });

  const firstResult = buildWorksheetDocumentFromState(firstState);
  const secondResult = buildWorksheetDocumentFromState(secondState);

  assert.equal(firstResult.ok, true);
  assert.equal(secondResult.ok, true);
  assert.equal(firstResult.worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
  assert.deepEqual(firstResult.worksheetDocument.orderedQuestionIds, secondResult.worksheetDocument.orderedQuestionIds);
});

test("multipage preset produces more than one question page", () => {
  const state = createConfigState({ presetId: "multipage" });
  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.questionPages.length > 1, true);
});

test("answer key toggle affects assembled answer key pages", () => {
  const preset = getPresetDefinition("grouped");
  const state = createConfigState({ presetId: "grouped" });
  state.draftConfig.printLayout.showAnswerKeyPage = false;

  const result = buildWorksheetDocumentFromState(state);

  assert.equal(preset.draftConfig.printLayout.showAnswerKeyPage, true);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
});
