import { getBatchASourceUnit } from "./source-units.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "./visible-pattern-group-resolver.js";
import {
  G4A_U04_PATTERN_SPEC_IDS,
  G4A_U04_SOURCE_ID,
  getBatchABrowserPatternDefinition
} from "./source-pattern-g4a-u04-extension.js";

const candidateCache = new Map();

function issue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function firstDigit(value) {
  return Number(String(value)[0]);
}

function firstTwoDigits(value) {
  return Number(String(value).slice(0, 2));
}

function quotientStartPlace(quotient) {
  if (quotient >= 1000) return "thousands";
  if (quotient >= 100) return "hundreds";
  if (quotient >= 10) return "tens";
  return "ones";
}

function hasQuotientZeroInMiddle(quotient) {
  const text = String(quotient);
  return text.length >= 2 && text.slice(1, -1).includes("0") || text.length >= 3 && text.includes("0");
}

function metadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds]
  };
}

function answerTextFor(quotient, remainder) {
  return `商 ${quotient}，餘 ${remainder}`;
}

function firstDivisionUnitFor(definition, dividend) {
  if (definition.firstPlaceCase === "thousands_sufficient" || definition.firstPlaceCase === "thousands_exact") return firstDigit(dividend);
  if (definition.firstPlaceCase === "thousands_insufficient") return firstTwoDigits(dividend);
  if (definition.firstPlaceCase === "tens_sufficient") return firstTwoDigits(dividend);
  if (definition.firstPlaceCase === "tens_insufficient") return dividend;
  return dividend;
}

function firstPlaceRuleMatches(definition, dividend, divisor, quotient) {
  const leading = firstDigit(dividend);
  const firstTwo = firstTwoDigits(dividend);
  if (definition.firstPlaceCase === "thousands_sufficient") return digitCount(dividend) === 4 && digitCount(divisor) === 1 && leading >= divisor && leading % divisor !== 0 && quotientStartPlace(quotient) === "thousands";
  if (definition.firstPlaceCase === "thousands_insufficient") return digitCount(dividend) === 4 && digitCount(divisor) === 1 && leading < divisor && quotientStartPlace(quotient) === "hundreds";
  if (definition.firstPlaceCase === "thousands_exact") return digitCount(dividend) === 4 && digitCount(divisor) === 1 && leading >= divisor && leading % divisor === 0 && quotientStartPlace(quotient) === "thousands";
  if (definition.firstPlaceCase === "ten_multiple_divisor") return digitCount(dividend) === 2 && digitCount(divisor) === 2 && divisor % 10 === 0 && quotientStartPlace(quotient) === "ones";
  if (definition.firstPlaceCase === "tens_sufficient") return digitCount(dividend) === 3 && digitCount(divisor) === 2 && firstTwo >= divisor && quotientStartPlace(quotient) === "tens";
  if (definition.firstPlaceCase === "tens_insufficient") return digitCount(dividend) === 3 && digitCount(divisor) === 2 && firstTwo < divisor && quotientStartPlace(quotient) === "ones";
  return false;
}

function candidateMatchesCoverage(candidate, coverageCase) {
  if (coverageCase === "remainder_zero") return candidate.remainder === 0;
  if (coverageCase === "remainder_nonzero") return candidate.remainder > 0;
  if (coverageCase === "quotient_zero_in_middle") return hasQuotientZeroInMiddle(candidate.quotient);
  if (coverageCase === "next_digit_zero") return String(candidate.dividend)[1] === "0";
  if (coverageCase === "divisor_10_multiple") return candidate.divisor % 10 === 0;
  return true;
}

function buildCandidates(definition) {
  if (candidateCache.has(definition.patternSpecId)) return candidateCache.get(definition.patternSpecId);
  const candidates = [];
  const dividendMin = definition.dividendDigits === 4 ? 1000 : definition.dividendDigits === 3 ? 100 : 10;
  const dividendMax = definition.dividendDigits === 4 ? 9999 : definition.dividendDigits === 3 ? 999 : 99;
  const divisors = definition.divisorSet ?? (definition.divisorDigits === 1 ? [2, 3, 4, 5, 6, 7, 8, 9] : Array.from({ length: 90 }, (_, index) => index + 10));
  for (const divisor of divisors) {
    for (let dividend = dividendMin; dividend <= dividendMax; dividend += 1) {
      if (dividend < divisor) continue;
      const quotient = Math.floor(dividend / divisor);
      const remainder = dividend % divisor;
      if (quotient <= 0) continue;
      if (!firstPlaceRuleMatches(definition, dividend, divisor, quotient)) continue;
      candidates.push({ dividend, divisor, quotient, remainder, quotientStartPlace: definition.quotientStartPlace, firstDivisionUnit: firstDivisionUnitFor(definition, dividend) });
    }
  }
  candidateCache.set(definition.patternSpecId, candidates);
  return candidates;
}

