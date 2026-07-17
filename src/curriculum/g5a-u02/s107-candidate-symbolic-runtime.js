const S107_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_common_factor_concept_identification",
]);
const S107_PATTERN_SET = new Set(S107_PATTERN_IDS);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

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

function compositeTarget(rng) {
  return rng.int(2, 12) * rng.int(2, 12);
}

function firstNonFactors(target, count) {
  const values = [];
  for (let candidate = 2; values.length < count; candidate += 1) {
    if (target % candidate !== 0) values.push(candidate);
  }
  return values;
}

function candidateSelectionStructure(target) {
  const factorValues = factorsOf(target);
  const selectedFactorSamples = [
    1,
    factorValues[Math.min(1, factorValues.length - 1)],
    factorValues[Math.max(0, factorValues.length - 2)],
    target,
  ];
  const candidates = [...new Set([
    ...selectedFactorSamples,
    ...firstNonFactors(target, 4),
  ])].sort((left, right) => left - right);
  const canonicalSelections = candidates.filter((value) => target % value === 0);
  return {
    candidates,
    selectionRole: "factor",
    selectionAffordance: "empty_circle_per_candidate",
    canonicalSelections,
  };
}

function symbolicUnknownPositions(factorCount, rng) {
  if (factorCount <= 3) return [1];
  const eligible = [];
  const lastIndex = factorCount - 1;
  for (let position = 1; position < lastIndex; position += 1) {
    const partner = lastIndex - position;
    if (position > partner) break;
    eligible.push(position);
  }
  if (eligible.length === 1) return [eligible[0]];
  const first = eligible[rng.int(0, eligible.length - 1)];
  const positions = [first];
  const secondCandidates = eligible.filter((position) => {
    const firstPartner = lastIndex - first;
    const positionPartner = lastIndex - position;
    return position !== firstPartner && positionPartner !== first;
  });
  if (secondCandidates.length > 0 && rng.int(0, 1) === 1) {
    positions.push(secondCandidates[rng.int(0, secondCandidates.length - 1)]);
  }
  return [...new Set(positions)].sort((left, right) => left - right);
}

function pairRelationsFor(target, complete, unknownPositions) {
  const unknownSet = new Set(unknownPositions);
  const relations = [];
  for (let left = 0; left <= complete.length - 1 - left; left += 1) {
    const right = complete.length - 1 - left;
    relations.push({
      pairOrder: relations.length + 1,
      leftPosition: left + 1,
      rightPosition: right + 1,
      leftKey: unknownSet.has(left) ? `p${left}` : null,
      rightKey: unknownSet.has(right) ? `p${right}` : null,
      product: target,
      relationRole: left === right ? "square_midpoint" : "symmetric_pair",
    });
  }
  return relations;
}

function symbolEquationsFor(target, complete, unknownPositions) {
  const lastIndex = complete.length - 1;
  return unknownPositions.map((position) => {
    const partner = lastIndex - position;
    return {
      symbolKey: `p${position}`,
      unknownPosition: position + 1,
      partnerPosition: partner + 1,
      partnerValue: partner === position ? null : complete[partner],
      equationRole: partner === position ? "symbol_square_equals_target" : "symbol_times_visible_partner_equals_target",
      target,
    };
  });
}

function symbolicStructure(target, rng) {
  const complete = factorsOf(target);
  const unknownPositions = symbolicUnknownPositions(complete.length, rng);
  const shownFactorList = complete.map((value, index) => (
    unknownPositions.includes(index) ? null : value
  ));
  const unknownKeys = unknownPositions.map((position) => `p${position}`);
  return {
    target,
    shownFactorList,
    unknownKeys,
    pairRelations: pairRelationsFor(target, complete, unknownPositions),
    symbolEquations: symbolEquationsFor(target, complete, unknownPositions),
    solutionCount: 1,
    answer: {
      targetNumber: target,
      inferredValues: Object.fromEntries(
        unknownPositions.map((position) => [`p${position}`, complete[position]]),
      ),
    },
  };
}

function coprimePair(rng) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const left = rng.int(2, 9);
    const right = rng.int(2, 9);
    if (left !== right && gcd(left, right) === 1) return [left, right];
  }
  return [2, 3];
}

function commonFactorStructure(rng) {
  const commonBase = rng.int(2, 10);
  const [leftMultiplier, rightMultiplier] = coprimePair(rng);
  const a = commonBase * leftMultiplier;
  const b = commonBase * rightMultiplier;
  const factorSetA = factorsOf(a);
  const factorSetB = factorsOf(b);
  const candidateRow = [...new Set([...factorSetA, ...factorSetB])]
    .sort((left, right) => left - right);
  const commonFactors = candidateRow.filter((value) => a % value === 0 && b % value === 0);
  return {
    a,
    b,
    factorSetA,
    factorSetB,
    candidateRow,
    selectionAffordance: "empty_circle_per_candidate",
    commonFactors,
    smallestCommonFactor: commonFactors[0],
    greatestCommonFactor: commonFactors.at(-1),
  };
}

