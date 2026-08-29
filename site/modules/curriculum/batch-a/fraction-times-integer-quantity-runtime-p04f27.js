import {
  G4A_U06_P04F27_SOURCE_ID,
  G4A_U06_P04F27_KP_ID,
  G4A_U06_P04F27_GROUP_ID,
  G4A_U06_P04F27_SPEC_ID,
  P04F27_REQUIRED_PRODUCT_CAPABILITY_IDS,
} from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";

const FAMILIES = Object.freeze([
  "PROPER_FRACTION_LENGTH_TIMES_INTEGER",
  "MIXED_NUMBER_MASS_TIMES_INTEGER",
]);
const issue = (code, path) => Object.freeze({ code, severity: "error", path, message: code });
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
function simplify(numerator, denominator) { const d = gcd(numerator, denominator); return Object.freeze({ numerator: numerator / d, denominator: denominator / d }); }
function formatRational(numerator, denominator) {
  const s = simplify(numerator, denominator);
  const whole = Math.floor(s.numerator / s.denominator);
  const remainder = s.numerator % s.denominator;
  if (remainder === 0) return String(whole);
  if (whole === 0) return `${remainder}/${s.denominator}`;
  return `${whole} ${remainder}/${s.denominator}`;
}
function hashSeed(value) { let h = 2166136261; for (const ch of String(value ?? "p04f27")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rotate(rows, seed) { const o = hashSeed(seed) % rows.length; return [...rows.slice(o), ...rows.slice(0, o)]; }
const DENOMINATORS = Object.freeze([5, 6, 8, 10, 12, 15]);
const CASES = Object.freeze(Array.from({ length: 24 }, (_, i) => {
  const family = FAMILIES[i % 2];
  const k = Math.floor(i / 2);
  const denominator = DENOMINATORS[k % DENOMINATORS.length];
  const multiplier = 2 + (k % 8);
  if (family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER") {
    const numerator = 1 + ((k * 2 + 1) % (denominator - 1));
    return Object.freeze({ family, numerator, denominator, whole: 0, multiplier, unit: "公尺", object: "張書桌" });
  }
  const whole = 1 + (k % 5);
  const numerator = 1 + ((k * 3 + 1) % (denominator - 1));
  return Object.freeze({ family, numerator, denominator, whole, multiplier, unit: "公斤", object: "箱書" });
}));
function baseImproperNumerator(row) { return row.whole * row.denominator + row.numerator; }
function promptFor(row) {
  if (row.family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER") {
    return `一張書桌寬度是 ${row.numerator}/${row.denominator} 公尺，把 ${row.multiplier} 張書桌排成一直線，總長度是多少公尺？`;
  }
  return `一箱書的重量是 ${row.whole} ${row.numerator}/${row.denominator} 公斤，${row.multiplier} 箱書共重多少公斤？`;
}
function answerFor(row) {
  const productNumerator = baseImproperNumerator(row) * row.multiplier;
  return `${formatRational(productNumerator, row.denominator)} ${row.unit}`;
}
export function generateG4AU06P04F27FractionTimesIntegerQuantityQuestions(options = {}) {
  const plan = options.plan ?? options;
  const count = Number(options.questionCount ?? plan.questionCount ?? 8);
  const specs = plan.patternSpecIds ?? [];
  if (plan.sourceId !== G4A_U06_P04F27_SOURCE_ID || plan.questionMode !== "application" || specs.length !== 1 || specs[0] !== G4A_U06_P04F27_SPEC_ID || !Number.isInteger(count) || count < 1 || count > 24) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("p04f27_plan_invalid", "plan")]), warnings: Object.freeze([]), questions: Object.freeze([]), allocation: Object.freeze([]), plan });
  }
  const questions = rotate(CASES, options.generationSeed ?? plan.generationSeed ?? "p04f27-fraction-quantity").slice(0, count).map((row, index) => {
    const prompt = promptFor(row);
    const answer = answerFor(row);
    const baseNumerator = baseImproperNumerator(row);
    const productNumerator = baseNumerator * row.multiplier;
    const simplified = simplify(productNumerator, row.denominator);
    return Object.freeze({
      id: `p04f27-${index + 1}-${row.family}-${baseNumerator}-${row.denominator}-${row.multiplier}`,
      generatedItemId: `p04f27-${index + 1}-${row.family}-${baseNumerator}-${row.denominator}-${row.multiplier}`,
      sourceId: G4A_U06_P04F27_SOURCE_ID,
      sourceNodeId: G4A_U06_P04F27_SOURCE_ID,
      knowledgePointId: G4A_U06_P04F27_KP_ID,
      patternGroupId: G4A_U06_P04F27_GROUP_ID,
      patternSpecId: G4A_U06_P04F27_SPEC_ID,
      operationModelId: "op_g4a_u06_fraction_times_integer_quantity",
      operationFamilyId: "fraction_quantity_scaling",
      mode: "application",
      questionMode: "application",
      representation: "fraction_quantity_scaling_application",
      prompt,
      promptText: prompt,
      blankedDisplayText: prompt,
      displayText: `${prompt} ${answer}`,
      answer,
      answerText: answer,
      finalAnswer: answer,
      givenRoleValues: Object.freeze({ BASE_FRACTIONAL_QUANTITY: `${baseNumerator}/${row.denominator} ${row.unit}`, INTEGER_MULTIPLIER: row.multiplier }),
      metadata: Object.freeze({
        sourceId: G4A_U06_P04F27_SOURCE_ID,
        knowledgePointId: G4A_U06_P04F27_KP_ID,
        historicalHiddenAliasId: "kp_g4a_u06_fraction_times_integer_quantity",
        patternGroupId: G4A_U06_P04F27_GROUP_ID,
        patternId: G4A_U06_P04F27_SPEC_ID,
        answerType: "fractional_quantity_representation",
        relationFamilyId: "FRACTIONAL_QUANTITY_SCALING",
        knownRoleIds: Object.freeze(["BASE_FRACTIONAL_QUANTITY", "INTEGER_MULTIPLIER"]),
        targetRoleId: "SCALED_QUANTITY",
        presentationFamilyId: row.family,
        quantityDimension: row.family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER" ? "LENGTH" : "MASS",
        unit: row.unit,
        baseWhole: row.whole,
        baseNumerator: row.numerator,
        baseDenominator: row.denominator,
        baseImproperNumerator: baseNumerator,
        integerMultiplier: row.multiplier,
        productNumerator,
        productDenominator: row.denominator,
        simplifiedProductNumerator: simplified.numerator,
        simplifiedProductDenominator: simplified.denominator,
        sourceEvidencePages: Object.freeze([3]),
        sourceVisualAuthority: "FULL_PAGE_VISUAL_READBACK",
        applicationRequired: true,
        exactRationalArithmetic: true,
        roundingUsed: false,
        requiredCapabilityIds: P04F27_REQUIRED_PRODUCT_CAPABILITY_IDS,
        sharedG4AU06FractionCoordinator: true,
        sharedFractionRenderer: true,
        parallelFractionEngine: false,
        globalContextExpansion: false,
        pblProjection: false,
        q028Touched: false,
      }),
    });
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze([{ patternSpecId: G4A_U06_P04F27_SPEC_ID, questionCount: questions.length }]), plan });
}
export function validateG4AU06P04F27Question(question = {}) {
  const errors = [];
  const metadata = question.metadata ?? {};
  const baseNumerator = Number(metadata.baseImproperNumerator);
  const denominator = Number(metadata.baseDenominator);
  const multiplier = Number(metadata.integerMultiplier);
  if (question.sourceId !== G4A_U06_P04F27_SOURCE_ID || question.knowledgePointId !== G4A_U06_P04F27_KP_ID || question.patternSpecId !== G4A_U06_P04F27_SPEC_ID) errors.push(issue("p04f27_identity_invalid", "identity"));
  if (question.mode !== "application" || question.questionMode !== "application" || question.representation !== "fraction_quantity_scaling_application") errors.push(issue("p04f27_application_surface_invalid", "questionMode"));
  if (!FAMILIES.includes(metadata.presentationFamilyId) || metadata.relationFamilyId !== "FRACTIONAL_QUANTITY_SCALING" || metadata.targetRoleId !== "SCALED_QUANTITY") errors.push(issue("p04f27_semantic_mapping_invalid", "metadata"));
  if (!Number.isInteger(baseNumerator) || !Number.isInteger(denominator) || denominator <= 0 || !Number.isInteger(multiplier) || multiplier <= 0 || metadata.productNumerator !== baseNumerator * multiplier || metadata.productDenominator !== denominator) errors.push(issue("p04f27_exact_product_invalid", "metadata"));
  const row = { family: metadata.presentationFamilyId, numerator: Number(metadata.baseNumerator), denominator, whole: Number(metadata.baseWhole), multiplier, unit: metadata.unit };
  const expectedPrompt = promptFor(row);
  const expectedAnswer = answerFor(row);
  if (question.promptText !== expectedPrompt || question.answerText !== expectedAnswer || question.finalAnswer !== expectedAnswer) errors.push(issue("p04f27_prompt_answer_mismatch", "answer"));
  if (metadata.applicationRequired !== true || metadata.exactRationalArithmetic !== true || metadata.roundingUsed !== false || metadata.parallelFractionEngine !== false || metadata.sharedG4AU06FractionCoordinator !== true || metadata.sharedFractionRenderer !== true) errors.push(issue("p04f27_pipeline_or_exactness_invalid", "metadata"));
  if (JSON.stringify(metadata.sourceEvidencePages) !== "[3]" || metadata.q028Touched !== false) errors.push(issue("p04f27_source_or_scope_invalid", "metadata"));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}
export const P04F27_PRESENTATION_FAMILIES = FAMILIES;
