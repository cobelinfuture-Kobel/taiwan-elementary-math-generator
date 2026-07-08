import { getBatchASourceUnit } from "./source-units.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "./visible-pattern-group-resolver.js";
import {
  G4A_U02_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U02_SOURCE_ID,
  getBatchABrowserPatternDefinition
} from "./source-pattern-g4a-u02-extension.js";

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

function randomInt(seedValue, min, max) {
  return min + (seedValue % (max - min + 1));
}

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function hasCarryInMultiplication(multiplicand, multiplier) {
  let carry = 0;
  for (const digit of String(multiplicand).split("").reverse().map(Number)) {
    const raw = digit * multiplier + carry;
    if (raw >= 10) return true;
    carry = Math.floor(raw / 10);
  }
  return carry > 0;
}

function hasZeroInOperand(...values) {
  return values.some((value) => String(value).includes("0"));
}

function buildPartialProducts(multiplicand, multiplier) {
  if (digitCount(multiplier) < 2) return [];
  const onesDigit = multiplier % 10;
  const tensDigit = Math.floor(multiplier / 10) % 10;
  return [
    { place: "ones", digit: onesDigit, unshiftedValue: multiplicand * onesDigit, shiftedValue: multiplicand * onesDigit },
    { place: "tens", digit: tensDigit, unshiftedValue: multiplicand * tensDigit, shiftedValue: multiplicand * tensDigit * 10 }
  ];
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

function coverageCaseFor(definition, sequenceNumber) {
  const cases = Array.isArray(definition.coverageCases) && definition.coverageCases.length > 0
    ? definition.coverageCases
    : ["normal_no_carry"];
  return cases[(sequenceNumber - 1) % cases.length];
}

function makeOperandByDigits(seedValue, digits) {
  if (digits === 1) return randomInt(seedValue, 2, 9);
  const min = 10 ** (digits - 1);
  const max = (10 ** digits) - 1;
  return randomInt(seedValue, min, max);
}

function chooseVerticalOperands(definition, sequenceNumber, seed) {
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const coverageCase = coverageCaseFor(definition, sequenceNumber);
  const multiplicandDigits = definition.multiplicandDigits;
  const multiplierDigits = definition.multiplierDigits;

  if (coverageCase === "zero_in_operand") {
    const baseByDigits = { 2: 40, 3: 206, 4: 2006 };
    return { multiplicand: baseByDigits[multiplicandDigits] ?? makeOperandByDigits(seedValue, multiplicandDigits), multiplier: multiplierDigits === 1 ? randomInt(seedValue, 2, 9) : 20 + (seedValue % 8), coverageCase };
  }
  if (coverageCase === "zero_in_product" || coverageCase === "trailing_zero_product") {
    const baseByDigits = { 2: 25, 3: 125, 4: 1250 };
    return { multiplicand: baseByDigits[multiplicandDigits] ?? 25, multiplier: multiplierDigits === 1 ? 8 : 40, coverageCase };
  }
  if (coverageCase === "multiplier_multiple_of_10" || coverageCase === "partial_product_zero") {
    return { multiplicand: makeOperandByDigits(seedValue, multiplicandDigits), multiplier: 20 + ((sequenceNumber % 8) * 10), coverageCase };
  }
  if (coverageCase === "carry") {
    const carryBase = multiplicandDigits === 2 ? 87 : multiplicandDigits === 3 ? 486 : 2486;
    return { multiplicand: carryBase, multiplier: multiplierDigits === 1 ? 7 : 36, coverageCase };
  }

  const multiplicand = makeOperandByDigits(seedValue, multiplicandDigits);
  const multiplier = multiplierDigits === 1 ? randomInt(mix32(seedValue + 17), 2, 9) : randomInt(mix32(seedValue + 17), 11, 99);
  return { multiplicand, multiplier, coverageCase };
}

function compactVerticalText(multiplicand, multiplier) {
  return `${multiplicand} × ${multiplier} = ______`;
}

function makeVerticalQuestion(definition, sequenceNumber, seed) {
  const operands = chooseVerticalOperands(definition, sequenceNumber, seed);
  const product = operands.multiplicand * operands.multiplier;
  const partialProducts = buildPartialProducts(operands.multiplicand, operands.multiplier);
  const answerText = String(product);
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    multiplicand: operands.multiplicand,
    multiplier: operands.multiplier,
    product,
    operandDigitCounts: { multiplicand: definition.multiplicandDigits, multiplier: definition.multiplierDigits },
    partialProducts,
    partialProductsRequired: definition.partialProductsRequired === true,
    coverageCase: operands.coverageCase,
    hasCarry: definition.multiplierDigits === 1 ? hasCarryInMultiplication(operands.multiplicand, operands.multiplier) : null,
    hasZeroInOperand: hasZeroInOperand(operands.multiplicand, operands.multiplier),
    hasZeroInProduct: String(product).includes("0"),
    promptText: `計算：${operands.multiplicand} × ${operands.multiplier}`,
    displayText: `${operands.multiplicand} × ${operands.multiplier} = ${product}`,
    blankedDisplayText: compactVerticalText(operands.multiplicand, operands.multiplier),
    answerText,
    finalAnswer: product,
    metadata: metadata(definition)
  };
}

