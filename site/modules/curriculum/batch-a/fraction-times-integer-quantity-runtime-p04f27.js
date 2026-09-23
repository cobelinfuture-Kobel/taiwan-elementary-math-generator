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
  "FRACTION_CAPACITY_TIMES_INTEGER",
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
function mix32(value) { let x = value >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; }
function shuffle(rows, seed) {
  const result = [...rows];
  let state = hashSeed(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = mix32(state + index);
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
const DENOMINATORS = Object.freeze([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const OBJECTS = Object.freeze({
  PROPER_FRACTION_LENGTH_TIMES_INTEGER: Object.freeze(["張書桌", "條緞帶", "段繩子"]),
  MIXED_NUMBER_MASS_TIMES_INTEGER: Object.freeze(["箱書", "袋米", "籃水果"]),
  FRACTION_CAPACITY_TIMES_INTEGER: Object.freeze(["瓶果汁", "桶飲用水", "壺茶"]),
});
const CASES = Object.freeze(Array.from({ length: 240 }, (_, i) => {
  const familyIndex = i % FAMILIES.length;
  const family = FAMILIES[familyIndex];
  const k = Math.floor(i / FAMILIES.length);
  const denominator = DENOMINATORS[k % DENOMINATORS.length];
  const multiplier = 2 + (Math.floor(k / DENOMINATORS.length) % 8);
  const surfaceVariant = Math.floor(k / 20) % OBJECTS[family].length;
  const object = OBJECTS[family][surfaceVariant];
  const numerator = 1 + ((k * 5 + familyIndex * 2) % (denominator - 1));
  if (family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER") {
    return Object.freeze({ family, numerator, denominator, whole: 0, multiplier, unit: "公尺", object, surfaceVariant });
  }
  if (family === "MIXED_NUMBER_MASS_TIMES_INTEGER") {
    const whole = 1 + (Math.floor(k / 8) % 5);
    return Object.freeze({ family, numerator, denominator, whole, multiplier, unit: "公斤", object, surfaceVariant });
  }
  const whole = Math.floor(k / 16) % 3;
  return Object.freeze({ family, numerator, denominator, whole, multiplier, unit: "公升", object, surfaceVariant });
}));
function baseImproperNumerator(row) { return row.whole * row.denominator + row.numerator; }
function promptFor(row) {
  if (row.family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER") {
    return `一${row.object}的長度是 ${row.numerator}/${row.denominator} 公尺，${row.multiplier} ${row.object}接在一起，總長度是多少公尺？`;
  }
  const base = row.whole > 0 ? `${row.whole} ${row.numerator}/${row.denominator}` : `${row.numerator}/${row.denominator}`;
  if (row.family === "MIXED_NUMBER_MASS_TIMES_INTEGER") {
    return `一${row.object}重 ${base} 公斤，${row.multiplier} ${row.object}共重多少公斤？`;
  }
  return `一${row.object}裝有 ${base} 公升，${row.multiplier} ${row.object}共有多少公升？`;
}
function answerFor(row) {
  const productNumerator = baseImproperNumerator(row) * row.multiplier;
  return `${formatRational(productNumerator, row.denominator)} ${row.unit}`;
}
export function generateG4AU06P04F27FractionTimesIntegerQuantityQuestions(options = {}) {
  const plan = options.plan ?? options;
  const count = Number(options.questionCount ?? plan.questionCount ?? 8);
  const specs = plan.patternSpecIds ?? [];
  if (plan.sourceId !== G4A_U06_P04F27_SOURCE_ID || plan.questionMode !== "application" || specs.length !== 1 || specs[0] !== G4A_U06_P04F27_SPEC_ID || !Number.isInteger(count) || count < 1 || count > 240) {
    return Object.freeze({ ok: false, errors: Object.freeze([issue("p04f27_plan_invalid", "plan")]), warnings: Object.freeze([]), questions: Object.freeze([]), allocation: Object.freeze([]), plan });
  }
  const questions = shuffle(CASES.slice(0, count), options.generationSeed ?? plan.generationSeed ?? "p04f27-fraction-quantity").map((row) => {
    const prompt = promptFor(row);
    const answer = answerFor(row);
    const baseNumerator = baseImproperNumerator(row);
    const productNumerator = baseNumerator * row.multiplier;
    const simplified = simplify(productNumerator, row.denominator);
    return Object.freeze({
      id: `p04f27-${row.family}-${baseNumerator}-${row.denominator}-${row.multiplier}-${row.surfaceVariant}`,
      generatedItemId: `p04f27-${row.family}-${baseNumerator}-${row.denominator}-${row.multiplier}-${row.surfaceVariant}`,
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
        quantityDimension: row.family === "PROPER_FRACTION_LENGTH_TIMES_INTEGER" ? "LENGTH" : row.family === "MIXED_NUMBER_MASS_TIMES_INTEGER" ? "MASS" : "CAPACITY",
        unit: row.unit,
        object: row.object,
        surfaceVariant: row.surfaceVariant,
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
        unitConversion: false,
        operatorApprovedCapacityExtension: row.family === "FRACTION_CAPACITY_TIMES_INTEGER",
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
  const row = { family: metadata.presentationFamilyId, numerator: Number(metadata.baseNumerator), denominator, whole: Number(metadata.baseWhole), multiplier, unit: metadata.unit, object: metadata.object };
  const expectedPrompt = promptFor(row);
  const expectedAnswer = answerFor(row);
  if (question.promptText !== expectedPrompt || question.answerText !== expectedAnswer || question.finalAnswer !== expectedAnswer) errors.push(issue("p04f27_prompt_answer_mismatch", "answer"));
  const expectedDimension = metadata.presentationFamilyId === "PROPER_FRACTION_LENGTH_TIMES_INTEGER" ? "LENGTH" : metadata.presentationFamilyId === "MIXED_NUMBER_MASS_TIMES_INTEGER" ? "MASS" : "CAPACITY";
  const expectedUnit = expectedDimension === "LENGTH" ? "公尺" : expectedDimension === "MASS" ? "公斤" : "公升";
  if (metadata.quantityDimension !== expectedDimension || metadata.unit !== expectedUnit || metadata.unitConversion !== false) errors.push(issue("p04f27_quantity_unit_invalid", "metadata"));
  if (metadata.applicationRequired !== true || metadata.exactRationalArithmetic !== true || metadata.roundingUsed !== false || metadata.parallelFractionEngine !== false || metadata.sharedG4AU06FractionCoordinator !== true || metadata.sharedFractionRenderer !== true) errors.push(issue("p04f27_pipeline_or_exactness_invalid", "metadata"));
  if (JSON.stringify(metadata.sourceEvidencePages) !== "[3]" || metadata.q028Touched !== false) errors.push(issue("p04f27_source_or_scope_invalid", "metadata"));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}
export const P04F27_PRESENTATION_FAMILIES = FAMILIES;
