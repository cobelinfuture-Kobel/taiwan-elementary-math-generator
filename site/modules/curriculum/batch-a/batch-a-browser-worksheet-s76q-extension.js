import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import { validateG4AU08AllCanonicalPublicQuestion } from "./g4a-u08-all-canonical-public-router.js";
import { G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS } from "../registry/batch-a-selector-g4a-u08-all-canonical.js";
import { G4A_U08_EXISTING_RENDERER_PROFILE } from "../registry/g4a-u08-worksheet-promotion.js";

const SOURCE_ID = "g4a_u08_4a08";
const PRODUCTION_USE = "preview_only_pending_s76r";
const PROMOTION_ID = "s76q_g4a_u08_all_canonical_groups_public";
const CANONICAL_GROUP_IDS = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.patternGroupId));

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
  const profile = G4A_U08_EXISTING_RENDERER_PROFILE;
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
    phase: "S76Q",
    productionUse: PRODUCTION_USE,
    productionWorksheetStatus: "all_canonical_worksheet_candidate_pending_s76r",
    promotionRegistryId: PROMOTION_ID,
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      worksheetPromotionOverlayId: PROMOTION_ID,
      rendererBehaviorChanged: false,
    },
  };
}

function renderKind(question = {}) {
  return question.applicationText === true || question.mode === "application"
    ? "word_problem"
    : "numeric_expression";
}

function questionDisplayModel(question, questionNumber, showQuestionNumbers) {
  const kind = renderKind(question);
  const promptText = question.promptText ?? question.displayText ?? "";
  const blankedDisplayText = question.blankedDisplayText ?? promptText;
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText,
    displayText: blankedDisplayText,
    blankedDisplayText,
    responsePrompt: kind === "word_problem"
      ? "算式：________________________________　答：________________"
      : "答案：________________",
    answerModelShape: "numericAnswer",
    renderKind: kind,
    applicationText: kind === "word_problem",
    mode: question.mode,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(blankedDisplayText).length,
      estimatedResponseLength: kind === "word_problem" ? 32 : 12,
      avoidPageBreakInside: true,
      representation: kind,
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  };
}

