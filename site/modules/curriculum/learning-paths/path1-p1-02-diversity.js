export const PATH1_P1_02_DIVERSITY_PROFILE_ID = "PATH1_P1_02_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY_V1";
export const PATH1_P1_02_SOURCE_ID = "g3a_u03_3a03";
export const PATH1_P1_02_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g3a_u03_2digit_by_1digit_carry",
  "kp_g3a_u03_3digit_by_1digit",
]);

export const PATH1_P1_02_PATTERN_FAMILIES = Object.freeze([
  Object.freeze({ familyId: "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT", title: "多位數乘以一位數直接計算" }),
  Object.freeze({ familyId: "C1_PRODUCT_RELATION_SELECTION", title: "乘積關係判斷" }),
]);

export const PATH1_P1_02_RELATION_MODES = Object.freeze([
  "ORDER_SAME_MULTIPLIER",
  "ORDER_SAME_MULTIPLICAND",
  "EQUALITY_JUDGMENT",
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

function hasDirectOnesCarry(multiplicand, digit) {
  return (multiplicand % 10) * digit >= 10;
}

function excludesThreeDigitZeroSpecial(multiplicand) {
  const tensDigit = Math.floor(multiplicand / 10) % 10;
  const onesDigit = multiplicand % 10;
  return tensDigit !== 0 && onesDigit !== 0;
}

function operandValidForKnowledgePoint(knowledgePointId, multiplicand, digit) {
  if (!Number.isInteger(digit) || digit < 2 || digit > 9) return false;
  if (knowledgePointId === TWO_DIGIT_KP_ID) {
    return Number.isInteger(multiplicand)
      && multiplicand >= 10
      && multiplicand <= 99
      && hasDirectOnesCarry(multiplicand, digit);
  }
  if (knowledgePointId === THREE_DIGIT_KP_ID) {
    return Number.isInteger(multiplicand)
      && multiplicand >= 100
      && multiplicand <= 999
      && excludesThreeDigitZeroSpecial(multiplicand);
  }
  return false;
}

function buildOperandPool(knowledgePointId) {
  const pool = [];
  const start = knowledgePointId === TWO_DIGIT_KP_ID ? 10 : 100;
  const end = knowledgePointId === TWO_DIGIT_KP_ID ? 99 : 999;
  for (let multiplicand = start; multiplicand <= end; multiplicand += 1) {
    for (let digit = 2; digit <= 9; digit += 1) {
      if (!operandValidForKnowledgePoint(knowledgePointId, multiplicand, digit)) continue;
      pool.push(Object.freeze({ multiplicand, digit, product: multiplicand * digit }));
    }
  }
  return Object.freeze(pool);
}

const OPERAND_POOLS = new Map(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
  knowledgePointId,
  buildOperandPool(knowledgePointId),
]));

function baseMetadata({ familyId, knowledgePointId, variantId = null }) {
  return {
    path1DiversityProfileId: PATH1_P1_02_DIVERSITY_PROFILE_ID,
    path1PatternFamilyId: familyId,
    canonicalKnowledgePointId: knowledgePointId,
    sourceId: PATH1_P1_02_SOURCE_ID,
    variantId,
    canonicalKnowledgePointMinted: false,
    missingDigitInferenceUsed: false,
    zeroSpecialCaseRoutedHere: false,
  };
}

function directItem(knowledgePointId, operand) {
  const familyId = "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT";
  return Object.freeze({
    generatedItemId: `path1-p1-02-${familyId}-${knowledgePointId}-${operand.multiplicand}-${operand.digit}`,
    prompt: `${operand.multiplicand} × ${operand.digit} = ______`,
    answerText: String(operand.product),
    mode: "numeric",
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY",
    sourceNodeId: PATH1_P1_02_SOURCE_ID,
    knowledgePointId,
    metadata: Object.freeze({
      ...baseMetadata({ familyId, knowledgePointId }),
      multiplicand: operand.multiplicand,
      digit: operand.digit,
      product: operand.product,
      carryFromOnesToTensRequired: knowledgePointId === TWO_DIGIT_KP_ID,
      carryFromOnesToTens: hasDirectOnesCarry(operand.multiplicand, operand.digit),
      zeroSpecialExcluded: knowledgePointId === THREE_DIGIT_KP_ID,
    }),
  });
}

function relationSymbol(leftProduct, rightProduct) {
  if (leftProduct < rightProduct) return "<";
  if (leftProduct > rightProduct) return ">";
  return "=";
}

