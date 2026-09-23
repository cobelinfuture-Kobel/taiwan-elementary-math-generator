import { G5A_U02_PUBLIC_SOURCE_ID } from "../batch-b/g5a-u02-browser-resolver.js";
import { buildFifteenUnitGlobalContextLineage } from "../public/fifteen-unit-global-context-registry.js";

export const G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION = "glm-s05-g5a-u02-projection-v1";
export const G5A_U02_SEMANTIC_PROJECTION_VERSION = "g5a-u02-s97-visible-prompt-v1";

const SELF_CONTAINED_RESPONSE_PATTERNS = new Set([
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
]);

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

function isApplicationRecord(record = {}) {
  return String(record.mode ?? "").includes("application") || String(record.renderKind ?? "").includes("application");
}

function globalContextForRecord(record, questionNumber) {
  if (!isApplicationRecord(record)) return null;
  return buildFifteenUnitGlobalContextLineage({
    sourceId: G5A_U02_PUBLIC_SOURCE_ID,
    generationSeed: "g5a-u02-public-application",
    sequenceNumber: questionNumber,
    patternSpecId: record.patternSpecId,
  });
}

function responsePrompt(record = {}) {
  if (SELF_CONTAINED_RESPONSE_PATTERNS.has(record.patternSpecId)) return "";
  return String(record.responseLabel ?? record.responsePrompt ?? "答案：________________");
}

function questionRecords(document = {}) {
  if (Array.isArray(document.questionItems)) return document.questionItems;
  if (Array.isArray(document.questionRecords)) return document.questionRecords;
  return [];
}

function answerRecords(document = {}) {
  if (Array.isArray(document.answerKeyRecords)) return document.answerKeyRecords;
  if (Array.isArray(document.answerKeyItems)) return document.answerKeyItems;
  return [];
}

function isG5AU02Record(record = {}) {
  return String(record?.patternSpecId ?? "").startsWith("ps_g5a_u02_")
    || String(record?.knowledgePointId ?? "").startsWith("kp_g5a_u02_")
    || String(record?.patternGroupId ?? "").startsWith("pg_g5a_u02_");
}

function isG5AU02DynamicDocument(document = {}) {
  const records = questionRecords(document);
  const hasDynamicRecords = records.length > 0;
  const publicDynamicSchema = document?.schemaName === "G5AU02PublicDynamicWorksheet"
    && Number(document?.schemaVersion) === 1
    && document?.unitId === "g5a_u02";
  const canonicalDynamicSchema = document?.schemaName === "G5AU02HiddenWorksheetDocument"
    && Number(document?.schemaVersion) === 1
    && document?.unitId === "g5a_u02";
  const legacyDynamicSchema = document?.schemaVersion === "g5a-u02-hidden-worksheet-v1"
    && document?.unitId === "g5a_u02";
  const publicSourceIdentity = document?.sourceUnitId === G5A_U02_PUBLIC_SOURCE_ID
    || document?.sourceId === G5A_U02_PUBLIC_SOURCE_ID
    || document?.batchA?.sourceId === G5A_U02_PUBLIC_SOURCE_ID;
  const canonicalRecordIdentity = records.some(isG5AU02Record);
  return hasDynamicRecords
    && (publicDynamicSchema || canonicalDynamicSchema || legacyDynamicSchema || publicSourceIdentity || canonicalRecordIdentity);
}

function factorRelationAnswerText(record, fallback = "") {
  const model = record?.questionDisplayModel ?? {};
  const multiply = model.multiplicationWitness;
  const divide = model.divisionWitness;
  if (!multiply || !divide) return String(fallback);
  const candidate = model.candidateDivisor;
  const target = model.target;
  if (divide.remainder === 0) {
    return `乘法：${multiply.factorA}×${multiply.factorB}=${target}；除法：${divide.dividend}÷${divide.divisor}=${divide.quotient}，沒有餘數；判斷：${candidate} 是 ${target} 的因數。`;
  }
  const nextFactor = multiply.factorB + 1;
  const nextProduct = multiply.factorA * nextFactor;
  return `乘法：${multiply.factorA}×${multiply.factorB}=${multiply.product}，${multiply.factorA}×${nextFactor}=${nextProduct}，沒有整數乘以 ${candidate} 等於 ${target}；除法：${divide.dividend}÷${divide.divisor}=${divide.quotient} 餘 ${divide.remainder}；判斷：${candidate} 不是 ${target} 的因數。`;
}

function trialDivisionAnswerText(record, answer, fallback = "") {
  const model = record?.questionDisplayModel ?? {};
  const rows = Array.isArray(model.rows) ? model.rows : [];
  if (rows.length === 0) return String(fallback);
  const factorValues = answer?.structuredAnswer?.values ?? model.factorValues ?? [];
  const trials = rows.map((row) => `除數 ${row.divisor}：商 ${row.quotient}，餘數 ${row.remainder}，${row.isExact ? "整除" : "不整除"}`).join("；");
  return `試除：${trials}；因數：${factorValues.join("、")}`;
}

