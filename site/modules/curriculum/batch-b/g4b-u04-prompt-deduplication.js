import {
  G4B_U04_INVERSE_DIGIT_SET_CASES,
  G4B_U04_INVERSE_ORIGINAL_VALUE_CASES,
  materializeG4BU04InverseUniqueCase,
} from "./g4b-u04-inverse-unique-case-pool.js";

export const G4B_U04_PROMPT_DEDUPLICATION_VERSION = "g4b-u04-prompt-signature-v2";
export const G4B_U04_PROMPT_DEDUPLICATION_MAX_RETRIES = 128;

const UNBOUNDED = Number.POSITIVE_INFINITY;

export const G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC = Object.freeze({
  ps_g4b_u04_approx_symbol_reading: 1,
  ps_g4b_u04_inverse_digit_set: G4B_U04_INVERSE_DIGIT_SET_CASES.length,
  ps_g4b_u04_inverse_original_values: G4B_U04_INVERSE_ORIGINAL_VALUE_CASES.length,
});

export const G4B_U04_PROMPT_DEDUPLICATION_CONTRACT = Object.freeze({
  task: "G4B_U04_R2B_WorksheetPromptDeduplication",
  version: G4B_U04_PROMPT_DEDUPLICATION_VERSION,
  allocationStrategy: "capacity_aware_round_robin",
  promptScope: "whole_worksheet",
  exactDuplicateAllowed: false,
  genericFallbackAllowed: false,
  maximumRetriesPerQuestion: G4B_U04_PROMPT_DEDUPLICATION_MAX_RETRIES,
  fixedCapacities: G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC,
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "g4b-u04-r2b")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function deterministicShuffle(values, seed) {
  const output = [...values];
  let state = hashSeed(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    state = mix32(state + Math.imul(index + 1, 0x9e3779b1));
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function normalizeAsciiPunctuation(value) {
  return value
    .replace(/,/gu, (mark, offset, source) => {
      const previous = source[offset - 1] ?? "";
      const next = source[offset + 1] ?? "";
      return /\d/u.test(previous) && /\d/u.test(next) ? mark : "，";
    })
    .replace(/;/gu, "；")
    .replace(/:/gu, "：")
    .replace(/\?/gu, "？")
    .replace(/!/gu, "！");
}

export function normalizeG4BU04PromptSignature(value) {
  return normalizeAsciiPunctuation(String(value ?? "").normalize("NFKC"))
    .trim()
    .replace(/\s+/gu, " ")
    .replace(/\s+([，。！？；：、])/gu, "$1")
    .replace(/([，。！？；：、])\s+/gu, "$1")
    .replace(/([（「『])\s+/gu, "$1")
    .replace(/\s+([）」』])/gu, "$1");
}

export function getG4BU04UniquePromptCapacity(patternSpecId) {
  return G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC[patternSpecId] ?? UNBOUNDED;
}

export function allocateG4BU04UniquePromptCapacity(questionCount, patternSpecIds = []) {
  const ids = [...new Set(patternSpecIds)];
  const patternAllocation = Object.fromEntries(ids.map((id) => [id, 0]));
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || ids.length === 0) {
    return Object.freeze({
      ok: false,
      patternAllocation: Object.freeze(patternAllocation),
      allocatedQuestionCount: 0,
      requestedQuestionCount: questionCount,
      exhaustedPatternSpecIds: Object.freeze([]),
      errors: Object.freeze([{
        code: "G4B_U04_CANONICAL_UNIQUE_CAPACITY_INVALID_REQUEST",
        severity: "error",
        path: "questionCount",
        message: "唯一題面配置需要正整數題數與至少一個 PatternSpec。",
      }]),
    });
  }

  let allocatedQuestionCount = 0;
  let cursor = 0;
  let consecutiveSkips = 0;
  while (allocatedQuestionCount < questionCount && consecutiveSkips < ids.length) {
    const patternSpecId = ids[cursor % ids.length];
    const capacity = getG4BU04UniquePromptCapacity(patternSpecId);
    if (patternAllocation[patternSpecId] < capacity) {
      patternAllocation[patternSpecId] += 1;
      allocatedQuestionCount += 1;
      consecutiveSkips = 0;
    } else {
      consecutiveSkips += 1;
    }
    cursor += 1;
  }

  const exhaustedPatternSpecIds = ids.filter((id) => patternAllocation[id] >= getG4BU04UniquePromptCapacity(id));
  const errors = allocatedQuestionCount === questionCount
    ? []
    : [{
      code: "G4B_U04_CANONICAL_UNIQUE_CAPACITY_EXCEEDED",
      severity: "error",
      path: "questionCount",
      message: "所選題型的唯一題面容量不足，無法產生指定題數。",
      requestedQuestionCount: questionCount,
      allocatedQuestionCount,
      exhaustedPatternSpecIds,
    }];

  return Object.freeze({
    ok: errors.length === 0,
    patternAllocation: Object.freeze({ ...patternAllocation }),
    allocatedQuestionCount,
    requestedQuestionCount: questionCount,
    exhaustedPatternSpecIds: Object.freeze(exhaustedPatternSpecIds),
    errors: Object.freeze(errors),
  });
}

export function generateUniqueG4BU04QuestionSet({
  patternSpecIds = [],
  patternAllocation = {},
  seed = "g4b-u04-r2b",
  ordering = "groupedByPattern",
  generateQuestion,
  validateQuestion,
  maxRetriesPerQuestion = G4B_U04_PROMPT_DEDUPLICATION_MAX_RETRIES,
} = {}) {
  if (typeof generateQuestion !== "function" || typeof validateQuestion !== "function") {
    return Object.freeze({
      ok: false,
      questions: Object.freeze([]),
      errors: Object.freeze([{
        code: "G4B_U04_CANONICAL_DEDUP_GENERATOR_CONTRACT_INVALID",
        severity: "error",
        path: "deduplication",
        message: "唯一題面生成器缺少 generator 或 validator callback。",
      }]),
      warnings: Object.freeze([]),
      report: Object.freeze({
        version: G4B_U04_PROMPT_DEDUPLICATION_VERSION,
        totalAttempts: 0,
        duplicateRejectCount: 0,
        constraintRejectCount: 0,
        generatedQuestionCount: 0,
        signatureCount: 0,
      }),
    });
  }

  const signatures = new Set();
  const questions = [];
  const errors = [];
  let totalAttempts = 0;
  let duplicateRejectCount = 0;
  let constraintRejectCount = 0;

  for (const patternSpecId of patternSpecIds) {
    const requested = patternAllocation[patternSpecId] ?? 0;
    for (let occurrence = 0; occurrence < requested; occurrence += 1) {
      let accepted = null;
      let lastConstraintErrors = [];
      for (let attempt = 0; attempt <= maxRetriesPerQuestion; attempt += 1) {
        const sequence = occurrence + Math.imul(attempt, 1009);
        totalAttempts += 1;
        let candidate;
        try {
          candidate = generateQuestion({ patternSpecId, seed, sequence });
          candidate = materializeG4BU04InverseUniqueCase(candidate, {
            seed: `${seed}:${patternSpecId}`,
            occurrence,
            attempt,
          });
        } catch (error) {
          constraintRejectCount += 1;
          lastConstraintErrors = [{
            code: "G4B_U04_CANONICAL_DEDUP_GENERATION_EXCEPTION",
            severity: "error",
            path: `patternAllocation.${patternSpecId}`,
            message: String(error?.message ?? error),
          }];
          continue;
        }
        const validation = validateQuestion(candidate);
        if (validation?.ok !== true) {
          constraintRejectCount += 1;
          lastConstraintErrors = cloneValue(validation?.errors ?? []);
          continue;
        }
        const signature = normalizeG4BU04PromptSignature(candidate.promptText);
        if (!signature || signatures.has(signature)) {
          duplicateRejectCount += 1;
          continue;
        }
        signatures.add(signature);
        accepted = candidate;
        break;
      }
      if (!accepted) {
        errors.push({
          code: "G4B_U04_CANONICAL_PROMPT_RETRY_EXHAUSTED",
          severity: "error",
          path: `patternAllocation.${patternSpecId}`,
          message: "在有限重抽次數內無法產生新的唯一題面。",
          patternSpecId,
          occurrence,
          maxRetriesPerQuestion,
          lastConstraintErrors,
        });
        break;
      }
      questions.push(accepted);
    }
    if (errors.length > 0) break;
  }

  const orderedQuestions = ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, `${seed}:g4b-u04-r2b:${questions.length}`)
    : questions;

  return Object.freeze({
    ok: errors.length === 0,
    questions: errors.length === 0 ? Object.freeze([...orderedQuestions]) : Object.freeze([]),
    errors: Object.freeze(errors.map((entry) => Object.freeze(entry))),
    warnings: Object.freeze([]),
    report: Object.freeze({
      version: G4B_U04_PROMPT_DEDUPLICATION_VERSION,
      allocationStrategy: "capacity_aware_round_robin",
      totalAttempts,
      duplicateRejectCount,
      constraintRejectCount,
      generatedQuestionCount: errors.length === 0 ? orderedQuestions.length : 0,
      signatureCount: errors.length === 0 ? signatures.size : 0,
      maxRetriesPerQuestion,
    }),
  });
}
