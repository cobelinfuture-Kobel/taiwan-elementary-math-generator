import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "./html-renderer.js";

export const G3B_U04_CANONICAL_RENDERER_INTEGRATION = Object.freeze({
  task: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "semantic_long_text_renderer_integrated",
  rendererProfileId: "g3b_u04_semantic_long_text_v1",
  pageBreakPolicy: "avoidSplit",
  equationAndUnitRendered: true,
  unrelatedRendererOutputChanged: false,
  requiredNextGate: "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA"
});

const SEMANTIC_RENDERER_STYLE = [
  '<style id="g3b-u04-semantic-long-text-style">',
  '.worksheet-renderer--g3b-u04-semantic .worksheet-cell {',
  '  break-inside: avoid;',
  '  page-break-inside: avoid;',
  '}',
  '.worksheet-renderer--g3b-u04-semantic .worksheet-cell__prompt,',
  '.worksheet-renderer--g3b-u04-semantic .worksheet-cell__answer {',
  '  white-space: normal;',
  '  overflow-wrap: anywhere;',
  '}',
  '.worksheet-renderer--g3b-u04-semantic .worksheet-cell--answer-key .worksheet-cell__answer {',
  '  line-height: 1.55;',
  '}',
  '</style>'
].join("");

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function isSemanticAnswerKeyItem(item = {}) {
  return item?.layoutHints?.representation === "semantic_word_problem_answer"
    && typeof item?.equationText === "string"
    && typeof item?.answerText === "string";
}

function renderableAnswerKeyItem(item = {}) {
  if (!isSemanticAnswerKeyItem(item)) return cloneValue(item);
  return {
    ...cloneValue(item),
    answerText: `算式：${item.equationText}；答案：${item.answerText}`,
    renderedEquationText: item.equationText,
    renderedAnswerWithUnit: item.answerText
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

export function isG3BU04SemanticRendererDocument(worksheetDocument = {}) {
  return worksheetDocument?.rendererProfile?.profileId === G3B_U04_CANONICAL_RENDERER_INTEGRATION.rendererProfileId
    || (worksheetDocument?.generatedQuestions ?? []).some((question) => (
      question?.sourceId === "g3b_u04_3b04"
      && question?.kind === "g3bU04SemanticWordProblem"
    ));
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG3BU04SemanticRendererDocument(worksheetDocument)) {
    return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  }

  const prepared = prepareSemanticDocument(worksheetDocument);
  return renderBaseWorksheetDocumentToHtml(prepared, options)
    .replace(
      '<body class="worksheet-renderer">',
      '<body class="worksheet-renderer worksheet-renderer--g3b-u04-semantic" data-renderer-profile="g3b_u04_semantic_long_text_v1">'
    )
    .replace("</head>", `${SEMANTIC_RENDERER_STYLE}</head>`);
}
