import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_IDS,
  getBatchABrowserPatternDefinition,
  getP01D3PatternSpecIdsForSource,
} from "./source-pattern-full-product-p01d3-extension.js";
import { leastCommonMultiple } from "./number-theory-runtime.js";

const SPEC_SET = new Set(G5A_U03_PATTERN_SPEC_IDS);
const BASES = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
const PRODUCT_PAIRS = Object.freeze([[2,6],[3,8],[4,9],[5,7],[6,8],[7,9],[8,12],[9,11],[10,12],[12,15]]);
const LCM_PAIRS = Object.freeze([[2,3],[3,4],[4,6],[5,6],[6,8],[8,12],[9,12],[10,15],[12,18],[14,21],[15,20]]);
const DIVISORS = Object.freeze([2, 3, 5, 10]);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "p01d3")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
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
function pick(values, seed, index, channel) { return values[state(seed, index, channel) % values.length]; }
function uniqueSorted(values) { return [...new Set(values)].sort((a, b) => a - b); }
function listText(values) { return values.join("、"); }

export function divisorsOf(value) {
  if (!Number.isSafeInteger(value) || value < 1) return [];
  const values = [];
  for (let divisor = 1; divisor * divisor <= value; divisor += 1) {
    if (value % divisor !== 0) continue;
    values.push(divisor);
    if (divisor * divisor !== value) values.push(value / divisor);
  }
  return values.sort((a, b) => a - b);
}

export function multiplesInInterval(base, start, end) {
  if (!Number.isSafeInteger(base) || base <= 0 || start > end) return [];
  const output = [];
  for (let value = Math.ceil(start / base) * base; value <= end; value += base) output.push(value);
  return output;
}

export function divisibilitySet23510(value) { return DIVISORS.filter((divisor) => value % divisor === 0); }
export function classifyRelativeToBase(base, candidate) {
  const factor = base % candidate === 0;
  const multiple = candidate % base === 0;
  if (factor && multiple) return "兩者都是";
  if (factor) return "因數";
  if (multiple) return "倍數";
  return "兩者皆非";
}

function metadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["full_product_w1", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
  };
}

function question(definition, index, promptText, answer, fields = {}) {
  const answerText = String(answer);
  return {
    id: `${definition.patternSpecId}-${index}`,
    sourceId: definition.sourceId,
    patternSpecId: definition.patternSpecId,
    kind: "g5aU03FactorMultiple",
    operation: definition.operation,
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(definition),
    ...fields,
  };
}

function missingDigits(prefix, suffix, divisor) {
  return Array.from({ length: 10 }, (_, digit) => digit)
    .filter((digit) => (prefix * 100 + digit * 10 + suffix) % divisor === 0);
}
function nearestMultiples(base, target) {
  const lower = Math.floor(target / base) * base;
  const upper = Math.ceil(target / base) * base;
  const dl = target - lower;
  const du = upper - target;
  return dl < du ? [lower] : du < dl ? [upper] : uniqueSorted([lower, upper]);
}
function relationText(left, right, product) {
  return `${left}、${right} 是 ${product} 的因數；${product} 是 ${left}、${right} 的倍數`;
}
function partition(base, candidates) {
  const rows = { factors: [], multiples: [], both: [], neither: [] };
  for (const candidate of candidates) {
    const role = classifyRelativeToBase(base, candidate);
    if (role === "因數") rows.factors.push(candidate);
    else if (role === "倍數") rows.multiples.push(candidate);
    else if (role === "兩者都是") rows.both.push(candidate);
    else rows.neither.push(candidate);
  }
  return rows;
}
function partitionText(rows) {
  return `因數：${listText(rows.factors)}；倍數：${listText(rows.multiples)}；兩者：${listText(rows.both)}；皆非：${listText(rows.neither)}`;
}
function permutations(values) {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map((tail) => [value, ...tail]));
}
function constructNumbers(digits, divisor) {
  return uniqueSorted(permutations(digits)
    .filter((row) => row[0] !== 0)
    .map((row) => Number(row.join("")))
    .filter((value) => value % divisor === 0));
}
function lcmData(seed, index, channel) {
  const [left, right] = pick(LCM_PAIRS, seed, index, channel);
  return { left, right, lcm: leastCommonMultiple(left, right) };
}

