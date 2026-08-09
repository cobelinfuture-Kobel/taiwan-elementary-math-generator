export const BATCH_A_SOURCE_UNITS = Object.freeze([
  { sourceId: "g3a_u01_3a01", grade: 3, semester: "upper", unitCode: "3A-U01", title: "10000以內的數", domain: "number_sense" },
  { sourceId: "g3a_u02_3a02", grade: 3, semester: "upper", unitCode: "3A-U02", title: "四位數的加減", domain: "integer_expression" },
  { sourceId: "g3a_u03_3a03", grade: 3, semester: "upper", unitCode: "3A-U03", title: "乘法", domain: "integer_expression" },
  { sourceId: "g3a_u06_3a06", grade: 3, semester: "upper", unitCode: "3A-U06", title: "二位數除以一位數", domain: "integer_expression" },
  { sourceId: "g3b_u01_3b01", grade: 3, semester: "lower", unitCode: "3B-U01", title: "除法", domain: "integer_expression" },
  { sourceId: "g3b_u04_3b04", grade: 3, semester: "lower", unitCode: "3B-U04", title: "兩步驟計算", domain: "integer_expression" },
  { sourceId: "g3b_u08_3b08", grade: 3, semester: "lower", unitCode: "3B-U08", title: "乘法與除法", domain: "integer_expression" },
  { sourceId: "g4a_u01_4a01", grade: 4, semester: "upper", unitCode: "4A-U01", title: "1億以內的數", domain: "number_sense" },
  { sourceId: "g4a_u02_4a02", grade: 4, semester: "upper", unitCode: "4A-U02", title: "整數的乘法", domain: "integer_expression" },
  { sourceId: "g4a_u04_4a04", grade: 4, semester: "upper", unitCode: "4A-U04", title: "整數的除法", domain: "integer_expression" },
  { sourceId: "g4a_u08_4a08", grade: 4, semester: "upper", unitCode: "4A-U08", title: "整數四則", domain: "integer_mixed_operations" },
  { sourceId: "g4b_u01_4b01", grade: 4, semester: "lower", unitCode: "4B-U01", title: "多位數的乘與除", domain: "integer_expression" },
  { sourceId: "g5a_u08_5a08", grade: 5, semester: "upper", unitCode: "5A-U08", title: "整數四則", domain: "integer_mixed_operations" }
]);
export const PUBLIC_CANDIDATE_SOURCE_UNITS = Object.freeze([
  Object.freeze({ sourceId: "g4b_u04_4b04", grade: 4, semester: "lower", unitCode: "4B-U04", title: "概數", domain: "number_sense", lifecycle: "public_canonical_specialized_release" }),
  Object.freeze({ sourceId: "g5a_u02_5a02", grade: 5, semester: "upper", unitCode: "5A-U02", title: "因數與公因數", domain: "factors_common_factors", lifecycle: "public_canonical_static_release" })
]);
export const W1_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([
  Object.freeze({ sourceId: "g5b_u05_5b05a", grade: 5, semester: "lower", unitCode: "5B-U05", title: "億以上的數", domain: "large_number_place_value", lifecycle: "public_full_product_w1_release" }),
  Object.freeze({ sourceId: "g5a_u03_5a03a", grade: 5, semester: "upper", unitCode: "5A-U03A", title: "倍數", domain: "factor_multiple", lifecycle: "public_full_product_w1_release" }),
  Object.freeze({ sourceId: "g5a_u03_5a03a1", grade: 5, semester: "upper", unitCode: "5A-U03A1", title: "公倍數", domain: "factor_multiple", lifecycle: "public_full_product_w1_release" }),
  Object.freeze({ sourceId: "g6a_u01_6a01", grade: 6, semester: "upper", unitCode: "6A-U01", title: "最大公因數與最小公倍數", domain: "number_theory", lifecycle: "public_full_product_w1_release" })
]);
export const W3_SLICE001_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g3a_u08_3a08", grade: 3, semester: "upper", unitCode: "3A-U08", title: "分數", domain: "fraction_representation_and_part_whole", lifecycle: "public_full_product_w3_slice001_release" })]);
export const W3_SLICE003_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g3b_u07_3b07", grade: 3, semester: "lower", unitCode: "3B-U07", title: "分數的加減", domain: "fraction_addition_subtraction", lifecycle: "public_full_product_w3_slice003_release" })]);
export const W3_SLICE004_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g3b_u09_3b09", grade: 3, semester: "lower", unitCode: "3B-U09", title: "小數", domain: "decimal_representation", lifecycle: "public_full_product_w3_slice004_release" })]);
export const W3_SLICE005_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g4b_u08_4b08", grade: 4, semester: "lower", unitCode: "4B-U08", title: "等值分數", domain: "equivalent_fraction_structure", lifecycle: "public_full_product_w3_slice005_release" })]);
export const W3_SLICE010_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g4a_u09_4a09", grade: 4, semester: "upper", unitCode: "4A-U09", title: "2位小數", domain: "decimal_representation", lifecycle: "public_full_product_w3_slice010_release" })]);
export const W3_SLICE011_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g4b_u06_4b06", grade: 4, semester: "lower", unitCode: "4B-U06", title: "小數乘法", domain: "decimal_multiplication", lifecycle: "public_full_product_w3_slice011_release" })]);
export const W3_SLICE013_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g5a_u04_5a04", grade: 5, semester: "upper", unitCode: "5A-U04", title: "擴分約分通分", domain: "fraction_equivalence_simplification_common_denominator", lifecycle: "public_full_product_w3_slice013_candidate" })]);
export const W3_SLICE017_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g4a_u06_4a06", grade: 4, semester: "upper", unitCode: "4A-U06", title: "假分數與帶分數", domain: "improper_and_mixed_fraction_representation", lifecycle: "public_full_product_w3_slice017_candidate" })]);
export const W3_SLICE021_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g5a_u01_5a01", grade: 5, semester: "upper", unitCode: "5A-U01", title: "多位小數與加減", domain: "decimal_multi_place_addition_subtraction", lifecycle: "public_full_product_w3_slice021_candidate" })]);
export const W3_SLICE023_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g6a_u02_6a02", grade: 6, semester: "upper", unitCode: "6A-U02", title: "分數除法", domain: "fraction_division_reciprocal", lifecycle: "public_full_product_w3_slice023_candidate" })]);
export const W3_SLICE030_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g5a_u06_5a06", grade: 5, semester: "upper", unitCode: "5A-U06", title: "異分母分數加減", domain: "unlike_denominator_fraction_addition_subtraction", lifecycle: "public_full_product_w3_slice030_candidate" })]);
export const W3_SLICE031_PUBLIC_SOURCE_UNITS = Object.freeze([Object.freeze({ sourceId: "g5b_u04_5b04", grade: 5, semester: "lower", unitCode: "5B-U04", title: "小數的乘法", domain: "decimal_multiplication", lifecycle: "public_full_product_w3_slice031_candidate" })]);
export const FULL_PRODUCT_PUBLIC_SOURCE_UNITS = W1_FULL_PRODUCT_PUBLIC_SOURCE_UNITS;
export const PROTECTED_FIFTEEN_PUBLIC_SOURCE_UNITS = Object.freeze([...BATCH_A_SOURCE_UNITS, ...PUBLIC_CANDIDATE_SOURCE_UNITS]);
export const P01E_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...PROTECTED_FIFTEEN_PUBLIC_SOURCE_UNITS, ...W1_FULL_PRODUCT_PUBLIC_SOURCE_UNITS]);
export const P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P01E_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE001_PUBLIC_SOURCE_UNITS]);
export const P03F3_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE003_PUBLIC_SOURCE_UNITS]);
export const P03F4_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F3_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE004_PUBLIC_SOURCE_UNITS]);
export const P03F9_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F4_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE005_PUBLIC_SOURCE_UNITS]);
export const P03F10_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F9_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE010_PUBLIC_SOURCE_UNITS]);
export const P03F12_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F10_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE011_PUBLIC_SOURCE_UNITS]);
export const P03F16_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F12_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE013_PUBLIC_SOURCE_UNITS]);
export const P03F20_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F16_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE017_PUBLIC_SOURCE_UNITS]);
export const P03F22_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F20_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE021_PUBLIC_SOURCE_UNITS]);
export const P03F23_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F22_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE023_PUBLIC_SOURCE_UNITS]);
export const P03F30_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F23_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE030_PUBLIC_SOURCE_UNITS]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS = Object.freeze([...P03F30_FULL_PRODUCT_PUBLIC_SOURCE_UNITS, ...W3_SLICE031_PUBLIC_SOURCE_UNITS]);
const SOURCE_UNIT_BY_ID = new Map(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => [unit.sourceId, unit]));
export function listBatchASourceUnits(options = {}) { const browserDefault = typeof document !== "undefined"; const includePublicCandidates = options.includePublicCandidates ?? browserDefault; const includeFullProductPublic = options.includeFullProductPublic ?? (browserDefault && options.includePublicCandidates === undefined); const includeCurrentFullProductPublic = options.includeCurrentFullProductPublic ?? options.includeW3Slice001 ?? (browserDefault && options.includeFullProductPublic === undefined && options.includePublicCandidates === undefined); const units = includeFullProductPublic ? (includeCurrentFullProductPublic ? CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS : P01E_FULL_PRODUCT_PUBLIC_SOURCE_UNITS) : includePublicCandidates ? PROTECTED_FIFTEEN_PUBLIC_SOURCE_UNITS : BATCH_A_SOURCE_UNITS; return units.map((unit) => ({ ...unit })); }
export function listProtectedFifteenPublicSourceUnits() { return PROTECTED_FIFTEEN_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listFullProductPublicSourceUnits() { return P01E_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listP03F2FullProductPublicSourceUnits() { return P03F2_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listP03F3FullProductPublicSourceUnits() { return P03F3_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listP03F4FullProductPublicSourceUnits() { return P03F4_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listP03F9FullProductPublicSourceUnits() { return P03F9_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listP03F10FullProductPublicSourceUnits() { return P03F10_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function listCurrentFullProductPublicSourceUnits() { return CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((unit) => ({ ...unit })); }
export function getBatchASourceUnit(sourceId) { const unit = SOURCE_UNIT_BY_ID.get(sourceId) ?? null; return unit ? { ...unit } : null; }
export function isBatchASourceId(sourceId) { return SOURCE_UNIT_BY_ID.has(sourceId); }
