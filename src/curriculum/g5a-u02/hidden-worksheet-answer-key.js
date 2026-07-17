import { getG5AU02HiddenPatternSpecs } from "../../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  generateG5AU02Canonical,
  resolveG5AU02CanonicalRoute,
  validateG5AU02Canonical,
} from "./canonical-resolver.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }

const CANONICAL_SPECS = getG5AU02HiddenPatternSpecs();
const CANONICAL_IDS = Object.freeze(CANONICAL_SPECS.map((spec) => spec.patternSpecId));
const CANONICAL_ID_SET = new Set(CANONICAL_IDS);
const ROUTED_ANSWER_MODEL_IDS = Object.freeze([...new Set(CANONICAL_SPECS.map((spec) => spec.answerModel.shape))]);

const SUPPORTED_ANSWER_MODEL_IDS = Object.freeze([
  "relationClassificationAnswer", "integerListAnswer", "factorPairListAnswer",
  "orderedFactorRelationAnswer", "missingValueMapAnswer", "selectionSetAnswer",
  "booleanAnswer", "integerListWithUnitAnswer", "partitionPairListAnswer",
  "problemTypeLabelAnswer", "structuredInferenceAnswer", "booleanSetAnswer",
  "remainderAnswer", "integerAnswer", "lengthListAnswer", "areaListAnswer",
  "tileSideAreaPairListAnswer", "commonFactorAndGcfAnswer", "digitTupleAnswer",
]);
const SUPPORTED_ANSWER_MODEL_SET = new Set(SUPPORTED_ANSWER_MODEL_IDS);

const WORKSHEET_LIFECYCLE = deepFreeze({
  unitId: "g5a_u02",
  worksheetStatus: "hidden_exact_count_integrated",
  answerKeyStatus: "hidden_integrated_optional",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  rendererStatus: "not_connected",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden",
});

function integerInRange(value, min, max) { return Number.isInteger(value) && value >= min && value <= max; }
function blocked(errors, plan = null) { return deepFreeze({ ok: false, errors: [...new Set(errors)], plan, worksheetDocument: null }); }

export function normalizeG5AU02HiddenWorksheetPlan(input = {}) {
  const errors = [];
  const questionCount = input.questionCount ?? 22;
  const baseSeed = input.baseSeed ?? 1;
  const includeAnswerKey = input.includeAnswerKey ?? true;
  const questionRowsPerPage = input.questionRowsPerPage ?? 8;
  const answerRowsPerPage = input.answerRowsPerPage ?? 12;
  const requestedIds = input.patternSpecIds ?? CANONICAL_IDS;
  if (!integerInRange(questionCount, 1, 1000)) errors.push("G5AU02_WORKSHEET_QUESTION_COUNT_INVALID");
  if (!integerInRange(baseSeed, 1, 0x7fffffff)) errors.push("G5AU02_WORKSHEET_BASE_SEED_INVALID");
  if (typeof includeAnswerKey !== "boolean") errors.push("G5AU02_WORKSHEET_ANSWER_KEY_FLAG_INVALID");
  if (!integerInRange(questionRowsPerPage, 1, 100)) errors.push("G5AU02_WORKSHEET_QUESTION_PAGE_SIZE_INVALID");
  if (!integerInRange(answerRowsPerPage, 1, 100)) errors.push("G5AU02_WORKSHEET_ANSWER_PAGE_SIZE_INVALID");
  if (!Array.isArray(requestedIds) || requestedIds.length === 0) errors.push("G5AU02_WORKSHEET_PATTERN_SELECTION_REQUIRED");
  const patternSpecIds = Array.isArray(requestedIds) ? [...requestedIds] : [];
  if (new Set(patternSpecIds).size !== patternSpecIds.length) errors.push("G5AU02_WORKSHEET_PATTERN_SELECTION_DUPLICATE");
  for (const id of patternSpecIds) if (!CANONICAL_ID_SET.has(id)) errors.push(`G5AU02_WORKSHEET_UNKNOWN_PATTERN:${id}`);
  const plan = deepFreeze({
    schemaName: "G5AU02HiddenWorksheetPlan", schemaVersion: 1, unitId: "g5a_u02",
    questionCount, baseSeed, includeAnswerKey, questionRowsPerPage, answerRowsPerPage,
    allocationMode: "canonical_round_robin", patternSpecIds, lifecycle: WORKSHEET_LIFECYCLE,
  });
  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)], plan });
}

