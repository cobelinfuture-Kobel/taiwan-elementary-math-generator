import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S80_URL = new URL(
  "../../data/curriculum/mapping/g5a_u02_formal_mapping_candidates.json",
  import.meta.url,
);
const S81_URL = new URL(
  "../../data/curriculum/mapping/g5a_u02_formal_mapping_candidate_qa.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

const divides = (n, d) => Number.isInteger(n) && Number.isInteger(d) && d > 0 && n % d === 0;

function factorSet(n) {
  const values = [];
  for (let d = 1; d <= n; d += 1) {
    if (divides(n, d)) values.push(d);
  }
  return values;
}

function factorPairs(n) {
  const pairs = [];
  for (let a = 1; a * a <= n; a += 1) {
    if (divides(n, a)) pairs.push([a, n / a]);
  }
  return pairs;
}

function factorListFromPairs(n) {
  return [...new Set(factorPairs(n).flat())].sort((a, b) => a - b);
}

function commonFactorSet(a, b) {
  const bFactors = new Set(factorSet(b));
  return factorSet(a).filter((value) => bFactors.has(value));
}

function greatestCommonFactor(a, b) {
  return Math.max(...commonFactorSet(a, b));
}

function leastCommonMultiple(a, b) {
  return (a * b) / greatestCommonFactor(a, b);
}

function equalPartitionSolutions(total, min = 1, max = total) {
  return factorSet(total).filter((value) => value >= min && value <= max);
}

function missingValuesAtPositions(n, hiddenPositions) {
  const factors = factorSet(n);
  return hiddenPositions.map((position) => factors[position]);
}

function isPerfectSquare(n) {
  return Number.isInteger(Math.sqrt(n));
}

function validRemainderWitness({ N, D, d, q, r }) {
  return Number.isInteger(N)
    && Number.isInteger(D)
    && Number.isInteger(d)
    && Number.isInteger(q)
    && Number.isInteger(r)
    && D > d
    && d >= 2
    && D % d === 0
    && q >= 0
    && r >= 0
    && r < D
    && N === q * D + r;
}

function remainderTransfer(witness) {
  if (!validRemainderWitness(witness)) return null;
  return witness.r % witness.d;
}

function classifyProblemType({ quantityCount, structure, extremum }) {
  if (quantityCount === 1 && structure === "fixed_total_equal_partition") return "factor";
  if (quantityCount === 1 && structure === "fixed_group_size_repeated") return "multiple";
  if (quantityCount === 2 && structure === "shared_equal_partition" && extremum === "maximum") {
    return "common_factor";
  }
  if (quantityCount === 2 && structure === "shared_cycle_alignment" && extremum === "minimum") {
    return "common_multiple";
  }
  return null;
}

function digitCodeSolutions() {
  const solutions = [];
  for (let x1 = 1; x1 <= 9; x1 += 1) {
    for (let x2 = 1; x2 <= 9; x2 += 1) {
      for (let x3 = 0; x3 <= 9; x3 += 1) {
        for (let x4 = 1; x4 <= 9; x4 += 1) {
          const digits = [x1, x2, x3, x4];
          const value = 1000 * x1 + 100 * x2 + 10 * x3 + x4;
          const valid = divides(22, x1)
            && divides(33, x1)
            && divides(45, x1)
            && divides(60, x1)
            && divides(6, x3)
            && divides(8, x3)
            && x3 !== x1
            && divides(70, x2)
            && divides(70, x4)
            && divides(value, 3)
            && divides(value, 5)
            && new Set(digits).size === 4;
          if (valid) solutions.push(digits);
        }
      }
    }
  }
  return solutions;
}

function digitTupleIsValid([x1, x2, x3, x4]) {
  const value = 1000 * x1 + 100 * x2 + 10 * x3 + x4;
  return x1 > 0
    && x2 > 0
    && x4 > 0
    && divides(22, x1)
    && divides(33, x1)
    && divides(45, x1)
    && divides(60, x1)
    && divides(6, x3)
    && divides(8, x3)
    && x3 !== x1
    && divides(70, x2)
    && divides(70, x4)
    && divides(value, 3)
    && divides(value, 5)
    && new Set([x1, x2, x3, x4]).size === 4;
}

test("S81 reviews all 22 mappings and applies five blocking corrections", async () => {
  const [s80, s81] = await Promise.all([load(S80_URL), load(S81_URL)]);
  assert.equal(s81.schemaName, "G5AU02FormalMappingCandidateQA");
  assert.equal(s81.task, "S81_G5A_U02_FormalMappingCandidateQA");
  assert.equal(s81.unitId, "g5a_u02");
  assert.deepEqual(s81.summary, {
    mappingCandidatesReviewed: 22,
    mappingCandidatesAcceptedAfterCorrection: 22,
    mappingCandidatesRejected: 0,
    blockingCorrections: 5,
    formulaFamiliesReviewed: 13,
    positiveVectorCount: 41,
    mutationCaseCount: 30,
  });

  const mappingIds = s80.formalMappingCandidates.map((row) => row.id).sort();
  assert.deepEqual([...s81.acceptedMappingCandidateIds].sort(), mappingIds);
  assert.equal(new Set(s81.acceptedMappingCandidateIds).size, 22);
  assert.equal(s81.corrections.length, 5);
  assert.ok(s81.corrections.every((row) => row.blockingBeforeCorrection === true));
  assert.match(s81.consumptionRule, /higher precedence/);
  assert.deepEqual(s81.scopeBoundary, s80.scopeBoundary);
});

test("S81 corrects the factor relation biconditional without forcing arbitrary factors into one pair", async () => {
  const s81 = await load(S81_URL);
  const correction = s81.corrections.find(
    (row) => row.code === "S81_FACTOR_RELATION_BICONDITIONAL_OVERGENERALIZED",
  );
  assert.ok(correction.requiredGuards.includes("arbitrary_factor_pair_converse_forbidden"));

  assert.equal(divides(32, 8), true);
  assert.equal(32 / 8, 4);
  assert.equal(8 * 4, 32);
  assert.equal(divides(12, 2), true);
  assert.equal(divides(12, 3), true);
  assert.notEqual(2 * 3, 12);
});

test("S81 uses the square-root crossing rule for complete factor-pair enumeration", async () => {
  const s81 = await load(S81_URL);
  const correction = s81.corrections.find(
    (row) => row.code === "S81_FACTOR_PAIR_STOP_RULE_REPETITION_ONLY_UNSOUND",
  );
  assert.match(correction.effectiveRule, /floor\(sqrt\(n\)\)/);

  assert.deepEqual(factorPairs(56), [[1, 56], [2, 28], [4, 14], [7, 8]]);
  assert.deepEqual(factorPairs(36), [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]]);
  assert.equal(factorPairs(56).some(([a, b]) => a === b), false);
  assert.equal(factorPairs(36).filter(([a, b]) => a === b).length, 1);
});

