import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  validateG4AU08AllCanonicalPublicSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { validateG4AU08AllCanonicalPublicQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";

const SOURCE_ID = "g4a_u08_4a08";

function optionsForGroup(group, questionCount = 1) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [group.primaryKnowledgePointId],
    selectedPatternGroupIds: [group.patternGroupId],
    questionMode: group.mode,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `s76q:${group.patternGroupId}`,
  };
}

test("S76R exposes exactly 15 visible canonical KnowledgePoints, 28 PatternGroups and 33 PatternSpecs", () => {
  const checked = validateG4AU08AllCanonicalPublicSelectorProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.equal(checked.counts.knowledgePoints, 15);
  assert.equal(checked.counts.patternGroups, 28);
  assert.equal(checked.counts.patternSpecs, 33);
  assert.equal(checked.counts.visibleKnowledgePoints, 15);
  assert.equal(checked.counts.legacyAliasKnowledgePoints, 8);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 15);
  assert.equal(availability.canonicalReachableKnowledgePointCount, 15);
  assert.equal(availability.publicSelectorStatus, "15_canonical_knowledge_points_visible");
  assert.equal(listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID).length, 15);
  assert.equal(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.length, 28);
  assert.equal(new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.patternGroupId)).size, 28);
});

test("S76R all canonical KnowledgePoints are visibly selectable and have explicit public group projections", () => {
  const kpIds = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId));
  assert.equal(kpIds.size, 15);
  for (const knowledgePointId of kpIds) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    assert.ok(row, knowledgePointId);
    assert.equal(row.sourceId, SOURCE_ID);
    assert.equal(row.visibilityStatus, "visible");
    assert.equal(row.selectorStatus, "visible");
    assert.equal(row.productionUse, "preview_only_pending_s76r");
    const canonicalGroups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.filter((group) => group.primaryKnowledgePointId === knowledgePointId);
    assert.ok(canonicalGroups.length >= 1, knowledgePointId);
    assert.equal(canonicalGroups.every((group) => group.visibilityStatus === "visible" && group.holdReason === null), true);
  }
});

test("S76Q generates and validates at least one public question for every canonical PatternGroup", () => {
  for (const group of G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS) {
    const result = generateBatchABrowserQuestions(optionsForGroup(group));
    assert.equal(result.ok, true, `${group.patternGroupId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 1, group.patternGroupId);
    const question = result.questions[0];
    assert.equal(question.resolvedPatternGroupId ?? question.patternGroupId, group.patternGroupId);
    assert.equal(group.patternSpecIds.includes(question.patternSpecId), true, `${group.patternGroupId}:${question.patternSpecId}`);
    assert.equal(validateG4AU08AllCanonicalPublicQuestion(question).ok, true, group.patternGroupId);
  }
});

test("S76Q mixed 28-group route allocates exact output and reaches every group", () => {
  const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...new Set(groups.map((row) => row.primaryKnowledgePointId))],
    selectedPatternGroupIds: groups.map((row) => row.patternGroupId),
    questionMode: "mixed",
    questionCount: 56,
    ordering: "groupedByPattern",
    generationSeed: "s76q:all-28-groups",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 56);
  assert.equal(result.allocation.reduce((sum, row) => sum + row.questionCount, 0), 56);
  assert.deepEqual(new Set(result.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), new Set(groups.map((row) => row.patternGroupId)));
  assert.equal(result.questions.every((row) => row.productionUse === "preview_only_pending_s76r"), true);
  assert.equal(result.questions.every((row) => row.worksheetReachability === "enabled"), true);
});

test("S76Q worksheet and answer key are reachable for all 28 canonical PatternGroups", () => {
  const groups = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...new Set(groups.map((row) => row.primaryKnowledgePointId))],
    selectedPatternGroupIds: groups.map((row) => row.patternGroupId),
    questionMode: "mixed",
    questionCount: 56,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s76q:worksheet-all-groups",
    title: "四上整數四則 canonical 全題組",
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 56);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 56);
  assert.equal(result.worksheetDocument.rendererBehaviorChanged, false);
  assert.deepEqual(new Set(result.worksheetDocument.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), new Set(groups.map((row) => row.patternGroupId)));
});

test("S76Q blocks unregistered PatternGroups and never falls back generically", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4a_u08_num_add_group_round"],
    selectedPatternGroupIds: ["pg_g4a_u08_unregistered"],
    questionCount: 1,
    generationSeed: "s76q:invalid",
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
});
