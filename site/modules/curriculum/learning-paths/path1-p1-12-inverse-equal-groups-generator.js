import {
  getG3BU08SemanticPatternDefinition,
} from "../batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec,
} from "../batch-a/g3b-u08-semantic-context-registry.js";
import {
  isS58FPromotedG3BU08SemanticPatternSpecId,
} from "../registry/g3b-u08-semantic-promotion.js";

export const PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE = "inverseEqualGroupsTransfer";
export const PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID = "P1-12";
export const PATH1_P112_INVERSE_EQUAL_GROUPS_OPERATION_FAMILY_ID = "PATH1_P112_INVERSE_EQUAL_GROUPS_TRANSFER";
export const PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID = "g3b_u08_3b08";
export const PATH1_P112_INVERSE_EQUAL_GROUPS_INSTRUCTION_SUFFIX = "請先判斷要求的是總量、組數或每組量，再列出算式並寫答案。";

export const PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS = Object.freeze([
  Object.freeze({
    unknownRole: "totalAmount",
    relationKnowledgePointId: "kp_g3b_u08_total_from_groups",
    relationOperationModelId: "op_g3b_u08_total_from_groups",
    patternGroupId: "pg_g3b_u08_total_from_groups",
    equationShape: "a*b",
    operation: "multiplication",
    semanticPatternSpecIds: Object.freeze([
      "ps_g3b_u08_total_daily_saving_accumulation",
      "ps_g3b_u08_total_score_per_success",
      "ps_g3b_u08_total_material_per_product",
      "ps_g3b_u08_total_items_per_package",
    ]),
  }),
  Object.freeze({
    unknownRole: "groupCount",
    relationKnowledgePointId: "kp_g3b_u08_group_count_from_total",
    relationOperationModelId: "op_g3b_u08_group_count_from_total",
    patternGroupId: "pg_g3b_u08_group_count_from_total",
    equationShape: "a/b",
    operation: "quotative_division",
    semanticPatternSpecIds: Object.freeze([
      "ps_g3b_u08_group_count_score_events",
      "ps_g3b_u08_group_count_craft_products",
      "ps_g3b_u08_group_count_equal_segments",
      "ps_g3b_u08_group_count_packaging",
    ]),
  }),
  Object.freeze({
    unknownRole: "amountPerGroup",
    relationKnowledgePointId: "kp_g3b_u08_per_group_from_total",
    relationOperationModelId: "op_g3b_u08_per_group_from_total",
    patternGroupId: "pg_g3b_u08_per_group_from_total",
    equationShape: "a/b",
    operation: "partitive_division",
    semanticPatternSpecIds: Object.freeze([
      "ps_g3b_u08_per_group_daily_saving",
      "ps_g3b_u08_per_group_equal_share_people",
      "ps_g3b_u08_per_group_equal_container_capacity",
      "ps_g3b_u08_per_group_equal_segment_length",
    ]),
  }),
]);

export const PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS = Object.freeze(
  PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS.flatMap((entry) => entry.semanticPatternSpecIds),
);

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

export function getPath1P112InverseEqualGroupsRoleConfig(unknownRole) {
  return PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS.find((entry) => entry.unknownRole === unknownRole) ?? null;
}

function renderTemplate(template, values) {
  if (!template) return null;
  let unresolved = false;
  const rendered = template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === "") {
      unresolved = true;
      return `{${key}}`;
    }
    return String(value);
  });
  return unresolved ? null : rendered;
}

function promptValuesForRole(unknownRole, relationValues) {
  if (unknownRole === "totalAmount") {
    return { a: relationValues.amountPerGroup, b: relationValues.groupCount };
  }
  if (unknownRole === "groupCount") {
    return { a: relationValues.totalAmount, b: relationValues.amountPerGroup };
  }
  if (unknownRole === "amountPerGroup") {
    return { a: relationValues.totalAmount, b: relationValues.groupCount };
  }
  return null;
}

export function renderPath1P112InverseEqualGroupsAuthorityPrompt(
  spec,
  contextVariant,
  unknownRole,
  relationValues,
) {
  const numericValues = promptValuesForRole(unknownRole, relationValues);
  if (!spec || !contextVariant || !numericValues) return null;
  const bindings = { ...(contextVariant.bindings ?? {}), ...numericValues };

  let prompt = null;
  if (spec.templateFamilyId === "tpl_g3b_u08_total_score_per_success") {
    const { person, successAction, successVerb, eventUnit } = contextVariant.bindings ?? {};
    if (person && successAction && successVerb && eventUnit) {
      prompt = `每${successAction}可得${numericValues.a}分，${person}${successVerb}了${numericValues.b}${eventUnit}，一共得到多少分？`;
    }
  } else if (spec.templateFamilyId === "tpl_g3b_u08_group_count_score_events") {
    const { person, successAction, successVerb, eventUnit } = contextVariant.bindings ?? {};
    if (person && successAction && successVerb && eventUnit) {
      prompt = `${person}共得到${numericValues.a}分，每${successAction}可得${numericValues.b}分，${person}${successVerb}了幾${eventUnit}？`;
    }
  }

  if (!prompt) {
    prompt = renderTemplate(spec.promptSkeletonZh, bindings)
      ?? renderTemplate(spec.sourcePromptSkeletonZh, bindings);
  }
  return prompt ? `${prompt} ${PATH1_P112_INVERSE_EQUAL_GROUPS_INSTRUCTION_SUFFIX}` : null;
}

