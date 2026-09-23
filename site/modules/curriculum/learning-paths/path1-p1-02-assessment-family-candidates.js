import {
  PATH1_P1_02_DIVERSITY_PROFILE_ID,
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
  PATH1_P1_02_SOURCE_ID,
} from "./path1-p1-02-diversity.js";

export const PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID =
  "PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES_V1";

export const PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES = Object.freeze([
  Object.freeze({
    familyId: "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT",
    title: "位值分解後求乘積",
    sourceEvidence: "batchA_01-題型總覽-3a03-乘法.pdf:p1:10進位乘法的原理",
  }),
  Object.freeze({
    familyId: "C3_COLUMN_CARRY_TRACE_PRODUCT",
    title: "直式進位步驟追蹤後求乘積",
    sourceEvidence: "batchA_01-題型總覽-3a03-乘法.pdf:p1:二位數直接進位與三位數乘一位數",
  }),
]);

export const PATH1_P1_02_DEFERRED_ASSESSMENT_FAMILIES = Object.freeze([
  Object.freeze({
    familyId: "PRODUCT_DIGIT_COMPLETION",
    reason: "BOUNDARY_AMBIGUOUS_WITH_KP_G3A_U03_MULTIPLICATION_MISSING_DIGIT_INFERENCE",
  }),
  Object.freeze({
    familyId: "ESTIMATION",
    reason: "SOURCE_PRESENT_BUT_NOT_PART_OF_CURRENT_P1_02_CANONICAL_KP_BINDING",
  }),
  Object.freeze({
    familyId: "TWO_STEP_CONTINUOUS_MULTIPLICATION",
    reason: "SOURCE_PRESENT_BUT_CROSS_STEP_APPLICATION_IS_OUTSIDE_P1_02_CORE_SCOPE",
  }),
  Object.freeze({
    familyId: "ALGORITHM_JUDGEMENT_OR_ERROR_DIAGNOSIS",
    reason: "PRIMARY_3A_U03_SOURCE_DOES_NOT_ESTABLISH_THIS_AS_A_CORE_ASSESSMENT_FAMILY",
  }),
]);

const TWO_DIGIT_KP_ID = PATH1_P1_02_KNOWLEDGE_POINT_IDS[0];
const THREE_DIGIT_KP_ID = PATH1_P1_02_KNOWLEDGE_POINT_IDS[1];

