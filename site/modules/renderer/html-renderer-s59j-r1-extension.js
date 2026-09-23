import {
  isG4BU01HorizontalRendererDocument,
  renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml,
} from "./html-renderer-s59h-extension.js";

export const G4B_U01_PUBLIC_PRINT_LAYOUT_FULLFIX = Object.freeze({
  task: "S59J_R1_G4B_U01_PublicWarningAndPrintLayout_FullFix",
  status: "public_print_layout_fullfix_integrated",
  compactRemainderBlanks: true,
  compactAnswerPrompt: true,
  answerCardLayout: "two_row_compact",
  horizontalOnly: true,
});

const FULLFIX_STYLE = [
  '<style id="g4b-u01-s59j-r1-layout-style">',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell { min-width: 0; }',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell__prompt,',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell__answer {',
  '  min-width: 0;',
  '  max-width: 100%;',
  '  font-family: "Noto Sans CJK TC", "Noto Sans CJK", Arial, sans-serif;',
  '  font-variant-numeric: tabular-nums;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--question .worksheet-cell__prompt {',
  '  font-size: 0.9rem;',
  '  letter-spacing: -0.015em;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--answer-key {',
  '  display: grid;',
  '  grid-template-columns: auto minmax(0, 1fr);',
  '  grid-template-areas: "number prompt" "answer answer";',
  '  align-content: start;',
  '  column-gap: 6px;',
  '  row-gap: 2px;',
  '  min-height: 0;',
  '  padding: 6px 8px;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--answer-key .worksheet-cell__number { grid-area: number; }',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--answer-key .worksheet-cell__prompt {',
  '  grid-area: prompt;',
  '  font-size: 0.78rem;',
  '  line-height: 1.25;',
  '  letter-spacing: -0.02em;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--answer-key .worksheet-cell__answer {',
  '  grid-area: answer;',
  '  font-size: 0.9rem;',
  '  line-height: 1.2;',
  '}',
  '@media print {',
  '  .worksheet-renderer--g4b-u01-horizontal .worksheet-page__grid { gap: 8px; }',
  '  .worksheet-renderer--g4b-u01-horizontal .worksheet-cell--question { padding: 8px 9px; gap: 4px; }',
  '}',
  '</style>',
].join("");

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

export function compactG4BU01QuestionPrompt(value) {
  return String(value ?? "")
    .replace(/_{5,}……_{5,}/g, "____……____")
    .replace(/_{7,}/g, "______");
}

export function compactG4BU01AnswerPrompt(value) {
  return compactG4BU01QuestionPrompt(value)
    .replace(/\s*=\s*_{2,}(?:……_{2,})?\s*$/, " =");
}

function prepareQuestionDisplayModel(model = {}) {
  return {
    ...cloneValue(model),
    blankedDisplayText: compactG4BU01QuestionPrompt(model.blankedDisplayText),
  };
}

function prepareAnswerKeyItem(item = {}) {
  return {
    ...cloneValue(item),
    promptText: compactG4BU01AnswerPrompt(item.promptText),
  };
}

function prepareDocument(worksheetDocument = {}) {
  const prepared = cloneValue(worksheetDocument);
  prepared.questionDisplayModels = (prepared.questionDisplayModels ?? []).map(prepareQuestionDisplayModel);
  prepared.answerKeyItems = (prepared.answerKeyItems ?? []).map(prepareAnswerKeyItem);
  prepared.questionPages = (prepared.questionPages ?? []).map((page) => ({
    ...page,
    cells: (page.cells ?? []).map((cell) => cell?.cellType === "question" && cell.displayModel
      ? { ...cell, displayModel: prepareQuestionDisplayModel(cell.displayModel) }
      : cell),
  }));
  prepared.answerKeyPages = (prepared.answerKeyPages ?? []).map((page) => ({
    ...page,
    cells: (page.cells ?? []).map((cell) => cell?.cellType === "answerKey" && cell.answerKeyItem
      ? { ...cell, answerKeyItem: prepareAnswerKeyItem(cell.answerKeyItem) }
      : cell),
  }));
  return prepared;
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG4BU01HorizontalRendererDocument(worksheetDocument)) {
    return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  }
  const prepared = prepareDocument(worksheetDocument);
  return renderBaseWorksheetDocumentToHtml(prepared, options)
    .replace(
      'data-renderer-profile="g4b_u01_horizontal_numeric_v1"',
      'data-renderer-profile="g4b_u01_horizontal_numeric_v1" data-s59j-r1-layout-fullfix="true"',
    )
    .replace("</head>", `${FULLFIX_STYLE}</head>`);
}
