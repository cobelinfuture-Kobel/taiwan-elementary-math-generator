import { G4A_U01_SOURCE_ID } from "./g4a-u01-phase1-generator.js";

export const G4A_U01_FIRST_DIFFERENCE_FULLFIX_VERSION = "glm-s05-g4a-u01-first-difference-v1";

const FIRST_DIFFERENCE_PATTERN_SPEC_ID = "ps_g4a_u01_compare_first_different_place";
const PLACE_LABELS = Object.freeze(["千萬", "百萬", "十萬", "萬", "千", "百", "十", "一"]);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "g4a-u01-first-difference")) {
    acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  }
  return acc || 1;
}

function paddedDigits(value) {
  if (!Number.isSafeInteger(value) || value < 10_000_000 || value > 99_999_999) return null;
  return String(value).padStart(8, "0").split("").map(Number);
}

function firstDifferentIndex(left, right) {
  const leftDigits = paddedDigits(left);
  const rightDigits = paddedDigits(right);
  if (!leftDigits || !rightDigits) return -1;
  return leftDigits.findIndex((digit, index) => digit !== rightDigits[index]);
}

function repairedRightValue(left, question, plan, sequence) {
  const digits = paddedDigits(left);
  if (!digits) return null;
  const seed = hashSeed(`${plan?.generationSeed}:${question?.id}:${sequence}`);
  const index = seed % 7;
  let replacement = (digits[index] + 1 + ((seed >>> 4) % 8)) % 10;
  if (replacement === digits[index]) replacement = (replacement + 1) % 10;
  if (index === 0 && replacement === 0) replacement = 9;
  const rightDigits = [...digits];
  rightDigits[index] = replacement;
  return Number(rightDigits.join(""));
}

function normalizeQuestion(question, plan, sequence) {
  if (question?.patternSpecId !== FIRST_DIFFERENCE_PATTERN_SPEC_ID) return question;
  let left = Number(question.left);
  let right = Number(question.right);
  let index = firstDifferentIndex(left, right);

  if (index < 0) {
    right = repairedRightValue(left, question, plan, sequence);
    index = firstDifferentIndex(left, right);
  }
  if (index < 0 || !PLACE_LABELS[index]) return question;

  const placeLabel = PLACE_LABELS[index];
  const prompt = `比較 ${left.toLocaleString("en-US")} 和 ${right.toLocaleString("en-US")}，從左邊起第一個不同的數字在什麼位？`;
  return {
    ...clone(question),
    left,
    right,
    firstDifferentIndex: index,
    placeLabel,
    promptText: prompt,
    displayText: prompt,
    blankedDisplayText: prompt,
    answerText: placeLabel,
    finalAnswer: placeLabel,
    metadata: {
      ...(clone(question.metadata) ?? {}),
      g4aU01FirstDifferenceFullFixVersion: G4A_U01_FIRST_DIFFERENCE_FULLFIX_VERSION,
    },
  };
}

export function applyG4AU01FirstDifferenceFullFix(result, plan = {}) {
  if (result?.ok !== true || plan?.sourceId !== G4A_U01_SOURCE_ID) return result;
  const questions = (result.questions ?? []).map((question, index) => (
    normalizeQuestion(question, plan, index + 1)
  ));
  return {
    ...result,
    questions,
    fullFix: {
      ...(result.fullFix ?? {}),
      g4aU01FirstDifferenceVersion: G4A_U01_FIRST_DIFFERENCE_FULLFIX_VERSION,
      normalizedQuestionCount: questions.filter((question) => (
        question.patternSpecId === FIRST_DIFFERENCE_PATTERN_SPEC_ID
      )).length,
    },
  };
}

export function validateG4AU01FirstDifferenceFullFixQuestion(question) {
  if (question?.patternSpecId !== FIRST_DIFFERENCE_PATTERN_SPEC_ID) return { ok: true, errors: [] };
  const index = firstDifferentIndex(question.left, question.right);
  const errors = [];
  if (index < 0) errors.push("first_difference_missing");
  if (question.firstDifferentIndex !== index) errors.push("first_difference_index_mismatch");
  if (question.placeLabel !== PLACE_LABELS[index]) errors.push("place_label_mismatch");
  if (question.answerText !== PLACE_LABELS[index]) errors.push("answer_text_mismatch");
  if (question.finalAnswer !== PLACE_LABELS[index]) errors.push("final_answer_mismatch");
  return { ok: errors.length === 0, errors };
}
