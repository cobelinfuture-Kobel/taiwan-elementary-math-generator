import {
  createAnswerKeyItem,
  createQuestionDisplayModel,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import {
  buildBatchABrowserWorksheetDocument
} from "./batch-a-browser-worksheet-s57f5-extension.js";
import {
  validateBatchABrowserQuestion
} from "./batch-a-browser-validator-s57f5-extension.js";
import {
  validateG3BU04SemanticQuestion
} from "./g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  applyG3BU04GlobalContextPilotQuestion,
  G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME,
  resolveG3BU04GlobalContextPilotVariantIds,
  validateG3BU04GlobalContextPilotOptions,
  validateG3BU04GlobalContextPilotRuntimeQuestion
} from "./g3b-u04-global-context-pilot-runtime.js";

const SOURCE_ID = "g3b_u04_3b04";
const PATTERN_COUNT_IN_GROUP = 4;

export const G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET = Object.freeze({
  task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
  version: "gctx-p12r-production-equivalent-worksheet-v1",
  resolver: "visiblePatternGroupResolver",
  generator: "S57F4 canonical semantic generator",
  validator: "S57F5 canonical validator plus P12R pilot validator extension",
  renderer: "S57F5 production HTML renderer",
  publicSelectorExposed: false,
  productionSelectable: false
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function pathIssues(issues, questionIndex, validator) {
  return (issues ?? []).map((entry) => ({
    ...entry,
    path: `questions[${questionIndex}].${entry.path ?? "validation"}`,
    validator
  }));
}

function semanticDisplayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerUnit: question.answerUnit,
    answerText: question.answerText,
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function semanticAnswerKeyItem(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    answerUnit: question.answerUnit,
    eventSequence: cloneValue(question.eventSequence),
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ""}${question.equationModel ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem_answer",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function rebuildDocumentSurfaces(document, questions) {
  const questionLayout = {
    paperSize: document.printOptions.paperSize,
    columns: document.printOptions.columns,
    rowsPerPage: document.printOptions.rowsPerPage,
    showQuestionNumbers: document.printOptions.showQuestionNumbers,
    showAnswerKeyPage: document.printOptions.showAnswerKey,
    longTextCardPolicy: "avoidSplit"
  };
  const answerLayout = {
    paperSize: document.printOptions.paperSize,
    columns: document.printOptions.answerKeyColumns,
    rowsPerPage: document.printOptions.answerKeyRowsPerPage,
    showQuestionNumbers: document.printOptions.showQuestionNumbers,
    showAnswerKeyPage: document.printOptions.showAnswerKey,
    longTextCardPolicy: "avoidSplit"
  };
  const displayModels = questions.map((question, index) => question.kind === "g3bU04SemanticWordProblem"
    ? semanticDisplayModel(question, index + 1, questionLayout.showQuestionNumbers)
    : createQuestionDisplayModel(question, index + 1, { showQuestionNumbers: questionLayout.showQuestionNumbers }));
  const answerItems = document.printOptions.showAnswerKey
    ? questions.map((question, index) => question.kind === "g3bU04SemanticWordProblem"
      ? semanticAnswerKeyItem(question, index + 1)
      : createAnswerKeyItem(question, displayModels[index]))
    : [];
  return {
    displayModels,
    answerItems,
    questionPages: paginateQuestionDisplayModels(displayModels, questionLayout),
    answerPages: document.printOptions.showAnswerKey
      ? paginateAnswerKeyItems(answerItems, answerLayout)
      : []
  };
}

export function createG3BU04GlobalContextPilotOptions(overrides = {}) {
  const variantIds = resolveG3BU04GlobalContextPilotVariantIds({
    globalContextPilot: {
      enabled: true,
      variantIds: overrides.variantIds
    }
  });
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
    selectedPatternGroupIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_GROUP_ID],
    questionCount: variantIds.length * PATTERN_COUNT_IN_GROUP,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: overrides.generationSeed ?? "gctx-p12r-production-equivalent-v1",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true
    },
    globalContextPilot: {
      enabled: true,
      variantIds,
      publicSelectable: false
    },
    ...overrides,
    variantIds: undefined
  };
}

