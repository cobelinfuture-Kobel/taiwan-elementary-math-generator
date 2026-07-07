import { generateBatchABrowserQuestions as generateBaseG3AU06DivisionQuestions } from "./g3a-u06-division-generator.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateG3BU01WordProblem } from "./g3b-u01-word-problem-generator.js";

const sourceIds = Object.freeze(["g3a_u06_3a06", "g3b_u01_3b01"]);
const g3bU01SourceId = "g3b_u01_3b01";
const g3bU01CalculationSpecIds = Object.freeze([
  "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
  "ps_g3b_u01_2digit_by_1digit_regroup_tens",
  "ps_g3b_u01_2digit_leading_digit_insufficient",
  "ps_g3b_u01_2digit_ones_quotient_zero",
  "ps_g3b_u01_2digit_leading_digit_exact",
  "ps_g3b_u01_3digit_hundreds_insufficient",
  "ps_g3b_u01_3digit_tens_quotient_zero",
  "ps_g3b_u01_3digit_ones_quotient_zero",
  "ps_g3b_u01_3digit_hundreds_exact",
  "ps_g3b_u01_2digit_division_with_remainder",
  "ps_g3b_u01_3digit_division_with_remainder"
]);
const g3bU01WordProblemSpecIds = Object.freeze([
  "ps_g3b_u01_wp_partitive_equal_sharing",
  "ps_g3b_u01_wp_partitive_unit_rate",
  "ps_g3b_u01_wp_quotative_packaging_exact",
  "ps_g3b_u01_wp_quotative_grouping_exact",
  "ps_g3b_u01_wp_remainder_packaging_leftover",
  "ps_g3b_u01_wp_remainder_calendar_weeks_days",
  "ps_g3b_u01_wp_remainder_floor_max_groups",
  "ps_g3b_u01_wp_remainder_ceil_min_containers",
  "ps_g3b_u01_wp_two_step_divide_then_add",
  "ps_g3b_u01_wp_two_step_add_then_divide",
  "ps_g3b_u01_wp_two_step_divide_then_subtract",
  "ps_g3b_u01_wp_two_step_subtract_then_divide"
]);
const g3bU01SupportedSpecIds = Object.freeze([...g3bU01CalculationSpecIds, ...g3bU01WordProblemSpecIds]);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function sortBucket(questions, plan) {
  return questions
    .map((question, index) => ({ question, index, key: hashSeed(`${plan.generationSeed}:${question.patternSpecId}:${question.id}:${index}`) }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.question);
}

function interleaveAcrossPatternSpecs(questions, plan, allocation) {
  if (!sourceIds.includes(plan?.sourceId) || plan.ordering !== "shuffleAcrossPatterns" || !Array.isArray(allocation) || allocation.length < 2) return questions;
  const buckets = new Map(allocation.map((entry) => [entry.patternSpecId, []]));
  for (const question of questions) buckets.get(question.patternSpecId)?.push(question);
  for (const [patternSpecId, bucket] of buckets.entries()) buckets.set(patternSpecId, sortBucket(bucket, plan));
  const patternOrder = allocation
    .map((entry, index) => ({ patternSpecId: entry.patternSpecId, index, key: hashSeed(`${plan.generationSeed}:${entry.patternSpecId}:${index}`) }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.patternSpecId);
  const output = [];
  let moved = true;
  while (moved) {
    moved = false;
    for (const patternSpecId of patternOrder) {
      const next = buckets.get(patternSpecId)?.shift();
      if (next) { output.push(next); moved = true; }
    }
  }
  return output;
}

function isG3BU01WordProblemPlan(plan) {
  return plan?.sourceId === g3bU01SourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => g3bU01WordProblemSpecIds.includes(id));
}

function isG3BU01MixedCalculationWordProblemPlan(plan) {
  if (plan?.sourceId !== g3bU01SourceId || !Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) return false;
  const hasCalculation = plan.patternSpecIds.some((id) => g3bU01CalculationSpecIds.includes(id));
  const hasWordProblem = plan.patternSpecIds.some((id) => g3bU01WordProblemSpecIds.includes(id));
  return hasCalculation && hasWordProblem && plan.patternSpecIds.every((id) => g3bU01SupportedSpecIds.includes(id));
}

function makeMetadata(patternSpecId, semanticModel) {
  return {
    patternId: patternSpecId,
    sourceId: g3bU01SourceId,
    patternTags: ["batch_a", "browser_bridge", g3bU01SourceId, patternSpecId],
    skillTags: ["division_word_problem", "word_problem", semanticModel],
    difficultyTags: ["batch_a_browser_bridge", "g3b_u01_word_problem"],
    curriculumNodeIds: [g3bU01SourceId],
    canonicalSkillIds: ["division_word_problem"]
  };
}

function makeWordProblemQuestion(patternSpecId, sequenceNumber, seed) {
  const question = generateG3BU01WordProblem({ patternSpecId, seed: `${seed}:${patternSpecId}:${sequenceNumber}` });
  return {
    id: `${patternSpecId}-${sequenceNumber}`,
    sourceId: g3bU01SourceId,
    patternSpecId,
    kind: "g3bU01WordProblem",
    templateId: question.templateId,
    semanticModel: question.semanticModel,
    promptText: question.questionText,
    displayText: `${question.questionText} 答案：${question.answer.text}`,
    blankedDisplayText: question.questionText,
    questionText: question.questionText,
    answerText: question.answer.text,
    finalAnswer: question.answer.value ?? question.answer.text,
    slotValues: cloneValue(question.slotValues),
    answer: cloneValue(question.answer),
    answerModel: cloneValue(question.answerModel),
    operationModel: cloneValue(question.operationModel),
    metadata: makeMetadata(patternSpecId, question.semanticModel)
  };
}

function generateG3BU01WordProblemQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : [];
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!g3bU01WordProblemSpecIds.includes(entry.patternSpecId)) errors.push({ code: "batch_a_g3b_u01_wp_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G3B-U01 word-problem PatternSpec" });
    for (let index = 0; index < entry.questionCount; index += 1) questions.push(makeWordProblemQuestion(entry.patternSpecId, questions.length + 1, plan.generationSeed));
  }
  return { ok: errors.length === 0, plan, questions: interleaveAcrossPatternSpecs(questions, plan, allocation), allocation, errors, warnings: [] };
}

