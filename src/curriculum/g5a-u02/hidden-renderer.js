import {
  buildG5AU02HiddenWorksheetDocument,
  getG5AU02HiddenWorksheetAnswerModelIds,
  validateG5AU02HiddenWorksheetDocument,
} from "./hidden-worksheet-answer-key.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const RENDERER_PROFILES = deepFreeze({
  compact: {
    profileId: "compact",
    questionColumns: 2,
    answerColumns: 2,
    supportedModes: ["concept", "numeric", "representation"],
  },
  contextual: {
    profileId: "contextual",
    questionColumns: 2,
    answerColumns: 1,
    supportedModes: ["application", "geometry_application"],
  },
  reasoning: {
    profileId: "reasoning",
    questionColumns: 1,
    answerColumns: 1,
    supportedModes: ["reasoning", "reasoning_application"],
  },
});

const PROFILE_IDS = Object.freeze(Object.keys(RENDERER_PROFILES));
const ANSWER_MODEL_IDS = Object.freeze(getG5AU02HiddenWorksheetAnswerModelIds());

const RENDERER_LIFECYCLE = deepFreeze({
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

function blocked(errors, worksheetDocument = null) {
  return deepFreeze({
    ok: false,
    errors: [...new Set(errors)],
    worksheetDocument,
    renderedWorksheet: null,
  });
}

function answerLabel(answerModelId) {
  const labels = {
    relationClassificationAnswer: "因數判定",
    integerListAnswer: "數值列表",
    factorPairListAnswer: "因數配對",
    orderedFactorRelationAnswer: "因數與配對",
    missingValueMapAnswer: "缺漏值",
    selectionSetAnswer: "選取結果",
    booleanAnswer: "判斷",
    integerListWithUnitAnswer: "所有可能值",
    problemTypeLabelAnswer: "題型",
    structuredInferenceAnswer: "推理結果",
    booleanSetAnswer: "判斷組",
    remainderAnswer: "餘數",
    integerAnswer: "答案",
    lengthListAnswer: "邊長",
    areaListAnswer: "面積",
    digitTupleAnswer: "密碼",
  };
  return labels[answerModelId] ?? "答案";
}

function profileForModes(modes) {
  if (modes.some((mode) => RENDERER_PROFILES.reasoning.supportedModes.includes(mode))) {
    return RENDERER_PROFILES.reasoning;
  }
  if (modes.some((mode) => RENDERER_PROFILES.contextual.supportedModes.includes(mode))) {
    return RENDERER_PROFILES.contextual;
  }
  return RENDERER_PROFILES.compact;
}

function pageHeader(document, pageNumber, answerKey, options) {
  const title = options.title ?? "五上因數與公因數";
  const subtitle = answerKey ? "答案頁" : options.subtitle ?? "因數與公因數綜合練習";
  return [
    '<header class="g5a-u02-page-header">',
    `<div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>`,
    answerKey
      ? ""
      : '<div class="g5a-u02-student-fields"><span>姓名：____________</span><span>日期：____________</span></div>',
    `<span class="g5a-u02-page-number">${answerKey ? "答案" : "題目"} ${escapeHtml(pageNumber)}</span>`,
    "</header>",
  ].join("");
}

function renderQuestionRecord(question) {
  return [
    `<article class="g5a-u02-card g5a-u02-card--question g5a-u02-card--${escapeHtml(question.mode)}">`,
    `<div class="g5a-u02-card__number">${escapeHtml(`${question.questionNumber}.`)}</div>`,
    `<div class="g5a-u02-card__prompt">${escapeHtml(question.prompt)}</div>`,
    `<div class="g5a-u02-card__response">${escapeHtml(question.responseLabel ?? "答：")} ______________________________</div>`,
    "</article>",
  ].join("");
}

function renderAnswerRecord(answer, question) {
  if (!question) throw new Error(`G5AU02_RENDERER_QUESTION_LOOKUP_FAILED:${answer.questionNumber}`);
  return [
    '<article class="g5a-u02-card g5a-u02-card--answer">',
    `<div class="g5a-u02-card__number">${escapeHtml(`${answer.questionNumber}.`)}</div>`,
    `<div class="g5a-u02-card__prompt g5a-u02-card__prompt--answer">${escapeHtml(question.prompt)}</div>`,
    `<div class="g5a-u02-card__answer"><strong>${escapeHtml(answerLabel(answer.answerModelId))}：</strong>${escapeHtml(answer.answerText)}</div>`,
    "</article>",
  ].join("");
}

function renderQuestionPage(document, page, options) {
  const profile = profileForModes(page.records.map((record) => record.mode));
  return {
    profileId: profile.profileId,
    html: [
      `<section class="worksheet-page print-page g5a-u02-page g5a-u02-page--questions g5a-u02-profile--${profile.profileId}" data-page-type="question">`,
      pageHeader(document, page.pageNumber, false, options),
      `<div class="g5a-u02-grid" style="--g5a-u02-columns:${profile.questionColumns};">`,
      page.records.map(renderQuestionRecord).join(""),
      "</div>",
      "</section>",
    ].join(""),
  };
}

function renderAnswerPage(document, page, questionByNumber, options) {
  const modes = page.records.map((record) => questionByNumber.get(record.questionNumber)?.mode ?? "reasoning");
  const profile = profileForModes(modes);
  return {
    profileId: profile.profileId,
    html: [
      `<section class="worksheet-page print-page g5a-u02-page g5a-u02-page--answers g5a-u02-profile--${profile.profileId}" data-page-type="answer">`,
      pageHeader(document, page.pageNumber, true, options),
      `<div class="g5a-u02-grid" style="--g5a-u02-columns:${profile.answerColumns};">`,
      page.records.map((record) => renderAnswerRecord(record, questionByNumber.get(record.questionNumber))).join(""),
      "</div>",
      "</section>",
    ].join(""),
  };
}

const STYLE = [
  '<style id="g5a-u02-s92-hidden-renderer-style">',
  '@page{size:A4;margin:0;}',
  'body.g5a-u02-renderer{margin:0;font-family:"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif;line-height:1.45;}',
  '.g5a-u02-document{display:flex;flex-direction:column;gap:24px;}',
  '.g5a-u02-page{box-sizing:border-box;width:210mm;min-height:297mm;padding:12mm;display:flex;flex-direction:column;gap:10px;break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;overflow:hidden;}',
  '.g5a-u02-page:last-child{break-after:auto;page-break-after:auto;}',
  '.g5a-u02-page-header{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:start;border-bottom:1px solid #999;padding-bottom:8px;}',
  '.g5a-u02-page-header h1{margin:0;font-size:1.15rem;}',
  '.g5a-u02-page-header p{margin:3px 0 0;font-size:.82rem;}',
  '.g5a-u02-student-fields{display:flex;gap:12px;font-size:.82rem;white-space:nowrap;}',
  '.g5a-u02-page-number{font-size:.78rem;white-space:nowrap;}',
  '.g5a-u02-grid{display:grid;grid-template-columns:repeat(var(--g5a-u02-columns),minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px;flex:1;min-height:0;}',
  '.g5a-u02-card{min-width:0;min-height:0;border:1px solid #aaa;border-radius:4px;padding:9px 11px;display:flex;flex-direction:column;gap:6px;overflow:hidden;break-inside:avoid;page-break-inside:avoid;}',
  '.g5a-u02-card__number{font-weight:700;font-size:.86rem;}',
  '.g5a-u02-card__prompt{font-size:.92rem;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;}',
  '.g5a-u02-card__response{margin-top:auto;padding-top:8px;font-size:.84rem;}',
  '.g5a-u02-profile--reasoning .g5a-u02-card__prompt{font-size:.9rem;}',
  '.g5a-u02-profile--contextual .g5a-u02-card__prompt{font-size:.89rem;}',
  '.g5a-u02-card--answer{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"number prompt" "answer answer";align-content:start;column-gap:8px;row-gap:5px;}',
  '.g5a-u02-card--answer .g5a-u02-card__number{grid-area:number;}',
  '.g5a-u02-card__prompt--answer{grid-area:prompt;font-size:.8rem;line-height:1.35;}',
  '.g5a-u02-card__answer{grid-area:answer;font-size:.88rem;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap;}',
  '@media print{.g5a-u02-document{gap:0;}.g5a-u02-page{height:297mm;min-height:297mm;max-height:297mm;border:0;box-shadow:none;margin:0;}}',
  "</style>",
].join("");

function createHtml(document, options = {}) {
  const title = options.title ?? "五上因數與公因數";
  const stylesheetHref = options.stylesheetHref ?? "";
  const questionByNumber = new Map(document.questionRecords.map((record) => [record.questionNumber, record]));
  const questionPages = document.questionPages.map((page) => renderQuestionPage(document, page, options));
  const answerPages = document.answerKeyPages.map((page) => renderAnswerPage(document, page, questionByNumber, options));
  const profileIds = [...new Set([...questionPages, ...answerPages].map((page) => page.profileId))];
  const html = [
    "<!doctype html>",
    '<html lang="zh-Hant">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "",
    STYLE,
    "</head>",
    '<body class="g5a-u02-renderer">',
    '<main class="g5a-u02-document">',
    `<section class="g5a-u02-section g5a-u02-section--questions">${questionPages.map((page) => page.html).join("")}</section>`,
    answerPages.length > 0
      ? `<section class="g5a-u02-section g5a-u02-section--answer-key">${answerPages.map((page) => page.html).join("")}</section>`
      : "",
    "</main>",
    "</body>",
    "</html>",
  ].join("");
  return { html, profileIds };
}

export function validateG5AU02HiddenRenderedWorksheet(renderedWorksheet, worksheetDocument) {
  const errors = [];
  const sourceValidation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  if (!sourceValidation.ok) errors.push(...sourceValidation.errors);
  if (!renderedWorksheet || typeof renderedWorksheet !== "object") {
    return deepFreeze({ ok: false, errors: ["G5AU02_RENDERER_OUTPUT_REQUIRED", ...errors] });
  }
  if (renderedWorksheet.schemaName !== "G5AU02HiddenRenderedWorksheet" || renderedWorksheet.unitId !== "g5a_u02") {
    errors.push("G5AU02_RENDERER_OUTPUT_SCHEMA_INVALID");
  }
  if (renderedWorksheet.lifecycle?.rendererStatus !== "hidden_html_integrated") errors.push("G5AU02_RENDERER_STATUS_INVALID");
  if (renderedWorksheet.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_RENDERER_SELECTOR_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.browserPipelineStatus !== "not_connected") errors.push("G5AU02_RENDERER_BROWSER_PIPELINE_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.htmlPdfSmokeStatus !== "not_run") errors.push("G5AU02_RENDERER_HTML_PDF_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_RENDERER_PRODUCTION_USE_FORBIDDEN");
  if (renderedWorksheet.questionPageCount !== worksheetDocument?.questionPages?.length) errors.push("G5AU02_RENDERER_QUESTION_PAGE_COUNT_MISMATCH");
  if (renderedWorksheet.answerPageCount !== worksheetDocument?.answerKeyPages?.length) errors.push("G5AU02_RENDERER_ANSWER_PAGE_COUNT_MISMATCH");
  if (!worksheetDocument?.answerKeyEnabled && renderedWorksheet.answerPageCount !== 0) errors.push("G5AU02_RENDERER_ANSWER_SUPPRESSION_FAILED");

  const html = renderedWorksheet.html;
  if (typeof html !== "string" || html.length === 0) errors.push("G5AU02_RENDERER_HTML_MISSING");
  else {
    if (!html.startsWith("<!doctype html>")) errors.push("G5AU02_RENDERER_DOCTYPE_MISSING");
    if (!html.includes('<html lang="zh-Hant">')) errors.push("G5AU02_RENDERER_LANGUAGE_INVALID");
    if (!html.includes("@page{size:A4")) errors.push("G5AU02_RENDERER_A4_STYLE_MISSING");
    if (!html.includes('class="g5a-u02-renderer"')) errors.push("G5AU02_RENDERER_BODY_CLASS_MISSING");
    if (html.toLowerCase().includes("<script")) errors.push("G5AU02_RENDERER_UNESCAPED_SCRIPT");
    const forbiddenTokens = ["ps_g5a_u02_", "fm_g5a_u02_", "fmc_g5a_u02_", "pg_g5a_u02_", "kp_g5a_u02_", "g5a_u02_5a02a"];
    for (const token of forbiddenTokens) if (html.includes(token)) errors.push("G5AU02_RENDERER_INTERNAL_ID_LEAKAGE");
    for (const question of worksheetDocument?.questionRecords ?? []) {
      if (!html.includes(escapeHtml(question.prompt))) errors.push("G5AU02_RENDERER_QUESTION_PROMPT_MISSING");
    }
    if (worksheetDocument?.answerKeyEnabled) {
      if (!html.includes("g5a-u02-section--answer-key")) errors.push("G5AU02_RENDERER_ANSWER_SECTION_MISSING");
      for (const answer of worksheetDocument?.answerKeyRecords ?? []) {
        if (!html.includes(escapeHtml(answer.answerText))) errors.push("G5AU02_RENDERER_ANSWER_TEXT_MISSING");
      }
    } else if (html.includes("g5a-u02-section--answer-key")) {
      errors.push("G5AU02_RENDERER_ANSWER_SUPPRESSION_FAILED");
    }
  }
  if (!Array.isArray(renderedWorksheet.profileIds) || renderedWorksheet.profileIds.length === 0) {
    errors.push("G5AU02_RENDERER_PROFILE_REQUIRED");
  } else {
    for (const profileId of renderedWorksheet.profileIds) {
      if (!PROFILE_IDS.includes(profileId)) errors.push(`G5AU02_RENDERER_PROFILE_INVALID:${profileId}`);
    }
  }
  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function renderG5AU02HiddenWorksheetDocument(worksheetDocument, options = {}) {
  const sourceValidation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  if (!sourceValidation.ok) return blocked(sourceValidation.errors, worksheetDocument);
  try {
    const { html, profileIds } = createHtml(worksheetDocument, options);
    const renderedWorksheet = deepFreeze({
      schemaName: "G5AU02HiddenRenderedWorksheet",
      schemaVersion: 1,
      unitId: "g5a_u02",
      sourceWorksheetDocumentId: worksheetDocument.worksheetDocumentId,
      questionCount: worksheetDocument.questionCount,
      questionPageCount: worksheetDocument.questionPages.length,
      answerKeyEnabled: worksheetDocument.answerKeyEnabled,
      answerPageCount: worksheetDocument.answerKeyPages.length,
      answerModelIds: ANSWER_MODEL_IDS,
      profileIds,
      html,
      lifecycle: RENDERER_LIFECYCLE,
    });
    const validation = validateG5AU02HiddenRenderedWorksheet(renderedWorksheet, worksheetDocument);
    if (!validation.ok) return blocked(validation.errors, worksheetDocument);
    return deepFreeze({ ok: true, errors: [], worksheetDocument, renderedWorksheet });
  } catch (error) {
    return blocked([error.message], worksheetDocument);
  }
}

export function buildAndRenderG5AU02HiddenWorksheet(input = {}, options = {}) {
  const built = buildG5AU02HiddenWorksheetDocument(input);
  if (!built.ok) return blocked(built.errors, null);
  return renderG5AU02HiddenWorksheetDocument(built.worksheetDocument, options);
}

export function auditG5AU02HiddenRendererIntegration() {
  const errors = [];
  const profilesSeen = new Set();
  const scenarios = [
    { patternSpecIds: ["ps_g5a_u02_factor_enumeration_trial_division"], questionCount: 3, baseSeed: 92 },
    { patternSpecIds: ["ps_g5a_u02_maximum_equal_grouping"], questionCount: 3, baseSeed: 192 },
    { patternSpecIds: ["ps_g5a_u02_missing_factor_reconstruction"], questionCount: 3, baseSeed: 292 },
  ];
  for (const scenario of scenarios) {
    const result = buildAndRenderG5AU02HiddenWorksheet(scenario);
    if (!result.ok) errors.push(...result.errors);
    else for (const profileId of result.renderedWorksheet.profileIds) profilesSeen.add(profileId);
  }
  const full = buildAndRenderG5AU02HiddenWorksheet({ questionCount: 22, baseSeed: 392, questionRowsPerPage: 22, answerRowsPerPage: 22 });
  if (!full.ok) errors.push(...full.errors);
  else {
    const validation = validateG5AU02HiddenRenderedWorksheet(full.renderedWorksheet, full.worksheetDocument);
    if (!validation.ok) errors.push(...validation.errors);
    if (full.renderedWorksheet.answerModelIds.length !== 16) errors.push("G5AU02_RENDERER_ANSWER_MODEL_COUNT_MISMATCH");
  }
  const suppressed = buildAndRenderG5AU02HiddenWorksheet({ questionCount: 5, baseSeed: 492, includeAnswerKey: false });
  if (!suppressed.ok) errors.push(...suppressed.errors);
  else if (suppressed.renderedWorksheet.answerPageCount !== 0 || suppressed.renderedWorksheet.html.includes("g5a-u02-section--answer-key")) {
    errors.push("G5AU02_RENDERER_ANSWER_SUPPRESSION_FAILED");
  }
  if (profilesSeen.size !== 3) errors.push("G5AU02_RENDERER_PROFILE_COVERAGE_MISMATCH");
  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    profileCount: PROFILE_IDS.length,
    profilesSeen: [...profilesSeen],
    answerModelCount: ANSWER_MODEL_IDS.length,
    selectorStatus: RENDERER_LIFECYCLE.selectorStatus,
    browserPipelineStatus: RENDERER_LIFECYCLE.browserPipelineStatus,
    productionUse: RENDERER_LIFECYCLE.productionUse,
  });
}

export function getG5AU02HiddenRendererProfiles() {
  return RENDERER_PROFILES;
}

export const G5A_U02_HIDDEN_RENDERER_LIFECYCLE = RENDERER_LIFECYCLE;
