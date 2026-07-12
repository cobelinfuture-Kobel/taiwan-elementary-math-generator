import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s59j-r1-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G5A_U08_CANONICAL_ROUTE_KINDS,
  classifyG5AU08CanonicalRouterPlan,
  normalizeG5AU08ResolverPlan,
  validateG5AU08CanonicalQuestion,
} from "./g5a-u08-canonical-router.js";
import {
  isG5AU08WorksheetPlan,
  validateG5AU08WorksheetEligibility,
} from "./g5a-u08-worksheet-eligibility.js";
import {
  G5A_U08_RENDERER_PROFILES,
  G5A_U08_WORKSHEET_ACTIVATION,
  G5A_U08_WORKSHEET_LIFECYCLE,
  G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g5a-u08-worksheet-promotion.js";
import { G5A_U08_PROMOTION_REGISTRY_ID } from "../registry/g5a-u08-promotion.js";

const CORE_ANSWER_SHAPES = Object.freeze([
  "numericAnswer",
  "expressionAnswer",
  "operatorSequenceAnswer",
  "equalityJudgementAnswer",
  "averageInverseAnswer",
  "allocationTransferAnswer",
]);

export const G5A_U08_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
  status: "worksheet_answer_key_renderer_integrated",
  schemaVersion: "worksheet-document-v1",
  answerModelShapes: CORE_ANSWER_SHAPES,
  numericProfileId: G5A_U08_RENDERER_PROFILES.numeric.profileId,
  mixedLongTextProfileId: G5A_U08_RENDERER_PROFILES.mixedLongText.profileId,
  productionUse: G5A_U08_WORKSHEET_LIFECYCLE.productionUse,
  requiredNextGate: G5A_U08_WORKSHEET_ACTIVATION.requiredNextGate,
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
  if (question.answerModelShape === "operatorSequenceAnswer") return "operator_sequence";
  if (question.answerModelShape === "equalityJudgementAnswer") return "equality_judgement";
  if (question.answerModelShape === "averageInverseAnswer") return "average_reasoning";
  if (question.answerModelShape === "allocationTransferAnswer") return "allocation_transfer";
  if (question.applicationText === true) return "word_problem";
  return "numeric_expression";
}

function responsePrompt(question = {}) {
  switch (question.answerModelShape) {
    case "operatorSequenceAnswer": return "填入運算符號：________________";
    case "equalityJudgementAnswer": return "判斷：□ 相等　□ 不相等　理由：____________________________";
    case "expressionAnswer":
    case "averageInverseAnswer":
    case "allocationTransferAnswer": return "算式：________________________________　答：________________";
    default: return null;
  }
}

function hasLongTextQuestions(questions = []) {
  return questions.some((question) => question.applicationText === true
    || ["equalityJudgementAnswer", "averageInverseAnswer", "allocationTransferAnswer"].includes(question.answerModelShape));
}

function normalizeLayouts(options, questions) {
  const profile = hasLongTextQuestions(questions)
    ? G5A_U08_RENDERER_PROFILES.mixedLongText
    : G5A_U08_RENDERER_PROFILES.numeric;
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
    phase: "S60J",
    productionUse: G5A_U08_WORKSHEET_LIFECYCLE.productionUse,
    productionWorksheetStatus: "worksheet_candidate_pending_s60k_s60l",
    promotionRegistryId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      worksheetPromotionOverlayId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
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
    depth: question.depth,
    contextType: question.context?.contextType ?? null,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(question.promptText ?? "").length,
      avoidPageBreakInside: true,
      representation: kind,
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  };
}

function answerKeyItem(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    promptText: question.promptText,
    answerText: question.answerText,
    expressionText: question.structuredAnswer?.expression ?? question.canonicalExpression ?? null,
    answerValue: question.finalAnswer,
    answerUnit: question.structuredAnswer?.unit ?? null,
    answerModelShape: question.answerModelShape,
    renderKind: renderKind(question),
    structuredAnswer: cloneValue(question.structuredAnswer),
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
    validation: { ok: false, errors, warnings, infos: [], validatorVersion: "s60j-g5a-u08-v1", validatedAt: null },
    errors,
    warnings,
    ...details,
  };
}

