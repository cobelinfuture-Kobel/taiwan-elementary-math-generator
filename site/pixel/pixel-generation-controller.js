import { publicIssueMessage } from "../assets/browser/state/public-ui-messages.js";
import { buildPixelWorksheetDocument } from "./pixel-generation-bridge.js";

const generationSubscribers = new Set();

function normalizeMessages(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      if (typeof item === "string") return publicIssueMessage({ message: item });
      if (String(item?.message ?? "").trim()) return publicIssueMessage(item);
      return String(item?.code ?? item ?? "").trim();
    })
    .map((message) => String(message ?? "").trim())
    .filter(Boolean);
}

function notifyGenerationSubscribers(execution) {
  for (const subscriber of generationSubscribers) {
    try {
      subscriber(execution);
    } catch {
      // A UI subscriber must not break the authoritative generation result.
    }
  }
}

export function subscribePixelGeneration(subscriber) {
  if (typeof subscriber !== "function") {
    throw new TypeError("Pixel generation subscriber must be a function.");
  }
  generationSubscribers.add(subscriber);
  return () => generationSubscribers.delete(subscriber);
}

export function summarizePixelGenerationResult(result = {}) {
  const worksheetDocument = result.worksheetDocument ?? null;
  const questionCount = worksheetDocument?.summary?.questionCount
    ?? worksheetDocument?.generatedQuestions?.length
    ?? 0;
  const answerKeyItemCount = worksheetDocument?.answerKeyItems?.length ?? 0;
  const questionPageCount = worksheetDocument?.summary?.questionPageCount
    ?? worksheetDocument?.questionPages?.length
    ?? 0;
  const answerKeyPageCount = worksheetDocument?.summary?.answerKeyPageCount
    ?? worksheetDocument?.answerKeyPages?.length
    ?? 0;
  const errors = normalizeMessages(result.errors ?? result.validation?.errors ?? []);
  const warnings = normalizeMessages(result.warnings ?? result.validation?.warnings ?? []);

  return Object.freeze({
    ok: result.ok === true,
    stage: result.stage ?? "unknown",
    worksheetId: worksheetDocument?.worksheetId ?? null,
    title: worksheetDocument?.title ?? null,
    questionCount,
    answerKeyItemCount,
    questionPageCount,
    answerKeyPageCount,
    validationOk: result.validation?.ok === true,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    statusText: result.ok === true
      ? `已產生 ${questionCount} 題｜題目頁 ${questionPageCount}｜答案 ${answerKeyItemCount} 題｜答案頁 ${answerKeyPageCount}`
      : `產生失敗｜請檢查目前選擇｜錯誤 ${errors.length}`
  });
}

function withLegacyMigrationReadback(result = {}) {
  const document = result?.worksheetDocument;
  const resolution = document?.layoutResolution;
  if (!document || resolution?.legacyMigrationApplied !== true) return result;
  const question = resolution.resolvedQuestionLayout ?? {};
  const answer = resolution.resolvedAnswerLayout ?? {};
  const appliedLayoutText = `套用版面：題目 ${question.columns} 欄 × ${question.rowsPerPage} 列；答案 ${answer.columns} 欄 × ${answer.rowsPerPage} 列`;
  return {
    ...result,
    worksheetDocument: {
      ...document,
      appliedLayoutText,
      layoutResolution: {
        ...resolution,
        capped: true,
        appliedLayoutText,
      },
      summary: {
        ...(document.summary ?? {}),
        layoutCapped: true,
        appliedLayoutText,
      },
    },
  };
}

function publishExecution(execution) {
  notifyGenerationSubscribers(execution);
  return execution;
}

export function runPixelWorksheetGeneration(state) {
  try {
    const result = withLegacyMigrationReadback(buildPixelWorksheetDocument(state));
    return publishExecution(Object.freeze({
      result,
      summary: summarizePixelGenerationResult(result)
    }));
  } catch (error) {
    const failure = Object.freeze({
      ok: false,
      stage: "exception",
      worksheetDocument: null,
      validation: { ok: false, errors: [], warnings: [] },
      errors: [Object.freeze({
        code: "pixel_generation_unexpected_exception",
        message: error instanceof Error ? error.message : String(error)
      })],
      warnings: []
    });
    return publishExecution(Object.freeze({
      result: failure,
      summary: summarizePixelGenerationResult(failure)
    }));
  }
}
