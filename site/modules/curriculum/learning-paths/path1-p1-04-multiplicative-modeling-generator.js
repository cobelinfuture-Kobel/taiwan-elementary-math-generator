import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_INVARIANT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPECS,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
  renderPath1P104MultiplicativeModelingPrompt,
} from "./path1-p1-04-multiplicative-modeling-patterns.js";
import { validatePath1P104MultiplicativeModelingItem } from "./path1-p1-04-multiplicative-modeling-validator.js";

export const PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID = "P1-04";
export const PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID = "g4a_u02_4a02";
export const PATH1_P1_04_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID = "g3b_u08_3b08";

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

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function coprimeStep(seedValue, modulus) {
  let candidate = 1 + (seedValue % (modulus - 1));
  while (gcd(candidate, modulus) !== 1) {
    candidate += 1;
    if (candidate >= modulus) candidate = 1;
  }
  return candidate;
}

function pairFromIndex(form, index) {
  const groupSpan = form.groupCountMax - form.groupCountMin + 1;
  return Object.freeze({
    amountPerGroup: form.amountPerGroupMin + Math.floor(index / groupSpan),
    groupCount: form.groupCountMin + (index % groupSpan),
  });
}

function generateDistinctPairs(form, count, seed) {
  const amountSpan = form.amountPerGroupMax - form.amountPerGroupMin + 1;
  const groupSpan = form.groupCountMax - form.groupCountMin + 1;
  const poolSize = amountSpan * groupSpan;
  const seedValue = hashSeed(`${seed}:${form.formId}`);
  const start = seedValue % poolSize;
  const step = coprimeStep(hashSeed(`${seed}:step:${form.formId}`), poolSize);
  return Array.from({ length: count }, (_, index) => pairFromIndex(form, (start + index * step) % poolSize));
}

function materializeItem({ patternSpec, familyIndex, form, pair, sequenceNumber }) {
  const { amountPerGroup, groupCount } = pair;
  const totalAmount = amountPerGroup * groupCount;
  const contextIndex = (
    amountPerGroup * 31
    + groupCount * 17
    + familyIndex * 13
    + (form.formId === "P104_3D_BY_2D" ? 7 : 0)
  ) % patternSpec.contexts.length;
  const contextEntry = patternSpec.contexts[contextIndex];
  const prompt = renderPath1P104MultiplicativeModelingPrompt({
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
    path1BlockId: PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
    practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    arithmeticFormId: form.formId,
    arithmeticKnowledgePointId: form.arithmeticKnowledgePointId,
    arithmeticOperationModelId: form.arithmeticOperationModelId,
    arithmeticPatternSpecId: form.arithmeticPatternSpecId,
    patternSpecId: patternSpec.patternSpecId,
    sourceParentPatternSpecId: patternSpec.sourceParentPatternSpecId,
    sourceSurfaceLineageOnly: true,
    sourceParentNumericAuthorityReused: false,
    contextVariantId: contextEntry.contextVariantId,
    relationKnowledgePointId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
    canonicalInvariant: PATH1_P1_04_MULTIPLICATIVE_MODELING_INVARIANT,
    languageDifficulty: PATH1_P1_04_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
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
    g4bU01ModelingExpanded: false,
    p105ZeroSpecialCapabilityUsed: false,
    masteryCredit: PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
    publicCutoverApplied: false,
  });

  return Object.freeze({
    generatedItemId: [
      "path1-p1-04-modeling",
      form.formId,
      patternSpec.patternSpecId,
      contextEntry.contextVariantId,
      amountPerGroup,
      groupCount,
      sequenceNumber,
    ].join("-"),
    prompt,
    answerText,
    mode: "application",
    operationFamilyId: PATH1_P1_04_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
    sourceIds: Object.freeze([
      PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_SOURCE_ID,
      PATH1_P1_04_MULTIPLICATIVE_MODELING_SEMANTIC_SOURCE_ID,
    ]),
    knowledgePointId: form.arithmeticKnowledgePointId,
    path1BlockId: PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
    arithmeticFormId: form.formId,
    arithmeticKnowledgePointId: form.arithmeticKnowledgePointId,
    arithmeticOperationModelId: form.arithmeticOperationModelId,
    arithmeticPatternSpecId: form.arithmeticPatternSpecId,
    patternSpecId: patternSpec.patternSpecId,
    relationKnowledgePointId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
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

export function buildPath1P104MultiplicativeModelingItems({
  blockId = PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID) {
    return failed([issue("PATH1_P104_MODELING_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed([issue("PATH1_P104_MODELING_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P104_MODELING_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P104_MODELING_SEED_REQUIRED")]);
  }

  const cells = PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPECS.flatMap((patternSpec, familyIndex) =>
    PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS.map((form) => ({ patternSpec, familyIndex, form })),
  );
  const cellCounts = allocateCounts(count, cells.length, `${seed}:family-form-cells`);
  const selected = [];

  cells.forEach((cell, cellIndex) => {
    const needed = cellCounts[cellIndex];
    const pairs = generateDistinctPairs(
      cell.form,
      needed,
      `${seed}:${cell.patternSpec.patternSpecId}:${cell.form.formId}`,
    );
    selected.push(...pairs.map((pair) => ({ ...cell, pair })));
  });

  const ordered = seededShuffle(selected, `${seed}:cross-family-form`);
  const items = ordered.map((candidate, index) => materializeItem({ ...candidate, sequenceNumber: index + 1 }));
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P104MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return failed([issue("PATH1_P104_MODELING_VALIDATION_FAILED", { failures: validationFailures })]);
  }

  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P104_MODELING_DUPLICATE_PROMPT", { generated: items.length, distinct: distinctPromptCount })]);
  }

  const familySummary = Object.fromEntries(
    PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.patternSpecId === patternSpecId).length,
    ]),
  );
  const formSummary = Object.fromEntries(
    PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS.map(({ formId }) => [
      formId,
      items.filter((entry) => entry.arithmeticFormId === formId).length,
    ]),
  );
  const familyFormSummary = Object.fromEntries(cells.map(({ patternSpec, form }) => {
    const key = `${patternSpec.patternSpecId}:${form.formId}`;
    return [key, items.filter((entry) => entry.patternSpecId === patternSpec.patternSpecId && entry.arithmeticFormId === form.formId).length];
  }));

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      blockId: PATH1_P1_04_MULTIPLICATIVE_MODELING_BLOCK_ID,
      practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      requested: count,
      generated: items.length,
      patternFamilyCount: PATH1_P1_04_MULTIPLICATIVE_MODELING_PATTERN_SPECS.length,
      arithmeticFormCount: PATH1_P1_04_MULTIPLICATIVE_MODELING_ARITHMETIC_FORMS.length,
      patternSpecIdsUsed: Object.freeze(Object.keys(familySummary).filter((key) => familySummary[key] > 0)),
      arithmeticFormIdsUsed: Object.freeze(Object.keys(formSummary).filter((key) => formSummary[key] > 0)),
      familyCounts: Object.freeze(familySummary),
      formCounts: Object.freeze(formSummary),
      familyFormCounts: Object.freeze(familyFormSummary),
      distinctPromptCount,
      relationId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      relationKnowledgePointId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
      deterministicReplay: true,
      canonicalKnowledgePointMinted: false,
      g4bU01ModelingExpanded: false,
    }),
  });
}
