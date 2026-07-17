import {
  buildAndRenderG5AU02HiddenWorksheet,
  validateG5AU02HiddenRenderedWorksheet,
} from "./hidden-renderer.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const BROWSER_PIPELINE_LIFECYCLE = deepFreeze({
  unitId: "g5a_u02",
  rendererStatus: "hidden_html_integrated",
  worksheetStatus: "hidden_exact_count_integrated",
  answerKeyStatus: "hidden_integrated_optional",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  browserPipelineStatus: "hidden_connected",
  htmlPdfSmokeStatus: "pipeline_ready_pending_ci",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

const PROFILE_IDS = Object.freeze(["compact", "contextual", "reasoning"]);
const INTERNAL_ID_PATTERN = /\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi;
const EXPECTED_SUPPORTED_ANSWER_MODEL_COUNT = 18;

function countToken(text, token) { return text.split(token).length - 1; }
function blocked(errors, source = null) {
  return deepFreeze({
    ok: false,
    errors: [...new Set(errors)],
    worksheetDocument: source?.worksheetDocument ?? null,
    renderedWorksheet: source?.renderedWorksheet ?? null,
    browserBundle: null,
  });
}

function addHiddenBrowserMetadata(html) {
  return html
    .replace(
      "<head>",
      '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S93 G5A-U02 hidden browser pipeline">',
    )
    .replace(
      '<body class="g5a-u02-renderer"',
      '<body class="g5a-u02-renderer" data-s93-hidden-browser-pipeline="true"',
    );
}

