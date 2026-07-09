import { getBatchASourceUnit } from "./source-units.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "./visible-pattern-group-resolver.js";
import {
  G4A_U08_PATTERN_SPEC_IDS,
  G4A_U08_SOURCE_ID,
  getBatchABrowserPatternDefinition
} from "./source-pattern-g4a-u08-extension.js";

const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

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

function tokensToExpression(tokens) {
  return tokens.join(" ").replace("( ", "(").replace(" )", ")");
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

function toRpn(tokens) {
  const output = [];
  const ops = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) {
      output.push(token);
    } else if (token === "(") {
      ops.push(token);
    } else if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") output.push(ops.pop());
      ops.pop();
    } else if (OPERATORS.has(token)) {
      while (ops.length > 0 && OPERATORS.has(ops[ops.length - 1]) && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) output.push(ops.pop());
      ops.push(token);
    }
  }
  while (ops.length > 0) output.push(ops.pop());
  return output;
}

function evaluateExpressionTokens(tokens) {
  const stack = [];
  const operations = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    let result;
    if (token === "+") result = left + right;
    else if (token === "-") result = left - right;
    else if (token === "×") result = left * right;
    else if (token === "÷") result = left / right;
    operations.push({ op: token, left, right, result });
    stack.push(result);
  }
  return { finalAnswer: stack[0], operations, intermediateResults: operations.map((operation) => operation.result) };
}

function makeByFamily(definition, sequenceNumber, seed) {
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const n = (offset, min, max) => randomInt(mix32(seedValue + offset + sequenceNumber * 37), min, max);
  switch (definition.expressionFamily) {
    case "parentheses_add_sub": {
      if (sequenceNumber % 2 === 0) {
        const a = n(1, 8, 30);
        const c = n(2, 2, 9);
        const b = c + n(3, 2, 12);
        return [a, "+", "(", b, "-", c, ")"];
      }
      const b = n(4, 3, 12);
      const c = n(5, 2, 10);
      const a = b + c + n(6, 8, 40);
      return [a, "-", "(", b, "+", c, ")"];
    }
    case "parentheses_mul_div": {
      if (sequenceNumber % 2 === 0) {
        const a = n(7, 3, 12);
        const c = n(8, 2, 6);
        const b = c * n(9, 2, 6);
        return [a, "×", "(", b, "÷", c, ")"];
      }
      const b = n(10, 2, 6);
      const c = n(11, 2, 5);
      const q = n(12, 2, 12);
      return [b * c * q, "÷", "(", b, "×", c, ")"];
    }
    case "mul_before_add_sub": {
      const b = n(13, 2, 9);
      const c = n(14, 2, 9);
      const a = n(15, 10, 60);
      const d = n(16, 1, Math.min(30, a + b * c));
      return [a, "+", b, "×", c, "-", d];
    }
    case "div_before_add_sub": {
      const divisor = n(17, 2, 9);
      const quotient = n(18, 2, 20);
      const dividend = divisor * quotient;
      const a = n(19, 10, 60);
      const d = n(20, 1, Math.min(30, a + quotient));
      return [a, "+", dividend, "÷", divisor, "-", d];
    }
    case "add_sub_left_to_right": {
      if (sequenceNumber % 2 === 0) {
        const b = n(21, 3, 20);
        const c = n(22, 2, 18);
        const a = b + c + n(23, 5, 40);
        return [a, "-", b, "-", c];
      }
      const b = n(24, 3, 25);
      const a = b + n(25, 5, 50);
      const c = n(26, 2, 30);
      return [a, "-", b, "+", c];
    }
    case "mul_div_left_to_right": {
      if (sequenceNumber % 2 === 0) {
        const a = n(27, 3, 12);
        const c = n(28, 2, 8);
        const k = n(29, 2, 5);
        return [a, "×", c * k, "÷", c];
      }
      const divisor = n(30, 2, 9);
      const q = n(31, 2, 12);
      const multiplier = n(32, 2, 8);
      return [divisor * q, "÷", divisor, "×", multiplier];
    }
    case "mixed_no_parentheses": {
      if (sequenceNumber % 2 === 0) {
        const b = n(33, 2, 9);
        const c = n(34, 2, 8);
        const a = n(35, 10, 70);
        const d = n(36, 1, Math.min(50, a + b * c));
        return [a, "+", b, "×", c, "-", d];
      }
      const divisor = n(37, 2, 9);
      const quotient = n(38, 2, 16);
      const e = n(39, 2, 6);
      const a = n(40, 10, 70);
      const d = n(41, 1, Math.min(50, a + quotient * e));
      return [a, "+", divisor * quotient, "÷", divisor, "×", e, "-", d];
    }
    case "mixed_with_parentheses": {
      if (sequenceNumber % 2 === 0) {
        const d = n(42, 2, 8);
        const c = d + n(43, 2, 8);
        const b = n(44, 2, 9);
        const a = n(45, 10, 70);
        return [a, "+", b, "×", "(", c, "-", d, ")"];
      }
      const diff = n(46, 2, 6);
      const d = n(47, 2, 8);
      const c = d + diff;
      const quotient = n(48, 2, 12);
      const b = diff * quotient;
      const e = n(49, 2, 6);
      const a = n(50, 10, 70);
      return [a, "+", b, "÷", "(", c, "-", d, ")", "×", e];
    }
    case "large_no_parentheses": {
      if (sequenceNumber % 2 === 0) {
        const largeA = n(51, 2000, 7000);
        const divisor = n(52, 2, 9);
        const quotient = n(53, 2, 40);
        const largeB = n(54, 100, Math.min(3000, largeA + quotient));
        return [largeA, "-", divisor * quotient, "÷", divisor, "+", largeB];
      }
      const largeA = n(55, 3000, 8000);
      const b = n(56, 2, 9);
      const c = n(57, 2, 9);
      const largeB = n(58, 100, Math.min(3000, largeA + b * c));
      return [largeA, "+", b, "×", c, "-", largeB];
    }
    case "large_with_parentheses": {
      if (sequenceNumber % 2 === 0) {
        const largeA = n(59, 2500, 9000);
        const a = n(60, 10, 80);
        const b = n(61, 10, 80);
        const c = n(62, 2, 9);
        const d = n(63, 2, 9);
        return [largeA, "-", "(", a, "+", b, ")", "+", c, "×", d];
      }
      const largeA = n(64, 2500, 8500);
      const e = n(65, 2, 8);
      const d = e + n(66, 2, 8);
      const c = n(67, 2, 9);
      const largeB = n(68, 100, 2500);
      return [largeA, "+", c, "×", "(", d, "-", e, ")", "-", largeB];
    }
    default:
      return [10, "+", 2, "×", 3];
  }
}

