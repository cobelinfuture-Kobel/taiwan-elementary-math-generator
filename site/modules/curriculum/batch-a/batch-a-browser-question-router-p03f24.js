export * from "./batch-a-browser-question-router-p03f23.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f23.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f24.js";
import { canGenerateG3BU07P03F24Questions, generateG3BU07P03F24Questions } from "./fraction-context-runtime-p03f24.js";

const MAX_P03F24_DIVERSITY_ATTEMPTS = 8;
const P03F24_DIVERSITY_POOL_SIZE = 12;

function replacementPool(options, question, questionIndex, attempt) {
  const baseSeed = String(options.generationSeed ?? "p03f24");
  return generateG3BU07P03F24Questions({
    ...options,
    patternSpecIds: [question.patternSpecId],
    questionMode: question.questionMode,
    questionCount: P03F24_DIVERSITY_POOL_SIZE,
    generationSeed: `${baseSeed}|p03f24-dedupe-${questionIndex}-${attempt}`,
  });
}

function enforceUniqueP03F24Prompts(options, result) {
  if (!result.ok) return result;
  const seen = new Set();
  const questions = [];

  for (let index = 0; index < result.questions.length; index += 1) {
    const original = result.questions[index];
    if (!seen.has(original.blankedDisplayText)) {
      seen.add(original.blankedDisplayText);
      questions.push(original);
      continue;
    }

    let replacement = null;
    for (let attempt = 1; attempt <= MAX_P03F24_DIVERSITY_ATTEMPTS && !replacement; attempt += 1) {
      const pool = replacementPool(options, original, index, attempt);
      if (!pool.ok) continue;
      replacement = pool.questions.find((candidate) => !seen.has(candidate.blankedDisplayText)) ?? null;
    }

    if (!replacement) {
      return Object.freeze({
        ...result,
        ok: false,
        errors: Object.freeze([
          ...(result.errors ?? []),
          Object.freeze({
            code: "p03f24_prompt_diversity_exhausted",
            severity: "error",
            path: `questions[${index}]`,
            message: "p03f24_prompt_diversity_exhausted",
          }),
        ]),
      });
    }

    const accepted = Object.freeze({
      ...replacement,
      id: `${original.patternSpecId}-dedupe-${index + 1}`,
    });
    seen.add(accepted.blankedDisplayText);
    questions.push(accepted);
  }

  return Object.freeze({ ...result, questions: Object.freeze(questions) });
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU07P03F24Questions(plan)) return baseGenerate(options);
  return enforceUniqueP03F24Prompts(options, generateG3BU07P03F24Questions(options));
}