export function buildG3BU04GlobalContextPilotWorksheet(overrides = {}) {
  const options = createG3BU04GlobalContextPilotOptions(overrides);
  const optionValidation = validateG3BU04GlobalContextPilotOptions(options);
  if (!optionValidation.ok) {
    return { ok: false, baselineWorksheetDocument: null, pilotWorksheetDocument: null, errors: optionValidation.errors, warnings: [] };
  }

  const baseline = buildBatchABrowserWorksheetDocument(options);
  if (!baseline.ok || !baseline.worksheetDocument) {
    return {
      ok: false,
      baselineWorksheetDocument: null,
      pilotWorksheetDocument: null,
      errors: baseline.errors ?? [],
      warnings: baseline.warnings ?? []
    };
  }

  const baselineDocument = baseline.worksheetDocument;
  const pilotQuestions = cloneValue(baselineDocument.generatedQuestions);
  const targetIndexes = pilotQuestions
    .map((question, index) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID ? index : -1)
    .filter((index) => index >= 0);
  const variantIds = options.globalContextPilot.variantIds;
  const errors = [];
  const warnings = [...(baseline.warnings ?? [])];

  if (targetIndexes.length !== variantIds.length) {
    errors.push({
      code: "GCTX_P12R_TARGET_ALLOCATION_MISMATCH",
      severity: "error",
      stage: "global_context_pilot_runtime",
      path: "allocation",
      message: "Visible resolver allocation did not produce one target question per global-context variant.",
      expected: variantIds.length,
      actual: targetIndexes.length
    });
  }

  for (const [pilotIndex, questionIndex] of targetIndexes.entries()) {
    const baselineQuestion = baselineDocument.generatedQuestions[questionIndex];
    const formalBaselineValidation = validateBatchABrowserQuestion(baselineQuestion);
    errors.push(...pathIssues(formalBaselineValidation.errors, questionIndex, "s57f5_canonical_baseline"));
    warnings.push(...pathIssues(formalBaselineValidation.warnings, questionIndex, "s57f5_canonical_baseline"));

    const overlaid = applyG3BU04GlobalContextPilotQuestion(
      pilotQuestions[questionIndex],
      options,
      pilotIndex + 1
    );
    pilotQuestions[questionIndex] = overlaid;

    const semanticValidation = validateG3BU04SemanticQuestion(overlaid);
    const pilotValidation = validateG3BU04GlobalContextPilotRuntimeQuestion(overlaid);
    errors.push(...pathIssues(semanticValidation.errors, questionIndex, "s57e5_semantic_authority"));
    warnings.push(...pathIssues(semanticValidation.warnings, questionIndex, "s57e5_semantic_authority"));
    errors.push(...pathIssues(pilotValidation.errors, questionIndex, "gctx_p12r_runtime_extension"));
  }

  if (errors.length > 0) {
    return {
      ok: false,
      baselineWorksheetDocument: cloneValue(baselineDocument),
      pilotWorksheetDocument: null,
      errors,
      warnings
    };
  }

  const surfaces = rebuildDocumentSurfaces(baselineDocument, pilotQuestions);
  const pilotWorksheetDocument = {
    ...cloneValue(baselineDocument),
    worksheetId: `${baselineDocument.worksheetId}-gctx-p12r-pilot`,
    title: "3B-U04 兩步驟計算｜全域情境 Production-Equivalent Pilot",
    subtitle: "正式 resolver、generator、validator、renderer 路徑；尚未開放公開選題",
    visibilityStatus: "isolated_production_equivalent_pilot",
    productionUse: "pilot_only_not_admitted",
    generatedQuestions: pilotQuestions,
    questionDisplayModels: surfaces.displayModels,
    answerKeyItems: surfaces.answerItems,
    questionPages: surfaces.questionPages,
    answerKeyPages: surfaces.answerPages,
    globalContextPilot: {
      ...cloneValue(G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET),
      variantIds: [...variantIds],
      targetPatternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
      targetQuestionCount: targetIndexes.length,
      productionSelectable: false,
      humanReviewReady: false
    },
    validationSummary: {
      ...cloneValue(baselineDocument.validationSummary),
      globalContextPilotValidatorVersion: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.version,
      globalContextPilotErrors: 0,
      globalContextPilotWarnings: warnings.length
    },
    summary: {
      ...cloneValue(baselineDocument.summary),
      questionPageCount: surfaces.questionPages.length,
      answerKeyPageCount: surfaces.answerPages.length,
      globalContextPilotQuestionCount: targetIndexes.length,
      globalContextPilotVariantCount: variantIds.length
    },
    provenance: {
      ...cloneValue(baselineDocument.provenance),
      sourceTaskIds: [...new Set([...(baselineDocument.provenance?.sourceTaskIds ?? []), G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task])],
      productionEquivalentPilot: true,
      publicSelectorExposed: false,
      productionSelectable: false
    }
  };

  return {
    ok: true,
    baselineWorksheetDocument: cloneValue(baselineDocument),
    pilotWorksheetDocument,
    options: cloneValue(options),
    targetQuestionIndexes: targetIndexes,
    variantIds: [...variantIds],
    errors: [],
    warnings
  };
}