function generateCalculationEntryQuestions(options, plan, entry) {
  const result = generateBaseG3AU06DivisionQuestions({
    ...options,
    selectedPatternGroupIds: [entry.patternGroupId],
    questionCount: entry.questionCount,
    generationSeed: `${plan.generationSeed}:${entry.patternSpecId}`
  });
  if (!result.ok) return result;
  return { ...result, questions: result.questions.map((question, index) => ({ ...question, id: `${question.id}-mixed-${index + 1}` })) };
}

function generateG3BU01MixedCalculationWordProblemQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : [];
  const questions = [];
  const errors = [];
  const warnings = [];

  for (const entry of allocation) {
    if (g3bU01WordProblemSpecIds.includes(entry.patternSpecId)) {
      for (let index = 0; index < entry.questionCount; index += 1) questions.push(makeWordProblemQuestion(entry.patternSpecId, questions.length + 1, plan.generationSeed));
      continue;
    }
    if (g3bU01CalculationSpecIds.includes(entry.patternSpecId)) {
      const result = generateCalculationEntryQuestions(options, plan, entry);
      if (!result.ok) {
        errors.push(...(result.errors ?? []));
        warnings.push(...(result.warnings ?? []));
      } else {
        questions.push(...result.questions);
        warnings.push(...(result.warnings ?? []));
      }
      continue;
    }
    errors.push({ code: "batch_a_g3b_u01_mixed_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G3B-U01 mixed PatternSpec" });
  }

  return { ok: errors.length === 0, plan, questions: interleaveAcrossPatternSpecs(questions, plan, allocation), allocation, errors, warnings };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (isG3BU01MixedCalculationWordProblemPlan(plan)) return generateG3BU01MixedCalculationWordProblemQuestions(options);
  if (isG3BU01WordProblemPlan(plan)) return generateG3BU01WordProblemQuestions(options);
  const result = generateBaseG3AU06DivisionQuestions(options);
  if (!result.ok) return result;
  return { ...result, questions: interleaveAcrossPatternSpecs(result.questions, result.plan, result.allocation) };
}
