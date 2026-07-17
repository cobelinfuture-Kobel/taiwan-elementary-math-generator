const S106_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_order_and_symmetry",
  "ps_g5a_u02_missing_factor_reconstruction",
]);
const S106_PATTERN_SET = new Set(S106_PATTERN_IDS);

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

function factorPairsOf(target) {
  return factorsOf(target)
    .filter((value) => value <= target / value)
    .map((value) => [value, target / value]);
}

function targetFrom(rng) {
  return rng.int(2, 12) * rng.int(2, 12);
}

function searchStructure(target) {
  const searchEnd = Math.floor(Math.sqrt(target));
  const crossingBoundary = searchEnd + 1;
  const searchRows = Array.from({ length: crossingBoundary }, (_, index) => {
    const candidateFactor = index + 1;
    const isExact = target % candidateFactor === 0;
    return {
      candidateFactor,
      pairedFactor: isExact ? target / candidateFactor : null,
      product: isExact ? target : null,
      isExact,
      searchStatus: candidateFactor <= searchEnd ? "within_boundary" : "crossed_boundary",
    };
  });
  return {
    searchRows,
    searchEnd,
    crossingBoundary,
    factorPairs: factorPairsOf(target),
  };
}

function symmetryStructure(target) {
  const orderedFactors = factorsOf(target);
  const symmetricPairs = factorPairsOf(target);
  const outerToInnerLinks = symmetricPairs.map((pair, index) => ({
    pairOrder: index + 1,
    leftPosition: index + 1,
    rightPosition: orderedFactors.length - index,
    leftValue: pair[0],
    rightValue: pair[1],
    product: target,
    linkRole: pair[0] === pair[1] ? "square_midpoint" : "outer_to_inner_pair",
  }));
  return {
    orderedFactors,
    symmetricPairs,
    outerToInnerLinks,
    midpointPolicy: Number.isInteger(Math.sqrt(target))
      ? "single_square_root_center"
      : "none",
  };
}

function maskedStructure(target, rng) {
  const complete = factorsOf(target);
  const hiddenPosition = rng.int(0, complete.length - 1);
  const hiddenPositions = [hiddenPosition];
  const visibleValues = complete.map((value, index) => (
    hiddenPositions.includes(index) ? null : value
  ));
  const pairLinks = factorPairsOf(target).map((pair, index) => ({
    pairOrder: index + 1,
    leftPosition: index + 1,
    rightPosition: complete.length - index,
    product: target,
    linkRole: pair[0] === pair[1] ? "square_midpoint" : "symmetric_pair",
  }));
  return {
    visibleValues,
    hiddenPositions,
    pairLinks,
    solutionCount: 1,
    answer: {
      valuesByPosition: Object.fromEntries(
        hiddenPositions.map((position) => [position, complete[position]]),
      ),
    },
  };
}

export function isG5AU02S106Pattern(patternSpecId) {
  return S106_PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S106PatternIds() {
  return [...S106_PATTERN_IDS];
}

export function generateG5AU02S106Pattern(patternSpecId, rng) {
  if (!S106_PATTERN_SET.has(patternSpecId)) return null;
  const target = targetFrom(rng);

  if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
    const structure = searchStructure(target);
    return {
      data: { target, ...structure },
      prompt: `用乘法逐一檢查較小因數，列出乘積為 ${target} 的所有因數配對。`,
      answer: { pairs: clone(structure.factorPairs) },
    };
  }

  if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
    const structure = symmetryStructure(target);
    return {
      data: { target, ...structure },
      prompt: `依序整理 ${target} 的因數，並用 U 型方式連出外到內的對稱配對。`,
      answer: {
        factorList: clone(structure.orderedFactors),
        symmetricPairs: clone(structure.symmetricPairs),
      },
    };
  }

  const structure = maskedStructure(target, rng);
  return {
    data: {
      target,
      visibleValues: structure.visibleValues,
      hiddenPositions: structure.hiddenPositions,
      pairLinks: structure.pairLinks,
      solutionCount: structure.solutionCount,
    },
    prompt: `利用對稱位置相乘等於 ${target}，補回完整因數表中的缺漏值。`,
    answer: clone(structure.answer),
  };
}

