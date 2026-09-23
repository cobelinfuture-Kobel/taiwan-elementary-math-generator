export const PATH1_P1_03_DIVERSITY_PROFILE_ID = "PATH1_P1_03_TWO_DIGIT_BY_TWO_DIGIT_DIVERSITY_V1";
export const PATH1_P1_03_SOURCE_ID = "g4a_u02_4a02";
export const PATH1_P1_03_KNOWLEDGE_POINT_ID = "kp_g4a_u02_2digit_by_2digit";

export const PATH1_P1_03_PATTERN_FAMILIES = Object.freeze([
  Object.freeze({ familyId: "C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT", title: "二位數乘二位數直接計算" }),
  Object.freeze({ familyId: "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT", title: "部分積分解後求乘積" }),
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

function scopedOperand(leftFactor, rightFactor) {
  return Number.isInteger(leftFactor)
    && Number.isInteger(rightFactor)
    && leftFactor >= 10
    && leftFactor <= 99
    && rightFactor >= 10
    && rightFactor <= 99;
}

function baseMetadata(familyId) {
  return {
    path1DiversityProfileId: PATH1_P1_03_DIVERSITY_PROFILE_ID,
    path1PatternFamilyId: familyId,
    canonicalKnowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    sourceId: PATH1_P1_03_SOURCE_ID,
    canonicalKnowledgePointMinted: false,
    answerRole: "product",
    productOnlyAnswerRole: true,
    missingDigitInferenceUsed: false,
    applicationPromptUsed: false,
    relationPromptUsed: false,
  };
}

function directItem(leftFactor, rightFactor) {
  const familyId = "C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT";
  const product = leftFactor * rightFactor;
  return Object.freeze({
    generatedItemId: `path1-p1-03-${familyId}-${leftFactor}-${rightFactor}`,
    prompt: `${leftFactor} × ${rightFactor} = ______`,
    answerText: String(product),
    mode: "numeric",
    operationFamilyId: "PATH1_TWO_DIGIT_BY_TWO_DIGIT_DIVERSITY",
    sourceNodeId: PATH1_P1_03_SOURCE_ID,
    knowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    metadata: Object.freeze({
      ...baseMetadata(familyId),
      leftFactor,
      rightFactor,
      product,
      partialProductsExposed: false,
    }),
  });
}

function decompositionItem(leftFactor, rightFactor) {
  const familyId = "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT";
  const tensDigit = Math.floor(rightFactor / 10);
  const onesDigit = rightFactor % 10;
  const tensFactor = tensDigit * 10;
  const onesFactor = onesDigit;
  const tensPartialProduct = leftFactor * tensFactor;
  const onesPartialProduct = leftFactor * onesFactor;
  const product = leftFactor * rightFactor;
  return Object.freeze({
    generatedItemId: `path1-p1-03-${familyId}-${leftFactor}-${rightFactor}`,
    prompt: `${leftFactor} × ${rightFactor} = ${leftFactor} × ${tensFactor} + ${leftFactor} × ${onesFactor} = ______`,
    answerText: String(product),
    mode: "numeric",
    operationFamilyId: "PATH1_TWO_DIGIT_BY_TWO_DIGIT_DIVERSITY",
    sourceNodeId: PATH1_P1_03_SOURCE_ID,
    knowledgePointId: PATH1_P1_03_KNOWLEDGE_POINT_ID,
    metadata: Object.freeze({
      ...baseMetadata(familyId),
      leftFactor,
      rightFactor,
      product,
      tensDigit,
      onesDigit,
      tensFactor,
      onesFactor,
      tensPartialProduct,
      onesPartialProduct,
      reconstructedProduct: tensPartialProduct + onesPartialProduct,
      partialProductsExposed: true,
      tensPartialProductIncludesPlaceShift: true,
    }),
  });
}

function buildFamilyPool(builder) {
  const pool = [];
  for (let leftFactor = 10; leftFactor <= 99; leftFactor += 1) {
    for (let rightFactor = 10; rightFactor <= 99; rightFactor += 1) {
      pool.push(builder(leftFactor, rightFactor));
    }
  }
  return Object.freeze(pool);
}

const FAMILY_POOLS = new Map([
  ["C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT", buildFamilyPool(directItem)],
  ["C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT", buildFamilyPool(decompositionItem)],
]);

const ALL_PROMPTS = [...FAMILY_POOLS.values()].flat().map((entry) => entry.prompt);
export const PATH1_P1_03_DISTINCT_PROMPT_CAPACITY = new Set(ALL_PROMPTS).size;

export function validatePath1P103DiversityItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const familyId = metadata.path1PatternFamilyId;
  const leftFactor = Number(metadata.leftFactor);
  const rightFactor = Number(metadata.rightFactor);
  const product = Number(metadata.product);

  if (!PATH1_P1_03_PATTERN_FAMILIES.some((family) => family.familyId === familyId)) errors.push("UNKNOWN_PATTERN_FAMILY");
  if (entry?.knowledgePointId !== PATH1_P1_03_KNOWLEDGE_POINT_ID) errors.push("KP_ID_MISMATCH");
  if (metadata.canonicalKnowledgePointId !== PATH1_P1_03_KNOWLEDGE_POINT_ID) errors.push("CANONICAL_KP_METADATA_MISMATCH");
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push("CANONICAL_KP_MINTED");
  if (metadata.answerRole !== "product" || metadata.productOnlyAnswerRole !== true) errors.push("ANSWER_ROLE_SCOPE_LEAK");
  if (metadata.missingDigitInferenceUsed !== false) errors.push("MISSING_DIGIT_SCOPE_LEAK");
  if (metadata.applicationPromptUsed !== false) errors.push("APPLICATION_SCOPE_LEAK");
  if (metadata.relationPromptUsed !== false) errors.push("RELATION_SCOPE_LEAK");
  if (entry?.mode !== "numeric") errors.push("QUESTION_MODE_SCOPE_LEAK");
  if (!String(entry?.prompt ?? "").trim()) errors.push("PROMPT_EMPTY");
  if (!String(entry?.answerText ?? "").trim()) errors.push("ANSWER_EMPTY");
  if (!scopedOperand(leftFactor, rightFactor)) errors.push("OPERAND_OUT_OF_SCOPE");
  if (product !== leftFactor * rightFactor) errors.push("PRODUCT_INVARIANT_FAILED");
  if (entry?.answerText !== String(product)) errors.push("ANSWER_MISMATCH");

  if (familyId === "C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT") {
    if (metadata.partialProductsExposed !== false) errors.push("C0_PARTIAL_PRODUCT_SCOPE_LEAK");
  } else if (familyId === "C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT") {
    const tensDigit = Math.floor(rightFactor / 10);
    const onesDigit = rightFactor % 10;
    const tensFactor = tensDigit * 10;
    const onesFactor = onesDigit;
    const tensPartialProduct = leftFactor * tensFactor;
    const onesPartialProduct = leftFactor * onesFactor;
    if (metadata.partialProductsExposed !== true) errors.push("C1_PARTIAL_PRODUCTS_NOT_EXPOSED");
    if (metadata.tensDigit !== tensDigit || metadata.onesDigit !== onesDigit) errors.push("C1_DIGIT_DECOMPOSITION_FAILED");
    if (metadata.tensFactor !== tensFactor || metadata.onesFactor !== onesFactor) errors.push("C1_FACTOR_DECOMPOSITION_FAILED");
    if (metadata.tensPartialProduct !== tensPartialProduct) errors.push("C1_TENS_PARTIAL_PRODUCT_FAILED");
    if (metadata.onesPartialProduct !== onesPartialProduct) errors.push("C1_ONES_PARTIAL_PRODUCT_FAILED");
    if (metadata.reconstructedProduct !== product) errors.push("C1_RECONSTRUCTED_PRODUCT_FAILED");
    if (metadata.tensPartialProductIncludesPlaceShift !== true) errors.push("C1_TENS_PLACE_SHIFT_FAILED");
  }

  return { ok: errors.length === 0, errors };
}

export function buildPath1P103DiversityItems({ count = 20, seed = "path1-p1-03" } = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(requested, PATH1_P1_03_PATTERN_FAMILIES.length, `${seed}:families`);
  const selected = [];

  for (let index = 0; index < PATH1_P1_03_PATTERN_FAMILIES.length; index += 1) {
    const familyId = PATH1_P1_03_PATTERN_FAMILIES[index].familyId;
    const needed = familyCounts[index];
    const pool = FAMILY_POOLS.get(familyId) ?? [];
    if (pool.length < needed) {
      return {
        ok: false,
        items: [],
        errors: [{ code: "PATH1_P1_03_FAMILY_CAPACITY_FAILED", familyId, requested: needed, available: pool.length }],
      };
    }
    selected.push(...seededShuffle(pool, `${seed}:${familyId}`).slice(0, needed));
  }

  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P103DiversityItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_03_DIVERSITY_VALIDATION_FAILED", failures: validationFailures }],
    };
  }

  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_03_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }

  const familySummary = Object.fromEntries(PATH1_P1_03_PATTERN_FAMILIES.map(({ familyId }) => [
    familyId,
    items.filter((entry) => entry.metadata.path1PatternFamilyId === familyId).length,
  ]));

  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      patternFamilyCount: PATH1_P1_03_PATTERN_FAMILIES.length,
      distinctPromptCapacity: PATH1_P1_03_DISTINCT_PROMPT_CAPACITY,
      familyCounts: familySummary,
      knowledgePointCounts: {
        [PATH1_P1_03_KNOWLEDGE_POINT_ID]: items.length,
      },
      productOnlyAnswerCount: items.filter((entry) => entry.metadata.productOnlyAnswerRole === true).length,
    },
  };
}
