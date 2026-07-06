import { generateBatchABrowserQuestions as generateBaseG3AU06DivisionQuestions } from "./g3a-u06-division-generator.js";

const sourceIds = Object.freeze(["g3a_u06_3a06", "g3b_u01_3b01"]);

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function sortBucket(questions, plan) {
  return questions
    .map((question, index) => ({ question, index, key: hashSeed(`${plan.generationSeed}:${question.patternSpecId}:${question.id}:${index}`) }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.question);
}

function interleaveAcrossPatternSpecs(questions, plan, allocation) {
  if (!sourceIds.includes(plan?.sourceId) || plan.ordering !== "shuffleAcrossPatterns" || !Array.isArray(allocation) || allocation.length < 2) return questions;
  const buckets = new Map(allocation.map((entry) => [entry.patternSpecId, []]));
  for (const question of questions) buckets.get(question.patternSpecId)?.push(question);
  for (const [patternSpecId, bucket] of buckets.entries()) buckets.set(patternSpecId, sortBucket(bucket, plan));
  const patternOrder = allocation
    .map((entry, index) => ({ patternSpecId: entry.patternSpecId, index, key: hashSeed(`${plan.generationSeed}:${entry.patternSpecId}:${index}`) }))
    .sort((left, right) => left.key - right.key || left.index - right.index)
    .map((entry) => entry.patternSpecId);
  const output = [];
  let moved = true;
  while (moved) {
    moved = false;
    for (const patternSpecId of patternOrder) {
      const next = buckets.get(patternSpecId)?.shift();
      if (next) { output.push(next); moved = true; }
    }
  }
  return output;
}

export function generateBatchABrowserQuestions(options = {}) {
  const result = generateBaseG3AU06DivisionQuestions(options);
  if (!result.ok) return result;
  return { ...result, questions: interleaveAcrossPatternSpecs(result.questions, result.plan, result.allocation) };
}