function hashSeed(input) {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(values, seed) {
  const result = [...values];
  let state = hashSeed(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function allocateCounts(total, itemCount, seed) {
  const counts = Array.from({ length: itemCount }, () => 0);
  if (total < 1 || itemCount < 1) return counts;
  const base = Math.floor(total / itemCount);
  const remainder = total % itemCount;
  counts.fill(base);
  const start = hashSeed(seed) % itemCount;
  for (let index = 0; index < remainder; index += 1) {
    counts[(start + index) % itemCount] += 1;
  }
  return counts;
}

function operandInP102Scope(knowledgePointId, multiplicand, digit) {
  if (!Number.isInteger(digit) || digit < 2 || digit > 9) return false;
  if (knowledgePointId === TWO_DIGIT_KP_ID) {
    return Number.isInteger(multiplicand)
      && multiplicand >= 10
      && multiplicand <= 99
      && (multiplicand % 10) * digit >= 10;
  }
  if (knowledgePointId === THREE_DIGIT_KP_ID) {
    const tensDigit = Math.floor(multiplicand / 10) % 10;
    const onesDigit = multiplicand % 10;
    return Number.isInteger(multiplicand)
      && multiplicand >= 100
      && multiplicand <= 999
      && tensDigit !== 0
      && onesDigit !== 0;
  }
  return false;
}

function buildOperandPool(knowledgePointId) {
  const start = knowledgePointId === TWO_DIGIT_KP_ID ? 10 : 100;
  const end = knowledgePointId === TWO_DIGIT_KP_ID ? 99 : 999;
  const pool = [];
  for (let multiplicand = start; multiplicand <= end; multiplicand += 1) {
    for (let digit = 2; digit <= 9; digit += 1) {
      if (!operandInP102Scope(knowledgePointId, multiplicand, digit)) continue;
      pool.push(Object.freeze({ multiplicand, digit, product: multiplicand * digit }));
    }
  }
  return Object.freeze(pool);
}

const OPERAND_POOLS = new Map(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
  knowledgePointId,
  buildOperandPool(knowledgePointId),
]));

function candidateMetadata({ familyId, knowledgePointId, operand }) {
  return {
    path1DiversityProfileId: PATH1_P1_02_DIVERSITY_PROFILE_ID,
    path1AssessmentCandidateProfileId: PATH1_P1_02_ASSESSMENT_CANDIDATE_PROFILE_ID,
    path1PatternFamilyId: familyId,
    canonicalKnowledgePointId: knowledgePointId,
    sourceId: PATH1_P1_02_SOURCE_ID,
    sourceEvidence: PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.find((family) => family.familyId === familyId)?.sourceEvidence,
    multiplicand: operand.multiplicand,
    digit: operand.digit,
    product: operand.product,
    answerRole: "product",
    candidateOnly: true,
    publicCutoverApproved: false,
    canonicalKnowledgePointMinted: false,
    missingDigitInferenceUsed: false,
    estimationUsed: false,
    multiStepApplicationUsed: false,
    zeroSpecialCaseRoutedHere: false,
  };
}

function decompositionParts(multiplicand) {
  if (multiplicand < 100) {
    return [Math.floor(multiplicand / 10) * 10, multiplicand % 10];
  }
  return [
    Math.floor(multiplicand / 100) * 100,
    (Math.floor(multiplicand / 10) % 10) * 10,
    multiplicand % 10,
  ];
}

function decompositionItem(knowledgePointId, operand) {
  const familyId = "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT";
  const parts = decompositionParts(operand.multiplicand);
  const partialProducts = parts.map((part) => part * operand.digit);
  const expression = parts.map((part) => `${part} × ${operand.digit}`).join(" + ");
  return Object.freeze({
    generatedItemId: `path1-p1-02-candidate-${familyId}-${knowledgePointId}-${operand.multiplicand}-${operand.digit}`,
    prompt: `${operand.multiplicand} × ${operand.digit} = ${expression} = ______`,
    answerText: String(operand.product),
    mode: "numeric",
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_ASSESSMENT_CANDIDATE",
    sourceNodeId: PATH1_P1_02_SOURCE_ID,
    knowledgePointId,
    metadata: Object.freeze({
      ...candidateMetadata({ familyId, knowledgePointId, operand }),
      decompositionParts: Object.freeze(parts),
      partialProducts: Object.freeze(partialProducts),
      reconstructedProduct: partialProducts.reduce((sum, value) => sum + value, 0),
      assessmentIntent: "PLACE_VALUE_DECOMPOSITION",
    }),
  });
}

function carryPhrase(carry) {
  return carry > 0 ? `進 ${carry}` : "不進位";
}

function columnTrace(operand) {
  const onesDigit = operand.multiplicand % 10;
  const tensDigit = Math.floor(operand.multiplicand / 10) % 10;
  const hundredsDigit = Math.floor(operand.multiplicand / 100) % 10;
  const onesTotal = onesDigit * operand.digit;
  const onesWritten = onesTotal % 10;
  const carryToTens = Math.floor(onesTotal / 10);
  const tensTotal = tensDigit * operand.digit + carryToTens;
  const tensWritten = tensTotal % 10;
  const carryToHundreds = Math.floor(tensTotal / 10);
  const hundredsTotal = hundredsDigit * operand.digit + carryToHundreds;
  return {
    onesDigit,
    tensDigit,
    hundredsDigit,
    onesTotal,
    onesWritten,
    carryToTens,
    tensTotal,
    tensWritten,
    carryToHundreds,
    hundredsTotal,
  };
}

function columnTraceItem(knowledgePointId, operand) {
  const familyId = "C3_COLUMN_CARRY_TRACE_PRODUCT";
  const trace = columnTrace(operand);
  const prompt = knowledgePointId === TWO_DIGIT_KP_ID
    ? `計算 ${operand.multiplicand} × ${operand.digit}：個位 ${trace.onesDigit} × ${operand.digit} = ${trace.onesTotal}，寫 ${trace.onesWritten}，${carryPhrase(trace.carryToTens)}；十位 ${trace.tensDigit} × ${operand.digit} + ${trace.carryToTens} = ${trace.tensTotal}；乘積 = ______`
    : `計算 ${operand.multiplicand} × ${operand.digit}：個位 ${trace.onesDigit} × ${operand.digit} = ${trace.onesTotal}，寫 ${trace.onesWritten}，${carryPhrase(trace.carryToTens)}；十位 ${trace.tensDigit} × ${operand.digit} + ${trace.carryToTens} = ${trace.tensTotal}，寫 ${trace.tensWritten}，${carryPhrase(trace.carryToHundreds)}；百位 ${trace.hundredsDigit} × ${operand.digit} + ${trace.carryToHundreds} = ${trace.hundredsTotal}；乘積 = ______`;
  return Object.freeze({
    generatedItemId: `path1-p1-02-candidate-${familyId}-${knowledgePointId}-${operand.multiplicand}-${operand.digit}`,
    prompt,
    answerText: String(operand.product),
    mode: "numeric",
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_ASSESSMENT_CANDIDATE",
    sourceNodeId: PATH1_P1_02_SOURCE_ID,
    knowledgePointId,
    metadata: Object.freeze({
      ...candidateMetadata({ familyId, knowledgePointId, operand }),
      assessmentIntent: "COLUMN_ALGORITHM_TRACE",
      columnTrace: Object.freeze(trace),
    }),
  });
}

const FAMILY_BUILDERS = new Map([
  ["C2_PLACE_VALUE_DECOMPOSITION_PRODUCT", decompositionItem],
  ["C3_COLUMN_CARRY_TRACE_PRODUCT", columnTraceItem],
]);

const FAMILY_POOLS = new Map(PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.map(({ familyId }) => [
  familyId,
  new Map(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
    knowledgePointId,
    Object.freeze((OPERAND_POOLS.get(knowledgePointId) ?? []).map((operand) => (
      FAMILY_BUILDERS.get(familyId)(knowledgePointId, operand)
    ))),
  ])),
]));

