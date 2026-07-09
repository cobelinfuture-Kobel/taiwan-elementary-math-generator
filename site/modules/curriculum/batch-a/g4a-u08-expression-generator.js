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
const LARGE_ADD_SUB_OVERLAY_PATTERN_SPEC_IDS = new Set([
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const LARGE_ADD_SUB_OVERLAY_RATE = 0.2;

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

function variant(sequenceNumber, count) {
  return (sequenceNumber - 1) % count;
}

function shaped(tokens, shapeVariant) {
  return { tokens, shapeVariant };
}

function makeByFamily(definition, sequenceNumber, seed) {
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const n = (offset, min, max) => randomInt(mix32(seedValue + offset + sequenceNumber * 37), min, max);
  switch (definition.expressionFamily) {
    case "parentheses_add_sub": {
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const b = n(1, 3, 12);
          const c = n(2, 2, 10);
          const a = b + c + n(3, 8, 40);
          return shaped([a, "-", "(", b, "+", c, ")"], "parentheses_add_sub_middle_subtract_sum");
        }
        case 1: {
          const c = n(4, 2, 9);
          const b = c + n(5, 2, 12);
          const a = n(6, 8, 40);
          return shaped([a, "+", "(", b, "-", c, ")"], "parentheses_add_sub_middle_add_difference");
        }
        case 2: {
          const a = n(7, 6, 24);
          const b = n(8, 4, 20);
          const c = n(9, 2, Math.min(18, a + b));
          return shaped(["(", a, "+", b, ")", "-", c], "parentheses_add_sub_leading_sum_minus");
        }
        default: {
          const b = n(10, 3, 15);
          const c = n(11, 2, 12);
          const a = n(12, 8, 35);
          const d = n(13, 1, Math.min(25, a + b + c));
          return shaped([a, "+", "(", b, "+", c, ")", "-", d], "parentheses_add_sub_middle_sum_then_subtract");
        }
      }
    }
    case "parentheses_mul_div": {
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const b = n(14, 2, 6);
          const c = n(15, 2, 5);
          const q = n(16, 2, 12);
          return shaped([b * c * q, "÷", "(", b, "×", c, ")"], "parentheses_mul_div_divide_by_product");
        }
        case 1: {
          const a = n(17, 3, 12);
          const c = n(18, 2, 6);
          const b = c * n(19, 2, 6);
          return shaped([a, "×", "(", b, "÷", c, ")"], "parentheses_mul_div_multiply_by_quotient");
        }
        case 2: {
          const c = n(20, 2, 6);
          const b = n(21, 2, 8);
          const k = n(22, 2, 9);
          const a = c * k;
          const d = n(23, 1, 30);
          return shaped(["(", a, "×", b, ")", "÷", c, "+", d], "parentheses_mul_div_leading_product_then_divide");
        }
        default: {
          const d = n(24, 2, 8);
          const c = d + n(25, 2, 8);
          const b = n(26, 2, 9);
          const a = n(27, 10, 50);
          return shaped([a, "+", b, "×", "(", c, "-", d, ")"], "parentheses_mul_div_factor_from_difference");
        }
      }
    }
    case "mul_before_add_sub": {
      const b = n(28, 2, 9);
      const c = n(29, 2, 9);
      const product = b * c;
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const a = n(30, 10, 60);
          const d = n(31, 1, Math.min(30, a + product));
          return shaped([a, "+", b, "×", c, "-", d], "mul_before_add_sub_middle_plus_then_minus");
        }
        case 1: {
          const a = product + n(32, 5, 45);
          const d = n(33, 1, 30);
          return shaped([a, "-", b, "×", c, "+", d], "mul_before_add_sub_middle_minus_then_plus");
        }
        case 2: {
          const a = n(34, 10, 60);
          const d = n(35, 1, Math.min(45, a + product));
          return shaped([b, "×", c, "+", a, "-", d], "mul_before_add_sub_leading_product");
        }
        default: {
          const d = n(36, product, product + 50);
          const a = n(37, 5, 50);
          return shaped([a, "+", d, "-", b, "×", c], "mul_before_add_sub_trailing_product");
        }
      }
    }
    case "div_before_add_sub": {
      const divisor = n(38, 2, 9);
      const quotient = n(39, 2, 20);
      const dividend = divisor * quotient;
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const a = n(40, 10, 60);
          const d = n(41, 1, Math.min(30, a + quotient));
          return shaped([a, "+", dividend, "÷", divisor, "-", d], "div_before_add_sub_middle_plus_then_minus");
        }
        case 1: {
          const a = quotient + n(42, 5, 45);
          const d = n(43, 1, 30);
          return shaped([a, "-", dividend, "÷", divisor, "+", d], "div_before_add_sub_middle_minus_then_plus");
        }
        case 2: {
          const a = n(44, 10, 60);
          const d = n(45, 1, Math.min(45, a + quotient));
          return shaped([dividend, "÷", divisor, "+", a, "-", d], "div_before_add_sub_leading_quotient");
        }
        default: {
          const d = n(46, quotient, quotient + 50);
          const a = n(47, 5, 50);
          return shaped([a, "+", d, "-", dividend, "÷", divisor], "div_before_add_sub_trailing_quotient");
        }
      }
    }
    case "add_sub_left_to_right": {
      switch (variant(sequenceNumber, 3)) {
        case 0: {
          const b = n(48, 3, 25);
          const a = b + n(49, 5, 50);
          const c = n(50, 2, 30);
          return shaped([a, "-", b, "+", c], "add_sub_ltr_subtract_then_add");
        }
        case 1: {
          const a = n(51, 10, 50);
          const b = n(52, 3, 30);
          const c = n(53, 2, Math.min(30, a + b));
          return shaped([a, "+", b, "-", c], "add_sub_ltr_add_then_subtract");
        }
        default: {
          const b = n(54, 3, 20);
          const c = n(55, 2, 18);
          const a = b + c + n(56, 5, 40);
          return shaped([a, "-", b, "-", c], "add_sub_ltr_two_subtractions");
        }
      }
    }
    case "mul_div_left_to_right": {
      switch (variant(sequenceNumber, 3)) {
        case 0: {
          const divisor = n(57, 2, 9);
          const q = n(58, 2, 12);
          const multiplier = n(59, 2, 8);
          return shaped([divisor * q, "÷", divisor, "×", multiplier], "mul_div_ltr_divide_then_multiply");
        }
        case 1: {
          const divisor = n(60, 2, 8);
          const k = n(61, 2, 8);
          const multiplier = n(62, 2, 8);
          return shaped([divisor * k, "×", multiplier, "÷", divisor], "mul_div_ltr_multiply_then_divide");
        }
        default: {
          const b = n(63, 2, 7);
          const c = n(64, 2, 6);
          const q = n(65, 2, 12);
          return shaped([b * c * q, "÷", b, "÷", c], "mul_div_ltr_two_divisions");
        }
      }
    }
    case "mixed_no_parentheses": {
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const b = n(66, 2, 9);
          const c = n(67, 2, 8);
          const e = n(68, 2, 9);
          const q = n(69, 2, 12);
          const d = e * q;
          const a = n(70, 10, 70);
          return shaped([a, "+", b, "×", c, "-", d, "÷", e], "mixed_no_parentheses_mul_then_div");
        }
        case 1: {
          const c = n(71, 2, 9);
          const q = n(72, 2, 14);
          const b = c * q;
          const d = n(73, 2, 8);
          const e = n(74, 2, 7);
          const a = q + n(75, 15, 70);
          return shaped([a, "-", b, "÷", c, "+", d, "×", e], "mixed_no_parentheses_div_then_mul");
        }
        case 2: {
          const b = n(76, 2, 9);
          const c = n(77, 2, 8);
          const e = n(78, 2, 9);
          const q = n(79, 2, 10);
          const d = e * q;
          const a = n(80, 10, 60);
          return shaped([b, "×", c, "+", a, "-", d, "÷", e], "mixed_no_parentheses_leading_mul");
        }
        default: {
          const divisor = n(81, 2, 9);
          const quotient = n(82, 2, 16);
          const e = n(83, 2, 6);
          const a = n(84, 10, 70);
          const d = n(85, 1, Math.min(50, a + quotient * e));
          return shaped([a, "+", divisor * quotient, "÷", divisor, "×", e, "-", d], "mixed_no_parentheses_ltr_mul_div_chain");
        }
      }
    }
    case "mixed_with_parentheses": {
      switch (variant(sequenceNumber, 5)) {
        case 0: {
          const d = n(86, 2, 8);
          const c = d + n(87, 2, 8);
          const b = n(88, 2, 9);
          const a = n(89, 10, 70);
          return shaped([a, "+", b, "×", "(", c, "-", d, ")"], "mixed_with_parentheses_middle_factor");
        }
        case 1: {
          const a = n(90, 6, 20);
          const b = n(91, 4, 15);
          const c = n(92, 2, 8);
          const d = n(93, 1, Math.min(40, (a + b) * c));
          return shaped(["(", a, "+", b, ")", "×", c, "-", d], "mixed_with_parentheses_leading_group");
        }
        case 2: {
          const c = n(94, 2, 8);
          const b = c + n(95, 2, 8);
          const d = n(96, 2, 8);
          const a = n(97, 10, 60);
          const e = n(98, 1, Math.min(40, a + (b - c) * d));
          return shaped([a, "+", "(", b, "-", c, ")", "×", d, "-", e], "mixed_with_parentheses_middle_group_then_mul");
        }
        case 3: {
          const d = n(99, 2, 8);
          const c = d + n(100, 2, 8);
          const b = n(101, 2, 8);
          const product = b * (c - d);
          const a = product + n(102, 10, 60);
          const e = n(103, 1, 30);
          return shaped([a, "-", b, "×", "(", c, "-", d, ")", "+", e], "mixed_with_parentheses_trailing_add_after_group");
        }
        default: {
          const diff = n(104, 2, 6);
          const d = n(105, 2, 8);
          const c = d + diff;
          const quotient = n(106, 2, 12);
          const b = diff * quotient;
          const e = n(107, 2, 6);
          const a = n(108, 10, 70);
          return shaped([a, "+", b, "÷", "(", c, "-", d, ")", "×", e], "mixed_with_parentheses_divide_by_group_then_mul");
        }
      }
    }
    case "large_no_parentheses": {
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const largeA = n(109, 3000, 8000);
          const b = n(110, 2, 9);
          const c = n(111, 2, 9);
          const largeB = n(112, 100, Math.min(3000, largeA + b * c));
          return shaped([largeA, "+", b, "×", c, "-", largeB], "large_no_parentheses_middle_mul");
        }
        case 1: {
          const largeA = n(113, 2000, 7000);
          const divisor = n(114, 2, 9);
          const quotient = n(115, 2, 40);
          const largeB = n(116, 100, Math.min(2500, 9999 - largeA + quotient));
          return shaped([largeA, "-", divisor * quotient, "÷", divisor, "+", largeB], "large_no_parentheses_middle_div");
        }
        case 2: {
          const largeA = n(117, 3000, 7000);
          const largeB = n(118, 800, 2400);
          const b = n(119, 2, 9);
          const c = n(120, 2, 9);
          return shaped([largeA, "+", largeB, "-", b, "×", c], "large_no_parentheses_trailing_mul");
        }
        default: {
          const largeB = n(121, 500, 2500);
          const divisor = n(122, 2, 9);
          const quotient = n(123, 2, 40);
          const largeA = largeB + quotient + n(124, 500, 6000);
          return shaped([largeA, "-", largeB, "+", divisor * quotient, "÷", divisor], "large_no_parentheses_trailing_div");
        }
      }
    }
    case "large_with_parentheses": {
      switch (variant(sequenceNumber, 4)) {
        case 0: {
          const largeA = n(125, 2500, 9000);
          const a = n(126, 10, 80);
          const b = n(127, 10, 80);
          const c = n(128, 2, 9);
          const d = n(129, 2, 9);
          return shaped([largeA, "-", "(", a, "+", b, ")", "+", c, "×", d], "large_with_parentheses_subtract_group_then_mul");
        }
        case 1: {
          const largeA = n(130, 2500, 8500);
          const e = n(131, 2, 8);
          const d = e + n(132, 2, 8);
          const c = n(133, 2, 9);
          const largeB = n(134, 100, Math.min(2500, largeA + c * (d - e)));
          return shaped([largeA, "+", c, "×", "(", d, "-", e, ")", "-", largeB], "large_with_parentheses_middle_group_mul");
        }
        case 2: {
          const a = n(135, 10, 50);
          const b = n(136, 10, 50);
          const c = n(137, 2, 5);
          const largeA = n(138, 2500, 6500);
          const largeB = n(139, 100, Math.min(2400, largeA + (a + b) * c));
          return shaped(["(", a, "+", b, ")", "×", c, "+", largeA, "-", largeB], "large_with_parentheses_leading_group_mul");
        }
        default: {
          const b = n(140, 10, 50);
          const a = b + n(141, 2, 20);
          const c = n(142, 2, 8);
          const largeA = n(143, 2500, 8500);
          const largeB = n(144, 100, Math.min(2500, largeA + (a - b) * c));
          return shaped([largeA, "+", "(", a, "-", b, ")", "×", c, "-", largeB], "large_with_parentheses_middle_group_difference");
        }
      }
    }
    default:
      return shaped([10, "+", 2, "×", 3], "fallback");
  }
}

