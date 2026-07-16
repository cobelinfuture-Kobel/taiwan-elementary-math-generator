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

const documentAcceptanceCounts = countBy(scenarios, (scenario) => scenario.documentAcceptance);
const renderFindingCounts = {};
for (const scenario of scenarios) {
  for (const code of scenario.renderFindings ?? []) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const generatedScenarioCount = scenarios.filter((scenario) => scenario.generationOk).length;
const renderedScenarios = scenarios.filter((scenario) => scenario.renderAttempted);
const renderPassCount = renderedScenarios.filter((scenario) => scenario.renderStatus === "PASS").length;
const acceptancePassCount = scenarios.filter((scenario) => (
  scenario.documentAcceptance === "PASS" && scenario.renderStatus === "PASS"
)).length;
const totalPdfPageCount = scenarios.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfPageCount ?? 0), 0);
const totalPdfBytes = scenarios.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfBytes ?? 0), 0);
const sourceSummaries = contract.publicUnits.map((unit) => {
  const rows = scenarios.filter((scenario) => scenario.sourceId === unit.sourceId);
  return {
    sourceId: unit.sourceId,
    unitCode: unit.unitCode,
    title: unit.title,
    scenarioCount: rows.length,
    generatedScenarioCount: rows.filter((scenario) => scenario.generationOk).length,
    renderedScenarioCount: rows.filter((scenario) => scenario.renderAttempted).length,
    acceptancePassCount: rows.filter((scenario) => (
      scenario.documentAcceptance === "PASS" && scenario.renderStatus === "PASS"
    )).length,
    documentAcceptanceCounts: countBy(rows, (scenario) => scenario.documentAcceptance),
    renderFindingCounts: countBy(
      rows.flatMap((scenario) => scenario.renderFindings ?? []),
      (code) => code,
    ),
    totalPdfPageCount: rows.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfPageCount ?? 0), 0),
    rendererProfileIds: unique(rows.map((scenario) => scenario.rendererProfileId)),
    documentSchemaNames: unique(rows.map((scenario) => scenario.documentSchemaName)),
    nonPassLayouts: rows
      .filter((scenario) => scenario.documentAcceptance !== "PASS" || scenario.renderStatus !== "PASS")
      .map((scenario) => ({
        layoutId: scenario.layoutId,
        documentAcceptance: scenario.documentAcceptance,
        renderStatus: scenario.renderStatus ?? null,
        renderFindings: scenario.renderFindings ?? [],
        generationIssueCodes: scenario.generationIssueCodes ?? [],
      })),
  };
});
const allPass = (
  generatedScenarioCount === scenarios.length
  && renderedScenarios.length === scenarios.length
  && renderPassCount === scenarios.length
  && acceptancePassCount === scenarios.length
  && documentAcceptanceCounts.PASS === scenarios.length
  && Object.keys(renderFindingCounts).length === 0
  && sourceSummaries.every((source) => source.acceptancePassCount === 18)
);
const manifest = {
  schemaVersion: "glm-s06-270-postfix-html-pdf-acceptance-v1",
  task: "GLM-S06_270ScenarioPostFixAcceptance",
  status: allPass ? "PASS_ACCEPTED" : "ACCEPTANCE_FAILED",
  globalStatus: allPass ? "ALL_270_POSTFIX_HTML_PDF_PASS" : "POSTFIX_HTML_PDF_GAPS_DETECTED",
  publicUnitCount: contract.scope.publicUnitCount,
  approvedLayoutCountPerUnit: contract.scope.approvedLayoutCountPerUnit,
  scenarioCount: scenarios.length,
  shardCount: shards.length,
  generatedScenarioCount,
  renderedScenarioCount: renderedScenarios.length,
  renderPassCount,
  acceptancePassCount,
  renderDefectScenarioCount: renderedScenarios.length - renderPassCount,
  totalPdfPageCount,
  totalPdfBytes,
  documentAcceptanceCounts,
  renderFindingCounts,
  sourceSummaries,
  scenarios,
  nextTask: allPass
    ? "GLM-S07_AnswerKeyAndMaximumBoundaryStress"
    : "GLM-S06_PostFixDefectFullFix",
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
  totalPdfPageCount: manifest.totalPdfPageCount,
  documentAcceptanceCounts,
  renderFindingCounts,
  failingSources: sourceSummaries.filter((source) => source.acceptancePassCount !== 18),
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
