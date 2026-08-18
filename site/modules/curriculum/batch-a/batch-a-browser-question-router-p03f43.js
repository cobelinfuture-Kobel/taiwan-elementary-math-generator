export * from "./batch-a-browser-question-router-p03f42.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f42.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f43.js";
import { canGenerateG4BU08P03F43Questions, generateG4BU08P03F43Questions } from "./g4b-u08-rank10-fraction-runtime-p03f43.js";
import { P03F43_SPEC_IDS } from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const isTarget = (id) => P03F43_SPEC_IDS.includes(id);
const unique = (values) => [...new Set(values)];

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
  const targetSpecs = unique(sequence.filter(isTarget));
  const priorSpecs = unique(sequence.filter((id) => !isTarget(id)));
  const targetQueues = new Map();
  let targetCount = 0;

  // Slice043 owns exact quotas only for its three new numeric PatternSpecs.
  // Generate those specs independently so their round-robin slots remain exact.
  for (const patternSpecId of targetSpecs) {
    const questionCount = counts.get(patternSpecId) ?? 0;
    targetCount += questionCount;
    if (questionCount === 0) {
      targetQueues.set(patternSpecId, []);
      continue;
    }
    const subPlan = { ...plan, patternSpecIds: [patternSpecId], questionCount };
    const generated = generateG4BU08P03F43Questions({
      ...options,
      generationSeed: `${seed}-${patternSpecId}`,
      questionCount,
      plan: subPlan,
    });
    if (!generated.ok) return { ok: false, errors: generated.errors ?? [issue("p03f43_mixed_subgeneration_failed", patternSpecId)], warnings: [], questions: [], allocation: [], plan };
    if (generated.questions.length !== questionCount || generated.questions.some((question) => question.patternSpecId !== patternSpecId)) {
      return { ok: false, errors: [issue("p03f43_mixed_suballocation_mismatch", patternSpecId)], warnings: [], questions: [], allocation: [], plan };
    }
    targetQueues.set(patternSpecId, [...generated.questions]);
  }

  // Pre-Slice043 routers own their own allocation contracts. Delegate all legacy
  // specs together; forcing singleton delegation changes the historical router
  // semantics and causes valid legacy routes to report a different spec id.
  const priorCount = count - targetCount;
  let priorQuestions = [];
  if (priorCount > 0) {
    if (priorSpecs.length === 0) return { ok: false, errors: [issue("p03f43_mixed_prior_specs_missing", "patternSpecIds")], warnings: [], questions: [], allocation: [], plan };
    const prior = baseGenerate({
      ...options,
      generationSeed: `${seed}-prior`,
      questionCount: priorCount,
      plan: { ...plan, patternSpecIds: priorSpecs, questionCount: priorCount },
    });
    if (!prior.ok) return { ok: false, errors: prior.errors ?? [issue("p03f43_mixed_prior_generation_failed", "patternSpecIds")], warnings: [], questions: [], allocation: [], plan };
    if (prior.questions.length !== priorCount || prior.questions.some((question) => isTarget(question.patternSpecId))) {
      return { ok: false, errors: [issue("p03f43_mixed_prior_allocation_mismatch", "patternSpecIds")], warnings: [], questions: [], allocation: [], plan };
    }
    priorQuestions = [...prior.questions];
  }

  const questions = [];
  for (let index = 0; index < count; index += 1) {
    const plannedPatternSpecId = sequence[index % sequence.length];
    const question = isTarget(plannedPatternSpecId)
      ? (targetQueues.get(plannedPatternSpecId) ?? []).shift()
      : priorQuestions.shift();
    if (!question) return { ok: false, errors: [issue("p03f43_mixed_allocation_underflow", `questions[${index}]`)], warnings: [], questions: [], allocation: [], plan };
    questions.push(question);
  }

  if (priorQuestions.length !== 0 || [...targetQueues.values()].some((queue) => queue.length !== 0)) {
    return { ok: false, errors: [issue("p03f43_mixed_allocation_overflow", "questions")], warnings: [], questions: [], allocation: [], plan };
  }

  const allocation = unique(questions.map((question) => question.patternSpecId)).map((patternSpecId) => ({
    patternSpecId,
    questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length,
  }));
  return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze(allocation), plan });
}
