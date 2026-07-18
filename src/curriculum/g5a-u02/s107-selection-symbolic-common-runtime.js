const PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_common_factor_concept_identification",
]);
const PATTERN_SET = new Set(PATTERN_IDS);
const SYMBOLS = Object.freeze(["甲", "乙", "丙", "丁"]);
const SYMBOLIC_TARGETS = Object.freeze([12, 18, 20, 24, 28, 30, 36, 40, 42, 48, 54, 60, 72, 84, 90, 96]);

function factorsOf(target) {
  const low = [];
  const high = [];
  for (let divisor = 1; divisor * divisor <= target; divisor += 1) {
    if (target % divisor !== 0) continue;
    low.push(divisor);
    const paired = target / divisor;
    if (paired !== divisor) high.push(paired);
  }
  return [...low, ...high.reverse()];
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function commonFactorsOf(a, b) {
  return factorsOf(gcd(a, b));
}

function exactArray(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function candidateRows(candidates) {
  return candidates.map((candidate, index) => ({
    position: index + 1,
    candidate,
    markAffordance: "circle",
    premarked: false,
  }));
}

function factorCandidateItem(rng) {
  const target = rng.int(3, 12) * rng.int(2, 10);
  const factors = factorsOf(target);
  const nonFactors = [];
  for (let value = 2; value <= Math.min(target + 4, 40) && nonFactors.length < 4; value += 1) {
    if (target % value !== 0) nonFactors.push(value);
  }
  const candidates = [...new Set([
    1,
    ...factors.slice(1, Math.min(5, factors.length)),
    target,
    ...nonFactors.slice(0, 3),
  ])].sort((a, b) => a - b);
  return {
    prompt: `請把 ${target} 的因數圈起來。`,
    data: {
      target,
      candidates,
      candidateRows: candidateRows(candidates),
      markPolicy: "one_circle_per_candidate",
    },
    answer: { selectedValues: candidates.filter((candidate) => target % candidate === 0) },
  };
}

function symbolicFactorItem(rng) {
  const target = rng.pick(SYMBOLIC_TARGETS);
  const complete = factorsOf(target);
  const hiddenPositions = [1, complete.length - 3];
  const unknownKeys = hiddenPositions.map((position) => `p${position}`);
  const shownFactorList = complete.map((value, index) => hiddenPositions.includes(index) ? null : value);
  const pairRelations = hiddenPositions.map((position, index) => {
    const partnerPosition = complete.length - 1 - position;
    return {
      relationId: `relation_${index + 1}`,
      unknownKey: unknownKeys[index],
      symbol: SYMBOLS[index],
      unknownPosition: position,
      partnerPosition,
      partnerValue: complete[partnerPosition],
      target,
      relationKind: "symbol_times_visible_partner_equals_target",
    };
  });
  return {
    prompt: "觀察完整因數表與配對關係，求出原數及各代號。",
    data: {
      target,
      shownFactorList,
      unknownKeys,
      hiddenPositions,
      pairRelations,
      publicSymbols: SYMBOLS.slice(0, hiddenPositions.length),
      publicSymbolPolicy: "traditional_chinese_ordered_symbols",
      solutionCount: 1,
    },
    answer: {
      targetNumber: target,
      inferredValues: Object.fromEntries(hiddenPositions.map((position) => [`p${position}`, complete[position]])),
    },
  };
}

function commonFactorMarkingItem(rng) {
  const commonBase = rng.int(2, 8);
  const multiplierA = rng.int(2, 9);
  let multiplierB = rng.int(2, 9);
  if (multiplierB === multiplierA) multiplierB = multiplierB === 9 ? 8 : multiplierB + 1;
  const a = commonBase * multiplierA;
  const b = commonBase * multiplierB;
  const factorSetA = factorsOf(a);
  const factorSetB = factorsOf(b);
  const commonFactors = commonFactorsOf(a, b);
  const distractors = [...factorSetA, ...factorSetB, a + 1, b + 1]
    .filter((value) => !commonFactors.includes(value));
  const candidates = [...new Set([...commonFactors, ...distractors.slice(0, 4)])].sort((x, y) => x - y);
  return {
    prompt: `請把 ${a} 和 ${b} 的公因數圈起來，再找出最小與最大的公因數。`,
    data: {
      a,
      b,
      factorSetA,
      factorSetB,
      candidates,
      candidateRows: candidateRows(candidates),
      intersection: commonFactors,
      roleMarkings: {
        smallestCommonFactor: commonFactors[0],
        greatestCommonFactor: commonFactors.at(-1),
      },
      markPolicy: "mark_complete_intersection_then_derive_roles",
    },
    answer: { selectedValues: commonFactors },
  };
}

export function isG5AU02S107Pattern(patternSpecId) {
  return PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S107PatternIds() {
  return [...PATTERN_IDS];
}

export function generateG5AU02S107Pattern(patternSpecId, rng) {
  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") return factorCandidateItem(rng);
  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") return symbolicFactorItem(rng);
  if (patternSpecId === "ps_g5a_u02_common_factor_concept_identification") return commonFactorMarkingItem(rng);
  return null;
}

export function expectedG5AU02S107Answer(item) {
  const data = item?.data ?? {};
  if (item?.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    return { selectedValues: data.candidates.filter((candidate) => data.target % candidate === 0) };
  }
  if (item?.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const complete = factorsOf(data.target);
    return {
      targetNumber: data.target,
      inferredValues: Object.fromEntries(data.hiddenPositions.map((position) => [`p${position}`, complete[position]])),
    };
  }
  if (item?.patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
    return { selectedValues: commonFactorsOf(data.a, data.b) };
  }
  throw new Error(`G5AU02_S107_PATTERN_UNSUPPORTED:${item?.patternSpecId ?? "missing"}`);
}

function validateCandidateRows(data, errors, rowError) {
  if (!Array.isArray(data.candidates) || data.candidates.length < 4 || new Set(data.candidates).size !== data.candidates.length) {
    errors.push(rowError);
    return;
  }
  const rows = data.candidateRows ?? [];
  if (rows.length !== data.candidates.length) errors.push(rowError);
  rows.forEach((row, index) => {
    if (row.position !== index + 1 || row.candidate !== data.candidates[index]) errors.push(rowError);
    if (row.markAffordance !== "circle" || row.premarked !== false) errors.push("G5AU02_P1_CANDIDATE_MARK_AFFORDANCE_INVALID");
  });
}

export function validateG5AU02S107Pattern(item) {
  const errors = [];
  const data = item?.data ?? {};
  if (item?.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    validateCandidateRows(data, errors, "G5AU02_P1_CANDIDATE_ROW_INCOMPLETE");
    if (data.markPolicy !== "one_circle_per_candidate") errors.push("G5AU02_P1_CANDIDATE_MARK_AFFORDANCE_INVALID");
    const expected = data.candidates?.filter((candidate) => data.target % candidate === 0) ?? [];
    if (!exactArray(item.answer?.selectedValues, expected)) errors.push("G5AU02_P1_CANDIDATE_DIVISIBILITY_MISMATCH");
  } else if (item?.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const complete = factorsOf(data.target);
    const hidden = data.hiddenPositions ?? [];
    const keys = data.unknownKeys ?? [];
    if (complete.length < 6 || data.shownFactorList?.length !== complete.length || hidden.length !== 2 || keys.length !== 2) {
      errors.push("G5AU02_P1_SYMBOLIC_FACTOR_TABLE_INCOMPLETE");
    }
    complete.forEach((value, index) => {
      const expected = hidden.includes(index) ? null : value;
      if (data.shownFactorList?.[index] !== expected) errors.push("G5AU02_P1_SYMBOLIC_FACTOR_TABLE_INCOMPLETE");
    });
    if (!exactArray(keys, hidden.map((position) => `p${position}`))) errors.push("G5AU02_P1_SYMBOL_RELATION_MISMATCH");
    if (data.publicSymbolPolicy !== "traditional_chinese_ordered_symbols" || !exactArray(data.publicSymbols, SYMBOLS.slice(0, 2))) {
      errors.push("G5AU02_P1_PUBLIC_SYMBOL_POLICY_INVALID");
    }
    const relations = data.pairRelations ?? [];
    if (relations.length !== hidden.length) errors.push("G5AU02_P1_SYMBOL_RELATION_MISMATCH");
    relations.forEach((relation, index) => {
      const position = hidden[index];
      const partnerPosition = complete.length - 1 - position;
      if (relation.unknownKey !== keys[index]
        || relation.symbol !== SYMBOLS[index]
        || relation.unknownPosition !== position
        || relation.partnerPosition !== partnerPosition
        || relation.partnerValue !== complete[partnerPosition]
        || relation.target !== data.target
        || relation.relationKind !== "symbol_times_visible_partner_equals_target") {
        errors.push("G5AU02_P1_SYMBOL_RELATION_MISMATCH");
      }
      if (hidden.includes(partnerPosition) || data.target / relation.partnerValue !== complete[position]) {
        errors.push("G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");
      }
    });
    if (data.solutionCount !== 1 || !exactArray(item.answer, expectedG5AU02S107Answer(item))) {
      errors.push("G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");
    }
  } else if (item?.patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
    validateCandidateRows(data, errors, "G5AU02_P1_COMMON_FACTOR_ROW_INCOMPLETE");
    const factorSetA = factorsOf(data.a);
    const factorSetB = factorsOf(data.b);
    const intersection = commonFactorsOf(data.a, data.b);
    if (!exactArray(data.factorSetA, factorSetA) || !exactArray(data.factorSetB, factorSetB) || !exactArray(data.intersection, intersection)) {
      errors.push("G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH");
    }
    if (!intersection.every((value) => data.candidates?.includes(value))) errors.push("G5AU02_P1_COMMON_FACTOR_ROW_INCOMPLETE");
    if (data.markPolicy !== "mark_complete_intersection_then_derive_roles" || !exactArray(item.answer?.selectedValues, intersection)) {
      errors.push("G5AU02_P1_COMMON_FACTOR_MARKING_MISMATCH");
    }
    if (data.roleMarkings?.smallestCommonFactor !== intersection[0]
      || data.roleMarkings?.greatestCommonFactor !== intersection.at(-1)) {
      errors.push("G5AU02_P1_COMMON_FACTOR_ROLE_MISMATCH");
    }
  } else {
    errors.push("G5AU02_S107_PATTERN_UNSUPPORTED");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}
