import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-g4a-u02-extension.js";

export const G4A_U04_SOURCE_ID = "g4a_u04_4a04";
export const G4A_U04_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_exact",
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
  "ps_g4a_u04_division_check_with_remainder"
]);

function divisionDefinition({ patternSpecId, title, kind = "g4aU04LongDivision", dividendDigits, divisorDigits, quotientStartPlace, firstPlaceCase, divisorSet = null, coverageCases = [] }) {
  return Object.freeze({
    patternSpecId,
    sourceId: G4A_U04_SOURCE_ID,
    title,
    kind,
    dividendDigits,
    divisorDigits,
    quotientStartPlace,
    firstPlaceCase,
    divisorSet: divisorSet ? Object.freeze([...divisorSet]) : null,
    coverageCases: Object.freeze([...coverageCases]),
    answerModel: Object.freeze({ shape: "quotient_remainder", fields: Object.freeze(["quotient", "remainder"]) }),
    canonicalSkillIds: Object.freeze(["integer_division_remainder"]),
    skillTags: Object.freeze(["integer_division", "division_with_remainder", firstPlaceCase]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", "g4a_u04_division"])
  });
}

const definitions = Object.freeze({
  ps_g4a_u04_4digit_by_1digit_thousands_sufficient: divisionDefinition({
    patternSpecId: "ps_g4a_u04_4digit_by_1digit_thousands_sufficient",
    title: "4位數除以1位數：千位夠除",
    dividendDigits: 4,
    divisorDigits: 1,
    quotientStartPlace: "thousands",
    firstPlaceCase: "thousands_sufficient",
    coverageCases: ["remainder_zero", "remainder_nonzero", "quotient_zero_in_middle"]
  }),
  ps_g4a_u04_4digit_by_1digit_thousands_insufficient: divisionDefinition({
    patternSpecId: "ps_g4a_u04_4digit_by_1digit_thousands_insufficient",
    title: "4位數除以1位數：千位不夠除",
    dividendDigits: 4,
    divisorDigits: 1,
    quotientStartPlace: "hundreds",
    firstPlaceCase: "thousands_insufficient",
    coverageCases: ["remainder_zero", "remainder_nonzero", "quotient_zero_in_middle"]
  }),
  ps_g4a_u04_4digit_by_1digit_thousands_exact: divisionDefinition({
    patternSpecId: "ps_g4a_u04_4digit_by_1digit_thousands_exact",
    title: "4位數除以1位數：千位整除",
    dividendDigits: 4,
    divisorDigits: 1,
    quotientStartPlace: "thousands",
    firstPlaceCase: "thousands_exact",
    coverageCases: ["next_digit_zero", "remainder_zero", "remainder_nonzero", "quotient_zero_in_middle"]
  }),
  ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor: divisionDefinition({
    patternSpecId: "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
    title: "2位數除以2位數：除數是10的倍數",
    dividendDigits: 2,
    divisorDigits: 2,
    quotientStartPlace: "ones",
    firstPlaceCase: "ten_multiple_divisor",
    divisorSet: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    coverageCases: ["remainder_zero", "remainder_nonzero", "divisor_10_multiple"]
  }),
  ps_g4a_u04_3digit_by_2digit_tens_sufficient: divisionDefinition({
    patternSpecId: "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
    title: "3位數除以2位數：十位夠除",
    dividendDigits: 3,
    divisorDigits: 2,
    quotientStartPlace: "tens",
    firstPlaceCase: "tens_sufficient",
    coverageCases: ["remainder_zero", "remainder_nonzero", "quotient_zero_in_middle"]
  }),
  ps_g4a_u04_3digit_by_2digit_tens_insufficient: divisionDefinition({
    patternSpecId: "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
    title: "3位數除以2位數：十位不夠除",
    dividendDigits: 3,
    divisorDigits: 2,
    quotientStartPlace: "ones",
    firstPlaceCase: "tens_insufficient",
    coverageCases: ["remainder_zero", "remainder_nonzero"]
  }),
  ps_g4a_u04_division_check_with_remainder: Object.freeze({
    patternSpecId: "ps_g4a_u04_division_check_with_remainder",
    sourceId: G4A_U04_SOURCE_ID,
    title: "除法驗算：有餘數",
    kind: "g4aU04DivisionCheckWithRemainder",
    quotientStartPlace: "not_applicable",
    firstPlaceCase: "division_check_with_remainder",
    coverageCases: Object.freeze(["remainder_nonzero"]),
    answerModel: Object.freeze({ shape: "verification_equation", fields: Object.freeze(["divisor", "quotient", "remainder", "dividend"]) }),
    canonicalSkillIds: Object.freeze(["division_check", "integer_division_remainder"]),
    skillTags: Object.freeze(["division_check", "division_with_remainder", "verification"]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", "g4a_u04_division_check"])
  })
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const baseIds = baseGetPatternIds(sourceId);
  if (sourceId === G4A_U04_SOURCE_ID) return [...baseIds, ...G4A_U04_PATTERN_SPEC_IDS];
  return baseIds;
}
