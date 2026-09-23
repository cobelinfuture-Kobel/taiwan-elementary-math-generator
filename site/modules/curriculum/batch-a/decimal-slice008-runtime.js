import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f8.js";
import {
  generateG3BU09DecimalComposeDecomposeQuestions,
  validateG3BU09DecimalComposeDecomposeQuestion,
} from "./decimal-compose-decompose-runtime.js";
import {
  generateG3BU09DecimalReadWriteQuestions,
  validateG3BU09DecimalReadWriteQuestion,
} from "./decimal-read-write-runtime.js";
import { G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, G3B_U09_SOURCE_ID } from "../registry/g3b-u09-decimal-compose-decompose-selector-projection.js";
import { G3B_U09_DECIMAL_READ_WRITE_KP_ID, G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID, G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID } from "../registry/g3b-u09-decimal-read-write-selector-projection.js";

const IDS = new Set([G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID]);
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
export function canGenerateP03F8DecimalSliceQuestions(plan = {}) {
  return plan.sourceId === G3B_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length >= 1
    && plan.patternSpecIds.length <= 2
    && plan.patternSpecIds.every((id) => IDS.has(id));
}
export function validateP03F8DecimalSliceQuestion(question = {}) {
  return patternId(question) === G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID
    ? validateG3BU09DecimalReadWriteQuestion(question)
    : validateG3BU09DecimalComposeDecomposeQuestion(question);
}
export function generateP03F8DecimalSliceQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateP03F8DecimalSliceQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f8_plan_not_supported", severity: "error", path: "plan", message: "Slice008 accepts only its two admitted decimal PatternSpecs." }], warnings: [] };
  const readWrite = plan.patternSpecIds.includes(G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID);
  const compose = plan.patternSpecIds.includes(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID);
  const readCount = readWrite && compose ? Math.floor(plan.questionCount / 2) : readWrite ? plan.questionCount : 0;
  const composeCount = compose ? plan.questionCount - readCount : 0;
  const readResult = readCount > 0 ? generateG3BU09DecimalReadWriteQuestions({ questionCount: readCount, generationSeed: `${plan.generationSeed}-read-write` }) : { ok: true, questions: [], allocation: [], errors: [], warnings: [] };
  const composeOptions = { ...options, selectedKnowledgePointIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID], selectedPatternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID], questionCount: composeCount, generationSeed: `${plan.generationSeed}-compose` };
  const composeResult = composeCount > 0 ? generateG3BU09DecimalComposeDecomposeQuestions(composeOptions) : { ok: true, questions: [], allocation: [], errors: [], warnings: [] };
  const questions = [...readResult.questions, ...composeResult.questions];
  const errors = [...readResult.errors, ...composeResult.errors];
  for (const question of questions) errors.push(...validateP03F8DecimalSliceQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f8_duplicate_prompt_detected", severity: "error", path: "questions", message: "The combined worksheet contains duplicate prompts." });
  const allocation = [];
  if (readCount > 0) allocation.push({ patternSpecId: G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID, questionCount: readCount });
  if (composeCount > 0) allocation.push({ patternSpecId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, questionCount: composeCount });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation, errors, warnings: [...readResult.warnings, ...composeResult.warnings], requestedKnowledgePointIds: [readWrite ? G3B_U09_DECIMAL_READ_WRITE_KP_ID : null, compose ? G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID : null].filter(Boolean), requestedPatternGroupIds: [readWrite ? G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID : null, compose ? G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID : null].filter(Boolean) };
}
