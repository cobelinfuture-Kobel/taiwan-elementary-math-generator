import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey } from "../../core/generate-expression.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";

const sourceId = "g3b_u01_3b01";
const specs = Object.freeze({
  three: "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
  two: "ps_g3b_u01_2digit_by_1digit_regroup_tens",
  twoLeadSmall: "ps_g3b_u01_2digit_leading_digit_insufficient",
  twoOnesZero: "ps_g3b_u01_2digit_ones_quotient_zero",
  twoLeadExact: "ps_g3b_u01_2digit_leading_digit_exact",
  threeHundSmall: "ps_g3b_u01_3digit_hundreds_insufficient",
  threeTensZero: "ps_g3b_u01_3digit_tens_quotient_zero",
  threeOnesZero: "ps_g3b_u01_3digit_ones_quotient_zero",
  threeHundExact: "ps_g3b_u01_3digit_hundreds_exact",
  rem2: "ps_g3b_u01_2digit_division_with_remainder",
  rem3: "ps_g3b_u01_3digit_division_with_remainder"
});
const allSpecIds = Object.freeze(Object.values(specs));

function hashSeed(value) { let acc = 0; for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0; return acc || 1; }
function cloneValue(value) { if (Array.isArray(value)) return value.map(cloneValue); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cloneValue(v)])); return value; }
function allocateCounts(patternSpecIds, questionCount) { const base = Math.floor(questionCount / patternSpecIds.length); let extra = questionCount % patternSpecIds.length; return patternSpecIds.map((patternSpecId) => { const count = base + (extra > 0 ? 1 : 0); extra -= extra > 0 ? 1 : 0; return { patternSpecId, questionCount: count }; }).filter((entry) => entry.questionCount > 0); }
function tens(n) { return Math.floor(n / 10) % 10; }
function hundreds(n) { return Math.floor(n / 100) % 10; }
function quotientTens(n) { return Math.floor(n / 10) % 10; }

export function canGenerateG3BU01BatchAQuestions(plan = {}) {
  return plan?.sourceId === sourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.every((id) => allSpecIds.includes(id));
}

function exactCandidates(min, max, predicate = () => true) {
  const out = [];
  for (let dividend = min; dividend <= max; dividend += 1) {
    for (let divisor = 2; divisor <= 9; divisor += 1) {
      if (dividend % divisor !== 0) continue;
      const model = { dividend, divisor, quotient: dividend / divisor };
      if (predicate(model)) out.push(model);
    }
  }
  return out;
}

function remainderCandidates(min, max) {
  const out = [];
  for (let dividend = min; dividend <= max; dividend += 1) {
    for (let divisor = 2; divisor <= 9; divisor += 1) {
      const remainder = dividend % divisor;
      const quotient = Math.floor(dividend / divisor);
      if (remainder > 0 && remainder < divisor && quotient > 0) out.push({ dividend, divisor, quotient, remainder });
    }
  }
  return out;
}

function exactPredicate(patternSpecId) {
  const predicates = {
    [specs.twoLeadSmall]: (m) => tens(m.dividend) < m.divisor,
    [specs.twoOnesZero]: (m) => m.quotient % 10 === 0,
    [specs.twoLeadExact]: (m) => tens(m.dividend) >= m.divisor && tens(m.dividend) % m.divisor === 0,
    [specs.threeHundSmall]: (m) => hundreds(m.dividend) < m.divisor,
    [specs.threeTensZero]: (m) => m.quotient >= 100 && quotientTens(m.quotient) === 0,
    [specs.threeOnesZero]: (m) => m.quotient >= 10 && m.quotient % 10 === 0,
    [specs.threeHundExact]: (m) => hundreds(m.dividend) >= m.divisor && hundreds(m.dividend) % m.divisor === 0
  };
  return predicates[patternSpecId] ?? (() => true);
}
function isThreeDigitSpec(patternSpecId) { return patternSpecId === specs.three || patternSpecId.startsWith("ps_g3b_u01_3digit"); }
function isRemainderSpec(patternSpecId) { return patternSpecId === specs.rem2 || patternSpecId === specs.rem3; }
function pick(candidates, patternSpecId, sequenceNumber, seed) { return candidates[hashSeed(`${seed}:${patternSpecId}:${sequenceNumber}`) % candidates.length] ?? null; }

