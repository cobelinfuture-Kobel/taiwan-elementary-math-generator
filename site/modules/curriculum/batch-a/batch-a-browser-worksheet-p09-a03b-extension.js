import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/worksheet-pagination.js";
import { buildG3AU08InlineMathModel } from "./g3a-u08-inline-fraction-display.js";
import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions,
  requestsP09A03B,
} from "./batch-a-browser-generator-p09-a03b.js";
import { getP09A03BSourceRouteAlias } from "../registry/public-curriculum-source-route-aliases-p09-a03b.js";

const TASK_ID = "P09_UI_A03B_PublicCurriculumUnitCompletenessImplementation";

function printLayout(options = {}) {
  const layout = options.printLayout ?? {};
  return Object.freeze({
    paperSize: layout.paperSize ?? "A4",
    columns: Number.isInteger(layout.columns) ? Math.min(Math.max(layout.columns, 1), 2) : 2,
    rowsPerPage: Number.isInteger(layout.rowsPerPage) ? Math.min(Math.max(layout.rowsPerPage, 1), 4) : 4,
    showQuestionNumbers: layout.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && layout.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
  });
}

function promptText(question = {}) {
  return String(
    question.blankedDisplayText
      ?? question.promptText
      ?? question.prompt
      ?? question.questionText
      ?? "",
  );
}

function answerText(question = {}) {
  return String(question.answerText ?? question.answer ?? question.finalAnswer ?? "");
}

function inlineMath(sourceId, text) {
  return sourceId === "g3a_u08_3a08"
    ? buildG3AU08InlineMathModel({ sourceId, plainText: text })
    : null;
}

function displayModel(question, index, layout, sourceId) {
  const prompt = promptText(question);
  const answer = answerText(question);
  return Object.freeze({
    questionId: question.id ?? `p09-a03b-q-${index + 1}`,
    questionNumber: index + 1,
    patternId: question.patternSpecId ?? question.metadata?.patternId ?? null,
    knowledgePointId: question.knowledgePointId ?? question.metadata?.knowledgePointId ?? null,
    patternGroupId: question.patternGroupId ?? question.metadata?.patternGroupId ?? null,
    promptText: prompt,
    displayText: question.displayText ?? `${prompt} ${answer}`,
    blankedDisplayText: prompt,
    answerText: answer,
    questionNumberText: layout.showQuestionNumbers ? `${index + 1}.` : null,
    promptInlineMath: inlineMath(sourceId, prompt),
    metadataSnapshot: Object.freeze({
      ...(question.metadata ?? {}),
      sourceId,
      requestedCurriculumSourceId: sourceId,
      knowledgePointId: question.knowledgePointId ?? question.metadata?.knowledgePointId ?? null,
      questionMode: question.questionMode ?? question.mode ?? null,
    }),
    layoutHints: Object.freeze({
      estimatedTextLength: prompt.length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      questionMode: question.questionMode ?? question.mode ?? "mixed",
      longTextCardPolicy: "avoidSplit",
    }),
  });
}

function answerItem(question, index, model, sourceId) {
  const prompt = promptText(question);
  const answer = answerText(question);
  return Object.freeze({
    questionId: model.questionId,
    questionNumber: index + 1,
    patternId: model.patternId,
    knowledgePointId: model.knowledgePointId,
    patternGroupId: model.patternGroupId,
    promptText: prompt,
    answerText: answer,
    promptInlineMath: inlineMath(sourceId, prompt),
    answerInlineMath: inlineMath(sourceId, answer),
    metadataSnapshot: model.metadataSnapshot,
    layoutHints: Object.freeze({
      avoidPageBreakInside: true,
      questionMode: question.questionMode ?? question.mode ?? "mixed",
    }),
  });
}

function titleFor(plan = {}) {
  const unit = plan.sourceUnit ?? {};
  return `${unit.grade ?? ""}年級｜${unit.unitCode ?? plan.sourceId ?? ""}｜${unit.title ?? "數學練習"}`;
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  if (!requestsP09A03B(options)) return null;
  const plan = buildBatchABrowserPlan(options);
  const generation = generateBatchABrowserQuestions({ ...options, plan });
  if (!generation?.ok) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([...(generation?.errors ?? [{ code: "P09_A03B_GENERATION_FAILED" }])]),
      warnings: Object.freeze([...(generation?.warnings ?? [])]),
      worksheetDocument: null,
      generation,
      plan,
    });
  }

  const layout = printLayout(options);
  const sourceId = plan.sourceId;
  const models = generation.questions.map((question, index) => displayModel(question, index, layout, sourceId));
  const answers = layout.showAnswerKeyPage
    ? generation.questions.map((question, index) => answerItem(question, index, models[index], sourceId))
    : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answers, { ...layout, columns: 2, rowsPerPage: 4 })
    : [];
  const alias = getP09A03BSourceRouteAlias(sourceId);
  const numericQuestionCount = generation.questions.filter((question) => (
    String(question.questionMode ?? question.mode ?? "").toLowerCase().includes("numeric")
  )).length;
  const applicationQuestionCount = generation.questions.length - numericQuestionCount;

  const worksheetDocument = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p09-a03b-${sourceId}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: titleFor(plan),
    subtitle: plan.selectionMode === "sourceUnit"
      ? "整個單元"
      : plan.selectionMode === "mixedKnowledgePointsSameUnit"
        ? "同單元混合"
        : "單一知識點",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({ ...plan, printLayout: layout }),
    orderingMode: plan.ordering,
    questionCount: generation.questions.length,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    generatedQuestions: generation.questions,
    questions: generation.questions,
    questionDisplayModels: Object.freeze(models),
    answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({
      ...layout,
      answerKeyColumns: 2,
      answerKeyRowsPerPage: 4,
      showAnswerKey: layout.showAnswerKeyPage,
      answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none",
    }),
    publicControls: Object.freeze({
      sourceId,
      questionCountMax: 120,
      productAdmissionTask: TASK_ID,
      semanticOwnerSourceId: alias?.semanticOwnerSourceId ?? null,
      authorityMode: "P09_A03B_PUBLIC_CURRICULUM_UNIT_PRIMARY",
    }),
    metadata: Object.freeze({
      taskId: TASK_ID,
      sourceId,
      semanticOwnerSourceId: alias?.semanticOwnerSourceId ?? null,
      sourceRouteAlias: Boolean(alias),
      sourceAuthorityPolicy: alias?.sourceAuthorityPolicy ?? null,
      selectionMode: plan.selectionMode,
      publicCurriculumUnitCompletenessCorrection: true,
      canonicalUniqueKnowledgePointCount: 482,
      publicSourceKnowledgePointRouteProjectionCount: 493,
      publicCurriculumUnitCount: 78,
      crossUnitMixedUsed: false,
      sharedRuntimeScope: "SHARED_RUNTIME_BOUNDED",
    }),
    batchA: Object.freeze({
      sourceId,
      questionMode: plan.questionMode,
      selectionMode: plan.selectionMode,
    }),
    report: Object.freeze({
      ok: true,
      errors: Object.freeze([]),
      warnings: Object.freeze([]),
      summary: Object.freeze({
        questionCount: generation.questions.length,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
      }),
    }),
    summary: Object.freeze({
      questionCount: generation.questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      numericQuestionCount,
      applicationQuestionCount,
    }),
  });

  return Object.freeze({
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    worksheetDocument,
    generation,
    plan,
    p09A03BImplemented: true,
  });
}
