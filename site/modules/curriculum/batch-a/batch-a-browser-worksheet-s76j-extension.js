import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s73-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G4A_U08_CANONICAL_ROUTE_KINDS,
  classifyG4AU08CanonicalRouterPlan,
  normalizeG4AU08ResolverPlan,
  validateG4AU08CanonicalQuestion,
} from "./g4a-u08-canonical-router.js";
import {
  isG4AU08WorksheetPlan,
  validateG4AU08WorksheetEligibility,
} from "./g4a-u08-worksheet-eligibility.js";
import {
  G4A_U08_EXISTING_RENDERER_PROFILE,
  G4A_U08_WORKSHEET_ACTIVATION,
  G4A_U08_WORKSHEET_LIFECYCLE,
  G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "../registry/g4a-u08-worksheet-promotion.js";
import {
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";

export const G4A_U08_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  status: "resolver_selector_and_worksheet_allocation_integrated",
  schemaVersion: "worksheet-document-v1",
  answerModelShapes: Object.freeze(["numericAnswer"]),
  rendererProfileId: G4A_U08_EXISTING_RENDERER_PROFILE.profileId,
  rendererBehaviorChanged: false,
  productionUse: G4A_U08_WORKSHEET_LIFECYCLE.productionUse,
  requiredNextGate: G4A_U08_WORKSHEET_ACTIVATION.requiredNextGate,
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

function normalizeLayouts(options = {}) {
  const requested = options.printLayout ?? {};
  const questionSheet = G4A_U08_EXISTING_RENDERER_PROFILE.questionSheet;
  const answerKey = G4A_U08_EXISTING_RENDERER_PROFILE.answerKey;
  const showAnswerKeyPage = options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false;
  return {
    profile: G4A_U08_EXISTING_RENDERER_PROFILE,
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

function promoteWorksheetQuestion(question = {}) {
  return {
    ...cloneValue(question),
    phase: "S76J",
    productionUse: G4A_U08_WORKSHEET_LIFECYCLE.productionUse,
    productionWorksheetStatus: "worksheet_candidate_pending_s76k",
    promotionRegistryId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      worksheetPromotionOverlayId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
      rendererBehaviorChanged: false,
    },
  };
}

function questionDisplayModel(question, questionNumber, showQuestionNumbers) {
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
    responsePrompt: "算式：________________________________　答：________________",
    answerModelShape: "numericAnswer",
    renderKind: "word_problem",
    applicationText: true,
    mode: "application",
    contextType: question.context?.contextType ?? null,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(question.promptText ?? "").length,
      estimatedResponseLength: 32,
      avoidPageBreakInside: true,
      representation: "word_problem",
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
    answerModelShape: "numericAnswer",
    renderKind: "word_problem_answer",
    structuredAnswer: cloneValue(question.structuredAnswer),
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(`${question.promptText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "word_problem_answer",
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  };
}

function failedResult(errors, warnings = [], details = {}) {
  return {
    ok: false,
    worksheetDocument: null,
    validation: {
      ok: false,
      errors,
      warnings,
      infos: [],
      validatorVersion: "s76j-g4a-u08-v1",
      validatedAt: null,
    },
    errors,
    warnings,
    ...details,
  };
}

function containsInternalId(text) {
  return /\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i.test(String(text ?? ""));
}

function validateQuestions(questions = []) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const canonical = validateG4AU08CanonicalQuestion(question);
    for (const entry of canonical.errors) errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    if (question.answerModelShape !== "numericAnswer" || !Number.isInteger(question.finalAnswer)) {
      errors.push({ code: "G4A_U08_WORKSHEET_ANSWER_INVALID", severity: "error", path: `questions[${index}].finalAnswer`, message: "Worksheet 答案必須是整數 numericAnswer。" });
    }
    if (typeof question.promptText !== "string" || question.promptText.length === 0) {
      errors.push({ code: "G4A_U08_WORKSHEET_PROMPT_MISSING", severity: "error", path: `questions[${index}].promptText`, message: "題目文字不得為空。" });
    }
    if (typeof question.answerText !== "string" || question.answerText.length === 0) {
      errors.push({ code: "G4A_U08_WORKSHEET_ANSWER_MISSING", severity: "error", path: `questions[${index}].answerText`, message: "答案文字不得為空。" });
    }
    if (containsInternalId(question.promptText) || containsInternalId(question.answerText)) {
      errors.push({ code: "G4A_U08_WORKSHEET_INTERNAL_ID_LEAK", severity: "error", path: `questions[${index}]`, message: "公開題目或答案不得顯示內部 curriculum ID。" });
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

export function isS76JG4AU08WorksheetOptions(options = {}) {
  const plan = normalizeG4AU08ResolverPlan(buildBatchABrowserPlan(options));
  return isG4AU08WorksheetPlan(plan);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = normalizeG4AU08ResolverPlan(buildBatchABrowserPlan(options));
  const routeKind = classifyG4AU08CanonicalRouterPlan(initialPlan);
  if (initialPlan.sourceId === G4A_U08_SOURCE_ID && routeKind !== G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    const errors = initialPlan.resolverResult?.errors?.length > 0
      ? cloneValue(initialPlan.resolverResult.errors)
      : [{
        code: "G4A_U08_WORKSHEET_CANONICAL_ROUTE_REQUIRED",
        severity: "error",
        path: "routeKind",
        message: "G4A-U08 Worksheet 必須使用有效的 Phase2B canonical KnowledgePoint route。",
      }];
    return failedResult(errors, cloneValue(initialPlan.resolverResult?.warnings ?? []), { plan: initialPlan });
  }
  if (routeKind !== G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL) {
    return buildBaseBatchABrowserWorksheetDocument(options);
  }

  const eligibility = validateG4AU08WorksheetEligibility(initialPlan);
  if (!eligibility.ok) return failedResult([...eligibility.errors], [...eligibility.warnings], { eligibility });

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated, eligibility });

  const validationErrors = validateQuestions(generated.questions ?? []);
  if (validationErrors.length > 0) return failedResult(validationErrors, generated.warnings ?? [], { generation: generated, eligibility });

  const worksheetQuestions = generated.questions.map(promoteWorksheetQuestion);
  const layouts = normalizeLayouts(options);
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

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "Batch A 4A-U08 整數四則 Phase2B",
    subtitle: "比較關係、等總價、相對差與雙成本付款應用題",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: G4A_U08_WORKSHEET_LIFECYCLE.productionUse,
    promotionRegistryId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    rendererProfile: cloneValue(layouts.profile),
    rendererBehaviorChanged: false,
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch A",
      grade: 4,
      semester: "A",
      unitNumber: "4A-U08",
      unitTitle: "整數四則",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: ["comparison_chain", "equal_value_unit_price", "relative_difference", "two_component_payment"],
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", class: "班級", score: "得分" },
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
    validationSummary: { ok: true, errors: [], warnings: cloneValue(warnings), infos: [], validatorVersion: "s76j-g4a-u08-v1", validatedAt: null },
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: G4A_U08_CANONICAL_ROUTE_KINDS.CANONICAL,
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      questionMode: plan.questionMode,
      allocation: cloneValue(generated.allocation),
    },
    g4aU08Phase2BSummary: {
      questionCount: worksheetQuestions.length,
      applicationQuestionCount: worksheetQuestions.length,
      answerModelShapes: ["numericAnswer"],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: [
        "S76I_G4A_U08_Phase2BMissingPatternGroupsImplementation",
        "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
      ],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      promotionRegistryId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
      productionStorageCategory: "none",
    },
    sections: [{
      sectionId: "section-g4a-u08-phase2b",
      title: "整數四則 Phase2B 應用題",
      description: null,
      patternIds: patternSpecIds,
      questionIds: worksheetQuestions.map((question) => question.id),
      orderingIndex: 0,
    }],
    configSnapshot: {
      schemaVersion: "s76j.batch_a.g4a_u08.worksheet_plan.v1",
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
      applicationQuestionCount: worksheetQuestions.length,
    },
    generationReport: generationReport(plan, generated.allocation, worksheetQuestions, warnings),
  };

  if (questionDisplayModels.length !== worksheetQuestions.length || answerKeyItems.length !== (layouts.question.showAnswerKeyPage ? worksheetQuestions.length : 0)) {
    return failedResult([{ code: "G4A_U08_WORKSHEET_COUNT_MISMATCH", severity: "error", path: "worksheetDocument", message: "題目或答案筆數不一致。" }], warnings, { eligibility });
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
