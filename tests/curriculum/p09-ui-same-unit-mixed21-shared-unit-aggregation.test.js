import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

globalThis.document = Object.create(null);

const preflight = JSON.parse(fs.readFileSync(
  "data/curriculum/full-product/p09/p09-ui-same-unit-mixed-21-defect-preflight.json",
  "utf8",
));

const selector = await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
const capability = await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
const worksheet = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");

const MIXED = "mixedKnowledgePointsSameUnit";
const targets = preflight.scope.targetUnits;

function rowsFor(sourceId) {
  return selector.listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
}

test("all 21 current public selector surfaces admit same-unit mixed mode", () => {
  assert.equal(targets.length, 21);
  for (const target of targets) {
    const rows = rowsFor(target.sourceId);
    const availability = selector.listBatchAKnowledgePointAvailabilityBySource(target.sourceId);
    assert.equal(rows.length, 5, `${target.unitCode} must retain five visible KPs`);
    assert.equal(availability.visibleCount, 5, `${target.unitCode} visibleCount drift`);
    assert.equal(availability.sameUnitMixedAllowed, true, `${target.unitCode} mixed selector must be enabled`);
  }
});

test("all 21 capability bindings accept a two-KP same-unit mixed request without silent fallback", () => {
  for (const target of targets) {
    const rows = rowsFor(target.sourceId);
    const ids = rows.slice(0, 2).map((row) => row.knowledgePointId);
    const binding = capability.resolvePublicUiCapabilityBinding({
      sourceId: target.sourceId,
      selectionMode: MIXED,
      selectedKnowledgePointIds: ids,
    });
    assert.ok(binding, `${target.unitCode} binding missing`);
    assert.equal(binding.blocked, false, `${target.unitCode} mixed binding blocked`);
    assert.equal(binding.sameUnitMixedAdmission, true, `${target.unitCode} mixed admission missing`);
    assert.deepEqual(binding.selectedKnowledgePointIds, ids, `${target.unitCode} must preserve exact requested KP pair`);
    assert.equal(
      binding.availableSelectionModes.find((option) => option.value === MIXED)?.enabled,
      true,
      `${target.unitCode} mixed mode not advertised`,
    );
  }
});

test("all 21 units materialize an exact 5-KP mixed worksheet through existing leaf runtimes", () => {
  for (const target of targets) {
    const rows = rowsFor(target.sourceId);
    const ids = rows.map((row) => row.knowledgePointId);
    const result = worksheet.buildWorksheetDocumentFromPlan({
      sourceId: target.sourceId,
      selectionMode: MIXED,
      selectedKnowledgePointIds: ids,
      selectedPatternGroupIds: [],
      questionCount: 10,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `p09-mixed21-test-${target.sourceId}`,
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 4,
        showAnswerKeyPage: true,
        showQuestionNumbers: true,
      },
    });
    assert.equal(result?.ok, true, `${target.unitCode} aggregation failed: ${JSON.stringify(result?.errors ?? [])}`);
    assert.equal(result?.p09Mixed21Aggregation, true, `${target.unitCode} did not use shared aggregator`);
    const doc = result.worksheetDocument;
    assert.ok(doc, `${target.unitCode} worksheet missing`);
    assert.equal(doc.questionCount, 10, `${target.unitCode} question count mismatch`);
    assert.equal(doc.answerKeyItems.length, 10, `${target.unitCode} answer count mismatch`);
    assert.equal(doc.metadata.sameUnitMixedUsed, true, `${target.unitCode} mixed metadata missing`);
    assert.equal(doc.metadata.crossUnitMixedUsed, false, `${target.unitCode} cross-unit mode leaked`);
    assert.deepEqual(doc.metadata.selectedKnowledgePointIds, ids, `${target.unitCode} selected KP set drift`);
    const represented = new Set(doc.questionDisplayModels.map((model) => model.knowledgePointId).filter(Boolean));
    assert.deepEqual([...represented].sort(), [...ids].sort(), `${target.unitCode} did not represent every selected KP`);
    assert.equal(new Set(doc.questionDisplayModels.map((model) => model.questionId)).size, 10, `${target.unitCode} duplicate question IDs`);
    assert.equal(result.leafDispatch.length, 5, `${target.unitCode} leaf runtime dispatch count mismatch`);
    assert.ok(result.leafDispatch.every((leaf) => leaf.questionCount === 2), `${target.unitCode} allocation must be 2 per KP`);
  }
});

test("a two-KP subset remains a true mixed request instead of degrading to one KP", () => {
  const target = targets.find((row) => row.unitCode === "G5A-U07");
  const ids = rowsFor(target.sourceId).slice(0, 2).map((row) => row.knowledgePointId);
  const result = worksheet.buildWorksheetDocumentFromPlan({
    sourceId: target.sourceId,
    selectionMode: MIXED,
    selectedKnowledgePointIds: ids,
    selectedPatternGroupIds: [],
    questionCount: 4,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "p09-mixed21-two-kp-no-silent-fallback",
    printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
  });
  assert.equal(result?.ok, true, JSON.stringify(result?.errors ?? []));
  assert.deepEqual(result.worksheetDocument.metadata.selectedKnowledgePointIds, ids);
  assert.deepEqual(
    [...new Set(result.worksheetDocument.questionDisplayModels.map((model) => model.knowledgePointId))].sort(),
    [...ids].sort(),
  );
});
