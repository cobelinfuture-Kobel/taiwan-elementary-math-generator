import {
  generateG3BU07QuotientFractionQuestions,
  validateG3BU07QuotientFractionQuestion,
} from "./quotient-fraction-runtime.js";
import {
  generateG3BU07FractionUnitConversionQuestions,
  validateG3BU07FractionUnitConversionQuestion,
} from "./discrete-fraction-conversion-runtime.js";
import {
  generateG3BU07SameDenominatorSlice015Questions,
  validateG3BU07SameDenominatorSlice015Question,
} from "./same-denominator-fraction-runtime-p03f15.js";
import {
  generateG3BU07P03F24Questions,
  validateG3BU07P03F24Question,
} from "./fraction-context-runtime-p03f24.js";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_KP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS,
  G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS,
} from "../registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
import {
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-same-denominator-selector-projection.js";
import {
  G3B_U07_P03F24_KP_IDS,
  resolveG3BU07P03F24PatternSpecIds,
} from "../registry/g3b-u07-fraction-context-selector-projection-p03f24.js";

const issue = (code, path) => Object.freeze({ code, severity: "error", path, message: code });
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).map(String).filter(Boolean))];

const SPEC_IDS_BY_KP = Object.freeze({
  [G3B_U07_QUOTIENT_FRACTION_KP_ID]: Object.freeze([G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID]),
  [G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID]: Object.freeze([...G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS]),
  [G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID]: Object.freeze([...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS]),
  [G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID]: Object.freeze([...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS]),
  ...Object.fromEntries(G3B_U07_P03F24_KP_IDS.map((knowledgePointId) => [
    knowledgePointId,
    Object.freeze(resolveG3BU07P03F24PatternSpecIds(knowledgePointId, "numeric")),
  ])),
});

export const G3B_U07_CURRENT_KP_IDS = Object.freeze(Object.keys(SPEC_IDS_BY_KP));
export const G3B_U07_CURRENT_PATTERN_SPEC_IDS = Object.freeze(G3B_U07_CURRENT_KP_IDS.flatMap((id) => SPEC_IDS_BY_KP[id]));
const KP_SET = new Set(G3B_U07_CURRENT_KP_IDS);
const QUOTIENT_SPEC_SET = new Set([G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID]);
const CONVERSION_SPEC_SET = new Set([
  ...G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS,
  ...G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS,
]);
const SAME_DENOMINATOR_SPEC_SET = new Set([
  ...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
]);
const CONTEXT_SPEC_SET = new Set(G3B_U07_P03F24_KP_IDS.flatMap((id) => resolveG3BU07P03F24PatternSpecIds(id, "numeric")));

function requestedQuestionMode(options = {}) {
  return String(options.questionMode ?? options.requestedQuestionType ?? "numeric") === "application" ? "application" : "numeric";
}

function requestsFractionUnitConversionApplication(options = {}) {
  if (requestedQuestionMode(options) !== "application") return false;
  const requested = unique(options.selectedKnowledgePointIds).filter((id) => KP_SET.has(id));
  return options.selectionMode === "singleKnowledgePoint"
    && requested.length === 1
    && requested[0] === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID;
}

export function requestsG3BU07CurrentWorksheet(options = {}) {
  if (options.sourceId !== G3B_U07_SOURCE_ID) return false;
  if (requestedQuestionMode(options) !== "application") return true;
  return requestsFractionUnitConversionApplication(options);
}

function selectedKnowledgePointIds(options = {}) {
  const requested = unique(options.selectedKnowledgePointIds).filter((id) => KP_SET.has(id));
  if (options.selectionMode === "singleKnowledgePoint") return [requested[0] ?? G3B_U07_CURRENT_KP_IDS[0]];
  if (options.selectionMode === "mixedKnowledgePointsSameUnit") return requested.length ? requested : [...G3B_U07_CURRENT_KP_IDS];
  return [...G3B_U07_CURRENT_KP_IDS];
}

function patternSpecIdsFor(knowledgePointId, questionMode) {
  if (questionMode === "application" && knowledgePointId === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID) {
    return G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS;
  }
  return SPEC_IDS_BY_KP[knowledgePointId] ?? [];
}