function allowedSurface(roleConfig, patternSpecId) {
  if (!roleConfig?.semanticPatternSpecIds.includes(patternSpecId)) return null;
  if (!isS58FPromotedG3BU08SemanticPatternSpecId(patternSpecId)) return null;
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  if (!spec) return null;
  if (spec.patternGroupId !== roleConfig.patternGroupId) return null;
  if (spec.knowledgePointId !== roleConfig.relationKnowledgePointId) return null;
  if (spec.equationShape !== roleConfig.equationShape) return null;
  return spec;
}

function totalAmountRelationPool() {
  const rows = [];
  for (let amountPerGroup = 2; amountPerGroup <= 99; amountPerGroup += 1) {
    for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
      const totalAmount = amountPerGroup * groupCount;
      if (totalAmount > 999) continue;
      rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount }));
    }
  }
  return Object.freeze(rows);
}

function groupCountRelationPool() {
  const rows = [];
  for (let amountPerGroup = 2; amountPerGroup <= 9; amountPerGroup += 1) {
    for (let groupCount = 2; groupCount <= 99; groupCount += 1) {
      const totalAmount = amountPerGroup * groupCount;
      if (totalAmount < 10 || totalAmount > 999) continue;
      rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount }));
    }
  }
  return Object.freeze(rows);
}

function amountPerGroupRelationPool() {
  const rows = [];
  for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
    for (let amountPerGroup = 2; amountPerGroup <= 99; amountPerGroup += 1) {
      const totalAmount = amountPerGroup * groupCount;
      if (totalAmount < 10 || totalAmount > 999) continue;
      rows.push(Object.freeze({ amountPerGroup, groupCount, totalAmount }));
    }
  }
  return Object.freeze(rows);
}

const RELATION_POOLS = new Map([
  ["totalAmount", totalAmountRelationPool()],
  ["groupCount", groupCountRelationPool()],
  ["amountPerGroup", amountPerGroupRelationPool()],
]);

function bucketCycle(seed) {
  const buckets = PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS.flatMap((roleConfig) => (
    roleConfig.semanticPatternSpecIds.map((semanticPatternSpecId) => ({ roleConfig, semanticPatternSpecId }))
  ));
  const offset = hashSeed(`${seed}:p112-inverse-buckets`) % buckets.length;
  return Array.from({ length: buckets.length }, (_, index) => buckets[(index + offset) % buckets.length]);
}

function allocateBucketCounts(count, buckets) {
  const counts = buckets.map(() => 0);
  for (let index = 0; index < count; index += 1) counts[index % buckets.length] += 1;
  return counts;
}

function buildBucketPool({ roleConfig, semanticPatternSpecId, seed }) {
  const spec = allowedSurface(roleConfig, semanticPatternSpecId);
  if (!spec) return [];
  const contexts = listG3BU08SemanticContextVariantsForPatternSpec(semanticPatternSpecId);
  const relations = RELATION_POOLS.get(roleConfig.unknownRole) ?? [];
  const rows = [];
  const seenPrompts = new Set();

  for (const relationValues of relations) {
    for (const contextVariant of contexts) {
      const prompt = renderPath1P112InverseEqualGroupsAuthorityPrompt(
        spec,
        contextVariant,
        roleConfig.unknownRole,
        relationValues,
      );
      if (!prompt || seenPrompts.has(prompt)) continue;
      seenPrompts.add(prompt);
      rows.push(Object.freeze({
        roleConfig,
        semanticPatternSpecId,
        contextVariant,
        prompt,
        ...relationValues,
      }));
    }
  }

  return seededShuffle(
    rows,
    `${seed}:${roleConfig.unknownRole}:${semanticPatternSpecId}`,
  );
}

function equationFor(candidate) {
  if (candidate.roleConfig.unknownRole === "totalAmount") {
    return `${candidate.amountPerGroup} × ${candidate.groupCount} = ${candidate.totalAmount}`;
  }
  if (candidate.roleConfig.unknownRole === "groupCount") {
    return `${candidate.totalAmount} ÷ ${candidate.amountPerGroup} = ${candidate.groupCount}`;
  }
  return `${candidate.totalAmount} ÷ ${candidate.groupCount} = ${candidate.amountPerGroup}`;
}

function finalAnswerFor(candidate) {
  if (candidate.roleConfig.unknownRole === "totalAmount") return candidate.totalAmount;
  if (candidate.roleConfig.unknownRole === "groupCount") return candidate.groupCount;
  return candidate.amountPerGroup;
}

