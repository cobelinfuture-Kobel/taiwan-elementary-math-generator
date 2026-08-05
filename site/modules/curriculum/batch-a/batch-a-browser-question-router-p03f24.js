export * from "./batch-a-browser-question-router-p03f23.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f23.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f24.js";
import { canGenerateG3BU07P03F24Questions, generateG3BU07P03F24Questions } from "./fraction-context-runtime-p03f24.js";

const MAX_P03F24_DIVERSITY_ATTEMPTS = 16;

function hasUniquePrompts(result = {}) {
  const prompts = (result.questions ?? []).map((question) => question.blankedDisplayText);
  return prompts.length === new Set(prompts).size;
}

function retryOptions(options, attempt) {
  if (attempt === 0) return options;
  const baseSeed = String(options.generationSeed ?? "p03f24");
  return { ...options, generationSeed: `${baseSeed}|p03f24-dedupe-${attempt}` };
}

function generateUniqueP03F24Questions(options = {}) {
  let last = null;
  for (let attempt = 0; attempt < MAX_P03F24_DIVERSITY_ATTEMPTS; attempt += 1) {
    const result = generateG3BU07P03F24Questions(retryOptions(options, attempt));
    last = result;
    if (!result.ok || hasUniquePrompts(result)) return result;
  }
  return Object.freeze({
    ...last,
    ok: false,
    errors: Object.freeze([
      ...(last?.errors ?? []),
      Object.freeze({
        code: "p03f24_prompt_diversity_exhausted",
        severity: "error",
        path: "questions",
        message: "p03f24_prompt_diversity_exhausted",
      }),
    ]),
  });
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  return canGenerateG3BU07P03F24Questions(plan) ? generateUniqueP03F24Questions(options) : baseGenerate(options);
}