export function allocateG5AU02HiddenWorksheet(input = {}) {
  const normalized = normalizeG5AU02HiddenWorksheetPlan(input);
  if (!normalized.ok) return deepFreeze({ ...normalized, allocation: null });
  const { patternSpecIds, questionCount } = normalized.plan;
  const patternSequence = Array.from({ length: questionCount }, (_, index) => patternSpecIds[index % patternSpecIds.length]);
  const patternCounts = Object.fromEntries(patternSpecIds.map((id) => [id, 0]));
  for (const id of patternSequence) patternCounts[id] += 1;
  return deepFreeze({
    ok: true, errors: [], plan: normalized.plan,
    allocation: { mode: "canonical_round_robin", exactQuestionCount: questionCount, selectedPatternCount: patternSpecIds.length, patternSequence, patternCounts },
  });
}

function seedFor(baseSeed, index) { return ((baseSeed + index - 1) % 0x7fffffff) + 1; }
function joinValues(values, unitLabel = "") { const text = values.join("、"); return unitLabel ? `${text} ${unitLabel}` : text; }
function formatBoolean(value) { return value ? "是" : "否"; }
function formatProblemType(label) {
  return ({ factor: "因數", multiple: "倍數", common_factor: "公因數", common_multiple: "公倍數" })[label] ?? String(label);
}

export function formatG5AU02Answer(answerModelId, answer) {
  if (!SUPPORTED_ANSWER_MODEL_SET.has(answerModelId)) throw new Error(`G5AU02_WORKSHEET_ANSWER_MODEL_UNSUPPORTED:${answerModelId}`);
  switch (answerModelId) {
    case "relationClassificationAnswer": return answer.isFactor ? `是，商為 ${answer.quotient}` : "不是";
    case "integerListAnswer": return joinValues(answer.values);
    case "factorPairListAnswer": return answer.pairs.map(([left, right]) => `${left}×${right}`).join("、");
    case "orderedFactorRelationAnswer": return `因數：${joinValues(answer.factorList)}；配對：${answer.symmetricPairs.map(([left, right]) => `${left}×${right}`).join("、")}`;
    case "missingValueMapAnswer": return Object.entries(answer.valuesByPosition).sort(([left], [right]) => Number(left) - Number(right)).map(([position, value]) => `第 ${Number(position) + 1} 格=${value}`).join("、");
    case "selectionSetAnswer": return joinValues(answer.selectedValues);
    case "booleanAnswer": return formatBoolean(answer.value);
    case "integerListWithUnitAnswer":
    case "lengthListAnswer":
    case "areaListAnswer": return joinValues(answer.values, answer.unitLabel);
    case "partitionPairListAnswer": return answer.pairs.map((pair) => `${pair.segmentCount} 段｜每段 ${pair.lengthPerSegment} ${answer.lengthUnit}`).join("；");
    case "tileSideAreaPairListAnswer": return answer.pairs.map((pair) => `邊長 ${pair.sideLength} ${answer.sideUnit}｜面積 ${pair.tileArea} ${answer.areaUnit}`).join("；");
    case "commonFactorAndGcfAnswer": return `公因數：${joinValues(answer.commonFactors)}；最大公因數：${answer.greatestCommonFactor}`;
    case "problemTypeLabelAnswer": return formatProblemType(answer.label);
    case "structuredInferenceAnswer": return `目標數=${answer.targetNumber}；${Object.entries(answer.inferredValues).map(([key, value]) => `${key}=${value}`).join("、")}`;
    case "booleanSetAnswer": return answer.values.map(formatBoolean).join("、");
    case "remainderAnswer": return `餘數 ${answer.remainder}`;
    case "integerAnswer": return String(answer.value);
    case "digitTupleAnswer": return `${answer.value}（${answer.digits.join("、")}）`;
    default: throw new Error(`G5AU02_WORKSHEET_ANSWER_MODEL_UNSUPPORTED:${answerModelId}`);
  }
}

function paginate(records, rowsPerPage, pageKind) {
  const pages = [];
  for (let index = 0; index < records.length; index += rowsPerPage) {
    pages.push(deepFreeze({ pageKind, pageNumber: pages.length + 1, records: records.slice(index, index + rowsPerPage) }));
  }
  return deepFreeze(pages);
}

function createQuestionRecord(questionNumber, item) {
  const route = item.canonicalRoute;
  return deepFreeze({
    questionNumber, patternSpecId: item.patternSpecId, formalMappingId: route.formalMappingId,
    patternGroupId: route.patternGroupId, knowledgePointId: route.knowledgePointId,
    implementationClass: route.implementationClass, mode: route.binding.mode,
    answerModelId: route.answerModelId, prompt: item.prompt, responseLabel: "答：",
    sourceIds: route.sourceMetadata.map((metadata) => metadata.sourceId),
  });
}

function createAnswerRecord(questionNumber, item) {
  const answerModelId = item.canonicalRoute.answerModelId;
  return deepFreeze({
    questionNumber,
    patternSpecId: item.patternSpecId,
    answerModelId,
    structuredAnswer: clone(item.answer),
    answerText: formatG5AU02Answer(answerModelId, item.answer),
  });
}

