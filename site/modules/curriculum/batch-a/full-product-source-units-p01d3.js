import {
  FULL_PRODUCT_SOURCE_UNITS as P01D2_SOURCE_UNITS,
  G6A_U01_FULL_PRODUCT_SOURCE_UNIT,
  getFullProductSourceUnit as getP01D2SourceUnit,
  listFullProductSourceUnits as listP01D2SourceUnits,
} from "./full-product-source-units-p01d2.js";

export { G6A_U01_FULL_PRODUCT_SOURCE_UNIT };

export const G5A_U03_FULL_PRODUCT_SOURCE_UNIT = Object.freeze({
  sourceId: "g5a_u03_5a03a",
  grade: 5,
  semester: "upper",
  unitCode: "5A-U03A",
  title: "倍數",
  domain: "factor_multiple",
  lifecycle: "full_product_w1_vertical_slice",
});

export const G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT = Object.freeze({
  sourceId: "g5a_u03_5a03a1",
  grade: 5,
  semester: "upper",
  unitCode: "5A-U03A1",
  title: "公倍數",
  domain: "factor_multiple",
  lifecycle: "full_product_w1_vertical_slice",
});

export const FULL_PRODUCT_SOURCE_UNITS = Object.freeze([
  ...P01D2_SOURCE_UNITS,
  G5A_U03_FULL_PRODUCT_SOURCE_UNIT,
  G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT,
]);

const P01D3_SOURCE_BY_ID = new Map(FULL_PRODUCT_SOURCE_UNITS.map((unit) => [unit.sourceId, unit]));

export function listFullProductSourceUnits() {
  return [
    ...listP01D2SourceUnits(),
    { ...G5A_U03_FULL_PRODUCT_SOURCE_UNIT },
    { ...G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT },
  ];
}

export function getFullProductSourceUnit(sourceId) {
  const p01d3 = P01D3_SOURCE_BY_ID.get(sourceId);
  if (p01d3) return { ...p01d3 };
  return getP01D2SourceUnit(sourceId);
}

export function isFullProductSourceId(sourceId) {
  return P01D3_SOURCE_BY_ID.has(sourceId) || Boolean(getP01D2SourceUnit(sourceId));
}
