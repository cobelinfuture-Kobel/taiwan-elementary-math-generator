import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "./html-renderer-s57f5-extension.js";

export const G3B_U08_CANONICAL_RENDERER_INTEGRATION = Object.freeze({
  task: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "semantic_long_text_renderer_integrated",
  rendererProfileId: "g3b_u08_semantic_long_text_v1",
  pageBreakPolicy: "avoidSplit",
  equationAndUnitRendered: true,
  horizontalOnly: true,
  unrelatedRendererOutputChanged: false,
  publicPrintControlBehaviorChanged: false,
  requiredNextGate: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA"
});

const SEMANTIC_RENDERER_STYLE = [
  '<style id="g3b-u08-semantic-long-text-style">',
  '.worksheet-renderer--g3b-u08-semantic .worksheet-cell {',
  '  break-inside: avoid;',
  '  page-break-inside: avoid;',
  '}',
  '.worksheet-renderer--g3b-u08-semantic .worksheet-cell__prompt,',
  '.worksheet-renderer--g3b-u08-semantic .worksheet-cell__answer {',
  '  white-space: normal;',
  '  overflow-wrap: anywhere;',
  '}',
  '.worksheet-renderer--g3b-u08-semantic .worksheet-cell--answer-key .worksheet-cell__answer {',
  '  line-height: 1.25;',
  '}',
  '@media print {',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-section--answer-key .worksheet-page {',
  '    padding: 12mm 10mm;',
  '    gap: 6px;',
  '  }',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-section--answer-key .worksheet-page__grid {',
  '    gap: 6px;',
  '  }',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-cell--answer-key {',
  '    min-height: 0;',
  '    padding: 6px 8px;',
  '    gap: 2px;',
  '    font-size: 0.78rem;',
  '  }',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-cell--answer-key .worksheet-cell__number {',
  '    font-size: 0.75rem;',
  '  }',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-cell--answer-key .worksheet-cell__prompt,',
  '  .worksheet-renderer--g3b-u08-semantic .worksheet-cell--answer-key .worksheet-cell__answer {',
  '    line-height: 1.25;',
  '  }',
  '}',
  '</style>'
].join("\n");

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function isSemanticAnswerKeyItem(item = {}) {
  return item?.layoutHints?.representation === "semantic_word_problem_answer"
    && item?.layoutHints?.sourceRepresentation === "horizontal_only"
    && typeof item?.equationText === "string"
    && typeof item?.answerText === "string";
}

function renderableAnswerKeyItem(item = {}) {
  if (!isSemanticAnswerKeyItem(item)) return cloneValue(item);
  return {
    ...cloneValue(item),
    answerText: `算式：${item.equationText}；答案：${item.answerText}`,
    renderedEquationText: item.equationText,
    renderedAnswerWithUnit: item.finalAnswerWithUnit ?? item.answerText
  };
}

function prepareSemanticDocument(worksheetDocument = {}) {
  const prepared = cloneValue(worksheetDocument);
  prepared.answerKeyItems = (prepared.answerKeyItems ?? []).map(renderableAnswerKeyItem);
  prepared.answerKeyPages = (prepared.answerKeyPages ?? []).map((page) => ({
    ...page,
    cells: (page.cells ?? []).map((cell) => cell?.cellType === "answerKey" && cell.answerKeyItem
      ? { ...cell, answerKeyItem: renderableAnswerKeyItem(cell.answerKeyItem) }
      : cell)
  }));
  return prepared;
}

export function isG3BU08SemanticRendererDocument(worksheetDocument = {}) {
  return worksheetDocument?.rendererProfile?.profileId === G3B_U08_CANONICAL_RENDERER_INTEGRATION.rendererProfileId
    || (worksheetDocument?.generatedQuestions ?? []).some((question) => (
      question?.sourceId === "g3b_u08_3b08"
      && question?.kind === "g3bU08SemanticApplication"
      && question?.phase === "S58H"
    ));
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG3BU08SemanticRendererDocument(worksheetDocument)) {
    return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  }
  const prepared = prepareSemanticDocument(worksheetDocument);
  return renderBaseWorksheetDocumentToHtml(prepared, options)
    .replace(
      '<body class="worksheet-renderer">',
      '<body class="worksheet-renderer worksheet-renderer--g3b-u08-semantic" data-renderer-profile="g3b_u08_semantic_long_text_v1">'
    )
    .replace("</head>", `${SEMANTIC_RENDERER_STYLE}</head>`);
}