function makeExpressionQuestion(definition, sequenceNumber, seed) {
  const expressionTokens = makeByFamily(definition, sequenceNumber, seed);
  const expression = tokensToExpression(expressionTokens);
  const evaluated = evaluateExpressionTokens(expressionTokens);
  const finalAnswer = evaluated.finalAnswer;
  const answerText = String(finalAnswer);
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    expression,
    expressionTokens,
    finalAnswer,
    answerText,
    displayText: `${expression} = ${answerText}`,
    blankedDisplayText: `${expression} = ______`,
    promptText: `${expression} = ______`,
    operationOrderTrace: evaluated.operations.map((operation, index) => ({ step: index + 1, ...operation })),
    intermediateResults: evaluated.intermediateResults,
    coverageCase: definition.coverageCase,
    coreRule: definition.coreRule,
    ruleTags: [...definition.ruleTags],
    largeAddSubOverlay: definition.largeAddSubOverlay === true,
    hasParentheses: definition.hasParentheses === true,
    hasMulDiv: definition.hasMulDiv === true,
    requiresLeftToRight: definition.requiresLeftToRight === true,
    metadata: metadata(definition)
  };
}

function generateQuestion(patternSpecId, sequenceNumber, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition || definition.sourceId !== G4A_U08_SOURCE_ID) return null;
  return makeExpressionQuestion(definition, sequenceNumber, seed);
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
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) return { ...basePlan, worksheetMode: "batchASource", selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], patternSpecIds: [...G4A_U08_PATTERN_SPEC_IDS], allocation: null, resolverResult: null };
  const resolverResult = resolveVisiblePatternGroupSelection({ ...options, sourceId, selectionMode, questionCount });
  return {
    ...basePlan,
    worksheetMode: resolverResult.worksheetMode ?? "batchAKnowledgePoint",
    selectionMode: resolverResult.selectionMode ?? selectionMode,
    selectedKnowledgePointIds: cloneValue(resolverResult.knowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(resolverResult.patternGroupIds ?? []),
    patternSpecIds: cloneValue((resolverResult.patternSpecIds ?? []).filter((id) => G4A_U08_PATTERN_SPEC_IDS.includes(id))),
    allocation: cloneValue((resolverResult.allocation ?? []).filter((entry) => G4A_U08_PATTERN_SPEC_IDS.includes(entry.patternSpecId))),
    resolverResult
  };
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const shuffled = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:g4a-u08-shuffle:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function canGenerateG4AU08ExpressionQuestions(optionsOrPlan = {}) {
  return optionsOrPlan?.sourceId === G4A_U08_SOURCE_ID;
}

export function generateG4AU08ExpressionQuestions(options = {}) {
  const plan = buildPlan(options);
  if (plan.sourceId !== G4A_U08_SOURCE_ID) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u08_source_mismatch", "sourceId", "G4A-U08 generator received a non-G4A-U08 sourceId.")], warnings: [] };
  if (plan.resolverResult && !plan.resolverResult.ok) return { ok: false, plan, questions: [], allocation: [], errors: plan.resolverResult.errors ?? [], warnings: plan.resolverResult.warnings ?? [] };
  if (plan.patternSpecIds.length === 0) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u08_no_pattern_selected", "patternSpecIds", "No implemented G4A-U08 PatternSpec is selected.")], warnings: [] };
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
        errors.push(issue("g4a_u08_question_generation_failed", entry.patternSpecId, `Failed to generate ${entry.patternSpecId}.`));
        continue;
      }
      const promptKey = `${question.patternSpecId}:${question.blankedDisplayText}`;
      if (promptKeys.has(promptKey)) continue;
      promptKeys.add(promptKey);
      questions.push({ ...question, id: `${entry.patternSpecId}-${questions.length + 1}` });
      generatedForPattern += 1;
    }
    if (generatedForPattern < entry.questionCount) errors.push(issue("g4a_u08_unique_pool_exhausted", entry.patternSpecId, `${entry.patternSpecId} requires ${entry.questionCount} questions but generated ${generatedForPattern} unique prompts.`));
  }
  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings: [] };
}
