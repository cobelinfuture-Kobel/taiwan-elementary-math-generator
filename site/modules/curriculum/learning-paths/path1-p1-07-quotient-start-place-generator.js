import {
  PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
  PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT,
  PATH1_P1_07_QUOTIENT_START_PLACE_OPERATION_FAMILY_ID,
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS,
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID,
  PATH1_P1_07_THREE_DIGIT_KP_ID,
  PATH1_P1_07_TWO_DIGIT_KP_ID,
  buildPath1P107Options,
  getPath1P107CanonicalModel,
  getPath1P107Case,
  getPath1P107StartPlaceLabel,
  renderPath1P107QuotientStartPlaceAnswerText,
  renderPath1P107QuotientStartPlacePrompt,
} from "./path1-p1-07-quotient-start-place-patterns.js";
import { validatePath1P107QuotientStartPlaceItem } from "./path1-p1-07-quotient-start-place-validator.js";

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

function hasDeferredQuotientZeroCase(quotient) {
  return String(quotient).includes("0");
}

function buildCanonicalRows(knowledgePointId) {
  const canonicalModel = getPath1P107CanonicalModel(knowledgePointId);
  const minDividend = canonicalModel.dividendDigits === 2 ? 10 : 100;
  const maxDividend = canonicalModel.dividendDigits === 2 ? 99 : 999;
  const rows = [];
  for (let divisor = 2; divisor <= 9; divisor += 1) {
    for (let dividend = minDividend; dividend <= maxDividend; dividend += 1) {
      if (dividend % divisor !== 0) continue;
      const quotient = dividend / divisor;
      if (hasDeferredQuotientZeroCase(quotient)) continue;
      const canonicalCase = getPath1P107Case({ dividend, divisor });
      if (!canonicalCase || canonicalCase.knowledgePointId !== knowledgePointId) continue;
      if (String(quotient).length !== canonicalCase.expectedQuotientDigits) continue;
      rows.push(Object.freeze({
        knowledgePointId,
        operationModelId: canonicalModel.operationModelId,
        semanticParentPatternSpecIds: canonicalModel.semanticParentPatternSpecIds,
        dividend,
        divisor,
        quotient,
        remainder: 0,
        caseId: canonicalCase.caseId,
        leadingDigit: canonicalCase.leadingDigit,
        startPlace: canonicalCase.expectedStartPlace,
        quotientDigits: canonicalCase.expectedQuotientDigits,
      }));
    }
  }
  return Object.freeze(rows);
}

const TWO_DIGIT_ROWS = buildCanonicalRows(PATH1_P1_07_TWO_DIGIT_KP_ID);
const THREE_DIGIT_ROWS = buildCanonicalRows(PATH1_P1_07_THREE_DIGIT_KP_ID);

const ANCHORS_BY_PATTERN = Object.freeze({
  P107_2DIGIT_START_PLACE_SELECT: Object.freeze([
    { dividend: 18, divisor: 3 },
    { dividend: 84, divisor: 4 },
  ]),
  P107_2DIGIT_QUOTIENT_DIGIT_COUNT: Object.freeze([
    { dividend: 18, divisor: 3 },
    { dividend: 84, divisor: 4 },
  ]),
  P107_3DIGIT_START_PLACE_SELECT: Object.freeze([
    { dividend: 168, divisor: 4 },
    { dividend: 864, divisor: 4 },
  ]),
  P107_3DIGIT_QUOTIENT_DIGIT_COUNT: Object.freeze([
    { dividend: 168, divisor: 4 },
    { dividend: 864, divisor: 4 },
  ]),
});

function rowKey(row) {
  return `${row.dividend}:${row.divisor}`;
}

function poolForPattern(patternSpec) {
  return patternSpec.applicableKnowledgePointIds[0] === PATH1_P1_07_TWO_DIGIT_KP_ID
    ? TWO_DIGIT_ROWS
    : THREE_DIGIT_ROWS;
}

function resolveAnchor(patternSpec, anchor) {
  return poolForPattern(patternSpec).find(
    (row) => row.dividend === anchor.dividend && row.divisor === anchor.divisor,
  ) ?? null;
}

function selectDistinctRows(patternSpec, count, seed) {
  if (count <= 0) return [];
  const anchors = (ANCHORS_BY_PATTERN[patternSpec.patternSpecId] ?? [])
    .map((anchor) => resolveAnchor(patternSpec, anchor))
    .filter(Boolean)
    .slice(0, Math.min(count, 2));
  const excluded = new Set(anchors.map(rowKey));
  const shuffled = seededShuffle(
    poolForPattern(patternSpec).filter((row) => !excluded.has(rowKey(row))),
    `${seed}:${patternSpec.patternSpecId}:pool`,
  );
  return [...anchors, ...shuffled.slice(0, count - anchors.length)];
}

