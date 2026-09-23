import {
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPECS,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  renderPath1P105MultiplicativeModelingPrompt,
} from "./path1-p1-05-zero-special-multiplicative-modeling-patterns.js";
import { validatePath1P105MultiplicativeModelingItem } from "./path1-p1-05-zero-special-multiplicative-modeling-validator.js";

export const PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID = "P1-05";
export const PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID = "g3a_u03_3a03";
export const PATH1_P1_05_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID = "g3b_u08_3b08";

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
  const counts = Array.from({ length: itemCount }, () => Math.floor(total / itemCount));
  const remainder = total % itemCount;
  const start = hashSeed(seed) % itemCount;
  for (let index = 0; index < remainder; index += 1) counts[(start + index) % itemCount] += 1;
  return counts;
}

function fullOperandPool() {
  const rows = [];
  for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
    for (let ones = 1; ones <= 9; ones += 1) {
      const amountPerGroup = hundreds * 100 + ones;
      for (let groupCount = 2; groupCount <= 9; groupCount += 1) {
        rows.push(Object.freeze({
          amountPerGroup,
          groupCount,
          totalAmount: amountPerGroup * groupCount,
        }));
      }
    }
  }
  return Object.freeze(rows);
}

const FULL_OPERAND_POOL = fullOperandPool();
const LOW_BOUNDARY = Object.freeze({ amountPerGroup: 101, groupCount: 2, totalAmount: 202 });
const HIGH_BOUNDARY = Object.freeze({ amountPerGroup: 909, groupCount: 9, totalAmount: 8181 });

function pairKey(pair) {
  return `${pair.amountPerGroup}:${pair.groupCount}`;
}

function generateDistinctPairs(count, seed) {
  if (count <= 0) return [];
  const anchors = [LOW_BOUNDARY, HIGH_BOUNDARY].slice(0, Math.min(2, count));
  const excluded = new Set(anchors.map(pairKey));
  const shuffled = seededShuffle(
    FULL_OPERAND_POOL.filter((pair) => !excluded.has(pairKey(pair))),
    `${seed}:operand-pool`,
  );
  return [...anchors, ...shuffled.slice(0, count - anchors.length)];
}

function materializeItem({ patternSpec, familyIndex, pair, sequenceNumber }) {
  const { amountPerGroup, groupCount, totalAmount } = pair;
  const contextIndex = (
    amountPerGroup * 31
    + groupCount * 17
    + familyIndex * 13
  ) % patternSpec.contexts.length;
  const contextEntry = patternSpec.contexts[contextIndex];
  const prompt = renderPath1P105MultiplicativeModelingPrompt({
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
    path1BlockId: PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
    practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    arithmeticKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    arithmeticOperationModelId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID,
    arithmeticPatternSpecId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID,
    patternSpecId: patternSpec.patternSpecId,
    sourceParentPatternSpecId: patternSpec.sourceParentPatternSpecId,
    sourceSurfaceLineageOnly: true,
    sourceParentNumericAuthorityReused: false,
    contextVariantId: contextEntry.contextVariantId,
    relationKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
    canonicalInvariant: PATH1_P1_05_MULTIPLICATIVE_MODELING_INVARIANT,
    languageDifficulty: PATH1_P1_05_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
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
    zeroMiddleArithmeticBoundaryPreserved: true,
    canonicalKnowledgePointMinted: false,
    g4bU01ModelingExpanded: false,
    masteryCredit: PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
    publicCutoverApplied: false,
  });

  return Object.freeze({
    generatedItemId: [
      "path1-p1-05-modeling",
      patternSpec.patternSpecId,
      contextEntry.contextVariantId,
      amountPerGroup,
      groupCount,
      sequenceNumber,
    ].join("-"),
    prompt,
    answerText,
    mode: "application",
    operationFamilyId: PATH1_P1_05_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
    sourceIds: Object.freeze([
      PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
      PATH1_P1_05_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID,
    ]),
    knowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    path1BlockId: PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
    arithmeticKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    arithmeticOperationModelId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_OPERATION_MODEL_ID,
    arithmeticPatternSpecId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_PATTERN_SPEC_ID,
    patternSpecId: patternSpec.patternSpecId,
    relationKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
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

export function buildPath1P105MultiplicativeModelingItems({
  blockId = PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID) {
    return failed([issue("PATH1_P105_MODELING_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed([issue("PATH1_P105_MODELING_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P105_MODELING_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P105_MODELING_SEED_REQUIRED")]);
  }

  const familyCounts = allocateCounts(count, PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length, `${seed}:families`);
  const selected = [];
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPECS.forEach((patternSpec, familyIndex) => {
    const needed = familyCounts[familyIndex];
    const pairs = generateDistinctPairs(needed, `${seed}:${patternSpec.patternSpecId}`);
    selected.push(...pairs.map((pair) => ({ patternSpec, familyIndex, pair })));
  });

  const ordered = seededShuffle(selected, `${seed}:cross-family`);
  const items = ordered.map((candidate, index) => materializeItem({ ...candidate, sequenceNumber: index + 1 }));
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P105MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return failed([issue("PATH1_P105_MODELING_VALIDATION_FAILED", { failures: validationFailures })]);
  }

  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P105_MODELING_DUPLICATE_PROMPT", { generated: items.length, distinct: distinctPromptCount })]);
  }

  const familySummary = Object.fromEntries(
    PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.patternSpecId === patternSpecId).length,
    ]),
  );

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      blockId: PATH1_P1_05_MULTIPLICATIVE_MODELING_BLOCK_ID,
      practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      requested: count,
      generated: items.length,
      patternFamilyCount: PATH1_P1_05_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length,
      familyCounts: Object.freeze(familySummary),
      patternSpecIdsUsed: Object.freeze(Object.keys(familySummary).filter((key) => familySummary[key] > 0)),
      distinctPromptCount,
      relationId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      relationKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
      arithmeticKnowledgePointId: PATH1_P1_05_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
      operandPairCapacityBeforeContextProjection: FULL_OPERAND_POOL.length,
      includesTotalAbove999: items.some((entry) => entry.totalAmount > 999),
      includesLowBoundary: items.some((entry) => entry.amountPerGroup === 101 && entry.groupCount === 2),
      includesHighBoundary: items.some((entry) => entry.amountPerGroup === 909 && entry.groupCount === 9),
      deterministicReplay: true,
      canonicalKnowledgePointMinted: false,
      g4bU01ModelingExpanded: false,
    }),
  });
}
