import { generateBatchABrowserQuestions as generateBaseG3AU06DivisionQuestions } from "./g3a-u06-division-generator.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateG3BU01WordProblem } from "./g3b-u01-word-problem-generator.js";
import { generateG3AU01NumberStructureQuestion } from "./g3a-u01-number-structure-generator.js";

const g3aU01SourceId = "g3a_u01_3a01";
const g3aU01ComparisonSpecId = "ps_g3a_u01_4digit_compare";
const sourceIds = Object.freeze([g3aU01SourceId, "g3a_u06_3a06", "g3b_u01_3b01"]);
const g3bU01SourceId = "g3b_u01_3b01";
const g3aU01NumberStructureSpecIds = Object.freeze([
  "ps_g3a_u01_4digit_number_to_chinese_basic",
  "ps_g3a_u01_4digit_number_to_chinese_with_zero",
  "ps_g3a_u01_chinese_to_4digit_number_basic",
  "ps_g3a_u01_chinese_to_4digit_number_with_zero",
  "ps_g3a_u01_4digit_place_value_full_decomposition",
  "ps_g3a_u01_4digit_digit_value_identification",
  "ps_g3a_u01_4digit_same_digit_different_place",
  "ps_g3a_u01_place_value_standard_composition",
  "ps_g3a_u01_place_value_nonstandard_composition",
  "ps_g3a_u01_place_value_partial_composition",
  "ps_g3a_u01_tens_to_hundreds_conversion",
  "ps_g3a_u01_hundreds_to_thousands_conversion",
  "ps_g3a_u01_money_place_value_exchange",
  "ps_g3a_u01_digit_arrangement_max_4digit",
  "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero",
  "ps_g3a_u01_digit_arrangement_max_min_pair",
  "ps_g3a_u01_4digit_range_compare_reasoning",
  "ps_g3a_u01_4digit_serial_number_range",
  "ps_g3a_u01_4digit_price_range_reasoning"
]);
const g3aU01SupportedSpecIds = Object.freeze([g3aU01ComparisonSpecId, ...g3aU01NumberStructureSpecIds]);
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

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function sequenceSeed(seed, sequenceNumber, channel) {
  return mix32((hashSeed(`${seed}:${channel}`) + Math.imul(Math.max(1, Number(sequenceNumber) || 1), 0x9e3779b1)) >>> 0);
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
  for (const question of questions) {
    if (!buckets.has(question.patternSpecId)) buckets.set(question.patternSpecId, []);
    buckets.get(question.patternSpecId).push(question);
  }
  for (const [patternSpecId, bucket] of buckets.entries()) buckets.set(patternSpecId, sortBucket(bucket, plan));
  const knownOrder = allocation
    .map((entry, index) => ({ patternSpecId: entry.patternSpecId, index, key: hashSeed(`${plan.generationSeed}:${entry.patternSpecId}:${index}`) }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.patternSpecId);
  const patternOrder = [...knownOrder, ...[...buckets.keys()].filter((patternSpecId) => !knownOrder.includes(patternSpecId)).sort()];
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

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const questionCountForPattern = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: questionCountForPattern };
  }).filter((entry) => entry.questionCount > 0);
}

function g3bU01WordProblemFamily(patternSpecId) {
  if (patternSpecId.includes("_wp_partitive_")) return "partitive";
  if (patternSpecId.includes("_wp_quotative_")) return "quotative";
  if (patternSpecId.includes("_wp_remainder_floor_") || patternSpecId.includes("_wp_remainder_ceil_")) return "remainder_interpretation";
  if (patternSpecId.includes("_wp_remainder_")) return "remainder";
  if (patternSpecId.includes("_wp_two_step_")) return "two_step";
  return null;
}

function expandG3BU01SourceUnitWordProblemAllocation(plan, options = {}) {
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : [];
  if (options.publicSelectionMode !== "sourceUnit") return allocation;

  const wordProblemEntries = allocation.filter((entry) => g3bU01WordProblemSpecIds.includes(entry.patternSpecId));
  if (wordProblemEntries.length === 0 || wordProblemEntries.length === g3bU01WordProblemSpecIds.length) return allocation;

  const wordProblemQuestionCount = wordProblemEntries.reduce((sum, entry) => sum + entry.questionCount, 0);
  const groupIdByFamily = new Map(wordProblemEntries.map((entry) => [g3bU01WordProblemFamily(entry.patternSpecId), entry.patternGroupId]));
  const expandedWordProblemEntries = allocateCounts(g3bU01WordProblemSpecIds, wordProblemQuestionCount).map((entry) => ({
    ...entry,
    patternGroupId: groupIdByFamily.get(g3bU01WordProblemFamily(entry.patternSpecId)) ?? null
  }));

  const expanded = [];
  let inserted = false;
  for (const entry of allocation) {
    if (!g3bU01WordProblemSpecIds.includes(entry.patternSpecId)) {
      expanded.push(entry);
      continue;
    }
    if (!inserted) {
      expanded.push(...expandedWordProblemEntries);
      inserted = true;
    }
  }
  return expanded;
}

function isG3AU01Plan(plan) {
  return plan?.sourceId === g3aU01SourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => g3aU01SupportedSpecIds.includes(id));
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