function generate(definition, index, seed) {
  const op = definition.operation;
  if (["relation_from_product", "complete_factor_multiple_statement"].includes(op)) {
    const [left, right] = pick(PRODUCT_PAIRS, seed, index, op);
    const product = left * right;
    const answer = relationText(left, right, product);
    return question(definition, index, `根據 ${left} × ${right} = ${product}，寫出因數與倍數關係。`, answer, { left, right, product });
  }
  if (op === "divisibility_classification_23510") {
    const value = (20 + state(seed, index, op) % 480) * pick([2,3,5,6,10,15], seed, index, `${op}:m`);
    const divisors = divisibilitySet23510(value);
    return question(definition, index, `在 2、3、5、10 中，哪些數可以整除 ${value}？`, listText(divisors), { value, divisors });
  }
  if (["missing_digit_divisibility", "possible_digits_for_divisibility"].includes(op)) {
    const divisor = pick(DIVISORS, seed, index, `${op}:d`);
    const prefix = 1 + state(seed, index, `${op}:p`) % 8;
    const suffix = state(seed, index, `${op}:s`) % 10;
    const digits = missingDigits(prefix, suffix, divisor);
    const template = `${prefix}□${suffix}`;
    return question(definition, index, `三位數 ${template} 要是 ${divisor} 的倍數，□ 可以填哪些數字？`, listText(digits), { divisor, prefix, suffix, template, digits });
  }
  if (op === "exact_grouping_yes_no") {
    const total = 24 + state(seed, index, `${op}:t`) % 160;
    const groupSize = pick([3,4,5,6,7,8,9,10,12], seed, index, `${op}:g`);
    const exact = total % groupSize === 0;
    return question(definition, index, `${total} 個物品，每 ${groupSize} 個一組，能不能剛好分完？`, exact ? "可以" : "不可以", { total, groupSize, exact });
  }
  if (op === "exact_grouping_candidate_sizes") {
    const total = 24 + state(seed, index, `${op}:t`) % 160;
    const candidates = [2,3,4,5,6,8,10,12].filter((value) => value <= total);
    const validGroupSizes = candidates.filter((value) => total % value === 0);
    return question(definition, index, `${total} 個物品，可選每組 ${listText(candidates)} 個，哪些方案能剛好分完？`, listText(validGroupSizes), { total, candidates, validGroupSizes });
  }
  if (["enumerate_first_multiples", "enumerate_multiples_after"].includes(op)) {
    const base = pick(BASES, seed, index, `${op}:b`);
    if (op === "enumerate_first_multiples") {
      const count = 5 + state(seed, index, `${op}:c`) % 3;
      const multiples = Array.from({ length: count }, (_, i) => base * (i + 1));
      return question(definition, index, `列出 ${base} 的前 ${count} 個正倍數。`, listText(multiples), { base, count, multiples });
    }
    const startIndex = 2 + state(seed, index, `${op}:i`) % 6;
    const count = 4;
    const afterValue = base * startIndex;
    const multiples = Array.from({ length: count }, (_, i) => base * (startIndex + i + 1));
    return question(definition, index, `${afterValue} 是 ${base} 的倍數，接著列出後面 ${count} 個倍數。`, listText(multiples), { base, startIndex, count, afterValue, multiples });
  }
  if (["list_multiples_in_interval", "nearest_multiple"].includes(op)) {
    const base = pick(BASES.filter((value) => value >= 3), seed, index, `${op}:b`);
    if (op === "nearest_multiple") {
      const target = 20 + state(seed, index, `${op}:t`) % 180;
      const nearest = nearestMultiples(base, target);
      return question(definition, index, `最接近 ${target} 的 ${base} 的倍數是多少？`, listText(nearest), { base, target, nearest });
    }
    const start = 5 + state(seed, index, `${op}:s`) % 40;
    const end = start + 30 + state(seed, index, `${op}:w`) % 35;
    const multiples = multiplesInInterval(base, start, end);
    return question(definition, index, `列出 ${start} 到 ${end} 之間所有 ${base} 的倍數。`, listText(multiples), { base, start, end, multiples });
  }
  if (["count_multiples_in_interval", "nth_multiple"].includes(op)) {
    const base = pick(BASES, seed, index, `${op}:b`);
    if (op === "nth_multiple") {
      const ordinal = 4 + state(seed, index, `${op}:n`) % 16;
      return question(definition, index, `${base} 的第 ${ordinal} 個正倍數是多少？`, base * ordinal, { base, ordinal });
    }
    const start = 1 + state(seed, index, `${op}:s`) % 50;
    const end = start + 40 + state(seed, index, `${op}:w`) % 50;
    const multiples = multiplesInInterval(base, start, end);
    return question(definition, index, `${start} 到 ${end} 之間共有幾個 ${base} 的倍數？`, multiples.length, { base, start, end, multiples });
  }
  if (["classify_divisor_multiple", "partition_candidate_set"].includes(op)) {
    const base = pick([6,8,10,12,15,18,20,24,30,36], seed, index, `${op}:b`);
    if (op === "classify_divisor_multiple") {
      const candidate = pick(uniqueSorted([...divisorsOf(base), base * 2, base * 3, base + 1]), seed, index, `${op}:c`);
      return question(definition, index, `相對於 ${base}，${candidate} 是因數、倍數、兩者都是，還是兩者皆非？`, classifyRelativeToBase(base, candidate), { base, candidate });
    }
    const candidates = uniqueSorted([1,2,3,4,5,6,8,10,12,15,base]);
    const rows = partition(base, candidates);
    return question(definition, index, `把 ${listText(candidates)} 依相對於 ${base} 的關係分類。`, partitionText(rows), { base, candidates, partition: rows });
  }
  if (["lcm_direct_grade5", "first_common_multiples", "bounded_common_multiples", "count_common_multiples_interval"].includes(op)) {
    const data = lcmData(seed, index, op);
    if (op === "lcm_direct_grade5") return question(definition, index, `求 ${data.left} 和 ${data.right} 的最小公倍數。`, data.lcm, data);
    if (op === "first_common_multiples") {
      const count = 4;
      const multiples = Array.from({ length: count }, (_, i) => data.lcm * (i + 1));
      return question(definition, index, `列出 ${data.left} 和 ${data.right} 的前 ${count} 個正公倍數。`, listText(multiples), { ...data, count, multiples });
    }
    const start = 1 + state(seed, index, `${op}:s`) % 40;
    const end = start + 80 + state(seed, index, `${op}:w`) % 100;
    const multiples = multiplesInInterval(data.lcm, start, end);
    return question(definition, index, op === "bounded_common_multiples" ? `列出 ${start} 到 ${end} 之間 ${data.left} 和 ${data.right} 的所有公倍數。` : `${start} 到 ${end} 之間共有幾個數同時是 ${data.left} 和 ${data.right} 的倍數？`, op === "bounded_common_multiples" ? listText(multiples) : multiples.length, { ...data, start, end, multiples });
  }
  if (["factor_multiple_statement_truth", "choose_correct_relation_statement"].includes(op)) {
    const [left, right] = pick(PRODUCT_PAIRS, seed, index, `${op}:p`);
    const product = left * right;
    if (op === "factor_multiple_statement_truth") {
      const truth = state(seed, index, `${op}:t`) % 2 === 0;
      const claimed = truth ? left : product + 1;
      const statement = truth ? `${claimed} 是 ${product} 的因數` : `${claimed} 是 ${left} 的倍數`;
      const actual = truth ? product % claimed === 0 : claimed % left === 0;
      return question(definition, index, `判斷敘述是否正確：${statement}。`, actual ? "正確" : "錯誤", { left, right, product, statement, relationTruth: actual });
    }
    let wrongMultiple = product + 1;
    while (wrongMultiple % left === 0) wrongMultiple += 1;
    const options = [
      { id: "A", text: `${left} 是 ${product} 的因數`, correct: true },
      { id: "B", text: `${product} 是 ${left} 的因數`, correct: false },
      { id: "C", text: `${right} 不是 ${product} 的因數`, correct: false },
      { id: "D", text: `${wrongMultiple} 是 ${left} 的倍數`, correct: false },
    ];
    return question(definition, index, `選出正確敘述：${options.map((row) => `${row.id}.${row.text}`).join("；")}`, "A", { left, right, product, options, correctChoiceId: "A" });
  }
  if (["minimum_common_group_total", "possible_common_totals_in_range"].includes(op)) {
    const data = lcmData(seed, index, op);
    if (op === "minimum_common_group_total") return question(definition, index, `一批物品每 ${data.left} 個或每 ${data.right} 個分組都能剛好分完，最少有多少個？`, data.lcm, data);
    const max = data.lcm * (3 + state(seed, index, `${op}:m`) % 4);
    const totals = multiplesInInterval(data.lcm, data.lcm, max);
    return question(definition, index, `不超過 ${max} 個時，哪些總量能同時以每 ${data.left} 個或每 ${data.right} 個剛好分組？`, listText(totals), { ...data, max, totals });
  }
  if (op === "construct_number_divisibility") {
    const cases = [
      { digits:[1,2,3], divisor:2 }, { digits:[1,2,3], divisor:3 },
      { digits:[2,4,5], divisor:2 }, { digits:[2,4,5], divisor:5 },
      { digits:[0,3,6], divisor:3 }, { digits:[0,3,6], divisor:10 },
      { digits:[1,5,8], divisor:2 }, { digits:[1,5,8], divisor:5 },
      { digits:[2,5,9], divisor:2 }, { digits:[2,5,9], divisor:5 },
      { digits:[0,4,8], divisor:3 }, { digits:[0,4,8], divisor:10 },
    ];
    const selected = pick(cases, seed, index, `${op}:case`);
    const digits = [...selected.digits];
    const divisor = selected.divisor;
    const numbers = constructNumbers(digits, divisor);
    return question(definition, index, `用數字 ${listText(digits)} 各一次組成三位數，列出所有 ${divisor} 的倍數。`, listText(numbers), { digits, divisor, numbers });
  }
  throw new Error(`g5a_u03_operation_not_supported:${op}`);
}

