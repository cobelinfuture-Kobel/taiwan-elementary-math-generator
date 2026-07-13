import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const ROOT = new URL("../../docs/curriculum/output/smoke/", import.meta.url);
const HTML_URL = new URL("S75_G4B_U04_PublicWorksheet.html", ROOT);
const PDF_URL = new URL("S75_G4B_U04_PublicWorksheet.pdf", ROOT);
const MANIFEST_URL = new URL("S75_G4B_U04_PublicWorksheet.manifest.json", ROOT);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("S75 committed smoke bundle exists and records verified D0 evidence", () => {
  assert.equal(existsSync(HTML_URL), true);
  assert.equal(existsSync(PDF_URL), true);
  assert.equal(existsSync(MANIFEST_URL), true);

  const html = readFileSync(HTML_URL, "utf8");
  const pdf = readFileSync(PDF_URL);
  const manifest = JSON.parse(readFileSync(MANIFEST_URL, "utf8"));

  assert.equal(manifest.status, "production_html_pdf_smoke_pass");
  assert.equal(manifest.productionUse, "allowed");
  assert.equal(manifest.distance, "D0_G4B_U04");
  assert.equal(manifest.sourceId, "g4b_u04_4b04");
  assert.equal(manifest.questionCount, 68);
  assert.equal(manifest.answerKeyItemCount, 68);
  assert.equal(manifest.questionPageCount, 17);
  assert.equal(manifest.answerKeyPageCount, 14);
  assert.equal(manifest.expectedPdfPageCount, 31);
  assert.equal(manifest.actualPdfPageCount, 31);
  assert.equal(manifest.visibleKnowledgePointCount, 12);
  assert.equal(manifest.reachedKnowledgePointCount, 12);
  assert.equal(manifest.visiblePatternGroupCount, 12);
  assert.equal(manifest.reachedPatternGroupCount, 12);
  assert.equal(manifest.promotedPatternSpecCount, 17);
  assert.equal(manifest.reachedPatternSpecCount, 17);
  assert.equal(manifest.reachedModeCount, 5);
  assert.equal(manifest.reachedAnswerShapeCount, 9);
  assert.equal(manifest.reachedRenderKindCount, 11);
  assert.equal(manifest.classCQuestionCount, 36);
  assert.equal(manifest.classDQuestionCount, 32);
  assert.equal(manifest.validationErrorCount, 0);
  assert.equal(manifest.htmlQuestionCellCount, 68);
  assert.equal(manifest.htmlAnswerCellCount, 68);
  assert.equal(manifest.internalIdLeakCount, 0);
  assert.equal(manifest.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.renderedPageImageCount, 31);
  assert.equal(manifest.nonblankRenderedPageCount, 31);
  assert.equal(manifest.pdfBoundingBoxOverflowCount, 0);
  assert.equal(manifest.cjkGlyphRendering, "pass");
  assert.equal(manifest.visualRenderVerification, "all_pages_nonblank_and_bbox_contained");
  assert.equal(manifest.htmlSha256, sha256(html));
  assert.equal(manifest.pdfSha256, sha256(pdf));
  assert.equal(manifest.pdfBytes, pdf.length);
  assert.ok(pdf.length > 100_000);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
});

test("S75 committed public HTML is Traditional Chinese and free of internal identifiers", () => {
  const html = readFileSync(HTML_URL, "utf8");
  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /概數/);
  assert.match(html, /答案頁/);
  assert.equal((html.match(/class="g4b-u04-cell g4b-u04-cell--question/g) ?? []).length, 68);
  assert.equal((html.match(/class="g4b-u04-cell g4b-u04-cell--answer/g) ?? []).length, 68);
  assert.doesNotMatch(html, /\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i);
  assert.doesNotMatch(html, /\{\{[^{}]+\}\}/);
});
