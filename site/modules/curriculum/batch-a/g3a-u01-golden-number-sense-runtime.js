import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS,
  generateG3AU01NumberStructureQuestion,
  validateG3AU01NumberStructureQuestion,
} from "./g3a-u01-number-structure-generator.js";

export * from "./g3a-u01-number-structure-generator.js";

export const G3A_U01_GOLDEN_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_GOLDEN_ADDITIONAL_PATTERN_IDS = Object.freeze({
  placeSequence: "ps_g3a_u01_place_sequence_step",
  betweenNumbers: "ps_g3a_u01_between_numbers_sequence",
  numberLineTextFallback: "ps_g3a_u01_number_line_text_fallback",
  moneyCountingTextFallback: "ps_g3a_u01_money_counting_text_fallback",
});

const comparisonPatternId = "ps_g3a_u01_4digit_compare";
const legacyPatternIds = Object.freeze([
  comparisonPatternId,
  ...Object.values(G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS),
]);
export const G3A_U01_GOLDEN_PATTERN_SPEC_IDS = Object.freeze([
  ...legacyPatternIds,
  ...Object.values(G3A_U01_GOLDEN_ADDITIONAL_PATTERN_IDS),
]);
const supported = new Set(G3A_U01_GOLDEN_PATTERN_SPEC_IDS);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "postg-a01")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function state(seed, index, channel) {
  return mix32((hashSeed(`${seed}:${channel}`) + Math.imul(Math.max(1, Number(index) || 1), 0x9e3779b1)) >>> 0);
}

function metadata(patternSpecId, skillTags) {
  return {
    patternId: patternSpecId,
    sourceId: G3A_U01_GOLDEN_SOURCE_ID,
    patternTags: ["batch_a", "post_golden", G3A_U01_GOLDEN_SOURCE_ID, patternSpecId],
    skillTags,
    difficultyTags: ["g3a_u01", patternSpecId.replace("ps_g3a_u01_", "")],
    curriculumNodeIds: [G3A_U01_GOLDEN_SOURCE_ID],
    canonicalSkillIds: [skillTags[0]],
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    sharedRuntimeBypass: false,
  };
}

function questionBase(patternSpecId, index, promptText, answerText, fields = {}) {
  return {
    id: `${patternSpecId}-${index}`,
    sourceId: G3A_U01_GOLDEN_SOURCE_ID,
    patternSpecId,
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    answerText,
    finalAnswer: fields.finalAnswer ?? answerText,
    answerModelShape: fields.answerModelShape ?? "numericAnswer",
    structuredAnswer: fields.structuredAnswer ?? { value: fields.finalAnswer ?? answerText },
    metadata: metadata(patternSpecId, fields.skillTags ?? ["number_sense"]),
    ...fields,
  };
}

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function generateComparison(patternSpecId, index, seed) {
  const left = 1000 + (state(seed, index, "compare-left") % 9000);
  let right = 1000 + (state(seed, index, "compare-right") % 9000);
  if (right === left) right = 1000 + ((right - 1000 + 457) % 9000);
  const answer = comparisonSymbol(left, right);
  return questionBase(
    patternSpecId,
    index,
    `在空格中填入 >、< 或 =：${left} ___ ${right}`,
    answer,
    {
      kind: "comparison",
      left,
      right,
      finalAnswer: answer,
      answerModelShape: "comparisonAnswer",
      structuredAnswer: { left, right, symbol: answer },
      skillTags: ["number_comparison", "four_digit"],
    },
  );
}

function generatePlaceSequence(patternSpecId, index, seed) {
  const steps = [10, 100, 1000];
  const step = steps[state(seed, index, "place-step") % steps.length];
  const maximumStart = 9999 - step * 4;
  const start = 1000 + (state(seed, index, "place-start") % Math.max(1, maximumStart - 999));
  const values = Array.from({ length: 5 }, (_, offset) => start + step * offset);
  const prompt = `${values[0]}、${values[1]}、${values[2]}、${values[3]}、____，依相同規律填數。`;
  return questionBase(patternSpecId, index, prompt, String(values[4]), {
    kind: "placeSequence",
    values,
    stepModel: { mode: "single", step },
    finalAnswer: values[4],
    answerModelShape: "sequenceAnswer",
    structuredAnswer: { values, missingIndex: 4, answer: values[4], stepModel: { mode: "single", step } },
    skillTags: ["number_sequence", "place_value_step"],
  });
}