function makeG3AU01Metadata(patternSpecId, canonicalSkillId = "integer_comparison", extraSkillTags = []) {
  return {
    patternId: patternSpecId,
    sourceId: g3aU01SourceId,
    patternTags: ["batch_a", "browser_bridge", g3aU01SourceId, patternSpecId],
    skillTags: [canonicalSkillId, ...extraSkillTags],
    difficultyTags: ["batch_a_browser_bridge", "g3a_u01"],
    curriculumNodeIds: [g3aU01SourceId],
    canonicalSkillIds: [canonicalSkillId]
  };
}

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function comparisonNumber(sequenceNumber, seed, side) {
  return 1000 + (sequenceSeed(seed, sequenceNumber, `${g3aU01ComparisonSpecId}:${side}`) % 9000);
}

function makeG3AU01ComparisonQuestion(sequenceNumber, seed) {
  const left = comparisonNumber(sequenceNumber, seed, "left");
  let right = comparisonNumber(sequenceNumber, seed, "right");
  if (right === left) right = 1000 + ((right - 1000 + 457) % 9000);
  const answerText = comparisonSymbol(left, right);
  const promptText = `在 ___ 中填入 >、< 或 =，比較 ${left} 和 ${right} 的大小。`;
  return {
    id: `${g3aU01ComparisonSpecId}-${sequenceNumber}`,
    patternSpecId: g3aU01ComparisonSpecId,
    sourceId: g3aU01SourceId,
    kind: "comparison",
    left,
    right,
    promptText,
    displayText: `${promptText}\n${left} ${answerText} ${right}`,
    blankedDisplayText: `${promptText}\n${left} ___ ${right}`,
    answerText,
    finalAnswer: answerText,
    metadata: makeG3AU01Metadata(g3aU01ComparisonSpecId, "integer_comparison", ["four_digit", "comparison"])
  };
}

function makeG3BU01Metadata(patternSpecId, semanticModel) {
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
    metadata: makeG3BU01Metadata(patternSpecId, question.semanticModel)
  };
}

function generateG3AU01Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!g3aU01SupportedSpecIds.includes(entry.patternSpecId)) {
      errors.push({ code: "batch_a_g3a_u01_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G3A-U01 PatternSpec" });
      continue;
    }
    for (let index = 0; index < entry.questionCount; index += 1) {
      if (entry.patternSpecId === g3aU01ComparisonSpecId) {
        questions.push(makeG3AU01ComparisonQuestion(questions.length + 1, plan.generationSeed));
      } else {
        questions.push(generateG3AU01NumberStructureQuestion({ patternSpecId: entry.patternSpecId, index: questions.length + 1, seed: `${plan.generationSeed}:${entry.patternSpecId}` }));
      }
    }
  }
  return { ok: errors.length === 0, plan, questions: interleaveAcrossPatternSpecs(questions, plan, allocation), allocation, errors, warnings: [] };
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
  return {
    ...result,
    allocation: result.allocation.map((item) => ({ ...item, patternGroupId: entry.patternGroupId })),
    questions: result.questions.map((question, index) => ({ ...question, id: `${question.id}-mixed-${index + 1}` }))
  };
}

function generateG3BU01MixedCalculationWordProblemQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const sourceAllocation = expandG3BU01SourceUnitWordProblemAllocation(plan, options);
  const outputAllocation = [];
  const questions = [];
  const errors = [];
  const warnings = [];

  for (const entry of sourceAllocation) {
    if (g3bU01WordProblemSpecIds.includes(entry.patternSpecId)) {
      outputAllocation.push(entry);
      for (let index = 0; index < entry.questionCount; index += 1) questions.push(makeWordProblemQuestion(entry.patternSpecId, questions.length + 1, plan.generationSeed));
      continue;
    }
    if (g3bU01CalculationSpecIds.includes(entry.patternSpecId)) {
      const result = generateCalculationEntryQuestions(options, plan, entry);
      if (!result.ok) {
        errors.push(...(result.errors ?? []));
        warnings.push(...(result.warnings ?? []));
      } else {
        outputAllocation.push(...result.allocation);
        questions.push(...result.questions);
        warnings.push(...(result.warnings ?? []));
      }
      continue;
    }
    errors.push({ code: "batch_a_g3b_u01_mixed_pattern_not_supported", severity: "error", path: entry.patternSpecId, message: "Unsupported G3B-U01 mixed PatternSpec" });
  }

  return { ok: errors.length === 0, plan, questions: interleaveAcrossPatternSpecs(questions, plan, outputAllocation), allocation: outputAllocation, errors, warnings };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (isG3AU01Plan(plan)) return generateG3AU01Questions(options);
  if (isG3BU01MixedCalculationWordProblemPlan(plan)) return generateG3BU01MixedCalculationWordProblemQuestions(options);
  if (isG3BU01WordProblemPlan(plan)) return generateG3BU01WordProblemQuestions(options);
  const result = generateBaseG3AU06DivisionQuestions(options);
  if (!result.ok) return result;
  return { ...result, questions: interleaveAcrossPatternSpecs(result.questions, result.plan, result.allocation) };
}