function relationItem({ knowledgePointId, relationMode, left, right, index }) {
  const familyId = "C1_PRODUCT_RELATION_SELECTION";
  const symbol = relationSymbol(left.product, right.product);
  const isEquality = relationMode === "EQUALITY_JUDGMENT";
  const prompt = isEquality
    ? `${left.multiplicand} × ${left.digit} 和 ${right.multiplicand} × ${right.digit} 的乘積（相同／不同）：______`
    : `${left.multiplicand} × ${left.digit} ○ ${right.multiplicand} × ${right.digit}，○ 填入 >、< 或 =`;
  const answerText = isEquality ? (symbol === "=" ? "相同" : "不同") : symbol;
  return Object.freeze({
    generatedItemId: `path1-p1-02-${familyId}-${relationMode}-${knowledgePointId}-${index}-${left.multiplicand}-${left.digit}-${right.multiplicand}-${right.digit}`,
    prompt,
    answerText,
    mode: "numeric",
    operationFamilyId: "PATH1_MULTI_DIGIT_BY_ONE_DIGIT_DIVERSITY",
    sourceNodeId: PATH1_P1_02_SOURCE_ID,
    knowledgePointId,
    metadata: Object.freeze({
      ...baseMetadata({ familyId, knowledgePointId, variantId: relationMode }),
      relationMode,
      expectedRelation: symbol,
      left: Object.freeze({ ...left }),
      right: Object.freeze({ ...right }),
      zeroSpecialExcluded: knowledgePointId === THREE_DIGIT_KP_ID,
      relationUsesSameCanonicalKnowledgePoint: true,
    }),
  });
}

function buildSameMultiplierRelations(knowledgePointId) {
  const byDigit = new Map();
  for (const operand of OPERAND_POOLS.get(knowledgePointId) ?? []) {
    if (!byDigit.has(operand.digit)) byDigit.set(operand.digit, []);
    byDigit.get(operand.digit).push(operand);
  }
  const items = [];
  let index = 0;
  for (const operands of byDigit.values()) {
    operands.sort((left, right) => left.multiplicand - right.multiplicand);
    for (let cursor = 0; cursor < operands.length - 1; cursor += 1) {
      const first = operands[cursor];
      const second = operands[cursor + 1];
      const reverse = index % 2 === 1;
      items.push(relationItem({
        knowledgePointId,
        relationMode: "ORDER_SAME_MULTIPLIER",
        left: reverse ? second : first,
        right: reverse ? first : second,
        index,
      }));
      index += 1;
    }
  }
  return Object.freeze(items);
}

function buildSameMultiplicandRelations(knowledgePointId) {
  const byMultiplicand = new Map();
  for (const operand of OPERAND_POOLS.get(knowledgePointId) ?? []) {
    if (!byMultiplicand.has(operand.multiplicand)) byMultiplicand.set(operand.multiplicand, []);
    byMultiplicand.get(operand.multiplicand).push(operand);
  }
  const items = [];
  let index = 0;
  for (const operands of byMultiplicand.values()) {
    operands.sort((left, right) => left.digit - right.digit);
    for (let cursor = 0; cursor < operands.length - 1; cursor += 1) {
      const first = operands[cursor];
      const second = operands[cursor + 1];
      const reverse = index % 2 === 1;
      items.push(relationItem({
        knowledgePointId,
        relationMode: "ORDER_SAME_MULTIPLICAND",
        left: reverse ? second : first,
        right: reverse ? first : second,
        index,
      }));
      index += 1;
    }
  }
  return Object.freeze(items);
}

function buildEqualityRelations(knowledgePointId) {
  const operands = OPERAND_POOLS.get(knowledgePointId) ?? [];
  const byProduct = new Map();
  for (const operand of operands) {
    if (!byProduct.has(operand.product)) byProduct.set(operand.product, []);
    byProduct.get(operand.product).push(operand);
  }
  const equalItems = [];
  let index = 0;
  for (const productOperands of byProduct.values()) {
    if (productOperands.length < 2) continue;
    const left = productOperands[0];
    const right = productOperands.find((candidate) => (
      candidate.multiplicand !== left.multiplicand || candidate.digit !== left.digit
    ));
    if (!right) continue;
    equalItems.push(relationItem({
      knowledgePointId,
      relationMode: "EQUALITY_JUDGMENT",
      left,
      right,
      index,
    }));
    index += 1;
  }

  const differentItems = [];
  for (let cursor = 0; cursor < operands.length - 1; cursor += 2) {
    const left = operands[cursor];
    let right = operands[cursor + 1];
    if (left.product === right.product && cursor + 2 < operands.length) right = operands[cursor + 2];
    if (left.product === right.product) continue;
    differentItems.push(relationItem({
      knowledgePointId,
      relationMode: "EQUALITY_JUDGMENT",
      left,
      right,
      index,
    }));
    index += 1;
  }

  const interleaved = [];
  const maxLength = Math.max(equalItems.length, differentItems.length);
  for (let cursor = 0; cursor < maxLength; cursor += 1) {
    if (cursor < equalItems.length) interleaved.push(equalItems[cursor]);
    if (cursor < differentItems.length) interleaved.push(differentItems[cursor]);
  }
  return Object.freeze(interleaved);
}