function answerKeyItem(question, questionNumber) {
  const kind = renderKind(question);
  const structured = question.structuredAnswer ?? {};
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    promptText: question.promptText ?? question.displayText ?? "",
    answerText: question.answerText,
    expressionText: structured.expression ?? question.canonicalExpression ?? question.expression ?? null,
    answerValue: question.finalAnswer,
    answerUnit: structured.unitLabel ?? structured.unit ?? null,
    answerModelShape: "numericAnswer",
    renderKind: `${kind}_answer`,
    structuredAnswer: cloneValue(structured),
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(`${question.promptText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: `${kind}_answer`,
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
      validatorVersion: "s76q-g4a-u08-v1",
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
    const canonical = validateG4AU08AllCanonicalPublicQuestion(question);
    for (const entry of canonical.errors) {
      errors.push({ ...entry, path: `questions[${index}].${entry.path ?? "canonical"}` });
    }
    if (question.answerModelShape !== "numericAnswer" || !Number.isInteger(question.finalAnswer)) {
      errors.push({ code: "G4A_U08_S76Q_WORKSHEET_ANSWER_INVALID", severity: "error", path: `questions[${index}].finalAnswer`, message: "S76Q Worksheet 答案必須是整數 numericAnswer。" });
    }
    if (typeof question.promptText !== "string" || question.promptText.length === 0) {
      errors.push({ code: "G4A_U08_S76Q_WORKSHEET_PROMPT_MISSING", severity: "error", path: `questions[${index}].promptText`, message: "題目文字不得為空。" });
    }
    if (typeof question.answerText !== "string" || question.answerText.length === 0) {
      errors.push({ code: "G4A_U08_S76Q_WORKSHEET_ANSWER_MISSING", severity: "error", path: `questions[${index}].answerText`, message: "答案文字不得為空。" });
    }
    if (containsInternalId(question.promptText) || containsInternalId(question.answerText)) {
      errors.push({ code: "G4A_U08_S76Q_WORKSHEET_INTERNAL_ID_LEAK", severity: "error", path: `questions[${index}]`, message: "公開題目或答案不得顯示內部 curriculum ID。" });
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
      patternSpecIds: cloneValue(entry.patternSpecIds ?? []),
      requestedQuestionCount: entry.questionCount,
      generatedQuestionCount: questions.filter((question) => (question.resolvedPatternGroupId ?? question.patternGroupId) === entry.patternGroupId).length,
      failureCount: 0,
    })),
    validationWarnings: cloneValue(warnings),
    generationWarnings: cloneValue(warnings),
    errors: [],
  };
}

export function isS76QG4AU08WorksheetOptions(options = {}) {
  if (options.sourceId !== SOURCE_ID) return false;
  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(options.selectionMode)) return false;
  return Array.isArray(options.selectedPatternGroupIds)
    && options.selectedPatternGroupIds.some((id) => CANONICAL_GROUP_IDS.has(id));
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!isS76QG4AU08WorksheetOptions(options)) {
    return failedResult([{
      code: "G4A_U08_S76Q_WORKSHEET_ROUTE_REQUIRED",
      severity: "error",
      path: "options",
      message: "S76Q Worksheet 必須使用 G4A-U08 單一或同單元 canonical PatternGroup route。",
    }]);
  }

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated });

  const validationErrors = validateQuestions(generated.questions ?? []);
  if (validationErrors.length > 0) return failedResult(validationErrors, generated.warnings ?? [], { generation: generated });

  const worksheetQuestions = generated.questions.map(promoteQuestion);
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
  const applicationQuestionCount = worksheetQuestions.filter((question) => question.applicationText === true || question.mode === "application").length;
  const numericQuestionCount = worksheetQuestions.length - applicationQuestionCount;
  const eligibility = {
    ok: true,
    sourceId: SOURCE_ID,
    productionUse: PRODUCTION_USE,
    rendererBehaviorChanged: false,
    requiredNextGate: "S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation",
  };

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? "Batch A 4A-U08 整數四則 canonical 全題組",
    subtitle: "整數四則數字題與應用題",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: PRODUCTION_USE,
    promotionRegistryId: PROMOTION_ID,
    rendererProfile: cloneValue(layouts.profile),
    rendererBehaviorChanged: false,
    productionEligibility: cloneValue(eligibility),
    questionCount: worksheetQuestions.length,
    metadata: {
      title: options.title ?? "Batch A 4A-U08 整數四則 canonical 全題組",
      questionCount: worksheetQuestions.length,
      rendererBehaviorChanged: false,
    },
    curriculumInfo: {
      publisher: "Batch A",
      grade: 4,
      semester: "A",
      unitNumber: "4A-U08",
      unitTitle: "整數四則",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: ["integer_mixed_operations", "operation_precedence", "two_step_application"],
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
    validationSummary: { ok: true, errors: [], warnings: cloneValue(warnings), infos: [], validatorVersion: "s76q-g4a-u08-v1", validatedAt: null },
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: "g4a_u08_all_canonical_public",
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      questionMode: plan.questionMode,
      allocation: cloneValue(generated.allocation),
    },
    g4aU08AllCanonicalSummary: {
      questionCount: worksheetQuestions.length,
      numericQuestionCount,
      applicationQuestionCount,
      answerModelShapes: ["numericAnswer"],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: ["S76Q_G4A_U08_AllCanonicalGroupsPublicRoutingAndWorksheetReachability"],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds,
      patternGroupIds,
      patternSpecIds,
      promotionRegistryId: PROMOTION_ID,
      productionStorageCategory: "none",
    },
    sections: [{
      sectionId: "section-g4a-u08-all-canonical",
      title: "整數四則 canonical 全題組",
      description: null,
      patternIds: patternSpecIds,
      questionIds: worksheetQuestions.map((question) => question.id),
      orderingIndex: 0,
    }],
    configSnapshot: {
      schemaVersion: "s76q.batch_a.g4a_u08.worksheet_plan.v1",
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
      numericQuestionCount,
      applicationQuestionCount,
    },
    generationReport: generationReport(plan, generated.allocation, worksheetQuestions, warnings),
  };

  if (questionDisplayModels.length !== worksheetQuestions.length || answerKeyItems.length !== (layouts.question.showAnswerKeyPage ? worksheetQuestions.length : 0)) {
    return failedResult([{
      code: "G4A_U08_S76Q_WORKSHEET_COUNT_MISMATCH",
      severity: "error",
      path: "worksheetDocument",
      message: "題目或答案筆數不一致。",
    }], warnings, { eligibility });
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
