import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_OPERATION_FAMILY_ID,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID,
  PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
  buildPath1P106EstimateOptions,
  getPath1P106CanonicalCase,
  getPath1P106CanonicalModel,
  getPath1P106WholeTenEstimate,
  renderPath1P106EstimateTrialQuotientAnswerText,
  renderPath1P106EstimateTrialQuotientPrompt,
} from "./path1-p1-06-estimate-trial-quotient-patterns.js";
import { validatePath1P106EstimateTrialQuotientItem } from "./path1-p1-06-estimate-trial-quotient-validator.js";

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

function buildCanonicalRows(knowledgePointId) {
  const canonicalModel = getPath1P106CanonicalModel(knowledgePointId);
  const rows = [];
  for (let divisor = 11; divisor <= 99; divisor += 1) {
    const estimateDivisor = getPath1P106WholeTenEstimate(divisor);
    if (estimateDivisor == null) continue;
    for (let firstTwoDigits = 10; firstTwoDigits <= 99; firstTwoDigits += 1) {
      const caseId = firstTwoDigits >= divisor ? "tens_sufficient" : "tens_insufficient";
      if (caseId !== canonicalModel.canonicalCase) continue;
      for (let ones = 0; ones <= 9; ones += 1) {
        const dividend = firstTwoDigits * 10 + ones;
        const quotient = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;
        rows.push(Object.freeze({
          knowledgePointId,
          canonicalCase: canonicalModel.canonicalCase,
          operationModelId: canonicalModel.operationModelId,
          canonicalPatternSpecId: canonicalModel.canonicalPatternSpecId,
          dividend,
          divisor,
          estimateDivisor,
          firstTwoDigits,
          quotient,
          remainder,
        }));
      }
    }
  }
  return Object.freeze(rows);
}

const SUFFICIENT_ROWS = buildCanonicalRows(PATH1_P1_06_TENS_SUFFICIENT_KP_ID);
const INSUFFICIENT_ROWS = buildCanonicalRows(PATH1_P1_06_TENS_INSUFFICIENT_KP_ID);
const ALL_ROWS = Object.freeze([...SUFFICIENT_ROWS, ...INSUFFICIENT_ROWS]);

const ANCHORS_BY_PATTERN = Object.freeze({
  P106_ESTIMATE_DIVISOR_TENS_SELECT: Object.freeze([
    { knowledgePointId: PATH1_P1_06_TENS_INSUFFICIENT_KP_ID, dividend: 785, divisor: 92 },
    { knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID, dividend: 486, divisor: 47 },
  ]),
  P106_ESTIMATE_DIVISOR_TENS_FILL: Object.freeze([
    { knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID, dividend: 583, divisor: 11 },
    { knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID, dividend: 785, divisor: 38 },
  ]),
  P106_ESTIMATE_THEN_DIVIDE_TENS_SUFFICIENT: Object.freeze([
    { knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID, dividend: 785, divisor: 38 },
    { knowledgePointId: PATH1_P1_06_TENS_SUFFICIENT_KP_ID, dividend: 486, divisor: 47 },
  ]),
  P106_ESTIMATE_THEN_DIVIDE_TENS_INSUFFICIENT: Object.freeze([
    { knowledgePointId: PATH1_P1_06_TENS_INSUFFICIENT_KP_ID, dividend: 785, divisor: 92 },
    { knowledgePointId: PATH1_P1_06_TENS_INSUFFICIENT_KP_ID, dividend: 374, divisor: 62 },
  ]),
});

function rowKey(row) {
  return `${row.knowledgePointId}:${row.dividend}:${row.divisor}`;
}

function resolveAnchor(anchor) {
  const pool = anchor.knowledgePointId === PATH1_P1_06_TENS_SUFFICIENT_KP_ID ? SUFFICIENT_ROWS : INSUFFICIENT_ROWS;
  return pool.find((row) => row.dividend === anchor.dividend && row.divisor === anchor.divisor) ?? null;
}

function poolForPattern(patternSpec) {
  if (patternSpec.applicableKnowledgePointIds.length === 2) return ALL_ROWS;
  if (patternSpec.applicableKnowledgePointIds[0] === PATH1_P1_06_TENS_SUFFICIENT_KP_ID) return SUFFICIENT_ROWS;
  return INSUFFICIENT_ROWS;
}