export function buildG5AU02HiddenWorksheetDocument(input = {}) {
  const allocated = allocateG5AU02HiddenWorksheet(input);
  if (!allocated.ok) return blocked(allocated.errors, allocated.plan);
  const errors = [];
  const questionRecords = [];
  const answerKeyRecords = [];
  for (let index = 0; index < allocated.allocation.patternSequence.length; index += 1) {
    const patternSpecId = allocated.allocation.patternSequence[index];
    try {
      const item = generateG5AU02Canonical(patternSpecId, { seed: seedFor(allocated.plan.baseSeed, index) });
      const validation = validateG5AU02Canonical(item);
      if (!validation.ok) {
        errors.push(...validation.errors.map((code) => `${code}:${patternSpecId}`));
        continue;
      }
      questionRecords.push(createQuestionRecord(index + 1, item));
      if (allocated.plan.includeAnswerKey) answerKeyRecords.push(createAnswerRecord(index + 1, item));
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length || questionRecords.length !== allocated.plan.questionCount) {
    return blocked([...errors, ...(questionRecords.length !== allocated.plan.questionCount ? ["G5AU02_WORKSHEET_EXACT_QUESTION_COUNT_FAILED"] : [])], allocated.plan);
  }
  if (allocated.plan.includeAnswerKey && answerKeyRecords.length !== allocated.plan.questionCount) {
    return blocked(["G5AU02_WORKSHEET_EXACT_ANSWER_COUNT_FAILED"], allocated.plan);
  }
  const worksheetDocument = deepFreeze({
    schemaName: "G5AU02HiddenWorksheetDocument",
    schemaVersion: 1,
    worksheetDocumentId: `g5a_u02_hidden_${allocated.plan.baseSeed}_${allocated.plan.questionCount}`,
    unitId: "g5a_u02",
    unitTitle: "因數與公因數",
    allocation: allocated.allocation,
    questionCount: questionRecords.length,
    questionRecords,
    questionPages: paginate(questionRecords, allocated.plan.questionRowsPerPage, "question"),
    answerKeyEnabled: allocated.plan.includeAnswerKey,
    answerKeyRecords,
    answerKeyPages: allocated.plan.includeAnswerKey
      ? paginate(answerKeyRecords, allocated.plan.answerRowsPerPage, "answer_key")
      : deepFreeze([]),
    lifecycle: WORKSHEET_LIFECYCLE,
  });
  const validation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  return validation.ok
    ? deepFreeze({ ok: true, errors: [], plan: allocated.plan, worksheetDocument })
    : blocked(validation.errors, allocated.plan);
}

function flattenedRecords(pages) { return pages.flatMap((page) => page.records); }

export function validateG5AU02HiddenWorksheetDocument(document) {
  const errors = [];
  if (!document || typeof document !== "object") return deepFreeze({ ok: false, errors: ["G5AU02_WORKSHEET_DOCUMENT_REQUIRED"] });
  if (document.schemaName !== "G5AU02HiddenWorksheetDocument" || document.unitId !== "g5a_u02") errors.push("G5AU02_WORKSHEET_DOCUMENT_SCHEMA_INVALID");
  if (document.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_WORKSHEET_SELECTOR_NOT_HIDDEN");
  if (document.lifecycle?.canonicalRouting !== "internal_explicit_only") errors.push("G5AU02_WORKSHEET_CANONICAL_ROUTE_INVALID");
  if (document.lifecycle?.rendererStatus !== "not_connected") errors.push("G5AU02_WORKSHEET_RENDERER_SCOPE_BREACH");
  if (document.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_WORKSHEET_PRODUCTION_USE_FORBIDDEN");

  const questions = Array.isArray(document.questionRecords) ? document.questionRecords : [];
  if (questions.length !== document.questionCount) errors.push("G5AU02_WORKSHEET_EXACT_QUESTION_COUNT_FAILED");
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    if (question.questionNumber !== index + 1) errors.push("G5AU02_WORKSHEET_QUESTION_NUMBER_SEQUENCE_INVALID");
    if ("answer" in question || "structuredAnswer" in question || "answerText" in question) errors.push("G5AU02_WORKSHEET_QUESTION_ANSWER_LEAKAGE");
    try {
      const route = resolveG5AU02CanonicalRoute(question.patternSpecId);
      if (question.implementationClass !== route.implementationClass) errors.push("G5AU02_WORKSHEET_CLASS_ROUTE_MISMATCH");
      if (question.formalMappingId !== route.formalMappingId) errors.push("G5AU02_WORKSHEET_MAPPING_ROUTE_MISMATCH");
      if (question.patternGroupId !== route.patternGroupId) errors.push("G5AU02_WORKSHEET_GROUP_ROUTE_MISMATCH");
      if (question.knowledgePointId !== route.knowledgePointId) errors.push("G5AU02_WORKSHEET_KP_ROUTE_MISMATCH");
      if (question.answerModelId !== route.answerModelId) errors.push("G5AU02_WORKSHEET_ANSWER_MODEL_ROUTE_MISMATCH");
      if (question.mode !== route.binding.mode) errors.push("G5AU02_WORKSHEET_MODE_ROUTE_MISMATCH");
      if (JSON.stringify(question.sourceIds) !== JSON.stringify(route.sourceMetadata.map((row) => row.sourceId))) {
        errors.push("G5AU02_WORKSHEET_SOURCE_ROUTE_MISMATCH");
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  const answers = Array.isArray(document.answerKeyRecords) ? document.answerKeyRecords : [];
  if (document.answerKeyEnabled) {
    if (answers.length !== questions.length) errors.push("G5AU02_WORKSHEET_EXACT_ANSWER_COUNT_FAILED");
    for (let index = 0; index < answers.length; index += 1) {
      const answer = answers[index];
      const question = questions[index];
      if (answer.questionNumber !== index + 1) errors.push("G5AU02_WORKSHEET_ANSWER_NUMBER_SEQUENCE_INVALID");
      if (question && answer.patternSpecId !== question.patternSpecId) errors.push("G5AU02_WORKSHEET_ANSWER_PATTERN_MISMATCH");
      if (question && answer.answerModelId !== question.answerModelId) errors.push("G5AU02_WORKSHEET_ANSWER_MODEL_MISMATCH");
      if (typeof answer.answerText !== "string" || !answer.answerText) errors.push("G5AU02_WORKSHEET_ANSWER_TEXT_MISSING");
    }
  } else if (answers.length || document.answerKeyPages?.length) {
    errors.push("G5AU02_WORKSHEET_ANSWER_SUPPRESSION_FAILED");
  }

  if (JSON.stringify(flattenedRecords(document.questionPages ?? [])) !== JSON.stringify(questions)) errors.push("G5AU02_WORKSHEET_QUESTION_PAGINATION_MISMATCH");
  if (document.answerKeyEnabled && JSON.stringify(flattenedRecords(document.answerKeyPages ?? [])) !== JSON.stringify(answers)) errors.push("G5AU02_WORKSHEET_ANSWER_PAGINATION_MISMATCH");
  const allocatedTotal = Object.values(document.allocation?.patternCounts ?? {}).reduce((sum, count) => sum + count, 0);
  if (allocatedTotal !== document.questionCount) errors.push("G5AU02_WORKSHEET_ALLOCATION_TOTAL_MISMATCH");
  return deepFreeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export function auditG5AU02HiddenWorksheetIntegration() {
  const errors = [];
  const classCCount = CANONICAL_SPECS.filter((spec) => spec.implementationClass === "C").length;
  const classDCount = CANONICAL_SPECS.filter((spec) => spec.implementationClass === "D").length;
  if (CANONICAL_SPECS.length !== 22) errors.push("G5AU02_WORKSHEET_PATTERN_COUNT_MISMATCH");
  if (classCCount !== 14) errors.push("G5AU02_WORKSHEET_CLASS_C_COUNT_MISMATCH");
  if (classDCount !== 8) errors.push("G5AU02_WORKSHEET_CLASS_D_COUNT_MISMATCH");
  if (ROUTED_ANSWER_MODEL_IDS.length !== 18) errors.push("G5AU02_WORKSHEET_ANSWER_MODEL_COUNT_MISMATCH");
  for (const answerModelId of ROUTED_ANSWER_MODEL_IDS) {
    if (!SUPPORTED_ANSWER_MODEL_SET.has(answerModelId)) errors.push(`G5AU02_WORKSHEET_ANSWER_MODEL_UNSUPPORTED:${answerModelId}`);
  }
  const full = buildG5AU02HiddenWorksheetDocument({ questionCount: 22, baseSeed: 91 });
  if (!full.ok) errors.push(...full.errors);
  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    patternSpecCount: 22,
    classCCount,
    classDCount,
    answerModelCount: ROUTED_ANSWER_MODEL_IDS.length,
    supportedAnswerModelCount: SUPPORTED_ANSWER_MODEL_IDS.length,
  });
}

export function getG5AU02HiddenWorksheetPatternIds() { return [...CANONICAL_IDS]; }
export function getG5AU02HiddenWorksheetAnswerModelIds() { return [...SUPPORTED_ANSWER_MODEL_IDS]; }
export const G5A_U02_HIDDEN_WORKSHEET_LIFECYCLE = WORKSHEET_LIFECYCLE;
