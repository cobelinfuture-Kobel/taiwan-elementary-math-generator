import { buildBatchABrowserPlan as buildLegacyPlan } from "./batch-a-browser-generator-p03f6.js";
import {
  generateG3AU08PartWholeFractionQuestions,
  validateG3AU08PartWholeFractionQuestion,
} from "./part-whole-fraction-runtime.js";
import {
  generateG3AU08Slice002Questions,
  validateG3AU08Slice002Question,
} from "./slice002-fraction-runtime.js";
import {
  generateG3AU08SameDenominatorCompareQuestions,
  validateG3AU08SameDenominatorCompareQuestion,
} from "./same-denominator-fraction-compare-runtime.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  G3A_U08_SOURCE_ID,
} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
  G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
} from "../registry/g3a-u08-slice002-selector-projection.js";
import {
  G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
} from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const NUMERIC_SPEC_IDS_BY_KP = Object.freeze({
  [G3A_U08_PART_WHOLE_KP_ID]: Object.freeze([G3A_U08_PART_WHOLE_PATTERN_SPEC_ID]),
  [G3A_U08_UNIT_FRACTION_KP_ID]: Object.freeze([G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID]),
  [G3A_U08_DISCRETE_FRACTION_KP_ID]: Object.freeze([
    G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
    G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  ]),
  [G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID]: Object.freeze([G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID]),
});
const APPLICATION_SPEC_IDS_BY_KP = Object.freeze({
  [G3A_U08_UNIT_FRACTION_KP_ID]: Object.freeze([G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID]),
  [G3A_U08_DISCRETE_FRACTION_KP_ID]: Object.freeze([
    G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
    G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
  ]),
  [G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID]: Object.freeze([G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID]),
});

export const G3A_U08_CURRENT_KP_IDS = Object.freeze(Object.keys(NUMERIC_SPEC_IDS_BY_KP));
const CURRENT_KP_SET = new Set(G3A_U08_CURRENT_KP_IDS);
const PART_WHOLE_SPEC_SET = new Set([G3A_U08_PART_WHOLE_PATTERN_SPEC_ID]);
const SLICE002_SPEC_SET = new Set([
  G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
]);
const SAME_DENOMINATOR_SPEC_SET = new Set([
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
]);

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function specIdsByKp(questionMode) {
  if (questionMode === "application") {
    return APPLICATION_SPEC_IDS_BY_KP;
  }

  if (questionMode === "mixed") {
    return Object.freeze(
      Object.fromEntries(
        G3A_U08_CURRENT_KP_IDS.map((knowledgePointId) => [
          knowledgePointId,
          Object.freeze([
            ...(NUMERIC_SPEC_IDS_BY_KP[knowledgePointId] ?? []),
            ...(APPLICATION_SPEC_IDS_BY_KP[knowledgePointId] ?? []),
          ]),
        ]),
      ),
    );
  }

  return NUMERIC_SPEC_IDS_BY_KP;
}

function resolveSelectedKnowledgePointIds(options, questionMode) {
  const available = specIdsByKp(questionMode);
  const requested = uniqueStrings(options.selectedKnowledgePointIds).filter((id) => available[id]);
  const selectionMode = options.selectionMode ?? "sourceUnit";
  if (selectionMode === "singleKnowledgePoint") {
    return [requested[0] ?? Object.keys(available)[0]];
  }
  if (selectionMode === "mixedKnowledgePointsSameUnit") {
    return requested.length > 0 ? requested : Object.keys(available);
  }
  return Object.keys(available);
}