export function expectedG5AU02S106Answer(item) {
  const { patternSpecId, data } = item ?? {};
  if (!S106_PATTERN_SET.has(patternSpecId)) {
    throw new Error(`G5AU02_S106_PATTERN_UNSUPPORTED:${patternSpecId ?? "missing"}`);
  }
  if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
    return { pairs: factorPairsOf(data.target) };
  }
  if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
    return {
      factorList: factorsOf(data.target),
      symmetricPairs: factorPairsOf(data.target),
    };
  }
  const complete = factorsOf(data.target);
  return {
    valuesByPosition: Object.fromEntries(
      (data.hiddenPositions ?? []).map((position) => [position, complete[position]]),
    ),
  };
}

export function validateG5AU02S106Pattern(item) {
  const errors = [];
  if (!item || !S106_PATTERN_SET.has(item.patternSpecId)) {
    return Object.freeze({ ok: false, errors: Object.freeze(["G5AU02_PATTERN_SPEC_ID_INVALID"]) });
  }
  const data = item.data ?? {};
  const target = data.target;
  if (!Number.isInteger(target) || target < 1 || target > 9999) {
    return Object.freeze({ ok: false, errors: Object.freeze(["G5AU02_TARGET_OUT_OF_RANGE"]) });
  }

  if (item.patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
    const expected = searchStructure(target);
    if (!Array.isArray(data.searchRows) || data.searchRows.length !== expected.searchRows.length) {
      errors.push("G5AU02_P1_FACTOR_PAIR_SEARCH_ROWS_INCOMPLETE");
    } else if (!same(data.searchRows, expected.searchRows)) {
      const boundaryOnly = data.searchRows.every((row, index) => {
        const canonical = expected.searchRows[index];
        return row?.candidateFactor === canonical.candidateFactor
          && row?.pairedFactor === canonical.pairedFactor
          && row?.product === canonical.product
          && row?.isExact === canonical.isExact;
      });
      errors.push(boundaryOnly
        ? "G5AU02_P1_FACTOR_PAIR_STOP_BOUNDARY_INVALID"
        : "G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH");
    }
    if (data.searchEnd !== expected.searchEnd || data.crossingBoundary !== expected.crossingBoundary) {
      errors.push("G5AU02_P1_FACTOR_PAIR_STOP_BOUNDARY_INVALID");
    }
    if (!same(data.factorPairs, expected.factorPairs)) {
      errors.push("G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
    const expected = symmetryStructure(target);
    if (!same(data.orderedFactors, expected.orderedFactors)) {
      errors.push("G5AU02_P1_FACTOR_SYMMETRY_ORDER_INVALID");
    }
    if (!same(data.symmetricPairs, expected.symmetricPairs)
      || !same(data.outerToInnerLinks, expected.outerToInnerLinks)) {
      errors.push("G5AU02_P1_U_RECORD_LINK_MISMATCH");
    }
    if (data.midpointPolicy !== expected.midpointPolicy) {
      errors.push("G5AU02_P1_FACTOR_SYMMETRY_MIDPOINT_INVALID");
    }
  }

  if (item.patternSpecId === "ps_g5a_u02_missing_factor_reconstruction") {
    const complete = factorsOf(target);
    const visible = data.visibleValues ?? [];
    const hiddenPositions = data.hiddenPositions ?? [];
    const nullPositions = visible
      .map((value, index) => value === null ? index : null)
      .filter((value) => value !== null);
    if (visible.length !== complete.length
      || visible.some((value, index) => value !== null && value !== complete[index])
      || !same(hiddenPositions, nullPositions)) {
      errors.push("G5AU02_P1_MASKED_FACTOR_TABLE_INCOMPLETE");
    }
    const expectedLinks = maskedStructure(target, { int: () => 0 }).pairLinks;
    if (!same(data.pairLinks, expectedLinks)) {
      errors.push("G5AU02_P1_PAIR_SYMMETRY_CUE_INVALID");
    }
    const expectedAnswer = {
      valuesByPosition: Object.fromEntries(
        hiddenPositions.map((position) => [position, complete[position]]),
      ),
    };
    if (data.solutionCount !== 1
      || hiddenPositions.length === 0
      || new Set(hiddenPositions).size !== hiddenPositions.length
      || !same(item.answer, expectedAnswer)) {
      errors.push("G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE");
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
  });
}
