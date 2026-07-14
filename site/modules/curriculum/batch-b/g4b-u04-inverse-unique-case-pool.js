const MAX_INPUT = 99_999_999;

export const G4B_U04_INVERSE_DIGIT_SET_CASES = Object.freeze([
  Object.freeze({ mask: "1□3", targetUnit: 100, roundedValue: 100 }),
  Object.freeze({ mask: "1□3", targetUnit: 100, roundedValue: 200 }),
  Object.freeze({ mask: "2□4", targetUnit: 100, roundedValue: 200 }),
  Object.freeze({ mask: "2□4", targetUnit: 100, roundedValue: 300 }),
  Object.freeze({ mask: "3□5", targetUnit: 100, roundedValue: 300 }),
  Object.freeze({ mask: "3□5", targetUnit: 100, roundedValue: 400 }),
  Object.freeze({ mask: "4□6", targetUnit: 100, roundedValue: 400 }),
  Object.freeze({ mask: "4□6", targetUnit: 100, roundedValue: 500 }),
  Object.freeze({ mask: "5□7", targetUnit: 100, roundedValue: 500 }),
  Object.freeze({ mask: "5□7", targetUnit: 100, roundedValue: 600 }),
  Object.freeze({ mask: "6□8", targetUnit: 100, roundedValue: 600 }),
  Object.freeze({ mask: "6□8", targetUnit: 100, roundedValue: 700 }),
]);

export const G4B_U04_INVERSE_ORIGINAL_VALUE_CASES = Object.freeze([
  Object.freeze({ mask: "1□□5", targetUnit: 1000, roundedValue: 1000 }),
  Object.freeze({ mask: "1□□5", targetUnit: 1000, roundedValue: 2000 }),
  Object.freeze({ mask: "2□□5", targetUnit: 1000, roundedValue: 2000 }),
  Object.freeze({ mask: "2□□5", targetUnit: 1000, roundedValue: 3000 }),
  Object.freeze({ mask: "3□□5", targetUnit: 1000, roundedValue: 3000 }),
  Object.freeze({ mask: "3□□5", targetUnit: 1000, roundedValue: 4000 }),
  Object.freeze({ mask: "4□□5", targetUnit: 1000, roundedValue: 4000 }),
  Object.freeze({ mask: "4□□5", targetUnit: 1000, roundedValue: 5000 }),
  Object.freeze({ mask: "5□□5", targetUnit: 1000, roundedValue: 5000 }),
  Object.freeze({ mask: "5□□5", targetUnit: 1000, roundedValue: 6000 }),
  Object.freeze({ mask: "6□□5", targetUnit: 1000, roundedValue: 6000 }),
  Object.freeze({ mask: "6□□5", targetUnit: 1000, roundedValue: 7000 }),
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "g4b-u04-r2b1")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function roundHalfUp(value, unit) {
  return Math.floor((value + unit / 2) / unit) * unit;
}

function targetPlaceLabel(unit) {
  return ({ 10: "十位", 100: "百位", 1000: "千位", 10000: "萬位" })[unit] ?? null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function replaceMask(mask, replacement) {
  let index = 0;
  return Number([...mask].map((char) => (char === "□" ? replacement[index++] : char)).join(""));
}

function enumerateMaskValues(mask) {
  const placeholderCount = [...mask].filter((char) => char === "□").length;
  const limit = 10 ** placeholderCount;
  return Array.from({ length: limit }, (_, value) => (
    replaceMask(mask, String(value).padStart(placeholderCount, "0"))
  ));
}

function selectCase(cases, seed, occurrence, attempt) {
  const offset = hashSeed(seed) % cases.length;
  return cases[(offset + occurrence + attempt) % cases.length];
}

function materializeDigitSetQuestion(question, selected) {
  const digits = [];
  for (let digit = 0; digit <= 9; digit += 1) {
    const completed = replaceMask(selected.mask, String(digit));
    if (roundHalfUp(completed, selected.targetUnit) === selected.roundedValue) digits.push(digit);
  }
  return {
    ...question,
    promptText: `${selected.mask} 用四捨五入法取概數到${targetPlaceLabel(selected.targetUnit)}後是 ${formatNumber(selected.roundedValue)}，□ 可以填哪些數字？`,
    answerText: digits.join("、"),
    finalAnswer: digits,
    structuredAnswer: { digits },
    input: { ...selected },
    derived: { candidateCount: 10 },
  };
}

function materializeOriginalValuesQuestion(question, selected) {
  const values = enumerateMaskValues(selected.mask)
    .filter((value) => roundHalfUp(value, selected.targetUnit) === selected.roundedValue);
  return {
    ...question,
    promptText: `一個數寫成 ${selected.mask}，用四捨五入法取概數到${targetPlaceLabel(selected.targetUnit)}後是 ${formatNumber(selected.roundedValue)}。原數可能是多少？請列出所有可能值。`,
    answerText: values.map(formatNumber).join("、"),
    finalAnswer: values,
    structuredAnswer: { values },
    input: { ...selected },
    derived: {
      intervalStart: Math.max(0, selected.roundedValue - selected.targetUnit / 2),
      intervalEnd: Math.min(MAX_INPUT, selected.roundedValue + selected.targetUnit / 2 - 1),
    },
  };
}

export function materializeG4BU04InverseUniqueCase(question, {
  seed = "g4b-u04-r2b1",
  occurrence = 0,
  attempt = 0,
} = {}) {
  if (question?.patternSpecId === "ps_g4b_u04_inverse_digit_set") {
    return materializeDigitSetQuestion(
      question,
      selectCase(G4B_U04_INVERSE_DIGIT_SET_CASES, seed, occurrence, attempt),
    );
  }
  if (question?.patternSpecId === "ps_g4b_u04_inverse_original_values") {
    return materializeOriginalValuesQuestion(
      question,
      selectCase(G4B_U04_INVERSE_ORIGINAL_VALUE_CASES, seed, occurrence, attempt),
    );
  }
  return question;
}

export function validateG4BU04InverseUniqueCasePools() {
  const errors = [];
  for (const [poolName, cases, placeholderCount] of [
    ["digit_set", G4B_U04_INVERSE_DIGIT_SET_CASES, 1],
    ["original_values", G4B_U04_INVERSE_ORIGINAL_VALUE_CASES, 2],
  ]) {
    const signatures = new Set();
    for (const [index, entry] of cases.entries()) {
      const placeholderActual = [...entry.mask].filter((char) => char === "□").length;
      const values = enumerateMaskValues(entry.mask)
        .filter((value) => roundHalfUp(value, entry.targetUnit) === entry.roundedValue);
      const signature = `${entry.mask}|${entry.targetUnit}|${entry.roundedValue}`;
      if (placeholderActual !== placeholderCount) errors.push(`${poolName}[${index}]:placeholder_count`);
      if (values.length === 0 || values.length > 100) errors.push(`${poolName}[${index}]:solution_count`);
      if (signatures.has(signature)) errors.push(`${poolName}[${index}]:duplicate_case`);
      signatures.add(signature);
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
