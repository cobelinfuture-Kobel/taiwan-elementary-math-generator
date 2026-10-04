import test from "node:test";
import assert from "node:assert/strict";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  buildP09Mixed21Worksheet,
  requestsP09Mixed21Aggregation,
} from "../../site/modules/curriculum/batch-a/same-unit-mixed21-aggregation.js";
import { buildSchoolExamCrossUnitWorksheet } from "../../site/modules/exam/school-exam-cross-unit-coordinator.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank01-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-g3a-u01-rank01.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

function stubLeafRecorder(calls) {
  return (plan) => {
    calls.push(structuredClone(plan));
    const generatedQuestions = Array.from({ length: plan.questionCount }, (_, index) => ({
      id: `${plan.sourceId}-${plan.selectedKnowledgePointIds?.[0] ?? "kp"}-${index + 1}`,
      prompt: `Q${index + 1}`,
      answer: String(index + 1),
      knowledgePointId: plan.selectedKnowledgePointIds?.[0] ?? null,
      patternGroupId: plan.selectedPatternGroupIds?.[0] ?? null,
      metadata: {
        sourceId: plan.sourceId,
        knowledgePointId: plan.selectedKnowledgePointIds?.[0] ?? null,
        patternGroupId: plan.selectedPatternGroupIds?.[0] ?? null,
      },
    }));
    return {
      ok: true,
      errors: [],
      warnings: [],
      worksheetDocument: {
        generatedQuestions,
        questionCount: generatedQuestions.length,
        printOptions: {
          paperSize: "A4",
          columns: 2,
          rowsPerPage: 3,
          showQuestionNumbers: true,
          showAnswerKeyPage: true,
        },
      },
    };
  };
}

test("G3A U01 Rank01 is admitted for same-unit and cross-unit selector composition", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal(availability.sameUnitMixedAllowed, true);
  assert.equal(availability.crossUnitMixedAllowed, true);

  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SRC);
  assert.ok(rows.length >= 2);
  const selectedIds = [KP, rows.find((row) => row.knowledgePointId !== KP)?.knowledgePointId].filter(Boolean);
  assert.equal(selectedIds.length, 2);

  const binding = resolvePublicUiCapabilityBinding({
    sourceId: SRC,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: selectedIds,
    selectedPatternGroupIds: [GROUP],
  });
  assert.equal(binding.blocked, false);
  assert.equal(binding.sameUnitMixedAdmission, true);
  assert.equal(binding.rank01MixedAdmission, true);
  assert.ok(binding.compatiblePatternGroupIds.includes(GROUP));
  assert.ok(binding.selectedCompatiblePatternGroupIds.includes(GROUP));
});

test("same-unit mixed aggregation forwards Rank01 only to the canonical G3A U01 compare leaf", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SRC);
  const other = rows.find((row) => row.knowledgePointId !== KP);
  assert.ok(other);

  const plan = {
    sourceId: SRC,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [KP, other.knowledgePointId],
    selectedPatternGroupIds: [GROUP],
    selectedSelectorTargetIds: [KP, GROUP, other.knowledgePointId],
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g3a-u01-rank01-same-unit-linkage",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 3, showAnswerKeyPage: true },
  };
  assert.equal(requestsP09Mixed21Aggregation(plan), true);

  const calls = [];
  const result = buildP09Mixed21Worksheet(plan, stubLeafRecorder(calls));
  assert.equal(result.ok, true);
  assert.equal(calls.length, 3);

  const compareLeaves = calls.filter((call) => call.selectedKnowledgePointIds?.[0] === KP);
  assert.equal(compareLeaves.length, 2);
  const rankLeaf = compareLeaves.find((call) => call.selectedPatternGroupIds?.includes(GROUP));
  const canonicalLeaf = compareLeaves.find((call) => !(call.selectedPatternGroupIds?.includes(GROUP) ?? false));
  const otherLeaf = calls.find((call) => call.selectedKnowledgePointIds?.[0] === other.knowledgePointId);
  assert.deepEqual(rankLeaf?.selectedPatternGroupIds, [GROUP]);
  assert.ok(canonicalLeaf);
  assert.equal(otherLeaf?.selectedPatternGroupIds?.includes(GROUP) ?? false, false);
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds, [KP, GROUP, other.knowledgePointId]);
});

