import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
import {
  buildWorksheetDocumentFromState,
} from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);
const outputDirectory = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s01-current-layout-behavior-audit",
);
const outputPath = path.join(outputDirectory, "current.json");

const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const allowedResultCodes = new Set(contract.baselineResultCodes);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function createScenarioState(unit, layout) {
  const state = createConfigState();
  setBatchASourceId(state, unit.sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, 18);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, false);
  setBatchAGenerationSeed(state, `glm-s01:${unit.sourceId}:${layout.layoutId}`);
  setBatchAPrintLayout(state, {
    columns: layout.columns,
    rowsPerPage: layout.rowsPerPage,
  });
  // G4B-U04 requires explicit custom mode to model a teacher changing the
  // generic column/row inputs. Other units ignore this unsupported control.
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function resolvedQuestionLayout(document) {
  const layoutResolution = document?.layoutResolution?.resolvedQuestionLayout;
  const printOptions = document?.printOptions;
  const configPrintLayout = document?.configSnapshot?.printLayout;
  return {
    columns: normalizeInteger(
      layoutResolution?.columns
        ?? printOptions?.columns
        ?? configPrintLayout?.columns,
    ),
    rowsPerPage: normalizeInteger(
      layoutResolution?.rowsPerPage
        ?? printOptions?.rowsPerPage
        ?? configPrintLayout?.rowsPerPage,
    ),
    authority: layoutResolution
      ? "layoutResolution.resolvedQuestionLayout"
      : printOptions
        ? "printOptions"
        : configPrintLayout
          ? "configSnapshot.printLayout"
          : "missing",
  };
}

function classifyScenario({ result, requested, resolved }) {
  if (!result?.ok || !result?.worksheetDocument) return "GENERATION_BLOCKED";
  if (resolved.columns === requested.columns && resolved.rowsPerPage === requested.rowsPerPage) {
    return "PASS";
  }
  if (resolved.columns === null || resolved.rowsPerPage === null) return "IGNORED";
  if (resolved.columns < requested.columns || resolved.rowsPerPage < requested.rowsPerPage) {
    return "SILENTLY_CAPPED";
  }
  return "IGNORED";
}

function issueCodes(result) {
  const issues = [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.validation?.warnings ?? []),
  ];
  return [...new Set(issues.map((issue) => issue?.code).filter(Boolean))];
}

function auditScenario(unit, layout) {
  const state = createScenarioState(unit, layout);
  let result;
  let exception = null;
  try {
    result = buildWorksheetDocumentFromState(state);
  } catch (error) {
    exception = {
      name: error?.name ?? "Error",
      message: String(error?.message ?? error),
    };
    result = { ok: false, errors: [{ code: "GLM_S01_HARNESS_EXCEPTION" }] };
  }

  const document = result?.worksheetDocument ?? null;
  const resolved = resolvedQuestionLayout(document);
  const requested = {
    columns: layout.columns,
    rowsPerPage: layout.rowsPerPage,
  };
  const classification = classifyScenario({ result, requested, resolved });
  if (!allowedResultCodes.has(classification)) {
    throw new Error(`GLM_S01_UNKNOWN_CLASSIFICATION:${classification}`);
  }

  return {
    scenarioId: `${unit.sourceId}:${layout.layoutId}`,
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    unitTitle: unit.title,
    layoutId: layout.layoutId,
    requested,
    resolved,
    classification,
    generationOk: Boolean(result?.ok && document),
    questionCount: document?.summary?.questionCount
      ?? document?.generatedQuestions?.length
      ?? document?.questionDisplayModels?.length
      ?? 0,
    questionPageCount: document?.summary?.questionPageCount
      ?? document?.questionPages?.length
      ?? 0,
    rendererProfileId: document?.rendererProfile?.profileId ?? null,
    layoutMode: document?.layoutResolution?.layoutMode
      ?? document?.batchA?.layoutMode
      ?? null,
    layoutCapped: document?.layoutResolution?.capped
      ?? document?.summary?.layoutCapped
      ?? null,
    appliedLayoutText: document?.appliedLayoutText
      ?? document?.summary?.appliedLayoutText
      ?? null,
    readback: {
      printOptions: clone(document?.printOptions ?? null),
      layoutResolution: clone(document?.layoutResolution ?? null),
      publicControls: clone(document?.publicControls ?? null),
      configSnapshotPrintLayout: clone(document?.configSnapshot?.printLayout ?? null),
    },
    issueCodes: issueCodes(result),
    exception,
  };
}

function countBy(items, keySelector) {
  const counts = {};
  for (const item of items) {
    const key = keySelector(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

const scenarios = [];
for (const unit of contract.publicUnits) {
  for (const layout of contract.approvedLayouts) {
    scenarios.push(auditScenario(unit, layout));
  }
}

if (scenarios.length !== contract.scope.baseScenarioCount) {
  throw new Error(
    `GLM_S01_SCENARIO_COUNT_MISMATCH:${scenarios.length}:${contract.scope.baseScenarioCount}`,
  );
}

const unclassified = scenarios.filter((scenario) => !allowedResultCodes.has(scenario.classification));
if (unclassified.length > 0) {
  throw new Error(`GLM_S01_UNCLASSIFIED_SCENARIOS:${unclassified.length}`);
}

const classificationCounts = countBy(scenarios, (scenario) => scenario.classification);
const sourceSummaries = contract.publicUnits.map((unit) => {
  const sourceScenarios = scenarios.filter((scenario) => scenario.sourceId === unit.sourceId);
  return {
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    title: unit.title,
    scenarioCount: sourceScenarios.length,
    classificationCounts: countBy(sourceScenarios, (scenario) => scenario.classification),
    exactLayoutCount: sourceScenarios.filter((scenario) => scenario.classification === "PASS").length,
    nonPassLayoutIds: sourceScenarios
      .filter((scenario) => scenario.classification !== "PASS")
      .map((scenario) => scenario.layoutId),
    rendererProfileIds: [...new Set(sourceScenarios.map((scenario) => scenario.rendererProfileId).filter(Boolean))],
  };
});

const manifest = {
  schemaVersion: "glm-s01-current-layout-behavior-audit-v1",
  task: "GLM-S01_Current15UnitLayoutBehaviorAudit",
  status: "BASELINE_CAPTURED",
  globalLayoutStatus: (classificationCounts.PASS ?? 0) === scenarios.length
    ? "ALL_270_EXACT_AT_DOCUMENT_LAYER"
    : "DOCUMENT_LAYER_GAPS_DETECTED",
  contractTask: contract.task,
  publicUnitCount: contract.scope.publicUnitCount,
  approvedLayoutCountPerUnit: contract.scope.approvedLayoutCountPerUnit,
  expectedScenarioCount: contract.scope.baseScenarioCount,
  actualScenarioCount: scenarios.length,
  questionCountPerScenario: 18,
  includeAnswerKey: false,
  auditLayer: "worksheet_document_before_dom_pdf",
  classificationCounts,
  sourceSummaries,
  scenarios,
  nextTask: "GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit",
};

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  globalLayoutStatus: manifest.globalLayoutStatus,
  actualScenarioCount: manifest.actualScenarioCount,
  classificationCounts: manifest.classificationCounts,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
