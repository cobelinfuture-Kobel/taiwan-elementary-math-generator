import {
  FULL_PRODUCT_SOURCE_UNITS as P01D1_SOURCE_UNITS,
  G5B_U05_FULL_PRODUCT_SOURCE_UNIT,
  getFullProductSourceUnit as getP01D1SourceUnit,
  listFullProductSourceUnits as listP01D1SourceUnits,
} from "./full-product-source-units-p01d1.js";

export { G5B_U05_FULL_PRODUCT_SOURCE_UNIT };

export const G6A_U01_FULL_PRODUCT_SOURCE_UNIT = Object.freeze({
  sourceId: "g6a_u01_6a01",
  grade: 6,
  semester: "upper",
  unitCode: "6A-U01",
  title: "最大公因數與最小公倍數",
  domain: "number_theory",
  lifecycle: "full_product_w1_vertical_slice",
});

export const FULL_PRODUCT_SOURCE_UNITS = Object.freeze([
  ...P01D1_SOURCE_UNITS,
  G6A_U01_FULL_PRODUCT_SOURCE_UNIT,
]);

const P01D2_SOURCE_BY_ID = new Map(FULL_PRODUCT_SOURCE_UNITS.map((unit) => [unit.sourceId, unit]));

export function listFullProductSourceUnits() {
  return [
    ...listP01D1SourceUnits(),
    { ...G6A_U01_FULL_PRODUCT_SOURCE_UNIT },
  ];
}

export function getFullProductSourceUnit(sourceId) {
  const p01d2 = P01D2_SOURCE_BY_ID.get(sourceId);
  if (p01d2) return { ...p01d2 };
  return getP01D1SourceUnit(sourceId);
}

export function isFullProductSourceId(sourceId) {
  return P01D2_SOURCE_BY_ID.has(sourceId) || Boolean(getP01D1SourceUnit(sourceId));
}
