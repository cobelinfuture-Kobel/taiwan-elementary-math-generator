export { buildWorksheetDocumentFromGeneratedItems } from "./build-worksheet-document-core-closeout.js";

import { buildWorksheetDocumentFromPlan as buildBase } from "./build-worksheet-document-core-closeout.js";
import { applyW1FullProductPublicApplicationAdmission } from "../../../modules/curriculum/batch-a/w1-full-product-public-application-admission.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../../modules/core/worksheet-pagination.js";

function displayModels(questions, showQuestionNumbers) {
  return questions.map((question, index) => {
    const promptText = question.blankedDisplayText ?? question.promptText ?? question.prompt ?? "";
    return {
      questionId: question.id ?? `p01e-${index + 1}`,
      questionNumber: index + 1,
      patternId: question.patternSpecId ?? question.metadata?.patternId ?? null,
      displayText: question.displayText ?? `${promptText} ${question.answerText ?? ""}`,
      blankedDisplayText: promptText,
      answerText: String(question.answerText ?? ""),
      questionNumberText: showQuestionNumbers ? `${index + 1}.` : null,
      metadataSnapshot: { ...(question.metadata ?? {}), globalContextProduction: question.globalContextProduction ?? question.metadata?.globalContextProduction ?? null },
      layoutHints: { estimatedTextLength: String(promptText).length, hasGrouping: false, avoidPageBreakInside: true, questionMode: "application" },
    };
  });
}

function answerItems(questions, models) {
  return questions.map((question, index) => ({
    questionId: models[index].questionId,
    questionNumber: index + 1,
    patternId: models[index].patternId,
    promptText: models[index].blankedDisplayText,
    answerText: String(question.answerText ?? ""),
    metadataSnapshot: models[index].metadataSnapshot,
    layoutHints: { avoidPageBreakInside: true },
  }));
}

function projectResult(result, projected, plan) {
  if (!projected?.ok) return { ...result, ok: false, errors: [...(result?.errors ?? []), ...(projected?.errors ?? [])], worksheetDocument: null };
  const document = result?.worksheetDocument;
  if (!document || !Array.isArray(projected.questions) || projected.questions.length === 0 || !projected.p01eApplicationAdmission) return result;
  const current = document.configSnapshot?.printLayout ?? document.printOptions ?? plan.printLayout ?? {};
  const printLayout = {
    paperSize: current.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(current.columns) ? current.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(current.rowsPerPage) ? current.rowsPerPage : 4, 4),
    showQuestionNumbers: current.showQuestionNumbers !== false,
    showAnswerKeyPage: plan.includeAnswerKey !== false,
    longTextCardPolicy: "avoidSplit",
  };
  const questionDisplayModels = displayModels(projected.questions, printLayout.showQuestionNumbers);
  const answerKeyItems = printLayout.showAnswerKeyPage ? answerItems(projected.questions, questionDisplayModels) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, printLayout) : [];
  const worksheetDocument = {
    ...document,
    generatedQuestions: projected.questions,
    questions: projected.questions,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    questionCount: projected.questions.length,
    printOptions: { ...(document.printOptions ?? {}), ...printLayout, showAnswerKey: printLayout.showAnswerKeyPage, answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none" },
    publicControls: { ...(document.publicControls ?? {}), sourceId: plan.sourceId, questionMode: "application", globalContextRegistry: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1" },
    metadata: { ...(document.metadata ?? {}), questionMode: "application", globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1", p01eApplicationAdmission: projected.p01eApplicationAdmission },
    configSnapshot: { ...(document.configSnapshot ?? {}), questionMode: "application", printLayout },
    batchA: { ...(document.batchA ?? {}), sourceId: plan.sourceId, questionMode: "application" },
    summary: { ...(document.summary ?? {}), questionCount: projected.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, applicationQuestionCount: projected.questions.length, globalContextBoundQuestionCount: projected.p01eApplicationAdmission.globalContextBoundQuestionCount },
  };
  return { ...result, ok: true, errors: [], worksheetDocument, p01eApplicationAdmission: projected.p01eApplicationAdmission };
}

export function buildWorksheetDocumentFromPlan(plan = {}) {
  const result = buildBase(plan);
  if (plan.questionMode !== "application" || !result?.ok || !result?.worksheetDocument) return result;
  const questions = result.worksheetDocument.generatedQuestions ?? result.worksheetDocument.questions ?? [];
  const projected = applyW1FullProductPublicApplicationAdmission({ ok: true, questions, errors: [], warnings: result.warnings ?? [] }, plan);
  return projectResult(result, projected, plan);
}
