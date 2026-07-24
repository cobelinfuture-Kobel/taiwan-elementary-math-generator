import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "./html-renderer-s58h-extension.js";

export const G4B_U01_CANONICAL_RENDERER_INTEGRATION = Object.freeze({
  task: "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
  status: "horizontal_numeric_renderer_integrated",
  rendererProfileId: "g4b_u01_horizontal_numeric_v1",
  questionLayout: "3x8",
  answerKeyLayout: "3x10",
  pageBreakPolicy: "avoidSplit",
  noWrapExpression: true,
  horizontalOnly: true,
  unrelatedRendererOutputChanged: false,
  publicPrintControlBehaviorChanged: false,
  requiredNextGate: "S59I_G4B_U01_PublicUIAndPrintControlsQA",
});

const HORIZONTAL_RENDERER_STYLE = [
  '<style id="g4b-u01-horizontal-numeric-style">',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell {',
  '  break-inside: avoid;',
  '  page-break-inside: avoid;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell__prompt,',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell__answer {',
  '  white-space: nowrap;',
  '  overflow-wrap: normal;',
  '  word-break: keep-all;',
  '  font-variant-numeric: tabular-nums;',
  '}',
  '.worksheet-renderer--g4b-u01-application .worksheet-cell__prompt,',
  '.worksheet-renderer--g4b-u01-application .worksheet-cell__answer {',
  '  white-space: normal;',
  '  overflow-wrap: anywhere;',
  '  word-break: normal;',
  '}',
  '.worksheet-renderer--g4b-u01-horizontal .worksheet-cell--answer-key .worksheet-cell__answer {',
  '  line-height: 1.45;',
  '}',
  '</style>',
].join("");

export function isG4BU01HorizontalRendererDocument(worksheetDocument = {}) {
  return worksheetDocument?.rendererProfile?.profileId === G4B_U01_CANONICAL_RENDERER_INTEGRATION.rendererProfileId
    || (worksheetDocument?.generatedQuestions ?? []).some((question) => (
      question?.sourceId === "g4b_u01_4b01"
      && question?.kind === "g4bU01HorizontalCalculation"
      && question?.phase === "S59H"
    ));
}

export function isG4BU01ApplicationRendererDocument(worksheetDocument = {}) {
  const records = [
    ...(worksheetDocument?.questionDisplayModels ?? []),
    ...(worksheetDocument?.generatedQuestions ?? []),
    ...(worksheetDocument?.questions ?? []),
  ];
  return records.some((record) => (
    record?.applicationText === true
    || String(record?.mode ?? record?.questionMode ?? "").toLowerCase().includes("application")
    || String(record?.renderKind ?? "").toLowerCase().includes("application")
  ));
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG4BU01HorizontalRendererDocument(worksheetDocument)) {
    return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  }
  const applicationClass = isG4BU01ApplicationRendererDocument(worksheetDocument)
    ? " worksheet-renderer--g4b-u01-application"
    : "";
  return renderBaseWorksheetDocumentToHtml(worksheetDocument, options)
    .replace(
      '<body class="worksheet-renderer">',
      `<body class="worksheet-renderer worksheet-renderer--g4b-u01-horizontal${applicationClass}" data-renderer-profile="g4b_u01_horizontal_numeric_v1">`,
    )
    .replace("</head>", `${HORIZONTAL_RENDERER_STYLE}</head>`);
}
