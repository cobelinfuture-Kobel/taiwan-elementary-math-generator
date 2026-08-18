import test from "node:test";
import assert from "node:assert/strict";

import { listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f43-extension.js";
import {
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_KP_IDS,
  P03F43_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f43.js";
import { validateG4BU08P03F43Question } from "../../site/modules/curriculum/batch-a/g4b-u08-rank10-fraction-runtime-p03f43.js";

const unique = (values) => [...new Set(values)];

test("P03F43 mixed G4B-U08 routing preserves legacy delegation and exact q043 target quotas", () => {
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID);
  const legacyRows = sourceRows.filter((row) => !P03F43_KP_IDS.includes(row.knowledgePointId));
  const legacySpecIds = unique(legacyRows.flatMap((row) => row.patternSpecIds ?? row.canonicalPatternSpecIds ?? []))
    .filter((id) => !P03F43_SPEC_IDS.includes(id) && !id.endsWith("_application"));

  assert.ok(legacySpecIds.length > 0, "G4B-U08 must retain pre-q043 numeric PatternSpecs for compatibility coverage");

  const patternSpecIds = [...legacySpecIds, ...P03F43_SPEC_IDS];
  const questionCount = 20;
  const expectedTargetCounts = new Map(P03F43_SPEC_IDS.map((id) => [id, 0]));
  for (let index = 0; index < questionCount; index += 1) {
    const id = patternSpecIds[index % patternSpecIds.length];
    if (expectedTargetCounts.has(id)) expectedTargetCounts.set(id, expectedTargetCounts.get(id) + 1);
  }

  const plan = {
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    questionMode: "numeric",
    questionCount,
    generationSeed: "p03f43-legacy-grouped-routing-regression",
    selectionMode: "mixedKnowledgePointsSameUnit",
    requestedKnowledgePointIds: sourceRows.map((row) => row.knowledgePointId),
    patternSpecIds,
    genericFallbackAllowed: false,
  };
  const result = generateBatchABrowserQuestions({
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    questionMode: "numeric",
    questionCount,
    generationSeed: plan.generationSeed,
    plan,
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, questionCount);

  let observedTargetCount = 0;
  for (const patternSpecId of P03F43_SPEC_IDS) {
    const targetQuestions = result.questions.filter((question) => question.patternSpecId === patternSpecId);
    assert.equal(targetQuestions.length, expectedTargetCounts.get(patternSpecId), `q043 quota drift: ${patternSpecId}`);
    for (const question of targetQuestions) assert.equal(validateG4BU08P03F43Question(question).ok, true);
    observedTargetCount += targetQuestions.length;
  }

  assert.equal(result.questions.length - observedTargetCount, questionCount - [...expectedTargetCounts.values()].reduce((sum, value) => sum + value, 0));
  assert.equal(result.questions.some((question) => P03F43_SPEC_IDS.includes(question.patternSpecId)), true);
  assert.equal(result.questions.some((question) => !P03F43_SPEC_IDS.includes(question.patternSpecId)), true);
});
