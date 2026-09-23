import {
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
  G5A_U06_P03F30_SURFACES,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";
import {
  G5A_U06_P03F38_GROUP_ID,
  G5A_U06_P03F38_KP_ID,
  G5A_U06_P03F38_SPEC_ID,
} from "../registry/g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js";
import {
  G5A_U06_P04F34_GROUP_ID,
  G5A_U06_P04F34_KP_ID,
  G5A_U06_P04F34_SPEC_IDS,
} from "../registry/g5a-u06-measurement-difference-context-selector-projection-p04f34.js";
import {
  generateG5AU06P03F30Questions,
  validateG5AU06P03F30Question,
} from "./g5a-u06-rank8-fraction-runtime-p03f30.js";
import {
  generateG5AU06P03F38Questions,
  validateG5AU06P03F38Question,
} from "./g5a-u06-rank9-mixed-improper-add-sub-runtime-p03f38.js";
import {
  generateG5AU06P04F34Questions,
  validateG5AU06P04F34Question,
} from "./g5a-u06-measurement-difference-context-runtime-p04f34.js";

const issue = (code, path) => Object.freeze({ code, severity:"error", path, message:code });
const P03F30_BY_KP = new Map(G5A_U06_P03F30_SURFACES.map((surface) => [surface.knowledgePointId, surface]));
const NUMERIC_KP_IDS = Object.freeze([...P03F30_BY_KP.keys(), G5A_U06_P03F38_KP_ID]);
const NUMERIC_KP_SET = new Set(NUMERIC_KP_IDS);
const CURRENT_KP_SET = new Set([...NUMERIC_KP_IDS, G5A_U06_P04F34_KP_ID]);
const P03F38_SAFE_DISTINCT_CAPACITY = 80;

export const G5A_U06_CURRENT_PUBLIC_KP_IDS = Object.freeze([...NUMERIC_KP_IDS, G5A_U06_P04F34_KP_ID]);
export const G5A_U06_CURRENT_PUBLIC_APPLICATION_KP_IDS = Object.freeze([G5A_U06_P04F34_KP_ID]);

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

export function requestsG5AU06CurrentNumericApplicationMix(options = {}) {
  if (options.sourceId !== G5A_U06_P03F30_SOURCE_ID || options.selectionMode !== "mixedKnowledgePointsSameUnit") return false;
  const selected = unique(options.selectedKnowledgePointIds);
  return selected.includes(G5A_U06_P04F34_KP_ID) && selected.some((id) => NUMERIC_KP_SET.has(id));
}

function specsForKnowledgePoint(knowledgePointId) {
  if (P03F30_BY_KP.has(knowledgePointId)) return [P03F30_BY_KP.get(knowledgePointId).patternSpecId];
  if (knowledgePointId === G5A_U06_P03F38_KP_ID) return [G5A_U06_P03F38_SPEC_ID];
  if (knowledgePointId === G5A_U06_P04F34_KP_ID) return [...G5A_U06_P04F34_SPEC_IDS];
  return [];
}

function groupsForKnowledgePoint(knowledgePointId) {
  if (P03F30_BY_KP.has(knowledgePointId)) return [P03F30_BY_KP.get(knowledgePointId).patternGroupId];
  if (knowledgePointId === G5A_U06_P03F38_KP_ID) return [G5A_U06_P03F38_GROUP_ID];
  if (knowledgePointId === G5A_U06_P04F34_KP_ID) return [G5A_U06_P04F34_GROUP_ID];
  return [];
}

export function buildG5AU06CurrentMixedPlan(options = {}) {
  const selectedKnowledgePointIds = unique(options.selectedKnowledgePointIds).filter((id) => CURRENT_KP_SET.has(id));
  const patternSpecIds = selectedKnowledgePointIds.flatMap(specsForKnowledgePoint);
  return Object.freeze({
    sourceId:G5A_U06_P03F30_SOURCE_ID,
    sourceUnit:Object.freeze({ sourceId:G5A_U06_P03F30_SOURCE_ID, grade:5, semester:"upper", unitCode:"5A-U06", title:"異分母分數加減", domain:"unlike_denominator_fraction_addition_subtraction" }),
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:Object.freeze(selectedKnowledgePointIds),
    requestedKnowledgePointIds:Object.freeze(selectedKnowledgePointIds),
    selectedPatternGroupIds:Object.freeze(unique(selectedKnowledgePointIds.flatMap(groupsForKnowledgePoint))),
    requestedPatternGroupIds:Object.freeze(unique(selectedKnowledgePointIds.flatMap(groupsForKnowledgePoint))),
    patternSpecIds:Object.freeze(patternSpecIds),
    questionMode:"mixed",
    requestedQuestionType:"mixed",
    questionCount:Number(options.questionCount ?? 20),
    generationSeed:String(options.generationSeed ?? "g5a-u06-current-mixed"),
    ordering:options.ordering === "shuffleAcrossPatterns" ? "shuffleAcrossPatterns" : "groupedByPattern",
    includeAnswerKey:options.includeAnswerKey !== false,
    printLayout:options.printLayout,
    allocation:null,
    genericFallbackAllowed:false,
    productAdmissionTask:"G5A_U06_P03F30_FOUR_DIRECT_NUMERIC_CAPACITY_AND_EXISTING_APPLICATION_MIX_FULLFIX",
  });
}

export function validateG5AU06CurrentMixedPlan(plan = {}) {
  const errors = [];
  const selected = plan.selectedKnowledgePointIds ?? [];
  if (plan.sourceId !== G5A_U06_P03F30_SOURCE_ID) errors.push(issue("g5a_u06_current_source_invalid", "sourceId"));
  if (plan.selectionMode !== "mixedKnowledgePointsSameUnit" || plan.questionMode !== "mixed") errors.push(issue("g5a_u06_current_mode_invalid", "selectionMode"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 240) errors.push(issue("g5a_u06_current_question_count_invalid", "questionCount"));
  if (!Array.isArray(selected) || selected.length < 2 || selected.some((id) => !CURRENT_KP_SET.has(id))) errors.push(issue("g5a_u06_current_kp_selection_invalid", "selectedKnowledgePointIds"));
  if (!selected.includes(G5A_U06_P04F34_KP_ID) || !selected.some((id) => NUMERIC_KP_SET.has(id))) errors.push(issue("g5a_u06_current_numeric_application_mix_required", "selectedKnowledgePointIds"));
  const expectedSpecs = selected.flatMap(specsForKnowledgePoint);
  if (JSON.stringify(plan.patternSpecIds) !== JSON.stringify(expectedSpecs)) errors.push(issue("g5a_u06_current_pattern_set_invalid", "patternSpecIds"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("g5a_u06_current_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  return Object.freeze({ ok:errors.length === 0, errors:Object.freeze(errors), warnings:Object.freeze([]) });
}

function capacityForKnowledgePoint(knowledgePointId) {
  return knowledgePointId === G5A_U06_P03F38_KP_ID ? P03F38_SAFE_DISTINCT_CAPACITY : 240;
}

function allocateAcrossKnowledgePoints(knowledgePointIds, questionCount) {
  const numeric = knowledgePointIds.filter((id) => NUMERIC_KP_SET.has(id));
  const order = [numeric[0], G5A_U06_P04F34_KP_ID, ...numeric.slice(1)].filter(Boolean);
  const counts = new Map(knowledgePointIds.map((id) => [id, 0]));
  let cursor = 0;
  for (let allocated = 0; allocated < questionCount; allocated += 1) {
    let attempts = 0;
    while (attempts < order.length && (counts.get(order[cursor % order.length]) ?? 0) >= capacityForKnowledgePoint(order[cursor % order.length])) {
      cursor += 1;
      attempts += 1;
    }
    if (attempts === order.length) throw new Error("G5A_U06_CURRENT_CAPACITY_EXHAUSTED");
    const knowledgePointId = order[cursor % order.length];
    counts.set(knowledgePointId, (counts.get(knowledgePointId) ?? 0) + 1);
    cursor += 1;
  }
  return Object.freeze(knowledgePointIds.map((knowledgePointId) => Object.freeze({
    knowledgePointId,
    questionCount:counts.get(knowledgePointId) ?? 0,
  })).filter((entry) => entry.questionCount > 0));
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffle(questions, seed) {
  const rows = [...questions];
  let state = hashSeed(`${seed}:g5a-u06-current-ordering`);
  for (let index = rows.length - 1; index > 0; index -= 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const swapIndex = (state >>> 0) % (index + 1);
    [rows[index], rows[swapIndex]] = [rows[swapIndex], rows[index]];
  }
  return rows;
}

function grouped(questions, patternSpecIds) {
  const order = new Map(patternSpecIds.map((id, index) => [id, index]));
  return questions.map((question, index) => ({ question, index }))
    .sort((left, right) => (order.get(left.question.patternSpecId) ?? 999) - (order.get(right.question.patternSpecId) ?? 999) || left.index - right.index)
    .map((entry) => entry.question);
}

function generationFor(entry, plan, options) {
  const seed = `${plan.generationSeed}:${entry.knowledgePointId}`;
  if (P03F30_BY_KP.has(entry.knowledgePointId)) {
    const patternSpecId = P03F30_BY_KP.get(entry.knowledgePointId).patternSpecId;
    return generateG5AU06P03F30Questions({ ...options, questionCount:entry.questionCount, generationSeed:seed, plan:{ sourceId:plan.sourceId, selectionMode:"singleKnowledgePoint", questionMode:"numeric", patternSpecIds:[patternSpecId], questionCount:entry.questionCount, generationSeed:seed, genericFallbackAllowed:false } });
  }
  if (entry.knowledgePointId === G5A_U06_P03F38_KP_ID) {
    return generateG5AU06P03F38Questions({ ...options, questionCount:entry.questionCount, generationSeed:seed, plan:{ sourceId:plan.sourceId, selectionMode:"singleKnowledgePoint", questionMode:"numeric", patternSpecIds:[G5A_U06_P03F38_SPEC_ID], questionCount:entry.questionCount, generationSeed:seed, genericFallbackAllowed:false } });
  }
  return generateG5AU06P04F34Questions({ ...options, questionCount:entry.questionCount, generationSeed:seed, plan:{ sourceId:plan.sourceId, selectionMode:"singleKnowledgePoint", questionMode:"application", patternSpecIds:[...G5A_U06_P04F34_SPEC_IDS], questionCount:entry.questionCount, generationSeed:seed, genericFallbackAllowed:false } });
}

export function validateG5AU06CurrentMixedQuestion(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS.includes(patternSpecId)) return validateG5AU06P03F30Question(question);
  if (patternSpecId === G5A_U06_P03F38_SPEC_ID) return validateG5AU06P03F38Question(question);
  if (G5A_U06_P04F34_SPEC_IDS.includes(patternSpecId)) return validateG5AU06P04F34Question(question);
  return Object.freeze({ ok:false, errors:Object.freeze([issue("g5a_u06_current_pattern_invalid", "patternSpecId")]), warnings:Object.freeze([]) });
}

export function validateG5AU06CurrentMixedQuestions(questions = []) {
  const errors = [];
  questions.forEach((question, index) => {
    const result = validateG5AU06CurrentMixedQuestion(question);
    errors.push(...(result.errors ?? []).map((error) => ({ ...error, path:`questions[${index}].${error.path}` })));
  });
  const prompts = questions.map((question) => String(question.blankedDisplayText ?? question.promptText ?? "").trim());
  if (new Set(prompts).size !== prompts.length) errors.push(issue("g5a_u06_current_duplicate_prompt_detected", "questions"));
  const ids = questions.map((question) => question.id);
  if (new Set(ids).size !== ids.length) errors.push(issue("g5a_u06_current_duplicate_id_detected", "questions"));
  return Object.freeze({ ok:errors.length === 0, errors:Object.freeze(errors), warnings:Object.freeze([]), infos:Object.freeze([]), validatorVersion:"g5a-u06-current-mixed-p04f34-v1", validatedAt:null });
}

export function generateG5AU06CurrentMixedQuestions(options = {}) {
  const plan = options.plan ?? buildG5AU06CurrentMixedPlan(options);
  const planValidation = validateG5AU06CurrentMixedPlan(plan);
  if (!planValidation.ok) return Object.freeze({ ok:false, errors:planValidation.errors, warnings:planValidation.warnings, questions:Object.freeze([]), allocation:Object.freeze([]), knowledgePointAllocation:Object.freeze([]), plan });
  const knowledgePointAllocation = allocateAcrossKnowledgePoints(plan.selectedKnowledgePointIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of knowledgePointAllocation) {
    const generation = generationFor(entry, plan, options);
    if (!generation.ok) errors.push(...(generation.errors ?? []).map((error) => ({ ...error, path:`${entry.knowledgePointId}.${error.path}` })));
    else questions.push(...generation.questions);
  }
  if (questions.length !== plan.questionCount) errors.push(issue("g5a_u06_current_output_count_mismatch", "questions"));
  const ordered = plan.ordering === "shuffleAcrossPatterns" ? shuffle(questions, plan.generationSeed) : grouped(questions, plan.patternSpecIds);
  const validation = validateG5AU06CurrentMixedQuestions(ordered);
  errors.push(...validation.errors);
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount:ordered.filter((question) => question.patternSpecId === patternSpecId).length })).filter((entry) => entry.questionCount > 0);
  return Object.freeze({ ok:errors.length === 0, errors:Object.freeze(errors), warnings:Object.freeze([]), questions:Object.freeze(ordered), allocation:Object.freeze(allocation), knowledgePointAllocation, plan });
}