function publicAnswerText(record, answer = {}) {
  if (record?.patternSpecId === "ps_g5a_u02_factor_relation_equivalence") {
    return factorRelationAnswerText(record, answer.answerText ?? "");
  }
  if (record?.patternSpecId === "ps_g5a_u02_factor_enumeration_trial_division") {
    return trialDivisionAnswerText(record, answer, answer.answerText ?? "");
  }
  return String(answer.answerText ?? "");
}

function publicAnswerPrompt(record, prompt) {
  const model = record?.questionDisplayModel ?? {};
  if (record?.patternSpecId === "ps_g5a_u02_factor_relation_equivalence") {
    return `用乘法和除法判斷 ${model.candidateDivisor} 是否為 ${model.target} 的因數。`;
  }
  if (record?.patternSpecId === "ps_g5a_u02_factor_enumeration_trial_division") {
    return `用試除法找出 ${model.target} 的所有因數。`;
  }
  return prompt;
}

export function projectG5AU02DynamicDocumentForGlobalLayout(result) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document || !isG5AU02DynamicDocument(document)) return result;

  const records = questionRecords(document);
  const answerByNumber = new Map(
    answerRecords(document).map((record) => [record.questionNumber, record]),
  );
  const contextLineages = [];
  const questionDisplayModels = records.map((record, index) => {
    const questionNumber = Number(record.questionNumber) || index + 1;
    const prompt = String(record.prompt ?? record.promptText ?? "");
    const response = responsePrompt(record);
    const structuredDisplayModel = clone(record.questionDisplayModel ?? null);
    const globalContextProduction = globalContextForRecord(record, questionNumber);
    if (globalContextProduction) contextLineages.push(globalContextProduction);
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
      applicationText: isApplicationRecord(record),
      mode: record.mode ?? null,
      implementationClass: record.implementationClass ?? null,
      questionDisplayModel: structuredDisplayModel,
      promptCompletenessStatus: record.promptCompletenessStatus ?? null,
      metadataSnapshot: {
        sourceIds: clone(record.sourceIds ?? []),
        projectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
        semanticProjectionVersion: structuredDisplayModel ? G5A_U02_SEMANTIC_PROJECTION_VERSION : null,
        promptCompletenessStatus: record.promptCompletenessStatus ?? null,
        globalContextProduction: clone(globalContextProduction),
        sdgTags: clone(globalContextProduction?.sdgTags ?? []),
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
  const answerKeyItems = records.map((record, index) => {
    const questionNumber = Number(record.questionNumber) || index + 1;
    const answer = answerByNumber.get(questionNumber) ?? {};
    const prompt = String(record.prompt ?? record.promptText ?? "");
    const answerText = publicAnswerText(record, answer);
    const answerPrompt = publicAnswerPrompt(record, prompt);
    const globalContextProduction = globalContextForRecord(record, questionNumber);
    return {
      questionId: record.questionId ?? `g5a-u02-${questionNumber}`,
      questionNumber,
      patternId: record.patternSpecId ?? answer.patternSpecId ?? null,
      knowledgePointId: record.knowledgePointId ?? null,
      patternGroupId: record.patternGroupId ?? null,
      promptText: answerPrompt,
      answerText,
      expressionText: answer.structuredAnswer?.expression ?? null,
      answerValue: clone(answer.structuredAnswer ?? answer.answerText ?? null),
      answerUnit: answer.structuredAnswer?.unitLabel ?? answer.structuredAnswer?.unit ?? null,
      answerModelShape: record.answerModelId ?? answer.answerModelId ?? null,
      renderKind: renderKind(record),
      structuredAnswer: clone(answer.structuredAnswer ?? null),
      questionDisplayModel: clone(record.questionDisplayModel ?? null),
      metadataSnapshot: {
        sourceIds: clone(record.sourceIds ?? []),
        projectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
        semanticProjectionVersion: record.questionDisplayModel ? G5A_U02_SEMANTIC_PROJECTION_VERSION : null,
        globalContextProduction: clone(globalContextProduction),
        sdgTags: clone(globalContextProduction?.sdgTags ?? []),
      },
      layoutHints: {
        estimatedTextLength: [...`${answerPrompt}${answerText}`].length,
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
        g5aU02SemanticProjectionVersion: G5A_U02_SEMANTIC_PROJECTION_VERSION,
        globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
        globalContextBoundQuestionCount: contextLineages.length,
        globalContextProduction: clone(contextLineages),
      },
      provenance: {
        ...(document.provenance ?? {}),
        g5aU02GlobalLayoutProjectionVersion: G5A_U02_GLOBAL_LAYOUT_PROJECTION_VERSION,
        g5aU02SemanticProjectionVersion: G5A_U02_SEMANTIC_PROJECTION_VERSION,
        globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      },
    },
  };
}
