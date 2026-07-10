import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

import {
  buildG3BU04HiddenSemanticWorksheet
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-g3b-u04-extension.js";
import {
  renderG3BU04HiddenSemanticWorksheetHtml
} from "../../../site/modules/curriculum/batch-a/g3b-u04-hidden-semantic-html.js";
import {
  G3B_U04_HIDDEN_SEMANTIC_MODE
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js";

const artifactHtmlUrl = new URL(
  "../../../docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.html",
  import.meta.url
);
const artifactPdfUrl = new URL(
  "../../../docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.pdf",
  import.meta.url
);
const artifactManifestUrl = new URL(
  "../../../docs/curriculum/output/smoke/S57E8_G3B_U04_HiddenSemanticWorksheet.manifest.json",
  import.meta.url
);

function buildDocument() {
  const result = buildG3BU04HiddenSemanticWorksheet({
    sourceId: "g3b_u04_3b04",
    hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    questionCount: 64,
    generationSeed: "s57e8-hidden-html-pdf-smoke-v1",
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
    answerKeyLayout: { paperSize: "A4", columns: 1, rowsPerPage: 8, showQuestionNumbers: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.worksheetDocument;
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

test("S57E8 HTML renderer produces deterministic 16-page A4 content for 64 questions and answers", () => {
  const document = buildDocument();
  const options = {
    documentTitle: "3B-U04 兩步驟計算｜隱藏語意題型 HTML/PDF Smoke",
    generatedAt: "S57E8_DETERMINISTIC_BUILD"
  };
  const first = renderG3BU04HiddenSemanticWorksheetHtml(document, options);
  const replay = renderG3BU04HiddenSemanticWorksheetHtml(buildDocument(), options);
  assert.equal(replay, first);
  assert.equal(first.startsWith("<!doctype html>"), true);
  assert.ok(first.includes("<html lang=\"zh-Hant\">"));
  assert.ok(first.includes("@page { size: A4 portrait;"));
  assert.ok(first.includes("page-break-inside: avoid"));
  assert.equal(count(first, /<section class="sheet-page/g), 16);
  assert.equal(count(first, /<article class="question-card">/g), 64);
  assert.equal(count(first, /<article class="answer-card">/g), 64);
  assert.equal(count(first, /data-page-type="question"/g), 8);
  assert.equal(count(first, /data-page-type="answer"/g), 8);
  assert.ok(first.includes("3B-U04"));
  assert.ok(first.includes("兩步驟計算｜題目卷"));
  assert.ok(first.includes("兩步驟計算｜答案卷"));
  assert.ok(first.includes("不得作為公開選單或正式教材發布"));
  assert.equal(/\{[^}]+\}/.test(first), false);
});

test("S57E8 visible question and answer cards do not leak internal registry identifiers", () => {
  const html = renderG3BU04HiddenSemanticWorksheetHtml(buildDocument(), {
    generatedAt: "S57E8_DETERMINISTIC_BUILD"
  });
  const visibleCards = [...html.matchAll(/<article class="(?:question|answer)-card">([\s\S]*?)<\/article>/g)]
    .map((match) => match[1])
    .join("\n");
  assert.equal(/(?:kp_|pg_|ps_|tpl_|scnprof_)/.test(visibleCards), false);
  assert.equal(/undefined|null|NaN/.test(visibleCards), false);
  assert.equal(count(visibleCards, /答案：/g), 64);
  assert.equal(count(visibleCards, /算式：/g), 64);
});

test("S57E8 HTML metadata remains hidden, nonpublic, and internally consistent", () => {
  const document = buildDocument();
  const html = renderG3BU04HiddenSemanticWorksheetHtml(document, {
    generatedAt: "S57E8_DETERMINISTIC_BUILD"
  });
  assert.ok(html.includes('data-source-id="g3b_u04_3b04"'));
  assert.ok(html.includes('data-worksheet-mode="g3b_u04_hidden_semantic"'));
  assert.ok(html.includes('data-question-count="64"'));
  assert.ok(html.includes('data-template-family-count="32"'));
  assert.ok(html.includes('data-knowledge-point-count="9"'));
  assert.equal(document.visibilityStatus, "hidden");
  assert.equal(document.selectorStatus, "hidden");
  assert.equal(document.productionUse, "forbidden");
  assert.equal(document.publicProjectionChanged, false);
  assert.equal(document.validation.errors.length, 0);
});

test("S57E8 committed HTML/PDF artifacts satisfy manifest and binary smoke when materialized", () => {
  if (!existsSync(artifactHtmlUrl) || !existsSync(artifactPdfUrl) || !existsSync(artifactManifestUrl)) {
    return;
  }
  const html = readFileSync(artifactHtmlUrl, "utf8");
  const pdf = readFileSync(artifactPdfUrl);
  const manifest = JSON.parse(readFileSync(artifactManifestUrl, "utf8"));
  assert.equal(manifest.schemaName, "S57E8G3BU04HiddenSemanticSmokeManifest");
  assert.equal(manifest.questionCount, 64);
  assert.equal(manifest.answerKeyItemCount, 64);
  assert.equal(manifest.knowledgePointCount, 9);
  assert.equal(manifest.templateFamilyCount, 32);
  assert.equal(manifest.questionPageCount, 8);
  assert.equal(manifest.answerKeyPageCount, 8);
  assert.equal(manifest.expectedPdfPageCount, 16);
  assert.equal(manifest.actualPdfPageCount, 16);
  assert.equal(manifest.validation.semanticErrors, 0);
  assert.equal(manifest.validation.unresolvedPlaceholders, 0);
  assert.equal(manifest.validation.nonPositiveAnswers, 0);
  assert.equal(manifest.validation.publicProjectionChanged, false);
  assert.equal(manifest.status, "html_pdf_smoke_pass");
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal(pdf.subarray(-20).toString("latin1").includes("%%EOF"), true);
  assert.ok(pdf.length >= 20000);
  assert.equal(manifest.pdfBytes, pdf.length);
  assert.equal(manifest.htmlBytes, Buffer.byteLength(html, "utf8"));
  assert.equal(statSync(artifactPdfUrl).size, manifest.pdfBytes);
  assert.match(manifest.pdfSha256, /^[a-f0-9]{64}$/);
  assert.equal(count(html, /<article class="question-card">/g), 64);
  assert.equal(count(html, /<article class="answer-card">/g), 64);
});
