import { G6A_U02_SOURCE_ID, G6A_U02_RECIPROCAL_KP_ID, G6A_U02_RECIPROCAL_GROUP_ID, G6A_U02_RECIPROCAL_SPEC_IDS } from "../registry/g6a-u02-reciprocal-selector-projection.js";
export const P03F23_REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"]);
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x; };
const hash = (value) => [...String(value)].reduce((n, c) => ((n * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
function fractionCase(serial) {
  const numerator = serial + 1;
  const denominator = serial + 2;
  return { numerator, denominator, reciprocalNumerator: denominator, reciprocalDenominator: numerator };
}
function buildQuestion(patternSpecId, serial, ordinal) {
  const integer = patternSpecId.includes("integer_reciprocal");
  const identity = patternSpecId.includes("identity_missing_factor");
  const row = integer ? { numerator: serial + 2, denominator: 1, reciprocalNumerator: 1, reciprocalDenominator: serial + 2 } : fractionCase(serial);
  const valueText = row.denominator === 1 ? String(row.numerator) : `${row.numerator}/${row.denominator}`;
  const answerText = `${row.reciprocalNumerator}/${row.reciprocalDenominator}`;
  const promptText = identity ? `${valueText} × □ = 1，□ 應填多少？` : `${valueText} 的倒數是多少？`;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal}`, sourceId: G6A_U02_SOURCE_ID, patternSpecId,
    kind: "g6aU02ReciprocalSlice023", operation: "fraction_reciprocal", operationFamilyId: "fraction_reciprocal",
    questionMode: "numeric", requestedUnknownRole: identity ? "identityFactor" : "reciprocal", ...row,
    valueText, promptText, questionText: promptText, blankedDisplayText: promptText, answerText,
    displayText: `${promptText} ${answerText}`, finalAnswer: Object.freeze({ kind: "fraction", canonicalText: answerText, exact: true }),
    metadata: Object.freeze({ patternId: patternSpecId, sourceId: G6A_U02_SOURCE_ID,
      knowledgePointId: G6A_U02_RECIPROCAL_KP_ID, patternGroupId: G6A_U02_RECIPROCAL_GROUP_ID,
      operationFamilyId: "fraction_reciprocal", requestedUnknownRole: identity ? "identityFactor" : "reciprocal",
      requiredCapabilityIds: P03F23_REQUIRED_CAPABILITY_IDS, applicationClassification: "APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
      contextAuthority: null, productAdmissionTask: "P03F_W3DirectProductVerticalSlice023Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1" }),
  });
}
export function canGenerateG6AU02Slice023Questions(plan = {}) {
  return plan.sourceId === G6A_U02_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => G6A_U02_RECIPROCAL_SPEC_IDS.includes(id));
}
export function validateG6AU02Slice023Question(question = {}) {
  const errors = [];
  if (question.sourceId !== G6A_U02_SOURCE_ID || question.metadata?.sourceId !== G6A_U02_SOURCE_ID) errors.push(issue("p03f23_source_mismatch", "sourceId"));
  if (!G6A_U02_RECIPROCAL_SPEC_IDS.includes(question.patternSpecId)) errors.push(issue("p03f23_pattern_mismatch", "patternSpecId"));
  const validTerms = Number.isInteger(question.numerator) && question.numerator > 0 && Number.isInteger(question.denominator) && question.denominator > 0;
  const expected = validTerms ? `${question.denominator}/${question.numerator}` : null;
  if (!validTerms || question.reciprocalNumerator !== question.denominator || question.reciprocalDenominator !== question.numerator || question.answerText !== expected) errors.push(issue("p03f23_reciprocal_exactness_invalid", "answerText"));
  if (question.numerator * question.reciprocalNumerator !== question.denominator * question.reciprocalDenominator) errors.push(issue("p03f23_multiplicative_identity_invalid", "reciprocalNumerator"));
  if (question.metadata?.knowledgePointId !== G6A_U02_RECIPROCAL_KP_ID || question.metadata?.patternGroupId !== G6A_U02_RECIPROCAL_GROUP_ID) errors.push(issue("p03f23_identity_invalid", "metadata"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F23_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f23_capability_set_invalid", "metadata.requiredCapabilityIds"));
  if (question.metadata?.contextAuthority !== null || question.questionMode !== "numeric") errors.push(issue("p03f23_application_scope_violation", "metadata.contextAuthority"));
  if (question.finalAnswer?.canonicalText !== question.answerText || question.finalAnswer?.exact !== true) errors.push(issue("p03f23_final_answer_invalid", "finalAnswer"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG6AU02Slice023Questions(options = {}) {
  const plan = options.plan ?? options; const count = Number(options.questionCount ?? plan.questionCount ?? 12);
  if (!canGenerateG6AU02Slice023Questions(plan) || !Number.isInteger(count) || count < 1 || count > 240) return { ok: false, plan, questions: [], allocation: [], errors: [issue("p03f23_plan_not_supported", "plan")], warnings: [] };
  const ids = [...plan.patternSpecIds]; const offset = hash(options.generationSeed ?? plan.generationSeed ?? "p03f23") % 10000;
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(ids[index % ids.length], offset + Math.floor(index / ids.length) + 1, index + 1));
  const errors = questions.flatMap((question) => validateG6AU02Slice023Question(question).errors);
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f23_duplicate_prompt_detected", "questions"));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return { ok: errors.length === 0, plan, questions, allocation, errors, warnings: [] };
}
