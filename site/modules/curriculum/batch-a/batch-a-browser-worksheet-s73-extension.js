import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s60j-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G4B_U04_CANONICAL_ROUTE_KINDS,
  classifyG4BU04CanonicalRouterPlan,
  normalizeG4BU04ResolverPlan,
  validateG4BU04CanonicalQuestion,
} from "../batch-b/g4b-u04-canonical-router.js";
import {
  isG4BU04WorksheetPlan,
  validateG4BU04WorksheetEligibility,
} from "../batch-b/g4b-u04-worksheet-eligibility.js";
import {
  G4B_U04_RENDERER_PROFILES,
  G4B_U04_WORKSHEET_ACTIVATION,
  G4B_U04_WORKSHEET_ANSWER_SHAPES,
  G4B_U04_WORKSHEET_LIFECYCLE,
  G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g4b-u04-worksheet-promotion.js";
import {
  G4B_U04_PROMOTION_REGISTRY_ID,
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";

export const G4B_U04_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
  status: "worksheet_answer_key_renderer_integrated",
  schemaVersion: "worksheet-document-v1",
  answerModelShapes: G4B_U04_WORKSHEET_ANSWER_SHAPES,
  compactProfileId: G4B_U04_RENDERER_PROFILES.compact.profileId,
  contextualProfileId: G4B_U04_RENDERER_PROFILES.contextual.profileId,
  inverseLongProfileId: G4B_U04_RENDERER_PROFILES.inverseLong.profileId,
  productionUse: G4B_U04_WORKSHEET_LIFECYCLE.productionUse,
  requiredNextGate: G4B_U04_WORKSHEET_ACTIVATION.requiredNextGate,
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function renderKind(question = {}) {
  switch (question.answerModelShape) {
    case "classificationAnswer": return "classification";
    case "symbolReadingAnswer": return "symbol_reading";
    case "methodComparisonAnswer": return "method_comparison";
    case "methodChoiceAnswer": return "method_choice";
    case "moneyAmountAnswer": return "payment_amount";
    case "banknoteCountAnswer": return "banknote_count";
    case "digitSetAnswer": return "inverse_digit_set";
    case "possibleValuesAnswer": return "inverse_possible_values";
    default:
      if (question.mode === "operation_estimation") return "operation_estimation";
      if (question.applicationText === true || question.mode === "application") return "contextual_application";
      return "numeric_rounding";
  }
}

function responsePrompt(question = {}) {
  switch (question.answerModelShape) {
    case "classificationAnswer": return "作答：□ 概數　□ 精確數　判斷詞：________________";
    case "symbolReadingAnswer": return "讀作：________________";
    case "methodComparisonAnswer": return "無條件捨去：____________　無條件進入：____________　四捨五入：____________";
    case "methodChoiceAnswer": return "方法：________________";
    case "moneyAmountAnswer": return "算式：____________________________　至少付款：____________ 元";
    case "banknoteCountAnswer": return "算式：____________________________　至少需要：____________ 張";
    case "digitSetAnswer": return "可以填：________________________________";
    case "possibleValuesAnswer": return "所有可能值：____________________________________________________________";
    default:
      return question.applicationText === true
        ? "算式：________________________________　答：________________"
        : "答案：________________";
  }
}

function selectProfile(questions = []) {
  if (questions.some((question) => question.answerModelShape === "possibleValuesAnswer")) {
    return G4B_U04_RENDERER_PROFILES.inverseLong;
  }
  if (questions.some((question) => question.applicationText === true
    || ["application", "operation_estimation"].includes(question.mode)
    || ["methodComparisonAnswer", "digitSetAnswer"].includes(question.answerModelShape))) {
    return G4B_U04_RENDERER_PROFILES.contextual;
  }
  return G4B_U04_RENDERER_PROFILES.compact;
}

function normalizeLayouts(options, questions) {
  const profile = selectProfile(questions);
  const requested = options.printLayout ?? {};
  const questionSheet = profile.questionSheet;
  const answerKey = profile.answerKey;
  const showAnswerKeyPage = options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false;
  return {
    profile,
    question: {
      paperSize: requested.paperSize ?? questionSheet.paperSize,
      columns: Math.min(positiveInteger(requested.columns, questionSheet.columns), questionSheet.columns),
      rowsPerPage: Math.min(positiveInteger(requested.rowsPerPage, questionSheet.rowsPerPage), questionSheet.rowsPerPage),
      showQuestionNumbers: requested.showQuestionNumbers !== false,
      showAnswerKeyPage,
      longTextCardPolicy: "avoidSplit",
      noWrapExpression: false,
    },
    answer: {
      paperSize: requested.paperSize ?? answerKey.paperSize,
      columns: answerKey.columns,
      rowsPerPage: answerKey.rowsPerPage,
      showQuestionNumbers: requested.showQuestionNumbers !== false,
      showAnswerKeyPage,
      longTextCardPolicy: "avoidSplit",
      noWrapExpression: false,
    },
  };
}

function promoteQuestion(question = {}) {
  return {
    ...cloneValue(question),
    phase: "S73",
    productionUse: G4B_U04_WORKSHEET_LIFECYCLE.productionUse,
    productionWorksheetStatus: "worksheet_candidate_pending_s74_s75",
    promotionRegistryId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      worksheetPromotionOverlayId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    },
  };
}

function questionDisplayModel(question, questionNumber, showQuestionNumbers) {
  const kind = renderKind(question);
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.promptText,
    blankedDisplayText: question.promptText,
    responsePrompt: responsePrompt(question),
    answerModelShape: question.answerModelShape,
    renderKind: kind,
    applicationText: question.applicationText === true,
    mode: question.mode,
    implementationClass: question.implementationClass,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(question.promptText ?? "").length,
      estimatedResponseLength: String(responsePrompt(question) ?? "").length,
      avoidPageBreakInside: true,
      representation: kind,
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  };
}