function metadata(patternSpecId, canonicalSkillId, tags = []) {
  return { patternId: patternSpecId, sourceId, patternTags: ["batch_a", "browser_bridge", sourceId, patternSpecId], skillTags: [canonicalSkillId, ...tags], difficultyTags: ["batch_a_browser_bridge", patternSpecId.replace("ps_g3b_u01_", "")], curriculumNodeIds: [sourceId], canonicalSkillIds: [canonicalSkillId], precedenceMode: "left_to_right", parenthesesMode: "none" };
}
function expression(dividend, divisor) { return createBinaryNode(OPERATORS.DIVIDE, createValueNode(createIntegerValue(dividend), 1), createValueNode(createIntegerValue(divisor), 2), { groupingHint: "leftAssociative" }); }

function makeExactQuestion(patternSpecId, sequenceNumber, seed) {
  const range = isThreeDigitSpec(patternSpecId) ? [100, 999] : [10, 99];
  const model = pick(exactCandidates(range[0], range[1], exactPredicate(patternSpecId)), patternSpecId, sequenceNumber, seed);
  if (!model) return null;
  const expr = expression(model.dividend, model.divisor);
  const answerValue = createIntegerValue(model.quotient);
  const question = createGeneratedQuestionSkeleton({ id: `${patternSpecId}-${sequenceNumber}`, expression: expr, operandCount: 2, operatorsUsed: [OPERATORS.DIVIDE], finalAnswer: answerValue, intermediateResults: [answerValue], blankTarget: { type: "finalAnswer" }, duplicateKey: buildDuplicateKey(expr), metadata: metadata(patternSpecId, "integer_division_exact", [isThreeDigitSpec(patternSpecId) ? "three_digit" : "two_digit", "one_digit", "exact_division"]) });
  question.patternSpecId = patternSpecId;
  question.sourceId = sourceId;
  question.metadata = { ...question.metadata, sourceId };
  question.dividend = model.dividend;
  question.divisor = model.divisor;
  question.quotient = model.quotient;
  return question;
}
function makeRemainderQuestion(patternSpecId, sequenceNumber, seed) {
  const range = patternSpecId === specs.rem3 ? [100, 999] : [10, 99];
  const model = pick(remainderCandidates(range[0], range[1]), patternSpecId, sequenceNumber, seed);
  if (!model) return null;
  const answerText = `${model.quotient} 餘 ${model.remainder}`;
  return { id: `${patternSpecId}-${sequenceNumber}`, patternSpecId, sourceId, kind: "divisionWithRemainder", dividend: model.dividend, divisor: model.divisor, quotient: model.quotient, remainder: model.remainder, promptText: `${model.dividend} ÷ ${model.divisor} = ?`, displayText: `${model.dividend} ÷ ${model.divisor} = ${answerText}`, blankedDisplayText: `${model.dividend} ÷ ${model.divisor} = ___ 餘 ___`, answerText, finalAnswer: answerText, metadata: metadata(patternSpecId, "integer_division_remainder", ["division", "remainder"]) };
}
function makeQuestion(patternSpecId, sequenceNumber, seed) { return isRemainderSpec(patternSpecId) ? makeRemainderQuestion(patternSpecId, sequenceNumber, seed) : makeExactQuestion(patternSpecId, sequenceNumber, seed); }
function questionKey(question) { return question?.duplicateKey ?? question?.blankedDisplayText ?? `${question?.patternSpecId}:${question?.id}`; }

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU01BatchAQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "batch_a_g3b_u01_scope_mismatch", severity: "error", path: "patternSpecIds", message: "G3B-U01 generator scope mismatch" }], warnings: [] };
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const seen = new Set();
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    let accepted = 0;
    let attempts = 0;
    while (accepted < entry.questionCount && attempts < entry.questionCount * 160) {
      const question = makeQuestion(entry.patternSpecId, attempts + 1, plan.generationSeed ?? options.generationSeed);
      const key = questionKey(question);
      if (question && !seen.has(key)) { seen.add(key); questions.push(question); accepted += 1; }
      attempts += 1;
    }
    if (accepted < entry.questionCount) errors.push({ code: "batch_a_g3b_u01_unique_pool_exhausted", severity: "error", path: entry.patternSpecId, message: "G3B-U01 unique division question pool exhausted" });
  }
  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings: [] };
}
