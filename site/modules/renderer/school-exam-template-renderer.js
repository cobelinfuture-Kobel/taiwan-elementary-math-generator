import {
  renderAnswerKeyCell,
  renderQuestionCell,
} from "./html-renderer.js";

export const SCHOOL_EXAM_TEMPLATE_V1 = Object.freeze({
  templateId: "school_exam_tw_g06_common_v1",
  sourceBasis: "G06 historical school exam layout sample",
  pageSize: "A4 portrait",
  bodyLayout: "two-column variable-height flow",
  studentFields: Object.freeze(["班級", "座號", "姓名"]),
  copiedSchoolBranding: false,
});

export const SCHOOL_EXAM_LAYOUT_V11 = Object.freeze({
  layoutVersion: "school_exam_layout_v1_1",
  questionColumnBudget: 100,
  answerColumnBudget: 125,
  columns: 2,
  minQuestionUnits: 8,
  maxQuestionUnits: 92,
  minAnswerUnits: 6,
  maxAnswerUnits: 70,
  keepQuestionTogether: true,
  sectionHeadingSpansColumns: true,
  answerLayoutDensity: "dense",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function flattenQuestionCells(document) {
  if (Array.isArray(document?.questionDisplayModels) && document.questionDisplayModels.length > 0) {
    return document.questionDisplayModels.map((displayModel, index) => ({
      pageNumber: null,
      rowIndex: null,
      columnIndex: null,
      cellIndex: index,
      cellType: "question",
      questionId: displayModel?.questionId ?? null,
      questionNumber: displayModel?.questionNumber ?? index + 1,
      displayModel,
    }));
  }
  return (document?.questionPages ?? []).flatMap((page) =>
    (page?.cells ?? []).filter((cell) => cell?.cellType === "question" && cell?.displayModel)
  );
}

function flattenAnswerCells(document) {
  if (Array.isArray(document?.answerKeyItems) && document.answerKeyItems.length > 0) {
    return document.answerKeyItems.map((answerKeyItem, index) => ({
      pageNumber: null,
      rowIndex: null,
      columnIndex: null,
      cellIndex: index,
      cellType: "answerKey",
      questionId: answerKeyItem?.questionId ?? null,
      questionNumber: answerKeyItem?.questionNumber ?? index + 1,
      answerKeyItem,
    }));
  }
  return (document?.answerKeyPages ?? []).flatMap((page) =>
    (page?.cells ?? []).filter((cell) => cell?.cellType === "answerKey" && cell?.answerKeyItem)
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function textLineUnits(text, charsPerLine, unitsPerLine) {
  const length = String(text ?? "").trim().length;
  if (length === 0) return 0;
  return Math.max(1, Math.ceil(length / charsPerLine)) * unitsPerLine;
}

function representationUnits(model, dense = false) {
  if (!model || typeof model !== "object") return 0;
  if (model.chartData) return dense ? 18 : 48;
  if (model.tableData) return dense ? 16 : 46;
  // Actual M6 print geometry showed that two diagram-bearing cells can exceed
  // the available A4 column height even when the earlier heuristic admitted
  // both. Keep rich representations indivisible and budget them
  // conservatively so the packer starts a new page before browser clipping.
  if (model.geometryDiagram) return dense ? 17 : 48;
  if (model.numberLine) return dense ? 12 : 32;
  return 0;
}

export function estimateSchoolExamQuestionUnits(cell) {
  const model = cell?.displayModel ?? {};
  const prompt = model.blankedDisplayText ?? model.promptText ?? "";
  const responsePrompt = model.responsePrompt ?? "";
  const base = 7;
  const promptUnits = textLineUnits(prompt, 30, 3);
  const responseUnits = textLineUnits(responsePrompt, 32, 3);
  const modeBonus = String(model?.layoutHints?.questionMode ?? "").toLowerCase().includes("application") ? 5 : 0;
  return clamp(
    base + promptUnits + responseUnits + representationUnits(model, false) + modeBonus,
    SCHOOL_EXAM_LAYOUT_V11.minQuestionUnits,
    SCHOOL_EXAM_LAYOUT_V11.maxQuestionUnits,
  );
}

export function estimateSchoolExamAnswerUnits(cell) {
  const item = cell?.answerKeyItem ?? {};
  const base = 5;
  const promptUnits = textLineUnits(item.promptText ?? "", 42, 2);
  const answerUnits = textLineUnits(item.answerText ?? "", 36, 2);
  return clamp(
    base + promptUnits + answerUnits + representationUnits(item, true),
    SCHOOL_EXAM_LAYOUT_V11.minAnswerUnits,
    SCHOOL_EXAM_LAYOUT_V11.maxAnswerUnits,
  );
}

function sumUnits(items, estimate) {
  return items.reduce((total, item) => total + estimate(item), 0);
}

function bestTwoColumnSplit(items, estimate, columnBudget) {
  if (items.length === 0) return { ok: true, left: [], right: [], leftUnits: 0, rightUnits: 0 };
  if (items.length === 1) {
    const units = estimate(items[0]);
    return {
      ok: units <= columnBudget,
      left: [...items],
      right: [],
      leftUnits: units,
      rightUnits: 0,
      oversized: units > columnBudget,
    };
  }

  let best = null;
  for (let split = 1; split < items.length; split += 1) {
    const left = items.slice(0, split);
    const right = items.slice(split);
    const leftUnits = sumUnits(left, estimate);
    const rightUnits = sumUnits(right, estimate);
    if (leftUnits > columnBudget || rightUnits > columnBudget) continue;
    const score = Math.abs(leftUnits - rightUnits);
    if (!best || score < best.score) {
      best = { ok: true, left, right, leftUnits, rightUnits, score };
    }
  }
  return best ?? { ok: false };
}

function packTwoColumnPages(cells, estimate, columnBudget, pageType) {
  const pages = [];
  let pending = [];

  const flush = () => {
    if (pending.length === 0) return;
    let split = bestTwoColumnSplit(pending, estimate, columnBudget);
    if (!split.ok) {
      // A single genuinely oversized item is still kept intact on one page so
      // the renderer never splits its prompt from geometry/table/chart content.
      if (pending.length === 1) {
        const units = estimate(pending[0]);
        split = {
          ok: true,
          left: [...pending],
          right: [],
          leftUnits: units,
          rightUnits: 0,
          oversized: true,
        };
      } else {
        throw new Error("SCHOOL_EXAM_LAYOUT_V11_SPLIT_INVARIANT");
      }
    }
    pages.push({
      pageNumber: pages.length + 1,
      pageType,
      layoutVersion: SCHOOL_EXAM_LAYOUT_V11.layoutVersion,
      columns: [
        { columnIndex: 0, cells: split.left, usedUnits: split.leftUnits },
        { columnIndex: 1, cells: split.right, usedUnits: split.rightUnits },
      ],
      itemCount: pending.length,
      oversizedItem: split.oversized === true,
    });
    pending = [];
  };

  for (const cell of cells) {
    const candidate = [...pending, cell];
    const split = bestTwoColumnSplit(candidate, estimate, columnBudget);
    if (split.ok || pending.length === 0) {
      pending = candidate;
      continue;
    }
    flush();
    pending = [cell];
  }
  flush();
  return pages;
}

export function buildSchoolExamLayoutPages(worksheetDocument) {
  const questionCells = flattenQuestionCells(worksheetDocument);
  const answerCells = flattenAnswerCells(worksheetDocument);
  const questionPages = packTwoColumnPages(
    questionCells,
    estimateSchoolExamQuestionUnits,
    SCHOOL_EXAM_LAYOUT_V11.questionColumnBudget,
    "questions",
  );
  const answerPages = packTwoColumnPages(
    answerCells,
    estimateSchoolExamAnswerUnits,
    SCHOOL_EXAM_LAYOUT_V11.answerColumnBudget,
    "answerKey",
  );
  return Object.freeze({
    layoutVersion: SCHOOL_EXAM_LAYOUT_V11.layoutVersion,
    questionPages: Object.freeze(questionPages),
    answerPages: Object.freeze(answerPages),
  });
}

function questionCells(page) {
  return (page?.cells ?? []).filter((cell) => cell?.cellType === "question" && cell?.displayModel);
}

function answerCells(page) {
  return (page?.cells ?? []).filter((cell) => cell?.cellType === "answerKey" && cell?.answerKeyItem);
}

function addResponsePrompt(html, cell) {
  const prompt = cell?.displayModel?.responsePrompt;
  if (!prompt) return html;
  return String(html).replace(
    "</article>",
    `<div class="school-exam-response-prompt">${escapeHtml(prompt)}</div></article>`,
  );
}

function renderQuestion(cell) {
  return addResponsePrompt(renderQuestionCell(cell, { debugDataAttributes: true }), cell);
}

function renderAnswer(cell) {
  return renderAnswerKeyCell(cell, { debugDataAttributes: true });
}

function header(meta, answerKey) {
  const fields = Array.isArray(meta.studentFields) && meta.studentFields.length > 0
    ? meta.studentFields
    : ["班級", "座號", "姓名"];
  const studentFields = answerKey
    ? ""
    : fields.map((label) => `<span>${escapeHtml(label)}：________________</span>`).join("");
  const scoreBox = answerKey || meta.showScoreBox === false
    ? ""
    : '<span class="school-exam-score">得分：______</span>';

  return [
    '<header class="school-exam-header">',
    `<h1>${escapeHtml(meta.schoolName)}</h1>`,
    '<div class="school-exam-title-line">',
    `<strong>${escapeHtml(meta.academicYear)} 學年度 ${escapeHtml(meta.semesterLabel)} ${escapeHtml(meta.gradeLabel)}</strong>`,
    `<strong>${escapeHtml(meta.examName)}・${escapeHtml(meta.subjectLabel)}</strong>`,
    answerKey ? '<strong>答案卷</strong>' : "",
    "</div>",
    meta.unitTitle ? `<div class="school-exam-scope">範圍：${escapeHtml(meta.unitTitle)}</div>` : "",
    answerKey ? "" : `<div class="school-exam-student-line">${studentFields}${scoreBox}</div>`,
    "</header>",
  ].join("");
}

function renderColumn(column, renderCell, kind) {
  const cells = (column?.cells ?? []).map(renderCell).join("");
  return `<div class="school-exam-column school-exam-column--${kind}" data-column-index="${column?.columnIndex ?? 0}" data-used-units="${column?.usedUnits ?? 0}">${cells}</div>`;
}

function renderQuestionPage(document, page, index, meta) {
  const columns = (page?.columns ?? []).map((column) => renderColumn(column, renderQuestion, "questions")).join("");
  return [
    `<section class="worksheet-page school-exam-page school-exam-page--questions" data-page-type="question" data-page-number="${index + 1}" data-layout-version="${escapeHtml(page?.layoutVersion ?? SCHOOL_EXAM_LAYOUT_V11.layoutVersion)}">`,
    header(meta, false),
    index === 0
      ? '<div class="school-exam-section-heading"><strong>一、請依題意作答</strong><span>請將計算過程或答案寫在題目空白處。</span></div>'
      : '<div class="school-exam-section-heading school-exam-section-heading--continuation"><strong>一、請依題意作答（續）</strong></div>',
    `<div class="school-exam-columns" data-column-count="2">${columns}</div>`,
    `<footer class="school-exam-footer"><span>${escapeHtml(meta.schoolName)}・${escapeHtml(meta.subjectLabel)}</span><span>第 ${index + 1} 頁</span></footer>`,
    "</section>",
  ].join("");
}

function renderAnswerPage(document, page, index, meta) {
  const columns = (page?.columns ?? []).map((column) => renderColumn(column, renderAnswer, "answers")).join("");
  return [
    `<section class="worksheet-page school-exam-page school-exam-page--answers" data-page-type="answer" data-page-number="${index + 1}" data-layout-version="${escapeHtml(page?.layoutVersion ?? SCHOOL_EXAM_LAYOUT_V11.layoutVersion)}">`,
    header(meta, true),
    '<div class="school-exam-section-heading"><strong>答案</strong><span>依題號對照。</span></div>',
    `<div class="school-exam-columns school-exam-columns--answers" data-column-count="2">${columns}</div>`,
    `<footer class="school-exam-footer"><span>答案卷</span><span>第 ${index + 1} 頁</span></footer>`,
    "</section>",
  ].join("");
}

const STYLE = `
<style id="school-exam-template-v1-style">
  body.school-exam-renderer {
    margin: 0;
    background: #e8edf1;
    color: #111;
    font-family: "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif;
  }
  .school-exam-renderer .worksheet-document {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
  .school-exam-page {
    width: min(100%, 820px);
    min-height: 297mm;
    margin: 0 auto;
    padding: 10mm 11mm 9mm;
    background: #fff;
    border: 1px solid #aeb6bf;
    box-shadow: 0 14px 36px rgba(0,0,0,.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .school-exam-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
  .school-exam-header {
    border-bottom: 1.5px solid #111;
    padding-bottom: 5px;
  }
  .school-exam-header h1 {
    margin: 0 0 3px;
    text-align: center;
    font-size: 17px;
    letter-spacing: .08em;
    font-weight: 700;
  }
  .school-exam-title-line {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px 12px;
    text-align: center;
    font-size: 13px;
    line-height: 1.35;
  }
  .school-exam-scope {
    margin-top: 4px;
    text-align: center;
    font-size: 11px;
  }
  .school-exam-student-line {
    margin-top: 7px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.5fr auto;
    gap: 8px;
    align-items: end;
    font-size: 11px;
  }
  .school-exam-score {
    border: 1px solid #111;
    padding: 4px 6px;
    min-width: 78px;
    text-align: center;
  }
  .school-exam-section-heading {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
    padding: 7px 0 5px;
    font-size: 12px;
  }
  .school-exam-section-heading span {
    font-size: 10px;
    color: #444;
  }
  .school-exam-section-heading--continuation {
    justify-content: flex-start;
  }
  .school-exam-columns {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    padding-top: 2px;
    overflow: hidden;
  }
  .school-exam-column {
    min-width: 0;
    padding: 0 4mm;
  }
  .school-exam-column:first-child {
    padding-left: 0;
  }
  .school-exam-column:last-child {
    padding-right: 0;
    border-left: 1px solid #333;
  }
  .school-exam-columns .worksheet-cell {
    display: block;
    min-height: 0;
    border: 0;
    border-bottom: 1px dotted #777;
    padding: 5px 3px 7px;
    margin: 0 0 6px;
    background: transparent;
    break-inside: avoid;
    page-break-inside: avoid;
    font-size: 11px;
    line-height: 1.45;
  }
  .school-exam-columns .worksheet-cell__number {
    display: inline;
    margin-right: 4px;
    font-size: 11px;
    font-weight: 700;
  }
  .school-exam-columns .worksheet-cell__prompt {
    display: inline;
    font-size: 11px;
    line-height: 1.5;
  }
  .school-exam-columns .worksheet-cell__representation {
    display: block;
    margin: 5px auto 0;
    max-width: 100%;
  }
  .school-exam-columns svg,
  .school-exam-columns table,
  .school-exam-columns canvas {
    max-width: 100%;
    height: auto;
  }
  .school-exam-response-prompt {
    display: block;
    margin-top: 7px;
    white-space: pre-wrap;
    min-height: 20px;
    font-size: 10px;
  }
  .school-exam-columns--answers .worksheet-cell {
    font-size: 10px;
    padding-top: 4px;
    padding-bottom: 5px;
  }
  .school-exam-columns--answers .worksheet-cell__prompt,
  .school-exam-columns--answers .worksheet-cell__answer {
    display: block;
    font-size: 10px;
    line-height: 1.35;
  }
  .school-exam-columns--answers .worksheet-cell__answer {
    margin-top: 3px;
    font-weight: 700;
  }
  .school-exam-footer {
    border-top: 1px solid #777;
    margin-top: 5px;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 9px;
  }
  @media screen and (max-width: 760px) {
    .school-exam-renderer .worksheet-document { padding: 8px; }
    .school-exam-page { width: 100%; min-height: auto; padding: 12px; }
    .school-exam-columns { grid-template-columns: 1fr; }
    .school-exam-column:last-child { border-left: 0; padding-left: 0; }
    .school-exam-column:empty { display: none; }
    .school-exam-student-line { grid-template-columns: 1fr 1fr; }
  }
  @media print {
    body.school-exam-renderer { background: transparent; }
    .school-exam-renderer .worksheet-document { display: block; padding: 0; }
    .school-exam-page {
      width: 210mm;
      height: 296mm;
      min-height: 296mm;
      max-height: 296mm;
      margin: 0;
      padding: 10mm 11mm 9mm;
      border: 0;
      box-shadow: none;
      overflow: hidden;
    }
  }
  @page { size: A4 portrait; margin: 0; }
</style>
`;

export function renderSchoolExamWorksheetToHtml(worksheetDocument, options = {}) {
  if (!worksheetDocument || typeof worksheetDocument !== "object") {
    throw new Error("SCHOOL_EXAM_TEMPLATE_DOCUMENT_REQUIRED");
  }

  const meta = {
    schoolName: "○○國民小學",
    academicYear: "",
    semesterLabel: "",
    gradeLabel: "",
    examName: "數學評量",
    subjectLabel: "數學",
    unitTitle: "",
    studentFields: ["班級", "座號", "姓名"],
    showScoreBox: true,
    ...(options.examMeta ?? {}),
  };

  const layout = buildSchoolExamLayoutPages(worksheetDocument);
  const questionPages = layout.questionPages;
  const answerPages = layout.answerPages;

  const questionHtml = questionPages.map((page, index) =>
    renderQuestionPage(worksheetDocument, page, index, meta)
  ).join("");
  const answerHtml = answerPages.map((page, index) =>
    renderAnswerPage(worksheetDocument, page, index, meta)
  ).join("");

  const stylesheetHref = options.stylesheetHref ?? "../assets/styles/print-styles.css";
  const title = `${meta.schoolName}｜${meta.examName}｜${meta.subjectLabel}`;

  return [
    "<!doctype html>",
    '<html lang="zh-Hant">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "",
    STYLE,
    "</head>",
    '<body class="worksheet-renderer school-exam-renderer" data-renderer-profile="school_exam_tw_g06_common_v1">',
    '<main class="worksheet-document" data-worksheet-kind="schoolExamWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questionHtml}</section>`,
    answerHtml
      ? `<section class="worksheet-section worksheet-section--answer-key">${answerHtml}</section>`
      : "",
    "</main>",
    "</body>",
    "</html>",
  ].join("");
}
