import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  renderPath1P103MultiplicativeModelingPrompt,
} from "./path1-p1-03-multiplicative-modeling-patterns.js";
import { validatePath1P103MultiplicativeModelingItem } from "./path1-p1-03-multiplicative-modeling-validator.js";

export const PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID = "P1-03";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID = "g4a_u02_4a02";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID = "g3b_u08_3b08";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function failed(errors) {
  return Object.freeze({ ok: false, items: Object.freeze([]), errors: Object.freeze(errors), summary: null });
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

function allocateCounts(total, itemCount, seed) {
  const counts = Array.from({ length: itemCount }, () => 0);
  const base = Math.floor(total / itemCount);
  const remainder = total % itemCount;
  counts.fill(base);
  const start = hashSeed(seed) % itemCount;
  for (let index = 0; index < remainder; index += 1) {
    counts[(start + index) % itemCount] += 1;
  }
  return counts;
}

const TWO_DIGIT_FACTOR_PAIRS = Object.freeze(
  Array.from({ length: 90 }, (_, leftIndex) => 10 + leftIndex)
    .flatMap((leftFactor) => Array.from({ length: 90 }, (_, rightIndex) => Object.freeze({
      leftFactor,
      rightFactor: 10 + rightIndex,
    }))),
);

function materializeItem({ patternSpec, familyIndex, pair, sequenceNumber }) {
  const amountPerGroup = pair.leftFactor;
  const groupCount = pair.rightFactor;
  const totalAmount = amountPerGroup * groupCount;
  const contextIndex = (
    amountPerGroup * 31
    + groupCount * 17
    + familyIndex * 13
  ) % patternSpec.contexts.length;
  const contextEntry = patternSpec.contexts[contextIndex];
  const prompt = renderPath1P103MultiplicativeModelingPrompt({
    patternSpecId: patternSpec.patternSpecId,
    contextVariantId: contextEntry.contextVariantId,
    amountPerGroup,
    groupCount,
  });
  const equationModel = `${amountPerGroup} × ${groupCount} = ${totalAmount}`;
  const answerText = `${equationModel}；答：${totalAmount}${contextEntry.answerUnit}`;
  const semanticRoleBinding = Object.freeze({
    leftFactor: "amountPerGroup",
    rightFactor: "groupCount",
    product: "totalAmount",
  });
  const metadata = Object.freeze({
    path1BlockId: PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    patternSpecId: patternSpec.patternSpecId,
    sourceParentPatternSpecId: patternSpec.sourceParentPatternSpecId,
    sourceSurfaceLineageOnly: true,
    sourceParentNumericAuthorityReused: false,
    contextVariantId: contextEntry.contextVariantId,
    arithmeticKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    relationKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
    canonicalInvariant: PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT,
    languageDifficulty: PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
    unknownRole: "totalAmount",
    answerRole: "totalAmount",
    amountPerGroup,
    groupCount,
    totalAmount,
    leftFactor: amountPerGroup,
    rightFactor: groupCount,
    product: totalAmount,
    perGroupUnit: contextEntry.perGroupUnit,
    groupUnit: contextEntry.groupUnit,
    answerUnit: contextEntry.answerUnit,
    equation: `${amountPerGroup} * ${groupCount} = ${totalAmount}`,
    semanticRoleBinding,
    semanticCommutativeRoleSwapAllowed: false,
    keywordToOperationSelectionAllowed: false,
    singleRelationOnly: true,
    unitConversionUsed: false,
    applicationPromptUsed: true,
    relationPromptUsed: true,
    canonicalKnowledgePointMinted: false,
    masteryCredit: PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
    publicCutoverApplied: false,
  });

  return Object.freeze({
    generatedItemId: [
      "path1-p1-03-modeling",
      patternSpec.patternSpecId,
      contextEntry.contextVariantId,
      amountPerGroup,
      groupCount,
      sequenceNumber,
    ].join("-"),
    prompt,
    answerText,
    mode: "application",
    operationFamilyId: PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
    sourceIds: Object.freeze([
      PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
      PATH1_P1_03_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID,
    ]),
    knowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    patternSpecId: patternSpec.patternSpecId,
    path1BlockId: PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
    arithmeticKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    relationKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
    contextVariantId: contextEntry.contextVariantId,
    unknownRole: "totalAmount",
    amountPerGroup,
    groupCount,
    totalAmount,
    leftFactor: amountPerGroup,
    rightFactor: groupCount,
    product: totalAmount,
    equationModel,
    finalAnswer: totalAmount,
    finalAnswerUnit: contextEntry.answerUnit,
    semanticRoleBinding,
    metadata,
  });
}

export function buildPath1P103MultiplicativeModelingItems({
  blockId = PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID) {
    return failed([issue("PATH1_P103_MODELING_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed([issue("PATH1_P103_MODELING_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P103_MODELING_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P103_MODELING_SEED_REQUIRED")]);
  }

  const familyCounts = allocateCounts(
    count,
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length,
    `${seed}:families`,
  );
  const selected = [];

  for (let familyIndex = 0; familyIndex < PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length; familyIndex += 1) {
    const patternSpec = PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS[familyIndex];
    const needed = familyCounts[familyIndex];
    const pairs = seededShuffle(
      TWO_DIGIT_FACTOR_PAIRS,
      `${seed}:${patternSpec.patternSpecId}:pairs`,
    ).slice(0, needed);
    selected.push(...pairs.map((pair) => ({ patternSpec, familyIndex, pair })));
  }

  const ordered = seededShuffle(selected, `${seed}:cross-family`);
  const items = ordered.map((candidate, index) => materializeItem({
    ...candidate,
    sequenceNumber: index + 1,
  }));
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P103MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return failed([issue("PATH1_P103_MODELING_VALIDATION_FAILED", { failures: validationFailures })]);
  }

  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P103_MODELING_DUPLICATE_PROMPT", {
      generated: items.length,
      distinct: distinctPromptCount,
    })]);
  }

  const familySummary = Object.fromEntries(
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.patternSpecId === patternSpecId).length,
    ]),
  );
  const contextSummary = Object.fromEntries(
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.flatMap((patternSpec) =>
      patternSpec.contexts.map(({ contextVariantId }) => {
        const key = `${patternSpec.patternSpecId}:${contextVariantId}`;
        return [key, items.filter((entry) => (
          entry.patternSpecId === patternSpec.patternSpecId
          && entry.contextVariantId === contextVariantId
        )).length];
      })),
  );

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      blockId: PATH1_P1_03_MULTIPLICATIVE_MODELING_BLOCK_ID,
      practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      requested: count,
      generated: items.length,
      patternFamilyCount: PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length,
      patternSpecIdsUsed: Object.freeze(Object.keys(familySummary).filter((key) => familySummary[key] > 0)),
      familyCounts: Object.freeze(familySummary),
      contextCounts: Object.freeze(contextSummary),
      distinctPromptCount,
      relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      arithmeticKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
      relationKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
      deterministicReplay: true,
      canonicalKnowledgePointMinted: false,
    }),
  });
}