function selectDistinctRows(patternSpec, count, seed) {
  if (count <= 0) return [];
  const anchors = (ANCHORS_BY_PATTERN[patternSpec.patternSpecId] ?? [])
    .map(resolveAnchor)
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
  const prompt = renderPath1P106EstimateTrialQuotientPrompt({
    patternSpecId: patternSpec.patternSpecId,
    dividend: row.dividend,
    divisor: row.divisor,
  });
  const answerText = renderPath1P106EstimateTrialQuotientAnswerText({
    patternSpecId: patternSpec.patternSpecId,
    dividend: row.dividend,
    divisor: row.divisor,
  });
  const answerIsEstimateOnly = patternSpec.answerKind === "estimatedDivisor";
  const options = patternSpec.representationType === "estimate_divisor_tens_select"
    ? buildPath1P106EstimateOptions(row.divisor)
    : null;
  const metadata = Object.freeze({
    path1BlockId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
    practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
    representationPatternId: patternSpec.patternSpecId,
    representationType: patternSpec.representationType,
    path1ParentPatternId: patternSpec.path1ParentPatternId,
    knowledgePointId: row.knowledgePointId,
    operationModelId: row.operationModelId,
    canonicalPatternSpecId: row.canonicalPatternSpecId,
    canonicalCase: row.canonicalCase,
    dividend: row.dividend,
    divisor: row.divisor,
    estimateDivisor: row.estimateDivisor,
    quotient: row.quotient,
    remainder: row.remainder,
    firstTwoDigits: row.firstTwoDigits,
    estimateStrategy: "nearest_whole_ten_source_unambiguous",
    estimateTieConventionApplied: false,
    relationId: null,
    unknownRole: null,
    applicationPromptUsed: false,
    relationPromptUsed: false,
    unitConversionUsed: false,
    remainderContextInterpretationUsed: false,
    quotientPlaceTeachingUsed: false,
    canonicalKnowledgePointMinted: false,
    masteryCredit: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT,
    publicCutoverApplied: false,
  });

  return Object.freeze({
    generatedItemId: [
      "path1-p1-06-estimate-trial",
      patternSpec.patternSpecId,
      row.knowledgePointId,
      row.dividend,
      row.divisor,
      sequenceNumber,
    ].join("-"),
    prompt,
    answerText,
    mode: "numeric",
    operationFamilyId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_OPERATION_FAMILY_ID,
    sourceNodeId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID,
    sourceIds: Object.freeze([PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_SOURCE_ID]),
    path1BlockId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
    knowledgePointId: row.knowledgePointId,
    operationModelId: row.operationModelId,
    canonicalPatternSpecId: row.canonicalPatternSpecId,
    patternSpecId: patternSpec.patternSpecId,
    representationType: patternSpec.representationType,
    relationId: null,
    unknownRole: null,
    dividend: row.dividend,
    divisor: row.divisor,
    estimateDivisor: row.estimateDivisor,
    quotient: row.quotient,
    remainder: row.remainder,
    firstTwoDigits: row.firstTwoDigits,
    options: options ? Object.freeze(options) : null,
    equationModel: answerIsEstimateOnly ? null : `${row.dividend} ÷ ${row.divisor} = ${row.quotient}…${row.remainder}`,
    finalAnswer: answerIsEstimateOnly ? row.estimateDivisor : row.quotient,
    finalRemainder: answerIsEstimateOnly ? null : row.remainder,
    finalAnswerUnit: null,
    metadata,
  });
}

export function buildPath1P106EstimateTrialQuotientItems({
  blockId = PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
  count = 20,
  seed,
  practiceMode = PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID) {
    return failed([issue("PATH1_P106_ESTIMATE_BLOCK_NOT_SUPPORTED", { blockId })]);
  }
  if (practiceMode !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE) {
    return failed([issue("PATH1_P106_ESTIMATE_PRACTICE_MODE_INVALID", { practiceMode })]);
  }
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    return failed([issue("PATH1_P106_ESTIMATE_COUNT_INVALID", { count })]);
  }
  if (typeof seed !== "string" || seed.trim().length === 0) {
    return failed([issue("PATH1_P106_ESTIMATE_SEED_REQUIRED")]);
  }

  const familyCounts = allocateCounts(
    count,
    PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.length,
    `${seed}:families`,
  );
  const selected = [];
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.forEach((patternSpec, familyIndex) => {
    const rows = selectDistinctRows(patternSpec, familyCounts[familyIndex], seed);
    selected.push(...rows.map((row) => ({ patternSpec, familyIndex, row })));
  });

  const ordered = seededShuffle(selected, `${seed}:cross-family`);
  const items = ordered.map((candidate, index) => materializeItem({ ...candidate, sequenceNumber: index + 1 }));
  const validationFailures = items
    .map((entry, index) => ({ index, validation: validatePath1P106EstimateTrialQuotientItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (validationFailures.length > 0) {
    return failed([issue("PATH1_P106_ESTIMATE_VALIDATION_FAILED", { failures: validationFailures })]);
  }

  const distinctPromptCount = new Set(items.map((entry) => entry.prompt)).size;
  if (distinctPromptCount !== items.length) {
    return failed([issue("PATH1_P106_ESTIMATE_DUPLICATE_PROMPT", { generated: items.length, distinct: distinctPromptCount })]);
  }

  const familySummary = Object.fromEntries(
    PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.map(({ patternSpecId }) => [
      patternSpecId,
      items.filter((entry) => entry.patternSpecId === patternSpecId).length,
    ]),
  );
  const kpSummary = Object.fromEntries([
    PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
    PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  ].map((knowledgePointId) => [
    knowledgePointId,
    items.filter((entry) => entry.knowledgePointId === knowledgePointId).length,
  ]));

  return Object.freeze({
    ok: true,
    items: Object.freeze(items),
    errors: Object.freeze([]),
    summary: Object.freeze({
      blockId: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_BLOCK_ID,
      practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
      requested: count,
      generated: items.length,
      patternFamilyCount: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PATTERN_SPECS.length,
      familyCounts: Object.freeze(familySummary),
      knowledgePointCounts: Object.freeze(kpSummary),
      distinctPromptCount,
      relationId: null,
      wordProblemModelingUsed: false,
      observedEstimateAnchorsPresent: Object.freeze({
        "11->10": items.some((entry) => entry.divisor === 11 && entry.estimateDivisor === 10),
        "38->40": items.some((entry) => entry.divisor === 38 && entry.estimateDivisor === 40),
        "47->50": items.some((entry) => entry.divisor === 47 && entry.estimateDivisor === 50),
        "92->90": items.some((entry) => entry.divisor === 92 && entry.estimateDivisor === 90),
      }),
      divisorEndingFiveUsed: items.some((entry) => entry.divisor % 10 === 5),
      divisorEndingZeroUsed: items.some((entry) => entry.divisor % 10 === 0),
      canonicalKnowledgePointMinted: false,
      deterministicReplay: true,
    }),
  });
}