function validateQuestions(questions) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const canonical = validateG5AU08CanonicalQuestion(question);
    for (const entry of canonical.errors) errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    if (!CORE_ANSWER_SHAPES.includes(question.answerModelShape)) {
      errors.push({
        code: "G5A_U08_WORKSHEET_ANSWER_SHAPE_UNSUPPORTED",
        severity: "error",
        path: `questions[${index}].answerModelShape`,
        message: "Worksheet 遇到未核准的答案模型。",
      });
    }
    if (typeof question.promptText !== "string" || question.promptText.length === 0) {
      errors.push({ code: "G5A_U08_WORKSHEET_PROMPT_MISSING", severity: "error", path: `questions[${index}].promptText`, message: "題目文字不得為空。" });
    }
    if (typeof question.answerText !== "string" || question.answerText.length === 0) {
      errors.push({ code: "G5A_U08_WORKSHEET_ANSWER_MISSING", severity: "error", path: `questions[${index}].answerText`, message: "答案文字不得為空。" });
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
      requestedQuestionCount: entry.questionCount,
      generatedQuestionCount: questions.filter((question) => (question.resolvedPatternGroupId ?? question.patternGroupId) === entry.patternGroupId).length,
      patternSpecIds: cloneValue(entry.selectedPatternSpecIds ?? []),
      failureCount: 0,
    })),
    validationWarnings: cloneValue(warnings),
    generationWarnings: cloneValue(warnings),
    errors: [],
  };
}

export function isS60JG5AU08WorksheetOptions(options = {}) {
  const plan = normalizeG5AU08ResolverPlan(buildBatchABrowserPlan(options));
  return isG5AU08WorksheetPlan(plan);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = normalizeG5AU08ResolverPlan(buildBatchABrowserPlan(options));
  if (classifyG5AU08CanonicalRouterPlan(initialPlan) !== G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return buildBaseBatchABrowserWorksheetDocument(options);
  }

  const eligibility = validateG5AU08WorksheetEligibility(initialPlan);
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

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "Batch A 5A-U08 整數四則",
    subtitle: "數字題、推理題與 N+1 生活／SDG 應用題",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: G5A_U08_WORKSHEET_LIFECYCLE.productionUse,
    promotionRegistryId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    rendererProfile: cloneValue(layouts.profile),
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch A",
      grade: 5,
      semester: "A",
      unitNumber: "5A-U08",
      unitTitle: "整數四則",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: ["integer_mixed_operations", "operation_precedence", "average_inverse_update"],
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
    validationSummary: { ok: true, errors: [], warnings: cloneValue(warnings), infos: [], validatorVersion: "s60j-g5a-u08-v1", validatedAt: null },
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      questionMode: plan.questionMode,
      depthMode: plan.depthMode,
      contextMode: plan.contextMode,
      allocation: cloneValue(generated.allocation),
    },
    g5aU08Summary: {
      questionCount: worksheetQuestions.length,
      numericQuestionCount: worksheetQuestions.filter((question) => question.mode === "numeric").length,
      applicationQuestionCount: worksheetQuestions.filter((question) => question.mode === "application").length,
      reasoningQuestionCount: worksheetQuestions.filter((question) => question.mode === "reasoning").length,
      levelNCount: worksheetQuestions.filter((question) => question.depth === "N").length,
      levelNPlus1Count: worksheetQuestions.filter((question) => question.depth === "N_PLUS_1").length,
      dailyLifeCount: worksheetQuestions.filter((question) => question.context?.contextType === "daily_life").length,
      sdgCount: worksheetQuestions.filter((question) => question.context?.contextType === "sdg").length,
      answerModelShapes,
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: [
        "S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration",
        "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
      ],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      promotionRegistryId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
      productionStorageCategory: "none",
    },
    sections: [{
      sectionId: "section-g5a-u08",
      title: "整數四則與 N+1 應用",
      description: null,
      patternIds: patternSpecIds,
      questionIds: worksheetQuestions.map((question) => question.id),
      orderingIndex: 0,
    }],
    configSnapshot: {
      schemaVersion: "s60j.batch_a.g5a_u08.worksheet_plan.v1",
      sourceId: plan.sourceId,
      questionCount: plan.questionCount,
      ordering: plan.ordering,
      includeAnswerKey: layouts.question.showAnswerKeyPage,
      generationSeed: plan.generationSeed,
      selectionMode: plan.selectionMode,
      selectedKnowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      selectedPatternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      questionMode: plan.questionMode,
      depthMode: plan.depthMode,
      contextMode: plan.contextMode,
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
      numericQuestionCount: worksheetQuestions.filter((question) => question.mode === "numeric").length,
      applicationQuestionCount: worksheetQuestions.filter((question) => question.mode === "application").length,
      reasoningQuestionCount: worksheetQuestions.filter((question) => question.mode === "reasoning").length,
    },
    generationReport: generationReport(plan, generated.allocation, worksheetQuestions, warnings),
  };

  if (questionDisplayModels.length !== worksheetQuestions.length || answerKeyItems.length !== (layouts.question.showAnswerKeyPage ? worksheetQuestions.length : 0)) {
    return failedResult([{ code: "G5A_U08_WORKSHEET_COUNT_MISMATCH", severity: "error", path: "worksheetDocument", message: "題目或答案筆數不一致。" }], warnings, { eligibility });
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
