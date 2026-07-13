import assert from "node:assert/strict";
import test from "node:test";
import {
  G5A_U02_HIDDEN_RENDERER_LIFECYCLE,
  auditG5AU02HiddenRendererIntegration,
  buildAndRenderG5AU02HiddenWorksheet,
  getG5AU02HiddenRendererProfiles,
  renderG5AU02HiddenWorksheetDocument,
  validateG5AU02HiddenRenderedWorksheet,
} from "../../src/curriculum/g5a-u02/hidden-renderer.js";
import {
  buildG5AU02HiddenWorksheetDocument,
  validateG5AU02HiddenWorksheetDocument,
} from "../../src/curriculum/g5a-u02/hidden-worksheet-answer-key.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFull(options = {}) {
  const result = buildAndRenderG5AU02HiddenWorksheet({
    questionCount: 22,
    baseSeed: 920,
    questionRowsPerPage: 6,
    answerRowsPerPage: 8,
    ...options,
  });
  assert.equal(result.ok, true, result.errors.join(","));
  return result;
}

test("S92 renderer audit covers three profiles and all 16 answer models", () => {
  const audit = auditG5AU02HiddenRendererIntegration();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(audit.profileCount, 3);
  assert.deepEqual([...audit.profilesSeen].sort(), ["compact", "contextual", "reasoning"]);
  assert.equal(audit.answerModelCount, 16);
  assert.equal(audit.selectorStatus, "hidden");
  assert.equal(audit.browserPipelineStatus, "not_connected");
  assert.equal(audit.productionUse, "forbidden");
});

test("S92 renders exact S91 question and answer pages as Traditional Chinese A4 HTML", () => {
  const { worksheetDocument, renderedWorksheet } = buildFull();
  assert.equal(renderedWorksheet.schemaName, "G5AU02HiddenRenderedWorksheet");
  assert.equal(renderedWorksheet.questionCount, 22);
  assert.equal(renderedWorksheet.questionPageCount, worksheetDocument.questionPages.length);
  assert.equal(renderedWorksheet.answerPageCount, worksheetDocument.answerKeyPages.length);
  assert.equal(renderedWorksheet.answerModelIds.length, 16);
  assert.match(renderedWorksheet.html, /^<!doctype html>/);
  assert.match(renderedWorksheet.html, /<html lang="zh-Hant">/);
  assert.match(renderedWorksheet.html, /@page\{size:A4/);
  assert.match(renderedWorksheet.html, /五上因數與公因數/);
  assert.match(renderedWorksheet.html, /姓名：____________/);
  assert.match(renderedWorksheet.html, /答案頁/);
  const validation = validateG5AU02HiddenRenderedWorksheet(renderedWorksheet, worksheetDocument);
  assert.equal(validation.ok, true, validation.errors.join(","));
});

test("S92 selects compact, contextual, and reasoning profiles from canonical modes", () => {
  const scenarios = [
    ["ps_g5a_u02_factor_enumeration_trial_division", "compact"],
    ["ps_g5a_u02_maximum_equal_grouping", "contextual"],
    ["ps_g5a_u02_missing_factor_reconstruction", "reasoning"],
  ];
  for (const [patternSpecId, profileId] of scenarios) {
    const result = buildAndRenderG5AU02HiddenWorksheet({
      patternSpecIds: [patternSpecId],
      questionCount: 3,
      baseSeed: 921,
    });
    assert.equal(result.ok, true, `${patternSpecId}:${result.errors.join(",")}`);
    assert.deepEqual(result.renderedWorksheet.profileIds, [profileId]);
    assert.match(result.renderedWorksheet.html, new RegExp(`g5a-u02-profile--${profileId}`));
  }
  const profiles = getG5AU02HiddenRendererProfiles();
  assert.equal(Object.isFrozen(profiles), true);
  assert.equal(profiles.compact.questionColumns, 2);
  assert.equal(profiles.reasoning.questionColumns, 1);
});

test("S92 suppresses answer HTML when the S91 answer key is disabled", () => {
  const { worksheetDocument, renderedWorksheet } = buildFull({ includeAnswerKey: false });
  assert.equal(worksheetDocument.answerKeyRecords.length, 0);
  assert.equal(worksheetDocument.answerKeyPages.length, 0);
  assert.equal(renderedWorksheet.answerKeyEnabled, false);
  assert.equal(renderedWorksheet.answerPageCount, 0);
  assert.doesNotMatch(renderedWorksheet.html, /g5a-u02-section--answer-key/);
  assert.doesNotMatch(renderedWorksheet.html, /答案頁/);
});

test("S92 question section contains no answer cells and rendered HTML leaks no curriculum IDs", () => {
  const { renderedWorksheet } = buildFull();
  const questionSection = renderedWorksheet.html.split('g5a-u02-section--answer-key')[0];
  assert.doesNotMatch(questionSection, /g5a-u02-card--answer/);
  assert.doesNotMatch(questionSection, /答案頁/);
  assert.doesNotMatch(renderedWorksheet.html, /ps_g5a_u02_|fm_g5a_u02_|fmc_g5a_u02_|pg_g5a_u02_|kp_g5a_u02_|g5a_u02_5a02a/);
});

test("S92 escapes prompt, title, subtitle, and stylesheet values", () => {
  const built = buildG5AU02HiddenWorksheetDocument({ questionCount: 2, baseSeed: 922 });
  assert.equal(built.ok, true, built.errors.join(","));
  const mutated = clone(built.worksheetDocument);
  const hostilePrompt = '<script>alert("x")</script> & 測試';
  mutated.questionRecords[0].prompt = hostilePrompt;
  mutated.questionPages[0].records[0].prompt = hostilePrompt;
  assert.equal(validateG5AU02HiddenWorksheetDocument(mutated).ok, true);
  const result = renderG5AU02HiddenWorksheetDocument(mutated, {
    title: '<b>標題</b>',
    subtitle: 'A&B',
    stylesheetHref: 'x" onload="alert(1)',
  });
  assert.equal(result.ok, true, result.errors.join(","));
  assert.doesNotMatch(result.renderedWorksheet.html.toLowerCase(), /<script/);
  assert.match(result.renderedWorksheet.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; 測試/);
  assert.match(result.renderedWorksheet.html, /&lt;b&gt;標題&lt;\/b&gt;/);
  assert.match(result.renderedWorksheet.html, /A&amp;B/);
  assert.match(result.renderedWorksheet.html, /x&quot; onload=&quot;alert\(1\)/);
});

test("S92 blocks malformed S91 documents before rendering", () => {
  const built = buildG5AU02HiddenWorksheetDocument({ questionCount: 2, baseSeed: 923 });
  assert.equal(built.ok, true);
  const malformed = clone(built.worksheetDocument);
  malformed.questionRecords[0].patternSpecId = "ps_g5a_u02_unknown";
  malformed.questionPages[0].records[0].patternSpecId = "ps_g5a_u02_unknown";
  const result = renderG5AU02HiddenWorksheetDocument(malformed);
  assert.equal(result.ok, false);
  assert.equal(result.renderedWorksheet, null);
  assert.ok(result.errors.some((error) => error.includes("UNKNOWN_PATTERN")));
});

test("S92 rendered validator rejects lifecycle, page-count, and profile mutation", () => {
  const { worksheetDocument, renderedWorksheet } = buildFull();
  const lifecycleMutation = clone(renderedWorksheet);
  lifecycleMutation.lifecycle.productionUse = "allowed";
  let validation = validateG5AU02HiddenRenderedWorksheet(lifecycleMutation, worksheetDocument);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_RENDERER_PRODUCTION_USE_FORBIDDEN"));

  const pageMutation = clone(renderedWorksheet);
  pageMutation.questionPageCount += 1;
  validation = validateG5AU02HiddenRenderedWorksheet(pageMutation, worksheetDocument);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_RENDERER_QUESTION_PAGE_COUNT_MISMATCH"));

  const profileMutation = clone(renderedWorksheet);
  profileMutation.profileIds = ["unknown"];
  validation = validateG5AU02HiddenRenderedWorksheet(profileMutation, worksheetDocument);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes("G5AU02_RENDERER_PROFILE_INVALID:unknown"));
});

