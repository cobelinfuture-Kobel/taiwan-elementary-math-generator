import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GLM_S06_SHARD_COUNT,
  buildGLMS06ScenarioPlan,
  readGLMS06Contract,
} from "./glm-s06-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const inputArgument = process.argv.find((item) => item.startsWith("--input="));
const inputRoot = path.resolve(inputArgument?.slice("--input=".length) ?? "/tmp/glm-s06-shards");
const outputRoot = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s06-270-postfix-html-pdf-acceptance",
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

const contract = readGLMS06Contract();
const expectedPlan = buildGLMS06ScenarioPlan();
const manifestPaths = findManifests(inputRoot);
const shards = manifestPaths.map((manifestPath) => JSON.parse(readFileSync(manifestPath, "utf8")));
if (shards.length !== GLM_S06_SHARD_COUNT) {
  throw new Error(`GLM_S06_SHARD_MANIFEST_COUNT:${shards.length}:${GLM_S06_SHARD_COUNT}`);
}
const shardIndexes = shards.map((shard) => shard.shardIndex).sort((a, b) => a - b);
if (JSON.stringify(shardIndexes) !== JSON.stringify([0, 1, 2, 3, 4])) {
  throw new Error(`GLM_S06_SHARD_INDEX_SET_INVALID:${JSON.stringify(shardIndexes)}`);
}
if (shards.some((shard) => shard.status !== "SHARD_ACCEPTED")) {
  throw new Error(`GLM_S06_SHARD_STATUS_INVALID:${JSON.stringify(shards.map((shard) => [shard.shardIndex, shard.status]))}`);
}
const scenarios = shards
  .sort((left, right) => left.shardIndex - right.shardIndex)
  .flatMap((shard) => shard.scenarios);
if (scenarios.length !== contract.scope.baseScenarioCount) {
  throw new Error(`GLM_S06_SCENARIO_COUNT:${scenarios.length}:${contract.scope.baseScenarioCount}`);
}
const uniqueScenarioIds = new Set(scenarios.map((scenario) => scenario.scenarioId));
if (uniqueScenarioIds.size !== scenarios.length) {
  throw new Error(`GLM_S06_DUPLICATE_SCENARIO_IDS:${scenarios.length - uniqueScenarioIds.size}`);
}
const expectedIds = new Set(expectedPlan.map((scenario) => scenario.scenarioId));
const missingIds = [...expectedIds].filter((scenarioId) => !uniqueScenarioIds.has(scenarioId));
const unexpectedIds = [...uniqueScenarioIds].filter((scenarioId) => !expectedIds.has(scenarioId));
if (missingIds.length > 0 || unexpectedIds.length > 0) {
  throw new Error(`GLM_S06_SCENARIO_SET_MISMATCH:${JSON.stringify({ missingIds, unexpectedIds })}`);
}

const documentClassificationCounts = countBy(scenarios, (scenario) => scenario.documentClassification);
const renderFindingCounts = {};
for (const scenario of scenarios) {
  for (const code of scenario.renderFindings ?? []) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const renderedScenarios = scenarios.filter((scenario) => scenario.renderAttempted);
const renderPassCount = scenarios.filter((scenario) => scenario.renderStatus === "PASS").length;
const acceptancePassCount = scenarios.filter((scenario) => scenario.acceptanceStatus === "PASS").length;
const sourceSummaries = contract.publicUnits.map((unit) => {
  const sourceScenarios = scenarios.filter((scenario) => scenario.sourceId === unit.sourceId);
  return {
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    title: unit.title,
    scenarioCount: sourceScenarios.length,
    generatedScenarioCount: sourceScenarios.filter((scenario) => scenario.generationOk).length,
    renderedScenarioCount: sourceScenarios.filter((scenario) => scenario.renderAttempted).length,
    acceptancePassCount: sourceScenarios.filter((scenario) => scenario.acceptanceStatus === "PASS").length,
    documentClassificationCounts: countBy(sourceScenarios, (scenario) => scenario.documentClassification),
    renderFindingCounts: countBy(
      sourceScenarios.flatMap((scenario) => scenario.renderFindings ?? []),
      (code) => code,
    ),
    rendererProfileIds: unique(sourceScenarios.map((scenario) => scenario.rendererProfileId)),
    nonPassLayouts: sourceScenarios
      .filter((scenario) => scenario.acceptanceStatus !== "PASS")
      .map((scenario) => ({
        layoutId: scenario.layoutId,
        documentClassification: scenario.documentClassification,
        renderStatus: scenario.renderStatus,
        renderFindings: scenario.renderFindings,
      })),
  };
});

const allAccepted = scenarios.length === 270
  && documentClassificationCounts.PASS === 270
  && renderedScenarios.length === 270
  && renderPassCount === 270
  && acceptancePassCount === 270
  && Object.keys(renderFindingCounts).length === 0
  && sourceSummaries.every((source) => (
    source.scenarioCount === 18
    && source.generatedScenarioCount === 18
    && source.renderedScenarioCount === 18
    && source.acceptancePassCount === 18
    && source.nonPassLayouts.length === 0
  ));

const manifest = {
  schemaVersion: "glm-s06-270-postfix-html-pdf-acceptance-v1",
  task: "GLM-S06_270ScenarioPostFixAcceptance",
  status: allAccepted ? "PASS_ACCEPTED" : "REJECTED",
  publicUnitCount: contract.scope.publicUnitCount,
  approvedLayoutCountPerUnit: contract.scope.approvedLayoutCountPerUnit,
  scenarioCount: scenarios.length,
  shardCount: shards.length,
  generatedScenarioCount: scenarios.filter((scenario) => scenario.generationOk).length,
  renderedScenarioCount: renderedScenarios.length,
  renderPassCount,
  acceptancePassCount,
  acceptanceFailureCount: scenarios.length - acceptancePassCount,
  renderDefectScenarioCount: scenarios.length - renderPassCount,
  documentClassificationCounts,
  renderFindingCounts,
  sourceSummaries,
  scenarios,
  globalStatus: allAccepted ? "ALL_270_POSTFIX_HTML_PDF_PASS" : "POSTFIX_ACCEPTANCE_GAPS_DETECTED",
  nextTask: "GLM-S07_AnswerPageAndMaximumBoundaryStress",
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
  acceptancePassCount: manifest.acceptancePassCount,
  acceptanceFailureCount: manifest.acceptanceFailureCount,
  documentClassificationCounts,
  renderFindingCounts,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));

if (!allAccepted) {
  const failures = scenarios
    .filter((scenario) => scenario.acceptanceStatus !== "PASS")
    .slice(0, 20)
    .map((scenario) => ({
      scenarioId: scenario.scenarioId,
      documentClassification: scenario.documentClassification,
      renderStatus: scenario.renderStatus,
      renderFindings: scenario.renderFindings,
    }));
  throw new Error(`GLM_S06_AGGREGATE_REJECTED:${JSON.stringify(failures)}`);
}