export function validateG5AU02HiddenBrowserBundle(browserBundle, source = {}) {
  const errors = [];
  const sourceValidation = validateG5AU02HiddenRenderedWorksheet(
    source.renderedWorksheet,
    source.worksheetDocument,
  );
  if (!sourceValidation.ok) errors.push(...sourceValidation.errors);
  if (!browserBundle || typeof browserBundle !== "object") {
    return deepFreeze({ ok: false, errors: ["G5AU02_BROWSER_BUNDLE_REQUIRED", ...errors] });
  }
  if (browserBundle.schemaName !== "G5AU02HiddenBrowserBundle" || browserBundle.unitId !== "g5a_u02") errors.push("G5AU02_BROWSER_BUNDLE_SCHEMA_INVALID");
  if (browserBundle.lifecycle?.browserPipelineStatus !== "hidden_connected") errors.push("G5AU02_BROWSER_PIPELINE_STATUS_INVALID");
  if (browserBundle.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_BROWSER_SELECTOR_SCOPE_BREACH");
  if (browserBundle.lifecycle?.htmlPdfSmokeStatus !== "pipeline_ready_pending_ci") errors.push("G5AU02_BROWSER_SMOKE_STATUS_INVALID");
  if (browserBundle.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_BROWSER_PRODUCTION_USE_FORBIDDEN");

  const worksheet = source.worksheetDocument;
  const rendered = source.renderedWorksheet;
  if (browserBundle.questionCount !== worksheet?.questionCount) errors.push("G5AU02_BROWSER_QUESTION_COUNT_MISMATCH");
  if (browserBundle.answerCount !== (worksheet?.answerKeyRecords?.length ?? 0)) errors.push("G5AU02_BROWSER_ANSWER_COUNT_MISMATCH");
  if (browserBundle.questionPageCount !== rendered?.questionPageCount) errors.push("G5AU02_BROWSER_QUESTION_PAGE_COUNT_MISMATCH");
  if (browserBundle.answerPageCount !== rendered?.answerPageCount) errors.push("G5AU02_BROWSER_ANSWER_PAGE_COUNT_MISMATCH");
  if (browserBundle.expectedPdfPageCount !== browserBundle.questionPageCount + browserBundle.answerPageCount) errors.push("G5AU02_BROWSER_EXPECTED_PDF_PAGE_COUNT_MISMATCH");

  const html = browserBundle.html;
  if (typeof html !== "string" || html.length === 0) {
    errors.push("G5AU02_BROWSER_HTML_MISSING");
  } else {
    if (!html.startsWith("<!doctype html>")) errors.push("G5AU02_BROWSER_DOCTYPE_MISSING");
    if (!html.includes('<html lang="zh-Hant">')) errors.push("G5AU02_BROWSER_LANGUAGE_INVALID");
    if (!html.includes('data-s93-hidden-browser-pipeline="true"')) errors.push("G5AU02_BROWSER_PIPELINE_MARKER_MISSING");
    if (!html.includes('name="robots" content="noindex,nofollow"')) errors.push("G5AU02_BROWSER_NOINDEX_MISSING");
    if (countToken(html, 'class="g5a-u02-card g5a-u02-card--question') !== browserBundle.questionCount) errors.push("G5AU02_BROWSER_QUESTION_CARD_COUNT_MISMATCH");
    if (countToken(html, 'class="g5a-u02-card g5a-u02-card--answer') !== browserBundle.answerCount) errors.push("G5AU02_BROWSER_ANSWER_CARD_COUNT_MISMATCH");
    if ((html.match(INTERNAL_ID_PATTERN) ?? []).length > 0) errors.push("G5AU02_BROWSER_INTERNAL_ID_LEAK");
    if ((html.match(/\{\{[^{}]+\}\}/g) ?? []).length > 0) errors.push("G5AU02_BROWSER_UNRESOLVED_PLACEHOLDER");
  }
  for (const profileId of browserBundle.profileIds ?? []) {
    if (!PROFILE_IDS.includes(profileId)) errors.push(`G5AU02_BROWSER_PROFILE_INVALID:${profileId}`);
  }
  if ((browserBundle.profileIds ?? []).length === 0) errors.push("G5AU02_BROWSER_PROFILE_REQUIRED");
  if (browserBundle.answerKeyEnabled === false && browserBundle.answerCount !== 0) errors.push("G5AU02_BROWSER_ANSWER_SUPPRESSION_FAILED");
  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildG5AU02HiddenBrowserBundle(input = {}) {
  const source = buildAndRenderG5AU02HiddenWorksheet({
    questionCount: input.questionCount ?? 22,
    baseSeed: input.baseSeed ?? 9300,
    includeAnswerKey: input.includeAnswerKey ?? true,
    questionRowsPerPage: input.questionRowsPerPage ?? 1,
    answerRowsPerPage: input.answerRowsPerPage ?? 1,
    patternSpecIds: input.patternSpecIds,
    title: input.title ?? "五上因數與公因數｜隱藏瀏覽器驗證",
    subtitle: input.subtitle ?? "22 題 canonical route 綜合驗證",
    stylesheetHref: input.stylesheetHref ?? "",
  });
  if (!source.ok) return blocked(source.errors, source);
  const { worksheetDocument, renderedWorksheet } = source;
  const browserBundle = deepFreeze({
    schemaName: "G5AU02HiddenBrowserBundle",
    schemaVersion: 1,
    task: "S93_G5A_U02_HiddenBrowserPipelineAndHTMLPDFSmokeIntegration",
    unitId: "g5a_u02",
    bundleId: `${worksheetDocument.worksheetDocumentId}_browser`,
    html: addHiddenBrowserMetadata(renderedWorksheet.html),
    questionCount: worksheetDocument.questionCount,
    answerCount: worksheetDocument.answerKeyRecords.length,
    answerKeyEnabled: worksheetDocument.answerKeyEnabled,
    questionPageCount: renderedWorksheet.questionPageCount,
    answerPageCount: renderedWorksheet.answerPageCount,
    expectedPdfPageCount: renderedWorksheet.questionPageCount + renderedWorksheet.answerPageCount,
    profileIds: [...renderedWorksheet.profileIds],
    answerModelIds: [...renderedWorksheet.answerModelIds],
    lifecycle: BROWSER_PIPELINE_LIFECYCLE,
  });
  const validation = validateG5AU02HiddenBrowserBundle(browserBundle, source);
  if (!validation.ok) return blocked(validation.errors, source);
  return deepFreeze({ ok: true, errors: [], worksheetDocument, renderedWorksheet, browserBundle });
}

export function auditG5AU02HiddenBrowserPipeline() {
  const errors = [];
  const canonical = buildG5AU02HiddenBrowserBundle();
  if (!canonical.ok) errors.push(...canonical.errors);
  else {
    if (canonical.browserBundle.questionCount !== 22) errors.push("G5AU02_BROWSER_AUDIT_PATTERN_COUNT_MISMATCH");
    if (canonical.browserBundle.answerModelIds.length !== EXPECTED_SUPPORTED_ANSWER_MODEL_COUNT) errors.push("G5AU02_BROWSER_AUDIT_ANSWER_MODEL_COUNT_MISMATCH");
    if (PROFILE_IDS.some((profileId) => !canonical.browserBundle.profileIds.includes(profileId))) errors.push("G5AU02_BROWSER_AUDIT_PROFILE_COVERAGE_MISMATCH");
  }
  const suppressed = buildG5AU02HiddenBrowserBundle({ questionCount: 7, baseSeed: 9301, includeAnswerKey: false });
  if (!suppressed.ok) errors.push(...suppressed.errors);
  else if (suppressed.browserBundle.answerCount !== 0
    || suppressed.browserBundle.answerPageCount !== 0
    || suppressed.browserBundle.html.includes("g5a-u02-section--answer-key")) errors.push("G5AU02_BROWSER_AUDIT_ANSWER_SUPPRESSION_FAILED");
  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    patternSpecCount: canonical.browserBundle?.questionCount ?? 0,
    answerModelCount: canonical.browserBundle?.answerModelIds?.length ?? 0,
    profileIds: canonical.browserBundle?.profileIds ?? [],
    selectorStatus: BROWSER_PIPELINE_LIFECYCLE.selectorStatus,
    browserPipelineStatus: BROWSER_PIPELINE_LIFECYCLE.browserPipelineStatus,
    htmlPdfSmokeStatus: BROWSER_PIPELINE_LIFECYCLE.htmlPdfSmokeStatus,
    productionUse: BROWSER_PIPELINE_LIFECYCLE.productionUse,
  });
}

export const G5A_U02_HIDDEN_BROWSER_PIPELINE_LIFECYCLE = BROWSER_PIPELINE_LIFECYCLE;