function expected(questionRow) {
  const op = questionRow.operation;
  if (["relation_from_product", "complete_factor_multiple_statement"].includes(op)) return relationText(questionRow.left, questionRow.right, questionRow.product);
  if (op === "divisibility_classification_23510") return listText(divisibilitySet23510(questionRow.value));
  if (["missing_digit_divisibility", "possible_digits_for_divisibility"].includes(op)) return listText(missingDigits(questionRow.prefix, questionRow.suffix, questionRow.divisor));
  if (op === "exact_grouping_yes_no") return questionRow.total % questionRow.groupSize === 0 ? "可以" : "不可以";
  if (op === "exact_grouping_candidate_sizes") return listText(questionRow.candidates.filter((value) => questionRow.total % value === 0));
  if (op === "enumerate_first_multiples") return listText(Array.from({ length: questionRow.count }, (_, i) => questionRow.base * (i + 1)));
  if (op === "enumerate_multiples_after") return listText(Array.from({ length: questionRow.count }, (_, i) => questionRow.base * (questionRow.startIndex + i + 1)));
  if (op === "list_multiples_in_interval") return listText(multiplesInInterval(questionRow.base, questionRow.start, questionRow.end));
  if (op === "nearest_multiple") return listText(nearestMultiples(questionRow.base, questionRow.target));
  if (op === "count_multiples_in_interval") return String(multiplesInInterval(questionRow.base, questionRow.start, questionRow.end).length);
  if (op === "nth_multiple") return String(questionRow.base * questionRow.ordinal);
  if (op === "classify_divisor_multiple") return classifyRelativeToBase(questionRow.base, questionRow.candidate);
  if (op === "partition_candidate_set") return partitionText(partition(questionRow.base, questionRow.candidates));
  if (op === "lcm_direct_grade5") return String(leastCommonMultiple(questionRow.left, questionRow.right));
  if (op === "first_common_multiples") return listText(Array.from({ length: questionRow.count }, (_, i) => leastCommonMultiple(questionRow.left, questionRow.right) * (i + 1)));
  if (op === "bounded_common_multiples") return listText(multiplesInInterval(leastCommonMultiple(questionRow.left, questionRow.right), questionRow.start, questionRow.end));
  if (op === "count_common_multiples_interval") return String(multiplesInInterval(leastCommonMultiple(questionRow.left, questionRow.right), questionRow.start, questionRow.end).length);
  if (op === "factor_multiple_statement_truth") return questionRow.relationTruth ? "正確" : "錯誤";
  if (op === "choose_correct_relation_statement") return questionRow.options.filter((row) => row.correct).length === 1 ? questionRow.options.find((row) => row.correct).id : "";
  if (op === "minimum_common_group_total") return String(leastCommonMultiple(questionRow.left, questionRow.right));
  if (op === "possible_common_totals_in_range") return listText(multiplesInInterval(leastCommonMultiple(questionRow.left, questionRow.right), leastCommonMultiple(questionRow.left, questionRow.right), questionRow.max));
  if (op === "construct_number_divisibility") return listText(constructNumbers(questionRow.digits, questionRow.divisor));
  throw new Error(`g5a_u03_operation_not_supported:${op}`);
}