const ALL_CANDIDATE_PROMPTS = [...FAMILY_POOLS.values()].flatMap((kpMap) => (
  [...kpMap.values()].flat().map((entry) => entry.prompt)
));

export const PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY =
  new Set(ALL_CANDIDATE_PROMPTS).size;

export function validatePath1P102AssessmentFamilyCandidate(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const familyId = metadata.path1PatternFamilyId;
  const knowledgePointId = entry?.knowledgePointId;
  const multiplicand = Number(metadata.multiplicand);
  const digit = Number(metadata.digit);
  const product = Number(metadata.product);

  if (!PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.some((family) => family.familyId === familyId)) errors.push("UNKNOWN_CANDIDATE_FAMILY");
  if (!PATH1_P1_02_KNOWLEDGE_POINT_IDS.includes(knowledgePointId)) errors.push("KP_ID_MISMATCH");
  if (metadata.canonicalKnowledgePointId !== knowledgePointId) errors.push("CANONICAL_KP_METADATA_MISMATCH");
  if (!operandInP102Scope(knowledgePointId, multiplicand, digit)) errors.push("OPERAND_OUT_OF_P1_02_SCOPE");
  if (product !== multiplicand * digit) errors.push("PRODUCT_INVARIANT_FAILED");
  if (entry?.answerText !== String(product)) errors.push("ANSWER_PRODUCT_MISMATCH");
  if (metadata.answerRole !== "product") errors.push("ANSWER_ROLE_SCOPE_LEAK");
  if (metadata.candidateOnly !== true || metadata.publicCutoverApproved !== false) errors.push("CANDIDATE_CUTOVER_SCOPE_LEAK");
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push("CANONICAL_KP_MINTED");
  if (metadata.missingDigitInferenceUsed !== false) errors.push("MISSING_DIGIT_SCOPE_LEAK");
  if (metadata.estimationUsed !== false) errors.push("ESTIMATION_SCOPE_LEAK");
  if (metadata.multiStepApplicationUsed !== false) errors.push("MULTI_STEP_SCOPE_LEAK");
  if (metadata.zeroSpecialCaseRoutedHere !== false) errors.push("ZERO_SPECIAL_SCOPE_LEAK");
  if (!String(metadata.sourceEvidence ?? "").includes("batchA_01-題型總覽-3a03-乘法.pdf")) errors.push("SOURCE_EVIDENCE_MISSING");

  if (familyId === "C2_PLACE_VALUE_DECOMPOSITION_PRODUCT") {
    const expectedParts = decompositionParts(multiplicand);
    const expectedPartialProducts = expectedParts.map((part) => part * digit);
    if (JSON.stringify(metadata.decompositionParts) !== JSON.stringify(expectedParts)) errors.push("DECOMPOSITION_PARTS_MISMATCH");
    if (JSON.stringify(metadata.partialProducts) !== JSON.stringify(expectedPartialProducts)) errors.push("PARTIAL_PRODUCTS_MISMATCH");
    if (metadata.reconstructedProduct !== product) errors.push("RECONSTRUCTED_PRODUCT_MISMATCH");
  } else if (familyId === "C3_COLUMN_CARRY_TRACE_PRODUCT") {
    const expectedTrace = columnTrace({ multiplicand, digit, product });
    if (JSON.stringify(metadata.columnTrace) !== JSON.stringify(expectedTrace)) errors.push("COLUMN_TRACE_MISMATCH");
  }

  return { ok: errors.length === 0, errors };
}

