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
  const priorSpecs = sequence.filter((id) => !isTarget(id));
  const targetSpecs = sequence.filter(isTarget);
  if (!priorSpecs.length) return generateG4BU08P03F43Questions({ ...options, plan: { ...plan, patternSpecIds: targetSpecs } });

  const counts = new Map(sequence.map((id) => [id, 0]));
  for (let index = 0; index < count; index += 1) {
    const id = sequence[index % sequence.length];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const targetCount = targetSpecs.reduce((sum, id) => sum + (counts.get(id) ?? 0), 0);
  const priorCount = count - targetCount;
  const seed = options.generationSeed ?? plan.generationSeed ?? "p03f43";
  const prior = baseGenerate({ ...options, generationSeed: `${seed}-prior`, questionCount: priorCount, plan: { ...plan, patternSpecIds: priorSpecs, questionCount: priorCount } });
  const target = generateG4BU08P03F43Questions({ ...options, generationSeed: `${seed}-q043`, questionCount: targetCount, plan: { ...plan, patternSpecIds: targetSpecs, questionCount: targetCount } });
  if (!prior.ok || !target.ok) return { ok: false, errors: [...(prior.errors ?? []), ...(target.errors ?? [])], warnings: [], questions: [], allocation: [], plan };

  const queues = new Map();
  for (const question of [...prior.questions, ...target.questions]) {
    const queue = queues.get(question.patternSpecId) ?? [];
    queue.push(question);
    queues.set(question.patternSpecId, queue);
  }
  const questions = [];
  for (let index = 0; index < count; index += 1) {
    const id = sequence[index % sequence.length];
    const question = (queues.get(id) ?? []).shift();
    if (!question) return { ok: false, errors: [issue("p03f43_mixed_allocation_underflow", `questions[${index}]`)], warnings: [], questions: [], allocation: [], plan };
    questions.push(question);
  }
  const allocation = sequence.map((patternSpecId) => ({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze(allocation), plan });
}