const DIRECT_POOLS = new Map(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
  knowledgePointId,
  Object.freeze((OPERAND_POOLS.get(knowledgePointId) ?? []).map((operand) => directItem(knowledgePointId, operand))),
]));

const RELATION_POOLS = new Map(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
  knowledgePointId,
  new Map([
    ["ORDER_SAME_MULTIPLIER", buildSameMultiplierRelations(knowledgePointId)],
    ["ORDER_SAME_MULTIPLICAND", buildSameMultiplicandRelations(knowledgePointId)],
    ["EQUALITY_JUDGMENT", buildEqualityRelations(knowledgePointId)],
  ]),
]));

const ALL_PROMPTS = [
  ...[...DIRECT_POOLS.values()].flat().map((entry) => entry.prompt),
  ...[...RELATION_POOLS.values()].flatMap((modeMap) => (
    [...modeMap.values()].flat().map((entry) => entry.prompt)
  )),
];
export const PATH1_P1_02_DISTINCT_PROMPT_CAPACITY = new Set(ALL_PROMPTS).size;

function validateScopedOperand(knowledgePointId, operand, label, errors) {
  if (!operand || !operandValidForKnowledgePoint(knowledgePointId, Number(operand.multiplicand), Number(operand.digit))) {
    errors.push(`${label}_OPERAND_OUT_OF_SCOPE`);
    return;
  }
  if (Number(operand.product) !== Number(operand.multiplicand) * Number(operand.digit)) {
    errors.push(`${label}_PRODUCT_INVARIANT_FAILED`);
  }
}

export function validatePath1P102DiversityItem(entry) {
  const errors = [];
  const metadata = entry?.metadata ?? {};
  const familyId = metadata.path1PatternFamilyId;
  const knowledgePointId = entry?.knowledgePointId;
  if (!PATH1_P1_02_PATTERN_FAMILIES.some((family) => family.familyId === familyId)) errors.push("UNKNOWN_PATTERN_FAMILY");
  if (!PATH1_P1_02_KNOWLEDGE_POINT_IDS.includes(knowledgePointId)) errors.push("KP_ID_MISMATCH");
  if (metadata.canonicalKnowledgePointId !== knowledgePointId) errors.push("CANONICAL_KP_METADATA_MISMATCH");
  if (metadata.canonicalKnowledgePointMinted !== false) errors.push("CANONICAL_KP_MINTED");
  if (metadata.missingDigitInferenceUsed !== false) errors.push("MISSING_DIGIT_SCOPE_LEAK");
  if (metadata.zeroSpecialCaseRoutedHere !== false) errors.push("ZERO_SPECIAL_SCOPE_LEAK");
  if (!String(entry?.prompt ?? "").trim()) errors.push("PROMPT_EMPTY");
  if (!String(entry?.answerText ?? "").trim()) errors.push("ANSWER_EMPTY");

  if (familyId === "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT") {
    const operand = {
      multiplicand: Number(metadata.multiplicand),
      digit: Number(metadata.digit),
      product: Number(metadata.product),
    };
    validateScopedOperand(knowledgePointId, operand, "DIRECT", errors);
    if (entry?.answerText !== String(operand.product)) errors.push("DIRECT_ANSWER_MISMATCH");
    if (knowledgePointId === TWO_DIGIT_KP_ID && metadata.carryFromOnesToTens !== true) {
      errors.push("DIRECT_CARRY_GUARD_FAILED");
    }
    if (knowledgePointId === THREE_DIGIT_KP_ID && metadata.zeroSpecialExcluded !== true) {
      errors.push("THREE_DIGIT_ZERO_SPECIAL_NOT_EXCLUDED");
    }
  } else if (familyId === "C1_PRODUCT_RELATION_SELECTION") {
    if (!PATH1_P1_02_RELATION_MODES.includes(metadata.relationMode)) errors.push("UNKNOWN_RELATION_MODE");
    validateScopedOperand(knowledgePointId, metadata.left, "LEFT", errors);
    validateScopedOperand(knowledgePointId, metadata.right, "RIGHT", errors);
    const expected = relationSymbol(Number(metadata.left?.product), Number(metadata.right?.product));
    if (metadata.expectedRelation !== expected) errors.push("RELATION_METADATA_MISMATCH");
    const expectedAnswer = metadata.relationMode === "EQUALITY_JUDGMENT"
      ? (expected === "=" ? "相同" : "不同")
      : expected;
    if (entry?.answerText !== expectedAnswer) errors.push("RELATION_ANSWER_MISMATCH");
    if (metadata.relationUsesSameCanonicalKnowledgePoint !== true) errors.push("RELATION_CROSS_KP_SCOPE_LEAK");
  }

  return { ok: errors.length === 0, errors };
}