function allocateAcrossKnowledgePoints(knowledgePointIds, questionCount) {
  const base = Math.floor(questionCount / knowledgePointIds.length);
  let remainder = questionCount % knowledgePointIds.length;
  return knowledgePointIds.map((knowledgePointId) => {
    const allocated = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return Object.freeze({ knowledgePointId, questionCount: allocated });
  }).filter((entry) => entry.questionCount > 0);
}
function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mix32(value) {
  let mixed = value >>> 0;
  mixed ^= mixed << 13;
  mixed ^= mixed >>> 17;
  mixed ^= mixed << 5;
  return mixed >>> 0;
}
function groupedByPattern(questions, patternSpecIds) {
  const order = new Map(patternSpecIds.map((id, index) => [id, index]));
  return questions.map((question, index) => ({ question, index }))
    .sort((left, right) => (order.get(left.question.patternSpecId) ?? 999)
      - (order.get(right.question.patternSpecId) ?? 999) || left.index - right.index)
    .map((entry) => entry.question);
}
function shuffleAcrossPatterns(questions, generationSeed) {
  const shuffled = [...questions];
  let state = hashSeed(`${generationSeed}:g3a-u08-ordering`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = mix32(state + index);
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
function applyOrdering(questions, plan) {
  return plan.ordering === "shuffleAcrossPatterns"
    ? shuffleAcrossPatterns(questions, plan.generationSeed)
    : groupedByPattern(questions, plan.patternSpecIds);
}

export function buildG3AU08CurrentPlan(options = {}) {
  const legacyPlan = buildLegacyPlan(options);
  const questionMode = ["numeric", "application", "mixed"].includes(options.questionMode)
    ? options.questionMode
    : "numeric";
  const selectedKnowledgePointIds = resolveSelectedKnowledgePointIds(options, questionMode);
  const specs = specIdsByKp(questionMode);
  const patternSpecIds = selectedKnowledgePointIds.flatMap((id) => specs[id] ?? []);
  return Object.freeze({
    ...legacyPlan,
    sourceId: G3A_U08_SOURCE_ID,
    selectionMode: options.selectionMode ?? legacyPlan.selectionMode ?? "sourceUnit",
    selectedKnowledgePointIds: Object.freeze([...selectedKnowledgePointIds]),
    requestedKnowledgePointIds: Object.freeze([...selectedKnowledgePointIds]),
    selectedPatternGroupIds: Object.freeze(uniqueStrings(options.selectedPatternGroupIds)),
    patternSpecIds: Object.freeze([...patternSpecIds]),
    questionCount: Number(options.questionCount ?? legacyPlan.questionCount ?? 20),
    questionMode,
    ordering: options.ordering === "shuffleAcrossPatterns" ? "shuffleAcrossPatterns" : "groupedByPattern",
    generationSeed: String(options.generationSeed ?? legacyPlan.generationSeed ?? "batch-a-browser"),
    allocation: null,
    genericFallbackAllowed: false,
  });
}

export function validateG3AU08CurrentPlan(plan = {}) {
  const errors = [];
  if (plan.sourceId !== G3A_U08_SOURCE_ID) errors.push(issue("g3a_u08_current_source_invalid", "sourceId"));
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 120) {
    errors.push(issue("g3a_u08_current_question_count_invalid", "questionCount"));
  }
  if (!["groupedByPattern", "shuffleAcrossPatterns"].includes(plan.ordering)) {
    errors.push(issue("g3a_u08_current_ordering_invalid", "ordering"));
  }
  const available = specIdsByKp(plan.questionMode);
  if (!Array.isArray(plan.selectedKnowledgePointIds) || plan.selectedKnowledgePointIds.length < 1
    || plan.selectedKnowledgePointIds.some((id) => !CURRENT_KP_SET.has(id) || !available[id])) {
    errors.push(issue("g3a_u08_current_kp_selection_invalid", "selectedKnowledgePointIds"));
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

function generatorForKnowledgePoint(knowledgePointId) {
  if (knowledgePointId === G3A_U08_PART_WHOLE_KP_ID) return generateG3AU08PartWholeFractionQuestions;
  if (knowledgePointId === G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID) return generateG3AU08SameDenominatorCompareQuestions;
  return generateG3AU08Slice002Questions;
}

export function validateG3AU08CurrentQuestion(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (PART_WHOLE_SPEC_SET.has(patternSpecId)) return validateG3AU08PartWholeFractionQuestion(question);
  if (SLICE002_SPEC_SET.has(patternSpecId)) return validateG3AU08Slice002Question(question);
  if (SAME_DENOMINATOR_SPEC_SET.has(patternSpecId)) return validateG3AU08SameDenominatorCompareQuestion(question);
  return Object.freeze({ ok: false, errors: Object.freeze([issue("g3a_u08_current_pattern_invalid", "patternSpecId")]), warnings: Object.freeze([]) });
}

export function validateG3AU08CurrentQuestions(questions = []) {
  const errors = [];
  questions.forEach((question, index) => {
    const validation = validateG3AU08CurrentQuestion(question);
    errors.push(...validation.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  });
  const uniquePromptCount = new Set(questions.map((question) => String(question.blankedDisplayText ?? "").trim())).size;
  if (uniquePromptCount !== questions.length) errors.push(issue("g3a_u08_current_duplicate_prompt_detected", "questions"));
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    infos: Object.freeze([]),
    validatorVersion: "g3a-u08-current-coordinator-v1",
    validatedAt: null,
  });
}

export function generateG3AU08CurrentQuestions(options = {}) {
  const plan = options.plan ?? buildG3AU08CurrentPlan(options);
  const planValidation = validateG3AU08CurrentPlan(plan);
  if (!planValidation.ok) return Object.freeze({
    ok: false, errors: planValidation.errors, warnings: planValidation.warnings,
    questions: Object.freeze([]), allocation: Object.freeze([]), knowledgePointAllocation: Object.freeze([]), plan,
  });
  const modeRequests = plan.questionMode === "mixed"
    ? [
      {
        questionMode: "numeric",
        questionCount: Math.ceil(plan.questionCount / 2),
        knowledgePointIds: plan.selectedKnowledgePointIds,
      },
      {
        questionMode: "application",
        questionCount: Math.floor(plan.questionCount / 2),
        knowledgePointIds: plan.selectedKnowledgePointIds.filter(
          (knowledgePointId) => (APPLICATION_SPEC_IDS_BY_KP[knowledgePointId] ?? []).length > 0,
        ),
      },
    ]
    : [{
      questionMode: plan.questionMode,
      questionCount: plan.questionCount,
      knowledgePointIds: plan.selectedKnowledgePointIds,
    }];

  const generatedQuestions = [];
  const errors = [];
  for (const modeRequest of modeRequests) {
    const modeAllocation = allocateAcrossKnowledgePoints(
      modeRequest.knowledgePointIds,
      modeRequest.questionCount,
    );
    for (const entry of modeAllocation) {
      const generation = generatorForKnowledgePoint(entry.knowledgePointId)({
        ...options,
        plan: undefined,
        sourceId: G3A_U08_SOURCE_ID,
        selectionMode: "singleKnowledgePoint",
        selectedKnowledgePointIds: [entry.knowledgePointId],
        selectedPatternGroupIds: [],
        patternSpecIds: undefined,
        questionMode: modeRequest.questionMode,
        questionCount: entry.questionCount,
        ordering: "groupedByPattern",
        generationSeed: plan.questionMode === "mixed"
          ? `${plan.generationSeed}:${entry.knowledgePointId}:${modeRequest.questionMode}`
          : `${plan.generationSeed}:${entry.knowledgePointId}`,
      });
      if (!generation.ok) {
        errors.push(...generation.errors.map((error) => ({
          ...error,
          path: `${entry.knowledgePointId}.${error.path}`,
        })));
        continue;
      }
      generatedQuestions.push(...generation.questions);
    }
  }

  if (generatedQuestions.length !== plan.questionCount) {
    errors.push(issue("g3a_u08_current_output_count_mismatch", "questions"));
  }
  const orderedQuestions = applyOrdering(generatedQuestions, plan);
  const validation = validateG3AU08CurrentQuestions(orderedQuestions);
  errors.push(...validation.errors);
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({
    patternSpecId,
    questionCount: orderedQuestions.filter((question) => question.patternSpecId === patternSpecId).length,
  })).filter((entry) => entry.questionCount > 0);
  const knowledgePointAllocation = plan.selectedKnowledgePointIds.map((knowledgePointId) => Object.freeze({
    knowledgePointId,
    questionCount: orderedQuestions.filter(
      (question) => question.metadata?.knowledgePointId === knowledgePointId,
    ).length,
  })).filter((entry) => entry.questionCount > 0);
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    questions: Object.freeze(orderedQuestions),
    allocation: Object.freeze(allocation),
    knowledgePointAllocation: Object.freeze(knowledgePointAllocation),
    plan,
  });
}
