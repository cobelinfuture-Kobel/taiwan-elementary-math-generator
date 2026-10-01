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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function renderQuestionPage(document, page, index, meta) {
  const cells = questionCells(page).map(renderQuestion).join("");
  return [
    `<section class="worksheet-page school-exam-page school-exam-page--questions" data-page-type="question" data-page-number="${index + 1}">`,
    header(meta, false),
    index === 0
      ? '<div class="school-exam-section-heading"><strong>一、請依題意作答</strong><span>請將計算過程或答案寫在題目空白處。</span></div>'
      : '<div class="school-exam-section-heading school-exam-section-heading--continuation"><strong>一、請依題意作答（續）</strong></div>',
    `<div class="school-exam-columns">${cells}</div>`,
    `<footer class="school-exam-footer"><span>${escapeHtml(meta.schoolName)}・${escapeHtml(meta.subjectLabel)}</span><span>第 ${index + 1} 頁</span></footer>`,
    "</section>",
  ].join("");
}

function renderAnswerPage(document, page, index, meta) {
  const cells = answerCells(page).map(renderAnswer).join("");
  return [
    `<section class="worksheet-page school-exam-page school-exam-page--answers" data-page-type="answer" data-page-number="${index + 1}">`,
    header(meta, true),
    '<div class="school-exam-section-heading"><strong>答案</strong><span>依題號對照。</span></div>',
    `<div class="school-exam-columns school-exam-columns--answers">${cells}</div>`,
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
    column-count: 2;
    column-gap: 10mm;
    column-rule: 1px solid #333;
    column-fill: auto;
    padding-top: 2px;
    overflow: hidden;
  }
  .school-exam-columns .worksheet-cell {
    display: block;
    min-height: 0;
    border: 0;
    border-bottom: 1px dotted #777;
    padding: 5px 3px 7px;
    margin: 0 0 6px;
    background: transparent;
    break-inside: avoid-column;
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
    .school-exam-columns { column-count: 1; column-rule: 0; }
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

  const questionPages = Array.isArray(worksheetDocument.questionPages)
    ? worksheetDocument.questionPages
    : [];
  const answerPages = Array.isArray(worksheetDocument.answerKeyPages)
    ? worksheetDocument.answerKeyPages
    : [];

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