function makeExpressionQuestion(definition, sequenceNumber, seed) {
  const { tokens: expressionTokens, shapeVariant } = makeByFamily(definition, sequenceNumber, seed);
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
    shapeVariant,
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

function spreadCounts(patternSpecIds, questionCount) {
  if (patternSpecIds.length === 0 || questionCount <= 0) return [];
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function allocateCounts(patternSpecIds, questionCount) {
  const overlaySpecIds = patternSpecIds.filter((id) => LARGE_ADD_SUB_OVERLAY_PATTERN_SPEC_IDS.has(id));
  const normalSpecIds = patternSpecIds.filter((id) => !LARGE_ADD_SUB_OVERLAY_PATTERN_SPEC_IDS.has(id));
  if (overlaySpecIds.length > 0 && normalSpecIds.length > 0 && questionCount >= patternSpecIds.length) {
    const minimumOverlay = overlaySpecIds.length;
    const maximumOverlay = questionCount - normalSpecIds.length;
    const targetOverlay = Math.round(questionCount * LARGE_ADD_SUB_OVERLAY_RATE);
    const overlayCount = Math.max(minimumOverlay, Math.min(maximumOverlay, targetOverlay));
    return [
      ...spreadCounts(normalSpecIds, questionCount - overlayCount),
      ...spreadCounts(overlaySpecIds, overlayCount)
    ];
  }
  return spreadCounts(patternSpecIds, questionCount);
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
  const allocation = allocateCounts(plan.patternSpecIds, plan.questionCount);
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