function generateBetweenNumbers(patternSpecId, index, seed) {
  const steps = [1, 10, 100];
  const step = steps[state(seed, index, "between-step") % steps.length];
  const start = 1000 + (state(seed, index, "between-start") % (8999 - step * 4));
  const values = Array.from({ length: 5 }, (_, offset) => start + step * offset);
  const prompt = `${values[0]}、____、${values[2]}、____、${values[4]}，依相同規律填入兩個數。`;
  const answerText = `${values[1]}、${values[3]}`;
  return questionBase(patternSpecId, index, prompt, answerText, {
    kind: "betweenNumbersSequence",
    values,
    stepModel: { mode: "single", step },
    finalAnswer: [values[1], values[3]],
    answerModelShape: "sequenceAnswer",
    structuredAnswer: { values, missingIndexes: [1, 3], answers: [values[1], values[3]], stepModel: { mode: "single", step } },
    skillTags: ["number_sequence", "between_numbers"],
  });
}

function generateNumberLineTextFallback(patternSpecId, index, seed) {
  const interval = [10, 100, 1000][state(seed, index, "line-interval") % 3];
  const left = 1000 + (state(seed, index, "line-left") % Math.max(1, 8999 - interval * 6));
  const offset = 1 + (state(seed, index, "line-offset") % 5);
  const answer = left + interval * offset;
  const prompt = `一條數線從 ${left} 開始，每一小格增加 ${interval}。A 點在右邊第 ${offset} 小格，A 點表示多少？`;
  return questionBase(patternSpecId, index, prompt, String(answer), {
    kind: "numberLineTextFallback",
    left,
    interval,
    offset,
    finalAnswer: answer,
    answerModelShape: "numericAnswer",
    structuredAnswer: { expression: `${left}+${interval}×${offset}`, value: answer },
    visualDependency: false,
    textFallbackUsed: true,
    skillTags: ["number_line", "text_fallback"],
  });
}

function generateMoneyCountingTextFallback(patternSpecId, index, seed) {
  const counts = {
    thousands: 1 + (state(seed, index, "money-thousands") % 8),
    hundreds: state(seed, index, "money-hundreds") % 10,
    tens: state(seed, index, "money-tens") % 10,
    ones: state(seed, index, "money-ones") % 10,
  };
  const total = counts.thousands * 1000 + counts.hundreds * 100 + counts.tens * 10 + counts.ones;
  const prompt = `有 ${counts.thousands} 張1000元、${counts.hundreds} 張100元、${counts.tens} 個10元和 ${counts.ones} 個1元，共有多少元？`;
  return questionBase(patternSpecId, index, prompt, String(total), {
    kind: "moneyCountingTextFallback",
    counts,
    finalAnswer: total,
    answerModelShape: "moneyAmountAnswer",
    structuredAnswer: { expression: `${counts.thousands}×1000+${counts.hundreds}×100+${counts.tens}×10+${counts.ones}`, value: total, unit: "元" },
    visualDependency: false,
    textFallbackUsed: true,
    skillTags: ["money_representation", "money_counting"],
  });
}

export function generateG3AU01GoldenQuestion({ patternSpecId, index = 1, seed = "postg-a01" } = {}) {
  if (!supported.has(patternSpecId)) throw new Error("g3a_u01_golden_pattern_not_supported");
  if (patternSpecId === comparisonPatternId) return generateComparison(patternSpecId, index, seed);
  if (legacyPatternIds.includes(patternSpecId)) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, index, seed });
    return {
      ...question,
      answerModelShape: question.answerModelShape ?? (question.kind?.includes("money") ? "moneyAmountAnswer" : "numericAnswer"),
      structuredAnswer: question.structuredAnswer ?? { value: question.finalAnswer },
      metadata: { ...question.metadata, goldenContractId: "G5AU08_GOLDEN_V1", goldenContractVersion: "1.0.0", sharedRuntimeBypass: false },
    };
  }
  if (patternSpecId === G3A_U01_GOLDEN_ADDITIONAL_PATTERN_IDS.placeSequence) return generatePlaceSequence(patternSpecId, index, seed);
  if (patternSpecId === G3A_U01_GOLDEN_ADDITIONAL_PATTERN_IDS.betweenNumbers) return generateBetweenNumbers(patternSpecId, index, seed);
  if (patternSpecId === G3A_U01_GOLDEN_ADDITIONAL_PATTERN_IDS.numberLineTextFallback) return generateNumberLineTextFallback(patternSpecId, index, seed);
  return generateMoneyCountingTextFallback(patternSpecId, index, seed);
}

