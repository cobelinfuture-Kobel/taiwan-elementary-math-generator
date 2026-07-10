function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderQuestionItem(item) {
  return `<article class="question-card">
    <div class="question-number">${escapeHtml(item.questionNumberText ?? `${item.questionNumber}.`)}</div>
    <div class="question-body">${escapeHtml(item.blankedDisplayText)}</div>
    <div class="answer-line" aria-hidden="true"></div>
  </article>`;
}

function renderAnswerItem(item) {
  return `<article class="answer-card">
    <div class="answer-number">${escapeHtml(`${item.questionNumber}.`)}</div>
    <div class="answer-prompt">${escapeHtml(item.promptText)}</div>
    <div class="answer-equation">算式：${escapeHtml(item.equationText)}</div>
    <div class="answer-value">答案：${escapeHtml(item.answerText)}</div>
  </article>`;
}

function renderPage(page, document, type) {
  const isQuestion = type === "question";
  const items = page.items.map(isQuestion ? renderQuestionItem : renderAnswerItem).join("\n");
  const title = isQuestion ? "題目卷" : "答案卷";
  const gridClass = isQuestion ? "question-grid" : "answer-grid";
  return `<section class="sheet-page ${isQuestion ? "question-page" : "answer-page"}" data-page-type="${type}">
    <header class="sheet-header">
      <div>
        <div class="unit-code">${escapeHtml(document.unitCode)}</div>
        <h1>${escapeHtml(document.unitTitle)}｜${title}</h1>
      </div>
      <div class="page-index">第 ${page.pageNumber} 頁</div>
    </header>
    <div class="student-fields ${isQuestion ? "" : "answer-fields"}">
      <span>班級：__________</span><span>姓名：__________</span><span>日期：__________</span>
    </div>
    <main class="${gridClass}">${items}</main>
    <footer class="sheet-footer">G3B-U04 隱藏語意驗證稿｜不得作為公開選單或正式教材發布</footer>
  </section>`;
}

export function renderG3BU04HiddenSemanticWorksheetHtml(worksheetDocument = {}, options = {}) {
  if (worksheetDocument?.schemaName !== "G3BU04HiddenSemanticWorksheetDocument") {
    throw new TypeError("G3B-U04 hidden semantic worksheet document is required.");
  }
  const questionPages = worksheetDocument.questionPages.map((page) => renderPage(page, worksheetDocument, "question"));
  const answerPages = worksheetDocument.answerKeyPages.map((page) => renderPage(page, worksheetDocument, "answer"));
  const title = options.documentTitle ?? `${worksheetDocument.unitCode} ${worksheetDocument.unitTitle} 隱藏語意題型驗證`;
  const generatedAt = options.generatedAt ?? "deterministic-build";
  const metadata = {
    sourceId: worksheetDocument.sourceId,
    worksheetMode: worksheetDocument.worksheetMode,
    questionCount: worksheetDocument.summary.questionCount,
    templateFamilyCount: worksheetDocument.summary.templateFamilyCount,
    knowledgePointCount: worksheetDocument.summary.knowledgePointCount,
    generatedAt
  };
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="generator" content="S57E8 G3B-U04 hidden semantic smoke">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 9mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #eceff1; color: #17202a; }
    body { font-family: "Noto Sans CJK TC", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif; font-size: 12.5pt; line-height: 1.55; }
    .sheet-page { width: 192mm; min-height: 279mm; margin: 8mm auto; padding: 7mm 8mm 6mm; background: #fff; break-after: page; page-break-after: always; display: flex; flex-direction: column; }
    .sheet-page:last-child { break-after: auto; page-break-after: auto; }
    .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #273746; padding-bottom: 3mm; }
    .unit-code { font-size: 9pt; letter-spacing: .08em; color: #566573; }
    h1 { font-size: 19pt; margin: 1mm 0 0; line-height: 1.25; }
    .page-index { font-size: 10pt; color: #566573; padding-top: 1mm; }
    .student-fields { display: flex; gap: 12mm; padding: 3mm 0 4mm; font-size: 10pt; border-bottom: 1px solid #abb2b9; }
    .answer-fields { visibility: hidden; }
    .question-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4mm; align-content: start; flex: 1; padding-top: 4mm; }
    .question-card { border: 1.2px solid #566573; border-radius: 3mm; padding: 3.2mm; min-height: 58mm; break-inside: avoid; page-break-inside: avoid; position: relative; }
    .question-number { font-weight: 700; font-size: 12pt; margin-bottom: 1.5mm; }
    .question-body { min-height: 31mm; }
    .answer-line { border-bottom: 1px solid #7b7d7d; margin-top: 5mm; }
    .answer-grid { display: grid; grid-template-columns: 1fr; gap: 2.5mm; align-content: start; flex: 1; padding-top: 3mm; }
    .answer-card { border-bottom: 1px solid #aab7b8; padding: 2.2mm 1mm; break-inside: avoid; page-break-inside: avoid; }
    .answer-number { display: inline-block; font-weight: 700; margin-right: 2mm; }
    .answer-prompt { display: inline; }
    .answer-equation { margin-left: 7mm; color: #34495e; font-family: "Noto Sans Mono CJK TC", "Noto Sans Mono", monospace; }
    .answer-value { margin-left: 7mm; font-weight: 700; }
    .sheet-footer { border-top: 1px solid #d5d8dc; padding-top: 2mm; margin-top: auto; text-align: center; font-size: 8pt; color: #7b7d7d; }
    @media print {
      html, body { background: #fff; }
      .sheet-page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body data-source-id="${escapeHtml(metadata.sourceId)}" data-worksheet-mode="${escapeHtml(metadata.worksheetMode)}" data-question-count="${metadata.questionCount}" data-template-family-count="${metadata.templateFamilyCount}" data-knowledge-point-count="${metadata.knowledgePointCount}" data-generated-at="${escapeHtml(metadata.generatedAt)}">
${[...questionPages, ...answerPages].join("\n")}
</body>
</html>`;
}
