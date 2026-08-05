import test from "node:test";
import assert from "node:assert/strict";
import { auditG6AU02ReciprocalSelectorProjection, G6A_U02_RECIPROCAL_KP_ID, G6A_U02_RECIPROCAL_SPEC_IDS } from "../../site/modules/curriculum/registry/g6a-u02-reciprocal-selector-projection.js";
import { auditP03F23PublicSelectorComposition, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p03f23-extension.js";
import { validateP03F23PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f23-extension.js";
import { generateG6AU02Slice023Questions, validateG6AU02Slice023Question } from "../../site/modules/curriculum/batch-a/g6a-u02-reciprocal-runtime-p03f23.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f23-extension.js";
import { getBatchASourceUnit } from "../../site/modules/curriculum/batch-a/source-units.js";
import { getCurrentPixelSourceSummary } from "../../site/pixel/pixel-registry-bridge.js";
const plan = (count = 24) => ({ sourceId: "g6a_u02_6a02", selectedKnowledgePointIds: [G6A_U02_RECIPROCAL_KP_ID], patternSpecIds: [...G6A_U02_RECIPROCAL_SPEC_IDS], questionMode: "numeric", questionCount: count, generationSeed: "p03f23-core", includeAnswerKey: true, printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true } });
test("P03F23 exposes one new source one KP one group and three specs", () => {
  assert.deepEqual(auditG6AU02ReciprocalSelectorProjection().counts, { knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 });
  assert.equal(auditP03F23PublicSelectorComposition().ok, true);
  assert.equal(validateP03F23PatternDefinitions().ok, true);
  assert.equal(getBatchASourceUnit("g6a_u02_6a02").unitCode, "6A-U02");
  assert.deepEqual(listBatchAKnowledgePointAvailabilityBySource("g6a_u02_6a02"), { sourceId: "g6a_u02_6a02", visibleCount: 1, hiddenPendingCount: 4, notSelectableCount: 4, publicSelectorStatus: "slice023_reciprocal_successor", canonicalReachableKnowledgePointCount: 1, canonicalReachableKnowledgePointIds: [G6A_U02_RECIPROCAL_KP_ID], publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice023Implementation" });
});
test("P03F23 deterministically materializes balanced exact reciprocal witnesses", () => {
  const first = generateG6AU02Slice023Questions(plan()); const second = generateG6AU02Slice023Questions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors)); assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 24); assert.deepEqual(first.allocation.map((row) => row.questionCount), [8, 8, 8]);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 24);
  first.questions.forEach((q) => { assert.equal(q.numerator * q.reciprocalNumerator, q.denominator * q.reciprocalDenominator); assert.equal(validateG6AU02Slice023Question(q).ok, true); });
});
test("P03F23 closes the 240-question ceiling without duplicates", () => {
  const result = generateG6AU02Slice023Questions(plan(240));
  assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.questions.length, 240);
  assert.equal(new Set(result.questions.map((row) => row.blankedDisplayText)).size, 240);
});
test("P03F23 validator fails closed on reciprocal answer capability and context tampering", () => {
  const questions = generateG6AU02Slice023Questions(plan(6)).questions;
  assert.equal(validateG6AU02Slice023Question({ ...questions[0], answerText: "9/9" }).ok, false);
  assert.equal(validateG6AU02Slice023Question({ ...questions[1], reciprocalNumerator: 999 }).ok, false);
  assert.equal(validateG6AU02Slice023Question({ ...questions[2], metadata: { ...questions[2].metadata, requiredCapabilityIds: [] } }).ok, false);
  assert.equal(validateG6AU02Slice023Question({ ...questions[3], metadata: { ...questions[3].metadata, contextAuthority: { fake: true } } }).ok, false);
});
test("P03F23 shared worksheet emits 24 questions answers and six pages", () => {
  const result = buildBatchABrowserWorksheetDocument(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors)); assert.equal(result.worksheetDocument.questionCount, 24);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 24); assert.equal(result.worksheetDocument.questionPages.length, 3);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 3); assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
});
test("P03F23 current Pixel registry exposes the new reciprocal source", () => {
  const summary = getCurrentPixelSourceSummary("g6a_u02_6a02");
  assert.equal(summary.visibleKnowledgePoints.length, 1); assert.equal(summary.visibleKnowledgePoints[0].knowledgePointId, G6A_U02_RECIPROCAL_KP_ID);
});