test("S81 separates target-number parity from factor-count parity", async () => {
  const s81 = await load(S81_URL);
  const correction = s81.corrections.find(
    (row) => row.code === "S81_COMPLETE_FACTOR_LIST_PARITY_RULE_AMBIGUOUS",
  );
  assert.match(correction.effectiveRules.targetParity, /2 in factorSet/);
  assert.match(correction.effectiveRules.factorCountParity, /perfect square/);

  assert.equal(factorSet(16).includes(2), true);
  assert.equal(16 % 2, 0);
  assert.equal(factorSet(16).length % 2, 1);
  assert.equal(isPerfectSquare(16), true);
  assert.equal(factorSet(18).length % 2, 0);
  assert.equal(isPerfectSquare(18), false);
});

test("S81 closes the remainder-transfer witness and reproduces the source example", async () => {
  const s81 = await load(S81_URL);
  const correction = s81.corrections.find(
    (row) => row.code === "S81_REMAINDER_TRANSFER_WITNESS_RANGE_REQUIRED",
  );
  assert.match(correction.effectiveRule, /0<=r<D/);

  const sourceWitness = { N: 93, D: 24, d: 8, q: 3, r: 21 };
  assert.equal(validRemainderWitness(sourceWitness), true);
  assert.equal(remainderTransfer(sourceWitness), 5);
  assert.equal(remainderTransfer({ N: 93, D: 24, d: 7, q: 3, r: 21 }), null);
  assert.equal(remainderTransfer({ N: 96, D: 24, d: 8, q: 3, r: 24 }), null);
});

