import assert from "node:assert/strict";
import test from "node:test";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import {
  G5A_U02_HIDDEN_WORKSHEET_LIFECYCLE,
  allocateG5AU02HiddenWorksheet,
  auditG5AU02HiddenWorksheetIntegration,
  buildG5AU02HiddenWorksheetDocument,
  getG5AU02HiddenWorksheetAnswerModelIds,
  getG5AU02HiddenWorksheetPatternIds,
  normalizeG5AU02HiddenWorksheetPlan,
  validateG5AU02HiddenWorksheetDocument,
} from "../../src/curriculum/g5a-u02/hidden-worksheet-answer-key.js";

const specs = getG5AU02HiddenPatternSpecs();
const patternIds = getG5AU02HiddenWorksheetPatternIds();
function mutableClone(value) { return JSON.parse(JSON.stringify(value)); }

test("S91 audit covers 22 routes, 14 Class C, 8 Class D, 18 routed and 19 supported answer models", () => {
  const audit = auditG5AU02HiddenWorksheetIntegration();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.classCCount, 14);
  assert.equal(audit.classDCount, 8);
  assert.equal(audit.answerModelCount, 18);
  assert.equal(audit.supportedAnswerModelCount, 19);
  assert.equal(patternIds.length, 22);
  const supported = getG5AU02HiddenWorksheetAnswerModelIds();
  assert.equal(supported.length, 19);
  assert.ok(supported.includes("partitionPairListAnswer"));
  assert.ok(supported.includes("tileSideAreaPairListAnswer"));
  assert.ok(supported.includes("commonFactorAndGcfAnswer"));
});

test("S91 normalizes and allocates an exact canonical round-robin count", () => {
  const selected = patternIds.slice(0, 3);
  const allocation = allocateG5AU02HiddenWorksheet({ patternSpecIds: selected, questionCount: 50, baseSeed: 91 });
  assert.equal(allocation.ok, true, allocation.errors.join(","));
  assert.equal(allocation.allocation.patternSequence.length, 50);
  assert.deepEqual(allocation.allocation.patternSequence.slice(0, 6), [selected[0], selected[1], selected[2], selected[0], selected[1], selected[2]]);
  assert.deepEqual(allocation.allocation.patternCounts, { [selected[0]]: 17, [selected[1]]: 17, [selected[2]]: 16 });
  assert.equal(Object.values(allocation.allocation.patternCounts).reduce((a, b) => a + b, 0), 50);
});

test("S91 blocks invalid counts, duplicate selections, and unknown PatternSpecs", () => {
  assert.equal(normalizeG5AU02HiddenWorksheetPlan({ questionCount: 0 }).ok, false);
  assert.equal(normalizeG5AU02HiddenWorksheetPlan({ questionCount: 1001 }).ok, false);
  assert.equal(normalizeG5AU02HiddenWorksheetPlan({ patternSpecIds: [] }).ok, false);
  assert.equal(normalizeG5AU02HiddenWorksheetPlan({ patternSpecIds: [patternIds[0], patternIds[0]] }).ok, false);
  const unknown = normalizeG5AU02HiddenWorksheetPlan({ patternSpecIds: ["ps_g5a_u02_unknown"] });
  assert.equal(unknown.ok, false);
  assert.ok(unknown.errors.some((code) => code.includes("UNKNOWN_PATTERN")));
});

test("S91 builds one hidden question and answer for every canonical PatternSpec", () => {
  const result = buildG5AU02HiddenWorksheetDocument({ questionCount: 22, baseSeed: 20260714, questionRowsPerPage: 5, answerRowsPerPage: 7 });
  assert.equal(result.ok, true, result.errors.join(","));
  const document = result.worksheetDocument;
  assert.equal(document.questionCount, 22);
  assert.equal(document.questionRecords.length, 22);
  assert.equal(document.answerKeyRecords.length, 22);
  assert.equal(document.questionPages.length, 5);
  assert.equal(document.answerKeyPages.length, 4);
  assert.deepEqual(document.questionRecords.map((row) => row.patternSpecId), patternIds);
  assert.equal(new Set(document.questionRecords.map((row) => row.answerModelId)).size, 18);
  assert.equal(document.questionRecords.filter((row) => row.implementationClass === "C").length, 14);
  assert.equal(document.questionRecords.filter((row) => row.implementationClass === "D").length, 8);
  assert.ok(document.questionRecords.every((row) => !("answer" in row) && !("answerText" in row)));
  assert.ok(document.answerKeyRecords.every((row) => row.answerText.length > 0));
  assert.equal(validateG5AU02HiddenWorksheetDocument(document).ok, true);
});

