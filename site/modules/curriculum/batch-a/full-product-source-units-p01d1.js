import {
  BATCH_A_SOURCE_UNITS,
  PUBLIC_CANDIDATE_SOURCE_UNITS,
} from "./source-units.js";

export const G5B_U05_FULL_PRODUCT_SOURCE_UNIT = Object.freeze({
  sourceId: "g5b_u05_5b05a",
  grade: 5,
  semester: "lower",
  unitCode: "5B-U05",
  title: "數的十進位結構與億以上的數",
  domain: "large_number_place_value",
  lifecycle: "full_product_w1_vertical_slice",
});

export const FULL_PRODUCT_SOURCE_UNITS = Object.freeze([
  G5B_U05_FULL_PRODUCT_SOURCE_UNIT,
]);

const ALL_FULL_PRODUCT_SOURCE_UNITS = Object.freeze([
  ...BATCH_A_SOURCE_UNITS,
  ...PUBLIC_CANDIDATE_SOURCE_UNITS,
  ...FULL_PRODUCT_SOURCE_UNITS,
]);
const FULL_PRODUCT_SOURCE_UNIT_BY_ID = new Map(
  ALL_FULL_PRODUCT_SOURCE_UNITS.map((unit) => [unit.sourceId, unit]),
);

export function listFullProductSourceUnits() {
  return ALL_FULL_PRODUCT_SOURCE_UNITS.map((unit) => ({ ...unit }));
}

export function getFullProductSourceUnit(sourceId) {
  const unit = FULL_PRODUCT_SOURCE_UNIT_BY_ID.get(sourceId) ?? null;
  return unit ? { ...unit } : null;
}

export function isFullProductSourceId(sourceId) {
  return FULL_PRODUCT_SOURCE_UNIT_BY_ID.has(sourceId);
}
