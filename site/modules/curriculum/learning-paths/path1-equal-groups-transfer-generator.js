import {
  getG3BU08SemanticPatternDefinition,
} from "../batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec,
} from "../batch-a/g3b-u08-semantic-context-registry.js";
import {
  isS58FPromotedG3BU08SemanticPatternSpecId,
} from "../registry/g3b-u08-semantic-promotion.js";

export const PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE = "equalGroupsTransfer";
export const PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID = "kp_g3b_u08_total_from_groups";
export const PATH1_EQUAL_GROUPS_TRANSFER_OPERATION_MODEL_ID = "op_g3b_u08_total_from_groups";
export const PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_GROUP_ID = "pg_g3b_u08_total_from_groups";
export const PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID = "g3a_u03_3a03";
export const PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID = "g3b_u08_3b08";
export const PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX = "請先列出乘法算式，再寫答案。";

export const PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3b_u08_total_daily_saving_accumulation",
  "ps_g3b_u08_total_score_per_success",
  "ps_g3b_u08_total_material_per_product",
  "ps_g3b_u08_total_items_per_package",
]);

export const PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS = Object.freeze({
  "P1-01": Object.freeze(["kp_g3a_u03_10_multiple_by_1digit"]),
  "P1-02": Object.freeze([
    "kp_g3a_u03_2digit_by_1digit_carry",
    "kp_g3a_u03_3digit_by_1digit",
  ]),
});

const TWO_DIGIT_KP_ID = "kp_g3a_u03_2digit_by_1digit_carry";
const THREE_DIGIT_KP_ID = "kp_g3a_u03_3digit_by_1digit";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

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

function hasDirectOnesCarry(amountPerGroup, groupCount) {
  return (amountPerGroup % 10) * groupCount >= 10;
}

function excludesThreeDigitZeroSpecial(amountPerGroup) {
  const tensDigit = Math.floor(amountPerGroup / 10) % 10;
  const onesDigit = amountPerGroup % 10;
  return tensDigit !== 0 && onesDigit !== 0;
}

function operandPoolForKnowledgePoint(knowledgePointId) {
  const rows = [];
  if (knowledgePointId === "kp_g3a_u03_10_multiple_by_1digit") {
    for (let amountPerGroup = 10; amountPerGroup <= 90; amountPerGroup += 10) {
      for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
        rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount: amountPerGroup * groupCount }));
      }
    }
    return Object.freeze(rows);
  }
  if (knowledgePointId === TWO_DIGIT_KP_ID) {
    for (let amountPerGroup = 10; amountPerGroup <= 99; amountPerGroup += 1) {
      for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
        if (!hasDirectOnesCarry(amountPerGroup, groupCount)) continue;
        rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount: amountPerGroup * groupCount }));
      }
    }
    return Object.freeze(rows);
  }
  if (knowledgePointId === THREE_DIGIT_KP_ID) {
    for (let amountPerGroup = 100; amountPerGroup <= 999; amountPerGroup += 1) {
      if (!excludesThreeDigitZeroSpecial(amountPerGroup)) continue;
      for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
        const totalAmount = amountPerGroup * groupCount;
        if (totalAmount > 999) continue;
        rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount }));
      }
    }
    return Object.freeze(rows);
  }
  return Object.freeze([]);
}

const OPERAND_POOLS = new Map([
  "kp_g3a_u03_10_multiple_by_1digit",
  TWO_DIGIT_KP_ID,
  THREE_DIGIT_KP_ID,
].map((knowledgePointId) => [knowledgePointId, operandPoolForKnowledgePoint(knowledgePointId)]));

function renderAuthorityPrompt(spec, contextVariant, amountPerGroup, groupCount) {
  const values = {
    ...(contextVariant?.bindings ?? {}),
    a: amountPerGroup,
    b: groupCount,
  };
  const sourceTemplate = spec?.sourcePromptSkeletonZh;
  if (!sourceTemplate) return null;
  let unresolved = false;
  const prompt = sourceTemplate.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === "") {
      unresolved = true;
      return `{${key}}`;
    }
    return String(value);
  });
  return unresolved ? null : `${prompt} ${PATH1_EQUAL_GROUPS_TRANSFER_INSTRUCTION_SUFFIX}`;
}

