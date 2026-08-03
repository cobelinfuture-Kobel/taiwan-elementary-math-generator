import test from "node:test";
import assert from "node:assert/strict";
import { auditP03F18PublicSelectorComposition, getVisibleBatchAKnowledgePoint, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-p03f18-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f18.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f18.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f18.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f18-extension.js";
import { G4A_U09_DECIMAL_COMPOSE_SOURCE_ID, G4A_U09_DECIMAL_COMPOSE_KP_ID, G4A_U09_DECIMAL_COMPOSE_GROUP_ID, G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID } from "../../site/modules/curriculum/registry/g4a-u09-decimal-compose-decompose-selector-projection.js";

const options = {
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  selectedKnowledgePointIds: [G4A_U09_DECIMAL_COMPOSE_KP_ID],
  selectedPatternGroupIds: [G4A_U09_DECIMAL_COMPOSE_GROUP_ID],
  patternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
  questionMode: "numeric",
  questionCount: 12,
  generationSeed: "p03f18-current-surface",
  includeAnswerKey: true,
};

test("P03F18 current selector exposes only the admitted compose/decompose successor", () => {
  const audit = auditP03F18PublicSelectorComposition();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  const row = getVisibleBatchAKnowledgePoint(G4A_U09_DECIMAL_COMPOSE_KP_ID);
  assert.equal(row?.sourceId, G4A_U09_DECIMAL_COMPOSE_SOURCE_ID);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G4A_U09_DECIMAL_COMPOSE_KP_ID, "numeric"), [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]);
});

test("P03F18 current planner generator validator and worksheet use the shared successor chain", () => {
  const plan = buildBatchABrowserPlan(options);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.deepEqual(plan.patternSpecIds, [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]);
  const generated = generateBatchABrowserQuestions(options);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 12);
  assert.equal(new Set(generated.questions.map((q) => q.promptText)).size, 12);
  const validation = validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  const worksheet = buildBatchABrowserWorksheetDocument(options);
  assert.equal(worksheet.ok, true, JSON.stringify(worksheet.errors));
  assert.equal(worksheet.worksheetDocument.questionCount, 12);
  assert.equal(worksheet.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(worksheet.worksheetDocument.metadata.applicationExpansion, false);
  assert.equal(worksheet.worksheetDocument.metadata.worksheetAdapter.parallelPipeline, false);
});
