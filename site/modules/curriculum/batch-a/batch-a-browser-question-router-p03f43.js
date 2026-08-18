export * from "./batch-a-browser-question-router-p03f42.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f42.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f43.js";
import { canGenerateG4BU08P03F43Questions, generateG4BU08P03F43Questions } from "./g4b-u08-rank10-fraction-runtime-p03f43.js";
import { P03F43_SPEC_IDS } from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const isTarget = (id) => P03F43_SPEC_IDS.includes(id);

export function generateBatchABrowserQuestions(options = {}) {
  const plan = options.plan ?? buildBatchABrowserPlan(options);
  if (!plan.patternSpecIds?.some(isTarget)) return baseGenerate({ ...options, plan });
  if (canGenerateG4BU08P03F43Questions(plan)) return generateG4BU08P03F43Questions({ ...options, plan });

  const count = Number(options.questionCount ?? plan.questionCount ?? 24);
  if (!Number.isInteger(count) || count < 1 || count > 240) return { ok: false, errors: [issue("p03f43_question_count_invalid", "questionCount")], warnings: [], questions: [], allocation: [], plan };
  const sequence = plan.patternSpecIds;
  const counts = new Map(sequence.map((id) => [id, 0]));
  for (let index = 0; index < count; index += 1) {
    const id = sequence[index % sequence.length];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const seed = options.generationSeed ?? plan.generationSeed ?? "p03f43";
  const queues = new Map();
  for (const patternSpecId of sequence) {
    if (queues.has(patternSpecId)) continue;
    const questionCount = counts.get(patternSpecId) ?? 0;
    if (questionCount === 0) {
      queues.set(patternSpecId, []);
      continue;
    }
    const subPlan = { ...plan, patternSpecIds: [patternSpecId], questionCount };
    const generationSeed = `${seed}-${patternSpecId}`;
    const generated = isTarget(patternSpecId)
      ? generateG4BU08P03F43Questions({ ...options, generationSeed, questionCount, plan: subPlan })
      : baseGenerate({ ...options, generationSeed, questionCount, plan: subPlan });
    if (!generated.ok) return { ok: false, errors: generated.errors ?? [issue("p03f43_mixed_subgeneration_failed", patternSpecId)], warnings: [], questions: [], allocation: [], plan };
    if (generated.questions.length !== questionCount || generated.questions.some((question) => question.patternSpecId !== patternSpecId)) {
      return { ok: false, errors: [issue("p03f43_mixed_suballocation_mismatch", patternSpecId)], warnings: [], questions: [], allocation: [], plan };
    }
    queues.set(patternSpecId, [...generated.questions]);
  }

  const questions = [];
  for (let index = 0; index < count; index += 1) {
    const patternSpecId = sequence[index % sequence.length];
    const question = (queues.get(patternSpecId) ?? []).shift();
    if (!question) return { ok: false, errors: [issue("p03f43_mixed_allocation_underflow", `questions[${index}]`)], warnings: [], questions: [], allocation: [], plan };
    questions.push(question);
  }
  const allocation = [...new Set(sequence)].map((patternSpecId) => ({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze(allocation), plan });
}