function allowedSurface(patternSpecId) {
  if (!PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS.includes(patternSpecId)) return null;
  if (!isS58FPromotedG3BU08SemanticPatternSpecId(patternSpecId)) return null;
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  if (!spec) return null;
  if (spec.patternGroupId !== PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_GROUP_ID) return null;
  if (spec.knowledgePointId !== PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID) return null;
  if (spec.equationShape !== "a*b") return null;
  return spec;
}

function bucketCycle(blockId, seed) {
  const patterns = PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS;
  if (blockId === "P1-01") {
    const offset = hashSeed(`${seed}:p101-buckets`) % patterns.length;
    return Array.from({ length: patterns.length }, (_, index) => ({
      arithmeticKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS[blockId][0],
      semanticPatternSpecId: patterns[(index + offset) % patterns.length],
    }));
  }
  if (blockId === "P1-02") {
    const base = [
      { arithmeticKnowledgePointId: TWO_DIGIT_KP_ID, semanticPatternSpecId: patterns[0] },
      { arithmeticKnowledgePointId: THREE_DIGIT_KP_ID, semanticPatternSpecId: patterns[1] },
      { arithmeticKnowledgePointId: TWO_DIGIT_KP_ID, semanticPatternSpecId: patterns[2] },
      { arithmeticKnowledgePointId: THREE_DIGIT_KP_ID, semanticPatternSpecId: patterns[3] },
      { arithmeticKnowledgePointId: THREE_DIGIT_KP_ID, semanticPatternSpecId: patterns[0] },
      { arithmeticKnowledgePointId: TWO_DIGIT_KP_ID, semanticPatternSpecId: patterns[1] },
      { arithmeticKnowledgePointId: THREE_DIGIT_KP_ID, semanticPatternSpecId: patterns[2] },
      { arithmeticKnowledgePointId: TWO_DIGIT_KP_ID, semanticPatternSpecId: patterns[3] },
    ];
    const offset = hashSeed(`${seed}:p102-buckets`) % base.length;
    return Array.from({ length: base.length }, (_, index) => base[(index + offset) % base.length]);
  }
  return [];
}

function allocateBucketCounts(count, buckets) {
  const counts = buckets.map(() => 0);
  for (let index = 0; index < count; index += 1) counts[index % buckets.length] += 1;
  return counts;
}

function buildBucketPool({ blockId, arithmeticKnowledgePointId, semanticPatternSpecId, seed }) {
  const spec = allowedSurface(semanticPatternSpecId);
  if (!spec) return [];
  const contexts = listG3BU08SemanticContextVariantsForPatternSpec(semanticPatternSpecId);
  const operands = OPERAND_POOLS.get(arithmeticKnowledgePointId) ?? [];
  const rows = [];
  const seenPrompts = new Set();
  for (const operand of operands) {
    for (const contextVariant of contexts) {
      const prompt = renderAuthorityPrompt(spec, contextVariant, operand.amountPerGroup, operand.groupCount);
      if (!prompt || seenPrompts.has(prompt)) continue;
      seenPrompts.add(prompt);
      rows.push(Object.freeze({
        blockId,
        arithmeticKnowledgePointId,
        semanticPatternSpecId,
        contextVariant,
        prompt,
        ...operand,
      }));
    }
  }
  return seededShuffle(rows, `${seed}:${blockId}:${arithmeticKnowledgePointId}:${semanticPatternSpecId}`);
}

