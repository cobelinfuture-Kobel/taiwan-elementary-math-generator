import { G5A_U02_PUBLIC_SOURCE_ID } from "../batch-b/g5a-u02-browser-resolver.js";

export const G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION = "glm-s05-g5a-u02-projection-v1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function renderKind(record = {}) {
  if (record.renderKind) return record.renderKind;
  if (record.mode === "application") return "contextual_application";
  if (record.mode === "reasoning_application") return "reasoning_application";
  if (record.mode === "geometry_application") return "geometry_application";
  if (record.mode === "reasoning") return "reasoning";
  if (record.mode === "representation") return "representation";
  if (record.mode === "concept") return "concept";
  return "numeric";
}

function responsePrompt(record = {}) {
  return String(record.responseLabel ?? record.responsePrompt ?? "答案：________________");
}

function isG5AU02DynamicDocument(document = {}) {
  const dynamicRecordShape = document?.schemaVersion === "g5a-u02-hidden-worksheet-v1"
    && Array.isArray(document?.questionRecords);
  return dynamicRecordShape
    || document?.sourceUnitId === G5A_U02_PUBLIC_SOURCE_ID
    || document?.sourceId === G5A_U02_PUBLIC_SOURCE_ID
    || document?.batchA?.sourceId === G5A_U02_PUBLIC_SOURCE_ID;
}

export function projectG5AU02DynamicDocumentForGlobalLayout(result) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document || !isG5AU02DynamicDocument(document)) return result;
  if (!Array.isArray(document.questionRecords) || document.questionRecords.length === 0) return result;

  const answerByNumber = new Map(
    (document.answerKeyRecords ?? []).map((record) => [record.questionNumber, record]),
  );
  const questionDisplayModels = document.questionRecords.map((record, index) => {
    const questionNumber = Number(record.questionNumber) || index + 1;
    const prompt = String(record.prompt ?? record.promptText ?? "");
    const response = responsePrompt(record);
    return {
      questionId: record.questionId ?? `g5a-u02-${questionNumber}`,
      questionNumber,
      patternId: record.patternSpecId ?? null,
      knowledgePointId: record.knowledgePointId ?? null,
      patternGroupId: record.patternGroupId ?? null,
      questionNumberText: `${questionNumber}.`,
      promptText: prompt,
      displayText: prompt,
      blankedDisplayText: prompt,
      responsePrompt: response,
      answerModelShape: record.answerModelId ?? null,
      renderKind: renderKind(record),
      applicationText: String(record.mode ?? "").includes("application"),
      mode: record.mode ?? null,
      implementationClass: record.implementationClass ?? null,
      metadataSnapshot: {
        sourceIds: clone(record.sourceIds ?? []),
        projectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
      },
      layoutHints: {
        estimatedTextLength: [...prompt].length,
        estimatedResponseLength: [...response].length,
        avoidPageBreakInside: true,
        representation: renderKind(record),
        longTextCardPolicy: "avoidSplit",
        preserveTraditionalChinese: true,
      },
    };
  });
  const answerKeyItems = document.questionRecords.map((record, index) => {
    const questionNumber = Number(record.questionNumber) || index + 1;
    const answer = answerByNumber.get(questionNumber) ?? {};
    const prompt = String(record.prompt ?? record.promptText ?? "");
    return {
      questionId: record.questionId ?? `g5a-u02-${questionNumber}`,
      questionNumber,
      patternId: record.patternSpecId ?? answer.patternSpecId ?? null,
      knowledgePointId: record.knowledgePointId ?? null,
      patternGroupId: record.patternGroupId ?? null,
      promptText: prompt,
      answerText: String(answer.answerText ?? ""),
      expressionText: answer.structuredAnswer?.expression ?? null,
      answerValue: clone(answer.structuredAnswer ?? answer.answerText ?? null),
      answerUnit: answer.structuredAnswer?.unitLabel ?? answer.structuredAnswer?.unit ?? null,
      answerModelShape: record.answerModelId ?? answer.answerModelId ?? null,
      renderKind: renderKind(record),
      structuredAnswer: clone(answer.structuredAnswer ?? null),
      metadataSnapshot: {
        sourceIds: clone(record.sourceIds ?? []),
        projectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
      },
      layoutHints: {
        estimatedTextLength: [...`${prompt}${answer.answerText ?? ""}`].length,
        avoidPageBreakInside: true,
        representation: `${renderKind(record)}_answer`,
        longTextCardPolicy: "avoidSplit",
        preserveTraditionalChinese: true,
      },
    };
  });

  return {
    ...result,
    worksheetDocument: {
      ...document,
      questionDisplayModels,
      answerKeyItems,
      metadata: {
        ...(document.metadata ?? {}),
        g5aU02GlobalLayoutProjectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
      },
      provenance: {
        ...(document.provenance ?? {}),
        g5aU02GlobalLayoutProjectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
      },
    },
  };
}
