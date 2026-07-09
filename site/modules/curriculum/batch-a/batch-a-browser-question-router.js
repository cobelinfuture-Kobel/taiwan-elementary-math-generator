import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions as generateDefaultBatchABrowserQuestions } from "./g3a-u06-division-ordering-generator.js";
import { generateG3AU02OutputQualityQuestions, isG3AU02OutputQualityPlan } from "./g3a-u02-output-quality-generator.js";
import { canGenerateG4AU01Phase1Questions, generateBatchABrowserQuestions as generateG4AU01Phase1Questions } from "./g4a-u01-phase3-runtime-fix-generator.js";
import { canGenerateG4AU02NumericQuestions, generateG4AU02NumericQuestions } from "./g4a-u02-numeric-generator.js";
import { canGenerateG4AU04DivisionQuestions, generateG4AU04DivisionQuestions } from "./g4a-u04-division-generator.js";
import { canGenerateG4AU08ApplicationQuestions, generateG4AU08ApplicationQuestions } from "./g4a-u08-application-generator.js";
import { canGenerateG4AU08ExpressionQuestions, generateG4AU08ExpressionQuestions } from "./g4a-u08-expression-generator.js";
import { G4A_U08_PATTERN_SPEC_IDS } from "./source-pattern-g4a-u08-extension.js";
import { G4A_U08_SOURCE_ID, isG4AU08Phase2APatternSpecId } from "./source-pattern-g4a-u08-phase2a-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";

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

function shuffleQuestions(questions, seed) {
  const shuffled = [...questions];
  let seedValue = hashSeed(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function isG4AU08NumericPatternSpecId(patternSpecId) {
  return G4A_U08_PATTERN_SPEC_IDS.includes(patternSpecId);
}

function groupIdsForKps(kpIds = []) {
  const pairs = [];
  for (const knowledgePointId of kpIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) pairs.push({ knowledgePointId, patternGroupId: group.patternGroupId });
  }
  return pairs;
}

function filterOptionsForPatternKind(options, plan, predicate, questionCount) {
  const allocation = (plan.allocation ?? []).filter((entry) => predicate(entry.patternSpecId));
  const groupIdSet = new Set(allocation.map((entry) => entry.patternGroupId));
  const kpIds = groupIdsForKps(plan.selectedKnowledgePointIds ?? options.selectedKnowledgePointIds ?? [])
    .filter((pair) => groupIdSet.has(pair.patternGroupId))
    .map((pair) => pair.knowledgePointId);
  return {
    ...options,
    questionCount,
    selectedKnowledgePointIds: [...new Set(kpIds)],
    selectedPatternGroupIds: [...groupIdSet]
  };
}

function isG4AU08HybridPlan(plan = {}) {
  if (plan.sourceId !== G4A_U08_SOURCE_ID || !Array.isArray(plan.allocation)) return false;
  const hasApplication = plan.allocation.some((entry) => isG4AU08Phase2APatternSpecId(entry.patternSpecId));
  const hasNumeric = plan.allocation.some((entry) => isG4AU08NumericPatternSpecId(entry.patternSpecId));
  return hasApplication && hasNumeric;
}

function generateG4AU08HybridQuestions(options, plan) {
  const numericCount = plan.allocation.filter((entry) => isG4AU08NumericPatternSpecId(entry.patternSpecId)).reduce((sum, entry) => sum + entry.questionCount, 0);
  const applicationCount = plan.allocation.filter((entry) => isG4AU08Phase2APatternSpecId(entry.patternSpecId)).reduce((sum, entry) => sum + entry.questionCount, 0);
  const numeric = generateG4AU08ExpressionQuestions(filterOptionsForPatternKind(options, plan, isG4AU08NumericPatternSpecId, numericCount));
  const application = generateG4AU08ApplicationQuestions(filterOptionsForPatternKind(options, plan, isG4AU08Phase2APatternSpecId, applicationCount));
  const errors = [...(numeric.errors ?? []), ...(application.errors ?? [])];
  const warnings = [...(numeric.warnings ?? []), ...(application.warnings ?? [])];
  const questions = [...(numeric.questions ?? []), ...(application.questions ?? [])].map((question, index) => ({ ...question, id: `${question.patternSpecId}-${index + 1}` }));
  const orderedQuestions = plan.ordering === "shuffleAcrossPatterns"
    ? shuffleQuestions(questions, `${plan.generationSeed}:g4a-u08-hybrid:${plan.questionCount}`)
    : questions;
  return {
    ok: numeric.ok === true && application.ok === true && errors.length === 0,
    plan,
    questions: orderedQuestions,
    allocation: [...(numeric.allocation ?? []), ...(application.allocation ?? [])],
    errors,
    warnings
  };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (isG3AU02OutputQualityPlan(plan)) return generateG3AU02OutputQualityQuestions(options);
  if (canGenerateG4AU01Phase1Questions(plan)) return generateG4AU01Phase1Questions(options);
  if (canGenerateG4AU02NumericQuestions(options)) return generateG4AU02NumericQuestions(options);
  if (canGenerateG4AU04DivisionQuestions(options)) return generateG4AU04DivisionQuestions(options);
  if (isG4AU08HybridPlan(plan)) return generateG4AU08HybridQuestions(options, plan);
  if (canGenerateG4AU08ApplicationQuestions(plan)) return generateG4AU08ApplicationQuestions(options);
  if (canGenerateG4AU08ExpressionQuestions(options)) return generateG4AU08ExpressionQuestions(options);
  return generateDefaultBatchABrowserQuestions(options);
}