test("S91 supports exact counts above route count and is deterministic by seed", () => {
  const options = { patternSpecIds: patternIds.slice(0, 5), questionCount: 47, baseSeed: 991, questionRowsPerPage: 9, answerRowsPerPage: 10 };
  const first = buildG5AU02HiddenWorksheetDocument(options);
  const second = buildG5AU02HiddenWorksheetDocument(options);
  assert.equal(first.ok, true, first.errors.join(","));
  assert.equal(second.ok, true, second.errors.join(","));
  assert.equal(first.worksheetDocument.questionCount, 47);
  assert.deepEqual(first.worksheetDocument, second.worksheetDocument);
  assert.equal(first.worksheetDocument.questionPages.length, 6);
  assert.equal(first.worksheetDocument.answerKeyPages.length, 5);
});

test("S91 suppresses all answer records and pages when the answer key is disabled", () => {
  const result = buildG5AU02HiddenWorksheetDocument({ patternSpecIds: patternIds.slice(8, 13), questionCount: 13, baseSeed: 319, includeAnswerKey: false });
  assert.equal(result.ok, true, result.errors.join(","));
  assert.equal(result.worksheetDocument.answerKeyEnabled, false);
  assert.deepEqual(result.worksheetDocument.answerKeyRecords, []);
  assert.deepEqual(result.worksheetDocument.answerKeyPages, []);
  assert.equal(validateG5AU02HiddenWorksheetDocument(result.worksheetDocument).ok, true);
});

test("S91 validator blocks question answer leakage and route metadata mutation", () => {
  const result = buildG5AU02HiddenWorksheetDocument({ questionCount: 22, baseSeed: 401 });
  assert.equal(result.ok, true, result.errors.join(","));
  const leaked = mutableClone(result.worksheetDocument);
  leaked.questionRecords[0].answerText = "洩漏答案";
  const leakedValidation = validateG5AU02HiddenWorksheetDocument(leaked);
  assert.equal(leakedValidation.ok, false);
  assert.ok(leakedValidation.errors.includes("G5AU02_WORKSHEET_QUESTION_ANSWER_LEAKAGE"));
  const mutated = mutableClone(result.worksheetDocument);
  mutated.questionRecords[0].knowledgePointId = "kp_mutated";
  const mutationValidation = validateG5AU02HiddenWorksheetDocument(mutated);
  assert.equal(mutationValidation.ok, false);
  assert.ok(mutationValidation.errors.includes("G5AU02_WORKSHEET_KP_ROUTE_MISMATCH"));
});

test("S91 validator blocks answer mismatch, pagination drift, and renderer scope breach", () => {
  const result = buildG5AU02HiddenWorksheetDocument({ questionCount: 22, baseSeed: 511 });
  assert.equal(result.ok, true, result.errors.join(","));
  const answerMismatch = mutableClone(result.worksheetDocument);
  answerMismatch.answerKeyRecords[0].patternSpecId = specs[1].patternSpecId;
  assert.ok(validateG5AU02HiddenWorksheetDocument(answerMismatch).errors.includes("G5AU02_WORKSHEET_ANSWER_PATTERN_MISMATCH"));
  const pageDrift = mutableClone(result.worksheetDocument);
  pageDrift.questionPages[0].records.shift();
  assert.ok(validateG5AU02HiddenWorksheetDocument(pageDrift).errors.includes("G5AU02_WORKSHEET_QUESTION_PAGINATION_MISMATCH"));
  const rendererBreach = mutableClone(result.worksheetDocument);
  rendererBreach.lifecycle.rendererStatus = "connected";
  assert.ok(validateG5AU02HiddenWorksheetDocument(rendererBreach).errors.includes("G5AU02_WORKSHEET_RENDERER_SCOPE_BREACH"));
});

test("S91 document, pages, records, and lifecycle are deeply frozen and remain hidden", () => {
  const result = buildG5AU02HiddenWorksheetDocument({ questionCount: 5, baseSeed: 601 });
  assert.equal(result.ok, true, result.errors.join(","));
  const document = result.worksheetDocument;
  assert.equal(Object.isFrozen(document), true);
  assert.equal(Object.isFrozen(document.questionRecords), true);
  assert.equal(Object.isFrozen(document.questionRecords[0]), true);
  assert.equal(Object.isFrozen(document.answerKeyRecords[0].structuredAnswer), true);
  assert.equal(Object.isFrozen(document.questionPages[0]), true);
  assert.equal(Object.isFrozen(G5A_U02_HIDDEN_WORKSHEET_LIFECYCLE), true);
  assert.deepEqual(G5A_U02_HIDDEN_WORKSHEET_LIFECYCLE, {
    unitId: "g5a_u02", worksheetStatus: "hidden_exact_count_integrated", answerKeyStatus: "hidden_integrated_optional",
    selectorStatus: "hidden", canonicalRouting: "internal_explicit_only", rendererStatus: "not_connected",
    productionUse: "forbidden", genericFallback: "forbidden", freeFormAI: "forbidden",
  });
});