function allocate(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { patternSpecId, questionCount: count };
  }).filter((row) => row.questionCount > 0);
}

export function canGenerateG5AU03FactorMultipleQuestions(plan = {}) {
  const allowed = new Set(getP01D3PatternSpecIdsForSource(plan.sourceId));
  return G5A_U03_SOURCE_IDS.includes(plan.sourceId)
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((patternSpecId) => SPEC_SET.has(patternSpecId) && allowed.has(patternSpecId));
}

export function validateG5AU03FactorMultipleQuestion(questionRow = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const definition = getBatchABrowserPatternDefinition(questionRow.patternSpecId ?? questionRow.metadata?.patternId);
  if (!definition || definition.kind !== "g5aU03FactorMultiple") add("g5a_u03_pattern_not_supported", "patternSpecId");
  if (!G5A_U03_SOURCE_IDS.includes(questionRow.sourceId) || questionRow.metadata?.sourceId !== questionRow.sourceId || definition?.sourceId !== questionRow.sourceId) add("g5a_u03_source_mismatch", "sourceId");
  if (String(questionRow.blankedDisplayText ?? "").includes("{")) add("g5a_u03_prompt_slot_unresolved", "blankedDisplayText");
  try {
    const answer = expected(questionRow);
    if (String(questionRow.answerText) !== answer) add("g5a_u03_answer_invalid", "answerText");
    if (String(questionRow.finalAnswer) !== String(questionRow.answerText)) add("g5a_u03_final_answer_mismatch", "finalAnswer");
  } catch (error) {
    add(error.code ?? error.message ?? "g5a_u03_validation_exception", "question");
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5AU03FactorMultipleQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5AU03FactorMultipleQuestions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "g5a_u03_plan_not_supported", severity: "error", path: "plan", message: "G5A-U03 plan is outside admitted PatternSpecs." }], warnings: [] };
  }
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? clone(plan.allocation) : allocate(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    if (!SPEC_SET.has(entry.patternSpecId)) continue;
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    for (let offset = 0; offset < entry.questionCount; offset += 1) {
      const row = generate(definition, questions.length + 1, `${plan.generationSeed}:${entry.patternSpecId}`);
      errors.push(...validateG5AU03FactorMultipleQuestion(row).errors);
      questions.push(row);
    }
  }
  const ordered = plan.ordering === "shuffleAcrossPatterns"
    ? [...questions].sort((left, right) => state(plan.generationSeed, 1, left.id) - state(plan.generationSeed, 1, right.id))
    : questions;
  return { ok: errors.length === 0 && ordered.length === plan.questionCount, plan, questions: ordered, allocation, errors, warnings: [] };
}