function materializeItem({ patternSpec, row, sequenceNumber }) {
  const prompt = renderPath1P107QuotientStartPlacePrompt({
    patternSpecId: patternSpec.patternSpecId,
    dividend: row.dividend,
    divisor: row.divisor,
  });
  const answerText = renderPath1P107QuotientStartPlaceAnswerText({
    patternSpecId: patternSpec.patternSpecId,
    dividend: row.dividend,
    divisor: row.divisor,
  });
  const options = buildPath1P107Options({
    patternSpecId: patternSpec.patternSpecId,
    dividend: row.dividend,
    divisor: row.divisor,
  });
  const finalAnswer = patternSpec.answerKind === "startPlace"
    ? getPath1P107StartPlaceLabel(row.startPlace)
    : row.quotientDigits;
  const metadata = Object.freeze({
    path1BlockId: PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
    practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
    representationPatternId: patternSpec.patternSpecId,
    representationType: patternSpec.representationType,
    path1ParentPatternId: patternSpec.path1ParentPatternId,
    knowledgePointId: row.knowledgePointId,
    operationModelId: row.operationModelId,
    semanticParentPatternSpecIds: Object.freeze([...row.semanticParentPatternSpecIds]),
    caseId: row.caseId,
    dividend: row.dividend,
    divisor: row.divisor,
    quotient: row.quotient,
    remainder: 0,
    leadingDigit: row.leadingDigit,
    startPlace: row.startPlace,
    quotientDigits: row.quotientDigits,
    exactDivisionRequired: true,
    quotientZeroCaseUsed: false,
    twoDigitDivisorRepresentationUsed: false,
    divisorEstimationUsed: false,
    remainderContextInterpretationUsed: false,
    applicationPromptUsed: false,
    relationPromptUsed: false,
    wordProblemRelationUsed: false,
    relationId: null,
    unknownRole: null,
    canonicalKnowledgePointMinted: false,
    masteryCredit: PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT,
    publicCutoverApplied: false,
  });

  return Object.freeze({
    generatedItemId: [
      "path1-p1-07-quotient-start-place",
      patternSpec.patternSpecId,
      row.knowledgePointId,
      row.dividend,
      row.divisor,
      sequenceNumber,
    ].join("-"),
    prompt,
    answerText,
    mode: "numeric",
    operationFamilyId: PATH1_P1_07_QUOTIENT_START_PLACE_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID,
    sourceIds: Object.freeze([PATH1_P1_07_QUOTIENT_START_PLACE_SOURCE_ID]),
    path1BlockId: PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
    knowledgePointId: row.knowledgePointId,
    operationModelId: row.operationModelId,
    semanticParentPatternSpecIds: Object.freeze([...row.semanticParentPatternSpecIds]),
    patternSpecId: patternSpec.patternSpecId,
    representationType: patternSpec.representationType,
    caseId: row.caseId,
    dividend: row.dividend,
    divisor: row.divisor,
    quotient: row.quotient,
    remainder: 0,
    leadingDigit: row.leadingDigit,
    startPlace: row.startPlace,
    quotientDigits: row.quotientDigits,
    relationId: null,
    unknownRole: null,
    options,
    equationModel: `${row.dividend} ÷ ${row.divisor} = ${row.quotient}`,
    finalAnswer,
    finalRemainder: null,
    finalAnswerUnit: null,
    metadata,
  });
}

export function buildPath1P107QuotientStartPlaceItems({
  blockId = PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_SEED_REQUIRED")]);
  }

  const familyCounts = allocateCounts(
    count,
    PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.length,
    `${seed}:families`,
  );
  const selected = [];
  PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.forEach((patternSpec, familyIndex) => {
    const rows = selectDistinctRows(patternSpec, familyCounts[familyIndex], seed);
    selected.push(...rows.map((row) => ({ patternSpec, row })));
  });
  if (selected.length !== count) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_CAPACITY_SHORTFALL", { requested: count, available: selected.length })]);
  }

  const ordered = seededShuffle(selected, `${seed}:cross-family`);
  const items = ordered.map((candidate, index) => materializeItem({ ...candidate, sequenceNumber: index + 1 }));
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P107QuotientStartPlaceItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_VALIDATION_FAILED", { failures: validationFailures })]);
  }

  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P107_QUOTIENT_PLACE_DUPLICATE_PROMPT", { generated: items.length, distinct: distinctPromptCount })]);
  }

  const familyCountsSummary = Object.fromEntries(
    PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.patternSpecId === patternSpecId).length,
    ]),
  );
  const kpCounts = Object.fromEntries([
    PATH1_P1_07_TWO_DIGIT_KP_ID,
    PATH1_P1_07_THREE_DIGIT_KP_ID,
  ].map((knowledgePointId) => [
    knowledgePointId,
    items.filter((entry) => entry.knowledgePointId === knowledgePointId).length,
  ]));
  const caseCounts = Object.fromEntries([
    "P107_2DIGIT_LEADING_INSUFFICIENT",
    "P107_2DIGIT_LEADING_SUFFICIENT",
    "P107_3DIGIT_HUNDREDS_INSUFFICIENT",
    "P107_3DIGIT_HUNDREDS_SUFFICIENT",
  ].map((caseId) => [caseId, items.filter((entry) => entry.caseId === caseId).length]));

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      blockId: PATH1_P1_07_QUOTIENT_START_PLACE_BLOCK_ID,
      practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
      requested: count,
      generated: items.length,
      patternFamilyCount: PATH1_P1_07_QUOTIENT_START_PLACE_PATTERN_SPECS.length,
      familyCounts: Object.freeze(familyCountsSummary),
      knowledgePointCounts: Object.freeze(kpCounts),
      caseCounts: Object.freeze(caseCounts),
      distinctPromptCount,
      exactDivisionOnly: items.every((entry) => entry.remainder === 0),
      quotientZeroCaseUsed: items.some((entry) => String(entry.quotient).includes("0")),
      twoDigitDivisorRepresentationUsed: items.some((entry) => entry.divisor >= 10),
      divisorEstimationUsed: false,
      wordProblemModelingUsed: false,
      canonicalKnowledgePointMinted: false,
      deterministicReplay: true,
    }),
  });
}