function selectCandidate(definition, sequenceNumber, seed) {
  const candidates = buildCandidates(definition);
  const coverageCases = definition.coverageCases?.length > 0 ? definition.coverageCases : ["remainder_nonzero"];
  const desiredCoverage = coverageCases[(sequenceNumber - 1) % coverageCases.length];
  const matching = candidates.filter((candidate) => candidateMatchesCoverage(candidate, desiredCoverage));
  const pool = matching.length > 0 ? matching : candidates;
  const index = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`)) % pool.length;
  const candidate = pool[index];
  return { ...candidate, coverageCase: desiredCoverage };
}

function makeLongDivisionQuestion(definition, sequenceNumber, seed) {
  const selected = selectCandidate(definition, sequenceNumber, seed);
  const answerText = answerTextFor(selected.quotient, selected.remainder);
  const promptText = `${definition.title}：${selected.dividend} ÷ ${selected.divisor} = ______`;
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    dividend: selected.dividend,
    divisor: selected.divisor,
    quotient: selected.quotient,
    remainder: selected.remainder,
    dividendDigits: definition.dividendDigits,
    divisorDigits: definition.divisorDigits,
    quotientDigits: digitCount(selected.quotient),
    firstDivisionUnit: selected.firstDivisionUnit,
    quotientStartPlace: selected.quotientStartPlace,
    firstPlaceCase: definition.firstPlaceCase,
    coverageCase: selected.coverageCase,
    promptText,
    displayText: `${promptText} ${answerText}`,
    blankedDisplayText: promptText,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(definition)
  };
}

function makeDivisionCheckQuestion(definition, sequenceNumber, seed) {
  const seedValue = mix32(hashSeed(`${seed}:${sequenceNumber}`));
  const divisor = 2 + (seedValue % 48);
  const quotient = 2 + (mix32(seedValue + 17) % 97);
  const remainder = 1 + (mix32(seedValue + 31) % (divisor - 1));
  const dividend = divisor * quotient + remainder;
  const answerText = `${divisor} × ${quotient} + ${remainder} = ${dividend}`;
  const promptText = `${dividend} ÷ ${divisor} = 商 ${quotient}，餘 ${remainder}。驗算：${divisor} × ${quotient} + ${remainder} = ______`;
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    dividend,
    divisor,
    quotient,
    remainder,
    checkExpression: `${divisor} × ${quotient} + ${remainder}`,
    checkValue: dividend,
    quotientStartPlace: "not_applicable",
    firstPlaceCase: definition.firstPlaceCase,
    coverageCase: "remainder_nonzero",
    promptText,
    displayText: `${promptText} ${answerText}`,
    blankedDisplayText: promptText,
    answerText,
    finalAnswer: answerText,
    metadata: metadata(definition)
  };
}

function generateQuestion(patternSpecId, sequenceNumber, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) return null;
  if (definition.kind === "g4aU04LongDivision") return makeLongDivisionQuestion(definition, sequenceNumber, seed);
  if (definition.kind === "g4aU04DivisionCheckWithRemainder") return makeDivisionCheckQuestion(definition, sequenceNumber, seed);
  return null;
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function buildPlan(options = {}) {
  const sourceId = options.sourceId;
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const basePlan = {
    sourceId,
    questionCount,
    ordering: options.ordering ?? "groupedByPattern",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: String(options.generationSeed ?? "batch-a-browser"),
    sourceUnit: getBatchASourceUnit(sourceId)
  };
  const selectionMode = options.selectionMode ?? BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) return { ...basePlan, worksheetMode: "batchASource", selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], patternSpecIds: [...G4A_U04_PATTERN_SPEC_IDS], allocation: null, resolverResult: null };
  const resolverResult = resolveVisiblePatternGroupSelection({ ...options, sourceId, selectionMode, questionCount });
  return {
    ...basePlan,
    worksheetMode: resolverResult.worksheetMode ?? "batchAKnowledgePoint",
    selectionMode: resolverResult.selectionMode ?? selectionMode,
    selectedKnowledgePointIds: cloneValue(resolverResult.knowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(resolverResult.patternGroupIds ?? []),
    patternSpecIds: cloneValue((resolverResult.patternSpecIds ?? []).filter((id) => G4A_U04_PATTERN_SPEC_IDS.includes(id))),
    allocation: cloneValue((resolverResult.allocation ?? []).filter((entry) => G4A_U04_PATTERN_SPEC_IDS.includes(entry.patternSpecId))),
    resolverResult
  };
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const shuffled = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:g4a-u04-shuffle:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function canGenerateG4AU04DivisionQuestions(optionsOrPlan = {}) {
  return optionsOrPlan?.sourceId === G4A_U04_SOURCE_ID;
}

export function generateG4AU04DivisionQuestions(options = {}) {
  const plan = buildPlan(options);
  if (plan.sourceId !== G4A_U04_SOURCE_ID) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u04_source_mismatch", "sourceId", "G4A-U04 generator received a non-G4A-U04 sourceId.")], warnings: [] };
  if (plan.resolverResult && !plan.resolverResult.ok) return { ok: false, plan, questions: [], allocation: [], errors: plan.resolverResult.errors ?? [], warnings: plan.resolverResult.warnings ?? [] };
  if (plan.patternSpecIds.length === 0) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u04_no_pattern_selected", "patternSpecIds", "No implemented G4A-U04 PatternSpec is selected.")], warnings: [] };
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  const promptKeys = new Set();
  for (const entry of allocation) {
    let generatedForPattern = 0;
    const maxAttempts = Math.max(entry.questionCount * 8, 80);
    for (let attempt = 1; generatedForPattern < entry.questionCount && attempt <= maxAttempts; attempt += 1) {
      const question = generateQuestion(entry.patternSpecId, attempt, `${plan.generationSeed}:${entry.patternSpecId}:${attempt}`);
      if (!question) {
        errors.push(issue("g4a_u04_question_generation_failed", entry.patternSpecId, `Failed to generate ${entry.patternSpecId}.`));
        continue;
      }
      const promptKey = `${question.patternSpecId}:${question.blankedDisplayText}`;
      if (promptKeys.has(promptKey)) continue;
      promptKeys.add(promptKey);
      questions.push({ ...question, id: `${entry.patternSpecId}-${questions.length + 1}` });
      generatedForPattern += 1;
    }
    if (generatedForPattern < entry.questionCount) errors.push(issue("g4a_u04_unique_pool_exhausted", entry.patternSpecId, `${entry.patternSpecId} requires ${entry.questionCount} questions but generated ${generatedForPattern} unique prompts.`));
  }
  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings: [] };
}
