const sourceId = "g3a_u01_3a01";
const digitsZh = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
const zhDigits = new Map(digitsZh.map((text, value) => [text, value]));

export const G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS = Object.freeze({
  numberToChineseBasic: "ps_g3a_u01_4digit_number_to_chinese_basic",
  numberToChineseZero: "ps_g3a_u01_4digit_number_to_chinese_with_zero",
  chineseToNumberBasic: "ps_g3a_u01_chinese_to_4digit_number_basic",
  chineseToNumberZero: "ps_g3a_u01_chinese_to_4digit_number_with_zero",
  fullDecomposition: "ps_g3a_u01_4digit_place_value_full_decomposition",
  digitValue: "ps_g3a_u01_4digit_digit_value_identification",
  sameDigit: "ps_g3a_u01_4digit_same_digit_different_place",
  standardComposition: "ps_g3a_u01_place_value_standard_composition",
  nonstandardComposition: "ps_g3a_u01_place_value_nonstandard_composition",
  partialComposition: "ps_g3a_u01_place_value_partial_composition",
  tensToHundredsConversion: "ps_g3a_u01_tens_to_hundreds_conversion",
  hundredsToThousandsConversion: "ps_g3a_u01_hundreds_to_thousands_conversion",
  moneyPlaceValueExchange: "ps_g3a_u01_money_place_value_exchange",
  digitArrangementMax: "ps_g3a_u01_digit_arrangement_max_4digit",
  digitArrangementMin: "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero",
  digitArrangementPair: "ps_g3a_u01_digit_arrangement_max_min_pair",
  rangeCompareReasoning: "ps_g3a_u01_4digit_range_compare_reasoning",
  serialNumberRange: "ps_g3a_u01_4digit_serial_number_range",
  priceRangeReasoning: "ps_g3a_u01_4digit_price_range_reasoning"
});

const patternIds = Object.freeze(Object.values(G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS));
const digitCombinationPool = Object.freeze((() => {
  const combinations = [];
  for (let a = 0; a <= 6; a += 1) {
    for (let b = a + 1; b <= 7; b += 1) {
      for (let c = b + 1; c <= 8; c += 1) {
        for (let d = c + 1; d <= 9; d += 1) {
          combinations.push(Object.freeze([a, b, c, d]));
        }
      }
    }
  }
  return combinations;
})());

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "g3a-u01")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}
function pick(list, seed) { return list[hashSeed(seed) % list.length]; }
function hasInternalZero(number) { const h = Math.floor(number / 100) % 10; const t = Math.floor(number / 10) % 10; return h === 0 || t === 0; }
function digitsOf(number) { return String(number).padStart(4, "0").split("").map(Number); }

export function numberToChinese4Digit(number) {
  if (!Number.isInteger(number) || number < 1000 || number > 9999) throw new Error("g3a_u01_number_out_of_range");
  const [thousands, hundreds, tens, ones] = digitsOf(number);
  let output = `${digitsZh[thousands]}千`;
  let zeroPending = false;
  if (hundreds > 0) output += `${digitsZh[hundreds]}百`;
  else if (tens > 0 || ones > 0) zeroPending = true;
  if (tens > 0) { if (zeroPending) output += "零"; output += `${digitsZh[tens]}十`; zeroPending = false; }
  else if (ones > 0 && hundreds > 0) zeroPending = true;
  if (ones > 0) { if (zeroPending) output += "零"; output += digitsZh[ones]; }
  return output;
}

export function chineseToNumber4Digit(text) {
  const raw = String(text ?? "").replaceAll(" ", "");
  const thousandsIndex = raw.indexOf("千");
  if (thousandsIndex <= 0) throw new Error("g3a_u01_chinese_number_invalid");
  const thousands = zhDigits.get(raw[thousandsIndex - 1]);
  if (!thousands) throw new Error("g3a_u01_chinese_number_invalid");
  let hundreds = 0, tens = 0, ones = 0;
  const hundredsIndex = raw.indexOf("百");
  if (hundredsIndex > 0) hundreds = zhDigits.get(raw[hundredsIndex - 1]) ?? 0;
  const tensIndex = raw.indexOf("十");
  if (tensIndex > 0) tens = zhDigits.get(raw[tensIndex - 1]) ?? 0;
  const compact = raw.replace(/.千/, "").replace(/.百/, "").replace(/.十/, "").replaceAll("零", "");
  if (compact.length > 0) ones = zhDigits.get(compact[compact.length - 1]) ?? 0;
  return thousands * 1000 + hundreds * 100 + tens * 10 + ones;
}