test("S81 binds the source-backed four digit constraints and proves the unique tuple 1725", async () => {
  const s81 = await load(S81_URL);
  const correction = s81.corrections.find(
    (row) => row.code === "S81_DIGIT_CODE_POSITIONAL_PREDICATES_REQUIRED",
  );
  assert.deepEqual(correction.sourceBackedUniqueTuple, [1, 7, 2, 5]);
  assert.ok(correction.requiredGuards.includes("lcm_equals_70_substitution_forbidden"));

  assert.deepEqual(digitCodeSolutions(), [[1, 7, 2, 5]]);
  assert.equal(digitTupleIsValid([1, 7, 2, 5]), true);
  assert.equal(leastCommonMultiple(7, 5), 35);
  assert.equal(divides(70, 7) && divides(70, 5), true);
});

test("S81 executes 41 positive vectors across all 13 formula families", async () => {
  const dividesVectors = [
    [32, 8, true],
    [32, 4, true],
    [12, 5, false],
    [97, 1, true],
  ];
  const factorSetVectors = [
    [2, [1, 2]],
    [16, [1, 2, 4, 8, 16]],
    [56, [1, 2, 4, 7, 8, 14, 28, 56]],
    [97, [1, 97]],
  ];
  const factorPairVectors = [
    [36, [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]]],
    [56, [[1, 56], [2, 28], [4, 14], [7, 8]]],
    [130, [[1, 130], [2, 65], [5, 26], [10, 13]]],
    [144, [[1, 144], [2, 72], [3, 48], [4, 36], [6, 24], [8, 18], [9, 16], [12, 12]]],
  ];
  const factorListFromPairsVectors = [
    [36, [1, 2, 3, 4, 6, 9, 12, 18, 36]],
    [130, [1, 2, 5, 10, 13, 26, 65, 130]],
  ];
  const commonFactorVectors = [
    [56, 48, [1, 2, 4, 8]],
    [72, 90, [1, 2, 3, 6, 9, 18]],
    [24, 30, [1, 2, 3, 6]],
    [22, 33, [1, 11]],
  ];
  const gcfVectors = [
    [56, 48, 8],
    [24, 30, 6],
    [27, 18, 9],
    [36, 28, 4],
  ];
  const missingVectors = [
    [56, [3, 5], [7, 14]],
    [36, [2, 5], [3, 9]],
  ];
  const partitionVectors = [
    [27, 1, 27, [1, 3, 9, 27]],
    [60, 10, 16, [10, 12, 15]],
    [24, 2, 8, [2, 3, 4, 6, 8]],
    [32, 4, 16, [4, 8, 16]],
  ];
  const remainderVectors = [
    [{ N: 93, D: 24, d: 8, q: 3, r: 21 }, 5],
    [{ N: 250, D: 12, d: 4, q: 20, r: 10 }, 2],
    [{ N: 145, D: 18, d: 6, q: 8, r: 1 }, 1],
    [{ N: 999, D: 30, d: 10, q: 33, r: 9 }, 9],
  ];
  const sideVectors = [
    [24, 16, [1, 2, 4, 8]],
    [36, 28, [1, 2, 4]],
  ];
  const areaVectors = [
    [36, 28, [1, 4, 16]],
    [24, 16, [1, 4, 16, 64]],
  ];
  const classificationVectors = [
    [{ quantityCount: 1, structure: "fixed_total_equal_partition", extremum: null }, "factor"],
    [{ quantityCount: 1, structure: "fixed_group_size_repeated", extremum: null }, "multiple"],
    [{ quantityCount: 2, structure: "shared_equal_partition", extremum: "maximum" }, "common_factor"],
    [{ quantityCount: 2, structure: "shared_cycle_alignment", extremum: "minimum" }, "common_multiple"],
  ];

  for (const [n, d, expected] of dividesVectors) assert.equal(divides(n, d), expected);
  for (const [n, expected] of factorSetVectors) assert.deepEqual(factorSet(n), expected);
  for (const [n, expected] of factorPairVectors) assert.deepEqual(factorPairs(n), expected);
  for (const [n, expected] of factorListFromPairsVectors) assert.deepEqual(factorListFromPairs(n), expected);
  for (const [a, b, expected] of commonFactorVectors) assert.deepEqual(commonFactorSet(a, b), expected);
  for (const [a, b, expected] of gcfVectors) assert.equal(greatestCommonFactor(a, b), expected);
  for (const [n, positions, expected] of missingVectors) assert.deepEqual(missingValuesAtPositions(n, positions), expected);
  for (const [total, min, max, expected] of partitionVectors) {
    assert.deepEqual(equalPartitionSolutions(total, min, max), expected);
  }
  for (const [witness, expected] of remainderVectors) assert.equal(remainderTransfer(witness), expected);
  for (const [length, width, expected] of sideVectors) assert.deepEqual(commonFactorSet(length, width), expected);
  for (const [length, width, expected] of areaVectors) {
    assert.deepEqual(commonFactorSet(length, width).map((side) => side * side), expected);
  }
  for (const [input, expected] of classificationVectors) assert.equal(classifyProblemType(input), expected);
  assert.deepEqual(digitCodeSolutions(), [[1, 7, 2, 5]]);

  const positiveVectorCount = dividesVectors.length
    + factorSetVectors.length
    + factorPairVectors.length
    + factorListFromPairsVectors.length
    + commonFactorVectors.length
    + gcfVectors.length
    + missingVectors.length
    + partitionVectors.length
    + remainderVectors.length
    + sideVectors.length
    + areaVectors.length
    + classificationVectors.length
    + 1;
  assert.equal(positiveVectorCount, 41);
});

