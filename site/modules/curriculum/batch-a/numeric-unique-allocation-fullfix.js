const NUMERIC_LIKE_MODES = new Set(["numeric", "concept", "operation_estimation"]);
const HARD_CEILING = 20;
const MAX_WINDOWS = 96;

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "pgc-r04")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}

function promptText(question) {
  return String(
    question?.blankedDisplayText
      ?? question?.promptText
      ?? question?.prompt
      ?? question?.questionText
      ?? question?.displayText
      ?? "",
  ).replace(/\s+/g, " ").trim();
}

function expressionKey(node) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "value") {
    const raw = node.value?.value ?? node.value?.integer ?? node.value;
    return `v:${String(raw)}`;
  }
  if (node.type === "binary") {
    return `b:${String(node.operator)}(${expressionKey(node.left)},${expressionKey(node.right)})`;
  }
  return JSON.stringify(node);
}

function questionKey(question) {
  const visiblePrompt = promptText(question);
  if (visiblePrompt) return `prompt:${visiblePrompt}`;
  if (question?.duplicateKey != null && String(question.duplicateKey).length > 0) {
    return `duplicate:${String(question.duplicateKey)}`;
  }
  const expression = expressionKey(question?.expression);
  if (expression) return `expression:${expression}`;
  const patternSpecId = question?.patternSpecId ?? question?.metadata?.patternId ?? "unknown";
  const id = question?.id ?? question?.questionId ?? "";
  return id ? `identity:${patternSpecId}:${id}` : "";
}

function uniqueQuestions(questions = []) {
  const seen = new Set();
  const output = [];
  for (const question of questions) {
    const key = questionKey(question);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(question);
  }
  return output;
}

function isNumericLike(options = {}, result = null) {
  const mode = options.questionMode ?? result?.plan?.questionMode ?? result?.questions?.[0]?.questionMode ?? null;
  return NUMERIC_LIKE_MODES.has(mode);
}

function allocationFromQuestions(questions = [], priorAllocation = []) {
  const priorByPattern = new Map((priorAllocation ?? []).map((row) => [row.patternSpecId, row]));
  const counts = new Map();
  for (const question of questions) {
    const patternSpecId = question?.patternSpecId ?? question?.metadata?.patternId;
    if (!patternSpecId) continue;
    counts.set(patternSpecId, (counts.get(patternSpecId) ?? 0) + 1);
  }
  return [...counts.entries()].map(([patternSpecId, questionCount]) => {
    const prior = priorByPattern.get(patternSpecId);
    return prior?.patternGroupId
      ? { patternSpecId, patternGroupId: prior.patternGroupId, questionCount }
      : { patternSpecId, questionCount };
  });
}

