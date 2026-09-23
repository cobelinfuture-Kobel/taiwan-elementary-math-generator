import assert from "node:assert/strict";
import test from "node:test";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  GLOBAL_PUBLIC_APPROVED_LAYOUTS,
  GLOBAL_PUBLIC_LAYOUT_DEFAULT,
  normalizeGlobalPublicLayout,
  validateGlobalPublicLayoutContract,
} from "../../site/modules/curriculum/batch-a/global-public-layout-contract.js";
import {
  adaptGlobalPublicSourceUnitPlan,
  validateGlobalPublicSourceUnitAdapters,
} from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { listProtectedFifteenPublicSourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

function createScenarioState(sourceId, layout, includeAnswerKey = false) {
  const state = createConfigState();
  setBatchASourceId(state, sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, 18);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchAGenerationSeed(state, `glm-s01:${sourceId}:${layout.layoutId}`);
  setBatchAPrintLayout(state, {
    columns: layout.columns,
    rowsPerPage: layout.rowsPerPage,
  });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function issueCodes(result) {
  return [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
  ].map((issue) => issue?.code ?? issue);
}

test("GLM-S05 runtime registry contains exactly the global approved matrix", () => {
  assert.deepEqual(validateGlobalPublicLayoutContract(), { ok: true, errors: [] });
  assert.equal(GLOBAL_PUBLIC_APPROVED_LAYOUTS.length, 18);
  assert.equal(new Set(GLOBAL_PUBLIC_APPROVED_LAYOUTS.map((layout) => layout.layoutId)).size, 18);
  assert.deepEqual(GLOBAL_PUBLIC_LAYOUT_DEFAULT, { layoutId: "3x5", columns: 3, rowsPerPage: 5 });
});

test("GLM-S05 state defaults to 3x5 and explicitly migrates legacy values", () => {
  const state = createConfigState();
  assert.equal(state.batchA.columns, 3);
  assert.equal(state.batchA.rowsPerPage, 5);
  assert.equal(state.batchA.layoutNormalization.legacyMigrationApplied, false);

  const legacy = createConfigState({ queryState: { columns: 4, rowsPerPage: 10 } });
  assert.equal(legacy.batchA.columns, 3);
  assert.equal(legacy.batchA.rowsPerPage, 5);
  assert.equal(legacy.batchA.layoutNormalization.legacyMigrationApplied, true);
  assert.equal(legacy.batchA.layoutNormalization.warnings[0].code, "global_public_layout_legacy_migrated");
  assert.deepEqual(normalizeGlobalPublicLayout({ columns: 2, rowsPerPage: 6 }).layout, {
    layoutId: "2x6", columns: 2, rowsPerPage: 6,
  });
});

test("GLM-S05 source-unit adapters select complete promoted canonical authority", () => {
  assert.deepEqual(validateGlobalPublicSourceUnitAdapters(), { ok: true, errors: [] });
  const g4b = adaptGlobalPublicSourceUnitPlan({ sourceId: "g4b_u04_4b04", selectionMode: "sourceUnit" });
  const g5a = adaptGlobalPublicSourceUnitPlan({ sourceId: "g5a_u02_5a02", selectionMode: "sourceUnit" });
  assert.equal(g4b.plan.selectedKnowledgePointIds.length, 13);
  assert.equal(g4b.plan.selectedPatternGroupIds.length, 13);
  assert.equal(g5a.plan.selectedKnowledgePointIds.length, 18);
  assert.equal(g5a.plan.selectedPatternGroupIds.length, 18);
  assert.equal(g4b.plan.publicSelectionMode, "sourceUnit");
  assert.equal(g5a.plan.publicSelectionMode, "sourceUnit");
});

test("GLM-S05 all protected 15 source-unit plans generate all 18 exact layouts", { timeout: 120_000 }, () => {
  const sourceUnits = listProtectedFifteenPublicSourceUnits();
  assert.equal(sourceUnits.length, 15);
  const failures = [];
  let scenarioCount = 0;

  for (const unit of sourceUnits) {
    for (const layout of GLOBAL_PUBLIC_APPROVED_LAYOUTS) {
      scenarioCount += 1;
      const state = createScenarioState(unit.sourceId, layout, false);
      const publicPlan = getBatchAWorksheetPlan(state);
      assert.equal(publicPlan.printLayout.columns, layout.columns);
      assert.equal(publicPlan.printLayout.rowsPerPage, layout.rowsPerPage);
      const result = buildWorksheetDocumentFromState(state);
      const document = result?.worksheetDocument;
      const resolved = document?.layoutResolution?.resolvedQuestionLayout;
      const actualCount = document?.summary?.questionCount
        ?? document?.generatedQuestions?.length
        ?? document?.questionDisplayModels?.length
        ?? 0;
      if (!result?.ok
        || !document
        || resolved?.columns !== layout.columns
        || resolved?.rowsPerPage !== layout.rowsPerPage
        || document?.layoutResolution?.layoutExact !== true
        || document?.layoutResolution?.capped !== false
        || actualCount !== 18) {
        failures.push({
          scenarioId: `${unit.sourceId}:${layout.layoutId}`,
          ok: result?.ok,
          issueCodes: issueCodes(result),
          resolved,
          layoutResolution: document?.layoutResolution,
          actualCount,
        });
      }
    }
  }

  assert.equal(scenarioCount, 270);
  assert.deepEqual(failures, []);
});

test("GLM-S05 answer layout remains independently resolved and read back", () => {
  const state = createScenarioState("g4a_u08_4a08", { layoutId: "2x6", columns: 2, rowsPerPage: 6 }, true);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(issueCodes(result)));
  const document = result.worksheetDocument;
  const questionLayout = document.layoutResolution.resolvedQuestionLayout;
  const answerLayout = document.layoutResolution.resolvedAnswerLayout;
  const answerOptions = document.configSnapshot.answerKeyPrintLayout;
  assert.equal(document.layoutResolution.authorizedLayoutId, "2x6");
  assert.deepEqual(questionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 6 });
  assert.ok(answerLayout);
  assert.notStrictEqual(answerLayout, questionLayout);
  assert.equal(answerLayout.columns, document.printOptions.answerKeyColumns);
  assert.equal(answerLayout.rowsPerPage, document.printOptions.answerKeyRowsPerPage);
  assert.deepEqual(answerLayout, {
    paperSize: answerOptions.paperSize,
    columns: answerOptions.columns,
    rowsPerPage: answerOptions.rowsPerPage,
  });
});
