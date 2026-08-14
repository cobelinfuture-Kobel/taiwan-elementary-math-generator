import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F19PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f19-extension.js";
import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_TWO_DECIMAL_KP_ID,
  G4B_U06_RATE_TOTAL_KP_ID,
  G4B_U06_RATE_NUMERIC_GROUP_ID,
  G4B_U06_RATE_APPLICATION_GROUP_ID,
  G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID,
  G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID,
  G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID,
} from "../../site/modules/curriculum/registry/g4b-u06-two-decimal-rate-selector-projection.js";
import { validateP03F19PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f19-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f19.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f19.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f19.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { getCurrentPixelRegistrySnapshot, getCurrentPixelSourceSummary } from "../../site/pixel/pixel-registry-bridge.js";

const options = (mode, groupId) => ({
  sourceId: G4B_U06_SLICE019_SOURCE_ID,
  selectedKnowledgePointIds: [G4B_U06_RATE_TOTAL_KP_ID],
  selectedPatternGroupIds: [groupId],
  questionMode: mode,
  questionCount: 20,
  generationSeed: `p03f19-current-${mode}`,
  includeAnswerKey: true,
});

test("P03F19 current Classic selector exposes two successors and settles G4B-U06 availability", () => {
  const audit = auditP03F19PublicSelectorComposition();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.deepEqual(audit.counts, { addedKnowledgePoints: 2, visibleForSource: 3, hiddenForSource: 3 });
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G4B_U06_SLICE019_SOURCE_ID].visibleCount, 3);
  assert.ok(getVisibleBatchAKnowledgePoint(G4B_U06_TWO_DECIMAL_KP_ID));
  assert.ok(getVisibleBatchAKnowledgePoint(G4B_U06_RATE_TOTAL_KP_ID));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G4B_U06_RATE_TOTAL_KP_ID, "numeric"), [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID, G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G4B_U06_RATE_TOTAL_KP_ID, "application"), [G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID, G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID]);
});

test("P03F19 current pattern definitions preserve six-spec shared capability and context boundary", () => {
  const audit = validateP03F19PatternDefinitions();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.patternSpecCount, 6);
});

test("P03F19 current numeric consumer balances both rate specs through shared plan generator and validator", () => {
  const selected = options("numeric", G4B_U06_RATE_NUMERIC_GROUP_ID);
  const plan = buildBatchABrowserPlan(selected);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.deepEqual(plan.patternSpecIds, [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID, G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID]);
  const generated = generateBatchABrowserQuestions(selected);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 20);
  assert.deepEqual(generated.allocation.map((row) => row.questionCount), [10, 10]);
  assert.equal(new Set(generated.questions.map((row) => row.blankedDisplayText)).size, 20);
  assert.equal(validateBatchABrowserQuestions(generated.questions).ok, true);
});

test("P03F19 current application consumer uses existing contexts and shared worksheet renderer entry", () => {
  const result = buildBatchABrowserWorksheetDocument(options("application", G4B_U06_RATE_APPLICATION_GROUP_ID));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 20);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 20);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
  assert.equal(result.worksheetDocument.metadata.existingContextCandidateConsumption, true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.parallelPipeline, false);
  assert.deepEqual(result.generation.allocation.map((row) => row.questionCount), [10, 10]);
  assert.ok(result.generation.questions.every((row) => row.metadata.contextAuthority));
});

test("P03F19 historical selector authority remains 3 visible while current Pixel advances G4B-U06 through Slice035 to 4 visible", () => {
  const summary = getCurrentPixelSourceSummary(G4B_U06_SLICE019_SOURCE_ID);
  assert.ok(summary);
  assert.equal(summary.visibleKnowledgePoints.length, 4);
  assert.ok(summary.visibleKnowledgePoints.some((row) => row.knowledgePointId === G4B_U06_TWO_DECIMAL_KP_ID));
  assert.ok(summary.visibleKnowledgePoints.some((row) => row.knowledgePointId === G4B_U06_RATE_TOTAL_KP_ID));
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.bySourceId[G4B_U06_SLICE019_SOURCE_ID].visibleKnowledgePoints.length, 4);
});
