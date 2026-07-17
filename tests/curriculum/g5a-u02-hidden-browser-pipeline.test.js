import assert from "node:assert/strict";
import test from "node:test";
import {
  G5A_U02_HIDDEN_BROWSER_PIPELINE_LIFECYCLE,
  auditG5AU02HiddenBrowserPipeline,
  buildG5AU02HiddenBrowserBundle,
  validateG5AU02HiddenBrowserBundle,
} from "../../src/curriculum/g5a-u02/hidden-browser-pipeline.js";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function buildFull(options = {}) {
  const result = buildG5AU02HiddenBrowserBundle({
    questionCount: 22,
    baseSeed: 9300,
    questionRowsPerPage: 1,
    answerRowsPerPage: 1,
    ...options,
  });
  assert.equal(result.ok, true, result.errors.join(","));
  return result;
}

test("S93 audit covers all 22 PatternSpecs, 19 supported answer models, and three profiles", () => {
  const audit = auditG5AU02HiddenBrowserPipeline();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.answerModelCount, 19);
  assert.deepEqual([...audit.profileIds].sort(), ["compact", "contextual", "reasoning"]);
  assert.equal(audit.selectorStatus, "hidden");
  assert.equal(audit.browserPipelineStatus, "hidden_connected");
  assert.equal(audit.htmlPdfSmokeStatus, "pipeline_ready_pending_ci");
  assert.equal(audit.productionUse, "forbidden");
});

test("S93 builds an exact hidden browser bundle with 22 question and 22 answer pages", () => {
  const result = buildFull();
  const { browserBundle, worksheetDocument, renderedWorksheet } = result;
  assert.equal(browserBundle.schemaName, "G5AU02HiddenBrowserBundle");
  assert.equal(browserBundle.questionCount, 22);
  assert.equal(browserBundle.answerCount, 22);
  assert.equal(browserBundle.questionPageCount, 22);
  assert.equal(browserBundle.answerPageCount, 22);
  assert.equal(browserBundle.expectedPdfPageCount, 44);
  assert.equal(browserBundle.questionPageCount, renderedWorksheet.questionPageCount);
  assert.equal(browserBundle.answerPageCount, renderedWorksheet.answerPageCount);
  assert.equal(browserBundle.questionCount, worksheetDocument.questionCount);
  assert.equal(browserBundle.answerCount, worksheetDocument.answerKeyRecords.length);
  assert.equal(browserBundle.answerModelIds.length, 19);
  assert.ok(browserBundle.answerModelIds.includes("partitionPairListAnswer"));
  assert.ok(browserBundle.answerModelIds.includes("tileSideAreaPairListAnswer"));
  assert.ok(browserBundle.answerModelIds.includes("commonFactorAndGcfAnswer"));
});

test("S93 browser HTML is Traditional Chinese, noindex, deterministic, and internally marked", () => {
  const first = buildFull();
  const second = buildFull();
  assert.equal(first.browserBundle.html, second.browserBundle.html);
  assert.match(first.browserBundle.html, /^<!doctype html>/);
  assert.match(first.browserBundle.html, /<html lang="zh-Hant">/);
  assert.match(first.browserBundle.html, /name="robots" content="noindex,nofollow"/);
  assert.match(first.browserBundle.html, /data-s93-hidden-browser-pipeline="true"/);
  assert.match(first.browserBundle.html, /五上因數與公因數/);
  assert.match(first.browserBundle.html, /答案頁/);
});

test("S93 exact browser card counts match the closed S91 document", () => {
  const { browserBundle } = buildFull();
  const questionCards = browserBundle.html.split('class="g5a-u02-card g5a-u02-card--question').length - 1;
  const answerCards = browserBundle.html.split('class="g5a-u02-card g5a-u02-card--answer').length - 1;
  assert.equal(questionCards, browserBundle.questionCount);
  assert.equal(answerCards, browserBundle.answerCount);
});

test("S93 reaches compact, contextual, and reasoning browser profiles", () => {
  const { browserBundle } = buildFull();
  assert.deepEqual([...browserBundle.profileIds].sort(), ["compact", "contextual", "reasoning"]);
  for (const profileId of browserBundle.profileIds) assert.match(browserBundle.html, new RegExp(`g5a-u02-profile--${profileId}`));
});

test("S93 answer-key suppression emits zero answers and no answer section", () => {
  const result = buildFull({ questionCount: 7, baseSeed: 9301, includeAnswerKey: false });
  assert.equal(result.browserBundle.answerKeyEnabled, false);
  assert.equal(result.browserBundle.answerCount, 0);
  assert.equal(result.browserBundle.answerPageCount, 0);
  assert.doesNotMatch(result.browserBundle.html, /g5a-u02-section--answer-key/);
  assert.doesNotMatch(result.browserBundle.html, /答案頁/);
});

test("S93 browser output leaks no curriculum IDs or unresolved placeholders", () => {
  const { browserBundle } = buildFull();
  assert.doesNotMatch(browserBundle.html, /\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/i);
  assert.doesNotMatch(browserBundle.html, /\{\{[^{}]+\}\}/);
});

test("S93 browser validator rejects lifecycle, page-count, and HTML mutations", () => {
  const result = buildFull();
  const lifecycleMutation = clone(result.browserBundle);
  lifecycleMutation.lifecycle.productionUse = "allowed";
  let validation = validateG5AU02HiddenBrowserBundle(lifecycleMutation, result);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_BROWSER_PRODUCTION_USE_FORBIDDEN"));
  const pageMutation = clone(result.browserBundle);
  pageMutation.expectedPdfPageCount += 1;
  validation = validateG5AU02HiddenBrowserBundle(pageMutation, result);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_BROWSER_EXPECTED_PDF_PAGE_COUNT_MISMATCH"));
  const htmlMutation = clone(result.browserBundle);
  htmlMutation.html += "<span>kp_g5a_u02_leak</span>";
  validation = validateG5AU02HiddenBrowserBundle(htmlMutation, result);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_BROWSER_INTERNAL_ID_LEAK"));
});

test("S93 does not mutate the closed S91 document or S92 rendered worksheet", () => {
  const result = buildFull();
  assert.equal(result.worksheetDocument.lifecycle.rendererStatus, "not_connected");
  assert.equal(result.renderedWorksheet.lifecycle.browserPipelineStatus, "not_connected");
  assert.equal(result.renderedWorksheet.lifecycle.htmlPdfSmokeStatus, "not_run");
  assert.equal(result.browserBundle.lifecycle.browserPipelineStatus, "hidden_connected");
  assert.equal(result.browserBundle.lifecycle.htmlPdfSmokeStatus, "pipeline_ready_pending_ci");
});

test("S93 lifecycle remains hidden, non-public, and production-forbidden", () => {
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_BROWSER_PIPELINE_LIFECYCLE), true);
  assert.deepEqual(G5A_U02_HIDDEN_BROWSER_PIPELINE_LIFECYCLE, {
    unitId: "g5a_u02", rendererStatus: "hidden_html_integrated", worksheetStatus: "hidden_exact_count_integrated",
    answerKeyStatus: "hidden_integrated_optional", selectorStatus: "hidden", canonicalRouting: "internal_explicit_only",
    browserPipelineStatus: "hidden_connected", htmlPdfSmokeStatus: "pipeline_ready_pending_ci",
    productionUse: "forbidden", genericFallback: "forbidden", freeFormAI: "forbidden",
  });
});
