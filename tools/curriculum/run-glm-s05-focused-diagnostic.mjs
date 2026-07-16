import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
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
import { GLOBAL_PUBLIC_APPROVED_LAYOUTS } from "../../site/modules/curriculum/batch-a/global-public-layout-contract.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputDirectory = path.join(repositoryRoot, "docs/curriculum/output/glm-s05-focused-diagnostic");
const outputPath = path.join(outputDirectory, "current.json");

function createScenarioState(sourceId, layout) {
  const state = createConfigState();
  setBatchASourceId(state, sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, 18);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, false);
  setBatchAGenerationSeed(state, `glm-s01:${sourceId}:${layout.layoutId}`);
  setBatchAPrintLayout(state, { columns: layout.columns, rowsPerPage: layout.rowsPerPage });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function issues(result) {
  return [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.validation?.warnings ?? []),
  ].map((issue) => ({
    code: issue?.code ?? String(issue),
    path: issue?.path ?? null,
    message: issue?.message ?? null,
  }));
}

const scenarios = [];
for (const unit of listBatchASourceUnits({ includePublicCandidates: true })) {
  for (const layout of GLOBAL_PUBLIC_APPROVED_LAYOUTS) {
    let result;
    let exception = null;
    try {
      result = buildWorksheetDocumentFromState(createScenarioState(unit.sourceId, layout));
    } catch (error) {
      exception = { name: error?.name ?? "Error", message: String(error?.message ?? error), stack: error?.stack ?? null };
      result = { ok: false, errors: [{ code: "GLM_S05_DIAGNOSTIC_EXCEPTION", message: exception.message }] };
    }
    const document = result?.worksheetDocument ?? null;
    const resolved = document?.layoutResolution?.resolvedQuestionLayout ?? null;
    const actualCount = document?.summary?.questionCount
      ?? document?.generatedQuestions?.length
      ?? document?.questionDisplayModels?.length
      ?? 0;
    const exact = Boolean(
      result?.ok
      && document
      && resolved?.columns === layout.columns
      && resolved?.rowsPerPage === layout.rowsPerPage
      && document?.layoutResolution?.layoutExact === true
      && document?.layoutResolution?.capped === false
      && actualCount === 18
    );
    scenarios.push({
      scenarioId: `${unit.sourceId}:${layout.layoutId}`,
      sourceId: unit.sourceId,
      unitCode: unit.unitCode,
      layoutId: layout.layoutId,
      requested: { columns: layout.columns, rowsPerPage: layout.rowsPerPage },
      exact,
      ok: Boolean(result?.ok && document),
      actualCount,
      resolved,
      layoutResolution: document?.layoutResolution ?? null,
      issueCodes: [...new Set(issues(result).map((issue) => issue.code))],
      issues: issues(result),
      preProjectionDiagnostic: result?.g5aU02PreProjectionDiagnostic ?? null,
      exception,
    });
  }
}

const failures = scenarios.filter((scenario) => !scenario.exact);
const sourceSummaries = listBatchASourceUnits({ includePublicCandidates: true }).map((unit) => {
  const rows = scenarios.filter((scenario) => scenario.sourceId === unit.sourceId);
  return {
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    scenarioCount: rows.length,
    exactCount: rows.filter((scenario) => scenario.exact).length,
    failureCount: rows.filter((scenario) => !scenario.exact).length,
    failureLayouts: rows.filter((scenario) => !scenario.exact).map((scenario) => scenario.layoutId),
    issueCodes: [...new Set(rows.flatMap((scenario) => scenario.issueCodes))],
  };
});
const manifest = {
  schemaVersion: "glm-s05-focused-diagnostic-v1",
  task: "GLM-S05_Global18LayoutFullFix",
  status: failures.length === 0 ? "ALL_270_EXACT" : "GAPS_DETECTED",
  scenarioCount: scenarios.length,
  exactCount: scenarios.length - failures.length,
  failureCount: failures.length,
  sourceSummaries,
  failures,
  scenarios,
};
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  scenarioCount: manifest.scenarioCount,
  exactCount: manifest.exactCount,
  failureCount: manifest.failureCount,
  gapSources: sourceSummaries.filter((source) => source.failureCount > 0),
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
