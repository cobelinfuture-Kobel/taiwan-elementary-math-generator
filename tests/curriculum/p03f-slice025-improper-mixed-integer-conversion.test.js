import test from "node:test";
import assert from "node:assert/strict";

import {
  G4A_U06_P03F25_GROUP_ID,
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
  auditG4AU06P03F25SelectorProjection,
} from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F25PublicSelectorComposition,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f25-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  getBatchABrowserPatternDefinition,
  validateP03F25PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f25-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f25.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f25.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f25.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f25-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import { getCurrentPixelRegistrySnapshot, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";

const sourceId = G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID;
const makeOptions = (patternSpecIds = G4A_U06_P03F25_PATTERN_SPEC_IDS, questionCount = 18) => ({
  sourceId,
  selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID],
  selectedPatternGroupIds: [G4A_U06_P03F25_GROUP_ID],
  patternSpecIds,
  questionMode: "numeric",
  questionCount,
  generationSeed: "p03f25-focused",
  includeAnswerKey: true,
});

test("P03F25 selector adds exactly one G4A-U06 conversion KP without adding a source", () => {
  assert.deepEqual(auditG4AU06P03F25SelectorProjection().counts, { knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 });
  assert.equal(auditG4AU06P03F25SelectorProjection().ok, true);
  assert.equal(auditP03F25PublicSelectorComposition().ok, true);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(availability.visibleCount, 2);
  assert.equal(availability.hiddenPendingCount, 4);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 29);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 29);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 212);
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
  assert.deepEqual(new Set(sourceRows.map((row) => row.knowledgePointId)), new Set([
    G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    G4A_U06_P03F25_KP_ID,
  ]));
});

test("P03F25 preserves Slice017 classification identities and adds three conversion PatternSpecs", () => {
  assert.equal(validateP03F25PatternDefinitions().ok, true);
  assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(G4A_U06_FRACTION_CLASSIFICATION_KP_ID)[0].patternSpecIds, [...G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS]);
  assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(G4A_U06_P03F25_KP_ID)[0].patternSpecIds, [...G4A_U06_P03F25_PATTERN_SPEC_IDS]);
  for (const id of G4A_U06_P03F25_PATTERN_SPEC_IDS) {
    const definition = getBatchABrowserPatternDefinition(id);
    assert.equal(definition.knowledgePointId, G4A_U06_P03F25_KP_ID);
    assert.equal(definition.patternGroupId, G4A_U06_P03F25_GROUP_ID);
    assert.deepEqual(definition.requiredCapabilityIds, ["cap_fraction_domain_validator", "cap_fraction_number_system"]);
    assert.equal(definition.globalContextRequired, false);
    assert.equal(definition.requiredCapabilityIds.includes("cap_fraction_arithmetic"), false);
  }
});

test("P03F25 all three conversion directions generate deterministic valid witnesses", () => {
  for (const patternSpecId of G4A_U06_P03F25_PATTERN_SPEC_IDS) {
    const options = makeOptions([patternSpecId], 12);
    const plan = buildBatchABrowserPlan(options);
    assert.equal(validateBatchABrowserPlan(plan).ok, true);
    const generated = generateBatchABrowserQuestions(options);
    assert.equal(generated.ok, true, JSON.stringify(generated.errors));
    assert.equal(generated.questions.length, 12);
    assert.equal(validateBatchABrowserQuestions(generated.questions).ok, true);
    for (const question of generated.questions) {
      assert.equal(validateBatchABrowserQuestion(question).ok, true);
      assert.equal(question.metadata.knowledgePointId, G4A_U06_P03F25_KP_ID);
      assert.equal(question.metadata.patternGroupId, G4A_U06_P03F25_GROUP_ID);
      assert.equal(question.globalContextProduction, null);
      assert.equal(question.improperNumerator, question.whole * question.denominator + question.remainder);
      assert.ok(question.remainder >= 0 && question.remainder < question.denominator);
    }
  }
});

test("P03F25 conversion semantics cover improper-to-mixed-or-integer, mixed-to-improper and integer-to-improper", () => {
  const generated = generateBatchABrowserQuestions(makeOptions(G4A_U06_P03F25_PATTERN_SPEC_IDS, 30));
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  const byDirection = new Map();
  for (const question of generated.questions) {
    const rows = byDirection.get(question.conversionDirection) ?? [];
    rows.push(question);
    byDirection.set(question.conversionDirection, rows);
  }
  assert.equal(byDirection.size, 3);
  const improperRows = byDirection.get("improper_to_mixed_or_integer");
  assert.ok(improperRows.some((question) => question.remainder === 0));
  assert.ok(improperRows.some((question) => question.remainder > 0));
  for (const question of byDirection.get("mixed_to_improper_fraction")) assert.ok(question.remainder > 0);
  for (const question of byDirection.get("integer_to_improper_fraction")) assert.equal(question.remainder, 0);
});

test("P03F25 public binding exposes both G4A-U06 KPs while single conversion selection stays bounded", () => {
  const source = resolvePublicUiCapabilityBinding({ sourceId, surfaceId: "CLASSIC" });
  assert.equal(source.blocked, false);
  assert.equal(source.selectedKnowledgePointCount, 2);
  assert.equal(source.compatiblePatternGroupIds.includes(G4A_U06_P03F25_GROUP_ID), true);
  const single = resolvePublicUiCapabilityBinding({ sourceId, surfaceId: "PIXEL", selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID] });
  assert.equal(single.blocked, false);
  assert.deepEqual(single.selectedKnowledgePointIds, [G4A_U06_P03F25_KP_ID]);
  assert.deepEqual(single.compatiblePatternGroupIds, [G4A_U06_P03F25_GROUP_ID]);
  assert.equal(single.questionType, "numeric");
});

test("P03F25 shared worksheet produces printable questions and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument(makeOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 18);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 18);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.knowledgePointIds.includes(G4A_U06_P03F25_KP_ID), true);
});

test("P03F25 historical two-KP projection remains intact while current public total advances through Slice045 to 246", () => {
  const rows = listPixelKnowledgePointsForSource(sourceId);
  assert.equal(rows.length, 5);
  assert.equal(rows.some((row) => row.knowledgePointId === G4A_U06_P03F25_KP_ID), true);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 33);
  assert.equal(snapshot.visibleKnowledgePointCount, 246);
  assert.equal(snapshot.bySourceId[sourceId].visibleKnowledgePoints.length, 5);
});
