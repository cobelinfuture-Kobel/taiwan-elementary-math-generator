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

const TWO_DIGIT_FACTOR_PAIRS = Object.freeze(
  Array.from({ length: 90 }, (_, leftIndex) => 10 + leftIndex)
    .flatMap((leftFactor) => Array.from({ length: 90 }, (_, rightIndex) => Object.freeze({
      leftFactor,
      rightFactor: 10 + rightIndex,
    }))),
);

function buildItem({ patternSpec, familyIndex, pair }) {
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
  const metadata = Object.freeze({
    path1BlockId: "P1-03",
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
    semanticRoleBinding: Object.freeze({
      leftFactor: "amountPerGroup",
      rightFactor: "groupCount",
      product: "totalAmount",
    }),
    semanticCommutativeRoleSwapAllowed: false,
    singleRelationOnly: true,
    unitConversionUsed: false,
    applicationPromptUsed: true,
    relationPromptUsed: true,
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
    ].join("-"),
    prompt,
    answerText: `${totalAmount}${contextEntry.answerUnit}`,
    mode: "semantic",
    operationFamilyId: PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
    sourceNodeId: "g4a_u02_4a02",
    knowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    metadata,
  });
}

export function buildPath1P103MultiplicativeModelingItems({
  count = 20,
  seed = "path1-p1-03-multiplicative-modeling",
} = {}) {
  const requested = Math.max(1, Math.min(120, Number(count) || 20));
  const familyCounts = allocateCounts(
    requested,
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
    selected.push(...pairs.map((pair) => buildItem({ patternSpec, familyIndex, pair })));
  }

  const items = seededShuffle(selected, `${seed}:cross-family`);
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P103MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return Object.freeze({
      ok: false,
      items: Object.freeze([]),
      errors: Object.freeze([{ code: "PATH1_P1_03_MODELING_VALIDATION_FAILED", failures: validationFailures }]),
      summary: null,
    });
  }

  const duplicatePromptCount = items.length - new Set(items.map((entry) => entry.prompt)).size;
  if (duplicatePromptCount !== 0) {
    return Object.freeze({
      ok: false,
      items: Object.freeze([]),
      errors: Object.freeze([{ code: "PATH1_P1_03_MODELING_DUPLICATE_PROMPT", duplicatePromptCount }]),
      summary: null,
    });
  }

  const familySummary = Object.fromEntries(
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.metadata.patternSpecId === patternSpecId).length,
    ]),
  );
  const contextSummary = Object.fromEntries(
    PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.flatMap((patternSpec) =>
      patternSpec.contexts.map(({ contextVariantId }) => {
        const key = `${patternSpec.patternSpecId}:${contextVariantId}`;
        return [key, items.filter((entry) => (
          entry.metadata.patternSpecId === patternSpec.patternSpecId
          && entry.metadata.contextVariantId === contextVariantId
        )).length];
      })),
  );

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      requested,
      generated: items.length,
      patternFamilyCount: PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length,
      familyCounts: Object.freeze(familySummary),
      contextCounts: Object.freeze(contextSummary),
      distinctPromptCount: new Set(items.map((entry) => entry.prompt)).size,
      relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      arithmeticKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
      relationKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
      minAmountPerGroup: Math.min(...items.map((entry) => entry.metadata.amountPerGroup)),
      maxAmountPerGroup: Math.max(...items.map((entry) => entry.metadata.amountPerGroup)),
      minGroupCount: Math.min(...items.map((entry) => entry.metadata.groupCount)),
      maxGroupCount: Math.max(...items.map((entry) => entry.metadata.groupCount)),
    }),
  });
}
