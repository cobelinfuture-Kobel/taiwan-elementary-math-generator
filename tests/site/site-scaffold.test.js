import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
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
    "site/modules/renderer/html-renderer.js",
    "site/modules/curriculum/batch-a/source-units.js",
    "site/modules/curriculum/batch-a/source-pattern-index.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator.js",
    "site/modules/curriculum/batch-a/batch-a-browser-validator.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet.js"
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

    if (filePath.endsWith("site/modules/renderer/html-renderer.js")) {
      const srcMatches = text.match(/src\//g) ?? [];
      assert.equal(srcMatches.length <= 1, true);
      continue;
    }

    assert.equal(text.includes("src/"), false, `${filePath} should not reference src/`);
  }

  const pipelineSource = readText("site/assets/browser/pipeline/build-worksheet-document.js");
  const renderSource = readText("site/assets/browser/pipeline/render-preview-frame.js");

  assert.equal(pipelineSource.includes("../../../modules/curriculum/batch-a/batch-a-browser-worksheet.js"), true);
  assert.equal(renderSource.includes("../../../modules/renderer/html-renderer.js"), true);
});

test("Batch A source units include all 13 production sourceIds", () => {
  const sourceIds = listBatchASourceUnits().map((unit) => unit.sourceId);
  assert.deepEqual(sourceIds, [
    "g3a_u01_3a01",
    "g3a_u02_3a02",
    "g3a_u03_3a03",
    "g3a_u06_3a06",
    "g3b_u01_3b01",
    "g3b_u04_3b04",
    "g3b_u08_3b08",
    "g4a_u01_4a01",
    "g4a_u02_4a02",
    "g4a_u04_4a04",
    "g4a_u08_4a08",
    "g4b_u01_4b01",
    "g5a_u08_5a08"
  ]);
});

test("Batch A default source generates a worksheet document", () => {
  const state = createConfigState();
  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.worksheetKind, "batchAWorksheet");
  assert.equal(result.worksheetDocument.batchA.sourceId, "g3a_u02_3a02");
  assert.equal(result.worksheetDocument.summary.questionCount > 0, true);
  assert.equal(result.worksheetDocument.questionPages.length > 0, true);
});

test("Batch A grouped ordering keeps pattern grouping", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchAQuestionCount(state, 8);
  setBatchAOrdering(state, "groupedByPattern");

  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.orderingMode, "groupedByPattern");
  assert.deepEqual(result.worksheetDocument.summary.patternIdsInRenderOrder, [
    "ps_g3a_u02_4digit_add_multi_carry",
    "ps_g3a_u02_4digit_sub_multi_borrow"
  ]);
});

test("Batch A shuffled ordering is deterministic for the same state", () => {
  const firstState = createConfigState();
  const secondState = createConfigState();
  setBatchASourceId(firstState, "g3b_u04_3b04");
  setBatchASourceId(secondState, "g3b_u04_3b04");
  setBatchAQuestionCount(firstState, 8);
  setBatchAQuestionCount(secondState, 8);
  setBatchAOrdering(firstState, "shuffleAcrossPatterns");
  setBatchAOrdering(secondState, "shuffleAcrossPatterns");

  const firstResult = buildWorksheetDocumentFromState(firstState);
  const secondResult = buildWorksheetDocumentFromState(secondState);

  assert.equal(firstResult.ok, true);
  assert.equal(secondResult.ok, true);
  assert.equal(firstResult.worksheetDocument.summary.orderingMode, "shuffleAcrossPatterns");
  assert.deepEqual(firstResult.worksheetDocument.orderedQuestionIds, secondResult.worksheetDocument.orderedQuestionIds);
});

test("Batch A multipage output can produce more than one question page", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 45);

  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.questionPages.length > 1, true);
});

test("Batch A answer key toggle affects assembled answer key pages", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, false);

  const result = buildWorksheetDocumentFromState(state);

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(result.worksheetDocument.printOptions.answerKeyPlacement, "none");
});