test("S92 rendering is deterministic and does not mutate the closed S91 document", () => {
  const built = buildG5AU02HiddenWorksheetDocument({ questionCount: 9, baseSeed: 924 });
  assert.equal(built.ok, true);
  const before = JSON.stringify(built.worksheetDocument);
  const first = renderG5AU02HiddenWorksheetDocument(built.worksheetDocument);
  const second = renderG5AU02HiddenWorksheetDocument(built.worksheetDocument);
  assert.equal(first.ok, true, first.errors.join(","));
  assert.equal(second.ok, true, second.errors.join(","));
  assert.equal(first.renderedWorksheet.html, second.renderedWorksheet.html);
  assert.equal(JSON.stringify(built.worksheetDocument), before);
  assert.equal(built.worksheetDocument.lifecycle.rendererStatus, "not_connected");
  assert.equal(first.renderedWorksheet.lifecycle.rendererStatus, "hidden_html_integrated");
});

test("S92 lifecycle remains hidden, unrouted publicly, unsmoked, and production-forbidden", () => {
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_RENDERER_LIFECYCLE), true);
  assert.deepEqual(G5A_U02_HIDDEN_RENDERER_LIFECYCLE, {
    unitId: "g5a_u02",
    rendererStatus: "hidden_html_integrated",
    worksheetStatus: "hidden_exact_count_integrated",
    answerKeyStatus: "hidden_integrated_optional",
    selectorStatus: "hidden",
    canonicalRouting: "internal_explicit_only",
    browserPipelineStatus: "not_connected",
    htmlPdfSmokeStatus: "not_run",
    productionUse: "forbidden",
    genericFallback: "forbidden",
    freeFormAI: "forbidden",
  });
});
