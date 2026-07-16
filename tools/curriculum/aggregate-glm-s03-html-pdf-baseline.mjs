import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GLM_S03_SHARD_COUNT,
  buildGLMS03ScenarioPlan,
  readGLMS03Contract,
} from "./glm-s03-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const inputArgument = process.argv.find((item) => item.startsWith("--input="));
const inputRoot = path.resolve(inputArgument?.slice("--input=".length) ?? "/tmp/glm-s03-shards");
const outputRoot = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s03-270-html-pdf-baseline",
);
const outputPath = path.join(outputRoot, "current.json");

function findManifests(root) {
  const results = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === "manifest.json") results.push(target);
    }
  }
  visit(root);
  return results;
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const contract = readGLMS03Contract();
const expectedPlan = buildGLMS03ScenarioPlan();
const manifestPaths = findManifests(inputRoot);
const shards = manifestPaths.map((manifestPath) => JSON.parse(readFileSync(manifestPath, "utf8")));
if (shards.length !== GLM_S03_SHARD_COUNT) {
  throw new Error(`GLM_S03_SHARD_MANIFEST_COUNT:${shards.length}:${GLM_S03_SHARD_COUNT}`);
}
const shardIndexes = shards.map((shard) => shard.shardIndex).sort((a, b) => a - b);
if (JSON.stringify(shardIndexes) !== JSON.stringify([0, 1, 2, 3, 4])) {
  throw new Error(`GLM_S03_SHARD_INDEX_SET_INVALID:${JSON.stringify(shardIndexes)}`);
}
const scenarios = shards
  .sort((left, right) => left.shardIndex - right.shardIndex)
  .flatMap((shard) => shard.scenarios);
if (scenarios.length !== contract.scope.baseScenarioCount) {
  throw new Error(`GLM_S03_SCENARIO_COUNT:${scenarios.length}:${contract.scope.baseScenarioCount}`);
}
const uniqueScenarioIds = new Set(scenarios.map((scenario) => scenario.scenarioId));
if (uniqueScenarioIds.size !== scenarios.length) {
  throw new Error(`GLM_S03_DUPLICATE_SCENARIO_IDS:${scenarios.length - uniqueScenarioIds.size}`);
}
const expectedIds = new Set(expectedPlan.map((scenario) => scenario.scenarioId));
const missingIds = [...expectedIds].filter((scenarioId) => !uniqueScenarioIds.has(scenarioId));
const unexpectedIds = [...uniqueScenarioIds].filter((scenarioId) => !expectedIds.has(scenarioId));
if (missingIds.length > 0 || unexpectedIds.length > 0) {
  throw new Error(`GLM_S03_SCENARIO_SET_MISMATCH:${JSON.stringify({ missingIds, unexpectedIds })}`);
}

const documentClassificationCounts = countBy(scenarios, (scenario) => scenario.documentClassification);
const renderFindingCounts = {};
for (const scenario of scenarios) {
  for (const code of scenario.renderFindings ?? []) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const renderedScenarios = scenarios.filter((scenario) => scenario.renderAttempted);
const renderPassCount = renderedScenarios.filter((scenario) => scenario.renderStatus === "PASS").length;
const sourceSummaries = contract.publicUnits.map((unit) => {
  const sourceScenarios = scenarios.filter((scenario) => scenario.sourceId === unit.sourceId);
  return {
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    title: unit.title,
    scenarioCount: sourceScenarios.length,
    generatedScenarioCount: sourceScenarios.filter((scenario) => scenario.generationOk).length,
    renderedScenarioCount: sourceScenarios.filter((scenario) => scenario.renderAttempted).length,
    documentClassificationCounts: countBy(sourceScenarios, (scenario) => scenario.documentClassification),
    renderFindingCounts: countBy(
      sourceScenarios.flatMap((scenario) => scenario.renderFindings ?? []),
      (code) => code,
    ),
    renderPassCount: sourceScenarios.filter((scenario) => scenario.renderStatus === "PASS").length,
    rendererProfileIds: unique(sourceScenarios.map((scenario) => scenario.rendererProfileId)),
    nonPassLayouts: sourceScenarios
      .filter((scenario) => scenario.documentClassification !== "PASS" || scenario.renderStatus === "DEFECTS_DETECTED")
      .map((scenario) => ({
        layoutId: scenario.layoutId,
        documentClassification: scenario.documentClassification,
        renderFindings: scenario.renderFindings,
      })),
  };
});

const manifest = {
  schemaVersion: "glm-s03-270-html-pdf-baseline-v1",
  task: "GLM-S03_270ScenarioHTMLPDFBaseline",
  status: "BASELINE_CAPTURED",
  publicUnitCount: contract.scope.publicUnitCount,
  approvedLayoutCountPerUnit: contract.scope.approvedLayoutCountPerUnit,
  scenarioCount: scenarios.length,
  shardCount: shards.length,
  generatedScenarioCount: scenarios.filter((scenario) => scenario.generationOk).length,
  renderedScenarioCount: renderedScenarios.length,
  renderPassCount,
  renderDefectScenarioCount: renderedScenarios.length - renderPassCount,
  documentClassificationCounts,
  renderFindingCounts,
  sourceSummaries,
  scenarios,
  globalStatus: (
    documentClassificationCounts.PASS === scenarios.length
    && renderPassCount === scenarios.length
  ) ? "ALL_270_HTML_PDF_PASS" : "HTML_PDF_AND_DOCUMENT_GAPS_DETECTED",
  nextTask: "GLM-S04_GlobalLayoutArchitectureDesign",
};
mkdirSync(outputRoot, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  globalStatus: manifest.globalStatus,
  scenarioCount: manifest.scenarioCount,
  generatedScenarioCount: manifest.generatedScenarioCount,
  renderedScenarioCount: manifest.renderedScenarioCount,
  renderPassCount: manifest.renderPassCount,
  renderDefectScenarioCount: manifest.renderDefectScenarioCount,
  documentClassificationCounts,
  renderFindingCounts,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
