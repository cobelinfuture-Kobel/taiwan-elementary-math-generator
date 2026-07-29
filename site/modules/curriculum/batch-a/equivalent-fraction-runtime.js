import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f5.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f5-extension.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";

const REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
const [FACTOR_SPEC, NUMERATOR_SPEC, DENOMINATOR_SPEC] = G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS;
const LEGACY_CASES = Object.freeze([
  { patternSpecId: FACTOR_SPEC, direction: "expansion", numerator: 1, denominator: 2, factor: 3, equivalentNumerator: 3, equivalentDenominator: 6, promptText: "1/2 和 3/6 是等值分數，分子和分母同乘幾？" },
  { patternSpecId: FACTOR_SPEC, direction: "reduction", numerator: 8, denominator: 12, factor: 4, equivalentNumerator: 2, equivalentDenominator: 3, promptText: "8/12 約成 2/3，分子和分母同除幾？" },
  { patternSpecId: FACTOR_SPEC, direction: "expansion", numerator: 3, denominator: 5, factor: 2, equivalentNumerator: 6, equivalentDenominator: 10, promptText: "3/5 和 6/10 是等值分數，分子和分母同乘幾？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator: 2, denominator: 3, factor: 4, equivalentNumerator: 8, equivalentDenominator: 12, promptText: "2/3 的分子和分母同乘 4，等值分數的分子是多少？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "reduction", numerator: 9, denominator: 15, factor: 3, equivalentNumerator: 3, equivalentDenominator: 5, promptText: "9/15 的分子和分母同除 3，約成的分子是多少？" },
  { patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator: 4, denominator: 7, factor: 2, equivalentNumerator: 8, equivalentDenominator: 14, promptText: "4/7 的分子和分母同乘 2，等值分數的分子是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator: 2, denominator: 5, factor: 3, equivalentNumerator: 6, equivalentDenominator: 15, promptText: "2/5 的分子和分母同乘 3，等值分數的分母是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "reduction", numerator: 12, denominator: 20, factor: 4, equivalentNumerator: 3, equivalentDenominator: 5, promptText: "12/20 的分子和分母同除 4，約成的分母是多少？" },
  { patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator: 3, denominator: 8, factor: 2, equivalentNumerator: 6, equivalentDenominator: 16, promptText: "3/8 的分子和分母同乘 2，等值分數的分母是多少？" },
]);
function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}
function gcd(a, b) { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; }
function buildEquivalentFractionCases() {
  const rows = [];
  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      if (gcd(numerator, denominator) !== 1) continue;
      for (let factor = 2; factor <= 9; factor += 1) {
        const equivalentNumerator = numerator * factor;
        const equivalentDenominator = denominator * factor;
        rows.push({ patternSpecId: FACTOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 和 " + equivalentNumerator + "/" + equivalentDenominator + " 是等值分數，分子和分母同乘幾？" });
        rows.push({ patternSpecId: FACTOR_SPEC, direction: "reduction", numerator: equivalentNumerator, denominator: equivalentDenominator, factor, equivalentNumerator: numerator, equivalentDenominator: denominator, promptText: equivalentNumerator + "/" + equivalentDenominator + " 約成 " + numerator + "/" + denominator + "，分子和分母同除幾？" });
        rows.push({ patternSpecId: NUMERATOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 的分子和分母同乘 " + factor + "，等值分數的分子是多少？" });
        rows.push({ patternSpecId: DENOMINATOR_SPEC, direction: "expansion", numerator, denominator, factor, equivalentNumerator, equivalentDenominator, promptText: numerator + "/" + denominator + " 的分子和分母同乘 " + factor + "，等值分數的分母是多少？" });
      }
    }
  }
  return rows;
}
const CASES = Object.freeze(buildEquivalentFractionCases()); // PGC-R04 equivalent fraction parameter space

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f5")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function answerFor(row, unknownRole) { return Number(row[unknownRole]); }
function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice005", definition.sourceId, definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([definition.sourceId]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    exactRationalIdentity: true,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice005Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(row, index) {
  const definition = getBatchABrowserPatternDefinition(row.patternSpecId);
  const answer = answerFor(row, definition.requestedUnknownRole);
  return Object.freeze({
    id: `${row.patternSpecId}-${index}`,
    sourceId: G4B_U08_SOURCE_ID,
    patternSpecId: row.patternSpecId,
    kind: "g4bU08EquivalentFraction",
    operation: "equivalent_fraction",
    operationFamilyId: "equivalent_fraction",
    questionMode: "numeric",
    promptText: row.promptText,
    questionText: row.promptText,
    blankedDisplayText: row.promptText,
    displayText: `${row.promptText} ${answer}`,
    answerText: String(answer),
    numerator: row.numerator,
    denominator: row.denominator,
    factor: row.factor,
    equivalentNumerator: row.equivalentNumerator,
    equivalentDenominator: row.equivalentDenominator,
    direction: row.direction,
    requestedUnknownRole: definition.requestedUnknownRole,
    finalAnswer: Object.freeze({ value: answer, answerType: "missing_integer", exact: true }),
    metadata: metadata(definition),
  });
}

export function canGenerateG4BU08EquivalentFractionQuestions(plan = {}) {
  return plan.sourceId === G4B_U08_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 3
    && G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.every((id) => plan.patternSpecIds.includes(id));
}
export function validateG4BU08EquivalentFractionQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G4B_U08_SOURCE_ID || question.metadata?.sourceId !== G4B_U08_SOURCE_ID) add("p03f5_source_mismatch", "sourceId");
  if (!G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.includes(question.patternSpecId) || question.metadata?.patternId !== question.patternSpecId) add("p03f5_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4B_U08_EQUIVALENT_FRACTION_KP_ID) add("p03f5_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID) add("p03f5_group_mismatch", "metadata.patternGroupId");
  const ints = ["numerator", "denominator", "factor", "equivalentNumerator", "equivalentDenominator"];
  if (ints.some((role) => !Number.isInteger(question[role]) || question[role] <= 0)) add("p03f5_fraction_roles_invalid", "numerator");
  const expansion = question.direction === "expansion"
    && question.equivalentNumerator === question.numerator * question.factor
    && question.equivalentDenominator === question.denominator * question.factor;
  const reduction = question.direction === "reduction"
    && question.numerator === question.equivalentNumerator * question.factor
    && question.denominator === question.equivalentDenominator * question.factor;
  if (!expansion && !reduction) add("p03f5_common_factor_relation_invalid", "factor");
  if (question.numerator * question.equivalentDenominator !== question.equivalentNumerator * question.denominator) add("p03f5_fraction_value_not_preserved", "equivalentNumerator");
  const expectedAnswer = Number(question[question.requestedUnknownRole]);
  if (!["factor", "equivalentNumerator", "equivalentDenominator"].includes(question.requestedUnknownRole)
    || question.answerText !== String(expectedAnswer)
    || question.finalAnswer?.value !== expectedAnswer
    || question.finalAnswer?.exact !== true) add("p03f5_answer_identity_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(REQUIRED_CAPABILITY_IDS)) add("p03f5_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f5_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f5_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG4BU08EquivalentFractionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4BU08EquivalentFractionQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f5_plan_not_supported", severity: "error", path: "plan", message: "Slice005 accepts only the three admitted equivalent-fraction PatternSpecs." }], warnings: [] };
  const fixturePool = isPgcR04Seed(plan.generationSeed) ? CASES : LEGACY_CASES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f5_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected generation namespace does not provide enough unique witnesses." }], warnings: [] };
  const offset = hashSeed(plan.generationSeed) % fixturePool.length;
  const selected = Array.from({ length: plan.questionCount }, (_, index) => fixturePool[(offset + index) % fixturePool.length]);
  const questions = selected.map((row, index) => buildQuestion(row, index + 1));
  const errors = questions.flatMap((question) => validateG4BU08EquivalentFractionQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f5_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  const allocation = G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.map((patternSpecId) => ({
    patternSpecId,
    questionCount: questions.filter((row) => row.patternSpecId === patternSpecId).length,
  })).filter((row) => row.questionCount > 0);
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation, errors, warnings: [] };
}

// PGC-R04 legacy contract reconciliation V1