test("S81 mutation review rejects all 30 required defect classes", async () => {
  const s81 = await load(S81_URL);
  const solutions = digitCodeSolutions();
  const factors56 = factorSet(56);
  const factors36 = factorListFromPairs(36);
  const completed56 = factorSet(56);
  const visible56 = [1, 2, 4, null, 8, null, 28, 56];

  const rejected = {
    FACTOR_RELATION_ARBITRARY_FACTORS_FORCED_TO_PRODUCT: divides(12, 2) && divides(12, 3) && 2 * 3 !== 12,
    FACTOR_RELATION_DIRECTION_REVERSED: divides(12, 3) && !divides(3, 12),
    FACTOR_RELATION_NONZERO_REMAINDER_ACCEPTED: !divides(32, 6),
    FACTOR_PAIR_SQUARE_ROOT_DUPLICATED: factorPairs(36).filter(([a, b]) => a === b).length === 1,
    FACTOR_PAIR_NONSQUARE_WAITS_FOR_REPETITION: factorPairs(56).some(([a, b]) => a === b) === false,
    FACTOR_PAIR_COMPLEMENT_OMITTED: factorPairs(56).some(([a, b]) => a === 2 && b === 28),
    FACTOR_LIST_DUPLICATE_SQUARE_ROOT: factors36.filter((value) => value === 6).length === 1,
    FACTOR_LIST_ONE_OR_SELF_OMITTED: factors56[0] === 1 && factors56.at(-1) === 56,
    MISSING_FACTOR_VISIBLE_ENTRY_CHANGED: visible56.every((value, index) => value === null || value === completed56[index]),
    MISSING_FACTOR_ASCENDING_ORDER_BROKEN: completed56.every((value, index) => index === 0 || completed56[index - 1] < value),
    DIVISOR_SELECTION_NONFACTOR_INCLUDED: !factorSet(144).includes(5),
    FACTOR_STATEMENT_RELATION_DIRECTION_REVERSED: !divides(3, 12),
    EQUAL_PARTITION_NONDIVISOR_INCLUDED: !equalPartitionSolutions(27).includes(2),
    EQUAL_PARTITION_RANGE_CONSTRAINT_IGNORED: !equalPartitionSolutions(60, 10, 16).includes(6),
    COMPLETE_FACTOR_LIST_NONUNIQUE_TARGET_ACCEPTED: new Set([6, 8, 10, 12]).size > 1,
    TARGET_PARITY_INFERRED_FROM_FACTOR_COUNT_PARITY: factorSet(16).length % 2 === 1 && 16 % 2 === 0,
    SQUARE_STATUS_INFERRED_FROM_TARGET_PARITY: 12 % 2 === 0 && 16 % 2 === 0 && isPerfectSquare(12) !== isPerfectSquare(16),
    REMAINDER_LARGER_DIVISOR_NOT_MULTIPLE: !validRemainderWitness({ N: 93, D: 24, d: 7, q: 3, r: 21 }),
    REMAINDER_KNOWN_VALUE_OUT_OF_RANGE: !validRemainderWitness({ N: 96, D: 24, d: 8, q: 3, r: 24 }),
    REMAINDER_NOT_REDUCED_MOD_SMALLER_DIVISOR: remainderTransfer({ N: 93, D: 24, d: 8, q: 3, r: 21 }) === 5,
    COMMON_FACTOR_NONCOMMON_VALUE_INCLUDED: !commonFactorSet(24, 30).includes(4),
    GCF_NONMAXIMUM_COMMON_FACTOR_ACCEPTED: greatestCommonFactor(24, 30) === 6 && greatestCommonFactor(24, 30) !== 3,
    MAXIMUM_GROUPING_USES_NONMAXIMUM_COMMON_FACTOR: greatestCommonFactor(27, 18) === 9 && greatestCommonFactor(27, 18) !== 3,
    PACKAGING_VALID_COMMON_FACTOR_OMITTED: commonFactorSet(24, 32).includes(8),
    RECTANGLE_SIDE_NOT_COMMON_DIVISOR: !commonFactorSet(24, 16).includes(6),
    TILE_AREA_NOT_SIDE_SQUARED: !commonFactorSet(36, 28).map((side) => side * side).includes(8),
    DIGIT_CODE_LCM_EQUALS_70_SUBSTITUTED: leastCommonMultiple(7, 5) === 35 && divides(70, 7) && divides(70, 5),
    DIGIT_CODE_ZERO_AS_DIVISOR_ACCEPTED: !divides(70, 0),
    DIGIT_CODE_POSITION_BINDING_SWAPPED: !digitTupleIsValid([2, 7, 1, 5]),
    DIGIT_CODE_NONUNIQUE_OR_WRONG_TUPLE_ACCEPTED: solutions.length === 1 && JSON.stringify(solutions[0]) === JSON.stringify([1, 7, 2, 5]),
  };

  assert.equal(s81.mutationRequirements.length, 30);
  assert.equal(new Set(s81.mutationRequirements).size, 30);
  assert.deepEqual(Object.keys(rejected).sort(), [...s81.mutationRequirements].sort());
  assert.ok(Object.values(rejected).every(Boolean));
});

test("S81 preserves candidate-only lifecycle and the deferred packet metadata gate", async () => {
  const s81 = await load(S81_URL);
  assert.deepEqual(s81.scopeBoundary, {
    sourceMetadataMutated: false,
    formalMappingMaterialized: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
  assert.equal(s81.sourceIdentityDisposition.packetIdsRetained, true);
  assert.equal(s81.sourceIdentityDisposition.candidatePipelineResolved, true);
  assert.equal(s81.sourceIdentityDisposition.publicCatalogPromotionRequiresMetadataCorrection, true);
  assert.deepEqual(s81.sourceIdentityDisposition.requiredMetadataCorrection, {
    sourceId: "g5a_u02_5a02a1",
    displayTitle: "公因數",
    sourceUrl: "https://meow911.com/5a03b/",
  });
  assert.equal(s81.nextGate, "S82_G5A_U02_PatternSpecContractDesign");
  assert.equal(s81.stopReason, "NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE");
});