function answerKeyItem(question, questionNumber) {
  const structured = question.structuredAnswer ?? {};
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    promptText: question.promptText,
    answerText: question.answerText,
    expressionText: structured.expression ?? question.canonicalExpression ?? null,
    answerValue: cloneValue(question.finalAnswer),
    answerUnit: structured.unitLabel ?? structured.unit ?? null,
    answerModelShape: question.answerModelShape,
    renderKind: renderKind(question),
    structuredAnswer: cloneValue(structured),
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(`${question.promptText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: `${renderKind(question)}_answer`,
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  };
}

function failedResult(errors, warnings = [], details = {}) {
  return {
    ok: false,
    worksheetDocument: null,
    validation: { ok: false, errors, warnings, infos: [], validatorVersion: "s73-g4b-u04-v1", validatedAt: null },
    errors,
    warnings,
    ...details,
  };
}

function containsInternalId(text) {
  return /\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(String(text ?? ""));
}

function validateQuestions(questions) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const canonical = validateG4BU04CanonicalQuestion(question);
    for (const entry of canonical.errors) errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    if (!G4B_U04_WORKSHEET_ANSWER_SHAPES.includes(question.answerModelShape)) {
      errors.push({
        code: "G4B_U04_WORKSHEET_ANSWER_SHAPE_UNSUPPORTED",
        severity: "error",
        path: `questions[${index}].answerModelShape`,
        message: "Worksheet 遇到未核准的答案模型。",
      });
    }
    if (typeof question.promptText !== "string" || question.promptText.length === 0) {
      errors.push({ code: "G4B_U04_WORKSHEET_PROMPT_MISSING", severity: "error", path: `questions[${index}].promptText`, message: "題目文字不得為空。" });
    }
    if (typeof question.answerText !== "string" || question.answerText.length === 0) {
      errors.push({ code: "G4B_U04_WORKSHEET_ANSWER_MISSING", severity: "error", path: `questions[${index}].answerText`, message: "答案文字不得為空。" });
    }
    if (containsInternalId(question.promptText) || containsInternalId(question.answerText)) {
      errors.push({ code: "G4B_U04_WORKSHEET_INTERNAL_ID_LEAK", severity: "error", path: `questions[${index}]`, message: "公開題目或答案不得顯示內部 curriculum ID。" });
    }
  }
  return errors;
}

function generationReport(plan, allocation, questions, warnings) {
  return {
    requestedQuestionCount: plan.questionCount,
    generatedQuestionCount: questions.length,
    totalAttempts: questions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    groupReports: allocation.map((entry) => ({
      patternGroupId: entry.patternGroupId,
      patternSpecId: entry.patternSpecId,
      requestedQuestionCount: entry.questionCount,
      generatedQuestionCount: questions.filter((question) => question.patternSpecId === entry.patternSpecId).length,
      failureCount: 0,
    })),
    validationWarnings: cloneValue(warnings),
    generationWarnings: cloneValue(warnings),
    errors: [],
  };
}

export function isS73G4BU04WorksheetOptions(options = {}) {
  const plan = normalizeG4BU04ResolverPlan(buildBatchABrowserPlan(options));
  return isG4BU04WorksheetPlan(plan);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = normalizeG4BU04ResolverPlan(buildBatchABrowserPlan(options));
  const routeKind = classifyG4BU04CanonicalRouterPlan(initialPlan);
  if (initialPlan.sourceId === G4B_U04_SOURCE_ID && routeKind !== G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL) {
    const errors = initialPlan.resolverResult?.errors?.length > 0
      ? cloneValue(initialPlan.resolverResult.errors)
      : [{
        code: "G4B_U04_WORKSHEET_CANONICAL_ROUTE_REQUIRED",
        severity: "error",
        path: "routeKind",
        message: "G4B-U04 Worksheet 必須使用有效的 canonical KnowledgePoint route。",
      }];
    return failedResult(errors, cloneValue(initialPlan.resolverResult?.warnings ?? []), { plan: initialPlan });
  }
  if (routeKind !== G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return buildBaseBatchABrowserWorksheetDocument(options);
  }

  const eligibility = validateG4BU04WorksheetEligibility(initialPlan);
  if (!eligibility.ok) return failedResult([...eligibility.errors], [...eligibility.warnings], { eligibility });

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated, eligibility });

  const validationErrors = validateQuestions(generated.questions ?? []);
  if (validationErrors.length > 0) return failedResult(validationErrors, generated.warnings ?? [], { generation: generated, eligibility });

  const worksheetQuestions = generated.questions.map(promoteQuestion);
  const layouts = normalizeLayouts(options, worksheetQuestions);
  const questionDisplayModels = worksheetQuestions.map((question, index) => questionDisplayModel(question, index + 1, layouts.question.showQuestionNumbers));
  const answerKeyItems = layouts.question.showAnswerKeyPage
    ? worksheetQuestions.map((question, index) => answerKeyItem(question, index + 1))
    : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, layouts.question);
  const answerKeyPages = layouts.question.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, layouts.answer)
    : [];
  const plan = generated.plan;
  const warnings = generated.warnings ?? [];
  const knowledgePointIds = [...new Set(worksheetQuestions.map((question) => question.knowledgePointId))];
  const patternGroupIds = [...new Set(worksheetQuestions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId))];
  const patternSpecIds = [...new Set(worksheetQuestions.map((question) => question.patternSpecId))];
  const answerModelShapes = [...new Set(worksheetQuestions.map((question) => question.answerModelShape))];
  const modeCounts = Object.fromEntries(
    ["concept", "numeric", "application", "operation_estimation", "reasoning"]
      .map((mode) => [mode, worksheetQuestions.filter((question) => question.mode === mode).length]),
  );

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-b-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "Batch B 4B-U04 概數",
    subtitle: "概數判讀、取概數、生活應用、估算與逆推",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: G4B_U04_WORKSHEET_LIFECYCLE.productionUse,
    promotionRegistryId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    rendererProfile: cloneValue(layouts.profile),
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch B",
      grade: 4,
      semester: "B",
      unitNumber: "4B-U04",
      unitTitle: "概數",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: ["rounding_approximation", "floor_ceiling_context", "inverse_rounding"],
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" },
    },
    printOptions: {
      paperSize: layouts.question.paperSize,
      orientation: "portrait",
      columns: layouts.question.columns,
      rowsPerPage: layouts.question.rowsPerPage,
      answerKeyColumns: layouts.answer.columns,
      answerKeyRowsPerPage: layouts.answer.rowsPerPage,
      fontSizeMode: "normal",
      showQuestionNumbers: layouts.question.showQuestionNumbers,
      showAnswerKey: layouts.question.showAnswerKeyPage,
      answerKeyPlacement: layouts.question.showAnswerKeyPage ? "afterQuestions" : "none",
      pageBreakMode: "avoidLongTextCards",
      marginMode: "default",
      debugDataAttributes: false,
    },
    validationSummary: { ok: true, errors: [], warnings: cloneValue(warnings), infos: [], validatorVersion: "s73-g4b-u04-v1", validatedAt: null },
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: G4B_U04_CANONICAL_ROUTE_KINDS.CANONICAL,
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      questionMode: plan.questionMode,
      allocation: cloneValue(generated.allocation),
    },
    g4bU04Summary: {
      questionCount: worksheetQuestions.length,
      modeCounts,
      classCQuestionCount: worksheetQuestions.filter((question) => question.implementationClass === "C").length,
      classDQuestionCount: worksheetQuestions.filter((question) => question.implementationClass === "D").length,
      answerModelShapes,
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
    },
    provenance: {
      sourceType: "batch_b_browser_bridge",
      sourceTaskIds: [
        "S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration",
        "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
      ],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      promotionRegistryId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
      productionStorageCategory: "none",
    },
    sections: [{
      sectionId: "section-g4b-u04",
      title: "概數綜合練習",
      description: null,
      patternIds: patternSpecIds,
      questionIds: worksheetQuestions.map((question) => question.id),
      orderingIndex: 0,
    }],
    configSnapshot: {
      schemaVersion: "s73.batch_b.g4b_u04.worksheet_plan.v1",
      sourceId: plan.sourceId,
      questionCount: plan.questionCount,
      ordering: plan.ordering,
      includeAnswerKey: layouts.question.showAnswerKeyPage,
      generationSeed: plan.generationSeed,
      selectionMode: plan.selectionMode,
      selectedKnowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      selectedPatternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      questionMode: plan.questionMode,
      printLayout: cloneValue(layouts.question),
      answerKeyPrintLayout: cloneValue(layouts.answer),
      rendererProfileId: layouts.profile.profileId,
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "batchAKnowledgePoint",
      questionCount: worksheetQuestions.length,
      generationSeed: plan.generationSeed,
      orderingSeed: plan.generationSeed,
      resolvedOrderingSeed: plan.generationSeed,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: patternSpecIds,
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(worksheetQuestions),
    orderedQuestionIds: worksheetQuestions.map((question) => question.id),
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: worksheetQuestions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: patternSpecIds,
      ...modeCounts,
    },
    generationReport: generationReport(plan, generated.allocation, worksheetQuestions, warnings),
  };

  if (questionDisplayModels.length !== worksheetQuestions.length
    || answerKeyItems.length !== (layouts.question.showAnswerKeyPage ? worksheetQuestions.length : 0)) {
    return failedResult([{ code: "G4B_U04_WORKSHEET_COUNT_MISMATCH", severity: "error", path: "worksheetDocument", message: "題目或答案筆數不一致。" }], warnings, { eligibility });
  }

  return {
    ok: true,
    worksheetDocument,
    generation: { ...generated, questions: worksheetQuestions },
    validation: worksheetDocument.validationSummary,
    eligibility,
    errors: [],
    warnings,
  };
}
