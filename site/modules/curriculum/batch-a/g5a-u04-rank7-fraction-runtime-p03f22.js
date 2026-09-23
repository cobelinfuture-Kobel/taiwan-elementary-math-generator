import {
  G5A_U04_SOURCE_ID,
  G5A_U04_COMMON_DENOMINATOR_KP_ID,
  G5A_U04_DIVISIBILITY_REDUCTION_KP_ID,
  G5A_U04_COMMON_DENOMINATOR_GROUP_ID,
  G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
  G5A_U04_COMMON_DENOMINATOR_SPEC_IDS,
  G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
  G5A_U04_SLICE022_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-rank7-fraction-selector-projection.js";

export const P03F22_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const hash = (value) => [...String(value)].reduce((n, c) => ((n * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x; };
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

function commonDenominatorCase(serial) {
  const leftDenominator = 2 + (serial % 11);
  let rightDenominator = 13 + Math.floor(serial / 11);
  if (rightDenominator === leftDenominator) rightDenominator += 1;
  const commonDenominator = lcm(leftDenominator, rightDenominator);
  const leftNumerator = 1 + (serial % Math.max(1, leftDenominator - 1));
  const rightNumerator = 1 + ((serial * 3) % Math.max(1, rightDenominator - 1));
  return {
    leftNumerator, leftDenominator, rightNumerator, rightDenominator, commonDenominator,
    leftEquivalentNumerator: leftNumerator * (commonDenominator / leftDenominator),
    rightEquivalentNumerator: rightNumerator * (commonDenominator / rightDenominator),
  };
}

function reductionCase(serial) {
  const commonFactor = 2 + (serial % 8);
  const simplestDenominator = 5 + Math.floor(serial / 8);
  let simplestNumerator = 1 + ((serial * 5) % Math.max(1, simplestDenominator - 1));
  while (gcd(simplestNumerator, simplestDenominator) !== 1) simplestNumerator = simplestNumerator % (simplestDenominator - 1) + 1;
  return {
    commonFactor, simplestNumerator, simplestDenominator,
    numerator: simplestNumerator * commonFactor,
    denominator: simplestDenominator * commonFactor,
  };
}

function buildCommonDenominatorQuestion(patternSpecId, serial, ordinal) {
  const row = commonDenominatorCase(serial);
  const role = patternSpecId.includes("left_equivalent") ? "leftEquivalent"
    : patternSpecId.includes("right_equivalent") ? "rightEquivalent" : "commonDenominator";
  const leftEquivalent = `${row.leftEquivalentNumerator}/${row.commonDenominator}`;
  const rightEquivalent = `${row.rightEquivalentNumerator}/${row.commonDenominator}`;
  const promptText = role === "commonDenominator"
    ? `把 ${row.leftNumerator}/${row.leftDenominator} 和 ${row.rightNumerator}/${row.rightDenominator} 通分成最小的相同分母，分母是多少？`
    : role === "leftEquivalent"
      ? `把 ${row.leftNumerator}/${row.leftDenominator} 和 ${row.rightNumerator}/${row.rightDenominator} 通分為分母 ${row.commonDenominator}，第一個分數變成多少？`
      : `把 ${row.leftNumerator}/${row.leftDenominator} 和 ${row.rightNumerator}/${row.rightDenominator} 通分為分母 ${row.commonDenominator}，第二個分數變成多少？`;
  const answerText = role === "commonDenominator" ? String(row.commonDenominator)
    : role === "leftEquivalent" ? leftEquivalent : rightEquivalent;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal}`, sourceId: G5A_U04_SOURCE_ID, patternSpecId,
    kind: "g5aU04CommonDenominatorSlice022", operation: "common_denominator", operationFamilyId: "common_denominator",
    questionMode: "numeric", requestedUnknownRole: role, ...row,
    leftEquivalent, rightEquivalent, promptText, questionText: promptText, blankedDisplayText: promptText,
    answerText, displayText: `${promptText} ${answerText}`,
    finalAnswer: Object.freeze({ kind: role === "commonDenominator" ? "integer" : "fraction", canonicalText: answerText, exact: true }),
    metadata: Object.freeze({ patternId: patternSpecId, sourceId: G5A_U04_SOURCE_ID,
      knowledgePointId: G5A_U04_COMMON_DENOMINATOR_KP_ID, patternGroupId: G5A_U04_COMMON_DENOMINATOR_GROUP_ID,
      operationFamilyId: "common_denominator", requestedUnknownRole: role,
      requiredCapabilityIds: P03F22_REQUIRED_CAPABILITY_IDS, applicationClassification: "APPLICATION_NOT_APPLICABLE",
      contextAuthority: null, productAdmissionTask: "P03F_W3DirectProductVerticalSlice022Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1" }),
  });
}

function buildReductionQuestion(patternSpecId, serial, ordinal) {
  const row = reductionCase(serial);
  const role = patternSpecId.includes("simplest_numerator") ? "simplestNumerator"
    : patternSpecId.includes("simplest_denominator") ? "simplestDenominator" : "commonFactor";
  const promptText = role === "commonFactor"
    ? `${row.numerator}/${row.denominator} 約成最簡分數 ${row.simplestNumerator}/${row.simplestDenominator}，分子和分母共同除以多少？`
    : role === "simplestNumerator"
      ? `利用整除規則把 ${row.numerator}/${row.denominator} 約成最簡分數，最簡分數的分子是多少？`
      : `利用整除規則把 ${row.numerator}/${row.denominator} 約成最簡分數，最簡分數的分母是多少？`;
  const answerText = String(row[role]);
  return Object.freeze({
    id: `${patternSpecId}-${ordinal}`, sourceId: G5A_U04_SOURCE_ID, patternSpecId,
    kind: "g5aU04DivisibilityReductionSlice022", operation: "simplify_fraction", operationFamilyId: "simplify_fraction",
    questionMode: "numeric", requestedUnknownRole: role, ...row,
    promptText, questionText: promptText, blankedDisplayText: promptText, answerText, displayText: `${promptText} ${answerText}`,
    finalAnswer: Object.freeze({ kind: "integer", canonicalText: answerText, exact: true }),
    metadata: Object.freeze({ patternId: patternSpecId, sourceId: G5A_U04_SOURCE_ID,
      knowledgePointId: G5A_U04_DIVISIBILITY_REDUCTION_KP_ID, patternGroupId: G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
      operationFamilyId: "simplify_fraction", requestedUnknownRole: role,
      requiredCapabilityIds: P03F22_REQUIRED_CAPABILITY_IDS, applicationClassification: "APPLICATION_NOT_APPLICABLE",
      contextAuthority: null, productAdmissionTask: "P03F_W3DirectProductVerticalSlice022Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1" }),
  });
}

export function canGenerateG5AU04Slice022Questions(plan = {}) {
  return plan.sourceId === G5A_U04_SOURCE_ID
    && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => G5A_U04_SLICE022_PATTERN_SPEC_IDS.includes(id));
}

export function validateG5AU04Slice022Question(question = {}) {
  const errors = [];
  const patternSpecId = question.patternSpecId;
  const common = G5A_U04_COMMON_DENOMINATOR_SPEC_IDS.includes(patternSpecId);
  const reduction = G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS.includes(patternSpecId);
  if (question.sourceId !== G5A_U04_SOURCE_ID || question.metadata?.sourceId !== G5A_U04_SOURCE_ID) errors.push(issue("p03f22_source_mismatch", "sourceId"));
  if (!common && !reduction) errors.push(issue("p03f22_pattern_mismatch", "patternSpecId"));
  if (common) {
    const expectedDenominator = isPositiveInt(question.leftDenominator) && isPositiveInt(question.rightDenominator) ? lcm(question.leftDenominator, question.rightDenominator) : null;
    const expectedLeft = expectedDenominator ? `${question.leftNumerator * (expectedDenominator / question.leftDenominator)}/${expectedDenominator}` : null;
    const expectedRight = expectedDenominator ? `${question.rightNumerator * (expectedDenominator / question.rightDenominator)}/${expectedDenominator}` : null;
    const expected = question.requestedUnknownRole === "commonDenominator" ? String(expectedDenominator)
      : question.requestedUnknownRole === "leftEquivalent" ? expectedLeft : expectedRight;
    if (question.metadata?.knowledgePointId !== G5A_U04_COMMON_DENOMINATOR_KP_ID || question.metadata?.patternGroupId !== G5A_U04_COMMON_DENOMINATOR_GROUP_ID) errors.push(issue("p03f22_common_denominator_identity_invalid", "metadata"));
    if (!expectedDenominator || question.commonDenominator !== expectedDenominator || question.leftEquivalent !== expectedLeft || question.rightEquivalent !== expectedRight || question.answerText !== expected) errors.push(issue("p03f22_common_denominator_exactness_invalid", "answerText"));
  }
  if (reduction) {
    const expectedFactor = isPositiveInt(question.numerator) && isPositiveInt(question.denominator) ? gcd(question.numerator, question.denominator) : null;
    const expectedNumerator = expectedFactor ? question.numerator / expectedFactor : null;
    const expectedDenominator = expectedFactor ? question.denominator / expectedFactor : null;
    const expected = question.requestedUnknownRole === "commonFactor" ? String(expectedFactor)
      : question.requestedUnknownRole === "simplestNumerator" ? String(expectedNumerator) : String(expectedDenominator);
    if (question.metadata?.knowledgePointId !== G5A_U04_DIVISIBILITY_REDUCTION_KP_ID || question.metadata?.patternGroupId !== G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID) errors.push(issue("p03f22_reduction_identity_invalid", "metadata"));
    if (!expectedFactor || question.commonFactor !== expectedFactor || question.simplestNumerator !== expectedNumerator || question.simplestDenominator !== expectedDenominator || gcd(expectedNumerator, expectedDenominator) !== 1 || question.answerText !== expected) errors.push(issue("p03f22_reduction_exactness_invalid", "answerText"));
  }
  if (question.finalAnswer?.canonicalText !== question.answerText || question.finalAnswer?.exact !== true) errors.push(issue("p03f22_final_answer_invalid", "finalAnswer"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F22_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f22_capability_set_invalid", "metadata.requiredCapabilityIds"));
  if (question.metadata?.contextAuthority !== null || question.questionMode !== "numeric") errors.push(issue("p03f22_application_scope_violation", "metadata.contextAuthority"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5AU04Slice022Questions(options = {}) {
  const plan = options.plan ?? options;
  const count = Number(options.questionCount ?? plan.questionCount ?? 12);
  if (!canGenerateG5AU04Slice022Questions(plan) || !Number.isInteger(count) || count < 1 || count > 240) {
    return { ok: false, plan, questions: [], allocation: [], errors: [issue("p03f22_plan_not_supported", "plan")], warnings: [] };
  }
  const ids = [...plan.patternSpecIds];
  const offset = hash(options.generationSeed ?? plan.generationSeed ?? "p03f22") % 500;
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = ids[index % ids.length];
    const serial = offset + Math.floor(index / ids.length) + 1;
    return G5A_U04_COMMON_DENOMINATOR_SPEC_IDS.includes(patternSpecId)
      ? buildCommonDenominatorQuestion(patternSpecId, serial, index + 1)
      : buildReductionQuestion(patternSpecId, serial, index + 1);
  });
  const errors = questions.flatMap((question) => validateG5AU04Slice022Question(question).errors);
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f22_duplicate_prompt_detected", "questions"));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings: [] };
}