function deterministicOrder(questions, seed) {
  return questions
    .map((question, index) => ({
      question,
      index,
      key: hashSeed(`${seed}:${questionKey(question)}:${question?.patternSpecId ?? "unknown"}`),
    }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.question);
}

function normalizedQuestions(questions, seed, targetCount) {
  return deterministicOrder(uniqueQuestions(questions), seed)
    .slice(0, targetCount)
    .map((question, index) => ({
      ...question,
      id: `${question?.patternSpecId ?? question?.metadata?.patternId ?? "numeric"}-pgc-r04-${index + 1}`,
    }));
}

function successfulUniqueResult(result, targetCount) {
  return result?.ok === true
    && Array.isArray(result.questions)
    && result.questions.length === targetCount
    && uniqueQuestions(result.questions).length === targetCount;
}

function callGenerator(generateOnce, options) {
  try {
    return generateOnce(options);
  } catch (error) {
    return {
      ok: false,
      plan: null,
      questions: [],
      allocation: [],
      errors: [{
        code: "PGC_R04_NUMERIC_GENERATOR_THROWN",
        severity: "error",
        path: "generator",
        message: String(error?.stack ?? error),
      }],
      warnings: [],
    };
  }
}

function candidateBatchSize(generateOnce, options, targetCount) {
  for (let count = Math.min(HARD_CEILING, targetCount); count >= 1; count -= 1) {
    const result = callGenerator(generateOnce, {
      ...options,
      questionCount: count,
      generationSeed: `${options.generationSeed ?? "default"}:pgc-r04-probe:${count}`,
    });
    if (result?.ok === true && Array.isArray(result.questions) && result.questions.length > 0) {
      return { count, result };
    }
  }
  return null;
}

function failureResult(initial, options, targetCount, collectedCount, attempts) {
  return {
    ...(initial ?? {}),
    ok: false,
    questions: [],
    allocation: [],
    errors: [
      ...(initial?.errors ?? []),
      {
        code: "PGC_R04_NUMERIC_UNIQUE_CAPACITY_EXHAUSTED",
        severity: "error",
        path: "questions",
        message: `Existing numeric generators produced ${collectedCount} unique prompts for a ${targetCount}-question request after ${attempts} deterministic windows.`,
      },
    ],
    warnings: [...(initial?.warnings ?? [])],
    pgcR04NumericFullFix: {
      applied: true,
      status: "FAIL_CLOSED_UNIQUE_CAPACITY_EXHAUSTED",
      targetQuestionCount: targetCount,
      collectedUniqueQuestionCount: collectedCount,
      deterministicWindowCount: attempts,
      secondGeneratorAdded: false,
      existingGeneratorConsumerOnly: true,
      generationSeed: options.generationSeed ?? null,
    },
  };
}

export function applyPgcR04NumericUniqueAllocation(generateOnce, options = {}) {
  const targetCount = Number.isInteger(options.questionCount) ? options.questionCount : 0;
  const initial = callGenerator(generateOnce, options);
  if (!isNumericLike(options, initial) || targetCount <= 0 || targetCount > HARD_CEILING) return initial;

  if (successfulUniqueResult(initial, targetCount)) {
    return {
      ...initial,
      pgcR04NumericFullFix: {
        applied: true,
        status: "EXISTING_GENERATOR_ALREADY_UNIQUE",
        targetQuestionCount: targetCount,
        collectedUniqueQuestionCount: targetCount,
        deterministicWindowCount: 1,
        secondGeneratorAdded: false,
        existingGeneratorConsumerOnly: true,
        generationSeed: options.generationSeed ?? null,
      },
    };
  }

  const probe = candidateBatchSize(generateOnce, options, targetCount);
  if (!probe) return failureResult(initial, options, targetCount, 0, 0);

  const collected = [];
  const warnings = [];
  let lastSuccessful = probe.result;
  const baseSeed = options.generationSeed ?? "default";
  for (let window = 0; window < MAX_WINDOWS && uniqueQuestions(collected).length < targetCount; window += 1) {
    const result = window === 0
      ? probe.result
      : callGenerator(generateOnce, {
        ...options,
        questionCount: probe.count,
        generationSeed: `${baseSeed}:pgc-r04-window:${window}`,
      });
    warnings.push(...(result?.warnings ?? []));
    if (result?.ok !== true || !Array.isArray(result.questions)) continue;
    lastSuccessful = result;
    collected.push(...result.questions);
  }

  const questions = normalizedQuestions(collected, `${baseSeed}:pgc-r04-final`, targetCount);
  if (questions.length !== targetCount) {
    return failureResult(initial, options, targetCount, questions.length, MAX_WINDOWS);
  }

  return {
    ...lastSuccessful,
    ok: true,
    plan: {
      ...(lastSuccessful?.plan ?? initial?.plan ?? {}),
      questionCount: targetCount,
      generationSeed: baseSeed,
    },
    questions,
    allocation: allocationFromQuestions(questions, lastSuccessful?.allocation ?? initial?.allocation ?? []),
    errors: [],
    warnings,
    pgcR04NumericFullFix: {
      applied: true,
      status: "PASS_SHARED_DETERMINISTIC_UNIQUE_ALLOCATION",
      targetQuestionCount: targetCount,
      collectedUniqueQuestionCount: questions.length,
      deterministicWindowCount: Math.ceil(collected.length / Math.max(1, probe.count)),
      sourceBatchQuestionCount: probe.count,
      secondGeneratorAdded: false,
      existingGeneratorConsumerOnly: true,
      generationSeed: baseSeed,
    },
  };
}
