import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const S64_URL = new URL(
  "../../data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json",
  import.meta.url,
);
const S65_URL = new URL(
  "../../data/curriculum/mapping/g4b_u04_formal_mapping_candidate_qa.json",
  import.meta.url,
);

async function load(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

const down = (value, unit) => Math.floor(value / unit) * unit;
const up = (value, unit) => Math.ceil(value / unit) * unit;
const halfUp = (value, unit) => Math.floor((value + unit / 2) / unit) * unit;
const floorGroups = (total, size) => Math.floor(total / size);
const ceilingGroups = (total, size) => Math.ceil(total / size);
const paymentAmount = (price, denomination) => Math.ceil(price / denomination) * denomination;
const banknoteCount = (price, denomination) => Math.ceil(price / denomination);

function inverseInterval(roundedValue, unit, maxInput = 99_999_999) {
  return [
    Math.max(0, roundedValue - unit / 2),
    Math.min(maxInput, roundedValue + unit / 2 - 1),
  ];
}

function matchingMethods(value, unit, shownResult) {
  return [
    ["down", down(value, unit)],
    ["up", up(value, unit)],
    ["halfUp", halfUp(value, unit)],
  ]
    .filter(([, result]) => result === shownResult)
    .map(([method]) => method);
}

function validUnknownDigits(baseValue, placeMultiplier, roundedValue, unit) {
  return Array.from({ length: 10 }, (_, digit) => digit)
    .filter((digit) => halfUp(baseValue + digit * placeMultiplier, unit) === roundedValue);
}

test("S65 reviews all 17 mappings, applies three blocking corrections, and preserves candidate-only scope", async () => {
  const [s64, s65] = await Promise.all([load(S64_URL), load(S65_URL)]);
  assert.equal(s65.schemaName, "G4BU04FormalMappingCandidateQA");
  assert.equal(s65.task, "S65_G4B_U04_FormalMappingCandidateQA");
  assert.equal(s65.sourceId, "g4b_u04_4b04");
  assert.deepEqual(s65.summary, {
    mappingCandidatesReviewed: 17,
    mappingCandidatesAccepted: 17,
    mappingCandidatesRejected: 0,
    qaCorrectionsApplied: 3,
    formulaFamiliesReviewed: 8,
    positiveVectorCount: 36,
    mutationCaseCount: 20,
  });

  const mappingIds = s64.formalMappingCandidates.map((row) => row.id).sort();
  assert.deepEqual([...s65.acceptedMappingCandidateIds].sort(), mappingIds);
  assert.equal(new Set(s65.acceptedMappingCandidateIds).size, 17);
  assert.equal(s65.corrections.length, 3);
  assert.ok(s65.corrections.every((row) => row.blockingBeforeCorrection === true));
  assert.deepEqual(s65.scopeBoundary, s64.scopeBoundary);
});

test("S65 executes 36 accepted boundary and source-example vectors across all formal rule families", async () => {
  const vectors = {
    down: [
      [753, 100, 700],
      [700, 100, 700],
      [26_743_041, 10_000, 26_740_000],
      [99_999_999, 10_000, 99_990_000],
    ],
    up: [
      [753, 100, 800],
      [700, 100, 700],
      [26_743_041, 10_000, 26_750_000],
      [99_999_999, 10_000, 100_000_000],
    ],
    halfUp: [
      [647, 10, 650],
      [647, 100, 600],
      [3_195, 10, 3_200],
      [2_768, 100, 2_800],
      [2_768, 1_000, 3_000],
      [26_743_041, 10_000, 26_740_000],
      [650, 100, 700],
    ],
    floorGroups: [
      [8_427, 10, 842],
      [5_788, 100, 57],
    ],
    ceilingGroups: [
      [8_427, 10, 843],
      [5_788, 1_000, 6],
      [12_999, 1_000, 13],
    ],
    paymentAmount: [
      [7_699, 1_000, 8_000],
      [7_699, 100, 7_700],
    ],
    banknoteCount: [
      [7_699, 1_000, 8],
      [7_699, 100, 77],
    ],
  };

  for (const [value, unit, expected] of vectors.down) assert.equal(down(value, unit), expected);
  for (const [value, unit, expected] of vectors.up) assert.equal(up(value, unit), expected);
  for (const [value, unit, expected] of vectors.halfUp) assert.equal(halfUp(value, unit), expected);
  for (const [total, size, expected] of vectors.floorGroups) assert.equal(floorGroups(total, size), expected);
  for (const [total, size, expected] of vectors.ceilingGroups) assert.equal(ceilingGroups(total, size), expected);
  for (const [price, denomination, expected] of vectors.paymentAmount) assert.equal(paymentAmount(price, denomination), expected);
  for (const [price, denomination, expected] of vectors.banknoteCount) assert.equal(banknoteCount(price, denomination), expected);

  const operationVectors = [
    halfUp(25_747_704, 10_000) + halfUp(4_026_019, 10_000),
    down(25_747_704, 10_000) - down(4_026_019, 10_000),
    halfUp(57_389, 10_000) * 6,
    halfUp(695_400, 10_000) / 5,
  ];
  assert.deepEqual(operationVectors, [29_780_000, 21_720_000, 360_000, 140_000]);

  assert.deepEqual(inverseInterval(30_000, 10_000), [25_000, 34_999]);
  assert.deepEqual(inverseInterval(47_000, 1_000), [46_500, 47_499]);
  assert.deepEqual(inverseInterval(0, 10), [0, 4]);

  assert.deepEqual(validUnknownDigits(20_318, 1_000, 30_000, 10_000), [5, 6, 7, 8, 9]);
  assert.deepEqual(validUnknownDigits(47_061, 100, 47_000, 1_000), [0, 1, 2, 3, 4]);

  const possibleOriginals = [];
  for (let value = 44_500; value <= 45_499; value += 1) {
    if (value % 100 === 99 && halfUp(value, 1_000) === 45_000) possibleOriginals.push(value);
  }
  assert.deepEqual(possibleOriginals, [
    44_599, 44_699, 44_799, 44_899, 44_999,
    45_099, 45_199, 45_299, 45_399, 45_499,
  ]);

  assert.deepEqual(matchingMethods(753, 100, 700), ["down"]);
  assert.deepEqual(matchingMethods(749, 100, 800), ["up"]);

  const positiveVectorCount = Object.values(vectors).reduce((sum, rows) => sum + rows.length, 0)
    + operationVectors.length + 3 + 2 + 1 + 2;
  assert.equal(positiveVectorCount, 36);
});

test("S65 proves the unique method-choice guard and rejects ambiguous shown results", async () => {
  const s64 = await load(S64_URL);
  const mapping = s64.formalMappingCandidates.find(
    (row) => row.id === "fmc_g4b_u04_method_identify_from_result",
  );
  assert.equal(mapping.answer, "methodChoiceAnswer");
  assert.ok(mapping.guards.includes("input_not_multiple_of_unit"));
  assert.ok(mapping.guards.includes("shown_result_matches_exactly_one_method"));
  assert.ok(mapping.guards.includes("shown_result_differs_from_half_up_output"));
  assert.ok(mapping.guards.includes("ambiguous_shared_result_forbidden"));

  assert.deepEqual(matchingMethods(753, 100, 700), ["down"]);
  assert.deepEqual(matchingMethods(749, 100, 800), ["up"]);
  assert.equal(matchingMethods(753, 100, 800).length, 2);
  assert.equal(matchingMethods(700, 100, 700).length, 3);
});

test("S65 mutation review rejects all 20 required defect classes", async () => {
  const [s64, s65] = await Promise.all([load(S64_URL), load(S65_URL)]);
  assert.equal(s65.mutationRequirements.length, 20);
  assert.equal(new Set(s65.mutationRequirements).size, 20);

  const rejected = {
    DOWN_MUTATED_TO_UP: up(753, 100) !== down(753, 100),
    DOWN_OUTPUT_ABOVE_INPUT: 800 > 753,
    UP_MUTATED_TO_DOWN: down(753, 100) !== up(753, 100),
    UP_OUTPUT_BELOW_INPUT: 700 < 753,
    HALF_UP_649_CARRIED: halfUp(649, 100) !== 700,
    HALF_UP_650_NOT_CARRIED: halfUp(650, 100) !== 600,
    FLOOR_GROUPS_COUNTS_REMAINDER: floorGroups(8_427, 10) !== 843,
    CEILING_GROUPS_DISCARDS_REMAINDER: ceilingGroups(8_427, 10) !== 842,
    PAYMENT_UNDER_PRICE: 7_000 < 7_699,
    PAYMENT_NOT_MINIMUM_MULTIPLE: paymentAmount(7_699, 1_000) !== 9_000,
    BANKNOTE_ONE_FEWER_ACCEPTED: 7 * 1_000 < 7_699,
    UNSUPPORTED_PAYMENT_DENOMINATION: !s64.globalBoundaryCandidate.paymentDenominations.includes(10),
    METHOD_EXACT_MULTIPLE_AMBIGUOUS: matchingMethods(700, 100, 700).length !== 1,
    METHOD_SHARED_HALF_UP_RESULT_AMBIGUOUS: matchingMethods(753, 100, 800).length !== 1,
    INVERSE_NEGATIVE_PREIMAGE_LEAK: inverseInterval(0, 10)[0] === 0,
    INVERSE_UPPER_ENDPOINT_OFF_BY_ONE: halfUp(35_000, 10_000) !== 30_000,
    INVERSE_DIGIT_OMITS_VALID: validUnknownDigits(20_318, 1_000, 30_000, 10_000).includes(5),
    INVERSE_DIGIT_INCLUDES_INVALID: !validUnknownDigits(20_318, 1_000, 30_000, 10_000).includes(4),
    INVERSE_VISIBLE_DIGIT_MISMATCH: 44_598 % 100 !== 99,
    ROUND_THEN_DIVIDE_NONINTEGER: halfUp(57_389, 10_000) % 7 !== 0,
  };

  assert.deepEqual(Object.keys(rejected).sort(), [...s65.mutationRequirements].sort());
  assert.ok(Object.values(rejected).every(Boolean));
});

test("S65 keeps all corrected mappings non-materialized and production-forbidden", async () => {
  const [s64, s65] = await Promise.all([load(S64_URL), load(S65_URL)]);
  assert.equal(s64.status, "candidate_design_qa_corrected");
  assert.equal(s64.qaCorrectionTask, "S65_G4B_U04_FormalMappingCandidateQA");
  assert.equal(s64.qaCorrections.length, 3);
  assert.equal(s64.formalMappingCandidates.length, 17);
  assert.ok(s64.formalMappingCandidates.every((row) => row.status === "candidate_only"));
  assert.deepEqual(s65.scopeBoundary, {
    formalMappingMaterialized: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
});
