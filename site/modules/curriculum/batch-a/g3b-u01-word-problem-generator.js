import { G3B_U01_WORD_PROBLEM_SOURCE_ID } from "./g3b-u01-word-problem-template-contract.js";
import { listG3BU01WordProblemTemplates, getG3BU01WordProblemTemplate } from "./g3b-u01-word-problem-template-registry.js";

function values(range) { const [a, b] = range; return Array.from({ length: b - a + 1 }, (_, i) => a + i); }
function pick(list, seed) { return list[Math.abs(seed) % list.length]; }
function exactPair(dividendRange, divisorRange, seed, remainder = false) {
  const pairs = [];
  for (const divisor of values(divisorRange)) for (const dividend of values(dividendRange)) if (divisor > 0 && (remainder ? dividend % divisor > 0 : dividend % divisor === 0)) pairs.push([dividend, divisor]);
  if (pairs.length === 0) throw new Error("g3b_u01_wp_no_numeric_pair");
  return pick(pairs, seed);
}
function fill(text, slots) { return text.replace(/\{([^}]+)\}/g, (_, key) => String(slots[key] ?? `{${key}}`)); }
function baseSlots(template) { return { ...template.unitModel, ...template.slotModel }; }
function fixed(value) { return Array.isArray(value) ? value : [value, value]; }

function slotsFor(template, seed) {
  const s = template.slotModel;
  const kind = template.operationModel.kind;
  const out = baseSlots(template);
  if (kind === "division") {
    const dividendKey = template.operationModel.dividendSlot;
    const divisorKey = template.operationModel.divisorSlot;
    const [dividend, divisor] = exactPair(fixed(s[dividendKey]), fixed(s[divisorKey]), seed, false);
    out[dividendKey] = dividend; out[divisorKey] = divisor; return out;
  }
  if (kind === "quotient_remainder") {
    if (s.days) { const days = pick(values(s.days).filter((n) => n % 7 > 0), seed); out.days = days; out.divisor = 7; return out; }
    const [total, groupSize] = exactPair(fixed(s.total), fixed(s.groupSize), seed, true);
    out.total = total; out.groupSize = groupSize; return out;
  }
  if (kind === "floor_division" || kind === "ceil_division") {
    const [total, groupSize] = exactPair(fixed(s.total), fixed(s.groupSize), seed, true);
    out.total = total; out.groupSize = groupSize; return out;
  }
  if (kind === "divide_then_add") {
    const unitLength = pick(values(s.unitLength), seed);
    const quotient = pick(values([10, 40]), seed + 1);
    out.length = unitLength * quotient; out.unitLength = unitLength; out.existingCount = pick(values(s.existingCount), seed + 2); return out;
  }
  if (kind === "add_then_divide") {
    for (const knownLength of values(s.knownLength)) for (const missingLength of values(s.missingLength)) if ((knownLength + missingLength) % 4 === 0) { out.knownLength = knownLength; out.missingLength = missingLength; return out; }
  }
  if (kind === "divide_then_subtract") {
    const peopleCount = pick(values(s.peopleCount), seed);
    const share = pick(values([20, 100]), seed + 1);
    out.peopleCount = peopleCount; out.totalCost = peopleCount * share; out.initialMoney = Math.max(share + 10, pick(values(s.initialMoney), seed + 2)); return out;
  }
  if (kind === "subtract_then_divide") {
    const itemCount = pick(values(s.itemCount), seed);
    const each = pick(values([20, 80]), seed + 1);
    out.leftoverVolume = pick(values(s.leftoverVolume), seed + 2); out.itemCount = itemCount; out.totalVolume = out.leftoverVolume + itemCount * each; return out;
  }
  throw new Error(`g3b_u01_wp_unsupported_kind:${kind}`);
}

function answerFor(template, slots) {
  const kind = template.operationModel.kind;
  if (kind === "division") return { value: slots[template.operationModel.dividendSlot] / slots[template.operationModel.divisorSlot], text: `${slots[template.operationModel.dividendSlot] / slots[template.operationModel.divisorSlot]}${slots.answerUnit}` };
  if (kind === "quotient_remainder") { const dividend = slots.days ?? slots.total; const divisor = slots.divisor ?? slots.groupSize ?? 7; const quotient = Math.floor(dividend / divisor); const remainder = dividend % divisor; return { quotient, remainder, text: `${quotient}${slots.quotientUnit}又${remainder}${slots.remainderUnit}` }; }
  if (kind === "floor_division") return { value: Math.floor(slots.total / slots.groupSize), text: `${Math.floor(slots.total / slots.groupSize)}${slots.answerUnit}` };
  if (kind === "ceil_division") return { value: Math.ceil(slots.total / slots.groupSize), text: `${Math.ceil(slots.total / slots.groupSize)}${slots.answerUnit}` };
  if (kind === "divide_then_add") return { value: slots.existingCount + slots.length / slots.unitLength, text: `${slots.existingCount + slots.length / slots.unitLength}${slots.answerUnit}` };
  if (kind === "add_then_divide") return { value: (slots.knownLength + slots.missingLength) / 4, text: `${(slots.knownLength + slots.missingLength) / 4}${slots.answerUnit}` };
  if (kind === "divide_then_subtract") return { value: slots.initialMoney - slots.totalCost / slots.peopleCount, text: `${slots.initialMoney - slots.totalCost / slots.peopleCount}${slots.answerUnit}` };
  if (kind === "subtract_then_divide") return { value: (slots.totalVolume - slots.leftoverVolume) / slots.itemCount, text: `${(slots.totalVolume - slots.leftoverVolume) / slots.itemCount}${slots.answerUnit}` };
  throw new Error(`g3b_u01_wp_unsupported_answer_kind:${kind}`);
}

export function generateG3BU01WordProblem(input = {}) {
  const templates = input.templateId ? [getG3BU01WordProblemTemplate(input.templateId)] : listG3BU01WordProblemTemplates({ patternSpecId: input.patternSpecId });
  const pool = templates.filter(Boolean);
  if (pool.length === 0) throw new Error("g3b_u01_wp_template_not_found");
  const template = pick(pool, input.seed ?? 0);
  const slotValues = slotsFor(template, input.seed ?? 0);
  const answer = answerFor(template, slotValues);
  return { sourceId: G3B_U01_WORD_PROBLEM_SOURCE_ID, templateId: template.templateId, patternSpecId: template.patternSpecId, semanticModel: template.semanticModel, questionText: fill(template.promptTemplate, slotValues), slotValues, answer, answerModel: template.answerModel, operationModel: template.operationModel };
}

export function validateG3BU01WordProblemQuestion(question) {
  const errors = [];
  if (!question?.questionText || question.questionText.includes("{")) errors.push({ code: "g3b_u01_wp_question_prompt_invalid", path: "questionText" });
  const expected = answerFor({ operationModel: question.operationModel }, question.slotValues ?? {});
  if (JSON.stringify(expected) !== JSON.stringify(question.answer)) errors.push({ code: "g3b_u01_wp_question_answer_mismatch", path: "answer" });
  return { ok: errors.length === 0, errors, warnings: [] };
}
