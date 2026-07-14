import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE,
  G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID,
  G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
  validateG4AU08FullSourceProductionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-full-source-production-promotion.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { validateG4AU08S76RProductionQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-s76r-production-validator.js";

const SOURCE_ID = "g4a_u08_4a08";
const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
const knowledgePointIds = [...new Set(groups.map((row) => row.primaryKnowledgePointId))];
const patternGroupIds = groups.map((row) => row.patternGroupId);
const patternSpecIds = [...new Set(groups.flatMap((row) => row.patternSpecIds))];

function fullSourceOptions(questionCount, seed, overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: knowledgePointIds,
    selectedPatternGroupIds: patternGroupIds,
    questionMode: "mixed",
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
    ...overrides,
  };
}

test("S76R production projection locks the complete 15/28/33 D0 authority surface", () => {
  const checked = validateG4AU08FullSourceProductionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, {
    knowledgePoints: 15,
    patternGroups: 28,
    patternSpecs: 33,
  });
  assert.equal(G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.status, "full_source_production_allowed");
  assert.equal(G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.htmlPdfStatus, "full_source_smoke_pass");
  assert.equal(G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.distanceAfter.startsWith("D0"), true);
  assert.equal(G4A_U08_FULL_SOURCE_PRODUCTION_LIFECYCLE.requiredNextGate, null);
  assert.equal(groups.length, 28);
  assert.equal(knowledgePointIds.length, 15);
  assert.equal(patternSpecIds.length, 33);
});

test("S76R count matrix generates exact validated output and preserves all 28 groups", () => {
  for (const questionCount of G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.publicCountMatrix) {
    const result = generateBatchABrowserQuestions(fullSourceOptions(questionCount, `s76r:matrix:${questionCount}`));
    assert.equal(result.ok, true, `${questionCount}:${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, questionCount);
    assert.equal(result.allocation.reduce((sum, row) => sum + row.questionCount, 0), questionCount);
    assert.deepEqual(
      new Set(result.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)),
      new Set(patternGroupIds),
    );
    assert.equal(result.questions.every((row) => row.productionUse === "preview_only_pending_s76r" || row.productionUse === "preview_only_pending_s76k"), true);
    assert.equal(result.questions.every((row) => validateG4AU08S76RProductionQuestion(row).ok), true);
  }
});

test("S76R 280-item worksheet is production allowed across all 15 KP, 28 groups and 33 PatternSpecs", () => {
  const result = buildBatchABrowserWorksheetDocument(fullSourceOptions(280, "s76r:worksheet:280"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 280);
  assert.equal(document.answerKeyItems.length, 280);
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.knowledgePointId)), new Set(knowledgePointIds));
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), new Set(patternGroupIds));
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.patternSpecId)), new Set(patternSpecIds));
  assert.equal(document.rendererBehaviorChanged, false);
  assert.equal(document.validationSummary.validatorVersion, "s76r-g4a-u08-production-v1");
  assert.equal(document.productionUse, "allowed");
  assert.equal(document.productionEligibility.ok, true);
  assert.equal(document.productionEligibility.productionUse, "allowed");
  assert.equal(document.promotionRegistryId, G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID);
  assert.equal(document.generatedQuestions.every((row) => row.productionUse === "allowed"), true);
  assert.equal(document.generatedQuestions.every((row) => row.promotionRegistryId === G4A_U08_FULL_SOURCE_PRODUCTION_PROMOTION_ID), true);
  assert.equal(document.generatedQuestions.every((row) => validateG4AU08S76RProductionQuestion(row).ok), true);
});

test("S76R mutation gate rejects a corrupted final answer for every canonical group", () => {
  let covered = 0;
  for (const group of groups) {
    const result = generateBatchABrowserQuestions({
      sourceId: SOURCE_ID,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [group.primaryKnowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionMode: group.mode,
      questionCount: 1,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s76r:mutation:${group.patternGroupId}`,
    });
    assert.equal(result.ok, true, group.patternGroupId);
    const mutated = structuredClone(result.questions[0]);
    mutated.finalAnswer += 1;
    const checked = validateG4AU08S76RProductionQuestion(mutated);
    assert.equal(checked.ok, false, group.patternGroupId);
    assert.equal(checked.errors.some((entry) => entry.code.includes("MISMATCH")), true, group.patternGroupId);
    covered += 1;
  }
  assert.equal(covered, G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.requiredMutationCoveredPatternGroupCount);
});

test("S76R blocks 1001 questions with zero canonical output", () => {
  const result = generateBatchABrowserQuestions(fullSourceOptions(1001, "s76r:boundary:1001"));
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
});
