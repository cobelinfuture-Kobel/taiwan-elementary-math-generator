export const G4B_U04_LAYOUT_MODES = Object.freeze([
  "auto_safe",
  "custom_with_caps",
]);

export const G4B_U04_LAYOUT_MODE_LABELS = Object.freeze({
  auto_safe: "自動安全版面",
  custom_with_caps: "自訂版面（受安全上限保護）",
});

export const G4B_U04_LAYOUT_CAPPED_NOTICE = "已依長文字題型自動調整為安全版面。";
export const G4B_U04_LAYOUT_CAPPED_CODE = "G4B_U04_LAYOUT_CAPPED_TO_PROFILE";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizedApprovedLayouts(questionCap) {
  return (Array.isArray(questionCap.approvedLayouts) ? questionCap.approvedLayouts : [])
    .map((layout) => ({
      columns: positiveInteger(layout?.columns, 0),
      rowsPerPage: positiveInteger(layout?.rowsPerPage, 0),
    }))
    .filter((layout) => layout.columns > 0 && layout.rowsPerPage > 0);
}

function resolveCustomQuestionLayout(questionCap, requested) {
  const layouts = normalizedApprovedLayouts(questionCap);
  if (layouts.length === 0) {
    return {
      paperSize: requested.paperSize,
      columns: Math.min(requested.columns, questionCap.columns),
      rowsPerPage: Math.min(requested.rowsPerPage, questionCap.rowsPerPage),
    };
  }
  const maxColumns = Math.max(...layouts.map((layout) => layout.columns));
  const columns = Math.min(requested.columns, maxColumns);
  const rowsForColumn = layouts
    .filter((layout) => layout.columns === columns)
    .map((layout) => layout.rowsPerPage);
  const maxRows = rowsForColumn.length > 0
    ? Math.max(...rowsForColumn)
    : questionCap.rowsPerPage;
  return {
    paperSize: requested.paperSize,
    columns,
    rowsPerPage: Math.min(requested.rowsPerPage, maxRows),
  };
}

export function normalizeG4BU04LayoutMode(value) {
  return G4B_U04_LAYOUT_MODES.includes(value) ? value : "auto_safe";
}

export function formatG4BU04AppliedLayoutText(question, answer) {
  return `套用版面：題目 ${question.columns} 欄 × ${question.rowsPerPage} 列；答案 ${answer.columns} 欄 × ${answer.rowsPerPage} 列`;
}

export function resolveG4BU04WorksheetLayout({
  profile,
  layoutMode = "auto_safe",
  requestedLayout = {},
  includeAnswerKey = true,
} = {}) {
  if (!profile?.profileId || !profile?.questionSheet || !profile?.answerKey) {
    throw new TypeError("G4B-U04 layout resolution requires a renderer profile.");
  }

  const mode = normalizeG4BU04LayoutMode(layoutMode);
  const questionCap = profile.questionSheet;
  const answerCap = profile.answerKey;
  const requested = {
    paperSize: requestedLayout.paperSize ?? questionCap.paperSize,
    columns: positiveInteger(requestedLayout.columns, questionCap.columns),
    rowsPerPage: positiveInteger(requestedLayout.rowsPerPage, questionCap.rowsPerPage),
  };
  const custom = mode === "custom_with_caps";
  const resolvedQuestion = custom
    ? resolveCustomQuestionLayout(questionCap, requested)
    : {
      paperSize: requested.paperSize,
      columns: questionCap.columns,
      rowsPerPage: questionCap.rowsPerPage,
    };
  const resolvedAnswer = {
    paperSize: requested.paperSize,
    columns: answerCap.columns,
    rowsPerPage: answerCap.rowsPerPage,
  };
  const cappedFields = custom
    ? [
      ...(requested.columns !== resolvedQuestion.columns ? ["columns"] : []),
      ...(requested.rowsPerPage !== resolvedQuestion.rowsPerPage ? ["rowsPerPage"] : []),
    ]
    : [];
  const capped = cappedFields.length > 0;
  const appliedLayoutText = formatG4BU04AppliedLayoutText(resolvedQuestion, resolvedAnswer);
  const noticeText = capped ? G4B_U04_LAYOUT_CAPPED_NOTICE : null;
  const warnings = capped
    ? [deepFreeze({
      code: G4B_U04_LAYOUT_CAPPED_CODE,
      severity: "warning",
      path: "printLayout",
      message: G4B_U04_LAYOUT_CAPPED_NOTICE,
      details: {
        profileId: profile.profileId,
        cappedFields: [...cappedFields],
        requested: { ...requested },
        resolvedQuestion: { ...resolvedQuestion },
      },
    })]
    : [];

  return deepFreeze({
    schemaVersion: "g4b-u04-layout-resolution-v3",
    sourceId: "g4b_u04_4b04",
    profileId: profile.profileId,
    layoutMode: mode,
    layoutModeLabel: G4B_U04_LAYOUT_MODE_LABELS[mode],
    requestedQuestionLayout: requested,
    profileQuestionCap: {
      paperSize: questionCap.paperSize,
      columns: questionCap.columns,
      rowsPerPage: questionCap.rowsPerPage,
      approvedLayouts: (questionCap.approvedLayouts ?? []).map((layout) => ({
        columns: layout.columns,
        rowsPerPage: layout.rowsPerPage,
      })),
    },
    resolvedQuestionLayout: resolvedQuestion,
    resolvedAnswerLayout: resolvedAnswer,
    answerKeyProfileControlled: true,
    includeAnswerKey: includeAnswerKey !== false,
    capped,
    cappedFields,
    noticeCode: capped ? G4B_U04_LAYOUT_CAPPED_CODE : null,
    noticeText,
    appliedLayoutText,
    warnings,
  });
}