function numberPool(patternSpecId) {
  const all = [];
  for (let n = 1000; n <= 9999; n += 1) {
    const zero = hasInternalZero(n);
    if (patternSpecId.endsWith("with_zero") && !zero) continue;
    if (patternSpecId.endsWith("basic") && zero) continue;
    all.push(n);
  }
  return all;
}
function decompose(number) { const [thousands, hundreds, tens, ones] = digitsOf(number); return { thousands, hundreds, tens, ones }; }
function placeName(index) { return ["千位", "百位", "十位", "個位"][index]; }
function unitName(index) { return ["個千", "個百", "個十", "個一"][index]; }
function makeMeta(patternSpecId, skill = "number_representation") { return { patternId: patternSpecId, sourceId, canonicalSkillIds: [skill], skillTags: [skill, "g3a_u01"], difficultyTags: [patternSpecId.replace("ps_g3a_u01_", "")], curriculumNodeIds: [sourceId] }; }
function questionBase(patternSpecId, index, seed, promptText, answerText, extra = {}) { return { id: `${patternSpecId}-${index}`, sourceId, patternSpecId, promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} 答案：${answerText}`, answerText, finalAnswer: answerText, metadata: makeMeta(patternSpecId, extra.skill), ...extra }; }

function makeRepresentation(patternSpecId, index, seed) {
  const number = pick(numberPool(patternSpecId), `${seed}:${index}:${patternSpecId}`);
  const chinese = numberToChinese4Digit(number);
  if (patternSpecId.includes("number_to_chinese")) return questionBase(patternSpecId, index, seed, `把 ${number} 寫成中文數字。`, chinese, { kind: "numberToChinese", number, chineseNumber: chinese, skill: "number_representation" });
  return questionBase(patternSpecId, index, seed, `把「${chinese}」寫成數字。`, String(number), { kind: "chineseToNumber", number, chineseNumber: chinese, skill: "number_representation" });
}

function makeDecomposition(patternSpecId, index, seed) {
  const number = 1000 + (hashSeed(`${seed}:${index}`) % 9000);
  const d = decompose(number);
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.fullDecomposition) {
    const answerText = `${d.thousands}個千、${d.hundreds}個百、${d.tens}個十、${d.ones}個一`;
    return questionBase(patternSpecId, index, seed, `${number} 是幾個千、幾個百、幾個十、幾個一合起來的？`, answerText, { kind: "placeValueDecomposition", number, placeValue: d, skill: "place_value" });
  }
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.sameDigit) {
    const digit = 6 + (hashSeed(seed) % 3);
    const number2 = digit * 1000 + 300 + digit * 10 + (index % 9);
    return questionBase(patternSpecId, index, seed, `${number2} 中兩個 ${digit} 分別表示什麼？`, `${digit}個千、${digit}個十`, { kind: "sameDigitPlaceValue", number: number2, digit, skill: "place_value" });
  }
  const nonzeroPlaces = digitsOf(number).map((digit, placeIndex) => ({ digit, placeIndex })).filter((item) => item.digit > 0);
  const target = pick(nonzeroPlaces, `${seed}:${index}:place`);
  return questionBase(patternSpecId, index, seed, `${number} 中的 ${target.digit} 在${placeName(target.placeIndex)}，表示多少？`, `${target.digit}${unitName(target.placeIndex)}`, { kind: "digitValueIdentification", number, digit: target.digit, placeIndex: target.placeIndex, skill: "place_value" });
}

function compositionCounts(patternSpecId, seed) {
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.nonstandardComposition) return { thousands: 2 + (hashSeed(seed) % 5), hundreds: 10 + (hashSeed(`${seed}:h`) % 9), tens: hashSeed(`${seed}:t`) % 10, ones: hashSeed(`${seed}:o`) % 10 };
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.partialComposition) return { thousands: 1 + (hashSeed(seed) % 8), hundreds: hashSeed(`${seed}:h`) % 10, tens: 0, ones: 0 };
  return { thousands: 1 + (hashSeed(seed) % 8), hundreds: hashSeed(`${seed}:h`) % 10, tens: hashSeed(`${seed}:t`) % 10, ones: hashSeed(`${seed}:o`) % 10 };
}
function makeComposition(patternSpecId, index, seed) {
  let counts = compositionCounts(patternSpecId, `${seed}:${index}`);
  let total = counts.thousands * 1000 + counts.hundreds * 100 + counts.tens * 10 + counts.ones;
  while (total > 9999) { counts = { ...counts, hundreds: counts.hundreds - 1 }; total = counts.thousands * 1000 + counts.hundreds * 100 + counts.tens * 10 + counts.ones; }
  const promptText = `${counts.thousands}個千、${counts.hundreds}個百、${counts.tens}個十、${counts.ones}個一，合起來是多少？`;
  return questionBase(patternSpecId, index, seed, promptText, String(total), { kind: "placeValueComposition", counts, number: total, skill: "place_value" });
}

function exchangeAnswer(sourceCount, sourceUnit, targetUnit) {
  const quotient = Math.floor(sourceCount / 10);
  const remainder = sourceCount % 10;
  const text = `${quotient}${targetUnit}又${remainder}${sourceUnit}`;
  return { quotient, remainder, text };
}
function exchangePrompt(sourceCount, sourceUnit, targetUnit) { return `${sourceCount}${sourceUnit}可以換成幾${targetUnit}，還剩幾${sourceUnit}？`; }
function moneyExchangePrompt(sourceCount, sourceUnit, targetUnit) { return `有${sourceCount}${sourceUnit}，可以換成幾${targetUnit}，還剩幾${sourceUnit}？`; }
function makeUnitConversion(patternSpecId, index, seed) {
  const count = 20 + (hashSeed(`${seed}:${index}:${patternSpecId}`) % 70);
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.tensToHundredsConversion) {
    const sourceUnit = "個十";
    const targetUnit = "個百";
    const answer = exchangeAnswer(count, sourceUnit, targetUnit);
    return questionBase(patternSpecId, index, seed, exchangePrompt(count, sourceUnit, targetUnit), answer.text, { kind: "placeValueUnitConversion", sourceCount: count, sourceUnit, targetUnit, answerModel: { shape: "quotient_remainder", quotientUnit: targetUnit, remainderUnit: sourceUnit }, answer, skill: "place_value" });
  }
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.hundredsToThousandsConversion) {
    const sourceUnit = "個百";
    const targetUnit = "個千";
    const answer = exchangeAnswer(count, sourceUnit, targetUnit);
    return questionBase(patternSpecId, index, seed, exchangePrompt(count, sourceUnit, targetUnit), answer.text, { kind: "placeValueUnitConversion", sourceCount: count, sourceUnit, targetUnit, answerModel: { shape: "quotient_remainder", quotientUnit: targetUnit, remainderUnit: sourceUnit }, answer, skill: "place_value" });
  }
  const source = pick([{ sourceUnit: "個10元", targetUnit: "張100元" }, { sourceUnit: "張100元", targetUnit: "張1000元" }], `${seed}:${index}:money`);
  const answer = exchangeAnswer(count, source.sourceUnit, source.targetUnit);
  return questionBase(patternSpecId, index, seed, moneyExchangePrompt(count, source.sourceUnit, source.targetUnit), answer.text, { kind: "moneyPlaceValueExchange", sourceCount: count, ...source, answerModel: { shape: "quotient_remainder", quotientUnit: source.targetUnit, remainderUnit: source.sourceUnit }, answer, skill: "place_value" });
}

export function arrangeDigitsMax(digits) { return Number([...digits].sort((a, b) => b - a).join("")); }
export function arrangeDigitsMin(digits) {
  const sorted = [...digits].sort((a, b) => a - b);
  const firstIndex = sorted.findIndex((digit) => digit !== 0);
  const [first] = sorted.splice(firstIndex, 1);
  return Number([first, ...sorted].join(""));
}
function digitSet(seed, index, patternSpecId) {
  const base = hashSeed(`${seed}:${patternSpecId}`) % digitCombinationPool.length;
  const offset = ((Math.max(1, Number(index) || 1) - 1) * 37) % digitCombinationPool.length;
  return [...digitCombinationPool[(base + offset) % digitCombinationPool.length]];
}
function digitArrangementPrompt(digitText, mode) {
  if (mode === "max") return `用 ${digitText} 四個數字組成最大的四位數，每個數字只能用一次。`;
  if (mode === "min") return `用 ${digitText} 四個數字組成最小的四位數，每個數字只能用一次。`;
  return `用 ${digitText} 四個數字組成四位數，最大和最小分別是多少？每個數字只能用一次。`;
}
function makeDigitArrangement(patternSpecId, index, seed) {
  const digits = digitSet(seed, index, patternSpecId);
  const max = arrangeDigitsMax(digits);
  const min = arrangeDigitsMin(digits);
  const digitText = digits.join("、");
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.digitArrangementMax) return questionBase(patternSpecId, index, seed, digitArrangementPrompt(digitText, "max"), String(max), { kind: "digitArrangementMax", digits, max, skill: "place_value_reasoning" });
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.digitArrangementMin) return questionBase(patternSpecId, index, seed, digitArrangementPrompt(digitText, "min"), String(min), { kind: "digitArrangementMin", digits, min, skill: "place_value_reasoning" });
  return questionBase(patternSpecId, index, seed, digitArrangementPrompt(digitText, "pair"), `最大${max}，最小${min}`, { kind: "digitArrangementPair", digits, max, min, skill: "place_value_reasoning" });
}

function rangeValues(seed) {
  const lower = 1000 + (hashSeed(`${seed}:lower`) % 6500);
  const width = 300 + (hashSeed(`${seed}:width`) % 1200);
  const upper = Math.min(9999, lower + width);
  const inside = lower + 1 + (hashSeed(`${seed}:inside`) % Math.max(1, upper - lower - 1));
  const outside = Math.max(1000, lower - 1 - (hashSeed(`${seed}:outside`) % 200));
  return { lower, upper, inside, outside };
}
function makeChoices(validValue, invalidValue, seed) {
  const validLabel = hashSeed(`${seed}:answer-position`) % 2 === 0 ? "A" : "B";
  return validLabel === "A" ? { answerText: "A", choices: { A: validValue, B: invalidValue } } : { answerText: "B", choices: { A: invalidValue, B: validValue } };
}
function validChoiceLabels(question) {
  return Object.entries(question.choices ?? {}).filter(([, value]) => value > question.lower && value < question.upper).map(([label]) => label);
}
function makeRangeReasoning(patternSpecId, index, seed) {
  const values = rangeValues(`${seed}:${index}:${patternSpecId}`);
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.rangeCompareReasoning) {
    const choiceState = makeChoices(values.inside, values.outside, `${seed}:${index}:range`);
    return questionBase(patternSpecId, index, seed, `哪一個數大於 ${values.lower} 且小於 ${values.upper}？A ${choiceState.choices.A}　B ${choiceState.choices.B}`, choiceState.answerText, { kind: "rangeCompareReasoning", ...values, choices: choiceState.choices, skill: "place_value_reasoning" });
  }
  if (patternSpecId === G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS.serialNumberRange) {
    const start = values.lower;
    const count = 100 + (hashSeed(`${seed}:${index}:count`) % 500);
    const end = start + count - 1;
    return questionBase(patternSpecId, index, seed, `編號從 ${start} 到 ${end}，共有幾個編號？`, String(count), { kind: "serialNumberRange", start, end, count, skill: "place_value_reasoning" });
  }
  const price = values.inside;
  const choiceState = makeChoices(price, values.outside, `${seed}:${index}:price`);
  return questionBase(patternSpecId, index, seed, `某商品價格大於 ${values.lower} 元且小於 ${values.upper} 元，下列哪個可能？A ${choiceState.choices.A}元　B ${choiceState.choices.B}元`, choiceState.answerText, { kind: "priceRangeReasoning", ...values, price, choices: choiceState.choices, skill: "place_value_reasoning" });
}

export function generateG3AU01NumberStructureQuestion({ patternSpecId, index = 1, seed = "s44i" } = {}) {
  if (!patternIds.includes(patternSpecId)) throw new Error("g3a_u01_pattern_not_supported");
  if (patternSpecId.includes("number_to_chinese") || patternSpecId.includes("chinese_to_4digit")) return makeRepresentation(patternSpecId, index, seed);
  if (patternSpecId.includes("place_value_full") || patternSpecId.includes("digit_value") || patternSpecId.includes("same_digit")) return makeDecomposition(patternSpecId, index, seed);
  if (patternSpecId.includes("composition")) return makeComposition(patternSpecId, index, seed);
  if (patternSpecId.includes("conversion") || patternSpecId.includes("exchange")) return makeUnitConversion(patternSpecId, index, seed);
  if (patternSpecId.includes("digit_arrangement")) return makeDigitArrangement(patternSpecId, index, seed);
  if (patternSpecId.includes("range") || patternSpecId.includes("price")) return makeRangeReasoning(patternSpecId, index, seed);
  throw new Error("g3a_u01_pattern_not_supported");
}

export function validateG3AU01NumberStructureQuestion(question) {
  const errors = [];
  try {
    if (!question?.patternSpecId || !patternIds.includes(question.patternSpecId)) errors.push({ code: "g3a_u01_pattern_not_supported", path: "patternSpecId" });
    if (String(question?.blankedDisplayText ?? "").includes("{")) errors.push({ code: "g3a_u01_prompt_slot_unresolved", path: "blankedDisplayText" });
    if (question.kind === "numberToChinese" && question.answerText !== numberToChinese4Digit(question.number)) errors.push({ code: "g3a_u01_number_to_chinese_answer_mismatch", path: "answerText" });
    if (question.kind === "chineseToNumber" && Number(question.answerText) !== chineseToNumber4Digit(question.chineseNumber)) errors.push({ code: "g3a_u01_chinese_to_number_answer_mismatch", path: "answerText" });
    if (question.kind === "placeValueDecomposition") { const d = decompose(question.number); const expected = `${d.thousands}個千、${d.hundreds}個百、${d.tens}個十、${d.ones}個一`; if (question.answerText !== expected) errors.push({ code: "g3a_u01_place_value_decomposition_mismatch", path: "answerText" }); }
    if (question.kind === "placeValueComposition") { const c = question.counts; const total = c.thousands * 1000 + c.hundreds * 100 + c.tens * 10 + c.ones; if (String(total) !== question.answerText) errors.push({ code: "g3a_u01_composition_answer_mismatch", path: "answerText" }); }
    if (["placeValueUnitConversion", "moneyPlaceValueExchange"].includes(question.kind)) { const expected = exchangeAnswer(question.sourceCount, question.sourceUnit, question.targetUnit); if (question.answerText !== expected.text) errors.push({ code: "g3a_u01_unit_conversion_answer_mismatch", path: "answerText" }); if (!String(question.blankedDisplayText ?? "").includes("還剩")) errors.push({ code: "g3a_u01_unit_conversion_prompt_mismatch", path: "blankedDisplayText" }); }
    if (question.kind === "moneyPlaceValueExchange" && !String(question.blankedDisplayText ?? "").includes("，可以換成")) errors.push({ code: "g3a_u01_money_exchange_prompt_unnatural", path: "blankedDisplayText" });
    if (question.kind === "digitArrangementMax" && Number(question.answerText) !== arrangeDigitsMax(question.digits)) errors.push({ code: "g3a_u01_digit_arrangement_max_mismatch", path: "answerText" });
    if (question.kind === "digitArrangementMin" && Number(question.answerText) !== arrangeDigitsMin(question.digits)) errors.push({ code: "g3a_u01_digit_arrangement_min_mismatch", path: "answerText" });
    if (question.kind === "digitArrangementPair") { const expected = `最大${arrangeDigitsMax(question.digits)}，最小${arrangeDigitsMin(question.digits)}`; if (question.answerText !== expected) errors.push({ code: "g3a_u01_digit_arrangement_pair_mismatch", path: "answerText" }); }
    if (["digitArrangementMax", "digitArrangementMin", "digitArrangementPair"].includes(question.kind) && !String(question.blankedDisplayText ?? "").includes("每個數字只能用一次")) errors.push({ code: "g3a_u01_digit_arrangement_reuse_rule_missing", path: "blankedDisplayText" });
    if (["digitArrangementMax", "digitArrangementMin", "digitArrangementPair"].includes(question.kind) && String(question.blankedDisplayText ?? "").includes("？，")) errors.push({ code: "g3a_u01_digit_arrangement_punctuation_invalid", path: "blankedDisplayText" });
    if (["rangeCompareReasoning", "priceRangeReasoning"].includes(question.kind)) { const labels = validChoiceLabels(question); if (labels.length !== 1 || question.answerText !== labels[0]) errors.push({ code: "g3a_u01_range_reasoning_answer_mismatch", path: "answerText" }); }
    if (question.kind === "serialNumberRange" && Number(question.answerText) !== question.end - question.start + 1) errors.push({ code: "g3a_u01_range_reasoning_serial_boundary_mismatch", path: "answerText" });
  } catch (error) { errors.push({ code: error.code ?? error.message, path: "question" }); }
  return { ok: errors.length === 0, errors, warnings: [] };
}