test("cross-unit coordinator forwards Rank01 group to the G3A U01 leaf without contaminating the other unit", () => {
  const rows = listVisibleBatchAKnowledgePoints();
  const unitMap = new Map(listBatchASourceUnits({ includeCurrentFullProductPublic: true }).map((unit) => [unit.sourceId, unit]));
  const sourceUnit = unitMap.get(SRC);
  assert.ok(sourceUnit);

  const otherRow = rows.find((row) => {
    if (row.sourceId === SRC) return false;
    const unit = unitMap.get(row.sourceId);
    return unit && unit.grade === sourceUnit.grade && unit.semester === sourceUnit.semester;
  });
  assert.ok(otherRow);

  const otherUnit = unitMap.get(otherRow.sourceId);
  assert.ok(otherUnit);
  const plan = {
    grade: sourceUnit.grade,
    semester: sourceUnit.semester,
    selectedSourceIds: [SRC, otherRow.sourceId],
    selectedKnowledgePointIds: [KP, otherRow.knowledgePointId],
    selectedPatternGroupIds: [GROUP],
    selectedSelectorTargetIds: [
      `${sourceUnit.unitCode}::${KP}`,
      `${sourceUnit.unitCode}::${GROUP}`,
      `${otherUnit.unitCode}::${otherRow.knowledgePointId}`,
    ],
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g3a-u01-rank01-cross-unit-linkage",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 3, showAnswerKeyPage: true },
  };

  const calls = [];
  const result = buildSchoolExamCrossUnitWorksheet(plan, stubLeafRecorder(calls));
  assert.equal(result.ok, true);
  assert.equal(calls.length, 3);

  const compareLeaves = calls.filter((call) => call.sourceId === SRC && call.selectedKnowledgePointIds?.[0] === KP);
  assert.equal(compareLeaves.length, 2);
  const rankLeaf = compareLeaves.find((call) => call.selectedPatternGroupIds?.includes(GROUP));
  const canonicalLeaf = compareLeaves.find((call) => !(call.selectedPatternGroupIds?.includes(GROUP) ?? false));
  const otherLeaf = calls.find((call) => call.sourceId === otherRow.sourceId);
  assert.deepEqual(rankLeaf?.selectedPatternGroupIds, [GROUP]);
  assert.ok(canonicalLeaf);
  assert.equal(otherLeaf?.selectedPatternGroupIds?.includes(GROUP) ?? false, false);
  assert.equal(result.worksheetDocument.metadata.crossUnitMixedUsed, true);
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds, plan.selectedSelectorTargetIds);
});


test("same-unit mixed all-select materializes every G3A U01 selector target with the real leaf runtime", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SRC);
  const selectorTargetIds = rows.map((row) => row.knowledgePointId);
  const compareIndex = selectorTargetIds.indexOf(KP);
  assert.notEqual(compareIndex, -1);
  selectorTargetIds.splice(compareIndex + 1, 0, GROUP);

  const result = buildWorksheetDocumentFromPlan({
    sourceId: SRC,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: rows.map((row) => row.knowledgePointId),
    selectedPatternGroupIds: [GROUP],
    selectedSelectorTargetIds: selectorTargetIds,
    questionCount: 24,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g3a-u01-rank01-real-all-select",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 5,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  });

  assert.equal(
    result?.ok,
    true,
    JSON.stringify({
      errors: result?.errors ?? [],
      allocation: result?.allocation ?? [],
      leafDispatch: result?.leafDispatch ?? [],
    }, null, 2),
  );
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds, selectorTargetIds);
  assert.equal(result.worksheetDocument.summary.questionCount, 24);
});