function validateSequence(question, errors) {
  const values = question.values;
  const step = question.stepModel?.step;
  if (!Array.isArray(values) || values.length !== 5 || !Number.isInteger(step) || step <= 0) {
    errors.push({ code: "g3a_u01_sequence_shape_invalid", path: "values" });
    return;
  }
  if (values.some((value, index) => index > 0 && value - values[index - 1] !== step)) {
    errors.push({ code: "g3a_u01_sequence_step_invalid", path: "stepModel" });
  }
  if (question.kind === "placeSequence" && Number(question.finalAnswer) !== values[4]) {
    errors.push({ code: "g3a_u01_sequence_answer_mismatch", path: "finalAnswer" });
  }
  if (question.kind === "betweenNumbersSequence" && JSON.stringify(question.finalAnswer) !== JSON.stringify([values[1], values[3]])) {
    errors.push({ code: "g3a_u01_between_numbers_answer_mismatch", path: "finalAnswer" });
  }
}

export function validateG3AU01GoldenQuestion(question) {
  const errors = [];
  if (question?.sourceId !== G3A_U01_GOLDEN_SOURCE_ID) errors.push({ code: "g3a_u01_source_invalid", path: "sourceId" });
  if (!supported.has(question?.patternSpecId)) errors.push({ code: "g3a_u01_golden_pattern_not_supported", path: "patternSpecId" });
  if (legacyPatternIds.includes(question?.patternSpecId) && question.patternSpecId !== comparisonPatternId) {
    errors.push(...validateG3AU01NumberStructureQuestion(question).errors);
  }
  if (question?.patternSpecId === comparisonPatternId && question.answerText !== comparisonSymbol(question.left, question.right)) {
    errors.push({ code: "g3a_u01_comparison_answer_mismatch", path: "answerText" });
  }
  if (["placeSequence", "betweenNumbersSequence"].includes(question?.kind)) validateSequence(question, errors);
  if (question?.kind === "numberLineTextFallback") {
    const expected = question.left + question.interval * question.offset;
    if (Number(question.finalAnswer) !== expected || question.visualDependency !== false || question.textFallbackUsed !== true) {
      errors.push({ code: "g3a_u01_number_line_text_fallback_invalid", path: "finalAnswer" });
    }
  }
  if (question?.kind === "moneyCountingTextFallback") {
    const c = question.counts ?? {};
    const expected = c.thousands * 1000 + c.hundreds * 100 + c.tens * 10 + c.ones;
    if (Number(question.finalAnswer) !== expected || question.visualDependency !== false || question.textFallbackUsed !== true) {
      errors.push({ code: "g3a_u01_money_counting_text_fallback_invalid", path: "finalAnswer" });
    }
  }
  if (!question?.promptText || String(question.promptText).includes("{")) errors.push({ code: "g3a_u01_prompt_invalid", path: "promptText" });
  if (!question?.answerText) errors.push({ code: "g3a_u01_answer_missing", path: "answerText" });
  return { ok: errors.length === 0, errors, warnings: [] };
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function shuffled(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const output = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:postg-a01-shuffle`);
  for (let index = output.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swap = seedValue % (index + 1);
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

export function isG3AU01GoldenPlan(plan = {}) {
  return plan.sourceId === G3A_U01_GOLDEN_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => supported.has(id));
}

export function generateG3AU01GoldenQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0
    ? clone(plan.allocation)
    : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!supported.has(entry.patternSpecId)) {
      errors.push({ code: "g3a_u01_golden_pattern_not_supported", severity: "error", path: entry.patternSpecId });
      continue;
    }
    for (let index = 0; index < entry.questionCount; index += 1) {
      const question = generateG3AU01GoldenQuestion({
        patternSpecId: entry.patternSpecId,
        index: questions.length + 1,
        seed: `${plan.generationSeed}:${entry.patternSpecId}`,
      });
      const validation = validateG3AU01GoldenQuestion(question);
      errors.push(...validation.errors.map((entryError) => ({ ...entryError, severity: "error" })));
      questions.push(question);
    }
  }
  return {
    ok: errors.length === 0 && questions.length === plan.questionCount,
    plan,
    questions: shuffled(questions, plan),
    allocation,
    errors,
    warnings: [],
  };
}
