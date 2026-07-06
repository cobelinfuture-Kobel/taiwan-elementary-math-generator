export const BATCH_A_SOURCE_UNITS = Object.freeze([
  { sourceId: "g3a_u01_3a01", grade: 3, semester: "upper", unitCode: "3A-U01", title: "10000以內的數", domain: "number_sense" },
  { sourceId: "g3a_u02_3a02", grade: 3, semester: "upper", unitCode: "3A-U02", title: "四位數的加減", domain: "integer_expression" },
  { sourceId: "g3a_u03_3a03", grade: 3, semester: "upper", unitCode: "3A-U03", title: "乘法", domain: "integer_expression" },
  { sourceId: "g3a_u06_3a06", grade: 3, semester: "upper", unitCode: "3A-U06", title: "除法", domain: "integer_expression" },
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

const BATCH_A_SOURCE_UNIT_BY_ID = new Map(BATCH_A_SOURCE_UNITS.map((unit) => [unit.sourceId, unit]));

export function listBatchASourceUnits() {
  return BATCH_A_SOURCE_UNITS.map((unit) => ({ ...unit }));
}

export function getBatchASourceUnit(sourceId) {
  const unit = BATCH_A_SOURCE_UNIT_BY_ID.get(sourceId) ?? null;
  return unit ? { ...unit } : null;
}

export function isBatchASourceId(sourceId) {
  return BATCH_A_SOURCE_UNIT_BY_ID.has(sourceId);
}