function materializeItem(candidate, sequenceNumber) {
  const {
    roleConfig,
    semanticPatternSpecId,
    contextVariant,
    prompt,
    amountPerGroup,
    groupCount,
    totalAmount,
  } = candidate;
  const equationModel = equationFor(candidate);
  const finalAnswer = finalAnswerFor(candidate);
  const finalAnswerUnit = contextVariant.answerUnit;
  const answerText = `${equationModel}；答：${finalAnswer}${finalAnswerUnit}`;
  const generatedItemId = [
    "path1-p112-inverse-equal-groups",
    roleConfig.unknownRole,
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
    operationFamilyId: PATH1_P112_INVERSE_EQUAL_GROUPS_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID,
    sourceIds: Object.freeze([PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID]),
    knowledgePointId: roleConfig.relationKnowledgePointId,
    patternSpecId: semanticPatternSpecId,
    path1BlockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
    relationKnowledgePointId: roleConfig.relationKnowledgePointId,
    relationOperationModelId: roleConfig.relationOperationModelId,
    semanticPatternSpecId,
    contextVariantId: contextVariant.contextVariantId,
    unknownRole: roleConfig.unknownRole,
    relationOperation: roleConfig.operation,
    amountPerGroup,
    groupCount,
    totalAmount,
    equationModel,
    finalAnswer,
    finalAnswerUnit,
    semanticSourceId: PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID,
    metadata: Object.freeze({
      practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
      path1BlockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
      relationKnowledgePointId: roleConfig.relationKnowledgePointId,
      relationOperationModelId: roleConfig.relationOperationModelId,
      relationOperation: roleConfig.operation,
      semanticPatternSpecId,
      contextVariantId: contextVariant.contextVariantId,
      semanticSourceId: PATH1_P112_INVERSE_EQUAL_GROUPS_SEMANTIC_SOURCE_ID,
      unknownRole: roleConfig.unknownRole,
      amountPerGroup,
      groupCount,
      totalAmount,
      canonicalKnowledgePointMinted: false,
      commutativeSemanticRoleSwapAllowed: false,
      keywordToOperationSelectionAllowed: false,
      exactDivisionRequired: roleConfig.operation !== "multiplication",
      languageDifficulty: "LD0_DIRECT_ROLE_EXPLICIT",
      masteryCredit: "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL",
    }),
  });
}

function failed(errors) {
  return Object.freeze({ ok: false, items: Object.freeze([]), errors: Object.freeze(errors), summary: null });
}

export function buildPath1P112InverseEqualGroupsItems({
  blockId = PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID) {
    return failed([issue("PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE) {
    return failed([issue("PATH1_P112_INVERSE_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P112_INVERSE_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P112_INVERSE_SEED_REQUIRED")]);
  }

  const buckets = bucketCycle(seed);
  const bucketCounts = allocateBucketCounts(count, buckets);
  const selected = [];
  for (let index = 0; index < buckets.length; index += 1) {
    const needed = bucketCounts[index];
    if (needed === 0) continue;
    const bucket = buckets[index];
    const pool = buildBucketPool({ ...bucket, seed });
    if (pool.length < needed) {
      return failed([issue("PATH1_P112_INVERSE_BUCKET_CAPACITY_FAILED", {
        unknownRole: bucket.roleConfig.unknownRole,
        semanticPatternSpecId: bucket.semanticPatternSpecId,
        requested: needed,
        available: pool.length,
      })]);
    }
    selected.push(...pool.slice(0, needed));
  }

  const ordered = seededShuffle(selected, `${seed}:p112-inverse-cross-bucket`);
  const items = ordered.map((candidate, index) => materializeItem(candidate, index + 1));
  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P112_INVERSE_DUPLICATE_PROMPT", {
      generated: items.length,
      distinct: distinctPromptCount,
    })]);
  }

  const unknownRoleCounts = Object.fromEntries(
    PATH1_P112_INVERSE_EQUAL_GROUPS_ROLE_CONFIGS.map((roleConfig) => [
      roleConfig.unknownRole,
      items.filter((entry) => entry.unknownRole === roleConfig.unknownRole).length,
    ]),
  );
  const semanticPatternSpecCounts = Object.fromEntries(
    PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS.map((patternSpecId) => [
      patternSpecId,
      items.filter((entry) => entry.semanticPatternSpecId === patternSpecId).length,
    ]),
  );
  const relationKnowledgePointIdsUsed = Object.freeze([
    ...new Set(items.map((entry) => entry.relationKnowledgePointId)),
  ]);

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
      blockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
      requested: count,
      generated: items.length,
      distinctPromptCount,
      unknownRolesUsed: Object.freeze(Object.keys(unknownRoleCounts).filter((key) => unknownRoleCounts[key] > 0)),
      unknownRoleCounts: Object.freeze(unknownRoleCounts),
      relationKnowledgePointIdsUsed,
      semanticPatternSpecIdsUsed: Object.freeze(
        PATH1_P112_INVERSE_EQUAL_GROUPS_PATTERN_SPEC_IDS.filter((patternSpecId) => semanticPatternSpecCounts[patternSpecId] > 0),
      ),
      semanticPatternSpecCounts: Object.freeze(semanticPatternSpecCounts),
      deterministicReplay: true,
      canonicalKnowledgePointMinted: false,
    }),
  });
}
