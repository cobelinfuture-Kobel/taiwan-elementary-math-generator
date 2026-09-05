export const PATH1_P1_01_DIVERSITY_PROFILE_ID = "PATH1_P1_01_TENS_MULTIPLICATION_DIVERSITY_V1";
export const PATH1_P1_01_KNOWLEDGE_POINT_ID = "kp_g3a_u03_10_multiple_by_1digit";
export const PATH1_P1_01_SOURCE_ID = "g3a_u03_3a03";

export const PATH1_P1_01_PATTERN_FAMILIES = Object.freeze([
  Object.freeze({ familyId: "C0_DIRECT_TENS_MULTIPLICATION", title: "直接十位整十數乘法" }),
  Object.freeze({ familyId: "C1_BASE_FACT_TO_TENS_SCALE", title: "基本乘法事實轉十倍" }),
  Object.freeze({ familyId: "C2_NUMBER_OF_TENS_REPRESENTATION", title: "幾個十的表示" }),
  Object.freeze({ familyId: "C3_DECOMPOSITION_EQUIVALENT_EXPRESSION", title: "十進位分解等值式" }),
  Object.freeze({ familyId: "C4_PARTIAL_PRODUCT_MISSING_DIGIT", title: "乘積缺位" }),
  Object.freeze({ familyId: "C5_MISCONCEPTION_DIAGNOSIS", title: "常見錯誤辨識與改正" }),
]);

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

function baseMetadata({ familyId, tens, digit, product, variantId = null }) {
  return {
    path1DiversityProfileId: PATH1_P1_01_DIVERSITY_PROFILE_ID,
    path1PatternFamilyId: familyId,
    canonicalKnowledgePointId: PATH1_P1_01_KNOWLEDGE_POINT_ID,
    sourceId: PATH1_P1_01_SOURCE_ID,
    tens,
    multiplicand: tens * 10,
    digit,
    product,
    variantId,
    reasoningInvariant: "(a×10)×b=(a×b)×10",
    canonicalKnowledgePointMinted: false,
  };
}

function item({ familyId, tens, digit, prompt, answerText, variantId = null, extraMetadata = {} }) {
  const multiplicand = tens * 10;
  const product = multiplicand * digit;
  return {
    generatedItemId: `path1-p1-01-${familyId}-${tens}-${digit}${variantId === null ? "" : `-${variantId}`}`,
    prompt,
    answerText,
    mode: "numeric",
    operationFamilyId: "PATH1_TENS_MULTIPLICATION_DIVERSITY",
    sourceNodeId: PATH1_P1_01_SOURCE_ID,
    knowledgePointId: PATH1_P1_01_KNOWLEDGE_POINT_ID,
    metadata: {
      ...baseMetadata({ familyId, tens, digit, product, variantId }),
      ...extraMetadata,
    },
  };
}

function missingTensDigit(product) {
  const text = String(product);
  const index = Math.max(0, text.length - 2);
  return {
    masked: `${text.slice(0, index)}□${text.slice(index + 1)}`,
    digit: text[index],
  };
}

function misconceptionWrongAnswers(tens, digit) {
  const baseFact = tens * digit;
  const product = baseFact * 10;
  const basicFactDelta = 1 + ((tens + digit) % 3);
  return [
    Object.freeze({ misconceptionId: "DROP_PLACE_VALUE_ZERO", wrongAnswer: baseFact }),
    Object.freeze({ misconceptionId: "ADD_EXTRA_ZERO", wrongAnswer: product * 10 }),
    Object.freeze({ misconceptionId: "WRONG_BASIC_FACT_KEEP_TENS_SCALE", wrongAnswer: (baseFact + basicFactDelta) * 10 }),
  ];
}

function candidatesForFamily(familyId) {
  const candidates = [];
  for (let tens = 1; tens <= 9; tens += 1) {
    for (let digit = 2; digit <= 9; digit += 1) {
      const multiplicand = tens * 10;
      const baseFact = tens * digit;
      const product = multiplicand * digit;
      if (familyId === "C0_DIRECT_TENS_MULTIPLICATION") {
        candidates.push(item({
          familyId,
          tens,
          digit,
          prompt: `${multiplicand} × ${digit} = ______`,
          answerText: String(product),
        }));
      } else if (familyId === "C1_BASE_FACT_TO_TENS_SCALE") {
        candidates.push(item({
          familyId,
          tens,
          digit,
          prompt: `${tens} × ${digit} = ${baseFact}，所以 ${multiplicand} × ${digit} = ______`,
          answerText: String(product),
          extraMetadata: { schoolExamPresentationVariant: "BASE_TO_TENS_LINK" },
        }));
      } else if (familyId === "C2_NUMBER_OF_TENS_REPRESENTATION") {
        candidates.push(item({
          familyId,
          tens,
          digit,
          prompt: `${tens} 個十 × ${digit} = ______ 個十 = ______`,
          answerText: `${baseFact} 個十 = ${product}`,
        }));
      } else if (familyId === "C3_DECOMPOSITION_EQUIVALENT_EXPRESSION") {
        candidates.push(item({
          familyId,
          tens,
          digit,
          prompt: `${multiplicand} × ${digit} = (${tens} × ${digit}) × 10 = ______`,
          answerText: String(product),
        }));
      } else if (familyId === "C4_PARTIAL_PRODUCT_MISSING_DIGIT") {
        const missing = missingTensDigit(product);
        candidates.push(item({
          familyId,
          tens,
          digit,
          prompt: `${multiplicand} × ${digit} = ${missing.masked}，□ = ______`,
          answerText: missing.digit,
          extraMetadata: { hiddenProductDigit: missing.digit, maskedProduct: missing.masked },
        }));
      } else if (familyId === "C5_MISCONCEPTION_DIAGNOSIS") {
        for (const misconception of misconceptionWrongAnswers(tens, digit)) {
          candidates.push(item({
            familyId,
            tens,
            digit,
            variantId: misconception.misconceptionId,
            prompt: `有人寫成「${multiplicand} × ${digit} = ${misconception.wrongAnswer}」。判斷並改正：______`,
            answerText: `不正確，${multiplicand} × ${digit} = ${product}`,
            extraMetadata: misconception,
          }));
        }
      }
    }
  }
  return candidates;
}