function materializeItem(candidate, sequenceNumber) {
  const {
    blockId,
    arithmeticKnowledgePointId,
    semanticPatternSpecId,
    contextVariant,
    prompt,
    amountPerGroup,
    groupCount,
    totalAmount,
  } = candidate;
  const finalAnswerUnit = contextVariant.answerUnit;
  const equationModel = `${amountPerGroup} × ${groupCount} = ${totalAmount}`;
  const answerText = `${equationModel}；答：${totalAmount}${finalAnswerUnit}`;
  const generatedItemId = [
    "path1-equal-groups-transfer",
    blockId.toLowerCase(),
    arithmeticKnowledgePointId,
    semanticPatternSpecId,
    contextVariant.contextVariantId,
    amountPerGroup,
    groupCount,
    sequenceNumber,
  ].join("-");
  return Object.freeze({
    generatedItemId,
    prompt,
    answerText,
    mode: "application",
    operationFamilyId: "PATH1_EQUAL_GROUPS_TRANSFER",
    sourceNodeId: PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID,
    sourceIds: Object.freeze([
      PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID,
      PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID,
    ]),
    knowledgePointId: arithmeticKnowledgePointId,
    patternSpecId: semanticPatternSpecId,
    path1BlockId: blockId,
    arithmeticKnowledgePointId,
    relationKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
    relationOperationModelId: PATH1_EQUAL_GROUPS_TRANSFER_OPERATION_MODEL_ID,
    semanticPatternSpecId,
    contextVariantId: contextVariant.contextVariantId,
    unknownRole: "totalAmount",
    amountPerGroup,
    groupCount,
    totalAmount,
    equationModel,
    finalAnswer: totalAmount,
    finalAnswerUnit,
    arithmeticSourceId: PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID,
    semanticSourceId: PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID,
    metadata: Object.freeze({
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
      path1BlockId: blockId,
      arithmeticKnowledgePointId,
      relationKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
      relationOperationModelId: PATH1_EQUAL_GROUPS_TRANSFER_OPERATION_MODEL_ID,
      semanticPatternSpecId,
      contextVariantId: contextVariant.contextVariantId,
      arithmeticSourceId: PATH1_EQUAL_GROUPS_TRANSFER_ARITHMETIC_SOURCE_ID,
      semanticSourceId: PATH1_EQUAL_GROUPS_TRANSFER_SEMANTIC_SOURCE_ID,
      amountPerGroup,
      groupCount,
      totalAmount,
      unknownRole: "totalAmount",
      canonicalKnowledgePointMinted: false,
      commutativeArithmeticRoleSwapAllowed: false,
      languageDifficulty: "LD0_DIRECT_ROLE_EXPLICIT",
    }),
  });
}

function failed(errors) {
  return Object.freeze({ ok: false, items: Object.freeze([]), errors: Object.freeze(errors), summary: null });
}

export function buildPath1EqualGroupsTransferItems({
  blockId,
  count = 20,
  seed,
  practiceMode = PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
} = {}) {
  if (!PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS[blockId]) {
    return failed([issue("PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE) {
    return failed([issue("PATH1_TRANSFER_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_TRANSFER_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_TRANSFER_SEED_REQUIRED")]);
  }

  const buckets = bucketCycle(blockId, seed);
  const bucketCounts = allocateBucketCounts(count, buckets);
  const selected = [];
  for (let index = 0; index < buckets.length; index += 1) {
    const needed = bucketCounts[index];
    if (needed === 0) continue;
    const bucket = buckets[index];
    const pool = buildBucketPool({ blockId, ...bucket, seed });
    if (pool.length < needed) {
      return failed([issue("PATH1_TRANSFER_BUCKET_CAPACITY_FAILED", {
        blockId,
        arithmeticKnowledgePointId: bucket.arithmeticKnowledgePointId,
        semanticPatternSpecId: bucket.semanticPatternSpecId,
        requested: needed,
        available: pool.length,
      })]);
    }
    selected.push(...pool.slice(0, needed));
  }

  const ordered = seededShuffle(selected, `${seed}:${blockId}:cross-bucket`);
  const items = ordered.map((candidate, index) => materializeItem(candidate, index + 1));
  const promptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (promptCount !== items.length) {
    return failed([issue("PATH1_TRANSFER_DUPLICATE_PROMPT", {
      blockId,
      generated: items.length,
      distinct: promptCount,
    })]);
  }

  const semanticPatternSpecCounts = Object.fromEntries(PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS.map((patternSpecId) => [
    patternSpecId,
    items.filter((entry) => entry.semanticPatternSpecId === patternSpecId).length,
  ]));
  const arithmeticKnowledgePointCounts = Object.fromEntries(PATH1_EQUAL_GROUPS_TRANSFER_BLOCK_KPS[blockId].map((knowledgePointId) => [
    knowledgePointId,
    items.filter((entry) => entry.arithmeticKnowledgePointId === knowledgePointId).length,
  ]));

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
      blockId,
      requested: count,
      generated: items.length,
      distinctPromptCount: promptCount,
      relationKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
      semanticPatternSpecIdsUsed: Object.freeze(PATH1_EQUAL_GROUPS_TRANSFER_PATTERN_SPEC_IDS.filter((patternSpecId) => semanticPatternSpecCounts[patternSpecId] > 0)),
      semanticPatternSpecCounts: Object.freeze(semanticPatternSpecCounts),
      arithmeticKnowledgePointCounts: Object.freeze(arithmeticKnowledgePointCounts),
      deterministicReplay: true,
      canonicalKnowledgePointMinted: false,
    }),
  });
}