function maskDigit(value, index) {
  const chars = String(value).split("");
  chars[index] = "□";
  return chars.join("");
}

function makeMissingDigitQuestion(definition, sequenceNumber, seed) {
  const zeroCase = sequenceNumber % 2 === 0;
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const multiplicand = zeroCase ? 1023 : 2345 + (seedValue % 6000);
  const multiplier = zeroCase ? 8 : randomInt(seedValue, 2, 9);
  const product = multiplicand * multiplier;
  const productText = String(product);
  const target = zeroCase ? "multiplicand" : "product";
  const targetText = target === "multiplicand" ? String(multiplicand) : productText;
  let missingIndex = target === "multiplicand" ? 1 : targetText.split("").findIndex((digit, index) => digit !== "0" && index > 0);
  if (missingIndex < 0) missingIndex = targetText.length - 1;
  const missingDigit = Number(targetText[missingIndex]);
  const blankedMultiplicand = target === "multiplicand" ? maskDigit(multiplicand, missingIndex) : String(multiplicand);
  const blankedProduct = target === "product" ? maskDigit(product, missingIndex) : productText;
  const answerText = String(missingDigit);
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    multiplicand,
    multiplier,
    product,
    missingTarget: target,
    missingIndex,
    missingDigit,
    coverageCase: zeroCase ? "missing_digit_zero_answer" : "missing_digit_nonzero_answer",
    promptText: "在□中填入正確的數字。",
    displayText: `${multiplicand} × ${multiplier} = ${product}`,
    blankedDisplayText: `${blankedMultiplicand} × ${multiplier} = ${blankedProduct}`,
    answerText,
    finalAnswer: missingDigit,
    metadata: metadata(definition)
  };
}

function generateQuestion(patternSpecId, sequenceNumber, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) return null;
  if (definition.kind === "g4aU02MissingDigitMultiplication") return makeMissingDigitQuestion(definition, sequenceNumber, seed);
  if (definition.kind === "g4aU02VerticalMultiplication") return makeVerticalQuestion(definition, sequenceNumber, seed);
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
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) {
    return { ...basePlan, worksheetMode: "batchASource", selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], patternSpecIds: [...G4A_U02_NUMERIC_PATTERN_SPEC_IDS], allocation: null, resolverResult: null };
  }
  const resolverResult = resolveVisiblePatternGroupSelection({ ...options, sourceId, selectionMode, questionCount });
  return {
    ...basePlan,
    worksheetMode: resolverResult.worksheetMode ?? "batchAKnowledgePoint",
    selectionMode: resolverResult.selectionMode ?? selectionMode,
    selectedKnowledgePointIds: cloneValue(resolverResult.knowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(resolverResult.patternGroupIds ?? []),
    patternSpecIds: cloneValue((resolverResult.patternSpecIds ?? []).filter((id) => G4A_U02_NUMERIC_PATTERN_SPEC_IDS.includes(id))),
    allocation: cloneValue((resolverResult.allocation ?? []).filter((entry) => G4A_U02_NUMERIC_PATTERN_SPEC_IDS.includes(entry.patternSpecId))),
    resolverResult
  };
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const shuffled = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:g4a-u02-shuffle:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = randomInt(seedValue, 0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function canGenerateG4AU02NumericQuestions(optionsOrPlan = {}) {
  return optionsOrPlan?.sourceId === G4A_U02_SOURCE_ID;
}

export function generateG4AU02NumericQuestions(options = {}) {
  const plan = buildPlan(options);
  if (plan.sourceId !== G4A_U02_SOURCE_ID) {
    return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u02_source_mismatch", "sourceId", "G4A-U02 numeric generator received a non-G4A-U02 sourceId.")], warnings: [] };
  }
  if (plan.resolverResult && !plan.resolverResult.ok) {
    return { ok: false, plan, questions: [], allocation: [], errors: plan.resolverResult.errors ?? [], warnings: plan.resolverResult.warnings ?? [] };
  }
  if (plan.patternSpecIds.length === 0) {
    return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u02_no_numeric_pattern_selected", "patternSpecIds", "No implemented G4A-U02 numeric PatternSpec is selected.")], warnings: [] };
  }
  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? cloneValue(plan.allocation) : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  for (const entry of allocation) {
    for (let index = 0; index < entry.questionCount; index += 1) {
      const question = generateQuestion(entry.patternSpecId, questions.length + 1, `${plan.generationSeed}:${entry.patternSpecId}:${index + 1}`);
      if (!question) errors.push(issue("g4a_u02_question_generation_failed", entry.patternSpecId, `Failed to generate ${entry.patternSpecId}.`));
      else questions.push(question);
    }
  }
  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings: [] };
}