const FAMILY_POOLS = new Map(PATH1_P1_01_PATTERN_FAMILIES.map(({ familyId }) => [
  familyId,
  Object.freeze(candidatesForFamily(familyId)),
]));

const ALL_PROMPTS = [...FAMILY_POOLS.values()].flat().map((entry) => entry.prompt);
export const PATH1_P1_01_DISTINCT_PROMPT_CAPACITY = new Set(ALL_PROMPTS).size;

export function validatePath1P101DiversityItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const tens = Number(metadata.tens);
  const digit = Number(metadata.digit);
  const multiplicand = Number(metadata.multiplicand);
  const product = Number(metadata.product);
  if (!PATH1_P1_01_PATTERN_FAMILIES.some((family) => family.familyId === metadata.path1PatternFamilyId)) {
    errors.push("UNKNOWN_PATTERN_FAMILY");
  }
  if (!Number.isInteger(tens) || tens < 1 || tens > 9) errors.push("TENS_OUT_OF_RANGE");
  if (!Number.isInteger(digit) || digit < 2 || digit > 9) errors.push("DIGIT_OUT_OF_RANGE");
  if (multiplicand !== tens * 10) errors.push("MULTIPLICAND_NOT_TENS_MULTIPLE");
  if (product !== multiplicand * digit) errors.push("PRODUCT_INVARIANT_FAILED");
  if (entry?.knowledgePointId !== PATH1_P1_01_KNOWLEDGE_POINT_ID) errors.push("KP_ID_MISMATCH");
  if (!String(entry?.prompt ?? "").trim()) errors.push("PROMPT_EMPTY");
  if (!String(entry?.answerText ?? "").trim()) errors.push("ANSWER_EMPTY");
  if (metadata.path1PatternFamilyId === "C4_PARTIAL_PRODUCT_MISSING_DIGIT") {
    const expected = missingTensDigit(product);
    if (entry.answerText !== expected.digit || metadata.maskedProduct !== expected.masked) errors.push("MISSING_DIGIT_ANSWER_MISMATCH");
  } else if (metadata.path1PatternFamilyId === "C5_MISCONCEPTION_DIAGNOSIS") {
    if (Number(metadata.wrongAnswer) === product) errors.push("MISCONCEPTION_NOT_ACTUALLY_WRONG");
    if (!entry.answerText.includes(String(product))) errors.push("MISCONCEPTION_CORRECTION_MISSING_PRODUCT");
  } else if (!entry.answerText.includes(String(product))) {
    errors.push("ANSWER_PRODUCT_MISMATCH");
  }
  return { ok: errors.length === 0, errors };
}

export function buildPath1P101DiversityItems({ count = 20, seed = "path1-p1-01" } = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(requested, PATH1_P1_01_PATTERN_FAMILIES.length, `${seed}:allocation`);
  const selected = [];
  for (let index = 0; index < PATH1_P1_01_PATTERN_FAMILIES.length; index += 1) {
    const { familyId } = PATH1_P1_01_PATTERN_FAMILIES[index];
    const pool = FAMILY_POOLS.get(familyId) ?? [];
    const needed = familyCounts[index];
    if (pool.length < needed) {
      return {
        ok: false,
        items: [],
        errors: [{ code: "PATH1_P1_01_FAMILY_CAPACITY_FAILED", familyId, requested: needed, available: pool.length }],
      };
    }
    selected.push(...seededShuffle(pool, `${seed}:${familyId}`).slice(0, needed));
  }
  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P101DiversityItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_01_DIVERSITY_VALIDATION_FAILED", failures: validationFailures }],
    };
  }
  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_01_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }
  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      patternFamilyCount: PATH1_P1_01_PATTERN_FAMILIES.length,
      distinctPromptCapacity: PATH1_P1_01_DISTINCT_PROMPT_CAPACITY,
      familyCounts: Object.fromEntries(PATH1_P1_01_PATTERN_FAMILIES.map(({ familyId }, index) => [familyId, familyCounts[index]])),
    },
  };
}