function selectDirectItems({ needed, knowledgePointId, seed }) {
  const pool = DIRECT_POOLS.get(knowledgePointId) ?? [];
  if (pool.length < needed) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_C0_CAPACITY_FAILED", knowledgePointId, requested: needed, available: pool.length }],
    };
  }
  return { ok: true, items: seededShuffle(pool, seed).slice(0, needed), errors: [] };
}

function selectRelationItems({ needed, knowledgePointId, seed }) {
  const modeCounts = allocateCounts(needed, PATH1_P1_02_RELATION_MODES.length, `${seed}:modes`);
  const modeMap = RELATION_POOLS.get(knowledgePointId) ?? new Map();
  const items = [];
  for (let index = 0; index < PATH1_P1_02_RELATION_MODES.length; index += 1) {
    const relationMode = PATH1_P1_02_RELATION_MODES[index];
    const pool = modeMap.get(relationMode) ?? [];
    const modeNeeded = modeCounts[index];
    if (pool.length < modeNeeded) {
      return {
        ok: false,
        items: [],
        errors: [{
          code: "PATH1_P1_02_C1_RELATION_MODE_CAPACITY_FAILED",
          knowledgePointId,
          relationMode,
          requested: modeNeeded,
          available: pool.length,
        }],
      };
    }
    items.push(...seededShuffle(pool, `${seed}:${relationMode}`).slice(0, modeNeeded));
  }
  return { ok: true, items, errors: [] };
}

export function buildPath1P102DiversityItems({ count = 20, seed = "path1-p1-02" } = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(requested, PATH1_P1_02_PATTERN_FAMILIES.length, `${seed}:families`);
  const selected = [];

  for (let familyIndex = 0; familyIndex < PATH1_P1_02_PATTERN_FAMILIES.length; familyIndex += 1) {
    const { familyId } = PATH1_P1_02_PATTERN_FAMILIES[familyIndex];
    const needed = familyCounts[familyIndex];
    const kpCounts = allocateCounts(needed, PATH1_P1_02_KNOWLEDGE_POINT_IDS.length, `${seed}:${familyId}:kp`);
    for (let kpIndex = 0; kpIndex < PATH1_P1_02_KNOWLEDGE_POINT_IDS.length; kpIndex += 1) {
      const knowledgePointId = PATH1_P1_02_KNOWLEDGE_POINT_IDS[kpIndex];
      const kpNeeded = kpCounts[kpIndex];
      if (kpNeeded === 0) continue;
      const result = familyId === "C0_DIRECT_MULTI_DIGIT_BY_ONE_DIGIT"
        ? selectDirectItems({ needed: kpNeeded, knowledgePointId, seed: `${seed}:${familyId}:${knowledgePointId}` })
        : selectRelationItems({ needed: kpNeeded, knowledgePointId, seed: `${seed}:${familyId}:${knowledgePointId}` });
      if (!result.ok) return result;
      selected.push(...result.items);
    }
  }

  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P102DiversityItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_DIVERSITY_VALIDATION_FAILED", failures: validationFailures }],
    };
  }

  const duplicatePrompts = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePrompts !== 0) {
    return {
      ok: false,
      items: [],
      errors: [{ code: "PATH1_P1_02_DUPLICATE_PROMPT", duplicatePrompts }],
    };
  }

  const familySummary = Object.fromEntries(PATH1_P1_02_PATTERN_FAMILIES.map(({ familyId }) => [
    familyId,
    items.filter((entry) => entry.metadata.path1PatternFamilyId === familyId).length,
  ]));
  const knowledgePointCounts = Object.fromEntries(PATH1_P1_02_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
    knowledgePointId,
    items.filter((entry) => entry.knowledgePointId === knowledgePointId).length,
  ]));
  const relationModeCounts = Object.fromEntries(PATH1_P1_02_RELATION_MODES.map((relationMode) => [
    relationMode,
    items.filter((entry) => entry.metadata.relationMode === relationMode).length,
  ]));

  return {
    ok: true,
    items,
    errors: [],
    summary: {
      requested,
      generated: items.length,
      patternFamilyCount: PATH1_P1_02_PATTERN_FAMILIES.length,
      distinctPromptCapacity: PATH1_P1_02_DISTINCT_PROMPT_CAPACITY,
      familyCounts: familySummary,
      knowledgePointCounts,
      relationModeCounts,
    },
  };
}