export function buildPath1P102AssessmentFamilyCandidates({
  count = 20,
  seed = "path1-p1-02-assessment-candidates",
} = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(requested, PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.length, `${seed}:families`);
  const selected = [];

  for (let familyIndex = 0; familyIndex < PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.length; familyIndex += 1) {
    const { familyId } = PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES[familyIndex];
    const familyNeeded = familyCounts[familyIndex];
    const kpCounts = allocateCounts(familyNeeded, PATH1_P1_02_KNOWLEDGE_POINT_IDS.length, `${seed}:${familyId}:kp`);
    const kpMap = FAMILY_POOLS.get(familyId) ?? new Map();
    for (let kpIndex = 0; kpIndex < PATH1_P1_02_KNOWLEDGE_POINT_IDS.length; kpIndex += 1) {
      const knowledgePointId = PATH1_P1_02_KNOWLEDGE_POINT_IDS[kpIndex];
      const needed = kpCounts[kpIndex];
      if (needed === 0) continue;
      const pool = kpMap.get(knowledgePointId) ?? [];
      if (pool.length < needed) {
        return {
          ok: false,
          items: [],
          errors: [{ code: "PATH1_P1_02_ASSESSMENT_CANDIDATE_CAPACITY_FAILED", familyId, knowledgePointId, requested: needed, available: pool.length }],
        };
      }
      selected.push(...seededShuffle(pool, `${seed}:${familyId}:${knowledgePointId}`).slice(0, needed));
    }
  }

  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P102AssessmentFamilyCandidate(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_ASSESSMENT_CANDIDATE_VALIDATION_FAILED", failures: validationFailures }],
    };
  }

  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_ASSESSMENT_CANDIDATE_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }

  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      candidateFamilyCount: PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.length,
      distinctPromptCapacity: PATH1_P1_02_ASSESSMENT_CANDIDATE_DISTINCT_PROMPT_CAPACITY,
      publicCutoverApproved: false,
      familyCounts: Object.fromEntries(PATH1_P1_02_ASSESSMENT_FAMILY_CANDIDATES.map(({ familyId }) => [
        familyId,
        items.filter((entry) => entry.metadata.path1PatternFamilyId === familyId).length,
      ])),
      knowledgePointCounts: Object.fromEntries(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
        knowledgePointId,
        items.filter((entry) => entry.knowledgePointId === knowledgePointId).length,
      ])),
    },
  };
}
