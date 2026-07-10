import { buildPixelWorksheetDocument } from "./pixel-generation-bridge.js";

function normalizeMessages(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => String(item?.message ?? item?.code ?? item ?? "").trim()).filter(Boolean);
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
      : `產生失敗｜階段：${result.stage ?? "unknown"}｜錯誤 ${errors.length}`
  });
}

export function runPixelWorksheetGeneration(state) {
  try {
    const result = buildPixelWorksheetDocument(state);
    return Object.freeze({
      result,
      summary: summarizePixelGenerationResult(result)
    });
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
    return Object.freeze({
      result: failure,
      summary: summarizePixelGenerationResult(failure)
    });
  }
}