export function isG5AU02S107Pattern(patternSpecId) {
  return S107_PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S107PatternIds() {
  return [...S107_PATTERN_IDS];
}

export function generateG5AU02S107Pattern(patternSpecId, rng) {
  if (!S107_PATTERN_SET.has(patternSpecId)) return null;

  if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    const target = compositeTarget(rng);
    const structure = candidateSelectionStructure(target);
    return {
      data: { target, ...structure },
      prompt: `在每個候選數前的空圈做記號，選出 ${target} 的所有因數。`,
      answer: { selectedValues: clone(structure.canonicalSelections) },
    };
  }

  if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const structure = symbolicStructure(compositeTarget(rng), rng);
    return {
      data: {
        target: structure.target,
        shownFactorList: structure.shownFactorList,
        unknownKeys: structure.unknownKeys,
        pairRelations: structure.pairRelations,
        symbolEquations: structure.symbolEquations,
        solutionCount: structure.solutionCount,
      },
      prompt: "根據完整因數表的對稱位置關係，求原數與所有代號。",
      answer: clone(structure.answer),
    };
  }

  const structure = commonFactorStructure(rng);
  return {
    data: clone(structure),
    prompt: `比較 ${structure.a} 和 ${structure.b} 的完整因數集合，在候選列圈出所有公因數，再判斷最小與最大公因數。`,
    answer: { selectedValues: clone(structure.commonFactors) },
  };
}

export function expectedG5AU02S107Answer(item) {
  const data = item?.data ?? {};
  if (item?.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    return { selectedValues: (data.candidates ?? []).filter((value) => data.target % value === 0) };
  }
  if (item?.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const complete = factorsOf(data.target);
    return {
      targetNumber: data.target,
      inferredValues: Object.fromEntries(
        (data.unknownKeys ?? []).map((key) => {
          const position = Number(String(key).slice(1));
          return [key, complete[position]];
        }),
      ),
    };
  }
  if (item?.patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
    return {
      selectedValues: (data.candidateRow ?? []).filter((value) => data.a % value === 0 && data.b % value === 0),
    };
  }
  throw new Error(`G5AU02_S107_PATTERN_UNSUPPORTED:${item?.patternSpecId ?? "missing"}`);
}

export function validateG5AU02S107Pattern(item) {
  const errors = [];
  if (!item || !S107_PATTERN_SET.has(item.patternSpecId)) {
    return Object.freeze({ ok: false, errors: Object.freeze(["G5AU02_PATTERN_SPEC_ID_INVALID"]) });
  }
  const data = item.data ?? {};

  if (item.patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
    const expected = candidateSelectionStructure(data.target);
    if (!same(data.candidates, expected.candidates)
      || data.selectionRole !== "factor"
      || data.selectionAffordance !== "empty_circle_per_candidate") {
      errors.push("G5AU02_P1_CANDIDATE_SELECTION_AFFORDANCE_MISSING");
    }
    if (!same(data.canonicalSelections, expected.canonicalSelections)
      || !same(item.answer, { selectedValues: expected.canonicalSelections })) {
      errors.push("G5AU02_P1_CANDIDATE_DIVISIBILITY_CLASSIFICATION_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
    const complete = factorsOf(data.target);
    const unknownPositions = (data.unknownKeys ?? []).map((key) => Number(String(key).slice(1)));
    const expectedShown = complete.map((value, index) => unknownPositions.includes(index) ? null : value);
    const expectedRelations = pairRelationsFor(data.target, complete, unknownPositions);
    const expectedEquations = symbolEquationsFor(data.target, complete, unknownPositions);
    if (data.shownFactorList?.at(-1) !== data.target
      || !same(data.shownFactorList, expectedShown)
      || !same(data.pairRelations, expectedRelations)) {
      errors.push("G5AU02_P1_SYMBOLIC_FACTOR_RELATION_INCOMPLETE");
    }
    if (!same(data.symbolEquations, expectedEquations)) {
      errors.push("G5AU02_P1_SYMBOLIC_FACTOR_EQUATION_MISMATCH");
    }
    if (data.solutionCount !== 1
      || unknownPositions.length === 0
      || new Set(unknownPositions).size !== unknownPositions.length
      || unknownPositions.some((position) => !Number.isInteger(position) || position < 0 || position >= complete.length - 1)
      || !same(item.answer, expectedG5AU02S107Answer(item))) {
      errors.push("G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
    const factorSetA = factorsOf(data.a);
    const factorSetB = factorsOf(data.b);
    const candidateRow = [...new Set([...factorSetA, ...factorSetB])].sort((left, right) => left - right);
    const commonFactors = candidateRow.filter((value) => data.a % value === 0 && data.b % value === 0);
    if (!same(data.factorSetA, factorSetA)
      || !same(data.factorSetB, factorSetB)
      || !same(data.candidateRow, candidateRow)
      || data.selectionAffordance !== "empty_circle_per_candidate") {
      errors.push("G5AU02_P1_COMMON_FACTOR_MARKING_INCOMPLETE");
    }
    if (data.smallestCommonFactor !== commonFactors[0]
      || data.greatestCommonFactor !== commonFactors.at(-1)) {
      errors.push("G5AU02_P1_COMMON_FACTOR_MIN_MAX_MISMATCH");
    }
    if (data.a === data.b
      || gcd(data.a, data.b) < 2
      || !same(data.commonFactors, commonFactors)
      || !same(item.answer, { selectedValues: commonFactors })) {
      errors.push("G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH");
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
  });
}
