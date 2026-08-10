import {
  G5B_U04_P03F31_GROUP_ID,
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
  P03F31_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

const SCALE = 3;
export const P03F31_SOURCE_WITNESS_FIXTURE = Object.freeze({ decimalCoefficient: 672, integerFactor: 18, scale: SCALE });
const hash = (value) => [...String(value)].reduce((n, c) => ((n * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
const canonicalFromCoefficient = (coefficient, scale = SCALE) => {
  const digits = String(Math.abs(coefficient)).padStart(scale + 1, "0");
  const whole = digits.slice(0, -scale) || "0";
  const fraction = digits.slice(-scale).replace(/0+$/, "");
  return `${coefficient < 0 ? "-" : ""}${fraction ? `${whole}.${fraction}` : whole}`;
};
const fixedDecimal = (coefficient, scale = SCALE) => {
  const digits = String(Math.abs(coefficient)).padStart(scale + 1, "0");
  return `${coefficient < 0 ? "-" : ""}${digits.slice(0, -scale) || "0"}.${digits.slice(-scale)}`;
};

function buildCase(serial) {
  const decimalCoefficient = 101 + ((serial * 137 + 29) % 899);
  const integerFactor = 2 + ((serial * 7 + 3) % 19);
  return Object.freeze({ decimalCoefficient, integerFactor, scale: SCALE });
}

function buildQuestion(fixture, ordinal) {
  const decimalFactor = fixedDecimal(fixture.decimalCoefficient, fixture.scale);
  const productCoefficient = fixture.decimalCoefficient * fixture.integerFactor;
  const product = canonicalFromCoefficient(productCoefficient, fixture.scale);
  const promptText = `${decimalFactor} × ${fixture.integerFactor} = ？`;
  return Object.freeze({
    id: `${G5B_U04_P03F31_SPEC_ID}-${ordinal}`,
    sourceId: G5B_U04_P03F31_SOURCE_ID,
    patternSpecId: G5B_U04_P03F31_SPEC_ID,
    kind: "g5bU04Rank8DecimalTimesInteger",
    operation: "decimal_multiplication",
    operationFamilyId: "decimal_multiplication",
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${product}`,
    answerText: product,
    decimalFactor,
    decimalCoefficient: fixture.decimalCoefficient,
    decimalScale: fixture.scale,
    integerFactor: fixture.integerFactor,
    product,
    finalAnswer: Object.freeze({
      kind: "decimal",
      coefficient: String(productCoefficient),
      scale: fixture.scale,
      canonicalText: product,
      exact: true,
      arithmeticModel: "COEFFICIENT_PRODUCT_SCALE_SUM",
    }),
    globalContextProduction: null,
    metadata: Object.freeze({
      patternId: G5B_U04_P03F31_SPEC_ID,
      sourceId: G5B_U04_P03F31_SOURCE_ID,
      knowledgePointId: G5B_U04_P03F31_KP_ID,
      patternGroupId: G5B_U04_P03F31_GROUP_ID,
      operationFamilyId: "decimal_multiplication",
      requestedUnknownRole: "product",
      requiredCapabilityIds: P03F31_REQUIRED_CAPABILITY_IDS,
      applicationClassification: "APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
      contextAuthority: null,
      globalContextAuthorityPath: null,
      sourceWitness: "0.672 × 18 = 12.096",
      sourceReviewMethod: "FULL_PAGE_VISUAL_READBACK_NO_OCR_AUTHORITY",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice031Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    }),
  });
}

export function canGenerateG5BU04P03F31Questions(plan = {}) {
  return plan.sourceId === G5B_U04_P03F31_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G5B_U04_P03F31_SPEC_ID
    && plan.questionMode === "numeric";
}

export function validateG5BU04P03F31Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G5B_U04_P03F31_SOURCE_ID || question.metadata?.sourceId !== G5B_U04_P03F31_SOURCE_ID) add("p03f31_source_mismatch", "sourceId");
  if (question.patternSpecId !== G5B_U04_P03F31_SPEC_ID || question.metadata?.patternId !== G5B_U04_P03F31_SPEC_ID) add("p03f31_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G5B_U04_P03F31_KP_ID || question.metadata?.patternGroupId !== G5B_U04_P03F31_GROUP_ID) add("p03f31_kp_group_mismatch", "metadata");
  if (!Number.isInteger(question.decimalCoefficient) || question.decimalCoefficient < 101 || question.decimalCoefficient > 999) add("p03f31_decimal_coefficient_invalid", "decimalCoefficient");
  if (question.decimalScale !== SCALE || question.decimalFactor !== fixedDecimal(question.decimalCoefficient, SCALE)) add("p03f31_decimal_scale_invalid", "decimalFactor");
  if (!Number.isInteger(question.integerFactor) || question.integerFactor < 2 || question.integerFactor > 20) add("p03f31_integer_factor_invalid", "integerFactor");
  const expectedCoefficient = Number.isInteger(question.decimalCoefficient) && Number.isInteger(question.integerFactor) ? question.decimalCoefficient * question.integerFactor : NaN;
  const expectedProduct = Number.isInteger(expectedCoefficient) ? canonicalFromCoefficient(expectedCoefficient, SCALE) : null;
  if (question.product !== expectedProduct || question.answerText !== expectedProduct || question.finalAnswer?.canonicalText !== expectedProduct || question.finalAnswer?.coefficient !== String(expectedCoefficient) || question.finalAnswer?.scale !== SCALE || question.finalAnswer?.exact !== true || question.finalAnswer?.arithmeticModel !== "COEFFICIENT_PRODUCT_SCALE_SUM") add("p03f31_exact_product_invalid", "finalAnswer");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F31_REQUIRED_CAPABILITY_IDS)) add("p03f31_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.questionMode !== "numeric" || question.globalContextProduction !== null || question.metadata?.contextAuthority !== null || question.metadata?.globalContextAuthorityPath !== null) add("p03f31_application_scope_violation", "questionMode");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f31_forbidden_surface_present", "blankedDisplayText");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

export function generateG5BU04P03F31Questions(options = {}) {
  const plan = options.plan ?? options;
  const questionCount = Number(options.questionCount ?? plan.questionCount ?? 8);
  if (!canGenerateG5BU04P03F31Questions(plan) || !Number.isInteger(questionCount) || questionCount < 1 || questionCount > 240) {
    return Object.freeze({ ok: false, plan, questions: Object.freeze([]), allocation: Object.freeze([]), errors: Object.freeze([{ code: "p03f31_plan_not_supported", severity: "error", path: "plan", message: "Slice031 requires the admitted G5B-U04 decimal×integer numeric PatternSpec and 1-240 questions." }]), warnings: Object.freeze([]) });
  }
  const seed = options.generationSeed ?? plan.generationSeed ?? "p03f31";
  const offset = hash(seed) % 100000;
  const sourceWitnessMode = String(seed).includes("source-witness");
  const fixtures = Array.from({ length: questionCount }, (_, index) => sourceWitnessMode && index === 0
    ? P03F31_SOURCE_WITNESS_FIXTURE
    : buildCase(offset + index + 1));
  const questions = fixtures.map((fixture, index) => buildQuestion(fixture, index + 1));
  const errors = questions.flatMap((question, index) => validateG5BU04P03F31Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f31_duplicate_prompt_detected", severity: "error", path: "questions", message: "Duplicate prompts are forbidden." });
  return Object.freeze({
    ok: errors.length === 0,
    plan,
    questions: Object.freeze(questions),
    allocation: Object.freeze([{ patternSpecId: G5B_U04_P03F31_SPEC_ID, questionCount }]),
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
  });
}
