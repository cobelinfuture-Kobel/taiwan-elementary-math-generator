import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const HTML_URL = new URL(
  "../../docs/curriculum/output/smoke/S59J_G4B_U01_PublicHorizontalWorksheet.html",
  import.meta.url,
);
const PDF_URL = new URL(
  "../../docs/curriculum/output/smoke/S59J_G4B_U01_PublicHorizontalWorksheet.pdf",
  import.meta.url,
);
const MANIFEST_URL = new URL(
  "../../docs/curriculum/output/smoke/S59J_G4B_U01_PublicHorizontalWorksheet.manifest.json",
  import.meta.url,
);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

test("S59J committed manifest records a fully verified six-page public smoke", () => {
  const manifest = JSON.parse(readFileSync(MANIFEST_URL, "utf8"));
  assert.equal(manifest.schemaName, "G4BU01PublicHorizontalWorksheetSmokeManifest");
  assert.equal(manifest.task, "S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout");
  assert.equal(manifest.status, "public_html_pdf_smoke_pass");
  assert.equal(manifest.canonicalPublicPath, true);
  assert.equal(manifest.applicationModeUsed, false);
  assert.equal(manifest.horizontalOnly, true);
  assert.equal(manifest.verticalRepresentationUsed, false);
  assert.equal(manifest.publicHiddenModeFlagUsed, false);
  assert.equal(manifest.representationToggleUsed, false);
  assert.equal(manifest.routeKind, "g4b_u01_pure_horizontal");
  assert.equal(manifest.questionCount, 72);
  assert.equal(manifest.answerKeyItemCount, 72);
  assert.equal(manifest.questionPageCount, 3);
  assert.equal(manifest.answerKeyPageCount, 3);
  assert.equal(manifest.expectedPdfPageCount, 6);
  assert.equal(manifest.actualPdfPageCount, 6);
  assert.equal(manifest.visibleKnowledgePointCount, 9);
  assert.equal(manifest.visiblePatternGroupCount, 9);
  assert.equal(manifest.promotedPatternSpecCount, 12);
  assert.equal(manifest.reachedPatternSpecCount, 12);
  assert.equal(manifest.validationErrorCount, 0);
  assert.equal(manifest.internalIdLeakCount, 0);
  assert.equal(manifest.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.rendererProfileId, "g4b_u01_horizontal_numeric_v1");
  assert.deepEqual(manifest.questionLayout, { columns: 3, rowsPerPage: 8 });
  assert.deepEqual(manifest.answerKeyLayout, { columns: 3, rowsPerPage: 10 });
  assert.equal(manifest.noWrapExpression, true);
  assert.equal(manifest.avoidSplit, true);
  assert.equal(manifest.renderedPageImageCount, 6);
  assert.equal(manifest.nonblankRenderedPageCount, 6);
  assert.equal(manifest.extractedQuestionExpressionCount, 72);
  assert.equal(manifest.extractedAnswerExpressionCount, 72);
  assert.equal(manifest.traditionalChineseFont, "Noto Sans CJK TC");
  assert.equal(manifest.cjkGlyphRendering, "pass");
  assert.equal(manifest.visualRenderVerification, "all_pages_rendered_nonblank");
});

test("S59J committed HTML matches its manifest and contains exactly 72 questions and answers", () => {
  const html = readFileSync(HTML_URL, "utf8");
  const manifest = JSON.parse(readFileSync(MANIFEST_URL, "utf8"));
  assert.equal(sha256(html), manifest.htmlSha256);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--question"'), 72);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--answer-key"'), 72);
  assert.match(html, /4B-U01 多位數的乘與除/);
  assert.match(html, /worksheet-renderer--g4b-u01-horizontal/);
  assert.match(html, /data-renderer-profile="g4b_u01_horizontal_numeric_v1"/);
  assert.match(html, /white-space: nowrap/);
  assert.doesNotMatch(html, /(?:kp|pg|ps|tpl|ctx)_g4b_u01_/);
  assert.doesNotMatch(html, /hiddenMode|vertical_algorithm|word_problem|直式|長除法|\{\{/);
});

test("S59J committed PDF matches its manifest and is a complete PDF artifact", () => {
  const pdf = readFileSync(PDF_URL);
  const manifest = JSON.parse(readFileSync(MANIFEST_URL, "utf8"));
  assert.equal(pdf.length, manifest.pdfBytes);
  assert.equal(sha256(pdf), manifest.pdfSha256);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.match(pdf.subarray(Math.max(0, pdf.length - 1024)).toString("latin1"), /%%EOF/);
  assert.ok(pdf.length > 10000);
});