function allocate(ids, count) {
  const base = Math.floor(count / ids.length);
  let remainder = count % ids.length;
  return ids.map((knowledgePointId) => {
    const questionCount = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return Object.freeze({ knowledgePointId, questionCount });
  }).filter((row) => row.questionCount > 0);
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(values, seed) {
  const output = [...values];
  let state = hashSeed(`${seed}:g3b-u07-ordering`);
  for (let index = output.length - 1; index > 0; index -= 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function groupedByPattern(questions, patternSpecIds) {
  const patternOrder = new Map(patternSpecIds.map((id, index) => [id, index]));
  return questions.map((question, index) => ({ question, index })).sort((left, right) =>
    (patternOrder.get(left.question.patternSpecId) ?? 999) - (patternOrder.get(right.question.patternSpecId) ?? 999)
      || left.index - right.index,
  ).map((entry) => entry.question);
}

export function buildG3BU07CurrentPlan(options = {}) {
  const selected = selectedKnowledgePointIds(options);
  const count = Number(options.questionCount ?? 20);
  const questionMode = requestedQuestionMode(options);
  return Object.freeze({
    sourceId: G3B_U07_SOURCE_ID,
    selectionMode: options.selectionMode ?? "sourceUnit",
    selectedKnowledgePointIds: Object.freeze(selected),
    requestedKnowledgePointIds: Object.freeze(selected),
    selectedPatternGroupIds: Object.freeze(unique(options.selectedPatternGroupIds)),
    patternSpecIds: Object.freeze(selected.flatMap((id) => patternSpecIdsFor(id, questionMode))),
    questionCount: count,
    questionMode,
    requestedQuestionType: questionMode,
    ordering: options.ordering === "shuffleAcrossPatterns" ? "shuffleAcrossPatterns" : "groupedByPattern",
    generationSeed: String(options.generationSeed ?? "g3b-u07-current"),
    allocation: null,
    genericFallbackAllowed: false,
  });
}

export function validateG3BU07CurrentPlan(plan = {}) {
  const errors = [];
  if (plan.sourceId !== G3B_U07_SOURCE_ID) errors.push(issue("g3b_u07_current_source_invalid", "sourceId"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("g3b_u07_current_question_count_invalid", "questionCount"));
  if (!["numeric", "application"].includes(plan.questionMode)) errors.push(issue("g3b_u07_current_question_mode_invalid", "questionMode"));
  if (plan.questionMode === "application" && (
    plan.selectionMode !== "singleKnowledgePoint"
    || plan.selectedKnowledgePointIds?.length !== 1
    || plan.selectedKnowledgePointIds[0] !== G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID
  )) errors.push(issue("g3b_u07_current_application_scope_invalid", "selectedKnowledgePointIds"));
  if (!["groupedByPattern", "shuffleAcrossPatterns"].includes(plan.ordering)) errors.push(issue("g3b_u07_current_ordering_invalid", "ordering"));
  if (!Array.isArray(plan.selectedKnowledgePointIds) || plan.selectedKnowledgePointIds.length < 1 || plan.selectedKnowledgePointIds.some((id) => !KP_SET.has(id))) errors.push(issue("g3b_u07_current_kp_selection_invalid", "selectedKnowledgePointIds"));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

function generatorFor(knowledgePointId) {
  if (knowledgePointId === G3B_U07_QUOTIENT_FRACTION_KP_ID) return generateG3BU07QuotientFractionQuestions;
  if (knowledgePointId === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID) return generateG3BU07FractionUnitConversionQuestions;
  if ([G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID].includes(knowledgePointId)) return generateG3BU07SameDenominatorSlice015Questions;
  return generateG3BU07P03F24Questions;
}

export function validateG3BU07CurrentQuestion(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (QUOTIENT_SPEC_SET.has(patternSpecId)) return validateG3BU07QuotientFractionQuestion(question);
  if (CONVERSION_SPEC_SET.has(patternSpecId)) return validateG3BU07FractionUnitConversionQuestion(question);
  if (SAME_DENOMINATOR_SPEC_SET.has(patternSpecId)) return validateG3BU07SameDenominatorSlice015Question(question);
  if (CONTEXT_SPEC_SET.has(patternSpecId)) return validateG3BU07P03F24Question(question);
  return Object.freeze({ ok: false, errors: Object.freeze([issue("g3b_u07_current_pattern_invalid", "patternSpecId")]), warnings: Object.freeze([]) });
}

export function validateG3BU07CurrentQuestions(questions = []) {
  const errors = [];
  questions.forEach((question, index) => errors.push(...validateG3BU07CurrentQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` }))));
  const prompts = questions.map((question) => String(question.blankedDisplayText ?? "").replace(/\s+/g, " ").trim());
  if (new Set(prompts).size !== prompts.length) errors.push(issue("g3b_u07_current_duplicate_prompt_detected", "questions"));
  const ids = questions.map((question) => question.id);
  if (new Set(ids).size !== ids.length) errors.push(issue("g3b_u07_current_duplicate_id_detected", "questions"));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]), infos: Object.freeze([]), validatorVersion: "g3b-u07-current-coordinator-v1", validatedAt: null });
}

export function generateG3BU07CurrentQuestions(options = {}) {
  const plan = options.plan ?? buildG3BU07CurrentPlan(options);
  const planValidation = validateG3BU07CurrentPlan(plan);
  if (!planValidation.ok) return Object.freeze({ ok: false, errors: planValidation.errors, warnings: planValidation.warnings, questions: Object.freeze([]), allocation: Object.freeze([]), knowledgePointAllocation: Object.freeze([]), plan });
  const knowledgePointAllocation = allocate(plan.selectedKnowledgePointIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const row of knowledgePointAllocation) {
    const generation = generatorFor(row.knowledgePointId)({
      ...options,
      plan: undefined,
      sourceId: G3B_U07_SOURCE_ID,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [row.knowledgePointId],
      selectedPatternGroupIds: [],
      patternSpecIds: undefined,
      questionMode: plan.questionMode,
      questionCount: row.questionCount,
      ordering: "groupedByPattern",
      generationSeed: `${plan.generationSeed}:${row.knowledgePointId}`,
    });
    if (!generation.ok || generation.questions.length !== row.questionCount) {
      errors.push(...(generation.errors ?? [issue("g3b_u07_current_subgeneration_failed", row.knowledgePointId)]).map((error) => ({ ...error, path: `${row.knowledgePointId}.${error.path}` })));
      continue;
    }
    questions.push(...generation.questions);
  }
  const ordered = plan.ordering === "shuffleAcrossPatterns"
    ? seededShuffle(questions, plan.generationSeed)
    : groupedByPattern(questions, plan.patternSpecIds);
  const validation = validateG3BU07CurrentQuestions(ordered);
  errors.push(...validation.errors);
  if (ordered.length !== plan.questionCount) errors.push(issue("g3b_u07_current_question_count_mismatch", "questions"));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: ordered.filter((question) => question.patternSpecId === patternSpecId).length })).filter((row) => row.questionCount > 0);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]), questions: Object.freeze(ordered), allocation: Object.freeze(allocation), knowledgePointAllocation: Object.freeze(knowledgePointAllocation), plan });
}
